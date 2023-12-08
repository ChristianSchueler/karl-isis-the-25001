// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import { Gpio } from './Gpio.js';
//import { Gpio } from 'onoff';

// either load onoff of a stub
// let moduleName = "onoff";
// if (process.platform == 'win32') moduleName = "./Gpio.js";		// for windows replace onoff with stub
// const { Gpio } = await import(moduleName);

// 
export class CocktailButtons {
    public enabled: boolean = false;
    public onButton1?: () => void;
    public onButton2?: () => void;

    button1: Gpio;
    button2: Gpio;

    constructor(gpioPinAlcButton: number, gpioPinNonAlcButton: number) {

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
    }
}