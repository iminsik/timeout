/*global jQuery, s_gi, stnw_init_page, console*/
// --------------------
// stnw library / start
// --------------------

// Cookie Store
(function (global, document) {
    'use strict';
    var cookieStore = function () {
        return new cookieStore.factory();
    };
    cookieStore.prototype = {
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
        getByKey: function (store, key) {
            var cookieCollection = this.getCookie(store);
            if (cookieCollection.hasOwnProperty(key)) {
                return cookieCollection[key];
            }
            return '';
        },
        setByKey: function (store, key, value, domain) {
            var cookieCollection = this.getCookie(store),
                t = new Date();

            cookieCollection[key] = value;
            document.cookie = store + "=" + JSON.stringify(cookieCollection)
                + "; expires="
                + (new Date(t.getFullYear(),
                            t.getMonth(),
                            t.getDate(),
                            t.getHours() + 2,
                            t.getMinutes(),
                            0)).toGMTString()
                + "; path=/"
                + "; domain=" + domain;
        }
    };

    cookieStore.factory = function () {
        
    };
    cookieStore.factory.prototype = cookieStore.prototype;

    if (global && !global.cookieStore) {
        global.cookieStore = cookieStore;
    }
}(window, document));

// Basic Timer & Events
(function (global) {
    'use strict';
    var timer = function (warningSecs, expiringSecs) {
        return new timer.factory(warningSecs, expiringSecs);
    };
    timer.prototype = {
        // determine how much time elapsed in msec.
        elapsedInMsec: function () {
            // convert both dates to milliseconds
            try {
                var t_start = this.countdownStarted.getTime(),
                    t_now = (new Date()).getTime(),

                    // calculate the difference in milliseconds
                    delta_msec = t_now - t_start;
                return delta_msec;
            } catch (e) {
                global.console.log(e);
                return 0;
            }
        },
        // determine if time has passed.
        isExpired: function () {
            return this.elapsedInMsec()
				> this.sessionTimeoutInMsec;
        },
        // determine if warning time has come.
        isWarningThresholdReached: function () {
            return this.elapsedInMsec()
				>= this.sessionTimeoutWarningHappensInMsec;
        },
        // determine how much time is left until expiring.
        timeLeft: function () {
            return Math.floor(Math.max(0,
									   (this.sessionTimeoutInMsec
										- this.elapsedInMsec()))
							  / 1000);
        },
        // determine time settings are all valid.
        isSettingsValid: function () {
            var i = 0, len = 0;
            for (i = 0, len = this.validSettingFunctions.length; i < len; i = i + 1) {
                if (this.validSettingFunctions[i].isValid.apply(this) === false) {
                    return this.validSettingFunctions[i].msg.apply(this);
                }
            }
            return true;
        },
        // reset Timer configuration
        reset: function () {
            if (this.isResettingSession) { return; }

            this.isResettingSession = true;

            this.countdownStarted = new Date();   // start the countdown timer
            this.sessionHasTimedout = false;
            this.isResettingSession = false;
        },
        // determine total percent complete, ie., ratio of 'elapsed time' to 'time session is active'
        // UI will want to respond to this countdown
        totalCountdownPercentComplete: function () {
            return Math.floor(100 *
                             (this.timer.elapsedInMsec()
                              / this.timer.sessionTimeoutInMsec));
        },
        // determine warning percent complete,
        // ie., ratio of 'elapsed time' to 'time to wait before warning'
        // UI may want to respond to this countdown
        warningCountdownPercentComplete: function () {
            return Math.floor(100 * ((this.timer.elapsedInMsec()
                                 - this.timer.sessionTimeoutWarningHappensInMsec)
                / (this.timer.sessionTimeoutInMsec
                   - this.timer.sessionTimeoutWarningHappensInMsec)));
        }
    };
    
    // Error constants.
    timer.prototype.ERRORS = {
        POSITIVESESSIONTIMEOUT: 'Session timeout must be a positive number.',
        NONZEROTIMEOUT: 'Session timeout can\'t be zero or negative.',
        POSITIVEWARNINGTIME: 'Session timeout warning must be a positive number.',
        NONWARNINGTIME: 'Session timeout warning can\'t be zero or negative.',
        WARNINGSMALLERTHANTIMEOUT: 'Session timeout warning must be smaller than Session timeout.'
    };
    timer.prototype.validSettingFunctions = [
        {
            isValid: function () { return typeof this.sessionTimeoutInMsec !== 'number'; },
            msg: function () { return this.ERRORS.POSITIVESESSIONTIMEOUT; }
        },
        {
            isValid: function () { return this.sessionTimeoutInMsec <= 0; },
            msg: function () { return this.ERRORS.NONZEROTIMEOUT; }
        },
        {
            isValid: function () { return typeof this.sessionTimeoutWarningHappensInMsec !== 'number'; },
            msg: function () { return this.ERRORS.POSITIVEWARNINGTIME; }
        },
        {
            isValid: function () { return this.sessionTimeoutWarningHappensInMsec <= 0; },
            msg: function () { return this.ERRORS.NONWARNINGTIME; }
        },
        {
            isValid: function () { return this.sessionTimeoutWarningHappensInMsec >= this.sessionTimeoutInMsec; },
            msg: function () { return this.ERRORS.WARNINGSMALLERTHANTIMEOUT; }
        }
    ];

    timer.factory = function (warningSecs, expiringSecs) {
        this.count = 1;
        this.pollTimeInMsec = 1000;  // 1 sec
        this.sessionTimeoutInMsec = expiringSecs * 1000;  // 20 mins - 3 secs
        this.sessionTimeoutWarningHappensInMsec = warningSecs * 1000;  // 20 mins - 23 secs
        this.countdownStarted = null;
        this.sessionHasTimedout = false;
        this.isResettingSession = false;
    };
    timer.factory.prototype = timer.prototype;

    if (global && !global.timer) {
        global.timer = timer;
    }
}(window));

