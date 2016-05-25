
import {ChartState} from "./State";
import {Utils} from "./Utils";
import {AXIS_TYPE, TEase} from "./interfaces";
import {ITrendData, ITrendOptions} from "./Trend";
var EventEmitter = require<typeof EventEmitter2>('EventEmitter2');

export interface IAxisMarkUpdateOptions {
	value: number
}

export interface IAxisMarkOptions extends IAxisMarkUpdateOptions {
	name?: string,
	title?: string,
	type?: string
	lineColor?: string
	lineWidth?: number
}

const AXIS_MARK_DEFAULT_OPTIONS: IAxisMarkOptions = {
	type: 'simple',
	lineWidth: 2,
	value: 0
};

export class AxisMarks {
	private chartState: ChartState;
	private axisType: AXIS_TYPE;
	private ee: EventEmitter2;
	private items: {[name: string]: AxisMark} = {};

	constructor(chartState: ChartState, axisType: AXIS_TYPE) {
		if (axisType == AXIS_TYPE.Y) {
			// TODO: axis mark on Y axis
			Utils.error('axis mark on Y axis not supported yet');
			return;
		}

		this.chartState = chartState;
		this.ee = new EventEmitter();
		this.axisType = axisType;
		var marks = this.items;
		var axisMarksOptions = chartState.data.xAxis.marks;
		
		for (let options of axisMarksOptions) {
			let axisMark: AxisMark;
			options = Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
			
			// set mark name
			if (!options.name) options.name = Utils.getUid().toString();
			if (marks[options.name]) Utils.error('duplicated mark name ' + options.name);
			
			// create mark instance based on type option
			if (options.type == 'timeleft') {
				axisMark = new AxisTimeleftMark(chartState, AXIS_TYPE.X, options);
			} else {
				axisMark = new AxisMark(chartState, AXIS_TYPE.X, options);
			}
			marks[options.name] = axisMark;
		}
		this.bindEvents();
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
			if (markWasCrossed) this.ee.emit('onMarkCrossed', trendName, newData);
		}
	}

	protected bindEvents() {
		this.chartState.onTrendChange((trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => this.onTrendChange(trendName, newData));
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
	position: number;
	protected chartState: ChartState;
	protected renderOnTrendsChange = false;
	protected animation: TweenLite;
	protected ee: EventEmitter2;

	constructor(chartState: ChartState, axisType: AXIS_TYPE, options: IAxisMarkOptions) {

		if (axisType == AXIS_TYPE.Y) {
			// TODO: axis mark on Y axis
			Utils.error('axis mark on Y axis not supported yet');
		}

		this.ee = new EventEmitter();
		this.options = options;
		this.axisType = axisType;
		this.chartState = chartState;
		this.position = this.getPosition();
		this.bindEvents();
	}

	setOptions(newOptions: IAxisMarkUpdateOptions) {
		this.options = Utils.deepMerge(this.options, newOptions);
		this.updatePosition();
		this.ee.emit('onDisplayedValueChange');
	}

	getDisplayedVal(): string {
		return String(this.options.value);
	}


	getPosition() {
		if (this.axisType == AXIS_TYPE.X) {
			return this.chartState.getPointOnXAxis(this.options.value);
		}
		Utils.error('not implemented');
		return 0
	}

	
	onAnimationFrame(cb: () => void): Function {
		this.ee.on('onAnimationFrame', cb);
		return () => {
			this.ee.off('onAnimationFrame', cb);
		}
	}

	onMarkCrossed(cb: (trendName: string, newData: ITrendData) => void): Function {
		this.ee.on('onMarkCrossed', cb);
		return () => {
			this.ee.off('onMarkCrossed', cb);
		}
	}

	onDisplayedValueChange(cb: () => void) {
		this.ee.on('onDisplayedValueChange', cb);
		return () => {
			this.ee.off('onDisplayedValueChange', cb);
		}
	}

	protected updatePosition() {
		var animations = this.chartState.data.animations;
		var time = animations.enabled ? animations.trendChangeSpeed : 0;
		this.animate(this.getPosition(), time, animations.trendChangeEase);
	}
	
	protected bindEvents() {
		this.chartState.onZoom(() => this.onZoom());
	}
	
	private onZoom() {
		var chartState = this.chartState;
		var animations = this.chartState.data.animations;
		var time = animations.enabled ? animations.zoomSpeed : 0;
		var prevRange = chartState.data.prevState.xAxis.range;
		var currentRange = chartState.data.xAxis.range;
		var zoomDistanceInPx = chartState.valueToPxByXAxis(currentRange.from - prevRange.from);
		var fromPosition = this.position - zoomDistanceInPx;
		this.animate(this.getPosition(), time, animations.zoomEase, fromPosition);
	}

	private animate(toPosition: Object, time: number, ease: TEase, fromPosition?: number) {
		if (this.animation) this.animation.kill();
		fromPosition = fromPosition !== void 0 ? fromPosition : this.position;
		var current = {position: fromPosition};
		var target = {position: toPosition, ease: ease};
		var animation = TweenLite.to(current, time, target);
		animation.eventCallback('onUpdate', () => {
			this.position = current.position;
			this.ee.emit('onAnimationFrame');
		});
		this.animation = animation;
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
		return Utils.msToTimeString(time * 1000);
	}

	protected bindEvents() {
		super.bindEvents();
		this.chartState.onTrendsChange(() => this.onTrendsChange());
	}

	protected onTrendsChange() {
		this.ee.emit('onDisplayedValueChange');
	}
}