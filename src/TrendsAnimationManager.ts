
import {MAX_DATA_LENGTH} from "./Chart";
var EE = require('EventEmitter2') as typeof EventEmitter2;
import {ChartState} from "./State";
import Vector3 = THREE.Vector3;
import {ITrendData, ITrendOptions, ITrendItem} from "./Trend";
import {Utils, TUid} from "./Utils";

interface ITargets {
	ease?: Linear | Ease
	[key: string]: number | Linear | Ease
}

interface ICurrent {
	[key: string]: number
}

export class TrendAnimationState {
	currentAnimation: TweenLite;
	points: {[id: number]: TrendPoint} = {};

	// objects like {x0: 1, y0: 2, x1: 2, y2: 3, ...}
	current: {[key: string]: number} = {};
	targets: ITargets = {};
	private nextEmptyId = 0;
	private startPointId = 0;
	private endPointId = 0;

	constructor (pointsCount: number, initialVector: Vector3) {
		var point: TrendPoint;
		for (let i = 0; i < pointsCount; i++) {
			let id = i;
			point = new TrendPoint(this, id, initialVector.clone());
			this.points[id] = point;
			this.current['x' + id] = initialVector.x;
			this.current['y' + id] = initialVector.y;
		}
	}
	
	getEndPoint() {
		return this.points[this.endPointId];
	}

	getStartPoint() {
		return this.points[this.startPointId];
	}

	appendPoint(item: ITrendItem, vector: Vector3): TrendPoint {
		var id = this.nextEmptyId++;
		var point = this.points[id];
		var prevPoint = this.points[this.endPointId];
		if (prevPoint.item) {
			prevPoint.nextId = id;
			point.prevId = prevPoint.id;
		}
		point.item = item;
		point.vector = vector;
		this.endPointId = id;
		return point;
	}

	prependPoint(item: ITrendItem, vector: Vector3): TrendPoint {
		var id = this.nextEmptyId++;
		var point = this.points[id];
		var nextPoint = this.points[this.startPointId];
		if (nextPoint.item) {
			nextPoint.prevId = id;
			point.nextId = nextPoint.id;
		}
		point.item = item;
		point.vector = vector;
		this.startPointId = id;
		return point;
	}
}

export class TrendPoint {
	id: number;
	prevId: number;
	nextId: number;
	item: ITrendItem;
	vector: Vector3;
	private animationState: TrendAnimationState;
	
	constructor(animationState: TrendAnimationState, id: number, vector: Vector3) {
		this.animationState = animationState;
		this.id = id;
		this.vector = vector;
	}
	
	getNext() {
		var nextPoint = this.animationState.points[this.nextId];
		return nextPoint && nextPoint.item ? nextPoint : null;
	}

	getPrev() {
		var prevPoint = this.animationState.points[this.prevId];
		return prevPoint && prevPoint.item ? prevPoint : null;
	}

	getCurrentVec(): Vector3 {
		var current = this.animationState.current;
		return new Vector3(current['x' + this.id], current['y' + this.id], 0);
	}

