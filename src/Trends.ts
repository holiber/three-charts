
import {Trend, ITrendOptions} from "./Trend";
import {ChartState, IChartState} from "./State";

export interface ITrendsOptions {
	[trendName: string]: ITrendOptions;
}

/**
 * Trends collection
 */
export class Trends {
	items: {[name: string]: Trend} = {};
	calculatedOptions: ITrendsOptions;
	
	constructor(state: ChartState, initialState: IChartState) {
		var trendsCalculatedOptions: ITrendsOptions = {};
		for (let trendName in initialState.trends) {
			let trend = new Trend(state, trendName, initialState);
			trendsCalculatedOptions[trendName] = trend.getCalculatedOptions();
			this.items[trendName] = trend;
		}
		this.calculatedOptions = trendsCalculatedOptions;
	}

	getTrend(trendName: string) {
		return this.items[trendName];
	}
	
	getEnabledTrends(): Trend[] {
		var enabledTrends: Trend[] = [];
		var allTrends = this.items;
		for (let trendName in allTrends) {
			let trend = allTrends[trendName];
			trend.getOptions().enabled && enabledTrends.push(trend);
		}
		return enabledTrends;
	}


	getStartXVal() {
		var trends = this.getEnabledTrends();
		return trends[0].getData()[0].xVal;
	}


	getEndXVal(): number {
		var trends = this.getEnabledTrends();
		var firstTrendData = trends[0].getData();
		return firstTrendData[firstTrendData.length - 1].xVal;
	}
	
	
	getExtremumYVal(extremumIsMax: boolean, fromX?: number, toX?: number) {
		var trends = this.getEnabledTrends();
		var compareFn: Function;
		var result: number;
		if (extremumIsMax) {
			result = -Infinity;
			compareFn = Math.max;
		} else {
			result = Infinity;
			compareFn = Math.min;
		}
		for (let trend of trends) {
			var trendData = trend.getData(fromX, toX);
			var trendYValues = trendData.map((dataItem) => dataItem.yVal);
			result = compareFn(result, ...trendYValues);
		}
		return result;
	}

	getMaxYVal(fromX?: number, toX?: number) {return this.getExtremumYVal(true, fromX, toX)}
	getMinYVal(fromX?: number, toX?: number) {return this.getExtremumYVal(false, fromX, toX)}
}