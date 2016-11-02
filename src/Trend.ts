import {Chart, IChartState} from "./Chart";
import {Utils} from "./Utils";
import {TrendSegmentsManager} from "./TrendSegmentsManager";
import {EventEmitter} from './EventEmmiter';
import {Promise} from './deps/deps';
import { TColor } from './Color';

export interface IPrependPromiseExecutor {
	(requestedDataLength: number, resolve: (data: TTrendRawData) => void, reject: () => void): void;
}
const EVENTS = {
	CHANGE: 'Change',
	PREPEND_REQUEST: 'prependRequest'
};
export enum TREND_TYPE {LINE, CANDLE}
export type TTrendRawData = ITrendData | number[];
export interface ITrendItem {xVal: number, yVal: number, id?: number}
export interface ITrendData extends Array<ITrendItem>{}
export interface ITrendTypeSettings {
	minSegmentLengthInPx?: number;
	maxSegmentLengthInPx?: number;
}
export interface ITrendOptions {
	enabled?: boolean,
	data?: ITrendData
	dataset?: ITrendData | number[];
	name?: string;
	type?: TREND_TYPE;
	lineWidth?: number;
	lineColor?: TColor;
	backgroundColor?: TColor;
	hasIndicator?: boolean;
	hasBackground?: boolean;
	hasBeacon?: boolean;
	maxSegmentLength?: number;
	settingsForTypes?: {
		CANDLE?: ITrendTypeSettings,
		LINE?: ITrendTypeSettings
	}
}

export class Trend {
	name: string;
	segmentsManager: TrendSegmentsManager;
	minXVal = Infinity;
	minYVal = Infinity;
	maxXVal = -Infinity;
	maxYVal = -Infinity;
	private chart: Chart;
	private calculatedOptions: ITrendOptions;
	private prependRequest: Promise<TTrendRawData>;
	private ee: EventEmitter;
	
	constructor(chartState: Chart, trendName: string, initialState: IChartState) {
		var options = initialState.trends[trendName];
		this.name = trendName;
		this.chart = chartState;
		this.calculatedOptions = Utils.deepMerge(this.chart.state.trendDefaultState, options);
		this.calculatedOptions.name = trendName;
		if (options.dataset) this.calculatedOptions.data = Trend.prepareData(options.dataset);
		this.calculatedOptions.dataset = [];
		this.ee = new EventEmitter();
		this.bindEvents();
	}

	private onInitialStateApplied() {
		this.segmentsManager = new TrendSegmentsManager(this.chart, this);
	}

	private bindEvents() {
		var chartState = this.chart;
		chartState.onInitialStateApplied(() => this.onInitialStateApplied());
		chartState.onScrollStop(() => this.checkForPrependRequest());
		chartState.onZoom(() => this.checkForPrependRequest());
		chartState.onTrendChange((trendName, changedOptions, newData) => this.ee.emit(EVENTS.CHANGE, changedOptions, newData));
		chartState.onDestroy(() => this.ee.removeAllListeners());
	}

	getCalculatedOptions() {
		return this.calculatedOptions;
	}

	appendData(rawData: TTrendRawData) {
		var options = this.getOptions();
		var newData = Trend.prepareData(rawData, this.getData());
		var updatedTrendData = options.data.concat(newData);
		this.changeData(updatedTrendData, newData);
	}

	prependData(rawData: TTrendRawData) {
		var options = this.getOptions();
		var newData = Trend.prepareData(rawData, this.getData(), true);
		var updatedTrendData = newData.concat(options.data);
		this.changeData(updatedTrendData, newData);
	}

	private changeData(allData: ITrendData, newData: ITrendData) {
		for (let item of newData) {
			if (item.xVal < this.minXVal) this.minXVal = item.xVal;
			if (item.xVal > this.maxXVal) this.maxXVal = item.xVal;
			if (item.yVal < this.minYVal) this.minYVal = item.yVal;
			if (item.yVal > this.maxYVal) this.maxYVal = item.yVal;
		}
		var options = this.getOptions();
		var statePatch: IChartState = {trends: {[options.name]: {data: allData}}};
		this.chart.setState(statePatch, newData);
	}
	
	getData(fromX?: number, toX?: number): ITrendData {
		var data = this.getOptions().data;
		if (fromX == void 0 && toX == void 0) return data;

		fromX = fromX !== void 0 ? fromX : data[0].xVal;
		toX = toX !== void 0 ? toX : data[data.length].xVal;
		var filteredData: ITrendData = [];
		for (let item of data) {
			if (item.xVal < fromX) continue;
			if (item.xVal > toX) break;
			filteredData.push(item)
		}
		return filteredData;
	}

	getFirstItem(): ITrendItem {
		return this.getOptions().data[0];
	}
	
	getLastItem(): ITrendItem {
		var data = this.getOptions().data;
		return data[data.length - 1];
	}

	getOptions() {
		return this.chart.state.trends[this.name]
	}

	setOptions(options: ITrendOptions) {
		this.chart.setState({trends: {[this.name]: options}});
	}

	onPrependRequest(cb: IPrependPromiseExecutor): Function {
		this.ee.on(EVENTS.PREPEND_REQUEST, cb);
		return () => {
			this.ee.off(EVENTS.PREPEND_REQUEST, cb);
		}
	}

	/**
	 * shortcut for Chart.onTrendChange
	 */
	onChange(cb: (changedOptions: ITrendOptions, newData: ITrendData) => void): Function {
		this.ee.on(EVENTS.CHANGE, cb);
		return () => { this.ee.off(EVENTS.CHANGE, cb);}
	}

	onDataChange(cb: (newData: ITrendData) => void): Function {
		var onChangeCb = (changedOptions: ITrendOptions, newData: ITrendData) => {
			if (newData) cb(newData);
		};
		this.ee.on(EVENTS.CHANGE, onChangeCb);
		return () => {
			this.ee.off(EVENTS.CHANGE, onChangeCb);
		}
	}

	private checkForPrependRequest() {
		if (this.prependRequest) return;
		var chartState = this.chart;
		var minXVal = chartState.state.computedData.trends.minXVal;
		var minScreenX = chartState.getScreenXByValue(minXVal);
		var needToRequest = minScreenX > 0;
		var {from, to} = chartState.state.xAxis.range;
		var requestedDataLength = to - from;
		if (!needToRequest) return;
		
		this.prependRequest = new Promise<TTrendRawData>((resolve: Function, reject: Function) => {
			this.ee.emit(EVENTS.PREPEND_REQUEST, requestedDataLength, resolve, reject);
		});

		this.prependRequest.then((newData: TTrendRawData) => {
			this.prependData(newData);
			this.prependRequest = null;
		}, () => {
			this.prependRequest = null;
		})
	
	}

	static prepareData (newData: TTrendRawData, currentData?: ITrendData, isPrepend = false): ITrendData {
		var data: ITrendData = [];
		if (typeof newData[0] == 'number') {
			currentData = currentData || [];
			let initialItem: ITrendItem;
			let xVal: number;
			if (isPrepend) {
				initialItem = currentData[0];
				xVal = initialItem.xVal - newData.length;
			} else {
				initialItem = currentData[currentData.length - 1];
				xVal = initialItem ? initialItem.xVal + 1 : 0;
			}
			for (let yVal of newData as number[]) {
				data.push({xVal: xVal, yVal: yVal, id: Utils.getUid()});
				xVal++;
			}
		} else {
			data = newData as ITrendData;
		}
		return data;
	}
}
