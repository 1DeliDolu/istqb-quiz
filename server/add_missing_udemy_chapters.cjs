const mysql = require("mysql2/promise");

async function addMissingUdemyChapters() {
  console.log("🔧 Eksik Udemy chapters ekleniyor...");

  try {
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });
    console.log("✅ MySQL bağlandı");

    // Missing chapters
    const missingChapters = [
      {
        id: "udemy_7",
        title: "7. Testwerkzeuge",
        description: "Werkzeugunterstützung für das Testen",
      },
      {
        id: "udemy_8",
        title: "8. Komplette Probeklausuren",
        description: "Vollständige Übungsprüfungen",
      },
    ];

    console.log(
      `\n📚 ${missingChapters.length} eksik Udemy chapters ekleniyor...`
    );

    for (const chapter of missingChapters) {
      try {
        await db.execute(
          "INSERT INTO chapters (id, title, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description)",
          [chapter.id, chapter.title, chapter.description]
        );
        console.log(`✅ ${chapter.id}: ${chapter.title}`);
      } catch (error) {
        console.log(`⚠️ ${chapter.id} eklenirken hata:`, error.message);
      }
    }

    // Now add the missing sub-chapters
    const missingSubChapters = [
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
      `\n📖 ${missingSubChapters.length} eksik Udemy sub-chapters ekleniyor...`
    );

    for (const subChapter of missingSubChapters) {
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

    console.log("\n🎉 Eksik Udemy chapters ve sub-chapters eklendi!");

    await db.end();
    console.log("✅ MySQL bağlantısı kapatıldı");
  } catch (error) {
    console.error("❌ GENEL HATA:", error.message);
    console.error(error.stack);
  }
}

addMissingUdemyChapters();
