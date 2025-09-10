const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function syncFragenChapters() {
  const db = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "istqb_quiz_app",
    charset: "utf8mb4",
  });

  console.log("🚀 Fragen Chapter Sync başlatılıyor...");

  try {
    // 1. Eski Fragen chapters ve sub_chapters'ları sil
    console.log("🗑️ Eski Fragen chapters siliniyor...");

    // Önce foreign key constraint'leri geçici olarak devre dışı bırak
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    // Fragen ile başlayan chapter'ları sil
    await db.query("DELETE FROM chapters WHERE id LIKE 'fragen_%'");
    await db.query("DELETE FROM sub_chapters WHERE chapter_id LIKE 'fragen_%'");

    console.log("✅ Eski Fragen chapters silindi");

    // 2. JSON dosyalarından chapters ve sub_chapters'ları topla
    const jsonDir = path.join(__dirname, "../json/fragen");
    const chapterDirs = fs
      .readdirSync(jsonDir)
      .filter((dir) => fs.statSync(path.join(jsonDir, dir)).isDirectory());

    const chaptersMap = new Map();
    const subChaptersMap = new Map();

    for (const chapterDir of chapterDirs) {
      let chapterId;
      let chapterTitle;

      // Farklı directory formatlarını destekle
      if (chapterDir === "Deutsch") {
        chapterId = "fragen_deutsch";
        chapterTitle = "Fragen Deutsch";
      } else if (chapterDir === "Genel") {
        chapterId = "fragen_genel";
        chapterTitle = "Fragen Genel";
      } else if (chapterDir === "Mixed") {
        chapterId = "fragen_mixed";
        chapterTitle = "Fragen Mixed";
      } else if (chapterDir === "Praxis") {
        chapterId = "fragen_praxis";
        chapterTitle = "Fragen Praxis";
      } else {
        // Bölüm formatı varsa
        const chapterMatch = chapterDir.match(/Bölüm_(\d+)/);
        if (chapterMatch) {
          const chapterNum = chapterMatch[1];
          chapterId = `fragen_${chapterNum}`;
          chapterTitle = `Fragen Bölüm ${chapterNum}`;
        } else {
          // Diğer formatlar için generic approach
          chapterId = `fragen_${chapterDir
            .toLowerCase()
            .replace(/[^\w]/g, "_")}`;
          chapterTitle = `Fragen ${chapterDir}`;
        }
      }

      // Chapter'ı ekle
      if (!chaptersMap.has(chapterId)) {
        chaptersMap.set(chapterId, {
          id: chapterId,
          title: chapterTitle,
          description: `${chapterTitle} Soru Koleksiyonu`,
          source: "fragen",
        });
      }

      // Bu chapter'daki JSON dosyalarını oku
      const chapterPath = path.join(jsonDir, chapterDir);
      const jsonFiles = fs
        .readdirSync(chapterPath)
        .filter((file) => file.endsWith(".json"));

      for (const jsonFile of jsonFiles) {
        try {
          const filePath = path.join(chapterPath, jsonFile);
          const questions = JSON.parse(fs.readFileSync(filePath, "utf-8"));

          // Her sorudan subChapter bilgisini çıkar
          for (const question of questions) {
            if (question.subChapter) {
              let subId = question.subChapter;

              // subChapter formatını normalize et
              if (subId.match(/^(\d+\.\d+(\.\d+)?)/)) {
                // Sayısal format (3.1.1 -> 3_1_1)
                subId = subId
                  .match(/^(\d+\.\d+(\.\d+)?)/)[1]
                  .replace(/\./g, "_");
              } else {
                // Diğer formatları temizle
                subId = subId
                  .replace(/[^\w\s]/g, "_")
                  .replace(/\s+/g, "_")
                  .toLowerCase();
              }

              const subChapterKey = `${chapterId}_${subId}`;
              if (!subChaptersMap.has(subChapterKey)) {
                subChaptersMap.set(subChapterKey, {
                  id: subId,
                  chapter_id: chapterId,
                  title: question.subChapter,
                  description: question.subChapter,
                });
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️ JSON okuma hatası: ${jsonFile}`, error.message);
        }
      }
    }

    // 3. Chapters'ları database'e ekle
    console.log("📝 Fragen Chapters ekleniyor...");
    for (const chapter of chaptersMap.values()) {
      await db.query(
        "INSERT INTO chapters (id, title, description, source) VALUES (?, ?, ?, ?)",
        [chapter.id, chapter.title, chapter.description, chapter.source]
      );
    }
    console.log(`✅ ${chaptersMap.size} Fragen chapter eklendi`);

    // 4. Sub_chapters'ları database'e ekle
    console.log("📝 Fragen Sub-chapters ekleniyor...");
    for (const subChapter of subChaptersMap.values()) {
      await db.query(
        "INSERT INTO sub_chapters (id, chapter_id, title, description) VALUES (?, ?, ?, ?)",
        [
          subChapter.id,
          subChapter.chapter_id,
          subChapter.title,
          subChapter.description,
        ]
      );
    }
    console.log(`✅ ${subChaptersMap.size} Fragen sub-chapter eklendi`);

    // Foreign key constraint'leri tekrar aktif et
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🎉 Fragen Chapter Sync tamamlandı!");

    // Özet bilgi
    console.log(`\n📊 Özet:`);
    console.log(`   • ${chaptersMap.size} Fragen chapter`);
    console.log(`   • ${subChaptersMap.size} Fragen sub-chapter`);
  } catch (error) {
    console.error("❌ Fragen Chapter Sync hatası:", error);
    await db.query("SET FOREIGN_KEY_CHECKS = 1"); // Hata durumunda da aktif et
  } finally {
    await db.end();
  }
}

// Script doğrudan çalıştırılırsa
if (require.main === module) {
  syncFragenChapters().catch(console.error);
}

module.exports = { syncFragenChapters };
