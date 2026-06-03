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

export type ToolName =
  | 'get_crop_recommendation'
  | 'get_price_forecast'
  | 'get_weather_forecast'
  | 'get_market_trends'
  | 'get_soil_analysis';

export interface ToolResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}
