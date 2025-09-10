const { syncISTQBSubChapters } = require("./sync_sub_chapters_istqb.cjs");
const { syncUdemySubChapters } = require("./sync_sub_chapters_udemy.cjs");
const { syncFragenSubChapters } = require("./sync_sub_chapters_fragen.cjs");

async function syncAllSubChapters() {
  console.log("🚀 Tüm Sub-Chapters Sync işlemi başlatılıyor...");
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    // 1. ISTQB Sub-Chapters
    console.log("\n📖 1/3: ISTQB Sub-Chapters sync ediliyor...");
    await syncISTQBSubChapters();

    console.log("\n⏳ 2 saniye bekleniyor...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Udemy Sub-Chapters
    console.log("\n🎓 2/3: Udemy Sub-Chapters sync ediliyor...");
    await syncUdemySubChapters();

    console.log("\n⏳ 2 saniye bekleniyor...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Fragen Sub-Chapters
    console.log("\n❓ 3/3: Fragen Sub-Chapters sync ediliyor...");
    await syncFragenSubChapters();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 TÜM SUB-CHAPTERS SYNC İŞLEMİ TAMAMLANDI!");
    console.log("⏱️ Toplam süre: " + duration + " saniye");
    console.log("=".repeat(60));

    console.log("\n📋 Özet:");
    console.log("   ✅ ISTQB sub-chapters sync edildi");
    console.log("   ✅ Udemy sub-chapters sync edildi");
    console.log("   ✅ Fragen sub-chapters sync edildi");
    console.log("\n💡 Artık API sub-chapter filtreleri düzgün çalışacak!");
  } catch (error) {
    console.error("\n❌ Sub-Chapters Sync işlemi başarısız oldu:", error);
    process.exit(1);
  }
}

// Script doğrudan çalıştırılırsa
if (require.main === module) {
  syncAllSubChapters().catch(console.error);
}

module.exports = { syncAllSubChapters };
