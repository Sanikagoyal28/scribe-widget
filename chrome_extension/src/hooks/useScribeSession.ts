import { useState, useRef, useCallback, useEffect } from 'react';
import { WidgetState, ScribeConfig } from '../types';
import { ScribeClient, GetSessionStatusResponse } from 'med-scribe-alliance-ts-sdk';

interface UseScribeSessionReturn {
  state: WidgetState;
  elapsedTime: number;
  result: GetSessionStatusResponse | null;
  errorMessage: string;
  initializeSDK: () => Promise<void>;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<void>;
  retryPolling: () => Promise<void>;
  reset: () => void;
}

export function useScribeSession(config: ScribeConfig): UseScribeSessionReturn {
  const [state, setState] = useState<WidgetState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [result, setResult] = useState<GetSessionStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const clientRef = useRef<ScribeClient | null>(null);

  const log = useCallback(
    (...args: unknown[]) => {
      if (config.debug) {
        console.log('[EkaScribe]', ...args);
      }
    },
    [config.debug]
  );

  const showError = useCallback((message: string, isPollingError: boolean = false) => {
    setErrorMessage(message);
    setState(isPollingError ? 'polling_error' : 'error');
  }, []);

  const pollForResults = useCallback(async (): Promise<boolean> => {
    if (!clientRef.current) {
      showError('SDK not initialized. Please try again.', true);
      return false;
    }

    try {
      setState('processing');
      log('Polling for completion...');

      const finalResult = await clientRef.current.pollForCompletion(undefined, {
        maxAttempts: 60,
        intervalMs: 2000,
        onProgress: (status) => {
          log('Status update:', status.status);
        },
      });

      setResult(finalResult);
      log('Final result:', finalResult);

      setState('results');

      if (config.onResult) {
        config.onResult(finalResult);
      }

      return true;
    } catch (error) {
      log('Polling failed', error);
      showError('Failed to fetch results. Please retry.', true);
      if (config.onError && error instanceof Error) {
        config.onError(error);
      }
      return false;
    }
  }, [config, log, showError]);

  // Timer functions
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Initialize SDK
  const initializeSDK = useCallback(async () => {
    if (!config.baseUrl) {
      log('Skipping SDK init - no baseUrl provided');
      return;
    }

    try {
      ScribeClient.resetInstance();
      clientRef.current = ScribeClient.getInstance({
        accessToken: config.accessToken,
        baseUrl: config.baseUrl,
        debug: config.debug,
      });
      await clientRef.current.init();
      log('SDK initialized');
    } catch (error) {
      log('Failed to initialize SDK', error);
    }
  }, [config.accessToken, config.baseUrl, config.debug, log]);

  // Request microphone permission via content script
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      log('Requesting microphone permission...');
      const response = await chrome.runtime.sendMessage({
        action: 'GRANT_MICROPHONE_PERMISSION',
        target: 'content-script',
      });

      if (response?.granted) {
        log('Microphone permission granted');
        return true;
      } else {
        log('Microphone permission denied:', response?.error);
        return false;
      }
    } catch (error) {
      log('Error requesting microphone permission:', error);
      return false;
    }
  }, [log]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!config.baseUrl) {
      showError('API not configured. Please configure first.');
      return;
    }

    if (!clientRef.current) {
      showError('SDK not initialized. Please try again.');
      return;
    }

    setState('permission');

    // Request microphone permission
    const permissionGranted = await requestMicrophonePermission();

    if (!permissionGranted) {
      showError('Microphone access is required to record.');
      return;
    }

    // Permission granted - start SDK recording
    try {
      await clientRef.current.startRecording({
        templates: ['eka_emr_template'],
        languageHint: config.languageHint,
      });

      setState('recording');
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setElapsedTime(0);
      startTimer();

      log('Recording started');
    } catch (error) {
      log('Failed to start recording', error);
      showError('Failed to start recording. Please try again.');
    }
  }, [config.baseUrl, config.languageHint, log, showError, startTimer, requestMicrophonePermission]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (!clientRef.current) return;

    clientRef.current.pauseRecording();
    setState('paused');
    pausedTimeRef.current = Date.now();
    stopTimer();

    log('Recording paused');
  }, [log, stopTimer]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (!clientRef.current) return;

    clientRef.current.resumeRecording();
    setState('recording');

    if (pausedTimeRef.current) {
      startTimeRef.current += Date.now() - pausedTimeRef.current;
      pausedTimeRef.current = 0;
    }

    startTimer();

    log('Recording resumed');
  }, [log, startTimer]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      stopTimer();
      setState('processing');

      log('Stopping recording...');
      const endResponse = await clientRef.current.endRecording();
      log('Recording ended', endResponse);

      await pollForResults();
    } catch (error) {
      log('Failed to stop recording', error);
      showError('Failed to process recording. Please try again.');
      if (config.onError && error instanceof Error) {
        config.onError(error);
      }
    }
  }, [config, log, showError, stopTimer, pollForResults]);

  // Retry polling
  const retryPolling = useCallback(async () => {
    log('Retrying polling...');
    await pollForResults();
  }, [log, pollForResults]);

  const reset = useCallback(() => {
    setResult(null);
    setErrorMessage('');
    setElapsedTime(0);
    setState('idle');
  }, []);

  return {
    state,
    elapsedTime,
    result,
    errorMessage,
    initializeSDK,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    retryPolling,
    reset,
  };
}
