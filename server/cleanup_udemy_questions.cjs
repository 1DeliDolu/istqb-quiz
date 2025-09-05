const mysql = require("mysql2/promise");

async function cleanupWrongUdemyQuestions() {
  console.log("🧹 Yanlış yerleştirilmiş Udemy sorularını temizleniyor...");

  try {
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Delete questions that are wrongly placed in numeric chapters (should be in udemy_X chapters)
    console.log(
      "\n🗑️ Udemy source'li ama yanlış chapter'daki soruları siliniyor..."
    );

    // First, delete the options
    const [deletedOptions] = await db.execute(`
      DELETE FROM question_options 
      WHERE question_id IN (
        SELECT id FROM questions 
        WHERE source = 'udemy' 
        AND chapter_id IN ('1', '2', '3', '4', '5', '6', '7', '8')
      )
    `);
    console.log(`🗑️ ${deletedOptions.affectedRows} yanlış seçenek silindi`);

    // Then delete the questions
    const [deletedQuestions] = await db.execute(`
      DELETE FROM questions 
      WHERE source = 'udemy' 
      AND chapter_id IN ('1', '2', '3', '4', '5', '6', '7', '8')
    `);
    console.log(`🗑️ ${deletedQuestions.affectedRows} yanlış soru silindi`);

    console.log("\n✅ Temizlik tamamlandı!");

    // Check what's left
    const [remainingUdemy] = await db.execute(`
      SELECT chapter_id, sub_chapter_id, COUNT(*) as count 
      FROM questions 
      WHERE source = 'udemy' 
      GROUP BY chapter_id, sub_chapter_id 
      ORDER BY chapter_id, sub_chapter_id
    `);

    console.log("\n📊 Kalan Udemy soruları:");
    remainingUdemy.forEach((q) =>
      console.log(`  ${q.chapter_id}/${q.sub_chapter_id}: ${q.count} soru`)
    );

    await db.end();
    console.log("✅ MySQL bağlantısı kapatıldı");
  } catch (error) {
    console.error("❌ GENEL HATA:", error.message);
    console.error(error.stack);
  }
}

cleanupWrongUdemyQuestions();
