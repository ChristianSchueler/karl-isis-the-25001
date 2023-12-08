// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import { IngredientPump } from './IngredientPump.js';
import { CocktailRecipe, ICocktailRecipe } from './CocktailRecipe.js';

/** @class CocktailDispenser
*/
export class CocktailDispenser {
	maxDrinkSize_cl: number = 20;			    // maximum drink size in cl, i.e. a cup
	pumps: IngredientPump[];					// hlding the interface to the liquid dispenser pumps
	drinkRepository: { name: string; isAlcohol: boolean; pumpNumber: number }[] = [
		{ name: 'vodka', 				isAlcohol: true, pumpNumber: 1 },
		{ name: 'gin', 					isAlcohol: true, pumpNumber: 2 },
		{ name: 'rum', 					isAlcohol: true, pumpNumber: 3 },
		{ name: 'blue curacao', 		isAlcohol: true, pumpNumber: 4 },
		{ name: 'ananas juice', 		isAlcohol: false, pumpNumber: 5 },
		{ name: 'cherry juice', 		isAlcohol: false, pumpNumber: 6 },
		{ name: 'orange juice', 		isAlcohol: false, pumpNumber: 7 },
		{ name: 'bitter lemon', 		isAlcohol: false, pumpNumber: 8 },
		{ name: 'tonic water', 			isAlcohol: false, pumpNumber: 9 },				
		{ name: 'herbal lemonade', 		isAlcohol: false, pumpNumber: 10 },
		{ name: 'bitter orange sirup', 	isAlcohol: false, pumpNumber: 11 },
		{ name: 'soda', 				isAlcohol: false, pumpNumber: 12 }];
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
		{ pumpNo: 9, relaisNumber: 13, gpioNumber: 26, pinNumber: 37 },
		{ pumpNo: 10, relaisNumber: 14, gpioNumber: 16, pinNumber: 36 },
        { pumpNo: 11, relaisNumber: 12, gpioNumber: 13, pinNumber: 33 },
        { pumpNo: 12, relaisNumber: 11, gpioNumber: 19, pinNumber: 33 }];
	// wiring between raspi and motor controller
	motorGpioMap: { motorNo: number, gpioNumber1: number, pinNumber1: number, gpioNumber2: number, pinNumber2: number }[] = [
		{ motorNo: 1, gpioNumber1: 10, pinNumber1: 19, gpioNumber2: 9, pinNumber2: 21 }];
	
	constructor() {

		this.pumps = [];
		
		for (let index in this.drinkRepository) {
			// pump responsible for this ingredient
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
	
	async dispenseRecipe(recipe: CocktailRecipe) {

		console.log(`Starting dispensing recipe '${recipe.name}'...`);
		console.log("Ingredients:", recipe.ingredients.join(" "));
		console.log("Drink size:", recipe.size());

		let pumps: IngredientPump[] = [];
        let amounts: number[] = [];

        // collect all necessary pumps
        for (let index=0; index<12; index++) {
            let amount = recipe.ingredients[index];
            if (amount > 0) { 
				let pump = this.pumps[index];
                pumps.push(pump);
                amounts.push(amount);

				//await pump.dispense(amount);
            }
        }

		// complicated! help: https://stackoverflow.com/questions/40140149/use-async-await-with-array-map
		await Promise.all(pumps.map(async (pump, index) => { 
			await pump.dispense(amounts[index]);
		}));

		console.log(`Recipe '${recipe.name}' dispensed.`);
	}

	// return a list of all ingredients available
	getIngredientList(): string[] {

		const result: string[] = [];

		for (let drink of this.drinkRepository) {
			result.push(drink.name);
		}

		return result;
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
		for (let index in this.pumps) {
			await this.pumps[index].dispense(10);
		}
	}

	async cleanSerial(amount: number = 10) {
		for (let index in this.pumps) {
			await this.pumps[index].dispense(amount);
		}
	}

	async cleanParallel(amount: number = 10) {
		// complicated! help: https://stackoverflow.com/questions/40140149/use-async-await-with-array-map
		await Promise.all(this.pumps.map(async (pump, index) => {  
			await pump.dispense(amount);
		}));
	}
	
	// dispense from pump <id> this given amount
	async dispensePump(id: number, amount: number) {
		await this.pumps[id].dispense(amount);
	}

	// return internal pump objects
	getPump(id: number): IngredientPump {
		return this.pumps[id];
	}

	// return internal pump objects
	togglePump(id: number) {
		if (id < 0 || id >= this.pumps.length) return;

		const p = this.pumps[id];
		if (p.isDispensing) p.stop();
		else p.start();
	}

	async run() {
		//console.log("Karl-Isis the 25001 run...");

		//await this.pumps[0].stop();
		//await sleep(3000);
 
		//await this.test();

		//await this.pumps[0].dispense(1000)
		
		// process.exit(1);

		//let r: CocktailRecipe = createRandomRecipe("random");
		//console.log(r);
	}
}
