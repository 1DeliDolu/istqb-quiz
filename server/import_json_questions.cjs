const mysql = require("mysql2/promise");
const fs = require("fs");

async function importQuestionsFromJson() {
  try {
    console.log("📖 JSON dosyası okunuyor...");

    // JSON dosyasını oku
    const jsonData = JSON.parse(
      fs.readFileSync("questions_2_1_1.json", "utf8")
    );

    console.log(`✅ JSON yüklendi: ${jsonData.questions.length} soru bulundu`);

    // MySQL bağlantısı
    const connection = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });

    console.log("✅ MySQL bağlantısı kuruldu");

    // Önce mevcut soruları sil (temizlik)
    console.log("🗑️ Mevcut sorular temizleniyor...");
    await connection.query(
      `
      DELETE FROM question_options WHERE question_id IN (
        SELECT id FROM questions WHERE chapter_id = ? AND sub_chapter_id = ?
      )
    `,
      [jsonData.chapter, jsonData.subChapter]
    );

    await connection.query(
      `
      DELETE FROM questions WHERE chapter_id = ? AND sub_chapter_id = ?
    `,
      [jsonData.chapter, jsonData.subChapter]
    );

    // Alt bölümü kontrol et/ekle
    await connection.query(
      `
      INSERT INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `,
      [jsonData.subChapter, jsonData.chapter, jsonData.subChapterTitle]
    );

    console.log("📝 Sorular ekleniyor...");

    // Her soruyu ekle
    for (let i = 0; i < jsonData.questions.length; i++) {
      const q = jsonData.questions[i];

      // Soruyu ekle
      const [result] = await connection.query(
        `
        INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation) 
        VALUES (?, ?, ?, ?)
      `,
        [jsonData.chapter, jsonData.subChapter, q.question, q.explanation]
      );

      const questionId = result.insertId;

      // Seçenekleri ekle
      for (let j = 0; j < q.options.length; j++) {
        const option = q.options[j];
        await connection.query(
          `
          INSERT INTO question_options (question_id, option_text, option_order, is_correct) 
          VALUES (?, ?, ?, ?)
        `,
          [questionId, option.text, j + 1, option.correct]
        );
      }

      console.log(`  ✓ Soru ${i + 1}/20 eklendi (ID: ${questionId})`);
    }

    // Kontrol et
    const [countResult] = await connection.query(
      `
      SELECT COUNT(*) as total FROM questions 
      WHERE chapter_id = ? AND sub_chapter_id = ?
    `,
      [jsonData.chapter, jsonData.subChapter]
    );

    const [optionsResult] = await connection.query(
      `
      SELECT COUNT(*) as total FROM question_options qo
      JOIN questions q ON qo.question_id = q.id
      WHERE q.chapter_id = ? AND q.sub_chapter_id = ?
    `,
      [jsonData.chapter, jsonData.subChapter]
    );

    console.log("\\n📊 SONUÇLAR:");
    console.log(`✅ Toplam soru: ${countResult[0].total}`);
    console.log(`✅ Toplam seçenek: ${optionsResult[0].total}`);
    console.log(`✅ Bölüm: Chapter ${jsonData.chapter}`);
    console.log(`✅ Alt bölüm: ${jsonData.subChapterTitle}`);

    await connection.end();
    console.log("\\n🎉 Import başarıyla tamamlandı!");
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error.stack);
  }
}

importQuestionsFromJson();
