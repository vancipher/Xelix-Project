import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const LOW_IMPACT_THEMES = ['white', 'black', 'noir'];
const HIGH_IMPACT_THEMES = [
  'rain', 'sun', 'lavender', 'purple', 'nature', 'sea', 'horizon', 'mesa',
];
const THEMES = [...HIGH_IMPACT_THEMES, ...LOW_IMPACT_THEMES];
const DEFAULT_THEME = 'sun';
const DEFAULT_MIGRATION = 'xelix-default-rain-v1';

function initialTheme() {
  const stored = localStorage.getItem('xelix-theme');
  if (!localStorage.getItem(DEFAULT_MIGRATION)) {
    localStorage.setItem(DEFAULT_MIGRATION, '1');
    if (!stored || stored === 'white') return DEFAULT_THEME;
  }
  if (
    !stored
    || stored === 'athena'
    || stored === 'gold'
    || stored === 'orange'
    || stored === 'summit'
    || !THEMES.includes(stored)
  ) {
    return DEFAULT_THEME;
  }
  return stored;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('xelix-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        themes: THEMES,
        lowImpactThemes: LOW_IMPACT_THEMES,
        highImpactThemes: HIGH_IMPACT_THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
