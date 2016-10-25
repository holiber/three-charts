import { ChartWidget } from "../Widget";
import Object3D = THREE.Object3D;
/**
 * widget for shows marks on axis
 */
export declare class AxisMarksWidget extends ChartWidget {
    static widgetName: string;
    private object3D;
    private axisMarksWidgets;
    onReadyHandler(): void;
    private createAxisMark(axisMark);
    protected bindEvents(): void;
    private updateMarksPositions();
    getObject3D(): Object3D;
}
