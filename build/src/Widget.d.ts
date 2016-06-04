import { ChartState } from "./State";
import Object3D = THREE.Object3D;
export interface IChartWidgetConstructor {
    new (chartState: ChartState): ChartWidget;
    widgetName: string;
    getDefaultOptions(): IChartWidgetOptions;
}
/**
 * base class for all widgets
 * widgets must not change state!
 * each widget must have widgetName static property
 */
export declare abstract class ChartWidget {
    static widgetName: string;
    protected chartState: ChartState;
    constructor(chartState: ChartState);
    abstract getObject3D(): Object3D;
    protected bindEvents(): void;
    static getDefaultOptions(): IChartWidgetOptions;
}
export interface IChartWidgetOptions {
    enabled: boolean;
}
