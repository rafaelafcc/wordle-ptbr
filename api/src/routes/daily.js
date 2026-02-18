const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Check if there is already a daily word for today
    const existing = await pool.query(
      'SELECT id, date FROM daily_words WHERE date = $1',
      [today]
    );

    if (existing.rows.length > 0) {
      return res.json({
        id: existing.rows[0].id,
        date: today,
        letters: 5,
      });
    }

    // Pick a random word that has not been used yet
    const wordResult = await pool.query(
      `SELECT w.id FROM words w
       WHERE w.is_valid = true
         AND w.id NOT IN (SELECT word_id FROM daily_words)
       ORDER BY RANDOM()
       LIMIT 1`
    );

    if (wordResult.rows.length === 0) {
      return res.status(500).json({ error: 'Sem palavras disponíveis' });
    }

    const wordId = wordResult.rows[0].id;

    const inserted = await pool.query(
      'INSERT INTO daily_words (word_id, date) VALUES ($1, $2) RETURNING id',
      [wordId, today]
    );

    return res.json({
      id: inserted.rows[0].id,
      date: today,
      letters: 5,
    });
  } catch (err) {
    console.error('GET /api/daily error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
