import Vector3 = THREE.Vector3;
import { ITrendOptions, Trend, ITrendData, TREND_TYPE } from "./Trend";
import { EventEmitter } from './EventEmmiter';
import { Utils } from './Utils';
import { TrendsManager, ITrendsOptions } from "./TrendsManager";
import { Viewport } from "./Viewport";
import { InterpolatedViewport } from "./InterpolatedViewport";
import { Promise } from './deps/deps';
import { ChartPlugin } from './Plugin';
import { TColor } from "./Color";
import { AnimationManager } from "./AnimationManager";
import { EASING } from './Easing';
import {
	AXIS_TYPE, AXIS_DATA_TYPE, IAxisOptions, IAnimationsOptions, AXIS_RANGE_TYPE
} from "./interfaces";

interface IRecalculatedStateResult {
	changedProps: IChartState,
	patch: IChartState
}

const CHART_STATE_EVENTS = {
	INITIAL_STATE_APPLIED: 'initialStateApplied',
	READY: 'ready',
	DESTROY: 'destroy',
	CHANGE: 'change',
	TREND_CHANGE: 'trendChange',
	TRENDS_CHANGE: 'trendsChange',
	ZOOM: 'zoom',
	RESIZE: 'resize',
	SCROLL: 'scroll',
	VIEWPORT_CHANGE: 'viewportChange',
	DRAG_STATE_CHAGED: 'scrollStop',
	PLUGINS_STATE_CHANGED: 'pluginsStateChanged'
};

/**
 * readonly computed state state
 * calculated after recalculateState() call
 * contains cached values
 */
export interface IChartStateComputedData {
	trends?: {
		maxXVal: number,
		minXVal: number
	}
}

export interface IChartState {
	prevState?: IChartState,
	width?: number;
	height?: number;
	zoom?: number;
	xAxis?: IAxisOptions,
	yAxis?: IAxisOptions,
	animations?: IAnimationsOptions,
	trends?: ITrendsOptions,
	trendDefaultState?: ITrendOptions;
	cursor?: {
		dragMode?: boolean,
		x?: number,
		y?: number
	},

	/**
	 * use fps = 0 for no limits
	 */
	autoRender?: {enabled?: boolean, fps?: number};

	/**
	 * by default 'WebGLRenderer'
	 * also available 'CanvasRenderer'
	 */
	renderer?: 'WebGLRenderer' | 'CanvasRenderer';
	font?: {s?: string, m?: string, l?:string}

	/**
	 * set to false for smooth animations
	 */
	enablePixelPerfectRender?: boolean,

	/**
	 * buffer size for displayed segments
	 * used by widgets
	 */
	maxVisibleSegments?: number;
	autoResize?: boolean;
	controls?: {enabled: boolean};
	autoScroll?: boolean;
	inertialScroll?: boolean

	//TODO: exclude stats in plugin
	showStats?: boolean;
	backgroundColor?: TColor;
	computedData?: IChartStateComputedData,
	pluginsState?: {[pluginName: string]: any};
	eventEmitterMaxListeners?: number;
}

const LIGHT_BLUE = '#5273bd';

/**
 *  all state changes caused only by Chart.setState method
 */
export class Chart {

