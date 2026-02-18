import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../api';

export default function Leaderboard({ onBack }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getLeaderboard();
        setLeaders(Array.isArray(data) ? data : data.leaderboard || []);
      } catch (err) {
        setError('Erro ao carregar o ranking.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <button className="back-btn" onClick={onBack}>← Voltar</button>
        <h2>Ranking</h2>
      </div>

      {loading && <p className="leaderboard-msg">Carregando...</p>}
      {error && <p className="leaderboard-msg">{error}</p>}

      {!loading && !error && leaders.length === 0 && (
        <p className="leaderboard-msg">Nenhum jogador ainda.</p>
      )}

      {!loading && !error && leaders.length > 0 && (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jogador</th>
              <th>Jogos</th>
              <th>Vitórias</th>
              <th>Sequência</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((player, i) => (
              <tr key={player.player_id || i}>
                <td className="rank">{i + 1}</td>
                <td>{player.nickname || 'Anônimo'}</td>
                <td>{player.games_played}</td>
                <td>{player.games_won}</td>
                <td>{player.current_streak || player.max_streak || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
