// ****************************************
// Session Timer
// ****************************************

(function (global) {
    'use strict';
    var sessionTimer = function (warningSecs, expiringSecs) {
        return new sessionTimer.factory(warningSecs, expiringSecs);
    };
    sessionTimer.prototype = {
		// ********************************************
        // determine how much time elapsed in msec.
		// ********************************************
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
		// ********************************************
        // check if time has passed.
		// ********************************************
        isExpired: function () {
            return this.elapsedInMsec()
				> this.sessionTimeoutInMsec;
        },
		// ********************************************
        // check if warning time has come.
		// ********************************************
        isWarningThresholdReached: function () {
            return this.elapsedInMsec()
				>= this.sessionTimeoutWarningHappensInMsec;
        },
		// ********************************************
        // return time left until expiring.
		// ********************************************
        timeLeft: function () {
            return Math.floor(Math.max(0,
									   (this.sessionTimeoutInMsec
										- this.elapsedInMsec()))
							  / 1000);
        },
		// ********************************************
        // check if time settings are all valid.
		// ********************************************
        isSettingsValid: function () {
            var i = 0, len = 0;
            for (i = 0, len = this.validSettingFunctions.length; i < len; i = i + 1) {
                if (this.validSettingFunctions[i].isValid.apply(this) === false) {
                    return this.validSettingFunctions[i].msg.apply(this);
                }
            }
            return true;
        },
		// ********************************************
        // reset/restart Timer configuration
		// ********************************************
        reset: function () {
            if (this.isResettingSession) { return; }

            this.isResettingSession = true;

            this.countdownStarted = new Date();   // start the countdown timer
            this.sessionHasTimedout = false;
            this.isResettingSession = false;
        },
		// ********************************************
        // return total percent complete,
		// ie., ratio of 'elapsed time' to 'time session is active'
        // UI will want to respond to this countdown
		// ********************************************
        totalCountdownPercentComplete: function () {
            return Math.floor(100 *
                             (this.elapsedInMsec()
                              / this.sessionTimeoutInMsec));
        },
		// ********************************************
        // return warning percent complete,
        // ie., ratio of 'elapsed time' to 'time to wait before warning'
        // UI may want to respond to this countdown
		// ********************************************
        warningCountdownPercentComplete: function () {
            return Math.floor(100 * ((this.elapsedInMsec()
                                 - this.sessionTimeoutWarningHappensInMsec)
                / (this.sessionTimeoutInMsec
                   - this.sessionTimeoutWarningHappensInMsec)));
        }
    };

	// ********************************************
    // define error constants
	// ********************************************
    sessionTimer.prototype.ERRORS = {
        POSITIVESESSIONTIMEOUT: 'Session timeout must be a positive number.',
        NONZEROTIMEOUT: 'Session timeout can\'t be zero or negative.',
        POSITIVEWARNINGTIME: 'Session timeout warning must be a positive number.',
        NONWARNINGTIME: 'Session timeout warning can\'t be zero or negative.',
        WARNINGSMALLERTHANTIMEOUT: 'Session timeout warning must be smaller than Session timeout.'
    };
	// ********************************************
	// define error validation functions and msgs
	// ********************************************
    sessionTimer.prototype.validSettingFunctions = [
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

    sessionTimer.factory = function (warningSecs, expiringSecs) {
        this.count = 1;
        this.pollTimeInMsec = 50;  // 0.1 sec
        this.sessionTimeoutInMsec = expiringSecs * 1000;  // 20 mins - 3 secs
        this.sessionTimeoutWarningHappensInMsec = warningSecs * 1000;  // 20 mins - 23 secs
        this.countdownStarted = null;
        this.sessionHasTimedout = false;
        this.isResettingSession = false;
    };
    sessionTimer.factory.prototype = sessionTimer.prototype;

    if (global && !global.sessionTimer) {
        global.sessionTimer = sessionTimer;
    }
}(window));
