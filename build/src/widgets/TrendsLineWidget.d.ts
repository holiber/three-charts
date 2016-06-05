import { ChartState } from "../State";
import { TrendsWidget, TrendWidget } from "./TrendsWidget";
import { TrendPoints } from "../TrendPoints";
import LineSegments = THREE.LineSegments;
import { IScreenTransformOptions } from "../Screen";
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
    constructor(chartState: ChartState, trendName: string);
    getObject3D(): LineSegments;
    private initLine();
    protected onZoomFrame(options: IScreenTransformOptions): void;
    protected onPointsMove(animationState: TrendPoints): void;
    private toLocalX(xVal);
    private toLocalY(yVal);
    private toLocalVec(vec);
}
