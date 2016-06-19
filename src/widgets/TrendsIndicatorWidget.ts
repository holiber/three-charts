
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import {Utils} from "../Utils";
import Mesh = THREE.Mesh;
import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Vector3 = THREE.Vector3;
import {TrendWidget, TrendsWidget} from "./TrendsWidget";
import {ITrendOptions} from "../Trend";
import PlaneGeometry = THREE.PlaneGeometry;
import Color = THREE.Color;
import {TrendSegments, TrendSegment} from "../TrendSegments.ts";

const CANVAS_WIDTH = 128;
const CANVAS_HEIGHT = 64;
const OFFSET_X = 15;

export class TrendsIndicatorWidget extends TrendsWidget<TrendIndicator> {
	static widgetName = 'TrendsIndicator';
	protected getTrendWidgetClass() {
		return TrendIndicator;
	}
}

export class TrendIndicator extends TrendWidget {
	private mesh: Mesh;
	private segment: TrendSegment;

	static widgetIsEnabled(trendOptions: ITrendOptions) {
		return trendOptions.enabled && trendOptions.hasIndicator;
	}

	constructor(state: ChartState, trendName: string) {
		super(state, trendName);
		this.initObject();
		this.onTrendChange();
	}

	getObject3D() {
		return this.mesh;
	}

	onTrendChange() {
		// update canvas value
		let trendData = this.trend.getData();
		var lastItem = trendData[trendData.length - 1];
		var texture = (this.mesh.material as MeshBasicMaterial).map;
		var ctx = texture.image.getContext('2d');
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		// uncomment to preview indicator rect
		// ctx.fillStyle = "rgba(255,255,255,0.5)";
		// ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		ctx.fillText(lastItem.yVal.toFixed(4), 0, 15);
		texture.needsUpdate = true;
	}

	private initObject() {
		var color = new Color(this.trend.getOptions().lineColor);
		var texture = Utils.createPixelPerfectTexture(CANVAS_WIDTH, CANVAS_HEIGHT, (ctx) => {
			ctx.beginPath();
			ctx.font = "15px Arial";
			ctx.fillStyle = color.getStyle();
			ctx.strokeStyle = "rgba(255,255,255,0.95)";
		});

		var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.FrontSide} );
		material.transparent = true;

		this.mesh = new Mesh(
			new THREE.PlaneGeometry(CANVAS_WIDTH, CANVAS_HEIGHT),
			material
		);
	}

	protected onTransformationFrame() {
		// set new widget position
		this.segment = this.trend.segments.getEndSegment();
		this.updatePosition();
	}

	protected onPointsMove(animationState: TrendSegments) {
		// set new widget position
		this.segment = animationState.getEndSegment();
		this.updatePosition();
	}

	private updatePosition() {
		var state = this.chartState;
		var {endXVal: segmentEndXVal, endYVal: segmentEndYVal} = this.segment.currentAnimationState;
		var endPointVector = state.screen.getPointOnChart(segmentEndXVal, segmentEndYVal);
		var screenWidth = state.data.width;
		var x = endPointVector.x + OFFSET_X;
		var y = endPointVector.y;
		
		var screenX = state.screen.getScreenXByPoint(endPointVector.x);
		var indicatorIsOutOfScreen = screenX < 0 || screenX > screenWidth;
		if (indicatorIsOutOfScreen) {
			if (screenX < 0) x = state.screen.getPointByScreenX(0) + 20;
			if (screenX > screenWidth) x = state.screen.getPointByScreenX(screenWidth) - CANVAS_WIDTH / 2 - 10;
			y -= 25;
		}
		this.mesh.position.set(x + CANVAS_WIDTH / 2, y + CANVAS_HEIGHT / 2  - 30, 0.1);
	}

	
}
