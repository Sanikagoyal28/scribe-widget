import { MicIcon } from './Icons';

interface PermissionStateProps {
  onRequestPermission: () => void;
}

export function PermissionState({ onRequestPermission }: PermissionStateProps) {
  return (
    <div className="permission-state">
      <div className="permission-icon">
        <MicIcon />
      </div>
      <h2>Microphone Access Required</h2>
      <p className="permission-text">
        To record audio, we need access to your microphone.
        <br />
        Please allow access when prompted.
      </p>
      <button className="primary-btn" onClick={onRequestPermission}>
        Allow Microphone
      </button>
    </div>
  );
}
