const { Router } = require('express');
const pool = require('../db');

const router = Router();

/**
 * Standard Wordle duplicate-letter algorithm:
 *
 * 1. First pass: mark all exact matches as "correct" and count remaining
 *    occurrences of each letter in the answer (letters not yet matched).
 * 2. Second pass: for each non-correct position, if the letter exists in the
 *    remaining pool, mark it "present" and decrement the pool; otherwise
 *    mark it "absent".
 */
function evaluateGuess(guess, answer) {
  const guessArr = guess.toUpperCase().split('');
  const answerArr = answer.toUpperCase().split('');
  const result = new Array(5).fill(null);

  // Count available letters in the answer (will be decremented as we match)
  const remaining = {};
  for (const ch of answerArr) {
    remaining[ch] = (remaining[ch] || 0) + 1;
  }

  // First pass: exact matches
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = { letter: guessArr[i], state: 'correct' };
      remaining[guessArr[i]]--;
    }
  }

  // Second pass: present / absent
  for (let i = 0; i < 5; i++) {
    if (result[i]) continue; // already marked correct

    const letter = guessArr[i];
    if (remaining[letter] && remaining[letter] > 0) {
      result[i] = { letter, state: 'present' };
      remaining[letter]--;
    } else {
      result[i] = { letter, state: 'absent' };
    }
  }

  return result;
}

router.post('/', async (req, res) => {
  try {
    const { dailyWordId, guess, playerId } = req.body;

    if (!dailyWordId || !guess || !playerId) {
      return res.status(400).json({
        valid: false,
        message: 'Campos obrigatórios: dailyWordId, guess, playerId',
      });
    }

    const normalized = guess.toUpperCase().trim();

    if (normalized.length !== 5 || !/^[A-ZÇÀ-Ú]+$/.test(normalized)) {
      return res.json({ valid: false, message: 'A palavra deve ter 5 letras' });
    }

    // Fetch the daily word
    const dailyResult = await pool.query(
      `SELECT w.word FROM daily_words dw
       JOIN words w ON w.id = dw.word_id
       WHERE dw.id = $1`,
      [dailyWordId]
    );

    if (dailyResult.rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message: 'Palavra do dia não encontrada',
      });
    }

    const answer = dailyResult.rows[0].word.toUpperCase();
    const result = evaluateGuess(normalized, answer);

    return res.json({ valid: true, result, answer });
  } catch (err) {
    console.error('POST /api/guess error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
