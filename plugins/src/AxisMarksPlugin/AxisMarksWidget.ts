import Object3D = THREE.Object3D;
import Geometry = THREE.Geometry;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import Mesh = THREE.Mesh;
import Texture = THREE.Texture;
import MeshBasicMaterial = THREE.MeshBasicMaterial;

import { ChartWidget, Chart, Color, AXIS_TYPE, Utils, IChartState, Animation } from 'three-charts';
import { AxisMark, AxisMarksPlugin, IAxisMarkOptions } from "./AxisMarksPlugin";
import BufferGeometry = THREE.BufferGeometry;
import PlaneGeometry = THREE.PlaneGeometry;

/**
 * widget for shows marks on axis
 */
export class AxisMarksWidget extends ChartWidget {
	static widgetName = 'AxisMarks';

	protected object3D: Object3D;
	protected axisMarksWidgets: AxisMarkWidget[] = [];
	protected axisMarksPlugin: AxisMarksPlugin;

	onReadyHandler() {
		this.object3D = new Object3D();
		this.axisMarksPlugin = this.chart.getPlugin(AxisMarksPlugin.NAME) as AxisMarksPlugin;
		this.axisMarksPlugin.marksCollection.forEach(mark => this.createAxisMarkWidget(mark));
		this.bindEvents();
	}

	protected createAxisMarkWidget(axisMark: AxisMark) {
		var axisMarkWidget = new AxisMarkWidget(this.chart, axisMark);
		this.axisMarksWidgets.push(axisMarkWidget);
		this.object3D.add(axisMarkWidget.getObject3D());
	}

	protected bindEvents() {
		let marksCollection = this.axisMarksPlugin.marksCollection;
		this.bindEvent(
			this.chart.interpolatedViewport.onInterpolation(() => this.updateMarksPositions()),
			this.chart.onResize(() => this.onResizeHandler()),
			this.chart.onChange((changedProps) => this.onStateChangeHandler(changedProps)),
			marksCollection.onCreate((mark) => this.createAxisMarkWidget(mark)),
			marksCollection.onUpdate((mark, changedOptions) => this.onMarkUpdateHandler(mark, changedOptions)),
			marksCollection.onRemove((mark) => this.onMarkRemoveHandler(mark))
		);
	}

	protected onMarkUpdateHandler(mark: AxisMark, changedOptions: IAxisMarkOptions) {
		let widget = this.axisMarksWidgets.find(widget => widget.axisMark.getId() == mark.getId());
		widget.update(changedOptions);
	}

	protected onMarkRemoveHandler(mark: AxisMark) {
		let ind = this.axisMarksWidgets.findIndex(widget => widget.axisMark.getId() == mark.getId());
		let widget = this.axisMarksWidgets[ind];
		this.object3D.remove(widget.getObject3D());
		this.axisMarksWidgets.splice(ind, 1);
	}

	protected updateMarksPositions() {
		this.forEach(widget => widget.updatePosition());
	}

	protected onStateChangeHandler(changedProps: IChartState) {
		this.forEach(widget => widget.onStateChangeHandler(changedProps));
	}

	protected onResizeHandler() {
		this.forEach(widget => {
			widget.resize();
			widget.updatePosition();
		});
	}

	forEach(fn: (widget: AxisMarkWidget) => any) {
		for (let widget of this.axisMarksWidgets) fn(widget);
	}

	getObject3D() {
		return this.object3D;
	}

}



export const DEFAULT_AXIS_MARK_RENDERER = (
	axisMarkWidget: AxisMarkWidget,
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	chart: Chart
) => {
	let markOptions = axisMarkWidget.axisMark;
	let lineColor = new Color(markOptions.lineColor);
	let textColor = new Color(markOptions.textColor);
	let font = chart.state.font.l;
	let offset = parseInt(font);
	ctx.clearRect(0,0, width, height);
	ctx.beginPath();
	ctx.strokeStyle = lineColor.rgbaStr;
	ctx.fillStyle = lineColor.rgbaStr;
	ctx.lineWidth = markOptions.lineWidth;
	ctx.font = font;

	if (markOptions.axisType == AXIS_TYPE.X) {
		ctx.moveTo(width / 2, 0);
		ctx.lineTo(width / 2, height);
		ctx.stroke();
		ctx.fillStyle = textColor.rgbaStr;
		ctx.fillText(markOptions.title, width / 2 + offset, offset * 2);
	} else {
		ctx.moveTo(0, height / 2);
		ctx.lineTo(width, height / 2);
		ctx.stroke();
		ctx.fillStyle = textColor.rgbaStr;
		ctx.fillText(markOptions.title, offset,
			height / 2 + (axisMarkWidget.isStickOnBottom ? -offset * 2 : offset * 2)
		);
	}
};


