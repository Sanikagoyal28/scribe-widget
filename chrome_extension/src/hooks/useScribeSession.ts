import { useState, useRef, useCallback, useEffect } from 'react';
import { WidgetState, ScribeConfig } from '../types';
import { ScribeClient, GetSessionStatusResponse } from 'med-scribe-alliance-ts-sdk';

interface UseScribeSessionReturn {
  state: WidgetState;
  elapsedTime: number;
  result: GetSessionStatusResponse | null;
  errorMessage: string;
  isStarting: boolean;
  initializeSDK: () => Promise<void>;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<void>;
  retryPolling: () => Promise<void>;
  reset: () => void;
  goToEMRPreview: () => void;
  goBackToResults: () => void;
}

export function useScribeSession(config: ScribeConfig): UseScribeSessionReturn {
  const [state, setState] = useState<WidgetState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [result, setResult] = useState<GetSessionStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isStarting, setIsStarting] = useState(false);

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

  // Helper function to delay execution
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const pollForResults = useCallback(async (): Promise<boolean> => {
    if (!clientRef.current) {
      showError('SDK not initialized. Please try again.', true);
      return false;
    }

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        setState('processing');
        log(`Polling for completion... (attempt ${attempt}/${MAX_RETRIES})`);

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
        log(`Polling attempt ${attempt} failed:`, error);

        if (attempt < MAX_RETRIES) {
          log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
          await delay(RETRY_DELAY_MS);
        } else {
          // All retries exhausted
          log('All polling retries exhausted');
          showError('Failed to fetch results. Please retry.', true);
          if (config.onError && error instanceof Error) {
            config.onError(error);
          }
          return false;
        }
      }
    }

    return false;
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
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      log('Requesting microphone permission...');
      const response = await chrome.runtime.sendMessage({
        action: 'CHECK_MICROPHONE_PERMISSION',
      });

      console.log('Microphone permission response:', response);

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
  };

  // Start recording - initializes SDK first, then checks permission, then starts
  const startRecording = useCallback(async () => {
    if (!config.baseUrl) {
      setErrorMessage('API not configured. Please configure first.');
      return;
    }

    // Clear any previous error and show loading state
    setErrorMessage('');
    setIsStarting(true);
    log('Step 1: Checking microphone permission...');

    // Step 2: Check microphone permission FIRST
    const permissionGranted = await requestMicrophonePermission();

    if (!permissionGranted) {
      setIsStarting(false);
      setErrorMessage('Microphone access is required to record.');
      return;
    }

    // Step 3: Initialize SDK if not already initialized
    if (!clientRef.current) {
      log('Step 2: Initializing SDK...');
      try {
        ScribeClient.resetInstance();
        clientRef.current = ScribeClient.getInstance({
          accessToken: config.accessToken,
          baseUrl: config.baseUrl,
          debug: config.debug,
        });
        await clientRef.current.init();
        log('SDK initialized successfully');
      } catch (error) {
        log('Failed to initialize SDK', error);
        setIsStarting(false);
        setErrorMessage('Failed to initialize. Please try again.');
        return;
      }
    }

    // Step 4: Permission granted & SDK ready - start recording
    log('Step 3: Starting recording...');
    try {
      await clientRef.current.startRecording({
        templates: ['eka_emr_template'],
        languageHint: config.languageHint,
      });

      setIsStarting(false);
      setState('recording');
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setElapsedTime(0);
      startTimer();

      log('Recording started successfully');
    } catch (error) {
      log('Failed to start recording', error);
      setIsStarting(false);
      setErrorMessage('Failed to start recording. Please try again.');
    }
  }, [
    config.accessToken,
    config.baseUrl,
    config.debug,
    config.languageHint,
    log,
    startTimer,
    requestMicrophonePermission,
  ]);

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
    setIsStarting(false);
    setState('idle');
  }, []);

  const goToEMRPreview = useCallback(() => {
    setState('emr_preview');
  }, []);

  const goBackToResults = useCallback(() => {
    setState('results');
  }, []);

  return {
    state,
    elapsedTime,
    result,
    errorMessage,
    isStarting,
    initializeSDK,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    retryPolling,
    reset,
    goToEMRPreview,
    goBackToResults,
  };
}
