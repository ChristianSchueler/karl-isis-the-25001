//---
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Configuration, OpenAIApi } from "openai";
import * as util from 'util';
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
export class OpenAI {
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
        const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        console.log("Asking for cocktail...");
        const completion = await openai.createCompletion({
            model: "text-davinci-002",
            max_tokens: 2048,
            prompt: cocktailPrompt,
        });

        let result = completion.data.choices[0].text;

        console.log("Text result:");
        console.log(result);

        //let object = dirtyJson.parse(result);
        //console.log("JSON result:");
        //console.dir(object, { depth: null });
    }
}

