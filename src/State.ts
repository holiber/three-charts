import {ITrendOptions, Trend, ITrendData} from "./Trend";
var EE = require('EventEmitter2') as typeof EventEmitter2;
import {IAxisOptions, AXIS_RANGE_TYPE, IAnimationsOptions, Chart} from "./Chart";
import {Utils} from './Utils';
import Vector3 = THREE.Vector3;
import {IChartWidgetOptions, ChartWidget} from "./Widget";
import {Trends, ITrendsOptions} from "./Trends";
import {IChartEvent} from "./Events";
import {AxisMarks} from "./AxisMarks";
import {AXIS_TYPE} from "./interfaces";


interface IRecalculatedStateResult {
	changedProps: IChartState,
	patch: IChartState,
	eventsToEmit: IChartEvent[]
}

/**
 * readonly computed state data
 * calculated after recalculateState() call
 */
interface IChartStateComputedData {
	trends?: {
		maxXVal: number,
		minXVal: number
	},
	xAxis?: {
		range: {
			initialFrom: number,
			initialTo: number,
			scaleFactor: number
		}
	},
	yAxis?: {
		range: {
			initialFrom: number,
			initialTo: number,
			scaleFactor: number
		}
	}
}

export interface IChartState {
	prevState?: IChartState,
	$el?: Element;
	width?: number;
	height?: number;
	zoom?: number;
	xAxis?: IAxisOptions,
	yAxis?: IAxisOptions,
	animations?: IAnimationsOptions,
	trends?: ITrendsOptions,
	widgets?: {[widgetName: string]: IChartWidgetOptions},
	cursor?: {
		dragMode?: boolean,
		x?: number,
		y?: number
	},
	computedData?: IChartStateComputedData
	[key: string]: any; // for "for in" loops
}

export class ChartState {

