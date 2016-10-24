import { TrendsWidget, TrendWidget } from './TrendsWidget';
import { Chart } from '../Chart';
import Object3D = THREE.Object3D;
import { IScreenTransformOptions } from '../Screen';
import { TrendSegmentsManager } from '../TrendSegmentsManager';
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
    private freeCandlesInds;
    private candlesPool;
    private candles;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(chartState: Chart, trendName: string);
    getObject3D(): Object3D;
    protected bindEvents(): void;
    private initObject();
    private setupCandles();
    private destroyCandles();
    private destroyCandle(segmentId);
    protected onZoomFrame(options: IScreenTransformOptions): void;
    protected onSegmentsAnimate(trendSegments: TrendSegmentsManager): void;
    /**
     * create or modify candle
     */
    private setupCandle(candleId, segmentState);
    toLocalX(xVal: number): number;
    toLocalY(yVal: number): number;
    toLocalVec(vec: Vector3): Vector3;
}
