import { ChartState, IChartState } from "./State";
import { ITrendMarkOptions, TrendMarks } from "./TrendMarks";
import { TrendPoints } from "./TrendPoints";
export interface IPrependPromiseExecutor {
    (requestedDataLength: number, resolve: (data: TTrendRawData) => void, reject: () => void): void;
}
export declare type TTrendRawData = ITrendData | number[];
export interface ITrendItem {
    xVal: number;
    yVal: number;
    id?: number;
}
export interface ITrendData extends Array<ITrendItem> {
}
export interface ITrendOptions {
    enabled?: boolean;
    data?: ITrendData;
    dataset?: ITrendData | number[];
    name?: string;
    lineWidth?: number;
    lineColor?: number;
    hasGradient?: boolean;
    hasIndicator?: boolean;
    hasBeacon?: boolean;
    marks?: ITrendMarkOptions[];
    onPrependRequest?: IPrependPromiseExecutor;
}
export declare class Trend {
    name: string;
    marks: TrendMarks;
    points: TrendPoints;
    private chartState;
    private calculatedOptions;
    private prependRequest;
    private ee;
    private canRequestPrepend;
    constructor(chartState: ChartState, trendName: string, initialState: IChartState);
    private onInitialStateApplied();
    private bindEvents();
    getCalculatedOptions(): ITrendOptions;
    appendData(rawData: TTrendRawData): void;
    prependData(rawData: TTrendRawData): void;
    private changeData(allData, newData);
    getData(fromX?: number, toX?: number): ITrendData;
    getFirstItem(): ITrendItem;
    getLastItem(): ITrendItem;
    getOptions(): ITrendOptions;
    onPrependRequest(cb: IPrependPromiseExecutor): Function;
    /**
     * shortcut for ChartState.onTrendChange
     */
    onChange(cb: (changedOptions: ITrendOptions, newData: ITrendData) => void): Function;
    onDataChange(cb: (newData: ITrendData) => void): Function;
    private checkForPrependRequest();
    static prepareData(newData: TTrendRawData, currentData?: ITrendData, isPrepend?: boolean): ITrendData;
}
