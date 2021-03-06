import Object3D = THREE.Object3D;
import { ChartWidget } from "../Widget";
import { IGridParamsForAxis } from "./GridWidget";
/**
 * widget for drawing axis
 */
export declare class AxisWidget extends ChartWidget {
    static widgetName: string;
    private isDestroyed;
    private object3D;
    private axisXObject;
    private axisYObject;
    private updateAxisXRequest;
    onReadyHandler(): void;
    bindEvents(): void;
    private onDestroy();
    private onScrollChange(x, y);
    private onResize();
    private setupAxis(orientation);
    getObject3D(): Object3D;
    private updateAxis(orientation);
    private onZoomFrame(options);
    static getDateStr(timestamp: number, gridParams: IGridParamsForAxis): string;
}
