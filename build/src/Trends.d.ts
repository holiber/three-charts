import { Trend, ITrendOptions } from "./Trend";
import { ChartState, IChartState } from "./State";
export interface ITrendsOptions {
    [trendName: string]: ITrendOptions;
}
/**
 * Trends collection
 */
export declare class Trends {
    items: {
        [name: string]: Trend;
    };
    calculatedOptions: ITrendsOptions;
    private chartState;
    constructor(state: ChartState, initialState: IChartState);
    getTrend(trendName: string): Trend;
    getEnabledTrends(): Trend[];
    getStartXVal(): number;
    getEndXVal(): number;
    getExtremumYVal(extremumIsMax: boolean, fromX?: number, toX?: number): number;
    getMaxYVal(fromX?: number, toX?: number): number;
    getMinYVal(fromX?: number, toX?: number): number;
}
