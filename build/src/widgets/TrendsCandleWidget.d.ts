import { TrendsWidget, TrendWidget } from './TrendsWidget';
import { ChartState } from '../State';
import Object3D = THREE.Object3D;
import { IScreenTransformOptions } from '../Screen';
import { TrendSegments } from '../TrendSegments.ts';
import Vector3 = THREE.Vector3;
import { ITrendOptions } from '../Trend';
/**
 * widget for drawing trends candles
 */
export declare class TrendsCandlesWidget extends TrendsWidget<TrendCandlesWidget> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendCandlesWidget;
}
export declare class TrendCandlesWidget extends TrendWidget {
    private scaleXFactor;
    private scaleYFactor;
    private object3D;
    private candles;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(chartState: ChartState, trendName: string);
    getObject3D(): Object3D;
    protected bindEvents(): void;
    private initObject();
    private setupCandles();
    private destroyCandles();
    private destroyCandle(segmentId);
    protected onZoomFrame(options: IScreenTransformOptions): void;
    protected onPointsMove(trendSegments: TrendSegments): void;
    private setupCandle(candleId, segmentState);
    toLocalX(xVal: number): number;
    toLocalY(yVal: number): number;
    toLocalVec(vec: Vector3): Vector3;
}
