import {ChartState, IChartState} from "./State";
import {Utils} from "./Utils";
import {Promise} from "es6-promise/dist/es6-promise";
import {MAX_DATA_LENGTH} from "./Chart";
import {ITrendMarkOptions, TrendMarks} from "./TrendMarks";
import {TrendPoints} from "./TrendPoints";
var EventEmitter = require<typeof EventEmitter2>('EventEmitter2');

export interface IPrependPromiseExecutor {
	(requestedDataLength: number, resolve: (data: TTrendRawData) => void, reject: () => void): void;
}
export type TTrendRawData = ITrendData | number[];
export interface ITrendItem {xVal: number, yVal: number, id?: number}
export interface ITrendData extends Array<ITrendItem>{}
export interface ITrendOptions {
	enabled?: boolean,
	data?: ITrendData
	dataset?: ITrendData | number[],
	name?: string,
	lineWidth?: number,
	lineColor?: number,
	hasGradient?: boolean,
	hasIndicator?: boolean,
	hasBeacon?: boolean,
	marks?: ITrendMarkOptions[],
	onPrependRequest?: IPrependPromiseExecutor;
}

const DEFAULT_OPTIONS: ITrendOptions = {
	enabled: true,
	data: [],
	marks: [],
	lineWidth: 2,
	lineColor: 0xFFFFFF,
	hasGradient: true,
	hasBeacon: false
};

export class Trend {
	name: string;
	marks: TrendMarks;
	points: TrendPoints;
	private chartState: ChartState;
	private calculatedOptions: ITrendOptions;
	private prependRequest: Promise<TTrendRawData>;
	private ee: EventEmitter2;
	private canRequestPrepend: boolean;
	
	constructor(chartState: ChartState, trendName: string, initialState: IChartState) {
		var options = initialState.trends[trendName];
		this.name = trendName;
		this.chartState = chartState;
		this.calculatedOptions = Utils.deepMerge(DEFAULT_OPTIONS, options);
		this.calculatedOptions.name = trendName;
		if (options.dataset) this.calculatedOptions.data = Trend.prepareData(options.dataset);
		this.ee = new EventEmitter();
		this.canRequestPrepend = !!options.onPrependRequest;
		this.bindEvents();
	}

	private onInitialStateApplied() {
		this.points = new TrendPoints(this.chartState, this, MAX_DATA_LENGTH, this.getData()[0]);
		this.marks = new TrendMarks(this.chartState, this);
	}

	private bindEvents() {
		var chartState = this.chartState;
		chartState.onInitialStateApplied(() => this.onInitialStateApplied());
		chartState.onScrollStop(() => this.checkForPrependRequest());
		chartState.onZoom(() => this.checkForPrependRequest());
		chartState.onTrendChange((trendName, changedOptions, newData) => this.ee.emit('change', changedOptions, newData))
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
		if (allData.length > MAX_DATA_LENGTH) Utils.error('max data length reached')
		var options = this.getOptions();
		var statePatch: IChartState = {trends: {[options.name]: {data: allData}}};
		this.chartState.setState(statePatch, newData);
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
		return this.chartState.data.trends[this.name]
	}

	onPrependRequest(cb: IPrependPromiseExecutor): Function {
		this.canRequestPrepend = true;
		this.ee.on('prependRequest', cb);
		return () => {
			this.ee.off('prependRequest', cb);
		}
	}

	/**
	 * shortcut for ChartState.onTrendChange
	 */
	onChange(cb: (changedOptions: ITrendOptions, newData: ITrendData) => void): Function {
		this.ee.on('change', cb);
		return () => {
			this.ee.off('change', cb);
		}
	}

	onDataChange(cb: (newData: ITrendData) => void): Function {
		var onChangeCb = (changedOptions: ITrendOptions, newData: ITrendData) => {
			if (changedOptions.data) cb(newData);
		};
		this.ee.on('change', onChangeCb);
		return () => {
			this.ee.off('change', onChangeCb);
		}
	}

	private checkForPrependRequest() {
		if (this.prependRequest) return;
		var chartState = this.chartState;
		var minXVal = chartState.data.computedData.trends.minXVal;
		var minScreenX = chartState.getScreenXByValue(minXVal);
		var needToRequest = this.canRequestPrepend && minScreenX > 0;
		var {from, to} = chartState.data.xAxis.range;
		var requestedDataLength = to - from;
		if (!needToRequest) return;
		
		this.prependRequest = new Promise<TTrendRawData>((resolve: Function, reject: Function) => {
			this.ee.emit('prependRequest', requestedDataLength, resolve, reject);
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
