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
      <div className="recording-indicator">
        <div className={`recording-icon ${!isPaused ? 'active' : ''}`}>
          <ChatIcon />
        </div>
        <span className="timer">{formatTime(elapsedTime)}</span>
      </div>
      <div className="recording-actions">
        {isPaused ? (
          <button className="resume-btn" onClick={onResume}>
            Resume
          </button>
        ) : (
          <button className="pause-btn" onClick={onPause}>
            Pause
          </button>
        )}
        <button className="stop-btn" onClick={onStop} title="Stop recording">
          <div className="stop-icon" />
        </button>
      </div>
    </div>
  );
}
