
import {MAX_DATA_LENGTH} from "./Chart";
var EE = require('EventEmitter2') as typeof EventEmitter2;
import {ChartState} from "./State";
import Vector3 = THREE.Vector3;
import {ITrendData, ITrendOptions} from "./Trend";
import {Utils} from "./Utils";

interface ITargets {
	ease?: Linear | Ease
	[key: string]: number | Linear | Ease
}

interface ICurrent {
	[key: string]: number
}

export interface TrendAnimationState {
	currentAnimation?: TweenLite
	points: Vector3[];

	// objects like {x0: 1, y0: 2, x1: 2, y2: 3, ...}
	current: {[key: string]: number}
	targets: ITargets
}

// export interface TrendAnimationState1 {
// 	currentAnimation?: TweenLite
// 	points: Vector3[];
// 	targets: number[];
// 	current: number[]
// }


/**
 * class helps widgets to animate trends points on chart
 */
export class TrendsAnimationManager {

	private trendsAnimationStates: {[trendName: string]: TrendAnimationState} = {};
	private ee: EventEmitter2;

	constructor (private chartState: ChartState) {
		this.ee = new EE();
		this.onTrendsChange();
		this.bindEvents();
	}

	getState(trendName: string): TrendAnimationState {
		return this.trendsAnimationStates[trendName];
	}

	onAnimate(trendName: string, cb: (animationState: TrendAnimationState) => void): Function {
		var eventName = 'animate.' + trendName;
		this.ee.on('animate.' + trendName, cb);
		return () => {
			this.ee.removeListener(eventName, cb);
		}
	}

	protected bindEvents() {
		var state = this.chartState;
		state.onTrendsChange(() => this.onTrendsChange());
		state.onTrendChange((trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => {
			if (newData) {
				this.appendData(trendName, newData);
			}
		});
		state.onZoom(() => this.updateAllTrends());
	}

	private onTrendsChange() {
		var trendsOptions = this.chartState.data.trends;
		for (let trendName in trendsOptions) {
			let trendOptions = trendsOptions[trendName];
			if (trendOptions.enabled && !this.trendsAnimationStates[trendName]) {
				this.createAnimationPoints(trendName);
			} else if (!trendOptions.enabled && this.trendsAnimationStates[trendName]) {
				this.destroyAnimationPoints(trendName);
			}
		}
	}

	private createAnimationPoints(trendName: string) {
		var animationState: TrendAnimationState = {points: [], targets: {ease: void 0}, current: {}};
		var pointsData = animationState.points;
		var current = animationState.current;
		var trendData = this.chartState.getTrend(trendName).getData();
		var firstItem = trendData[0];
		var firstPoint = this.chartState.getPointOnChart(firstItem.xVal, firstItem.yVal);
		var i = MAX_DATA_LENGTH;
		while (i--) {
			pointsData.push(firstPoint.clone());
			current['x' + i] = firstPoint.x;
			current['y' + i] = firstPoint.y;
		}
		this.trendsAnimationStates[trendName] = animationState;
		this.appendData(trendName, trendData);
	}

	private destroyAnimationPoints(trendName: string) {
		var animationPoints = this.trendsAnimationStates[trendName];
		if (animationPoints.currentAnimation) animationPoints.currentAnimation.kill();
		delete this.trendsAnimationStates[trendName];
	}

	private appendData(trendName: string, newData: ITrendData) {
		var animationPoints = this.trendsAnimationStates[trendName];
		if (!animationPoints) return;
		var chartState = this.chartState;
		var trendData = chartState.getTrend(trendName).getData();
		var animationsOptions = chartState.data.animations;
		var startItemInd = trendData.length - newData.length;
		var startItem = trendData[startItemInd - 1] || newData[0];
		var {points} = animationPoints;
		var current: ICurrent = {};
		var targets: ITargets = {};
		for (let itemInd = startItemInd; itemInd < trendData.length; itemInd++) {
			let trendItem = trendData[itemInd];
			let startPoint = chartState.getPointOnChart(startItem.xVal, startItem.yVal);
			let targetPoint = chartState.getPointOnChart(trendItem.xVal, trendItem.yVal);
			points[itemInd] = targetPoint;
			current['x' + itemInd] = startPoint.x;
			current['y' + itemInd] = startPoint.y;
			targets['x' + itemInd] = targetPoint.x;
			targets['y' + itemInd] = targetPoint.y;
		}
		targets.ease = animationsOptions.trendChangeEase;
		var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
		this.animate(trendName, time, targets, current);
	}

	private updateAllTrends() {
		for (let trendName in this.trendsAnimationStates) {
			this.updateAllTrendPoints(trendName);
		}
	}

	private updateAllTrendPoints(trendName: string) {
		var chartState = this.chartState;
		var {points} = this.trendsAnimationStates[trendName];
		var trendData = chartState.getTrend(trendName).getData();
		var targets: ITargets = {};
		var currents: ICurrent = {};

		var currentXFrom = chartState.data.xAxis.range.from;
		var prevXFrom = chartState.data.prevState.xAxis.range.from;
		var xFromDiff = currentXFrom - prevXFrom;

		for (var itemInd = 0; itemInd < trendData.length; itemInd++) {
			let trendItem = trendData[itemInd];
			let targetPoint = chartState.getPointOnChart(trendItem.xVal, trendItem.yVal);
			points[itemInd] = targetPoint;
			if (xFromDiff) {
				currents['x' + itemInd] = targetPoint.x;
			}
			targets['x' + itemInd] = targetPoint.x;
			targets['y' + itemInd] = targetPoint.y;
		}
		var animationsOptions = chartState.data.animations;
		targets.ease = animationsOptions.zoomEase;
		var time = animationsOptions.enabled ? animationsOptions.zoomSpeed : 0;
		this.animate(trendName, time, targets, currents);
	}

	/**
	 * animate trend, animation settings will be got from trendsAnimationPoints
	 */
	private animate(trendName: string, time: number, newTargets: Object, current?: Object) {
		var animationState = this.trendsAnimationStates[trendName];
		if (animationState.currentAnimation) animationState.currentAnimation.pause();
		if (current) animationState.current = Utils.deepMerge(animationState.current, current) as {[key: string]: number};
		animationState.targets = Utils.deepMerge(animationState.targets, newTargets) as ITargets;
		var animation = animationState.currentAnimation = TweenLite.to(animationState.current, time, animationState.targets);
		animation.eventCallback('onUpdate', () => {
			this.ee.emit('animate.' + trendName, animationState);
		});
		animation.eventCallback('onComplete', () => {
			animationState.targets = {ease: void 0};
		});
	}
}