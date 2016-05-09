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
import {GridWidget} from "./Grid";

enum AXIS_ORIENTATION {V, H};

export class AxisWidget extends ChartWidget {
	static widgetName = 'Axis';
	private object3D: Object3D;
	private axisXOptions: IAxisOptions;
	private axisYOptions: IAxisOptions;
	
	constructor (state: ChartState) {
		super(state);
		this.object3D = new Object3D();
		this.axisXOptions = this.chartState.data.xAxis;
		this.axisYOptions = this.chartState.data.yAxis;
		this.createLabels(this.axisYOptions, AXIS_ORIENTATION.V);
		this.createLabels(this.axisXOptions, AXIS_ORIENTATION.H);
	}

	private createLabels(axisOptions: IAxisOptions, orientation: AXIS_ORIENTATION) {
		var isXAsis = orientation == AXIS_ORIENTATION.H;
		var {width: w, height: h} = this.chartState.data;
		var canvas: HTMLCanvasElement = document.createElement('canvas');
		var ctx = canvas.getContext('2d');

		if (isXAsis) {
			canvas.height = 50;
			canvas.width = w;
		} else {
			canvas.height = h;
			canvas.width = 50;
		}

		ctx.beginPath();
		ctx.font = "10px Arial";
		ctx.fillStyle = "rgba(255,255,255,0.5)";
		ctx.strokeStyle = "rgba(255,255,255,0.95)";

		var axisGridParams = GridWidget.getGridParamsForAxis(axisOptions, h);

		// TODO: draw text and lines in different loops
		for (let val = axisGridParams.start; val <= axisGridParams.end; val += axisGridParams.step) {

			if (isXAsis) {
				let pxVal = this.chartState.getPointOnXAxis(val);
				ctx.moveTo(pxVal + 0.5, canvas.height);
				ctx.lineTo(pxVal + 0.5, canvas.height - 5);
				ctx.fillText(Number(val.toFixed(14)).toString(), pxVal - 5, canvas.height - 10);
			} else {
				let pxVal = h - this.chartState.getPointOnYAxis(val);
				ctx.moveTo(0, pxVal + 0.5);
				ctx.lineTo(5, pxVal + 0.5);
				ctx.fillText(Number(val.toFixed(14)).toString(), 15 , pxVal + 3);
			}
			ctx.stroke();
		}
		// uncomment to preview canvas borders
		// ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.stroke();
		ctx.closePath();


		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas);
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		texture.needsUpdate = true;

		var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.FrontSide} );
		material.transparent = true;

		var axisMesh = new Mesh(
			new THREE.PlaneGeometry(canvas.width, canvas.height),
			material
		);

		if (isXAsis) {
			axisMesh.position.set(canvas.width / 2, canvas.height / 2, 0);
		} else {
			axisMesh.position.set(canvas.width / 2, canvas.height / 2, 0);
		}

		this.object3D.add(axisMesh);

	}
	
	getObject3D(): Object3D {
		return this.object3D;
	}
	
}