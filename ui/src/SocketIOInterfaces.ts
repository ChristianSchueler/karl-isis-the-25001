// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2024 by Christian Schüler, christianschueler.at

import { ICocktailRecipe, CocktailRecipe } from './../../ts/CocktailRecipe';

// events from server side (backend) to client side (browser, frontend)
export interface ServerToClientEvents {
    /*noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;*/
    //hi: () => void;
    //setConfig: (config: SquatBotConfig) => void;    // transmit config settings to frontend ui app

    setRecipe: (Recipe: ICocktailRecipe) => void;
  }
  
  export interface ClientToServerEvents {
    // gameStarted: () => void;
    // gameCancelled: () => void;
    // gameWon: () => void;                            // signal game won
    // squatDown: () => void;                          // squat down
    // squatUp: () => void;                            // squat up
  }
  
  export interface InterServerEvents {
    //ping: () => void;
  }
  
  export interface SocketData {
    //name: string;
    //age: number;
  }