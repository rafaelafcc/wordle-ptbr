import React, { useState } from 'react';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import Modal from './components/Modal';
import Leaderboard from './components/Leaderboard';
import Confetti from './components/Confetti';
import useWordle from './hooks/useWordle';
import './App.css';

function App() {
  const [page, setPage] = useState('game');
  const [showModal, setShowModal] = useState(false);

  const {
    guesses,
    currentGuess,
    turn,
    gameOver,
    won,
    usedKeys,
    isRevealing,
    shake,
    errorMsg,
    stats,
    answer,
    loading,
    wordLength,
    addLetter,
    removeLetter,
    submitCurrentGuess,
    generateShareText,
  } = useWordle();

  // Show modal automatically when game ends
  React.useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => setShowModal(true), isRevealing ? 2000 : 500);
      return () => clearTimeout(timer);
    }
  }, [gameOver, isRevealing]);

  const handleKey = (key) => {
    if (key === 'Enter') {
      submitCurrentGuess();
    } else if (key === 'Backspace') {
      removeLetter();
    } else {
      addLetter(key);
    }
  };

  if (page === 'leaderboard') {
    return (
      <div className="app">
        <Leaderboard onBack={() => setPage('game')} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <button className="header-btn" onClick={() => setPage('leaderboard')}>
          {'🏆'}
        </button>
        <h1 className="title">WORDLE PT-BR</h1>
        <button
          className="header-btn"
          onClick={() => gameOver && setShowModal(true)}
          disabled={!gameOver}
        >
          {'📊'}
        </button>
      </header>

      {errorMsg && <div className="toast">{errorMsg}</div>}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <>
          <div className="board-container">
            <Board
              guesses={guesses}
              currentGuess={currentGuess}
              turn={turn}
              isRevealing={isRevealing}
              shake={shake}
              wordLength={wordLength}
            />
          </div>

          <Keyboard usedKeys={usedKeys} onKey={handleKey} disabled={isRevealing || gameOver} />

          {gameOver && won && <Confetti />}

          {showModal && gameOver && (
            <Modal
              won={won}
              answer={answer}
              stats={stats}
              generateShareText={generateShareText}
              onClose={() => setShowModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
