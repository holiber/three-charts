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
import { TrendSegmentsManager, ITrendSegmentState } from "../TrendSegmentsManager";
import LineSegments = THREE.LineSegments;
import {IScreenTransformOptions} from "../Screen";
import { ITrendOptions, TREND_TYPE } from '../Trend';
import { Utils } from '../Utils';

const MAX_DISPLAYED_SEGMENTS = 2000;

/**
 * widget for drawing trends lines
 */
export class TrendsLineWidget extends TrendsWidget<TrendLine> {
	static widgetName = "TrendsLine";
	protected getTrendWidgetClass() {
		return TrendLine;
	}
}

interface ILineSegment {
	ind: number,
	segmentId: number
}

export class TrendLine extends TrendWidget {
	private material: LineBasicMaterial;
	private lineSegments: LineSegments;
	private vertices: Vector3[];

	// contains indexes of free segments
	private freeSegmentsInds: number[] = [];

	// contains segments to display
	private displayedSegments: {[segmentId: number]: ILineSegment} = {};
	
	static widgetIsEnabled(trendOptions: ITrendOptions) {
		return trendOptions.enabled && trendOptions.type == TREND_TYPE.LINE;
	}
	
	constructor (chartState: ChartState, trendName: string) {
		super(chartState, trendName);
		var options = this.trend.getOptions();
		this.material = new LineBasicMaterial( { color: options.lineColor, linewidth: options.lineWidth } );
		this.initLine();
	}

	getObject3D() {
		return this.lineSegments;
	}

	protected bindEvents() {
		super.bindEvents();
		this.bindEvent(this.trend.segmentsManager.onRebuild(() => {
			this.destroySegments();
			this.setupSegments();
		}));
		this.bindEvent(this.trend.segmentsManager.onDisplayedRangeChanged(() => {
			this.setupSegments();
		}));
	}
	
	private initLine() {
		let geometry = new Geometry();
		let {scaleFactor: scaleXFactor, zoom: zoomX} = this.chartState.data.xAxis.range;
		let {scaleFactor: scaleYFactor, zoom: zoomY} = this.chartState.data.yAxis.range;
		this.lineSegments = new LineSegments(geometry, this.material);
		this.lineSegments.scale.set(scaleXFactor * zoomX, scaleYFactor * zoomY, 1);
		this.lineSegments.frustumCulled = false;
		for (let i = 0; i < MAX_DISPLAYED_SEGMENTS; i++) {
			geometry.vertices.push(new  Vector3(), new Vector3());
			this.freeSegmentsInds.push(i);
		}
		this.vertices = geometry.vertices;
		this.setupSegments();
	}

	private setupSegments() {
		let geometry = this.lineSegments.geometry as Geometry;

		let {firstDisplayedSegment, lastDisplayedSegment} = this.trend.segmentsManager;

		for (let segmentId in this.displayedSegments) {
			let lineSegment = this.displayedSegments[segmentId];
			let segment = this.trend.segmentsManager.segments[lineSegment.segmentId];
			let segmentIsNotDisplayed = (
				segment.startXVal < firstDisplayedSegment.startXVal ||
				segment.endXVal > lastDisplayedSegment.endXVal
			);
			if (segmentIsNotDisplayed) this.destroySegment(Number(segmentId));
		}

		let segment = firstDisplayedSegment;
		while (segment && segment.xVal <= lastDisplayedSegment.xVal) {
			this.setupSegment(segment.id, segment.currentAnimationState);
			segment = segment.getNext();
		}
		geometry.verticesNeedUpdate = true;

	}

	private setupSegment(segmentId: number, segmentState: ITrendSegmentState) {
		let lineSegment = this.displayedSegments[segmentId];
		if (!lineSegment) {
			if (this.freeSegmentsInds.length == 0) Utils.error('Max allocated segments reached');
			let ind = this.freeSegmentsInds.pop();
			lineSegment = this.displayedSegments[segmentId] = {segmentId, ind};
		}
		let segmentInd = lineSegment.ind;
		let lineStartVertex = this.vertices[segmentInd * 2];
		let lineEndVertex = this.vertices[segmentInd * 2 + 1];
		lineStartVertex.set(this.toLocalX(segmentState.startXVal), this.toLocalY(segmentState.startYVal), 0);
		lineEndVertex.set(this.toLocalX(segmentState.endXVal), this.toLocalY(segmentState.endYVal), 0);
	}

	private destroySegments() {
		for (let segmentId in this.displayedSegments) this.destroySegment(Number(segmentId));
	}

	private destroySegment(segmentId: number) {
		let lineSegment = this.displayedSegments[segmentId];
		let lineStartVertex = this.vertices[lineSegment.ind * 2];
		let lineEndVertex = this.vertices[lineSegment.ind * 2 + 1];
		lineStartVertex.set(0, 0, 0);
		lineEndVertex.set(0, 0, 0);
		delete this.displayedSegments[segmentId];
		this.freeSegmentsInds.push(lineSegment.ind);
	}


	protected onZoomFrame(options: IScreenTransformOptions) {
		var currentScale = this.lineSegments.scale;
		let state = this.chartState.data;
		let scaleXFactor = state.xAxis.range.scaleFactor;
		let scaleYFactor = state.yAxis.range.scaleFactor;
		if (options.zoomX) currentScale.setX(scaleXFactor * options.zoomX);
		if (options.zoomY) currentScale.setY(scaleYFactor * options.zoomY);
	}


	protected onSegmentsAnimate(trendSegments: TrendSegmentsManager) {
		var geometry = this.lineSegments.geometry as Geometry;
		for (let segmentId of trendSegments.animatedSegmentsIds) {
			if (!this.displayedSegments[segmentId]) continue;
			this.setupSegment(segmentId, trendSegments.segmentsById[segmentId].currentAnimationState);
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