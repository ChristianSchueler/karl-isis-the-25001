// Interdimensional Cocktail Portal (c) 2022 Christian Schüler

console.log("Interdimensional Cocktail Portal booting...");

/** @class Pump
*/
class Pump {
	gpioId: number;				// which GPIO pin the pump will connect to
	static flow_dl_m: number = 1;
	
	constructor(gpio: number) {
		this.gpioId = gpio;
	}
}

class IngredientPump {
	name: string;				// unique name
	description: string;		// screen description
	isAlcohol: boolean;
	gpioId: number;				// which GPIO pin the pump will connect to
	static flow_dl_m: number = 1;
	
	constructor(name: string, isAlcohol: boolean, gpioId: number) {
		console.log(`Ingredient: ${name}, ${isAlcohol ? `alcohol` : `no alcohol`}, GPIO ID: ${gpioId}`);
	}
}

/** @class InterdimensionalCocktailPortal
*/
class InterdimensionalCocktailPortal {
	pumps: Pump[];
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
	
	run() {
		console.log("Interdimensional Cocktail Portal run...");
	}
}

let bot = new InterdimensionalCocktailPortal();
bot.run();