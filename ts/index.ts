// Interdimensional Cocktail Portal (c) 2022 Christian Schüler

console.log("Interdimensional Cocktail Portal booting...");

var isWin = process.platform === "win32";

/* class Gpio {
	constructor(x: number, y: string) {}
	static HIGH: number = 1;
	static LOW: number = 0;
	async write(x: number) {
		await sleep(1);
		return new Promise(resolve => 1);
	}
	async read(x: number) {
		await sleep(1);
		return new Promise(resolve => 0);
	}
}
 */
import { Gpio } from 'onoff';

if (isWin) {
	console.log('Running on Windows!');

	//let Gpio = class { HIGH: boolean = true; }; 
	//var Gpio = class {
} else {
	
	console.log('Running on Raspberry Pi!');

	let file = 'onoff';
	//Gpio = await import(file);
}

 if (process.env.NODE_ENV === 'production') {
 	//const pluginName = await import('../js/plugin_name.js');
   }


function sleep(duration_ms: number) {
	return new Promise(resolve => setTimeout(resolve, duration_ms));
}

/** @class Pump
*/
/* class Pump {
	gpioId: number;				// which GPIO pin the pump will connect to
	static flow_dl_m: number = 1;
	
	constructor(gpio: number) {
		this.gpioId = gpio;
	}
} */

// aka dispenser
// @todo rename to Dispenser
class IngredientPump {
	name: string = "ingredient";				// unique name
	description: string = "";		// screen description
	isAlcohol: boolean = true;
	gpioId: number = 2;				// which GPIO pin the pump will connect to
	static flow_ml_m: number = 60;
	led: Gpio;
	isDispensing: boolean = false;
	
	constructor(name: string, isAlcohol: boolean, gpioId: number) {
		
		this.name = name;
		//this.description = ...
		this.isAlcohol = isAlcohol;
		this.gpioId = gpioId;
		console.log(`Ingredient: ${name}, ${isAlcohol ? `alcohol` : `no alcohol`}, GPIO ID: ${gpioId}`);

		this.led = new Gpio(2, 'out');
		this.isDispensing = false;
	}
	
	async dispense(dose_ml: number) {
		let duration_ms = dose_ml * IngredientPump.flow_ml_m / 60 * 1000;

		console.log(`Dispensing ${dose_ml} ml of ${this.name } over ${duration_ms} ms...`);
		
		if (this.isDispensing) {
			console.log(`Oh no! Already dispensing ${this.name }. Cancelling new request!`);
			return;
		}
		
		this.isDispensing = true;
		
		await this.led.write(Gpio.HIGH);
		await sleep(duration_ms);
		await this.led.write(Gpio.LOW);
		
		console.log(`Dispensing ${this.name } finished.`);
		this.isDispensing = false;

        return;
    }
	
	//async dispense(dose_ml: number): Promise<string> {
    //    return await Promise.resolve("OK"); 
    //}
}

class Arm {

/* 	const m1 = new onoff.Gpio(14, 'out');
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
 */
}

/** @class InterdimensionalCocktailPortal
*/
class InterdimensionalCocktailPortal {
	pumps: IngredientPump[];
	drinkRepository: { name: string; isAlcohol: boolean; gpioId: number }[] = [
		{ name: 'vodka', isAlcohol: true, gpioId: 2 },
		{ name: 'lemon-juice', isAlcohol: false, gpioId: 3 },
		{ name: 'strawberry-juice', isAlcohol: false, gpioId: 4 }];
	
	constructor() {

		this.pumps = [];
		
		for (let index in this.drinkRepository) {
			let p = new IngredientPump(this.drinkRepository[index].name, this.drinkRepository[index].isAlcohol, this.drinkRepository[index].gpioId);
			this.pumps.push(p);
		}
	}
	
	async run() {
		console.log("Interdimensional Cocktail Portal run...");

		await this.pumps[0].dispense(10);
	}
}

let bot = new InterdimensionalCocktailPortal();
bot.run();

import { app, BrowserWindow } from "electron";

app.on('ready', function() {
    var mainWindow = new BrowserWindow({
        show: false,
        kiosk: true
    });
    
    mainWindow.webContents.on("crashed", (e) => {
		app.relaunch();
		app.quit();
	});
		
    //mainWindow.maximize();
    mainWindow.loadFile('./../index.html');
    mainWindow.show();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
	  app.quit()
	}
  })
