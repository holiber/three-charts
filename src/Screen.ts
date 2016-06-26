import PerspectiveCamera = THREE.PerspectiveCamera;
import Vector3 = THREE.Vector3;
import {ChartState, IChartState} from "./State";
import forestgreen = THREE.ColorKeywords.forestgreen;
import {EventEmitter} from './deps';

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
	camera: PerspectiveCamera;
	options: IScreenTransformOptions = {scrollXVal: 0, scrollX: 0, scrollYVal: 0, scrollY: 0, zoomX: 1, zoomY: 1};
	private chartState: ChartState;
	private scrollXAnimation: TweenLite;
	private scrollYAnimation: TweenLite;
	private zoomXAnimation: TweenLite;
	private zoomYAnimation: TweenLite;
	private currentScrollX = {x: 0};
	private currentScrollY = {y: 0};
	private currentZoomX = {val: 1};
	private currentZoomY = {val: 1};
	private ee: EventEmitter2;

	constructor(chartState: ChartState) {
		this.chartState = chartState;
		var {width: w, height: h} = chartState.data;
		this.ee = new EventEmitter();
		this.bindEvents();

		//camera.position.z = 1500;
	}
	
	getCameraSettings() {

		var {width: w, height: h} = this.chartState.data;

		// setup pixel-perfect camera
		var FOV = 75;
		var vFOV = FOV * (Math.PI / 180);
		var camera = this.camera = new PerspectiveCamera(FOV, w / h, 0.1, 5000);
		camera.position.z = h / (2 * Math.tan(vFOV / 2) );
		
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
			this.ee.removeListener(eventName, cb);
		}
	}

	onScrollFrame(cb: (options: IScreenTransformOptions) => void): Function {
		var eventName = 'scrollFrame';
		this.ee.on(eventName, cb);
		return () => {
			this.ee.removeListener(eventName, cb);
		}
	}

	onTransformationFrame(cb: (options: IScreenTransformOptions) => void): Function {
		var eventName = 'transformationFrame';
		this.ee.on(eventName, cb);
		return () => {
			this.ee.removeListener(eventName, cb);
		}
	}

	cameraIsMoving(): boolean {
		return !!(
			this.scrollXAnimation && this.scrollXAnimation.isActive() ||
				this.zoomXAnimation && this.zoomXAnimation.isActive()
		);
	}

	private transform (options: IScreenTransformOptions) {
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

		// if (scrollXVal != void 0 || zoomX) {
		// 	options.scrollX = this.chartState.valueToPxByXAxis(scrollXVal != void 0 ? scrollXVal : this.options.scrollXVal);
		// 	this.options.scrollX = options.scrollX;
		// }
		//
		// if (scrollYVal != void 0 || zoomY) {
		// 	options.scrollY = this.chartState.valueToPxByYAxis(scrollYVal != void 0 ? scrollYVal : this.options.scrollYVal);
		// 	this.options.scrollY = options.scrollY;
		// }

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
	}

	private onScrollXHandler(changedProps: IChartState) {
		var state = this.chartState;
		var isDragMode = state.data.cursor.dragMode;
		var animations =  state.data.animations;
		var canAnimate = animations.enabled && !isDragMode;
		var zoomXChanged = changedProps.xAxis.range.zoom;
		var isAutoscroll = state.data.autoScroll && !isDragMode && !zoomXChanged;
		var time = isAutoscroll ? animations.autoScrollSpeed : animations.zoomSpeed;
		var ease = isAutoscroll ? animations.autoScrollEase : animations.zoomEase;
		if (this.scrollXAnimation) this.scrollXAnimation.pause();

		var range = state.data.xAxis.range;
		var targetX = range.scroll * range.scaleFactor * range.zoom;

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
		var animations =  state.data.animations;
		var canAnimate = animations.enabled;
		var time = animations.zoomSpeed;
		if (this.scrollYAnimation) this.scrollYAnimation.pause();
		var range = state.data.yAxis.range;
		var targetY = range.scroll * range.scaleFactor * range.zoom;

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
		var animations =  state.data.animations;
		var canAnimate = animations.enabled;
		var time = animations.zoomSpeed;
		var targetZoom = state.data.xAxis.range.zoom;
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
		var animations =  state.data.animations;
		var canAnimate = animations.enabled;
		var time = animations.zoomSpeed;
		var targetZoom = state.data.yAxis.range.zoom;
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
		var {scaleFactor, zeroVal} = this.chartState.data.xAxis.range;
		var zoom = this.options.zoomX;
		return (xVal - zeroVal) * scaleFactor * zoom;
	}

	/**
	 *  returns offset in pixels from yAxis.range.zeroVal to scrollYVal
	 */
	getPointOnYAxis(yVal: number): number {
		var {scaleFactor, zeroVal} =  this.chartState.data.yAxis.range;
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
		return this.chartState.data.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
	}


	/**
	 *  convert value to pixels by using settings from xAxis.range
	 */
	valueToPxByXAxis(xVal: number) {
		return xVal * this.chartState.data.xAxis.range.scaleFactor * this.options.zoomX;
	}


	/**
	 *  convert value to pixels by using settings from yAxis.range
	 */
	valueToPxByYAxis(yVal: number) {
		return yVal * this.chartState.data.yAxis.range.scaleFactor * this.options.zoomY;
	}
	
	/**
	 *  convert pixels to value by using settings from xAxis.range
	 */
	pxToValueByXAxis(xVal: number) {
		return xVal / this.chartState.data.xAxis.range.scaleFactor / this.options.zoomX;
	}


	/**
	 *  convert pixels to value by using settings from yAxis.range
	 */
	pxToValueByYAxis(yVal: number) {
		return yVal / this.chartState.data.yAxis.range.scaleFactor / this.options.zoomY;
	}


	/**
	 *  returns scrollX value by screen scrollX coordinate
	 */
	getValueByScreenX(x: number): number {
		return this.chartState.data.xAxis.range.zeroVal + this.options.scrollXVal + this.pxToValueByXAxis(x);
	}
	
	
	/**
	 *  returns scrollY value by screen scrollY coordinate
	 */
	getValueByScreenY(y: number): number {
		return this.chartState.data.yAxis.range.zeroVal + this.options.scrollYVal + this.pxToValueByYAxis(y);
	}
	
	//
	/**
	 *  returns screen scrollX value by screen scrollY coordinate
	 */
	getScreenXByValue(xVal: number): number {
		var {scroll, zeroVal} = this.chartState.data.xAxis.range;
		return this.valueToPxByXAxis(xVal - zeroVal - scroll)
	}

	// /**
	//  *  returns screen scrollY value by screen scrollY coordinate
	//  */
	// getScreenYByValue(scrollYVal: number): number {
	// 	var {scroll, zeroVal} = this.data.yAxis.range;
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
	
	getBottom(): number {
		return this.getPointByScreenY(0);
	}

	getScreenRightVal() {
		return this.getValueByScreenX(this.chartState.data.width);
	}

}