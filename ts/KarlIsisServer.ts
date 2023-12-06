// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

const express = require('express');
const http = require('http');
import { Server } from 'socket.io';
import * as SocketIOInterfaces from '../ui/src/SocketIOInterfaces';
import * as fs from 'fs';

export class KarlIsisServer {
    public onGameWon?: () => void;

    server: any;
    io: Server<SocketIOInterfaces.ClientToServerEvents, SocketIOInterfaces.ServerToClientEvents, SocketIOInterfaces.InterServerEvents, SocketIOInterfaces.SocketData>;

    constructor() {
        
        console.log("Creating web server...");

        const appExpress = express();

        for(let i = 0; i < process.argv.length; ++i) {
            console.log(`index ${i} argument -> ${process.argv[i]}`);
        }

        if (process.argv[2] && process.argv[2] == 'secure') {
            console.log("setting up secure server");

            // Creating object of key and certificate for SSL 
            const options = { 
                key: fs.readFileSync("server.key"), 
                cert: fs.readFileSync("server.cert"), 
            };

            this.server = http.createServer(options, appExpress);       // SSL
        }
        else this.server = http.createServer(appExpress);        // http

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

        this.io.on("connect", (socket) => {
            console.log("socket.io connect");

            socket.on("gameWon", () => {
                console.log("socket: gameWon");

                if (this.onGameWon) this.onGameWon();       // execute event handler
            });

            socket.emit("hi");
        });

        let path = __dirname + '/../../ui';
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
}

