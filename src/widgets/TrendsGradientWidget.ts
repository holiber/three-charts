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
import {ITrendOptions, ITrendData, Trend, ITrendItem} from "../Trend";
import {Utils} from "../Utils";
import {TrendsWidget, TrendWidget} from "./TrendsWidget";

const MAX_VERTICES = 1000;


const PART_VERTICES_COUNT = 5;
const PART_FACES_COUNT = 3;

export class TrendsGradientWidget extends TrendsWidget<TrendGradient> {
	static widgetName = "TrendsGradient";
	protected getTrendWidgetClass() {
		return TrendGradient;
	}

	static generateGradientTexture(): Texture {
		var w = 1;
		var h = 512;
		return Utils.createTexture(w, h, (ctx) => {
			var grd = ctx.createLinearGradient(0, 0, 0, h);
			grd.addColorStop(0.5,"rgba(86,119,29, 1)");
			grd.addColorStop(1,"rgba(86,119,29, 0.1)");
			ctx.fillStyle = grd;
			ctx.fillRect(0, 0, w, h);
		});

	}
}



class TrendGradient extends TrendWidget {
	private gradient: Mesh;
	
	static widgetIsEnabled(trendOptions: ITrendOptions) {
		return trendOptions.enabled && trendOptions.hasGradient
	}

	data: ITrendData = [];


	constructor (chartState: ChartState, trendName: string) {
		super(chartState, trendName);
		this.chartState = chartState;
		this.trend = chartState.trends.getTrend(trendName);
		this.appendData(this.trend.getData());
	}

	getObject3D(): Object3D {
		return this.gradient;
	}


	appendData(newData: ITrendData) {
		if (this.data.length > MAX_VERTICES) {
			throw 'max data length reached'
		}
		if (this.data.length == 0) {
			this.initGradient(newData[0]);
		}
	
		this.data.push(...newData);
		this.updateGradient(newData);
	
	}
	
	private initGradient(startItem: ITrendItem) {
		var geom = new Geometry();
	
	
		// init arrays of vertices, faces and faceVertexUvs
		var vertInd = PART_VERTICES_COUNT * MAX_VERTICES;
		while (vertInd--) {
			geom.vertices.push(new Vector3());
		}
		var faceInd = PART_FACES_COUNT * MAX_VERTICES;
		while (faceInd--) {
			geom.faces.push(new Face3(0, 0, 0));
			geom.faceVertexUvs[0][faceInd] = [new Vector2(), new Vector2(), new Vector2()];
		}
	
	
		for (let i = 0; i < MAX_VERTICES - 1; i++) {
			let item = startItem;
			let nextItem = startItem;
			this.setupGradientPart(i, geom, item, nextItem, nextItem);
		}
	
		var texture = TrendsGradientWidget.generateGradientTexture();
		var mesh = new THREE.Mesh(
			geom,
			new THREE.MeshBasicMaterial( {transparent: true, map: texture} )
		);
		mesh.position.z = -1;
		this.gradient = mesh;
		this.gradient.frustumCulled = false;
	}
	
	
	private updateGradient (newData: ITrendData) {
		var data = this.data;
		var startInd = data.length - newData.length;
		var endInd = data.length - 1;
		var startItem = newData[0];
	
		for (let ind = startInd; ind <= endInd; ind++) {
			let item = data[ind];
			let prevItem = data[ind - 1];
			if (!prevItem) continue;
			//let nextItem = {xVal: startItem.xVal + 5, yVal: startItem.yVal};
	
	
			this.setupGradientPart(ind, this.gradient.geometry as Geometry, prevItem, item, startItem);
		}
	}
	
	
	
