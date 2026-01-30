interface EMRPreviewStateProps {
  templateData: any;
  onBack: () => void;
  onPushToEMR: () => void;
  isPushing?: boolean;
}

export function EMRPreviewState({
  templateData,
  onBack,
  onPushToEMR,
  isPushing = false,
}: EMRPreviewStateProps) {
  return (
    <div className="emr-preview-state">
      <div className="emr-preview-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h2>EMR Data Preview</h2>
      </div>

      <div className="emr-preview-content">
        <div className="json-preview">
          <pre>{JSON.stringify(templateData, null, 2)}</pre>
        </div>
      </div>

      <div className="emr-preview-actions">
        <button
          className="primary-btn"
          onClick={onPushToEMR}
          disabled={isPushing}
        >
          {isPushing ? (
            <>
              <span className="spinner small" />
              Pushing...
            </>
          ) : (
            'Push to EMR'
          )}
        </button>
      </div>
    </div>
  );
}
