import { ChartWidget } from "../Widget";
import LineSegments = THREE.LineSegments;
/**
 * widget for drawing chart grid
 */
export declare class BorderWidget extends ChartWidget {
    static widgetName: string;
    private lineSegments;
    onReadyHandler(): void;
    getObject3D(): LineSegments;
}
