var baseWebsiteSet = false;
//let docElm;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);  // Log received message

if (!baseWebsiteSet)
{
    docElm = document.documentElement;
//        chrome.tabs.sendMessage(tabs[0].id, { type: "setBaseWebsite", data: document.documentElement.innerHTML });
    baseWebsiteSet = true;
}

if (request.type === "updateContent") {
    console.log('Updating content with:', request.data);
    console.log('Received data is a string:', request.data);

    let data = "NO DATA RETRIEVED";
    if (request.data.html)
    {
        data = request.data.html;//request.data.html;

    }
    else
    data = request.data;
    //chrome.tabs.sendMessage(tabs[0].id, { type: "setCurrentWebsite", data: request.data });

    console.log('HTML updated');
    var rightPanelTextarea = document.getElementById('right-panel').querySelector('textarea');
    var leftPanelIframe = document.getElementById('left-panel').querySelector('iframe');

    rightPanelTextarea.value = data;
    leftPanelIframe.srcdoc = data;
    // Assuming JS is returned in a way that can be eval'd safely
    if (request.data.js) {
        console.log('Attempting to execute JavaScript');
        let script = document.createElement('script');
        script.textContent = request.data.js;
        document.body.appendChild(script);
        document.body.removeChild(script);
        console.log('JavaScript executed');
    }
}

//if (request.command === "getFullHTML") {
 //   let fullHTML = document.documentElement.outerHTML; // Includes <html> tags
    // or use document.documentElement.innerHTML if you don't want <html> tags
  //  chrome.runtime.sendMessage({html: fullHTML});
  //}
});

document.addEventListener('DOMContentLoaded', function() {
    var rightPanelTextarea = document.getElementById('right-panel').querySelector('textarea');
    if (rightPanelTextarea) {
        // Function to fetch file content from the extension
        function fetchExtensionFile(filename) {
            return new Promise((resolve, reject) => {
                chrome.runtime.getPackageDirectoryEntry(function(root) {
                    root.getFile(filename, {}, function(fileEntry) {
                        fileEntry.file(function(file) {
                            var reader = new FileReader();
                            reader.onloadend = function(e) {
                                resolve(this.result);
                            };
                            reader.readAsText(file);
                        }, reject);
                    }, reject);
                });
            });
        }

        // Function to write to a file in the extension
        function writeToFile(filename, content) {
            return new Promise((resolve, reject) => {
                chrome.runtime.getPackageDirectoryEntry(function(root) {
                    root.getFile(filename, {create: true}, function(fileEntry) {
                        fileEntry.createWriter(function(fileWriter) {
                            fileWriter.onwriteend = function() {
                                resolve();
                            };
                            fileWriter.onerror = reject;
                            var blob = new Blob([content], {type: 'text/html'});
                            fileWriter.write(blob);
                        }, reject);
                    }, reject);
                });
            });
        }

        // Load WorkingPage.html
        fetchExtensionFile('WorkingPage.html')
            .then(workingPageContent => {
                if (workingPageContent.trim() === '') { // If empty
                    // Load BasePage.html and write to WorkingPage.html
                    return fetchExtensionFile('BasePage.html')
                        .then(baseContent => writeToFile('WorkingPage.html', baseContent))
                        .then(() => fetchExtensionFile('WorkingPage.html'));
                } else {
                    // Use existing content from WorkingPage.html
                    return Promise.resolve(workingPageContent);
                }
            })
            .then(content => {
                rightPanelTextarea.value = content;
                rightPanelTextarea.addEventListener('input', function(e) {
                    var leftPanelIframe = document.getElementById('left-panel').querySelector('iframe');
                    if (leftPanelIframe) {
                        leftPanelIframe.srcdoc = e.target.value;
                    }
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});