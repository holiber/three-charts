import { Chart, TrendsWidget, TrendWidget, TRANSFORMATION_EVENT } from 'three-charts';
import { TrendMark } from "./TrendsMarksPlugin";
import Mesh = THREE.Mesh;
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
/**
 * widget for drawing one trend mark
 */
export declare class TrendMarkWidget {
    mark: TrendMark;
    private chart;
    private markMesh;
    constructor(chart: Chart, trendMark: TrendMark);
    protected initObject(): void;
    getObject3D(): Mesh;
    onSegmentsAnimate(): void;
    onZoomFrameHandler(): void;
    onScreenTransformationEventHandler(event: TRANSFORMATION_EVENT): void;
    private updatePosition();
    private show();
}
export declare const DEFAULT_RENDERER: (trendMarkWidget: TrendMarkWidget, ctx: CanvasRenderingContext2D, chart: Chart) => void;
