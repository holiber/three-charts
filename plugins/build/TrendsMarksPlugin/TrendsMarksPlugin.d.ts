import { ChartPlugin, ChartWidget, TrendSegment, Chart, TColor, TEase } from 'three-charts';
import { TrendMarkWidget } from './TrendsMarksWidget';
export declare enum TREND_MARK_SIDE {
    TOP = 0,
    BOTTOM = 1,
}
export declare enum EVENTS {
    CHANGE = 0,
}
export declare enum TEXTURE_FILTER {
    AUTO = 0,
    LINEAR = 1,
    NEAREST = 2,
}
export declare type TTrendsMarksPluginOptions = {
    items: ITrendMarkOptions[];
};
export interface ITrendMarkOptions {
    trendName: string;
    xVal: number;
    title?: string;
    name?: string;
    color?: TColor;
    orientation?: TREND_MARK_SIDE;
    width?: number;
    height?: number;
    textureFilter?: TEXTURE_FILTER;
    /**
     * space between marks
     */
    margin?: number;
    /**
     * custom render function
     */
    onRender?: (trendMarkWidget: TrendMarkWidget, ctx: CanvasRenderingContext2D, chart: Chart) => any;
    ease?: TEase;
    easeSpeed?: number;
    userData?: any;
}
export declare class TrendsMarksPlugin extends ChartPlugin<TTrendsMarksPluginOptions> {
    static NAME: string;
    static providedWidgets: typeof ChartWidget[];
    private items;
    private rects;
    constructor(trendsMarksPluginOptions: TTrendsMarksPluginOptions);
    protected onInitialStateAppliedHandler(): void;
    protected onStateChangedHandler(): void;
    getItems(): {
        [name: string]: TrendMark;
    };
    getItem(markName: string): TrendMark;
    createMark(options: ITrendMarkOptions): void;
    onChange(cb: () => any): Function;
    protected bindEvents(): void;
    private onMarksChangeHandler();
    private calclulateMarksPositions();
    private createMarkRect(mark);
    private updateMarksSegments();
    private getTrendMarks(trendName);
}
export declare class TrendMark {
    options: ITrendMarkOptions;
    segment: TrendSegment;
    xVal: number;
    yVal: number;
    offset: number;
    row: number;
    protected chart: Chart;
    constructor(chart: Chart, options: ITrendMarkOptions);
    /**
     * only for internal usage
     */
    _setSegment(segment: TrendSegment): void;
    _setOffset(offset: number): void;
    _setRow(row: number): void;
}
