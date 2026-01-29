import { LogoIcon, MicIcon } from './Icons';

interface IdleStateProps {
  onStartRecording: () => void;
}

export function IdleState({ onStartRecording }: IdleStateProps) {
  return (
    <div className="idle-state">
      <div className="logo">
        <div className="logo-icon">
          <LogoIcon />
        </div>
        <span className="logo-text">eka.scribe</span>
      </div>
      <button className="start-btn" onClick={onStartRecording}>
        Start Recording
        <span className="mic-icon">
          <MicIcon />
        </span>
      </button>
    </div>
  );
}
