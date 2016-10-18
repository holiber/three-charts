import { ChartState } from "../State";
import Mesh = THREE.Mesh;
import { TrendWidget, TrendsWidget } from "./TrendsWidget";
import { ITrendOptions } from "../Trend";
import { TrendSegmentsManager } from "../TrendSegmentsManager";
export declare class TrendsIndicatorWidget extends TrendsWidget<TrendIndicator> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendIndicator;
}
export declare class TrendIndicator extends TrendWidget {
    private mesh;
    private segment;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(state: ChartState, trendName: string);
    getObject3D(): Mesh;
    onTrendChange(): void;
    private initObject();
    protected onTransformationFrame(): void;
    protected onSegmentsAnimate(segments: TrendSegmentsManager): void;
    private updatePosition();
}
