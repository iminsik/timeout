
//start widget containers
var WidgetContainers = { Selectors: { V: "#vshopping-container", H: "#hshopping-container", P: "#pshopping-container" } };
//end widget containers

//Start Lightbox Code
var POPUP_OUTER_DIV_CLASS = "EzPopopOuter";
var POPUP_INNER_DIV_CLASS = "EzPopopInner";
var POPUP_CLOSE_BTN_CLASS = "EzPopopClsBtn";
var CLOSE_ANCHOR_ID = "closeAnchorId";
var FORM_FILLER_ID = "divFormFiller";
var lastFocus;

if (typeof $.browser == 'undefined') {
    $.browser = {};
    (function () {
        $.browser.msie = false;
        $.browser.version = 0;
        if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
            $.browser.msie = true;
            $.browser.version = RegExp.$1;
        }
    })();
}

window.onresize = function () {
    if ($.browser.msie) {
        if ($("#" + FORM_FILLER_ID).length !== 0 && $("#" + FORM_FILLER_ID).css("display").toLowerCase() !== "none") {
            $.showFormFiller();
        }
        if ($("#" + PROCESSING_DIV_ID).length !== 0 && $("#" + PROCESSING_DIV_ID).css("display").toLowerCase() !== "none") {
            $.showProcessingBar();
        }
    }
};

jQuery.fn.positionElement = function (param) {
    var top = (param != null && param.top != null && !isNaN(param.top)) ? param.top : 0;
    var left = (param != null && param.left != null && !isNaN(param.left)) ? param.left : 0;
    var duration = param != null && param.duration != null ? param.duration : "slow";
    this.css({ left: left }).css({ top: top });
    this.show(duration);
};

jQuery.showFormFiller = function (closeOnClick, onClose) {
    if ($("#" + FORM_FILLER_ID).length === 0) {
        var parentElement = $("body");
        if (parentElement.length === 0) {
            parentElement = $("div").first();
        }


        parentElement.append("<iframe id='iFiller' aria-hidden='true' src='javascript:false;' name='iFiller' title=''></iframe><div id='" + FORM_FILLER_ID + "' aria-hidden='true'></div>");

        $("#" + FORM_FILLER_ID).css({ "background-color": "silver" }).css({ "display": "none" }).css({ "z-index": "500" }).css({ "filter": "alpha(opacity = 70)" });
        $("#" + FORM_FILLER_ID).css({ "opacity": "0.7" });
        $("#iFiller").css({ "display": "none", "z-index": "49", border: 0, margin: 0, "opacity": "0" });
        if (!$.browser.msie) {
            $("#" + FORM_FILLER_ID).css({ "position": "fixed", "top": "0px", "bottom": "0px", "left": "0px", "right": "0px" });
            $("#iFiller").css({ "position": "fixed", "top": "0px", "bottom": "0px", "left": "0px", "right": "0px" });
        } else {
            $("#iFiller").css({ "position": "absolute" });
            $("#" + FORM_FILLER_ID).css({ "position": "absolute" });
        }
    }
    var height = lightboxHelper.GetTotalHeight();
    var width = lightboxHelper.GetTotalWidth();
    if ($.browser.msie) {
        $("#" + FORM_FILLER_ID).css({ height: height, width: width - 17, top: 0, left: 0 });
    }
    $("#iFiller").css({ height: height - 100, width: width - 100, top: 0, left: 0 });
    $("#" + FORM_FILLER_ID).show();
    $("#iFiller").show();
    $("#" + FORM_FILLER_ID).unbind("click");
    $("#" + FORM_FILLER_ID).bind("click", function () {
        if (closeOnClick == null || closeOnClick == true) {
            $.closeEzPopoups();
            if (onClose != null && typeof onClose == "function") {
                try {
                    onClose();
                }
                catch (e) {
                }
            }
        }
    });

};

jQuery.showInterstitialFormFiller = function (closeOnClick) {
    var fillerTop = $(window).scrollTop();
    if ($("#" + FORM_FILLER_ID).length == 0) {
        var parentElement = $("body");
        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }
        parentElement.append("<iframe id='iFiller' src='javascript:false;' name='iFiller' title=''></iframe><div id='" + FORM_FILLER_ID + "'></div>");

        $("#" + FORM_FILLER_ID).css({ "background": "#f2f5fa", "z-index": "500" });

        $("#iFiller").css({ "display": "none", "z-index": "49", border: 0, margin: 0, "opacity": "0" });
        if (!$.browser.msie) {
            $("#" + FORM_FILLER_ID).css({ "position": "fixed", "top": "0", "bottom": "0", "left": "0", "right": "0" });
            $("#iFiller").css({ "position": "fixed", "top": "0", "bottom": "0", "left": "0", "right": "0" });
        }
        else {
            $("#iFiller").css({ "position": "absolute", "top": fillerTop + "px" });
            $("#" + FORM_FILLER_ID).css({ "position": "absolute", "top": fillerTop + "px" });
        }
    }

    var height = lightboxHelper.GetTotalHeight();
    var width = lightboxHelper.GetTotalWidth();
    if ($.browser.msie) {
        $("#" + FORM_FILLER_ID).css({ height: height, width: width, top: fillerTop, left: 0 });
    }
    $("#iFiller").css({ height: height - 100, width: width - 100, top: fillerTop, left: 0 });
    $("#" + FORM_FILLER_ID).show();
    $("#iFiller").show();
    $("#" + FORM_FILLER_ID).unbind("click");
    $("#" + FORM_FILLER_ID).bind("click", function () {
        if (closeOnClick == null || closeOnClick == true) {
            $.closeEzPopoups();
        }
    });

};

