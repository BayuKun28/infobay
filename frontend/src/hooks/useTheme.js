import { useState, useEffect } from 'react';

/**
 * Custom hook for theme management (light / dark mode)
 */
export function useTheme(defaultMode = 'light') {
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('infobay_theme_mode');
    return saved === 'dark' || saved === 'light' ? saved : defaultMode;
  });

  const isDark = themeMode === 'dark';

  const toggleThemeMode = () => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('infobay_theme_mode', next);
      return next;
    });
  };

  const setTheme = (mode) => {
    if (mode === 'dark' || mode === 'light') {
      setThemeMode(mode);
      localStorage.setItem('infobay_theme_mode', mode);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  return {
    themeMode,
    isDark,
    toggleThemeMode,
    setTheme,
  };
}
