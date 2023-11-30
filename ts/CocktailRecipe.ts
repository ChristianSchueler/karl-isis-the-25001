// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import { CocktailDispenser } from "./CocktailDispenser";

export interface ICocktailRecipe {
    ingredients: number[];      // a list of amounts of all ingridients, ordered
    name: string;
}

// compute a random integer number between min and max, including min and max
function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); 	// The maximum is inclusive and the minimum is inclusive
}

export class CocktailRecipe implements ICocktailRecipe {
    ingredients: number[] = [];      // a list of amounts of all ingridients, ordered
    name: string = "";

    constructor(ingredients: number[], name: string) {
        this.ingredients = [...ingredients];    // create a copy of the array
        this.name = name;
    }

    size(): number {
        let drinkSize = 0;
        for (const amount of this.ingredients) drinkSize += amount;
        return drinkSize;
    }

    // change the recipe, such that it contains at least min amount and at max max amount cl
    normalize(minAmount: number, maxAmount: number) {
        console.log("Normalizing drink...");

        const drinkSize = this.size();

        // enlarge
        if (drinkSize < minAmount) {
            let scaleFactor = minAmount/drinkSize;
            for (const index in this.ingredients) this.ingredients[index] *= scaleFactor;
            console.log("Drink enlarged to", scaleFactor);
        }

        // shrink
        if (drinkSize > maxAmount) {
            let scaleFactor = maxAmount/drinkSize;
            for (const index in this.ingredients) this.ingredients[index] *= scaleFactor;
            console.log("Drink shrunken to", scaleFactor);
        }

        console.log("Drink normalized");
    }

    // return a random recipe
    static randomRecipe(alcohol: boolean = true, minAlc?: number, maxAlc?: number): CocktailRecipe {
        console.log(`OpenAICocktailBot creating random cocktail...`);

        minAlc ??= 2;
        maxAlc ??= 4;

        let amounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        if (alcohol) {
            let alcoholIndex = getRandomIntInclusive(0, 3);             // single alcohol selection
            let alcoholAmount = getRandomIntInclusive(minAlc, maxAlc);  // limit alcoholo
            amounts[alcoholIndex] = alcoholAmount;
        }
        else {  // alcohol-free cocktail replace alcohol with water
            let waterAmount = getRandomIntInclusive(minAlc, maxAlc);    // limit water
            amounts[11] = waterAmount;      // currently, water is always P12 (index 11)
        }

        let juiceCount = getRandomIntInclusive(1, 5);               // 1 to 5 more ingredients
        for (let i=1; i<=juiceCount; i++) {

            // search for unused ingredient
            let juiceIndex = 0;
            do {
                juiceIndex = getRandomIntInclusive(4, 11);
            } while (amounts[juiceIndex] > 0); 

            let juiceAmount = 0;
            if (juiceIndex == 10) juiceAmount = 0.5;                  // limit orange sirup
            else juiceAmount = getRandomIntInclusive(1, 2) * 2;        // 2 or 4 cl

            amounts[juiceIndex] += juiceAmount;         // increase, since we may add more water
        }

        let recipe = new CocktailRecipe(amounts, "random cocktail");
        recipe.normalize(10, 20);
        return recipe;
    }

    // make cocktail recipe a very short recipe string
    toString(dispenser: CocktailDispenser): string {
        let r = this.name + ": ";
        let first=true;
        for (let i=0; i<this.ingredients.length; i++) {
            if (this.ingredients[i] > 0) {
                if (first) first=false; 
                else r += ", "; 
                r += this.ingredients[i].toPrecision(2) + " cl " + dispenser.pumps[i].name;
            }
        }

        return r;
    }
}