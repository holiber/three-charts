import {EE2} from './deps';

/**
 * this class uses as proxy for EventEmitter2
 */
export class EventEmitter {
	private ee: EventEmitter2;
	constructor() {
		this.ee = new EE2();
	}
	emit(eventName: string, ...args: any[]) {
		this.ee.emit(eventName, ...args)
	}
	on(eventName: string, callback: Function) {
		return this.ee.on(eventName, callback)
	}
	off(eventName: string, callback: Function) {
		return this.ee.off(eventName, callback);
	}
	subscribe(eventName: string, callback: Function): Function {
		this.on(eventName, callback);
		return () => this.off(eventName, callback);
	}
	setMaxListeners(listenersCount: number) {
		this.ee.setMaxListeners(listenersCount);
	}
	removeAllListeners(eventName?: string) {
		this.ee.removeAllListeners(eventName);
	}
}