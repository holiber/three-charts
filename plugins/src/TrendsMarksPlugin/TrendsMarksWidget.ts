import {Chart, Utils, TrendsWidget, TrendWidget } from 'three-charts';
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
import { Color } from "../../../src/Color";


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

	constructor (chart: Chart, trendName: string) {
		super(chart, trendName);
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
		return this.chart.getPlugin(TrendsMarksPlugin.NAME) as TrendsMarksPlugin;
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
		let markWidget = new TrendMarkWidget(this.chart, mark);
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
	private chart: Chart;
	private mark: TrendMark;
	private markMesh: Mesh;

	constructor(chart: Chart, trendMark: TrendMark) {
		this.chart = chart;
		this.mark = trendMark;
		this.initObject();
		this.show();
	}
	
	protected initObject() {
		let options = this.mark.options;
		let {width, height} = options;

		let texture = Utils.createPixelPerfectTexture(width, height, (ctx) => {
			options.onRender([this.mark], ctx, this.chart);
		});

		var material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.FrontSide} );
		material.transparent = true;

		this.markMesh = new Mesh(
			new THREE.PlaneGeometry(width, height),
			material
		);
	}

	getObject3D() {
		return this.markMesh;
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
		let options = this.mark.options;
		// let meshMaterial = this.markMesh.material as MeshBasicMaterial;
		// let lineMaterial = this.line.material as LineBasicMaterial;
		// if (mark.row >= MAX_MARKS_IN_ROW - 1) {
		// 	meshMaterial.opacity = 0;
		// 	lineMaterial.opacity = 0;
		// } else {
		// 	meshMaterial.opacity = 1;
		// 	lineMaterial.opacity = 1;
		// }

		let screen = this.chart.screen;
		let posX = screen.getPointOnXAxis(mark.xVal);
		let posY = screen.getPointOnYAxis(mark.yVal);
		this.markMesh.position.set(posX, posY, 0);
	}

	private show() {
		if (!this.mark.segment) return;
		this.updatePosition();
		var animations = this.chart.state.animations;
		var time = animations.enabled ? 1 : 0;
		this.markMesh.scale.set(0.01, 0.01, 1);
		TweenLite.to(this.markMesh.scale, time, {x: 1, y: 1, ease: Elastic.easeOut});
	}
}

export const DEFAULT_RENDERER = (
	marks: TrendMark[],
	ctx: CanvasRenderingContext2D,
	chart: Chart
) =>  {

	let mark = marks[0];
	let options = mark.options;
	let isTopSide = options.orientation == TREND_MARK_SIDE.TOP;
	let color = options.color !== void 0 ?
		new Color(options.color) :
		new Color(chart.getTrend(options.trendName).getOptions().lineColor);
	let rgbaColor = color.getTransparent(0.5).rgbaStr;
	let {width, height} = options;
	let centerX = Math.round(width / 2);
	let centerY =  Math.round(height / 2);
	let font = chart.state.font.m;
	let textOffset = parseInt(font);
	let textPosX = centerX;
	let textPosY = isTopSide ? textOffset * 1.3 : height - textOffset * 0.7;

	// draw rect
	ctx.fillStyle = rgbaColor; //'rgba(0,0,0,0.3)';
	ctx.strokeStyle = rgbaColor;
	ctx.fillRect(
		0,
		isTopSide ? 0 : height,
		width,
		isTopSide ? textOffset * 2 : -textOffset * 2
	);


	// draw dot
	ctx.beginPath();
	ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI, false);
	ctx.fill();

	// draw line
	let lineEndY = textPosY ;
	ctx.beginPath();
	ctx.moveTo(centerX, centerY);
	ctx.lineTo(textPosX, lineEndY);
	ctx.stroke();

	// draw text
	ctx.beginPath();
	ctx.textAlign = 'center';
	ctx.font = font;
	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'white';
	ctx.fillText(
		options.title,
		Math.round(textPosX),
		Math.round(textPosY)
	);



	// uncomment to preview mark rect
	// ctx.rect(0, 0, width, height);
	// ctx.stroke();


	// let isTopSide = options.orientation == TREND_MARK_SIDE.TOP;
	// var circleOffset = isTopSide ? 30 : 0;
	// var circleR = 22;
	// var circleX = markWidth / 2;
	// var circleY = circleOffset + circleR;
	// var textOffset = isTopSide ? 10 : circleR * 2 + 15;

	// // title and description
	// ctx.beginPath();
	// ctx.textAlign = 'center';
	// ctx.font = "11px Arial";
	// ctx.fillStyle = 'rgba(255,255,255, 0.6)';
	// ctx.fillText(options.title, circleX, textOffset);
	// ctx.fillStyle = options.descriptionColor;
	// ctx.fillText(options.description, circleX, textOffset + 12);
    //
	// // icon circle
	// ctx.beginPath();
	// ctx.fillStyle = options.iconColor;
	// ctx.arc(circleX, circleY, circleR, 0, 2 * Math.PI);
	// ctx.fill();
    //
	// // icon text
	// ctx.font = "19px Arial";
	// ctx.fillStyle = 'rgb(255, 255, 255)';
	// ctx.fillText(options.icon, circleX, circleY + 7);
};
