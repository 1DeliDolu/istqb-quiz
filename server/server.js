const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Import DB module as an object to allow runtime mocking in tests
const db = require("./database/connection");

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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

// Veritabanı bağlantısını test et
async function testConnection() {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL veritabanı bağlantısı başarılı");
    return true;
  } catch (error) {
    console.error("❌ MySQL bağlantı hatası:", error.message);
    return false;
  }
}

// Veritabanı şemasını initialize et
async function initializeDatabase() {
  try {
    console.log("🔧 Veritabanı şeması kontrol ediliyor...");
    // Bu fonksiyon şimdilik boş - gerekirse schema kontrolü eklenebilir
    return true;
  } catch (error) {
    console.error("❌ Veritabanı initialization hatası:", error);
    return false;
  }
}

// Health check
app.get("/api/health", async (req, res) => {
  try {
    // Veritabanı bağlantısını test et
    await db.query("SELECT 1");
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

// Yardımcı: chapter ID'yi normalize et (frontend '1' gönderirse DB'deki 'istqb_1' ile eşle)
function normalizeChapterId(raw) {
  if (!raw) return raw;
  if (raw.startsWith("udemy_") || raw.startsWith("fragen_") || raw.startsWith("istqb_")) {
    return raw;
  }
  // Salt sayısal ise ISTQB olarak kabul et
  if (/^\d+$/.test(raw)) {
    return `istqb_${raw}`;
  }
  return raw;
}

// Yardımcı: subChapter ID'yi normalize et
// - ISTQB için frontend genelde '5-2' ya da '5-2-3' yollar; DB'de 'istqb_5_5-2' formatı kullanılıyor
// - Eğer zaten 'istqb_', 'udemy_', 'fragen_' ile başlıyorsa olduğu gibi bırak
function normalizeSubChapterId(chapterId, sub) {
  if (!sub) return null;
  if (typeof sub !== 'string') return sub;
  if (sub.startsWith('istqb_') || sub.startsWith('udemy_') || sub.startsWith('fragen_')) {
    return sub;
  }
  // Sadece ISTQB chapter'ları için dönüştürme yap
  if (chapterId && chapterId.startsWith('istqb_')) {
    // '5-2' veya '5-2-3' gibi desenleri kabul et
    if (/^\d+(?:-\d+){1,3}$/.test(sub)) {
      return `${chapterId}_${sub}`;
    }
  }
  return sub;
}

// Bir bölümün sorularını getir
app.get("/api/questions/:chapter", async (req, res) => {
  try {
    const rawChapter = req.params.chapter;
    const chapter = normalizeChapterId(rawChapter);
    const { subChapter } = req.query;

    let sql = `
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
            WHERE q.chapter_id = ?`;

    const params = [chapter];

    // SubChapter filtresi ekle - daha esnek eşleştirme
    if (subChapter) {
      console.log(`🔍 Alt bölüm filtresi uygulanıyor: "${subChapter}"`);

      // Prefix eşleştirmesi (3.1.1 -> 3-1-1 formatına dönüştür)
      const chapterPrefix = subChapter.match(/^(\d+\.\d+(\.\d+)?)/);
      if (chapterPrefix) {
        const normalizedPrefix = chapterPrefix[1].replace(/\./g, "-");
        // Bazı başlıklarda sayısal kısımdan sonra nokta bulunuyor (örn: "5.2. Risikomanagement").
        // Hem noktalı hem noktasız varyantlara göre ara.
        const dottedVariant = subChapter.replace(chapterPrefix[1], `${chapterPrefix[1]}.`);
        // sc.id eşleştirmesinde, hem yalın prefix ("5-2") hem de chapter ile birlikte olan ("istqb_5_5-2") formatını dene.
        const idPrefixWithChapter = `${chapter}_${normalizedPrefix}`;

        sql += ` AND (
          sc.title = ?
          OR sc.title LIKE ?
          OR sc.title LIKE ?
          OR sc.id = ?
          OR sc.id LIKE ?
          OR sc.id LIKE ?
        )`;
        params.push(
          subChapter,                   // sc.title = ?
          `%${subChapter}%`,            // sc.title LIKE ? (orijinal)
          `%${dottedVariant}%`,         // sc.title LIKE ? (noktali varyant)
          normalizedPrefix,             // sc.id = ? (yalın)
          `${normalizedPrefix}%`,       // sc.id LIKE ? (yalın prefix)
          `${idPrefixWithChapter}%`     // sc.id LIKE ? (chapter ile)
        );
        console.log(`🔍 Normalized prefix için arama: "${normalizedPrefix}", idPrefixWithChapter: "${idPrefixWithChapter}"`);
      } else {
        // Normal eşleştirme
        sql += ` AND (sc.title = ? OR sc.title LIKE ?)`;
        params.push(subChapter, `%${subChapter}%`);
      }
    }

    sql += ` GROUP BY q.id ORDER BY q.created_at ASC`;

    const questions = await db.query(sql, params);

    // Sonuçları frontend formatına dönüştür ve boş soruları filtrele
    const formattedQuestions = questions
      .filter((q) => q.question && q.question.trim() !== "") // Boş soruları filtrele
      .map((q) => {
        let options = [];
        let correctOption = null;

        try {
          if (q.options && q.options.trim()) {
            options = JSON.parse(`[${q.options}]`);
            correctOption = options.find((opt) => opt.isCorrect);
          }
        } catch (error) {
          console.error(
            `❌ JSON parse hatası soru ${q.id} için:`,
            error.message
          );
          console.error(`Problematik options verisi:`, q.options);
          options = [];
        }

        return {
          id: q.id,
          question: q.question,
          options: options.map((opt) => opt.text || opt),
          correctAnswer: correctOption
            ? correctOption.text || correctOption
            : "",
          explanation: q.explanation || "",
          subChapter: q.subChapter || "",
        };
      });

    console.log(
      `📚 ${chapter} bölümü${subChapter ? ` (${subChapter})` : ""} için ${
        formattedQuestions.length
      } soru MySQL'den yüklendi`
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
    const rawChapter = req.params.chapter;
    const chapter = normalizeChapterId(rawChapter);
    const { question, options, correctAnswer, explanation, subChapter } =
      req.body;

    // Sub-chapter ID'sini bul
    let subChapterId = null;
    if (subChapter) {
      console.log(
        `🔍 Alt bölüm araniyor: "${subChapter}" (Chapter: ${chapter})`
      );

      // Önce tam eşleşme dene
      let subChapterResult = await db.query(
        "SELECT id, title FROM sub_chapters WHERE title = ? AND chapter_id = ?",
        [subChapter, chapter]
      );

      // Eğer tam eşleşme yoksa, başlangıca göre ara (3.1, 3.1.1 vb.)
      if (subChapterResult.length === 0) {
        const chapterPrefix = subChapter.match(/^(\d+\.\d+(\.\d+)?)/);
        if (chapterPrefix) {
          console.log(`🔍 Prefix ile arama: "${chapterPrefix[1]}"`);
          subChapterResult = await db.query(
            "SELECT id, title FROM sub_chapters WHERE title LIKE ? AND chapter_id = ?",
            [`${chapterPrefix[1]}%`, chapter]
          );
        }
      }

      console.log(`📋 Bulunan alt bölümler:`, subChapterResult);

      if (subChapterResult.length > 0) {
        subChapterId = subChapterResult[0].id;
        console.log(
          `✅ Alt bölüm bulundu: ${subChapterId} - ${subChapterResult[0].title}`
        );
      } else {
        console.log(`❌ Alt bölüm bulunamadi: "${subChapter}"`);

        // Tüm mevcut alt bölümleri listele debug için
        const allSubChapters = await db.query(
          "SELECT id, title FROM sub_chapters WHERE chapter_id = ?",
          [chapter]
        );
        console.log(
          `📝 ${chapter} bölümündeki tüm alt bölümler:`,
          allSubChapters
        );
      }
    }

    // Soruyu ekle
    const questionResult = await db.query(
      "INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation) VALUES (?, ?, ?, ?)",
      [chapter, subChapterId, question, explanation || ""]
    );

    const questionId = questionResult.insertId;

    // Seçenekleri ekle
    for (let i = 0; i < options.length; i++) {
      const isCorrect = options[i] === correctAnswer;
      await db.query(
        "INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)",
        [questionId, options[i], isCorrect, i]
      );
    }

    // Toplam soru sayısını al
    const countResult = await db.query(
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

    const chapters = await db.query(sql);

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
    const rawChapter = req.params.chapter;
    const chapter = normalizeChapterId(rawChapter);

    // İlk önce question_options'ı sil (foreign key constraint)
    await db.query(
      `
            DELETE qo FROM question_options qo
            INNER JOIN questions q ON qo.question_id = q.id
            WHERE q.chapter_id = ?
        `,
      [chapter]
    );

    // Sonra questions'ı sil
    const result = await db.query(
      "DELETE FROM questions WHERE chapter_id = ?",
      [chapter]
    );

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

// Bir soruyu güncelle
app.put("/api/questions/:id", async (req, res) => {
  try {
    const questionId = req.params.id;
    const { question, options, correctAnswer, explanation } = req.body;

    if (
      !question ||
      !options ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      !correctAnswer
    ) {
      return res.status(400).json({ error: "Eksik veya hatalı veri" });
    }

    // Önce soruyu güncelle (sadece question ve explanation)
    await db.query(
      `UPDATE questions 
       SET question = ?, explanation = ?
       WHERE id = ?`,
      [question, explanation || null, questionId]
    );

    // Mevcut seçenekleri sil
    await db.query("DELETE FROM question_options WHERE question_id = ?", [
      questionId,
    ]);

    // Yeni seçenekleri ekle
    for (let i = 0; i < options.length; i++) {
      const isCorrect = options[i] === correctAnswer;
      await db.query(
        "INSERT INTO question_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)",
        [questionId, options[i], i + 1, isCorrect]
      );
    }

    console.log(`✏️ Soru güncellendi: ${questionId}`);
    res.json({
      success: true,
      message: "Soru başarıyla güncellendi",
      questionId: questionId,
    });
  } catch (error) {
    console.error("Soru güncellenirken hata:", error);
    res.status(500).json({ error: "Soru güncellenemedi" });
  }
});

// JWT Secret - production'da environment variable kullanın
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

// Middleware - Authentication kontrolü
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// AUTH ENDPOINTS
// Kullanıcı kayıt
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validasyon
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await db.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Şifreyi hash'le
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Kullanıcıyı oluştur
    const result = await db.query(
      "INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, firstName || null, lastName || null]
    );

    const userId = result.insertId;

    // JWT token oluştur
    const token = jwt.sign({ id: userId, username: username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Kullanıcı bilgilerini döndür (şifre olmadan)
    const user = {
      id: userId,
      username: username,
      email: email,
      firstName: firstName || null,
      lastName: lastName || null,
    };

    console.log(`👤 Yeni kullanıcı kaydedildi: ${username} (ID: ${userId})`);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: user,
      token: token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Kullanıcı giriş
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Kullanıcıyı bul
    const users = await db.query(
      "SELECT id, username, email, password_hash, first_name, last_name FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = users[0];

    // Şifreyi doğrula
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Kullanıcı bilgilerini döndür (şifre olmadan)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    console.log(`🔑 Kullanıcı giriş yaptı: ${user.username} (ID: ${user.id})`);

    res.json({
      success: true,
      message: "Login successful",
      user: userData,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Kullanıcı profil bilgilerini getir
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const users = await db.query(
      "SELECT id, username, email, first_name, last_name, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ========== USER STATISTICS ENDPOINTS ==========

// Kullanıcının cevap verdiği soruyu kaydet
app.post("/api/user-stats/answer", async (req, res) => {
  try {
    const {
      userId,
      questionId,
      chapterId,
      subChapterId,
      selectedAnswer,
      isCorrect,
    } = req.body;

    if (
      !userId ||
      !questionId ||
      !chapterId ||
      selectedAnswer === undefined ||
      isCorrect === undefined
    ) {
      return res.status(400).json({ error: "Eksik parametreler" });
    }

    // Önceki attempt sayısını kontrol et
    const previousAttempts = await db.query(
      "SELECT COUNT(*) as count FROM user_question_attempts WHERE user_id = ? AND question_id = ?",
      [userId, questionId]
    );

    const attemptNumber = previousAttempts[0].count + 1;

    // Chapter ID normalize et (ör. '1' -> 'istqb_1')
    const normalizedChapterId = normalizeChapterId(chapterId);

    // Sub-chapter ID'yi normalize et ve doğrula
    let dbSubChapterId = normalizeSubChapterId(
      normalizedChapterId,
      subChapterId
    );
    console.log(
      `Mapping subChapterId: ${subChapterId} for chapterId: ${normalizedChapterId}`
    );
    try {
      if (dbSubChapterId) {
        const match = await db.query(
          "SELECT 1 FROM sub_chapters WHERE id = ? LIMIT 1",
          [dbSubChapterId]
        );
        if (match.length === 0) {
          dbSubChapterId = null;
        }
      }
    } catch (e) {
      dbSubChapterId = null;
    }

    console.log(`Final dbSubChapterId: ${dbSubChapterId}`);

    // Cevabı kaydet
    await db.query(
      `INSERT INTO user_question_attempts 
       (user_id, question_id, chapter_id, sub_chapter_id, selected_answer, is_correct, attempt_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        questionId,
        normalizedChapterId,
        dbSubChapterId,
        selectedAnswer,
        isCorrect,
        attemptNumber,
      ]
    );

    console.log(
      `📊 User ${userId} answered question ${questionId}: ${
        isCorrect ? "Correct" : "Wrong"
      }`
    );
    res.json({ success: true, message: "Cevap kaydedildi" });
  } catch (error) {
    console.error("Answer recording error:", error);
    res.status(500).json({ error: "Cevap kaydedilemedi" });
  }
});

// Kullanıcının genel istatistiklerini getir
app.get("/api/user-stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Bölüm bazında istatistikler
    const chapterStats = await db.query(
      `
      SELECT 
        ua.chapter_id,
        c.title as chapter_title,
        ua.sub_chapter_id,
        sc.title as sub_chapter_title,
        COUNT(*) as total_questions,
        SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        SUM(CASE WHEN ua.is_correct = 0 THEN 1 ELSE 0 END) as wrong_answers,
        ROUND((SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as success_rate,
        MAX(ua.answered_at) as last_attempt
      FROM user_question_attempts ua
      LEFT JOIN chapters c ON ua.chapter_id = c.id
      LEFT JOIN sub_chapters sc ON ua.sub_chapter_id = sc.id
      WHERE ua.user_id = ?
      GROUP BY ua.chapter_id, ua.sub_chapter_id
      ORDER BY ua.chapter_id, ua.sub_chapter_id
    `,
      [userId]
    );

    // Toplam istatistikler
    const totalStats = await db.query(
      `
      SELECT 
        COUNT(DISTINCT ua.chapter_id) as chapters_attempted,
        COUNT(DISTINCT ua.sub_chapter_id) as sub_chapters_attempted,
        COUNT(*) as total_questions_answered,
        SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as total_correct,
        SUM(CASE WHEN ua.is_correct = 0 THEN 1 ELSE 0 END) as total_wrong,
        ROUND((SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as overall_success_rate
      FROM user_question_attempts ua
      WHERE ua.user_id = ?
    `,
      [userId]
    );

    res.json({
      success: true,
      data: {
        totalStats: totalStats[0],
        chapterStats: chapterStats,
      },
    });
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({ error: "İstatistikler getirilemedi" });
  }
});

// Kullanıcının yanlış cevapladığı soruları getir
app.get(
  "/api/user-stats/:userId/wrong-answers/:chapterId",
  async (req, res) => {
    try {
      const { userId, chapterId } = req.params;
      const { subChapterId } = req.query;

      let sql = `
      SELECT DISTINCT
        q.id,
        q.question,
        q.explanation,
        q.sub_chapter_id,
        sc.title as sub_chapter_title,
        ua.selected_answer,
        ua.answered_at,
        GROUP_CONCAT(
          JSON_OBJECT(
            'text', qo.option_text,
            'isCorrect', qo.is_correct
          )
          ORDER BY qo.option_order
        ) as options
      FROM user_question_attempts ua
      JOIN questions q ON ua.question_id = q.id
      LEFT JOIN sub_chapters sc ON q.sub_chapter_id = sc.id
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE ua.user_id = ? AND ua.chapter_id = ? AND ua.is_correct = 0
    `;

      const params = [userId, chapterId];

      if (subChapterId) {
        sql += ` AND ua.sub_chapter_id = ?`;
        params.push(subChapterId);
      }

      sql += ` GROUP BY q.id, ua.selected_answer, ua.answered_at ORDER BY ua.answered_at DESC`;

      const wrongQuestions = await db.query(sql, params);

      // Options formatını düzelt
      const formattedQuestions = wrongQuestions.map((q) => {
        let options = [];
        let correctOption = null;

        try {
          if (q.options) {
            options = JSON.parse(`[${q.options}]`);
            correctOption = options.find((opt) => opt.isCorrect);
          }
        } catch (error) {
          console.error(`JSON parse error for question ${q.id}:`, error);
          options = [];
        }

        return {
          id: q.id,
          question: q.question,
          options: options.map((opt) => opt.text || opt),
          correctAnswer: correctOption ? correctOption.text : "",
          explanation: q.explanation || "",
          subChapter: q.sub_chapter_title || "",
          userAnswer: q.selected_answer,
          answeredAt: q.answered_at,
        };
      });

      res.json({
        success: true,
        data: formattedQuestions,
      });
    } catch (error) {
      console.error("Wrong answers fetch error:", error);
      res.status(500).json({ error: "Yanlış cevaplar getirilemedi" });
    }
  }
);

// ========== QUIZ PROGRESS ENDPOINTS ==========

// Save quiz progress
app.post("/api/quiz-progress", async (req, res) => {
  try {
    const {
      userId,
      quizType,
      chapter,
      subChapter,
      currentQuestionIndex,
      totalQuestions,
      score,
      answers,
      completedAt,
    } = req.body;

    // undefined değerleri null'a çevir ve ISO date'i MySQL formatına çevir
    const safeSubChapter = subChapter === undefined ? null : subChapter;
    const safeCompletedAt =
      completedAt === undefined
        ? null
        : completedAt
        ? new Date(completedAt).toISOString().slice(0, 19).replace("T", " ")
        : null;

    if (
      !userId ||
      !quizType ||
      !chapter ||
      currentQuestionIndex === undefined ||
      !totalQuestions ||
      score === undefined
    ) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Chapter ve subChapter normalize
    const normalizedChapter = normalizeChapterId(chapter);
    const normalizedSubChapter = normalizeSubChapterId(normalizedChapter, safeSubChapter);

    // Check if progress already exists
    let sql = `
      SELECT id FROM quiz_progress 
      WHERE user_id = ? AND quiz_type = ? AND chapter_id = ?
    `;
    let params = [userId, quizType, normalizedChapter];

    if (safeSubChapter) {
      // Hem normalize edilmiş hem ham değere göre kontrol et (geriye dönük uyumluluk)
      sql += ` AND (sub_chapter_id = ? OR sub_chapter_id = ?)`;
      params.push(normalizedSubChapter || safeSubChapter, safeSubChapter);
    } else {
      sql += ` AND sub_chapter_id IS NULL`;
    }

    const existing = await db.query(sql, params);

    if (existing.length > 0) {
      // Update existing progress
      sql = `
        UPDATE quiz_progress 
        SET current_question_index = ?, total_questions = ?, score = ?, answers = ?, completed_at = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await db.query(sql, [
        currentQuestionIndex,
        totalQuestions,
        score,
        answers,
        safeCompletedAt,
        existing[0].id,
      ]);
    } else {
      // Insert new progress
      sql = `
        INSERT INTO quiz_progress 
        (user_id, quiz_type, chapter_id, sub_chapter_id, current_question_index, total_questions, score, answers, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.query(sql, [
        userId,
        quizType,
        normalizedChapter,
        normalizedSubChapter,
        currentQuestionIndex,
        totalQuestions,
        score,
        answers,
        safeCompletedAt,
      ]);
    }

    res.json({ success: true, message: "Quiz progress saved successfully" });
  } catch (error) {
    console.error("Quiz progress save error:", error);
    res.status(500).json({ error: "Failed to save quiz progress" });
  }
});

// Load quiz progress
app.get("/api/quiz-progress/:userId/:quizType/:chapter", async (req, res) => {
  try {
    const { userId, quizType } = req.params;
    const chapter = normalizeChapterId(req.params.chapter);
    const { subChapter } = req.query;

    let sql = `
      SELECT * FROM quiz_progress 
      WHERE user_id = ? AND quiz_type = ? AND chapter_id = ?
    `;
    let params = [userId, quizType, chapter];

    if (subChapter) {
      const normalizedSub = normalizeSubChapterId(chapter, subChapter);
      // Hem normalize edilmiş hem ham değere göre ara
      sql += ` AND (sub_chapter_id = ? OR sub_chapter_id = ?)`;
      params.push(normalizedSub || subChapter, subChapter);
    } else {
      sql += ` AND sub_chapter_id IS NULL`;
    }

    sql += ` ORDER BY updated_at DESC LIMIT 1`;

    const results = await db.query(sql, params);

    if (results.length > 0) {
      const progress = results[0];
      res.json({
        currentQuestionIndex: progress.current_question_index,
        totalQuestions: progress.total_questions,
        score: progress.score,
        answers: progress.answers || "{}",
        completedAt: progress.completed_at,
        userId: progress.user_id,
        quizType: progress.quiz_type,
        chapter: progress.chapter_id,
        subChapter: progress.sub_chapter_id,
      });
    } else {
      res.status(404).json({ error: "No quiz progress found" });
    }
  } catch (error) {
    console.error("Quiz progress load error:", error);
    res.status(500).json({ error: "Failed to load quiz progress" });
  }
});

// Mark quiz as completed
app.put("/api/quiz-progress/complete", async (req, res) => {
  try {
    const { userId, quizType, chapter, subChapter, completedAt, finalScore } =
      req.body;

    // Convert ISO date to MySQL DATETIME format
    const mysqlDate = completedAt
      ? new Date(completedAt).toISOString().slice(0, 19).replace("T", " ")
      : null;

    let sql = `
      UPDATE quiz_progress 
      SET completed_at = ?, score = ?, updated_at = NOW()
      WHERE user_id = ? AND quiz_type = ? AND chapter_id = ?
    `;
    let params = [mysqlDate, finalScore, userId, quizType, normalizeChapterId(chapter)];

    if (subChapter) {
      const normalizedSub = normalizeSubChapterId(chapter, subChapter);
      sql += ` AND (sub_chapter_id = ? OR sub_chapter_id = ?)`;
      params.push(normalizedSub || subChapter, subChapter);
    } else {
      sql += ` AND sub_chapter_id IS NULL`;
    }

    const result = await db.query(sql, params);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Quiz marked as completed" });
    } else {
      res.status(404).json({ error: "Quiz progress not found" });
    }
  } catch (error) {
    console.error("Quiz completion error:", error);
    res.status(500).json({ error: "Failed to mark quiz as completed" });
  }
});

// Clear quiz progress (for reset)
app.delete(
  "/api/quiz-progress/:userId/:quizType/:chapter",
  async (req, res) => {
    try {
      const { userId, quizType } = req.params;
      const chapter = normalizeChapterId(req.params.chapter);
      const { subChapter } = req.query;

      let sql = `
      DELETE FROM quiz_progress 
      WHERE user_id = ? AND quiz_type = ? AND chapter_id = ?
    `;
      let params = [userId, quizType, chapter];

      if (subChapter) {
        sql += ` AND sub_chapter_id = ?`;
        params.push(subChapter);
      } else {
        sql += ` AND sub_chapter_id IS NULL`;
      }

      await db.query(sql, params);
      res.json({ success: true, message: "Quiz progress cleared" });
    } catch (error) {
      console.error("Quiz progress clear error:", error);
      res.status(500).json({ error: "Failed to clear quiz progress" });
    }
  }
);

// Server'ı başlat (sadece direkt çalıştırıldığında)
if (require.main === module) {
  startServer();
}

module.exports = app;
