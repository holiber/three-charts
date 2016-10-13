import { Chart, AXIS_RANGE_TYPE, ITrendItem, Utils, AXIS_DATA_TYPE } from '../src';
import { TREND_TYPE } from '../src/Trend';
import { TREND_MARK_SIDE, ITrendMarkOptions } from '../src/plugins/TrendsMarks/TrendsMarksPlugin';
import enabled = THREE.Cache.enabled;
import { TrendsMarksPlugin } from '../src/plugins/TrendsMarks/TrendsMarksPlugin';

var chart: Chart;

class DataSourse {
	data: ITrendItem[] = [];
	startTime: number;
	endTime: number;

	constructor() {
		let sec = 0;
		let val = 70;
		this.startTime = Date.now();

		while (sec < 100) { //2592000
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

class MarksSource {
	static getNext(val: number): ITrendMarkOptions {
		if (Math.random() > 0.2) return null;
		return this.generate(val);
	}

	static generate(val: number): ITrendMarkOptions {
		let descriptionColor = 'rgb(40,136,75)';
		let orientation =  Utils.getRandomItem([TREND_MARK_SIDE.TOP, TREND_MARK_SIDE.BOTTOM]);
		if (orientation == TREND_MARK_SIDE.BOTTOM) {
			descriptionColor = 'rgb(219,73,49)';
		}
			
		return {
			trendName: 'main',
			value: val,
			title: Utils.getRandomItem(['Alex Malcon', 'Serg Morrs', 'Harry Potter']),
			description: Utils.getRandomItem(['$10 -> 20$', '$15 -> 30$', '40$ -> 80$']),
			icon: Utils.getRandomItem(['AM', 'SM', 'HP']),
			iconColor: Utils.getRandomItem(['rgb(69,67,130)', 'rgb(124,39,122)']),
			orientation: orientation,
			descriptionColor: descriptionColor
		}
	}
}

window.onload = function () {

	initListeners();

	var dsMain = new DataSourse();
	var dsRed = new DataSourse();
	var dsBlue = new DataSourse();
	var now = Date.now();

	chart = new Chart({
		yAxis: {
			marks: [
				{value: dsMain.data[0].yVal, name: 'openprice', title: 'OPEN PRICE', lineColor: '#29874b', stickToEdges: true},
			],
			range: {

				padding: {end: 100, start: 100},
				margin: {end: 50, start: 50},
				zeroVal: 70
			}
		},
		xAxis: {
			//range: {type: AXIS_RANGE_TYPE.FIXED, from: 10, to: 30},
			dataType: AXIS_DATA_TYPE.DATE,
			range: {
				type: AXIS_RANGE_TYPE.FIXED,
				from: Date.now(),
				to: Date.now() + 20000,
				padding: {end: 200, start: 0},
				maxLength: 5000000,
				minLength: 5000
			},
			marks: [
				{value: dsMain.endTime + 30000, name: 'deadline', title: 'DEADLINE', lineColor: '#ff6600', type: 'timeleft', showValue: true},
				{value: dsMain.endTime + 40000, name: 'close', title: 'CLOSE', lineColor: '#005187', type: 'timeleft', showValue: true}
			]
			// range: {
			// 	from: 80,
			// 	to: 90
			// }
		},
		trends: {
			'main': {
				type: TREND_TYPE.LINE,
				dataset: dsMain.getData(),
				hasBeacon: true,
				hasIndicator: true,
				hasGradient: false,
			},
			// 'red': {dataset: dsRed.data, lineColor: 0xFF2222, lineWidth: 2, hasGradient: false, hasIndicator: true, enabled: false},
			// 'blue': {dataset: dsBlue.data, lineColor: 0x2222FF, lineWidth: 2, hasGradient: false, hasIndicator: true, enabled: false},
		},
		showStats: true,
		// autoRender: {fps: 100},
		// animations: {enabled: false},
		widgets: {
			//Grid: {enabled: false},
			//Axis: {enabled: false},
			TrendsGradient: {enabled: false},
			//TrendsBeacon: {enabled: false},
			//TrendsIndicator: {enabled: false},
			// TrendsMarks: {enabled: false},
			// TrendsLoading: {enabled: false},
			// AxisMarks: {enabled: false}
		}
	},
	document.querySelector('.chart'),
	[
		new TrendsMarksPlugin({items: [MarksSource.generate(now + 3000), MarksSource.generate(now + 3000), MarksSource.generate(now + 4000)]})
	]);

	chart.setState({animations: {enabled: false}});
	chart.setState({animations: {enabled: true}});
	
	(<any>window)['chart'] = chart;

	var mainTrend = chart.getTrend('main');
	var deadlineMark = chart.state.xAxisMarks.getItem('deadline');
	var closeMark = chart.state.xAxisMarks.getItem('close');

	mainTrend.onDataChange(() => {
		var closeValue = closeMark.options.value;
		if (mainTrend.getLastItem().xVal >= closeValue) {
			deadlineMark.setOptions({value: closeValue + 10000});
			closeMark.setOptions({value: closeValue + 20000})
		}
		var markOptions = MarksSource.getNext(mainTrend.getLastItem().xVal);
		if (markOptions) setTimeout(() => {
			let trendsMarks = chart.state.getPlugin(TrendsMarksPlugin.NAME) as TrendsMarksPlugin;
			trendsMarks.createMark(markOptions);
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
		}, 2000)
	});

	setInterval(() => {
		i++;
		var val = dsMain.getNext();

		// [i % 2 ? 10 : 20]

		 chart.getTrend('main').appendData([val]);
		// chart.getTrend('main').prependData([dsMain.getPrev(), dsMain.getPrev()].reverse());
		// chart.getTrend('main').appendData([val, dsMain.getNext(), dsMain.getNext(), dsMain.getNext(), dsMain.getNext()]);
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

	var $switchLineBtn = document.querySelector('[name="switch-line"]') as HTMLInputElement;
	$switchLineBtn.addEventListener('click', () => {
		chart.getTrend('main').setOptions({type: TREND_TYPE.LINE});
	});

	var $switchBarsBtn = document.querySelector('[name="switch-bars"]') as HTMLInputElement;
	$switchBarsBtn.addEventListener('click', () => {
		chart.getTrend('main').setOptions({type: TREND_TYPE.CANDLE});
	});

	document.querySelector('[name="move-left"]').addEventListener('click', () => {
		let currentRange = chart.state.data.xAxis.range;
		chart.setState({xAxis: {range: {from: currentRange.from - 2000}}});
	});

	document.querySelector('[name="move-right"]').addEventListener('click', () => {
		let currentRange = chart.state.data.xAxis.range;
		chart.setState({xAxis: {range: {to: currentRange.to + 2000}}});
	});
	
	var timeframeButtons = document.querySelectorAll(".timeframe");
	for (var i = 0; i < timeframeButtons.length; i++) {
		timeframeButtons[i].addEventListener("click", function() {
			var range = Number(this.getAttribute('data-range'));
			var segmentLength = Number(this.getAttribute('data-segment-length'));


			chart.state.setState({autoScroll: false});
			chart.state.zoomToRange(range);
			chart.state.scrollToEnd().then(() => {
				chart.state.setState({autoScroll: true});
			});
		});
	}
}


