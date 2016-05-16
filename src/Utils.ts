import Texture = THREE.Texture;

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
		var numStr = String(num);
		var lengthDiff = digitsCount - numStr.length;
		if (lengthDiff > 0 ) {
			return (<any>'0').repeat(lengthDiff) + numStr as string;
		}
		return numStr;
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
	 * throw error
	 */
	static error(msg: string) {
		throw 'Chart: ' + msg;
	}

	/**
	 * @returns new unique id
	 */
	static getUid(): TUid {
		return this.currentId++;
	}
	
}