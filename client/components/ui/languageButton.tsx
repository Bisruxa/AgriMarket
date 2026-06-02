'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/components/hooks/useTranlations';

export function LanguageButton() {
  const { language, toggleLanguage } = useLanguage();
  const t = useTranslations();
  const d = t.dashboard.language;

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-black transition-colors duration-300 hover:bg-white/20"
      aria-label={language === 'en' ? d.switchToAmharic : d.switchToEnglish}
    >
      <Globe size={18} aria-hidden />
      <span className="text-sm font-medium">
        {language === 'en' ? d.labelWhenEn : d.labelWhenAm}
      </span>
    </button>
  );
}
