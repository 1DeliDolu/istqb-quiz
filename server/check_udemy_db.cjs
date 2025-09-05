const mysql = require("mysql2/promise");

async function checkDatabase() {
  try {
    const db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "istqb_quiz_app",
    });

    console.log("=== UDEMY CHAPTERS ===");
    const [udemyChapters] = await db.execute(
      "SELECT id, title FROM chapters WHERE id LIKE 'udemy%' ORDER BY id"
    );
    udemyChapters.forEach((ch) => console.log(`${ch.id}: ${ch.title}`));

    console.log("\n=== UDEMY SUB-CHAPTERS ===");
    const [udemySubChapters] = await db.execute(
      "SELECT id, chapter_id, title FROM sub_chapters WHERE chapter_id LIKE 'udemy%' ORDER BY id"
    );
    udemySubChapters.forEach((sc) =>
      console.log(`${sc.id} (${sc.chapter_id}): ${sc.title}`)
    );

    console.log("\n=== UDEMY QUESTIONS ===");
    const [udemyQuestions] = await db.execute(
      "SELECT chapter_id, sub_chapter_id, source, COUNT(*) as count FROM questions WHERE source = 'udemy' GROUP BY chapter_id, sub_chapter_id ORDER BY chapter_id, sub_chapter_id"
    );
    udemyQuestions.forEach((q) =>
      console.log(`${q.chapter_id}/${q.sub_chapter_id}: ${q.count} sorular`)
    );

    await db.end();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkDatabase();
