
import {ChartWidget} from "../Widget";
import {ChartState} from "../State";
import LineSegments = THREE.LineSegments;
import Vector3 = THREE.Vector3;
/**
 * widget for drawing chart grid
 */
export class BorderWidget extends ChartWidget{
	static widgetName = 'Border';
	private lineSegments: LineSegments;


	constructor (chartState: ChartState) {
		super(chartState);
		var {width, height} = chartState.data;
		var geometry = new THREE.Geometry();
		var material = new THREE.LineBasicMaterial( { linewidth: 1, opacity: 0.0, transparent: true} );

		geometry.vertices.push(
			new Vector3(0, 0, 0), new Vector3(0, height, 0),
			new Vector3(0, height, 0), new Vector3(width, height, 0),
			new Vector3(width, height, 0), new Vector3(width, 0, 0),
			new Vector3(width, 0, 0), new Vector3(0, 0, 0)
		);
		this.lineSegments = new LineSegments(geometry, material);
	}
	getObject3D() {
		return this.lineSegments;
	}

}