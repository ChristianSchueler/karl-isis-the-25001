//---

export class Server {
    constructor() {
        const express = require('express');
        const appExpress = express();
        const http = require('http');
        const server = http.createServer(appExpress);

        appExpress.use(express.static('frontend'));

        server.listen(3000, () => {
            console.log('listening on *:3000');
        });
    }
}

