import { ChartState } from "./State";
import { Trend } from "./Trend";
import { TrendSegment } from "./TrendSegments";
export declare enum TREND_MARK_SIDE {
    TOP = 0,
    BOTTOM = 1,
}
export declare enum EVENTS {
    CHANGE = 0,
}
export interface ITrendMarkOptions {
    value: number;
    name?: string;
    title?: string;
    description?: string;
    descriptionColor?: string;
    icon?: string;
    iconColor?: string;
    orientation?: TREND_MARK_SIDE;
    width?: number;
    height?: number;
    /**
     * min distance between trend and mark
     */
    offset?: number;
    /**
     * space between marks
     */
    margin?: number;
}
export declare class TrendMarks {
    private chartState;
    private ee;
    private trend;
    private items;
    private rects;
    constructor(chartState: ChartState, trend: Trend);
    private bindEvents();
    private onTrendChange(changedOptions);
    onChange(cb: () => void): Function;
    private updateMarksSegments();
    private onMarksChange();
    createMark(options: ITrendMarkOptions): void;
    getItems(): {
        [name: string]: TrendMark;
    };
    getItem(markName: string): TrendMark;
    private calclulateMarksPositions();
    private createMarkRect(mark);
}
export declare class TrendMark {
    options: ITrendMarkOptions;
    segment: TrendSegment;
    xVal: number;
    yVal: number;
    offset: number;
    row: number;
    protected trend: Trend;
    protected chartState: ChartState;
    constructor(chartState: ChartState, options: ITrendMarkOptions, trend: Trend);
    /**
     * only for internal usage
     */
    _setSegment(segment: TrendSegment): void;
    _setOffset(offset: number): void;
    _setRow(row: number): void;
}