var lightboxHelper = new LightboxHelper();
function LightboxHelper() {
    this.KeyPressedEventBound = false;
    this.GetVisibleHeight = function () {
        return $(document).height() > $(window).height() ? $(window).height() : $(document).height();
    };

    this.GetTotalHeight = function () {
        return $(document).height() < $(window).height() ? $(window).height() : $(document).height();
    };

    this.GetVisibleWidth = function () {
        return $(document).width() > $(window).width() ? $(window).width() : $(document).width();
    };

    this.GetTotalWidth = function () {
        return $(document).width() < $(window).width() ? $(window).width() : $(document).width();
    };
    this.GetIdUniqueSuffix = function () {
        var d = new Date();
        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var curr_sec = d.getSeconds();

        return curr_hour + "_" + curr_min + "_" + curr_sec + Math.floor(Math.random() * 1111);
    };
}

jQuery.hideFormFiller = function () {
    $("#iFiller").hide();
    $("#" + FORM_FILLER_ID).hide();
};

jQuery.fn.makeRoundCorner = function (param) {
    var cornerRadius = param != null && param.cornerRadius != null ? param.cornerRadius : 5;
    var showShadow = param != null && param.showShadow != null ? param.showShadow : false;
    var boxShadowStyle = param != null && param.boxShadowStyle != null ? param.boxShadowStyle : "3px 3px 3px #999";
    this.css({ "-moz-border-radius": cornerRadius }).css({ "-webkit-border-radius": cornerRadius }).css({ "border-radius": cornerRadius });
    if (showShadow == true) {
        this.css({ "box-shadow": boxShadowStyle }).css({ "-webkit-box-shadow": boxShadowStyle }).css({ "-moz-box-shadow": boxShadowStyle });
    }
    return this;
};

jQuery.fn.formatEzTable = function (param) {
    var tables = this;
    tables.each(function (i) {
        $(this).attr({ cellpadding: 6 }).attr({ cellspacing: 0 });
        $(this).css("border-left", "solid 1px #656565");
        $(this).css("border-top", "solid 1px #656565");
        $("td", $(this)).css("border-right", "solid 1px #656565");
        $("td", $(this)).css("border-bottom", "solid 1px #656565");
        $("th", $(this)).css("border-right", "solid 1px #656565");
        $("th", $(this)).css("border-bottom", "solid 1px #656565");
        var visibleRowNumber = 0;
        $("tbody > tr", this).each(function (j) {
            if ($(this).css("display").toLowerCase() != "none") {
                visibleRowNumber++;
                if (visibleRowNumber == 1) {
                    $(this).css("background-color", "#E6EDF6");
                }
                else {
                    if ((visibleRowNumber % 2) == 1) {
                        $(this).css("background-color", "#E6EDF6");
                    }
                    else {
                        $(this).css("background-color", "white");
                    }
                }
            }
        });

    });
};


jQuery.closeEzPopoups = function (noDelay) {
    noDelay = noDelay == null ? false : noDelay;
    if (noDelay === true) {
        $(".EzPopopOuter").hide();
        $.hideFormFiller();
    }
    else {
        $(".EzPopopOuter").hide("slow", function () {
            $.hideFormFiller();
        });
    }
};

jQuery.fn.centerEz = function (param) {
    var baseWidth = (param != null && param.baseWidth != null && !isNaN(param.baseWidth)) ? param.baseWidth : $(document).width();
    var duration = param.duration;
    if (isNaN(baseWidth) || baseWidth == null || baseWidth == 0) {
        baseWidth = $(document).width();
    }
    var baseHeight = lightboxHelper.GetVisibleHeight();
    var top = (baseHeight - this.height()) / 2 + $(document).scrollTop();
    var left = (baseWidth - this.width()) / 2 + $(document).scrollLeft();
    var minTop = 7;
    if (top < minTop) top = minTop;
    var minLeft = 0;
    if (left < minLeft) left = minLeft;
    this.css({ position: "absolute" });
    this.positionElement({ top: top, left: left, duration: duration });
    return this;
};

