// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2024 by Christian Schüler, christianschueler.at

import { Detection, FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision"
import { ScaleToFitWindow } from "./ScaleToFitWindow.js";
import { io, Socket } from "socket.io-client";
import * as SocketIOInterfaces from './SocketIOInterfaces.js';
import { gsap } from "gsap";
import { ICocktailRecipe, CocktailRecipe } from './../../ts/CocktailRecipe';
 
// make debug a global variable
declare global {
	var debug: boolean;
}

globalThis.debug = false; // see https://stackoverflow.com/questions/38906359/create-a-global-variable-in-typescript

console.log("Karl-Isis: creating socket.io client...");
const socket: Socket<
  SocketIOInterfaces.ServerToClientEvents, 
  SocketIOInterfaces.ClientToServerEvents> = io({autoConnect: true});

socket.on("connect", () => {
  console.log("Karl-Isis: socket.io connect.");
});

// we recieved a recipe from the server via socket.io
socket.on("setRecipe", ( recipe: ICocktailRecipe, ingredientNames: string[]) => { 
  console.log("Karl-Isis: socket.io setRecipe cocktail recipe received: ", recipe, ingredientNames);

  app.setRecipe(recipe, ingredientNames);
});

// we recieved a recipe from the server via socket.io
socket.on("showScreen", ( screen: string) => { 
  console.log("Karl-Isis: socket.io showScreen: ", screen);

  app.showScreen(screen);
});

/** @class Application */
export class Application {
  socket: Socket<SocketIOInterfaces.ServerToClientEvents, SocketIOInterfaces.ClientToServerEvents>;
  recipe: ICocktailRecipe = CocktailRecipe.randomRecipe();

  constructor(socket: Socket<
    SocketIOInterfaces.ServerToClientEvents, 
    SocketIOInterfaces.ClientToServerEvents>) {
    
    console.log("Karl-Isis");

    this.socket = socket;

    new ScaleToFitWindow("#screen"); 
  }

  // explicitely set config values
  setRecipe(recipe: ICocktailRecipe, ingredientNames: string[]) {
    this.recipe = {...recipe};    // do a copy

    //this.video = document.getElementById("video") as HTMLVideoElement;
    //NodeListOf<HTMLElement> = document.querySelectorAll(this.viewSelector);
    // TODO TODO TODO

    // first set name of cocktail
    const cocktailName_h1 = document.querySelector(".content .screen4 .cocktail-name");
    cocktailName_h1!.textContent = this.recipe.name;

    // remove all existing ingredients
    const cocktaiIngredients_ul = document.querySelector(".content .screen4 .cocktail-recipe");
    cocktaiIngredients_ul!.innerHTML = "";

    for (const [index, ingredient_ml] of recipe.ingredients.entries()) {
      
      //let  = recipe.ingredients[ingredientIndex];
      if (ingredient_ml > 0) {
        
        let newIngredientItem_li = document.createElement('li');
        newIngredientItem_li.textContent = ingredient_ml.toPrecision(2) + " cl " + ingredientNames[index];

        cocktaiIngredients_ul!.appendChild(newIngredientItem_li);
      }
    }
  }

  showScreen(screen: string) {
    console.log("Showing screen '" + screen + "'...");

    const allScreens = document.querySelectorAll(".screen1, .screen2, .screen2a, .screen3, .screen4");
    const screenDoc = document.getElementsByClassName(screen)[0];

    for (const s of allScreens) {
      s.classList.remove("visible");
      s.classList.add("invisible");
    }
    screenDoc.classList.remove("invisible");
    screenDoc.classList.add("visible");

    /*switch (screen) {
      case "start":

        break;

        default:
          console.log("trying to switch to undefined screen:", screen);
          break;
    }*/
  }

  async setup(): Promise<void> {
    console.log("Animation...");

    // reotare logos
    gsap.to(".content .screen2 .logo, .content .screen2a .logo", {rotation: 360, transformOrigin: "center", ease: "none", duration: 3, repeat: -1});

    // rotate heard around y
    gsap.to(".content .screen4 .logo", { rotationY: 360, transformOrigin: "center", ease: "none", duration: 3, repeat: -1});

    // start drink fill animation
    gsap
    .timeline({
      repeat: -1,
      defaults: { ease: "none", duration: 3 }
    })
      .from("#stop5", { attr: { offset: 0 } })
      .to("#stop5", {attr: { offset: 1 } });
  }

  // run
  run(): void {
  }
}

// go!
const app = new Application(socket);
await app.setup();
app.run();
