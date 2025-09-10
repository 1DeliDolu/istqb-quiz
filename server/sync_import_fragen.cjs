const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function importFragenQuestions() {
  console.log("📚 Fragen soruları MySQL'e yükleniyor...");

  let db;
  try {
    // Database connection
    db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Önce mevcut Fragen sorularını sil
    console.log("\n🗑️ Mevcut Fragen soruları siliniyor...");

    // Önce question_options tablosundan Fragen sorularının seçeneklerini sil
    const [deleteOptions] = await db.execute(`
      DELETE qo FROM question_options qo
      INNER JOIN questions q ON qo.question_id = q.id
      WHERE q.source = 'fragen'
    `);
    console.log(`   ✅ ${deleteOptions.affectedRows} seçenek silindi`);

    // Sonra questions tablosundan Fragen sorularını sil
    const [deleteQuestions] = await db.execute(`
      DELETE FROM questions WHERE source = 'fragen'
    `);
    console.log(`   ✅ ${deleteQuestions.affectedRows} Fragen sorusu silindi`);

    // Fragen JSON klasör yolu
    const fragenPath = path.join(__dirname, "..", "json", "fragen");
    const subFolders = ["Genel", "Deutsch", "Praxis", "Mixed"];

    let totalQuestions = 0;
    let totalFiles = 0;
    let fileDetails = [];

    for (const folder of subFolders) {
      const folderPath = path.join(fragenPath, folder);

      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️ Klasör bulunamadı: ${folder}`);
        continue;
      }

      console.log(`\n📁 ${folder} klasörü işleniyor...`);
      const files = fs.readdirSync(folderPath);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      for (const file of jsonFiles) {
        totalFiles++;
        const filePath = path.join(folderPath, file);

        try {
          // JSON dosyasını oku
          const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

          if (!jsonData.questions || !Array.isArray(jsonData.questions)) {
            console.log(
              `⚠️ Geçersiz format: ${file} - questions array bulunamadı`
            );
            continue;
          }

          // Database'den uygun sub-chapter ID'yi bul
          const [subChapterResult] = await db.execute(
            "SELECT id FROM sub_chapters WHERE chapter_id = ? AND title = ?",
            [jsonData.chapter, jsonData.subChapterTitle]
          );

          const subChapterId =
            subChapterResult.length > 0 ? subChapterResult[0].id : null;

          const questionCount = jsonData.questions.length;
          console.log(`📖 İşleniyor: ${file} (${questionCount} soru)`);
          console.log(
            `    🎯 Chapter: ${jsonData.chapter}, Sub: ${subChapterId}`
          );

          // Mevcut soruları sil (update için)
          if (subChapterId) {
            await db.execute(
              "DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE chapter_id = ? AND sub_chapter_id = ? AND source = 'fragen')",
              [jsonData.chapter, subChapterId]
            );

            await db.execute(
              "DELETE FROM questions WHERE chapter_id = ? AND sub_chapter_id = ? AND source = 'fragen'",
              [jsonData.chapter, subChapterId]
            );
          }

          if (questionCount > 0) {
            // Soruları ekle
            for (let i = 0; i < jsonData.questions.length; i++) {
              const question = jsonData.questions[i];

              console.log(
                `    Soru ekleniyor: "${question.question.substring(0, 50)}..."`
              );

              // Soru ekle
              const [questionResult] = await db.execute(
                "INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation, source) VALUES (?, ?, ?, ?, ?)",
                [
                  jsonData.chapter,
                  subChapterId,
                  question.question,
                  question.explanation || "",
                  "fragen",
                ]
              );

              const questionId = questionResult.insertId;
              console.log(`    ✅ Soru eklendi, ID: ${questionId}`);

              // Seçenekleri ekle
              if (question.options && Array.isArray(question.options)) {
                for (let j = 0; j < question.options.length; j++) {
                  const option = question.options[j];
                  await db.execute(
                    "INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)",
                    [questionId, option.text, option.correct ? 1 : 0, j + 1]
                  );
                }
                console.log(
                  `    ✅ ${question.options.length} seçenek eklendi`
                );
              }

              totalQuestions++;
            }
          }

          // Detayları kaydet
          fileDetails.push({
            folder,
            file,
            chapter: jsonData.chapter,
            subChapter: subChapterId,
            title: jsonData.subChapterTitle,
            questionCount: questionCount,
          });

          console.log(`✅ ${questionCount} soru eklendi`);
        } catch (error) {
          console.error(`❌ Dosya işlenirken hata: ${file}`, error.message);
        }
      }
    }

    // SONUÇ
    console.log(`\n📋 IMPORT SONUCU:`);
    console.log(`✅ Toplam dosya işlendi: ${totalFiles}`);
    console.log(`✅ Toplam soru eklendi: ${totalQuestions}`);

    console.log(`\n📋 Detaylar:`);
    fileDetails.forEach((detail) => {
      console.log(
        `  📄 ${detail.folder}/${detail.file}: ${detail.questionCount} soru`
      );
      console.log(
        `      Chapter: ${detail.chapter} | Sub: ${detail.subChapter}`
      );
      console.log(`      Title: ${detail.title}`);
    });

    // Database istatistikleri
    console.log("\n🔍 DEBUG: Final database kontrol başlıyor...");

    const [fragenStats] = await db.execute(
      "SELECT chapter_id, COUNT(*) as question_count FROM questions WHERE source = 'fragen' GROUP BY chapter_id ORDER BY chapter_id"
    );

    const [totalFragenQuestions] = await db.execute(
      "SELECT COUNT(*) as total FROM questions WHERE source = 'fragen'"
    );

    console.log(`\n📈 Database'deki Fragen soruları:`);
    if (fragenStats.length > 0) {
      fragenStats.forEach((stat) => {
        console.log(`  📚 ${stat.chapter_id}: ${stat.question_count} soru`);
      });
      console.log(`  🎯 TOPLAM FRAGEN: ${totalFragenQuestions[0].total} soru`);
    } else {
      console.log(`  ⚠️ Database'de henüz Fragen sorusu bulunmuyor`);
    }

    await db.end();
    console.log("\n✅ MySQL bağlantısı kapatıldı");
    console.log("🎉 Fragen soruları başarıyla yüklendi!");
  } catch (error) {
    console.error("❌ Import hatası:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    if (db) {
      try {
        await db.end();
      } catch (closeError) {
        console.error("❌ Database kapatma hatası:", closeError.message);
      }
    }
  }
}

// Script'i çalıştır
if (require.main === module) {
  importFragenQuestions();
}

module.exports = importFragenQuestions;
