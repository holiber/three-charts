import { Trend } from "./Trend";
import Renderer = THREE.Renderer;
import { ChartState, IChartState } from "./State";
import { ChartWidget } from "./Widget";
export declare const MAX_DATA_LENGTH: number;
export declare class Chart {
    state: ChartState;
    isStopped: boolean;
    isDestroyed: boolean;
    private $el;
    private renderer;
    private scene;
    private camera;
    private cameraInitialPosition;
    private widgets;
    private stats;
    private zoomThrottled;
    static devicePixelRatio: number;
    static installedWidgets: {
        [name: string]: typeof ChartWidget;
    };
    static renderers: {
        [rendererName: string]: Renderer;
    };
    constructor(state: IChartState);
    static installWidget<WidgetClass extends typeof ChartWidget>(Widget: WidgetClass): void;
    private init();
    private renderLoop();
    render(): void;
    stop(): void;
    run(): void;
    /**
     * call to destroy chart an init garbage collection
     */
    destroy(): void;
    getState(): IChartState;
    /**
     * shortcut for Chart.state.getTrend
     */
    getTrend(trendName: string): Trend;
    /**
     * shortcut for Chart.state.setState
     */
    setState(state: IChartState): void;
    private bindEvents();
    private unbindEvents();
    private onScreenTransform(options);
    private autoscroll();
    private onScrollStop();
    private onMouseDown(ev);
    private onMouseUp(ev);
    private onMouseMove(ev);
    private onMouseWheel(ev);
    private onTouchMove(ev);
    private onTouchEnd(ev);
    private zoom(zoomValue, zoomOrigin);
    /**
     * creates simple chart without animations and minimal widgets set
     */
    static createPreviewChart(userOptions: IChartState): Chart;
}
