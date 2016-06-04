import { ChartState } from "../State";
import Mesh = THREE.Mesh;
import { TrendWidget, TrendsWidget } from "./TrendsWidget";
import { ITrendOptions } from "../Trend";
import { TrendPoints } from "../TrendPoints";
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
    private point;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(state: ChartState, trendName: string);
    getObject3D(): Mesh;
    protected bindEvents(): void;
    private initObject();
    private animate();
    private static createTexture();
    protected onTransformationFrame(): void;
    protected onPointsMove(trendPoints: TrendPoints): void;
    private updatePosition();
}
