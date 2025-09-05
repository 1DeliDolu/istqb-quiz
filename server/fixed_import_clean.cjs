const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function getAllJsonFiles(baseDir) {
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

function parseChapterInfo(filePath, source, data = null) {
  // If we have JSON data, use that first (more reliable)
  if (data && data.chapter && data.subChapter) {
    return {
      chapter: data.chapter,
      subChapter: data.subChapter,
    };
  }

  // Fallback to filename parsing for ISTQB files
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
  } else if (source === "udemy") {
    const match = fileName.match(/udemy_(\d+)_(\d+)/);
    if (match) {
      const [, ch, sub] = match;
      return { chapter: `udemy_${ch}`, subChapter: `udemy_${ch}_${sub}` };
    }
  } else if (source === "fragen") {
    const match = fileName.match(/(\d+)_(\d+)/);
    if (match) {
      const [, ch, sub] = match;
      return { chapter: ch, subChapter: `${ch}-${sub}` };
    }
  }

  return null;
}

// Database'deki mevcut bölümleri kontrol et
async function checkDatabaseStructure(db) {
  console.log("\n🔍 Database yapısı kontrol ediliyor...");

  try {
    // Chapters tablosunu kontrol et
    const [chapters] = await db.execute("SELECT * FROM chapters ORDER BY id");
    console.log(`📚 Mevcut chapters: ${chapters.length} adet`);

    // Sub-chapters tablosunu kontrol et
    const [subChapters] = await db.execute(
      "SELECT * FROM sub_chapters ORDER BY id"
    );
    console.log(`📖 Mevcut sub-chapters: ${subChapters.length} adet`);

    // Questions tablosundaki source'ları kontrol et
    const [sources] = await db.execute(
      "SELECT DISTINCT source FROM questions WHERE source IS NOT NULL"
    );
    console.log(
      `📊 Mevcut sources: ${sources.map((s) => s.source).join(", ")}`
    );

    return {
      chapters: chapters.map((c) => c.id.toString()),
      subChapters: subChapters.map((sc) => sc.id),
      sources: sources.map((s) => s.source),
    };
  } catch (error) {
    console.error("❌ Database yapısı kontrol hatası:", error.message);
    return null;
  }
}

// JSON dosyalarından beklenen bölümleri çıkar
async function extractExpectedChapters(baseDir, sources) {
  console.log("\n🔍 JSON dosyalarından bölümler çıkarılıyor...");

  const expectedChapters = new Set();
  const expectedSubChapters = new Set();
  const chapterDetails = [];

  for (const source of sources) {
    const sourceDir = path.join(baseDir, source);

    if (!fs.existsSync(sourceDir)) {
      console.log(`⚠️ ${source} klasörü bulunamadı, atlıyor...`);
      continue;
    }

    const jsonFiles = await getAllJsonFiles(sourceDir);

    for (const filePath of jsonFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const chapterInfo = parseChapterInfo(filePath, source, data);

        if (chapterInfo) {
          expectedChapters.add(chapterInfo.chapter);
          expectedSubChapters.add(chapterInfo.subChapter);

          chapterDetails.push({
            source,
            chapter: chapterInfo.chapter,
            subChapter: chapterInfo.subChapter,
            title:
              data.subChapterTitle ||
              `${source.toUpperCase()} Chapter ${
                chapterInfo.chapter
              }.${chapterInfo.subChapter.split("-").slice(1).join(".")}`,
            questionCount: data.questions ? data.questions.length : 0,
            filePath: path.relative(baseDir, filePath),
          });
        }
      } catch (error) {
        console.log(`⚠️ Dosya okuma hatası (${filePath}):`, error.message);
      }
    }
  }

  return {
    chapters: Array.from(expectedChapters).sort(
      (a, b) => parseInt(a) - parseInt(b)
    ),
    subChapters: Array.from(expectedSubChapters).sort(),
    details: chapterDetails,
  };
}

