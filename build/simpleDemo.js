var simpleDemo =
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
	var src_1 = __webpack_require__(1);
	var Trend_1 = __webpack_require__(17);
	var chart;
	var DataSourse = (function () {
	    function DataSourse() {
	        this.data = [];
	        var sec = 0;
	        var val = 70;
	        this.startTime = Date.now();
	        while (sec < 15) {
	            this.data.push({
	                xVal: this.startTime + sec * 1000,
	                yVal: val
	            });
	            val += Math.random() * 14 - 7;
	            sec++;
	        }
	        this.endTime = this.data[this.data.length - 1].xVal;
	    }
	    DataSourse.prototype.getData = function () {
	        return src_1.Utils.deepCopy(this.data);
	    };
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
	window.onload = function () {
	    var dsMain = new DataSourse();
	    chart = new src_1.Chart({
	        $el: document.querySelector('.chart'),
	        xAxis: {
	            dataType: src_1.AXIS_DATA_TYPE.DATE,
	            range: {
	                type: src_1.AXIS_RANGE_TYPE.FIXED,
	                from: Date.now(),
	                to: Date.now() + 20000,
	                maxLength: 5000000,
	                minLength: 5000
	            },
	            marks: [
	                { value: dsMain.endTime + 30000, name: 'brake', title: 'BRAKE', lineColor: '#ff6600' },
	                { value: dsMain.endTime + 40000, name: 'close', title: 'CLOSE', lineColor: '#005187' }
	            ]
	        },
	        trends: {
	            'main': {
	                type: Trend_1.TREND_TYPE.LINE,
	                dataset: dsMain.getData(),
	                hasBeacon: true,
	                hasIndicator: true
	            }
	        },
	        showStats: true
	    });
	    window['chart'] = chart;
	    setInterval(function () {
	        var val = dsMain.getNext();
	        chart.getTrend('main').appendData([val]);
	    }, 1000);
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(2));
	__export(__webpack_require__(22));
	__export(__webpack_require__(21));
	__export(__webpack_require__(20));
	__export(__webpack_require__(13));
	__export(__webpack_require__(17));
	__export(__webpack_require__(18));
	__export(__webpack_require__(19));
	__export(__webpack_require__(16));
	__export(__webpack_require__(14));
	__export(__webpack_require__(15));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	// deps must be always on top
	__webpack_require__(3);
	var PerspectiveCamera = THREE.PerspectiveCamera;
	var State_1 = __webpack_require__(13);
	var Utils_1 = __webpack_require__(14);
	var AxisWidget_1 = __webpack_require__(23);
	var GridWidget_1 = __webpack_require__(24);
	var TrendsLoadingWidget_1 = __webpack_require__(25);
	var AxisMarksWidget_1 = __webpack_require__(27);
	var TrendsMarksWidget_1 = __webpack_require__(28);
	var BorderWidget_1 = __webpack_require__(29);
	var TrendsIndicatorWidget_1 = __webpack_require__(30);
	var TrendsLineWidget_1 = __webpack_require__(31);
	var TrendsCandleWidget_1 = __webpack_require__(32);
	var TrendsBeaconWidget_1 = __webpack_require__(33);
	exports.MAX_DATA_LENGTH = 2692000; //1000;
	var Chart = (function () {
	    function Chart(state) {
	        var _this = this;
	        this.widgets = [];
	        this.state = new State_1.ChartState(state);
	        this.zoomThrottled = Utils_1.Utils.throttle(function (zoomValue, origin) { return _this.zoom(zoomValue, origin); }, 200);
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
	        var _a = state.data, w = _a.width, h = _a.height, $el = _a.$el, showStats = _a.showStats, autoRender = _a.autoRender;
	        this.scene = new THREE.Scene();
	        this.isStopped = !autoRender.enabled;
	        var renderer = this.renderer = new Chart.renderers[this.state.data.renderer]({ antialias: true, alpha: true });
	        renderer.setPixelRatio(Chart.devicePixelRatio);
	        renderer.setClearColor(state.data.backgroundColor, state.data.backgroundOpacity);
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
	        this.onScreenTransform(this.state.screen.options);
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
	        this.renderLoop();
	    };
	    Chart.prototype.renderLoop = function () {
	        var _this = this;
	        if (this.isDestroyed)
	            return;
	        this.stats && this.stats.begin();
	        this.render();
	        if (this.isStopped)
	            return;
	        var fpsLimit = this.state.data.autoRender.fps;
	        if (fpsLimit) {
	            var delay = 1000 / fpsLimit;
	            setTimeout(function () { return requestAnimationFrame(function () { return _this.renderLoop(); }); }, delay);
	        }
	        else {
	            requestAnimationFrame(function () { return _this.renderLoop(); });
	        }
	        this.stats && this.stats.end();
	    };
	    Chart.prototype.render = function () {
	        this.renderer.render(this.scene, this.camera);
	    };
	    Chart.prototype.stop = function () {
	        this.isStopped = true;
	    };
	    Chart.prototype.run = function () {
	        this.isStopped = false;
	        this.renderLoop();
	    };
	    /**
	     * call to destroy chart an init garbage collection
	     */
	    Chart.prototype.destroy = function () {
	        this.isDestroyed = true;
	        this.stop();
	        this.state.destroy();
	        this.unbindEvents();
	        // WARNING! undocumented method for free webgl context
	        this.renderer.forceContextLoss();
	        this.renderer.context = null;
	        this.renderer.domElement = null;
	        this.renderer = null;
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
	        if (this.state.data.controls.enabled) {
	            $el.addEventListener('mousewheel', function (ev) { _this.onMouseWheel(ev); });
	            $el.addEventListener('mousemove', function (ev) { _this.onMouseMove(ev); });
	            $el.addEventListener('mousedown', function (ev) { return _this.onMouseDown(ev); });
	            $el.addEventListener('mouseup', function (ev) { return _this.onMouseUp(ev); });
	            $el.addEventListener('touchmove', function (ev) { _this.onTouchMove(ev); });
	            $el.addEventListener('touchend', function (ev) { _this.onTouchEnd(ev); });
	        }
	        this.state.onTrendsChange(function () { return _this.autoscroll(); });
	        this.state.screen.onTransformationFrame(function (options) { return _this.onScreenTransform(options); });
	    };
	    Chart.prototype.unbindEvents = function () {
	        // TODO: unbind events correctly
	        this.$el.remove();
	    };
	    Chart.prototype.onScreenTransform = function (options) {
	        if (options.scrollX != void 0) {
	            var scrollX_1 = this.cameraInitialPosition.x + options.scrollX;
	            // scrollX =  Math.round(scrollX); // prevent to set camera beetween pixels
	            this.camera.position.setX(scrollX_1);
	        }
	        if (options.scrollY != void 0) {
	            var scrollY_1 = this.cameraInitialPosition.y + options.scrollY;
	            // scrollY = Math.round(scrollY); // prevent to set camera beetween pixels
	            this.camera.position.setY(scrollY_1);
	        }
	    };
	    Chart.prototype.autoscroll = function () {
	        var state = this.state;
	        if (!state.data.autoScroll)
	            return;
	        var oldTrendsMaxX = state.data.prevState.computedData.trends.maxXVal;
	        var trendsMaxXDelta = state.data.computedData.trends.maxXVal - oldTrendsMaxX;
	        if (trendsMaxXDelta > 0) {
	            var maxVisibleX = this.state.screen.getScreenRightVal();
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
	        var zoomOrigin = ev.layerX / this.state.data.width;
	        var zoomValue = 1 + ev.wheelDeltaY * 0.001;
	        this.zoom(zoomValue, zoomOrigin);
	    };
	    Chart.prototype.onTouchMove = function (ev) {
	        this.setState({ cursor: { dragMode: true, x: ev.touches[0].clientX, y: ev.touches[0].clientY } });
	    };
	    Chart.prototype.onTouchEnd = function (ev) {
	        this.setState({ cursor: { dragMode: false } });
	    };
	    Chart.prototype.zoom = function (zoomValue, zoomOrigin) {
	        var _this = this;
	        var MAX_ZOOM_VALUE = 1.5;
	        var MIN_ZOOM_VALUE = 0.7;
	        zoomValue = Math.min(zoomValue, MAX_ZOOM_VALUE);
	        zoomValue = Math.max(zoomValue, MIN_ZOOM_VALUE);
	        var autoScrollIsEnabled = this.state.data.autoScroll;
	        if (autoScrollIsEnabled)
	            this.state.setState({ autoScroll: false });
	        this.state.zoom(zoomValue, zoomOrigin).then(function () {
	            if (autoScrollIsEnabled)
	                _this.setState({ autoScroll: true });
	        });
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
	    Chart.renderers = {
	        CanvasRenderer: THREE.CanvasRenderer,
	        WebGLRenderer: THREE.WebGLRenderer
	    };
	    return Chart;
	}());
	exports.Chart = Chart;
	// install built-in widgets
	Chart.installWidget(TrendsLineWidget_1.TrendsLineWidget);
	Chart.installWidget(TrendsCandleWidget_1.TrendsCandlesWidget);
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
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	// TODO: think about different bundles
	// (<any>window).THREE = require('three/three');
	window.Stats = __webpack_require__(4);
	window.TweenLite = __webpack_require__(5);
	//require('gsap/src/uncompressed/easing/EasePack.js');
	__webpack_require__(7);
	__webpack_require__(8);
	exports.isPlainObject = __webpack_require__(9);
	exports.EventEmitter = __webpack_require__(11);
	var es6_promise_1 = __webpack_require__(12);
	exports.Promise = es6_promise_1.Promise;


/***/ },
/* 4 */
/***/ function(module, exports) {

	// stats.js - http://github.com/mrdoob/stats.js
	var Stats=function(){function h(a){c.appendChild(a.dom);return a}function k(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";c.addEventListener("click",function(a){a.preventDefault();k(++l%c.children.length)},!1);var g=(performance||Date).now(),e=g,a=0,r=h(new Stats.Panel("FPS","#0ff","#002")),f=h(new Stats.Panel("MS","#0f0","#020"));
	if(self.performance&&self.performance.memory)var t=h(new Stats.Panel("MB","#f08","#201"));k(0);return{REVISION:16,dom:c,addPanel:h,showPanel:k,begin:function(){g=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();f.update(c-g,200);if(c>e+1E3&&(r.update(1E3*a/(c-e),100),e=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){g=this.end()},domElement:c,setMode:k}};
	Stats.Panel=function(h,k,l){var c=Infinity,g=0,e=Math.round,a=e(window.devicePixelRatio||1),r=80*a,f=48*a,t=3*a,u=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=f;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,f);b.fillStyle=k;b.fillText(h,t,u);b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(f,
	v){c=Math.min(c,f);g=Math.max(g,f);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=k;b.fillText(e(f)+" "+h+" ("+e(c)+"-"+e(g)+")",t,u);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,e((1-f/v)*p))}}};"object"===typeof module&&(module.exports=Stats);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * VERSION: 1.18.5
	 * DATE: 2016-05-24
	 * UPDATES AND DOCS AT: http://greensock.com
	 * 
	 * Includes all of the following: TweenLite, TweenMax, TimelineLite, TimelineMax, EasePack, CSSPlugin, RoundPropsPlugin, BezierPlugin, AttrPlugin, DirectionalRotationPlugin
	 *
	 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
	 * This work is subject to the terms at http://greensock.com/standard-license or for
	 * Club GreenSock members, the software agreement that was issued with your membership.
	 * 
	 * @author: Jack Doyle, jack@greensock.com
	 **/
	var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window; //helps ensure compatibility with AMD/RequireJS and CommonJS/Node
	(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push( function() {
	
		"use strict";
	
		_gsScope._gsDefine("TweenMax", ["core.Animation","core.SimpleTimeline","TweenLite"], function(Animation, SimpleTimeline, TweenLite) {
	
			var _slice = function(a) { //don't use [].slice because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
					var b = [],
						l = a.length,
						i;
					for (i = 0; i !== l; b.push(a[i++]));
					return b;
				},
				_applyCycle = function(vars, targets, i) {
					var alt = vars.cycle,
						p, val;
					for (p in alt) {
						val = alt[p];
						vars[p] = (typeof(val) === "function") ? val.call(targets[i], i) : val[i % val.length];
					}
					delete vars.cycle;
				},
				TweenMax = function(target, duration, vars) {
					TweenLite.call(this, target, duration, vars);
					this._cycle = 0;
					this._yoyo = (this.vars.yoyo === true);
					this._repeat = this.vars.repeat || 0;
					this._repeatDelay = this.vars.repeatDelay || 0;
					this._dirty = true; //ensures that if there is any repeat, the totalDuration will get recalculated to accurately report it.
					this.render = TweenMax.prototype.render; //speed optimization (avoid prototype lookup on this "hot" method)
				},
				_tinyNum = 0.0000000001,
				TweenLiteInternals = TweenLite._internals,
				_isSelector = TweenLiteInternals.isSelector,
				_isArray = TweenLiteInternals.isArray,
				p = TweenMax.prototype = TweenLite.to({}, 0.1, {}),
				_blankArray = [];
	
			TweenMax.version = "1.18.5";
			p.constructor = TweenMax;
			p.kill()._gc = false;
			TweenMax.killTweensOf = TweenMax.killDelayedCallsTo = TweenLite.killTweensOf;
			TweenMax.getTweensOf = TweenLite.getTweensOf;
			TweenMax.lagSmoothing = TweenLite.lagSmoothing;
			TweenMax.ticker = TweenLite.ticker;
			TweenMax.render = TweenLite.render;
	
			p.invalidate = function() {
				this._yoyo = (this.vars.yoyo === true);
				this._repeat = this.vars.repeat || 0;
				this._repeatDelay = this.vars.repeatDelay || 0;
				this._uncache(true);
				return TweenLite.prototype.invalidate.call(this);
			};
			
			p.updateTo = function(vars, resetDuration) {
				var curRatio = this.ratio,
					immediate = this.vars.immediateRender || vars.immediateRender,
					p;
				if (resetDuration && this._startTime < this._timeline._time) {
					this._startTime = this._timeline._time;
					this._uncache(false);
					if (this._gc) {
						this._enabled(true, false);
					} else {
						this._timeline.insert(this, this._startTime - this._delay); //ensures that any necessary re-sequencing of Animations in the timeline occurs to make sure the rendering order is correct.
					}
				}
				for (p in vars) {
					this.vars[p] = vars[p];
				}
				if (this._initted || immediate) {
					if (resetDuration) {
						this._initted = false;
						if (immediate) {
							this.render(0, true, true);
						}
					} else {
						if (this._gc) {
							this._enabled(true, false);
						}
						if (this._notifyPluginsOfEnabled && this._firstPT) {
							TweenLite._onPluginEvent("_onDisable", this); //in case a plugin like MotionBlur must perform some cleanup tasks
						}
						if (this._time / this._duration > 0.998) { //if the tween has finished (or come extremely close to finishing), we just need to rewind it to 0 and then render it again at the end which forces it to re-initialize (parsing the new vars). We allow tweens that are close to finishing (but haven't quite finished) to work this way too because otherwise, the values are so small when determining where to project the starting values that binary math issues creep in and can make the tween appear to render incorrectly when run backwards. 
							var prevTime = this._totalTime;
							this.render(0, true, false);
							this._initted = false;
							this.render(prevTime, true, false);
						} else {
							this._initted = false;
							this._init();
							if (this._time > 0 || immediate) {
								var inv = 1 / (1 - curRatio),
									pt = this._firstPT, endValue;
								while (pt) {
									endValue = pt.s + pt.c;
									pt.c *= inv;
									pt.s = endValue - pt.c;
									pt = pt._next;
								}
							}
						}
					}
				}
				return this;
			};
					
			p.render = function(time, suppressEvents, force) {
				if (!this._initted) if (this._duration === 0 && this.vars.repeat) { //zero duration tweens that render immediately have render() called from TweenLite's constructor, before TweenMax's constructor has finished setting _repeat, _repeatDelay, and _yoyo which are critical in determining totalDuration() so we need to call invalidate() which is a low-kb way to get those set properly.
					this.invalidate();
				}
				var totalDur = (!this._dirty) ? this._totalDuration : this.totalDuration(),
					prevTime = this._time,
					prevTotalTime = this._totalTime, 
					prevCycle = this._cycle,
					duration = this._duration,
					prevRawPrevTime = this._rawPrevTime,
					isComplete, callback, pt, cycleDuration, r, type, pow, rawPrevTime;
				if (time >= totalDur - 0.0000001) { //to work around occasional floating point math artifacts.
					this._totalTime = totalDur;
					this._cycle = this._repeat;
					if (this._yoyo && (this._cycle & 1) !== 0) {
						this._time = 0;
						this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
					} else {
						this._time = duration;
						this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
					}
					if (!this._reversed) {
						isComplete = true;
						callback = "onComplete";
						force = (force || this._timeline.autoRemoveChildren); //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
					}
					if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
						if (this._startTime === this._timeline._duration) { //if a zero-duration tween is at the VERY end of a timeline and that timeline renders at its end, it will typically add a tiny bit of cushion to the render time to prevent rounding errors from getting in the way of tweens rendering their VERY end. If we then reverse() that timeline, the zero-duration tween will trigger its onReverseComplete even though technically the playhead didn't pass over it again. It's a very specific edge case we must accommodate.
							time = 0;
						}
						if (prevRawPrevTime < 0 || (time <= 0 && time >= -0.0000001) || (prevRawPrevTime === _tinyNum && this.data !== "isPause")) if (prevRawPrevTime !== time) { //note: when this.data is "isPause", it's a callback added by addPause() on a timeline that we should not be triggered when LEAVING its exact start time. In other words, tl.addPause(1).play(1) shouldn't pause.
							force = true;
							if (prevRawPrevTime > _tinyNum) {
								callback = "onReverseComplete";
							}
						}
						this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
					}
					
				} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
					this._totalTime = this._time = this._cycle = 0;
					this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
					if (prevTotalTime !== 0 || (duration === 0 && prevRawPrevTime > 0)) {
						callback = "onReverseComplete";
						isComplete = this._reversed;
					}
					if (time < 0) {
						this._active = false;
						if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
							if (prevRawPrevTime >= 0) {
								force = true;
							}
							this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
						}
					}
					if (!this._initted) { //if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
						force = true;
					}
				} else {
					this._totalTime = this._time = time;
					if (this._repeat !== 0) {
						cycleDuration = duration + this._repeatDelay;
						this._cycle = (this._totalTime / cycleDuration) >> 0; //originally _totalTime % cycleDuration but floating point errors caused problems, so I normalized it. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)
						if (this._cycle !== 0) if (this._cycle === this._totalTime / cycleDuration && prevTotalTime <= time) {
							this._cycle--; //otherwise when rendered exactly at the end time, it will act as though it is repeating (at the beginning)
						}
						this._time = this._totalTime - (this._cycle * cycleDuration);
						if (this._yoyo) if ((this._cycle & 1) !== 0) {
							this._time = duration - this._time;
						}
						if (this._time > duration) {
							this._time = duration;
						} else if (this._time < 0) {
							this._time = 0;
						}
					}
	
					if (this._easeType) {
						r = this._time / duration;
						type = this._easeType;
						pow = this._easePower;
						if (type === 1 || (type === 3 && r >= 0.5)) {
							r = 1 - r;
						}
						if (type === 3) {
							r *= 2;
						}
						if (pow === 1) {
							r *= r;
						} else if (pow === 2) {
							r *= r * r;
						} else if (pow === 3) {
							r *= r * r * r;
						} else if (pow === 4) {
							r *= r * r * r * r;
						}
	
						if (type === 1) {
							this.ratio = 1 - r;
						} else if (type === 2) {
							this.ratio = r;
						} else if (this._time / duration < 0.5) {
							this.ratio = r / 2;
						} else {
							this.ratio = 1 - (r / 2);
						}
	
					} else {
						this.ratio = this._ease.getRatio(this._time / duration);
					}
					
				}
					
				if (prevTime === this._time && !force && prevCycle === this._cycle) {
					if (prevTotalTime !== this._totalTime) if (this._onUpdate) if (!suppressEvents) { //so that onUpdate fires even during the repeatDelay - as long as the totalTime changed, we should trigger onUpdate.
						this._callback("onUpdate");
					}
					return;
				} else if (!this._initted) {
					this._init();
					if (!this._initted || this._gc) { //immediateRender tweens typically won't initialize until the playhead advances (_time is greater than 0) in order to ensure that overwriting occurs properly. Also, if all of the tweening properties have been overwritten (which would cause _gc to be true, as set in _init()), we shouldn't continue otherwise an onStart callback could be called for example.
						return;
					} else if (!force && this._firstPT && ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration))) { //we stick it in the queue for rendering at the very end of the tick - this is a performance optimization because browsers invalidate styles and force a recalculation if you read, write, and then read style data (so it's better to read/read/read/write/write/write than read/write/read/write/read/write). The down side, of course, is that usually you WANT things to render immediately because you may have code running right after that which depends on the change. Like imagine running TweenLite.set(...) and then immediately after that, creating a nother tween that animates the same property to another value; the starting values of that 2nd tween wouldn't be accurate if lazy is true.
						this._time = prevTime;
						this._totalTime = prevTotalTime;
						this._rawPrevTime = prevRawPrevTime;
						this._cycle = prevCycle;
						TweenLiteInternals.lazyTweens.push(this);
						this._lazy = [time, suppressEvents];
						return;
					}
					//_ease is initially set to defaultEase, so now that init() has run, _ease is set properly and we need to recalculate the ratio. Overall this is faster than using conditional logic earlier in the method to avoid having to set ratio twice because we only init() once but renderTime() gets called VERY frequently.
					if (this._time && !isComplete) {
						this.ratio = this._ease.getRatio(this._time / duration);
					} else if (isComplete && this._ease._calcEnd) {
						this.ratio = this._ease.getRatio((this._time === 0) ? 0 : 1);
					}
				}
				if (this._lazy !== false) {
					this._lazy = false;
				}
	
				if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
					this._active = true; //so that if the user renders a tween (as opposed to the timeline rendering it), the timeline is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the tween already finished but the user manually re-renders it as halfway done.
				}
				if (prevTotalTime === 0) {
					if (this._initted === 2 && time > 0) {
						//this.invalidate();
						this._init(); //will just apply overwriting since _initted of (2) means it was a from() tween that had immediateRender:true
					}
					if (this._startAt) {
						if (time >= 0) {
							this._startAt.render(time, suppressEvents, force);
						} else if (!callback) {
							callback = "_dummyGS"; //if no callback is defined, use a dummy value just so that the condition at the end evaluates as true because _startAt should render AFTER the normal render loop when the time is negative. We could handle this in a more intuitive way, of course, but the render loop is the MOST important thing to optimize, so this technique allows us to avoid adding extra conditional logic in a high-frequency area.
						}
					}
					if (this.vars.onStart) if (this._totalTime !== 0 || duration === 0) if (!suppressEvents) {
						this._callback("onStart");
					}
				}
				
				pt = this._firstPT;
				while (pt) {
					if (pt.f) {
						pt.t[pt.p](pt.c * this.ratio + pt.s);
					} else {
						pt.t[pt.p] = pt.c * this.ratio + pt.s;
					}
					pt = pt._next;
				}
				
				if (this._onUpdate) {
					if (time < 0) if (this._startAt && this._startTime) { //if the tween is positioned at the VERY beginning (_startTime 0) of its parent timeline, it's illegal for the playhead to go back further, so we should not render the recorded startAt values.
						this._startAt.render(time, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.
					}
					if (!suppressEvents) if (this._totalTime !== prevTotalTime || callback) {
						this._callback("onUpdate");
					}
				}
				if (this._cycle !== prevCycle) if (!suppressEvents) if (!this._gc) if (this.vars.onRepeat) {
					this._callback("onRepeat");
				}
				if (callback) if (!this._gc || force) { //check gc because there's a chance that kill() could be called in an onUpdate
					if (time < 0 && this._startAt && !this._onUpdate && this._startTime) { //if the tween is positioned at the VERY beginning (_startTime 0) of its parent timeline, it's illegal for the playhead to go back further, so we should not render the recorded startAt values.
						this._startAt.render(time, suppressEvents, force);
					}
					if (isComplete) {
						if (this._timeline.autoRemoveChildren) {
							this._enabled(false, false);
						}
						this._active = false;
					}
					if (!suppressEvents && this.vars[callback]) {
						this._callback(callback);
					}
					if (duration === 0 && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum) { //the onComplete or onReverseComplete could trigger movement of the playhead and for zero-duration tweens (which must discern direction) that land directly back on their start time, we don't want to fire again on the next render. Think of several addPause()'s in a timeline that forces the playhead to a certain spot, but what if it's already paused and another tween is tweening the "time" of the timeline? Each time it moves [forward] past that spot, it would move back, and since suppressEvents is true, it'd reset _rawPrevTime to _tinyNum so that when it begins again, the callback would fire (so ultimately it could bounce back and forth during that tween). Again, this is a very uncommon scenario, but possible nonetheless.
						this._rawPrevTime = 0;
					}
				}
			};
			
	//---- STATIC FUNCTIONS -----------------------------------------------------------------------------------------------------------
			
			TweenMax.to = function(target, duration, vars) {
				return new TweenMax(target, duration, vars);
			};
			
			TweenMax.from = function(target, duration, vars) {
				vars.runBackwards = true;
				vars.immediateRender = (vars.immediateRender != false);
				return new TweenMax(target, duration, vars);
			};
			
			TweenMax.fromTo = function(target, duration, fromVars, toVars) {
				toVars.startAt = fromVars;
				toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
				return new TweenMax(target, duration, toVars);
			};
			
			TweenMax.staggerTo = TweenMax.allTo = function(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
				stagger = stagger || 0;
				var delay = 0,
					a = [],
					finalComplete = function() {
						if (vars.onComplete) {
							vars.onComplete.apply(vars.onCompleteScope || this, arguments);
						}
						onCompleteAll.apply(onCompleteAllScope || vars.callbackScope || this, onCompleteAllParams || _blankArray);
					},
					cycle = vars.cycle,
					fromCycle = (vars.startAt && vars.startAt.cycle),
					l, copy, i, p;
				if (!_isArray(targets)) {
					if (typeof(targets) === "string") {
						targets = TweenLite.selector(targets) || targets;
					}
					if (_isSelector(targets)) {
						targets = _slice(targets);
					}
				}
				targets = targets || [];
				if (stagger < 0) {
					targets = _slice(targets);
					targets.reverse();
					stagger *= -1;
				}
				l = targets.length - 1;
				for (i = 0; i <= l; i++) {
					copy = {};
					for (p in vars) {
						copy[p] = vars[p];
					}
					if (cycle) {
						_applyCycle(copy, targets, i);
						if (copy.duration != null) {
							duration = copy.duration;
							delete copy.duration;
						}
					}
					if (fromCycle) {
						fromCycle = copy.startAt = {};
						for (p in vars.startAt) {
							fromCycle[p] = vars.startAt[p];
						}
						_applyCycle(copy.startAt, targets, i);
					}
					copy.delay = delay + (copy.delay || 0);
					if (i === l && onCompleteAll) {
						copy.onComplete = finalComplete;
					}
					a[i] = new TweenMax(targets[i], duration, copy);
					delay += stagger;
				}
				return a;
			};
			
			TweenMax.staggerFrom = TweenMax.allFrom = function(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
				vars.runBackwards = true;
				vars.immediateRender = (vars.immediateRender != false);
				return TweenMax.staggerTo(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
			};
			
			TweenMax.staggerFromTo = TweenMax.allFromTo = function(targets, duration, fromVars, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
				toVars.startAt = fromVars;
				toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
				return TweenMax.staggerTo(targets, duration, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
			};
					
			TweenMax.delayedCall = function(delay, callback, params, scope, useFrames) {
				return new TweenMax(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, callbackScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, immediateRender:false, useFrames:useFrames, overwrite:0});
			};
			
			TweenMax.set = function(target, vars) {
				return new TweenMax(target, 0, vars);
			};
			
			TweenMax.isTweening = function(target) {
				return (TweenLite.getTweensOf(target, true).length > 0);
			};
			
			var _getChildrenOf = function(timeline, includeTimelines) {
					var a = [],
						cnt = 0,
						tween = timeline._first;
					while (tween) {
						if (tween instanceof TweenLite) {
							a[cnt++] = tween;
						} else {
							if (includeTimelines) {
								a[cnt++] = tween;
							}
							a = a.concat(_getChildrenOf(tween, includeTimelines));
							cnt = a.length;
						}
						tween = tween._next;
					}
					return a;
				}, 
				getAllTweens = TweenMax.getAllTweens = function(includeTimelines) {
					return _getChildrenOf(Animation._rootTimeline, includeTimelines).concat( _getChildrenOf(Animation._rootFramesTimeline, includeTimelines) );
				};
			
			TweenMax.killAll = function(complete, tweens, delayedCalls, timelines) {
				if (tweens == null) {
					tweens = true;
				}
				if (delayedCalls == null) {
					delayedCalls = true;
				}
				var a = getAllTweens((timelines != false)),
					l = a.length,
					allTrue = (tweens && delayedCalls && timelines),
					isDC, tween, i;
				for (i = 0; i < l; i++) {
					tween = a[i];
					if (allTrue || (tween instanceof SimpleTimeline) || ((isDC = (tween.target === tween.vars.onComplete)) && delayedCalls) || (tweens && !isDC)) {
						if (complete) {
							tween.totalTime(tween._reversed ? 0 : tween.totalDuration());
						} else {
							tween._enabled(false, false);
						}
					}
				}
			};
			
			TweenMax.killChildTweensOf = function(parent, complete) {
				if (parent == null) {
					return;
				}
				var tl = TweenLiteInternals.tweenLookup,
					a, curParent, p, i, l;
				if (typeof(parent) === "string") {
					parent = TweenLite.selector(parent) || parent;
				}
				if (_isSelector(parent)) {
					parent = _slice(parent);
				}
				if (_isArray(parent)) {
					i = parent.length;
					while (--i > -1) {
						TweenMax.killChildTweensOf(parent[i], complete);
					}
					return;
				}
				a = [];
				for (p in tl) {
					curParent = tl[p].target.parentNode;
					while (curParent) {
						if (curParent === parent) {
							a = a.concat(tl[p].tweens);
						}
						curParent = curParent.parentNode;
					}
				}
				l = a.length;
				for (i = 0; i < l; i++) {
					if (complete) {
						a[i].totalTime(a[i].totalDuration());
					}
					a[i]._enabled(false, false);
				}
			};
	
			var _changePause = function(pause, tweens, delayedCalls, timelines) {
				tweens = (tweens !== false);
				delayedCalls = (delayedCalls !== false);
				timelines = (timelines !== false);
				var a = getAllTweens(timelines),
					allTrue = (tweens && delayedCalls && timelines),
					i = a.length,
					isDC, tween;
				while (--i > -1) {
					tween = a[i];
					if (allTrue || (tween instanceof SimpleTimeline) || ((isDC = (tween.target === tween.vars.onComplete)) && delayedCalls) || (tweens && !isDC)) {
						tween.paused(pause);
					}
				}
			};
			
			TweenMax.pauseAll = function(tweens, delayedCalls, timelines) {
				_changePause(true, tweens, delayedCalls, timelines);
			};
			
			TweenMax.resumeAll = function(tweens, delayedCalls, timelines) {
				_changePause(false, tweens, delayedCalls, timelines);
			};
	
			TweenMax.globalTimeScale = function(value) {
				var tl = Animation._rootTimeline,
					t = TweenLite.ticker.time;
				if (!arguments.length) {
					return tl._timeScale;
				}
				value = value || _tinyNum; //can't allow zero because it'll throw the math off
				tl._startTime = t - ((t - tl._startTime) * tl._timeScale / value);
				tl = Animation._rootFramesTimeline;
				t = TweenLite.ticker.frame;
				tl._startTime = t - ((t - tl._startTime) * tl._timeScale / value);
				tl._timeScale = Animation._rootTimeline._timeScale = value;
				return value;
			};
			
		
	//---- GETTERS / SETTERS ----------------------------------------------------------------------------------------------------------
			
			p.progress = function(value, suppressEvents) {
				return (!arguments.length) ? this._time / this.duration() : this.totalTime( this.duration() * ((this._yoyo && (this._cycle & 1) !== 0) ? 1 - value : value) + (this._cycle * (this._duration + this._repeatDelay)), suppressEvents);
			};
			
			p.totalProgress = function(value, suppressEvents) {
				return (!arguments.length) ? this._totalTime / this.totalDuration() : this.totalTime( this.totalDuration() * value, suppressEvents);
			};
			
			p.time = function(value, suppressEvents) {
				if (!arguments.length) {
					return this._time;
				}
				if (this._dirty) {
					this.totalDuration();
				}
				if (value > this._duration) {
					value = this._duration;
				}
				if (this._yoyo && (this._cycle & 1) !== 0) {
					value = (this._duration - value) + (this._cycle * (this._duration + this._repeatDelay));
				} else if (this._repeat !== 0) {
					value += this._cycle * (this._duration + this._repeatDelay);
				}
				return this.totalTime(value, suppressEvents);
			};
	
			p.duration = function(value) {
				if (!arguments.length) {
					return this._duration; //don't set _dirty = false because there could be repeats that haven't been factored into the _totalDuration yet. Otherwise, if you create a repeated TweenMax and then immediately check its duration(), it would cache the value and the totalDuration would not be correct, thus repeats wouldn't take effect.
				}
				return Animation.prototype.duration.call(this, value);
			};
	
			p.totalDuration = function(value) {
				if (!arguments.length) {
					if (this._dirty) {
						//instead of Infinity, we use 999999999999 so that we can accommodate reverses
						this._totalDuration = (this._repeat === -1) ? 999999999999 : this._duration * (this._repeat + 1) + (this._repeatDelay * this._repeat);
						this._dirty = false;
					}
					return this._totalDuration;
				}
				return (this._repeat === -1) ? this : this.duration( (value - (this._repeat * this._repeatDelay)) / (this._repeat + 1) );
			};
			
			p.repeat = function(value) {
				if (!arguments.length) {
					return this._repeat;
				}
				this._repeat = value;
				return this._uncache(true);
			};
			
			p.repeatDelay = function(value) {
				if (!arguments.length) {
					return this._repeatDelay;
				}
				this._repeatDelay = value;
				return this._uncache(true);
			};
			
			p.yoyo = function(value) {
				if (!arguments.length) {
					return this._yoyo;
				}
				this._yoyo = value;
				return this;
			};
			
			
			return TweenMax;
			
		}, true);
	
	
	
	
	
	
	
	
	/*
	 * ----------------------------------------------------------------
	 * TimelineLite
	 * ----------------------------------------------------------------
	 */
		_gsScope._gsDefine("TimelineLite", ["core.Animation","core.SimpleTimeline","TweenLite"], function(Animation, SimpleTimeline, TweenLite) {
	
			var TimelineLite = function(vars) {
					SimpleTimeline.call(this, vars);
					this._labels = {};
					this.autoRemoveChildren = (this.vars.autoRemoveChildren === true);
					this.smoothChildTiming = (this.vars.smoothChildTiming === true);
					this._sortChildren = true;
					this._onUpdate = this.vars.onUpdate;
					var v = this.vars,
						val, p;
					for (p in v) {
						val = v[p];
						if (_isArray(val)) if (val.join("").indexOf("{self}") !== -1) {
							v[p] = this._swapSelfInParams(val);
						}
					}
					if (_isArray(v.tweens)) {
						this.add(v.tweens, 0, v.align, v.stagger);
					}
				},
				_tinyNum = 0.0000000001,
				TweenLiteInternals = TweenLite._internals,
				_internals = TimelineLite._internals = {},
				_isSelector = TweenLiteInternals.isSelector,
				_isArray = TweenLiteInternals.isArray,
				_lazyTweens = TweenLiteInternals.lazyTweens,
				_lazyRender = TweenLiteInternals.lazyRender,
				_globals = _gsScope._gsDefine.globals,
				_copy = function(vars) {
					var copy = {}, p;
					for (p in vars) {
						copy[p] = vars[p];
					}
					return copy;
				},
				_applyCycle = function(vars, targets, i) {
					var alt = vars.cycle,
						p, val;
					for (p in alt) {
						val = alt[p];
						vars[p] = (typeof(val) === "function") ? val.call(targets[i], i) : val[i % val.length];
					}
					delete vars.cycle;
				},
				_pauseCallback = _internals.pauseCallback = function() {},
				_slice = function(a) { //don't use [].slice because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
					var b = [],
						l = a.length,
						i;
					for (i = 0; i !== l; b.push(a[i++]));
					return b;
				},
				p = TimelineLite.prototype = new SimpleTimeline();
	
			TimelineLite.version = "1.18.5";
			p.constructor = TimelineLite;
			p.kill()._gc = p._forcingPlayhead = p._hasPause = false;
	
			/* might use later...
			//translates a local time inside an animation to the corresponding time on the root/global timeline, factoring in all nesting and timeScales.
			function localToGlobal(time, animation) {
				while (animation) {
					time = (time / animation._timeScale) + animation._startTime;
					animation = animation.timeline;
				}
				return time;
			}
	
			//translates the supplied time on the root/global timeline into the corresponding local time inside a particular animation, factoring in all nesting and timeScales
			function globalToLocal(time, animation) {
				var scale = 1;
				time -= localToGlobal(0, animation);
				while (animation) {
					scale *= animation._timeScale;
					animation = animation.timeline;
				}
				return time * scale;
			}
			*/
	
			p.to = function(target, duration, vars, position) {
				var Engine = (vars.repeat && _globals.TweenMax) || TweenLite;
				return duration ? this.add( new Engine(target, duration, vars), position) : this.set(target, vars, position);
			};
	
			p.from = function(target, duration, vars, position) {
				return this.add( ((vars.repeat && _globals.TweenMax) || TweenLite).from(target, duration, vars), position);
			};
	
			p.fromTo = function(target, duration, fromVars, toVars, position) {
				var Engine = (toVars.repeat && _globals.TweenMax) || TweenLite;
				return duration ? this.add( Engine.fromTo(target, duration, fromVars, toVars), position) : this.set(target, toVars, position);
			};
	
			p.staggerTo = function(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
				var tl = new TimelineLite({onComplete:onCompleteAll, onCompleteParams:onCompleteAllParams, callbackScope:onCompleteAllScope, smoothChildTiming:this.smoothChildTiming}),
					cycle = vars.cycle,
					copy, i;
				if (typeof(targets) === "string") {
					targets = TweenLite.selector(targets) || targets;
				}
				targets = targets || [];
				if (_isSelector(targets)) { //senses if the targets object is a selector. If it is, we should translate it into an array.
					targets = _slice(targets);
				}
				stagger = stagger || 0;
				if (stagger < 0) {
					targets = _slice(targets);
					targets.reverse();
					stagger *= -1;
				}
				for (i = 0; i < targets.length; i++) {
					copy = _copy(vars);
					if (copy.startAt) {
						copy.startAt = _copy(copy.startAt);
						if (copy.startAt.cycle) {
							_applyCycle(copy.startAt, targets, i);
						}
					}
					if (cycle) {
						_applyCycle(copy, targets, i);
						if (copy.duration != null) {
							duration = copy.duration;
							delete copy.duration;
						}
					}
					tl.to(targets[i], duration, copy, i * stagger);
				}
				return this.add(tl, position);
			};
	
			p.staggerFrom = function(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
				vars.immediateRender = (vars.immediateRender != false);
				vars.runBackwards = true;
				return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
			};
	
			p.staggerFromTo = function(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
				toVars.startAt = fromVars;
				toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
				return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
			};
	
			p.call = function(callback, params, scope, position) {
				return this.add( TweenLite.delayedCall(0, callback, params, scope), position);
			};
	
			p.set = function(target, vars, position) {
				position = this._parseTimeOrLabel(position, 0, true);
				if (vars.immediateRender == null) {
					vars.immediateRender = (position === this._time && !this._paused);
				}
				return this.add( new TweenLite(target, 0, vars), position);
			};
	
			TimelineLite.exportRoot = function(vars, ignoreDelayedCalls) {
				vars = vars || {};
				if (vars.smoothChildTiming == null) {
					vars.smoothChildTiming = true;
				}
				var tl = new TimelineLite(vars),
					root = tl._timeline,
					tween, next;
				if (ignoreDelayedCalls == null) {
					ignoreDelayedCalls = true;
				}
				root._remove(tl, true);
				tl._startTime = 0;
				tl._rawPrevTime = tl._time = tl._totalTime = root._time;
				tween = root._first;
				while (tween) {
					next = tween._next;
					if (!ignoreDelayedCalls || !(tween instanceof TweenLite && tween.target === tween.vars.onComplete)) {
						tl.add(tween, tween._startTime - tween._delay);
					}
					tween = next;
				}
				root.add(tl, 0);
				return tl;
			};
	
			p.add = function(value, position, align, stagger) {
				var curTime, l, i, child, tl, beforeRawTime;
				if (typeof(position) !== "number") {
					position = this._parseTimeOrLabel(position, 0, true, value);
				}
				if (!(value instanceof Animation)) {
					if ((value instanceof Array) || (value && value.push && _isArray(value))) {
						align = align || "normal";
						stagger = stagger || 0;
						curTime = position;
						l = value.length;
						for (i = 0; i < l; i++) {
							if (_isArray(child = value[i])) {
								child = new TimelineLite({tweens:child});
							}
							this.add(child, curTime);
							if (typeof(child) !== "string" && typeof(child) !== "function") {
								if (align === "sequence") {
									curTime = child._startTime + (child.totalDuration() / child._timeScale);
								} else if (align === "start") {
									child._startTime -= child.delay();
								}
							}
							curTime += stagger;
						}
						return this._uncache(true);
					} else if (typeof(value) === "string") {
						return this.addLabel(value, position);
					} else if (typeof(value) === "function") {
						value = TweenLite.delayedCall(0, value);
					} else {
						throw("Cannot add " + value + " into the timeline; it is not a tween, timeline, function, or string.");
					}
				}
	
				SimpleTimeline.prototype.add.call(this, value, position);
	
				//if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.
				if (this._gc || this._time === this._duration) if (!this._paused) if (this._duration < this.duration()) {
					//in case any of the ancestors had completed but should now be enabled...
					tl = this;
					beforeRawTime = (tl.rawTime() > value._startTime); //if the tween is placed on the timeline so that it starts BEFORE the current rawTime, we should align the playhead (move the timeline). This is because sometimes users will create a timeline, let it finish, and much later append a tween and expect it to run instead of jumping to its end state. While technically one could argue that it should jump to its end state, that's not what users intuitively expect.
					while (tl._timeline) {
						if (beforeRawTime && tl._timeline.smoothChildTiming) {
							tl.totalTime(tl._totalTime, true); //moves the timeline (shifts its startTime) if necessary, and also enables it.
						} else if (tl._gc) {
							tl._enabled(true, false);
						}
						tl = tl._timeline;
					}
				}
	
				return this;
			};
	
			p.remove = function(value) {
				if (value instanceof Animation) {
					this._remove(value, false);
					var tl = value._timeline = value.vars.useFrames ? Animation._rootFramesTimeline : Animation._rootTimeline; //now that it's removed, default it to the root timeline so that if it gets played again, it doesn't jump back into this timeline.
					value._startTime = (value._paused ? value._pauseTime : tl._time) - ((!value._reversed ? value._totalTime : value.totalDuration() - value._totalTime) / value._timeScale); //ensure that if it gets played again, the timing is correct.
					return this;
				} else if (value instanceof Array || (value && value.push && _isArray(value))) {
					var i = value.length;
					while (--i > -1) {
						this.remove(value[i]);
					}
					return this;
				} else if (typeof(value) === "string") {
					return this.removeLabel(value);
				}
				return this.kill(null, value);
			};
	
			p._remove = function(tween, skipDisable) {
				SimpleTimeline.prototype._remove.call(this, tween, skipDisable);
				var last = this._last;
				if (!last) {
					this._time = this._totalTime = this._duration = this._totalDuration = 0;
				} else if (this._time > last._startTime + last._totalDuration / last._timeScale) {
					this._time = this.duration();
					this._totalTime = this._totalDuration;
				}
				return this;
			};
	
			p.append = function(value, offsetOrLabel) {
				return this.add(value, this._parseTimeOrLabel(null, offsetOrLabel, true, value));
			};
	
			p.insert = p.insertMultiple = function(value, position, align, stagger) {
				return this.add(value, position || 0, align, stagger);
			};
	
			p.appendMultiple = function(tweens, offsetOrLabel, align, stagger) {
				return this.add(tweens, this._parseTimeOrLabel(null, offsetOrLabel, true, tweens), align, stagger);
			};
	
			p.addLabel = function(label, position) {
				this._labels[label] = this._parseTimeOrLabel(position);
				return this;
			};
	
			p.addPause = function(position, callback, params, scope) {
				var t = TweenLite.delayedCall(0, _pauseCallback, params, scope || this);
				t.vars.onComplete = t.vars.onReverseComplete = callback;
				t.data = "isPause";
				this._hasPause = true;
				return this.add(t, position);
			};
	
			p.removeLabel = function(label) {
				delete this._labels[label];
				return this;
			};
	
			p.getLabelTime = function(label) {
				return (this._labels[label] != null) ? this._labels[label] : -1;
			};
	
			p._parseTimeOrLabel = function(timeOrLabel, offsetOrLabel, appendIfAbsent, ignore) {
				var i;
				//if we're about to add a tween/timeline (or an array of them) that's already a child of this timeline, we should remove it first so that it doesn't contaminate the duration().
				if (ignore instanceof Animation && ignore.timeline === this) {
					this.remove(ignore);
				} else if (ignore && ((ignore instanceof Array) || (ignore.push && _isArray(ignore)))) {
					i = ignore.length;
					while (--i > -1) {
						if (ignore[i] instanceof Animation && ignore[i].timeline === this) {
							this.remove(ignore[i]);
						}
					}
				}
				if (typeof(offsetOrLabel) === "string") {
					return this._parseTimeOrLabel(offsetOrLabel, (appendIfAbsent && typeof(timeOrLabel) === "number" && this._labels[offsetOrLabel] == null) ? timeOrLabel - this.duration() : 0, appendIfAbsent);
				}
				offsetOrLabel = offsetOrLabel || 0;
				if (typeof(timeOrLabel) === "string" && (isNaN(timeOrLabel) || this._labels[timeOrLabel] != null)) { //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
					i = timeOrLabel.indexOf("=");
					if (i === -1) {
						if (this._labels[timeOrLabel] == null) {
							return appendIfAbsent ? (this._labels[timeOrLabel] = this.duration() + offsetOrLabel) : offsetOrLabel;
						}
						return this._labels[timeOrLabel] + offsetOrLabel;
					}
					offsetOrLabel = parseInt(timeOrLabel.charAt(i-1) + "1", 10) * Number(timeOrLabel.substr(i+1));
					timeOrLabel = (i > 1) ? this._parseTimeOrLabel(timeOrLabel.substr(0, i-1), 0, appendIfAbsent) : this.duration();
				} else if (timeOrLabel == null) {
					timeOrLabel = this.duration();
				}
				return Number(timeOrLabel) + offsetOrLabel;
			};
	
			p.seek = function(position, suppressEvents) {
				return this.totalTime((typeof(position) === "number") ? position : this._parseTimeOrLabel(position), (suppressEvents !== false));
			};
	
			p.stop = function() {
				return this.paused(true);
			};
	
			p.gotoAndPlay = function(position, suppressEvents) {
				return this.play(position, suppressEvents);
			};
	
			p.gotoAndStop = function(position, suppressEvents) {
				return this.pause(position, suppressEvents);
			};
	
			p.render = function(time, suppressEvents, force) {
				if (this._gc) {
					this._enabled(true, false);
				}
				var totalDur = (!this._dirty) ? this._totalDuration : this.totalDuration(),
					prevTime = this._time,
					prevStart = this._startTime,
					prevTimeScale = this._timeScale,
					prevPaused = this._paused,
					tween, isComplete, next, callback, internalForce, pauseTween, curTime;
				if (time >= totalDur - 0.0000001) { //to work around occasional floating point math artifacts.
					this._totalTime = this._time = totalDur;
					if (!this._reversed) if (!this._hasPausedChild()) {
						isComplete = true;
						callback = "onComplete";
						internalForce = !!this._timeline.autoRemoveChildren; //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
						if (this._duration === 0) if ((time <= 0 && time >= -0.0000001) || this._rawPrevTime < 0 || this._rawPrevTime === _tinyNum) if (this._rawPrevTime !== time && this._first) {
							internalForce = true;
							if (this._rawPrevTime > _tinyNum) {
								callback = "onReverseComplete";
							}
						}
					}
					this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline or tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
					time = totalDur + 0.0001; //to avoid occasional floating point rounding errors - sometimes child tweens/timelines were not being fully completed (their progress might be 0.999999999999998 instead of 1 because when _time - tween._startTime is performed, floating point errors would return a value that was SLIGHTLY off). Try (999999999999.7 - 999999999999) * 1 = 0.699951171875 instead of 0.7.
	
				} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
					this._totalTime = this._time = 0;
					if (prevTime !== 0 || (this._duration === 0 && this._rawPrevTime !== _tinyNum && (this._rawPrevTime > 0 || (time < 0 && this._rawPrevTime >= 0)))) {
						callback = "onReverseComplete";
						isComplete = this._reversed;
					}
					if (time < 0) {
						this._active = false;
						if (this._timeline.autoRemoveChildren && this._reversed) { //ensures proper GC if a timeline is resumed after it's finished reversing.
							internalForce = isComplete = true;
							callback = "onReverseComplete";
						} else if (this._rawPrevTime >= 0 && this._first) { //when going back beyond the start, force a render so that zero-duration tweens that sit at the very beginning render their start values properly. Otherwise, if the parent timeline's playhead lands exactly at this timeline's startTime, and then moves backwards, the zero-duration tweens at the beginning would still be at their end state.
							internalForce = true;
						}
						this._rawPrevTime = time;
					} else {
						this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline or tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
						if (time === 0 && isComplete) { //if there's a zero-duration tween at the very beginning of a timeline and the playhead lands EXACTLY at time 0, that tween will correctly render its end values, but we need to keep the timeline alive for one more render so that the beginning values render properly as the parent's playhead keeps moving beyond the begining. Imagine obj.x starts at 0 and then we do tl.set(obj, {x:100}).to(obj, 1, {x:200}) and then later we tl.reverse()...the goal is to have obj.x revert to 0. If the playhead happens to land on exactly 0, without this chunk of code, it'd complete the timeline and remove it from the rendering queue (not good).
							tween = this._first;
							while (tween && tween._startTime === 0) {
								if (!tween._duration) {
									isComplete = false;
								}
								tween = tween._next;
							}
						}
						time = 0; //to avoid occasional floating point rounding errors (could cause problems especially with zero-duration tweens at the very beginning of the timeline)
						if (!this._initted) {
							internalForce = true;
						}
					}
	
				} else {
	
					if (this._hasPause && !this._forcingPlayhead && !suppressEvents) {
						if (time >= prevTime) {
							tween = this._first;
							while (tween && tween._startTime <= time && !pauseTween) {
								if (!tween._duration) if (tween.data === "isPause" && !tween.ratio && !(tween._startTime === 0 && this._rawPrevTime === 0)) {
									pauseTween = tween;
								}
								tween = tween._next;
							}
						} else {
							tween = this._last;
							while (tween && tween._startTime >= time && !pauseTween) {
								if (!tween._duration) if (tween.data === "isPause" && tween._rawPrevTime > 0) {
									pauseTween = tween;
								}
								tween = tween._prev;
							}
						}
						if (pauseTween) {
							this._time = time = pauseTween._startTime;
							this._totalTime = time + (this._cycle * (this._totalDuration + this._repeatDelay));
						}
					}
	
					this._totalTime = this._time = this._rawPrevTime = time;
				}
				if ((this._time === prevTime || !this._first) && !force && !internalForce && !pauseTween) {
					return;
				} else if (!this._initted) {
					this._initted = true;
				}
	
				if (!this._active) if (!this._paused && this._time !== prevTime && time > 0) {
					this._active = true;  //so that if the user renders the timeline (as opposed to the parent timeline rendering it), it is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the timeline already finished but the user manually re-renders it as halfway done, for example.
				}
	
				if (prevTime === 0) if (this.vars.onStart) if (this._time !== 0 || !this._duration) if (!suppressEvents) {
					this._callback("onStart");
				}
	
				curTime = this._time;
				if (curTime >= prevTime) {
					tween = this._first;
					while (tween) {
						next = tween._next; //record it here because the value could change after rendering...
						if (curTime !== this._time || (this._paused && !prevPaused)) { //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
							break;
						} else if (tween._active || (tween._startTime <= curTime && !tween._paused && !tween._gc)) {
							if (pauseTween === tween) {
								this.pause();
							}
							if (!tween._reversed) {
								tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
							} else {
								tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
							}
						}
						tween = next;
					}
				} else {
					tween = this._last;
					while (tween) {
						next = tween._prev; //record it here because the value could change after rendering...
						if (curTime !== this._time || (this._paused && !prevPaused)) { //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
							break;
						} else if (tween._active || (tween._startTime <= prevTime && !tween._paused && !tween._gc)) {
							if (pauseTween === tween) {
								pauseTween = tween._prev; //the linked list is organized by _startTime, thus it's possible that a tween could start BEFORE the pause and end after it, in which case it would be positioned before the pause tween in the linked list, but we should render it before we pause() the timeline and cease rendering. This is only a concern when going in reverse.
								while (pauseTween && pauseTween.endTime() > this._time) {
									pauseTween.render( (pauseTween._reversed ? pauseTween.totalDuration() - ((time - pauseTween._startTime) * pauseTween._timeScale) : (time - pauseTween._startTime) * pauseTween._timeScale), suppressEvents, force);
									pauseTween = pauseTween._prev;
								}
								pauseTween = null;
								this.pause();
							}
							if (!tween._reversed) {
								tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
							} else {
								tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
							}
						}
						tween = next;
					}
				}
	
				if (this._onUpdate) if (!suppressEvents) {
					if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.
						_lazyRender();
					}
					this._callback("onUpdate");
				}
	
				if (callback) if (!this._gc) if (prevStart === this._startTime || prevTimeScale !== this._timeScale) if (this._time === 0 || totalDur >= this.totalDuration()) { //if one of the tweens that was rendered altered this timeline's startTime (like if an onComplete reversed the timeline), it probably isn't complete. If it is, don't worry, because whatever call altered the startTime would complete if it was necessary at the new time. The only exception is the timeScale property. Also check _gc because there's a chance that kill() could be called in an onUpdate
					if (isComplete) {
						if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onComplete on a timeline that reports/checks tweened values.
							_lazyRender();
						}
						if (this._timeline.autoRemoveChildren) {
							this._enabled(false, false);
						}
						this._active = false;
					}
					if (!suppressEvents && this.vars[callback]) {
						this._callback(callback);
					}
				}
			};
	
			p._hasPausedChild = function() {
				var tween = this._first;
				while (tween) {
					if (tween._paused || ((tween instanceof TimelineLite) && tween._hasPausedChild())) {
						return true;
					}
					tween = tween._next;
				}
				return false;
			};
	
			p.getChildren = function(nested, tweens, timelines, ignoreBeforeTime) {
				ignoreBeforeTime = ignoreBeforeTime || -9999999999;
				var a = [],
					tween = this._first,
					cnt = 0;
				while (tween) {
					if (tween._startTime < ignoreBeforeTime) {
						//do nothing
					} else if (tween instanceof TweenLite) {
						if (tweens !== false) {
							a[cnt++] = tween;
						}
					} else {
						if (timelines !== false) {
							a[cnt++] = tween;
						}
						if (nested !== false) {
							a = a.concat(tween.getChildren(true, tweens, timelines));
							cnt = a.length;
						}
					}
					tween = tween._next;
				}
				return a;
			};
	
			p.getTweensOf = function(target, nested) {
				var disabled = this._gc,
					a = [],
					cnt = 0,
					tweens, i;
				if (disabled) {
					this._enabled(true, true); //getTweensOf() filters out disabled tweens, and we have to mark them as _gc = true when the timeline completes in order to allow clean garbage collection, so temporarily re-enable the timeline here.
				}
				tweens = TweenLite.getTweensOf(target);
				i = tweens.length;
				while (--i > -1) {
					if (tweens[i].timeline === this || (nested && this._contains(tweens[i]))) {
						a[cnt++] = tweens[i];
					}
				}
				if (disabled) {
					this._enabled(false, true);
				}
				return a;
			};
	
			p.recent = function() {
				return this._recent;
			};
	
			p._contains = function(tween) {
				var tl = tween.timeline;
				while (tl) {
					if (tl === this) {
						return true;
					}
					tl = tl.timeline;
				}
				return false;
			};
	
			p.shiftChildren = function(amount, adjustLabels, ignoreBeforeTime) {
				ignoreBeforeTime = ignoreBeforeTime || 0;
				var tween = this._first,
					labels = this._labels,
					p;
				while (tween) {
					if (tween._startTime >= ignoreBeforeTime) {
						tween._startTime += amount;
					}
					tween = tween._next;
				}
				if (adjustLabels) {
					for (p in labels) {
						if (labels[p] >= ignoreBeforeTime) {
							labels[p] += amount;
						}
					}
				}
				return this._uncache(true);
			};
	
			p._kill = function(vars, target) {
				if (!vars && !target) {
					return this._enabled(false, false);
				}
				var tweens = (!target) ? this.getChildren(true, true, false) : this.getTweensOf(target),
					i = tweens.length,
					changed = false;
				while (--i > -1) {
					if (tweens[i]._kill(vars, target)) {
						changed = true;
					}
				}
				return changed;
			};
	
			p.clear = function(labels) {
				var tweens = this.getChildren(false, true, true),
					i = tweens.length;
				this._time = this._totalTime = 0;
				while (--i > -1) {
					tweens[i]._enabled(false, false);
				}
				if (labels !== false) {
					this._labels = {};
				}
				return this._uncache(true);
			};
	
			p.invalidate = function() {
				var tween = this._first;
				while (tween) {
					tween.invalidate();
					tween = tween._next;
				}
				return Animation.prototype.invalidate.call(this);;
			};
	
			p._enabled = function(enabled, ignoreTimeline) {
				if (enabled === this._gc) {
					var tween = this._first;
					while (tween) {
						tween._enabled(enabled, true);
						tween = tween._next;
					}
				}
				return SimpleTimeline.prototype._enabled.call(this, enabled, ignoreTimeline);
			};
	
			p.totalTime = function(time, suppressEvents, uncapped) {
				this._forcingPlayhead = true;
				var val = Animation.prototype.totalTime.apply(this, arguments);
				this._forcingPlayhead = false;
				return val;
			};
	
			p.duration = function(value) {
				if (!arguments.length) {
					if (this._dirty) {
						this.totalDuration(); //just triggers recalculation
					}
					return this._duration;
				}
				if (this.duration() !== 0 && value !== 0) {
					this.timeScale(this._duration / value);
				}
				return this;
			};
	
			p.totalDuration = function(value) {
				if (!arguments.length) {
					if (this._dirty) {
						var max = 0,
							tween = this._last,
							prevStart = 999999999999,
							prev, end;
						while (tween) {
							prev = tween._prev; //record it here in case the tween changes position in the sequence...
							if (tween._dirty) {
								tween.totalDuration(); //could change the tween._startTime, so make sure the tween's cache is clean before analyzing it.
							}
							if (tween._startTime > prevStart && this._sortChildren && !tween._paused) { //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
								this.add(tween, tween._startTime - tween._delay);
							} else {
								prevStart = tween._startTime;
							}
							if (tween._startTime < 0 && !tween._paused) { //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
								max -= tween._startTime;
								if (this._timeline.smoothChildTiming) {
									this._startTime += tween._startTime / this._timeScale;
								}
								this.shiftChildren(-tween._startTime, false, -9999999999);
								prevStart = 0;
							}
							end = tween._startTime + (tween._totalDuration / tween._timeScale);
							if (end > max) {
								max = end;
							}
							tween = prev;
						}
						this._duration = this._totalDuration = max;
						this._dirty = false;
					}
					return this._totalDuration;
				}
				return (value && this.totalDuration()) ? this.timeScale(this._totalDuration / value) : this;
			};
	
			p.paused = function(value) {
				if (!value) { //if there's a pause directly at the spot from where we're unpausing, skip it.
					var tween = this._first,
						time = this._time;
					while (tween) {
						if (tween._startTime === time && tween.data === "isPause") {
							tween._rawPrevTime = 0; //remember, _rawPrevTime is how zero-duration tweens/callbacks sense directionality and determine whether or not to fire. If _rawPrevTime is the same as _startTime on the next render, it won't fire.
						}
						tween = tween._next;
					}
				}
				return Animation.prototype.paused.apply(this, arguments);
			};
	
			p.usesFrames = function() {
				var tl = this._timeline;
				while (tl._timeline) {
					tl = tl._timeline;
				}
				return (tl === Animation._rootFramesTimeline);
			};
	
			p.rawTime = function() {
				return this._paused ? this._totalTime : (this._timeline.rawTime() - this._startTime) * this._timeScale;
			};
	
			return TimelineLite;
	
		}, true);
	
	
	
	
	
	
	
	
		
		
		
		
		
	/*
	 * ----------------------------------------------------------------
	 * TimelineMax
	 * ----------------------------------------------------------------
	 */
		_gsScope._gsDefine("TimelineMax", ["TimelineLite","TweenLite","easing.Ease"], function(TimelineLite, TweenLite, Ease) {
	
			var TimelineMax = function(vars) {
					TimelineLite.call(this, vars);
					this._repeat = this.vars.repeat || 0;
					this._repeatDelay = this.vars.repeatDelay || 0;
					this._cycle = 0;
					this._yoyo = (this.vars.yoyo === true);
					this._dirty = true;
				},
				_tinyNum = 0.0000000001,
				TweenLiteInternals = TweenLite._internals,
				_lazyTweens = TweenLiteInternals.lazyTweens,
				_lazyRender = TweenLiteInternals.lazyRender,
				_easeNone = new Ease(null, null, 1, 0),
				p = TimelineMax.prototype = new TimelineLite();
	
			p.constructor = TimelineMax;
			p.kill()._gc = false;
			TimelineMax.version = "1.18.5";
	
			p.invalidate = function() {
				this._yoyo = (this.vars.yoyo === true);
				this._repeat = this.vars.repeat || 0;
				this._repeatDelay = this.vars.repeatDelay || 0;
				this._uncache(true);
				return TimelineLite.prototype.invalidate.call(this);
			};
	
			p.addCallback = function(callback, position, params, scope) {
				return this.add( TweenLite.delayedCall(0, callback, params, scope), position);
			};
	
			p.removeCallback = function(callback, position) {
				if (callback) {
					if (position == null) {
						this._kill(null, callback);
					} else {
						var a = this.getTweensOf(callback, false),
							i = a.length,
							time = this._parseTimeOrLabel(position);
						while (--i > -1) {
							if (a[i]._startTime === time) {
								a[i]._enabled(false, false);
							}
						}
					}
				}
				return this;
			};
	
			p.removePause = function(position) {
				return this.removeCallback(TimelineLite._internals.pauseCallback, position);
			};
	
			p.tweenTo = function(position, vars) {
				vars = vars || {};
				var copy = {ease:_easeNone, useFrames:this.usesFrames(), immediateRender:false},
					duration, p, t;
				for (p in vars) {
					copy[p] = vars[p];
				}
				copy.time = this._parseTimeOrLabel(position);
				duration = (Math.abs(Number(copy.time) - this._time) / this._timeScale) || 0.001;
				t = new TweenLite(this, duration, copy);
				copy.onStart = function() {
					t.target.paused(true);
					if (t.vars.time !== t.target.time() && duration === t.duration()) { //don't make the duration zero - if it's supposed to be zero, don't worry because it's already initting the tween and will complete immediately, effectively making the duration zero anyway. If we make duration zero, the tween won't run at all.
						t.duration( Math.abs( t.vars.time - t.target.time()) / t.target._timeScale );
					}
					if (vars.onStart) { //in case the user had an onStart in the vars - we don't want to overwrite it.
						t._callback("onStart");
					}
				};
				return t;
			};
	
			p.tweenFromTo = function(fromPosition, toPosition, vars) {
				vars = vars || {};
				fromPosition = this._parseTimeOrLabel(fromPosition);
				vars.startAt = {onComplete:this.seek, onCompleteParams:[fromPosition], callbackScope:this};
				vars.immediateRender = (vars.immediateRender !== false);
				var t = this.tweenTo(toPosition, vars);
				return t.duration((Math.abs( t.vars.time - fromPosition) / this._timeScale) || 0.001);
			};
	
			p.render = function(time, suppressEvents, force) {
				if (this._gc) {
					this._enabled(true, false);
				}
				var totalDur = (!this._dirty) ? this._totalDuration : this.totalDuration(),
					dur = this._duration,
					prevTime = this._time,
					prevTotalTime = this._totalTime,
					prevStart = this._startTime,
					prevTimeScale = this._timeScale,
					prevRawPrevTime = this._rawPrevTime,
					prevPaused = this._paused,
					prevCycle = this._cycle,
					tween, isComplete, next, callback, internalForce, cycleDuration, pauseTween, curTime;
				if (time >= totalDur - 0.0000001) { //to work around occasional floating point math artifacts.
					if (!this._locked) {
						this._totalTime = totalDur;
						this._cycle = this._repeat;
					}
					if (!this._reversed) if (!this._hasPausedChild()) {
						isComplete = true;
						callback = "onComplete";
						internalForce = !!this._timeline.autoRemoveChildren; //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
						if (this._duration === 0) if ((time <= 0 && time >= -0.0000001) || prevRawPrevTime < 0 || prevRawPrevTime === _tinyNum) if (prevRawPrevTime !== time && this._first) {
							internalForce = true;
							if (prevRawPrevTime > _tinyNum) {
								callback = "onReverseComplete";
							}
						}
					}
					this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline or tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
					if (this._yoyo && (this._cycle & 1) !== 0) {
						this._time = time = 0;
					} else {
						this._time = dur;
						time = dur + 0.0001; //to avoid occasional floating point rounding errors - sometimes child tweens/timelines were not being fully completed (their progress might be 0.999999999999998 instead of 1 because when _time - tween._startTime is performed, floating point errors would return a value that was SLIGHTLY off). Try (999999999999.7 - 999999999999) * 1 = 0.699951171875 instead of 0.7. We cannot do less then 0.0001 because the same issue can occur when the duration is extremely large like 999999999999 in which case adding 0.00000001, for example, causes it to act like nothing was added.
					}
	
				} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
					if (!this._locked) {
						this._totalTime = this._cycle = 0;
					}
					this._time = 0;
					if (prevTime !== 0 || (dur === 0 && prevRawPrevTime !== _tinyNum && (prevRawPrevTime > 0 || (time < 0 && prevRawPrevTime >= 0)) && !this._locked)) { //edge case for checking time < 0 && prevRawPrevTime >= 0: a zero-duration fromTo() tween inside a zero-duration timeline (yeah, very rare)
						callback = "onReverseComplete";
						isComplete = this._reversed;
					}
					if (time < 0) {
						this._active = false;
						if (this._timeline.autoRemoveChildren && this._reversed) {
							internalForce = isComplete = true;
							callback = "onReverseComplete";
						} else if (prevRawPrevTime >= 0 && this._first) { //when going back beyond the start, force a render so that zero-duration tweens that sit at the very beginning render their start values properly. Otherwise, if the parent timeline's playhead lands exactly at this timeline's startTime, and then moves backwards, the zero-duration tweens at the beginning would still be at their end state.
							internalForce = true;
						}
						this._rawPrevTime = time;
					} else {
						this._rawPrevTime = (dur || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline or tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
						if (time === 0 && isComplete) { //if there's a zero-duration tween at the very beginning of a timeline and the playhead lands EXACTLY at time 0, that tween will correctly render its end values, but we need to keep the timeline alive for one more render so that the beginning values render properly as the parent's playhead keeps moving beyond the begining. Imagine obj.x starts at 0 and then we do tl.set(obj, {x:100}).to(obj, 1, {x:200}) and then later we tl.reverse()...the goal is to have obj.x revert to 0. If the playhead happens to land on exactly 0, without this chunk of code, it'd complete the timeline and remove it from the rendering queue (not good).
							tween = this._first;
							while (tween && tween._startTime === 0) {
								if (!tween._duration) {
									isComplete = false;
								}
								tween = tween._next;
							}
						}
						time = 0; //to avoid occasional floating point rounding errors (could cause problems especially with zero-duration tweens at the very beginning of the timeline)
						if (!this._initted) {
							internalForce = true;
						}
					}
	
				} else {
					if (dur === 0 && prevRawPrevTime < 0) { //without this, zero-duration repeating timelines (like with a simple callback nested at the very beginning and a repeatDelay) wouldn't render the first time through.
						internalForce = true;
					}
					this._time = this._rawPrevTime = time;
					if (!this._locked) {
						this._totalTime = time;
						if (this._repeat !== 0) {
							cycleDuration = dur + this._repeatDelay;
							this._cycle = (this._totalTime / cycleDuration) >> 0; //originally _totalTime % cycleDuration but floating point errors caused problems, so I normalized it. (4 % 0.8 should be 0 but it gets reported as 0.79999999!)
							if (this._cycle !== 0) if (this._cycle === this._totalTime / cycleDuration && prevTotalTime <= time) {
								this._cycle--; //otherwise when rendered exactly at the end time, it will act as though it is repeating (at the beginning)
							}
							this._time = this._totalTime - (this._cycle * cycleDuration);
							if (this._yoyo) if ((this._cycle & 1) !== 0) {
								this._time = dur - this._time;
							}
							if (this._time > dur) {
								this._time = dur;
								time = dur + 0.0001; //to avoid occasional floating point rounding error
							} else if (this._time < 0) {
								this._time = time = 0;
							} else {
								time = this._time;
							}
						}
					}
	
					if (this._hasPause && !this._forcingPlayhead && !suppressEvents) {
						time = this._time;
						if (time >= prevTime) {
							tween = this._first;
							while (tween && tween._startTime <= time && !pauseTween) {
								if (!tween._duration) if (tween.data === "isPause" && !tween.ratio && !(tween._startTime === 0 && this._rawPrevTime === 0)) {
									pauseTween = tween;
								}
								tween = tween._next;
							}
						} else {
							tween = this._last;
							while (tween && tween._startTime >= time && !pauseTween) {
								if (!tween._duration) if (tween.data === "isPause" && tween._rawPrevTime > 0) {
									pauseTween = tween;
								}
								tween = tween._prev;
							}
						}
						if (pauseTween) {
							this._time = time = pauseTween._startTime;
							this._totalTime = time + (this._cycle * (this._totalDuration + this._repeatDelay));
						}
					}
	
				}
	
				if (this._cycle !== prevCycle) if (!this._locked) {
					/*
					make sure children at the end/beginning of the timeline are rendered properly. If, for example,
					a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
					would get transated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
					could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
					we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
					ensure that zero-duration tweens at the very beginning or end of the TimelineMax work.
					*/
					var backwards = (this._yoyo && (prevCycle & 1) !== 0),
						wrap = (backwards === (this._yoyo && (this._cycle & 1) !== 0)),
						recTotalTime = this._totalTime,
						recCycle = this._cycle,
						recRawPrevTime = this._rawPrevTime,
						recTime = this._time;
	
					this._totalTime = prevCycle * dur;
					if (this._cycle < prevCycle) {
						backwards = !backwards;
					} else {
						this._totalTime += dur;
					}
					this._time = prevTime; //temporarily revert _time so that render() renders the children in the correct order. Without this, tweens won't rewind correctly. We could arhictect things in a "cleaner" way by splitting out the rendering queue into a separate method but for performance reasons, we kept it all inside this method.
	
					this._rawPrevTime = (dur === 0) ? prevRawPrevTime - 0.0001 : prevRawPrevTime;
					this._cycle = prevCycle;
					this._locked = true; //prevents changes to totalTime and skips repeat/yoyo behavior when we recursively call render()
					prevTime = (backwards) ? 0 : dur;
					this.render(prevTime, suppressEvents, (dur === 0));
					if (!suppressEvents) if (!this._gc) {
						if (this.vars.onRepeat) {
							this._callback("onRepeat");
						}
					}
					if (prevTime !== this._time) { //in case there's a callback like onComplete in a nested tween/timeline that changes the playhead position, like via seek(), we should just abort.
						return;
					}
					if (wrap) {
						prevTime = (backwards) ? dur + 0.0001 : -0.0001;
						this.render(prevTime, true, false);
					}
					this._locked = false;
					if (this._paused && !prevPaused) { //if the render() triggered callback that paused this timeline, we should abort (very rare, but possible)
						return;
					}
					this._time = recTime;
					this._totalTime = recTotalTime;
					this._cycle = recCycle;
					this._rawPrevTime = recRawPrevTime;
				}
	
				if ((this._time === prevTime || !this._first) && !force && !internalForce && !pauseTween) {
					if (prevTotalTime !== this._totalTime) if (this._onUpdate) if (!suppressEvents) { //so that onUpdate fires even during the repeatDelay - as long as the totalTime changed, we should trigger onUpdate.
						this._callback("onUpdate");
					}
					return;
				} else if (!this._initted) {
					this._initted = true;
				}
	
				if (!this._active) if (!this._paused && this._totalTime !== prevTotalTime && time > 0) {
					this._active = true;  //so that if the user renders the timeline (as opposed to the parent timeline rendering it), it is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the timeline already finished but the user manually re-renders it as halfway done, for example.
				}
	
				if (prevTotalTime === 0) if (this.vars.onStart) if (this._totalTime !== 0 || !this._totalDuration) if (!suppressEvents) {
					this._callback("onStart");
				}
	
				curTime = this._time;
				if (curTime >= prevTime) {
					tween = this._first;
					while (tween) {
						next = tween._next; //record it here because the value could change after rendering...
						if (curTime !== this._time || (this._paused && !prevPaused)) { //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
							break;
						} else if (tween._active || (tween._startTime <= this._time && !tween._paused && !tween._gc)) {
							if (pauseTween === tween) {
								this.pause();
							}
							if (!tween._reversed) {
								tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
							} else {
								tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
							}
						}
						tween = next;
					}
				} else {
					tween = this._last;
					while (tween) {
						next = tween._prev; //record it here because the value could change after rendering...
						if (curTime !== this._time || (this._paused && !prevPaused)) { //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
							break;
						} else if (tween._active || (tween._startTime <= prevTime && !tween._paused && !tween._gc)) {
							if (pauseTween === tween) {
								pauseTween = tween._prev; //the linked list is organized by _startTime, thus it's possible that a tween could start BEFORE the pause and end after it, in which case it would be positioned before the pause tween in the linked list, but we should render it before we pause() the timeline and cease rendering. This is only a concern when going in reverse.
								while (pauseTween && pauseTween.endTime() > this._time) {
									pauseTween.render( (pauseTween._reversed ? pauseTween.totalDuration() - ((time - pauseTween._startTime) * pauseTween._timeScale) : (time - pauseTween._startTime) * pauseTween._timeScale), suppressEvents, force);
									pauseTween = pauseTween._prev;
								}
								pauseTween = null;
								this.pause();
							}
							if (!tween._reversed) {
								tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
							} else {
								tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
							}
						}
						tween = next;
					}
				}
	
				if (this._onUpdate) if (!suppressEvents) {
					if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.
						_lazyRender();
					}
					this._callback("onUpdate");
				}
				if (callback) if (!this._locked) if (!this._gc) if (prevStart === this._startTime || prevTimeScale !== this._timeScale) if (this._time === 0 || totalDur >= this.totalDuration()) { //if one of the tweens that was rendered altered this timeline's startTime (like if an onComplete reversed the timeline), it probably isn't complete. If it is, don't worry, because whatever call altered the startTime would complete if it was necessary at the new time. The only exception is the timeScale property. Also check _gc because there's a chance that kill() could be called in an onUpdate
					if (isComplete) {
						if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onComplete on a timeline that reports/checks tweened values.
							_lazyRender();
						}
						if (this._timeline.autoRemoveChildren) {
							this._enabled(false, false);
						}
						this._active = false;
					}
					if (!suppressEvents && this.vars[callback]) {
						this._callback(callback);
					}
				}
			};
	
			p.getActive = function(nested, tweens, timelines) {
				if (nested == null) {
					nested = true;
				}
				if (tweens == null) {
					tweens = true;
				}
				if (timelines == null) {
					timelines = false;
				}
				var a = [],
					all = this.getChildren(nested, tweens, timelines),
					cnt = 0,
					l = all.length,
					i, tween;
				for (i = 0; i < l; i++) {
					tween = all[i];
					if (tween.isActive()) {
						a[cnt++] = tween;
					}
				}
				return a;
			};
	
	
			p.getLabelAfter = function(time) {
				if (!time) if (time !== 0) { //faster than isNan()
					time = this._time;
				}
				var labels = this.getLabelsArray(),
					l = labels.length,
					i;
				for (i = 0; i < l; i++) {
					if (labels[i].time > time) {
						return labels[i].name;
					}
				}
				return null;
			};
	
			p.getLabelBefore = function(time) {
				if (time == null) {
					time = this._time;
				}
				var labels = this.getLabelsArray(),
					i = labels.length;
				while (--i > -1) {
					if (labels[i].time < time) {
						return labels[i].name;
					}
				}
				return null;
			};
	
			p.getLabelsArray = function() {
				var a = [],
					cnt = 0,
					p;
				for (p in this._labels) {
					a[cnt++] = {time:this._labels[p], name:p};
				}
				a.sort(function(a,b) {
					return a.time - b.time;
				});
				return a;
			};
	
	
	//---- GETTERS / SETTERS -------------------------------------------------------------------------------------------------------
	
			p.progress = function(value, suppressEvents) {
				return (!arguments.length) ? this._time / this.duration() : this.totalTime( this.duration() * ((this._yoyo && (this._cycle & 1) !== 0) ? 1 - value : value) + (this._cycle * (this._duration + this._repeatDelay)), suppressEvents);
			};
	
			p.totalProgress = function(value, suppressEvents) {
				return (!arguments.length) ? this._totalTime / this.totalDuration() : this.totalTime( this.totalDuration() * value, suppressEvents);
			};
	
			p.totalDuration = function(value) {
				if (!arguments.length) {
					if (this._dirty) {
						TimelineLite.prototype.totalDuration.call(this); //just forces refresh
						//Instead of Infinity, we use 999999999999 so that we can accommodate reverses.
						this._totalDuration = (this._repeat === -1) ? 999999999999 : this._duration * (this._repeat + 1) + (this._repeatDelay * this._repeat);
					}
					return this._totalDuration;
				}
				return (this._repeat === -1 || !value) ? this : this.timeScale( this.totalDuration() / value );
			};
	
			p.time = function(value, suppressEvents) {
				if (!arguments.length) {
					return this._time;
				}
				if (this._dirty) {
					this.totalDuration();
				}
				if (value > this._duration) {
					value = this._duration;
				}
				if (this._yoyo && (this._cycle & 1) !== 0) {
					value = (this._duration - value) + (this._cycle * (this._duration + this._repeatDelay));
				} else if (this._repeat !== 0) {
					value += this._cycle * (this._duration + this._repeatDelay);
				}
				return this.totalTime(value, suppressEvents);
			};
	
			p.repeat = function(value) {
				if (!arguments.length) {
					return this._repeat;
				}
				this._repeat = value;
				return this._uncache(true);
			};
	
			p.repeatDelay = function(value) {
				if (!arguments.length) {
					return this._repeatDelay;
				}
				this._repeatDelay = value;
				return this._uncache(true);
			};
	
			p.yoyo = function(value) {
				if (!arguments.length) {
					return this._yoyo;
				}
				this._yoyo = value;
				return this;
			};
	
			p.currentLabel = function(value) {
				if (!arguments.length) {
					return this.getLabelBefore(this._time + 0.00000001);
				}
				return this.seek(value, true);
			};
	
			return TimelineMax;
	
		}, true);
		
	
	
	
	
		
		
		
		
		
		
		
	/*
	 * ----------------------------------------------------------------
	 * BezierPlugin
	 * ----------------------------------------------------------------
	 */
		(function() {
	
			var _RAD2DEG = 180 / Math.PI,
				_r1 = [],
				_r2 = [],
				_r3 = [],
				_corProps = {},
				_globals = _gsScope._gsDefine.globals,
				Segment = function(a, b, c, d) {
					if (c === d) { //if c and d match, the final autoRotate value could lock at -90 degrees, so differentiate them slightly.
						c = d - (d - b) / 1000000;
					}
					if (a === b) { //if a and b match, the starting autoRotate value could lock at -90 degrees, so differentiate them slightly.
						b = a + (c - a) / 1000000;
					}
					this.a = a;
					this.b = b;
					this.c = c;
					this.d = d;
					this.da = d - a;
					this.ca = c - a;
					this.ba = b - a;
				},
				_correlate = ",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",
				cubicToQuadratic = function(a, b, c, d) {
					var q1 = {a:a},
						q2 = {},
						q3 = {},
						q4 = {c:d},
						mab = (a + b) / 2,
						mbc = (b + c) / 2,
						mcd = (c + d) / 2,
						mabc = (mab + mbc) / 2,
						mbcd = (mbc + mcd) / 2,
						m8 = (mbcd - mabc) / 8;
					q1.b = mab + (a - mab) / 4;
					q2.b = mabc + m8;
					q1.c = q2.a = (q1.b + q2.b) / 2;
					q2.c = q3.a = (mabc + mbcd) / 2;
					q3.b = mbcd - m8;
					q4.b = mcd + (d - mcd) / 4;
					q3.c = q4.a = (q3.b + q4.b) / 2;
					return [q1, q2, q3, q4];
				},
				_calculateControlPoints = function(a, curviness, quad, basic, correlate) {
					var l = a.length - 1,
						ii = 0,
						cp1 = a[0].a,
						i, p1, p2, p3, seg, m1, m2, mm, cp2, qb, r1, r2, tl;
					for (i = 0; i < l; i++) {
						seg = a[ii];
						p1 = seg.a;
						p2 = seg.d;
						p3 = a[ii+1].d;
	
						if (correlate) {
							r1 = _r1[i];
							r2 = _r2[i];
							tl = ((r2 + r1) * curviness * 0.25) / (basic ? 0.5 : _r3[i] || 0.5);
							m1 = p2 - (p2 - p1) * (basic ? curviness * 0.5 : (r1 !== 0 ? tl / r1 : 0));
							m2 = p2 + (p3 - p2) * (basic ? curviness * 0.5 : (r2 !== 0 ? tl / r2 : 0));
							mm = p2 - (m1 + (((m2 - m1) * ((r1 * 3 / (r1 + r2)) + 0.5) / 4) || 0));
						} else {
							m1 = p2 - (p2 - p1) * curviness * 0.5;
							m2 = p2 + (p3 - p2) * curviness * 0.5;
							mm = p2 - (m1 + m2) / 2;
						}
						m1 += mm;
						m2 += mm;
	
						seg.c = cp2 = m1;
						if (i !== 0) {
							seg.b = cp1;
						} else {
							seg.b = cp1 = seg.a + (seg.c - seg.a) * 0.6; //instead of placing b on a exactly, we move it inline with c so that if the user specifies an ease like Back.easeIn or Elastic.easeIn which goes BEYOND the beginning, it will do so smoothly.
						}
	
						seg.da = p2 - p1;
						seg.ca = cp2 - p1;
						seg.ba = cp1 - p1;
	
						if (quad) {
							qb = cubicToQuadratic(p1, cp1, cp2, p2);
							a.splice(ii, 1, qb[0], qb[1], qb[2], qb[3]);
							ii += 4;
						} else {
							ii++;
						}
	
						cp1 = m2;
					}
					seg = a[ii];
					seg.b = cp1;
					seg.c = cp1 + (seg.d - cp1) * 0.4; //instead of placing c on d exactly, we move it inline with b so that if the user specifies an ease like Back.easeOut or Elastic.easeOut which goes BEYOND the end, it will do so smoothly.
					seg.da = seg.d - seg.a;
					seg.ca = seg.c - seg.a;
					seg.ba = cp1 - seg.a;
					if (quad) {
						qb = cubicToQuadratic(seg.a, cp1, seg.c, seg.d);
						a.splice(ii, 1, qb[0], qb[1], qb[2], qb[3]);
					}
				},
				_parseAnchors = function(values, p, correlate, prepend) {
					var a = [],
						l, i, p1, p2, p3, tmp;
					if (prepend) {
						values = [prepend].concat(values);
						i = values.length;
						while (--i > -1) {
							if (typeof( (tmp = values[i][p]) ) === "string") if (tmp.charAt(1) === "=") {
								values[i][p] = prepend[p] + Number(tmp.charAt(0) + tmp.substr(2)); //accommodate relative values. Do it inline instead of breaking it out into a function for speed reasons
							}
						}
					}
					l = values.length - 2;
					if (l < 0) {
						a[0] = new Segment(values[0][p], 0, 0, values[(l < -1) ? 0 : 1][p]);
						return a;
					}
					for (i = 0; i < l; i++) {
						p1 = values[i][p];
						p2 = values[i+1][p];
						a[i] = new Segment(p1, 0, 0, p2);
						if (correlate) {
							p3 = values[i+2][p];
							_r1[i] = (_r1[i] || 0) + (p2 - p1) * (p2 - p1);
							_r2[i] = (_r2[i] || 0) + (p3 - p2) * (p3 - p2);
						}
					}
					a[i] = new Segment(values[i][p], 0, 0, values[i+1][p]);
					return a;
				},
				bezierThrough = function(values, curviness, quadratic, basic, correlate, prepend) {
					var obj = {},
						props = [],
						first = prepend || values[0],
						i, p, a, j, r, l, seamless, last;
					correlate = (typeof(correlate) === "string") ? ","+correlate+"," : _correlate;
					if (curviness == null) {
						curviness = 1;
					}
					for (p in values[0]) {
						props.push(p);
					}
					//check to see if the last and first values are identical (well, within 0.05). If so, make seamless by appending the second element to the very end of the values array and the 2nd-to-last element to the very beginning (we'll remove those segments later)
					if (values.length > 1) {
						last = values[values.length - 1];
						seamless = true;
						i = props.length;
						while (--i > -1) {
							p = props[i];
							if (Math.abs(first[p] - last[p]) > 0.05) { //build in a tolerance of +/-0.05 to accommodate rounding errors.
								seamless = false;
								break;
							}
						}
						if (seamless) {
							values = values.concat(); //duplicate the array to avoid contaminating the original which the user may be reusing for other tweens
							if (prepend) {
								values.unshift(prepend);
							}
							values.push(values[1]);
							prepend = values[values.length - 3];
						}
					}
					_r1.length = _r2.length = _r3.length = 0;
					i = props.length;
					while (--i > -1) {
						p = props[i];
						_corProps[p] = (correlate.indexOf(","+p+",") !== -1);
						obj[p] = _parseAnchors(values, p, _corProps[p], prepend);
					}
					i = _r1.length;
					while (--i > -1) {
						_r1[i] = Math.sqrt(_r1[i]);
						_r2[i] = Math.sqrt(_r2[i]);
					}
					if (!basic) {
						i = props.length;
						while (--i > -1) {
							if (_corProps[p]) {
								a = obj[props[i]];
								l = a.length - 1;
								for (j = 0; j < l; j++) {
									r = (a[j+1].da / _r2[j] + a[j].da / _r1[j]) || 0;
									_r3[j] = (_r3[j] || 0) + r * r;
								}
							}
						}
						i = _r3.length;
						while (--i > -1) {
							_r3[i] = Math.sqrt(_r3[i]);
						}
					}
					i = props.length;
					j = quadratic ? 4 : 1;
					while (--i > -1) {
						p = props[i];
						a = obj[p];
						_calculateControlPoints(a, curviness, quadratic, basic, _corProps[p]); //this method requires that _parseAnchors() and _setSegmentRatios() ran first so that _r1, _r2, and _r3 values are populated for all properties
						if (seamless) {
							a.splice(0, j);
							a.splice(a.length - j, j);
						}
					}
					return obj;
				},
				_parseBezierData = function(values, type, prepend) {
					type = type || "soft";
					var obj = {},
						inc = (type === "cubic") ? 3 : 2,
						soft = (type === "soft"),
						props = [],
						a, b, c, d, cur, i, j, l, p, cnt, tmp;
					if (soft && prepend) {
						values = [prepend].concat(values);
					}
					if (values == null || values.length < inc + 1) { throw "invalid Bezier data"; }
					for (p in values[0]) {
						props.push(p);
					}
					i = props.length;
					while (--i > -1) {
						p = props[i];
						obj[p] = cur = [];
						cnt = 0;
						l = values.length;
						for (j = 0; j < l; j++) {
							a = (prepend == null) ? values[j][p] : (typeof( (tmp = values[j][p]) ) === "string" && tmp.charAt(1) === "=") ? prepend[p] + Number(tmp.charAt(0) + tmp.substr(2)) : Number(tmp);
							if (soft) if (j > 1) if (j < l - 1) {
								cur[cnt++] = (a + cur[cnt-2]) / 2;
							}
							cur[cnt++] = a;
						}
						l = cnt - inc + 1;
						cnt = 0;
						for (j = 0; j < l; j += inc) {
							a = cur[j];
							b = cur[j+1];
							c = cur[j+2];
							d = (inc === 2) ? 0 : cur[j+3];
							cur[cnt++] = tmp = (inc === 3) ? new Segment(a, b, c, d) : new Segment(a, (2 * b + a) / 3, (2 * b + c) / 3, c);
						}
						cur.length = cnt;
					}
					return obj;
				},
				_addCubicLengths = function(a, steps, resolution) {
					var inc = 1 / resolution,
						j = a.length,
						d, d1, s, da, ca, ba, p, i, inv, bez, index;
					while (--j > -1) {
						bez = a[j];
						s = bez.a;
						da = bez.d - s;
						ca = bez.c - s;
						ba = bez.b - s;
						d = d1 = 0;
						for (i = 1; i <= resolution; i++) {
							p = inc * i;
							inv = 1 - p;
							d = d1 - (d1 = (p * p * da + 3 * inv * (p * ca + inv * ba)) * p);
							index = j * resolution + i - 1;
							steps[index] = (steps[index] || 0) + d * d;
						}
					}
				},
				_parseLengthData = function(obj, resolution) {
					resolution = resolution >> 0 || 6;
					var a = [],
						lengths = [],
						d = 0,
						total = 0,
						threshold = resolution - 1,
						segments = [],
						curLS = [], //current length segments array
						p, i, l, index;
					for (p in obj) {
						_addCubicLengths(obj[p], a, resolution);
					}
					l = a.length;
					for (i = 0; i < l; i++) {
						d += Math.sqrt(a[i]);
						index = i % resolution;
						curLS[index] = d;
						if (index === threshold) {
							total += d;
							index = (i / resolution) >> 0;
							segments[index] = curLS;
							lengths[index] = total;
							d = 0;
							curLS = [];
						}
					}
					return {length:total, lengths:lengths, segments:segments};
				},
	
	
	
				BezierPlugin = _gsScope._gsDefine.plugin({
						propName: "bezier",
						priority: -1,
						version: "1.3.6",
						API: 2,
						global:true,
	
						//gets called when the tween renders for the first time. This is where initial values should be recorded and any setup routines should run.
						init: function(target, vars, tween) {
							this._target = target;
							if (vars instanceof Array) {
								vars = {values:vars};
							}
							this._func = {};
							this._round = {};
							this._props = [];
							this._timeRes = (vars.timeResolution == null) ? 6 : parseInt(vars.timeResolution, 10);
							var values = vars.values || [],
								first = {},
								second = values[0],
								autoRotate = vars.autoRotate || tween.vars.orientToBezier,
								p, isFunc, i, j, prepend;
	
							this._autoRotate = autoRotate ? (autoRotate instanceof Array) ? autoRotate : [["x","y","rotation",((autoRotate === true) ? 0 : Number(autoRotate) || 0)]] : null;
							for (p in second) {
								this._props.push(p);
							}
	
							i = this._props.length;
							while (--i > -1) {
								p = this._props[i];
	
								this._overwriteProps.push(p);
								isFunc = this._func[p] = (typeof(target[p]) === "function");
								first[p] = (!isFunc) ? parseFloat(target[p]) : target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]();
								if (!prepend) if (first[p] !== values[0][p]) {
									prepend = first;
								}
							}
							this._beziers = (vars.type !== "cubic" && vars.type !== "quadratic" && vars.type !== "soft") ? bezierThrough(values, isNaN(vars.curviness) ? 1 : vars.curviness, false, (vars.type === "thruBasic"), vars.correlate, prepend) : _parseBezierData(values, vars.type, first);
							this._segCount = this._beziers[p].length;
	
							if (this._timeRes) {
								var ld = _parseLengthData(this._beziers, this._timeRes);
								this._length = ld.length;
								this._lengths = ld.lengths;
								this._segments = ld.segments;
								this._l1 = this._li = this._s1 = this._si = 0;
								this._l2 = this._lengths[0];
								this._curSeg = this._segments[0];
								this._s2 = this._curSeg[0];
								this._prec = 1 / this._curSeg.length;
							}
	
							if ((autoRotate = this._autoRotate)) {
								this._initialRotations = [];
								if (!(autoRotate[0] instanceof Array)) {
									this._autoRotate = autoRotate = [autoRotate];
								}
								i = autoRotate.length;
								while (--i > -1) {
									for (j = 0; j < 3; j++) {
										p = autoRotate[i][j];
										this._func[p] = (typeof(target[p]) === "function") ? target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ] : false;
									}
									p = autoRotate[i][2];
									this._initialRotations[i] = (this._func[p] ? this._func[p].call(this._target) : this._target[p]) || 0;
								}
							}
							this._startRatio = tween.vars.runBackwards ? 1 : 0; //we determine the starting ratio when the tween inits which is always 0 unless the tween has runBackwards:true (indicating it's a from() tween) in which case it's 1.
							return true;
						},
	
						//called each time the values should be updated, and the ratio gets passed as the only parameter (typically it's a value between 0 and 1, but it can exceed those when using an ease like Elastic.easeOut or Back.easeOut, etc.)
						set: function(v) {
							var segments = this._segCount,
								func = this._func,
								target = this._target,
								notStart = (v !== this._startRatio),
								curIndex, inv, i, p, b, t, val, l, lengths, curSeg;
							if (!this._timeRes) {
								curIndex = (v < 0) ? 0 : (v >= 1) ? segments - 1 : (segments * v) >> 0;
								t = (v - (curIndex * (1 / segments))) * segments;
							} else {
								lengths = this._lengths;
								curSeg = this._curSeg;
								v *= this._length;
								i = this._li;
								//find the appropriate segment (if the currently cached one isn't correct)
								if (v > this._l2 && i < segments - 1) {
									l = segments - 1;
									while (i < l && (this._l2 = lengths[++i]) <= v) {	}
									this._l1 = lengths[i-1];
									this._li = i;
									this._curSeg = curSeg = this._segments[i];
									this._s2 = curSeg[(this._s1 = this._si = 0)];
								} else if (v < this._l1 && i > 0) {
									while (i > 0 && (this._l1 = lengths[--i]) >= v) { }
									if (i === 0 && v < this._l1) {
										this._l1 = 0;
									} else {
										i++;
									}
									this._l2 = lengths[i];
									this._li = i;
									this._curSeg = curSeg = this._segments[i];
									this._s1 = curSeg[(this._si = curSeg.length - 1) - 1] || 0;
									this._s2 = curSeg[this._si];
								}
								curIndex = i;
								//now find the appropriate sub-segment (we split it into the number of pieces that was defined by "precision" and measured each one)
								v -= this._l1;
								i = this._si;
								if (v > this._s2 && i < curSeg.length - 1) {
									l = curSeg.length - 1;
									while (i < l && (this._s2 = curSeg[++i]) <= v) {	}
									this._s1 = curSeg[i-1];
									this._si = i;
								} else if (v < this._s1 && i > 0) {
									while (i > 0 && (this._s1 = curSeg[--i]) >= v) {	}
									if (i === 0 && v < this._s1) {
										this._s1 = 0;
									} else {
										i++;
									}
									this._s2 = curSeg[i];
									this._si = i;
								}
								t = ((i + (v - this._s1) / (this._s2 - this._s1)) * this._prec) || 0;
							}
							inv = 1 - t;
	
							i = this._props.length;
							while (--i > -1) {
								p = this._props[i];
								b = this._beziers[p][curIndex];
								val = (t * t * b.da + 3 * inv * (t * b.ca + inv * b.ba)) * t + b.a;
								if (this._round[p]) {
									val = Math.round(val);
								}
								if (func[p]) {
									target[p](val);
								} else {
									target[p] = val;
								}
							}
	
							if (this._autoRotate) {
								var ar = this._autoRotate,
									b2, x1, y1, x2, y2, add, conv;
								i = ar.length;
								while (--i > -1) {
									p = ar[i][2];
									add = ar[i][3] || 0;
									conv = (ar[i][4] === true) ? 1 : _RAD2DEG;
									b = this._beziers[ar[i][0]];
									b2 = this._beziers[ar[i][1]];
	
									if (b && b2) { //in case one of the properties got overwritten.
										b = b[curIndex];
										b2 = b2[curIndex];
	
										x1 = b.a + (b.b - b.a) * t;
										x2 = b.b + (b.c - b.b) * t;
										x1 += (x2 - x1) * t;
										x2 += ((b.c + (b.d - b.c) * t) - x2) * t;
	
										y1 = b2.a + (b2.b - b2.a) * t;
										y2 = b2.b + (b2.c - b2.b) * t;
										y1 += (y2 - y1) * t;
										y2 += ((b2.c + (b2.d - b2.c) * t) - y2) * t;
	
										val = notStart ? Math.atan2(y2 - y1, x2 - x1) * conv + add : this._initialRotations[i];
	
										if (func[p]) {
											target[p](val);
										} else {
											target[p] = val;
										}
									}
								}
							}
						}
				}),
				p = BezierPlugin.prototype;
	
	
			BezierPlugin.bezierThrough = bezierThrough;
			BezierPlugin.cubicToQuadratic = cubicToQuadratic;
			BezierPlugin._autoCSS = true; //indicates that this plugin can be inserted into the "css" object using the autoCSS feature of TweenLite
			BezierPlugin.quadraticToCubic = function(a, b, c) {
				return new Segment(a, (2 * b + a) / 3, (2 * b + c) / 3, c);
			};
	
			BezierPlugin._cssRegister = function() {
				var CSSPlugin = _globals.CSSPlugin;
				if (!CSSPlugin) {
					return;
				}
				var _internals = CSSPlugin._internals,
					_parseToProxy = _internals._parseToProxy,
					_setPluginRatio = _internals._setPluginRatio,
					CSSPropTween = _internals.CSSPropTween;
				_internals._registerComplexSpecialProp("bezier", {parser:function(t, e, prop, cssp, pt, plugin) {
					if (e instanceof Array) {
						e = {values:e};
					}
					plugin = new BezierPlugin();
					var values = e.values,
						l = values.length - 1,
						pluginValues = [],
						v = {},
						i, p, data;
					if (l < 0) {
						return pt;
					}
					for (i = 0; i <= l; i++) {
						data = _parseToProxy(t, values[i], cssp, pt, plugin, (l !== i));
						pluginValues[i] = data.end;
					}
					for (p in e) {
						v[p] = e[p]; //duplicate the vars object because we need to alter some things which would cause problems if the user plans to reuse the same vars object for another tween.
					}
					v.values = pluginValues;
					pt = new CSSPropTween(t, "bezier", 0, 0, data.pt, 2);
					pt.data = data;
					pt.plugin = plugin;
					pt.setRatio = _setPluginRatio;
					if (v.autoRotate === 0) {
						v.autoRotate = true;
					}
					if (v.autoRotate && !(v.autoRotate instanceof Array)) {
						i = (v.autoRotate === true) ? 0 : Number(v.autoRotate);
						v.autoRotate = (data.end.left != null) ? [["left","top","rotation",i,false]] : (data.end.x != null) ? [["x","y","rotation",i,false]] : false;
					}
					if (v.autoRotate) {
						if (!cssp._transform) {
							cssp._enableTransforms(false);
						}
						data.autoRotate = cssp._target._gsTransform;
						data.proxy.rotation = data.autoRotate.rotation || 0;
					}
					plugin._onInitTween(data.proxy, v, cssp._tween);
					return pt;
				}});
			};
	
			p._roundProps = function(lookup, value) {
				var op = this._overwriteProps,
					i = op.length;
				while (--i > -1) {
					if (lookup[op[i]] || lookup.bezier || lookup.bezierThrough) {
						this._round[op[i]] = value;
					}
				}
			};
	
			p._kill = function(lookup) {
				var a = this._props,
					p, i;
				for (p in this._beziers) {
					if (p in lookup) {
						delete this._beziers[p];
						delete this._func[p];
						i = a.length;
						while (--i > -1) {
							if (a[i] === p) {
								a.splice(i, 1);
							}
						}
					}
				}
				return this._super._kill.call(this, lookup);
			};
	
		}());
	
	
	
	
	
	
		
		
		
		
		
		
		
		
	/*
	 * ----------------------------------------------------------------
	 * CSSPlugin
	 * ----------------------------------------------------------------
	 */
		_gsScope._gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin","TweenLite"], function(TweenPlugin, TweenLite) {
	
			/** @constructor **/
			var CSSPlugin = function() {
					TweenPlugin.call(this, "css");
					this._overwriteProps.length = 0;
					this.setRatio = CSSPlugin.prototype.setRatio; //speed optimization (avoid prototype lookup on this "hot" method)
				},
				_globals = _gsScope._gsDefine.globals,
				_hasPriority, //turns true whenever a CSSPropTween instance is created that has a priority other than 0. This helps us discern whether or not we should spend the time organizing the linked list or not after a CSSPlugin's _onInitTween() method is called.
				_suffixMap, //we set this in _onInitTween() each time as a way to have a persistent variable we can use in other methods like _parse() without having to pass it around as a parameter and we keep _parse() decoupled from a particular CSSPlugin instance
				_cs, //computed style (we store this in a shared variable to conserve memory and make minification tighter
				_overwriteProps, //alias to the currently instantiating CSSPlugin's _overwriteProps array. We use this closure in order to avoid having to pass a reference around from method to method and aid in minification.
				_specialProps = {},
				p = CSSPlugin.prototype = new TweenPlugin("css");
	
			p.constructor = CSSPlugin;
			CSSPlugin.version = "1.18.5";
			CSSPlugin.API = 2;
			CSSPlugin.defaultTransformPerspective = 0;
			CSSPlugin.defaultSkewType = "compensated";
			CSSPlugin.defaultSmoothOrigin = true;
			p = "px"; //we'll reuse the "p" variable to keep file size down
			CSSPlugin.suffixMap = {top:p, right:p, bottom:p, left:p, width:p, height:p, fontSize:p, padding:p, margin:p, perspective:p, lineHeight:""};
	
	
			var _numExp = /(?:\-|\.|\b)(\d|\.|e\-)+/g,
				_relNumExp = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
				_valuesExp = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi, //finds all the values that begin with numbers or += or -= and then a number. Includes suffixes. We use this to split complex values apart like "1px 5px 20px rgb(255,102,51)"
				_NaNExp = /(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g, //also allows scientific notation and doesn't kill the leading -/+ in -= and +=
				_suffixExp = /(?:\d|\-|\+|=|#|\.)*/g,
				_opacityExp = /opacity *= *([^)]*)/i,
				_opacityValExp = /opacity:([^;]*)/i,
				_alphaFilterExp = /alpha\(opacity *=.+?\)/i,
				_rgbhslExp = /^(rgb|hsl)/,
				_capsExp = /([A-Z])/g,
				_camelExp = /-([a-z])/gi,
				_urlExp = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi, //for pulling out urls from url(...) or url("...") strings (some browsers wrap urls in quotes, some don't when reporting things like backgroundImage)
				_camelFunc = function(s, g) { return g.toUpperCase(); },
				_horizExp = /(?:Left|Right|Width)/i,
				_ieGetMatrixExp = /(M11|M12|M21|M22)=[\d\-\.e]+/gi,
				_ieSetMatrixExp = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
				_commasOutsideParenExp = /,(?=[^\)]*(?:\(|$))/gi, //finds any commas that are not within parenthesis
				_complexExp = /[\s,\(]/i, //for testing a string to find if it has a space, comma, or open parenthesis (clues that it's a complex value)
				_DEG2RAD = Math.PI / 180,
				_RAD2DEG = 180 / Math.PI,
				_forcePT = {},
				_doc = document,
				_createElement = function(type) {
					return _doc.createElementNS ? _doc.createElementNS("http://www.w3.org/1999/xhtml", type) : _doc.createElement(type);
				},
				_tempDiv = _createElement("div"),
				_tempImg = _createElement("img"),
				_internals = CSSPlugin._internals = {_specialProps:_specialProps}, //provides a hook to a few internal methods that we need to access from inside other plugins
				_agent = navigator.userAgent,
				_autoRound,
				_reqSafariFix, //we won't apply the Safari transform fix until we actually come across a tween that affects a transform property (to maintain best performance).
	
				_isSafari,
				_isFirefox, //Firefox has a bug that causes 3D transformed elements to randomly disappear unless a repaint is forced after each update on each element.
				_isSafariLT6, //Safari (and Android 4 which uses a flavor of Safari) has a bug that prevents changes to "top" and "left" properties from rendering properly if changed on the same frame as a transform UNLESS we set the element's WebkitBackfaceVisibility to hidden (weird, I know). Doing this for Android 3 and earlier seems to actually cause other problems, though (fun!)
				_ieVers,
				_supportsOpacity = (function() { //we set _isSafari, _ieVers, _isFirefox, and _supportsOpacity all in one function here to reduce file size slightly, especially in the minified version.
					var i = _agent.indexOf("Android"),
						a = _createElement("a");
					_isSafari = (_agent.indexOf("Safari") !== -1 && _agent.indexOf("Chrome") === -1 && (i === -1 || Number(_agent.substr(i+8, 1)) > 3));
					_isSafariLT6 = (_isSafari && (Number(_agent.substr(_agent.indexOf("Version/")+8, 1)) < 6));
					_isFirefox = (_agent.indexOf("Firefox") !== -1);
					if ((/MSIE ([0-9]{1,}[\.0-9]{0,})/).exec(_agent) || (/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/).exec(_agent)) {
						_ieVers = parseFloat( RegExp.$1 );
					}
					if (!a) {
						return false;
					}
					a.style.cssText = "top:1px;opacity:.55;";
					return /^0.55/.test(a.style.opacity);
				}()),
				_getIEOpacity = function(v) {
					return (_opacityExp.test( ((typeof(v) === "string") ? v : (v.currentStyle ? v.currentStyle.filter : v.style.filter) || "") ) ? ( parseFloat( RegExp.$1 ) / 100 ) : 1);
				},
				_log = function(s) {//for logging messages, but in a way that won't throw errors in old versions of IE.
					if (window.console) {
						console.log(s);
					}
				},
	
				_prefixCSS = "", //the non-camelCase vendor prefix like "-o-", "-moz-", "-ms-", or "-webkit-"
				_prefix = "", //camelCase vendor prefix like "O", "ms", "Webkit", or "Moz".
	
				// @private feed in a camelCase property name like "transform" and it will check to see if it is valid as-is or if it needs a vendor prefix. It returns the corrected camelCase property name (i.e. "WebkitTransform" or "MozTransform" or "transform" or null if no such property is found, like if the browser is IE8 or before, "transform" won't be found at all)
				_checkPropPrefix = function(p, e) {
					e = e || _tempDiv;
					var s = e.style,
						a, i;
					if (s[p] !== undefined) {
						return p;
					}
					p = p.charAt(0).toUpperCase() + p.substr(1);
					a = ["O","Moz","ms","Ms","Webkit"];
					i = 5;
					while (--i > -1 && s[a[i]+p] === undefined) { }
					if (i >= 0) {
						_prefix = (i === 3) ? "ms" : a[i];
						_prefixCSS = "-" + _prefix.toLowerCase() + "-";
						return _prefix + p;
					}
					return null;
				},
	
				_getComputedStyle = _doc.defaultView ? _doc.defaultView.getComputedStyle : function() {},
	
				/**
				 * @private Returns the css style for a particular property of an element. For example, to get whatever the current "left" css value for an element with an ID of "myElement", you could do:
				 * var currentLeft = CSSPlugin.getStyle( document.getElementById("myElement"), "left");
				 *
				 * @param {!Object} t Target element whose style property you want to query
				 * @param {!string} p Property name (like "left" or "top" or "marginTop", etc.)
				 * @param {Object=} cs Computed style object. This just provides a way to speed processing if you're going to get several properties on the same element in quick succession - you can reuse the result of the getComputedStyle() call.
				 * @param {boolean=} calc If true, the value will not be read directly from the element's "style" property (if it exists there), but instead the getComputedStyle() result will be used. This can be useful when you want to ensure that the browser itself is interpreting the value.
				 * @param {string=} dflt Default value that should be returned in the place of null, "none", "auto" or "auto auto".
				 * @return {?string} The current property value
				 */
				_getStyle = CSSPlugin.getStyle = function(t, p, cs, calc, dflt) {
					var rv;
					if (!_supportsOpacity) if (p === "opacity") { //several versions of IE don't use the standard "opacity" property - they use things like filter:alpha(opacity=50), so we parse that here.
						return _getIEOpacity(t);
					}
					if (!calc && t.style[p]) {
						rv = t.style[p];
					} else if ((cs = cs || _getComputedStyle(t))) {
						rv = cs[p] || cs.getPropertyValue(p) || cs.getPropertyValue(p.replace(_capsExp, "-$1").toLowerCase());
					} else if (t.currentStyle) {
						rv = t.currentStyle[p];
					}
					return (dflt != null && (!rv || rv === "none" || rv === "auto" || rv === "auto auto")) ? dflt : rv;
				},
	
				/**
				 * @private Pass the target element, the property name, the numeric value, and the suffix (like "%", "em", "px", etc.) and it will spit back the equivalent pixel number.
				 * @param {!Object} t Target element
				 * @param {!string} p Property name (like "left", "top", "marginLeft", etc.)
				 * @param {!number} v Value
				 * @param {string=} sfx Suffix (like "px" or "%" or "em")
				 * @param {boolean=} recurse If true, the call is a recursive one. In some browsers (like IE7/8), occasionally the value isn't accurately reported initially, but if we run the function again it will take effect.
				 * @return {number} value in pixels
				 */
				_convertToPixels = _internals.convertToPixels = function(t, p, v, sfx, recurse) {
					if (sfx === "px" || !sfx) { return v; }
					if (sfx === "auto" || !v) { return 0; }
					var horiz = _horizExp.test(p),
						node = t,
						style = _tempDiv.style,
						neg = (v < 0),
						precise = (v === 1),
						pix, cache, time;
					if (neg) {
						v = -v;
					}
					if (precise) {
						v *= 100;
					}
					if (sfx === "%" && p.indexOf("border") !== -1) {
						pix = (v / 100) * (horiz ? t.clientWidth : t.clientHeight);
					} else {
						style.cssText = "border:0 solid red;position:" + _getStyle(t, "position") + ";line-height:0;";
						if (sfx === "%" || !node.appendChild || sfx.charAt(0) === "v" || sfx === "rem") {
							node = t.parentNode || _doc.body;
							cache = node._gsCache;
							time = TweenLite.ticker.frame;
							if (cache && horiz && cache.time === time) { //performance optimization: we record the width of elements along with the ticker frame so that we can quickly get it again on the same tick (seems relatively safe to assume it wouldn't change on the same tick)
								return cache.width * v / 100;
							}
							style[(horiz ? "width" : "height")] = v + sfx;
						} else {
							style[(horiz ? "borderLeftWidth" : "borderTopWidth")] = v + sfx;
						}
						node.appendChild(_tempDiv);
						pix = parseFloat(_tempDiv[(horiz ? "offsetWidth" : "offsetHeight")]);
						node.removeChild(_tempDiv);
						if (horiz && sfx === "%" && CSSPlugin.cacheWidths !== false) {
							cache = node._gsCache = node._gsCache || {};
							cache.time = time;
							cache.width = pix / v * 100;
						}
						if (pix === 0 && !recurse) {
							pix = _convertToPixels(t, p, v, sfx, true);
						}
					}
					if (precise) {
						pix /= 100;
					}
					return neg ? -pix : pix;
				},
				_calculateOffset = _internals.calculateOffset = function(t, p, cs) { //for figuring out "top" or "left" in px when it's "auto". We need to factor in margin with the offsetLeft/offsetTop
					if (_getStyle(t, "position", cs) !== "absolute") { return 0; }
					var dim = ((p === "left") ? "Left" : "Top"),
						v = _getStyle(t, "margin" + dim, cs);
					return t["offset" + dim] - (_convertToPixels(t, p, parseFloat(v), v.replace(_suffixExp, "")) || 0);
				},
	
				// @private returns at object containing ALL of the style properties in camelCase and their associated values.
				_getAllStyles = function(t, cs) {
					var s = {},
						i, tr, p;
					if ((cs = cs || _getComputedStyle(t, null))) {
						if ((i = cs.length)) {
							while (--i > -1) {
								p = cs[i];
								if (p.indexOf("-transform") === -1 || _transformPropCSS === p) { //Some webkit browsers duplicate transform values, one non-prefixed and one prefixed ("transform" and "WebkitTransform"), so we must weed out the extra one here.
									s[p.replace(_camelExp, _camelFunc)] = cs.getPropertyValue(p);
								}
							}
						} else { //some browsers behave differently - cs.length is always 0, so we must do a for...in loop.
							for (i in cs) {
								if (i.indexOf("Transform") === -1 || _transformProp === i) { //Some webkit browsers duplicate transform values, one non-prefixed and one prefixed ("transform" and "WebkitTransform"), so we must weed out the extra one here.
									s[i] = cs[i];
								}
							}
						}
					} else if ((cs = t.currentStyle || t.style)) {
						for (i in cs) {
							if (typeof(i) === "string" && s[i] === undefined) {
								s[i.replace(_camelExp, _camelFunc)] = cs[i];
							}
						}
					}
					if (!_supportsOpacity) {
						s.opacity = _getIEOpacity(t);
					}
					tr = _getTransform(t, cs, false);
					s.rotation = tr.rotation;
					s.skewX = tr.skewX;
					s.scaleX = tr.scaleX;
					s.scaleY = tr.scaleY;
					s.x = tr.x;
					s.y = tr.y;
					if (_supports3D) {
						s.z = tr.z;
						s.rotationX = tr.rotationX;
						s.rotationY = tr.rotationY;
						s.scaleZ = tr.scaleZ;
					}
					if (s.filters) {
						delete s.filters;
					}
					return s;
				},
	
				// @private analyzes two style objects (as returned by _getAllStyles()) and only looks for differences between them that contain tweenable values (like a number or color). It returns an object with a "difs" property which refers to an object containing only those isolated properties and values for tweening, and a "firstMPT" property which refers to the first MiniPropTween instance in a linked list that recorded all the starting values of the different properties so that we can revert to them at the end or beginning of the tween - we don't want the cascading to get messed up. The forceLookup parameter is an optional generic object with properties that should be forced into the results - this is necessary for className tweens that are overwriting others because imagine a scenario where a rollover/rollout adds/removes a class and the user swipes the mouse over the target SUPER fast, thus nothing actually changed yet and the subsequent comparison of the properties would indicate they match (especially when px rounding is taken into consideration), thus no tweening is necessary even though it SHOULD tween and remove those properties after the tween (otherwise the inline styles will contaminate things). See the className SpecialProp code for details.
				_cssDif = function(t, s1, s2, vars, forceLookup) {
					var difs = {},
						style = t.style,
						val, p, mpt;
					for (p in s2) {
						if (p !== "cssText") if (p !== "length") if (isNaN(p)) if (s1[p] !== (val = s2[p]) || (forceLookup && forceLookup[p])) if (p.indexOf("Origin") === -1) if (typeof(val) === "number" || typeof(val) === "string") {
							difs[p] = (val === "auto" && (p === "left" || p === "top")) ? _calculateOffset(t, p) : ((val === "" || val === "auto" || val === "none") && typeof(s1[p]) === "string" && s1[p].replace(_NaNExp, "") !== "") ? 0 : val; //if the ending value is defaulting ("" or "auto"), we check the starting value and if it can be parsed into a number (a string which could have a suffix too, like 700px), then we swap in 0 for "" or "auto" so that things actually tween.
							if (style[p] !== undefined) { //for className tweens, we must remember which properties already existed inline - the ones that didn't should be removed when the tween isn't in progress because they were only introduced to facilitate the transition between classes.
								mpt = new MiniPropTween(style, p, style[p], mpt);
							}
						}
					}
					if (vars) {
						for (p in vars) { //copy properties (except className)
							if (p !== "className") {
								difs[p] = vars[p];
							}
						}
					}
					return {difs:difs, firstMPT:mpt};
				},
				_dimensions = {width:["Left","Right"], height:["Top","Bottom"]},
				_margins = ["marginLeft","marginRight","marginTop","marginBottom"],
	
				/**
				 * @private Gets the width or height of an element
				 * @param {!Object} t Target element
				 * @param {!string} p Property name ("width" or "height")
				 * @param {Object=} cs Computed style object (if one exists). Just a speed optimization.
				 * @return {number} Dimension (in pixels)
				 */
				_getDimension = function(t, p, cs) {
					if ((t.nodeName + "").toLowerCase() === "svg") { //Chrome no longer supports offsetWidth/offsetHeight on SVG elements.
						return (cs || _getComputedStyle(t))[p] || 0;
					} else if (t.getBBox && _isSVG(t)) {
						return t.getBBox()[p] || 0;
					}
					var v = parseFloat((p === "width") ? t.offsetWidth : t.offsetHeight),
						a = _dimensions[p],
						i = a.length;
					cs = cs || _getComputedStyle(t, null);
					while (--i > -1) {
						v -= parseFloat( _getStyle(t, "padding" + a[i], cs, true) ) || 0;
						v -= parseFloat( _getStyle(t, "border" + a[i] + "Width", cs, true) ) || 0;
					}
					return v;
				},
	
				// @private Parses position-related complex strings like "top left" or "50px 10px" or "70% 20%", etc. which are used for things like transformOrigin or backgroundPosition. Optionally decorates a supplied object (recObj) with the following properties: "ox" (offsetX), "oy" (offsetY), "oxp" (if true, "ox" is a percentage not a pixel value), and "oxy" (if true, "oy" is a percentage not a pixel value)
				_parsePosition = function(v, recObj) {
					if (v === "contain" || v === "auto" || v === "auto auto") {
						return v + " ";
					}
					if (v == null || v === "") { //note: Firefox uses "auto auto" as default whereas Chrome uses "auto".
						v = "0 0";
					}
					var a = v.split(" "),
						x = (v.indexOf("left") !== -1) ? "0%" : (v.indexOf("right") !== -1) ? "100%" : a[0],
						y = (v.indexOf("top") !== -1) ? "0%" : (v.indexOf("bottom") !== -1) ? "100%" : a[1],
						i;
					if (a.length > 3 && !recObj) { //multiple positions
						a = v.split(", ").join(",").split(",");
						v = [];
						for (i = 0; i < a.length; i++) {
							v.push(_parsePosition(a[i]));
						}
						return v.join(",");
					}
					if (y == null) {
						y = (x === "center") ? "50%" : "0";
					} else if (y === "center") {
						y = "50%";
					}
					if (x === "center" || (isNaN(parseFloat(x)) && (x + "").indexOf("=") === -1)) { //remember, the user could flip-flop the values and say "bottom center" or "center bottom", etc. "center" is ambiguous because it could be used to describe horizontal or vertical, hence the isNaN(). If there's an "=" sign in the value, it's relative.
						x = "50%";
					}
					v = x + " " + y + ((a.length > 2) ? " " + a[2] : "");
					if (recObj) {
						recObj.oxp = (x.indexOf("%") !== -1);
						recObj.oyp = (y.indexOf("%") !== -1);
						recObj.oxr = (x.charAt(1) === "=");
						recObj.oyr = (y.charAt(1) === "=");
						recObj.ox = parseFloat(x.replace(_NaNExp, ""));
						recObj.oy = parseFloat(y.replace(_NaNExp, ""));
						recObj.v = v;
					}
					return recObj || v;
				},
	
				/**
				 * @private Takes an ending value (typically a string, but can be a number) and a starting value and returns the change between the two, looking for relative value indicators like += and -= and it also ignores suffixes (but make sure the ending value starts with a number or +=/-= and that the starting value is a NUMBER!)
				 * @param {(number|string)} e End value which is typically a string, but could be a number
				 * @param {(number|string)} b Beginning value which is typically a string but could be a number
				 * @return {number} Amount of change between the beginning and ending values (relative values that have a "+=" or "-=" are recognized)
				 */
				_parseChange = function(e, b) {
					return (typeof(e) === "string" && e.charAt(1) === "=") ? parseInt(e.charAt(0) + "1", 10) * parseFloat(e.substr(2)) : (parseFloat(e) - parseFloat(b)) || 0;
				},
	
				/**
				 * @private Takes a value and a default number, checks if the value is relative, null, or numeric and spits back a normalized number accordingly. Primarily used in the _parseTransform() function.
				 * @param {Object} v Value to be parsed
				 * @param {!number} d Default value (which is also used for relative calculations if "+=" or "-=" is found in the first parameter)
				 * @return {number} Parsed value
				 */
				_parseVal = function(v, d) {
					return (v == null) ? d : (typeof(v) === "string" && v.charAt(1) === "=") ? parseInt(v.charAt(0) + "1", 10) * parseFloat(v.substr(2)) + d : parseFloat(v) || 0;
				},
	
				/**
				 * @private Translates strings like "40deg" or "40" or 40rad" or "+=40deg" or "270_short" or "-90_cw" or "+=45_ccw" to a numeric radian angle. Of course a starting/default value must be fed in too so that relative values can be calculated properly.
				 * @param {Object} v Value to be parsed
				 * @param {!number} d Default value (which is also used for relative calculations if "+=" or "-=" is found in the first parameter)
				 * @param {string=} p property name for directionalEnd (optional - only used when the parsed value is directional ("_short", "_cw", or "_ccw" suffix). We need a way to store the uncompensated value so that at the end of the tween, we set it to exactly what was requested with no directional compensation). Property name would be "rotation", "rotationX", or "rotationY"
				 * @param {Object=} directionalEnd An object that will store the raw end values for directional angles ("_short", "_cw", or "_ccw" suffix). We need a way to store the uncompensated value so that at the end of the tween, we set it to exactly what was requested with no directional compensation.
				 * @return {number} parsed angle in radians
				 */
				_parseAngle = function(v, d, p, directionalEnd) {
					var min = 0.000001,
						cap, split, dif, result, isRelative;
					if (v == null) {
						result = d;
					} else if (typeof(v) === "number") {
						result = v;
					} else {
						cap = 360;
						split = v.split("_");
						isRelative = (v.charAt(1) === "=");
						dif = (isRelative ? parseInt(v.charAt(0) + "1", 10) * parseFloat(split[0].substr(2)) : parseFloat(split[0])) * ((v.indexOf("rad") === -1) ? 1 : _RAD2DEG) - (isRelative ? 0 : d);
						if (split.length) {
							if (directionalEnd) {
								directionalEnd[p] = d + dif;
							}
							if (v.indexOf("short") !== -1) {
								dif = dif % cap;
								if (dif !== dif % (cap / 2)) {
									dif = (dif < 0) ? dif + cap : dif - cap;
								}
							}
							if (v.indexOf("_cw") !== -1 && dif < 0) {
								dif = ((dif + cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
							} else if (v.indexOf("ccw") !== -1 && dif > 0) {
								dif = ((dif - cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
							}
						}
						result = d + dif;
					}
					if (result < min && result > -min) {
						result = 0;
					}
					return result;
				},
	
				_colorLookup = {aqua:[0,255,255],
					lime:[0,255,0],
					silver:[192,192,192],
					black:[0,0,0],
					maroon:[128,0,0],
					teal:[0,128,128],
					blue:[0,0,255],
					navy:[0,0,128],
					white:[255,255,255],
					fuchsia:[255,0,255],
					olive:[128,128,0],
					yellow:[255,255,0],
					orange:[255,165,0],
					gray:[128,128,128],
					purple:[128,0,128],
					green:[0,128,0],
					red:[255,0,0],
					pink:[255,192,203],
					cyan:[0,255,255],
					transparent:[255,255,255,0]},
	
				_hue = function(h, m1, m2) {
					h = (h < 0) ? h + 1 : (h > 1) ? h - 1 : h;
					return ((((h * 6 < 1) ? m1 + (m2 - m1) * h * 6 : (h < 0.5) ? m2 : (h * 3 < 2) ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * 255) + 0.5) | 0;
				},
	
				/**
				 * @private Parses a color (like #9F0, #FF9900, rgb(255,51,153) or hsl(108, 50%, 10%)) into an array with 3 elements for red, green, and blue or if toHSL parameter is true, it will populate the array with hue, saturation, and lightness values. If a relative value is found in an hsl() or hsla() string, it will preserve those relative prefixes and all the values in the array will be strings instead of numbers (in all other cases it will be populated with numbers).
				 * @param {(string|number)} v The value the should be parsed which could be a string like #9F0 or rgb(255,102,51) or rgba(255,0,0,0.5) or it could be a number like 0xFF00CC or even a named color like red, blue, purple, etc.
				 * @param {(boolean)} toHSL If true, an hsl() or hsla() value will be returned instead of rgb() or rgba()
				 * @return {Array.<number>} An array containing red, green, and blue (and optionally alpha) in that order, or if the toHSL parameter was true, the array will contain hue, saturation and lightness (and optionally alpha) in that order. Always numbers unless there's a relative prefix found in an hsl() or hsla() string and toHSL is true.
				 */
				_parseColor = CSSPlugin.parseColor = function(v, toHSL) {
					var a, r, g, b, h, s, l, max, min, d, wasHSL;
					if (!v) {
						a = _colorLookup.black;
					} else if (typeof(v) === "number") {
						a = [v >> 16, (v >> 8) & 255, v & 255];
					} else {
						if (v.charAt(v.length - 1) === ",") { //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
							v = v.substr(0, v.length - 1);
						}
						if (_colorLookup[v]) {
							a = _colorLookup[v];
						} else if (v.charAt(0) === "#") {
							if (v.length === 4) { //for shorthand like #9F0
								r = v.charAt(1);
								g = v.charAt(2);
								b = v.charAt(3);
								v = "#" + r + r + g + g + b + b;
							}
							v = parseInt(v.substr(1), 16);
							a = [v >> 16, (v >> 8) & 255, v & 255];
						} else if (v.substr(0, 3) === "hsl") {
							a = wasHSL = v.match(_numExp);
							if (!toHSL) {
								h = (Number(a[0]) % 360) / 360;
								s = Number(a[1]) / 100;
								l = Number(a[2]) / 100;
								g = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
								r = l * 2 - g;
								if (a.length > 3) {
									a[3] = Number(v[3]);
								}
								a[0] = _hue(h + 1 / 3, r, g);
								a[1] = _hue(h, r, g);
								a[2] = _hue(h - 1 / 3, r, g);
							} else if (v.indexOf("=") !== -1) { //if relative values are found, just return the raw strings with the relative prefixes in place.
								return v.match(_relNumExp);
							}
						} else {
							a = v.match(_numExp) || _colorLookup.transparent;
						}
						a[0] = Number(a[0]);
						a[1] = Number(a[1]);
						a[2] = Number(a[2]);
						if (a.length > 3) {
							a[3] = Number(a[3]);
						}
					}
					if (toHSL && !wasHSL) {
						r = a[0] / 255;
						g = a[1] / 255;
						b = a[2] / 255;
						max = Math.max(r, g, b);
						min = Math.min(r, g, b);
						l = (max + min) / 2;
						if (max === min) {
							h = s = 0;
						} else {
							d = max - min;
							s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
							h = (max === r) ? (g - b) / d + (g < b ? 6 : 0) : (max === g) ? (b - r) / d + 2 : (r - g) / d + 4;
							h *= 60;
						}
						a[0] = (h + 0.5) | 0;
						a[1] = (s * 100 + 0.5) | 0;
						a[2] = (l * 100 + 0.5) | 0;
					}
					return a;
				},
				_formatColors = function(s, toHSL) {
					var colors = s.match(_colorExp) || [],
						charIndex = 0,
						parsed = colors.length ? "" : s,
						i, color, temp;
					for (i = 0; i < colors.length; i++) {
						color = colors[i];
						temp = s.substr(charIndex, s.indexOf(color, charIndex)-charIndex);
						charIndex += temp.length + color.length;
						color = _parseColor(color, toHSL);
						if (color.length === 3) {
							color.push(1);
						}
						parsed += temp + (toHSL ? "hsla(" + color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : "rgba(" + color.join(",")) + ")";
					}
					return parsed + s.substr(charIndex);
				},
				_colorExp = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b"; //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.
	
			for (p in _colorLookup) {
				_colorExp += "|" + p + "\\b";
			}
			_colorExp = new RegExp(_colorExp+")", "gi");
	
			CSSPlugin.colorStringFilter = function(a) {
				var combined = a[0] + a[1],
					toHSL;
				if (_colorExp.test(combined)) {
					toHSL = (combined.indexOf("hsl(") !== -1 || combined.indexOf("hsla(") !== -1);
					a[0] = _formatColors(a[0], toHSL);
					a[1] = _formatColors(a[1], toHSL);
				}
				_colorExp.lastIndex = 0;
			};
	
			if (!TweenLite.defaultStringFilter) {
				TweenLite.defaultStringFilter = CSSPlugin.colorStringFilter;
			}
	
			/**
			 * @private Returns a formatter function that handles taking a string (or number in some cases) and returning a consistently formatted one in terms of delimiters, quantity of values, etc. For example, we may get boxShadow values defined as "0px red" or "0px 0px 10px rgb(255,0,0)" or "0px 0px 20px 20px #F00" and we need to ensure that what we get back is described with 4 numbers and a color. This allows us to feed it into the _parseComplex() method and split the values up appropriately. The neat thing about this _getFormatter() function is that the dflt defines a pattern as well as a default, so for example, _getFormatter("0px 0px 0px 0px #777", true) not only sets the default as 0px for all distances and #777 for the color, but also sets the pattern such that 4 numbers and a color will always get returned.
			 * @param {!string} dflt The default value and pattern to follow. So "0px 0px 0px 0px #777" will ensure that 4 numbers and a color will always get returned.
			 * @param {boolean=} clr If true, the values should be searched for color-related data. For example, boxShadow values typically contain a color whereas borderRadius don't.
			 * @param {boolean=} collapsible If true, the value is a top/left/right/bottom style one that acts like margin or padding, where if only one value is received, it's used for all 4; if 2 are received, the first is duplicated for 3rd (bottom) and the 2nd is duplicated for the 4th spot (left), etc.
			 * @return {Function} formatter function
			 */
			var _getFormatter = function(dflt, clr, collapsible, multi) {
					if (dflt == null) {
						return function(v) {return v;};
					}
					var dColor = clr ? (dflt.match(_colorExp) || [""])[0] : "",
						dVals = dflt.split(dColor).join("").match(_valuesExp) || [],
						pfx = dflt.substr(0, dflt.indexOf(dVals[0])),
						sfx = (dflt.charAt(dflt.length - 1) === ")") ? ")" : "",
						delim = (dflt.indexOf(" ") !== -1) ? " " : ",",
						numVals = dVals.length,
						dSfx = (numVals > 0) ? dVals[0].replace(_numExp, "") : "",
						formatter;
					if (!numVals) {
						return function(v) {return v;};
					}
					if (clr) {
						formatter = function(v) {
							var color, vals, i, a;
							if (typeof(v) === "number") {
								v += dSfx;
							} else if (multi && _commasOutsideParenExp.test(v)) {
								a = v.replace(_commasOutsideParenExp, "|").split("|");
								for (i = 0; i < a.length; i++) {
									a[i] = formatter(a[i]);
								}
								return a.join(",");
							}
							color = (v.match(_colorExp) || [dColor])[0];
							vals = v.split(color).join("").match(_valuesExp) || [];
							i = vals.length;
							if (numVals > i--) {
								while (++i < numVals) {
									vals[i] = collapsible ? vals[(((i - 1) / 2) | 0)] : dVals[i];
								}
							}
							return pfx + vals.join(delim) + delim + color + sfx + (v.indexOf("inset") !== -1 ? " inset" : "");
						};
						return formatter;
	
					}
					formatter = function(v) {
						var vals, a, i;
						if (typeof(v) === "number") {
							v += dSfx;
						} else if (multi && _commasOutsideParenExp.test(v)) {
							a = v.replace(_commasOutsideParenExp, "|").split("|");
							for (i = 0; i < a.length; i++) {
								a[i] = formatter(a[i]);
							}
							return a.join(",");
						}
						vals = v.match(_valuesExp) || [];
						i = vals.length;
						if (numVals > i--) {
							while (++i < numVals) {
								vals[i] = collapsible ? vals[(((i - 1) / 2) | 0)] : dVals[i];
							}
						}
						return pfx + vals.join(delim) + sfx;
					};
					return formatter;
				},
	
				/**
				 * @private returns a formatter function that's used for edge-related values like marginTop, marginLeft, paddingBottom, paddingRight, etc. Just pass a comma-delimited list of property names related to the edges.
				 * @param {!string} props a comma-delimited list of property names in order from top to left, like "marginTop,marginRight,marginBottom,marginLeft"
				 * @return {Function} a formatter function
				 */
				_getEdgeParser = function(props) {
					props = props.split(",");
					return function(t, e, p, cssp, pt, plugin, vars) {
						var a = (e + "").split(" "),
							i;
						vars = {};
						for (i = 0; i < 4; i++) {
							vars[props[i]] = a[i] = a[i] || a[(((i - 1) / 2) >> 0)];
						}
						return cssp.parse(t, vars, pt, plugin);
					};
				},
	
				// @private used when other plugins must tween values first, like BezierPlugin or ThrowPropsPlugin, etc. That plugin's setRatio() gets called first so that the values are updated, and then we loop through the MiniPropTweens  which handle copying the values into their appropriate slots so that they can then be applied correctly in the main CSSPlugin setRatio() method. Remember, we typically create a proxy object that has a bunch of uniquely-named properties that we feed to the sub-plugin and it does its magic normally, and then we must interpret those values and apply them to the css because often numbers must get combined/concatenated, suffixes added, etc. to work with css, like boxShadow could have 4 values plus a color.
				_setPluginRatio = _internals._setPluginRatio = function(v) {
					this.plugin.setRatio(v);
					var d = this.data,
						proxy = d.proxy,
						mpt = d.firstMPT,
						min = 0.000001,
						val, pt, i, str, p;
					while (mpt) {
						val = proxy[mpt.v];
						if (mpt.r) {
							val = Math.round(val);
						} else if (val < min && val > -min) {
							val = 0;
						}
						mpt.t[mpt.p] = val;
						mpt = mpt._next;
					}
					if (d.autoRotate) {
						d.autoRotate.rotation = proxy.rotation;
					}
					//at the end, we must set the CSSPropTween's "e" (end) value dynamically here because that's what is used in the final setRatio() method. Same for "b" at the beginning.
					if (v === 1 || v === 0) {
						mpt = d.firstMPT;
						p = (v === 1) ? "e" : "b";
						while (mpt) {
							pt = mpt.t;
							if (!pt.type) {
								pt[p] = pt.s + pt.xs0;
							} else if (pt.type === 1) {
								str = pt.xs0 + pt.s + pt.xs1;
								for (i = 1; i < pt.l; i++) {
									str += pt["xn"+i] + pt["xs"+(i+1)];
								}
								pt[p] = str;
							}
							mpt = mpt._next;
						}
					}
				},
	
				/**
				 * @private @constructor Used by a few SpecialProps to hold important values for proxies. For example, _parseToProxy() creates a MiniPropTween instance for each property that must get tweened on the proxy, and we record the original property name as well as the unique one we create for the proxy, plus whether or not the value needs to be rounded plus the original value.
				 * @param {!Object} t target object whose property we're tweening (often a CSSPropTween)
				 * @param {!string} p property name
				 * @param {(number|string|object)} v value
				 * @param {MiniPropTween=} next next MiniPropTween in the linked list
				 * @param {boolean=} r if true, the tweened value should be rounded to the nearest integer
				 */
				MiniPropTween = function(t, p, v, next, r) {
					this.t = t;
					this.p = p;
					this.v = v;
					this.r = r;
					if (next) {
						next._prev = this;
						this._next = next;
					}
				},
	
				/**
				 * @private Most other plugins (like BezierPlugin and ThrowPropsPlugin and others) can only tween numeric values, but CSSPlugin must accommodate special values that have a bunch of extra data (like a suffix or strings between numeric values, etc.). For example, boxShadow has values like "10px 10px 20px 30px rgb(255,0,0)" which would utterly confuse other plugins. This method allows us to split that data apart and grab only the numeric data and attach it to uniquely-named properties of a generic proxy object ({}) so that we can feed that to virtually any plugin to have the numbers tweened. However, we must also keep track of which properties from the proxy go with which CSSPropTween values and instances. So we create a linked list of MiniPropTweens. Each one records a target (the original CSSPropTween), property (like "s" or "xn1" or "xn2") that we're tweening and the unique property name that was used for the proxy (like "boxShadow_xn1" and "boxShadow_xn2") and whether or not they need to be rounded. That way, in the _setPluginRatio() method we can simply copy the values over from the proxy to the CSSPropTween instance(s). Then, when the main CSSPlugin setRatio() method runs and applies the CSSPropTween values accordingly, they're updated nicely. So the external plugin tweens the numbers, _setPluginRatio() copies them over, and setRatio() acts normally, applying css-specific values to the element.
				 * This method returns an object that has the following properties:
				 *  - proxy: a generic object containing the starting values for all the properties that will be tweened by the external plugin.  This is what we feed to the external _onInitTween() as the target
				 *  - end: a generic object containing the ending values for all the properties that will be tweened by the external plugin. This is what we feed to the external plugin's _onInitTween() as the destination values
				 *  - firstMPT: the first MiniPropTween in the linked list
				 *  - pt: the first CSSPropTween in the linked list that was created when parsing. If shallow is true, this linked list will NOT attach to the one passed into the _parseToProxy() as the "pt" (4th) parameter.
				 * @param {!Object} t target object to be tweened
				 * @param {!(Object|string)} vars the object containing the information about the tweening values (typically the end/destination values) that should be parsed
				 * @param {!CSSPlugin} cssp The CSSPlugin instance
				 * @param {CSSPropTween=} pt the next CSSPropTween in the linked list
				 * @param {TweenPlugin=} plugin the external TweenPlugin instance that will be handling tweening the numeric values
				 * @param {boolean=} shallow if true, the resulting linked list from the parse will NOT be attached to the CSSPropTween that was passed in as the "pt" (4th) parameter.
				 * @return An object containing the following properties: proxy, end, firstMPT, and pt (see above for descriptions)
				 */
				_parseToProxy = _internals._parseToProxy = function(t, vars, cssp, pt, plugin, shallow) {
					var bpt = pt,
						start = {},
						end = {},
						transform = cssp._transform,
						oldForce = _forcePT,
						i, p, xp, mpt, firstPT;
					cssp._transform = null;
					_forcePT = vars;
					pt = firstPT = cssp.parse(t, vars, pt, plugin);
					_forcePT = oldForce;
					//break off from the linked list so the new ones are isolated.
					if (shallow) {
						cssp._transform = transform;
						if (bpt) {
							bpt._prev = null;
							if (bpt._prev) {
								bpt._prev._next = null;
							}
						}
					}
					while (pt && pt !== bpt) {
						if (pt.type <= 1) {
							p = pt.p;
							end[p] = pt.s + pt.c;
							start[p] = pt.s;
							if (!shallow) {
								mpt = new MiniPropTween(pt, "s", p, mpt, pt.r);
								pt.c = 0;
							}
							if (pt.type === 1) {
								i = pt.l;
								while (--i > 0) {
									xp = "xn" + i;
									p = pt.p + "_" + xp;
									end[p] = pt.data[xp];
									start[p] = pt[xp];
									if (!shallow) {
										mpt = new MiniPropTween(pt, xp, p, mpt, pt.rxp[xp]);
									}
								}
							}
						}
						pt = pt._next;
					}
					return {proxy:start, end:end, firstMPT:mpt, pt:firstPT};
				},
	
	
	
				/**
				 * @constructor Each property that is tweened has at least one CSSPropTween associated with it. These instances store important information like the target, property, starting value, amount of change, etc. They can also optionally have a number of "extra" strings and numeric values named xs1, xn1, xs2, xn2, xs3, xn3, etc. where "s" indicates string and "n" indicates number. These can be pieced together in a complex-value tween (type:1) that has alternating types of data like a string, number, string, number, etc. For example, boxShadow could be "5px 5px 8px rgb(102, 102, 51)". In that value, there are 6 numbers that may need to tween and then pieced back together into a string again with spaces, suffixes, etc. xs0 is special in that it stores the suffix for standard (type:0) tweens, -OR- the first string (prefix) in a complex-value (type:1) CSSPropTween -OR- it can be the non-tweening value in a type:-1 CSSPropTween. We do this to conserve memory.
				 * CSSPropTweens have the following optional properties as well (not defined through the constructor):
				 *  - l: Length in terms of the number of extra properties that the CSSPropTween has (default: 0). For example, for a boxShadow we may need to tween 5 numbers in which case l would be 5; Keep in mind that the start/end values for the first number that's tweened are always stored in the s and c properties to conserve memory. All additional values thereafter are stored in xn1, xn2, etc.
				 *  - xfirst: The first instance of any sub-CSSPropTweens that are tweening properties of this instance. For example, we may split up a boxShadow tween so that there's a main CSSPropTween of type:1 that has various xs* and xn* values associated with the h-shadow, v-shadow, blur, color, etc. Then we spawn a CSSPropTween for each of those that has a higher priority and runs BEFORE the main CSSPropTween so that the values are all set by the time it needs to re-assemble them. The xfirst gives us an easy way to identify the first one in that chain which typically ends at the main one (because they're all prepende to the linked list)
				 *  - plugin: The TweenPlugin instance that will handle the tweening of any complex values. For example, sometimes we don't want to use normal subtweens (like xfirst refers to) to tween the values - we might want ThrowPropsPlugin or BezierPlugin some other plugin to do the actual tweening, so we create a plugin instance and store a reference here. We need this reference so that if we get a request to round values or disable a tween, we can pass along that request.
				 *  - data: Arbitrary data that needs to be stored with the CSSPropTween. Typically if we're going to have a plugin handle the tweening of a complex-value tween, we create a generic object that stores the END values that we're tweening to and the CSSPropTween's xs1, xs2, etc. have the starting values. We store that object as data. That way, we can simply pass that object to the plugin and use the CSSPropTween as the target.
				 *  - setRatio: Only used for type:2 tweens that require custom functionality. In this case, we call the CSSPropTween's setRatio() method and pass the ratio each time the tween updates. This isn't quite as efficient as doing things directly in the CSSPlugin's setRatio() method, but it's very convenient and flexible.
				 * @param {!Object} t Target object whose property will be tweened. Often a DOM element, but not always. It could be anything.
				 * @param {string} p Property to tween (name). For example, to tween element.width, p would be "width".
				 * @param {number} s Starting numeric value
				 * @param {number} c Change in numeric value over the course of the entire tween. For example, if element.width starts at 5 and should end at 100, c would be 95.
				 * @param {CSSPropTween=} next The next CSSPropTween in the linked list. If one is defined, we will define its _prev as the new instance, and the new instance's _next will be pointed at it.
				 * @param {number=} type The type of CSSPropTween where -1 = a non-tweening value, 0 = a standard simple tween, 1 = a complex value (like one that has multiple numbers in a comma- or space-delimited string like border:"1px solid red"), and 2 = one that uses a custom setRatio function that does all of the work of applying the values on each update.
				 * @param {string=} n Name of the property that should be used for overwriting purposes which is typically the same as p but not always. For example, we may need to create a subtween for the 2nd part of a "clip:rect(...)" tween in which case "p" might be xs1 but "n" is still "clip"
				 * @param {boolean=} r If true, the value(s) should be rounded
				 * @param {number=} pr Priority in the linked list order. Higher priority CSSPropTweens will be updated before lower priority ones. The default priority is 0.
				 * @param {string=} b Beginning value. We store this to ensure that it is EXACTLY what it was when the tween began without any risk of interpretation issues.
				 * @param {string=} e Ending value. We store this to ensure that it is EXACTLY what the user defined at the end of the tween without any risk of interpretation issues.
				 */
				CSSPropTween = _internals.CSSPropTween = function(t, p, s, c, next, type, n, r, pr, b, e) {
					this.t = t; //target
					this.p = p; //property
					this.s = s; //starting value
					this.c = c; //change value
					this.n = n || p; //name that this CSSPropTween should be associated to (usually the same as p, but not always - n is what overwriting looks at)
					if (!(t instanceof CSSPropTween)) {
						_overwriteProps.push(this.n);
					}
					this.r = r; //round (boolean)
					this.type = type || 0; //0 = normal tween, -1 = non-tweening (in which case xs0 will be applied to the target's property, like tp.t[tp.p] = tp.xs0), 1 = complex-value SpecialProp, 2 = custom setRatio() that does all the work
					if (pr) {
						this.pr = pr;
						_hasPriority = true;
					}
					this.b = (b === undefined) ? s : b;
					this.e = (e === undefined) ? s + c : e;
					if (next) {
						this._next = next;
						next._prev = this;
					}
				},
	
				_addNonTweeningNumericPT = function(target, prop, start, end, next, overwriteProp) { //cleans up some code redundancies and helps minification. Just a fast way to add a NUMERIC non-tweening CSSPropTween
					var pt = new CSSPropTween(target, prop, start, end - start, next, -1, overwriteProp);
					pt.b = start;
					pt.e = pt.xs0 = end;
					return pt;
				},
	
				/**
				 * Takes a target, the beginning value and ending value (as strings) and parses them into a CSSPropTween (possibly with child CSSPropTweens) that accommodates multiple numbers, colors, comma-delimited values, etc. For example:
				 * sp.parseComplex(element, "boxShadow", "5px 10px 20px rgb(255,102,51)", "0px 0px 0px red", true, "0px 0px 0px rgb(0,0,0,0)", pt);
				 * It will walk through the beginning and ending values (which should be in the same format with the same number and type of values) and figure out which parts are numbers, what strings separate the numeric/tweenable values, and then create the CSSPropTweens accordingly. If a plugin is defined, no child CSSPropTweens will be created. Instead, the ending values will be stored in the "data" property of the returned CSSPropTween like: {s:-5, xn1:-10, xn2:-20, xn3:255, xn4:0, xn5:0} so that it can be fed to any other plugin and it'll be plain numeric tweens but the recomposition of the complex value will be handled inside CSSPlugin's setRatio().
				 * If a setRatio is defined, the type of the CSSPropTween will be set to 2 and recomposition of the values will be the responsibility of that method.
				 *
				 * @param {!Object} t Target whose property will be tweened
				 * @param {!string} p Property that will be tweened (its name, like "left" or "backgroundColor" or "boxShadow")
				 * @param {string} b Beginning value
				 * @param {string} e Ending value
				 * @param {boolean} clrs If true, the value could contain a color value like "rgb(255,0,0)" or "#F00" or "red". The default is false, so no colors will be recognized (a performance optimization)
				 * @param {(string|number|Object)} dflt The default beginning value that should be used if no valid beginning value is defined or if the number of values inside the complex beginning and ending values don't match
				 * @param {?CSSPropTween} pt CSSPropTween instance that is the current head of the linked list (we'll prepend to this).
				 * @param {number=} pr Priority in the linked list order. Higher priority properties will be updated before lower priority ones. The default priority is 0.
				 * @param {TweenPlugin=} plugin If a plugin should handle the tweening of extra properties, pass the plugin instance here. If one is defined, then NO subtweens will be created for any extra properties (the properties will be created - just not additional CSSPropTween instances to tween them) because the plugin is expected to do so. However, the end values WILL be populated in the "data" property, like {s:100, xn1:50, xn2:300}
				 * @param {function(number)=} setRatio If values should be set in a custom function instead of being pieced together in a type:1 (complex-value) CSSPropTween, define that custom function here.
				 * @return {CSSPropTween} The first CSSPropTween in the linked list which includes the new one(s) added by the parseComplex() call.
				 */
				_parseComplex = CSSPlugin.parseComplex = function(t, p, b, e, clrs, dflt, pt, pr, plugin, setRatio) {
					//DEBUG: _log("parseComplex: "+p+", b: "+b+", e: "+e);
					b = b || dflt || "";
					pt = new CSSPropTween(t, p, 0, 0, pt, (setRatio ? 2 : 1), null, false, pr, b, e);
					e += ""; //ensures it's a string
					if (clrs && _colorExp.test(e + b)) { //if colors are found, normalize the formatting to rgba() or hsla().
						e = [b, e];
						CSSPlugin.colorStringFilter(e);
						b = e[0];
						e = e[1];
					}
					var ba = b.split(", ").join(",").split(" "), //beginning array
						ea = e.split(", ").join(",").split(" "), //ending array
						l = ba.length,
						autoRound = (_autoRound !== false),
						i, xi, ni, bv, ev, bnums, enums, bn, hasAlpha, temp, cv, str, useHSL;
					if (e.indexOf(",") !== -1 || b.indexOf(",") !== -1) {
						ba = ba.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
						ea = ea.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
						l = ba.length;
					}
					if (l !== ea.length) {
						//DEBUG: _log("mismatched formatting detected on " + p + " (" + b + " vs " + e + ")");
						ba = (dflt || "").split(" ");
						l = ba.length;
					}
					pt.plugin = plugin;
					pt.setRatio = setRatio;
					_colorExp.lastIndex = 0;
					for (i = 0; i < l; i++) {
						bv = ba[i];
						ev = ea[i];
						bn = parseFloat(bv);
						//if the value begins with a number (most common). It's fine if it has a suffix like px
						if (bn || bn === 0) {
							pt.appendXtra("", bn, _parseChange(ev, bn), ev.replace(_relNumExp, ""), (autoRound && ev.indexOf("px") !== -1), true);
	
						//if the value is a color
						} else if (clrs && _colorExp.test(bv)) {
							str = ev.indexOf(")") + 1;
							str = ")" + (str ? ev.substr(str) : ""); //if there's a comma or ) at the end, retain it.
							useHSL = (ev.indexOf("hsl") !== -1 && _supportsOpacity);
							bv = _parseColor(bv, useHSL);
							ev = _parseColor(ev, useHSL);
							hasAlpha = (bv.length + ev.length > 6);
							if (hasAlpha && !_supportsOpacity && ev[3] === 0) { //older versions of IE don't support rgba(), so if the destination alpha is 0, just use "transparent" for the end color
								pt["xs" + pt.l] += pt.l ? " transparent" : "transparent";
								pt.e = pt.e.split(ea[i]).join("transparent");
							} else {
								if (!_supportsOpacity) { //old versions of IE don't support rgba().
									hasAlpha = false;
								}
								if (useHSL) {
									pt.appendXtra((hasAlpha ? "hsla(" : "hsl("), bv[0], _parseChange(ev[0], bv[0]), ",", false, true)
										.appendXtra("", bv[1], _parseChange(ev[1], bv[1]), "%,", false)
										.appendXtra("", bv[2], _parseChange(ev[2], bv[2]), (hasAlpha ? "%," : "%" + str), false);
								} else {
									pt.appendXtra((hasAlpha ? "rgba(" : "rgb("), bv[0], ev[0] - bv[0], ",", true, true)
										.appendXtra("", bv[1], ev[1] - bv[1], ",", true)
										.appendXtra("", bv[2], ev[2] - bv[2], (hasAlpha ? "," : str), true);
								}
	
								if (hasAlpha) {
									bv = (bv.length < 4) ? 1 : bv[3];
									pt.appendXtra("", bv, ((ev.length < 4) ? 1 : ev[3]) - bv, str, false);
								}
							}
							_colorExp.lastIndex = 0; //otherwise the test() on the RegExp could move the lastIndex and taint future results.
	
						} else {
							bnums = bv.match(_numExp); //gets each group of numbers in the beginning value string and drops them into an array
	
							//if no number is found, treat it as a non-tweening value and just append the string to the current xs.
							if (!bnums) {
								pt["xs" + pt.l] += (pt.l || pt["xs" + pt.l]) ? " " + ev : ev;
	
							//loop through all the numbers that are found and construct the extra values on the pt.
							} else {
								enums = ev.match(_relNumExp); //get each group of numbers in the end value string and drop them into an array. We allow relative values too, like +=50 or -=.5
								if (!enums || enums.length !== bnums.length) {
									//DEBUG: _log("mismatched formatting detected on " + p + " (" + b + " vs " + e + ")");
									return pt;
								}
								ni = 0;
								for (xi = 0; xi < bnums.length; xi++) {
									cv = bnums[xi];
									temp = bv.indexOf(cv, ni);
									pt.appendXtra(bv.substr(ni, temp - ni), Number(cv), _parseChange(enums[xi], cv), "", (autoRound && bv.substr(temp + cv.length, 2) === "px"), (xi === 0));
									ni = temp + cv.length;
								}
								pt["xs" + pt.l] += bv.substr(ni);
							}
						}
					}
					//if there are relative values ("+=" or "-=" prefix), we need to adjust the ending value to eliminate the prefixes and combine the values properly.
					if (e.indexOf("=") !== -1) if (pt.data) {
						str = pt.xs0 + pt.data.s;
						for (i = 1; i < pt.l; i++) {
							str += pt["xs" + i] + pt.data["xn" + i];
						}
						pt.e = str + pt["xs" + i];
					}
					if (!pt.l) {
						pt.type = -1;
						pt.xs0 = pt.e;
					}
					return pt.xfirst || pt;
				},
				i = 9;
	
	
			p = CSSPropTween.prototype;
			p.l = p.pr = 0; //length (number of extra properties like xn1, xn2, xn3, etc.
			while (--i > 0) {
				p["xn" + i] = 0;
				p["xs" + i] = "";
			}
			p.xs0 = "";
			p._next = p._prev = p.xfirst = p.data = p.plugin = p.setRatio = p.rxp = null;
	
	
			/**
			 * Appends and extra tweening value to a CSSPropTween and automatically manages any prefix and suffix strings. The first extra value is stored in the s and c of the main CSSPropTween instance, but thereafter any extras are stored in the xn1, xn2, xn3, etc. The prefixes and suffixes are stored in the xs0, xs1, xs2, etc. properties. For example, if I walk through a clip value like "rect(10px, 5px, 0px, 20px)", the values would be stored like this:
			 * xs0:"rect(", s:10, xs1:"px, ", xn1:5, xs2:"px, ", xn2:0, xs3:"px, ", xn3:20, xn4:"px)"
			 * And they'd all get joined together when the CSSPlugin renders (in the setRatio() method).
			 * @param {string=} pfx Prefix (if any)
			 * @param {!number} s Starting value
			 * @param {!number} c Change in numeric value over the course of the entire tween. For example, if the start is 5 and the end is 100, the change would be 95.
			 * @param {string=} sfx Suffix (if any)
			 * @param {boolean=} r Round (if true).
			 * @param {boolean=} pad If true, this extra value should be separated by the previous one by a space. If there is no previous extra and pad is true, it will automatically drop the space.
			 * @return {CSSPropTween} returns itself so that multiple methods can be chained together.
			 */
			p.appendXtra = function(pfx, s, c, sfx, r, pad) {
				var pt = this,
					l = pt.l;
				pt["xs" + l] += (pad && (l || pt["xs" + l])) ? " " + pfx : pfx || "";
				if (!c) if (l !== 0 && !pt.plugin) { //typically we'll combine non-changing values right into the xs to optimize performance, but we don't combine them when there's a plugin that will be tweening the values because it may depend on the values being split apart, like for a bezier, if a value doesn't change between the first and second iteration but then it does on the 3rd, we'll run into trouble because there's no xn slot for that value!
					pt["xs" + l] += s + (sfx || "");
					return pt;
				}
				pt.l++;
				pt.type = pt.setRatio ? 2 : 1;
				pt["xs" + pt.l] = sfx || "";
				if (l > 0) {
					pt.data["xn" + l] = s + c;
					pt.rxp["xn" + l] = r; //round extra property (we need to tap into this in the _parseToProxy() method)
					pt["xn" + l] = s;
					if (!pt.plugin) {
						pt.xfirst = new CSSPropTween(pt, "xn" + l, s, c, pt.xfirst || pt, 0, pt.n, r, pt.pr);
						pt.xfirst.xs0 = 0; //just to ensure that the property stays numeric which helps modern browsers speed up processing. Remember, in the setRatio() method, we do pt.t[pt.p] = val + pt.xs0 so if pt.xs0 is "" (the default), it'll cast the end value as a string. When a property is a number sometimes and a string sometimes, it prevents the compiler from locking in the data type, slowing things down slightly.
					}
					return pt;
				}
				pt.data = {s:s + c};
				pt.rxp = {};
				pt.s = s;
				pt.c = c;
				pt.r = r;
				return pt;
			};
	
			/**
			 * @constructor A SpecialProp is basically a css property that needs to be treated in a non-standard way, like if it may contain a complex value like boxShadow:"5px 10px 15px rgb(255, 102, 51)" or if it is associated with another plugin like ThrowPropsPlugin or BezierPlugin. Every SpecialProp is associated with a particular property name like "boxShadow" or "throwProps" or "bezier" and it will intercept those values in the vars object that's passed to the CSSPlugin and handle them accordingly.
			 * @param {!string} p Property name (like "boxShadow" or "throwProps")
			 * @param {Object=} options An object containing any of the following configuration options:
			 *                      - defaultValue: the default value
			 *                      - parser: A function that should be called when the associated property name is found in the vars. This function should return a CSSPropTween instance and it should ensure that it is properly inserted into the linked list. It will receive 4 paramters: 1) The target, 2) The value defined in the vars, 3) The CSSPlugin instance (whose _firstPT should be used for the linked list), and 4) A computed style object if one was calculated (this is a speed optimization that allows retrieval of starting values quicker)
			 *                      - formatter: a function that formats any value received for this special property (for example, boxShadow could take "5px 5px red" and format it to "5px 5px 0px 0px red" so that both the beginning and ending values have a common order and quantity of values.)
			 *                      - prefix: if true, we'll determine whether or not this property requires a vendor prefix (like Webkit or Moz or ms or O)
			 *                      - color: set this to true if the value for this SpecialProp may contain color-related values like rgb(), rgba(), etc.
			 *                      - priority: priority in the linked list order. Higher priority SpecialProps will be updated before lower priority ones. The default priority is 0.
			 *                      - multi: if true, the formatter should accommodate a comma-delimited list of values, like boxShadow could have multiple boxShadows listed out.
			 *                      - collapsible: if true, the formatter should treat the value like it's a top/right/bottom/left value that could be collapsed, like "5px" would apply to all, "5px, 10px" would use 5px for top/bottom and 10px for right/left, etc.
			 *                      - keyword: a special keyword that can [optionally] be found inside the value (like "inset" for boxShadow). This allows us to validate beginning/ending values to make sure they match (if the keyword is found in one, it'll be added to the other for consistency by default).
			 */
			var SpecialProp = function(p, options) {
					options = options || {};
					this.p = options.prefix ? _checkPropPrefix(p) || p : p;
					_specialProps[p] = _specialProps[this.p] = this;
					this.format = options.formatter || _getFormatter(options.defaultValue, options.color, options.collapsible, options.multi);
					if (options.parser) {
						this.parse = options.parser;
					}
					this.clrs = options.color;
					this.multi = options.multi;
					this.keyword = options.keyword;
					this.dflt = options.defaultValue;
					this.pr = options.priority || 0;
				},
	
				//shortcut for creating a new SpecialProp that can accept multiple properties as a comma-delimited list (helps minification). dflt can be an array for multiple values (we don't do a comma-delimited list because the default value may contain commas, like rect(0px,0px,0px,0px)). We attach this method to the SpecialProp class/object instead of using a private _createSpecialProp() method so that we can tap into it externally if necessary, like from another plugin.
				_registerComplexSpecialProp = _internals._registerComplexSpecialProp = function(p, options, defaults) {
					if (typeof(options) !== "object") {
						options = {parser:defaults}; //to make backwards compatible with older versions of BezierPlugin and ThrowPropsPlugin
					}
					var a = p.split(","),
						d = options.defaultValue,
						i, temp;
					defaults = defaults || [d];
					for (i = 0; i < a.length; i++) {
						options.prefix = (i === 0 && options.prefix);
						options.defaultValue = defaults[i] || d;
						temp = new SpecialProp(a[i], options);
					}
				},
	
				//creates a placeholder special prop for a plugin so that the property gets caught the first time a tween of it is attempted, and at that time it makes the plugin register itself, thus taking over for all future tweens of that property. This allows us to not mandate that things load in a particular order and it also allows us to log() an error that informs the user when they attempt to tween an external plugin-related property without loading its .js file.
				_registerPluginProp = function(p) {
					if (!_specialProps[p]) {
						var pluginName = p.charAt(0).toUpperCase() + p.substr(1) + "Plugin";
						_registerComplexSpecialProp(p, {parser:function(t, e, p, cssp, pt, plugin, vars) {
							var pluginClass = _globals.com.greensock.plugins[pluginName];
							if (!pluginClass) {
								_log("Error: " + pluginName + " js file not loaded.");
								return pt;
							}
							pluginClass._cssRegister();
							return _specialProps[p].parse(t, e, p, cssp, pt, plugin, vars);
						}});
					}
				};
	
	
			p = SpecialProp.prototype;
	
			/**
			 * Alias for _parseComplex() that automatically plugs in certain values for this SpecialProp, like its property name, whether or not colors should be sensed, the default value, and priority. It also looks for any keyword that the SpecialProp defines (like "inset" for boxShadow) and ensures that the beginning and ending values have the same number of values for SpecialProps where multi is true (like boxShadow and textShadow can have a comma-delimited list)
			 * @param {!Object} t target element
			 * @param {(string|number|object)} b beginning value
			 * @param {(string|number|object)} e ending (destination) value
			 * @param {CSSPropTween=} pt next CSSPropTween in the linked list
			 * @param {TweenPlugin=} plugin If another plugin will be tweening the complex value, that TweenPlugin instance goes here.
			 * @param {function=} setRatio If a custom setRatio() method should be used to handle this complex value, that goes here.
			 * @return {CSSPropTween=} First CSSPropTween in the linked list
			 */
			p.parseComplex = function(t, b, e, pt, plugin, setRatio) {
				var kwd = this.keyword,
					i, ba, ea, l, bi, ei;
				//if this SpecialProp's value can contain a comma-delimited list of values (like boxShadow or textShadow), we must parse them in a special way, and look for a keyword (like "inset" for boxShadow) and ensure that the beginning and ending BOTH have it if the end defines it as such. We also must ensure that there are an equal number of values specified (we can't tween 1 boxShadow to 3 for example)
				if (this.multi) if (_commasOutsideParenExp.test(e) || _commasOutsideParenExp.test(b)) {
					ba = b.replace(_commasOutsideParenExp, "|").split("|");
					ea = e.replace(_commasOutsideParenExp, "|").split("|");
				} else if (kwd) {
					ba = [b];
					ea = [e];
				}
				if (ea) {
					l = (ea.length > ba.length) ? ea.length : ba.length;
					for (i = 0; i < l; i++) {
						b = ba[i] = ba[i] || this.dflt;
						e = ea[i] = ea[i] || this.dflt;
						if (kwd) {
							bi = b.indexOf(kwd);
							ei = e.indexOf(kwd);
							if (bi !== ei) {
								if (ei === -1) { //if the keyword isn't in the end value, remove it from the beginning one.
									ba[i] = ba[i].split(kwd).join("");
								} else if (bi === -1) { //if the keyword isn't in the beginning, add it.
									ba[i] += " " + kwd;
								}
							}
						}
					}
					b = ba.join(", ");
					e = ea.join(", ");
				}
				return _parseComplex(t, this.p, b, e, this.clrs, this.dflt, pt, this.pr, plugin, setRatio);
			};
	
			/**
			 * Accepts a target and end value and spits back a CSSPropTween that has been inserted into the CSSPlugin's linked list and conforms with all the conventions we use internally, like type:-1, 0, 1, or 2, setting up any extra property tweens, priority, etc. For example, if we have a boxShadow SpecialProp and call:
			 * this._firstPT = sp.parse(element, "5px 10px 20px rgb(2550,102,51)", "boxShadow", this);
			 * It should figure out the starting value of the element's boxShadow, compare it to the provided end value and create all the necessary CSSPropTweens of the appropriate types to tween the boxShadow. The CSSPropTween that gets spit back should already be inserted into the linked list (the 4th parameter is the current head, so prepend to that).
			 * @param {!Object} t Target object whose property is being tweened
			 * @param {Object} e End value as provided in the vars object (typically a string, but not always - like a throwProps would be an object).
			 * @param {!string} p Property name
			 * @param {!CSSPlugin} cssp The CSSPlugin instance that should be associated with this tween.
			 * @param {?CSSPropTween} pt The CSSPropTween that is the current head of the linked list (we'll prepend to it)
			 * @param {TweenPlugin=} plugin If a plugin will be used to tween the parsed value, this is the plugin instance.
			 * @param {Object=} vars Original vars object that contains the data for parsing.
			 * @return {CSSPropTween} The first CSSPropTween in the linked list which includes the new one(s) added by the parse() call.
			 */
			p.parse = function(t, e, p, cssp, pt, plugin, vars) {
				return this.parseComplex(t.style, this.format(_getStyle(t, this.p, _cs, false, this.dflt)), this.format(e), pt, plugin);
			};
	
			/**
			 * Registers a special property that should be intercepted from any "css" objects defined in tweens. This allows you to handle them however you want without CSSPlugin doing it for you. The 2nd parameter should be a function that accepts 3 parameters:
			 *  1) Target object whose property should be tweened (typically a DOM element)
			 *  2) The end/destination value (could be a string, number, object, or whatever you want)
			 *  3) The tween instance (you probably don't need to worry about this, but it can be useful for looking up information like the duration)
			 *
			 * Then, your function should return a function which will be called each time the tween gets rendered, passing a numeric "ratio" parameter to your function that indicates the change factor (usually between 0 and 1). For example:
			 *
			 * CSSPlugin.registerSpecialProp("myCustomProp", function(target, value, tween) {
			 *      var start = target.style.width;
			 *      return function(ratio) {
			 *              target.style.width = (start + value * ratio) + "px";
			 *              console.log("set width to " + target.style.width);
			 *          }
			 * }, 0);
			 *
			 * Then, when I do this tween, it will trigger my special property:
			 *
			 * TweenLite.to(element, 1, {css:{myCustomProp:100}});
			 *
			 * In the example, of course, we're just changing the width, but you can do anything you want.
			 *
			 * @param {!string} name Property name (or comma-delimited list of property names) that should be intercepted and handled by your function. For example, if I define "myCustomProp", then it would handle that portion of the following tween: TweenLite.to(element, 1, {css:{myCustomProp:100}})
			 * @param {!function(Object, Object, Object, string):function(number)} onInitTween The function that will be called when a tween of this special property is performed. The function will receive 4 parameters: 1) Target object that should be tweened, 2) Value that was passed to the tween, 3) The tween instance itself (rarely used), and 4) The property name that's being tweened. Your function should return a function that should be called on every update of the tween. That function will receive a single parameter that is a "change factor" value (typically between 0 and 1) indicating the amount of change as a ratio. You can use this to determine how to set the values appropriately in your function.
			 * @param {number=} priority Priority that helps the engine determine the order in which to set the properties (default: 0). Higher priority properties will be updated before lower priority ones.
			 */
			CSSPlugin.registerSpecialProp = function(name, onInitTween, priority) {
				_registerComplexSpecialProp(name, {parser:function(t, e, p, cssp, pt, plugin, vars) {
					var rv = new CSSPropTween(t, p, 0, 0, pt, 2, p, false, priority);
					rv.plugin = plugin;
					rv.setRatio = onInitTween(t, e, cssp._tween, p);
					return rv;
				}, priority:priority});
			};
	
	
	
	
	
	
			//transform-related methods and properties
			CSSPlugin.useSVGTransformAttr = _isSafari || _isFirefox; //Safari and Firefox both have some rendering bugs when applying CSS transforms to SVG elements, so default to using the "transform" attribute instead (users can override this).
			var _transformProps = ("scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent").split(","),
				_transformProp = _checkPropPrefix("transform"), //the Javascript (camelCase) transform property, like msTransform, WebkitTransform, MozTransform, or OTransform.
				_transformPropCSS = _prefixCSS + "transform",
				_transformOriginProp = _checkPropPrefix("transformOrigin"),
				_supports3D = (_checkPropPrefix("perspective") !== null),
				Transform = _internals.Transform = function() {
					this.perspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0;
					this.force3D = (CSSPlugin.defaultForce3D === false || !_supports3D) ? false : CSSPlugin.defaultForce3D || "auto";
				},
				_SVGElement = window.SVGElement,
				_useSVGTransformAttr,
				//Some browsers (like Firefox and IE) don't honor transform-origin properly in SVG elements, so we need to manually adjust the matrix accordingly. We feature detect here rather than always doing the conversion for certain browsers because they may fix the problem at some point in the future.
	
				_createSVG = function(type, container, attributes) {
					var element = _doc.createElementNS("http://www.w3.org/2000/svg", type),
						reg = /([a-z])([A-Z])/g,
						p;
					for (p in attributes) {
						element.setAttributeNS(null, p.replace(reg, "$1-$2").toLowerCase(), attributes[p]);
					}
					container.appendChild(element);
					return element;
				},
				_docElement = _doc.documentElement,
				_forceSVGTransformAttr = (function() {
					//IE and Android stock don't support CSS transforms on SVG elements, so we must write them to the "transform" attribute. We populate this variable in the _parseTransform() method, and only if/when we come across an SVG element
					var force = _ieVers || (/Android/i.test(_agent) && !window.chrome),
						svg, rect, width;
					if (_doc.createElementNS && !force) { //IE8 and earlier doesn't support SVG anyway
						svg = _createSVG("svg", _docElement);
						rect = _createSVG("rect", svg, {width:100, height:50, x:100});
						width = rect.getBoundingClientRect().width;
						rect.style[_transformOriginProp] = "50% 50%";
						rect.style[_transformProp] = "scaleX(0.5)";
						force = (width === rect.getBoundingClientRect().width && !(_isFirefox && _supports3D)); //note: Firefox fails the test even though it does support CSS transforms in 3D. Since we can't push 3D stuff into the transform attribute, we force Firefox to pass the test here (as long as it does truly support 3D).
						_docElement.removeChild(svg);
					}
					return force;
				})(),
				_parseSVGOrigin = function(e, local, decoratee, absolute, smoothOrigin, skipRecord) {
					var tm = e._gsTransform,
						m = _getMatrix(e, true),
						v, x, y, xOrigin, yOrigin, a, b, c, d, tx, ty, determinant, xOriginOld, yOriginOld;
					if (tm) {
						xOriginOld = tm.xOrigin; //record the original values before we alter them.
						yOriginOld = tm.yOrigin;
					}
					if (!absolute || (v = absolute.split(" ")).length < 2) {
						b = e.getBBox();
						local = _parsePosition(local).split(" ");
						v = [(local[0].indexOf("%") !== -1 ? parseFloat(local[0]) / 100 * b.width : parseFloat(local[0])) + b.x,
							 (local[1].indexOf("%") !== -1 ? parseFloat(local[1]) / 100 * b.height : parseFloat(local[1])) + b.y];
					}
					decoratee.xOrigin = xOrigin = parseFloat(v[0]);
					decoratee.yOrigin = yOrigin = parseFloat(v[1]);
					if (absolute && m !== _identity2DMatrix) { //if svgOrigin is being set, we must invert the matrix and determine where the absolute point is, factoring in the current transforms. Otherwise, the svgOrigin would be based on the element's non-transformed position on the canvas.
						a = m[0];
						b = m[1];
						c = m[2];
						d = m[3];
						tx = m[4];
						ty = m[5];
						determinant = (a * d - b * c);
						x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + ((c * ty - d * tx) / determinant);
						y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - ((a * ty - b * tx) / determinant);
						xOrigin = decoratee.xOrigin = v[0] = x;
						yOrigin = decoratee.yOrigin = v[1] = y;
					}
					if (tm) { //avoid jump when transformOrigin is changed - adjust the x/y values accordingly
						if (skipRecord) {
							decoratee.xOffset = tm.xOffset;
							decoratee.yOffset = tm.yOffset;
							tm = decoratee;
						}
						if (smoothOrigin || (smoothOrigin !== false && CSSPlugin.defaultSmoothOrigin !== false)) {
							x = xOrigin - xOriginOld;
							y = yOrigin - yOriginOld;
							//originally, we simply adjusted the x and y values, but that would cause problems if, for example, you created a rotational tween part-way through an x/y tween. Managing the offset in a separate variable gives us ultimate flexibility.
							//tm.x -= x - (x * m[0] + y * m[2]);
							//tm.y -= y - (x * m[1] + y * m[3]);
							tm.xOffset += (x * m[0] + y * m[2]) - x;
							tm.yOffset += (x * m[1] + y * m[3]) - y;
						} else {
							tm.xOffset = tm.yOffset = 0;
						}
					}
					if (!skipRecord) {
						e.setAttribute("data-svg-origin", v.join(" "));
					}
				},
				_canGetBBox = function(e) {
					try {
						return e.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
					} catch (e) {}
				},
				_isSVG = function(e) { //reports if the element is an SVG on which getBBox() actually works
					return !!(_SVGElement && e.getBBox && e.getCTM && _canGetBBox(e) && (!e.parentNode || (e.parentNode.getBBox && e.parentNode.getCTM)));
				},
				_identity2DMatrix = [1,0,0,1,0,0],
				_getMatrix = function(e, force2D) {
					var tm = e._gsTransform || new Transform(),
						rnd = 100000,
						style = e.style,
						isDefault, s, m, n, dec, none;
					if (_transformProp) {
						s = _getStyle(e, _transformPropCSS, null, true);
					} else if (e.currentStyle) {
						//for older versions of IE, we need to interpret the filter portion that is in the format: progid:DXImageTransform.Microsoft.Matrix(M11=6.123233995736766e-17, M12=-1, M21=1, M22=6.123233995736766e-17, sizingMethod='auto expand') Notice that we need to swap b and c compared to a normal matrix.
						s = e.currentStyle.filter.match(_ieGetMatrixExp);
						s = (s && s.length === 4) ? [s[0].substr(4), Number(s[2].substr(4)), Number(s[1].substr(4)), s[3].substr(4), (tm.x || 0), (tm.y || 0)].join(",") : "";
					}
					isDefault = (!s || s === "none" || s === "matrix(1, 0, 0, 1, 0, 0)");
					if (isDefault && _transformProp && ((none = (_getComputedStyle(e).display === "none")) || !e.parentNode)) {
						if (none) { //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none".
							n = style.display;
							style.display = "block";
						}
						if (!e.parentNode) {
							dec = 1; //flag
							_docElement.appendChild(e);
						}
						s = _getStyle(e, _transformPropCSS, null, true);
						isDefault = (!s || s === "none" || s === "matrix(1, 0, 0, 1, 0, 0)");
						if (n) {
							style.display = n;
						} else if (none) {
							_removeProp(style, "display");
						}
						if (dec) {
							_docElement.removeChild(e);
						}
					}
					if (tm.svg || (e.getBBox && _isSVG(e))) {
						if (isDefault && (style[_transformProp] + "").indexOf("matrix") !== -1) { //some browsers (like Chrome 40) don't correctly report transforms that are applied inline on an SVG element (they don't get included in the computed style), so we double-check here and accept matrix values
							s = style[_transformProp];
							isDefault = 0;
						}
						m = e.getAttribute("transform");
						if (isDefault && m) {
							if (m.indexOf("matrix") !== -1) { //just in case there's a "transform" value specified as an attribute instead of CSS style. Accept either a matrix() or simple translate() value though.
								s = m;
								isDefault = 0;
							} else if (m.indexOf("translate") !== -1) {
								s = "matrix(1,0,0,1," + m.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",") + ")";
								isDefault = 0;
							}
						}
					}
					if (isDefault) {
						return _identity2DMatrix;
					}
					//split the matrix values out into an array (m for matrix)
					m = (s || "").match(_numExp) || [];
					i = m.length;
					while (--i > -1) {
						n = Number(m[i]);
						m[i] = (dec = n - (n |= 0)) ? ((dec * rnd + (dec < 0 ? -0.5 : 0.5)) | 0) / rnd + n : n; //convert strings to Numbers and round to 5 decimal places to avoid issues with tiny numbers. Roughly 20x faster than Number.toFixed(). We also must make sure to round before dividing so that values like 0.9999999999 become 1 to avoid glitches in browser rendering and interpretation of flipped/rotated 3D matrices. And don't just multiply the number by rnd, floor it, and then divide by rnd because the bitwise operations max out at a 32-bit signed integer, thus it could get clipped at a relatively low value (like 22,000.00000 for example).
					}
					return (force2D && m.length > 6) ? [m[0], m[1], m[4], m[5], m[12], m[13]] : m;
				},
	
				/**
				 * Parses the transform values for an element, returning an object with x, y, z, scaleX, scaleY, scaleZ, rotation, rotationX, rotationY, skewX, and skewY properties. Note: by default (for performance reasons), all skewing is combined into skewX and rotation but skewY still has a place in the transform object so that we can record how much of the skew is attributed to skewX vs skewY. Remember, a skewY of 10 looks the same as a rotation of 10 and skewX of -10.
				 * @param {!Object} t target element
				 * @param {Object=} cs computed style object (optional)
				 * @param {boolean=} rec if true, the transform values will be recorded to the target element's _gsTransform object, like target._gsTransform = {x:0, y:0, z:0, scaleX:1...}
				 * @param {boolean=} parse if true, we'll ignore any _gsTransform values that already exist on the element, and force a reparsing of the css (calculated style)
				 * @return {object} object containing all of the transform properties/values like {x:0, y:0, z:0, scaleX:1...}
				 */
				_getTransform = _internals.getTransform = function(t, cs, rec, parse) {
					if (t._gsTransform && rec && !parse) {
						return t._gsTransform; //if the element already has a _gsTransform, use that. Note: some browsers don't accurately return the calculated style for the transform (particularly for SVG), so it's almost always safest to just use the values we've already applied rather than re-parsing things.
					}
					var tm = rec ? t._gsTransform || new Transform() : new Transform(),
						invX = (tm.scaleX < 0), //in order to interpret things properly, we need to know if the user applied a negative scaleX previously so that we can adjust the rotation and skewX accordingly. Otherwise, if we always interpret a flipped matrix as affecting scaleY and the user only wants to tween the scaleX on multiple sequential tweens, it would keep the negative scaleY without that being the user's intent.
						min = 0.00002,
						rnd = 100000,
						zOrigin = _supports3D ? parseFloat(_getStyle(t, _transformOriginProp, cs, false, "0 0 0").split(" ")[2]) || tm.zOrigin  || 0 : 0,
						defaultTransformPerspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0,
						m, i, scaleX, scaleY, rotation, skewX;
	
					tm.svg = !!(t.getBBox && _isSVG(t));
					if (tm.svg) {
						_parseSVGOrigin(t, _getStyle(t, _transformOriginProp, cs, false, "50% 50%") + "", tm, t.getAttribute("data-svg-origin"));
						_useSVGTransformAttr = CSSPlugin.useSVGTransformAttr || _forceSVGTransformAttr;
					}
					m = _getMatrix(t);
					if (m !== _identity2DMatrix) {
	
						if (m.length === 16) {
							//we'll only look at these position-related 6 variables first because if x/y/z all match, it's relatively safe to assume we don't need to re-parse everything which risks losing important rotational information (like rotationX:180 plus rotationY:180 would look the same as rotation:180 - there's no way to know for sure which direction was taken based solely on the matrix3d() values)
							var a11 = m[0], a21 = m[1], a31 = m[2], a41 = m[3],
								a12 = m[4], a22 = m[5], a32 = m[6], a42 = m[7],
								a13 = m[8], a23 = m[9], a33 = m[10],
								a14 = m[12], a24 = m[13], a34 = m[14],
								a43 = m[11],
								angle = Math.atan2(a32, a33),
								t1, t2, t3, t4, cos, sin;
	
							//we manually compensate for non-zero z component of transformOrigin to work around bugs in Safari
							if (tm.zOrigin) {
								a34 = -tm.zOrigin;
								a14 = a13*a34-m[12];
								a24 = a23*a34-m[13];
								a34 = a33*a34+tm.zOrigin-m[14];
							}
							tm.rotationX = angle * _RAD2DEG;
							//rotationX
							if (angle) {
								cos = Math.cos(-angle);
								sin = Math.sin(-angle);
								t1 = a12*cos+a13*sin;
								t2 = a22*cos+a23*sin;
								t3 = a32*cos+a33*sin;
								a13 = a12*-sin+a13*cos;
								a23 = a22*-sin+a23*cos;
								a33 = a32*-sin+a33*cos;
								a43 = a42*-sin+a43*cos;
								a12 = t1;
								a22 = t2;
								a32 = t3;
							}
							//rotationY
							angle = Math.atan2(-a31, a33);
							tm.rotationY = angle * _RAD2DEG;
							if (angle) {
								cos = Math.cos(-angle);
								sin = Math.sin(-angle);
								t1 = a11*cos-a13*sin;
								t2 = a21*cos-a23*sin;
								t3 = a31*cos-a33*sin;
								a23 = a21*sin+a23*cos;
								a33 = a31*sin+a33*cos;
								a43 = a41*sin+a43*cos;
								a11 = t1;
								a21 = t2;
								a31 = t3;
							}
							//rotationZ
							angle = Math.atan2(a21, a11);
							tm.rotation = angle * _RAD2DEG;
							if (angle) {
								cos = Math.cos(-angle);
								sin = Math.sin(-angle);
								a11 = a11*cos+a12*sin;
								t2 = a21*cos+a22*sin;
								a22 = a21*-sin+a22*cos;
								a32 = a31*-sin+a32*cos;
								a21 = t2;
							}
	
							if (tm.rotationX && Math.abs(tm.rotationX) + Math.abs(tm.rotation) > 359.9) { //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
								tm.rotationX = tm.rotation = 0;
								tm.rotationY = 180 - tm.rotationY;
							}
	
							tm.scaleX = ((Math.sqrt(a11 * a11 + a21 * a21) * rnd + 0.5) | 0) / rnd;
							tm.scaleY = ((Math.sqrt(a22 * a22 + a23 * a23) * rnd + 0.5) | 0) / rnd;
							tm.scaleZ = ((Math.sqrt(a32 * a32 + a33 * a33) * rnd + 0.5) | 0) / rnd;
							if (tm.rotationX || tm.rotationY) {
								tm.skewX = 0;
							} else {
								tm.skewX = (a12 || a22) ? Math.atan2(a12, a22) * _RAD2DEG + tm.rotation : tm.skewX || 0;
								if (Math.abs(tm.skewX) > 90 && Math.abs(tm.skewX) < 270) {
									if (invX) {
										tm.scaleX *= -1;
										tm.skewX += (tm.rotation <= 0) ? 180 : -180;
										tm.rotation += (tm.rotation <= 0) ? 180 : -180;
									} else {
										tm.scaleY *= -1;
										tm.skewX += (tm.skewX <= 0) ? 180 : -180;
									}
								}
							}
							tm.perspective = a43 ? 1 / ((a43 < 0) ? -a43 : a43) : 0;
							tm.x = a14;
							tm.y = a24;
							tm.z = a34;
							if (tm.svg) {
								tm.x -= tm.xOrigin - (tm.xOrigin * a11 - tm.yOrigin * a12);
								tm.y -= tm.yOrigin - (tm.yOrigin * a21 - tm.xOrigin * a22);
							}
	
						} else if ((!_supports3D || parse || !m.length || tm.x !== m[4] || tm.y !== m[5] || (!tm.rotationX && !tm.rotationY))) { //sometimes a 6-element matrix is returned even when we performed 3D transforms, like if rotationX and rotationY are 180. In cases like this, we still need to honor the 3D transforms. If we just rely on the 2D info, it could affect how the data is interpreted, like scaleY might get set to -1 or rotation could get offset by 180 degrees. For example, do a TweenLite.to(element, 1, {css:{rotationX:180, rotationY:180}}) and then later, TweenLite.to(element, 1, {css:{rotationX:0}}) and without this conditional logic in place, it'd jump to a state of being unrotated when the 2nd tween starts. Then again, we need to honor the fact that the user COULD alter the transforms outside of CSSPlugin, like by manually applying new css, so we try to sense that by looking at x and y because if those changed, we know the changes were made outside CSSPlugin and we force a reinterpretation of the matrix values. Also, in Webkit browsers, if the element's "display" is "none", its calculated style value will always return empty, so if we've already recorded the values in the _gsTransform object, we'll just rely on those.
							var k = (m.length >= 6),
								a = k ? m[0] : 1,
								b = m[1] || 0,
								c = m[2] || 0,
								d = k ? m[3] : 1;
							tm.x = m[4] || 0;
							tm.y = m[5] || 0;
							scaleX = Math.sqrt(a * a + b * b);
							scaleY = Math.sqrt(d * d + c * c);
							rotation = (a || b) ? Math.atan2(b, a) * _RAD2DEG : tm.rotation || 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).
							skewX = (c || d) ? Math.atan2(c, d) * _RAD2DEG + rotation : tm.skewX || 0;
							if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
								if (invX) {
									scaleX *= -1;
									skewX += (rotation <= 0) ? 180 : -180;
									rotation += (rotation <= 0) ? 180 : -180;
								} else {
									scaleY *= -1;
									skewX += (skewX <= 0) ? 180 : -180;
								}
							}
							tm.scaleX = scaleX;
							tm.scaleY = scaleY;
							tm.rotation = rotation;
							tm.skewX = skewX;
							if (_supports3D) {
								tm.rotationX = tm.rotationY = tm.z = 0;
								tm.perspective = defaultTransformPerspective;
								tm.scaleZ = 1;
							}
							if (tm.svg) {
								tm.x -= tm.xOrigin - (tm.xOrigin * a + tm.yOrigin * c);
								tm.y -= tm.yOrigin - (tm.xOrigin * b + tm.yOrigin * d);
							}
						}
						tm.zOrigin = zOrigin;
						//some browsers have a hard time with very small values like 2.4492935982947064e-16 (notice the "e-" towards the end) and would render the object slightly off. So we round to 0 in these cases. The conditional logic here is faster than calling Math.abs(). Also, browsers tend to render a SLIGHTLY rotated object in a fuzzy way, so we need to snap to exactly 0 when appropriate.
						for (i in tm) {
							if (tm[i] < min) if (tm[i] > -min) {
								tm[i] = 0;
							}
						}
					}
					//DEBUG: _log("parsed rotation of " + t.getAttribute("id")+": "+(tm.rotationX)+", "+(tm.rotationY)+", "+(tm.rotation)+", scale: "+tm.scaleX+", "+tm.scaleY+", "+tm.scaleZ+", position: "+tm.x+", "+tm.y+", "+tm.z+", perspective: "+tm.perspective+ ", origin: "+ tm.xOrigin+ ","+ tm.yOrigin);
					if (rec) {
						t._gsTransform = tm; //record to the object's _gsTransform which we use so that tweens can control individual properties independently (we need all the properties to accurately recompose the matrix in the setRatio() method)
						if (tm.svg) { //if we're supposed to apply transforms to the SVG element's "transform" attribute, make sure there aren't any CSS transforms applied or they'll override the attribute ones. Also clear the transform attribute if we're using CSS, just to be clean.
							if (_useSVGTransformAttr && t.style[_transformProp]) {
								TweenLite.delayedCall(0.001, function(){ //if we apply this right away (before anything has rendered), we risk there being no transforms for a brief moment and it also interferes with adjusting the transformOrigin in a tween with immediateRender:true (it'd try reading the matrix and it wouldn't have the appropriate data in place because we just removed it).
									_removeProp(t.style, _transformProp);
								});
							} else if (!_useSVGTransformAttr && t.getAttribute("transform")) {
								TweenLite.delayedCall(0.001, function(){
									t.removeAttribute("transform");
								});
							}
						}
					}
					return tm;
				},
	
				//for setting 2D transforms in IE6, IE7, and IE8 (must use a "filter" to emulate the behavior of modern day browser transforms)
				_setIETransformRatio = function(v) {
					var t = this.data, //refers to the element's _gsTransform object
						ang = -t.rotation * _DEG2RAD,
						skew = ang + t.skewX * _DEG2RAD,
						rnd = 100000,
						a = ((Math.cos(ang) * t.scaleX * rnd) | 0) / rnd,
						b = ((Math.sin(ang) * t.scaleX * rnd) | 0) / rnd,
						c = ((Math.sin(skew) * -t.scaleY * rnd) | 0) / rnd,
						d = ((Math.cos(skew) * t.scaleY * rnd) | 0) / rnd,
						style = this.t.style,
						cs = this.t.currentStyle,
						filters, val;
					if (!cs) {
						return;
					}
					val = b; //just for swapping the variables an inverting them (reused "val" to avoid creating another variable in memory). IE's filter matrix uses a non-standard matrix configuration (angle goes the opposite way, and b and c are reversed and inverted)
					b = -c;
					c = -val;
					filters = cs.filter;
					style.filter = ""; //remove filters so that we can accurately measure offsetWidth/offsetHeight
					var w = this.t.offsetWidth,
						h = this.t.offsetHeight,
						clip = (cs.position !== "absolute"),
						m = "progid:DXImageTransform.Microsoft.Matrix(M11=" + a + ", M12=" + b + ", M21=" + c + ", M22=" + d,
						ox = t.x + (w * t.xPercent / 100),
						oy = t.y + (h * t.yPercent / 100),
						dx, dy;
	
					//if transformOrigin is being used, adjust the offset x and y
					if (t.ox != null) {
						dx = ((t.oxp) ? w * t.ox * 0.01 : t.ox) - w / 2;
						dy = ((t.oyp) ? h * t.oy * 0.01 : t.oy) - h / 2;
						ox += dx - (dx * a + dy * b);
						oy += dy - (dx * c + dy * d);
					}
	
					if (!clip) {
						m += ", sizingMethod='auto expand')";
					} else {
						dx = (w / 2);
						dy = (h / 2);
						//translate to ensure that transformations occur around the correct origin (default is center).
						m += ", Dx=" + (dx - (dx * a + dy * b) + ox) + ", Dy=" + (dy - (dx * c + dy * d) + oy) + ")";
					}
					if (filters.indexOf("DXImageTransform.Microsoft.Matrix(") !== -1) {
						style.filter = filters.replace(_ieSetMatrixExp, m);
					} else {
						style.filter = m + " " + filters; //we must always put the transform/matrix FIRST (before alpha(opacity=xx)) to avoid an IE bug that slices part of the object when rotation is applied with alpha.
					}
	
					//at the end or beginning of the tween, if the matrix is normal (1, 0, 0, 1) and opacity is 100 (or doesn't exist), remove the filter to improve browser performance.
					if (v === 0 || v === 1) if (a === 1) if (b === 0) if (c === 0) if (d === 1) if (!clip || m.indexOf("Dx=0, Dy=0") !== -1) if (!_opacityExp.test(filters) || parseFloat(RegExp.$1) === 100) if (filters.indexOf("gradient(" && filters.indexOf("Alpha")) === -1) {
						style.removeAttribute("filter");
					}
	
					//we must set the margins AFTER applying the filter in order to avoid some bugs in IE8 that could (in rare scenarios) cause them to be ignored intermittently (vibration).
					if (!clip) {
						var mult = (_ieVers < 8) ? 1 : -1, //in Internet Explorer 7 and before, the box model is broken, causing the browser to treat the width/height of the actual rotated filtered image as the width/height of the box itself, but Microsoft corrected that in IE8. We must use a negative offset in IE8 on the right/bottom
							marg, prop, dif;
						dx = t.ieOffsetX || 0;
						dy = t.ieOffsetY || 0;
						t.ieOffsetX = Math.round((w - ((a < 0 ? -a : a) * w + (b < 0 ? -b : b) * h)) / 2 + ox);
						t.ieOffsetY = Math.round((h - ((d < 0 ? -d : d) * h + (c < 0 ? -c : c) * w)) / 2 + oy);
						for (i = 0; i < 4; i++) {
							prop = _margins[i];
							marg = cs[prop];
							//we need to get the current margin in case it is being tweened separately (we want to respect that tween's changes)
							val = (marg.indexOf("px") !== -1) ? parseFloat(marg) : _convertToPixels(this.t, prop, parseFloat(marg), marg.replace(_suffixExp, "")) || 0;
							if (val !== t[prop]) {
								dif = (i < 2) ? -t.ieOffsetX : -t.ieOffsetY; //if another tween is controlling a margin, we cannot only apply the difference in the ieOffsets, so we essentially zero-out the dx and dy here in that case. We record the margin(s) later so that we can keep comparing them, making this code very flexible.
							} else {
								dif = (i < 2) ? dx - t.ieOffsetX : dy - t.ieOffsetY;
							}
							style[prop] = (t[prop] = Math.round( val - dif * ((i === 0 || i === 2) ? 1 : mult) )) + "px";
						}
					}
				},
	
				/* translates a super small decimal to a string WITHOUT scientific notation
				_safeDecimal = function(n) {
					var s = (n < 0 ? -n : n) + "",
						a = s.split("e-");
					return (n < 0 ? "-0." : "0.") + new Array(parseInt(a[1], 10) || 0).join("0") + a[0].split(".").join("");
				},
				*/
	
				_setTransformRatio = _internals.set3DTransformRatio = _internals.setTransformRatio = function(v) {
					var t = this.data, //refers to the element's _gsTransform object
						style = this.t.style,
						angle = t.rotation,
						rotationX = t.rotationX,
						rotationY = t.rotationY,
						sx = t.scaleX,
						sy = t.scaleY,
						sz = t.scaleZ,
						x = t.x,
						y = t.y,
						z = t.z,
						isSVG = t.svg,
						perspective = t.perspective,
						force3D = t.force3D,
						a11, a12, a13, a21, a22, a23, a31, a32, a33, a41, a42, a43,
						zOrigin, min, cos, sin, t1, t2, transform, comma, zero, skew, rnd;
					//check to see if we should render as 2D (and SVGs must use 2D when _useSVGTransformAttr is true)
					if (((((v === 1 || v === 0) && force3D === "auto" && (this.tween._totalTime === this.tween._totalDuration || !this.tween._totalTime)) || !force3D) && !z && !perspective && !rotationY && !rotationX && sz === 1) || (_useSVGTransformAttr && isSVG) || !_supports3D) { //on the final render (which could be 0 for a from tween), if there are no 3D aspects, render in 2D to free up memory and improve performance especially on mobile devices. Check the tween's totalTime/totalDuration too in order to make sure it doesn't happen between repeats if it's a repeating tween.
	
						//2D
						if (angle || t.skewX || isSVG) {
							angle *= _DEG2RAD;
							skew = t.skewX * _DEG2RAD;
							rnd = 100000;
							a11 = Math.cos(angle) * sx;
							a21 = Math.sin(angle) * sx;
							a12 = Math.sin(angle - skew) * -sy;
							a22 = Math.cos(angle - skew) * sy;
							if (skew && t.skewType === "simple") { //by default, we compensate skewing on the other axis to make it look more natural, but you can set the skewType to "simple" to use the uncompensated skewing that CSS does
								t1 = Math.tan(skew);
								t1 = Math.sqrt(1 + t1 * t1);
								a12 *= t1;
								a22 *= t1;
								if (t.skewY) {
									a11 *= t1;
									a21 *= t1;
								}
							}
							if (isSVG) {
								x += t.xOrigin - (t.xOrigin * a11 + t.yOrigin * a12) + t.xOffset;
								y += t.yOrigin - (t.xOrigin * a21 + t.yOrigin * a22) + t.yOffset;
								if (_useSVGTransformAttr && (t.xPercent || t.yPercent)) { //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the matrix to simulate it.
									min = this.t.getBBox();
									x += t.xPercent * 0.01 * min.width;
									y += t.yPercent * 0.01 * min.height;
								}
								min = 0.000001;
								if (x < min) if (x > -min) {
									x = 0;
								}
								if (y < min) if (y > -min) {
									y = 0;
								}
							}
							transform = (((a11 * rnd) | 0) / rnd) + "," + (((a21 * rnd) | 0) / rnd) + "," + (((a12 * rnd) | 0) / rnd) + "," + (((a22 * rnd) | 0) / rnd) + "," + x + "," + y + ")";
							if (isSVG && _useSVGTransformAttr) {
								this.t.setAttribute("transform", "matrix(" + transform);
							} else {
								//some browsers have a hard time with very small values like 2.4492935982947064e-16 (notice the "e-" towards the end) and would render the object slightly off. So we round to 5 decimal places.
								style[_transformProp] = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + transform;
							}
						} else {
							style[_transformProp] = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + sx + ",0,0," + sy + "," + x + "," + y + ")";
						}
						return;
	
					}
					if (_isFirefox) { //Firefox has a bug (at least in v25) that causes it to render the transparent part of 32-bit PNG images as black when displayed inside an iframe and the 3D scale is very small and doesn't change sufficiently enough between renders (like if you use a Power4.easeInOut to scale from 0 to 1 where the beginning values only change a tiny amount to begin the tween before accelerating). In this case, we force the scale to be 0.00002 instead which is visually the same but works around the Firefox issue.
						min = 0.0001;
						if (sx < min && sx > -min) {
							sx = sz = 0.00002;
						}
						if (sy < min && sy > -min) {
							sy = sz = 0.00002;
						}
						if (perspective && !t.z && !t.rotationX && !t.rotationY) { //Firefox has a bug that causes elements to have an odd super-thin, broken/dotted black border on elements that have a perspective set but aren't utilizing 3D space (no rotationX, rotationY, or z).
							perspective = 0;
						}
					}
					if (angle || t.skewX) {
						angle *= _DEG2RAD;
						cos = a11 = Math.cos(angle);
						sin = a21 = Math.sin(angle);
						if (t.skewX) {
							angle -= t.skewX * _DEG2RAD;
							cos = Math.cos(angle);
							sin = Math.sin(angle);
							if (t.skewType === "simple") { //by default, we compensate skewing on the other axis to make it look more natural, but you can set the skewType to "simple" to use the uncompensated skewing that CSS does
								t1 = Math.tan(t.skewX * _DEG2RAD);
								t1 = Math.sqrt(1 + t1 * t1);
								cos *= t1;
								sin *= t1;
								if (t.skewY) {
									a11 *= t1;
									a21 *= t1;
								}
							}
						}
						a12 = -sin;
						a22 = cos;
	
					} else if (!rotationY && !rotationX && sz === 1 && !perspective && !isSVG) { //if we're only translating and/or 2D scaling, this is faster...
						style[_transformProp] = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) translate3d(" : "translate3d(") + x + "px," + y + "px," + z +"px)" + ((sx !== 1 || sy !== 1) ? " scale(" + sx + "," + sy + ")" : "");
						return;
					} else {
						a11 = a22 = 1;
						a12 = a21 = 0;
					}
					// KEY  INDEX   AFFECTS
					// a11  0       rotation, rotationY, scaleX
					// a21  1       rotation, rotationY, scaleX
					// a31  2       rotationY, scaleX
					// a41  3       rotationY, scaleX
					// a12  4       rotation, skewX, rotationX, scaleY
					// a22  5       rotation, skewX, rotationX, scaleY
					// a32  6       rotationX, scaleY
					// a42  7       rotationX, scaleY
					// a13  8       rotationY, rotationX, scaleZ
					// a23  9       rotationY, rotationX, scaleZ
					// a33  10      rotationY, rotationX, scaleZ
					// a43  11      rotationY, rotationX, perspective, scaleZ
					// a14  12      x, zOrigin, svgOrigin
					// a24  13      y, zOrigin, svgOrigin
					// a34  14      z, zOrigin
					// a44  15
					// rotation: Math.atan2(a21, a11)
					// rotationY: Math.atan2(a13, a33) (or Math.atan2(a13, a11))
					// rotationX: Math.atan2(a32, a33)
					a33 = 1;
					a13 = a23 = a31 = a32 = a41 = a42 = 0;
					a43 = (perspective) ? -1 / perspective : 0;
					zOrigin = t.zOrigin;
					min = 0.000001; //threshold below which browsers use scientific notation which won't work.
					comma = ",";
					zero = "0";
					angle = rotationY * _DEG2RAD;
					if (angle) {
						cos = Math.cos(angle);
						sin = Math.sin(angle);
						a31 = -sin;
						a41 = a43*-sin;
						a13 = a11*sin;
						a23 = a21*sin;
						a33 = cos;
						a43 *= cos;
						a11 *= cos;
						a21 *= cos;
					}
					angle = rotationX * _DEG2RAD;
					if (angle) {
						cos = Math.cos(angle);
						sin = Math.sin(angle);
						t1 = a12*cos+a13*sin;
						t2 = a22*cos+a23*sin;
						a32 = a33*sin;
						a42 = a43*sin;
						a13 = a12*-sin+a13*cos;
						a23 = a22*-sin+a23*cos;
						a33 = a33*cos;
						a43 = a43*cos;
						a12 = t1;
						a22 = t2;
					}
					if (sz !== 1) {
						a13*=sz;
						a23*=sz;
						a33*=sz;
						a43*=sz;
					}
					if (sy !== 1) {
						a12*=sy;
						a22*=sy;
						a32*=sy;
						a42*=sy;
					}
					if (sx !== 1) {
						a11*=sx;
						a21*=sx;
						a31*=sx;
						a41*=sx;
					}
	
					if (zOrigin || isSVG) {
						if (zOrigin) {
							x += a13*-zOrigin;
							y += a23*-zOrigin;
							z += a33*-zOrigin+zOrigin;
						}
						if (isSVG) { //due to bugs in some browsers, we need to manage the transform-origin of SVG manually
							x += t.xOrigin - (t.xOrigin * a11 + t.yOrigin * a12) + t.xOffset;
							y += t.yOrigin - (t.xOrigin * a21 + t.yOrigin * a22) + t.yOffset;
						}
						if (x < min && x > -min) {
							x = zero;
						}
						if (y < min && y > -min) {
							y = zero;
						}
						if (z < min && z > -min) {
							z = 0; //don't use string because we calculate perspective later and need the number.
						}
					}
	
					//optimized way of concatenating all the values into a string. If we do it all in one shot, it's slower because of the way browsers have to create temp strings and the way it affects memory. If we do it piece-by-piece with +=, it's a bit slower too. We found that doing it in these sized chunks works best overall:
					transform = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix3d(" : "matrix3d(");
					transform += ((a11 < min && a11 > -min) ? zero : a11) + comma + ((a21 < min && a21 > -min) ? zero : a21) + comma + ((a31 < min && a31 > -min) ? zero : a31);
					transform += comma + ((a41 < min && a41 > -min) ? zero : a41) + comma + ((a12 < min && a12 > -min) ? zero : a12) + comma + ((a22 < min && a22 > -min) ? zero : a22);
					if (rotationX || rotationY || sz !== 1) { //performance optimization (often there's no rotationX or rotationY, so we can skip these calculations)
						transform += comma + ((a32 < min && a32 > -min) ? zero : a32) + comma + ((a42 < min && a42 > -min) ? zero : a42) + comma + ((a13 < min && a13 > -min) ? zero : a13);
						transform += comma + ((a23 < min && a23 > -min) ? zero : a23) + comma + ((a33 < min && a33 > -min) ? zero : a33) + comma + ((a43 < min && a43 > -min) ? zero : a43) + comma;
					} else {
						transform += ",0,0,0,0,1,0,";
					}
					transform += x + comma + y + comma + z + comma + (perspective ? (1 + (-z / perspective)) : 1) + ")";
	
					style[_transformProp] = transform;
				};
	
			p = Transform.prototype;
			p.x = p.y = p.z = p.skewX = p.skewY = p.rotation = p.rotationX = p.rotationY = p.zOrigin = p.xPercent = p.yPercent = p.xOffset = p.yOffset = 0;
			p.scaleX = p.scaleY = p.scaleZ = 1;
	
			_registerComplexSpecialProp("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin", {parser:function(t, e, p, cssp, pt, plugin, vars) {
				if (cssp._lastParsedTransform === vars) { return pt; } //only need to parse the transform once, and only if the browser supports it.
				cssp._lastParsedTransform = vars;
				var originalGSTransform = t._gsTransform,
					style = t.style,
					min = 0.000001,
					i = _transformProps.length,
					v = vars,
					endRotations = {},
					transformOriginString = "transformOrigin",
					m1 = _getTransform(t, _cs, true, vars.parseTransform),
					m2, copy, orig, has3D, hasChange, dr, x, y, matrix;
				cssp._transform = m1;
				if (typeof(v.transform) === "string" && _transformProp) { //for values like transform:"rotate(60deg) scale(0.5, 0.8)"
					copy = _tempDiv.style; //don't use the original target because it might be SVG in which case some browsers don't report computed style correctly.
					copy[_transformProp] = v.transform;
					copy.display = "block"; //if display is "none", the browser often refuses to report the transform properties correctly.
					copy.position = "absolute";
					_doc.body.appendChild(_tempDiv);
					m2 = _getTransform(_tempDiv, null, false);
					if (m1.svg) { //if it's an SVG element, x/y part of the matrix will be affected by whatever we use as the origin and the offsets, so compensate here...
						x = m1.xOrigin;
						y = m1.yOrigin;
						m2.x -= m1.xOffset;
						m2.y -= m1.yOffset;
						if (v.transformOrigin || v.svgOrigin) { //if this tween is altering the origin, we must factor that in here. The actual work of recording the transformOrigin values and setting up the PropTween is done later (still inside this function) so we cannot leave the changes intact here - we only want to update the x/y accordingly.
							orig = {};
							_parseSVGOrigin(t, _parsePosition(v.transformOrigin), orig, v.svgOrigin, v.smoothOrigin, true);
							x = orig.xOrigin;
							y = orig.yOrigin;
							m2.x -= orig.xOffset - m1.xOffset;
							m2.y -= orig.yOffset - m1.yOffset;
						}
						if (x || y) {
							matrix = _getMatrix(_tempDiv, true);
							m2.x -= x - (x * matrix[0] + y * matrix[2]);
							m2.y -= y - (x * matrix[1] + y * matrix[3]);
						}
					}
					_doc.body.removeChild(_tempDiv);
					if (!m2.perspective) {
						m2.perspective = m1.perspective; //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
					}
					if (v.xPercent != null) {
						m2.xPercent = _parseVal(v.xPercent, m1.xPercent);
					}
					if (v.yPercent != null) {
						m2.yPercent = _parseVal(v.yPercent, m1.yPercent);
					}
				} else if (typeof(v) === "object") { //for values like scaleX, scaleY, rotation, x, y, skewX, and skewY or transform:{...} (object)
					m2 = {scaleX:_parseVal((v.scaleX != null) ? v.scaleX : v.scale, m1.scaleX),
						scaleY:_parseVal((v.scaleY != null) ? v.scaleY : v.scale, m1.scaleY),
						scaleZ:_parseVal(v.scaleZ, m1.scaleZ),
						x:_parseVal(v.x, m1.x),
						y:_parseVal(v.y, m1.y),
						z:_parseVal(v.z, m1.z),
						xPercent:_parseVal(v.xPercent, m1.xPercent),
						yPercent:_parseVal(v.yPercent, m1.yPercent),
						perspective:_parseVal(v.transformPerspective, m1.perspective)};
					dr = v.directionalRotation;
					if (dr != null) {
						if (typeof(dr) === "object") {
							for (copy in dr) {
								v[copy] = dr[copy];
							}
						} else {
							v.rotation = dr;
						}
					}
					if (typeof(v.x) === "string" && v.x.indexOf("%") !== -1) {
						m2.x = 0;
						m2.xPercent = _parseVal(v.x, m1.xPercent);
					}
					if (typeof(v.y) === "string" && v.y.indexOf("%") !== -1) {
						m2.y = 0;
						m2.yPercent = _parseVal(v.y, m1.yPercent);
					}
	
					m2.rotation = _parseAngle(("rotation" in v) ? v.rotation : ("shortRotation" in v) ? v.shortRotation + "_short" : ("rotationZ" in v) ? v.rotationZ : m1.rotation - m1.skewY, m1.rotation - m1.skewY, "rotation", endRotations); //see notes below about skewY for why we subtract it from rotation here
					if (_supports3D) {
						m2.rotationX = _parseAngle(("rotationX" in v) ? v.rotationX : ("shortRotationX" in v) ? v.shortRotationX + "_short" : m1.rotationX || 0, m1.rotationX, "rotationX", endRotations);
						m2.rotationY = _parseAngle(("rotationY" in v) ? v.rotationY : ("shortRotationY" in v) ? v.shortRotationY + "_short" : m1.rotationY || 0, m1.rotationY, "rotationY", endRotations);
					}
					m2.skewX = _parseAngle(v.skewX, m1.skewX - m1.skewY); //see notes below about skewY and why we subtract it from skewX here
	
					//note: for performance reasons, we combine all skewing into the skewX and rotation values, ignoring skewY but we must still record it so that we can discern how much of the overall skew is attributed to skewX vs. skewY. Otherwise, if the skewY would always act relative (tween skewY to 10deg, for example, multiple times and if we always combine things into skewX, we can't remember that skewY was 10 from last time). Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of -10 degrees.
					if ((m2.skewY = _parseAngle(v.skewY, m1.skewY))) {
						m2.skewX += m2.skewY;
						m2.rotation += m2.skewY;
					}
				}
				if (_supports3D && v.force3D != null) {
					m1.force3D = v.force3D;
					hasChange = true;
				}
	
				m1.skewType = v.skewType || m1.skewType || CSSPlugin.defaultSkewType;
	
				has3D = (m1.force3D || m1.z || m1.rotationX || m1.rotationY || m2.z || m2.rotationX || m2.rotationY || m2.perspective);
				if (!has3D && v.scale != null) {
					m2.scaleZ = 1; //no need to tween scaleZ.
				}
	
				while (--i > -1) {
					p = _transformProps[i];
					orig = m2[p] - m1[p];
					if (orig > min || orig < -min || v[p] != null || _forcePT[p] != null) {
						hasChange = true;
						pt = new CSSPropTween(m1, p, m1[p], orig, pt);
						if (p in endRotations) {
							pt.e = endRotations[p]; //directional rotations typically have compensated values during the tween, but we need to make sure they end at exactly what the user requested
						}
						pt.xs0 = 0; //ensures the value stays numeric in setRatio()
						pt.plugin = plugin;
						cssp._overwriteProps.push(pt.n);
					}
				}
	
				orig = v.transformOrigin;
				if (m1.svg && (orig || v.svgOrigin)) {
					x = m1.xOffset; //when we change the origin, in order to prevent things from jumping we adjust the x/y so we must record those here so that we can create PropTweens for them and flip them at the same time as the origin
					y = m1.yOffset;
					_parseSVGOrigin(t, _parsePosition(orig), m2, v.svgOrigin, v.smoothOrigin);
					pt = _addNonTweeningNumericPT(m1, "xOrigin", (originalGSTransform ? m1 : m2).xOrigin, m2.xOrigin, pt, transformOriginString); //note: if there wasn't a transformOrigin defined yet, just start with the destination one; it's wasteful otherwise, and it causes problems with fromTo() tweens. For example, TweenLite.to("#wheel", 3, {rotation:180, transformOrigin:"50% 50%", delay:1}); TweenLite.fromTo("#wheel", 3, {scale:0.5, transformOrigin:"50% 50%"}, {scale:1, delay:2}); would cause a jump when the from values revert at the beginning of the 2nd tween.
					pt = _addNonTweeningNumericPT(m1, "yOrigin", (originalGSTransform ? m1 : m2).yOrigin, m2.yOrigin, pt, transformOriginString);
					if (x !== m1.xOffset || y !== m1.yOffset) {
						pt = _addNonTweeningNumericPT(m1, "xOffset", (originalGSTransform ? x : m1.xOffset), m1.xOffset, pt, transformOriginString);
						pt = _addNonTweeningNumericPT(m1, "yOffset", (originalGSTransform ? y : m1.yOffset), m1.yOffset, pt, transformOriginString);
					}
					orig = _useSVGTransformAttr ? null : "0px 0px"; //certain browsers (like firefox) completely botch transform-origin, so we must remove it to prevent it from contaminating transforms. We manage it ourselves with xOrigin and yOrigin
				}
				if (orig || (_supports3D && has3D && m1.zOrigin)) { //if anything 3D is happening and there's a transformOrigin with a z component that's non-zero, we must ensure that the transformOrigin's z-component is set to 0 so that we can manually do those calculations to get around Safari bugs. Even if the user didn't specifically define a "transformOrigin" in this particular tween (maybe they did it via css directly).
					if (_transformProp) {
						hasChange = true;
						p = _transformOriginProp;
						orig = (orig || _getStyle(t, p, _cs, false, "50% 50%")) + ""; //cast as string to avoid errors
						pt = new CSSPropTween(style, p, 0, 0, pt, -1, transformOriginString);
						pt.b = style[p];
						pt.plugin = plugin;
						if (_supports3D) {
							copy = m1.zOrigin;
							orig = orig.split(" ");
							m1.zOrigin = ((orig.length > 2 && !(copy !== 0 && orig[2] === "0px")) ? parseFloat(orig[2]) : copy) || 0; //Safari doesn't handle the z part of transformOrigin correctly, so we'll manually handle it in the _set3DTransformRatio() method.
							pt.xs0 = pt.e = orig[0] + " " + (orig[1] || "50%") + " 0px"; //we must define a z value of 0px specifically otherwise iOS 5 Safari will stick with the old one (if one was defined)!
							pt = new CSSPropTween(m1, "zOrigin", 0, 0, pt, -1, pt.n); //we must create a CSSPropTween for the _gsTransform.zOrigin so that it gets reset properly at the beginning if the tween runs backward (as opposed to just setting m1.zOrigin here)
							pt.b = copy;
							pt.xs0 = pt.e = m1.zOrigin;
						} else {
							pt.xs0 = pt.e = orig;
						}
	
						//for older versions of IE (6-8), we need to manually calculate things inside the setRatio() function. We record origin x and y (ox and oy) and whether or not the values are percentages (oxp and oyp).
					} else {
						_parsePosition(orig + "", m1);
					}
				}
				if (hasChange) {
					cssp._transformType = (!(m1.svg && _useSVGTransformAttr) && (has3D || this._transformType === 3)) ? 3 : 2; //quicker than calling cssp._enableTransforms();
				}
				return pt;
			}, prefix:true});
	
			_registerComplexSpecialProp("boxShadow", {defaultValue:"0px 0px 0px 0px #999", prefix:true, color:true, multi:true, keyword:"inset"});
	
			_registerComplexSpecialProp("borderRadius", {defaultValue:"0px", parser:function(t, e, p, cssp, pt, plugin) {
				e = this.format(e);
				var props = ["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],
					style = t.style,
					ea1, i, es2, bs2, bs, es, bn, en, w, h, esfx, bsfx, rel, hn, vn, em;
				w = parseFloat(t.offsetWidth);
				h = parseFloat(t.offsetHeight);
				ea1 = e.split(" ");
				for (i = 0; i < props.length; i++) { //if we're dealing with percentages, we must convert things separately for the horizontal and vertical axis!
					if (this.p.indexOf("border")) { //older browsers used a prefix
						props[i] = _checkPropPrefix(props[i]);
					}
					bs = bs2 = _getStyle(t, props[i], _cs, false, "0px");
					if (bs.indexOf(" ") !== -1) {
						bs2 = bs.split(" ");
						bs = bs2[0];
						bs2 = bs2[1];
					}
					es = es2 = ea1[i];
					bn = parseFloat(bs);
					bsfx = bs.substr((bn + "").length);
					rel = (es.charAt(1) === "=");
					if (rel) {
						en = parseInt(es.charAt(0)+"1", 10);
						es = es.substr(2);
						en *= parseFloat(es);
						esfx = es.substr((en + "").length - (en < 0 ? 1 : 0)) || "";
					} else {
						en = parseFloat(es);
						esfx = es.substr((en + "").length);
					}
					if (esfx === "") {
						esfx = _suffixMap[p] || bsfx;
					}
					if (esfx !== bsfx) {
						hn = _convertToPixels(t, "borderLeft", bn, bsfx); //horizontal number (we use a bogus "borderLeft" property just because the _convertToPixels() method searches for the keywords "Left", "Right", "Top", and "Bottom" to determine of it's a horizontal or vertical property, and we need "border" in the name so that it knows it should measure relative to the element itself, not its parent.
						vn = _convertToPixels(t, "borderTop", bn, bsfx); //vertical number
						if (esfx === "%") {
							bs = (hn / w * 100) + "%";
							bs2 = (vn / h * 100) + "%";
						} else if (esfx === "em") {
							em = _convertToPixels(t, "borderLeft", 1, "em");
							bs = (hn / em) + "em";
							bs2 = (vn / em) + "em";
						} else {
							bs = hn + "px";
							bs2 = vn + "px";
						}
						if (rel) {
							es = (parseFloat(bs) + en) + esfx;
							es2 = (parseFloat(bs2) + en) + esfx;
						}
					}
					pt = _parseComplex(style, props[i], bs + " " + bs2, es + " " + es2, false, "0px", pt);
				}
				return pt;
			}, prefix:true, formatter:_getFormatter("0px 0px 0px 0px", false, true)});
			_registerComplexSpecialProp("borderBottomLeftRadius,borderBottomRightRadius,borderTopLeftRadius,borderTopRightRadius", {defaultValue:"0px", parser:function(t, e, p, cssp, pt, plugin) {
				return _parseComplex(t.style, p, this.format(_getStyle(t, p, _cs, false, "0px 0px")), this.format(e), false, "0px", pt);
			}, prefix:true, formatter:_getFormatter("0px 0px", false, true)});
			_registerComplexSpecialProp("backgroundPosition", {defaultValue:"0 0", parser:function(t, e, p, cssp, pt, plugin) {
				var bp = "background-position",
					cs = (_cs || _getComputedStyle(t, null)),
					bs = this.format( ((cs) ? _ieVers ? cs.getPropertyValue(bp + "-x") + " " + cs.getPropertyValue(bp + "-y") : cs.getPropertyValue(bp) : t.currentStyle.backgroundPositionX + " " + t.currentStyle.backgroundPositionY) || "0 0"), //Internet Explorer doesn't report background-position correctly - we must query background-position-x and background-position-y and combine them (even in IE10). Before IE9, we must do the same with the currentStyle object and use camelCase
					es = this.format(e),
					ba, ea, i, pct, overlap, src;
				if ((bs.indexOf("%") !== -1) !== (es.indexOf("%") !== -1) && es.split(",").length < 2) {
					src = _getStyle(t, "backgroundImage").replace(_urlExp, "");
					if (src && src !== "none") {
						ba = bs.split(" ");
						ea = es.split(" ");
						_tempImg.setAttribute("src", src); //set the temp IMG's src to the background-image so that we can measure its width/height
						i = 2;
						while (--i > -1) {
							bs = ba[i];
							pct = (bs.indexOf("%") !== -1);
							if (pct !== (ea[i].indexOf("%") !== -1)) {
								overlap = (i === 0) ? t.offsetWidth - _tempImg.width : t.offsetHeight - _tempImg.height;
								ba[i] = pct ? (parseFloat(bs) / 100 * overlap) + "px" : (parseFloat(bs) / overlap * 100) + "%";
							}
						}
						bs = ba.join(" ");
					}
				}
				return this.parseComplex(t.style, bs, es, pt, plugin);
			}, formatter:_parsePosition});
			_registerComplexSpecialProp("backgroundSize", {defaultValue:"0 0", formatter:_parsePosition});
			_registerComplexSpecialProp("perspective", {defaultValue:"0px", prefix:true});
			_registerComplexSpecialProp("perspectiveOrigin", {defaultValue:"50% 50%", prefix:true});
			_registerComplexSpecialProp("transformStyle", {prefix:true});
			_registerComplexSpecialProp("backfaceVisibility", {prefix:true});
			_registerComplexSpecialProp("userSelect", {prefix:true});
			_registerComplexSpecialProp("margin", {parser:_getEdgeParser("marginTop,marginRight,marginBottom,marginLeft")});
			_registerComplexSpecialProp("padding", {parser:_getEdgeParser("paddingTop,paddingRight,paddingBottom,paddingLeft")});
			_registerComplexSpecialProp("clip", {defaultValue:"rect(0px,0px,0px,0px)", parser:function(t, e, p, cssp, pt, plugin){
				var b, cs, delim;
				if (_ieVers < 9) { //IE8 and earlier don't report a "clip" value in the currentStyle - instead, the values are split apart into clipTop, clipRight, clipBottom, and clipLeft. Also, in IE7 and earlier, the values inside rect() are space-delimited, not comma-delimited.
					cs = t.currentStyle;
					delim = _ieVers < 8 ? " " : ",";
					b = "rect(" + cs.clipTop + delim + cs.clipRight + delim + cs.clipBottom + delim + cs.clipLeft + ")";
					e = this.format(e).split(",").join(delim);
				} else {
					b = this.format(_getStyle(t, this.p, _cs, false, this.dflt));
					e = this.format(e);
				}
				return this.parseComplex(t.style, b, e, pt, plugin);
			}});
			_registerComplexSpecialProp("textShadow", {defaultValue:"0px 0px 0px #999", color:true, multi:true});
			_registerComplexSpecialProp("autoRound,strictUnits", {parser:function(t, e, p, cssp, pt) {return pt;}}); //just so that we can ignore these properties (not tween them)
			_registerComplexSpecialProp("border", {defaultValue:"0px solid #000", parser:function(t, e, p, cssp, pt, plugin) {
				var bw = _getStyle(t, "borderTopWidth", _cs, false, "0px"),
					end = this.format(e).split(" "),
					esfx = end[0].replace(_suffixExp, "");
				if (esfx !== "px") { //if we're animating to a non-px value, we need to convert the beginning width to that unit.
					bw = (parseFloat(bw) / _convertToPixels(t, "borderTopWidth", 1, esfx)) + esfx;
				}
				return this.parseComplex(t.style, this.format(bw + " " + _getStyle(t, "borderTopStyle", _cs, false, "solid") + " " + _getStyle(t, "borderTopColor", _cs, false, "#000")), end.join(" "), pt, plugin);
				}, color:true, formatter:function(v) {
					var a = v.split(" ");
					return a[0] + " " + (a[1] || "solid") + " " + (v.match(_colorExp) || ["#000"])[0];
				}});
			_registerComplexSpecialProp("borderWidth", {parser:_getEdgeParser("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")}); //Firefox doesn't pick up on borderWidth set in style sheets (only inline).
			_registerComplexSpecialProp("float,cssFloat,styleFloat", {parser:function(t, e, p, cssp, pt, plugin) {
				var s = t.style,
					prop = ("cssFloat" in s) ? "cssFloat" : "styleFloat";
				return new CSSPropTween(s, prop, 0, 0, pt, -1, p, false, 0, s[prop], e);
			}});
	
			//opacity-related
			var _setIEOpacityRatio = function(v) {
					var t = this.t, //refers to the element's style property
						filters = t.filter || _getStyle(this.data, "filter") || "",
						val = (this.s + this.c * v) | 0,
						skip;
					if (val === 100) { //for older versions of IE that need to use a filter to apply opacity, we should remove the filter if opacity hits 1 in order to improve performance, but make sure there isn't a transform (matrix) or gradient in the filters.
						if (filters.indexOf("atrix(") === -1 && filters.indexOf("radient(") === -1 && filters.indexOf("oader(") === -1) {
							t.removeAttribute("filter");
							skip = (!_getStyle(this.data, "filter")); //if a class is applied that has an alpha filter, it will take effect (we don't want that), so re-apply our alpha filter in that case. We must first remove it and then check.
						} else {
							t.filter = filters.replace(_alphaFilterExp, "");
							skip = true;
						}
					}
					if (!skip) {
						if (this.xn1) {
							t.filter = filters = filters || ("alpha(opacity=" + val + ")"); //works around bug in IE7/8 that prevents changes to "visibility" from being applied properly if the filter is changed to a different alpha on the same frame.
						}
						if (filters.indexOf("pacity") === -1) { //only used if browser doesn't support the standard opacity style property (IE 7 and 8). We omit the "O" to avoid case-sensitivity issues
							if (val !== 0 || !this.xn1) { //bugs in IE7/8 won't render the filter properly if opacity is ADDED on the same frame/render as "visibility" changes (this.xn1 is 1 if this tween is an "autoAlpha" tween)
								t.filter = filters + " alpha(opacity=" + val + ")"; //we round the value because otherwise, bugs in IE7/8 can prevent "visibility" changes from being applied properly.
							}
						} else {
							t.filter = filters.replace(_opacityExp, "opacity=" + val);
						}
					}
				};
			_registerComplexSpecialProp("opacity,alpha,autoAlpha", {defaultValue:"1", parser:function(t, e, p, cssp, pt, plugin) {
				var b = parseFloat(_getStyle(t, "opacity", _cs, false, "1")),
					style = t.style,
					isAutoAlpha = (p === "autoAlpha");
				if (typeof(e) === "string" && e.charAt(1) === "=") {
					e = ((e.charAt(0) === "-") ? -1 : 1) * parseFloat(e.substr(2)) + b;
				}
				if (isAutoAlpha && b === 1 && _getStyle(t, "visibility", _cs) === "hidden" && e !== 0) { //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
					b = 0;
				}
				if (_supportsOpacity) {
					pt = new CSSPropTween(style, "opacity", b, e - b, pt);
				} else {
					pt = new CSSPropTween(style, "opacity", b * 100, (e - b) * 100, pt);
					pt.xn1 = isAutoAlpha ? 1 : 0; //we need to record whether or not this is an autoAlpha so that in the setRatio(), we know to duplicate the setting of the alpha in order to work around a bug in IE7 and IE8 that prevents changes to "visibility" from taking effect if the filter is changed to a different alpha(opacity) at the same time. Setting it to the SAME value first, then the new value works around the IE7/8 bug.
					style.zoom = 1; //helps correct an IE issue.
					pt.type = 2;
					pt.b = "alpha(opacity=" + pt.s + ")";
					pt.e = "alpha(opacity=" + (pt.s + pt.c) + ")";
					pt.data = t;
					pt.plugin = plugin;
					pt.setRatio = _setIEOpacityRatio;
				}
				if (isAutoAlpha) { //we have to create the "visibility" PropTween after the opacity one in the linked list so that they run in the order that works properly in IE8 and earlier
					pt = new CSSPropTween(style, "visibility", 0, 0, pt, -1, null, false, 0, ((b !== 0) ? "inherit" : "hidden"), ((e === 0) ? "hidden" : "inherit"));
					pt.xs0 = "inherit";
					cssp._overwriteProps.push(pt.n);
					cssp._overwriteProps.push(p);
				}
				return pt;
			}});
	
	
			var _removeProp = function(s, p) {
					if (p) {
						if (s.removeProperty) {
							if (p.substr(0,2) === "ms" || p.substr(0,6) === "webkit") { //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
								p = "-" + p;
							}
							s.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
						} else { //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
							s.removeAttribute(p);
						}
					}
				},
				_setClassNameRatio = function(v) {
					this.t._gsClassPT = this;
					if (v === 1 || v === 0) {
						this.t.setAttribute("class", (v === 0) ? this.b : this.e);
						var mpt = this.data, //first MiniPropTween
							s = this.t.style;
						while (mpt) {
							if (!mpt.v) {
								_removeProp(s, mpt.p);
							} else {
								s[mpt.p] = mpt.v;
							}
							mpt = mpt._next;
						}
						if (v === 1 && this.t._gsClassPT === this) {
							this.t._gsClassPT = null;
						}
					} else if (this.t.getAttribute("class") !== this.e) {
						this.t.setAttribute("class", this.e);
					}
				};
			_registerComplexSpecialProp("className", {parser:function(t, e, p, cssp, pt, plugin, vars) {
				var b = t.getAttribute("class") || "", //don't use t.className because it doesn't work consistently on SVG elements; getAttribute("class") and setAttribute("class", value") is more reliable.
					cssText = t.style.cssText,
					difData, bs, cnpt, cnptLookup, mpt;
				pt = cssp._classNamePT = new CSSPropTween(t, p, 0, 0, pt, 2);
				pt.setRatio = _setClassNameRatio;
				pt.pr = -11;
				_hasPriority = true;
				pt.b = b;
				bs = _getAllStyles(t, _cs);
				//if there's a className tween already operating on the target, force it to its end so that the necessary inline styles are removed and the class name is applied before we determine the end state (we don't want inline styles interfering that were there just for class-specific values)
				cnpt = t._gsClassPT;
				if (cnpt) {
					cnptLookup = {};
					mpt = cnpt.data; //first MiniPropTween which stores the inline styles - we need to force these so that the inline styles don't contaminate things. Otherwise, there's a small chance that a tween could start and the inline values match the destination values and they never get cleaned.
					while (mpt) {
						cnptLookup[mpt.p] = 1;
						mpt = mpt._next;
					}
					cnpt.setRatio(1);
				}
				t._gsClassPT = pt;
				pt.e = (e.charAt(1) !== "=") ? e : b.replace(new RegExp("(?:\\s|^)" + e.substr(2) + "(?![\\w-])"), "") + ((e.charAt(0) === "+") ? " " + e.substr(2) : "");
				t.setAttribute("class", pt.e);
				difData = _cssDif(t, bs, _getAllStyles(t), vars, cnptLookup);
				t.setAttribute("class", b);
				pt.data = difData.firstMPT;
				t.style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
				pt = pt.xfirst = cssp.parse(t, difData.difs, pt, plugin); //we record the CSSPropTween as the xfirst so that we can handle overwriting propertly (if "className" gets overwritten, we must kill all the properties associated with the className part of the tween, so we can loop through from xfirst to the pt itself)
				return pt;
			}});
	
	
			var _setClearPropsRatio = function(v) {
				if (v === 1 || v === 0) if (this.data._totalTime === this.data._totalDuration && this.data.data !== "isFromStart") { //this.data refers to the tween. Only clear at the END of the tween (remember, from() tweens make the ratio go from 1 to 0, so we can't just check that and if the tween is the zero-duration one that's created internally to render the starting values in a from() tween, ignore that because otherwise, for example, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in).
					var s = this.t.style,
						transformParse = _specialProps.transform.parse,
						a, p, i, clearTransform, transform;
					if (this.e === "all") {
						s.cssText = "";
						clearTransform = true;
					} else {
						a = this.e.split(" ").join("").split(",");
						i = a.length;
						while (--i > -1) {
							p = a[i];
							if (_specialProps[p]) {
								if (_specialProps[p].parse === transformParse) {
									clearTransform = true;
								} else {
									p = (p === "transformOrigin") ? _transformOriginProp : _specialProps[p].p; //ensures that special properties use the proper browser-specific property name, like "scaleX" might be "-webkit-transform" or "boxShadow" might be "-moz-box-shadow"
								}
							}
							_removeProp(s, p);
						}
					}
					if (clearTransform) {
						_removeProp(s, _transformProp);
						transform = this.t._gsTransform;
						if (transform) {
							if (transform.svg) {
								this.t.removeAttribute("data-svg-origin");
								this.t.removeAttribute("transform");
							}
							delete this.t._gsTransform;
						}
					}
	
				}
			};
			_registerComplexSpecialProp("clearProps", {parser:function(t, e, p, cssp, pt) {
				pt = new CSSPropTween(t, p, 0, 0, pt, 2);
				pt.setRatio = _setClearPropsRatio;
				pt.e = e;
				pt.pr = -10;
				pt.data = cssp._tween;
				_hasPriority = true;
				return pt;
			}});
	
			p = "bezier,throwProps,physicsProps,physics2D".split(",");
			i = p.length;
			while (i--) {
				_registerPluginProp(p[i]);
			}
	
	
	
	
	
	
	
	
			p = CSSPlugin.prototype;
			p._firstPT = p._lastParsedTransform = p._transform = null;
	
			//gets called when the tween renders for the first time. This kicks everything off, recording start/end values, etc.
			p._onInitTween = function(target, vars, tween) {
				if (!target.nodeType) { //css is only for dom elements
					return false;
				}
				this._target = target;
				this._tween = tween;
				this._vars = vars;
				_autoRound = vars.autoRound;
				_hasPriority = false;
				_suffixMap = vars.suffixMap || CSSPlugin.suffixMap;
				_cs = _getComputedStyle(target, "");
				_overwriteProps = this._overwriteProps;
				var style = target.style,
					v, pt, pt2, first, last, next, zIndex, tpt, threeD;
				if (_reqSafariFix) if (style.zIndex === "") {
					v = _getStyle(target, "zIndex", _cs);
					if (v === "auto" || v === "") {
						//corrects a bug in [non-Android] Safari that prevents it from repainting elements in their new positions if they don't have a zIndex set. We also can't just apply this inside _parseTransform() because anything that's moved in any way (like using "left" or "top" instead of transforms like "x" and "y") can be affected, so it is best to ensure that anything that's tweening has a z-index. Setting "WebkitPerspective" to a non-zero value worked too except that on iOS Safari things would flicker randomly. Plus zIndex is less memory-intensive.
						this._addLazySet(style, "zIndex", 0);
					}
				}
	
				if (typeof(vars) === "string") {
					first = style.cssText;
					v = _getAllStyles(target, _cs);
					style.cssText = first + ";" + vars;
					v = _cssDif(target, v, _getAllStyles(target)).difs;
					if (!_supportsOpacity && _opacityValExp.test(vars)) {
						v.opacity = parseFloat( RegExp.$1 );
					}
					vars = v;
					style.cssText = first;
				}
	
				if (vars.className) { //className tweens will combine any differences they find in the css with the vars that are passed in, so {className:"myClass", scale:0.5, left:20} would work.
					this._firstPT = pt = _specialProps.className.parse(target, vars.className, "className", this, null, null, vars);
				} else {
					this._firstPT = pt = this.parse(target, vars, null);
				}
	
				if (this._transformType) {
					threeD = (this._transformType === 3);
					if (!_transformProp) {
						style.zoom = 1; //helps correct an IE issue.
					} else if (_isSafari) {
						_reqSafariFix = true;
						//if zIndex isn't set, iOS Safari doesn't repaint things correctly sometimes (seemingly at random).
						if (style.zIndex === "") {
							zIndex = _getStyle(target, "zIndex", _cs);
							if (zIndex === "auto" || zIndex === "") {
								this._addLazySet(style, "zIndex", 0);
							}
						}
						//Setting WebkitBackfaceVisibility corrects 3 bugs:
						// 1) [non-Android] Safari skips rendering changes to "top" and "left" that are made on the same frame/render as a transform update.
						// 2) iOS Safari sometimes neglects to repaint elements in their new positions. Setting "WebkitPerspective" to a non-zero value worked too except that on iOS Safari things would flicker randomly.
						// 3) Safari sometimes displayed odd artifacts when tweening the transform (or WebkitTransform) property, like ghosts of the edges of the element remained. Definitely a browser bug.
						//Note: we allow the user to override the auto-setting by defining WebkitBackfaceVisibility in the vars of the tween.
						if (_isSafariLT6) {
							this._addLazySet(style, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (threeD ? "visible" : "hidden"));
						}
					}
					pt2 = pt;
					while (pt2 && pt2._next) {
						pt2 = pt2._next;
					}
					tpt = new CSSPropTween(target, "transform", 0, 0, null, 2);
					this._linkCSSP(tpt, null, pt2);
					tpt.setRatio = _transformProp ? _setTransformRatio : _setIETransformRatio;
					tpt.data = this._transform || _getTransform(target, _cs, true);
					tpt.tween = tween;
					tpt.pr = -1; //ensures that the transforms get applied after the components are updated.
					_overwriteProps.pop(); //we don't want to force the overwrite of all "transform" tweens of the target - we only care about individual transform properties like scaleX, rotation, etc. The CSSPropTween constructor automatically adds the property to _overwriteProps which is why we need to pop() here.
				}
	
				if (_hasPriority) {
					//reorders the linked list in order of pr (priority)
					while (pt) {
						next = pt._next;
						pt2 = first;
						while (pt2 && pt2.pr > pt.pr) {
							pt2 = pt2._next;
						}
						if ((pt._prev = pt2 ? pt2._prev : last)) {
							pt._prev._next = pt;
						} else {
							first = pt;
						}
						if ((pt._next = pt2)) {
							pt2._prev = pt;
						} else {
							last = pt;
						}
						pt = next;
					}
					this._firstPT = first;
				}
				return true;
			};
	
	
			p.parse = function(target, vars, pt, plugin) {
				var style = target.style,
					p, sp, bn, en, bs, es, bsfx, esfx, isStr, rel;
				for (p in vars) {
					es = vars[p]; //ending value string
					sp = _specialProps[p]; //SpecialProp lookup.
					if (sp) {
						pt = sp.parse(target, es, p, this, pt, plugin, vars);
	
					} else {
						bs = _getStyle(target, p, _cs) + "";
						isStr = (typeof(es) === "string");
						if (p === "color" || p === "fill" || p === "stroke" || p.indexOf("Color") !== -1 || (isStr && _rgbhslExp.test(es))) { //Opera uses background: to define color sometimes in addition to backgroundColor:
							if (!isStr) {
								es = _parseColor(es);
								es = ((es.length > 3) ? "rgba(" : "rgb(") + es.join(",") + ")";
							}
							pt = _parseComplex(style, p, bs, es, true, "transparent", pt, 0, plugin);
	
						} else if (isStr && _complexExp.test(es)) {
							pt = _parseComplex(style, p, bs, es, true, null, pt, 0, plugin);
	
						} else {
							bn = parseFloat(bs);
							bsfx = (bn || bn === 0) ? bs.substr((bn + "").length) : ""; //remember, bs could be non-numeric like "normal" for fontWeight, so we should default to a blank suffix in that case.
	
							if (bs === "" || bs === "auto") {
								if (p === "width" || p === "height") {
									bn = _getDimension(target, p, _cs);
									bsfx = "px";
								} else if (p === "left" || p === "top") {
									bn = _calculateOffset(target, p, _cs);
									bsfx = "px";
								} else {
									bn = (p !== "opacity") ? 0 : 1;
									bsfx = "";
								}
							}
	
							rel = (isStr && es.charAt(1) === "=");
							if (rel) {
								en = parseInt(es.charAt(0) + "1", 10);
								es = es.substr(2);
								en *= parseFloat(es);
								esfx = es.replace(_suffixExp, "");
							} else {
								en = parseFloat(es);
								esfx = isStr ? es.replace(_suffixExp, "") : "";
							}
	
							if (esfx === "") {
								esfx = (p in _suffixMap) ? _suffixMap[p] : bsfx; //populate the end suffix, prioritizing the map, then if none is found, use the beginning suffix.
							}
	
							es = (en || en === 0) ? (rel ? en + bn : en) + esfx : vars[p]; //ensures that any += or -= prefixes are taken care of. Record the end value before normalizing the suffix because we always want to end the tween on exactly what they intended even if it doesn't match the beginning value's suffix.
	
							//if the beginning/ending suffixes don't match, normalize them...
							if (bsfx !== esfx) if (esfx !== "") if (en || en === 0) if (bn) { //note: if the beginning value (bn) is 0, we don't need to convert units!
								bn = _convertToPixels(target, p, bn, bsfx);
								if (esfx === "%") {
									bn /= _convertToPixels(target, p, 100, "%") / 100;
									if (vars.strictUnits !== true) { //some browsers report only "px" values instead of allowing "%" with getComputedStyle(), so we assume that if we're tweening to a %, we should start there too unless strictUnits:true is defined. This approach is particularly useful for responsive designs that use from() tweens.
										bs = bn + "%";
									}
	
								} else if (esfx === "em" || esfx === "rem" || esfx === "vw" || esfx === "vh") {
									bn /= _convertToPixels(target, p, 1, esfx);
	
								//otherwise convert to pixels.
								} else if (esfx !== "px") {
									en = _convertToPixels(target, p, en, esfx);
									esfx = "px"; //we don't use bsfx after this, so we don't need to set it to px too.
								}
								if (rel) if (en || en === 0) {
									es = (en + bn) + esfx; //the changes we made affect relative calculations, so adjust the end value here.
								}
							}
	
							if (rel) {
								en += bn;
							}
	
							if ((bn || bn === 0) && (en || en === 0)) { //faster than isNaN(). Also, previously we required en !== bn but that doesn't really gain much performance and it prevents _parseToProxy() from working properly if beginning and ending values match but need to get tweened by an external plugin anyway. For example, a bezier tween where the target starts at left:0 and has these points: [{left:50},{left:0}] wouldn't work properly because when parsing the last point, it'd match the first (current) one and a non-tweening CSSPropTween would be recorded when we actually need a normal tween (type:0) so that things get updated during the tween properly.
								pt = new CSSPropTween(style, p, bn, en - bn, pt, 0, p, (_autoRound !== false && (esfx === "px" || p === "zIndex")), 0, bs, es);
								pt.xs0 = esfx;
								//DEBUG: _log("tween "+p+" from "+pt.b+" ("+bn+esfx+") to "+pt.e+" with suffix: "+pt.xs0);
							} else if (style[p] === undefined || !es && (es + "" === "NaN" || es == null)) {
								_log("invalid " + p + " tween value: " + vars[p]);
							} else {
								pt = new CSSPropTween(style, p, en || bn || 0, 0, pt, -1, p, false, 0, bs, es);
								pt.xs0 = (es === "none" && (p === "display" || p.indexOf("Style") !== -1)) ? bs : es; //intermediate value should typically be set immediately (end value) except for "display" or things like borderTopStyle, borderBottomStyle, etc. which should use the beginning value during the tween.
								//DEBUG: _log("non-tweening value "+p+": "+pt.xs0);
							}
						}
					}
					if (plugin) if (pt && !pt.plugin) {
						pt.plugin = plugin;
					}
				}
				return pt;
			};
	
	
			//gets called every time the tween updates, passing the new ratio (typically a value between 0 and 1, but not always (for example, if an Elastic.easeOut is used, the value can jump above 1 mid-tween). It will always start and 0 and end at 1.
			p.setRatio = function(v) {
				var pt = this._firstPT,
					min = 0.000001,
					val, str, i;
				//at the end of the tween, we set the values to exactly what we received in order to make sure non-tweening values (like "position" or "float" or whatever) are set and so that if the beginning/ending suffixes (units) didn't match and we normalized to px, the value that the user passed in is used here. We check to see if the tween is at its beginning in case it's a from() tween in which case the ratio will actually go from 1 to 0 over the course of the tween (backwards).
				if (v === 1 && (this._tween._time === this._tween._duration || this._tween._time === 0)) {
					while (pt) {
						if (pt.type !== 2) {
							if (pt.r && pt.type !== -1) {
								val = Math.round(pt.s + pt.c);
								if (!pt.type) {
									pt.t[pt.p] = val + pt.xs0;
								} else if (pt.type === 1) { //complex value (one that typically has multiple numbers inside a string, like "rect(5px,10px,20px,25px)"
									i = pt.l;
									str = pt.xs0 + val + pt.xs1;
									for (i = 1; i < pt.l; i++) {
										str += pt["xn"+i] + pt["xs"+(i+1)];
									}
									pt.t[pt.p] = str;
								}
							} else {
								pt.t[pt.p] = pt.e;
							}
						} else {
							pt.setRatio(v);
						}
						pt = pt._next;
					}
	
				} else if (v || !(this._tween._time === this._tween._duration || this._tween._time === 0) || this._tween._rawPrevTime === -0.000001) {
					while (pt) {
						val = pt.c * v + pt.s;
						if (pt.r) {
							val = Math.round(val);
						} else if (val < min) if (val > -min) {
							val = 0;
						}
						if (!pt.type) {
							pt.t[pt.p] = val + pt.xs0;
						} else if (pt.type === 1) { //complex value (one that typically has multiple numbers inside a string, like "rect(5px,10px,20px,25px)"
							i = pt.l;
							if (i === 2) {
								pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2;
							} else if (i === 3) {
								pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3;
							} else if (i === 4) {
								pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4;
							} else if (i === 5) {
								pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4 + pt.xn4 + pt.xs5;
							} else {
								str = pt.xs0 + val + pt.xs1;
								for (i = 1; i < pt.l; i++) {
									str += pt["xn"+i] + pt["xs"+(i+1)];
								}
								pt.t[pt.p] = str;
							}
	
						} else if (pt.type === -1) { //non-tweening value
							pt.t[pt.p] = pt.xs0;
	
						} else if (pt.setRatio) { //custom setRatio() for things like SpecialProps, external plugins, etc.
							pt.setRatio(v);
						}
						pt = pt._next;
					}
	
				//if the tween is reversed all the way back to the beginning, we need to restore the original values which may have different units (like % instead of px or em or whatever).
				} else {
					while (pt) {
						if (pt.type !== 2) {
							pt.t[pt.p] = pt.b;
						} else {
							pt.setRatio(v);
						}
						pt = pt._next;
					}
				}
			};
	
			/**
			 * @private
			 * Forces rendering of the target's transforms (rotation, scale, etc.) whenever the CSSPlugin's setRatio() is called.
			 * Basically, this tells the CSSPlugin to create a CSSPropTween (type 2) after instantiation that runs last in the linked
			 * list and calls the appropriate (3D or 2D) rendering function. We separate this into its own method so that we can call
			 * it from other plugins like BezierPlugin if, for example, it needs to apply an autoRotation and this CSSPlugin
			 * doesn't have any transform-related properties of its own. You can call this method as many times as you
			 * want and it won't create duplicate CSSPropTweens.
			 *
			 * @param {boolean} threeD if true, it should apply 3D tweens (otherwise, just 2D ones are fine and typically faster)
			 */
			p._enableTransforms = function(threeD) {
				this._transform = this._transform || _getTransform(this._target, _cs, true); //ensures that the element has a _gsTransform property with the appropriate values.
				this._transformType = (!(this._transform.svg && _useSVGTransformAttr) && (threeD || this._transformType === 3)) ? 3 : 2;
			};
	
			var lazySet = function(v) {
				this.t[this.p] = this.e;
				this.data._linkCSSP(this, this._next, null, true); //we purposefully keep this._next even though it'd make sense to null it, but this is a performance optimization, as this happens during the while (pt) {} loop in setRatio() at the bottom of which it sets pt = pt._next, so if we null it, the linked list will be broken in that loop.
			};
			/** @private Gives us a way to set a value on the first render (and only the first render). **/
			p._addLazySet = function(t, p, v) {
				var pt = this._firstPT = new CSSPropTween(t, p, 0, 0, this._firstPT, 2);
				pt.e = v;
				pt.setRatio = lazySet;
				pt.data = this;
			};
	
			/** @private **/
			p._linkCSSP = function(pt, next, prev, remove) {
				if (pt) {
					if (next) {
						next._prev = pt;
					}
					if (pt._next) {
						pt._next._prev = pt._prev;
					}
					if (pt._prev) {
						pt._prev._next = pt._next;
					} else if (this._firstPT === pt) {
						this._firstPT = pt._next;
						remove = true; //just to prevent resetting this._firstPT 5 lines down in case pt._next is null. (optimized for speed)
					}
					if (prev) {
						prev._next = pt;
					} else if (!remove && this._firstPT === null) {
						this._firstPT = pt;
					}
					pt._next = next;
					pt._prev = prev;
				}
				return pt;
			};
	
			//we need to make sure that if alpha or autoAlpha is killed, opacity is too. And autoAlpha affects the "visibility" property.
			p._kill = function(lookup) {
				var copy = lookup,
					pt, p, xfirst;
				if (lookup.autoAlpha || lookup.alpha) {
					copy = {};
					for (p in lookup) { //copy the lookup so that we're not changing the original which may be passed elsewhere.
						copy[p] = lookup[p];
					}
					copy.opacity = 1;
					if (copy.autoAlpha) {
						copy.visibility = 1;
					}
				}
				if (lookup.className && (pt = this._classNamePT)) { //for className tweens, we need to kill any associated CSSPropTweens too; a linked list starts at the className's "xfirst".
					xfirst = pt.xfirst;
					if (xfirst && xfirst._prev) {
						this._linkCSSP(xfirst._prev, pt._next, xfirst._prev._prev); //break off the prev
					} else if (xfirst === this._firstPT) {
						this._firstPT = pt._next;
					}
					if (pt._next) {
						this._linkCSSP(pt._next, pt._next._next, xfirst._prev);
					}
					this._classNamePT = null;
				}
				return TweenPlugin.prototype._kill.call(this, copy);
			};
	
	
	
			//used by cascadeTo() for gathering all the style properties of each child element into an array for comparison.
			var _getChildStyles = function(e, props, targets) {
					var children, i, child, type;
					if (e.slice) {
						i = e.length;
						while (--i > -1) {
							_getChildStyles(e[i], props, targets);
						}
						return;
					}
					children = e.childNodes;
					i = children.length;
					while (--i > -1) {
						child = children[i];
						type = child.type;
						if (child.style) {
							props.push(_getAllStyles(child));
							if (targets) {
								targets.push(child);
							}
						}
						if ((type === 1 || type === 9 || type === 11) && child.childNodes.length) {
							_getChildStyles(child, props, targets);
						}
					}
				};
	
			/**
			 * Typically only useful for className tweens that may affect child elements, this method creates a TweenLite
			 * and then compares the style properties of all the target's child elements at the tween's start and end, and
			 * if any are different, it also creates tweens for those and returns an array containing ALL of the resulting
			 * tweens (so that you can easily add() them to a TimelineLite, for example). The reason this functionality is
			 * wrapped into a separate static method of CSSPlugin instead of being integrated into all regular className tweens
			 * is because it creates entirely new tweens that may have completely different targets than the original tween,
			 * so if they were all lumped into the original tween instance, it would be inconsistent with the rest of the API
			 * and it would create other problems. For example:
			 *  - If I create a tween of elementA, that tween instance may suddenly change its target to include 50 other elements (unintuitive if I specifically defined the target I wanted)
			 *  - We can't just create new independent tweens because otherwise, what happens if the original/parent tween is reversed or pause or dropped into a TimelineLite for tight control? You'd expect that tween's behavior to affect all the others.
			 *  - Analyzing every style property of every child before and after the tween is an expensive operation when there are many children, so this behavior shouldn't be imposed on all className tweens by default, especially since it's probably rare that this extra functionality is needed.
			 *
			 * @param {Object} target object to be tweened
			 * @param {number} Duration in seconds (or frames for frames-based tweens)
			 * @param {Object} Object containing the end values, like {className:"newClass", ease:Linear.easeNone}
			 * @return {Array} An array of TweenLite instances
			 */
			CSSPlugin.cascadeTo = function(target, duration, vars) {
				var tween = TweenLite.to(target, duration, vars),
					results = [tween],
					b = [],
					e = [],
					targets = [],
					_reservedProps = TweenLite._internals.reservedProps,
					i, difs, p, from;
				target = tween._targets || tween.target;
				_getChildStyles(target, b, targets);
				tween.render(duration, true, true);
				_getChildStyles(target, e);
				tween.render(0, true, true);
				tween._enabled(true);
				i = targets.length;
				while (--i > -1) {
					difs = _cssDif(targets[i], b[i], e[i]);
					if (difs.firstMPT) {
						difs = difs.difs;
						for (p in vars) {
							if (_reservedProps[p]) {
								difs[p] = vars[p];
							}
						}
						from = {};
						for (p in difs) {
							from[p] = b[i][p];
						}
						results.push(TweenLite.fromTo(targets[i], duration, from, difs));
					}
				}
				return results;
			};
	
			TweenPlugin.activate([CSSPlugin]);
			return CSSPlugin;
	
		}, true);
	
		
		
		
		
		
		
		
		
		
		
	/*
	 * ----------------------------------------------------------------
	 * RoundPropsPlugin
	 * ----------------------------------------------------------------
	 */
		(function() {
	
			var RoundPropsPlugin = _gsScope._gsDefine.plugin({
					propName: "roundProps",
					version: "1.5",
					priority: -1,
					API: 2,
	
					//called when the tween renders for the first time. This is where initial values should be recorded and any setup routines should run.
					init: function(target, value, tween) {
						this._tween = tween;
						return true;
					}
	
				}),
				_roundLinkedList = function(node) {
					while (node) {
						if (!node.f && !node.blob) {
							node.r = 1;
						}
						node = node._next;
					}
				},
				p = RoundPropsPlugin.prototype;
	
			p._onInitAllProps = function() {
				var tween = this._tween,
					rp = (tween.vars.roundProps.join) ? tween.vars.roundProps : tween.vars.roundProps.split(","),
					i = rp.length,
					lookup = {},
					rpt = tween._propLookup.roundProps,
					prop, pt, next;
				while (--i > -1) {
					lookup[rp[i]] = 1;
				}
				i = rp.length;
				while (--i > -1) {
					prop = rp[i];
					pt = tween._firstPT;
					while (pt) {
						next = pt._next; //record here, because it may get removed
						if (pt.pg) {
							pt.t._roundProps(lookup, true);
						} else if (pt.n === prop) {
							if (pt.f === 2 && pt.t) { //a blob (text containing multiple numeric values)
								_roundLinkedList(pt.t._firstPT);
							} else {
								this._add(pt.t, prop, pt.s, pt.c);
								//remove from linked list
								if (next) {
									next._prev = pt._prev;
								}
								if (pt._prev) {
									pt._prev._next = next;
								} else if (tween._firstPT === pt) {
									tween._firstPT = next;
								}
								pt._next = pt._prev = null;
								tween._propLookup[prop] = rpt;
							}
						}
						pt = next;
					}
				}
				return false;
			};
	
			p._add = function(target, p, s, c) {
				this._addTween(target, p, s, s + c, p, true);
				this._overwriteProps.push(p);
			};
	
		}());
	
	
	
	
	
	
	
	
	
	
	/*
	 * ----------------------------------------------------------------
	 * AttrPlugin
	 * ----------------------------------------------------------------
	 */
	
		(function() {
	
			_gsScope._gsDefine.plugin({
				propName: "attr",
				API: 2,
				version: "0.5.0",
	
				//called when the tween renders for the first time. This is where initial values should be recorded and any setup routines should run.
				init: function(target, value, tween) {
					var p;
					if (typeof(target.setAttribute) !== "function") {
						return false;
					}
					for (p in value) {
						this._addTween(target, "setAttribute", target.getAttribute(p) + "", value[p] + "", p, false, p);
						this._overwriteProps.push(p);
					}
					return true;
				}
	
			});
	
		}());
	
	
	
	
	
	
	
	
	
	
	/*
	 * ----------------------------------------------------------------
	 * DirectionalRotationPlugin
	 * ----------------------------------------------------------------
	 */
		_gsScope._gsDefine.plugin({
			propName: "directionalRotation",
			version: "0.2.1",
			API: 2,
	
			//called when the tween renders for the first time. This is where initial values should be recorded and any setup routines should run.
			init: function(target, value, tween) {
				if (typeof(value) !== "object") {
					value = {rotation:value};
				}
				this.finals = {};
				var cap = (value.useRadians === true) ? Math.PI * 2 : 360,
					min = 0.000001,
					p, v, start, end, dif, split;
				for (p in value) {
					if (p !== "useRadians") {
						split = (value[p] + "").split("_");
						v = split[0];
						start = parseFloat( (typeof(target[p]) !== "function") ? target[p] : target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]() );
						end = this.finals[p] = (typeof(v) === "string" && v.charAt(1) === "=") ? start + parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) : Number(v) || 0;
						dif = end - start;
						if (split.length) {
							v = split.join("_");
							if (v.indexOf("short") !== -1) {
								dif = dif % cap;
								if (dif !== dif % (cap / 2)) {
									dif = (dif < 0) ? dif + cap : dif - cap;
								}
							}
							if (v.indexOf("_cw") !== -1 && dif < 0) {
								dif = ((dif + cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
							} else if (v.indexOf("ccw") !== -1 && dif > 0) {
								dif = ((dif - cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
							}
						}
						if (dif > min || dif < -min) {
							this._addTween(target, p, start, start + dif, p);
							this._overwriteProps.push(p);
						}
					}
				}
				return true;
			},
	
			//called each time the values should be updated, and the ratio gets passed as the only parameter (typically it's a value between 0 and 1, but it can exceed those when using an ease like Elastic.easeOut or Back.easeOut, etc.)
			set: function(ratio) {
				var pt;
				if (ratio !== 1) {
					this._super.setRatio.call(this, ratio);
				} else {
					pt = this._firstPT;
					while (pt) {
						if (pt.f) {
							pt.t[pt.p](this.finals[pt.p]);
						} else {
							pt.t[pt.p] = this.finals[pt.p];
						}
						pt = pt._next;
					}
				}
			}
	
		})._autoCSS = true;
	
	
	
	
	
	
	
		
		
		
		
	/*
	 * ----------------------------------------------------------------
	 * EasePack
	 * ----------------------------------------------------------------
	 */
		_gsScope._gsDefine("easing.Back", ["easing.Ease"], function(Ease) {
			
			var w = (_gsScope.GreenSockGlobals || _gsScope),
				gs = w.com.greensock,
				_2PI = Math.PI * 2,
				_HALF_PI = Math.PI / 2,
				_class = gs._class,
				_create = function(n, f) {
					var C = _class("easing." + n, function(){}, true),
						p = C.prototype = new Ease();
					p.constructor = C;
					p.getRatio = f;
					return C;
				},
				_easeReg = Ease.register || function(){}, //put an empty function in place just as a safety measure in case someone loads an OLD version of TweenLite.js where Ease.register doesn't exist.
				_wrap = function(name, EaseOut, EaseIn, EaseInOut, aliases) {
					var C = _class("easing."+name, {
						easeOut:new EaseOut(),
						easeIn:new EaseIn(),
						easeInOut:new EaseInOut()
					}, true);
					_easeReg(C, name);
					return C;
				},
				EasePoint = function(time, value, next) {
					this.t = time;
					this.v = value;
					if (next) {
						this.next = next;
						next.prev = this;
						this.c = next.v - value;
						this.gap = next.t - time;
					}
				},
	
				//Back
				_createBack = function(n, f) {
					var C = _class("easing." + n, function(overshoot) {
							this._p1 = (overshoot || overshoot === 0) ? overshoot : 1.70158;
							this._p2 = this._p1 * 1.525;
						}, true),
						p = C.prototype = new Ease();
					p.constructor = C;
					p.getRatio = f;
					p.config = function(overshoot) {
						return new C(overshoot);
					};
					return C;
				},
	
				Back = _wrap("Back",
					_createBack("BackOut", function(p) {
						return ((p = p - 1) * p * ((this._p1 + 1) * p + this._p1) + 1);
					}),
					_createBack("BackIn", function(p) {
						return p * p * ((this._p1 + 1) * p - this._p1);
					}),
					_createBack("BackInOut", function(p) {
						return ((p *= 2) < 1) ? 0.5 * p * p * ((this._p2 + 1) * p - this._p2) : 0.5 * ((p -= 2) * p * ((this._p2 + 1) * p + this._p2) + 2);
					})
				),
	
	
				//SlowMo
				SlowMo = _class("easing.SlowMo", function(linearRatio, power, yoyoMode) {
					power = (power || power === 0) ? power : 0.7;
					if (linearRatio == null) {
						linearRatio = 0.7;
					} else if (linearRatio > 1) {
						linearRatio = 1;
					}
					this._p = (linearRatio !== 1) ? power : 0;
					this._p1 = (1 - linearRatio) / 2;
					this._p2 = linearRatio;
					this._p3 = this._p1 + this._p2;
					this._calcEnd = (yoyoMode === true);
				}, true),
				p = SlowMo.prototype = new Ease(),
				SteppedEase, RoughEase, _createElastic;
	
			p.constructor = SlowMo;
			p.getRatio = function(p) {
				var r = p + (0.5 - p) * this._p;
				if (p < this._p1) {
					return this._calcEnd ? 1 - ((p = 1 - (p / this._p1)) * p) : r - ((p = 1 - (p / this._p1)) * p * p * p * r);
				} else if (p > this._p3) {
					return this._calcEnd ? 1 - (p = (p - this._p3) / this._p1) * p : r + ((p - r) * (p = (p - this._p3) / this._p1) * p * p * p);
				}
				return this._calcEnd ? 1 : r;
			};
			SlowMo.ease = new SlowMo(0.7, 0.7);
	
			p.config = SlowMo.config = function(linearRatio, power, yoyoMode) {
				return new SlowMo(linearRatio, power, yoyoMode);
			};
	
	
			//SteppedEase
			SteppedEase = _class("easing.SteppedEase", function(steps) {
					steps = steps || 1;
					this._p1 = 1 / steps;
					this._p2 = steps + 1;
				}, true);
			p = SteppedEase.prototype = new Ease();
			p.constructor = SteppedEase;
			p.getRatio = function(p) {
				if (p < 0) {
					p = 0;
				} else if (p >= 1) {
					p = 0.999999999;
				}
				return ((this._p2 * p) >> 0) * this._p1;
			};
			p.config = SteppedEase.config = function(steps) {
				return new SteppedEase(steps);
			};
	
	
			//RoughEase
			RoughEase = _class("easing.RoughEase", function(vars) {
				vars = vars || {};
				var taper = vars.taper || "none",
					a = [],
					cnt = 0,
					points = (vars.points || 20) | 0,
					i = points,
					randomize = (vars.randomize !== false),
					clamp = (vars.clamp === true),
					template = (vars.template instanceof Ease) ? vars.template : null,
					strength = (typeof(vars.strength) === "number") ? vars.strength * 0.4 : 0.4,
					x, y, bump, invX, obj, pnt;
				while (--i > -1) {
					x = randomize ? Math.random() : (1 / points) * i;
					y = template ? template.getRatio(x) : x;
					if (taper === "none") {
						bump = strength;
					} else if (taper === "out") {
						invX = 1 - x;
						bump = invX * invX * strength;
					} else if (taper === "in") {
						bump = x * x * strength;
					} else if (x < 0.5) {  //"both" (start)
						invX = x * 2;
						bump = invX * invX * 0.5 * strength;
					} else {				//"both" (end)
						invX = (1 - x) * 2;
						bump = invX * invX * 0.5 * strength;
					}
					if (randomize) {
						y += (Math.random() * bump) - (bump * 0.5);
					} else if (i % 2) {
						y += bump * 0.5;
					} else {
						y -= bump * 0.5;
					}
					if (clamp) {
						if (y > 1) {
							y = 1;
						} else if (y < 0) {
							y = 0;
						}
					}
					a[cnt++] = {x:x, y:y};
				}
				a.sort(function(a, b) {
					return a.x - b.x;
				});
	
				pnt = new EasePoint(1, 1, null);
				i = points;
				while (--i > -1) {
					obj = a[i];
					pnt = new EasePoint(obj.x, obj.y, pnt);
				}
	
				this._prev = new EasePoint(0, 0, (pnt.t !== 0) ? pnt : pnt.next);
			}, true);
			p = RoughEase.prototype = new Ease();
			p.constructor = RoughEase;
			p.getRatio = function(p) {
				var pnt = this._prev;
				if (p > pnt.t) {
					while (pnt.next && p >= pnt.t) {
						pnt = pnt.next;
					}
					pnt = pnt.prev;
				} else {
					while (pnt.prev && p <= pnt.t) {
						pnt = pnt.prev;
					}
				}
				this._prev = pnt;
				return (pnt.v + ((p - pnt.t) / pnt.gap) * pnt.c);
			};
			p.config = function(vars) {
				return new RoughEase(vars);
			};
			RoughEase.ease = new RoughEase();
	
	
			//Bounce
			_wrap("Bounce",
				_create("BounceOut", function(p) {
					if (p < 1 / 2.75) {
						return 7.5625 * p * p;
					} else if (p < 2 / 2.75) {
						return 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
					} else if (p < 2.5 / 2.75) {
						return 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
					}
					return 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
				}),
				_create("BounceIn", function(p) {
					if ((p = 1 - p) < 1 / 2.75) {
						return 1 - (7.5625 * p * p);
					} else if (p < 2 / 2.75) {
						return 1 - (7.5625 * (p -= 1.5 / 2.75) * p + 0.75);
					} else if (p < 2.5 / 2.75) {
						return 1 - (7.5625 * (p -= 2.25 / 2.75) * p + 0.9375);
					}
					return 1 - (7.5625 * (p -= 2.625 / 2.75) * p + 0.984375);
				}),
				_create("BounceInOut", function(p) {
					var invert = (p < 0.5);
					if (invert) {
						p = 1 - (p * 2);
					} else {
						p = (p * 2) - 1;
					}
					if (p < 1 / 2.75) {
						p = 7.5625 * p * p;
					} else if (p < 2 / 2.75) {
						p = 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
					} else if (p < 2.5 / 2.75) {
						p = 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
					} else {
						p = 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
					}
					return invert ? (1 - p) * 0.5 : p * 0.5 + 0.5;
				})
			);
	
	
			//CIRC
			_wrap("Circ",
				_create("CircOut", function(p) {
					return Math.sqrt(1 - (p = p - 1) * p);
				}),
				_create("CircIn", function(p) {
					return -(Math.sqrt(1 - (p * p)) - 1);
				}),
				_create("CircInOut", function(p) {
					return ((p*=2) < 1) ? -0.5 * (Math.sqrt(1 - p * p) - 1) : 0.5 * (Math.sqrt(1 - (p -= 2) * p) + 1);
				})
			);
	
	
			//Elastic
			_createElastic = function(n, f, def) {
				var C = _class("easing." + n, function(amplitude, period) {
						this._p1 = (amplitude >= 1) ? amplitude : 1; //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
						this._p2 = (period || def) / (amplitude < 1 ? amplitude : 1);
						this._p3 = this._p2 / _2PI * (Math.asin(1 / this._p1) || 0);
						this._p2 = _2PI / this._p2; //precalculate to optimize
					}, true),
					p = C.prototype = new Ease();
				p.constructor = C;
				p.getRatio = f;
				p.config = function(amplitude, period) {
					return new C(amplitude, period);
				};
				return C;
			};
			_wrap("Elastic",
				_createElastic("ElasticOut", function(p) {
					return this._p1 * Math.pow(2, -10 * p) * Math.sin( (p - this._p3) * this._p2 ) + 1;
				}, 0.3),
				_createElastic("ElasticIn", function(p) {
					return -(this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * this._p2 ));
				}, 0.3),
				_createElastic("ElasticInOut", function(p) {
					return ((p *= 2) < 1) ? -0.5 * (this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * this._p2)) : this._p1 * Math.pow(2, -10 *(p -= 1)) * Math.sin( (p - this._p3) * this._p2 ) * 0.5 + 1;
				}, 0.45)
			);
	
	
			//Expo
			_wrap("Expo",
				_create("ExpoOut", function(p) {
					return 1 - Math.pow(2, -10 * p);
				}),
				_create("ExpoIn", function(p) {
					return Math.pow(2, 10 * (p - 1)) - 0.001;
				}),
				_create("ExpoInOut", function(p) {
					return ((p *= 2) < 1) ? 0.5 * Math.pow(2, 10 * (p - 1)) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
				})
			);
	
	
			//Sine
			_wrap("Sine",
				_create("SineOut", function(p) {
					return Math.sin(p * _HALF_PI);
				}),
				_create("SineIn", function(p) {
					return -Math.cos(p * _HALF_PI) + 1;
				}),
				_create("SineInOut", function(p) {
					return -0.5 * (Math.cos(Math.PI * p) - 1);
				})
			);
	
			_class("easing.EaseLookup", {
					find:function(s) {
						return Ease.map[s];
					}
				}, true);
	
			//register the non-standard eases
			_easeReg(w.SlowMo, "SlowMo", "ease,");
			_easeReg(RoughEase, "RoughEase", "ease,");
			_easeReg(SteppedEase, "SteppedEase", "ease,");
	
			return Back;
			
		}, true);
	
	
	});
	
	if (_gsScope._gsDefine) { _gsScope._gsQueue.pop()(); } //necessary in case TweenLite was already loaded separately.
	
	
	
	
	
	
	
	
	
	
	
	/*
	 * ----------------------------------------------------------------
	 * Base classes like TweenLite, SimpleTimeline, Ease, Ticker, etc.
	 * ----------------------------------------------------------------
	 */
	(function(window, moduleName) {
	
			"use strict";
			var _exports = {},
				_globals = window.GreenSockGlobals = window.GreenSockGlobals || window;
			if (_globals.TweenLite) {
				return; //in case the core set of classes is already loaded, don't instantiate twice.
			}
			var _namespace = function(ns) {
					var a = ns.split("."),
						p = _globals, i;
					for (i = 0; i < a.length; i++) {
						p[a[i]] = p = p[a[i]] || {};
					}
					return p;
				},
				gs = _namespace("com.greensock"),
				_tinyNum = 0.0000000001,
				_slice = function(a) { //don't use Array.prototype.slice.call(target, 0) because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
					var b = [],
						l = a.length,
						i;
					for (i = 0; i !== l; b.push(a[i++])) {}
					return b;
				},
				_emptyFunc = function() {},
				_isArray = (function() { //works around issues in iframe environments where the Array global isn't shared, thus if the object originates in a different window/iframe, "(obj instanceof Array)" will evaluate false. We added some speed optimizations to avoid Object.prototype.toString.call() unless it's absolutely necessary because it's VERY slow (like 20x slower)
					var toString = Object.prototype.toString,
						array = toString.call([]);
					return function(obj) {
						return obj != null && (obj instanceof Array || (typeof(obj) === "object" && !!obj.push && toString.call(obj) === array));
					};
				}()),
				a, i, p, _ticker, _tickerActive,
				_defLookup = {},
	
				/**
				 * @constructor
				 * Defines a GreenSock class, optionally with an array of dependencies that must be instantiated first and passed into the definition.
				 * This allows users to load GreenSock JS files in any order even if they have interdependencies (like CSSPlugin extends TweenPlugin which is
				 * inside TweenLite.js, but if CSSPlugin is loaded first, it should wait to run its code until TweenLite.js loads and instantiates TweenPlugin
				 * and then pass TweenPlugin to CSSPlugin's definition). This is all done automatically and internally.
				 *
				 * Every definition will be added to a "com.greensock" global object (typically window, but if a window.GreenSockGlobals object is found,
				 * it will go there as of v1.7). For example, TweenLite will be found at window.com.greensock.TweenLite and since it's a global class that should be available anywhere,
				 * it is ALSO referenced at window.TweenLite. However some classes aren't considered global, like the base com.greensock.core.Animation class, so
				 * those will only be at the package like window.com.greensock.core.Animation. Again, if you define a GreenSockGlobals object on the window, everything
				 * gets tucked neatly inside there instead of on the window directly. This allows you to do advanced things like load multiple versions of GreenSock
				 * files and put them into distinct objects (imagine a banner ad uses a newer version but the main site uses an older one). In that case, you could
				 * sandbox the banner one like:
				 *
				 * <script>
				 *     var gs = window.GreenSockGlobals = {}; //the newer version we're about to load could now be referenced in a "gs" object, like gs.TweenLite.to(...). Use whatever alias you want as long as it's unique, "gs" or "banner" or whatever.
				 * </script>
				 * <script src="js/greensock/v1.7/TweenMax.js"></script>
				 * <script>
				 *     window.GreenSockGlobals = window._gsQueue = window._gsDefine = null; //reset it back to null (along with the special _gsQueue variable) so that the next load of TweenMax affects the window and we can reference things directly like TweenLite.to(...)
				 * </script>
				 * <script src="js/greensock/v1.6/TweenMax.js"></script>
				 * <script>
				 *     gs.TweenLite.to(...); //would use v1.7
				 *     TweenLite.to(...); //would use v1.6
				 * </script>
				 *
				 * @param {!string} ns The namespace of the class definition, leaving off "com.greensock." as that's assumed. For example, "TweenLite" or "plugins.CSSPlugin" or "easing.Back".
				 * @param {!Array.<string>} dependencies An array of dependencies (described as their namespaces minus "com.greensock." prefix). For example ["TweenLite","plugins.TweenPlugin","core.Animation"]
				 * @param {!function():Object} func The function that should be called and passed the resolved dependencies which will return the actual class for this definition.
				 * @param {boolean=} global If true, the class will be added to the global scope (typically window unless you define a window.GreenSockGlobals object)
				 */
				Definition = function(ns, dependencies, func, global) {
					this.sc = (_defLookup[ns]) ? _defLookup[ns].sc : []; //subclasses
					_defLookup[ns] = this;
					this.gsClass = null;
					this.func = func;
					var _classes = [];
					this.check = function(init) {
						var i = dependencies.length,
							missing = i,
							cur, a, n, cl, hasModule;
						while (--i > -1) {
							if ((cur = _defLookup[dependencies[i]] || new Definition(dependencies[i], [])).gsClass) {
								_classes[i] = cur.gsClass;
								missing--;
							} else if (init) {
								cur.sc.push(this);
							}
						}
						if (missing === 0 && func) {
							a = ("com.greensock." + ns).split(".");
							n = a.pop();
							cl = _namespace(a.join("."))[n] = this.gsClass = func.apply(func, _classes);
	
							//exports to multiple environments
							if (global) {
								_globals[n] = cl; //provides a way to avoid global namespace pollution. By default, the main classes like TweenLite, Power1, Strong, etc. are added to window unless a GreenSockGlobals is defined. So if you want to have things added to a custom object instead, just do something like window.GreenSockGlobals = {} before loading any GreenSock files. You can even set up an alias like window.GreenSockGlobals = windows.gs = {} so that you can access everything like gs.TweenLite. Also remember that ALL classes are added to the window.com.greensock object (in their respective packages, like com.greensock.easing.Power1, com.greensock.TweenLite, etc.)
								hasModule = (typeof(module) !== "undefined" && module.exports);
								if (!hasModule && "function" === "function" && __webpack_require__(6)){ //AMD
									!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() { return cl; }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
								} else if (hasModule){ //node
									if (ns === moduleName) {
										module.exports = _exports[moduleName] = cl;
										for (i in _exports) {
											cl[i] = _exports[i];
										}
									} else if (_exports[moduleName]) {
										_exports[moduleName][n] = cl;
									}
								}
							}
							for (i = 0; i < this.sc.length; i++) {
								this.sc[i].check();
							}
						}
					};
					this.check(true);
				},
	
				//used to create Definition instances (which basically registers a class that has dependencies).
				_gsDefine = window._gsDefine = function(ns, dependencies, func, global) {
					return new Definition(ns, dependencies, func, global);
				},
	
				//a quick way to create a class that doesn't have any dependencies. Returns the class, but first registers it in the GreenSock namespace so that other classes can grab it (other classes might be dependent on the class).
				_class = gs._class = function(ns, func, global) {
					func = func || function() {};
					_gsDefine(ns, [], function(){ return func; }, global);
					return func;
				};
	
			_gsDefine.globals = _globals;
	
	
	
	/*
	 * ----------------------------------------------------------------
	 * Ease
	 * ----------------------------------------------------------------
	 */
			var _baseParams = [0, 0, 1, 1],
				_blankArray = [],
				Ease = _class("easing.Ease", function(func, extraParams, type, power) {
					this._func = func;
					this._type = type || 0;
					this._power = power || 0;
					this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
				}, true),
				_easeMap = Ease.map = {},
				_easeReg = Ease.register = function(ease, names, types, create) {
					var na = names.split(","),
						i = na.length,
						ta = (types || "easeIn,easeOut,easeInOut").split(","),
						e, name, j, type;
					while (--i > -1) {
						name = na[i];
						e = create ? _class("easing."+name, null, true) : gs.easing[name] || {};
						j = ta.length;
						while (--j > -1) {
							type = ta[j];
							_easeMap[name + "." + type] = _easeMap[type + name] = e[type] = ease.getRatio ? ease : ease[type] || new ease();
						}
					}
				};
	
			p = Ease.prototype;
			p._calcEnd = false;
			p.getRatio = function(p) {
				if (this._func) {
					this._params[0] = p;
					return this._func.apply(null, this._params);
				}
				var t = this._type,
					pw = this._power,
					r = (t === 1) ? 1 - p : (t === 2) ? p : (p < 0.5) ? p * 2 : (1 - p) * 2;
				if (pw === 1) {
					r *= r;
				} else if (pw === 2) {
					r *= r * r;
				} else if (pw === 3) {
					r *= r * r * r;
				} else if (pw === 4) {
					r *= r * r * r * r;
				}
				return (t === 1) ? 1 - r : (t === 2) ? r : (p < 0.5) ? r / 2 : 1 - (r / 2);
			};
	
			//create all the standard eases like Linear, Quad, Cubic, Quart, Quint, Strong, Power0, Power1, Power2, Power3, and Power4 (each with easeIn, easeOut, and easeInOut)
			a = ["Linear","Quad","Cubic","Quart","Quint,Strong"];
			i = a.length;
			while (--i > -1) {
				p = a[i]+",Power"+i;
				_easeReg(new Ease(null,null,1,i), p, "easeOut", true);
				_easeReg(new Ease(null,null,2,i), p, "easeIn" + ((i === 0) ? ",easeNone" : ""));
				_easeReg(new Ease(null,null,3,i), p, "easeInOut");
			}
			_easeMap.linear = gs.easing.Linear.easeIn;
			_easeMap.swing = gs.easing.Quad.easeInOut; //for jQuery folks
	
	
	/*
	 * ----------------------------------------------------------------
	 * EventDispatcher
	 * ----------------------------------------------------------------
	 */
			var EventDispatcher = _class("events.EventDispatcher", function(target) {
				this._listeners = {};
				this._eventTarget = target || this;
			});
			p = EventDispatcher.prototype;
	
			p.addEventListener = function(type, callback, scope, useParam, priority) {
				priority = priority || 0;
				var list = this._listeners[type],
					index = 0,
					listener, i;
				if (this === _ticker && !_tickerActive) {
					_ticker.wake();
				}
				if (list == null) {
					this._listeners[type] = list = [];
				}
				i = list.length;
				while (--i > -1) {
					listener = list[i];
					if (listener.c === callback && listener.s === scope) {
						list.splice(i, 1);
					} else if (index === 0 && listener.pr < priority) {
						index = i + 1;
					}
				}
				list.splice(index, 0, {c:callback, s:scope, up:useParam, pr:priority});
			};
	
			p.removeEventListener = function(type, callback) {
				var list = this._listeners[type], i;
				if (list) {
					i = list.length;
					while (--i > -1) {
						if (list[i].c === callback) {
							list.splice(i, 1);
							return;
						}
					}
				}
			};
	
			p.dispatchEvent = function(type) {
				var list = this._listeners[type],
					i, t, listener;
				if (list) {
					i = list.length;
					t = this._eventTarget;
					while (--i > -1) {
						listener = list[i];
						if (listener) {
							if (listener.up) {
								listener.c.call(listener.s || t, {type:type, target:t});
							} else {
								listener.c.call(listener.s || t);
							}
						}
					}
				}
			};
	
	
	/*
	 * ----------------------------------------------------------------
	 * Ticker
	 * ----------------------------------------------------------------
	 */
	 		var _reqAnimFrame = window.requestAnimationFrame,
				_cancelAnimFrame = window.cancelAnimationFrame,
				_getTime = Date.now || function() {return new Date().getTime();},
				_lastUpdate = _getTime();
	
			//now try to determine the requestAnimationFrame and cancelAnimationFrame functions and if none are found, we'll use a setTimeout()/clearTimeout() polyfill.
			a = ["ms","moz","webkit","o"];
			i = a.length;
			while (--i > -1 && !_reqAnimFrame) {
				_reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
				_cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
			}
	
			_class("Ticker", function(fps, useRAF) {
				var _self = this,
					_startTime = _getTime(),
					_useRAF = (useRAF !== false && _reqAnimFrame) ? "auto" : false,
					_lagThreshold = 500,
					_adjustedLag = 33,
					_tickWord = "tick", //helps reduce gc burden
					_fps, _req, _id, _gap, _nextTime,
					_tick = function(manual) {
						var elapsed = _getTime() - _lastUpdate,
							overlap, dispatch;
						if (elapsed > _lagThreshold) {
							_startTime += elapsed - _adjustedLag;
						}
						_lastUpdate += elapsed;
						_self.time = (_lastUpdate - _startTime) / 1000;
						overlap = _self.time - _nextTime;
						if (!_fps || overlap > 0 || manual === true) {
							_self.frame++;
							_nextTime += overlap + (overlap >= _gap ? 0.004 : _gap - overlap);
							dispatch = true;
						}
						if (manual !== true) { //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.
							_id = _req(_tick);
						}
						if (dispatch) {
							_self.dispatchEvent(_tickWord);
						}
					};
	
				EventDispatcher.call(_self);
				_self.time = _self.frame = 0;
				_self.tick = function() {
					_tick(true);
				};
	
				_self.lagSmoothing = function(threshold, adjustedLag) {
					_lagThreshold = threshold || (1 / _tinyNum); //zero should be interpreted as basically unlimited
					_adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
				};
	
				_self.sleep = function() {
					if (_id == null) {
						return;
					}
					if (!_useRAF || !_cancelAnimFrame) {
						clearTimeout(_id);
					} else {
						_cancelAnimFrame(_id);
					}
					_req = _emptyFunc;
					_id = null;
					if (_self === _ticker) {
						_tickerActive = false;
					}
				};
	
				_self.wake = function(seamless) {
					if (_id !== null) {
						_self.sleep();
					} else if (seamless) {
						_startTime += -_lastUpdate + (_lastUpdate = _getTime());
					} else if (_self.frame > 10) { //don't trigger lagSmoothing if we're just waking up, and make sure that at least 10 frames have elapsed because of the iOS bug that we work around below with the 1.5-second setTimout().
						_lastUpdate = _getTime() - _lagThreshold + 5;
					}
					_req = (_fps === 0) ? _emptyFunc : (!_useRAF || !_reqAnimFrame) ? function(f) { return setTimeout(f, ((_nextTime - _self.time) * 1000 + 1) | 0); } : _reqAnimFrame;
					if (_self === _ticker) {
						_tickerActive = true;
					}
					_tick(2);
				};
	
				_self.fps = function(value) {
					if (!arguments.length) {
						return _fps;
					}
					_fps = value;
					_gap = 1 / (_fps || 60);
					_nextTime = this.time + _gap;
					_self.wake();
				};
	
				_self.useRAF = function(value) {
					if (!arguments.length) {
						return _useRAF;
					}
					_self.sleep();
					_useRAF = value;
					_self.fps(_fps);
				};
				_self.fps(fps);
	
				//a bug in iOS 6 Safari occasionally prevents the requestAnimationFrame from working initially, so we use a 1.5-second timeout that automatically falls back to setTimeout() if it senses this condition.
				setTimeout(function() {
					if (_useRAF === "auto" && _self.frame < 5 && document.visibilityState !== "hidden") {
						_self.useRAF(false);
					}
				}, 1500);
			});
	
			p = gs.Ticker.prototype = new gs.events.EventDispatcher();
			p.constructor = gs.Ticker;
	
	
	/*
	 * ----------------------------------------------------------------
	 * Animation
	 * ----------------------------------------------------------------
	 */
			var Animation = _class("core.Animation", function(duration, vars) {
					this.vars = vars = vars || {};
					this._duration = this._totalDuration = duration || 0;
					this._delay = Number(vars.delay) || 0;
					this._timeScale = 1;
					this._active = (vars.immediateRender === true);
					this.data = vars.data;
					this._reversed = (vars.reversed === true);
	
					if (!_rootTimeline) {
						return;
					}
					if (!_tickerActive) { //some browsers (like iOS 6 Safari) shut down JavaScript execution when the tab is disabled and they [occasionally] neglect to start up requestAnimationFrame again when returning - this code ensures that the engine starts up again properly.
						_ticker.wake();
					}
	
					var tl = this.vars.useFrames ? _rootFramesTimeline : _rootTimeline;
					tl.add(this, tl._time);
	
					if (this.vars.paused) {
						this.paused(true);
					}
				});
	
			_ticker = Animation.ticker = new gs.Ticker();
			p = Animation.prototype;
			p._dirty = p._gc = p._initted = p._paused = false;
			p._totalTime = p._time = 0;
			p._rawPrevTime = -1;
			p._next = p._last = p._onUpdate = p._timeline = p.timeline = null;
			p._paused = false;
	
	
			//some browsers (like iOS) occasionally drop the requestAnimationFrame event when the user switches to a different tab and then comes back again, so we use a 2-second setTimeout() to sense if/when that condition occurs and then wake() the ticker.
			var _checkTimeout = function() {
					if (_tickerActive && _getTime() - _lastUpdate > 2000) {
						_ticker.wake();
					}
					setTimeout(_checkTimeout, 2000);
				};
			_checkTimeout();
	
	
			p.play = function(from, suppressEvents) {
				if (from != null) {
					this.seek(from, suppressEvents);
				}
				return this.reversed(false).paused(false);
			};
	
			p.pause = function(atTime, suppressEvents) {
				if (atTime != null) {
					this.seek(atTime, suppressEvents);
				}
				return this.paused(true);
			};
	
			p.resume = function(from, suppressEvents) {
				if (from != null) {
					this.seek(from, suppressEvents);
				}
				return this.paused(false);
			};
	
			p.seek = function(time, suppressEvents) {
				return this.totalTime(Number(time), suppressEvents !== false);
			};
	
			p.restart = function(includeDelay, suppressEvents) {
				return this.reversed(false).paused(false).totalTime(includeDelay ? -this._delay : 0, (suppressEvents !== false), true);
			};
	
			p.reverse = function(from, suppressEvents) {
				if (from != null) {
					this.seek((from || this.totalDuration()), suppressEvents);
				}
				return this.reversed(true).paused(false);
			};
	
			p.render = function(time, suppressEvents, force) {
				//stub - we override this method in subclasses.
			};
	
			p.invalidate = function() {
				this._time = this._totalTime = 0;
				this._initted = this._gc = false;
				this._rawPrevTime = -1;
				if (this._gc || !this.timeline) {
					this._enabled(true);
				}
				return this;
			};
	
			p.isActive = function() {
				var tl = this._timeline, //the 2 root timelines won't have a _timeline; they're always active.
					startTime = this._startTime,
					rawTime;
				return (!tl || (!this._gc && !this._paused && tl.isActive() && (rawTime = tl.rawTime()) >= startTime && rawTime < startTime + this.totalDuration() / this._timeScale));
			};
	
			p._enabled = function (enabled, ignoreTimeline) {
				if (!_tickerActive) {
					_ticker.wake();
				}
				this._gc = !enabled;
				this._active = this.isActive();
				if (ignoreTimeline !== true) {
					if (enabled && !this.timeline) {
						this._timeline.add(this, this._startTime - this._delay);
					} else if (!enabled && this.timeline) {
						this._timeline._remove(this, true);
					}
				}
				return false;
			};
	
	
			p._kill = function(vars, target) {
				return this._enabled(false, false);
			};
	
			p.kill = function(vars, target) {
				this._kill(vars, target);
				return this;
			};
	
			p._uncache = function(includeSelf) {
				var tween = includeSelf ? this : this.timeline;
				while (tween) {
					tween._dirty = true;
					tween = tween.timeline;
				}
				return this;
			};
	
			p._swapSelfInParams = function(params) {
				var i = params.length,
					copy = params.concat();
				while (--i > -1) {
					if (params[i] === "{self}") {
						copy[i] = this;
					}
				}
				return copy;
			};
	
			p._callback = function(type) {
				var v = this.vars;
				v[type].apply(v[type + "Scope"] || v.callbackScope || this, v[type + "Params"] || _blankArray);
			};
	
	//----Animation getters/setters --------------------------------------------------------
	
			p.eventCallback = function(type, callback, params, scope) {
				if ((type || "").substr(0,2) === "on") {
					var v = this.vars;
					if (arguments.length === 1) {
						return v[type];
					}
					if (callback == null) {
						delete v[type];
					} else {
						v[type] = callback;
						v[type + "Params"] = (_isArray(params) && params.join("").indexOf("{self}") !== -1) ? this._swapSelfInParams(params) : params;
						v[type + "Scope"] = scope;
					}
					if (type === "onUpdate") {
						this._onUpdate = callback;
					}
				}
				return this;
			};
	
			p.delay = function(value) {
				if (!arguments.length) {
					return this._delay;
				}
				if (this._timeline.smoothChildTiming) {
					this.startTime( this._startTime + value - this._delay );
				}
				this._delay = value;
				return this;
			};
	
			p.duration = function(value) {
				if (!arguments.length) {
					this._dirty = false;
					return this._duration;
				}
				this._duration = this._totalDuration = value;
				this._uncache(true); //true in case it's a TweenMax or TimelineMax that has a repeat - we'll need to refresh the totalDuration.
				if (this._timeline.smoothChildTiming) if (this._time > 0) if (this._time < this._duration) if (value !== 0) {
					this.totalTime(this._totalTime * (value / this._duration), true);
				}
				return this;
			};
	
			p.totalDuration = function(value) {
				this._dirty = false;
				return (!arguments.length) ? this._totalDuration : this.duration(value);
			};
	
			p.time = function(value, suppressEvents) {
				if (!arguments.length) {
					return this._time;
				}
				if (this._dirty) {
					this.totalDuration();
				}
				return this.totalTime((value > this._duration) ? this._duration : value, suppressEvents);
			};
	
			p.totalTime = function(time, suppressEvents, uncapped) {
				if (!_tickerActive) {
					_ticker.wake();
				}
				if (!arguments.length) {
					return this._totalTime;
				}
				if (this._timeline) {
					if (time < 0 && !uncapped) {
						time += this.totalDuration();
					}
					if (this._timeline.smoothChildTiming) {
						if (this._dirty) {
							this.totalDuration();
						}
						var totalDuration = this._totalDuration,
							tl = this._timeline;
						if (time > totalDuration && !uncapped) {
							time = totalDuration;
						}
						this._startTime = (this._paused ? this._pauseTime : tl._time) - ((!this._reversed ? time : totalDuration - time) / this._timeScale);
						if (!tl._dirty) { //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
							this._uncache(false);
						}
						//in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The startTime of that child would get pushed out, but one of the ancestors may have completed.
						if (tl._timeline) {
							while (tl._timeline) {
								if (tl._timeline._time !== (tl._startTime + tl._totalTime) / tl._timeScale) {
									tl.totalTime(tl._totalTime, true);
								}
								tl = tl._timeline;
							}
						}
					}
					if (this._gc) {
						this._enabled(true, false);
					}
					if (this._totalTime !== time || this._duration === 0) {
						if (_lazyTweens.length) {
							_lazyRender();
						}
						this.render(time, suppressEvents, false);
						if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
							_lazyRender();
						}
					}
				}
				return this;
			};
	
			p.progress = p.totalProgress = function(value, suppressEvents) {
				var duration = this.duration();
				return (!arguments.length) ? (duration ? this._time / duration : this.ratio) : this.totalTime(duration * value, suppressEvents);
			};
	
			p.startTime = function(value) {
				if (!arguments.length) {
					return this._startTime;
				}
				if (value !== this._startTime) {
					this._startTime = value;
					if (this.timeline) if (this.timeline._sortChildren) {
						this.timeline.add(this, value - this._delay); //ensures that any necessary re-sequencing of Animations in the timeline occurs to make sure the rendering order is correct.
					}
				}
				return this;
			};
	
			p.endTime = function(includeRepeats) {
				return this._startTime + ((includeRepeats != false) ? this.totalDuration() : this.duration()) / this._timeScale;
			};
	
			p.timeScale = function(value) {
				if (!arguments.length) {
					return this._timeScale;
				}
				value = value || _tinyNum; //can't allow zero because it'll throw the math off
				if (this._timeline && this._timeline.smoothChildTiming) {
					var pauseTime = this._pauseTime,
						t = (pauseTime || pauseTime === 0) ? pauseTime : this._timeline.totalTime();
					this._startTime = t - ((t - this._startTime) * this._timeScale / value);
				}
				this._timeScale = value;
				return this._uncache(false);
			};
	
			p.reversed = function(value) {
				if (!arguments.length) {
					return this._reversed;
				}
				if (value != this._reversed) {
					this._reversed = value;
					this.totalTime(((this._timeline && !this._timeline.smoothChildTiming) ? this.totalDuration() - this._totalTime : this._totalTime), true);
				}
				return this;
			};
	
			p.paused = function(value) {
				if (!arguments.length) {
					return this._paused;
				}
				var tl = this._timeline,
					raw, elapsed;
				if (value != this._paused) if (tl) {
					if (!_tickerActive && !value) {
						_ticker.wake();
					}
					raw = tl.rawTime();
					elapsed = raw - this._pauseTime;
					if (!value && tl.smoothChildTiming) {
						this._startTime += elapsed;
						this._uncache(false);
					}
					this._pauseTime = value ? raw : null;
					this._paused = value;
					this._active = this.isActive();
					if (!value && elapsed !== 0 && this._initted && this.duration()) {
						raw = tl.smoothChildTiming ? this._totalTime : (raw - this._startTime) / this._timeScale;
						this.render(raw, (raw === this._totalTime), true); //in case the target's properties changed via some other tween or manual update by the user, we should force a render.
					}
				}
				if (this._gc && !value) {
					this._enabled(true, false);
				}
				return this;
			};
	
	
	/*
	 * ----------------------------------------------------------------
	 * SimpleTimeline
	 * ----------------------------------------------------------------
	 */
			var SimpleTimeline = _class("core.SimpleTimeline", function(vars) {
				Animation.call(this, 0, vars);
				this.autoRemoveChildren = this.smoothChildTiming = true;
			});
	
			p = SimpleTimeline.prototype = new Animation();
			p.constructor = SimpleTimeline;
			p.kill()._gc = false;
			p._first = p._last = p._recent = null;
			p._sortChildren = false;
	
			p.add = p.insert = function(child, position, align, stagger) {
				var prevTween, st;
				child._startTime = Number(position || 0) + child._delay;
				if (child._paused) if (this !== child._timeline) { //we only adjust the _pauseTime if it wasn't in this timeline already. Remember, sometimes a tween will be inserted again into the same timeline when its startTime is changed so that the tweens in the TimelineLite/Max are re-ordered properly in the linked list (so everything renders in the proper order).
					child._pauseTime = child._startTime + ((this.rawTime() - child._startTime) / child._timeScale);
				}
				if (child.timeline) {
					child.timeline._remove(child, true); //removes from existing timeline so that it can be properly added to this one.
				}
				child.timeline = child._timeline = this;
				if (child._gc) {
					child._enabled(true, true);
				}
				prevTween = this._last;
				if (this._sortChildren) {
					st = child._startTime;
					while (prevTween && prevTween._startTime > st) {
						prevTween = prevTween._prev;
					}
				}
				if (prevTween) {
					child._next = prevTween._next;
					prevTween._next = child;
				} else {
					child._next = this._first;
					this._first = child;
				}
				if (child._next) {
					child._next._prev = child;
				} else {
					this._last = child;
				}
				child._prev = prevTween;
				this._recent = child;
				if (this._timeline) {
					this._uncache(true);
				}
				return this;
			};
	
			p._remove = function(tween, skipDisable) {
				if (tween.timeline === this) {
					if (!skipDisable) {
						tween._enabled(false, true);
					}
	
					if (tween._prev) {
						tween._prev._next = tween._next;
					} else if (this._first === tween) {
						this._first = tween._next;
					}
					if (tween._next) {
						tween._next._prev = tween._prev;
					} else if (this._last === tween) {
						this._last = tween._prev;
					}
					tween._next = tween._prev = tween.timeline = null;
					if (tween === this._recent) {
						this._recent = this._last;
					}
	
					if (this._timeline) {
						this._uncache(true);
					}
				}
				return this;
			};
	
			p.render = function(time, suppressEvents, force) {
				var tween = this._first,
					next;
				this._totalTime = this._time = this._rawPrevTime = time;
				while (tween) {
					next = tween._next; //record it here because the value could change after rendering...
					if (tween._active || (time >= tween._startTime && !tween._paused)) {
						if (!tween._reversed) {
							tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
						} else {
							tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
						}
					}
					tween = next;
				}
			};
	
			p.rawTime = function() {
				if (!_tickerActive) {
					_ticker.wake();
				}
				return this._totalTime;
			};
	
	/*
	 * ----------------------------------------------------------------
	 * TweenLite
	 * ----------------------------------------------------------------
	 */
			var TweenLite = _class("TweenLite", function(target, duration, vars) {
					Animation.call(this, duration, vars);
					this.render = TweenLite.prototype.render; //speed optimization (avoid prototype lookup on this "hot" method)
	
					if (target == null) {
						throw "Cannot tween a null target.";
					}
	
					this.target = target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;
	
					var isSelector = (target.jquery || (target.length && target !== window && target[0] && (target[0] === window || (target[0].nodeType && target[0].style && !target.nodeType)))),
						overwrite = this.vars.overwrite,
						i, targ, targets;
	
					this._overwrite = overwrite = (overwrite == null) ? _overwriteLookup[TweenLite.defaultOverwrite] : (typeof(overwrite) === "number") ? overwrite >> 0 : _overwriteLookup[overwrite];
	
					if ((isSelector || target instanceof Array || (target.push && _isArray(target))) && typeof(target[0]) !== "number") {
						this._targets = targets = _slice(target);  //don't use Array.prototype.slice.call(target, 0) because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
						this._propLookup = [];
						this._siblings = [];
						for (i = 0; i < targets.length; i++) {
							targ = targets[i];
							if (!targ) {
								targets.splice(i--, 1);
								continue;
							} else if (typeof(targ) === "string") {
								targ = targets[i--] = TweenLite.selector(targ); //in case it's an array of strings
								if (typeof(targ) === "string") {
									targets.splice(i+1, 1); //to avoid an endless loop (can't imagine why the selector would return a string, but just in case)
								}
								continue;
							} else if (targ.length && targ !== window && targ[0] && (targ[0] === window || (targ[0].nodeType && targ[0].style && !targ.nodeType))) { //in case the user is passing in an array of selector objects (like jQuery objects), we need to check one more level and pull things out if necessary. Also note that <select> elements pass all the criteria regarding length and the first child having style, so we must also check to ensure the target isn't an HTML node itself.
								targets.splice(i--, 1);
								this._targets = targets = targets.concat(_slice(targ));
								continue;
							}
							this._siblings[i] = _register(targ, this, false);
							if (overwrite === 1) if (this._siblings[i].length > 1) {
								_applyOverwrite(targ, this, null, 1, this._siblings[i]);
							}
						}
	
					} else {
						this._propLookup = {};
						this._siblings = _register(target, this, false);
						if (overwrite === 1) if (this._siblings.length > 1) {
							_applyOverwrite(target, this, null, 1, this._siblings);
						}
					}
					if (this.vars.immediateRender || (duration === 0 && this._delay === 0 && this.vars.immediateRender !== false)) {
						this._time = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)
						this.render(Math.min(0, -this._delay)); //in case delay is negative
					}
				}, true),
				_isSelector = function(v) {
					return (v && v.length && v !== window && v[0] && (v[0] === window || (v[0].nodeType && v[0].style && !v.nodeType))); //we cannot check "nodeType" if the target is window from within an iframe, otherwise it will trigger a security error in some browsers like Firefox.
				},
				_autoCSS = function(vars, target) {
					var css = {},
						p;
					for (p in vars) {
						if (!_reservedProps[p] && (!(p in target) || p === "transform" || p === "x" || p === "y" || p === "width" || p === "height" || p === "className" || p === "border") && (!_plugins[p] || (_plugins[p] && _plugins[p]._autoCSS))) { //note: <img> elements contain read-only "x" and "y" properties. We should also prioritize editing css width/height rather than the element's properties.
							css[p] = vars[p];
							delete vars[p];
						}
					}
					vars.css = css;
				};
	
			p = TweenLite.prototype = new Animation();
			p.constructor = TweenLite;
			p.kill()._gc = false;
	
	//----TweenLite defaults, overwrite management, and root updates ----------------------------------------------------
	
			p.ratio = 0;
			p._firstPT = p._targets = p._overwrittenProps = p._startAt = null;
			p._notifyPluginsOfEnabled = p._lazy = false;
	
			TweenLite.version = "1.18.5";
			TweenLite.defaultEase = p._ease = new Ease(null, null, 1, 1);
			TweenLite.defaultOverwrite = "auto";
			TweenLite.ticker = _ticker;
			TweenLite.autoSleep = 120;
			TweenLite.lagSmoothing = function(threshold, adjustedLag) {
				_ticker.lagSmoothing(threshold, adjustedLag);
			};
	
			TweenLite.selector = window.$ || window.jQuery || function(e) {
				var selector = window.$ || window.jQuery;
				if (selector) {
					TweenLite.selector = selector;
					return selector(e);
				}
				return (typeof(document) === "undefined") ? e : (document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById((e.charAt(0) === "#") ? e.substr(1) : e));
			};
	
			var _lazyTweens = [],
				_lazyLookup = {},
				_numbersExp = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig,
				//_nonNumbersExp = /(?:([\-+](?!(\d|=)))|[^\d\-+=e]|(e(?![\-+][\d])))+/ig,
				_setRatio = function(v) {
					var pt = this._firstPT,
						min = 0.000001,
						val;
					while (pt) {
						val = !pt.blob ? pt.c * v + pt.s : v ? this.join("") : this.start;
						if (pt.r) {
							val = Math.round(val);
						} else if (val < min) if (val > -min) { //prevents issues with converting very small numbers to strings in the browser
							val = 0;
						}
						if (!pt.f) {
							pt.t[pt.p] = val;
						} else if (pt.fp) {
							pt.t[pt.p](pt.fp, val);
						} else {
							pt.t[pt.p](val);
						}
						pt = pt._next;
					}
				},
				//compares two strings (start/end), finds the numbers that are different and spits back an array representing the whole value but with the changing values isolated as elements. For example, "rgb(0,0,0)" and "rgb(100,50,0)" would become ["rgb(", 0, ",", 50, ",0)"]. Notice it merges the parts that are identical (performance optimization). The array also has a linked list of PropTweens attached starting with _firstPT that contain the tweening data (t, p, s, c, f, etc.). It also stores the starting value as a "start" property so that we can revert to it if/when necessary, like when a tween rewinds fully. If the quantity of numbers differs between the start and end, it will always prioritize the end value(s). The pt parameter is optional - it's for a PropTween that will be appended to the end of the linked list and is typically for actually setting the value after all of the elements have been updated (with array.join("")).
				_blobDif = function(start, end, filter, pt) {
					var a = [start, end],
						charIndex = 0,
						s = "",
						color = 0,
						startNums, endNums, num, i, l, nonNumbers, currentNum;
					a.start = start;
					if (filter) {
						filter(a); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.
						start = a[0];
						end = a[1];
					}
					a.length = 0;
					startNums = start.match(_numbersExp) || [];
					endNums = end.match(_numbersExp) || [];
					if (pt) {
						pt._next = null;
						pt.blob = 1;
						a._firstPT = pt; //apply last in the linked list (which means inserting it first)
					}
					l = endNums.length;
					for (i = 0; i < l; i++) {
						currentNum = endNums[i];
						nonNumbers = end.substr(charIndex, end.indexOf(currentNum, charIndex)-charIndex);
						s += (nonNumbers || !i) ? nonNumbers : ","; //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
						charIndex += nonNumbers.length;
						if (color) { //sense rgba() values and round them.
							color = (color + 1) % 5;
						} else if (nonNumbers.substr(-5) === "rgba(") {
							color = 1;
						}
						if (currentNum === startNums[i] || startNums.length <= i) {
							s += currentNum;
						} else {
							if (s) {
								a.push(s);
								s = "";
							}
							num = parseFloat(startNums[i]);
							a.push(num);
							a._firstPT = {_next: a._firstPT, t:a, p: a.length-1, s:num, c:((currentNum.charAt(1) === "=") ? parseInt(currentNum.charAt(0) + "1", 10) * parseFloat(currentNum.substr(2)) : (parseFloat(currentNum) - num)) || 0, f:0, r:(color && color < 4)};
							//note: we don't set _prev because we'll never need to remove individual PropTweens from this list.
						}
						charIndex += currentNum.length;
					}
					s += end.substr(charIndex);
					if (s) {
						a.push(s);
					}
					a.setRatio = _setRatio;
					return a;
				},
				//note: "funcParam" is only necessary for function-based getters/setters that require an extra parameter like getAttribute("width") and setAttribute("width", value). In this example, funcParam would be "width". Used by AttrPlugin for example.
				_addPropTween = function(target, prop, start, end, overwriteProp, round, funcParam, stringFilter) {
					var s = (start === "get") ? target[prop] : start,
						type = typeof(target[prop]),
						isRelative = (typeof(end) === "string" && end.charAt(1) === "="),
						pt = {t:target, p:prop, s:s, f:(type === "function"), pg:0, n:overwriteProp || prop, r:round, pr:0, c:isRelative ? parseInt(end.charAt(0) + "1", 10) * parseFloat(end.substr(2)) : (parseFloat(end) - s) || 0},
						blob, getterName;
					if (type !== "number") {
						if (type === "function" && start === "get") {
							getterName = ((prop.indexOf("set") || typeof(target["get" + prop.substr(3)]) !== "function") ? prop : "get" + prop.substr(3));
							pt.s = s = funcParam ? target[getterName](funcParam) : target[getterName]();
						}
						if (typeof(s) === "string" && (funcParam || isNaN(s))) {
							//a blob (string that has multiple numbers in it)
							pt.fp = funcParam;
							blob = _blobDif(s, end, stringFilter || TweenLite.defaultStringFilter, pt);
							pt = {t:blob, p:"setRatio", s:0, c:1, f:2, pg:0, n:overwriteProp || prop, pr:0}; //"2" indicates it's a Blob property tween. Needed for RoundPropsPlugin for example.
						} else if (!isRelative) {
							pt.s = parseFloat(s);
							pt.c = (parseFloat(end) - pt.s) || 0;
						}
					}
					if (pt.c) { //only add it to the linked list if there's a change.
						if ((pt._next = this._firstPT)) {
							pt._next._prev = pt;
						}
						this._firstPT = pt;
						return pt;
					}
				},
				_internals = TweenLite._internals = {isArray:_isArray, isSelector:_isSelector, lazyTweens:_lazyTweens, blobDif:_blobDif}, //gives us a way to expose certain private values to other GreenSock classes without contaminating tha main TweenLite object.
				_plugins = TweenLite._plugins = {},
				_tweenLookup = _internals.tweenLookup = {},
				_tweenLookupNum = 0,
				_reservedProps = _internals.reservedProps = {ease:1, delay:1, overwrite:1, onComplete:1, onCompleteParams:1, onCompleteScope:1, useFrames:1, runBackwards:1, startAt:1, onUpdate:1, onUpdateParams:1, onUpdateScope:1, onStart:1, onStartParams:1, onStartScope:1, onReverseComplete:1, onReverseCompleteParams:1, onReverseCompleteScope:1, onRepeat:1, onRepeatParams:1, onRepeatScope:1, easeParams:1, yoyo:1, immediateRender:1, repeat:1, repeatDelay:1, data:1, paused:1, reversed:1, autoCSS:1, lazy:1, onOverwrite:1, callbackScope:1, stringFilter:1, id:1},
				_overwriteLookup = {none:0, all:1, auto:2, concurrent:3, allOnStart:4, preexisting:5, "true":1, "false":0},
				_rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline(),
				_rootTimeline = Animation._rootTimeline = new SimpleTimeline(),
				_nextGCFrame = 30,
				_lazyRender = _internals.lazyRender = function() {
					var i = _lazyTweens.length,
						tween;
					_lazyLookup = {};
					while (--i > -1) {
						tween = _lazyTweens[i];
						if (tween && tween._lazy !== false) {
							tween.render(tween._lazy[0], tween._lazy[1], true);
							tween._lazy = false;
						}
					}
					_lazyTweens.length = 0;
				};
	
			_rootTimeline._startTime = _ticker.time;
			_rootFramesTimeline._startTime = _ticker.frame;
			_rootTimeline._active = _rootFramesTimeline._active = true;
			setTimeout(_lazyRender, 1); //on some mobile devices, there isn't a "tick" before code runs which means any lazy renders wouldn't run before the next official "tick".
	
			Animation._updateRoot = TweenLite.render = function() {
					var i, a, p;
					if (_lazyTweens.length) { //if code is run outside of the requestAnimationFrame loop, there may be tweens queued AFTER the engine refreshed, so we need to ensure any pending renders occur before we refresh again.
						_lazyRender();
					}
					_rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, false, false);
					_rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, false, false);
					if (_lazyTweens.length) {
						_lazyRender();
					}
					if (_ticker.frame >= _nextGCFrame) { //dump garbage every 120 frames or whatever the user sets TweenLite.autoSleep to
						_nextGCFrame = _ticker.frame + (parseInt(TweenLite.autoSleep, 10) || 120);
						for (p in _tweenLookup) {
							a = _tweenLookup[p].tweens;
							i = a.length;
							while (--i > -1) {
								if (a[i]._gc) {
									a.splice(i, 1);
								}
							}
							if (a.length === 0) {
								delete _tweenLookup[p];
							}
						}
						//if there are no more tweens in the root timelines, or if they're all paused, make the _timer sleep to reduce load on the CPU slightly
						p = _rootTimeline._first;
						if (!p || p._paused) if (TweenLite.autoSleep && !_rootFramesTimeline._first && _ticker._listeners.tick.length === 1) {
							while (p && p._paused) {
								p = p._next;
							}
							if (!p) {
								_ticker.sleep();
							}
						}
					}
				};
	
			_ticker.addEventListener("tick", Animation._updateRoot);
	
			var _register = function(target, tween, scrub) {
					var id = target._gsTweenID, a, i;
					if (!_tweenLookup[id || (target._gsTweenID = id = "t" + (_tweenLookupNum++))]) {
						_tweenLookup[id] = {target:target, tweens:[]};
					}
					if (tween) {
						a = _tweenLookup[id].tweens;
						a[(i = a.length)] = tween;
						if (scrub) {
							while (--i > -1) {
								if (a[i] === tween) {
									a.splice(i, 1);
								}
							}
						}
					}
					return _tweenLookup[id].tweens;
				},
				_onOverwrite = function(overwrittenTween, overwritingTween, target, killedProps) {
					var func = overwrittenTween.vars.onOverwrite, r1, r2;
					if (func) {
						r1 = func(overwrittenTween, overwritingTween, target, killedProps);
					}
					func = TweenLite.onOverwrite;
					if (func) {
						r2 = func(overwrittenTween, overwritingTween, target, killedProps);
					}
					return (r1 !== false && r2 !== false);
				},
				_applyOverwrite = function(target, tween, props, mode, siblings) {
					var i, changed, curTween, l;
					if (mode === 1 || mode >= 4) {
						l = siblings.length;
						for (i = 0; i < l; i++) {
							if ((curTween = siblings[i]) !== tween) {
								if (!curTween._gc) {
									if (curTween._kill(null, target, tween)) {
										changed = true;
									}
								}
							} else if (mode === 5) {
								break;
							}
						}
						return changed;
					}
					//NOTE: Add 0.0000000001 to overcome floating point errors that can cause the startTime to be VERY slightly off (when a tween's time() is set for example)
					var startTime = tween._startTime + _tinyNum,
						overlaps = [],
						oCount = 0,
						zeroDur = (tween._duration === 0),
						globalStart;
					i = siblings.length;
					while (--i > -1) {
						if ((curTween = siblings[i]) === tween || curTween._gc || curTween._paused) {
							//ignore
						} else if (curTween._timeline !== tween._timeline) {
							globalStart = globalStart || _checkOverlap(tween, 0, zeroDur);
							if (_checkOverlap(curTween, globalStart, zeroDur) === 0) {
								overlaps[oCount++] = curTween;
							}
						} else if (curTween._startTime <= startTime) if (curTween._startTime + curTween.totalDuration() / curTween._timeScale > startTime) if (!((zeroDur || !curTween._initted) && startTime - curTween._startTime <= 0.0000000002)) {
							overlaps[oCount++] = curTween;
						}
					}
	
					i = oCount;
					while (--i > -1) {
						curTween = overlaps[i];
						if (mode === 2) if (curTween._kill(props, target, tween)) {
							changed = true;
						}
						if (mode !== 2 || (!curTween._firstPT && curTween._initted)) {
							if (mode !== 2 && !_onOverwrite(curTween, tween)) {
								continue;
							}
							if (curTween._enabled(false, false)) { //if all property tweens have been overwritten, kill the tween.
								changed = true;
							}
						}
					}
					return changed;
				},
				_checkOverlap = function(tween, reference, zeroDur) {
					var tl = tween._timeline,
						ts = tl._timeScale,
						t = tween._startTime;
					while (tl._timeline) {
						t += tl._startTime;
						ts *= tl._timeScale;
						if (tl._paused) {
							return -100;
						}
						tl = tl._timeline;
					}
					t /= ts;
					return (t > reference) ? t - reference : ((zeroDur && t === reference) || (!tween._initted && t - reference < 2 * _tinyNum)) ? _tinyNum : ((t += tween.totalDuration() / tween._timeScale / ts) > reference + _tinyNum) ? 0 : t - reference - _tinyNum;
				};
	
	
	//---- TweenLite instance methods -----------------------------------------------------------------------------
	
			p._init = function() {
				var v = this.vars,
					op = this._overwrittenProps,
					dur = this._duration,
					immediate = !!v.immediateRender,
					ease = v.ease,
					i, initPlugins, pt, p, startVars;
				if (v.startAt) {
					if (this._startAt) {
						this._startAt.render(-1, true); //if we've run a startAt previously (when the tween instantiated), we should revert it so that the values re-instantiate correctly particularly for relative tweens. Without this, a TweenLite.fromTo(obj, 1, {x:"+=100"}, {x:"-=100"}), for example, would actually jump to +=200 because the startAt would run twice, doubling the relative change.
						this._startAt.kill();
					}
					startVars = {};
					for (p in v.startAt) { //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, 1, from, to).fromTo(e, 1, to, from);
						startVars[p] = v.startAt[p];
					}
					startVars.overwrite = false;
					startVars.immediateRender = true;
					startVars.lazy = (immediate && v.lazy !== false);
					startVars.startAt = startVars.delay = null; //no nesting of startAt objects allowed (otherwise it could cause an infinite loop).
					this._startAt = TweenLite.to(this.target, 0, startVars);
					if (immediate) {
						if (this._time > 0) {
							this._startAt = null; //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in TimelineLite/Max instances where immediateRender was false (which is the default in the convenience methods like from()).
						} else if (dur !== 0) {
							return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a TimelineLite or TimelineMax, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
						}
					}
				} else if (v.runBackwards && dur !== 0) {
					//from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
					if (this._startAt) {
						this._startAt.render(-1, true);
						this._startAt.kill();
						this._startAt = null;
					} else {
						if (this._time !== 0) { //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0
							immediate = false;
						}
						pt = {};
						for (p in v) { //copy props into a new object and skip any reserved props, otherwise onComplete or onUpdate or onStart could fire. We should, however, permit autoCSS to go through.
							if (!_reservedProps[p] || p === "autoCSS") {
								pt[p] = v[p];
							}
						}
						pt.overwrite = 0;
						pt.data = "isFromStart"; //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
						pt.lazy = (immediate && v.lazy !== false);
						pt.immediateRender = immediate; //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
						this._startAt = TweenLite.to(this.target, 0, pt);
						if (!immediate) {
							this._startAt._init(); //ensures that the initial values are recorded
							this._startAt._enabled(false); //no need to have the tween render on the next cycle. Disable it because we'll always manually control the renders of the _startAt tween.
							if (this.vars.immediateRender) {
								this._startAt = null;
							}
						} else if (this._time === 0) {
							return;
						}
					}
				}
				this._ease = ease = (!ease) ? TweenLite.defaultEase : (ease instanceof Ease) ? ease : (typeof(ease) === "function") ? new Ease(ease, v.easeParams) : _easeMap[ease] || TweenLite.defaultEase;
				if (v.easeParams instanceof Array && ease.config) {
					this._ease = ease.config.apply(ease, v.easeParams);
				}
				this._easeType = this._ease._type;
				this._easePower = this._ease._power;
				this._firstPT = null;
	
				if (this._targets) {
					i = this._targets.length;
					while (--i > -1) {
						if ( this._initProps( this._targets[i], (this._propLookup[i] = {}), this._siblings[i], (op ? op[i] : null)) ) {
							initPlugins = true;
						}
					}
				} else {
					initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
				}
	
				if (initPlugins) {
					TweenLite._onPluginEvent("_onInitAllProps", this); //reorders the array in order of priority. Uses a static TweenPlugin method in order to minimize file size in TweenLite
				}
				if (op) if (!this._firstPT) if (typeof(this.target) !== "function") { //if all tweening properties have been overwritten, kill the tween. If the target is a function, it's probably a delayedCall so let it live.
					this._enabled(false, false);
				}
				if (v.runBackwards) {
					pt = this._firstPT;
					while (pt) {
						pt.s += pt.c;
						pt.c = -pt.c;
						pt = pt._next;
					}
				}
				this._onUpdate = v.onUpdate;
				this._initted = true;
			};
	
			p._initProps = function(target, propLookup, siblings, overwrittenProps) {
				var p, i, initPlugins, plugin, pt, v;
				if (target == null) {
					return false;
				}
	
				if (_lazyLookup[target._gsTweenID]) {
					_lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)
				}
	
				if (!this.vars.css) if (target.style) if (target !== window && target.nodeType) if (_plugins.css) if (this.vars.autoCSS !== false) { //it's so common to use TweenLite/Max to animate the css of DOM elements, we assume that if the target is a DOM element, that's what is intended (a convenience so that users don't have to wrap things in css:{}, although we still recommend it for a slight performance boost and better specificity). Note: we cannot check "nodeType" on the window inside an iframe.
					_autoCSS(this.vars, target);
				}
				for (p in this.vars) {
					v = this.vars[p];
					if (_reservedProps[p]) {
						if (v) if ((v instanceof Array) || (v.push && _isArray(v))) if (v.join("").indexOf("{self}") !== -1) {
							this.vars[p] = v = this._swapSelfInParams(v, this);
						}
	
					} else if (_plugins[p] && (plugin = new _plugins[p]())._onInitTween(target, this.vars[p], this)) {
	
						//t - target 		[object]
						//p - property 		[string]
						//s - start			[number]
						//c - change		[number]
						//f - isFunction	[boolean]
						//n - name			[string]
						//pg - isPlugin 	[boolean]
						//pr - priority		[number]
						this._firstPT = pt = {_next:this._firstPT, t:plugin, p:"setRatio", s:0, c:1, f:1, n:p, pg:1, pr:plugin._priority};
						i = plugin._overwriteProps.length;
						while (--i > -1) {
							propLookup[plugin._overwriteProps[i]] = this._firstPT;
						}
						if (plugin._priority || plugin._onInitAllProps) {
							initPlugins = true;
						}
						if (plugin._onDisable || plugin._onEnable) {
							this._notifyPluginsOfEnabled = true;
						}
						if (pt._next) {
							pt._next._prev = pt;
						}
	
					} else {
						propLookup[p] = _addPropTween.call(this, target, p, "get", v, p, 0, null, this.vars.stringFilter);
					}
				}
	
				if (overwrittenProps) if (this._kill(overwrittenProps, target)) { //another tween may have tried to overwrite properties of this tween before init() was called (like if two tweens start at the same time, the one created second will run first)
					return this._initProps(target, propLookup, siblings, overwrittenProps);
				}
				if (this._overwrite > 1) if (this._firstPT) if (siblings.length > 1) if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
					this._kill(propLookup, target);
					return this._initProps(target, propLookup, siblings, overwrittenProps);
				}
				if (this._firstPT) if ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration)) { //zero duration tweens don't lazy render by default; everything else does.
					_lazyLookup[target._gsTweenID] = true;
				}
				return initPlugins;
			};
	
			p.render = function(time, suppressEvents, force) {
				var prevTime = this._time,
					duration = this._duration,
					prevRawPrevTime = this._rawPrevTime,
					isComplete, callback, pt, rawPrevTime;
				if (time >= duration - 0.0000001) { //to work around occasional floating point math artifacts.
					this._totalTime = this._time = duration;
					this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
					if (!this._reversed ) {
						isComplete = true;
						callback = "onComplete";
						force = (force || this._timeline.autoRemoveChildren); //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
					}
					if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
						if (this._startTime === this._timeline._duration) { //if a zero-duration tween is at the VERY end of a timeline and that timeline renders at its end, it will typically add a tiny bit of cushion to the render time to prevent rounding errors from getting in the way of tweens rendering their VERY end. If we then reverse() that timeline, the zero-duration tween will trigger its onReverseComplete even though technically the playhead didn't pass over it again. It's a very specific edge case we must accommodate.
							time = 0;
						}
						if (prevRawPrevTime < 0 || (time <= 0 && time >= -0.0000001) || (prevRawPrevTime === _tinyNum && this.data !== "isPause")) if (prevRawPrevTime !== time) { //note: when this.data is "isPause", it's a callback added by addPause() on a timeline that we should not be triggered when LEAVING its exact start time. In other words, tl.addPause(1).play(1) shouldn't pause.
							force = true;
							if (prevRawPrevTime > _tinyNum) {
								callback = "onReverseComplete";
							}
						}
						this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
					}
	
				} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
					this._totalTime = this._time = 0;
					this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
					if (prevTime !== 0 || (duration === 0 && prevRawPrevTime > 0)) {
						callback = "onReverseComplete";
						isComplete = this._reversed;
					}
					if (time < 0) {
						this._active = false;
						if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
							if (prevRawPrevTime >= 0 && !(prevRawPrevTime === _tinyNum && this.data === "isPause")) {
								force = true;
							}
							this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
						}
					}
					if (!this._initted) { //if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
						force = true;
					}
				} else {
					this._totalTime = this._time = time;
	
					if (this._easeType) {
						var r = time / duration, type = this._easeType, pow = this._easePower;
						if (type === 1 || (type === 3 && r >= 0.5)) {
							r = 1 - r;
						}
						if (type === 3) {
							r *= 2;
						}
						if (pow === 1) {
							r *= r;
						} else if (pow === 2) {
							r *= r * r;
						} else if (pow === 3) {
							r *= r * r * r;
						} else if (pow === 4) {
							r *= r * r * r * r;
						}
	
						if (type === 1) {
							this.ratio = 1 - r;
						} else if (type === 2) {
							this.ratio = r;
						} else if (time / duration < 0.5) {
							this.ratio = r / 2;
						} else {
							this.ratio = 1 - (r / 2);
						}
	
					} else {
						this.ratio = this._ease.getRatio(time / duration);
					}
				}
	
				if (this._time === prevTime && !force) {
					return;
				} else if (!this._initted) {
					this._init();
					if (!this._initted || this._gc) { //immediateRender tweens typically won't initialize until the playhead advances (_time is greater than 0) in order to ensure that overwriting occurs properly. Also, if all of the tweening properties have been overwritten (which would cause _gc to be true, as set in _init()), we shouldn't continue otherwise an onStart callback could be called for example.
						return;
					} else if (!force && this._firstPT && ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration))) {
						this._time = this._totalTime = prevTime;
						this._rawPrevTime = prevRawPrevTime;
						_lazyTweens.push(this);
						this._lazy = [time, suppressEvents];
						return;
					}
					//_ease is initially set to defaultEase, so now that init() has run, _ease is set properly and we need to recalculate the ratio. Overall this is faster than using conditional logic earlier in the method to avoid having to set ratio twice because we only init() once but renderTime() gets called VERY frequently.
					if (this._time && !isComplete) {
						this.ratio = this._ease.getRatio(this._time / duration);
					} else if (isComplete && this._ease._calcEnd) {
						this.ratio = this._ease.getRatio((this._time === 0) ? 0 : 1);
					}
				}
				if (this._lazy !== false) { //in case a lazy render is pending, we should flush it because the new render is occurring now (imagine a lazy tween instantiating and then immediately the user calls tween.seek(tween.duration()), skipping to the end - the end render would be forced, and then if we didn't flush the lazy render, it'd fire AFTER the seek(), rendering it at the wrong time.
					this._lazy = false;
				}
				if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
					this._active = true;  //so that if the user renders a tween (as opposed to the timeline rendering it), the timeline is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the tween already finished but the user manually re-renders it as halfway done.
				}
				if (prevTime === 0) {
					if (this._startAt) {
						if (time >= 0) {
							this._startAt.render(time, suppressEvents, force);
						} else if (!callback) {
							callback = "_dummyGS"; //if no callback is defined, use a dummy value just so that the condition at the end evaluates as true because _startAt should render AFTER the normal render loop when the time is negative. We could handle this in a more intuitive way, of course, but the render loop is the MOST important thing to optimize, so this technique allows us to avoid adding extra conditional logic in a high-frequency area.
						}
					}
					if (this.vars.onStart) if (this._time !== 0 || duration === 0) if (!suppressEvents) {
						this._callback("onStart");
					}
				}
				pt = this._firstPT;
				while (pt) {
					if (pt.f) {
						pt.t[pt.p](pt.c * this.ratio + pt.s);
					} else {
						pt.t[pt.p] = pt.c * this.ratio + pt.s;
					}
					pt = pt._next;
				}
	
				if (this._onUpdate) {
					if (time < 0) if (this._startAt && time !== -0.0001) { //if the tween is positioned at the VERY beginning (_startTime 0) of its parent timeline, it's illegal for the playhead to go back further, so we should not render the recorded startAt values.
						this._startAt.render(time, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.
					}
					if (!suppressEvents) if (this._time !== prevTime || isComplete || force) {
						this._callback("onUpdate");
					}
				}
				if (callback) if (!this._gc || force) { //check _gc because there's a chance that kill() could be called in an onUpdate
					if (time < 0 && this._startAt && !this._onUpdate && time !== -0.0001) { //-0.0001 is a special value that we use when looping back to the beginning of a repeated TimelineMax, in which case we shouldn't render the _startAt values.
						this._startAt.render(time, suppressEvents, force);
					}
					if (isComplete) {
						if (this._timeline.autoRemoveChildren) {
							this._enabled(false, false);
						}
						this._active = false;
					}
					if (!suppressEvents && this.vars[callback]) {
						this._callback(callback);
					}
					if (duration === 0 && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum) { //the onComplete or onReverseComplete could trigger movement of the playhead and for zero-duration tweens (which must discern direction) that land directly back on their start time, we don't want to fire again on the next render. Think of several addPause()'s in a timeline that forces the playhead to a certain spot, but what if it's already paused and another tween is tweening the "time" of the timeline? Each time it moves [forward] past that spot, it would move back, and since suppressEvents is true, it'd reset _rawPrevTime to _tinyNum so that when it begins again, the callback would fire (so ultimately it could bounce back and forth during that tween). Again, this is a very uncommon scenario, but possible nonetheless.
						this._rawPrevTime = 0;
					}
				}
			};
	
			p._kill = function(vars, target, overwritingTween) {
				if (vars === "all") {
					vars = null;
				}
				if (vars == null) if (target == null || target === this.target) {
					this._lazy = false;
					return this._enabled(false, false);
				}
				target = (typeof(target) !== "string") ? (target || this._targets || this.target) : TweenLite.selector(target) || target;
				var simultaneousOverwrite = (overwritingTween && this._time && overwritingTween._startTime === this._startTime && this._timeline === overwritingTween._timeline),
					i, overwrittenProps, p, pt, propLookup, changed, killProps, record, killed;
				if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
					i = target.length;
					while (--i > -1) {
						if (this._kill(vars, target[i], overwritingTween)) {
							changed = true;
						}
					}
				} else {
					if (this._targets) {
						i = this._targets.length;
						while (--i > -1) {
							if (target === this._targets[i]) {
								propLookup = this._propLookup[i] || {};
								this._overwrittenProps = this._overwrittenProps || [];
								overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
								break;
							}
						}
					} else if (target !== this.target) {
						return false;
					} else {
						propLookup = this._propLookup;
						overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all";
					}
	
					if (propLookup) {
						killProps = vars || propLookup;
						record = (vars !== overwrittenProps && overwrittenProps !== "all" && vars !== propLookup && (typeof(vars) !== "object" || !vars._tempKill)); //_tempKill is a super-secret way to delete a particular tweening property but NOT have it remembered as an official overwritten property (like in BezierPlugin)
						if (overwritingTween && (TweenLite.onOverwrite || this.vars.onOverwrite)) {
							for (p in killProps) {
								if (propLookup[p]) {
									if (!killed) {
										killed = [];
									}
									killed.push(p);
								}
							}
							if ((killed || !vars) && !_onOverwrite(this, overwritingTween, target, killed)) { //if the onOverwrite returned false, that means the user wants to override the overwriting (cancel it).
								return false;
							}
						}
	
						for (p in killProps) {
							if ((pt = propLookup[p])) {
								if (simultaneousOverwrite) { //if another tween overwrites this one and they both start at exactly the same time, yet this tween has already rendered once (for example, at 0.001) because it's first in the queue, we should revert the values to where they were at 0 so that the starting values aren't contaminated on the overwriting tween.
									if (pt.f) {
										pt.t[pt.p](pt.s);
									} else {
										pt.t[pt.p] = pt.s;
									}
									changed = true;
								}
								if (pt.pg && pt.t._kill(killProps)) {
									changed = true; //some plugins need to be notified so they can perform cleanup tasks first
								}
								if (!pt.pg || pt.t._overwriteProps.length === 0) {
									if (pt._prev) {
										pt._prev._next = pt._next;
									} else if (pt === this._firstPT) {
										this._firstPT = pt._next;
									}
									if (pt._next) {
										pt._next._prev = pt._prev;
									}
									pt._next = pt._prev = null;
								}
								delete propLookup[p];
							}
							if (record) {
								overwrittenProps[p] = 1;
							}
						}
						if (!this._firstPT && this._initted) { //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.
							this._enabled(false, false);
						}
					}
				}
				return changed;
			};
	
			p.invalidate = function() {
				if (this._notifyPluginsOfEnabled) {
					TweenLite._onPluginEvent("_onDisable", this);
				}
				this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null;
				this._notifyPluginsOfEnabled = this._active = this._lazy = false;
				this._propLookup = (this._targets) ? {} : [];
				Animation.prototype.invalidate.call(this);
				if (this.vars.immediateRender) {
					this._time = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)
					this.render(Math.min(0, -this._delay)); //in case delay is negative.
				}
				return this;
			};
	
			p._enabled = function(enabled, ignoreTimeline) {
				if (!_tickerActive) {
					_ticker.wake();
				}
				if (enabled && this._gc) {
					var targets = this._targets,
						i;
					if (targets) {
						i = targets.length;
						while (--i > -1) {
							this._siblings[i] = _register(targets[i], this, true);
						}
					} else {
						this._siblings = _register(this.target, this, true);
					}
				}
				Animation.prototype._enabled.call(this, enabled, ignoreTimeline);
				if (this._notifyPluginsOfEnabled) if (this._firstPT) {
					return TweenLite._onPluginEvent((enabled ? "_onEnable" : "_onDisable"), this);
				}
				return false;
			};
	
	
	//----TweenLite static methods -----------------------------------------------------
	
			TweenLite.to = function(target, duration, vars) {
				return new TweenLite(target, duration, vars);
			};
	
			TweenLite.from = function(target, duration, vars) {
				vars.runBackwards = true;
				vars.immediateRender = (vars.immediateRender != false);
				return new TweenLite(target, duration, vars);
			};
	
			TweenLite.fromTo = function(target, duration, fromVars, toVars) {
				toVars.startAt = fromVars;
				toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
				return new TweenLite(target, duration, toVars);
			};
	
			TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {
				return new TweenLite(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, callbackScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, immediateRender:false, lazy:false, useFrames:useFrames, overwrite:0});
			};
	
			TweenLite.set = function(target, vars) {
				return new TweenLite(target, 0, vars);
			};
	
			TweenLite.getTweensOf = function(target, onlyActive) {
				if (target == null) { return []; }
				target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;
				var i, a, j, t;
				if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
					i = target.length;
					a = [];
					while (--i > -1) {
						a = a.concat(TweenLite.getTweensOf(target[i], onlyActive));
					}
					i = a.length;
					//now get rid of any duplicates (tweens of arrays of objects could cause duplicates)
					while (--i > -1) {
						t = a[i];
						j = i;
						while (--j > -1) {
							if (t === a[j]) {
								a.splice(i, 1);
							}
						}
					}
				} else {
					a = _register(target).concat();
					i = a.length;
					while (--i > -1) {
						if (a[i]._gc || (onlyActive && !a[i].isActive())) {
							a.splice(i, 1);
						}
					}
				}
				return a;
			};
	
			TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function(target, onlyActive, vars) {
				if (typeof(onlyActive) === "object") {
					vars = onlyActive; //for backwards compatibility (before "onlyActive" parameter was inserted)
					onlyActive = false;
				}
				var a = TweenLite.getTweensOf(target, onlyActive),
					i = a.length;
				while (--i > -1) {
					a[i]._kill(vars, target);
				}
			};
	
	
	
	/*
	 * ----------------------------------------------------------------
	 * TweenPlugin   (could easily be split out as a separate file/class, but included for ease of use (so that people don't need to include another script call before loading plugins which is easy to forget)
	 * ----------------------------------------------------------------
	 */
			var TweenPlugin = _class("plugins.TweenPlugin", function(props, priority) {
						this._overwriteProps = (props || "").split(",");
						this._propName = this._overwriteProps[0];
						this._priority = priority || 0;
						this._super = TweenPlugin.prototype;
					}, true);
	
			p = TweenPlugin.prototype;
			TweenPlugin.version = "1.18.0";
			TweenPlugin.API = 2;
			p._firstPT = null;
			p._addTween = _addPropTween;
			p.setRatio = _setRatio;
	
			p._kill = function(lookup) {
				var a = this._overwriteProps,
					pt = this._firstPT,
					i;
				if (lookup[this._propName] != null) {
					this._overwriteProps = [];
				} else {
					i = a.length;
					while (--i > -1) {
						if (lookup[a[i]] != null) {
							a.splice(i, 1);
						}
					}
				}
				while (pt) {
					if (lookup[pt.n] != null) {
						if (pt._next) {
							pt._next._prev = pt._prev;
						}
						if (pt._prev) {
							pt._prev._next = pt._next;
							pt._prev = null;
						} else if (this._firstPT === pt) {
							this._firstPT = pt._next;
						}
					}
					pt = pt._next;
				}
				return false;
			};
	
			p._roundProps = function(lookup, value) {
				var pt = this._firstPT;
				while (pt) {
					if (lookup[this._propName] || (pt.n != null && lookup[ pt.n.split(this._propName + "_").join("") ])) { //some properties that are very plugin-specific add a prefix named after the _propName plus an underscore, so we need to ignore that extra stuff here.
						pt.r = value;
					}
					pt = pt._next;
				}
			};
	
			TweenLite._onPluginEvent = function(type, tween) {
				var pt = tween._firstPT,
					changed, pt2, first, last, next;
				if (type === "_onInitAllProps") {
					//sorts the PropTween linked list in order of priority because some plugins need to render earlier/later than others, like MotionBlurPlugin applies its effects after all x/y/alpha tweens have rendered on each frame.
					while (pt) {
						next = pt._next;
						pt2 = first;
						while (pt2 && pt2.pr > pt.pr) {
							pt2 = pt2._next;
						}
						if ((pt._prev = pt2 ? pt2._prev : last)) {
							pt._prev._next = pt;
						} else {
							first = pt;
						}
						if ((pt._next = pt2)) {
							pt2._prev = pt;
						} else {
							last = pt;
						}
						pt = next;
					}
					pt = tween._firstPT = first;
				}
				while (pt) {
					if (pt.pg) if (typeof(pt.t[type]) === "function") if (pt.t[type]()) {
						changed = true;
					}
					pt = pt._next;
				}
				return changed;
			};
	
			TweenPlugin.activate = function(plugins) {
				var i = plugins.length;
				while (--i > -1) {
					if (plugins[i].API === TweenPlugin.API) {
						_plugins[(new plugins[i]())._propName] = plugins[i];
					}
				}
				return true;
			};
	
			//provides a more concise way to define plugins that have no dependencies besides TweenPlugin and TweenLite, wrapping common boilerplate stuff into one function (added in 1.9.0). You don't NEED to use this to define a plugin - the old way still works and can be useful in certain (rare) situations.
			_gsDefine.plugin = function(config) {
				if (!config || !config.propName || !config.init || !config.API) { throw "illegal plugin definition."; }
				var propName = config.propName,
					priority = config.priority || 0,
					overwriteProps = config.overwriteProps,
					map = {init:"_onInitTween", set:"setRatio", kill:"_kill", round:"_roundProps", initAll:"_onInitAllProps"},
					Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin",
						function() {
							TweenPlugin.call(this, propName, priority);
							this._overwriteProps = overwriteProps || [];
						}, (config.global === true)),
					p = Plugin.prototype = new TweenPlugin(propName),
					prop;
				p.constructor = Plugin;
				Plugin.API = config.API;
				for (prop in map) {
					if (typeof(config[prop]) === "function") {
						p[map[prop]] = config[prop];
					}
				}
				Plugin.version = config.version;
				TweenPlugin.activate([Plugin]);
				return Plugin;
			};
	
	
			//now run through all the dependencies discovered and if any are missing, log that to the console as a warning. This is why it's best to have TweenLite load last - it can check all the dependencies for you.
			a = window._gsQueue;
			if (a) {
				for (i = 0; i < a.length; i++) {
					a[i]();
				}
				for (p in _defLookup) {
					if (!_defLookup[p].func) {
						window.console.log("GSAP encountered missing dependency: com.greensock." + p);
					}
				}
			}
	
			_tickerActive = false; //ensures that the first official animation forces a ticker.tick() to update the time when it is instantiated
	
	})((typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window, "TweenMax");
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;
	
	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */
	
	THREE.SpriteCanvasMaterial = function ( parameters ) {
	
		THREE.Material.call( this );
	
		this.type = 'SpriteCanvasMaterial';
	
		this.color = new THREE.Color( 0xffffff );
		this.program = function ( context, color ) {};
	
		this.setValues( parameters );
	
	};
	
	THREE.SpriteCanvasMaterial.prototype = Object.create( THREE.Material.prototype );
	THREE.SpriteCanvasMaterial.prototype.constructor = THREE.SpriteCanvasMaterial;
	
	THREE.SpriteCanvasMaterial.prototype.clone = function () {
	
		var material = new THREE.SpriteCanvasMaterial();
	
		material.copy( this );
		material.color.copy( this.color );
		material.program = this.program;
	
		return material;
	
	};
	
	//
	
	THREE.CanvasRenderer = function ( parameters ) {
	
		console.log( 'THREE.CanvasRenderer', THREE.REVISION );
	
		parameters = parameters || {};
	
		var _this = this,
		_renderData, _elements, _lights,
		_projector = new THREE.Projector(),
	
		_canvas = parameters.canvas !== undefined
				 ? parameters.canvas
				 : document.createElement( 'canvas' ),
	
		_canvasWidth = _canvas.width,
		_canvasHeight = _canvas.height,
		_canvasWidthHalf = Math.floor( _canvasWidth / 2 ),
		_canvasHeightHalf = Math.floor( _canvasHeight / 2 ),
	
		_viewportX = 0,
		_viewportY = 0,
		_viewportWidth = _canvasWidth,
		_viewportHeight = _canvasHeight,
	
		_pixelRatio = 1,
	
		_context = _canvas.getContext( '2d', {
			alpha: parameters.alpha === true
		} ),
	
		_clearColor = new THREE.Color( 0x000000 ),
		_clearAlpha = parameters.alpha === true ? 0 : 1,
	
		_contextGlobalAlpha = 1,
		_contextGlobalCompositeOperation = 0,
		_contextStrokeStyle = null,
		_contextFillStyle = null,
		_contextLineWidth = null,
		_contextLineCap = null,
		_contextLineJoin = null,
		_contextLineDash = [],
	
		_camera,
	
		_v1, _v2, _v3, _v4,
		_v5 = new THREE.RenderableVertex(),
		_v6 = new THREE.RenderableVertex(),
	
		_v1x, _v1y, _v2x, _v2y, _v3x, _v3y,
		_v4x, _v4y, _v5x, _v5y, _v6x, _v6y,
	
		_color = new THREE.Color(),
		_color1 = new THREE.Color(),
		_color2 = new THREE.Color(),
		_color3 = new THREE.Color(),
		_color4 = new THREE.Color(),
	
		_diffuseColor = new THREE.Color(),
		_emissiveColor = new THREE.Color(),
	
		_lightColor = new THREE.Color(),
	
		_patterns = {},
	
		_image, _uvs,
		_uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y,
	
		_clipBox = new THREE.Box2(),
		_clearBox = new THREE.Box2(),
		_elemBox = new THREE.Box2(),
	
		_ambientLight = new THREE.Color(),
		_directionalLights = new THREE.Color(),
		_pointLights = new THREE.Color(),
	
		_vector3 = new THREE.Vector3(), // Needed for PointLight
		_centroid = new THREE.Vector3(),
		_normal = new THREE.Vector3(),
		_normalViewMatrix = new THREE.Matrix3();
	
		/* TODO
		_canvas.mozImageSmoothingEnabled = false;
		_canvas.webkitImageSmoothingEnabled = false;
		_canvas.msImageSmoothingEnabled = false;
		_canvas.imageSmoothingEnabled = false;
		*/
	
		// dash+gap fallbacks for Firefox and everything else
	
		if ( _context.setLineDash === undefined ) {
	
			_context.setLineDash = function () {};
	
		}
	
		this.domElement = _canvas;
	
		this.autoClear = true;
		this.sortObjects = true;
		this.sortElements = true;
	
		this.info = {
	
			render: {
	
				vertices: 0,
				faces: 0
	
			}
	
		};
	
		// WebGLRenderer compatibility
	
		this.supportsVertexTextures = function () {};
		this.setFaceCulling = function () {};
	
		// API
	
		this.getContext = function () {
	
			return _context;
	
		};
	
		this.getContextAttributes = function () {
	
			return _context.getContextAttributes();
	
		};
	
		this.getPixelRatio = function () {
	
			return _pixelRatio;
	
		};
	
		this.setPixelRatio = function ( value ) {
	
			if ( value !== undefined ) _pixelRatio = value;
	
		};
	
		this.setSize = function ( width, height, updateStyle ) {
	
			_canvasWidth = width * _pixelRatio;
			_canvasHeight = height * _pixelRatio;
	
			_canvas.width = _canvasWidth;
			_canvas.height = _canvasHeight;
	
			_canvasWidthHalf = Math.floor( _canvasWidth / 2 );
			_canvasHeightHalf = Math.floor( _canvasHeight / 2 );
	
			if ( updateStyle !== false ) {
	
				_canvas.style.width = width + 'px';
				_canvas.style.height = height + 'px';
	
			}
	
			_clipBox.min.set( - _canvasWidthHalf, - _canvasHeightHalf );
			_clipBox.max.set(   _canvasWidthHalf,   _canvasHeightHalf );
	
			_clearBox.min.set( - _canvasWidthHalf, - _canvasHeightHalf );
			_clearBox.max.set(   _canvasWidthHalf,   _canvasHeightHalf );
	
			_contextGlobalAlpha = 1;
			_contextGlobalCompositeOperation = 0;
			_contextStrokeStyle = null;
			_contextFillStyle = null;
			_contextLineWidth = null;
			_contextLineCap = null;
			_contextLineJoin = null;
	
			this.setViewport( 0, 0, width, height );
	
		};
	
		this.setViewport = function ( x, y, width, height ) {
	
			_viewportX = x * _pixelRatio;
			_viewportY = y * _pixelRatio;
	
			_viewportWidth = width * _pixelRatio;
			_viewportHeight = height * _pixelRatio;
	
		};
	
		this.setScissor = function () {};
		this.setScissorTest = function () {};
	
		this.setClearColor = function ( color, alpha ) {
	
			_clearColor.set( color );
			_clearAlpha = alpha !== undefined ? alpha : 1;
	
			_clearBox.min.set( - _canvasWidthHalf, - _canvasHeightHalf );
			_clearBox.max.set(   _canvasWidthHalf,   _canvasHeightHalf );
	
		};
	
		this.setClearColorHex = function ( hex, alpha ) {
	
			console.warn( 'THREE.CanvasRenderer: .setClearColorHex() is being removed. Use .setClearColor() instead.' );
			this.setClearColor( hex, alpha );
	
		};
	
		this.getClearColor = function () {
	
			return _clearColor;
	
		};
	
		this.getClearAlpha = function () {
	
			return _clearAlpha;
	
		};
	
		this.getMaxAnisotropy = function () {
	
			return 0;
	
		};
	
		this.clear = function () {
	
			if ( _clearBox.isEmpty() === false ) {
	
				_clearBox.intersect( _clipBox );
				_clearBox.expandByScalar( 2 );
	
				_clearBox.min.x = _clearBox.min.x + _canvasWidthHalf;
				_clearBox.min.y =  - _clearBox.min.y + _canvasHeightHalf;		// higher y value !
				_clearBox.max.x = _clearBox.max.x + _canvasWidthHalf;
				_clearBox.max.y =  - _clearBox.max.y + _canvasHeightHalf;		// lower y value !
	
				if ( _clearAlpha < 1 ) {
	
					_context.clearRect(
						_clearBox.min.x | 0,
						_clearBox.max.y | 0,
						( _clearBox.max.x - _clearBox.min.x ) | 0,
						( _clearBox.min.y - _clearBox.max.y ) | 0
					);
	
				}
	
				if ( _clearAlpha > 0 ) {
	
					setBlending( THREE.NormalBlending );
					setOpacity( 1 );
	
					setFillStyle( 'rgba(' + Math.floor( _clearColor.r * 255 ) + ',' + Math.floor( _clearColor.g * 255 ) + ',' + Math.floor( _clearColor.b * 255 ) + ',' + _clearAlpha + ')' );
	
					_context.fillRect(
						_clearBox.min.x | 0,
						_clearBox.max.y | 0,
						( _clearBox.max.x - _clearBox.min.x ) | 0,
						( _clearBox.min.y - _clearBox.max.y ) | 0
					);
	
				}
	
				_clearBox.makeEmpty();
	
			}
	
		};
	
		// compatibility
	
		this.clearColor = function () {};
		this.clearDepth = function () {};
		this.clearStencil = function () {};
	
		this.render = function ( scene, camera ) {
	
			if ( camera instanceof THREE.Camera === false ) {
	
				console.error( 'THREE.CanvasRenderer.render: camera is not an instance of THREE.Camera.' );
				return;
	
			}
	
			if ( this.autoClear === true ) this.clear();
	
			_this.info.render.vertices = 0;
			_this.info.render.faces = 0;
	
			_context.setTransform( _viewportWidth / _canvasWidth, 0, 0, - _viewportHeight / _canvasHeight, _viewportX, _canvasHeight - _viewportY );
			_context.translate( _canvasWidthHalf, _canvasHeightHalf );
	
			_renderData = _projector.projectScene( scene, camera, this.sortObjects, this.sortElements );
			_elements = _renderData.elements;
			_lights = _renderData.lights;
			_camera = camera;
	
			_normalViewMatrix.getNormalMatrix( camera.matrixWorldInverse );
	
			/* DEBUG
			setFillStyle( 'rgba( 0, 255, 255, 0.5 )' );
			_context.fillRect( _clipBox.min.x, _clipBox.min.y, _clipBox.max.x - _clipBox.min.x, _clipBox.max.y - _clipBox.min.y );
			*/
	
			calculateLights();
	
			for ( var e = 0, el = _elements.length; e < el; e ++ ) {
	
				var element = _elements[ e ];
	
				var material = element.material;
	
				if ( material === undefined || material.opacity === 0 ) continue;
	
				_elemBox.makeEmpty();
	
				if ( element instanceof THREE.RenderableSprite ) {
	
					_v1 = element;
					_v1.x *= _canvasWidthHalf; _v1.y *= _canvasHeightHalf;
	
					renderSprite( _v1, element, material );
	
				} else if ( element instanceof THREE.RenderableLine ) {
	
					_v1 = element.v1; _v2 = element.v2;
	
					_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
					_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;
	
					_elemBox.setFromPoints( [
						_v1.positionScreen,
						_v2.positionScreen
					] );
	
					if ( _clipBox.intersectsBox( _elemBox ) === true ) {
	
						renderLine( _v1, _v2, element, material );
	
					}
	
				} else if ( element instanceof THREE.RenderableFace ) {
	
					_v1 = element.v1; _v2 = element.v2; _v3 = element.v3;
	
					if ( _v1.positionScreen.z < - 1 || _v1.positionScreen.z > 1 ) continue;
					if ( _v2.positionScreen.z < - 1 || _v2.positionScreen.z > 1 ) continue;
					if ( _v3.positionScreen.z < - 1 || _v3.positionScreen.z > 1 ) continue;
	
					_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
					_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;
					_v3.positionScreen.x *= _canvasWidthHalf; _v3.positionScreen.y *= _canvasHeightHalf;
	
					if ( material.overdraw > 0 ) {
	
						expand( _v1.positionScreen, _v2.positionScreen, material.overdraw );
						expand( _v2.positionScreen, _v3.positionScreen, material.overdraw );
						expand( _v3.positionScreen, _v1.positionScreen, material.overdraw );
	
					}
	
					_elemBox.setFromPoints( [
						_v1.positionScreen,
						_v2.positionScreen,
						_v3.positionScreen
					] );
	
					if ( _clipBox.intersectsBox( _elemBox ) === true ) {
	
						renderFace3( _v1, _v2, _v3, 0, 1, 2, element, material );
	
					}
	
				}
	
				/* DEBUG
				setLineWidth( 1 );
				setStrokeStyle( 'rgba( 0, 255, 0, 0.5 )' );
				_context.strokeRect( _elemBox.min.x, _elemBox.min.y, _elemBox.max.x - _elemBox.min.x, _elemBox.max.y - _elemBox.min.y );
				*/
	
				_clearBox.union( _elemBox );
	
			}
	
			/* DEBUG
			setLineWidth( 1 );
			setStrokeStyle( 'rgba( 255, 0, 0, 0.5 )' );
			_context.strokeRect( _clearBox.min.x, _clearBox.min.y, _clearBox.max.x - _clearBox.min.x, _clearBox.max.y - _clearBox.min.y );
			*/
	
			_context.setTransform( 1, 0, 0, 1, 0, 0 );
	
		};
	
		//
	
		function calculateLights() {
	
			_ambientLight.setRGB( 0, 0, 0 );
			_directionalLights.setRGB( 0, 0, 0 );
			_pointLights.setRGB( 0, 0, 0 );
	
			for ( var l = 0, ll = _lights.length; l < ll; l ++ ) {
	
				var light = _lights[ l ];
				var lightColor = light.color;
	
				if ( light instanceof THREE.AmbientLight ) {
	
					_ambientLight.add( lightColor );
	
				} else if ( light instanceof THREE.DirectionalLight ) {
	
					// for sprites
	
					_directionalLights.add( lightColor );
	
				} else if ( light instanceof THREE.PointLight ) {
	
					// for sprites
	
					_pointLights.add( lightColor );
	
				}
	
			}
	
		}
	
		function calculateLight( position, normal, color ) {
	
			for ( var l = 0, ll = _lights.length; l < ll; l ++ ) {
	
				var light = _lights[ l ];
	
				_lightColor.copy( light.color );
	
				if ( light instanceof THREE.DirectionalLight ) {
	
					var lightPosition = _vector3.setFromMatrixPosition( light.matrixWorld ).normalize();
	
					var amount = normal.dot( lightPosition );
	
					if ( amount <= 0 ) continue;
	
					amount *= light.intensity;
	
					color.add( _lightColor.multiplyScalar( amount ) );
	
				} else if ( light instanceof THREE.PointLight ) {
	
					var lightPosition = _vector3.setFromMatrixPosition( light.matrixWorld );
	
					var amount = normal.dot( _vector3.subVectors( lightPosition, position ).normalize() );
	
					if ( amount <= 0 ) continue;
	
					amount *= light.distance == 0 ? 1 : 1 - Math.min( position.distanceTo( lightPosition ) / light.distance, 1 );
	
					if ( amount == 0 ) continue;
	
					amount *= light.intensity;
	
					color.add( _lightColor.multiplyScalar( amount ) );
	
				}
	
			}
	
		}
	
		function renderSprite( v1, element, material ) {
	
			setOpacity( material.opacity );
			setBlending( material.blending );
	
			var scaleX = element.scale.x * _canvasWidthHalf;
			var scaleY = element.scale.y * _canvasHeightHalf;
	
			var dist = 0.5 * Math.sqrt( scaleX * scaleX + scaleY * scaleY ); // allow for rotated sprite
			_elemBox.min.set( v1.x - dist, v1.y - dist );
			_elemBox.max.set( v1.x + dist, v1.y + dist );
	
			if ( material instanceof THREE.SpriteMaterial ) {
	
				var texture = material.map;
	
				if ( texture !== null ) {
	
					var pattern = _patterns[ texture.id ];
	
					if ( pattern === undefined || pattern.version !== texture.version ) {
	
						pattern = textureToPattern( texture );
						_patterns[ texture.id ] = pattern;
	
					}
	
					if ( pattern.canvas !== undefined ) {
	
						setFillStyle( pattern.canvas );
	
						var bitmap = texture.image;
	
						var ox = bitmap.width * texture.offset.x;
						var oy = bitmap.height * texture.offset.y;
	
						var sx = bitmap.width * texture.repeat.x;
						var sy = bitmap.height * texture.repeat.y;
	
						var cx = scaleX / sx;
						var cy = scaleY / sy;
	
						_context.save();
						_context.translate( v1.x, v1.y );
						if ( material.rotation !== 0 ) _context.rotate( material.rotation );
						_context.translate( - scaleX / 2, - scaleY / 2 );
						_context.scale( cx, cy );
						_context.translate( - ox, - oy );
						_context.fillRect( ox, oy, sx, sy );
						_context.restore();
	
					}
	
				} else {
	
					// no texture
	
					setFillStyle( material.color.getStyle() );
	
					_context.save();
					_context.translate( v1.x, v1.y );
					if ( material.rotation !== 0 ) _context.rotate( material.rotation );
					_context.scale( scaleX, - scaleY );
					_context.fillRect( - 0.5, - 0.5, 1, 1 );
					_context.restore();
	
				}
	
			} else if ( material instanceof THREE.SpriteCanvasMaterial ) {
	
				setStrokeStyle( material.color.getStyle() );
				setFillStyle( material.color.getStyle() );
	
				_context.save();
				_context.translate( v1.x, v1.y );
				if ( material.rotation !== 0 ) _context.rotate( material.rotation );
				_context.scale( scaleX, scaleY );
	
				material.program( _context );
	
				_context.restore();
	
			}
	
			/* DEBUG
			setStrokeStyle( 'rgb(255,255,0)' );
			_context.beginPath();
			_context.moveTo( v1.x - 10, v1.y );
			_context.lineTo( v1.x + 10, v1.y );
			_context.moveTo( v1.x, v1.y - 10 );
			_context.lineTo( v1.x, v1.y + 10 );
			_context.stroke();
			*/
	
		}
	
		function renderLine( v1, v2, element, material ) {
	
			setOpacity( material.opacity );
			setBlending( material.blending );
	
			_context.beginPath();
			_context.moveTo( v1.positionScreen.x, v1.positionScreen.y );
			_context.lineTo( v2.positionScreen.x, v2.positionScreen.y );
	
			if ( material instanceof THREE.LineBasicMaterial ) {
	
				setLineWidth( material.linewidth );
				setLineCap( material.linecap );
				setLineJoin( material.linejoin );
	
				if ( material.vertexColors !== THREE.VertexColors ) {
	
					setStrokeStyle( material.color.getStyle() );
	
				} else {
	
					var colorStyle1 = element.vertexColors[ 0 ].getStyle();
					var colorStyle2 = element.vertexColors[ 1 ].getStyle();
	
					if ( colorStyle1 === colorStyle2 ) {
	
						setStrokeStyle( colorStyle1 );
	
					} else {
	
						try {
	
							var grad = _context.createLinearGradient(
								v1.positionScreen.x,
								v1.positionScreen.y,
								v2.positionScreen.x,
								v2.positionScreen.y
							);
							grad.addColorStop( 0, colorStyle1 );
							grad.addColorStop( 1, colorStyle2 );
	
						} catch ( exception ) {
	
							grad = colorStyle1;
	
						}
	
						setStrokeStyle( grad );
	
					}
	
				}
	
				_context.stroke();
				_elemBox.expandByScalar( material.linewidth * 2 );
	
			} else if ( material instanceof THREE.LineDashedMaterial ) {
	
				setLineWidth( material.linewidth );
				setLineCap( material.linecap );
				setLineJoin( material.linejoin );
				setStrokeStyle( material.color.getStyle() );
				setLineDash( [ material.dashSize, material.gapSize ] );
	
				_context.stroke();
	
				_elemBox.expandByScalar( material.linewidth * 2 );
	
				setLineDash( [] );
	
			}
	
		}
	
		function renderFace3( v1, v2, v3, uv1, uv2, uv3, element, material ) {
	
			_this.info.render.vertices += 3;
			_this.info.render.faces ++;
	
			setOpacity( material.opacity );
			setBlending( material.blending );
	
			_v1x = v1.positionScreen.x; _v1y = v1.positionScreen.y;
			_v2x = v2.positionScreen.x; _v2y = v2.positionScreen.y;
			_v3x = v3.positionScreen.x; _v3y = v3.positionScreen.y;
	
			drawTriangle( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y );
	
			if ( ( material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial ) && material.map === null ) {
	
				_diffuseColor.copy( material.color );
				_emissiveColor.copy( material.emissive );
	
				if ( material.vertexColors === THREE.FaceColors ) {
	
					_diffuseColor.multiply( element.color );
	
				}
	
				_color.copy( _ambientLight );
	
				_centroid.copy( v1.positionWorld ).add( v2.positionWorld ).add( v3.positionWorld ).divideScalar( 3 );
	
				calculateLight( _centroid, element.normalModel, _color );
	
				_color.multiply( _diffuseColor ).add( _emissiveColor );
	
				material.wireframe === true
					 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
					 : fillPath( _color );
	
			} else if ( material instanceof THREE.MeshBasicMaterial ||
					    material instanceof THREE.MeshLambertMaterial ||
					    material instanceof THREE.MeshPhongMaterial ) {
	
				if ( material.map !== null ) {
	
					var mapping = material.map.mapping;
	
					if ( mapping === THREE.UVMapping ) {
	
						_uvs = element.uvs;
						patternPath( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uvs[ uv1 ].x, _uvs[ uv1 ].y, _uvs[ uv2 ].x, _uvs[ uv2 ].y, _uvs[ uv3 ].x, _uvs[ uv3 ].y, material.map );
	
					}
	
				} else if ( material.envMap !== null ) {
	
					if ( material.envMap.mapping === THREE.SphericalReflectionMapping ) {
	
						_normal.copy( element.vertexNormalsModel[ uv1 ] ).applyMatrix3( _normalViewMatrix );
						_uv1x = 0.5 * _normal.x + 0.5;
						_uv1y = 0.5 * _normal.y + 0.5;
	
						_normal.copy( element.vertexNormalsModel[ uv2 ] ).applyMatrix3( _normalViewMatrix );
						_uv2x = 0.5 * _normal.x + 0.5;
						_uv2y = 0.5 * _normal.y + 0.5;
	
						_normal.copy( element.vertexNormalsModel[ uv3 ] ).applyMatrix3( _normalViewMatrix );
						_uv3x = 0.5 * _normal.x + 0.5;
						_uv3y = 0.5 * _normal.y + 0.5;
	
						patternPath( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y, material.envMap );
	
					}
	
				} else {
	
					_color.copy( material.color );
	
					if ( material.vertexColors === THREE.FaceColors ) {
	
						_color.multiply( element.color );
	
					}
	
					material.wireframe === true
						 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
						 : fillPath( _color );
	
				}
	
			} else if ( material instanceof THREE.MeshNormalMaterial ) {
	
				_normal.copy( element.normalModel ).applyMatrix3( _normalViewMatrix );
	
				_color.setRGB( _normal.x, _normal.y, _normal.z ).multiplyScalar( 0.5 ).addScalar( 0.5 );
	
				material.wireframe === true
					 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
					 : fillPath( _color );
	
			} else {
	
				_color.setRGB( 1, 1, 1 );
	
				material.wireframe === true
					 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
					 : fillPath( _color );
	
			}
	
		}
	
		//
	
		function drawTriangle( x0, y0, x1, y1, x2, y2 ) {
	
			_context.beginPath();
			_context.moveTo( x0, y0 );
			_context.lineTo( x1, y1 );
			_context.lineTo( x2, y2 );
			_context.closePath();
	
		}
	
		function strokePath( color, linewidth, linecap, linejoin ) {
	
			setLineWidth( linewidth );
			setLineCap( linecap );
			setLineJoin( linejoin );
			setStrokeStyle( color.getStyle() );
	
			_context.stroke();
	
			_elemBox.expandByScalar( linewidth * 2 );
	
		}
	
		function fillPath( color ) {
	
			setFillStyle( color.getStyle() );
			_context.fill();
	
		}
	
		function textureToPattern( texture ) {
	
			if ( texture.version === 0 ||
				texture instanceof THREE.CompressedTexture ||
				texture instanceof THREE.DataTexture ) {
	
				return {
					canvas: undefined,
					version: texture.version
				};
	
			}
	
			var image = texture.image;
	
			if ( image.complete === false ) {
	
				return {
					canvas: undefined,
					version: 0
				};
	
			}
	
			var canvas = document.createElement( 'canvas' );
			canvas.width = image.width;
			canvas.height = image.height;
	
			var context = canvas.getContext( '2d' );
			context.setTransform( 1, 0, 0, - 1, 0, image.height );
			context.drawImage( image, 0, 0 );
	
			var repeatX = texture.wrapS === THREE.RepeatWrapping;
			var repeatY = texture.wrapT === THREE.RepeatWrapping;
	
			var repeat = 'no-repeat';
	
			if ( repeatX === true && repeatY === true ) {
	
				repeat = 'repeat';
	
			} else if ( repeatX === true ) {
	
				repeat = 'repeat-x';
	
			} else if ( repeatY === true ) {
	
				repeat = 'repeat-y';
	
			}
	
			var pattern = _context.createPattern( canvas, repeat );
	
			if ( texture.onUpdate ) texture.onUpdate( texture );
	
			return {
				canvas: pattern,
				version: texture.version
			};
	
		}
	
		function patternPath( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, texture ) {
	
			var pattern = _patterns[ texture.id ];
	
			if ( pattern === undefined || pattern.version !== texture.version ) {
	
				pattern = textureToPattern( texture );
				_patterns[ texture.id ] = pattern;
	
			}
	
			if ( pattern.canvas !== undefined ) {
	
				setFillStyle( pattern.canvas );
	
			} else {
	
				setFillStyle( 'rgba( 0, 0, 0, 1)' );
				_context.fill();
				return;
	
			}
	
			// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120
	
			var a, b, c, d, e, f, det, idet,
			offsetX = texture.offset.x / texture.repeat.x,
			offsetY = texture.offset.y / texture.repeat.y,
			width = texture.image.width * texture.repeat.x,
			height = texture.image.height * texture.repeat.y;
	
			u0 = ( u0 + offsetX ) * width;
			v0 = ( v0 + offsetY ) * height;
	
			u1 = ( u1 + offsetX ) * width;
			v1 = ( v1 + offsetY ) * height;
	
			u2 = ( u2 + offsetX ) * width;
			v2 = ( v2 + offsetY ) * height;
	
			x1 -= x0; y1 -= y0;
			x2 -= x0; y2 -= y0;
	
			u1 -= u0; v1 -= v0;
			u2 -= u0; v2 -= v0;
	
			det = u1 * v2 - u2 * v1;
	
			if ( det === 0 ) return;
	
			idet = 1 / det;
	
			a = ( v2 * x1 - v1 * x2 ) * idet;
			b = ( v2 * y1 - v1 * y2 ) * idet;
			c = ( u1 * x2 - u2 * x1 ) * idet;
			d = ( u1 * y2 - u2 * y1 ) * idet;
	
			e = x0 - a * u0 - c * v0;
			f = y0 - b * u0 - d * v0;
	
			_context.save();
			_context.transform( a, b, c, d, e, f );
			_context.fill();
			_context.restore();
	
		}
	
		function clipImage( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, image ) {
	
			// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120
	
			var a, b, c, d, e, f, det, idet,
			width = image.width - 1,
			height = image.height - 1;
	
			u0 *= width; v0 *= height;
			u1 *= width; v1 *= height;
			u2 *= width; v2 *= height;
	
			x1 -= x0; y1 -= y0;
			x2 -= x0; y2 -= y0;
	
			u1 -= u0; v1 -= v0;
			u2 -= u0; v2 -= v0;
	
			det = u1 * v2 - u2 * v1;
	
			idet = 1 / det;
	
			a = ( v2 * x1 - v1 * x2 ) * idet;
			b = ( v2 * y1 - v1 * y2 ) * idet;
			c = ( u1 * x2 - u2 * x1 ) * idet;
			d = ( u1 * y2 - u2 * y1 ) * idet;
	
			e = x0 - a * u0 - c * v0;
			f = y0 - b * u0 - d * v0;
	
			_context.save();
			_context.transform( a, b, c, d, e, f );
			_context.clip();
			_context.drawImage( image, 0, 0 );
			_context.restore();
	
		}
	
		// Hide anti-alias gaps
	
		function expand( v1, v2, pixels ) {
	
			var x = v2.x - v1.x, y = v2.y - v1.y,
			det = x * x + y * y, idet;
	
			if ( det === 0 ) return;
	
			idet = pixels / Math.sqrt( det );
	
			x *= idet; y *= idet;
	
			v2.x += x; v2.y += y;
			v1.x -= x; v1.y -= y;
	
		}
	
		// Context cached methods.
	
		function setOpacity( value ) {
	
			if ( _contextGlobalAlpha !== value ) {
	
				_context.globalAlpha = value;
				_contextGlobalAlpha = value;
	
			}
	
		}
	
		function setBlending( value ) {
	
			if ( _contextGlobalCompositeOperation !== value ) {
	
				if ( value === THREE.NormalBlending ) {
	
					_context.globalCompositeOperation = 'source-over';
	
				} else if ( value === THREE.AdditiveBlending ) {
	
					_context.globalCompositeOperation = 'lighter';
	
				} else if ( value === THREE.SubtractiveBlending ) {
	
					_context.globalCompositeOperation = 'darker';
	
				}
	
				_contextGlobalCompositeOperation = value;
	
			}
	
		}
	
		function setLineWidth( value ) {
	
			if ( _contextLineWidth !== value ) {
	
				_context.lineWidth = value;
				_contextLineWidth = value;
	
			}
	
		}
	
		function setLineCap( value ) {
	
			// "butt", "round", "square"
	
			if ( _contextLineCap !== value ) {
	
				_context.lineCap = value;
				_contextLineCap = value;
	
			}
	
		}
	
		function setLineJoin( value ) {
	
			// "round", "bevel", "miter"
	
			if ( _contextLineJoin !== value ) {
	
				_context.lineJoin = value;
				_contextLineJoin = value;
	
			}
	
		}
	
		function setStrokeStyle( value ) {
	
			if ( _contextStrokeStyle !== value ) {
	
				_context.strokeStyle = value;
				_contextStrokeStyle = value;
	
			}
	
		}
	
		function setFillStyle( value ) {
	
			if ( _contextFillStyle !== value ) {
	
				_context.fillStyle = value;
				_contextFillStyle = value;
	
			}
	
		}
	
		function setLineDash( value ) {
	
			if ( _contextLineDash.length !== value.length ) {
	
				_context.setLineDash( value );
				_contextLineDash = value;
	
			}
	
		}
	
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 * @author mrdoob / http://mrdoob.com/
	 * @author supereggbert / http://www.paulbrunt.co.uk/
	 * @author julianwa / https://github.com/julianwa
	 */
	
	THREE.RenderableObject = function () {
	
		this.id = 0;
	
		this.object = null;
		this.z = 0;
		this.renderOrder = 0;
	
	};
	
	//
	
	THREE.RenderableFace = function () {
	
		this.id = 0;
	
		this.v1 = new THREE.RenderableVertex();
		this.v2 = new THREE.RenderableVertex();
		this.v3 = new THREE.RenderableVertex();
	
		this.normalModel = new THREE.Vector3();
	
		this.vertexNormalsModel = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
		this.vertexNormalsLength = 0;
	
		this.color = new THREE.Color();
		this.material = null;
		this.uvs = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];
	
		this.z = 0;
		this.renderOrder = 0;
	
	};
	
	//
	
	THREE.RenderableVertex = function () {
	
		this.position = new THREE.Vector3();
		this.positionWorld = new THREE.Vector3();
		this.positionScreen = new THREE.Vector4();
	
		this.visible = true;
	
	};
	
	THREE.RenderableVertex.prototype.copy = function ( vertex ) {
	
		this.positionWorld.copy( vertex.positionWorld );
		this.positionScreen.copy( vertex.positionScreen );
	
	};
	
	//
	
	THREE.RenderableLine = function () {
	
		this.id = 0;
	
		this.v1 = new THREE.RenderableVertex();
		this.v2 = new THREE.RenderableVertex();
	
		this.vertexColors = [ new THREE.Color(), new THREE.Color() ];
		this.material = null;
	
		this.z = 0;
		this.renderOrder = 0;
	
	};
	
	//
	
	THREE.RenderableSprite = function () {
	
		this.id = 0;
	
		this.object = null;
	
		this.x = 0;
		this.y = 0;
		this.z = 0;
	
		this.rotation = 0;
		this.scale = new THREE.Vector2();
	
		this.material = null;
		this.renderOrder = 0;
	
	};
	
	//
	
	THREE.Projector = function () {
	
		var _object, _objectCount, _objectPool = [], _objectPoolLength = 0,
		_vertex, _vertexCount, _vertexPool = [], _vertexPoolLength = 0,
		_face, _faceCount, _facePool = [], _facePoolLength = 0,
		_line, _lineCount, _linePool = [], _linePoolLength = 0,
		_sprite, _spriteCount, _spritePool = [], _spritePoolLength = 0,
	
		_renderData = { objects: [], lights: [], elements: [] },
	
		_vector3 = new THREE.Vector3(),
		_vector4 = new THREE.Vector4(),
	
		_clipBox = new THREE.Box3( new THREE.Vector3( - 1, - 1, - 1 ), new THREE.Vector3( 1, 1, 1 ) ),
		_boundingBox = new THREE.Box3(),
		_points3 = new Array( 3 ),
		_points4 = new Array( 4 ),
	
		_viewMatrix = new THREE.Matrix4(),
		_viewProjectionMatrix = new THREE.Matrix4(),
	
		_modelMatrix,
		_modelViewProjectionMatrix = new THREE.Matrix4(),
	
		_normalMatrix = new THREE.Matrix3(),
	
		_frustum = new THREE.Frustum(),
	
		_clippedVertex1PositionScreen = new THREE.Vector4(),
		_clippedVertex2PositionScreen = new THREE.Vector4();
	
		//
	
		this.projectVector = function ( vector, camera ) {
	
			console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
			vector.project( camera );
	
		};
	
		this.unprojectVector = function ( vector, camera ) {
	
			console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
			vector.unproject( camera );
	
		};
	
		this.pickingRay = function ( vector, camera ) {
	
			console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );
	
		};
	
		//
	
		var RenderList = function () {
	
			var normals = [];
			var uvs = [];
	
			var object = null;
			var material = null;
	
			var normalMatrix = new THREE.Matrix3();
	
			function setObject( value ) {
	
				object = value;
				material = object.material;
	
				normalMatrix.getNormalMatrix( object.matrixWorld );
	
				normals.length = 0;
				uvs.length = 0;
	
			}
	
			function projectVertex( vertex ) {
	
				var position = vertex.position;
				var positionWorld = vertex.positionWorld;
				var positionScreen = vertex.positionScreen;
	
				positionWorld.copy( position ).applyMatrix4( _modelMatrix );
				positionScreen.copy( positionWorld ).applyMatrix4( _viewProjectionMatrix );
	
				var invW = 1 / positionScreen.w;
	
				positionScreen.x *= invW;
				positionScreen.y *= invW;
				positionScreen.z *= invW;
	
				vertex.visible = positionScreen.x >= - 1 && positionScreen.x <= 1 &&
						 positionScreen.y >= - 1 && positionScreen.y <= 1 &&
						 positionScreen.z >= - 1 && positionScreen.z <= 1;
	
			}
	
			function pushVertex( x, y, z ) {
	
				_vertex = getNextVertexInPool();
				_vertex.position.set( x, y, z );
	
				projectVertex( _vertex );
	
			}
	
			function pushNormal( x, y, z ) {
	
				normals.push( x, y, z );
	
			}
	
			function pushUv( x, y ) {
	
				uvs.push( x, y );
	
			}
	
			function checkTriangleVisibility( v1, v2, v3 ) {
	
				if ( v1.visible === true || v2.visible === true || v3.visible === true ) return true;
	
				_points3[ 0 ] = v1.positionScreen;
				_points3[ 1 ] = v2.positionScreen;
				_points3[ 2 ] = v3.positionScreen;
	
				return _clipBox.intersectsBox( _boundingBox.setFromPoints( _points3 ) );
	
			}
	
			function checkBackfaceCulling( v1, v2, v3 ) {
	
				return ( ( v3.positionScreen.x - v1.positionScreen.x ) *
					    ( v2.positionScreen.y - v1.positionScreen.y ) -
					    ( v3.positionScreen.y - v1.positionScreen.y ) *
					    ( v2.positionScreen.x - v1.positionScreen.x ) ) < 0;
	
			}
	
			function pushLine( a, b ) {
	
				var v1 = _vertexPool[ a ];
				var v2 = _vertexPool[ b ];
	
				_line = getNextLineInPool();
	
				_line.id = object.id;
				_line.v1.copy( v1 );
				_line.v2.copy( v2 );
				_line.z = ( v1.positionScreen.z + v2.positionScreen.z ) / 2;
				_line.renderOrder = object.renderOrder;
	
				_line.material = object.material;
	
				_renderData.elements.push( _line );
	
			}
	
			function pushTriangle( a, b, c ) {
	
				var v1 = _vertexPool[ a ];
				var v2 = _vertexPool[ b ];
				var v3 = _vertexPool[ c ];
	
				if ( checkTriangleVisibility( v1, v2, v3 ) === false ) return;
	
				if ( material.side === THREE.DoubleSide || checkBackfaceCulling( v1, v2, v3 ) === true ) {
	
					_face = getNextFaceInPool();
	
					_face.id = object.id;
					_face.v1.copy( v1 );
					_face.v2.copy( v2 );
					_face.v3.copy( v3 );
					_face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
					_face.renderOrder = object.renderOrder;
	
					// use first vertex normal as face normal
	
					_face.normalModel.fromArray( normals, a * 3 );
					_face.normalModel.applyMatrix3( normalMatrix ).normalize();
	
					for ( var i = 0; i < 3; i ++ ) {
	
						var normal = _face.vertexNormalsModel[ i ];
						normal.fromArray( normals, arguments[ i ] * 3 );
						normal.applyMatrix3( normalMatrix ).normalize();
	
						var uv = _face.uvs[ i ];
						uv.fromArray( uvs, arguments[ i ] * 2 );
	
					}
	
					_face.vertexNormalsLength = 3;
	
					_face.material = object.material;
	
					_renderData.elements.push( _face );
	
				}
	
			}
	
			return {
				setObject: setObject,
				projectVertex: projectVertex,
				checkTriangleVisibility: checkTriangleVisibility,
				checkBackfaceCulling: checkBackfaceCulling,
				pushVertex: pushVertex,
				pushNormal: pushNormal,
				pushUv: pushUv,
				pushLine: pushLine,
				pushTriangle: pushTriangle
			}
	
		};
	
		var renderList = new RenderList();
	
		this.projectScene = function ( scene, camera, sortObjects, sortElements ) {
	
			_faceCount = 0;
			_lineCount = 0;
			_spriteCount = 0;
	
			_renderData.elements.length = 0;
	
			if ( scene.autoUpdate === true ) scene.updateMatrixWorld();
			if ( camera.parent === null ) camera.updateMatrixWorld();
	
			_viewMatrix.copy( camera.matrixWorldInverse.getInverse( camera.matrixWorld ) );
			_viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );
	
			_frustum.setFromMatrix( _viewProjectionMatrix );
	
			//
	
			_objectCount = 0;
	
			_renderData.objects.length = 0;
			_renderData.lights.length = 0;
	
			scene.traverseVisible( function ( object ) {
	
				if ( object instanceof THREE.Light ) {
	
					_renderData.lights.push( object );
	
				} else if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite ) {
	
					var material = object.material;
	
					if ( material.visible === false ) return;
	
					if ( object.frustumCulled === false || _frustum.intersectsObject( object ) === true ) {
	
						_object = getNextObjectInPool();
						_object.id = object.id;
						_object.object = object;
	
						_vector3.setFromMatrixPosition( object.matrixWorld );
						_vector3.applyProjection( _viewProjectionMatrix );
						_object.z = _vector3.z;
						_object.renderOrder = object.renderOrder;
	
						_renderData.objects.push( _object );
	
					}
	
				}
	
			} );
	
			if ( sortObjects === true ) {
	
				_renderData.objects.sort( painterSort );
	
			}
	
			//
	
			for ( var o = 0, ol = _renderData.objects.length; o < ol; o ++ ) {
	
				var object = _renderData.objects[ o ].object;
				var geometry = object.geometry;
	
				renderList.setObject( object );
	
				_modelMatrix = object.matrixWorld;
	
				_vertexCount = 0;
	
				if ( object instanceof THREE.Mesh ) {
	
					if ( geometry instanceof THREE.BufferGeometry ) {
	
						var attributes = geometry.attributes;
						var groups = geometry.groups;
	
						if ( attributes.position === undefined ) continue;
	
						var positions = attributes.position.array;
	
						for ( var i = 0, l = positions.length; i < l; i += 3 ) {
	
							renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );
	
						}
	
						if ( attributes.normal !== undefined ) {
	
							var normals = attributes.normal.array;
	
							for ( var i = 0, l = normals.length; i < l; i += 3 ) {
	
								renderList.pushNormal( normals[ i ], normals[ i + 1 ], normals[ i + 2 ] );
	
							}
	
						}
	
						if ( attributes.uv !== undefined ) {
	
							var uvs = attributes.uv.array;
	
							for ( var i = 0, l = uvs.length; i < l; i += 2 ) {
	
								renderList.pushUv( uvs[ i ], uvs[ i + 1 ] );
	
							}
	
						}
	
						if ( geometry.index !== null ) {
	
							var indices = geometry.index.array;
	
							if ( groups.length > 0 ) {
	
								for ( var o = 0; o < groups.length; o ++ ) {
	
									var group = groups[ o ];
	
									for ( var i = group.start, l = group.start + group.count; i < l; i += 3 ) {
	
										renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );
	
									}
	
								}
	
							} else {
	
								for ( var i = 0, l = indices.length; i < l; i += 3 ) {
	
									renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );
	
								}
	
							}
	
						} else {
	
							for ( var i = 0, l = positions.length / 3; i < l; i += 3 ) {
	
								renderList.pushTriangle( i, i + 1, i + 2 );
	
							}
	
						}
	
					} else if ( geometry instanceof THREE.Geometry ) {
	
						var vertices = geometry.vertices;
						var faces = geometry.faces;
						var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
	
						_normalMatrix.getNormalMatrix( _modelMatrix );
	
						var material = object.material;
	
						var isFaceMaterial = material instanceof THREE.MultiMaterial;
						var objectMaterials = isFaceMaterial === true ? object.material : null;
	
						for ( var v = 0, vl = vertices.length; v < vl; v ++ ) {
	
							var vertex = vertices[ v ];
	
							_vector3.copy( vertex );
	
							if ( material.morphTargets === true ) {
	
								var morphTargets = geometry.morphTargets;
								var morphInfluences = object.morphTargetInfluences;
	
								for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {
	
									var influence = morphInfluences[ t ];
	
									if ( influence === 0 ) continue;
	
									var target = morphTargets[ t ];
									var targetVertex = target.vertices[ v ];
	
									_vector3.x += ( targetVertex.x - vertex.x ) * influence;
									_vector3.y += ( targetVertex.y - vertex.y ) * influence;
									_vector3.z += ( targetVertex.z - vertex.z ) * influence;
	
								}
	
							}
	
							renderList.pushVertex( _vector3.x, _vector3.y, _vector3.z );
	
						}
	
						for ( var f = 0, fl = faces.length; f < fl; f ++ ) {
	
							var face = faces[ f ];
	
							material = isFaceMaterial === true
								 ? objectMaterials.materials[ face.materialIndex ]
								 : object.material;
	
							if ( material === undefined ) continue;
	
							var side = material.side;
	
							var v1 = _vertexPool[ face.a ];
							var v2 = _vertexPool[ face.b ];
							var v3 = _vertexPool[ face.c ];
	
							if ( renderList.checkTriangleVisibility( v1, v2, v3 ) === false ) continue;
	
							var visible = renderList.checkBackfaceCulling( v1, v2, v3 );
	
							if ( side !== THREE.DoubleSide ) {
	
								if ( side === THREE.FrontSide && visible === false ) continue;
								if ( side === THREE.BackSide && visible === true ) continue;
	
							}
	
							_face = getNextFaceInPool();
	
							_face.id = object.id;
							_face.v1.copy( v1 );
							_face.v2.copy( v2 );
							_face.v3.copy( v3 );
	
							_face.normalModel.copy( face.normal );
	
							if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {
	
								_face.normalModel.negate();
	
							}
	
							_face.normalModel.applyMatrix3( _normalMatrix ).normalize();
	
							var faceVertexNormals = face.vertexNormals;
	
							for ( var n = 0, nl = Math.min( faceVertexNormals.length, 3 ); n < nl; n ++ ) {
	
								var normalModel = _face.vertexNormalsModel[ n ];
								normalModel.copy( faceVertexNormals[ n ] );
	
								if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {
	
									normalModel.negate();
	
								}
	
								normalModel.applyMatrix3( _normalMatrix ).normalize();
	
							}
	
							_face.vertexNormalsLength = faceVertexNormals.length;
	
							var vertexUvs = faceVertexUvs[ f ];
	
							if ( vertexUvs !== undefined ) {
	
								for ( var u = 0; u < 3; u ++ ) {
	
									_face.uvs[ u ].copy( vertexUvs[ u ] );
	
								}
	
							}
	
							_face.color = face.color;
							_face.material = material;
	
							_face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
							_face.renderOrder = object.renderOrder;
	
							_renderData.elements.push( _face );
	
						}
	
					}
	
				} else if ( object instanceof THREE.Line ) {
	
					if ( geometry instanceof THREE.BufferGeometry ) {
	
						var attributes = geometry.attributes;
	
						if ( attributes.position !== undefined ) {
	
							var positions = attributes.position.array;
	
							for ( var i = 0, l = positions.length; i < l; i += 3 ) {
	
								renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );
	
							}
	
							if ( geometry.index !== null ) {
	
								var indices = geometry.index.array;
	
								for ( var i = 0, l = indices.length; i < l; i += 2 ) {
	
									renderList.pushLine( indices[ i ], indices[ i + 1 ] );
	
								}
	
							} else {
	
								var step = object instanceof THREE.LineSegments ? 2 : 1;
	
								for ( var i = 0, l = ( positions.length / 3 ) - 1; i < l; i += step ) {
	
									renderList.pushLine( i, i + 1 );
	
								}
	
							}
	
						}
	
					} else if ( geometry instanceof THREE.Geometry ) {
	
						_modelViewProjectionMatrix.multiplyMatrices( _viewProjectionMatrix, _modelMatrix );
	
						var vertices = object.geometry.vertices;
	
						if ( vertices.length === 0 ) continue;
	
						v1 = getNextVertexInPool();
						v1.positionScreen.copy( vertices[ 0 ] ).applyMatrix4( _modelViewProjectionMatrix );
	
						var step = object instanceof THREE.LineSegments ? 2 : 1;
	
						for ( var v = 1, vl = vertices.length; v < vl; v ++ ) {
	
							v1 = getNextVertexInPool();
							v1.positionScreen.copy( vertices[ v ] ).applyMatrix4( _modelViewProjectionMatrix );
	
							if ( ( v + 1 ) % step > 0 ) continue;
	
							v2 = _vertexPool[ _vertexCount - 2 ];
	
							_clippedVertex1PositionScreen.copy( v1.positionScreen );
							_clippedVertex2PositionScreen.copy( v2.positionScreen );
	
							if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) === true ) {
	
								// Perform the perspective divide
								_clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
								_clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );
	
								_line = getNextLineInPool();
	
								_line.id = object.id;
								_line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
								_line.v2.positionScreen.copy( _clippedVertex2PositionScreen );
	
								_line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );
								_line.renderOrder = object.renderOrder;
	
								_line.material = object.material;
	
								if ( object.material.vertexColors === THREE.VertexColors ) {
	
									_line.vertexColors[ 0 ].copy( object.geometry.colors[ v ] );
									_line.vertexColors[ 1 ].copy( object.geometry.colors[ v - 1 ] );
	
								}
	
								_renderData.elements.push( _line );
	
							}
	
						}
	
					}
	
				} else if ( object instanceof THREE.Sprite ) {
	
					_vector4.set( _modelMatrix.elements[ 12 ], _modelMatrix.elements[ 13 ], _modelMatrix.elements[ 14 ], 1 );
					_vector4.applyMatrix4( _viewProjectionMatrix );
	
					var invW = 1 / _vector4.w;
	
					_vector4.z *= invW;
	
					if ( _vector4.z >= - 1 && _vector4.z <= 1 ) {
	
						_sprite = getNextSpriteInPool();
						_sprite.id = object.id;
						_sprite.x = _vector4.x * invW;
						_sprite.y = _vector4.y * invW;
						_sprite.z = _vector4.z;
						_sprite.renderOrder = object.renderOrder;
						_sprite.object = object;
	
						_sprite.rotation = object.rotation;
	
						_sprite.scale.x = object.scale.x * Math.abs( _sprite.x - ( _vector4.x + camera.projectionMatrix.elements[ 0 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 12 ] ) );
						_sprite.scale.y = object.scale.y * Math.abs( _sprite.y - ( _vector4.y + camera.projectionMatrix.elements[ 5 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 13 ] ) );
	
						_sprite.material = object.material;
	
						_renderData.elements.push( _sprite );
	
					}
	
				}
	
			}
	
			if ( sortElements === true ) {
	
				_renderData.elements.sort( painterSort );
	
			}
	
			return _renderData;
	
		};
	
		// Pools
	
		function getNextObjectInPool() {
	
			if ( _objectCount === _objectPoolLength ) {
	
				var object = new THREE.RenderableObject();
				_objectPool.push( object );
				_objectPoolLength ++;
				_objectCount ++;
				return object;
	
			}
	
			return _objectPool[ _objectCount ++ ];
	
		}
	
		function getNextVertexInPool() {
	
			if ( _vertexCount === _vertexPoolLength ) {
	
				var vertex = new THREE.RenderableVertex();
				_vertexPool.push( vertex );
				_vertexPoolLength ++;
				_vertexCount ++;
				return vertex;
	
			}
	
			return _vertexPool[ _vertexCount ++ ];
	
		}
	
		function getNextFaceInPool() {
	
			if ( _faceCount === _facePoolLength ) {
	
				var face = new THREE.RenderableFace();
				_facePool.push( face );
				_facePoolLength ++;
				_faceCount ++;
				return face;
	
			}
	
			return _facePool[ _faceCount ++ ];
	
	
		}
	
		function getNextLineInPool() {
	
			if ( _lineCount === _linePoolLength ) {
	
				var line = new THREE.RenderableLine();
				_linePool.push( line );
				_linePoolLength ++;
				_lineCount ++;
				return line;
	
			}
	
			return _linePool[ _lineCount ++ ];
	
		}
	
		function getNextSpriteInPool() {
	
			if ( _spriteCount === _spritePoolLength ) {
	
				var sprite = new THREE.RenderableSprite();
				_spritePool.push( sprite );
				_spritePoolLength ++;
				_spriteCount ++;
				return sprite;
	
			}
	
			return _spritePool[ _spriteCount ++ ];
	
		}
	
		//
	
		function painterSort( a, b ) {
	
			if ( a.renderOrder !== b.renderOrder ) {
	
				return a.renderOrder - b.renderOrder;
	
			} else if ( a.z !== b.z ) {
	
				return b.z - a.z;
	
			} else if ( a.id !== b.id ) {
	
				return a.id - b.id;
	
			} else {
	
				return 0;
	
			}
	
		}
	
		function clipLine( s1, s2 ) {
	
			var alpha1 = 0, alpha2 = 1,
	
			// Calculate the boundary coordinate of each vertex for the near and far clip planes,
			// Z = -1 and Z = +1, respectively.
			bc1near =  s1.z + s1.w,
			bc2near =  s2.z + s2.w,
			bc1far =  - s1.z + s1.w,
			bc2far =  - s2.z + s2.w;
	
			if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {
	
				// Both vertices lie entirely within all clip planes.
				return true;
	
			} else if ( ( bc1near < 0 && bc2near < 0 ) || ( bc1far < 0 && bc2far < 0 ) ) {
	
				// Both vertices lie entirely outside one of the clip planes.
				return false;
	
			} else {
	
				// The line segment spans at least one clip plane.
	
				if ( bc1near < 0 ) {
	
					// v1 lies outside the near plane, v2 inside
					alpha1 = Math.max( alpha1, bc1near / ( bc1near - bc2near ) );
	
				} else if ( bc2near < 0 ) {
	
					// v2 lies outside the near plane, v1 inside
					alpha2 = Math.min( alpha2, bc1near / ( bc1near - bc2near ) );
	
				}
	
				if ( bc1far < 0 ) {
	
					// v1 lies outside the far plane, v2 inside
					alpha1 = Math.max( alpha1, bc1far / ( bc1far - bc2far ) );
	
				} else if ( bc2far < 0 ) {
	
					// v2 lies outside the far plane, v2 inside
					alpha2 = Math.min( alpha2, bc1far / ( bc1far - bc2far ) );
	
				}
	
				if ( alpha2 < alpha1 ) {
	
					// The line segment spans two boundaries, but is outside both of them.
					// (This can't happen when we're only clipping against just near/far but good
					//  to leave the check here for future usage if other clip planes are added.)
					return false;
	
				} else {
	
					// Update the s1 and s2 vertices to match the clipped line segment.
					s1.lerp( s2, alpha1 );
					s2.lerp( s1, 1 - alpha2 );
	
					return true;
	
				}
	
			}
	
		}
	
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */
	
	'use strict';
	
	var isObject = __webpack_require__(10);
	
	function isObjectObject(o) {
	  return isObject(o) === true
	    && Object.prototype.toString.call(o) === '[object Object]';
	}
	
	module.exports = function isPlainObject(o) {
	  var ctor,prot;
	  
	  if (isObjectObject(o) === false) return false;
	  
	  // If has modified constructor
	  ctor = o.constructor;
	  if (typeof ctor !== 'function') return false;
	  
	  // If has modified prototype
	  prot = ctor.prototype;
	  if (isObjectObject(prot) === false) return false;
	  
	  // If constructor does not have an Object-specific method
	  if (prot.hasOwnProperty('isPrototypeOf') === false) {
	    return false;
	  }
	  
	  // Most likely a plain Object
	  return true;
	};


/***/ },
/* 10 */
/***/ function(module, exports) {

	/*!
	 * isobject <https://github.com/jonschlinkert/isobject>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */
	
	'use strict';
	
	module.exports = function isObject(val) {
	  return val != null && typeof val === 'object'
	    && !Array.isArray(val);
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * EventEmitter2
	 * https://github.com/hij1nx/EventEmitter2
	 *
	 * Copyright (c) 2013 hij1nx
	 * Licensed under the MIT license.
	 */
	;!function(undefined) {
	
	  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
	    return Object.prototype.toString.call(obj) === "[object Array]";
	  };
	  var defaultMaxListeners = 10;
	
	  function init() {
	    this._events = {};
	    if (this._conf) {
	      configure.call(this, this._conf);
	    }
	  }
	
	  function configure(conf) {
	    if (conf) {
	
	      this._conf = conf;
	
	      conf.delimiter && (this.delimiter = conf.delimiter);
	      conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
	      conf.wildcard && (this.wildcard = conf.wildcard);
	      conf.newListener && (this.newListener = conf.newListener);
	
	      if (this.wildcard) {
	        this.listenerTree = {};
	      }
	    }
	  }
	
	  function EventEmitter(conf) {
	    this._events = {};
	    this.newListener = false;
	    configure.call(this, conf);
	  }
	
	  //
	  // Attention, function return type now is array, always !
	  // It has zero elements if no any matches found and one or more
	  // elements (leafs) if there are matches
	  //
	  function searchListenerTree(handlers, type, tree, i) {
	    if (!tree) {
	      return [];
	    }
	    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
	        typeLength = type.length, currentType = type[i], nextType = type[i+1];
	    if (i === typeLength && tree._listeners) {
	      //
	      // If at the end of the event(s) list and the tree has listeners
	      // invoke those listeners.
	      //
	      if (typeof tree._listeners === 'function') {
	        handlers && handlers.push(tree._listeners);
	        return [tree];
	      } else {
	        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
	          handlers && handlers.push(tree._listeners[leaf]);
	        }
	        return [tree];
	      }
	    }
	
	    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
	      //
	      // If the event emitted is '*' at this part
	      // or there is a concrete match at this patch
	      //
	      if (currentType === '*') {
	        for (branch in tree) {
	          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
	            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
	          }
	        }
	        return listeners;
	      } else if(currentType === '**') {
	        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
	        if(endReached && tree._listeners) {
	          // The next element has a _listeners, add it to the handlers.
	          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
	        }
	
	        for (branch in tree) {
	          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
	            if(branch === '*' || branch === '**') {
	              if(tree[branch]._listeners && !endReached) {
	                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
	              }
	              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
	            } else if(branch === nextType) {
	              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
	            } else {
	              // No match on this one, shift into the tree but not in the type array.
	              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
	            }
	          }
	        }
	        return listeners;
	      }
	
	      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
	    }
	
	    xTree = tree['*'];
	    if (xTree) {
	      //
	      // If the listener tree will allow any match for this part,
	      // then recursively explore all branches of the tree
	      //
	      searchListenerTree(handlers, type, xTree, i+1);
	    }
	
	    xxTree = tree['**'];
	    if(xxTree) {
	      if(i < typeLength) {
	        if(xxTree._listeners) {
	          // If we have a listener on a '**', it will catch all, so add its handler.
	          searchListenerTree(handlers, type, xxTree, typeLength);
	        }
	
	        // Build arrays of matching next branches and others.
	        for(branch in xxTree) {
	          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
	            if(branch === nextType) {
	              // We know the next element will match, so jump twice.
	              searchListenerTree(handlers, type, xxTree[branch], i+2);
	            } else if(branch === currentType) {
	              // Current node matches, move into the tree.
	              searchListenerTree(handlers, type, xxTree[branch], i+1);
	            } else {
	              isolatedBranch = {};
	              isolatedBranch[branch] = xxTree[branch];
	              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
	            }
	          }
	        }
	      } else if(xxTree._listeners) {
	        // We have reached the end and still on a '**'
	        searchListenerTree(handlers, type, xxTree, typeLength);
	      } else if(xxTree['*'] && xxTree['*']._listeners) {
	        searchListenerTree(handlers, type, xxTree['*'], typeLength);
	      }
	    }
	
	    return listeners;
	  }
	
	  function growListenerTree(type, listener) {
	
	    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	
	    //
	    // Looks for two consecutive '**', if so, don't add the event at all.
	    //
	    for(var i = 0, len = type.length; i+1 < len; i++) {
	      if(type[i] === '**' && type[i+1] === '**') {
	        return;
	      }
	    }
	
	    var tree = this.listenerTree;
	    var name = type.shift();
	
	    while (name) {
	
	      if (!tree[name]) {
	        tree[name] = {};
	      }
	
	      tree = tree[name];
	
	      if (type.length === 0) {
	
	        if (!tree._listeners) {
	          tree._listeners = listener;
	        }
	        else if(typeof tree._listeners === 'function') {
	          tree._listeners = [tree._listeners, listener];
	        }
	        else if (isArray(tree._listeners)) {
	
	          tree._listeners.push(listener);
	
	          if (!tree._listeners.warned) {
	
	            var m = defaultMaxListeners;
	
	            if (typeof this._events.maxListeners !== 'undefined') {
	              m = this._events.maxListeners;
	            }
	
	            if (m > 0 && tree._listeners.length > m) {
	
	              tree._listeners.warned = true;
	              console.error('(node) warning: possible EventEmitter memory ' +
	                            'leak detected. %d listeners added. ' +
	                            'Use emitter.setMaxListeners() to increase limit.',
	                            tree._listeners.length);
	              console.trace();
	            }
	          }
	        }
	        return true;
	      }
	      name = type.shift();
	    }
	    return true;
	  }
	
	  // By default EventEmitters will print a warning if more than
	  // 10 listeners are added to it. This is a useful default which
	  // helps finding memory leaks.
	  //
	  // Obviously not all Emitters should be limited to 10. This function allows
	  // that to be increased. Set to zero for unlimited.
	
	  EventEmitter.prototype.delimiter = '.';
	
	  EventEmitter.prototype.setMaxListeners = function(n) {
	    this._events || init.call(this);
	    this._events.maxListeners = n;
	    if (!this._conf) this._conf = {};
	    this._conf.maxListeners = n;
	  };
	
	  EventEmitter.prototype.event = '';
	
	  EventEmitter.prototype.once = function(event, fn) {
	    this.many(event, 1, fn);
	    return this;
	  };
	
	  EventEmitter.prototype.many = function(event, ttl, fn) {
	    var self = this;
	
	    if (typeof fn !== 'function') {
	      throw new Error('many only accepts instances of Function');
	    }
	
	    function listener() {
	      if (--ttl === 0) {
	        self.off(event, listener);
	      }
	      fn.apply(this, arguments);
	    }
	
	    listener._origin = fn;
	
	    this.on(event, listener);
	
	    return self;
	  };
	
	  EventEmitter.prototype.emit = function() {
	
	    this._events || init.call(this);
	
	    var type = arguments[0];
	
	    if (type === 'newListener' && !this.newListener) {
	      if (!this._events.newListener) { return false; }
	    }
	
	    // Loop through the *_all* functions and invoke them.
	    if (this._all) {
	      var l = arguments.length;
	      var args = new Array(l - 1);
	      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
	      for (i = 0, l = this._all.length; i < l; i++) {
	        this.event = type;
	        this._all[i].apply(this, args);
	      }
	    }
	
	    // If there is no 'error' event listener then throw.
	    if (type === 'error') {
	
	      if (!this._all &&
	        !this._events.error &&
	        !(this.wildcard && this.listenerTree.error)) {
	
	        if (arguments[1] instanceof Error) {
	          throw arguments[1]; // Unhandled 'error' event
	        } else {
	          throw new Error("Uncaught, unspecified 'error' event.");
	        }
	        return false;
	      }
	    }
	
	    var handler;
	
	    if(this.wildcard) {
	      handler = [];
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
	    }
	    else {
	      handler = this._events[type];
	    }
	
	    if (typeof handler === 'function') {
	      this.event = type;
	      if (arguments.length === 1) {
	        handler.call(this);
	      }
	      else if (arguments.length > 1)
	        switch (arguments.length) {
	          case 2:
	            handler.call(this, arguments[1]);
	            break;
	          case 3:
	            handler.call(this, arguments[1], arguments[2]);
	            break;
	          // slower
	          default:
	            var l = arguments.length;
	            var args = new Array(l - 1);
	            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
	            handler.apply(this, args);
	        }
	      return true;
	    }
	    else if (handler) {
	      var l = arguments.length;
	      var args = new Array(l - 1);
	      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
	
	      var listeners = handler.slice();
	      for (var i = 0, l = listeners.length; i < l; i++) {
	        this.event = type;
	        listeners[i].apply(this, args);
	      }
	      return (listeners.length > 0) || !!this._all;
	    }
	    else {
	      return !!this._all;
	    }
	
	  };
	
	  EventEmitter.prototype.on = function(type, listener) {
	
	    if (typeof type === 'function') {
	      this.onAny(type);
	      return this;
	    }
	
	    if (typeof listener !== 'function') {
	      throw new Error('on only accepts instances of Function');
	    }
	    this._events || init.call(this);
	
	    // To avoid recursion in the case that type == "newListeners"! Before
	    // adding it to the listeners, first emit "newListeners".
	    this.emit('newListener', type, listener);
	
	    if(this.wildcard) {
	      growListenerTree.call(this, type, listener);
	      return this;
	    }
	
	    if (!this._events[type]) {
	      // Optimize the case of one listener. Don't need the extra array object.
	      this._events[type] = listener;
	    }
	    else if(typeof this._events[type] === 'function') {
	      // Adding the second element, need to change to array.
	      this._events[type] = [this._events[type], listener];
	    }
	    else if (isArray(this._events[type])) {
	      // If we've already got an array, just append.
	      this._events[type].push(listener);
	
	      // Check for listener leak
	      if (!this._events[type].warned) {
	
	        var m = defaultMaxListeners;
	
	        if (typeof this._events.maxListeners !== 'undefined') {
	          m = this._events.maxListeners;
	        }
	
	        if (m > 0 && this._events[type].length > m) {
	
	          this._events[type].warned = true;
	          console.error('(node) warning: possible EventEmitter memory ' +
	                        'leak detected. %d listeners added. ' +
	                        'Use emitter.setMaxListeners() to increase limit.',
	                        this._events[type].length);
	          console.trace();
	        }
	      }
	    }
	    return this;
	  };
	
	  EventEmitter.prototype.onAny = function(fn) {
	
	    if (typeof fn !== 'function') {
	      throw new Error('onAny only accepts instances of Function');
	    }
	
	    if(!this._all) {
	      this._all = [];
	    }
	
	    // Add the function to the event listener collection.
	    this._all.push(fn);
	    return this;
	  };
	
	  EventEmitter.prototype.addListener = EventEmitter.prototype.on;
	
	  EventEmitter.prototype.off = function(type, listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('removeListener only takes instances of Function');
	    }
	
	    var handlers,leafs=[];
	
	    if(this.wildcard) {
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
	    }
	    else {
	      // does not use listeners(), so no side effect of creating _events[type]
	      if (!this._events[type]) return this;
	      handlers = this._events[type];
	      leafs.push({_listeners:handlers});
	    }
	
	    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
	      var leaf = leafs[iLeaf];
	      handlers = leaf._listeners;
	      if (isArray(handlers)) {
	
	        var position = -1;
	
	        for (var i = 0, length = handlers.length; i < length; i++) {
	          if (handlers[i] === listener ||
	            (handlers[i].listener && handlers[i].listener === listener) ||
	            (handlers[i]._origin && handlers[i]._origin === listener)) {
	            position = i;
	            break;
	          }
	        }
	
	        if (position < 0) {
	          continue;
	        }
	
	        if(this.wildcard) {
	          leaf._listeners.splice(position, 1);
	        }
	        else {
	          this._events[type].splice(position, 1);
	        }
	
	        if (handlers.length === 0) {
	          if(this.wildcard) {
	            delete leaf._listeners;
	          }
	          else {
	            delete this._events[type];
	          }
	        }
	        return this;
	      }
	      else if (handlers === listener ||
	        (handlers.listener && handlers.listener === listener) ||
	        (handlers._origin && handlers._origin === listener)) {
	        if(this.wildcard) {
	          delete leaf._listeners;
	        }
	        else {
	          delete this._events[type];
	        }
	      }
	    }
	
	    return this;
	  };
	
	  EventEmitter.prototype.offAny = function(fn) {
	    var i = 0, l = 0, fns;
	    if (fn && this._all && this._all.length > 0) {
	      fns = this._all;
	      for(i = 0, l = fns.length; i < l; i++) {
	        if(fn === fns[i]) {
	          fns.splice(i, 1);
	          return this;
	        }
	      }
	    } else {
	      this._all = [];
	    }
	    return this;
	  };
	
	  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
	
	  EventEmitter.prototype.removeAllListeners = function(type) {
	    if (arguments.length === 0) {
	      !this._events || init.call(this);
	      return this;
	    }
	
	    if(this.wildcard) {
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
	
	      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
	        var leaf = leafs[iLeaf];
	        leaf._listeners = null;
	      }
	    }
	    else {
	      if (!this._events[type]) return this;
	      this._events[type] = null;
	    }
	    return this;
	  };
	
	  EventEmitter.prototype.listeners = function(type) {
	    if(this.wildcard) {
	      var handlers = [];
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
	      return handlers;
	    }
	
	    this._events || init.call(this);
	
	    if (!this._events[type]) this._events[type] = [];
	    if (!isArray(this._events[type])) {
	      this._events[type] = [this._events[type]];
	    }
	    return this._events[type];
	  };
	
	  EventEmitter.prototype.listenersAny = function() {
	
	    if(this._all) {
	      return this._all;
	    }
	    else {
	      return [];
	    }
	
	  };
	
	  if (true) {
	     // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return EventEmitter;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
	    // CommonJS
	    exports.EventEmitter2 = EventEmitter;
	  }
	  else {
	    // Browser global.
	    window.EventEmitter2 = EventEmitter;
	  }
	}();


/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = {Promise: window['Promise']}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var deps_1 = __webpack_require__(3);
	var Utils_1 = __webpack_require__(14);
	var Vector3 = THREE.Vector3;
	var Widget_1 = __webpack_require__(15);
	var Trends_1 = __webpack_require__(16);
	var Screen_1 = __webpack_require__(20);
	var AxisMarks_1 = __webpack_require__(21);
	var interfaces_1 = __webpack_require__(22);
	var Chart_1 = __webpack_require__(2);
	var deps_2 = __webpack_require__(3);
	/**
	 *  class for manage chart state, all state changes caused only by State.setState method
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
	                zoomEase: Linear.easeNone,
	                scrollSpeed: 0.5,
	                scrollEase: Linear.easeNone,
	                autoScrollSpeed: 1,
	                autoScrollEase: Linear.easeNone,
	            },
	            autoRender: { enabled: true, fps: 0 },
	            renderer: 'WebGLRenderer',
	            autoScroll: true,
	            controls: { enabled: true },
	            cursor: {
	                dragMode: false,
	                x: 0,
	                y: 0
	            },
	            backgroundColor: 0x000000,
	            backgroundOpacity: 1,
	            showStats: false
	        };
	        this.ee = new deps_1.EventEmitter();
	        this.ee.setMaxListeners(15);
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
	        this.screen = new Screen_1.Screen(this);
	        this.xAxisMarks = new AxisMarks_1.AxisMarks(this, interfaces_1.AXIS_TYPE.X);
	        this.yAxisMarks = new AxisMarks_1.AxisMarks(this, interfaces_1.AXIS_TYPE.Y);
	        this.initListeners();
	        // message to other modules that ChartState.data is ready for use 
	        this.ee.emit('initialStateApplied', initialState);
	        // message to other modules that ChartState is ready for use 
	        this.ee.emit('ready', initialState);
	    }
	    /**
	     * destroy state, use Chart.destroy to completely destroy chart
	     */
	    ChartState.prototype.destroy = function () {
	        this.ee.emit('destroy');
	        this.ee.removeAllListeners();
	        this.data = {};
	    };
	    ChartState.prototype.onDestroy = function (cb) {
	        var _this = this;
	        var eventName = 'destroy';
	        this.ee.on(eventName, cb);
	        return function () {
	            _this.ee.off(eventName, cb);
	        };
	    };
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
	        var _this = this;
	        var eventName = 'change';
	        this.ee.on(eventName, cb);
	        return function () {
	            _this.ee.off(eventName, cb);
	        };
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
	        // temporary remove trends data from newState by performance reasons
	        var trendsData = {};
	        if (newState.trends)
	            for (var trendName in newState.trends) {
	                var trendOptions = newState.trends[trendName];
	                if (trendOptions.data)
	                    trendsData[trendName] = trendOptions.data;
	                delete trendOptions.data;
	            }
	        var newStateContainsData = Object.keys(trendsData).length > 0;
	        this.data = Utils_1.Utils.deepMerge(this.data, newState, false);
	        // return data to state
	        if (newStateContainsData)
	            for (var trendName in trendsData) {
	                this.data.trends[trendName].data = trendsData[trendName];
	            }
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
	        var isMouseDrag = cursorOptions && data.cursor.dragMode && data.prevState.cursor.dragMode;
	        if (isMouseDrag) {
	            var oldX = data.prevState.cursor.x;
	            var currentX = cursorOptions.x;
	            var currentScroll = data.xAxis.range.scroll;
	            var deltaXVal = this.pxToValueByXAxis(oldX - currentX);
	            patch.xAxis = { range: { scroll: currentScroll + deltaXVal } };
	            actualData = Utils_1.Utils.deepMerge(actualData, { xAxis: patch.xAxis });
	        }
	        var scrollXChanged = false;
	        var needToRecalculateXAxis = (isMouseDrag ||
	            (changedProps.xAxis && (changedProps.xAxis.range)) ||
	            this.data.xAxis.range.zeroVal == void 0);
	        if (needToRecalculateXAxis) {
	            var xAxisPatch = this.recalculateXAxis(actualData, changedProps);
	            if (xAxisPatch) {
	                scrollXChanged = true;
	                patch = Utils_1.Utils.deepMerge(patch, { xAxis: xAxisPatch });
	                actualData = Utils_1.Utils.deepMerge(actualData, { xAxis: xAxisPatch });
	            }
	        }
	        // recalculate axis "from" and "to" for dynamics AXIS_RANGE_TYPE
	        var needToRecalculateYAxis = ((data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.RELATIVE_END ||
	            data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.AUTO ||
	            data.yAxis.range.isMirrorMode) &&
	            (scrollXChanged || changedProps.trends || changedProps.yAxis) ||
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
	    ChartState.prototype.recalculateXAxis = function (actualData, changedProps) {
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
	            // recalculate range.zoom and range.scroll then range.from or range.to was changed
	            if (changedProps.xAxis &&
	                (changedProps.xAxis.range.from != void 0 || changedProps.xAxis.range.to)) {
	                if (changedProps.xAxis.range.zoom) {
	                    Utils_1.Utils.error('Impossible to change "range.zoom" then "range.from" or "range.to" present');
	                }
	                var currentScaleFactor = actualData.width / (axisRange.to - axisRange.from);
	                patch.range.scroll = axisRange.from - zeroVal;
	                patch.range.zoom = currentScaleFactor / scaleFactor;
	                return patch;
	            }
	        }
	        // recalculate range.from and range.to then range.zoom or range.scroll was changed
	        do {
	            var from = zeroVal + axisRange.scroll;
	            var to = from + actualData.width / (scaleFactor * zoom);
	            var rangeLength = to - from;
	            var needToRecalculateZoom = false;
	            var rangeMoreThenMaxValue = (axisRange.maxLength && rangeLength > axisRange.maxLength);
	            var rangeLessThenMinValue = (axisRange.minLength && rangeLength < axisRange.minLength);
	            if (rangeMoreThenMaxValue || rangeLessThenMinValue) {
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
	        var isInitialize = yAxisRange.scaleFactor == void 0;
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
	        if (yAxisRange.isMirrorMode) {
	            if (yAxisRange.zeroVal == void 0)
	                Utils_1.Utils.error('range.zeroVal must be set when range.isMirrorMode');
	            var distanceFromZeroValForMaxY = Math.abs(yAxisRange.zeroVal - maxY);
	            var distanceFromZeroValForMinY = Math.abs(yAxisRange.zeroVal - minY);
	            var maxDistanceFromZeroVal = Math.max(distanceFromZeroValForMaxY, distanceFromZeroValForMinY);
	            maxY = yAxisRange.zeroVal + maxDistanceFromZeroVal;
	            minY = yAxisRange.zeroVal - maxDistanceFromZeroVal;
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
	            zeroVal = yAxisRange.zeroVal != void 0 ? yAxisRange.zeroVal : fromVal;
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
	    ChartState.prototype.zoom = function (zoomValue, origin) {
	        var _this = this;
	        if (origin === void 0) { origin = 0.5; }
	        var _a = this.data.xAxis.range, zoom = _a.zoom, scroll = _a.scroll, scaleFactor = _a.scaleFactor;
	        var newZoom = zoom * zoomValue;
	        var currentRange = this.data.width / (scaleFactor * zoom);
	        var nextRange = this.data.width / (scaleFactor * newZoom);
	        var newScroll = scroll + (currentRange - nextRange) * origin;
	        this.setState({ xAxis: { range: { zoom: newZoom, scroll: newScroll } } });
	        return new deps_2.Promise(function (resolve) {
	            var animationTime = _this.data.animations.enabled ? _this.data.animations.zoomSpeed : 0;
	            setTimeout(resolve, animationTime * 1000);
	        });
	    };
	    ChartState.prototype.zoomToRange = function (range, origin) {
	        var _a = this.data.xAxis.range, scaleFactor = _a.scaleFactor, zoom = _a.zoom;
	        var currentRange = this.data.width / (scaleFactor * zoom);
	        return this.zoom(currentRange / range, origin);
	    };
	    ChartState.prototype.scrollToEnd = function () {
	        var _this = this;
	        var state = this.data;
	        var endXVal = this.trends.getEndXVal();
	        var range = state.xAxis.range;
	        var scroll = endXVal - this.pxToValueByXAxis(state.width) + this.pxToValueByXAxis(range.padding.end) - range.zeroVal;
	        this.setState({ xAxis: { range: { scroll: scroll } } });
	        return new deps_2.Promise(function (resolve) {
	            var animationTime = _this.data.animations.enabled ? _this.data.animations.scrollSpeed : 0;
	            setTimeout(resolve, animationTime * 1000);
	        });
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var deps_1 = __webpack_require__(3);
	function deepmerge(target, src, mergeArrays) {
	    if (mergeArrays === void 0) { mergeArrays = true; }
	    var array = Array.isArray(src);
	    var dst = array && [] || {};
	    if (array) {
	        target = target || [];
	        if (mergeArrays) {
	            dst = dst.concat(target);
	        }
	        src.forEach(function (e, i) {
	            if (typeof dst[i] === 'undefined') {
	                dst[i] = e;
	            }
	            else if (typeof e === 'object') {
	                dst[i] = deepmerge(target[i], e, mergeArrays);
	            }
	            else {
	                if (target.indexOf(e) === -1) {
	                    dst.push(e);
	                }
	            }
	        });
	    }
	    else {
	        if (target && typeof target === 'object') {
	            Object.keys(target).forEach(function (key) {
	                dst[key] = target[key];
	            });
	        }
	        Object.keys(src).forEach(function (key) {
	            if (typeof src[key] !== 'object' || !src[key]) {
	                dst[key] = src[key];
	            }
	            else {
	                if (!target[key]) {
	                    dst[key] = src[key];
	                }
	                else {
	                    dst[key] = deepmerge(target[key], src[key], mergeArrays);
	                }
	            }
	        });
	    }
	    return dst;
	}
	/**
	 * project utils static class
	 */
	var Utils = (function () {
	    function Utils() {
	    }
	    /**
	     * deepMerge based on https://www.npmjs.com/package/deepmerge
	     */
	    Utils.deepMerge = function (obj1, obj2, mergeArrays) {
	        return deepmerge(obj1, obj2, mergeArrays);
	    };
	    /**
	     * deepCopy based on JSON.stringify function
	     * @deprecated
	     */
	    Utils.deepCopy = function (obj) {
	        // TODO: use deepMerge function to copy
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
	        // texture.magFilter = THREE.NearestFilter;
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
	    // static eq(num1: number, num2: number) {
	    // 	return Math.abs(num1 - num2) < 0.01
	    // }
	    //
	    // static gte(num1: number, num2: number) {
	    // 	return this.eq(num1, num2) || num1 > num2;
	    // }
	    //
	    // static lte(num1: number, num2: number) {
	    // 	return this.eq(num1, num2) || num1 < num2;
	    // }
	    Utils.binarySearchClosestInd = function (arr, num, key) {
	        var mid;
	        var lo = 0;
	        var hi = arr.length - 1;
	        while (hi - lo > 1) {
	            mid = Math.floor((lo + hi) / 2);
	            if (arr[mid][key] < num) {
	                lo = mid;
	            }
	            else {
	                hi = mid;
	            }
	        }
	        if (num - arr[lo][key] <= arr[hi][key] - num) {
	            return lo;
	        }
	        return hi;
	    };
	    Utils.binarySearchClosest = function (arr, num, key) {
	        var ind = this.binarySearchClosestInd(arr, num, key);
	        return arr[ind];
	    };
	    Utils.rectsIntersect = function (r1, r2) {
	        var left1 = r1[0], top1 = r1[1], width1 = r1[2], height1 = r1[3];
	        var left2 = r2[0], top2 = r2[1], width2 = r2[2], height2 = r2[3];
	        var _a = [left1 + width1, left2 + width2, top1 + height1, top2 + height2], right1 = _a[0], right2 = _a[1], bottom1 = _a[2], bottom2 = _a[3];
	        return !(left2 > right1 ||
	            right2 < left1 ||
	            top2 > bottom1 ||
	            bottom2 < top1);
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


/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * base class for all widgets
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Trend_1 = __webpack_require__(17);
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
	            // TODO: refactor this shit
	            // if (!trend.segments) {
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Utils_1 = __webpack_require__(14);
	var TrendMarks_1 = __webpack_require__(18);
	var TrendSegments_1 = __webpack_require__(19);
	var deps_1 = __webpack_require__(3);
	(function (TREND_TYPE) {
	    TREND_TYPE[TREND_TYPE["LINE"] = 0] = "LINE";
	    TREND_TYPE[TREND_TYPE["CANDLE"] = 1] = "CANDLE";
	})(exports.TREND_TYPE || (exports.TREND_TYPE = {}));
	var TREND_TYPE = exports.TREND_TYPE;
	var DEFAULT_OPTIONS = {
	    enabled: true,
	    type: TREND_TYPE.LINE,
	    data: [],
	    marks: [],
	    maxSegmentLength: 1000,
	    lineWidth: 2,
	    lineColor: 0xFFFFFF,
	    hasGradient: true,
	    hasBeacon: false,
	    settingsForTypes: {
	        CANDLE: {
	            minSegmentLengthInPx: 20,
	            maxSegmentLengthInPx: 40,
	        },
	        LINE: {
	            minSegmentLengthInPx: 2,
	            maxSegmentLengthInPx: 10,
	        }
	    }
	};
	var Trend = (function () {
	    function Trend(chartState, trendName, initialState) {
	        this.minXVal = Infinity;
	        this.minYVal = Infinity;
	        this.maxXVal = -Infinity;
	        this.maxYVal = -Infinity;
	        var options = initialState.trends[trendName];
	        this.name = trendName;
	        this.chartState = chartState;
	        this.calculatedOptions = Utils_1.Utils.deepMerge(DEFAULT_OPTIONS, options);
	        this.calculatedOptions.name = trendName;
	        if (options.dataset)
	            this.calculatedOptions.data = Trend.prepareData(options.dataset);
	        this.calculatedOptions.dataset = [];
	        this.ee = new deps_1.EventEmitter();
	        this.canRequestPrepend = options.canRequestPrepend != void 0 ? options.canRequestPrepend : !!options.onPrependRequest;
	        this.bindEvents();
	    }
	    Trend.prototype.onInitialStateApplied = function () {
	        this.segments = new TrendSegments_1.TrendSegments(this.chartState, this);
	        this.marks = new TrendMarks_1.TrendMarks(this.chartState, this);
	    };
	    Trend.prototype.bindEvents = function () {
	        var _this = this;
	        var chartState = this.chartState;
	        chartState.onInitialStateApplied(function () { return _this.onInitialStateApplied(); });
	        chartState.onScrollStop(function () { return _this.checkForPrependRequest(); });
	        chartState.onZoom(function () { return _this.checkForPrependRequest(); });
	        chartState.onTrendChange(function (trendName, changedOptions, newData) { return _this.ee.emit('change', changedOptions, newData); });
	        chartState.onDestroy(function () { return _this.ee.removeAllListeners(); });
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
	        for (var _i = 0, newData_1 = newData; _i < newData_1.length; _i++) {
	            var item = newData_1[_i];
	            if (item.xVal < this.minXVal)
	                this.minXVal = item.xVal;
	            if (item.xVal > this.maxXVal)
	                this.maxXVal = item.xVal;
	            if (item.yVal < this.minYVal)
	                this.minYVal = item.yVal;
	            if (item.yVal > this.maxYVal)
	                this.maxYVal = item.yVal;
	        }
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
	    Trend.prototype.setOptions = function (options) {
	        this.chartState.setState({ trends: (_a = {}, _a[this.name] = options, _a) });
	        var _a;
	    };
	    Trend.prototype.onPrependRequest = function (cb) {
	        var _this = this;
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
	            if (newData)
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
	        this.prependRequest = new deps_1.Promise(function (resolve, reject) {
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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Utils_1 = __webpack_require__(14);
	var Trend_1 = __webpack_require__(17);
	var deps_1 = __webpack_require__(3);
	(function (TREND_MARK_SIDE) {
	    TREND_MARK_SIDE[TREND_MARK_SIDE["TOP"] = 0] = "TOP";
	    TREND_MARK_SIDE[TREND_MARK_SIDE["BOTTOM"] = 1] = "BOTTOM";
	})(exports.TREND_MARK_SIDE || (exports.TREND_MARK_SIDE = {}));
	var TREND_MARK_SIDE = exports.TREND_MARK_SIDE;
	(function (EVENTS) {
	    EVENTS[EVENTS["CHANGE"] = 0] = "CHANGE";
	})(exports.EVENTS || (exports.EVENTS = {}));
	var EVENTS = exports.EVENTS;
	var AXIS_MARK_DEFAULT_OPTIONS = {
	    title: '',
	    description: '',
	    descriptionColor: 'rgb(40,136,75)',
	    value: 0,
	    iconColor: 'rgb(255, 102, 217)',
	    orientation: TREND_MARK_SIDE.TOP,
	    width: 65,
	    height: 80,
	    offset: 40,
	    margin: 20
	};
	var TrendMarks = (function () {
	    function TrendMarks(chartState, trend) {
	        this.items = {};
	        this.rects = {};
	        this.chartState = chartState;
	        this.ee = new deps_1.EventEmitter();
	        this.trend = trend;
	        this.onMarksChange();
	        this.bindEvents();
	    }
	    TrendMarks.prototype.bindEvents = function () {
	        var _this = this;
	        this.trend.segments.onRebuild(function () { return _this.updateMarksSegments(); });
	        this.trend.onChange(function (changedOptions) { return _this.onTrendChange(changedOptions); });
	        this.chartState.screen.onZoomFrame(function () { return _this.calclulateMarksPositions(); });
	        this.chartState.onDestroy(function () { return _this.ee.removeAllListeners(); });
	    };
	    TrendMarks.prototype.onTrendChange = function (changedOptions) {
	        if (!changedOptions.marks)
	            return;
	        this.onMarksChange();
	        this.ee.emit(EVENTS[EVENTS.CHANGE]);
	    };
	    TrendMarks.prototype.onChange = function (cb) {
	        var _this = this;
	        var eventName = EVENTS[EVENTS.CHANGE];
	        this.ee.on(eventName, cb);
	        return function () {
	            _this.ee.off(eventName, cb);
	        };
	    };
	    TrendMarks.prototype.updateMarksSegments = function () {
	        var marks = this.items;
	        var marksArr = [];
	        var xVals = [];
	        for (var markName in marks) {
	            var mark = marks[markName];
	            xVals.push(mark.options.value);
	            marksArr.push(mark);
	            mark._setSegment(null);
	        }
	        marksArr.sort(function (a, b) { return a.options.value - b.options.value; });
	        var points = this.trend.segments.getSegmentsForXValues(xVals.sort(function (a, b) { return a - b; }));
	        for (var markInd = 0; markInd < marksArr.length; markInd++) {
	            marksArr[markInd]._setSegment(points[markInd]);
	        }
	        this.calclulateMarksPositions();
	    };
	    TrendMarks.prototype.onMarksChange = function () {
	        var trendsMarksOptions = this.trend.getOptions().marks;
	        var actualMarksNames = [];
	        for (var _i = 0, trendsMarksOptions_1 = trendsMarksOptions; _i < trendsMarksOptions_1.length; _i++) {
	            var options = trendsMarksOptions_1[_i];
	            var marks = this.items;
	            // set mark name
	            if (!options.name) {
	                options.name = Utils_1.Utils.getUid().toString();
	                actualMarksNames.push(options.name);
	                if (marks[options.name])
	                    Utils_1.Utils.error('duplicated mark name ' + options.name);
	            }
	            else if (marks[options.name]) {
	                actualMarksNames.push(options.name);
	                continue;
	            }
	            options = Utils_1.Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
	            var mark = new TrendMark(this.chartState, options, this.trend);
	            marks[options.name] = mark;
	        }
	        // delete not relevant marks
	        for (var markName in this.items) {
	            if (actualMarksNames.indexOf(markName) != -1)
	                continue;
	            delete this.items[markName];
	        }
	        this.updateMarksSegments();
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
	    TrendMarks.prototype.calclulateMarksPositions = function () {
	        this.rects = {};
	        for (var markName in this.items) {
	            this.createMarkRect(this.items[markName]);
	        }
	    };
	    TrendMarks.prototype.createMarkRect = function (mark) {
	        if (!mark.segment)
	            return;
	        var state = this.chartState;
	        var options = mark.options;
	        var width = options.width, height = options.height, offset = options.offset, name = options.name;
	        var left = state.getPointOnXAxis(mark.xVal) - width / 2;
	        var top = state.getPointOnYAxis(mark.yVal);
	        var isTopSideMark = options.orientation == TREND_MARK_SIDE.TOP;
	        var newOffset;
	        var row = 0;
	        if (isTopSideMark) {
	            top += offset + height;
	        }
	        else {
	            top -= offset;
	        }
	        var markRect = [left, top, width, height];
	        var hasIntersection = false;
	        do {
	            for (var markName in this.rects) {
	                var rect = this.rects[markName];
	                hasIntersection = Utils_1.Utils.rectsIntersect(rect, markRect);
	                if (!hasIntersection)
	                    continue;
	                if (isTopSideMark) {
	                    markRect[1] = rect[1] + markRect[3] + options.margin;
	                }
	                else {
	                    markRect[1] = rect[1] - rect[3] - options.margin;
	                }
	                row++;
	                break;
	            }
	        } while (hasIntersection);
	        if (isTopSideMark) {
	            newOffset = markRect[1] - markRect[3] - state.getPointOnYAxis(mark.yVal);
	        }
	        else {
	            newOffset = state.getPointOnYAxis(mark.yVal) - markRect[1];
	        }
	        mark._setOffset(newOffset);
	        mark._setRow(row);
	        this.rects[name] = markRect;
	    };
	    return TrendMarks;
	}());
	exports.TrendMarks = TrendMarks;
	var TrendMark = (function () {
	    function TrendMark(chartState, options, trend) {
	        this.row = 0;
	        this.options = options;
	        this.chartState = chartState;
	        this.trend = trend;
	    }
	    /**
	     * only for internal usage
	     */
	    TrendMark.prototype._setSegment = function (segment) {
	        this.segment = segment;
	        if (!segment)
	            return;
	        if (this.trend.getOptions().type == Trend_1.TREND_TYPE.LINE) {
	            this.xVal = segment.endXVal;
	            this.yVal = segment.endYVal;
	        }
	        else if (this.options.orientation == TREND_MARK_SIDE.TOP) {
	            this.xVal = segment.xVal;
	            this.yVal = segment.maxYVal;
	        }
	        else {
	            this.xVal = segment.xVal;
	            this.yVal = segment.minYVal;
	        }
	    };
	    TrendMark.prototype._setOffset = function (offset) {
	        this.offset = offset;
	    };
	    TrendMark.prototype._setRow = function (row) {
	        this.row = row;
	    };
	    return TrendMark;
	}());
	exports.TrendMark = TrendMark;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var deps_1 = __webpack_require__(3);
	var Vector3 = THREE.Vector3;
	var Trend_1 = __webpack_require__(17);
	var Utils_1 = __webpack_require__(14);
	var MAX_ANIMATED_SEGMENTS = 100;
	/**
	 *  Class helps to display and animate trends segments
	 */
	var TrendSegments = (function () {
	    function TrendSegments(chartState, trend) {
	        this.segmentsById = {};
	        this.segments = [];
	        this.animatedSegmentsIds = [];
	        this.segmentsLength = 0;
	        this.animatedSegmentsForAppend = [];
	        this.animatedSegmentsForPrepend = [];
	        this.nextEmptyId = 0;
	        this.startSegmentId = 0;
	        this.endSegmentId = 0;
	        this.chartState = chartState;
	        this.ee = new deps_1.EventEmitter();
	        this.trend = trend;
	        this.maxSegmentLength = trend.getOptions().maxSegmentLength;
	        this.tryToRebuildSegments();
	        this.bindEvents();
	    }
	    TrendSegments.prototype.bindEvents = function () {
	        var _this = this;
	        this.trend.onChange(function (changedOptions, newData) { return _this.onTrendChangeHandler(changedOptions, newData); });
	        this.chartState.onZoom(function () { return _this.onZoomHandler(); });
	        this.chartState.onScroll(function () { return _this.recalculateDisplayedRange(); });
	        this.chartState.onDestroy(function () { return _this.onDestroyHandler(); });
	    };
	    TrendSegments.prototype.onDestroyHandler = function () {
	        this.ee.removeAllListeners();
	        this.appendAnimation && this.appendAnimation.kill();
	        this.prependAnimation && this.prependAnimation.kill();
	    };
	    TrendSegments.prototype.onZoomHandler = function () {
	        var segmentsRebuilded = this.tryToRebuildSegments();
	        if (!segmentsRebuilded) {
	            this.recalculateDisplayedRange();
	        }
	    };
	    TrendSegments.prototype.onTrendChangeHandler = function (changedOptions, newData) {
	        var needToRebuildSegments = (changedOptions.type != void 0 ||
	            changedOptions.maxSegmentLength != void 0);
	        if (needToRebuildSegments) {
	            this.tryToRebuildSegments(true);
	            return;
	        }
	        if (!newData)
	            return;
	        var data = this.trend.getData();
	        var isAppend = (!data.length || data[0].xVal < newData[0].xVal);
	        isAppend ? this.appendData(newData) : this.prependData(newData);
	        this.recalculateDisplayedRange();
	    };
	    TrendSegments.prototype.getEndSegment = function () {
	        return this.segmentsById[this.endSegmentId];
	    };
	    TrendSegments.prototype.getStartSegment = function () {
	        return this.segmentsById[this.startSegmentId];
	    };
	    TrendSegments.prototype.tryToRebuildSegments = function (force) {
	        if (force === void 0) { force = false; }
	        var options = this.trend.getOptions();
	        var trendTypeName = Trend_1.TREND_TYPE[options.type];
	        var trendTypesSettings = options.settingsForTypes;
	        var trendTypeSettings = trendTypesSettings[trendTypeName];
	        var minSegmentLengthInPx = trendTypeSettings.minSegmentLengthInPx, maxSegmentLengthInPx = trendTypeSettings.maxSegmentLengthInPx;
	        var needToRebuild = this.segments.length === 0 || force;
	        var segmentLength = this.maxSegmentLength;
	        // call toFixed(2) to prevent floating segment error compare
	        var currentSegmentLengthInPx = Number(this.chartState.valueToPxByXAxis(segmentLength).toFixed(2));
	        var currentMaxSegmentLengthInPx = Number(this.chartState.valueToPxByXAxis(this.maxSegmentLength).toFixed(2));
	        if (currentSegmentLengthInPx < minSegmentLengthInPx) {
	            needToRebuild = true;
	            segmentLength = Math.ceil(this.chartState.pxToValueByXAxis(maxSegmentLengthInPx));
	        }
	        else if (currentMaxSegmentLengthInPx > maxSegmentLengthInPx) {
	            needToRebuild = true;
	            segmentLength = this.chartState.pxToValueByXAxis(minSegmentLengthInPx);
	        }
	        if (!needToRebuild)
	            return false;
	        this.maxSegmentLength = segmentLength;
	        this.segmentsById = {};
	        this.segments = [];
	        this.nextEmptyId = 0;
	        this.startSegmentId = 0;
	        this.endSegmentId = 0;
	        this.segmentsLength = 0;
	        this.stopAllAnimations();
	        this.appendData(null, true);
	        this.recalculateDisplayedRange(true);
	        this.ee.emit('rebuild');
	    };
	    TrendSegments.prototype.stopAllAnimations = function () {
	        this.animatedSegmentsIds = [];
	        this.animatedSegmentsForAppend = [];
	        this.animatedSegmentsForAppend = [];
	        if (this.prependAnimation)
	            this.prependAnimation.kill();
	        if (this.appendAnimation)
	            this.appendAnimation.kill();
	    };
	    TrendSegments.prototype.recalculateDisplayedRange = function (segmentsAreRebuilded) {
	        if (segmentsAreRebuilded === void 0) { segmentsAreRebuilded = false; }
	        var _a = this.chartState.data.xAxis.range, from = _a.from, to = _a.to;
	        var _b = this, firstDisplayedSegment = _b.firstDisplayedSegment, lastDisplayedSegment = _b.lastDisplayedSegment;
	        var displayedRange = to - from;
	        this.firstDisplayedSegment = Utils_1.Utils.binarySearchClosest(this.segments, from - displayedRange, 'startXVal');
	        this.lastDisplayedSegment = Utils_1.Utils.binarySearchClosest(this.segments, to + displayedRange, 'endXVal');
	        if (segmentsAreRebuilded)
	            return;
	        var displayedRangeChanged = (firstDisplayedSegment.id !== this.firstDisplayedSegment.id ||
	            lastDisplayedSegment.id !== this.lastDisplayedSegment.id);
	        if (displayedRangeChanged)
	            this.ee.emit('displayedRangeChanged');
	    };
	    // getSegments(fromX?: number, toX?: number): TrendSegment[] {
	    // 	var segments = this.segments;
	    // 	if (fromX == void 0 && toX == void 0) return segments;
	    // 	fromX = fromX !== void 0 ? fromX : segments[0].startXVal;
	    // 	toX = toX !== void 0 ? toX : segments[this.segmentsLength].endXVal;
	    // 	var startSegmentInd = Utils.closestBinarySearch(segments, fromX, 'xVal');
	    // 	var endSegmentInd = Utils.closestBinarySearch(segments, toX, 'xVal');
	    // 	return segments.slice(startSegmentInd, endSegmentInd);
	    // }
	    /**
	     * returns array of segments for values array
	     * values must be sorted!
	     */
	    TrendSegments.prototype.getSegmentsForXValues = function (values) {
	        var valueInd = 0;
	        var value = values[valueInd];
	        var lastValueInd = values.length - 1;
	        var results = [];
	        var segment = this.getStartSegment();
	        if (!segment.hasValue)
	            return [];
	        while (segment) {
	            while (value < segment.startXVal) {
	                results.push(void 0);
	                value = values[++valueInd];
	            }
	            while (value > segment.endXVal) {
	                segment = segment.getNext();
	                if (!segment)
	                    break;
	            }
	            var valueInPoint = (segment.startXVal == value || segment.endXVal == value ||
	                (segment.startXVal < value && segment.endXVal > value));
	            if (valueInPoint) {
	                results.push(segment);
	                value = values[++valueInd];
	            }
	            if (valueInd > lastValueInd)
	                break;
	        }
	        return results;
	    };
	    TrendSegments.prototype.onAnimationFrame = function (cb) {
	        var _this = this;
	        var eventName = 'animationFrame';
	        this.ee.on('animationFrame', cb);
	        return function () {
	            _this.ee.removeListener(eventName, cb);
	        };
	    };
	    TrendSegments.prototype.onRebuild = function (cb) {
	        var _this = this;
	        var eventName = 'rebuild';
	        this.ee.on(eventName, cb);
	        return function () {
	            _this.ee.removeListener(eventName, cb);
	        };
	    };
	    TrendSegments.prototype.onDisplayedRangeChanged = function (cb) {
	        var _this = this;
	        var eventName = 'displayedRangeChanged';
	        this.ee.on(eventName, cb);
	        return function () {
	            _this.ee.removeListener(eventName, cb);
	        };
	    };
	    TrendSegments.prototype.allocateNextSegment = function () {
	        var id = this.nextEmptyId++;
	        var segment = new TrendSegment(this, id);
	        var prevSegment = this.segmentsById[this.endSegmentId];
	        if (prevSegment && prevSegment.hasValue) {
	            prevSegment.nextId = id;
	            segment.prevId = prevSegment.id;
	        }
	        this.endSegmentId = id;
	        this.segmentsLength++;
	        this.segmentsById[id] = segment;
	        this.segments.push(segment);
	        return segment;
	    };
	    TrendSegments.prototype.allocatePrevSegment = function () {
	        var id = this.nextEmptyId++;
	        var segment = new TrendSegment(this, id);
	        var nextSegment = this.segmentsById[this.startSegmentId];
	        if (nextSegment && nextSegment.hasValue) {
	            nextSegment.prevId = id;
	            segment.nextId = nextSegment.id;
	        }
	        this.startSegmentId = id;
	        this.segmentsLength++;
	        this.segmentsById[id] = segment;
	        this.segments.unshift(segment);
	        return segment;
	    };
	    TrendSegments.prototype.appendData = function (newData, needRebuildSegments) {
	        // WARNING: bottleneck method!
	        if (needRebuildSegments === void 0) { needRebuildSegments = false; }
	        // var t1 = performance.now();
	        var trendData = this.trend.getData();
	        if (needRebuildSegments) {
	            newData = trendData;
	            this.animatedSegmentsForAppend = [];
	        }
	        var startItemInd = trendData.length - newData.length;
	        var segment = this.getEndSegment() || this.allocateNextSegment();
	        var initialSegment = segment.hasValue ? segment : null;
	        var initialAnimationState = segment.createAnimationState();
	        var itemInd = 0;
	        while (itemInd < newData.length) {
	            var item = newData[itemInd];
	            var itemIsInserted = segment.appendItem(item);
	            var isLastItem = itemInd == newData.length - 1;
	            if (itemIsInserted) {
	                if (!isLastItem)
	                    itemInd++;
	            }
	            else {
	                if (!segment.isCompleted)
	                    segment.complete();
	            }
	            if (isLastItem && itemIsInserted) {
	                segment.recalculateItems();
	            }
	            var segmentIsReadyForAnimate = segment.isCompleted || (isLastItem && itemIsInserted);
	            if (segmentIsReadyForAnimate) {
	                var id = segment.id;
	                if (!initialSegment)
	                    initialSegment = segment;
	                if (!initialAnimationState)
	                    initialAnimationState = initialSegment.createAnimationState();
	                segment.initialAnimationState = Utils_1.Utils.deepMerge({}, initialAnimationState);
	                if (this.animatedSegmentsForAppend.length > 0) {
	                    segment.initialAnimationState.startXVal = initialAnimationState.endXVal;
	                    segment.initialAnimationState.startYVal = initialAnimationState.endYVal;
	                }
	                segment.targetAnimationState = segment.createAnimationState();
	                this.animatedSegmentsForAppend.push(id);
	            }
	            if (isLastItem && itemIsInserted)
	                break;
	            if (!segment.isCompleted)
	                continue;
	            segment = this.allocateNextSegment();
	            var prevItem = trendData[startItemInd + itemInd - 1];
	            segment.appendItem(prevItem);
	        }
	        var animationsOptions = this.chartState.data.animations;
	        var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
	        // var t2 = performance.now();
	        // console.log(t2 - t1);
	        // do not create animation if segments was rebuilded
	        if (needRebuildSegments) {
	            for (var _i = 0, _a = this.animatedSegmentsForAppend; _i < _a.length; _i++) {
	                var segmentId = _a[_i];
	                var segment_1 = this.segmentsById[segmentId];
	                segment_1.currentAnimationState = segment_1.createAnimationState();
	            }
	            this.animatedSegmentsForAppend = [];
	            return;
	        }
	        if (this.animatedSegmentsForAppend.length > MAX_ANIMATED_SEGMENTS)
	            time = 0;
	        this.animate(time);
	    };
	    // TODO: refactor duplicated code from appendData
	    TrendSegments.prototype.prependData = function (newData) {
	        var trendData = this.trend.getData();
	        var segment = this.getStartSegment() || this.segmentsById[0];
	        var initialSegment = segment.hasValue ? segment : null;
	        var itemInd = newData.length - 1;
	        var initialAnimationState = segment.createAnimationState();
	        while (itemInd >= 0) {
	            var item = newData[itemInd];
	            var itemIsInserted = segment.prependItem(item);
	            var isLastItem = itemInd == 0;
	            if (itemIsInserted) {
	                if (!isLastItem)
	                    itemInd--;
	            }
	            else {
	                if (!segment.isCompleted)
	                    segment.complete();
	            }
	            if (isLastItem && itemIsInserted) {
	                segment.recalculateItems();
	            }
	            var segmentIsReadyForAnimate = segment.isCompleted || (isLastItem && itemIsInserted);
	            if (segmentIsReadyForAnimate) {
	                var id = segment.id;
	                if (!initialSegment)
	                    initialSegment = segment;
	                if (!initialAnimationState)
	                    initialAnimationState = initialSegment.createAnimationState();
	                segment.initialAnimationState = Utils_1.Utils.deepMerge({}, initialAnimationState);
	                if (this.animatedSegmentsForPrepend.length > 0) {
	                    segment.initialAnimationState.endXVal = initialAnimationState.startXVal;
	                    segment.initialAnimationState.endYVal = initialAnimationState.startYVal;
	                }
	                segment.targetAnimationState = segment.createAnimationState();
	                this.animatedSegmentsForPrepend.push(id);
	            }
	            if (isLastItem && itemIsInserted)
	                break;
	            if (!segment.isCompleted)
	                continue;
	            segment = this.allocatePrevSegment();
	            var nextItem = trendData[itemInd + 1];
	            segment.prependItem(nextItem);
	        }
	        var animationsOptions = this.chartState.data.animations;
	        var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
	        if (this.animatedSegmentsForPrepend.length > MAX_ANIMATED_SEGMENTS)
	            time = 0;
	        this.animate(time, true);
	    };
	    TrendSegments.prototype.animate = function (time, isPrepend) {
	        var _this = this;
	        if (isPrepend === void 0) { isPrepend = false; }
	        var animatedSegmentsIds = isPrepend ? this.animatedSegmentsForPrepend : this.animatedSegmentsForAppend;
	        var animation = isPrepend ? this.prependAnimation : this.appendAnimation;
	        if ((animation && animation.isActive()) || time == 0) {
	            if (animation)
	                animation.kill();
	            this.onAnimationFrameHandler(1, isPrepend);
	            animatedSegmentsIds.length = 0;
	            return;
	        }
	        var animationsOptions = this.chartState.data.animations;
	        var ease = animationsOptions.trendChangeEase;
	        var objectToAnimate = { animationValue: 0 };
	        animation = TweenLite.to(objectToAnimate, time, { animationValue: 1, ease: ease });
	        animation.eventCallback('onUpdate', function () { return _this.onAnimationFrameHandler(objectToAnimate.animationValue, isPrepend); });
	        animation.eventCallback('onComplete', function () {
	            animatedSegmentsIds.length = 0;
	            _this.appendAnimation = null;
	        });
	        if (isPrepend) {
	            this.prependAnimation = animation;
	        }
	        else {
	            this.appendAnimation = animation;
	        }
	    };
	    TrendSegments.prototype.onAnimationFrameHandler = function (coefficient, isPrepend) {
	        if (isPrepend === void 0) { isPrepend = false; }
	        var animatedSegmentsIds = isPrepend ? this.animatedSegmentsForPrepend : this.animatedSegmentsForAppend;
	        for (var _i = 0, animatedSegmentsIds_1 = animatedSegmentsIds; _i < animatedSegmentsIds_1.length; _i++) {
	            var segmentId = animatedSegmentsIds_1[_i];
	            var segment = this.segmentsById[segmentId];
	            for (var key in segment.targetAnimationState) {
	                var targetValue = segment.targetAnimationState[key];
	                var initialValue = segment.initialAnimationState[key];
	                var currentValue = initialValue + (targetValue - initialValue) * coefficient;
	                segment.currentAnimationState[key] = currentValue;
	            }
	        }
	        this.animatedSegmentsIds = this.animatedSegmentsForAppend.concat(this.animatedSegmentsForPrepend);
	        this.ee.emit('animationFrame', this);
	    };
	    return TrendSegments;
	}());
	exports.TrendSegments = TrendSegments;
	var TrendSegment = (function () {
	    function TrendSegment(trendPoints, id) {
	        this.isCompleted = false;
	        this.items = [];
	        this.initialAnimationState = {};
	        this.targetAnimationState = {};
	        this.currentAnimationState = {};
	        this.trendSegments = trendPoints;
	        this.id = id;
	        this.maxLength = trendPoints.maxSegmentLength;
	    }
	    TrendSegment.prototype.createAnimationState = function () {
	        var _a = this, xVal = _a.xVal, yVal = _a.yVal, startXVal = _a.startXVal, startYVal = _a.startYVal, endXVal = _a.endXVal, endYVal = _a.endYVal, maxYVal = _a.maxYVal, minYVal = _a.minYVal, maxLength = _a.maxLength;
	        return {
	            xVal: xVal,
	            yVal: yVal,
	            startXVal: startXVal,
	            startYVal: startYVal,
	            endXVal: endXVal,
	            endYVal: endYVal,
	            maxYVal: maxYVal,
	            minYVal: minYVal,
	            maxLength: maxLength
	        };
	    };
	    ;
	    TrendSegment.prototype.appendItem = function (item) {
	        if (this.isCompleted)
	            return false;
	        var items = this.items;
	        if (items.length < 2) {
	            this.items.push(item);
	            this.hasValue = true;
	            return true;
	        }
	        var startXVal = items[0].xVal;
	        if (item.xVal - startXVal > this.maxLength)
	            return false;
	        items.push(item);
	        return true;
	    };
	    TrendSegment.prototype.prependItem = function (item) {
	        if (this.isCompleted)
	            return false;
	        var items = this.items;
	        if (items.length < 2) {
	            this.items.unshift(item);
	            this.hasValue = true;
	            return true;
	        }
	        var endXVal = items[items.length - 1].xVal;
	        if (endXVal - item.xVal > this.maxLength)
	            return false;
	        items.unshift(item);
	        return true;
	    };
	    TrendSegment.prototype.complete = function () {
	        this.isCompleted = true;
	        this.recalculateItems();
	        this.items = []; // free memory for completed ranges
	    };
	    TrendSegment.prototype.recalculateItems = function () {
	        var items = this.items;
	        var itemsLength = items.length;
	        if (itemsLength === 0)
	            Utils_1.Utils.error('Unable to create TrendSegment without TrendItems');
	        var endItem = items[itemsLength - 1];
	        var endXVal = endItem.xVal, endYVal = endItem.yVal;
	        var startXVal, startYVal;
	        var startItem = items[0];
	        startXVal = startItem.xVal;
	        startYVal = startItem.yVal;
	        var minX = Math.min(startXVal, endXVal);
	        var maxX = Math.max(startXVal, endXVal);
	        var middleXVal = minX + (maxX - minX) / 2;
	        var minY = Math.min(startYVal, endYVal);
	        var maxY = Math.max(startYVal, endYVal);
	        var middleYVal = minY + (maxY - minY) / 2;
	        var yVals = items.map(function (item) { return item.yVal; });
	        this.startXVal = startXVal;
	        this.startYVal = startYVal;
	        this.endXVal = endXVal;
	        this.endYVal = endYVal;
	        this.xVal = middleXVal;
	        this.yVal = middleYVal;
	        this.maxYVal = Math.max.apply(Math, yVals);
	        this.minYVal = Math.min.apply(Math, yVals);
	        if (!this.currentAnimationState)
	            this.currentAnimationState = this.createAnimationState();
	    };
	    TrendSegment.prototype.getNext = function () {
	        var nextPoint = this.trendSegments.segmentsById[this.nextId];
	        return nextPoint && nextPoint.hasValue ? nextPoint : null;
	    };
	    TrendSegment.prototype.getPrev = function () {
	        var prevPoint = this.trendSegments.segmentsById[this.prevId];
	        return prevPoint && prevPoint.hasValue ? prevPoint : null;
	    };
	    TrendSegment.prototype.getFrameVal = function () {
	        var _a = this.createAnimationState(), xVal = _a.xVal, yVal = _a.yVal;
	        return new Vector3(xVal, yVal, 0);
	    };
	    TrendSegment.prototype.getFramePoint = function () {
	        var frameVal = this.getFrameVal();
	        return this.trendSegments.chartState.screen.getPointOnChart(frameVal.x, frameVal.y);
	    };
	    return TrendSegment;
	}());
	exports.TrendSegment = TrendSegment;


/***/ },
/* 20 */
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
	        this.currentScrollX = { x: 0 };
	        this.currentScrollY = { y: 0 };
	        this.currentZoomX = { val: 1 };
	        this.currentZoomY = { val: 1 };
	        this.chartState = chartState;
	        var _a = chartState.data, w = _a.width, h = _a.height;
	        this.ee = new deps_1.EventEmitter();
	        this.transform({
	            scrollY: this.valueToPxByYAxis(this.chartState.data.yAxis.range.scroll),
	            zoomY: 1
	        });
	        // this.options.scrollY = this.chartState.data.yAxis.range.scroll;
	        // this.options.scrollYVal = this.chartState.valueToPxByYAxis(this.options.scrollY);
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
	    Screen.prototype.cameraIsMoving = function () {
	        return !!(this.scrollXAnimation && this.scrollXAnimation.isActive() ||
	            this.zoomXAnimation && this.zoomXAnimation.isActive());
	    };
	    Screen.prototype.transform = function (options, silent) {
	        if (silent === void 0) { silent = false; }
	        var scrollX = options.scrollX, scrollY = options.scrollY, zoomX = options.zoomX, zoomY = options.zoomY;
	        if (scrollX != void 0)
	            this.options.scrollX = scrollX;
	        if (scrollY != void 0)
	            this.options.scrollY = scrollY;
	        if (zoomX != void 0)
	            this.options.zoomX = zoomX;
	        if (zoomY != void 0)
	            this.options.zoomY = zoomY;
	        if (scrollX != void 0 || zoomX) {
	            options.scrollXVal = this.pxToValueByXAxis(scrollX != void 0 ? scrollX : this.options.scrollX);
	            this.options.scrollXVal = options.scrollXVal;
	        }
	        if (scrollY != void 0 || zoomY) {
	            options.scrollYVal = this.pxToValueByYAxis(scrollY != void 0 ? scrollY : this.options.scrollY);
	            this.options.scrollYVal = options.scrollYVal;
	        }
	        if (silent)
	            return;
	        this.ee.emit('transformationFrame', options);
	        if (options.scrollXVal != void 0 || options.scrollYVal != void 0) {
	            this.ee.emit('scrollFrame', options);
	        }
	        if (options.zoomX != void 0 || options.zoomY != void 0) {
	            this.ee.emit('zoomFrame', options);
	        }
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
	        state.onDestroy(function () { return _this.onDestroyHandler(); });
	    };
	    Screen.prototype.onDestroyHandler = function () {
	        this.ee.removeAllListeners();
	        this.scrollXAnimation && this.scrollXAnimation.kill();
	        this.scrollYAnimation && this.scrollYAnimation.kill();
	        this.zoomXAnimation && this.zoomXAnimation.kill();
	        this.zoomYAnimation && this.zoomYAnimation.kill();
	    };
	    Screen.prototype.onScrollXHandler = function (changedProps) {
	        var _this = this;
	        var state = this.chartState;
	        var isDragMode = state.data.cursor.dragMode;
	        var animations = state.data.animations;
	        var canAnimate = animations.enabled && !isDragMode;
	        var zoomXChanged = changedProps.xAxis.range.zoom;
	        var isAutoscroll = state.data.autoScroll && !isDragMode && !zoomXChanged;
	        var time = isAutoscroll ? animations.autoScrollSpeed : animations.zoomSpeed;
	        var ease = isAutoscroll ? animations.autoScrollEase : animations.zoomEase;
	        if (this.scrollXAnimation)
	            this.scrollXAnimation.pause();
	        var range = state.data.xAxis.range;
	        var targetX = range.scroll * range.scaleFactor * range.zoom;
	        this.currentScrollX.x = this.options.scrollX;
	        var cb = function () {
	            _this.transform({ scrollX: _this.currentScrollX.x });
	        };
	        if (canAnimate) {
	            this.scrollXAnimation = TweenLite.to(this.currentScrollX, time, {
	                x: targetX, ease: ease
	            });
	            this.scrollXAnimation.eventCallback('onUpdate', cb);
	        }
	        else {
	            this.currentScrollX.x = targetX;
	            cb();
	        }
	    };
	    Screen.prototype.onScrollYHandler = function () {
	        var _this = this;
	        var state = this.chartState;
	        var animations = state.data.animations;
	        var canAnimate = animations.enabled;
	        var time = animations.zoomSpeed;
	        if (this.scrollYAnimation)
	            this.scrollYAnimation.pause();
	        var range = state.data.yAxis.range;
	        var targetY = range.scroll * range.scaleFactor * range.zoom;
	        this.currentScrollY.y = this.options.scrollY;
	        var cb = function () {
	            _this.transform({ scrollY: _this.currentScrollY.y });
	        };
	        if (canAnimate) {
	            this.scrollYAnimation = TweenLite.to(this.currentScrollY, time, {
	                y: targetY, ease: animations.zoomEase
	            });
	            this.scrollYAnimation.eventCallback('onUpdate', cb);
	        }
	        else {
	            this.currentScrollY.y = targetY;
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
	    Screen.prototype.getTop = function () {
	        return this.getPointByScreenY(this.chartState.data.height);
	    };
	    Screen.prototype.getBottom = function () {
	        return this.getPointByScreenY(0);
	    };
	    Screen.prototype.getLeft = function () {
	        return this.getPointByScreenX(0);
	    };
	    Screen.prototype.getScreenRightVal = function () {
	        return this.getValueByScreenX(this.chartState.data.width);
	    };
	    Screen.prototype.getTopVal = function () {
	        return this.getValueByScreenY(this.chartState.data.height);
	    };
	    Screen.prototype.getBottomVal = function () {
	        return this.getValueByScreenY(0);
	    };
	    Screen.prototype.getCenterYVal = function () {
	        return this.getValueByScreenY(this.chartState.data.height / 2);
	    };
	    return Screen;
	}());
	exports.Screen = Screen;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Utils_1 = __webpack_require__(14);
	var interfaces_1 = __webpack_require__(22);
	var deps_1 = __webpack_require__(3);
	var AXIS_MARK_DEFAULT_OPTIONS = {
	    type: 'simple',
	    lineWidth: 1,
	    value: 0,
	    showValue: false,
	    stickToEdges: false,
	    lineColor: '#FFFFFF',
	    title: ''
	};
	var AxisMarks = (function () {
	    function AxisMarks(chartState, axisType) {
	        this.items = {};
	        this.chartState = chartState;
	        this.ee = new deps_1.EventEmitter();
	        this.axisType = axisType;
	        var marks = this.items;
	        var axisMarksOptions = axisType == interfaces_1.AXIS_TYPE.X ? chartState.data.xAxis.marks : chartState.data.yAxis.marks;
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
	                axisMark = new AxisTimeleftMark(chartState, axisType, options);
	            }
	            else {
	                axisMark = new AxisMark(chartState, axisType, options);
	            }
	            marks[options.name] = axisMark;
	        }
	        this.bindEvents();
	    }
	    AxisMarks.prototype.bindEvents = function () {
	        var _this = this;
	        this.chartState.onTrendChange(function (trendName, changedOptions, newData) {
	            _this.onTrendChange(trendName, newData);
	        });
	        this.chartState.onDestroy(function () { return _this.ee.removeAllListeners(); });
	    };
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
	        var _a = this.options, value = _a.value, displayedValue = _a.displayedValue;
	        return String(displayedValue !== void 0 ? displayedValue : value);
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
/* 22 */
/***/ function(module, exports) {

	"use strict";
	(function (AXIS_RANGE_TYPE) {
	    AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["FIXED"] = 0] = "FIXED";
	    AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["RELATIVE_END"] = 1] = "RELATIVE_END";
	    AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["AUTO"] = 2] = "AUTO";
	    AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["ALL"] = 3] = "ALL"; // TODO: AXIS_RANGE_TYPE.ALL
	})(exports.AXIS_RANGE_TYPE || (exports.AXIS_RANGE_TYPE = {}));
	var AXIS_RANGE_TYPE = exports.AXIS_RANGE_TYPE;
	;
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
	var Widget_1 = __webpack_require__(15);
	var GridWidget_1 = __webpack_require__(24);
	var Utils_1 = __webpack_require__(14);
	var interfaces_1 = __webpack_require__(22);
	/**
	 * widget for drawing axis
	 */
	var AxisWidget = (function (_super) {
	    __extends(AxisWidget, _super);
	    function AxisWidget(state) {
	        var _this = this;
	        _super.call(this, state);
	        this.isDestroyed = false;
	        this.object3D = new Object3D();
	        this.axisXObject = new Object3D();
	        this.axisYObject = new Object3D();
	        this.object3D.add(this.axisXObject);
	        this.object3D.add(this.axisYObject);
	        this.initAxis(interfaces_1.AXIS_TYPE.X);
	        this.initAxis(interfaces_1.AXIS_TYPE.Y);
	        // canvas drawing is expensive operation, so when we scroll, redraw must be called only once per second
	        this.updateAxisXRequest = Utils_1.Utils.throttle(function () { return _this.updateAxis(interfaces_1.AXIS_TYPE.X); }, 1000);
	        this.onScrollChange(state.screen.options.scrollX, state.screen.options.scrollY);
	    }
	    AxisWidget.prototype.bindEvents = function () {
	        var _this = this;
	        var state = this.chartState;
	        state.screen.onTransformationFrame(function (options) {
	            _this.onScrollChange(options.scrollX, options.scrollY);
	        });
	        state.screen.onZoomFrame(function (options) { _this.onZoomFrame(options); });
	        state.onDestroy(function () { return _this.onDestroy(); });
	    };
	    AxisWidget.prototype.onDestroy = function () {
	        this.isDestroyed = true;
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
	        var texture = Utils_1.Utils.createPixelPerfectTexture(canvasWidth, canvasHeight, function (ctx) {
	            ctx.beginPath();
	            ctx.font = "10px Arial";
	            ctx.fillStyle = "rgba(255,255,255,0.5)";
	            ctx.strokeStyle = "rgba(255,255,255,0.1)";
	        });
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
	        if (this.isDestroyed)
	            return;
	        var isXAxis = orientation == interfaces_1.AXIS_TYPE.X;
	        var _a = this.chartState.data, visibleWidth = _a.width, visibleHeight = _a.height;
	        var _b = this.chartState.screen.options, scrollX = _b.scrollX, scrollY = _b.scrollY, zoomX = _b.zoomX, zoomY = _b.zoomY;
	        var axisOptions;
	        var axisMesh;
	        var axisGridParams;
	        if (isXAxis) {
	            axisMesh = this.axisXObject.children[0];
	            axisOptions = this.chartState.data.xAxis;
	            axisGridParams = GridWidget_1.GridWidget.getGridParamsForAxis(axisOptions, visibleWidth, zoomX);
	        }
	        else {
	            axisMesh = this.axisYObject.children[0];
	            axisOptions = this.chartState.data.yAxis;
	            axisGridParams = GridWidget_1.GridWidget.getGridParamsForAxis(axisOptions, visibleHeight, zoomY);
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
	var Widget_1 = __webpack_require__(15);
	var LineSegments = THREE.LineSegments;
	var Utils_1 = __webpack_require__(14);
	/**
	 * widget for drawing chart grid
	 */
	var GridWidget = (function (_super) {
	    __extends(GridWidget, _super);
	    function GridWidget(chartState) {
	        _super.call(this, chartState);
	        this.isDestroyed = false;
	        var _a = chartState.data, width = _a.width, height = _a.height, xAxis = _a.xAxis, yAxis = _a.yAxis;
	        this.gridSizeH = Math.floor(width / xAxis.gridMinSize) * 3;
	        this.gridSizeV = Math.floor(height / yAxis.gridMinSize) * 3;
	        this.initGrid();
	        this.updateGrid();
	    }
	    GridWidget.prototype.bindEvents = function () {
	        var _this = this;
	        // grid is bigger then screen, so it's no need to update it on each scroll event
	        var updateGridThrettled = Utils_1.Utils.throttle(function () { return _this.updateGrid(); }, 1000);
	        this.chartState.onScroll(function () { return updateGridThrettled(); });
	        this.chartState.screen.onZoomFrame(function (options) {
	            updateGridThrettled();
	            _this.onZoomFrame(options);
	        });
	        this.chartState.onDestroy(function () {
	            _this.isDestroyed = true;
	        });
	    };
	    GridWidget.prototype.initGrid = function () {
	        var geometry = new THREE.Geometry();
	        var material = new THREE.LineBasicMaterial({ linewidth: 2.5, opacity: 0.05, transparent: true });
	        var xLinesCount = this.gridSizeH;
	        var yLinesCount = this.gridSizeV;
	        while (xLinesCount--)
	            geometry.vertices.push(new Vector3(), new Vector3());
	        while (yLinesCount--)
	            geometry.vertices.push(new Vector3(), new Vector3());
	        this.lineSegments = new LineSegments(geometry, material);
	        this.lineSegments.position.setZ(-1);
	        this.lineSegments.frustumCulled = false;
	    };
	    GridWidget.prototype.updateGrid = function () {
	        if (this.isDestroyed)
	            return;
	        var _a = this.chartState.data, yAxis = _a.yAxis, xAxis = _a.xAxis, width = _a.width, height = _a.height;
	        var axisXGrid = GridWidget.getGridParamsForAxis(xAxis, width, xAxis.range.zoom);
	        var axisYGrid = GridWidget.getGridParamsForAxis(yAxis, height, yAxis.range.zoom);
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
	    // TODO: move this code to core
	    GridWidget.getGridParamsForAxis = function (axisOptions, axisWidth, zoom) {
	        var axisRange = axisOptions.range;
	        var from = axisRange.from; //var from = axisOptions.range.zeroVal + scroll;
	        var to = axisRange.to; //var to = from + axisWidth / (axisRange.scaleFactor * zoom);
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
	var Utils_1 = __webpack_require__(14);
	var Mesh = THREE.Mesh;
	var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
	var MeshBasicMaterial = THREE.MeshBasicMaterial;
	var TrendsWidget_1 = __webpack_require__(26);
	var Trend_1 = __webpack_require__(17);
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
	    TrendsLoadingWidget.widgetName = 'TrendsLoading';
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
	        var trend = this.trend;
	        // set new widget position
	        var segment = trend.segments.getStartSegment();
	        var x, y;
	        if (trend.getOptions().type == Trend_1.TREND_TYPE.LINE) {
	            x = segment.currentAnimationState.startXVal;
	            y = segment.currentAnimationState.startYVal;
	        }
	        else {
	            x = segment.currentAnimationState.xVal - segment.maxLength;
	            y = segment.currentAnimationState.yVal;
	        }
	        var pointVector = this.chartState.screen.getPointOnChart(x, y);
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
	var Widget_1 = __webpack_require__(15);
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
	            var widgetCanBeEnabled = TrendWidgetClass.widgetIsEnabled(trendOptions, this.chartState);
	            if (widgetCanBeEnabled && !this.widgets[trendName]) {
	                this.createTrendWidget(trendName);
	            }
	            else if (!widgetCanBeEnabled && this.widgets[trendName]) {
	                this.destroyTrendWidget(trendName);
	            }
	        }
	    };
	    TrendsWidget.prototype.onTrendChange = function (trendName, changedOptions, newData) {
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
	    TrendWidget.prototype.onSegmentsAnimate = function (segments) {
	    };
	    TrendWidget.prototype.onZoomFrame = function (options) {
	    };
	    TrendWidget.prototype.onTransformationFrame = function (options) {
	    };
	    TrendWidget.prototype.onZoom = function () {
	    };
	    TrendWidget.prototype.bindEvents = function () {
	        var _this = this;
	        this.bindEvent(this.trend.segments.onAnimationFrame(function (trendPoints) { return _this.onSegmentsAnimate(trendPoints); }));
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
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Widget_1 = __webpack_require__(15);
	var Object3D = THREE.Object3D;
	var Geometry = THREE.Geometry;
	var LineBasicMaterial = THREE.LineBasicMaterial;
	var Vector3 = THREE.Vector3;
	var Utils_1 = __webpack_require__(14);
	var Line = THREE.Line;
	var Mesh = THREE.Mesh;
	var interfaces_1 = __webpack_require__(22);
	/**
	 * widget for shows marks on axis
	 */
	var AxisMarksWidget = (function (_super) {
	    __extends(AxisMarksWidget, _super);
	    function AxisMarksWidget(chartState) {
	        _super.call(this, chartState);
	        this.axisMarksWidgets = [];
	        this.object3D = new Object3D();
	        var xAxisMarks = chartState.xAxisMarks, yAxisMarks = chartState.yAxisMarks;
	        var items = xAxisMarks.getItems();
	        for (var markName in items) {
	            this.createAxisMark(items[markName]);
	        }
	        items = yAxisMarks.getItems();
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
	    AxisMarksWidget.widgetName = 'AxisMarks';
	    return AxisMarksWidget;
	}(Widget_1.ChartWidget));
	exports.AxisMarksWidget = AxisMarksWidget;
	var DEFAULT_INDICATOR_RENDER_FUNCTION = function (axisMarkWidget, ctx) {
	    var axisMark = axisMarkWidget.axisMark;
	    ctx.fillStyle = axisMark.options.lineColor;
	    ctx.clearRect(0, 0, axisMarkWidget.indicatorWidth, axisMarkWidget.indicatorHeight);
	    var xCoord = 15;
	    if (axisMark.axisType == interfaces_1.AXIS_TYPE.Y) {
	        ctx.textAlign = 'end';
	        xCoord = axisMarkWidget.indicatorWidth;
	    }
	    ctx.fillText(axisMark.options.title, xCoord, 20);
	    if (!axisMark.options.showValue)
	        return;
	    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
	    ctx.fillText(axisMark.getDisplayedVal(), 16, 34);
	};
	var INDICATOR_POS_Z = 0.1;
	var AxisMarkWidget = (function () {
	    function AxisMarkWidget(chartState, axisMark) {
	        this.indicatorWidth = 128;
	        this.indicatorHeight = 64;
	        this.indicatorRenderFunction = DEFAULT_INDICATOR_RENDER_FUNCTION;
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
	        var screen = chartState.screen;
	        var isXAxis = this.axisType == interfaces_1.AXIS_TYPE.X;
	        var lineGeometry = this.line.geometry;
	        var hasStickMode = this.axisMark.options.stickToEdges;
	        var _a = this.chartState.data, width = _a.width, height = _a.height;
	        if (isXAxis) {
	            // TODO: make stickToEdges mode for AXIS_TYPE.X 
	            this.object3D.position.x = screen.getPointOnXAxis(this.frameValue);
	            this.object3D.position.y = screen.getBottom();
	            lineGeometry.vertices[1].setY(height);
	            this.indicator.position.set(this.indicatorWidth / 2, chartState.data.height - this.indicatorHeight / 2, INDICATOR_POS_Z);
	        }
	        else {
	            var val = this.frameValue;
	            var bottomVal = screen.getBottomVal();
	            var topVal = screen.getTopVal();
	            var needToStickOnTop = hasStickMode && val > topVal;
	            var needToStickOnBottom = hasStickMode && val < bottomVal;
	            var centerYVal = screen.getCenterYVal();
	            this.object3D.position.x = screen.getLeft();
	            if (needToStickOnTop) {
	                this.object3D.position.y = screen.getTop();
	            }
	            else if (needToStickOnBottom) {
	                this.object3D.position.y = screen.getBottom();
	            }
	            else {
	                this.object3D.position.y = screen.getPointOnYAxis(this.frameValue);
	            }
	            lineGeometry.vertices[1].setX(width);
	            var indicatorPosY = val > centerYVal ? -35 : 10;
	            this.indicator.position.set(width - this.indicatorWidth / 2 - 50, indicatorPosY, INDICATOR_POS_Z);
	        }
	        lineGeometry.verticesNeedUpdate = true;
	    };
	    AxisMarkWidget.typeName = 'simple';
	    return AxisMarkWidget;
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
	var Geometry = THREE.Geometry;
	var Mesh = THREE.Mesh;
	var Object3D = THREE.Object3D;
	var TrendsWidget_1 = __webpack_require__(26);
	var TrendMarks_1 = __webpack_require__(18);
	var Utils_1 = __webpack_require__(14);
	var MAX_MARKS_IN_ROW = 3;
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
	        var actualMarksNames = [];
	        for (var markName in marksItems) {
	            actualMarksNames.push(markName);
	            if (!widgets[markName])
	                this.createMarkWidget(marksItems[markName]);
	        }
	        for (var markName in this.marksWidgets) {
	            if (actualMarksNames.indexOf(markName) !== -1)
	                continue;
	            this.destroyMarkWidget(markName);
	        }
	    };
	    TrendMarksWidget.prototype.createMarkWidget = function (mark) {
	        if (!mark.segment)
	            return;
	        var markWidget = new TrendMarkWidget(this.chartState, mark);
	        this.marksWidgets[mark.options.name] = markWidget;
	        this.object3D.add(markWidget.getObject3D());
	    };
	    TrendMarksWidget.prototype.destroyMarkWidget = function (markName) {
	        this.object3D.remove(this.marksWidgets[markName].getObject3D());
	        delete this.marksWidgets[markName];
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
	    TrendMarksWidget.prototype.onSegmentsAnimate = function () {
	        var widgets = this.marksWidgets;
	        for (var markName in widgets) {
	            widgets[markName].onSegmentsAnimate();
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
	        this.line = this.createMarkLine();
	        this.object3D.add(this.markMesh);
	        this.object3D.add(this.line);
	    };
	    TrendMarkWidget.prototype.createMarkMesh = function () {
	        var _a = this, markHeight = _a.markHeight, markWidth = _a.markWidth;
	        var mark = this.mark.options;
	        var isTopSide = mark.orientation == TrendMarks_1.TREND_MARK_SIDE.TOP;
	        var texture = Utils_1.Utils.createPixelPerfectTexture(markWidth, markHeight, function (ctx) {
	            var circleOffset = isTopSide ? 30 : 0;
	            var circleR = 22;
	            var circleX = markWidth / 2;
	            var circleY = circleOffset + circleR;
	            var textOffset = isTopSide ? 10 : circleR * 2 + 15;
	            // title and description
	            ctx.beginPath();
	            ctx.textAlign = 'center';
	            ctx.font = "11px Arial";
	            ctx.fillStyle = 'rgba(255,255,255, 0.6)';
	            ctx.fillText(mark.title, circleX, textOffset);
	            ctx.fillStyle = mark.descriptionColor;
	            ctx.fillText(mark.description, circleX, textOffset + 12);
	            // icon circle
	            ctx.beginPath();
	            ctx.fillStyle = mark.iconColor;
	            ctx.arc(circleX, circleY, circleR, 0, 2 * Math.PI);
	            ctx.fill();
	            // icon text
	            ctx.font = "19px Arial";
	            ctx.fillStyle = 'rgb(255, 255, 255)';
	            ctx.fillText(mark.icon, circleX, circleY + 7);
	        });
	        var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
	        material.transparent = true;
	        var mesh = new Mesh(new THREE.PlaneGeometry(markWidth, markHeight), material);
	        var offset = this.mark.options.orientation == TrendMarks_1.TREND_MARK_SIDE.TOP ? this.mark.offset : -this.mark.offset;
	        // mesh.position.setY(markHeight / 2 + offset);
	        return mesh;
	    };
	    TrendMarkWidget.prototype.createMarkLine = function () {
	        var lineGeometry = new Geometry();
	        lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, this.mark.offset, 0));
	        lineGeometry.computeLineDistances();
	        var lineMaterial = new THREE.LineDashedMaterial({ dashSize: 1, gapSize: 4, transparent: true, opacity: 0.6 });
	        var line = new THREE.Line(lineGeometry, lineMaterial);
	        line.position.setZ(-0.1);
	        return line;
	    };
	    TrendMarkWidget.prototype.getObject3D = function () {
	        return this.object3D;
	    };
	    TrendMarkWidget.prototype.onSegmentsAnimate = function () {
	        this.updatePosition();
	    };
	    TrendMarkWidget.prototype.onZoomFrameHandler = function () {
	        this.updatePosition();
	    };
	    TrendMarkWidget.prototype.updatePosition = function () {
	        if (!this.mark.segment)
	            return;
	        var mark = this.mark;
	        var meshMaterial = this.markMesh.material;
	        var lineMaterial = this.line.material;
	        if (mark.row >= MAX_MARKS_IN_ROW - 1) {
	            meshMaterial.opacity = 0;
	            lineMaterial.opacity = 0;
	        }
	        else {
	            meshMaterial.opacity = 1;
	            lineMaterial.opacity = 1;
	        }
	        var screen = this.chartState.screen;
	        var posX = screen.getPointOnXAxis(mark.xVal);
	        var posY = screen.getPointOnYAxis(mark.yVal);
	        var lineGeometry = this.line.geometry;
	        if (mark.options.orientation == TrendMarks_1.TREND_MARK_SIDE.TOP) {
	            this.markMesh.position.setY(this.markHeight / 2 + mark.offset);
	            lineGeometry.vertices[1].setY(mark.offset);
	        }
	        else {
	            this.markMesh.position.setY(-mark.offset - this.markHeight / 2);
	            lineGeometry.vertices[1].setY(-mark.offset);
	        }
	        lineGeometry.verticesNeedUpdate = true;
	        lineGeometry.lineDistancesNeedUpdate = true;
	        lineGeometry.computeLineDistances();
	        this.object3D.position.set(posX, posY, 0);
	    };
	    TrendMarkWidget.prototype.show = function () {
	        if (!this.mark.segment)
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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Widget_1 = __webpack_require__(15);
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
	        geometry.vertices.push(new Vector3(0, 0, 0), new Vector3(0, height, 0), new Vector3(0, height, 0), new Vector3(width, height, 0), new Vector3(width, height, 0), new Vector3(width, 0, 0), new Vector3(width, 0, 0), new Vector3(0, 0, 0), new Vector3(width / 2, height, 0), new Vector3(width / 2, 0, 0));
	        this.lineSegments = new LineSegments(geometry, material);
	    }
	    BorderWidget.prototype.getObject3D = function () {
	        return this.lineSegments;
	    };
	    BorderWidget.widgetName = 'Border';
	    return BorderWidget;
	}(Widget_1.ChartWidget));
	exports.BorderWidget = BorderWidget;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Utils_1 = __webpack_require__(14);
	var Mesh = THREE.Mesh;
	var TrendsWidget_1 = __webpack_require__(26);
	var Color = THREE.Color;
	var CANVAS_WIDTH = 128;
	var CANVAS_HEIGHT = 64;
	var OFFSET_X = 15;
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
	        this.segment = this.trend.segments.getEndSegment();
	        this.updatePosition();
	    };
	    TrendIndicator.prototype.onSegmentsAnimate = function (segments) {
	        // set new widget position
	        this.segment = segments.getEndSegment();
	        this.updatePosition();
	    };
	    TrendIndicator.prototype.updatePosition = function () {
	        var state = this.chartState;
	        var _a = this.segment.currentAnimationState, segmentEndXVal = _a.endXVal, segmentEndYVal = _a.endYVal;
	        var endPointVector = state.screen.getPointOnChart(segmentEndXVal, segmentEndYVal);
	        var screenWidth = state.data.width;
	        var x = endPointVector.x + OFFSET_X;
	        var y = endPointVector.y;
	        var screenX = state.screen.getScreenXByPoint(endPointVector.x);
	        var indicatorIsOutOfScreen = screenX < 0 || screenX > screenWidth;
	        if (indicatorIsOutOfScreen) {
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
/* 31 */
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
	var TrendsWidget_1 = __webpack_require__(26);
	var LineSegments = THREE.LineSegments;
	var Trend_1 = __webpack_require__(17);
	var Utils_1 = __webpack_require__(14);
	var MAX_DISPLAYED_SEGMENTS = 2000;
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
	    TrendsLineWidget.widgetName = "TrendsLine";
	    return TrendsLineWidget;
	}(TrendsWidget_1.TrendsWidget));
	exports.TrendsLineWidget = TrendsLineWidget;
	var TrendLine = (function (_super) {
	    __extends(TrendLine, _super);
	    function TrendLine(chartState, trendName) {
	        _super.call(this, chartState, trendName);
	        // contains indexes of free segments
	        this.freeSegmentsInds = [];
	        // contains segments to display
	        this.displayedSegments = {};
	        var options = this.trend.getOptions();
	        this.material = new LineBasicMaterial({ color: options.lineColor, linewidth: options.lineWidth });
	        this.initLine();
	    }
	    TrendLine.widgetIsEnabled = function (trendOptions) {
	        return trendOptions.enabled && trendOptions.type == Trend_1.TREND_TYPE.LINE;
	    };
	    TrendLine.prototype.getObject3D = function () {
	        return this.lineSegments;
	    };
	    TrendLine.prototype.bindEvents = function () {
	        var _this = this;
	        _super.prototype.bindEvents.call(this);
	        this.bindEvent(this.trend.segments.onRebuild(function () {
	            _this.destroySegments();
	            _this.setupSegments();
	        }));
	        this.bindEvent(this.trend.segments.onDisplayedRangeChanged(function () {
	            _this.setupSegments();
	        }));
	    };
	    TrendLine.prototype.initLine = function () {
	        var geometry = new Geometry();
	        var _a = this.chartState.data.xAxis.range, scaleXFactor = _a.scaleFactor, zoomX = _a.zoom;
	        var _b = this.chartState.data.yAxis.range, scaleYFactor = _b.scaleFactor, zoomY = _b.zoom;
	        this.scaleXFactor = scaleXFactor;
	        this.scaleYFactor = scaleYFactor;
	        this.lineSegments = new LineSegments(geometry, this.material);
	        this.lineSegments.scale.set(scaleXFactor * zoomX, scaleYFactor * zoomY, 1);
	        this.lineSegments.frustumCulled = false;
	        for (var i = 0; i < MAX_DISPLAYED_SEGMENTS; i++) {
	            geometry.vertices.push(new Vector3(), new Vector3());
	            this.freeSegmentsInds.push(i);
	        }
	        this.vertices = geometry.vertices;
	        this.setupSegments();
	    };
	    TrendLine.prototype.setupSegments = function () {
	        var geometry = this.lineSegments.geometry;
	        var _a = this.trend.segments, firstDisplayedSegment = _a.firstDisplayedSegment, lastDisplayedSegment = _a.lastDisplayedSegment;
	        for (var segmentId in this.displayedSegments) {
	            var lineSegment = this.displayedSegments[segmentId];
	            var segment_1 = this.trend.segments.segments[lineSegment.segmentId];
	            var segmentIsNotDisplayed = (segment_1.startXVal < firstDisplayedSegment.startXVal ||
	                segment_1.endXVal > lastDisplayedSegment.endXVal);
	            if (segmentIsNotDisplayed)
	                this.destroySegment(Number(segmentId));
	        }
	        var segment = firstDisplayedSegment;
	        while (segment && segment.xVal <= lastDisplayedSegment.xVal) {
	            this.setupSegment(segment.id, segment.currentAnimationState);
	            segment = segment.getNext();
	        }
	        geometry.verticesNeedUpdate = true;
	    };
	    TrendLine.prototype.setupSegment = function (segmentId, segmentState) {
	        var lineSegment = this.displayedSegments[segmentId];
	        if (!lineSegment) {
	            if (this.freeSegmentsInds.length == 0)
	                Utils_1.Utils.error('Max allocated segments reached');
	            var ind = this.freeSegmentsInds.pop();
	            lineSegment = this.displayedSegments[segmentId] = { segmentId: segmentId, ind: ind };
	        }
	        var segmentInd = lineSegment.ind;
	        var lineStartVertex = this.vertices[segmentInd * 2];
	        var lineEndVertex = this.vertices[segmentInd * 2 + 1];
	        lineStartVertex.set(this.toLocalX(segmentState.startXVal), this.toLocalY(segmentState.startYVal), 0);
	        lineEndVertex.set(this.toLocalX(segmentState.endXVal), this.toLocalY(segmentState.endYVal), 0);
	    };
	    TrendLine.prototype.destroySegments = function () {
	        for (var segmentId in this.displayedSegments)
	            this.destroySegment(Number(segmentId));
	    };
	    TrendLine.prototype.destroySegment = function (segmentId) {
	        var lineSegment = this.displayedSegments[segmentId];
	        var lineStartVertex = this.vertices[lineSegment.ind * 2];
	        var lineEndVertex = this.vertices[lineSegment.ind * 2 + 1];
	        lineStartVertex.set(0, 0, 0);
	        lineEndVertex.set(0, 0, 0);
	        delete this.displayedSegments[segmentId];
	        this.freeSegmentsInds.push(lineSegment.ind);
	    };
	    TrendLine.prototype.onZoomFrame = function (options) {
	        var currentScale = this.lineSegments.scale;
	        if (options.zoomX)
	            currentScale.setX(this.scaleXFactor * options.zoomX);
	        if (options.zoomY)
	            currentScale.setY(this.scaleYFactor * options.zoomY);
	    };
	    TrendLine.prototype.onSegmentsAnimate = function (trendSegments) {
	        var geometry = this.lineSegments.geometry;
	        for (var _i = 0, _a = trendSegments.animatedSegmentsIds; _i < _a.length; _i++) {
	            var segmentId = _a[_i];
	            if (!this.displayedSegments[segmentId])
	                continue;
	            this.setupSegment(segmentId, trendSegments.segmentsById[segmentId].currentAnimationState);
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
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var TrendsWidget_1 = __webpack_require__(26);
	var Object3D = THREE.Object3D;
	var Geometry = THREE.Geometry;
	var Vector3 = THREE.Vector3;
	var Mesh = THREE.Mesh;
	var Line = THREE.Line;
	var MeshBasicMaterial = THREE.MeshBasicMaterial;
	var PlaneGeometry = THREE.PlaneGeometry;
	var Trend_1 = __webpack_require__(17);
	var LineBasicMaterial = THREE.LineBasicMaterial;
	var RISE_COLOR = 0x2CAC40;
	var FALL_COLOR = 0xEE5533;
	var MARGIN_PERCENT = 0.3;
	var MAX_CANDLES = 100;
	/**
	 * widget for drawing trends candles
	 */
	var TrendsCandlesWidget = (function (_super) {
	    __extends(TrendsCandlesWidget, _super);
	    function TrendsCandlesWidget() {
	        _super.apply(this, arguments);
	    }
	    TrendsCandlesWidget.prototype.getTrendWidgetClass = function () {
	        return TrendCandlesWidget;
	    };
	    TrendsCandlesWidget.widgetName = "TrendsCandles";
	    return TrendsCandlesWidget;
	}(TrendsWidget_1.TrendsWidget));
	exports.TrendsCandlesWidget = TrendsCandlesWidget;
	var TrendCandlesWidget = (function (_super) {
	    __extends(TrendCandlesWidget, _super);
	    function TrendCandlesWidget(chartState, trendName) {
	        _super.call(this, chartState, trendName);
	        // contains indexes of free candles
	        this.freeCandlesInds = [];
	        this.candlesPool = [];
	        this.candles = {};
	        this.initObject();
	    }
	    TrendCandlesWidget.widgetIsEnabled = function (trendOptions) {
	        return trendOptions.enabled && trendOptions.type == Trend_1.TREND_TYPE.CANDLE;
	    };
	    TrendCandlesWidget.prototype.getObject3D = function () {
	        return this.object3D;
	    };
	    TrendCandlesWidget.prototype.bindEvents = function () {
	        var _this = this;
	        _super.prototype.bindEvents.call(this);
	        this.bindEvent(this.trend.segments.onRebuild(function () {
	            _this.destroyCandles();
	            _this.setupCandles();
	        }));
	        this.bindEvent(this.trend.segments.onDisplayedRangeChanged(function () {
	            _this.setupCandles();
	        }));
	    };
	    TrendCandlesWidget.prototype.initObject = function () {
	        var stateData = this.chartState.data;
	        var _a = stateData.xAxis.range, scaleXFactor = _a.scaleFactor, zoomX = _a.zoom;
	        var _b = stateData.yAxis.range, scaleYFactor = _b.scaleFactor, zoomY = _b.zoom;
	        this.scaleXFactor = scaleXFactor;
	        this.scaleYFactor = scaleYFactor;
	        this.object3D = new Object3D();
	        this.object3D.scale.set(scaleXFactor * zoomX, scaleYFactor * zoomY, 1);
	        this.object3D.frustumCulled = false;
	        for (var i = 0; i < MAX_CANDLES; i++)
	            this.freeCandlesInds.push(i);
	        this.setupCandles();
	    };
	    TrendCandlesWidget.prototype.setupCandles = function () {
	        // remove invisible
	        var _a = this.trend.segments, firstDisplayedSegment = _a.firstDisplayedSegment, lastDisplayedSegment = _a.lastDisplayedSegment;
	        for (var segmentId in this.candles) {
	            var segment_1 = this.candles[segmentId].segment;
	            var segmentIsNotDisplayed = (segment_1.startXVal < firstDisplayedSegment.startXVal ||
	                segment_1.endXVal > lastDisplayedSegment.endXVal);
	            if (segmentIsNotDisplayed)
	                this.destroyCandle(Number(segmentId));
	        }
	        var segment = firstDisplayedSegment;
	        while (segment && segment.xVal <= lastDisplayedSegment.xVal) {
	            this.setupCandle(segment.id, segment.currentAnimationState);
	            segment = segment.getNext();
	        }
	    };
	    TrendCandlesWidget.prototype.destroyCandles = function () {
	        for (var segmentId in this.candles)
	            this.destroyCandle(Number(segmentId));
	    };
	    TrendCandlesWidget.prototype.destroyCandle = function (segmentId) {
	        var candle = this.candles[segmentId];
	        this.object3D.remove(candle.getObject3D());
	        delete this.candles[segmentId];
	    };
	    TrendCandlesWidget.prototype.onZoomFrame = function (options) {
	        var currentScale = this.object3D.scale;
	        if (options.zoomX)
	            currentScale.setX(this.scaleXFactor * options.zoomX);
	        if (options.zoomY)
	            currentScale.setY(this.scaleYFactor * options.zoomY);
	    };
	    TrendCandlesWidget.prototype.onSegmentsAnimate = function (trendSegments) {
	        for (var _i = 0, _a = trendSegments.animatedSegmentsIds; _i < _a.length; _i++) {
	            var segmentId = _a[_i];
	            if (!this.candles[segmentId])
	                continue;
	            var segmentState = trendSegments.segmentsById[segmentId].currentAnimationState;
	            this.setupCandle(segmentId, segmentState);
	        }
	    };
	    /**
	     * create or modify candle
	     */
	    TrendCandlesWidget.prototype.setupCandle = function (candleId, segmentState) {
	        var candleInd = candleId % MAX_CANDLES;
	        // get candle from candlesPool to avoid creating new Objects by performance reasons
	        var candle = this.candlesPool[candleInd];
	        if (!candle) {
	            candle = this.candlesPool[candleInd] = new CandleWidget();
	        }
	        if (!this.candles[candleId]) {
	            this.candles[candleId] = candle;
	            this.object3D.add(candle.getObject3D());
	        }
	        candle.getObject3D().position.set(this.toLocalX(segmentState.xVal), this.toLocalY(segmentState.yVal), 0);
	        candle.setSegment(segmentState);
	    };
	    TrendCandlesWidget.prototype.toLocalX = function (xVal) {
	        return xVal - this.chartState.data.xAxis.range.zeroVal;
	    };
	    TrendCandlesWidget.prototype.toLocalY = function (yVal) {
	        return yVal - this.chartState.data.yAxis.range.zeroVal;
	    };
	    TrendCandlesWidget.prototype.toLocalVec = function (vec) {
	        return new Vector3(this.toLocalX(vec.x), this.toLocalY(vec.y), 0);
	    };
	    return TrendCandlesWidget;
	}(TrendsWidget_1.TrendWidget));
	exports.TrendCandlesWidget = TrendCandlesWidget;
	var CandleWidget = (function () {
	    function CandleWidget() {
	        this.initObject();
	    }
	    CandleWidget.prototype.getObject3D = function () {
	        return this.rect;
	    };
	    CandleWidget.prototype.setSegment = function (segment) {
	        this.segment = segment;
	        var color = segment.endYVal < segment.startYVal ? FALL_COLOR : RISE_COLOR;
	        // update rect
	        var geometry = this.rect.geometry;
	        var material = this.rect.material;
	        var width = segment.endXVal - segment.startXVal;
	        width -= width * MARGIN_PERCENT;
	        var height = Math.max(segment.startYVal, segment.endYVal) - Math.min(segment.startYVal, segment.endYVal);
	        var _a = geometry.vertices, leftTop = _a[0], rightTop = _a[1], leftBottom = _a[2], rightBottom = _a[3];
	        leftTop.set(-width / 2, height / 2, 0);
	        rightTop.set(width / 2, height / 2, 0);
	        leftBottom.set(-width / 2, -height / 2, 0);
	        rightBottom.set(width / 2, -height / 2, 0);
	        material.color.set(color);
	        geometry.verticesNeedUpdate = true;
	        // update line
	        var lineGeometry = this.line.geometry;
	        var lineMaterial = this.line.material;
	        var lineTop = segment.maxYVal - segment.yVal;
	        var lineBottom = segment.minYVal - segment.yVal;
	        lineGeometry.vertices[0].set(0, lineTop, 0);
	        lineGeometry.vertices[1].set(0, lineBottom, 0);
	        lineMaterial.color.set(color);
	        lineGeometry.verticesNeedUpdate = true;
	    };
	    CandleWidget.prototype.initObject = function () {
	        this.rect = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial());
	        var lineGeometry = new Geometry();
	        lineGeometry.vertices.push(new Vector3(), new Vector3);
	        this.line = new Line(lineGeometry, new LineBasicMaterial({ linewidth: 1 }));
	        this.rect.add(this.line);
	    };
	    return CandleWidget;
	}());


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Utils_1 = __webpack_require__(14);
	var Mesh = THREE.Mesh;
	var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
	var MeshBasicMaterial = THREE.MeshBasicMaterial;
	var TrendsWidget_1 = __webpack_require__(26);
	var Trend_1 = __webpack_require__(17);
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
	        this.initObject();
	        if (state.data.animations.enabled) {
	            this.animate();
	        }
	    }
	    TrendBeacon.widgetIsEnabled = function (trendOptions) {
	        return trendOptions.enabled && trendOptions.hasBeacon && trendOptions.type == Trend_1.TREND_TYPE.LINE;
	    };
	    TrendBeacon.prototype.getObject3D = function () {
	        return this.mesh;
	    };
	    TrendBeacon.prototype.onTrendChange = function () {
	        this.updatePosition();
	    };
	    TrendBeacon.prototype.bindEvents = function () {
	        var _this = this;
	        _super.prototype.bindEvents.call(this);
	        this.bindEvent(this.chartState.onScroll(function () { return _this.updatePosition(); }));
	        this.bindEvent(this.chartState.onChange(function (changedProps) { return _this.onStateChange(changedProps); }));
	        this.bindEvent(this.chartState.onDestroy(function () { return _this.stopAnimation(); }));
	    };
	    TrendBeacon.prototype.initObject = function () {
	        // add beacon
	        var light = this.mesh = new Mesh(new PlaneBufferGeometry(32, 32), new MeshBasicMaterial({ map: TrendBeacon.createTexture(), transparent: true }));
	        light.scale.set(0.2, 0.2, 1);
	        // add dot
	        light.add(new Mesh(new PlaneBufferGeometry(5, 5), new MeshBasicMaterial({ map: TrendBeacon.createTexture() })));
	        this.segment = this.trend.segments.getEndSegment();
	    };
	    TrendBeacon.prototype.animate = function () {
	        var _this = this;
	        this.animated = true;
	        var object = this.mesh;
	        var animationObject = {
	            scale: object.scale.x,
	            opacity: object.material.opacity
	        };
	        this.mesh.scale.set(0.1, 0.1, 1);
	        setTimeout(function () {
	            var animation = _this.animation = TweenLite.to(animationObject, 1, { scale: 1, opacity: 0 });
	            animation.eventCallback('onUpdate', function () {
	                object.scale.set(animationObject.scale, animationObject.scale, 1);
	                object.material.opacity = animationObject.opacity;
	            }).eventCallback('onComplete', function () {
	                _this.animation && animation.restart();
	            });
	        }, 500);
	    };
	    TrendBeacon.prototype.stopAnimation = function () {
	        this.animated = false;
	        this.animation && this.animation.kill();
	        this.animation = null;
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
	        this.segment = this.trend.segments.getEndSegment();
	        this.updatePosition();
	    };
	    TrendBeacon.prototype.onSegmentsAnimate = function (trendsSegments) {
	        this.segment = trendsSegments.getEndSegment();
	        this.updatePosition();
	    };
	    TrendBeacon.prototype.onStateChange = function (changedProps) {
	        if (!changedProps.animations)
	            return;
	        if (changedProps.animations.enabled == void 0 || changedProps.animations.enabled == this.animated)
	            return;
	        if (changedProps.animations.enabled) {
	            this.animate();
	        }
	        else {
	            this.stopAnimation();
	        }
	    };
	    TrendBeacon.prototype.updatePosition = function () {
	        var state = this.chartState;
	        var xVal, yVal;
	        var currentAnimationState = this.segment.currentAnimationState;
	        if (this.trend.getOptions().type == Trend_1.TREND_TYPE.LINE) {
	            xVal = currentAnimationState.endXVal;
	            yVal = currentAnimationState.endYVal;
	        }
	        else {
	            xVal = currentAnimationState.xVal;
	            yVal = currentAnimationState.endYVal;
	        }
	        var endPointVector = state.screen.getPointOnChart(xVal, yVal);
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


/***/ }
/******/ ]);
//# sourceMappingURL=simpleDemo.js.map