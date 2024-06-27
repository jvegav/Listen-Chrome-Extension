const speechSynth = window.speechSynthesis;

const select = document.getElementById("voices");

function voicesPopulate() {
	speechSynth.addEventListener("voiceschanged", populateOptions);
	populateOptions();
	chrome.storage.sync.get(["preferredVoiceIndex"], function (result) {
		if (result.preferredVoiceIndex !== undefined) {
			select.value = result.preferredVoiceIndex;
		}
	});
}

// Function to populate options
function populateOptions() {
	const voices = speechSynth.getVoices().filter((voice) => {
		return voice.name.includes("Google");
	});

	select.innerHTML = "";

	voices.forEach((voice, index) => {
		const optionElement = document.createElement("option");
		optionElement.value = index;
		optionElement.textContent = voice.name;
		select.appendChild(optionElement);
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
			const voices = speechSynth
				.getVoices()
				.filter((voice) => voice.name.includes("Google"));
			newUtter.voice = voices[select.value];
			speechSynth.speak(newUtter);
		}

		setTimeout(() => {}, 5000);
	}
});

document.getElementById("pause").addEventListener("click", function () {
	speechSynth.cancel();
});
