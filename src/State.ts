import {ITrendOptions, Trend, ITrendData} from "./Trend";
import {EventEmitter} from './deps';
import {Utils} from './Utils';
import Vector3 = THREE.Vector3;
import {IChartWidgetOptions, ChartWidget} from "./Widget";
import {Trends, ITrendsOptions} from "./Trends";
import {Screen} from "./Screen";
import {IChartEvent} from "./Events";
import {AxisMarks} from "./AxisMarks";
import {
	AXIS_TYPE, AXIS_DATA_TYPE, IAxisOptions, IAnimationsOptions, AXIS_RANGE_TYPE,
	IIteralable
} from "./interfaces";
import {Chart} from "./Chart";
import {Promise} from './deps';


interface IRecalculatedStateResult {
	changedProps: IChartState,
	patch: IChartState,
	eventsToEmit: IChartEvent[]
}

/**
 * readonly computed state data
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
	/**
	 * use fps = 0 for no limits
	 */
	autoRender?: {enabled?: boolean, fps?: number}
	autoScroll?: boolean;
	showStats?: boolean;
	computedData?: IChartStateComputedData,
	/**
	 * overridden settings for single setState operation
	 */
	operationState?: IChartState;
	[key: string]: any; // for "for in" loops
}

/**
 *  class for manage chart state, all state changes caused only by State.setState method
 */
export class ChartState {

