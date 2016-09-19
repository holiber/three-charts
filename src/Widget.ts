import {ChartState} from "./State";
import Object3D = THREE.Object3D;

export interface IChartWidgetConstructor {
	new (chartState: ChartState): ChartWidget;
	widgetName: string;
	getDefaultOptions(): IChartWidgetOptions;
}

/**
 * base class for all widgets
 * each widget must have widgetName static property
 */
export abstract class ChartWidget {
	static widgetName = '';
	protected chartState: ChartState;
	private unsubscribers: Function[] = [];

	constructor (chartState: ChartState) {
		this.chartState = chartState;
		this.bindEvents();
	}

	
	abstract getObject3D(): Object3D;
	
	protected bindEvents() {}

	protected bindEvent(...args: Array<Function | Function[]>): void {
		let unsubscribers: Function[] = [];
		if (!Array.isArray(args[0])) {
			unsubscribers.push(args[0] as Function);
		} else {
			unsubscribers.push(...args as Function[]);
		}
		this.unsubscribers.push(...unsubscribers);
	}
	protected unbindEvents() {
		this.unsubscribers.forEach(unsubscriber => unsubscriber());
		this.unsubscribers.length = 0;
	}
	
	static getDefaultOptions(): IChartWidgetOptions {
		return {enabled: true}
	}
}

export interface IChartWidgetOptions {
	enabled: boolean
}

