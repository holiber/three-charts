
import {ChartState} from "./State";
import {Utils} from "./Utils";
import {TEase} from "./interfaces";
import {Trend, ITrendOptions} from "./Trend";
import Vector3 = THREE.Vector3;
import {TrendPoint} from "./TrendPoints";
import {EventEmitter} from './deps';

export enum TREND_MARK_SIDE {TOP, BOTTOM}

export interface ITrendMarkOptions {
	value: number,
	name?: string,
	title?: string
	description?: string,
	icon?: string,
	iconColor?: string,
	orientation?: TREND_MARK_SIDE
}

const AXIS_MARK_DEFAULT_OPTIONS: ITrendMarkOptions = {
	title: '',
	description: '',
	value: 0,
	iconColor: 'rgb(255, 102, 217)',
	orientation: TREND_MARK_SIDE.TOP
};

export class TrendMarks {
	private chartState: ChartState;
	private ee: EventEmitter2;
	private trend: Trend;
	private items: {[name: string]: TrendMark} = {};

	constructor(chartState: ChartState, trend: Trend) {
		this.chartState = chartState;
		this.ee = new EventEmitter();
		this.trend = trend;
		this.onMarksChange();
		this.bindEvents();
	}

	private bindEvents() {
		this.trend.onDataChange(() => this.updateMarksPoints());
		this.trend.onChange((changedOptions) => this.onTrendChange(changedOptions));
	}

	private onTrendChange(changedOptions: ITrendOptions) {
		if (!changedOptions.marks) return;
		this.onMarksChange();
		this.ee.emit('change');
	}
	
	onChange(cb: () => void): Function {
		this.ee.on('change', cb);
		return () => {
			this.ee.off('change', cb);
		}
	}

	private updateMarksPoints() {
		var marks = this.items;
		var marksArr: TrendMark[] = [];
		var xVals: number[] = [];
		for (let markName in marks) {
			let mark = marks[markName];
			xVals.push(mark.options.value);
			marksArr.push(mark);
			mark.setPoint(null);
		}
		marksArr.sort((a, b) => a.options.value - b.options.value);
		var points = this.trend.points.getPointsForXValues(xVals.sort((a, b) => a - b));
		for (let markInd = 0; markInd < marksArr.length; markInd++) {
			marksArr[markInd].setPoint(points[markInd]);
		}
	}

	private onMarksChange() {
		var trendsMarksOptions = this.trend.getOptions().marks;
		for (let options of trendsMarksOptions) {
			var marks = this.items;

			// set mark name
			if (!options.name) {
				options.name = Utils.getUid().toString();
				if (marks[options.name]) Utils.error('duplicated mark name ' + options.name);
			} else if (marks[options.name]) {
				continue;
			}

			options = Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
			
			let mark =  new TrendMark(this.chartState, options, this.trend);
			marks[options.name] = mark;
		}
		this.updateMarksPoints();
	}
	
	createMark(options: ITrendMarkOptions) {
		var marksOptions = this.trend.getOptions().marks;
		var newMarkOptions = marksOptions.concat([options]);
		this.chartState.setState({trends: {[this.trend.name]: {marks: newMarkOptions}}});
	}

	getItems() {
		return this.items;
	}
	
	getItem(markName: string) {
		return this.items[markName];
	}

}

export class TrendMark {
	options: ITrendMarkOptions;
	point: TrendPoint;
	protected trend: Trend;
	protected chartState: ChartState;
	protected renderOnTrendsChange = false;
	protected ee: EventEmitter2;

	constructor(chartState: ChartState, options: ITrendMarkOptions, trend: Trend) {
		this.ee = new EventEmitter();
		this.options = options;
		this.chartState = chartState;
		this.trend = trend;
	}
	
	onAnimationFrame(cb: () => void): Function {
		this.ee.on('onAnimationFrame', cb);
		return () => {
			this.ee.off('onAnimationFrame', cb);
		}
	}

	/**
	 * only for internal usage
	 */
	setPoint(point: TrendPoint) {
		this.point = point;
	}


}
