/*global $timer, console, $*/

var timer1 = window.timerMultitab('Timer1', 5, 20, "debug"),
    timer2 = window.timerMultitab('Timer2', 10, 15, "debug");

$('#Timer1Cont').click(function (e) {
    'use strict';
    timer1.clickContinue();
});

$('#Timer2Cont').click(function (e) {
    'use strict';
    timer2.clickContinue();
});

timer1.timerEventStart();
timer2.timerEventStart();