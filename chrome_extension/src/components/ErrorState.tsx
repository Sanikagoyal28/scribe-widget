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
      <h2>Something went wrong</h2>
      <p className="error-message">{message}</p>
      <button className="primary-btn" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
