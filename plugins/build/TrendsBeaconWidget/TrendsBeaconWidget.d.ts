import Mesh = THREE.Mesh;
import { Chart, TrendsWidget, TrendWidget, TrendSegmentsManager, ITrendOptions } from 'three-charts';
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
    constructor(chart: Chart, trendName: string);
    getObject3D(): Mesh;
    onTrendChange(): void;
    protected bindEvents(): void;
    private initObject();
    private animate();
    private stopAnimation();
    private static createTexture();
    protected onTransformationFrame(): void;
    protected onSegmentsAnimate(trendsSegments: TrendSegmentsManager): void;
    private onStateChange(changedProps);
    private updatePosition();
}
