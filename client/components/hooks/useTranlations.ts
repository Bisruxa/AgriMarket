'use client'
import { useLanguage } from '@/app/context/LanguageContext';
import { getTranslations } from '@/lib/translations';

export const useTranslations = () => {
  const { language } = useLanguage();
  return getTranslations(language);
};