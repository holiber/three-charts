import Object3D = THREE.Object3D;
import Mesh = THREE.Mesh;
import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Vector3 = THREE.Vector3;
import { TrendWidget, TrendsWidget, ITrendOptions, TREND_TYPE, Chart, Utils } from 'three-charts';

/**
 * widget adds loading indicator
 * activated when animations enabled
 */
export class TrendsLoadingWidget extends TrendsWidget<TrendLoading> {
	static widgetName = 'TrendsLoading';

	protected getTrendWidgetClass() {
		return TrendLoading;
	}
}

export class TrendLoading extends TrendWidget {
	private mesh: Mesh;
	private animation: TweenLite;
	private isActive = false;

	static widgetIsEnabled(trendOptions: ITrendOptions, chart: Chart) {
		return trendOptions.enabled && chart.state.animations.enabled;
	}

	constructor(chart: Chart, trendName: string) {
		super(chart, trendName);
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
		super.bindEvents();
		this.bindEvent(this.trend.onPrependRequest(() => this.activate()));
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
		this.isActive = true;
		this.updatePosition();
	}

	private deactivate() {
		this.animation && this.animation.kill();
		this.mesh.material.opacity = 0;
		this.isActive = false;
	}


	private static createTexture() {
		var h = 64, w = 64;
		return Utils.createTexture(h, w, (ctx: CanvasRenderingContext2D) => {
			ctx.strokeStyle = "rgba(255,255,255,0.95)";
			ctx.lineWidth = 5;
			var center = h / 2;
			ctx.beginPath();

			ctx.arc(center, center, 22, 0, Math.PI / 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(center, center, 22, Math.PI, Math.PI + Math.PI / 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(center, center, 3, 0, Math.PI * 2);
			ctx.stroke();
		});
	}

	protected onZoomFrame() {
		this.updatePosition();
	}

	private updatePosition() {
		if (!this.isActive) return;
		let trend = this.trend;
		// set new widget position
		let segment = trend.segmentsManager.getStartSegment();
		let x: number, y: number;
		if (trend.getOptions().type == TREND_TYPE.LINE) {
			x = segment.currentAnimationState.startXVal;
			y = segment.currentAnimationState.startYVal;
		} else {
			x = segment.currentAnimationState.xVal - segment.maxLength;
			y = segment.currentAnimationState.yVal
		}
		let viewport = this.chart.interpolatedViewport;
		this.mesh.position.set(viewport.getWorldXByVal(x), viewport.getWorldYByVal(y), 0);
	}
}
