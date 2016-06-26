import Texture = THREE.Texture;
import Color = THREE.Color;
import { TIteralable, IIteralable } from "./interfaces";
import { deepmerge, isPlainObject } from './deps';


export declare type TUid = number;

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
	 * @deprecated
	 */
	static deepCopy<T> (obj: T) {
		// TODO: use deepMerge function to copy
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
	
	// static eq(num1: number, num2: number) {
	// 	return Math.abs(num1 - num2) < 0.01
	// }
	//
	// static gte(num1: number, num2: number) {
	// 	return this.eq(num1, num2) || num1 > num2;
	// }
	//
	// static lte(num1: number, num2: number) {
	// 	return this.eq(num1, num2) || num1 < num2;
	// }

	static binarySearchClosestInd(arr: IIteralable[], num: number, key: string): number {
		var mid: number;
		var lo = 0;
		var hi = arr.length - 1;
		while (hi - lo > 1) {
			mid = Math.floor ((lo + hi) / 2);
			if (arr[mid][key] < num) {
				lo = mid;
			} else {
				hi = mid;
			}
		}
		if (num - arr[lo][key] <= arr[hi][key] - num) {
			return lo;
		}
		return hi;
	}
	
	static binarySearchClosest<ArrayItem>(arr: ArrayItem[], num: number, key: string): ArrayItem {
		let ind = this.binarySearchClosestInd(arr, num, key);
		return arr[ind];
	}


	static rectsIntersect(r1: number[], r2: number[]) {
		let [left1, top1, width1, height1] = r1;
		let [left2, top2, width2, height2] = r2;
		let [right1, right2, bottom1, bottom2] = [left1 + width1, left2 + width2, top1 + height1, top2 + height2];
		return !(left2 > right1 ||
			right2 < left1 ||
			top2 > bottom1 ||
			bottom2 < top1
		);
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

	static throttle(func: Function, ms: number) {

	var isThrottled = false,
		savedArgs: any,
		savedThis: any;

	function wrapper() {

		if (isThrottled) { // (2)
			savedArgs = arguments;
			savedThis = this;
			return;
		}

		func.apply(this, arguments); // (1)

		isThrottled = true;

		setTimeout(function() {
			isThrottled = false; // (3)
			if (savedArgs) {
				wrapper.apply(savedThis, savedArgs);
				savedArgs = savedThis = null;
			}
		}, ms);
	}

	return wrapper;
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

	static copyProps(srcObject: TIteralable, dstObject: TIteralable, props: TIteralable, excludeProps: string[] = []) {
		for (var key in props) {
			if (excludeProps.indexOf(key) !== -1) continue;
			if (srcObject[key] == void 0) continue;
			if (isPlainObject(props[key]) && dstObject[key] !== void 0) {
				this.copyProps(srcObject[key], dstObject[key], props[key])
			} else {
				dstObject[key] = this.deepCopy(srcObject[key]);
			}
		}
	}


}


console.log(Utils.msToTimeString(1000));