// Multitab timer with callbacks, i.e.:
//  beforewarning callback
//  afterwarning callback
//  continue callback
//  done callback
(function (global, $, timer, cookieStore) {
    'use strict';
    var timerMultitab = function (name, warningSecs, expiringSecs, mode, beforecb, aftercb, contcb, donecb) {
        return new timerMultitab.factory(name, warningSecs, expiringSecs, mode, beforecb, aftercb, contcb, donecb);
    };
    timerMultitab.prototype = {
        timerEventStart: function () {
            var self = this,
                startDeferred;

            // create timercheck callback with event callbacks
            self.timercheckcallback
                = self.timerEventCheckGenerator(self.beforeWarningCallback,
                                                 self.afterWarningCallback,
                                                 self.doneCallback);

            self.timer.countdownStarted = new Date();

            // starting a new timer means clicking 'continue' button.
            self.clickContinue();

            // start the countdown timer
            // fire delayed event
            startDeferred = function () {
                if (self.timer.isSettingsValid() === false) {
                    return;
                }
                self.timercheckcallback();
                if (self.timer.sessionHasTimedout === false) {
                    setTimeout(startDeferred,
                               self.timer.pollTimeInMsec);
                }
            };

            startDeferred();
        },
        // restart timer.
        timerEventRestart: function () {
            this.timer.reset();
            // 3. USER DEFINABLE CONTINUE CALLBACK
            if (typeof this.continueCallback === 'function') {
                this.continueCallback();
            }
        },
        // reset Multitab local variable and cookies.
        expireMultitabConfig: function () {
            this.multitab.nClickCont = 0;
            cookieStore.prototype.setByKey('timerMultiTab', 'bSessionExpired', true, '127.0.0.1');
            cookieStore.prototype.setByKey('timerMultiTab', 'nClickCont', '0', '127.0.0.1');
        },
        // behave like it, when user clicks 'Continue' button.
        clickContinue: function () {
            var strClickCont = cookieStore.prototype.getByKey('timerMultiTab', 'nClickCont');
            if (strClickCont === '') {
                strClickCont = '0';
            }

            cookieStore.prototype.setByKey(
                'timerMultiTab',
                'nClickCont',
                (parseInt(strClickCont, 10) + 1).toString(),
                '127.0.0.1'
            );
        },
        // generate timer check callback will be called by 'settimeout'.
        timerEventCheckGenerator: function (beforewarningcb,
                                            afterwarningcb,
                                            donecb) {
            var self = this;
            return function () {
                var nCurrentClickCont, bSessionExpiredCookie;
                // increase time count
                self.timer.count = this.timer.count + 1;

                if (self.timer.isExpired()
                        || cookieStore.prototype.getByKey('timerMultiTab', 'bSessionExpired') === true) {
                    // if time has passed, finish and cleanup
                    self.timer.sessionHasTimedout = true;
                    self.expireMultitabConfig();

                    // 4. USER-DEFINABLE DONE CALLBACK
                    if (typeof donecb === 'function'
                            && self.mode.toLowerCase() !== 'release') {
                        donecb();
                    }
                } else {
                    // otherwise, keep checking
                    nCurrentClickCont = parseInt(cookieStore.prototype.getByKey('timerMultiTab', 'nClickCont'), 10);
                    bSessionExpiredCookie = cookieStore.prototype.getByKey('timerMultiTab', 'bSessionExpired');

                    // raise callback so client can update its UI
                    if (self.mode.toLowerCase() !== 'release') {

                        // reset the Session, if 'Continue' button is hit in another tab.
                        if (self.multitab.nClickCont < nCurrentClickCont) {
                            self.multitab.nClickCont = nCurrentClickCont;

                            self.timer.reset(); // reset timer
                            // 3. USER DEFINABLE CONTINUE CALLBACK
                            if (typeof self.continueCallback === 'function') {
                                self.continueCallback();
                            }
                        } else {
                            // show message if warning time is reached.
                            if (!self.timer.isWarningThresholdReached()) {
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
        setBeforeWarningCallback: function (cb) {
            var self = this;
            self.beforeWarningCallback = cb;
            return self;
        },
        setAfterWarningCallback: function (cb) {
            var self = this;
            self.afterWarningCallback = cb;
            return self;
        },
        setContinueCallback: function (cb) {
            var self = this;
            self.continueCallback = cb;
            return self;
        },
        setDoneCallback: function (cb) {
            var self = this;
            self.doneCallback = cb;
            return self;
        }
    };
    
    timerMultitab.factory = function (name, warningSecs, expiringSecs, mode, beforecb, aftercb, contcb, donecb) {
        var self = this;
        self.name = name;
        self.mode = mode || "release";
        self.timer = timer(warningSecs, expiringSecs);
        cookieStore.prototype.setByKey('timerMultiTab', 'bSessionExpired', false, '127.0.0.1');
        if (cookieStore.prototype.getByKey('timerMultiTab', 'nClickCont') === '') {
            cookieStore.prototype.setByKey('timerMultiTab', 'nClickCont', '0', '127.0.0.1');
        }

        self.multitab = {
            nClickCont: 0
        };
        
        // initialize timer callback
        self.beforeWarningCallback = beforecb || function () {
            console.log(self.name + ' ' + self.timer.timeLeft()
                        + ': called Before warning callback.');
        };
        self.afterWarningCallback = aftercb || function () {
            console.log(self.name + ' ' + self.timer.timeLeft()
                        + ': called After warning callback.');
        };
        self.continueCallback = contcb || function () {
            console.log(self.name + ' ' + "is continued.");
        };
        self.doneCallback = donecb || function () {
            console.log(self.name + ' ' + "time passed.");
        };
    };
    timerMultitab.factory.prototype = timerMultitab.prototype;
    
    if (global && !global.timerMultitab) {
        global.timerMultitab = timerMultitab;
    }
    
}(window, jQuery, window.timer, window.cookieStore));