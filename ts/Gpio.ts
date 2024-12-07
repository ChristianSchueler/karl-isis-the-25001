// Karl-Isis the 25001 Cocktail Mixing Bot (c) 2022-2024 by Christian Schüler, christianschueler.at

import {sleep } from './sleep.js';

export type High = 1;
export type Low = 0;
export type BinaryValue = High | Low;
export type ValueCallback = (err: Error | null | undefined, value: BinaryValue) => void;

export class Gpio {
	constructor(x: number, y: string, dir?: string, opts?: {}) {
		//console.log('Running on Windows - only for development!');
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
	};
	watch(callback: ValueCallback): void {};
}