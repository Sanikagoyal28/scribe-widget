import { useState, useRef, useCallback, useEffect } from 'react';
import { ScribeClient, GetSessionStatusResponse } from 'med-scribe-alliance-ts-sdk';
import { WidgetState, ScribeWidgetConfig } from '../types';

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

export function useScribeSession(config: ScribeWidgetConfig): UseScribeSessionReturn {
  const [state, setState] = useState<WidgetState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [result, setResult] = useState<GetSessionStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const clientRef = useRef<ScribeClient | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const log = useCallback(
    (...args: unknown[]) => {
      if (config.debug) {
        console.log('[EkaScribe]', ...args);
      }
    },
    [config.debug]
  );

  // Initialize SDK client - can be called explicitly
  const initializeSDK = useCallback(async () => {
    if (!config.baseUrl) {
      log('Skipping SDK init - no baseUrl provided');
      return;
    }

    try {
      // Reset the singleton instance to ensure fresh config is used
      ScribeClient.resetInstance();

      // Get new instance with current config
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = useCallback(() => {
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

  const checkMicrophonePermission = async (): Promise<PermissionState> => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state;
    } catch {
      return 'prompt';
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      log('Microphone permission denied', error);
      return false;
    }
  };

  const showError = useCallback((message: string, isPollingError: boolean = false) => {
    setErrorMessage(message);
    setState(isPollingError ? 'polling_error' : 'error');
  }, []);

  // Polling function - extracted to be reusable for retry
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

  const startRecording = useCallback(async () => {
    const permission = await checkMicrophonePermission();

    if (permission === 'denied') {
      showError('Microphone access is blocked. Please enable it in your browser settings.');
      return;
    }

    if (permission === 'prompt') {
      setState('permission');
      const granted = await requestMicrophonePermission();
      if (!granted) {
        showError('Microphone access is required to record.');
        return;
      }
    }

    if (!clientRef.current) {
      showError('SDK not initialized. Please try again.');
      return;
    }

    try {
      setState('recording');

      await clientRef.current.startRecording({
        templates: ['eka_emr_template'],
        languageHint: config.languageHint,
      });

      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setElapsedTime(0);
      startTimer();

      log('Recording started');
    } catch (error) {
      log('Failed to start recording', error);
      showError('Failed to start recording. Please try again.');
    }
  }, [config.templates, config.languageHint, log, showError, startTimer]);

  const pauseRecording = useCallback(() => {
    if (!clientRef.current) return;

    clientRef.current.pauseRecording();
    setState('paused');
    pausedTimeRef.current = Date.now();
    stopTimer();

    log('Recording paused');
  }, [log, stopTimer]);

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

  const stopRecording = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      stopTimer();
      setState('processing');

      log('Stopping recording...');
      const endResponse = await clientRef.current.endRecording();
      log('Recording ended', endResponse);

      // Poll for results
      await pollForResults();
    } catch (error) {
      log('Failed to stop recording', error);
      showError('Failed to process recording. Please try again.');
      if (config.onError && error instanceof Error) {
        config.onError(error);
      }
    }
  }, [config, log, showError, stopTimer, pollForResults]);

  // Retry polling - can be called when polling fails
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
