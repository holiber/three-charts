import Texture = THREE.Texture;
import { TIteralable, IIteralable } from "./interfaces";
export declare type TUid = number;
/**
 * project utils static class
 */
export declare class Utils {
    private static currentId;
    /**
     * deepMerge based on https://www.npmjs.com/package/deepmerge
     */
    static deepMerge<T>(obj1: T, obj2: T, mergeArrays?: boolean): T;
    /**
     * deepCopy based on JSON.stringify function
     * @deprecated
     */
    static deepCopy<T>(obj: T): T;
    /**
     *
     * @example
     * // returns "000015"
     * Utils.toFixed(15, 6);
     */
    static toFixed(num: number, digitsCount: number): string;
    /**
     * generate texture from canvas context
     * @example
     * 	// create texture with rect
     *  var texture = Utils.createTexture(20, 20, (ctx) => {ctx.fillRect(0, 0, 10, 10)});
     */
    static createTexture(width: number, height: number, fn: (ctx: CanvasRenderingContext2D) => void): Texture;
    /**
     * generate texture from canvas context with NearestFilter
     * @example
     * 	// create texture with rect
     *  var texture = Utils.createTexture(20, 20, (ctx) => {ctx.fillRect(0, 0, 10, 10)});
     */
    static createPixelPerfectTexture(width: number, height: number, fn: (ctx: CanvasRenderingContext2D) => void): Texture;
    /**
     * throw error
     */
    static error(msg: string): void;
    /**
     * @returns new unique id
     */
    static getUid(): TUid;
    static binarySearchClosestInd(arr: IIteralable[], num: number, key: string): number;
    static binarySearchClosest<ArrayItem>(arr: ArrayItem[], num: number, key: string): ArrayItem;
    static rectsIntersect(r1: number[], r2: number[]): boolean;
    /**!
     * @preserve $.parseColor
     * Copyright 2011 THEtheChad Elliott
     * Released under the MIT and GPL licenses.
     */
    static parseColor(color: string): number[];
    static getHexColor(str: string): number;
    static throttle(func: Function, ms: number): () => void;
    static msToTimeString(timestamp: number): string;
    static getRandomItem<T>(arr: Array<T>): T;
    static copyProps(srcObject: TIteralable, dstObject: TIteralable, props: TIteralable, excludeProps?: string[]): void;
}
