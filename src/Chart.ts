// deps must be always on top
require('./deps');

export * from './interfaces';
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
import {Screen} from "./Screen";
import {TrendsBeaconWidget} from "./widgets/TrendsBeaconWidget";
import {AxisWidget} from "./widgets/AxisWidget";
import {GridWidget} from "./widgets/GridWidget";
import {TrendsGradientWidget} from "./widgets/TrendsGradientWidget";
import {TrendsLoadingWidget} from "./widgets/TrendsLoadingWidget";
import {AxisMarksWidget} from "./widgets/AxisMarksWidget";
import {TrendsMarksWidget} from "./widgets/TrendsMarksWidget";

export const MAX_DATA_LENGTH = 1000;

export class Chart {
	state: ChartState;
	private $el: HTMLElement;
	private screen: Screen;
	private renderer: Renderer;
	private scene: Scene;
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
		var {width: w, height: h, $el} = state.data;
		this.scene = new THREE.Scene();

		var renderer = this.renderer = new WebGLRenderer({antialias: true}); //new THREE.CanvasRenderer();
		renderer.setPixelRatio(Chart.devicePixelRatio);
		renderer.setSize(w, h);
		$el.appendChild(renderer.domElement);
		this.$el = renderer.domElement;

		this.stats = new Stats();
		$el.appendChild(this.stats.domElement);

		this.screen = new Screen(state);
		this.scene.add(this.screen.camera);

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
		this.stats.begin();
		this.renderer.render(this.scene, this.screen.camera);

		var renderDelay = this.state.data.animations.enabled ? 0 : 1000;
		if (renderDelay) {
			setTimeout(() => requestAnimationFrame((time) => this.render(time)), renderDelay);
		} else {
			requestAnimationFrame((time) => this.render(time));
		}
		// this.screen.camera.rotation.z += 0.01;
		// this.screen.camera.rotation.y += 0.01;
		this.stats.end();
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


	private bindEvents() {
		var $el = this.$el;
		$el.addEventListener('mousewheel', (ev: MouseWheelEvent) => {this.onMouseWheel(ev)});
		$el.addEventListener('mousemove', (ev: MouseEvent) => {this.onMouseMove(ev)});
		$el.addEventListener('mousedown', (ev: MouseEvent) => this.onMouseDown(ev));
		$el.addEventListener('mouseup', (ev: MouseEvent) => this.onMouseUp(ev));
		$el.addEventListener('touchmove', (ev: TouchEvent) => {this.onTouchMove(ev)});
		$el.addEventListener('touchend', (ev: TouchEvent) => {this.onTouchEnd(ev)});

		this.state.onTrendsChange(() => this.autoscroll());
		this.state.onScrollStop(() => this.onScrollStop());
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
		this.state.zoom(1 + ev.wheelDeltaY * 0.0001);
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
Chart.installWidget(TrendsGradientWidget);
Chart.installWidget(TrendsLoadingWidget);
Chart.installWidget(AxisMarksWidget);
Chart.installWidget(TrendsMarksWidget);