jQuery.fn.showEzPopup = function (param) {

    var top = (param != null && param.top != null && !isNaN(param.top)) ? param.top : 0;
    var left = (param != null && param.left != null && !isNaN(param.left)) ? param.left : 0;
    var centerOnPage = (param != null && param.centerOnPage != null) ? param.centerOnPage : false;
    var duration = 0; //ignore for now, param != null && param.duration != null ? param.duration : "slow";
    var baseWidth = param.baseWidth;
    if (centerOnPage == true) {
        if (baseWidth != null && baseWidth > 0) {
            this.centerEz({ baseWidth: baseWidth, duration: duration });
        }
        else {
            this.centerEz({ duration: duration });
        }
    }
    else {
        if (top != 0 && left != 0) {
            $(this).positionElement({ left: left, top: top, duration: duration });
        }
        else {
            $(this).css({ position: "absolute" }).show(duration);
        }
    }
};

jQuery.fn.hideEzPopup = function () {
    this.hide();
    $.hideFormFiller();
};

// postify.js
// Converts an object to an ASP.NET MVC  model-binding-friendly format
// Author: Nick Riggs
// http://www.nickriggs.com

$.postify = function (value) {
    var result = {};

    var buildResult = function (object, prefix) {
        for (var key in object) {

            var postKey = isFinite(key)
                ? (prefix != "" ? prefix : "") + "[" + key + "]"
                : (prefix != "" ? prefix + "." : "") + key;

            switch (typeof (object[key])) {
                case "number": case "string": case "boolean":
                    result[postKey] = object[key];
                    break;

                case "object":
                    if (object[key].toUTCString)
                        result[postKey] = object[key].toUTCString().replace("UTC", "GMT");
                    else {
                        buildResult(object[key], postKey != "" ? postKey : key);
                    }
            }
        }
    };

    buildResult(value, "");

    return result;
};

jQuery.fn.disableEnableInputControls = function (willDisable) {
    if (this == null) {
        $("input").attr({ disabled: willDisable });
        $("select").attr({ disabled: willDisable });
        $("textarea").attr({ disabled: willDisable });
    }
    else {
        $("input", this).attr({ disabled: willDisable });
        $("select", this).attr({ disabled: willDisable });
        $("textarea", this).attr({ disabled: willDisable });
    }
};

jQuery.showValidationMessages = function () {
    $(".redtext").show();
};

jQuery.hideValidationMessages = function () {
    $(".redtext").hide();
};

jQuery.showActionMessage = function (message, isError, param) {
    if (message == '') {
        $.hideActionMessage();
    }
    else {
        var top = param != null && param.top != null ? param.top : 150;
        var left = param != null && param.left != null ? param.left : 170;
        if (isError == null) {
            isError = true;
        }
        if (isError) {
            $("#" + MESSAGE_TEXT_DIV_ID).css({ "color": 'red' }).html(message);
        }
        else {
            $("#" + MESSAGE_TEXT_DIV_ID).css({ "color": '#54112b' }).html(message).addClass('successTextSummary');
        }
        $("#" + MESSAGE_CONTAINER_DIV_ID).positionElement({ top: top, left: left, duration: "fast" });
    }
};

jQuery.hideActionMessage = function () {
    $("#" + MESSAGE_CONTAINER_DIV_ID).hide();
};

jQuery.showProcessingBar = function () {
    var baseWidth = lightboxHelper.GetVisibleWidth();
    var baseHeight = lightboxHelper.GetVisibleHeight();
    var top = (baseHeight - $("#" + PROCESSING_DIV_ID).height()) / 2 + $(document).scrollTop();
    var left = (baseWidth - $("#" + PROCESSING_DIV_ID).width()) / 2 + $(document).scrollLeft();

    var divProcessing = $("#" + PROCESSING_DIV_ID);
    var parentElement = $("body");
    if ($(divProcessing).length == 0) {
        var html = "<div style='box-sizing: content-box; border:solid 2px #00245A; height:100px; width:100px; display:none; z-index:10000;background-color:white; padding:5px;' id='" + PROCESSING_DIV_ID + "'>";
        html += "<div style='font-family:Arial; font-size:12px;color: #000066;font-weight:bold;'><img src='//resource.alaskaair.net/icons/ajax-loader_b.gif' style='position: absolute; margin-top: -2px;z-index:10002;' alt='Loading...' /><div style='padding:35px 0 0 20px;z-index:10001;'>Loading...</div></div>";
        html += "</div>";

        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }
        parentElement.append(html);

        divProcessing = $("#" + PROCESSING_DIV_ID);
        $(divProcessing).css({ "position": "absolute" }).css({ top: 0 }).css({ left: 0 });
        $(divProcessing).makeRoundCorner(10);
    }

    $.showFormFiller(false);
    $("#" + PROCESSING_DIV_ID).css({ left: left }).css({ top: top }).show();


    $(document).scrollTop($(document).scrollTop() + 1);
};

