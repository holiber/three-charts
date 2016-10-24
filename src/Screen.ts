import PerspectiveCamera = THREE.PerspectiveCamera;
import Vector3 = THREE.Vector3;
import {Chart, IChartState} from "./Chart";
import forestgreen = THREE.ColorKeywords.forestgreen;
import {EventEmitter} from './EventEmmiter';

export interface IScreenTransformOptions {
	scrollXVal?: number,
	scrollYVal?: number,
	scrollX?: number,
	scrollY?: number,
	zoomX?: number,
	zoomY?: number
}

/**
 * manage camera, and contains methods for transforming pixels to values
 */
export class Screen {
	options: IScreenTransformOptions = {scrollXVal: 0, scrollX: 0, scrollYVal: 0, scrollY: 0, zoomX: 1, zoomY: 1};
	private chartState: Chart;
	private scrollXAnimation: TweenLite;
	private scrollYAnimation: TweenLite;
	private zoomXAnimation: TweenLite;
	private zoomYAnimation: TweenLite;
	private currentScrollX = {x: 0};
	private currentScrollY = {y: 0};
	private currentZoomX = {val: 1};
	private currentZoomY = {val: 1};
	private ee: EventEmitter;

	constructor(chartState: Chart) {
		this.chartState = chartState;
		var {width: w, height: h} = chartState.state;
		this.ee = new EventEmitter();
		this.transform({
			scrollY: this.valueToPxByYAxis(this.chartState.state.yAxis.range.scroll),
			zoomY: 1
		});
		this.bindEvents();

		//camera.position.z = 1500;
	}
	
	getCameraSettings() {

		var {width: w, height: h} = this.chartState.state;

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
		var eventName = 'zoomFrame';
		this.ee.on(eventName, cb);
		return () => {
			this.ee.off(eventName, cb);
		}
	}

	onScrollFrame(cb: (options: IScreenTransformOptions) => void): Function {
		var eventName = 'scrollFrame';
		this.ee.on(eventName, cb);
		return () => {
			this.ee.off(eventName, cb);
		}
	}

	onTransformationFrame(cb: (options: IScreenTransformOptions) => void): Function {
		var eventName = 'transformationFrame';
		this.ee.on(eventName, cb);
		return () => {
			this.ee.off(eventName, cb);
		}
	}

	cameraIsMoving(): boolean {
		return !!(
			this.scrollXAnimation && this.scrollXAnimation.isActive() ||
				this.zoomXAnimation && this.zoomXAnimation.isActive()
		);
	}

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

		this.ee.emit('transformationFrame', options);
		
		if (options.scrollXVal != void 0 || options.scrollYVal != void 0) {
			this.ee.emit('scrollFrame', options);
		}
		
