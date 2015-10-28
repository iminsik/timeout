/*global $timer, console*/

var timer1 = window.$timer('Timer1', 5, 40, "debug"),
    timer2 = window.$timer('Timer2', 10, 20, "debug");

timer1.startTimer();
timer2.startTimer();