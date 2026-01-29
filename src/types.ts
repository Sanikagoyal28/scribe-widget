import { GetSessionStatusResponse } from 'med-scribe-alliance-ts-sdk';

export type WidgetState = 'idle' | 'permission' | 'recording' | 'paused' | 'processing' | 'results' | 'error';

export interface ScribeWidgetConfig {
  apiKey: string;
  baseUrl: string;
  templates?: string[];
  languageHint?: string[];
  position?: { bottom?: number; right?: number; top?: number; left?: number };
  onResult?: (result: GetSessionStatusResponse) => void;
  onError?: (error: Error) => void;
  debug?: boolean;
}
