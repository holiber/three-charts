import { Trend } from "./Trend";
import { ChartState, IChartState } from "./State";
import { ChartWidget } from "./Widget";
export declare const MAX_DATA_LENGTH: number;
export declare class Chart {
    state: ChartState;
    private $el;
    private renderer;
    private scene;
    private camera;
    private cameraInitialPosition;
    private widgets;
    private stats;
    static devicePixelRatio: number;
    static installedWidgets: {
        [name: string]: typeof ChartWidget;
    };
    constructor(state: IChartState);
    static installWidget<WidgetClass extends typeof ChartWidget>(Widget: WidgetClass): void;
    private init();
    render(time: number): void;
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
    private onCameraChangeHandler(x, y);
    private onScreenTransform(options);
    private autoscroll();
    private onScrollStop();
    private onMouseDown(ev);
    private onMouseUp(ev);
    private onMouseMove(ev);
    private onMouseWheel(ev);
    private onTouchMove(ev);
    private onTouchEnd(ev);
    /**
     * creates simple chart without animations and minimal widgets set
     */
    static createPreviewChart(userOptions: IChartState): Chart;
}
