import { useState, useEffect } from 'react';
import type { ThemeSettings } from '../types';
import { DEFAULT_THEME_SETTINGS } from '../utils';

export function useTheme(initialThemeSettings?: ThemeSettings | null) {
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');
  const [settings, setSettings] = useState<ThemeSettings>(initialThemeSettings || DEFAULT_THEME_SETTINGS);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nightmaremc_theme_mode');
    if (savedTheme) {
      setThemeMode(savedTheme as 'dark' | 'light' | 'system');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nightmaremc_theme_mode', themeMode);
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (themeMode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings) {
      root.style.setProperty('--color-primary', settings.primaryColor);
      root.style.setProperty('--color-secondary', settings.secondaryColor);
      root.style.setProperty('--color-accent', settings.accentColor);
      root.style.setProperty('--color-background', settings.backgroundColor);
      root.style.setProperty('--color-card', settings.cardColor);
      root.style.setProperty('--color-surface', settings.surfaceColor);
      root.style.setProperty('--color-border', settings.borderColor);
      root.style.setProperty('--color-text', settings.textColor);
      root.style.setProperty('--color-muted-text', settings.mutedTextColor);
      root.style.setProperty('--color-success', settings.successColor);
      root.style.setProperty('--color-warning', settings.warningColor);
      root.style.setProperty('--color-danger', settings.dangerColor);
      root.style.setProperty('--radius', settings.borderRadius);
    }
  }, [settings]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { themeMode, setThemeMode, toggleTheme, settings, setSettings };
}