jQuery.scroll1pxDown = function () {
    $(document).scrollTop($(document).scrollTop() + 1);
};

jQuery.hideProcessingBar = function () {
    $.hideFormFiller();
    $("#" + PROCESSING_DIV_ID).hide();
};

var PROCESSING_DIV_ID = "divProcessing";
var MESSAGE_CONTAINER_DIV_ID = "divMessageContainer";
var MESSAGE_TEXT_DIV_ID = "divMessageText";
var CLOSE_MESSAGE_BAR_DIV_ID = "divCloseMessageBar";
var SESSION_TIMEDOUT_DIV_ID = "divSessionTimedOut";
var MY_ACCOUNT_TIMEDOUT_DIV_ID = "divMyAccountSessionTimedOut";
jQuery.createMessageElements = function () {
    //alert('>Lightbox.otheres.js jQuery.createMessageElements');
    var parentElement = $("body");

    var divProcessing = $("#" + PROCESSING_DIV_ID);
    if ($(divProcessing).length == 0) {
        var html = "<div style='border:solid 2px #00245A; height:100px; width:100px; display:none; z-index:10000;background-color:white; padding:5px;' id='" + PROCESSING_DIV_ID + "'>";
        html += "<div style='font-family:Arial; font-size:10px;'><img src='https://www.alaskaair.com/images/ajax-loader.gif' style='position: absolute; margin-top: -2px;' /></div>";
        html += "</div>"

        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }
        parentElement.append(html);

        divProcessing = $("#" + PROCESSING_DIV_ID);
        $(divProcessing).css({ "position": "absolute" }).css({ top: 0 }).css({ left: 0 });
        $(divProcessing).makeRoundCorner(10);
    }

    var divMessageContainer = $("#" + MESSAGE_CONTAINER_DIV_ID);
    if ($(divMessageContainer).length == 0) {
        var html = "";
        html += "<div id='" + MESSAGE_CONTAINER_DIV_ID + "' style='display:none;position:absolute;'>";
        html += "<div id='" + MESSAGE_TEXT_DIV_ID + "' style='float: left; text-align: center;padding-top:5px; font-weight:bold;'></div>";
        html += "<div id='" + CLOSE_MESSAGE_BAR_DIV_ID + "' style='float: left;z-index:20000; cursor:pointer; padding-left: 10px;'>";
        html += "	<img src='https://www.alaskaair.com/images/Popup_Close_X.png' alt='Close' tabindex='0' role='button' />";
        html += "</div>";

        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }
        parentElement.append(html);

        var divCloseMessageBar = $("#" + CLOSE_MESSAGE_BAR_DIV_ID);
        $(divCloseMessageBar).click(function () {
            $.hideActionMessage();
        });
        $(divCloseMessageBar).css({ "padding-left": "10px" }).hide(); //don't show for now
    }

    var divSessionTimedOut = $("#" + SESSION_TIMEDOUT_DIV_ID);
    if ($(divSessionTimedOut).length == 0) {
        var html = "";
        html += "<div id='divSessionTimedOut' style='display:none;'>";
        html += "	Your session has timed out. You will be redirected to the signin page.<br />";
        html += "	<br />";
        html += "	Please wait...<img alt='' src='https://www.alaskaair.com/images/interstitial-animated-dots.gif' />";
        html += "</div>";
        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }
        parentElement.append(html);
    }

    if ($.browser.msie) {
        var screenTop = $(document).scrollTop();
        divProcessing.css({ top: screenTop }).css({ left: 0 });
    }


};

var SIGNIN_REQUIRED = "SigninRequired";
var ERROR_ENCOUNTERED = "Error was encountered, please try again.";
var REQUEST_SUCCESSFUL = "Your request was successfully processed.";
var REQUEST_TIMED_OUT = "Your request timed out, please try again.";

function afterPost(msg) {
    if (msg == SIGNIN_REQUIRED || msg.indexOf(SESSION_TIMEDOUT_DIV_ID) > 0 || msg.indexOf(MY_ACCOUNT_TIMEDOUT_DIV_ID) > 0) {
        redirectToSignInPage();
        return false;
    }
    else {
        return true;
    }
}

