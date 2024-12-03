// background.js
console.log("background.js load");

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// In your service worker (background.js or similar)
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

async function setupOffscreenDocument() {
    // Check if offscreen document exists
    if (!(await chrome.offscreen.hasDocument())) {
        await chrome.offscreen.createDocument({
            url: chrome.runtime.getURL(offscreen.html),
            reasons: ['DOM_PARSER'], // or other valid reason
            justification: 'Selecting folders.'
        });
    }
}

/* async function createOffscreenDocument() {
  // Check if document already exists
  try {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    
    if (existingContexts.length > 0) {
      return;
    }
  } catch (e) {
    console.error(e);
  }

  // Create offscreen document
  await chrome.offscreen.createDocument({
    url: 'popup.html',
    reasons: ['DOM_PARSER'],
    justification: 'Handle file system access'
  });

  //print to log.
  await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
}

// Call this when extension starts
createOffscreenDocument(); */

// Handle messages from sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'triggerFolderSelect') {
    // Forward to offscreen document
    console.log("Button pressed, sending action: clickSelectFolder");
    chrome.runtime.sendMessage({ action: 'clickSelectFolder' });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'console') {
    //log to console
    console.log(request);
  }

  chrome.runtime.sendMessage({
    action: 'consoleToSidepanel',
    data: request
    //fileName: currentFileSelected,
    //content: fileContentTextarea.value
  });
});

/*
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
     if (request.action === 'uploadToGitHub') {
        if (!githubAccessToken) {
          authenticate();
          sendResponse({ status: 'authenticating' });
          return true; // Keep the message channel open
        } else {
          fetchRepositories()
            .then(repos => {
              sendResponse({ repos: repos });
            })
            .catch(error => {
              sendResponse({ error: 'Failed to fetch repositories' });
            });
        }
      } else if (request.action === 'uploadFiles') {
        const repo = request.repo;
        const files = request.files;
        uploadFiles(repo, files);
      } 
  console.log(request);
    if (request.action === 'openFile') {

      chrome.tabs.create({
        url: `fileContent.html?file=${encodeURIComponent(request.fileName)}`
      }, (tab) => {
        // Store the file content in storage for the editor to access
        chrome.storage.local.set({
          [`file_${tab.id}`]: {
            content: request.content,
            fileName: request.fileName
          }
        });
      }); 
    }
  });*/
// In your service worker
async function callOffscreenFunction(data) {
  await setupOffscreenDocument(); // Ensure the offscreen document is open
  chrome.runtime.sendMessage({
      type: 'functionCall',
      target: 'offscreen',
      action: 'callFunction',
      data: data
  }, response => {
      if (chrome.runtime.lastError) {
          console.error('Error calling function:', chrome.runtime.lastError);
      } else {
          console.log('Function call response:', response);
      }
  });
}

// Example usage
callOffscreenFunction("some data");

  console.log("background.js 100%");
