/**
 * defines how axis range will be calculated
 * FIXED - directly use range.from and range.to xVal
 * AUTO - automatically sets range.from and range.to by visible part of opposite axis
 * RELATIVE_END - same as AUTO, but trend end always present in range
 * ALL - automatically sets range.from and range.to by all values of opposite axis
 *
 */
import { TColor } from "./Color";
import { TEase } from "./Easing";
export declare enum AXIS_RANGE_TYPE {
    FIXED = 0,
    RELATIVE_END = 1,
    AUTO = 2,
    ALL = 3,
}
/**
 * Animation ease type
 */
export declare type TTwinEase = Ease | Linear;
export declare type TIteralable = {
    [key: string]: any;
};
export interface IIteralable {
    [key: string]: any;
}
export declare enum AXIS_TYPE {
    X = 0,
    Y = 1,
}
export interface IAxisRange {
    type?: AXIS_RANGE_TYPE;
    from?: number;
    to?: number;
    zoom?: number;
    scroll?: number;
    /**
     * Mode only for Y axis. When true displayed center of Y axis never changed. To use set range.zeroVal as center value.
     */
    isMirrorMode?: boolean;
    padding?: {
        start?: number;
        end?: number;
    };
    margin?: {
        start?: number;
        end?: number;
    };
    maxLength?: number;
    minLength?: number;
    /**
     * value in world center coordinate
     */
    zeroVal?: number;
    /**
     * ratio between 1 pixel and 1 value for zoom = 1
     */
    scaleFactor?: number;
}
export declare enum AXIS_DATA_TYPE {
    NUMBER = 0,
    DATE = 1,
}
export interface IAxisOptions {
    range?: IAxisRange;
    dataType?: AXIS_DATA_TYPE;
    autoScroll?: boolean;
    grid?: IGridOptions;
    color?: TColor;
}
export interface IGridOptions {
    enabled: boolean;
    minSizePx?: number;
    color?: TColor;
}
export interface IAnimationsOptions {
    enabled?: boolean;
    trendChangeSpeed?: number;
    trendChangeEase?: TTwinEase;
    scrollSpeed?: number;
    scrollEase?: TEase;
    autoScrollSpeed?: number;
    autoScrollEase?: TEase;
    zoomSpeed?: number;
    zoomEase?: TEase;
}
