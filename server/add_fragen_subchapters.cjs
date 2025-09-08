const mysql = require("mysql2/promise");

async function addFragenSubChapters() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Empty password like in connection.js
    database: "istqb_quiz_app",
  });

  try {
    console.log("📝 Adding fragen sub-chapters manually...");

    // Önce mevcut sub-chapters'ı kontrol et
    const [existing] = await connection.execute(
      'SELECT id FROM sub_chapters WHERE id LIKE "fragen_%"'
    );
    console.log(`📊 Existing fragen sub-chapters: ${existing.length}`);

    // Fragen sub-chapters ekle
    const fragenSubChapters = [
      ["fragen_genel_1", "fragen_genel", "Genel.1 Temel Kavramlar"],
      ["fragen_genel_2", "fragen_genel", "Genel.2 Test Teknikleri"],
      ["fragen_genel_3", "fragen_genel", "Genel.3 Test Yönetimi"],
      ["fragen_deutsch_1", "fragen_deutsch", "Deutsch.1 Grundlagen"],
      ["fragen_deutsch_2", "fragen_deutsch", "Deutsch.2 Techniken"],
      ["fragen_praxis_1", "fragen_praxis", "Praxis.1 Praktische Tests"],
      ["fragen_mixed_1", "fragen_mixed", "Mixed.1 Gemischte Fragen"],
    ];

    for (const [id, chapterId, title] of fragenSubChapters) {
      try {
        await connection.execute(
          "INSERT IGNORE INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?)",
          [id, chapterId, title]
        );
        console.log(`✅ Added sub-chapter: ${id} - ${title}`);
      } catch (error) {
        console.log(`⚠️ Error adding ${id}: ${error.message}`);
      }
    }

    // Sonuç kontrol et
    const [result] = await connection.execute(
      'SELECT id, title FROM sub_chapters WHERE id LIKE "fragen_%" ORDER BY id'
    );
    console.log(`📊 Total fragen sub-chapters after insert: ${result.length}`);
    result.forEach((row) => {
      console.log(`  ${row.id} - ${row.title}`);
    });
  } catch (error) {
    console.error("❌ Error adding sub-chapters:", error.message);
  } finally {
    await connection.end();
  }
}

addFragenSubChapters();
