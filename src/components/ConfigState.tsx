import { useState } from 'react';
import { LogoIcon } from './Icons';

interface ConfigStateProps {
  onSubmit: (apiKey: string, baseUrl: string) => void;
  initialApiKey?: string;
  initialBaseUrl?: string;
}

export function ConfigState({
  onSubmit,
  initialApiKey = '',
  initialBaseUrl = '',
}: ConfigStateProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!baseUrl.trim()) {
      setError('Base URL is required');
      return;
    }

    setError('');
    onSubmit(apiKey.trim(), baseUrl.trim());
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
        <span className="logo-text">eka.scribe</span>
      </div>

      <form className="config-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="eka-api-key">API Key</label>
          <input
            id="eka-api-key"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="eka-base-url">Base URL</label>
          <input
            id="eka-base-url"
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
