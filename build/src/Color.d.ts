export declare type TColor = string | number;
export declare class Color {
    /**!
     * @preserve $.parseColor
     * Copyright 2011 THEtheChad Elliott
     * Released under the MIT and GPL licenses.
     */
    /**
     * Parse hex/rgb{a} color syntax.
     * @input string
     * @returns array [r,g,b{,o}]
     */
    static parseColor(color: string): number[];
    r: number;
    g: number;
    b: number;
    a: number;
    value: number;
    hexStr: string;
    rgbaStr: string;
    constructor(color: TColor);
    static numberToHexStr(value: number): string;
    set(color: TColor): void;
    getTransparent(opacity: number): Color;
}