	getTargetVec(): Vector3 {
		// TODO:
		Utils.error('not implemented');
		return null
	}
}

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
				var data = this.chartState.getTrend(trendName).getData();
				var isAppend = (!data.length || data[0].xVal < newData[0].xVal);
				isAppend ? this.appendData(trendName, newData) : this.prependData(trendName, newData);
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
		var trendData = this.chartState.getTrend(trendName).getData();
		var firstItem = trendData[0];
		var firstPointVector = this.chartState.getPointOnChart(firstItem.xVal, firstItem.yVal);
		this.trendsAnimationStates[trendName] = new TrendAnimationState(MAX_DATA_LENGTH, firstPointVector);
		this.appendData(trendName, trendData);
	}

	private destroyAnimationPoints(trendName: string) {
		var animationPoints = this.trendsAnimationStates[trendName];
		if (animationPoints.currentAnimation) animationPoints.currentAnimation.kill();
		delete this.trendsAnimationStates[trendName];
	}

	private prependData(trendName: string, newData: ITrendData) {
		var animationPoints = this.trendsAnimationStates[trendName];
		if (!animationPoints) return;
		var chartState = this.chartState;
		var trendData = chartState.getTrend(trendName).getData();
		var animationsOptions = chartState.data.animations;
		
		var startItemInd = newData.length;
		var startItem = trendData[startItemInd] || newData[0];
		var current: ICurrent = {};
		var targets: ITargets = {};
		for (let itemInd = startItemInd - 1; itemInd >= 0; itemInd--) {
			let trendItem = trendData[itemInd];
			let startPoint = chartState.getPointOnChart(startItem.xVal, startItem.yVal);
			let targetPoint = chartState.getPointOnChart(trendItem.xVal, trendItem.yVal);
			let point = animationPoints.prependPoint(trendItem, startPoint);
			let id = point.id;
			current['x' + id] = startPoint.x;
			current['y' + id] = startPoint.y;
			targets['x' + id] = targetPoint.x;
			targets['y' + id] = targetPoint.y;
		}
		targets.ease = animationsOptions.trendChangeEase;
		var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
		this.animate(trendName, time, targets, current);
	}

	private appendData(trendName: string, newData: ITrendData) {
		var animationPoints = this.trendsAnimationStates[trendName];
		if (!animationPoints) return;
		var chartState = this.chartState;
		var trendData = chartState.getTrend(trendName).getData();
		var animationsOptions = chartState.data.animations;
		
		var startItemInd = trendData.length - newData.length;
		var startItem = trendData[startItemInd - 1] || newData[0];
		var current: ICurrent = {};
		var targets: ITargets = {};
		for (let itemInd = startItemInd; itemInd < trendData.length; itemInd++) {
			let trendItem = trendData[itemInd];
			let startPoint = chartState.getPointOnChart(startItem.xVal, startItem.yVal);
			let targetPoint = chartState.getPointOnChart(trendItem.xVal, trendItem.yVal);
			let point = animationPoints.appendPoint(trendItem, startPoint);
			let id = point.id;
			current['x' + id] = startPoint.x;
			current['y' + id] = startPoint.y;
			targets['x' + id] = targetPoint.x;
			targets['y' + id] = targetPoint.y;
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
		var targets: ITargets = {};
		var currents: ICurrent = {};

		var currentXFrom = chartState.data.xAxis.range.from;
		var prevXFrom = chartState.data.prevState.xAxis.range.from;
		var xFromDiff = currentXFrom - prevXFrom;

		var point = this.trendsAnimationStates[trendName].getStartPoint();
		do {
			let trendItem = point.item;
			let targetPoint = chartState.getPointOnChart(trendItem.xVal, trendItem.yVal);
			point.vector = targetPoint;
			if (xFromDiff) {
				currents['x' + point.id] = targetPoint.x;
			}
			targets['x' + point.id] = targetPoint.x;
			targets['y' + point.id] = targetPoint.y;
		} while (point = point.getNext());

		var animationsOptions = chartState.data.animations;
		targets.ease = animationsOptions.zoomEase;
		var time = animationsOptions.enabled ? animationsOptions.zoomSpeed : 0;
		this.animate(trendName, time, targets, currents);
	}


	private animate(trendName: string, time: number, newTargets: Object, current?: Object) {
		var animationState = this.trendsAnimationStates[trendName];
		if (animationState.currentAnimation) animationState.currentAnimation.pause();
		if (current) animationState.current = Utils.deepMerge(animationState.current, current) as {[key: string]: number};
		animationState.targets = Utils.deepMerge(animationState.targets, newTargets) as ITargets;

		// for (var key in animationState.current) {
		// 	var nan = isNaN(animationState.current[key]) && (typeof (animationState.current[key]) == 'number');
		// 	var b = 1;
		// 	//if (nan) Utils.error('nan');
		// }

		var animation = animationState.currentAnimation = TweenLite.to(animationState.current, time, animationState.targets);
		animation.eventCallback('onUpdate', () => {
			this.ee.emit('animate.' + trendName, animationState);
		});
		animation.eventCallback('onComplete', () => {
			animationState.targets = {ease: void 0};
		});
	}
}