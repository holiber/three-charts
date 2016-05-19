/**
 * defines how axis range will be calculated
 * FIXED - directly use range.from and range.to value
 * AUTO - automatically sets range.from and range.to by visible part of opposite axis
 * RELATIVE_END - same as AUTO but trend end always present in range
 * ALL - automatically sets range.from and range.to by all values of opposite axis
 */
export enum AXIS_RANGE_TYPE {
	FIXED,
	RELATIVE_END,
	AUTO, // TODO: AXIS_RANGE_TYPE.AUTO
	ALL // TODO: AXIS_RANGE_TYPE.ALL
}

/**
 * Animation ease type
 */
export declare type TEase = Ease | Linear;


export interface IAxisRange {
	type?: AXIS_RANGE_TYPE,
	from?: number,
	to?: number,
	scroll?: number,
	padding?: {
		start?: number,
		end?: number
	}
}

export interface IAxisOptions {
	range: IAxisRange,
	gridMinSize?: number,
	autoScroll?: boolean,
}

export interface IAnimationsOptions {
	enabled?: boolean,
	trendChangeSpeed?: number,
	trendChangeEase?: TEase,
	autoScrollSpeed?: number,
	autoScrollEase?: TEase,
	zoomSpeed?: number,
	zoomEase?: TEase,
}