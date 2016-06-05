import Object3D = THREE.Object3D;
import { ChartState } from "../State";
import Texture = THREE.Texture;
import { ITrendOptions, ITrendData } from "../Trend";
import { TrendsWidget, TrendWidget } from "./TrendsWidget";
export declare class TrendsGradientWidget extends TrendsWidget<TrendGradient> {
    static widgetName: string;
    protected getTrendWidgetClass(): typeof TrendGradient;
    static generateGradientTexture(): Texture;
}
export declare class TrendGradient extends TrendWidget {
    private gradient;
    static widgetIsEnabled(trendOptions: ITrendOptions): boolean;
    data: ITrendData;
    constructor(chartState: ChartState, trendName: string);
    getObject3D(): Object3D;
    appendData(newData: ITrendData): void;
    private initGradient(startItem);
    private updateGradient(newData);
    private setupGradientPart(partInd, gradientGeometry, trendItem, nextTrendItem, startItem);
}
