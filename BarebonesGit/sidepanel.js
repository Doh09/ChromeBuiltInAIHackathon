function displayFiles(files) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    for (const filePath in files) {
      const fileItem = document.createElement('div');
      fileItem.textContent = filePath;
      fileItem.addEventListener('click', function() {
        fetchFileContent(filePath);
      });
      fileList.appendChild(fileItem);
    }
  }
  
  function fetchFileContent(filePath) {
    chrome.storage.local.get('storedFiles', function(result) {
      if (result.storedFiles && result.storedFiles[filePath]) {
        const contentArea = document.getElementById('fileContent');
        contentArea.value = result.storedFiles[filePath];
      } else {
        alert('File not found.');
      }
    });
  }
  
  function init() {
    chrome.storage.local.get('storedFiles', function(result) {
      if (result.storedFiles) {
        displayFiles(result.storedFiles);
      }
    });
  }
  
  window.addEventListener('load', init);
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateFiles') {
      displayFiles(request.files);
    }
  });