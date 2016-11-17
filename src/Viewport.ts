
import { Chart } from "./Chart";

export interface IViewportParams {
	scrollXVal?: number,
	scrollYVal?: number,
	scrollX?: number,
	scrollY?: number,
	zoomX?: number,
	zoomY?: number
}

export class Viewport {
	params: IViewportParams = {};
	protected chart: Chart;

	constructor(chart: Chart) {
		this.chart = chart;
		this.updateParams();
		this.bindEvents();
	}

	protected bindEvents() {
		this.chart.onChange(() => this.updateParams());
	}

	protected updateParams() {
		let state = this.chart.state;
		this.params.scrollXVal = state.xAxis.range.scroll;
		this.params.scrollYVal = state.yAxis.range.scroll;
		this.params.scrollX = this.valToPxByXAxis(this.params.scrollXVal);
		this.params.scrollY = this.valToPxByYAxis(this.params.scrollYVal);
		this.params.zoomX = state.xAxis.range.zoom;
		this.params.zoomY = state.yAxis.range.zoom;
	}

	getCameraSettings() {
		let {width, height} = this.chart.state;
		// move 0,0 to left-bottom corner
		return {
			left: 0,
			right: width,
			top: height,
			bottom: 0,
			near: -500,
			far: 1000
		}
	}


	// get world coordinates
	getWorldXByVal(xVal: number): number {
		var {scaleFactor, zeroVal} = this.chart.state.xAxis.range;
		var zoom = this.params.zoomX;
		return (xVal - zeroVal) * scaleFactor * zoom;
	}

	getWorldYByVal(yVal: number): number {
		var {scaleFactor, zeroVal} =  this.chart.state.yAxis.range;
		var zoom = this.params.zoomY;
		return (yVal - zeroVal) * scaleFactor * zoom;
	}

	getWorldXByViewportX(viewportX: number): number {
		return this.getWorldXByVal(this.getValByViewportX(viewportX));
	}

	getWorldYByViewportY(viewportY: number): number {
		return this.getWorldYByVal(this.getValByViewportY(viewportY));
	}


	// get value
	getValByWorldX(worldX: number): number {
		return this.chart.state.xAxis.range.zeroVal + this.pxToValByXAxis(worldX);
	}

	getValByWorldY(worldY: number): number {
		return this.chart.state.yAxis.range.zeroVal + this.pxToValByYAxis(worldY);
	}

	getValByViewportX(x: number): number {
		return this.chart.state.xAxis.range.zeroVal + this.params.scrollXVal + this.pxToValByXAxis(x);
	}

	getValByViewportY(y: number): number {
		return this.chart.state.yAxis.range.zeroVal + this.params.scrollYVal + this.pxToValByYAxis(y);
	}


	// get viewport coordinates

	getViewportXByVal(xVal: number): number {
		return this.getWorldXByVal(xVal) - this.params.scrollX;
	}

	getViewportYByVal(yVal: number): number {
		return this.getWorldYByVal(yVal) - this.params.scrollY;
	}

	getViewportXByWorldX(worldX: number): number {
		return worldX - this.params.scrollX;
	}


	// pixels converters

	valToPxByXAxis(val: number) {
		return val * this.chart.state.xAxis.range.scaleFactor * this.params.zoomX;
	}

	valToPxByYAxis(val: number) {
		return val * this.chart.state.yAxis.range.scaleFactor * this.params.zoomY;
	}

	pxToValByXAxis(pixelsCount: number) {
		return pixelsCount / this.chart.state.xAxis.range.scaleFactor / this.params.zoomX;
	}

	pxToValByYAxis(pixelsCount: number) {
		return pixelsCount / this.chart.state.yAxis.range.scaleFactor / this.params.zoomY;
	}


	// get viewport edges

	getTop(): number {
		return this.params.scrollY + this.chart.state.height;
	}

	getRight(): number {
		return this.params.scrollX + this.chart.state.width;
	}

	getBottom(): number {
		return this.params.scrollY;
	}

	getLeft(): number {
		return this.params.scrollX;
	}

	getTopVal() {
		return this.getValByWorldY(this.getTop());
	}

	getRightVal() {
		return this.getValByWorldX(this.getRight());
	}

	getBottomVal() {
		return this.getValByWorldY(this.getBottom());
	}

	getLeftVal() {
		return this.getValByWorldX(this.getLeft());
	}

}
