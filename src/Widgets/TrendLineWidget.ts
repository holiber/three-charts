import Geometry = THREE.Geometry;
import Mesh = THREE.Mesh;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import {ChartWidget} from "../Widget";
import Face3 = THREE.Face3;
import Texture = THREE.Texture;
import Vector2 = THREE.Vector2;
import {ITrendData, ITrendItem, Trend, ITrendOptions} from "../Trend";

const MAX_VERTICES = 1000;

export class TrendLineWidget extends ChartWidget {
	static widgetName = 'TrendLine';
	private object3D: Object3D;
	private lines: {[trendName: string]: TrendLine} = {};

	constructor (state: ChartState) {
		super(state);
		this.object3D = new Object3D();
		this.chartState.onTrendsChange(() => this.onTrendsChange());
		this.chartState.onTrendChange((trendName: string, changedOptions: ITrendOptions, newData: ITrendData) => {
			this.onTrendChange(trendName, changedOptions, newData)
		});
		this.onTrendsChange();
	}

	private onTrendsChange() {
		var trendsOptions = this.chartState.data.trends;
		for (let trendName in trendsOptions) {
			let trendOptions = trendsOptions[trendName];
			if (trendOptions.enabled && !this.lines[trendName]) {
				this.createTrendLine(trendName);
			} else if (!trendOptions.enabled && this.lines[trendName]){
				this.destroyTrendLine(trendName);
			}
		}
	}

	private onTrendChange(trendName: string, changedOptions: ITrendOptions, newData: ITrendData) {
		if (!changedOptions.data) return;
		var trendLine = this.lines[trendName];
		if (!trendLine) return;
		trendLine.appendData(newData);
	}

	getObject3D(): Object3D {
		return this.object3D;
	}

	private createTrendLine(trendName: string) {
		var line = new TrendLine(this.chartState, trendName);
		this.lines[trendName] = line;
		this.object3D.add(line.getObject3D());
	}

	private destroyTrendLine(trendName: string) {
		delete this.lines[trendName];
		var lineObject = this.object3D.getObjectByName(trendName);
		this.object3D.remove(lineObject);
	}
}


class TrendLine {
	private chartState: ChartState;
	private geometry: Geometry;
	private material: LineBasicMaterial;
	private line: Line;
	private trend: Trend;
	
	data: ITrendData = [];

	constructor (chartState: ChartState, trendName: string) {
		this.chartState = chartState;
		this.geometry = new Geometry();
		this.trend = chartState.trends.getTrend(trendName);
		var options = this.trend.getOptions();
		this.material = new LineBasicMaterial( { color: options.lineColor, linewidth: options.lineWidth } );
		this.appendData(this.trend.getData());
	}

	appendData(newData: ITrendData) {
		if (this.data.length > MAX_VERTICES) {
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

			TweenLite.to(
				vertex, this.chartState.data.animations.trendChangeSpeed,
				{
					x: animationEndPoint.x,
					y: animationEndPoint.y,
					//ease: Linear.easeNone
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
		var i = MAX_VERTICES;
		var vertices: Array<Vector3> = [];
		var startPoint = this.chartState.getPointOnChart(startItem.xVal, startItem.yVal);
		while (i--) {
			vertices.push(startPoint.clone());
		}
		geometry.vertices = vertices;

		this.line = new Line(geometry, this.material);
		this.line.name = this.trend.name;
		this.line.frustumCulled = false;
	}



}