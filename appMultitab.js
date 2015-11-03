/*global $timer, console, $, utilities, s_gi*/
var i,
    len,
    timers = [],
    timerSettings = [
        { name: 'Timer0', warningTime: 15, expiringTime: 30, mode: "debug" },
        { name: 'Timer1', warningTime: 25, expiringTime: 40, mode: "debug" },
        { name: 'Timer2', warningTime: 45, expiringTime: 50, mode: "debug" },
        { name: 'Timer3', warningTime: 55, expiringTime: 60, mode: "debug" },
        { name: 'Timer4', warningTime: 65, expiringTime: 70, mode: "debug" }
    ];

var clickHelper = function (timer) {
    'use strict';
    return function () {
        timer.clickContinue();
    };
};

/*global RedirectURL, hasRefreshElement */
var warningHelper = function (i, timer, mode) {
    'use strict';
    return function () {
        if (mode === 'beforewarningcallback') {
            $('#Timeleft' + i).text('expires in ' + timer.timer.timeLeft()).css('color', 'black');
            
            $('#sessionSection').hide();
        } else if (mode === 'afterwarningcallback') {
            $('#Timeleft' + i).text('expires in ' + timer.timer.timeLeft() + ' WARNING!!!').css('color', 'red');

            if (typeof $.showLightBox === 'function') {
                $('#sessionSection').filter(function () {
                    return ($(this).css('display') === 'none');
                }).showLightBox({
                    width: 460,
                    height: 215,
                    onClose: function () {
                        // Setting omniture tags
                        utilities.prototype.setOmniture('alaskacom', 'prop16', 'None', 'sessionExpiring', 'Close');

                        // as.stnw.extendSession(); // Extend Session
                    }
                }).show();
                $('#sessionTimeLeft').text(timer.timer.timeleft() + ' seconds');
            }
            $('#sessionSection').attr('tabindex', '0').focus();
            
        } else if (mode === 'donecallback') {
            $('#Timeleft' + i).text('Time has flied.').css('color', 'red');
            
            $('#sessionExpiring').text('Session Expired').css({ color: 'red' });
            $('#sessionKeepActive').css({ visibility: 'hidden' });
            $('#sessionContinue').css({ visibility: 'hidden' });

            $.ajax({
                // This url will force the user to sign out.
                url: '//www.alaskaair.com/services/v1/loginvalidator/Logout',
                type: 'POST',
                data: { t: (new Date()).getDate() },
                success: function (data) {
                    $('#sessionWillExpire')
                        .html('Your session expired at <b>'
                              + (new Date().toTimeString().replace(/[\w\W]*(\d{2}:\d{2}:\d{2})[\w\W]*/, "$1"))
                              + '</b>');
                    // Move to SignIn Page.
                    if (RedirectURL !== '') {
                        window.location.href = RedirectURL;
                    } else if (hasRefreshElement) {
                        $('#CheckOutExpirationTimestamp').val($('#CheckOutExpiredTimestamp').val());
                        document.getElementById('Refresh').click();
                    } else { // We may refresh the page not to show outdated login status
                        window.location.reload();
                    }
                }
            });
        } else if (mode === 'continuecallback') {
            if ($.hideLightBoxes) {
                $.hideLightBoxes();
            }
            if ($.hideFormFiller) {
                $.hideFormFiller();
            }
        }
    };
};

for (i = 0, len = timerSettings.length; i < len; i = i + 1) {
    timers.push(
        window.timerMultitab(
            timerSettings[i].name,
            timerSettings[i].warningTime,
            timerSettings[i].expiringTime,
            timerSettings[i].mode
        )
    );
    timers[i]
        .setBeforeWarningCallback(warningHelper(i, timers[i], 'beforewarningcallback'))
        .setAfterWarningCallback(warningHelper(i, timers[i], 'afterwarningcallback'))
        .setDoneCallback(warningHelper(i, timers[i], 'donecallback'))
        .setContinueCallback(warningHelper(i, timers[i], 'continuecallback'));

    $('#Timer' + i + 'Cont').click(clickHelper(timers[i]));
    timers[i].timerEventStart();
}

