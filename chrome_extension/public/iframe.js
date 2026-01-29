// Iframe script for microphone permission only

// Request microphone permission on load
async function requestMicrophonePermission() {
  try {
    console.log('[EkaScribe] Requesting microphone permission...');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000
      }
    });

    console.log('[EkaScribe] Microphone permission granted');

    // Stop the stream immediately - we just needed permission
    stream.getTracks().forEach(track => track.stop());

    // Send success to background
    chrome.runtime.sendMessage({
      command: 'micPermissionResult',
      granted: true
    });

  } catch (error) {
    console.error('[EkaScribe] Microphone permission denied:', error);

    // Send failure to background
    chrome.runtime.sendMessage({
      command: 'micPermissionResult',
      granted: false,
      error: error.message
    });
  }
}

// Auto-request permission when iframe loads
requestMicrophonePermission();

console.log('[EkaScribe] Iframe script loaded');
