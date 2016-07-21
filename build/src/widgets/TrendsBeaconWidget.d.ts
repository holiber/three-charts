import { ChartState } from "../State";
import Mesh = THREE.Mesh;
import { TrendWidget, TrendsWidget } from "./TrendsWidget";
import { ITrendOptions } from "../Trend";
import { TrendSegments } from "../TrendSegments.ts";
/**
 * widget adds blinking beacon on trends end
 * activated when trend.hasBeacon = true
 */
export declare class TrendsBeaconWidget extends TrendsWidget<TrendBeacon> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendBeacon;
}
export declare class TrendBeacon extends TrendWidget {
    private mesh;
    private animated;
    private segment;
    private animation;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(state: ChartState, trendName: string);
    getObject3D(): Mesh;
    onTrendChange(): void;
    protected bindEvents(): void;
    private initObject();
    private animate();
    private stopAnimation();
    private static createTexture();
    protected onTransformationFrame(): void;
    protected onSegmentsAnimate(trendsSegments: TrendSegments): void;
    private onStateChange(changedProps);
    private updatePosition();
}
