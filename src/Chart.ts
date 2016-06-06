// deps must be always on top
import {Trend} from "./Trend";
require('./deps');

import Vector3 = THREE.Vector3;
import PerspectiveCamera = THREE.PerspectiveCamera;
import Renderer = THREE.Renderer;
import Scene = THREE.Scene;
import WebGLRenderer = THREE.WebGLRenderer;
import Object3D = THREE.Object3D;
import {TrendsIndicatorWidget} from "./widgets/TrendsIndicatorWidget";
import {TrendsLineWidget} from "./widgets/TrendsLineWidget";
import {ChartState, IChartState} from "./State";
import {ChartWidget, IChartWidgetConstructor} from "./Widget";
import {Utils} from "./Utils";
import {Screen, IScreenTransformOptions} from "./Screen";
import {TrendsBeaconWidget} from "./widgets/TrendsBeaconWidget";
import {AxisWidget} from "./widgets/AxisWidget";
import {GridWidget} from "./widgets/GridWidget";
import {TrendsGradientWidget} from "./widgets/TrendsGradientWidget";
import {TrendsLoadingWidget} from "./widgets/TrendsLoadingWidget";
import {AxisMarksWidget} from "./widgets/AxisMarksWidget";
import {TrendsMarksWidget} from "./widgets/TrendsMarksWidget";
import {BorderWidget} from "./widgets/BorderWidget";

export const MAX_DATA_LENGTH = 1000;

export class Chart {
	state: ChartState;
	private $el: HTMLElement;
	private renderer: Renderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private cameraInitialPosition: Vector3;
	private widgets: Array<ChartWidget> = [];
	private stats: Stats;

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
		var state = this.state;
		var {width: w, height: h, $el, showStats} = state.data;
		this.scene = new THREE.Scene();

		var renderer = this.renderer = new WebGLRenderer({antialias: true}); //new THREE.CanvasRenderer();
		renderer.setPixelRatio(Chart.devicePixelRatio);
		renderer.setSize(w, h);
		$el.appendChild(renderer.domElement);
		this.$el = renderer.domElement;
		this.$el.style.display = 'block';

		if (showStats) {
			this.stats = new Stats();
			$el.appendChild(this.stats.domElement);
		}

		var camSettings = state.screen.getCameraSettings();
		this.camera = new PerspectiveCamera(camSettings.FOV, camSettings.aspect, camSettings.near, camSettings.far);
		this.camera.position.set(camSettings.x, camSettings.y, camSettings.z);
		this.cameraInitialPosition = this.camera.position.clone();
		this.scene.add(this.camera);
		//this.camera.position.z = 2000;

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
		this.render(Date.now());
	}
	
	render(time: number) {
		this.stats && this.stats.begin();
		this.renderer.render(this.scene, this.camera);

		var renderDelay = this.state.data.animations.enabled ? 0 : 1000;
		if (renderDelay) {
			setTimeout(() => requestAnimationFrame((time) => this.render(time)), renderDelay);
		} else {
			requestAnimationFrame((time) => this.render(time));
		}
		this.stats && this.stats.end();
	}
	
	getState(): IChartState {
		return this.state.data
	}

	/**
	 * shortcut for Chart.state.getTrend
	 */
	getTrend(trendName: string): Trend {
		return this.state.getTrend(trendName);
	}
	
	/**
	 * shortcut for Chart.state.setState
	 */
	setState(state: IChartState) {
		return this.state.setState(state);
	}


	private bindEvents() {
		var $el = this.$el;
		$el.addEventListener('mousewheel', (ev: MouseWheelEvent) => {this.onMouseWheel(ev)});
		$el.addEventListener('mousemove', (ev: MouseEvent) => {this.onMouseMove(ev)});
		$el.addEventListener('mousedown', (ev: MouseEvent) => this.onMouseDown(ev));
		$el.addEventListener('mouseup', (ev: MouseEvent) => this.onMouseUp(ev));
		$el.addEventListener('touchmove', (ev: TouchEvent) => {this.onTouchMove(ev)});
		$el.addEventListener('touchend', (ev: TouchEvent) => {this.onTouchEnd(ev)});

		this.state.onTrendsChange(() => this.autoscroll());
		//this.state.screen.onCameraChange((scrollX, scrollY) => this.onCameraChangeHandler(scrollX, scrollY))

		this.state.screen.onTransformationFrame((options) => this.onScreenTransform(options))
	}

	private onCameraChangeHandler(x: number, y: number) {
		if (x != void 0) {
			this.camera.position.setX(this.cameraInitialPosition.x + x);
		}
		if (y != void 0) {
			this.camera.position.setY(this.cameraInitialPosition.y + y);
		}
	}

	private onScreenTransform(options: IScreenTransformOptions) {
		if (options.scrollX != void 0) {
			this.camera.position.setX(this.cameraInitialPosition.x + options.scrollX);
		}
		if (options.scrollY != void 0) {
			this.camera.position.setY(this.cameraInitialPosition.y + options.scrollY);
		}
	}
	
	private autoscroll() {
		var state = this.state;
		if (state.data.cursor.dragMode) return;
		var oldTrendsMaxX = state.data.prevState.computedData.trends.maxXVal;
		var trendsMaxXDelta = state.data.computedData.trends.maxXVal - oldTrendsMaxX;
		if (trendsMaxXDelta > 0) {
			var maxVisibleX = this.state.getScreenRightVal();
			var paddingRightX = this.state.getPaddingRight();
			var currentScroll = state.data.xAxis.range.scroll;
			if (oldTrendsMaxX < paddingRightX || oldTrendsMaxX > maxVisibleX) {
				return;
			}
			var scrollDelta = trendsMaxXDelta;
			this.setState({xAxis: {range: {scroll: currentScroll + scrollDelta}}});
		}
	}
	
	private onScrollStop() {
		// var tendsXMax = this.state.data.computedData.trends.maxX;
		// var paddingRightX = this.state.getPaddingRight();
		// if (tendsXMax < paddingRightX) {
		// 	this.state.scrollToEnd();
		// }
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

	private onMouseWheel(ev: MouseWheelEvent) {
		ev.stopPropagation();
		ev.preventDefault();
		this.state.zoom(1 + ev.wheelDeltaY * 0.0002);
	}

	private onTouchMove(ev: TouchEvent) {
		this.setState({cursor: {dragMode: true, x: ev.touches[0].clientX, y: ev.touches[0].clientY}});
	}

	private onTouchEnd(ev: TouchEvent) {
		this.setState({cursor: {dragMode: false}});
	}

	/**
	 * creates simple chart without animations and minimal widgets set
	 */
	static createPreviewChart(userOptions: IChartState): Chart {
		var previewChartOptions: IChartState = {
			animations: {enabled: false},
			widgets: {
				Grid: {enabled: false},
				Axis: {enabled: false},
				TrendsGradient: {enabled: false}
			}
		};
		var options = Utils.deepMerge(userOptions, previewChartOptions);
		return new Chart(options);
	}

}

// install built-in widgets
Chart.installWidget(TrendsLineWidget);
Chart.installWidget(AxisWidget);
Chart.installWidget(GridWidget);
Chart.installWidget(TrendsBeaconWidget);
Chart.installWidget(TrendsIndicatorWidget);
// Chart.installWidget(TrendsGradientWidget);
Chart.installWidget(TrendsLoadingWidget);
Chart.installWidget(AxisMarksWidget);
Chart.installWidget(TrendsMarksWidget);
Chart.installWidget(BorderWidget);