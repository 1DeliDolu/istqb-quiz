const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "", // MySQL password'ünüz varsa buraya yazın
    multipleStatements: true,
  });

  try {
    console.log("🔄 Veritabanı oluşturuluyor...");

    const sqlFile = fs.readFileSync(
      path.join(__dirname, "create_tables.sql"),
      "utf8"
    );
    const results = await connection.query(sqlFile);

    console.log("✅ Tüm tablolar başarıyla oluşturuldu!");
    console.log("📊 Veritabanı: istqb_quiz_app");
    console.log(
      "📝 Tablolar: chapters, sub_chapters, questions, question_options"
    );

    // Test sorgusu
    const [tables] = await connection.query("USE istqb_quiz_app; SHOW TABLES;");
    console.log("📋 Oluşturulan tablolar:", tables);
  } catch (error) {
    console.error("❌ Hata:", error.message);
  } finally {
    await connection.end();
  }
}

setupDatabase();
