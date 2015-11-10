// --------------------
// Session Multitab with Cookie
// beforewarningcallback, 
// afterwarningcallback,
// continuecallback,
// donecallback
// --------------------

/*global jQuery */
/*jslint indent: 2*/
(function (global, $, sessionTimer, sessionUtilities) {
	'use strict';
	var sessionMultitab, prototype;

	prototype = {
		CONSTANTS: {
			MULTITABCOOKIE: 'sessionMultitab',
			SESSIONEXPIRED: 'bSessionExpired',
			NCLICKCONT: 'nClickCont',
			DOMAIN: '127.0.0.1'
		},
		// ********************************************
		// start sessionTimer
		// by 'sessionTimer.countdownStarted = new Date();'
		// call setTimeout again and again
		// to check if sessionTimer is expired or not
		// ********************************************
		timerEventStart: function () {
			var
				self = this,
				startDeferred;

			// generate timercheck callback function object 
			// with event callbacks
			self.timercheckcallback
				= self.timerEventCheckGenerator(self.beforeWarningCallback,
																				self.afterWarningCallback,
																				self.doneCallback);

			self.sessionTimer.countdownStarted = new Date();

			// starting a new timer means clicking 'continue' button.
			self.clickContinue();

			// start the countdown timer
			// fire delayed event
			startDeferred = function () {
				if (self.sessionTimer.isSettingsValid() === false) {
					return;
				}
				self.timercheckcallback();
				if (self.sessionTimer.sessionHasTimedout === false) {
					setTimeout(startDeferred,
										 self.sessionTimer.pollTimeInMsec);
				}
			};

			startDeferred();
		},
		// ********************************************
		// reset/restart sessionTimer
		// ********************************************
		timerEventRestart: function () {
			this.sessionTimer.reset();
			// 3. USER DEFINABLE CONTINUE CALLBACK
			if (typeof this.continueCallback === 'function') {
				this.continueCallback();
			}
		},
		// ********************************************
		// expire Multitab local variable and cookies.
		// ********************************************
		expireMultitabConfig: function () {
			this.multitab.nClickCont = 0;
			this.sessionUtil
				.setCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
												this.CONSTANTS.SESSIONEXPIRED,
												true,
												this.CONSTANTS.DOMAIN);
			this.sessionUtil
				.setCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
												this.CONSTANTS.NCLICKCONT,
												0,
												this.CONSTANTS.DOMAIN);
		},
		// ********************************************
		// increase nClickCont in cookie collection, 
		// when user clicks 'Continue' button.
		// ********************************************
		clickContinue: function () {
			var strClickCont =
					this.sessionUtil
						.getCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
														this.CONSTANTS.NCLICKCONT);

			if (strClickCont === null) {
				strClickCont = 0;
			}

			this.sessionUtil
				.setCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
												this.CONSTANTS.NCLICKCONT,
												strClickCont + 1,
												this.CONSTANTS.DOMAIN);
		},
		// ********************************************
		// generate timer check callback will be called 
		// by 'settimeout'
		// ********************************************
		timerEventCheckGenerator: function (beforewarningcb,
																				afterwarningcb,
																				donecb) {
			var self = this;
			return function () {
				var nCurrentClickCont, bSessionExpiredCookie;
				// increase time count
				self.sessionTimer.count = self.sessionTimer.count + 1;

				if (self.sessionTimer.isExpired()
						|| self.sessionUtil
								.getCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
																this.CONSTANTS.SESSIONEXPIRED) === true) {
					// if time has passed, finish and cleanup
					self.sessionTimer.sessionHasTimedout = true;
					self.expireMultitabConfig();

					// 4. USER-DEFINABLE DONE CALLBACK
					if (typeof donecb === 'function'
								&& self.mode.toLowerCase() !== 'release') {
						donecb();
					}
				} else {
					// otherwise, keep checking
					nCurrentClickCont
						= self.sessionUtil
								.getCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
																this.CONSTANTS.NCLICKCONT);
					bSessionExpiredCookie
						= self.sessionUtil
								.getCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
																this.CONSTANTS.SESSIONEXPIRED);

					// raise callback so client can update its UI
					if (self.mode.toLowerCase() !== 'release') {
						// reset the Session, if 'Continue' button is hit
						// in another tab.
						if (self.multitab.nClickCont < nCurrentClickCont) {
							self.multitab.nClickCont = nCurrentClickCont;

							self.sessionTimer.reset(); // reset timer
							// 3. USER DEFINABLE CONTINUE CALLBACK
							if (typeof self.continueCallback === 'function') {
								self.continueCallback();
							}
						} else {
							// show message if warning time is reached.
							if (self
										.sessionTimer
										.isWarningThresholdReached() === false) {
								// 1. USER-DEFINABLE BEFOREWARNING CALLBACK
								if (typeof beforewarningcb === 'function') {
									beforewarningcb();
								}
							} else {
								// 2. USER-DEFINABLE AFTERWARNING CALLBACK
								if (typeof afterwarningcb === 'function') {
									afterwarningcb();
								}
							}
						}
					}
				}
			};
		},
		// ********************************************
		// set callback function run before warning time
		// ********************************************
		setBeforeWarningCallback: function (cb) {
			var self = this;
			self.beforeWarningCallback = cb;
			return self;
		},
		// ********************************************
		// set callback function run after warning time
		// ********************************************
		setAfterWarningCallback: function (cb) {
			var self = this;
			self.afterWarningCallback = cb;
			return self;
		},
		// ********************************************
		// set callback function run,
		// when user selects 'session continue'
		// ********************************************
		setContinueCallback: function (cb) {
			var self = this;
			self.continueCallback = cb;
			return self;
		},
		// ********************************************
		// set callback function run when time expires
		// ********************************************
		setDoneCallback: function (cb) {
			var self = this;
			self.doneCallback = cb;
			return self;
		},
		assignProperties: function (name, warningSecs, expiringSecs, mode,
																beforecb, aftercb, contcb, donecb) {
			var self = this;
			self.name = name;
			self.mode = mode || "release";
			self.sessionUtil = sessionUtilities();
			self.sessionTimer = sessionTimer(warningSecs, expiringSecs);
			self.sessionUtil.setCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
																			this.CONSTANTS.SESSIONEXPIRED,
																			false,
																			this.CONSTANTS.DOMAIN);
			if (self.sessionUtil
						.getCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
														this.CONSTANTS.NCLICKCONT) === null) {
				self.sessionUtil
					.setCookieByKey(this.CONSTANTS.MULTITABCOOKIE,
													this.CONSTANTS.NCLICKCONT,
													0,
													this.CONSTANTS.DOMAIN);
			}

			self.multitab = {
				nClickCont: 0
			};

			// initialize timer callback
			self.beforeWarningCallback = beforecb || function () {
				global.console.log(self.name + ' '
													 + self.sessionTimer.timeLeft()
													 + ': called Before warning callback.');
			};
			self.afterWarningCallback = aftercb || function () {
				global.console.log(self.name + ' '
													 + self.sessionTimer.timeLeft()
													 + ': called After warning callback.');
			};
			self.continueCallback = contcb || function () {
				global.console.log(self.name + ' ' + "is continued.");
			};
			self.doneCallback = donecb || function () {
				global.console.log(self.name + ' ' + "time passed.");
			};
		}
	};

	sessionMultitab = function () {
		var obj = global.Object.create(prototype);
		obj.assignProperties.apply(obj,
															 Array.prototype.slice.call(arguments));
		return obj;
	};
		
	// ********************************************
	// expose sessionMultitab to global scope
	// ********************************************
	if (global && !global.sessionMultitab) {
		global.sessionMultitab = sessionMultitab;
	}
}(window, jQuery, window.sessionTimer, window.sessionUtilities));