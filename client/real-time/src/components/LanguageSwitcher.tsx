import React from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  disabled: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage, disabled }) => {
  const switchLanguage = (lang: Language) => {
    if (!disabled) {
      setLanguage(lang);
    }
  };

  return (
    <div className={`flex bg-gray-800 rounded-full p-1 border border-white/20 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        onClick={() => switchLanguage(Language.ENGLISH)}
        disabled={disabled}
        className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
          language === Language.ENGLISH ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
      <button
        onClick={() => switchLanguage(Language.AMHARIC)}
        disabled={disabled}
        className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
          language === Language.AMHARIC ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
        aria-label="Switch to Amharic"
      >
        አማርኛ
      </button>
    </div>
  );
};

export default LanguageSwitcher;