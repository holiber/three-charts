
import {Trend, ITrendOptions} from "./Trend";
import {ChartState} from "./State";

export interface ITrendsOptions {
	[trendName: string]: ITrendOptions;
}

/**
 * Trends collection
 */
export class Trends {
	items: {[name: string]: Trend} = {};
	calculatedOptions: ITrendsOptions;
	
	constructor(state: ChartState) {
		var trendsCalculatedOptions: ITrendsOptions = {};
		for (let trendName in state.data.trends) {
			let trend = new Trend(state, trendName);
			trendsCalculatedOptions[trendName] = trend.getCalculatedOptions();
			this.items[trendName] = trend;
		}
		this.calculatedOptions = trendsCalculatedOptions;
	}

	getTrend(trendName: string) {
		return this.items[trendName];
	}

	getMaxX(): number {
		var items = this.items;
		var lastVals: number[] = [];
		for (let trendName in items) {
			let trend = items[trendName];
			if (!trend.getOptions().enabled) continue;
			let trendData = trend.getData();
			let trendLength = trendData.length;
			if (trendData.length == 0) continue;
			lastVals.push(trendData[trendLength - 1].xVal);
		}
		return Math.max(...lastVals);
	}
}