	state: IChartState = {
		prevState: {},
		zoom: 0,
		xAxis: {
			range: {
				type: AXIS_RANGE_TYPE.ALL,
				from: 0,
				to: 0,
				scroll: 0,
				zoom: 1,
				padding: {start: 0, end: 5},
				margin: {start: 0, end: 5}
			},
			dataType: AXIS_DATA_TYPE.NUMBER,
			grid: {enabled: true, minSizePx:  100, color: `rgba(${LIGHT_BLUE}, 0.12)`},
			color: LIGHT_BLUE
		},
		yAxis: {
			range: {
				type: AXIS_RANGE_TYPE.RELATIVE_END,
				from: 0,
				to: 0,
				zoom: 1,
				padding: {start: 5, end: 5},
				margin: {start: 5, end: 5},
			},
			grid: {enabled: true, minSizePx:  50, color: `rgba(${LIGHT_BLUE}, 0.12)`},
			dataType: AXIS_DATA_TYPE.NUMBER,
			color: LIGHT_BLUE
		},
		animations: {
			enabled: true,
			trendChangeSpeed: 0.5,
			trendChangeEase: void 0,
			zoomSpeed: 250,
			scrollSpeed: 1000,
			scrollEase: EASING.Quadratic.Out,
			zoomEase: EASING.Quadratic.Out,
			autoScrollSpeed: 1100,
			autoScrollEase: EASING.Linear.None,
		},
		autoRender: {enabled: true, fps: 0},
		autoResize: true,
		renderer: 'WebGLRenderer',//'WebGLRenderer',
		autoScroll: true,
		controls: {enabled: true},
		trendDefaultState: {
			enabled: true,
			type: TREND_TYPE.LINE,
			data: [],
			maxSegmentLength: 1000,
			lineWidth: 2,
			lineColor: 0xFFFFFF,
			hasBackground: true,
			backgroundColor: 'rgba(#FFFFFF, 0.07)',
			hasBeacon: false,
			settingsForTypes: {
				CANDLE: {
					minSegmentLengthInPx: 20,
					maxSegmentLengthInPx: 40,
				},
				LINE: {
					minSegmentLengthInPx: 2,
					maxSegmentLengthInPx: 10,
				}
			}
		},
		cursor: {
			dragMode: false,
			x: 0,
			y: 0
		},
		font: {
			s: '11px Arial',
			m: '12px Arial',
			l: '13px Arial'
		},
		backgroundColor: 0x000c2a,
		showStats: false,
		pluginsState: {},
		eventEmitterMaxListeners: 20,
		maxVisibleSegments: 1280,
		inertialScroll: false
	};
	plugins: {[pluginName: string]: ChartPlugin<any>} = {};
	trendsManager: TrendsManager;
	animationManager: AnimationManager;
	viewport: Viewport;
	interpolatedViewport: InterpolatedViewport;

	/**
	 * true then state was initialized and ready to use
	 */
	isReady = false;
	isDestroyed = false;


	private ee: EventEmitter;

	constructor(
		initialState: IChartState,
		plugins: ChartPlugin<any>[] = []
	) {
		this.ee = new EventEmitter();
		this.ee.setMaxListeners(initialState.eventEmitterMaxListeners || this.state.eventEmitterMaxListeners);

		this.state = Utils.patch(this.state, initialState); //Utils.deepMerge(this.state, initialState);
		this.trendsManager = new TrendsManager(this, initialState);
		initialState.trends = this.trendsManager.calculatedOptions;
		initialState = this.installPlugins(plugins, initialState);

		this.animationManager = new AnimationManager();
		this.animationManager.setAimationsEnabled(this.state.animations.enabled);
		this.viewport = new Viewport(this);

		this.setState(initialState);
		this.setState({computedData: this.getComputedData()});
		this.savePrevState();

		this.interpolatedViewport = new InterpolatedViewport(this);
		this.bindEvents();


		
		// message to other modules that Chart.state is ready for use
		this.ee.emit(CHART_STATE_EVENTS.INITIAL_STATE_APPLIED, initialState);

		// message to other modules that Chart is ready for use
		this.isReady = true;
		this.ee.emit(CHART_STATE_EVENTS.READY, initialState);

	}

	/**
	 * destroy chart, use ChartView.destroy to completely destroy Chart
	 */
	destroy() {
		this.ee.emit(CHART_STATE_EVENTS.DESTROY);
		this.ee.removeAllListeners();
		this.state = {};
		this.isDestroyed = true;
	}

	onDestroy(cb: Function) {
		return this.ee.subscribe(CHART_STATE_EVENTS.DESTROY, cb);
	}

	onInitialStateApplied(cb: (initialState: IChartState) => void ): Function {
		return this.ee.subscribe(CHART_STATE_EVENTS.INITIAL_STATE_APPLIED, cb);
	}

	onReady(cb: (initialState: IChartState) => void ): Function {
		return this.ee.subscribe(CHART_STATE_EVENTS.READY, cb);
	}

	onChange(cb: (changedProps: IChartState) => void ) {
		return this.ee.subscribe(CHART_STATE_EVENTS.CHANGE, cb);
	}

