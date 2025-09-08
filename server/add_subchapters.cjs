const mysql = require("mysql2/promise");

async function addMissingSubChapters() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Sifre123!",
    database: "istqb_quiz_app",
  });

  try {
    console.log("📝 Adding missing sub-chapters...");

    // Udemy sub-chapters ekle
    const udemySubChapters = [
      ["udemy_1_1", "udemy_1", "1.1 Quiz 1 - Grundlagen"],
      ["udemy_1_2", "udemy_1", "1.2 Quiz 2 - Grundlagen"],
      ["udemy_2_1", "udemy_2", "2.1 Quiz 1 - SDLC"],
      ["udemy_2_2", "udemy_2", "2.2 Quiz 2 - SDLC"],
      ["udemy_3_1", "udemy_3", "3.1 Quiz 1 - Statischer Test"],
      ["udemy_3_2", "udemy_3", "3.2 Quiz 2 - Statischer Test"],
      ["udemy_4_1", "udemy_4", "4.1 Quiz 1 - Testanalyse"],
      ["udemy_4_2", "udemy_4", "4.2 Quiz 2 - Testanalyse"],
      ["udemy_5_1", "udemy_5", "5.1 Quiz 1 - Management"],
      ["udemy_5_2", "udemy_5", "5.2 Quiz 2 - Management"],
      ["udemy_6_1", "udemy_6", "6.1 Quiz 1 - Testwerkzeuge"],
      ["udemy_6_2", "udemy_6", "6.2 Quiz 2 - Testwerkzeuge"],
      ["udemy_7_1", "udemy_7", "7.1 Quiz 1 - Praxis"],
      ["udemy_7_2", "udemy_7", "7.2 Quiz 2 - Praxis"],
      ["udemy_8_1", "udemy_8", "8.1 Quiz 1 - Final"],
      ["udemy_8_2", "udemy_8", "8.2 Quiz 2 - Final"],
    ];

    // Fragen sub-chapters ekle
    const fragenSubChapters = [
      ["fragen_genel_1", "fragen_genel", "Genel.1 Temel Kavramlar"],
      ["fragen_genel_2", "fragen_genel", "Genel.2 Test Teknikleri"],
      ["fragen_genel_3", "fragen_genel", "Genel.3 Test Yönetimi"],
      ["fragen_deutsch_1", "fragen_deutsch", "Deutsch.1 Grundlagen"],
      ["fragen_deutsch_2", "fragen_deutsch", "Deutsch.2 Techniken"],
      ["fragen_praxis_1", "fragen_praxis", "Praxis.1 Praktische Tests"],
      ["fragen_mixed_1", "fragen_mixed", "Mixed.1 Gemischte Fragen"],
    ];

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

    const allSubChapters = [
      ...udemySubChapters,
      ...fragenSubChapters,
      ...istqbSubChapters,
    ];

    for (const [id, chapterId, title] of allSubChapters) {
      try {
        await connection.execute(
          "INSERT IGNORE INTO sub_chapters (id, chapter_id, title) VALUES (?, ?, ?)",
          [id, chapterId, title]
        );
        console.log(`✅ Added sub-chapter: ${id} - ${title}`);
      } catch (error) {
        console.log(`⚠️ Skipped ${id}: ${error.message}`);
      }
    }

    console.log("🎉 Sub-chapters addition completed");
  } catch (error) {
    console.error("❌ Error adding sub-chapters:", error.message);
  } finally {
    await connection.end();
  }
}

addMissingSubChapters();
