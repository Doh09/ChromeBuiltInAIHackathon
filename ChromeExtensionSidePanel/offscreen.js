// offscreen.js
console.log("Offscreen.js load");

function myFunction(data) {
    // Your function logic here
    console.log("Function called with data:", data);
    // Do something with data
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.target === 'offscreen' && request.action === 'callFunction') {
        myFunction(request.data);
        sendResponse({ result: "Function executed" });
    }
});
console.log("Offscreen.js load 100%");