import { IIteralable } from './interfaces';
export declare class AnimationManager {
    isAnimationsEnabled: boolean;
    private animations;
    private lastTickTime;
    constructor();
    animate(time: number, timingFunction?: (progress: number) => number): Animation<IIteralable | number>;
    animateObj(source: IIteralable, target: IIteralable): void;
    setAimationsEnabled(isEnabled: boolean): void;
    tick(): void;
    hasActiveAnimations(): boolean;
}
export declare class Animation<AnimatedObjectType> {
    private animationManager;
    time: number;
    private startTime;
    easing: (k: number) => any;
    progress: number;
    isFinished: boolean;
    initialObj: AnimatedObjectType;
    sourceObj: AnimatedObjectType;
    targetObject: AnimatedObjectType;
    private onFinishCb;
    private onTickCb;
    private isStopped;
    constructor(animationManager: AnimationManager, time: number, startTime: number, easing?: (k: number) => any);
    tick(now: number): void;
    from<T>(sourceObj: T): Animation<T>;
    to(targetObj: AnimatedObjectType): this;
    onTick(onTickCb: (source: AnimatedObjectType, progress: number, k: number) => any): this;
    then(onFinishCb: (progress: number) => any): this;
    stop(): void;
    completeAndStop(): void;
    private setProgress(progress);
    private onFinishHandler();
}
