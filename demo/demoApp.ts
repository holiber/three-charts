
// import { ChartView, AXIS_RANGE_TYPE, ITrendItem, Utils, AXIS_DATA_TYPE, TREND_TYPE } from '../src';

import { ChartView, AXIS_RANGE_TYPE, ITrendItem, Utils, AXIS_DATA_TYPE, TREND_TYPE, AXIS_TYPE } from 'three-charts';
import { TREND_MARK_SIDE, ITrendMarkOptions, TrendsMarksPlugin } from '../plugins/src/TrendsMarksPlugin';
import { TrendsBeaconWidget } from '../plugins/src/TrendsBeaconWidget';
import { TrendsLoadingWidget } from '../plugins/src/TrendsLoadingWidget';
import { TrendsIndicatorWidget } from '../plugins/src/TrendsIndicatorWidget';
import { AxisMarksPlugin } from "../plugins/src/AxisMarksPlugin/AxisMarksPlugin";
import { ZonesPlugin } from "../plugins/src/ZonesPlugin/ZonesPlugin";
ChartView.preinstalledWidgets.push(TrendsLoadingWidget, TrendsBeaconWidget, TrendsIndicatorWidget);

var chartView: ChartView;

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
			xVal: val,
			title: Utils.getRandomItem(['Alex Malcon 224', 'Serg Morrs 453', 'Harry Potter 554']),
			color: Utils.getRandomItem(['rgba(#ad57b2, 0.5)', 'rgba(#0099d9, 0.5)']),
			orientation: orientation,
			// textureFilter: TEXTURE_FILTER.NEAREST,
			userData: {
				description: Utils.getRandomItem(['$10 -> 20$', '$15 -> 30$', '40$ -> 80$']),
				icon: Utils.getRandomItem(['AM', 'SM', 'HP']),
				descriptionColor: descriptionColor
			}
		}
	}
}

window.onload = function () {

	initListeners();

	var dsMain = new DataSourse();
	var dsRed = new DataSourse();
	var dsBlue = new DataSourse();
	var now = Date.now();



	chartView = new ChartView({
		yAxis: {
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
				padding: {end: 0, start: 0},
				maxLength: 5000000,
				minLength: 5000,
				margin: {end: 200},
			},
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
				hasBackground: true,
			},
			// 'red': {dataset: dsRed.state, lineColor: 0xFF2222, lineWidth: 2, hasGradient: false, hasIndicator: true, enabled: false},
			// 'blue': {dataset: dsBlue.state, lineColor: 0x2222FF, lineWidth: 2, hasGradient: false, hasIndicator: true, enabled: false},
		},
		showStats: true,
		// autoRender: {fps: 100},
		// animations: {enabled: false},

		trendDefaultState: {
			settingsForTypes: {
				LINE: {
					// minSegmentLengthInPx: 10
				}
			}
		}
	},
	document.querySelector('.chart')
		,
	[
		new ZonesPlugin([]),
		new TrendsMarksPlugin({items: [MarksSource.generate(now + 3000), MarksSource.generate(now + 3000), MarksSource.generate(now + 4000)]}),
		new AxisMarksPlugin([
			{axisType: AXIS_TYPE.X, value: dsMain.startTime, name: 'test', title: 'DEADLINE', userData: {feel: 'aa'}},
			{axisType: AXIS_TYPE.X, value: dsMain.endTime + 30000, name: 'deadline', title: 'DEADLINE', lineColor: '#ff6600'},
			{axisType: AXIS_TYPE.X, value: dsMain.endTime + 40000, name: 'close', title: 'CLOSE', lineColor: '#005187'},

		])
	]
	);


	let axisMarks = chartView.chart.getPlugin(AxisMarksPlugin.NAME) as AxisMarksPlugin;
	let zones = chartView.chart.getPlugin(ZonesPlugin.NAME) as ZonesPlugin;

	setTimeout(() => {
		let zone = zones.create({position: {startXVal: dsMain.startTime, endXVal: dsMain.startTime + 5000}});
		let mark = axisMarks.createMark({axisType: AXIS_TYPE.Y, value: dsMain.data[0].yVal, name: 'openprice', title: 'OPEN PRICE', lineColor: '#29874b', stickToEdges: true});
		setInterval(() => {
			mark.update({value: mark.value + 1});
			//zone.update({position: {startXVal: zone.position.startXVal + 1000}})
		}, 1000);
	}, 1000);
	
	(<any>window)['chartView'] = chartView;

	var mainTrend = chartView.getTrend('main');

	mainTrend.onDataChange(() => {

		var markOptions = MarksSource.getNext(mainTrend.getLastItem().xVal);
		if (markOptions) setTimeout(() => {
			let trendsMarks = chartView.chart.getPlugin(TrendsMarksPlugin.NAME) as TrendsMarksPlugin;
			trendsMarks.createMark(markOptions);
		}, 500);
	});



	var i = 0;

	chartView.getTrend('main').onPrependRequest((requestedLength, resolve, reject) => {
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

		 chartView.getTrend('main').appendData([val]);

	}, 1000);
};


function initListeners() {
	var $checkboxMaintrend = document.querySelector('input[name="maintrend"]') as HTMLInputElement;
	$checkboxMaintrend.addEventListener('change', () => {
		chartView.setState({trends: {main: {enabled: $checkboxMaintrend.checked}}});
	});
	var $checkboxRedtrend = document.querySelector('input[name="redtrend"]') as HTMLInputElement;
	$checkboxRedtrend.addEventListener('change', () => {
		chartView.setState({trends: {red: {enabled: $checkboxRedtrend.checked}}});
	});
	var $checkboxBluetrend = document.querySelector('input[name="bluetrend"]') as HTMLInputElement;
	$checkboxBluetrend.addEventListener('change', () => {
		chartView.setState({trends: {blue: {enabled: $checkboxBluetrend.checked}}});
	});

	var $switchLineBtn = document.querySelector('[name="switch-line"]') as HTMLInputElement;
	$switchLineBtn.addEventListener('click', () => {
		chartView.getTrend('main').setOptions({type: TREND_TYPE.LINE});
	});

	var $switchBarsBtn = document.querySelector('[name="switch-bars"]') as HTMLInputElement;
	$switchBarsBtn.addEventListener('click', () => {
		chartView.getTrend('main').setOptions({type: TREND_TYPE.CANDLE});
	});

	document.querySelector('[name="move-left"]').addEventListener('click', () => {
		let currentRange = chartView.chart.state.xAxis.range;
		chartView.setState({xAxis: {range: {from: currentRange.from - 2000}}});
	});

	document.querySelector('[name="move-right"]').addEventListener('click', () => {
		let currentRange = chartView.chart.state.xAxis.range;
		chartView.setState({xAxis: {range: {to: currentRange.to + 2000}}});
	});
	
	var timeframeButtons = document.querySelectorAll(".timeframe");
	for (var i = 0; i < timeframeButtons.length; i++) {
		timeframeButtons[i].addEventListener("click", function() {
			var range = Number(this.getAttribute('data-range'));
			var segmentLength = Number(this.getAttribute('data-segment-length'));


			chartView.chart.setState({autoScroll: false});
			chartView.chart.zoomToRange(range);
			chartView.chart.scrollToEnd().then(() => {
				chartView.chart.setState({autoScroll: true});
			});
		});
	}
}


