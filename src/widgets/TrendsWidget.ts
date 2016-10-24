
import {ChartWidget} from "../Widget";
import Object3D = THREE.Object3D;
import {Chart} from "../Chart";
import {ITrendOptions, ITrendData, Trend} from "../Trend";
import Vector2 = THREE.Vector2;
import Vector3 = THREE.Vector3;
import {TrendSegmentsManager} from "../TrendSegmentsManager";
import {IScreenTransformOptions} from "../Screen";


export interface ITrendWidgetClass<TrendWidgetType> {
	new (chart: Chart, trendName: string): TrendWidgetType;
	widgetIsEnabled(trendOptions: ITrendOptions, chart: Chart): boolean;
}

/**
 * abstract manager class for all trends widgets
 */
export abstract class TrendsWidget<TrendWidgetType extends TrendWidget> extends ChartWidget {
	protected abstract getTrendWidgetClass(): ITrendWidgetClass<TrendWidgetType>;
	protected object3D: Object3D;
	protected widgets: {[trendName: string]: TrendWidgetType} = {};

	onReadyHandler() {
		this.object3D = new Object3D();
		this.onTrendsChange();
		this.bindEvents();
	}

	protected bindEvents() {
		var state = this.chart;
		state.onTrendsChange(() => this.onTrendsChange());
		state.onTrendChange((trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => {
			this.onTrendChange(trendName, changedOptions, newData)
		});
	}

	protected onTrendsChange() {
		var trendsOptions = this.chart.state.trends;
		var TrendWidgetClass = this.getTrendWidgetClass();
		for (let trendName in trendsOptions) {
			let trendOptions = trendsOptions[trendName];
			let widgetCanBeEnabled = TrendWidgetClass.widgetIsEnabled(trendOptions, this.chart);
			if (widgetCanBeEnabled && !this.widgets[trendName]) {
				this.createTrendWidget(trendName);
			} else if (!widgetCanBeEnabled && this.widgets[trendName]){
				this.destroyTrendWidget(trendName);
			}
		}
	}

	private onTrendChange(trendName: string, changedOptions: ITrendOptions, newData: ITrendData) {
		var widget = this.widgets[trendName];
		if (!widget) return;
		widget.onTrendChange(changedOptions);
		if (newData) {
			var data = this.chart.getTrend(trendName).getData();
			var isAppend = (!data.length || data[0].xVal < newData[0].xVal);
			isAppend ? widget.appendData(newData) : widget.prependData(newData);
		}
	}

	getObject3D(): Object3D {
		return this.object3D;
	}

	private createTrendWidget(trendName: string) {
		var WidgetConstructor = this.getTrendWidgetClass();
		var widget = new WidgetConstructor(this.chart, trendName);
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
	protected unbindList: Function[] = [];

	constructor (protected chart: Chart, protected trendName: string) {
		this.trend = chart.trendsManager.getTrend(trendName);
		this.chart = chart;
		this.bindEvents();
	}
	abstract getObject3D(): Object3D;
	static widgetIsEnabled(trendOptions: ITrendOptions, chart: Chart) {
		return trendOptions.enabled;
	}
	appendData(newData: ITrendData) {};
	prependData(newData: ITrendData) {};
	onTrendChange(changedOptions?: ITrendOptions) {}
	onDestroy() {
		for (let unsubscriber of this.unbindList) {
			unsubscriber();
		}
	}
	protected onSegmentsAnimate(segments: TrendSegmentsManager) {
	}
	protected onZoomFrame(options: IScreenTransformOptions) {
	}
	protected onTransformationFrame(options: IScreenTransformOptions) {
	}
	protected onZoom() {
	}


	protected bindEvents() {

		this.bindEvent(this.trend.segmentsManager.onAnimationFrame(
			(trendPoints: TrendSegmentsManager) => this.onSegmentsAnimate(trendPoints)
		));

		this.bindEvent(this.chart.screen.onTransformationFrame(
			(options) => this.onTransformationFrame(options)
		));
		
		this.bindEvent(this.chart.screen.onZoomFrame(
			(options) => this.onZoomFrame(options)
		));

		this.bindEvent(this.chart.onZoom(() => this.onZoom()));
	};

	protected bindEvent(unbind: Function) {
		this.unbindList.push(unbind);
	}


}
