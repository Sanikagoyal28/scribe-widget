// Background service worker for the Chrome extension

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Set side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Store pending permission request callback
let pendingPermissionCallback = null;

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[EkaScribe] Background received message:', message);

  // Message from iframe - microphone permission result
  if (message.command === 'micPermissionResult') {
    console.log('[EkaScribe] Mic permission result:', message.granted);

    // If we have a pending callback, respond to it
    if (pendingPermissionCallback) {
      pendingPermissionCallback({
        granted: message.granted,
        error: message.error
      });
      pendingPermissionCallback = null;
    }
    return;
  }

  // Message from side panel - request microphone permission
  if (message.action === 'GRANT_MICROPHONE_PERMISSION') {
    console.log('[EkaScribe] Forwarding permission request to content script');

    // Store the callback to respond later when iframe sends result
    pendingPermissionCallback = sendResponse;

    // Forward to content script to inject iframe
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'GRANT_MICROPHONE_PERMISSION'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[EkaScribe] Error:', chrome.runtime.lastError.message);
            // If content script injection failed, respond with error
            if (pendingPermissionCallback) {
              pendingPermissionCallback({
                granted: false,
                error: chrome.runtime.lastError.message
              });
              pendingPermissionCallback = null;
            }
          } else {
            console.log('[EkaScribe] Content script response:', response);
            // Content script acknowledged - now wait for iframe result
          }
        });
      } else {
        // No active tab found
        sendResponse({ granted: false, error: 'No active tab found' });
        pendingPermissionCallback = null;
      }
    });

    // Return true to indicate we'll respond asynchronously
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
