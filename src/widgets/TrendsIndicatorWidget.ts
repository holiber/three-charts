
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
		var canvasWidth = 80;
		var canvasHeight = 30;
		var color = new Color(this.trend.getOptions().lineColor);
		var texture = Utils.createTexture(canvasWidth, canvasHeight, (ctx) => {
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
			new THREE.PlaneGeometry(canvasWidth, canvasHeight),
			material
		);

	}

	onTrendChange() {
		let object = this.mesh;
		let trendData = this.trend.getData();
		var lastItem = trendData[trendData.length - 1];
		var geometry = this.mesh.geometry as PlaneGeometry;
		var canvasWidth = geometry.parameters.width;
		var canvasHeight = geometry.parameters.height;
		var texture = (this.mesh.material as MeshBasicMaterial).map;
		var ctx = texture.image.getContext('2d');
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		//ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		ctx.fillText(lastItem.yVal.toFixed(4), 0, 15);
		texture.needsUpdate = true;


		var position = this.chartState.getPointOnChart(lastItem.xVal, lastItem.yVal);
		position.x += canvasWidth / 2;
		position.y += canvasHeight / 2 + 10;

		var animation = this.chartState.data.animations;

		if (!animation.enabled) {
			object.position.set(position.x, position.y, 0);
			return
		}

		TweenLite.to(
			object.position,
			animation.trendChangeSpeed,
			{
				x: position.x,
				y: position.y,
				ease: animation.trendChangeEase
			}
		)

	}

}
