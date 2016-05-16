// deps must be always on top
require('./deps');

import {TrendsIndicatorWidget} from "./widgets/TrendsIndicatorWidget";
import {TrendsLineWidget} from "./widgets/TrendsLineWidget";
import PerspectiveCamera = THREE.PerspectiveCamera;
import Renderer = THREE.Renderer;
import Scene = THREE.Scene;
import WebGLRenderer = THREE.WebGLRenderer;
import Object3D = THREE.Object3D; 
import {ChartState, IChartState} from "./State";
import {ChartWidget, IChartWidgetConstructor} from "./Widget";
import {Utils} from "./Utils";
import {TrendsBeaconWidget} from "./widgets/TrendsBeaconWidget";
import {AxisWidget} from "./widgets/AxisWidget";
import {GridWidget} from "./widgets/GridWidget";
import {TrendsGradientWidget} from "./widgets/TrendsGradientWidget";

export const MAX_DATA_LENGTH = 1000;

export enum AXIS_RANGE_TYPE {
	AUTO,
	ALL,
	FIXED
}

export interface IAxisRange {
	type?: AXIS_RANGE_TYPE,
	from?: number,
	to?: number,
	scroll?: number
}

export interface IAxisOptions {
	range: IAxisRange,
	gridMinSize?: number,
	autoScroll?: boolean,
	padding?: {
		start?: number,
		end?: number
	}
}

export interface IAnimationsOptions {
	enabled?: boolean,
	trendChangeSpeed?: number,
	trendChangeEase?: Ease | Linear,
	autoScrollSpeed?: number,
	autoScrollEase?: Ease | Linear,
}

export class Chart {
	state: ChartState;
	private $el: HTMLElement;
	private camera: PerspectiveCamera;
	private renderer: Renderer;
	private scene: Scene;
	private widgets: Array<ChartWidget> = [];

	static devicePixelRatio = window.devicePixelRatio;
	static installedWidgets: {[name: string]: typeof ChartWidget} = {};

	constructor(state: IChartState) {
		this.state = new ChartState(state);
		this.init();
	};

	static installWidget<WidgetClass extends typeof ChartWidget>(Widget: WidgetClass) {
		if (!Widget.widgetName) {
			Utils.error('unnamed widget');
		}
		this.installedWidgets[Widget.widgetName] = Widget;
	}

	private init() {
		var {width: w, height: h, $el} = this.state.data;

		var scene = this.scene = new THREE.Scene();

		var renderer = this.renderer = new WebGLRenderer({antialias: true}); //new THREE.CanvasRenderer();
		renderer.setPixelRatio(Chart.devicePixelRatio);
		renderer.setSize(w, h);
		$el.appendChild(renderer.domElement);
		this.$el = renderer.domElement;

		var stats = new Stats();
		$el.appendChild(stats.domElement);

		this.initCamera();

		// init widgets
		for (let widgetName in Chart.installedWidgets) {
			let widgetOptions = this.state.data.widgets[widgetName];
			if (!widgetOptions.enabled) continue;
			let WidgetConstructor = Chart.installedWidgets[widgetName] as IChartWidgetConstructor;
			let widget = new WidgetConstructor(this.state);
			this.scene.add(widget.getObject3D());
			this.widgets.push(widget);
		}

		this.bindEvents();

		var render = (time: number) => {
			stats.begin();
			renderer.render(scene, this.camera);
			
			//uncomment for 30fps
			var renderDelay = this.state.data.animations.enabled ? 25 : 1000;
			//setTimeout(() => requestAnimationFrame(render), renderDelay);
			requestAnimationFrame(render);

			stats.end();
		};
		render(Date.now());

	}
	
	getState(): IChartState {
		return this.state.data
	}

	/**
	 * shortcut for Chart.state.getTrend
	 */
	getTrend(trendName: string) {
		return this.state.getTrend(trendName);
	}
	
	/**
	 * shortcut for Chart.state.setState
	 */
	setState(state: IChartState) {
		return this.state.setState(state);
	}


	zoom(zoomValue: number) {
		this.state.setState({zoom: this.state.data.zoom + zoomValue});
	}

