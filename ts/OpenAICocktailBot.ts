// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import OpenAI from "openai";
import * as util from 'util';
import { measureMemory } from "vm";
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

export interface OpenAIConfig {
    apiKey: string;             // from https://platform.openai.com/api-keys
    organization?: string;       // from https://platform.openai.com/account/organization
    model?: string;             // e.g. gpt-3.5-turbo-1106
};

/*interface Message {
    role: string;
    content: string;
}

interface Messages extends Array<Message>{}*/

/** @class OpenAICocktailBot
 * 
 * @param ... 
 * 
 * 
 */
export class OpenAICocktailBot {
    name: string = "";			                    // unique name, used for writing files to disk
    system: string = "You are a cocktail bot.";     // describes the cocktail bot, 'system' field of chatgpt
    openAI: OpenAI;                                 // manages open ai requests
    model: string;                                  // openai model to be used, eg. gpt-4
    messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];                        // holds the conversion messages and roles, see chatgpt
	
    constructor(name: string, /*ingredients: string[],*/ systemDescription: string, openAIConfig: OpenAIConfig) {

        console.log(`OpenAICocktailBot '${name}' constructing...`);

        this.name = name;
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

        return {
            model: this.model,
            messages: this.messages,
        };
    }

    createRandomDrink(): string {
        return "";
    }

    async pourMeADrink() {

        console.log(`OpenAICocktailBot '${this.name}' pour me a drink...`);

        let request = this.createChatRequest();

        try {
			const completion = await openai.chat.completions.create(request);

			console.log("Exiting Karl-Isis the 25001. Have a nice day, bye-bye.");
			
		} catch (e) {
        }

        //let result = completion?.choices[0].message.content;
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