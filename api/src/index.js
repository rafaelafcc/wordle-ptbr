require('dotenv').config();

const express = require('express');
const cors = require('cors');

const dailyRoutes = require('./routes/daily');
const guessRoutes = require('./routes/guess');
const statsRoutes = require('./routes/stats');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/daily', dailyRoutes);
app.use('/api/guess', guessRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Wordle PT-BR API running on port ${PORT}`);
});
