
import {ChartWidget} from "../Widget";
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import {Utils} from "../Utils";
import Mesh = THREE.Mesh;
import PlaneBufferGeometry = THREE.PlaneBufferGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Vector3 = THREE.Vector3;

export class BeaconWidget extends ChartWidget {
	static widgetName = 'Beacon';
	private object3D: Object3D;
	private animated: boolean;
	private trendsNames: string[] = [];

	constructor(state: ChartState) {
		super(state);
		this.animated = state.data.animations.enabled;
		
		this.initObject();
		if (this.animated) {
			this.animate();
		}
		state.onTrendsChange(() => this.onTrendsChange());
	}

	getObject3D() {
		return this.object3D;
	}

	private initObject() {
		var trends = this.chartState.trends.items;
		for (let trendName in trends) {
			if (trends[trendName].getOptions().hasBeacon) this.trendsNames.push(trendName);
		}
		this.object3D = new Object3D();

		var i = this.trendsNames.length;
		while (i--) {

			// add beacon
			let light = new Mesh(
				new PlaneBufferGeometry(32, 32),
				new MeshBasicMaterial({map: BeaconWidget.createTexture(), transparent: true})
			);
			this.object3D.add(light);
			if (this.animated) {
				light.scale.set(0.1, 0.1, 1);
			} else {
				light.scale.set(0.2, 0.2, 1);
			}

			// add dot
			light.add(new Mesh(
				new PlaneBufferGeometry(5, 5),
				new MeshBasicMaterial({map: BeaconWidget.createTexture()})
			));
		}

	}

	private animate() {
		var objects = this.object3D.children;
		var i = objects.length;
		while (i--) {
			let object = objects[i] as Mesh;
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
	}

	private onTrendsChange() {
		var objects = this.object3D.children;
		for (let i = 0; i < objects.length; i++) {
			let object = objects[i] as Mesh;
			let trendName = this.trendsNames[i];
			let trendData = this.chartState.data.trends[trendName].data;
			var lastItem = trendData[trendData.length - 1];
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