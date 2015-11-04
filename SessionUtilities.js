/*global jQuery, s_gi, stnw_init_page, console*/
// --------------------
// Session Utilities
// --------------------

(function (global, document, $) {
    'use strict';
    var utilities = function () {
        return new utilities.factory();
    };
    utilities.prototype = {
        IsUserSignIn: function () {
            $.ajax({
                url: '//www.alaskaair.com/services/v1/loginvalidator/GetUserStatus?t=' + (new Date()).getTime(),
                success: function (data) {
                    if (data.bLogin === true) {
                        // Set User Type
                        if (data.bEasyBiz === true) {
                            global.console.log('EasyBiz Sign In');
                        } else {
                            global.console.log('Normal Sign In');
                        }
                    } else {
                        global.console.log('Not Sign In');
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    global.console.log('Endpoint got error!!!');
                }
            });
        },
        setOmniture: function (domain, linkTrackVar, linkTrackEvent, category, event) {
            if (global.s_gi) {
                var s = s_gi(domain);
                s.linkTrackVars = linkTrackVar;
                s.linkTrackEvents = linkTrackEvent;
                s.prop16 = category + '::' + event;
                s.tl(this, 'o', s.prop16);
                s.prop16 = '';
            }
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
        getCookieByKey: function (store, key) {
            var cookieCollection = this.getCookie(store);
            if (cookieCollection.hasOwnProperty(key)) {
                return cookieCollection[key];
            }
            return null;
        },
        setCookieByKey: function (store, key, value, domain) {
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

    utilities.factory = function () {
        
    };
    utilities.factory.prototype = utilities.prototype;

    if (global && !global.utilities) {
        global.utilities = utilities;
    }
}(window, document, jQuery));
