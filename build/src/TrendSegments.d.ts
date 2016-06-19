import { IIteralable } from "./interfaces";
import { ChartState } from "./State";
import Vector3 = THREE.Vector3;
import { ITrendItem, Trend } from "./Trend";
export interface ITargets {
    ease?: Linear | Ease;
    [key: string]: number | Linear | Ease;
}
/**
 *  Class helps to display and animate trends segments
 */
export declare class TrendSegments {
    currentAnimation: TweenLite;
    segmentsById: {
        [id: string]: TrendSegment;
    };
    segments: TrendSegment[];
    chartState: ChartState;
    animatedSegmentsIds: number[];
    maxSegmentLength: number;
    segmentsLength: number;
    firstDisplayedSegment: TrendSegment;
    lastDisplayedSegment: TrendSegment;
    private nextEmptyId;
    private startPointId;
    private endPointId;
    private trend;
    private ee;
    constructor(chartState: ChartState, trend: Trend);
    protected bindEvents(): void;
    private onZoomHandler();
    private onTrendChangeHandler(changedOptions, newData);
    getEndSegment(): TrendSegment;
    getStartPoint(): TrendSegment;
    private rebuildSegments();
    private recalculateDisplayedRange(segmentsAreRebuilded?);
    /**
     * returns array of segmentsById for values array
     * values must be sorted!
     */
    getPointsForXValues(values: number[]): TrendSegment[];
    onAnimationFrame(cb: (animationState: TrendSegments) => void): Function;
    onRebuild(cb: Function): () => void;
    onDisplayedRangeChanged(cb: Function): () => void;
    prependPoint(items: ITrendItem[]): TrendSegment;
    allocateNextSegment(): TrendSegment;
    private appendData(newData, needRebuildSegments?);
    private prependData(newData);
    private animate(time);
    private onAnimationFrameHandler(coefficient);
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
export declare class TrendSegment implements ITrendSegmentState {
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
    isCompleted: boolean;
    maxLength: number;
    items: ITrendItem[];
    initialAnimationState: ITrendSegmentState;
    targetAnimationState: ITrendSegmentState;
    currentAnimationState: ITrendSegmentState;
    private trendSegments;
    constructor(trendPoints: TrendSegments, id: number);
    createAnimationState(): ITrendSegmentState;
    appendItem(item: ITrendItem): boolean;
    complete(): void;
    recalculateItems(): void;
    getNext(): TrendSegment;
    getPrev(): TrendSegment;
    getFrameVal(): Vector3;
    getFramePoint(): Vector3;
}
