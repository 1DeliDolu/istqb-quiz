const mysql = require("mysql2/promise");

async function checkSubChapters() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "istqb_user",
    password: "istqb_password",
    database: "istqb_quiz_app",
  });

  console.log("\n=== UDEMY_2 Alt Bölümleri ===");
  const udemy2 = await db.query(`
    SELECT sc.id, sc.title, COUNT(q.id) as question_count
    FROM sub_chapters sc
    LEFT JOIN questions q ON sc.id = q.sub_chapter_id
    WHERE sc.chapter_id = 'udemy_2'
    GROUP BY sc.id, sc.title
    ORDER BY sc.id
  `);
  udemy2[0].forEach((row) => {
    console.log(
      `ID: ${row.id}, Title: "${row.title}", Questions: ${row.question_count}`
    );
  });

  console.log("\n=== ISTQB_2 Alt Bölümleri ===");
  const istqb2 = await db.query(`
    SELECT sc.id, sc.title, COUNT(q.id) as question_count
    FROM sub_chapters sc
    LEFT JOIN questions q ON sc.id = q.sub_chapter_id
    WHERE sc.chapter_id = 'istqb_2'
    GROUP BY sc.id, sc.title
    ORDER BY sc.id
  `);
  istqb2[0].forEach((row) => {
    console.log(
      `ID: ${row.id}, Title: "${row.title}", Questions: ${row.question_count}`
    );
  });

  console.log("\n=== ISTQB_3 Alt Bölümleri ===");
  const istqb3 = await db.query(`
    SELECT sc.id, sc.title, COUNT(q.id) as question_count
    FROM sub_chapters sc
    LEFT JOIN questions q ON sc.id = q.sub_chapter_id
    WHERE sc.chapter_id = 'istqb_3'
    GROUP BY sc.id, sc.title
    ORDER BY sc.id
  `);
  istqb3[0].forEach((row) => {
    console.log(
      `ID: ${row.id}, Title: "${row.title}", Questions: ${row.question_count}`
    );
  });

  await db.end();
}

checkSubChapters().catch(console.error);
