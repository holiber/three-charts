var EE = require('EventEmitter2') as typeof EventEmitter2;
import {IAxisOptions, AXIS_RANGE_TYPE, IAnimationsOptions, ITrendOptions, Chart} from "./Chart";
import {Utils} from './Utils';
import Vector3 = THREE.Vector3;
import {ITrendData} from "./Widgets/TrendLineWidget";
import {IChartWidgetOptions, ChartWidget} from "./Widget";


export interface IChartState {
	$el?: Element;
	width?: number;
	height?: number;
	zoom?: number;
	xAxis?: IAxisOptions,
	yAxis?: IAxisOptions,
	animations?: IAnimationsOptions,
	trend?: ITrendOptions,
	widgets?: {[widgetName: string]: IChartWidgetOptions},
	[key: string]: any; // for "for in" loops
}

export class ChartState {

	data: IChartState = {
		$el: null,
		zoom: 0,
		xAxis: {
			range: {type: AXIS_RANGE_TYPE.ALL, scroll: 0},
			gridMinSize: 120,
		},
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.AUTO, scroll: 0},
			gridMinSize: 60,
		},
		animations: {
			enabled: true,
			trendChangeSpeed: 0.5
		},
		trend: {
			data: []
		}

	};
	private ee: EventEmitter2;

	constructor(initialState: IChartState) {
		this.ee = new EE();
		initialState.trend.data = this.prepareData(initialState.trend.dataset);
		this.setState(initialState);
	}

	appendData(newData: ITrendData | number[]) {
		var data = this.prepareData(newData);
		this.setState({trend: {data: this.data.trend.data.concat(data)}}, data);
	}

	private prepareData (newData: ITrendData | number[]): ITrendData {
		var data: ITrendData = [];
		if (typeof newData[0] == 'number') {
			let xVal = 0;
			for (let yVal of newData as number[]) {
				data.push({xVal: xVal, yVal: yVal});
				xVal++;
			}
		} else {
			data = newData as ITrendData;
		}
		return data;
	}

	onChange(cb: (changedProps: IChartState) => void ) {
		this.ee.on('change', cb);
	}

	onTrendChange(cb: (trendOptions: ITrendOptions, newData: ITrendData) => void) {
		this.ee.on('trendChange', cb);
	}

	setState(newState: IChartState, eventData?: any) {
		var stateData = this.data;
		var changedProps: IChartState = {};
		for (let key in newState) {
			if ((<any>stateData)[key] !== newState[key]) {
				changedProps[key] = newState[key];
			}
		}

		this.data = Utils.deepMerge(this.data, newState);
		changedProps = this.recalculateState(changedProps);


		this.ee.emit('change', changedProps, eventData);

		for (let key in changedProps) {
			this.ee.emit(key + 'Change', changedProps[key], eventData);
		}

		
	}

	private recalculateState(changedProps: IChartState): IChartState {
		var data = this.data;

		if (!data.$el) {
			Utils.error('$el must be set');
		}

		var needInitChartSize = changedProps.$el && (!data.width || !data.height);
		if (needInitChartSize) {
			let style = getComputedStyle(changedProps.$el);
			data.width = parseInt(style.width);
			data.height = parseInt(style.height);
			changedProps['width'] = data.width;
			changedProps['height'] = data.height;
		}

		if (changedProps.widgets || !data.widgets) {
			if (!data.widgets) data.widgets = {};
			let widgetsOptions = data.widgets;
			for (let widgetName in Chart.installedWidgets) {
				let WidgetClass = Chart.installedWidgets[widgetName];
				let userOptions = widgetsOptions[widgetName] || {};
				let defaultOptions = WidgetClass.getDefaultOptions() || ChartWidget.getDefaultOptions();
				widgetsOptions[widgetName] = Utils.deepMerge(defaultOptions, userOptions) as IChartWidgetOptions;
			}
		}

		return changedProps;
	}

	getPointOnXAxis(xVal: number): number {
		var w = this.data.width;
		var {from, to} = this.data.xAxis.range;
		return w * ((xVal - from) / (to - from));
	}

	getPointOnYAxis(yVal: number): number {
		var h = this.data.height;
		var {from, to} = this.data.yAxis.range;
		return h * ((yVal - from) / (to - from));
	}
	

	getPointOnChart(xVal: number, yVal: number): Vector3 {
		return new Vector3(this.getPointOnXAxis(xVal), this.getPointOnYAxis(yVal), 0);
	}

}