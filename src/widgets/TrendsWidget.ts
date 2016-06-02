
import {ChartWidget} from "../Widget";
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import {ITrendOptions, ITrendData, Trend} from "../Trend";
import {IAxisOptions, MAX_DATA_LENGTH} from "../Chart";
import Vector2 = THREE.Vector2;
import Vector3 = THREE.Vector3;
import {TrendPoints} from "../TrendPoints";
import {IScreenTransformOptions} from "../Screen";


interface ITrendWidgetClass<TrendWidgetType> {
	new (chartState: ChartState, trendName: string): TrendWidgetType;
	widgetIsEnabled(trendOptions: ITrendOptions, chartState: ChartState): boolean;
}

/**
 * abstract manager class for all trends widgets
 */
export abstract class TrendsWidget<TrendWidgetType extends TrendWidget> extends ChartWidget {
	protected abstract getTrendWidgetClass(): ITrendWidgetClass<TrendWidgetType>;
	protected object3D: Object3D;
	protected widgets: {[trendName: string]: TrendWidgetType} = {};

	constructor (state: ChartState) {
		super(state);
		this.object3D = new Object3D();
		this.onTrendsChange();
	}

	protected bindEvents() {
		var state = this.chartState;
		state.onTrendsChange(() => this.onTrendsChange());
		state.onTrendChange((trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => {
			this.onTrendChange(trendName, changedOptions, newData)
		});
	}

	protected onTrendsChange() {
		var trendsOptions = this.chartState.data.trends;
		var TrendWidgetClass = this.getTrendWidgetClass();
		for (let trendName in trendsOptions) {
			let trendOptions = trendsOptions[trendName];
			if (TrendWidgetClass.widgetIsEnabled(trendOptions, this.chartState) && !this.widgets[trendName]) {
				this.createTrendWidget(trendName);
			} else if (!trendOptions.enabled && this.widgets[trendName]){
				this.destroyTrendWidget(trendName);
			}
		}
	}

	private onTrendChange(trendName: string, changedOptions: ITrendOptions, newData: ITrendData) {
		if (!changedOptions.data) return;
		var widget = this.widgets[trendName];
		if (!widget) return;
		widget.onTrendChange(changedOptions);
		if (newData) {
			var data = this.chartState.getTrend(trendName).getData();
			var isAppend = (!data.length || data[0].xVal < newData[0].xVal);
			isAppend ? widget.appendData(newData) : widget.prependData(newData);
		}
	}

	getObject3D(): Object3D {
		return this.object3D;
	}

	private createTrendWidget(trendName: string) {
		var WidgetConstructor = this.getTrendWidgetClass();
		var widget = new WidgetConstructor(this.chartState, trendName);
		this.widgets[trendName] = widget;
		var widgetObject = widget.getObject3D();
		widgetObject.name = trendName;
		this.object3D.add(widget.getObject3D());
	}

	private destroyTrendWidget(trendName: string) {
		this.widgets[trendName].onDestroy();
		delete this.widgets[trendName];
		var widgetObject = this.object3D.getObjectByName(trendName);
		this.object3D.remove(widgetObject);
	}
}

/**
 * based class for all trends widgets
 */
export abstract class TrendWidget {
	protected trend: Trend;
	private unsubscribers: Function[] = [];

	constructor (protected chartState: ChartState, protected trendName: string) {
		this.trend = chartState.trends.getTrend(trendName);
		this.chartState = chartState;
		this.bindEvents();
	}
	abstract getObject3D(): Object3D;
	static widgetIsEnabled(trendOptions: ITrendOptions, chartState: ChartState) {
		return trendOptions.enabled;
	}
	appendData(newData: ITrendData) {};
	prependData(newData: ITrendData) {};
	onTrendChange(changedOptions?: ITrendOptions) {}
	onDestroy() {
		for (let unsubscriber of this.unsubscribers) {
			unsubscriber();
		}
	}
	protected onPointsMove(trendPoints: TrendPoints) {
	}
	protected onZoomFrame(options: IScreenTransformOptions) {
	}
	protected onTransformationFrame(options: IScreenTransformOptions) {
	}
	protected onZoom() {
	}


	protected bindEvents() {

		this.bindEvent(this.trend.points.onAnimationFrame(
			(trendPoints: TrendPoints) => this.onPointsMove(trendPoints)
		));

		this.bindEvent(this.chartState.screen.onTransformationFrame(
			(options) => this.onTransformationFrame(options)
		));
		
		this.bindEvent(this.chartState.screen.onZoomFrame(
			(options) => this.onZoomFrame(options)
		));

		this.bindEvent(this.chartState.onZoom(() => this.onZoom()));
	};

	protected bindEvent(unsubscriber: Function) {
		this.unsubscribers.push(unsubscriber);
	}


}