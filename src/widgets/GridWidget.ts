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

export class GridWidget extends ChartWidget{
	static widgetName = 'Grid';
	private lineSegments: LineSegments;
	private axisXGridParams: IGridParamsForAxis;
	private axisYGridParams: IGridParamsForAxis;
	private scrollAnimation: TweenLite;

	constructor (chartState: ChartState) {
		super(chartState);
		var {yAxis, xAxis, width, height} = this.chartState.data;
		var geometry = new THREE.Geometry();
		var material = new THREE.LineBasicMaterial( { linewidth: 1, opacity: 0.1, transparent: true} );

		var axisXGrid = this.axisXGridParams = GridWidget.getGridParamsForAxis(xAxis, width);
		var axisYGrid = this.axisYGridParams = GridWidget.getGridParamsForAxis(yAxis, height);


		for ( var i = - axisXGrid.segmentsCount; i <= axisXGrid.segmentsCount * 2; i ++) {
			var x = i * axisXGrid.stepInPx + 0.5;
			geometry.vertices.push(
				new THREE.Vector3(x, height * 2, 0 ), new THREE.Vector3( x, -height, 0 )
			);
		}

		for ( var i = - axisYGrid.segmentsCount; i < axisYGrid.segmentsCount * 2; i ++) {
			var y = i * axisYGrid.stepInPx - 0.5;
			geometry.vertices.push(
				new THREE.Vector3(width * 2, y, 0 ), new THREE.Vector3( -width, y, 0 )
			);
		}

		this.lineSegments = new LineSegments(geometry, material);
	}

	bindEvents() {
		this.chartState.onXAxisChange((changedOptions: IAxisOptions) => {
			if (changedOptions.range && changedOptions.range.scroll) this.onScrollChange();
		});
	}

	private onScrollChange() {
		var state = this.chartState;
		var animations = state.data.animations;
		var time = animations.trendChangeSpeed;
		var ease = animations.trendChangeEase;
		var canAnimate = animations.enabled && !state.data.cursor.dragMode;
		var object = this.lineSegments;
		if (this.scrollAnimation) this.scrollAnimation.kill();
		if (canAnimate) {
			var objToAnimate = {x: state.data.prevState.xAxis.range.scroll};
			this.scrollAnimation = TweenLite.to(objToAnimate, time, {x: state.data.xAxis.range.scroll, ease: ease});
			this.scrollAnimation.eventCallback('onUpdate', () =>{
				this.setScrollX(objToAnimate.x);
				//object.position.x = state.data.xAxis.range.scroll % this.axisXGridParams.stepInPx;

			})
		} else {
			this.setScrollX(state.data.xAxis.range.scroll);
			//object.position.x = state.data.xAxis.range.scroll % this.axisXGridParams.stepInPx;
		}
	}

	private setScrollX(scrollX: number) {
		this.lineSegments.position.x = scrollX % this.axisXGridParams.stepInPx;
	}

	// TODO: create unit tests : {from: 80, to: 90}, {from: 0, to: 100}, {from: 0.01, to: 2}, {from: 20, to: 180, minGridSize: 50}
	static getGridParamsForAxis(axisOptions: IAxisOptions, axisWidth: number): IGridParamsForAxis {
		var {from, to} = axisOptions.range;
		var gridStart = 0;
		var gridEnd = 0;
		var gridStep = 0;
		var gridStepInPixels = 0;
		var minGridStepInPixels = axisOptions.gridMinSize;
		var fromStr = String(from);
		var toStr = String(to);
		var fromStrPointPos = fromStr.indexOf('.');
		var toStrPointPos = toStr.indexOf('.');
		var intPartLength = Math.max(
			fromStrPointPos !== -1 ? fromStrPointPos : fromStr.length,
			toStrPointPos !== -1 ? toStrPointPos : toStr.length
		);
		var canSkipEqualsDigits = true;
		var gridStepFound = false;
		fromStr = Utils.toFixed(from, intPartLength);
		toStr = Utils.toFixed(to, intPartLength);
		fromStr = fromStr.replace('.', '');
		toStr = toStr.replace('.', '');

		var digitPos = 0;
		while (!gridStepFound) {

			if (canSkipEqualsDigits && fromStr[digitPos] == toStr[digitPos]) {
				continue;
			}
			canSkipEqualsDigits = false;

			let power = intPartLength - digitPos - 1;
			let multiplier = (Math.pow(10, power) || 1);
			let dividers = [1, 2, 5];
			for (let dividerInd = 0; dividerInd < dividers.length; dividerInd++) {
				let nextGridStep =  multiplier/ dividers[dividerInd];
				let nextGridStepInPixels = nextGridStep / (to - from) * axisWidth;
				if (nextGridStepInPixels >= minGridStepInPixels) {
					gridStep = nextGridStep;
					gridStepInPixels = nextGridStepInPixels;
				} else {
					gridStepFound = true;
					break;
				}
			}

			if (!gridStepFound) {
				digitPos++;
				continue;
			}

			gridStart = Number(fromStr.slice(0, digitPos)) * multiplier * 10 + Number(fromStr[digitPos] || 0) * multiplier;
			gridEnd = Number(toStr.slice(0, digitPos)) * multiplier * 10 + Number(toStr[digitPos] || 0) * multiplier;
			break;
		}
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