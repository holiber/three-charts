import { IIteralable } from './interfaces';
import { EASING } from  './Easing';

// TODO: transfer AnimationManager to own repo
export class AnimationManager {

	isAnimationsEnabled = true;
	private animations: Animation<any>[] = [];
	private lastTickTime: number;

	constructor() {
		this.lastTickTime = Date.now();
	}

	animate(time: number, timingFunction?: (progress: number) => number): Animation<IIteralable|number> {
		let animation = new Animation(this, time, this.lastTickTime, timingFunction);
		this.animations.push(animation);
		return animation;
	}

	animateObj(source: IIteralable, target: IIteralable, ) {

	}

	setAimationsEnabled(isEnabled: boolean) {
		this.isAnimationsEnabled = isEnabled;
	}

	tick() {
		let now = Date.now();
		let animations = this.animations;

		// call tick for each animation
		for (let i = 0; i < animations.length; i++) {
			let animation = animations[i];
			if (this.isAnimationsEnabled) {
				animation.tick(now);
			} else {
				animation.completeAndStop();
			}
		}

		// cleanup completed animations
		let i = animations.length;
		while (i--) if (animations[i].isStopped) animations.splice(i, 1);

		this.lastTickTime = now;
	}

	hasActiveAnimations(): boolean {
		return this.animations.length > 0;
	}

}

export class Animation<AnimatedObjectType> {

	progress = 0;
	delay = 0;
	isFinished = false;
	isStopped = false;
	initialObj: AnimatedObjectType;
	sourceObj: AnimatedObjectType;
	targetObject: AnimatedObjectType;
	startTime: number;
	private onFinishCb: (source: AnimatedObjectType, animation: this) => any;
	private onTickCb: (source: AnimatedObjectType, progress: number, k: number, animation: this) => any;

	constructor(
		private animationManager: AnimationManager,
		public time: number,
		private createdTime: number,
		public easing: (k: number) => any = EASING.Quadratic.Out)
	{
		this.startTime = createdTime;
	}

	tick(now: number) {
		if (!this.isStopped) {
			let progress = this.time > 0 ? ((now - this.startTime) / this.time) : 1;
			this.setProgress(progress);
		}
	}

	from<T>(sourceObj: T): Animation<T> {
		if (typeof sourceObj == 'object') {
			this.sourceObj = sourceObj as any;
			this.initialObj = {} as any;
			let sourceIteralable = sourceObj as IIteralable;
			for (let key in sourceIteralable) if (typeof sourceIteralable[key] == 'number') {
				(this.initialObj as IIteralable)[key] = sourceIteralable[key];
			}

		} else if (typeof sourceObj == 'number') {
			this.sourceObj = sourceObj;
			this.initialObj = sourceObj;
		}
		return (this as any) as Animation<T>;
	}

	to(targetObj: AnimatedObjectType): this {
		this.targetObject = targetObj;

		// clear unused fields
		if (typeof this.initialObj == 'object') {

			let initialIteralable = this.initialObj as IIteralable;
			for (let key in this.targetObject) {
				if (initialIteralable[key] == void 0) delete initialIteralable[key];
			}

			let targetIteralable = this.targetObject as IIteralable;
			for (let key in initialIteralable) {
				if (targetIteralable[key] == void 0) delete initialIteralable[key];
			}
		}
		return this;
	}

	onTick(onTickCb: (source: AnimatedObjectType, progress: number, k: number, animation: this) => any): this {
		this.onTickCb = onTickCb;
		return this;
	}

	then(onFinishCb: (progress: AnimatedObjectType) => any): this {
		this.onFinishCb = onFinishCb;
		return this;
	}

	stop() {
		this.isStopped = true;
	}

	completeAndStop() {
		this.setProgress(1);
	}

	withDelay(delay: number): this {
		this.delay = delay;
		this.startTime = this.createdTime + delay;
		return this;
	}

	private setProgress(progress: number) {

		if (progress < 0) return;

		progress = Math.min(progress, 1);
		this.progress = progress;
		let k = this.easing(progress);

		if (typeof this.sourceObj == 'number') {
			let initialVal = this.initialObj as any as number;
			let targetVal = this.targetObject as any as number;
			this.sourceObj = (initialVal + (targetVal - initialVal) * k) as any as AnimatedObjectType;
		} else if (this.sourceObj && this.targetObject) {
			for (let key in this.initialObj) {
				let initialVal = (this.initialObj as IIteralable)[key] as number;
				let targetVal = (this.targetObject as IIteralable)[key] as number;
				(this.sourceObj as IIteralable)[key] = initialVal + (targetVal - initialVal) * k;
			}
		}


		if (progress == 1) {
			this.isStopped = true;
			this.isFinished = true;
		}

		if (this.onTickCb) this.onTickCb(this.sourceObj, progress, k, this);

		if (progress == 1 && this.onFinishCb) this.onFinishCb(this.sourceObj, this);
	}

}
