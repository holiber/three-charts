"use strict";
var src_1 = require('./src');
var chart;
var DataSourse = (function () {
    function DataSourse() {
        this.data = [];
        var sec = 0;
        var val = 70;
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
    DataSourse.prototype.getNext = function () {
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
    };
    DataSourse.prototype.getPrev = function () {
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
    };
    return DataSourse;
}());
var MarksSource = (function () {
    function MarksSource() {
    }
    MarksSource.getNext = function (val) {
        if (Math.random() > 0.2)
            return null;
        return this.generate(val);
    };
    MarksSource.generate = function (val) {
        return {
            value: val,
            title: src_1.Utils.getRandomItem(['Alex Malcon', 'Serg Morrs', 'Harry Potter']),
            description: src_1.Utils.getRandomItem(['$10 -> 20$', '$15 -> 30$', '40$ -> 80$']),
            icon: src_1.Utils.getRandomItem(['AM', 'SM', 'HP']),
            iconColor: src_1.Utils.getRandomItem(['rgb(255, 102, 217)', 'rgb(69,67,130)', 'rgb(124,39,122)']),
        };
    };
    return MarksSource;
}());
window.onload = function () {
    initListeners();
    var dsMain = new DataSourse();
    var dsRed = new DataSourse();
    var dsBlue = new DataSourse();
    chart = new src_1.Chart({
        $el: document.querySelector('.chart'),
        // yAxis: {
        // 	range: {type: AXIS_RANGE_TYPE.FIXED, from: 0, to: 100}
        // },
        xAxis: {
            //range: {type: AXIS_RANGE_TYPE.FIXED, from: 10, to: 30},
            dataType: src_1.AXIS_DATA_TYPE.DATE,
            range: {
                type: src_1.AXIS_RANGE_TYPE.FIXED,
                from: Date.now(),
                to: Date.now() + 20000,
                maxLength: 500000,
                minLength: 5000
            },
            marks: [
                { value: Date.now() + 30000, name: 'deadline', title: 'DEADLINE', lineColor: '#ff6600', type: 'timeleft' },
                { value: Date.now() + 40000, name: 'close', title: 'CLOSE', lineColor: '#005187', type: 'timeleft' }
            ]
        },
        trends: {
            'main': {
                dataset: dsMain.data,
                hasBeacon: true,
                hasIndicator: true,
                hasGradient: false,
                marks: [MarksSource.generate(Date.now() + 3000)]
            },
        },
        widgets: {
            //Grid: {enabled: false},
            //Axis: {enabled: false},
            TrendsGradient: { enabled: false },
        }
    });
    window['chart'] = chart;
    var mainTrend = chart.getTrend('main');
    var deadlineMark = chart.state.xAxisMarks.getItem('deadline');
    var closeMark = chart.state.xAxisMarks.getItem('close');
    mainTrend.onDataChange(function () {
        var closeValue = closeMark.options.value;
        if (mainTrend.getLastItem().xVal >= closeValue) {
            deadlineMark.setOptions({ value: closeValue + 10000 });
            closeMark.setOptions({ value: closeValue + 20000 });
        }
        var markOptions = MarksSource.getNext(mainTrend.getLastItem().xVal);
        if (markOptions)
            setTimeout(function () {
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
    chart.getTrend('main').onPrependRequest(function (requestedLength, resolve, reject) {
        var responseData = [];
        var ticksCount = Math.round(requestedLength / 1000);
        while (ticksCount--)
            responseData.unshift(dsMain.getPrev());
        setTimeout(function () {
            resolve(responseData);
        }, 1000);
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
function initListeners() {
    var $checkboxMaintrend = document.querySelector('input[name="maintrend"]');
    $checkboxMaintrend.addEventListener('change', function () {
        chart.setState({ trends: { main: { enabled: $checkboxMaintrend.checked } } });
    });
    var $checkboxRedtrend = document.querySelector('input[name="redtrend"]');
    $checkboxRedtrend.addEventListener('change', function () {
        chart.setState({ trends: { red: { enabled: $checkboxRedtrend.checked } } });
    });
    var $checkboxBluetrend = document.querySelector('input[name="bluetrend"]');
    $checkboxBluetrend.addEventListener('change', function () {
        chart.setState({ trends: { blue: { enabled: $checkboxBluetrend.checked } } });
    });
}
//# sourceMappingURL=demoApp.js.map