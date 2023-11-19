// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

// references
// - https://github.com/fivdi/onoff
//
//
//

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Server } from "./server";
import { OpenAICocktailRecipes } from "./openai";
import { stringify } from "querystring";
import * as OpenAICocktailBot from './OpenAICocktailBot';
//import { Gpio } from 'onoff';
import fs from 'fs';
import util from 'util';

const inProduction = false;

const log_stdout = process.stdout;

// overload console.log
console.log = function(...d) {
  
	let output = util.format(...d) + '\n';
	
	let today: Date = new Date();
	let dateString = today.getFullYear().toString() + '-' + (today.getMonth()+1).toString().padStart(2, '0') + '-' + (today.getDay()+1).toString().padStart(2, '0');

	// TODO: uh-oh crashes when logs folder does not exist
  	fs.appendFileSync(process.cwd() + '/logs/console-' + dateString + '.log', output);
	log_stdout.write(output);
};

console.log("Karl-Isis the 25001 - Dispenser booting...");

class Gpio {
	constructor(x: number, y: string) {
		console.log('Running on Windows - only for development!');
	}
	static HIGH: number = 1;
	static LOW: number = 0;
	writeSync(x: number) {};
	readSync() {};
	async write(x: number) {
		await sleep(1);
		return new Promise(resolve => 1);
	}
	async read(x: number) {
		await sleep(1);
		return new Promise(resolve => 0);
	}
}

//if (process.env.NODE_ENV === 'production') {
// 	//const pluginName = await import('../js/plugin_name.js');
//}

// async sleep
// usage: await sleep(duration_ms);
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
	static flow_ml_m: number = 109;			// fluid flow in ml per minute, MEASURE!
	static amountInTubes_ml: number = 50;
	name: string = "ingredient";			// unique name
	description: string = "";				// screen description
	isAlcohol: boolean = true;
	gpioId: number = 1;						// which GPIO pin the pump will connect to
	pin: Gpio;								// interface to GPIO using onoff
	isDispensing: boolean = false;
	
	constructor(name: string, isAlcohol: boolean, gpioId: number) {
		
		this.name = name;
		//this.description = ...
		this.isAlcohol = isAlcohol;
		this.gpioId = gpioId;
		console.log(`Ingredient: ${name}, ${isAlcohol ? `alcohol` : `no alcohol`}, GPIO ID: ${gpioId}`);

		this.pin = new Gpio(gpioId, 'out');		// open GPIO with given number (not: pin number!) for output
		this.pin.writeSync(Gpio.HIGH);		// disable by default
		this.isDispensing = false;
	}
	
	// dispense given amount of liquid in ml
	async dispense(dose_ml: number) {
		let duration_ms = dose_ml / (IngredientPump.flow_ml_m / 60) * 1000;

		console.log(`Dispensing ${dose_ml} ml of ${this.name } over ${duration_ms} ms...`);
		
		if (this.isDispensing) {
			console.log(`Oh no! Already dispensing ${this.name }. Cancelling new request!`);
			return;
		}
		
		this.isDispensing = true;
		
		await this.pin.write(Gpio.LOW);
		await sleep(duration_ms);
		await this.pin.write(Gpio.HIGH);
		
		console.log(`Dispensing ${this.name } finished.`);
		this.isDispensing = false;

        return;
    }
	
	// dispenses enough liquid to fill the tubes initially
	async fillOnStart() { 
		await this.dispense(IngredientPump.amountInTubes_ml);
	}
	
	// dispenses enough liquid to empty the tubes at the end of the day
	async emptyOnFinish() {
		await this.dispense(IngredientPump.amountInTubes_ml);
	}
	
	// immediately stop any dispensing
	async stop() {
		
		console.log(`Stopping pump ${this.name}...`);
		
		// stop dispensing
		await this.pin.write(Gpio.HIGH);
		
		console.log(`Pump ${this.name } stopped.`);
		this.isDispensing = false;

        return;
	}
	
	//async dispense(dose_ml: number): Promise<string> {
    //    return await Promise.resolve("OK"); 
    //}
}

interface Recipe {
	ingredients: { ingredient: string; amount: number; }[];
	drinkSize: number;			// in cl, centiliters
}

