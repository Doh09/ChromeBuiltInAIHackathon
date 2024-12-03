document.addEventListener('DOMContentLoaded', function() {
    const applyChangesBtn = document.getElementById('applyChanges');
    const llmSelector = document.getElementById('llmSelector');
    const httpMethod = document.getElementById('httpMethod');
    const headersDiv = document.getElementById('headers');
    const jsonBodyDiv = document.getElementById('jsonBody');
    const urlInput = document.getElementById('urlInput');

    document.getElementById('openFile').addEventListener('click', function() {
        chrome.tabs.create({
            url: "file:///C:/Users/blyan/Documents/Secretarian%20Nano/BaseTwinPanels.html"
        });
    });

    // Function to show/hide elements based on selected LLM and HTTP method
    function updateForm() {
        const selectedLLM = llmSelector.value;
        if (selectedLLM === "http") {
            httpMethod.classList.remove('hidden');
            headersDiv.classList.remove('hidden');
            urlInput.classList.remove('hidden');
            if (httpMethod.value === "POST") {
                jsonBodyDiv.classList.remove('hidden');
            } else {
                jsonBodyDiv.classList.add('hidden');
            }
        } else {
            httpMethod.classList.add('hidden');
            headersDiv.classList.add('hidden');
            urlInput.classList.add('hidden');
            jsonBodyDiv.classList.add('hidden');
        }
    }

    // Listeners for LLM selection and HTTP method changes
    llmSelector.addEventListener('change', updateForm);
    httpMethod.addEventListener('change', updateForm);

    // Function to save settings to Chrome storage
    function saveSettings() {
        chrome.storage.sync.set({
            'llm': llmSelector.value,
            'method': httpMethod.value,
            'headers': document.getElementById('headerInput').value,
            'jsonBody': document.getElementById('jsonInput').value,
            'url': urlInput.value
        }, () => {
            console.log("Settings saved");
        });
    }

    // Function to load settings from Chrome storage
    function loadSettings() {
        chrome.storage.sync.get(['llm', 'method', 'headers', 'jsonBody', 'url'], (items) => {
            if (items.llm) llmSelector.value = items.llm;
            if (items.method) httpMethod.value = items.method;
            if (items.headers) document.getElementById('headerInput').value = items.headers;
            if (items.jsonBody) document.getElementById('jsonInput').value = items.jsonBody;
            if (items.url) urlInput.value = items.url;
            updateForm(); // Update form visibility after loading settings
        });
    }

    // Load settings when popup opens
    loadSettings();

    // Event listener for applying changes
    applyChangesBtn.addEventListener('click', () => {
        const changeRequest = document.getElementById('changeRequest').value;
        console.log('Change request:', changeRequest);

        if (changeRequest) {
            const selectedLLM = llmSelector.value;
            const selectedMethod = httpMethod.value;
            const headersText = document.getElementById('headerInput').value;
            const headers = headersText.split('\n').map(line => {
                const [key, ...value] = line.split(':').map(item => item.trim());
                return { [key]: value.join(':') };
            }).filter(header => header);
            const jsonBody = document.getElementById('jsonInput').value;
            const url = urlInput.value;

            if (selectedLLM === "http" && !url) {
                console.log('URL is required for HTTP requests');
                return; // Prevent sending message if URL is not provided for HTTP LLM
            }

            chrome.runtime.sendMessage({
                type: "applyChanges",
                data: {
                    changeRequest: changeRequest,
                    llm: selectedLLM,
                    method: selectedMethod,
                    headers: headers,
                    body: jsonBody,
                    url: url 
                }
            });

            saveSettings(); // Save settings before closing the popup
        } else {
            console.log('No change request provided');
        }
    });

    // Save settings when the popup loses focus (minimized or closed)
    window.addEventListener('blur', function() {
        saveSettings();
    });

    // Initial update to set default state
    updateForm();
});