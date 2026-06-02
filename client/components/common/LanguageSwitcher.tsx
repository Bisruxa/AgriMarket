'use client';

import React from 'react';
import { Language } from '@/types/real-time';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  disabled?: boolean;
}

export function LanguageSwitcher({ language, setLanguage, disabled }: LanguageSwitcherProps) {
  return (
    <div className={`flex bg-[#edf7f2] rounded-full p-0.5 border border-[#cde5d8] ${disabled ? 'opacity-50' : ''}`}>
      <button
        onClick={() => setLanguage(Language.ENGLISH)}
        disabled={disabled}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
          language === Language.ENGLISH
            ? 'bg-[#1b5933] text-white'
            : 'text-[#5e9c78] hover:bg-[#dcf2e5]'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage(Language.AMHARIC)}
        disabled={disabled}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
          language === Language.AMHARIC
            ? 'bg-[#1b5933] text-white'
            : 'text-[#5e9c78] hover:bg-[#dcf2e5]'
        }`}
      >
        አማ
      </button>
    </div>
  );
}