	onTrendChange(cb: (trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => void) {
		return this.ee.subscribe(CHART_STATE_EVENTS.TREND_CHANGE, cb);
	}

	onTrendsChange(cb: (trendsOptions: ITrendsOptions) => void) {
		return this.ee.subscribe(CHART_STATE_EVENTS.TRENDS_CHANGE, cb);
	}

	onDragStateChanged(cb: (isDragMode: boolean, changedProps: IChartState) => void) {
		return this.ee.subscribe(CHART_STATE_EVENTS.DRAG_STATE_CHAGED, cb);
	}

	onScroll(cb: (scrollOptions: {deltaX: number}) => void) {
		return this.ee.subscribe(CHART_STATE_EVENTS.SCROLL, cb);
	}

	onZoom(cb: (changedProps: IChartState) => void) {
		return this.ee.subscribe(CHART_STATE_EVENTS.ZOOM, cb);
	}

	onResize(cb: (changedProps: IChartState) => void) {
		return this.ee.subscribe(CHART_STATE_EVENTS.RESIZE, cb);
	}

	onViewportChange(cb: (changedProps: IChartState) => void) {
		return this.ee.subscribe(CHART_STATE_EVENTS.VIEWPORT_CHANGE, cb);
	}

	onPluginsStateChange(cb: (changedPluginsStates: {[pluginName: string]: Plugin}) => any) {
		return this.ee.subscribe(CHART_STATE_EVENTS.PLUGINS_STATE_CHANGED, cb);
	}
	
	getTrend(trendName: string): Trend {
		return this.trendsManager.getTrend(trendName);
	}

	render() {
		this.animationManager.tick();
	}

	setState(newState: IChartState, eventData?: any, silent = false) {

		if (this.isDestroyed) {
			Utils.error('You have tried to change state of destroyed Chart instance');
		}

		// temporary remove trends state from newState by performance reasons
		let trendsData: {[trendName: string]: ITrendData} = {};
		if (newState.trends) for (let trendName in newState.trends) {
			let trendOptions = newState.trends[trendName];
			if (trendOptions.data) trendsData[trendName] = trendOptions.data;
			delete trendOptions.data;
		}
		let newStateContainsData = Object.keys(trendsData).length > 0;


		// setup ids to array items
		newState = Utils.deepMerge({}, newState);
		Utils.setIdsToArrayItems(newState);

		let currentStateData = this.state as {[key: string]: any};
		let newStateObj = newState as {[key: string]: any};

		var changedProps: {[key: string]: any} = {};
		for (let key in newStateObj) {
			if (currentStateData[key] !== newStateObj[key]) {
				changedProps[key] = newStateObj[key] as any;
			}
		}

		this.savePrevState(changedProps as IChartState);
		this.state = Utils.patch(this.state, newState); //Utils.deepMerge(this.state, newState, false);


		// return trends to state
		if (newStateContainsData) for (let trendName in trendsData) {
			this.state.trends[trendName].data = trendsData[trendName];
		}

		if (silent) return;

		// recalculate all dynamic state props
		var recalculateResult = this.recalculateState(changedProps);
		changedProps = recalculateResult.changedProps;
		
		this.emitChangedStateEvents(changedProps, eventData);

	}

	/**
	 * recalculate all computed state props
	 */
	private recalculateState(changedProps?: IChartState): IRecalculatedStateResult {
		var data = this.state;
		var patch: IChartState = {};
		var actualData = Utils.patch({}, data); //Utils.deepMerge({}, data);

		// recalculate scroll position by changed cursor params
		var cursorOptions = changedProps.cursor;
		var isMouseDrag = cursorOptions && data.cursor.dragMode && data.prevState.cursor.dragMode;
		if (isMouseDrag) {
			var oldX = data.prevState.cursor.x;
			var currentX =  cursorOptions.x;
			var currentScroll = data.xAxis.range.scroll;
			var deltaXVal = this.viewport.pxToValByXAxis(oldX - currentX);
			patch.xAxis = {range: {scroll: currentScroll + deltaXVal}};
			actualData = Utils.patch(actualData, {xAxis: patch.xAxis} as IChartState);//Utils.deepMerge(actualData, {xAxis: patch.xAxis} as IChartState)
		}

		let chartWasResized = changedProps.width != void 0 || changedProps.height != void 0;

		let scrollXChanged = false;
		let needToRecalculateXAxis = (
			isMouseDrag ||
			chartWasResized ||
			(changedProps.xAxis && (changedProps.xAxis.range)) ||
			this.state.xAxis.range.zeroVal == void 0
		);
		if (needToRecalculateXAxis) {
			let xAxisPatch = this.recalculateXAxis(actualData, changedProps);
			if (xAxisPatch) {
				scrollXChanged = true;
				//patch = Utils.deepMerge(patch, {xAxis: xAxisPatch});
				Utils.patch(patch, {xAxis: xAxisPatch});
				//actualData = Utils.deepMerge(actualData, {xAxis: xAxisPatch} as IChartState);
				Utils.patch(actualData, {xAxis: xAxisPatch} as IChartState);
			}
		}



		// recalculate axis "from" and "to" for dynamics AXIS_RANGE_TYPE
		let needToRecalculateYAxis = (
			chartWasResized ||
			(
				data.yAxis.range.type === AXIS_RANGE_TYPE.RELATIVE_END ||
				data.yAxis.range.type === AXIS_RANGE_TYPE.AUTO ||
				data.yAxis.range.isMirrorMode
			) &&
			(scrollXChanged || changedProps.trends || changedProps.yAxis) ||
			this.state.yAxis.range.zeroVal == void 0
		);
		if (needToRecalculateYAxis){
			let yAxisPatch = this.recalculateYAxis(actualData);
			if (yAxisPatch) {
				// patch = Utils.deepMerge(patch, {yAxis: yAxisPatch});
				// actualData = Utils.deepMerge(actualData, {yAxis: yAxisPatch} as IChartState);
				Utils.patch(patch, {yAxis: yAxisPatch});
				Utils.patch(actualData, {yAxis: yAxisPatch} as IChartState);
			}
		}

		this.savePrevState(patch);
		let allChangedProps = Utils.deepMerge(changedProps, patch);
		patch.computedData = this.getComputedData(allChangedProps);
		this.savePrevState(patch);
		// this.state = Utils.deepMerge(this.state, patch);
		Utils.patch(this.state, patch);
		return {changedProps: allChangedProps, patch: patch}
	}

	private getComputedData(changedProps?: IChartState): IChartStateComputedData {
		var computeAll = !changedProps;
		var computedData: IChartStateComputedData = {};

		if (computeAll || changedProps.trends && this.trendsManager) {
			computedData.trends = {
				maxXVal: this.trendsManager.getEndXVal(),
				minXVal: this.trendsManager.getStartXVal()
			}
		}
		return computedData;
	}

	private savePrevState(changedProps?: IChartState) {
		if (!changedProps) changedProps = this.state;
		var prevState = this.state.prevState;

		// prevent to store prev trend state by performance reasons
		Utils.copyProps(this.state, prevState, changedProps, ['trends']);

	}

	private emitChangedStateEvents(changedProps: IChartState, eventData: any) {
		var prevState = this.state.prevState;

		// emit common change event
		this.ee.emit(CHART_STATE_EVENTS.CHANGE, changedProps, eventData);

		// emit event for each changed state property
		for (let key in changedProps) {
			this.ee.emit(key + 'Change', (changedProps as {[key: string]: any})[key], eventData);
		}

		if (!this.isReady) return;

		// emit special events based on changed state
		let dragEventNeeded = (
			changedProps.cursor &&
			(changedProps.cursor.dragMode != prevState.cursor.dragMode)
		);
		dragEventNeeded && this.ee.emit(CHART_STATE_EVENTS.DRAG_STATE_CHAGED, changedProps.cursor.dragMode, changedProps);

		let scrollChangeEventsNeeded = (
			changedProps.xAxis &&
			changedProps.xAxis.range &&
			changedProps.xAxis.range.scroll != void 0
		);
		scrollChangeEventsNeeded && this.ee.emit(CHART_STATE_EVENTS.SCROLL, changedProps);

		let zoomEventsNeeded = (
			(changedProps.xAxis && changedProps.xAxis.range && changedProps.xAxis.range.zoom) ||
			(changedProps.yAxis && changedProps.yAxis.range && changedProps.yAxis.range.zoom)
		);
		zoomEventsNeeded && this.ee.emit(CHART_STATE_EVENTS.ZOOM, changedProps);

		let resizeEventNeeded = (changedProps.width || changedProps.height);
		resizeEventNeeded && this.ee.emit(CHART_STATE_EVENTS.RESIZE, changedProps);

		let viewportChangeEventNeeded = scrollChangeEventsNeeded || zoomEventsNeeded || resizeEventNeeded;
		if (viewportChangeEventNeeded) this.ee.emit(CHART_STATE_EVENTS.VIEWPORT_CHANGE, changedProps);

		let pluginStateChangedEventNeeded = !!(changedProps.pluginsState);
		pluginStateChangedEventNeeded && this.ee.emit(CHART_STATE_EVENTS.PLUGINS_STATE_CHANGED, changedProps.pluginsState);
	}


	/**
	 * init plugins and save plugins params in initialState
	 */
	private installPlugins(plugins: ChartPlugin<any>[], initialState: IChartState): IChartState {
		initialState.pluginsState = {};
		plugins.forEach(plugin => {
			let PluginClass = plugin.constructor as typeof ChartPlugin;
			let pluginName = PluginClass.NAME;
			initialState.pluginsState[pluginName] = plugin.initialState;
			this.plugins[pluginName] = plugin;
			plugin.setupChart(this);
		});
		return initialState;
	}


	/**
	 * returns plugin instance by plugin name
	 * @example
	 */
	getPlugin(pluginName: string): ChartPlugin<any> {
		return this.plugins[pluginName];
	}


	private bindEvents() {
		this.ee.on(CHART_STATE_EVENTS.TRENDS_CHANGE, (changedTrends: ITrendsOptions, newData: ITrendData) => {
			this.handleTrendsChange(changedTrends, newData)
		});

		this.onDragStateChanged(dragState => this.onDragStateChangedHandler(dragState));

		this.ee.on('animationsChange', (animationOptions: IAnimationsOptions) => {
			if (animationOptions.enabled !== this.animationManager.isAnimationsEnabled) {
				this.animationManager.setAimationsEnabled(animationOptions.enabled);
			}
		});
	}

	private handleTrendsChange(changedTrends: ITrendsOptions, newData: ITrendData) {
		for (let trendName in changedTrends) {
			this.ee.emit(CHART_STATE_EVENTS.TREND_CHANGE, trendName, changedTrends[trendName], newData);
		}

		// process autoscroll
		let state = this.state;
		if (!state.autoScroll || state.cursor.dragMode) return;
		let oldTrendsMaxX = state.prevState.computedData.trends.maxXVal;
		let trendsMaxXDelta = state.computedData.trends.maxXVal - oldTrendsMaxX;

		if (trendsMaxXDelta > 0) {
			let maxVisibleXVal = this.viewport.getRightVal();
			let paddingRightVal = this.viewport.getValByViewportX(
				this.state.width -
				state.xAxis.range.padding.end -
				state.xAxis.range.margin.end
			);
			let marginRightVal = this.viewport.getValByViewportX(
				this.state.width -
				state.xAxis.range.margin.end
			);
			var currentScroll = state.xAxis.range.scroll;
			if (oldTrendsMaxX < marginRightVal || oldTrendsMaxX > maxVisibleXVal) {
				return;
			}

			let scrollDelta = state.computedData.trends.maxXVal - paddingRightVal;

			this.setState({xAxis: {range: {scroll: currentScroll + scrollDelta}}});
		}
	}

	private onDragStateChangedHandler(isDragMode: boolean) {

		// process inertial scroll
		let state = this.state;
		if (!state.inertialScroll || isDragMode) return;

		// TODO:
		// let currentScroll = state.xAxis.range.scroll;
		// let currentX = state.cursor.x;
		// let prevX = state.prevState.cursor.x;
		// let scrollDelta = this.pxToValueByXAxis(prevX - currentX) * 10;
		// this.setState({xAxis: {range: {scroll: currentScroll + scrollDelta}}})
	}

	private recalculateXAxis(actualData: IChartState, changedProps: IChartState): IAxisOptions {
		var axisRange = actualData.xAxis.range;
		var patch: IAxisOptions = {range: {}};
		var isInitialize = axisRange.zeroVal == void 0;
		var zeroVal: number, scaleFactor: number;
		var zoom = axisRange.zoom;

		if (axisRange.isMirrorMode) {
			Utils.error('range.isMirrorMode available only for yAxis.range');
		}

		if (isInitialize) {
			zeroVal = axisRange.from;
			scaleFactor = actualData.width / (axisRange.to - axisRange.from);
			patch = { range: {zeroVal: zeroVal, scaleFactor: scaleFactor}};
		} else {
			zeroVal = axisRange.zeroVal;
			scaleFactor = axisRange.scaleFactor;

			// recalculate range.zoom and range.scroll then range.from or range.to was changed
			if (
				changedProps.xAxis &&
				(changedProps.xAxis.range.from != void 0 || changedProps.xAxis.range.to)
			) {
				if (changedProps.xAxis.range.zoom) {
					Utils.error('Impossible to change "range.zoom" then "range.from" or "range.to" present');
				}
				let currentScaleFactor = actualData.width / (axisRange.to - axisRange.from);
				patch.range.scroll = axisRange.from - zeroVal;
				patch.range.zoom = currentScaleFactor / scaleFactor;
				return patch;
			}
		}


		// recalculate range.from and range.to then range.zoom or range.scroll was changed
		do {
			var from = zeroVal + axisRange.scroll;
			var to = from + actualData.width / (scaleFactor * zoom);
			var rangeLength = to - from;
			var needToRecalculateZoom = false;
			var rangeMoreThenMaxValue = (axisRange.maxLength && rangeLength > axisRange.maxLength);
			var rangeLessThenMinValue = (axisRange.minLength && rangeLength < axisRange.minLength);
			needToRecalculateZoom = rangeMoreThenMaxValue || rangeLessThenMinValue;
			if (needToRecalculateZoom) {
				var fixScale = rangeLength > axisRange.maxLength ?
					rangeLength / axisRange.maxLength :
					rangeLength / axisRange.minLength;
				var zoom = zoom * fixScale;
				patch.range.zoom = zoom;
			}
		} while (needToRecalculateZoom);

		patch.range.from = from;
		patch.range.to = to;
		return patch;
	}


	private recalculateYAxis(actualData: IChartState): IAxisOptions {
		var patch: IAxisOptions = {range: {}};
		var yAxisRange = actualData.yAxis.range;
		var isInitialize = yAxisRange.scaleFactor == void 0;
		var trends = this.trendsManager;
		var trendsEndXVal = trends.getEndXVal();
		var trendsStartXVal = trends.getStartXVal();
		var xRange = actualData.xAxis.range;
		var {from: xFrom, to: xTo} = xRange;
		var xRangeLength = xTo - xFrom;
		var zeroVal: number, scaleFactor: number, scroll: number, zoom: number, needToZoom: boolean;

		// check situation when state was scrolled behind trends end or before trends start
		if (xTo > trendsEndXVal) {
			xTo = trendsEndXVal;
			xFrom = xTo - xRangeLength;
		} else if (xFrom < trendsStartXVal) {
			xFrom = trendsStartXVal;
			xTo = xFrom + xRangeLength;
		}

		var maxY = trends.getMaxYVal(xFrom, xTo);
		var minY = trends.getMinYVal(xFrom, xTo);

		var trendLastY = trends.getMaxYVal(trendsEndXVal, trendsEndXVal);
		if (yAxisRange.type == AXIS_RANGE_TYPE.RELATIVE_END) {
			if (trendLastY > maxY) maxY = trendLastY;
			if (trendLastY < minY) minY = trendLastY;
		}

		if (yAxisRange.isMirrorMode) {
			if (yAxisRange.zeroVal == void 0) Utils.error('range.zeroVal must be set when range.isMirrorMode');
			let distanceFromZeroValForMaxY = Math.abs(yAxisRange.zeroVal - maxY);
			let distanceFromZeroValForMinY = Math.abs(yAxisRange.zeroVal - minY);
			let maxDistanceFromZeroVal = Math.max(distanceFromZeroValForMaxY, distanceFromZeroValForMinY);
			maxY = yAxisRange.zeroVal + maxDistanceFromZeroVal;
			minY = yAxisRange.zeroVal - maxDistanceFromZeroVal;
		}
		let margin = yAxisRange.margin;
		let padding = {
			start: yAxisRange.padding.start + margin.start,
			end: yAxisRange.padding.end + margin.end
		};

		if (padding.end + padding.start >= actualData.height) {
			Utils.warn('Sum of padding and margins of yAxi more then available state height. Trends can be rendered incorrectly');
		}

		let rangeLength = maxY - minY;
		let paddingTopInPercents = padding.end / actualData.height;
		let paddingBottomInPercents = padding.start / actualData.height;
		let rangeLengthInPercents = 1 - paddingTopInPercents - paddingBottomInPercents;
		let visibleRangeLength = rangeLength / rangeLengthInPercents;
		let fromVal = minY - visibleRangeLength * paddingBottomInPercents;
		let toVal = maxY + visibleRangeLength * paddingTopInPercents;
		
		if (isInitialize) {
			zeroVal = yAxisRange.zeroVal != void 0 ? yAxisRange.zeroVal : fromVal;
			scaleFactor = actualData.height / (toVal - fromVal);
			patch = { range: {zeroVal: zeroVal, scaleFactor: scaleFactor}};
			needToZoom = true;
		} else {
			scaleFactor = yAxisRange.scaleFactor;
			zeroVal = yAxisRange.zeroVal;

			let maxScreenY = Math.round(this.viewport.getViewportYByVal(maxY));
			let minScreenY = Math.round(this.viewport.getViewportYByVal(minY));
			needToZoom = (
				maxScreenY > actualData.height - margin.end ||
				maxScreenY < actualData.height - padding.end ||
				minScreenY < margin.start ||
				minScreenY > padding.start
			);
		}

		if (!needToZoom) return null;

		scroll = fromVal - zeroVal;
		zoom = (actualData.height / (toVal - fromVal)) / scaleFactor ;

		var currentAxisRange = this.state.yAxis.range;
		if (currentAxisRange.from !== fromVal) patch.range.from = fromVal;
		if (currentAxisRange.to !== toVal) patch.range.to = toVal;
		if (currentAxisRange.scroll !== scroll) patch.range.scroll = scroll;
		if (currentAxisRange.zoom !== zoom) patch.range.zoom = zoom;
		
		return patch;
	}

	zoom(zoomValue: number, origin = 0.5): Promise<void> {
		let {zoom, scroll, scaleFactor} = this.state.xAxis.range;
		let newZoom = zoom * zoomValue;
		let currentRange = this.state.width / (scaleFactor * zoom);
		let nextRange = this.state.width / (scaleFactor * newZoom);
		let newScroll = scroll + (currentRange - nextRange) * origin;
		this.setState({xAxis: {range: {zoom: newZoom, scroll: newScroll}}});
		return new Promise<void>((resolve) => {
			let animationTime = this.state.animations.enabled ? this.state.animations.zoomSpeed : 0;
			setTimeout(resolve, animationTime * 1000);
		});
	}
	
	zoomToRange(range: number, origin?: number): Promise<void> {
		var {scaleFactor, zoom} = this.state.xAxis.range;
		let currentRange = this.state.width / (scaleFactor * zoom);
		return this.zoom(currentRange / range, origin);
	}

	scrollToEnd(): Promise<void> {
		let state = this.state;
		let endXVal = this.trendsManager.getEndXVal();
		let range = state.xAxis.range;
		let scroll = (
			endXVal - this.viewport.pxToValByXAxis(state.width) +
			this.viewport.pxToValByXAxis(range.padding.end + range.margin.end) -
			range.zeroVal
		);
		this.setState({xAxis: {range: {scroll: scroll}}});
		return new Promise<void>((resolve) => {
			let animationTime = state.animations.enabled ? state.animations.scrollSpeed : 0;
			setTimeout(resolve, animationTime);
		});
	}

}
