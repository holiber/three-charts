import { IIteralable } from "./interfaces";
import { EventEmitter } from './deps';
import { ChartState } from "./State";
import Vector3 = THREE.Vector3;
import { ITrendData, ITrendOptions, ITrendItem, Trend } from "./Trend";
import { Utils } from "./Utils";

export interface ITargets {
	ease?: Linear | Ease
	[key: string]: number | Linear | Ease
}

interface ICurrent {
	[key: string]: number
}

const MAX_ANIMATED_SEGMENTS = 200;

/**
 *  Class helps to display and animate trends segments
 */
export class TrendSegments {
	currentAnimation: TweenLite;
	segmentsById: {[id: string]: TrendSegment} = {};
	segments: TrendSegment[] = [];
	chartState: ChartState;
	animatedSegmentsIds: number[] = [];
	maxSegmentLength: number;
	segmentsLength = 0;
	firstDisplayedSegment: TrendSegment;
	lastDisplayedSegment: TrendSegment;
	private nextEmptyId = 0;
	private startPointId = 0;
	private endPointId = 0;
	private trend: Trend;
	private ee: EventEmitter2;

	constructor (chartState: ChartState, trend: Trend) {
		this.chartState = chartState;
		this.ee = new EventEmitter();
		this.trend = trend;
		this.maxSegmentLength = trend.getOptions().maxSegmentLength;
		this.rebuildSegments();
		this.bindEvents();
	}

	protected bindEvents() {
		this.trend.onChange((changedOptions, newData) => this.onTrendChangeHandler(changedOptions, newData));
		this.chartState.onZoom(() => this.onZoomHandler());
		this.chartState.onScroll(() => this.recalculateDisplayedRange());
	}

	private onZoomHandler() {
		// let {maxSegmentLength, minSegmentLengthInPx} = this.trend.getOptions();
		// let currentSegmentLengthInPx = this.chartState.valueToPxByXAxis(this.maxSegmentLength);
		// let needToRebuildSegments = (
		// 	currentSegmentLengthInPx < minSegmentLengthInPx ||
		// 	this.maxSegmentLength > maxSegmentLength
		// );
		let segmentsRebuilded = this.rebuildSegments();
		if (!segmentsRebuilded) {
			this.recalculateDisplayedRange()
		}
	}

	private onTrendChangeHandler(changedOptions: ITrendOptions, newData: ITrendData) {
		var needRebuildSegments = changedOptions.maxSegmentLength != void 0;


		if (needRebuildSegments) {
			this.rebuildSegments();
			return;
		}

		if (!newData) return;

		var data = this.trend.getData();
		var isAppend = (!data.length || data[0].xVal < newData[0].xVal);
		isAppend ? this.appendData(newData) : this.prependData(newData);
		this.recalculateDisplayedRange();
	}

	getEndSegment(): TrendSegment {
		return this.segmentsById[this.endPointId];
	}

	getStartPoint(): TrendSegment {
		return this.segmentsById[this.startPointId];
	}
	
	private rebuildSegments(): boolean {
		let {
			maxSegmentLength,
			minSegmentLengthInPx,
			maxSegmentLengthInPx
		} = this.trend.getOptions();

		let needToRebuild = this.segments.length === 0;
		let segmentLength = this.maxSegmentLength;

		let currentSegmentLengthInPx = this.chartState.valueToPxByXAxis(segmentLength);

		if (currentSegmentLengthInPx < minSegmentLengthInPx) {
			needToRebuild = true;
			segmentLength = Math.ceil(this.chartState.pxToValueByXAxis(maxSegmentLengthInPx));//Math.ceil(maxSegmentLength * (minSegmentLengthInPx / currentSegmentLengthInPx));
		} else if (this.chartState.valueToPxByXAxis(this.maxSegmentLength) >= maxSegmentLengthInPx) {
			needToRebuild = true;
			segmentLength = this.chartState.pxToValueByXAxis(minSegmentLengthInPx);
		}

		if (!needToRebuild) return false;

		this.maxSegmentLength = segmentLength;
		this.segmentsById = {};
		this.segments = [];
		this.nextEmptyId = 0;
		this.startPointId = 0;
		this.endPointId = 0;
		this.segmentsLength = 0;
		this.appendData(null, true);
		this.recalculateDisplayedRange(true);
		this.ee.emit('rebuild');
	}
	
