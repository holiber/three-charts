
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import {Utils} from "../Utils";
import Mesh = THREE.Mesh;
import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Vector3 = THREE.Vector3;
import {TrendWidget, TrendsWidget} from "./TrendsWidget";
import { ITrendOptions, TREND_TYPE } from "../Trend";
import {TrendSegments, TrendSegment} from "../TrendSegments.ts";
import chartreuse = THREE.ColorKeywords.chartreuse;

/**
 * widget adds blinking beacon on trends end
 * activated when trend.hasBeacon = true
 */
export class TrendsBeaconWidget extends TrendsWidget<TrendBeacon> {
	static widgetName = 'TrendsBeacon';
	protected getTrendWidgetClass() {
		return TrendBeacon;
	}
}

export class TrendBeacon extends TrendWidget {
	private mesh: Mesh;
	private animated: boolean;
	private segment: TrendSegment;

	static widgetIsEnabled(trendOptions: ITrendOptions) {
		return trendOptions.enabled && trendOptions.hasBeacon && trendOptions.type == TREND_TYPE.LINE;
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

	onTrendChange() {
		this.updatePosition();
	}

	protected bindEvents() {
		super.bindEvents();
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

	protected onTransformationFrame() {
		this.segment = this.trend.segments.getEndSegment();
		this.updatePosition();
	}

	protected onPointsMove(trendPoints: TrendSegments) {
		this.segment = trendPoints.getEndSegment();
		this.updatePosition();
	}

	private updatePosition() {
		var state = this.chartState;
		var xVal: number, yVal: number;
		var currentAnimationState =  this.segment.currentAnimationState;
		if (this.trend.getOptions().type == TREND_TYPE.LINE) {
			xVal = currentAnimationState.endXVal;
			yVal = currentAnimationState.endYVal;
		} else {
			xVal = currentAnimationState.xVal;
			yVal = currentAnimationState.endYVal;
		}
		var endPointVector = state.screen.getPointOnChart(xVal, yVal);
		var screenWidth = state.data.width;
		var x = endPointVector.x;
		var screenX = state.screen.getScreenXByPoint(endPointVector.x);
		if (screenX < 0) x = state.screen.getPointByScreenX(0);
		if (screenX > screenWidth) x = state.screen.getPointByScreenX(screenWidth);
		this.mesh.position.set(x, endPointVector.y, 0.1);
	}
}
