var ThreeChart =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(1));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(2));
	__export(__webpack_require__(21));
	__export(__webpack_require__(20));
	__export(__webpack_require__(19));
	__export(__webpack_require__(9));
	__export(__webpack_require__(11));
	__export(__webpack_require__(17));
	__export(__webpack_require__(18));
	__export(__webpack_require__(10));
	__export(__webpack_require__(5));
	__export(__webpack_require__(7));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	__webpack_require__(3);
	var PerspectiveCamera = THREE.PerspectiveCamera;
	var WebGLRenderer = THREE.WebGLRenderer;
	var TrendsIndicatorWidget_1 = __webpack_require__(4);
	var TrendsLineWidget_1 = __webpack_require__(8);
	var State_1 = __webpack_require__(9);
	var Utils_1 = __webpack_require__(5);
	var TrendsBeaconWidget_1 = __webpack_require__(22);
	var AxisWidget_1 = __webpack_require__(23);
	var GridWidget_1 = __webpack_require__(24);
	var TrendsLoadingWidget_1 = __webpack_require__(25);
	var AxisMarksWidget_1 = __webpack_require__(26);
	var TrendsMarksWidget_1 = __webpack_require__(27);
	var BorderWidget_1 = __webpack_require__(28);
	exports.MAX_DATA_LENGTH = 1000;
	var Chart = (function () {
	    function Chart(state) {
	        this.widgets = [];
	        this.state = new State_1.ChartState(state);
	        this.init();
	    }
	    ;
	    Chart.installWidget = function (Widget) {
	        if (!Widget.widgetName) {
	            Utils_1.Utils.error('unnamed widget');
	        }
	        this.installedWidgets[Widget.widgetName] = Widget;
	    };
	    Chart.prototype.init = function () {
	        var state = this.state;
	        var _a = state.data, w = _a.width, h = _a.height, $el = _a.$el, showStats = _a.showStats;
	        this.scene = new THREE.Scene();
	        var renderer = this.renderer = new WebGLRenderer({ antialias: true }); //new THREE.CanvasRenderer();
	        renderer.setPixelRatio(Chart.devicePixelRatio);
	        renderer.setSize(w, h);
	        $el.appendChild(renderer.domElement);
	        this.$el = renderer.domElement;
	        this.$el.style.display = 'block';
	        if (showStats) {
	            this.stats = new Stats();
	            $el.appendChild(this.stats.domElement);
	        }
	        var camSettings = state.screen.getCameraSettings();
	        this.camera = new PerspectiveCamera(camSettings.FOV, camSettings.aspect, camSettings.near, camSettings.far);
	        this.camera.position.set(camSettings.x, camSettings.y, camSettings.z);
	        this.cameraInitialPosition = this.camera.position.clone();
	        this.scene.add(this.camera);
	        //this.camera.position.z = 2000;
	        // init widgets
	        for (var widgetName in Chart.installedWidgets) {
	            var widgetOptions = this.state.data.widgets[widgetName];
	            if (!widgetOptions.enabled)
	                continue;
	            var WidgetConstructor = Chart.installedWidgets[widgetName];
	            var widget = new WidgetConstructor(this.state);
	            this.scene.add(widget.getObject3D());
	            this.widgets.push(widget);
	        }
	        this.bindEvents();
	        this.render(Date.now());
	    };
	    Chart.prototype.render = function (time) {
	        var _this = this;
	        this.stats && this.stats.begin();
	        this.renderer.render(this.scene, this.camera);
	        var renderDelay = this.state.data.animations.enabled ? 0 : 1000;
	        if (renderDelay) {
	            setTimeout(function () { return requestAnimationFrame(function (time) { return _this.render(time); }); }, renderDelay);
	        }
	        else {
	            requestAnimationFrame(function (time) { return _this.render(time); });
	        }
	        this.stats && this.stats.end();
	    };
	    Chart.prototype.getState = function () {
	        return this.state.data;
	    };
	    /**
	     * shortcut for Chart.state.getTrend
	     */
	    Chart.prototype.getTrend = function (trendName) {
	        return this.state.getTrend(trendName);
	    };
	    /**
	     * shortcut for Chart.state.setState
	     */
	    Chart.prototype.setState = function (state) {
	        return this.state.setState(state);
	    };
	    Chart.prototype.bindEvents = function () {
	        var _this = this;
	        var $el = this.$el;
	        $el.addEventListener('mousewheel', function (ev) { _this.onMouseWheel(ev); });
	        $el.addEventListener('mousemove', function (ev) { _this.onMouseMove(ev); });
	        $el.addEventListener('mousedown', function (ev) { return _this.onMouseDown(ev); });
	        $el.addEventListener('mouseup', function (ev) { return _this.onMouseUp(ev); });
	        $el.addEventListener('touchmove', function (ev) { _this.onTouchMove(ev); });
	        $el.addEventListener('touchend', function (ev) { _this.onTouchEnd(ev); });
	        this.state.onTrendsChange(function () { return _this.autoscroll(); });
	        //this.state.screen.onCameraChange((scrollX, scrollY) => this.onCameraChangeHandler(scrollX, scrollY))
	        this.state.screen.onTransformationFrame(function (options) { return _this.onScreenTransform(options); });
	    };
	    Chart.prototype.onCameraChangeHandler = function (x, y) {
	        if (x != void 0) {
	            this.camera.position.setX(this.cameraInitialPosition.x + x);
	        }
	        if (y != void 0) {
	            this.camera.position.setY(this.cameraInitialPosition.y + y);
	        }
	    };
	    Chart.prototype.onScreenTransform = function (options) {
	        if (options.scrollX != void 0) {
	            this.camera.position.setX(this.cameraInitialPosition.x + options.scrollX);
	        }
	        if (options.scrollY != void 0) {
	            this.camera.position.setY(this.cameraInitialPosition.y + options.scrollY);
	        }
	    };
	    Chart.prototype.autoscroll = function () {
	        var state = this.state;
	        if (state.data.cursor.dragMode)
	            return;
	        var oldTrendsMaxX = state.data.prevState.computedData.trends.maxXVal;
	        var trendsMaxXDelta = state.data.computedData.trends.maxXVal - oldTrendsMaxX;
	        if (trendsMaxXDelta > 0) {
	            var maxVisibleX = this.state.getScreenRightVal();
	            var paddingRightX = this.state.getPaddingRight();
	            var currentScroll = state.data.xAxis.range.scroll;
	            if (oldTrendsMaxX < paddingRightX || oldTrendsMaxX > maxVisibleX) {
	                return;
	            }
	            var scrollDelta = trendsMaxXDelta;
	            this.setState({ xAxis: { range: { scroll: currentScroll + scrollDelta } } });
	        }
	    };
	    Chart.prototype.onScrollStop = function () {
	        // var tendsXMax = this.state.data.computedData.trends.maxX;
	        // var paddingRightX = this.state.getPaddingRight();
	        // if (tendsXMax < paddingRightX) {
	        // 	this.state.scrollToEnd();
	        // }
	    };
	    Chart.prototype.onMouseDown = function (ev) {
	        this.setState({ cursor: { dragMode: true, x: ev.clientX, y: ev.clientY } });
	    };
	    Chart.prototype.onMouseUp = function (ev) {
	        this.setState({ cursor: { dragMode: false } });
	    };
	    Chart.prototype.onMouseMove = function (ev) {
	        if (this.state.data.cursor.dragMode) {
	            this.setState({ cursor: { dragMode: true, x: ev.clientX, y: ev.clientY } });
	        }
	    };
	    Chart.prototype.onMouseWheel = function (ev) {
	        ev.stopPropagation();
	        ev.preventDefault();
	        this.state.zoom(1 + ev.wheelDeltaY * 0.0002);
	    };
	    Chart.prototype.onTouchMove = function (ev) {
	        this.setState({ cursor: { dragMode: true, x: ev.touches[0].clientX, y: ev.touches[0].clientY } });
	    };
	    Chart.prototype.onTouchEnd = function (ev) {
	        this.setState({ cursor: { dragMode: false } });
	    };
	    /**
	     * creates simple chart without animations and minimal widgets set
	     */
	    Chart.createPreviewChart = function (userOptions) {
	        var previewChartOptions = {
	            animations: { enabled: false },
	            widgets: {
	                Grid: { enabled: false },
	                Axis: { enabled: false },
	                TrendsGradient: { enabled: false }
	            }
	        };
	        var options = Utils_1.Utils.deepMerge(userOptions, previewChartOptions);
	        return new Chart(options);
	    };
	    Chart.devicePixelRatio = window.devicePixelRatio;
	    Chart.installedWidgets = {};
	    return Chart;
	}());
	exports.Chart = Chart;
	// install built-in widgets
	Chart.installWidget(TrendsLineWidget_1.TrendsLineWidget);
	Chart.installWidget(AxisWidget_1.AxisWidget);
	Chart.installWidget(GridWidget_1.GridWidget);
	Chart.installWidget(TrendsBeaconWidget_1.TrendsBeaconWidget);
	Chart.installWidget(TrendsIndicatorWidget_1.TrendsIndicatorWidget);
	// Chart.installWidget(TrendsGradientWidget);
	Chart.installWidget(TrendsLoadingWidget_1.TrendsLoadingWidget);
	Chart.installWidget(AxisMarksWidget_1.AxisMarksWidget);
	Chart.installWidget(TrendsMarksWidget_1.TrendsMarksWidget);
	Chart.installWidget(BorderWidget_1.BorderWidget);


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	// TODO: think about different bundles build
	// (<any>window).THREE = require('three/three');
	// (<any>window).Stats = require('three/examples/js/libs/stats.min');
	// (<any>window).TweenLite = require('gsap/src/uncompressed/TweenMax');
	//require('gsap/src/uncompressed/easing/EasePack.js');
	//require('three/examples/js/renderers/CanvasRenderer.js');
	//require('three/examples/js/renderers/Projector.js');
	exports.isPlainObject = window['isPlainObject']; //require('is-plain-object') as Function;
	exports.deepmerge = window['isPlainObject']; //require('deepmerge') as Function;
	exports.EventEmitter = window['EventEmitter']; //require('EventEmitter2') as typeof EventEmitter2;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Utils_1 = __webpack_require__(5);
	var Mesh = THREE.Mesh;
	var TrendsWidget_1 = __webpack_require__(6);
	var Color = THREE.Color;
	var CANVAS_WIDTH = 128;
	var CANVAS_HEIGHT = 64;
	var TrendsIndicatorWidget = (function (_super) {
	    __extends(TrendsIndicatorWidget, _super);
	    function TrendsIndicatorWidget() {
	        _super.apply(this, arguments);
	    }
	    TrendsIndicatorWidget.prototype.getTrendWidgetClass = function () {
	        return TrendIndicator;
	    };
	    TrendsIndicatorWidget.widgetName = 'TrendsIndicator';
	    return TrendsIndicatorWidget;
	}(TrendsWidget_1.TrendsWidget));
	exports.TrendsIndicatorWidget = TrendsIndicatorWidget;
	var TrendIndicator = (function (_super) {
	    __extends(TrendIndicator, _super);
	    function TrendIndicator(state, trendName) {
	        _super.call(this, state, trendName);
	        this.initObject();
	        this.onTrendChange();
	    }
	    TrendIndicator.widgetIsEnabled = function (trendOptions) {
	        return trendOptions.enabled && trendOptions.hasIndicator;
	    };
	    TrendIndicator.prototype.getObject3D = function () {
	        return this.mesh;
	    };
	    TrendIndicator.prototype.onTrendChange = function () {
	        // update canvas value
	        var trendData = this.trend.getData();
	        var lastItem = trendData[trendData.length - 1];
	        var texture = this.mesh.material.map;
	        var ctx = texture.image.getContext('2d');
	        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	        // uncomment to preview indicator rect
	        // ctx.fillStyle = "rgba(255,255,255,0.5)";
	        // ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	        ctx.fillText(lastItem.yVal.toFixed(4), 0, 15);
	        texture.needsUpdate = true;
	    };
	    TrendIndicator.prototype.initObject = function () {
	        var color = new Color(this.trend.getOptions().lineColor);
	        var texture = Utils_1.Utils.createPixelPerfectTexture(CANVAS_WIDTH, CANVAS_HEIGHT, function (ctx) {
	            ctx.beginPath();
	            ctx.font = "15px Arial";
	            ctx.fillStyle = color.getStyle();
	            ctx.strokeStyle = "rgba(255,255,255,0.95)";
	        });
	        var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
	        material.transparent = true;
	        this.mesh = new Mesh(new THREE.PlaneGeometry(CANVAS_WIDTH, CANVAS_HEIGHT), material);
	    };
	    TrendIndicator.prototype.onTransformationFrame = function () {
	        // set new widget position
	        this.point = this.trend.points.getEndPoint();
	        this.updatePosition();
	    };
	    TrendIndicator.prototype.onPointsMove = function (animationState) {
	        // set new widget position
	        this.point = animationState.getEndPoint();
	        this.updatePosition();
	    };
	    TrendIndicator.prototype.updatePosition = function () {
	        var state = this.chartState;
	        var endPointVector = this.point.getFramePoint();
	        var screenWidth = state.data.width;
	        var x = endPointVector.x;
	        var y = endPointVector.y;
	        var screenX = state.screen.getScreenXByPoint(endPointVector.x);
	        if (screenX < 0 || screenX > screenWidth) {
	            if (screenX < 0)
	                x = state.screen.getPointByScreenX(0) + 20;
	            if (screenX > screenWidth)
	                x = state.screen.getPointByScreenX(screenWidth) - CANVAS_WIDTH / 2 - 10;
	            y -= 25;
	        }
	        this.mesh.position.set(x + CANVAS_WIDTH / 2, y + CANVAS_HEIGHT / 2 - 30, 0.1);
	    };
	    return TrendIndicator;
	}(TrendsWidget_1.TrendWidget));
	exports.TrendIndicator = TrendIndicator;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var deps_1 = __webpack_require__(3);
	/**
	 * project utils static class
	 */
	var Utils = (function () {
	    function Utils() {
	    }
	    /**
	     * deepMerge based on https://www.npmjs.com/package/deepmerge
	     */
	    Utils.deepMerge = function (obj1, obj2) {
	        return deps_1.deepmerge(obj1, obj2);
	    };
	    /**
	     * deepCopy based on JSON.stringify function
	     */
	    Utils.deepCopy = function (obj) {
	        return JSON.parse(JSON.stringify(obj));
	    };
	    /**
	     *
	     * @example
	     * // returns "000015"
	     * Utils.toFixed(15, 6);
	     */
	    Utils.toFixed = function (num, digitsCount) {
	        var maxDigits = 15;
	        var result = '';
	        var intVal = Math.floor(num);
	        var intStr = intVal.toString();
	        var lengthDiff = digitsCount - intStr.length;
	        if (lengthDiff > 0) {
	            result = '0'.repeat(lengthDiff) + intStr;
	        }
	        else {
	            result = intStr;
	        }
	        var afterPointDigitsCount = maxDigits - intStr.length;
	        var afterPointStr = num.toString().split('.')[1];
	        if (afterPointStr) {
	            result += '.' + afterPointStr.substr(0, afterPointDigitsCount);
	        }
	        return result;
	    };
	    /**
	     * generate texture from canvas context
	     * @example
	     * 	// create texture with rect
	     *  var texture = Utils.createTexture(20, 20, (ctx) => {ctx.fillRect(0, 0, 10, 10)});
	     */
	    Utils.createTexture = function (width, height, fn) {
	        var canvas = document.createElement('canvas');
	        canvas.width = width;
	        canvas.height = height;
	        var ctx = canvas.getContext('2d');
	        fn(ctx);
	        var texture = new THREE.Texture(canvas);
	        texture.needsUpdate = true;
	        return texture;
	    };
	    /**
	     * generate texture from canvas context with NearestFilter
	     * @example
	     * 	// create texture with rect
	     *  var texture = Utils.createTexture(20, 20, (ctx) => {ctx.fillRect(0, 0, 10, 10)});
	     */
	    Utils.createPixelPerfectTexture = function (width, height, fn) {
	        var texture = this.createTexture(width, height, fn);
	        texture.magFilter = THREE.NearestFilter;
	        texture.minFilter = THREE.NearestFilter;
	        return texture;
	    };
	    /**
	     * throw error
	     */
	    Utils.error = function (msg) {
	        console.error('Chart error: ' + msg);
	        throw 'Chart: ' + msg;
	    };
	    /**
	     * @returns new unique id
	     */
	    Utils.getUid = function () {
	        return this.currentId++;
	    };
	    Utils.eq = function (num1, num2) {
	        return Math.abs(num1 - num2) < 0.01;
	    };
	    Utils.gte = function (num1, num2) {
	        return this.eq(num1, num2) || num1 > num2;
	    };
	    Utils.lte = function (num1, num2) {
	        return this.eq(num1, num2) || num1 < num2;
	    };
	    /**!
	     * @preserve $.parseColor
	     * Copyright 2011 THEtheChad Elliott
	     * Released under the MIT and GPL licenses.
	     */
	    // Parse hex/rgb{a} color syntax.
	    // @input string
	    // @returns array [r,g,b{,o}]
	    Utils.parseColor = function (color) {
	        var cache, p = parseInt // Use p as a byte saving reference to parseInt
	        , color = color.replace(/\s\s*/g, ''); //var
	        // Checks for 6 digit hex and converts string to integer
	        if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color))
	            cache = [p(cache[1], 16), p(cache[2], 16), p(cache[3], 16)];
	        else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color))
	            cache = [p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17];
	        else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color))
	            cache = [+cache[1], +cache[2], +cache[3], +cache[4]];
	        else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color))
	            cache = [+cache[1], +cache[2], +cache[3]];
	        else
	            throw Error(color + ' is not supported by $.parseColor');
	        // Performs RGBA conversion by default
	        isNaN(cache[3]) && (cache[3] = 1);
	        return cache;
	        // Adds or removes 4th value based on rgba support
	        // Support is flipped twice to prevent erros if
	        // it's not defined
	        //return cache.slice(0,3 + !!$.support.rgba);
	    };
	    Utils.getHexColor = function (str) {
	        var rgb = this.parseColor(str);
	        return (rgb[0] << (8 * 2)) + (rgb[1] << 8) + rgb[2];
	    };
	    Utils.throttle = function (func, ms) {
	        var isThrottled = false, savedArgs, savedThis;
	        function wrapper() {
	            if (isThrottled) {
	                savedArgs = arguments;
	                savedThis = this;
	                return;
	            }
	            func.apply(this, arguments); // (1)
	            isThrottled = true;
	            setTimeout(function () {
	                isThrottled = false; // (3)
	                if (savedArgs) {
	                    wrapper.apply(savedThis, savedArgs);
	                    savedArgs = savedThis = null;
	                }
	            }, ms);
	        }
	        return wrapper;
	    };
	    Utils.msToTimeString = function (timestamp) {
	        var h = Math.floor(timestamp / 360000);
	        var m = Math.floor(timestamp / 60000);
	        var s = Math.floor(timestamp / 1000);
	        return h + ':' + m + ':' + s;
	    };
	    Utils.getRandomItem = function (arr) {
	        var ind = Math.floor(Math.random() * arr.length);
	        return arr[ind];
	    };
	    Utils.copyProps = function (srcObject, dstObject, props, excludeProps) {
	        if (excludeProps === void 0) { excludeProps = []; }
	        for (var key in props) {
	            if (excludeProps.indexOf(key) !== -1)
	                continue;
	            if (srcObject[key] == void 0)
	                continue;
	            if (deps_1.isPlainObject(props[key]) && dstObject[key] !== void 0) {
	                this.copyProps(srcObject[key], dstObject[key], props[key]);
	            }
	            else {
	                dstObject[key] = this.deepCopy(srcObject[key]);
	            }
	        }
	    };
	    Utils.currentId = 1;
	    return Utils;
	}());
	exports.Utils = Utils;
	console.log(Utils.msToTimeString(1000));


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Widget_1 = __webpack_require__(7);
	var Object3D = THREE.Object3D;
	/**
	 * abstract manager class for all trends widgets
	 */
	var TrendsWidget = (function (_super) {
	    __extends(TrendsWidget, _super);
	    function TrendsWidget(state) {
	        _super.call(this, state);
	        this.widgets = {};
	        this.object3D = new Object3D();
	        this.onTrendsChange();
	    }
	    TrendsWidget.prototype.bindEvents = function () {
	        var _this = this;
	        var state = this.chartState;
	        state.onTrendsChange(function () { return _this.onTrendsChange(); });
	        state.onTrendChange(function (trendName, changedOptions, newData) {
	            _this.onTrendChange(trendName, changedOptions, newData);
	        });
	    };
	    TrendsWidget.prototype.onTrendsChange = function () {
	        var trendsOptions = this.chartState.data.trends;
	        var TrendWidgetClass = this.getTrendWidgetClass();
	        for (var trendName in trendsOptions) {
	            var trendOptions = trendsOptions[trendName];
	            if (TrendWidgetClass.widgetIsEnabled(trendOptions, this.chartState) && !this.widgets[trendName]) {
	                this.createTrendWidget(trendName);
	            }
	            else if (!trendOptions.enabled && this.widgets[trendName]) {
	                this.destroyTrendWidget(trendName);
	            }
	        }
	    };
	    TrendsWidget.prototype.onTrendChange = function (trendName, changedOptions, newData) {
	        if (!changedOptions.data)
	            return;
	        var widget = this.widgets[trendName];
	        if (!widget)
	            return;
	        widget.onTrendChange(changedOptions);
	        if (newData) {
	            var data = this.chartState.getTrend(trendName).getData();
	            var isAppend = (!data.length || data[0].xVal < newData[0].xVal);
	            isAppend ? widget.appendData(newData) : widget.prependData(newData);
	        }
	    };
	    TrendsWidget.prototype.getObject3D = function () {
	        return this.object3D;
	    };
	    TrendsWidget.prototype.createTrendWidget = function (trendName) {
	        var WidgetConstructor = this.getTrendWidgetClass();
	        var widget = new WidgetConstructor(this.chartState, trendName);
	        this.widgets[trendName] = widget;
	        var widgetObject = widget.getObject3D();
	        widgetObject.name = trendName;
	        this.object3D.add(widget.getObject3D());
	    };
	    TrendsWidget.prototype.destroyTrendWidget = function (trendName) {
	        this.widgets[trendName].onDestroy();
	        delete this.widgets[trendName];
	        var widgetObject = this.object3D.getObjectByName(trendName);
	        this.object3D.remove(widgetObject);
	    };
	    return TrendsWidget;
	}(Widget_1.ChartWidget));
	exports.TrendsWidget = TrendsWidget;
	/**
	 * based class for all trends widgets
	 */
	var TrendWidget = (function () {
	    function TrendWidget(chartState, trendName) {
	        this.chartState = chartState;
	        this.trendName = trendName;
	        this.unsubscribers = [];
	        this.trend = chartState.trends.getTrend(trendName);
	        this.chartState = chartState;
	        this.bindEvents();
	    }
	    TrendWidget.widgetIsEnabled = function (trendOptions, chartState) {
	        return trendOptions.enabled;
	    };
	    TrendWidget.prototype.appendData = function (newData) { };
	    ;
	    TrendWidget.prototype.prependData = function (newData) { };
	    ;
	    TrendWidget.prototype.onTrendChange = function (changedOptions) { };
	    TrendWidget.prototype.onDestroy = function () {
	        for (var _i = 0, _a = this.unsubscribers; _i < _a.length; _i++) {
	            var unsubscriber = _a[_i];
	            unsubscriber();
	        }
	    };
	    TrendWidget.prototype.onPointsMove = function (trendPoints) {
	    };
	    TrendWidget.prototype.onZoomFrame = function (options) {
	    };
	    TrendWidget.prototype.onTransformationFrame = function (options) {
	    };
	    TrendWidget.prototype.onZoom = function () {
	    };
	    TrendWidget.prototype.bindEvents = function () {
	        var _this = this;
	        this.bindEvent(this.trend.points.onAnimationFrame(function (trendPoints) { return _this.onPointsMove(trendPoints); }));
	        this.bindEvent(this.chartState.screen.onTransformationFrame(function (options) { return _this.onTransformationFrame(options); }));
	        this.bindEvent(this.chartState.screen.onZoomFrame(function (options) { return _this.onZoomFrame(options); }));
	        this.bindEvent(this.chartState.onZoom(function () { return _this.onZoom(); }));
	    };
	    ;
	    TrendWidget.prototype.bindEvent = function (unsubscriber) {
	        this.unsubscribers.push(unsubscriber);
	    };
	    return TrendWidget;
	}());
	exports.TrendWidget = TrendWidget;


