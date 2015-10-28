/*global jQuery, s_gi, stnw_init_page */
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
    var $timer = function (name, warningSecs, expiringSecs, beforewarning_callback, afterwarning_callback, done_callback) {
        return new $timer.factory(name, warningSecs, expiringSecs, beforewarning_callback, afterwarning_callback, done_callback);
    };
    
    $timer.prototype = {
        timeLeft: function () {
            return Math.floor(Math.max(0, (this.timings.session_timeout_in_msec - this.elapsed_in_msec())) / 1000);
        },
        elapsed_in_msec: function () {
            // Convert both dates to milliseconds
            try {
                var t_start = this.timings.countdown_started.getTime(),
                    t_now = (new Date()).getTime(),

                // Calculate the difference in milliseconds
                    delta_msec = t_now - t_start;
                return delta_msec;
            } catch (e) {
                global.console.log(e);
                return 0;
            }
        },
        is_settings_valid: function () {
            if (typeof this.timings.session_timeout_in_msec !== 'number') {
                global.console.log('Session timeout must be a positive number.');
                return false;
            }
            if (this.timings.session_timeout_in_msec <= 0) {
                global.console.log('Session timeout can\'t be zero or negative.');
                return false;
            }
            if (typeof this.timings.session_timeout_warning_happens_in_msec !== 'number') {
                global.console.log('Session timeout warning must be a positive number.');
                return false;
            }
            if (this.timings.session_timeout_warning_happens_in_msec <= 0) {
                global.console.log('Session timeout warning can\'t be zero or negative.');
                return false;
            }
            if (this.timings.session_timeout_warning_happens_in_msec >= this.timings.session_timeout_in_msec) {
                global.console.log('Session timeout warning must be smaller than Session timeout.');
                return false;
            }

            return true;
        },
        startTimer: function () {
            var self = this,
                timer = {};

            timer.events = {
                start: function () {
                    self.timings.countdown_started = new Date();   // start the countdown timer
                    // fire delayed event

                    var start = function () {
                        if (self.is_settings_valid() === false) {
                            return;
                        }
                        timer.events.check();
                        if (self.timings.session_has_timeedout === false) {
                            setTimeout(start, self.timings.poll_time_in_msec);
                        }
                    };

                    start();
                },
                check: function () {
                    var elapsed_msec = self.elapsed_in_msec(),
                        done = (elapsed_msec > self.timings.session_timeout_in_msec);

                    // determine total percent complete, ie., ratio of 'elapsed time' to 'time session is active'
                    // UI will want to respond to this countdown
                    self.timings.total_countdown_percent_complete = Math.floor(100 * (elapsed_msec / self.timings.session_timeout_in_msec));

                    // determine warning percent complete, ie., ratio of 'elapsed time' to 'time to wait before warning'
                    // UI may want to respond to this countdown
                    self.timings.warning_countdown_percent_complete
                        = Math.floor(100 * ((elapsed_msec - self.timings.session_timeout_warning_happens_in_msec)
                            / (self.timings.session_timeout_in_msec - self.timings.session_timeout_warning_happens_in_msec)));

                    self.timings.count = self.timings.count + 1;

                    if (done) {
                        // finish and cleanup
                        self.timings.session_has_timeedout = true;

                        if (typeof self.done_callback !== 'undefined') {
                            self.done_callback();
                        }
                        return;
                    }

                    //raise callback so client can update its UI
                    if (typeof self.taskRunner !== 'undefined') {

                        self.timings.warning_threshold_reached
                            = elapsed_msec >= self.timings.session_timeout_warning_happens_in_msec;
                        self.taskRunner(self.timings, done, self.timings.warning_threshold_reached);
                    }
                }
            };
            timer.events.start();
        },
        resetSession: function () {
            if (this.timings.is_resetting_session) { return; }

            this.timings.is_resetting_session = true;

            this.timings.countdown_started = new Date();   // start the countdown timer
            this.timings.session_has_timeedout = false;
            this.timings.warning_threshold_reached = false;

            this.timings.is_resetting_session = false;
        },
        continueSession: function () {
            this.resetSession();
            if (typeof this.continue_callback !== 'undefined') {
                this.continue_callback();
            }
        },
        taskRunner: function (timings, done, warning_time_met) {
            //show message if warning time is reached.
            if (warning_time_met) {
                this.afterwarning_callback();
            } else {
                this.beforewarning_callback();
            }
        }
    };
    
    $timer.factory = function (name, warningSecs, expiringSecs, beforewarning_callback, afterwarning_callback, done_callback) {
        var self = this;
        self.name = name;
        
        // Initialize timer callback
        self.beforewarning_callback = beforewarning_callback;
        self.afterwarning_callback = afterwarning_callback;
        self.done_callback = done_callback;
        self.timings = {
            count: 1,
            poll_time_in_msec: 1000,  // 1 sec
            session_timeout_in_msec: expiringSecs * 1000,  // 20 mins - 3 secs
            session_timeout_warning_happens_in_msec: warningSecs * 1000,  // 20 mins - 23 secs
            countdown_started: null,
            total_countdown_percent_complete: 0,
            warning_countdown_percent_complete: 0,
            warning_threshold_reached: false,
            session_has_timeedout: false,
            is_resetting_session: false
        };
    };
    
    $timer.factory.prototype = $timer.prototype;
    
    if (global && !global.$timer) {
        global.$timer = $timer;
    }
    
}(window, jQuery));

