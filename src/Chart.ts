// deps must be always on top
import { ChartPlugin } from './Plugin';
require('./deps/deps');

import { Trend } from "./Trend";
import Vector3 = THREE.Vector3;
import PerspectiveCamera = THREE.PerspectiveCamera;
import Scene = THREE.Scene;
import Renderer = THREE.Renderer;
import WebGLRenderer = THREE.WebGLRenderer;
import Object3D = THREE.Object3D;
import { ChartState, IChartState } from "./State";
import { ChartWidget, IChartWidgetConstructor } from "./Widget";
import { Utils } from "./Utils";
import { IScreenTransformOptions } from "./Screen";
import { AxisWidget } from "./widgets/AxisWidget";
import { GridWidget } from "./widgets/GridWidget";
import { TrendsGradientWidget } from "./widgets/TrendsGradientWidget";
import { TrendsLineWidget } from "./widgets/TrendsLineWidget";
import { TrendsCandlesWidget } from './widgets/TrendsCandleWidget';
import { ResizeSensor, ResizeSensorType } from './deps';
import OrthographicCamera = THREE.OrthographicCamera;


export class Chart {

	static devicePixelRatio = window.devicePixelRatio;
	static preinstalledWidgets: typeof ChartWidget[] = [];
	static renderers: {[rendererName: string]: any} = {
		CanvasRenderer: (THREE as any).CanvasRenderer,
		WebGLRenderer: THREE.WebGLRenderer
	};

	state: ChartState;
	isStopped: boolean;
	isDestroyed: boolean;
	private $container: Element;
	private $el: HTMLElement;
	private renderer: Renderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private cameraInitialPosition: Vector3;
	private widgets: Array<ChartWidget> = [];
	private stats: Stats;
	private zoomThrottled: Function;
	private unsubscribers: Function[];
	private resizeSensor: ResizeSensorType;
	private pluginsAndWidgets: Array<ChartPlugin | ChartWidget>;

	constructor(state: IChartState, $container: Element, pluginsAndWidgets: Array<ChartPlugin | ChartWidget> = []) {

		if (!THREE || !THREE.REVISION) Utils.error('three.js not found');

		if (!$container) {
			Utils.error('$el must be set');
		}
		// calculate chart size
		let style = getComputedStyle($container);
		state.width = parseInt(style.width);
		state.height = parseInt(style.height);

		let plugins = pluginsAndWidgets.filter(pluginOrWidget => pluginOrWidget instanceof ChartPlugin) as ChartPlugin[];

		this.state = new ChartState(state, plugins);
		this.pluginsAndWidgets = pluginsAndWidgets;
		this.zoomThrottled = Utils.throttle((zoomValue: number, origin: number) => this.zoom(zoomValue, origin), 200);
		this.$container = $container;
		this.init($container);
	};

