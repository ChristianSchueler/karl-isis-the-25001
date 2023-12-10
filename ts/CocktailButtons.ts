// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import { sleep } from './sleep.js';

//import { Gpio } from './Gpio.js';
import { Gpio } from 'onoff';

// either load onoff of a stub
// let moduleName = "onoff";
// if (process.platform == 'win32') moduleName = "./Gpio.js";		// for windows replace onoff with stub
// const { Gpio } = await import(moduleName);

// hardware buttons and LEDs
export class CocktailButtons {
    public enabled: boolean = false;
    public onButton1?: () => void;          // override this to enable the callback
    public onButton2?: () => void;          // override this to enable the callback

    button1: Gpio;
    button2: Gpio;

    led1: Gpio;
    led2: Gpio;
    led3: Gpio;

    timer: Array<NodeJS.Timeout | undefined> = [];

    // number are GPIO numbers
    constructor(gpioPinAlcButton: number, gpioPinNonAlcButton: number, led1: number, led2: number, led3: number) {

        console.log("Setting up buttons...");
        
        this.button1 = new Gpio(gpioPinAlcButton, 'in', 'rising', { debounceTimeout: 30 });
        this.button2 = new Gpio(gpioPinNonAlcButton, 'in', 'rising', { debounceTimeout: 30 });

        this.button1.watch((err, value) => {
            console.log("button1:", value, err);

            if (!this.enabled) { console.log("button 2 pressed, but not enabled. exiting."); return; }

            if (this.onButton1) this.onButton1();       // execute event handler
        });

        this.button2.watch((err, value) => {
            console.log("button2:", value, err);

            if (!this.enabled) { console.log("button 2 pressed, but not enabled. exiting."); return; }

            if (this.onButton2) this.onButton2();       // execute event handler
        });

        this.led1 = new Gpio(led1, 'out');
        this.led2 = new Gpio(led2, 'out');
        this.led3 = new Gpio(led3, 'out');
    }

    // all leds off
    async ledsOff() {
        console.log("All LEDs off");
        await this.led1.write(0);
        await this.led2.write(0);
        await this.led3.write(0);
    }

    // number: 1, 2, 3
    async ledOn(led: number) {
        //console.log("LED #" + led + " on");
        switch (led) {
            case 1: await this.led1.write(1); break;
            case 2: await this.led2.write(1); break;
            case 3: await this.led3.write(1); break;
        }
    }

    // number: 1, 2, 3
    async ledOff(led: number) {
        //console.log("LED #" + led + " off");
        switch (led) {
            case 1: await this.led1.write(0); break;
            case 2: await this.led2.write(0); break;
            case 3: await this.led3.write(0); break;
        }
    }

    // short on, then off
    async ledBlink(led: number, duration_ms: number = 300) {
        await this.ledOn(led);      // on
        await sleep(duration_ms);   // wait
        await this.ledOff(led);     // off
    }

    // short on, then off
    async ledBlinkContinuous(led: number, duration_ms: number = 300) {
        
        console.log("LED #" + led + " blink continous");

        this.timer[led] = setInterval(async () => {

            await this.ledOn(led);      // on
            await sleep(duration_ms);   // wait
            await this.ledOff(led);     // off

        }, duration_ms*2);
    }

    async ledBlinkStopContinuous(led: number) {

        console.log("LED #" + led + " blink continous STOP");

        if (this.timer[led]) {
            console.log("LED #" + led + " blink continous: timer cleared");

            clearInterval(this.timer[led]);
            this.timer[led] = undefined;
        }
    }
}