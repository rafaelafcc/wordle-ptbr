const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', async (_req, res) => {
  try {
    // For each player, compute max streak, games played, games won.
    // Streak calculation is done in application code because it requires
    // ordered iteration. We fetch all results grouped by player.
    const allResults = await pool.query(
      `SELECT gr.player_id, p.nickname, gr.won
       FROM game_results gr
       JOIN players p ON p.id = gr.player_id
       JOIN daily_words dw ON dw.id = gr.daily_word_id
       ORDER BY gr.player_id, dw.date ASC`
    );

    // Aggregate per player
    const playersMap = {};

    for (const row of allResults.rows) {
      const pid = row.player_id;
      if (!playersMap[pid]) {
        playersMap[pid] = {
          nickname: row.nickname || 'Anônimo',
          games_played: 0,
          games_won: 0,
          max_streak: 0,
          _tempStreak: 0,
        };
      }
      const p = playersMap[pid];
      p.games_played++;
      if (row.won) {
        p.games_won++;
        p._tempStreak++;
        if (p._tempStreak > p.max_streak) p.max_streak = p._tempStreak;
      } else {
        p._tempStreak = 0;
      }
    }

    const leaderboard = Object.values(playersMap)
      .map(({ _tempStreak, ...rest }) => rest)
      .sort((a, b) => {
        // Primary: max streak descending
        if (b.max_streak !== a.max_streak) return b.max_streak - a.max_streak;
        // Secondary: win percentage descending
        const pctA = a.games_played ? a.games_won / a.games_played : 0;
        const pctB = b.games_played ? b.games_won / b.games_played : 0;
        return pctB - pctA;
      })
      .slice(0, 10);

    return res.json({ leaderboard });
  } catch (err) {
    console.error('GET /api/leaderboard error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
