import React from 'react';

export default function Stats({ stats }) {
  if (!stats) return null;

  const {
    games_played = 0,
    games_won = 0,
    current_streak = 0,
    max_streak = 0,
    guess_distribution = {},
  } = stats;

  const winPct = games_played > 0 ? Math.round((games_won / games_played) * 100) : 0;

  const maxDist = Math.max(...Object.values(guess_distribution), 1);

  return (
    <div className="stats">
      <h3>Estatísticas</h3>
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-value">{games_played}</span>
          <span className="stat-label">Jogos</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{winPct}</span>
          <span className="stat-label">% Vitórias</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{current_streak}</span>
          <span className="stat-label">Sequência Atual</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{max_streak}</span>
          <span className="stat-label">Maior Sequência</span>
        </div>
      </div>

      <h3>Distribuição de Tentativas</h3>
      <div className="guess-distribution">
        {[1, 2, 3, 4, 5, 6].map((num) => {
          const count = guess_distribution[num] || 0;
          const width = Math.max((count / maxDist) * 100, 8);
          return (
            <div key={num} className="dist-row">
              <span className="dist-label">{num}</span>
              <div className="dist-bar-container">
                <div
                  className={`dist-bar${count > 0 ? ' dist-bar--filled' : ''}`}
                  style={{ width: `${width}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
