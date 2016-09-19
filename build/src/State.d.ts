import { ITrendOptions, Trend, ITrendData } from "./Trend";
import Vector3 = THREE.Vector3;
import { IChartWidgetOptions } from "./Widget";
import { Trends, ITrendsOptions } from "./Trends";
import { Screen } from "./Screen";
import { AxisMarks } from "./AxisMarks";
import { IAxisOptions, IAnimationsOptions } from "./interfaces";
import { Promise } from './deps';
/**
 * readonly computed state data
 * calculated after recalculateState() call
 * contains cached values
 */
export interface IChartStateComputedData {
    trends?: {
        maxXVal: number;
        minXVal: number;
    };
}
export interface IChartState {
    prevState?: IChartState;
    width?: number;
    height?: number;
    zoom?: number;
    xAxis?: IAxisOptions;
    yAxis?: IAxisOptions;
    animations?: IAnimationsOptions;
    trends?: ITrendsOptions;
    widgets?: {
        [widgetName: string]: IChartWidgetOptions;
    };
    cursor?: {
        dragMode?: boolean;
        x?: number;
        y?: number;
    };
    /**
     * use fps = 0 for no limits
     */
    autoRender?: {
        enabled?: boolean;
        fps?: number;
    };
    /**
     * by default 'WebGLRenderer'
     * also available 'CanvasRenderer'
     */
    renderer?: 'WebGLRenderer' | 'CanvasRenderer';
    autoResize?: boolean;
    controls?: {
        enabled: boolean;
    };
    autoScroll?: boolean;
    showStats?: boolean;
    backgroundColor?: number;
    backgroundOpacity?: number;
    computedData?: IChartStateComputedData;
    /**
     * overridden settings for single setState operation
     */
    operationState?: IChartState;
    [key: string]: any;
}
/**
 *  class for manage chart state, all state changes caused only by State.setState method
 */
export declare class ChartState {
    data: IChartState;
    trends: Trends;
    screen: Screen;
    xAxisMarks: AxisMarks;
    yAxisMarks: AxisMarks;
    /**
     * true then chartState was initialized and ready to use
     */
    private isReady;
    private ee;
    constructor(initialState: IChartState);
    /**
     * destroy state, use Chart.destroy to completely destroy chart
     */
    destroy(): void;
    onDestroy(cb: Function): Function;
    onInitialStateApplied(cb: (initialState: IChartState) => void): Function;
    onReady(cb: (initialState: IChartState) => void): Function;
    onChange(cb: (changedProps: IChartState) => void): Function;
    onTrendChange(cb: (trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => void): Function;
    onTrendsChange(cb: (trendsOptions: ITrendsOptions) => void): Function;
    onScrollStop(cb: () => void): Function;
    onScroll(cb: (scrollOptions: {
        deltaX: number;
    }) => void): Function;
    onZoom(cb: (changedProps: IChartState) => void): Function;
    onResize(cb: (changedProps: IChartState) => void): Function;
    getTrend(trendName: string): Trend;
    setState(newState: IChartState, eventData?: any, silent?: boolean): void;
    /**
     * recalculate all computed state props
     */
    private recalculateState(changedProps?);
    private getComputedData(changedProps?);
    private savePrevState(changedProps?);
    private emitChangedStateEvents(changedProps, eventData);
    private initListeners();
    private handleTrendsChange(changedTrends, newData);
    private recalculateXAxis(actualData, changedProps);
    private recalculateYAxis(actualData);
    zoom(zoomValue: number, origin?: number): Promise<void>;
    zoomToRange(range: number, origin?: number): Promise<void>;
    scrollToEnd(): Promise<void>;
    /**
     *  returns offset in pixels from xAxis.range.zeroVal to xVal
     */
    getPointOnXAxis(xVal: number): number;
    /**
     *  returns offset in pixels from yAxis.range.zeroVal to yVal
     */
    getPointOnYAxis(yVal: number): number;
    /**
     * returns value by offset in pixels from xAxis.range.zeroVal
     */
    getValueOnXAxis(x: number): number;
    /**
     *  convert value to pixels by using settings from xAxis.range
     */
    valueToPxByXAxis(xVal: number): number;
    /**
     *  convert value to pixels by using settings from yAxis.range
     */
    valueToPxByYAxis(yVal: number): number;
    /**
     *  convert pixels to value by using settings from xAxis.range
     */
    pxToValueByXAxis(xVal: number): number;
    /**
     *  convert pixels to value by using settings from yAxis.range
     */
    pxToValueByYAxis(yVal: number): number;
    /**
     *  returns x value by screen x coordinate
     */
    getValueByScreenX(x: number): number;
    /**
     *  returns y value by screen y coordinate
     */
    getValueByScreenY(y: number): number;
    /**
     *  returns screen x value by screen y coordinate
     */
    getScreenXByValue(xVal: number): number;
    /**
     *  returns screen y value by screen y coordinate
     */
    getScreenYByValue(yVal: number): number;
    /**
     * returns screen x coordinate by offset in pixels from xAxis.range.zeroVal value
     */
    getScreenXByPoint(xVal: number): number;
    /**
     * returns offset in pixels from xAxis.range.zeroVal value by screen x coordinate
     */
    getPointByScreenX(screenX: number): number;
    getPointOnChart(xVal: number, yVal: number): Vector3;
    getScreenLeftVal(): number;
    getScreenRightVal(): number;
    getPaddingRight(): number;
}
