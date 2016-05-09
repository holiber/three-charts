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
import {ITrendOptions} from "../Chart";


export interface ITrendItem {xVal: number, yVal: number}
export interface ITrendData extends Array<ITrendItem>{}

const MAX_VERTICES = 1000;


export class TrendLineWidget extends ChartWidget {
	static widgetName = 'TrendLine';
	private geometry: Geometry;
	private material: LineBasicMaterial;
	private object3D: Object3D;
	private line: Line;
	
	data: ITrendData = [];


	constructor (state: ChartState) {
		super(state);

		this.object3D = new Object3D();
		this.geometry = new Geometry();
		this.material = new LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
		this.appendData(this.chartState.data.trend.data);
		this.chartState.onTrendChange((to: ITrendOptions, newData: ITrendData) => this.appendData(newData));

	}

	getObject3D(): Object3D {
		return this.object3D;
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
		this.line.frustumCulled = false;
		this.object3D.add(this.line);
	}



}