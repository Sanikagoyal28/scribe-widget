import { GetSessionStatusResponse } from 'med-scribe-alliance-ts-sdk';

const EMR_LIST = [
  { id: 'eka_emr', name: 'Eka EMR', description: 'Eka Care Electronic Medical Records' },
  { id: 'open_emr', name: 'OpenEMR', description: 'Open-source Electronic Health Records' },
  { id: 'open_mrs', name: 'OpenMRS', description: 'Open Medical Record System' },
];

interface ResultsStateProps {
  result: GetSessionStatusResponse;
  onNewRecording: () => void;
  onSelectEMR: (emrId: string) => void;
}

export function ResultsState({ result, onNewRecording, onSelectEMR }: ResultsStateProps) {
  return (
    <div className="results-state">
      <div className="results-header">
        <h2>Recording Complete</h2>
        <button className="primary-btn small" onClick={onNewRecording}>
          New Recording
        </button>
      </div>

      <div className="results-content">
        <div className="result-section">
          <h3 className="section-title">Transcript</h3>
          <div className="transcript-box">
            {result.transcript || 'No transcript available.'}
          </div>
        </div>

        <div className="result-section">
          <h3 className="section-title">Send to EMR</h3>
          <div className="emr-list">
            {EMR_LIST.map((emr) => (
              <button
                key={emr.id}
                className="emr-item"
                onClick={() => onSelectEMR(emr.id)}
              >
                <div className="emr-info">
                  <span className="emr-name">{emr.name}</span>
                  <span className="emr-desc">{emr.description}</span>
                </div>
                <svg className="emr-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
