
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
}