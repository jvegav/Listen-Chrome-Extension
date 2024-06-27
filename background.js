chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "selectedText") {
		chrome.runtime.sendMessage(message);
	}
});
