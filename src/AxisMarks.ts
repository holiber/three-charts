
import {ChartState} from "./State";
import {Utils} from "./Utils";
import {AXIS_TYPE, TEase} from "./interfaces";
import {ITrendData, ITrendOptions} from "./Trend";
import {EventEmitter} from './deps';

export interface IAxisMarkUpdateOptions {
	value: number,
	displayedValue?: string
}

export interface IAxisMarkOptions extends IAxisMarkUpdateOptions {
	name?: string;
	title?: string;
	type?: string;
	lineColor?: string;
	lineWidth?: number;
	showValue?: boolean;
	stickToEdges?: boolean;
}

const AXIS_MARK_DEFAULT_OPTIONS: IAxisMarkOptions = {
	type: 'simple',
	lineWidth: 1,
	value: 0,
	showValue: false,
	stickToEdges: false
};

export class AxisMarks {
	private chartState: ChartState;
	private axisType: AXIS_TYPE;
	private ee: EventEmitter2;
	private items: {[name: string]: AxisMark} = {};

	constructor(chartState: ChartState, axisType: AXIS_TYPE) {
		this.chartState = chartState;
		this.ee = new EventEmitter();
		this.axisType = axisType;
		var marks = this.items;
		var axisMarksOptions = axisType == AXIS_TYPE.X ? chartState.data.xAxis.marks : chartState.data.yAxis.marks;
		
		for (let options of axisMarksOptions) {
			let axisMark: AxisMark;
			options = Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
			
			// set mark name
			if (!options.name) options.name = Utils.getUid().toString();
			if (marks[options.name]) Utils.error('duplicated mark name ' + options.name);
			
			// create mark instance based on type option
			if (options.type == 'timeleft') {
				axisMark = new AxisTimeleftMark(chartState, axisType, options);
			} else {
				axisMark = new AxisMark(chartState, axisType, options);
			}
			marks[options.name] = axisMark;
		}
		this.bindEvents();
	}

	protected bindEvents() {
		this.chartState.onTrendChange((trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => {
			this.onTrendChange(trendName, newData)
		});
	}

	private onTrendChange(trendName: string, newData: ITrendData) {
		if (!newData) return;
		var startVal = newData[0].xVal;
		var endVal = newData[newData.length - 1].xVal;
		var marks = this.items;

		for (let markName in marks) {
			let mark = marks[markName];
			let markVal = mark.options.value;
			let markWasCrossed = (startVal == markVal || endVal == markVal || (startVal < markVal && endVal > markVal));
			if (markWasCrossed) this.ee.emit('markCrossed', trendName, newData);
		}
	}


	getItems() {
		return this.items;
	}
	
	getItem(markName: string) {
		return this.items[markName];
	}

}

export class AxisMark {
	static typeName = 'simple';
	options: IAxisMarkOptions;
	axisType: AXIS_TYPE;
	protected chartState: ChartState;
	protected renderOnTrendsChange = false;
	protected ee: EventEmitter2;

	constructor(chartState: ChartState, axisType: AXIS_TYPE, options: IAxisMarkOptions) {
		this.ee = new EventEmitter();
		this.options = options;
		this.axisType = axisType;
		this.chartState = chartState;
		this.bindEvents();
	}
	
	protected bindEvents() {}

	setOptions(newOptions: IAxisMarkUpdateOptions) {
		var value = this.options.value;
		this.options = Utils.deepMerge(this.options, newOptions);
		if (this.options.value !== value) this.ee.emit('valueChange');
		this.ee.emit('onDisplayedValueChange');
	}

	getDisplayedVal(): string {
		let {value, displayedValue} = this.options;
		return String(displayedValue !== void 0 ? displayedValue : value);
	}

	onMarkCrossed(cb: (trendName: string, newData: ITrendData) => void): Function {
		this.ee.on('markCrossed', cb);
		return () => {
			this.ee.off('markCrossed', cb);
		}
	}

	onValueChange(cb: () => void) {
		this.ee.on('valueChange', cb);
		return () => {
			this.ee.off('valueChange', cb);
		}
	}

	onDisplayedValueChange(cb: () => void) {
		this.ee.on('onDisplayedValueChange', cb);
		return () => {
			this.ee.off('onDisplayedValueChange', cb);
		}
	}
}

export class AxisTimeleftMark extends AxisMark {
	static typeName = 'timeleft';
	protected renderOnTrendsChange = true;
	
	getDisplayedVal(): string {
		var markVal = this.options.value;
		var maxXVal = this.chartState.data.computedData.trends.maxXVal;
		var time = markVal - maxXVal;
		if (time < 0) time = 0;
		return Utils.msToTimeString(time);
	}

	protected bindEvents() {
		this.chartState.onTrendsChange(() => this.onTrendsChange());
	}

	protected onTrendsChange() {
		this.ee.emit('onDisplayedValueChange');
	}
}