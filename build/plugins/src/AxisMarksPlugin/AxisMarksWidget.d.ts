import Object3D = THREE.Object3D;
import { ChartWidget, Chart, IChartState, Animation } from 'three-charts';
import { AxisMark, AxisMarksPlugin, IAxisMarkOptions } from "./AxisMarksPlugin";
/**
 * widget for shows marks on axis
 */
export declare class AxisMarksWidget extends ChartWidget {
    static widgetName: string;
    protected object3D: Object3D;
    protected axisMarksWidgets: AxisMarkWidget[];
    protected axisMarksPlugin: AxisMarksPlugin;
    onReadyHandler(): void;
    private createAxisMarkWidget(axisMark);
    protected bindEvents(): void;
    protected onMarkUpdateHandler(mark: AxisMark, changedOptions: IAxisMarkOptions): void;
    protected onMarkRemoveHandler(mark: AxisMark): void;
    private updateMarksPositions();
    private onStateChangeHandler(changedProps);
    getObject3D(): Object3D;
}
export declare const DEFAULT_AXIS_MARK_RENDERER: (axisMarkWidget: AxisMarkWidget, ctx: CanvasRenderingContext2D, width: number, height: number, chart: Chart) => void;
export declare class AxisMarkWidget {
    axisMark: AxisMark;
    isStickOnTop: boolean;
    isStickOnBottom: boolean;
    displayedValue: string;
    height: number;
    width: number;
    frameValue: number;
    frameOpacity: number;
    animation: Animation<number[]>;
    protected object3D: Object3D;
    protected chart: Chart;
    constructor(chart: Chart, axisMark: AxisMark);
    getObject3D(): Object3D;
    initObject(): void;
    onStateChangeHandler(changedProps: IChartState): void;
    render(): void;
    update(options: IAxisMarkOptions): void;
    updatePosition(): void;
}
