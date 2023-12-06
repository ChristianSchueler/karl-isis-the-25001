

// socket.io client
export interface ServerToClientEvents {
    /*noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;*/
    hi: () => void;
  }
  
  export interface ClientToServerEvents {
    gameWon: () => void;
  }
  
  export interface InterServerEvents {
    //ping: () => void;
  }
  
  export interface SocketData {
    //name: string;
    //age: number;
  }