	data: IChartState = {
		prevState: {},
		$el: null,
		zoom: 0,
		xAxis: {
			range: {type: AXIS_RANGE_TYPE.ALL, from: 0, to: 0, scroll: 0, padding: {start: 0, end: 200}, zoom: 1},
			gridMinSize: 120,
			autoScroll: true,
			marks: [],
		},
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.RELATIVE_END, from: 0, to: 0, padding: {start: 100, end: 100}, zoom: 1},
			gridMinSize: 60,
			marks: []
		},
		animations: {
			enabled: true,
			trendChangeSpeed: 0.5,
			trendChangeEase: void 0, //Linear.easeNone
			zoomSpeed: 0.5,
			zoomEase: void 0,//Linear.easeNone,
			autoScrollSpeed: 1,
			autoScrollEase: Linear.easeNone
		},
		cursor: {
			dragMode: false,
			x: 0,
			y: 0
		}

	};
	trends: Trends;
	xAxisMarks: AxisMarks;
	private ee: EventEmitter2;

	constructor(initialState: IChartState) {
		this.ee = new EE();
		this.ee.setMaxListeners(15);

		if (!initialState.$el) {
			Utils.error('$el must be set');
		}

		// calculate chart size
		let style = getComputedStyle(initialState.$el);
		initialState.width = parseInt(style.width);
		initialState.height = parseInt(style.height);

		this.trends = new Trends(this, initialState);
		initialState.trends = this.trends.calculatedOptions;
		this.setState(initialState);
		this.setState({computedData: this.getComputedData()});
		this.savePrevState();
		this.xAxisMarks = new AxisMarks(this, AXIS_TYPE.X);
		this.initListeners();
		
		// message to other modules that ChartState.data is ready for use 
		this.ee.emit('initialStateApplied', initialState);
		
		// message to other modules that ChartState is ready for use 
		this.ee.emit('ready', initialState);
	}

	onInitialStateApplied(cb: (initialState: IChartState) => void ): Function {
		this.ee.on('initialStateApplied', cb);
		return () => {
			this.ee.off('initialStateApplied', cb);
		}
	}

	onReady(cb: (initialState: IChartState) => void ): Function {
		this.ee.on('ready', cb);
		return () => {
			this.ee.off('ready', cb);
		}
	}

	onChange(cb: (changedProps: IChartState) => void ) {
		this.ee.on('change', cb);
	}

	onTrendChange(cb: (trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => void) {
		this.ee.on('trendChange', cb);
	}

	onTrendsChange(cb: (trendsOptions: ITrendsOptions) => void) {
		this.ee.on('trendsChange', cb);
	}

	onXAxisChange(cb: (changedOptions: IAxisOptions) => void) {
		this.ee.on('xAxisChange', cb);
	}

	onScrollStop(cb: () => void) {
		this.ee.on('scrollStop', cb);
	}

	onScroll(cb: (scrollOptions: {deltaX: number}) => void) {
		this.ee.on('scroll', cb);
		return () => {
			this.ee.off('scroll', cb);
		}
	}

	onZoom(cb: (changedProps: IChartState) => void) {
		this.ee.on('zoom', cb);
		return () => {
			this.ee.off('zoom', cb);
		}
	}

	onCameraChange(cb: (cameraOptions: {scrollX: number}) => void) {
		this.ee.on('cameraChange', cb);
	}
	
	getTrend(trendName: string): Trend {
		return this.trends.getTrend(trendName);
	}

	setState(newState: IChartState, eventData?: any, silent = false) {
		var stateData = this.data;

		var changedProps: IChartState = {};
		for (let key in newState) {
			if ((<any>stateData)[key] !== newState[key]) {
				changedProps[key] = newState[key];
			}
		}

		this.savePrevState(changedProps);

		this.data = Utils.deepMerge(this.data, newState);
		if (silent) return;

		// recalculate all dynamic state props
		var recalculateResult = this.recalculateState(changedProps);
		changedProps = recalculateResult.changedProps;
		
		this.emitChangedStateEvents(changedProps, eventData);

	}

	// emit event on state. Dirty hack, use only for performance improvements such camera position change
	emit(eventName: string, data: any) {
		this.ee.emit(eventName, data);
	}

	private initComputedData() {
		var {width, height} = this.data;
		var {from: xFrom, to: xTo} = this.data.xAxis.range;
		var {from: yFrom, to: yTo} = this.data.yAxis.range;
		this.data.computedData = {
			xAxis: {
				range: {
					initialFrom: xFrom,
					initialTo: xTo,
					scaleFactor: width / (xTo - xFrom)
				}
			},
			yAxis: {
				range: {
					initialFrom: yFrom,
					initialTo: yTo,
					scaleFactor: height / (yTo - yFrom)
				}
			}
		};
	}

	private recalculateState(changedProps?: IChartState): IRecalculatedStateResult {
		var data = this.data;
		var patch: IChartState = {};
		var eventsToEmit: IChartEvent[] = [];
		var actualData = Utils.deepMerge({}, data);

		// recalculate widgets
		if (changedProps.widgets || !data.widgets) {
			patch.widgets = {};
			let widgetsOptions = data.widgets || {};
			for (let widgetName in Chart.installedWidgets) {
				let WidgetClass = Chart.installedWidgets[widgetName];
				let userOptions = widgetsOptions[widgetName] || {};
				let defaultOptions = WidgetClass.getDefaultOptions() || ChartWidget.getDefaultOptions();
				patch.widgets[widgetName] = Utils.deepMerge(defaultOptions, userOptions) as IChartWidgetOptions;
			}
		}

		// recalculate scroll position by changed cursor options
		var cursorOptions = changedProps.cursor;
		var scrollChanged = cursorOptions && data.cursor.dragMode && data.prevState.cursor.dragMode;
		if (scrollChanged) {
			var oldX = data.prevState.cursor.x;
			var currentX =  cursorOptions.x;
			var currentScroll = data.xAxis.range.scroll;
			var deltaXVal = this.pxToValueByXAxis(oldX - currentX);
			patch.xAxis = {range: {scroll: currentScroll + deltaXVal}};
			actualData = Utils.deepMerge(actualData, {xAxis: patch.xAxis} as IChartState)
		}

		var needToRecalculateXAxis = (
			(changedProps.xAxis && changedProps.xAxis.range) ||
			this.data.xAxis.range.zeroVal == void 0
		);
		if (needToRecalculateXAxis) {
			let xAxisPatch = this.recalculateXAxis(actualData);
			if (xAxisPatch) {
				Utils.deepMerge(patch, {xAxis: xAxisPatch});
				actualData = Utils.deepMerge(actualData, {xAxis: xAxisPatch} as IChartState);
			}
		}


		// recalculate axis "from" and "to" for dynamics AXIS_RANGE_TYPE
		var needToRecalculateYAxis = (
			(data.yAxis.range.type === AXIS_RANGE_TYPE.RELATIVE_END || data.yAxis.range.type === AXIS_RANGE_TYPE.AUTO) &&
			(scrollChanged || changedProps.trends || changedProps.yAxis) ||
			this.data.yAxis.range.zeroVal == void 0
		);
		if (needToRecalculateYAxis){
			let yAxisPatch = this.recalculateYAxis(actualData);
			if (yAxisPatch) {
				Utils.deepMerge(patch, {yAxis: yAxisPatch});
				actualData = Utils.deepMerge(actualData, {yAxis: yAxisPatch} as IChartState);
			}
		}
		// TODO: recalculate xAxis

		this.savePrevState(patch);
		var allChangedProps = Utils.deepMerge(changedProps, patch);
		patch.computedData = this.getComputedData(allChangedProps);
		this.savePrevState(patch);
		this.data = Utils.deepMerge(this.data, patch);
		return {changedProps: allChangedProps, patch: patch, eventsToEmit: eventsToEmit}
	}

	private getComputedData(changedProps?: IChartState): IChartStateComputedData {
		if (!this.data.computedData) {
			this.initComputedData();
		}
		var computeAll = !changedProps;
		var computedData: IChartStateComputedData = {};

		if (computeAll || changedProps.trends && this.trends) {
			computedData.trends = {
				maxXVal: this.trends.getEndXVal(),
				minXVal: this.trends.getStartXVal()
			}
		}
		return computedData;
	}

	private savePrevState(changedProps?: IChartState) {
		var propsToSave = changedProps ? Object.keys(changedProps) : Object.keys(this.data);
		var prevState = this.data.prevState;
		for (let propName of propsToSave) {
			if (this.data[propName] == void 0) continue;

			// prevent to store prev trend data by performance reasons
			if (propName == 'trends') {
				continue;
			}

			prevState[propName] = Utils.deepCopy(this.data[propName]);
		}
	}

	private emitChangedStateEvents(changedProps: IChartState, eventData: any) {
		var prevState = this.data.prevState;

		// emit common change event
		this.ee.emit('change', changedProps, eventData);

		// emit event for each changed state property
		for (let key in changedProps) {
			this.ee.emit(key + 'Change', changedProps[key], eventData);
		}


		// emit special events based on changed state
		var scrollStopEventNeeded = (
			changedProps.cursor &&
			changedProps.cursor.dragMode === false &&
			prevState.cursor.dragMode === true
		);
		scrollStopEventNeeded && this.ee.emit('scrollStop', changedProps);

		var scrollChangeEventsNeeded = (
			changedProps.xAxis &&
			changedProps.xAxis.range &&
			changedProps.xAxis.range.scroll !== void 0
		);
		scrollChangeEventsNeeded && this.ee.emit('scroll', changedProps);

		var zoomEventsNeeded = (
			(changedProps.xAxis && changedProps.xAxis.range && changedProps.xAxis.range.zoom) ||
			(changedProps.xAxis &&
			changedProps.xAxis.range &&
			(changedProps.xAxis.range.from || changedProps.xAxis.range.to))
			||
			(changedProps.yAxis &&
			changedProps.yAxis.range &&
			(changedProps.yAxis.range.from || changedProps.yAxis.range.to))
		);
		zoomEventsNeeded && this.ee.emit('zoom', changedProps);

	}

	private initListeners() {
		this.ee.on('trendsChange', (changedTrends: ITrendsOptions, newData: ITrendData) => {
			this.handleTrendsChange(changedTrends, newData)
		});
	}

	private handleTrendsChange(changedTrends: ITrendsOptions, newData: ITrendData) {
		for (let trendName in changedTrends) {
			this.ee.emit('trendChange', trendName, changedTrends[trendName], newData);
		}
	}

	private recalculateXAxis(actualData: IChartState): IAxisOptions {
		var axisRange = actualData.xAxis.range;
		var patch: IAxisOptions = {range: {}};
		if (axisRange.zeroVal == void 0) {
			patch = {
				range: {
					zeroVal: axisRange.from,
					scaleFactor: actualData.width / (axisRange.to - axisRange.from)
				}
			}
		}
		var zeroVal = axisRange.zeroVal || patch.range.zeroVal;
		var scaleFactor = axisRange.scaleFactor || patch.range.scaleFactor;
		patch.range.from = zeroVal + axisRange.scroll;
		patch.range.to = patch.range.from + actualData.width / scaleFactor;
		return patch;
	}


	private recalculateYAxis1(actualData: IChartState): IAxisOptions {
		// TODO: make tests
		var patch: IAxisOptions = {range: {}};
		// var yAxisRange = actualData.xAxis.range;
		// var patch: IAxisOptions = {range: {}};
		// if (yAxisRange.zeroVal == void 0) {
		// 	patch = {
		// 		range: {
		// 			zeroVal: yAxisRange.from,
		// 			scaleFactor: actualData.width / (yAxisRange.to - yAxisRange.from)
		// 		}
		// 	}
		// }
		//
		// var zeroVal = axisRange.zeroVal || patch.range.zeroVal;
		// var scaleFactor = axisRange.scaleFactor || patch.range.scaleFactor;

		var trends = this.trends;
		if (!trends) return null;
		var state = this.data;
		var yAxis = actualData.yAxis;
		var xRange = actualData.xAxis.range;
		var xFromValue = xRange.from;
		var xToValue = xRange.to;
		var xRangeLength = xToValue - xFromValue;
		var trendsEndXVal = trends.getEndXVal();
		var trendsStartXVal = trends.getStartXVal();

		// check situation when chart was scrolled behind trends end or before trends start
		if (xToValue > trendsEndXVal) {
			xToValue = trendsEndXVal;
			xFromValue = xToValue - xRangeLength;
		} else if (xFromValue < trendsStartXVal) {
			xFromValue = trendsStartXVal;
			xToValue = xFromValue + xRangeLength;
		}

		var padding = state.yAxis.range.padding;
		var maxY = trends.getMaxYVal(xFromValue, xToValue);
		var minY = trends.getMinYVal(xFromValue, xToValue);
		var trendLastY = trends.getMaxYVal(trendsEndXVal, trendsEndXVal);

		if (state.yAxis.range.type == AXIS_RANGE_TYPE.RELATIVE_END) {
			if (trendLastY > maxY) maxY = trendLastY;
			if (trendLastY < minY) minY = trendLastY;
		}

		if (isNaN(maxY) || isNaN(minY) || maxY == minY) return null;

		var maxScreenY = Math.round(this.getScreenYByValue(maxY));
		var minScreenY = Math.round(this.getScreenYByValue(minY));

		var needToZoom = (
			maxScreenY > state.height ||
			maxScreenY < state.height - padding.end ||
			minScreenY < 0 || minScreenY > padding.start
		);

		if (!needToZoom) return null;

		var rangeLength = maxY - minY;
		var paddingTopInPercents = padding.end / state.height;
		var paddingBottomInPercents = padding.start / state.height;

		var to = maxY + paddingTopInPercents * rangeLength;
		var from = minY - paddingBottomInPercents * rangeLength;
		patch.range.to = to;
		patch.range.from = from;

		if (yAxis.range.zeroVal == void 0) {
			patch.range.zeroVal = from;
			patch.range.scaleFactor = actualData.height / (to - from);
		}

		var zeroVal = yAxis.range.zeroVal || patch.range.zeroVal;
		var scaleFactor = yAxis.range.scaleFactor || patch.range.scaleFactor;
		patch.range.zoom = scaleFactor / (actualData.height / (to - from));
		patch.range.scroll = from - zeroVal;
		console.log('zoomY', patch.range.zoom);
		console.log('patchY', patch);
		return patch;
	}


	private recalculateYAxis(actualData: IChartState): IAxisOptions {
		var patch: IAxisOptions = {range: {}};
		var yAxisRange = actualData.yAxis.range;
		var isInitialize = yAxisRange.zeroVal == void 0;
		var trendsEndXVal = this.trends.getEndXVal();
		var trendsStartXVal = this.trends.getStartXVal();
		var zeroVal: number, scaleFactor: number, fromVal: number;
		if (isInitialize) {
			zeroVal = (yAxisRange.from !== void 0 && yAxisRange.from) || trendsStartXVal;
			fromVal = zeroVal;
		}
		if (yAxisRange.zeroVal == void 0) {
			patch = {
				range: {
					zeroVal: yAxisRange.from,
					scaleFactor: actualData.width / (yAxisRange.to - yAxisRange.from)
				}
			}
		}
		return patch;
	}

	zoom(zoomValue: number) {
		// var {from, to} = this.data.xAxis.range;
		// var rangeLength = to - from;
		// var middleScreenValue = this.getValueByScreenX(this.data.width / 2);
		// var leftScreenValue = this.getValueByScreenX(0);
		// var rightScreenValue = this.getValueByScreenX(this.data.width);
		// var newTo = middleScreenValue + (rightScreenValue - middleScreenValue) * zoomValue;
		// var newFrom = middleScreenValue - (middleScreenValue - leftScreenValue) * zoomValue;
		// this.setState(
		// 	{xAxis: {range: {from: newFrom, to: newTo, scroll: 0}}}
		// );
		var currentZoom = this.data.xAxis.range.zoom;
		this.setState({xAxis: {range: {zoom: currentZoom * zoomValue}}});
	}

	/**
	 *  returns offset in pixels from xAxis.range.from to xVal
	 */
	getPointOnXAxis(xVal: number): number {
		// var w = this.data.width;
		// var {from, to} = this.data.xAxis.range;
		// return w * ((xVal - from) / (to - from));
		return xVal * this.data.computedData.xAxis.range.scaleFactor * this.data.xAxis.range.zoom;
	}

	/**
	 *  returns offset in pixels from yAxis.range.from to yVal
	 */
	getPointOnYAxis(yVal: number): number {
		var h = this.data.height;
		var {from, to} = this.data.yAxis.range;
		return h * ((yVal - from) / (to - from));
	}

	/**
	 * returns value by offset in pixels from xAxis.range.from
	 */
	getValueOnXAxis(x: number): number {
		var {from} = this.data.xAxis.range;
		return from + this.pxToValueByXAxis(x);
	}


	/**
	 *  convert value to pixels by using settings from xAxis.range
	 */
	valueToPxByXAxis(xVal: number) {
		// var w = this.data.width;
		// var {from, to} = this.data.xAxis.range;
		// return xVal * (w / (to - from));
		return xVal * this.data.computedData.xAxis.range.scaleFactor * this.data.xAxis.range.zoom;
	}


	/**
	 *  convert value to pixels by using settings from yAxis.range
	 */
	valueToPxByYAxis(yVal: number) {
		var h = this.data.height;
		var {from, to} = this.data.yAxis.range;
		return  yVal * (h / (to - from));
	}

	/**
	 *  convert pixels to value by using settings from xAxis.range
	 */
	pxToValueByXAxis(xVal: number) {
		return xVal / this.data.computedData.xAxis.range.scaleFactor / this.data.xAxis.range.zoom;
	}

	/**
	 *  convert pixels to value by using settings from yAxis.range
	 */
	pxToValueByYAxis(yVal: number) {
		var h = this.data.height;
		var {from, to} = this.data.yAxis.range;
		return yVal * ((to - from) / h);
	}


	/**
	 *  returns x value by screen x coordinate
	 */
	getValueByScreenX(x: number): number {
		var {from, scroll} = this.data.xAxis.range;
		return from + scroll + this.pxToValueByXAxis(x);
	}


	/**
	 *  returns y value by screen y coordinate
	 */
	getValueByScreenY(y: number): number {
		var h = this.data.height;
		var {from, to} = this.data.yAxis.range;
		var pxCoast = (to - from) / h;
		return from + pxCoast * y;
	}


	/**
	 *  returns screen x value by screen y coordinate
	 */
	getScreenXByValue(xVal: number): number {
		// var w = this.data.width;
		// var {from, to, scroll, zoom} = this.data.xAxis.range;
		// var valCoast =  w / (to - from) * zoom;
		// return valCoast * (xVal - from) - valCoast * scroll;
		var w = this.data.width;
		var {initialFrom, scaleFactor} = this.data.computedData.xAxis.range;
		var {scroll} = this.data.xAxis.range;
		// var valCoast =  w / (to - from) * zoom;
		// return valCoast * (xVal - from) - valCoast * scroll;
		return this.valueToPxByXAxis(xVal - initialFrom - scroll)
	}

	/**
	 *  returns screen y value by screen y coordinate
	 */
	getScreenYByValue(yVal: number): number {
		var h = this.data.height;
		var {from, to} = this.data.yAxis.range;
		var valCoast = h / (to - from);
		return valCoast * (yVal - from);
	}


	/**
	 * returns screen x coordinate by offset in pixels from xAxis.range.from value
	 */
	getScreenXByPoint(xVal: number): number {
		return this.getScreenXByValue(this.getValueOnXAxis(xVal));
	}

	/**
	 * returns offset in pixels from xAxis.range.from value by screen x coordinate
	 */
	getPointByScreenX(screenX: number): number {
		return this.getPointOnXAxis(this.getValueByScreenX(screenX));
	}

	getPxCoast() {
		var w = this.data.width;
		var {from, to} = this.data.xAxis.range;
		return (to - from) / w;
	}
	

	getPointOnChart(xVal: number, yVal: number): Vector3 {
		return new Vector3(this.getPointOnXAxis(xVal), this.getPointOnYAxis(yVal), 0);
	}


	getScreenLeftVal() {
		return this.getValueByScreenX(0);
	}


	getScreenRightVal() {
		return this.getValueByScreenX(this.data.width);
	}


	getPaddingRight(): number {
		return this.getValueByScreenX(this.data.width - this.data.xAxis.range.padding.end);
	}

	scrollToEnd() {
		var rightPadding = this.data.xAxis.range.padding.end;
		var scrollPos = -this.getPointOnXAxis(this.data.computedData.trends.maxXVal) + this.data.width - rightPadding;
		this.setState({xAxis: {range: {scroll: scrollPos}}})
	}

}