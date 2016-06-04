export interface IChartEvent {
    name?: string;
    data?: {
        [key: string]: any;
    };
}
export declare abstract class ChartEvent implements IChartEvent {
    name: string;
}
export declare abstract class ChartEventWidthArgs<TArgsType> extends ChartEvent {
    data: TArgsType;
    constructor(data: TArgsType);
}
export declare class ScrollEvent extends ChartEventWidthArgs<{
    deltaX: number;
}> {
    name: string;
}
export declare class ScrollStopEvent extends ChartEvent {
    name: string;
}
