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

		for (let pointId in points) {
			let point = points[pointId];
			let nextPoint = points[Number(pointId) + 1];
			if (!nextPoint) break;
			let vert1 = point.vector.clone();
			let vert2 = nextPoint.vector.clone();
			if (!nextPoint.hasValue) vert2 = vert1.clone();
			geometry.vertices.push(vert1, vert2);

		}

		this.lineSegments = new LineSegments(geometry, this.material);
		this.lineSegments.frustumCulled = false;
	}


	protected onTrendAnimate(animationState: TrendPoints) {
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
			let value = current[vertexValue];
			let currentVertex = vertices[ind * 2];
			if (isX) {
				currentVertex.setX(value);
				if (nextPoint) {
					vertices[ind * 2 + 1].setX(nextPoint.getCurrentVec().x);
				} else {
					vertices[ind * 2 + 1].setX(value);
				}
			} else {
				currentVertex.setY(value);
				if (nextPoint) {
					vertices[ind * 2 + 1].setY(nextPoint.getCurrentVec().y);
				} else {
					vertices[ind * 2 + 1].setY(value);
				}
			}
		}
		geometry.verticesNeedUpdate = true;
	}


}