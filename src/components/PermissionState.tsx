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
      <p className="permission-text">
        Microphone access is required to record audio.<br />
        Please allow access when prompted.
      </p>
      <button className="permission-btn" onClick={onRequestPermission}>
        Allow Microphone
      </button>
    </div>
  );
}
