import React from 'react';

export default function Tile({ letter, state, position, isRevealing }) {
  const delay = position * 300;

  let className = 'tile';
  if (letter && !state) className += ' tile--tbd';
  if (state) className += ` tile--${state}`;
  if (isRevealing && state) className += ' tile--reveal';

  return (
    <div
      className={className}
      style={isRevealing && state ? { animationDelay: `${delay}ms` } : {}}
    >
      <span className="tile-letter">{letter || ''}</span>
    </div>
  );
}
