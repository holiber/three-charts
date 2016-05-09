
import {ChartWidget} from "../Widget";
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import {Utils} from "../Utils";
import Mesh = THREE.Mesh;
import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import {ITrendOptions} from "../Chart";
import {ITrendData} from "./TrendLineWidget";
import Vector3 = THREE.Vector3;

export class BeaconWidget extends ChartWidget {
	static widgetName = 'Beacon';
	private object3D: Mesh;
	private animated: boolean;

	constructor(state: ChartState) {
		super(state);
		this.animated = state.data.animations.enabled;
		this.initObject();
		if (this.animated) {
			this.animate();
		}
		this.onTrendChange(state.data.trend.data);
		state.onTrendChange((to: ITrendOptions, data: ITrendData) => this.onTrendChange(data));

	}

	getObject3D() {
		return this.object3D;
	}

	private initObject() {

		// add beacon
		this.object3D = new Mesh(
			new PlaneBufferGeometry(32, 32),
			new MeshBasicMaterial({map: BeaconWidget.createTexture(), transparent: true})
		);
		if (this.animated) {
			this.object3D.scale.set(0.1, 0.1, 1);
		} else {
			this.object3D.scale.set(0.2, 0.2, 1);
		}

		// add dot
		this.object3D.add(new Mesh(
			new PlaneBufferGeometry(5, 5),
			new MeshBasicMaterial({map: BeaconWidget.createTexture()})
		));
	}

	private animate() {
		var object = this.object3D;
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

	private onTrendChange(data: ITrendData) {
		var object = this.object3D;
		var lastItem = data[data.length - 1];
		var position = this.chartState.getPointOnChart(lastItem.xVal, lastItem.yVal);

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
			}
		)
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
}