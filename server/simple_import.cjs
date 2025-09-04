const mysql = require("mysql2/promise");
const fs = require("fs");

async function simpleImport() {
  console.log("🚀 Basit import başlıyor...");

  try {
    // JSON'u oku
    const data = JSON.parse(
      fs.readFileSync("../questions_2_1_1_clean.json", "utf8")
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
      ["2", "2-1-1"]
    );
    await db.execute(
      "DELETE FROM questions WHERE chapter_id = ? AND sub_chapter_id = ?",
      ["2", "2-1-1"]
    );

    // Alt bölümü ekle/güncelle
    await db.execute(
      "INSERT INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)",
      ["2-1-1", "2", data.subChapterTitle]
    );

    // Soruları ekle
    let soruSayisi = 0;
    for (const soru of data.questions) {
      // Soru ekle
      const [result] = await db.execute(
        "INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation) VALUES (?, ?, ?, ?)",
        ["2", "2-1-1", soru.question, soru.explanation]
      );

      const questionId = result.insertId;

      // Seçenekleri ekle
      for (let i = 0; i < soru.options.length; i++) {
        const secenek = soru.options[i];
        await db.execute(
          "INSERT INTO question_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)",
          [questionId, secenek.text, i + 1, secenek.correct]
        );
      }

      soruSayisi++;
      console.log(`  ✓ Soru ${soruSayisi} eklendi (ID: ${questionId})`);
    }

    // Kontrol
    const [kontrol] = await db.execute(
      "SELECT COUNT(*) as toplam FROM questions WHERE chapter_id = ? AND sub_chapter_id = ?",
      ["2", "2-1-1"]
    );
    console.log(`\\n🎉 BAŞARILI! Toplam ${kontrol[0].toplam} soru eklendi.`);

    await db.end();
  } catch (error) {
    console.error("❌ HATA:", error.message);
    console.error(error.stack);
  }
}

simpleImport();
