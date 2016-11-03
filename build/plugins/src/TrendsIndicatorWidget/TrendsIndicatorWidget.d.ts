import Mesh = THREE.Mesh;
import { TrendSegmentsManager, Chart, TrendWidget, TrendsWidget, ITrendOptions } from "three-charts";
export declare class TrendsIndicatorWidget extends TrendsWidget<TrendIndicator> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendIndicator;
}
export declare class TrendIndicator extends TrendWidget {
    private mesh;
    private segment;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(chart: Chart, trendName: string);
    getObject3D(): Mesh;
    onTrendChange(): void;
    private initObject();
    protected onTransformationFrame(): void;
    protected onSegmentsAnimate(segments: TrendSegmentsManager): void;
    private updatePosition();
}
