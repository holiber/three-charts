
import { ChartPlugin } from './Plugin';
import { Trend } from "./Trend";
import Vector3 = THREE.Vector3;
import PerspectiveCamera = THREE.PerspectiveCamera;
import Scene = THREE.Scene;
import Renderer = THREE.Renderer;
import WebGLRenderer = THREE.WebGLRenderer;
import OrthographicCamera = THREE.OrthographicCamera;
import Object3D = THREE.Object3D;
import { Chart, IChartState } from "./Chart";
import { ChartWidget, IChartWidgetConstructor } from "./Widget";
import { Utils } from "./Utils";
import { IViewportParams } from "./Viewport";
import { AxisWidget } from "./widgets/AxisWidget";
import { GridWidget } from "./widgets/GridWidget";
import { TrendsGradientWidget } from "./widgets/TrendsGradientWidget";
import { TrendsLineWidget } from "./widgets/TrendsLineWidget";
import { TrendsCandlesWidget } from './widgets/TrendsCandleWidget';
import { ResizeSensor, ResizeSensorType } from './deps';
import {Color} from "./Color";


export class ChartBlankView {

	static devicePixelRatio = window.devicePixelRatio;
	static preinstalledWidgets: typeof ChartWidget[] = [];
	static renderers: {[rendererName: string]: any} = {
		CanvasRenderer: (THREE as any).CanvasRenderer,
		WebGLRenderer: THREE.WebGLRenderer
	};

	chart: Chart;
	isStopped: boolean;
	isDestroyed: boolean;
	private $container: Element;
	private $el: HTMLElement;
	private renderer: Renderer;
	private scene: Scene;
	private camera: OrthographicCamera;
	private cameraInitialPosition: Vector3;
	private widgets: Array<ChartWidget> = [];
	private stats: Stats;
	private zoomThrottled: Function;
	private unsubscribers: Function[];
	private resizeSensor: ResizeSensorType;
	private pluginsAndWidgets: Array<ChartPlugin<any> | ChartWidget>;

	constructor(state: IChartState, $container: Element, pluginsAndWidgets: Array<ChartPlugin<any> | ChartWidget> = []) {

		if (!THREE || !THREE.REVISION) Utils.error('three.js not found');

		if (!$container) {
			Utils.error('$el must be set');
		}
		// calculate state size
		let style = getComputedStyle($container);
		state.width = parseInt(style.width);
		state.height = parseInt(style.height);

		let plugins = pluginsAndWidgets.filter(pluginOrWidget => pluginOrWidget instanceof ChartPlugin) as ChartPlugin<any>[];

		this.chart = new Chart(state, plugins);
		this.pluginsAndWidgets = pluginsAndWidgets;
		this.zoomThrottled = Utils.throttle((zoomValue: number, origin: number) => this.zoom(zoomValue, origin), 200);
		this.$container = $container;
		this.init($container);
	};

	private init($container: Element) {
		var chart = this.chart;
		var {width: w, height: h, showStats, autoRender} = chart.state;
		this.scene = new THREE.Scene();
		this.isStopped = !autoRender.enabled;

		var renderer = this.renderer = new (ChartView.renderers[this.chart.state.renderer] as any)({
			antialias: true,
			alpha: true
		});
		let backgroundColor = new Color(chart.state.backgroundColor);
		renderer.setSize(w, h);
		renderer.setPixelRatio(ChartView.devicePixelRatio);
		renderer.setClearColor(backgroundColor.value, backgroundColor.a);
		$container.appendChild(renderer.domElement);
		this.$el = renderer.domElement;
		this.$el.style.display = 'block';

		if (showStats) {
			this.stats = new Stats();
			$container.appendChild(this.stats.domElement);
		}

		this.setupCamera();
		this.initWidgets();
		this.bindEvents();
		this.renderLoop();
	}

	/**
	 * collect and init widgets from preinstalled widgets, plugins widgets and custom widgets
	 */
	private initWidgets() {
		let preinstalledWidgetsClasses = (this.constructor as typeof ChartView).preinstalledWidgets.slice();
		let customWidgets: ChartWidget[] = [];

		this.pluginsAndWidgets.forEach(pluginOrWidget => {
			if (pluginOrWidget instanceof ChartWidget) {
				customWidgets.push(pluginOrWidget);
				return;
			}
			if (!(pluginOrWidget instanceof ChartPlugin)) return;
			let pluginWidgetClasses = (pluginOrWidget.constructor as typeof ChartPlugin).providedWidgets;
			preinstalledWidgetsClasses.push(...pluginWidgetClasses);
		});

		this.widgets = customWidgets.concat(
			preinstalledWidgetsClasses.map((WidgetClass: IChartWidgetConstructor) => new WidgetClass())
		);

		this.widgets.forEach(widget => {
			widget.setupChart(this.chart);
			widget.onReadyHandler();
			this.scene.add(widget.getObject3D());
		});
	}

	private renderLoop() {
		if (this.isDestroyed) return;
		this.stats && this.stats.begin();
		this.render();
		if (this.isStopped) return;
		var fpsLimit = this.chart.state.autoRender.fps;

		if (fpsLimit) {
			let delay = 1000 / fpsLimit;
			setTimeout(() => requestAnimationFrame(() => this.renderLoop()), delay);
		} else {
			requestAnimationFrame(() => this.renderLoop());
		}
		this.stats && this.stats.end();
	}

	render() {
		this.chart.render();
		this.renderer.render(this.scene, this.camera);
	}

	stop() {
		this.isStopped = true;
	}

	run() {
		this.isStopped = false;
		this.renderLoop();
	}

