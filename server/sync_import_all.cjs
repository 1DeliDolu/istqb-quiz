const { spawn } = require("child_process");
const path = require("path");

async function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 ${scriptName} çalıştırılıyor...`);
    console.log("=".repeat(50));

    const child = spawn("node", [path.join(__dirname, scriptName)], {
      stdio: "inherit",
      cwd: __dirname,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptName} başarıyla tamamlandı!`);
        resolve();
      } else {
        console.error(
          `❌ ${scriptName} hata ile sonuçlandı (exit code: ${code})`
        );
        reject(new Error(`Script failed with exit code ${code}`));
      }
    });

    child.on("error", (error) => {
      console.error(`❌ ${scriptName} çalıştırılırken hata:`, error.message);
      reject(error);
    });
  });
}

async function syncAllQuestions() {
  try {
    console.log("🎯 TÜM SORU KATEGORİLERİ SYNC EDİLİYOR...");
    console.log("📊 Sırasıyla: ISTQB → Udemy → Fragen");
    console.log("=".repeat(60));

    const startTime = Date.now();

    // 1. ISTQB sorularını sync et
    await runScript("sync_import_istqb.cjs");

    // 2. Udemy sorularını sync et
    await runScript("sync_import_udemy.cjs");

    // 3. Fragen sorularını sync et
    await runScript("sync_import_fragen.cjs");

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n🎉 TÜM SYNC İŞLEMLERİ TAMAMLANDI!");
    console.log(`⏱️ Toplam süre: ${duration} saniye`);
    console.log("=".repeat(60));

    // Son özeti göster
    console.log("\n📈 SON DATABASE DURUMU:");
    const mysql = require("mysql2/promise");
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });

    const [summary] = await db.execute(
      "SELECT source, COUNT(*) as toplam FROM questions GROUP BY source"
    );

    let grandTotal = 0;
    for (const row of summary) {
      console.log(`  📚 ${row.source.toUpperCase()}: ${row.toplam} soru`);
      grandTotal += row.toplam;
    }
    console.log(`  🎯 TOPLAM: ${grandTotal} soru`);

    await db.end();
  } catch (error) {
    console.error("\n❌ SYNC İŞLEMİ BAŞARISIZ:", error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  syncAllQuestions();
}

module.exports = { syncAllQuestions };
