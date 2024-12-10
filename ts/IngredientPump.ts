// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2024 by Christian Schüler, christianschueler.at

import {sleep } from './sleep.js';

import { Gpio } from './Gpio.js';
//import { Gpio } from 'onoff';

// either load onoff of a stub
// let moduleName = "onoff";
// if (process.platform == 'win32') moduleName = "./Gpio.js";		// for windows replace onoff with stub
// const Gpio = await import(moduleName);

// aka dispenser
// @todo rename to Dispenser
export class IngredientPump {
	static flow_ml_m: number = 109;			// fluid flow in ml per minute, MEASURE!
	static amountInTubes_ml: number = 50;
	name: string = "ingredient";			// unique name
	description: string = "";				// screen description
	isAlcohol: boolean = true;
	gpioId: number = 1;						// which GPIO pin the pump will connect to
	pin: Gpio;								// interface to GPIO using onoff
	isDispensing: boolean = false;
	
	constructor(name: string, isAlcohol: boolean, gpioId: number, pumpNo: number) {
		
		this.name = name;
		//this.description = ...
		this.isAlcohol = isAlcohol;
		this.gpioId = gpioId;
		console.log(`Pump ${pumpNo} - Ingredient: ${name}, ${isAlcohol ? `alcohol` : `no alcohol`}, GPIO ID: ${gpioId}`);

		this.pin = new Gpio(gpioId, 'out');		// open GPIO with given number (not: pin number!) for output
		this.pin.writeSync(Gpio.HIGH);		// disable by default
		this.isDispensing = false;
	}
	
	// dispense given amount of liquid in ml
	async dispense(dose_cl: number) {
		let duration_ms = dose_cl*10 / (IngredientPump.flow_ml_m / 60) * 1000;

		console.log(`Dispensing ${dose_cl} cl of ${this.name } over ${(duration_ms/1000.).toPrecision(3)} s...`);
		
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
	
	// start the pump
	async start() {
		
		console.log(`Starting pump ${this.name}...`);
		
		// signal to start the pump
		await this.pin.write(Gpio.LOW);

		this.isDispensing = true;

		console.log(`Pump ${this.name } started.`);
    }

	// immediately stop any dispensing
	async stop() {
		
		console.log(`Stopping pump ${this.name}...`);
		
		// stop dispensing
		await this.pin.write(Gpio.HIGH);
		
		this.isDispensing = false;

		console.log(`Pump ${this.name } stopped.`);
	}	
}