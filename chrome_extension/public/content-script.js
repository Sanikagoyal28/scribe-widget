// Content script that handles microphone permission via iframe injection

const grantMicrophonePermission = () => {
  console.log('[EkaScribe] Microphone iframe injected');
  const iframeEle = document.getElementById('audio-permission-iframe');

  // if iframe was previously injected, remove and reload to take user microphone permission
  if (iframeEle) {
    document.body.removeChild(iframeEle);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'audio-permission-iframe';
  iframe.style.position = 'absolute';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.opacity = '0';
  iframe.src = chrome.runtime.getURL('iframe.html');
  iframe.allow = 'microphone';

  document.body.appendChild(iframe);
};

// Listen for messages from the extension (background/sidepanel)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[EkaScribe] Content script received message:', message);

  if (message.action === 'GRANT_MICROPHONE_PERMISSION') {
    console.log('[EkaScribe] Granting microphone permission');
    grantMicrophonePermission();
    sendResponse({ status: 'permission requested' });
    return true;
  }

  if (message.action === 'ekascribe-data') {
    console.log('Ekascribe- ekascribe-data received');
    window.dispatchEvent(
      new CustomEvent('scribe-protocol-data', {
        detail: { value: message.value },
      })
    );
    return;
  }

  return true;
});

console.log('[EkaScribe] Content script loaded');
