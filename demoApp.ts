
import {Chart, AXIS_RANGE_TYPE} from './src/Chart';

window.onload = function () {
	var data: number[] = [];
	let sec = 0;
	let val = 66;

	while (sec < 45) {
		data.push(val);
		val += Math.random() * 14 - 7;
		sec++;
	}

	var chart = new Chart({
		$el: document.querySelector('.chart'),
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 20, to: 150}
		},
		xAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100}
		},
		trend: {dataset: data}
	});

	var previewChart1 = new Chart({
		$el: document.querySelectorAll('.preview-chart')[0],
		yAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 20, to: 150}
		},
		xAxis: {
			range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100}
		},
		trend: {dataset: data},
		animations: {enabled: false},
		widgets: {
			Grid: {enabled: false},
			Axis: {enabled: false},
			TrendGradient: {enabled: false}
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
		trend: {dataset: data},
		animations: {enabled: false},
		widgets: {
			Grid: {enabled: false},
			Axis: {enabled: false},
			TrendGradient: {enabled: false}
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
		trend: {dataset: data},
		animations: {enabled: false},
		widgets: {
			Grid: {enabled: false},
			Axis: {enabled: false},
			TrendGradient: {enabled: false}
		}
	});


	setInterval(() => {
		var chartData = chart.state.data.trend.data;
		var lastItem = chartData[chartData.length - 1];
		var dataToAppend1 = [
			{xVal: lastItem.xVal + 1, yVal: lastItem.yVal + Math.random() * 14 - 7 },
			// {xVal: lastItem.xVal + 2, yVal: lastItem.yVal + Math.random() * 14 - 7 },
			// {xVal: lastItem.xVal + 3, yVal: lastItem.yVal + Math.random() * 14 - 7 },
			// {xVal: lastItem.xVal + 4, yVal: lastItem.yVal + Math.random() * 14 - 7 }
		];
		chart.appendData(dataToAppend1);
		previewChart1.appendData(dataToAppend1);

		var chartData2 = previewChart2.state.data.trend.data;
		var lastItem2 = chartData2[chartData.length - 1];
		var dataToAppend2 = [
			{xVal: lastItem2.xVal + 1, yVal: lastItem2.yVal + Math.random() * 14 - 7 },
		];
		previewChart2.appendData(dataToAppend2);
		previewChart3.appendData(dataToAppend2);
	}, 1000);
};


