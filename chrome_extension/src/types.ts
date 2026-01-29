import { GetSessionStatusResponse } from 'med-scribe-alliance-ts-sdk';

export type WidgetState =
  | 'idle'
  | 'permission'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'results'
  | 'error'
  | 'polling_error';

export interface ScribeConfig {
  accessToken?: string;
  baseUrl: string;
  templates?: string[];
  languageHint?: string[];
  onResult?: (result: GetSessionStatusResponse) => void;
  onError?: (error: Error) => void;
  debug?: boolean;
}