export class AxisMarkWidget {
	axisMark: AxisMark;
	isStickOnTop = false;
	isStickOnBottom = false;
	displayedValue = '';
	height = 0;
	width = 0;
	frameValue = 0;
	frameOpacity = 0;
	animation: Animation<number[]>;
	protected object3D: Object3D;
	protected mesh: Mesh;
	protected chart: Chart;


	constructor(chart: Chart, axisMark: AxisMark) {
		this.chart = chart;
		this.axisMark = axisMark;
		this.frameOpacity = axisMark.opacity;
		this.frameValue = axisMark.value;
		this.object3D = new Object3D();
		this.initObject();
		this.updatePosition();
	}

	getObject3D() {
		return this.object3D;
	}

	initObject() {
		this.width = this.chart.state.width;
		this.height = this.chart.state.height;
		let markOptions = this.axisMark;
		if (markOptions.axisType == AXIS_TYPE.X) {
			this.width = markOptions.width;
		} else {
			this.height = markOptions.width;
		}
		let texture = Utils.createNearestTexture(this.width, this.height);

		this.mesh = new Mesh(
			new THREE.PlaneGeometry(this.width, this.height),
			new MeshBasicMaterial({map: texture, transparent: true})
		);
		this.object3D.add(this.mesh);
		this.render();
	}

	onStateChangeHandler(changedProps: IChartState) {
		let needRender = this.axisMark.needRender && this.axisMark.needRender(this, this.chart, changedProps);
		needRender && this.render();
	}

	render() {
		let markOptions = this.axisMark;
		let mesh = this.mesh
		let texture = (mesh.material as MeshBasicMaterial).map;
		let ctx = (texture.image as HTMLCanvasElement).getContext('2d');
		let renderer = markOptions.renderer ? markOptions.renderer : DEFAULT_AXIS_MARK_RENDERER;
		if (markOptions.displayedValue) this.displayedValue = markOptions.displayedValue(this, this.chart);
		renderer(this, ctx, this.width, this.height, this.chart);
		texture.needsUpdate = true;
	}

	resize() {
		this.object3D.remove(this.mesh);
		this.initObject();
	}

	update(options: IAxisMarkOptions) {
		let mark = this.axisMark;
		this.animation && this.animation.stop();
		this.animation = this.chart.animationManager.animate(mark.easeSpeed, mark.ease)
			.from([this.frameValue, this.frameOpacity])
			.to([mark.value, mark.opacity])
			.onTick((arr) => {
				this.frameValue = arr[0];
				this.frameOpacity = arr[1];
				this.updatePosition();
			});
	}

	updatePosition()  {
		let chart = this.chart;
		let screen = chart.interpolatedViewport;
		let mark = this.axisMark;
		let isXAxis = mark.axisType == AXIS_TYPE.X;
		let hasStickMode = mark.stickToEdges;
		let {width, height} = chart.state;
		let val = this.frameValue;
		let opactity = this.frameOpacity;
		let material = (this.mesh as Mesh).material;

		material.opacity = opactity;

		if (isXAxis) {
			// TODO: make stickToEdges mode for AXIS_TYPE.X
			this.mesh.position.x = screen.getWorldXByVal(val);
			this.mesh.position.y = screen.params.scrollY + height / 2;
		} else {
			let bottomVal = screen.getBottomVal();
			let topVal = screen.getTopVal();
			let needToStickOnTop = hasStickMode && val > topVal;
			let needToStickOnBottom = hasStickMode && val < bottomVal;
			this.mesh.position.x = screen.params.scrollX + width / 2;
			if (needToStickOnTop) {
				this.isStickOnTop = true;
				this.mesh.position.y = screen.getTop();
			} else if (needToStickOnBottom) {
				this.isStickOnBottom = true;
				this.mesh.position.y = screen.getBottom();
			} else {
				this.isStickOnBottom = this.isStickOnTop = false;
				this.mesh.position.y = screen.getWorldYByVal(val);
			}
		}
	}

}
