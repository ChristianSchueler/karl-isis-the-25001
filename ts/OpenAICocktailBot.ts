// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2024 by Christian Schüler, christianschueler.at

import OpenAI from "openai";
import * as util from 'util';
import { ChatCompletion } from "openai/resources";

import { CocktailRecipe, ICocktailRecipe } from "./CocktailRecipe.js";

export enum AISystem { JsonResult, ListResult, PreventAlcoholicGpt }

// OLD
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

// vodka, gin, rum, blue curacao, ananas juice, cherry juice, orange juice, bitter lemon, tonic water, herbal lemonade, bitter orange sirup, soda

// this is what defines the scope or context of the AI bot
const karlIsisSystem = `
You are a cocktail mixing robot, you are able to pour cocktails with up to 12 different ingredients.
You can use the following list of alcoholic ingredients: vodka, gin, rum, blue curacao.
You can use the following list of non-alcoholic ingredients: ananas juice, cherry juice, orange juice, bitter lemon, tonic water, herbal lemonade, bitter orange sirup, soda.
What I ask you to "pour me a cocktail", you create a random cocktail recipe with your available ingredients and you create a cocktail name.
The following rules apply to cocktail recipes:
- consist of a list of amounts of ingredients measured in cl
- select only one alcoholic ingredient from your given list of alcoholic ingredients
- the list must contain only one alcoholic ingredient
- select between one and five non-alcoholic ingredients from your given list of non-alcoholic ingredients
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

const karlIsisSystem2 = `
You are a cocktail mixing robot, you are able to pour cocktails.
Ingredients are measured in cl.
Be creative, don't repeat a cocktail recipe.
What I ask you to "pour me a cocktail", you preform the following steps:
First, select an alcoholic ingredient exclusively from the following list: vodka, gin, rum, blue curacao and select an amount between 2 cl and 4 cl.
Second, select one to five non-alcoholic ingredients exclusively from the following list: ananas juice, cherry juice, orange juice, bitter lemon, tonic water, herbal lemonade, bitter orange sirup, soda and for each ingredient select an amount between 2 cl and 6 cl.
Third, select a fancy cocktail name.
Format your response as comma separated text: cocktail name, amount of alcoholic ingredient and alcoholic ingredient name separated by a single space, all non-alcoholic ingredients including amounts
`

// - a list of whole numbers separated by a single space character
// - each number should represent the amount of the ingredient in cl
// - use the ingredient order given by this list: vodka, gin, rum, blue curacao, ananas juice, cherry juice, orange juice, bitter lemon, tonic water, herbal lemonade, bitter orange sirup, soda
// - Include unused ingrediets as 0 in the list.
// - append to your response a comma and the cocktail name you chose

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
    aiSystem: AISystem;                             //
	
    constructor(name: string, ingredients: string[], aiSystem: AISystem, openAIConfig: OpenAIConfig) {

        console.log(`OpenAICocktailBot '${name}' constructing...`);

        this.aiSystem = aiSystem;
        this.name = name;
        this.ingredients = ingredients;
        switch (this.aiSystem) {
            case AISystem.JsonResult: this.system = cocktailPrompt; break;
            case AISystem.ListResult: 
                this.system = karlIsisSystem;
                const ingredientsString = ingredients.join(", ");
                this.system.replace("%INGREDIENTS%", ingredientsString);
                break;
            case AISystem.PreventAlcoholicGpt: this.system = karlIsisSystem2; break;
        }

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

        if (global.debug) console.log(`OpenAICocktailBot '${this.name}' request: ${util.inspect(this.messages)}`);

        return {
            model: this.model,
            messages: this.messages,
        };
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
        
        console.log("Waiting for OpenAI GTP API reply...");

        try {
            // // this should not be necessary, probably remove again
            // let options: OpenAI.RequestOptions = {
            //     timeout: 30
            // };
			const completion = await this.openAI.chat.completions.create(request) as ChatCompletion;          // query OpenAI, that might take a few secs
		
            console.log(`OpenAICocktailBot '${this.name}' completion returned successfully.`);

            // parse and interpret the result
            let result = completion.choices[0].message;
            let totalTokens: number = completion?.usage?.total_tokens ?? 0;     // 0 if undefined

            if (global.debug) console.log(util.inspect(completion));
            console.log("result:", result);
            console.log("tokens:", totalTokens);

            // make sure to tell gtp (in the next run) about the whole conversion, also the response
            this.messages.push(result);

            // interpret result based on prompt
            switch (this.aiSystem) {
                case AISystem.JsonResult: return new CocktailRecipe([], ""); break; // NOPE

                case AISystem.ListResult: 
                    let resultSplit = result?.content?.split(",") ?? ["",""];
                    let cocktailName = resultSplit[1];
        
                    let recipe = new CocktailRecipe(resultSplit[0].split(" ").map(Number), cocktailName);
                    recipe.normalize(10, 20);       // make sure drink size is fine
        
                    return recipe;        
                    break;

                case AISystem.PreventAlcoholicGpt: // "Pirate's Paradise, 3 cl rum, 4 cl ananas juice, 3 cl cherry juice"
                    //let split = result?.content?.split(",") ?? ["",""];
                    //let name = split?.shift()?.trim() ?? "";
                    //let ingredients = [];
                    return CocktailRecipe.fromPreventAlcoholicGpt(result?.content ?? "", this.ingredients);
                    
                    break;

                default: return new CocktailRecipe([], "");
            }

		} catch (err) {

            if (global.debug) console.log("OpenAI GPT error:", err);

            // https://github.com/openai/openai-node
            if (err instanceof OpenAI.APIError) { 
                if (global.debug) {
                    console.log("Name:", err.name); // BadRequestError
                    console.log("Cause:", err.cause);
                    console.log("Status:", err.status); // 400
                    console.log("Headers:", err.headers); // {server: 'nginx', ...}
                }
            }

            console.log(`OpenAICocktailBot '${this.name}' error during OpenAI request: ${err}. We'll pour you a random alcoholic drink instead.`);
            return CocktailRecipe.randomRecipe(true, 2, 4);
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