	private recalculateDisplayedRange(segmentsAreRebuilded = false) {
		var {from, to} = this.chartState.data.xAxis.range;
		var {firstDisplayedSegment, lastDisplayedSegment} = this;
		var displayedRange = to - from;

		this.firstDisplayedSegment = Utils.binarySearchClosest(this.segments, from - displayedRange, 'startXVal');
		this.lastDisplayedSegment = Utils.binarySearchClosest(this.segments, to + displayedRange, 'endXVal');
		if (segmentsAreRebuilded) return;

		var displayedRangeChanged = (
			firstDisplayedSegment.id !== this.firstDisplayedSegment.id ||
			lastDisplayedSegment.id !== this.lastDisplayedSegment.id
		);
		if (displayedRangeChanged) this.ee.emit('displayedRangeChanged');
	}

	// getSegments(fromX?: number, toX?: number): TrendSegment[] {
	// 	var segments = this.segments;
	// 	if (fromX == void 0 && toX == void 0) return segments;
	// 	fromX = fromX !== void 0 ? fromX : segments[0].startXVal;
	// 	toX = toX !== void 0 ? toX : segments[this.segmentsLength].endXVal;
	// 	var startSegmentInd = Utils.closestBinarySearch(segments, fromX, 'xVal');
	// 	var endSegmentInd = Utils.closestBinarySearch(segments, toX, 'xVal');
	// 	return segments.slice(startSegmentInd, endSegmentInd);
	// }

	/**
	 * returns array of segmentsById for values array
	 * values must be sorted!
	 */
	getPointsForXValues(values: number[]): TrendSegment[] {return[]
		// var valueInd = 0;
		// var value = values[valueInd];
		// var lastValueInd = values.length - 1;
		// var results: TrendSegment[] = [];
		// var point = this.getStartPoint();
		// if (!point.hasValue) return [];
		//
		// while (point) {
		//
		// 	while (value < point.startXVal) {
		// 		results.push(void 0);
		// 		value = values[++valueInd];
		// 	}
		//
		// 	while (value > point.endXVal) {
		// 		point = point.getNext();
		// 		if (!point) break;
		// 	}
		//
		// 	var valueInPoint = (
		// 		point.startXVal == value || point.endXVal == value ||
		// 		(point.startXVal < value && point.endXVal < value)
		// 	);
		// 	if (valueInPoint) {
		// 		results.push(point);
		// 		value = values[++valueInd];
		// 	}
		// 	if (valueInd > lastValueInd) break;
		// }
		// return results;
	}

	onAnimationFrame(cb: (animationState: TrendSegments) => void): Function {
		var eventName = 'animationFrame';
		this.ee.on('animationFrame', cb);
		return () => {
			this.ee.removeListener(eventName, cb);
		}
	}

	onRebuild(cb: Function) {
		var eventName = 'rebuild';
		this.ee.on(eventName, cb);
		return () => {
			this.ee.removeListener(eventName, cb);
		}
	}

	onDisplayedRangeChanged(cb: Function) {
		var eventName = 'displayedRangeChanged';
		this.ee.on(eventName, cb);
		return () => {
			this.ee.removeListener(eventName, cb);
		}
	}

	prependPoint(items: ITrendItem[]): TrendSegment {
		var id = this.nextEmptyId++;
		var point = this.segmentsById[id];
		var nextPoint = this.segmentsById[this.startPointId];
		if (nextPoint.hasValue) {
			nextPoint.prevId = id;
			point.nextId = nextPoint.id;
		}
		point.hasValue = true;
		//point.appendItems(items);
		this.startPointId = id;
		return point;
	}

