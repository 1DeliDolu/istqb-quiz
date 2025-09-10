const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function syncISTQBChapters() {
  const db = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "istqb_quiz_app",
    charset: "utf8mb4",
  });

  console.log("🚀 ISTQB Chapter Sync başlatılıyor...");

  try {
    // 1. Eski ISTQB chapters ve sub_chapters'ları sil
    console.log("🗑️ Eski ISTQB chapters siliniyor...");

    // Önce foreign key constraint'leri geçici olarak devre dışı bırak
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    // ISTQB ile başlayan chapter'ları sil
    await db.query("DELETE FROM chapters WHERE id LIKE 'istqb_%'");
    await db.query("DELETE FROM sub_chapters WHERE chapter_id LIKE 'istqb_%'");

    console.log("✅ Eski ISTQB chapters silindi");

    // 2. JSON dosyalarından chapters ve sub_chapters'ları topla
    const jsonDir = path.join(__dirname, "../json/istqb");
    const chapterDirs = fs
      .readdirSync(jsonDir)
      .filter((dir) => fs.statSync(path.join(jsonDir, dir)).isDirectory());

    const chaptersMap = new Map();
    const subChaptersMap = new Map();

    for (const chapterDir of chapterDirs) {
      // Chapter ID'sini normalize et (Bölüm_1 -> istqb_1)
      const chapterMatch = chapterDir.match(/Bölüm_(\d+)/);
      if (!chapterMatch) continue;

      const chapterNum = chapterMatch[1];
      const chapterId = "istqb_" + chapterNum;

      // Chapter'ı ekle
      if (!chaptersMap.has(chapterId)) {
        chaptersMap.set(chapterId, {
          id: chapterId,
          title: "ISTQB Bölüm " + chapterNum,
          description: "ISTQB Foundation Level Bölüm " + chapterNum,
          source: "istqb",
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
              // subChapter ID'sini normalize et
              const subIdMatch = subChapterTitle.match(
                /^(\d+[-.]?\d*[-.]?\d*)/
              );
              if (subIdMatch) {
                const subId = subIdMatch[1].replace(/\./g, "-");
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
          }
        } catch (error) {
          console.warn("⚠️ JSON okuma hatası: " + jsonFile, error.message);
        }
      }
    }

    // 3. Chapters'ları database'e ekle
    console.log("�� ISTQB Chapters ekleniyor...");
    for (const chapter of chaptersMap.values()) {
      await db.query(
        "INSERT INTO chapters (id, title, description, source) VALUES (?, ?, ?, ?)",
        [chapter.id, chapter.title, chapter.description, chapter.source]
      );
    }
    console.log("✅ " + chaptersMap.size + " ISTQB chapter eklendi");

    // 4. Sub_chapters'ları database'e ekle
    console.log("📝 ISTQB Sub-chapters ekleniyor...");
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
    console.log("✅ " + subChaptersMap.size + " ISTQB sub-chapter eklendi");

    // Foreign key constraint'leri tekrar aktif et
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🎉 ISTQB Chapter Sync tamamlandı!");

    // Özet bilgi
    console.log("\n📊 Özet:");
    console.log("   • " + chaptersMap.size + " ISTQB chapter");
    console.log("   • " + subChaptersMap.size + " ISTQB sub-chapter");
  } catch (error) {
    console.error("❌ ISTQB Chapter Sync hatası:", error);
    await db.query("SET FOREIGN_KEY_CHECKS = 1"); // Hata durumunda da aktif et
  } finally {
    await db.end();
  }
}

// Script doğrudan çalıştırılırsa
if (require.main === module) {
  syncISTQBChapters().catch(console.error);
}

module.exports = { syncISTQBChapters };
