import { ChatIcon } from './Icons';

interface RecordingStateProps {
  elapsedTime: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function RecordingState({
  elapsedTime,
  isPaused,
  onPause,
  onResume,
  onStop
}: RecordingStateProps) {
  return (
    <div className="recording-state">
      <div className="recording-visual">
        <div className={`recording-circle ${!isPaused ? 'active' : 'paused'}`}>
          <div className="recording-inner">
            <ChatIcon />
          </div>
        </div>
        {!isPaused && (
          <div className="recording-waves">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
      
      <div className="recording-info">
        <span className="timer">{formatTime(elapsedTime)}</span>
        <span className={`recording-status ${isPaused ? 'paused' : ''}`}>
          {isPaused ? 'Paused' : 'Recording...'}
        </span>
      </div>

      <div className="recording-actions">
        {isPaused ? (
          <button className="secondary-btn" onClick={onResume}>
            Resume
          </button>
        ) : (
          <button className="secondary-btn warning" onClick={onPause}>
            Pause
          </button>
        )}
        <button className="stop-btn" onClick={onStop}>
          <div className="stop-icon" />
          Stop
        </button>
      </div>
    </div>
  );
}
