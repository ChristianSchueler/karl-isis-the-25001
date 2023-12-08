// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

export class SquatBotConfig {
  public targetSquats: number = 3;
  public gameWinTimeout_s: number = 10;          // how long until the next game might start
  public faceMinX: number = 100;                 // only use faces in the center region
  public faceMaxX: number = 640-100;             // only use faces in the center region
  public gameStartTimeout_s: number = 3;         // how long to see a face for starting a game
  public topOffset_px: number = 20;
  public bottomOffset_px: number = 0;
  public gameLeftTimeout_s: number = 3;          // cancel the game after 3 consecutive seconds without a face detected
  public squatFactor: number = 1.2;
}

// socket.io client
export interface ServerToClientEvents {
    /*noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;*/
    //hi: () => void;
    setConfig: (config: SquatBotConfig) => void;    // transmit config settings to frontend ui app
  }
  
  export interface ClientToServerEvents {
    gameWon: () => void;                            // signal game won
    squatDown: () => void;
    squatUp: () => void;
  }
  
  export interface InterServerEvents {
    //ping: () => void;
  }
  
  export interface SocketData {
    //name: string;
    //age: number;
  }