// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import * as util from 'util';
//import * as dirtyJson from 'dirty-json';
import { CocktailRecipe } from "./CocktailRecipe";

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
const karlIsisSystem = `
You are a cocktail mixing robot, you are able to pour cocktails with up to 9 different ingredients.
You can use the following ingredients: vodka, gin, rum, orange juice, cherry juice, bitter lemon, tonic, pineapple juice, soda.
What I ask you to "pour me a cocktail", you create a recipe with your available ingredients and you create a cocktail name.
A cocktail recipe consists of a list of amounts of ingredients measured in cl.
A cocktail recipe contains at least 2 ingredients.
A cocktail recipe contains at least 50% non-alcoholic ingredients.
The overall sum of all cocktail ingredient amounts for a single recipe must be at least 10 cl and is not allowed to exceed 20 cl.
Do not repeat cocktail recipes. Be creative.
Use ingredients such that after pouring 60 cocktails roughly 1 liter of every ingredient has been used.
Format your response as a list of whole numbers separated by a single space character.
Append to your response a comma and a creative name.
Each number should represent the amount of the ingredient in cl.
Include unused ingrediets as 0 in the list.
The order of the resulting numbers must be the same order as the given list of ingredients.
Return a single recipe.
`

export { karlIsisSystem };

// let karlIsisSystem = `
// You are a cocktail mixing robot, you are able to pour cocktails with up to 12 different ingredients.
// You can use the following ingredients: vodka, gin, rum, orange juice, cherry juice, bitter lemon, tonic, pineapple juice, soda.
// What I ask you to "pour me a cocktail", you create a recipe with your available ingredients and you create a cocktail name.
// Do not repeat cocktail recipes. Be creative.
// Use ingredients such that after pouring 60 cocktails roughly 1 liter of every ingredient has been used.
// The sum of all cocktail amounts must be at least 10 cl and at most 20 cl.
// Format your response as JSON object. Each entry in the JSON object should consist of the ingredient name (labeled as "ingredient") and the amount of the ingredient in cl (labeled as "amount").
// Label the array of ingredients as "ingredients". 
// Add an extra field in the JSON object for the sum of all "amount" fields (labeled as "drinkSize"). The sum should be in cl.
// Add an extra filed on the JSON object for the cocktail name (labeled "name") containing the cocktail name.
// Return a valid JSON object.
// `

export interface OpenAIConfig {
    apiKey: string;             // from https://platform.openai.com/api-keys
    organization?: string;       // from https://platform.openai.com/account/organization
    model?: string;             // e.g. gpt-3.5-turbo-1106
};

/** @class OpenAICocktailBot
 * 
 * @param ... 
 * 
 * 
 */
export class OpenAICocktailBot {
    name: string = "";			                    // unique name, used for writing files to disk
    ingredients: string[];                          // oredred list of ingredients
    system: string = "You are a cocktail bot.";     // describes the cocktail bot, 'system' field of chatgpt
    openAI: OpenAI;                                 // manages open ai requests
    model: string;                                  // openai model to be used, eg. gpt-4
    messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];                        // holds the conversion messages and roles, see chatgpt
	
    constructor(name: string, ingredients: string[], systemDescription: string, openAIConfig: OpenAIConfig) {

        console.log(`OpenAICocktailBot '${name}' constructing...`);

        this.name = name;
        this.ingredients = ingredients;
        this.system = systemDescription;

        this.model = openAIConfig.model ?? "gpt-3.5-turbo-1106";    // defaults to latest gpt-3 turbo

        // initialize the system description
        this.reset();

        // build and set up OpenAI interface
        this.openAI = new OpenAI({
            apiKey: openAIConfig.apiKey,
            organization: openAIConfig.organization
        });

        console.log(`OpenAICocktailBot '${name}' constructed.`);
    }

    // resets the chat messages to initial state, thus startig over the bot conversion
    reset() {

        console.log(`OpenAICocktailBot '${this.name}' resetting.`);

        // set up chat messages, start with system message decribing the bot
        this.messages = [{
            role: "system",
            content: this.system
        }];
    }

    // build a OpenAI chat request object from previous conversation
     createChatRequest(): OpenAI.Chat.Completions.ChatCompletionCreateParams  {

        //openai.chat.completions.ChatRe 
        
        //OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, options?: OpenAI.RequestOptions<Record<string, unknown> | Readable>

        // const completion = await this.openAI.chat.completions.create({
        //     model: "gpt-3.5-turbo-1106",
        //     messages: []
        // });

        //OpenAI.Chat.Completions.ChatCompletionMessageParam[] measureMemory;

        //let mmm: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];

        /*let msg: Array<OpenAI.Chat.ChatCompletionMessageParam> = [{
            role: "user",
            content: ""
        }];*/

        console.log(`OpenAICocktailBot '${this.name}' request: ${util.inspect(this.messages)}`);

        return {
            model: this.model,
            messages: this.messages,
        };
    }

    // generates a random cocktail recipe
    createRandomDrink(): CocktailRecipe {
        
        console.log(`OpenAICocktailBot '${this.name}' creating random cocktail.`);

        return {ingredients: [0], name: ""};
    }

    // creates a cocktail recipe via OpenAI
    async pourMeADrink(): Promise<CocktailRecipe> {

        console.log(`OpenAICocktailBot '${this.name}' pour me a drink...`);

        // request a drink
        this.messages.push({
            role: "user",
            content: "pour me a drink"
        });

        // this uses the messages to form a request
        let request = this.createChatRequest();

        try {
			const completion = await this.openAI.chat.completions.create(request) as ChatCompletion;          // query OpenAI
		
            console.log(`OpenAICocktailBot '${this.name}' completion returned successfully.`);

            let result = completion.choices[0].message;
            let totalTokens: number = completion?.usage?.total_tokens ?? 0;     // 0 if undefined

            console.log(util.inspect(completion));
            console.log("result:", result);
            console.log("tokens:", totalTokens);

            // make sure to tell gtp about the whole conversion, also the response
            this.messages.push(result);
            
            let resultSplit = result?.content?.split(",") ?? ["",""];
            let cocktailName = resultSplit[1];

            return {
                 ingredients: resultSplit[0].split(" ").map(Number),
                 name: cocktailName
            }

		} catch (err) {

            // https://github.com/openai/openai-node
            if (err instanceof OpenAI.APIError) {
                console.log(err.status); // 400
                console.log(err.name); // BadRequestError
                console.log(err.headers); // {server: 'nginx', ...}
            }

            console.log(`OpenAICocktailBot '${this.name}' error during OpenAI request: ${err}. We'll pour you a random drink instead.`);
            return this.createRandomDrink();
        }
    }

    /*
    async test() {

        dotenv.config();	// move ENV variables from .env into NodeJS environment

        // gracefully stop if OpenAI API key not provided and help developer fix it
        if (process.env.OPENAI_API_KEY == undefined) {
            console.log("OpenAI API key not defined. Please set OPENAI_API_KEY environment variable. Exiting.");
            process.exit(1);
        }

        
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

    */
}