navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    chrome.runtime.sendMessage({ command: 'audioAccessGranted' });
    stream.getTracks().forEach((track) => track.stop()); // Stop after granting access
  })
  .catch((error) => {
    console.error('Microphone access denied:', error);
  });