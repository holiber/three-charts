import Geometry = THREE.Geometry;
import Mesh = THREE.Mesh;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import { ChartWidget } from "../Widget";
import LineSegments = THREE.LineSegments;
import { Utils } from "../Utils";
import { IViewportParams } from "../Viewport";
import { IAxisOptions } from "../interfaces";
import { Color } from "../Color";

export interface IGridParamsForAxis {
	start: number,
	end: number,
	step: number,
	stepInPx: number,
	length: number,
	segmentsCount: number
}

/**
 * widget for drawing state grid
 */
export class GridWidget extends ChartWidget{
	static widgetName = 'Grid';
	private lineSegments: LineSegments;
	private gridSizeH: number;
	private gridSizeV: number;
	private isDestroyed = false;

	onReadyHandler() {
		var {width, height, xAxis, yAxis} = this.chart.state;
		this.gridSizeH = Math.floor(width / xAxis.grid.minSizePx) * 3;
		this.gridSizeV = Math.floor(height / yAxis.grid.minSizePx) * 3;
		this.initGrid();
		this.updateGrid();
		this.bindEvents();
	}

	bindEvents() {
		// grid is bigger then interpolatedViewport, so it's no need to update it on each scroll event
		let updateGridThrottled = Utils.throttle(() => this.updateGrid(), 1000);
		this.bindEvent(this.chart.onScroll(() => updateGridThrottled()),
			this.chart.interpolatedViewport.onZoomInterpolation((options) => {
				updateGridThrottled();
				this.onZoomFrame(options);
			}),
			this.chart.onDestroy(() => {
				this.isDestroyed = true;
				this.unbindEvents();
			}),
			this.chart.onResize(() => {
				this.updateGrid();
			})
		);

	}

	private initGrid() {
		let color = new Color(this.chart.state.xAxis.grid.color);
		let geometry = new THREE.Geometry();
		let material = new THREE.LineBasicMaterial({linewidth: 1, color: color.value, opacity: color.a, transparent: true});
		let xLinesCount = this.gridSizeH;
		let yLinesCount = this.gridSizeV;
		while (xLinesCount--) geometry.vertices.push(new Vector3(), new Vector3());
		while (yLinesCount--) geometry.vertices.push(new Vector3(), new Vector3());
		this.lineSegments = new LineSegments(geometry, material);
		this.lineSegments.position.setZ(-1);
		this.lineSegments.frustumCulled = false;
	}

	private updateGrid() {
		if (this.isDestroyed) return;
		var {yAxis, xAxis, width, height} = this.chart.state;
		var axisXGrid = GridWidget.getGridParamsForAxis(xAxis, width, xAxis.range.zoom);
		var axisYGrid = GridWidget.getGridParamsForAxis(yAxis, height, yAxis.range.zoom);
		var scrollXInSegments = Math.ceil(xAxis.range.scroll / axisXGrid.step);
		var scrollYInSegments = Math.ceil(yAxis.range.scroll / axisYGrid.step);
		var gridScrollXVal = scrollXInSegments * axisXGrid.step;
		var gridScrollYVal = scrollYInSegments * axisYGrid.step;
		var startXVal = axisXGrid.start + gridScrollXVal;
		var startYVal = axisYGrid.start + gridScrollYVal;
		var geometry = this.lineSegments.geometry as Geometry;
		var vertices = geometry.vertices;
		var lineInd = 0;

		for (let i =  -this.gridSizeH / 3; i < this.gridSizeH * 2/3; i++) {
			let value = startXVal + i * axisXGrid.step;
			let lineSegment = this.getVerticalLineSegment(value, gridScrollXVal, gridScrollYVal);
			vertices[lineInd * 2].set(lineSegment[0].x, lineSegment[0].y, 0);
			vertices[lineInd * 2 + 1].set(lineSegment[1].x, lineSegment[1].y, 0);
			lineInd++;
		}

		for (let i =  -this.gridSizeV / 3; i < this.gridSizeV * 2/3; i++) {
			let value = startYVal + i * axisYGrid.step;
			let lineSegment = this.getHorizontalLineSegment(value, gridScrollXVal, gridScrollYVal);
			vertices[lineInd * 2].set(lineSegment[0].x, lineSegment[0].y, 0);
			vertices[lineInd * 2 + 1].set(lineSegment[1].x, lineSegment[1].y, 0);
			lineInd++;
		}

		geometry.verticesNeedUpdate = true;

		this.lineSegments.scale.set(
			xAxis.range.scaleFactor * xAxis.range.zoom,
			yAxis.range.scaleFactor * yAxis.range.zoom,
			1
		)
	}

