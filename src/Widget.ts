import {Chart} from "./Chart";
import Object3D = THREE.Object3D;

export interface IChartWidgetConstructor {
	new (): ChartWidget;
	widgetName: string;
}

/**
 * base class for all widgets
 * each widget must have widgetName static property
 */
export abstract class ChartWidget {
	static widgetName = '';
	protected chart: Chart;
	private unbindList: Function[] = [];


	setupChart(chart: Chart) {
		this.chart = chart;
	}

	abstract onReadyHandler(): any;
	abstract getObject3D(): Object3D;


	protected bindEvent(...args: Array<Function | Function[]>): void {
		let unbindList: Function[] = [];
		if (!Array.isArray(args[0])) {
			unbindList.push(args[0] as Function);
		} else {
			unbindList.push(...args as Function[]);
		}
		this.unbindList.push(...unbindList);
	}
	protected unbindEvents() {
		this.unbindList.forEach(unbindEvent => unbindEvent());
		this.unbindList.length = 0;
	}
}
