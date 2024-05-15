$(document).ready(function () {
	$("#dialect").autocomplete({
		source: "assets/data/trial-dialects.json",
		minLength: 0,
		autoFocus: true,
		select: function (event, ui) {
			// console.log(ui.item, this);
			$(this).attr('data-value', ui.item.data);
			$(this).attr('data-dialect', ui.item.dialect);
			translateText($('#last-copied-text').val(), 'en', ui.item.data);
		}
	}).focus(function () {
		// $(this).val('');
		$(this).keydown();
	});

	/* $('#last-copied-text').on('click', function (e) {
		var sText = detectClipboard();
		if (sText.length) {
			$(this).val(sText);
		}
	}).on('paste', function (e) {
		$(this).val('');
	}); */
	
	$('#start-record-btn').on('click', recordText);

	/* $(window).on('resize', function (e) {
		if (mobileCheck() || mobileAndTabletCheck()) {
			$('#start-record-btn').css({ 'margin': 'auto', 'margin-bottom': '10px' });
		} else {
			$('#start-record-btn').css({ 'margin': '-50px 0 10px', 'margin-bottom': 'auto' });
		}
	});
	$(window).resize(); */

	$('#start-speak-btn').click(function () {
		// console.log(isSpeaking);
		if (isSpeaking == false) {
			var text = $('#translated-text').text();
			if (text.trim() === '') {
				showToast({ content: 'Please enter some text to translate', type: 'bad' });
				return;
			}
			// Cancel any ongoing speech synthesis
			window.speechSynthesis.cancel();
	
			try {
				if (speechQueue.length == 0) {
					speechQueue = splitTextIntoChunks(text, MAX_CHUNK_LENGTH);
				} else {
					isSpeaking = false;
				}
				speakNextChunk();
			} catch (error) {
				showToast({ content: error, type: 'bad' });
			}
		} else {
			window.speechSynthesis.cancel();
			isSpeaking = false;
			showToast({ content: 'Speaker Stopped', type: 'info' });
		}
	});
});

var speechQueue = [];
var isSpeaking = false;
var MAX_CHUNK_LENGTH = 200;

function splitTextIntoChunks(text, maxLength) {
	var chunks = [];
	var start = 0;
	while (start < text.length) {
		var end = Math.min(start + maxLength, text.length);
		if (end < text.length) {
			while (end > start && !/\s/.test(text[end])) {
				end--;
			}
		}
		chunks.push(text.slice(start, end).trim());
		start = end;
	}
	return chunks;
}

function speakNextChunk() {
	if (speechQueue.length === 0 || isSpeaking) {
		isSpeaking = false;
		return;
	}

	var sLanguage = $("#dialect").attr('data-dialect');
	// console.log(sLanguage);

	isSpeaking = true;
	var chunk = speechQueue.shift();
	var utterance = new SpeechSynthesisUtterance(chunk);
	utterance.lang = sLanguage; // Set the language
	utterance.onend = function () {
		// console.log(speechQueue, isSpeaking);
		isSpeaking = false;
		return speakNextChunk();
	};
	window.speechSynthesis.speak(utterance);
}