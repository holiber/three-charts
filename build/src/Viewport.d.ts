import { Chart } from "./Chart";
export interface IViewportParams {
    scrollXVal?: number;
    scrollYVal?: number;
    scrollX?: number;
    scrollY?: number;
    zoomX?: number;
    zoomY?: number;
}
export declare class Viewport {
    params: IViewportParams;
    protected chart: Chart;
    constructor(chart: Chart);
    protected bindEvents(): void;
    protected updateParams(): void;
    getCameraSettings(): {
        FOV: number;
        aspect: number;
        near: number;
        far: number;
        z: number;
        x: number;
        y: number;
    };
    getWorldXByVal(xVal: number): number;
    getWorldYByVal(yVal: number): number;
    getWorldXByViewportX(viewportX: number): number;
    getWorldYByViewportY(viewportY: number): number;
    getValByWorldX(worldX: number): number;
    getValByWorldY(worldY: number): number;
    getValByViewportX(x: number): number;
    getValByViewportY(y: number): number;
    getViewportXByVal(xVal: number): number;
    getViewportYByVal(yVal: number): number;
    getViewportXByWorldX(worldX: number): number;
    valToPxByXAxis(val: number): number;
    valToPxByYAxis(val: number): number;
    pxToValByXAxis(pixelsCount: number): number;
    pxToValByYAxis(pixelsCount: number): number;
    getTop(): number;
    getRight(): number;
    getBottom(): number;
    getLeft(): number;
    getTopVal(): number;
    getRightVal(): number;
    getBottomVal(): number;
    getLeftVal(): number;
}
