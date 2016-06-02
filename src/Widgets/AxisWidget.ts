import Geometry = THREE.Geometry;
import Mesh = THREE.Mesh;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import Object3D = THREE.Object3D;
import UVMapping = THREE.UVMapping;
import GridHelper = THREE.GridHelper;
import {IAxisOptions} from "../Chart";
import {ChartWidget} from "../Widget";
import {ChartState} from "../State";
import {GridWidget, IGridParamsForAxis} from "./GridWidget";
import {Utils} from "../Utils";
import PlaneGeometry = THREE.PlaneGeometry;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import OrthographicCamera = THREE.OrthographicCamera;
import {IScreenTransformOptions} from "../Screen";
import {AXIS_TYPE} from "../interfaces";

/**
 * widget for drawing axis
 */
export class AxisWidget extends ChartWidget {
	static widgetName = 'Axis';
	private object3D: Object3D;
	private axisXObject: Object3D;
	private axisYObject: Object3D;
	private showAxisXTimeout = 0;
	private showAxisYTimeout = 0;
	private updateAxisXRequest: () => void;
	
	constructor (state: ChartState) {
		super(state);
		this.object3D = new Object3D();
		this.axisXObject = new Object3D();
		this.axisYObject = new Object3D();
		this.object3D.add(this.axisXObject);
		this.object3D.add(this.axisYObject);
		this.initAxis(AXIS_TYPE.X);
		this.initAxis(AXIS_TYPE.Y);

		// canvas drawing is expensive operation, so when we scroll, redraw must be called only once per second
		this.updateAxisXRequest = Utils.throttle(() => this.updateAxis(AXIS_TYPE.X), 1000);
	}

	bindEvents() {
		var state = this.chartState;
		state.screen.onTransformationFrame((options) => {
			this.onScrollChange(options.scrollX, options.scrollY);
		});
		state.screen.onZoomFrame((options) => {this.onZoomFrame(options)});
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

	private initAxis(orientation: AXIS_TYPE) {
		
		var isXAxis = orientation == AXIS_TYPE.X;
		var {width: visibleWidth, height: visibleHeight} = this.chartState.data;
		var canvasWidth = 0, canvasHeight = 0;

		if (isXAxis) {
			canvasWidth = visibleWidth * 3;
			canvasHeight = 50;
		} else {
			canvasWidth = 50;
			canvasHeight = visibleHeight * 3;
		}

		var texture = Utils.createTexture(canvasWidth, canvasHeight, (ctx) => {
			ctx.beginPath();
			ctx.font = "10px Arial";
			ctx.fillStyle = "rgba(255,255,255,0.3)";
			ctx.strokeStyle = "rgba(255,255,255,0.1)";
		});

		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;

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
		var isXAxis = orientation == AXIS_TYPE.X;
		var {width: visibleWidth, height: visibleHeight} = this.chartState.data;
		var {scrollX, scrollXVal, scrollY, scrollYVal, zoomX, zoomY} = this.chartState.screen.options;
		var axisOptions: IAxisOptions;
		var axisMesh: Mesh;
		var axisGridParams: IGridParamsForAxis;

		if (isXAxis) {
			axisMesh = this.axisXObject.children[0] as Mesh;
			axisOptions = this.chartState.data.xAxis;
			axisGridParams = GridWidget.getGridParamsForAxis(axisOptions, visibleWidth, scrollXVal, zoomX);
		} else {
			axisMesh = this.axisYObject.children[0] as Mesh;
			axisOptions = this.chartState.data.yAxis;
			axisGridParams = GridWidget.getGridParamsForAxis(axisOptions, visibleHeight, scrollYVal, zoomY);
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
			if (isXAxis) {
				let pxVal = this.chartState.screen.getPointOnXAxis(val) - scrollX + visibleWidth;
				ctx.textAlign = "center";
				// uncomment for dots
				// ctx.moveTo(pxVal + 0.5, canvasHeight);
				// ctx.lineTo(pxVal + 0.5, canvasHeight - 5);
				ctx.fillText(Number(val.toFixed(14)).toString(), pxVal, canvasHeight - 10);
			} else {
				let pxVal = canvasHeight - this.chartState.screen.getPointOnYAxis(val) + scrollY;
				ctx.textAlign = "right";
				// uncomment for dots
				// ctx.moveTo(canvasWidth, pxVal + 0.5);
				// ctx.lineTo(canvasWidth - 5, pxVal + 0.5);
				ctx.fillText(Number(val.toFixed(14)).toString(), canvasWidth - 15 , pxVal + 3);

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

	private onZoomFrame(options: IScreenTransformOptions) {
		if (options.zoomX) {
			this.updateAxis(AXIS_TYPE.X);
			//this.temporaryHideAxis(AXIS_ORIENTATION.H)
		}
		if (options.zoomY) {
			this.updateAxis(AXIS_TYPE.Y);
			//this.temporaryHideAxis(AXIS_ORIENTATION.V)
		}
	}

	private temporaryHideAxis(orientation: AXIS_TYPE) {
		var isXAxis = orientation == AXIS_TYPE.X;
		var timeoutId = setTimeout(() => {
				this.showAxis(orientation);
		}, 200);

		if (isXAxis) {
			(this.axisXObject.children[0] as Mesh).material.opacity = 0;
			clearTimeout(this.showAxisXTimeout);
			this.showAxisXTimeout =	timeoutId;
		} else {
			clearTimeout(this.showAxisYTimeout);
			(this.axisYObject.children[0] as Mesh).material.opacity = 0;
			this.showAxisYTimeout = timeoutId;
		}
	}

	private showAxis(orientation: AXIS_TYPE) {
		var isXAxis = orientation == AXIS_TYPE.X;
		var material: MeshBasicMaterial;
		if (isXAxis) {
			material = (this.axisXObject.children[0] as Mesh).material as MeshBasicMaterial;
		} else {
			material = (this.axisYObject.children[0] as Mesh).material as MeshBasicMaterial;
		}
		this.updateAxis(orientation);
		TweenLite.to(material, 0.3, {opacity: 1});
	}
}