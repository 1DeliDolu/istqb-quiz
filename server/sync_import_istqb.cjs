const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function importIstqbQuestions() {
  try {
    console.log("🚀 ISTQB sorularını database'e yükleme başlıyor...");

    // MySQL bağlantısı
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });

    console.log("✅ MySQL bağlantısı kuruldu");

    // Önce mevcut ISTQB sorularını sil
    console.log("\n🗑️ Mevcut ISTQB soruları siliniyor...");

    // Önce question_options tablosundan ISTQB sorularının seçeneklerini sil
    const [deleteOptions] = await db.execute(`
      DELETE qo FROM question_options qo
      INNER JOIN questions q ON qo.question_id = q.id
      WHERE q.source = 'istqb'
    `);
    console.log(`   ✅ ${deleteOptions.affectedRows} seçenek silindi`);

    // Sonra questions tablosundan ISTQB sorularını sil
    const [deleteQuestions] = await db.execute(`
      DELETE FROM questions WHERE source = 'istqb'
    `);
    console.log(`   ✅ ${deleteQuestions.affectedRows} ISTQB sorusu silindi`);

    const istqbBaseDir = path.join(__dirname, "..", "json", "istqb");
    let totalImported = 0;

    // ISTQB klasörünü işle
    console.log("\n📁 ISTQB klasörü işleniyor...");

    if (fs.existsSync(istqbBaseDir)) {
      const chapters = fs.readdirSync(istqbBaseDir);

      for (const chapterDir of chapters) {
        const chapterPath = path.join(istqbBaseDir, chapterDir);

        if (fs.statSync(chapterPath).isDirectory()) {
          console.log(`\n📂 ${chapterDir} işleniyor...`);
          const files = fs.readdirSync(chapterPath);

          for (const file of files) {
            if (file.endsWith(".json")) {
              const filePath = path.join(chapterPath, file);
              console.log(`  📄 ${file} yükleniyor...`);

              try {
                const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

                if (data.questions && Array.isArray(data.questions)) {
                  // questions_1_1_clean.json -> chapter: istqb_1, subChapter: istqb_1_1
                  const match = file.match(
                    /questions_(\d+)_(\d+)(?:_(\d+))?(?:_(\d+))?_clean\.json/
                  );

                  if (match) {
                    const [, ch, sub1, sub2, sub3] = match;
                    // Canlı veritabanında ISTQB chapter id'leri 'istqb_1' formatında tutuluyor
                    const chapterId = `istqb_${ch}`;
                    // Sub-chapter id'leri 'istqb_1_1-1' veya daha derin ('istqb_1_1-1-1') formatında
                    let subChapterCore = `${ch}-${sub1}`;
                    if (sub2) subChapterCore += `-${sub2}`;
                    if (sub3) subChapterCore += `-${sub3}`;
                    const subChapter = `istqb_${ch}_${subChapterCore}`;

                    // Uyumlu sub_chapter_id'yi doğrula veya NULL'a düş
                    let targetSubChapterId = subChapter;
                    try {
                      const [rows] = await db.execute(
                        "SELECT 1 FROM sub_chapters WHERE id = ? LIMIT 1",
                        [subChapter]
                      );
                      if (rows.length === 0) {
                        // En yakın üst başlığa gerile (ör. 2-1-2 -> 2-1)
                        const parts = subChapterCore.split("-");
                        while (parts.length > 1) {
                          parts.pop();
                          const candidate = `istqb_${ch}_` + parts.join("-");
                          const [cRows] = await db.execute(
                            "SELECT 1 FROM sub_chapters WHERE id = ? LIMIT 1",
                            [candidate]
                          );
                          if (cRows.length > 0) {
                            targetSubChapterId = candidate;
                            break;
                          }
                        }
                        // Hâlâ bulunamadıysa NULL kullan (FK SET NULL)
                        if (parts.length <= 1 && targetSubChapterId === subChapter) {
                          targetSubChapterId = null;
                        }
                      }
                    } catch (e) {
                      targetSubChapterId = null;
                    }

                    for (const q of data.questions) {
                      // Soru ekle
                      const [result] = await db.execute(
                        `INSERT INTO questions (
                          chapter_id, sub_chapter_id, question, explanation, source
                        ) VALUES (?, ?, ?, ?, ?)`,
                        [
                          chapterId,
                          targetSubChapterId,
                          q.question || "",
                          q.explanation || "",
                          "istqb",
                        ]
                      );

                      const questionId = result.insertId;

                      // Seçenekleri ekle
                      if (q.options && Array.isArray(q.options)) {
                        for (let i = 0; i < q.options.length; i++) {
                          const option = q.options[i];
                          await db.execute(
                            `INSERT INTO question_options (
                              question_id, option_text, option_order, is_correct
                            ) VALUES (?, ?, ?, ?)`,
                            [
                              questionId,
                              option.text || "",
                              i + 1,
                              option.correct || false,
                            ]
                          );
                        }
                      }
                    }

                    totalImported += data.questions.length;
                    console.log(`    ✅ ${data.questions.length} soru eklendi`);
                  }
                }
              } catch (fileError) {
                console.error(
                  `    ❌ Dosya hatası (${file}):`,
                  fileError.message
                );
              }
            }
          }
        }
      }
    }

    console.log(`\n🎉 TAMAMLANDI!`);
    console.log(`📊 Toplam ${totalImported} ISTQB sorusu database'e yüklendi`);

    // Özet göster
    const [summary] = await db.execute(
      "SELECT source, COUNT(*) as toplam FROM questions GROUP BY source"
    );

    console.log("\n📈 DATABASE ÖZET:");
    for (const row of summary) {
      console.log(`  ${row.source}: ${row.toplam} soru`);
    }

    await db.end();
  } catch (error) {
    console.error("❌ GENEL HATA:", error.message);
    console.error(error.stack);
  }
}

importIstqbQuestions();
