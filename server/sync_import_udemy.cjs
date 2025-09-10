const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function importUdemyQuestions() {
  try {
    console.log("🚀 Udemy sorularını database'e yükleme başlıyor...");

    // MySQL bağlantısı
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });

    console.log("✅ MySQL bağlantısı kuruldu");

    // Önce mevcut Udemy sorularını sil
    console.log("\n🗑️ Mevcut Udemy soruları siliniyor...");

    // Önce question_options tablosundan Udemy sorularının seçeneklerini sil
    const [deleteOptions] = await db.execute(`
      DELETE qo FROM question_options qo
      INNER JOIN questions q ON qo.question_id = q.id
      WHERE q.source = 'udemy'
    `);
    console.log(`   ✅ ${deleteOptions.affectedRows} seçenek silindi`);

    // Sonra questions tablosundan Udemy sorularını sil
    const [deleteQuestions] = await db.execute(`
      DELETE FROM questions WHERE source = 'udemy'
    `);
    console.log(`   ✅ ${deleteQuestions.affectedRows} Udemy sorusu silindi`);

    const udemyBaseDir = path.join(__dirname, "..", "json", "udemy");
    let totalImported = 0;

    // Udemy klasörünü işle
    console.log("\n📁 UDEMY klasörü işleniyor...");

    if (fs.existsSync(udemyBaseDir)) {
      const chapters = fs.readdirSync(udemyBaseDir);

      for (const chapterDir of chapters) {
        const chapterPath = path.join(udemyBaseDir, chapterDir);

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
                  // udemy_2_1.json -> chapter: udemy_2, subChapter: udemy_2_1
                  const match = file.match(/udemy_(\d+)_(\d+)\.json/);

                  if (match) {
                    const [, ch, sub] = match;
                    const chapterId = `udemy_${ch}`;
                    // Sub-chapter ID'yi başlığa göre bul (tercih edilen)
                    let subChapter = null;
                    const subTitle = data.subChapterTitle || null;
                    if (subTitle) {
                      try {
                        const [rows] = await db.execute(
                          "SELECT id FROM sub_chapters WHERE chapter_id = ? AND title = ? LIMIT 1",
                          [chapterId, subTitle]
                        );
                        if (rows.length > 0) {
                          subChapter = rows[0].id;
                        } else {
                          // LIKE ile dene
                          const [likeRows] = await db.execute(
                            "SELECT id FROM sub_chapters WHERE chapter_id = ? AND title LIKE ? LIMIT 1",
                            [chapterId, `%${subTitle}%`]
                          );
                          if (likeRows.length > 0) {
                            subChapter = likeRows[0].id;
                          }
                        }
                      } catch {}
                    }
                    // Son çare: tahmini id (udemy_<chapter>_quiz_<n>)
                    if (!subChapter) {
                      subChapter = `udemy_${ch}_quiz_${sub}`;
                    }

                    for (const q of data.questions) {
                      // Soru ekle
                      const [result] = await db.execute(
                        `INSERT INTO questions (
                          chapter_id, sub_chapter_id, question, explanation, source
                        ) VALUES (?, ?, ?, ?, ?)`,
                        [
                          chapterId,
                          subChapter,
                          q.question || "",
                          q.explanation || "",
                          "udemy",
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
    console.log(`📊 Toplam ${totalImported} Udemy sorusu database'e yüklendi`);

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

importUdemyQuestions();
