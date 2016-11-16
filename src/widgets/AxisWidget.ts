import Geometry = THREE.Geometry;
import Mesh = THREE.Mesh;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import Object3D = THREE.Object3D;
import UVMapping = THREE.UVMapping;
import GridHelper = THREE.GridHelper;
import {ChartWidget} from "../Widget";
import {Chart} from "../Chart";
import {GridWidget, IGridParamsForAxis} from "./GridWidget";
import {Utils} from "../Utils";
import PlaneGeometry = THREE.PlaneGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import OrthographicCamera = THREE.OrthographicCamera;
import {IViewportParams} from "../Viewport";
import {AXIS_TYPE, AXIS_DATA_TYPE, IAxisOptions} from "../interfaces";
import { Color } from "../Color";

/**
 * widget for drawing axis
 */
export class AxisWidget extends ChartWidget {
	static widgetName = 'Axis';
	private isDestroyed = false;
	private object3D: Object3D;
	private axisXObject: Object3D;
	private axisYObject: Object3D;
	private updateAxisXRequest: () => void;

	onReadyHandler() {
		this.object3D = new Object3D();
		this.axisXObject = new Object3D();
		this.axisYObject = new Object3D();
		this.object3D.add(this.axisXObject);
		this.object3D.add(this.axisYObject);
		this.setupAxis(AXIS_TYPE.X);
		this.setupAxis(AXIS_TYPE.Y);

		// canvas drawing is expensive operation, so when we scroll, redraw must be called only once per second
		this.updateAxisXRequest = Utils.throttle(() => this.updateAxis(AXIS_TYPE.X), 1000);

		this.onScrollChange(
			this.chart.interpolatedViewport.params.scrollX,
			this.chart.interpolatedViewport.params.scrollY
		);
		this.bindEvents();
	}

	bindEvents() {
		var state = this.chart;

		this.bindEvent(
			state.interpolatedViewport.onInterpolation((options) => {
				this.onScrollChange(options.scrollX, options.scrollY);
			}),
			state.interpolatedViewport.onZoomInterpolation((options) => {this.onZoomFrame(options)}),
			state.onDestroy(() => this.onDestroy()),
			state.onResize(() => this.onResize())
		);
	}

	private onDestroy() {
		this.isDestroyed = true;
		this.unbindEvents();
	}

	private onScrollChange(x: number, y: number) {

		if (y != void 0) {
			this.axisYObject.position.y = y;
			this.axisXObject.position.y = y;
		}

		if (x != void 0) {
			this.axisYObject.position.x = x;
			this.updateAxisXRequest();
		}

	}

	private onResize() {
		this.setupAxis(AXIS_TYPE.X);
		this.setupAxis(AXIS_TYPE.Y);
	}