function redirectToSignInPage() {
    $.hideLightBoxes();
    $("#divSessionTimedOut").showLightBox({ width: 300, hideCloseBtn: true });

    window.setTimeout("window.location.href = 'https://easybiz.alaskaair.com/ssl/signin/cosignin.aspx?CurrentForm=UCCoSignInStart&action=timedout';", 1000);
}
function redirectToMyAccountSignInPage(url) {
    $.hideLightBoxes();
    $("#divMyAccountSessionTimedOut").showLightBox({ width: 300, hideCloseBtn: true });

    var urlString = "https://www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCSignInStart";
    if (url != null) {
        urlString = urlString + "&url=" + url;
    }

    window.setTimeout("window.location.href = '" + urlString + "';", 1000);
}
var ESCAPE_KEY_CODE = 27;
var ENTER_KEY_CODE = 13;
function clickBtnOnTargetKey(targetKey, btnId) {
    if (event.keyCode == targetKey) {
        $("#" + btnId).click();
    }
}

function focusOnFirstInput(container) {
    $("input:eq(0)", container).focus();
}

jQuery.toggleAjaxProcessingImage = function (show) {
    if (show) {
        $.showProcessingBar();
    } else {
        $.hideProcessingBar();
    }
};


jQuery.fn.showLightBox = function (param) {
    //show only one lightbox at a time. Close other lightboxes.
    $.closeEzPopoups(true);

    param = param || {};
    var width = param != null && param.width != null ? param.width : 200;
    var maxWidth = param != null && param.maxWidth != null ? param.maxWidth : 585;
    var maxWidthOverride = param != null && param.maxWidthOverride != null ? param.maxWidthOverride : false;
    var isDraggable = param != null && param.isDraggable != null ? param.isDraggable : false;
    var src = param != null && param.src != null ? param.src : null;
    var setParentZIndex = param != null && param.setParentZIndex != null ? param.setParentZIndex : true;
    var show = param != null && param.show != null ? param.show : true;
    var centerOnPage = param != null && param.centerOnPage != null ? param.centerOnPage : true;
    var btnCloseElement = param != null && param.btnCloseElement != null ? $(param.btnCloseElement) : null;
    var btnSubmitElement = param != null && param.btnSubmitElement != null ? param.btnSubmitElement : null;
    var submitOnEnter = param != null && param.submitOnEnter != null ? param.submitOnEnter : true;
    var animation = param != null && param.animation != null ? param.animation : "easeOutBounce";
    var hideProcessingBar = param != null && param.hideProcessingBar != null ? param.hideProcessingBar : true;
    var hideValidationMessages = param != null && param.hideValidationMessages != null ? param.hideValidationMessages : true;
    var hideActionMessage = param != null && param.hideActionMessage != null ? param.hideActionMessage : true;
    var cornerRadius = param != null && param.cornerRadius != null ? param.cornerRadius : 5;
    var borderThickness = param != null && param.borderThickness != null ? param.borderThickness : 5;
    var borderColor = param != null && param.borderColor != null ? param.borderColor : "#5f87bb";
    var boxShadowStyle = param != null && param.boxShadowStyle != null ? param.boxShadowStyle : "3px 3px 3px #999";
    var parentElement = param.parentElement;
    var height = param.height;
    var duration = param.duration;
    var hideCloseBtn = param != null && param.hideCloseBtn != null ? param.hideCloseBtn : false;
    var hideCloseSecondaryBtn = param != null && param.hideCloseSecondaryBtn != null ? param.hideCloseSecondaryBtn : true;
    var createNew = param != null && param.createNew != null ? param.createNew : false;
    var skipFocus = param != null && param.skipFocus != null ? param.skipFocus : false;
    var onClose = param.onClose;
    var focusid = param.focusid;
    if (width == null || isNaN(width) || width <= 0) {
        width = 200;
    }

    var mainContainer = $(this).parents("." + POPUP_OUTER_DIV_CLASS);
    var innerContainer;

    var minWidth = 200;
    var maxHeight = 520;

    if (mainContainer.length == 0 || createNew == true) {
        var parentId = "divEzPopup" + lightboxHelper.GetIdUniqueSuffix() + Math.floor(Math.random() * 11),
            imgId = "img" + lightboxHelper.GetIdUniqueSuffix(),
            closeAnchorId = CLOSE_ANCHOR_ID  + lightboxHelper.GetIdUniqueSuffix();

        mainContainer = jQuery("<div/>", { id: parentId, "class": POPUP_OUTER_DIV_CLASS + ' popup', width: width, title: "", tabindex: -1, role: "dialog" });       

        var divImgContainer = jQuery("<div/>").css({ position: "absolute", right: "-15px", top: "-13px", "z-index": "9999999" });
        var imgCloseBtn;
        aCloseBtn = jQuery("<a />", { id: closeAnchorId, href: "#", role: "button" });
        imgCloseBtn = jQuery("<img />", { id: imgId, src: "https://www.alaskaair.com/images/Popup_Close_X.png", "alt": "Close" });
        aCloseBtn.append(imgCloseBtn);
        imgCloseBtn.attr("class", POPUP_CLOSE_BTN_CLASS);
        if (hideCloseBtn == true) {
            imgCloseBtn.hide(); //hide button to IE6 users, button doesn't render nicely for the browser
        }

        divImgContainer.append(aCloseBtn);

        var innerContainer = jQuery("<div/>", { "class": POPUP_INNER_DIV_CLASS + ' containerx' });
        mainContainer.append(innerContainer);
        mainContainer.append(divImgContainer);

        if (parentElement == null || parentElement.length == 0) {
            parentElement = $(this).parent();
        }
        if (parentElement.length == 0) {
            parentElement = $("body");
        }
        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }


        parentElement.append(mainContainer);

        mainContainer.css({ background: "white", "border": "solid " + borderThickness + "px #5f87bb", "z-index": "9999998", float: "left" });
        if (setParentZIndex) {
            mainContainer.offsetParent().css({ "z-index": "9999997" });
        }
        //, "max-height": "520px", "max-width":"585px", "overflow":"auto"
        // var maxWidth = 585;
        $("." + POPUP_INNER_DIV_CLASS, mainContainer).css({ "background-color": "white" });
        if (height != null) {
            if (height > maxHeight) {
                mainContainer.css({ "max-height": maxHeight, overflow: "auto" });
                mainContainer.css({ "height": maxHeight });
            }
            else {
                mainContainer.css({ "height": height });
            }
        }
        if (width > maxWidth && !maxWidthOverride) {
            mainContainer.css({ width: maxWidth, "max-width": maxWidth, overflow: "auto" });
        }
        else {
            mainContainer.css({ width: width });
        }
        $("." + POPUP_INNER_DIV_CLASS, mainContainer).css({ "padding": "15px" });


        $('body').delegate("#" + closeAnchorId, 'click', function (e) {
            e.preventDefault();
            $(this).parents("." + POPUP_OUTER_DIV_CLASS).hide();
            var withVisiblePopups = false;
            $("." + POPUP_OUTER_DIV_CLASS).each(function (i) {
                if ($(this).css("display").toLowerCase() !== "none") {
                    withVisiblePopups = true;
                }
            });
            if (!withVisiblePopups) {
                $.hideFormFiller();
            }
            if (hideProcessingBar) {
                $.hideProcessingBar();
            }
            if (hideValidationMessages) {
                $.hideValidationMessages();
            }
            if (hideActionMessage) {
                $.hideActionMessage();
            }

            if (onClose !== null && typeof onClose === "function") {
                try {
                    onClose();
                }
                catch (e) {
                }
            }
            lastFocus.focus();

        });


    }
    else {
        //mainContainer = $(this).parents("." + POPUP_OUTER_DIV_CLASS);
        innerContainer = $("." + POPUP_INNER_DIV_CLASS, mainContainer);
        innerContainer.find("#closeLink").remove();
        if (height != null) {
            if (height > maxHeight) {
                mainContainer.css({ "max-height": maxHeight, overflow: "auto" });
                mainContainer.css({ "height": maxHeight });
            }
            else {
                mainContainer.css({ "height": height });
            }
        }
        if (width > maxWidth && !maxWidthOverride) {
            mainContainer.css({ width: maxWidth, "max-width": maxWidth, overflow: "auto" });
        }
        else {
            mainContainer.css({ width: width });
        }
    }

    innerContainer.append(this);

    if (isDraggable || isDraggable == null) {
        try {
            //lightboxes should not be movable for now
            //mainContainer.draggable();
        }
        catch (e) {
            //JQuery UI must be referenced in order for this to work
        }
    }

    if ($(btnCloseElement).length > 0) {
        //hide close button, according to spec from Amanda, users can still close lightbox by clicking area outside
        if (hideCloseSecondaryBtn) {
            $(btnCloseElement).hide();
        }
        $(btnCloseElement).bind("click", function () {
            $("." + POPUP_CLOSE_BTN_CLASS, mainContainer).click();
            return false;
        });
    }

    lastFocus = document.activeElement;
    this.show();
    innerContainer.makeRoundCorner({ cornerRadius: 3 });
    mainContainer.makeRoundCorner({ showShadow: true });

    if (src != null) {
        $(src).after(mainContainer);
    }
    mainContainer.hide().showEzPopup({ centerOnPage: true, duration: duration, centerOnPage: centerOnPage });
    mainContainer.css({ overflow: "" });
    mainContainer.show(0, function () {
        $.showFormFiller(hideCloseBtn == false, onClose);
    });

    var keyboardEvent = "keyup";
    $(this).unbind(keyboardEvent);
    $(this).bind(keyboardEvent, function (e) {
        if (submitOnEnter && e.keyCode == ENTER_KEY_CODE && $(e.target).attr("id") != $(btnSubmitElement).attr("id")) {
            $(btnSubmitElement).click();
        }
    });

    if (lightboxHelper.KeyPressedEventBound == false) {
        lightboxHelper.KeyPressedEventBound = true;
        $(document).bind(keyboardEvent, function (e) {
            if (e.keyCode == ESCAPE_KEY_CODE && hideCloseBtn == false) {
                $("." + POPUP_CLOSE_BTN_CLASS).each(function (i) {
                    if ($(this).parents("." + POPUP_OUTER_DIV_CLASS).css("display").toLowerCase() == "block") {
                        $(this).click();
                    }
                });
            }
        });
    }

    var label = $(mainContainer).find('h1, h2, h3, h4, h5, h6, [role="heading"]').first().text();
    mainContainer.attr('aria-label', label);
    //for accessibility, focus on first element that can receive focus
    //this has been modified to focus on first error if exists, otherwise focus on outermost div -SK
    if (skipFocus === false) {
        //A11Y - add aria-invalid to all errored fields
        var focusElements = "[aria-invalid=true]";

        if ($(focusElements, this).length > 0) {
            $(focusElements, this).eq(0).focus();
            try {
                $(this).scrollTop(0);
            }
            catch (e) {
            }
        }
        else {
            $('.EzPopopOuter').focus();
        }
    }
    else if (focusid) {
        $("#" + focusid).focus();
    }

    //Trap tabbing within lightbox
    var handleKeyDown = function (event) {

        if (event.keyCode !== $.ui.keyCode.TAB) {
            return;
        }

        var tabbables = $(mainContainer).find(':tabbable');

        // Safari will not do searches into an iFrame. So, we have to get the document object and
        // do the search on it.
        var iFrame = $(mainContainer).find('iframe');
        if (tabbables.length > 0 && iFrame.length > 0) {
            tabbables = $(iFrame[0].contentDocument).find(':tabbable, [data-modalfocus=true]');
        }

        var index = $.inArray(event.target, tabbables);
        if (index < 0) {
            return;
        }

        if (!event.shiftKey) {
            tabbables[(index + 1) % tabbables.length].focus(1);
        }
        else {
            tabbables[(index - 1 + tabbables.length) % tabbables.length].focus(1);
        }

        return false;
    };

    try {
        $(mainContainer).find('iframe')[0].contentDocument;

        $(mainContainer).find('iframe').load(function () {
            var $modalClose = $($(mainContainer).find('iframe')[0].contentDocument).find('[data-modalclose]');
            var closeModal = function () {
                $("#" + closeAnchorId).click();
                return false;
            }
            $modalClose.click(closeModal);
            $modalClose.bind('keypress', function (event) {
                if (event.keyCode === 96 || event.keyCode === 13) {
                    closeModal();
                }
            });

            $($(mainContainer).find('iframe')[0].contentDocument)
                      .find('body')
                      .bind('keydown', handleKeyDown);
        });
    }
    catch (e) { }

    $(mainContainer).bind('keydown', handleKeyDown);

    return mainContainer;
};

