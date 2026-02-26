import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // 1. Instant initialization (Sync with LocalStorage/System)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'system';
    } catch {
      return 'system';
    }
  });

  // Keep a ref to the current theme to avoid closure staleness in listeners
  const themeRef = useRef(theme);

  // 2. The "Speed Demon" apply function
  const applyTheme = useCallback((targetTheme) => {
    const root = document.documentElement;
    let colorToApply = targetTheme;

    if (targetTheme === 'system') {
      colorToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Direct DOM injection is 100x faster than waiting for React's next tick
    root.classList.remove('light', 'dark');
    root.classList.add(colorToApply);
    root.style.colorScheme = colorToApply;
    
    return colorToApply;
  }, []);

  // 3. Optimized Toggle
  const setThemeMode = useCallback((newTheme) => {
    if (newTheme === themeRef.current) return;

    // Phase A: Instant UI Update (Zero lag)
    applyTheme(newTheme);
    
    // Phase B: Sync State & Storage (Background)
    setTheme(newTheme);
    themeRef.current = newTheme;
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {}
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const next = { light: 'dark', dark: 'system', system: 'light' };
    setThemeMode(next[themeRef.current]);
  }, [setThemeMode]);

  // 4. System Listener (Only if system mode is active)
  useEffect(() => {
    applyTheme(theme); // Initial sync

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeRef.current === 'system') applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const value = useMemo(() => ({
    theme,
    setThemeMode,
    toggleTheme,
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  }), [theme, setThemeMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};