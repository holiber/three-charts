
import { ChartPlugin, ChartWidget } from 'three-charts';
import { AxisMarksWidget } from './AxisMarksWidget';

export interface IAxisMarkOptions {

}

export declare type TAxisMarksPluginOptions = {xAxis: IAxisMarkOptions[], yAxis: IAxisMarkOptions[]}

export class AxisMarksPlugin extends ChartPlugin {
	static NAME = 'AxisMarks';
	static providedWidgets: typeof ChartWidget[] = [AxisMarksWidget];

	constructor(axisMarksPluginOptions: TAxisMarksPluginOptions) {
		super(axisMarksPluginOptions);
	}

	protected onInitialStateAppliedHandler() {
		this.bindEvents();
	}


	protected onStateChanged() {
		this.onMarksChangeHandler();
	}


	getOptions(): TAxisMarksPluginOptions {
		return super.getOptions() as TAxisMarksPluginOptions;
	}



}
