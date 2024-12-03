/* const urlParams = new URLSearchParams(window.location.search);
const fileName = urlParams.get('file');
const editor = document.getElementById('editor');
console.log("Editor.js 1");
// Load the file content
chrome.storage.local.get(`file_${chrome.tabs.getCurrent(tab => tab.id)}`, (data) => {
  console.log("Editor.js 2");
  const fileData = data[`file_${chrome.tabs.getCurrent(tab => tab.id)}`];
  if (fileData) {
    editor.value = fileData.content;
  }
});

document.getElementById('saveButton').addEventListener('click', async () => {
  console.log("Editor.js 3");
  const tabId = await new Promise(resolve => chrome.tabs.getCurrent(tab => resolve(tab.id)));
  const content = editor.value;
  
  // Save to storage
  chrome.storage.local.get(`file_${tabId}`, (data) => {
    const fileData = data[`file_${tabId}`];
    if (fileData) {
      chrome.storage.local.set({
        [`file_${tabId}`]: {
          ...fileData,
          content: content
        }
      });
    }
  });
  
  // Send message to popup to update the file content
  chrome.runtime.sendMessage({
    console.log("Editor.js 4");
    action: 'updateFile',
    fileName: fileName,
    content: content
  });
}); */