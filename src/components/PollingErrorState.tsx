import { ErrorIcon } from './Icons';

interface PollingErrorStateProps {
  message: string;
  onRetry: () => void;
  onStartNew: () => void;
}

export function PollingErrorState({ message, onRetry, onStartNew }: PollingErrorStateProps) {
  return (
    <div className="polling-error-state">
      <div className="error-icon">
        <ErrorIcon />
      </div>
      <p className="error-message">{message}</p>
      <div className="polling-error-actions">
        <button className="retry-polling-btn" onClick={onRetry}>
          Retry Fetching Results
        </button>
        <button className="start-new-btn" onClick={onStartNew}>
          Start New Recording
        </button>
      </div>
    </div>
  );
}
