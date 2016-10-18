export declare type TChartColor = string | number;
export declare class ChartColor {
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
    constructor(color: TChartColor);
    set(color: TChartColor): void;
}
