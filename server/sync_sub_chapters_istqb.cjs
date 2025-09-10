const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function syncISTQBSubChapters() {
  const db = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "istqb_quiz_app",
    charset: "utf8mb4",
  });

  console.log("🚀 ISTQB Sub-Chapters Sync başlatılıyor...");

  try {
    // 1. Eski ISTQB sub_chapters'ları sil
    console.log("🗑️ Eski ISTQB sub-chapters siliniyor...");

    // Önce foreign key constraint'leri geçici olarak devre dışı bırak
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    // ISTQB ile başlayan sub_chapters'ları sil
    await db.query("DELETE FROM sub_chapters WHERE chapter_id LIKE 'istqb_%'");

    console.log("✅ Eski ISTQB sub-chapters silindi");

    // 2. JSON dosyalarından sub_chapters'ları topla
    const jsonDir = path.join(__dirname, "../json/istqb");
    const chapterDirs = fs
      .readdirSync(jsonDir)
      .filter((dir) => fs.statSync(path.join(jsonDir, dir)).isDirectory());

    const subChaptersMap = new Map();

    for (const chapterDir of chapterDirs) {
      // Chapter ID'sini normalize et (Bölüm_1 -> istqb_1)
      const chapterMatch = chapterDir.match(/Bölüm_(\d+)/);
      if (!chapterMatch) continue;

      const chapterNum = chapterMatch[1];
      const chapterId = "istqb_" + chapterNum;

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

          // Dosya düzeyindeki subChapter bilgileri (fallback için)
          const fileLevelSubId =
            typeof data.subChapter === "string" && data.subChapter.startsWith("istqb_")
              ? data.subChapter
              : null;
          // id içinden sayısal çekirdek (ör. istqb_2_2-1-2 -> 2-1-2)
          const fileLevelCore = fileLevelSubId
            ? fileLevelSubId.replace(/^istqb_\d+_/, "")
            : null;

          // Her sorudan subChapter bilgisini çıkar
          for (const question of questions) {
            let subChapterTitle = question.subChapter;

            // Eğer question'da subChapter yoksa data'dan al (başlık)
            if (!subChapterTitle && data.subChapterTitle) {
              subChapterTitle = data.subChapterTitle;
            }

            // Başlıktan sayısal prefix çıkar, yoksa dosya seviyesindeki id'den oluştur
            let subId = null;
            if (subChapterTitle) {
              const m = subChapterTitle.match(/^(\d+[-.]?\d*(?:[-.]?\d*)?)/);
              if (m && m[1] && /\d/.test(m[1])) {
                subId = m[1].replace(/\./g, "-");
                // Trailing delimiter (e.g., "6-2-") temizle
                subId = subId.replace(/-+$/, "");
              }
            }
            if (!subId && fileLevelCore) {
              subId = fileLevelCore; // Örn. 2-1-2
            }

            if (subId) {
              const subChapterKey = chapterId + "_" + subId;
              const fullSubId = chapterId + "_" + subId; // Unique ID = chapter + subId
              if (!subChaptersMap.has(subChapterKey)) {
                // Görünen başlık: eğer sayısal prefix yoksa ekle (2.1.2 + boşluk + title)
                let title = subChapterTitle || "";
                const dotted = subId.replace(/-/g, ".");
                if (!/^\d+\.\d+/.test(title)) {
                  title = `${dotted}. ${title}`.trim();
                }
                subChaptersMap.set(subChapterKey, {
                  id: fullSubId,
                  chapter_id: chapterId,
                  title,
                  description: title,
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

    console.log("🎉 ISTQB Sub-Chapters Sync tamamlandı!");

    // Özet bilgi
    console.log("\n📊 Özet:");
    console.log("   • " + subChaptersMap.size + " ISTQB sub-chapter");
  } catch (error) {
    console.error("❌ ISTQB Sub-Chapters Sync hatası:", error);
    await db.query("SET FOREIGN_KEY_CHECKS = 1"); // Hata durumunda da aktif et
  } finally {
    await db.end();
  }
}

// Script doğrudan çalıştırılırsa
if (require.main === module) {
  syncISTQBSubChapters().catch(console.error);
}

module.exports = { syncISTQBSubChapters };
