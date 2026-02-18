import React from 'react';

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
];

export default function Keyboard({ usedKeys, onKey, disabled }) {
  const handleClick = (key) => {
    if (key === 'enter') {
      onKey('Enter');
    } else if (key === 'backspace') {
      onKey('Backspace');
    } else {
      onKey(key);
    }
  };

  return (
    <div className="keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map((key) => {
            const state = usedKeys[key] || '';
            const isSpecial = key === 'enter' || key === 'backspace';
            const isAbsent = state === 'absent';
            let label = key.toUpperCase();
            if (key === 'backspace') label = '⌫';
            if (key === 'enter') label = 'ENTER';

            return (
              <button
                key={key}
                className={`key${state ? ` key--${state}` : ''}${isSpecial ? ' key--special' : ''}${isAbsent ? ' key--disabled' : ''}`}
                onClick={() => handleClick(key)}
                disabled={disabled || isAbsent}
                aria-label={key}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
