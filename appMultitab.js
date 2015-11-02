/*global $timer, console, $*/
var i,
    len,
    timers = [],
    timerSettings = [
        { name: 'Timer0', warningTime:  5, expiringTime: 30, mode: "debug" },
        { name: 'Timer1', warningTime: 10, expiringTime: 40, mode: "debug" },
        { name: 'Timer2', warningTime:  3, expiringTime: 50, mode: "debug" },
        { name: 'Timer3', warningTime: 15, expiringTime: 60, mode: "debug" },
        { name: 'Timer4', warningTime: 12, expiringTime: 70, mode: "debug" }
    ];

var clickHelper = function (timer) {
    'use strict';
    return function () {
        timer.clickContinue();
    };
};

var warningHelper = function (i, timer, before) {
    'use strict';
    return function () {
        if (before) {
            $('#Timeleft' + i).text(timer.timer.timeLeft()).css('color', 'black');
        } else {
            $('#Timeleft' + i).text(timer.timer.timeLeft()).css('color', 'red');
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
    timers[i].setBeforeWarningCallback(warningHelper(i, timers[i], true));
    timers[i].setAfterWarningCallback(warningHelper(i, timers[i], false));
    $('#Timer' + i + 'Cont').click(clickHelper(timers[i]));
    timers[i].timerEventStart();
}