
import {
	ChartPlugin, ChartWidget, Utils, Chart, TColor, UniqCollection,
	UniqCollectionItem, IIteralable, TEase
} from 'three-charts';
import { ZonesWidget } from "./ZonesWidget";

export enum ZONE_TYPE {
	X_RANGE
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

const ZONE_DEFAULT_OPTIONS: IZoneOptions = {
	name: '',
	title: '',
	type: ZONE_TYPE.X_RANGE,
	bgColor: '#b81820',
	easeSpeed: 500,
	opacity: 0.4,
	position: {
		startXVal: 0,
		startYVal: 0,
		endXVal: 0,
		endYVal: 0
	}
};

export interface IZonePosition {
	startXVal?: number;
	startYVal?: number;
	endXVal?: number;
	endYVal?: number;
}

export class Zone extends UniqCollectionItem implements IZoneOptions {
	name: string;
	title: string;
	position: IZonePosition;
	type: ZONE_TYPE;
	bgColor: TColor;
	userData: any;
	ease: TEase;
	easeSpeed: number;
	opacity: number;

	constructor (private zonePlugin: ZonesPlugin, private chart: Chart) {
		super();
		Utils.patch(this as IIteralable, ZONE_DEFAULT_OPTIONS);
		if (this.type == ZONE_TYPE.X_RANGE) {
			this.position.startYVal = -Infinity;
			this.position.endYVal = Infinity;
		}
	}

	remove() {
		this.chart.setState({pluginsState: {[ZonesPlugin.NAME]: [{_id: this.getId()}]}});
	}

	update(newOptions: IZoneOptions) {
		let options = Utils.deepMerge({_id: this.getId()} as IZoneOptions, newOptions);
		this.chart.setState({pluginsState: {[ZonesPlugin.NAME]: [options]}});
	}
}



export class ZonesPlugin extends ChartPlugin<IZoneOptions[]> {
	static NAME = 'Zone';
	static providedWidgets: typeof ChartWidget[] = [ZonesWidget];

	items = new UniqCollection<Zone, IZoneOptions>({
		createInstance: () => new Zone(this, this.chart)
	});

	constructor(pluginOptions: IZoneOptions[]) {
		super(pluginOptions);
	}

	protected onInitialStateAppliedHandler() {
		this.onStateChangedHandler(this.getOptions());
	}

	protected onStateChangedHandler(options: IZoneOptions[]) {
		this.items.patch(options);
	}

	create(zoneOptions: IZoneOptions): Zone {
		this.chart.setState({pluginsState: {[this.name]: [zoneOptions]}});
		return this.items.getLast();
	}

}


