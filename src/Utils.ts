import Texture = THREE.Texture;
import Color = THREE.Color;
import { TIteralable, IIteralable } from "./interfaces";
import { isPlainObject } from './deps/deps';

function deepmerge(target: any, src: any, mergeArrays = true) {
	var array = Array.isArray(src);
	var dst: any = array && [] || {};

	if (array) {
		target = target || [];
		if (mergeArrays) {
			dst = dst.concat(target);
		}
		src.forEach(function(e: any, i: any) {
			if (typeof dst[i] === 'undefined') {
				dst[i] = e;
			} else if (typeof e === 'object') {
				dst[i] = deepmerge(target[i], e, mergeArrays);
			} else {
				if (target.indexOf(e) === -1) {
					dst.push(e);
				}
			}
		});
	} else {
		if (target && typeof target === 'object') {
			Object.keys(target).forEach(function (key) {
				dst[key] = target[key];
			})
		}
		Object.keys(src).forEach(function (key) {
			if (typeof src[key] !== 'object' || !src[key]) {
				dst[key] = src[key];
			}
			else {
				if (!target[key]) {
					dst[key] = src[key];
				} else {
					dst[key] = deepmerge(target[key], src[key], mergeArrays);
				}
			}
		});
	}

	return dst;
}



export declare type TUid = number;

/**
 * project utils static class
 */
export class Utils {

	private static currentId: TUid = 1;

	/**
	 * deepMerge based on https://www.npmjs.com/package/deepmerge
	 */
	static deepMerge<T> (obj1: T, obj2: T, mergeArrays?: boolean) {
		return deepmerge(obj1, obj2, mergeArrays) as T;
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

	static bindEvent() {

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
	static createNearestTexture(width: number, height: number, fn: (ctx: CanvasRenderingContext2D) => void ): Texture{
		var texture = this.createTexture(width, height, fn);
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		return texture;
	}

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
	 * throw error
	 */
	static warn(msg: string) {
		console.warn('Chart warning: ' + msg);
	}

	/**
	 * @returns new unique id
	 */
	static getUid(): TUid {
		return this.currentId++;
	}

	/**
	 * @returns distance between numbers
	 */
	static getDistance(num1: number, num2: number) {
		return Math.max(num1, num2) - Math.min(num1, num2);
	}

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

			setTimeout(function () {
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
