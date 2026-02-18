# Wordle PT-BR Design

## Overview
A Wordle clone with Brazilian Portuguese words, React frontend, Express API, PostgreSQL database, all Dockerized.

## Architecture
- **Frontend**: React (Vite) — game board, keyboard, animations, served by nginx
- **Backend**: Node.js + Express — REST API for daily word, guess validation, stats
- **Database**: PostgreSQL — word list, daily words, player stats, leaderboard
- **Infrastructure**: docker-compose with 3 services (frontend, api, db)

## Frontend
- 5x6 game grid with color-coded tiles (green/yellow/gray)
- On-screen keyboard with color state
- Flip animations on guess submission
- Win/loss modal with stats
- Leaderboard page
- Player identified by UUID in localStorage
- Responsive, mobile-friendly

## API Endpoints
- `GET /api/daily` — today's word metadata (not the word itself)
- `POST /api/guess` — validate guess, return letter states
- `POST /api/stats` — submit game result
- `GET /api/leaderboard` — top players by win streak
- `GET /api/stats/:playerId` — player stats

## Database Schema
- **words**: id, word, used_on
- **daily_words**: id, word_id, date
- **players**: id (UUID), nickname, created_at
- **game_results**: id, player_id, daily_word_id, won, attempts, completed_at

## Word List
- ~500 common 5-letter PT-BR words seeded on first run
- Daily word selected automatically
