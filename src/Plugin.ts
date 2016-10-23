import { ChartState, IChartState } from "./State";
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
	protected chartState: ChartState;
	protected unsubscribers: Function[] = [];
	protected ee: EventEmitter;

	constructor (options?: IChartPluginState, config: IChartPluginConfig = {}) {
		this.initialState = options;
		this.config = Utils.deepMerge(DEFAULT_CONFIG, config);
		this.name = (this.constructor as typeof ChartPlugin).NAME;
		if (!this.name) Utils.error('Unnamed plugin detected');
	}

	setupChartState(chartState: ChartState) {
		this.chartState = chartState;
		this.ee = new EventEmitter();
		this.bindEvent(
			this.chartState.onInitialStateApplied(initialState => this.onInitialStateAppliedHandler(initialState)),
			this.chartState.onReady(() => this.onReadyHandler()),
			this.chartState.onDestroy(() => this.onDestroyHandler()),
			this.chartState.onPluginsStateChange(changedPluginsStates => changedPluginsStates[this.name] && this.onStateChanged(changedPluginsStates[this.name]))
		)
	}

	getOptions(): IChartPluginState {
		return this.chartState.data.pluginsState[this.name];
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

