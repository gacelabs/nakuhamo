var detectClipboard = async function () {
	try {
		// Request permission to read from the clipboard
		const permission = await navigator.permissions.query({ name: 'clipboard-read' });
		// console.log(permission.state);
		if (permission.state === 'granted' || permission.state === 'prompt') {
			// Read the text from the clipboard
			const text = await navigator.clipboard.readText();
			$('.left-text').text(text);
			// console.log(detectLanguage(text));
			// translateText(text, 'en', 'es');
		} else {
			console.error('Clipboard access denied.');
		}
	} catch (err) {
		console.error('Failed to read clipboard contents: ', err);
	}
}

var detectLanguage = function (fnCallBack) {
	try {
		$.get("https://ipinfo.io", function (ipinfo) {
			// console.log(ipinfo);
			var fnCall = function (tz_languages) {
				// console.log(tz_languages);
				var oLanguages = new JSONQuery(tz_languages);
				var query = {
					select: { fields: '*' },
					where: {
						condition: [
							{ field: 'timezone', operator: '=', value: ipinfo.timezone },
						]
					}
				};
				var result = oLanguages.execute(query);

				if (result.data.length) {
					var oData = result.data[0];
					// console.log(oData, oData.language_codes.split(','));
					var arCodes = oData.language_codes.split(',');
					var buttonFirst = $('#recent-languages-left').find('button.first-buts');
					var buttonFirstClone = buttonFirst.clone(true).text('Detecting language...').removeClass('hide first-buts').insertAfter(buttonFirst);
					$('.left-text').attr('disabled', 'disabled');
					$('#action-panel-left').css({ 'background-color' : '#fafafa;' });

					setTimeout(() => {
						$.ajax({
							url: "assets/data/translations.json",
							dataType: "json",
							success: function (translations) {
								for (var x in translations) {
									var translation = translations[x];
									if ($.inArray(translation.code, arCodes) >= 0) {
										$('#recent-languages-left').find('button:not(.first-buts)').removeClass('active');
										buttonFirstClone
											.html(translation.label)
											.attr({ 'data-dialect': translation.code })
											.addClass('active added-btn');
										
										translateText($('.left-text').attr('placeholder'), 'en', translation.code, 'placeholder-left');
										translateText($('.right-text').attr('placeholder'), 'en', translation.code, 'placeholder-right');
										if (mobileCheck()) {
											$(".dialect:first").val(translation.label).attr('data-dialect', translation.code);
										}
									}
								}
								$('.left-text').removeAttr('disabled');
								$('#action-panel-left').css({ 'background-color': '#fff;' });
							},
							complete: function (data) {
								if (typeof fnCallBack == 'function') fnCallBack(data.responseJSON);
							}
						});
					}, 1000);
				}
			};
			$.ajax({
				url: "assets/data/languages-tz.json",
				dataType: "json",
				success: fnCall
			});
		}, "json");
	} catch (err) {
		console.error('Failed to read clipboard contents: ', err);
	}
}

var translateText = function (text, sourceLang, targetLang, action) {
	$('.share-box').addClass('hide');
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
		timeout: 30000,
		beforeSend: function () {
			if (action == undefined && text.trim().length) {
				$('.right-text').val('Translating...');
				$('.share-box').addClass('hide');
			}
		},
		success: function (response) {
			// console.log(response);
			if (response && response[0]) {
				var sTranslated = '';
				response[0].forEach(element => {
					// console.log(element);
					sTranslated += element[0];
				});
				// console.log(sTranslated, action);
				if (sTranslated.trim().length) {
					if (action == undefined) {
						$('.right-text').val(sTranslated);
						$('.share-box').removeClass('hide');
						var sDataLink = window.location.href + `?sl=${sourceLang}&tl=${targetLang}&q=${text}`;
						$('.share-box').find('.dropdown-menu .dropdown-item').each(function (i, elem) {
							var sHref = $(elem).attr('data-href');
							elem.href = sHref+sDataLink;
						});
					} else if (action == true) {
						$('.left-text').val(sTranslated);
					} else if (action == 'placeholder-left') {
						$('.left-text').attr('placeholder', sTranslated);
					} else if (action == 'placeholder-right') {
						$('.right-text').attr('placeholder', sTranslated);
					}
				}
			} else {
				var isMobile = mobileCheck();
				showToast({ content: 'Please enter text or ' + (isMobile ? 'tap' : 'click') + ' microphone to talk.', type: 'bad' }, $('.start-record-btn'));
				console.error('Failed to translate text.');
			}
		},
		error: function (xhr, status, error) {
			console.error('Error translating text:', error);
		}
	});
}

