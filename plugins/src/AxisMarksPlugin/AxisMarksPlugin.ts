
import {
	ChartPlugin, ChartWidget, AXIS_TYPE, Utils, Chart, TColor, IChartState, UniqCollection,
	UniqCollectionItem, IIteralable, TEase, EASING
} from 'three-charts';
import { AxisMarksWidget, AxisMarkWidget } from './AxisMarksWidget';

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
	needRender?: (axisMarkWidget: AxisMarkWidget, chart: Chart, changedProps?: IChartState) => boolean,
	ease?: TEase;
	easeSpeed?: number;
	opacity?: number;
	renderer?: (
		axisMarkWidget: AxisMarkWidget,
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		chart: Chart
	) => any;
}

const AXIS_MARK_DEFAULT_OPTIONS: IAxisMarkOptions = {
	lineWidth: 3,
	width: 200,
	value: 0,
	stickToEdges: false,
	color: 'rgba(#45a9e1, 0.6)',
	title: '',
	ease: EASING.Quadratic.Out,
	easeSpeed: 500,
	opacity: 1
};

export class AxisMark extends UniqCollectionItem implements IAxisMarkOptions {
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
	needRender: (axisMarkWidget: AxisMarkWidget, chart: Chart, changedProps?: IChartState) => boolean;
	ease?: TEase;
	easeSpeed?: number;
	renderer: (
		axisMarkWidget: AxisMarkWidget,
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		chart: Chart
	) => any;

	constructor (private axisMarkPlugin: AxisMarksPlugin, private chart: Chart) {
		super();
		Utils.patch(this as IIteralable, AXIS_MARK_DEFAULT_OPTIONS);
	}

	remove() {
		this.chart.setState({pluginsState: {[AxisMarksPlugin.NAME]: [{_id: this.getId()}]}});
	}

	update(newOptions: IAxisMarkOptions) {
		let options = Utils.deepMerge({_id: this.getId()} as IAxisMarkOptions, newOptions);
		this.chart.setState({pluginsState: {[AxisMarksPlugin.NAME]: [options]}});
	}
}



export class AxisMarksPlugin extends ChartPlugin<TAxisMarksPluginOptions> {
	static NAME = 'AxisMarks';
	static providedWidgets: typeof ChartWidget[] = [AxisMarksWidget];

	marksCollection = new UniqCollection<AxisMark, IAxisMarkOptions>({
		createInstance: () => new AxisMark(this, this.chart)
	});

	constructor(axisMarksPluginOptions: TAxisMarksPluginOptions) {
		super(axisMarksPluginOptions);
	}

	protected onInitialStateAppliedHandler() {
		this.onStateChangedHandler(this.getOptions());
	}

	protected onStateChangedHandler(axisMarksOptions: IAxisMarkOptions[]) {
		this.marksCollection.patch(axisMarksOptions);
	}

	createMark(markOptions: IAxisMarkOptions): AxisMark {
		this.chart.setState({pluginsState: {[this.name]: [markOptions]}});
		return this.marksCollection.getLast();
	}

}


