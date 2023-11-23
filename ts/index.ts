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

const inProduction = false;

const log_stdout = process.stdout;

// overload console.log
console.log = function(...d) {
  
	let output = util.format(...d) + '\n';
	
	let today: Date = new Date();
	let dateString = today.getFullYear().toString() + '-' + (today.getMonth()+1).toString().padStart(2, '0') + '-' + (today.getDay()+1).toString().padStart(2, '0');

	// TODO: uh-oh crashes when logs folder does not exist
  	fs.appendFileSync(process.cwd() + '/logs/console-' + dateString + '.log', output);
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

	dotenv.config();	// move ENV variables from .env into NodeJS environment

	// gracefully stop if OpenAI API key not provided and help developer fix it
	if (process.env.OPENAI_API_KEY == undefined) {
		console.log("OpenAI API key not defined. Please set OPENAI_API_KEY environment variable. Exiting.");
		process.exit(1);
	}

	// set up keyboard debug and maintenace controls
	/*const stdin = process.openStdin();

	stdin.resume();
	stdin.on("data", function (keydata) {
		process.stdout.write("output: " + keydata);
	});*/

	// set up dispenser hardware
	let cocktailDispenser = new CocktailDispenser();

	// set up OpenAI cocktail recioe generator
	let bot = new OpenAICocktailBot.OpenAICocktailBot("alcohol", ["a"], OpenAICocktailBot.karlIsisSystem, { apiKey: process.env.OPENAI_API_KEY, organization: process.env.OPENAI_ORGANIZATION, model: "gpt-3.5-turbo-1106" });
	
	// ***** main loop starts here
	let recipe = await bot.pourMeADrink();
	console.log(recipe);

	// et voilà
	await cocktailDispenser.dispenseRecipe(recipe);

	console.log('Dispensing finished.');

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
			console.log("Exiting Karl-Isis the 25001. Have a nice day, bye-bye.");
			running = false;
		} catch (e) {
			console.error("error in main:", e);
			if (!inProduction) running = false;	// if not in production mode, terminate immediately after first error. otherwise, continue into endless loop
			// -> restart using a loop
		}
	}
})();
