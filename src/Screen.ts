import PerspectiveCamera = THREE.PerspectiveCamera;
import Vector3 = THREE.Vector3;
import {Chart, IChartState} from "./Chart";
import { EventEmitter } from './EventEmmiter';
import { Animation } from './AnimationManager';

export interface IScreenTransformOptions {
	scrollXVal?: number,
	scrollYVal?: number,
	scrollX?: number,
	scrollY?: number,
	zoomX?: number,
	zoomY?: number
}

const SCREEN_EVENTS = {
	ZOOM_FRAME: 'zoomFrame',
	SCROLL_FRAME: 'scrollFrame',
	TRANSFORMATION_FRAME: 'transformationFrame'
};

/**
 * manage camera, and contains methods for transforming pixels to values
 */
export class Screen {
	// TODO: make own interface for Chart and Screen for calculating screen positions

	options: IScreenTransformOptions = {scrollXVal: 0, scrollX: 0, scrollYVal: 0, scrollY: 0, zoomX: 1, zoomY: 1};
	private chart: Chart;
	private scrollXAnimation: Animation<number>;
	private scrollYAnimation: Animation<number>;
	private zoomXAnimation: Animation<number>;
	private zoomYAnimation: Animation<number>;
	private ee: EventEmitter;

	constructor(chartState: Chart) {
		this.chart = chartState;
		var {width: w, height: h} = chartState.state;
		this.ee = new EventEmitter();
		this.transform({
			scrollY: this.valueToPxByYAxis(this.chart.state.yAxis.range.scroll),
			zoomY: 1
		});
		this.bindEvents();

		//camera.position.z = 1500;
	}
	
	getCameraSettings() {

		var {width: w, height: h} = this.chart.state;

		// settings for pixel-perfect camera
		var FOV = 75;
		var vFOV = FOV * (Math.PI / 180);
		
		return {
			FOV: FOV,
			aspect: w / h,
			near: 0.1,
			far: 5000,
			z: h / (2 * Math.tan(vFOV / 2) ),

			// move 0,0 to left-bottom corner
			x: w / 2,
			y: h / 2
		}
	}

	onZoomFrame(cb: (zoomX: number, zoomY: number) => void): Function {
		return this.ee.subscribe(SCREEN_EVENTS.ZOOM_FRAME, cb);
	}

	onScrollFrame(cb: (options: IScreenTransformOptions) => void): Function {
		return this.ee.subscribe(SCREEN_EVENTS.SCROLL_FRAME, cb);
	}

	onTransformationFrame(cb: (options: IScreenTransformOptions) => void): Function {
		return this.ee.subscribe(SCREEN_EVENTS.TRANSFORMATION_FRAME, cb);
	}

	cameraIsMoving(): boolean {
		return !!(
			this.scrollXAnimation && !this.scrollXAnimation.isFinished ||
				this.zoomXAnimation && !this.zoomXAnimation.isFinished
		);
	}

	/**
	 * setup zoom and scroll
	 */
	private transform (options: IScreenTransformOptions, silent = false) {
		var {scrollX, scrollY, zoomX, zoomY} = options;
		
		if (scrollX != void 0) this.options.scrollX = scrollX;
		if (scrollY != void 0) this.options.scrollY = scrollY;
		if (zoomX != void 0) this.options.zoomX = zoomX;
		if (zoomY != void 0) this.options.zoomY = zoomY;

		if (scrollX != void 0 || zoomX) {
			options.scrollXVal = this.pxToValueByXAxis(scrollX != void 0 ? scrollX : this.options.scrollX);
			this.options.scrollXVal = options.scrollXVal;
		}

		if (scrollY != void 0 || zoomY) {
			options.scrollYVal = this.pxToValueByYAxis(scrollY != void 0 ? scrollY : this.options.scrollY);
			this.options.scrollYVal = options.scrollYVal;
		}

		if (silent) return;

		this.ee.emit(SCREEN_EVENTS.TRANSFORMATION_FRAME, options);

		let scrollEventNeeded = options.scrollXVal != void 0 || options.scrollYVal != void 0;
		if (scrollEventNeeded) this.ee.emit(SCREEN_EVENTS.SCROLL_FRAME, options);

		let zoomEventNeeded = options.zoomX != void 0 || options.zoomY != void 0;
		if (zoomEventNeeded) this.ee.emit(SCREEN_EVENTS.ZOOM_FRAME, options);
	}


