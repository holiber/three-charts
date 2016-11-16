import { Chart } from "./Chart";
import { IViewportParams, Viewport } from "./Viewport";
export declare enum INTERPOLATION_EVENT {
    STARTED = 0,
    FINISHED = 1,
}
/**
 * manage camera, and contains methods for transforming pixels to values
 */
export declare class InterpolatedViewport extends Viewport {
    interpolationInProgress: boolean;
    private scrollXAnimation;
    private scrollYAnimation;
    private zoomXAnimation;
    private zoomYAnimation;
    private ee;
    constructor(chart: Chart);
    onZoomInterpolation(cb: (zoomX: number, zoomY: number) => any): Function;
    onScrollInterpolation(cb: (options: IViewportParams) => any): Function;
    onInterpolation(cb: (options: IViewportParams) => any): Function;
    onInterpolationEvent(cb: (event: INTERPOLATION_EVENT) => any): Function;
    cameraIsMoving(): boolean;
    /**
     * setup zoom and scroll
     */
    private setParams(options, silent?);
    protected bindEvents(): void;
    private onDestroyHandler();
    private onScrollXHandler(changedProps);
    private onScrollYHandler();
    private onZoomXHandler();
    private onZoomYHandler();
}
