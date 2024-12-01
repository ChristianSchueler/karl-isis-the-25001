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
socket.on("setRecipe", (recipe: ICocktailRecipe) => { 
  console.log("Karl-Isis: socket.io setRecipe cocktail recipe received: ", recipe);

  app.setRecipe(recipe);
});

/** @class Application */
export class Application {
  lastVideoTime = -1;
  video?: HTMLVideoElement;
  faceDetector?: FaceDetector;
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
  setRecipe(recipe: ICocktailRecipe) {
    this.recipe = {...recipe};    // do a copy

    // TODO TODO TODO
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
