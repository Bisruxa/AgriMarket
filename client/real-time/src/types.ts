export const Language = {
  ENGLISH: 'en',
  AMHARIC: 'am',
} as const;

export type Language = typeof Language[keyof typeof Language];

export interface Message {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  // When true, message is a live, in-progress transcription (word-by-word)
  isPartial?: boolean;
}