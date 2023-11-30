// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

// references
// - https://github.com/fivdi/onoff
//
//
//

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Server } from "./server";
import { OpenAICocktailRecipes } from "./openai";
import { stringify } from "querystring";
import * as OpenAICocktailBot from './OpenAICocktailBot';
import fs from 'fs';
import util from 'util';
import { CocktailDispenser } from './CocktailDispenser';
import { CocktailRecipe } from './CocktailRecipe';
import * as readline from 'readline';

// make debug a global variable
declare global {
	var debug: boolean;
}

// remember console for later use
const log_stdout = process.stdout;

// overload console.log
console.log = function(...d) {

	let today: Date = new Date();

	let output = util.format(...d) + '\n';

	let timeString = (today.getHours()+1).toString().padStart(2, '0') + ':' + today.getMinutes().toString().padStart(2, '0') + ':' + today.getSeconds().toString().padStart(2, '0') + "." + today.getMilliseconds().toString().padStart(3, '0');
	let dateString = today.getFullYear().toString() + '-' + (today.getMonth()+1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');

	// TODO: uh-oh crashes when logs folder does not exist
  	fs.appendFileSync(process.cwd() + '/logs/console-' + dateString + '.log', timeString + " - " + output);
	log_stdout.write(output);
};

//if (process.env.NODE_ENV === 'production') {
// 	//const pluginName = await import('../js/plugin_name.js');
//}

// main entry point
async function main() {
 
	// Quit when all windows are closed.
	/*app.on('window-all-closed', () => {
		// On macOS it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})

	await app.whenReady();		// wait until electron window is open

	var mainWindow = new BrowserWindow({
        title: "Interdimensional Cocktail Portal",
		show: false,
		fullscreen: true,
        kiosk: true,
		autoHideMenuBar: true
    });
    
    mainWindow.webContents.on("crashed", (e) => {
		app.relaunch();
		app.quit();
	});
*/

	// button test
	/*const button = new Gpio(4, 'in', 'rising', { debounceTimeout: 30 });
	const led = new Gpio(17, 'out');
	led.writeSync(0)
	button.watch((err, value) => {
		console.log("button:", value, err);
		led.writeSync(value);
	});*/

	//let ai = new OpenAICocktailRecipes();
	//await ai.test();

	console.log("Karl-Isis the 25001 (c) 2022 - 2023 by Christian Schüler. Welcome.");
	console.log("Press Ctrl-C to exit.");

	dotenv.config();	// move ENV variables from .env into NodeJS environment

	// set to true or any other value to activate it. leave it out or set to false to deactivate it
	if (process.env.DEBUG) {
		if (process.env.DEBUG == "false") global.debug = false;
		else global.debug = true;
	}
	else global.debug = false;

	// gracefully stop if OpenAI API key not provided and help developer fix it
	if (process.env.OPENAI_API_KEY == undefined) {
		console.log("OpenAI API key not defined. Please set OPENAI_API_KEY environment variable. Exiting.");
		process.exit(1);
	}

	// set up dispenser hardware
	let cocktailDispenser = new CocktailDispenser();
	const ingredients = cocktailDispenser.getIngredientList();

	// set up OpenAI cocktail recioe generator
	let bot = new OpenAICocktailBot.OpenAICocktailBot("alcohol", ingredients, OpenAICocktailBot.AISystem.PreventAlcoholicGpt, { apiKey: process.env.OPENAI_API_KEY, organization: process.env.OPENAI_ORGANIZATION, model: "gpt-3.5-turbo-1106" });

	console.log("f1...f12 start/stop dispensing");
	console.log("a        AI cocktail");
	console.log("r        (r)andom cocktail");
	console.log("n        random (n)icolas cocktail with alcohol");
	console.log("Ctrl-c   quit");

	// ***** main loop starts here
	// set up keyboard debug and maintenace controls

	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);

	process.stdin.on('keypress', async (key, data) => {
		// check for abort Ctrl-C
		if (data.ctrl && data.name === 'c') {
			console.log("Exiting Karl-Isis the 25001. Have a nice day, bye-bye.");
			process.exit();
		}
		
		if (global.debug) console.log('key pressed:', data.name);

		let recipe;

		switch (data.name) {
			case "f1": cocktailDispenser.togglePump(0); break;
			case "f2": cocktailDispenser.togglePump(1); break;
			case "f3": cocktailDispenser.togglePump(2); break;
			case "f4": cocktailDispenser.togglePump(3); break;
			case "f5": cocktailDispenser.togglePump(4); break;
			case "f6": cocktailDispenser.togglePump(5); break;
			case "f7": cocktailDispenser.togglePump(6); break;
			case "f8": cocktailDispenser.togglePump(7); break;
			case "f9": cocktailDispenser.togglePump(8); break;
			case "f10": cocktailDispenser.togglePump(9); break;
			case "f11": cocktailDispenser.togglePump(10); break;
			case "f12": cocktailDispenser.togglePump(11); break;

			case "a":		// AI cocktail
				recipe = await bot.pourMeADrink();
				console.log(recipe.toString(cocktailDispenser));
				if (!recipe.isValid()) {
					console.log("error, invalid recipe, maybe wrong formatting by GPT. I'll get you a radnom cocktail");
					recipe = CocktailRecipe.randomRecipe(true, 2, 4);
				}
	
				// et voilà
				await cocktailDispenser.dispenseRecipe(recipe); 
	
				console.log('Dispensing finished.');
			break;
	
			case "r":		// random
				recipe = CocktailRecipe.randomRecipe(true, 2, 4);
				console.log(recipe.toString(cocktailDispenser));
	
				// et voilà
				await cocktailDispenser.dispenseRecipe(recipe);
	
				console.log('Dispensing finished.');
			break;

			case "n":		// Nicolas alcohol-free random cocktails
				recipe = CocktailRecipe.randomRecipe(false);
				console.log(recipe.toString(cocktailDispenser));
	
				// et voilà
				await cocktailDispenser.dispenseRecipe(recipe);
	
				console.log('Dispensing finished.');
			break;
		}
	});

	//stdin.resume();
	
	/*
	stdin.on("data", async function (keydata) {
		process.stdout.write("output: " + keydata);

		if (keydata === '\u0003' ) {
			process.exit();
		}

		if (keydata == "a") {
			let recipe = await bot.pourMeADrink();
			console.log(recipe);

			// et voilà
			await cocktailDispenser.dispenseRecipe(recipe); 

			console.log('Dispensing finished.');
		}

		if (keydata == "b") {
			let recipe = CocktailRecipe.randomRecipe(true, 2, 4);
			console.log(recipe);

			// et voilà
			await cocktailDispenser.dispenseRecipe(recipe);

			console.log('Dispensing finished.');
		}

		if (keydata == "c") {
			console.log('Cleaning...');

			await cocktailDispenser.cleanSerial(10);

			console.log('Cleaned.');
		}

		if (keydata == "d") {
			console.log('Cleaning...');

			await cocktailDispenser.cleanParallel(10);

			console.log('Cleaned.');
		}

		// 51 s für 100 ml
		if (keydata == "e") {
			console.log('Cleaning...');

			await cocktailDispenser.pump(0, 20);

			console.log('Cleaned.');
		}
	});*/

	//let s = new Server();
	//await s.start();
	
    //mainWindow.maximize();
    //mainWindow.loadFile('./../views/index.html');
	//console.log("opeing URL: http://localhost:3000");
	//mainWindow.loadURL("http://localhost:3000");
    //mainWindow.show();
}

// execute main function in async way and recover from error. main entry point.
(async () => {
	let running = true;

    while (running) {
		try {
			await main();
			//console.log("Exiting Karl-Isis the 25001. Have a nice day, bye-bye.");
			running = false;
		} catch (e) {
			console.error("error in main:", e);
			if (debug) running = false;		// if not in production mode, terminate immediately after first error. otherwise, continue into endless loop
			
			// by default -> restart using a loop in case of error to keep it running
		}
	}
})();
