const mysql = require("mysql2/promise");
const fs = require("fs");

async function simpleImport() {
  console.log("🚀 Basit import başlıyor...");

  try {
    // JSON'u oku
    const data = JSON.parse(
      fs.readFileSync("../json/Bölüm_3/questions_3_2_5_clean.json", "utf8")
    );
    console.log(`📖 JSON okundu: ${data.questions.length} soru`);

    // MySQL bağlan
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Eski soruları sil
    console.log("🗑️ Eski sorular siliniyor...");
    await db.execute(
      "DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE chapter_id = ? AND sub_chapter_id = ?)",
      ["3", "3-2-5"]
    );
    await db.execute(
      "DELETE FROM questions WHERE chapter_id = ? AND sub_chapter_id = ?",
      ["3", "3-2-5"]
    );

    // Alt bölümü ekle/güncelle
    await db.execute(
      "INSERT INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?) AS new_values ON DUPLICATE KEY UPDATE title = new_values.title",
      ["3-2-5", "3", data.subChapterTitle]
    );

    // Soruları ekle
    let soruSayisi = 0;
    for (const soru of data.questions) {
      // Undefined değerlerini kontrol et
      const question = soru.question || "";
      const explanation = soru.explanation || "";

      // Soru ekle
      const [result] = await db.execute(
        "INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation) VALUES (?, ?, ?, ?)",
        ["3", "3-2-5", question, explanation]
      );

      const questionId = result.insertId;

      // Seçenekleri ekle
      if (soru.options && Array.isArray(soru.options)) {
        for (let i = 0; i < soru.options.length; i++) {
          const secenek = soru.options[i];
          const optionText = secenek.text || "";
          const isCorrect = secenek.correct || false;

          await db.execute(
            "INSERT INTO question_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)",
            [questionId, optionText, i + 1, isCorrect]
          );
        }
      }

      soruSayisi++;
      console.log(`  ✓ Soru ${soruSayisi} eklendi (ID: ${questionId})`);
    }

    // Kontrol
    const [kontrol] = await db.execute(
      "SELECT COUNT(*) as toplam FROM questions WHERE chapter_id = ? AND sub_chapter_id = ?",
      ["3", "3-2-5"]
    );
    console.log(`\\n🎉 BAŞARILI! Toplam ${kontrol[0].toplam} soru eklendi.`);

    await db.end();
  } catch (error) {
    console.error("❌ HATA:", error.message);
    console.error(error.stack);
  }
}

simpleImport();
