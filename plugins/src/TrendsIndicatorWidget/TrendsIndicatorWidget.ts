import Object3D = THREE.Object3D;
import Mesh = THREE.Mesh;
import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Vector3 = THREE.Vector3;
import PlaneGeometry = THREE.PlaneGeometry;
import {
	TrendSegmentsManager,
	TrendSegment,
	Color,
	Chart,
	Utils,
	TrendWidget,
	TrendsWidget,
	ITrendOptions
} from "three-charts";

const CANVAS_WIDTH = 150;
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

	constructor(chart: Chart, trendName: string) {
		super(chart, trendName);
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
			ctx.fillStyle = color.rgbaStr;
			ctx.strokeStyle = "rgba(255,255,255,0.95)";
		});

		var material = new THREE.MeshBasicMaterial({map: texture, side: THREE.FrontSide});
		material.transparent = true;

		this.mesh = new Mesh(
			new THREE.PlaneGeometry(CANVAS_WIDTH, CANVAS_HEIGHT),
			material
		);
	}

	protected onTransformationFrame() {
		// set new widget position
		this.segment = this.trend.segmentsManager.getEndSegment();
		this.updatePosition();
	}

	protected onSegmentsAnimate(segments: TrendSegmentsManager) {
		// set new widget position
		this.segment = segments.getEndSegment();
		this.updatePosition();
	}

	private updatePosition() {
		var chart = this.chart;
		var {endXVal: segmentEndXVal, endYVal: segmentEndYVal} = this.segment.currentAnimationState;
		var endPointVector = chart.screen.getPointOnChart(segmentEndXVal, segmentEndYVal);
		var screenWidth = chart.state.width;
		var x = endPointVector.x + OFFSET_X;
		var y = endPointVector.y;

		var screenX = chart.screen.getScreenXByPoint(endPointVector.x);
		var indicatorIsOutOfScreen = screenX < 0 || screenX > screenWidth;
		if (indicatorIsOutOfScreen) {
			if (screenX < 0) x = chart.screen.getPointByScreenX(0) + 20;
			if (screenX > screenWidth) x = chart.screen.getPointByScreenX(screenWidth) - CANVAS_WIDTH / 2 - 10;
			y -= 25;
		}
		this.mesh.position.set(x + CANVAS_WIDTH / 2, y + CANVAS_HEIGHT / 2 - 30, 0.1);
	}


}
