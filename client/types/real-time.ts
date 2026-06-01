export const Language = {
  ENGLISH: 'en',
  AMHARIC: 'am',
} as const;

export type Language = typeof Language[keyof typeof Language];

export type Voice = 'Orus' | 'Zephyr';

export const VOICE_LABELS: Record<Voice, string> = {
  Zephyr: 'Jerry',
  Orus: 'Tom',
};

export type LiveStatus = 'idle' | 'connecting' | 'connected' | 'error';
