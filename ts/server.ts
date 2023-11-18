// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

const express = require('express');
const http = require('http');

export class Server {
    server: any;

    constructor() {
        
        console.log("creating internal web server");

        const appExpress = express();
        this.server = http.createServer(appExpress);

        appExpress.use(express.static('./../portal-windows-ui'));
    }

    async start() {
        console.log("starting internal web server....");

        return new Promise((resolve, reject) => {
            
            this.server.listen(3000, (error: any) => {
                
                if (error) {
                    reject(false);
                }
                else {
                    console.log('internal web server ready: listening on *:3000');
                    resolve(true);
                }
            });
        });
    }
}

