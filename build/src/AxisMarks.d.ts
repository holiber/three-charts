import { ChartState } from "./State";
import { AXIS_TYPE } from "./interfaces";
import { ITrendData } from "./Trend";
export interface IAxisMarkUpdateOptions {
    value: number;
    displayedValue?: string;
}
export interface IAxisMarkOptions extends IAxisMarkUpdateOptions {
    name?: string;
    title?: string;
    type?: string;
    lineColor?: string;
    lineWidth?: number;
    showValue?: boolean;
    stickToEdges?: boolean;
}
export declare class AxisMarks {
    private chartState;
    private axisType;
    private ee;
    private items;
    constructor(chartState: ChartState, axisType: AXIS_TYPE);
    protected bindEvents(): void;
    private onTrendChange(trendName, newData);
    getItems(): {
        [name: string]: AxisMark;
    };
    getItem(markName: string): AxisMark;
}
export declare class AxisMark {
    static typeName: string;
    options: IAxisMarkOptions;
    axisType: AXIS_TYPE;
    protected chartState: ChartState;
    protected renderOnTrendsChange: boolean;
    protected ee: EventEmitter2;
    constructor(chartState: ChartState, axisType: AXIS_TYPE, options: IAxisMarkOptions);
    protected bindEvents(): void;
    setOptions(newOptions: IAxisMarkUpdateOptions): void;
    getDisplayedVal(): string;
    onMarkCrossed(cb: (trendName: string, newData: ITrendData) => void): Function;
    onValueChange(cb: () => void): () => void;
    onDisplayedValueChange(cb: () => void): () => void;
}
export declare class AxisTimeleftMark extends AxisMark {
    static typeName: string;
    protected renderOnTrendsChange: boolean;
    getDisplayedVal(): string;
    protected bindEvents(): void;
    protected onTrendsChange(): void;
}
