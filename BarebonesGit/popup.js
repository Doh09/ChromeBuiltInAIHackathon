// Event listener for Clone Repository button
document.getElementById('cloneBtn').addEventListener('click', cloneRepository);

// Event listener for Toggle Sidepanel button
document.getElementById('toggleSidepanelBtn').addEventListener('click', toggleSidepanel);

// Function to toggle the sidepanel
function toggleSidepanel() {
    const views = chrome.extension.getViews({ type: 'tab' });
    let sidepanelTab = null;
    for (let view of views) {
      if (view.location.href.endsWith('sidepanel.html')) {
        sidepanelTab = view.tab;
        break;
      }
    }
    if (sidepanelTab) {
      chrome.tabs.update(sidepanelTab.id, { active: true });
      chrome.storage.local.get('storedFiles', function(storedFiles) {
        chrome.tabs.sendMessage(sidepanelTab.id, { action: 'updateFiles', files: storedFiles.storedFiles });
      });
    } else {
      chrome.tabs.create({ url: 'sidepanel.html' }, function(tab) {
        chrome.storage.local.get('storedFiles', function(storedFiles) {
          chrome.tabs.sendMessage(tab.id, { action: 'updateFiles', files: storedFiles.storedFiles });
        });
      });
    }
  }

// Function to clone the repository
function cloneRepository() {
  const repoUrl = document.getElementById('repoUrl').value;
  const branch = document.getElementById('branch').value || 'main';
  const token = document.getElementById('token').value;

  // Show loading indicator
  document.getElementById('loading').style.display = 'block';

  // Parse the repository URL
  const parsedUrl = parseRepoUrl(repoUrl);
  if (!parsedUrl) {
    alert('Invalid repository URL.');
    document.getElementById('loading').style.display = 'none';
    return;
  }
  const { owner, repo } = parsedUrl;

  // Fetch the repository contents
  fetchRepoContents(owner, repo, branch, token)
    .then(files => {
      // Store the files in chrome.storage.local
      storeFiles(files);
      // Update the files list in the popup
      updateFilesList();
      alert('Repository cloned successfully.');
    })
    .catch(error => {
      console.error('Error cloning repository:', error);
      alert('Error cloning repository: ' + error.message);
    })
    .finally(() => {
      document.getElementById('loading').style.display = 'none';
      toggleSidepanel();
    });
}

// Function to parse the repository URL
function parseRepoUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') {
      return null;
    }
    const pathnameParts = parsed.pathname.split('/');
    if (pathnameParts.length < 3) {
      return null;
    }
    const owner = pathnameParts[1];
    let repo = pathnameParts[2];
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }
    return { owner, repo };
  } catch (e) {
    return null;
  }
}

// Function to fetch repository contents recursively
async function fetchRepoContents(owner, repo, branch, token) {
  const api_url = `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`;
  const response = await fetch(api_url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch repository contents. ' + response.statusText);
  }
  const files = await response.json();
  const fileData = await fetchFilesRecursive(files, owner, repo, branch, token);
  return fileData;
}

// Recursive function to fetch file contents
async function fetchFilesRecursive(items, owner, repo, branch, token) {
  let fileData = {};
  for (const item of items) {
    if (item.type === 'file') {
      const contentResponse = await fetch(item.download_url, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (contentResponse.ok) {
        const content = await contentResponse.text();
        fileData[item.path] = content;
      } else {
        console.warn('Failed to fetch content for', item.path);
      }
    } else if (item.type === 'dir') {
      const subdirResponse = await fetch(item.url, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (subdirResponse.ok) {
        const subdirItems = await subdirResponse.json();
        const subdirData = await fetchFilesRecursive(subdirItems, owner, repo, branch, token);
        Object.assign(fileData, subdirData);
      } else {
        console.warn('Failed to fetch contents for directory', item.path);
      }
    }
  }
  return fileData;
}

// Function to store files in chrome.storage.local
function storeFiles(files) {
  chrome.storage.local.set({ storedFiles: files }, function() {
    console.log('Files stored in chrome.storage.local');
  });
}

// Function to update the files list in the popup
function updateFilesList() {
  chrome.storage.local.get('storedFiles', function(result) {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '';
    if (result.storedFiles) {
      const files = Object.keys(result.storedFiles).sort();
      files.forEach(function(file) {
        const li = document.createElement('li');
        li.textContent = file;
        filesList.appendChild(li);
      });
    }
  });
}

// Event listener for Clear Files button
document.getElementById('clearFilesBtn').addEventListener('click', function() {
  chrome.storage.local.remove('storedFiles', function() {
    alert('Files cleared.');
    updateFilesList();
  });
});

// Placeholder event listeners for Git actions
document.getElementById('addBtn').addEventListener('click', function() {
  alert('Add action not implemented yet.');
});

document.getElementById('commitBtn').addEventListener('click', function() {
  alert('Commit action not implemented yet.');
});

document.getElementById('pullBtn').addEventListener('click', function() {
  alert('Pull action not implemented yet.');
});

document.getElementById('pushBtn').addEventListener('click', function() {
  alert('Push action not implemented yet.');
});

