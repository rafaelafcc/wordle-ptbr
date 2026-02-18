import React, { useState, useEffect } from 'react';
import Stats from './Stats';

export default function Modal({ won, answer, stats, generateShareText, onClose }) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2 className="modal-title">
          {won ? 'Parabéns!' : 'Que pena!'}
        </h2>

        {!won && answer && (
          <p className="modal-answer">
            A palavra era: <strong>{answer.toUpperCase()}</strong>
          </p>
        )}

        <Stats stats={stats} />

        <div className="modal-footer">
          <div className="countdown-section">
            <p className="countdown-label">Próxima palavra em</p>
            <p className="countdown-timer">{countdown}</p>
          </div>
          <button className="share-btn" onClick={handleShare}>
            {copied ? 'Copiado!' : 'Compartilhar'}
          </button>
        </div>
      </div>
    </div>
  );
}
