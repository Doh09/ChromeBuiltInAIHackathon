## Demonstration video
https://www.youtube.com/watch?v=OpnJnBUXxJE

## Setup
Please note. The main Chrome extension for the Hackathon is the folder called Secretarian Nano. The other folders are for examples of implementing new features that will be added in the future. 
These folders also work as separate extensions.

The setup for Secretarian is to ensure you have the Gemini Prompt LLM set up. And that you are signed up as a beta tester for the built-in Nano LLM.
You must then ensure you are running Google Chrome on the Canary version. Then go to Chrome extension page, enable developer mode and upload the package.

You may need to adjust some of the file paths as they are set as fixed rather than relative paths currently. In the gemini nano folder. 
You can see this if the console complains about a path when opening the extension.
I expect this is needed for the paths to the basepage and the twinpanelspage.

When testing. Please open the extension popup, then click to open twin panels. Afterwards, while on the twin panels page. Enter the prompt for a brief website description.
Then click the "apply changes" button. You can see the result in the video. https://www.youtube.com/watch?v=OpnJnBUXxJE

Please be aware that as I work on a laptop relying on integrated GPU. You may need to wind forward the video 3-4 minutes. While the GPU is thinking.

## Description of the project

## Inspiration
I am inspired by the opportunity to code websites more easily agnostically of what framework I use. This Chrome extension lets you do that with the help of an LLM.
## What it does
Lets you select either to use the built-in Gemini Nano LLM. Or an external LLM called via HTTP. You can then write a website description and it will make the base HTML page (with styling) for you. There is a pre-written prompt guiding the LLM for best results. The pre-written prompt instructs the LLM to only respond with the code that goes between the <html> and </html> tags.
## How we built it
I use Visual Studio Code and work in Google Chrome's Canary version. The project is in one folder for ease of navigation, but could be split into subfolders if needed. The default LLM is Gemini Nano. I have set the relevant permissions in the manifest.json, created the icon files, created the javascript files and HTML files needed. And then put them all a folder. Which I then upload in Google Chrome Canary with the developer setting enabled. Under chrome://extensions/.

I have created 3 other extensions with functionality I wish to integrate into this extension too. I made those functionalities in separate extensions so as to keep the code simpler when testing new features. That means that I have 3 other extensions where:
+ A Github personal access token can be used, alongside a HTTPS url address to a Github repository and the name of the default branch for the repository. To download the Github repository, list its files, click those files and review them for editing.
+ A folder can be uploaded, the files in the folder clicked and their content be seen.
+ The sidepanel closing and opening works directly with the chrome extension icon.

The idea is to store the files in chrome.storage.local while working on them in browser. And then having the option to push them to Git or to download them after, as individual files or as zip files.

I also have it working so that the Grok AI can be used in place of the Gemini-Nano LLM if one wishes to do so. Or for that matter. Any other LLM contactable by HTTPS.
## Challenges we ran into
There were some permissions for folder upload that worked in Chrome Extenion's popup.html window but not in the sidepanel window. I had this confirmed by implementing exactly the same code both places, and ensuring all relevant permissions were set. It still only worked in the popup. An online search suggested this can be because the sidepanel does not have all the same possibilities that the popup itself has. I tried circumventing it with an offscreen document, but the scripting file for that purpose did not load. Gemini Nano sometimes had startup hiccups but overall it works.
## Accomplishments that we're proud of
I made the built-in LLM, Gemini Nano, able to generate a website. Which is then displayed in-browser immediately after. 
## What we learned
A lot more about Chrome extensions.
## What's next for Built-In Secretary/Coding assistant
I will integrate the functionality from the 3 other mentioned extensions I made. So that the full project will work in sidepanel. With upload and download of folders. With connection to Git for clone, add, commit, push (via a personal access token with fine-grained access). These functionalities exist in separate extensions but I need to integrate them into this existing main one. So that all of it works in one extension.

Effectively that will mean that the chrome extension allows an in-browser IDE for code editing. With direct Git integration. The Git clone part works in the extension I made for that, so does also the file list and select to view the file. So if I add that, and add the folder upload/download, it is like a very easy to acquire IDE.

The downside is that you require a personal access token. The upside is that you can edit files directly in browser with LLM assistance without using an external website.

The code and files need to be cleaned up. Overall it is a project well on its way though.

There are a few errors that need correction too. Like right now the LLM message to Geminin Nano only works the first time a tab is opened. But overall it works as it should. As demonstrated in the video.
