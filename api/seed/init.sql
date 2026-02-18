CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(5) NOT NULL UNIQUE,
  is_valid BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS daily_words (
  id SERIAL PRIMARY KEY,
  word_id INTEGER REFERENCES words(id),
  date DATE NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY,
  nickname VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_results (
  id SERIAL PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  daily_word_id INTEGER REFERENCES daily_words(id),
  won BOOLEAN NOT NULL,
  attempts INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, daily_word_id)
);
