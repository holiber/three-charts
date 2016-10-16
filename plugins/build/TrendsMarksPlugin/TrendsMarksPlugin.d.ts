import { ChartPlugin, ChartWidget, TrendSegment, ChartState } from 'three-chart';
export declare enum TREND_MARK_SIDE {
    TOP = 0,
    BOTTOM = 1,
}
export declare enum EVENTS {
    CHANGE = 0,
}
export declare type TTrendsMarksPluginOptions = {
    items: ITrendMarkOptions[];
};
export interface ITrendMarkOptions {
    trendName: string;
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
export declare class TrendsMarksPlugin extends ChartPlugin {
    static NAME: string;
    static pluginWidgets: typeof ChartWidget[];
    private items;
    private rects;
    constructor(trendsMarksPluginOptions: TTrendsMarksPluginOptions);
    protected onInitialStateApplied(): void;
    protected onStateChanged(): void;
    getOptions(): TTrendsMarksPluginOptions;
    getItems(): {
        [name: string]: TrendMark;
    };
    getItem(markName: string): TrendMark;
    createMark(options: ITrendMarkOptions): void;
    onChange(cb: () => any): Function;
    protected bindEvents(): void;
    protected onInitialStateAppliedHandler(): void;
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
    protected chartState: ChartState;
    constructor(chartState: ChartState, options: ITrendMarkOptions);
    /**
     * only for internal usage
     */
    _setSegment(segment: TrendSegment): void;
    _setOffset(offset: number): void;
    _setRow(row: number): void;
}