	private setupAxis(orientation: AXIS_TYPE) {

		let isXAxis = orientation == AXIS_TYPE.X;
		let {width: visibleWidth, height: visibleHeight} = this.chart.state;
		let canvasWidth = 0, canvasHeight = 0;
		let axisOptions: IAxisOptions;

		// clean meshes
		if (isXAxis) {
			this.axisXObject.traverse(obj => this.axisXObject.remove(obj));
			canvasWidth = visibleWidth * 3;
			canvasHeight = 50;
			axisOptions = this.chart.state.xAxis;
		} else {
			this.axisYObject.traverse(obj => this.axisYObject.remove(obj));
			canvasWidth = 50;
			canvasHeight = visibleHeight * 3;
			axisOptions = this.chart.state.yAxis;
		}

		var texture = Utils.createNearestTexture(canvasWidth, canvasHeight, (ctx) => {
			let color = new Color(axisOptions.color);
			ctx.beginPath();
			ctx.font = this.chart.state.font.m;
			ctx.fillStyle = color.rgbaStr;
			ctx.strokeStyle = color.rgbaStr;
		});


		var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.FrontSide} );
		material.transparent = true;

		var axisMesh = new Mesh(
			new THREE.PlaneGeometry(canvasWidth, canvasHeight),
			material
		);

		if (isXAxis) {
			axisMesh.position.set(canvasWidth / 2, canvasHeight / 2, 0);
			this.axisXObject.add(axisMesh);
		} else {
			axisMesh.position.set(visibleWidth - canvasWidth / 2, canvasHeight / 2, 0);
			this.axisYObject.add(axisMesh);
		}

		this.updateAxis(orientation);

	}
	
	getObject3D(): Object3D {
		return this.object3D;
	}

	private updateAxis(orientation: AXIS_TYPE) {
		if (this.isDestroyed) return;
		var isXAxis = orientation == AXIS_TYPE.X;
		var {width: visibleWidth, height: visibleHeight} = this.chart.state;
		var {scrollX, scrollY, zoomX, zoomY} = this.chart.interpolatedViewport.params;
		var axisOptions: IAxisOptions;
		var axisMesh: Mesh;
		var axisGridParams: IGridParamsForAxis;

		if (isXAxis) {
			axisMesh = this.axisXObject.children[0] as Mesh;
			axisOptions = this.chart.state.xAxis;
			axisGridParams = GridWidget.getGridParamsForAxis(axisOptions, visibleWidth, zoomX);
		} else {
			axisMesh = this.axisYObject.children[0] as Mesh;
			axisOptions = this.chart.state.yAxis;
			axisGridParams = GridWidget.getGridParamsForAxis(axisOptions, visibleHeight, zoomY);
		}

		var geometry = axisMesh.geometry as PlaneGeometry;
		var canvasWidth = geometry.parameters.width;
		var canvasHeight = geometry.parameters.height;
		var texture = (axisMesh.material as MeshBasicMaterial).map;
		var ctx = texture.image.getContext('2d');
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		if (isXAxis) {
			axisMesh.position.x = canvasWidth / 2 - visibleWidth + scrollX;
		}


		// TODO: draw text and lines in different loops
		var edgeOffset = axisGridParams.segmentsCount * axisGridParams.step;
		var startVal = axisGridParams.start  - edgeOffset;
		var endVal = axisGridParams.end + edgeOffset;

		ctx.beginPath();
		for (let val = startVal; val <= endVal; val += axisGridParams.step) {
			let displayedValue = '';
			if (isXAxis) {
				let pxVal = this.chart.interpolatedViewport.getWorldXByVal(val) - scrollX + visibleWidth;
				ctx.textAlign = "center";
				// uncomment for dots
				// ctx.moveTo(pxVal + 0.5, canvasHeight);
				// ctx.lineTo(pxVal + 0.5, canvasHeight - 5);
				if (axisOptions.dataType == AXIS_DATA_TYPE.DATE) {
					displayedValue = AxisWidget.getDateStr(val, axisGridParams);
				} else {
					displayedValue = Number(val.toFixed(14)).toString();
				}

				ctx.fillText(displayedValue, pxVal, canvasHeight - 10);
			} else {
				let pxVal = canvasHeight - this.chart.interpolatedViewport.getWorldYByVal(val) + scrollY;
				ctx.textAlign = "right";
				// uncomment for dots
				// ctx.moveTo(canvasWidth, pxVal + 0.5);
				// ctx.lineTo(canvasWidth - 5, pxVal + 0.5);

				displayedValue = Number(val.toFixed(14)).toString();
				ctx.fillText(displayedValue, canvasWidth - 15 , pxVal + 3);

				// uncomment for left-side axis
				// ctx.moveTo(0, pxVal + 0.5);
				// ctx.lineTo(5, pxVal + 0.5);
				// ctx.fillText(Number(val.toFixed(14)).toString(), 15 , pxVal + 3);
			}
			ctx.stroke();
		}
		// uncomment to preview canvas borders
		// ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		ctx.stroke();
		ctx.closePath();
		texture.needsUpdate = true;
	}

	private onZoomFrame(options: IViewportParams) {
		if (options.zoomX) {
			this.updateAxis(AXIS_TYPE.X);
			//this.temporaryHideAxis(AXIS_ORIENTATION.H)
		}
		if (options.zoomY) {
			this.updateAxis(AXIS_TYPE.Y);
			//this.temporaryHideAxis(AXIS_ORIENTATION.V)
		}
	}

	// private temporaryHideAxis(orientation: AXIS_TYPE) {
	// 	var isXAxis = orientation == AXIS_TYPE.X;
	// 	var timeoutId = setTimeout(() => {
	// 			this.showAxis(orientation);
	// 	}, 200);
	//
	// 	if (isXAxis) {
	// 		(this.axisXObject.children[0] as Mesh).material.opacity = 0;
	// 		clearTimeout(this.showAxisXTimeout);
	// 		this.showAxisXTimeout =	timeoutId;
	// 	} else {
	// 		clearTimeout(this.showAxisYTimeout);
	// 		(this.axisYObject.children[0] as Mesh).material.opacity = 0;
	// 		this.showAxisYTimeout = timeoutId;
	// 	}
	// }

	// private showAxis(orientation: AXIS_TYPE) {
	// 	var isXAxis = orientation == AXIS_TYPE.X;
	// 	var material: MeshBasicMaterial;
	// 	if (isXAxis) {
	// 		material = (this.axisXObject.children[0] as Mesh).material as MeshBasicMaterial;
	// 	} else {
	// 		material = (this.axisYObject.children[0] as Mesh).material as MeshBasicMaterial;
	// 	}
	// 	this.updateAxis(orientation);
	// 	TweenLite.to(material, 0.3, {opacity: 1});
	// }

	static getDateStr(timestamp: number, gridParams: IGridParamsForAxis): string {
		var sec = 1000;
		var min = sec * 60;
		var hour = min * 60;
		var day = hour * 60;
		var step = gridParams.step;
		var d = new Date(timestamp);
		var tf = (num: number) => Utils.toFixed(num, 2);
		return tf(d.getHours()) + ':' + tf(d.getMinutes()) + ':' + tf(d.getSeconds());
	}
}
