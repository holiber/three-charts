import Mesh = THREE.Mesh;
import { TrendWidget, TrendsWidget, ITrendOptions, Chart } from 'three-charts';
/**
 * widget adds loading indicator
 * activated when animations enabled
 */
export declare class TrendsLoadingWidget extends TrendsWidget<TrendLoading> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendLoading;
}
export declare class TrendLoading extends TrendWidget {
    private mesh;
    private animation;
    private isActive;
    static widgetIsEnabled(trendOptions: ITrendOptions, chart: Chart): any;
    constructor(chart: Chart, trendName: string);
    getObject3D(): Mesh;
    bindEvents(): void;
    prependData(): void;
    private activate();
    private deactivate();
    private static createTexture();
    protected onZoomFrame(): void;
    private updatePosition();
}
