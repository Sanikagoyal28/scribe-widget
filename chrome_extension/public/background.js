// Background service worker for the Chrome extension
import audioRecordingManager from './audio-recording';


// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});


// Set side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[EkaScribe] Background received message:', message);

  // Message from side panel - request microphone permission
  if (message.action === 'CHECK_MICROPHONE_PERMISSION') {
    (async () => {
      try {
        console.log('EkaScribe- Checking microphone permission');
        const result = await audioRecordingManager.checkMicrophonePermission();

        if (!result.granted && result.micType === 'prompt') {
          const ekaTabs = await chrome.tabs.query({active: true, currentWindow: true});
          if (ekaTabs.length > 0 && ekaTabs[0].id) {
            const tabId = ekaTabs[0].id;
            await chrome.tabs.update(tabId, { active: true });
            await chrome.tabs.reload(tabId);

            await sendMessageToContentScript(tabId, 'GRANT_MICROPHONE_PERMISSION');
          } else {
            const newTab = await chrome.tabs.create({ url: ekaUrl });
            await sendMessageToContentScript(newTab.id, 'GRANT_MICROPHONE_PERMISSION');
          }
        }
        console.log('Microphone permission check result:', result);
        sendResponse(result);
      } catch (error) {
        console.log('error in microphone permission in background', error);
        sendResponse({
          granted: false,
          message: 'Unable to access microphone. Please check permissions.',
          error: error.message,
        });
      }
    })();
    return true;
  }

  // Messages from side panel to content script (generic routing)
  if (message.target === 'content-script') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[EkaScribe] Error:', chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true;
  }

  return false;
});