//end showLightBox function

jQuery.hideLightBoxes = function () {
    $("." + POPUP_OUTER_DIV_CLASS).hide();
};

jQuery.getHtml = function getHtml(param) {
    param = param || {};
    var width = param.width;
    var url = param.url;
    var container = param.container;
    var btnCloseElement = param.btnCloseElement;
    var btnCloseElementId = param.btnCloseElementId;
    var btnSubmitElement = param.btnSubmitElement;
    var submitOnEnter = param.submitOnEnter;
    var tables_forformatting = param.tables_forformatting;
    var popup = param.popup;
    var completeCallback = param.completeCallback;
    var afterCompleteCallback = param.afterCompleteCallback;
    var attachTo = param.attachTo;
    var height = param.height;
    var duration = param.duration;
    var centerOnPage = param.centerOnPage;
    var isDraggable = param != null && param.isDraggable != null ? param.isDraggable : true;
    var hideCloseBtn = param != null && param.hideCloseBtn != null ? param.hideCloseBtn : false;
    var hideCloseSecondaryBtn = param != null && param.hideCloseSecondaryBtn != null ? param.hideCloseSecondaryBtn : true;
    $.ajax({
        type: "POST",
        url: url,
        complete: function (response, textStatus) {
            switch (textStatus) {
                case "timeout":
                    $.showActionMessage(REQUEST_TIMED_OUT, true);
                    break;
                case "error":
                    $.showActionMessage(ERROR_ENCOUNTERED, true);
                    break;
                default:
                    if (completeCallback == null || completeCallback(response, textStatus)) {
                        if ($(container).length > 0) {
                            $(container).replaceWith(response.responseText);
                        }
                        else {
                            if (attachTo == null || attachTo.length == 0) {
                                attachTo = $("div").first();
                            }
                            if (attachTo == null || attachTo.length == 0) {
                                attachTo = $("body");
                            }
                            attachTo.after(response.responseText);
                            container = $(container);
                        }
                        if (btnCloseElement == null || $(btnCloseElement).length == 0) {
                            if (btnCloseElementId != null && btnCloseElementId != "") {
                                btnCloseElement = $("#" + btnCloseElementId);
                            }
                        }
                        if (popup == true) {
                            $(container).showLightBox({ width: width, btnCloseElement: btnCloseElement, btnSubmitElement: btnSubmitElement, height: height, duration: duration, src: attachTo, centerOnPage: centerOnPage, isDraggable: isDraggable, hideCloseBtn: hideCloseBtn, submitOnEnter: submitOnEnter, hideCloseSecondaryBtn: hideCloseSecondaryBtn });
                        }
                        $(tables_forformatting).formatEzTable({ isHeaderTextBold: true });

                        if (afterCompleteCallback != null) {
                            afterCompleteCallback();
                        }
                    }
            }
        }
    });
};

