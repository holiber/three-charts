import { IIteralable } from "./interfaces";
import { EventEmitter } from './EventEmmiter';
import { Chart } from "./Chart";
import Vector3 = THREE.Vector3;
import { ITrendData, ITrendOptions, ITrendItem, Trend, TREND_TYPE, ITrendTypeSettings } from "./Trend";
import { Utils } from "./Utils";

const MAX_ANIMATED_SEGMENTS = 100;
const EVENTS = {
	REBUILD: 'rebuild',
	DISLPAYED_RANGE_CHANGED: 'displayedRangeChanged',
	ANIMATION_FRAME: 'animationFrame'
};

/**
 *  Class helps to display and animate trends segments
 */
export class TrendSegmentsManager {
	segmentsById: {[id: string]: TrendSegment} = {};
	segments: TrendSegment[] = [];
	chart: Chart;
	animatedSegmentsIds: number[] = [];
	maxSegmentLength: number;
	segmentsLength = 0;
	firstDisplayedSegmentInd: number;
	firstDisplayedSegment: TrendSegment;
	lastDisplayedSegmentInd: number;
	lastDisplayedSegment: TrendSegment;
	private appendAnimation: TweenLite;
	private prependAnimation: TweenLite;
	private animatedSegmentsForAppend: number[] = [];
	private animatedSegmentsForPrepend: number[] = [];
	private nextEmptyId = 0;
	private startSegmentId = 0;
	private endSegmentId = 0;
	private trend: Trend;
	private ee: EventEmitter;

	// TODO: make subscriptions array
	private unbindList: Function[] = [];

	constructor (chart: Chart, trend: Trend) {
		this.chart = chart;
		this.ee = new EventEmitter();
		this.trend = trend;
		this.bindEvents();
	}

	protected bindEvents() {
		this.trend.onChange((changedOptions, newData) => this.onTrendChangeHandler(changedOptions, newData));
		this.unbindList = [
			this.chart.onInitialStateApplied(() => this.onInitialStateAppliedHandler()),
			this.chart.onZoom(() => this.onZoomHandler()),
			this.chart.onScroll(() => this.recalculateDisplayedRange()),
			this.chart.onDestroy(() => this.onDestroyHandler())
		]
	}

	private unbindEvents() {
		this.unbindList.forEach(unbind => unbind())
	}

	private onInitialStateAppliedHandler() {
		this.maxSegmentLength = this.trend.getOptions().maxSegmentLength;
		this.tryToRebuildSegments();
	}

	private onDestroyHandler() {
		this.ee.removeAllListeners();
		this.unbindEvents();
		this.appendAnimation && this.appendAnimation.kill();
		this.prependAnimation && this.prependAnimation.kill();
	}

	private onZoomHandler() {
		let segmentsRebuilded = this.tryToRebuildSegments();
		if (!segmentsRebuilded) {
			this.recalculateDisplayedRange()
		}
	}

	private onTrendChangeHandler(changedOptions: ITrendOptions, newData: ITrendData) {
		var needToRebuildSegments = (
			changedOptions.type != void 0 ||
			changedOptions.maxSegmentLength != void 0
		);


		if (needToRebuildSegments) {
			this.tryToRebuildSegments(true);
			return;
		}

		if (!newData) return;

		var data = this.trend.getData();
		var isAppend = (!data.length || data[0].xVal < newData[0].xVal);
		isAppend ? this.appendData(newData) : this.prependData(newData);
		this.recalculateDisplayedRange();
	}

	getSegment(id: number) {
		return this.segmentsById[id];
	}

	getEndSegment(): TrendSegment {
		return this.segmentsById[this.endSegmentId];
	}

	getStartSegment(): TrendSegment {
		return this.segmentsById[this.startSegmentId];
	}
	
