/*global $timer, console, $, sessionUtilities, s_gi, axe*/
/*jslint indent: 2*/
var
	i, len, sessionUtil = sessionUtilities(),
	bwcb, awcb, ecb, ccb,
	clickHelper, warningHelper, sessionWarningHelper,
	sessions = [],
	sessionSettings = [
	// ***********************************************************************
	// { name: 'Timer4', warningTime: 65, expiringTime: 70, mode: "debug" },
	// { name: 'Timer1', warningTime: 25, expiringTime: 40, mode: "debug" },
	// { name: 'Timer2', warningTime: 45, expiringTime: 50, mode: "debug" },
	// { name: 'Timer3', warningTime: 55, expiringTime: 60, mode: "debug" },
	// ***********************************************************************
		{ name: 'SessionTimer', warningTime: 1, expiringTime: 5, mode: "debug" }
	],
	timeoutlightbox = $('#sessionSection').filter(function () {
		'use strict';
		return ($(this).css('display') === 'none');
	}).showLightBox({
		width: 460,
		height: 215,
		onClose: function () {
			'use strict';
			// Setting omniture tags
			sessionUtil.setOmniture('alaskacom',
															'prop16',
															'None',
															'sessionExpiring',
															'Close');

			// We need to call timer event ONLY HERE...
			if (sessions[0].sessionTimer.isExpired() === false) {
				sessions[0].clickContinue();
			}
			// TODO: extend session
			// as.stnw.extendSession();
		}
	});

clickHelper = function (session) {
	'use strict';
	return function () {
		if (session.sessionTimer.isExpired() === false) {
			session.clickContinue();
		}
		if (typeof $.fn.showLightBox === 'function') {
			$.hideFormFiller();
			timeoutlightbox.hide();
			$('#sessionSection').hide();
		}
	};
};

$.hideFormFiller();
timeoutlightbox.hide();
$('#sessionSection').hide();

// Bind Continue events 
$('#sessionContinue').bind('click', function () {
	'use strict';
	$.hideFormFiller();
	timeoutlightbox.hide();
	$('#sessionSection').hide();

	// Setting omniture tags
	sessionUtil.setOmniture('alaskacom',
													'prop16',
													'None',
													'sessionExpiring',
													'Continue');

	// We need to call timer event ONLY HERE...
	sessions[0].clickContinue();
	// TODO: extend session
	// as.stnw.extendSession();
});

/*global RedirectURL, hasRefreshElement */
warningHelper = function (i, session, timeoutlightbox, mode) {
	'use strict';
	if (mode === 'beforewarningcallback') {

		return function () {
			$("#Timeleft" + session.name)
				.text('expires in ' + session.sessionTimer.timeLeft())
				.css('color', 'black');
		};
	} else if (mode === 'afterwarningcallback') {

		return function () {
			$("#Timeleft" + session.name)
				.text('expires in ' + session.sessionTimer.timeLeft() + ' WARNING!!!')
				.css('color', 'red');

			if (typeof $.fn.showLightBox === 'function') {
				$.showFormFiller(false, true);
				timeoutlightbox.show();
				$('#sessionTimeLeft')
					.text(session.sessionTimer.timeLeft() + ' seconds');
				$('#sessionSection')
					.show()
					.attr('tabindex', '0')
					.focus();
			}
		};
	} else if (mode === 'expirecallback') {

		return function () {
			$('#Timeleft' + session.name)
				.text('Time has flied.')
				.css('color', 'red');

			if (typeof $.fn.showLightBox === 'function') {
				$('#sessionExpiring')
					.text('Session Expired')
					.css({ color: 'red' });
				$('#sessionKeepActive').css({ visibility: 'hidden' });
				$('#sessionContinue').css({ visibility: 'hidden' });

				if (window.location.hostname === 'www.alaskaair.com') {
					$.ajax({
						// This url will force the user to sign out.
						url: '//www.alaskaair.com/services/v1/loginvalidator/Logout',
						type: 'POST',
						data: { t: (new Date()).getDate() },
						success: function (data) {
							$('#sessionWillExpire')
								.html('Your session expired at <b>'
									+ (new Date()
											.toTimeString()
											.replace(/[\w\W]*(\d{2}:\d{2}:\d{2})[\w\W]*/, "$1"))
									+ '</b>');

							// Move to SignIn Page.
							if (RedirectURL !== '') {
								window.location.href = RedirectURL;
							} else if (hasRefreshElement) {
								$('#CheckOutExpirationTimestamp')
									.val($('#CheckOutExpiredTimestamp').val());
								document.getElementById('Refresh').click();
							} else {
								// We may refresh the page
								// not to show outdated login status
								window.location.reload();
							}
						}
					});
				} else {
					$('#sessionWillExpire')
						.html('Your session expired at <b>'
							+ (new Date()
								 .toTimeString()
								 .replace(/[\w\W]*(\d{2}:\d{2}:\d{2})[\w\W]*/, "$1"))
							+ '</b>');
				}
			}
		};
	} else if (mode === 'continuecallback') {

		return function () {
			if (typeof $.fn.showLightBox === 'function') {
				$.hideFormFiller();
				timeoutlightbox.hide();
				$('#sessionSection').hide();
			}
		};
	}
};


for (i = 0, len = sessionSettings.length; i < len; i = i + 1) {
	sessions.push(
		window.sessionMultitab(
			sessionSettings[i].name,
			sessionSettings[i].warningTime,
			sessionSettings[i].expiringTime,
			sessionSettings[i].mode
		)
	);
	sessionWarningHelper
		= warningHelper
				.bind(this, i, sessions[i], timeoutlightbox);

	bwcb = sessionWarningHelper('beforewarningcallback');
	awcb = sessionWarningHelper('afterwarningcallback');
	ecb  = sessionWarningHelper('expirecallback');
	ccb  = sessionWarningHelper('continuecallback');
	sessions[i]
		.setBeforeWarningCallback(bwcb)
		.setAfterWarningCallback(awcb)
		.setDoneCallback(ecb)
		.setContinueCallback(ccb);

	$("#buttons")
		.append("<input type='button' id='"
							+ sessions[i].name + "' value='"
							+ sessions[i].name + "' /> <span id='Timeleft"
							+ sessions[i].name + "'></span><br />");

	$('#' + sessions[i].name).click(clickHelper(sessions[i]));
	sessions[i].timerEventStart();
}

$(document).ready(function () {
	'use strict';
	axe.a11yCheck(document, function (results) {
    if (results.violations.length === 0) {
			console.log('Should be no accessibility issues');
		} else {
			console.log(results.violations.length + ' accessibility issues');
			console.log(results.violations);
		}
	});
});