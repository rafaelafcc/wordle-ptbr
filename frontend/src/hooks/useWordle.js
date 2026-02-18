import { useState, useEffect, useCallback } from 'react';
import { getDailyWord, submitGuess, submitStats, getStats } from '../api';
import { getPlayerId } from '../utils/playerId';

const GAME_STATE_PREFIX = 'wordle-pt-br-state-';

function loadGameState(dateKey) {
  try {
    const raw = localStorage.getItem(GAME_STATE_PREFIX + dateKey);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveGameState(dateKey, state) {
  localStorage.setItem(GAME_STATE_PREFIX + dateKey, JSON.stringify(state));
}

export default function useWordle() {
  const [dailyWordId, setDailyWordId] = useState(null);
  const [dateKey, setDateKey] = useState(null);
  const [wordLength, setWordLength] = useState(5);
  const [guesses, setGuesses] = useState(Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [turn, setTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [usedKeys, setUsedKeys] = useState({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [stats, setStats] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch daily word on mount
  useEffect(() => {
    async function init() {
      try {
        const data = await getDailyWord();
        const id = data.id;
        const date = data.date;
        const length = data.letters || 5;

        setDailyWordId(id);
        setDateKey(date);
        setWordLength(length);

        // Restore saved state for this date
        const saved = loadGameState(date);
        if (saved && saved.dailyWordId === id) {
          setGuesses(saved.guesses);
          setTurn(saved.turn);
          setGameOver(saved.gameOver);
          setWon(saved.won);
          setUsedKeys(saved.usedKeys);
          setAnswer(saved.answer || '');
          if (saved.gameOver) {
            const playerStats = await getStats(getPlayerId()).catch(() => null);
            setStats(playerStats);
          }
        }
      } catch (err) {
        setErrorMsg('Erro ao carregar o jogo. Tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    if (dateKey && dailyWordId) {
      saveGameState(dateKey, {
        dailyWordId,
        guesses,
        turn,
        gameOver,
        won,
        usedKeys,
        answer,
      });
    }
  }, [dateKey, dailyWordId, guesses, turn, gameOver, won, usedKeys, answer]);

  const addLetter = useCallback((letter) => {
    if (gameOver || isRevealing) return;
    if (currentGuess.length < wordLength) {
      setCurrentGuess(prev => prev + letter.toLowerCase());
    }
  }, [gameOver, isRevealing, currentGuess, wordLength]);

  const removeLetter = useCallback(() => {
    if (gameOver || isRevealing) return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [gameOver, isRevealing]);

  const submitCurrentGuess = useCallback(async () => {
    if (gameOver || isRevealing) return;
    if (currentGuess.length !== wordLength) {
      setShake(true);
      setErrorMsg('Palavra incompleta');
      setTimeout(() => { setShake(false); setErrorMsg(''); }, 1000);
      return;
    }

    try {
      const playerId = getPlayerId();
      const result = await submitGuess(dailyWordId, currentGuess, playerId);

      // result.result is array of { letter, state }
      const guessData = {
        word: currentGuess,
        result: result.result,
      };

      setIsRevealing(true);

      const newGuesses = [...guesses];
      newGuesses[turn] = guessData;
      setGuesses(newGuesses);

      // Update used keys
      const newUsedKeys = { ...usedKeys };
      result.result.forEach(({ letter, state }) => {
        const key = letter.toLowerCase();
        const currentState = newUsedKeys[key];
        // Priority: correct > present > absent
        if (state === 'correct') {
          newUsedKeys[key] = 'correct';
        } else if (state === 'present' && currentState !== 'correct') {
          newUsedKeys[key] = 'present';
        } else if (state === 'absent' && !currentState) {
          newUsedKeys[key] = 'absent';
        }
      });
      setUsedKeys(newUsedKeys);

      const isWin = result.result.every(r => r.state === 'correct');
      const isLastTurn = turn === 5;

      // Wait for flip animation to finish
      setTimeout(async () => {
        setIsRevealing(false);
        setCurrentGuess('');
        setTurn(prev => prev + 1);

        if (isWin || isLastTurn) {
          if (result.answer) {
            setAnswer(result.answer);
          }

          // Submit stats before showing modal
          try {
            await submitStats(playerId, dailyWordId, isWin, turn + 1);
            const playerStats = await getStats(playerId);
            setStats(playerStats);
          } catch (e) {
            console.error('Failed to submit stats:', e);
          }

          setWon(isWin);
          setGameOver(true);
        }
      }, 5 * 300 + 250); // 5 tiles * 300ms stagger + 250ms buffer

    } catch (err) {
      setShake(true);
      setErrorMsg(err.message || 'Palavra inválida');
      setTimeout(() => { setShake(false); setErrorMsg(''); }, 1500);
    }
  }, [gameOver, isRevealing, currentGuess, wordLength, dailyWordId, turn, guesses, usedKeys]);

  // Physical keyboard handler
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        submitCurrentGuess();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeLetter();
      } else if (/^[a-zA-ZçÇ]$/.test(e.key)) {
        if (usedKeys[e.key.toLowerCase()] !== 'absent') {
          addLetter(e.key);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitCurrentGuess, removeLetter, addLetter, usedKeys]);

  const generateShareText = useCallback(() => {
    const emojiMap = {
      correct: '🟩',
      present: '🟨',
      absent: '⬛',
    };

    const rows = guesses
      .filter(g => g !== null)
      .map(g => g.result.map(r => emojiMap[r.state]).join(''))
      .join('\n');

    const attemptText = won ? `${turn}/6` : 'X/6';
    return `Wordle PT-BR ${dateKey} ${attemptText}\n\n${rows}`;
  }, [guesses, won, turn, dateKey]);

  return {
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
  };
}
