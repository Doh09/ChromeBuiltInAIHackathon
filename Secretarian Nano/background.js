let baseWebsite = "";
let currentWebsite = "WEBSITE NOT SET YET";
let baseWebsiteSet = false;
let currentTabId;
let CURRENTCHUNK = "";

async function getCurrentTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            console.log('Tabs query result:', tabs);
            if (tabs[0]) {
                resolve(tabs[0]);
            } else {
                console.log('No active tab found during getCurrentTab');
                resolve(null);
            }
        });
    });
}

async function newAIScript(tabId, prompt)
{
    const model = await self.ai.languageModel.create();
    //await model.countPromptTokens('Hey there!');
    // 4809, which is obviously more than 1204.
    try {
        return await model.prompt(prompt);
    } catch(err) {
    console.error(err);
    
}

}

function executeAIScript(tabId, prompt) {
    return new Promise((resolve, reject) => {
        console.log('Executing AI script in tab:', tabId);
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: async (prompt) => {
                // Check if ai object exists
                if (typeof ai === 'undefined') {
                    throw new Error('AI object not found in page context');
                }

            console.log('AI script function called with prompt:', prompt);
            console.log('Window AI object:', window.ai);
            console.log('Document readyState:', document.readyState);

            try {
                //chrome.tabs.sendMessage(tabs[0].id, {command: "getFullHTML"}, function(response) {
                    //if (chrome.runtime.lastError) {
                    //  console.error(chrome.runtime.lastError);
                    //} else {
                    //  console.log("Full HTML content received:", response.html);
                    //  CURRENTCHUNK = response.html;
                      // Process the full HTML here
                    //}
                  //});

                const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
                console.log('AI capabilities:', {available, defaultTemperature, defaultTopK, maxTopK});
                
                if (available !== "no") {
                    const session = await ai.languageModel.create();
                    console.log('AI session created');
                    
                    const stream = await session.promptStreaming(prompt);
                    let allChunks = [];
                    
                    try {
                        for await (const chunk of stream) {
                            allChunks.push(chunk);
                        }
                    } catch (streamError) {
                        console.error('Stream processing error:', streamError);
                        throw streamError;
                    }
                    
                    console.log('AI stream collected chunks:', allChunks);
                    return allChunks;
                } else {
                    console.log('AI Language Model is not available');
                    throw new Error("AI Language Model is not available");
                }
            } catch (error) {
                console.error('Error in AI script execution:', error);
                throw error;
            }
        },
        args: [prompt],
        world: 'MAIN'
    }, (injectionResults) => {
        if (chrome.runtime.lastError) {
            console.error('Script injection error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
        }
        
        const result = injectionResults[0];
        if (result.error) {
            console.error('Execution error:', result.error);
            reject(new Error(result.error.message));
            return;
        }
        
        if (result.result) {
            console.log('Script execution results:', result.result);
            resolve(result.result);
        } else {
            console.error('No results from AI execution');
            reject(new Error('No results received from AI execution'));
        }
    });
});
}

// Helper function to ensure AI is available
async function waitForAI(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: () => {
                return new Promise((resolve) => {
                    if (typeof ai !== 'undefined') {
                        resolve(true);
                        return;
                    }

                const checkInterval = setInterval(() => {
                    if (typeof ai !== 'undefined') {
                        clearInterval(checkInterval);
                        resolve(true);
                    }
                }, 100);
                
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve(false);
                }, 5000);
            });
        },
        world: 'MAIN'
    }, (results) => {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
        }
        resolve(results[0].result);
    });
});
}