/*global window, jQuery, document, s_gi, asglobal, $timer*/
(function (global, $, $timer) {
    'use strict';
    var $timeoutBox = function (warningSecs, expiringSecs) {
        return new $timeoutBox.factory(warningSecs, expiringSecs);
    };
    
    $timeoutBox.prototype = {
        userTypeAndRedirectUrlEnum: {
            maaUser: {
                userType: 'MAAUser',
                redirectURL: '//www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCSignInStart&advise=eSessionTimeout'
            },
            ezbUser: {
                userType: 'EZBUser',
                redirectURL: '//easybiz.alaskaair.com/ssl/signin/cosignin.aspx?CurrentForm=UCCoSignInStart&advise=eSessionTimeout'
            },
            ezbSuperUser: {
                userType: 'EZBSuperUser',
                redirectURL: ''
            },
            travelAgent: {
                userType: 'TravelAgent',
                redirectURL: ''
            }
        },
        extendSession: function () {
            $.ajax({
                url: '//www.alaskaair.com/services/v1/loginvalidator/GetUserStatus?t=' + (new Date()).getTime(),
                success: function (data) {
                    if (data.bLogin === false) {
                        this.done_callback();
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    this.done_callback();
                },
                timeout: this.ajaxTimeout
            });
        },
        hideAllLightBoxes: function () {
            if ($.hideLightBoxes) {
                $.hideLightBoxes();
            }
            if ($.hideFormFiller) {
                $.hideFormFiller();
            }
        },
        resetCookie: function () {
            this.nlastContinueClick = 0;
            this.setCookieByKey('nlastContinueClick', '0');
            this.setCookieByKey('bSessionExpired', true);
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
            var cookieCollection = this.getCookie('stnw');
            if (cookieCollection.hasOwnProperty(key)) {
                return cookieCollection[key];
            }
            return '';
        },
        setCookieByKey: function (key, value) {
            var cookieCollection = this.getCookie('stnw'),
                t = new Date();

            cookieCollection[key] = value;
            document.cookie = "stnw=" + JSON.stringify(cookieCollection) + "; expires="
                + (new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours() + 2, t.getMinutes(), 0)).toGMTString()
                + "; path=/" + "; domain=www.alaskaair.com";
        },
        propagateOmnitureTag: function (item) {
            if (s_gi) {
                var s = s_gi('alaskacom');
                s.linkTrackVars = 'prop16';
                s.linkTrackEvents = 'None';
                s.prop16 = 'sessionExpiring::' + item;
                s.tl(this, 'o', 'sessionExpiring::' + item);
                s.prop16 = '';
            }
        },
        incContinueClickCnt: function () {
            this.setCookieByKey(
                'nlastContinueClick',
                (parseInt(this.getCookieByKey('nlastContinueClick'), 10) + 1).toString()
            );
        },
        done_message: function () {
            return 'Your session expired at <b>' + (new Date().toTimeString().replace(/[\w\W]*(\d{2}:\d{2}:\d{2})[\w\W]*/, "$1")) + '</b>';
        },
        isUserLoggedIn: function (successCallback, failureCallback) {
            $.ajax({
                url: '//www.alaskaair.com/services/v1/loginvalidator/GetUserStatus?t=' + (new Date()).getTime(),
                success: function (data) {
                    // Start timer callback, depending on user type
                    if (data.bLogin === true) {
                        this.setCookieByKey('bSessionExpired', false);
                        // Set User Type
                        if (data.bEasyBiz === true) {
                            this.userType = this.userTypeAndRedirectUrlEnum.ezbUser.userType;
                        } else {
                            this.userType = this.userTypeAndRedirectUrlEnum.maaUser.userType;
                        }

                        // Set Default Redirect URL for EasyBiz
                        if (this.userType === this.userTypeAndRedirectUrlEnum.ezbUser.userType) {
                            this.redirectURL = this.userTypeAndRedirectUrlEnum.ezbUser.redirectURL;
                        } else { // Overwrite RedirectURL in AS.COM, if each page doesn't specifiy Redirect URL
                            if (this.redirectURL === '') {
                                // if not SiteCore page
                                if (global.location && global.location.pathname.toLowerCase().indexOf('/content/') === -1) {
                                    this.redirectURL = this.userTypeAndRedirectUrlEnum.maaUser.redirectURL;
                                }
                            }
                        }

                        (successCallback || Function)();
                    } else {
                        (failureCallback || Function)();
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    this.setCookieByKey('bSessionExpired', true);
                }
            });
        },
        timeoutStart: function () {
            this.isUserLoggedIn(this.timer.startTimer, this.resetCookie);
        },
        init: function () {
            // Inject Session Timeout Div from SiteCore
            $.ajax({
                url: '//' + asglobal.domainUrl + '/content/partial/session-timeout',
                cache: false,
                success: function (data) {
                    if (data.toLowerCase().indexOf("this page has taken off") === -1) {
                        $('body').append(data);

                        // Bind click event to Continue Button
                        $('#sessionContinue').bind('click', function () {
                            this.hideAllLightBoxes();
                            
                            this.propagateOmnitureTag('Continue'); // Setting omniture tags
                            this.incContinueClickCnt();
                            this.extendSession();
                        });

                        //define callback to timer events
                        this.ui_update_callback = function (timings, done, warning_time_met) {
                            // reset the Session, if 'Continue' button is hit in another tab.
                            if (this.nlastContinueClick < parseInt(this.getCookieByKey('nlastContinueClick'), 10)) {
                                this.hideAllLightBoxes();
                                
                                this.nlastContinueClick = this.nlastContinueClick + 1;
                                
                                this.continueSession();
                            } else {
                                //show UI if warning time is reached.
                                if (warning_time_met) {
                                    // Prevent lightbox from blinking.
                                    if ($('#sessionSection').css('display') === 'none') {
                                        $('#sessionSection').showLightBox({
                                            width: 460,
                                            height: 215,
                                            onClose: function () {
                                                this.propagateOmnitureTag('Close'); // Setting omniture tags
                                                this.incContinueClickCnt();
                                                this.extendSession();
                                            }
                                        }).show();
                                        $('#sessionSection').attr('tabindex', '0').focus();
                                    }

                                    // AS.COM/EASYBIZ Signout Signal
                                    if (this.getCookieByKey('bSessionExpired') === true) {
                                        this.isUserLoggedIn(null, this.done_callback);
                                    }
                                } else {
                                    $('#sessionSection').hide();
                                }

                                $('#sessionTimeLeft').text(this.timeLeft() + ' seconds');
                            }
                        };

                        // Initialize multi-tab configuration
                        var nlastContinueClickCookie = this.getCookieByKey("nlastContinueClick");
                        if (nlastContinueClickCookie === '' || nlastContinueClickCookie === '0') {
                            this.setCookieByKey('nlastContinueClick', '0');
                        }
                        // When any tab is refreshed, initialize.
                        this.setCookieByKey(
                            'nlastContinueClick',
                            (parseInt(this.getCookieByKey('nlastContinueClick'), 10) + 1).toString()
                        );
                        this.nlastContinueClick = parseInt(this.getCookieByKey('nlastContinueClick'), 10) - 1;

                        if (typeof (stnw_init_page) === "function") {
                            stnw_init_page();
                        }

                        this.timeoutStart();
                    }
                }
            });

        }
    };

    $timeoutBox.factory = function (warningSecs, expiringSecs) {
        var self = this;
        // TODO: initialize warningTime and expiringTime in stnw
        // example: 
        //      self.warningTime = warningTime
        //      self.expiringTime = expiringTime
        self.redirectURL = '';
        self.userType = '';
    
        // Initialize multitab configuration
        self.nlastContinueClick = 0;
        self.nlastContinueClickCookie = 0;

        // Initialize bSessionExpire 'true' by Default
        this.setCookieByKey('bSessionExpired', true);
    };

    $timeoutBox.factory.prototype = $timeoutBox.prototype;

    if (global && !global.$timeoutBox) {
        global.$timeoutBox = $timeoutBox;
    }
}(window, jQuery, window.$timer));
