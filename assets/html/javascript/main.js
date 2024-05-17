$(document).ready(function () {
	$.ajax({
		url: "assets/data/translations.json",
		dataType: "json",
		success: function (data) {
			// console.log(data);
			$(".dialect").autocomplete({
				source: data,
				minLength: 0,
				// autoFocus: true,
				select: function (event, ui) {
					// console.log(ui.item, this);
					$(this).attr('data-dialect', ui.item.code);
					if ($(this).attr('data-index') == 'left') {
						var direction = 'left';
						var currentActive = $(this).parents('[id*=recent-languages-]').find('button.active:not(.first-buts)');
						var sl = currentActive.attr('data-dialect');
						var tl = $(this).attr('data-dialect');
						translateText($('.left-text').val(), sl, tl, true);
						testTranslator();
					} else {
						var direction = 'right';
						var sl = $('#recent-languages-left').find('button.active').attr('data-dialect');
						sl = (sl == undefined) ? $(".dialect[data-index=left]").attr('data-dialect') : sl;
						console.log($('.left-text').val(), sl, ui.item.code);
						translateText($('.left-text').val(), sl, ui.item.code);
					}
					runRecentLanguagesActive(direction, ui.item);

					$('.added-btn').off('click').on('click', function (e) {
						var currentActive = $(this).parents('[id*=recent-languages-]').find('button.active:not(.first-buts)');

						setTimeout(() => {
							$(this).parents('[id*=recent-languages-]').find('button:not(.first-buts)').removeClass('active');
							$(this).addClass('active');
							var sDirection = $(this).parents('[id*=recent-languages-]').attr('id');
							if (sDirection == 'recent-languages-right') {
								// console.log(sDirection);
								testTranslator();
							} else {
								var sl = currentActive.attr('data-dialect');
								var tl = $(this).attr('data-dialect');
								translateText($('.left-text').val(), sl, tl, true);
							}
						}, 33);
					});
				},
				close: function (event, ui) {
					if ($(this).attr('data-index') == 'left') {
						var buttonAll = $('#recent-languages-left').find('button:not(.first-buts)');
					} else {
						var buttonAll = $('#recent-languages-right').find('button:not(.first-buts)');
					}
					if (buttonAll.length <= 4) {
						$(this).val('');
					}
				}
			}).focus(function () {
				$(this).keydown();
			});
		}
	});
	
	var actualClientHeight = $('textarea:first').get(0).clientHeight
	$('textarea').on('keypress', function (e) {
		if (mobileCheck() == false) {
			if (e.keyCode == 13 || this.clientHeight < this.scrollHeight) {
				var height = parseInt($(this).css('height'));
				$('textarea').css('height', height + 30 + 'px');
			}
		}
	}).on('keydown', function (e) {
		if (mobileCheck() == false) {
			if (e.keyCode == 8 || e.keyCode == 46) {
				if (this.clientHeight > actualClientHeight) {
					var height = parseInt($(this).css('height'));
					$('textarea').css('height', height - 30 + 'px');
				}
			}
		}
		if ($(this).val().trim().length == 0) {
			$(this).prev('.clear-text-btn').hide();
			$('textarea').css('height', actualClientHeight + 'px');
		}
	}).on('paste', function (e) {
		if (mobileCheck() == false) {
			var height = parseInt($(this).css('height'));
			$('textarea').css('height', height + 30 + 'px');
		}
	}).on('cut', function (e) {
		if (mobileCheck() == false) {
			if (this.clientHeight > actualClientHeight) {
				var height = parseInt($(this).css('height'));
				$('textarea').css('height', height - 30 + 'px');
			}
		}
		if ($(this).val().trim().length == 0) {
			$(this).prev('.clear-text-btn').hide();
			$('textarea').css('height', actualClientHeight + 'px');
		}
	}).on('input', function (e) {
		$(this).prev('.clear-text-btn').show();
		var tl = $('#recent-languages-right').find('button.active').attr('data-dialect');
		tl = (tl == undefined) ? $(".dialect[data-index=right]").attr('data-dialect') : tl;
		// console.log($(this).val());
		if ($(this).val().trim().length) {
			if (tl != undefined) {
				testTranslator();
			}
		} else {
			$('textarea').val('');
			$(this).prev('.clear-text-btn').hide();
			$('textarea').css('height', actualClientHeight + 'px');
		}
	});
	
	$('.clear-text-btn').on('click', function (e) {
		$('textarea').val('');
		$('textarea').css('height', actualClientHeight + 'px');
		$(this).hide();
	});

	detectLanguage();
	runRecordText();
	$('.start-speak-btn').on('click', speakNow);

	/* $('.left-text').on('click', function (e) {
		var sText = detectClipboard();
		if (sText.length) {
			$(this).val(sText);
		}
	}).on('paste', function (e) {
		$(this).val('');
	}); */

	/* $(window).on('resize', function (e) {
		if (mobileCheck() || mobileAndTabletCheck()) {
			$('.start-record-btn').css({ 'margin': 'auto', 'margin-bottom': '10px' });
		} else {
			$('.start-record-btn').css({ 'margin': '-50px 0 10px', 'margin-bottom': 'auto' });
		}
	});
	$(window).resize(); */
});

var runRecentLanguagesActive = function (direction, item) {
	$('#recent-languages-'+direction).find('button:not(.first-buts)').removeClass('active');
	var buttonAll = $('#recent-languages-' + direction).find('button:not(.first-buts)');

	if (buttonAll.length < 4) {
		var buttonFirst = $('#recent-languages-'+direction).find('button.first-buts');
		if (buttonAll.length == 0) {
			var buttonFirstClone = buttonFirst.clone(true).removeClass('hide first-buts').insertAfter(buttonFirst);
		} else {
			var buttonFirstClone = buttonFirst.clone(true).removeClass('hide first-buts').insertAfter(buttonAll.last());
		}
		
		buttonFirstClone
			.text(item.label)
			.attr({ 'data-dialect': item.code })
			.addClass('active added-btn');
	
		if (mobileCheck()) {
			$('.dialect:' + (direction == 'left' ? 'first' : 'last') + ':visible').val(item.label).attr('data-dialect', item.code);
		}
	}
}