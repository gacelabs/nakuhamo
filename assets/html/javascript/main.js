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
		const text = $('#translated-text').text();
		if (text.trim() === '') {
			showToast({ content: 'Please enter some text to translate', type: 'bad' });
			return;
		}
		let sLanguage = $("#dialect").attr('data-dialect');
		window.speechSynthesis.cancel();

		if (sLanguage) {
			try {
				console.log(sLanguage);
				const utterance = new SpeechSynthesisUtterance(text);
				utterance.lang = sLanguage; // Set the language
				window.speechSynthesis.speak(utterance);
			} catch (error) {
				showToast({ content: error, type: 'bad' });
			}
		}
	});
});