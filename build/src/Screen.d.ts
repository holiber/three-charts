import PerspectiveCamera = THREE.PerspectiveCamera;
import Vector3 = THREE.Vector3;
import { ChartState } from "./State";
export interface IScreenTransformOptions {
    scrollXVal?: number;
    scrollYVal?: number;
    scrollX?: number;
    scrollY?: number;
    zoomX?: number;
    zoomY?: number;
}
/**
 * manage camera, and contains methods for transforming pixels to values
 */
export declare class Screen {
    camera: PerspectiveCamera;
    options: IScreenTransformOptions;
    private chartState;
    private scrollXAnimation;
    private scrollYAnimation;
    private zoomXAnimation;
    private zoomYAnimation;
    private currentScrollX;
    private currentScrollY;
    private currentZoomX;
    private currentZoomY;
    private ee;
    constructor(chartState: ChartState);
    getCameraSettings(): {
        FOV: number;
        aspect: number;
        near: number;
        far: number;
        z: number;
        x: number;
        y: number;
    };
    onZoomFrame(cb: (zoomX: number, zoomY: number) => void): Function;
    onScrollFrame(cb: (options: IScreenTransformOptions) => void): Function;
    onTransformationFrame(cb: (options: IScreenTransformOptions) => void): Function;
    cameraIsMoving(): boolean;
    private transform(options);
    private bindEvents();
    private onScrollXHandler(changedProps);
    private onScrollYHandler();
    private onZoomXHandler();
    private onZoomYHandler();
    /**
     *  returns offset in pixels from xAxis.range.zeroVal to scrollXVal
     */
    getPointOnXAxis(xVal: number): number;
    /**
     *  returns offset in pixels from yAxis.range.zeroVal to scrollYVal
     */
    getPointOnYAxis(yVal: number): number;
    /**
     *  returns offset in pixels from xAxis.range.zeroVal and from yAxis.range.zeroVal to scrollXVal and scrollYVal
     */
    getPointOnChart(xVal: number, yVal: number): Vector3;
    /**
     * returns value by offset in pixels from xAxis.range.zeroVal
     */
    getValueOnXAxis(x: number): number;
    /**
     *  convert value to pixels by using settings from xAxis.range
     */
    valueToPxByXAxis(xVal: number): number;
    /**
     *  convert value to pixels by using settings from yAxis.range
     */
    valueToPxByYAxis(yVal: number): number;
    /**
     *  convert pixels to value by using settings from xAxis.range
     */
    pxToValueByXAxis(xVal: number): number;
    /**
     *  convert pixels to value by using settings from yAxis.range
     */
    pxToValueByYAxis(yVal: number): number;
    /**
     *  returns scrollX value by screen scrollX coordinate
     */
    getValueByScreenX(x: number): number;
    /**
     *  returns scrollY value by screen scrollY coordinate
     */
    getValueByScreenY(y: number): number;
    /**
     *  returns screen scrollX value by screen scrollY coordinate
     */
    getScreenXByValue(xVal: number): number;
    /**
     * returns screen scrollX coordinate by offset in pixels from xAxis.range.zeroVal value
     */
    getScreenXByPoint(xVal: number): number;
    /**
     * returns offset in pixels from xAxis.range.zeroVal value by screen scrollX coordinate
     */
    getPointByScreenX(screenX: number): number;
    /**
     * returns offset in pixels from yAxis.range.zeroVal value by screen scrollY coordinate
     */
    getPointByScreenY(screenY: number): number;
    getTop(): number;
    getBottom(): number;
    getLeft(): number;
    getScreenRightVal(): number;
    getTopVal(): number;
    getBottomVal(): number;
    getCenterYVal(): number;
}
