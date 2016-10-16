import {ChartState, Utils, TrendsWidget, TrendWidget } from "../ThreeChart";
import Geometry = THREE.Geometry;
import Mesh = THREE.Mesh;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Vector3 = THREE.Vector3;
import Line = THREE.Line;
import Object3D = THREE.Object3D;
import Face3 = THREE.Face3;
import Texture = THREE.Texture;
import Vector2 = THREE.Vector2;
import LineSegments = THREE.LineSegments;
import LineDashedMaterial = THREE.LineDashedMaterial;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import { TrendMark, TREND_MARK_SIDE, TrendsMarksPlugin } from "./TrendsMarksPlugin";


const MAX_MARKS_IN_ROW = 3;

/**
 * widget for drawing trends marks for all trends
 */
export class TrendsMarksWidget extends TrendsWidget<TrendMarksWidget> {
	static widgetName = "TrendsMarks";
	protected getTrendWidgetClass() {
		return TrendMarksWidget;
	}
}

/**
 * widget for drawing trend marks for one trend
 */
export class TrendMarksWidget extends TrendWidget {

	private trendsMarksPlugin: TrendsMarksPlugin;
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
		this.getTrendsMarksPlugin().onChange(() => this.onMarksChange());
	}

	private getTrendsMarksPlugin(): TrendsMarksPlugin {
		return this.chartState.getPlugin(TrendsMarksPlugin.NAME) as TrendsMarksPlugin;
	}

	private onMarksChange() {
		let marksItems = this.getTrendsMarksPlugin().getItems();
		let widgets = this.marksWidgets;
		let actualMarksNames: string[] = [];
		for (let markName in marksItems) {
			actualMarksNames.push(markName);
			if (!widgets[markName]) this.createMarkWidget(marksItems[markName]);
		}
		for (let markName in this.marksWidgets) {
			if (actualMarksNames.indexOf(markName) !== -1) continue;
			this.destroyMarkWidget(markName);
		}

	}
	
	private createMarkWidget(mark: TrendMark) {
		if (!mark.segment) return;
		let markWidget = new TrendMarkWidget(this.chartState, mark);
		this.marksWidgets[mark.options.name] = markWidget;
		this.object3D.add(markWidget.getObject3D());
	}

	private destroyMarkWidget(markName: string) {
		this.object3D.remove(this.marksWidgets[markName].getObject3D());
		delete this.marksWidgets[markName];
	}

	protected onZoomFrame() {
		var widgets = this.marksWidgets;
		for (let markName in widgets) {
			widgets[markName].onZoomFrameHandler();
		}
	}

	protected onSegmentsAnimate() {
		var widgets = this.marksWidgets;
		for (let markName in widgets) {
			widgets[markName].onSegmentsAnimate();
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
		this.markMesh = this.createMarkMesh();
		this.line = this.createMarkLine();
		this.object3D.add(this.markMesh);
		this.object3D.add(this.line);
	}

	protected createMarkMesh(): Mesh {
		var {markHeight, markWidth} = this;
		var mark = this.mark.options;
		var isTopSide = mark.orientation == TREND_MARK_SIDE.TOP;

		var texture = Utils.createPixelPerfectTexture(markWidth, markHeight, (ctx) => {

			var circleOffset = isTopSide ? 30 : 0;
			var circleR = 22;
			var circleX = markWidth / 2;
			var circleY = circleOffset + circleR;
			var textOffset = isTopSide ? 10 : circleR * 2 + 15;

			// title and description
			ctx.beginPath();
			ctx.textAlign = 'center';
			ctx.font = "11px Arial";
			ctx.fillStyle = 'rgba(255,255,255, 0.6)';
			ctx.fillText(mark.title, circleX, textOffset);
			ctx.fillStyle = mark.descriptionColor;
			ctx.fillText(mark.description, circleX, textOffset + 12);

			// icon circle
			ctx.beginPath();
			ctx.fillStyle = mark.iconColor;
			ctx.arc(circleX, circleY, circleR, 0, 2 * Math.PI);
			ctx.fill();

			// icon text
			ctx.font = "19px Arial";
			ctx.fillStyle = 'rgb(255, 255, 255)';
			ctx.fillText(mark.icon, circleX, circleY + 7);

		});

		var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.FrontSide} );
		material.transparent = true;

		var mesh = new Mesh(
			new THREE.PlaneGeometry(markWidth, markHeight),
			material
		);

		let offset = this.mark.options.orientation == TREND_MARK_SIDE.TOP ? this.mark.offset : -this.mark.offset;
		// mesh.position.setY(markHeight / 2 + offset);

		return mesh;
	}

	protected createMarkLine() {
		let lineGeometry = new Geometry();
		lineGeometry.vertices.push( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, this.mark.offset, 0) );
		lineGeometry.computeLineDistances();
		let lineMaterial = new THREE.LineDashedMaterial( {dashSize: 1, gapSize: 4, transparent: true, opacity: 0.6 } );
		let line = new THREE.Line( lineGeometry, lineMaterial );
		line.position.setZ(-0.1);
		return line
	}

	getObject3D() {
		return this.object3D;
	}

	onSegmentsAnimate() {
		this.updatePosition();
	}

	onZoomFrameHandler() {
		this.updatePosition();
	}

	private updatePosition() {
		if (!this.mark.segment) return;
		let mark = this.mark;
		let meshMaterial = this.markMesh.material as MeshBasicMaterial;
		let lineMaterial = this.line.material as LineBasicMaterial;
		if (mark.row >= MAX_MARKS_IN_ROW - 1) {
			meshMaterial.opacity = 0;
			lineMaterial.opacity = 0;
		} else {
			meshMaterial.opacity = 1;
			lineMaterial.opacity = 1;
		}

		let screen = this.chartState.screen;
		let posX = screen.getPointOnXAxis(mark.xVal);
		let posY = screen.getPointOnYAxis(mark.yVal);
		let lineGeometry = this.line.geometry as Geometry;

		if (mark.options.orientation == TREND_MARK_SIDE.TOP) {
			this.markMesh.position.setY(this.markHeight / 2 + mark.offset);
			lineGeometry.vertices[1].setY(mark.offset);
		} else {
			this.markMesh.position.setY(-mark.offset - this.markHeight / 2);
			lineGeometry.vertices[1].setY(-mark.offset);
		}
		lineGeometry.verticesNeedUpdate = true;
		lineGeometry.lineDistancesNeedUpdate = true;
		lineGeometry.computeLineDistances();
		this.object3D.position.set(posX, posY, 0);
	}

	private show() {
		if (!this.mark.segment) return;
		this.updatePosition();
		var animations = this.chartState.data.animations;
		var time = animations.enabled ? 1 : 0;
		this.object3D.scale.set(0.01, 0.01, 1);
		TweenLite.to(this.object3D.scale, time, {x: 1, y: 1, ease: Elastic.easeOut});
	}
}