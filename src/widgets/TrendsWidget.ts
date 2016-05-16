
import {ChartWidget} from "../Widget";
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import {ITrendOptions, ITrendData, Trend} from "../Trend";
import {IAxisOptions} from "../Chart";


interface ITrendWidgetClass<TrendWidgetType> {
	new (chartState: ChartState, trendName: string): TrendWidgetType;
	widgetIsEnabled(trendOptions: ITrendOptions): boolean;
}

/**
 * based class for all trends widgets
 */
export abstract class TrendWidget {
	protected trend: Trend;
	constructor (protected chartState: ChartState, protected trendName: string) {
		this.trend = chartState.trends.getTrend(trendName);
	}
	abstract getObject3D(): Object3D;
	static widgetIsEnabled(trendOptions: ITrendOptions) {
		return trendOptions.enabled;
	}
	appendData(newData: ITrendData) {};
	onTrendChange(changedOptions?: ITrendOptions) {}
}

/**
 * abstract manager class for all trends widgets
 */
export abstract class TrendsWidget<TrendWidgetType extends TrendWidget> extends ChartWidget {
	protected abstract getTrendWidgetClass(): ITrendWidgetClass<TrendWidgetType>;
	protected object3D: Object3D;
	protected widgets: {[trendName: string]: TrendWidgetType} = {};
	protected scrollAnimation: TweenLite;

	constructor (state: ChartState) {
		super(state);
		this.object3D = new Object3D();
		this.onTrendsChange();
		this.onScrollChange();
	}

	protected bindEvents() {
		var state = this.chartState;
		state.onTrendsChange(() => this.onTrendsChange());
		state.onTrendChange((trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => {
			this.onTrendChange(trendName, changedOptions, newData)
		});
		state.onXAxisChange((changedOptions: IAxisOptions) => {
			if (changedOptions.range && changedOptions.range.scroll) this.onScrollChange();
		});
	}

	protected onTrendsChange() {
		var trendsOptions = this.chartState.data.trends;
		var TrendWidgetClass = this.getTrendWidgetClass();
		for (let trendName in trendsOptions) {
			let trendOptions = trendsOptions[trendName];
			if (TrendWidgetClass.widgetIsEnabled(trendOptions) && !this.widgets[trendName]) {
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
		if (newData) widget.appendData(newData);
	}

	private onScrollChange() {
		var state = this.chartState;
		var scrollX = state.data.xAxis.range.scroll;
		var cursor = state.data.cursor;
		var animations = state.data.animations;
		var time = animations.autoScrollSpeed;
		var ease = animations.autoScrollEase;
		var canAnimate = animations.enabled && !cursor.dragMode;
		if (this.scrollAnimation) this.scrollAnimation.kill();
		if (canAnimate) {
			this.scrollAnimation = TweenLite.to(this.object3D.position, time, {x: scrollX, ease: ease});
		} else {
			this.object3D.position.x = scrollX;
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
		delete this.widgets[trendName];
		var widgetObject = this.object3D.getObjectByName(trendName);
		this.object3D.remove(widgetObject);
	}
}