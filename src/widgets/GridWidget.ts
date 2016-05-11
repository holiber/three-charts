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
	length: number
}

export class GridWidget extends ChartWidget{
	static widgetName = 'Grid';
	private geometry: Geometry;
	private material: LineBasicMaterial;
	private lineSegments: LineSegments;

	constructor (chartState: ChartState) {
		super(chartState);
		var {yAxis, xAxis, width, height} = this.chartState.data;
		var geometry = new THREE.Geometry();
		var material = new THREE.LineBasicMaterial( { linewidth: 1, opacity: 0.1, transparent: true} );

		var size = 50;
		var step = 20;
		var color1 = new THREE.Color( 0xFFFFFF);
		var color2 = new THREE.Color( 0x888888 );
		var axisXGrid = GridWidget.getGridParamsForAxis(xAxis, width);
		var axisYGrid = GridWidget.getGridParamsForAxis(yAxis, height);


		for ( var i = - axisXGrid.length; i <= axisXGrid.length; i ++) {
			var x = i * axisXGrid.stepInPx + 0.5;
			geometry.vertices.push(
				new THREE.Vector3(x, height, 0 ), new THREE.Vector3( x, -height, 0 )
			);
		}

		for ( var i = - axisYGrid.length; i <= axisYGrid.length; i ++) {
			var y = i * axisYGrid.stepInPx - 0.5;
			geometry.vertices.push(
				new THREE.Vector3(width, y, 0 ), new THREE.Vector3( -width, y, 0 )
			);
		}

		this.lineSegments = new LineSegments(geometry, material);
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
		return {start: gridStart, end: gridEnd, step: gridStep, stepInPx: gridStepInPixels, length: gridEnd - gridStart}
	}

	getObject3D() {
		return this.lineSegments;
	}

}