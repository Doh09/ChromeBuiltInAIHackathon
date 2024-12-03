/* let githubAccessToken = null;

function authenticate() {
  const oauthUrl = 'https://github.com/login/oauth/authorize?client_id=<client_id>&scope=repo';
  chrome.identity.launchWebAuthFlow(
    { url: oauthUrl, interactive: true },
    function(redirectUrl) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      const code = extractCodeFromRedirectUrl(redirectUrl);
      exchangeCodeForToken(code);
    }
  );
}

function extractCodeFromRedirectUrl(url) {
  const hash = url.split('#')[1];
  const params = new URLSearchParams(hash);
  return params.get('code');
}

function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_id: '<client_id>',
    client_secret: '<client_secret>',
    code: code,
    grant_type: 'authorization_code'
  });

  fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  })
  .then(response => response.text())
  .then(data => {
    const params = new URLSearchParams(data);
    githubAccessToken = params.get('access_token');
    chrome.storage.local.set({ githubAccessToken: githubAccessToken });
  })
  .catch(error => console.error('Error exchanging code for token:', error));
}

function fetchRepositories() {
  return fetch('https://api.github.com/user/repos', {
    headers: {
      'Authorization': 'Bearer ' + githubAccessToken
    }
  })
  .then(response => response.json());
}

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
        url: `editor.html?file=${encodeURIComponent(request.fileName)}`
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
  }); */