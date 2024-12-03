let currentFiles = new Map();
let currentFileSelected = null;
let autosaveEnabled = false;
let saveTimeout;

document.addEventListener('DOMContentLoaded', async () => {
  console.log("Loading sidepanel.");
  let truthful = 'this is file content';
 let authentic = 'This is a filename.';
  chrome.storage.local.set({ [authentic]: truthful }, function() {
    console.log('File saved to storage:', authentic);
  });
  const selectFolderButton = document.getElementById('selectFolder');
  //const clearFolderButton = document.getElementById('clearFolder');
  const fileList = document.getElementById('folderContent');
  const fileContent = document.getElementById('fileContent');
  //const saveButton = document.getElementById('saveButton');
  //const autosaveCheckbox = document.getElementById('autosaveCheckbox');

/*   // Initialize autosave setting
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
  }); */

  // Load saved files on popup load
   const savedFiles = await new Promise((resolve, reject) => {
    chrome.storage.local.get('currentFiles', function(result) {
      resolve(result.currentFiles || {});
    });
  });
  console.log("savedFiles");
  console.log(savedFiles);
  if (Object.keys(savedFiles).length > 0) {
    Object.keys(savedFiles).forEach(fileName => {
      currentFiles.set(fileName, { content: savedFiles[fileName] });
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.textContent = fileName;
      fileItem.addEventListener('click', function() {
        currentFileSelected = fileName;
        fileContent.value = currentFiles.get(fileName).content;
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
  console.log(fileInput);
  // Event listener for select folder button
/*   selectFolderButton.addEventListener('click', (event) => {
    console.log("event: click()");
    console.log(event);
    console.log(event.target);
    console.log(event.target.files);
    console.log(fileInput);
    fileInput.click();
    console.log(fileInput);

  }); */
  selectFolderButton.addEventListener('click', () => {
    console.log("Button pressed, sending action: triggerFolderSelect 1");
    chrome.runtime.sendMessage({ action: 'triggerFolderSelect' });
  });

  fileInput.addEventListener('unload', (event) => {
    console.log("event: unload");
    console.log(event);
  });

   // Event listener for file input change
  fileInput.addEventListener('change', async (event) => {
    console.log("event: change");
    console.log(event);
    console.log(currentFiles);
    console.log(fileList);
    console.log(fileContent);
    console.log(currentFileSelected);
    console.log(files);

    currentFiles.clear();
    fileList.innerHTML = '';
    fileContent.value = '';
    currentFileSelected = null;

    const files = Array.from(event.target.files);
    console.log(files);
    // Get all saved files from storage
     const savedFiles = await new Promise((resolve, reject) => {
      chrome.storage.local.get(null, function(result) {
        resolve(result);
      });
    }); 

    for (const file of files) {
      console.log("file");
      try {
        const content = await file.text();
         const savedContent = savedFiles[file.name] || content;
        currentFiles.set(file.name, { content: savedContent }); 

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.textContent = file.name;
        fileItem.addEventListener('click', function() {
          currentFileSelected = file.name;
          fileContent.value = currentFiles.get(file.name).content;
          console.log('Current file selected:', currentFileSelected);
        });
        fileList.appendChild(fileItem);
      } catch (err) {
        console.error('Error reading file:', file.name, err);
      }
    }
  });
/*
  // Save button event listener
  saveButton.addEventListener('click', function() {
    if (currentFileSelected) {
      saveFileContent(currentFileSelected, fileContent.value);
    }
  });
*/
  // Autosave functionality
  fileContent.addEventListener('input', function() {
    console.log('AutosaveEnabled:', autosaveEnabled, 'CurrentFileSelected:', currentFileSelected);
    if (autosaveEnabled && currentFileSelected) {
      console.log('Autosave triggered');
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(function() {
        saveFileContent(currentFileSelected, fileContent.value);
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

  function displayFiles(files) {
    fileList.innerHTML = '';
    fileContent.value = '';
    currentFiles.clear();

    files.forEach(file => {
      currentFiles.set(file.name, file);

      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.textContent = file.name;
      fileItem.addEventListener('click', () => {
        fileContent.value = file.content;
      });
      fileList.appendChild(fileItem);
    });
  }

    // Listen for loaded files from offscreen document
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'filesLoaded') {
        displayFiles(message.files);
      }
    });

  // Save currentFiles map on popup close
  window.addEventListener('beforeunload', function() {
    chrome.storage.local.set({ 'currentFiles': Object.fromEntries(currentFiles) });
  }); 
  console.log("Loading sidepanel 100%.");

});