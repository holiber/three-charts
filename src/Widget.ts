import {ChartState} from "./State";
import Object3D = THREE.Object3D;

export interface IChartWidgetConstructor {
	new (chartState: ChartState): ChartWidget;
	widgetName: string;
	getDefaultOptions(): IChartWidgetOptions;
}

export abstract class ChartWidget {
	static widgetName = '';
	protected chartState: ChartState;

	constructor (chartState: ChartState) {
		this.chartState = chartState;
	}
	
	abstract getObject3D(): Object3D;
	
	static getDefaultOptions(): IChartWidgetOptions {
		return {enabled: true}
	}
}

export interface IChartWidgetOptions {
	enabled: boolean
}