	private setupGradientPart(
		partInd: number,
		gradientGeometry: Geometry,
		trendItem: ITrendItem,
		nextTrendItem: ITrendItem,
	    startItem: ITrendItem
	) {
	
		// gradient part scheme:
		//
		//           + vert5
		//          /|
		//         / | face3
		//        /  |
		// vert1 +---+ vert2
		//       |  /|
		// face2 | / | face1
		// 	     |/  |
		// vert4 +---+ vert3
	
	
		let {vertices, faces, faceVertexUvs} = gradientGeometry;
		let vertex = this.chartState.getPointOnChart(trendItem.xVal, trendItem.yVal);
		let nextVertex = this.chartState.getPointOnChart(nextTrendItem.xVal, nextTrendItem.yVal);
	
		// setup vertices
		let isRise = vertex.y < nextVertex.y;
		let vert1 = isRise ? vertex.clone() : new Vector3(vertex.x, nextVertex.y);
		let vert2 = isRise ? new Vector3(nextVertex.x, vertex.y) : nextVertex.clone();
		let vert3 = new Vector3(nextVertex.x, 0);
		let vert4 = new Vector3(vertex.x, 0);
		let vert5 = isRise ? nextVertex.clone() : vertex.clone();
		let vertInd1 = partInd * PART_VERTICES_COUNT;
		let vertInd2 = partInd * PART_VERTICES_COUNT + 1;
		let vertInd3 = partInd * PART_VERTICES_COUNT + 2;
		let vertInd4 = partInd * PART_VERTICES_COUNT + 3;
		let vertInd5 = partInd * PART_VERTICES_COUNT + 4;
	
		var hasEmptyVertices = (
			!vertices[vertInd1] ||
			!vertices[vertInd2] ||
			!vertices[vertInd3] ||
			!vertices[vertInd4] ||
			!vertices[vertInd5]
		);
	
		var verticesWasChanged = (
			hasEmptyVertices ||
			!vertices[vertInd1].equals(vert1) ||
			!vertices[vertInd2].equals(vert2) ||
			!vertices[vertInd3].equals(vert3) ||
			!vertices[vertInd4].equals(vert4) ||
			!vertices[vertInd5].equals(vert5)
		);
	
		// setup faces
		let faceInd1 = partInd * PART_FACES_COUNT;
		let faceInd2 = partInd * PART_FACES_COUNT + 1;
		let faceInd3 = partInd * PART_FACES_COUNT + 2;
		faces[faceInd1] = new Face3(vertInd4, vertInd3, vertInd2);
		faces[faceInd2] = new Face3(vertInd4, vertInd2, vertInd1);
		faces[faceInd3] = new Face3(vertInd1, vertInd2, vertInd5);
	
		// setup textures
		let gradientStartPos = vert1.y / this.chartState.data.height;
		let gradientEndPos = vert5.y / this.chartState.data.height;
		var uvs1 = faceVertexUvs[0][faceInd1];
		var uvs2 = faceVertexUvs[0][faceInd2];
		var uvs3 = faceVertexUvs[0][faceInd3];
		uvs1[0].set(0, 0); uvs1[1].set(1, 0); uvs1[2].set(1, gradientStartPos);
		uvs2[0].set(0, 0); uvs2[1].set(1, gradientStartPos); uvs2[2].set(0, gradientStartPos);
		uvs3[0].set(0, gradientStartPos); uvs3[1].set(1, gradientStartPos); uvs3[2].set(1, gradientEndPos);
	
	
		if (verticesWasChanged) {
			var animate = true;
			var animationOptions = this.chartState.data.animations
			var time = animationOptions.trendChangeSpeed;
			var ease = animationOptions.trendChangeEase;
			if (!animate || hasEmptyVertices) {
				vertices[vertInd1].set(vert1.x, vert1.y, 0);
				vertices[vertInd2].set(vert2.x, vert2.y, 0);
				vertices[vertInd3].set(vert3.x, vert3.y, 0);
				vertices[vertInd4].set(vert4.x, vert4.y, 0);
				vertices[vertInd5].set(vert5.x, vert5.y, 0);
				gradientGeometry.verticesNeedUpdate = true;
				gradientGeometry.uvsNeedUpdate = true;
			} else {
				if (isRise) {
					vertices[vertInd1].set(vert1.x, vert1.y, 0);
					vertices[vertInd2].set(vert1.x, vert1.y, 0);
					vertices[vertInd5].set(vert1.x, vert1.y, 0);
				} else {
					vertices[vertInd1].set(vert5.x, vert5.y, 0);
					vertices[vertInd2].set(vert5.x, vert5.y, 0);
					vertices[vertInd5].set(vert5.x, vert5.y, 0);
				}
				vertices[vertInd3].set(vert4.x, vert4.y, 0);
				vertices[vertInd4].set(vert4.x, vert4.y, 0);
	
				TweenLite.to(vertices[vertInd1], time, {x: vert1.x, y: vert1.y, ease: ease});
				TweenLite.to(vertices[vertInd2], time, {x: vert2.x, y: vert2.y, ease: ease});
				TweenLite.to(vertices[vertInd3], time, {x: vert3.x, y: vert3.y, ease: ease});
				TweenLite.to(vertices[vertInd4], time, {x: vert4.x, y: vert4.y, ease: ease});
				TweenLite.to(vertices[vertInd5], time, {x: vert5.x, y: vert5.y, ease: ease})
					.eventCallback('onUpdate', () => {
						gradientGeometry.verticesNeedUpdate = true;
						gradientGeometry.uvsNeedUpdate = true;
					});
			}
		}
	}
	
}