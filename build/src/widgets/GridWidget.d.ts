import { ChartWidget } from "../Widget";
import LineSegments = THREE.LineSegments;
import { IAxisOptions } from "../interfaces";
export interface IGridParamsForAxis {
    start: number;
    end: number;
    step: number;
    stepInPx: number;
    length: number;
    segmentsCount: number;
}
/**
 * widget for drawing chart grid
 */
export declare class GridWidget extends ChartWidget {
    static widgetName: string;
    private lineSegments;
    private gridSizeH;
    private gridSizeV;
    private isDestroyed;
    onReadyHandler(): void;
    bindEvents(): void;
    private initGrid();
    private updateGrid();
    private getHorizontalLineSegment(yVal, scrollXVal, scrollYVal);
    private getVerticalLineSegment(xVal, scrollXVal, scrollYVal);
    private onZoomFrame(options);
    static getGridParamsForAxis(axisOptions: IAxisOptions, axisWidth: number, zoom: number): IGridParamsForAxis;
    getObject3D(): LineSegments;
}
