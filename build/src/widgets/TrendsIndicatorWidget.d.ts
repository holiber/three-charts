import { ChartState } from "../State";
import Mesh = THREE.Mesh;
import { TrendWidget, TrendsWidget } from "./TrendsWidget";
import { ITrendOptions } from "../Trend";
import { TrendPoints } from "../TrendPoints";
export declare class TrendsIndicatorWidget extends TrendsWidget<TrendIndicator> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendIndicator;
}
export declare class TrendIndicator extends TrendWidget {
    private mesh;
    private point;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(state: ChartState, trendName: string);
    getObject3D(): Mesh;
    onTrendChange(): void;
    private initObject();
    protected onTransformationFrame(): void;
    protected onPointsMove(animationState: TrendPoints): void;
    private updatePosition();
}
