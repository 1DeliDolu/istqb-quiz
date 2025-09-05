const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function getAllJsonFiles(baseDir) {
  const jsonFiles = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith(".json")) {
        jsonFiles.push(fullPath);
      }
    }
  }

  scanDirectory(baseDir);
  return jsonFiles;
}

function parseChapterInfo(filePath, source) {
  const fileName = path.basename(filePath, ".json");

  if (source === "istqb") {
    // questions_6_1_clean.json -> chapter: 6, subChapter: 6-1
    const match = fileName.match(
      /questions_(\d+)_(\d+)(?:_(\d+))?(?:_(\d+))?(?:_(\d+))?_clean/
    );
    if (match) {
      const [, ch, sub1, sub2, sub3, sub4] = match;
      let subChapter = `${ch}-${sub1}`;
      if (sub2) subChapter += `-${sub2}`;
      if (sub3) subChapter += `-${sub3}`;
      if (sub4) subChapter += `-${sub4}`;
      return { chapter: ch, subChapter };
    }
  } else if (source === "udemy") {
    // udemy_1_1.json -> chapter: 1, subChapter: 1-1
    const match = fileName.match(/udemy_(\d+)_(\d+)/);
    if (match) {
      const [, ch, sub] = match;
      return { chapter: ch, subChapter: `${ch}-${sub}` };
    }
  } else if (source === "fragen") {
    // Fragen için özel parsing gerekebilir
    // Şimdilik basit bir format varsayalım
    const match = fileName.match(/(\d+)_(\d+)/);
    if (match) {
      const [, ch, sub] = match;
      return { chapter: ch, subChapter: `${ch}-${sub}` };
    }
  }

  return null;
}

async function importAllFiles() {
  console.log("🚀 Tüm dosyalar için toplu import başlıyor...");

  try {
    // MySQL bağlan
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Source column'unu ekle (eğer yoksa)
    try {
      await db.execute(
        "ALTER TABLE questions ADD COLUMN source VARCHAR(50) DEFAULT 'istqb'"
      );
      console.log("✅ Source kolonu eklendi");
    } catch (err) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        console.log(
          "⚠️ Source kolonu zaten mevcut veya başka bir hata:",
          err.message
        );
      }
    }

    const baseDir = "../json";
    const sources = ["istqb", "udemy", "fragen"];

    let totalImported = 0;
    let totalFiles = 0;

    for (const source of sources) {
      const sourceDir = path.join(baseDir, source);

      if (!fs.existsSync(sourceDir)) {
        console.log(`⚠️ ${source} klasörü bulunamadı, atlıyor...`);
        continue;
      }

      console.log(`\n📁 ${source.toUpperCase()} klasörü işleniyor...`);
      const jsonFiles = getAllJsonFiles(sourceDir);
      console.log(`📊 ${jsonFiles.length} JSON dosyası bulundu`);

      if (jsonFiles.length === 0) {
        console.log(`⚠️ ${source} klasöründe JSON dosyası bulunamadı`);
        continue;
      }

      for (const filePath of jsonFiles) {
        try {
          console.log(`\n📄 İşleniyor: ${path.relative(baseDir, filePath)}`);

          // JSON'u oku
          const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

          if (!data.questions || !Array.isArray(data.questions)) {
            console.log(`⚠️ Geçersiz format, atlıyor...`);
            continue;
          }

          // Chapter bilgilerini parse et
          const chapterInfo = parseChapterInfo(filePath, source);
          if (!chapterInfo) {
            console.log(`⚠️ Chapter bilgisi parse edilemedi, atlıyor...`);
            continue;
          }

          const { chapter, subChapter } = chapterInfo;
          console.log(`📋 Chapter: ${chapter}, SubChapter: ${subChapter}`);

          // Eski soruları sil
          await db.execute(
            "DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE chapter_id = ? AND sub_chapter_id = ? AND source = ?)",
            [chapter, subChapter, source]
          );
          await db.execute(
            "DELETE FROM questions WHERE chapter_id = ? AND sub_chapter_id = ? AND source = ?",
            [chapter, subChapter, source]
          );

          // Alt bölümü ekle/güncelle
          const subChapterTitle =
            data.subChapterTitle ||
            `${source.toUpperCase()} Chapter ${chapter}.${subChapter
              .split("-")
              .slice(1)
              .join(".")}`;
          await db.execute(
            "INSERT INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?) AS new_values ON DUPLICATE KEY UPDATE title = new_values.title",
            [subChapter, chapter, subChapterTitle]
          );

          // Soruları ekle
          let questionCount = 0;
          for (const soru of data.questions) {
            const question = soru.question || "";
            const explanation = soru.explanation || "";

            // Soru ekle (source field eklenmeli)
            const [result] = await db.execute(
              "INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation, source) VALUES (?, ?, ?, ?, ?)",
              [chapter, subChapter, question, explanation, source]
            );

            const questionId = result.insertId;

            // Seçenekleri ekle
            if (soru.options && Array.isArray(soru.options)) {
              for (let i = 0; i < soru.options.length; i++) {
                const secenek = soru.options[i];
                const optionText = secenek.text || "";
                const isCorrect = secenek.correct || false;

                await db.execute(
                  "INSERT INTO question_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)",
                  [questionId, optionText, i + 1, isCorrect]
                );
              }
            }

            questionCount++;
          }

          console.log(`✅ ${questionCount} soru eklendi`);
          totalImported += questionCount;
          totalFiles++;
        } catch (fileError) {
          console.error(`❌ Dosya hatası (${filePath}):`, fileError.message);
        }
      }
    }

    console.log(`\n🎉 TAMAMLANDI!`);
    console.log(`📊 Toplam ${totalFiles} dosya işlendi`);
    console.log(`📊 Toplam ${totalImported} soru eklendi`);

    // Özet kontrol
    const [summary] = await db.execute(
      "SELECT source, COUNT(*) as toplam FROM questions GROUP BY source"
    );

    console.log("\n📈 ÖZET:");
    for (const row of summary) {
      console.log(`  ${row.source}: ${row.toplam} soru`);
    }

    await db.end();
  } catch (error) {
    console.error("❌ GENEL HATA:", error.message);
    console.error(error.stack);
  }
}

importAllFiles();
