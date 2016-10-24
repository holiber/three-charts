import { Chart, IChartState } from "./Chart";
import { Utils } from './Utils';
import { EventEmitter } from './EventEmmiter';
import { ChartWidget } from './Widget';

export interface IChartPluginState {
}

export interface IChartPluginConfig {
	installPluginWidgets?: boolean;
}

export const DEFAULT_CONFIG: IChartPluginConfig = {
	installPluginWidgets: true
};

/**
 * base class for all plugins
 * NAME is mandatory
 */
export abstract class ChartPlugin {
	static NAME: string = '';
	static providedWidgets: typeof ChartWidget[] = [];

	initialState: IChartPluginState;
	config: IChartPluginConfig;
	name: string;
	protected chart: Chart;
	protected unsubscribers: Function[] = [];
	protected ee: EventEmitter;

	constructor (options?: IChartPluginState, config: IChartPluginConfig = {}) {
		this.initialState = options;
		this.config = Utils.deepMerge(DEFAULT_CONFIG, config);
		this.name = (this.constructor as typeof ChartPlugin).NAME;
		if (!this.name) Utils.error('Unnamed plugin detected');
	}

	setupChart(chart: Chart) {
		this.chart = chart;
		this.ee = new EventEmitter();
		this.bindEvent(
			this.chart.onInitialStateApplied(initialState => this.onInitialStateAppliedHandler(initialState)),
			this.chart.onReady(() => this.onReadyHandler()),
			this.chart.onDestroy(() => this.onDestroyHandler()),
			this.chart.onPluginsStateChange(changedPluginsStates => changedPluginsStates[this.name] && this.onStateChanged(changedPluginsStates[this.name]))
		)
	}

	getOptions(): IChartPluginState {
		return this.chart.chart.pluginsState[this.name];
	}

	protected onInitialStateAppliedHandler(initialState: IChartState) {
	}

	protected onReadyHandler() {
	}

	protected onStateChanged(changedState: IChartPluginState) {
	}

	protected onDestroyHandler() {
		this.ee.removeAllListeners();
	}

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
}

