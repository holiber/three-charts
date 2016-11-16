import Object3D = THREE.Object3D;
import Mesh = THREE.Mesh;
import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Vector3 = THREE.Vector3;

import {
	Utils,
	Chart,
	IChartState,
	TrendsWidget,
	TrendWidget,
	TrendSegment,
	TrendSegmentsManager,
	ITrendOptions,
	Animation,
	TREND_TYPE
} from 'three-charts';

const ANIMATION_TIME = 1000;
const ANIMATION_DELAY = 300;

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
	private animation: Animation<any>;

	static widgetIsEnabled(trendOptions: ITrendOptions) {
		return trendOptions.enabled && trendOptions.hasBeacon && trendOptions.type == TREND_TYPE.LINE;
	}

	constructor(chart: Chart, trendName: string) {
		super(chart, trendName);

		this.initObject();
		this.updatePosition();
	}

	getObject3D() {
		return this.mesh;
	}

	onTrendChange() {
		this.updatePosition();
		this.animate();
	}

	protected bindEvents() {
		super.bindEvents();
		this.bindEvent(this.chart.onScroll(() => this.updatePosition()));
	}

	private initObject() {

		// add beacon
		let light = this.mesh = new Mesh(
			new PlaneBufferGeometry(32, 32),
			new MeshBasicMaterial({map: TrendBeacon.createTexture(), transparent: true})
		);

		this.setInitialState();

		// add dot
		light.add(new Mesh(
			new PlaneBufferGeometry(5, 5),
			new MeshBasicMaterial({map: TrendBeacon.createTexture()})
		));

		this.segment = this.trend.segmentsManager.getEndSegment();
	}

	private animate() {
		if (!this.chart.state.animations.enabled) return;

		if (this.animation) this.animation.stop();
		this.setInitialState();

		let mesh = this.mesh;
		let animationObject = {
			scale: mesh.scale.x,
			opacity: mesh.material.opacity
		};

		this.animation = this.chart.animationManager
			.animate(ANIMATION_TIME)
			.withDelay(ANIMATION_DELAY)
			.from(animationObject)
			.to({scale: 1, opacity: 0})
			.onTick(animationObject => {
				mesh.scale.set(animationObject.scale, animationObject.scale, 1);
				mesh.material.opacity = animationObject.opacity
			}).then(() => {
				this.setInitialState();
			});
	}

	private setInitialState() {
		this.mesh.scale.set(0.2, 0.2, 1);
		this.mesh.material.opacity = 1;
	}

	onDestroy() {
		super.onDestroy();
		if (this.animation) this.animation.stop();
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
		this.segment = this.trend.segmentsManager.getEndSegment();
		this.updatePosition();
	}

	protected onSegmentsAnimate(trendsSegments: TrendSegmentsManager) {
		this.segment = trendsSegments.getEndSegment();
		this.updatePosition();
	}

	private updatePosition() {
		var chart = this.chart;
		var xVal: number, yVal: number;
		var currentAnimationState = this.segment.currentAnimationState;
		if (this.trend.getOptions().type == TREND_TYPE.LINE) {
			xVal = currentAnimationState.endXVal;
			yVal = currentAnimationState.endYVal;
		} else {
			xVal = currentAnimationState.xVal;
			yVal = currentAnimationState.endYVal;
		}
		let viewport = chart.interpolatedViewport;
		let x = viewport.getWorldXByVal(xVal);
		let y = viewport.getWorldYByVal(yVal);
		let screenWidth = chart.state.width;
		let screenX = viewport.getViewportXByWorldX(x);
		if (screenX < 0) {
			x = viewport.getLeft();
		}
		if (screenX > screenWidth) x = viewport.getRight();
		this.mesh.position.set(x, y, 0.1);
	}
}
