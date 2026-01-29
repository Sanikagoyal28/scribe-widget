import { useState, useMemo, useCallback, useEffect } from 'react';
import { FloatingPanel } from './components/FloatingPanel';
import { ConfigState } from './components/ConfigState';
import { IdleState } from './components/IdleState';
import { PermissionState } from './components/PermissionState';
import { RecordingState } from './components/RecordingState';
import { ProcessingState } from './components/ProcessingState';
import { ResultsState } from './components/ResultsState';
import { ErrorState } from './components/ErrorState';
import { PollingErrorState } from './components/PollingErrorState';
import { useScribeSession } from './hooks/useScribeSession';
import { ScribeWidgetConfig } from './types';

interface AppProps {
  config: ScribeWidgetConfig;
  onClose: () => void;
}

export function App({ config: initialConfig, onClose }: AppProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [credentials, setCredentials] = useState<{ accessToken?: string; baseUrl: string } | null>(
    initialConfig.baseUrl ? { accessToken: initialConfig.accessToken, baseUrl: initialConfig.baseUrl } : null
  );

  // Merge initial config with user-provided credentials
  const config = useMemo<ScribeWidgetConfig>(() => {
    if (!credentials) {
      return initialConfig;
    }
    return {
      ...initialConfig,
      accessToken: credentials.accessToken,
      baseUrl: credentials.baseUrl,
    };
  }, [initialConfig, credentials]);

  const needsConfig = !credentials;

  const {
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
  } = useScribeSession(config);

  // Initialize SDK when credentials are set
  useEffect(() => {
    if (credentials?.baseUrl) {
      initializeSDK();
    }
  }, [credentials, initializeSDK]);

  // Start new recording - goes back to config screen
  const handleStartNewRecording = useCallback(() => {
    reset();
    setCredentials(null);
  }, [reset]);

  // Handle EMR selection
  const handleSelectEMR = useCallback((emrId: string) => {
    console.log('Selected EMR:', emrId);
    // TODO: Handle EMR selection logic
  }, []);

  if (isMinimized) {
    return null;
  }

  const handleConfigSubmit = (accessToken: string, baseUrl: string) => {
    setCredentials({ accessToken, baseUrl });
  };

  const renderContent = () => {
    // Show config form if credentials not provided
    if (needsConfig) {
      return (
        <ConfigState
          onSubmit={handleConfigSubmit}
          initialAccessToken={initialConfig.accessToken || ''}
          initialBaseUrl={initialConfig.baseUrl || ''}
        />
      );
    }

    switch (state) {
      case 'idle':
        return <IdleState onStartRecording={startRecording} />;

      case 'permission':
        return <PermissionState onRequestPermission={startRecording} />;

      case 'recording':
      case 'paused':
        return (
          <RecordingState
            elapsedTime={elapsedTime}
            isPaused={state === 'paused'}
            onPause={pauseRecording}
            onResume={resumeRecording}
            onStop={stopRecording}
          />
        );

      case 'processing':
        return <ProcessingState />;

      case 'results':
        return result ? (
          <ResultsState
            result={result}
            onNewRecording={handleStartNewRecording}
            onSelectEMR={handleSelectEMR}
          />
        ) : null;

      case 'polling_error':
        return (
          <PollingErrorState
            message={errorMessage}
            onRetry={retryPolling}
            onStartNew={handleStartNewRecording}
          />
        );

      case 'error':
        return <ErrorState message={errorMessage} onRetry={handleStartNewRecording} />;

      default:
        return <IdleState onStartRecording={startRecording} />;
    }
  };

  return (
    <FloatingPanel
      position={config.position}
      onClose={onClose}
      onMinimize={() => setIsMinimized(true)}
    >
      {renderContent()}
    </FloatingPanel>
  );
}
