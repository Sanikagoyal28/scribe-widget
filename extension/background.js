// Background service worker for Eka Scribe extension

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  // Inject the widget into the current tab
  try {
    // First inject the CSS
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['scribe-widget.css']
    });

    // Then inject the widget script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['scribe-widget.js']
    });

    // Finally, initialize or toggle the widget
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleWidget
    });
  } catch (error) {
    console.error('Failed to inject Eka Scribe widget:', error);
  }
});

// Function that runs in the page context to toggle the widget
function toggleWidget() {
  // Check if widget already exists
  if (window.__ekaScribeWidget) {
    // Toggle visibility
    if (window.__ekaScribeWidget.isVisible()) {
      window.__ekaScribeWidget.hide();
    } else {
      window.__ekaScribeWidget.show();
    }
  } else {
    // Initialize the widget
    if (window.EkaScribe) {
      window.__ekaScribeWidget = window.EkaScribe.init({
        baseUrl: '', // Will show config form
        debug: true
      });
    }
  }
}