jQuery.showAboutDiscountCode = function (discountCode) {
    if (typeof (this.parent) !== "undefined") {
        this.parent.document.domain = 'alaskaair.com';
    }
    else if (typeof (this.document) !== "undefined") {
        this.document.domain = 'alaskaair.com';
    }
    else if (typeof (window.document) !== "undefined") {
            window.document.domain = 'alaskaair.com';
    }

    var divId = "divAboutDC_IF";
    var divIdJQ = "#" + divId;
    var ifrmId = "ifrmAboutDC";
    var ifrmIdJQ = "#" + ifrmId;
    if ($(divIdJQ).length == 0) {
        var html = "<div id='" + divId + "' style='display:none;'><iframe id='" + ifrmId + "' title='About Discount Codes' height='500' tabindex='-1' frameborder='0' width='560' scrolling='auto' src='javascript:false;'></iframe></div>";
        $("body").append(html);
        $(divIdJQ).css({ width: 560, height: 500 });
    }
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/shared/tips/AboutDiscountCodes.aspx?popup=true&referrer=lightbox&code=" + discountCode;
    $(ifrmIdJQ).attr({ src: url});
    $(divIdJQ).showLightBox({width: 585, maxWidthOverride: true });
};

jQuery.showCodeOrNumberLB = function (src) {
    $.showLB(src, "www.alaskaair.com/help/CodeOrNumber", 380, 145);
};

