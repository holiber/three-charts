import Geometry = THREE.Geometry;
import Mesh = THREE.Mesh;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import {ChartWidget} from "../Widget";
import LineSegments = THREE.LineSegments;
import {ChartState} from "../State";
import {IAxisOptions} from "../Chart";
import {Utils} from "../Utils";

export interface IGridParamsForAxis {
	start: number,
	end: number,
	step: number,
	stepInPx: number,
	length: number,
	segmentsCount: number
}

interface ILinesValues {
	x: number[],
	y: number[]
}

// update lines is expensive operation, so we do it only once per second
var UPDATE_LINES_INTERVAL = 1000;

/**
 * widget for drawing chart grid
 */
export class GridWidget extends ChartWidget{
	static widgetName = 'Grid';
	private lineSegments: LineSegments;
	private axisXGridParams: IGridParamsForAxis;
	private axisYGridParams: IGridParamsForAxis;
	private linesValues: ILinesValues = {x: [], y: []};
	private scrollInSegments: number;
	private gridSizeH: number;
	private gridSizeV: number;
	private linesLastUpdateTime = 0;
	private linesXAnimation: TweenLite;
	private linesYAnimation: TweenLite;

	constructor (chartState: ChartState) {
		super(chartState);
		this.updateGridParams();
		var {width, height} = chartState.data;
		this.gridSizeH = Math.floor(width / chartState.data.xAxis.gridMinSize) * 3;
		this.gridSizeV = Math.floor(height / chartState.data.yAxis.gridMinSize) * 3;
		this.linesValues = this.getCurrentLinesValues();
		var geometry = new THREE.Geometry();
		var material = new THREE.LineBasicMaterial( { linewidth: 1, opacity: 0.07, transparent: true} );
		for (let xVal of this.linesValues.x) geometry.vertices.push(...this.getVerticalLineSegment(xVal));
		for (let yVal of this.linesValues.y) geometry.vertices.push(...this.getHorizontalLineSegment(yVal));
		this.lineSegments = new LineSegments(geometry, material);
	}

	private updateGridParams() {
		var {yAxis, xAxis, width, height} = this.chartState.data;
		this.axisXGridParams = GridWidget.getGridParamsForAxis(xAxis, width);
		this.axisYGridParams = GridWidget.getGridParamsForAxis(yAxis, height);
		this.scrollInSegments = Math.ceil(xAxis.range.scroll / this.axisXGridParams.stepInPx);
	}

	private getCurrentLinesValues(): ILinesValues {
		var linesValues: ILinesValues = {x: [], y: []};
		var axisXGrid = this.axisXGridParams;
		var axisYGrid = this.axisYGridParams;
		var startX = axisXGrid.start + this.scrollInSegments * axisXGrid.step;
		var startY = axisYGrid.start;

		for (let i =  -this.gridSizeH / 3; i < this.gridSizeH * 2/3; i++) {
			linesValues.x.push(startX + i * axisXGrid.step);
		}

		for (let i =  -this.gridSizeV / 3; i < this.gridSizeV * 2/3; i++) {
			linesValues.y.push(startY + i * axisYGrid.step);
		}
		
		return linesValues;
	}

	private getHorizontalLineSegment(yVal: number): Vector3[] {
		var {width} = this.chartState.data;
		var y = this.chartState.getPointOnYAxis(yVal);
		var scrollX = this.scrollInSegments * this.axisXGridParams.stepInPx;
		return [new THREE.Vector3(width * 2 + scrollX, y, 0 ), new THREE.Vector3( -width + scrollX, y, 0 )];
	}

	private getVerticalLineSegment(xVal: number): Vector3[] {
		var {height} = this.chartState.data;
		var x = this.chartState.getPointOnXAxis(xVal);
		return [new THREE.Vector3(x, height * 2, 0 ), new THREE.Vector3(x, -height, 0 )];
	}

	bindEvents() {
		this.chartState.onScroll(() => {
			this.onScrollChange();
		});
		this.chartState.onScrollStop(() => this.recalculateLines());
		this.chartState.onZoom(() => this.onZoom());
	}

	private onScrollChange() {
		if (Date.now() - this.linesLastUpdateTime >= UPDATE_LINES_INTERVAL) {
			this.recalculateLines();
		}
	}

	private onZoom() {
		// var newLineValues = this.getCurrentLinesValues();
		// var animations = this.chartState.data.animations;
		// var time = animations.enabled ? animations.zoomSpeed : 0;
		// if (this.linesXAnimation) this.linesXAnimation.pause();
		// if (this.linesYAnimation) this.linesYAnimation.pause();
		// this.linesXAnimation = TweenLite.to(this.linesValues.x, time, newLineValues.x);
		// this.linesYAnimation = TweenLite.to(this.linesValues.y, time, newLineValues.y);
		// this.linesXAnimation.eventCallback('onUpdate', () => {
		// 	this.updateLinesSegments();
		// });
		// this.linesXAnimation.eventCallback('onComplete', () => {
		// 	this.recalculateLines();
		// });
		this.recalculateLines();
	}

	private recalculateLines() {
		this.updateGridParams();
		this.linesValues = this.getCurrentLinesValues();
		this.updateLinesSegments();
		this.linesLastUpdateTime = Date.now();
	}

	private updateLinesSegments() {
		var horizontalLines = this.linesValues.x;
		var verticalLines = this.linesValues.y;
		var geometry = this.lineSegments.geometry as Geometry;
		var verticalValuesOffset = this.gridSizeH * 2;

		for (let i = 0; i < horizontalLines.length; i++) {
			let lineSegment = this.getVerticalLineSegment(horizontalLines[i]);
			geometry.vertices[i * 2].set(lineSegment[0].x, lineSegment[0].y, 0);
			geometry.vertices[i * 2 + 1].set(lineSegment[1].x, lineSegment[1].y, 0);
		}
		for (let i = 0; i < verticalLines.length; i++) {
			let lineSegment = this.getHorizontalLineSegment(verticalLines[i]);
			geometry.vertices[verticalValuesOffset + i * 2].set(lineSegment[0].x, lineSegment[0].y, 0);
			geometry.vertices[verticalValuesOffset + i * 2 + 1].set(lineSegment[1].x, lineSegment[1].y, 0);
		}
		geometry.verticesNeedUpdate = true;
	}

	static getGridParamsForAxis(axisOptions: IAxisOptions, axisWidth: number): IGridParamsForAxis {
		var {from, to} = axisOptions.range;
		var axisLength = to - from;
		var gridStep = 0;
		var gridStepInPixels = 0;
		var minGridStepInPixels = axisOptions.gridMinSize;
		var axisLengthStr = String(axisLength);
		var axisLengthPointPosition = axisLengthStr.indexOf('.');
		var intPartLength = axisLengthPointPosition !== -1 ? axisLengthPointPosition : axisLengthStr.length;

		var gridStepFound = false;
		var digitPos = 0;
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