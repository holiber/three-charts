import { Chart, IChartState } from "./Chart";
import { EventEmitter } from './EventEmmiter';
import { ChartWidget } from './Widget';
export interface IChartPluginState {
}
export interface IChartPluginConfig {
    installPluginWidgets?: boolean;
}
export declare const DEFAULT_CONFIG: IChartPluginConfig;
/**
 * base class for all plugins
 * NAME is mandatory
 */
export declare abstract class ChartPlugin<TPluginState> {
    static NAME: string;
    static providedWidgets: typeof ChartWidget[];
    initialState: IChartPluginState;
    config: IChartPluginConfig;
    name: string;
    protected chart: Chart;
    protected unsubscribers: Function[];
    protected ee: EventEmitter;
    constructor(options?: TPluginState, config?: IChartPluginConfig);
    setupChart(chart: Chart): void;
    getOptions(): TPluginState;
    protected onInitialStateAppliedHandler(initialState: IChartState): void;
    protected onReadyHandler(): void;
    protected onStateChangedHandler(changedState: TPluginState): void;
    protected onDestroyHandler(): void;
    protected bindEvent(...args: Array<Function | Function[]>): void;
    protected unbindEvents(): void;
}
