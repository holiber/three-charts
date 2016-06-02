import Geometry = THREE.Geometry;
import Mesh = THREE.Mesh;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import Face3 = THREE.Face3;
import Texture = THREE.Texture;
import Vector2 = THREE.Vector2;
import {TrendsWidget, TrendWidget} from "./TrendsWidget";
import {TrendPoints} from "../TrendPoints";
import LineSegments = THREE.LineSegments;
import forestgreen = THREE.ColorKeywords.forestgreen;
import {IScreenTransformOptions} from "../Screen";

/**
 * widget for drawing trends lines
 */
export class TrendsLineWidget extends TrendsWidget<TrendLine> {
	static widgetName = "trendsLine";
	protected getTrendWidgetClass() {
		return TrendLine;
	}
}


class TrendLine extends TrendWidget {
	private material: LineBasicMaterial;
	private lineSegments: LineSegments;
	private scaleXFactor: number;
	private scaleYFactor: number;
	
	constructor (chartState: ChartState, trendName: string) {
		super(chartState, trendName);
		var options = this.trend.getOptions();
		this.material = new LineBasicMaterial( { color: options.lineColor, linewidth: options.lineWidth } );
		this.initLine();
	}

	getObject3D() {
		return this.lineSegments;
	}
	
	private initLine() {
		var geometry = new Geometry();
		var animationState = this.trend.points;
		var points = animationState.points;
		this.scaleXFactor = this.chartState.valueToPxByXAxis(1);
		this.scaleYFactor = this.chartState.valueToPxByYAxis(1);

		for (let pointId in points) {
			let point = points[pointId];
			let nextPoint = points[Number(pointId) + 1];
			if (!nextPoint) break;
			let vert1 = point.getFrameVal();
			let vert2 = nextPoint.getFrameVal();
			if (!nextPoint.hasValue) vert2 = vert1.clone();
			vert1 = this.toLocalVec(vert1);
			vert2 = this.toLocalVec(vert2);
			geometry.vertices.push(vert1, vert2);

		}

		this.lineSegments = new LineSegments(geometry, this.material);
		this.lineSegments.scale.set(this.scaleXFactor, this.scaleYFactor, 1);
		// this.lineSegments.position.set(
		// 	- this.chartState.data.xAxis.range.from * this.scaleXFactor,
		// 	- this.chartState.data.yAxis.range.from * this.scaleYFactor,
		// 	0
		// );
		this.lineSegments.frustumCulled = false;
	}

	// protected onZoom() {
	// 	var currentScale = this.lineSegments.scale;
	// 	var zoomX = this.chartState.data.xAxis.range.zoom;
	// 	var zoomY = this.chartState.data.yAxis.range.zoom;
	// 	currentScale.set(this.scaleXFactor * zoomX, this.scaleYFactor * zoomY, 1);
	// 	// setInterval(() => {
	// 	// 	currentScale.setY(currentScale.scrollY + 0.4);
	// 	// }, 500)
	// }

	// protected onZoomFrame(zoomX: number, zoomY: number) {
	// 	// var currentScale = this.lineSegments.scale;
	// 	// currentScale.set(this.scaleXFactor * zoomX, this.scaleYFactor * zoomY, 1);
	// 	// setInterval(() => {
	// 	// 	currentScale.setY(currentScale.scrollY + 0.4);
	// 	// }, 500)
	// }


	protected onZoomFrame(options: IScreenTransformOptions) {
		var currentScale = this.lineSegments.scale;
		if (options.zoomX) currentScale.setX(this.scaleXFactor * options.zoomX);
		if (options.zoomY) currentScale.setY(this.scaleYFactor * options.zoomY);
	}

	protected onPointsMove(animationState: TrendPoints) {

		var trendData = this.trend.getData();
		var geometry = this.lineSegments.geometry as Geometry;
		var vertices = geometry.vertices;
		var {current} = animationState;
		var lastInd = trendData.length - 1;
		for (var vertexValue in current) {
			let firstChar = vertexValue.charAt(0);
			if (firstChar !== 'x' && firstChar !== 'y') continue;
			let isX = firstChar == 'x';
			let ind = Number(vertexValue.substr(1));
			if (ind > lastInd) continue;
			let point = animationState.points[ind];
			let nextPoint = point.getNext();
			let prevPoint = point.getPrev();
			let lineStartVertex = vertices[ind * 2];
			let lineEndVertex = vertices[ind * 2 + 1];
			let isAppend = (prevPoint);

			if (isX) {
				let value = this.toLocalX(current[vertexValue]);
				if (prevPoint) {
					lineStartVertex.setX(this.toLocalX(prevPoint.getFrameVal().x));
					lineEndVertex.setX(value);
				} else {
					lineStartVertex.setX(value);
					lineEndVertex.setX(value);
				}
				if (nextPoint) {
					let nextPointLineStartVertex = vertices[(nextPoint.id) * 2];
					if (nextPointLineStartVertex.x !== value) nextPointLineStartVertex.setX(value);
				}
			} else {
				let value = this.toLocalY(current[vertexValue]);
				if (isAppend) {
					lineStartVertex.setY(this.toLocalY(prevPoint.getFrameVal().y));
					lineEndVertex.setY(value);
				} else {
					lineStartVertex.setY(value);
					lineEndVertex.setY(value);
				}
				if (nextPoint) {
					let nextPointLineStartVertex = vertices[(nextPoint.id) * 2];
					if (nextPointLineStartVertex.y !== value) nextPointLineStartVertex.setY(value);
				}

			}
		}
		geometry.verticesNeedUpdate = true;
	}

	private toLocalX(xVal: number): number {
		return xVal - this.chartState.data.xAxis.range.zeroVal;
	}

	private toLocalY(yVal: number): number {
		return yVal - this.chartState.data.yAxis.range.zeroVal;
	}

	private toLocalVec(vec: Vector3): Vector3 {
		return new Vector3(this.toLocalX(vec.x), this.toLocalY(vec.y), 0);
	}
}