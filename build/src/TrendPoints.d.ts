import { ChartState } from "./State";
import Vector3 = THREE.Vector3;
import { ITrendItem, Trend } from "./Trend";
export interface ITargets {
    ease?: Linear | Ease;
    [key: string]: number | Linear | Ease;
}
export declare class TrendPoints {
    currentAnimation: TweenLite;
    points: {
        [id: string]: TrendPoint;
    };
    current: {
        [key: string]: number;
    };
    targets: ITargets;
    chartState: ChartState;
    private nextEmptyId;
    private startPointId;
    private endPointId;
    private trend;
    private ee;
    constructor(chartState: ChartState, trend: Trend, pointsCount: number, initialItem: ITrendItem);
    protected bindEvents(): void;
    getEndPoint(): TrendPoint;
    getStartPoint(): TrendPoint;
    /**
     * returns array of points for values array
     * values must be sorted!
     */
    getPointsForXValues(values: number[]): TrendPoint[];
    onAnimationFrame(cb: (animationState: TrendPoints) => void): Function;
    appendPoint(item: ITrendItem): TrendPoint;
    prependPoint(item: ITrendItem): TrendPoint;
    private prependData(newData);
    private appendData(newData);
    private animate(time, newTargets, current?);
}
export declare class TrendPoint {
    id: number;
    prevId: number;
    nextId: number;
    hasValue: boolean;
    xVal: number;
    yVal: number;
    startXVal: number;
    endXVal: number;
    vector: Vector3;
    private trendPoints;
    constructor(trendPoints: TrendPoints, id: number, xVal: number, yVal: number);
    getNext(): TrendPoint;
    getPrev(): TrendPoint;
    getFrameVal(): Vector3;
    getFramePoint(): Vector3;
    getCurrentVec(): Vector3;
}
