/*global $timer, console, $*/
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

var warningHelper = function (i, timer, mode) {
    'use strict';
    return function () {
        if (mode === 'beforewarningcallback') {
            $('#Timeleft' + i).text('expires in ' + timer.timer.timeLeft()).css('color', 'black');
        } else if (mode === 'afterwarningcallback') {
            $('#Timeleft' + i).text('expires in ' + timer.timer.timeLeft() + ' WARNING!!!').css('color', 'red');
        } else if (mode === 'donecallback') {
            $('#Timeleft' + i).text('Time has flied.').css('color', 'red');
        }
    };
};

for (i = 0, len = timerSettings.length; i < len; i = i + 1) {
    timers.push(window.timerMultitab(
        timerSettings[i].name,
        timerSettings[i].warningTime,
        timerSettings[i].expiringTime,
        timerSettings[i].mode
    ));
    timers[i].setBeforeWarningCallback(warningHelper(i, timers[i], 'beforewarningcallback'));
    timers[i].setAfterWarningCallback(warningHelper(i, timers[i], 'afterwarningcallback'));
    timers[i].setDoneCallback(warningHelper(i, timers[i], 'donecallback'));
    $('#Timer' + i + 'Cont').click(clickHelper(timers[i]));
    timers[i].timerEventStart();
}