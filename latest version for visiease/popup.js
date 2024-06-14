document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');
    button.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "describeImages"});
        });
    });
});
