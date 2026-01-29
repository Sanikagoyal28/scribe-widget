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
  console.log('prescription result - WIDGET', result);
  return (
    <div className="results-state">
      <div className="results-header">
        <span className="results-title">Recording Complete</span>
        <button className="new-recording-btn" onClick={onNewRecording}>
          New Recording
        </button>
      </div>
      <div className="results-content">
        <div className="transcript-section">
          <div className="section-title">Transcript</div>
          <div className="transcript-text">{result.transcript || 'No transcript available.'}</div>
        </div>

        <div className="emr-section">
          <div className="section-title">Integrated EMRs</div>
          <div className="emr-list-inline">
            {EMR_LIST.map((emr) => (
              <button
                key={emr.id}
                className="emr-item"
                onClick={() => onSelectEMR(emr.id)}
              >
                <div className="emr-item-info">
                  <span className="emr-item-name">{emr.name}</span>
                  <span className="emr-item-desc">{emr.description}</span>
                </div>
                <svg className="emr-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
