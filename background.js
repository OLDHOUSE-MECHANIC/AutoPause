'use strict';
js: ['ContentScript.js'],
matches: p.origins,
excludeMatches: exclude,
allFrames: true,
matchOriginAsFallback: true,
runAt: 'document_start'
},
{
id: 'WindowScript',
js: ['WindowScript.js'],
matches: p.origins,
excludeMatches: exclude,
allFrames: true,
runAt: 'document_start',
world: 'MAIN'
}
]);
});
}


async function updateExtensionScripts() {
await initializationCompletePromise;
await updateContentScripts();
const tabs = await chrome.tabs.query({});
tabs.forEach(async (tab) => {
if (!tab.url || !tab.id || isUrlExcluded(tab.url)) return;
chrome.tabs.sendMessage(tab.id, {type: 'hi ya!'}).catch(async () => {
if (isUrlExcluded(tab.url)) return;
await chrome.scripting.executeScript({
target: {
tabId: tab.id,
allFrames: true
},
files: ['ContentScript.js'],
injectImmediately: true
});
await chrome.scripting.executeScript({
target: {
tabId: tab.id,
allFrames: true
},
files: ['WindowScript.js'],
world: 'MAIN',
injectImmediately: true
});
send(tab.id, 'new');
});
});
}


async function checkIdle(userState) {
await initializationCompletePromise;
if (!hasProperty(options, 'checkidle')) return;
if (userState === 'locked') {
state.waslocked = true;
// Security: While locked no media should be playing and state.denyPlayback should stay true.
state.denyPlayback = true;
// Pause everything
pauseAll();
} else if (state.waslocked) {
state.waslocked = false;
state.denyPlayback = false;
const tabId = getResumeTab();
if (tabId !== false) play(tabId);
}
save();
}


if (chrome.idle) {
chrome.idle.onStateChanged.addListener(checkIdle);
}


chrome.permissions.onAdded.addListener(updateExtensionScripts);
chrome.permissions.onRemoved.addListener(updateContentScripts);



