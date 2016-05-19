
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
import {TrendAnimationState} from "../TrendsAnimationManager";

const CANVAS_WIDTH = 80;
const CANVAS_HEIGHT = 30;

export class TrendsIndicatorWidget extends TrendsWidget<TrendIndicator> {
	static widgetName = 'trendsIndicator';
	protected getTrendWidgetClass() {
		return TrendIndicator;
	}
}

class TrendIndicator extends TrendWidget {
	private mesh: Mesh;

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

	private initObject() {
		var color = new Color(this.trend.getOptions().lineColor);
		var texture = Utils.createTexture(CANVAS_WIDTH, CANVAS_HEIGHT, (ctx) => {
			ctx.beginPath();
			ctx.font = "15px Arial";
			ctx.fillStyle = color.getStyle();
			ctx.strokeStyle = "rgba(255,255,255,0.95)";
			ctx.fillText('1.5673', 0, 10);
		});

		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;

		var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.FrontSide} );
		material.transparent = true;

		this.mesh = new Mesh(
			new THREE.PlaneGeometry(CANVAS_WIDTH, CANVAS_HEIGHT),
			material
		);

	}

	onTrendChange() {
		// update canvas value
		let trendData = this.trend.getData();
		var lastItem = trendData[trendData.length - 1];
		var texture = (this.mesh.material as MeshBasicMaterial).map;
		var ctx = texture.image.getContext('2d');
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		ctx.fillText(lastItem.yVal.toFixed(4), 0, 15);
		texture.needsUpdate = true;
	}

	protected onTrendAnimate(animationState: TrendAnimationState) {
		// set new widget position
		var lastInd = this.trend.getData().length - 1;
		var newX = animationState.current['x' + lastInd];
		var newY = animationState.current['y' + lastInd];
		if (newX !== void 0) {
			this.mesh.position.x = newX + CANVAS_WIDTH / 2;
		}
		if (newY !== void 0) {
			this.mesh.position.y = newY + CANVAS_HEIGHT / 2 + 10;;
		}
	}


}
