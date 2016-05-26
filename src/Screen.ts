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
	private cameraScrollX: number;
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
		this.cameraScrollX = 0;
		this.bindEvents();

		//camera.position.z = 2000;
	}

	private bindEvents() {
		this.chartState.onScroll((changedProps: IChartState) => this.onScroll(changedProps));
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
		var targetX = this.cameraInitialPosition.x + state.data.xAxis.range.scroll;
		if (this.cameraAnimation) this.cameraAnimation.kill();
		if (canAnimate) {
			this.cameraAnimation = TweenLite.to(this.camera.position, animations.autoScrollSpeed, {x: targetX, ease: animations.autoScrollEase});
			this.cameraAnimation.eventCallback('onUpdate', () => {
				this.cameraScrollX = this.camera.position.x - this.cameraInitialPosition.x;
				state.emit('cameraChange', {scrollX: this.cameraScrollX});
			});
			return;
		}
		this.cameraScrollX = state.data.xAxis.range.scroll;

		// dirty hack, used only for performance reasons, in ideal world we always must use ChartState.setState
		state.emit('cameraChange', {scrollX: this.cameraScrollX});

		this.camera.position.x = targetX;
	}
}