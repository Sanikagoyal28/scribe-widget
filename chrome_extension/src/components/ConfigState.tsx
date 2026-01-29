import { useState, useEffect } from 'react';
import { LogoIcon } from './Icons';

interface ConfigStateProps {
  onSubmit: (accessToken: string, baseUrl: string) => void;
  onTestEMR?: () => void;
  initialAccessToken?: string;
  initialBaseUrl?: string;
}

export function ConfigState({
  onSubmit,
  onTestEMR,
  initialAccessToken = '',
  initialBaseUrl = '',
}: ConfigStateProps) {
  const [accessToken, setAccessToken] = useState(initialAccessToken);
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load saved credentials from chrome.storage
  useEffect(() => {
    chrome.storage.local.get(['accessToken', 'baseUrl'], (result) => {
      if (result.accessToken) setAccessToken(result.accessToken);
      if (result.baseUrl) setBaseUrl(result.baseUrl);
      setLoading(false);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!baseUrl.trim()) {
      setError('Base URL is required');
      return;
    }

    // Save credentials to chrome.storage
    chrome.storage.local.set({
      accessToken: accessToken.trim(),
      baseUrl: baseUrl.trim(),
    });

    setError('');
    onSubmit(accessToken.trim(), baseUrl.trim());
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="config-state">
      <div className="logo-section">
        <div className="logo-icon">
          <LogoIcon />
        </div>
        <h1 className="logo-text">eka.scribe</h1>
        <p className="logo-subtitle">Medical Transcription</p>
      </div>

      <form className="config-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="eka-access-token">Access Token</label>
          <input
            id="eka-access-token"
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Enter your access token (optional)"
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

        <button type="submit" className="primary-btn">
          Continue
        </button>

        {onTestEMR && (
          <button
            type="button"
            className="secondary-btn"
            onClick={onTestEMR}
            style={{ marginTop: '12px' }}
          >
            Test EMR Data
          </button>
        )}
      </form>
    </div>
  );
}