	private onZoom(zoomValue: number) {
		var cameraPos = this.camera.position;
		//TweenLite.to(cameraPos, 0.3, {z: zoomValue});
	}

	private initCamera() {
		var {width: w, height: h} = this.state.data;

		// setup pixel-perfect camera
		var FOV = 75;
		var vFOV = FOV * (Math.PI / 180);
		var camera = this.camera = new PerspectiveCamera(FOV, w / h, 0.1, 5000);
		camera.position.z = h / (2 * Math.tan(vFOV / 2) );

		// move 0,0 to left-bottom corner
		camera.position.x = w / 2;
		camera.position.y = h / 2;
	}

	private bindEvents() {
		var $el = this.$el;
		$el.addEventListener('mousewheel', (ev: MouseWheelEvent) => {
			ev.stopPropagation();
			ev.preventDefault();

			console.log('onZoom', ev.wheelDeltaY);
			//if (Math.abs(ev.wheelDeltaY) < 50) return;
			this.zoom(ev.wheelDeltaY)
			//ev.wheelDeltaY > 0 ? this.zoom(ev.wheelDeltaY) : this.zoom(ev.wheelDeltaY);
			console.log(ev.wheelDeltaY)
		});
		$el.addEventListener('mousemove', (ev: MouseEvent) => {this.onMouseMove(ev)});
		$el.addEventListener('mousedown', (ev: MouseEvent) => this.onMouseDown(ev));
		$el.addEventListener('mouseup', (ev: MouseEvent) => this.onMouseUp(ev));
		$el.addEventListener('touchmove', (ev: TouchEvent) => {this.onTouchMove(ev)});
		$el.addEventListener('touchend', (ev: TouchEvent) => {this.onTouchEnd(ev)});

		this.state.onChange((changedProps: IChartState)  => {
			changedProps.zoom && this.onZoom(changedProps.zoom);
		});
		
		this.state.onTrendsChange(() => this.onTrendsChange());
		this.state.onScrollStop(() => this.onScrollStop());
	}
	
	private onTrendsChange() {
		var state = this.state;
		var oldTrendsMaxX = state.data.prevState.computedData.trends.maxX;
		var trendsMaxXDelta = state.data.computedData.trends.maxX - oldTrendsMaxX;
		if (trendsMaxXDelta > 0) {
			var maxVisibleX = this.state.getMaxVisibleX();
			var paddingRightX = this.state.getPaddingRight();
			var currentScroll = state.data.xAxis.range.scroll;
			if (oldTrendsMaxX < paddingRightX || oldTrendsMaxX > maxVisibleX) {
				return;
			}
			var scrollDelta = state.getPointOnXAxis(trendsMaxXDelta);
			this.setState({xAxis: {range: {scroll: currentScroll - scrollDelta}}});
		}
	}
	
	private onScrollStop() {
		var tendsXMax = this.state.data.computedData.trends.maxX;
		var paddingRightX = this.state.getPaddingRight();
		if (tendsXMax < paddingRightX) {
			//this.state.scrollToEnd();
		}
	}

	private onMouseDown(ev: MouseEvent) {
		this.setState({cursor: {dragMode: true, x: ev.clientX, y: ev.clientY}});
	}
	
	private onMouseUp(ev: MouseEvent) {
		this.setState({cursor: {dragMode: false}});
	}

	private onMouseMove(ev: MouseEvent) {
		if (this.state.data.cursor.dragMode) {
			this.setState({cursor: {dragMode: true, x: ev.clientX, y: ev.clientY}});
		}
	}

	private onTouchMove(ev: TouchEvent) {
		this.setState({cursor: {dragMode: true, x: ev.touches[0].clientX, y: ev.touches[0].clientY}});
	}

	private onTouchEnd(ev: TouchEvent) {
		this.setState({cursor: {dragMode: false}});
	}

}

// install built-in widgets
Chart.installWidget(TrendsLineWidget);
Chart.installWidget(AxisWidget);
Chart.installWidget(GridWidget);
Chart.installWidget(TrendsBeaconWidget);
Chart.installWidget(TrendsIndicatorWidget);
Chart.installWidget(TrendsGradientWidget);