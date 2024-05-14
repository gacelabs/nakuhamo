$(document).ready(function () {
	$("#dialect").autocomplete({
		source: "assets/data/trial-dialects.json",
		minLength: 0,
		autoFocus: true,
		select: function (event, ui) {
			// console.log(ui.item, this);
			$(this).attr('data-value', ui.item.data);
			translateText($('#last-copied-text').val(), 'en', ui.item.data);
		}
	}).focus(function () {
		// $(this).val('');
		$(this).keydown();
	});

	var i = setInterval(() => {
		var sText = detectClipboard();
		if (sText.length) {
			$('#last-copied-text').val(sText);
			clearInterval(i);
		}
	}, 1000);
});