	data: IChartState = {
		prevState: {},
		$el: null,
		zoom: 0,
		xAxis: {
			range: {type: AXIS_RANGE_TYPE.ALL, from: 0, to: 0, scroll: 0, padding: {start: 0, end: 200}, zoom: 1},
			dataType: AXIS_DATA_TYPE.NUMBER,
			gridMinSize: 100,
			autoScroll: true,
			marks: [],
		},
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.RELATIVE_END, from: 0, to: 0, padding: {start: 100, end: 100}, zoom: 1},
			dataType: AXIS_DATA_TYPE.NUMBER,
			gridMinSize: 50,
			marks: []
		},
		animations: {
			enabled: true,
			trendChangeSpeed: 0.5,
			trendChangeEase: void 0, //Linear.easeNone,
			zoomSpeed: 0.5,
			zoomEase: Linear.easeNone,
			scrollSpeed: 0.5,
			scrollEase: Linear.easeNone,
			autoScrollSpeed: 1,
			autoScrollEase: Linear.easeNone,
		},
		autoRender: {enabled: true, fps: 0},
		autoScroll: true,
		cursor: {
			dragMode: false,
			x: 0,
			y: 0
		},
		showStats: false
	};
	trends: Trends;
	screen: Screen;
	xAxisMarks: AxisMarks;
	yAxisMarks: AxisMarks;
	private ee: EventEmitter2;

	constructor(initialState: IChartState) {
		this.ee = new EventEmitter();
		this.ee.setMaxListeners(15);
		this.screen = new Screen(this);

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
		this.yAxisMarks = new AxisMarks(this, AXIS_TYPE.Y);
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


		// temporary remove trends data from newState by performance reasons
		let trendsData: {[trendName: string]: ITrendData} = {};
		if (newState.trends) for (let trendName in newState.trends) {
			let trendOptions = newState.trends[trendName];
			if (trendOptions.data) trendsData[trendName] = trendOptions.data;
			delete trendOptions.data;
		}
		let newStateContainsData = Object.keys(trendsData).length > 0;
		

		this.data = Utils.deepMerge(this.data, newState);

		// return data to state
		if (newStateContainsData) for (let trendName in trendsData) {
			this.data.trends[trendName].data = trendsData[trendName];
		}

		if (silent) return;

		// recalculate all dynamic state props
		var recalculateResult = this.recalculateState(changedProps);
		changedProps = recalculateResult.changedProps;
		
		this.emitChangedStateEvents(changedProps, eventData);

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
		var isMouseDrag = cursorOptions && data.cursor.dragMode && data.prevState.cursor.dragMode;
		if (isMouseDrag) {
			var oldX = data.prevState.cursor.x;
			var currentX =  cursorOptions.x;
			var currentScroll = data.xAxis.range.scroll;
			var deltaXVal = this.pxToValueByXAxis(oldX - currentX);
			patch.xAxis = {range: {scroll: currentScroll + deltaXVal}};
			actualData = Utils.deepMerge(actualData, {xAxis: patch.xAxis} as IChartState)
		}

		var scrollXChanged = false;
		var needToRecalculateXAxis = (
			isMouseDrag ||
			(changedProps.xAxis && (changedProps.xAxis.range)) ||
			this.data.xAxis.range.zeroVal == void 0
		);
		if (needToRecalculateXAxis) {
			let xAxisPatch = this.recalculateXAxis(actualData, changedProps);
			if (xAxisPatch) {
				scrollXChanged = true;
				patch = Utils.deepMerge(patch, {xAxis: xAxisPatch});
				actualData = Utils.deepMerge(actualData, {xAxis: xAxisPatch} as IChartState);
			}
		}



		// recalculate axis "from" and "to" for dynamics AXIS_RANGE_TYPE
		var needToRecalculateYAxis = (
			(data.yAxis.range.type === AXIS_RANGE_TYPE.RELATIVE_END || data.yAxis.range.type === AXIS_RANGE_TYPE.AUTO) &&
			(scrollXChanged || changedProps.trends || changedProps.yAxis) ||
			this.data.yAxis.range.zeroVal == void 0
		);
		if (needToRecalculateYAxis){
			let yAxisPatch = this.recalculateYAxis(actualData);
			if (yAxisPatch) {
				patch = Utils.deepMerge(patch, {yAxis: yAxisPatch});
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
		// var propsToSave = changedProps ? Object.keys(changedProps) : Object.keys(this.data);
		if (!changedProps) changedProps = this.data;
		var prevState = this.data.prevState;

		// prevent to store prev trend data by performance reasons
		Utils.copyProps(this.data, prevState, changedProps, ['trends']);

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
			(changedProps.yAxis && changedProps.yAxis.range && changedProps.yAxis.range.zoom)
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

	private recalculateXAxis(actualData: IChartState, changedProps: IChartState): IAxisOptions {
		var axisRange = actualData.xAxis.range;
		var patch: IAxisOptions = {range: {}};
		var isInitialize = axisRange.zeroVal == void 0;
		var zeroVal: number, scaleFactor: number;
		var zoom = axisRange.zoom;

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
			if (rangeMoreThenMaxValue || rangeLessThenMinValue) {
				var fixScale = rangeLength > axisRange.maxLength ?
					rangeLength / axisRange.maxLength :
					rangeLength / axisRange.minLength;
				var zoom = zoom * fixScale;
				patch.range.zoom = zoom;
				needToRecalculateZoom = true;
			}
		} while (needToRecalculateZoom);

		patch.range.from = from;
		patch.range.to = to;
		return patch;
	}


	private recalculateYAxis(actualData: IChartState): IAxisOptions {
		var patch: IAxisOptions = {range: {}};
		var yAxisRange = actualData.yAxis.range;
		var isInitialize = yAxisRange.zeroVal == void 0;
		var trends = this.trends;
		var trendsEndXVal = trends.getEndXVal();
		var trendsStartXVal = trends.getStartXVal();
		var xRange = actualData.xAxis.range;
		var {from: xFrom, to: xTo} = xRange;
		var xRangeLength = xTo - xFrom;
		var zeroVal: number, scaleFactor: number, scroll: number, zoom: number, needToZoom: boolean;

		// check situation when chart was scrolled behind trends end or before trends start
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

		var padding = yAxisRange.padding;
		var rangeLength = maxY - minY;
		var paddingTopInPercents = padding.end / actualData.height;
		var paddingBottomInPercents = padding.start / actualData.height;
		var rangeLengthInPercents = 1 - paddingTopInPercents - paddingBottomInPercents;
		var visibleRangeLength = rangeLength / rangeLengthInPercents;
		var fromVal = minY - visibleRangeLength * paddingBottomInPercents;
		var toVal = maxY + visibleRangeLength * paddingTopInPercents;
		
		if (isInitialize) {
			zeroVal = fromVal;
			scaleFactor = actualData.height / (toVal - fromVal);
			patch = { range: {zeroVal: zeroVal, scaleFactor: scaleFactor}};
			needToZoom = true;
		} else {
			scaleFactor = yAxisRange.scaleFactor;
			zeroVal = yAxisRange.zeroVal;

			var maxScreenY = Math.round(this.getScreenYByValue(maxY));
			var minScreenY = Math.round(this.getScreenYByValue(minY));
			needToZoom = (
				maxScreenY > actualData.height ||
				maxScreenY < actualData.height - padding.end ||
				minScreenY < 0 || minScreenY > padding.start
			);
		}

		if (!needToZoom) return null;

		scroll = fromVal - zeroVal;
		zoom = (actualData.height / (toVal - fromVal)) / scaleFactor ;

		var currentAxisRange = this.data.yAxis.range;
		if (currentAxisRange.from !== fromVal) patch.range.from = fromVal;
		if (currentAxisRange.to !== toVal) patch.range.to = toVal;
		if (currentAxisRange.scroll !== scroll) patch.range.scroll = scroll;
		if (currentAxisRange.zoom !== zoom) patch.range.zoom = zoom;
		
		return patch;
	}

	zoom(zoomValue: number, origin = 0.5): Promise<void> {
		let {zoom, scroll, scaleFactor} = this.data.xAxis.range;
		let newZoom = zoom * zoomValue;
		let currentRange = this.data.width / (scaleFactor * zoom);
		let nextRange = this.data.width / (scaleFactor * newZoom);
		let newScroll = scroll + (currentRange - nextRange) * origin;
		this.setState({xAxis: {range: {zoom: newZoom, scroll: newScroll}}});
		return new Promise<void>((resolve) => {
			let animationTime = this.data.animations.enabled ? this.data.animations.zoomSpeed : 0;
			setTimeout(resolve, animationTime * 1000);
		});
	}
	
	zoomToRange(range: number, origin?: number): Promise<void> {
		var {scaleFactor, zoom} = this.data.xAxis.range;
		let currentRange = this.data.width / (scaleFactor * zoom);
		return this.zoom(currentRange / range, origin);
	}

	scrollToEnd(): Promise<void> {
		let state = this.data;
		let endXVal = this.trends.getEndXVal();
		let range = state.xAxis.range;
		var scroll = endXVal - this.pxToValueByXAxis(state.width) + this.pxToValueByXAxis(range.padding.end) - range.zeroVal;
		this.setState({xAxis: {range: {scroll: scroll}}});
		return new Promise<void>((resolve) => {
			let animationTime = this.data.animations.enabled ? this.data.animations.scrollSpeed : 0;
			setTimeout(resolve, animationTime * 1000);
		});
	}

	/**
	 *  returns offset in pixels from xAxis.range.zeroVal to xVal
	 */
	getPointOnXAxis(xVal: number): number {
		var {scaleFactor, zoom, zeroVal} = this.data.xAxis.range;
		return (xVal - zeroVal) * scaleFactor * zoom;
	}

	/**
	 *  returns offset in pixels from yAxis.range.zeroVal to yVal
	 */
	getPointOnYAxis(yVal: number): number {
		var {scaleFactor, zoom, zeroVal} = this.data.yAxis.range;
		return (yVal - zeroVal) * scaleFactor * zoom;
	}

	/**
	 * returns value by offset in pixels from xAxis.range.zeroVal
	 */
	getValueOnXAxis(x: number): number {
		return this.data.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
	}


	/**
	 *  convert value to pixels by using settings from xAxis.range
	 */
	valueToPxByXAxis(xVal: number) {
		return xVal * this.data.xAxis.range.scaleFactor * this.data.xAxis.range.zoom;
	}


	/**
	 *  convert value to pixels by using settings from yAxis.range
	 */
	valueToPxByYAxis(yVal: number) {
		return yVal * this.data.yAxis.range.scaleFactor * this.data.yAxis.range.zoom;
	}

	/**
	 *  convert pixels to value by using settings from xAxis.range
	 */
	pxToValueByXAxis(xVal: number) {
		return xVal / this.data.xAxis.range.scaleFactor / this.data.xAxis.range.zoom;
	}


	/**
	 *  convert pixels to value by using settings from yAxis.range
	 */
	pxToValueByYAxis(yVal: number) {
		return yVal / this.data.yAxis.range.scaleFactor / this.data.yAxis.range.zoom;
	}


	/**
	 *  returns x value by screen x coordinate
	 */
	getValueByScreenX(x: number): number {
		var {zeroVal, scroll} = this.data.xAxis.range;
		return zeroVal + scroll + this.pxToValueByXAxis(x);
	}


	/**
	 *  returns y value by screen y coordinate
	 */
	getValueByScreenY(y: number): number {
		var {zeroVal, scroll} = this.data.yAxis.range;
		return zeroVal + scroll + this.pxToValueByYAxis(y);
	}


	/**
	 *  returns screen x value by screen y coordinate
	 */
	getScreenXByValue(xVal: number): number {
		var {scroll, zeroVal} = this.data.xAxis.range;
		return this.valueToPxByXAxis(xVal - zeroVal - scroll)
	}

	/**
	 *  returns screen y value by screen y coordinate
	 */
	getScreenYByValue(yVal: number): number {
		var {scroll, zeroVal} = this.data.yAxis.range;
		return this.valueToPxByYAxis(yVal - zeroVal - scroll)
	}


	/**
	 * returns screen x coordinate by offset in pixels from xAxis.range.zeroVal value
	 */
	getScreenXByPoint(xVal: number): number {
		return this.getScreenXByValue(this.getValueOnXAxis(xVal));
	}


	/**
	 * returns offset in pixels from xAxis.range.zeroVal value by screen x coordinate
	 */
	getPointByScreenX(screenX: number): number {
		return this.getPointOnXAxis(this.getValueByScreenX(screenX));
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

}