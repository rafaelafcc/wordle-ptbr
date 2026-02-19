const { Router } = require('express');
const pool = require('../db');

const router = Router();

// POST /api/stats — save game result
router.post('/', async (req, res) => {
  try {
    const { playerId, dailyWordId, won, attempts } = req.body;

    if (!playerId || !dailyWordId || won === undefined || !attempts) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: playerId, dailyWordId, won, attempts',
      });
    }

    // Upsert player
    await pool.query(
      `INSERT INTO players (id) VALUES ($1)
       ON CONFLICT (id) DO NOTHING`,
      [playerId]
    );

    // Insert game result (ignore duplicates)
    await pool.query(
      `INSERT INTO game_results (player_id, daily_word_id, won, attempts)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (player_id, daily_word_id) DO NOTHING`,
      [playerId, dailyWordId, won, attempts]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('POST /api/stats error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/stats/:playerId — fetch player statistics
router.get('/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    // Basic counts
    const totals = await pool.query(
      `SELECT
         COUNT(*)::int AS "gamesPlayed",
         COUNT(*) FILTER (WHERE won = true)::int AS "gamesWon"
       FROM game_results
       WHERE player_id = $1`,
      [playerId]
    );

    const { gamesPlayed, gamesWon } = totals.rows[0];

    // Guess distribution (only for wins)
    const distResult = await pool.query(
      `SELECT attempts, COUNT(*)::int AS count
       FROM game_results
       WHERE player_id = $1 AND won = true
       GROUP BY attempts
       ORDER BY attempts`,
      [playerId]
    );

    const guessDistribution = {};
    for (let i = 1; i <= 6; i++) guessDistribution[i] = 0;
    for (const row of distResult.rows) {
      guessDistribution[row.attempts] = row.count;
    }

    // Streaks: fetch results ordered by date
    const streakResult = await pool.query(
      `SELECT gr.won
       FROM game_results gr
       JOIN daily_words dw ON dw.id = gr.daily_word_id
       WHERE gr.player_id = $1
       ORDER BY dw.date ASC`,
      [playerId]
    );

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (const row of streakResult.rows) {
      if (row.won) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }
    currentStreak = tempStreak;

    return res.json({
      games_played: gamesPlayed,
      games_won: gamesWon,
      current_streak: currentStreak,
      max_streak: maxStreak,
      guess_distribution: guessDistribution,
    });
  } catch (err) {
    console.error('GET /api/stats/:playerId error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
