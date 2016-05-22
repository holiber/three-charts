
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import {Utils} from "../Utils";
import Mesh = THREE.Mesh;
import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Vector3 = THREE.Vector3;
import {TrendWidget, TrendsWidget} from "./TrendsWidget";
import {ITrendOptions} from "../Trend";
import {TrendAnimationState, TrendPoint} from "../TrendsAnimationManager";

/**
 * widget adds blinking beacon on trends end
 * activated when trend.hasBeacon = true
 */
export class TrendsBeaconWidget extends TrendsWidget<TrendBeacon> {
	static widgetName = 'trendsBeacon';
	protected getTrendWidgetClass() {
		return TrendBeacon;
	}
}

class TrendBeacon extends TrendWidget {
	private mesh: Mesh;
	private animated: boolean;
	private point: TrendPoint;

	static widgetIsEnabled(trendOptions: ITrendOptions) {
		return trendOptions.enabled && trendOptions.hasBeacon;
	}

	constructor(state: ChartState, trendName: string) {
		super(state, trendName);
		this.animated = state.data.animations.enabled;

		this.initObject();
		if (this.animated) {
			this.animate();
		}
	}

	getObject3D() {
		return this.mesh;
	}
	protected bindEvents() {
		this.bindEvent(this.chartState.onScroll(() => this.updatePosition()));
	}

	private initObject() {
		
		// add beacon
		let light = this.mesh = new Mesh(
			new PlaneBufferGeometry(32, 32),
			new MeshBasicMaterial({map: TrendBeacon.createTexture(), transparent: true})
		);
		
		if (this.animated) {
			light.scale.set(0.1, 0.1, 1);
		} else {
			light.scale.set(0.2, 0.2, 1);
		}

		// add dot
		light.add(new Mesh(
			new PlaneBufferGeometry(5, 5),
			new MeshBasicMaterial({map: TrendBeacon.createTexture()})
		));
	

	}

	private animate() {
		var object = this.mesh;
		var animationObject = {
			scale: object.scale.x,
			opacity: object.material.opacity
		};

		setTimeout(() => {
			var animation = TweenLite.to(
				animationObject,
				1,
				{scale: 1, opacity: 0}
			).eventCallback('onUpdate', () => {
				object.scale.set(animationObject.scale, animationObject.scale, 1);
				object.material.opacity = animationObject.opacity
			}).eventCallback('onComplete', () => {
				animation.restart();
			});
		}, 500);
	
	}

	private static createTexture() {
		var h = 32, w = 32;
		return Utils.createTexture(h, w, (ctx: CanvasRenderingContext2D) => {
			ctx.beginPath();
			ctx.arc(w / 2, h / 2, w / 2, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'white';
			ctx.fill();
		});
	}

	protected onTrendAnimate(animationState: TrendAnimationState) {
		// set new widget position
		this.point = animationState.getEndPoint();
		this.updatePosition();
	}

	private updatePosition() {
		var endPointVector = this.point.getCurrentVec();
		var screenWidth = this.chartState.data.width;
		var x = endPointVector.x;
		var screenX = this.chartState.getScreenXByPoint(endPointVector.x);
		if (screenX < 0) x = this.chartState.getPointByScreenX(0);
		if (screenX > screenWidth) x = this.chartState.getPointByScreenX(screenWidth);
		this.mesh.position.set(x, endPointVector.y, 0);
	}
}
