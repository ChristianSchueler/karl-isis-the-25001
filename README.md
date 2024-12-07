# Karl-Isis the 25001 - AI powered cocktail bot
Source code for Cocktail Robot for Roboexotica 2023, see  [christianschueler.at/technologie/karl-isis-der-250100-ki-cocktail-bot/](https://christianschueler.at/technologie/karl-isis-der-250100-ki-cocktail-bot/)

(c) 2023 Christian Schüler, [christianschueler.at](http://christianschueler.at/)

Using TypeScript, Electron, Google Media Pipe (vision), Socket.IO, onoff and of course OpenAI API.

This is the main repo of the Karl-Isis the 25001 cocktail mixing robot.

### Prerequisites

#### Dependencies

*   [Node.js & NPM](https://www.npmjs.com/package/download)

### Installing

Instructions for first build the server, then electron-rebuild and then the UI.

```
git clone git@github.com:https://github.com/ChristianSchueler/karl-isis-the-25001.git
npm install
npm run build
./node_modules/.bin/electron-rebuild
cd ui
npm install
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

To start the web server. Browse to http://localhost:5000 to show the UI

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

### Troubleshooting

I found that on Raspberry Pi and using our home internet provied, OpenAI API throws ConnectionErrors. It's working using the 
Windows Dev machine, however. Changing the used internet connection on Raspi worked. 

```
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
sudo wpa_cli -i wlan0 reconfigure
hostname -I
iwconfig wlan0
ifconfig
```
