import Object3D = THREE.Object3D;
import Geometry = THREE.Geometry;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import Mesh = THREE.Mesh;
import Texture = THREE.Texture;
import MeshBasicMaterial = THREE.MeshBasicMaterial;

import { ChartWidget, Chart, Color, Utils, Animation } from 'three-charts';
import { Zone, ZonesPlugin, IZoneOptions } from "./ZonesPlugin";
/**
 * widget for shows marks on axis
 */
export class ZonesWidget extends ChartWidget {
	static widgetName = 'Zones';

	protected object3D: Object3D;
	protected items: ZoneWidget[] = [];
	protected zonesPlugin: ZonesPlugin;

	onReadyHandler() {
		this.object3D = new Object3D();
		this.zonesPlugin = this.chart.getPlugin(ZonesPlugin.NAME) as ZonesPlugin;
		this.zonesPlugin.items.forEach(zone => this.createZoneWidget(zone));
		this.bindEvents();
	}

	protected createZoneWidget(zone: Zone) {
		let widget = new ZoneWidget(this.chart, zone);
		this.items.push(widget);
		this.object3D.add(widget.getObject3D());
	}

	protected bindEvents() {
		let zones = this.zonesPlugin.items;
		this.bindEvent(
			this.chart.interpolatedViewport.onInterpolation(() => this.updateZonesPositions()),
			zones.onCreate(item => this.createZoneWidget(item)),
			zones.onUpdate((item, changedOptions) => this.onZoneUpdateHandler(item, changedOptions)),
			zones.onRemove(item => this.onZoneRemoveHandler(item))
		);
	}

	protected onZoneUpdateHandler(mark: Zone, changedOptions: IZoneOptions) {
		let widget = this.items.find(widget => widget.zone.getId() == mark.getId());
		widget.update(changedOptions);
	}

	protected onZoneRemoveHandler(mark: Zone) {
		let ind = this.items.findIndex(widget => widget.zone.getId() == mark.getId());
		let widget = this.items[ind];
		this.object3D.remove(widget.getObject3D());
		this.items.splice(ind, 1);
	}

	protected updateZonesPositions() {
		this.forEach(widget => widget.updatePosition());
	}

	forEach(fn: (widget: ZoneWidget) => any) {
		for (let widget of this.items) fn(widget);
	}

	getObject3D() {
		return this.object3D;
	}

}

export interface IZoneAnimatedProps {
	startXVal: number;
	endXVal: number;
	startYVal: number;
	endYVal: number;
	opacity: number;
}

export class ZoneWidget {
	zone: Zone;
	protected animation: Animation<IZoneAnimatedProps>;
	protected animatedProps: IZoneAnimatedProps;
	protected object3D: Object3D;
	protected mesh: Mesh;
	protected chart: Chart;


	constructor(chart: Chart, zone: Zone) {
		this.chart = chart;
		this.zone = zone;
		this.object3D = new Object3D();
		this.initObject();
		this.updatePosition();
	}

	getObject3D() {
		return this.object3D;
	}

	initObject() {
		let height = this.chart.state.height;
		let bgColor = new Color(this.zone.bgColor);
		this.animatedProps = Utils.deepMerge({} as IZoneAnimatedProps, this.zone.position as IZoneAnimatedProps);
		this.animatedProps.opacity = this.zone.opacity;
		// mesh scheme
		//
		// vert0 +---+ vert3
		//       |\  |
		// face1 | \ | face2
		// 	     |  \|
		// vert1 +---+ vert2

		let geometry = new Geometry();
		geometry.vertices.push(
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3()
		);
		geometry.faces.push(
			new THREE.Face3( 0, 1, 2 ),
			new THREE.Face3( 3, 0, 2 )
		);


		this.mesh = new Mesh(
			geometry,
			new MeshBasicMaterial({transparent: true, color: bgColor.value, opacity: bgColor.a})
		);
		this.mesh.frustumCulled = false;
		this.object3D.add(this.mesh);
	}

	update(options: IZoneOptions) {
		let zone = this.zone;
		this.animation && this.animation.stop();
		this.animation = this.chart.animationManager.animate(zone.easeSpeed, zone.ease)
			.from(this.animatedProps)
			.to({
				startXVal: zone.position.startXVal,
				startYVal: zone.position.startYVal,
				endXVal: zone.position.endXVal,
				endYVal: zone.position.endYVal,
				opacity: zone.opacity
			})
			.onTick(() => this.updatePosition());
	}
	updatePosition()  {
		let chart = this.chart;
		let viewport = chart.interpolatedViewport;
		let zone = this.zone;
		let {startXVal, startYVal, endXVal, endYVal, opacity} = this.animatedProps;
		let startY = isFinite(startYVal) ? viewport.getWorldYByVal(startYVal) : viewport.getBottom();
		let endY = isFinite(endYVal) ? viewport.getWorldYByVal(endYVal) : viewport.getTop();
		let startX = viewport.getWorldXByVal(startXVal);
		let endX = viewport.getWorldXByVal(endXVal);
		let geometry = this.mesh.geometry as Geometry;
		let material = this.mesh.material as MeshBasicMaterial;
		let verts = geometry.vertices;

		material.opacity = this.animatedProps.opacity;

		verts[0].set(startX, endY, 0);
		verts[1].set(startX, startY, 0);
		verts[2].set(endX, startY, 0);
		verts[3].set(endX, endY, 0);

		geometry.verticesNeedUpdate = true;
	}

}
