import { IIteralable } from "./interfaces";
import { ChartState } from "./State";
import Vector3 = THREE.Vector3;
import { ITrendItem, Trend } from "./Trend";
/**
 *  Class helps to display and animate trends segments
 */
export declare class TrendSegments {
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
    private appendAnimation;
    private prependAnimation;
    private animatedSegmentsForAppend;
    private animatedSegmentsForPrepend;
    private nextEmptyId;
    private startSegmentId;
    private endSegmentId;
    private trend;
    private ee;
    constructor(chartState: ChartState, trend: Trend);
    protected bindEvents(): void;
    private onDestroyHandler();
    private onZoomHandler();
    private onTrendChangeHandler(changedOptions, newData);
    getEndSegment(): TrendSegment;
    getStartSegment(): TrendSegment;
    private tryToRebuildSegments(force?);
    private stopAllAnimations();
    private recalculateDisplayedRange(segmentsAreRebuilded?);
    /**
     * returns array of segments for values array
     * values must be sorted!
     */
    getSegmentsForXValues(values: number[]): TrendSegment[];
    onAnimationFrame(cb: (animationState: TrendSegments) => void): Function;
    onRebuild(cb: Function): () => void;
    onDisplayedRangeChanged(cb: Function): () => void;
    allocateNextSegment(): TrendSegment;
    allocatePrevSegment(): TrendSegment;
    private appendData(newData, needRebuildSegments?);
    private prependData(newData);
    private animate(time, isPrepend?);
    private onAnimationFrameHandler(coefficient, isPrepend?);
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
    prependItem(item: ITrendItem): boolean;
    complete(): void;
    recalculateItems(): void;
    getNext(): TrendSegment;
    getPrev(): TrendSegment;
    getFrameVal(): Vector3;
    getFramePoint(): Vector3;
}
