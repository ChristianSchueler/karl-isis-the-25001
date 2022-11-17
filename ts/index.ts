// Interdimensional Cocktail Portal (c) 2022 Christian Schüler

console.log("Interdimensional Cocktail Portal booting...");

var isWin = process.platform === "win32";

class Gpio {
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
	
	constructor(name: string, isAlcohol: boolean, gpioId: number) {
		console.log(`Ingredient: ${name}, ${isAlcohol ? `alcohol` : `no alcohol`}, GPIO ID: ${gpioId}`);

		this.led = new Gpio(2, 'out');
	}
	
	async dispense(dose_ml: number) {

		let duration_ms = dose_ml * IngredientPump.flow_ml_m / 60 * 1000;

		console.log(duration_ms);
		
		await this.led.write(Gpio.HIGH);
		await sleep(duration_ms);
		await this.led.write(Gpio.LOW);

        //return "";
    }
	
	//async dispense(dose_ml: number): Promise<string> {
    //    return await Promise.resolve("OK"); 
    //}
}

class Arm {
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