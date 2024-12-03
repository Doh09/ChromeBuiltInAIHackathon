window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
  return false;
};
let currentFiles = new Map();
let currentFileSelected = null;
let autosaveEnabled = false;
let saveTimeout;
console.log("popup.js load");
document.addEventListener('DOMContentLoaded', async () => {
  const selectFolderButton = document.getElementById('selectFolder');
  
  const clearFolderButton = document.getElementById('clearFolder');
  const fileList = document.getElementById('fileList');
  const fileContentTextarea = document.getElementById('fileContent');
  const saveButton = document.getElementById('saveButton');
  const autosaveCheckbox = document.getElementById('autosaveCheckbox');

  // Initialize autosave setting
  let autosaveEnabled = false;
  const result = await new Promise((resolve, reject) => {
    chrome.storage.local.get('autosaveEnabled', function(result) {
      resolve(result);
    });
  });
  autosaveCheckbox.checked = result.autosaveEnabled || false;
  autosaveEnabled = autosaveCheckbox.checked;

  // Event listener for autosave checkbox
  autosaveCheckbox.addEventListener('change', function() {
    autosaveEnabled = this.checked;
    chrome.storage.local.set({ 'autosaveEnabled': autosaveEnabled });
    console.log('Autosave enabled:', autosaveEnabled);
  });

  // Event listener for clear button
  clearFolderButton.addEventListener('click', function() {
    currentFiles.clear();
    fileList.innerHTML = '';
    fileContentTextarea.value = '';
    currentFileSelected = null;
    chrome.storage.local.remove('currentFiles');
    console.log('Folder cleared.');
  });

  // Load saved files on popup load
  const savedFiles = await new Promise((resolve, reject) => {
    chrome.storage.local.get('currentFiles', function(result) {
      resolve(result.currentFiles || {});
    });
  });
  if (Object.keys(savedFiles).length > 0) {
    Object.keys(savedFiles).forEach(fileName => {
      currentFiles.set(fileName, { content: savedFiles[fileName] });
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.textContent = fileName;
      fileItem.addEventListener('click', function() {
        currentFileSelected = fileName;
        fileContentTextarea.value = currentFiles.get(fileName).content;
        console.log('Current file selected:', currentFileSelected);
      });
      fileList.appendChild(fileItem);
    });
  }

  // Create a hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.webkitdirectory = true;
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  // Event listener for select folder button
  selectFolderButton.addEventListener('click', () => {
    fileInput.click();
  });

      // Listen for message from background
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'clickSelectFolder') {
          console.log("Button pressed, invoking function: fileInput.click()");
          fileInput.click();
        }
      });

  // Event listener for file input change
  fileInput.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files);
    const fileDataArray = [];

    for (const file of files) {
      try {
        const content = await file.text();
        fileDataArray.push({
          name: file.name,
          content: content,
          path: file.webkitRelativePath
        });
      } catch (err) {
        console.error('Error reading file:', file.name, err);
      }
    }

    // Send files back to sidepanel
    chrome.runtime.sendMessage({
      action: 'filesLoaded',
      files: fileDataArray
    });
  });
 /*  fileInput.addEventListener('change', async (event) => {
    currentFiles.clear();
    fileList.innerHTML = '';
    fileContentTextarea.value = '';
    currentFileSelected = null;

    const files = Array.from(event.target.files);

    // Get all saved files from storage
    const savedFiles = await new Promise((resolve, reject) => {
      chrome.storage.local.get(null, function(result) {
        resolve(result);
      });
    });

    for (const file of files) {
      try {
        const content = await file.text();
        const savedContent = savedFiles[file.name] || content;
        currentFiles.set(file.name, { content: savedContent });

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.textContent = file.name;
        fileItem.addEventListener('click', function() {
          currentFileSelected = file.name;
          fileContentTextarea.value = currentFiles.get(file.name).content;
          console.log('Current file selected:', currentFileSelected);
            // Send message to popup to update the file content
          chrome.runtime.sendMessage({
            action: 'console',
            fileName: currentFileSelected,
            content: fileContentTextarea.value
          });
        });
        fileList.appendChild(fileItem);
      } catch (err) {
        console.error('Error reading file:', file.name, err);
      }
    }
    
  }); */

  // Save button event listener
  saveButton.addEventListener('click', function() {
    if (currentFileSelected) {
      saveFileContent(currentFileSelected, fileContentTextarea.value);
    }
  });

  // Autosave functionality
  fileContentTextarea.addEventListener('input', function() {
    console.log('AutosaveEnabled:', autosaveEnabled, 'CurrentFileSelected:', currentFileSelected);
    if (autosaveEnabled && currentFileSelected) {
      console.log('Autosave triggered');
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(function() {
        saveFileContent(currentFileSelected, fileContentTextarea.value);
      }, 1000); // Save after 1 second of inactivity
    }
  });

  // Function to save file content
  function saveFileContent(fileName, content) {
    currentFiles.set(fileName, { content: content });
    chrome.storage.local.set({ [fileName]: content }, function() {
      console.log('File saved to storage:', fileName);
    });
  }

  // Save currentFiles map on popup close
  window.addEventListener('beforeunload', function() {
    chrome.storage.local.set({ 'currentFiles': Object.fromEntries(currentFiles) });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'consoleToSidepanel') {
      //log to console
      console.log(request);
      fileContent.value = request.data;
    }
  
  });
});
console.log("popup.js load 100%");
