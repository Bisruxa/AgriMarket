/**
 * App-wide date formatting.
 * Amharic mode uses the Ethiopian (Ge'ez) 13-month calendar via Intl `ethiopic`.
 */

export type AppLanguage = 'en' | 'am';

export type AppDateStyle = 'short' | 'medium' | 'long';

const AM_LOCALE = 'am-ET';
const EN_LOCALE = 'en-US';
const ETHIOPIAN_CALENDAR = 'ethiopic';

function toDate(input: Date | string | number): Date | null {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function gregorianOptions(style: AppDateStyle): Intl.DateTimeFormatOptions {
  switch (style) {
    case 'short':
      return { day: 'numeric', month: 'short', year: 'numeric' };
    case 'long':
      return { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    case 'medium':
    default:
      return { day: 'numeric', month: 'long', year: 'numeric' };
  }
}

function ethiopianOptions(style: AppDateStyle): Intl.DateTimeFormatOptions {
  switch (style) {
    case 'short':
      return { calendar: ETHIOPIAN_CALENDAR, day: 'numeric', month: 'short', year: 'numeric' };
    case 'long':
      return {
        calendar: ETHIOPIAN_CALENDAR,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
    case 'medium':
    default:
      return { calendar: ETHIOPIAN_CALENDAR, day: 'numeric', month: 'long', year: 'numeric' };
  }
}

/** Format a calendar date (Gregorian in EN, Ethiopian in AM). */
export function formatAppDate(
  input: Date | string | number,
  language: AppLanguage,
  style: AppDateStyle = 'medium',
): string {
  const date = toDate(input);
  if (!date) return String(input);

  if (language === 'am') {
    try {
      return new Intl.DateTimeFormat(AM_LOCALE, ethiopianOptions(style)).format(date);
    } catch {
      // Older runtimes without ethiopic calendar
    }
  }

  return new Intl.DateTimeFormat(EN_LOCALE, gregorianOptions(style)).format(date);
}

/** Weekday only (Ethiopian calendar weekday when AM). */
export function formatAppWeekday(input: Date | string | number, language: AppLanguage): string {
  const date = toDate(input);
  if (!date) return '';

  if (language === 'am') {
    try {
      return new Intl.DateTimeFormat(AM_LOCALE, {
        calendar: ETHIOPIAN_CALENDAR,
        weekday: 'long',
      }).format(date);
    } catch {
      /* fall through */
    }
  }

  return new Intl.DateTimeFormat(EN_LOCALE, { weekday: 'long' }).format(date);
}

/** Month + day (e.g. chart axis labels). */
export function formatAppMonthDay(input: Date | string | number, language: AppLanguage): string {
  const date = toDate(input);
  if (!date) return String(input);

  if (language === 'am') {
    try {
      return new Intl.DateTimeFormat(AM_LOCALE, {
        calendar: ETHIOPIAN_CALENDAR,
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      /* fall through */
    }
  }

  return new Intl.DateTimeFormat(EN_LOCALE, { month: 'short', day: 'numeric' }).format(date);
}

/** Wall-clock time (same clock; locale digits / labels). */
export function formatAppTime(
  input: Date | string | number,
  language: AppLanguage,
  options?: Pick<Intl.DateTimeFormatOptions, 'hour' | 'minute' | 'second' | 'hour12'>,
): string {
  const date = toDate(input);
  if (!date) return '';

  const locale = language === 'am' ? AM_LOCALE : EN_LOCALE;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language !== 'am',
    ...options,
  }).format(date);
}

/** Date + time for headers (Ethiopian date when AM). */
export function formatAppDateTime(input: Date | string | number, language: AppLanguage): string {
  const date = toDate(input);
  if (!date) return String(input);

  if (language === 'am') {
    try {
      const datePart = new Intl.DateTimeFormat(AM_LOCALE, {
        calendar: ETHIOPIAN_CALENDAR,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
      const timePart = formatAppTime(date, 'am', { hour12: false });
      return `${datePart} ${timePart}`;
    } catch {
      /* fall through */
    }
  }

  return new Intl.DateTimeFormat(EN_LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