/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * base class for all widgets
	 * widgets must not change state!
	 * each widget must have widgetName static property
	 */
	var ChartWidget = (function () {
	    function ChartWidget(chartState) {
	        this.chartState = chartState;
	        this.bindEvents();
	    }
	    ChartWidget.prototype.bindEvents = function () { };
	    ChartWidget.getDefaultOptions = function () {
	        return { enabled: true };
	    };
	    ChartWidget.widgetName = '';
	    return ChartWidget;
	}());
	exports.ChartWidget = ChartWidget;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Geometry = THREE.Geometry;
	var LineBasicMaterial = THREE.LineBasicMaterial;
	var Vector3 = THREE.Vector3;
	var TrendsWidget_1 = __webpack_require__(6);
	var LineSegments = THREE.LineSegments;
	/**
	 * widget for drawing trends lines
	 */
	var TrendsLineWidget = (function (_super) {
	    __extends(TrendsLineWidget, _super);
	    function TrendsLineWidget() {
	        _super.apply(this, arguments);
	    }
	    TrendsLineWidget.prototype.getTrendWidgetClass = function () {
	        return TrendLine;
	    };
	    TrendsLineWidget.widgetName = "trendsLine";
	    return TrendsLineWidget;
	}(TrendsWidget_1.TrendsWidget));
	exports.TrendsLineWidget = TrendsLineWidget;
	var TrendLine = (function (_super) {
	    __extends(TrendLine, _super);
	    function TrendLine(chartState, trendName) {
	        _super.call(this, chartState, trendName);
	        var options = this.trend.getOptions();
	        this.material = new LineBasicMaterial({ color: options.lineColor, linewidth: options.lineWidth });
	        this.initLine();
	    }
	    TrendLine.prototype.getObject3D = function () {
	        return this.lineSegments;
	    };
	    TrendLine.prototype.initLine = function () {
	        var geometry = new Geometry();
	        var animationState = this.trend.points;
	        var points = animationState.points;
	        this.scaleXFactor = this.chartState.valueToPxByXAxis(1);
	        this.scaleYFactor = this.chartState.valueToPxByYAxis(1);
	        for (var pointId in points) {
	            var point = points[pointId];
	            var nextPoint = points[Number(pointId) + 1];
	            if (!nextPoint)
	                break;
	            var vert1 = point.getFrameVal();
	            var vert2 = nextPoint.getFrameVal();
	            if (!nextPoint.hasValue)
	                vert2 = vert1.clone();
	            vert1 = this.toLocalVec(vert1);
	            vert2 = this.toLocalVec(vert2);
	            geometry.vertices.push(vert1, vert2);
	        }
	        this.lineSegments = new LineSegments(geometry, this.material);
	        this.lineSegments.scale.set(this.scaleXFactor, this.scaleYFactor, 1);
	        // this.lineSegments.position.set(
	        // 	- this.chartState.data.xAxis.range.from * this.scaleXFactor,
	        // 	- this.chartState.data.yAxis.range.from * this.scaleYFactor,
	        // 	0
	        // );
	        this.lineSegments.frustumCulled = false;
	    };
	    // protected onZoom() {
	    // 	var currentScale = this.lineSegments.scale;
	    // 	var zoomX = this.chartState.data.xAxis.range.zoom;
	    // 	var zoomY = this.chartState.data.yAxis.range.zoom;
	    // 	currentScale.set(this.scaleXFactor * zoomX, this.scaleYFactor * zoomY, 1);
	    // 	// setInterval(() => {
	    // 	// 	currentScale.setY(currentScale.scrollY + 0.4);
	    // 	// }, 500)
	    // }
	    // protected onZoomFrame(zoomX: number, zoomY: number) {
	    // 	// var currentScale = this.lineSegments.scale;
	    // 	// currentScale.set(this.scaleXFactor * zoomX, this.scaleYFactor * zoomY, 1);
	    // 	// setInterval(() => {
	    // 	// 	currentScale.setY(currentScale.scrollY + 0.4);
	    // 	// }, 500)
	    // }
	    TrendLine.prototype.onZoomFrame = function (options) {
	        var currentScale = this.lineSegments.scale;
	        if (options.zoomX)
	            currentScale.setX(this.scaleXFactor * options.zoomX);
	        if (options.zoomY)
	            currentScale.setY(this.scaleYFactor * options.zoomY);
	    };
	    TrendLine.prototype.onPointsMove = function (animationState) {
	        var trendData = this.trend.getData();
	        var geometry = this.lineSegments.geometry;
	        var vertices = geometry.vertices;
	        var current = animationState.current;
	        var lastInd = trendData.length - 1;
	        for (var vertexValue in current) {
	            var firstChar = vertexValue.charAt(0);
	            if (firstChar !== 'x' && firstChar !== 'y')
	                continue;
	            var isX = firstChar == 'x';
	            var ind = Number(vertexValue.substr(1));
	            if (ind > lastInd)
	                continue;
	            var point = animationState.points[ind];
	            var nextPoint = point.getNext();
	            var prevPoint = point.getPrev();
	            var lineStartVertex = vertices[ind * 2];
	            var lineEndVertex = vertices[ind * 2 + 1];
	            var isAppend = (prevPoint);
	            if (isX) {
	                var value = this.toLocalX(current[vertexValue]);
	                if (prevPoint) {
	                    lineStartVertex.setX(this.toLocalX(prevPoint.getFrameVal().x));
	                    lineEndVertex.setX(value);
	                }
	                else {
	                    lineStartVertex.setX(value);
	                    lineEndVertex.setX(value);
	                }
	                if (nextPoint) {
	                    var nextPointLineStartVertex = vertices[(nextPoint.id) * 2];
	                    if (nextPointLineStartVertex.x !== value)
	                        nextPointLineStartVertex.setX(value);
	                }
	            }
	            else {
	                var value = this.toLocalY(current[vertexValue]);
	                if (isAppend) {
	                    lineStartVertex.setY(this.toLocalY(prevPoint.getFrameVal().y));
	                    lineEndVertex.setY(value);
	                }
	                else {
	                    lineStartVertex.setY(value);
	                    lineEndVertex.setY(value);
	                }
	                if (nextPoint) {
	                    var nextPointLineStartVertex = vertices[(nextPoint.id) * 2];
	                    if (nextPointLineStartVertex.y !== value)
	                        nextPointLineStartVertex.setY(value);
	                }
	            }
	        }
	        geometry.verticesNeedUpdate = true;
	    };
	    TrendLine.prototype.toLocalX = function (xVal) {
	        return xVal - this.chartState.data.xAxis.range.zeroVal;
	    };
	    TrendLine.prototype.toLocalY = function (yVal) {
	        return yVal - this.chartState.data.yAxis.range.zeroVal;
	    };
	    TrendLine.prototype.toLocalVec = function (vec) {
	        return new Vector3(this.toLocalX(vec.x), this.toLocalY(vec.y), 0);
	    };
	    return TrendLine;
	}(TrendsWidget_1.TrendWidget));
	exports.TrendLine = TrendLine;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var deps_1 = __webpack_require__(3);
	var Utils_1 = __webpack_require__(5);
	var Vector3 = THREE.Vector3;
	var Widget_1 = __webpack_require__(7);
	var Trends_1 = __webpack_require__(10);
	var Screen_1 = __webpack_require__(19);
	var AxisMarks_1 = __webpack_require__(20);
	var interfaces_1 = __webpack_require__(21);
	var Chart_1 = __webpack_require__(2);
	/**
	 * main class for manage chart state
	 */
	var ChartState = (function () {
	    function ChartState(initialState) {
	        this.data = {
	            prevState: {},
	            $el: null,
	            zoom: 0,
	            xAxis: {
	                range: { type: interfaces_1.AXIS_RANGE_TYPE.ALL, from: 0, to: 0, scroll: 0, padding: { start: 0, end: 200 }, zoom: 1 },
	                dataType: interfaces_1.AXIS_DATA_TYPE.NUMBER,
	                gridMinSize: 100,
	                autoScroll: true,
	                marks: [],
	            },
	            yAxis: {
	                range: { type: interfaces_1.AXIS_RANGE_TYPE.RELATIVE_END, from: 0, to: 0, padding: { start: 100, end: 100 }, zoom: 1 },
	                dataType: interfaces_1.AXIS_DATA_TYPE.NUMBER,
	                gridMinSize: 50,
	                marks: []
	            },
	            animations: {
	                enabled: true,
	                trendChangeSpeed: 0.5,
	                trendChangeEase: void 0,
	                zoomSpeed: 0.5,
	                zoomEase: void 0,
	                autoScrollSpeed: 1,
	                autoScrollEase: Linear.easeNone
	            },
	            cursor: {
	                dragMode: false,
	                x: 0,
	                y: 0
	            },
	            showStats: false
	        };
	        this.ee = new deps_1.EventEmitter();
	        this.ee.setMaxListeners(15);
	        this.screen = new Screen_1.Screen(this);
	        if (!initialState.$el) {
	            Utils_1.Utils.error('$el must be set');
	        }
	        // calculate chart size
	        var style = getComputedStyle(initialState.$el);
	        initialState.width = parseInt(style.width);
	        initialState.height = parseInt(style.height);
	        this.trends = new Trends_1.Trends(this, initialState);
	        initialState.trends = this.trends.calculatedOptions;
	        this.setState(initialState);
	        this.setState({ computedData: this.getComputedData() });
	        this.savePrevState();
	        this.xAxisMarks = new AxisMarks_1.AxisMarks(this, interfaces_1.AXIS_TYPE.X);
	        this.initListeners();
	        // message to other modules that ChartState.data is ready for use 
	        this.ee.emit('initialStateApplied', initialState);
	        // message to other modules that ChartState is ready for use 
	        this.ee.emit('ready', initialState);
	    }
	    ChartState.prototype.onInitialStateApplied = function (cb) {
	        var _this = this;
	        this.ee.on('initialStateApplied', cb);
	        return function () {
	            _this.ee.off('initialStateApplied', cb);
	        };
	    };
	    ChartState.prototype.onReady = function (cb) {
	        var _this = this;
	        this.ee.on('ready', cb);
	        return function () {
	            _this.ee.off('ready', cb);
	        };
	    };
	    ChartState.prototype.onChange = function (cb) {
	        this.ee.on('change', cb);
	    };
	    ChartState.prototype.onTrendChange = function (cb) {
	        this.ee.on('trendChange', cb);
	    };
	    ChartState.prototype.onTrendsChange = function (cb) {
	        this.ee.on('trendsChange', cb);
	    };
	    ChartState.prototype.onXAxisChange = function (cb) {
	        this.ee.on('xAxisChange', cb);
	    };
	    ChartState.prototype.onScrollStop = function (cb) {
	        this.ee.on('scrollStop', cb);
	    };
	    ChartState.prototype.onScroll = function (cb) {
	        var _this = this;
	        this.ee.on('scroll', cb);
	        return function () {
	            _this.ee.off('scroll', cb);
	        };
	    };
	    ChartState.prototype.onZoom = function (cb) {
	        var _this = this;
	        this.ee.on('zoom', cb);
	        return function () {
	            _this.ee.off('zoom', cb);
	        };
	    };
	    ChartState.prototype.getTrend = function (trendName) {
	        return this.trends.getTrend(trendName);
	    };
	    ChartState.prototype.setState = function (newState, eventData, silent) {
	        if (silent === void 0) { silent = false; }
	        var stateData = this.data;
	        var changedProps = {};
	        for (var key in newState) {
	            if (stateData[key] !== newState[key]) {
	                changedProps[key] = newState[key];
	            }
	        }
	        this.savePrevState(changedProps);
	        this.data = Utils_1.Utils.deepMerge(this.data, newState);
	        if (silent)
	            return;
	        // recalculate all dynamic state props
	        var recalculateResult = this.recalculateState(changedProps);
	        changedProps = recalculateResult.changedProps;
	        this.emitChangedStateEvents(changedProps, eventData);
	    };
	    ChartState.prototype.recalculateState = function (changedProps) {
	        var data = this.data;
	        var patch = {};
	        var eventsToEmit = [];
	        var actualData = Utils_1.Utils.deepMerge({}, data);
	        // recalculate widgets
	        if (changedProps.widgets || !data.widgets) {
	            patch.widgets = {};
	            var widgetsOptions = data.widgets || {};
	            for (var widgetName in Chart_1.Chart.installedWidgets) {
	                var WidgetClass = Chart_1.Chart.installedWidgets[widgetName];
	                var userOptions = widgetsOptions[widgetName] || {};
	                var defaultOptions = WidgetClass.getDefaultOptions() || Widget_1.ChartWidget.getDefaultOptions();
	                patch.widgets[widgetName] = Utils_1.Utils.deepMerge(defaultOptions, userOptions);
	            }
	        }
	        // recalculate scroll position by changed cursor options
	        var cursorOptions = changedProps.cursor;
	        var scrollChanged = cursorOptions && data.cursor.dragMode && data.prevState.cursor.dragMode;
	        if (scrollChanged) {
	            var oldX = data.prevState.cursor.x;
	            var currentX = cursorOptions.x;
	            var currentScroll = data.xAxis.range.scroll;
	            var deltaXVal = this.pxToValueByXAxis(oldX - currentX);
	            patch.xAxis = { range: { scroll: currentScroll + deltaXVal } };
	            actualData = Utils_1.Utils.deepMerge(actualData, { xAxis: patch.xAxis });
	        }
	        var needToRecalculateXAxis = (scrollChanged ||
	            (changedProps.xAxis && (changedProps.xAxis.range)) ||
	            this.data.xAxis.range.zeroVal == void 0);
	        if (needToRecalculateXAxis) {
	            var xAxisPatch = this.recalculateXAxis(actualData);
	            if (xAxisPatch) {
	                patch = Utils_1.Utils.deepMerge(patch, { xAxis: xAxisPatch });
	                actualData = Utils_1.Utils.deepMerge(actualData, { xAxis: xAxisPatch });
	            }
	        }
	        // recalculate axis "from" and "to" for dynamics AXIS_RANGE_TYPE
	        var needToRecalculateYAxis = ((data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.RELATIVE_END || data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.AUTO) &&
	            (scrollChanged || changedProps.trends || changedProps.yAxis) ||
	            this.data.yAxis.range.zeroVal == void 0);
	        if (needToRecalculateYAxis) {
	            var yAxisPatch = this.recalculateYAxis(actualData);
	            if (yAxisPatch) {
	                patch = Utils_1.Utils.deepMerge(patch, { yAxis: yAxisPatch });
	                actualData = Utils_1.Utils.deepMerge(actualData, { yAxis: yAxisPatch });
	            }
	        }
	        // TODO: recalculate xAxis
	        this.savePrevState(patch);
	        var allChangedProps = Utils_1.Utils.deepMerge(changedProps, patch);
	        patch.computedData = this.getComputedData(allChangedProps);
	        this.savePrevState(patch);
	        this.data = Utils_1.Utils.deepMerge(this.data, patch);
	        return { changedProps: allChangedProps, patch: patch, eventsToEmit: eventsToEmit };
	    };
	    ChartState.prototype.getComputedData = function (changedProps) {
	        var computeAll = !changedProps;
	        var computedData = {};
	        if (computeAll || changedProps.trends && this.trends) {
	            computedData.trends = {
	                maxXVal: this.trends.getEndXVal(),
	                minXVal: this.trends.getStartXVal()
	            };
	        }
	        return computedData;
	    };
	    ChartState.prototype.savePrevState = function (changedProps) {
	        // var propsToSave = changedProps ? Object.keys(changedProps) : Object.keys(this.data);
	        if (!changedProps)
	            changedProps = this.data;
	        var prevState = this.data.prevState;
	        // prevent to store prev trend data by performance reasons
	        Utils_1.Utils.copyProps(this.data, prevState, changedProps, ['trends']);
	        // for (let propName of propsToSave) {
	        // 	if (this.data[propName] == void 0) continue;
	        //
	        // 	// prevent to store prev trend data by performance reasons
	        // 	if (propName == 'trends') {
	        // 		continue;
	        // 	}
	        //
	        // 	prevState[propName] = Utils.deepCopy(this.data[propName]);
	        // }
	    };
	    ChartState.prototype.emitChangedStateEvents = function (changedProps, eventData) {
	        var prevState = this.data.prevState;
	        // emit common change event
	        this.ee.emit('change', changedProps, eventData);
	        // emit event for each changed state property
	        for (var key in changedProps) {
	            this.ee.emit(key + 'Change', changedProps[key], eventData);
	        }
	        // emit special events based on changed state
	        var scrollStopEventNeeded = (changedProps.cursor &&
	            changedProps.cursor.dragMode === false &&
	            prevState.cursor.dragMode === true);
	        scrollStopEventNeeded && this.ee.emit('scrollStop', changedProps);
	        var scrollChangeEventsNeeded = (changedProps.xAxis &&
	            changedProps.xAxis.range &&
	            changedProps.xAxis.range.scroll !== void 0);
	        scrollChangeEventsNeeded && this.ee.emit('scroll', changedProps);
	        var zoomEventsNeeded = ((changedProps.xAxis && changedProps.xAxis.range && changedProps.xAxis.range.zoom) ||
	            (changedProps.yAxis && changedProps.yAxis.range && changedProps.yAxis.range.zoom));
	        zoomEventsNeeded && this.ee.emit('zoom', changedProps);
	    };
	    ChartState.prototype.initListeners = function () {
	        var _this = this;
	        this.ee.on('trendsChange', function (changedTrends, newData) {
	            _this.handleTrendsChange(changedTrends, newData);
	        });
	    };
	    ChartState.prototype.handleTrendsChange = function (changedTrends, newData) {
	        for (var trendName in changedTrends) {
	            this.ee.emit('trendChange', trendName, changedTrends[trendName], newData);
	        }
	    };
	    ChartState.prototype.recalculateXAxis = function (actualData) {
	        var axisRange = actualData.xAxis.range;
	        var patch = { range: {} };
	        var isInitialize = axisRange.zeroVal == void 0;
	        var zeroVal, scaleFactor;
	        var zoom = axisRange.zoom;
	        if (isInitialize) {
	            zeroVal = axisRange.from;
	            scaleFactor = actualData.width / (axisRange.to - axisRange.from);
	            patch = { range: { zeroVal: zeroVal, scaleFactor: scaleFactor } };
	        }
	        else {
	            zeroVal = axisRange.zeroVal;
	            scaleFactor = axisRange.scaleFactor;
	        }
	        do {
	            var from = zeroVal + axisRange.scroll;
	            var to = from + actualData.width / (scaleFactor * zoom);
	            var rangeLength = to - from;
	            var needToRecalculateZoom = false;
	            if (rangeLength > axisRange.maxLength || rangeLength < axisRange.minLength) {
	                var fixScale = rangeLength > axisRange.maxLength ?
	                    rangeLength / axisRange.maxLength :
	                    rangeLength / axisRange.minLength;
	                var zoom = zoom * fixScale;
	                patch.range.zoom = zoom;
	                needToRecalculateZoom = true;
	            }
	        } while (needToRecalculateZoom);
	        patch.range.from = from;
	        patch.range.to = to;
	        return patch;
	    };
	    ChartState.prototype.recalculateYAxis = function (actualData) {
	        var patch = { range: {} };
	        var yAxisRange = actualData.yAxis.range;
	        var isInitialize = yAxisRange.zeroVal == void 0;
	        var trends = this.trends;
	        var trendsEndXVal = trends.getEndXVal();
	        var trendsStartXVal = trends.getStartXVal();
	        var xRange = actualData.xAxis.range;
	        var xFrom = xRange.from, xTo = xRange.to;
	        var xRangeLength = xTo - xFrom;
	        var zeroVal, scaleFactor, scroll, zoom, needToZoom;
	        // check situation when chart was scrolled behind trends end or before trends start
	        if (xTo > trendsEndXVal) {
	            xTo = trendsEndXVal;
	            xFrom = xTo - xRangeLength;
	        }
	        else if (xFrom < trendsStartXVal) {
	            xFrom = trendsStartXVal;
	            xTo = xFrom + xRangeLength;
	        }
	        var maxY = trends.getMaxYVal(xFrom, xTo);
	        var minY = trends.getMinYVal(xFrom, xTo);
	        var trendLastY = trends.getMaxYVal(trendsEndXVal, trendsEndXVal);
	        if (yAxisRange.type == interfaces_1.AXIS_RANGE_TYPE.RELATIVE_END) {
	            if (trendLastY > maxY)
	                maxY = trendLastY;
	            if (trendLastY < minY)
	                minY = trendLastY;
	        }
	        var padding = yAxisRange.padding;
	        var rangeLength = maxY - minY;
	        var paddingTopInPercents = padding.end / actualData.height;
	        var paddingBottomInPercents = padding.start / actualData.height;
	        var rangeLengthInPercents = 1 - paddingTopInPercents - paddingBottomInPercents;
	        var visibleRangeLength = rangeLength / rangeLengthInPercents;
	        var fromVal = minY - visibleRangeLength * paddingBottomInPercents;
	        var toVal = maxY + visibleRangeLength * paddingTopInPercents;
	        if (isInitialize) {
	            zeroVal = fromVal;
	            scaleFactor = actualData.height / (toVal - fromVal);
	            patch = { range: { zeroVal: zeroVal, scaleFactor: scaleFactor } };
	            needToZoom = true;
	        }
	        else {
	            scaleFactor = yAxisRange.scaleFactor;
	            zeroVal = yAxisRange.zeroVal;
	            var maxScreenY = Math.round(this.getScreenYByValue(maxY));
	            var minScreenY = Math.round(this.getScreenYByValue(minY));
	            needToZoom = (maxScreenY > actualData.height ||
	                maxScreenY < actualData.height - padding.end ||
	                minScreenY < 0 || minScreenY > padding.start);
	        }
	        if (!needToZoom)
	            return null;
	        scroll = fromVal - zeroVal;
	        zoom = (actualData.height / (toVal - fromVal)) / scaleFactor;
	        var currentAxisRange = this.data.yAxis.range;
	        if (currentAxisRange.from !== fromVal)
	            patch.range.from = fromVal;
	        if (currentAxisRange.to !== toVal)
	            patch.range.to = toVal;
	        if (currentAxisRange.scroll !== scroll)
	            patch.range.scroll = scroll;
	        if (currentAxisRange.zoom !== zoom)
	            patch.range.zoom = zoom;
	        return patch;
	    };
	    ChartState.prototype.zoom = function (zoomValue) {
	        var _a = this.data.xAxis.range, zoom = _a.zoom, scroll = _a.scroll, zeroVal = _a.zeroVal;
	        var newZoom = zoom * zoomValue;
	        var screenLeftVal = this.getValueByScreenX(0);
	        var screenCenterVal = this.getValueByScreenX(this.data.width / 2);
	        var halfScreenLength = screenCenterVal - screenLeftVal;
	        var scrollDelta = halfScreenLength * zoomValue - halfScreenLength;
	        var newScroll = scroll + scrollDelta;
	        this.setState({ xAxis: { range: { zoom: newZoom, scroll: newScroll } } });
	    };
	    /**
	     *  returns offset in pixels from xAxis.range.zeroVal to xVal
	     */
	    ChartState.prototype.getPointOnXAxis = function (xVal) {
	        var _a = this.data.xAxis.range, scaleFactor = _a.scaleFactor, zoom = _a.zoom, zeroVal = _a.zeroVal;
	        return (xVal - zeroVal) * scaleFactor * zoom;
	    };
	    /**
	     *  returns offset in pixels from yAxis.range.zeroVal to yVal
	     */
	    ChartState.prototype.getPointOnYAxis = function (yVal) {
	        var _a = this.data.yAxis.range, scaleFactor = _a.scaleFactor, zoom = _a.zoom, zeroVal = _a.zeroVal;
	        return (yVal - zeroVal) * scaleFactor * zoom;
	    };
	    /**
	     * returns value by offset in pixels from xAxis.range.zeroVal
	     */
	    ChartState.prototype.getValueOnXAxis = function (x) {
	        return this.data.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
	    };
	    /**
	     *  convert value to pixels by using settings from xAxis.range
	     */
	    ChartState.prototype.valueToPxByXAxis = function (xVal) {
	        return xVal * this.data.xAxis.range.scaleFactor * this.data.xAxis.range.zoom;
	    };
	    /**
	     *  convert value to pixels by using settings from yAxis.range
	     */
	    ChartState.prototype.valueToPxByYAxis = function (yVal) {
	        return yVal * this.data.yAxis.range.scaleFactor * this.data.yAxis.range.zoom;
	    };
	    /**
	     *  convert pixels to value by using settings from xAxis.range
	     */
	    ChartState.prototype.pxToValueByXAxis = function (xVal) {
	        return xVal / this.data.xAxis.range.scaleFactor / this.data.xAxis.range.zoom;
	    };
	    /**
	     *  convert pixels to value by using settings from yAxis.range
	     */
	    ChartState.prototype.pxToValueByYAxis = function (yVal) {
	        return yVal / this.data.yAxis.range.scaleFactor / this.data.yAxis.range.zoom;
	    };
	    /**
	     *  returns x value by screen x coordinate
	     */
	    ChartState.prototype.getValueByScreenX = function (x) {
	        var _a = this.data.xAxis.range, zeroVal = _a.zeroVal, scroll = _a.scroll;
	        return zeroVal + scroll + this.pxToValueByXAxis(x);
	    };
	    /**
	     *  returns y value by screen y coordinate
	     */
	    ChartState.prototype.getValueByScreenY = function (y) {
	        var _a = this.data.yAxis.range, zeroVal = _a.zeroVal, scroll = _a.scroll;
	        return zeroVal + scroll + this.pxToValueByYAxis(y);
	    };
	    /**
	     *  returns screen x value by screen y coordinate
	     */
	    ChartState.prototype.getScreenXByValue = function (xVal) {
	        var _a = this.data.xAxis.range, scroll = _a.scroll, zeroVal = _a.zeroVal;
	        return this.valueToPxByXAxis(xVal - zeroVal - scroll);
	    };
	    /**
	     *  returns screen y value by screen y coordinate
	     */
	    ChartState.prototype.getScreenYByValue = function (yVal) {
	        var _a = this.data.yAxis.range, scroll = _a.scroll, zeroVal = _a.zeroVal;
	        return this.valueToPxByYAxis(yVal - zeroVal - scroll);
	    };
	    /**
	     * returns screen x coordinate by offset in pixels from xAxis.range.zeroVal value
	     */
	    ChartState.prototype.getScreenXByPoint = function (xVal) {
	        return this.getScreenXByValue(this.getValueOnXAxis(xVal));
	    };
	    /**
	     * returns offset in pixels from xAxis.range.zeroVal value by screen x coordinate
	     */
	    ChartState.prototype.getPointByScreenX = function (screenX) {
	        return this.getPointOnXAxis(this.getValueByScreenX(screenX));
	    };
	    ChartState.prototype.getPointOnChart = function (xVal, yVal) {
	        return new Vector3(this.getPointOnXAxis(xVal), this.getPointOnYAxis(yVal), 0);
	    };
	    ChartState.prototype.getScreenLeftVal = function () {
	        return this.getValueByScreenX(0);
	    };
	    ChartState.prototype.getScreenRightVal = function () {
	        return this.getValueByScreenX(this.data.width);
	    };
	    ChartState.prototype.getPaddingRight = function () {
	        return this.getValueByScreenX(this.data.width - this.data.xAxis.range.padding.end);
	    };
	    return ChartState;
	}());
	exports.ChartState = ChartState;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Trend_1 = __webpack_require__(11);
	/**
	 * Trends collection
	 */
	var Trends = (function () {
	    function Trends(state, initialState) {
	        this.items = {};
	        this.chartState = state;
	        var trendsCalculatedOptions = {};
	        for (var trendName in initialState.trends) {
	            var trend = new Trend_1.Trend(state, trendName, initialState);
	            trendsCalculatedOptions[trendName] = trend.getCalculatedOptions();
	            this.items[trendName] = trend;
	        }
	        this.calculatedOptions = trendsCalculatedOptions;
	    }
	    Trends.prototype.getTrend = function (trendName) {
	        return this.items[trendName];
	    };
	    Trends.prototype.getEnabledTrends = function () {
	        var enabledTrends = [];
	        var allTrends = this.items;
	        for (var trendName in allTrends) {
	            var trend = allTrends[trendName];
	            trend.getOptions().enabled && enabledTrends.push(trend);
	        }
	        return enabledTrends;
	    };
	    Trends.prototype.getStartXVal = function () {
	        var trends = this.getEnabledTrends();
	        return trends[0].getData()[0].xVal;
	    };
	    Trends.prototype.getEndXVal = function () {
	        var trends = this.getEnabledTrends();
	        var firstTrendData = trends[0].getData();
	        return firstTrendData[firstTrendData.length - 1].xVal;
	    };
	    Trends.prototype.getExtremumYVal = function (extremumIsMax, fromX, toX) {
	        var trends = this.getEnabledTrends();
	        var compareFn;
	        var result;
	        if (extremumIsMax) {
	            result = -Infinity;
	            compareFn = Math.max;
	        }
	        else {
	            result = Infinity;
	            compareFn = Math.min;
	        }
	        for (var _i = 0, trends_1 = trends; _i < trends_1.length; _i++) {
	            var trend = trends_1[_i];
	            var trendData = trend.getData(fromX, toX);
	            var trendYValues = trendData.map(function (dataItem) { return dataItem.yVal; });
	            result = compareFn.apply(void 0, [result].concat(trendYValues));
	        }
	        if (result == Infinity || result == -Infinity)
	            result = NaN;
	        return result;
	    };
	    Trends.prototype.getMaxYVal = function (fromX, toX) { return this.getExtremumYVal(true, fromX, toX); };
	    Trends.prototype.getMinYVal = function (fromX, toX) { return this.getExtremumYVal(false, fromX, toX); };
	    return Trends;
	}());
	exports.Trends = Trends;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Utils_1 = __webpack_require__(5);
	var es6_promise_1 = __webpack_require__(12);
	var Chart_1 = __webpack_require__(2);
	var TrendMarks_1 = __webpack_require__(17);
	var TrendPoints_1 = __webpack_require__(18);
	var deps_1 = __webpack_require__(3);
	var DEFAULT_OPTIONS = {
	    enabled: true,
	    data: [],
	    marks: [],
	    lineWidth: 2,
	    lineColor: 0xFFFFFF,
	    hasGradient: true,
	    hasBeacon: false
	};
	var Trend = (function () {
	    function Trend(chartState, trendName, initialState) {
	        var options = initialState.trends[trendName];
	        this.name = trendName;
	        this.chartState = chartState;
	        this.calculatedOptions = Utils_1.Utils.deepMerge(DEFAULT_OPTIONS, options);
	        this.calculatedOptions.name = trendName;
	        if (options.dataset)
	            this.calculatedOptions.data = Trend.prepareData(options.dataset);
	        this.ee = new deps_1.EventEmitter();
	        this.canRequestPrepend = !!options.onPrependRequest;
	        this.bindEvents();
	    }
	    Trend.prototype.onInitialStateApplied = function () {
	        this.points = new TrendPoints_1.TrendPoints(this.chartState, this, Chart_1.MAX_DATA_LENGTH, this.getData()[0]);
	        this.marks = new TrendMarks_1.TrendMarks(this.chartState, this);
	    };
	    Trend.prototype.bindEvents = function () {
	        var _this = this;
	        var chartState = this.chartState;
	        chartState.onInitialStateApplied(function () { return _this.onInitialStateApplied(); });
	        chartState.onScrollStop(function () { return _this.checkForPrependRequest(); });
	        chartState.onZoom(function () { return _this.checkForPrependRequest(); });
	        chartState.onTrendChange(function (trendName, changedOptions, newData) { return _this.ee.emit('change', changedOptions, newData); });
	    };
	    Trend.prototype.getCalculatedOptions = function () {
	        return this.calculatedOptions;
	    };
	    Trend.prototype.appendData = function (rawData) {
	        var options = this.getOptions();
	        var newData = Trend.prepareData(rawData, this.getData());
	        var updatedTrendData = options.data.concat(newData);
	        this.changeData(updatedTrendData, newData);
	    };
	    Trend.prototype.prependData = function (rawData) {
	        var options = this.getOptions();
	        var newData = Trend.prepareData(rawData, this.getData(), true);
	        var updatedTrendData = newData.concat(options.data);
	        this.changeData(updatedTrendData, newData);
	    };
	    Trend.prototype.changeData = function (allData, newData) {
	        if (allData.length > Chart_1.MAX_DATA_LENGTH)
	            Utils_1.Utils.error('max data length reached');
	        var options = this.getOptions();
	        var statePatch = { trends: (_a = {}, _a[options.name] = { data: allData }, _a) };
	        this.chartState.setState(statePatch, newData);
	        var _a;
	    };
	    Trend.prototype.getData = function (fromX, toX) {
	        var data = this.getOptions().data;
	        if (fromX == void 0 && toX == void 0)
	            return data;
	        fromX = fromX !== void 0 ? fromX : data[0].xVal;
	        toX = toX !== void 0 ? toX : data[data.length].xVal;
	        var filteredData = [];
	        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
	            var item = data_1[_i];
	            if (item.xVal < fromX)
	                continue;
	            if (item.xVal > toX)
	                break;
	            filteredData.push(item);
	        }
	        return filteredData;
	    };
	    Trend.prototype.getFirstItem = function () {
	        return this.getOptions().data[0];
	    };
	    Trend.prototype.getLastItem = function () {
	        var data = this.getOptions().data;
	        return data[data.length - 1];
	    };
	    Trend.prototype.getOptions = function () {
	        return this.chartState.data.trends[this.name];
	    };
	    Trend.prototype.onPrependRequest = function (cb) {
	        var _this = this;
	        this.canRequestPrepend = true;
	        this.ee.on('prependRequest', cb);
	        return function () {
	            _this.ee.off('prependRequest', cb);
	        };
	    };
	    /**
	     * shortcut for ChartState.onTrendChange
	     */
	    Trend.prototype.onChange = function (cb) {
	        var _this = this;
	        this.ee.on('change', cb);
	        return function () {
	            _this.ee.off('change', cb);
	        };
	    };
	    Trend.prototype.onDataChange = function (cb) {
	        var _this = this;
	        var onChangeCb = function (changedOptions, newData) {
	            if (changedOptions.data)
	                cb(newData);
	        };
	        this.ee.on('change', onChangeCb);
	        return function () {
	            _this.ee.off('change', onChangeCb);
	        };
	    };
	    Trend.prototype.checkForPrependRequest = function () {
	        var _this = this;
	        if (this.prependRequest)
	            return;
	        var chartState = this.chartState;
	        var minXVal = chartState.data.computedData.trends.minXVal;
	        var minScreenX = chartState.getScreenXByValue(minXVal);
	        var needToRequest = this.canRequestPrepend && minScreenX > 0;
	        var _a = chartState.data.xAxis.range, from = _a.from, to = _a.to;
	        var requestedDataLength = to - from;
	        if (!needToRequest)
	            return;
	        this.prependRequest = new es6_promise_1.Promise(function (resolve, reject) {
	            _this.ee.emit('prependRequest', requestedDataLength, resolve, reject);
	        });
	        this.prependRequest.then(function (newData) {
	            _this.prependData(newData);
	            _this.prependRequest = null;
	        }, function () {
	            _this.prependRequest = null;
	        });
	    };
	    Trend.prepareData = function (newData, currentData, isPrepend) {
	        if (isPrepend === void 0) { isPrepend = false; }
	        var data = [];
	        if (typeof newData[0] == 'number') {
	            currentData = currentData || [];
	            var initialItem = void 0;
	            var xVal = void 0;
	            if (isPrepend) {
	                initialItem = currentData[0];
	                xVal = initialItem.xVal - newData.length;
	            }
	            else {
	                initialItem = currentData[currentData.length - 1];
	                xVal = initialItem ? initialItem.xVal + 1 : 0;
	            }
	            for (var _i = 0, _a = newData; _i < _a.length; _i++) {
	                var yVal = _a[_i];
	                data.push({ xVal: xVal, yVal: yVal, id: Utils_1.Utils.getUid() });
	                xVal++;
	            }
	        }
	        else {
	            data = newData;
	        }
	        return data;
	    };
	    return Trend;
	}());
	exports.Trend = Trend;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, global, module) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   3.2.1
	 */
	
	(function() {
	    "use strict";
	    function lib$es6$promise$utils$$objectOrFunction(x) {
	      return typeof x === 'function' || (typeof x === 'object' && x !== null);
	    }
	
	    function lib$es6$promise$utils$$isFunction(x) {
	      return typeof x === 'function';
	    }
	
	    function lib$es6$promise$utils$$isMaybeThenable(x) {
	      return typeof x === 'object' && x !== null;
	    }
	
	    var lib$es6$promise$utils$$_isArray;
	    if (!Array.isArray) {
	      lib$es6$promise$utils$$_isArray = function (x) {
	        return Object.prototype.toString.call(x) === '[object Array]';
	      };
	    } else {
	      lib$es6$promise$utils$$_isArray = Array.isArray;
	    }
	
	    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
	    var lib$es6$promise$asap$$len = 0;
	    var lib$es6$promise$asap$$vertxNext;
	    var lib$es6$promise$asap$$customSchedulerFn;
	
	    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
	      lib$es6$promise$asap$$len += 2;
	      if (lib$es6$promise$asap$$len === 2) {
	        // If len is 2, that means that we need to schedule an async flush.
	        // If additional callbacks are queued before the queue is flushed, they
	        // will be processed by this flush that we are scheduling.
	        if (lib$es6$promise$asap$$customSchedulerFn) {
	          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
	        } else {
	          lib$es6$promise$asap$$scheduleFlush();
	        }
	      }
	    }
	
	    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
	      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
	    }
	
	    function lib$es6$promise$asap$$setAsap(asapFn) {
	      lib$es6$promise$asap$$asap = asapFn;
	    }
	
	    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
	    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
	    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
	    var lib$es6$promise$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
	
	    // test for web worker but not in IE10
	    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
	      typeof importScripts !== 'undefined' &&
	      typeof MessageChannel !== 'undefined';
	
	    // node
	    function lib$es6$promise$asap$$useNextTick() {
	      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	      // see https://github.com/cujojs/when/issues/410 for details
	      return function() {
	        process.nextTick(lib$es6$promise$asap$$flush);
	      };
	    }
	
	    // vertx
	    function lib$es6$promise$asap$$useVertxTimer() {
	      return function() {
	        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
	      };
	    }
	
	    function lib$es6$promise$asap$$useMutationObserver() {
	      var iterations = 0;
	      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
	      var node = document.createTextNode('');
	      observer.observe(node, { characterData: true });
	
	      return function() {
	        node.data = (iterations = ++iterations % 2);
	      };
	    }
	
	    // web worker
	    function lib$es6$promise$asap$$useMessageChannel() {
	      var channel = new MessageChannel();
	      channel.port1.onmessage = lib$es6$promise$asap$$flush;
	      return function () {
	        channel.port2.postMessage(0);
	      };
	    }
	
	    function lib$es6$promise$asap$$useSetTimeout() {
	      return function() {
	        setTimeout(lib$es6$promise$asap$$flush, 1);
	      };
	    }
	
	    var lib$es6$promise$asap$$queue = new Array(1000);
	    function lib$es6$promise$asap$$flush() {
	      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
	        var callback = lib$es6$promise$asap$$queue[i];
	        var arg = lib$es6$promise$asap$$queue[i+1];
	
	        callback(arg);
	
	        lib$es6$promise$asap$$queue[i] = undefined;
	        lib$es6$promise$asap$$queue[i+1] = undefined;
	      }
	
	      lib$es6$promise$asap$$len = 0;
	    }
	
	    function lib$es6$promise$asap$$attemptVertx() {
	      try {
	        var r = require;
	        var vertx = __webpack_require__(15);
	        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
	        return lib$es6$promise$asap$$useVertxTimer();
	      } catch(e) {
	        return lib$es6$promise$asap$$useSetTimeout();
	      }
	    }
	
	    var lib$es6$promise$asap$$scheduleFlush;
	    // Decide what async method to use to triggering processing of queued callbacks:
	    if (lib$es6$promise$asap$$isNode) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
	    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
	    } else if (lib$es6$promise$asap$$isWorker) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
	    } else if (lib$es6$promise$asap$$browserWindow === undefined && "function" === 'function') {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
	    } else {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
	    }
	    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
	      var parent = this;
	
	      var child = new this.constructor(lib$es6$promise$$internal$$noop);
	
	      if (child[lib$es6$promise$$internal$$PROMISE_ID] === undefined) {
	        lib$es6$promise$$internal$$makePromise(child);
	      }
	
	      var state = parent._state;
	
	      if (state) {
	        var callback = arguments[state - 1];
	        lib$es6$promise$asap$$asap(function(){
	          lib$es6$promise$$internal$$invokeCallback(state, child, callback, parent._result);
	        });
	      } else {
	        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
	      }
	
	      return child;
	    }
	    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
	    function lib$es6$promise$promise$resolve$$resolve(object) {
	      /*jshint validthis:true */
	      var Constructor = this;
	
	      if (object && typeof object === 'object' && object.constructor === Constructor) {
	        return object;
	      }
	
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$resolve(promise, object);
	      return promise;
	    }
	    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
	    var lib$es6$promise$$internal$$PROMISE_ID = Math.random().toString(36).substring(16);
	
	    function lib$es6$promise$$internal$$noop() {}
	
	    var lib$es6$promise$$internal$$PENDING   = void 0;
	    var lib$es6$promise$$internal$$FULFILLED = 1;
	    var lib$es6$promise$$internal$$REJECTED  = 2;
	
	    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();
	
	    function lib$es6$promise$$internal$$selfFulfillment() {
	      return new TypeError("You cannot resolve a promise with itself");
	    }
	
	    function lib$es6$promise$$internal$$cannotReturnOwn() {
	      return new TypeError('A promises callback cannot return that same promise.');
	    }
	
	    function lib$es6$promise$$internal$$getThen(promise) {
	      try {
	        return promise.then;
	      } catch(error) {
	        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
	        return lib$es6$promise$$internal$$GET_THEN_ERROR;
	      }
	    }
	
	    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	      try {
	        then.call(value, fulfillmentHandler, rejectionHandler);
	      } catch(e) {
	        return e;
	      }
	    }
	
	    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
	       lib$es6$promise$asap$$asap(function(promise) {
	        var sealed = false;
	        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
	          if (sealed) { return; }
	          sealed = true;
	          if (thenable !== value) {
	            lib$es6$promise$$internal$$resolve(promise, value);
	          } else {
	            lib$es6$promise$$internal$$fulfill(promise, value);
	          }
	        }, function(reason) {
	          if (sealed) { return; }
	          sealed = true;
	
	          lib$es6$promise$$internal$$reject(promise, reason);
	        }, 'Settle: ' + (promise._label || ' unknown promise'));
	
	        if (!sealed && error) {
	          sealed = true;
	          lib$es6$promise$$internal$$reject(promise, error);
	        }
	      }, promise);
	    }
	
	    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
	      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
	      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, thenable._result);
	      } else {
	        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      }
	    }
	
	    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
	      if (maybeThenable.constructor === promise.constructor &&
	          then === lib$es6$promise$then$$default &&
	          constructor.resolve === lib$es6$promise$promise$resolve$$default) {
	        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
	      } else {
	        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
	        } else if (then === undefined) {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        } else if (lib$es6$promise$utils$$isFunction(then)) {
	          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
	        } else {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        }
	      }
	    }
	
	    function lib$es6$promise$$internal$$resolve(promise, value) {
	      if (promise === value) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
	      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
	        lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
	      } else {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      }
	    }
	
	    function lib$es6$promise$$internal$$publishRejection(promise) {
	      if (promise._onerror) {
	        promise._onerror(promise._result);
	      }
	
	      lib$es6$promise$$internal$$publish(promise);
	    }
	
	    function lib$es6$promise$$internal$$fulfill(promise, value) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	
	      promise._result = value;
	      promise._state = lib$es6$promise$$internal$$FULFILLED;
	
	      if (promise._subscribers.length !== 0) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
	      }
	    }
	
	    function lib$es6$promise$$internal$$reject(promise, reason) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	      promise._state = lib$es6$promise$$internal$$REJECTED;
	      promise._result = reason;
	
	      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
	    }
	
	    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
	      var subscribers = parent._subscribers;
	      var length = subscribers.length;
	
	      parent._onerror = null;
	
	      subscribers[length] = child;
	      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
	      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;
	
	      if (length === 0 && parent._state) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
	      }
	    }
	
	    function lib$es6$promise$$internal$$publish(promise) {
	      var subscribers = promise._subscribers;
	      var settled = promise._state;
	
	      if (subscribers.length === 0) { return; }
	
	      var child, callback, detail = promise._result;
	
	      for (var i = 0; i < subscribers.length; i += 3) {
	        child = subscribers[i];
	        callback = subscribers[i + settled];
	
	        if (child) {
	          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
	        } else {
	          callback(detail);
	        }
	      }
	
	      promise._subscribers.length = 0;
	    }
	
	    function lib$es6$promise$$internal$$ErrorObject() {
	      this.error = null;
	    }
	
	    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();
	
	    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
	      try {
	        return callback(detail);
	      } catch(e) {
	        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
	        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
	      }
	    }
	
	    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
	      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
	          value, error, succeeded, failed;
	
	      if (hasCallback) {
	        value = lib$es6$promise$$internal$$tryCatch(callback, detail);
	
	        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
	          failed = true;
	          error = value.error;
	          value = null;
	        } else {
	          succeeded = true;
	        }
	
	        if (promise === value) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
	          return;
	        }
	
	      } else {
	        value = detail;
	        succeeded = true;
	      }
	
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	        // noop
	      } else if (hasCallback && succeeded) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      } else if (failed) {
	        lib$es6$promise$$internal$$reject(promise, error);
	      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      }
	    }
	
	    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
	      try {
	        resolver(function resolvePromise(value){
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function rejectPromise(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      } catch(e) {
	        lib$es6$promise$$internal$$reject(promise, e);
	      }
	    }
	
	    var lib$es6$promise$$internal$$id = 0;
	    function lib$es6$promise$$internal$$nextId() {
	      return lib$es6$promise$$internal$$id++;
	    }
	
	    function lib$es6$promise$$internal$$makePromise(promise) {
	      promise[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$id++;
	      promise._state = undefined;
	      promise._result = undefined;
	      promise._subscribers = [];
	    }
	
	    function lib$es6$promise$promise$all$$all(entries) {
	      return new lib$es6$promise$enumerator$$default(this, entries).promise;
	    }
	    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	    function lib$es6$promise$promise$race$$race(entries) {
	      /*jshint validthis:true */
	      var Constructor = this;
	
	      if (!lib$es6$promise$utils$$isArray(entries)) {
	        return new Constructor(function(resolve, reject) {
	          reject(new TypeError('You must pass an array to race.'));
	        });
	      } else {
	        return new Constructor(function(resolve, reject) {
	          var length = entries.length;
	          for (var i = 0; i < length; i++) {
	            Constructor.resolve(entries[i]).then(resolve, reject);
	          }
	        });
	      }
	    }
	    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
	    function lib$es6$promise$promise$reject$$reject(reason) {
	      /*jshint validthis:true */
	      var Constructor = this;
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$reject(promise, reason);
	      return promise;
	    }
	    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;
	
	
	    function lib$es6$promise$promise$$needsResolver() {
	      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	    }
	
	    function lib$es6$promise$promise$$needsNew() {
	      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	    }
	
	    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
	    /**
	      Promise objects represent the eventual result of an asynchronous operation. The
	      primary way of interacting with a promise is through its `then` method, which
	      registers callbacks to receive either a promise's eventual value or the reason
	      why the promise cannot be fulfilled.
	
	      Terminology
	      -----------
	
	      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	      - `thenable` is an object or function that defines a `then` method.
	      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	      - `exception` is a value that is thrown using the throw statement.
	      - `reason` is a value that indicates why a promise was rejected.
	      - `settled` the final resting state of a promise, fulfilled or rejected.
	
	      A promise can be in one of three states: pending, fulfilled, or rejected.
	
	      Promises that are fulfilled have a fulfillment value and are in the fulfilled
	      state.  Promises that are rejected have a rejection reason and are in the
	      rejected state.  A fulfillment value is never a thenable.
	
	      Promises can also be said to *resolve* a value.  If this value is also a
	      promise, then the original promise's settled state will match the value's
	      settled state.  So a promise that *resolves* a promise that rejects will
	      itself reject, and a promise that *resolves* a promise that fulfills will
	      itself fulfill.
	
	
	      Basic Usage:
	      ------------
	
	      ```js
	      var promise = new Promise(function(resolve, reject) {
	        // on success
	        resolve(value);
	
	        // on failure
	        reject(reason);
	      });
	
	      promise.then(function(value) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```
	
	      Advanced Usage:
	      ---------------
	
	      Promises shine when abstracting away asynchronous interactions such as
	      `XMLHttpRequest`s.
	
	      ```js
	      function getJSON(url) {
	        return new Promise(function(resolve, reject){
	          var xhr = new XMLHttpRequest();
	
	          xhr.open('GET', url);
	          xhr.onreadystatechange = handler;
	          xhr.responseType = 'json';
	          xhr.setRequestHeader('Accept', 'application/json');
	          xhr.send();
	
	          function handler() {
	            if (this.readyState === this.DONE) {
	              if (this.status === 200) {
	                resolve(this.response);
	              } else {
	                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	              }
	            }
	          };
	        });
	      }
	
	      getJSON('/posts.json').then(function(json) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```
	
	      Unlike callbacks, promises are great composable primitives.
	
	      ```js
	      Promise.all([
	        getJSON('/posts'),
	        getJSON('/comments')
	      ]).then(function(values){
	        values[0] // => postsJSON
	        values[1] // => commentsJSON
	
	        return values;
	      });
	      ```
	
	      @class Promise
	      @param {function} resolver
	      Useful for tooling.
	      @constructor
	    */
	    function lib$es6$promise$promise$$Promise(resolver) {
	      this[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$nextId();
	      this._result = this._state = undefined;
	      this._subscribers = [];
	
	      if (lib$es6$promise$$internal$$noop !== resolver) {
	        typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
	        this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
	      }
	    }
	
	    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
	    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
	    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
	    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
	    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
	    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
	    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;
	
	    lib$es6$promise$promise$$Promise.prototype = {
	      constructor: lib$es6$promise$promise$$Promise,
	
	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.
	
	      ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```
	
	      Chaining
	      --------
	
	      The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.
	
	      ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });
	
	      findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	
	      ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```
	
	      Assimilation
	      ------------
	
	      Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.
	
	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```
	
	      If the assimliated promise rejects, then the downstream promise will also reject.
	
	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```
	
	      Simple Example
	      --------------
	
	      Synchronous Example
	
	      ```javascript
	      var result;
	
	      try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```
	
	      Errback Example
	
	      ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```
	
	      Promise Example;
	
	      ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```
	
	      Advanced Example
	      --------------
	
	      Synchronous Example
	
	      ```javascript
	      var author, books;
	
	      try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```
	
	      Errback Example
	
	      ```js
	
	      function foundBooks(books) {
	
	      }
	
	      function failure(reason) {
	
	      }
	
	      findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```
	
	      Promise Example;
	
	      ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```
	
	      @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	      then: lib$es6$promise$then$$default,
	
	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.
	
	      ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }
	
	      // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }
	
	      // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```
	
	      @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	      'catch': function(onRejection) {
	        return this.then(null, onRejection);
	      }
	    };
	    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
	    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
	      this._instanceConstructor = Constructor;
	      this.promise = new Constructor(lib$es6$promise$$internal$$noop);
	
	      if (!this.promise[lib$es6$promise$$internal$$PROMISE_ID]) {
	        lib$es6$promise$$internal$$makePromise(this.promise);
	      }
	
	      if (lib$es6$promise$utils$$isArray(input)) {
	        this._input     = input;
	        this.length     = input.length;
	        this._remaining = input.length;
	
	        this._result = new Array(this.length);
	
	        if (this.length === 0) {
	          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	        } else {
	          this.length = this.length || 0;
	          this._enumerate();
	          if (this._remaining === 0) {
	            lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	          }
	        }
	      } else {
	        lib$es6$promise$$internal$$reject(this.promise, lib$es6$promise$enumerator$$validationError());
	      }
	    }
	
	    function lib$es6$promise$enumerator$$validationError() {
	      return new Error('Array Methods must be provided an Array');
	    }
	
	    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
	      var length  = this.length;
	      var input   = this._input;
	
	      for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        this._eachEntry(input[i], i);
	      }
	    };
	
	    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
	      var c = this._instanceConstructor;
	      var resolve = c.resolve;
	
	      if (resolve === lib$es6$promise$promise$resolve$$default) {
	        var then = lib$es6$promise$$internal$$getThen(entry);
	
	        if (then === lib$es6$promise$then$$default &&
	            entry._state !== lib$es6$promise$$internal$$PENDING) {
	          this._settledAt(entry._state, i, entry._result);
	        } else if (typeof then !== 'function') {
	          this._remaining--;
	          this._result[i] = entry;
	        } else if (c === lib$es6$promise$promise$$default) {
	          var promise = new c(lib$es6$promise$$internal$$noop);
	          lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
	          this._willSettleAt(promise, i);
	        } else {
	          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
	        }
	      } else {
	        this._willSettleAt(resolve(entry), i);
	      }
	    };
	
	    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
	      var promise = this.promise;
	
	      if (promise._state === lib$es6$promise$$internal$$PENDING) {
	        this._remaining--;
	
	        if (state === lib$es6$promise$$internal$$REJECTED) {
	          lib$es6$promise$$internal$$reject(promise, value);
	        } else {
	          this._result[i] = value;
	        }
	      }
	
	      if (this._remaining === 0) {
	        lib$es6$promise$$internal$$fulfill(promise, this._result);
	      }
	    };
	
	    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
	      var enumerator = this;
	
	      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
	        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
	      }, function(reason) {
	        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
	      });
	    };
	    function lib$es6$promise$polyfill$$polyfill() {
	      var local;
	
	      if (typeof global !== 'undefined') {
	          local = global;
	      } else if (typeof self !== 'undefined') {
	          local = self;
	      } else {
	          try {
	              local = Function('return this')();
	          } catch (e) {
	              throw new Error('polyfill failed because global object is unavailable in this environment');
	          }
	      }
	
	      var P = local.Promise;
	
	      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
	        return;
	      }
	
	      local.Promise = lib$es6$promise$promise$$default;
	    }
	    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;
	
	    var lib$es6$promise$umd$$ES6Promise = {
	      'Promise': lib$es6$promise$promise$$default,
	      'polyfill': lib$es6$promise$polyfill$$default
	    };
	
	    /* global define:true module:true window: true */
	    if ("function" === 'function' && __webpack_require__(16)['amd']) {
	      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return lib$es6$promise$umd$$ES6Promise; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module['exports']) {
	      module['exports'] = lib$es6$promise$umd$$ES6Promise;
	    } else if (typeof this !== 'undefined') {
	      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
	    }
	
	    lib$es6$promise$polyfill$$default();
	}).call(this);
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13), (function() { return this; }()), __webpack_require__(14)(module)))

