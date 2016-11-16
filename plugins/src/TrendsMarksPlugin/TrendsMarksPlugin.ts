
import Vector3 = THREE.Vector3;
import { ChartPlugin, ChartWidget, TrendSegment, TREND_TYPE, Utils, Chart, TColor, TEase } from 'three-charts';
import { TrendsMarksWidget, DEFAULT_RENDERER, TrendMarkWidget } from './TrendsMarksWidget';
import { EASING } from "../../../src/Easing";

export enum TREND_MARK_SIDE {TOP, BOTTOM}
export enum EVENTS {CHANGE}
export enum TEXTURE_FILTER {AUTO, LINEAR, NEAREST}
export type TTrendsMarksPluginOptions = {items: ITrendMarkOptions[]};

export interface ITrendMarkOptions {
	trendName: string,
	xVal: number,
	title?: string,
	name?: string,
	color?: TColor,
	orientation?: TREND_MARK_SIDE,
	width?: number,
	height?: number,
	textureFilter?: TEXTURE_FILTER
	/**
	 * space between marks
	 */
	margin?: number,
	/**
	 * custom render function
	 */
	onRender?: (
		trendMarkWidget: TrendMarkWidget,
		ctx: CanvasRenderingContext2D,
		chart: Chart
	) => any,
	ease?: TEase,
	easeSpeed?: number,
	userData?: any
}

const AXIS_MARK_DEFAULT_OPTIONS: ITrendMarkOptions = {
	trendName: '',
	title: '',
	color: 'rgba(#0099d9, 0.5)',
	xVal: 0,
	orientation: TREND_MARK_SIDE.TOP,
	width: 105,
	height: 100,
	margin: 10,
	ease: EASING.Elastic.Out,
	easeSpeed: 1000,
	textureFilter: TEXTURE_FILTER.AUTO,
	onRender: DEFAULT_RENDERER
};


export class TrendsMarksPlugin extends ChartPlugin<TTrendsMarksPluginOptions> {
	static NAME = 'TrendsMarks';
	static providedWidgets: typeof ChartWidget[] = [TrendsMarksWidget];

	private items: {[name: string]: TrendMark} = {};
	private rects: {[name: string]: number[]} = {};

	constructor(trendsMarksPluginOptions: TTrendsMarksPluginOptions) {
		super(trendsMarksPluginOptions);
	}

	protected onInitialStateAppliedHandler() {
		this.onMarksChangeHandler();
		this.bindEvents();
	}


	protected onStateChangedHandler() {
		this.onMarksChangeHandler();
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
		this.chart.setState({pluginsState: {[this.name]: {items: newMarkOptions}}});
	}

	onChange(cb: () => any) {
		return this.ee.subscribe(EVENTS[EVENTS.CHANGE], cb);
	}

	protected bindEvents() {
		this.chart.trendsManager.onSegmentsRebuilded(() => {
			this.updateMarksSegments()
		});
		this.chart.interpolatedViewport.onZoomInterpolation(() => this.calclulateMarksPositions());
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

			let mark = new TrendMark(this.chart, options);
			marks[options.name] = mark;
		}

		// delete not relevant marks
		for (let markName in this.items) {
			if (actualMarksNames.indexOf(markName) != -1) continue;
			delete this.items[markName];
		}
		this.updateMarksSegments();
	}


	private calclulateMarksPositions() {
		this.rects = {};
		for (let markName in this.items) {
			this.createMarkRect(this.items[markName]);
		}
	}

	private createMarkRect(mark: TrendMark) {
		if (!mark.segment) return;

		let chart = this.chart;
		let options = mark.options;
		let {width, height, name} = options;
		let left = chart.viewport.getWorldXByVal(mark.xVal) - width / 2;
		let top = chart.viewport.getWorldYByVal(mark.yVal);
		let isTopSideMark = options.orientation == TREND_MARK_SIDE.TOP;
		let newOffset: number;
		let row = 0;

		if (isTopSideMark) {
			top += height;
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
			newOffset = markRect[1] - markRect[3] - chart.viewport.getWorldYByVal(mark.yVal);
		} else {
			newOffset = chart.viewport.getWorldYByVal(mark.yVal) - markRect[1];
		}

		mark._setOffset(newOffset);
		mark._setRow(row);
		this.rects[name] = markRect;
	}

	private updateMarksSegments() {
		let chart = this.chart;
		let trends = chart.trendsManager.trends;
		for (let trendName in trends) {
			var marks = this.getTrendMarks(trendName);
			var marksArr: TrendMark[] = [];
			var xVals: number[] = [];
			for (let markName in marks) {
				let mark = marks[markName];
				xVals.push(mark.options.xVal);
				marksArr.push(mark);
				mark._setSegment(null);
			}
			marksArr.sort((a, b) => a.options.xVal - b.options.xVal);
			let trend = chart.getTrend(trendName);
			let points = trend.segmentsManager.getSegmentsForXValues(xVals.sort((a, b) => a - b));
			for (let markInd = 0; markInd < marksArr.length; markInd++) {
				marksArr[markInd]._setSegment(points[markInd]);
			}
		}
		this.calclulateMarksPositions();
		this.ee.emit(EVENTS[EVENTS.CHANGE]);
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
	protected chart: Chart;

	constructor(chart: Chart, options: ITrendMarkOptions) {
		this.options = options;
		this.chart = chart;
	}


	/**
	 * only for internal usage
	 */
	_setSegment(segment: TrendSegment) {
		this.segment = segment;
		if (!segment) return;

		let trend = this.chart.getTrend(this.options.trendName);

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
