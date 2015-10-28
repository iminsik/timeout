/*global $timer, console*/

var timer1 = window.$timer(
    'Timer1',
    5,  // In 5 seconds, a warning message will appear.
    40, // In 30 seconds, session will expire.
    function () {
        'use strict';
        console.log(this.name + ' ' + this.timeLeft() + ': called Before warning callback');
    },
    function () {
        'use strict';
        console.log(this.name + ' ' + this.timeLeft() + ': called After warning callback');
    },
    function () {
        'use strict';
        console.log(this.name + ' ' + "time passed.");
    }
);

var timer2 = window.$timer(
    'Timer2',
    10,  // In 5 seconds, a warning message will appear.
    20, // In 30 seconds, session will expire.
    function () {
        'use strict';
        console.log(this.name + ' ' + this.timeLeft() + ': called Before warning callback');
    },
    function () {
        'use strict';
        console.log(this.name + ' ' + this.timeLeft() + ': called After warning callback');
    },
    function () {
        'use strict';
        console.log(this.name + ' ' + "time passed.");
    }
);

timer1.startTimer();
timer2.startTimer();