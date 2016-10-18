import { ChartState } from "../ThreeChart";
import { Utils } from "../ThreeChart";
import { TREND_TYPE } from "../ThreeChart";
import Vector3 = THREE.Vector3;
import { TrendSegment } from "../ThreeChart";
import { ChartPlugin, ChartWidget } from '../ThreeChart';
import { TrendsMarksWidget } from '../TrendsMarksPlugin/TrendsMarksWidget';

export enum TREND_MARK_SIDE {TOP, BOTTOM}
export enum EVENTS {CHANGE}
export type TTrendsMarksPluginOptions = {items: ITrendMarkOptions[]};

export interface ITrendMarkOptions {
	trendName: string,
	value: number,
	name?: string,
	title?: string
	description?: string,
	descriptionColor?: string,
	icon?: string,
	iconColor?: string,
	orientation?: TREND_MARK_SIDE,
	width?: number,
	height?: number,
	/**
	 * min distance between trend and mark
	 */
	offset?: number,
	/**
	 * space between marks
	 */
	margin?: number
}

const AXIS_MARK_DEFAULT_OPTIONS: ITrendMarkOptions = {
	trendName: '',
	title: '',
	description: '',
	descriptionColor: 'rgb(40,136,75)',
	value: 0,
	iconColor: 'rgb(255, 102, 217)',
	orientation: TREND_MARK_SIDE.TOP,
	width: 65,
	height: 80,
	offset: 40,
	margin: 20
};


export class TrendsMarksPlugin2 extends ChartPlugin {
	static NAME = 'TrendsMarks';
	static pluginWidgets = [TrendsMarksWidget] as typeof ChartWidget[];

	private items: {[name: string]: TrendMark} = {};
	private rects: {[name: string]: number[]} = {};

	constructor(trendsMarksPluginOptions: TTrendsMarksPluginOptions) {
		super(trendsMarksPluginOptions);
	}

	protected onInitialStateApplied() {
		this.bindEvents();
		this.onMarksChangeHandler();
	}

	protected onStateChanged() {
		this.onMarksChangeHandler();
	}


	getOptions(): TTrendsMarksPluginOptions {
		return super.getOptions() as TTrendsMarksPluginOptions;
	}

	getItems() {
		return this.items;
	}

	getItem(markName: string) {
		return this.items[markName];
	}

	createMark(options: ITrendMarkOptions) {
		var marksOptions = this.getOptions().items;
		var newMarkOptions = marksOptions.concat([options]);
		this.chartState.setState({pluginsState: {[this.name]: {items: newMarkOptions}}});
	}

	onChange(cb: () => any) {
		return this.ee.subscribe(EVENTS[EVENTS.CHANGE], cb);
	}

	protected bindEvents() {
		this.chartState.trendsManager.onSegmentsRebuilded(() => this.updateMarksSegments());
		this.chartState.screen.onZoomFrame(() => this.calclulateMarksPositions());
	}

	protected onInitialStateAppliedHandler() {
		this.onMarksChangeHandler();
	}

	private onMarksChangeHandler() {
		var trendsMarksOptions = this.getOptions().items;
		let actualMarksNames: string[] = [];
		for (let options of trendsMarksOptions) {
			var marks = this.items;

			// set mark name
			if (!options.name) {
				options.name = Utils.getUid().toString();
				actualMarksNames.push(options.name);
				if (marks[options.name]) Utils.error('duplicated mark name ' + options.name);
			} else if (marks[options.name]) {
				actualMarksNames.push(options.name);
				continue;
			}

			options = Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);

			let mark = new TrendMark(this.chartState, options);
			marks[options.name] = mark;
		}

		// delete not relevant marks
		for (let markName in this.items) {
			if (actualMarksNames.indexOf(markName) != -1) continue;
			delete this.items[markName];
		}
		this.updateMarksSegments();
		this.ee.emit(EVENTS[EVENTS.CHANGE]);
	}


	private calclulateMarksPositions() {
		this.rects = {};
		for (let markName in this.items) {
			this.createMarkRect(this.items[markName]);
		}
	}

	private createMarkRect(mark: TrendMark) {
		if (!mark.segment) return;

		let state = this.chartState;
		let options = mark.options;
		let {width, height, offset, name} = options;
		let left = state.getPointOnXAxis(mark.xVal) - width / 2;
		let top = state.getPointOnYAxis(mark.yVal);
		let isTopSideMark = options.orientation == TREND_MARK_SIDE.TOP;
		let newOffset: number;
		let row = 0;

		if (isTopSideMark) {
			top += offset + height;
		} else {
			top -= offset;
		}

		let markRect = [left, top, width, height];
		let hasIntersection = false;
		do {
			for (let markName in this.rects) {
				let rect = this.rects[markName];
				hasIntersection = Utils.rectsIntersect(rect, markRect);
				if (!hasIntersection) continue;
				if (isTopSideMark) {
					markRect[1] = rect[1] + markRect[3] + options.margin;
				} else {
					markRect[1] = rect[1] - rect[3] - options.margin;
				}
				row++;
				break;
			}
		} while (hasIntersection);

		if (isTopSideMark) {
			newOffset = markRect[1] - markRect[3] - state.getPointOnYAxis(mark.yVal);
		} else {
			newOffset = state.getPointOnYAxis(mark.yVal) - markRect[1];
		}

		mark._setOffset(newOffset);
		mark._setRow(row);
		this.rects[name] = markRect;
	}

	private updateMarksSegments() {
		let chartState = this.chartState;
		let trends = chartState.trendsManager.trends;
		for (let trendName in trends) {
			var marks = this.getTrendMarks(trendName);
			var marksArr: TrendMark[] = [];
			var xVals: number[] = [];
			for (let markName in marks) {
				let mark = marks[markName];
				xVals.push(mark.options.value);
				marksArr.push(mark);
				mark._setSegment(null);
			}
			marksArr.sort((a, b) => a.options.value - b.options.value);
			let trend = chartState.getTrend(trendName);
			let points = trend.segmentsManager.getSegmentsForXValues(xVals.sort((a, b) => a - b));
			for (let markInd = 0; markInd < marksArr.length; markInd++) {
				marksArr[markInd]._setSegment(points[markInd]);
			}
		}
		this.calclulateMarksPositions();
	}

	private getTrendMarks(trendName: string): TrendMark[] {
		let trendMarks: TrendMark[] = [];
		for (let markName in this.items) {
			if (this.items[markName].options.trendName != trendName) continue;
			trendMarks.push(this.items[markName]);
		}
		return trendMarks;
	}

}

export class TrendMark {
	options: ITrendMarkOptions;
	segment: TrendSegment;
	xVal: number;
	yVal: number;
	offset: number;
	row = 0;
	protected chartState: ChartState;

	constructor(chartState: ChartState, options: ITrendMarkOptions) {
		this.options = options;
		this.chartState = chartState;
	}


	/**
	 * only for internal usage
	 */
	_setSegment(segment: TrendSegment) {
		this.segment = segment;
		if (!segment) return;

		let trend = this.chartState.getTrend(this.options.trendName)

		if (trend.getOptions().type == TREND_TYPE.LINE) {
			this.xVal = segment.endXVal;
			this.yVal = segment.endYVal;
		} else if (this.options.orientation == TREND_MARK_SIDE.TOP) {
			this.xVal = segment.xVal;
			this.yVal = segment.maxYVal;
		} else {
			this.xVal = segment.xVal;
			this.yVal = segment.minYVal;
		}
	}

	_setOffset(offset: number) {
		this.offset = offset;
	}

	_setRow(row: number) {
		this.row = row;
	}

}
