import React from 'react';
import Row from './Row';

export default function Board({ guesses, currentGuess, turn, isRevealing, shake, wordLength }) {
  return (
    <div className="board">
      {guesses.map((guess, i) => (
        <Row
          key={i}
          guess={guess}
          currentGuess={i === turn ? currentGuess : ''}
          isCurrentRow={i === turn}
          isRevealing={isRevealing && i === turn - 0}
          shake={shake}
          wordLength={wordLength}
        />
      ))}
    </div>
  );
}
