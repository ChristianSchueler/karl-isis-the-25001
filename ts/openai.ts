// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import OpenAI from "openai";
//import * as util from 'util';
//import * as dirtyJson from 'dirty-json';

let cocktailPrompt = `
restrict yourself to the use only ingredients from this list: ["vodka", "rum", "gin",  "whisky", "campari", "lime juice", "orange juice", "strawberry juice", "raspberry juice", "pineapple juice", "bitter lemon", "tonic water", "water", "soda", "slice of orange", "slice of lemon"].

use a minimum of 2 ingredients and a maximum of 6 ingredients.

create a cocktail recipe which tastes tastes sweet with a hint of strawberry but no lemon.

create a fantasy name for the cocktail recipe which does not equal any existing cocktail names.

format your response as JSON object. each entry in the JSON object should consist of the ingredient name (labeled as "ingredient"), the amount of the ingredient in cl (labeled as "amount") and a boolean flag which is set to true for liquid ingredients (labeled as "isLiquid") and a boolean flag which is set to true for alcohol (labeled as "alcohol"). label the array of ingredients as "ingredients". 
add an extra field in the JSON object for the sum of all "amount" fields (labeled as "drinkSize"). The sum should be in cl.
add an extra filed on the JSON object for the cocktail name (labeled "name"). 
Return a valid JSON object.
`

// this is what defines the scope or context of the AI bot
let karlIsisSystem = `
You are a cocktail mixing robot, you are able to pour cocktails with up to 12 different ingredients.
You can use the following ingredients: vodka, gin, rum, orange juice, cherry juice, bitter lemon, tonic, pineapple juice, soda.
What I ask you to "pour me a cocktail", you create a recipe with your available ingredients and you create a cocktail name.
Do not repeat cocktail recipes. Be creative.
Use ingredients such that after pouring 60 cocktails roughly 1 liter of every ingredient has been used.
The sum of all cocktail amounts must be at least 10 cl and at most 20 cl.
Format your response as JSON object. Each entry in the JSON object should consist of the ingredient name (labeled as "ingredient") and the amount of the ingredient in cl (labeled as "amount").
Label the array of ingredients as "ingredients". 
Add an extra field in the JSON object for the sum of all "amount" fields (labeled as "drinkSize"). The sum should be in cl.
Add an extra filed on the JSON object for the cocktail name (labeled "name") containing the cocktail name.
Return a valid JSON object.
`
export class OpenAICocktailRecipes {
    constructor() {
    }

    async test() {

        dotenv.config();	// move ENV variables from .env into NodeJS environment

        // gracefully stop if OpenAI API key not provided and help developer fix it
        if (process.env.OPENAI_API_KEY == undefined) {
            console.log("OpenAI API key not defined. Please set OPENAI_API_KEY environment variable. Exiting.");
            process.exit(1);
        }

        // build and set up OpenAI interface
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            organization: "org-XWXjDVcYbBQFaLvR7JTi3pyl"        // optional, but for being safe ("Personal")
        });

        
        console.log("Asking for cocktail...");
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [
                { "role": "system", "content": karlIsisSystem },
                { "role": "user", "content": "pour me a cocktail" },
                { "role": "assistant", "content": `
                {
                  "ingredients": [
                    {"ingredient": "vodka", "amount": 5},
                    {"ingredient": "rum", "amount": 3},
                    {"ingredient": "orange juice", "amount": 4},
                    {"ingredient": "cherry juice", "amount": 3}
                  ],
                  "drinkSize": 15,
                  "name": "Tropical Sunset"
                }
` },
                { "role": "user", "content": "pour me a drink"},
                { "role": "assistant", "content": `
                {
                    "ingredients": [
                      {"ingredient": "gin", "amount": 4},
                      {"ingredient": "bitter lemon", "amount": 3},
                      {"ingredient": "tonic", "amount": 3}
                    ],
                    "drinkSize": 10,
                    "name": "Gin Sparkler"
                  }
`},
                { "role": "user", "content": "pour me a drink"}
            ]
        });

        let result = completion?.choices[0].message.content;

        console.log("Text result:");
        console.log(result);

        //let object = dirtyJson.parse(result);
        //console.log("JSON result:");
        //console.dir(object, { depth: null });
    }
}