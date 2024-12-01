// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import express from 'express';
import * as http  from 'http';
import * as fs from 'fs';
import { Server } from 'socket.io';

import * as SocketIOInterfaces from '../ui/src/SocketIOInterfaces.js';
import { ICocktailRecipe } from './CocktailRecipe.js';

export class KarlIsisServer {
    // public onGameStarted?: () => void;                              // overwrite this to catch game won events
    // public onGameCancelled?: () => void;                              // overwrite this to catch game won events
    // public onGameWon?: () => void;                              // overwrite this to catch game won events
    // public onSquatDown?: () => void;
    // public onSquatUp?: () => void;
    // squatBotConfig: SocketIOInterfaces.SquatBotConfig;          // config values ready from .env

    server: any;
    io: Server<SocketIOInterfaces.ClientToServerEvents, SocketIOInterfaces.ServerToClientEvents, SocketIOInterfaces.InterServerEvents, SocketIOInterfaces.SocketData>;
    socket: any;

    constructor() {

        console.log("Reading Karl-Isis config...");

        // set config
        // get config from .env file or ENV
        // this.squatBotConfig = new SocketIOInterfaces.SquatBotConfig();
        // if (process.env.targetSquats) this.squatBotConfig.targetSquats = parseInt(process.env.targetSquats);
        // if (process.env.gameWinTimeout_s) this.squatBotConfig.gameWinTimeout_s = parseInt(process.env.gameWinTimeout_s);
        // if (process.env.faceMinX) this.squatBotConfig.faceMinX = parseInt(process.env.faceMinX);
        // if (process.env.faceMaxX) this.squatBotConfig.faceMaxX = parseInt(process.env.faceMaxX);
        // if (process.env.gameStartTimeout_s) this.squatBotConfig.gameStartTimeout_s = parseInt(process.env.gameStartTimeout_s);
        // if (process.env.topOffset_px) this.squatBotConfig.topOffset_px = parseInt(process.env.topOffset_px);
        // if (process.env.bottomOffset_px) this.squatBotConfig.bottomOffset_px = parseInt(process.env.bottomOffset_px);
        // if (process.env.gameLeftTimeout_s) this.squatBotConfig.gameLeftTimeout_s = parseInt(process.env.gameLeftTimeout_s);
        // if (process.env.squatFactor) this.squatBotConfig.squatFactor = parseFloat(process.env.squatFactor);

        // console.log("Ssquat bot config:", this.squatBotConfig);

        console.log("Creating web server...");

        const appExpress: express.Application = express();

        for(let i = 0; i < process.argv.length; ++i) {
            console.log(`index ${i} argument -> ${process.argv[i]}`);
        }

        /*if (process.argv[2] && process.argv[2] == 'secure') {
            console.log("setting up secure server");

            // Creating object of key and certificate for SSL 
            const options = { 
                key: fs.readFileSync("server.key"), 
                cert: fs.readFileSync("server.cert"), 
            };

            this.server = http.createServer(options, appExpress);       // SSL
        }
        else*/ 
        this.server = http.createServer(appExpress);        // http

        // socket.io
        console.log("Creating socket.io server...");
        this.io = new Server<
            SocketIOInterfaces.ClientToServerEvents,
            SocketIOInterfaces.ServerToClientEvents,
            SocketIOInterfaces.InterServerEvents,
            SocketIOInterfaces.SocketData>(this.server);

        this.io.engine.on("connection_error", (err) => {
            console.log(err.req);      // the request object
            console.log(err.code);     // the error code, for example 1
            console.log(err.message);  // the error message, for example "Session ID unknown"
            console.log(err.context);  // some additional error context
        });

        // set up socket events
        this.io.on("connect", (socket) => {
            console.log("socket.io connect");

            this.socket = socket;
            // socket.on("gameStarted", () => {
            //     console.log("socket: gameStarted");

            //     if (this.onGameStarted) this.onGameStarted();       // execute event handler
            // });

            // socket.on("gameCancelled", () => {
            //     console.log("socket: gameCancelled");

            //     if (this.onGameCancelled) this.onGameCancelled();       // execute event handler
            // });

            // socket.on("gameWon", () => {
            //     console.log("socket: gameWon");

            //     if (this.onGameWon) this.onGameWon();       // execute event handler
            // });

            // socket.on("squatDown", () => {
            //     console.log("socket: squatDown");

            //     if (this.onSquatDown) this.onSquatDown();       // execute event handler
            // });

            // socket.on("squatUp", () => {
            //     console.log("socket: squatUp");

            //     if (this.onSquatUp) this.onSquatUp();       // execute event handler
            // });

            // post config values to app
            // socket.emit("setConfig", this.squatBotConfig);
        });

        let path = './ui';
        console.log("Server path:", path);
        appExpress.use(express.static(path));
    }

    async start() {
        console.log("Starting web server...."); 

        return new Promise((resolve, reject) => {
            
            this.server.listen(5000, (error: any) => {
                
                if (error) {
                    console.log("Web server error:", error);
                    reject(false);
                }
                else {
                    console.log('Web server ready: listening on *:5000');

                    resolve(true);
                }
            });
        });
    }

    setRecipe(recipe: ICocktailRecipe) {
        this.socket.emit("setRecipe", recipe);
    }
}