/***/ },
/* 13 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Utils_1 = __webpack_require__(5);
	var deps_1 = __webpack_require__(3);
	(function (TREND_MARK_SIDE) {
	    TREND_MARK_SIDE[TREND_MARK_SIDE["TOP"] = 0] = "TOP";
	    TREND_MARK_SIDE[TREND_MARK_SIDE["BOTTOM"] = 1] = "BOTTOM";
	})(exports.TREND_MARK_SIDE || (exports.TREND_MARK_SIDE = {}));
	var TREND_MARK_SIDE = exports.TREND_MARK_SIDE;
	var AXIS_MARK_DEFAULT_OPTIONS = {
	    title: '',
	    description: '',
	    value: 0,
	    iconColor: 'rgb(255, 102, 217)',
	    orientation: TREND_MARK_SIDE.TOP
	};
	var TrendMarks = (function () {
	    function TrendMarks(chartState, trend) {
	        this.items = {};
	        this.chartState = chartState;
	        this.ee = new deps_1.EventEmitter();
	        this.trend = trend;
	        this.onMarksChange();
	        this.bindEvents();
	    }
	    TrendMarks.prototype.bindEvents = function () {
	        var _this = this;
	        this.trend.onDataChange(function () { return _this.updateMarksPoints(); });
	        this.trend.onChange(function (changedOptions) { return _this.onTrendChange(changedOptions); });
	    };
	    TrendMarks.prototype.onTrendChange = function (changedOptions) {
	        if (!changedOptions.marks)
	            return;
	        this.onMarksChange();
	        this.ee.emit('change');
	    };
	    TrendMarks.prototype.onChange = function (cb) {
	        var _this = this;
	        this.ee.on('change', cb);
	        return function () {
	            _this.ee.off('change', cb);
	        };
	    };
	    TrendMarks.prototype.updateMarksPoints = function () {
	        var marks = this.items;
	        var marksArr = [];
	        var xVals = [];
	        for (var markName in marks) {
	            var mark = marks[markName];
	            xVals.push(mark.options.value);
	            marksArr.push(mark);
	            mark.setPoint(null);
	        }
	        marksArr.sort(function (a, b) { return a.options.value - b.options.value; });
	        var points = this.trend.points.getPointsForXValues(xVals.sort(function (a, b) { return a - b; }));
	        for (var markInd = 0; markInd < marksArr.length; markInd++) {
	            marksArr[markInd].setPoint(points[markInd]);
	        }
	    };
	    TrendMarks.prototype.onMarksChange = function () {
	        var trendsMarksOptions = this.trend.getOptions().marks;
	        for (var _i = 0, trendsMarksOptions_1 = trendsMarksOptions; _i < trendsMarksOptions_1.length; _i++) {
	            var options = trendsMarksOptions_1[_i];
	            var marks = this.items;
	            // set mark name
	            if (!options.name) {
	                options.name = Utils_1.Utils.getUid().toString();
	                if (marks[options.name])
	                    Utils_1.Utils.error('duplicated mark name ' + options.name);
	            }
	            else if (marks[options.name]) {
	                continue;
	            }
	            options = Utils_1.Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
	            var mark = new TrendMark(this.chartState, options, this.trend);
	            marks[options.name] = mark;
	        }
	        this.updateMarksPoints();
	    };
	    TrendMarks.prototype.createMark = function (options) {
	        var marksOptions = this.trend.getOptions().marks;
	        var newMarkOptions = marksOptions.concat([options]);
	        this.chartState.setState({ trends: (_a = {}, _a[this.trend.name] = { marks: newMarkOptions }, _a) });
	        var _a;
	    };
	    TrendMarks.prototype.getItems = function () {
	        return this.items;
	    };
	    TrendMarks.prototype.getItem = function (markName) {
	        return this.items[markName];
	    };
	    return TrendMarks;
	}());
	exports.TrendMarks = TrendMarks;
	var TrendMark = (function () {
	    function TrendMark(chartState, options, trend) {
	        this.renderOnTrendsChange = false;
	        this.ee = new deps_1.EventEmitter();
	        this.options = options;
	        this.chartState = chartState;
	        this.trend = trend;
	    }
	    TrendMark.prototype.onAnimationFrame = function (cb) {
	        var _this = this;
	        this.ee.on('onAnimationFrame', cb);
	        return function () {
	            _this.ee.off('onAnimationFrame', cb);
	        };
	    };
	    /**
	     * only for internal usage
	     */
	    TrendMark.prototype.setPoint = function (point) {
	        this.point = point;
	    };
	    return TrendMark;
	}());
	exports.TrendMark = TrendMark;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var deps_1 = __webpack_require__(3);
	var Vector3 = THREE.Vector3;
	var Utils_1 = __webpack_require__(5);
	// class helps to animate trends points
	var TrendPoints = (function () {
	    function TrendPoints(chartState, trend, pointsCount, initialItem) {
	        this.points = {};
	        //pointsByXVal: {[scrollXVal: string]: TrendPoint} = {};
	        // objects like {x0: 1, y0: 2, x1: 2, y2: 3, ...}
	        this.current = {};
	        this.targets = {};
	        this.nextEmptyId = 0;
	        this.startPointId = 0;
	        this.endPointId = 0;
	        this.chartState = chartState;
	        this.trend = trend;
	        this.ee = new deps_1.EventEmitter();
	        var point;
	        for (var i = 0; i < pointsCount; i++) {
	            var id = i;
	            point = new TrendPoint(this, id, initialItem.xVal, initialItem.yVal);
	            this.points[id] = point;
	            this.current['x' + id] = initialItem.xVal;
	            this.current['y' + id] = initialItem.yVal;
	        }
	        this.appendData(this.trend.getData());
	        this.bindEvents();
	    }
	    TrendPoints.prototype.bindEvents = function () {
	        var _this = this;
	        this.trend.onChange(function (changedOptions, newData) {
	            if (newData) {
	                var data = _this.trend.getData();
	                var isAppend = (!data.length || data[0].xVal < newData[0].xVal);
	                isAppend ? _this.appendData(newData) : _this.prependData(newData);
	            }
	        });
	    };
	    TrendPoints.prototype.getEndPoint = function () {
	        return this.points[this.endPointId];
	    };
	    TrendPoints.prototype.getStartPoint = function () {
	        return this.points[this.startPointId];
	    };
	    /**
	     * returns array of points for values array
	     * values must be sorted!
	     */
	    TrendPoints.prototype.getPointsForXValues = function (values) {
	        var valueInd = 0;
	        var value = values[valueInd];
	        var lastValueInd = values.length - 1;
	        var results = [];
	        var point = this.getStartPoint();
	        if (!point.hasValue)
	            return [];
	        while (point) {
	            while (value < point.startXVal) {
	                results.push(void 0);
	                value = values[++valueInd];
	            }
	            while (value > point.endXVal) {
	                point = point.getNext();
	                if (!point)
	                    break;
	            }
	            var valueInPoint = (point.startXVal == value || point.endXVal == value ||
	                (point.startXVal < value && point.endXVal < value));
	            if (valueInPoint) {
	                results.push(point);
	                value = values[++valueInd];
	            }
	            if (valueInd > lastValueInd)
	                break;
	        }
	        return results;
	    };
	    TrendPoints.prototype.onAnimationFrame = function (cb) {
	        var _this = this;
	        var eventName = 'animationFrame';
	        this.ee.on('animationFrame', cb);
	        return function () {
	            _this.ee.removeListener(eventName, cb);
	        };
	    };
	    TrendPoints.prototype.appendPoint = function (item) {
	        var id = this.nextEmptyId++;
	        var point = this.points[id];
	        var prevPoint = this.points[this.endPointId];
	        if (prevPoint.hasValue) {
	            prevPoint.nextId = id;
	            point.prevId = prevPoint.id;
	        }
	        point.hasValue = true;
	        point.startXVal = item.xVal;
	        point.endXVal = item.xVal;
	        point.xVal = item.xVal;
	        point.yVal = item.yVal;
	        this.endPointId = id;
	        return point;
	    };
	    TrendPoints.prototype.prependPoint = function (item) {
	        var id = this.nextEmptyId++;
	        var point = this.points[id];
	        var nextPoint = this.points[this.startPointId];
	        if (nextPoint.hasValue) {
	            nextPoint.prevId = id;
	            point.nextId = nextPoint.id;
	        }
	        point.hasValue = true;
	        point.startXVal = item.xVal;
	        point.endXVal = item.xVal;
	        point.xVal = item.xVal;
	        point.yVal = item.yVal;
	        this.startPointId = id;
	        return point;
	    };
	    TrendPoints.prototype.prependData = function (newData) {
	        var chartState = this.chartState;
	        var trendData = this.trend.getData();
	        var animationsOptions = chartState.data.animations;
	        var startItemInd = newData.length;
	        var startItem = trendData[startItemInd] || newData[0];
	        var current = {};
	        var targets = {};
	        for (var itemInd = startItemInd - 1; itemInd >= 0; itemInd--) {
	            var trendItem = trendData[itemInd];
	            var point = this.prependPoint(trendItem);
	            var id = point.id;
	            current['x' + id] = startItem.xVal;
	            current['y' + id] = startItem.yVal;
	            targets['x' + id] = trendItem.xVal;
	            targets['y' + id] = trendItem.yVal;
	        }
	        targets.ease = animationsOptions.trendChangeEase;
	        var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
	        this.animate(time, targets, current);
	    };
	    TrendPoints.prototype.appendData = function (newData) {
	        var chartState = this.chartState;
	        var trendData = this.trend.getData();
	        var animationsOptions = chartState.data.animations;
	        var startItemInd = trendData.length - newData.length;
	        var startItem = trendData[startItemInd - 1] || newData[0];
	        var current = {};
	        var targets = {};
	        for (var itemInd = startItemInd; itemInd < trendData.length; itemInd++) {
	            var trendItem = trendData[itemInd];
	            var point = this.appendPoint(trendItem);
	            var id = point.id;
	            current['x' + id] = startItem.xVal;
	            current['y' + id] = startItem.yVal;
	            targets['x' + id] = trendItem.xVal;
	            targets['y' + id] = trendItem.yVal;
	        }
	        targets.ease = animationsOptions.trendChangeEase;
	        var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
	        this.animate(time, targets, current);
	    };
	    TrendPoints.prototype.animate = function (time, newTargets, current) {
	        var _this = this;
	        var cb = function () {
	            _this.ee.emit('animationFrame', _this);
	        };
	        var cb = function () {
	            _this.ee.emit('animationFrame', _this);
	        };
	        if (this.currentAnimation)
	            this.currentAnimation.kill();
	        if (current)
	            this.current = Utils_1.Utils.deepMerge(this.current, current);
	        this.targets = Utils_1.Utils.deepMerge(this.targets, newTargets);
	        this.currentAnimation = TweenLite.to(this.current, time, this.targets);
	        this.currentAnimation.eventCallback('onUpdate', cb);
	        this.currentAnimation.eventCallback('onComplete', function () {
	            _this.current = {};
	            _this.targets = {};
	            _this.currentAnimation = null;
	        });
	    };
	    return TrendPoints;
	}());
	exports.TrendPoints = TrendPoints;
	var TrendPoint = (function () {
	    function TrendPoint(trendPoints, id, xVal, yVal) {
	        this.trendPoints = trendPoints;
	        this.id = id;
	        this.xVal = xVal;
	        this.yVal = yVal;
	    }
	    TrendPoint.prototype.getNext = function () {
	        var nextPoint = this.trendPoints.points[this.nextId];
	        return nextPoint && nextPoint.hasValue ? nextPoint : null;
	    };
	    TrendPoint.prototype.getPrev = function () {
	        var prevPoint = this.trendPoints.points[this.prevId];
	        return prevPoint && prevPoint.hasValue ? prevPoint : null;
	    };
	    TrendPoint.prototype.getFrameVal = function () {
	        var current = this.trendPoints.current;
	        var frameValX = current['x' + this.id];
	        var frameValY = current['y' + this.id];
	        var xVal = frameValX != void 0 ? frameValX : this.xVal;
	        var yVal = frameValY != void 0 ? frameValY : this.yVal;
	        return new Vector3(xVal, yVal, 0);
	    };
	    TrendPoint.prototype.getFramePoint = function () {
	        var frameVal = this.getFrameVal();
	        return this.trendPoints.chartState.screen.getPointOnChart(frameVal.x, frameVal.y);
	    };
	    TrendPoint.prototype.getCurrentVec = function () {
	        var current = this.trendPoints.current;
	        return new Vector3(current['x' + this.id], current['y' + this.id], 0);
	    };
	    return TrendPoint;
	}());
	exports.TrendPoint = TrendPoint;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var PerspectiveCamera = THREE.PerspectiveCamera;
	var Vector3 = THREE.Vector3;
	var deps_1 = __webpack_require__(3);
	/**
	 * manage camera, and contains methods for transforming pixels to values
	 */
	var Screen = (function () {
	    function Screen(chartState) {
	        this.options = { scrollXVal: 0, scrollX: 0, scrollYVal: 0, scrollY: 0, zoomX: 1, zoomY: 1 };
	        this.currentScrollX = { val: 0 };
	        this.currentScrollY = { val: 0 };
	        this.currentZoomX = { val: 1 };
	        this.currentZoomY = { val: 1 };
	        this.chartState = chartState;
	        var _a = chartState.data, w = _a.width, h = _a.height;
	        this.ee = new deps_1.EventEmitter();
	        this.bindEvents();
	        //camera.position.z = 1500;
	    }
	    Screen.prototype.getCameraSettings = function () {
	        var _a = this.chartState.data, w = _a.width, h = _a.height;
	        // setup pixel-perfect camera
	        var FOV = 75;
	        var vFOV = FOV * (Math.PI / 180);
	        var camera = this.camera = new PerspectiveCamera(FOV, w / h, 0.1, 5000);
	        camera.position.z = h / (2 * Math.tan(vFOV / 2));
	        return {
	            FOV: FOV,
	            aspect: w / h,
	            near: 0.1,
	            far: 5000,
	            z: h / (2 * Math.tan(vFOV / 2)),
	            // move 0,0 to left-bottom corner
	            x: w / 2,
	            y: h / 2
	        };
	    };
	    Screen.prototype.onCameraChange = function (cb) {
	        var _this = this;
	        this.ee.on('cameraChange', cb);
	        return function () {
	            _this.ee.off('cameraChange', cb);
	        };
	    };
	    Screen.prototype.onZoomFrame = function (cb) {
	        var _this = this;
	        var eventName = 'zoomFrame';
	        this.ee.on(eventName, cb);
	        return function () {
	            _this.ee.removeListener(eventName, cb);
	        };
	    };
	    Screen.prototype.onScrollFrame = function (cb) {
	        var _this = this;
	        var eventName = 'scrollFrame';
	        this.ee.on(eventName, cb);
	        return function () {
	            _this.ee.removeListener(eventName, cb);
	        };
	    };
	    Screen.prototype.onTransformationFrame = function (cb) {
	        var _this = this;
	        var eventName = 'transformationFrame';
	        this.ee.on(eventName, cb);
	        return function () {
	            _this.ee.removeListener(eventName, cb);
	        };
	    };
	    Screen.prototype.transform = function (options) {
	        var scrollXVal = options.scrollXVal, scrollYVal = options.scrollYVal, zoomX = options.zoomX, zoomY = options.zoomY;
	        if (scrollXVal != void 0)
	            this.options.scrollXVal = scrollXVal;
	        if (scrollYVal != void 0)
	            this.options.scrollYVal = scrollYVal;
	        if (zoomX != void 0)
	            this.options.zoomX = zoomX;
	        if (zoomY != void 0)
	            this.options.zoomY = zoomY;
	        if (scrollXVal != void 0 || zoomX) {
	            options.scrollX = this.valueToPxByXAxis(scrollXVal != void 0 ? scrollXVal : this.options.scrollXVal);
	            this.options.scrollX = options.scrollX;
	        }
	        if (scrollYVal != void 0 || zoomY) {
	            options.scrollY = this.valueToPxByYAxis(scrollYVal != void 0 ? scrollYVal : this.options.scrollYVal);
	            this.options.scrollY = options.scrollY;
	        }
	        this.ee.emit('transformationFrame', options);
	        if (options.scrollXVal != void 0 || options.scrollYVal != void 0) {
	            this.ee.emit('scrollFrame', options);
	        }
	        if (options.zoomX != void 0 || options.zoomY != void 0) {
	            this.ee.emit('zoomFrame', options);
	        }
	    };
	    Screen.prototype.scrollTo = function (x, y) {
	        //
	        // if (scrollX != void 0) {
	        // 	this.cameraScrollX = scrollX;
	        // 	//var pointX = this.cameraInitialPosition.scrollX + this.chartState.valueToPxByXAxis(scrollX);
	        // 	this.camera.position.scrollX = this.cameraInitialPosition.scrollX + scrollX;
	        // }
	        //
	        // if (scrollY != void 0) {
	        // 	this.cameraScrollY = scrollY;
	        // 	//var pointY = this.cameraInitialPosition.scrollY + this.chartState.valueToPxByYAxis(scrollY);
	        // 	this.camera.position.scrollY = this.cameraInitialPosition.scrollY + scrollY;
	        // }
	        //
	        // // dirty hack, used only for performance reasons, in ideal world we always must use ChartState.setState
	        // // this.chartState.emit('cameraChange', {scrollX: scrollX, scrollY: scrollY});
	        this.ee.emit('cameraChange', x, y);
	    };
	    Screen.prototype.bindEvents = function () {
	        var _this = this;
	        var state = this.chartState;
	        // handle scroll and zoom
	        state.onChange(function (changedProps) {
	            if (changedProps.xAxis && changedProps.xAxis.range) {
	                if (changedProps.xAxis.range.scroll != void 0)
	                    _this.onScrollXHandler(changedProps);
	                if (changedProps.xAxis.range.zoom)
	                    _this.onZoomXHandler();
	            }
	            if (changedProps.yAxis && changedProps.yAxis.range) {
	                if (changedProps.yAxis.range.scroll != void 0)
	                    _this.onScrollYHandler();
	                if (changedProps.yAxis.range.zoom)
	                    _this.onZoomYHandler();
	            }
	        });
	    };
	    Screen.prototype.onScrollXHandler = function (changedProps) {
	        var _this = this;
	        var state = this.chartState;
	        var isDragMode = state.data.cursor.dragMode;
	        var animations = state.data.animations;
	        var canAnimate = animations.enabled && !isDragMode;
	        var zoomXChanged = changedProps.xAxis.range.zoom;
	        var isAutoscroll = !isDragMode && !zoomXChanged;
	        var time = isAutoscroll ? animations.autoScrollSpeed : animations.zoomSpeed;
	        var ease = isAutoscroll ? animations.autoScrollEase : animations.zoomEase;
	        var targetXVal = state.data.xAxis.range.scroll;
	        if (this.scrollXAnimation)
	            this.scrollXAnimation.pause();
	        var cb = function () {
	            _this.transform({ scrollXVal: _this.currentScrollX.val });
	        };
	        if (canAnimate) {
	            this.scrollXAnimation = TweenLite.to(this.currentScrollX, time, {
	                val: targetXVal, ease: ease
	            });
	            this.scrollXAnimation.eventCallback('onUpdate', cb);
	        }
	        else {
	            this.currentScrollX.val = targetXVal;
	            cb();
	        }
	    };
	    Screen.prototype.onScrollYHandler = function () {
	        var _this = this;
	        var state = this.chartState;
	        var animations = state.data.animations;
	        var canAnimate = animations.enabled;
	        var time = animations.zoomSpeed;
	        var targetYVal = state.data.yAxis.range.scroll;
	        if (this.scrollXAnimation)
	            this.scrollXAnimation.pause();
	        var cb = function () {
	            _this.transform({ scrollYVal: _this.currentScrollY.val });
	        };
	        if (canAnimate) {
	            this.scrollYAnimation = TweenLite.to(this.currentScrollY, time, {
	                val: targetYVal, ease: animations.zoomEase
	            });
	            this.scrollYAnimation.eventCallback('onUpdate', cb);
	        }
	        else {
	            this.currentScrollY.val = targetYVal;
	            cb();
	        }
	    };
	    Screen.prototype.onZoomXHandler = function () {
	        var _this = this;
	        var state = this.chartState;
	        var animations = state.data.animations;
	        var canAnimate = animations.enabled;
	        var time = animations.zoomSpeed;
	        var targetZoom = state.data.xAxis.range.zoom;
	        if (this.zoomXAnimation)
	            this.zoomXAnimation.pause();
	        var cb = function () {
	            _this.transform({ zoomX: _this.currentZoomX.val });
	        };
	        if (canAnimate) {
	            this.zoomXAnimation = TweenLite.to(this.currentZoomX, time, {
	                val: targetZoom, ease: animations.zoomEase
	            });
	            this.zoomXAnimation.eventCallback('onUpdate', cb);
	        }
	        else {
	            this.currentZoomX.val = targetZoom;
	            cb();
	        }
	    };
	    Screen.prototype.onZoomYHandler = function () {
	        var _this = this;
	        var state = this.chartState;
	        var animations = state.data.animations;
	        var canAnimate = animations.enabled;
	        var time = animations.zoomSpeed;
	        var targetZoom = state.data.yAxis.range.zoom;
	        if (this.zoomYAnimation)
	            this.zoomYAnimation.pause();
	        var cb = function () {
	            _this.transform({ zoomY: _this.currentZoomY.val });
	        };
	        if (canAnimate) {
	            this.zoomYAnimation = TweenLite.to(this.currentZoomY, time, {
	                val: targetZoom, ease: animations.zoomEase
	            });
	            this.zoomYAnimation.eventCallback('onUpdate', cb);
	        }
	        else {
	            this.currentZoomY.val = targetZoom;
	            cb();
	        }
	    };
	    Screen.prototype.onScroll = function (changedProps) {
	        // var state = this.chartState;
	        // var isDragMode = state.data.cursor.dragMode;
	        // var animations =  state.data.animations;
	        // var targetScrollX = state.valueToPxByXAxis(state.data.xAxis.range.scroll);
	        // var targetScrollY = state.valueToPxByYAxis(state.data.yAxis.range.scroll);
	        // var scrollXChanged = targetScrollX !== state.data.prevState.xAxis.range.scroll;
	        // var scrollYChanged = targetScrollY !== state.data.prevState.yAxis.range.scroll;
	        // var zoomXChanged = changedProps.xAxis && changedProps.xAxis.range && changedProps.xAxis.range.zoom != void 0;
	        // var canAnimate = animations.enabled;
	        //
	        //
	        // if (scrollYChanged) {
	        // 	if (this.scrollYAnimation) this.scrollYAnimation.pause();
	        // 	this.currentScrollY = this.currentScrollY || {val: this.cameraScrollY};
	        // 	if (canAnimate) {
	        // 		this.scrollYAnimation = TweenLite.to(this.currentScrollY, animations.zoomSpeed, {
	        // 			val: targetScrollY, ease: animations.zoomEase
	        // 		});
	        // 		this.scrollYAnimation.eventCallback('onUpdate', () => {
	        // 			this.scrollTo(null, this.currentScrollY.val);
	        // 		});
	        // 	} else {
	        // 		this.currentScrollY.val = targetScrollY;
	        // 		this.scrollTo(null, targetScrollY);
	        // 	}
	        // }
	        //
	        // if (scrollXChanged) {
	        // 	canAnimate = canAnimate && !isDragMode && !zoomXChanged;
	        // 	if (this.scrollXAnimation) this.scrollXAnimation.pause();
	        // 	this.currentScrollX = this.currentScrollX || {val: this.cameraScrollX};
	        // 	if (canAnimate) {
	        // 		this.scrollXAnimation = TweenLite.to(this.currentScrollX, animations.autoScrollSpeed, {
	        // 			val: targetScrollX, ease: animations.autoScrollEase
	        // 		});
	        // 		this.scrollXAnimation.eventCallback('onUpdate', () => {
	        // 			this.scrollTo(this.currentScrollX.val);
	        // 		});
	        // 	} else {
	        // 		this.currentScrollX.val = targetScrollX;
	        // 		this.scrollTo(targetScrollX);
	        // 	}
	        // }
	        // //canAnimate = false;
	        // this.currentScroll = this.currentScroll || {scrollXVal: this.cameraScrollXVal, scrollYVal: this.cameraScrollYVal};
	        // var targetXVal = state.data.xAxis.range.scroll;
	        // var targetYVal = state.data.yAxis.range.scroll;
	        // if (this.cameraAnimation) this.cameraAnimation.pause();
	        // if (canAnimate) {
	        // 	this.cameraAnimation = TweenLite.to(this.currentScroll, animations.autoScrollSpeed, {
	        // 		scrollXVal: targetXVal, scrollYVal: targetYVal, ease: animations.autoScrollEase
	        // 	});
	        // 	this.cameraAnimation.eventCallback('onUpdate', () => {
	        // 		this.scrollTo(this.currentScroll.scrollXVal, this.currentScroll.scrollYVal);
	        // 	});
	        // 	return;
	        // }
	        // this.scrollTo(targetXVal, targetYVal);
	    };
	    /**
	     *  returns offset in pixels from xAxis.range.zeroVal to scrollXVal
	     */
	    Screen.prototype.getPointOnXAxis = function (xVal) {
	        var _a = this.chartState.data.xAxis.range, scaleFactor = _a.scaleFactor, zeroVal = _a.zeroVal;
	        var zoom = this.options.zoomX;
	        return (xVal - zeroVal) * scaleFactor * zoom;
	    };
	    /**
	     *  returns offset in pixels from yAxis.range.zeroVal to scrollYVal
	     */
	    Screen.prototype.getPointOnYAxis = function (yVal) {
	        var _a = this.chartState.data.yAxis.range, scaleFactor = _a.scaleFactor, zeroVal = _a.zeroVal;
	        var zoom = this.options.zoomY;
	        return (yVal - zeroVal) * scaleFactor * zoom;
	    };
	    /**
	     *  returns offset in pixels from xAxis.range.zeroVal and from yAxis.range.zeroVal to scrollXVal and scrollYVal
	     */
	    Screen.prototype.getPointOnChart = function (xVal, yVal) {
	        return new Vector3(this.getPointOnXAxis(xVal), this.getPointOnYAxis(yVal), 0);
	    };
	    /**
	     * returns value by offset in pixels from xAxis.range.zeroVal
	     */
	    Screen.prototype.getValueOnXAxis = function (x) {
	        return this.chartState.data.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
	    };
	    /**
	     *  convert value to pixels by using settings from xAxis.range
	     */
	    Screen.prototype.valueToPxByXAxis = function (xVal) {
	        return xVal * this.chartState.data.xAxis.range.scaleFactor * this.options.zoomX;
	    };
	    /**
	     *  convert value to pixels by using settings from yAxis.range
	     */
	    Screen.prototype.valueToPxByYAxis = function (yVal) {
	        return yVal * this.chartState.data.yAxis.range.scaleFactor * this.options.zoomY;
	    };
	    /**
	     *  convert pixels to value by using settings from xAxis.range
	     */
	    Screen.prototype.pxToValueByXAxis = function (xVal) {
	        return xVal / this.chartState.data.xAxis.range.scaleFactor / this.options.zoomX;
	    };
	    /**
	     *  convert pixels to value by using settings from yAxis.range
	     */
	    Screen.prototype.pxToValueByYAxis = function (yVal) {
	        return yVal / this.chartState.data.yAxis.range.scaleFactor / this.options.zoomY;
	    };
	    /**
	     *  returns scrollX value by screen scrollX coordinate
	     */
	    Screen.prototype.getValueByScreenX = function (x) {
	        return this.chartState.data.xAxis.range.zeroVal + this.options.scrollXVal + this.pxToValueByXAxis(x);
	    };
	    /**
	     *  returns scrollY value by screen scrollY coordinate
	     */
	    Screen.prototype.getValueByScreenY = function (y) {
	        return this.chartState.data.yAxis.range.zeroVal + this.options.scrollYVal + this.pxToValueByYAxis(y);
	    };
	    //
	    /**
	     *  returns screen scrollX value by screen scrollY coordinate
	     */
	    Screen.prototype.getScreenXByValue = function (xVal) {
	        var _a = this.chartState.data.xAxis.range, scroll = _a.scroll, zeroVal = _a.zeroVal;
	        return this.valueToPxByXAxis(xVal - zeroVal - scroll);
	    };
	    // /**
	    //  *  returns screen scrollY value by screen scrollY coordinate
	    //  */
	    // getScreenYByValue(scrollYVal: number): number {
	    // 	var {scroll, zeroVal} = this.data.yAxis.range;
	    // 	return this.valueToPxByYAxis(scrollYVal - zeroVal - scroll)
	    // }
	    //
	    //
	    /**
	     * returns screen scrollX coordinate by offset in pixels from xAxis.range.zeroVal value
	     */
	    Screen.prototype.getScreenXByPoint = function (xVal) {
	        return this.getScreenXByValue(this.getValueOnXAxis(xVal));
	    };
	    /**
	     * returns offset in pixels from xAxis.range.zeroVal value by screen scrollX coordinate
	     */
	    Screen.prototype.getPointByScreenX = function (screenX) {
	        return this.getPointOnXAxis(this.getValueByScreenX(screenX));
	    };
	    /**
	     * returns offset in pixels from yAxis.range.zeroVal value by screen scrollY coordinate
	     */
	    Screen.prototype.getPointByScreenY = function (screenY) {
	        return this.getPointOnYAxis(this.getValueByScreenY(screenY));
	    };
	    Screen.prototype.getBottom = function () {
	        return this.getPointByScreenY(0);
	    };
	    return Screen;
	}());
	exports.Screen = Screen;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Utils_1 = __webpack_require__(5);
	var interfaces_1 = __webpack_require__(21);
	var deps_1 = __webpack_require__(3);
	var AXIS_MARK_DEFAULT_OPTIONS = {
	    type: 'simple',
	    lineWidth: 2,
	    value: 0
	};
	var AxisMarks = (function () {
	    function AxisMarks(chartState, axisType) {
	        this.items = {};
	        if (axisType == interfaces_1.AXIS_TYPE.Y) {
	            // TODO: axis mark on Y axis
	            Utils_1.Utils.error('axis mark on Y axis not supported yet');
	            return;
	        }
	        this.chartState = chartState;
	        this.ee = new deps_1.EventEmitter();
	        this.axisType = axisType;
	        var marks = this.items;
	        var axisMarksOptions = chartState.data.xAxis.marks;
	        for (var _i = 0, axisMarksOptions_1 = axisMarksOptions; _i < axisMarksOptions_1.length; _i++) {
	            var options = axisMarksOptions_1[_i];
	            var axisMark = void 0;
	            options = Utils_1.Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
	            // set mark name
	            if (!options.name)
	                options.name = Utils_1.Utils.getUid().toString();
	            if (marks[options.name])
	                Utils_1.Utils.error('duplicated mark name ' + options.name);
	            // create mark instance based on type option
	            if (options.type == 'timeleft') {
	                axisMark = new AxisTimeleftMark(chartState, interfaces_1.AXIS_TYPE.X, options);
	            }
	            else {
	                axisMark = new AxisMark(chartState, interfaces_1.AXIS_TYPE.X, options);
	            }
	            marks[options.name] = axisMark;
	        }
	        this.bindEvents();
	    }
	    AxisMarks.prototype.onTrendChange = function (trendName, newData) {
	        if (!newData)
	            return;
	        var startVal = newData[0].xVal;
	        var endVal = newData[newData.length - 1].xVal;
	        var marks = this.items;
	        for (var markName in marks) {
	            var mark = marks[markName];
	            var markVal = mark.options.value;
	            var markWasCrossed = (startVal == markVal || endVal == markVal || (startVal < markVal && endVal > markVal));
	            if (markWasCrossed)
	                this.ee.emit('markCrossed', trendName, newData);
	        }
	    };
	    AxisMarks.prototype.bindEvents = function () {
	        var _this = this;
	        this.chartState.onTrendChange(function (trendName, changedOptions, newData) { return _this.onTrendChange(trendName, newData); });
	    };
	    AxisMarks.prototype.getItems = function () {
	        return this.items;
	    };
	    AxisMarks.prototype.getItem = function (markName) {
	        return this.items[markName];
	    };
	    return AxisMarks;
	}());
	exports.AxisMarks = AxisMarks;
	var AxisMark = (function () {
	    function AxisMark(chartState, axisType, options) {
	        this.renderOnTrendsChange = false;
	        if (axisType == interfaces_1.AXIS_TYPE.Y) {
	            // TODO: axis mark on Y axis
	            Utils_1.Utils.error('axis mark on Y axis not supported yet');
	        }
	        this.ee = new deps_1.EventEmitter();
	        this.options = options;
	        this.axisType = axisType;
	        this.chartState = chartState;
	        this.bindEvents();
	    }
	    AxisMark.prototype.bindEvents = function () { };
	    AxisMark.prototype.setOptions = function (newOptions) {
	        var value = this.options.value;
	        this.options = Utils_1.Utils.deepMerge(this.options, newOptions);
	        if (this.options.value !== value)
	            this.ee.emit('valueChange');
	        this.ee.emit('onDisplayedValueChange');
	    };
	    AxisMark.prototype.getDisplayedVal = function () {
	        return String(this.options.value);
	    };
	    AxisMark.prototype.onMarkCrossed = function (cb) {
	        var _this = this;
	        this.ee.on('markCrossed', cb);
	        return function () {
	            _this.ee.off('markCrossed', cb);
	        };
	    };
	    AxisMark.prototype.onValueChange = function (cb) {
	        var _this = this;
	        this.ee.on('valueChange', cb);
	        return function () {
	            _this.ee.off('valueChange', cb);
	        };
	    };
	    AxisMark.prototype.onDisplayedValueChange = function (cb) {
	        var _this = this;
	        this.ee.on('onDisplayedValueChange', cb);
	        return function () {
	            _this.ee.off('onDisplayedValueChange', cb);
	        };
	    };
	    AxisMark.typeName = 'simple';
	    return AxisMark;
	}());
	exports.AxisMark = AxisMark;
	var AxisTimeleftMark = (function (_super) {
	    __extends(AxisTimeleftMark, _super);
	    function AxisTimeleftMark() {
	        _super.apply(this, arguments);
	        this.renderOnTrendsChange = true;
	    }
	    AxisTimeleftMark.prototype.getDisplayedVal = function () {
	        var markVal = this.options.value;
	        var maxXVal = this.chartState.data.computedData.trends.maxXVal;
	        var time = markVal - maxXVal;
	        if (time < 0)
	            time = 0;
	        return Utils_1.Utils.msToTimeString(time);
	    };
	    AxisTimeleftMark.prototype.bindEvents = function () {
	        var _this = this;
	        this.chartState.onTrendsChange(function () { return _this.onTrendsChange(); });
	    };
	    AxisTimeleftMark.prototype.onTrendsChange = function () {
	        this.ee.emit('onDisplayedValueChange');
	    };
	    AxisTimeleftMark.typeName = 'timeleft';
	    return AxisTimeleftMark;
	}(AxisMark));
	exports.AxisTimeleftMark = AxisTimeleftMark;


