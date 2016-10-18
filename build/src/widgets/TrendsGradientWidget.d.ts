import Object3D = THREE.Object3D;
import { ChartState } from "../State";
import { ITrendOptions } from "../Trend";
import { TrendsWidget, TrendWidget } from "./TrendsWidget";
import { IScreenTransformOptions } from '../Screen';
import { TrendSegmentsManager } from '../TrendSegmentsManager';
export declare class TrendsGradientWidget extends TrendsWidget<TrendGradient> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendGradient;
}
export declare class TrendGradient extends TrendWidget {
    private gradient;
    private visibleSegmentsCnt;
    private segmentsIds;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(chartState: ChartState, trendName: string);
    protected bindEvents(): void;
    getObject3D(): Object3D;
    initGradient(): void;
    protected onZoomFrame(options: IScreenTransformOptions): void;
    protected onSegmentsAnimate(trendSegmentsManager: TrendSegmentsManager): void;
    private updateSegments();
    /**
     * setup gradient segment by segmentState
     * if segmentState is undefined, then collapse vertices to 0,0,0
     */
    private setupSegmentVertices(segmentInd, segmentState?);
    private toLocalX(xVal);
    private toLocalY(yVal);
}
