/******************************************
   ___________________
	|                   |
  | Session Utilities |
	|                   |
	 -------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
 ******************************************/


/*global jQuery, s_gi, stnw_init_page, console*/
/*jslint indent: 2*/

(function (global, document, $) {
	'use strict';
	var sessionUtilities = function () {
		return new sessionUtilities.factory();
	};
	sessionUtilities.prototype = {
		URLGetUserStatus:
			'//www.alaskaair.com/services/v1/loginvalidator/GetUserStatus',
		// ****************************************
		// check if user is logged in or not.
		// ****************************************
		IsUserSignIn: function (signInAction, signOutAction) {
			$.ajax({
				url: this.URLGetUserStatus + '?t=' + (new Date()).getTime(),
				success: function (data) {
					signInAction();
				},
				error: function (jqXHR, textStatus, errorThrown) {
					signOutAction();
				}
			});
		},
		// ****************************************
		// extend session by calling GetUserStatus
		// ****************************************
		extendSession: function (session, bForceStartTimer) {
			$.ajax({
				url: this.URLGetUserStatus + '?t=' + (new Date()).getTime(),
				success: function (data) {
					if (data.bLogin === false && bForceStartTimer === false) {
						session.doneCallback();
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					session.doneCallback();
				}
			});
		},
		// ****************************************
		// set Omniture tag
		// ****************************************
		setOmniture: function (domain,
													linkTrackVar,
													linkTrackEvent,
													category,
													event) {
			if (global.s_gi) {
				var s = s_gi(domain);
				s.linkTrackVars = linkTrackVar;
				s.linkTrackEvents = linkTrackEvent;
				s.prop16 = category + '::' + event;
				s.tl(this, 'o', s.prop16);
				s.prop16 = '';
			}
		},
		// ****************************************
		// get Cookie Collection
		// ****************************************
		getCookieCollection: function (collectionName) {
			var i, len, c,
				nameEQ = collectionName + "=",
				cookies = window.document.cookie.split(';'),
				dcURIComp = decodeURIComponent;
			for (i = 0, len = cookies.length; i < len; i = i + 1) {
				c = cookies[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1, c.length);
				}
				if (c.indexOf(nameEQ) === 0) {
					return JSON.parse(dcURIComp(c.substring(nameEQ.length, c.length)));
				}
			}
			return {};
		},
		// ****************************************
		// get key/value in cookie collection
		// ****************************************
		getCookieByKey: function (collectionKey, key) {
			var cookieCollection = this.getCookieCollection(collectionKey);
			if (cookieCollection.hasOwnProperty(key)) {
				return cookieCollection[key];
			}
			return null;
		},
		// ****************************************
		// set key/value in cookie collection
		// ****************************************
		setCookieByKey: function (collectionKey, key, value, domain) {
			var cookieCollection = this.getCookieCollection(collectionKey),
				t = new Date();

			cookieCollection[key] = value;
			document.cookie = collectionKey + "="
				+ JSON.stringify(cookieCollection)
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

	sessionUtilities.factory = function () {
		
	};
	sessionUtilities.factory.prototype = sessionUtilities.prototype;

	// ********************************************
	// expose sessionUtilities to global scope
	// ********************************************
	if (global && !global.sessionUtilities) {
		global.sessionUtilities = sessionUtilities;
	}
}(window, document, jQuery));
