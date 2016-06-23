import Object3D = THREE.Object3D;
import { ChartState } from "../State";
import { TrendsWidget, TrendWidget } from "./TrendsWidget";
/**
 * widget for drawing trends marks for all trends
 */
export declare class TrendsMarksWidget extends TrendsWidget<TrendMarksWidget> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendMarksWidget;
}
/**
 * widget for drawing trend marks for one trend
 */
export declare class TrendMarksWidget extends TrendWidget {
    private object3D;
    private marksWidgets;
    constructor(chartState: ChartState, trendName: string);
    getObject3D(): Object3D;
    protected bindEvents(): void;
    private onMarksChange();
    private createMarkWidget(mark);
    protected onZoomFrame(): void;
    protected onSegmentsAnimate(): void;
}