	private tryToRebuildSegments(force = false): boolean {
		let options = this.trend.getOptions();
		let trendTypeName = TREND_TYPE[options.type] as string;
		let trendTypesSettings =  options.settingsForTypes as IIteralable;
		let trendTypeSettings = trendTypesSettings[trendTypeName] as ITrendTypeSettings;
		let {
			minSegmentLengthInPx,
			maxSegmentLengthInPx
		} = trendTypeSettings;

		let needToRebuild = this.segments.length === 0 || force;
		let segmentLength = this.maxSegmentLength;

		// call toFixed(2) to prevent floating segment error compare
		let currentSegmentLengthInPx = Number(this.chart.viewport.valToPxByXAxis(segmentLength).toFixed(2));
		let currentMaxSegmentLengthInPx = Number(this.chart.viewport.valToPxByXAxis(this.maxSegmentLength).toFixed(2));

		if (currentSegmentLengthInPx < minSegmentLengthInPx) {
			needToRebuild = true;
			segmentLength = Math.ceil(this.chart.viewport.pxToValByXAxis(maxSegmentLengthInPx));
		} else if (currentMaxSegmentLengthInPx > maxSegmentLengthInPx) {
			needToRebuild = true;
			segmentLength = this.chart.viewport.pxToValByXAxis(minSegmentLengthInPx);
		}

		if (!needToRebuild) return false;

		this.maxSegmentLength = segmentLength;
		this.segmentsById = {};
		this.segments = [];
		this.nextEmptyId = 0;
		this.startSegmentId = 0;
		this.endSegmentId = 0;
		this.segmentsLength = 0;
		this.stopAllAnimations();
		this.appendData(null, true);
		this.recalculateDisplayedRange(true);
		this.ee.emit(EVENTS.REBUILD);
	}

	private stopAllAnimations() {
		this.animatedSegmentsIds = [];
		this.animatedSegmentsForAppend = [];
		this.animatedSegmentsForAppend = [];
		if (this.prependAnimation) this.prependAnimation.kill();
		if (this.appendAnimation) this.appendAnimation.kill();
	}
	