	private getHorizontalLineSegment(yVal: number, scrollXVal: number, scrollYVal: number): Vector3[] {
		var chartState = this.chart;
		var localYVal = yVal - chartState.state.yAxis.range.zeroVal - scrollYVal;
		var widthVal = chartState.viewport.pxToValByXAxis(chartState.state.width);
		return [
			new THREE.Vector3(widthVal * 2 + scrollXVal, localYVal, 0 ),
			new THREE.Vector3( -widthVal + scrollXVal, localYVal, 0 )
		];
	}

	private getVerticalLineSegment(xVal: number, scrollXVal: number, scrollYVal: number): Vector3[] {
		let chart = this.chart;
		let localXVal = xVal - chart.state.xAxis.range.zeroVal - scrollXVal;
		let heightVal = chart.viewport.pxToValByYAxis(chart.state.height);
		return [
			new THREE.Vector3(localXVal, heightVal * 2 + scrollYVal, 0 ),
			new THREE.Vector3(localXVal, -heightVal + scrollYVal, 0 )
		];
	}

	private onZoomFrame(options: IViewportParams) {
		var {xAxis, yAxis} = this.chart.state;
		if (options.zoomX) this.lineSegments.scale.setX(xAxis.range.scaleFactor * options.zoomX);
		if (options.zoomY) this.lineSegments.scale.setY(yAxis.range.scaleFactor * options.zoomY);
	}


	// TODO: move this code to core
	static getGridParamsForAxis(axisOptions: IAxisOptions, axisWidth: number, zoom: number): IGridParamsForAxis {
		let axisRange = axisOptions.range;
		let from = axisRange.from;
		let to = axisRange.to;
		let axisLength = to - from;
		let gridStep = 0;
		let gridStepInPixels = 0;
		let minGridStepInPixels = axisOptions.grid.minSizePx;
		let axisLengthStr = String(axisLength);
		let axisLengthPointPosition = axisLengthStr.indexOf('.');
		let intPartLength = axisLengthPointPosition !== -1 ? axisLengthPointPosition : axisLengthStr.length;

		let gridStepFound = false;
		let digitPos = 0;
		while (!gridStepFound) {

			let power = intPartLength - digitPos - 1;
			let multiplier = (Math.pow(10, power) || 1);
			let dividers = [1, 2, 5];
			for (let dividerInd = 0; dividerInd < dividers.length; dividerInd++) {
				let nextGridStep = multiplier / dividers[dividerInd];
				let nextGridStepInPixels = nextGridStep / axisLength * axisWidth;
				if (nextGridStepInPixels >= minGridStepInPixels) {
					gridStep = nextGridStep;
					gridStepInPixels = nextGridStepInPixels;
				} else {
					gridStepFound = true;
					if (gridStep === 0) {
						gridStep = nextGridStep;
						gridStepInPixels = nextGridStepInPixels;
					}
					break;
				}
			}

			if (!gridStepFound) digitPos++

		}

		var gridStart = Math.floor(from / gridStep) * gridStep;
		var gridEnd = Math.floor(to / gridStep) * gridStep;

		return {
			start: gridStart,
			end: gridEnd,
			step: gridStep,
			stepInPx: gridStepInPixels,
			length: gridEnd - gridStart,
			segmentsCount: Math.round((gridEnd - gridStart) / gridStep)
		}
	}
	
	getObject3D() {
		return this.lineSegments;
	}

}