/***/ },
/* 21 */
/***/ function(module, exports) {

	"use strict";
	(function (AXIS_RANGE_TYPE) {
	    AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["FIXED"] = 0] = "FIXED";
	    AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["RELATIVE_END"] = 1] = "RELATIVE_END";
	    AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["AUTO"] = 2] = "AUTO";
	    AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["ALL"] = 3] = "ALL"; // TODO: AXIS_RANGE_TYPE.ALL
	})(exports.AXIS_RANGE_TYPE || (exports.AXIS_RANGE_TYPE = {}));
	var AXIS_RANGE_TYPE = exports.AXIS_RANGE_TYPE;
	(function (AXIS_TYPE) {
	    AXIS_TYPE[AXIS_TYPE["X"] = 0] = "X";
	    AXIS_TYPE[AXIS_TYPE["Y"] = 1] = "Y";
	})(exports.AXIS_TYPE || (exports.AXIS_TYPE = {}));
	var AXIS_TYPE = exports.AXIS_TYPE;
	(function (AXIS_DATA_TYPE) {
	    AXIS_DATA_TYPE[AXIS_DATA_TYPE["NUMBER"] = 0] = "NUMBER";
	    AXIS_DATA_TYPE[AXIS_DATA_TYPE["DATE"] = 1] = "DATE";
	})(exports.AXIS_DATA_TYPE || (exports.AXIS_DATA_TYPE = {}));
	var AXIS_DATA_TYPE = exports.AXIS_DATA_TYPE;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Utils_1 = __webpack_require__(5);
	var Mesh = THREE.Mesh;
	var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
	var MeshBasicMaterial = THREE.MeshBasicMaterial;
	var TrendsWidget_1 = __webpack_require__(6);
	/**
	 * widget adds blinking beacon on trends end
	 * activated when trend.hasBeacon = true
	 */
	var TrendsBeaconWidget = (function (_super) {
	    __extends(TrendsBeaconWidget, _super);
	    function TrendsBeaconWidget() {
	        _super.apply(this, arguments);
	    }
	    TrendsBeaconWidget.prototype.getTrendWidgetClass = function () {
	        return TrendBeacon;
	    };
	    TrendsBeaconWidget.widgetName = 'TrendsBeacon';
	    return TrendsBeaconWidget;
	}(TrendsWidget_1.TrendsWidget));
	exports.TrendsBeaconWidget = TrendsBeaconWidget;
	var TrendBeacon = (function (_super) {
	    __extends(TrendBeacon, _super);
	    function TrendBeacon(state, trendName) {
	        _super.call(this, state, trendName);
	        this.animated = state.data.animations.enabled;
	        this.initObject();
	        if (this.animated) {
	            this.animate();
	        }
	    }
	    TrendBeacon.widgetIsEnabled = function (trendOptions) {
	        return trendOptions.enabled && trendOptions.hasBeacon;
	    };
	    TrendBeacon.prototype.getObject3D = function () {
	        return this.mesh;
	    };
	    TrendBeacon.prototype.bindEvents = function () {
	        var _this = this;
	        _super.prototype.bindEvents.call(this);
	        this.bindEvent(this.chartState.onScroll(function () { return _this.updatePosition(); }));
	    };
	    TrendBeacon.prototype.initObject = function () {
	        // add beacon
	        var light = this.mesh = new Mesh(new PlaneBufferGeometry(32, 32), new MeshBasicMaterial({ map: TrendBeacon.createTexture(), transparent: true }));
	        if (this.animated) {
	            light.scale.set(0.1, 0.1, 1);
	        }
	        else {
	            light.scale.set(0.2, 0.2, 1);
	        }
	        // add dot
	        light.add(new Mesh(new PlaneBufferGeometry(5, 5), new MeshBasicMaterial({ map: TrendBeacon.createTexture() })));
	    };
	    TrendBeacon.prototype.animate = function () {
	        var object = this.mesh;
	        var animationObject = {
	            scale: object.scale.x,
	            opacity: object.material.opacity
	        };
	        setTimeout(function () {
	            var animation = TweenLite.to(animationObject, 1, { scale: 1, opacity: 0 }).eventCallback('onUpdate', function () {
	                object.scale.set(animationObject.scale, animationObject.scale, 1);
	                object.material.opacity = animationObject.opacity;
	            }).eventCallback('onComplete', function () {
	                animation.restart();
	            });
	        }, 500);
	    };
	    TrendBeacon.createTexture = function () {
	        var h = 32, w = 32;
	        return Utils_1.Utils.createTexture(h, w, function (ctx) {
	            ctx.beginPath();
	            ctx.arc(w / 2, h / 2, w / 2, 0, 2 * Math.PI, false);
	            ctx.fillStyle = 'white';
	            ctx.fill();
	        });
	    };
	    TrendBeacon.prototype.onTransformationFrame = function () {
	        this.point = this.trend.points.getEndPoint();
	        this.updatePosition();
	    };
	    TrendBeacon.prototype.onPointsMove = function (trendPoints) {
	        this.point = trendPoints.getEndPoint();
	        this.updatePosition();
	    };
	    TrendBeacon.prototype.updatePosition = function () {
	        var state = this.chartState;
	        var endPointVector = this.point.getFramePoint();
	        var screenWidth = state.data.width;
	        var x = endPointVector.x;
	        var screenX = state.screen.getScreenXByPoint(endPointVector.x);
	        if (screenX < 0)
	            x = state.screen.getPointByScreenX(0);
	        if (screenX > screenWidth)
	            x = state.screen.getPointByScreenX(screenWidth);
	        this.mesh.position.set(x, endPointVector.y, 0.1);
	    };
	    return TrendBeacon;
	}(TrendsWidget_1.TrendWidget));
	exports.TrendBeacon = TrendBeacon;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Mesh = THREE.Mesh;
	var Object3D = THREE.Object3D;
	var Widget_1 = __webpack_require__(7);
	var GridWidget_1 = __webpack_require__(24);
	var Utils_1 = __webpack_require__(5);
	var interfaces_1 = __webpack_require__(21);
	/**
	 * widget for drawing axis
	 */
	var AxisWidget = (function (_super) {
	    __extends(AxisWidget, _super);
	    function AxisWidget(state) {
	        var _this = this;
	        _super.call(this, state);
	        this.object3D = new Object3D();
	        this.axisXObject = new Object3D();
	        this.axisYObject = new Object3D();
	        this.object3D.add(this.axisXObject);
	        this.object3D.add(this.axisYObject);
	        this.initAxis(interfaces_1.AXIS_TYPE.X);
	        this.initAxis(interfaces_1.AXIS_TYPE.Y);
	        // canvas drawing is expensive operation, so when we scroll, redraw must be called only once per second
	        this.updateAxisXRequest = Utils_1.Utils.throttle(function () { return _this.updateAxis(interfaces_1.AXIS_TYPE.X); }, 1000);
	    }
	    AxisWidget.prototype.bindEvents = function () {
	        var _this = this;
	        var state = this.chartState;
	        state.screen.onTransformationFrame(function (options) {
	            _this.onScrollChange(options.scrollX, options.scrollY);
	        });
	        state.screen.onZoomFrame(function (options) { _this.onZoomFrame(options); });
	    };
	    AxisWidget.prototype.onScrollChange = function (x, y) {
	        if (y != void 0) {
	            this.axisYObject.position.y = y;
	            this.axisXObject.position.y = y;
	        }
	        if (x != void 0) {
	            this.axisYObject.position.x = x;
	            this.updateAxisXRequest();
	        }
	    };
	    AxisWidget.prototype.initAxis = function (orientation) {
	        var isXAxis = orientation == interfaces_1.AXIS_TYPE.X;
	        var _a = this.chartState.data, visibleWidth = _a.width, visibleHeight = _a.height;
	        var canvasWidth = 0, canvasHeight = 0;
	        if (isXAxis) {
	            canvasWidth = visibleWidth * 3;
	            canvasHeight = 50;
	        }
	        else {
	            canvasWidth = 50;
	            canvasHeight = visibleHeight * 3;
	        }
	        var texture = Utils_1.Utils.createTexture(canvasWidth, canvasHeight, function (ctx) {
	            ctx.beginPath();
	            ctx.font = "10px Arial";
	            ctx.fillStyle = "rgba(255,255,255,0.3)";
	            ctx.strokeStyle = "rgba(255,255,255,0.1)";
	        });
	        texture.magFilter = THREE.NearestFilter;
	        texture.minFilter = THREE.NearestFilter;
	        var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
	        material.transparent = true;
	        var axisMesh = new Mesh(new THREE.PlaneGeometry(canvasWidth, canvasHeight), material);
	        if (isXAxis) {
	            axisMesh.position.set(canvasWidth / 2, canvasHeight / 2, 0);
	            this.axisXObject.add(axisMesh);
	        }
	        else {
	            axisMesh.position.set(visibleWidth - canvasWidth / 2, canvasHeight / 2, 0);
	            this.axisYObject.add(axisMesh);
	        }
	        this.updateAxis(orientation);
	    };
	    AxisWidget.prototype.getObject3D = function () {
	        return this.object3D;
	    };
	    AxisWidget.prototype.updateAxis = function (orientation) {
	        var isXAxis = orientation == interfaces_1.AXIS_TYPE.X;
	        var _a = this.chartState.data, visibleWidth = _a.width, visibleHeight = _a.height;
	        var _b = this.chartState.screen.options, scrollX = _b.scrollX, scrollXVal = _b.scrollXVal, scrollY = _b.scrollY, scrollYVal = _b.scrollYVal, zoomX = _b.zoomX, zoomY = _b.zoomY;
	        var axisOptions;
	        var axisMesh;
	        var axisGridParams;
	        if (isXAxis) {
	            axisMesh = this.axisXObject.children[0];
	            axisOptions = this.chartState.data.xAxis;
	            axisGridParams = GridWidget_1.GridWidget.getGridParamsForAxis(axisOptions, visibleWidth, scrollXVal, zoomX);
	        }
	        else {
	            axisMesh = this.axisYObject.children[0];
	            axisOptions = this.chartState.data.yAxis;
	            axisGridParams = GridWidget_1.GridWidget.getGridParamsForAxis(axisOptions, visibleHeight, scrollYVal, zoomY);
	        }
	        var geometry = axisMesh.geometry;
	        var canvasWidth = geometry.parameters.width;
	        var canvasHeight = geometry.parameters.height;
	        var texture = axisMesh.material.map;
	        var ctx = texture.image.getContext('2d');
	        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	        if (isXAxis) {
	            axisMesh.position.x = canvasWidth / 2 - visibleWidth + scrollX;
	        }
	        // TODO: draw text and lines in different loops
	        var edgeOffset = axisGridParams.segmentsCount * axisGridParams.step;
	        var startVal = axisGridParams.start - edgeOffset;
	        var endVal = axisGridParams.end + edgeOffset;
	        ctx.beginPath();
	        for (var val = startVal; val <= endVal; val += axisGridParams.step) {
	            var displayedValue = '';
	            if (isXAxis) {
	                var pxVal = this.chartState.screen.getPointOnXAxis(val) - scrollX + visibleWidth;
	                ctx.textAlign = "center";
	                // uncomment for dots
	                // ctx.moveTo(pxVal + 0.5, canvasHeight);
	                // ctx.lineTo(pxVal + 0.5, canvasHeight - 5);
	                if (axisOptions.dataType == interfaces_1.AXIS_DATA_TYPE.DATE) {
	                    displayedValue = AxisWidget.getDateStr(val, axisGridParams);
	                }
	                else {
	                    displayedValue = Number(val.toFixed(14)).toString();
	                }
	                ctx.fillText(displayedValue, pxVal, canvasHeight - 10);
	            }
	            else {
	                var pxVal = canvasHeight - this.chartState.screen.getPointOnYAxis(val) + scrollY;
	                ctx.textAlign = "right";
	                // uncomment for dots
	                // ctx.moveTo(canvasWidth, pxVal + 0.5);
	                // ctx.lineTo(canvasWidth - 5, pxVal + 0.5);
	                displayedValue = Number(val.toFixed(14)).toString();
	                ctx.fillText(displayedValue, canvasWidth - 15, pxVal + 3);
	            }
	            ctx.stroke();
	        }
	        // uncomment to preview canvas borders
	        // ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	        ctx.stroke();
	        ctx.closePath();
	        texture.needsUpdate = true;
	    };
	    AxisWidget.prototype.onZoomFrame = function (options) {
	        if (options.zoomX) {
	            this.updateAxis(interfaces_1.AXIS_TYPE.X);
	        }
	        if (options.zoomY) {
	            this.updateAxis(interfaces_1.AXIS_TYPE.Y);
	        }
	    };
	    // private temporaryHideAxis(orientation: AXIS_TYPE) {
	    // 	var isXAxis = orientation == AXIS_TYPE.X;
	    // 	var timeoutId = setTimeout(() => {
	    // 			this.showAxis(orientation);
	    // 	}, 200);
	    //
	    // 	if (isXAxis) {
	    // 		(this.axisXObject.children[0] as Mesh).material.opacity = 0;
	    // 		clearTimeout(this.showAxisXTimeout);
	    // 		this.showAxisXTimeout =	timeoutId;
	    // 	} else {
	    // 		clearTimeout(this.showAxisYTimeout);
	    // 		(this.axisYObject.children[0] as Mesh).material.opacity = 0;
	    // 		this.showAxisYTimeout = timeoutId;
	    // 	}
	    // }
	    // private showAxis(orientation: AXIS_TYPE) {
	    // 	var isXAxis = orientation == AXIS_TYPE.X;
	    // 	var material: MeshBasicMaterial;
	    // 	if (isXAxis) {
	    // 		material = (this.axisXObject.children[0] as Mesh).material as MeshBasicMaterial;
	    // 	} else {
	    // 		material = (this.axisYObject.children[0] as Mesh).material as MeshBasicMaterial;
	    // 	}
	    // 	this.updateAxis(orientation);
	    // 	TweenLite.to(material, 0.3, {opacity: 1});
	    // }
	    AxisWidget.getDateStr = function (timestamp, gridParams) {
	        var sec = 1000;
	        var min = sec * 60;
	        var hour = min * 60;
	        var day = hour * 60;
	        var step = gridParams.step;
	        var d = new Date(timestamp);
	        var tf = function (num) { return Utils_1.Utils.toFixed(num, 2); };
	        return tf(d.getHours()) + ':' + tf(d.getMinutes()) + ':' + tf(d.getSeconds());
	    };
	    AxisWidget.widgetName = 'Axis';
	    return AxisWidget;
	}(Widget_1.ChartWidget));
	exports.AxisWidget = AxisWidget;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Vector3 = THREE.Vector3;
	var Widget_1 = __webpack_require__(7);
	var LineSegments = THREE.LineSegments;
	var Utils_1 = __webpack_require__(5);
	/**
	 * widget for drawing chart grid
	 */
	var GridWidget = (function (_super) {
	    __extends(GridWidget, _super);
	    function GridWidget(chartState) {
	        _super.call(this, chartState);
	        var _a = chartState.data, width = _a.width, height = _a.height, xAxis = _a.xAxis, yAxis = _a.yAxis;
	        this.gridSizeH = Math.floor(width / xAxis.gridMinSize) * 3;
	        this.gridSizeV = Math.floor(height / yAxis.gridMinSize) * 3;
	        this.initGrid();
	        this.updateGrid();
	    }
	    GridWidget.prototype.bindEvents = function () {
	        var _this = this;
	        // grid is bigger then screen, so it's no need to update it on each scroll event
	        this.chartState.onScroll(Utils_1.Utils.throttle(function () { return _this.updateGrid(); }, 1000));
	        this.chartState.screen.onZoomFrame(function (options) { return _this.onZoomFrame(options); });
	    };
	    GridWidget.prototype.initGrid = function () {
	        var geometry = new THREE.Geometry();
	        var material = new THREE.LineBasicMaterial({ linewidth: 1, opacity: 0.09, transparent: true });
	        var xLinesCount = this.gridSizeH;
	        var yLinesCount = this.gridSizeV;
	        while (xLinesCount--)
	            geometry.vertices.push(new Vector3(), new Vector3());
	        while (yLinesCount--)
	            geometry.vertices.push(new Vector3(), new Vector3());
	        this.lineSegments = new LineSegments(geometry, material);
	        this.lineSegments.frustumCulled = false;
	    };
	    GridWidget.prototype.updateGrid = function () {
	        var _a = this.chartState.data, yAxis = _a.yAxis, xAxis = _a.xAxis, width = _a.width, height = _a.height;
	        var axisXGrid = GridWidget.getGridParamsForAxis(xAxis, width, xAxis.range.scroll, xAxis.range.zoom);
	        var axisYGrid = GridWidget.getGridParamsForAxis(yAxis, height, yAxis.range.scroll, yAxis.range.zoom);
	        var scrollXInSegments = Math.ceil(xAxis.range.scroll / axisXGrid.step);
	        var scrollYInSegments = Math.ceil(yAxis.range.scroll / axisYGrid.step);
	        var gridScrollXVal = scrollXInSegments * axisXGrid.step;
	        var gridScrollYVal = scrollYInSegments * axisYGrid.step;
	        var startXVal = axisXGrid.start + gridScrollXVal;
	        var startYVal = axisYGrid.start + gridScrollYVal;
	        var geometry = this.lineSegments.geometry;
	        var vertices = geometry.vertices;
	        var lineInd = 0;
	        for (var i = -this.gridSizeH / 3; i < this.gridSizeH * 2 / 3; i++) {
	            var value = startXVal + i * axisXGrid.step;
	            var lineSegment = this.getVerticalLineSegment(value, gridScrollXVal, gridScrollYVal);
	            vertices[lineInd * 2].set(lineSegment[0].x, lineSegment[0].y, 0);
	            vertices[lineInd * 2 + 1].set(lineSegment[1].x, lineSegment[1].y, 0);
	            lineInd++;
	        }
	        for (var i = -this.gridSizeV / 3; i < this.gridSizeV * 2 / 3; i++) {
	            var value = startYVal + i * axisYGrid.step;
	            var lineSegment = this.getHorizontalLineSegment(value, gridScrollXVal, gridScrollYVal);
	            vertices[lineInd * 2].set(lineSegment[0].x, lineSegment[0].y, 0);
	            vertices[lineInd * 2 + 1].set(lineSegment[1].x, lineSegment[1].y, 0);
	            lineInd++;
	        }
	        geometry.verticesNeedUpdate = true;
	        this.lineSegments.scale.set(xAxis.range.scaleFactor * xAxis.range.zoom, yAxis.range.scaleFactor * yAxis.range.zoom, 1);
	    };
	    GridWidget.prototype.getHorizontalLineSegment = function (yVal, scrollXVal, scrollYVal) {
	        var chartState = this.chartState;
	        var localYVal = yVal - chartState.data.yAxis.range.zeroVal - scrollYVal;
	        var widthVal = chartState.pxToValueByXAxis(chartState.data.width);
	        return [
	            new THREE.Vector3(widthVal * 2 + scrollXVal, localYVal, 0),
	            new THREE.Vector3(-widthVal + scrollXVal, localYVal, 0)
	        ];
	    };
	    GridWidget.prototype.getVerticalLineSegment = function (xVal, scrollXVal, scrollYVal) {
	        var chartState = this.chartState;
	        var localXVal = xVal - chartState.data.xAxis.range.zeroVal - scrollXVal;
	        var heightVal = chartState.pxToValueByYAxis(chartState.data.height);
	        return [
	            new THREE.Vector3(localXVal, heightVal * 2 + scrollYVal, 0),
	            new THREE.Vector3(localXVal, -heightVal + scrollYVal, 0)
	        ];
	    };
	    GridWidget.prototype.onZoomFrame = function (options) {
	        var _a = this.chartState.data, xAxis = _a.xAxis, yAxis = _a.yAxis;
	        if (options.zoomX)
	            this.lineSegments.scale.setX(xAxis.range.scaleFactor * options.zoomX);
	        if (options.zoomY)
	            this.lineSegments.scale.setY(yAxis.range.scaleFactor * options.zoomY);
	    };
	    GridWidget.getGridParamsForAxis = function (axisOptions, axisWidth, scroll, zoom) {
	        var axisRange = axisOptions.range;
	        var from = axisOptions.range.zeroVal + scroll;
	        var to = from + axisWidth / (axisRange.scaleFactor * zoom);
	        var axisLength = to - from;
	        var gridStep = 0;
	        var gridStepInPixels = 0;
	        var minGridStepInPixels = axisOptions.gridMinSize;
	        var axisLengthStr = String(axisLength);
	        var axisLengthPointPosition = axisLengthStr.indexOf('.');
	        var intPartLength = axisLengthPointPosition !== -1 ? axisLengthPointPosition : axisLengthStr.length;
	        var gridStepFound = false;
	        var digitPos = 0;
	        while (!gridStepFound) {
	            var power = intPartLength - digitPos - 1;
	            var multiplier = (Math.pow(10, power) || 1);
	            var dividers = [1, 2, 5];
	            for (var dividerInd = 0; dividerInd < dividers.length; dividerInd++) {
	                var nextGridStep = multiplier / dividers[dividerInd];
	                var nextGridStepInPixels = nextGridStep / axisLength * axisWidth;
	                if (nextGridStepInPixels >= minGridStepInPixels) {
	                    gridStep = nextGridStep;
	                    gridStepInPixels = nextGridStepInPixels;
	                }
	                else {
	                    gridStepFound = true;
	                    if (gridStep === 0) {
	                        gridStep = nextGridStep;
	                        gridStepInPixels = nextGridStepInPixels;
	                    }
	                    break;
	                }
	            }
	            if (!gridStepFound)
	                digitPos++;
	        }
	        var gridStart = Math.floor(from / gridStep) * gridStep;
	        var gridEnd = Math.floor(to / gridStep) * gridStep;
	        return {
	            start: gridStart,
	            end: gridEnd,
	            step: gridStep,
	            stepInPx: gridStepInPixels,
	            length: gridEnd - gridStart,
	            segmentsCount: Math.round((gridEnd - gridStart) / gridStep)
	        };
	    };
	    GridWidget.prototype.getObject3D = function () {
	        return this.lineSegments;
	    };
	    GridWidget.widgetName = 'Grid';
	    return GridWidget;
	}(Widget_1.ChartWidget));
	exports.GridWidget = GridWidget;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Utils_1 = __webpack_require__(5);
	var Mesh = THREE.Mesh;
	var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
	var MeshBasicMaterial = THREE.MeshBasicMaterial;
	var TrendsWidget_1 = __webpack_require__(6);
	/**
	 * widget adds loading indicator
	 * activated when animations enabled
	 */
	var TrendsLoadingWidget = (function (_super) {
	    __extends(TrendsLoadingWidget, _super);
	    function TrendsLoadingWidget() {
	        _super.apply(this, arguments);
	    }
	    TrendsLoadingWidget.prototype.getTrendWidgetClass = function () {
	        return TrendLoading;
	    };
	    TrendsLoadingWidget.widgetName = 'trendsLoading';
	    return TrendsLoadingWidget;
	}(TrendsWidget_1.TrendsWidget));
	exports.TrendsLoadingWidget = TrendsLoadingWidget;
	var TrendLoading = (function (_super) {
	    __extends(TrendLoading, _super);
	    function TrendLoading(state, trendName) {
	        _super.call(this, state, trendName);
	        this.isActive = false;
	        // add beacon
	        this.mesh = new Mesh(new PlaneBufferGeometry(32, 32), new MeshBasicMaterial({ map: TrendLoading.createTexture(), transparent: true }));
	        this.deactivate();
	    }
	    TrendLoading.widgetIsEnabled = function (trendOptions, chartState) {
	        return trendOptions.enabled && chartState.data.animations.enabled;
	    };
	    TrendLoading.prototype.getObject3D = function () {
	        return this.mesh;
	    };
	    TrendLoading.prototype.bindEvents = function () {
	        var _this = this;
	        _super.prototype.bindEvents.call(this);
	        this.bindEvent(this.trend.onPrependRequest(function () { return _this.activate(); }));
	    };
	    TrendLoading.prototype.prependData = function () {
	        this.deactivate();
	    };
	    TrendLoading.prototype.activate = function () {
	        var mesh = this.mesh;
	        mesh.material.opacity = 1;
	        mesh.rotation.z = 0;
	        var animation = TweenLite.to(this.mesh.rotation, 0.5, { z: Math.PI * 2 });
	        animation.eventCallback('onComplete', function () {
	            animation.restart();
	        });
	        this.animation = animation;
	        this.isActive = true;
	        this.updatePosition();
	    };
	    TrendLoading.prototype.deactivate = function () {
	        this.animation && this.animation.kill();
	        this.mesh.material.opacity = 0;
	        this.isActive = false;
	    };
	    TrendLoading.createTexture = function () {
	        var h = 64, w = 64;
	        return Utils_1.Utils.createTexture(h, w, function (ctx) {
	            ctx.strokeStyle = "rgba(255,255,255,0.95)";
	            ctx.lineWidth = 5;
	            var center = h / 2;
	            ctx.beginPath();
	            ctx.arc(center, center, 22, 0, Math.PI / 2);
	            ctx.stroke();
	            ctx.beginPath();
	            ctx.arc(center, center, 22, Math.PI, Math.PI + Math.PI / 2);
	            ctx.stroke();
	            ctx.beginPath();
	            ctx.arc(center, center, 3, 0, Math.PI * 2);
	            ctx.stroke();
	        });
	    };
	    TrendLoading.prototype.onZoomFrame = function () {
	        this.updatePosition();
	    };
	    TrendLoading.prototype.updatePosition = function () {
	        if (!this.isActive)
	            return;
	        // set new widget position
	        var pointVector = this.trend.points.getStartPoint().getFramePoint();
	        this.mesh.position.set(pointVector.x, pointVector.y, 0);
	    };
	    return TrendLoading;
	}(TrendsWidget_1.TrendWidget));
	exports.TrendLoading = TrendLoading;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Widget_1 = __webpack_require__(7);
	var Object3D = THREE.Object3D;
	var Geometry = THREE.Geometry;
	var LineBasicMaterial = THREE.LineBasicMaterial;
	var Vector3 = THREE.Vector3;
	var Utils_1 = __webpack_require__(5);
	var Line = THREE.Line;
	var Mesh = THREE.Mesh;
	var interfaces_1 = __webpack_require__(21);
	// TODO: support for yAxis
	/**
	 * widget for shows marks on axis
	 */
	var AxisMarksWidget = (function (_super) {
	    __extends(AxisMarksWidget, _super);
	    function AxisMarksWidget(chartState) {
	        _super.call(this, chartState);
	        this.axisMarksWidgets = [];
	        this.object3D = new Object3D();
	        this.xAxisMarks = chartState.xAxisMarks;
	        var items = this.xAxisMarks.getItems();
	        for (var markName in items) {
	            this.createAxisMark(items[markName]);
	        }
	    }
	    AxisMarksWidget.prototype.createAxisMark = function (axisMark) {
	        var axisMarkWidget = new AxisMarkWidget(this.chartState, axisMark);
	        this.axisMarksWidgets.push(axisMarkWidget);
	        this.object3D.add(axisMarkWidget.getObject3D());
	    };
	    AxisMarksWidget.prototype.bindEvents = function () {
	        var _this = this;
	        this.chartState.screen.onTransformationFrame(function (options) { return _this.onTransformationFrame(options); });
	    };
	    AxisMarksWidget.prototype.onTransformationFrame = function (options) {
	        if (options.scrollYVal != void 0 || options.zoomX || options.zoomY)
	            this.updateMarksPositions();
	    };
	    AxisMarksWidget.prototype.updateMarksPositions = function () {
	        for (var _i = 0, _a = this.axisMarksWidgets; _i < _a.length; _i++) {
	            var widget = _a[_i];
	            widget.updatePosition();
	        }
	    };
	    AxisMarksWidget.prototype.getObject3D = function () {
	        return this.object3D;
	    };
	    AxisMarksWidget.widgetName = 'axisMarks';
	    return AxisMarksWidget;
	}(Widget_1.ChartWidget));
	exports.AxisMarksWidget = AxisMarksWidget;
	var DEFAULT_INDICATOR_RENDER_FUNCTION = function (axisMarkWidget, ctx) {
	    var axisMark = axisMarkWidget.axisMark;
	    ctx.clearRect(0, 0, axisMarkWidget.indicatorWidth, axisMarkWidget.indicatorHeight);
	    ctx.fillStyle = axisMark.options.lineColor;
	    ctx.fillText(axisMark.options.title, 15, 20);
	    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
	    ctx.fillText(axisMark.getDisplayedVal(), 16, 34);
	};
	var AxisMarkWidget = (function () {
	    function AxisMarkWidget(chartState, axisMark) {
	        this.indicatorWidth = 64;
	        this.indicatorHeight = 64;
	        this.indicatorRenderFunction = DEFAULT_INDICATOR_RENDER_FUNCTION;
	        if (axisMark.axisType == interfaces_1.AXIS_TYPE.Y) {
	            Utils_1.Utils.error('axis mark on Y axis not supported yet');
	            return;
	        }
	        this.chartState = chartState;
	        this.axisMark = axisMark;
	        this.axisType = axisMark.axisType;
	        this.frameValue = axisMark.options.value;
	        this.object3D = new Object3D();
	        this.object3D.position.setZ(-0.1);
	        this.line = this.createLine();
	        this.object3D.add(this.line);
	        this.indicator = this.createIndicator();
	        this.object3D.add(this.indicator);
	        this.renderIndicator();
	        this.updatePosition();
	        this.bindEvents();
	    }
	    AxisMarkWidget.prototype.getObject3D = function () {
	        return this.object3D;
	    };
	    AxisMarkWidget.prototype.createLine = function () {
	        var _a = this.axisMark.options, lineWidth = _a.lineWidth, lineColor = _a.lineColor;
	        var lineGeometry = new Geometry();
	        lineGeometry.vertices.push(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
	        return new Line(lineGeometry, new LineBasicMaterial({ color: Utils_1.Utils.getHexColor(lineColor), linewidth: lineWidth }));
	    };
	    AxisMarkWidget.prototype.createIndicator = function () {
	        var _a = this, width = _a.indicatorWidth, height = _a.indicatorHeight;
	        var texture = Utils_1.Utils.createPixelPerfectTexture(width, height, function (ctx) {
	            ctx.beginPath();
	            ctx.font = "10px Arial";
	        });
	        var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
	        material.transparent = true;
	        return new Mesh(new THREE.PlaneGeometry(width, height), material);
	    };
	    AxisMarkWidget.prototype.renderIndicator = function () {
	        var texture = this.indicator.material.map;
	        var ctx = texture.image.getContext('2d');
	        DEFAULT_INDICATOR_RENDER_FUNCTION(this, ctx);
	        texture.needsUpdate = true;
	    };
	    AxisMarkWidget.prototype.bindEvents = function () {
	        var _this = this;
	        this.axisMark.onDisplayedValueChange(function () { return _this.renderIndicator(); });
	        this.axisMark.onValueChange(function () { return _this.onValueChangeHandler(); });
	    };
	    AxisMarkWidget.prototype.onValueChangeHandler = function () {
	        var _this = this;
	        // move mark to new position with animation
	        if (this.moveAnimation)
	            this.moveAnimation.kill();
	        var animations = this.chartState.data.animations;
	        var targetValue = this.axisMark.options.value;
	        var cb = function () {
	            _this.updatePosition();
	        };
	        if (animations.enabled) {
	            this.moveAnimation = TweenLite.to(this, animations.trendChangeSpeed, { frameValue: targetValue, ease: animations.trendChangeEase });
	            this.moveAnimation.eventCallback('onUpdate', cb);
	        }
	        else {
	            this.frameValue = targetValue;
	            cb();
	        }
	    };
	    AxisMarkWidget.prototype.updatePosition = function () {
	        var chartState = this.chartState;
	        var isXAxis = this.axisType == interfaces_1.AXIS_TYPE.X;
	        if (!isXAxis)
	            return; // TODO: support for yAxis
	        this.object3D.position.x = chartState.screen.getPointOnXAxis(this.frameValue);
	        this.object3D.position.y = chartState.screen.getBottom();
	        var lineGeometry = this.line.geometry;
	        lineGeometry.vertices[1].setY(chartState.data.height);
	        lineGeometry.verticesNeedUpdate = true;
	        this.indicator.position.set(this.indicatorWidth / 2, chartState.data.height - this.indicatorHeight / 2, 0);
	    };
	    AxisMarkWidget.typeName = 'simple';
	    return AxisMarkWidget;
	}());


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Mesh = THREE.Mesh;
	var Object3D = THREE.Object3D;
	var TrendsWidget_1 = __webpack_require__(6);
	var Utils_1 = __webpack_require__(5);
	/**
	 * widget for drawing trends marks for all trends
	 */
	var TrendsMarksWidget = (function (_super) {
	    __extends(TrendsMarksWidget, _super);
	    function TrendsMarksWidget() {
	        _super.apply(this, arguments);
	    }
	    TrendsMarksWidget.prototype.getTrendWidgetClass = function () {
	        return TrendMarksWidget;
	    };
	    TrendsMarksWidget.widgetName = "TrendsMarks";
	    return TrendsMarksWidget;
	}(TrendsWidget_1.TrendsWidget));
	exports.TrendsMarksWidget = TrendsMarksWidget;
	/**
	 * widget for drawing trend marks for one trend
	 */
	var TrendMarksWidget = (function (_super) {
	    __extends(TrendMarksWidget, _super);
	    function TrendMarksWidget(chartState, trendName) {
	        _super.call(this, chartState, trendName);
	        this.marksWidgets = {};
	        this.object3D = new Object3D();
	        this.onMarksChange();
	    }
	    TrendMarksWidget.prototype.getObject3D = function () {
	        return this.object3D;
	    };
	    TrendMarksWidget.prototype.bindEvents = function () {
	        var _this = this;
	        _super.prototype.bindEvents.call(this);
	        this.trend.marks.onChange(function () { return _this.onMarksChange(); });
	    };
	    TrendMarksWidget.prototype.onMarksChange = function () {
	        var marksItems = this.trend.marks.getItems();
	        var widgets = this.marksWidgets;
	        for (var markName in marksItems) {
	            if (!widgets[markName])
	                this.createMarkWidget(marksItems[markName]);
	        }
	    };
	    TrendMarksWidget.prototype.createMarkWidget = function (mark) {
	        var markWidget = new TrendMarkWidget(this.chartState, mark);
	        this.marksWidgets[mark.options.name] = markWidget;
	        this.object3D.add(markWidget.getObject3D());
	    };
	    // protected onTransformationFrame() {
	    // 	var widgets = this.marksWidgets;
	    // 	for (let markName in widgets) {
	    // 		widgets[markName].onTrendAnimate();
	    // 	}
	    // }
	    TrendMarksWidget.prototype.onZoomFrame = function () {
	        var widgets = this.marksWidgets;
	        for (var markName in widgets) {
	            widgets[markName].onZoomFrameHandler();
	        }
	    };
	    TrendMarksWidget.prototype.onPointsMove = function () {
	        var widgets = this.marksWidgets;
	        for (var markName in widgets) {
	            widgets[markName].onPointsMove();
	        }
	    };
	    return TrendMarksWidget;
	}(TrendsWidget_1.TrendWidget));
	exports.TrendMarksWidget = TrendMarksWidget;
	/**
	 * widget for drawing one trend mark
	 */
	var TrendMarkWidget = (function () {
	    function TrendMarkWidget(chartState, trendMark) {
	        this.markHeight = 74;
	        this.markWidth = 150;
	        this.position = { lineHeight: 30, x: 0, y: 0 };
	        this.chartState = chartState;
	        this.mark = trendMark;
	        this.initObject();
	        this.show();
	    }
	    TrendMarkWidget.prototype.initObject = function () {
	        this.object3D = new Object3D();
	        this.markMesh = this.createMarkMesh();
	        this.object3D.add(this.markMesh);
	    };
	    TrendMarkWidget.prototype.createMarkMesh = function () {
	        var _a = this, markHeight = _a.markHeight, markWidth = _a.markWidth;
	        var lineHeight = this.position.lineHeight;
	        var meshHeight = markHeight + lineHeight;
	        var meshWidth = markWidth;
	        var mark = this.mark.options;
	        var texture = Utils_1.Utils.createPixelPerfectTexture(meshWidth, meshHeight, function (ctx) {
	            var circleOffset = 30;
	            var circleR = 22;
	            var circleX = markWidth / 2;
	            var circleY = circleOffset + circleR;
	            // title and description
	            ctx.beginPath();
	            ctx.textAlign = 'center';
	            ctx.font = "11px Arial";
	            ctx.fillStyle = 'rgb(129,129,129)';
	            ctx.fillText(mark.title, circleX, 10);
	            ctx.fillStyle = 'rgb(40,136,75)';
	            ctx.fillText(mark.description, circleX, 22);
	            // icon circle
	            ctx.beginPath();
	            ctx.fillStyle = mark.iconColor;
	            ctx.arc(circleX, circleY, circleR, 0, 2 * Math.PI);
	            ctx.fill();
	            // icon text
	            ctx.font = "19px Arial";
	            ctx.fillStyle = 'rgb(255, 255, 255)';
	            ctx.fillText(mark.icon, circleX, circleY + 7);
	            // line
	            ctx.beginPath();
	            ctx.strokeStyle = 'rgb(255, 255, 255)';
	            ctx.lineWidth = 1;
	            ctx.setLineDash([1, 4]);
	            ctx.moveTo(markWidth / 2 + 0.5, circleY + circleR);
	            ctx.lineTo(markWidth / 2 + 0.5, meshHeight);
	            ctx.stroke();
	        });
	        var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
	        material.transparent = true;
	        var mesh = new Mesh(new THREE.PlaneGeometry(meshWidth, meshHeight), material);
	        mesh.position.setY(meshHeight / 2);
	        return mesh;
	    };
	    TrendMarkWidget.prototype.getObject3D = function () {
	        return this.object3D;
	    };
	    TrendMarkWidget.prototype.onPointsMove = function () {
	        this.updatePosition();
	    };
	    TrendMarkWidget.prototype.onZoomFrameHandler = function () {
	        this.updatePosition();
	    };
	    TrendMarkWidget.prototype.updatePosition = function () {
	        if (!this.mark.point)
	            return;
	        var pos = this.mark.point.getFramePoint();
	        this.object3D.position.set(pos.x, pos.y, 0);
	    };
	    TrendMarkWidget.prototype.show = function () {
	        if (!this.mark.point)
	            return;
	        this.updatePosition();
	        var animations = this.chartState.data.animations;
	        var time = animations.enabled ? 1 : 0;
	        this.object3D.scale.set(0.01, 0.01, 1);
	        TweenLite.to(this.object3D.scale, time, { x: 1, y: 1, ease: Elastic.easeOut });
	    };
	    return TrendMarkWidget;
	}());


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Widget_1 = __webpack_require__(7);
	var LineSegments = THREE.LineSegments;
	var Vector3 = THREE.Vector3;
	/**
	 * widget for drawing chart grid
	 */
	var BorderWidget = (function (_super) {
	    __extends(BorderWidget, _super);
	    function BorderWidget(chartState) {
	        _super.call(this, chartState);
	        var _a = chartState.data, width = _a.width, height = _a.height;
	        var geometry = new THREE.Geometry();
	        var material = new THREE.LineBasicMaterial({ linewidth: 1, opacity: 0.0, transparent: true });
	        geometry.vertices.push(new Vector3(0, 0, 0), new Vector3(0, height, 0), new Vector3(0, height, 0), new Vector3(width, height, 0), new Vector3(width, height, 0), new Vector3(width, 0, 0), new Vector3(width, 0, 0), new Vector3(0, 0, 0));
	        this.lineSegments = new LineSegments(geometry, material);
	    }
	    BorderWidget.prototype.getObject3D = function () {
	        return this.lineSegments;
	    };
	    BorderWidget.widgetName = 'Border';
	    return BorderWidget;
	}(Widget_1.ChartWidget));
	exports.BorderWidget = BorderWidget;


/***/ }
/******/ ]);
//# sourceMappingURL=ThreeChart.js.map
 if (typeof module !== "undefined" && module.exports) module.exports = ThreeChart;