	/**
	 * call to destroy state an init garbage collection
	 */
	destroy() {
		this.isDestroyed = true;
		this.stop();
		this.chart.destroy();
		this.unbindEvents();
		// WARNING! undocumented method for free webgl context
		try {
			(this.renderer as any).forceContextLoss();
		} catch (wtf) {
			// sometimes with many state instances forceContextLoss not working
		}
		(this.renderer as any).context = null;
		this.renderer.domElement = null;
		this.renderer = null;
	}

	getState(): IChartState {
		return this.chart.state
	}

	/**
	 * shortcut for ChartView.state.getTrend
	 */
	getTrend(trendName: string): Trend {
		return this.chart.getTrend(trendName);
	}

	/**
	 * shortcut for ChartView.state.setState
	 */
	setState(state: IChartState) {
		return this.chart.setState(state);
	}


	private bindEvents() {
		var $el = this.$el;
		if (this.chart.state.controls.enabled) {
			$el.addEventListener('mousewheel', (ev: MouseWheelEvent) => {
				this.onMouseWheel(ev)
			});
			$el.addEventListener('mousemove', (ev: MouseEvent) => {
				this.onMouseMove(ev)
			});
			$el.addEventListener('mousedown', (ev: MouseEvent) => this.onMouseDown(ev));
			$el.addEventListener('mouseup', (ev: MouseEvent) => this.onMouseUp(ev));
			$el.addEventListener('touchmove', (ev: TouchEvent) => {
				this.onTouchMove(ev)
			});
			$el.addEventListener('touchend', (ev: TouchEvent) => {
				this.onTouchEnd(ev)
			});
		}
		if (this.chart.state.autoResize) {
			this.resizeSensor = new ResizeSensor(this.$container, () => {
				this.onChartContainerResizeHandler(this.$container.clientWidth, this.$container.clientHeight);
			});
		}

		this.unsubscribers = [
			this.chart.interpolatedViewport.onInterpolation((options) => this.onScreenTransformHandler(options)),
			this.chart.onResize((options) => this.onChartResize())
		];
	}

	private unbindEvents() {
		// TODO: unbind events correctly
		try {
			this.resizeSensor && this.resizeSensor.detach();
		} catch (e) {
			// ups.. somebody already removed resizeSensor childNode
			// detected in angular2 apps
		}
		this.$el.remove();
		this.unsubscribers.forEach(unsubscribe => unsubscribe());
	}

	private setupCamera() {
		let camSettings = this.chart.viewport.getCameraSettings();
		if (!this.camera) {
			this.camera = new OrthographicCamera(
				camSettings.left,
				camSettings.right,
				camSettings.top,
				camSettings.bottom,
				camSettings.near,
				camSettings.far
			);
			this.scene.add(this.camera);
		} else {
			this.camera.left = camSettings.left;
			this.camera.right = camSettings.right;
			this.camera.top = camSettings.top;
			this.camera.bottom = camSettings.bottom;
			this.camera.near = camSettings.near;
			this.camera.far = camSettings.far;
			this.camera.updateProjectionMatrix();
		}
		this.camera.position.set(camSettings.left, camSettings.bottom, 0);
		this.cameraInitialPosition = this.camera.position.clone();
		this.onScreenTransformHandler(this.chart.interpolatedViewport.params);
	}

	private onScreenTransformHandler(options: IViewportParams) {
		if (options.scrollX != void 0) {
			let scrollX = this.cameraInitialPosition.x + options.scrollX;
			this.camera.position.setX(scrollX);
		}
		if (options.scrollY != void 0) {
			let scrollY = this.cameraInitialPosition.y + options.scrollY;
			this.camera.position.setY(scrollY);
		}
	}

	private onMouseDown(ev: MouseEvent) {
		this.setState({cursor: {dragMode: true, x: ev.clientX, y: ev.clientY}});
	}

	private onMouseUp(ev: MouseEvent) {
		this.setState({cursor: {dragMode: false}});
	}

	private onMouseMove(ev: MouseEvent) {
		if (this.chart.state.cursor.dragMode) {
			this.setState({cursor: {dragMode: true, x: ev.clientX, y: ev.clientY}});
		}
	}

	private onMouseWheel(ev: MouseWheelEvent) {
		ev.stopPropagation();
		ev.preventDefault();
		let zoomOrigin = ev.layerX / this.chart.state.width;
		let zoomValue = 1 + ev.wheelDeltaY * 0.001;
		this.zoom(zoomValue, zoomOrigin);
	}

	private onTouchMove(ev: TouchEvent) {
		this.setState({cursor: {dragMode: true, x: ev.touches[0].clientX, y: ev.touches[0].clientY}});
	}

	private onTouchEnd(ev: TouchEvent) {
		this.setState({cursor: {dragMode: false}});
	}

	private onChartContainerResizeHandler(width: number, height: number) {
		this.setState({width, height});
	}

	private onChartResize() {
		let {width, height} = this.chart.state;
		this.renderer.setSize(width, height);
		this.setupCamera();
	}

	private zoom(zoomValue: number, zoomOrigin: number) {
		const MAX_ZOOM_VALUE = 1.5;
		const MIN_ZOOM_VALUE = 0.7;
		zoomValue = Math.min(zoomValue, MAX_ZOOM_VALUE);
		zoomValue = Math.max(zoomValue, MIN_ZOOM_VALUE);
		this.chart.zoom(zoomValue, zoomOrigin);
	}


}


export class ChartView extends ChartBlankView {
	static preinstalledWidgets: typeof ChartWidget[] = [
		TrendsLineWidget,
		TrendsCandlesWidget,
		AxisWidget,
		GridWidget,
		TrendsGradientWidget
	]
}
