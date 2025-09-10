const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function syncUdemyChapters() {
  const db = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "istqb_quiz_app",
    charset: "utf8mb4",
  });

  console.log("🚀 Udemy Chapter Sync başlatılıyor...");

  try {
    // 1. Eski Udemy chapters ve sub_chapters'ları sil
    console.log("🗑️ Eski Udemy chapters siliniyor...");

    // Önce foreign key constraint'leri geçici olarak devre dışı bırak
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    // Udemy ile başlayan chapter'ları sil
    await db.query("DELETE FROM chapters WHERE id LIKE 'udemy_%'");
    await db.query("DELETE FROM sub_chapters WHERE chapter_id LIKE 'udemy_%'");

    console.log("✅ Eski Udemy chapters silindi");

    // 2. JSON dosyalarından chapters ve sub_chapters'ları topla
    const jsonDir = path.join(__dirname, "../json/udemy");
    const chapterDirs = fs
      .readdirSync(jsonDir)
      .filter((dir) => fs.statSync(path.join(jsonDir, dir)).isDirectory());

    const chaptersMap = new Map();
    const subChaptersMap = new Map();

    for (const chapterDir of chapterDirs) {
      // Chapter ID'sini normalize et (Bölüm_1 -> udemy_1)
      const chapterMatch = chapterDir.match(/Bölüm_(\d+)/);
      if (!chapterMatch) continue;

      const chapterNum = chapterMatch[1];
      const chapterId = `udemy_${chapterNum}`;

      // Chapter'ı ekle
      if (!chaptersMap.has(chapterId)) {
        chaptersMap.set(chapterId, {
          id: chapterId,
          title: `Udemy Bölüm ${chapterNum}`,
          description: `Udemy ISTQB Kursu Bölüm ${chapterNum}`,
          source: "udemy",
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
              // Udemy subChapter formatları çeşitli olabilir
              let subId = question.subChapter;

              // Quiz formatlarını normalize et (Quiz 1, Quiz 2 etc.)
              const quizMatch = subId.match(/Quiz\s+(\d+)/i);
              if (quizMatch) {
                subId = `quiz_${quizMatch[1]}`;
              } else {
                // Sayısal pattern varsa normalize et
                const numericMatch = subId.match(/^(\d+\.\d+(\.\d+)?)/);
                if (numericMatch) {
                  subId = numericMatch[1].replace(/\./g, "_");
                } else {
                  // Diğer formatları temizle
                  subId = subId
                    .replace(/[^\w\s]/g, "_")
                    .replace(/\s+/g, "_")
                    .toLowerCase();
                }
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
    console.log("📝 Udemy Chapters ekleniyor...");
    for (const chapter of chaptersMap.values()) {
      await db.query(
        "INSERT INTO chapters (id, title, description, source) VALUES (?, ?, ?, ?)",
        [chapter.id, chapter.title, chapter.description, chapter.source]
      );
    }
    console.log(`✅ ${chaptersMap.size} Udemy chapter eklendi`);

    // 4. Sub_chapters'ları database'e ekle
    console.log("📝 Udemy Sub-chapters ekleniyor...");
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
    console.log(`✅ ${subChaptersMap.size} Udemy sub-chapter eklendi`);

    // Foreign key constraint'leri tekrar aktif et
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🎉 Udemy Chapter Sync tamamlandı!");

    // Özet bilgi
    console.log(`\n📊 Özet:`);
    console.log(`   • ${chaptersMap.size} Udemy chapter`);
    console.log(`   • ${subChaptersMap.size} Udemy sub-chapter`);
  } catch (error) {
    console.error("❌ Udemy Chapter Sync hatası:", error);
    await db.query("SET FOREIGN_KEY_CHECKS = 1"); // Hata durumunda da aktif et
  } finally {
    await db.end();
  }
}

// Script doğrudan çalıştırılırsa
if (require.main === module) {
  syncUdemyChapters().catch(console.error);
}

module.exports = { syncUdemyChapters };
