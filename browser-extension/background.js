// Background service worker for the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'SHOW_NOTIFICATION':
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: request.title,
                message: request.message
            });
            break;

        case 'OPEN_TAB':
            chrome.tabs.create({ url: request.url });
            break;

        case 'TRACK_JOB':
            // Handle job tracking data
            console.log('Job tracked:', request.data);
            break;
    }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Show welcome page or setup
        chrome.tabs.create({
            url: 'popup.html'
        });
    }
});
