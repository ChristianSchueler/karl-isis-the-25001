// Interdimensional Cocktail Portal (c) 2022 Christian Schüler

console.log("Interdimensional Cocktail Portal booting...");

import onoff from 'onoff';
const led = new onoff.Gpio(2, 'out');

let ledState = led.readSync();
console.log("led:", ledState);

// toggle led state bz using XOR operation of current state, i.e. toggle
led.writeSync(ledState ^ 1);

console.log("Waiting...");

setTimeout(() => {
    ledState = led.readSync();
    console.log("led:", ledState);

    led.writeSync(ledState ^ 1);
}, 3000);

setTimeout(() => {
    ledState = led.readSync();
    console.log("led:", ledState);

    led.writeSync(ledState ^ 1);
}, 6000);

//---

const m1 = new onoff.Gpio(14, 'out');
const m2 = new onoff.Gpio(15, 'out');

m1.writeSync(0); m2.writeSync(0);

setTimeout(() => {
    m1.writeSync(1); m2.writeSync(0);
}, 1000);

setTimeout(() => {
    m1.writeSync(0); m2.writeSync(1);
}, 3000);

setTimeout(() => {
    m1.writeSync(0); m2.writeSync(0);
}, 10000);