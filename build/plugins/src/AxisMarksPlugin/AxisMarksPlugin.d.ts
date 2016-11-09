import { ChartPlugin, ChartWidget, AXIS_TYPE, Chart, TColor, IChartState, UniqCollection, UniqCollectionItem, TEase } from 'three-charts';
import { AxisMarkWidget } from './AxisMarksWidget';
export declare type TAxisMarksPluginOptions = IAxisMarkOptions[];
export interface IAxisMarkOptions {
    name?: string;
    title?: string;
    description?: string;
    axisType?: AXIS_TYPE;
    color?: TColor;
    lineWidth?: number;
    width?: number;
    stickToEdges?: boolean;
    value?: number;
    displayedValue?: (axisMarkWidget: AxisMarkWidget, chart: Chart) => string;
    userData?: any;
    needRender?: (axisMarkWidget: AxisMarkWidget, changedProps: IChartState, chart: Chart) => boolean;
    ease?: TEase;
    easeSpeed?: number;
    opacity?: number;
    renderer?: (axisMarkWidget: AxisMarkWidget, ctx: CanvasRenderingContext2D, width: number, height: number, chart: Chart) => any;
}
export declare class AxisMark extends UniqCollectionItem implements IAxisMarkOptions {
    private axisMarkPlugin;
    private chart;
    name: string;
    title: string;
    description: string;
    axisType: AXIS_TYPE;
    color: TColor;
    lineWidth: number;
    width: number;
    stickToEdges: boolean;
    value: number;
    opacity: number;
    displayedValue: (axisMarkWidget: AxisMarkWidget, chart: Chart) => string;
    userData: any;
    needRender: (axisMarkWidget: AxisMarkWidget, changedProps: IChartState, chart: Chart) => boolean;
    ease?: TEase;
    easeSpeed?: number;
    renderer: (axisMarkWidget: AxisMarkWidget, ctx: CanvasRenderingContext2D, width: number, height: number, chart: Chart) => any;
    constructor(axisMarkPlugin: AxisMarksPlugin, chart: Chart);
    remove(): void;
    update(newOptions: IAxisMarkOptions): void;
}
export declare class AxisMarksPlugin extends ChartPlugin<TAxisMarksPluginOptions> {
    static NAME: string;
    static providedWidgets: typeof ChartWidget[];
    marksCollection: UniqCollection<AxisMark, IAxisMarkOptions>;
    constructor(axisMarksPluginOptions: TAxisMarksPluginOptions);
    protected onInitialStateAppliedHandler(): void;
    protected onStateChangedHandler(axisMarksOptions: IAxisMarkOptions[]): void;
    createMark(markOptions: IAxisMarkOptions): AxisMark;
}
