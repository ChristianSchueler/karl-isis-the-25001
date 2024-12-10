// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2024 by Christian Schüler, christianschueler.at

// References
// - Author: https://christianschueler.at/
// - GitHub Repo: https://github.com/ChristianSchueler/karl-isis-the-25001
// - Project description: https://christianschueler.at/technologie/karl-isis-der-250100-ki-cocktail-bot/

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import fs from 'fs';
import util from 'util';
import * as readline from 'readline';
import pkg from 'electron';
const { app, BrowserWindow } = pkg;
//import { app, BrowserWindow } from "electron";

import { KarlIsisServer } from "./KarlIsisServer.js";
import * as OpenAICocktailBot from './OpenAICocktailBot.js';
import { CocktailDispenser } from './CocktailDispenser.js';
import { CocktailRecipe } from './CocktailRecipe.js';
import { CocktailButtons } from './CocktailButtons.js';
import { sleep } from './sleep.js';

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

// return true when we are running inside Electron (instead of NodeJS)
function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}

// let ChatGPT invent and dispense your cocktail
async function AICocktail(buttons: CocktailButtons, server: KarlIsisServer, cocktailDispenser: CocktailDispenser, bot: OpenAICocktailBot.OpenAICocktailBot, recipeDisplayDuration_ms: number) {
	
	// used for storing the current recipe
	let recipe: CocktailRecipe;

	buttons.enabled = false;		// disable buttons again to prevent pressing again

	// move to ChatGPT waiting screen
	server.showScreen("screen2");

	await buttons.ledsOff();		// turn off the lights
	buttons.ledBlinkContinuous(1, 100);		// dont await...
	buttons.ledBlinkContinuous(2, 100);

	const result = [await sleep(5000), await bot.pourMeADrink()];
	recipe = result[1] as CocktailRecipe;

	console.log(recipe.toString(cocktailDispenser));
	if (!recipe.isValid()) {
		console.log("error, invalid recipe, maybe wrong formatting by GPT. I'll get you a random alcoholic cocktail");
		recipe = CocktailRecipe.randomRecipe(true, 2, 4);
	}

	// send recipe to UI
	console.log("sending recipe to ui...");
	server.setRecipe(recipe, CocktailRecipe.ingredientNamesList(cocktailDispenser));

	// move to dispensing screen
	server.showScreen("screen3");

	// et voilà
	await cocktailDispenser.dispenseRecipe(recipe); 

	await buttons.ledBlinkStopContinuous(1);
	await buttons.ledBlinkStopContinuous(2);
	await buttons.ledsOff();

	// move to enjoy screen
	server.showScreen("screen4");

	console.log('Dispensing finished.');
	
	// keep message with recipe for 20 s visible in case of UI. otherwise it's all the time visible on console
	if (isElectron()) await sleep(recipeDisplayDuration_ms);

	// back to start screen
	server.showScreen("screen1"); 

	await sleep(500);
	await buttons.ledOn(1);
	await buttons.ledOn(2);

	// important, do this after the leds and motors have all (!) stopped. otherwise we might trigger false presses.
	buttons.enabled = true;
}

// random cocktail
async function RandomCocktail(alcohol: boolean, buttons: CocktailButtons, server: KarlIsisServer, cocktailDispenser: CocktailDispenser, bot: OpenAICocktailBot.OpenAICocktailBot, recipeDisplayDuration_ms: number) {

	// used for storing the current recipe
	let recipe: CocktailRecipe;

	buttons.enabled = false;		// disable buttons again to prevent pressing again

	// move to random cocktail waiting screen
	server.showScreen("screen2a");

	await buttons.ledsOff();		// turn off the lights
	buttons.ledBlinkContinuous(1, 100);		// dont await...
	buttons.ledBlinkContinuous(2, 100);

	const result = [await sleep(5000), await CocktailRecipe.randomRecipe(alcohol)];		// with or without alcohol
	recipe = result[1] as CocktailRecipe;

	console.log(recipe.toString(cocktailDispenser));

	// send recipe to UI
	console.log("sending recipe to ui...");
	server.setRecipe(recipe, CocktailRecipe.ingredientNamesList(cocktailDispenser));

	// move to dispensing screen
	server.showScreen("screen3");

	// et voilà
	await cocktailDispenser.dispenseRecipe(recipe);

	await buttons.ledBlinkStopContinuous(1);
	await buttons.ledBlinkStopContinuous(2);
	await buttons.ledsOff();

	// move to enjoy screen
	server.showScreen("screen4");

	console.log('Dispensing finished.');
	
	// keep message with recipe for 20 s visible in case of UI. otherwise it's all the time visible on console
	if (isElectron()) await sleep(recipeDisplayDuration_ms);

	// back to start screen
	server.showScreen("screen1"); 

	await sleep(500);
	await buttons.ledOn(1);
	await buttons.ledOn(2);

	buttons.enabled = true;
}

