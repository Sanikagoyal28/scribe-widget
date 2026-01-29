import { ErrorIcon } from './Icons';

interface PollingErrorStateProps {
  message: string;
  onRetry: () => void;
  onStartNew: () => void;
}

export function PollingErrorState({ message, onRetry, onStartNew }: PollingErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-icon">
        <ErrorIcon />
      </div>
      <h2>Failed to Fetch Results</h2>
      <p className="error-message">{message}</p>
      <div className="error-actions">
        <button className="primary-btn" onClick={onRetry}>
          Retry
        </button>
        <button className="secondary-btn" onClick={onStartNew}>
          Start New Recording
        </button>
      </div>
    </div>
  );
}
