// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import { ICocktailRecipe } from "./CocktailRecipe.js";

// compute a random integer number between min and max, including min and max
function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); 	// The maximum is inclusive and the minimum is inclusive
}

// create a random recipe from the drink repository
// TODO: alcohol: none, forced, random
// @param maxDrinkSize_cl
// @param maxIngredients - length of list of ingredients, e.g. 12
export function createRandomRecipe(maxDrinkSize_cl: number, maxIngredients: number, alcohol: string): ICocktailRecipe {

    console.log("Creating random recipe...");

    // drink size: min 4 cl up to 16, maybe 20 cl.

    // empty recipe
    let recipe: ICocktailRecipe = { 
        ingredients: [5, 0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0],
        name: "random cocktail"
    }
    
    /*
    // random number of ingredients from 2 to all
    const countIngredients = getRandomIntInclusive(2, maxIngredients);
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
        if (getRandomIntInclusive(1, 2) == 1) {
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
    }*/

    return recipe;
}