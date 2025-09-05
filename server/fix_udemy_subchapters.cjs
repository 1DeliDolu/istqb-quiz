const mysql = require("mysql2/promise");

async function fixUdemySubChapters() {
  console.log("🔧 Udemy sub-chapters ekleniyor...");

  try {
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Udemy sub-chapters that need to be added
    const udemySubChapters = [
      // Chapter udemy_1
      {
        id: "udemy_1_1",
        chapter_id: "udemy_1",
        title: "1.1 Über den Ausbilder",
      },
      {
        id: "udemy_1_2",
        chapter_id: "udemy_1",
        title: "1.2 ISTQB-Prüfung - Einführung und Ablauf",
      },

      // Chapter udemy_2
      {
        id: "udemy_2_1",
        chapter_id: "udemy_2",
        title: "2.1 Quiz 1 - Grundlagen",
      },
      {
        id: "udemy_2_2",
        chapter_id: "udemy_2",
        title: "2.2 Quiz 2 - Grundlagen",
      },
      {
        id: "udemy_2_3",
        chapter_id: "udemy_2",
        title: "2.3 Quiz 3 - Testaktivitäten",
      },

      // Chapter udemy_3
      {
        id: "udemy_3_1",
        chapter_id: "udemy_3",
        title: "3.1 Quiz 4 - SDLC Grundlagen",
      },
      {
        id: "udemy_3_2",
        chapter_id: "udemy_3",
        title: "3.2 Quiz 5 - Teststufen",
      },
      {
        id: "udemy_3_3",
        chapter_id: "udemy_3",
        title: "3.3 Quiz 6 - Testarten",
      },

      // Chapter udemy_4
      {
        id: "udemy_4_1",
        chapter_id: "udemy_4",
        title: "4.1 Quiz 7 - Statische Analyse",
      },
      {
        id: "udemy_4_2",
        chapter_id: "udemy_4",
        title: "4.2 Quiz 8 - Review-Prozess",
      },
      {
        id: "udemy_4_3",
        chapter_id: "udemy_4",
        title: "4.3 Quiz 9 - Review-Arten",
      },

      // Chapter udemy_5
      {
        id: "udemy_5_1",
        chapter_id: "udemy_5",
        title: "5.1 Quiz 10 - Black-Box Verfahren",
      },
      {
        id: "udemy_5_2",
        chapter_id: "udemy_5",
        title: "5.2 Quiz 11 - White-Box Verfahren",
      },
      {
        id: "udemy_5_3",
        chapter_id: "udemy_5",
        title: "5.3 Quiz 12 - Testfallentwurf",
      },
      {
        id: "udemy_5_4",
        chapter_id: "udemy_5",
        title: "5.4 Quiz 13 - Äquivalenzklassen",
      },

      // Chapter udemy_6
      {
        id: "udemy_6_1",
        chapter_id: "udemy_6",
        title: "6.1 Quiz 14 - Testplanung",
      },
      {
        id: "udemy_6_2",
        chapter_id: "udemy_6",
        title: "6.2 Quiz 15 - Teststeuerung",
      },
      {
        id: "udemy_6_3",
        chapter_id: "udemy_6",
        title: "6.3 Quiz 16 - Testorganisation",
      },
      {
        id: "udemy_6_4",
        chapter_id: "udemy_6",
        title: "6.4 Quiz 17 - Risikomanagement",
      },

      // Chapter udemy_7
      {
        id: "udemy_7_1",
        chapter_id: "udemy_7",
        title: "7.1 Quiz 18 - Testwerkzeuge",
      },
      {
        id: "udemy_7_2",
        chapter_id: "udemy_7",
        title: "7.2 Quiz 19 - Testautomatisierung",
      },

      // Chapter udemy_8
      {
        id: "udemy_8_1",
        chapter_id: "udemy_8",
        title: "8.1 Beispielprüfung 1",
      },
      {
        id: "udemy_8_2",
        chapter_id: "udemy_8",
        title: "8.2 Beispielprüfung 2",
      },
      {
        id: "udemy_8_3",
        chapter_id: "udemy_8",
        title: "8.3 Beispielprüfung 3",
      },
    ];

    console.log(
      `\n📖 ${udemySubChapters.length} Udemy sub-chapters ekleniyor...`
    );

    for (const subChapter of udemySubChapters) {
      try {
        await db.execute(
          "INSERT INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)",
          [subChapter.id, subChapter.chapter_id, subChapter.title]
        );
        console.log(`✅ ${subChapter.id}: ${subChapter.title}`);
      } catch (error) {
        console.log(`⚠️ ${subChapter.id} eklenirken hata:`, error.message);
      }
    }

    console.log("\n🎉 Udemy sub-chapters eklendi!");

    // Kontrol et
    const [subChapters] = await db.execute(
      "SELECT COUNT(*) as count FROM sub_chapters WHERE chapter_id LIKE 'udemy%'"
    );

    console.log(`📊 Toplam Udemy sub-chapters: ${subChapters[0].count}`);

    await db.end();
    console.log("✅ MySQL bağlantısı kapatıldı");
  } catch (error) {
    console.error("❌ GENEL HATA:", error.message);
    console.error(error.stack);
  }
}

fixUdemySubChapters();
