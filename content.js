(function () {
	const selection = window.getSelection();
	if (selection.rangeCount > 0) {
		console.log(selection.rangeCount);

		chrome.runtime.sendMessage({
			action: "play",
			text: selection.toString(),
		});
	}
})();
