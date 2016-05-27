
var EventEmmiter = require('EventEmitter2') as typeof EventEmitter2;
import {ChartState} from "./State";
import Vector3 = THREE.Vector3;
import {ITrendData, ITrendOptions, ITrendItem, Trend} from "./Trend";
import {Utils, TUid} from "./Utils";

interface ITargets {
	ease?: Linear | Ease
	[key: string]: number | Linear | Ease
}

interface ICurrent {
	[key: string]: number
}

export class TrendPoints {
	currentAnimation: TweenLite;
	points: {[id: string]: TrendPoint} = {};
	//pointsByXVal: {[xVal: string]: TrendPoint} = {};

	// objects like {x0: 1, y0: 2, x1: 2, y2: 3, ...}
	current: {[key: string]: number} = {};
	targets: ITargets = {};
	chartState: ChartState;
	private nextEmptyId = 0;
	private startPointId = 0;
	private endPointId = 0;
	private trend: Trend;
	private ee: EventEmitter2;

	constructor (chartState: ChartState, trend: Trend, pointsCount: number, initialItem: ITrendItem) {
		this.chartState = chartState;
		this.trend = trend;
		this.ee = new EventEmmiter();
		var point: TrendPoint;
		for (let i = 0; i < pointsCount; i++) {
			let id = i;
			point = new TrendPoint(this, id, initialItem.xVal, initialItem.yVal);
			this.points[id] = point;
			this.current['x' + id] = initialItem.xVal;
			this.current['y' + id] = initialItem.yVal;
		}
		this.appendData(this.trend.getData());
		this.bindEvents();
	}

	protected bindEvents() {
		var state = this.chartState;
		this.trend.onChange((changedOptions: ITrendOptions, newData: ITrendData) => {
			if (newData) {
				var data = this.trend.getData();
				var isAppend = (!data.length || data[0].xVal < newData[0].xVal);
				isAppend ? this.appendData(newData) : this.prependData(newData);
			}
		});
		state.onZoom(() => this.updatePoints());
	}


	getEndPoint(): TrendPoint {
		return this.points[this.endPointId];
	}

	getStartPoint(): TrendPoint {
		return this.points[this.startPointId];
	}

	/**
	 * returns array of points for values array
	 * values must be sorted!
	 */
	getPointsForXValues(values: number[]): TrendPoint[] {
		var valueInd = 0;
		var value = values[valueInd];
		var lastValueInd = values.length - 1;
		var results: TrendPoint[] = [];
		var point = this.getStartPoint();
		if (!point.hasValue) return [];

		while (point) {

			while (value < point.startXVal) {
				results.push(void 0);
				value = values[++valueInd];
			}

			while (value > point.endXVal) {
				point = point.getNext();
				if (!point) break;
			}
			
			var valueInPoint = (
				point.startXVal == value || point.endXVal == value ||
				(point.startXVal < value && point.endXVal < value)
			);
			if (valueInPoint) {
				results.push(point);
				value = values[++valueInd];
			}
			if (valueInd > lastValueInd) break;
		}
		return results;
	}

	onAnimationFrame(cb: (animationState: TrendPoints) => void): Function {
		var eventName = 'animationFrame';
		this.ee.on('animationFrame', cb);
		return () => {
			this.ee.removeListener(eventName, cb);
		}
	}

	appendPoint(item: ITrendItem): TrendPoint {
		var id = this.nextEmptyId++;
		var point = this.points[id];
		var prevPoint = this.points[this.endPointId];
		if (prevPoint.hasValue) {
			prevPoint.nextId = id;
			point.prevId = prevPoint.id;
		}
		point.hasValue = true;
		point.startXVal = item.xVal;
		point.endXVal = item.xVal;
		point.xVal = item.xVal;
		point.yVal = item.yVal;
		this.endPointId = id;
		return point;
	}

	prependPoint(item: ITrendItem): TrendPoint {
		var id = this.nextEmptyId++;
		var point = this.points[id];
		var nextPoint = this.points[this.startPointId];
		if (nextPoint.hasValue) {
			nextPoint.prevId = id;
			point.nextId = nextPoint.id;
		}
		point.hasValue = true;
		point.startXVal = item.xVal;
		point.endXVal = item.xVal;
		point.xVal = item.xVal;
		point.yVal = item.yVal;
		this.startPointId = id;
		return point;
	}

