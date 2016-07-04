import { Chart, AXIS_RANGE_TYPE, ITrendItem, Utils, AXIS_DATA_TYPE } from '../../src';
import { TREND_TYPE } from '../../src/Trend';

var chart: Chart;

class DataSourse {
	data: ITrendItem[] = [];
	startTime: number;
	endTime: number;

	constructor() {
		let sec = 0;
		let val = 70;
		this.startTime = Date.now();

		while (sec < 15) { //2592000
			this.data.push({
				xVal: this.startTime + sec * 1000,
				yVal: val
			});
			val += Math.random() * 14 - 7;
			sec++;
		}
		this.endTime = this.data[this.data.length - 1].xVal;
	}

	getData() {
		return Utils.deepCopy(this.data);
	}

	getNext() {
		var lastVal = this.data[this.data.length - 1];
		var yVal = lastVal.yVal + Math.random() * 14 - 7;
		var xVal = this.endTime + 1000;
		this.endTime = xVal;
		var item = {
			xVal: xVal,
			yVal: yVal
		};
		this.data.push(item);
		return item;
	}

	getPrev() {
		var firstVal = this.data[0];
		var yVal = firstVal.yVal + Math.random() * 14 - 7;
		var xVal = this.startTime - 1000;
		this.startTime = xVal;
		var item = {
			xVal: xVal,
			yVal: yVal
		};
		this.data.unshift(item);
		return item;
	}
}





window.onload = function () {
	
	var dsMain = new DataSourse();

	chart = new Chart({
		$el: document.querySelector('.chart'),
		xAxis: {
			dataType: AXIS_DATA_TYPE.DATE,
			range: {
				type: AXIS_RANGE_TYPE.FIXED,
				from: Date.now(),
				to: Date.now() + 20000,
				maxLength: 5000000,
				minLength: 5000
			},
			marks: [
				{value: dsMain.endTime + 30000, name: 'brake', title: 'BRAKE', lineColor: '#ff6600'},
				{value: dsMain.endTime + 40000, name: 'close', title: 'CLOSE', lineColor: '#005187'}
			]
		},
		trends: {
			'main': {
				type: TREND_TYPE.LINE,
				dataset: dsMain.getData(),
				hasBeacon: true,
				hasIndicator: true
			}
		},
		showStats: true
	});
	
	(<any>window)['chart'] = chart;

	
	setInterval(() => {
		var val = dsMain.getNext();
		 chart.getTrend('main').appendData([val]);
	}, 1000);
};