	private bindEvents() {
		var state = this.chart;

		// handle scroll and zoom
		state.onChange((changedProps) => {
			if (changedProps.xAxis && changedProps.xAxis.range) {
				if (changedProps.xAxis.range.scroll != void 0) this.onScrollXHandler(changedProps);
				if (changedProps.xAxis.range.zoom) this.onZoomXHandler();
			}
			if (changedProps.yAxis && changedProps.yAxis.range){
				if (changedProps.yAxis.range.scroll != void 0) this.onScrollYHandler();
				if (changedProps.yAxis.range.zoom) this.onZoomYHandler();
			}
		});
		state.onDestroy(() => this.onDestroyHandler());
	}

	private onDestroyHandler() {
		this.ee.removeAllListeners();
	}

	private onScrollXHandler(changedProps: IChartState) {
		let chart = this.chart;
		let isDragMode = chart.state.cursor.dragMode;
		let animations =  chart.state.animations;
		let zoomXChanged = changedProps.xAxis.range.zoom;
		let isAutoscroll = chart.state.autoScroll && !isDragMode && !zoomXChanged;
		let time = isAutoscroll ? animations.autoScrollSpeed : animations.zoomSpeed;
		let ease = isAutoscroll ? animations.autoScrollEase : animations.zoomEase;
		let range = chart.state.xAxis.range;
		let targetX = range.scroll * range.scaleFactor * range.zoom;

		if (this.scrollXAnimation) this.scrollXAnimation.stop();

		this.scrollXAnimation = chart.animationManager.animate(time, ease)
			.from(this.options.scrollX)
			.to(targetX)
			.onTick((value) => {
				this.transform({scrollX: value});
			});
	}

	private onScrollYHandler() {
		let chart = this.chart;
		let animations =  chart.state.animations;
		let range = chart.state.yAxis.range;
		let targetY = range.scroll * range.scaleFactor * range.zoom;

		if (this.scrollYAnimation) this.scrollYAnimation.stop();

		this.scrollYAnimation = chart.animationManager.animate(animations.zoomSpeed, animations.zoomEase)
			.from(this.options.scrollY)
			.to(targetY)
			.onTick((value) => {
				this.transform({scrollY: value});
			});
	}


	private onZoomXHandler() {
		let chart = this.chart;
		let animations =  chart.state.animations;
		let targetZoom = chart.state.xAxis.range.zoom;
		if (this.zoomXAnimation) this.zoomXAnimation.stop();

		this.zoomXAnimation = chart.animationManager
			.animate(animations.zoomSpeed, animations.zoomEase)
			.from(this.options.zoomX)
			.to(targetZoom)
			.onTick((value) => {
				this.transform({zoomX: value});
			});
	}


	private onZoomYHandler() {
		let chart = this.chart;
		let targetZoom = chart.state.yAxis.range.zoom;
		let animations =  chart.state.animations;
		if (this.zoomYAnimation) this.zoomYAnimation.stop();

		this.zoomYAnimation = chart.animationManager
			.animate(animations.zoomSpeed, animations.zoomEase)
			.from(this.options.zoomY)
			.to(targetZoom)
			.onTick((value) => {
				this.transform({zoomY: value});
			});
	}


	/**
	 *  returns offset in pixels from xAxis.range.zeroVal to scrollXVal
	 */
	getPointOnXAxis(xVal: number): number {
		var {scaleFactor, zeroVal} = this.chart.state.xAxis.range;
		var zoom = this.options.zoomX;
		return (xVal - zeroVal) * scaleFactor * zoom;
	}

	/**
	 *  returns offset in pixels from yAxis.range.zeroVal to scrollYVal
	 */
	getPointOnYAxis(yVal: number): number {
		var {scaleFactor, zeroVal} =  this.chart.state.yAxis.range;
		var zoom = this.options.zoomY;
		return (yVal - zeroVal) * scaleFactor * zoom;
	}

