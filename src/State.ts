import {ITrendOptions, Trend, ITrendData} from "./Trend";
var EE = require('EventEmitter2') as typeof EventEmitter2;
import {IAxisOptions, AXIS_RANGE_TYPE, IAnimationsOptions, Chart} from "./Chart";
import {Utils} from './Utils';
import Vector3 = THREE.Vector3;
import {IChartWidgetOptions, ChartWidget} from "./Widget";
import {Trends, ITrendsOptions} from "./Trends";
import {IChartEvent, ScrollStopEvent, ScrollEvent} from "./Events";
import {TrendsAnimationManager} from "./TrendsAnimationManager";


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
		maxX: number
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
			range: {type: AXIS_RANGE_TYPE.ALL, from: 0, to: 0, scroll: 0, padding: {start: 0, end: 200}},
			gridMinSize: 120,
			autoScroll: true,
		},
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.RELATIVE_END, from: 0, to: 0, padding: {start: 100, end: 100}},
			gridMinSize: 60
		},
		animations: {
			enabled: true,
			trendChangeSpeed: 0.5,
			trendChangeEase: void 0, //Linear.easeNone
			zoomSpeed: 1,
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
	trendsAnimationManager: TrendsAnimationManager;
	private ee: EventEmitter2;

	constructor(initialState: IChartState) {
		this.ee = new EE();
		this.trends = new Trends(this, initialState);
		initialState.trends = this.trends.calculatedOptions;
		this.setState(initialState);
		this.setState({computedData: this.getComputedData()});
		//this.recalculateState({});
		this.savePrevState();
		this.trendsAnimationManager = new TrendsAnimationManager(this);
		this.initListeners();
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
	}

	onZoom(cb: (changedProps: IChartState) => void) {
		this.ee.on('zoom', cb);
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

	private recalculateState(changedProps?: IChartState): IRecalculatedStateResult {
		var data = this.data;
		var patch: IChartState = {};
		var eventsToEmit: IChartEvent[] = [];

		if (!data.$el) {
			Utils.error('$el must be set');
		}

		// recalculate chart size
		var needInitChartSize = changedProps.$el && (!data.width || !data.height);
		if (needInitChartSize) {
			let style = getComputedStyle(changedProps.$el);
			patch.width = parseInt(style.width);
			patch.height = parseInt(style.height);
		}

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
			var deltaX = oldX - currentX;
			patch.xAxis = {range: {scroll: currentScroll + deltaX}};
		}

		// recalculate axis "from" and "to" for dynamics AXIS_RANGE_TYPE
		var needToRecalculateAxis = (
			data.yAxis.range.type === AXIS_RANGE_TYPE.RELATIVE_END &&
			(scrollChanged || changedProps.trends || changedProps.yAxis)
		);
		if (needToRecalculateAxis){
			var newYAxisOptions = this.recalculateYAxis(changedProps.yAxis);
			if (newYAxisOptions) patch.yAxis = newYAxisOptions;
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
				maxX: this.trends.getEndXVal()
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
	
	private recalculateYAxis(changedAxisOptions: IAxisOptions): IAxisOptions {
		var trends = this.trends;
		if (!trends) return null;
		var axisOptions = this.data.yAxis;
		axisOptions = Utils.deepMerge(axisOptions, changedAxisOptions || {} as IAxisOptions);
		var fromValue = this.getScreenLeftVal();
		var toValue = this.getScreenRightVal();
		var maxY = trends.getMaxYVal(fromValue, toValue);
		var minY = trends.getMinYVal(fromValue, toValue);

		if (axisOptions.range.from == minY && axisOptions.range.to == maxY) {
			return null;
		}
		var padding = this.data.yAxis.range.padding;
		axisOptions.range.from = minY// - this.ge;
		axisOptions.range.to = maxY;
		return axisOptions;
	}

	zoom(zoomValue: number) {
		var {from, to} = this.data.xAxis.range;
		var rangeLength = to - from;
		var zoomLength = rangeLength * zoomValue;
		var zoomDiff = zoomLength - rangeLength;
		var middleScreenValue = this.getValueByScreenX(this.data.width / 2);
		var leftScreenValue = this.getValueByScreenX(0);
		var rightScreenValue = this.getValueByScreenX(this.data.width);
		var newTo = middleScreenValue + (rightScreenValue - middleScreenValue) * zoomValue;
		var newFrom = middleScreenValue - (middleScreenValue - leftScreenValue) * zoomValue;
		this.setState(
			{xAxis: {range: {from: newFrom, to: newTo, scroll: 0}}}
		);
	}

	getPointOnXAxis(xVal: number): number {
		var w = this.data.width;
		var {from, to} = this.data.xAxis.range;
		return w * ((xVal - from) / (to - from));
	}

	getPointOnYAxis(yVal: number): number {
		var h = this.data.height;
		var {from, to} = this.data.yAxis.range;
		return h * ((yVal - from) / (to - from));
	}

	getPxByValueOnXAxis(xVal: number) {
		var w = this.data.width;
		var {from, to} = this.data.xAxis.range;
		return xVal * (w / (to - from));
	}


	getValueByScreenX(x: number): number {
		var w = this.data.width;
		var {from, to, scroll} = this.data.xAxis.range;
		var pxCoast = (to - from) / w;
		return from + pxCoast * x + scroll * pxCoast;
	}

	getValueByScreenY(y: number): number {
		var h = this.data.height;
		var {from, to} = this.data.yAxis.range;
		var pxCoast = (to - from) / h;
		return from + pxCoast * y;
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
		var scrollPos = -this.getPointOnXAxis(this.data.computedData.trends.maxX) + this.data.width - rightPadding;
		this.setState({xAxis: {range: {scroll: scrollPos}}})
	}

}