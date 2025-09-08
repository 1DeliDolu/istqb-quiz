const mysql = require("mysql2/promise");

async function addIstqbSubChapters() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Empty password like in connection.js
    database: "istqb_quiz_app",
  });

  try {
    console.log("📝 Adding ISTQB sub-chapters manually...");

    // Önce mevcut ISTQB sub-chapters'ı kontrol et
    const [existing] = await connection.execute(
      'SELECT id FROM sub_chapters WHERE id REGEXP "^[0-9]+-[0-9]+$"'
    );
    console.log(`📊 Existing ISTQB sub-chapters: ${existing.length}`);

    // ISTQB sub-chapters ekle
    const istqbSubChapters = [
      ["1-1", "1", "1.1 Was ist Testen"],
      ["1-2", "1", "1.2 Warum ist Testen notwendig"],
      ["1-3", "1", "1.3 Grundsätze des Testens"],
      ["1-4", "1", "1.4 Testaktivitäten, Testmittel und Rollen"],
      ["1-5", "1", "1.5 Wesentliche Kompetenzen"],
      ["2-1", "2", "2.1 Testen im Kontext eines SDLC"],
      ["2-2", "2", "2.2 Teststufen und Testarten"],
      ["2-3", "2", "2.3 Wartungstest"],
      ["3-1", "3", "3.1 Grundlagen des statischen Tests"],
      ["3-2", "3", "3.2 Verbesserungs-/Bewertungsprozess"],
      ["4-1", "4", "4.1 Grundlagen der Testanalyse und des Testentwurfs"],
      ["4-2", "4", "4.2 Black-Box-Testverfahren"],
      ["4-3", "4", "4.3 White-Box-Testverfahren"],
      ["4-4", "4", "4.4 Erfahrungsbasierte Testverfahren"],
      ["5-1", "5", "5.1 Testorganisation"],
      ["5-2", "5", "5.2 Testplanung und -steuerung"],
      ["5-3", "5", "5.3 Testfortschrittskontrolle und -berichterstattung"],
      ["5-4", "5", "5.4 Konfigurationsmanagement"],
      ["5-5", "5", "5.5 Risiken und Tests"],
      ["5-6", "5", "5.6 Fehlermanagement"],
      ["6-1", "6", "6.1 Überlegungen zu Testwerkzeugen"],
      ["6-2", "6", "6.2 Effektiver Einsatz von Werkzeugen"],
    ];

    for (const [id, chapterId, title] of istqbSubChapters) {
      try {
        await connection.execute(
          "INSERT IGNORE INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?)",
          [id, chapterId, title]
        );
        console.log(`✅ Added sub-chapter: ${id} - ${title}`);
      } catch (error) {
        console.log(`⚠️ Error adding ${id}: ${error.message}`);
      }
    }

    // Sonuç kontrol et
    const [result] = await connection.execute(
      'SELECT id, title FROM sub_chapters WHERE id REGEXP "^[0-9]+-[0-9]+$" ORDER BY id'
    );
    console.log(`📊 Total ISTQB sub-chapters after insert: ${result.length}`);
    result.forEach((row) => {
      console.log(`  ${row.id} - ${row.title}`);
    });
  } catch (error) {
    console.error("❌ Error adding sub-chapters:", error.message);
  } finally {
    await connection.end();
  }
}

addIstqbSubChapters();
