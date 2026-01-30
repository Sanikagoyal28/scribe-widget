import { useState } from 'react';
import { LogoIcon } from './Icons';

interface ConfigStateProps {
  onSubmit: (accessToken: string, baseUrl: string) => void;
  initialAccessToken?: string;
  initialBaseUrl?: string;
}

export function ConfigState({
  onSubmit,
  initialAccessToken = '',
  initialBaseUrl = '',
}: ConfigStateProps) {
  const [accessToken, setAccessToken] = useState(initialAccessToken);
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!baseUrl.trim()) {
      setError('Base URL is required');
      return;
    }

    setError('');
    onSubmit(accessToken.trim(), baseUrl.trim());
  };

  return (
    <div
      className="config-state"
      style={{
        zIndex: 9999,
      }}
    >
      <div className="logo">
        <div className="logo-icon">
          <LogoIcon />
        </div>
        <span className="logo-text">med.scribe</span>
      </div>

      <form className="config-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="med-access-token">Access Token</label>
          <input
            id="med-access-token"
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Enter your access token (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="med-base-url">Base URL</label>
          <input
            id="med-base-url"
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.eka.care"
            required
          />
        </div>

        {error && <p className="config-error">{error}</p>}

        <button type="submit" className="config-submit-btn">
          Continue
        </button>
      </form>
    </div>
  );
}
