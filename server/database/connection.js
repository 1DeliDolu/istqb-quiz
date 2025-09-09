const mysql = require("mysql2/promise");
require("dotenv").config();

// MySQL bağlantı konfigürasyonu
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "istqb_quiz_app",
  charset: "utf8mb4",
  // Use valid mysql2 option for initial connection timeout
  connectTimeout: 60000,
  multipleStatements: true,
};

// Connection pool oluştur
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Veritabanı bağlantısını test et
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL veritabanına başarıyla bağlanıldı");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ MySQL bağlantı hatası:", error.message);
    return false;
  }
}

// Veritabanı sorgularını çalıştır
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("SQL Query Error:", error.message);
    throw error;
  }
}

// Veritabanı şemasını yükle
async function initializeDatabase() {
  try {
    const fs = require("fs");
    const path = require("path");

    const schemaPath = path.join(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");

      // Schema'yı noktalı virgül ile parçalara ayır ve temizle
      const statements = schema
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      // Her statement'ı ayrı ayrı çalıştır (execute yerine query kullan)
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await pool.query(statement);
            console.log(`✅ SQL executed: ${statement.substring(0, 50)}...`);
          } catch (error) {
            // CREATE IF NOT EXISTS hataları normal, görmezden gel
            if (!error.message.includes("already exists")) {
              console.error(
                `❌ SQL Error: ${statement.substring(0, 50)}...`,
                error.message
              );
            }
          }
        }
      }

      console.log("📊 Veritabanı şeması başarıyla yüklendi");
      return true;
    } else {
      console.log("⚠️ Schema dosyası bulunamadı");
      return false;
    }
  } catch (error) {
    console.error("Database initialization error:", error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  initializeDatabase,
};
