// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import {sleep } from './sleep';
import { Gpio } from './Gpio';
import { IngredientPump } from './IngredientPump';

interface Recipe {
	ingredients: { ingredient: string; amount: number; }[];
	drinkSize: number;			// in cl, centiliters
}

/** @class CocktailDispenser
*/
export class CocktailDispenser {
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
