var prosvetUrl = 'forumlocal.ru';
var booksViewerUrl = 'ya.ru';


function sendMessage(tabId, message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabId, {message: message});
    });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    // No tabs or host permissions needed!
    // console.log('Turning ' + tab.url + ' blue!');

    // chrome.tabs.executeScript({
    //     code: 'document.body.style.backgroundColor="red"'
    // });
    // chrome.tabs.executeScript(tab.id, {file: "js/bundle.js"}, function() {
        // Note: we also sent a message above, upon loading the event page,
        // but the content script will not be loaded at that point, so we send
        // another here.
        // sendMessage();
    // });
    sendMessage(tab.id, 'icon:clicked');
});


chrome.commands.onCommand.addListener(function(command) {
    console.log('onCommand');
    if (command === 'toggle-feature-foo') {
        chrome.tabs.query({},function(tabArray){
            if (true) {
                var tabExist = false;
                tabArray.forEach(function(tab) {
                    if (tab.url.split('//')[1].search(prosvetUrl) === 0) {
                        tabExist = true;
                        chrome.tabs.update(tab.id, {active: true});
                        chrome.windows.update(tab.windowId, {focused: true});
                        sendMessage(tab.id, 'icon:clicked');
                    }
                });
            } else {
                var tabExist = true;
            }
            if (!tabExist) {
                chrome.tabs.create({url: `http://${prosvetUrl}`})
            }
        });
    } else if (command === 'open-books-viewer') {
        console.log('books viewer');
        chrome.tabs.query({},function(tabArray) {
            let tabExist = false;
            tabArray.forEach(function (tab) {
                if (tab.url.split('//')[1].search(booksViewerUrl) === 0) {
                    tabExist = true;
                    chrome.tabs.update(tab.id, {active: true});
                    chrome.windows.update(tab.windowId, {focused: true});
                }
            });
            if (!tabExist) {
                chrome.tabs.create({url: `http://${booksViewerUrl}`})
            }
        });
    }
});