	private prependData(newData: ITrendData) {
		var chartState = this.chartState;
		var trendData = this.trend.getData();
		var animationsOptions = chartState.data.animations;

		var startItemInd = newData.length;
		var startItem = trendData[startItemInd] || newData[0];
		var current: ICurrent = {};
		var targets: ITargets = {};
		for (let itemInd = startItemInd - 1; itemInd >= 0; itemInd--) {
			let trendItem = trendData[itemInd];
			let point = this.prependPoint(trendItem);
			let id = point.id;
			current['x' + id] = startItem.xVal;
			current['y' + id] = startItem.yVal;
			targets['x' + id] = trendItem.xVal;
			targets['y' + id] = trendItem.yVal;
		}
		targets.ease = animationsOptions.trendChangeEase;
		var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
		this.animate(time, targets, current);
	}

	private appendData(newData: ITrendData) {
		var chartState = this.chartState;
		var trendData = this.trend.getData();
		var animationsOptions = chartState.data.animations;

		var startItemInd = trendData.length - newData.length;
		var startItem = trendData[startItemInd - 1] || newData[0];
		var current: ICurrent = {};
		var targets: ITargets = {};
		for (let itemInd = startItemInd; itemInd < trendData.length; itemInd++) {
			let trendItem = trendData[itemInd];
			let point = this.appendPoint(trendItem);
			let id = point.id;
			current['x' + id] = startItem.xVal;
			current['y' + id] = startItem.yVal;
			targets['x' + id] = trendItem.xVal;
			targets['y' + id] = trendItem.yVal;
		}
		targets.ease = animationsOptions.trendChangeEase;
		var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
		this.animate(time, targets, current);
	}

	private updatePoints() {
		// var chartState = this.chartState;
		// var targets: ITargets = {};
		// var currents: ICurrent = {};
		//
		// var currentXFrom = chartState.data.xAxis.range.from;
		// var prevXFrom = chartState.data.prevState.xAxis.range.from;
		// var xFromDiff = currentXFrom - prevXFrom;
		//
		// var point = this.getStartPoint();
		// do {
		// 	let targetPoint = chartState.getPointOnChart(point.xVal, point.yVal);
		// 	point.vector = targetPoint;
		// 	var zoomDistanceInPx = chartState.valueToPxByXAxis(xFromDiff);
		// 	if (xFromDiff) {
		// 		currents['x' + point.id] = targetPoint.x;
		// 	}
		// 	targets['x' + point.id] = targetPoint.x;
		// 	targets['y' + point.id] = targetPoint.y;
		// } while (point = point.getNext());
		//
		// var animationsOptions = chartState.data.animations;
		// targets.ease = animationsOptions.zoomEase;
		// var time = animationsOptions.enabled ? animationsOptions.zoomSpeed : 0;
		// this.animate(time, targets, currents);
	}

	private animate(time: number, newTargets: Object, current?: Object) {
		if (this.currentAnimation) this.currentAnimation.kill();
		if (current) this.current = Utils.deepMerge(this.current, current) as {[key: string]: number};
		//this.targets = Utils.deepMerge(this.targets, newTargets) as ITargets;

		var cb = () => {
			this.ee.emit('animationFrame', this);
		};

		this.current = current as {[key: string]: number};
		var animation = this.currentAnimation = TweenLite.to(this.current, time, newTargets);
		animation.eventCallback('onUpdate', cb);
		animation.eventCallback('onComplete', () => {
			this.current = {};
			this.targets = {ease: void 0};
		});
	}

}

export class TrendPoint {
	id: number;
	prevId: number;
	nextId: number;
	hasValue: boolean;
	xVal: number;
	yVal: number;
	startXVal: number;
	endXVal: number;
	vector: Vector3;
	private trendPoints: TrendPoints;
	
	constructor(trendPoints: TrendPoints, id: number, xVal: number, yVal: number) {
		this.trendPoints = trendPoints;
		this.id = id;
		this.xVal = xVal;
		this.yVal = yVal;
	}
	
	getNext() {
		var nextPoint = this.trendPoints.points[this.nextId];
		return nextPoint && nextPoint.hasValue ? nextPoint : null;
	}

	getPrev() {
		var prevPoint = this.trendPoints.points[this.prevId];
		return prevPoint && prevPoint.hasValue ? prevPoint : null;
	}
	
	getFrameVal(): Vector3 {
		var current = this.trendPoints.current;
		var frameValX = current['x' + this.id];
		var frameValY = current['y' + this.id];
		var xVal = frameValX !== void 0 ? frameValX : this.xVal;
		var yVal = frameValY !== void 0 ? frameValY : this.yVal;
		return new Vector3(xVal, yVal, 0);
	}

	getFramePoint(): Vector3 {
		var frameVal = this.getFrameVal();
		return this.trendPoints.chartState.getPointOnChart(frameVal.x, frameVal.y);
	}

	getCurrentVec(): Vector3 {
		var current = this.trendPoints.current;
		return new Vector3(current['x' + this.id], current['y' + this.id], 0);
	}

	getTargetVec(): Vector3 {
		// TODO:
		Utils.error('not implemented');
		return null
	}
}
