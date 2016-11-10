import { ChartPlugin, ChartWidget, Chart, TColor, UniqCollection, UniqCollectionItem, TEase } from 'three-charts';
export declare enum ZONE_TYPE {
    X_RANGE = 0,
}
export interface IZoneOptions {
    name?: string;
    title?: string;
    position?: IZonePosition;
    type?: ZONE_TYPE;
    bgColor?: TColor;
    userData?: any;
    ease?: TEase;
    easeSpeed?: number;
    opacity?: number;
}
export interface IZonePosition {
    startXVal?: number;
    startYVal?: number;
    endXVal?: number;
    endYVal?: number;
}
export declare class Zone extends UniqCollectionItem implements IZoneOptions {
    private zonePlugin;
    private chart;
    name: string;
    title: string;
    position: IZonePosition;
    type: ZONE_TYPE;
    bgColor: TColor;
    userData: any;
    ease: TEase;
    easeSpeed: number;
    opacity: number;
    constructor(zonePlugin: ZonesPlugin, chart: Chart);
    remove(): void;
    update(newOptions: IZoneOptions): void;
}
export declare class ZonesPlugin extends ChartPlugin<IZoneOptions[]> {
    static NAME: string;
    static providedWidgets: typeof ChartWidget[];
    items: UniqCollection<Zone, IZoneOptions>;
    constructor(pluginOptions: IZoneOptions[]);
    protected onInitialStateAppliedHandler(): void;
    protected onStateChangedHandler(options: IZoneOptions[]): void;
    create(zoneOptions: IZoneOptions): Zone;
}
