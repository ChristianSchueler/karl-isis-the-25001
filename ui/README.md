# Google Media Pipe Face Detection in the Browser with TypeScript for Karl-Isis the 25001

(c) 2023 Christian Schüler, christianschueler.at

Using microbuild, TypeScript, Google Media Pipe (vision) and Socket.IO.

This is part of the Karl-Isis the 25001 cocktail mixing robot source code.

It connects via socket.io and transmits detection events.

### Prerequisites

#### Dependencies

*   [Node.js & NPM](https://www.npmjs.com/package/download)

### Installing

```
git clone git@github.com:https://github.com/ChristianSchueler/karl-isis-the-25001.git
npm i
npm run build
```
You might use npm run watch.

When updating, please make sure you download latest model file into /models folder and copy latest wasm files from node_modules into /wasm folder.