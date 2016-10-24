import { Chart, IChartState } from "./Chart";
import { TrendSegmentsManager } from "./TrendSegmentsManager";
import { TChartColor } from './Color';
export interface IPrependPromiseExecutor {
    (requestedDataLength: number, resolve: (data: TTrendRawData) => void, reject: () => void): void;
}
export declare enum TREND_TYPE {
    LINE = 0,
    CANDLE = 1,
}
export declare type TTrendRawData = ITrendData | number[];
export interface ITrendItem {
    xVal: number;
    yVal: number;
    id?: number;
}
export interface ITrendData extends Array<ITrendItem> {
}
export interface ITrendTypeSettings {
    minSegmentLengthInPx?: number;
    maxSegmentLengthInPx?: number;
}
export interface ITrendOptions {
    enabled?: boolean;
    data?: ITrendData;
    dataset?: ITrendData | number[];
    name?: string;
    type?: TREND_TYPE;
    lineWidth?: number;
    lineColor?: TChartColor;
    backgroundColor?: TChartColor;
    hasIndicator?: boolean;
    hasBackground?: boolean;
    hasBeacon?: boolean;
    maxSegmentLength?: number;
    settingsForTypes?: {
        CANDLE?: ITrendTypeSettings;
        LINE?: ITrendTypeSettings;
    };
}
export declare class Trend {
    name: string;
    segmentsManager: TrendSegmentsManager;
    minXVal: number;
    minYVal: number;
    maxXVal: number;
    maxYVal: number;
    private chartState;
    private calculatedOptions;
    private prependRequest;
    private ee;
    constructor(chartState: Chart, trendName: string, initialState: IChartState);
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
    setOptions(options: ITrendOptions): void;
    onPrependRequest(cb: IPrependPromiseExecutor): Function;
    /**
     * shortcut for Chart.onTrendChange
     */
    onChange(cb: (changedOptions: ITrendOptions, newData: ITrendData) => void): Function;
    onDataChange(cb: (newData: ITrendData) => void): Function;
    private checkForPrependRequest();
    static prepareData(newData: TTrendRawData, currentData?: ITrendData, isPrepend?: boolean): ITrendData;
}