	allocateNextSegment() {
		var id = this.nextEmptyId++;
		var segment = new TrendSegment(this, id);
		var prevSegment = this.segmentsById[this.endPointId];
		if (prevSegment && prevSegment.hasValue) {
			prevSegment.nextId = id;
			segment.prevId = prevSegment.id;
		}
		this.endPointId = id;
		this.segmentsLength++;
		this.segmentsById[id] = segment;
		this.segments.push(segment);
		return segment;
	}

	private appendData(newData: ITrendData, needRebuildSegments = false) {
		var trendData = this.trend.getData();
		if (needRebuildSegments) {
			newData = trendData;
			this.animatedSegmentsIds = [];
		}

		var startItemInd = trendData.length - newData.length;
		var endSegment = this.getEndSegment() || this.allocateNextSegment();
		var initialAnimationState = endSegment.hasValue ? endSegment.createAnimationState() : null;
		var segment = endSegment || this.segmentsById[0];
		var itemInd = 0;
		var animatedSegments: TrendSegment[] = [];
		while (itemInd < newData.length) {
			let item = newData[itemInd];
			let itemIsInserted = segment.appendItem(item);
			let isLastItem = itemInd == newData.length - 1;

			if (itemIsInserted) {
				if (!isLastItem) itemInd++;
			} else {
				if (!segment.isCompleted) segment.complete();
			}

			if (isLastItem && itemIsInserted) {
				segment.recalculateItems();
			}

			let segmentIsReadyForAnimate = segment.isCompleted || (isLastItem && itemIsInserted);
			if (segmentIsReadyForAnimate) {
				animatedSegments.push(segment);
				let id = segment.id;
				if (!initialAnimationState) initialAnimationState = animatedSegments[0].createAnimationState();

				let ias = initialAnimationState;

				segment.initialAnimationState = ias;

				if (animatedSegments.length > 1) segment.initialAnimationState = Utils.deepMerge(ias, {
					startXVal: ias.endXVal,
					startYVal: ias.endYVal
				});
				segment.targetAnimationState = segment.createAnimationState();
				this.animatedSegmentsIds.push(id);

			}


			if (isLastItem && itemIsInserted) break;
			if (!segment.isCompleted) continue;

			segment = this.allocateNextSegment();
			let prevItem = trendData[startItemInd + itemInd - 1];
			segment.appendItem(prevItem);

		}

		var animationsOptions = this.chartState.data.animations;
		var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
		if (needRebuildSegments || this.animatedSegmentsIds.length > MAX_ANIMATED_SEGMENTS) time = 0;
		this.animate(time);
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
			let point = this.prependPoint([trendItem]);
			let id = point.id;
			current['x' + id] = startItem.xVal;
			current['y' + id] = startItem.yVal;
			targets['x' + id] = trendItem.xVal;
			targets['y' + id] = trendItem.yVal;
		}
		targets.ease = animationsOptions.trendChangeEase;
		var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
		// this.animate(time, targets, current);
	}

	private animate(time: number) {

		if (this.currentAnimation) this.currentAnimation.kill();
		if (time == 0) {
			this.onAnimationFrameHandler(1);
			this.animatedSegmentsIds = [];
			this.currentAnimation = null;
			return;
		}
		var animationsOptions = this.chartState.data.animations;
		var ease = animationsOptions.trendChangeEase;
		var objectToAnimate = {animationValue: 0};
		this.currentAnimation = TweenLite.to(objectToAnimate, time, {animationValue: 1, ease});
		this.currentAnimation.eventCallback('onUpdate', () => this.onAnimationFrameHandler(objectToAnimate.animationValue));
		this.currentAnimation.eventCallback('onComplete', () => {
			this.animatedSegmentsIds = [];
			this.currentAnimation = null;
		});
	}

	private onAnimationFrameHandler(coefficient: number) {
		for (let segmentId of this.animatedSegmentsIds) {
			let segment = this.segmentsById[segmentId];
			for (let key in segment.targetAnimationState) {
				let targetValue = segment.targetAnimationState[key] as number;
				let initialValue = segment.initialAnimationState[key] as number;
				let currentValue = initialValue + (targetValue - initialValue) * coefficient;
				segment.currentAnimationState[key] = currentValue;
			}
		}
		this.ee.emit('animationFrame', this);
	}

}

