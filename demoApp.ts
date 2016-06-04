
import {Chart, AXIS_RANGE_TYPE, ITrendItem, ITrendMarkOptions, Utils, AXIS_DATA_TYPE} from './src';

var chart: Chart;

class DataSourse {
	data: ITrendItem[] = [];
	startTime: number;
	endTime: number;

	constructor() {
		let sec = 0;
		let val = 70;
		this.startTime = Date.now();

		while (sec < 20) {
			this.data.push({
				xVal: this.startTime + sec * 1000,
				yVal: val
			});
			val += Math.random() * 14 - 7;
			sec++;
		}
		this.endTime = this.data[this.data.length - 1].xVal;
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

class MarksSource {
	static getNext(val: number): ITrendMarkOptions {
		if (Math.random() > 0.2) return null;
		return this.generate(val);
	}

	static generate(val: number): ITrendMarkOptions {
		return {
			value: val,
			title: Utils.getRandomItem(['Alex Malcon', 'Serg Morrs', 'Harry Potter']),
			description: Utils.getRandomItem(['$10 -> 20$', '$15 -> 30$', '40$ -> 80$']),
			icon: Utils.getRandomItem(['AM', 'SM', 'HP']),
			iconColor: Utils.getRandomItem(['rgb(255, 102, 217)', 'rgb(69,67,130)', 'rgb(124,39,122)']),
		}
	}
}

window.onload = function () {

	initListeners();

	var dsMain = new DataSourse();
	var dsRed = new DataSourse();
	var dsBlue = new DataSourse();

	chart = new Chart({
		$el: document.querySelector('.chart'),
		// yAxis: {
		// 	range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100}
		// },
		xAxis: {
			//range: {type: AXIS_RANGE_TYPE.FIXED, from: 10, to: 30},
			dataType: AXIS_DATA_TYPE.DATE,
			range: {
				type: AXIS_RANGE_TYPE.FIXED,
				from: Date.now(),
				to: Date.now() + 20000,
				maxLength: 500000,
				minLength: 5000
			},
			marks: [
				{value: Date.now() + 30000, name: 'deadline', title: 'DEADLINE', lineColor: '#ff6600', type: 'timeleft'},
				{value: Date.now() + 40000, name: 'close', title: 'CLOSE', lineColor: '#005187', type: 'timeleft'}
			]
			// range: {
			// 	from: 80,
			// 	to: 90
			// }
		},
		trends: {
			'main': {
				dataset: dsMain.data,
				hasBeacon: true,
				hasIndicator: true,
				hasGradient: false,
				marks: [MarksSource.generate(Date.now() + 3000)]
			},
			// 'red': {dataset: dsRed.data, lineColor: 0xFF2222, lineWidth: 2, hasGradient: false, hasIndicator: true, enabled: false},
			// 'blue': {dataset: dsBlue.data, lineColor: 0x2222FF, lineWidth: 2, hasGradient: false, hasIndicator: true, enabled: false},
		},
		widgets: {
			//Grid: {enabled: false},
			//Axis: {enabled: false},
			TrendsGradient: {enabled: false},
			//TrendsBeacon: {enabled: false},
			//TrendsIndicator: {enabled: false},
			//TrendsMarks: {enabled: false}
		}
	});
	
	(<any>window)['chart'] = chart;

	var mainTrend = chart.getTrend('main');
	var deadlineMark = chart.state.xAxisMarks.getItem('deadline');
	var closeMark = chart.state.xAxisMarks.getItem('close');

	mainTrend.onDataChange(() => {
		var closeValue = closeMark.options.value;
		if (mainTrend.getLastItem().xVal >= closeValue) {
			deadlineMark.setOptions({value: closeValue + 10000})
			closeMark.setOptions({value: closeValue + 20000})
		}
		var markOptions = MarksSource.getNext(mainTrend.getLastItem().xVal);
		if (markOptions) setTimeout(() => {
			mainTrend.marks.createMark(markOptions);
		}, 500);
	});


	// var previewChart1 = Chart.createPreviewChart({
	// 	$el: document.querySelectorAll('.preview-chart')[0],
	// 	yAxis: {
	// 		range: {type: AXIS_RANGE_TYPE.FIXED, from: 20, to: 150}
	// 	},
	// 	xAxis: {
	// 		range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100}
	// 	},
	// 	trends: {
	// 		'main': {dataset: dsMain.data, hasBeacon: true}
	// 	}
	// });
	//
	// var previewChart2 = Chart.createPreviewChart({
	// 	$el: document.querySelectorAll('.preview-chart')[1],
	// 	yAxis: {
	// 		range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 200}
	// 	},
	// 	xAxis: {
	// 		range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 200}
	// 	},
	// 	trends: {
	// 		'main': {dataset: dsMain.data, hasBeacon: true}
	// 	},
	//
	// });
	//
	// var previewChart3 = Chart.createPreviewChart({
	// 	$el: document.querySelectorAll('.preview-chart')[2],
	// 	yAxis: {
	// 		range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100}
	// 	},
	// 	xAxis: {
	// 		range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 80}
	// 	},
	// 	trends: {
	// 		'main': {dataset: dsMain.data, hasBeacon: true},
	// 		'red': {dataset: dsRed.data, lineColor: 0xFF2222},
	// 	}
	// });
	//

	var i = 0;

	chart.getTrend('main').onPrependRequest((requestedLength, resolve, reject) => {
		var responseData: ITrendItem[] = [];
		var ticksCount = Math.round(requestedLength / 1000) ;
		while (ticksCount--) responseData.unshift(dsMain.getPrev());
		setTimeout(() => {
			resolve(responseData);
		}, 1000)
	});

	setInterval(() => {
		i++;
		var val = dsMain.getNext();

		// [i % 2 ? 10 : 20]
		
		chart.getTrend('main').appendData([val]);
		// chart.getTrend('main').prependData([val, dsMain.getNext(), dsMain.getNext(), dsMain.getNext()]);
		// chart.getTrend('red').appendData([val + 10 + Math.random() * 20]);
		// chart.getTrend('blue').appendData([val + 20 + Math.random() * 20]);



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


