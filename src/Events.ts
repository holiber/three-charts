// TODO not sure that class will be needed to future
export interface IChartEvent {
	name?: string;
	data?: {[key: string]: any}
}

export abstract class ChartEvent implements IChartEvent {
	name = 'unnamed event';
}

export abstract class ChartEventWidthArgs<TArgsType> extends ChartEvent {
	data: TArgsType;
	constructor(data: TArgsType) {
		super();
		this.data = data;
	}
}

export class ScrollEvent extends ChartEventWidthArgs<{deltaX: number}> {name = 'scroll'}

export class ScrollStopEvent extends ChartEvent{name = 'scrollStop'}