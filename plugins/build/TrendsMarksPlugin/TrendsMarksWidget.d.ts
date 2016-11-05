import { Chart, TrendsWidget, TrendWidget } from 'three-charts';
import { TrendMark } from "./TrendsMarksPlugin";
import Object3D = THREE.Object3D;
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
    constructor(chart: Chart, trendName: string);
    getObject3D(): Object3D;
    protected bindEvents(): void;
    private getTrendsMarksPlugin();
    private onMarksChange();
    private createMarkWidget(mark);
    private destroyMarkWidget(markName);
    private onScreenTransformationEvent(event);
    protected onZoomFrame(): void;
    protected onSegmentsAnimate(): void;
}
export declare const DEFAULT_RENDERER: (marks: TrendMark[], ctx: CanvasRenderingContext2D, chart: Chart) => void;
