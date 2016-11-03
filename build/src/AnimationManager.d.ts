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
    private createdTime;
    easing: (k: number) => any;
    progress: number;
    delay: number;
    isFinished: boolean;
    isStopped: boolean;
    initialObj: AnimatedObjectType;
    sourceObj: AnimatedObjectType;
    targetObject: AnimatedObjectType;
    startTime: number;
    private onFinishCb;
    private onTickCb;
    constructor(animationManager: AnimationManager, time: number, createdTime: number, easing?: (k: number) => any);
    tick(now: number): void;
    from<T>(sourceObj: T): Animation<T>;
    to(targetObj: AnimatedObjectType): this;
    onTick(onTickCb: (source: AnimatedObjectType, progress: number, k: number, animation: this) => any): this;
    then(onFinishCb: (progress: AnimatedObjectType) => any): this;
    stop(): void;
    completeAndStop(): void;
    withDelay(delay: number): this;
    private setProgress(progress);
}
