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
          gamesPlayed: 0,
          gamesWon: 0,
          maxStreak: 0,
          _tempStreak: 0,
        };
      }
      const p = playersMap[pid];
      p.gamesPlayed++;
      if (row.won) {
        p.gamesWon++;
        p._tempStreak++;
        if (p._tempStreak > p.maxStreak) p.maxStreak = p._tempStreak;
      } else {
        p._tempStreak = 0;
      }
    }

    const players = Object.values(playersMap)
      .map(({ _tempStreak, ...rest }) => rest)
      .sort((a, b) => {
        // Primary: max streak descending
        if (b.maxStreak !== a.maxStreak) return b.maxStreak - a.maxStreak;
        // Secondary: win percentage descending
        const pctA = a.gamesPlayed ? a.gamesWon / a.gamesPlayed : 0;
        const pctB = b.gamesPlayed ? b.gamesWon / b.gamesPlayed : 0;
        return pctB - pctA;
      })
      .slice(0, 10);

    return res.json({ players });
  } catch (err) {
    console.error('GET /api/leaderboard error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
