import { Chart } from "./Chart";
import Object3D = THREE.Object3D;
export interface IChartWidgetConstructor {
    new (): ChartWidget;
    widgetName: string;
}
/**
 * base class for all widgets
 * each widget must have widgetName static property
 */
export declare abstract class ChartWidget {
    static widgetName: string;
    protected chart: Chart;
    private unbindList;
    setupChart(chart: Chart): void;
    abstract onReadyHandler(): any;
    abstract getObject3D(): Object3D;
    protected bindEvent(...args: Array<Function | Function[]>): void;
    protected unbindEvents(): void;
}
