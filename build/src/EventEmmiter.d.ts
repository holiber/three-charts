/**
 * this class uses as proxy for EventEmitter2
 */
export declare class EventEmitter {
    private ee;
    constructor();
    emit(eventName: string, ...args: any[]): void;
    on(eventName: string, callback: Function): EventEmitter2;
    off(eventName: string, callback: Function): EventEmitter2;
    subscribe(eventName: string, callback: Function): Function;
    setMaxListeners(listenersCount: number): void;
    removeAllListeners(eventName?: string): void;
}
