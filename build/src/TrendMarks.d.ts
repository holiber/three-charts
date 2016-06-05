import { ChartState } from "./State";
import { Trend } from "./Trend";
import { TrendPoint } from "./TrendPoints";
export declare enum TREND_MARK_SIDE {
    TOP = 0,
    BOTTOM = 1,
}
export interface ITrendMarkOptions {
    value: number;
    name?: string;
    title?: string;
    description?: string;
    icon?: string;
    iconColor?: string;
    orientation?: TREND_MARK_SIDE;
}
export declare class TrendMarks {
    private chartState;
    private ee;
    private trend;
    private items;
    constructor(chartState: ChartState, trend: Trend);
    private bindEvents();
    private onTrendChange(changedOptions);
    onChange(cb: () => void): Function;
    private updateMarksPoints();
    private onMarksChange();
    createMark(options: ITrendMarkOptions): void;
    getItems(): {
        [name: string]: TrendMark;
    };
    getItem(markName: string): TrendMark;
}
export declare class TrendMark {
    options: ITrendMarkOptions;
    point: TrendPoint;
    protected trend: Trend;
    protected chartState: ChartState;
    protected renderOnTrendsChange: boolean;
    protected ee: EventEmitter2;
    constructor(chartState: ChartState, options: ITrendMarkOptions, trend: Trend);
    onAnimationFrame(cb: () => void): Function;
    /**
     * only for internal usage
     */
    setPoint(point: TrendPoint): void;
}
