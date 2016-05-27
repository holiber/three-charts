import PerspectiveCamera = THREE.PerspectiveCamera;
import Vector3 = THREE.Vector3;
import {ChartState, IChartState} from "./State";

/**
 * manage camera, and contains methods for transforming pixels to values
 */
export class Screen {
	camera: PerspectiveCamera;
	private chartState: ChartState;
	private cameraInitialPosition: Vector3;
	private cameraScrollXVal: number;
	private cameraScrollYVal: number;
	private cameraAnimation: TweenLite;

	constructor(chartState: ChartState) {
		this.chartState = chartState;
		var {width: w, height: h} = chartState.data;

		// setup pixel-perfect camera
		var FOV = 75;
		var vFOV = FOV * (Math.PI / 180);
		var camera = this.camera = new PerspectiveCamera(FOV, w / h, 0.1, 5000);
		camera.position.z = h / (2 * Math.tan(vFOV / 2) );

		// move 0,0 to left-bottom corner
		camera.position.x = w / 2;
		camera.position.y = h / 2;
		this.cameraInitialPosition = camera.position.clone();
		this.cameraScrollXVal = 0;
		this.bindEvents();

		//camera.position.z = 2000;
	}

	private scrollTo(xVal: number) {

		var pointX = this.cameraInitialPosition.x + this.chartState.valueToPxByXAxis(xVal);
		this.cameraScrollXVal = xVal;
		this.camera.position.x = pointX;

		// dirty hack, used only for performance reasons, in ideal world we always must use ChartState.setState
		this.chartState.emit('cameraChange', {scrollXVal: this.cameraScrollXVal});
	}

	private bindEvents() {
		var state = this.chartState;
		state.onScroll((changedProps: IChartState) => this.onScroll(changedProps));
		state.onZoom((changedProps: IChartState) => this.scrollTo(state.data.xAxis.range.scroll));
	}

	private onScroll(changedProps: IChartState) {
		var state = this.chartState;
		var isDragMode = state.data.cursor.dragMode;
		var animations =  state.data.animations;
		var canAnimate = (
			!isDragMode &&
			animations.enabled &&
			changedProps.xAxis.range.from == void 0 &&
			changedProps.xAxis.range.to == void 0
		);
		//canAnimate = false;
		var animationObject = {scrollXVal: this.cameraScrollXVal};
		var targetXVal = state.data.xAxis.range.scroll;
		if (this.cameraAnimation) this.cameraAnimation.kill();
		if (canAnimate) {
			this.cameraAnimation = TweenLite.to(animationObject, animations.autoScrollSpeed, {
				scrollXVal: targetXVal, ease: animations.autoScrollEase
			});
			this.cameraAnimation.eventCallback('onUpdate', () => {
				this.scrollTo(animationObject.scrollXVal);
			});
			return;
		}
		this.scrollTo(targetXVal);
	}

}