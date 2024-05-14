var detectClipboard = async function() {
	try {
		// Request permission to read from the clipboard
		const permission = await navigator.permissions.query({ name: 'clipboard-read' });
		// console.log(permission.state);
		if (permission.state === 'granted' || permission.state === 'prompt') {
			// Read the text from the clipboard
			const text = await navigator.clipboard.readText();
			$('#last-copied-text').text(text);
			// console.log(detectLanguage(text));
			// translateText(text, 'en', 'es');
		} else {
			console.error('Clipboard access denied.');
		}
	} catch (err) {
		console.error('Failed to read clipboard contents: ', err);
	}
}

var translateText = function (text, sourceLang, targetLang) {
	$.ajax({
		url: 'https://translate.googleapis.com/translate_a/single',
		type: 'GET',
		dataType: 'json',
		data: {
			client: 'gtx',
			sl: sourceLang,
			tl: targetLang,
			dt: 't',
			q: text
		},
		success: function (response) {
			console.log(response);
			if (response && response[0] && response[0][0] && response[0][0][0]) {
				$('#translated-text').text(response[0][0][0]);
			} else {
				console.error('Failed to translate text.');
			}
		},
		error: function (xhr, status, error) {
			console.error('Error translating text:', error);
		}
	});
}

function detectLanguage(text) {
	const detectedLangCode = franc(text);
	if (detectedLangCode === 'und') {
		return false;
	} else {
		const detectedLang = iso6393[detectedLangCode] ? iso6393[detectedLangCode].name : detectedLangCode;
		return detectedLang;
	}
}