// Database ve JSON dosyalarını karşılaştır
async function compareStructures(dbStructure, expectedStructure) {
  console.log("\n⚖️ Yapılar karşılaştırılıyor...");

  const issues = [];

  // Chapters karşılaştırması
  const missingChapters = expectedStructure.chapters.filter(
    (ch) => !dbStructure.chapters.includes(ch)
  );
  const extraChapters = dbStructure.chapters.filter(
    (ch) => !expectedStructure.chapters.includes(ch)
  );

  if (missingChapters.length > 0) {
    issues.push({
      type: "missing_chapters",
      message: `❌ Database'de eksik chapters: ${missingChapters.join(", ")}`,
      data: missingChapters,
    });
  }

  if (extraChapters.length > 0) {
    issues.push({
      type: "extra_chapters",
      message: `⚠️ Database'de fazla chapters: ${extraChapters.join(", ")}`,
      data: extraChapters,
    });
  }

  // Sub-chapters karşılaştırması
  const missingSubChapters = expectedStructure.subChapters.filter(
    (sc) => !dbStructure.subChapters.includes(sc)
  );
  const extraSubChapters = dbStructure.subChapters.filter(
    (sc) => !expectedStructure.subChapters.includes(sc)
  );

  if (missingSubChapters.length > 0) {
    issues.push({
      type: "missing_sub_chapters",
      message: `❌ Database'de eksik sub-chapters: ${missingSubChapters.join(
        ", "
      )}`,
      data: missingSubChapters,
    });
  }

  if (extraSubChapters.length > 0) {
    issues.push({
      type: "extra_sub_chapters",
      message: `⚠️ Database'de fazla sub-chapters: ${extraSubChapters.join(
        ", "
      )}`,
      data: extraSubChapters,
    });
  }

  // Sonuçları yazdır
  if (issues.length === 0) {
    console.log("✅ Database yapısı JSON dosyalarıyla uyumlu!");
  } else {
    console.log("❌ Database yapısında uyumsuzluklar bulundu:");
    issues.forEach((issue) => console.log(`  ${issue.message}`));
  }

  // Detaylı bilgi
  console.log(`\n📊 Beklenen yapı:`);
  console.log(
    `  Chapters: ${
      expectedStructure.chapters.length
    } adet (${expectedStructure.chapters.join(", ")})`
  );
  console.log(`  Sub-chapters: ${expectedStructure.subChapters.length} adet`);
  console.log(`  Toplam dosya: ${expectedStructure.details.length} adet`);

  expectedStructure.details.forEach((detail) => {
    console.log(
      `    📄 ${detail.filePath} → Chapter ${detail.chapter}, Sub ${detail.subChapter} (${detail.questionCount} soru)`
    );
  });

  return issues;
}

