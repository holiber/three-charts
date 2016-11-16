import { ITrendOptions, Trend, ITrendData } from "./Trend";
import { TrendsManager, ITrendsOptions } from "./TrendsManager";
import { Viewport } from "./Viewport";
import { InterpolatedViewport } from "./InterpolatedViewport";
import { Promise } from './deps/deps';
import { ChartPlugin } from './Plugin';
import { TColor } from "./Color";
import { AnimationManager } from "./AnimationManager";
import { IAxisOptions, IAnimationsOptions } from "./interfaces";
/**
 * readonly computed state state
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
    trendDefaultState?: ITrendOptions;
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
    font?: {
        s?: string;
        m?: string;
        l?: string;
    };
    /**
     * set to false for smooth animations
     */
    enablePixelPerfectRender?: boolean;
    /**
     * buffer size for displayed segments
     * used by widgets
     */
    maxVisibleSegments?: number;
    autoResize?: boolean;
    controls?: {
        enabled: boolean;
    };
    autoScroll?: boolean;
    inertialScroll?: boolean;
    showStats?: boolean;
    backgroundColor?: TColor;
    computedData?: IChartStateComputedData;
    pluginsState?: {
        [pluginName: string]: any;
    };
    eventEmitterMaxListeners?: number;
}
/**
 *  all state changes caused only by Chart.setState method
 */
export declare class Chart {
    state: IChartState;
    plugins: {
        [pluginName: string]: ChartPlugin<any>;
    };
    trendsManager: TrendsManager;
    animationManager: AnimationManager;
    viewport: Viewport;
    interpolatedViewport: InterpolatedViewport;
    /**
     * true then state was initialized and ready to use
     */
    isReady: boolean;
    isDestroyed: boolean;
    private ee;
    constructor(initialState: IChartState, plugins?: ChartPlugin<any>[]);
    /**
     * destroy chart, use ChartView.destroy to completely destroy Chart
     */
    destroy(): void;
    onDestroy(cb: Function): Function;
    onInitialStateApplied(cb: (initialState: IChartState) => void): Function;
    onReady(cb: (initialState: IChartState) => void): Function;
    onChange(cb: (changedProps: IChartState) => void): Function;
    onTrendChange(cb: (trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => void): Function;
    onTrendsChange(cb: (trendsOptions: ITrendsOptions) => void): Function;
    onDragStateChanged(cb: (isDragMode: boolean, changedProps: IChartState) => void): Function;
    onScroll(cb: (scrollOptions: {
        deltaX: number;
    }) => void): Function;
    onZoom(cb: (changedProps: IChartState) => void): Function;
    onResize(cb: (changedProps: IChartState) => void): Function;
    onViewportChange(cb: (changedProps: IChartState) => void): Function;
    onPluginsStateChange(cb: (changedPluginsStates: {
        [pluginName: string]: Plugin;
    }) => any): Function;
    getTrend(trendName: string): Trend;
    render(): void;
    setState(newState: IChartState, eventData?: any, silent?: boolean): void;
    /**
     * recalculate all computed state props
     */
    private recalculateState(changedProps?);
    private getComputedData(changedProps?);
    private savePrevState(changedProps?);
    private emitChangedStateEvents(changedProps, eventData);
    /**
     * init plugins and save plugins params in initialState
     */
    private installPlugins(plugins, initialState);
    /**
     * returns plugin instance by plugin name
     * @example
     */
    getPlugin(pluginName: string): ChartPlugin<any>;
    private bindEvents();
    private handleTrendsChange(changedTrends, newData);
    private onDragStateChangedHandler(isDragMode);
    private recalculateXAxis(actualData, changedProps);
    private recalculateYAxis(actualData);
    zoom(zoomValue: number, origin?: number): Promise<void>;
    zoomToRange(range: number, origin?: number): Promise<void>;
    scrollToEnd(): Promise<void>;
}
