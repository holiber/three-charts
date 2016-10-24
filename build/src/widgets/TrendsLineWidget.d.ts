import { Chart } from "../Chart";
import { TrendsWidget, TrendWidget } from "./TrendsWidget";
import { TrendSegmentsManager } from "../TrendSegmentsManager";
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
    private vertices;
    private freeSegmentsInds;
    private displayedSegments;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    constructor(chartState: Chart, trendName: string);
    getObject3D(): LineSegments;
    protected bindEvents(): void;
    private initLine();
    private setupSegments();
    private setupSegment(segmentId, segmentState);
    private destroySegments();
    private destroySegment(segmentId);
    protected onZoomFrame(options: IScreenTransformOptions): void;
    protected onSegmentsAnimate(trendSegments: TrendSegmentsManager): void;
    private toLocalX(xVal);
    private toLocalY(yVal);
    private toLocalVec(vec);
}
