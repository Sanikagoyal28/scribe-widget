import { useState, useMemo } from 'react';
import { FloatingPanel } from './components/FloatingPanel';
import { ConfigState } from './components/ConfigState';
import { IdleState } from './components/IdleState';
import { PermissionState } from './components/PermissionState';
import { RecordingState } from './components/RecordingState';
import { ProcessingState } from './components/ProcessingState';
import { ResultsState } from './components/ResultsState';
import { ErrorState } from './components/ErrorState';
import { useScribeSession } from './hooks/useScribeSession';
import { ScribeWidgetConfig } from './types';

interface AppProps {
  config: ScribeWidgetConfig;
  onClose: () => void;
}

export function App({ config: initialConfig, onClose }: AppProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [credentials, setCredentials] = useState<{ apiKey: string; baseUrl: string } | null>(
    initialConfig.baseUrl ? { apiKey: initialConfig.apiKey, baseUrl: initialConfig.baseUrl } : null
  );

  // Merge initial config with user-provided credentials
  const config = useMemo<ScribeWidgetConfig>(() => {
    if (!credentials) {
      return initialConfig;
    }
    return {
      ...initialConfig,
      apiKey: credentials.apiKey,
      baseUrl: credentials.baseUrl,
    };
  }, [initialConfig, credentials]);

  const needsConfig = !credentials;

  const {
    state,
    elapsedTime,
    result,
    errorMessage,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  } = useScribeSession(config);

  if (isMinimized) {
    return null;
  }

  const handleConfigSubmit = (apiKey: string, baseUrl: string) => {
    setCredentials({ apiKey, baseUrl });
  };

  const renderContent = () => {
    // Show config form if credentials not provided
    if (needsConfig) {
      return (
        <ConfigState
          onSubmit={handleConfigSubmit}
          initialApiKey={initialConfig.apiKey || ''}
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
          <ResultsState result={result} onNewRecording={reset} />
        ) : null;

      case 'error':
        return <ErrorState message={errorMessage} onRetry={reset} />;

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