		if (options.zoomX != void 0 || options.zoomY != void 0) {
			this.ee.emit('zoomFrame', options);
		}
	}


	private bindEvents() {
		var state = this.chartState;

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
		this.scrollXAnimation && this.scrollXAnimation.kill();
		this.scrollYAnimation && this.scrollYAnimation.kill();
		this.zoomXAnimation && this.zoomXAnimation.kill();
		this.zoomYAnimation && this.zoomYAnimation.kill();
	}

	private onScrollXHandler(changedProps: IChartState) {
		var state = this.chartState;
		var isDragMode = state.state.cursor.dragMode;
		var animations =  state.state.animations;
		var canAnimate = animations.enabled && !isDragMode;
		var zoomXChanged = changedProps.xAxis.range.zoom;
		var isAutoscroll = state.state.autoScroll && !isDragMode && !zoomXChanged;
		var time = isAutoscroll ? animations.autoScrollSpeed : animations.zoomSpeed;
		var ease = isAutoscroll ? animations.autoScrollEase : animations.zoomEase;
		if (this.scrollXAnimation) this.scrollXAnimation.pause();

		var range = state.state.xAxis.range;
		var targetX = range.scroll * range.scaleFactor * range.zoom;
		this.currentScrollX.x = this.options.scrollX;

		var cb = () => {
			this.transform({scrollX: this.currentScrollX.x});
		};

		if (canAnimate) {
			this.scrollXAnimation = TweenLite.to(this.currentScrollX, time, {
				x: targetX, ease: ease
			});
			this.scrollXAnimation.eventCallback('onUpdate', cb);
		} else {
			this.currentScrollX.x = targetX;
			cb();
		}

	}

	private onScrollYHandler() {
		var state = this.chartState;
		var animations =  state.state.animations;
		var canAnimate = animations.enabled;
		var time = animations.zoomSpeed;
		if (this.scrollYAnimation) this.scrollYAnimation.pause();
		var range = state.state.yAxis.range;
		var targetY = range.scroll * range.scaleFactor * range.zoom;

		this.currentScrollY.y = this.options.scrollY;

		var cb = () => {
			this.transform({scrollY: this.currentScrollY.y});
		};

		if (canAnimate) {
			this.scrollYAnimation = TweenLite.to(this.currentScrollY, time, {
				y: targetY, ease: animations.zoomEase
			});
			this.scrollYAnimation.eventCallback('onUpdate', cb);
		} else {
			this.currentScrollY.y = targetY;
			cb();
		}
	}

	private onZoomXHandler() {
		var state = this.chartState;
		var animations =  state.state.animations;
		var canAnimate = animations.enabled;
		var time = animations.zoomSpeed;
		var targetZoom = state.state.xAxis.range.zoom;
		if (this.zoomXAnimation) this.zoomXAnimation.pause();

		var cb = () => {
			this.transform({zoomX: this.currentZoomX.val});
		};

		if (canAnimate) {
			this.zoomXAnimation = TweenLite.to(this.currentZoomX, time, {
				val: targetZoom, ease: animations.zoomEase
			});
			this.zoomXAnimation.eventCallback('onUpdate', cb);
		} else {
			this.currentZoomX.val = targetZoom;
			cb();
		}
	}

	private onZoomYHandler() {
		var state = this.chartState;
		var animations =  state.state.animations;
		var canAnimate = animations.enabled;
		var time = animations.zoomSpeed;
		var targetZoom = state.state.yAxis.range.zoom;
		if (this.zoomYAnimation) this.zoomYAnimation.pause();

		var cb = () => {
			this.transform({zoomY: this.currentZoomY.val});
		};

		if (canAnimate) {
			this.zoomYAnimation = TweenLite.to(this.currentZoomY, time, {
				val: targetZoom, ease: animations.zoomEase
			});
			this.zoomYAnimation.eventCallback('onUpdate', cb);
		} else {
			this.currentZoomY.val = targetZoom;
			cb();
		}
	}


	/**
	 *  returns offset in pixels from xAxis.range.zeroVal to scrollXVal
	 */
	getPointOnXAxis(xVal: number): number {
		var {scaleFactor, zeroVal} = this.chartState.state.xAxis.range;
		var zoom = this.options.zoomX;
		return (xVal - zeroVal) * scaleFactor * zoom;
	}

	/**
	 *  returns offset in pixels from yAxis.range.zeroVal to scrollYVal
	 */
	getPointOnYAxis(yVal: number): number {
		var {scaleFactor, zeroVal} =  this.chartState.state.yAxis.range;
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
		return this.chartState.state.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
	}


	/**
	 *  convert value to pixels by using settings from xAxis.range
	 */
	valueToPxByXAxis(xVal: number) {
		return xVal * this.chartState.state.xAxis.range.scaleFactor * this.options.zoomX;
	}


	/**
	 *  convert value to pixels by using settings from yAxis.range
	 */
	valueToPxByYAxis(yVal: number) {
		return yVal * this.chartState.state.yAxis.range.scaleFactor * this.options.zoomY;
	}
	
	/**
	 *  convert pixels to value by using settings from xAxis.range
	 */
	pxToValueByXAxis(xVal: number) {
		return xVal / this.chartState.state.xAxis.range.scaleFactor / this.options.zoomX;
	}


	/**
	 *  convert pixels to value by using settings from yAxis.range
	 */
	pxToValueByYAxis(yVal: number) {
		return yVal / this.chartState.state.yAxis.range.scaleFactor / this.options.zoomY;
	}


	/**
	 *  returns scrollX value by screen scrollX coordinate
	 */
	getValueByScreenX(x: number): number {
		return this.chartState.state.xAxis.range.zeroVal + this.options.scrollXVal + this.pxToValueByXAxis(x);
	}
	
	
	/**
	 *  returns scrollY value by screen scrollY coordinate
	 */
	getValueByScreenY(y: number): number {
		return this.chartState.state.yAxis.range.zeroVal + this.options.scrollYVal + this.pxToValueByYAxis(y);
	}
	
	//
	/**
	 *  returns screen scrollX value by screen scrollY coordinate
	 */
	getScreenXByValue(xVal: number): number {
		var {scroll, zeroVal} = this.chartState.state.xAxis.range;
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
		return this.getPointByScreenY(this.chartState.state.height);
	}
	
	getBottom(): number {
		return this.getPointByScreenY(0);
	}

	getLeft(): number {
		return this.getPointByScreenX(0);
	}

	getScreenRightVal() {
		return this.getValueByScreenX(this.chartState.state.width);
	}

	getTopVal() {
		return this.getValueByScreenY(this.chartState.state.height);
	}
	
	getBottomVal() {
		return this.getValueByScreenY(0);
	}

	getCenterYVal() {
		return this.getValueByScreenY(this.chartState.state.height / 2);
	}

}
