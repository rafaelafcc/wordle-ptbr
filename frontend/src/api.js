const API_URL = '/api';

export async function getDailyWord() {
  const res = await fetch(`${API_URL}/daily`);
  if (!res.ok) throw new Error('Failed to fetch daily word');
  return res.json();
}

export async function submitGuess(dailyWordId, guess, playerId) {
  const res = await fetch(`${API_URL}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dailyWordId,
      guess,
      playerId,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit guess');
  }
  if (data.valid === false) {
    throw new Error(data.message || 'Palavra inválida');
  }
  return data;
}

export async function submitStats(playerId, dailyWordId, won, attempts) {
  const res = await fetch(`${API_URL}/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId,
      dailyWordId,
      won,
      attempts,
    }),
  });
  if (!res.ok) throw new Error('Failed to submit stats');
  return res.json();
}

export async function getStats(playerId) {
  const res = await fetch(`${API_URL}/stats/${playerId}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getLeaderboard() {
  const res = await fetch(`${API_URL}/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}