	private recalculateDisplayedRange(segmentsAreRebuilded = false) {
		var {from, to} = this.chart.state.xAxis.range;
		var {firstDisplayedSegment, lastDisplayedSegment} = this;
		var displayedRange = to - from;

		this.firstDisplayedSegmentInd = Utils.binarySearchClosestInd(this.segments, from - displayedRange, 'startXVal');
		this.firstDisplayedSegment = this.segments[this.firstDisplayedSegmentInd];
		this.lastDisplayedSegmentInd = Utils.binarySearchClosestInd(this.segments, to + displayedRange, 'endXVal');
		this.lastDisplayedSegment = this.segments[this.lastDisplayedSegmentInd];
		if (segmentsAreRebuilded) return;

		var displayedRangeChanged = (
			firstDisplayedSegment.id !== this.firstDisplayedSegment.id ||
			lastDisplayedSegment.id !== this.lastDisplayedSegment.id
		);
		if (displayedRangeChanged) this.ee.emit(EVENTS.DISLPAYED_RANGE_CHANGED);
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
	 * returns array of segments for values array
	 * values must be sorted!
	 */
	getSegmentsForXValues(values: number[]): TrendSegment[] {
		var valueInd = 0;
		var value = values[valueInd];
		var lastValueInd = values.length - 1;
		var results: TrendSegment[] = [];
		var segment = this.getStartSegment();
		if (!segment.hasValue) return [];
		while (segment) {
		
			while (value < segment.startXVal) {
				results.push(void 0);
				value = values[++valueInd];
			}
		
			while (value > segment.endXVal) {
				segment = segment.getNext();
				if (!segment) break;
			}
		
			var valueInPoint = (
				segment.startXVal == value || segment.endXVal == value ||
				(segment.startXVal < value && segment.endXVal > value)
			);
			if (valueInPoint) {
				results.push(segment);
				value = values[++valueInd];
			}
			if (valueInd > lastValueInd) break;
		}
		return results;
	}

	onAnimationFrame(cb: (animationState: TrendSegmentsManager) => void): Function {
		return this.ee.subscribe(EVENTS.ANIMATION_FRAME, cb);
	}

	onRebuild(cb: Function) {
		return this.ee.subscribe(EVENTS.REBUILD, cb);
	}

	onDisplayedRangeChanged(cb: Function) {
		return this.ee.subscribe(EVENTS.DISLPAYED_RANGE_CHANGED, cb);
	}
	
	allocateNextSegment() {
		var id = this.nextEmptyId++;
		var segment = new TrendSegment(this, id);
		var prevSegment = this.segmentsById[this.endSegmentId];
		if (prevSegment && prevSegment.hasValue) {
			prevSegment.nextId = id;
			segment.prevId = prevSegment.id;
		}
		this.endSegmentId = id;
		this.segmentsLength++;
		this.segmentsById[id] = segment;
		this.segments.push(segment);
		return segment;
	}

	allocatePrevSegment() {
		var id = this.nextEmptyId++;
		var segment = new TrendSegment(this, id);
		var nextSegment = this.segmentsById[this.startSegmentId];
		if (nextSegment && nextSegment.hasValue) {
			nextSegment.prevId = id;
			segment.nextId = nextSegment.id;
		}
		this.startSegmentId = id;
		this.segmentsLength++;
		this.segmentsById[id] = segment;
		this.segments.unshift(segment);
		return segment;
	}

	private appendData(newData: ITrendData, needRebuildSegments = false) {

		// WARNING: bottleneck method!

		// var t1 = performance.now();
		var trendData = this.trend.getData();
		if (needRebuildSegments) {
			newData = trendData;
			this.animatedSegmentsForAppend = [];
		}

		var startItemInd = trendData.length - newData.length;
		var segment = this.getEndSegment() || this.allocateNextSegment();
		var initialSegment = segment.hasValue ? segment : null;
		var initialAnimationState = segment.createAnimationState();
		var itemInd = 0;
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
				let id = segment.id;
				if (!initialSegment) initialSegment = segment;
				if (!initialAnimationState) {
					initialAnimationState = initialSegment.createAnimationState();
				}

				segment.initialAnimationState = Utils.deepMerge({}, initialAnimationState);

				if (this.animatedSegmentsForAppend.length > 0) {
					segment.initialAnimationState.startXVal = initialAnimationState.endXVal;
					segment.initialAnimationState.startYVal = initialAnimationState.endYVal;
				}

				segment.currentAnimationState =  Utils.deepMerge({}, initialAnimationState);
				segment.targetAnimationState = segment.createAnimationState();
				this.animatedSegmentsForAppend.push(id);

			}


			if (isLastItem && itemIsInserted) break;
			if (!segment.isCompleted) continue;

			segment = this.allocateNextSegment();
			let prevItem = trendData[startItemInd + itemInd - 1];
			segment.appendItem(prevItem);

		}

		var animationsOptions = this.chart.state.animations;
		var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;

		// var t2 = performance.now();
		// console.log(t2 - t1);

