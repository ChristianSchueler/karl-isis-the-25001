// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

export interface ICocktailRecipe {
    ingredients: number[];      // a list of amounts of all ingridients, ordered
    name: string;
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

    // generates a random cocktail recipe
    createRandom(): ICocktailRecipe {
        
        console.log(`OpenAICocktailBot '${this.name}' creating random cocktail.`);

        // TODO!

        return {ingredients: [0], name: ""};
    }

    static randomRecipe(): CocktailRecipe {
        let recipe = new CocktailRecipe([], "");
        recipe.createRandom();
        return recipe;
    }
}