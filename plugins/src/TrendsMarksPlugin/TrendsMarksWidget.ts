import {Chart, Utils, TrendsWidget, TrendWidget, TRANSFORMATION_EVENT, Color } from 'three-charts';
import { TrendMark, TREND_MARK_SIDE, TrendsMarksPlugin, TEXTURE_FILTER } from "./TrendsMarksPlugin";
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
import LinearFilter = THREE.LinearFilter;
import NearestFilter = THREE.NearestFilter;


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
		this.bindEvent(this.getTrendsMarksPlugin().onChange(() => this.onMarksChange()));
		this.bindEvent(this.chart.screen.onTransformationEvent((event) => this.onScreenTransformationEvent(event)));
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

	private onScreenTransformationEvent(event: TRANSFORMATION_EVENT) {
		var widgets = this.marksWidgets;
		for (let markName in widgets) {
			widgets[markName].onScreenTransformationEventHandler(event);
		}
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
export class TrendMarkWidget {
	mark: TrendMark;
	private chart: Chart;
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

		let texture = Utils.createNearestTexture(width, height, (ctx) => {
			options.onRender(this, ctx, this.chart);
		});


		// make text sharp when screen is not transforming
		switch (options.textureFilter) {
			case TEXTURE_FILTER.AUTO:
				texture.magFilter = this.chart.screen.transformationInProgress ? LinearFilter : NearestFilter;
			case TEXTURE_FILTER.LINEAR:
				texture.magFilter = LinearFilter;
			case TEXTURE_FILTER.NEAREST:
				texture.magFilter = NearestFilter;
		}

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

	onScreenTransformationEventHandler(event: TRANSFORMATION_EVENT) {
		let texture = (this.markMesh.material as MeshBasicMaterial).map;

		// make text sharp when screen is not transforming
		if (this.mark.options.textureFilter !== TEXTURE_FILTER.AUTO) return;
		texture.magFilter = (event == TRANSFORMATION_EVENT.STARTED) ? LinearFilter : NearestFilter;
		texture.needsUpdate =true;
	}

	private updatePosition() {
		if (!this.mark.segment) return;
		let mark = this.mark;
		let screen = this.chart.screen;

		let posX = screen.getPointOnXAxis(mark.xVal);
		let posY = screen.getPointOnYAxis(mark.yVal);

		this.markMesh.position.set(posX, posY, 0);
	}

	private show() {
		if (!this.mark.segment) return;
		this.updatePosition();
		this.markMesh.scale.set(0.01, 0.01, 0);

		this.chart.animationManager
			.animate(1000, this.mark.options.ease)
			.from(this.markMesh.scale as Object)
			.to({x: 1, y: 1});
	}
}

export const DEFAULT_RENDERER = (
	trendMarkWidget: TrendMarkWidget,
	ctx: CanvasRenderingContext2D,
	chart: Chart
) =>  {

	let mark = trendMarkWidget.mark;
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
	ctx.fillStyle = rgbaColor;
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
	ctx.lineTo(centerX, lineEndY);
	ctx.stroke();

	// draw text
	ctx.beginPath();
	ctx.textAlign = 'center';
	ctx.font = font;
	ctx.fillStyle = 'rgba(250, 250, 250, 0.8)';
	ctx.fillText(
		options.title,
		Math.round(textPosX),
		Math.round(textPosY)
	);



	// uncomment to preview mark rect
	ctx.rect(0, 0, width, height);
	ctx.stroke();

};
