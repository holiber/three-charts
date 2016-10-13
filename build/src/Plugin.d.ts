import { ChartState, IChartState } from "./State";
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
export declare abstract class ChartPlugin {
    static NAME: string;
    static pluginWidgets: typeof ChartWidget[];
    initialState: IChartPluginState;
    config: IChartPluginConfig;
    name: string;
    protected chartState: ChartState;
    protected unsubscribers: Function[];
    protected ee: EventEmitter;
    constructor(options?: IChartPluginState, config?: IChartPluginConfig);
    setupChartState(chartState: ChartState): void;
    getOptions(): IChartPluginState;
    protected onInitialStateAppliedHandler(initialState: IChartState): void;
    protected onChartReadyHandler(): void;
    protected onStateChanged(changedState: IChartPluginState): void;
    protected onDestroyHandler(): void;
    protected bindEvent(...args: Array<Function | Function[]>): void;
    protected unbindEvents(): void;
}
