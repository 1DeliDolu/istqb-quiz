const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

function getAllJsonFiles(baseDir) {
  const jsonFiles = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️ Klasör bulunamadı: ${dir}`);
      return;
    }

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
  }
  return null;
}

// Synchronous version
function importAllFiles() {
  console.log("🚀 Senkron import başlıyor...");

  // MySQL bağlan (synchronous)
  const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "istqb_quiz_app",
  });

  console.log("✅ MySQL bağlantısı kuruldu");

  const baseDir = "../json";
  const sources = ["istqb"];

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

        // Source kolonu ekle (synchronous)
        try {
          db.query(
            "ALTER TABLE questions ADD COLUMN source VARCHAR(50) DEFAULT 'istqb'",
            (err, result) => {
              if (err && err.code !== "ER_DUP_FIELDNAME") {
                console.log("⚠️ Source kolonu hatası:", err.message);
              }
            }
          );
        } catch (e) {}

        // Eski soruları sil (synchronous)
        db.query(
          "DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE chapter_id = ? AND sub_chapter_id = ?)",
          [chapter, subChapter],
          (err, result) => {
            if (err) console.log("Silme hatası 1:", err.message);
          }
        );

        db.query(
          "DELETE FROM questions WHERE chapter_id = ? AND sub_chapter_id = ?",
          [chapter, subChapter],
          (err, result) => {
            if (err) console.log("Silme hatası 2:", err.message);
          }
        );

        // Alt bölümü ekle
        const subChapterTitle =
          data.subChapterTitle ||
          `${source.toUpperCase()} Chapter ${chapter}.${subChapter
            .split("-")
            .slice(1)
            .join(".")}`;

        // Soruları ekle
        let questionCount = 0;
        for (const soru of data.questions) {
          const question = soru.question || "";
          const explanation = soru.explanation || "";

          // Soru ekle
          db.query(
            "INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation, source) VALUES (?, ?, ?, ?, ?)",
            [chapter, subChapter, question, explanation, source],
            (err, result) => {
              if (err) {
                console.log("Soru ekleme hatası:", err.message);
                return;
              }

              const questionId = result.insertId;

              // Seçenekleri ekle
              if (soru.options && Array.isArray(soru.options)) {
                for (let i = 0; i < soru.options.length; i++) {
                  const secenek = soru.options[i];
                  const optionText = secenek.text || "";
                  const isCorrect = secenek.correct || false;

                  db.query(
                    "INSERT INTO question_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)",
                    [questionId, optionText, i + 1, isCorrect],
                    (err, result) => {
                      if (err)
                        console.log("Seçenek ekleme hatası:", err.message);
                    }
                  );
                }
              }
            }
          );

          questionCount++;
        }

        console.log(`✅ ${questionCount} soru işlendi`);
        totalImported += questionCount;
        totalFiles++;
      } catch (fileError) {
        console.error(`❌ Dosya hatası (${filePath}):`, fileError.message);
      }
    }
  }

  console.log(`\n🎉 TAMAMLANDI!`);
  console.log(`📊 Toplam ${totalFiles} dosya işlendi`);
  console.log(`📊 Toplam ${totalImported} soru işlendi`);

  // Bağlantıyı kapat
  setTimeout(() => {
    db.end();
    console.log("✅ MySQL bağlantısı kapatıldı");
  }, 5000);
}

// Script'i çalıştır
importAllFiles();
