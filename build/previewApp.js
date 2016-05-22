var previewApp =
webpackJsonp_name_([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Chart_1 = __webpack_require__(1);
	var chart;
	var DataSourse = (function () {
	    function DataSourse() {
	        this.data = [];
	        var sec = 0;
	        var val = 70;
	        while (sec < 50) {
	            this.data.push(val);
	            val += Math.random() * 14 - 7;
	            sec++;
	        }
	    }
	    DataSourse.prototype.getNext = function () {
	        var lastVal = this.data[this.data.length - 1];
	        var nextVal = lastVal + Math.random() * 14 - 7;
	        this.data.push(nextVal);
	        return nextVal;
	    };
	    DataSourse.prototype.getPrev = function () {
	        var firstVal = this.data[0];
	        var nextVal = firstVal + Math.random() * 14 - 7;
	        this.data.unshift(nextVal);
	        return nextVal;
	    };
	    return DataSourse;
	}());
	window.onload = function () {
	    //initListeners();
	    var dsMain = new DataSourse();
	    var dsRed = new DataSourse();
	    var dsBlue = new DataSourse();
	    chart = new Chart_1.Chart({
	        $el: document.querySelector('.chart'),
	        // yAxis: {
	        // 	range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100}
	        // },
	        xAxis: {
	            range: { type: Chart_1.AXIS_RANGE_TYPE.FIXED, from: 0, to: 100 },
	        },
	        trends: {
	            'main': { dataset: dsMain.data, hasBeacon: true, hasIndicator: true, hasGradient: false },
	        }
	    });
	    window['chart'] = chart;
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
	    chart.getTrend('main').onPrependRequest(function (requestedLength, resolve, reject) {
	        var responseData = [];
	        var ticksCount = Math.round(requestedLength);
	        while (ticksCount--)
	            responseData.unshift(dsMain.getPrev());
	        setTimeout(function () {
	            resolve(responseData);
	        }, 4000);
	    });
	    setInterval(function () {
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
	// function initListeners() {
	// 	var $checkboxMaintrend = document.querySelector('input[name="maintrend"]') as HTMLInputElement;
	// 	$checkboxMaintrend.addEventListener('change', () => {
	// 		chart.setState({trends: {main: {enabled: $checkboxMaintrend.checked}}});
	// 	});
	// 	var $checkboxRedtrend = document.querySelector('input[name="redtrend"]') as HTMLInputElement;
	// 	$checkboxRedtrend.addEventListener('change', () => {
	// 		chart.setState({trends: {red: {enabled: $checkboxRedtrend.checked}}});
	// 	});
	// 	var $checkboxBluetrend = document.querySelector('input[name="bluetrend"]') as HTMLInputElement;
	// 	$checkboxBluetrend.addEventListener('change', () => {
	// 		chart.setState({trends: {blue: {enabled: $checkboxBluetrend.checked}}});
	// 	});
	// }


/***/ }
]);
//# sourceMappingURL=previewApp.js.map