/*global $timer, console, $*/

var timer1 = window.$timerMultitab('Timer1', 5, 40, "debug"),
    timer2 = window.$timerMultitab('Timer2', 10, 20, "debug");

$('#Timer1Cont').click(function (e) {
    'use strict';
    timer1.incContinueClickCnt();
});

$('#Timer2Cont').click(function (e) {
    'use strict';
    timer2.incContinueClickCnt();
});



timer1.timerEventStart();
timer2.timerEventStart();