'use client'
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('agrimarket-language');
      return savedLang === 'en' || savedLang === 'am' ? savedLang : 'en';
    }
    return 'en'; 
  });
  useEffect(() => {
    localStorage.setItem('agrimarket-language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };
  const contextValue = useMemo(() => ({
    language,
    toggleLanguage
  }), [language]);

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