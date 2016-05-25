import Texture = THREE.Texture;
import Color = THREE.Color;

export declare type TUid = number;

var deepmerge = require<Function>('deepmerge');

/**
 * project utils static class
 */
export class Utils {

	private static currentId: TUid = 1;

	/**
	 * deepMerge based on https://www.npmjs.com/package/deepmerge
	 */
	static deepMerge<T> (obj1: T, obj2: T) {
		return deepmerge(obj1, obj2) as T;
	}

	/**
	 * deepCopy based on JSON.stringify function
	 */
	static deepCopy<T> (obj: T) {
		return JSON.parse(JSON.stringify(obj)) as T;
	}

	/**
	 *
	 * @example
	 * // returns "000015"
	 * Utils.toFixed(15, 6);
	 */
	static toFixed(num: number, digitsCount: number): string {
		var maxDigits = 15;
		var result = '';
		var intVal = Math.floor(num);
		var intStr = intVal.toString();
		var lengthDiff = digitsCount - intStr.length;
		if (lengthDiff > 0 ) {
			result = (<any>'0').repeat(lengthDiff) + intStr;
		} else {
			result = intStr;
		}
		var afterPointDigitsCount = maxDigits - intStr.length;
		var afterPointStr = num.toString().split('.')[1];
		if (afterPointStr) {
			result += '.' + afterPointStr.substr(0, afterPointDigitsCount);
		}
		return result;
	}

	/**
	 * generate texture from canvas context
	 * @example
	 * 	// create texture with rect
	 *  var texture = Utils.createTexture(20, 20, (ctx) => {ctx.fillRect(0, 0, 10, 10)});
	 */
	static createTexture(width: number, height: number, fn: (ctx: CanvasRenderingContext2D) => void ): Texture {
		var canvas: HTMLCanvasElement = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var ctx = canvas.getContext('2d');
		fn(ctx);
		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;
		return texture;
	}

	/**
	 * generate texture from canvas context with NearestFilter
	 * @example
	 * 	// create texture with rect
	 *  var texture = Utils.createTexture(20, 20, (ctx) => {ctx.fillRect(0, 0, 10, 10)});
	 */
	static createPixelPerfectTexture(width: number, height: number, fn: (ctx: CanvasRenderingContext2D) => void ): Texture{
		var texture = this.createTexture(width, height, fn);
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		return texture;
	}

	/**
	 * throw error
	 */
	static error(msg: string) {
		console.error('Chart error: ' + msg);
		throw 'Chart: ' + msg;
	}

	/**
	 * @returns new unique id
	 */
	static getUid(): TUid {
		return this.currentId++;
	}
	
	static eq(num1: number, num2: number) {
		return Math.abs(num1 - num2) < 0.01
	}
	
	static gte(num1: number, num2: number) {
		return this.eq(num1, num2) || num1 > num2;
	}

	static lte(num1: number, num2: number) {
		return this.eq(num1, num2) || num1 < num2;
	}



	/**!
	 * @preserve $.parseColor
	 * Copyright 2011 THEtheChad Elliott
	 * Released under the MIT and GPL licenses.
	 */


// Parse hex/rgb{a} color syntax.
// @input string
// @returns array [r,g,b{,o}]
	static parseColor(color: string): number[] {

		var cache: any
			, p = parseInt // Use p as a byte saving reference to parseInt
			, color = color.replace(/\s\s*/g,'') // Remove all spaces
			;//var

		// Checks for 6 digit hex and converts string to integer
		if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color))
			cache = [p(cache[1], 16), p(cache[2], 16), p(cache[3], 16)];

		// Checks for 3 digit hex and converts string to integer
		else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color))
			cache = [p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17];

		// Checks for rgba and converts string to
		// integer/float using unary + operator to save bytes
		else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color))
			cache = [+cache[1], +cache[2], +cache[3], +cache[4]];

		// Checks for rgb and converts string to
		// integer/float using unary + operator to save bytes
		else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color))
			cache = [+cache[1], +cache[2], +cache[3]];

		// Otherwise throw an exception to make debugging easier
		else throw Error(color + ' is not supported by $.parseColor');

		// Performs RGBA conversion by default
		isNaN(cache[3]) && (cache[3] = 1);
		return cache;
		// Adds or removes 4th value based on rgba support
		// Support is flipped twice to prevent erros if
		// it's not defined
		//return cache.slice(0,3 + !!$.support.rgba);
	}
	
	static getHexColor(str: string): number {
		var rgb = this.parseColor(str);
		return (rgb[0] << (8 * 2)) + (rgb[1] << 8) + rgb[2];
	}

	static msToTimeString(timestamp: number) {
		var h = Math.floor(timestamp / 360000);
		var m =  Math.floor(timestamp / 60000);
		var s =  Math.floor(timestamp / 1000);
		return h + ':' + m + ':' + s;
	}
	
	static getRandomItem<T>(arr: Array<T>): T {
		var ind = Math.floor(Math.random() * arr.length);
		return arr[ind];
	}

}


console.log(Utils.msToTimeString(1000));