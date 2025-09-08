const mysql = require("mysql2/promise");

async function removeForeignKeys() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Empty password like in connection.js
    database: "istqb_quiz_app",
  });

  try {
    console.log("🔧 Removing foreign key constraints...");

    // quiz_progress tablosundaki sub_chapter_id foreign key constraint'ini kaldır
    try {
      await connection.execute(`
        ALTER TABLE quiz_progress 
        DROP FOREIGN KEY quiz_progress_ibfk_3
      `);
      console.log("✅ Removed quiz_progress foreign key constraint");
    } catch (error) {
      console.log(
        "⚠️ quiz_progress foreign key might already be removed:",
        error.message
      );
    }

    // user_question_attempts tablosundaki sub_chapter_id foreign key constraint'ini kaldır
    try {
      await connection.execute(`
        ALTER TABLE user_question_attempts 
        DROP FOREIGN KEY user_question_attempts_ibfk_4
      `);
      console.log("✅ Removed user_question_attempts foreign key constraint");
    } catch (error) {
      console.log(
        "⚠️ user_question_attempts foreign key might already be removed:",
        error.message
      );
    }

    // Sub_chapter_id kolonlarını nullable yap
    await connection.execute(`
      ALTER TABLE quiz_progress 
      MODIFY COLUMN sub_chapter_id VARCHAR(100) NULL
    `);
    console.log("✅ Made quiz_progress.sub_chapter_id nullable");

    await connection.execute(`
      ALTER TABLE user_question_attempts 
      MODIFY COLUMN sub_chapter_id VARCHAR(100) NULL
    `);
    console.log("✅ Made user_question_attempts.sub_chapter_id nullable");

    console.log("🎉 Foreign key constraints removed successfully!");
    console.log(
      "💡 Now sub_chapter_id can contain any value without foreign key validation"
    );
  } catch (error) {
    console.error("❌ Error removing foreign keys:", error.message);
  } finally {
    await connection.end();
  }
}

removeForeignKeys();
