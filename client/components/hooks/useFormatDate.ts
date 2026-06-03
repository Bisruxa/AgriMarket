'use client';

import { useCallback, useMemo } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  type AppDateStyle,
  type AppLanguage,
  formatAppDate,
  formatAppDateTime,
  formatAppMonthDay,
  formatAppTime,
  formatAppWeekday,
} from '@/lib/formatDate';

export function useFormatDate() {
  const { language } = useLanguage();
  const lang = (language === 'am' ? 'am' : 'en') as AppLanguage;

  const formatDate = useCallback(
    (input: Date | string | number, style: AppDateStyle = 'medium') =>
      formatAppDate(input, lang, style),
    [lang],
  );

  const formatMonthDay = useCallback(
    (input: Date | string | number) => formatAppMonthDay(input, lang),
    [lang],
  );

  const formatWeekday = useCallback(
    (input: Date | string | number) => formatAppWeekday(input, lang),
    [lang],
  );

  const formatTime = useCallback(
    (input: Date | string | number) => formatAppTime(input, lang),
    [lang],
  );

  const formatDateTime = useCallback(
    (input: Date | string | number) => formatAppDateTime(input, lang),
    [lang],
  );

  return useMemo(
    () => ({
      language: lang,
      formatDate,
      formatMonthDay,
      formatWeekday,
      formatTime,
      formatDateTime,
    }),
    [lang, formatDate, formatMonthDay, formatWeekday, formatTime, formatDateTime],
  );
}
