
import {ChartWidget} from "../Widget";
import {Chart} from "../Chart";
import Object3D = THREE.Object3D;
import Geometry = THREE.Geometry;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Vector3 = THREE.Vector3;
import {Utils} from "../Utils";
import Line = THREE.Line;
import Mesh = THREE.Mesh;
import Texture = THREE.Texture;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import {AxisMark, AxisMarks} from "../AxisMarks";
import {AXIS_TYPE} from "../interfaces";
import {IScreenTransformOptions} from "../Screen";
import { Color } from '../Color';


/**
 * widget for shows marks on axis
 */
export class AxisMarksWidget extends ChartWidget {
	static widgetName = 'AxisMarks';

	private object3D: Object3D;
	private axisMarksWidgets: AxisMarkWidget[] = [];

	onReadyHandler() {
		this.object3D = new Object3D();
		let {xAxisMarks, yAxisMarks} = this.chart;

		let items = xAxisMarks.getItems();
		for (var markName in items) {
			this.createAxisMark(items[markName]);
		}
		items = yAxisMarks.getItems();
		for (var markName in items) {
			this.createAxisMark(items[markName]);
		}
		this.bindEvents();
	}

	private createAxisMark(axisMark: AxisMark) {
		var axisMarkWidget = new AxisMarkWidget(this.chart, axisMark);
		this.axisMarksWidgets.push(axisMarkWidget);
		this.object3D.add(axisMarkWidget.getObject3D());
	}

	protected bindEvents() {
		this.bindEvent(
			this.chart.screen.onTransformationFrame(() => this.updateMarksPositions()),
			this.chart.onResize(() => this.updateMarksPositions())
		);
	}

	private updateMarksPositions() {
		for (let widget of this.axisMarksWidgets) widget.updatePosition();
	}

	getObject3D() {
		return this.object3D;
	}

}



const DEFAULT_INDICATOR_RENDER_FUNCTION = (axisMarkWidget: AxisMarkWidget, ctx: CanvasRenderingContext2D) => {
	var axisMark = axisMarkWidget.axisMark;
	ctx.fillStyle = axisMark.options.lineColor;
	ctx.clearRect(0, 0, axisMarkWidget.indicatorWidth, axisMarkWidget.indicatorHeight);
	let xCoord = 15;

	if (axisMark.axisType == AXIS_TYPE.Y) {
		ctx.textAlign = 'end';
		xCoord = axisMarkWidget.indicatorWidth;
	}

	ctx.fillText(axisMark.options.title, xCoord, 20);
	if (!axisMark.options.showValue) return;

	ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
	ctx.fillText(axisMark.getDisplayedVal(), 16, 34);
};

let INDICATOR_POS_Z = 0.1;

class AxisMarkWidget {
	static typeName = 'simple';
	axisMark: AxisMark;
	indicatorWidth = 128;
	indicatorHeight = 64;
	protected indicatorRenderFunction = DEFAULT_INDICATOR_RENDER_FUNCTION;
	protected chartState: Chart;
	protected axisType: AXIS_TYPE;
	protected object3D: Object3D;
	protected line: Line;
	protected indicator: Mesh;
	protected moveAnimation: TweenLite;
	protected frameValue: number;
	

	constructor(chartState: Chart, axisMark: AxisMark) {
		this.chartState = chartState;
		this.axisMark = axisMark;
		this.axisType = axisMark.axisType;
		this.frameValue = axisMark.options.value;
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
			new LineBasicMaterial( { color: new Color(lineColor).value, linewidth: lineWidth})
		);
	}

	protected createIndicator(): Mesh {
		var {indicatorWidth: width, indicatorHeight: height} = this;
		var texture = Utils.createNearestTexture(width, height, (ctx) => {
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
		this.axisMark.onDisplayedValueChange(() => this.renderIndicator());
		this.axisMark.onValueChange(() => this.onValueChangeHandler());
	}

	private onValueChangeHandler() {
		// move mark to new position with animation
		if (this.moveAnimation) this.moveAnimation.kill();
		var animations = this.chartState.state.animations;
		var targetValue = this.axisMark.options.value;
		var cb = () => {
			this.updatePosition();
		};
		if (animations.enabled) {
			this.moveAnimation = TweenLite.to(
				this, animations.trendChangeSpeed,
				{frameValue: targetValue, ease: animations.trendChangeEase}
			);
			this.moveAnimation.eventCallback('onUpdate', cb);
		} else {
			this.frameValue = targetValue;
			cb();
		}
	}

	updatePosition()  {
		let chartState = this.chartState;
		let screen = chartState.screen;
		let isXAxis = this.axisType == AXIS_TYPE.X;
		let lineGeometry = (this.line.geometry as Geometry);
		let hasStickMode = this.axisMark.options.stickToEdges;
		let {width, height} = this.chartState.state;

		if (isXAxis) {
			// TODO: make stickToEdges mode for AXIS_TYPE.X 
			this.object3D.position.x = screen.getPointOnXAxis(this.frameValue);
			this.object3D.position.y = screen.getBottom();
			lineGeometry.vertices[1].setY(height);
			this.indicator.position.set(
				this.indicatorWidth / 2,
				chartState.state.height - this.indicatorHeight / 2,
				INDICATOR_POS_Z
			);
		} else {
			let val = this.frameValue;
			let bottomVal = screen.getBottomVal();
			let topVal = screen.getTopVal();
			let needToStickOnTop = hasStickMode && val > topVal;
			let needToStickOnBottom = hasStickMode && val < bottomVal;
			let centerYVal = screen.getCenterYVal();
			this.object3D.position.x = screen.getLeft();
			if (needToStickOnTop) {
				this.object3D.position.y = screen.getTop();
			} else if (needToStickOnBottom) {
				this.object3D.position.y = screen.getBottom();
			} else {
				this.object3D.position.y = screen.getPointOnYAxis(this.frameValue);
			}
			lineGeometry.vertices[1].setX(width);

			let indicatorPosY = val > centerYVal ? -35 : 10;
			this.indicator.position.set(width - this.indicatorWidth / 2 - 50, indicatorPosY, INDICATOR_POS_Z);
		}
		lineGeometry.verticesNeedUpdate = true;
	}

}
