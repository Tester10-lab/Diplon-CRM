import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useThemeStore() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('diplon_theme') as Theme) || 'dark';
  });

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('diplon_theme', newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return { theme, setTheme };
}
