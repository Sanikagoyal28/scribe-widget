// Background service worker for the Chrome extension
import audioRecordingManager from './audio-recording';

// Fallback URL if no active tab
const ekaUrl = 'https://www.eka.care';

// Store pending permission callback
let pendingPermissionCallback = null;

// Wait for tab to complete loading
const waitForTabLoad = (tabId) => {
  return new Promise((resolve) => {
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        // Small delay to ensure content script is injected
        setTimeout(resolve, 500);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
};

// Send message to content script with retry
const sendMessageToContentScript = async (tabId, action) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[EkaScribe] Error sending to content script:', chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else {
        console.log('[EkaScribe] Content script response:', response);
        resolve(response);
      }
    });
  });
};

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Set side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[EkaScribe] Background received message:', message);

  // Message from iframe - microphone permission granted
  if (message.command === 'audioAccessGranted') {
    console.log('[EkaScribe] Microphone permission granted via iframe');
    if (pendingPermissionCallback) {
      pendingPermissionCallback({ granted: true });
      pendingPermissionCallback = null;
    }
    return;
  }

  // Message from iframe - microphone permission denied
  if (message.command === 'audioAccessDenied') {
    console.log('[EkaScribe] Microphone permission denied via iframe:', message.error);
    if (pendingPermissionCallback) {
      pendingPermissionCallback({ granted: false, error: message.error });
      pendingPermissionCallback = null;
    }
    return;
  }

  // Message from side panel - request microphone permission
  if (message.action === 'CHECK_MICROPHONE_PERMISSION') {
    (async () => {
      try {
        console.log('EkaScribe- Checking microphone permission');
        const result = await audioRecordingManager.checkMicrophonePermission();

        if (!result.granted && result.micType === 'prompt') {
          // Store callback to respond when iframe grants permission
          pendingPermissionCallback = sendResponse;

          const ekaTabs = await chrome.tabs.query({ active: true, currentWindow: true });
          let tabId;

          if (ekaTabs.length > 0 && ekaTabs[0].id) {
            tabId = ekaTabs[0].id;
            await chrome.tabs.update(tabId, { active: true });
            await chrome.tabs.reload(tabId);
          } else {
            const newTab = await chrome.tabs.create({ url: ekaUrl });
            tabId = newTab.id;
          }

          // Wait for tab to finish loading
          await waitForTabLoad(tabId);

          // Send message to inject iframe
          await sendMessageToContentScript(tabId, 'GRANT_MICROPHONE_PERMISSION');

          // Don't sendResponse here - wait for iframe to respond via audioAccessGranted
          return;
        }

        console.log('Microphone permission check result:', result);
        sendResponse(result);
      } catch (error) {
        console.log('error in microphone permission in background', error);
        pendingPermissionCallback = null;
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