	private init($container: Element) {
		var state = this.state;
		var {width: w, height: h, showStats, autoRender} = state.data;
		this.scene = new THREE.Scene();
		this.isStopped = !autoRender.enabled;

		var renderer = this.renderer = new (Chart.renderers[this.state.data.renderer] as any)({
			antialias: true,
			alpha: true
		});
		renderer.setSize(w, h);
		renderer.setPixelRatio(Chart.devicePixelRatio);
		renderer.setClearColor(state.data.backgroundColor, state.data.backgroundOpacity);
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
		let preinstalledWidgetsClasses = (this.constructor as typeof Chart).preinstalledWidgets;
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
			widget.setupChartState(this.state);
			widget.onReadyHandler();
			this.scene.add(widget.getObject3D());
		});
	}

	private renderLoop() {
		if (this.isDestroyed) return;
		this.stats && this.stats.begin();
		this.render();
		if (this.isStopped) return;
		var fpsLimit = this.state.data.autoRender.fps;

		if (fpsLimit) {
			let delay = 1000 / fpsLimit;
			setTimeout(() => requestAnimationFrame(() => this.renderLoop()), delay);
		} else {
			requestAnimationFrame(() => this.renderLoop());
		}
		this.stats && this.stats.end();
	}

	render() {
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
	 * call to destroy chart an init garbage collection
	 */
	destroy() {
		this.isDestroyed = true;
		this.stop();
		this.state.destroy();
		this.unbindEvents();
		// WARNING! undocumented method for free webgl context
		try {
			(this.renderer as any).forceContextLoss();
		} catch (wtf) {
			// sometimes with many chart instances forceContextLoss not working
		}
		(this.renderer as any).context = null;
		this.renderer.domElement = null;
		this.renderer = null;
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
		if (this.state.data.controls.enabled) {
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
		if (this.state.data.autoResize) {
			this.resizeSensor = new ResizeSensor(this.$container, () => {
				this.onChartContainerResizeHandler(this.$container.clientWidth, this.$container.clientHeight);
			});
		}

		this.unsubscribers = [
			this.state.onTrendsChange(() => this.autoscroll()),
			this.state.screen.onTransformationFrame((options) => this.onScreenTransformHandler(options)),
			this.state.onResize((options) => this.onChartResize())
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
		let camSettings = this.state.screen.getCameraSettings();
		if (!this.camera) {
			this.camera = new PerspectiveCamera(camSettings.FOV, camSettings.aspect, camSettings.near, camSettings.far);
			this.scene.add(this.camera);
		} else {
			this.camera.fov = camSettings.FOV;
			this.camera.aspect = camSettings.aspect;
			this.camera.far = camSettings.far;
			this.camera.near = camSettings.near;
			this.camera.updateProjectionMatrix();
		}
		this.camera.position.set(camSettings.x, camSettings.y, camSettings.z);
		this.cameraInitialPosition = this.camera.position.clone();
		this.onScreenTransformHandler(this.state.screen.options);
	}

	private onScreenTransformHandler(options: IScreenTransformOptions) {
		if (options.scrollX != void 0) {
			let scrollX = this.cameraInitialPosition.x + options.scrollX;
			// scrollX =  Math.round(scrollX); // prevent to set camera beetween pixels
			this.camera.position.setX(scrollX);
		}
		if (options.scrollY != void 0) {
			let scrollY = this.cameraInitialPosition.y + options.scrollY;
			// scrollY = Math.round(scrollY); // prevent to set camera beetween pixels
			this.camera.position.setY(scrollY);
		}
	}

	private autoscroll() {
		var state = this.state;
		if (!state.data.autoScroll) return;
		var oldTrendsMaxX = state.data.prevState.computedData.trends.maxXVal;
		var trendsMaxXDelta = state.data.computedData.trends.maxXVal - oldTrendsMaxX;
		if (trendsMaxXDelta > 0) {
			var maxVisibleX = this.state.screen.getScreenRightVal();
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
		let zoomOrigin = ev.layerX / this.state.data.width;
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
		let {width, height} = this.state.data;
		this.renderer.setSize(width, height);
		this.setupCamera();
	}

	private zoom(zoomValue: number, zoomOrigin: number) {
		const MAX_ZOOM_VALUE = 1.5;
		const MIN_ZOOM_VALUE = 0.7;
		zoomValue = Math.min(zoomValue, MAX_ZOOM_VALUE);
		zoomValue = Math.max(zoomValue, MIN_ZOOM_VALUE);
		let autoScrollIsEnabled = this.state.data.autoScroll;
		if (autoScrollIsEnabled) this.state.setState({autoScroll: false});
		this.state.zoom(zoomValue, zoomOrigin).then(() => {
			if (autoScrollIsEnabled) this.setState({autoScroll: true});
		});
	}


}

// install built-in widgets
Chart.preinstalledWidgets = [
	TrendsLineWidget,
	TrendsCandlesWidget,
	AxisWidget,
	GridWidget,
	TrendsGradientWidget
];
