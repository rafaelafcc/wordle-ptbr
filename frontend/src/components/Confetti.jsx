import React, { useMemo } from 'react';

const COLORS = ['#538d4e', '#b59f3b', '#f44336', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4'];

export default function Confetti({ count = 80 }) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: `${6 + Math.random() * 8}px`,
      shape: Math.random() > 0.5 ? '50%' : '0',
    }));
  }, [count]);

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.shape,
          }}
        />
      ))}
    </div>
  );
}
