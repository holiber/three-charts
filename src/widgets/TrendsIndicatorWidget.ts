
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
import {TrendPoints, TrendPoint} from "../TrendPoints";

const CANVAS_WIDTH = 128;
const CANVAS_HEIGHT = 64;

export class TrendsIndicatorWidget extends TrendsWidget<TrendIndicator> {
	static widgetName = 'trendsIndicator';
	protected getTrendWidgetClass() {
		return TrendIndicator;
	}
}

class TrendIndicator extends TrendWidget {
	private mesh: Mesh;
	private point: TrendPoint;

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
	
	protected bindEvents() {
		this.bindEvent(this.chartState.onScroll(() => this.updatePosition()));
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

	protected onTrendAnimate(animationState: TrendPoints) {
		// set new widget position
		this.point = animationState.getEndPoint();
		this.updatePosition();
	}

	private updatePosition() {
		var endPointVector = this.point.getCurrentVec();
		var screenWidth = this.chartState.data.width;
		var x = endPointVector.x;
		var y = endPointVector.y;
		var screenX = this.chartState.getScreenXByPoint(endPointVector.x);
		if (screenX < 0 || screenX > screenWidth) {
			if (screenX < 0) x = this.chartState.getPointByScreenX(0) + 20;
			if (screenX > screenWidth) x = this.chartState.getPointByScreenX(screenWidth) - CANVAS_WIDTH / 2 - 10;
			y -= 25;
		}
		this.mesh.position.set(x + CANVAS_WIDTH / 2, y + CANVAS_HEIGHT / 2  - 30, 0);
	}

	
}
