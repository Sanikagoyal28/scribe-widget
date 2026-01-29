export function ProcessingState() {
  return (
    <div className="processing-state">
      <div className="processing-visual">
        <div className="spinner large" />
        <div className="processing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <h2>Processing Recording</h2>
      <p className="processing-text">
        Analyzing audio and generating transcription...
      </p>
    </div>
  );
}
