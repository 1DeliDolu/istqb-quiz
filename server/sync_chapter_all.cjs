const { syncISTQBChapters } = require("./sync_chapter_istqb.cjs");
const { syncUdemyChapters } = require("./sync_chapter_udemy.cjs");
const { syncFragenChapters } = require("./sync_chapter_fragen.cjs");

async function syncAllChapters() {
  console.log("🚀 Tüm Chapter Sync işlemi başlatılıyor...");
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    // 1. ISTQB Chapters
    console.log("\n📖 1/3: ISTQB Chapters sync ediliyor...");
    await syncISTQBChapters();

    console.log("\n⏳ 2 saniye bekleniyor...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Udemy Chapters
    console.log("\n🎓 2/3: Udemy Chapters sync ediliyor...");
    await syncUdemyChapters();

    console.log("\n⏳ 2 saniye bekleniyor...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Fragen Chapters
    console.log("\n❓ 3/3: Fragen Chapters sync ediliyor...");
    await syncFragenChapters();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 TÜM CHAPTER SYNC İŞLEMİ TAMAMLANDI!");
    console.log(`⏱️ Toplam süre: ${duration} saniye`);
    console.log("=".repeat(60));

    console.log("\n📋 Özet:");
    console.log("   ✅ ISTQB chapters ve sub-chapters sync edildi");
    console.log("   ✅ Udemy chapters ve sub-chapters sync edildi");
    console.log("   ✅ Fragen chapters ve sub-chapters sync edildi");
    console.log(
      "\n💡 Artık sync_import_all.cjs çalıştırarak soruları import edebilirsiniz!"
    );
  } catch (error) {
    console.error("\n❌ Chapter Sync işlemi başarısız oldu:", error);
    process.exit(1);
  }
}

// Script doğrudan çalıştırılırsa
if (require.main === module) {
  syncAllChapters().catch(console.error);
}

module.exports = { syncAllChapters };
