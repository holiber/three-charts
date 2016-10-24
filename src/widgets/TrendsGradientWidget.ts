import Geometry = THREE.Geometry;
import Mesh = THREE.Mesh;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import Object3D = THREE.Object3D;
import {Chart} from "../Chart";
import Face3 = THREE.Face3;
import Texture = THREE.Texture;
import Vector2 = THREE.Vector2;
import {ITrendOptions} from "../Trend";
import {Utils} from "../Utils";
import {TrendsWidget, TrendWidget} from "./TrendsWidget";
import PlaneGeometry = THREE.PlaneGeometry;
import { IScreenTransformOptions } from '../Screen';
import { TrendSegmentsManager, ITrendSegmentState } from '../TrendSegmentsManager';
import { ChartColor } from '../Color';

export class TrendsGradientWidget extends TrendsWidget<TrendGradient> {
	static widgetName = "TrendsGradient";
	protected getTrendWidgetClass() {
		return TrendGradient;
	}
}


export class TrendGradient extends TrendWidget {
	private gradient: Mesh;
	private visibleSegmentsCnt = 0;
	private segmentsIds: Uint16Array;
	
	static widgetIsEnabled(trendOptions: ITrendOptions) {
		return trendOptions.enabled && trendOptions.hasBackground;
	}

	constructor (chartState: Chart, trendName: string) {
		super(chartState, trendName);
		this.trend = chartState.trendsManager.getTrend(trendName);
		this.segmentsIds = new Uint16Array(chartState.state.maxVisibleSegments)
		this.initGradient();
		this.updateSegments();
	}


	protected bindEvents() {
		super.bindEvents();

		this.bindEvent(this.trend.segmentsManager.onRebuild(() => {
			this.updateSegments();
		}));
		this.bindEvent(this.trend.segmentsManager.onDisplayedRangeChanged(() => {
			// TODO: optimize updateSegments for onDisplayedRangeChanged
			this.updateSegments();
		}));
		this.bindEvent(this.chart.onZoom(() => {
			this.updateSegments();
		}));
	}


	getObject3D(): Object3D {
		return this.gradient;
	}


	initGradient() {
		let geometry = new Geometry();


		for (let i = 0; i < this.segmentsIds.length; i++) {
			geometry.vertices.push(
				new THREE.Vector3(),
				new THREE.Vector3(),
				new THREE.Vector3(),
				new THREE.Vector3()
			);
			let ind = i * 4;

			// gradient segment scheme
			//
			// vert0 +---+ vert3
			//       |\  |
			// face1 | \ | face2
			// 	     |  \|
			// vert1 +---+ vert2

			geometry.faces.push(
				new THREE.Face3( ind, ind + 1, ind + 2 ),
				new THREE.Face3( ind + 3, ind, ind + 2 )
			);
		}

		let color = new ChartColor(this.trend.getOptions().backgroundColor);
		this.gradient = new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( {color: color.value, transparent: true, opacity: color.a} )
		);

		let {scaleFactor: scaleXFactor, zoom: zoomX} = this.chart.state.xAxis.range;
		let {scaleFactor: scaleYFactor, zoom: zoomY} = this.chart.state.yAxis.range;
		this.gradient.scale.set(scaleXFactor * zoomX, scaleYFactor * zoomY, 1);
		this.gradient.frustumCulled = false;
	}


	protected onZoomFrame(options: IScreenTransformOptions) {
		let state = this.chart.state;
		let scaleXFactor = state.xAxis.range.scaleFactor;
		let scaleYFactor = state.yAxis.range.scaleFactor;
		var currentScale = this.gradient.scale;
		if (options.zoomX) currentScale.setX(scaleXFactor * options.zoomX);
		if (options.zoomY) currentScale.setY(scaleYFactor * options.zoomY);
	}


	protected onSegmentsAnimate(trendSegmentsManager: TrendSegmentsManager) {
		let animatedSegmentsIds = trendSegmentsManager.animatedSegmentsIds;
		for (let i = 0; i < this.visibleSegmentsCnt; i++) {
			let segmentId = this.segmentsIds[i];
			if (!animatedSegmentsIds.includes(segmentId)) continue;
			this.setupSegmentVertices(i, trendSegmentsManager.getSegment(segmentId).currentAnimationState);
		}
		(this.gradient.geometry as PlaneGeometry).verticesNeedUpdate = true;
	}


	private updateSegments() {
		let geometry = this.gradient.geometry as PlaneGeometry;
		let {
			segments: trendSegments,
			firstDisplayedSegmentInd: segmentInd,
			lastDisplayedSegmentInd
		} = this.trend.segmentsManager;
		let prevVisibleSegmentsCnt = this.visibleSegmentsCnt;
		this.visibleSegmentsCnt = lastDisplayedSegmentInd - segmentInd + 1;
		let segmentsToProcessCnt = Math.max(prevVisibleSegmentsCnt, this.visibleSegmentsCnt);

		if (segmentsToProcessCnt > this.segmentsIds.length) {
			Utils.error(TrendsGradientWidget.widgetName + ': MAX_SEGMENTS reached');
		}

		// setup visible segments and collapse invisible
		for (let i = 0; i <= segmentsToProcessCnt; i++) {
			if (segmentInd <= lastDisplayedSegmentInd) {
				let segment = trendSegments[segmentInd];
				this.setupSegmentVertices(i, segment.currentAnimationState);
				this.segmentsIds[i] = segment.id;
				segmentInd++;
			} else {
				this.setupSegmentVertices(i);
			}
		}

		geometry.verticesNeedUpdate = true;
	}


	/**
	 * setup gradient segment by segmentState
	 * if segmentState is undefined, then collapse vertices to 0,0,0
	 */
	private setupSegmentVertices(segmentInd: number, segmentState?: ITrendSegmentState) {
		let gradientSegmentInd = segmentInd * 4;
		let vertices = (this.gradient.geometry as PlaneGeometry).vertices;
		let	topLeft = vertices[gradientSegmentInd];
		let	bottomLeft = vertices[gradientSegmentInd + 1];
		let	bottomRight = vertices[gradientSegmentInd + 2];
		let	topRight = vertices[gradientSegmentInd + 3];
		let screenHeightVal = Math.max(
			this.chart.pxToValueByYAxis(this.chart.state.height),
			this.chart.screen.pxToValueByYAxis(this.chart.state.height)
		);

		if (segmentState) {
			let startX = this.toLocalX(segmentState.startXVal);
			let startY = this.toLocalY(segmentState.startYVal);
			let endX = this.toLocalX(segmentState.endXVal);
			let endY = this.toLocalY(segmentState.endYVal);
			topLeft.set(startX, startY, 0);
			topRight.set(endX, endY, 0);
			bottomLeft.set(topLeft.x, topLeft.y - screenHeightVal, 0);
			bottomRight.set(topRight.x, topRight.y - screenHeightVal, 0);
		} else {
			topLeft.set(0, 0, 0);
			topRight.set(0, 0, 0);
			bottomLeft.set(0, 0, 0);
			bottomRight.set(0, 0, 0);
		}

	}

	private toLocalX(xVal: number): number {
		return xVal - this.chart.state.xAxis.range.zeroVal;
	}


	private toLocalY(yVal: number): number {
		return yVal - this.chart.state.yAxis.range.zeroVal;
	}

}
