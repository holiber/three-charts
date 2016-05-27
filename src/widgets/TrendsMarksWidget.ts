import Geometry = THREE.Geometry;
import Mesh = THREE.Mesh;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import Object3D = THREE.Object3D;
import {ChartState} from "../State";
import Face3 = THREE.Face3;
import Texture = THREE.Texture;
import Vector2 = THREE.Vector2;
import {TrendsWidget, TrendWidget} from "./TrendsWidget";
import LineSegments = THREE.LineSegments;
import {TrendMark} from "../TrendMarks";
import {Utils} from "../Utils";
import LineDashedMaterial = THREE.LineDashedMaterial;

/**
 * widget for drawing trends marks for all trends
 */
export class TrendsMarksWidget extends TrendsWidget<TrendMarksWidget> {
	static widgetName = "trendsMarks";
	protected getTrendWidgetClass() {
		return TrendMarksWidget;
	}
}

/**
 * widget for drawing trend marks for one trend
 */
class TrendMarksWidget extends TrendWidget {

	private object3D: Object3D;
	private marksWidgets: {[name: string]: TrendMarkWidget} = {};

	constructor (chartState: ChartState, trendName: string) {
		super(chartState, trendName);
		this.object3D = new Object3D();
		this.onMarksChange();
	}

	getObject3D() {
		return this.object3D;
	}
	
	protected bindEvents() {
		super.bindEvents();
		this.trend.marks.onChange(() => this.onMarksChange());
	}

	private onMarksChange() {
		var marksItems = this.trend.marks.getItems();
		var widgets = this.marksWidgets;
		for (let markName in marksItems) {
			if (!widgets[markName]) this.createMarkWidget(marksItems[markName]);
		}
	}
	
	private createMarkWidget(mark: TrendMark) {
		let markWidget = new TrendMarkWidget(this.chartState, mark);
		this.marksWidgets[mark.options.name] = markWidget;
		this.object3D.add(markWidget.getObject3D());
	}

	protected onTrendAnimate() {
		var widgets = this.marksWidgets;
		for (let markName in widgets) {
			widgets[markName].onTrendAnimate();
		}
	}

	protected onZoom() {
		var widgets = this.marksWidgets;
		for (let markName in widgets) {
			widgets[markName].onZoomHandler();
		}
	}
}

/**
 * widget for drawing one trend mark
 */
class TrendMarkWidget {
	private chartState: ChartState;
	private mark: TrendMark;
	private object3D: Object3D;
	private line: Line;
	private markMesh: Mesh;
	private markHeight = 74;
	private markWidth = 150;
	private position = {lineHeight: 30, x: 0, y: 0};

	constructor(chartState: ChartState, trendMark: TrendMark) {
		this.chartState = chartState;
		this.mark = trendMark;
		this.initObject();
		this.show();
	}
	
	protected initObject() {
		this.object3D = new Object3D();
		//this.line = this.createLine();
		//this.object3D.add(this.line);
		this.markMesh = this.createMarkMesh();
		this.object3D.add(this.markMesh);
	}

	// protected createLine(): Line {
	// 	// var lineGeometry = new Geometry();
	// 	//
	// 	// lineGeometry.vertices.push(new Vector3(0,0,0), new Vector3(0, this.position.lineHeight, 0));
	// 	// return new Line(
	// 	// 	lineGeometry,
	// 	// 	new LineDashedMaterial()
	// 	// );
	// }

	protected createMarkMesh(): Mesh {
		var {markHeight, markWidth} = this;
		var lineHeight = this.position.lineHeight;
		var meshHeight = markHeight + lineHeight;
		var meshWidth = markWidth;
		var mark = this.mark.options;

		var texture = Utils.createPixelPerfectTexture(meshWidth, meshHeight, (ctx) => {

			var circleOffset = 30;
			var circleR = 22;
			var circleX = markWidth / 2;
			var circleY = circleOffset + circleR;

			// title and description
			ctx.beginPath();
			ctx.textAlign = 'center';
			ctx.font = "11px Arial";
			ctx.fillStyle = 'rgb(129,129,129)';
			ctx.fillText(mark.title, circleX, 10);
			ctx.fillStyle = 'rgb(40,136,75)';
			ctx.fillText(mark.description, circleX, 22);

			// icon circle
			ctx.beginPath();
			ctx.fillStyle = mark.iconColor;
			ctx.arc(circleX, circleY, circleR, 0, 2 * Math.PI);
			ctx.fill();

			// icon text
			ctx.font = "19px Arial";
			ctx.fillStyle = 'rgb(255, 255, 255)';
			ctx.fillText(mark.icon, circleX, circleY + 7);

			// line
			ctx.beginPath();
			ctx.strokeStyle = 'rgb(255, 255, 255)';
			ctx.lineWidth = 1;
			ctx.setLineDash([1, 4]);
			ctx.moveTo(markWidth / 2 + 0.5, circleY + circleR);
			ctx.lineTo(markWidth / 2  + 0.5, meshHeight);
			ctx.stroke();
		});

		var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.FrontSide} );
		material.transparent = true;

		var mesh = new Mesh(
			new THREE.PlaneGeometry(meshWidth, meshHeight),
			material
		);
		mesh.position.setY(meshHeight / 2);
		return mesh;
	}

	getObject3D() {
		return this.object3D;
	}

	onTrendAnimate() {
		this.updatePosition();
	}

	onZoomHandler() {
		this.updatePosition();
	}

	private updatePosition() {
		if (!this.mark.point) return;
		var pos = this.mark.point.getFramePoint();
		this.object3D.position.set(pos.x, pos.y, 0);
	}

	private show() {
		if (!this.mark.point) return;
		this.updatePosition();
		var animations = this.chartState.data.animations;
		var time = animations.enabled ? 1 : 0;
		this.object3D.scale.set(0.01, 0.01, 1);
		TweenLite.to(this.object3D.scale, time, {x: 1, y: 1, ease: Elastic.easeOut});
	}
}