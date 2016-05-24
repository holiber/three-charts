
import {ChartWidget} from "../Widget";
import {ChartState} from "../State";
import Object3D = THREE.Object3D;
import Geometry = THREE.Geometry;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Vector3 = THREE.Vector3;
import {Utils} from "../Utils";
import Line = THREE.Line;
import Mesh = THREE.Mesh;
import Color = THREE.Color;
import Texture = THREE.Texture;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import {AxisMark, AxisMarks} from "../AxisMarks";
import {AXIS_TYPE} from "../interfaces";


// TODO: support for yAxis

/**
 * widget for shows marks on axis
 */
export class AxisMarksWidget extends ChartWidget {
	static widgetName = 'axisMarks';

	private object3D: Object3D;
	private xAxisMarks: AxisMarks;
	private axisMarksWidgets: AxisMarkWidget[] = [];

	constructor(chartState: ChartState) {
		super(chartState);
		this.object3D = new Object3D();
		this.xAxisMarks = chartState.xAxisMarks;

		var items = this.xAxisMarks.getItems();
		for (var markName in items) {
			this.createAxisMark(items[markName]);
		}
	}

	private createAxisMark(axisMark: AxisMark) {

		var axisMarkWidget = new AxisMarkWidget(this.chartState, axisMark);
		this.axisMarksWidgets.push(axisMarkWidget);
		this.object3D.add(axisMarkWidget.getObject3D());
	}

	getObject3D() {
		return this.object3D;
	}

}



const DEFAULT_INDICATOR_RENDER_FUNCTION = (axisMarkWidget: AxisMarkWidget, ctx: CanvasRenderingContext2D) => {
	var axisMark = axisMarkWidget.axisMark;
	ctx.clearRect(0, 0, axisMarkWidget.indicatorWidth, axisMarkWidget.indicatorHeight);
	ctx.fillStyle = axisMark.options.lineColor;
	ctx.fillText(axisMark.options.title, 15, 20);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
	ctx.fillText(axisMark.getDisplayedVal(), 16, 34);
};

class AxisMarkWidget {
	static typeName = 'simple';
	axisMark: AxisMark;
	indicatorWidth = 64;
	indicatorHeight = 64;
	protected indicatorRenderFunction = DEFAULT_INDICATOR_RENDER_FUNCTION;
	protected chartState: ChartState;
	protected axisType: AXIS_TYPE;
	protected object3D: Object3D;
	protected line: Line;
	protected indicator: Mesh;
	

	constructor(chartState: ChartState, axisMark: AxisMark) {

		if (axisMark.axisType == AXIS_TYPE.Y) {
			Utils.error('axis mark on Y axis not supported yet');
			return;
		}

		this.chartState = chartState;
		this.axisMark = axisMark;
		this.axisType = axisMark.axisType;
		this.object3D = new Object3D();
		this.object3D.position.setZ(-0.1);

		this.line = this.createLine();
		this.object3D.add(this.line);
		this.indicator = this.createIndicator();
		this.object3D.add(this.indicator);
		this.renderIndicator();
		this.updatePosition();
		this.bindEvents();
	}

	getObject3D() {
		return this.object3D;
	}

	protected createLine(): Line {
		var {lineWidth, lineColor} = this.axisMark.options;
		var lineGeometry = new Geometry();

		lineGeometry.vertices.push(new Vector3(0,0,0), new Vector3(0,0,0));
		return new Line(
			lineGeometry,
			new LineBasicMaterial( { color: Utils.getHexColor(lineColor), linewidth: lineWidth})
		);
	}

	protected createIndicator(): Mesh {
		var {indicatorWidth: width, indicatorHeight: height} = this;
		var texture = Utils.createPixelPerfectTexture(width, height, (ctx) => {
			ctx.beginPath();
			ctx.font = "10px Arial";
		});

		var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.FrontSide} );
		material.transparent = true;

		return new Mesh(
			new THREE.PlaneGeometry(width, height),
			material
		);
	}

	protected renderIndicator() {
		var texture = (this.indicator.material as MeshBasicMaterial).map as Texture;
		var ctx = (texture.image as HTMLCanvasElement).getContext('2d');
		DEFAULT_INDICATOR_RENDER_FUNCTION(this, ctx);
		texture.needsUpdate = true;
	}

	protected bindEvents() {
		this.axisMark.onAnimationFrame(() => this.updatePosition());
		this.axisMark.onDisplayedValueChange(() => this.renderIndicator());
	}

	protected updatePosition() {
		var chartState = this.chartState;
		var isXAxis = this.axisType == AXIS_TYPE.X;
		if (!isXAxis) return; // TODO: support for yAxis
		this.object3D.position.x = this.axisMark.position;
		this.object3D.position.y = 0;
		var lineGeometry = (this.line.geometry as Geometry);
		lineGeometry.vertices[1].setY(chartState.data.height);
		lineGeometry.verticesNeedUpdate = true;
		this.indicator.position.set(this.indicatorWidth / 2, chartState.data.height - this.indicatorHeight / 2, 0);
	}

}
