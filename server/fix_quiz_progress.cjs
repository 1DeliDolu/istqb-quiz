const mysql = require("mysql2/promise");

async function fixQuizProgressTable() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Sifre123!",
    database: "istqb_quiz_app",
  });

  try {
    console.log("🔧 Fixing quiz_progress table...");

    // Önce mevcut foreign key constraint'i kaldır
    await connection.execute(`
      ALTER TABLE quiz_progress 
      DROP FOREIGN KEY quiz_progress_ibfk_3
    `);
    console.log("✅ Removed foreign key constraint");

    // Sub_chapter_id'yi nullable yaparak yeniden ekle ama constraint olmadan
    await connection.execute(`
      ALTER TABLE quiz_progress 
      MODIFY COLUMN sub_chapter_id VARCHAR(100) NULL
    `);
    console.log("✅ Made sub_chapter_id nullable without foreign key");

    console.log(
      "🎉 Quiz progress table fixed - no more foreign key constraints on sub_chapter_id"
    );
  } catch (error) {
    console.error("❌ Error fixing table:", error.message);
  } finally {
    await connection.end();
  }
}

fixQuizProgressTable();
