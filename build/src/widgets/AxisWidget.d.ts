import Object3D = THREE.Object3D;
import { ChartWidget } from "../Widget";
import { ChartState } from "../State";
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
    constructor(state: ChartState);
    bindEvents(): void;
    private onDestroy();
    private onScrollChange(x, y);
    private initAxis(orientation);
    getObject3D(): Object3D;
    private updateAxis(orientation);
    private onZoomFrame(options);
    static getDateStr(timestamp: number, gridParams: IGridParamsForAxis): string;
}
