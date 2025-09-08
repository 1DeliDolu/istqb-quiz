const mysql = require("mysql2/promise");

async function checkSubChapters() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Sifre123!",
    database: "istqb_quiz_app",
  });

  try {
    console.log("🔍 Checking sub_chapters table...");

    // Tüm sub_chapters'ı listele
    const [rows] = await connection.execute(
      "SELECT * FROM sub_chapters ORDER BY id LIMIT 20"
    );
    console.log("📊 Sub-chapters in database:", rows.length);

    if (rows.length > 0) {
      console.log("📋 First 20 sub-chapters:");
      rows.forEach((row) => {
        console.log(`  ${row.id} - ${row.title} (Chapter: ${row.chapter_id})`);
      });
    } else {
      console.log("❌ No sub-chapters found in database");
    }

    // Chapters'ı da kontrol et
    const [chapters] = await connection.execute(
      "SELECT * FROM chapters ORDER BY id"
    );
    console.log("\n📊 Chapters in database:", chapters.length);
    chapters.forEach((chapter) => {
      console.log(`  ${chapter.id} - ${chapter.title} (Type: ${chapter.type})`);
    });
  } catch (error) {
    console.error("❌ Error checking database:", error);
  } finally {
    await connection.end();
  }
}

checkSubChapters();