export interface ITrendSegmentState extends IIteralable {
	xVal?: number;
	yVal?: number;
	startXVal?: number;
	startYVal?: number;
	endXVal?: number;
	endYVal?: number;
	maxYVal?: number;
	minYVal?: number;
	maxLength?: number;
}

export class TrendSegment implements ITrendSegmentState {
	id: number;
	prevId: number;
	nextId: number;
	hasValue: boolean;
	xVal: number;
	yVal: number;
	startXVal: number;
	startYVal: number;
	endXVal: number;
	endYVal: number;
	maxYVal: number;
	minYVal: number;
	isCompleted = false;
	maxLength: number;
	items: ITrendItem[] = [];

	initialAnimationState: ITrendSegmentState = {};
	targetAnimationState: ITrendSegmentState = {};
	currentAnimationState: ITrendSegmentState = {};

	private trendSegments: TrendSegments;
	
	constructor(trendPoints: TrendSegments, id: number) {
		this.trendSegments = trendPoints;
		this.id = id;
		this.maxLength = trendPoints.maxSegmentLength;
	}

	createAnimationState(): ITrendSegmentState {
		var {
			xVal,
			yVal,
			startXVal,
			startYVal,
			endXVal,
			endYVal,
			maxYVal,
			minYVal,
			maxLength
		} = this;
		return {
			xVal,
			yVal,
			startXVal,
			startYVal,
			endXVal,
			endYVal,
			maxYVal,
			minYVal,
			maxLength
		}
	};
	
	appendItem(item: ITrendItem): boolean {
		var items = this.items;
		if (items.length < 2) {
			this.items.push(item);
			this.hasValue = true;
			return true;
		}
		var startXVal = items[0].xVal;
		if (item.xVal - startXVal > this.maxLength) return false;
		items.push(item);
		return true;
	}

	complete() {
		this.isCompleted = true;
		this.recalculateItems();
		this.items = []; // free memory for completed ranges
	}

	recalculateItems() {
		let items = this.items;
		let itemsLength = items.length;
		if (itemsLength === 0) Utils.error('Unable to create TrendSegment without TrendItems');
		let endItem = items[itemsLength - 1];
		let {xVal: endXVal, yVal: endYVal} = endItem;
		let startXVal: number, startYVal: number;


		let startItem = items[0];
		startXVal = startItem.xVal;
		startYVal = startItem.yVal;

		let minX = Math.min(startXVal, endXVal);
		let maxX = Math.max(startXVal, endXVal);
		let middleXVal = minX + (maxX - minX) / 2;

		let minY = Math.min(startYVal, endYVal);
		let maxY = Math.max(startYVal, endYVal);
		let middleYVal = minY + (maxY - minY) / 2;

		let yVals = items.map(item => item.yVal);

		this.startXVal = startXVal;
		this.startYVal = startYVal;
		this.endXVal = endXVal;
		this.endYVal = endYVal;
		this.xVal = middleXVal;
		this.yVal = middleYVal;
		this.maxYVal = Math.max(...yVals);
		this.minYVal = Math.min(...yVals);
		if (!this.currentAnimationState) this.currentAnimationState = this.createAnimationState();
	}

	getNext() {
		var nextPoint = this.trendSegments.segmentsById[this.nextId];
		return nextPoint && nextPoint.hasValue ? nextPoint : null;
	}

	getPrev() {
		var prevPoint = this.trendSegments.segmentsById[this.prevId];
		return prevPoint && prevPoint.hasValue ? prevPoint : null;
	}
	
	getFrameVal(): Vector3 {
		let {xVal, yVal} = this.createAnimationState();
		return new Vector3(xVal, yVal, 0);
	}

	getFramePoint(): Vector3 {
		var frameVal = this.getFrameVal();
		return this.trendSegments.chartState.screen.getPointOnChart(frameVal.x, frameVal.y);
	}

}
