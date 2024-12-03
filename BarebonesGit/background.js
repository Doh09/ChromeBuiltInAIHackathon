// Background script (if needed for event pages)
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    chrome.storage.local.get('sidepanelTabId', function(result) {
      if (result.sidepanelTabId === tabId) {
        chrome.storage.local.remove('sidepanelTabId');
      }
    });
  });