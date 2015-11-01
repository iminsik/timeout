/*global jQuery, s_gi, stnw_init_page, console*/
// --------------------
// stnw library / start
// --------------------

// (s)ession (t)imeout (n)otification (w)idget object
// this block of code is responsible for initilizing the object
// implementing the countdown and setting the internal status.
// *** the UI code that implements this library is responsible
// for managing the UI that needs to respond to this object ***

(function (global, $) {
    'use strict';
    var $timerMultitab = function (name, warningSecs, expiringSecs, mode) {
        return new $timerMultitab.factory(name, warningSecs, expiringSecs, mode);
    };
    
    $timerMultitab.prototype = {
        errors: {
            POSITIVESESSIONTIMEOUT: 'Session timeout must be a positive number.',
            NONZEROTIMEOUT: 'Session timeout can\'t be zero or negative.',
            POSITIVEWARNINGTIME: 'Session timeout warning must be a positive number.',
            NONWARNINGTIME: 'Session timeout warning can\'t be zero or negative.',
            WARNINGSMALLERTHANTIMEOUT: 'Session timeout warning must be smaller than Session timeout.'
        },
        elapsedInMsec: function () {
            // Convert both dates to milliseconds
            try {
                var t_start = this.timings.countdownStarted.getTime(),
                    t_now = (new Date()).getTime(),

                // Calculate the difference in milliseconds
                    delta_msec = t_now - t_start;
                return delta_msec;
            } catch (e) {
                global.console.log(e);
                return 0;
            }
        },
        isDone: function () {
            return this.elapsedInMsec()
				> this.timings.sessionTimeoutInMsec;
        },
        isWarningThresholdReached: function () {
            return this.elapsedInMsec()
				>= this.timings.sessionTimeoutWarningHappensInMsec;
        },
        timeLeft: function () {
            return Math.floor(Math.max(0,
									   (this.timings.sessionTimeoutInMsec
										- this.elapsedInMsec()))
							  / 1000);
        },
        isSettingsValid: function () {
            if (typeof this.timings.sessionTimeoutInMsec !== 'number') {
                global.console.log(this.errors.POSITIVESESSIONTIMEOUT);
                return false;
            }
            if (this.timings.sessionTimeoutInMsec <= 0) {
                global.console.log(this.errors.NONEZEROTIMEOUT);
                return false;
            }
            if (typeof this.timings.sessionTimeoutWarningHappensInMsec !== 'number') {
                global.console.log(this.errors.POSITIVEWARNINGTIME);
                return false;
            }
            if (this.timings.sessionTimeoutWarningHappensInMsec <= 0) {
                global.console.log(this.errors.NONWARNINGTIME);
                return false;
            }
            if (this.timings.sessionTimeoutWarningHappensInMsec >= this.timings.sessionTimeoutInMsec) {
                global.console.log(this.errors.WARNINGSMALLERTHANTIMEOUT);
                return false;
            }

            return true;
        },
        timerEventResetSession: function () {
            if (this.timings.isResettingSession) { return; }

            this.timings.isResettingSession = true;

            this.timings.countdownStarted = new Date();   // start the countdown timer
            this.timings.sessionHasTimedout = false;

            this.timings.isResettingSession = false;
        },
        timerEventContinueSession: function () {
            this.timerEventResetSession();
            if (typeof this.continueCallback !== 'undefined') {
                this.continueCallback();
            }
        },
        timerEventStart: function () {
            var self = this, startDeferred;
            self.timings.countdownStarted = new Date();   // start the countdown timer
            // fire delayed event

            startDeferred = function () {
                if (self.isSettingsValid() === false) {
                    return;
                }
                self.timerEventCheck();
                if (self.timings.sessionHasTimedout === false) {
                    setTimeout(startDeferred,
                               self.timings.pollTimeInMsec);
                }
            };

            startDeferred();
        },
        timerEventCheck: function () {
            // determine total percent complete, ie., ratio of 'elapsed time' to 'time session is active'
            // UI will want to respond to this countdown
            this.timings.totalCountdownPercentComplete
                = Math.floor(100 *
                             (this.elapsedInMsec()
                              / this.timings.sessionTimeoutInMsec));

            // determine warning percent complete, ie., ratio of 'elapsed time' to 'time to wait before warning'
            // UI may want to respond to this countdown
            this.timings.warningCountdownPercentComplete
                = Math.floor(100 * ((this.elapsedInMsec()
                                     - this.timings.sessionTimeoutWarningHappensInMsec)
                    / (this.timings.sessionTimeoutInMsec
                       - this.timings.sessionTimeoutWarningHappensInMsec)));

            this.timings.count = this.timings.count + 1;

            if (this.isDone()) {
                this.setCookieByKey('bSessionExpired', true);

                // finish and cleanup
                this.timings.sessionHasTimedout = true;

                if (typeof this.doneCallback !== 'undefined'
                        && this.mode.toLowerCase() !== 'release') {
                    this.doneCallback();
                }
                return;
            }

            //raise callback so client can update its UI
            if (typeof this.timerEventIdle !== 'undefined'
                    && this.mode.toLowerCase() !== 'release') {
                this.timerEventIdle(this.timings, this.isDone(),
                                this.isWarningThresholdReached());
            }
        },
        timerEventIdle: function (timings, done, warning_time_met) {
            var nClickContCookie = this.getCookieByKey('nClickCont'),
                bSessionExpiredCookie = this.getCookieByKey('bSessionExpired');
            // reset the Session, if 'Continue' button is hit in another tab.
            if (this.timings.multitab.nClickCont < nClickContCookie) {
                this.timings.multitab.nClickCont = nClickContCookie;

                // Define continueCallback 
                this.timerEventContinueSession();
            } else {
                //show message if warning time is reached.
                if (warning_time_met) {
                    this.afterWarningCallback();
                } else {
                    this.beforeWarningCallback();
                }
            }
        },
        // Cookie Library
        resetCookie: function () {
            this.multitab.nClickCont = 0;
            this.setCookieByKey('bSessionExpired', true);
            this.setCookieByKey('nClickCont', '0');
        },
        getCookie: function (name) {
            var i, len, c,
                nameEQ = name + "=",
                cookies = window.document.cookie.split(';');
            for (i = 0, len = cookies.length; i < len; i = i + 1) {
                c = cookies[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
                }
            }
            return {};
        },
        getCookieByKey: function (key) {
            var cookieCollection = this.getCookie('timerMultiTab');
            if (cookieCollection.hasOwnProperty(key)) {
                return cookieCollection[key];
            }
            return '';
        },
        setCookieByKey: function (key, value) {
            var cookieCollection = this.getCookie('timerMultiTab'),
                t = new Date();

            cookieCollection[key] = value;
            document.cookie = "timerMultiTab=" + JSON.stringify(cookieCollection)
                + "; expires="
                + (new Date(t.getFullYear(),
                            t.getMonth(),
                            t.getDate(),
                            t.getHours() + 2,
                            t.getMinutes(),
                            0)).toGMTString()
                + "; path=/"
                + "; domain=127.0.0.1";
        },
        incContinueClickCnt: function () {
            var strClickCont = this.getCookieByKey('nClickCont');
            if (strClickCont === '') {
                strClickCont = '0';
            }

            this.setCookieByKey(
                'nClickCont',
                (parseInt(strClickCont, 10) + 1).toString()
            );
        }
    };
    
    $timerMultitab.factory = function (name, warningSecs, expiringSecs, mode) {
        var self = this;
        self.name = name;
        self.mode = mode || "release";
        
        // Initialize timer callback
        self.beforeWarningCallback = function () {
            console.log(this.name + ' ' + this.timeLeft()
                        + ': called Before warning callback.');
        };
        
        self.afterWarningCallback = function () {
            console.log(this.name + ' ' + this.timeLeft()
                        + ': called After warning callback.');
        };
        self.doneCallback = function () {
            console.log(this.name + ' ' + "time passed.");
        };
        self.continueCallback = function () {
            console.log(this.name + ' ' + "is continued.");
        };
        self.timings = {
            count: 1,
            pollTimeInMsec: 1000,  // 1 sec
            sessionTimeoutInMsec: expiringSecs * 1000,  // 20 mins - 3 secs
            sessionTimeoutWarningHappensInMsec: warningSecs * 1000,  // 20 mins - 23 secs
            countdownStarted: null,
            totalCountdownPercentComplete: 0,
            warningCountdownPercentComplete: 0,
            sessionHasTimedout: false,
            isResettingSession: false,
            multitab: {
                nClickCont: 0
            }
        };
    };
    
    $timerMultitab.factory.prototype = $timerMultitab.prototype;
    
    if (global && !global.$timer) {
        global.$timerMultitab = $timerMultitab;
    }
    
}(window, jQuery));