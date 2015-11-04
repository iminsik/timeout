/*global jQuery */
// Multitab timer with callbacks, i.e.:
//  beforewarning callback
//  afterwarning callback
//  continue callback
//  done callback
(function (global, $, sessionTimer, sessionUtilities) {
    'use strict';
    var sessionMultitab = function (name, warningSecs, expiringSecs, mode, beforecb, aftercb, contcb, donecb) {
        return new sessionMultitab.factory(name, warningSecs, expiringSecs, mode, beforecb, aftercb, contcb, donecb);
    };
    sessionMultitab.prototype = {
        timerEventStart: function () {
            var self = this,
                startDeferred;

            // create timercheck callback with event callbacks
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
        // restart timer.
        timerEventRestart: function () {
            this.sessionTimer.reset();
            // 3. USER DEFINABLE CONTINUE CALLBACK
            if (typeof this.continueCallback === 'function') {
                this.continueCallback();
            }
        },
        // reset Multitab local variable and cookies.
        expireMultitabConfig: function () {
            this.multitab.nClickCont = 0;
            sessionUtilities.prototype.setCookieByKey('sessionMultitab', 'bSessionExpired', true, '127.0.0.1');
            sessionUtilities.prototype.setCookieByKey('sessionMultitab', 'nClickCont', 0, '127.0.0.1');
        },
        // behave like it, when user clicks 'Continue' button.
        clickContinue: function () {
            var strClickCont = sessionUtilities.prototype.getCookieByKey('sessionMultitab', 'nClickCont');
            if (strClickCont === null) {
                strClickCont = 0;
            }

            sessionUtilities.prototype.setCookieByKey('sessionMultitab', 'nClickCont', strClickCont + 1, '127.0.0.1');
        },
        // generate timer check callback will be called by 'settimeout'.
        timerEventCheckGenerator: function (beforewarningcb, afterwarningcb, donecb) {
            var self = this;
            return function () {
                var nCurrentClickCont, bSessionExpiredCookie;
                // increase time count
                self.sessionTimer.count = self.sessionTimer.count + 1;

                if (self.sessionTimer.isExpired()
                        || sessionUtilities.prototype.getCookieByKey('sessionMultitab', 'bSessionExpired') === true) {
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
                    nCurrentClickCont = sessionUtilities.prototype.getCookieByKey('sessionMultitab', 'nClickCont');
                    bSessionExpiredCookie = sessionUtilities.prototype.getCookieByKey('sessionMultitab', 'bSessionExpired');

                    // raise callback so client can update its UI
                    if (self.mode.toLowerCase() !== 'release') {

                        // reset the Session, if 'Continue' button is hit in another tab.
                        if (self.multitab.nClickCont < nCurrentClickCont) {
                            self.multitab.nClickCont = nCurrentClickCont;

                            self.sessionTimer.reset(); // reset timer
                            // 3. USER DEFINABLE CONTINUE CALLBACK
                            if (typeof self.continueCallback === 'function') {
                                self.continueCallback();
                            }
                        } else {
                            // show message if warning time is reached.
                            if (!self.sessionTimer.isWarningThresholdReached()) {
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
    
    sessionMultitab.factory = function (name, warningSecs, expiringSecs, mode, beforecb, aftercb, contcb, donecb) {
        var self = this;
        self.name = name;
        self.mode = mode || "release";
        self.sessionTimer = sessionTimer(warningSecs, expiringSecs);
        sessionUtilities.prototype.setCookieByKey('sessionMultitab', 'bSessionExpired', false, '127.0.0.1');
        if (sessionUtilities.prototype.getCookieByKey('sessionMultitab', 'nClickCont') === null) {
            sessionUtilities.prototype.setCookieByKey('sessionMultitab', 'nClickCont', 0, '127.0.0.1');
        }

        self.multitab = {
            nClickCont: 0
        };
        
        // initialize timer callback
        self.beforeWarningCallback = beforecb || function () {
            global.console.log(self.name + ' ' + self.sessionTimer.timeLeft()
                        + ': called Before warning callback.');
        };
        self.afterWarningCallback = aftercb || function () {
            global.console.log(self.name + ' ' + self.sessionTimer.timeLeft()
                        + ': called After warning callback.');
        };
        self.continueCallback = contcb || function () {
            global.console.log(self.name + ' ' + "is continued.");
        };
        self.doneCallback = donecb || function () {
            global.console.log(self.name + ' ' + "time passed.");
        };
    };
    sessionMultitab.factory.prototype = sessionMultitab.prototype;
    
    if (global && !global.sessionMultitab) {
        global.sessionMultitab = sessionMultitab;
    }
    
}(window, jQuery, window.sessionTimer, window.sessionUtilities));