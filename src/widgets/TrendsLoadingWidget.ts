
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import {Utils} from "../Utils";
import Mesh = THREE.Mesh;
import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Vector3 = THREE.Vector3;
import {TrendWidget, TrendsWidget} from "./TrendsWidget";
import {ITrendOptions} from "../Trend";
import {TrendAnimationState} from "../TrendsAnimationManager";

/**
 * widget adds loading indicator
 * activated when animations enabled
 */
export class TrendsLoadingWidget extends TrendsWidget<TrendLoading> {
	static widgetName = 'trendsLoading';
	protected getTrendWidgetClass() {
		return TrendLoading;
	}
}

class TrendLoading extends TrendWidget {
	private mesh: Mesh;
	private animation: TweenLite;

	static widgetIsEnabled(trendOptions: ITrendOptions, chartState: ChartState) {
		return trendOptions.enabled && chartState.data.animations.enabled;
	}

	constructor(state: ChartState, trendName: string) {
		super(state, trendName);
		// add beacon
		this.mesh = new Mesh(
			new PlaneBufferGeometry(32, 32),
			new MeshBasicMaterial({map: TrendLoading.createTexture(), transparent: true})
		);
		this.deactivate();
	}

	getObject3D() {
		return this.mesh;
	}
	
	bindEvents() {
		this.bindEvent(this.trend.onPrependRequest(() => this.activate()))
	}

	prependData() {
		this.deactivate();
	}

	private activate() {
		var mesh = this.mesh;
		mesh.material.opacity = 1;
		mesh.rotation.z = 0;
		var animation = TweenLite.to(this.mesh.rotation, 0.5, {z: Math.PI * 2});
		animation.eventCallback('onComplete', () => {
			animation.restart();
		});
		this.animation = animation;
	}

	private deactivate() {
		this.animation && this.animation.kill();
		this.mesh.material.opacity = 0;
	}


	private static createTexture() {
		var h = 64, w = 64;
		return Utils.createTexture(h, w, (ctx: CanvasRenderingContext2D) => {
			ctx.strokeStyle = "rgba(255,255,255,0.95)";
			ctx.lineWidth = 5;
			var center = h/2;
			ctx.beginPath();

			ctx.arc(center, center, 22, 0,Math.PI/ 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(center, center, 22, Math.PI, Math.PI + Math.PI/2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(center, center, 3, 0, Math.PI * 2);
			ctx.stroke();
		});
	}
	
	protected onTrendAnimate(animationState: TrendAnimationState) {
		// set new widget position
		var pointVector = animationState.getStartPoint().getCurrentVec();
		this.mesh.position.set(pointVector.x, pointVector.y, 0);
	
	}
}
