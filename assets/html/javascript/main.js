$(document).ready(function () {
	$("#dialect").autocomplete({
		source: "assets/data/trial-dialects.json",
		minLength: 0,
		select: function (event, ui) {
			console.log(ui.item, this);
			$(this).attr('data-value', ui.item.data);
		}
	}).focus(function () {
		// $(this).val('');
		$(this).keydown();
	});
});