async function importAllFiles() {
  console.log("🚀 Database kontrollü import başlıyor...");

  try {
    // MySQL bağlan
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Source kolonu ekle (eğer yoksa)
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

    // 1. Database yapısını kontrol et
    const dbStructure = await checkDatabaseStructure(db);
    if (!dbStructure) {
      throw new Error("Database yapısı kontrol edilemedi");
    }

    // 2. JSON dosyalarından beklenen yapıyı çıkar
    const expectedStructure = await extractExpectedChapters(baseDir, sources);

    // 3. Yapıları karşılaştır
    const issues = await compareStructures(dbStructure, expectedStructure);

    // 4. Kritik hatalar varsa durdur
    const criticalIssues = issues.filter(
      (issue) =>
        issue.type === "missing_chapters" ||
        issue.type === "missing_sub_chapters"
    );

    if (criticalIssues.length > 0) {
      console.log("\n❌ KRİTİK HATALAR BULUNDU!");
      console.log(
        "Database'de eksik bölümler var. Önce bunları düzeltmeniz gerekiyor:"
      );

      criticalIssues.forEach((issue) => {
        console.log(`  ${issue.message}`);
        if (issue.type === "missing_chapters") {
          console.log(
            "    Çözüm: Bu chapter'ları chapters tablosuna manuel ekleyin:"
          );
          issue.data.forEach((ch) => {
            console.log(
              `    INSERT INTO chapters (id, title) VALUES ('${ch}', 'Chapter ${ch}');`
            );
          });
        }
        if (issue.type === "missing_sub_chapters") {
          console.log(
            "    Çözüm: Bu sub-chapter'ları sub_chapters tablosuna manuel ekleyin:"
          );
          issue.data.forEach((subCh) => {
            const chapterId = subCh.split("-")[0];
            console.log(
              `    INSERT INTO sub_chapters (id, chapter_id, title) VALUES ('${subCh}', '${chapterId}', 'Sub Chapter ${subCh}');`
            );
          });
        }
      });

      console.log("\n⚠️ Import durduruluyor. Önce database yapısını düzeltin.");
      await db.end();
      return;
    }

    // 5. Yapı uygunsa import'a devam et
    console.log("\n✅ Database yapısı uygun, import başlıyor...");

    let totalImported = 0;
    let totalFiles = 0;

    for (const source of sources) {
      const sourceDir = path.join(baseDir, source);

      if (!fs.existsSync(sourceDir)) {
        console.log(`⚠️ ${source} klasörü bulunamadı, atlıyor...`);
        continue;
      }

      console.log(`\n📁 ${source.toUpperCase()} klasörü işleniyor...`);
      const jsonFiles = await getAllJsonFiles(sourceDir);
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
          const chapterInfo = parseChapterInfo(filePath, source, data);
          if (!chapterInfo) {
            console.log(`⚠️ Chapter bilgisi parse edilemedi, atlıyor...`);
            continue;
          }

          const { chapter, subChapter } = chapterInfo;
          console.log(`📋 Chapter: ${chapter}, SubChapter: ${subChapter}`);

          // Database'de chapter/sub-chapter varlığını kontrol et
          const [chapterExists] = await db.execute(
            "SELECT COUNT(*) as count FROM chapters WHERE id = ?",
            [chapter]
          );

          if (chapterExists[0].count === 0) {
            console.log(
              `❌ Chapter ${chapter} database'de bulunamadı, atlıyor...`
            );
            continue;
          }

          const [subChapterExists] = await db.execute(
            "SELECT COUNT(*) as count FROM sub_chapters WHERE id = ?",
            [subChapter]
          );

          if (subChapterExists[0].count === 0) {
            console.log(
              `❌ Sub-chapter ${subChapter} database'de bulunamadı, atlıyor...`
            );
            continue;
          }

          // 1. Önce eski soruları sil (ASYNC/AWAIT ile sıralı)
          await db.execute(
            "DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE chapter_id = ? AND sub_chapter_id = ? AND source = ?)",
            [chapter, subChapter, source]
          );

          await db.execute(
            "DELETE FROM questions WHERE chapter_id = ? AND sub_chapter_id = ? AND source = ?",
            [chapter, subChapter, source]
          );
          console.log(`🗑️ Eski sorular silindi`);

          // 2. Sonra alt bölümü güncelle (başlık)
          const subChapterTitle =
            data.subChapterTitle ||
            `${source.toUpperCase()} Chapter ${chapter}.${subChapter
              .split("-")
              .slice(1)
              .join(".")}`;

          await db.execute("UPDATE sub_chapters SET title = ? WHERE id = ?", [
            subChapterTitle,
            subChapter,
          ]);
          console.log(`📝 Alt bölüm güncellendi: ${subChapterTitle}`);

          // 3. Son olarak soruları ekle (ASYNC/AWAIT ile sıralı)
          let questionCount = 0;
          for (const soru of data.questions) {
            const question = soru.question || "";
            const explanation = soru.explanation || "";

            try {
              // Soru ekle
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
            } catch (questionError) {
              console.error("❌ Soru ekleme hatası:", questionError.message);
            }
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

    console.log("\n📈 FINAL ÖZET:");
    for (const row of summary) {
      console.log(`  ${row.source}: ${row.toplam} soru`);
    }

    await db.end();
    console.log("✅ MySQL bağlantısı kapatıldı");
  } catch (error) {
    console.error("❌ GENEL HATA:", error.message);
    console.error(error.stack);
  }
}

importAllFiles();
