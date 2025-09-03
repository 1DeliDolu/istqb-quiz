const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const {
  query,
  testConnection,
  initializeDatabase,
} = require("./database/connection");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Server başlatılırken veritabanı bağlantısını test et
async function startServer() {
  try {
    // Veritabanı bağlantısını test et
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("❌ Veritabanı bağlantısı kurulamadı");
      process.exit(1);
    }

    // Veritabanı şemasını yükle
    await initializeDatabase();

    // Server'ı başlat
    app.listen(PORT, () => {
      console.log(`🚀 ISTQB Quiz Server çalışıyor: http://localhost:${PORT}`);
      console.log(`📊 MySQL veritabanı: ${process.env.DB_NAME}`);
    });
  } catch (error) {
    console.error("Server başlatma hatası:", error);
    process.exit(1);
  }
}

// Health check
app.get("/api/health", async (req, res) => {
  try {
    // Veritabanı bağlantısını test et
    await query("SELECT 1");
    res.json({
      status: "OK",
      message: "ISTQB Quiz Server MySQL ile çalışıyor",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Veritabanı bağlantı hatası",
      database: "disconnected",
    });
  }
});

// Bir bölümün sorularını getir
app.get("/api/questions/:chapter", async (req, res) => {
  try {
    const { chapter } = req.params;

    const sql = `
            SELECT 
                q.id,
                q.question,
                q.explanation,
                q.sub_chapter_id,
                sc.title as subChapter,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'text', qo.option_text,
                        'isCorrect', qo.is_correct
                    )
                    ORDER BY qo.option_order
                ) as options
            FROM questions q
            LEFT JOIN sub_chapters sc ON q.sub_chapter_id = sc.id
            LEFT JOIN question_options qo ON q.id = qo.question_id
            WHERE q.chapter_id = ?
            GROUP BY q.id
            ORDER BY q.created_at ASC
        `;

    const questions = await query(sql, [chapter]);

    // Sonuçları frontend formatına dönüştür
    const formattedQuestions = questions.map((q) => {
      const options = q.options ? JSON.parse(`[${q.options}]`) : [];
      const correctOption = options.find((opt) => opt.isCorrect);

      return {
        id: q.id,
        question: q.question,
        options: options.map((opt) => opt.text),
        correctAnswer: correctOption ? correctOption.text : "",
        explanation: q.explanation || "",
        subChapter: q.subChapter || "",
      };
    });

    console.log(
      `📚 ${chapter} bölümü için ${formattedQuestions.length} soru MySQL'den yüklendi`
    );
    res.json(formattedQuestions);
  } catch (error) {
    console.error("Sorular yüklenirken hata:", error);
    res.status(500).json({ error: "Sorular yüklenemedi" });
  }
});

// Yeni soru ekle
app.post("/api/questions/:chapter", async (req, res) => {
  try {
    const { chapter } = req.params;
    const { question, options, correctAnswer, explanation, subChapter } =
      req.body;

    // Sub-chapter ID'sini bul
    let subChapterId = null;
    if (subChapter) {
      const subChapterResult = await query(
        "SELECT id FROM sub_chapters WHERE title = ? AND chapter_id = ?",
        [subChapter, chapter]
      );
      if (subChapterResult.length > 0) {
        subChapterId = subChapterResult[0].id;
      }
    }

    // Soruyu ekle
    const questionResult = await query(
      "INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation) VALUES (?, ?, ?, ?)",
      [chapter, subChapterId, question, explanation || ""]
    );

    const questionId = questionResult.insertId;

    // Seçenekleri ekle
    for (let i = 0; i < options.length; i++) {
      const isCorrect = options[i] === correctAnswer;
      await query(
        "INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)",
        [questionId, options[i], isCorrect, i]
      );
    }

    // Toplam soru sayısını al
    const countResult = await query(
      "SELECT COUNT(*) as count FROM questions WHERE chapter_id = ?",
      [chapter]
    );
    const questionCount = countResult[0].count;

    console.log(
      `✅ ${chapter} bölümüne soru eklendi: "${question.substring(0, 50)}..."`
    );
    res.json({
      success: true,
      message: "Soru başarıyla eklendi",
      questionCount: questionCount,
    });
  } catch (error) {
    console.error("Soru eklenirken hata:", error);
    res.status(500).json({ error: "Soru eklenemedi" });
  }
});

// Tüm bölümleri listele
app.get("/api/chapters", async (req, res) => {
  try {
    const sql = `
            SELECT 
                c.id,
                c.title,
                COUNT(q.id) as questionCount
            FROM chapters c
            LEFT JOIN questions q ON c.id = q.chapter_id
            GROUP BY c.id, c.title
            ORDER BY c.id
        `;

    const chapters = await query(sql);

    const formattedChapters = chapters.map((ch) => ({
      id: ch.id,
      questionCount: parseInt(ch.questionCount),
      source: "MySQL",
    }));

    res.json(formattedChapters);
  } catch (error) {
    console.error("Bölümler listelenirken hata:", error);
    res.status(500).json({ error: "Bölümler listelenemedi" });
  }
});

// Bir bölümün tüm sorularını sil
app.delete("/api/questions/:chapter", async (req, res) => {
  try {
    const { chapter } = req.params;

    // İlk önce question_options'ı sil (foreign key constraint)
    await query(
      `
            DELETE qo FROM question_options qo
            INNER JOIN questions q ON qo.question_id = q.id
            WHERE q.chapter_id = ?
        `,
      [chapter]
    );

    // Sonra questions'ı sil
    const result = await query("DELETE FROM questions WHERE chapter_id = ?", [
      chapter,
    ]);

    console.log(
      `🗑️ ${chapter} bölümündeki ${result.affectedRows} soru silindi`
    );
    res.json({
      success: true,
      message: `${result.affectedRows} soru silindi`,
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Sorular silinirken hata:", error);
    res.status(500).json({ error: "Sorular silinemedi" });
  }
});

// Server'ı başlat
startServer();

module.exports = app;