// main entry point
async function main() {

	// create logs directory if not already existing
	let logDir = process.cwd() + '/logs/';
	if (!fs.existsSync(logDir)){
    	fs.mkdirSync(logDir);
	}
	
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

	// get some ENV settings
	let fullscreen = process.env.FULLSCREEN?.toLowerCase() == "true";
	let buttonMinHoldDuration_ms = Number(process.env.BUTTON_MIN_HOLD_DURATION_MS) ?? 100;
	let openAiModel = process.env.OPENAI_MODEL ?? "gpt-3.5-turbo-1106";
	let devtools = process.env.DEVTOOLS?.toLowerCase() == "true";
	let recipeDisplayDuration_ms = Number(process.env.RECIPE_DISPLAY_DURATION_MS) ?? 20000;
	 
	console.log("options:");
	console.log("fullscreen:", fullscreen);
	console.log("buttonMinHoldDuration_ms:", buttonMinHoldDuration_ms);
	console.log("openAiModel:", openAiModel);
	console.log("devtools:", devtools);
	console.log("recipeDisplayDuration_ms:", recipeDisplayDuration_ms);

	// set up hardware buttons and LEDs
	let buttons = new CocktailButtons(5, 6, 7, 8, buttonMinHoldDuration_ms);
	buttons.enabled = false;		// disable buttons first

	// create the server, hosting the html app
	let server = new KarlIsisServer();
	await server.start();
	// TODO: problem here, socket might not already connected!
	// hint: when server has started, socket get's connected and moves automatically to "screen1"

	await buttons.ledsOff();		// turn off the lights
	await buttons.ledOn(1);
	await buttons.ledOn(2);

	// set up dispenser hardware
	let cocktailDispenser = new CocktailDispenser();
	const ingredients = cocktailDispenser.getIngredientList();
 
	// set up OpenAI cocktail recipe generator
	let bot = new OpenAICocktailBot.OpenAICocktailBot("alcohol", ingredients, OpenAICocktailBot.AISystem.PreventAlcoholicGpt, { 
		apiKey: process.env.OPENAI_API_KEY, 
		organization: process.env.OPENAI_ORGANIZATION, 
		model: openAiModel		// from .ENV 
	});

	// AI cocktail
	buttons.onButton1 = async () => {
		
		await AICocktail(buttons, server, cocktailDispenser, bot, recipeDisplayDuration_ms);
	};

	// non-alcoholic cocktail
	buttons.onButton2 = async () => {
		
		await RandomCocktail(false, buttons, server, cocktailDispenser, bot, recipeDisplayDuration_ms);
	};

	console.log("f1...f12 start/stop dispensing");
	console.log("a        AI cocktail");
	console.log("r        (r)andom cocktail");
	console.log("n        random (n)icolas non-alcoholic cocktail");
	console.log("Ctrl-c   quit");

	// ***** main loop starts here
	
	// set up keyboard debug and maintenace controls

	readline.emitKeypressEvents(process.stdin);
	if (process.stdin.setRawMode != undefined) process.stdin.setRawMode(true);

	process.stdin.on('keypress', async (key, data) => {
		// check for abort Ctrl-C
		if (data.ctrl && data.name === 'c') {
			console.log("Exiting Karl-Isis the 25001. Have a nice day, bye-bye.");
			process.exit();
		}
		
		if (global.debug) console.log('key pressed:', data.name);

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
				await AICocktail(buttons, server, cocktailDispenser, bot, recipeDisplayDuration_ms);
			break;
	
			case "r":		// random with alcohol
				await RandomCocktail(true, buttons, server, cocktailDispenser, bot, recipeDisplayDuration_ms);
			break;

			case "n":		// Nicolas alcohol-free random cocktails
				await RandomCocktail(false, buttons, server, cocktailDispenser, bot, recipeDisplayDuration_ms);
			break;
		}
	});

	// GO: enable buttons
	buttons.enabled = true;

	// start electron app (i.e. window) only when using electron
	if (isElectron()) {
		
		// Quit when all windows are closed.
		app.on('window-all-closed', () => {
			// On macOS it is common for applications and their menu bar
			// to stay active until the user quits explicitly with Cmd + Q
			if (process.platform !== 'darwin') {
				app.quit()
			}
		})

		await app.whenReady();		// wait until electron window is open

		var mainWindow: Electron.BrowserWindow = new BrowserWindow({
			title: "Karl-Isis the 25001",
			show: false,
			fullscreen: fullscreen,
			kiosk: fullscreen,
			autoHideMenuBar: true
		});
		
		mainWindow.webContents.on("crashed", (e) => {
			app.relaunch();
			app.quit();
		});

		// function handleKeyPress (event) {
		// 	// You can put code here to handle the keypress.
		// 	// document.getElementById('last-keypress').innerText = event.key
		// 	console.log(`You pressed ${event.key}`)
		//   }
		   
		// mainWindow.webContents.addListener("input-event", (e) => {
		// 	console.log(e);
		// });

		//mainWindow.maximize();
		
		if (devtools) mainWindow.webContents.openDevTools();

		console.log("opening URL: http://localhost:5000");
		
		mainWindow.loadURL("http://localhost:5000");
		mainWindow.show();
	}
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
			if (global.debug) running = false;		// if not in production mode, terminate immediately after first error. otherwise, continue into endless loop
			
			// by default -> restart using a loop in case of error to keep it running
		}
	}
})();