/** @class InterdimensionalCocktailPortal
*/
class InterdimensionalCocktailPortal {
	maxDrinkSize_cl: number = 16;			// guess what?
	pumps: IngredientPump[];					// hlding the interface to the liquid dispenser pumps
	drinkRepository: { name: string; isAlcohol: boolean; pumpNumber: number }[] = [
		{ name: 'vodka', isAlcohol: true, pumpNumber: 1 },
		//{ name: 'lemon-juice', isAlcohol: false, pumpNumber: 2 },		// pump defect
		{ name: 'strawberry-juice', isAlcohol: false, pumpNumber: 3 },
		{ name: 'lemon', isAlcohol: false, pumpNumber: 4 },
		{ name: 'gin', isAlcohol: false, pumpNumber: 5 },
		{ name: 'coke', isAlcohol: false, pumpNumber: 6 },
		{ name: 'orange-juice', isAlcohol: false, pumpNumber: 7 },
		{ name: 'whisky', isAlcohol: false, pumpNumber: 8 }
		//{ name: 'soda', isAlcohol: false, pumpNumber: 9 },			// out of tube				
		//{ name: 'soda', isAlcohol: false, pumpNumber: 10 },			// out of tube
		//{ name: 'soda', isAlcohol: false, pumpNumber: 11 },			// missing pump
		//{ name: 'soda', isAlcohol: false, pumpNumber: 12 }			// missing pump
		];
	// this is the wiring between raspi and relais and pumps
	pumpGpioMap: { pumpNo: number, relaisNumber: number, gpioNumber: number, pinNumber: number }[] = [
		{ pumpNo: 1, relaisNumber: 1, gpioNumber: 2, pinNumber: 3 },
		{ pumpNo: 2, relaisNumber: 2, gpioNumber: 3, pinNumber: 5 },
		{ pumpNo: 3, relaisNumber: 3, gpioNumber: 4, pinNumber: 7 },
		{ pumpNo: 4, relaisNumber: 4, gpioNumber: 17, pinNumber: 11 },
		{ pumpNo: 5, relaisNumber: 5, gpioNumber: 18, pinNumber: 5 },
		{ pumpNo: 6, relaisNumber: 6, gpioNumber: 27, pinNumber: 13 },
		{ pumpNo: 7, relaisNumber: 16, gpioNumber: 21, pinNumber: 40 },
		{ pumpNo: 8, relaisNumber: 15, gpioNumber: 20, pinNumber: 38 },
		{ pumpNo: 9, relaisNumber: 13, gpioNumber: 16, pinNumber: 36 },
		{ pumpNo: 10, relaisNumber: 14, gpioNumber: 26, pinNumber: 37 }];
	// wiring between raspi and motor controller
	motorGpioMap: { motorNo: number, gpioNumber1: number, pinNumber1: number, gpioNumber2: number, pinNumber2: number }[] = [
		{ motorNo: 1, gpioNumber1: 10, pinNumber1: 19, gpioNumber2: 9, pinNumber2: 21 }];
	
	constructor() {

		this.pumps = [];
		
		for (let index in this.drinkRepository) {
			// pump responsible for this drink
			let pumpNumber = this.drinkRepository[index].pumpNumber;
			
			// find punp GPIO definition
			let pumpGpio = this.pumpGpioMap.find(x => x.pumpNo === pumpNumber);
			if (pumpGpio !== undefined) {
				let p = new IngredientPump(this.drinkRepository[index].name, this.drinkRepository[index].isAlcohol, pumpGpio.gpioNumber);
				this.pumps.push(p);
			}
			else { console.warn(`Setup drink: #${index}: pump number #${pumpNumber} undefined! Skipping.`); }
		}
	}
	
	async dispenseRecipe(recipe: Recipe) {

		let pumps = [];
		let amounts = [];

		for (let ingredient of recipe.ingredients) {

			// find pump with given ingredient
			let p = this.pumps.find((p) => { p.name === ingredient.ingredient});
			pumps.push(p?.dispense);	// collect dispense function
			amounts.push(ingredient.amount);
		}

		// TODO
		//Promise.all(pumps.map(() => {}));
	}

	// testing proper function
	// dispenses 10 x 20 ml = 0,2 l
	// moves out, moves in
	async test() {
		
		for (let index in this.pumps) {
			await this.pumps[index].dispense(20);
		}

		//await this.arm.extend();
		//await this.arm.retract();
		
		return;
	}
	
	async fillOnStart() {
	}
	