String.prototype.ucWords = function () {
	return this.toLowerCase().replace(/\b[a-z]/g, function (letter) {
		return letter.toUpperCase();
	});
}

String.prototype.lines = function () { return this.split(/\r*\n/); }
String.prototype.lineCount = function () { return this.lines().length; }

window.mobileCheck = function () {
	let check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

window.mobileAndTabletCheck = function () {
	let check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

(function ($) {
	$.fn.disableSelection = function () {
		return this
			.attr('unselectable', 'on')
			.css('user-select', 'none')
			.on('selectstart', false);
	};
})(jQuery);

function urlParams() {
	var url = new URL(window.location.href);
	return url.searchParams;
}

var isMessageSpeaking = false;
function showToast(params, selector) {
	let toastClone = $('#tc-toast').clone().removeAttr('id');
	var arrStore = [];
	$('.toast-body:visible').map(function (i, elem) {
		arrStore.push($(this).text());
	})
	if ($.inArray(params.content, arrStore) < 0) {
		toastClone.find('.toast-body').html(params.content);
		toastClone.removeClass('bg-success bg-danger bg-warning bg-info');
		switch (params.type) {
			case 'good':
				toastClone.addClass('bg-success');
				break;
			case 'bad':
				toastClone.addClass('bg-danger');
				break;
			case 'alert':
				toastClone.addClass('bg-warning');
				break;
			case 'info':
				toastClone.addClass('bg-info');
				break;
		}
		$('.toast-container').prepend(toastClone);
		toastClone.toast({ delay: 13000 });
		toastClone.toast('show');
	
		if (typeof params.closure == 'function') {
			params.closure();
		}

		if (selector != undefined && selector.length) {
			for (i = 0; i < 3; i++) {
				selector.fadeTo('slow', 0.5).fadeTo('slow', 1.0);
			}
		}
	
		window.speechSynthesis.cancel();
		if (isMessageSpeaking) {
			isMessageSpeaking = false;
			return;
		}
		isMessageSpeaking = true;
		var utterance = new SpeechSynthesisUtterance(params.content);
		utterance.lang = 'en'; // Set the language
		utterance.onend = function () { isMessageSpeaking = false; };
		window.speechSynthesis.speak(utterance);
	}
}

function showNotification(title, body, redirectUrl) {
	if (("Notification" in window) == false) {
		console.error("This browser does not support desktop notification");
		showToast({ content: 'This browser does not support desktop notification.', type: 'bad' });
		return;
	}

	var options = {
		body: body,
		icon: '/assets/icons/toll-calc-b.png'
	};

	// Check if the user has granted permission to show notifications
	if (Notification.permission === "granted") {
		// If permission is granted, create a notification
		var notification = new Notification(title, options);

		notification.onclick = function (event) {
			event.preventDefault(); // Prevent the browser from focusing the Notification's tab
			window.open(redirectUrl, '_blank');
			notification.close();
		};

	} else if (Notification.permission !== "denied") {
		// If permission has not been denied, request permission
		Notification.requestPermission().then(function (permission) {
			if (permission === "granted") {
				var notification = new Notification(title, options);

				notification.onclick = function (event) {
					event.preventDefault(); // Prevent the browser from focusing the Notification's tab
					window.open(redirectUrl, '_blank');
					notification.close();
				};
			}
		});
	} else {
		showToast({ content: 'Cannot accept Notifications, site must be secured and on HTTPS protocol.', type: 'bad' });
	}
}

var requestPermission = function (origin_data, dest_data) {
	var permFn = function (permission) {
		if (permission === "granted") {
			recordLastQuery(origin_data, dest_data);
		} else {
			showToast({
				content: 'We highly recommend enabling notifications to ensure prompt assistance in retrieving all your requested query. Thanks!',
				type: 'info'/* ,
				closure: function () {
					setTimeout(() => {
						requestPermission(origin_data, dest_data);
					}, 1000);
				} */
			});
		}
	};
	Notification.requestPermission().then(permFn);
}

var runRecordText = function () {
	const startRecordBtn = $('.start-record-btn');
	const startSpeakBtn = $('.start-speak-btn');
	const capturedTextDiv = $('.left-text');
	var recognizedText = '';

	let recognition;
	if ('webkitSpeechRecognition' in window) {
		recognition = new webkitSpeechRecognition();
	} else if ('SpeechRecognition' in window) {
		recognition = new SpeechRecognition();
	} else {
		showToast({ content: 'Your browser does not support speech recognition. Please try this in Google Chrome.', type: 'bad' });
		return;
	}

	recognition.continuous = true; // Set to true for continuous recognition
	recognition.interimResults = false; // Set to true if you want to show interim results
	recognition.lang = 'en-US'; // Set the language of the recognition

	recognition.onstart = function () {
		startRecordBtn.attr('data-recording', 1);
		$('.right-text').val('Translating...');
	};

	recognition.onresult = function (event) {
		recognizedText += event.results[0][0].transcript;
		console.log(recognizedText);
	};
	
	recognition.onerror = function (event) {
		console.error(event.error);
		recognition.stop();
		showToast({ content: 'Error occurred in recognition: ' + event.error, type: 'bad' });
	};
	
	recognition.onend = function () {
		startRecordBtn.css({ 'color': '' });
		startSpeakBtn.css({ 'pointer-events': '', 'color': '' });
		startRecordBtn.removeAttr('data-recording');
		capturedTextDiv.val(recognizedText);
		$('.right-text').val('');
		testTranslator();
	};

	startRecordBtn.click(function () {
		startRecordBtn.css({ 'color': 'red' });
		if (startRecordBtn.attr('data-recording') != 1) {
			startSpeakBtn.css({ 'pointer-events': 'none', 'color': 'gray' });
			recognition.start();
			console.log("recorder started");
		} else {
			recognition.stop();
			console.log("recorder stopped");
		}
	});

	/* startSpeakBtn.click(function () {
		recognition.stop();
	}); */
}

var testTranslator = function () {
	var sl = $('#recent-languages-left').find('button.active').attr('data-dialect');
	sl = (sl == undefined) ? $(".dialect[data-index=left]").attr('data-dialect') : sl;
	var tl = $('#recent-languages-right').find('button.active').attr('data-dialect');
	tl = (tl == undefined) ? $(".dialect[data-index=right]").attr('data-dialect') : tl;

	// console.log(sl, tl);
	if (sl != undefined && tl != undefined) {
		translateText($('.left-text').val(), sl, tl);
	} else {
		if (sl == undefined && tl == undefined) {
			showToast({ content: 'Please select a languages to complete translation.', type: 'bad' });
		} else {
			if (sl == undefined && tl != undefined) {
				showToast({ content: 'Please select a language source.', type: 'bad' });
			} else if (sl != undefined && tl == undefined) {
				showToast({ content: 'Please select a language target.', type: 'bad' });
			}
		}
	}
}

var recordVoice = function (e) {
	if (navigator.mediaDevices) {
		console.log("getUserMedia supported.");
		const constraints = { audio: true };
		let chunks = [];

		navigator.mediaDevices
			.getUserMedia(constraints)
			.then((stream) => {
				const mediaRecorder = new MediaRecorder(stream);
				speakNow(mediaRecorder, chunks);
			}).catch((err) => {
				console.error(`The following error occurred: ${err}`);
			});
	}
}

var recordVoiceV1 = function (record, stop) {
	if (navigator.mediaDevices) {
		console.log("getUserMedia supported.");

		const constraints = { audio: true };
		let chunks = [];

		navigator.mediaDevices
			.getUserMedia(constraints)
			.then((stream) => {
				const mediaRecorder = new MediaRecorder(stream);

				record.onclick = () => {
					if (record.dataset.recording != true) {
						mediaRecorder.start();
						console.log(mediaRecorder.state);
						console.log("recorder started");
						record.style.background = "red !important";
						// record.style.color = "black";
						record.dataset.recording = true;
					} else {
						mediaRecorder.stop();
						console.log(mediaRecorder.state);
						console.log("recorder stopped");
						record.style.background = "";
					}
				};

				/* stop.onclick = () => {
					mediaRecorder.stop();
					console.log(mediaRecorder.state);
					console.log("recorder stopped");
					record.style.background = "";
					record.style.color = "";
				}; */

				mediaRecorder.onstop = (e) => {
					console.log("data available after MediaRecorder.stop() called.");

					const clipName = prompt("Enter a name for your sound clip");

					const clipContainer = document.createElement("article");
					const clipLabel = document.createElement("p");
					const audio = document.createElement("audio");
					const deleteButton = document.createElement("button");
					const mainContainer = document.querySelector("body");

					clipContainer.classList.add("clip");
					audio.setAttribute("controls", "");
					deleteButton.textContent = "Delete";
					clipLabel.textContent = clipName;

					clipContainer.appendChild(audio);
					clipContainer.appendChild(clipLabel);
					clipContainer.appendChild(deleteButton);
					mainContainer.appendChild(clipContainer);

					audio.controls = true;
					const blob = new Blob(chunks, { type: "audio/mp3; codecs=opus" });
					chunks = [];
					const audioURL = URL.createObjectURL(blob);
					audio.src = audioURL;
					console.log("recorder stopped");

					/* const a = document.createElement("a");
					a.href = audioURL;
					a.download = "myAudio.mp3";
					document.body.appendChild(a);
				
					console.log(a);
				
					a.click();
					URL.revokeObjectURL(audioURL);
					a.remove(); */

					deleteButton.onclick = (e) => {
						const evtTgt = e.target;
						evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
					};
				};

				mediaRecorder.ondataavailable = (e) => {
					chunks.push(e.data);
				};
			})
			.catch((err) => {
				console.error(`The following error occurred: ${err}`);
			});
	}
}

var recordVoiceWaves = function () {
	const margin = 10;
	const chunkSize = 50;

	// const input = document.querySelector("input");
	// const canvas = document.querySelector("canvas");
	const input = document.createElement("input");
	input.type = 'file';
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	const ac = new AudioContext();
	const { width, height } = canvas;
	const centerHeight = Math.ceil(height / 2);
	const scaleFactor = (height - margin * 2) / 2;

	async function drawToCanvas() {
		const buffer = await input.files[0].arrayBuffer();
		const audioBuffer = await ac.decodeAudioData(buffer);
		const float32Array = audioBuffer.getChannelData(0);

		const array = [];

		let i = 0;
		const length = float32Array.length;
		while (i < length) {
			array.push(
				float32Array.slice(i, i += chunkSize).reduce(function (total, value) {
					return Math.max(total, Math.abs(value));
				})
			);
		}

		canvas.width = Math.ceil(float32Array.length / chunkSize + margin * 2);

		for (let index in array) {
			ctx.strokeStyle = "black";
			ctx.beginPath();
			ctx.moveTo(margin + Number(index), centerHeight - array[index] * scaleFactor);
			ctx.lineTo(margin + Number(index), centerHeight + array[index] * scaleFactor);
			ctx.stroke();
		}
	}

	document.body.appendChild(input);
	document.body.appendChild(canvas);

	input.addEventListener("input", drawToCanvas);
}

function runVoiceRecorder(recorder, chunks) {
	recorder.onstart = () => {
		speakNext(recorder);
	};

	recorder.onstop = async (e) => {
		console.log("data available after recorder.stop() called.");
		const blob = new Blob(chunks, { type: "audio/mp3; codecs=opus" });
		chunks = [];
		const audioURL = URL.createObjectURL(blob);
		console.log("recorder stopped", audioURL);

		var response = await fetch(audioURL);
		var blobFile = await response.blob();
		var file = new File([blobFile], 'translated.mp3', { type: blobFile.type });

		if (navigator.share) {
			await navigator.share({
				files: [file],
				title: 'Share Translated Audio',
				// text: comments.value
			});
		} else {
			// Web Share API is not supported
			console.error('Web Share API is not supported.');
		}
	};

	recorder.ondataavailable = (e) => {
		chunks.push(e.data);
	};

	recorder.start();
}

var speechQueue = [];
var isSpeaking = false;
var MAX_CHUNK_LENGTH = 100;

var speakNow = function (e) {
	// console.log(window.speechSynthesis.speaking);
	var isRight = true;
	if ($(e.target).parents('[id*=action-panel-]').attr('id') == 'action-panel-right') {
		var text = $('.right-text').val();
		var sLanguage = $('#recent-languages-right').find('button.active').attr('data-dialect');
		sLanguage = (sLanguage == undefined) ? $(".dialect[data-index=right]").attr('data-dialect') : sLanguage;
	} else if ($(e.target).parents('[id*=action-panel-]').attr('id') == 'action-panel-left') {
		isRight = false;
		var text = $('.left-text').val();
		var sLanguage = $('#recent-languages-left').find('button.active').attr('data-dialect');
		sLanguage = (sLanguage == undefined) ? $(".dialect[data-index=left]").attr('data-dialect') : sLanguage;
	}

	if (window.speechSynthesis.speaking == false) {
		// console.log(sLanguage);
		if (text.trim().length == 0) {
			if (sLanguage == undefined) {
				showToast({ content: 'Please select a language ' + (isRight ? 'target' : 'source'), type: 'bad' });
			} else {
				var isMobile = mobileCheck();
				showToast({ content: 'Please enter text or ' + (isMobile ? 'tap' : 'click') + ' microphone to talk.', type: 'bad' }, $('.start-record-btn'));
			}
		} else {
			// Cancel any ongoing speech synthesis
			window.speechSynthesis.cancel();
			try {
				var aBtn = $(e.target);
				if (aBtn.prop('tagName') == 'A') {
					aBtn = aBtn.find('i');
				}
				aBtn.removeAttr('class').attr('class', 'fa fa-stop').css('color', 'red');
				speechQueue = splitTextIntoChunks(text, MAX_CHUNK_LENGTH);
				speakNextChunk(sLanguage, e);
			} catch (error) {
				showToast({ content: error, type: 'bad' });
			}
		}
	} else {
		window.speechSynthesis.speaking = false;
		var aBtn = $(e.target);
		if (aBtn.prop('tagName') == 'A') {
			aBtn = aBtn.find('i');
		}
		aBtn.removeAttr('class').attr('class', 'fa fa-volume-up').css('color', '');
		window.speechSynthesis.cancel();
		showToast({ content: 'Speaker stopped.', type: 'info' });
	}
}

function splitTextIntoChunks(text, maxLength) {
	var chunks = text.match(/[^.!?。]+[.!?。]+/g) || [];
	if (chunks.length == 0) {
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
	}
	return chunks;
}

var jsVoices = [];
var oVoices = false;
function speakNextChunk(sLanguage, e) {
	window.speechSynthesis.cancel();
	var chunk = speechQueue.shift();

	if (chunk != undefined) {
		if (jsVoices.length == 0) {
			jsVoices = window.speechSynthesis.getVoices();
		}
		oVoices = new JSONQuery(jsVoices);
		var utterance = new SpeechSynthesisUtterance(chunk);
		utterance.lang = sLanguage; // Set the language
		var oVoice = oVoices.execute({
			select: { fields: '*' },
			where: {
				condition: [
					{ field: 'lang', operator: 'like', value: '%' + sLanguage + '%' },
				]
			}
		});
		if (oVoice.data.length) {
			// var random = Math.floor(Math.random() * oVoice.data.length);
			// var sVoice = oVoice.data[random];
			var sVoice = oVoice.data[0];
		} else {
			var sVoice = jsVoices[0];
		}
		utterance.voice = sVoice;
		// console.log(oVoice, sLanguage, sVoice);
		utterance.onend = function () {
			return speakNextChunk(sLanguage, e);
		};
		window.speechSynthesis.speak(utterance);
	} else {
		var aBtn = $(e.target);
		if (aBtn.prop('tagName') == 'A') {
			aBtn = aBtn.find('i');
		}
		aBtn.removeAttr('class').attr('class', 'fa fa-volume-up').css('color', '');
	}
}

var speakNowV2 = function (recorder, chunks) {
	// console.log(isSpeaking);
	if (isSpeaking == false) {
		var text = $('.right-text').val();
		if (text.trim() === '') {
			var isMobile = mobileCheck();
			showToast({ content: 'Please enter text or ' + (isMobile ? 'tap' : 'click') + ' microphone to talk.', type: 'bad' }, $('.start-record-btn'));
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
			// runVoiceRecorder(recorder, chunks);
			speakNext(undefined, chunks);
		} catch (error) {
			showToast({ content: error, type: 'bad' });
		}
	} else {
		window.speechSynthesis.cancel();
		isSpeaking = false;
		showToast({ content: 'Speaker stopped.', type: 'info' });
	}
}

function speakNext(recorder) {
	if (speechQueue.length === 0 || isSpeaking) {
		isSpeaking = false;
		return;
	}
	var sLanguage = $(".dialect[data-index=right]").attr('data-dialect');
	sLanguage = (sLanguage == undefined) ? $('#recent-languages-right').find('button.active').attr('data-dialect') : sLanguage;
	// console.log(sLanguage);

	isSpeaking = true;
	var chunk = speechQueue.shift();
	var utterance = new SpeechSynthesisUtterance(chunk);
	utterance.lang = sLanguage; // Set the language
	utterance.onend = function () {
		// console.log(speechQueue, isSpeaking);
		isSpeaking = false;
		if (recorder && speechQueue.length == 0) {
			recorder.stop();
		}
		return speakNext(recorder);
	};
	window.speechSynthesis.speak(utterance);
}

var getAllURLParams = function (search) {
	if (search == undefined) search = window.location.search;
	const params = new URLSearchParams(search);
	let paramObj = {};
	for (var value of params.keys()) {
		paramObj[value] = params.get(value);
	}
	return paramObj;
}

var resetUrlOrigin = function () {
	if (window.location.search.length) {
		var sPath = '/';
		if (window.location.host == 'gacelabs.github.io' || window.location.hostname == 'gacelabs.github.io') {
			sPath = window.location.pathname;
		}
		window.history.replaceState(null, null, sPath);
	}
}