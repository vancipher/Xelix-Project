import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('xelix-lang') || 'en');

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.body.style.fontFamily = lang === 'ar'
      ? "var(--font-ar)"
      : "var(--font-en)";
    localStorage.setItem('xelix-lang', lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === 'en' ? 'ar' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
