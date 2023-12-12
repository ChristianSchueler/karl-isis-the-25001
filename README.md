# Karl-Isis the 25001
Source code for Cocktail Bot for Roboexotica 2023

(c) 2023 Christian Schüler, christianschueler.at

Using TypeScript, Electron, Google Media Pipe (vision), Socket.IO, onoff and of course OpenAI API.

This is the main repo of the Karl-Isis the 25001 cocktail mixing robot.

### Prerequisites

#### Dependencies

*   [Node.js & NPM](https://www.npmjs.com/package/download)

### Installing

```
git clone git@github.com:https://github.com/ChristianSchueler/karl-isis-the-25001.git
npm i
npm run build
```
Please see below for config.

You might use npm run watch.

When updating, please make sure you download latest model file into /models folder and copy latest wasm files from node_modules into /wasm folder.

### Building on Raspberry Pi / Windows

There is IngredientPump.ts and CocktailButtons.ts having import from either Gpio mock class or onoff. Uncomment onoff on Rasperry Pi. Uncomment Gpio.ts on Windows.

### Starting

```
npm run start
```

To start the web server. Browse to http://localhost:5000 to enable face tracking using the web cam.

Or use
```
npm run startui
```

to fire of Electron as web broswer and all is done.

### Configuration

Create a copy of the .env.template file, name it .env and fill in.

```
# OpenAI GPT-3 API key goes here. Get it from here: https://beta.openai.com/account/api-keys
OPENAI_API_KEY="INSERT KEY HERE"

# OpenAI GPT-3 API key goes here. Get it from here: https://beta.openai.com/account/api-keys
OPENAI_ORGANIZATION="org-INSERT HERE"

DEBUG="false"

targetSquats = 2                # how many squats to perform
gameWinTimeout_s = 10           # how long until the next game might start
faceMinX = 100                  # only use faces in the center region
faceMaxX = 540                  # only use faces in the center region
gameStartTimeout_s = 3          # how long to see a face for starting a game
topOffset_px = 20               #
bottomOffset_px = 0             #
gameLeftTimeout_s = 3           # cancel the game after 3 consecutive seconds without a face detected
squatFactor = 1.2               #

```