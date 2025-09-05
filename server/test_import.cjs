const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function getAllJsonFiles(baseDir) {
  console.log(`📂 Tarama başlıyor: ${baseDir}`);
  const jsonFiles = [];

  function scanDirectory(dir) {
    console.log(`📁 Taranıyor: ${dir}`);
    try {
      if (!fs.existsSync(dir)) {
        console.log(`⚠️ Klasör bulunamadı: ${dir}`);
        return;
      }

      const items = fs.readdirSync(dir);
      console.log(`📋 Bulunan öğeler: ${items.join(", ")}`);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith(".json")) {
          console.log(`✅ JSON dosyası bulundu: ${fullPath}`);
          jsonFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`❌ Klasör okuma hatası (${dir}):`, error.message);
    }
  }

  scanDirectory(baseDir);
  console.log(`📊 Toplam ${jsonFiles.length} JSON dosyası bulundu`);
  return jsonFiles;
}

async function testImport() {
  console.log("🚀 Test import başlıyor...");

  try {
    // Önce dosyaları test et
    const baseDir = "../json";
    const sources = ["istqb"];

    for (const source of sources) {
      const sourceDir = path.join(baseDir, source);
      console.log(`\n📁 ${source.toUpperCase()} klasörü test ediliyor...`);

      const jsonFiles = getAllJsonFiles(sourceDir);

      if (jsonFiles.length > 0) {
        console.log(`✅ ${jsonFiles.length} dosya bulundu`);
        // İlk dosyayı test et
        const testFile = jsonFiles[0];
        console.log(`\n📄 Test dosyası: ${testFile}`);

        const data = JSON.parse(fs.readFileSync(testFile, "utf8"));
        console.log(
          `📋 Dosya içeriği: ${data.questions ? data.questions.length : 0} soru`
        );
      }
    }

    // MySQL bağlantısını test et
    console.log("\n🔗 MySQL bağlantısı test ediliyor...");
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlantısı başarılı");
    await db.end();
  } catch (error) {
    console.error("❌ TEST HATASI:", error.message);
    console.error(error.stack);
  }
}

testImport();
