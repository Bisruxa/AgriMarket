'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

const STORAGE_KEY = 'agrimarket-language';

const LanguageContext = createContext(null);

function applyLanguageToDocument(lang) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.lang = lang === 'am' ? 'am' : 'en';
  root.classList.toggle('amharic', lang === 'am');
  document.body.classList.toggle('amharic', lang === 'am');
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved === 'am' || saved === 'en' ? saved : 'en';
    setLanguageState(initial);
    applyLanguageToDocument(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, language);
    applyLanguageToDocument(language);
  }, [language, ready]);

  const setLanguage = useCallback((lang) => {
    if (lang === 'en' || lang === 'am') {
      setLanguageState(lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'am' : 'en'));
  }, []);

  const contextValue = useMemo(
    () => ({
      language,
      toggleLanguage,
      setLanguage,
      ready,
    }),
    [language, toggleLanguage, setLanguage, ready]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
