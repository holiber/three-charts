import {ChartState} from "./State";
import {Utils} from "./Utils";

export interface ITrendItem {xVal: number, yVal: number}
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
	hasBeacon?: boolean
}

const DEFAULT_OPTIONS: ITrendOptions = {
	enabled: true,
	data: [],
	lineWidth: 2,
	lineColor: 0xFFFFFF,
	hasGradient: true,
	hasBeacon: false
};

export class Trend {
	name: string;
	private chartState: ChartState;
	private calculatedOptions: ITrendOptions;
	
	constructor(chartState: ChartState, trendName: string) {
		var options = chartState.data.trends[trendName];
		this.name = trendName;
		this.chartState = chartState;
		this.calculatedOptions = Utils.deepMerge(DEFAULT_OPTIONS, options);
		this.calculatedOptions.name = trendName;
		if (options.dataset) this.calculatedOptions.data = this.prepareData(options.dataset);
	}
	
	getCalculatedOptions() {
		return this.calculatedOptions;
	}

	appendData(rawData: ITrendData | number[]) {
		var options = this.getOptions();
		var newData = this.prepareData(rawData);
		var updatedTrendData = options.data.concat(newData);
		this.chartState.setState({trends: {[options.name]: {data: updatedTrendData}}}, newData);
	}
	
	getData(): ITrendData {
		return this.getOptions().data;
	}

	getOptions() {
		return this.chartState.data.trends[this.name]
	}
	
	private prepareData (newData: ITrendData | number[]): ITrendData {
		var data: ITrendData = [];
		if (typeof newData[0] == 'number') {
			let currentData = this.getOptions().data || [];
			let lastItem = currentData[currentData.length - 1];
			let xVal = lastItem ? lastItem.xVal + 1 : 0;
			for (let yVal of newData as number[]) {
				data.push({xVal: xVal, yVal: yVal});
				xVal++;
			}
		} else {
			data = newData as ITrendData;
		}
		return data;
	}
}