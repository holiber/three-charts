import PerspectiveCamera = THREE.PerspectiveCamera;
import Vector3 = THREE.Vector3;
import {Chart, IChartState} from "./Chart";
import { EventEmitter } from './EventEmmiter';
import { Animation } from './AnimationManager';
import { IViewportParams, Viewport } from "./Viewport";


export enum INTERPOLATION_EVENT {
	STARTED,
	FINISHED
}

const SCREEN_EVENTS = {
	ZOOM_FRAME: 'zoomFrame',
	SCROLL_FRAME: 'scrollFrame',
	TRANSFORMATION_FRAME: 'transformationFrame',
	TRANSFORMATION_EVENT: 'transformationStateChanged',
};

/**
 * manage camera, and contains methods for transforming pixels to values
 */
export class InterpolatedViewport extends Viewport {
	interpolationInProgress = false;
	private scrollXAnimation: Animation<number>;
	private scrollYAnimation: Animation<number>;
	private zoomXAnimation: Animation<number>;
	private zoomYAnimation: Animation<number>;
	private ee: EventEmitter;

	constructor(chart: Chart) {
		super(chart);
		var {width: w, height: h} = chart.state;
		this.ee = new EventEmitter();
		this.setParams(chart.viewport.params);
	}

	onZoomInterpolation(cb: (zoomX: number, zoomY: number) => any): Function {
		return this.ee.subscribe(SCREEN_EVENTS.ZOOM_FRAME, cb);
	}

	onScrollInterpolation(cb: (options: IViewportParams) => any): Function {
		return this.ee.subscribe(SCREEN_EVENTS.SCROLL_FRAME, cb);
	}

	onInterpolation(cb: (options: IViewportParams) => any): Function {
		return this.ee.subscribe(SCREEN_EVENTS.TRANSFORMATION_FRAME, cb);
	}

	onInterpolationEvent(cb: (event: INTERPOLATION_EVENT) => any): Function {
		return this.ee.subscribe(SCREEN_EVENTS.TRANSFORMATION_EVENT, cb);
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
	private setParams(options: IViewportParams, silent = false) {
		var {scrollX, scrollY, zoomX, zoomY} = options;
		
		if (scrollX != void 0) this.params.scrollX = scrollX;
		if (scrollY != void 0) this.params.scrollY = scrollY;
		if (zoomX != void 0) this.params.zoomX = zoomX;
		if (zoomY != void 0) this.params.zoomY = zoomY;

		if (scrollX != void 0 || zoomX) {
			options.scrollXVal = this.pxToValByXAxis(scrollX != void 0 ? scrollX : this.params.scrollX);
			this.params.scrollXVal = options.scrollXVal;
		}

		if (scrollY != void 0 || zoomY) {
			options.scrollYVal = this.pxToValByYAxis(scrollY != void 0 ? scrollY : this.params.scrollY);
			this.params.scrollYVal = options.scrollYVal;
		}

		if (silent) return;

		let hasActiveAnimations = (
			(this.scrollXAnimation && !this.scrollXAnimation.isStopped) ||
			(this.scrollYAnimation && !this.scrollYAnimation.isStopped) ||
			(this.zoomXAnimation && !this.zoomXAnimation.isStopped) ||
			(this.zoomYAnimation && !this.zoomYAnimation.isStopped)
		);
		let interpolationStarted = hasActiveAnimations && !this.interpolationInProgress;
		let interpolationFinished = !hasActiveAnimations && this.interpolationInProgress;

		if (interpolationStarted) {
			this.interpolationInProgress = true;
			this.ee.emit(SCREEN_EVENTS.TRANSFORMATION_EVENT, INTERPOLATION_EVENT.STARTED);
		}

		if (interpolationFinished) {
			this.interpolationInProgress = false;
		}

		if (!this.interpolationInProgress) {
			// prevent to set camera between pixels
			this.params.scrollX = options.scrollX = Math.round(this.params.scrollX);
			this.params.scrollY = options.scrollY = Math.round(this.params.scrollY);
		}

		this.ee.emit(SCREEN_EVENTS.TRANSFORMATION_FRAME, options);

		let scrollEventNeeded = options.scrollXVal != void 0 || options.scrollYVal != void 0;
		if (scrollEventNeeded) this.ee.emit(SCREEN_EVENTS.SCROLL_FRAME, options);

		let zoomEventNeeded = options.zoomX != void 0 || options.zoomY != void 0;
		if (zoomEventNeeded) this.ee.emit(SCREEN_EVENTS.ZOOM_FRAME, options);

		if (interpolationFinished) {
			this.ee.emit(SCREEN_EVENTS.TRANSFORMATION_EVENT, INTERPOLATION_EVENT.FINISHED);
		}
	}


	protected bindEvents() {
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
		if (isDragMode && !chart.state.inertialScroll) time = 0;

		if (this.scrollXAnimation) this.scrollXAnimation.stop();

		this.scrollXAnimation = chart.animationManager.animate(time, ease)
			.from(this.params.scrollX)
			.to(targetX)
			.onTick((value) => {
				this.setParams({scrollX: value});
			});
	}

	private onScrollYHandler() {
		let chart = this.chart;
		let animations =  chart.state.animations;
		let range = chart.state.yAxis.range;
		let targetY = range.scroll * range.scaleFactor * range.zoom;

		if (this.scrollYAnimation) this.scrollYAnimation.stop();

		this.scrollYAnimation = chart.animationManager.animate(animations.zoomSpeed, animations.zoomEase)
			.from(this.params.scrollY)
			.to(targetY)
			.onTick((value) => {
				this.setParams({scrollY: value});
			});
	}


	private onZoomXHandler() {
		let chart = this.chart;
		let animations =  chart.state.animations;
		let targetZoom = chart.state.xAxis.range.zoom;
		if (this.zoomXAnimation) this.zoomXAnimation.stop();

		this.zoomXAnimation = chart.animationManager
			.animate(animations.zoomSpeed, animations.zoomEase)
			.from(this.params.zoomX)
			.to(targetZoom)
			.onTick((value) => {
				this.setParams({zoomX: value});
			});
	}


	private onZoomYHandler() {
		let chart = this.chart;
		let targetZoom = chart.state.yAxis.range.zoom;
		let animations =  chart.state.animations;
		if (this.zoomYAnimation) this.zoomYAnimation.stop();

		this.zoomYAnimation = chart.animationManager
			.animate(animations.zoomSpeed, animations.zoomEase)
			.from(this.params.zoomY)
			.to(targetZoom)
			.onTick((value) => {
				this.setParams({zoomY: value});
			});
	}

}
