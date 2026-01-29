interface EMRListStateProps {
  onSelectEMR: (emrId: string) => void;
  onNewRecording: () => void;
  onBack: () => void;
}

const EMR_LIST = [
  { id: 'eka_emr', name: 'Eka EMR', description: 'Eka Care Electronic Medical Records' },
  { id: 'open_emr', name: 'OpenEMR', description: 'Open-source Electronic Health Records' },
  { id: 'open_mrs', name: 'OpenMRS', description: 'Open Medical Record System' },
];

export function EMRListState({ onSelectEMR, onNewRecording, onBack }: EMRListStateProps) {
  return (
    <div className="emr-list-state">
      <div className="emr-list-header">
        <button className="back-btn" onClick={onBack} title="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span className="emr-list-title">Integrated EMRs</span>
      </div>

      <div className="emr-list-content">
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

      <div className="emr-list-footer">
        <button className="start-new-recording-btn" onClick={onNewRecording}>
          Start New Recording
        </button>
      </div>
    </div>
  );
}
