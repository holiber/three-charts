import {ITrendData} from "./Trend";
require('./deps');

import PerspectiveCamera = THREE.PerspectiveCamera;
import Renderer = THREE.Renderer;
import Scene = THREE.Scene;
import WebGLRenderer = THREE.WebGLRenderer;
import {TrendLineWidget} from "./widgets/TrendLineWidget";
import Object3D = THREE.Object3D; 
import {ChartState, IChartState} from "./State";
import {ChartWidget, IChartWidgetConstructor} from "./Widget";
import {Utils} from "./Utils";
import {BeaconWidget} from "./widgets/BeaconWidget";
import {AxisWidget} from "./widgets/AxisWidget";
import {GridWidget} from "./widgets/GridWidget";
import {TrendGradientWidget} from "./widgets/TrendGradientWidget";

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
	gridMinSize?: number
}

export interface IAnimationsOptions {
	enabled?: boolean,
	trendChangeSpeed?: number
}

export class Chart {
	state: ChartState;
	private $el: HTMLElement;
	private camera: PerspectiveCamera;
	private renderer: Renderer;
	private scene: Scene;
	private widgets: Array<ChartWidget> = [];
	private mouseState = {
		dragMode: false,
		x: 0,
		y: 0
	};
	

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

		this.attachEvents();

		var render = (time: number) => {
			stats.begin();
			renderer.render(scene, this.camera);
			
			//uncomment for 30fps
			var renderDelay = this.state.data.animations.enabled ? 25 : 1000;
			setTimeout(() => requestAnimationFrame(render), renderDelay);
			//requestAnimationFrame(render);

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
		//var trendPos = this.trend.getObject3D().position;
		//TweenLite.to(trendPos, 0.3, {z: zoomValue});
	}

	private initCamera() {
		var {width: w, height: h} = this.state.data;

		// setup pixel-perfect camera
		var FOV = 75;
		var vFOV = FOV * (Math.PI / 180);
		var camera = this.camera = new PerspectiveCamera(FOV, w / h, 0.1, 1000);
		camera.position.z = h / (2 * Math.tan(vFOV / 2) );

		// move 0,0 to left-bottom corner
		camera.position.x = w / 2;
		camera.position.y = h / 2;
	}

	private attachEvents() {
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

		this.state.onChange((changedProps: IChartState)  => {
			changedProps.zoom && this.onZoom(changedProps.zoom);
		});
	}

	private onMouseDown(ev: MouseEvent) {
		this.mouseState = {dragMode: true, x: ev.clientX, y: ev.clientY};
	}
	private onMouseUp(ev: MouseEvent) {
		this.mouseState.dragMode = false;
	}

	private onMouseMove(ev: MouseEvent) {
		var mouseState = this.mouseState;
		if (!mouseState.dragMode) return;
		var dx = mouseState.x - ev.clientX;
		var dy = ev.clientY - mouseState.y;
		this.camera.position.x += dx;
		this.camera.position.y += dy;
		this.mouseState = {dragMode: true, x: ev.clientX, y: ev.clientY}
	}

}

// install built-in widgets
Chart.installWidget(TrendLineWidget);
Chart.installWidget(AxisWidget);
Chart.installWidget(GridWidget);
Chart.installWidget(BeaconWidget);
Chart.installWidget(TrendGradientWidget);