const mysql = require("mysql2/promise");

async function addFragenChapters() {
  console.log("🔧 Fragen chapters ekleniyor...");

  try {
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Fragen chapters from fragenChapters.ts
    const fragenChapters = [
      {
        id: "fragen_genel",
        title: "Genel Test Soruları",
        description: "Çeşitli konularda genel test soruları",
        subChapters: [
          "Genel.1 Temel Kavramlar",
          "Genel.2 Test Teknikleri",
          "Genel.3 Test Yönetimi",
          "Genel.4 Pratik Uygulamalar",
        ],
      },
      {
        id: "fragen_deutsch",
        title: "Almanca Test Soruları",
        description: "Almanca dilinde hazırlanmış test soruları",
        subChapters: [
          "Deutsch.1 Grundlagen",
          "Deutsch.2 Fortgeschritten",
          "Deutsch.3 Praxis",
        ],
      },
      {
        id: "fragen_praxis",
        title: "Pratik Test Soruları",
        description: "Gerçek senaryolara dayalı pratik sorular",
        subChapters: [
          "Praxis.1 Web Testing",
          "Praxis.2 Mobile Testing",
          "Praxis.3 API Testing",
          "Praxis.4 Performance Testing",
        ],
      },
      {
        id: "fragen_mixed",
        title: "Karışık Sorular",
        description: "Çeşitli kaynaklardan derlenmiş sorular",
        subChapters: [
          "Mixed.1 Kolay Seviye",
          "Mixed.2 Orta Seviye",
          "Mixed.3 Zor Seviye",
        ],
      },
    ];

    console.log(`\n📚 ${fragenChapters.length} Fragen chapters ekleniyor...`);

    // Check existing chapters first
    const [existingChapters] = await db.execute(
      "SELECT id FROM chapters WHERE id LIKE 'fragen_%'"
    );
    console.log(`\n🔍 Mevcut Fragen chapters: ${existingChapters.length}`);

    // Add chapters
    for (const chapter of fragenChapters) {
      // Check if chapter already exists
      const [existing] = await db.execute(
        "SELECT id FROM chapters WHERE id = ?",
        [chapter.id]
      );

      if (existing.length === 0) {
        await db.execute(
          "INSERT INTO chapters (id, title, description) VALUES (?, ?, ?)",
          [chapter.id, chapter.title, chapter.description]
        );
        console.log(`✅ Chapter eklendi: ${chapter.id} - ${chapter.title}`);
      } else {
        console.log(`⚠️ Chapter zaten mevcut: ${chapter.id}`);
      }

      // Add sub-chapters
      for (const subChapterTitle of chapter.subChapters) {
        // Generate sub-chapter ID
        const subChapterId = subChapterTitle.replace(/\s+/g, "_").toLowerCase();
        const fullSubChapterId = `${chapter.id}_${subChapterId}`;

        // Check if sub-chapter already exists
        const [existingSub] = await db.execute(
          "SELECT id FROM sub_chapters WHERE id = ?",
          [fullSubChapterId]
        );

        if (existingSub.length === 0) {
          await db.execute(
            "INSERT INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?)",
            [fullSubChapterId, chapter.id, subChapterTitle]
          );
          console.log(
            `  ✅ Sub-chapter eklendi: ${fullSubChapterId} - ${subChapterTitle}`
          );
        } else {
          console.log(`  ⚠️ Sub-chapter zaten mevcut: ${fullSubChapterId}`);
        }
      }
    }

    // Final verification
    const [finalChapters] = await db.execute(
      "SELECT id, title FROM chapters WHERE id LIKE 'fragen_%' ORDER BY id"
    );
    const [finalSubChapters] = await db.execute(
      "SELECT id, title FROM sub_chapters WHERE chapter_id LIKE 'fragen_%' ORDER BY chapter_id, id"
    );

    console.log(`\n📊 SONUÇ:`);
    console.log(`✅ Fragen chapters: ${finalChapters.length}`);
    console.log(`✅ Fragen sub-chapters: ${finalSubChapters.length}`);

    console.log(`\n📋 Eklenen Chapters:`);
    finalChapters.forEach((chapter) => {
      console.log(`  📖 ${chapter.id}: ${chapter.title}`);
    });

    console.log(`\n📋 Eklenen Sub-chapters:`);
    finalSubChapters.forEach((subChapter) => {
      console.log(`    📄 ${subChapter.id}: ${subChapter.title}`);
    });

    await db.end();
    console.log("\n✅ MySQL bağlantısı kapatıldı");
    console.log("🎉 Fragen chapters başarıyla eklendi!");
  } catch (error) {
    console.error("❌ Hata:", error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  addFragenChapters();
}

module.exports = addFragenChapters;
