const mysql = require('mysql2/promise');

function normalizeChapterId(raw) {
  if (!raw) return raw;
  if (raw.startsWith('istqb_') || raw.startsWith('udemy_') || raw.startsWith('fragen_')) return raw;
  if (/^\d+$/.test(raw)) return `istqb_${raw}`;
  return raw;
}

function normalizeSubChapterId(chapterId, sub) {
  if (!sub) return null;
  if (typeof sub !== 'string') return sub;
  if (sub.startsWith('istqb_') || sub.startsWith('udemy_') || sub.startsWith('fragen_')) return sub;
  if (chapterId && chapterId.startsWith('istqb_')) {
    if (/^\d+(?:-\d+){1,3}$/.test(sub)) {
      return `${chapterId}_${sub}`;
    }
  }
  return sub;
}

(async () => {
  const db = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'istqb_quiz_app',
  });

  let updatedQP = 0,
    updatedUA = 0;

  // Helper to validate sub_chapter id and fallback to parent if necessary
  async function validateOrFallbackSub(chapterId, rawSub) {
    if (!rawSub) return null;
    // if already exists
    const [rows] = await db.query('SELECT 1 FROM sub_chapters WHERE id = ? LIMIT 1', [rawSub]);
    if (rows.length > 0) return rawSub;
    // try fallback to parent
    const parts = rawSub.replace(/^istqb_\d+_/, '').split('-');
    while (parts.length > 1) {
      parts.pop();
      const candidate = `${chapterId}_${parts.join('-')}`;
      const [c] = await db.query('SELECT 1 FROM sub_chapters WHERE id = ? LIMIT 1', [candidate]);
      if (c.length > 0) return candidate;
    }
    return null;
  }

  console.log('🔧 Migrating quiz_progress...');
  const [qp] = await db.query(
    `SELECT id, quiz_type, chapter_id, sub_chapter_id
     FROM quiz_progress
     WHERE quiz_type = 'istqb'
        OR chapter_id REGEXP '^[0-9]$'
        OR (sub_chapter_id IS NOT NULL AND sub_chapter_id REGEXP '^[0-9]+(-[0-9]+){1,3}$')`
  );

  for (const row of qp) {
    const normChapter = normalizeChapterId(row.chapter_id);
    let normSub = normalizeSubChapterId(normChapter, row.sub_chapter_id);
    if (normSub) {
      normSub = await validateOrFallbackSub(normChapter, normSub);
    }
    if (normChapter !== row.chapter_id || normSub !== row.sub_chapter_id) {
      await db.query(
        'UPDATE quiz_progress SET chapter_id = ?, sub_chapter_id = ? WHERE id = ?',
        [normChapter, normSub, row.id]
      );
      updatedQP++;
    }
  }
  console.log(`✅ quiz_progress updated: ${updatedQP}`);

  console.log('🔧 Migrating user_question_attempts...');
  const [ua] = await db.query(
    `SELECT id, chapter_id, sub_chapter_id
     FROM user_question_attempts
     WHERE chapter_id REGEXP '^(istqb_[0-9]|[0-9])$'
        OR (sub_chapter_id IS NOT NULL AND sub_chapter_id REGEXP '^[0-9]+(-[0-9]+){1,3}$')`
  );

  for (const row of ua) {
    const normChapter = normalizeChapterId(row.chapter_id);
    let normSub = normalizeSubChapterId(normChapter, row.sub_chapter_id);
    if (normSub) {
      normSub = await validateOrFallbackSub(normChapter, normSub);
    }
    if (normChapter !== row.chapter_id || normSub !== row.sub_chapter_id) {
      await db.query(
        'UPDATE user_question_attempts SET chapter_id = ?, sub_chapter_id = ? WHERE id = ?',
        [normChapter, normSub, row.id]
      );
      updatedUA++;
    }
  }
  console.log(`✅ user_question_attempts updated: ${updatedUA}`);

  await db.end();
  console.log('🎉 Migration completed');
})();

