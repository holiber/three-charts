

import { TrendsWidget, TrendWidget } from './TrendsWidget';
import { Chart } from '../Chart';
import Object3D = THREE.Object3D;
import Geometry = THREE.Geometry;
import { IViewportParams } from '../Viewport';
import { TrendSegmentsManager, ITrendSegmentState } from '../TrendSegmentsManager';
import Vector3 = THREE.Vector3;
import Mesh = THREE.Mesh;
import Line = THREE.Line;
import BoxGeometry = THREE.BoxGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import PlaneGeometry = THREE.PlaneGeometry;
import { TREND_TYPE, ITrendOptions } from '../Trend';
import LineBasicMaterial = THREE.LineBasicMaterial;
import remove = THREE.Cache.remove;
import { Utils } from '../Utils';


const RISE_COLOR = 0x2CAC40;
const FALL_COLOR = 0xEE5533;
const MARGIN_PERCENT = 0.3;
const MAX_CANDLES = 100;

/**
 * widget for drawing trends candles
 */
export class TrendsCandlesWidget extends TrendsWidget<TrendCandlesWidget> {
	static widgetName = "TrendsCandles";
	protected getTrendWidgetClass() {
		return TrendCandlesWidget;
	}
}


export class TrendCandlesWidget extends TrendWidget {
	private scaleXFactor: number;
	private scaleYFactor: number;
	private object3D: Object3D;
	
	// contains indexes of free candles
	private freeCandlesInds: number[] = [];
	private candlesPool: CandleWidget[] = [];
	private candles: {[segmentId: number]: CandleWidget} = {};

	static widgetIsEnabled(trendOptions: ITrendOptions) {
		return trendOptions.enabled && trendOptions.type == TREND_TYPE.CANDLE;
	}

	constructor (chartState: Chart, trendName: string) {
		super(chartState, trendName);
		this.initObject();
	}


	getObject3D() {
		return this.object3D;
	}

	protected bindEvents() {
		super.bindEvents();
		this.bindEvent(this.trend.segmentsManager.onRebuild(() => {
			this.destroyCandles();
			this.setupCandles();
		}));
		this.bindEvent(this.trend.segmentsManager.onDisplayedRangeChanged(() => {
			this.setupCandles();
		}));
	}
	
	private initObject() {
		let stateData = this.chart.state;
		let {scaleFactor: scaleXFactor, zoom: zoomX} = stateData.xAxis.range;
		let {scaleFactor: scaleYFactor, zoom: zoomY} = stateData.yAxis.range;
		this.scaleXFactor = scaleXFactor;
		this.scaleYFactor = scaleYFactor;
		this.object3D = new Object3D();
		this.object3D.scale.set(scaleXFactor * zoomX, scaleYFactor * zoomY, 1);
		this.object3D.frustumCulled = false;
		for (let i = 0; i < MAX_CANDLES; i++) this.freeCandlesInds.push(i);
		this.setupCandles();
	}

	private setupCandles() {

		// remove invisible
		let {firstDisplayedSegment, lastDisplayedSegment} = this.trend.segmentsManager;

		for (let segmentId in this.candles) {
			let segment = this.candles[segmentId].segment;
			let segmentIsNotDisplayed = (
				segment.startXVal < firstDisplayedSegment.startXVal ||
				segment.endXVal > lastDisplayedSegment.endXVal
			);
			if (segmentIsNotDisplayed) this.destroyCandle(Number(segmentId));
		}

		let segment = firstDisplayedSegment;
		while (segment && segment.xVal <= lastDisplayedSegment.xVal) {
			this.setupCandle(segment.id, segment.currentAnimationState);
			segment = segment.getNext();
		}
	}

	private destroyCandles() {
		for (let segmentId in this.candles) this.destroyCandle(Number(segmentId));
	}

	private destroyCandle(segmentId: number) {
		let candle = this.candles[segmentId];
		this.object3D.remove(candle.getObject3D());
		delete this.candles[segmentId];
	}

	protected onZoomFrame(options: IViewportParams) {
		var currentScale = this.object3D.scale;
		if (options.zoomX) currentScale.setX(this.scaleXFactor * options.zoomX);
		if (options.zoomY) currentScale.setY(this.scaleYFactor * options.zoomY);
	}

