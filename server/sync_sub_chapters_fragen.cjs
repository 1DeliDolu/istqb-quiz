const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function syncFragenSubChapters() {
  const db = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "istqb_quiz_app",
    charset: "utf8mb4",
  });

  console.log("🚀 Fragen Sub-Chapters Sync başlatılıyor...");

  try {
    // 1. Eski Fragen sub_chapters'ları sil
    console.log("🗑️ Eski Fragen sub-chapters siliniyor...");

    // Önce foreign key constraint'leri geçici olarak devre dışı bırak
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    // Fragen ile başlayan sub_chapters'ları sil
    await db.query("DELETE FROM sub_chapters WHERE chapter_id LIKE 'fragen_%'");

    console.log("✅ Eski Fragen sub-chapters silindi");

    // 2. JSON dosyalarından sub_chapters'ları topla
    const jsonDir = path.join(__dirname, "../json/fragen");
    const chapterDirs = fs
      .readdirSync(jsonDir)
      .filter((dir) => fs.statSync(path.join(jsonDir, dir)).isDirectory());

    const subChaptersMap = new Map();

    for (const chapterDir of chapterDirs) {
      let chapterId;

      // Farklı directory formatlarını destekle
      if (chapterDir === "Deutsch") {
        chapterId = "fragen_deutsch";
      } else if (chapterDir === "Genel") {
        chapterId = "fragen_genel";
      } else if (chapterDir === "Mixed") {
        chapterId = "fragen_mixed";
      } else if (chapterDir === "Praxis") {
        chapterId = "fragen_praxis";
      } else {
        // Bölüm formatı varsa
        const chapterMatch = chapterDir.match(/Bölüm_(\d+)/);
        if (chapterMatch) {
          const chapterNum = chapterMatch[1];
          chapterId = "fragen_" + chapterNum;
        } else {
          // Diğer formatlar için generic approach
          chapterId =
            "fragen_" + chapterDir.toLowerCase().replace(/[^\w]/g, "_");
        }
      }

      // Bu chapter'daki JSON dosyalarını oku
      const chapterPath = path.join(jsonDir, chapterDir);
      const jsonFiles = fs
        .readdirSync(chapterPath)
        .filter((file) => file.endsWith(".json"));

      for (const jsonFile of jsonFiles) {
        try {
          const filePath = path.join(chapterPath, jsonFile);
          const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

          // JSON formatını kontrol et
          let questions = [];
          if (data.questions && Array.isArray(data.questions)) {
            questions = data.questions;
          } else if (Array.isArray(data)) {
            questions = data;
          }

          // Her sorudan subChapter bilgisini çıkar
          for (const question of questions) {
            let subChapterTitle = question.subChapter;

            // Eğer question'da subChapter yoksa data'dan al
            if (!subChapterTitle && data.subChapterTitle) {
              subChapterTitle = data.subChapterTitle;
            }

            if (subChapterTitle) {
              let subId = subChapterTitle;

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

              const subChapterKey = chapterId + "_" + subId;
              const fullSubId = chapterId + "_" + subId; // Unique ID = chapter + subId
              if (!subChaptersMap.has(subChapterKey)) {
                subChaptersMap.set(subChapterKey, {
                  id: fullSubId,
                  chapter_id: chapterId,
                  title: subChapterTitle,
                  description: subChapterTitle,
                });
              }
            }
          }
        } catch (error) {
          console.warn("⚠️ JSON okuma hatası: " + jsonFile, error.message);
        }
      }
    }

    // 3. Sub_chapters'ları database'e ekle
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
    console.log("✅ " + subChaptersMap.size + " Fragen sub-chapter eklendi");

    // Foreign key constraint'leri tekrar aktif et
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🎉 Fragen Sub-Chapters Sync tamamlandı!");

    // Özet bilgi
    console.log("\n📊 Özet:");
    console.log("   • " + subChaptersMap.size + " Fragen sub-chapter");
  } catch (error) {
    console.error("❌ Fragen Sub-Chapters Sync hatası:", error);
    await db.query("SET FOREIGN_KEY_CHECKS = 1"); // Hata durumunda da aktif et
  } finally {
    await db.end();
  }
}

// Script doğrudan çalıştırılırsa
if (require.main === module) {
  syncFragenSubChapters().catch(console.error);
}

module.exports = { syncFragenSubChapters };
