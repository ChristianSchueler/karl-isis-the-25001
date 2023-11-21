// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2023 by Christian Schüler, christianschueler.at

import {sleep } from './sleep';

export class Gpio {
	constructor(x: number, y: string) {
		console.log('Running on Windows - only for development!');
	}
	static HIGH: number = 1;
	static LOW: number = 0;
	writeSync(x: number) {};
	readSync() {};
	async write(x: number) {
		await sleep(1);
		return;
	}
	async read(x: number) {
		await sleep(1);
		return;
	}
}