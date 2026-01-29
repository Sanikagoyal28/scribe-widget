import { useState, useMemo, useCallback, useEffect } from 'react';
import { ConfigState } from './components/ConfigState';
import { IdleState } from './components/IdleState';
import { PermissionState } from './components/PermissionState';
import { RecordingState } from './components/RecordingState';
import { ProcessingState } from './components/ProcessingState';
import { ResultsState } from './components/ResultsState';
import { ErrorState } from './components/ErrorState';
import { PollingErrorState } from './components/PollingErrorState';
import { useScribeSession } from './hooks/useScribeSession';
import { ScribeConfig } from './types';
import { SettingsIcon } from './components/Icons';

export function App() {
  const [credentials, setCredentials] = useState<{ accessToken?: string; baseUrl: string } | null>(null);

  const config = useMemo<ScribeConfig>(() => {
    if (!credentials) {
      return { baseUrl: '' };
    }
    return {
      accessToken: credentials.accessToken,
      baseUrl: credentials.baseUrl,
      debug: true,
    };
  }, [credentials]);

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

  const handleConfigSubmit = (accessToken: string, baseUrl: string) => {
    setCredentials({ accessToken, baseUrl });
  };

  const handleSettings = () => {
    setCredentials(null);
    reset();
  };

  const renderContent = () => {
    if (needsConfig) {
      return <ConfigState onSubmit={handleConfigSubmit} />;
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
    <div className="side-panel">
      <header className="panel-header">
        <div className="header-brand">
          <span className="brand-text">eka.scribe</span>
        </div>
        {!needsConfig && (
          <button className="settings-btn" onClick={handleSettings} title="Settings">
            <SettingsIcon />
          </button>
        )}
      </header>
      <main className="panel-content">
        {renderContent()}
      </main>
    </div>
  );
}
