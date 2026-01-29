import { ErrorIcon } from './Icons';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-icon">
        <ErrorIcon />
      </div>
      <p className="error-message">{message}</p>
      <button className="retry-btn" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
