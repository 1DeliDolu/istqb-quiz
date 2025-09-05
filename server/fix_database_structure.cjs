const mysql = require("mysql2/promise");

async function fixDatabaseStructure() {
  console.log("🔧 Database yapısı düzeltiliyor...");

  try {
    // MySQL bağlan
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Eksik chapters'ları ekle
    const missingChapters = ["7", "8"];

    console.log("\n📚 Eksik chapters ekleniyor...");
    for (const chapterId of missingChapters) {
      try {
        await db.execute(
          "INSERT INTO chapters (id, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)",
          [chapterId, `Chapter ${chapterId}`]
        );
        console.log(`✅ Chapter ${chapterId} eklendi`);
      } catch (error) {
        console.log(`⚠️ Chapter ${chapterId} eklenirken hata:`, error.message);
      }
    }

    // Eksik sub-chapters'ları ekle
    const missingSubChapters = [
      "2-1-5",
      "4-2-1",
      "4-2-2",
      "4-2-3",
      "4-2-4",
      "4-3-1",
      "4-3-2",
      "4-3-3",
      "4-4-1",
      "4-4-2",
      "4-4-3",
      "4-5",
      "4-5-1",
      "4-5-2",
      "4-5-3",
      "5-1-1",
      "5-1-2",
      "5-1-3",
      "5-1-4",
      "5-1-5",
      "5-1-6",
      "5-1-7",
      "5-2-1",
      "5-2-2",
      "5-2-3",
      "5-2-4",
      "5-3-1",
      "5-3-2",
      "5-3-3",
      "6-3",
      "6-4",
      "7-1",
      "7-2",
      "8-1",
      "8-2",
      "8-3",
    ];

    console.log("\n📖 Eksik sub-chapters ekleniyor...");
    for (const subChapterId of missingSubChapters) {
      const chapterId = subChapterId.split("-")[0];
      try {
        await db.execute(
          "INSERT INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)",
          [subChapterId, chapterId, `Sub Chapter ${subChapterId}`]
        );
        console.log(`✅ Sub-chapter ${subChapterId} eklendi`);
      } catch (error) {
        console.log(
          `⚠️ Sub-chapter ${subChapterId} eklenirken hata:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Database yapısı düzeltildi!");

    // Kontrol et
    const [chapters] = await db.execute(
      "SELECT COUNT(*) as count FROM chapters"
    );
    const [subChapters] = await db.execute(
      "SELECT COUNT(*) as count FROM sub_chapters"
    );

    console.log(`📊 Toplam chapters: ${chapters[0].count}`);
    console.log(`📊 Toplam sub-chapters: ${subChapters[0].count}`);

    await db.end();
    console.log("✅ MySQL bağlantısı kapatıldı");

    console.log("\n🚀 Şimdi import script'ini çalıştırabilirsiniz:");
    console.log("node fixed_import_clean.cjs");
  } catch (error) {
    console.error("❌ GENEL HATA:", error.message);
    console.error(error.stack);
  }
}

fixDatabaseStructure();
