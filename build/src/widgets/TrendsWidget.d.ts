import { ChartWidget } from "../Widget";
import Object3D = THREE.Object3D;
import { Chart } from "../Chart";
import { ITrendOptions, ITrendData, Trend } from "../Trend";
import { TrendSegmentsManager } from "../TrendSegmentsManager";
import { IScreenTransformOptions } from "../Screen";
export interface ITrendWidgetClass<TrendWidgetType> {
    new (chart: Chart, trendName: string): TrendWidgetType;
    widgetIsEnabled(trendOptions: ITrendOptions, chart: Chart): boolean;
}
/**
 * abstract manager class for all trends widgets
 */
export declare abstract class TrendsWidget<TrendWidgetType extends TrendWidget> extends ChartWidget {
    protected abstract getTrendWidgetClass(): ITrendWidgetClass<TrendWidgetType>;
    protected object3D: Object3D;
    protected widgets: {
        [trendName: string]: TrendWidgetType;
    };
    onReadyHandler(): void;
    protected bindEvents(): void;
    protected onTrendsChange(): void;
    private onTrendChange(trendName, changedOptions, newData);
    getObject3D(): Object3D;
    private createTrendWidget(trendName);
    private destroyTrendWidget(trendName);
}
/**
 * based class for all trends widgets
 */
export declare abstract class TrendWidget {
    protected chart: Chart;
    protected trendName: string;
    protected trend: Trend;
    protected unbindList: Function[];
    constructor(chart: Chart, trendName: string);
    abstract getObject3D(): Object3D;
    static widgetIsEnabled(trendOptions: ITrendOptions, chart: Chart): boolean;
    appendData(newData: ITrendData): void;
    prependData(newData: ITrendData): void;
    onTrendChange(changedOptions?: ITrendOptions): void;
    onDestroy(): void;
    protected onSegmentsAnimate(segments: TrendSegmentsManager): void;
    protected onZoomFrame(options: IScreenTransformOptions): void;
    protected onTransformationFrame(options: IScreenTransformOptions): void;
    protected onZoom(): void;
    protected bindEvents(): void;
    protected bindEvent(unbind: Function): void;
}
