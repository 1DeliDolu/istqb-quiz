const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'istqb_quiz_app',
  });

  const rows = [
    { id: 'udemy_6_quiz_16', chapter_id: 'udemy_6', title: '6.3 Quiz 16 - Testorganisation' },
    { id: 'udemy_6_quiz_17', chapter_id: 'udemy_6', title: '6.4 Quiz 17 - Risikomanagement' },
  ];

  for (const r of rows) {
    const [exists] = await db.query('SELECT 1 FROM sub_chapters WHERE id=?', [r.id]);
    if (exists.length === 0) {
      await db.query(
        'INSERT INTO sub_chapters (id, chapter_id, title, description) VALUES (?, ?, ?, ?)',
        [r.id, r.chapter_id, r.title, r.title]
      );
      console.log('Inserted', r.id);
    } else {
      console.log('Exists', r.id);
    }
  }

  await db.end();
})();

