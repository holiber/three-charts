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
import {ITrendData} from "../Trend";
import {TrendsWidget, TrendWidget} from "./TrendsWidget";
import {TrendAnimationState} from "../TrendsAnimationManager";
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
	
	data: ITrendData = [];

	constructor (chartState: ChartState, trendName: string) {
		super(chartState, trendName);
		this.chartState = chartState;
		this.trend = chartState.trends.getTrend(trendName);
		var options = this.trend.getOptions();
		this.material = new LineBasicMaterial( { color: options.lineColor, linewidth: options.lineWidth } );
		this.initLine();
		this.appendData(this.trend.getData());
		
	}

	getObject3D() {
		return this.lineSegments;
	}

	protected onTrendAnimate(animationState: TrendAnimationState) {
		var trendData = this.trend.getData();
		var geometry = this.lineSegments.geometry as Geometry;
		var vertices = geometry.vertices;
		var {current} = animationState;
		var lastInd = trendData.length - 1;
		for (var vertexParam in current) {
			let firstChar = vertexParam.charAt(0);
			if (firstChar !== 'x' && firstChar !== 'y') continue;
			let isX = firstChar == 'x';
			let ind = Number(vertexParam.substr(1));
			if (ind > lastInd) continue;
			let value = current[vertexParam];
			let currentVertex = vertices[ind * 2];
			let prevVertex = vertices[ind * 2 - 1];
			if (isX) {
				currentVertex.setX(value);
				prevVertex && prevVertex.setX(value);
				if (ind == lastInd) vertices[ind * 2 + 1].setX(value);
			} else {
				currentVertex.setY(value);
				prevVertex && prevVertex.setY(value);
				if (ind == lastInd) vertices[ind * 2 + 1].setY(value);
			}
		}
		geometry.verticesNeedUpdate = true;
	}

	private initLine() {
		var geometry = new Geometry();
		var animationState = this.chartState.trendsAnimationManager.getState(this.trendName);
		var trendData = this.trend.getData();
		var points = animationState.points;
		for (var vertInd = 0; vertInd < points.length; vertInd++) {
			let vert1 = points[vertInd];
			let vert2 = points[vertInd + 1];
			if (!vert1 || !vert2) break;
			if (vertInd == trendData.length - 1) vert2 = vert1.clone();
			geometry.vertices.push(vert1.clone(), vert2.clone());

		}

		this.lineSegments = new LineSegments(geometry, this.material);
		this.lineSegments.frustumCulled = false;
	}



}