'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'aipulse-theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'dark' : 'light');
  }, []);

  function apply(next: Theme) {
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setTheme(next);
  }

  const buttonBase: React.CSSProperties = {
    border: '0.5px solid var(--color-aip-border)',
    padding: '5px 10px',
    fontSize: 12,
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    cursor: 'pointer',
    lineHeight: 1,
  };

  function styleFor(value: Theme): React.CSSProperties {
    const selected = theme === value;
    return {
      ...buttonBase,
      background: selected ? 'var(--color-aip-score-bg)' : 'transparent',
      color: selected ? 'var(--color-aip-score-text)' : 'var(--color-aip-text)',
    };
  }

  return (
    <div style={{ display: 'inline-flex', gap: 6 }} aria-label="Theme">
      <button
        type="button"
        onClick={() => apply('light')}
        style={styleFor('light')}
        aria-pressed={theme === 'light'}
      >
        <Sun size={14} aria-hidden />
        Light
      </button>
      <button
        type="button"
        onClick={() => apply('dark')}
        style={styleFor('dark')}
        aria-pressed={theme === 'dark'}
      >
        <Moon size={14} aria-hidden />
        Dark
      </button>
    </div>
  );
}
