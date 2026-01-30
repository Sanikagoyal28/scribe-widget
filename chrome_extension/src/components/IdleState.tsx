import { LogoIcon, MicIcon } from './Icons';

interface IdleStateProps {
  onStartRecording: () => void;
  isStarting?: boolean;
  errorMessage?: string;
}

export function IdleState({ onStartRecording, isStarting = false, errorMessage = '' }: IdleStateProps) {
  return (
    <div className="idle-state">
      <div className="idle-content">
        <div className="logo-icon large">
          <LogoIcon />
        </div>
        <h2>Ready to Record</h2>
        <p className="idle-description">
          Start recording your medical consultation to generate transcription and clinical notes.
        </p>
        {errorMessage && (
          <p className="idle-error">{errorMessage}</p>
        )}
      </div>
      <button className="record-btn" onClick={onStartRecording} disabled={isStarting}>
        {isStarting ? (
          <>
            <span className="spinner small" />
            Starting...
          </>
        ) : (
          <>
            <span className="mic-icon">
              <MicIcon />
            </span>
            Start Recording
          </>
        )}
      </button>
    </div>
  );
}
