const speechSynth = window.speechSynthesis;
const select = document.getElementById("voices");

function voicesPopulate() {
	// First call to populateOptions to trigger voiceschanged event if needed
	populateOptions();
	// Add event listener for voiceschanged event
	speechSynth.addEventListener("voiceschanged", populateOptions);
}

function populateOptions() {
	let voices = speechSynth.getVoices();

	console.log("voices before:" + voices.length);

	if (voices.length === 0) {
		// Retry after a short delay if no voices are available yet
		setTimeout(populateOptions, 100);
		return;
	}

	console.log("voices with filter" + voices.length);

	select.innerHTML = "";

	voices.forEach((voice, index) => {
		const optionElement = document.createElement("option");
		optionElement.value = index;
		optionElement.textContent = voice.name;
		select.appendChild(optionElement);
	});

	chrome.storage.sync.get(["preferredVoiceIndex"], function (result) {
		if (result.preferredVoiceIndex !== undefined) {
			select.value = result.preferredVoiceIndex;
		}
	});
}

function speakWithPreferredVoice() {
	const selectedIndex = select.value;
	chrome.storage.sync.set({ preferredVoiceIndex: selectedIndex });
}

select.addEventListener("change", speakWithPreferredVoice);

voicesPopulate();

document.getElementById("play").addEventListener("click", function () {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			files: ["content.js"],
		});
	});
});

chrome.runtime.onMessage.addListener((message) => {
	if (message.action === "play") {
		const text = message.text;

		if (!speechSynth.speaking && text.trim().length) {
			const newUtter = new SpeechSynthesisUtterance(text);
			const voices = speechSynth.getVoices();
			newUtter.voice = voices[select.value];
			speechSynth.speak(newUtter);
		}

		setTimeout(() => {}, 5000);
	}
});

document.getElementById("pause").addEventListener("click", function () {
	speechSynth.cancel();
});
