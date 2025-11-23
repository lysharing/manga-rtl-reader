// background.js (service worker)
chrome.action.onClicked.addListener((tab) => {
    if (!tab.id) return;
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['rtl.js']
    }).catch(err => console.error('Injection failed:', err));
});