	/**
	 *  returns offset in pixels from xAxis.range.zeroVal and from yAxis.range.zeroVal to scrollXVal and scrollYVal
	 */
	getPointOnChart(xVal: number, yVal: number): Vector3 {
		return new Vector3(this.getPointOnXAxis(xVal), this.getPointOnYAxis(yVal), 0);
	}
	
	/**
	 * returns value by offset in pixels from xAxis.range.zeroVal
	 */
	getValueOnXAxis(x: number): number {
		return this.chart.state.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
	}


	/**
	 *  convert value to pixels by using settings from xAxis.range
	 */
	valueToPxByXAxis(xVal: number) {
		return xVal * this.chart.state.xAxis.range.scaleFactor * this.options.zoomX;
	}


	/**
	 *  convert value to pixels by using settings from yAxis.range
	 */
	valueToPxByYAxis(yVal: number) {
		return yVal * this.chart.state.yAxis.range.scaleFactor * this.options.zoomY;
	}
	
	/**
	 *  convert pixels to value by using settings from xAxis.range
	 */
	pxToValueByXAxis(xVal: number) {
		return xVal / this.chart.state.xAxis.range.scaleFactor / this.options.zoomX;
	}


	/**
	 *  convert pixels to value by using settings from yAxis.range
	 */
	pxToValueByYAxis(yVal: number) {
		return yVal / this.chart.state.yAxis.range.scaleFactor / this.options.zoomY;
	}


	/**
	 *  returns scrollX value by screen scrollX coordinate
	 */
	getValueByScreenX(x: number): number {
		return this.chart.state.xAxis.range.zeroVal + this.options.scrollXVal + this.pxToValueByXAxis(x);
	}
	
	
	/**
	 *  returns scrollY value by screen scrollY coordinate
	 */
	getValueByScreenY(y: number): number {
		return this.chart.state.yAxis.range.zeroVal + this.options.scrollYVal + this.pxToValueByYAxis(y);
	}
	
	//
	/**
	 *  returns screen scrollX value by screen scrollY coordinate
	 */
	getScreenXByValue(xVal: number): number {
		var {scroll, zeroVal} = this.chart.state.xAxis.range;
		return this.valueToPxByXAxis(xVal - zeroVal - scroll)
	}

	// /**
	//  *  returns screen scrollY value by screen scrollY coordinate
	//  */
	// getScreenYByValue(scrollYVal: number): number {
	// 	var {scroll, zeroVal} = this.state.yAxis.range;
	// 	return this.valueToPxByYAxis(scrollYVal - zeroVal - scroll)
	// }
	//
	//
	/**
	 * returns screen scrollX coordinate by offset in pixels from xAxis.range.zeroVal value
	 */
	getScreenXByPoint(xVal: number): number {
		return this.getScreenXByValue(this.getValueOnXAxis(xVal));
	}


	/**
	 * returns offset in pixels from xAxis.range.zeroVal value by screen scrollX coordinate
	 */
	getPointByScreenX(screenX: number): number {
		return this.getPointOnXAxis(this.getValueByScreenX(screenX));
	}

	/**
	 * returns offset in pixels from yAxis.range.zeroVal value by screen scrollY coordinate
	 */
	getPointByScreenY(screenY: number): number {
		return this.getPointOnYAxis(this.getValueByScreenY(screenY));
	}

	getTop(): number {
		return this.getPointByScreenY(this.chart.state.height);
	}
	
	getBottom(): number {
		return this.getPointByScreenY(0);
	}

	getLeft(): number {
		return this.getPointByScreenX(0);
	}

	getScreenRightVal() {
		return this.getValueByScreenX(this.chart.state.width);
	}

	getTopVal() {
		return this.getValueByScreenY(this.chart.state.height);
	}
	
	getBottomVal() {
		return this.getValueByScreenY(0);
	}

	getCenterYVal() {
		return this.getValueByScreenY(this.chart.state.height / 2);
	}

}
