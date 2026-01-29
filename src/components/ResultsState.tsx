import { GetSessionStatusResponse } from 'med-scribe-alliance-ts-sdk';

interface ResultsStateProps {
  result: GetSessionStatusResponse;
  onNewRecording: () => void;
}

export function ResultsState({ result, onNewRecording }: ResultsStateProps) {
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
          <div className="transcript-text">
            {result.transcript || 'No transcript available.'}
          </div>
        </div>
      </div>
    </div>
  );
}
