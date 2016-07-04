import { ChartWidget } from "../Widget";
import { ChartState } from "../State";
import LineSegments = THREE.LineSegments;
/**
 * widget for drawing chart grid
 */
export declare class BorderWidget extends ChartWidget {
    static widgetName: string;
    private lineSegments;
    constructor(chartState: ChartState);
    getObject3D(): LineSegments;
}