// Inject partial view from Sitecore
$.ajax({
    url: '//' + 'www.alaskaair.com' + '/content/partial/session-timeout',
    cache: false,
    success: function (data) {
        'use strict';
        if (data.toLowerCase().indexOf("this page has taken off") === -1) {
            $('body').append(data);

            // Bind Continue events 
            $('#sessionContinue').bind('click', function () {
                var nClickCont = utilities.prototype.getCookieByKey('timerMultiTab', 'nClickCont');
                // Setting omniture tags
                utilities.prototype.setOmniture('alaskacom', 'prop16', 'None', 'sessionExpiring', 'Continue');

                $.hideLightBoxes();
                $.hideFormFiller();

                utilities.prototype.setCookieByKey('timerMultiTab', 'nClickCont', nClickCont + 1, '127.0.0.1');
                // as.stnw.extendSession(); // Extend Session
            });
        }
    }
});
/**********************************************
// Inject partial view from Sitecore
$.ajax({
    url: '//' + 'www.alaskaair.com' + '/content/partial/session-timeout',
    cache: false,
    success: function (data) {
        'use strict';
        if (data.toLowerCase().indexOf("this page has taken off") === -1) {
            $('body').append(data);

            // Bind Continue events 
            $('#sessionContinue').bind('click', function () {
                // Setting omniture tags
                utilities.prototype.setOmniture('alaskacom', 'prop16', 'None', 'sessionExpiring', 'Continue');

                $.hideLightBoxes();
                $.hideFormFiller();

                utilities.prototype.setCookieByKey('timerMultiTab', 'nClickCont', (parseInt(strClickCont, 10) + 1).toString(), '127.0.0.1' );

                as.stnw.extendSession(); // Extend Session
            });

            stnw.isUserLoggedIn = function (successCallback, failureCallback) {
                $.ajax({
                    url: '//www.alaskaair.com/services/v1/loginvalidator/GetUserStatus?t=' + (new Date()).getTime(),
                    success: function (data) {
                        // Start timer callback, depending on user type
                        if (data.bLogin === true) {
                            stnw.setCookieByKey('bSessionExpired', false);
                            // Set User Type
                            if (data.bEasyBiz === true) {
                                stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.EZBUser.UserType;
                            }
                            else {
                                stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.MAAUser.UserType;
                            }

                            // Set Default Redirect URL for EasyBiz
                            if (stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.EZBUser.UserType) {
                                stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.EZBUser.RedirectURL;
                            }
                            // Overwrite RedirectURL in AS.COM, if each page doesn't specifiy Redirect URL
                            else {
                                if(stnw.RedirectURL === '') {
                                    // if not SiteCore page
                                    if (window.location &&
                                        (window.location.pathname.toLowerCase().indexOf('/content/') === -1
                                         && window.location.pathname.toLowerCase() !== '/')) {
                                        stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.MAAUser.RedirectURL;
                                    }
                                }
                            }

                            // Temporary Control flow for Release Oct 28th 2015
                            // to enable timeout lightbox only in EasyBiz, MyAccount, SiteCore and etc.
                            //if (stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.EZBUser.UserType // EasyBiz User
                            //    || (window.location.pathname.toLowerCase().indexOf('/content/') !== -1) // SiteCore
                            //    || (window.location.pathname.toLowerCase().indexOf('/shopping/cart/') !== -1) // Cart
                            //    || (window.location.pathname.toLowerCase().indexOf('myalaskaair.aspx') !== -1
                            //        || window.location.pathname.toLowerCase().indexOf('/mileageplan') !== -1
                            //        || window.location.pathname.toLowerCase().indexOf('/myaccount/preferences') !== -1) // MyAccount
                            //    || (window.location.pathname.toLowerCase().indexOf('cancelreservation.aspx') !== -1
                            //        && $('#FormUserControl__heading').text() === 'Cancel This Flight Reservation') // CancelReservation
                            //    || (window.location.pathname.toLowerCase().indexOf('giftcertificatestart.aspx') !== -1) // Giftcertificate
                            //    || (window.location.pathname.toLowerCase().indexOf('club49registration') !== -1) // club49
                            //    || as.stnw.bForceStartTimer === true) { // When sign-off in some specific pages
                                (successCallback || Function)();
                            //}
                        }
                        else {
                            if (as.stnw.bForceStartTimer === true) {
                                stnw.setCookieByKey('bSessionExpired', false);
                                (successCallback || Function)();
                            } else {
                                (failureCallback || Function)();
                            }
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        stnw.setCookieByKey('bSessionExpired', true);
                    }
                });
            };

            stnw.timeoutStart = function () {
                this.isUserLoggedIn(this.startTimer, this.resetCookie);
            }

            if (typeof (stnw_init_page) == "function") {
                stnw_init_page();
            }

            as.stnw.timeoutStart();
        }
    }
});
******************************************************/