jQuery.showLB = function (src, url, width, height) {
    // width is required, but height is not
    // url has to point to the same domain as the page
    // Use this if close buttons (elements with id "Close") need to be hidden
    // Do not include protocol in url, but include domain (e.g. "www.alaskaair.com/content/...")
    var divId = "divLB";
    var divIdJQ = "#" + divId;
    if ($(divIdJQ).length == 0) {
        var html = "<div id='" + divId + "' style='display:none;overflow:auto;'></div>";
        $("body").append(html);
    }
    if (!isNaN(height)) { $(divIdJQ).css({ height: height }); } else { $(divIdJQ).css({ height: "auto" }); }
    url = top.location.protocol + '//' + url;
    $.ajax({ url: url, success: function (data) { $(divIdJQ).html(data); $(divIdJQ + ' #Close').hide(); } });
    $(divIdJQ).showLightBox({ src: src, width: width, maxWidthOverride: true, centerOnPage: true });
};

jQuery.showLB_IF = function (src, url, width, height) {
    // both width and height are required
    // Use this if the url points to another domain
    // Close buttons cannot be hidden because of the cross-domain issue
    // url may include protocol, but not required.  Always include domain.
    var divId = "divLB_IF";
    var divIdJQ = "#" + divId;
    var ifrmId = "ifrmLB_IF";
    var ifrmIdJQ = "#" + ifrmId;
    if ($(divIdJQ).length == 0) {
        var html = "<div id='" + divId + "' style='display:none;'><iframe id='" + ifrmId + "' frameborder='0' tabindex='-1' scrolling='auto' src='javascript:false;'></iframe></div>";
        $("body").append(html);
    }
    $(divIdJQ).css({ width: width - 40, height: height });
    $(ifrmIdJQ).css({ width: width - 40, height: height });

    if (url.substring(4, 0).toLowerCase() != "http") {
        url = top.location.protocol + '//' + url;
    }
    $(ifrmIdJQ).attr({ src: url });
    $(divIdJQ).showLightBox({ src: src, width: width, maxWidthOverride: true, centerOnPage: true });
};
//end Lightbox Code