		// do not create animation if segments was rebuilded
		if (needRebuildSegments) {
			for (let segmentId of this.animatedSegmentsForAppend) {
				let segment = this.segmentsById[segmentId];
				segment.currentAnimationState = segment.createAnimationState();
			}
			this.animatedSegmentsForAppend = [];
			return;
		}
		if (this.animatedSegmentsForAppend.length > MAX_ANIMATED_SEGMENTS) time = 0;
		this.animate(time);
	}


	// TODO: refactor duplicated code from appendData
	private prependData(newData: ITrendData) {
		var trendData = this.trend.getData();
		var segment = this.getStartSegment() || this.segmentsById[0];
		var initialSegment = segment.hasValue ? segment : null;
		var itemInd = newData.length - 1;
		var initialAnimationState = segment.createAnimationState();
		while (itemInd >= 0) {
			let item = newData[itemInd];
			let itemIsInserted = segment.prependItem(item);
			let isLastItem = itemInd == 0;

			if (itemIsInserted) {
				if (!isLastItem) itemInd--;
			} else {
				if (!segment.isCompleted) segment.complete();
			}

			if (isLastItem && itemIsInserted) {
				segment.recalculateItems();
			}

			let segmentIsReadyForAnimate = segment.isCompleted || (isLastItem && itemIsInserted);
			if (segmentIsReadyForAnimate) {
				let id = segment.id;
				if (!initialSegment) initialSegment = segment;
				if (!initialAnimationState) initialAnimationState = initialSegment.createAnimationState();

				segment.initialAnimationState = Utils.deepMerge({}, initialAnimationState);
				if (this.animatedSegmentsForPrepend.length > 0) {
					segment.initialAnimationState.endXVal = initialAnimationState.startXVal;
					segment.initialAnimationState.endYVal =  initialAnimationState.startYVal;
				}

				segment.targetAnimationState = segment.createAnimationState();
				this.animatedSegmentsForPrepend.push(id);

			}

			if (isLastItem && itemIsInserted) break;
			if (!segment.isCompleted) continue;

			segment = this.allocatePrevSegment();
			let nextItem = trendData[itemInd + 1];
			segment.prependItem(nextItem);

		}

		var animationsOptions = this.chart.state.animations;
		var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;

		if (this.animatedSegmentsForPrepend.length > MAX_ANIMATED_SEGMENTS) time = 0;
		this.animate(time, true);
	}

	private animate(time: number, isPrepend = false) {

		var animatedSegmentsIds = isPrepend ? this.animatedSegmentsForPrepend : this.animatedSegmentsForAppend;
		var animation = isPrepend ? this.prependAnimation : this.appendAnimation;

		if ((animation && animation.isActive()) || time == 0) {
			if (animation) animation.kill();
			this.onAnimationFrameHandler(1, isPrepend);
			animatedSegmentsIds.length = 0;
			return;
		}
		var animationsOptions = this.chart.state.animations;
		var ease = animationsOptions.trendChangeEase;
		var objectToAnimate = {animationValue: 0};
		animation = TweenLite.to(objectToAnimate, time, {animationValue: 1, ease});
		animation.eventCallback('onUpdate', () => this.onAnimationFrameHandler(objectToAnimate.animationValue, isPrepend));
		animation.eventCallback('onComplete', () => {
			animatedSegmentsIds.length = 0;
			this.appendAnimation = null;
		});

		if (isPrepend) {
			this.prependAnimation = animation;
		} else {
			this.appendAnimation = animation;
		}
	}

	private onAnimationFrameHandler(coefficient: number, isPrepend = false) {
		let animatedSegmentsIds = isPrepend ? this.animatedSegmentsForPrepend : this.animatedSegmentsForAppend;
		for (let segmentId of animatedSegmentsIds) {
			let segment = this.segmentsById[segmentId];
			for (let key in segment.targetAnimationState) {
				let targetValue = segment.targetAnimationState[key] as number;
				let initialValue = segment.initialAnimationState[key] as number;
				let currentValue = initialValue + (targetValue - initialValue) * coefficient;
				segment.currentAnimationState[key] = currentValue;
			}
		}
		this.animatedSegmentsIds = this.animatedSegmentsForAppend.concat(this.animatedSegmentsForPrepend);
		this.ee.emit(EVENTS.ANIMATION_FRAME, this);
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

	private trendSegments: TrendSegmentsManager;
	
	constructor(trendPoints: TrendSegmentsManager, id: number) {
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
		if (this.isCompleted) return false;

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

	prependItem(item: ITrendItem): boolean {
		if (this.isCompleted) return false;
		var items = this.items;
		if (items.length < 2) {
			this.items.unshift(item);
			this.hasValue = true;
			return true;
		}
		var endXVal = items[items.length - 1].xVal;
		if (endXVal - item.xVal > this.maxLength) return false;
		items.unshift(item);
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
		this.currentAnimationState = this.createAnimationState();
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

}
