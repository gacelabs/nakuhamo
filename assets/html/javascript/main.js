$(document).ready(function () {
	$.ajax({
		url: "assets/data/translations.json",
		dataType: "json",
		success: function (data) {
			// console.log(data);
			$('.dialect').autocomplete({
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
						// console.log($('.left-text').val(), sl, ui.item.code);
						translateText($('.left-text').val(), sl, ui.item.code);
					}

					if (mobileCheck() == false) {
						runRecentLanguagesActive(direction, ui.item);
					}

					$('.added-btn').off('click').on('click', function (e) {
						var currentActive = $(this).parents('[id*=recent-languages-]');
						setTimeout(() => {
							var sDirection = currentActive.attr('id').replace('recent-languages-', '');
							$('#recent-languages-' + sDirection).find('button:not(.first-buts)').removeClass('active');
							$(this).addClass('active');
							if (sDirection == 'right') {
								testTranslator();
							} else {
								var sl = currentActive.find('button.active:not(.first-buts)').attr('data-dialect');
								sl = (sl == undefined) ? $(".dialect[data-index=left]").attr('data-dialect') : sl;
								var tl = $(this).attr('data-dialect');
								translateText($('.left-text').val(), sl, tl, true);
							}
						}, 33);
					});
				},
				close: function (event, ui) {
					if (mobileCheck() == false) {
						var buttonAll = $('#recent-languages-' + $(this).attr('data-index')).find('button:not(.first-buts)');
						if (buttonAll.length < 4) {
							$(this).val('');
						}
					}
				}
			}).focus(function () {
				$(this).autocomplete("search");
			});
		}
	});
	
	var actualClientHeight = $('textarea:first').get(0).clientHeight;
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
			$(this).prev('.clear-text-btn').trigger('click');
			$('.share-box').addClass('hide');
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
			$(this).prev('.clear-text-btn').trigger('click');
			$('.share-box').addClass('hide');
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
			$('.share-box').addClass('hide');
			$('textarea').css('height', actualClientHeight + 'px');
		}
	});
	
	$('.clear-text-btn').on('click', function (e) {
		$('.share-box').addClass('hide');
		$('textarea').val('');
		$('textarea').css('height', actualClientHeight + 'px');
		$(this).hide();
		resetUrlOrigin();
	});

	detectLanguage(function (translations) {
		var urlSearch = window.location.search;
		if (urlSearch.trim().length) {
			var oParams = getAllURLParams();
			// console.log(oParams);
			$('.left-text').val(oParams.q);
			$('.clear-text-btn').show();

			var oLanguages = new JSONQuery(translations);
			var query = {
				select: { fields: '*' },
				where: {
					condition: [
						{ field: 'code', operator: '=', value: oParams.sl },
					]
				}
			};
			var result = oLanguages.execute(query);
			// console.log(result);
			if (result.data.length) {
				runRecentLanguagesActive('left', result.data[0]);
			}

			var oLanguages = new JSONQuery(translations);
			var query = {
				select: { fields: '*' },
				where: {
					condition: [
						{ field: 'code', operator: '=', value: oParams.tl },
					]
				}
			};
			var result = oLanguages.execute(query);
			// console.log(result);
			if (result.data.length) {
				runRecentLanguagesActive('right', result.data[0]);
			}

			setTimeout(() => {
				translateText(oParams.q, oParams.sl, oParams.tl);
				// speakNow({ target: $('#action-panel-right').find('.start-speak-btn').get(0) });
			}, 33);
		}
	});

	runRecordText();

	$('.start-speak-btn').on('click', function (e) {
		if ($(this).prop('tagName') != 'A') {
			var e = { target: $(this).parent('a').get(0) };
		}
		speakNow(e);
	});

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
	var buttonAll = $('#recent-languages-' + direction).find('button:not(.first-buts)');
	var bCreated = false;
	
	if (buttonAll.length < 4) {
		if (buttonAll.is('[data-dialect="' + item.code + '"]') == false) {
			$('#recent-languages-'+direction).find('button:not(.first-buts)').removeClass('active');
			var buttonFirst = $('#recent-languages-'+direction).find('button.first-buts');
			if (buttonAll.length == 0) {
				var buttonFirstClone = buttonFirst.clone(true).removeClass('hide first-buts').insertAfter(buttonFirst);
			} else {
				var buttonFirstClone = buttonFirst.clone(true).removeClass('hide first-buts').insertAfter(buttonAll.last());
			}
			
			buttonFirstClone
				.html('<i class="fa fa-remove token-clear"></i>' + item.label)
				.attr({ 'data-dialect': item.code })
				.addClass('active added-btn');

			bCreated = true;
		
			if (mobileCheck()) {
				$('.dialect[data-index="' + direction + '"]').val(item.label).attr('data-dialect', item.code);
			}
			
			$('.token-clear').off('click').on('click', function (e) {
				e.stopPropagation();
				resetUrlOrigin();
				var parentGroup = $(this).parents('[id*=recent-languages-]');
				var parentBtn = $(this).parent('.added-btn');
				if (parentBtn.prev('.added-btn').length) {
					parentBtn.prev('.added-btn').trigger('click');
				} else if (parentBtn.next('.added-btn').length) {
					parentBtn.next('.added-btn').trigger('click');
				} else {
					setTimeout(() => {
						parentGroup.find('.dialect').val('').trigger('focus');
					}, 77);
					if (parentGroup.attr('id') == 'recent-languages-right') {
						$('.share-box').addClass('hide');
						$('.right-text').val('');
					} else if (parentGroup.attr('id') == 'recent-languages-left') {
						$('.left-text').val('');
					}
				}
				parentBtn.remove();
			});
		}
	}

	if (bCreated == false) {
		$.each(buttonAll, function (i, elem) {
			if ($(elem).hasClass('active') == false && $(elem).attr('data-dialect') == item.code) {
				$(elem).trigger('click');
			}
		});
	}
}