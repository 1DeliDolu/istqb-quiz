const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path")              // Soru ekle - using source column like the working script
              const [questionResult] = await db.execute(
                "INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation, source) VALUES (?, ?, ?, ?, ?)",
                [
                  jsonData.chapter,
                  subChapterId,
                  question.question,
                  question.explanation || "",
                  "fragen"
                ]
              );function importFragenQuestions() {
  console.log("📚 Fragen soruları MySQL'e yükleniyor...");

  let db;
  try {
    // Database connection with auto-commit enabled
    db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Enable auto-commit
    await db.execute("SET AUTOCOMMIT = 1");

    // Fragen JSON klasör yolu
    const fragenPath = path.join(__dirname, "..", "json", "fragen");

    // Alt klasörleri kontrol et
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

      // Klasördeki JSON dosyalarını oku
      const files = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".json"));

      for (const file of files) {
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
          
          const subChapterId = subChapterResult.length > 0 ? subChapterResult[0].id : null;

          const questionCount = jsonData.questions.length;
          console.log(`🔄 İşleniyor: ${file} (${questionCount} soru)`);
          console.log(`    🎯 Chapter: ${jsonData.chapter}, Sub: ${subChapterId}`);

          // Mevcut soruları sil (update için)
          await db.execute(
            "DELETE FROM questions WHERE chapter_id = ? AND sub_chapter_id IS NULL",
            [jsonData.chapter]
          );

          if (questionCount > 0) {
            // Alt bölüm başlığını güncelle (varsa)
            await db.execute(
              "UPDATE sub_chapters SET title = ? WHERE chapter_id = ? AND id LIKE ?",
              [
                jsonData.subChapterTitle,
                jsonData.chapter,
                `%${jsonData.subChapter}%`,
              ]
            );

            // Soruları ekle
            for (let i = 0; i < jsonData.questions.length; i++) {
              const question = jsonData.questions[i];

              console.log(
                `    Soru ekleniyor: "${question.question.substring(0, 50)}..."`
              );

              // Soru ekle - using source column like the working script
              const [questionResult] = await db.execute(
                "INSERT INTO questions (chapter_id, sub_chapter_id, question, explanation, source) VALUES (?, ?, ?, ?, ?)",
                [
                  jsonData.chapter,
                  jsonData.subChapter,
                  question.question,
                  question.explanation || "",
                  "fragen",
                ]
              );

              const questionId = questionResult.insertId;
              console.log(`    ✅ Soru eklendi, ID: ${questionId}`);

              // DEBUG: Hemen kontrol et
              const [checkResult] = await db.execute(
                "SELECT COUNT(*) as count FROM questions WHERE id = ?",
                [questionId]
              );
              console.log(
                `    🔍 DEBUG: Soru DB'de kontrol edildi, bulunan: ${checkResult[0].count}`
              );

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
            }

            // Explicitly commit the transaction
            await db.execute("COMMIT");
          }

          totalQuestions += questionCount;
          totalFiles++;

          fileDetails.push({
            file: file,
            folder: folder,
            chapter: jsonData.chapter,
            subChapter: jsonData.subChapter,
            title: jsonData.subChapterTitle,
            questionCount: questionCount,
          });

          console.log(`✅ ${questionCount} soru eklendi`);
        } catch (error) {
          console.error(`❌ Dosya işlenirken hata: ${file}`, error.message);
        }
      }
    }

    // Sonuçları göster
    console.log(`\n📊 IMPORT SONUCU:`);
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

    // Tüm soruları göster
    const [allQuestions] = await db.execute(
      "SELECT id, chapter_id, question FROM questions ORDER BY id DESC LIMIT 10"
    );
    console.log("📋 Son 10 soru:");
    allQuestions.forEach((q) => {
      console.log(
        `  ID: ${q.id}, Chapter: ${q.chapter_id}, Soru: ${q.question.substring(
          0,
          50
        )}...`
      );
    });

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