	protected onSegmentsAnimate(trendSegments: TrendSegmentsManager) {
		for (let segmentId of trendSegments.animatedSegmentsIds) {
			if (!this.candles[segmentId]) continue;
			let segmentState = trendSegments.segmentsById[segmentId].currentAnimationState;
			this.setupCandle(segmentId, segmentState);
		}
	}

	/**
	 * create or modify candle
	 */
	private setupCandle(candleId: number, segmentState: ITrendSegmentState) {
		let candleInd = candleId % MAX_CANDLES;

		// get candle from candlesPool to avoid creating new Objects by performance reasons
		let candle = this.candlesPool[candleInd];
		if (!candle) {
			candle = this.candlesPool[candleInd] = new CandleWidget();
		}

		if (!this.candles[candleId]) {
			this.candles[candleId] = candle;
			this.object3D.add(candle.getObject3D());
		}
		candle.getObject3D().position.set(this.toLocalX(segmentState.xVal), this.toLocalY(segmentState.yVal), 0);
		candle.setSegment(segmentState);
	}

	toLocalX(xVal: number): number {
		return xVal - this.chart.state.xAxis.range.zeroVal;
	}

	toLocalY(yVal: number): number {
		return yVal - this.chart.state.yAxis.range.zeroVal;
	}

	toLocalVec(vec: Vector3): Vector3 {
		return new Vector3(this.toLocalX(vec.x), this.toLocalY(vec.y), 0);
	}
}

class CandleWidget {
	segment: ITrendSegmentState;
	private rect: Mesh;
	private vLine: Line;
	private hLine: Line;
	constructor () {
		this.initObject();
	}

	getObject3D(): Object3D {
		return this.rect;
	}

	setSegment(segment: ITrendSegmentState) {
		this.segment = segment;
		let color = segment.endYVal < segment.startYVal ? FALL_COLOR : RISE_COLOR;

		// update rect
		let geometry = this.rect.geometry as PlaneGeometry;
		let material = this.rect.material as MeshBasicMaterial;
		let width = segment.endXVal - segment.startXVal;
		width -= width * MARGIN_PERCENT;
		let height = Math.max(segment.startYVal, segment.endYVal) - Math.min(segment.startYVal, segment.endYVal);
		let [leftTop, rightTop, leftBottom, rightBottom] = geometry.vertices;
		leftTop.set(-width / 2, height / 2, 0);
		rightTop.set(width / 2, height / 2, 0);
		leftBottom.set(-width / 2, -height / 2, 0);
		rightBottom.set(width / 2, -height / 2, 0);

		// // prevent to draw bars with height < 1px
		// if (Utils.getDistance(leftTop.y, leftBottom.y) < 1) {
		// 	leftBottom.setY(leftBottom.y + 1);
		// 	rightBottom.setY(rightBottom.y + 1);
		// }

		material.color.set(color);
		geometry.verticesNeedUpdate = true;

		// update lines
		let vLineGeometry = this.vLine.geometry as Geometry;
		let vLineMaterial = this.vLine.material as LineBasicMaterial;
		let lineTop = segment.maxYVal - segment.yVal;
		let lineBottom = segment.minYVal - segment.yVal;
		vLineGeometry.vertices[0].set(0, lineTop, 0);
		vLineGeometry.vertices[1].set(0, lineBottom, 0);
		vLineMaterial.color.set(color);
		vLineGeometry.verticesNeedUpdate = true;

		let hLineGeometry = this.hLine.geometry as Geometry;
		let hLineMaterial = this.hLine.material as LineBasicMaterial;
		let lineLeft = (-width) / 2;
		let lineRight = width / 2;
		hLineGeometry.vertices[0].set(lineLeft, 0, 0);
		hLineGeometry.vertices[1].set(lineRight, 0, 0);
		hLineMaterial.color.set(color);
		hLineGeometry.verticesNeedUpdate = true;

	}

	private initObject() {
		this.rect = new Mesh(
			new PlaneGeometry(1, 1),
			new MeshBasicMaterial({side: THREE.DoubleSide})
		);
		let vLineGeometry = new Geometry();
		let hLineGeometry = new Geometry();
		vLineGeometry.vertices.push(new Vector3(), new Vector3);
		hLineGeometry.vertices.push(new Vector3(), new Vector3);
		this.vLine = new Line(vLineGeometry, new LineBasicMaterial({linewidth: 1}));
		this.hLine = new Line(hLineGeometry, new LineBasicMaterial({linewidth: 1}));
		this.rect.add(this.vLine);
		this.rect.add(this.hLine);
	}
}