async function sendHTTPRequest(url, method, headers, body, changeRequest) {
    let generalInstructions = "Use HTML and CSS. Only write the parts in between the \"<html>\" and \"</html>\" sections. Dont add explanations. The code should be directly usable in a .html file. Dont add ``` tags, the html must be directly injectable in a website for local website creation. Always return the full website code with your adjustments made. Please note that the css and html should be mixed into one so all of it is within the html tags.";
    const prompt = "Here are general instructions: " + generalInstructions + ". Here is how I want you to create or modify: " + changeRequest + ", that was the end of the modification instruction. The current website looks like everything in between the html tags here: " + CURRENTCHUNK + ", that was the end of the website.";

    const jsonBody = JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a programmer."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0
      });
    try {
        const response = await fetch(url, {
            method: method,
            headers: Object.fromEntries(headers.map(header => Object.entries(header)[0])),
            body: jsonBody || undefined
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error('Error during HTTP request:', error);
        throw error;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request.type);
    console.log("request.data:", request.data);

    if (request.type === "setBasePage") {
        CURRENTCHUNK = request.data;
    }

    if (request.type === "applyChanges") {
        (async () => {
            try {
                const tab = await getCurrentTab();
                if (!tab) {
                    console.log('No active tab found to process request');
                    return;
                }

                currentTabId = tab.id;
                console.log('Querying active tab ID:', tab.id);

                // Check for HTTP LLM or local AI processing
                if (request.data.llm === "http") {
                    const { url, method, headers, body, changeRequest } = request.data;
                    console.log({ url, method, headers, body, changeRequest });
                
                    // Send the HTTP request
                    const rawResponse = await sendHTTPRequest(url, method, headers, body, changeRequest);
                    console.log('Raw HTTP response:', rawResponse);
                
                    // Parse the response as JSON
                    let response;
                    try {
                        response = JSON.parse(rawResponse);
                        console.log('Parsed HTTP response:', response);
                        
                        // Now you can access the content using dot notation
                        CURRENTCHUNK = response.choices[0].message.content;
                    } catch (error) {
                        console.error('Failed to parse JSON:', error);
                        // Handle the error appropriately, maybe set CURRENTCHUNK to an error message or handle as needed
                        CURRENTCHUNK = "Error processing response: " + error.message;
                    }
                } else {
                    // Wait for AI to be available
                    const aiAvailable = await waitForAI(tab.id);
                    if (!aiAvailable) {
                        throw new Error('AI not available after waiting');
                    }

                    let generalInstructions = "Use HTML and CSS. Only write the parts in between the \"<HTML><!DOCTYPE html>\" and \"</html>\" sections. Dont add explanations. The code should be directly usable in a .html file. Dont add ``` tags, the html must be directly injectable in a website for local website creation. Always return the full website code with your adjustments made. Please note that the css and html should be mixed into one so all of it is within the html tags.";
                    const prompt = "Here are general instructions: " + generalInstructions + ". Here is how I want you to create or modify: " + request.data.changeRequest + ", that was the end of the modification instruction. The current website looks like everything in between the html tags here: " + CURRENTCHUNK + ", that was the end of the website.";
                    const chunks = await newAIScript(tab.id, prompt);//await executeAIScript(tab.id, prompt);
                    console.log('Chunks received from AI:', chunks);
                    CURRENTCHUNK = chunks;
                    
/*                     for (const chunk of chunks) {
                        console.log('Processing chunk:', chunk);
                        CURRENTCHUNK = chunk;
                        await new Promise((resolve) => {
                            chrome.tabs.sendMessage(tab.id, { 
                                type: "updateContent", 
                                data: CURRENTCHUNK 
                            }, (response) => {
                                if (chrome.runtime.lastError) {
                                    console.error('Error sending message to tab:', chrome.runtime.lastError);
                                } else {
                                    console.log('Message sent to tab for chunk', chunk);
                                }
                                resolve();
                            });
                        });
                    } */
                }
                
                // Update the content in the tab after processing
                chrome.tabs.sendMessage(tab.id, { 
                    type: "updateContent", 
                    data: CURRENTCHUNK 
                });

            } catch (error) {
                console.error('Error processing request:', error);
            }
        })();
        return true; // Indicates async response
    }
});

async function init() {
    console.log('Starting initialization...');
    try {
        const tab = await getCurrentTab();
        if (tab) {
            currentTabId = tab.id;
            console.log('Current tab ID set:', currentTabId);
        } else {
            console.log('Initialization failed: No active tab');
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

init();