	// compute a random integer number between min and max, including min and max
	getRandomIntInclusive(min: number, max: number) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1) + min); 	// The maximum is inclusive and the minimum is inclusive
	}

	// create a random recipe from the drink repository
	// TODO: alcohol: none, forced, random
	createRandomRecipe(alcohol: string): Recipe {

		console.log("Creating random recipe...");

		// drink size: min 4 cl up to 16, maybe 20 cl.

		// empty recipe
		let recipe: Recipe = { 
			ingredients: [],
			drinkSize: 0
		}

		// random number of ingredients from 2 to all
		const countIngredients = this.getRandomIntInclusive(2, this.drinkRepository.length);
		console.log("Number of ingredients:", countIngredients);

		// select unique ingredients, no duplicates
		for (let i:number=0; i<countIngredients; i++) {
			
			// create a random ingredient and check whether its sttill unused
			// WARNING: do not use thte same name twice. this might produce a deadlock
			let alreadyUsed = false;
			let ingredientIndex = -1;
			let ingredientName = "NOPE";
			do {
				ingredientIndex = this.getRandomIntInclusive(0, this.drinkRepository.length-1);
				ingredientName = this.drinkRepository[ingredientIndex].name;
				
				alreadyUsed = false;
				for (let ingredient of recipe.ingredients) {
					if (ingredient.ingredient === ingredientName) alreadyUsed = true;
				}
				console.log(ingredientName);
			} while (alreadyUsed);

			// compute amount
			let amount = -1;
			if (this.getRandomIntInclusive(1, 2) == 1) {
				amount = 2;
			}
			else {
				amount = 4;
			}

			// count drink size
			recipe.drinkSize += amount;

			// here we add the still unused ingredient
			recipe.ingredients.push({ 
				ingredient: ingredientName,
				amount: amount
			});
		}

		// cap larger cocktails to stay below limit
		if (recipe.drinkSize > this.maxDrinkSize_cl) {
			let factor = this.maxDrinkSize_cl/recipe.drinkSize;
			for (let i in recipe.ingredients) {
				recipe.ingredients[i].amount *= factor;
			}

			recipe.drinkSize *= factor;
		}

		return recipe;
	}

	async run() {
		console.log("Karl-Isis the 25001 run...");

		//await this.pumps[0].stop();
		//await sleep(3000);
 
		//await this.test();

		//await this.pumps[0].dispense(1000)
		
		// process.exit(1);

		let r: Recipe = this.createRandomRecipe("random");
		console.log(r);
	}
}

// main entry point
async function main() {
 
	// Quit when all windows are closed.
	/*app.on('window-all-closed', () => {
		// On macOS it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})

	await app.whenReady();		// wait until electron window is open

	var mainWindow = new BrowserWindow({
        title: "Interdimensional Cocktail Portal",
		show: false,
		fullscreen: true,
        kiosk: true,
		autoHideMenuBar: true
    });
    
    mainWindow.webContents.on("crashed", (e) => {
		app.relaunch();
		app.quit();
	});
*/

	// button test
	/*const button = new Gpio(4, 'in', 'rising', { debounceTimeout: 30 });
	const led = new Gpio(17, 'out');
	led.writeSync(0)
	button.watch((err, value) => {
		console.log("button:", value, err);
		led.writeSync(value);
	});*/

	//let ai = new OpenAICocktailRecipes();
	//await ai.test();

	//let bot = new InterdimensionalCocktailPortal();
	//bot.run();

	dotenv.config();	// move ENV variables from .env into NodeJS environment

	// gracefully stop if OpenAI API key not provided and help developer fix it
	if (process.env.OPENAI_API_KEY == undefined) {
		console.log("OpenAI API key not defined. Please set OPENAI_API_KEY environment variable. Exiting.");
		process.exit(1);
	}

	let bot = new OpenAICocktailBot.OpenAICocktailBot("alcohol", ["a"], OpenAICocktailBot.karlIsisSystem, { apiKey: process.env.OPENAI_API_KEY, organization: process.env.OPENAI_ORGANIZATION, model: "gpt-3.5-turbo-1106" });
	let recipe = await bot.pourMeADrink();
	console.log(recipe);
	// await bot.pourMeADrink();
	// await bot.pourMeADrink();
	// await bot.pourMeADrink();
	// await bot.pourMeADrink();
	
	//let s = new Server();
	//await s.start();
	
    //mainWindow.maximize();
    //mainWindow.loadFile('./../views/index.html');
	//console.log("opeing URL: http://localhost:3000");
	//mainWindow.loadURL("http://localhost:3000");
    //mainWindow.show();
}

// execute main function in async way and recover from error. main entry point.
(async () => {
	let running = true;

    while (running) {
		try {
			await main();
			console.log("Exiting Karl-Isis the 25001. Have a nice day, bye-bye.");
			running = false;
		} catch (e) {
			console.error("error in main:", e);
			if (!inProduction) running = false;	// if not in production mode, terminate immediately after first error. otherwise, continue into endless loop
			// -> restart using a loop
		}
	}
})();
