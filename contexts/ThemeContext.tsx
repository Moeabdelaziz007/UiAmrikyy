import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes } from '../lib/themes';
 
interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}
 
// FIX: Export ThemeContext
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
 
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
 
  useEffect(() => {
    // Load saved theme from localStorage
    const savedThemeId = localStorage.getItem('amrikyy-theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    let initialTheme: Theme | undefined;
    if (savedThemeId) {
      initialTheme = themes.find(t => t.id === savedThemeId);
    } else if (systemPrefersDark) {
      // Find a dark theme as default if system prefers dark and no theme saved
      initialTheme = themes.find(t => t.mode === 'dark') || themes[0];
    } else {
      initialTheme = themes.find(t => t.mode === 'light') || themes[0];
    }

    if (initialTheme) {
        setCurrentTheme(initialTheme);
        applyThemeToCss(initialTheme);
    }

  }, []);

  const applyThemeToCss = (theme: Theme) => {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      // Set the data-theme attribute for global mode detection if needed
      root.setAttribute('data-theme-mode', theme.mode);
  };
 
  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('amrikyy-theme', themeId);
      applyThemeToCss(theme);
    }
  };
 
  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
 
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};