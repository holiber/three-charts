
import {Chart, AXIS_RANGE_TYPE} from './src/Chart';

var chart: Chart;

class DataSourse {
	data: number[] = [];

	constructor() {
		let sec = 0;
		let val = 70;

		while (sec < 80) {
			this.data.push(val);
			val += Math.random() * 14 - 7;
			sec++;
		}
	}

	getNext() {
		var lastVal = this.data[this.data.length - 1];
		var nextVal = lastVal + Math.random() * 14 - 7;
		this.data.push(nextVal);
		return nextVal;
	}
}

window.onload = function () {

	initListeners();

	var dsMain = new DataSourse();
	var dsRed = new DataSourse();
	var dsBlue = new DataSourse();

	chart = new Chart({
		$el: document.querySelector('.chart'),
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 20, to: 150}
		},
		xAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100},
		},
		trends: {
			'main': {dataset: dsMain.data, hasBeacon: true, hasIndicator: true},
			'red': {dataset: dsRed.data, lineColor: 0xFF2222, lineWidth: 2, hasGradient: false, hasIndicator: true, enabled: false},
			'blue': {dataset: dsBlue.data, lineColor: 0x2222FF, lineWidth: 2, hasGradient: false, hasIndicator: true, enabled: false},
		}
	});
	
	(<any>window)['chart'] = chart;

	var previewChart1 = new Chart({
		$el: document.querySelectorAll('.preview-chart')[0],
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 20, to: 150}
		},
		xAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100}
		},
		trends: {
			'main': {dataset: dsMain.data, hasBeacon: true}
		},
		animations: {enabled: false},
		widgets: {
			Grid: {enabled: false},
			Axis: {enabled: false},
			trendsGradient: {enabled: false}
		}
	});

	var previewChart2 = new Chart({
		$el: document.querySelectorAll('.preview-chart')[1],
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 200}
		},
		xAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 200}
		},
		trends: {
			'main': {dataset: dsMain.data, hasBeacon: true}
		},
		animations: {enabled: false},
		widgets: {
			Grid: {enabled: false},
			Axis: {enabled: false},
			trendsGradient: {enabled: false}
		}
	});

	var previewChart3 = new Chart({
		$el: document.querySelectorAll('.preview-chart')[2],
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100}
		},
		xAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 80}
		},
		trends: {
			'main': {dataset: dsMain.data, hasBeacon: true},
			'red': {dataset: dsRed.data, lineColor: 0xFF2222},
		},
		animations: {enabled: false},
		widgets: {
			Grid: {enabled: false},
			Axis: {enabled: false},
			trendsGradient: {enabled: false}
		}
	});


	setInterval(() => {

		var val = dsMain.getNext();
		chart.getTrend('main').appendData([val]);
		chart.getTrend('red').appendData([val + 10 + Math.random() * 20]);
		chart.getTrend('blue').appendData([val + 20 + Math.random() * 20]);


		// previewChart1.getTrend('main').appendData([val]);
		// previewChart2.getTrend('main').appendData([val + 10 + Math.random() * 20]);
		// previewChart3.getTrend('red').appendData([val + 20 + Math.random() * 20]);
		
		// previewChart1.appendData(dataToAppend1);
		//
		// var chartData2 = previewChart2.state.data.trends[0].data;
		// var lastItem2 = chartData2[chartData.length - 1];
		// var dataToAppend2 = [
		// 	{xVal: lastItem2.xVal + 1, yVal: lastItem2.yVal + Math.random() * 14 - 7 },
		// ];
		// previewChart2.appendData(dataToAppend2);
		// previewChart3.appendData(dataToAppend2);
	}, 1000);
};


function initListeners() {
	var $checkboxMaintrend = document.querySelector('input[name="maintrend"]') as HTMLInputElement;
	$checkboxMaintrend.addEventListener('change', () => {
		chart.setState({trends: {main: {enabled: $checkboxMaintrend.checked}}});
	});
	var $checkboxRedtrend = document.querySelector('input[name="redtrend"]') as HTMLInputElement;
	$checkboxRedtrend.addEventListener('change', () => {
		chart.setState({trends: {red: {enabled: $checkboxRedtrend.checked}}});
	});
	var $checkboxBluetrend = document.querySelector('input[name="bluetrend"]') as HTMLInputElement;
	$checkboxBluetrend.addEventListener('change', () => {
		chart.setState({trends: {blue: {enabled: $checkboxBluetrend.checked}}});
	});
}


