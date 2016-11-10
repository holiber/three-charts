import Object3D = THREE.Object3D;
import Mesh = THREE.Mesh;
import { ChartWidget, Chart, Animation } from 'three-charts';
import { Zone, ZonesPlugin, IZoneOptions } from "./ZonesPlugin";
/**
 * widget for shows marks on axis
 */
export declare class ZonesWidget extends ChartWidget {
    static widgetName: string;
    protected object3D: Object3D;
    protected items: ZoneWidget[];
    protected zonesPlugin: ZonesPlugin;
    onReadyHandler(): void;
    protected createZoneWidget(zone: Zone): void;
    protected bindEvents(): void;
    protected onZoneUpdateHandler(mark: Zone, changedOptions: IZoneOptions): void;
    protected onZoneRemoveHandler(mark: Zone): void;
    protected updateZonesPositions(): void;
    forEach(fn: (widget: ZoneWidget) => any): void;
    getObject3D(): Object3D;
}
export interface IZoneAnimatedProps {
    startXVal: number;
    endXVal: number;
    startYVal: number;
    endYVal: number;
    opacity: number;
}
export declare class ZoneWidget {
    zone: Zone;
    protected animation: Animation<IZoneAnimatedProps>;
    protected animatedProps: IZoneAnimatedProps;
    protected object3D: Object3D;
    protected mesh: Mesh;
    protected chart: Chart;
    constructor(chart: Chart, zone: Zone);
    getObject3D(): Object3D;
    initObject(): void;
    update(options: IZoneOptions): void;
    updatePosition(): void;
}
