import React from 'react';
import Tile from './Tile';

export default function Row({ guess, currentGuess, isCurrentRow, isRevealing, shake, wordLength }) {
  const tiles = [];

  for (let i = 0; i < wordLength; i++) {
    if (guess) {
      // Submitted guess
      tiles.push(
        <Tile
          key={i}
          letter={guess.result[i].letter}
          state={guess.result[i].state}
          position={i}
          isRevealing={isRevealing}
        />
      );
    } else if (isCurrentRow) {
      // Current input row
      tiles.push(
        <Tile
          key={i}
          letter={currentGuess[i] || ''}
          state={null}
          position={i}
          isRevealing={false}
        />
      );
    } else {
      // Empty row
      tiles.push(
        <Tile key={i} letter="" state={null} position={i} isRevealing={false} />
      );
    }
  }

  return (
    <div className={`row${shake && isCurrentRow ? ' row--shake' : ''}`}>
      {tiles}
    </div>
  );
}
