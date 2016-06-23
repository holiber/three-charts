import { ChartState } from "../State";
import { TrendsWidget, TrendWidget } from "./TrendsWidget";
import { TrendSegments } from "../TrendSegments.ts";
import LineSegments = THREE.LineSegments;
import { IScreenTransformOptions } from "../Screen";
import { ITrendOptions } from '../Trend';
/**
 * widget for drawing trends lines
 */
export declare class TrendsLineWidget extends TrendsWidget<TrendLine> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendLine;
}
export declare class TrendLine extends TrendWidget {
    private material;
    private lineSegments;
    private scaleXFactor;
    private scaleYFactor;
    private vertices;
    private displayedSegments;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(chartState: ChartState, trendName: string);
    getObject3D(): LineSegments;
    protected bindEvents(): void;
    private initLine();
    private setupSegments();
    private setupSegment(segmentId, segmentState);
    private destroySegments();
    private destroySegment(segmentId);
    protected onZoomFrame(options: IScreenTransformOptions): void;
    protected onSegmentsAnimate(trendSegments: TrendSegments): void;
    private toLocalX(xVal);
    private toLocalY(yVal);
    private toLocalVec(vec);
}
