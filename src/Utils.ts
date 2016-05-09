import Texture = THREE.Texture;

var deepmerge = require<Function>('deepmerge');

export class Utils {

	static deepMerge<T> (obj1: T, obj2: T) {
		return deepmerge(obj1, obj2) as T;
	}

	static toFixed(num: number, digitsCount: number): string {
		var numStr = String(num);
		var lengthDiff = digitsCount - numStr.length;
		if (lengthDiff > 0 ) {
			return (<any>'0').repeat(lengthDiff) + numStr as string;
		}
		return numStr;
	}
	
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

	static error(msg: string) {
		throw 'Chart: ' + msg;
	}

	// static scaleToInt(num: number): [number, number] {
	// 	var afterPoint = Number(String(num % 1).split('.')[1]);
	// 	if (!afterPoint) return [num, 1];
	// 	afterPoint = afterPoint.toString().slice(0, 5);
	// 	var beforePoint = parseInt(String(num));
	// 	var afterPointLength = String(afterPoint).length;
	// 	return [beforePoint * Math.pow(10, afterPointLength) + afterPoint, 1 / Math.pow(10, afterPointLength)];
	// }
}