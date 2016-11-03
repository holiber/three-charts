
import {Trend, ITrendOptions} from "./Trend";
import {Chart, IChartState} from "./Chart";
import { EventEmitter } from './EventEmmiter';

export interface ITrendsOptions {
	[trendName: string]: ITrendOptions;
}

const EVENTS = {
	SEGMENTS_REBUILDED: 'segmentsRebuilded'
};

/**
 * Trends manager
 */
export class TrendsManager {
	trends: {[name: string]: Trend} = {};
	calculatedOptions: ITrendsOptions;
	private ee = new EventEmitter();
	private chartState: Chart;
	
	constructor(state: Chart, initialState: IChartState) {
		this.chartState = state;
		var trendsCalculatedOptions: ITrendsOptions = {};
		for (let trendName in initialState.trends) {
			let trend = this.createTrend(state, trendName, initialState);
			trendsCalculatedOptions[trendName] = trend.getCalculatedOptions();
		}
		this.calculatedOptions = trendsCalculatedOptions;
	}

	getTrend(trendName: string) {
		return this.trends[trendName];
	}
	
	getEnabledTrends(): Trend[] {
		var enabledTrends: Trend[] = [];
		var allTrends = this.trends;
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
		if (result == Infinity || result == -Infinity) result = NaN;
		return result;
	}

	getMaxYVal(fromX?: number, toX?: number) {return this.getExtremumYVal(true, fromX, toX)}
	getMinYVal(fromX?: number, toX?: number) {return this.getExtremumYVal(false, fromX, toX)}

	onSegmentsRebuilded(cb: (trendName: string) => any) {
		return this.ee.subscribe(EVENTS.SEGMENTS_REBUILDED, cb);
	}

	private createTrend(state: Chart, trendName: string, initialState: IChartState): Trend {
		let trend = new Trend(state, trendName, initialState);
		this.trends[trendName] = trend;
		trend.segmentsManager.onRebuild(() => this.ee.emit(EVENTS.SEGMENTS_REBUILDED, trendName));
		return trend;
	}
}
