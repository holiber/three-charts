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
import {ITrendData, ITrendItem} from "../Trend";
import {MAX_DATA_LENGTH} from "../Chart";
import {TrendsWidget, TrendWidget} from "./TrendsWidget";

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
	private geometry: Geometry;
	private material: LineBasicMaterial;
	private line: Line;
	
	data: ITrendData = [];

	constructor (chartState: ChartState, trendName: string) {
		super(chartState, trendName);
		this.chartState = chartState;
		this.geometry = new Geometry();
		this.trend = chartState.trends.getTrend(trendName);
		var options = this.trend.getOptions();
		this.material = new LineBasicMaterial( { color: options.lineColor, linewidth: options.lineWidth } );
		this.appendData(this.trend.getData());
	}

	appendData(newData: ITrendData) {
		if (this.data.length > MAX_DATA_LENGTH) {
			throw 'max data length reached'
		}
		if (this.data.length == 0) {
			this.initLine(newData[0]);
		}
		this.data.push(...newData);
		this.updateLine(newData);
		
	}

	getObject3D() {
		return this.line;
	}

	private updateLine(newData: ITrendData) {
		var vertices = this.geometry.vertices;
		var newDataLen = newData.length;
		var newVertices = vertices.splice(0, newDataLen);
		var lastVertix = vertices[vertices.length - 1];

		for (let i = 0; i < newData.length; i++) {
			let item = newData[i];
			let vertex = newVertices[i];


			var animationEndPoint = this.chartState.getPointOnChart(item.xVal, item.yVal);

			if (!this.chartState.data.animations.enabled) {
				vertex.set(animationEndPoint.x, animationEndPoint.y, 0);
				continue;
			}

			// set animation start point
			vertex.set(lastVertix.x, lastVertix.y, 0);

			var animationOptions = this.chartState.data.animations;
			TweenLite.to(
				vertex, animationOptions.trendChangeSpeed,
				{
					x: animationEndPoint.x,
					y: animationEndPoint.y,
					ease: animationOptions.trendChangeEase
				}
			).eventCallback('onUpdate', () => {
				this.geometry.verticesNeedUpdate = true;
			});
		}

		vertices.push(...newVertices);
		this.geometry.verticesNeedUpdate = true;
	}

	private initLine(startItem: ITrendItem) {
		// init array of vertices
		var geometry = this.geometry;
		var i = MAX_DATA_LENGTH;
		var vertices: Array<Vector3> = [];
		var startPoint = this.chartState.getPointOnChart(startItem.xVal, startItem.yVal);
		while (i--) {
			vertices.push(startPoint.clone());
		}
		geometry.vertices = vertices;

		this.line = new Line(geometry, this.material);
		this.line.frustumCulled = false;
	}



}