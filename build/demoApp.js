(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(); else if (typeof define === "function" && define.amd) define([], factory); else if (typeof exports === "object") exports["THREE_CHARTS"] = factory(); else root["THREE_CHARTS"] = factory();
})(this, function() {
    return function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                exports: {},
                id: moduleId,
                loaded: false
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.loaded = true;
            return module.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.p = "";
        return __webpack_require__(0);
    }([ function(module, exports, __webpack_require__) {
        "use strict";
        var src_1 = __webpack_require__(1);
        var chart;
        var DataSourse = function() {
            function DataSourse() {
                this.data = [];
                var sec = 0;
                var val = 70;
                this.startTime = Date.now();
                while (sec < 100) {
                    this.data.push({
                        xVal: this.startTime + sec * 1e3,
                        yVal: val
                    });
                    val += Math.random() * 14 - 7;
                    sec++;
                }
                this.endTime = this.data[this.data.length - 1].xVal;
            }
            DataSourse.prototype.getData = function() {
                return src_1.Utils.deepCopy(this.data);
            };
            DataSourse.prototype.getNext = function() {
                var lastVal = this.data[this.data.length - 1];
                var yVal = lastVal.yVal + Math.random() * 14 - 7;
                var xVal = this.endTime + 1e3;
                this.endTime = xVal;
                var item = {
                    xVal: xVal,
                    yVal: yVal
                };
                this.data.push(item);
                return item;
            };
            DataSourse.prototype.getPrev = function() {
                var firstVal = this.data[0];
                var yVal = firstVal.yVal + Math.random() * 14 - 7;
                var xVal = this.startTime - 1e3;
                this.startTime = xVal;
                var item = {
                    xVal: xVal,
                    yVal: yVal
                };
                this.data.unshift(item);
                return item;
            };
            return DataSourse;
        }();
        window.onload = function() {
            initListeners();
            var dsMain = new DataSourse();
            var dsRed = new DataSourse();
            var dsBlue = new DataSourse();
            var now = Date.now();
            chart = new src_1.ChartView({
                yAxis: {
                    marks: [ {
                        value: dsMain.data[0].yVal,
                        name: "openprice",
                        title: "OPEN PRICE",
                        lineColor: "#29874b",
                        stickToEdges: true
                    } ],
                    range: {
                        padding: {
                            end: 100,
                            start: 100
                        },
                        margin: {
                            end: 50,
                            start: 50
                        },
                        zeroVal: 70
                    }
                },
                xAxis: {
                    dataType: src_1.AXIS_DATA_TYPE.DATE,
                    range: {
                        type: src_1.AXIS_RANGE_TYPE.FIXED,
                        from: Date.now(),
                        to: Date.now() + 2e4,
                        padding: {
                            end: 200,
                            start: 0
                        },
                        maxLength: 5e6,
                        minLength: 5e3
                    },
                    marks: [ {
                        value: dsMain.endTime + 3e4,
                        name: "deadline",
                        title: "DEADLINE",
                        lineColor: "#ff6600",
                        type: "timeleft",
                        showValue: true
                    }, {
                        value: dsMain.endTime + 4e4,
                        name: "close",
                        title: "CLOSE",
                        lineColor: "#005187",
                        type: "timeleft",
                        showValue: true
                    } ]
                },
                trends: {
                    main: {
                        type: src_1.TREND_TYPE.LINE,
                        dataset: dsMain.getData(),
                        hasBeacon: true,
                        hasIndicator: true,
                        hasBackground: true
                    }
                },
                showStats: true,
                trendDefaultState: {
                    settingsForTypes: {
                        LINE: {
                            minSegmentLengthInPx: 10
                        }
                    }
                }
            }, document.querySelector(".chart"));
            chart.setState({
                animations: {
                    enabled: false
                }
            });
            chart.setState({
                animations: {
                    enabled: true
                }
            });
            window["chart"] = chart;
            var mainTrend = chart.getTrend("main");
            var deadlineMark = chart.chart.xAxisMarks.getItem("deadline");
            var closeMark = chart.chart.xAxisMarks.getItem("close");
            mainTrend.onDataChange(function() {
                var closeValue = closeMark.options.value;
                if (mainTrend.getLastItem().xVal >= closeValue) {
                    deadlineMark.setOptions({
                        value: closeValue + 1e4
                    });
                    closeMark.setOptions({
                        value: closeValue + 2e4
                    });
                }
            });
            var i = 0;
            chart.getTrend("main").onPrependRequest(function(requestedLength, resolve, reject) {
                var responseData = [];
                var ticksCount = Math.round(requestedLength / 1e3);
                while (ticksCount--) responseData.unshift(dsMain.getPrev());
                setTimeout(function() {
                    resolve(responseData);
                }, 2e3);
            });
            setInterval(function() {
                i++;
                var val = dsMain.getNext();
                chart.getTrend("main").appendData([ val ]);
            }, 1e3);
        };
        function initListeners() {
            var $checkboxMaintrend = document.querySelector('input[name="maintrend"]');
            $checkboxMaintrend.addEventListener("change", function() {
                chart.setState({
                    trends: {
                        main: {
                            enabled: $checkboxMaintrend.checked
                        }
                    }
                });
            });
            var $checkboxRedtrend = document.querySelector('input[name="redtrend"]');
            $checkboxRedtrend.addEventListener("change", function() {
                chart.setState({
                    trends: {
                        red: {
                            enabled: $checkboxRedtrend.checked
                        }
                    }
                });
            });
            var $checkboxBluetrend = document.querySelector('input[name="bluetrend"]');
            $checkboxBluetrend.addEventListener("change", function() {
                chart.setState({
                    trends: {
                        blue: {
                            enabled: $checkboxBluetrend.checked
                        }
                    }
                });
            });
            var $switchLineBtn = document.querySelector('[name="switch-line"]');
            $switchLineBtn.addEventListener("click", function() {
                chart.getTrend("main").setOptions({
                    type: src_1.TREND_TYPE.LINE
                });
            });
            var $switchBarsBtn = document.querySelector('[name="switch-bars"]');
            $switchBarsBtn.addEventListener("click", function() {
                chart.getTrend("main").setOptions({
                    type: src_1.TREND_TYPE.CANDLE
                });
            });
            document.querySelector('[name="move-left"]').addEventListener("click", function() {
                var currentRange = chart.chart.state.xAxis.range;
                chart.setState({
                    xAxis: {
                        range: {
                            from: currentRange.from - 2e3
                        }
                    }
                });
            });
            document.querySelector('[name="move-right"]').addEventListener("click", function() {
                var currentRange = chart.chart.state.xAxis.range;
                chart.setState({
                    xAxis: {
                        range: {
                            to: currentRange.to + 2e3
                        }
                    }
                });
            });
            var timeframeButtons = document.querySelectorAll(".timeframe");
            for (var i = 0; i < timeframeButtons.length; i++) {
                timeframeButtons[i].addEventListener("click", function() {
                    var range = Number(this.getAttribute("data-range"));
                    var segmentLength = Number(this.getAttribute("data-segment-length"));
                    chart.chart.setState({
                        autoScroll: false
                    });
                    chart.chart.zoomToRange(range);
                    chart.chart.scrollToEnd().then(function() {
                        chart.chart.setState({
                            autoScroll: true
                        });
                    });
                });
            }
        }
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function __export(m) {
            for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
        }
        __export(__webpack_require__(2));
        __export(__webpack_require__(19));
        __export(__webpack_require__(18));
        __export(__webpack_require__(17));
        __export(__webpack_require__(13));
        __export(__webpack_require__(14));
        __export(__webpack_require__(15));
        __export(__webpack_require__(16));
        __export(__webpack_require__(4));
        __export(__webpack_require__(20));
        __export(__webpack_require__(3));
        __export(__webpack_require__(23));
        __export(__webpack_require__(30));
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Plugin_1 = __webpack_require__(3);
        __webpack_require__(5);
        var PerspectiveCamera = THREE.PerspectiveCamera;
        var Chart_1 = __webpack_require__(13);
        var Widget_1 = __webpack_require__(20);
        var Utils_1 = __webpack_require__(4);
        var AxisWidget_1 = __webpack_require__(21);
        var GridWidget_1 = __webpack_require__(22);
        var TrendsGradientWidget_1 = __webpack_require__(24);
        var TrendsLineWidget_1 = __webpack_require__(26);
        var TrendsCandleWidget_1 = __webpack_require__(27);
        var deps_1 = __webpack_require__(28);
        var Color_1 = __webpack_require__(23);
        var AxisMarksWidget_1 = __webpack_require__(29);
        var ChartBlankView = function() {
            function ChartBlankView(state, $container, pluginsAndWidgets) {
                var _this = this;
                if (pluginsAndWidgets === void 0) {
                    pluginsAndWidgets = [];
                }
                this.widgets = [];
                if (!THREE || !THREE.REVISION) Utils_1.Utils.error("three.js not found");
                if (!$container) {
                    Utils_1.Utils.error("$el must be set");
                }
                var style = getComputedStyle($container);
                state.width = parseInt(style.width);
                state.height = parseInt(style.height);
                var plugins = pluginsAndWidgets.filter(function(pluginOrWidget) {
                    return pluginOrWidget instanceof Plugin_1.ChartPlugin;
                });
                this.chart = new Chart_1.Chart(state, plugins);
                this.pluginsAndWidgets = pluginsAndWidgets;
                this.zoomThrottled = Utils_1.Utils.throttle(function(zoomValue, origin) {
                    return _this.zoom(zoomValue, origin);
                }, 200);
                this.$container = $container;
                this.init($container);
            }
            ChartBlankView.prototype.init = function($container) {
                var chart = this.chart;
                var _a = chart.state, w = _a.width, h = _a.height, showStats = _a.showStats, autoRender = _a.autoRender;
                this.scene = new THREE.Scene();
                this.isStopped = !autoRender.enabled;
                var renderer = this.renderer = new ChartView.renderers[this.chart.state.renderer]({
                    antialias: true,
                    alpha: true
                });
                var backgroundColor = new Color_1.ChartColor(chart.state.backgroundColor);
                renderer.setSize(w, h);
                renderer.setPixelRatio(ChartView.devicePixelRatio);
                renderer.setClearColor(backgroundColor.value, backgroundColor.a);
                $container.appendChild(renderer.domElement);
                this.$el = renderer.domElement;
                this.$el.style.display = "block";
                if (showStats) {
                    this.stats = new Stats();
                    $container.appendChild(this.stats.domElement);
                }
                this.setupCamera();
                this.initWidgets();
                this.bindEvents();
                this.renderLoop();
            };
            ChartBlankView.prototype.initWidgets = function() {
                var _this = this;
                var preinstalledWidgetsClasses = this.constructor.preinstalledWidgets;
                var customWidgets = [];
                this.pluginsAndWidgets.forEach(function(pluginOrWidget) {
                    if (pluginOrWidget instanceof Widget_1.ChartWidget) {
                        customWidgets.push(pluginOrWidget);
                        return;
                    }
                    if (!(pluginOrWidget instanceof Plugin_1.ChartPlugin)) return;
                    var pluginWidgetClasses = pluginOrWidget.constructor.providedWidgets;
                    preinstalledWidgetsClasses.push.apply(preinstalledWidgetsClasses, pluginWidgetClasses);
                });
                this.widgets = customWidgets.concat(preinstalledWidgetsClasses.map(function(WidgetClass) {
                    return new WidgetClass();
                }));
                this.widgets.forEach(function(widget) {
                    widget.setupChart(_this.chart);
                    widget.onReadyHandler();
                    _this.scene.add(widget.getObject3D());
                });
            };
            ChartBlankView.prototype.renderLoop = function() {
                var _this = this;
                if (this.isDestroyed) return;
                this.stats && this.stats.begin();
                this.render();
                if (this.isStopped) return;
                var fpsLimit = this.chart.state.autoRender.fps;
                if (fpsLimit) {
                    var delay_1 = 1e3 / fpsLimit;
                    setTimeout(function() {
                        return requestAnimationFrame(function() {
                            return _this.renderLoop();
                        });
                    }, delay_1);
                } else {
                    requestAnimationFrame(function() {
                        return _this.renderLoop();
                    });
                }
                this.stats && this.stats.end();
            };
            ChartBlankView.prototype.render = function() {
                this.renderer.render(this.scene, this.camera);
            };
            ChartBlankView.prototype.stop = function() {
                this.isStopped = true;
            };
            ChartBlankView.prototype.run = function() {
                this.isStopped = false;
                this.renderLoop();
            };
            ChartBlankView.prototype.destroy = function() {
                this.isDestroyed = true;
                this.stop();
                this.chart.destroy();
                this.unbindEvents();
                try {
                    this.renderer.forceContextLoss();
                } catch (wtf) {}
                this.renderer.context = null;
                this.renderer.domElement = null;
                this.renderer = null;
            };
            ChartBlankView.prototype.getState = function() {
                return this.chart.state;
            };
            ChartBlankView.prototype.getTrend = function(trendName) {
                return this.chart.getTrend(trendName);
            };
            ChartBlankView.prototype.setState = function(state) {
                return this.chart.setState(state);
            };
            ChartBlankView.prototype.bindEvents = function() {
                var _this = this;
                var $el = this.$el;
                if (this.chart.state.controls.enabled) {
                    $el.addEventListener("mousewheel", function(ev) {
                        _this.onMouseWheel(ev);
                    });
                    $el.addEventListener("mousemove", function(ev) {
                        _this.onMouseMove(ev);
                    });
                    $el.addEventListener("mousedown", function(ev) {
                        return _this.onMouseDown(ev);
                    });
                    $el.addEventListener("mouseup", function(ev) {
                        return _this.onMouseUp(ev);
                    });
                    $el.addEventListener("touchmove", function(ev) {
                        _this.onTouchMove(ev);
                    });
                    $el.addEventListener("touchend", function(ev) {
                        _this.onTouchEnd(ev);
                    });
                }
                if (this.chart.state.autoResize) {
                    this.resizeSensor = new deps_1.ResizeSensor(this.$container, function() {
                        _this.onChartContainerResizeHandler(_this.$container.clientWidth, _this.$container.clientHeight);
                    });
                }
                this.unsubscribers = [ this.chart.onTrendsChange(function() {
                    return _this.autoscroll();
                }), this.chart.screen.onTransformationFrame(function(options) {
                    return _this.onScreenTransformHandler(options);
                }), this.chart.onResize(function(options) {
                    return _this.onChartResize();
                }) ];
            };
            ChartBlankView.prototype.unbindEvents = function() {
                try {
                    this.resizeSensor && this.resizeSensor.detach();
                } catch (e) {}
                this.$el.remove();
                this.unsubscribers.forEach(function(unsubscribe) {
                    return unsubscribe();
                });
            };
            ChartBlankView.prototype.setupCamera = function() {
                var camSettings = this.chart.screen.getCameraSettings();
                if (!this.camera) {
                    this.camera = new PerspectiveCamera(camSettings.FOV, camSettings.aspect, camSettings.near, camSettings.far);
                    this.scene.add(this.camera);
                } else {
                    this.camera.fov = camSettings.FOV;
                    this.camera.aspect = camSettings.aspect;
                    this.camera.far = camSettings.far;
                    this.camera.near = camSettings.near;
                    this.camera.updateProjectionMatrix();
                }
                this.camera.position.set(camSettings.x, camSettings.y, camSettings.z);
                this.cameraInitialPosition = this.camera.position.clone();
                this.onScreenTransformHandler(this.chart.screen.options);
            };
            ChartBlankView.prototype.onScreenTransformHandler = function(options) {
                if (options.scrollX != void 0) {
                    var scrollX_1 = this.cameraInitialPosition.x + options.scrollX;
                    this.camera.position.setX(scrollX_1);
                }
                if (options.scrollY != void 0) {
                    var scrollY_1 = this.cameraInitialPosition.y + options.scrollY;
                    this.camera.position.setY(scrollY_1);
                }
            };
            ChartBlankView.prototype.autoscroll = function() {
                var state = this.chart;
                if (!state.state.autoScroll) return;
                var oldTrendsMaxX = state.state.prevState.computedData.trends.maxXVal;
                var trendsMaxXDelta = state.state.computedData.trends.maxXVal - oldTrendsMaxX;
                if (trendsMaxXDelta > 0) {
                    var maxVisibleX = this.chart.screen.getScreenRightVal();
                    var paddingRightX = this.chart.getPaddingRight();
                    var currentScroll = state.state.xAxis.range.scroll;
                    if (oldTrendsMaxX < paddingRightX || oldTrendsMaxX > maxVisibleX) {
                        return;
                    }
                    var scrollDelta = trendsMaxXDelta;
                    this.setState({
                        xAxis: {
                            range: {
                                scroll: currentScroll + scrollDelta
                            }
                        }
                    });
                }
            };
            ChartBlankView.prototype.onScrollStop = function() {};
            ChartBlankView.prototype.onMouseDown = function(ev) {
                this.setState({
                    cursor: {
                        dragMode: true,
                        x: ev.clientX,
                        y: ev.clientY
                    }
                });
            };
            ChartBlankView.prototype.onMouseUp = function(ev) {
                this.setState({
                    cursor: {
                        dragMode: false
                    }
                });
            };
            ChartBlankView.prototype.onMouseMove = function(ev) {
                if (this.chart.state.cursor.dragMode) {
                    this.setState({
                        cursor: {
                            dragMode: true,
                            x: ev.clientX,
                            y: ev.clientY
                        }
                    });
                }
            };
            ChartBlankView.prototype.onMouseWheel = function(ev) {
                ev.stopPropagation();
                ev.preventDefault();
                var zoomOrigin = ev.layerX / this.chart.state.width;
                var zoomValue = 1 + ev.wheelDeltaY * .001;
                this.zoom(zoomValue, zoomOrigin);
            };
            ChartBlankView.prototype.onTouchMove = function(ev) {
                this.setState({
                    cursor: {
                        dragMode: true,
                        x: ev.touches[0].clientX,
                        y: ev.touches[0].clientY
                    }
                });
            };
            ChartBlankView.prototype.onTouchEnd = function(ev) {
                this.setState({
                    cursor: {
                        dragMode: false
                    }
                });
            };
            ChartBlankView.prototype.onChartContainerResizeHandler = function(width, height) {
                this.setState({
                    width: width,
                    height: height
                });
            };
            ChartBlankView.prototype.onChartResize = function() {
                var _a = this.chart.state, width = _a.width, height = _a.height;
                this.renderer.setSize(width, height);
                this.setupCamera();
            };
            ChartBlankView.prototype.zoom = function(zoomValue, zoomOrigin) {
                var _this = this;
                var MAX_ZOOM_VALUE = 1.5;
                var MIN_ZOOM_VALUE = .7;
                zoomValue = Math.min(zoomValue, MAX_ZOOM_VALUE);
                zoomValue = Math.max(zoomValue, MIN_ZOOM_VALUE);
                var autoScrollIsEnabled = this.chart.state.autoScroll;
                if (autoScrollIsEnabled) this.chart.setState({
                    autoScroll: false
                });
                this.chart.zoom(zoomValue, zoomOrigin).then(function() {
                    if (autoScrollIsEnabled) _this.setState({
                        autoScroll: true
                    });
                });
            };
            ChartBlankView.devicePixelRatio = window.devicePixelRatio;
            ChartBlankView.preinstalledWidgets = [];
            ChartBlankView.renderers = {
                CanvasRenderer: THREE.CanvasRenderer,
                WebGLRenderer: THREE.WebGLRenderer
            };
            return ChartBlankView;
        }();
        exports.ChartBlankView = ChartBlankView;
        var ChartView = function(_super) {
            __extends(ChartView, _super);
            function ChartView() {
                _super.apply(this, arguments);
            }
            ChartView.preinstalledWidgets = [ TrendsLineWidget_1.TrendsLineWidget, TrendsCandleWidget_1.TrendsCandlesWidget, AxisWidget_1.AxisWidget, GridWidget_1.GridWidget, TrendsGradientWidget_1.TrendsGradientWidget, AxisMarksWidget_1.AxisMarksWidget ];
            return ChartView;
        }(ChartBlankView);
        exports.ChartView = ChartView;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Utils_1 = __webpack_require__(4);
        var EventEmmiter_1 = __webpack_require__(12);
        exports.DEFAULT_CONFIG = {
            installPluginWidgets: true
        };
        var ChartPlugin = function() {
            function ChartPlugin(options, config) {
                if (config === void 0) {
                    config = {};
                }
                this.unsubscribers = [];
                this.initialState = options;
                this.config = Utils_1.Utils.deepMerge(exports.DEFAULT_CONFIG, config);
                this.name = this.constructor.NAME;
                if (!this.name) Utils_1.Utils.error("Unnamed plugin detected");
            }
            ChartPlugin.prototype.setupChart = function(chart) {
                var _this = this;
                this.chart = chart;
                this.ee = new EventEmmiter_1.EventEmitter();
                this.bindEvent(this.chart.onInitialStateApplied(function(initialState) {
                    return _this.onInitialStateAppliedHandler(initialState);
                }), this.chart.onReady(function() {
                    return _this.onReadyHandler();
                }), this.chart.onDestroy(function() {
                    return _this.onDestroyHandler();
                }), this.chart.onPluginsStateChange(function(changedPluginsStates) {
                    return changedPluginsStates[_this.name] && _this.onStateChanged(changedPluginsStates[_this.name]);
                }));
            };
            ChartPlugin.prototype.getOptions = function() {
                return this.chart.state.pluginsState[this.name];
            };
            ChartPlugin.prototype.onInitialStateAppliedHandler = function(initialState) {};
            ChartPlugin.prototype.onReadyHandler = function() {};
            ChartPlugin.prototype.onStateChanged = function(changedState) {};
            ChartPlugin.prototype.onDestroyHandler = function() {
                this.ee.removeAllListeners();
            };
            ChartPlugin.prototype.bindEvent = function() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                var unsubscribers = [];
                if (!Array.isArray(args[0])) {
                    unsubscribers.push(args[0]);
                } else {
                    unsubscribers.push.apply(unsubscribers, args);
                }
                (_a = this.unsubscribers).push.apply(_a, unsubscribers);
                var _a;
            };
            ChartPlugin.prototype.unbindEvents = function() {
                this.unsubscribers.forEach(function(unsubscriber) {
                    return unsubscriber();
                });
                this.unsubscribers.length = 0;
            };
            ChartPlugin.NAME = "";
            ChartPlugin.providedWidgets = [];
            return ChartPlugin;
        }();
        exports.ChartPlugin = ChartPlugin;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var deps_1 = __webpack_require__(5);
        function deepmerge(target, src, mergeArrays) {
            if (mergeArrays === void 0) {
                mergeArrays = true;
            }
            var array = Array.isArray(src);
            var dst = array && [] || {};
            if (array) {
                target = target || [];
                if (mergeArrays) {
                    dst = dst.concat(target);
                }
                src.forEach(function(e, i) {
                    if (typeof dst[i] === "undefined") {
                        dst[i] = e;
                    } else if (typeof e === "object") {
                        dst[i] = deepmerge(target[i], e, mergeArrays);
                    } else {
                        if (target.indexOf(e) === -1) {
                            dst.push(e);
                        }
                    }
                });
            } else {
                if (target && typeof target === "object") {
                    Object.keys(target).forEach(function(key) {
                        dst[key] = target[key];
                    });
                }
                Object.keys(src).forEach(function(key) {
                    if (typeof src[key] !== "object" || !src[key]) {
                        dst[key] = src[key];
                    } else {
                        if (!target[key]) {
                            dst[key] = src[key];
                        } else {
                            dst[key] = deepmerge(target[key], src[key], mergeArrays);
                        }
                    }
                });
            }
            return dst;
        }
        var Utils = function() {
            function Utils() {}
            Utils.deepMerge = function(obj1, obj2, mergeArrays) {
                return deepmerge(obj1, obj2, mergeArrays);
            };
            Utils.deepCopy = function(obj) {
                return JSON.parse(JSON.stringify(obj));
            };
            Utils.toFixed = function(num, digitsCount) {
                var maxDigits = 15;
                var result = "";
                var intVal = Math.floor(num);
                var intStr = intVal.toString();
                var lengthDiff = digitsCount - intStr.length;
                if (lengthDiff > 0) {
                    result = "0".repeat(lengthDiff) + intStr;
                } else {
                    result = intStr;
                }
                var afterPointDigitsCount = maxDigits - intStr.length;
                var afterPointStr = num.toString().split(".")[1];
                if (afterPointStr) {
                    result += "." + afterPointStr.substr(0, afterPointDigitsCount);
                }
                return result;
            };
            Utils.bindEvent = function() {};
            Utils.createTexture = function(width, height, fn) {
                var canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
                fn(ctx);
                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                return texture;
            };
            Utils.createPixelPerfectTexture = function(width, height, fn) {
                var texture = this.createTexture(width, height, fn);
                texture.minFilter = THREE.NearestFilter;
                return texture;
            };
            Utils.error = function(msg) {
                console.error("Chart error: " + msg);
                throw "Chart: " + msg;
            };
            Utils.warn = function(msg) {
                console.warn("Chart warning: " + msg);
            };
            Utils.getUid = function() {
                return this.currentId++;
            };
            Utils.getDistance = function(num1, num2) {
                return Math.max(num1, num2) - Math.min(num1, num2);
            };
            Utils.binarySearchClosestInd = function(arr, num, key) {
                var mid;
                var lo = 0;
                var hi = arr.length - 1;
                while (hi - lo > 1) {
                    mid = Math.floor((lo + hi) / 2);
                    if (arr[mid][key] < num) {
                        lo = mid;
                    } else {
                        hi = mid;
                    }
                }
                if (num - arr[lo][key] <= arr[hi][key] - num) {
                    return lo;
                }
                return hi;
            };
            Utils.binarySearchClosest = function(arr, num, key) {
                var ind = this.binarySearchClosestInd(arr, num, key);
                return arr[ind];
            };
            Utils.rectsIntersect = function(r1, r2) {
                var left1 = r1[0], top1 = r1[1], width1 = r1[2], height1 = r1[3];
                var left2 = r2[0], top2 = r2[1], width2 = r2[2], height2 = r2[3];
                var _a = [ left1 + width1, left2 + width2, top1 + height1, top2 + height2 ], right1 = _a[0], right2 = _a[1], bottom1 = _a[2], bottom2 = _a[3];
                return !(left2 > right1 || right2 < left1 || top2 > bottom1 || bottom2 < top1);
            };
            Utils.throttle = function(func, ms) {
                var isThrottled = false, savedArgs, savedThis;
                function wrapper() {
                    if (isThrottled) {
                        savedArgs = arguments;
                        savedThis = this;
                        return;
                    }
                    func.apply(this, arguments);
                    isThrottled = true;
                    setTimeout(function() {
                        isThrottled = false;
                        if (savedArgs) {
                            wrapper.apply(savedThis, savedArgs);
                            savedArgs = savedThis = null;
                        }
                    }, ms);
                }
                return wrapper;
            };
            Utils.msToTimeString = function(timestamp) {
                var h = Math.floor(timestamp / 36e4);
                var m = Math.floor(timestamp / 6e4);
                var s = Math.floor(timestamp / 1e3);
                return h + ":" + m + ":" + s;
            };
            Utils.getRandomItem = function(arr) {
                var ind = Math.floor(Math.random() * arr.length);
                return arr[ind];
            };
            Utils.copyProps = function(srcObject, dstObject, props, excludeProps) {
                if (excludeProps === void 0) {
                    excludeProps = [];
                }
                for (var key in props) {
                    if (excludeProps.indexOf(key) !== -1) continue;
                    if (srcObject[key] == void 0) continue;
                    if (deps_1.isPlainObject(props[key]) && dstObject[key] !== void 0) {
                        this.copyProps(srcObject[key], dstObject[key], props[key]);
                    } else {
                        dstObject[key] = this.deepCopy(srcObject[key]);
                    }
                }
            };
            Utils.currentId = 1;
            return Utils;
        }();
        exports.Utils = Utils;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        window.TweenLite = TweenMax;
        window.Stats = __webpack_require__(6);
        exports.isPlainObject = __webpack_require__(7);
        exports.EE2 = __webpack_require__(9);
        var es6_promise_1 = __webpack_require__(10);
        exports.Promise = es6_promise_1.Promise;
        exports.ResizeSensor = __webpack_require__(11);
    }, function(module, exports) {
        var Stats = function() {
            function h(a) {
                c.appendChild(a.dom);
                return a;
            }
            function k(a) {
                for (var d = 0; d < c.children.length; d++) c.children[d].style.display = d === a ? "block" : "none";
                l = a;
            }
            var l = 0, c = document.createElement("div");
            c.style.cssText = "position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
            c.addEventListener("click", function(a) {
                a.preventDefault();
                k(++l % c.children.length);
            }, !1);
            var g = (performance || Date).now(), e = g, a = 0, r = h(new Stats.Panel("FPS", "#0ff", "#002")), f = h(new Stats.Panel("MS", "#0f0", "#020"));
            if (self.performance && self.performance.memory) var t = h(new Stats.Panel("MB", "#f08", "#201"));
            k(0);
            return {
                REVISION: 16,
                dom: c,
                addPanel: h,
                showPanel: k,
                begin: function() {
                    g = (performance || Date).now();
                },
                end: function() {
                    a++;
                    var c = (performance || Date).now();
                    f.update(c - g, 200);
                    if (c > e + 1e3 && (r.update(1e3 * a / (c - e), 100), e = c, a = 0, t)) {
                        var d = performance.memory;
                        t.update(d.usedJSHeapSize / 1048576, d.jsHeapSizeLimit / 1048576);
                    }
                    return c;
                },
                update: function() {
                    g = this.end();
                },
                domElement: c,
                setMode: k
            };
        };
        Stats.Panel = function(h, k, l) {
            var c = Infinity, g = 0, e = Math.round, a = e(window.devicePixelRatio || 1), r = 80 * a, f = 48 * a, t = 3 * a, u = 2 * a, d = 3 * a, m = 15 * a, n = 74 * a, p = 30 * a, q = document.createElement("canvas");
            q.width = r;
            q.height = f;
            q.style.cssText = "width:80px;height:48px";
            var b = q.getContext("2d");
            b.font = "bold " + 9 * a + "px Helvetica,Arial,sans-serif";
            b.textBaseline = "top";
            b.fillStyle = l;
            b.fillRect(0, 0, r, f);
            b.fillStyle = k;
            b.fillText(h, t, u);
            b.fillRect(d, m, n, p);
            b.fillStyle = l;
            b.globalAlpha = .9;
            b.fillRect(d, m, n, p);
            return {
                dom: q,
                update: function(f, v) {
                    c = Math.min(c, f);
                    g = Math.max(g, f);
                    b.fillStyle = l;
                    b.globalAlpha = 1;
                    b.fillRect(0, 0, r, m);
                    b.fillStyle = k;
                    b.fillText(e(f) + " " + h + " (" + e(c) + "-" + e(g) + ")", t, u);
                    b.drawImage(q, d + a, m, n - a, p, d, m, n - a, p);
                    b.fillRect(d + n - a, m, a, p);
                    b.fillStyle = l;
                    b.globalAlpha = .9;
                    b.fillRect(d + n - a, m, a, e((1 - f / v) * p));
                }
            };
        };
        "object" === typeof module && (module.exports = Stats);
    }, function(module, exports, __webpack_require__) {
        /*!
	 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */
        "use strict";
        var isObject = __webpack_require__(8);
        function isObjectObject(o) {
            return isObject(o) === true && Object.prototype.toString.call(o) === "[object Object]";
        }
        module.exports = function isPlainObject(o) {
            var ctor, prot;
            if (isObjectObject(o) === false) return false;
            ctor = o.constructor;
            if (typeof ctor !== "function") return false;
            prot = ctor.prototype;
            if (isObjectObject(prot) === false) return false;
            if (prot.hasOwnProperty("isPrototypeOf") === false) {
                return false;
            }
            return true;
        };
    }, function(module, exports) {
        /*!
	 * isobject <https://github.com/jonschlinkert/isobject>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */
        "use strict";
        module.exports = function isObject(val) {
            return val != null && typeof val === "object" && !Array.isArray(val);
        };
    }, function(module, exports, __webpack_require__) {
        var __WEBPACK_AMD_DEFINE_RESULT__;
        !function(undefined) {
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
            function searchListenerTree(handlers, type, tree, i) {
                if (!tree) {
                    return [];
                }
                var listeners = [], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached, typeLength = type.length, currentType = type[i], nextType = type[i + 1];
                if (i === typeLength && tree._listeners) {
                    if (typeof tree._listeners === "function") {
                        handlers && handlers.push(tree._listeners);
                        return [ tree ];
                    } else {
                        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
                            handlers && handlers.push(tree._listeners[leaf]);
                        }
                        return [ tree ];
                    }
                }
                if (currentType === "*" || currentType === "**" || tree[currentType]) {
                    if (currentType === "*") {
                        for (branch in tree) {
                            if (branch !== "_listeners" && tree.hasOwnProperty(branch)) {
                                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i + 1));
                            }
                        }
                        return listeners;
                    } else if (currentType === "**") {
                        endReached = i + 1 === typeLength || i + 2 === typeLength && nextType === "*";
                        if (endReached && tree._listeners) {
                            listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
                        }
                        for (branch in tree) {
                            if (branch !== "_listeners" && tree.hasOwnProperty(branch)) {
                                if (branch === "*" || branch === "**") {
                                    if (tree[branch]._listeners && !endReached) {
                                        listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
                                    }
                                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
                                } else if (branch === nextType) {
                                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i + 2));
                                } else {
                                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
                                }
                            }
                        }
                        return listeners;
                    }
                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i + 1));
                }
                xTree = tree["*"];
                if (xTree) {
                    searchListenerTree(handlers, type, xTree, i + 1);
                }
                xxTree = tree["**"];
                if (xxTree) {
                    if (i < typeLength) {
                        if (xxTree._listeners) {
                            searchListenerTree(handlers, type, xxTree, typeLength);
                        }
                        for (branch in xxTree) {
                            if (branch !== "_listeners" && xxTree.hasOwnProperty(branch)) {
                                if (branch === nextType) {
                                    searchListenerTree(handlers, type, xxTree[branch], i + 2);
                                } else if (branch === currentType) {
                                    searchListenerTree(handlers, type, xxTree[branch], i + 1);
                                } else {
                                    isolatedBranch = {};
                                    isolatedBranch[branch] = xxTree[branch];
                                    searchListenerTree(handlers, type, {
                                        "**": isolatedBranch
                                    }, i + 1);
                                }
                            }
                        }
                    } else if (xxTree._listeners) {
                        searchListenerTree(handlers, type, xxTree, typeLength);
                    } else if (xxTree["*"] && xxTree["*"]._listeners) {
                        searchListenerTree(handlers, type, xxTree["*"], typeLength);
                    }
                }
                return listeners;
            }
            function growListenerTree(type, listener) {
                type = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                for (var i = 0, len = type.length; i + 1 < len; i++) {
                    if (type[i] === "**" && type[i + 1] === "**") {
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
                        } else if (typeof tree._listeners === "function") {
                            tree._listeners = [ tree._listeners, listener ];
                        } else if (isArray(tree._listeners)) {
                            tree._listeners.push(listener);
                            if (!tree._listeners.warned) {
                                var m = defaultMaxListeners;
                                if (typeof this._events.maxListeners !== "undefined") {
                                    m = this._events.maxListeners;
                                }
                                if (m > 0 && tree._listeners.length > m) {
                                    tree._listeners.warned = true;
                                    console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", tree._listeners.length);
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
            EventEmitter.prototype.delimiter = ".";
            EventEmitter.prototype.setMaxListeners = function(n) {
                this._events || init.call(this);
                this._events.maxListeners = n;
                if (!this._conf) this._conf = {};
                this._conf.maxListeners = n;
            };
            EventEmitter.prototype.event = "";
            EventEmitter.prototype.once = function(event, fn) {
                this.many(event, 1, fn);
                return this;
            };
            EventEmitter.prototype.many = function(event, ttl, fn) {
                var self = this;
                if (typeof fn !== "function") {
                    throw new Error("many only accepts instances of Function");
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
                if (type === "newListener" && !this.newListener) {
                    if (!this._events.newListener) {
                        return false;
                    }
                }
                if (this._all) {
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                    for (i = 0, l = this._all.length; i < l; i++) {
                        this.event = type;
                        this._all[i].apply(this, args);
                    }
                }
                if (type === "error") {
                    if (!this._all && !this._events.error && !(this.wildcard && this.listenerTree.error)) {
                        if (arguments[1] instanceof Error) {
                            throw arguments[1];
                        } else {
                            throw new Error("Uncaught, unspecified 'error' event.");
                        }
                        return false;
                    }
                }
                var handler;
                if (this.wildcard) {
                    handler = [];
                    var ns = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                    searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
                } else {
                    handler = this._events[type];
                }
                if (typeof handler === "function") {
                    this.event = type;
                    if (arguments.length === 1) {
                        handler.call(this);
                    } else if (arguments.length > 1) switch (arguments.length) {
                      case 2:
                        handler.call(this, arguments[1]);
                        break;

                      case 3:
                        handler.call(this, arguments[1], arguments[2]);
                        break;

                      default:
                        var l = arguments.length;
                        var args = new Array(l - 1);
                        for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                        handler.apply(this, args);
                    }
                    return true;
                } else if (handler) {
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                    var listeners = handler.slice();
                    for (var i = 0, l = listeners.length; i < l; i++) {
                        this.event = type;
                        listeners[i].apply(this, args);
                    }
                    return listeners.length > 0 || !!this._all;
                } else {
                    return !!this._all;
                }
            };
            EventEmitter.prototype.on = function(type, listener) {
                if (typeof type === "function") {
                    this.onAny(type);
                    return this;
                }
                if (typeof listener !== "function") {
                    throw new Error("on only accepts instances of Function");
                }
                this._events || init.call(this);
                this.emit("newListener", type, listener);
                if (this.wildcard) {
                    growListenerTree.call(this, type, listener);
                    return this;
                }
                if (!this._events[type]) {
                    this._events[type] = listener;
                } else if (typeof this._events[type] === "function") {
                    this._events[type] = [ this._events[type], listener ];
                } else if (isArray(this._events[type])) {
                    this._events[type].push(listener);
                    if (!this._events[type].warned) {
                        var m = defaultMaxListeners;
                        if (typeof this._events.maxListeners !== "undefined") {
                            m = this._events.maxListeners;
                        }
                        if (m > 0 && this._events[type].length > m) {
                            this._events[type].warned = true;
                            console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                            console.trace();
                        }
                    }
                }
                return this;
            };
            EventEmitter.prototype.onAny = function(fn) {
                if (typeof fn !== "function") {
                    throw new Error("onAny only accepts instances of Function");
                }
                if (!this._all) {
                    this._all = [];
                }
                this._all.push(fn);
                return this;
            };
            EventEmitter.prototype.addListener = EventEmitter.prototype.on;
            EventEmitter.prototype.off = function(type, listener) {
                if (typeof listener !== "function") {
                    throw new Error("removeListener only takes instances of Function");
                }
                var handlers, leafs = [];
                if (this.wildcard) {
                    var ns = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                    leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
                } else {
                    if (!this._events[type]) return this;
                    handlers = this._events[type];
                    leafs.push({
                        _listeners: handlers
                    });
                }
                for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
                    var leaf = leafs[iLeaf];
                    handlers = leaf._listeners;
                    if (isArray(handlers)) {
                        var position = -1;
                        for (var i = 0, length = handlers.length; i < length; i++) {
                            if (handlers[i] === listener || handlers[i].listener && handlers[i].listener === listener || handlers[i]._origin && handlers[i]._origin === listener) {
                                position = i;
                                break;
                            }
                        }
                        if (position < 0) {
                            continue;
                        }
                        if (this.wildcard) {
                            leaf._listeners.splice(position, 1);
                        } else {
                            this._events[type].splice(position, 1);
                        }
                        if (handlers.length === 0) {
                            if (this.wildcard) {
                                delete leaf._listeners;
                            } else {
                                delete this._events[type];
                            }
                        }
                        return this;
                    } else if (handlers === listener || handlers.listener && handlers.listener === listener || handlers._origin && handlers._origin === listener) {
                        if (this.wildcard) {
                            delete leaf._listeners;
                        } else {
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
                    for (i = 0, l = fns.length; i < l; i++) {
                        if (fn === fns[i]) {
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
                if (this.wildcard) {
                    var ns = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                    var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
                    for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
                        var leaf = leafs[iLeaf];
                        leaf._listeners = null;
                    }
                } else {
                    if (!this._events[type]) return this;
                    this._events[type] = null;
                }
                return this;
            };
            EventEmitter.prototype.listeners = function(type) {
                if (this.wildcard) {
                    var handlers = [];
                    var ns = typeof type === "string" ? type.split(this.delimiter) : type.slice();
                    searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
                    return handlers;
                }
                this._events || init.call(this);
                if (!this._events[type]) this._events[type] = [];
                if (!isArray(this._events[type])) {
                    this._events[type] = [ this._events[type] ];
                }
                return this._events[type];
            };
            EventEmitter.prototype.listenersAny = function() {
                if (this._all) {
                    return this._all;
                } else {
                    return [];
                }
            };
            if (true) {
                !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
                    return EventEmitter;
                }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
            } else if (typeof exports === "object") {
                exports.EventEmitter2 = EventEmitter;
            } else {
                window.EventEmitter2 = EventEmitter;
            }
        }();
    }, function(module, exports) {
        module.exports = {
            Promise: window["Promise"]
        };
    }, function(module, exports) {
        (function() {
            var ResizeSensor = function(element, callback) {
                function EventQueue() {
                    this.q = [];
                    this.add = function(ev) {
                        this.q.push(ev);
                    };
                    var i, j;
                    this.call = function() {
                        for (i = 0, j = this.q.length; i < j; i++) {
                            this.q[i].call();
                        }
                    };
                }
                function getComputedStyle(element, prop) {
                    if (element.currentStyle) {
                        return element.currentStyle[prop];
                    } else if (window.getComputedStyle) {
                        return window.getComputedStyle(element, null).getPropertyValue(prop);
                    } else {
                        return element.style[prop];
                    }
                }
                function attachResizeEvent(element, resized) {
                    if (!element.resizedAttached) {
                        element.resizedAttached = new EventQueue();
                        element.resizedAttached.add(resized);
                    } else if (element.resizedAttached) {
                        element.resizedAttached.add(resized);
                        return;
                    }
                    element.resizeSensor = document.createElement("div");
                    element.resizeSensor.className = "resize-sensor";
                    var style = "position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;";
                    var styleChild = "position: absolute; left: 0; top: 0; transition: 0s;";
                    element.resizeSensor.style.cssText = style;
                    element.resizeSensor.innerHTML = '<div class="resize-sensor-expand" style="' + style + '">' + '<div style="' + styleChild + '"></div>' + "</div>" + '<div class="resize-sensor-shrink" style="' + style + '">' + '<div style="' + styleChild + ' width: 200%; height: 200%"></div>' + "</div>";
                    element.appendChild(element.resizeSensor);
                    if (!{
                        fixed: 1,
                        absolute: 1
                    }[getComputedStyle(element, "position")]) {
                        element.style.position = "relative";
                    }
                    var expand = element.resizeSensor.childNodes[0];
                    var expandChild = expand.childNodes[0];
                    var shrink = element.resizeSensor.childNodes[1];
                    var shrinkChild = shrink.childNodes[0];
                    var lastWidth, lastHeight;
                    var reset = function() {
                        expandChild.style.width = expand.offsetWidth + 10 + "px";
                        expandChild.style.height = expand.offsetHeight + 10 + "px";
                        expand.scrollLeft = expand.scrollWidth;
                        expand.scrollTop = expand.scrollHeight;
                        shrink.scrollLeft = shrink.scrollWidth;
                        shrink.scrollTop = shrink.scrollHeight;
                        lastWidth = element.offsetWidth;
                        lastHeight = element.offsetHeight;
                    };
                    reset();
                    var changed = function() {
                        if (element.resizedAttached) {
                            element.resizedAttached.call();
                        }
                    };
                    var addEvent = function(el, name, cb) {
                        if (el.attachEvent) {
                            el.attachEvent("on" + name, cb);
                        } else {
                            el.addEventListener(name, cb);
                        }
                    };
                    var onScroll = function() {
                        if (element.offsetWidth != lastWidth || element.offsetHeight != lastHeight) {
                            changed();
                        }
                        reset();
                    };
                    addEvent(expand, "scroll", onScroll);
                    addEvent(shrink, "scroll", onScroll);
                }
                var elementType = Object.prototype.toString.call(element);
                var isCollectionTyped = "[object Array]" === elementType || "[object NodeList]" === elementType || "[object HTMLCollection]" === elementType || "undefined" !== typeof jQuery && element instanceof jQuery || "undefined" !== typeof Elements && element instanceof Elements;
                if (isCollectionTyped) {
                    var i = 0, j = element.length;
                    for (;i < j; i++) {
                        attachResizeEvent(element[i], callback);
                    }
                } else {
                    attachResizeEvent(element, callback);
                }
                this.detach = function() {
                    if (isCollectionTyped) {
                        var i = 0, j = element.length;
                        for (;i < j; i++) {
                            ResizeSensor.detach(element[i]);
                        }
                    } else {
                        ResizeSensor.detach(element);
                    }
                };
            };
            ResizeSensor.detach = function(element) {
                if (element.resizeSensor) {
                    element.removeChild(element.resizeSensor);
                    delete element.resizeSensor;
                    delete element.resizedAttached;
                }
            };
            if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
                module.exports = ResizeSensor;
            } else {
                window.ResizeSensor = ResizeSensor;
            }
        })();
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var deps_1 = __webpack_require__(5);
        var EventEmitter = function() {
            function EventEmitter() {
                this.ee = new deps_1.EE2();
            }
            EventEmitter.prototype.emit = function(eventName) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                (_a = this.ee).emit.apply(_a, [ eventName ].concat(args));
                var _a;
            };
            EventEmitter.prototype.on = function(eventName, callback) {
                return this.ee.on(eventName, callback);
            };
            EventEmitter.prototype.off = function(eventName, callback) {
                return this.ee.off(eventName, callback);
            };
            EventEmitter.prototype.subscribe = function(eventName, callback) {
                var _this = this;
                this.on(eventName, callback);
                return function() {
                    return _this.off(eventName, callback);
                };
            };
            EventEmitter.prototype.setMaxListeners = function(listenersCount) {
                this.ee.setMaxListeners(listenersCount);
            };
            EventEmitter.prototype.removeAllListeners = function(eventName) {
                this.ee.removeAllListeners(eventName);
            };
            return EventEmitter;
        }();
        exports.EventEmitter = EventEmitter;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Vector3 = THREE.Vector3;
        var Trend_1 = __webpack_require__(14);
        var EventEmmiter_1 = __webpack_require__(12);
        var Utils_1 = __webpack_require__(4);
        var TrendsManager_1 = __webpack_require__(16);
        var Screen_1 = __webpack_require__(17);
        var AxisMarks_1 = __webpack_require__(18);
        var interfaces_1 = __webpack_require__(19);
        var deps_1 = __webpack_require__(5);
        var CHART_STATE_EVENTS = {
            INITIAL_STATE_APPLIED: "initialStateApplied",
            READY: "ready",
            DESTROY: "destroy",
            CHANGE: "change",
            TREND_CHANGE: "trendChange",
            TRENDS_CHANGE: "trendsChange",
            ZOOM: "zoom",
            RESIZE: "resize",
            SCROLL: "scroll",
            SCROLL_STOP: "scrollStop",
            PLUGINS_STATE_CHANGED: "pluginsStateChanged"
        };
        var LIGHT_BLUE = "#5273bd";
        var Chart = function() {
            function Chart(initialState, plugins) {
                if (plugins === void 0) {
                    plugins = [];
                }
                this.state = {
                    prevState: {},
                    zoom: 0,
                    xAxis: {
                        range: {
                            type: interfaces_1.AXIS_RANGE_TYPE.ALL,
                            from: 0,
                            to: 0,
                            scroll: 0,
                            zoom: 1,
                            padding: {
                                start: 0,
                                end: 5
                            },
                            margin: {
                                start: 0,
                                end: 5
                            }
                        },
                        dataType: interfaces_1.AXIS_DATA_TYPE.NUMBER,
                        grid: {
                            enabled: true,
                            minSizePx: 100,
                            color: "rgba(" + LIGHT_BLUE + ", 0.12)"
                        },
                        autoScroll: true,
                        marks: [],
                        color: LIGHT_BLUE
                    },
                    yAxis: {
                        range: {
                            type: interfaces_1.AXIS_RANGE_TYPE.RELATIVE_END,
                            from: 0,
                            to: 0,
                            zoom: 1,
                            padding: {
                                start: 5,
                                end: 5
                            },
                            margin: {
                                start: 5,
                                end: 5
                            }
                        },
                        grid: {
                            enabled: true,
                            minSizePx: 50,
                            color: "rgba(" + LIGHT_BLUE + ", 0.12)"
                        },
                        dataType: interfaces_1.AXIS_DATA_TYPE.NUMBER,
                        marks: [],
                        color: LIGHT_BLUE
                    },
                    animations: {
                        enabled: true,
                        trendChangeSpeed: .5,
                        trendChangeEase: void 0,
                        zoomSpeed: .25,
                        zoomEase: void 0,
                        scrollSpeed: .5,
                        scrollEase: Linear.easeNone,
                        autoScrollSpeed: 1,
                        autoScrollEase: Linear.easeNone
                    },
                    autoRender: {
                        enabled: true,
                        fps: 0
                    },
                    autoResize: true,
                    renderer: "WebGLRenderer",
                    autoScroll: true,
                    controls: {
                        enabled: true
                    },
                    trendDefaultState: {
                        enabled: true,
                        type: Trend_1.TREND_TYPE.LINE,
                        data: [],
                        maxSegmentLength: 1e3,
                        lineWidth: 2,
                        lineColor: 16777215,
                        hasBackground: true,
                        backgroundColor: "rgba(#FFFFFF, 0.07)",
                        hasBeacon: false,
                        settingsForTypes: {
                            CANDLE: {
                                minSegmentLengthInPx: 20,
                                maxSegmentLengthInPx: 40
                            },
                            LINE: {
                                minSegmentLengthInPx: 2,
                                maxSegmentLengthInPx: 10
                            }
                        }
                    },
                    cursor: {
                        dragMode: false,
                        x: 0,
                        y: 0
                    },
                    font: {
                        s: "11px Arial",
                        m: "12px Arial",
                        l: "13px Arial"
                    },
                    backgroundColor: 3114,
                    showStats: false,
                    pluginsState: {},
                    eventEmitterMaxListeners: 20,
                    maxVisibleSegments: 1280
                };
                this.plugins = {};
                this.isReady = false;
                this.ee = new EventEmmiter_1.EventEmitter();
                this.ee.setMaxListeners(initialState.eventEmitterMaxListeners || this.state.eventEmitterMaxListeners);
                this.state = Utils_1.Utils.deepMerge(this.state, initialState);
                this.trendsManager = new TrendsManager_1.TrendsManager(this, initialState);
                initialState.trends = this.trendsManager.calculatedOptions;
                initialState = this.installPlugins(plugins, initialState);
                this.setState(initialState);
                this.setState({
                    computedData: this.getComputedData()
                });
                this.savePrevState();
                this.screen = new Screen_1.Screen(this);
                this.xAxisMarks = new AxisMarks_1.AxisMarks(this, interfaces_1.AXIS_TYPE.X);
                this.yAxisMarks = new AxisMarks_1.AxisMarks(this, interfaces_1.AXIS_TYPE.Y);
                this.initListeners();
                this.ee.emit(CHART_STATE_EVENTS.INITIAL_STATE_APPLIED, initialState);
                this.isReady = true;
                this.ee.emit(CHART_STATE_EVENTS.READY, initialState);
            }
            Chart.prototype.destroy = function() {
                this.ee.emit(CHART_STATE_EVENTS.DESTROY);
                this.ee.removeAllListeners();
                this.state = {};
            };
            Chart.prototype.onDestroy = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.DESTROY, cb);
            };
            Chart.prototype.onInitialStateApplied = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.INITIAL_STATE_APPLIED, cb);
            };
            Chart.prototype.onReady = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.READY, cb);
            };
            Chart.prototype.onChange = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.CHANGE, cb);
            };
            Chart.prototype.onTrendChange = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.TREND_CHANGE, cb);
            };
            Chart.prototype.onTrendsChange = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.TRENDS_CHANGE, cb);
            };
            Chart.prototype.onScrollStop = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.SCROLL_STOP, cb);
            };
            Chart.prototype.onScroll = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.SCROLL, cb);
            };
            Chart.prototype.onZoom = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.ZOOM, cb);
            };
            Chart.prototype.onResize = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.RESIZE, cb);
            };
            Chart.prototype.onPluginsStateChange = function(cb) {
                return this.ee.subscribe(CHART_STATE_EVENTS.PLUGINS_STATE_CHANGED, cb);
            };
            Chart.prototype.getTrend = function(trendName) {
                return this.trendsManager.getTrend(trendName);
            };
            Chart.prototype.setState = function(newState, eventData, silent) {
                if (silent === void 0) {
                    silent = false;
                }
                var stateData = this.state;
                var newStateObj = newState;
                var changedProps = {};
                for (var key in newStateObj) {
                    if (stateData[key] !== newStateObj[key]) {
                        changedProps[key] = newStateObj[key];
                    }
                }
                this.savePrevState(changedProps);
                var trendsData = {};
                if (newState.trends) for (var trendName in newState.trends) {
                    var trendOptions = newState.trends[trendName];
                    if (trendOptions.data) trendsData[trendName] = trendOptions.data;
                    delete trendOptions.data;
                }
                var newStateContainsData = Object.keys(trendsData).length > 0;
                this.state = Utils_1.Utils.deepMerge(this.state, newState, false);
                if (newStateContainsData) for (var trendName in trendsData) {
                    this.state.trends[trendName].data = trendsData[trendName];
                }
                if (silent) return;
                var recalculateResult = this.recalculateState(changedProps);
                changedProps = recalculateResult.changedProps;
                this.emitChangedStateEvents(changedProps, eventData);
            };
            Chart.prototype.recalculateState = function(changedProps) {
                var data = this.state;
                var patch = {};
                var actualData = Utils_1.Utils.deepMerge({}, data);
                var cursorOptions = changedProps.cursor;
                var isMouseDrag = cursorOptions && data.cursor.dragMode && data.prevState.cursor.dragMode;
                if (isMouseDrag) {
                    var oldX = data.prevState.cursor.x;
                    var currentX = cursorOptions.x;
                    var currentScroll = data.xAxis.range.scroll;
                    var deltaXVal = this.pxToValueByXAxis(oldX - currentX);
                    patch.xAxis = {
                        range: {
                            scroll: currentScroll + deltaXVal
                        }
                    };
                    actualData = Utils_1.Utils.deepMerge(actualData, {
                        xAxis: patch.xAxis
                    });
                }
                var chartWasResized = changedProps.width != void 0 || changedProps.height != void 0;
                var scrollXChanged = false;
                var needToRecalculateXAxis = isMouseDrag || chartWasResized || changedProps.xAxis && changedProps.xAxis.range || this.state.xAxis.range.zeroVal == void 0;
                if (needToRecalculateXAxis) {
                    var xAxisPatch = this.recalculateXAxis(actualData, changedProps);
                    if (xAxisPatch) {
                        scrollXChanged = true;
                        patch = Utils_1.Utils.deepMerge(patch, {
                            xAxis: xAxisPatch
                        });
                        actualData = Utils_1.Utils.deepMerge(actualData, {
                            xAxis: xAxisPatch
                        });
                    }
                }
                var needToRecalculateYAxis = chartWasResized || (data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.RELATIVE_END || data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.AUTO || data.yAxis.range.isMirrorMode) && (scrollXChanged || changedProps.trends || changedProps.yAxis) || this.state.yAxis.range.zeroVal == void 0;
                if (needToRecalculateYAxis) {
                    var yAxisPatch = this.recalculateYAxis(actualData);
                    if (yAxisPatch) {
                        patch = Utils_1.Utils.deepMerge(patch, {
                            yAxis: yAxisPatch
                        });
                        actualData = Utils_1.Utils.deepMerge(actualData, {
                            yAxis: yAxisPatch
                        });
                    }
                }
                this.savePrevState(patch);
                var allChangedProps = Utils_1.Utils.deepMerge(changedProps, patch);
                patch.computedData = this.getComputedData(allChangedProps);
                this.savePrevState(patch);
                this.state = Utils_1.Utils.deepMerge(this.state, patch);
                return {
                    changedProps: allChangedProps,
                    patch: patch
                };
            };
            Chart.prototype.getComputedData = function(changedProps) {
                var computeAll = !changedProps;
                var computedData = {};
                if (computeAll || changedProps.trends && this.trendsManager) {
                    computedData.trends = {
                        maxXVal: this.trendsManager.getEndXVal(),
                        minXVal: this.trendsManager.getStartXVal()
                    };
                }
                return computedData;
            };
            Chart.prototype.savePrevState = function(changedProps) {
                if (!changedProps) changedProps = this.state;
                var prevState = this.state.prevState;
                Utils_1.Utils.copyProps(this.state, prevState, changedProps, [ "trends" ]);
            };
            Chart.prototype.emitChangedStateEvents = function(changedProps, eventData) {
                var prevState = this.state.prevState;
                this.ee.emit(CHART_STATE_EVENTS.CHANGE, changedProps, eventData);
                for (var key in changedProps) {
                    this.ee.emit(key + "Change", changedProps[key], eventData);
                }
                if (!this.isReady) return;
                var scrollStopEventNeeded = changedProps.cursor && changedProps.cursor.dragMode === false && prevState.cursor.dragMode === true;
                scrollStopEventNeeded && this.ee.emit(CHART_STATE_EVENTS.SCROLL_STOP, changedProps);
                var scrollChangeEventsNeeded = changedProps.xAxis && changedProps.xAxis.range && changedProps.xAxis.range.scroll !== void 0;
                scrollChangeEventsNeeded && this.ee.emit(CHART_STATE_EVENTS.SCROLL, changedProps);
                var zoomEventsNeeded = changedProps.xAxis && changedProps.xAxis.range && changedProps.xAxis.range.zoom || changedProps.yAxis && changedProps.yAxis.range && changedProps.yAxis.range.zoom;
                zoomEventsNeeded && this.ee.emit(CHART_STATE_EVENTS.ZOOM, changedProps);
                var resizeEventNeeded = changedProps.width || changedProps.height;
                resizeEventNeeded && this.ee.emit(CHART_STATE_EVENTS.RESIZE, changedProps);
                var pluginStateChangedEventNeeded = !!changedProps.pluginsState;
                pluginStateChangedEventNeeded && this.ee.emit(CHART_STATE_EVENTS.PLUGINS_STATE_CHANGED, changedProps.pluginsState);
            };
            Chart.prototype.installPlugins = function(plugins, initialState) {
                var _this = this;
                initialState.pluginsState = {};
                plugins.forEach(function(plugin) {
                    var PluginClass = plugin.constructor;
                    var pluginName = PluginClass.NAME;
                    initialState.pluginsState[pluginName] = Utils_1.Utils.deepMerge({}, plugin.initialState);
                    _this.plugins[pluginName] = plugin;
                    plugin.setupChart(_this);
                });
                return initialState;
            };
            Chart.prototype.getPlugin = function(pluginName) {
                return this.plugins[pluginName];
            };
            Chart.prototype.initListeners = function() {
                var _this = this;
                this.ee.on(CHART_STATE_EVENTS.TRENDS_CHANGE, function(changedTrends, newData) {
                    _this.handleTrendsChange(changedTrends, newData);
                });
            };
            Chart.prototype.handleTrendsChange = function(changedTrends, newData) {
                for (var trendName in changedTrends) {
                    this.ee.emit(CHART_STATE_EVENTS.TREND_CHANGE, trendName, changedTrends[trendName], newData);
                }
            };
            Chart.prototype.recalculateXAxis = function(actualData, changedProps) {
                var axisRange = actualData.xAxis.range;
                var patch = {
                    range: {}
                };
                var isInitialize = axisRange.zeroVal == void 0;
                var zeroVal, scaleFactor;
                var zoom = axisRange.zoom;
                if (axisRange.isMirrorMode) {
                    Utils_1.Utils.error("range.isMirrorMode available only for yAxis.range");
                }
                if (isInitialize) {
                    zeroVal = axisRange.from;
                    scaleFactor = actualData.width / (axisRange.to - axisRange.from);
                    patch = {
                        range: {
                            zeroVal: zeroVal,
                            scaleFactor: scaleFactor
                        }
                    };
                } else {
                    zeroVal = axisRange.zeroVal;
                    scaleFactor = axisRange.scaleFactor;
                    if (changedProps.xAxis && (changedProps.xAxis.range.from != void 0 || changedProps.xAxis.range.to)) {
                        if (changedProps.xAxis.range.zoom) {
                            Utils_1.Utils.error('Impossible to change "range.zoom" then "range.from" or "range.to" present');
                        }
                        var currentScaleFactor = actualData.width / (axisRange.to - axisRange.from);
                        patch.range.scroll = axisRange.from - zeroVal;
                        patch.range.zoom = currentScaleFactor / scaleFactor;
                        return patch;
                    }
                }
                do {
                    var from = zeroVal + axisRange.scroll;
                    var to = from + actualData.width / (scaleFactor * zoom);
                    var rangeLength = to - from;
                    var needToRecalculateZoom = false;
                    var rangeMoreThenMaxValue = axisRange.maxLength && rangeLength > axisRange.maxLength;
                    var rangeLessThenMinValue = axisRange.minLength && rangeLength < axisRange.minLength;
                    needToRecalculateZoom = rangeMoreThenMaxValue || rangeLessThenMinValue;
                    if (needToRecalculateZoom) {
                        var fixScale = rangeLength > axisRange.maxLength ? rangeLength / axisRange.maxLength : rangeLength / axisRange.minLength;
                        var zoom = zoom * fixScale;
                        patch.range.zoom = zoom;
                    }
                } while (needToRecalculateZoom);
                patch.range.from = from;
                patch.range.to = to;
                return patch;
            };
            Chart.prototype.recalculateYAxis = function(actualData) {
                var patch = {
                    range: {}
                };
                var yAxisRange = actualData.yAxis.range;
                var isInitialize = yAxisRange.scaleFactor == void 0;
                var trends = this.trendsManager;
                var trendsEndXVal = trends.getEndXVal();
                var trendsStartXVal = trends.getStartXVal();
                var xRange = actualData.xAxis.range;
                var xFrom = xRange.from, xTo = xRange.to;
                var xRangeLength = xTo - xFrom;
                var zeroVal, scaleFactor, scroll, zoom, needToZoom;
                if (xTo > trendsEndXVal) {
                    xTo = trendsEndXVal;
                    xFrom = xTo - xRangeLength;
                } else if (xFrom < trendsStartXVal) {
                    xFrom = trendsStartXVal;
                    xTo = xFrom + xRangeLength;
                }
                var maxY = trends.getMaxYVal(xFrom, xTo);
                var minY = trends.getMinYVal(xFrom, xTo);
                var trendLastY = trends.getMaxYVal(trendsEndXVal, trendsEndXVal);
                if (yAxisRange.type == interfaces_1.AXIS_RANGE_TYPE.RELATIVE_END) {
                    if (trendLastY > maxY) maxY = trendLastY;
                    if (trendLastY < minY) minY = trendLastY;
                }
                if (yAxisRange.isMirrorMode) {
                    if (yAxisRange.zeroVal == void 0) Utils_1.Utils.error("range.zeroVal must be set when range.isMirrorMode");
                    var distanceFromZeroValForMaxY = Math.abs(yAxisRange.zeroVal - maxY);
                    var distanceFromZeroValForMinY = Math.abs(yAxisRange.zeroVal - minY);
                    var maxDistanceFromZeroVal = Math.max(distanceFromZeroValForMaxY, distanceFromZeroValForMinY);
                    maxY = yAxisRange.zeroVal + maxDistanceFromZeroVal;
                    minY = yAxisRange.zeroVal - maxDistanceFromZeroVal;
                }
                var margin = yAxisRange.margin;
                var padding = {
                    start: yAxisRange.padding.start + margin.start,
                    end: yAxisRange.padding.end + margin.end
                };
                if (padding.end + padding.start >= actualData.height) {
                    Utils_1.Utils.warn("Sum of padding and margins of yAxi more then available state height. Trends can be rendered incorrectly");
                }
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
                    patch = {
                        range: {
                            zeroVal: zeroVal,
                            scaleFactor: scaleFactor
                        }
                    };
                    needToZoom = true;
                } else {
                    scaleFactor = yAxisRange.scaleFactor;
                    zeroVal = yAxisRange.zeroVal;
                    var maxScreenY = Math.round(this.getScreenYByValue(maxY));
                    var minScreenY = Math.round(this.getScreenYByValue(minY));
                    needToZoom = maxScreenY > actualData.height - margin.end || maxScreenY < actualData.height - padding.end || minScreenY < margin.start || minScreenY > padding.start;
                }
                if (!needToZoom) return null;
                scroll = fromVal - zeroVal;
                zoom = actualData.height / (toVal - fromVal) / scaleFactor;
                var currentAxisRange = this.state.yAxis.range;
                if (currentAxisRange.from !== fromVal) patch.range.from = fromVal;
                if (currentAxisRange.to !== toVal) patch.range.to = toVal;
                if (currentAxisRange.scroll !== scroll) patch.range.scroll = scroll;
                if (currentAxisRange.zoom !== zoom) patch.range.zoom = zoom;
                return patch;
            };
            Chart.prototype.zoom = function(zoomValue, origin) {
                var _this = this;
                if (origin === void 0) {
                    origin = .5;
                }
                var _a = this.state.xAxis.range, zoom = _a.zoom, scroll = _a.scroll, scaleFactor = _a.scaleFactor;
                var newZoom = zoom * zoomValue;
                var currentRange = this.state.width / (scaleFactor * zoom);
                var nextRange = this.state.width / (scaleFactor * newZoom);
                var newScroll = scroll + (currentRange - nextRange) * origin;
                this.setState({
                    xAxis: {
                        range: {
                            zoom: newZoom,
                            scroll: newScroll
                        }
                    }
                });
                return new deps_1.Promise(function(resolve) {
                    var animationTime = _this.state.animations.enabled ? _this.state.animations.zoomSpeed : 0;
                    setTimeout(resolve, animationTime * 1e3);
                });
            };
            Chart.prototype.zoomToRange = function(range, origin) {
                var _a = this.state.xAxis.range, scaleFactor = _a.scaleFactor, zoom = _a.zoom;
                var currentRange = this.state.width / (scaleFactor * zoom);
                return this.zoom(currentRange / range, origin);
            };
            Chart.prototype.scrollToEnd = function() {
                var _this = this;
                var state = this.state;
                var endXVal = this.trendsManager.getEndXVal();
                var range = state.xAxis.range;
                var scroll = endXVal - this.pxToValueByXAxis(state.width) + this.pxToValueByXAxis(range.padding.end) - range.zeroVal;
                this.setState({
                    xAxis: {
                        range: {
                            scroll: scroll
                        }
                    }
                });
                return new deps_1.Promise(function(resolve) {
                    var animationTime = _this.state.animations.enabled ? _this.state.animations.scrollSpeed : 0;
                    setTimeout(resolve, animationTime * 1e3);
                });
            };
            Chart.prototype.getPointOnXAxis = function(xVal) {
                var _a = this.state.xAxis.range, scaleFactor = _a.scaleFactor, zoom = _a.zoom, zeroVal = _a.zeroVal;
                return (xVal - zeroVal) * scaleFactor * zoom;
            };
            Chart.prototype.getPointOnYAxis = function(yVal) {
                var _a = this.state.yAxis.range, scaleFactor = _a.scaleFactor, zoom = _a.zoom, zeroVal = _a.zeroVal;
                return (yVal - zeroVal) * scaleFactor * zoom;
            };
            Chart.prototype.getValueOnXAxis = function(x) {
                return this.state.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
            };
            Chart.prototype.valueToPxByXAxis = function(xVal) {
                return xVal * this.state.xAxis.range.scaleFactor * this.state.xAxis.range.zoom;
            };
            Chart.prototype.valueToPxByYAxis = function(yVal) {
                return yVal * this.state.yAxis.range.scaleFactor * this.state.yAxis.range.zoom;
            };
            Chart.prototype.pxToValueByXAxis = function(xVal) {
                return xVal / this.state.xAxis.range.scaleFactor / this.state.xAxis.range.zoom;
            };
            Chart.prototype.pxToValueByYAxis = function(yVal) {
                return yVal / this.state.yAxis.range.scaleFactor / this.state.yAxis.range.zoom;
            };
            Chart.prototype.getValueByScreenX = function(x) {
                var _a = this.state.xAxis.range, zeroVal = _a.zeroVal, scroll = _a.scroll;
                return zeroVal + scroll + this.pxToValueByXAxis(x);
            };
            Chart.prototype.getValueByScreenY = function(y) {
                var _a = this.state.yAxis.range, zeroVal = _a.zeroVal, scroll = _a.scroll;
                return zeroVal + scroll + this.pxToValueByYAxis(y);
            };
            Chart.prototype.getScreenXByValue = function(xVal) {
                var _a = this.state.xAxis.range, scroll = _a.scroll, zeroVal = _a.zeroVal;
                return this.valueToPxByXAxis(xVal - zeroVal - scroll);
            };
            Chart.prototype.getScreenYByValue = function(yVal) {
                var _a = this.state.yAxis.range, scroll = _a.scroll, zeroVal = _a.zeroVal;
                return this.valueToPxByYAxis(yVal - zeroVal - scroll);
            };
            Chart.prototype.getScreenXByPoint = function(xVal) {
                return this.getScreenXByValue(this.getValueOnXAxis(xVal));
            };
            Chart.prototype.getPointByScreenX = function(screenX) {
                return this.getPointOnXAxis(this.getValueByScreenX(screenX));
            };
            Chart.prototype.getPointOnChart = function(xVal, yVal) {
                return new Vector3(this.getPointOnXAxis(xVal), this.getPointOnYAxis(yVal), 0);
            };
            Chart.prototype.getScreenLeftVal = function() {
                return this.getValueByScreenX(0);
            };
            Chart.prototype.getScreenRightVal = function() {
                return this.getValueByScreenX(this.state.width);
            };
            Chart.prototype.getPaddingRight = function() {
                return this.getValueByScreenX(this.state.width - this.state.xAxis.range.padding.end);
            };
            return Chart;
        }();
        exports.Chart = Chart;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Utils_1 = __webpack_require__(4);
        var TrendSegmentsManager_1 = __webpack_require__(15);
        var EventEmmiter_1 = __webpack_require__(12);
        var deps_1 = __webpack_require__(5);
        var EVENTS = {
            CHANGE: "Change",
            PREPEND_REQUEST: "prependRequest"
        };
        (function(TREND_TYPE) {
            TREND_TYPE[TREND_TYPE["LINE"] = 0] = "LINE";
            TREND_TYPE[TREND_TYPE["CANDLE"] = 1] = "CANDLE";
        })(exports.TREND_TYPE || (exports.TREND_TYPE = {}));
        var TREND_TYPE = exports.TREND_TYPE;
        var Trend = function() {
            function Trend(chartState, trendName, initialState) {
                this.minXVal = Infinity;
                this.minYVal = Infinity;
                this.maxXVal = -Infinity;
                this.maxYVal = -Infinity;
                var options = initialState.trends[trendName];
                this.name = trendName;
                this.chartState = chartState;
                this.calculatedOptions = Utils_1.Utils.deepMerge(this.chartState.state.trendDefaultState, options);
                this.calculatedOptions.name = trendName;
                if (options.dataset) this.calculatedOptions.data = Trend.prepareData(options.dataset);
                this.calculatedOptions.dataset = [];
                this.ee = new EventEmmiter_1.EventEmitter();
                this.bindEvents();
            }
            Trend.prototype.onInitialStateApplied = function() {
                this.segmentsManager = new TrendSegmentsManager_1.TrendSegmentsManager(this.chartState, this);
            };
            Trend.prototype.bindEvents = function() {
                var _this = this;
                var chartState = this.chartState;
                chartState.onInitialStateApplied(function() {
                    return _this.onInitialStateApplied();
                });
                chartState.onScrollStop(function() {
                    return _this.checkForPrependRequest();
                });
                chartState.onZoom(function() {
                    return _this.checkForPrependRequest();
                });
                chartState.onTrendChange(function(trendName, changedOptions, newData) {
                    return _this.ee.emit(EVENTS.CHANGE, changedOptions, newData);
                });
                chartState.onDestroy(function() {
                    return _this.ee.removeAllListeners();
                });
            };
            Trend.prototype.getCalculatedOptions = function() {
                return this.calculatedOptions;
            };
            Trend.prototype.appendData = function(rawData) {
                var options = this.getOptions();
                var newData = Trend.prepareData(rawData, this.getData());
                var updatedTrendData = options.data.concat(newData);
                this.changeData(updatedTrendData, newData);
            };
            Trend.prototype.prependData = function(rawData) {
                var options = this.getOptions();
                var newData = Trend.prepareData(rawData, this.getData(), true);
                var updatedTrendData = newData.concat(options.data);
                this.changeData(updatedTrendData, newData);
            };
            Trend.prototype.changeData = function(allData, newData) {
                for (var _i = 0, newData_1 = newData; _i < newData_1.length; _i++) {
                    var item = newData_1[_i];
                    if (item.xVal < this.minXVal) this.minXVal = item.xVal;
                    if (item.xVal > this.maxXVal) this.maxXVal = item.xVal;
                    if (item.yVal < this.minYVal) this.minYVal = item.yVal;
                    if (item.yVal > this.maxYVal) this.maxYVal = item.yVal;
                }
                var options = this.getOptions();
                var statePatch = {
                    trends: (_a = {}, _a[options.name] = {
                        data: allData
                    }, _a)
                };
                this.chartState.setState(statePatch, newData);
                var _a;
            };
            Trend.prototype.getData = function(fromX, toX) {
                var data = this.getOptions().data;
                if (fromX == void 0 && toX == void 0) return data;
                fromX = fromX !== void 0 ? fromX : data[0].xVal;
                toX = toX !== void 0 ? toX : data[data.length].xVal;
                var filteredData = [];
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var item = data_1[_i];
                    if (item.xVal < fromX) continue;
                    if (item.xVal > toX) break;
                    filteredData.push(item);
                }
                return filteredData;
            };
            Trend.prototype.getFirstItem = function() {
                return this.getOptions().data[0];
            };
            Trend.prototype.getLastItem = function() {
                var data = this.getOptions().data;
                return data[data.length - 1];
            };
            Trend.prototype.getOptions = function() {
                return this.chartState.state.trends[this.name];
            };
            Trend.prototype.setOptions = function(options) {
                this.chartState.setState({
                    trends: (_a = {}, _a[this.name] = options, _a)
                });
                var _a;
            };
            Trend.prototype.onPrependRequest = function(cb) {
                var _this = this;
                this.ee.on(EVENTS.PREPEND_REQUEST, cb);
                return function() {
                    _this.ee.off(EVENTS.PREPEND_REQUEST, cb);
                };
            };
            Trend.prototype.onChange = function(cb) {
                var _this = this;
                this.ee.on(EVENTS.CHANGE, cb);
                return function() {
                    _this.ee.off(EVENTS.CHANGE, cb);
                };
            };
            Trend.prototype.onDataChange = function(cb) {
                var _this = this;
                var onChangeCb = function(changedOptions, newData) {
                    if (newData) cb(newData);
                };
                this.ee.on(EVENTS.CHANGE, onChangeCb);
                return function() {
                    _this.ee.off(EVENTS.CHANGE, onChangeCb);
                };
            };
            Trend.prototype.checkForPrependRequest = function() {
                var _this = this;
                if (this.prependRequest) return;
                var chartState = this.chartState;
                var minXVal = chartState.state.computedData.trends.minXVal;
                var minScreenX = chartState.getScreenXByValue(minXVal);
                var needToRequest = minScreenX > 0;
                var _a = chartState.state.xAxis.range, from = _a.from, to = _a.to;
                var requestedDataLength = to - from;
                if (!needToRequest) return;
                this.prependRequest = new deps_1.Promise(function(resolve, reject) {
                    _this.ee.emit(EVENTS.PREPEND_REQUEST, requestedDataLength, resolve, reject);
                });
                this.prependRequest.then(function(newData) {
                    _this.prependData(newData);
                    _this.prependRequest = null;
                }, function() {
                    _this.prependRequest = null;
                });
            };
            Trend.prepareData = function(newData, currentData, isPrepend) {
                if (isPrepend === void 0) {
                    isPrepend = false;
                }
                var data = [];
                if (typeof newData[0] == "number") {
                    currentData = currentData || [];
                    var initialItem = void 0;
                    var xVal = void 0;
                    if (isPrepend) {
                        initialItem = currentData[0];
                        xVal = initialItem.xVal - newData.length;
                    } else {
                        initialItem = currentData[currentData.length - 1];
                        xVal = initialItem ? initialItem.xVal + 1 : 0;
                    }
                    for (var _i = 0, _a = newData; _i < _a.length; _i++) {
                        var yVal = _a[_i];
                        data.push({
                            xVal: xVal,
                            yVal: yVal,
                            id: Utils_1.Utils.getUid()
                        });
                        xVal++;
                    }
                } else {
                    data = newData;
                }
                return data;
            };
            return Trend;
        }();
        exports.Trend = Trend;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var EventEmmiter_1 = __webpack_require__(12);
        var Vector3 = THREE.Vector3;
        var Trend_1 = __webpack_require__(14);
        var Utils_1 = __webpack_require__(4);
        var MAX_ANIMATED_SEGMENTS = 100;
        var EVENTS = {
            REBUILD: "rebuild",
            DISLPAYED_RANGE_CHANGED: "displayedRangeChanged",
            ANIMATION_FRAME: "animationFrame"
        };
        var TrendSegmentsManager = function() {
            function TrendSegmentsManager(chartState, trend) {
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
                this.ee = new EventEmmiter_1.EventEmitter();
                this.trend = trend;
                this.maxSegmentLength = trend.getOptions().maxSegmentLength;
                this.tryToRebuildSegments();
                this.bindEvents();
            }
            TrendSegmentsManager.prototype.bindEvents = function() {
                var _this = this;
                this.trend.onChange(function(changedOptions, newData) {
                    return _this.onTrendChangeHandler(changedOptions, newData);
                });
                this.chartState.onZoom(function() {
                    return _this.onZoomHandler();
                });
                this.chartState.onScroll(function() {
                    return _this.recalculateDisplayedRange();
                });
                this.chartState.onDestroy(function() {
                    return _this.onDestroyHandler();
                });
            };
            TrendSegmentsManager.prototype.onDestroyHandler = function() {
                this.ee.removeAllListeners();
                this.appendAnimation && this.appendAnimation.kill();
                this.prependAnimation && this.prependAnimation.kill();
            };
            TrendSegmentsManager.prototype.onZoomHandler = function() {
                var segmentsRebuilded = this.tryToRebuildSegments();
                if (!segmentsRebuilded) {
                    this.recalculateDisplayedRange();
                }
            };
            TrendSegmentsManager.prototype.onTrendChangeHandler = function(changedOptions, newData) {
                var needToRebuildSegments = changedOptions.type != void 0 || changedOptions.maxSegmentLength != void 0;
                if (needToRebuildSegments) {
                    this.tryToRebuildSegments(true);
                    return;
                }
                if (!newData) return;
                var data = this.trend.getData();
                var isAppend = !data.length || data[0].xVal < newData[0].xVal;
                isAppend ? this.appendData(newData) : this.prependData(newData);
                this.recalculateDisplayedRange();
            };
            TrendSegmentsManager.prototype.getSegment = function(id) {
                return this.segmentsById[id];
            };
            TrendSegmentsManager.prototype.getEndSegment = function() {
                return this.segmentsById[this.endSegmentId];
            };
            TrendSegmentsManager.prototype.getStartSegment = function() {
                return this.segmentsById[this.startSegmentId];
            };
            TrendSegmentsManager.prototype.tryToRebuildSegments = function(force) {
                if (force === void 0) {
                    force = false;
                }
                var options = this.trend.getOptions();
                var trendTypeName = Trend_1.TREND_TYPE[options.type];
                var trendTypesSettings = options.settingsForTypes;
                var trendTypeSettings = trendTypesSettings[trendTypeName];
                var minSegmentLengthInPx = trendTypeSettings.minSegmentLengthInPx, maxSegmentLengthInPx = trendTypeSettings.maxSegmentLengthInPx;
                var needToRebuild = this.segments.length === 0 || force;
                var segmentLength = this.maxSegmentLength;
                var currentSegmentLengthInPx = Number(this.chartState.valueToPxByXAxis(segmentLength).toFixed(2));
                var currentMaxSegmentLengthInPx = Number(this.chartState.valueToPxByXAxis(this.maxSegmentLength).toFixed(2));
                if (currentSegmentLengthInPx < minSegmentLengthInPx) {
                    needToRebuild = true;
                    segmentLength = Math.ceil(this.chartState.pxToValueByXAxis(maxSegmentLengthInPx));
                } else if (currentMaxSegmentLengthInPx > maxSegmentLengthInPx) {
                    needToRebuild = true;
                    segmentLength = this.chartState.pxToValueByXAxis(minSegmentLengthInPx);
                }
                if (!needToRebuild) return false;
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
                this.ee.emit(EVENTS.REBUILD);
            };
            TrendSegmentsManager.prototype.stopAllAnimations = function() {
                this.animatedSegmentsIds = [];
                this.animatedSegmentsForAppend = [];
                this.animatedSegmentsForAppend = [];
                if (this.prependAnimation) this.prependAnimation.kill();
                if (this.appendAnimation) this.appendAnimation.kill();
            };
            TrendSegmentsManager.prototype.recalculateDisplayedRange = function(segmentsAreRebuilded) {
                if (segmentsAreRebuilded === void 0) {
                    segmentsAreRebuilded = false;
                }
                var _a = this.chartState.state.xAxis.range, from = _a.from, to = _a.to;
                var _b = this, firstDisplayedSegment = _b.firstDisplayedSegment, lastDisplayedSegment = _b.lastDisplayedSegment;
                var displayedRange = to - from;
                this.firstDisplayedSegmentInd = Utils_1.Utils.binarySearchClosestInd(this.segments, from - displayedRange, "startXVal");
                this.firstDisplayedSegment = this.segments[this.firstDisplayedSegmentInd];
                this.lastDisplayedSegmentInd = Utils_1.Utils.binarySearchClosestInd(this.segments, to + displayedRange, "endXVal");
                this.lastDisplayedSegment = this.segments[this.lastDisplayedSegmentInd];
                if (segmentsAreRebuilded) return;
                var displayedRangeChanged = firstDisplayedSegment.id !== this.firstDisplayedSegment.id || lastDisplayedSegment.id !== this.lastDisplayedSegment.id;
                if (displayedRangeChanged) this.ee.emit(EVENTS.DISLPAYED_RANGE_CHANGED);
            };
            TrendSegmentsManager.prototype.getSegmentsForXValues = function(values) {
                var valueInd = 0;
                var value = values[valueInd];
                var lastValueInd = values.length - 1;
                var results = [];
                var segment = this.getStartSegment();
                if (!segment.hasValue) return [];
                while (segment) {
                    while (value < segment.startXVal) {
                        results.push(void 0);
                        value = values[++valueInd];
                    }
                    while (value > segment.endXVal) {
                        segment = segment.getNext();
                        if (!segment) break;
                    }
                    var valueInPoint = segment.startXVal == value || segment.endXVal == value || segment.startXVal < value && segment.endXVal > value;
                    if (valueInPoint) {
                        results.push(segment);
                        value = values[++valueInd];
                    }
                    if (valueInd > lastValueInd) break;
                }
                return results;
            };
            TrendSegmentsManager.prototype.onAnimationFrame = function(cb) {
                return this.ee.subscribe(EVENTS.ANIMATION_FRAME, cb);
            };
            TrendSegmentsManager.prototype.onRebuild = function(cb) {
                return this.ee.subscribe(EVENTS.REBUILD, cb);
            };
            TrendSegmentsManager.prototype.onDisplayedRangeChanged = function(cb) {
                return this.ee.subscribe(EVENTS.DISLPAYED_RANGE_CHANGED, cb);
            };
            TrendSegmentsManager.prototype.allocateNextSegment = function() {
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
            TrendSegmentsManager.prototype.allocatePrevSegment = function() {
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
            TrendSegmentsManager.prototype.appendData = function(newData, needRebuildSegments) {
                if (needRebuildSegments === void 0) {
                    needRebuildSegments = false;
                }
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
                        if (!isLastItem) itemInd++;
                    } else {
                        if (!segment.isCompleted) segment.complete();
                    }
                    if (isLastItem && itemIsInserted) {
                        segment.recalculateItems();
                    }
                    var segmentIsReadyForAnimate = segment.isCompleted || isLastItem && itemIsInserted;
                    if (segmentIsReadyForAnimate) {
                        var id = segment.id;
                        if (!initialSegment) initialSegment = segment;
                        if (!initialAnimationState) initialAnimationState = initialSegment.createAnimationState();
                        segment.initialAnimationState = Utils_1.Utils.deepMerge({}, initialAnimationState);
                        if (this.animatedSegmentsForAppend.length > 0) {
                            segment.initialAnimationState.startXVal = initialAnimationState.endXVal;
                            segment.initialAnimationState.startYVal = initialAnimationState.endYVal;
                        }
                        segment.targetAnimationState = segment.createAnimationState();
                        this.animatedSegmentsForAppend.push(id);
                    }
                    if (isLastItem && itemIsInserted) break;
                    if (!segment.isCompleted) continue;
                    segment = this.allocateNextSegment();
                    var prevItem = trendData[startItemInd + itemInd - 1];
                    segment.appendItem(prevItem);
                }
                var animationsOptions = this.chartState.state.animations;
                var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
                if (needRebuildSegments) {
                    for (var _i = 0, _a = this.animatedSegmentsForAppend; _i < _a.length; _i++) {
                        var segmentId = _a[_i];
                        var segment_1 = this.segmentsById[segmentId];
                        segment_1.currentAnimationState = segment_1.createAnimationState();
                    }
                    this.animatedSegmentsForAppend = [];
                    return;
                }
                if (this.animatedSegmentsForAppend.length > MAX_ANIMATED_SEGMENTS) time = 0;
                this.animate(time);
            };
            TrendSegmentsManager.prototype.prependData = function(newData) {
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
                        if (!isLastItem) itemInd--;
                    } else {
                        if (!segment.isCompleted) segment.complete();
                    }
                    if (isLastItem && itemIsInserted) {
                        segment.recalculateItems();
                    }
                    var segmentIsReadyForAnimate = segment.isCompleted || isLastItem && itemIsInserted;
                    if (segmentIsReadyForAnimate) {
                        var id = segment.id;
                        if (!initialSegment) initialSegment = segment;
                        if (!initialAnimationState) initialAnimationState = initialSegment.createAnimationState();
                        segment.initialAnimationState = Utils_1.Utils.deepMerge({}, initialAnimationState);
                        if (this.animatedSegmentsForPrepend.length > 0) {
                            segment.initialAnimationState.endXVal = initialAnimationState.startXVal;
                            segment.initialAnimationState.endYVal = initialAnimationState.startYVal;
                        }
                        segment.targetAnimationState = segment.createAnimationState();
                        this.animatedSegmentsForPrepend.push(id);
                    }
                    if (isLastItem && itemIsInserted) break;
                    if (!segment.isCompleted) continue;
                    segment = this.allocatePrevSegment();
                    var nextItem = trendData[itemInd + 1];
                    segment.prependItem(nextItem);
                }
                var animationsOptions = this.chartState.state.animations;
                var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
                if (this.animatedSegmentsForPrepend.length > MAX_ANIMATED_SEGMENTS) time = 0;
                this.animate(time, true);
            };
            TrendSegmentsManager.prototype.animate = function(time, isPrepend) {
                var _this = this;
                if (isPrepend === void 0) {
                    isPrepend = false;
                }
                var animatedSegmentsIds = isPrepend ? this.animatedSegmentsForPrepend : this.animatedSegmentsForAppend;
                var animation = isPrepend ? this.prependAnimation : this.appendAnimation;
                if (animation && animation.isActive() || time == 0) {
                    if (animation) animation.kill();
                    this.onAnimationFrameHandler(1, isPrepend);
                    animatedSegmentsIds.length = 0;
                    return;
                }
                var animationsOptions = this.chartState.state.animations;
                var ease = animationsOptions.trendChangeEase;
                var objectToAnimate = {
                    animationValue: 0
                };
                animation = TweenLite.to(objectToAnimate, time, {
                    animationValue: 1,
                    ease: ease
                });
                animation.eventCallback("onUpdate", function() {
                    return _this.onAnimationFrameHandler(objectToAnimate.animationValue, isPrepend);
                });
                animation.eventCallback("onComplete", function() {
                    animatedSegmentsIds.length = 0;
                    _this.appendAnimation = null;
                });
                if (isPrepend) {
                    this.prependAnimation = animation;
                } else {
                    this.appendAnimation = animation;
                }
            };
            TrendSegmentsManager.prototype.onAnimationFrameHandler = function(coefficient, isPrepend) {
                if (isPrepend === void 0) {
                    isPrepend = false;
                }
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
                this.ee.emit(EVENTS.ANIMATION_FRAME, this);
            };
            return TrendSegmentsManager;
        }();
        exports.TrendSegmentsManager = TrendSegmentsManager;
        var TrendSegment = function() {
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
            TrendSegment.prototype.createAnimationState = function() {
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
            TrendSegment.prototype.appendItem = function(item) {
                if (this.isCompleted) return false;
                var items = this.items;
                if (items.length < 2) {
                    this.items.push(item);
                    this.hasValue = true;
                    return true;
                }
                var startXVal = items[0].xVal;
                if (item.xVal - startXVal > this.maxLength) return false;
                items.push(item);
                return true;
            };
            TrendSegment.prototype.prependItem = function(item) {
                if (this.isCompleted) return false;
                var items = this.items;
                if (items.length < 2) {
                    this.items.unshift(item);
                    this.hasValue = true;
                    return true;
                }
                var endXVal = items[items.length - 1].xVal;
                if (endXVal - item.xVal > this.maxLength) return false;
                items.unshift(item);
                return true;
            };
            TrendSegment.prototype.complete = function() {
                this.isCompleted = true;
                this.recalculateItems();
                this.items = [];
            };
            TrendSegment.prototype.recalculateItems = function() {
                var items = this.items;
                var itemsLength = items.length;
                if (itemsLength === 0) Utils_1.Utils.error("Unable to create TrendSegment without TrendItems");
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
                var yVals = items.map(function(item) {
                    return item.yVal;
                });
                this.startXVal = startXVal;
                this.startYVal = startYVal;
                this.endXVal = endXVal;
                this.endYVal = endYVal;
                this.xVal = middleXVal;
                this.yVal = middleYVal;
                this.maxYVal = Math.max.apply(Math, yVals);
                this.minYVal = Math.min.apply(Math, yVals);
                if (!this.currentAnimationState) this.currentAnimationState = this.createAnimationState();
            };
            TrendSegment.prototype.getNext = function() {
                var nextPoint = this.trendSegments.segmentsById[this.nextId];
                return nextPoint && nextPoint.hasValue ? nextPoint : null;
            };
            TrendSegment.prototype.getPrev = function() {
                var prevPoint = this.trendSegments.segmentsById[this.prevId];
                return prevPoint && prevPoint.hasValue ? prevPoint : null;
            };
            TrendSegment.prototype.getFrameVal = function() {
                var _a = this.createAnimationState(), xVal = _a.xVal, yVal = _a.yVal;
                return new Vector3(xVal, yVal, 0);
            };
            TrendSegment.prototype.getFramePoint = function() {
                var frameVal = this.getFrameVal();
                return this.trendSegments.chartState.screen.getPointOnChart(frameVal.x, frameVal.y);
            };
            return TrendSegment;
        }();
        exports.TrendSegment = TrendSegment;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Trend_1 = __webpack_require__(14);
        var EventEmmiter_1 = __webpack_require__(12);
        var EVENTS = {
            SEGMENTS_REBUILDED: "segmentsRebuilded"
        };
        var TrendsManager = function() {
            function TrendsManager(state, initialState) {
                this.trends = {};
                this.ee = new EventEmmiter_1.EventEmitter();
                this.chartState = state;
                var trendsCalculatedOptions = {};
                for (var trendName in initialState.trends) {
                    var trend = this.createTrend(state, trendName, initialState);
                    trendsCalculatedOptions[trendName] = trend.getCalculatedOptions();
                }
                this.calculatedOptions = trendsCalculatedOptions;
                this.bindEvents();
            }
            TrendsManager.prototype.getTrend = function(trendName) {
                return this.trends[trendName];
            };
            TrendsManager.prototype.getEnabledTrends = function() {
                var enabledTrends = [];
                var allTrends = this.trends;
                for (var trendName in allTrends) {
                    var trend = allTrends[trendName];
                    trend.getOptions().enabled && enabledTrends.push(trend);
                }
                return enabledTrends;
            };
            TrendsManager.prototype.getStartXVal = function() {
                var trends = this.getEnabledTrends();
                return trends[0].getData()[0].xVal;
            };
            TrendsManager.prototype.getEndXVal = function() {
                var trends = this.getEnabledTrends();
                var firstTrendData = trends[0].getData();
                return firstTrendData[firstTrendData.length - 1].xVal;
            };
            TrendsManager.prototype.getExtremumYVal = function(extremumIsMax, fromX, toX) {
                var trends = this.getEnabledTrends();
                var compareFn;
                var result;
                if (extremumIsMax) {
                    result = -Infinity;
                    compareFn = Math.max;
                } else {
                    result = Infinity;
                    compareFn = Math.min;
                }
                for (var _i = 0, trends_1 = trends; _i < trends_1.length; _i++) {
                    var trend = trends_1[_i];
                    var trendData = trend.getData(fromX, toX);
                    var trendYValues = trendData.map(function(dataItem) {
                        return dataItem.yVal;
                    });
                    result = compareFn.apply(void 0, [ result ].concat(trendYValues));
                }
                if (result == Infinity || result == -Infinity) result = NaN;
                return result;
            };
            TrendsManager.prototype.getMaxYVal = function(fromX, toX) {
                return this.getExtremumYVal(true, fromX, toX);
            };
            TrendsManager.prototype.getMinYVal = function(fromX, toX) {
                return this.getExtremumYVal(false, fromX, toX);
            };
            TrendsManager.prototype.onSegmentsRebuilded = function(cb) {
                return this.ee.subscribe(EVENTS.SEGMENTS_REBUILDED, cb);
            };
            TrendsManager.prototype.bindEvents = function() {
                var _this = this;
                this.chartState.onInitialStateApplied(function() {
                    return _this.onInitialStateAppliedHandler();
                });
            };
            TrendsManager.prototype.onInitialStateAppliedHandler = function() {
                var _this = this;
                var _loop_1 = function(trendName) {
                    this_1.trends[trendName].segmentsManager.onRebuild(function() {
                        return _this.ee.emit(EVENTS.SEGMENTS_REBUILDED, trendName);
                    });
                };
                var this_1 = this;
                for (var trendName in this.trends) {
                    _loop_1(trendName);
                }
            };
            TrendsManager.prototype.createTrend = function(state, trendName, initialState) {
                var trend = new Trend_1.Trend(state, trendName, initialState);
                this.trends[trendName] = trend;
                return trend;
            };
            return TrendsManager;
        }();
        exports.TrendsManager = TrendsManager;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Vector3 = THREE.Vector3;
        var EventEmmiter_1 = __webpack_require__(12);
        var Screen = function() {
            function Screen(chartState) {
                this.options = {
                    scrollXVal: 0,
                    scrollX: 0,
                    scrollYVal: 0,
                    scrollY: 0,
                    zoomX: 1,
                    zoomY: 1
                };
                this.currentScrollX = {
                    x: 0
                };
                this.currentScrollY = {
                    y: 0
                };
                this.currentZoomX = {
                    val: 1
                };
                this.currentZoomY = {
                    val: 1
                };
                this.chartState = chartState;
                var _a = chartState.state, w = _a.width, h = _a.height;
                this.ee = new EventEmmiter_1.EventEmitter();
                this.transform({
                    scrollY: this.valueToPxByYAxis(this.chartState.state.yAxis.range.scroll),
                    zoomY: 1
                });
                this.bindEvents();
            }
            Screen.prototype.getCameraSettings = function() {
                var _a = this.chartState.state, w = _a.width, h = _a.height;
                var FOV = 75;
                var vFOV = FOV * (Math.PI / 180);
                return {
                    FOV: FOV,
                    aspect: w / h,
                    near: .1,
                    far: 5e3,
                    z: h / (2 * Math.tan(vFOV / 2)),
                    x: w / 2,
                    y: h / 2
                };
            };
            Screen.prototype.onZoomFrame = function(cb) {
                var _this = this;
                var eventName = "zoomFrame";
                this.ee.on(eventName, cb);
                return function() {
                    _this.ee.off(eventName, cb);
                };
            };
            Screen.prototype.onScrollFrame = function(cb) {
                var _this = this;
                var eventName = "scrollFrame";
                this.ee.on(eventName, cb);
                return function() {
                    _this.ee.off(eventName, cb);
                };
            };
            Screen.prototype.onTransformationFrame = function(cb) {
                var _this = this;
                var eventName = "transformationFrame";
                this.ee.on(eventName, cb);
                return function() {
                    _this.ee.off(eventName, cb);
                };
            };
            Screen.prototype.cameraIsMoving = function() {
                return !!(this.scrollXAnimation && this.scrollXAnimation.isActive() || this.zoomXAnimation && this.zoomXAnimation.isActive());
            };
            Screen.prototype.transform = function(options, silent) {
                if (silent === void 0) {
                    silent = false;
                }
                var scrollX = options.scrollX, scrollY = options.scrollY, zoomX = options.zoomX, zoomY = options.zoomY;
                if (scrollX != void 0) this.options.scrollX = scrollX;
                if (scrollY != void 0) this.options.scrollY = scrollY;
                if (zoomX != void 0) this.options.zoomX = zoomX;
                if (zoomY != void 0) this.options.zoomY = zoomY;
                if (scrollX != void 0 || zoomX) {
                    options.scrollXVal = this.pxToValueByXAxis(scrollX != void 0 ? scrollX : this.options.scrollX);
                    this.options.scrollXVal = options.scrollXVal;
                }
                if (scrollY != void 0 || zoomY) {
                    options.scrollYVal = this.pxToValueByYAxis(scrollY != void 0 ? scrollY : this.options.scrollY);
                    this.options.scrollYVal = options.scrollYVal;
                }
                if (silent) return;
                this.ee.emit("transformationFrame", options);
                if (options.scrollXVal != void 0 || options.scrollYVal != void 0) {
                    this.ee.emit("scrollFrame", options);
                }
                if (options.zoomX != void 0 || options.zoomY != void 0) {
                    this.ee.emit("zoomFrame", options);
                }
            };
            Screen.prototype.bindEvents = function() {
                var _this = this;
                var state = this.chartState;
                state.onChange(function(changedProps) {
                    if (changedProps.xAxis && changedProps.xAxis.range) {
                        if (changedProps.xAxis.range.scroll != void 0) _this.onScrollXHandler(changedProps);
                        if (changedProps.xAxis.range.zoom) _this.onZoomXHandler();
                    }
                    if (changedProps.yAxis && changedProps.yAxis.range) {
                        if (changedProps.yAxis.range.scroll != void 0) _this.onScrollYHandler();
                        if (changedProps.yAxis.range.zoom) _this.onZoomYHandler();
                    }
                });
                state.onDestroy(function() {
                    return _this.onDestroyHandler();
                });
            };
            Screen.prototype.onDestroyHandler = function() {
                this.ee.removeAllListeners();
                this.scrollXAnimation && this.scrollXAnimation.kill();
                this.scrollYAnimation && this.scrollYAnimation.kill();
                this.zoomXAnimation && this.zoomXAnimation.kill();
                this.zoomYAnimation && this.zoomYAnimation.kill();
            };
            Screen.prototype.onScrollXHandler = function(changedProps) {
                var _this = this;
                var state = this.chartState;
                var isDragMode = state.state.cursor.dragMode;
                var animations = state.state.animations;
                var canAnimate = animations.enabled && !isDragMode;
                var zoomXChanged = changedProps.xAxis.range.zoom;
                var isAutoscroll = state.state.autoScroll && !isDragMode && !zoomXChanged;
                var time = isAutoscroll ? animations.autoScrollSpeed : animations.zoomSpeed;
                var ease = isAutoscroll ? animations.autoScrollEase : animations.zoomEase;
                if (this.scrollXAnimation) this.scrollXAnimation.pause();
                var range = state.state.xAxis.range;
                var targetX = range.scroll * range.scaleFactor * range.zoom;
                this.currentScrollX.x = this.options.scrollX;
                var cb = function() {
                    _this.transform({
                        scrollX: _this.currentScrollX.x
                    });
                };
                if (canAnimate) {
                    this.scrollXAnimation = TweenLite.to(this.currentScrollX, time, {
                        x: targetX,
                        ease: ease
                    });
                    this.scrollXAnimation.eventCallback("onUpdate", cb);
                } else {
                    this.currentScrollX.x = targetX;
                    cb();
                }
            };
            Screen.prototype.onScrollYHandler = function() {
                var _this = this;
                var state = this.chartState;
                var animations = state.state.animations;
                var canAnimate = animations.enabled;
                var time = animations.zoomSpeed;
                if (this.scrollYAnimation) this.scrollYAnimation.pause();
                var range = state.state.yAxis.range;
                var targetY = range.scroll * range.scaleFactor * range.zoom;
                this.currentScrollY.y = this.options.scrollY;
                var cb = function() {
                    _this.transform({
                        scrollY: _this.currentScrollY.y
                    });
                };
                if (canAnimate) {
                    this.scrollYAnimation = TweenLite.to(this.currentScrollY, time, {
                        y: targetY,
                        ease: animations.zoomEase
                    });
                    this.scrollYAnimation.eventCallback("onUpdate", cb);
                } else {
                    this.currentScrollY.y = targetY;
                    cb();
                }
            };
            Screen.prototype.onZoomXHandler = function() {
                var _this = this;
                var state = this.chartState;
                var animations = state.state.animations;
                var canAnimate = animations.enabled;
                var time = animations.zoomSpeed;
                var targetZoom = state.state.xAxis.range.zoom;
                if (this.zoomXAnimation) this.zoomXAnimation.pause();
                var cb = function() {
                    _this.transform({
                        zoomX: _this.currentZoomX.val
                    });
                };
                if (canAnimate) {
                    this.zoomXAnimation = TweenLite.to(this.currentZoomX, time, {
                        val: targetZoom,
                        ease: animations.zoomEase
                    });
                    this.zoomXAnimation.eventCallback("onUpdate", cb);
                } else {
                    this.currentZoomX.val = targetZoom;
                    cb();
                }
            };
            Screen.prototype.onZoomYHandler = function() {
                var _this = this;
                var state = this.chartState;
                var animations = state.state.animations;
                var canAnimate = animations.enabled;
                var time = animations.zoomSpeed;
                var targetZoom = state.state.yAxis.range.zoom;
                if (this.zoomYAnimation) this.zoomYAnimation.pause();
                var cb = function() {
                    _this.transform({
                        zoomY: _this.currentZoomY.val
                    });
                };
                if (canAnimate) {
                    this.zoomYAnimation = TweenLite.to(this.currentZoomY, time, {
                        val: targetZoom,
                        ease: animations.zoomEase
                    });
                    this.zoomYAnimation.eventCallback("onUpdate", cb);
                } else {
                    this.currentZoomY.val = targetZoom;
                    cb();
                }
            };
            Screen.prototype.getPointOnXAxis = function(xVal) {
                var _a = this.chartState.state.xAxis.range, scaleFactor = _a.scaleFactor, zeroVal = _a.zeroVal;
                var zoom = this.options.zoomX;
                return (xVal - zeroVal) * scaleFactor * zoom;
            };
            Screen.prototype.getPointOnYAxis = function(yVal) {
                var _a = this.chartState.state.yAxis.range, scaleFactor = _a.scaleFactor, zeroVal = _a.zeroVal;
                var zoom = this.options.zoomY;
                return (yVal - zeroVal) * scaleFactor * zoom;
            };
            Screen.prototype.getPointOnChart = function(xVal, yVal) {
                return new Vector3(this.getPointOnXAxis(xVal), this.getPointOnYAxis(yVal), 0);
            };
            Screen.prototype.getValueOnXAxis = function(x) {
                return this.chartState.state.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
            };
            Screen.prototype.valueToPxByXAxis = function(xVal) {
                return xVal * this.chartState.state.xAxis.range.scaleFactor * this.options.zoomX;
            };
            Screen.prototype.valueToPxByYAxis = function(yVal) {
                return yVal * this.chartState.state.yAxis.range.scaleFactor * this.options.zoomY;
            };
            Screen.prototype.pxToValueByXAxis = function(xVal) {
                return xVal / this.chartState.state.xAxis.range.scaleFactor / this.options.zoomX;
            };
            Screen.prototype.pxToValueByYAxis = function(yVal) {
                return yVal / this.chartState.state.yAxis.range.scaleFactor / this.options.zoomY;
            };
            Screen.prototype.getValueByScreenX = function(x) {
                return this.chartState.state.xAxis.range.zeroVal + this.options.scrollXVal + this.pxToValueByXAxis(x);
            };
            Screen.prototype.getValueByScreenY = function(y) {
                return this.chartState.state.yAxis.range.zeroVal + this.options.scrollYVal + this.pxToValueByYAxis(y);
            };
            Screen.prototype.getScreenXByValue = function(xVal) {
                var _a = this.chartState.state.xAxis.range, scroll = _a.scroll, zeroVal = _a.zeroVal;
                return this.valueToPxByXAxis(xVal - zeroVal - scroll);
            };
            Screen.prototype.getScreenXByPoint = function(xVal) {
                return this.getScreenXByValue(this.getValueOnXAxis(xVal));
            };
            Screen.prototype.getPointByScreenX = function(screenX) {
                return this.getPointOnXAxis(this.getValueByScreenX(screenX));
            };
            Screen.prototype.getPointByScreenY = function(screenY) {
                return this.getPointOnYAxis(this.getValueByScreenY(screenY));
            };
            Screen.prototype.getTop = function() {
                return this.getPointByScreenY(this.chartState.state.height);
            };
            Screen.prototype.getBottom = function() {
                return this.getPointByScreenY(0);
            };
            Screen.prototype.getLeft = function() {
                return this.getPointByScreenX(0);
            };
            Screen.prototype.getScreenRightVal = function() {
                return this.getValueByScreenX(this.chartState.state.width);
            };
            Screen.prototype.getTopVal = function() {
                return this.getValueByScreenY(this.chartState.state.height);
            };
            Screen.prototype.getBottomVal = function() {
                return this.getValueByScreenY(0);
            };
            Screen.prototype.getCenterYVal = function() {
                return this.getValueByScreenY(this.chartState.state.height / 2);
            };
            return Screen;
        }();
        exports.Screen = Screen;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Utils_1 = __webpack_require__(4);
        var interfaces_1 = __webpack_require__(19);
        var EventEmmiter_1 = __webpack_require__(12);
        var AXIS_MARK_DEFAULT_OPTIONS = {
            type: "simple",
            lineWidth: 1,
            value: 0,
            showValue: false,
            stickToEdges: false,
            lineColor: "#FFFFFF",
            title: ""
        };
        var AxisMarks = function() {
            function AxisMarks(chartState, axisType) {
                this.items = {};
                this.chartState = chartState;
                this.ee = new EventEmmiter_1.EventEmitter();
                this.axisType = axisType;
                var marks = this.items;
                var axisMarksOptions = axisType == interfaces_1.AXIS_TYPE.X ? chartState.state.xAxis.marks : chartState.state.yAxis.marks;
                for (var _i = 0, axisMarksOptions_1 = axisMarksOptions; _i < axisMarksOptions_1.length; _i++) {
                    var options = axisMarksOptions_1[_i];
                    var axisMark = void 0;
                    options = Utils_1.Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
                    if (!options.name) options.name = Utils_1.Utils.getUid().toString();
                    if (marks[options.name]) Utils_1.Utils.error("duplicated mark name " + options.name);
                    if (options.type == "timeleft") {
                        axisMark = new AxisTimeleftMark(chartState, axisType, options);
                    } else {
                        axisMark = new AxisMark(chartState, axisType, options);
                    }
                    marks[options.name] = axisMark;
                }
                this.bindEvents();
            }
            AxisMarks.prototype.bindEvents = function() {
                var _this = this;
                this.chartState.onTrendChange(function(trendName, changedOptions, newData) {
                    _this.onTrendChange(trendName, newData);
                });
                this.chartState.onDestroy(function() {
                    return _this.ee.removeAllListeners();
                });
            };
            AxisMarks.prototype.onTrendChange = function(trendName, newData) {
                if (!newData) return;
                var startVal = newData[0].xVal;
                var endVal = newData[newData.length - 1].xVal;
                var marks = this.items;
                for (var markName in marks) {
                    var mark = marks[markName];
                    var markVal = mark.options.value;
                    var markWasCrossed = startVal == markVal || endVal == markVal || startVal < markVal && endVal > markVal;
                    if (markWasCrossed) this.ee.emit("markCrossed", trendName, newData);
                }
            };
            AxisMarks.prototype.getItems = function() {
                return this.items;
            };
            AxisMarks.prototype.getItem = function(markName) {
                return this.items[markName];
            };
            return AxisMarks;
        }();
        exports.AxisMarks = AxisMarks;
        var AxisMark = function() {
            function AxisMark(chartState, axisType, options) {
                this.renderOnTrendsChange = false;
                this.ee = new EventEmmiter_1.EventEmitter();
                this.options = options;
                this.axisType = axisType;
                this.chartState = chartState;
                this.bindEvents();
            }
            AxisMark.prototype.bindEvents = function() {};
            AxisMark.prototype.setOptions = function(newOptions) {
                var value = this.options.value;
                this.options = Utils_1.Utils.deepMerge(this.options, newOptions);
                if (this.options.value !== value) this.ee.emit("valueChange");
                this.ee.emit("onDisplayedValueChange");
            };
            AxisMark.prototype.getDisplayedVal = function() {
                var _a = this.options, value = _a.value, displayedValue = _a.displayedValue;
                return String(displayedValue !== void 0 ? displayedValue : value);
            };
            AxisMark.prototype.onMarkCrossed = function(cb) {
                var _this = this;
                this.ee.on("markCrossed", cb);
                return function() {
                    _this.ee.off("markCrossed", cb);
                };
            };
            AxisMark.prototype.onValueChange = function(cb) {
                var _this = this;
                this.ee.on("valueChange", cb);
                return function() {
                    _this.ee.off("valueChange", cb);
                };
            };
            AxisMark.prototype.onDisplayedValueChange = function(cb) {
                var _this = this;
                this.ee.on("onDisplayedValueChange", cb);
                return function() {
                    _this.ee.off("onDisplayedValueChange", cb);
                };
            };
            AxisMark.typeName = "simple";
            return AxisMark;
        }();
        exports.AxisMark = AxisMark;
        var AxisTimeleftMark = function(_super) {
            __extends(AxisTimeleftMark, _super);
            function AxisTimeleftMark() {
                _super.apply(this, arguments);
                this.renderOnTrendsChange = true;
            }
            AxisTimeleftMark.prototype.getDisplayedVal = function() {
                var markVal = this.options.value;
                var maxXVal = this.chartState.state.computedData.trends.maxXVal;
                var time = markVal - maxXVal;
                if (time < 0) time = 0;
                return Utils_1.Utils.msToTimeString(time);
            };
            AxisTimeleftMark.prototype.bindEvents = function() {
                var _this = this;
                this.chartState.onTrendsChange(function() {
                    return _this.onTrendsChange();
                });
            };
            AxisTimeleftMark.prototype.onTrendsChange = function() {
                this.ee.emit("onDisplayedValueChange");
            };
            AxisTimeleftMark.typeName = "timeleft";
            return AxisTimeleftMark;
        }(AxisMark);
        exports.AxisTimeleftMark = AxisTimeleftMark;
    }, function(module, exports) {
        "use strict";
        (function(AXIS_RANGE_TYPE) {
            AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["FIXED"] = 0] = "FIXED";
            AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["RELATIVE_END"] = 1] = "RELATIVE_END";
            AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["AUTO"] = 2] = "AUTO";
            AXIS_RANGE_TYPE[AXIS_RANGE_TYPE["ALL"] = 3] = "ALL";
        })(exports.AXIS_RANGE_TYPE || (exports.AXIS_RANGE_TYPE = {}));
        var AXIS_RANGE_TYPE = exports.AXIS_RANGE_TYPE;
        (function(AXIS_TYPE) {
            AXIS_TYPE[AXIS_TYPE["X"] = 0] = "X";
            AXIS_TYPE[AXIS_TYPE["Y"] = 1] = "Y";
        })(exports.AXIS_TYPE || (exports.AXIS_TYPE = {}));
        var AXIS_TYPE = exports.AXIS_TYPE;
        (function(AXIS_DATA_TYPE) {
            AXIS_DATA_TYPE[AXIS_DATA_TYPE["NUMBER"] = 0] = "NUMBER";
            AXIS_DATA_TYPE[AXIS_DATA_TYPE["DATE"] = 1] = "DATE";
        })(exports.AXIS_DATA_TYPE || (exports.AXIS_DATA_TYPE = {}));
        var AXIS_DATA_TYPE = exports.AXIS_DATA_TYPE;
    }, function(module, exports) {
        "use strict";
        var ChartWidget = function() {
            function ChartWidget() {
                this.unbindList = [];
            }
            ChartWidget.prototype.setupChart = function(chart) {
                this.chart = chart;
            };
            ChartWidget.prototype.bindEvent = function() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                var unbindList = [];
                if (!Array.isArray(args[0])) {
                    unbindList.push(args[0]);
                } else {
                    unbindList.push.apply(unbindList, args);
                }
                (_a = this.unbindList).push.apply(_a, unbindList);
                var _a;
            };
            ChartWidget.prototype.unbindEvents = function() {
                this.unbindList.forEach(function(unbindEvent) {
                    return unbindEvent();
                });
                this.unbindList.length = 0;
            };
            ChartWidget.widgetName = "";
            return ChartWidget;
        }();
        exports.ChartWidget = ChartWidget;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Mesh = THREE.Mesh;
        var Object3D = THREE.Object3D;
        var Widget_1 = __webpack_require__(20);
        var GridWidget_1 = __webpack_require__(22);
        var Utils_1 = __webpack_require__(4);
        var interfaces_1 = __webpack_require__(19);
        var Color_1 = __webpack_require__(23);
        var AxisWidget = function(_super) {
            __extends(AxisWidget, _super);
            function AxisWidget() {
                _super.apply(this, arguments);
                this.isDestroyed = false;
            }
            AxisWidget.prototype.onReadyHandler = function() {
                var _this = this;
                this.object3D = new Object3D();
                this.axisXObject = new Object3D();
                this.axisYObject = new Object3D();
                this.object3D.add(this.axisXObject);
                this.object3D.add(this.axisYObject);
                this.setupAxis(interfaces_1.AXIS_TYPE.X);
                this.setupAxis(interfaces_1.AXIS_TYPE.Y);
                this.updateAxisXRequest = Utils_1.Utils.throttle(function() {
                    return _this.updateAxis(interfaces_1.AXIS_TYPE.X);
                }, 1e3);
                this.onScrollChange(this.chart.screen.options.scrollX, this.chart.screen.options.scrollY);
                this.bindEvents();
            };
            AxisWidget.prototype.bindEvents = function() {
                var _this = this;
                var state = this.chart;
                this.bindEvent(state.screen.onTransformationFrame(function(options) {
                    _this.onScrollChange(options.scrollX, options.scrollY);
                }), state.screen.onZoomFrame(function(options) {
                    _this.onZoomFrame(options);
                }), state.onDestroy(function() {
                    return _this.onDestroy();
                }), state.onResize(function() {
                    return _this.onResize();
                }));
            };
            AxisWidget.prototype.onDestroy = function() {
                this.isDestroyed = true;
                this.unbindEvents();
            };
            AxisWidget.prototype.onScrollChange = function(x, y) {
                if (y != void 0) {
                    this.axisYObject.position.y = y;
                    this.axisXObject.position.y = y;
                }
                if (x != void 0) {
                    this.axisYObject.position.x = x;
                    this.updateAxisXRequest();
                }
            };
            AxisWidget.prototype.onResize = function() {
                this.setupAxis(interfaces_1.AXIS_TYPE.X);
                this.setupAxis(interfaces_1.AXIS_TYPE.Y);
            };
            AxisWidget.prototype.setupAxis = function(orientation) {
                var _this = this;
                var isXAxis = orientation == interfaces_1.AXIS_TYPE.X;
                var _a = this.chart.state, visibleWidth = _a.width, visibleHeight = _a.height;
                var canvasWidth = 0, canvasHeight = 0;
                var axisOptions;
                if (isXAxis) {
                    this.axisXObject.traverse(function(obj) {
                        return _this.axisXObject.remove(obj);
                    });
                    canvasWidth = visibleWidth * 3;
                    canvasHeight = 50;
                    axisOptions = this.chart.state.xAxis;
                } else {
                    this.axisYObject.traverse(function(obj) {
                        return _this.axisYObject.remove(obj);
                    });
                    canvasWidth = 50;
                    canvasHeight = visibleHeight * 3;
                    axisOptions = this.chart.state.yAxis;
                }
                var texture = Utils_1.Utils.createPixelPerfectTexture(canvasWidth, canvasHeight, function(ctx) {
                    var color = new Color_1.ChartColor(axisOptions.color);
                    ctx.beginPath();
                    ctx.font = _this.chart.state.font.m;
                    ctx.fillStyle = color.rgbaStr;
                    ctx.strokeStyle = color.rgbaStr;
                });
                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.FrontSide
                });
                material.transparent = true;
                var axisMesh = new Mesh(new THREE.PlaneGeometry(canvasWidth, canvasHeight), material);
                if (isXAxis) {
                    axisMesh.position.set(canvasWidth / 2, canvasHeight / 2, 0);
                    this.axisXObject.add(axisMesh);
                } else {
                    axisMesh.position.set(visibleWidth - canvasWidth / 2, canvasHeight / 2, 0);
                    this.axisYObject.add(axisMesh);
                }
                this.updateAxis(orientation);
            };
            AxisWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            AxisWidget.prototype.updateAxis = function(orientation) {
                if (this.isDestroyed) return;
                var isXAxis = orientation == interfaces_1.AXIS_TYPE.X;
                var _a = this.chart.state, visibleWidth = _a.width, visibleHeight = _a.height;
                var _b = this.chart.screen.options, scrollX = _b.scrollX, scrollY = _b.scrollY, zoomX = _b.zoomX, zoomY = _b.zoomY;
                var axisOptions;
                var axisMesh;
                var axisGridParams;
                if (isXAxis) {
                    axisMesh = this.axisXObject.children[0];
                    axisOptions = this.chart.state.xAxis;
                    axisGridParams = GridWidget_1.GridWidget.getGridParamsForAxis(axisOptions, visibleWidth, zoomX);
                } else {
                    axisMesh = this.axisYObject.children[0];
                    axisOptions = this.chart.state.yAxis;
                    axisGridParams = GridWidget_1.GridWidget.getGridParamsForAxis(axisOptions, visibleHeight, zoomY);
                }
                var geometry = axisMesh.geometry;
                var canvasWidth = geometry.parameters.width;
                var canvasHeight = geometry.parameters.height;
                var texture = axisMesh.material.map;
                var ctx = texture.image.getContext("2d");
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                if (isXAxis) {
                    axisMesh.position.x = canvasWidth / 2 - visibleWidth + scrollX;
                }
                var edgeOffset = axisGridParams.segmentsCount * axisGridParams.step;
                var startVal = axisGridParams.start - edgeOffset;
                var endVal = axisGridParams.end + edgeOffset;
                ctx.beginPath();
                for (var val = startVal; val <= endVal; val += axisGridParams.step) {
                    var displayedValue = "";
                    if (isXAxis) {
                        var pxVal = this.chart.screen.getPointOnXAxis(val) - scrollX + visibleWidth;
                        ctx.textAlign = "center";
                        if (axisOptions.dataType == interfaces_1.AXIS_DATA_TYPE.DATE) {
                            displayedValue = AxisWidget.getDateStr(val, axisGridParams);
                        } else {
                            displayedValue = Number(val.toFixed(14)).toString();
                        }
                        ctx.fillText(displayedValue, pxVal, canvasHeight - 10);
                    } else {
                        var pxVal = canvasHeight - this.chart.screen.getPointOnYAxis(val) + scrollY;
                        ctx.textAlign = "right";
                        displayedValue = Number(val.toFixed(14)).toString();
                        ctx.fillText(displayedValue, canvasWidth - 15, pxVal + 3);
                    }
                    ctx.stroke();
                }
                ctx.stroke();
                ctx.closePath();
                texture.needsUpdate = true;
            };
            AxisWidget.prototype.onZoomFrame = function(options) {
                if (options.zoomX) {
                    this.updateAxis(interfaces_1.AXIS_TYPE.X);
                }
                if (options.zoomY) {
                    this.updateAxis(interfaces_1.AXIS_TYPE.Y);
                }
            };
            AxisWidget.getDateStr = function(timestamp, gridParams) {
                var sec = 1e3;
                var min = sec * 60;
                var hour = min * 60;
                var day = hour * 60;
                var step = gridParams.step;
                var d = new Date(timestamp);
                var tf = function(num) {
                    return Utils_1.Utils.toFixed(num, 2);
                };
                return tf(d.getHours()) + ":" + tf(d.getMinutes()) + ":" + tf(d.getSeconds());
            };
            AxisWidget.widgetName = "Axis";
            return AxisWidget;
        }(Widget_1.ChartWidget);
        exports.AxisWidget = AxisWidget;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Vector3 = THREE.Vector3;
        var Widget_1 = __webpack_require__(20);
        var LineSegments = THREE.LineSegments;
        var Utils_1 = __webpack_require__(4);
        var Color_1 = __webpack_require__(23);
        var GridWidget = function(_super) {
            __extends(GridWidget, _super);
            function GridWidget() {
                _super.apply(this, arguments);
                this.isDestroyed = false;
            }
            GridWidget.prototype.onReadyHandler = function() {
                var _a = this.chart.state, width = _a.width, height = _a.height, xAxis = _a.xAxis, yAxis = _a.yAxis;
                this.gridSizeH = Math.floor(width / xAxis.grid.minSizePx) * 3;
                this.gridSizeV = Math.floor(height / yAxis.grid.minSizePx) * 3;
                this.initGrid();
                this.updateGrid();
                this.bindEvents();
            };
            GridWidget.prototype.bindEvents = function() {
                var _this = this;
                var updateGridThrottled = Utils_1.Utils.throttle(function() {
                    return _this.updateGrid();
                }, 1e3);
                this.bindEvent(this.chart.onScroll(function() {
                    return updateGridThrottled();
                }), this.chart.screen.onZoomFrame(function(options) {
                    updateGridThrottled();
                    _this.onZoomFrame(options);
                }), this.chart.onDestroy(function() {
                    _this.isDestroyed = true;
                    _this.unbindEvents();
                }), this.chart.onResize(function() {
                    _this.updateGrid();
                }));
            };
            GridWidget.prototype.initGrid = function() {
                var color = new Color_1.ChartColor(this.chart.state.xAxis.grid.color);
                var geometry = new THREE.Geometry();
                var material = new THREE.LineBasicMaterial({
                    linewidth: 1,
                    color: color.value,
                    opacity: color.a,
                    transparent: true
                });
                var xLinesCount = this.gridSizeH;
                var yLinesCount = this.gridSizeV;
                while (xLinesCount--) geometry.vertices.push(new Vector3(), new Vector3());
                while (yLinesCount--) geometry.vertices.push(new Vector3(), new Vector3());
                this.lineSegments = new LineSegments(geometry, material);
                this.lineSegments.position.setZ(-1);
                this.lineSegments.frustumCulled = false;
            };
            GridWidget.prototype.updateGrid = function() {
                if (this.isDestroyed) return;
                var _a = this.chart.state, yAxis = _a.yAxis, xAxis = _a.xAxis, width = _a.width, height = _a.height;
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
            GridWidget.prototype.getHorizontalLineSegment = function(yVal, scrollXVal, scrollYVal) {
                var chartState = this.chart;
                var localYVal = yVal - chartState.state.yAxis.range.zeroVal - scrollYVal;
                var widthVal = chartState.pxToValueByXAxis(chartState.state.width);
                return [ new THREE.Vector3(widthVal * 2 + scrollXVal, localYVal, 0), new THREE.Vector3(-widthVal + scrollXVal, localYVal, 0) ];
            };
            GridWidget.prototype.getVerticalLineSegment = function(xVal, scrollXVal, scrollYVal) {
                var chartState = this.chart;
                var localXVal = xVal - chartState.state.xAxis.range.zeroVal - scrollXVal;
                var heightVal = chartState.pxToValueByYAxis(chartState.state.height);
                return [ new THREE.Vector3(localXVal, heightVal * 2 + scrollYVal, 0), new THREE.Vector3(localXVal, -heightVal + scrollYVal, 0) ];
            };
            GridWidget.prototype.onZoomFrame = function(options) {
                var _a = this.chart.state, xAxis = _a.xAxis, yAxis = _a.yAxis;
                if (options.zoomX) this.lineSegments.scale.setX(xAxis.range.scaleFactor * options.zoomX);
                if (options.zoomY) this.lineSegments.scale.setY(yAxis.range.scaleFactor * options.zoomY);
            };
            GridWidget.getGridParamsForAxis = function(axisOptions, axisWidth, zoom) {
                var axisRange = axisOptions.range;
                var from = axisRange.from;
                var to = axisRange.to;
                var axisLength = to - from;
                var gridStep = 0;
                var gridStepInPixels = 0;
                var minGridStepInPixels = axisOptions.grid.minSizePx;
                var axisLengthStr = String(axisLength);
                var axisLengthPointPosition = axisLengthStr.indexOf(".");
                var intPartLength = axisLengthPointPosition !== -1 ? axisLengthPointPosition : axisLengthStr.length;
                var gridStepFound = false;
                var digitPos = 0;
                while (!gridStepFound) {
                    var power = intPartLength - digitPos - 1;
                    var multiplier = Math.pow(10, power) || 1;
                    var dividers = [ 1, 2, 5 ];
                    for (var dividerInd = 0; dividerInd < dividers.length; dividerInd++) {
                        var nextGridStep = multiplier / dividers[dividerInd];
                        var nextGridStepInPixels = nextGridStep / axisLength * axisWidth;
                        if (nextGridStepInPixels >= minGridStepInPixels) {
                            gridStep = nextGridStep;
                            gridStepInPixels = nextGridStepInPixels;
                        } else {
                            gridStepFound = true;
                            if (gridStep === 0) {
                                gridStep = nextGridStep;
                                gridStepInPixels = nextGridStepInPixels;
                            }
                            break;
                        }
                    }
                    if (!gridStepFound) digitPos++;
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
            GridWidget.prototype.getObject3D = function() {
                return this.lineSegments;
            };
            GridWidget.widgetName = "Grid";
            return GridWidget;
        }(Widget_1.ChartWidget);
        exports.GridWidget = GridWidget;
    }, function(module, exports) {
        "use strict";
        var ChartColor = function() {
            function ChartColor(color) {
                this.set(color);
            }
            /**!
	     * @preserve $.parseColor
	     * Copyright 2011 THEtheChad Elliott
	     * Released under the MIT and GPL licenses.
	     */
            ChartColor.parseColor = function(color) {
                var cache, p = parseInt, color = color.replace(/\s\s*/g, "");
                if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)) cache = [ p(cache[1], 16), p(cache[2], 16), p(cache[3], 16) ]; else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)) cache = [ p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17 ]; else if (cache = /^rgba\(#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2}),(([0-9]*[.])?[0-9]+)/.exec(color)) cache = [ p(cache[1], 16), p(cache[2], 16), p(cache[3], 16), +cache[4] ]; else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)) cache = [ +cache[1], +cache[2], +cache[3], +cache[4] ]; else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)) cache = [ +cache[1], +cache[2], +cache[3] ]; else throw Error(color + " is not supported by parseColor");
                isNaN(cache[3]) && (cache[3] = 1);
                return cache;
            };
            ChartColor.prototype.set = function(color) {
                if (typeof color == "number") {
                    color = color.toString(16);
                    color = "#" + "0".repeat(6 - color.length) + color;
                }
                var colorStr = color;
                var rgba = ChartColor.parseColor(colorStr);
                this.r = rgba[0];
                this.g = rgba[1];
                this.b = rgba[2];
                this.a = rgba[3];
                this.value = (rgba[0] << 8 * 2) + (rgba[1] << 8) + rgba[2];
                this.hexStr = "#" + this.value.toString(16);
                this.rgbaStr = "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
            };
            return ChartColor;
        }();
        exports.ChartColor = ChartColor;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Geometry = THREE.Geometry;
        var Utils_1 = __webpack_require__(4);
        var TrendsWidget_1 = __webpack_require__(25);
        var Color_1 = __webpack_require__(23);
        var TrendsGradientWidget = function(_super) {
            __extends(TrendsGradientWidget, _super);
            function TrendsGradientWidget() {
                _super.apply(this, arguments);
            }
            TrendsGradientWidget.prototype.getTrendWidgetClass = function() {
                return TrendGradient;
            };
            TrendsGradientWidget.widgetName = "TrendsGradient";
            return TrendsGradientWidget;
        }(TrendsWidget_1.TrendsWidget);
        exports.TrendsGradientWidget = TrendsGradientWidget;
        var TrendGradient = function(_super) {
            __extends(TrendGradient, _super);
            function TrendGradient(chartState, trendName) {
                _super.call(this, chartState, trendName);
                this.visibleSegmentsCnt = 0;
                this.trend = chartState.trendsManager.getTrend(trendName);
                this.segmentsIds = new Uint16Array(chartState.state.maxVisibleSegments);
                this.initGradient();
                this.updateSegments();
            }
            TrendGradient.widgetIsEnabled = function(trendOptions) {
                return trendOptions.enabled && trendOptions.hasBackground;
            };
            TrendGradient.prototype.bindEvents = function() {
                var _this = this;
                _super.prototype.bindEvents.call(this);
                this.bindEvent(this.trend.segmentsManager.onRebuild(function() {
                    _this.updateSegments();
                }));
                this.bindEvent(this.trend.segmentsManager.onDisplayedRangeChanged(function() {
                    _this.updateSegments();
                }));
                this.bindEvent(this.chart.onZoom(function() {
                    _this.updateSegments();
                }));
            };
            TrendGradient.prototype.getObject3D = function() {
                return this.gradient;
            };
            TrendGradient.prototype.initGradient = function() {
                var geometry = new Geometry();
                for (var i = 0; i < this.segmentsIds.length; i++) {
                    geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
                    var ind = i * 4;
                    geometry.faces.push(new THREE.Face3(ind, ind + 1, ind + 2), new THREE.Face3(ind + 3, ind, ind + 2));
                }
                var color = new Color_1.ChartColor(this.trend.getOptions().backgroundColor);
                this.gradient = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
                    color: color.value,
                    transparent: true,
                    opacity: color.a
                }));
                var _a = this.chart.state.xAxis.range, scaleXFactor = _a.scaleFactor, zoomX = _a.zoom;
                var _b = this.chart.state.yAxis.range, scaleYFactor = _b.scaleFactor, zoomY = _b.zoom;
                this.gradient.scale.set(scaleXFactor * zoomX, scaleYFactor * zoomY, 1);
                this.gradient.frustumCulled = false;
            };
            TrendGradient.prototype.onZoomFrame = function(options) {
                var state = this.chart.state;
                var scaleXFactor = state.xAxis.range.scaleFactor;
                var scaleYFactor = state.yAxis.range.scaleFactor;
                var currentScale = this.gradient.scale;
                if (options.zoomX) currentScale.setX(scaleXFactor * options.zoomX);
                if (options.zoomY) currentScale.setY(scaleYFactor * options.zoomY);
            };
            TrendGradient.prototype.onSegmentsAnimate = function(trendSegmentsManager) {
                var animatedSegmentsIds = trendSegmentsManager.animatedSegmentsIds;
                for (var i = 0; i < this.visibleSegmentsCnt; i++) {
                    var segmentId = this.segmentsIds[i];
                    if (!animatedSegmentsIds.includes(segmentId)) continue;
                    this.setupSegmentVertices(i, trendSegmentsManager.getSegment(segmentId).currentAnimationState);
                }
                this.gradient.geometry.verticesNeedUpdate = true;
            };
            TrendGradient.prototype.updateSegments = function() {
                var geometry = this.gradient.geometry;
                var _a = this.trend.segmentsManager, trendSegments = _a.segments, segmentInd = _a.firstDisplayedSegmentInd, lastDisplayedSegmentInd = _a.lastDisplayedSegmentInd;
                var prevVisibleSegmentsCnt = this.visibleSegmentsCnt;
                this.visibleSegmentsCnt = lastDisplayedSegmentInd - segmentInd + 1;
                var segmentsToProcessCnt = Math.max(prevVisibleSegmentsCnt, this.visibleSegmentsCnt);
                if (segmentsToProcessCnt > this.segmentsIds.length) {
                    Utils_1.Utils.error(TrendsGradientWidget.widgetName + ": MAX_SEGMENTS reached");
                }
                for (var i = 0; i <= segmentsToProcessCnt; i++) {
                    if (segmentInd <= lastDisplayedSegmentInd) {
                        var segment = trendSegments[segmentInd];
                        this.setupSegmentVertices(i, segment.currentAnimationState);
                        this.segmentsIds[i] = segment.id;
                        segmentInd++;
                    } else {
                        this.setupSegmentVertices(i);
                    }
                }
                geometry.verticesNeedUpdate = true;
            };
            TrendGradient.prototype.setupSegmentVertices = function(segmentInd, segmentState) {
                var gradientSegmentInd = segmentInd * 4;
                var vertices = this.gradient.geometry.vertices;
                var topLeft = vertices[gradientSegmentInd];
                var bottomLeft = vertices[gradientSegmentInd + 1];
                var bottomRight = vertices[gradientSegmentInd + 2];
                var topRight = vertices[gradientSegmentInd + 3];
                var screenHeightVal = Math.max(this.chart.pxToValueByYAxis(this.chart.state.height), this.chart.screen.pxToValueByYAxis(this.chart.state.height));
                if (segmentState) {
                    var startX = this.toLocalX(segmentState.startXVal);
                    var startY = this.toLocalY(segmentState.startYVal);
                    var endX = this.toLocalX(segmentState.endXVal);
                    var endY = this.toLocalY(segmentState.endYVal);
                    topLeft.set(startX, startY, 0);
                    topRight.set(endX, endY, 0);
                    bottomLeft.set(topLeft.x, topLeft.y - screenHeightVal, 0);
                    bottomRight.set(topRight.x, topRight.y - screenHeightVal, 0);
                } else {
                    topLeft.set(0, 0, 0);
                    topRight.set(0, 0, 0);
                    bottomLeft.set(0, 0, 0);
                    bottomRight.set(0, 0, 0);
                }
            };
            TrendGradient.prototype.toLocalX = function(xVal) {
                return xVal - this.chart.state.xAxis.range.zeroVal;
            };
            TrendGradient.prototype.toLocalY = function(yVal) {
                return yVal - this.chart.state.yAxis.range.zeroVal;
            };
            return TrendGradient;
        }(TrendsWidget_1.TrendWidget);
        exports.TrendGradient = TrendGradient;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Widget_1 = __webpack_require__(20);
        var Object3D = THREE.Object3D;
        var TrendsWidget = function(_super) {
            __extends(TrendsWidget, _super);
            function TrendsWidget() {
                _super.apply(this, arguments);
                this.widgets = {};
            }
            TrendsWidget.prototype.onReadyHandler = function() {
                this.object3D = new Object3D();
                this.onTrendsChange();
                this.bindEvents();
            };
            TrendsWidget.prototype.bindEvents = function() {
                var _this = this;
                var state = this.chart;
                state.onTrendsChange(function() {
                    return _this.onTrendsChange();
                });
                state.onTrendChange(function(trendName, changedOptions, newData) {
                    _this.onTrendChange(trendName, changedOptions, newData);
                });
            };
            TrendsWidget.prototype.onTrendsChange = function() {
                var trendsOptions = this.chart.state.trends;
                var TrendWidgetClass = this.getTrendWidgetClass();
                for (var trendName in trendsOptions) {
                    var trendOptions = trendsOptions[trendName];
                    var widgetCanBeEnabled = TrendWidgetClass.widgetIsEnabled(trendOptions, this.chart);
                    if (widgetCanBeEnabled && !this.widgets[trendName]) {
                        this.createTrendWidget(trendName);
                    } else if (!widgetCanBeEnabled && this.widgets[trendName]) {
                        this.destroyTrendWidget(trendName);
                    }
                }
            };
            TrendsWidget.prototype.onTrendChange = function(trendName, changedOptions, newData) {
                var widget = this.widgets[trendName];
                if (!widget) return;
                widget.onTrendChange(changedOptions);
                if (newData) {
                    var data = this.chart.getTrend(trendName).getData();
                    var isAppend = !data.length || data[0].xVal < newData[0].xVal;
                    isAppend ? widget.appendData(newData) : widget.prependData(newData);
                }
            };
            TrendsWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            TrendsWidget.prototype.createTrendWidget = function(trendName) {
                var WidgetConstructor = this.getTrendWidgetClass();
                var widget = new WidgetConstructor(this.chart, trendName);
                this.widgets[trendName] = widget;
                var widgetObject = widget.getObject3D();
                widgetObject.name = trendName;
                this.object3D.add(widget.getObject3D());
            };
            TrendsWidget.prototype.destroyTrendWidget = function(trendName) {
                this.widgets[trendName].onDestroy();
                delete this.widgets[trendName];
                var widgetObject = this.object3D.getObjectByName(trendName);
                this.object3D.remove(widgetObject);
            };
            return TrendsWidget;
        }(Widget_1.ChartWidget);
        exports.TrendsWidget = TrendsWidget;
        var TrendWidget = function() {
            function TrendWidget(chart, trendName) {
                this.chart = chart;
                this.trendName = trendName;
                this.unbindList = [];
                this.trend = chart.trendsManager.getTrend(trendName);
                this.chart = chart;
                this.bindEvents();
            }
            TrendWidget.widgetIsEnabled = function(trendOptions, chart) {
                return trendOptions.enabled;
            };
            TrendWidget.prototype.appendData = function(newData) {};
            TrendWidget.prototype.prependData = function(newData) {};
            TrendWidget.prototype.onTrendChange = function(changedOptions) {};
            TrendWidget.prototype.onDestroy = function() {
                for (var _i = 0, _a = this.unbindList; _i < _a.length; _i++) {
                    var unsubscriber = _a[_i];
                    unsubscriber();
                }
            };
            TrendWidget.prototype.onSegmentsAnimate = function(segments) {};
            TrendWidget.prototype.onZoomFrame = function(options) {};
            TrendWidget.prototype.onTransformationFrame = function(options) {};
            TrendWidget.prototype.onZoom = function() {};
            TrendWidget.prototype.bindEvents = function() {
                var _this = this;
                this.bindEvent(this.trend.segmentsManager.onAnimationFrame(function(trendPoints) {
                    return _this.onSegmentsAnimate(trendPoints);
                }));
                this.bindEvent(this.chart.screen.onTransformationFrame(function(options) {
                    return _this.onTransformationFrame(options);
                }));
                this.bindEvent(this.chart.screen.onZoomFrame(function(options) {
                    return _this.onZoomFrame(options);
                }));
                this.bindEvent(this.chart.onZoom(function() {
                    return _this.onZoom();
                }));
            };
            TrendWidget.prototype.bindEvent = function(unbind) {
                this.unbindList.push(unbind);
            };
            return TrendWidget;
        }();
        exports.TrendWidget = TrendWidget;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Geometry = THREE.Geometry;
        var LineBasicMaterial = THREE.LineBasicMaterial;
        var Vector3 = THREE.Vector3;
        var TrendsWidget_1 = __webpack_require__(25);
        var LineSegments = THREE.LineSegments;
        var Trend_1 = __webpack_require__(14);
        var Utils_1 = __webpack_require__(4);
        var TrendsLineWidget = function(_super) {
            __extends(TrendsLineWidget, _super);
            function TrendsLineWidget() {
                _super.apply(this, arguments);
            }
            TrendsLineWidget.prototype.getTrendWidgetClass = function() {
                return TrendLine;
            };
            TrendsLineWidget.widgetName = "TrendsLine";
            return TrendsLineWidget;
        }(TrendsWidget_1.TrendsWidget);
        exports.TrendsLineWidget = TrendsLineWidget;
        var TrendLine = function(_super) {
            __extends(TrendLine, _super);
            function TrendLine(chart, trendName) {
                _super.call(this, chart, trendName);
                this.freeSegmentsInds = [];
                this.displayedSegments = {};
                var options = this.trend.getOptions();
                this.material = new LineBasicMaterial({
                    color: options.lineColor,
                    linewidth: options.lineWidth
                });
                this.initLine();
            }
            TrendLine.widgetIsEnabled = function(trendOptions) {
                return trendOptions.enabled && trendOptions.type == Trend_1.TREND_TYPE.LINE;
            };
            TrendLine.prototype.getObject3D = function() {
                return this.lineSegments;
            };
            TrendLine.prototype.bindEvents = function() {
                var _this = this;
                _super.prototype.bindEvents.call(this);
                this.bindEvent(this.trend.segmentsManager.onRebuild(function() {
                    _this.destroySegments();
                    _this.setupSegments();
                }));
                this.bindEvent(this.trend.segmentsManager.onDisplayedRangeChanged(function() {
                    _this.setupSegments();
                }));
            };
            TrendLine.prototype.initLine = function() {
                var geometry = new Geometry();
                var _a = this.chart.state.xAxis.range, scaleXFactor = _a.scaleFactor, zoomX = _a.zoom;
                var _b = this.chart.state.yAxis.range, scaleYFactor = _b.scaleFactor, zoomY = _b.zoom;
                this.lineSegments = new LineSegments(geometry, this.material);
                this.lineSegments.scale.set(scaleXFactor * zoomX, scaleYFactor * zoomY, 1);
                this.lineSegments.frustumCulled = false;
                for (var i = 0; i < this.chart.state.maxVisibleSegments; i++) {
                    geometry.vertices.push(new Vector3(), new Vector3());
                    this.freeSegmentsInds.push(i);
                }
                this.vertices = geometry.vertices;
                this.setupSegments();
            };
            TrendLine.prototype.setupSegments = function() {
                var geometry = this.lineSegments.geometry;
                var _a = this.trend.segmentsManager, firstDisplayedSegment = _a.firstDisplayedSegment, lastDisplayedSegment = _a.lastDisplayedSegment;
                for (var segmentId in this.displayedSegments) {
                    var lineSegment = this.displayedSegments[segmentId];
                    var segment_1 = this.trend.segmentsManager.segments[lineSegment.segmentId];
                    var segmentIsNotDisplayed = segment_1.startXVal < firstDisplayedSegment.startXVal || segment_1.endXVal > lastDisplayedSegment.endXVal;
                    if (segmentIsNotDisplayed) this.destroySegment(Number(segmentId));
                }
                var segment = firstDisplayedSegment;
                while (segment && segment.xVal <= lastDisplayedSegment.xVal) {
                    this.setupSegment(segment.id, segment.currentAnimationState);
                    segment = segment.getNext();
                }
                geometry.verticesNeedUpdate = true;
            };
            TrendLine.prototype.setupSegment = function(segmentId, segmentState) {
                var lineSegment = this.displayedSegments[segmentId];
                if (!lineSegment) {
                    if (this.freeSegmentsInds.length == 0) Utils_1.Utils.error("Max allocated segments reached");
                    var ind = this.freeSegmentsInds.pop();
                    lineSegment = this.displayedSegments[segmentId] = {
                        segmentId: segmentId,
                        ind: ind
                    };
                }
                var segmentInd = lineSegment.ind;
                var lineStartVertex = this.vertices[segmentInd * 2];
                var lineEndVertex = this.vertices[segmentInd * 2 + 1];
                lineStartVertex.set(this.toLocalX(segmentState.startXVal), this.toLocalY(segmentState.startYVal), 0);
                lineEndVertex.set(this.toLocalX(segmentState.endXVal), this.toLocalY(segmentState.endYVal), 0);
            };
            TrendLine.prototype.destroySegments = function() {
                for (var segmentId in this.displayedSegments) this.destroySegment(Number(segmentId));
            };
            TrendLine.prototype.destroySegment = function(segmentId) {
                var lineSegment = this.displayedSegments[segmentId];
                var lineStartVertex = this.vertices[lineSegment.ind * 2];
                var lineEndVertex = this.vertices[lineSegment.ind * 2 + 1];
                lineStartVertex.set(0, 0, 0);
                lineEndVertex.set(0, 0, 0);
                delete this.displayedSegments[segmentId];
                this.freeSegmentsInds.push(lineSegment.ind);
            };
            TrendLine.prototype.onZoomFrame = function(options) {
                var currentScale = this.lineSegments.scale;
                var state = this.chart.state;
                var scaleXFactor = state.xAxis.range.scaleFactor;
                var scaleYFactor = state.yAxis.range.scaleFactor;
                if (options.zoomX) currentScale.setX(scaleXFactor * options.zoomX);
                if (options.zoomY) currentScale.setY(scaleYFactor * options.zoomY);
            };
            TrendLine.prototype.onSegmentsAnimate = function(trendSegments) {
                var geometry = this.lineSegments.geometry;
                for (var _i = 0, _a = trendSegments.animatedSegmentsIds; _i < _a.length; _i++) {
                    var segmentId = _a[_i];
                    if (!this.displayedSegments[segmentId]) continue;
                    this.setupSegment(segmentId, trendSegments.segmentsById[segmentId].currentAnimationState);
                }
                geometry.verticesNeedUpdate = true;
            };
            TrendLine.prototype.toLocalX = function(xVal) {
                return xVal - this.chart.state.xAxis.range.zeroVal;
            };
            TrendLine.prototype.toLocalY = function(yVal) {
                return yVal - this.chart.state.yAxis.range.zeroVal;
            };
            TrendLine.prototype.toLocalVec = function(vec) {
                return new Vector3(this.toLocalX(vec.x), this.toLocalY(vec.y), 0);
            };
            return TrendLine;
        }(TrendsWidget_1.TrendWidget);
        exports.TrendLine = TrendLine;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var TrendsWidget_1 = __webpack_require__(25);
        var Object3D = THREE.Object3D;
        var Geometry = THREE.Geometry;
        var Vector3 = THREE.Vector3;
        var Mesh = THREE.Mesh;
        var Line = THREE.Line;
        var MeshBasicMaterial = THREE.MeshBasicMaterial;
        var PlaneGeometry = THREE.PlaneGeometry;
        var Trend_1 = __webpack_require__(14);
        var LineBasicMaterial = THREE.LineBasicMaterial;
        var Utils_1 = __webpack_require__(4);
        var RISE_COLOR = 2927680;
        var FALL_COLOR = 15619379;
        var MARGIN_PERCENT = .3;
        var MAX_CANDLES = 100;
        var TrendsCandlesWidget = function(_super) {
            __extends(TrendsCandlesWidget, _super);
            function TrendsCandlesWidget() {
                _super.apply(this, arguments);
            }
            TrendsCandlesWidget.prototype.getTrendWidgetClass = function() {
                return TrendCandlesWidget;
            };
            TrendsCandlesWidget.widgetName = "TrendsCandles";
            return TrendsCandlesWidget;
        }(TrendsWidget_1.TrendsWidget);
        exports.TrendsCandlesWidget = TrendsCandlesWidget;
        var TrendCandlesWidget = function(_super) {
            __extends(TrendCandlesWidget, _super);
            function TrendCandlesWidget(chartState, trendName) {
                _super.call(this, chartState, trendName);
                this.freeCandlesInds = [];
                this.candlesPool = [];
                this.candles = {};
                this.initObject();
            }
            TrendCandlesWidget.widgetIsEnabled = function(trendOptions) {
                return trendOptions.enabled && trendOptions.type == Trend_1.TREND_TYPE.CANDLE;
            };
            TrendCandlesWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            TrendCandlesWidget.prototype.bindEvents = function() {
                var _this = this;
                _super.prototype.bindEvents.call(this);
                this.bindEvent(this.trend.segmentsManager.onRebuild(function() {
                    _this.destroyCandles();
                    _this.setupCandles();
                }));
                this.bindEvent(this.trend.segmentsManager.onDisplayedRangeChanged(function() {
                    _this.setupCandles();
                }));
            };
            TrendCandlesWidget.prototype.initObject = function() {
                var stateData = this.chart.state;
                var _a = stateData.xAxis.range, scaleXFactor = _a.scaleFactor, zoomX = _a.zoom;
                var _b = stateData.yAxis.range, scaleYFactor = _b.scaleFactor, zoomY = _b.zoom;
                this.scaleXFactor = scaleXFactor;
                this.scaleYFactor = scaleYFactor;
                this.object3D = new Object3D();
                this.object3D.scale.set(scaleXFactor * zoomX, scaleYFactor * zoomY, 1);
                this.object3D.frustumCulled = false;
                for (var i = 0; i < MAX_CANDLES; i++) this.freeCandlesInds.push(i);
                this.setupCandles();
            };
            TrendCandlesWidget.prototype.setupCandles = function() {
                var _a = this.trend.segmentsManager, firstDisplayedSegment = _a.firstDisplayedSegment, lastDisplayedSegment = _a.lastDisplayedSegment;
                for (var segmentId in this.candles) {
                    var segment_1 = this.candles[segmentId].segment;
                    var segmentIsNotDisplayed = segment_1.startXVal < firstDisplayedSegment.startXVal || segment_1.endXVal > lastDisplayedSegment.endXVal;
                    if (segmentIsNotDisplayed) this.destroyCandle(Number(segmentId));
                }
                var segment = firstDisplayedSegment;
                while (segment && segment.xVal <= lastDisplayedSegment.xVal) {
                    this.setupCandle(segment.id, segment.currentAnimationState);
                    segment = segment.getNext();
                }
            };
            TrendCandlesWidget.prototype.destroyCandles = function() {
                for (var segmentId in this.candles) this.destroyCandle(Number(segmentId));
            };
            TrendCandlesWidget.prototype.destroyCandle = function(segmentId) {
                var candle = this.candles[segmentId];
                this.object3D.remove(candle.getObject3D());
                delete this.candles[segmentId];
            };
            TrendCandlesWidget.prototype.onZoomFrame = function(options) {
                var currentScale = this.object3D.scale;
                if (options.zoomX) currentScale.setX(this.scaleXFactor * options.zoomX);
                if (options.zoomY) currentScale.setY(this.scaleYFactor * options.zoomY);
            };
            TrendCandlesWidget.prototype.onSegmentsAnimate = function(trendSegments) {
                for (var _i = 0, _a = trendSegments.animatedSegmentsIds; _i < _a.length; _i++) {
                    var segmentId = _a[_i];
                    if (!this.candles[segmentId]) continue;
                    var segmentState = trendSegments.segmentsById[segmentId].currentAnimationState;
                    this.setupCandle(segmentId, segmentState);
                }
            };
            TrendCandlesWidget.prototype.setupCandle = function(candleId, segmentState) {
                var candleInd = candleId % MAX_CANDLES;
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
            TrendCandlesWidget.prototype.toLocalX = function(xVal) {
                return xVal - this.chart.state.xAxis.range.zeroVal;
            };
            TrendCandlesWidget.prototype.toLocalY = function(yVal) {
                return yVal - this.chart.state.yAxis.range.zeroVal;
            };
            TrendCandlesWidget.prototype.toLocalVec = function(vec) {
                return new Vector3(this.toLocalX(vec.x), this.toLocalY(vec.y), 0);
            };
            return TrendCandlesWidget;
        }(TrendsWidget_1.TrendWidget);
        exports.TrendCandlesWidget = TrendCandlesWidget;
        var CandleWidget = function() {
            function CandleWidget() {
                this.initObject();
            }
            CandleWidget.prototype.getObject3D = function() {
                return this.rect;
            };
            CandleWidget.prototype.setSegment = function(segment) {
                this.segment = segment;
                var color = segment.endYVal < segment.startYVal ? FALL_COLOR : RISE_COLOR;
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
                if (Utils_1.Utils.getDistance(leftTop.y, leftBottom.y) < 1) {
                    leftBottom.setY(leftBottom.y + 1);
                    rightBottom.setY(rightBottom.y + 1);
                }
                material.color.set(color);
                geometry.verticesNeedUpdate = true;
                var vLineGeometry = this.vLine.geometry;
                var vLineMaterial = this.vLine.material;
                var lineTop = segment.maxYVal - segment.yVal;
                var lineBottom = segment.minYVal - segment.yVal;
                vLineGeometry.vertices[0].set(0, lineTop, 0);
                vLineGeometry.vertices[1].set(0, lineBottom, 0);
                vLineMaterial.color.set(color);
                vLineGeometry.verticesNeedUpdate = true;
                var hLineGeometry = this.hLine.geometry;
                var hLineMaterial = this.hLine.material;
                var lineLeft = -width / 2;
                var lineRight = width / 2;
                hLineGeometry.vertices[0].set(lineLeft, 0, 0);
                hLineGeometry.vertices[1].set(lineRight, 0, 0);
                hLineMaterial.color.set(color);
                hLineGeometry.verticesNeedUpdate = true;
            };
            CandleWidget.prototype.initObject = function() {
                this.rect = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial());
                var vLineGeometry = new Geometry();
                var hLineGeometry = new Geometry();
                vLineGeometry.vertices.push(new Vector3(), new Vector3());
                hLineGeometry.vertices.push(new Vector3(), new Vector3());
                this.vLine = new Line(vLineGeometry, new LineBasicMaterial({
                    linewidth: 1
                }));
                this.hLine = new Line(hLineGeometry, new LineBasicMaterial({
                    linewidth: 1
                }));
                this.rect.add(this.vLine);
                this.rect.add(this.hLine);
            };
            return CandleWidget;
        }();
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function __export(m) {
            for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
        }
        __export(__webpack_require__(5));
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Widget_1 = __webpack_require__(20);
        var Object3D = THREE.Object3D;
        var Geometry = THREE.Geometry;
        var LineBasicMaterial = THREE.LineBasicMaterial;
        var Vector3 = THREE.Vector3;
        var Utils_1 = __webpack_require__(4);
        var Line = THREE.Line;
        var Mesh = THREE.Mesh;
        var interfaces_1 = __webpack_require__(19);
        var Color_1 = __webpack_require__(23);
        var AxisMarksWidget = function(_super) {
            __extends(AxisMarksWidget, _super);
            function AxisMarksWidget() {
                _super.apply(this, arguments);
                this.axisMarksWidgets = [];
            }
            AxisMarksWidget.prototype.onReadyHandler = function() {
                this.object3D = new Object3D();
                var _a = this.chart, xAxisMarks = _a.xAxisMarks, yAxisMarks = _a.yAxisMarks;
                var items = xAxisMarks.getItems();
                for (var markName in items) {
                    this.createAxisMark(items[markName]);
                }
                items = yAxisMarks.getItems();
                for (var markName in items) {
                    this.createAxisMark(items[markName]);
                }
                this.bindEvents();
            };
            AxisMarksWidget.prototype.createAxisMark = function(axisMark) {
                var axisMarkWidget = new AxisMarkWidget(this.chart, axisMark);
                this.axisMarksWidgets.push(axisMarkWidget);
                this.object3D.add(axisMarkWidget.getObject3D());
            };
            AxisMarksWidget.prototype.bindEvents = function() {
                var _this = this;
                this.bindEvent(this.chart.screen.onTransformationFrame(function() {
                    return _this.updateMarksPositions();
                }), this.chart.onResize(function() {
                    return _this.updateMarksPositions();
                }));
            };
            AxisMarksWidget.prototype.updateMarksPositions = function() {
                for (var _i = 0, _a = this.axisMarksWidgets; _i < _a.length; _i++) {
                    var widget = _a[_i];
                    widget.updatePosition();
                }
            };
            AxisMarksWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            AxisMarksWidget.widgetName = "AxisMarks";
            return AxisMarksWidget;
        }(Widget_1.ChartWidget);
        exports.AxisMarksWidget = AxisMarksWidget;
        var DEFAULT_INDICATOR_RENDER_FUNCTION = function(axisMarkWidget, ctx) {
            var axisMark = axisMarkWidget.axisMark;
            ctx.fillStyle = axisMark.options.lineColor;
            ctx.clearRect(0, 0, axisMarkWidget.indicatorWidth, axisMarkWidget.indicatorHeight);
            var xCoord = 15;
            if (axisMark.axisType == interfaces_1.AXIS_TYPE.Y) {
                ctx.textAlign = "end";
                xCoord = axisMarkWidget.indicatorWidth;
            }
            ctx.fillText(axisMark.options.title, xCoord, 20);
            if (!axisMark.options.showValue) return;
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillText(axisMark.getDisplayedVal(), 16, 34);
        };
        var INDICATOR_POS_Z = .1;
        var AxisMarkWidget = function() {
            function AxisMarkWidget(chartState, axisMark) {
                this.indicatorWidth = 128;
                this.indicatorHeight = 64;
                this.indicatorRenderFunction = DEFAULT_INDICATOR_RENDER_FUNCTION;
                this.chartState = chartState;
                this.axisMark = axisMark;
                this.axisType = axisMark.axisType;
                this.frameValue = axisMark.options.value;
                this.object3D = new Object3D();
                this.object3D.position.setZ(-.1);
                this.line = this.createLine();
                this.object3D.add(this.line);
                this.indicator = this.createIndicator();
                this.object3D.add(this.indicator);
                this.renderIndicator();
                this.updatePosition();
                this.bindEvents();
            }
            AxisMarkWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            AxisMarkWidget.prototype.createLine = function() {
                var _a = this.axisMark.options, lineWidth = _a.lineWidth, lineColor = _a.lineColor;
                var lineGeometry = new Geometry();
                lineGeometry.vertices.push(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
                return new Line(lineGeometry, new LineBasicMaterial({
                    color: new Color_1.ChartColor(lineColor).value,
                    linewidth: lineWidth
                }));
            };
            AxisMarkWidget.prototype.createIndicator = function() {
                var _a = this, width = _a.indicatorWidth, height = _a.indicatorHeight;
                var texture = Utils_1.Utils.createPixelPerfectTexture(width, height, function(ctx) {
                    ctx.beginPath();
                    ctx.font = "10px Arial";
                });
                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.FrontSide
                });
                material.transparent = true;
                return new Mesh(new THREE.PlaneGeometry(width, height), material);
            };
            AxisMarkWidget.prototype.renderIndicator = function() {
                var texture = this.indicator.material.map;
                var ctx = texture.image.getContext("2d");
                DEFAULT_INDICATOR_RENDER_FUNCTION(this, ctx);
                texture.needsUpdate = true;
            };
            AxisMarkWidget.prototype.bindEvents = function() {
                var _this = this;
                this.axisMark.onDisplayedValueChange(function() {
                    return _this.renderIndicator();
                });
                this.axisMark.onValueChange(function() {
                    return _this.onValueChangeHandler();
                });
            };
            AxisMarkWidget.prototype.onValueChangeHandler = function() {
                var _this = this;
                if (this.moveAnimation) this.moveAnimation.kill();
                var animations = this.chartState.state.animations;
                var targetValue = this.axisMark.options.value;
                var cb = function() {
                    _this.updatePosition();
                };
                if (animations.enabled) {
                    this.moveAnimation = TweenLite.to(this, animations.trendChangeSpeed, {
                        frameValue: targetValue,
                        ease: animations.trendChangeEase
                    });
                    this.moveAnimation.eventCallback("onUpdate", cb);
                } else {
                    this.frameValue = targetValue;
                    cb();
                }
            };
            AxisMarkWidget.prototype.updatePosition = function() {
                var chartState = this.chartState;
                var screen = chartState.screen;
                var isXAxis = this.axisType == interfaces_1.AXIS_TYPE.X;
                var lineGeometry = this.line.geometry;
                var hasStickMode = this.axisMark.options.stickToEdges;
                var _a = this.chartState.state, width = _a.width, height = _a.height;
                if (isXAxis) {
                    this.object3D.position.x = screen.getPointOnXAxis(this.frameValue);
                    this.object3D.position.y = screen.getBottom();
                    lineGeometry.vertices[1].setY(height);
                    this.indicator.position.set(this.indicatorWidth / 2, chartState.state.height - this.indicatorHeight / 2, INDICATOR_POS_Z);
                } else {
                    var val = this.frameValue;
                    var bottomVal = screen.getBottomVal();
                    var topVal = screen.getTopVal();
                    var needToStickOnTop = hasStickMode && val > topVal;
                    var needToStickOnBottom = hasStickMode && val < bottomVal;
                    var centerYVal = screen.getCenterYVal();
                    this.object3D.position.x = screen.getLeft();
                    if (needToStickOnTop) {
                        this.object3D.position.y = screen.getTop();
                    } else if (needToStickOnBottom) {
                        this.object3D.position.y = screen.getBottom();
                    } else {
                        this.object3D.position.y = screen.getPointOnYAxis(this.frameValue);
                    }
                    lineGeometry.vertices[1].setX(width);
                    var indicatorPosY = val > centerYVal ? -35 : 10;
                    this.indicator.position.set(width - this.indicatorWidth / 2 - 50, indicatorPosY, INDICATOR_POS_Z);
                }
                lineGeometry.verticesNeedUpdate = true;
            };
            AxisMarkWidget.typeName = "simple";
            return AxisMarkWidget;
        }();
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function __export(m) {
            for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
        }
        __export(__webpack_require__(21));
        __export(__webpack_require__(22));
        __export(__webpack_require__(25));
        __export(__webpack_require__(26));
        __export(__webpack_require__(24));
        __export(__webpack_require__(29));
    } ]);
});


//# sourceMappingURL=demoApp.js.map