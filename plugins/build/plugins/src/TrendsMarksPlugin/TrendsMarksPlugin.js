(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(); else if (typeof define === "function" && define.amd) define([], factory); else if (typeof exports === "object") exports["TrendsMarksPlugin"] = factory(); else root["TrendsMarksPlugin"] = factory();
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
        function __export(m) {
            for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
        }
        __export(__webpack_require__(1));
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var three_chart_1 = __webpack_require__(2);
        var TrendsMarksWidget_1 = __webpack_require__(4);
        (function(TREND_MARK_SIDE) {
            TREND_MARK_SIDE[TREND_MARK_SIDE["TOP"] = 0] = "TOP";
            TREND_MARK_SIDE[TREND_MARK_SIDE["BOTTOM"] = 1] = "BOTTOM";
        })(exports.TREND_MARK_SIDE || (exports.TREND_MARK_SIDE = {}));
        var TREND_MARK_SIDE = exports.TREND_MARK_SIDE;
        (function(EVENTS) {
            EVENTS[EVENTS["CHANGE"] = 0] = "CHANGE";
        })(exports.EVENTS || (exports.EVENTS = {}));
        var EVENTS = exports.EVENTS;
        var AXIS_MARK_DEFAULT_OPTIONS = {
            trendName: "",
            title: "",
            description: "",
            descriptionColor: "rgb(40,136,75)",
            value: 0,
            iconColor: "rgb(255, 102, 217)",
            orientation: TREND_MARK_SIDE.TOP,
            width: 65,
            height: 80,
            offset: 40,
            margin: 20
        };
        var TrendsMarksPlugin = function(_super) {
            __extends(TrendsMarksPlugin, _super);
            function TrendsMarksPlugin(trendsMarksPluginOptions) {
                _super.call(this, trendsMarksPluginOptions);
                this.items = {};
                this.rects = {};
            }
            TrendsMarksPlugin.prototype.onInitialStateApplied = function() {
                this.bindEvents();
                this.onMarksChangeHandler();
            };
            TrendsMarksPlugin.prototype.onStateChanged = function() {
                this.onMarksChangeHandler();
            };
            TrendsMarksPlugin.prototype.getOptions = function() {
                return _super.prototype.getOptions.call(this);
            };
            TrendsMarksPlugin.prototype.getItems = function() {
                return this.items;
            };
            TrendsMarksPlugin.prototype.getItem = function(markName) {
                return this.items[markName];
            };
            TrendsMarksPlugin.prototype.createMark = function(options) {
                var marksOptions = this.getOptions().items;
                var newMarkOptions = marksOptions.concat([ options ]);
                this.chartState.setState({
                    pluginsState: (_a = {}, _a[this.name] = {
                        items: newMarkOptions
                    }, _a)
                });
                var _a;
            };
            TrendsMarksPlugin.prototype.onChange = function(cb) {
                return this.ee.subscribe(EVENTS[EVENTS.CHANGE], cb);
            };
            TrendsMarksPlugin.prototype.bindEvents = function() {
                var _this = this;
                this.chartState.trendsManager.onSegmentsRebuilded(function() {
                    return _this.updateMarksSegments();
                });
                this.chartState.screen.onZoomFrame(function() {
                    return _this.calclulateMarksPositions();
                });
            };
            TrendsMarksPlugin.prototype.onInitialStateAppliedHandler = function() {
                this.onMarksChangeHandler();
            };
            TrendsMarksPlugin.prototype.onMarksChangeHandler = function() {
                var trendsMarksOptions = this.getOptions().items;
                var actualMarksNames = [];
                for (var _i = 0, trendsMarksOptions_1 = trendsMarksOptions; _i < trendsMarksOptions_1.length; _i++) {
                    var options = trendsMarksOptions_1[_i];
                    var marks = this.items;
                    if (!options.name) {
                        options.name = three_chart_1.Utils.getUid().toString();
                        actualMarksNames.push(options.name);
                        if (marks[options.name]) three_chart_1.Utils.error("duplicated mark name " + options.name);
                    } else if (marks[options.name]) {
                        actualMarksNames.push(options.name);
                        continue;
                    }
                    options = three_chart_1.Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
                    var mark = new TrendMark(this.chartState, options);
                    marks[options.name] = mark;
                }
                for (var markName in this.items) {
                    if (actualMarksNames.indexOf(markName) != -1) continue;
                    delete this.items[markName];
                }
                this.updateMarksSegments();
                this.ee.emit(EVENTS[EVENTS.CHANGE]);
            };
            TrendsMarksPlugin.prototype.calclulateMarksPositions = function() {
                this.rects = {};
                for (var markName in this.items) {
                    this.createMarkRect(this.items[markName]);
                }
            };
            TrendsMarksPlugin.prototype.createMarkRect = function(mark) {
                if (!mark.segment) return;
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
                } else {
                    top -= offset;
                }
                var markRect = [ left, top, width, height ];
                var hasIntersection = false;
                do {
                    for (var markName in this.rects) {
                        var rect = this.rects[markName];
                        hasIntersection = three_chart_1.Utils.rectsIntersect(rect, markRect);
                        if (!hasIntersection) continue;
                        if (isTopSideMark) {
                            markRect[1] = rect[1] + markRect[3] + options.margin;
                        } else {
                            markRect[1] = rect[1] - rect[3] - options.margin;
                        }
                        row++;
                        break;
                    }
                } while (hasIntersection);
                if (isTopSideMark) {
                    newOffset = markRect[1] - markRect[3] - state.getPointOnYAxis(mark.yVal);
                } else {
                    newOffset = state.getPointOnYAxis(mark.yVal) - markRect[1];
                }
                mark._setOffset(newOffset);
                mark._setRow(row);
                this.rects[name] = markRect;
            };
            TrendsMarksPlugin.prototype.updateMarksSegments = function() {
                var chartState = this.chartState;
                var trends = chartState.trendsManager.trends;
                for (var trendName in trends) {
                    var marks = this.getTrendMarks(trendName);
                    var marksArr = [];
                    var xVals = [];
                    for (var markName in marks) {
                        var mark = marks[markName];
                        xVals.push(mark.options.value);
                        marksArr.push(mark);
                        mark._setSegment(null);
                    }
                    marksArr.sort(function(a, b) {
                        return a.options.value - b.options.value;
                    });
                    var trend = chartState.getTrend(trendName);
                    var points = trend.segments.getSegmentsForXValues(xVals.sort(function(a, b) {
                        return a - b;
                    }));
                    for (var markInd = 0; markInd < marksArr.length; markInd++) {
                        marksArr[markInd]._setSegment(points[markInd]);
                    }
                }
                this.calclulateMarksPositions();
            };
            TrendsMarksPlugin.prototype.getTrendMarks = function(trendName) {
                var trendMarks = [];
                for (var markName in this.items) {
                    if (this.items[markName].options.trendName != trendName) continue;
                    trendMarks.push(this.items[markName]);
                }
                return trendMarks;
            };
            TrendsMarksPlugin.NAME = "TrendsMarks";
            TrendsMarksPlugin.pluginWidgets = [ TrendsMarksWidget_1.TrendsMarksWidget ];
            return TrendsMarksPlugin;
        }(three_chart_1.ChartPlugin);
        exports.TrendsMarksPlugin = TrendsMarksPlugin;
        var TrendMark = function() {
            function TrendMark(chartState, options) {
                this.row = 0;
                this.options = options;
                this.chartState = chartState;
            }
            TrendMark.prototype._setSegment = function(segment) {
                this.segment = segment;
                if (!segment) return;
                var trend = this.chartState.getTrend(this.options.trendName);
                if (trend.getOptions().type == three_chart_1.TREND_TYPE.LINE) {
                    this.xVal = segment.endXVal;
                    this.yVal = segment.endYVal;
                } else if (this.options.orientation == TREND_MARK_SIDE.TOP) {
                    this.xVal = segment.xVal;
                    this.yVal = segment.maxYVal;
                } else {
                    this.xVal = segment.xVal;
                    this.yVal = segment.minYVal;
                }
            };
            TrendMark.prototype._setOffset = function(offset) {
                this.offset = offset;
            };
            TrendMark.prototype._setRow = function(row) {
                this.row = row;
            };
            return TrendMark;
        }();
        exports.TrendMark = TrendMark;
    }, function(module, exports, __webpack_require__) {
        module.exports = __webpack_require__(3);
    }, function(module, exports, __webpack_require__) {
        (function webpackUniversalModuleDefinition(root, factory) {
            if (true) module.exports = factory(); else if (typeof define === "function" && define.amd) define([], factory); else if (typeof exports === "object") exports["ThreeChart"] = factory(); else root["ThreeChart"] = factory();
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
                function __export(m) {
                    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                __export(__webpack_require__(1));
            }, function(module, exports, __webpack_require__) {
                "use strict";
                function __export(m) {
                    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                __export(__webpack_require__(2));
                __export(__webpack_require__(23));
                __export(__webpack_require__(22));
                __export(__webpack_require__(21));
                __export(__webpack_require__(14));
                __export(__webpack_require__(19));
                __export(__webpack_require__(20));
                __export(__webpack_require__(18));
                __export(__webpack_require__(16));
                __export(__webpack_require__(17));
                __export(__webpack_require__(35));
                __export(__webpack_require__(27));
            }, function(module, exports, __webpack_require__) {
                "use strict";
                __webpack_require__(3);
                var PerspectiveCamera = THREE.PerspectiveCamera;
                var State_1 = __webpack_require__(14);
                var Utils_1 = __webpack_require__(16);
                var AxisWidget_1 = __webpack_require__(24);
                var GridWidget_1 = __webpack_require__(25);
                var TrendsLoadingWidget_1 = __webpack_require__(26);
                var AxisMarksWidget_1 = __webpack_require__(28);
                var BorderWidget_1 = __webpack_require__(29);
                var TrendsIndicatorWidget_1 = __webpack_require__(30);
                var TrendsLineWidget_1 = __webpack_require__(31);
                var TrendsCandleWidget_1 = __webpack_require__(32);
                var TrendsBeaconWidget_1 = __webpack_require__(33);
                var deps_1 = __webpack_require__(34);
                exports.MAX_DATA_LENGTH = 2692e3;
                var Chart = function() {
                    function Chart(state, $container, plugins) {
                        var _this = this;
                        if (plugins === void 0) {
                            plugins = [];
                        }
                        this.widgets = [];
                        if (!THREE || !THREE.REVISION) Utils_1.Utils.error("three.js not found");
                        if (!$container) {
                            Utils_1.Utils.error("$el must be set");
                        }
                        var style = getComputedStyle($container);
                        state.width = parseInt(style.width);
                        state.height = parseInt(style.height);
                        this.state = new State_1.ChartState(state, Chart.installedWidgets, plugins);
                        this.zoomThrottled = Utils_1.Utils.throttle(function(zoomValue, origin) {
                            return _this.zoom(zoomValue, origin);
                        }, 200);
                        this.$container = $container;
                        this.init($container);
                    }
                    Chart.installWidget = function(Widget) {
                        if (!Widget.widgetName) {
                            Utils_1.Utils.error("unnamed widget");
                        }
                        this.installedWidgets[Widget.widgetName] = Widget;
                    };
                    Chart.prototype.init = function($container) {
                        var state = this.state;
                        var _a = state.data, w = _a.width, h = _a.height, showStats = _a.showStats, autoRender = _a.autoRender;
                        this.scene = new THREE.Scene();
                        this.isStopped = !autoRender.enabled;
                        var renderer = this.renderer = new Chart.renderers[this.state.data.renderer]({
                            antialias: true,
                            alpha: true
                        });
                        renderer.setPixelRatio(Chart.devicePixelRatio);
                        renderer.setClearColor(state.data.backgroundColor, state.data.backgroundOpacity);
                        renderer.setSize(w, h);
                        $container.appendChild(renderer.domElement);
                        this.$el = renderer.domElement;
                        this.$el.style.display = "block";
                        if (showStats) {
                            this.stats = new Stats();
                            $container.appendChild(this.stats.domElement);
                        }
                        this.setupCamera();
                        var widgetsClasses = this.state.widgetsClasses;
                        for (var widgetName in widgetsClasses) {
                            var widgetOptions = this.state.data.widgets[widgetName];
                            if (!widgetOptions.enabled) continue;
                            var WidgetConstructor = widgetsClasses[widgetName];
                            var widget = new WidgetConstructor(this.state);
                            this.scene.add(widget.getObject3D());
                            this.widgets.push(widget);
                        }
                        this.bindEvents();
                        this.renderLoop();
                    };
                    Chart.prototype.renderLoop = function() {
                        var _this = this;
                        if (this.isDestroyed) return;
                        this.stats && this.stats.begin();
                        this.render();
                        if (this.isStopped) return;
                        var fpsLimit = this.state.data.autoRender.fps;
                        if (fpsLimit) {
                            var delay = 1e3 / fpsLimit;
                            setTimeout(function() {
                                return requestAnimationFrame(function() {
                                    return _this.renderLoop();
                                });
                            }, delay);
                        } else {
                            requestAnimationFrame(function() {
                                return _this.renderLoop();
                            });
                        }
                        this.stats && this.stats.end();
                    };
                    Chart.prototype.render = function() {
                        this.renderer.render(this.scene, this.camera);
                    };
                    Chart.prototype.stop = function() {
                        this.isStopped = true;
                    };
                    Chart.prototype.run = function() {
                        this.isStopped = false;
                        this.renderLoop();
                    };
                    Chart.prototype.destroy = function() {
                        this.isDestroyed = true;
                        this.stop();
                        this.state.destroy();
                        this.unbindEvents();
                        try {
                            this.renderer.forceContextLoss();
                        } catch (wtf) {}
                        this.renderer.context = null;
                        this.renderer.domElement = null;
                        this.renderer = null;
                    };
                    Chart.prototype.getState = function() {
                        return this.state.data;
                    };
                    Chart.prototype.getTrend = function(trendName) {
                        return this.state.getTrend(trendName);
                    };
                    Chart.prototype.setState = function(state) {
                        return this.state.setState(state);
                    };
                    Chart.prototype.bindEvents = function() {
                        var _this = this;
                        var $el = this.$el;
                        if (this.state.data.controls.enabled) {
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
                        if (this.state.data.autoResize) {
                            this.resizeSensor = new deps_1.ResizeSensor(this.$container, function() {
                                _this.onChartContainerResizeHandler(_this.$container.clientWidth, _this.$container.clientHeight);
                            });
                        }
                        this.unsubscribers = [ this.state.onTrendsChange(function() {
                            return _this.autoscroll();
                        }), this.state.screen.onTransformationFrame(function(options) {
                            return _this.onScreenTransformHandler(options);
                        }), this.state.onResize(function(options) {
                            return _this.onChartResize();
                        }) ];
                    };
                    Chart.prototype.unbindEvents = function() {
                        try {
                            this.resizeSensor && this.resizeSensor.detach();
                        } catch (e) {}
                        this.$el.remove();
                        this.unsubscribers.forEach(function(unsubscribe) {
                            return unsubscribe();
                        });
                    };
                    Chart.prototype.setupCamera = function() {
                        var camSettings = this.state.screen.getCameraSettings();
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
                        this.onScreenTransformHandler(this.state.screen.options);
                    };
                    Chart.prototype.onScreenTransformHandler = function(options) {
                        if (options.scrollX != void 0) {
                            var scrollX_1 = this.cameraInitialPosition.x + options.scrollX;
                            this.camera.position.setX(scrollX_1);
                        }
                        if (options.scrollY != void 0) {
                            var scrollY_1 = this.cameraInitialPosition.y + options.scrollY;
                            this.camera.position.setY(scrollY_1);
                        }
                    };
                    Chart.prototype.autoscroll = function() {
                        var state = this.state;
                        if (!state.data.autoScroll) return;
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
                            this.setState({
                                xAxis: {
                                    range: {
                                        scroll: currentScroll + scrollDelta
                                    }
                                }
                            });
                        }
                    };
                    Chart.prototype.onScrollStop = function() {};
                    Chart.prototype.onMouseDown = function(ev) {
                        this.setState({
                            cursor: {
                                dragMode: true,
                                x: ev.clientX,
                                y: ev.clientY
                            }
                        });
                    };
                    Chart.prototype.onMouseUp = function(ev) {
                        this.setState({
                            cursor: {
                                dragMode: false
                            }
                        });
                    };
                    Chart.prototype.onMouseMove = function(ev) {
                        if (this.state.data.cursor.dragMode) {
                            this.setState({
                                cursor: {
                                    dragMode: true,
                                    x: ev.clientX,
                                    y: ev.clientY
                                }
                            });
                        }
                    };
                    Chart.prototype.onMouseWheel = function(ev) {
                        ev.stopPropagation();
                        ev.preventDefault();
                        var zoomOrigin = ev.layerX / this.state.data.width;
                        var zoomValue = 1 + ev.wheelDeltaY * .001;
                        this.zoom(zoomValue, zoomOrigin);
                    };
                    Chart.prototype.onTouchMove = function(ev) {
                        this.setState({
                            cursor: {
                                dragMode: true,
                                x: ev.touches[0].clientX,
                                y: ev.touches[0].clientY
                            }
                        });
                    };
                    Chart.prototype.onTouchEnd = function(ev) {
                        this.setState({
                            cursor: {
                                dragMode: false
                            }
                        });
                    };
                    Chart.prototype.onChartContainerResizeHandler = function(width, height) {
                        this.setState({
                            width: width,
                            height: height
                        });
                    };
                    Chart.prototype.onChartResize = function() {
                        var _a = this.state.data, width = _a.width, height = _a.height;
                        this.renderer.setSize(width, height);
                        this.setupCamera();
                    };
                    Chart.prototype.zoom = function(zoomValue, zoomOrigin) {
                        var _this = this;
                        var MAX_ZOOM_VALUE = 1.5;
                        var MIN_ZOOM_VALUE = .7;
                        zoomValue = Math.min(zoomValue, MAX_ZOOM_VALUE);
                        zoomValue = Math.max(zoomValue, MIN_ZOOM_VALUE);
                        var autoScrollIsEnabled = this.state.data.autoScroll;
                        if (autoScrollIsEnabled) this.state.setState({
                            autoScroll: false
                        });
                        this.state.zoom(zoomValue, zoomOrigin).then(function() {
                            if (autoScrollIsEnabled) _this.setState({
                                autoScroll: true
                            });
                        });
                    };
                    Chart.createPreviewChart = function(userOptions, $el) {
                        var previewChartOptions = {
                            animations: {
                                enabled: false
                            },
                            widgets: {
                                Grid: {
                                    enabled: false
                                },
                                Axis: {
                                    enabled: false
                                },
                                TrendsGradient: {
                                    enabled: false
                                }
                            }
                        };
                        var options = Utils_1.Utils.deepMerge(userOptions, previewChartOptions);
                        return new Chart(options, $el);
                    };
                    Chart.devicePixelRatio = window.devicePixelRatio;
                    Chart.installedWidgets = {};
                    Chart.renderers = {
                        CanvasRenderer: THREE.CanvasRenderer,
                        WebGLRenderer: THREE.WebGLRenderer
                    };
                    return Chart;
                }();
                exports.Chart = Chart;
                Chart.installWidget(TrendsLineWidget_1.TrendsLineWidget);
                Chart.installWidget(TrendsCandleWidget_1.TrendsCandlesWidget);
                Chart.installWidget(AxisWidget_1.AxisWidget);
                Chart.installWidget(GridWidget_1.GridWidget);
                Chart.installWidget(TrendsBeaconWidget_1.TrendsBeaconWidget);
                Chart.installWidget(TrendsIndicatorWidget_1.TrendsIndicatorWidget);
                Chart.installWidget(TrendsLoadingWidget_1.TrendsLoadingWidget);
                Chart.installWidget(AxisMarksWidget_1.AxisMarksWidget);
                Chart.installWidget(BorderWidget_1.BorderWidget);
            }, function(module, exports, __webpack_require__) {
                "use strict";
                window.Stats = __webpack_require__(4);
                window.TweenLite = __webpack_require__(5);
                __webpack_require__(7);
                __webpack_require__(8);
                exports.isPlainObject = __webpack_require__(9);
                exports.EE2 = __webpack_require__(11);
                var es6_promise_1 = __webpack_require__(12);
                exports.Promise = es6_promise_1.Promise;
                exports.ResizeSensor = __webpack_require__(13);
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
                var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
                (function(global) {
                    /*!
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
                    var _gsScope = typeof module !== "undefined" && module.exports && typeof global !== "undefined" ? global : this || window;
                    (_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
                        "use strict";
                        _gsScope._gsDefine("TweenMax", [ "core.Animation", "core.SimpleTimeline", "TweenLite" ], function(Animation, SimpleTimeline, TweenLite) {
                            var _slice = function(a) {
                                var b = [], l = a.length, i;
                                for (i = 0; i !== l; b.push(a[i++])) ;
                                return b;
                            }, _applyCycle = function(vars, targets, i) {
                                var alt = vars.cycle, p, val;
                                for (p in alt) {
                                    val = alt[p];
                                    vars[p] = typeof val === "function" ? val.call(targets[i], i) : val[i % val.length];
                                }
                                delete vars.cycle;
                            }, TweenMax = function(target, duration, vars) {
                                TweenLite.call(this, target, duration, vars);
                                this._cycle = 0;
                                this._yoyo = this.vars.yoyo === true;
                                this._repeat = this.vars.repeat || 0;
                                this._repeatDelay = this.vars.repeatDelay || 0;
                                this._dirty = true;
                                this.render = TweenMax.prototype.render;
                            }, _tinyNum = 1e-10, TweenLiteInternals = TweenLite._internals, _isSelector = TweenLiteInternals.isSelector, _isArray = TweenLiteInternals.isArray, p = TweenMax.prototype = TweenLite.to({}, .1, {}), _blankArray = [];
                            TweenMax.version = "1.18.5";
                            p.constructor = TweenMax;
                            p.kill()._gc = false;
                            TweenMax.killTweensOf = TweenMax.killDelayedCallsTo = TweenLite.killTweensOf;
                            TweenMax.getTweensOf = TweenLite.getTweensOf;
                            TweenMax.lagSmoothing = TweenLite.lagSmoothing;
                            TweenMax.ticker = TweenLite.ticker;
                            TweenMax.render = TweenLite.render;
                            p.invalidate = function() {
                                this._yoyo = this.vars.yoyo === true;
                                this._repeat = this.vars.repeat || 0;
                                this._repeatDelay = this.vars.repeatDelay || 0;
                                this._uncache(true);
                                return TweenLite.prototype.invalidate.call(this);
                            };
                            p.updateTo = function(vars, resetDuration) {
                                var curRatio = this.ratio, immediate = this.vars.immediateRender || vars.immediateRender, p;
                                if (resetDuration && this._startTime < this._timeline._time) {
                                    this._startTime = this._timeline._time;
                                    this._uncache(false);
                                    if (this._gc) {
                                        this._enabled(true, false);
                                    } else {
                                        this._timeline.insert(this, this._startTime - this._delay);
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
                                            TweenLite._onPluginEvent("_onDisable", this);
                                        }
                                        if (this._time / this._duration > .998) {
                                            var prevTime = this._totalTime;
                                            this.render(0, true, false);
                                            this._initted = false;
                                            this.render(prevTime, true, false);
                                        } else {
                                            this._initted = false;
                                            this._init();
                                            if (this._time > 0 || immediate) {
                                                var inv = 1 / (1 - curRatio), pt = this._firstPT, endValue;
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
                                if (!this._initted) if (this._duration === 0 && this.vars.repeat) {
                                    this.invalidate();
                                }
                                var totalDur = !this._dirty ? this._totalDuration : this.totalDuration(), prevTime = this._time, prevTotalTime = this._totalTime, prevCycle = this._cycle, duration = this._duration, prevRawPrevTime = this._rawPrevTime, isComplete, callback, pt, cycleDuration, r, type, pow, rawPrevTime;
                                if (time >= totalDur - 1e-7) {
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
                                        force = force || this._timeline.autoRemoveChildren;
                                    }
                                    if (duration === 0) if (this._initted || !this.vars.lazy || force) {
                                        if (this._startTime === this._timeline._duration) {
                                            time = 0;
                                        }
                                        if (prevRawPrevTime < 0 || time <= 0 && time >= -1e-7 || prevRawPrevTime === _tinyNum && this.data !== "isPause") if (prevRawPrevTime !== time) {
                                            force = true;
                                            if (prevRawPrevTime > _tinyNum) {
                                                callback = "onReverseComplete";
                                            }
                                        }
                                        this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum;
                                    }
                                } else if (time < 1e-7) {
                                    this._totalTime = this._time = this._cycle = 0;
                                    this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
                                    if (prevTotalTime !== 0 || duration === 0 && prevRawPrevTime > 0) {
                                        callback = "onReverseComplete";
                                        isComplete = this._reversed;
                                    }
                                    if (time < 0) {
                                        this._active = false;
                                        if (duration === 0) if (this._initted || !this.vars.lazy || force) {
                                            if (prevRawPrevTime >= 0) {
                                                force = true;
                                            }
                                            this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum;
                                        }
                                    }
                                    if (!this._initted) {
                                        force = true;
                                    }
                                } else {
                                    this._totalTime = this._time = time;
                                    if (this._repeat !== 0) {
                                        cycleDuration = duration + this._repeatDelay;
                                        this._cycle = this._totalTime / cycleDuration >> 0;
                                        if (this._cycle !== 0) if (this._cycle === this._totalTime / cycleDuration && prevTotalTime <= time) {
                                            this._cycle--;
                                        }
                                        this._time = this._totalTime - this._cycle * cycleDuration;
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
                                        if (type === 1 || type === 3 && r >= .5) {
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
                                        } else if (this._time / duration < .5) {
                                            this.ratio = r / 2;
                                        } else {
                                            this.ratio = 1 - r / 2;
                                        }
                                    } else {
                                        this.ratio = this._ease.getRatio(this._time / duration);
                                    }
                                }
                                if (prevTime === this._time && !force && prevCycle === this._cycle) {
                                    if (prevTotalTime !== this._totalTime) if (this._onUpdate) if (!suppressEvents) {
                                        this._callback("onUpdate");
                                    }
                                    return;
                                } else if (!this._initted) {
                                    this._init();
                                    if (!this._initted || this._gc) {
                                        return;
                                    } else if (!force && this._firstPT && (this.vars.lazy !== false && this._duration || this.vars.lazy && !this._duration)) {
                                        this._time = prevTime;
                                        this._totalTime = prevTotalTime;
                                        this._rawPrevTime = prevRawPrevTime;
                                        this._cycle = prevCycle;
                                        TweenLiteInternals.lazyTweens.push(this);
                                        this._lazy = [ time, suppressEvents ];
                                        return;
                                    }
                                    if (this._time && !isComplete) {
                                        this.ratio = this._ease.getRatio(this._time / duration);
                                    } else if (isComplete && this._ease._calcEnd) {
                                        this.ratio = this._ease.getRatio(this._time === 0 ? 0 : 1);
                                    }
                                }
                                if (this._lazy !== false) {
                                    this._lazy = false;
                                }
                                if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
                                    this._active = true;
                                }
                                if (prevTotalTime === 0) {
                                    if (this._initted === 2 && time > 0) {
                                        this._init();
                                    }
                                    if (this._startAt) {
                                        if (time >= 0) {
                                            this._startAt.render(time, suppressEvents, force);
                                        } else if (!callback) {
                                            callback = "_dummyGS";
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
                                    if (time < 0) if (this._startAt && this._startTime) {
                                        this._startAt.render(time, suppressEvents, force);
                                    }
                                    if (!suppressEvents) if (this._totalTime !== prevTotalTime || callback) {
                                        this._callback("onUpdate");
                                    }
                                }
                                if (this._cycle !== prevCycle) if (!suppressEvents) if (!this._gc) if (this.vars.onRepeat) {
                                    this._callback("onRepeat");
                                }
                                if (callback) if (!this._gc || force) {
                                    if (time < 0 && this._startAt && !this._onUpdate && this._startTime) {
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
                                    if (duration === 0 && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum) {
                                        this._rawPrevTime = 0;
                                    }
                                }
                            };
                            TweenMax.to = function(target, duration, vars) {
                                return new TweenMax(target, duration, vars);
                            };
                            TweenMax.from = function(target, duration, vars) {
                                vars.runBackwards = true;
                                vars.immediateRender = vars.immediateRender != false;
                                return new TweenMax(target, duration, vars);
                            };
                            TweenMax.fromTo = function(target, duration, fromVars, toVars) {
                                toVars.startAt = fromVars;
                                toVars.immediateRender = toVars.immediateRender != false && fromVars.immediateRender != false;
                                return new TweenMax(target, duration, toVars);
                            };
                            TweenMax.staggerTo = TweenMax.allTo = function(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                                stagger = stagger || 0;
                                var delay = 0, a = [], finalComplete = function() {
                                    if (vars.onComplete) {
                                        vars.onComplete.apply(vars.onCompleteScope || this, arguments);
                                    }
                                    onCompleteAll.apply(onCompleteAllScope || vars.callbackScope || this, onCompleteAllParams || _blankArray);
                                }, cycle = vars.cycle, fromCycle = vars.startAt && vars.startAt.cycle, l, copy, i, p;
                                if (!_isArray(targets)) {
                                    if (typeof targets === "string") {
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
                                vars.immediateRender = vars.immediateRender != false;
                                return TweenMax.staggerTo(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
                            };
                            TweenMax.staggerFromTo = TweenMax.allFromTo = function(targets, duration, fromVars, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                                toVars.startAt = fromVars;
                                toVars.immediateRender = toVars.immediateRender != false && fromVars.immediateRender != false;
                                return TweenMax.staggerTo(targets, duration, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
                            };
                            TweenMax.delayedCall = function(delay, callback, params, scope, useFrames) {
                                return new TweenMax(callback, 0, {
                                    delay: delay,
                                    onComplete: callback,
                                    onCompleteParams: params,
                                    callbackScope: scope,
                                    onReverseComplete: callback,
                                    onReverseCompleteParams: params,
                                    immediateRender: false,
                                    useFrames: useFrames,
                                    overwrite: 0
                                });
                            };
                            TweenMax.set = function(target, vars) {
                                return new TweenMax(target, 0, vars);
                            };
                            TweenMax.isTweening = function(target) {
                                return TweenLite.getTweensOf(target, true).length > 0;
                            };
                            var _getChildrenOf = function(timeline, includeTimelines) {
                                var a = [], cnt = 0, tween = timeline._first;
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
                            }, getAllTweens = TweenMax.getAllTweens = function(includeTimelines) {
                                return _getChildrenOf(Animation._rootTimeline, includeTimelines).concat(_getChildrenOf(Animation._rootFramesTimeline, includeTimelines));
                            };
                            TweenMax.killAll = function(complete, tweens, delayedCalls, timelines) {
                                if (tweens == null) {
                                    tweens = true;
                                }
                                if (delayedCalls == null) {
                                    delayedCalls = true;
                                }
                                var a = getAllTweens(timelines != false), l = a.length, allTrue = tweens && delayedCalls && timelines, isDC, tween, i;
                                for (i = 0; i < l; i++) {
                                    tween = a[i];
                                    if (allTrue || tween instanceof SimpleTimeline || (isDC = tween.target === tween.vars.onComplete) && delayedCalls || tweens && !isDC) {
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
                                var tl = TweenLiteInternals.tweenLookup, a, curParent, p, i, l;
                                if (typeof parent === "string") {
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
                                tweens = tweens !== false;
                                delayedCalls = delayedCalls !== false;
                                timelines = timelines !== false;
                                var a = getAllTweens(timelines), allTrue = tweens && delayedCalls && timelines, i = a.length, isDC, tween;
                                while (--i > -1) {
                                    tween = a[i];
                                    if (allTrue || tween instanceof SimpleTimeline || (isDC = tween.target === tween.vars.onComplete) && delayedCalls || tweens && !isDC) {
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
                                var tl = Animation._rootTimeline, t = TweenLite.ticker.time;
                                if (!arguments.length) {
                                    return tl._timeScale;
                                }
                                value = value || _tinyNum;
                                tl._startTime = t - (t - tl._startTime) * tl._timeScale / value;
                                tl = Animation._rootFramesTimeline;
                                t = TweenLite.ticker.frame;
                                tl._startTime = t - (t - tl._startTime) * tl._timeScale / value;
                                tl._timeScale = Animation._rootTimeline._timeScale = value;
                                return value;
                            };
                            p.progress = function(value, suppressEvents) {
                                return !arguments.length ? this._time / this.duration() : this.totalTime(this.duration() * (this._yoyo && (this._cycle & 1) !== 0 ? 1 - value : value) + this._cycle * (this._duration + this._repeatDelay), suppressEvents);
                            };
                            p.totalProgress = function(value, suppressEvents) {
                                return !arguments.length ? this._totalTime / this.totalDuration() : this.totalTime(this.totalDuration() * value, suppressEvents);
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
                                    value = this._duration - value + this._cycle * (this._duration + this._repeatDelay);
                                } else if (this._repeat !== 0) {
                                    value += this._cycle * (this._duration + this._repeatDelay);
                                }
                                return this.totalTime(value, suppressEvents);
                            };
                            p.duration = function(value) {
                                if (!arguments.length) {
                                    return this._duration;
                                }
                                return Animation.prototype.duration.call(this, value);
                            };
                            p.totalDuration = function(value) {
                                if (!arguments.length) {
                                    if (this._dirty) {
                                        this._totalDuration = this._repeat === -1 ? 999999999999 : this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat;
                                        this._dirty = false;
                                    }
                                    return this._totalDuration;
                                }
                                return this._repeat === -1 ? this : this.duration((value - this._repeat * this._repeatDelay) / (this._repeat + 1));
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
                        _gsScope._gsDefine("TimelineLite", [ "core.Animation", "core.SimpleTimeline", "TweenLite" ], function(Animation, SimpleTimeline, TweenLite) {
                            var TimelineLite = function(vars) {
                                SimpleTimeline.call(this, vars);
                                this._labels = {};
                                this.autoRemoveChildren = this.vars.autoRemoveChildren === true;
                                this.smoothChildTiming = this.vars.smoothChildTiming === true;
                                this._sortChildren = true;
                                this._onUpdate = this.vars.onUpdate;
                                var v = this.vars, val, p;
                                for (p in v) {
                                    val = v[p];
                                    if (_isArray(val)) if (val.join("").indexOf("{self}") !== -1) {
                                        v[p] = this._swapSelfInParams(val);
                                    }
                                }
                                if (_isArray(v.tweens)) {
                                    this.add(v.tweens, 0, v.align, v.stagger);
                                }
                            }, _tinyNum = 1e-10, TweenLiteInternals = TweenLite._internals, _internals = TimelineLite._internals = {}, _isSelector = TweenLiteInternals.isSelector, _isArray = TweenLiteInternals.isArray, _lazyTweens = TweenLiteInternals.lazyTweens, _lazyRender = TweenLiteInternals.lazyRender, _globals = _gsScope._gsDefine.globals, _copy = function(vars) {
                                var copy = {}, p;
                                for (p in vars) {
                                    copy[p] = vars[p];
                                }
                                return copy;
                            }, _applyCycle = function(vars, targets, i) {
                                var alt = vars.cycle, p, val;
                                for (p in alt) {
                                    val = alt[p];
                                    vars[p] = typeof val === "function" ? val.call(targets[i], i) : val[i % val.length];
                                }
                                delete vars.cycle;
                            }, _pauseCallback = _internals.pauseCallback = function() {}, _slice = function(a) {
                                var b = [], l = a.length, i;
                                for (i = 0; i !== l; b.push(a[i++])) ;
                                return b;
                            }, p = TimelineLite.prototype = new SimpleTimeline();
                            TimelineLite.version = "1.18.5";
                            p.constructor = TimelineLite;
                            p.kill()._gc = p._forcingPlayhead = p._hasPause = false;
                            p.to = function(target, duration, vars, position) {
                                var Engine = vars.repeat && _globals.TweenMax || TweenLite;
                                return duration ? this.add(new Engine(target, duration, vars), position) : this.set(target, vars, position);
                            };
                            p.from = function(target, duration, vars, position) {
                                return this.add((vars.repeat && _globals.TweenMax || TweenLite).from(target, duration, vars), position);
                            };
                            p.fromTo = function(target, duration, fromVars, toVars, position) {
                                var Engine = toVars.repeat && _globals.TweenMax || TweenLite;
                                return duration ? this.add(Engine.fromTo(target, duration, fromVars, toVars), position) : this.set(target, toVars, position);
                            };
                            p.staggerTo = function(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                                var tl = new TimelineLite({
                                    onComplete: onCompleteAll,
                                    onCompleteParams: onCompleteAllParams,
                                    callbackScope: onCompleteAllScope,
                                    smoothChildTiming: this.smoothChildTiming
                                }), cycle = vars.cycle, copy, i;
                                if (typeof targets === "string") {
                                    targets = TweenLite.selector(targets) || targets;
                                }
                                targets = targets || [];
                                if (_isSelector(targets)) {
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
                                vars.immediateRender = vars.immediateRender != false;
                                vars.runBackwards = true;
                                return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
                            };
                            p.staggerFromTo = function(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                                toVars.startAt = fromVars;
                                toVars.immediateRender = toVars.immediateRender != false && fromVars.immediateRender != false;
                                return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
                            };
                            p.call = function(callback, params, scope, position) {
                                return this.add(TweenLite.delayedCall(0, callback, params, scope), position);
                            };
                            p.set = function(target, vars, position) {
                                position = this._parseTimeOrLabel(position, 0, true);
                                if (vars.immediateRender == null) {
                                    vars.immediateRender = position === this._time && !this._paused;
                                }
                                return this.add(new TweenLite(target, 0, vars), position);
                            };
                            TimelineLite.exportRoot = function(vars, ignoreDelayedCalls) {
                                vars = vars || {};
                                if (vars.smoothChildTiming == null) {
                                    vars.smoothChildTiming = true;
                                }
                                var tl = new TimelineLite(vars), root = tl._timeline, tween, next;
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
                                if (typeof position !== "number") {
                                    position = this._parseTimeOrLabel(position, 0, true, value);
                                }
                                if (!(value instanceof Animation)) {
                                    if (value instanceof Array || value && value.push && _isArray(value)) {
                                        align = align || "normal";
                                        stagger = stagger || 0;
                                        curTime = position;
                                        l = value.length;
                                        for (i = 0; i < l; i++) {
                                            if (_isArray(child = value[i])) {
                                                child = new TimelineLite({
                                                    tweens: child
                                                });
                                            }
                                            this.add(child, curTime);
                                            if (typeof child !== "string" && typeof child !== "function") {
                                                if (align === "sequence") {
                                                    curTime = child._startTime + child.totalDuration() / child._timeScale;
                                                } else if (align === "start") {
                                                    child._startTime -= child.delay();
                                                }
                                            }
                                            curTime += stagger;
                                        }
                                        return this._uncache(true);
                                    } else if (typeof value === "string") {
                                        return this.addLabel(value, position);
                                    } else if (typeof value === "function") {
                                        value = TweenLite.delayedCall(0, value);
                                    } else {
                                        throw "Cannot add " + value + " into the timeline; it is not a tween, timeline, function, or string.";
                                    }
                                }
                                SimpleTimeline.prototype.add.call(this, value, position);
                                if (this._gc || this._time === this._duration) if (!this._paused) if (this._duration < this.duration()) {
                                    tl = this;
                                    beforeRawTime = tl.rawTime() > value._startTime;
                                    while (tl._timeline) {
                                        if (beforeRawTime && tl._timeline.smoothChildTiming) {
                                            tl.totalTime(tl._totalTime, true);
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
                                    var tl = value._timeline = value.vars.useFrames ? Animation._rootFramesTimeline : Animation._rootTimeline;
                                    value._startTime = (value._paused ? value._pauseTime : tl._time) - (!value._reversed ? value._totalTime : value.totalDuration() - value._totalTime) / value._timeScale;
                                    return this;
                                } else if (value instanceof Array || value && value.push && _isArray(value)) {
                                    var i = value.length;
                                    while (--i > -1) {
                                        this.remove(value[i]);
                                    }
                                    return this;
                                } else if (typeof value === "string") {
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
                                return this._labels[label] != null ? this._labels[label] : -1;
                            };
                            p._parseTimeOrLabel = function(timeOrLabel, offsetOrLabel, appendIfAbsent, ignore) {
                                var i;
                                if (ignore instanceof Animation && ignore.timeline === this) {
                                    this.remove(ignore);
                                } else if (ignore && (ignore instanceof Array || ignore.push && _isArray(ignore))) {
                                    i = ignore.length;
                                    while (--i > -1) {
                                        if (ignore[i] instanceof Animation && ignore[i].timeline === this) {
                                            this.remove(ignore[i]);
                                        }
                                    }
                                }
                                if (typeof offsetOrLabel === "string") {
                                    return this._parseTimeOrLabel(offsetOrLabel, appendIfAbsent && typeof timeOrLabel === "number" && this._labels[offsetOrLabel] == null ? timeOrLabel - this.duration() : 0, appendIfAbsent);
                                }
                                offsetOrLabel = offsetOrLabel || 0;
                                if (typeof timeOrLabel === "string" && (isNaN(timeOrLabel) || this._labels[timeOrLabel] != null)) {
                                    i = timeOrLabel.indexOf("=");
                                    if (i === -1) {
                                        if (this._labels[timeOrLabel] == null) {
                                            return appendIfAbsent ? this._labels[timeOrLabel] = this.duration() + offsetOrLabel : offsetOrLabel;
                                        }
                                        return this._labels[timeOrLabel] + offsetOrLabel;
                                    }
                                    offsetOrLabel = parseInt(timeOrLabel.charAt(i - 1) + "1", 10) * Number(timeOrLabel.substr(i + 1));
                                    timeOrLabel = i > 1 ? this._parseTimeOrLabel(timeOrLabel.substr(0, i - 1), 0, appendIfAbsent) : this.duration();
                                } else if (timeOrLabel == null) {
                                    timeOrLabel = this.duration();
                                }
                                return Number(timeOrLabel) + offsetOrLabel;
                            };
                            p.seek = function(position, suppressEvents) {
                                return this.totalTime(typeof position === "number" ? position : this._parseTimeOrLabel(position), suppressEvents !== false);
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
                                var totalDur = !this._dirty ? this._totalDuration : this.totalDuration(), prevTime = this._time, prevStart = this._startTime, prevTimeScale = this._timeScale, prevPaused = this._paused, tween, isComplete, next, callback, internalForce, pauseTween, curTime;
                                if (time >= totalDur - 1e-7) {
                                    this._totalTime = this._time = totalDur;
                                    if (!this._reversed) if (!this._hasPausedChild()) {
                                        isComplete = true;
                                        callback = "onComplete";
                                        internalForce = !!this._timeline.autoRemoveChildren;
                                        if (this._duration === 0) if (time <= 0 && time >= -1e-7 || this._rawPrevTime < 0 || this._rawPrevTime === _tinyNum) if (this._rawPrevTime !== time && this._first) {
                                            internalForce = true;
                                            if (this._rawPrevTime > _tinyNum) {
                                                callback = "onReverseComplete";
                                            }
                                        }
                                    }
                                    this._rawPrevTime = this._duration || !suppressEvents || time || this._rawPrevTime === time ? time : _tinyNum;
                                    time = totalDur + 1e-4;
                                } else if (time < 1e-7) {
                                    this._totalTime = this._time = 0;
                                    if (prevTime !== 0 || this._duration === 0 && this._rawPrevTime !== _tinyNum && (this._rawPrevTime > 0 || time < 0 && this._rawPrevTime >= 0)) {
                                        callback = "onReverseComplete";
                                        isComplete = this._reversed;
                                    }
                                    if (time < 0) {
                                        this._active = false;
                                        if (this._timeline.autoRemoveChildren && this._reversed) {
                                            internalForce = isComplete = true;
                                            callback = "onReverseComplete";
                                        } else if (this._rawPrevTime >= 0 && this._first) {
                                            internalForce = true;
                                        }
                                        this._rawPrevTime = time;
                                    } else {
                                        this._rawPrevTime = this._duration || !suppressEvents || time || this._rawPrevTime === time ? time : _tinyNum;
                                        if (time === 0 && isComplete) {
                                            tween = this._first;
                                            while (tween && tween._startTime === 0) {
                                                if (!tween._duration) {
                                                    isComplete = false;
                                                }
                                                tween = tween._next;
                                            }
                                        }
                                        time = 0;
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
                                            this._totalTime = time + this._cycle * (this._totalDuration + this._repeatDelay);
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
                                    this._active = true;
                                }
                                if (prevTime === 0) if (this.vars.onStart) if (this._time !== 0 || !this._duration) if (!suppressEvents) {
                                    this._callback("onStart");
                                }
                                curTime = this._time;
                                if (curTime >= prevTime) {
                                    tween = this._first;
                                    while (tween) {
                                        next = tween._next;
                                        if (curTime !== this._time || this._paused && !prevPaused) {
                                            break;
                                        } else if (tween._active || tween._startTime <= curTime && !tween._paused && !tween._gc) {
                                            if (pauseTween === tween) {
                                                this.pause();
                                            }
                                            if (!tween._reversed) {
                                                tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
                                            } else {
                                                tween.render((!tween._dirty ? tween._totalDuration : tween.totalDuration()) - (time - tween._startTime) * tween._timeScale, suppressEvents, force);
                                            }
                                        }
                                        tween = next;
                                    }
                                } else {
                                    tween = this._last;
                                    while (tween) {
                                        next = tween._prev;
                                        if (curTime !== this._time || this._paused && !prevPaused) {
                                            break;
                                        } else if (tween._active || tween._startTime <= prevTime && !tween._paused && !tween._gc) {
                                            if (pauseTween === tween) {
                                                pauseTween = tween._prev;
                                                while (pauseTween && pauseTween.endTime() > this._time) {
                                                    pauseTween.render(pauseTween._reversed ? pauseTween.totalDuration() - (time - pauseTween._startTime) * pauseTween._timeScale : (time - pauseTween._startTime) * pauseTween._timeScale, suppressEvents, force);
                                                    pauseTween = pauseTween._prev;
                                                }
                                                pauseTween = null;
                                                this.pause();
                                            }
                                            if (!tween._reversed) {
                                                tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
                                            } else {
                                                tween.render((!tween._dirty ? tween._totalDuration : tween.totalDuration()) - (time - tween._startTime) * tween._timeScale, suppressEvents, force);
                                            }
                                        }
                                        tween = next;
                                    }
                                }
                                if (this._onUpdate) if (!suppressEvents) {
                                    if (_lazyTweens.length) {
                                        _lazyRender();
                                    }
                                    this._callback("onUpdate");
                                }
                                if (callback) if (!this._gc) if (prevStart === this._startTime || prevTimeScale !== this._timeScale) if (this._time === 0 || totalDur >= this.totalDuration()) {
                                    if (isComplete) {
                                        if (_lazyTweens.length) {
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
                                    if (tween._paused || tween instanceof TimelineLite && tween._hasPausedChild()) {
                                        return true;
                                    }
                                    tween = tween._next;
                                }
                                return false;
                            };
                            p.getChildren = function(nested, tweens, timelines, ignoreBeforeTime) {
                                ignoreBeforeTime = ignoreBeforeTime || -9999999999;
                                var a = [], tween = this._first, cnt = 0;
                                while (tween) {
                                    if (tween._startTime < ignoreBeforeTime) {} else if (tween instanceof TweenLite) {
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
                                var disabled = this._gc, a = [], cnt = 0, tweens, i;
                                if (disabled) {
                                    this._enabled(true, true);
                                }
                                tweens = TweenLite.getTweensOf(target);
                                i = tweens.length;
                                while (--i > -1) {
                                    if (tweens[i].timeline === this || nested && this._contains(tweens[i])) {
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
                                var tween = this._first, labels = this._labels, p;
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
                                var tweens = !target ? this.getChildren(true, true, false) : this.getTweensOf(target), i = tweens.length, changed = false;
                                while (--i > -1) {
                                    if (tweens[i]._kill(vars, target)) {
                                        changed = true;
                                    }
                                }
                                return changed;
                            };
                            p.clear = function(labels) {
                                var tweens = this.getChildren(false, true, true), i = tweens.length;
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
                                return Animation.prototype.invalidate.call(this);
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
                                        this.totalDuration();
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
                                        var max = 0, tween = this._last, prevStart = 999999999999, prev, end;
                                        while (tween) {
                                            prev = tween._prev;
                                            if (tween._dirty) {
                                                tween.totalDuration();
                                            }
                                            if (tween._startTime > prevStart && this._sortChildren && !tween._paused) {
                                                this.add(tween, tween._startTime - tween._delay);
                                            } else {
                                                prevStart = tween._startTime;
                                            }
                                            if (tween._startTime < 0 && !tween._paused) {
                                                max -= tween._startTime;
                                                if (this._timeline.smoothChildTiming) {
                                                    this._startTime += tween._startTime / this._timeScale;
                                                }
                                                this.shiftChildren(-tween._startTime, false, -9999999999);
                                                prevStart = 0;
                                            }
                                            end = tween._startTime + tween._totalDuration / tween._timeScale;
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
                                return value && this.totalDuration() ? this.timeScale(this._totalDuration / value) : this;
                            };
                            p.paused = function(value) {
                                if (!value) {
                                    var tween = this._first, time = this._time;
                                    while (tween) {
                                        if (tween._startTime === time && tween.data === "isPause") {
                                            tween._rawPrevTime = 0;
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
                                return tl === Animation._rootFramesTimeline;
                            };
                            p.rawTime = function() {
                                return this._paused ? this._totalTime : (this._timeline.rawTime() - this._startTime) * this._timeScale;
                            };
                            return TimelineLite;
                        }, true);
                        _gsScope._gsDefine("TimelineMax", [ "TimelineLite", "TweenLite", "easing.Ease" ], function(TimelineLite, TweenLite, Ease) {
                            var TimelineMax = function(vars) {
                                TimelineLite.call(this, vars);
                                this._repeat = this.vars.repeat || 0;
                                this._repeatDelay = this.vars.repeatDelay || 0;
                                this._cycle = 0;
                                this._yoyo = this.vars.yoyo === true;
                                this._dirty = true;
                            }, _tinyNum = 1e-10, TweenLiteInternals = TweenLite._internals, _lazyTweens = TweenLiteInternals.lazyTweens, _lazyRender = TweenLiteInternals.lazyRender, _easeNone = new Ease(null, null, 1, 0), p = TimelineMax.prototype = new TimelineLite();
                            p.constructor = TimelineMax;
                            p.kill()._gc = false;
                            TimelineMax.version = "1.18.5";
                            p.invalidate = function() {
                                this._yoyo = this.vars.yoyo === true;
                                this._repeat = this.vars.repeat || 0;
                                this._repeatDelay = this.vars.repeatDelay || 0;
                                this._uncache(true);
                                return TimelineLite.prototype.invalidate.call(this);
                            };
                            p.addCallback = function(callback, position, params, scope) {
                                return this.add(TweenLite.delayedCall(0, callback, params, scope), position);
                            };
                            p.removeCallback = function(callback, position) {
                                if (callback) {
                                    if (position == null) {
                                        this._kill(null, callback);
                                    } else {
                                        var a = this.getTweensOf(callback, false), i = a.length, time = this._parseTimeOrLabel(position);
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
                                var copy = {
                                    ease: _easeNone,
                                    useFrames: this.usesFrames(),
                                    immediateRender: false
                                }, duration, p, t;
                                for (p in vars) {
                                    copy[p] = vars[p];
                                }
                                copy.time = this._parseTimeOrLabel(position);
                                duration = Math.abs(Number(copy.time) - this._time) / this._timeScale || .001;
                                t = new TweenLite(this, duration, copy);
                                copy.onStart = function() {
                                    t.target.paused(true);
                                    if (t.vars.time !== t.target.time() && duration === t.duration()) {
                                        t.duration(Math.abs(t.vars.time - t.target.time()) / t.target._timeScale);
                                    }
                                    if (vars.onStart) {
                                        t._callback("onStart");
                                    }
                                };
                                return t;
                            };
                            p.tweenFromTo = function(fromPosition, toPosition, vars) {
                                vars = vars || {};
                                fromPosition = this._parseTimeOrLabel(fromPosition);
                                vars.startAt = {
                                    onComplete: this.seek,
                                    onCompleteParams: [ fromPosition ],
                                    callbackScope: this
                                };
                                vars.immediateRender = vars.immediateRender !== false;
                                var t = this.tweenTo(toPosition, vars);
                                return t.duration(Math.abs(t.vars.time - fromPosition) / this._timeScale || .001);
                            };
                            p.render = function(time, suppressEvents, force) {
                                if (this._gc) {
                                    this._enabled(true, false);
                                }
                                var totalDur = !this._dirty ? this._totalDuration : this.totalDuration(), dur = this._duration, prevTime = this._time, prevTotalTime = this._totalTime, prevStart = this._startTime, prevTimeScale = this._timeScale, prevRawPrevTime = this._rawPrevTime, prevPaused = this._paused, prevCycle = this._cycle, tween, isComplete, next, callback, internalForce, cycleDuration, pauseTween, curTime;
                                if (time >= totalDur - 1e-7) {
                                    if (!this._locked) {
                                        this._totalTime = totalDur;
                                        this._cycle = this._repeat;
                                    }
                                    if (!this._reversed) if (!this._hasPausedChild()) {
                                        isComplete = true;
                                        callback = "onComplete";
                                        internalForce = !!this._timeline.autoRemoveChildren;
                                        if (this._duration === 0) if (time <= 0 && time >= -1e-7 || prevRawPrevTime < 0 || prevRawPrevTime === _tinyNum) if (prevRawPrevTime !== time && this._first) {
                                            internalForce = true;
                                            if (prevRawPrevTime > _tinyNum) {
                                                callback = "onReverseComplete";
                                            }
                                        }
                                    }
                                    this._rawPrevTime = this._duration || !suppressEvents || time || this._rawPrevTime === time ? time : _tinyNum;
                                    if (this._yoyo && (this._cycle & 1) !== 0) {
                                        this._time = time = 0;
                                    } else {
                                        this._time = dur;
                                        time = dur + 1e-4;
                                    }
                                } else if (time < 1e-7) {
                                    if (!this._locked) {
                                        this._totalTime = this._cycle = 0;
                                    }
                                    this._time = 0;
                                    if (prevTime !== 0 || dur === 0 && prevRawPrevTime !== _tinyNum && (prevRawPrevTime > 0 || time < 0 && prevRawPrevTime >= 0) && !this._locked) {
                                        callback = "onReverseComplete";
                                        isComplete = this._reversed;
                                    }
                                    if (time < 0) {
                                        this._active = false;
                                        if (this._timeline.autoRemoveChildren && this._reversed) {
                                            internalForce = isComplete = true;
                                            callback = "onReverseComplete";
                                        } else if (prevRawPrevTime >= 0 && this._first) {
                                            internalForce = true;
                                        }
                                        this._rawPrevTime = time;
                                    } else {
                                        this._rawPrevTime = dur || !suppressEvents || time || this._rawPrevTime === time ? time : _tinyNum;
                                        if (time === 0 && isComplete) {
                                            tween = this._first;
                                            while (tween && tween._startTime === 0) {
                                                if (!tween._duration) {
                                                    isComplete = false;
                                                }
                                                tween = tween._next;
                                            }
                                        }
                                        time = 0;
                                        if (!this._initted) {
                                            internalForce = true;
                                        }
                                    }
                                } else {
                                    if (dur === 0 && prevRawPrevTime < 0) {
                                        internalForce = true;
                                    }
                                    this._time = this._rawPrevTime = time;
                                    if (!this._locked) {
                                        this._totalTime = time;
                                        if (this._repeat !== 0) {
                                            cycleDuration = dur + this._repeatDelay;
                                            this._cycle = this._totalTime / cycleDuration >> 0;
                                            if (this._cycle !== 0) if (this._cycle === this._totalTime / cycleDuration && prevTotalTime <= time) {
                                                this._cycle--;
                                            }
                                            this._time = this._totalTime - this._cycle * cycleDuration;
                                            if (this._yoyo) if ((this._cycle & 1) !== 0) {
                                                this._time = dur - this._time;
                                            }
                                            if (this._time > dur) {
                                                this._time = dur;
                                                time = dur + 1e-4;
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
                                            this._totalTime = time + this._cycle * (this._totalDuration + this._repeatDelay);
                                        }
                                    }
                                }
                                if (this._cycle !== prevCycle) if (!this._locked) {
                                    var backwards = this._yoyo && (prevCycle & 1) !== 0, wrap = backwards === (this._yoyo && (this._cycle & 1) !== 0), recTotalTime = this._totalTime, recCycle = this._cycle, recRawPrevTime = this._rawPrevTime, recTime = this._time;
                                    this._totalTime = prevCycle * dur;
                                    if (this._cycle < prevCycle) {
                                        backwards = !backwards;
                                    } else {
                                        this._totalTime += dur;
                                    }
                                    this._time = prevTime;
                                    this._rawPrevTime = dur === 0 ? prevRawPrevTime - 1e-4 : prevRawPrevTime;
                                    this._cycle = prevCycle;
                                    this._locked = true;
                                    prevTime = backwards ? 0 : dur;
                                    this.render(prevTime, suppressEvents, dur === 0);
                                    if (!suppressEvents) if (!this._gc) {
                                        if (this.vars.onRepeat) {
                                            this._callback("onRepeat");
                                        }
                                    }
                                    if (prevTime !== this._time) {
                                        return;
                                    }
                                    if (wrap) {
                                        prevTime = backwards ? dur + 1e-4 : -1e-4;
                                        this.render(prevTime, true, false);
                                    }
                                    this._locked = false;
                                    if (this._paused && !prevPaused) {
                                        return;
                                    }
                                    this._time = recTime;
                                    this._totalTime = recTotalTime;
                                    this._cycle = recCycle;
                                    this._rawPrevTime = recRawPrevTime;
                                }
                                if ((this._time === prevTime || !this._first) && !force && !internalForce && !pauseTween) {
                                    if (prevTotalTime !== this._totalTime) if (this._onUpdate) if (!suppressEvents) {
                                        this._callback("onUpdate");
                                    }
                                    return;
                                } else if (!this._initted) {
                                    this._initted = true;
                                }
                                if (!this._active) if (!this._paused && this._totalTime !== prevTotalTime && time > 0) {
                                    this._active = true;
                                }
                                if (prevTotalTime === 0) if (this.vars.onStart) if (this._totalTime !== 0 || !this._totalDuration) if (!suppressEvents) {
                                    this._callback("onStart");
                                }
                                curTime = this._time;
                                if (curTime >= prevTime) {
                                    tween = this._first;
                                    while (tween) {
                                        next = tween._next;
                                        if (curTime !== this._time || this._paused && !prevPaused) {
                                            break;
                                        } else if (tween._active || tween._startTime <= this._time && !tween._paused && !tween._gc) {
                                            if (pauseTween === tween) {
                                                this.pause();
                                            }
                                            if (!tween._reversed) {
                                                tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
                                            } else {
                                                tween.render((!tween._dirty ? tween._totalDuration : tween.totalDuration()) - (time - tween._startTime) * tween._timeScale, suppressEvents, force);
                                            }
                                        }
                                        tween = next;
                                    }
                                } else {
                                    tween = this._last;
                                    while (tween) {
                                        next = tween._prev;
                                        if (curTime !== this._time || this._paused && !prevPaused) {
                                            break;
                                        } else if (tween._active || tween._startTime <= prevTime && !tween._paused && !tween._gc) {
                                            if (pauseTween === tween) {
                                                pauseTween = tween._prev;
                                                while (pauseTween && pauseTween.endTime() > this._time) {
                                                    pauseTween.render(pauseTween._reversed ? pauseTween.totalDuration() - (time - pauseTween._startTime) * pauseTween._timeScale : (time - pauseTween._startTime) * pauseTween._timeScale, suppressEvents, force);
                                                    pauseTween = pauseTween._prev;
                                                }
                                                pauseTween = null;
                                                this.pause();
                                            }
                                            if (!tween._reversed) {
                                                tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
                                            } else {
                                                tween.render((!tween._dirty ? tween._totalDuration : tween.totalDuration()) - (time - tween._startTime) * tween._timeScale, suppressEvents, force);
                                            }
                                        }
                                        tween = next;
                                    }
                                }
                                if (this._onUpdate) if (!suppressEvents) {
                                    if (_lazyTweens.length) {
                                        _lazyRender();
                                    }
                                    this._callback("onUpdate");
                                }
                                if (callback) if (!this._locked) if (!this._gc) if (prevStart === this._startTime || prevTimeScale !== this._timeScale) if (this._time === 0 || totalDur >= this.totalDuration()) {
                                    if (isComplete) {
                                        if (_lazyTweens.length) {
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
                                var a = [], all = this.getChildren(nested, tweens, timelines), cnt = 0, l = all.length, i, tween;
                                for (i = 0; i < l; i++) {
                                    tween = all[i];
                                    if (tween.isActive()) {
                                        a[cnt++] = tween;
                                    }
                                }
                                return a;
                            };
                            p.getLabelAfter = function(time) {
                                if (!time) if (time !== 0) {
                                    time = this._time;
                                }
                                var labels = this.getLabelsArray(), l = labels.length, i;
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
                                var labels = this.getLabelsArray(), i = labels.length;
                                while (--i > -1) {
                                    if (labels[i].time < time) {
                                        return labels[i].name;
                                    }
                                }
                                return null;
                            };
                            p.getLabelsArray = function() {
                                var a = [], cnt = 0, p;
                                for (p in this._labels) {
                                    a[cnt++] = {
                                        time: this._labels[p],
                                        name: p
                                    };
                                }
                                a.sort(function(a, b) {
                                    return a.time - b.time;
                                });
                                return a;
                            };
                            p.progress = function(value, suppressEvents) {
                                return !arguments.length ? this._time / this.duration() : this.totalTime(this.duration() * (this._yoyo && (this._cycle & 1) !== 0 ? 1 - value : value) + this._cycle * (this._duration + this._repeatDelay), suppressEvents);
                            };
                            p.totalProgress = function(value, suppressEvents) {
                                return !arguments.length ? this._totalTime / this.totalDuration() : this.totalTime(this.totalDuration() * value, suppressEvents);
                            };
                            p.totalDuration = function(value) {
                                if (!arguments.length) {
                                    if (this._dirty) {
                                        TimelineLite.prototype.totalDuration.call(this);
                                        this._totalDuration = this._repeat === -1 ? 999999999999 : this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat;
                                    }
                                    return this._totalDuration;
                                }
                                return this._repeat === -1 || !value ? this : this.timeScale(this.totalDuration() / value);
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
                                    value = this._duration - value + this._cycle * (this._duration + this._repeatDelay);
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
                                    return this.getLabelBefore(this._time + 1e-8);
                                }
                                return this.seek(value, true);
                            };
                            return TimelineMax;
                        }, true);
                        (function() {
                            var _RAD2DEG = 180 / Math.PI, _r1 = [], _r2 = [], _r3 = [], _corProps = {}, _globals = _gsScope._gsDefine.globals, Segment = function(a, b, c, d) {
                                if (c === d) {
                                    c = d - (d - b) / 1e6;
                                }
                                if (a === b) {
                                    b = a + (c - a) / 1e6;
                                }
                                this.a = a;
                                this.b = b;
                                this.c = c;
                                this.d = d;
                                this.da = d - a;
                                this.ca = c - a;
                                this.ba = b - a;
                            }, _correlate = ",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,", cubicToQuadratic = function(a, b, c, d) {
                                var q1 = {
                                    a: a
                                }, q2 = {}, q3 = {}, q4 = {
                                    c: d
                                }, mab = (a + b) / 2, mbc = (b + c) / 2, mcd = (c + d) / 2, mabc = (mab + mbc) / 2, mbcd = (mbc + mcd) / 2, m8 = (mbcd - mabc) / 8;
                                q1.b = mab + (a - mab) / 4;
                                q2.b = mabc + m8;
                                q1.c = q2.a = (q1.b + q2.b) / 2;
                                q2.c = q3.a = (mabc + mbcd) / 2;
                                q3.b = mbcd - m8;
                                q4.b = mcd + (d - mcd) / 4;
                                q3.c = q4.a = (q3.b + q4.b) / 2;
                                return [ q1, q2, q3, q4 ];
                            }, _calculateControlPoints = function(a, curviness, quad, basic, correlate) {
                                var l = a.length - 1, ii = 0, cp1 = a[0].a, i, p1, p2, p3, seg, m1, m2, mm, cp2, qb, r1, r2, tl;
                                for (i = 0; i < l; i++) {
                                    seg = a[ii];
                                    p1 = seg.a;
                                    p2 = seg.d;
                                    p3 = a[ii + 1].d;
                                    if (correlate) {
                                        r1 = _r1[i];
                                        r2 = _r2[i];
                                        tl = (r2 + r1) * curviness * .25 / (basic ? .5 : _r3[i] || .5);
                                        m1 = p2 - (p2 - p1) * (basic ? curviness * .5 : r1 !== 0 ? tl / r1 : 0);
                                        m2 = p2 + (p3 - p2) * (basic ? curviness * .5 : r2 !== 0 ? tl / r2 : 0);
                                        mm = p2 - (m1 + ((m2 - m1) * (r1 * 3 / (r1 + r2) + .5) / 4 || 0));
                                    } else {
                                        m1 = p2 - (p2 - p1) * curviness * .5;
                                        m2 = p2 + (p3 - p2) * curviness * .5;
                                        mm = p2 - (m1 + m2) / 2;
                                    }
                                    m1 += mm;
                                    m2 += mm;
                                    seg.c = cp2 = m1;
                                    if (i !== 0) {
                                        seg.b = cp1;
                                    } else {
                                        seg.b = cp1 = seg.a + (seg.c - seg.a) * .6;
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
                                seg.c = cp1 + (seg.d - cp1) * .4;
                                seg.da = seg.d - seg.a;
                                seg.ca = seg.c - seg.a;
                                seg.ba = cp1 - seg.a;
                                if (quad) {
                                    qb = cubicToQuadratic(seg.a, cp1, seg.c, seg.d);
                                    a.splice(ii, 1, qb[0], qb[1], qb[2], qb[3]);
                                }
                            }, _parseAnchors = function(values, p, correlate, prepend) {
                                var a = [], l, i, p1, p2, p3, tmp;
                                if (prepend) {
                                    values = [ prepend ].concat(values);
                                    i = values.length;
                                    while (--i > -1) {
                                        if (typeof (tmp = values[i][p]) === "string") if (tmp.charAt(1) === "=") {
                                            values[i][p] = prepend[p] + Number(tmp.charAt(0) + tmp.substr(2));
                                        }
                                    }
                                }
                                l = values.length - 2;
                                if (l < 0) {
                                    a[0] = new Segment(values[0][p], 0, 0, values[l < -1 ? 0 : 1][p]);
                                    return a;
                                }
                                for (i = 0; i < l; i++) {
                                    p1 = values[i][p];
                                    p2 = values[i + 1][p];
                                    a[i] = new Segment(p1, 0, 0, p2);
                                    if (correlate) {
                                        p3 = values[i + 2][p];
                                        _r1[i] = (_r1[i] || 0) + (p2 - p1) * (p2 - p1);
                                        _r2[i] = (_r2[i] || 0) + (p3 - p2) * (p3 - p2);
                                    }
                                }
                                a[i] = new Segment(values[i][p], 0, 0, values[i + 1][p]);
                                return a;
                            }, bezierThrough = function(values, curviness, quadratic, basic, correlate, prepend) {
                                var obj = {}, props = [], first = prepend || values[0], i, p, a, j, r, l, seamless, last;
                                correlate = typeof correlate === "string" ? "," + correlate + "," : _correlate;
                                if (curviness == null) {
                                    curviness = 1;
                                }
                                for (p in values[0]) {
                                    props.push(p);
                                }
                                if (values.length > 1) {
                                    last = values[values.length - 1];
                                    seamless = true;
                                    i = props.length;
                                    while (--i > -1) {
                                        p = props[i];
                                        if (Math.abs(first[p] - last[p]) > .05) {
                                            seamless = false;
                                            break;
                                        }
                                    }
                                    if (seamless) {
                                        values = values.concat();
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
                                    _corProps[p] = correlate.indexOf("," + p + ",") !== -1;
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
                                                r = a[j + 1].da / _r2[j] + a[j].da / _r1[j] || 0;
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
                                    _calculateControlPoints(a, curviness, quadratic, basic, _corProps[p]);
                                    if (seamless) {
                                        a.splice(0, j);
                                        a.splice(a.length - j, j);
                                    }
                                }
                                return obj;
                            }, _parseBezierData = function(values, type, prepend) {
                                type = type || "soft";
                                var obj = {}, inc = type === "cubic" ? 3 : 2, soft = type === "soft", props = [], a, b, c, d, cur, i, j, l, p, cnt, tmp;
                                if (soft && prepend) {
                                    values = [ prepend ].concat(values);
                                }
                                if (values == null || values.length < inc + 1) {
                                    throw "invalid Bezier data";
                                }
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
                                        a = prepend == null ? values[j][p] : typeof (tmp = values[j][p]) === "string" && tmp.charAt(1) === "=" ? prepend[p] + Number(tmp.charAt(0) + tmp.substr(2)) : Number(tmp);
                                        if (soft) if (j > 1) if (j < l - 1) {
                                            cur[cnt++] = (a + cur[cnt - 2]) / 2;
                                        }
                                        cur[cnt++] = a;
                                    }
                                    l = cnt - inc + 1;
                                    cnt = 0;
                                    for (j = 0; j < l; j += inc) {
                                        a = cur[j];
                                        b = cur[j + 1];
                                        c = cur[j + 2];
                                        d = inc === 2 ? 0 : cur[j + 3];
                                        cur[cnt++] = tmp = inc === 3 ? new Segment(a, b, c, d) : new Segment(a, (2 * b + a) / 3, (2 * b + c) / 3, c);
                                    }
                                    cur.length = cnt;
                                }
                                return obj;
                            }, _addCubicLengths = function(a, steps, resolution) {
                                var inc = 1 / resolution, j = a.length, d, d1, s, da, ca, ba, p, i, inv, bez, index;
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
                            }, _parseLengthData = function(obj, resolution) {
                                resolution = resolution >> 0 || 6;
                                var a = [], lengths = [], d = 0, total = 0, threshold = resolution - 1, segments = [], curLS = [], p, i, l, index;
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
                                        index = i / resolution >> 0;
                                        segments[index] = curLS;
                                        lengths[index] = total;
                                        d = 0;
                                        curLS = [];
                                    }
                                }
                                return {
                                    length: total,
                                    lengths: lengths,
                                    segments: segments
                                };
                            }, BezierPlugin = _gsScope._gsDefine.plugin({
                                propName: "bezier",
                                priority: -1,
                                version: "1.3.6",
                                API: 2,
                                global: true,
                                init: function(target, vars, tween) {
                                    this._target = target;
                                    if (vars instanceof Array) {
                                        vars = {
                                            values: vars
                                        };
                                    }
                                    this._func = {};
                                    this._round = {};
                                    this._props = [];
                                    this._timeRes = vars.timeResolution == null ? 6 : parseInt(vars.timeResolution, 10);
                                    var values = vars.values || [], first = {}, second = values[0], autoRotate = vars.autoRotate || tween.vars.orientToBezier, p, isFunc, i, j, prepend;
                                    this._autoRotate = autoRotate ? autoRotate instanceof Array ? autoRotate : [ [ "x", "y", "rotation", autoRotate === true ? 0 : Number(autoRotate) || 0 ] ] : null;
                                    for (p in second) {
                                        this._props.push(p);
                                    }
                                    i = this._props.length;
                                    while (--i > -1) {
                                        p = this._props[i];
                                        this._overwriteProps.push(p);
                                        isFunc = this._func[p] = typeof target[p] === "function";
                                        first[p] = !isFunc ? parseFloat(target[p]) : target[p.indexOf("set") || typeof target["get" + p.substr(3)] !== "function" ? p : "get" + p.substr(3)]();
                                        if (!prepend) if (first[p] !== values[0][p]) {
                                            prepend = first;
                                        }
                                    }
                                    this._beziers = vars.type !== "cubic" && vars.type !== "quadratic" && vars.type !== "soft" ? bezierThrough(values, isNaN(vars.curviness) ? 1 : vars.curviness, false, vars.type === "thruBasic", vars.correlate, prepend) : _parseBezierData(values, vars.type, first);
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
                                    if (autoRotate = this._autoRotate) {
                                        this._initialRotations = [];
                                        if (!(autoRotate[0] instanceof Array)) {
                                            this._autoRotate = autoRotate = [ autoRotate ];
                                        }
                                        i = autoRotate.length;
                                        while (--i > -1) {
                                            for (j = 0; j < 3; j++) {
                                                p = autoRotate[i][j];
                                                this._func[p] = typeof target[p] === "function" ? target[p.indexOf("set") || typeof target["get" + p.substr(3)] !== "function" ? p : "get" + p.substr(3)] : false;
                                            }
                                            p = autoRotate[i][2];
                                            this._initialRotations[i] = (this._func[p] ? this._func[p].call(this._target) : this._target[p]) || 0;
                                        }
                                    }
                                    this._startRatio = tween.vars.runBackwards ? 1 : 0;
                                    return true;
                                },
                                set: function(v) {
                                    var segments = this._segCount, func = this._func, target = this._target, notStart = v !== this._startRatio, curIndex, inv, i, p, b, t, val, l, lengths, curSeg;
                                    if (!this._timeRes) {
                                        curIndex = v < 0 ? 0 : v >= 1 ? segments - 1 : segments * v >> 0;
                                        t = (v - curIndex * (1 / segments)) * segments;
                                    } else {
                                        lengths = this._lengths;
                                        curSeg = this._curSeg;
                                        v *= this._length;
                                        i = this._li;
                                        if (v > this._l2 && i < segments - 1) {
                                            l = segments - 1;
                                            while (i < l && (this._l2 = lengths[++i]) <= v) {}
                                            this._l1 = lengths[i - 1];
                                            this._li = i;
                                            this._curSeg = curSeg = this._segments[i];
                                            this._s2 = curSeg[this._s1 = this._si = 0];
                                        } else if (v < this._l1 && i > 0) {
                                            while (i > 0 && (this._l1 = lengths[--i]) >= v) {}
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
                                        v -= this._l1;
                                        i = this._si;
                                        if (v > this._s2 && i < curSeg.length - 1) {
                                            l = curSeg.length - 1;
                                            while (i < l && (this._s2 = curSeg[++i]) <= v) {}
                                            this._s1 = curSeg[i - 1];
                                            this._si = i;
                                        } else if (v < this._s1 && i > 0) {
                                            while (i > 0 && (this._s1 = curSeg[--i]) >= v) {}
                                            if (i === 0 && v < this._s1) {
                                                this._s1 = 0;
                                            } else {
                                                i++;
                                            }
                                            this._s2 = curSeg[i];
                                            this._si = i;
                                        }
                                        t = (i + (v - this._s1) / (this._s2 - this._s1)) * this._prec || 0;
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
                                        var ar = this._autoRotate, b2, x1, y1, x2, y2, add, conv;
                                        i = ar.length;
                                        while (--i > -1) {
                                            p = ar[i][2];
                                            add = ar[i][3] || 0;
                                            conv = ar[i][4] === true ? 1 : _RAD2DEG;
                                            b = this._beziers[ar[i][0]];
                                            b2 = this._beziers[ar[i][1]];
                                            if (b && b2) {
                                                b = b[curIndex];
                                                b2 = b2[curIndex];
                                                x1 = b.a + (b.b - b.a) * t;
                                                x2 = b.b + (b.c - b.b) * t;
                                                x1 += (x2 - x1) * t;
                                                x2 += (b.c + (b.d - b.c) * t - x2) * t;
                                                y1 = b2.a + (b2.b - b2.a) * t;
                                                y2 = b2.b + (b2.c - b2.b) * t;
                                                y1 += (y2 - y1) * t;
                                                y2 += (b2.c + (b2.d - b2.c) * t - y2) * t;
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
                            }), p = BezierPlugin.prototype;
                            BezierPlugin.bezierThrough = bezierThrough;
                            BezierPlugin.cubicToQuadratic = cubicToQuadratic;
                            BezierPlugin._autoCSS = true;
                            BezierPlugin.quadraticToCubic = function(a, b, c) {
                                return new Segment(a, (2 * b + a) / 3, (2 * b + c) / 3, c);
                            };
                            BezierPlugin._cssRegister = function() {
                                var CSSPlugin = _globals.CSSPlugin;
                                if (!CSSPlugin) {
                                    return;
                                }
                                var _internals = CSSPlugin._internals, _parseToProxy = _internals._parseToProxy, _setPluginRatio = _internals._setPluginRatio, CSSPropTween = _internals.CSSPropTween;
                                _internals._registerComplexSpecialProp("bezier", {
                                    parser: function(t, e, prop, cssp, pt, plugin) {
                                        if (e instanceof Array) {
                                            e = {
                                                values: e
                                            };
                                        }
                                        plugin = new BezierPlugin();
                                        var values = e.values, l = values.length - 1, pluginValues = [], v = {}, i, p, data;
                                        if (l < 0) {
                                            return pt;
                                        }
                                        for (i = 0; i <= l; i++) {
                                            data = _parseToProxy(t, values[i], cssp, pt, plugin, l !== i);
                                            pluginValues[i] = data.end;
                                        }
                                        for (p in e) {
                                            v[p] = e[p];
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
                                            i = v.autoRotate === true ? 0 : Number(v.autoRotate);
                                            v.autoRotate = data.end.left != null ? [ [ "left", "top", "rotation", i, false ] ] : data.end.x != null ? [ [ "x", "y", "rotation", i, false ] ] : false;
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
                                    }
                                });
                            };
                            p._roundProps = function(lookup, value) {
                                var op = this._overwriteProps, i = op.length;
                                while (--i > -1) {
                                    if (lookup[op[i]] || lookup.bezier || lookup.bezierThrough) {
                                        this._round[op[i]] = value;
                                    }
                                }
                            };
                            p._kill = function(lookup) {
                                var a = this._props, p, i;
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
                        })();
                        _gsScope._gsDefine("plugins.CSSPlugin", [ "plugins.TweenPlugin", "TweenLite" ], function(TweenPlugin, TweenLite) {
                            var CSSPlugin = function() {
                                TweenPlugin.call(this, "css");
                                this._overwriteProps.length = 0;
                                this.setRatio = CSSPlugin.prototype.setRatio;
                            }, _globals = _gsScope._gsDefine.globals, _hasPriority, _suffixMap, _cs, _overwriteProps, _specialProps = {}, p = CSSPlugin.prototype = new TweenPlugin("css");
                            p.constructor = CSSPlugin;
                            CSSPlugin.version = "1.18.5";
                            CSSPlugin.API = 2;
                            CSSPlugin.defaultTransformPerspective = 0;
                            CSSPlugin.defaultSkewType = "compensated";
                            CSSPlugin.defaultSmoothOrigin = true;
                            p = "px";
                            CSSPlugin.suffixMap = {
                                top: p,
                                right: p,
                                bottom: p,
                                left: p,
                                width: p,
                                height: p,
                                fontSize: p,
                                padding: p,
                                margin: p,
                                perspective: p,
                                lineHeight: ""
                            };
                            var _numExp = /(?:\-|\.|\b)(\d|\.|e\-)+/g, _relNumExp = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g, _valuesExp = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi, _NaNExp = /(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g, _suffixExp = /(?:\d|\-|\+|=|#|\.)*/g, _opacityExp = /opacity *= *([^)]*)/i, _opacityValExp = /opacity:([^;]*)/i, _alphaFilterExp = /alpha\(opacity *=.+?\)/i, _rgbhslExp = /^(rgb|hsl)/, _capsExp = /([A-Z])/g, _camelExp = /-([a-z])/gi, _urlExp = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi, _camelFunc = function(s, g) {
                                return g.toUpperCase();
                            }, _horizExp = /(?:Left|Right|Width)/i, _ieGetMatrixExp = /(M11|M12|M21|M22)=[\d\-\.e]+/gi, _ieSetMatrixExp = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i, _commasOutsideParenExp = /,(?=[^\)]*(?:\(|$))/gi, _complexExp = /[\s,\(]/i, _DEG2RAD = Math.PI / 180, _RAD2DEG = 180 / Math.PI, _forcePT = {}, _doc = document, _createElement = function(type) {
                                return _doc.createElementNS ? _doc.createElementNS("http://www.w3.org/1999/xhtml", type) : _doc.createElement(type);
                            }, _tempDiv = _createElement("div"), _tempImg = _createElement("img"), _internals = CSSPlugin._internals = {
                                _specialProps: _specialProps
                            }, _agent = navigator.userAgent, _autoRound, _reqSafariFix, _isSafari, _isFirefox, _isSafariLT6, _ieVers, _supportsOpacity = function() {
                                var i = _agent.indexOf("Android"), a = _createElement("a");
                                _isSafari = _agent.indexOf("Safari") !== -1 && _agent.indexOf("Chrome") === -1 && (i === -1 || Number(_agent.substr(i + 8, 1)) > 3);
                                _isSafariLT6 = _isSafari && Number(_agent.substr(_agent.indexOf("Version/") + 8, 1)) < 6;
                                _isFirefox = _agent.indexOf("Firefox") !== -1;
                                if (/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(_agent) || /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(_agent)) {
                                    _ieVers = parseFloat(RegExp.$1);
                                }
                                if (!a) {
                                    return false;
                                }
                                a.style.cssText = "top:1px;opacity:.55;";
                                return /^0.55/.test(a.style.opacity);
                            }(), _getIEOpacity = function(v) {
                                return _opacityExp.test(typeof v === "string" ? v : (v.currentStyle ? v.currentStyle.filter : v.style.filter) || "") ? parseFloat(RegExp.$1) / 100 : 1;
                            }, _log = function(s) {
                                if (window.console) {
                                    console.log(s);
                                }
                            }, _prefixCSS = "", _prefix = "", _checkPropPrefix = function(p, e) {
                                e = e || _tempDiv;
                                var s = e.style, a, i;
                                if (s[p] !== undefined) {
                                    return p;
                                }
                                p = p.charAt(0).toUpperCase() + p.substr(1);
                                a = [ "O", "Moz", "ms", "Ms", "Webkit" ];
                                i = 5;
                                while (--i > -1 && s[a[i] + p] === undefined) {}
                                if (i >= 0) {
                                    _prefix = i === 3 ? "ms" : a[i];
                                    _prefixCSS = "-" + _prefix.toLowerCase() + "-";
                                    return _prefix + p;
                                }
                                return null;
                            }, _getComputedStyle = _doc.defaultView ? _doc.defaultView.getComputedStyle : function() {}, _getStyle = CSSPlugin.getStyle = function(t, p, cs, calc, dflt) {
                                var rv;
                                if (!_supportsOpacity) if (p === "opacity") {
                                    return _getIEOpacity(t);
                                }
                                if (!calc && t.style[p]) {
                                    rv = t.style[p];
                                } else if (cs = cs || _getComputedStyle(t)) {
                                    rv = cs[p] || cs.getPropertyValue(p) || cs.getPropertyValue(p.replace(_capsExp, "-$1").toLowerCase());
                                } else if (t.currentStyle) {
                                    rv = t.currentStyle[p];
                                }
                                return dflt != null && (!rv || rv === "none" || rv === "auto" || rv === "auto auto") ? dflt : rv;
                            }, _convertToPixels = _internals.convertToPixels = function(t, p, v, sfx, recurse) {
                                if (sfx === "px" || !sfx) {
                                    return v;
                                }
                                if (sfx === "auto" || !v) {
                                    return 0;
                                }
                                var horiz = _horizExp.test(p), node = t, style = _tempDiv.style, neg = v < 0, precise = v === 1, pix, cache, time;
                                if (neg) {
                                    v = -v;
                                }
                                if (precise) {
                                    v *= 100;
                                }
                                if (sfx === "%" && p.indexOf("border") !== -1) {
                                    pix = v / 100 * (horiz ? t.clientWidth : t.clientHeight);
                                } else {
                                    style.cssText = "border:0 solid red;position:" + _getStyle(t, "position") + ";line-height:0;";
                                    if (sfx === "%" || !node.appendChild || sfx.charAt(0) === "v" || sfx === "rem") {
                                        node = t.parentNode || _doc.body;
                                        cache = node._gsCache;
                                        time = TweenLite.ticker.frame;
                                        if (cache && horiz && cache.time === time) {
                                            return cache.width * v / 100;
                                        }
                                        style[horiz ? "width" : "height"] = v + sfx;
                                    } else {
                                        style[horiz ? "borderLeftWidth" : "borderTopWidth"] = v + sfx;
                                    }
                                    node.appendChild(_tempDiv);
                                    pix = parseFloat(_tempDiv[horiz ? "offsetWidth" : "offsetHeight"]);
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
                            }, _calculateOffset = _internals.calculateOffset = function(t, p, cs) {
                                if (_getStyle(t, "position", cs) !== "absolute") {
                                    return 0;
                                }
                                var dim = p === "left" ? "Left" : "Top", v = _getStyle(t, "margin" + dim, cs);
                                return t["offset" + dim] - (_convertToPixels(t, p, parseFloat(v), v.replace(_suffixExp, "")) || 0);
                            }, _getAllStyles = function(t, cs) {
                                var s = {}, i, tr, p;
                                if (cs = cs || _getComputedStyle(t, null)) {
                                    if (i = cs.length) {
                                        while (--i > -1) {
                                            p = cs[i];
                                            if (p.indexOf("-transform") === -1 || _transformPropCSS === p) {
                                                s[p.replace(_camelExp, _camelFunc)] = cs.getPropertyValue(p);
                                            }
                                        }
                                    } else {
                                        for (i in cs) {
                                            if (i.indexOf("Transform") === -1 || _transformProp === i) {
                                                s[i] = cs[i];
                                            }
                                        }
                                    }
                                } else if (cs = t.currentStyle || t.style) {
                                    for (i in cs) {
                                        if (typeof i === "string" && s[i] === undefined) {
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
                            }, _cssDif = function(t, s1, s2, vars, forceLookup) {
                                var difs = {}, style = t.style, val, p, mpt;
                                for (p in s2) {
                                    if (p !== "cssText") if (p !== "length") if (isNaN(p)) if (s1[p] !== (val = s2[p]) || forceLookup && forceLookup[p]) if (p.indexOf("Origin") === -1) if (typeof val === "number" || typeof val === "string") {
                                        difs[p] = val === "auto" && (p === "left" || p === "top") ? _calculateOffset(t, p) : (val === "" || val === "auto" || val === "none") && typeof s1[p] === "string" && s1[p].replace(_NaNExp, "") !== "" ? 0 : val;
                                        if (style[p] !== undefined) {
                                            mpt = new MiniPropTween(style, p, style[p], mpt);
                                        }
                                    }
                                }
                                if (vars) {
                                    for (p in vars) {
                                        if (p !== "className") {
                                            difs[p] = vars[p];
                                        }
                                    }
                                }
                                return {
                                    difs: difs,
                                    firstMPT: mpt
                                };
                            }, _dimensions = {
                                width: [ "Left", "Right" ],
                                height: [ "Top", "Bottom" ]
                            }, _margins = [ "marginLeft", "marginRight", "marginTop", "marginBottom" ], _getDimension = function(t, p, cs) {
                                if ((t.nodeName + "").toLowerCase() === "svg") {
                                    return (cs || _getComputedStyle(t))[p] || 0;
                                } else if (t.getBBox && _isSVG(t)) {
                                    return t.getBBox()[p] || 0;
                                }
                                var v = parseFloat(p === "width" ? t.offsetWidth : t.offsetHeight), a = _dimensions[p], i = a.length;
                                cs = cs || _getComputedStyle(t, null);
                                while (--i > -1) {
                                    v -= parseFloat(_getStyle(t, "padding" + a[i], cs, true)) || 0;
                                    v -= parseFloat(_getStyle(t, "border" + a[i] + "Width", cs, true)) || 0;
                                }
                                return v;
                            }, _parsePosition = function(v, recObj) {
                                if (v === "contain" || v === "auto" || v === "auto auto") {
                                    return v + " ";
                                }
                                if (v == null || v === "") {
                                    v = "0 0";
                                }
                                var a = v.split(" "), x = v.indexOf("left") !== -1 ? "0%" : v.indexOf("right") !== -1 ? "100%" : a[0], y = v.indexOf("top") !== -1 ? "0%" : v.indexOf("bottom") !== -1 ? "100%" : a[1], i;
                                if (a.length > 3 && !recObj) {
                                    a = v.split(", ").join(",").split(",");
                                    v = [];
                                    for (i = 0; i < a.length; i++) {
                                        v.push(_parsePosition(a[i]));
                                    }
                                    return v.join(",");
                                }
                                if (y == null) {
                                    y = x === "center" ? "50%" : "0";
                                } else if (y === "center") {
                                    y = "50%";
                                }
                                if (x === "center" || isNaN(parseFloat(x)) && (x + "").indexOf("=") === -1) {
                                    x = "50%";
                                }
                                v = x + " " + y + (a.length > 2 ? " " + a[2] : "");
                                if (recObj) {
                                    recObj.oxp = x.indexOf("%") !== -1;
                                    recObj.oyp = y.indexOf("%") !== -1;
                                    recObj.oxr = x.charAt(1) === "=";
                                    recObj.oyr = y.charAt(1) === "=";
                                    recObj.ox = parseFloat(x.replace(_NaNExp, ""));
                                    recObj.oy = parseFloat(y.replace(_NaNExp, ""));
                                    recObj.v = v;
                                }
                                return recObj || v;
                            }, _parseChange = function(e, b) {
                                return typeof e === "string" && e.charAt(1) === "=" ? parseInt(e.charAt(0) + "1", 10) * parseFloat(e.substr(2)) : parseFloat(e) - parseFloat(b) || 0;
                            }, _parseVal = function(v, d) {
                                return v == null ? d : typeof v === "string" && v.charAt(1) === "=" ? parseInt(v.charAt(0) + "1", 10) * parseFloat(v.substr(2)) + d : parseFloat(v) || 0;
                            }, _parseAngle = function(v, d, p, directionalEnd) {
                                var min = 1e-6, cap, split, dif, result, isRelative;
                                if (v == null) {
                                    result = d;
                                } else if (typeof v === "number") {
                                    result = v;
                                } else {
                                    cap = 360;
                                    split = v.split("_");
                                    isRelative = v.charAt(1) === "=";
                                    dif = (isRelative ? parseInt(v.charAt(0) + "1", 10) * parseFloat(split[0].substr(2)) : parseFloat(split[0])) * (v.indexOf("rad") === -1 ? 1 : _RAD2DEG) - (isRelative ? 0 : d);
                                    if (split.length) {
                                        if (directionalEnd) {
                                            directionalEnd[p] = d + dif;
                                        }
                                        if (v.indexOf("short") !== -1) {
                                            dif = dif % cap;
                                            if (dif !== dif % (cap / 2)) {
                                                dif = dif < 0 ? dif + cap : dif - cap;
                                            }
                                        }
                                        if (v.indexOf("_cw") !== -1 && dif < 0) {
                                            dif = (dif + cap * 9999999999) % cap - (dif / cap | 0) * cap;
                                        } else if (v.indexOf("ccw") !== -1 && dif > 0) {
                                            dif = (dif - cap * 9999999999) % cap - (dif / cap | 0) * cap;
                                        }
                                    }
                                    result = d + dif;
                                }
                                if (result < min && result > -min) {
                                    result = 0;
                                }
                                return result;
                            }, _colorLookup = {
                                aqua: [ 0, 255, 255 ],
                                lime: [ 0, 255, 0 ],
                                silver: [ 192, 192, 192 ],
                                black: [ 0, 0, 0 ],
                                maroon: [ 128, 0, 0 ],
                                teal: [ 0, 128, 128 ],
                                blue: [ 0, 0, 255 ],
                                navy: [ 0, 0, 128 ],
                                white: [ 255, 255, 255 ],
                                fuchsia: [ 255, 0, 255 ],
                                olive: [ 128, 128, 0 ],
                                yellow: [ 255, 255, 0 ],
                                orange: [ 255, 165, 0 ],
                                gray: [ 128, 128, 128 ],
                                purple: [ 128, 0, 128 ],
                                green: [ 0, 128, 0 ],
                                red: [ 255, 0, 0 ],
                                pink: [ 255, 192, 203 ],
                                cyan: [ 0, 255, 255 ],
                                transparent: [ 255, 255, 255, 0 ]
                            }, _hue = function(h, m1, m2) {
                                h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
                                return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * 255 + .5 | 0;
                            }, _parseColor = CSSPlugin.parseColor = function(v, toHSL) {
                                var a, r, g, b, h, s, l, max, min, d, wasHSL;
                                if (!v) {
                                    a = _colorLookup.black;
                                } else if (typeof v === "number") {
                                    a = [ v >> 16, v >> 8 & 255, v & 255 ];
                                } else {
                                    if (v.charAt(v.length - 1) === ",") {
                                        v = v.substr(0, v.length - 1);
                                    }
                                    if (_colorLookup[v]) {
                                        a = _colorLookup[v];
                                    } else if (v.charAt(0) === "#") {
                                        if (v.length === 4) {
                                            r = v.charAt(1);
                                            g = v.charAt(2);
                                            b = v.charAt(3);
                                            v = "#" + r + r + g + g + b + b;
                                        }
                                        v = parseInt(v.substr(1), 16);
                                        a = [ v >> 16, v >> 8 & 255, v & 255 ];
                                    } else if (v.substr(0, 3) === "hsl") {
                                        a = wasHSL = v.match(_numExp);
                                        if (!toHSL) {
                                            h = Number(a[0]) % 360 / 360;
                                            s = Number(a[1]) / 100;
                                            l = Number(a[2]) / 100;
                                            g = l <= .5 ? l * (s + 1) : l + s - l * s;
                                            r = l * 2 - g;
                                            if (a.length > 3) {
                                                a[3] = Number(v[3]);
                                            }
                                            a[0] = _hue(h + 1 / 3, r, g);
                                            a[1] = _hue(h, r, g);
                                            a[2] = _hue(h - 1 / 3, r, g);
                                        } else if (v.indexOf("=") !== -1) {
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
                                        s = l > .5 ? d / (2 - max - min) : d / (max + min);
                                        h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
                                        h *= 60;
                                    }
                                    a[0] = h + .5 | 0;
                                    a[1] = s * 100 + .5 | 0;
                                    a[2] = l * 100 + .5 | 0;
                                }
                                return a;
                            }, _formatColors = function(s, toHSL) {
                                var colors = s.match(_colorExp) || [], charIndex = 0, parsed = colors.length ? "" : s, i, color, temp;
                                for (i = 0; i < colors.length; i++) {
                                    color = colors[i];
                                    temp = s.substr(charIndex, s.indexOf(color, charIndex) - charIndex);
                                    charIndex += temp.length + color.length;
                                    color = _parseColor(color, toHSL);
                                    if (color.length === 3) {
                                        color.push(1);
                                    }
                                    parsed += temp + (toHSL ? "hsla(" + color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : "rgba(" + color.join(",")) + ")";
                                }
                                return parsed + s.substr(charIndex);
                            }, _colorExp = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b";
                            for (p in _colorLookup) {
                                _colorExp += "|" + p + "\\b";
                            }
                            _colorExp = new RegExp(_colorExp + ")", "gi");
                            CSSPlugin.colorStringFilter = function(a) {
                                var combined = a[0] + a[1], toHSL;
                                if (_colorExp.test(combined)) {
                                    toHSL = combined.indexOf("hsl(") !== -1 || combined.indexOf("hsla(") !== -1;
                                    a[0] = _formatColors(a[0], toHSL);
                                    a[1] = _formatColors(a[1], toHSL);
                                }
                                _colorExp.lastIndex = 0;
                            };
                            if (!TweenLite.defaultStringFilter) {
                                TweenLite.defaultStringFilter = CSSPlugin.colorStringFilter;
                            }
                            var _getFormatter = function(dflt, clr, collapsible, multi) {
                                if (dflt == null) {
                                    return function(v) {
                                        return v;
                                    };
                                }
                                var dColor = clr ? (dflt.match(_colorExp) || [ "" ])[0] : "", dVals = dflt.split(dColor).join("").match(_valuesExp) || [], pfx = dflt.substr(0, dflt.indexOf(dVals[0])), sfx = dflt.charAt(dflt.length - 1) === ")" ? ")" : "", delim = dflt.indexOf(" ") !== -1 ? " " : ",", numVals = dVals.length, dSfx = numVals > 0 ? dVals[0].replace(_numExp, "") : "", formatter;
                                if (!numVals) {
                                    return function(v) {
                                        return v;
                                    };
                                }
                                if (clr) {
                                    formatter = function(v) {
                                        var color, vals, i, a;
                                        if (typeof v === "number") {
                                            v += dSfx;
                                        } else if (multi && _commasOutsideParenExp.test(v)) {
                                            a = v.replace(_commasOutsideParenExp, "|").split("|");
                                            for (i = 0; i < a.length; i++) {
                                                a[i] = formatter(a[i]);
                                            }
                                            return a.join(",");
                                        }
                                        color = (v.match(_colorExp) || [ dColor ])[0];
                                        vals = v.split(color).join("").match(_valuesExp) || [];
                                        i = vals.length;
                                        if (numVals > i--) {
                                            while (++i < numVals) {
                                                vals[i] = collapsible ? vals[(i - 1) / 2 | 0] : dVals[i];
                                            }
                                        }
                                        return pfx + vals.join(delim) + delim + color + sfx + (v.indexOf("inset") !== -1 ? " inset" : "");
                                    };
                                    return formatter;
                                }
                                formatter = function(v) {
                                    var vals, a, i;
                                    if (typeof v === "number") {
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
                                            vals[i] = collapsible ? vals[(i - 1) / 2 | 0] : dVals[i];
                                        }
                                    }
                                    return pfx + vals.join(delim) + sfx;
                                };
                                return formatter;
                            }, _getEdgeParser = function(props) {
                                props = props.split(",");
                                return function(t, e, p, cssp, pt, plugin, vars) {
                                    var a = (e + "").split(" "), i;
                                    vars = {};
                                    for (i = 0; i < 4; i++) {
                                        vars[props[i]] = a[i] = a[i] || a[(i - 1) / 2 >> 0];
                                    }
                                    return cssp.parse(t, vars, pt, plugin);
                                };
                            }, _setPluginRatio = _internals._setPluginRatio = function(v) {
                                this.plugin.setRatio(v);
                                var d = this.data, proxy = d.proxy, mpt = d.firstMPT, min = 1e-6, val, pt, i, str, p;
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
                                if (v === 1 || v === 0) {
                                    mpt = d.firstMPT;
                                    p = v === 1 ? "e" : "b";
                                    while (mpt) {
                                        pt = mpt.t;
                                        if (!pt.type) {
                                            pt[p] = pt.s + pt.xs0;
                                        } else if (pt.type === 1) {
                                            str = pt.xs0 + pt.s + pt.xs1;
                                            for (i = 1; i < pt.l; i++) {
                                                str += pt["xn" + i] + pt["xs" + (i + 1)];
                                            }
                                            pt[p] = str;
                                        }
                                        mpt = mpt._next;
                                    }
                                }
                            }, MiniPropTween = function(t, p, v, next, r) {
                                this.t = t;
                                this.p = p;
                                this.v = v;
                                this.r = r;
                                if (next) {
                                    next._prev = this;
                                    this._next = next;
                                }
                            }, _parseToProxy = _internals._parseToProxy = function(t, vars, cssp, pt, plugin, shallow) {
                                var bpt = pt, start = {}, end = {}, transform = cssp._transform, oldForce = _forcePT, i, p, xp, mpt, firstPT;
                                cssp._transform = null;
                                _forcePT = vars;
                                pt = firstPT = cssp.parse(t, vars, pt, plugin);
                                _forcePT = oldForce;
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
                                return {
                                    proxy: start,
                                    end: end,
                                    firstMPT: mpt,
                                    pt: firstPT
                                };
                            }, CSSPropTween = _internals.CSSPropTween = function(t, p, s, c, next, type, n, r, pr, b, e) {
                                this.t = t;
                                this.p = p;
                                this.s = s;
                                this.c = c;
                                this.n = n || p;
                                if (!(t instanceof CSSPropTween)) {
                                    _overwriteProps.push(this.n);
                                }
                                this.r = r;
                                this.type = type || 0;
                                if (pr) {
                                    this.pr = pr;
                                    _hasPriority = true;
                                }
                                this.b = b === undefined ? s : b;
                                this.e = e === undefined ? s + c : e;
                                if (next) {
                                    this._next = next;
                                    next._prev = this;
                                }
                            }, _addNonTweeningNumericPT = function(target, prop, start, end, next, overwriteProp) {
                                var pt = new CSSPropTween(target, prop, start, end - start, next, -1, overwriteProp);
                                pt.b = start;
                                pt.e = pt.xs0 = end;
                                return pt;
                            }, _parseComplex = CSSPlugin.parseComplex = function(t, p, b, e, clrs, dflt, pt, pr, plugin, setRatio) {
                                b = b || dflt || "";
                                pt = new CSSPropTween(t, p, 0, 0, pt, setRatio ? 2 : 1, null, false, pr, b, e);
                                e += "";
                                if (clrs && _colorExp.test(e + b)) {
                                    e = [ b, e ];
                                    CSSPlugin.colorStringFilter(e);
                                    b = e[0];
                                    e = e[1];
                                }
                                var ba = b.split(", ").join(",").split(" "), ea = e.split(", ").join(",").split(" "), l = ba.length, autoRound = _autoRound !== false, i, xi, ni, bv, ev, bnums, enums, bn, hasAlpha, temp, cv, str, useHSL;
                                if (e.indexOf(",") !== -1 || b.indexOf(",") !== -1) {
                                    ba = ba.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
                                    ea = ea.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
                                    l = ba.length;
                                }
                                if (l !== ea.length) {
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
                                    if (bn || bn === 0) {
                                        pt.appendXtra("", bn, _parseChange(ev, bn), ev.replace(_relNumExp, ""), autoRound && ev.indexOf("px") !== -1, true);
                                    } else if (clrs && _colorExp.test(bv)) {
                                        str = ev.indexOf(")") + 1;
                                        str = ")" + (str ? ev.substr(str) : "");
                                        useHSL = ev.indexOf("hsl") !== -1 && _supportsOpacity;
                                        bv = _parseColor(bv, useHSL);
                                        ev = _parseColor(ev, useHSL);
                                        hasAlpha = bv.length + ev.length > 6;
                                        if (hasAlpha && !_supportsOpacity && ev[3] === 0) {
                                            pt["xs" + pt.l] += pt.l ? " transparent" : "transparent";
                                            pt.e = pt.e.split(ea[i]).join("transparent");
                                        } else {
                                            if (!_supportsOpacity) {
                                                hasAlpha = false;
                                            }
                                            if (useHSL) {
                                                pt.appendXtra(hasAlpha ? "hsla(" : "hsl(", bv[0], _parseChange(ev[0], bv[0]), ",", false, true).appendXtra("", bv[1], _parseChange(ev[1], bv[1]), "%,", false).appendXtra("", bv[2], _parseChange(ev[2], bv[2]), hasAlpha ? "%," : "%" + str, false);
                                            } else {
                                                pt.appendXtra(hasAlpha ? "rgba(" : "rgb(", bv[0], ev[0] - bv[0], ",", true, true).appendXtra("", bv[1], ev[1] - bv[1], ",", true).appendXtra("", bv[2], ev[2] - bv[2], hasAlpha ? "," : str, true);
                                            }
                                            if (hasAlpha) {
                                                bv = bv.length < 4 ? 1 : bv[3];
                                                pt.appendXtra("", bv, (ev.length < 4 ? 1 : ev[3]) - bv, str, false);
                                            }
                                        }
                                        _colorExp.lastIndex = 0;
                                    } else {
                                        bnums = bv.match(_numExp);
                                        if (!bnums) {
                                            pt["xs" + pt.l] += pt.l || pt["xs" + pt.l] ? " " + ev : ev;
                                        } else {
                                            enums = ev.match(_relNumExp);
                                            if (!enums || enums.length !== bnums.length) {
                                                return pt;
                                            }
                                            ni = 0;
                                            for (xi = 0; xi < bnums.length; xi++) {
                                                cv = bnums[xi];
                                                temp = bv.indexOf(cv, ni);
                                                pt.appendXtra(bv.substr(ni, temp - ni), Number(cv), _parseChange(enums[xi], cv), "", autoRound && bv.substr(temp + cv.length, 2) === "px", xi === 0);
                                                ni = temp + cv.length;
                                            }
                                            pt["xs" + pt.l] += bv.substr(ni);
                                        }
                                    }
                                }
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
                            }, i = 9;
                            p = CSSPropTween.prototype;
                            p.l = p.pr = 0;
                            while (--i > 0) {
                                p["xn" + i] = 0;
                                p["xs" + i] = "";
                            }
                            p.xs0 = "";
                            p._next = p._prev = p.xfirst = p.data = p.plugin = p.setRatio = p.rxp = null;
                            p.appendXtra = function(pfx, s, c, sfx, r, pad) {
                                var pt = this, l = pt.l;
                                pt["xs" + l] += pad && (l || pt["xs" + l]) ? " " + pfx : pfx || "";
                                if (!c) if (l !== 0 && !pt.plugin) {
                                    pt["xs" + l] += s + (sfx || "");
                                    return pt;
                                }
                                pt.l++;
                                pt.type = pt.setRatio ? 2 : 1;
                                pt["xs" + pt.l] = sfx || "";
                                if (l > 0) {
                                    pt.data["xn" + l] = s + c;
                                    pt.rxp["xn" + l] = r;
                                    pt["xn" + l] = s;
                                    if (!pt.plugin) {
                                        pt.xfirst = new CSSPropTween(pt, "xn" + l, s, c, pt.xfirst || pt, 0, pt.n, r, pt.pr);
                                        pt.xfirst.xs0 = 0;
                                    }
                                    return pt;
                                }
                                pt.data = {
                                    s: s + c
                                };
                                pt.rxp = {};
                                pt.s = s;
                                pt.c = c;
                                pt.r = r;
                                return pt;
                            };
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
                            }, _registerComplexSpecialProp = _internals._registerComplexSpecialProp = function(p, options, defaults) {
                                if (typeof options !== "object") {
                                    options = {
                                        parser: defaults
                                    };
                                }
                                var a = p.split(","), d = options.defaultValue, i, temp;
                                defaults = defaults || [ d ];
                                for (i = 0; i < a.length; i++) {
                                    options.prefix = i === 0 && options.prefix;
                                    options.defaultValue = defaults[i] || d;
                                    temp = new SpecialProp(a[i], options);
                                }
                            }, _registerPluginProp = function(p) {
                                if (!_specialProps[p]) {
                                    var pluginName = p.charAt(0).toUpperCase() + p.substr(1) + "Plugin";
                                    _registerComplexSpecialProp(p, {
                                        parser: function(t, e, p, cssp, pt, plugin, vars) {
                                            var pluginClass = _globals.com.greensock.plugins[pluginName];
                                            if (!pluginClass) {
                                                _log("Error: " + pluginName + " js file not loaded.");
                                                return pt;
                                            }
                                            pluginClass._cssRegister();
                                            return _specialProps[p].parse(t, e, p, cssp, pt, plugin, vars);
                                        }
                                    });
                                }
                            };
                            p = SpecialProp.prototype;
                            p.parseComplex = function(t, b, e, pt, plugin, setRatio) {
                                var kwd = this.keyword, i, ba, ea, l, bi, ei;
                                if (this.multi) if (_commasOutsideParenExp.test(e) || _commasOutsideParenExp.test(b)) {
                                    ba = b.replace(_commasOutsideParenExp, "|").split("|");
                                    ea = e.replace(_commasOutsideParenExp, "|").split("|");
                                } else if (kwd) {
                                    ba = [ b ];
                                    ea = [ e ];
                                }
                                if (ea) {
                                    l = ea.length > ba.length ? ea.length : ba.length;
                                    for (i = 0; i < l; i++) {
                                        b = ba[i] = ba[i] || this.dflt;
                                        e = ea[i] = ea[i] || this.dflt;
                                        if (kwd) {
                                            bi = b.indexOf(kwd);
                                            ei = e.indexOf(kwd);
                                            if (bi !== ei) {
                                                if (ei === -1) {
                                                    ba[i] = ba[i].split(kwd).join("");
                                                } else if (bi === -1) {
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
                            p.parse = function(t, e, p, cssp, pt, plugin, vars) {
                                return this.parseComplex(t.style, this.format(_getStyle(t, this.p, _cs, false, this.dflt)), this.format(e), pt, plugin);
                            };
                            CSSPlugin.registerSpecialProp = function(name, onInitTween, priority) {
                                _registerComplexSpecialProp(name, {
                                    parser: function(t, e, p, cssp, pt, plugin, vars) {
                                        var rv = new CSSPropTween(t, p, 0, 0, pt, 2, p, false, priority);
                                        rv.plugin = plugin;
                                        rv.setRatio = onInitTween(t, e, cssp._tween, p);
                                        return rv;
                                    },
                                    priority: priority
                                });
                            };
                            CSSPlugin.useSVGTransformAttr = _isSafari || _isFirefox;
                            var _transformProps = "scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","), _transformProp = _checkPropPrefix("transform"), _transformPropCSS = _prefixCSS + "transform", _transformOriginProp = _checkPropPrefix("transformOrigin"), _supports3D = _checkPropPrefix("perspective") !== null, Transform = _internals.Transform = function() {
                                this.perspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0;
                                this.force3D = CSSPlugin.defaultForce3D === false || !_supports3D ? false : CSSPlugin.defaultForce3D || "auto";
                            }, _SVGElement = window.SVGElement, _useSVGTransformAttr, _createSVG = function(type, container, attributes) {
                                var element = _doc.createElementNS("http://www.w3.org/2000/svg", type), reg = /([a-z])([A-Z])/g, p;
                                for (p in attributes) {
                                    element.setAttributeNS(null, p.replace(reg, "$1-$2").toLowerCase(), attributes[p]);
                                }
                                container.appendChild(element);
                                return element;
                            }, _docElement = _doc.documentElement, _forceSVGTransformAttr = function() {
                                var force = _ieVers || /Android/i.test(_agent) && !window.chrome, svg, rect, width;
                                if (_doc.createElementNS && !force) {
                                    svg = _createSVG("svg", _docElement);
                                    rect = _createSVG("rect", svg, {
                                        width: 100,
                                        height: 50,
                                        x: 100
                                    });
                                    width = rect.getBoundingClientRect().width;
                                    rect.style[_transformOriginProp] = "50% 50%";
                                    rect.style[_transformProp] = "scaleX(0.5)";
                                    force = width === rect.getBoundingClientRect().width && !(_isFirefox && _supports3D);
                                    _docElement.removeChild(svg);
                                }
                                return force;
                            }(), _parseSVGOrigin = function(e, local, decoratee, absolute, smoothOrigin, skipRecord) {
                                var tm = e._gsTransform, m = _getMatrix(e, true), v, x, y, xOrigin, yOrigin, a, b, c, d, tx, ty, determinant, xOriginOld, yOriginOld;
                                if (tm) {
                                    xOriginOld = tm.xOrigin;
                                    yOriginOld = tm.yOrigin;
                                }
                                if (!absolute || (v = absolute.split(" ")).length < 2) {
                                    b = e.getBBox();
                                    local = _parsePosition(local).split(" ");
                                    v = [ (local[0].indexOf("%") !== -1 ? parseFloat(local[0]) / 100 * b.width : parseFloat(local[0])) + b.x, (local[1].indexOf("%") !== -1 ? parseFloat(local[1]) / 100 * b.height : parseFloat(local[1])) + b.y ];
                                }
                                decoratee.xOrigin = xOrigin = parseFloat(v[0]);
                                decoratee.yOrigin = yOrigin = parseFloat(v[1]);
                                if (absolute && m !== _identity2DMatrix) {
                                    a = m[0];
                                    b = m[1];
                                    c = m[2];
                                    d = m[3];
                                    tx = m[4];
                                    ty = m[5];
                                    determinant = a * d - b * c;
                                    x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
                                    y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
                                    xOrigin = decoratee.xOrigin = v[0] = x;
                                    yOrigin = decoratee.yOrigin = v[1] = y;
                                }
                                if (tm) {
                                    if (skipRecord) {
                                        decoratee.xOffset = tm.xOffset;
                                        decoratee.yOffset = tm.yOffset;
                                        tm = decoratee;
                                    }
                                    if (smoothOrigin || smoothOrigin !== false && CSSPlugin.defaultSmoothOrigin !== false) {
                                        x = xOrigin - xOriginOld;
                                        y = yOrigin - yOriginOld;
                                        tm.xOffset += x * m[0] + y * m[2] - x;
                                        tm.yOffset += x * m[1] + y * m[3] - y;
                                    } else {
                                        tm.xOffset = tm.yOffset = 0;
                                    }
                                }
                                if (!skipRecord) {
                                    e.setAttribute("data-svg-origin", v.join(" "));
                                }
                            }, _canGetBBox = function(e) {
                                try {
                                    return e.getBBox();
                                } catch (e) {}
                            }, _isSVG = function(e) {
                                return !!(_SVGElement && e.getBBox && e.getCTM && _canGetBBox(e) && (!e.parentNode || e.parentNode.getBBox && e.parentNode.getCTM));
                            }, _identity2DMatrix = [ 1, 0, 0, 1, 0, 0 ], _getMatrix = function(e, force2D) {
                                var tm = e._gsTransform || new Transform(), rnd = 1e5, style = e.style, isDefault, s, m, n, dec, none;
                                if (_transformProp) {
                                    s = _getStyle(e, _transformPropCSS, null, true);
                                } else if (e.currentStyle) {
                                    s = e.currentStyle.filter.match(_ieGetMatrixExp);
                                    s = s && s.length === 4 ? [ s[0].substr(4), Number(s[2].substr(4)), Number(s[1].substr(4)), s[3].substr(4), tm.x || 0, tm.y || 0 ].join(",") : "";
                                }
                                isDefault = !s || s === "none" || s === "matrix(1, 0, 0, 1, 0, 0)";
                                if (isDefault && _transformProp && ((none = _getComputedStyle(e).display === "none") || !e.parentNode)) {
                                    if (none) {
                                        n = style.display;
                                        style.display = "block";
                                    }
                                    if (!e.parentNode) {
                                        dec = 1;
                                        _docElement.appendChild(e);
                                    }
                                    s = _getStyle(e, _transformPropCSS, null, true);
                                    isDefault = !s || s === "none" || s === "matrix(1, 0, 0, 1, 0, 0)";
                                    if (n) {
                                        style.display = n;
                                    } else if (none) {
                                        _removeProp(style, "display");
                                    }
                                    if (dec) {
                                        _docElement.removeChild(e);
                                    }
                                }
                                if (tm.svg || e.getBBox && _isSVG(e)) {
                                    if (isDefault && (style[_transformProp] + "").indexOf("matrix") !== -1) {
                                        s = style[_transformProp];
                                        isDefault = 0;
                                    }
                                    m = e.getAttribute("transform");
                                    if (isDefault && m) {
                                        if (m.indexOf("matrix") !== -1) {
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
                                m = (s || "").match(_numExp) || [];
                                i = m.length;
                                while (--i > -1) {
                                    n = Number(m[i]);
                                    m[i] = (dec = n - (n |= 0)) ? (dec * rnd + (dec < 0 ? -.5 : .5) | 0) / rnd + n : n;
                                }
                                return force2D && m.length > 6 ? [ m[0], m[1], m[4], m[5], m[12], m[13] ] : m;
                            }, _getTransform = _internals.getTransform = function(t, cs, rec, parse) {
                                if (t._gsTransform && rec && !parse) {
                                    return t._gsTransform;
                                }
                                var tm = rec ? t._gsTransform || new Transform() : new Transform(), invX = tm.scaleX < 0, min = 2e-5, rnd = 1e5, zOrigin = _supports3D ? parseFloat(_getStyle(t, _transformOriginProp, cs, false, "0 0 0").split(" ")[2]) || tm.zOrigin || 0 : 0, defaultTransformPerspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0, m, i, scaleX, scaleY, rotation, skewX;
                                tm.svg = !!(t.getBBox && _isSVG(t));
                                if (tm.svg) {
                                    _parseSVGOrigin(t, _getStyle(t, _transformOriginProp, cs, false, "50% 50%") + "", tm, t.getAttribute("data-svg-origin"));
                                    _useSVGTransformAttr = CSSPlugin.useSVGTransformAttr || _forceSVGTransformAttr;
                                }
                                m = _getMatrix(t);
                                if (m !== _identity2DMatrix) {
                                    if (m.length === 16) {
                                        var a11 = m[0], a21 = m[1], a31 = m[2], a41 = m[3], a12 = m[4], a22 = m[5], a32 = m[6], a42 = m[7], a13 = m[8], a23 = m[9], a33 = m[10], a14 = m[12], a24 = m[13], a34 = m[14], a43 = m[11], angle = Math.atan2(a32, a33), t1, t2, t3, t4, cos, sin;
                                        if (tm.zOrigin) {
                                            a34 = -tm.zOrigin;
                                            a14 = a13 * a34 - m[12];
                                            a24 = a23 * a34 - m[13];
                                            a34 = a33 * a34 + tm.zOrigin - m[14];
                                        }
                                        tm.rotationX = angle * _RAD2DEG;
                                        if (angle) {
                                            cos = Math.cos(-angle);
                                            sin = Math.sin(-angle);
                                            t1 = a12 * cos + a13 * sin;
                                            t2 = a22 * cos + a23 * sin;
                                            t3 = a32 * cos + a33 * sin;
                                            a13 = a12 * -sin + a13 * cos;
                                            a23 = a22 * -sin + a23 * cos;
                                            a33 = a32 * -sin + a33 * cos;
                                            a43 = a42 * -sin + a43 * cos;
                                            a12 = t1;
                                            a22 = t2;
                                            a32 = t3;
                                        }
                                        angle = Math.atan2(-a31, a33);
                                        tm.rotationY = angle * _RAD2DEG;
                                        if (angle) {
                                            cos = Math.cos(-angle);
                                            sin = Math.sin(-angle);
                                            t1 = a11 * cos - a13 * sin;
                                            t2 = a21 * cos - a23 * sin;
                                            t3 = a31 * cos - a33 * sin;
                                            a23 = a21 * sin + a23 * cos;
                                            a33 = a31 * sin + a33 * cos;
                                            a43 = a41 * sin + a43 * cos;
                                            a11 = t1;
                                            a21 = t2;
                                            a31 = t3;
                                        }
                                        angle = Math.atan2(a21, a11);
                                        tm.rotation = angle * _RAD2DEG;
                                        if (angle) {
                                            cos = Math.cos(-angle);
                                            sin = Math.sin(-angle);
                                            a11 = a11 * cos + a12 * sin;
                                            t2 = a21 * cos + a22 * sin;
                                            a22 = a21 * -sin + a22 * cos;
                                            a32 = a31 * -sin + a32 * cos;
                                            a21 = t2;
                                        }
                                        if (tm.rotationX && Math.abs(tm.rotationX) + Math.abs(tm.rotation) > 359.9) {
                                            tm.rotationX = tm.rotation = 0;
                                            tm.rotationY = 180 - tm.rotationY;
                                        }
                                        tm.scaleX = (Math.sqrt(a11 * a11 + a21 * a21) * rnd + .5 | 0) / rnd;
                                        tm.scaleY = (Math.sqrt(a22 * a22 + a23 * a23) * rnd + .5 | 0) / rnd;
                                        tm.scaleZ = (Math.sqrt(a32 * a32 + a33 * a33) * rnd + .5 | 0) / rnd;
                                        if (tm.rotationX || tm.rotationY) {
                                            tm.skewX = 0;
                                        } else {
                                            tm.skewX = a12 || a22 ? Math.atan2(a12, a22) * _RAD2DEG + tm.rotation : tm.skewX || 0;
                                            if (Math.abs(tm.skewX) > 90 && Math.abs(tm.skewX) < 270) {
                                                if (invX) {
                                                    tm.scaleX *= -1;
                                                    tm.skewX += tm.rotation <= 0 ? 180 : -180;
                                                    tm.rotation += tm.rotation <= 0 ? 180 : -180;
                                                } else {
                                                    tm.scaleY *= -1;
                                                    tm.skewX += tm.skewX <= 0 ? 180 : -180;
                                                }
                                            }
                                        }
                                        tm.perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
                                        tm.x = a14;
                                        tm.y = a24;
                                        tm.z = a34;
                                        if (tm.svg) {
                                            tm.x -= tm.xOrigin - (tm.xOrigin * a11 - tm.yOrigin * a12);
                                            tm.y -= tm.yOrigin - (tm.yOrigin * a21 - tm.xOrigin * a22);
                                        }
                                    } else if (!_supports3D || parse || !m.length || tm.x !== m[4] || tm.y !== m[5] || !tm.rotationX && !tm.rotationY) {
                                        var k = m.length >= 6, a = k ? m[0] : 1, b = m[1] || 0, c = m[2] || 0, d = k ? m[3] : 1;
                                        tm.x = m[4] || 0;
                                        tm.y = m[5] || 0;
                                        scaleX = Math.sqrt(a * a + b * b);
                                        scaleY = Math.sqrt(d * d + c * c);
                                        rotation = a || b ? Math.atan2(b, a) * _RAD2DEG : tm.rotation || 0;
                                        skewX = c || d ? Math.atan2(c, d) * _RAD2DEG + rotation : tm.skewX || 0;
                                        if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
                                            if (invX) {
                                                scaleX *= -1;
                                                skewX += rotation <= 0 ? 180 : -180;
                                                rotation += rotation <= 0 ? 180 : -180;
                                            } else {
                                                scaleY *= -1;
                                                skewX += skewX <= 0 ? 180 : -180;
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
                                    for (i in tm) {
                                        if (tm[i] < min) if (tm[i] > -min) {
                                            tm[i] = 0;
                                        }
                                    }
                                }
                                if (rec) {
                                    t._gsTransform = tm;
                                    if (tm.svg) {
                                        if (_useSVGTransformAttr && t.style[_transformProp]) {
                                            TweenLite.delayedCall(.001, function() {
                                                _removeProp(t.style, _transformProp);
                                            });
                                        } else if (!_useSVGTransformAttr && t.getAttribute("transform")) {
                                            TweenLite.delayedCall(.001, function() {
                                                t.removeAttribute("transform");
                                            });
                                        }
                                    }
                                }
                                return tm;
                            }, _setIETransformRatio = function(v) {
                                var t = this.data, ang = -t.rotation * _DEG2RAD, skew = ang + t.skewX * _DEG2RAD, rnd = 1e5, a = (Math.cos(ang) * t.scaleX * rnd | 0) / rnd, b = (Math.sin(ang) * t.scaleX * rnd | 0) / rnd, c = (Math.sin(skew) * -t.scaleY * rnd | 0) / rnd, d = (Math.cos(skew) * t.scaleY * rnd | 0) / rnd, style = this.t.style, cs = this.t.currentStyle, filters, val;
                                if (!cs) {
                                    return;
                                }
                                val = b;
                                b = -c;
                                c = -val;
                                filters = cs.filter;
                                style.filter = "";
                                var w = this.t.offsetWidth, h = this.t.offsetHeight, clip = cs.position !== "absolute", m = "progid:DXImageTransform.Microsoft.Matrix(M11=" + a + ", M12=" + b + ", M21=" + c + ", M22=" + d, ox = t.x + w * t.xPercent / 100, oy = t.y + h * t.yPercent / 100, dx, dy;
                                if (t.ox != null) {
                                    dx = (t.oxp ? w * t.ox * .01 : t.ox) - w / 2;
                                    dy = (t.oyp ? h * t.oy * .01 : t.oy) - h / 2;
                                    ox += dx - (dx * a + dy * b);
                                    oy += dy - (dx * c + dy * d);
                                }
                                if (!clip) {
                                    m += ", sizingMethod='auto expand')";
                                } else {
                                    dx = w / 2;
                                    dy = h / 2;
                                    m += ", Dx=" + (dx - (dx * a + dy * b) + ox) + ", Dy=" + (dy - (dx * c + dy * d) + oy) + ")";
                                }
                                if (filters.indexOf("DXImageTransform.Microsoft.Matrix(") !== -1) {
                                    style.filter = filters.replace(_ieSetMatrixExp, m);
                                } else {
                                    style.filter = m + " " + filters;
                                }
                                if (v === 0 || v === 1) if (a === 1) if (b === 0) if (c === 0) if (d === 1) if (!clip || m.indexOf("Dx=0, Dy=0") !== -1) if (!_opacityExp.test(filters) || parseFloat(RegExp.$1) === 100) if (filters.indexOf("gradient(" && filters.indexOf("Alpha")) === -1) {
                                    style.removeAttribute("filter");
                                }
                                if (!clip) {
                                    var mult = _ieVers < 8 ? 1 : -1, marg, prop, dif;
                                    dx = t.ieOffsetX || 0;
                                    dy = t.ieOffsetY || 0;
                                    t.ieOffsetX = Math.round((w - ((a < 0 ? -a : a) * w + (b < 0 ? -b : b) * h)) / 2 + ox);
                                    t.ieOffsetY = Math.round((h - ((d < 0 ? -d : d) * h + (c < 0 ? -c : c) * w)) / 2 + oy);
                                    for (i = 0; i < 4; i++) {
                                        prop = _margins[i];
                                        marg = cs[prop];
                                        val = marg.indexOf("px") !== -1 ? parseFloat(marg) : _convertToPixels(this.t, prop, parseFloat(marg), marg.replace(_suffixExp, "")) || 0;
                                        if (val !== t[prop]) {
                                            dif = i < 2 ? -t.ieOffsetX : -t.ieOffsetY;
                                        } else {
                                            dif = i < 2 ? dx - t.ieOffsetX : dy - t.ieOffsetY;
                                        }
                                        style[prop] = (t[prop] = Math.round(val - dif * (i === 0 || i === 2 ? 1 : mult))) + "px";
                                    }
                                }
                            }, _setTransformRatio = _internals.set3DTransformRatio = _internals.setTransformRatio = function(v) {
                                var t = this.data, style = this.t.style, angle = t.rotation, rotationX = t.rotationX, rotationY = t.rotationY, sx = t.scaleX, sy = t.scaleY, sz = t.scaleZ, x = t.x, y = t.y, z = t.z, isSVG = t.svg, perspective = t.perspective, force3D = t.force3D, a11, a12, a13, a21, a22, a23, a31, a32, a33, a41, a42, a43, zOrigin, min, cos, sin, t1, t2, transform, comma, zero, skew, rnd;
                                if (((v === 1 || v === 0) && force3D === "auto" && (this.tween._totalTime === this.tween._totalDuration || !this.tween._totalTime) || !force3D) && !z && !perspective && !rotationY && !rotationX && sz === 1 || _useSVGTransformAttr && isSVG || !_supports3D) {
                                    if (angle || t.skewX || isSVG) {
                                        angle *= _DEG2RAD;
                                        skew = t.skewX * _DEG2RAD;
                                        rnd = 1e5;
                                        a11 = Math.cos(angle) * sx;
                                        a21 = Math.sin(angle) * sx;
                                        a12 = Math.sin(angle - skew) * -sy;
                                        a22 = Math.cos(angle - skew) * sy;
                                        if (skew && t.skewType === "simple") {
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
                                            if (_useSVGTransformAttr && (t.xPercent || t.yPercent)) {
                                                min = this.t.getBBox();
                                                x += t.xPercent * .01 * min.width;
                                                y += t.yPercent * .01 * min.height;
                                            }
                                            min = 1e-6;
                                            if (x < min) if (x > -min) {
                                                x = 0;
                                            }
                                            if (y < min) if (y > -min) {
                                                y = 0;
                                            }
                                        }
                                        transform = (a11 * rnd | 0) / rnd + "," + (a21 * rnd | 0) / rnd + "," + (a12 * rnd | 0) / rnd + "," + (a22 * rnd | 0) / rnd + "," + x + "," + y + ")";
                                        if (isSVG && _useSVGTransformAttr) {
                                            this.t.setAttribute("transform", "matrix(" + transform);
                                        } else {
                                            style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + transform;
                                        }
                                    } else {
                                        style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + sx + ",0,0," + sy + "," + x + "," + y + ")";
                                    }
                                    return;
                                }
                                if (_isFirefox) {
                                    min = 1e-4;
                                    if (sx < min && sx > -min) {
                                        sx = sz = 2e-5;
                                    }
                                    if (sy < min && sy > -min) {
                                        sy = sz = 2e-5;
                                    }
                                    if (perspective && !t.z && !t.rotationX && !t.rotationY) {
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
                                        if (t.skewType === "simple") {
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
                                } else if (!rotationY && !rotationX && sz === 1 && !perspective && !isSVG) {
                                    style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) translate3d(" : "translate3d(") + x + "px," + y + "px," + z + "px)" + (sx !== 1 || sy !== 1 ? " scale(" + sx + "," + sy + ")" : "");
                                    return;
                                } else {
                                    a11 = a22 = 1;
                                    a12 = a21 = 0;
                                }
                                a33 = 1;
                                a13 = a23 = a31 = a32 = a41 = a42 = 0;
                                a43 = perspective ? -1 / perspective : 0;
                                zOrigin = t.zOrigin;
                                min = 1e-6;
                                comma = ",";
                                zero = "0";
                                angle = rotationY * _DEG2RAD;
                                if (angle) {
                                    cos = Math.cos(angle);
                                    sin = Math.sin(angle);
                                    a31 = -sin;
                                    a41 = a43 * -sin;
                                    a13 = a11 * sin;
                                    a23 = a21 * sin;
                                    a33 = cos;
                                    a43 *= cos;
                                    a11 *= cos;
                                    a21 *= cos;
                                }
                                angle = rotationX * _DEG2RAD;
                                if (angle) {
                                    cos = Math.cos(angle);
                                    sin = Math.sin(angle);
                                    t1 = a12 * cos + a13 * sin;
                                    t2 = a22 * cos + a23 * sin;
                                    a32 = a33 * sin;
                                    a42 = a43 * sin;
                                    a13 = a12 * -sin + a13 * cos;
                                    a23 = a22 * -sin + a23 * cos;
                                    a33 = a33 * cos;
                                    a43 = a43 * cos;
                                    a12 = t1;
                                    a22 = t2;
                                }
                                if (sz !== 1) {
                                    a13 *= sz;
                                    a23 *= sz;
                                    a33 *= sz;
                                    a43 *= sz;
                                }
                                if (sy !== 1) {
                                    a12 *= sy;
                                    a22 *= sy;
                                    a32 *= sy;
                                    a42 *= sy;
                                }
                                if (sx !== 1) {
                                    a11 *= sx;
                                    a21 *= sx;
                                    a31 *= sx;
                                    a41 *= sx;
                                }
                                if (zOrigin || isSVG) {
                                    if (zOrigin) {
                                        x += a13 * -zOrigin;
                                        y += a23 * -zOrigin;
                                        z += a33 * -zOrigin + zOrigin;
                                    }
                                    if (isSVG) {
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
                                        z = 0;
                                    }
                                }
                                transform = t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix3d(" : "matrix3d(";
                                transform += (a11 < min && a11 > -min ? zero : a11) + comma + (a21 < min && a21 > -min ? zero : a21) + comma + (a31 < min && a31 > -min ? zero : a31);
                                transform += comma + (a41 < min && a41 > -min ? zero : a41) + comma + (a12 < min && a12 > -min ? zero : a12) + comma + (a22 < min && a22 > -min ? zero : a22);
                                if (rotationX || rotationY || sz !== 1) {
                                    transform += comma + (a32 < min && a32 > -min ? zero : a32) + comma + (a42 < min && a42 > -min ? zero : a42) + comma + (a13 < min && a13 > -min ? zero : a13);
                                    transform += comma + (a23 < min && a23 > -min ? zero : a23) + comma + (a33 < min && a33 > -min ? zero : a33) + comma + (a43 < min && a43 > -min ? zero : a43) + comma;
                                } else {
                                    transform += ",0,0,0,0,1,0,";
                                }
                                transform += x + comma + y + comma + z + comma + (perspective ? 1 + -z / perspective : 1) + ")";
                                style[_transformProp] = transform;
                            };
                            p = Transform.prototype;
                            p.x = p.y = p.z = p.skewX = p.skewY = p.rotation = p.rotationX = p.rotationY = p.zOrigin = p.xPercent = p.yPercent = p.xOffset = p.yOffset = 0;
                            p.scaleX = p.scaleY = p.scaleZ = 1;
                            _registerComplexSpecialProp("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin", {
                                parser: function(t, e, p, cssp, pt, plugin, vars) {
                                    if (cssp._lastParsedTransform === vars) {
                                        return pt;
                                    }
                                    cssp._lastParsedTransform = vars;
                                    var originalGSTransform = t._gsTransform, style = t.style, min = 1e-6, i = _transformProps.length, v = vars, endRotations = {}, transformOriginString = "transformOrigin", m1 = _getTransform(t, _cs, true, vars.parseTransform), m2, copy, orig, has3D, hasChange, dr, x, y, matrix;
                                    cssp._transform = m1;
                                    if (typeof v.transform === "string" && _transformProp) {
                                        copy = _tempDiv.style;
                                        copy[_transformProp] = v.transform;
                                        copy.display = "block";
                                        copy.position = "absolute";
                                        _doc.body.appendChild(_tempDiv);
                                        m2 = _getTransform(_tempDiv, null, false);
                                        if (m1.svg) {
                                            x = m1.xOrigin;
                                            y = m1.yOrigin;
                                            m2.x -= m1.xOffset;
                                            m2.y -= m1.yOffset;
                                            if (v.transformOrigin || v.svgOrigin) {
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
                                            m2.perspective = m1.perspective;
                                        }
                                        if (v.xPercent != null) {
                                            m2.xPercent = _parseVal(v.xPercent, m1.xPercent);
                                        }
                                        if (v.yPercent != null) {
                                            m2.yPercent = _parseVal(v.yPercent, m1.yPercent);
                                        }
                                    } else if (typeof v === "object") {
                                        m2 = {
                                            scaleX: _parseVal(v.scaleX != null ? v.scaleX : v.scale, m1.scaleX),
                                            scaleY: _parseVal(v.scaleY != null ? v.scaleY : v.scale, m1.scaleY),
                                            scaleZ: _parseVal(v.scaleZ, m1.scaleZ),
                                            x: _parseVal(v.x, m1.x),
                                            y: _parseVal(v.y, m1.y),
                                            z: _parseVal(v.z, m1.z),
                                            xPercent: _parseVal(v.xPercent, m1.xPercent),
                                            yPercent: _parseVal(v.yPercent, m1.yPercent),
                                            perspective: _parseVal(v.transformPerspective, m1.perspective)
                                        };
                                        dr = v.directionalRotation;
                                        if (dr != null) {
                                            if (typeof dr === "object") {
                                                for (copy in dr) {
                                                    v[copy] = dr[copy];
                                                }
                                            } else {
                                                v.rotation = dr;
                                            }
                                        }
                                        if (typeof v.x === "string" && v.x.indexOf("%") !== -1) {
                                            m2.x = 0;
                                            m2.xPercent = _parseVal(v.x, m1.xPercent);
                                        }
                                        if (typeof v.y === "string" && v.y.indexOf("%") !== -1) {
                                            m2.y = 0;
                                            m2.yPercent = _parseVal(v.y, m1.yPercent);
                                        }
                                        m2.rotation = _parseAngle("rotation" in v ? v.rotation : "shortRotation" in v ? v.shortRotation + "_short" : "rotationZ" in v ? v.rotationZ : m1.rotation - m1.skewY, m1.rotation - m1.skewY, "rotation", endRotations);
                                        if (_supports3D) {
                                            m2.rotationX = _parseAngle("rotationX" in v ? v.rotationX : "shortRotationX" in v ? v.shortRotationX + "_short" : m1.rotationX || 0, m1.rotationX, "rotationX", endRotations);
                                            m2.rotationY = _parseAngle("rotationY" in v ? v.rotationY : "shortRotationY" in v ? v.shortRotationY + "_short" : m1.rotationY || 0, m1.rotationY, "rotationY", endRotations);
                                        }
                                        m2.skewX = _parseAngle(v.skewX, m1.skewX - m1.skewY);
                                        if (m2.skewY = _parseAngle(v.skewY, m1.skewY)) {
                                            m2.skewX += m2.skewY;
                                            m2.rotation += m2.skewY;
                                        }
                                    }
                                    if (_supports3D && v.force3D != null) {
                                        m1.force3D = v.force3D;
                                        hasChange = true;
                                    }
                                    m1.skewType = v.skewType || m1.skewType || CSSPlugin.defaultSkewType;
                                    has3D = m1.force3D || m1.z || m1.rotationX || m1.rotationY || m2.z || m2.rotationX || m2.rotationY || m2.perspective;
                                    if (!has3D && v.scale != null) {
                                        m2.scaleZ = 1;
                                    }
                                    while (--i > -1) {
                                        p = _transformProps[i];
                                        orig = m2[p] - m1[p];
                                        if (orig > min || orig < -min || v[p] != null || _forcePT[p] != null) {
                                            hasChange = true;
                                            pt = new CSSPropTween(m1, p, m1[p], orig, pt);
                                            if (p in endRotations) {
                                                pt.e = endRotations[p];
                                            }
                                            pt.xs0 = 0;
                                            pt.plugin = plugin;
                                            cssp._overwriteProps.push(pt.n);
                                        }
                                    }
                                    orig = v.transformOrigin;
                                    if (m1.svg && (orig || v.svgOrigin)) {
                                        x = m1.xOffset;
                                        y = m1.yOffset;
                                        _parseSVGOrigin(t, _parsePosition(orig), m2, v.svgOrigin, v.smoothOrigin);
                                        pt = _addNonTweeningNumericPT(m1, "xOrigin", (originalGSTransform ? m1 : m2).xOrigin, m2.xOrigin, pt, transformOriginString);
                                        pt = _addNonTweeningNumericPT(m1, "yOrigin", (originalGSTransform ? m1 : m2).yOrigin, m2.yOrigin, pt, transformOriginString);
                                        if (x !== m1.xOffset || y !== m1.yOffset) {
                                            pt = _addNonTweeningNumericPT(m1, "xOffset", originalGSTransform ? x : m1.xOffset, m1.xOffset, pt, transformOriginString);
                                            pt = _addNonTweeningNumericPT(m1, "yOffset", originalGSTransform ? y : m1.yOffset, m1.yOffset, pt, transformOriginString);
                                        }
                                        orig = _useSVGTransformAttr ? null : "0px 0px";
                                    }
                                    if (orig || _supports3D && has3D && m1.zOrigin) {
                                        if (_transformProp) {
                                            hasChange = true;
                                            p = _transformOriginProp;
                                            orig = (orig || _getStyle(t, p, _cs, false, "50% 50%")) + "";
                                            pt = new CSSPropTween(style, p, 0, 0, pt, -1, transformOriginString);
                                            pt.b = style[p];
                                            pt.plugin = plugin;
                                            if (_supports3D) {
                                                copy = m1.zOrigin;
                                                orig = orig.split(" ");
                                                m1.zOrigin = (orig.length > 2 && !(copy !== 0 && orig[2] === "0px") ? parseFloat(orig[2]) : copy) || 0;
                                                pt.xs0 = pt.e = orig[0] + " " + (orig[1] || "50%") + " 0px";
                                                pt = new CSSPropTween(m1, "zOrigin", 0, 0, pt, -1, pt.n);
                                                pt.b = copy;
                                                pt.xs0 = pt.e = m1.zOrigin;
                                            } else {
                                                pt.xs0 = pt.e = orig;
                                            }
                                        } else {
                                            _parsePosition(orig + "", m1);
                                        }
                                    }
                                    if (hasChange) {
                                        cssp._transformType = !(m1.svg && _useSVGTransformAttr) && (has3D || this._transformType === 3) ? 3 : 2;
                                    }
                                    return pt;
                                },
                                prefix: true
                            });
                            _registerComplexSpecialProp("boxShadow", {
                                defaultValue: "0px 0px 0px 0px #999",
                                prefix: true,
                                color: true,
                                multi: true,
                                keyword: "inset"
                            });
                            _registerComplexSpecialProp("borderRadius", {
                                defaultValue: "0px",
                                parser: function(t, e, p, cssp, pt, plugin) {
                                    e = this.format(e);
                                    var props = [ "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius" ], style = t.style, ea1, i, es2, bs2, bs, es, bn, en, w, h, esfx, bsfx, rel, hn, vn, em;
                                    w = parseFloat(t.offsetWidth);
                                    h = parseFloat(t.offsetHeight);
                                    ea1 = e.split(" ");
                                    for (i = 0; i < props.length; i++) {
                                        if (this.p.indexOf("border")) {
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
                                        rel = es.charAt(1) === "=";
                                        if (rel) {
                                            en = parseInt(es.charAt(0) + "1", 10);
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
                                            hn = _convertToPixels(t, "borderLeft", bn, bsfx);
                                            vn = _convertToPixels(t, "borderTop", bn, bsfx);
                                            if (esfx === "%") {
                                                bs = hn / w * 100 + "%";
                                                bs2 = vn / h * 100 + "%";
                                            } else if (esfx === "em") {
                                                em = _convertToPixels(t, "borderLeft", 1, "em");
                                                bs = hn / em + "em";
                                                bs2 = vn / em + "em";
                                            } else {
                                                bs = hn + "px";
                                                bs2 = vn + "px";
                                            }
                                            if (rel) {
                                                es = parseFloat(bs) + en + esfx;
                                                es2 = parseFloat(bs2) + en + esfx;
                                            }
                                        }
                                        pt = _parseComplex(style, props[i], bs + " " + bs2, es + " " + es2, false, "0px", pt);
                                    }
                                    return pt;
                                },
                                prefix: true,
                                formatter: _getFormatter("0px 0px 0px 0px", false, true)
                            });
                            _registerComplexSpecialProp("borderBottomLeftRadius,borderBottomRightRadius,borderTopLeftRadius,borderTopRightRadius", {
                                defaultValue: "0px",
                                parser: function(t, e, p, cssp, pt, plugin) {
                                    return _parseComplex(t.style, p, this.format(_getStyle(t, p, _cs, false, "0px 0px")), this.format(e), false, "0px", pt);
                                },
                                prefix: true,
                                formatter: _getFormatter("0px 0px", false, true)
                            });
                            _registerComplexSpecialProp("backgroundPosition", {
                                defaultValue: "0 0",
                                parser: function(t, e, p, cssp, pt, plugin) {
                                    var bp = "background-position", cs = _cs || _getComputedStyle(t, null), bs = this.format((cs ? _ieVers ? cs.getPropertyValue(bp + "-x") + " " + cs.getPropertyValue(bp + "-y") : cs.getPropertyValue(bp) : t.currentStyle.backgroundPositionX + " " + t.currentStyle.backgroundPositionY) || "0 0"), es = this.format(e), ba, ea, i, pct, overlap, src;
                                    if (bs.indexOf("%") !== -1 !== (es.indexOf("%") !== -1) && es.split(",").length < 2) {
                                        src = _getStyle(t, "backgroundImage").replace(_urlExp, "");
                                        if (src && src !== "none") {
                                            ba = bs.split(" ");
                                            ea = es.split(" ");
                                            _tempImg.setAttribute("src", src);
                                            i = 2;
                                            while (--i > -1) {
                                                bs = ba[i];
                                                pct = bs.indexOf("%") !== -1;
                                                if (pct !== (ea[i].indexOf("%") !== -1)) {
                                                    overlap = i === 0 ? t.offsetWidth - _tempImg.width : t.offsetHeight - _tempImg.height;
                                                    ba[i] = pct ? parseFloat(bs) / 100 * overlap + "px" : parseFloat(bs) / overlap * 100 + "%";
                                                }
                                            }
                                            bs = ba.join(" ");
                                        }
                                    }
                                    return this.parseComplex(t.style, bs, es, pt, plugin);
                                },
                                formatter: _parsePosition
                            });
                            _registerComplexSpecialProp("backgroundSize", {
                                defaultValue: "0 0",
                                formatter: _parsePosition
                            });
                            _registerComplexSpecialProp("perspective", {
                                defaultValue: "0px",
                                prefix: true
                            });
                            _registerComplexSpecialProp("perspectiveOrigin", {
                                defaultValue: "50% 50%",
                                prefix: true
                            });
                            _registerComplexSpecialProp("transformStyle", {
                                prefix: true
                            });
                            _registerComplexSpecialProp("backfaceVisibility", {
                                prefix: true
                            });
                            _registerComplexSpecialProp("userSelect", {
                                prefix: true
                            });
                            _registerComplexSpecialProp("margin", {
                                parser: _getEdgeParser("marginTop,marginRight,marginBottom,marginLeft")
                            });
                            _registerComplexSpecialProp("padding", {
                                parser: _getEdgeParser("paddingTop,paddingRight,paddingBottom,paddingLeft")
                            });
                            _registerComplexSpecialProp("clip", {
                                defaultValue: "rect(0px,0px,0px,0px)",
                                parser: function(t, e, p, cssp, pt, plugin) {
                                    var b, cs, delim;
                                    if (_ieVers < 9) {
                                        cs = t.currentStyle;
                                        delim = _ieVers < 8 ? " " : ",";
                                        b = "rect(" + cs.clipTop + delim + cs.clipRight + delim + cs.clipBottom + delim + cs.clipLeft + ")";
                                        e = this.format(e).split(",").join(delim);
                                    } else {
                                        b = this.format(_getStyle(t, this.p, _cs, false, this.dflt));
                                        e = this.format(e);
                                    }
                                    return this.parseComplex(t.style, b, e, pt, plugin);
                                }
                            });
                            _registerComplexSpecialProp("textShadow", {
                                defaultValue: "0px 0px 0px #999",
                                color: true,
                                multi: true
                            });
                            _registerComplexSpecialProp("autoRound,strictUnits", {
                                parser: function(t, e, p, cssp, pt) {
                                    return pt;
                                }
                            });
                            _registerComplexSpecialProp("border", {
                                defaultValue: "0px solid #000",
                                parser: function(t, e, p, cssp, pt, plugin) {
                                    var bw = _getStyle(t, "borderTopWidth", _cs, false, "0px"), end = this.format(e).split(" "), esfx = end[0].replace(_suffixExp, "");
                                    if (esfx !== "px") {
                                        bw = parseFloat(bw) / _convertToPixels(t, "borderTopWidth", 1, esfx) + esfx;
                                    }
                                    return this.parseComplex(t.style, this.format(bw + " " + _getStyle(t, "borderTopStyle", _cs, false, "solid") + " " + _getStyle(t, "borderTopColor", _cs, false, "#000")), end.join(" "), pt, plugin);
                                },
                                color: true,
                                formatter: function(v) {
                                    var a = v.split(" ");
                                    return a[0] + " " + (a[1] || "solid") + " " + (v.match(_colorExp) || [ "#000" ])[0];
                                }
                            });
                            _registerComplexSpecialProp("borderWidth", {
                                parser: _getEdgeParser("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")
                            });
                            _registerComplexSpecialProp("float,cssFloat,styleFloat", {
                                parser: function(t, e, p, cssp, pt, plugin) {
                                    var s = t.style, prop = "cssFloat" in s ? "cssFloat" : "styleFloat";
                                    return new CSSPropTween(s, prop, 0, 0, pt, -1, p, false, 0, s[prop], e);
                                }
                            });
                            var _setIEOpacityRatio = function(v) {
                                var t = this.t, filters = t.filter || _getStyle(this.data, "filter") || "", val = this.s + this.c * v | 0, skip;
                                if (val === 100) {
                                    if (filters.indexOf("atrix(") === -1 && filters.indexOf("radient(") === -1 && filters.indexOf("oader(") === -1) {
                                        t.removeAttribute("filter");
                                        skip = !_getStyle(this.data, "filter");
                                    } else {
                                        t.filter = filters.replace(_alphaFilterExp, "");
                                        skip = true;
                                    }
                                }
                                if (!skip) {
                                    if (this.xn1) {
                                        t.filter = filters = filters || "alpha(opacity=" + val + ")";
                                    }
                                    if (filters.indexOf("pacity") === -1) {
                                        if (val !== 0 || !this.xn1) {
                                            t.filter = filters + " alpha(opacity=" + val + ")";
                                        }
                                    } else {
                                        t.filter = filters.replace(_opacityExp, "opacity=" + val);
                                    }
                                }
                            };
                            _registerComplexSpecialProp("opacity,alpha,autoAlpha", {
                                defaultValue: "1",
                                parser: function(t, e, p, cssp, pt, plugin) {
                                    var b = parseFloat(_getStyle(t, "opacity", _cs, false, "1")), style = t.style, isAutoAlpha = p === "autoAlpha";
                                    if (typeof e === "string" && e.charAt(1) === "=") {
                                        e = (e.charAt(0) === "-" ? -1 : 1) * parseFloat(e.substr(2)) + b;
                                    }
                                    if (isAutoAlpha && b === 1 && _getStyle(t, "visibility", _cs) === "hidden" && e !== 0) {
                                        b = 0;
                                    }
                                    if (_supportsOpacity) {
                                        pt = new CSSPropTween(style, "opacity", b, e - b, pt);
                                    } else {
                                        pt = new CSSPropTween(style, "opacity", b * 100, (e - b) * 100, pt);
                                        pt.xn1 = isAutoAlpha ? 1 : 0;
                                        style.zoom = 1;
                                        pt.type = 2;
                                        pt.b = "alpha(opacity=" + pt.s + ")";
                                        pt.e = "alpha(opacity=" + (pt.s + pt.c) + ")";
                                        pt.data = t;
                                        pt.plugin = plugin;
                                        pt.setRatio = _setIEOpacityRatio;
                                    }
                                    if (isAutoAlpha) {
                                        pt = new CSSPropTween(style, "visibility", 0, 0, pt, -1, null, false, 0, b !== 0 ? "inherit" : "hidden", e === 0 ? "hidden" : "inherit");
                                        pt.xs0 = "inherit";
                                        cssp._overwriteProps.push(pt.n);
                                        cssp._overwriteProps.push(p);
                                    }
                                    return pt;
                                }
                            });
                            var _removeProp = function(s, p) {
                                if (p) {
                                    if (s.removeProperty) {
                                        if (p.substr(0, 2) === "ms" || p.substr(0, 6) === "webkit") {
                                            p = "-" + p;
                                        }
                                        s.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
                                    } else {
                                        s.removeAttribute(p);
                                    }
                                }
                            }, _setClassNameRatio = function(v) {
                                this.t._gsClassPT = this;
                                if (v === 1 || v === 0) {
                                    this.t.setAttribute("class", v === 0 ? this.b : this.e);
                                    var mpt = this.data, s = this.t.style;
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
                            _registerComplexSpecialProp("className", {
                                parser: function(t, e, p, cssp, pt, plugin, vars) {
                                    var b = t.getAttribute("class") || "", cssText = t.style.cssText, difData, bs, cnpt, cnptLookup, mpt;
                                    pt = cssp._classNamePT = new CSSPropTween(t, p, 0, 0, pt, 2);
                                    pt.setRatio = _setClassNameRatio;
                                    pt.pr = -11;
                                    _hasPriority = true;
                                    pt.b = b;
                                    bs = _getAllStyles(t, _cs);
                                    cnpt = t._gsClassPT;
                                    if (cnpt) {
                                        cnptLookup = {};
                                        mpt = cnpt.data;
                                        while (mpt) {
                                            cnptLookup[mpt.p] = 1;
                                            mpt = mpt._next;
                                        }
                                        cnpt.setRatio(1);
                                    }
                                    t._gsClassPT = pt;
                                    pt.e = e.charAt(1) !== "=" ? e : b.replace(new RegExp("(?:\\s|^)" + e.substr(2) + "(?![\\w-])"), "") + (e.charAt(0) === "+" ? " " + e.substr(2) : "");
                                    t.setAttribute("class", pt.e);
                                    difData = _cssDif(t, bs, _getAllStyles(t), vars, cnptLookup);
                                    t.setAttribute("class", b);
                                    pt.data = difData.firstMPT;
                                    t.style.cssText = cssText;
                                    pt = pt.xfirst = cssp.parse(t, difData.difs, pt, plugin);
                                    return pt;
                                }
                            });
                            var _setClearPropsRatio = function(v) {
                                if (v === 1 || v === 0) if (this.data._totalTime === this.data._totalDuration && this.data.data !== "isFromStart") {
                                    var s = this.t.style, transformParse = _specialProps.transform.parse, a, p, i, clearTransform, transform;
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
                                                    p = p === "transformOrigin" ? _transformOriginProp : _specialProps[p].p;
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
                            _registerComplexSpecialProp("clearProps", {
                                parser: function(t, e, p, cssp, pt) {
                                    pt = new CSSPropTween(t, p, 0, 0, pt, 2);
                                    pt.setRatio = _setClearPropsRatio;
                                    pt.e = e;
                                    pt.pr = -10;
                                    pt.data = cssp._tween;
                                    _hasPriority = true;
                                    return pt;
                                }
                            });
                            p = "bezier,throwProps,physicsProps,physics2D".split(",");
                            i = p.length;
                            while (i--) {
                                _registerPluginProp(p[i]);
                            }
                            p = CSSPlugin.prototype;
                            p._firstPT = p._lastParsedTransform = p._transform = null;
                            p._onInitTween = function(target, vars, tween) {
                                if (!target.nodeType) {
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
                                var style = target.style, v, pt, pt2, first, last, next, zIndex, tpt, threeD;
                                if (_reqSafariFix) if (style.zIndex === "") {
                                    v = _getStyle(target, "zIndex", _cs);
                                    if (v === "auto" || v === "") {
                                        this._addLazySet(style, "zIndex", 0);
                                    }
                                }
                                if (typeof vars === "string") {
                                    first = style.cssText;
                                    v = _getAllStyles(target, _cs);
                                    style.cssText = first + ";" + vars;
                                    v = _cssDif(target, v, _getAllStyles(target)).difs;
                                    if (!_supportsOpacity && _opacityValExp.test(vars)) {
                                        v.opacity = parseFloat(RegExp.$1);
                                    }
                                    vars = v;
                                    style.cssText = first;
                                }
                                if (vars.className) {
                                    this._firstPT = pt = _specialProps.className.parse(target, vars.className, "className", this, null, null, vars);
                                } else {
                                    this._firstPT = pt = this.parse(target, vars, null);
                                }
                                if (this._transformType) {
                                    threeD = this._transformType === 3;
                                    if (!_transformProp) {
                                        style.zoom = 1;
                                    } else if (_isSafari) {
                                        _reqSafariFix = true;
                                        if (style.zIndex === "") {
                                            zIndex = _getStyle(target, "zIndex", _cs);
                                            if (zIndex === "auto" || zIndex === "") {
                                                this._addLazySet(style, "zIndex", 0);
                                            }
                                        }
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
                                    tpt.pr = -1;
                                    _overwriteProps.pop();
                                }
                                if (_hasPriority) {
                                    while (pt) {
                                        next = pt._next;
                                        pt2 = first;
                                        while (pt2 && pt2.pr > pt.pr) {
                                            pt2 = pt2._next;
                                        }
                                        if (pt._prev = pt2 ? pt2._prev : last) {
                                            pt._prev._next = pt;
                                        } else {
                                            first = pt;
                                        }
                                        if (pt._next = pt2) {
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
                                var style = target.style, p, sp, bn, en, bs, es, bsfx, esfx, isStr, rel;
                                for (p in vars) {
                                    es = vars[p];
                                    sp = _specialProps[p];
                                    if (sp) {
                                        pt = sp.parse(target, es, p, this, pt, plugin, vars);
                                    } else {
                                        bs = _getStyle(target, p, _cs) + "";
                                        isStr = typeof es === "string";
                                        if (p === "color" || p === "fill" || p === "stroke" || p.indexOf("Color") !== -1 || isStr && _rgbhslExp.test(es)) {
                                            if (!isStr) {
                                                es = _parseColor(es);
                                                es = (es.length > 3 ? "rgba(" : "rgb(") + es.join(",") + ")";
                                            }
                                            pt = _parseComplex(style, p, bs, es, true, "transparent", pt, 0, plugin);
                                        } else if (isStr && _complexExp.test(es)) {
                                            pt = _parseComplex(style, p, bs, es, true, null, pt, 0, plugin);
                                        } else {
                                            bn = parseFloat(bs);
                                            bsfx = bn || bn === 0 ? bs.substr((bn + "").length) : "";
                                            if (bs === "" || bs === "auto") {
                                                if (p === "width" || p === "height") {
                                                    bn = _getDimension(target, p, _cs);
                                                    bsfx = "px";
                                                } else if (p === "left" || p === "top") {
                                                    bn = _calculateOffset(target, p, _cs);
                                                    bsfx = "px";
                                                } else {
                                                    bn = p !== "opacity" ? 0 : 1;
                                                    bsfx = "";
                                                }
                                            }
                                            rel = isStr && es.charAt(1) === "=";
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
                                                esfx = p in _suffixMap ? _suffixMap[p] : bsfx;
                                            }
                                            es = en || en === 0 ? (rel ? en + bn : en) + esfx : vars[p];
                                            if (bsfx !== esfx) if (esfx !== "") if (en || en === 0) if (bn) {
                                                bn = _convertToPixels(target, p, bn, bsfx);
                                                if (esfx === "%") {
                                                    bn /= _convertToPixels(target, p, 100, "%") / 100;
                                                    if (vars.strictUnits !== true) {
                                                        bs = bn + "%";
                                                    }
                                                } else if (esfx === "em" || esfx === "rem" || esfx === "vw" || esfx === "vh") {
                                                    bn /= _convertToPixels(target, p, 1, esfx);
                                                } else if (esfx !== "px") {
                                                    en = _convertToPixels(target, p, en, esfx);
                                                    esfx = "px";
                                                }
                                                if (rel) if (en || en === 0) {
                                                    es = en + bn + esfx;
                                                }
                                            }
                                            if (rel) {
                                                en += bn;
                                            }
                                            if ((bn || bn === 0) && (en || en === 0)) {
                                                pt = new CSSPropTween(style, p, bn, en - bn, pt, 0, p, _autoRound !== false && (esfx === "px" || p === "zIndex"), 0, bs, es);
                                                pt.xs0 = esfx;
                                            } else if (style[p] === undefined || !es && (es + "" === "NaN" || es == null)) {
                                                _log("invalid " + p + " tween value: " + vars[p]);
                                            } else {
                                                pt = new CSSPropTween(style, p, en || bn || 0, 0, pt, -1, p, false, 0, bs, es);
                                                pt.xs0 = es === "none" && (p === "display" || p.indexOf("Style") !== -1) ? bs : es;
                                            }
                                        }
                                    }
                                    if (plugin) if (pt && !pt.plugin) {
                                        pt.plugin = plugin;
                                    }
                                }
                                return pt;
                            };
                            p.setRatio = function(v) {
                                var pt = this._firstPT, min = 1e-6, val, str, i;
                                if (v === 1 && (this._tween._time === this._tween._duration || this._tween._time === 0)) {
                                    while (pt) {
                                        if (pt.type !== 2) {
                                            if (pt.r && pt.type !== -1) {
                                                val = Math.round(pt.s + pt.c);
                                                if (!pt.type) {
                                                    pt.t[pt.p] = val + pt.xs0;
                                                } else if (pt.type === 1) {
                                                    i = pt.l;
                                                    str = pt.xs0 + val + pt.xs1;
                                                    for (i = 1; i < pt.l; i++) {
                                                        str += pt["xn" + i] + pt["xs" + (i + 1)];
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
                                } else if (v || !(this._tween._time === this._tween._duration || this._tween._time === 0) || this._tween._rawPrevTime === -1e-6) {
                                    while (pt) {
                                        val = pt.c * v + pt.s;
                                        if (pt.r) {
                                            val = Math.round(val);
                                        } else if (val < min) if (val > -min) {
                                            val = 0;
                                        }
                                        if (!pt.type) {
                                            pt.t[pt.p] = val + pt.xs0;
                                        } else if (pt.type === 1) {
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
                                                    str += pt["xn" + i] + pt["xs" + (i + 1)];
                                                }
                                                pt.t[pt.p] = str;
                                            }
                                        } else if (pt.type === -1) {
                                            pt.t[pt.p] = pt.xs0;
                                        } else if (pt.setRatio) {
                                            pt.setRatio(v);
                                        }
                                        pt = pt._next;
                                    }
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
                            p._enableTransforms = function(threeD) {
                                this._transform = this._transform || _getTransform(this._target, _cs, true);
                                this._transformType = !(this._transform.svg && _useSVGTransformAttr) && (threeD || this._transformType === 3) ? 3 : 2;
                            };
                            var lazySet = function(v) {
                                this.t[this.p] = this.e;
                                this.data._linkCSSP(this, this._next, null, true);
                            };
                            p._addLazySet = function(t, p, v) {
                                var pt = this._firstPT = new CSSPropTween(t, p, 0, 0, this._firstPT, 2);
                                pt.e = v;
                                pt.setRatio = lazySet;
                                pt.data = this;
                            };
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
                                        remove = true;
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
                            p._kill = function(lookup) {
                                var copy = lookup, pt, p, xfirst;
                                if (lookup.autoAlpha || lookup.alpha) {
                                    copy = {};
                                    for (p in lookup) {
                                        copy[p] = lookup[p];
                                    }
                                    copy.opacity = 1;
                                    if (copy.autoAlpha) {
                                        copy.visibility = 1;
                                    }
                                }
                                if (lookup.className && (pt = this._classNamePT)) {
                                    xfirst = pt.xfirst;
                                    if (xfirst && xfirst._prev) {
                                        this._linkCSSP(xfirst._prev, pt._next, xfirst._prev._prev);
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
                            CSSPlugin.cascadeTo = function(target, duration, vars) {
                                var tween = TweenLite.to(target, duration, vars), results = [ tween ], b = [], e = [], targets = [], _reservedProps = TweenLite._internals.reservedProps, i, difs, p, from;
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
                            TweenPlugin.activate([ CSSPlugin ]);
                            return CSSPlugin;
                        }, true);
                        (function() {
                            var RoundPropsPlugin = _gsScope._gsDefine.plugin({
                                propName: "roundProps",
                                version: "1.5",
                                priority: -1,
                                API: 2,
                                init: function(target, value, tween) {
                                    this._tween = tween;
                                    return true;
                                }
                            }), _roundLinkedList = function(node) {
                                while (node) {
                                    if (!node.f && !node.blob) {
                                        node.r = 1;
                                    }
                                    node = node._next;
                                }
                            }, p = RoundPropsPlugin.prototype;
                            p._onInitAllProps = function() {
                                var tween = this._tween, rp = tween.vars.roundProps.join ? tween.vars.roundProps : tween.vars.roundProps.split(","), i = rp.length, lookup = {}, rpt = tween._propLookup.roundProps, prop, pt, next;
                                while (--i > -1) {
                                    lookup[rp[i]] = 1;
                                }
                                i = rp.length;
                                while (--i > -1) {
                                    prop = rp[i];
                                    pt = tween._firstPT;
                                    while (pt) {
                                        next = pt._next;
                                        if (pt.pg) {
                                            pt.t._roundProps(lookup, true);
                                        } else if (pt.n === prop) {
                                            if (pt.f === 2 && pt.t) {
                                                _roundLinkedList(pt.t._firstPT);
                                            } else {
                                                this._add(pt.t, prop, pt.s, pt.c);
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
                        })();
                        (function() {
                            _gsScope._gsDefine.plugin({
                                propName: "attr",
                                API: 2,
                                version: "0.5.0",
                                init: function(target, value, tween) {
                                    var p;
                                    if (typeof target.setAttribute !== "function") {
                                        return false;
                                    }
                                    for (p in value) {
                                        this._addTween(target, "setAttribute", target.getAttribute(p) + "", value[p] + "", p, false, p);
                                        this._overwriteProps.push(p);
                                    }
                                    return true;
                                }
                            });
                        })();
                        _gsScope._gsDefine.plugin({
                            propName: "directionalRotation",
                            version: "0.2.1",
                            API: 2,
                            init: function(target, value, tween) {
                                if (typeof value !== "object") {
                                    value = {
                                        rotation: value
                                    };
                                }
                                this.finals = {};
                                var cap = value.useRadians === true ? Math.PI * 2 : 360, min = 1e-6, p, v, start, end, dif, split;
                                for (p in value) {
                                    if (p !== "useRadians") {
                                        split = (value[p] + "").split("_");
                                        v = split[0];
                                        start = parseFloat(typeof target[p] !== "function" ? target[p] : target[p.indexOf("set") || typeof target["get" + p.substr(3)] !== "function" ? p : "get" + p.substr(3)]());
                                        end = this.finals[p] = typeof v === "string" && v.charAt(1) === "=" ? start + parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) : Number(v) || 0;
                                        dif = end - start;
                                        if (split.length) {
                                            v = split.join("_");
                                            if (v.indexOf("short") !== -1) {
                                                dif = dif % cap;
                                                if (dif !== dif % (cap / 2)) {
                                                    dif = dif < 0 ? dif + cap : dif - cap;
                                                }
                                            }
                                            if (v.indexOf("_cw") !== -1 && dif < 0) {
                                                dif = (dif + cap * 9999999999) % cap - (dif / cap | 0) * cap;
                                            } else if (v.indexOf("ccw") !== -1 && dif > 0) {
                                                dif = (dif - cap * 9999999999) % cap - (dif / cap | 0) * cap;
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
                        _gsScope._gsDefine("easing.Back", [ "easing.Ease" ], function(Ease) {
                            var w = _gsScope.GreenSockGlobals || _gsScope, gs = w.com.greensock, _2PI = Math.PI * 2, _HALF_PI = Math.PI / 2, _class = gs._class, _create = function(n, f) {
                                var C = _class("easing." + n, function() {}, true), p = C.prototype = new Ease();
                                p.constructor = C;
                                p.getRatio = f;
                                return C;
                            }, _easeReg = Ease.register || function() {}, _wrap = function(name, EaseOut, EaseIn, EaseInOut, aliases) {
                                var C = _class("easing." + name, {
                                    easeOut: new EaseOut(),
                                    easeIn: new EaseIn(),
                                    easeInOut: new EaseInOut()
                                }, true);
                                _easeReg(C, name);
                                return C;
                            }, EasePoint = function(time, value, next) {
                                this.t = time;
                                this.v = value;
                                if (next) {
                                    this.next = next;
                                    next.prev = this;
                                    this.c = next.v - value;
                                    this.gap = next.t - time;
                                }
                            }, _createBack = function(n, f) {
                                var C = _class("easing." + n, function(overshoot) {
                                    this._p1 = overshoot || overshoot === 0 ? overshoot : 1.70158;
                                    this._p2 = this._p1 * 1.525;
                                }, true), p = C.prototype = new Ease();
                                p.constructor = C;
                                p.getRatio = f;
                                p.config = function(overshoot) {
                                    return new C(overshoot);
                                };
                                return C;
                            }, Back = _wrap("Back", _createBack("BackOut", function(p) {
                                return (p = p - 1) * p * ((this._p1 + 1) * p + this._p1) + 1;
                            }), _createBack("BackIn", function(p) {
                                return p * p * ((this._p1 + 1) * p - this._p1);
                            }), _createBack("BackInOut", function(p) {
                                return (p *= 2) < 1 ? .5 * p * p * ((this._p2 + 1) * p - this._p2) : .5 * ((p -= 2) * p * ((this._p2 + 1) * p + this._p2) + 2);
                            })), SlowMo = _class("easing.SlowMo", function(linearRatio, power, yoyoMode) {
                                power = power || power === 0 ? power : .7;
                                if (linearRatio == null) {
                                    linearRatio = .7;
                                } else if (linearRatio > 1) {
                                    linearRatio = 1;
                                }
                                this._p = linearRatio !== 1 ? power : 0;
                                this._p1 = (1 - linearRatio) / 2;
                                this._p2 = linearRatio;
                                this._p3 = this._p1 + this._p2;
                                this._calcEnd = yoyoMode === true;
                            }, true), p = SlowMo.prototype = new Ease(), SteppedEase, RoughEase, _createElastic;
                            p.constructor = SlowMo;
                            p.getRatio = function(p) {
                                var r = p + (.5 - p) * this._p;
                                if (p < this._p1) {
                                    return this._calcEnd ? 1 - (p = 1 - p / this._p1) * p : r - (p = 1 - p / this._p1) * p * p * p * r;
                                } else if (p > this._p3) {
                                    return this._calcEnd ? 1 - (p = (p - this._p3) / this._p1) * p : r + (p - r) * (p = (p - this._p3) / this._p1) * p * p * p;
                                }
                                return this._calcEnd ? 1 : r;
                            };
                            SlowMo.ease = new SlowMo(.7, .7);
                            p.config = SlowMo.config = function(linearRatio, power, yoyoMode) {
                                return new SlowMo(linearRatio, power, yoyoMode);
                            };
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
                                    p = .999999999;
                                }
                                return (this._p2 * p >> 0) * this._p1;
                            };
                            p.config = SteppedEase.config = function(steps) {
                                return new SteppedEase(steps);
                            };
                            RoughEase = _class("easing.RoughEase", function(vars) {
                                vars = vars || {};
                                var taper = vars.taper || "none", a = [], cnt = 0, points = (vars.points || 20) | 0, i = points, randomize = vars.randomize !== false, clamp = vars.clamp === true, template = vars.template instanceof Ease ? vars.template : null, strength = typeof vars.strength === "number" ? vars.strength * .4 : .4, x, y, bump, invX, obj, pnt;
                                while (--i > -1) {
                                    x = randomize ? Math.random() : 1 / points * i;
                                    y = template ? template.getRatio(x) : x;
                                    if (taper === "none") {
                                        bump = strength;
                                    } else if (taper === "out") {
                                        invX = 1 - x;
                                        bump = invX * invX * strength;
                                    } else if (taper === "in") {
                                        bump = x * x * strength;
                                    } else if (x < .5) {
                                        invX = x * 2;
                                        bump = invX * invX * .5 * strength;
                                    } else {
                                        invX = (1 - x) * 2;
                                        bump = invX * invX * .5 * strength;
                                    }
                                    if (randomize) {
                                        y += Math.random() * bump - bump * .5;
                                    } else if (i % 2) {
                                        y += bump * .5;
                                    } else {
                                        y -= bump * .5;
                                    }
                                    if (clamp) {
                                        if (y > 1) {
                                            y = 1;
                                        } else if (y < 0) {
                                            y = 0;
                                        }
                                    }
                                    a[cnt++] = {
                                        x: x,
                                        y: y
                                    };
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
                                this._prev = new EasePoint(0, 0, pnt.t !== 0 ? pnt : pnt.next);
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
                                return pnt.v + (p - pnt.t) / pnt.gap * pnt.c;
                            };
                            p.config = function(vars) {
                                return new RoughEase(vars);
                            };
                            RoughEase.ease = new RoughEase();
                            _wrap("Bounce", _create("BounceOut", function(p) {
                                if (p < 1 / 2.75) {
                                    return 7.5625 * p * p;
                                } else if (p < 2 / 2.75) {
                                    return 7.5625 * (p -= 1.5 / 2.75) * p + .75;
                                } else if (p < 2.5 / 2.75) {
                                    return 7.5625 * (p -= 2.25 / 2.75) * p + .9375;
                                }
                                return 7.5625 * (p -= 2.625 / 2.75) * p + .984375;
                            }), _create("BounceIn", function(p) {
                                if ((p = 1 - p) < 1 / 2.75) {
                                    return 1 - 7.5625 * p * p;
                                } else if (p < 2 / 2.75) {
                                    return 1 - (7.5625 * (p -= 1.5 / 2.75) * p + .75);
                                } else if (p < 2.5 / 2.75) {
                                    return 1 - (7.5625 * (p -= 2.25 / 2.75) * p + .9375);
                                }
                                return 1 - (7.5625 * (p -= 2.625 / 2.75) * p + .984375);
                            }), _create("BounceInOut", function(p) {
                                var invert = p < .5;
                                if (invert) {
                                    p = 1 - p * 2;
                                } else {
                                    p = p * 2 - 1;
                                }
                                if (p < 1 / 2.75) {
                                    p = 7.5625 * p * p;
                                } else if (p < 2 / 2.75) {
                                    p = 7.5625 * (p -= 1.5 / 2.75) * p + .75;
                                } else if (p < 2.5 / 2.75) {
                                    p = 7.5625 * (p -= 2.25 / 2.75) * p + .9375;
                                } else {
                                    p = 7.5625 * (p -= 2.625 / 2.75) * p + .984375;
                                }
                                return invert ? (1 - p) * .5 : p * .5 + .5;
                            }));
                            _wrap("Circ", _create("CircOut", function(p) {
                                return Math.sqrt(1 - (p = p - 1) * p);
                            }), _create("CircIn", function(p) {
                                return -(Math.sqrt(1 - p * p) - 1);
                            }), _create("CircInOut", function(p) {
                                return (p *= 2) < 1 ? -.5 * (Math.sqrt(1 - p * p) - 1) : .5 * (Math.sqrt(1 - (p -= 2) * p) + 1);
                            }));
                            _createElastic = function(n, f, def) {
                                var C = _class("easing." + n, function(amplitude, period) {
                                    this._p1 = amplitude >= 1 ? amplitude : 1;
                                    this._p2 = (period || def) / (amplitude < 1 ? amplitude : 1);
                                    this._p3 = this._p2 / _2PI * (Math.asin(1 / this._p1) || 0);
                                    this._p2 = _2PI / this._p2;
                                }, true), p = C.prototype = new Ease();
                                p.constructor = C;
                                p.getRatio = f;
                                p.config = function(amplitude, period) {
                                    return new C(amplitude, period);
                                };
                                return C;
                            };
                            _wrap("Elastic", _createElastic("ElasticOut", function(p) {
                                return this._p1 * Math.pow(2, -10 * p) * Math.sin((p - this._p3) * this._p2) + 1;
                            }, .3), _createElastic("ElasticIn", function(p) {
                                return -(this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin((p - this._p3) * this._p2));
                            }, .3), _createElastic("ElasticInOut", function(p) {
                                return (p *= 2) < 1 ? -.5 * (this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin((p - this._p3) * this._p2)) : this._p1 * Math.pow(2, -10 * (p -= 1)) * Math.sin((p - this._p3) * this._p2) * .5 + 1;
                            }, .45));
                            _wrap("Expo", _create("ExpoOut", function(p) {
                                return 1 - Math.pow(2, -10 * p);
                            }), _create("ExpoIn", function(p) {
                                return Math.pow(2, 10 * (p - 1)) - .001;
                            }), _create("ExpoInOut", function(p) {
                                return (p *= 2) < 1 ? .5 * Math.pow(2, 10 * (p - 1)) : .5 * (2 - Math.pow(2, -10 * (p - 1)));
                            }));
                            _wrap("Sine", _create("SineOut", function(p) {
                                return Math.sin(p * _HALF_PI);
                            }), _create("SineIn", function(p) {
                                return -Math.cos(p * _HALF_PI) + 1;
                            }), _create("SineInOut", function(p) {
                                return -.5 * (Math.cos(Math.PI * p) - 1);
                            }));
                            _class("easing.EaseLookup", {
                                find: function(s) {
                                    return Ease.map[s];
                                }
                            }, true);
                            _easeReg(w.SlowMo, "SlowMo", "ease,");
                            _easeReg(RoughEase, "RoughEase", "ease,");
                            _easeReg(SteppedEase, "SteppedEase", "ease,");
                            return Back;
                        }, true);
                    });
                    if (_gsScope._gsDefine) {
                        _gsScope._gsQueue.pop()();
                    }
                    (function(window, moduleName) {
                        "use strict";
                        var _exports = {}, _globals = window.GreenSockGlobals = window.GreenSockGlobals || window;
                        if (_globals.TweenLite) {
                            return;
                        }
                        var _namespace = function(ns) {
                            var a = ns.split("."), p = _globals, i;
                            for (i = 0; i < a.length; i++) {
                                p[a[i]] = p = p[a[i]] || {};
                            }
                            return p;
                        }, gs = _namespace("com.greensock"), _tinyNum = 1e-10, _slice = function(a) {
                            var b = [], l = a.length, i;
                            for (i = 0; i !== l; b.push(a[i++])) {}
                            return b;
                        }, _emptyFunc = function() {}, _isArray = function() {
                            var toString = Object.prototype.toString, array = toString.call([]);
                            return function(obj) {
                                return obj != null && (obj instanceof Array || typeof obj === "object" && !!obj.push && toString.call(obj) === array);
                            };
                        }(), a, i, p, _ticker, _tickerActive, _defLookup = {}, Definition = function(ns, dependencies, func, global) {
                            this.sc = _defLookup[ns] ? _defLookup[ns].sc : [];
                            _defLookup[ns] = this;
                            this.gsClass = null;
                            this.func = func;
                            var _classes = [];
                            this.check = function(init) {
                                var i = dependencies.length, missing = i, cur, a, n, cl, hasModule;
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
                                    if (global) {
                                        _globals[n] = cl;
                                        hasModule = typeof module !== "undefined" && module.exports;
                                        if (!hasModule && "function" === "function" && __webpack_require__(6)) {
                                            !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
                                                return cl;
                                            }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
                                        } else if (hasModule) {
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
                        }, _gsDefine = window._gsDefine = function(ns, dependencies, func, global) {
                            return new Definition(ns, dependencies, func, global);
                        }, _class = gs._class = function(ns, func, global) {
                            func = func || function() {};
                            _gsDefine(ns, [], function() {
                                return func;
                            }, global);
                            return func;
                        };
                        _gsDefine.globals = _globals;
                        var _baseParams = [ 0, 0, 1, 1 ], _blankArray = [], Ease = _class("easing.Ease", function(func, extraParams, type, power) {
                            this._func = func;
                            this._type = type || 0;
                            this._power = power || 0;
                            this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
                        }, true), _easeMap = Ease.map = {}, _easeReg = Ease.register = function(ease, names, types, create) {
                            var na = names.split(","), i = na.length, ta = (types || "easeIn,easeOut,easeInOut").split(","), e, name, j, type;
                            while (--i > -1) {
                                name = na[i];
                                e = create ? _class("easing." + name, null, true) : gs.easing[name] || {};
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
                            var t = this._type, pw = this._power, r = t === 1 ? 1 - p : t === 2 ? p : p < .5 ? p * 2 : (1 - p) * 2;
                            if (pw === 1) {
                                r *= r;
                            } else if (pw === 2) {
                                r *= r * r;
                            } else if (pw === 3) {
                                r *= r * r * r;
                            } else if (pw === 4) {
                                r *= r * r * r * r;
                            }
                            return t === 1 ? 1 - r : t === 2 ? r : p < .5 ? r / 2 : 1 - r / 2;
                        };
                        a = [ "Linear", "Quad", "Cubic", "Quart", "Quint,Strong" ];
                        i = a.length;
                        while (--i > -1) {
                            p = a[i] + ",Power" + i;
                            _easeReg(new Ease(null, null, 1, i), p, "easeOut", true);
                            _easeReg(new Ease(null, null, 2, i), p, "easeIn" + (i === 0 ? ",easeNone" : ""));
                            _easeReg(new Ease(null, null, 3, i), p, "easeInOut");
                        }
                        _easeMap.linear = gs.easing.Linear.easeIn;
                        _easeMap.swing = gs.easing.Quad.easeInOut;
                        var EventDispatcher = _class("events.EventDispatcher", function(target) {
                            this._listeners = {};
                            this._eventTarget = target || this;
                        });
                        p = EventDispatcher.prototype;
                        p.addEventListener = function(type, callback, scope, useParam, priority) {
                            priority = priority || 0;
                            var list = this._listeners[type], index = 0, listener, i;
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
                            list.splice(index, 0, {
                                c: callback,
                                s: scope,
                                up: useParam,
                                pr: priority
                            });
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
                            var list = this._listeners[type], i, t, listener;
                            if (list) {
                                i = list.length;
                                t = this._eventTarget;
                                while (--i > -1) {
                                    listener = list[i];
                                    if (listener) {
                                        if (listener.up) {
                                            listener.c.call(listener.s || t, {
                                                type: type,
                                                target: t
                                            });
                                        } else {
                                            listener.c.call(listener.s || t);
                                        }
                                    }
                                }
                            }
                        };
                        var _reqAnimFrame = window.requestAnimationFrame, _cancelAnimFrame = window.cancelAnimationFrame, _getTime = Date.now || function() {
                            return new Date().getTime();
                        }, _lastUpdate = _getTime();
                        a = [ "ms", "moz", "webkit", "o" ];
                        i = a.length;
                        while (--i > -1 && !_reqAnimFrame) {
                            _reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
                            _cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
                        }
                        _class("Ticker", function(fps, useRAF) {
                            var _self = this, _startTime = _getTime(), _useRAF = useRAF !== false && _reqAnimFrame ? "auto" : false, _lagThreshold = 500, _adjustedLag = 33, _tickWord = "tick", _fps, _req, _id, _gap, _nextTime, _tick = function(manual) {
                                var elapsed = _getTime() - _lastUpdate, overlap, dispatch;
                                if (elapsed > _lagThreshold) {
                                    _startTime += elapsed - _adjustedLag;
                                }
                                _lastUpdate += elapsed;
                                _self.time = (_lastUpdate - _startTime) / 1e3;
                                overlap = _self.time - _nextTime;
                                if (!_fps || overlap > 0 || manual === true) {
                                    _self.frame++;
                                    _nextTime += overlap + (overlap >= _gap ? .004 : _gap - overlap);
                                    dispatch = true;
                                }
                                if (manual !== true) {
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
                                _lagThreshold = threshold || 1 / _tinyNum;
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
                                } else if (_self.frame > 10) {
                                    _lastUpdate = _getTime() - _lagThreshold + 5;
                                }
                                _req = _fps === 0 ? _emptyFunc : !_useRAF || !_reqAnimFrame ? function(f) {
                                    return setTimeout(f, (_nextTime - _self.time) * 1e3 + 1 | 0);
                                } : _reqAnimFrame;
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
                            setTimeout(function() {
                                if (_useRAF === "auto" && _self.frame < 5 && document.visibilityState !== "hidden") {
                                    _self.useRAF(false);
                                }
                            }, 1500);
                        });
                        p = gs.Ticker.prototype = new gs.events.EventDispatcher();
                        p.constructor = gs.Ticker;
                        var Animation = _class("core.Animation", function(duration, vars) {
                            this.vars = vars = vars || {};
                            this._duration = this._totalDuration = duration || 0;
                            this._delay = Number(vars.delay) || 0;
                            this._timeScale = 1;
                            this._active = vars.immediateRender === true;
                            this.data = vars.data;
                            this._reversed = vars.reversed === true;
                            if (!_rootTimeline) {
                                return;
                            }
                            if (!_tickerActive) {
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
                        var _checkTimeout = function() {
                            if (_tickerActive && _getTime() - _lastUpdate > 2e3) {
                                _ticker.wake();
                            }
                            setTimeout(_checkTimeout, 2e3);
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
                            return this.reversed(false).paused(false).totalTime(includeDelay ? -this._delay : 0, suppressEvents !== false, true);
                        };
                        p.reverse = function(from, suppressEvents) {
                            if (from != null) {
                                this.seek(from || this.totalDuration(), suppressEvents);
                            }
                            return this.reversed(true).paused(false);
                        };
                        p.render = function(time, suppressEvents, force) {};
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
                            var tl = this._timeline, startTime = this._startTime, rawTime;
                            return !tl || !this._gc && !this._paused && tl.isActive() && (rawTime = tl.rawTime()) >= startTime && rawTime < startTime + this.totalDuration() / this._timeScale;
                        };
                        p._enabled = function(enabled, ignoreTimeline) {
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
                            var i = params.length, copy = params.concat();
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
                        p.eventCallback = function(type, callback, params, scope) {
                            if ((type || "").substr(0, 2) === "on") {
                                var v = this.vars;
                                if (arguments.length === 1) {
                                    return v[type];
                                }
                                if (callback == null) {
                                    delete v[type];
                                } else {
                                    v[type] = callback;
                                    v[type + "Params"] = _isArray(params) && params.join("").indexOf("{self}") !== -1 ? this._swapSelfInParams(params) : params;
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
                                this.startTime(this._startTime + value - this._delay);
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
                            this._uncache(true);
                            if (this._timeline.smoothChildTiming) if (this._time > 0) if (this._time < this._duration) if (value !== 0) {
                                this.totalTime(this._totalTime * (value / this._duration), true);
                            }
                            return this;
                        };
                        p.totalDuration = function(value) {
                            this._dirty = false;
                            return !arguments.length ? this._totalDuration : this.duration(value);
                        };
                        p.time = function(value, suppressEvents) {
                            if (!arguments.length) {
                                return this._time;
                            }
                            if (this._dirty) {
                                this.totalDuration();
                            }
                            return this.totalTime(value > this._duration ? this._duration : value, suppressEvents);
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
                                    var totalDuration = this._totalDuration, tl = this._timeline;
                                    if (time > totalDuration && !uncapped) {
                                        time = totalDuration;
                                    }
                                    this._startTime = (this._paused ? this._pauseTime : tl._time) - (!this._reversed ? time : totalDuration - time) / this._timeScale;
                                    if (!tl._dirty) {
                                        this._uncache(false);
                                    }
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
                                    if (_lazyTweens.length) {
                                        _lazyRender();
                                    }
                                }
                            }
                            return this;
                        };
                        p.progress = p.totalProgress = function(value, suppressEvents) {
                            var duration = this.duration();
                            return !arguments.length ? duration ? this._time / duration : this.ratio : this.totalTime(duration * value, suppressEvents);
                        };
                        p.startTime = function(value) {
                            if (!arguments.length) {
                                return this._startTime;
                            }
                            if (value !== this._startTime) {
                                this._startTime = value;
                                if (this.timeline) if (this.timeline._sortChildren) {
                                    this.timeline.add(this, value - this._delay);
                                }
                            }
                            return this;
                        };
                        p.endTime = function(includeRepeats) {
                            return this._startTime + (includeRepeats != false ? this.totalDuration() : this.duration()) / this._timeScale;
                        };
                        p.timeScale = function(value) {
                            if (!arguments.length) {
                                return this._timeScale;
                            }
                            value = value || _tinyNum;
                            if (this._timeline && this._timeline.smoothChildTiming) {
                                var pauseTime = this._pauseTime, t = pauseTime || pauseTime === 0 ? pauseTime : this._timeline.totalTime();
                                this._startTime = t - (t - this._startTime) * this._timeScale / value;
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
                                this.totalTime(this._timeline && !this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime : this._totalTime, true);
                            }
                            return this;
                        };
                        p.paused = function(value) {
                            if (!arguments.length) {
                                return this._paused;
                            }
                            var tl = this._timeline, raw, elapsed;
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
                                    this.render(raw, raw === this._totalTime, true);
                                }
                            }
                            if (this._gc && !value) {
                                this._enabled(true, false);
                            }
                            return this;
                        };
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
                            if (child._paused) if (this !== child._timeline) {
                                child._pauseTime = child._startTime + (this.rawTime() - child._startTime) / child._timeScale;
                            }
                            if (child.timeline) {
                                child.timeline._remove(child, true);
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
                            var tween = this._first, next;
                            this._totalTime = this._time = this._rawPrevTime = time;
                            while (tween) {
                                next = tween._next;
                                if (tween._active || time >= tween._startTime && !tween._paused) {
                                    if (!tween._reversed) {
                                        tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
                                    } else {
                                        tween.render((!tween._dirty ? tween._totalDuration : tween.totalDuration()) - (time - tween._startTime) * tween._timeScale, suppressEvents, force);
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
                        var TweenLite = _class("TweenLite", function(target, duration, vars) {
                            Animation.call(this, duration, vars);
                            this.render = TweenLite.prototype.render;
                            if (target == null) {
                                throw "Cannot tween a null target.";
                            }
                            this.target = target = typeof target !== "string" ? target : TweenLite.selector(target) || target;
                            var isSelector = target.jquery || target.length && target !== window && target[0] && (target[0] === window || target[0].nodeType && target[0].style && !target.nodeType), overwrite = this.vars.overwrite, i, targ, targets;
                            this._overwrite = overwrite = overwrite == null ? _overwriteLookup[TweenLite.defaultOverwrite] : typeof overwrite === "number" ? overwrite >> 0 : _overwriteLookup[overwrite];
                            if ((isSelector || target instanceof Array || target.push && _isArray(target)) && typeof target[0] !== "number") {
                                this._targets = targets = _slice(target);
                                this._propLookup = [];
                                this._siblings = [];
                                for (i = 0; i < targets.length; i++) {
                                    targ = targets[i];
                                    if (!targ) {
                                        targets.splice(i--, 1);
                                        continue;
                                    } else if (typeof targ === "string") {
                                        targ = targets[i--] = TweenLite.selector(targ);
                                        if (typeof targ === "string") {
                                            targets.splice(i + 1, 1);
                                        }
                                        continue;
                                    } else if (targ.length && targ !== window && targ[0] && (targ[0] === window || targ[0].nodeType && targ[0].style && !targ.nodeType)) {
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
                            if (this.vars.immediateRender || duration === 0 && this._delay === 0 && this.vars.immediateRender !== false) {
                                this._time = -_tinyNum;
                                this.render(Math.min(0, -this._delay));
                            }
                        }, true), _isSelector = function(v) {
                            return v && v.length && v !== window && v[0] && (v[0] === window || v[0].nodeType && v[0].style && !v.nodeType);
                        }, _autoCSS = function(vars, target) {
                            var css = {}, p;
                            for (p in vars) {
                                if (!_reservedProps[p] && (!(p in target) || p === "transform" || p === "x" || p === "y" || p === "width" || p === "height" || p === "className" || p === "border") && (!_plugins[p] || _plugins[p] && _plugins[p]._autoCSS)) {
                                    css[p] = vars[p];
                                    delete vars[p];
                                }
                            }
                            vars.css = css;
                        };
                        p = TweenLite.prototype = new Animation();
                        p.constructor = TweenLite;
                        p.kill()._gc = false;
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
                            return typeof document === "undefined" ? e : document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById(e.charAt(0) === "#" ? e.substr(1) : e);
                        };
                        var _lazyTweens = [], _lazyLookup = {}, _numbersExp = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, _setRatio = function(v) {
                            var pt = this._firstPT, min = 1e-6, val;
                            while (pt) {
                                val = !pt.blob ? pt.c * v + pt.s : v ? this.join("") : this.start;
                                if (pt.r) {
                                    val = Math.round(val);
                                } else if (val < min) if (val > -min) {
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
                        }, _blobDif = function(start, end, filter, pt) {
                            var a = [ start, end ], charIndex = 0, s = "", color = 0, startNums, endNums, num, i, l, nonNumbers, currentNum;
                            a.start = start;
                            if (filter) {
                                filter(a);
                                start = a[0];
                                end = a[1];
                            }
                            a.length = 0;
                            startNums = start.match(_numbersExp) || [];
                            endNums = end.match(_numbersExp) || [];
                            if (pt) {
                                pt._next = null;
                                pt.blob = 1;
                                a._firstPT = pt;
                            }
                            l = endNums.length;
                            for (i = 0; i < l; i++) {
                                currentNum = endNums[i];
                                nonNumbers = end.substr(charIndex, end.indexOf(currentNum, charIndex) - charIndex);
                                s += nonNumbers || !i ? nonNumbers : ",";
                                charIndex += nonNumbers.length;
                                if (color) {
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
                                    a._firstPT = {
                                        _next: a._firstPT,
                                        t: a,
                                        p: a.length - 1,
                                        s: num,
                                        c: (currentNum.charAt(1) === "=" ? parseInt(currentNum.charAt(0) + "1", 10) * parseFloat(currentNum.substr(2)) : parseFloat(currentNum) - num) || 0,
                                        f: 0,
                                        r: color && color < 4
                                    };
                                }
                                charIndex += currentNum.length;
                            }
                            s += end.substr(charIndex);
                            if (s) {
                                a.push(s);
                            }
                            a.setRatio = _setRatio;
                            return a;
                        }, _addPropTween = function(target, prop, start, end, overwriteProp, round, funcParam, stringFilter) {
                            var s = start === "get" ? target[prop] : start, type = typeof target[prop], isRelative = typeof end === "string" && end.charAt(1) === "=", pt = {
                                t: target,
                                p: prop,
                                s: s,
                                f: type === "function",
                                pg: 0,
                                n: overwriteProp || prop,
                                r: round,
                                pr: 0,
                                c: isRelative ? parseInt(end.charAt(0) + "1", 10) * parseFloat(end.substr(2)) : parseFloat(end) - s || 0
                            }, blob, getterName;
                            if (type !== "number") {
                                if (type === "function" && start === "get") {
                                    getterName = prop.indexOf("set") || typeof target["get" + prop.substr(3)] !== "function" ? prop : "get" + prop.substr(3);
                                    pt.s = s = funcParam ? target[getterName](funcParam) : target[getterName]();
                                }
                                if (typeof s === "string" && (funcParam || isNaN(s))) {
                                    pt.fp = funcParam;
                                    blob = _blobDif(s, end, stringFilter || TweenLite.defaultStringFilter, pt);
                                    pt = {
                                        t: blob,
                                        p: "setRatio",
                                        s: 0,
                                        c: 1,
                                        f: 2,
                                        pg: 0,
                                        n: overwriteProp || prop,
                                        pr: 0
                                    };
                                } else if (!isRelative) {
                                    pt.s = parseFloat(s);
                                    pt.c = parseFloat(end) - pt.s || 0;
                                }
                            }
                            if (pt.c) {
                                if (pt._next = this._firstPT) {
                                    pt._next._prev = pt;
                                }
                                this._firstPT = pt;
                                return pt;
                            }
                        }, _internals = TweenLite._internals = {
                            isArray: _isArray,
                            isSelector: _isSelector,
                            lazyTweens: _lazyTweens,
                            blobDif: _blobDif
                        }, _plugins = TweenLite._plugins = {}, _tweenLookup = _internals.tweenLookup = {}, _tweenLookupNum = 0, _reservedProps = _internals.reservedProps = {
                            ease: 1,
                            delay: 1,
                            overwrite: 1,
                            onComplete: 1,
                            onCompleteParams: 1,
                            onCompleteScope: 1,
                            useFrames: 1,
                            runBackwards: 1,
                            startAt: 1,
                            onUpdate: 1,
                            onUpdateParams: 1,
                            onUpdateScope: 1,
                            onStart: 1,
                            onStartParams: 1,
                            onStartScope: 1,
                            onReverseComplete: 1,
                            onReverseCompleteParams: 1,
                            onReverseCompleteScope: 1,
                            onRepeat: 1,
                            onRepeatParams: 1,
                            onRepeatScope: 1,
                            easeParams: 1,
                            yoyo: 1,
                            immediateRender: 1,
                            repeat: 1,
                            repeatDelay: 1,
                            data: 1,
                            paused: 1,
                            reversed: 1,
                            autoCSS: 1,
                            lazy: 1,
                            onOverwrite: 1,
                            callbackScope: 1,
                            stringFilter: 1,
                            id: 1
                        }, _overwriteLookup = {
                            none: 0,
                            all: 1,
                            auto: 2,
                            concurrent: 3,
                            allOnStart: 4,
                            preexisting: 5,
                            "true": 1,
                            "false": 0
                        }, _rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline(), _rootTimeline = Animation._rootTimeline = new SimpleTimeline(), _nextGCFrame = 30, _lazyRender = _internals.lazyRender = function() {
                            var i = _lazyTweens.length, tween;
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
                        setTimeout(_lazyRender, 1);
                        Animation._updateRoot = TweenLite.render = function() {
                            var i, a, p;
                            if (_lazyTweens.length) {
                                _lazyRender();
                            }
                            _rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, false, false);
                            _rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, false, false);
                            if (_lazyTweens.length) {
                                _lazyRender();
                            }
                            if (_ticker.frame >= _nextGCFrame) {
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
                            if (!_tweenLookup[id || (target._gsTweenID = id = "t" + _tweenLookupNum++)]) {
                                _tweenLookup[id] = {
                                    target: target,
                                    tweens: []
                                };
                            }
                            if (tween) {
                                a = _tweenLookup[id].tweens;
                                a[i = a.length] = tween;
                                if (scrub) {
                                    while (--i > -1) {
                                        if (a[i] === tween) {
                                            a.splice(i, 1);
                                        }
                                    }
                                }
                            }
                            return _tweenLookup[id].tweens;
                        }, _onOverwrite = function(overwrittenTween, overwritingTween, target, killedProps) {
                            var func = overwrittenTween.vars.onOverwrite, r1, r2;
                            if (func) {
                                r1 = func(overwrittenTween, overwritingTween, target, killedProps);
                            }
                            func = TweenLite.onOverwrite;
                            if (func) {
                                r2 = func(overwrittenTween, overwritingTween, target, killedProps);
                            }
                            return r1 !== false && r2 !== false;
                        }, _applyOverwrite = function(target, tween, props, mode, siblings) {
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
                            var startTime = tween._startTime + _tinyNum, overlaps = [], oCount = 0, zeroDur = tween._duration === 0, globalStart;
                            i = siblings.length;
                            while (--i > -1) {
                                if ((curTween = siblings[i]) === tween || curTween._gc || curTween._paused) {} else if (curTween._timeline !== tween._timeline) {
                                    globalStart = globalStart || _checkOverlap(tween, 0, zeroDur);
                                    if (_checkOverlap(curTween, globalStart, zeroDur) === 0) {
                                        overlaps[oCount++] = curTween;
                                    }
                                } else if (curTween._startTime <= startTime) if (curTween._startTime + curTween.totalDuration() / curTween._timeScale > startTime) if (!((zeroDur || !curTween._initted) && startTime - curTween._startTime <= 2e-10)) {
                                    overlaps[oCount++] = curTween;
                                }
                            }
                            i = oCount;
                            while (--i > -1) {
                                curTween = overlaps[i];
                                if (mode === 2) if (curTween._kill(props, target, tween)) {
                                    changed = true;
                                }
                                if (mode !== 2 || !curTween._firstPT && curTween._initted) {
                                    if (mode !== 2 && !_onOverwrite(curTween, tween)) {
                                        continue;
                                    }
                                    if (curTween._enabled(false, false)) {
                                        changed = true;
                                    }
                                }
                            }
                            return changed;
                        }, _checkOverlap = function(tween, reference, zeroDur) {
                            var tl = tween._timeline, ts = tl._timeScale, t = tween._startTime;
                            while (tl._timeline) {
                                t += tl._startTime;
                                ts *= tl._timeScale;
                                if (tl._paused) {
                                    return -100;
                                }
                                tl = tl._timeline;
                            }
                            t /= ts;
                            return t > reference ? t - reference : zeroDur && t === reference || !tween._initted && t - reference < 2 * _tinyNum ? _tinyNum : (t += tween.totalDuration() / tween._timeScale / ts) > reference + _tinyNum ? 0 : t - reference - _tinyNum;
                        };
                        p._init = function() {
                            var v = this.vars, op = this._overwrittenProps, dur = this._duration, immediate = !!v.immediateRender, ease = v.ease, i, initPlugins, pt, p, startVars;
                            if (v.startAt) {
                                if (this._startAt) {
                                    this._startAt.render(-1, true);
                                    this._startAt.kill();
                                }
                                startVars = {};
                                for (p in v.startAt) {
                                    startVars[p] = v.startAt[p];
                                }
                                startVars.overwrite = false;
                                startVars.immediateRender = true;
                                startVars.lazy = immediate && v.lazy !== false;
                                startVars.startAt = startVars.delay = null;
                                this._startAt = TweenLite.to(this.target, 0, startVars);
                                if (immediate) {
                                    if (this._time > 0) {
                                        this._startAt = null;
                                    } else if (dur !== 0) {
                                        return;
                                    }
                                }
                            } else if (v.runBackwards && dur !== 0) {
                                if (this._startAt) {
                                    this._startAt.render(-1, true);
                                    this._startAt.kill();
                                    this._startAt = null;
                                } else {
                                    if (this._time !== 0) {
                                        immediate = false;
                                    }
                                    pt = {};
                                    for (p in v) {
                                        if (!_reservedProps[p] || p === "autoCSS") {
                                            pt[p] = v[p];
                                        }
                                    }
                                    pt.overwrite = 0;
                                    pt.data = "isFromStart";
                                    pt.lazy = immediate && v.lazy !== false;
                                    pt.immediateRender = immediate;
                                    this._startAt = TweenLite.to(this.target, 0, pt);
                                    if (!immediate) {
                                        this._startAt._init();
                                        this._startAt._enabled(false);
                                        if (this.vars.immediateRender) {
                                            this._startAt = null;
                                        }
                                    } else if (this._time === 0) {
                                        return;
                                    }
                                }
                            }
                            this._ease = ease = !ease ? TweenLite.defaultEase : ease instanceof Ease ? ease : typeof ease === "function" ? new Ease(ease, v.easeParams) : _easeMap[ease] || TweenLite.defaultEase;
                            if (v.easeParams instanceof Array && ease.config) {
                                this._ease = ease.config.apply(ease, v.easeParams);
                            }
                            this._easeType = this._ease._type;
                            this._easePower = this._ease._power;
                            this._firstPT = null;
                            if (this._targets) {
                                i = this._targets.length;
                                while (--i > -1) {
                                    if (this._initProps(this._targets[i], this._propLookup[i] = {}, this._siblings[i], op ? op[i] : null)) {
                                        initPlugins = true;
                                    }
                                }
                            } else {
                                initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
                            }
                            if (initPlugins) {
                                TweenLite._onPluginEvent("_onInitAllProps", this);
                            }
                            if (op) if (!this._firstPT) if (typeof this.target !== "function") {
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
                                _lazyRender();
                            }
                            if (!this.vars.css) if (target.style) if (target !== window && target.nodeType) if (_plugins.css) if (this.vars.autoCSS !== false) {
                                _autoCSS(this.vars, target);
                            }
                            for (p in this.vars) {
                                v = this.vars[p];
                                if (_reservedProps[p]) {
                                    if (v) if (v instanceof Array || v.push && _isArray(v)) if (v.join("").indexOf("{self}") !== -1) {
                                        this.vars[p] = v = this._swapSelfInParams(v, this);
                                    }
                                } else if (_plugins[p] && (plugin = new _plugins[p]())._onInitTween(target, this.vars[p], this)) {
                                    this._firstPT = pt = {
                                        _next: this._firstPT,
                                        t: plugin,
                                        p: "setRatio",
                                        s: 0,
                                        c: 1,
                                        f: 1,
                                        n: p,
                                        pg: 1,
                                        pr: plugin._priority
                                    };
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
                            if (overwrittenProps) if (this._kill(overwrittenProps, target)) {
                                return this._initProps(target, propLookup, siblings, overwrittenProps);
                            }
                            if (this._overwrite > 1) if (this._firstPT) if (siblings.length > 1) if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
                                this._kill(propLookup, target);
                                return this._initProps(target, propLookup, siblings, overwrittenProps);
                            }
                            if (this._firstPT) if (this.vars.lazy !== false && this._duration || this.vars.lazy && !this._duration) {
                                _lazyLookup[target._gsTweenID] = true;
                            }
                            return initPlugins;
                        };
                        p.render = function(time, suppressEvents, force) {
                            var prevTime = this._time, duration = this._duration, prevRawPrevTime = this._rawPrevTime, isComplete, callback, pt, rawPrevTime;
                            if (time >= duration - 1e-7) {
                                this._totalTime = this._time = duration;
                                this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
                                if (!this._reversed) {
                                    isComplete = true;
                                    callback = "onComplete";
                                    force = force || this._timeline.autoRemoveChildren;
                                }
                                if (duration === 0) if (this._initted || !this.vars.lazy || force) {
                                    if (this._startTime === this._timeline._duration) {
                                        time = 0;
                                    }
                                    if (prevRawPrevTime < 0 || time <= 0 && time >= -1e-7 || prevRawPrevTime === _tinyNum && this.data !== "isPause") if (prevRawPrevTime !== time) {
                                        force = true;
                                        if (prevRawPrevTime > _tinyNum) {
                                            callback = "onReverseComplete";
                                        }
                                    }
                                    this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum;
                                }
                            } else if (time < 1e-7) {
                                this._totalTime = this._time = 0;
                                this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
                                if (prevTime !== 0 || duration === 0 && prevRawPrevTime > 0) {
                                    callback = "onReverseComplete";
                                    isComplete = this._reversed;
                                }
                                if (time < 0) {
                                    this._active = false;
                                    if (duration === 0) if (this._initted || !this.vars.lazy || force) {
                                        if (prevRawPrevTime >= 0 && !(prevRawPrevTime === _tinyNum && this.data === "isPause")) {
                                            force = true;
                                        }
                                        this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum;
                                    }
                                }
                                if (!this._initted) {
                                    force = true;
                                }
                            } else {
                                this._totalTime = this._time = time;
                                if (this._easeType) {
                                    var r = time / duration, type = this._easeType, pow = this._easePower;
                                    if (type === 1 || type === 3 && r >= .5) {
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
                                    } else if (time / duration < .5) {
                                        this.ratio = r / 2;
                                    } else {
                                        this.ratio = 1 - r / 2;
                                    }
                                } else {
                                    this.ratio = this._ease.getRatio(time / duration);
                                }
                            }
                            if (this._time === prevTime && !force) {
                                return;
                            } else if (!this._initted) {
                                this._init();
                                if (!this._initted || this._gc) {
                                    return;
                                } else if (!force && this._firstPT && (this.vars.lazy !== false && this._duration || this.vars.lazy && !this._duration)) {
                                    this._time = this._totalTime = prevTime;
                                    this._rawPrevTime = prevRawPrevTime;
                                    _lazyTweens.push(this);
                                    this._lazy = [ time, suppressEvents ];
                                    return;
                                }
                                if (this._time && !isComplete) {
                                    this.ratio = this._ease.getRatio(this._time / duration);
                                } else if (isComplete && this._ease._calcEnd) {
                                    this.ratio = this._ease.getRatio(this._time === 0 ? 0 : 1);
                                }
                            }
                            if (this._lazy !== false) {
                                this._lazy = false;
                            }
                            if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
                                this._active = true;
                            }
                            if (prevTime === 0) {
                                if (this._startAt) {
                                    if (time >= 0) {
                                        this._startAt.render(time, suppressEvents, force);
                                    } else if (!callback) {
                                        callback = "_dummyGS";
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
                                if (time < 0) if (this._startAt && time !== -1e-4) {
                                    this._startAt.render(time, suppressEvents, force);
                                }
                                if (!suppressEvents) if (this._time !== prevTime || isComplete || force) {
                                    this._callback("onUpdate");
                                }
                            }
                            if (callback) if (!this._gc || force) {
                                if (time < 0 && this._startAt && !this._onUpdate && time !== -1e-4) {
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
                                if (duration === 0 && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum) {
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
                            target = typeof target !== "string" ? target || this._targets || this.target : TweenLite.selector(target) || target;
                            var simultaneousOverwrite = overwritingTween && this._time && overwritingTween._startTime === this._startTime && this._timeline === overwritingTween._timeline, i, overwrittenProps, p, pt, propLookup, changed, killProps, record, killed;
                            if ((_isArray(target) || _isSelector(target)) && typeof target[0] !== "number") {
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
                                    record = vars !== overwrittenProps && overwrittenProps !== "all" && vars !== propLookup && (typeof vars !== "object" || !vars._tempKill);
                                    if (overwritingTween && (TweenLite.onOverwrite || this.vars.onOverwrite)) {
                                        for (p in killProps) {
                                            if (propLookup[p]) {
                                                if (!killed) {
                                                    killed = [];
                                                }
                                                killed.push(p);
                                            }
                                        }
                                        if ((killed || !vars) && !_onOverwrite(this, overwritingTween, target, killed)) {
                                            return false;
                                        }
                                    }
                                    for (p in killProps) {
                                        if (pt = propLookup[p]) {
                                            if (simultaneousOverwrite) {
                                                if (pt.f) {
                                                    pt.t[pt.p](pt.s);
                                                } else {
                                                    pt.t[pt.p] = pt.s;
                                                }
                                                changed = true;
                                            }
                                            if (pt.pg && pt.t._kill(killProps)) {
                                                changed = true;
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
                                    if (!this._firstPT && this._initted) {
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
                            this._propLookup = this._targets ? {} : [];
                            Animation.prototype.invalidate.call(this);
                            if (this.vars.immediateRender) {
                                this._time = -_tinyNum;
                                this.render(Math.min(0, -this._delay));
                            }
                            return this;
                        };
                        p._enabled = function(enabled, ignoreTimeline) {
                            if (!_tickerActive) {
                                _ticker.wake();
                            }
                            if (enabled && this._gc) {
                                var targets = this._targets, i;
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
                                return TweenLite._onPluginEvent(enabled ? "_onEnable" : "_onDisable", this);
                            }
                            return false;
                        };
                        TweenLite.to = function(target, duration, vars) {
                            return new TweenLite(target, duration, vars);
                        };
                        TweenLite.from = function(target, duration, vars) {
                            vars.runBackwards = true;
                            vars.immediateRender = vars.immediateRender != false;
                            return new TweenLite(target, duration, vars);
                        };
                        TweenLite.fromTo = function(target, duration, fromVars, toVars) {
                            toVars.startAt = fromVars;
                            toVars.immediateRender = toVars.immediateRender != false && fromVars.immediateRender != false;
                            return new TweenLite(target, duration, toVars);
                        };
                        TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {
                            return new TweenLite(callback, 0, {
                                delay: delay,
                                onComplete: callback,
                                onCompleteParams: params,
                                callbackScope: scope,
                                onReverseComplete: callback,
                                onReverseCompleteParams: params,
                                immediateRender: false,
                                lazy: false,
                                useFrames: useFrames,
                                overwrite: 0
                            });
                        };
                        TweenLite.set = function(target, vars) {
                            return new TweenLite(target, 0, vars);
                        };
                        TweenLite.getTweensOf = function(target, onlyActive) {
                            if (target == null) {
                                return [];
                            }
                            target = typeof target !== "string" ? target : TweenLite.selector(target) || target;
                            var i, a, j, t;
                            if ((_isArray(target) || _isSelector(target)) && typeof target[0] !== "number") {
                                i = target.length;
                                a = [];
                                while (--i > -1) {
                                    a = a.concat(TweenLite.getTweensOf(target[i], onlyActive));
                                }
                                i = a.length;
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
                                    if (a[i]._gc || onlyActive && !a[i].isActive()) {
                                        a.splice(i, 1);
                                    }
                                }
                            }
                            return a;
                        };
                        TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function(target, onlyActive, vars) {
                            if (typeof onlyActive === "object") {
                                vars = onlyActive;
                                onlyActive = false;
                            }
                            var a = TweenLite.getTweensOf(target, onlyActive), i = a.length;
                            while (--i > -1) {
                                a[i]._kill(vars, target);
                            }
                        };
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
                            var a = this._overwriteProps, pt = this._firstPT, i;
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
                                if (lookup[this._propName] || pt.n != null && lookup[pt.n.split(this._propName + "_").join("")]) {
                                    pt.r = value;
                                }
                                pt = pt._next;
                            }
                        };
                        TweenLite._onPluginEvent = function(type, tween) {
                            var pt = tween._firstPT, changed, pt2, first, last, next;
                            if (type === "_onInitAllProps") {
                                while (pt) {
                                    next = pt._next;
                                    pt2 = first;
                                    while (pt2 && pt2.pr > pt.pr) {
                                        pt2 = pt2._next;
                                    }
                                    if (pt._prev = pt2 ? pt2._prev : last) {
                                        pt._prev._next = pt;
                                    } else {
                                        first = pt;
                                    }
                                    if (pt._next = pt2) {
                                        pt2._prev = pt;
                                    } else {
                                        last = pt;
                                    }
                                    pt = next;
                                }
                                pt = tween._firstPT = first;
                            }
                            while (pt) {
                                if (pt.pg) if (typeof pt.t[type] === "function") if (pt.t[type]()) {
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
                                    _plugins[new plugins[i]()._propName] = plugins[i];
                                }
                            }
                            return true;
                        };
                        _gsDefine.plugin = function(config) {
                            if (!config || !config.propName || !config.init || !config.API) {
                                throw "illegal plugin definition.";
                            }
                            var propName = config.propName, priority = config.priority || 0, overwriteProps = config.overwriteProps, map = {
                                init: "_onInitTween",
                                set: "setRatio",
                                kill: "_kill",
                                round: "_roundProps",
                                initAll: "_onInitAllProps"
                            }, Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin", function() {
                                TweenPlugin.call(this, propName, priority);
                                this._overwriteProps = overwriteProps || [];
                            }, config.global === true), p = Plugin.prototype = new TweenPlugin(propName), prop;
                            p.constructor = Plugin;
                            Plugin.API = config.API;
                            for (prop in map) {
                                if (typeof config[prop] === "function") {
                                    p[map[prop]] = config[prop];
                                }
                            }
                            Plugin.version = config.version;
                            TweenPlugin.activate([ Plugin ]);
                            return Plugin;
                        };
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
                        _tickerActive = false;
                    })(typeof module !== "undefined" && module.exports && typeof global !== "undefined" ? global : this || window, "TweenMax");
                }).call(exports, function() {
                    return this;
                }());
            }, function(module, exports) {
                (function(__webpack_amd_options__) {
                    module.exports = __webpack_amd_options__;
                }).call(exports, {});
            }, function(module, exports) {
                THREE.SpriteCanvasMaterial = function(parameters) {
                    THREE.Material.call(this);
                    this.type = "SpriteCanvasMaterial";
                    this.color = new THREE.Color(16777215);
                    this.program = function(context, color) {};
                    this.setValues(parameters);
                };
                THREE.SpriteCanvasMaterial.prototype = Object.create(THREE.Material.prototype);
                THREE.SpriteCanvasMaterial.prototype.constructor = THREE.SpriteCanvasMaterial;
                THREE.SpriteCanvasMaterial.prototype.clone = function() {
                    var material = new THREE.SpriteCanvasMaterial();
                    material.copy(this);
                    material.color.copy(this.color);
                    material.program = this.program;
                    return material;
                };
                THREE.CanvasRenderer = function(parameters) {
                    console.log("THREE.CanvasRenderer", THREE.REVISION);
                    parameters = parameters || {};
                    var _this = this, _renderData, _elements, _lights, _projector = new THREE.Projector(), _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement("canvas"), _canvasWidth = _canvas.width, _canvasHeight = _canvas.height, _canvasWidthHalf = Math.floor(_canvasWidth / 2), _canvasHeightHalf = Math.floor(_canvasHeight / 2), _viewportX = 0, _viewportY = 0, _viewportWidth = _canvasWidth, _viewportHeight = _canvasHeight, _pixelRatio = 1, _context = _canvas.getContext("2d", {
                        alpha: parameters.alpha === true
                    }), _clearColor = new THREE.Color(0), _clearAlpha = parameters.alpha === true ? 0 : 1, _contextGlobalAlpha = 1, _contextGlobalCompositeOperation = 0, _contextStrokeStyle = null, _contextFillStyle = null, _contextLineWidth = null, _contextLineCap = null, _contextLineJoin = null, _contextLineDash = [], _camera, _v1, _v2, _v3, _v4, _v5 = new THREE.RenderableVertex(), _v6 = new THREE.RenderableVertex(), _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _v4x, _v4y, _v5x, _v5y, _v6x, _v6y, _color = new THREE.Color(), _color1 = new THREE.Color(), _color2 = new THREE.Color(), _color3 = new THREE.Color(), _color4 = new THREE.Color(), _diffuseColor = new THREE.Color(), _emissiveColor = new THREE.Color(), _lightColor = new THREE.Color(), _patterns = {}, _image, _uvs, _uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y, _clipBox = new THREE.Box2(), _clearBox = new THREE.Box2(), _elemBox = new THREE.Box2(), _ambientLight = new THREE.Color(), _directionalLights = new THREE.Color(), _pointLights = new THREE.Color(), _vector3 = new THREE.Vector3(), _centroid = new THREE.Vector3(), _normal = new THREE.Vector3(), _normalViewMatrix = new THREE.Matrix3();
                    if (_context.setLineDash === undefined) {
                        _context.setLineDash = function() {};
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
                    this.supportsVertexTextures = function() {};
                    this.setFaceCulling = function() {};
                    this.getContext = function() {
                        return _context;
                    };
                    this.getContextAttributes = function() {
                        return _context.getContextAttributes();
                    };
                    this.getPixelRatio = function() {
                        return _pixelRatio;
                    };
                    this.setPixelRatio = function(value) {
                        if (value !== undefined) _pixelRatio = value;
                    };
                    this.setSize = function(width, height, updateStyle) {
                        _canvasWidth = width * _pixelRatio;
                        _canvasHeight = height * _pixelRatio;
                        _canvas.width = _canvasWidth;
                        _canvas.height = _canvasHeight;
                        _canvasWidthHalf = Math.floor(_canvasWidth / 2);
                        _canvasHeightHalf = Math.floor(_canvasHeight / 2);
                        if (updateStyle !== false) {
                            _canvas.style.width = width + "px";
                            _canvas.style.height = height + "px";
                        }
                        _clipBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
                        _clipBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
                        _clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
                        _clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
                        _contextGlobalAlpha = 1;
                        _contextGlobalCompositeOperation = 0;
                        _contextStrokeStyle = null;
                        _contextFillStyle = null;
                        _contextLineWidth = null;
                        _contextLineCap = null;
                        _contextLineJoin = null;
                        this.setViewport(0, 0, width, height);
                    };
                    this.setViewport = function(x, y, width, height) {
                        _viewportX = x * _pixelRatio;
                        _viewportY = y * _pixelRatio;
                        _viewportWidth = width * _pixelRatio;
                        _viewportHeight = height * _pixelRatio;
                    };
                    this.setScissor = function() {};
                    this.setScissorTest = function() {};
                    this.setClearColor = function(color, alpha) {
                        _clearColor.set(color);
                        _clearAlpha = alpha !== undefined ? alpha : 1;
                        _clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
                        _clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
                    };
                    this.setClearColorHex = function(hex, alpha) {
                        console.warn("THREE.CanvasRenderer: .setClearColorHex() is being removed. Use .setClearColor() instead.");
                        this.setClearColor(hex, alpha);
                    };
                    this.getClearColor = function() {
                        return _clearColor;
                    };
                    this.getClearAlpha = function() {
                        return _clearAlpha;
                    };
                    this.getMaxAnisotropy = function() {
                        return 0;
                    };
                    this.clear = function() {
                        if (_clearBox.isEmpty() === false) {
                            _clearBox.intersect(_clipBox);
                            _clearBox.expandByScalar(2);
                            _clearBox.min.x = _clearBox.min.x + _canvasWidthHalf;
                            _clearBox.min.y = -_clearBox.min.y + _canvasHeightHalf;
                            _clearBox.max.x = _clearBox.max.x + _canvasWidthHalf;
                            _clearBox.max.y = -_clearBox.max.y + _canvasHeightHalf;
                            if (_clearAlpha < 1) {
                                _context.clearRect(_clearBox.min.x | 0, _clearBox.max.y | 0, _clearBox.max.x - _clearBox.min.x | 0, _clearBox.min.y - _clearBox.max.y | 0);
                            }
                            if (_clearAlpha > 0) {
                                setBlending(THREE.NormalBlending);
                                setOpacity(1);
                                setFillStyle("rgba(" + Math.floor(_clearColor.r * 255) + "," + Math.floor(_clearColor.g * 255) + "," + Math.floor(_clearColor.b * 255) + "," + _clearAlpha + ")");
                                _context.fillRect(_clearBox.min.x | 0, _clearBox.max.y | 0, _clearBox.max.x - _clearBox.min.x | 0, _clearBox.min.y - _clearBox.max.y | 0);
                            }
                            _clearBox.makeEmpty();
                        }
                    };
                    this.clearColor = function() {};
                    this.clearDepth = function() {};
                    this.clearStencil = function() {};
                    this.render = function(scene, camera) {
                        if (camera instanceof THREE.Camera === false) {
                            console.error("THREE.CanvasRenderer.render: camera is not an instance of THREE.Camera.");
                            return;
                        }
                        if (this.autoClear === true) this.clear();
                        _this.info.render.vertices = 0;
                        _this.info.render.faces = 0;
                        _context.setTransform(_viewportWidth / _canvasWidth, 0, 0, -_viewportHeight / _canvasHeight, _viewportX, _canvasHeight - _viewportY);
                        _context.translate(_canvasWidthHalf, _canvasHeightHalf);
                        _renderData = _projector.projectScene(scene, camera, this.sortObjects, this.sortElements);
                        _elements = _renderData.elements;
                        _lights = _renderData.lights;
                        _camera = camera;
                        _normalViewMatrix.getNormalMatrix(camera.matrixWorldInverse);
                        calculateLights();
                        for (var e = 0, el = _elements.length; e < el; e++) {
                            var element = _elements[e];
                            var material = element.material;
                            if (material === undefined || material.opacity === 0) continue;
                            _elemBox.makeEmpty();
                            if (element instanceof THREE.RenderableSprite) {
                                _v1 = element;
                                _v1.x *= _canvasWidthHalf;
                                _v1.y *= _canvasHeightHalf;
                                renderSprite(_v1, element, material);
                            } else if (element instanceof THREE.RenderableLine) {
                                _v1 = element.v1;
                                _v2 = element.v2;
                                _v1.positionScreen.x *= _canvasWidthHalf;
                                _v1.positionScreen.y *= _canvasHeightHalf;
                                _v2.positionScreen.x *= _canvasWidthHalf;
                                _v2.positionScreen.y *= _canvasHeightHalf;
                                _elemBox.setFromPoints([ _v1.positionScreen, _v2.positionScreen ]);
                                if (_clipBox.intersectsBox(_elemBox) === true) {
                                    renderLine(_v1, _v2, element, material);
                                }
                            } else if (element instanceof THREE.RenderableFace) {
                                _v1 = element.v1;
                                _v2 = element.v2;
                                _v3 = element.v3;
                                if (_v1.positionScreen.z < -1 || _v1.positionScreen.z > 1) continue;
                                if (_v2.positionScreen.z < -1 || _v2.positionScreen.z > 1) continue;
                                if (_v3.positionScreen.z < -1 || _v3.positionScreen.z > 1) continue;
                                _v1.positionScreen.x *= _canvasWidthHalf;
                                _v1.positionScreen.y *= _canvasHeightHalf;
                                _v2.positionScreen.x *= _canvasWidthHalf;
                                _v2.positionScreen.y *= _canvasHeightHalf;
                                _v3.positionScreen.x *= _canvasWidthHalf;
                                _v3.positionScreen.y *= _canvasHeightHalf;
                                if (material.overdraw > 0) {
                                    expand(_v1.positionScreen, _v2.positionScreen, material.overdraw);
                                    expand(_v2.positionScreen, _v3.positionScreen, material.overdraw);
                                    expand(_v3.positionScreen, _v1.positionScreen, material.overdraw);
                                }
                                _elemBox.setFromPoints([ _v1.positionScreen, _v2.positionScreen, _v3.positionScreen ]);
                                if (_clipBox.intersectsBox(_elemBox) === true) {
                                    renderFace3(_v1, _v2, _v3, 0, 1, 2, element, material);
                                }
                            }
                            _clearBox.union(_elemBox);
                        }
                        _context.setTransform(1, 0, 0, 1, 0, 0);
                    };
                    function calculateLights() {
                        _ambientLight.setRGB(0, 0, 0);
                        _directionalLights.setRGB(0, 0, 0);
                        _pointLights.setRGB(0, 0, 0);
                        for (var l = 0, ll = _lights.length; l < ll; l++) {
                            var light = _lights[l];
                            var lightColor = light.color;
                            if (light instanceof THREE.AmbientLight) {
                                _ambientLight.add(lightColor);
                            } else if (light instanceof THREE.DirectionalLight) {
                                _directionalLights.add(lightColor);
                            } else if (light instanceof THREE.PointLight) {
                                _pointLights.add(lightColor);
                            }
                        }
                    }
                    function calculateLight(position, normal, color) {
                        for (var l = 0, ll = _lights.length; l < ll; l++) {
                            var light = _lights[l];
                            _lightColor.copy(light.color);
                            if (light instanceof THREE.DirectionalLight) {
                                var lightPosition = _vector3.setFromMatrixPosition(light.matrixWorld).normalize();
                                var amount = normal.dot(lightPosition);
                                if (amount <= 0) continue;
                                amount *= light.intensity;
                                color.add(_lightColor.multiplyScalar(amount));
                            } else if (light instanceof THREE.PointLight) {
                                var lightPosition = _vector3.setFromMatrixPosition(light.matrixWorld);
                                var amount = normal.dot(_vector3.subVectors(lightPosition, position).normalize());
                                if (amount <= 0) continue;
                                amount *= light.distance == 0 ? 1 : 1 - Math.min(position.distanceTo(lightPosition) / light.distance, 1);
                                if (amount == 0) continue;
                                amount *= light.intensity;
                                color.add(_lightColor.multiplyScalar(amount));
                            }
                        }
                    }
                    function renderSprite(v1, element, material) {
                        setOpacity(material.opacity);
                        setBlending(material.blending);
                        var scaleX = element.scale.x * _canvasWidthHalf;
                        var scaleY = element.scale.y * _canvasHeightHalf;
                        var dist = .5 * Math.sqrt(scaleX * scaleX + scaleY * scaleY);
                        _elemBox.min.set(v1.x - dist, v1.y - dist);
                        _elemBox.max.set(v1.x + dist, v1.y + dist);
                        if (material instanceof THREE.SpriteMaterial) {
                            var texture = material.map;
                            if (texture !== null) {
                                var pattern = _patterns[texture.id];
                                if (pattern === undefined || pattern.version !== texture.version) {
                                    pattern = textureToPattern(texture);
                                    _patterns[texture.id] = pattern;
                                }
                                if (pattern.canvas !== undefined) {
                                    setFillStyle(pattern.canvas);
                                    var bitmap = texture.image;
                                    var ox = bitmap.width * texture.offset.x;
                                    var oy = bitmap.height * texture.offset.y;
                                    var sx = bitmap.width * texture.repeat.x;
                                    var sy = bitmap.height * texture.repeat.y;
                                    var cx = scaleX / sx;
                                    var cy = scaleY / sy;
                                    _context.save();
                                    _context.translate(v1.x, v1.y);
                                    if (material.rotation !== 0) _context.rotate(material.rotation);
                                    _context.translate(-scaleX / 2, -scaleY / 2);
                                    _context.scale(cx, cy);
                                    _context.translate(-ox, -oy);
                                    _context.fillRect(ox, oy, sx, sy);
                                    _context.restore();
                                }
                            } else {
                                setFillStyle(material.color.getStyle());
                                _context.save();
                                _context.translate(v1.x, v1.y);
                                if (material.rotation !== 0) _context.rotate(material.rotation);
                                _context.scale(scaleX, -scaleY);
                                _context.fillRect(-.5, -.5, 1, 1);
                                _context.restore();
                            }
                        } else if (material instanceof THREE.SpriteCanvasMaterial) {
                            setStrokeStyle(material.color.getStyle());
                            setFillStyle(material.color.getStyle());
                            _context.save();
                            _context.translate(v1.x, v1.y);
                            if (material.rotation !== 0) _context.rotate(material.rotation);
                            _context.scale(scaleX, scaleY);
                            material.program(_context);
                            _context.restore();
                        }
                    }
                    function renderLine(v1, v2, element, material) {
                        setOpacity(material.opacity);
                        setBlending(material.blending);
                        _context.beginPath();
                        _context.moveTo(v1.positionScreen.x, v1.positionScreen.y);
                        _context.lineTo(v2.positionScreen.x, v2.positionScreen.y);
                        if (material instanceof THREE.LineBasicMaterial) {
                            setLineWidth(material.linewidth);
                            setLineCap(material.linecap);
                            setLineJoin(material.linejoin);
                            if (material.vertexColors !== THREE.VertexColors) {
                                setStrokeStyle(material.color.getStyle());
                            } else {
                                var colorStyle1 = element.vertexColors[0].getStyle();
                                var colorStyle2 = element.vertexColors[1].getStyle();
                                if (colorStyle1 === colorStyle2) {
                                    setStrokeStyle(colorStyle1);
                                } else {
                                    try {
                                        var grad = _context.createLinearGradient(v1.positionScreen.x, v1.positionScreen.y, v2.positionScreen.x, v2.positionScreen.y);
                                        grad.addColorStop(0, colorStyle1);
                                        grad.addColorStop(1, colorStyle2);
                                    } catch (exception) {
                                        grad = colorStyle1;
                                    }
                                    setStrokeStyle(grad);
                                }
                            }
                            _context.stroke();
                            _elemBox.expandByScalar(material.linewidth * 2);
                        } else if (material instanceof THREE.LineDashedMaterial) {
                            setLineWidth(material.linewidth);
                            setLineCap(material.linecap);
                            setLineJoin(material.linejoin);
                            setStrokeStyle(material.color.getStyle());
                            setLineDash([ material.dashSize, material.gapSize ]);
                            _context.stroke();
                            _elemBox.expandByScalar(material.linewidth * 2);
                            setLineDash([]);
                        }
                    }
                    function renderFace3(v1, v2, v3, uv1, uv2, uv3, element, material) {
                        _this.info.render.vertices += 3;
                        _this.info.render.faces++;
                        setOpacity(material.opacity);
                        setBlending(material.blending);
                        _v1x = v1.positionScreen.x;
                        _v1y = v1.positionScreen.y;
                        _v2x = v2.positionScreen.x;
                        _v2y = v2.positionScreen.y;
                        _v3x = v3.positionScreen.x;
                        _v3y = v3.positionScreen.y;
                        drawTriangle(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y);
                        if ((material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial) && material.map === null) {
                            _diffuseColor.copy(material.color);
                            _emissiveColor.copy(material.emissive);
                            if (material.vertexColors === THREE.FaceColors) {
                                _diffuseColor.multiply(element.color);
                            }
                            _color.copy(_ambientLight);
                            _centroid.copy(v1.positionWorld).add(v2.positionWorld).add(v3.positionWorld).divideScalar(3);
                            calculateLight(_centroid, element.normalModel, _color);
                            _color.multiply(_diffuseColor).add(_emissiveColor);
                            material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
                        } else if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial) {
                            if (material.map !== null) {
                                var mapping = material.map.mapping;
                                if (mapping === THREE.UVMapping) {
                                    _uvs = element.uvs;
                                    patternPath(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uvs[uv1].x, _uvs[uv1].y, _uvs[uv2].x, _uvs[uv2].y, _uvs[uv3].x, _uvs[uv3].y, material.map);
                                }
                            } else if (material.envMap !== null) {
                                if (material.envMap.mapping === THREE.SphericalReflectionMapping) {
                                    _normal.copy(element.vertexNormalsModel[uv1]).applyMatrix3(_normalViewMatrix);
                                    _uv1x = .5 * _normal.x + .5;
                                    _uv1y = .5 * _normal.y + .5;
                                    _normal.copy(element.vertexNormalsModel[uv2]).applyMatrix3(_normalViewMatrix);
                                    _uv2x = .5 * _normal.x + .5;
                                    _uv2y = .5 * _normal.y + .5;
                                    _normal.copy(element.vertexNormalsModel[uv3]).applyMatrix3(_normalViewMatrix);
                                    _uv3x = .5 * _normal.x + .5;
                                    _uv3y = .5 * _normal.y + .5;
                                    patternPath(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y, material.envMap);
                                }
                            } else {
                                _color.copy(material.color);
                                if (material.vertexColors === THREE.FaceColors) {
                                    _color.multiply(element.color);
                                }
                                material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
                            }
                        } else if (material instanceof THREE.MeshNormalMaterial) {
                            _normal.copy(element.normalModel).applyMatrix3(_normalViewMatrix);
                            _color.setRGB(_normal.x, _normal.y, _normal.z).multiplyScalar(.5).addScalar(.5);
                            material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
                        } else {
                            _color.setRGB(1, 1, 1);
                            material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
                        }
                    }
                    function drawTriangle(x0, y0, x1, y1, x2, y2) {
                        _context.beginPath();
                        _context.moveTo(x0, y0);
                        _context.lineTo(x1, y1);
                        _context.lineTo(x2, y2);
                        _context.closePath();
                    }
                    function strokePath(color, linewidth, linecap, linejoin) {
                        setLineWidth(linewidth);
                        setLineCap(linecap);
                        setLineJoin(linejoin);
                        setStrokeStyle(color.getStyle());
                        _context.stroke();
                        _elemBox.expandByScalar(linewidth * 2);
                    }
                    function fillPath(color) {
                        setFillStyle(color.getStyle());
                        _context.fill();
                    }
                    function textureToPattern(texture) {
                        if (texture.version === 0 || texture instanceof THREE.CompressedTexture || texture instanceof THREE.DataTexture) {
                            return {
                                canvas: undefined,
                                version: texture.version
                            };
                        }
                        var image = texture.image;
                        if (image.complete === false) {
                            return {
                                canvas: undefined,
                                version: 0
                            };
                        }
                        var canvas = document.createElement("canvas");
                        canvas.width = image.width;
                        canvas.height = image.height;
                        var context = canvas.getContext("2d");
                        context.setTransform(1, 0, 0, -1, 0, image.height);
                        context.drawImage(image, 0, 0);
                        var repeatX = texture.wrapS === THREE.RepeatWrapping;
                        var repeatY = texture.wrapT === THREE.RepeatWrapping;
                        var repeat = "no-repeat";
                        if (repeatX === true && repeatY === true) {
                            repeat = "repeat";
                        } else if (repeatX === true) {
                            repeat = "repeat-x";
                        } else if (repeatY === true) {
                            repeat = "repeat-y";
                        }
                        var pattern = _context.createPattern(canvas, repeat);
                        if (texture.onUpdate) texture.onUpdate(texture);
                        return {
                            canvas: pattern,
                            version: texture.version
                        };
                    }
                    function patternPath(x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, texture) {
                        var pattern = _patterns[texture.id];
                        if (pattern === undefined || pattern.version !== texture.version) {
                            pattern = textureToPattern(texture);
                            _patterns[texture.id] = pattern;
                        }
                        if (pattern.canvas !== undefined) {
                            setFillStyle(pattern.canvas);
                        } else {
                            setFillStyle("rgba( 0, 0, 0, 1)");
                            _context.fill();
                            return;
                        }
                        var a, b, c, d, e, f, det, idet, offsetX = texture.offset.x / texture.repeat.x, offsetY = texture.offset.y / texture.repeat.y, width = texture.image.width * texture.repeat.x, height = texture.image.height * texture.repeat.y;
                        u0 = (u0 + offsetX) * width;
                        v0 = (v0 + offsetY) * height;
                        u1 = (u1 + offsetX) * width;
                        v1 = (v1 + offsetY) * height;
                        u2 = (u2 + offsetX) * width;
                        v2 = (v2 + offsetY) * height;
                        x1 -= x0;
                        y1 -= y0;
                        x2 -= x0;
                        y2 -= y0;
                        u1 -= u0;
                        v1 -= v0;
                        u2 -= u0;
                        v2 -= v0;
                        det = u1 * v2 - u2 * v1;
                        if (det === 0) return;
                        idet = 1 / det;
                        a = (v2 * x1 - v1 * x2) * idet;
                        b = (v2 * y1 - v1 * y2) * idet;
                        c = (u1 * x2 - u2 * x1) * idet;
                        d = (u1 * y2 - u2 * y1) * idet;
                        e = x0 - a * u0 - c * v0;
                        f = y0 - b * u0 - d * v0;
                        _context.save();
                        _context.transform(a, b, c, d, e, f);
                        _context.fill();
                        _context.restore();
                    }
                    function clipImage(x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, image) {
                        var a, b, c, d, e, f, det, idet, width = image.width - 1, height = image.height - 1;
                        u0 *= width;
                        v0 *= height;
                        u1 *= width;
                        v1 *= height;
                        u2 *= width;
                        v2 *= height;
                        x1 -= x0;
                        y1 -= y0;
                        x2 -= x0;
                        y2 -= y0;
                        u1 -= u0;
                        v1 -= v0;
                        u2 -= u0;
                        v2 -= v0;
                        det = u1 * v2 - u2 * v1;
                        idet = 1 / det;
                        a = (v2 * x1 - v1 * x2) * idet;
                        b = (v2 * y1 - v1 * y2) * idet;
                        c = (u1 * x2 - u2 * x1) * idet;
                        d = (u1 * y2 - u2 * y1) * idet;
                        e = x0 - a * u0 - c * v0;
                        f = y0 - b * u0 - d * v0;
                        _context.save();
                        _context.transform(a, b, c, d, e, f);
                        _context.clip();
                        _context.drawImage(image, 0, 0);
                        _context.restore();
                    }
                    function expand(v1, v2, pixels) {
                        var x = v2.x - v1.x, y = v2.y - v1.y, det = x * x + y * y, idet;
                        if (det === 0) return;
                        idet = pixels / Math.sqrt(det);
                        x *= idet;
                        y *= idet;
                        v2.x += x;
                        v2.y += y;
                        v1.x -= x;
                        v1.y -= y;
                    }
                    function setOpacity(value) {
                        if (_contextGlobalAlpha !== value) {
                            _context.globalAlpha = value;
                            _contextGlobalAlpha = value;
                        }
                    }
                    function setBlending(value) {
                        if (_contextGlobalCompositeOperation !== value) {
                            if (value === THREE.NormalBlending) {
                                _context.globalCompositeOperation = "source-over";
                            } else if (value === THREE.AdditiveBlending) {
                                _context.globalCompositeOperation = "lighter";
                            } else if (value === THREE.SubtractiveBlending) {
                                _context.globalCompositeOperation = "darker";
                            }
                            _contextGlobalCompositeOperation = value;
                        }
                    }
                    function setLineWidth(value) {
                        if (_contextLineWidth !== value) {
                            _context.lineWidth = value;
                            _contextLineWidth = value;
                        }
                    }
                    function setLineCap(value) {
                        if (_contextLineCap !== value) {
                            _context.lineCap = value;
                            _contextLineCap = value;
                        }
                    }
                    function setLineJoin(value) {
                        if (_contextLineJoin !== value) {
                            _context.lineJoin = value;
                            _contextLineJoin = value;
                        }
                    }
                    function setStrokeStyle(value) {
                        if (_contextStrokeStyle !== value) {
                            _context.strokeStyle = value;
                            _contextStrokeStyle = value;
                        }
                    }
                    function setFillStyle(value) {
                        if (_contextFillStyle !== value) {
                            _context.fillStyle = value;
                            _contextFillStyle = value;
                        }
                    }
                    function setLineDash(value) {
                        if (_contextLineDash.length !== value.length) {
                            _context.setLineDash(value);
                            _contextLineDash = value;
                        }
                    }
                };
            }, function(module, exports) {
                THREE.RenderableObject = function() {
                    this.id = 0;
                    this.object = null;
                    this.z = 0;
                    this.renderOrder = 0;
                };
                THREE.RenderableFace = function() {
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
                THREE.RenderableVertex = function() {
                    this.position = new THREE.Vector3();
                    this.positionWorld = new THREE.Vector3();
                    this.positionScreen = new THREE.Vector4();
                    this.visible = true;
                };
                THREE.RenderableVertex.prototype.copy = function(vertex) {
                    this.positionWorld.copy(vertex.positionWorld);
                    this.positionScreen.copy(vertex.positionScreen);
                };
                THREE.RenderableLine = function() {
                    this.id = 0;
                    this.v1 = new THREE.RenderableVertex();
                    this.v2 = new THREE.RenderableVertex();
                    this.vertexColors = [ new THREE.Color(), new THREE.Color() ];
                    this.material = null;
                    this.z = 0;
                    this.renderOrder = 0;
                };
                THREE.RenderableSprite = function() {
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
                THREE.Projector = function() {
                    var _object, _objectCount, _objectPool = [], _objectPoolLength = 0, _vertex, _vertexCount, _vertexPool = [], _vertexPoolLength = 0, _face, _faceCount, _facePool = [], _facePoolLength = 0, _line, _lineCount, _linePool = [], _linePoolLength = 0, _sprite, _spriteCount, _spritePool = [], _spritePoolLength = 0, _renderData = {
                        objects: [],
                        lights: [],
                        elements: []
                    }, _vector3 = new THREE.Vector3(), _vector4 = new THREE.Vector4(), _clipBox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1)), _boundingBox = new THREE.Box3(), _points3 = new Array(3), _points4 = new Array(4), _viewMatrix = new THREE.Matrix4(), _viewProjectionMatrix = new THREE.Matrix4(), _modelMatrix, _modelViewProjectionMatrix = new THREE.Matrix4(), _normalMatrix = new THREE.Matrix3(), _frustum = new THREE.Frustum(), _clippedVertex1PositionScreen = new THREE.Vector4(), _clippedVertex2PositionScreen = new THREE.Vector4();
                    this.projectVector = function(vector, camera) {
                        console.warn("THREE.Projector: .projectVector() is now vector.project().");
                        vector.project(camera);
                    };
                    this.unprojectVector = function(vector, camera) {
                        console.warn("THREE.Projector: .unprojectVector() is now vector.unproject().");
                        vector.unproject(camera);
                    };
                    this.pickingRay = function(vector, camera) {
                        console.error("THREE.Projector: .pickingRay() is now raycaster.setFromCamera().");
                    };
                    var RenderList = function() {
                        var normals = [];
                        var uvs = [];
                        var object = null;
                        var material = null;
                        var normalMatrix = new THREE.Matrix3();
                        function setObject(value) {
                            object = value;
                            material = object.material;
                            normalMatrix.getNormalMatrix(object.matrixWorld);
                            normals.length = 0;
                            uvs.length = 0;
                        }
                        function projectVertex(vertex) {
                            var position = vertex.position;
                            var positionWorld = vertex.positionWorld;
                            var positionScreen = vertex.positionScreen;
                            positionWorld.copy(position).applyMatrix4(_modelMatrix);
                            positionScreen.copy(positionWorld).applyMatrix4(_viewProjectionMatrix);
                            var invW = 1 / positionScreen.w;
                            positionScreen.x *= invW;
                            positionScreen.y *= invW;
                            positionScreen.z *= invW;
                            vertex.visible = positionScreen.x >= -1 && positionScreen.x <= 1 && positionScreen.y >= -1 && positionScreen.y <= 1 && positionScreen.z >= -1 && positionScreen.z <= 1;
                        }
                        function pushVertex(x, y, z) {
                            _vertex = getNextVertexInPool();
                            _vertex.position.set(x, y, z);
                            projectVertex(_vertex);
                        }
                        function pushNormal(x, y, z) {
                            normals.push(x, y, z);
                        }
                        function pushUv(x, y) {
                            uvs.push(x, y);
                        }
                        function checkTriangleVisibility(v1, v2, v3) {
                            if (v1.visible === true || v2.visible === true || v3.visible === true) return true;
                            _points3[0] = v1.positionScreen;
                            _points3[1] = v2.positionScreen;
                            _points3[2] = v3.positionScreen;
                            return _clipBox.intersectsBox(_boundingBox.setFromPoints(_points3));
                        }
                        function checkBackfaceCulling(v1, v2, v3) {
                            return (v3.positionScreen.x - v1.positionScreen.x) * (v2.positionScreen.y - v1.positionScreen.y) - (v3.positionScreen.y - v1.positionScreen.y) * (v2.positionScreen.x - v1.positionScreen.x) < 0;
                        }
                        function pushLine(a, b) {
                            var v1 = _vertexPool[a];
                            var v2 = _vertexPool[b];
                            _line = getNextLineInPool();
                            _line.id = object.id;
                            _line.v1.copy(v1);
                            _line.v2.copy(v2);
                            _line.z = (v1.positionScreen.z + v2.positionScreen.z) / 2;
                            _line.renderOrder = object.renderOrder;
                            _line.material = object.material;
                            _renderData.elements.push(_line);
                        }
                        function pushTriangle(a, b, c) {
                            var v1 = _vertexPool[a];
                            var v2 = _vertexPool[b];
                            var v3 = _vertexPool[c];
                            if (checkTriangleVisibility(v1, v2, v3) === false) return;
                            if (material.side === THREE.DoubleSide || checkBackfaceCulling(v1, v2, v3) === true) {
                                _face = getNextFaceInPool();
                                _face.id = object.id;
                                _face.v1.copy(v1);
                                _face.v2.copy(v2);
                                _face.v3.copy(v3);
                                _face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
                                _face.renderOrder = object.renderOrder;
                                _face.normalModel.fromArray(normals, a * 3);
                                _face.normalModel.applyMatrix3(normalMatrix).normalize();
                                for (var i = 0; i < 3; i++) {
                                    var normal = _face.vertexNormalsModel[i];
                                    normal.fromArray(normals, arguments[i] * 3);
                                    normal.applyMatrix3(normalMatrix).normalize();
                                    var uv = _face.uvs[i];
                                    uv.fromArray(uvs, arguments[i] * 2);
                                }
                                _face.vertexNormalsLength = 3;
                                _face.material = object.material;
                                _renderData.elements.push(_face);
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
                        };
                    };
                    var renderList = new RenderList();
                    this.projectScene = function(scene, camera, sortObjects, sortElements) {
                        _faceCount = 0;
                        _lineCount = 0;
                        _spriteCount = 0;
                        _renderData.elements.length = 0;
                        if (scene.autoUpdate === true) scene.updateMatrixWorld();
                        if (camera.parent === null) camera.updateMatrixWorld();
                        _viewMatrix.copy(camera.matrixWorldInverse.getInverse(camera.matrixWorld));
                        _viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, _viewMatrix);
                        _frustum.setFromMatrix(_viewProjectionMatrix);
                        _objectCount = 0;
                        _renderData.objects.length = 0;
                        _renderData.lights.length = 0;
                        scene.traverseVisible(function(object) {
                            if (object instanceof THREE.Light) {
                                _renderData.lights.push(object);
                            } else if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite) {
                                var material = object.material;
                                if (material.visible === false) return;
                                if (object.frustumCulled === false || _frustum.intersectsObject(object) === true) {
                                    _object = getNextObjectInPool();
                                    _object.id = object.id;
                                    _object.object = object;
                                    _vector3.setFromMatrixPosition(object.matrixWorld);
                                    _vector3.applyProjection(_viewProjectionMatrix);
                                    _object.z = _vector3.z;
                                    _object.renderOrder = object.renderOrder;
                                    _renderData.objects.push(_object);
                                }
                            }
                        });
                        if (sortObjects === true) {
                            _renderData.objects.sort(painterSort);
                        }
                        for (var o = 0, ol = _renderData.objects.length; o < ol; o++) {
                            var object = _renderData.objects[o].object;
                            var geometry = object.geometry;
                            renderList.setObject(object);
                            _modelMatrix = object.matrixWorld;
                            _vertexCount = 0;
                            if (object instanceof THREE.Mesh) {
                                if (geometry instanceof THREE.BufferGeometry) {
                                    var attributes = geometry.attributes;
                                    var groups = geometry.groups;
                                    if (attributes.position === undefined) continue;
                                    var positions = attributes.position.array;
                                    for (var i = 0, l = positions.length; i < l; i += 3) {
                                        renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
                                    }
                                    if (attributes.normal !== undefined) {
                                        var normals = attributes.normal.array;
                                        for (var i = 0, l = normals.length; i < l; i += 3) {
                                            renderList.pushNormal(normals[i], normals[i + 1], normals[i + 2]);
                                        }
                                    }
                                    if (attributes.uv !== undefined) {
                                        var uvs = attributes.uv.array;
                                        for (var i = 0, l = uvs.length; i < l; i += 2) {
                                            renderList.pushUv(uvs[i], uvs[i + 1]);
                                        }
                                    }
                                    if (geometry.index !== null) {
                                        var indices = geometry.index.array;
                                        if (groups.length > 0) {
                                            for (var o = 0; o < groups.length; o++) {
                                                var group = groups[o];
                                                for (var i = group.start, l = group.start + group.count; i < l; i += 3) {
                                                    renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
                                                }
                                            }
                                        } else {
                                            for (var i = 0, l = indices.length; i < l; i += 3) {
                                                renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
                                            }
                                        }
                                    } else {
                                        for (var i = 0, l = positions.length / 3; i < l; i += 3) {
                                            renderList.pushTriangle(i, i + 1, i + 2);
                                        }
                                    }
                                } else if (geometry instanceof THREE.Geometry) {
                                    var vertices = geometry.vertices;
                                    var faces = geometry.faces;
                                    var faceVertexUvs = geometry.faceVertexUvs[0];
                                    _normalMatrix.getNormalMatrix(_modelMatrix);
                                    var material = object.material;
                                    var isFaceMaterial = material instanceof THREE.MultiMaterial;
                                    var objectMaterials = isFaceMaterial === true ? object.material : null;
                                    for (var v = 0, vl = vertices.length; v < vl; v++) {
                                        var vertex = vertices[v];
                                        _vector3.copy(vertex);
                                        if (material.morphTargets === true) {
                                            var morphTargets = geometry.morphTargets;
                                            var morphInfluences = object.morphTargetInfluences;
                                            for (var t = 0, tl = morphTargets.length; t < tl; t++) {
                                                var influence = morphInfluences[t];
                                                if (influence === 0) continue;
                                                var target = morphTargets[t];
                                                var targetVertex = target.vertices[v];
                                                _vector3.x += (targetVertex.x - vertex.x) * influence;
                                                _vector3.y += (targetVertex.y - vertex.y) * influence;
                                                _vector3.z += (targetVertex.z - vertex.z) * influence;
                                            }
                                        }
                                        renderList.pushVertex(_vector3.x, _vector3.y, _vector3.z);
                                    }
                                    for (var f = 0, fl = faces.length; f < fl; f++) {
                                        var face = faces[f];
                                        material = isFaceMaterial === true ? objectMaterials.materials[face.materialIndex] : object.material;
                                        if (material === undefined) continue;
                                        var side = material.side;
                                        var v1 = _vertexPool[face.a];
                                        var v2 = _vertexPool[face.b];
                                        var v3 = _vertexPool[face.c];
                                        if (renderList.checkTriangleVisibility(v1, v2, v3) === false) continue;
                                        var visible = renderList.checkBackfaceCulling(v1, v2, v3);
                                        if (side !== THREE.DoubleSide) {
                                            if (side === THREE.FrontSide && visible === false) continue;
                                            if (side === THREE.BackSide && visible === true) continue;
                                        }
                                        _face = getNextFaceInPool();
                                        _face.id = object.id;
                                        _face.v1.copy(v1);
                                        _face.v2.copy(v2);
                                        _face.v3.copy(v3);
                                        _face.normalModel.copy(face.normal);
                                        if (visible === false && (side === THREE.BackSide || side === THREE.DoubleSide)) {
                                            _face.normalModel.negate();
                                        }
                                        _face.normalModel.applyMatrix3(_normalMatrix).normalize();
                                        var faceVertexNormals = face.vertexNormals;
                                        for (var n = 0, nl = Math.min(faceVertexNormals.length, 3); n < nl; n++) {
                                            var normalModel = _face.vertexNormalsModel[n];
                                            normalModel.copy(faceVertexNormals[n]);
                                            if (visible === false && (side === THREE.BackSide || side === THREE.DoubleSide)) {
                                                normalModel.negate();
                                            }
                                            normalModel.applyMatrix3(_normalMatrix).normalize();
                                        }
                                        _face.vertexNormalsLength = faceVertexNormals.length;
                                        var vertexUvs = faceVertexUvs[f];
                                        if (vertexUvs !== undefined) {
                                            for (var u = 0; u < 3; u++) {
                                                _face.uvs[u].copy(vertexUvs[u]);
                                            }
                                        }
                                        _face.color = face.color;
                                        _face.material = material;
                                        _face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
                                        _face.renderOrder = object.renderOrder;
                                        _renderData.elements.push(_face);
                                    }
                                }
                            } else if (object instanceof THREE.Line) {
                                if (geometry instanceof THREE.BufferGeometry) {
                                    var attributes = geometry.attributes;
                                    if (attributes.position !== undefined) {
                                        var positions = attributes.position.array;
                                        for (var i = 0, l = positions.length; i < l; i += 3) {
                                            renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
                                        }
                                        if (geometry.index !== null) {
                                            var indices = geometry.index.array;
                                            for (var i = 0, l = indices.length; i < l; i += 2) {
                                                renderList.pushLine(indices[i], indices[i + 1]);
                                            }
                                        } else {
                                            var step = object instanceof THREE.LineSegments ? 2 : 1;
                                            for (var i = 0, l = positions.length / 3 - 1; i < l; i += step) {
                                                renderList.pushLine(i, i + 1);
                                            }
                                        }
                                    }
                                } else if (geometry instanceof THREE.Geometry) {
                                    _modelViewProjectionMatrix.multiplyMatrices(_viewProjectionMatrix, _modelMatrix);
                                    var vertices = object.geometry.vertices;
                                    if (vertices.length === 0) continue;
                                    v1 = getNextVertexInPool();
                                    v1.positionScreen.copy(vertices[0]).applyMatrix4(_modelViewProjectionMatrix);
                                    var step = object instanceof THREE.LineSegments ? 2 : 1;
                                    for (var v = 1, vl = vertices.length; v < vl; v++) {
                                        v1 = getNextVertexInPool();
                                        v1.positionScreen.copy(vertices[v]).applyMatrix4(_modelViewProjectionMatrix);
                                        if ((v + 1) % step > 0) continue;
                                        v2 = _vertexPool[_vertexCount - 2];
                                        _clippedVertex1PositionScreen.copy(v1.positionScreen);
                                        _clippedVertex2PositionScreen.copy(v2.positionScreen);
                                        if (clipLine(_clippedVertex1PositionScreen, _clippedVertex2PositionScreen) === true) {
                                            _clippedVertex1PositionScreen.multiplyScalar(1 / _clippedVertex1PositionScreen.w);
                                            _clippedVertex2PositionScreen.multiplyScalar(1 / _clippedVertex2PositionScreen.w);
                                            _line = getNextLineInPool();
                                            _line.id = object.id;
                                            _line.v1.positionScreen.copy(_clippedVertex1PositionScreen);
                                            _line.v2.positionScreen.copy(_clippedVertex2PositionScreen);
                                            _line.z = Math.max(_clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z);
                                            _line.renderOrder = object.renderOrder;
                                            _line.material = object.material;
                                            if (object.material.vertexColors === THREE.VertexColors) {
                                                _line.vertexColors[0].copy(object.geometry.colors[v]);
                                                _line.vertexColors[1].copy(object.geometry.colors[v - 1]);
                                            }
                                            _renderData.elements.push(_line);
                                        }
                                    }
                                }
                            } else if (object instanceof THREE.Sprite) {
                                _vector4.set(_modelMatrix.elements[12], _modelMatrix.elements[13], _modelMatrix.elements[14], 1);
                                _vector4.applyMatrix4(_viewProjectionMatrix);
                                var invW = 1 / _vector4.w;
                                _vector4.z *= invW;
                                if (_vector4.z >= -1 && _vector4.z <= 1) {
                                    _sprite = getNextSpriteInPool();
                                    _sprite.id = object.id;
                                    _sprite.x = _vector4.x * invW;
                                    _sprite.y = _vector4.y * invW;
                                    _sprite.z = _vector4.z;
                                    _sprite.renderOrder = object.renderOrder;
                                    _sprite.object = object;
                                    _sprite.rotation = object.rotation;
                                    _sprite.scale.x = object.scale.x * Math.abs(_sprite.x - (_vector4.x + camera.projectionMatrix.elements[0]) / (_vector4.w + camera.projectionMatrix.elements[12]));
                                    _sprite.scale.y = object.scale.y * Math.abs(_sprite.y - (_vector4.y + camera.projectionMatrix.elements[5]) / (_vector4.w + camera.projectionMatrix.elements[13]));
                                    _sprite.material = object.material;
                                    _renderData.elements.push(_sprite);
                                }
                            }
                        }
                        if (sortElements === true) {
                            _renderData.elements.sort(painterSort);
                        }
                        return _renderData;
                    };
                    function getNextObjectInPool() {
                        if (_objectCount === _objectPoolLength) {
                            var object = new THREE.RenderableObject();
                            _objectPool.push(object);
                            _objectPoolLength++;
                            _objectCount++;
                            return object;
                        }
                        return _objectPool[_objectCount++];
                    }
                    function getNextVertexInPool() {
                        if (_vertexCount === _vertexPoolLength) {
                            var vertex = new THREE.RenderableVertex();
                            _vertexPool.push(vertex);
                            _vertexPoolLength++;
                            _vertexCount++;
                            return vertex;
                        }
                        return _vertexPool[_vertexCount++];
                    }
                    function getNextFaceInPool() {
                        if (_faceCount === _facePoolLength) {
                            var face = new THREE.RenderableFace();
                            _facePool.push(face);
                            _facePoolLength++;
                            _faceCount++;
                            return face;
                        }
                        return _facePool[_faceCount++];
                    }
                    function getNextLineInPool() {
                        if (_lineCount === _linePoolLength) {
                            var line = new THREE.RenderableLine();
                            _linePool.push(line);
                            _linePoolLength++;
                            _lineCount++;
                            return line;
                        }
                        return _linePool[_lineCount++];
                    }
                    function getNextSpriteInPool() {
                        if (_spriteCount === _spritePoolLength) {
                            var sprite = new THREE.RenderableSprite();
                            _spritePool.push(sprite);
                            _spritePoolLength++;
                            _spriteCount++;
                            return sprite;
                        }
                        return _spritePool[_spriteCount++];
                    }
                    function painterSort(a, b) {
                        if (a.renderOrder !== b.renderOrder) {
                            return a.renderOrder - b.renderOrder;
                        } else if (a.z !== b.z) {
                            return b.z - a.z;
                        } else if (a.id !== b.id) {
                            return a.id - b.id;
                        } else {
                            return 0;
                        }
                    }
                    function clipLine(s1, s2) {
                        var alpha1 = 0, alpha2 = 1, bc1near = s1.z + s1.w, bc2near = s2.z + s2.w, bc1far = -s1.z + s1.w, bc2far = -s2.z + s2.w;
                        if (bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0) {
                            return true;
                        } else if (bc1near < 0 && bc2near < 0 || bc1far < 0 && bc2far < 0) {
                            return false;
                        } else {
                            if (bc1near < 0) {
                                alpha1 = Math.max(alpha1, bc1near / (bc1near - bc2near));
                            } else if (bc2near < 0) {
                                alpha2 = Math.min(alpha2, bc1near / (bc1near - bc2near));
                            }
                            if (bc1far < 0) {
                                alpha1 = Math.max(alpha1, bc1far / (bc1far - bc2far));
                            } else if (bc2far < 0) {
                                alpha2 = Math.min(alpha2, bc1far / (bc1far - bc2far));
                            }
                            if (alpha2 < alpha1) {
                                return false;
                            } else {
                                s1.lerp(s2, alpha1);
                                s2.lerp(s1, 1 - alpha2);
                                return true;
                            }
                        }
                    }
                };
            }, function(module, exports, __webpack_require__) {
                /*!
		 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
		 *
		 * Copyright (c) 2014-2015, Jon Schlinkert.
		 * Licensed under the MIT License.
		 */
                "use strict";
                var isObject = __webpack_require__(10);
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
                var Vector3 = THREE.Vector3;
                var EventEmmiter_1 = __webpack_require__(15);
                var Utils_1 = __webpack_require__(16);
                var Widget_1 = __webpack_require__(17);
                var TrendsManager_1 = __webpack_require__(18);
                var Screen_1 = __webpack_require__(21);
                var AxisMarks_1 = __webpack_require__(22);
                var interfaces_1 = __webpack_require__(23);
                var deps_1 = __webpack_require__(3);
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
                var ChartState = function() {
                    function ChartState(initialState, widgetsClasses, plugins) {
                        if (widgetsClasses === void 0) {
                            widgetsClasses = {};
                        }
                        if (plugins === void 0) {
                            plugins = [];
                        }
                        this.data = {
                            prevState: {},
                            $el: null,
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
                                gridMinSize: 100,
                                autoScroll: true,
                                marks: []
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
                                dataType: interfaces_1.AXIS_DATA_TYPE.NUMBER,
                                gridMinSize: 50,
                                marks: []
                            },
                            animations: {
                                enabled: true,
                                trendChangeSpeed: .5,
                                trendChangeEase: void 0,
                                zoomSpeed: .25,
                                zoomEase: Linear.easeNone,
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
                            cursor: {
                                dragMode: false,
                                x: 0,
                                y: 0
                            },
                            backgroundColor: 0,
                            backgroundOpacity: 1,
                            showStats: false,
                            pluginsState: {},
                            eventEmitterMaxListeners: 20
                        };
                        this.widgetsClasses = {};
                        this.plugins = {};
                        this.isReady = false;
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.ee.setMaxListeners(initialState.eventEmitterMaxListeners || this.data.eventEmitterMaxListeners);
                        this.widgetsClasses = widgetsClasses;
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
                    ChartState.prototype.destroy = function() {
                        this.ee.emit(CHART_STATE_EVENTS.DESTROY);
                        this.ee.removeAllListeners();
                        this.data = {};
                    };
                    ChartState.prototype.onDestroy = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.DESTROY, cb);
                    };
                    ChartState.prototype.onInitialStateApplied = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.INITIAL_STATE_APPLIED, cb);
                    };
                    ChartState.prototype.onReady = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.READY, cb);
                    };
                    ChartState.prototype.onChange = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.CHANGE, cb);
                    };
                    ChartState.prototype.onTrendChange = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.TREND_CHANGE, cb);
                    };
                    ChartState.prototype.onTrendsChange = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.TRENDS_CHANGE, cb);
                    };
                    ChartState.prototype.onScrollStop = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.SCROLL_STOP, cb);
                    };
                    ChartState.prototype.onScroll = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.SCROLL, cb);
                    };
                    ChartState.prototype.onZoom = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.ZOOM, cb);
                    };
                    ChartState.prototype.onResize = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.RESIZE, cb);
                    };
                    ChartState.prototype.onPluginsStateChange = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.PLUGINS_STATE_CHANGED, cb);
                    };
                    ChartState.prototype.getTrend = function(trendName) {
                        return this.trendsManager.getTrend(trendName);
                    };
                    ChartState.prototype.setState = function(newState, eventData, silent) {
                        if (silent === void 0) {
                            silent = false;
                        }
                        var stateData = this.data;
                        var changedProps = {};
                        for (var key in newState) {
                            if (stateData[key] !== newState[key]) {
                                changedProps[key] = newState[key];
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
                        this.data = Utils_1.Utils.deepMerge(this.data, newState, false);
                        if (newStateContainsData) for (var trendName in trendsData) {
                            this.data.trends[trendName].data = trendsData[trendName];
                        }
                        if (silent) return;
                        var recalculateResult = this.recalculateState(changedProps);
                        changedProps = recalculateResult.changedProps;
                        this.emitChangedStateEvents(changedProps, eventData);
                    };
                    ChartState.prototype.recalculateState = function(changedProps) {
                        var data = this.data;
                        var patch = {};
                        var actualData = Utils_1.Utils.deepMerge({}, data);
                        if (changedProps.widgets || !data.widgets) {
                            patch.widgets = {};
                            var widgetsOptions = data.widgets || {};
                            for (var widgetName in this.widgetsClasses) {
                                var WidgetClass = this.widgetsClasses[widgetName];
                                var userOptions = widgetsOptions[widgetName] || {};
                                var defaultOptions = WidgetClass.getDefaultOptions() || Widget_1.ChartWidget.getDefaultOptions();
                                patch.widgets[widgetName] = Utils_1.Utils.deepMerge(defaultOptions, userOptions);
                            }
                        }
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
                        var needToRecalculateXAxis = isMouseDrag || chartWasResized || changedProps.xAxis && changedProps.xAxis.range || this.data.xAxis.range.zeroVal == void 0;
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
                        var needToRecalculateYAxis = chartWasResized || (data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.RELATIVE_END || data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.AUTO || data.yAxis.range.isMirrorMode) && (scrollXChanged || changedProps.trends || changedProps.yAxis) || this.data.yAxis.range.zeroVal == void 0;
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
                        this.data = Utils_1.Utils.deepMerge(this.data, patch);
                        return {
                            changedProps: allChangedProps,
                            patch: patch
                        };
                    };
                    ChartState.prototype.getComputedData = function(changedProps) {
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
                    ChartState.prototype.savePrevState = function(changedProps) {
                        if (!changedProps) changedProps = this.data;
                        var prevState = this.data.prevState;
                        Utils_1.Utils.copyProps(this.data, prevState, changedProps, [ "trends" ]);
                    };
                    ChartState.prototype.emitChangedStateEvents = function(changedProps, eventData) {
                        var prevState = this.data.prevState;
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
                    ChartState.prototype.installPlugins = function(plugins, initialState) {
                        var _this = this;
                        initialState.pluginsState = {};
                        plugins.forEach(function(plugin) {
                            var PluginClass = plugin.constructor;
                            var pluginName = PluginClass.NAME;
                            PluginClass.pluginWidgets.forEach(function(PluginWidget) {
                                return _this.widgetsClasses[PluginWidget.widgetName] = PluginWidget;
                            });
                            initialState.pluginsState[pluginName] = Utils_1.Utils.deepMerge({}, plugin.initialState);
                            _this.plugins[pluginName] = plugin;
                            plugin.setupChartState(_this);
                        });
                        return initialState;
                    };
                    ChartState.prototype.getPlugin = function(pluginName) {
                        return this.plugins[pluginName];
                    };
                    ChartState.prototype.initListeners = function() {
                        var _this = this;
                        this.ee.on(CHART_STATE_EVENTS.TRENDS_CHANGE, function(changedTrends, newData) {
                            _this.handleTrendsChange(changedTrends, newData);
                        });
                    };
                    ChartState.prototype.handleTrendsChange = function(changedTrends, newData) {
                        for (var trendName in changedTrends) {
                            this.ee.emit(CHART_STATE_EVENTS.TREND_CHANGE, trendName, changedTrends[trendName], newData);
                        }
                    };
                    ChartState.prototype.recalculateXAxis = function(actualData, changedProps) {
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
                    ChartState.prototype.recalculateYAxis = function(actualData) {
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
                            Utils_1.Utils.warn("Sum of padding and margins of yAxi more then available chart height. Trends can be rendered incorrectly");
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
                        var currentAxisRange = this.data.yAxis.range;
                        if (currentAxisRange.from !== fromVal) patch.range.from = fromVal;
                        if (currentAxisRange.to !== toVal) patch.range.to = toVal;
                        if (currentAxisRange.scroll !== scroll) patch.range.scroll = scroll;
                        if (currentAxisRange.zoom !== zoom) patch.range.zoom = zoom;
                        return patch;
                    };
                    ChartState.prototype.zoom = function(zoomValue, origin) {
                        var _this = this;
                        if (origin === void 0) {
                            origin = .5;
                        }
                        var _a = this.data.xAxis.range, zoom = _a.zoom, scroll = _a.scroll, scaleFactor = _a.scaleFactor;
                        var newZoom = zoom * zoomValue;
                        var currentRange = this.data.width / (scaleFactor * zoom);
                        var nextRange = this.data.width / (scaleFactor * newZoom);
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
                            var animationTime = _this.data.animations.enabled ? _this.data.animations.zoomSpeed : 0;
                            setTimeout(resolve, animationTime * 1e3);
                        });
                    };
                    ChartState.prototype.zoomToRange = function(range, origin) {
                        var _a = this.data.xAxis.range, scaleFactor = _a.scaleFactor, zoom = _a.zoom;
                        var currentRange = this.data.width / (scaleFactor * zoom);
                        return this.zoom(currentRange / range, origin);
                    };
                    ChartState.prototype.scrollToEnd = function() {
                        var _this = this;
                        var state = this.data;
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
                            var animationTime = _this.data.animations.enabled ? _this.data.animations.scrollSpeed : 0;
                            setTimeout(resolve, animationTime * 1e3);
                        });
                    };
                    ChartState.prototype.getPointOnXAxis = function(xVal) {
                        var _a = this.data.xAxis.range, scaleFactor = _a.scaleFactor, zoom = _a.zoom, zeroVal = _a.zeroVal;
                        return (xVal - zeroVal) * scaleFactor * zoom;
                    };
                    ChartState.prototype.getPointOnYAxis = function(yVal) {
                        var _a = this.data.yAxis.range, scaleFactor = _a.scaleFactor, zoom = _a.zoom, zeroVal = _a.zeroVal;
                        return (yVal - zeroVal) * scaleFactor * zoom;
                    };
                    ChartState.prototype.getValueOnXAxis = function(x) {
                        return this.data.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
                    };
                    ChartState.prototype.valueToPxByXAxis = function(xVal) {
                        return xVal * this.data.xAxis.range.scaleFactor * this.data.xAxis.range.zoom;
                    };
                    ChartState.prototype.valueToPxByYAxis = function(yVal) {
                        return yVal * this.data.yAxis.range.scaleFactor * this.data.yAxis.range.zoom;
                    };
                    ChartState.prototype.pxToValueByXAxis = function(xVal) {
                        return xVal / this.data.xAxis.range.scaleFactor / this.data.xAxis.range.zoom;
                    };
                    ChartState.prototype.pxToValueByYAxis = function(yVal) {
                        return yVal / this.data.yAxis.range.scaleFactor / this.data.yAxis.range.zoom;
                    };
                    ChartState.prototype.getValueByScreenX = function(x) {
                        var _a = this.data.xAxis.range, zeroVal = _a.zeroVal, scroll = _a.scroll;
                        return zeroVal + scroll + this.pxToValueByXAxis(x);
                    };
                    ChartState.prototype.getValueByScreenY = function(y) {
                        var _a = this.data.yAxis.range, zeroVal = _a.zeroVal, scroll = _a.scroll;
                        return zeroVal + scroll + this.pxToValueByYAxis(y);
                    };
                    ChartState.prototype.getScreenXByValue = function(xVal) {
                        var _a = this.data.xAxis.range, scroll = _a.scroll, zeroVal = _a.zeroVal;
                        return this.valueToPxByXAxis(xVal - zeroVal - scroll);
                    };
                    ChartState.prototype.getScreenYByValue = function(yVal) {
                        var _a = this.data.yAxis.range, scroll = _a.scroll, zeroVal = _a.zeroVal;
                        return this.valueToPxByYAxis(yVal - zeroVal - scroll);
                    };
                    ChartState.prototype.getScreenXByPoint = function(xVal) {
                        return this.getScreenXByValue(this.getValueOnXAxis(xVal));
                    };
                    ChartState.prototype.getPointByScreenX = function(screenX) {
                        return this.getPointOnXAxis(this.getValueByScreenX(screenX));
                    };
                    ChartState.prototype.getPointOnChart = function(xVal, yVal) {
                        return new Vector3(this.getPointOnXAxis(xVal), this.getPointOnYAxis(yVal), 0);
                    };
                    ChartState.prototype.getScreenLeftVal = function() {
                        return this.getValueByScreenX(0);
                    };
                    ChartState.prototype.getScreenRightVal = function() {
                        return this.getValueByScreenX(this.data.width);
                    };
                    ChartState.prototype.getPaddingRight = function() {
                        return this.getValueByScreenX(this.data.width - this.data.xAxis.range.padding.end);
                    };
                    return ChartState;
                }();
                exports.ChartState = ChartState;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var deps_1 = __webpack_require__(3);
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
                var deps_1 = __webpack_require__(3);
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
                    /**!
		     * @preserve $.parseColor
		     * Copyright 2011 THEtheChad Elliott
		     * Released under the MIT and GPL licenses.
		     */
                    Utils.parseColor = function(color) {
                        var cache, p = parseInt, color = color.replace(/\s\s*/g, "");
                        if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)) cache = [ p(cache[1], 16), p(cache[2], 16), p(cache[3], 16) ]; else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)) cache = [ p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17 ]; else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)) cache = [ +cache[1], +cache[2], +cache[3], +cache[4] ]; else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)) cache = [ +cache[1], +cache[2], +cache[3] ]; else throw Error(color + " is not supported by $.parseColor");
                        isNaN(cache[3]) && (cache[3] = 1);
                        return cache;
                    };
                    Utils.getHexColor = function(str) {
                        var rgb = this.parseColor(str);
                        return (rgb[0] << 8 * 2) + (rgb[1] << 8) + rgb[2];
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
            }, function(module, exports) {
                "use strict";
                var ChartWidget = function() {
                    function ChartWidget(chartState) {
                        this.unsubscribers = [];
                        this.chartState = chartState;
                        this.bindEvents();
                    }
                    ChartWidget.prototype.bindEvents = function() {};
                    ChartWidget.prototype.bindEvent = function() {
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
                    ChartWidget.prototype.unbindEvents = function() {
                        this.unsubscribers.forEach(function(unsubscriber) {
                            return unsubscriber();
                        });
                        this.unsubscribers.length = 0;
                    };
                    ChartWidget.getDefaultOptions = function() {
                        return {
                            enabled: true
                        };
                    };
                    ChartWidget.widgetName = "";
                    return ChartWidget;
                }();
                exports.ChartWidget = ChartWidget;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var Trend_1 = __webpack_require__(19);
                var EventEmmiter_1 = __webpack_require__(15);
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
                            this_1.trends[trendName].segments.onRebuild(function() {
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
                var Utils_1 = __webpack_require__(16);
                var TrendSegments_1 = __webpack_require__(20);
                var EventEmmiter_1 = __webpack_require__(15);
                var deps_1 = __webpack_require__(3);
                var EVENTS = {
                    CHANGE: "Change",
                    PREPEND_REQUEST: "prependRequest"
                };
                (function(TREND_TYPE) {
                    TREND_TYPE[TREND_TYPE["LINE"] = 0] = "LINE";
                    TREND_TYPE[TREND_TYPE["CANDLE"] = 1] = "CANDLE";
                })(exports.TREND_TYPE || (exports.TREND_TYPE = {}));
                var TREND_TYPE = exports.TREND_TYPE;
                var DEFAULT_OPTIONS = {
                    enabled: true,
                    type: TREND_TYPE.LINE,
                    data: [],
                    maxSegmentLength: 1e3,
                    lineWidth: 2,
                    lineColor: 16777215,
                    hasGradient: true,
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
                };
                var Trend = function() {
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
                        if (options.dataset) this.calculatedOptions.data = Trend.prepareData(options.dataset);
                        this.calculatedOptions.dataset = [];
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.bindEvents();
                    }
                    Trend.prototype.onInitialStateApplied = function() {
                        this.segments = new TrendSegments_1.TrendSegments(this.chartState, this);
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
                        return this.chartState.data.trends[this.name];
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
                        var minXVal = chartState.data.computedData.trends.minXVal;
                        var minScreenX = chartState.getScreenXByValue(minXVal);
                        var needToRequest = minScreenX > 0;
                        var _a = chartState.data.xAxis.range, from = _a.from, to = _a.to;
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
                var EventEmmiter_1 = __webpack_require__(15);
                var Vector3 = THREE.Vector3;
                var Trend_1 = __webpack_require__(19);
                var Utils_1 = __webpack_require__(16);
                var MAX_ANIMATED_SEGMENTS = 100;
                var EVENTS = {
                    REBUILD: "rebuild",
                    DISLPAYED_RANGE_CHANGED: "displayedRangeChanged",
                    ANIMATION_FRAME: "animationFrame"
                };
                var TrendSegments = function() {
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
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.trend = trend;
                        this.maxSegmentLength = trend.getOptions().maxSegmentLength;
                        this.tryToRebuildSegments();
                        this.bindEvents();
                    }
                    TrendSegments.prototype.bindEvents = function() {
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
                    TrendSegments.prototype.onDestroyHandler = function() {
                        this.ee.removeAllListeners();
                        this.appendAnimation && this.appendAnimation.kill();
                        this.prependAnimation && this.prependAnimation.kill();
                    };
                    TrendSegments.prototype.onZoomHandler = function() {
                        var segmentsRebuilded = this.tryToRebuildSegments();
                        if (!segmentsRebuilded) {
                            this.recalculateDisplayedRange();
                        }
                    };
                    TrendSegments.prototype.onTrendChangeHandler = function(changedOptions, newData) {
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
                    TrendSegments.prototype.getEndSegment = function() {
                        return this.segmentsById[this.endSegmentId];
                    };
                    TrendSegments.prototype.getStartSegment = function() {
                        return this.segmentsById[this.startSegmentId];
                    };
                    TrendSegments.prototype.tryToRebuildSegments = function(force) {
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
                    TrendSegments.prototype.stopAllAnimations = function() {
                        this.animatedSegmentsIds = [];
                        this.animatedSegmentsForAppend = [];
                        this.animatedSegmentsForAppend = [];
                        if (this.prependAnimation) this.prependAnimation.kill();
                        if (this.appendAnimation) this.appendAnimation.kill();
                    };
                    TrendSegments.prototype.recalculateDisplayedRange = function(segmentsAreRebuilded) {
                        if (segmentsAreRebuilded === void 0) {
                            segmentsAreRebuilded = false;
                        }
                        var _a = this.chartState.data.xAxis.range, from = _a.from, to = _a.to;
                        var _b = this, firstDisplayedSegment = _b.firstDisplayedSegment, lastDisplayedSegment = _b.lastDisplayedSegment;
                        var displayedRange = to - from;
                        this.firstDisplayedSegment = Utils_1.Utils.binarySearchClosest(this.segments, from - displayedRange, "startXVal");
                        this.lastDisplayedSegment = Utils_1.Utils.binarySearchClosest(this.segments, to + displayedRange, "endXVal");
                        if (segmentsAreRebuilded) return;
                        var displayedRangeChanged = firstDisplayedSegment.id !== this.firstDisplayedSegment.id || lastDisplayedSegment.id !== this.lastDisplayedSegment.id;
                        if (displayedRangeChanged) this.ee.emit(EVENTS.DISLPAYED_RANGE_CHANGED);
                    };
                    TrendSegments.prototype.getSegmentsForXValues = function(values) {
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
                    TrendSegments.prototype.onAnimationFrame = function(cb) {
                        return this.ee.subscribe(EVENTS.ANIMATION_FRAME, cb);
                    };
                    TrendSegments.prototype.onRebuild = function(cb) {
                        return this.ee.subscribe(EVENTS.REBUILD, cb);
                    };
                    TrendSegments.prototype.onDisplayedRangeChanged = function(cb) {
                        return this.ee.subscribe(EVENTS.DISLPAYED_RANGE_CHANGED, cb);
                    };
                    TrendSegments.prototype.allocateNextSegment = function() {
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
                    TrendSegments.prototype.allocatePrevSegment = function() {
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
                    TrendSegments.prototype.appendData = function(newData, needRebuildSegments) {
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
                        var animationsOptions = this.chartState.data.animations;
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
                    TrendSegments.prototype.prependData = function(newData) {
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
                        var animationsOptions = this.chartState.data.animations;
                        var time = animationsOptions.enabled ? animationsOptions.trendChangeSpeed : 0;
                        if (this.animatedSegmentsForPrepend.length > MAX_ANIMATED_SEGMENTS) time = 0;
                        this.animate(time, true);
                    };
                    TrendSegments.prototype.animate = function(time, isPrepend) {
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
                        var animationsOptions = this.chartState.data.animations;
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
                    TrendSegments.prototype.onAnimationFrameHandler = function(coefficient, isPrepend) {
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
                    return TrendSegments;
                }();
                exports.TrendSegments = TrendSegments;
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
                var Vector3 = THREE.Vector3;
                var EventEmmiter_1 = __webpack_require__(15);
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
                        var _a = chartState.data, w = _a.width, h = _a.height;
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.transform({
                            scrollY: this.valueToPxByYAxis(this.chartState.data.yAxis.range.scroll),
                            zoomY: 1
                        });
                        this.bindEvents();
                    }
                    Screen.prototype.getCameraSettings = function() {
                        var _a = this.chartState.data, w = _a.width, h = _a.height;
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
                        var isDragMode = state.data.cursor.dragMode;
                        var animations = state.data.animations;
                        var canAnimate = animations.enabled && !isDragMode;
                        var zoomXChanged = changedProps.xAxis.range.zoom;
                        var isAutoscroll = state.data.autoScroll && !isDragMode && !zoomXChanged;
                        var time = isAutoscroll ? animations.autoScrollSpeed : animations.zoomSpeed;
                        var ease = isAutoscroll ? animations.autoScrollEase : animations.zoomEase;
                        if (this.scrollXAnimation) this.scrollXAnimation.pause();
                        var range = state.data.xAxis.range;
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
                        var animations = state.data.animations;
                        var canAnimate = animations.enabled;
                        var time = animations.zoomSpeed;
                        if (this.scrollYAnimation) this.scrollYAnimation.pause();
                        var range = state.data.yAxis.range;
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
                        var animations = state.data.animations;
                        var canAnimate = animations.enabled;
                        var time = animations.zoomSpeed;
                        var targetZoom = state.data.xAxis.range.zoom;
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
                        var animations = state.data.animations;
                        var canAnimate = animations.enabled;
                        var time = animations.zoomSpeed;
                        var targetZoom = state.data.yAxis.range.zoom;
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
                        var _a = this.chartState.data.xAxis.range, scaleFactor = _a.scaleFactor, zeroVal = _a.zeroVal;
                        var zoom = this.options.zoomX;
                        return (xVal - zeroVal) * scaleFactor * zoom;
                    };
                    Screen.prototype.getPointOnYAxis = function(yVal) {
                        var _a = this.chartState.data.yAxis.range, scaleFactor = _a.scaleFactor, zeroVal = _a.zeroVal;
                        var zoom = this.options.zoomY;
                        return (yVal - zeroVal) * scaleFactor * zoom;
                    };
                    Screen.prototype.getPointOnChart = function(xVal, yVal) {
                        return new Vector3(this.getPointOnXAxis(xVal), this.getPointOnYAxis(yVal), 0);
                    };
                    Screen.prototype.getValueOnXAxis = function(x) {
                        return this.chartState.data.xAxis.range.zeroVal + this.pxToValueByXAxis(x);
                    };
                    Screen.prototype.valueToPxByXAxis = function(xVal) {
                        return xVal * this.chartState.data.xAxis.range.scaleFactor * this.options.zoomX;
                    };
                    Screen.prototype.valueToPxByYAxis = function(yVal) {
                        return yVal * this.chartState.data.yAxis.range.scaleFactor * this.options.zoomY;
                    };
                    Screen.prototype.pxToValueByXAxis = function(xVal) {
                        return xVal / this.chartState.data.xAxis.range.scaleFactor / this.options.zoomX;
                    };
                    Screen.prototype.pxToValueByYAxis = function(yVal) {
                        return yVal / this.chartState.data.yAxis.range.scaleFactor / this.options.zoomY;
                    };
                    Screen.prototype.getValueByScreenX = function(x) {
                        return this.chartState.data.xAxis.range.zeroVal + this.options.scrollXVal + this.pxToValueByXAxis(x);
                    };
                    Screen.prototype.getValueByScreenY = function(y) {
                        return this.chartState.data.yAxis.range.zeroVal + this.options.scrollYVal + this.pxToValueByYAxis(y);
                    };
                    Screen.prototype.getScreenXByValue = function(xVal) {
                        var _a = this.chartState.data.xAxis.range, scroll = _a.scroll, zeroVal = _a.zeroVal;
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
                        return this.getPointByScreenY(this.chartState.data.height);
                    };
                    Screen.prototype.getBottom = function() {
                        return this.getPointByScreenY(0);
                    };
                    Screen.prototype.getLeft = function() {
                        return this.getPointByScreenX(0);
                    };
                    Screen.prototype.getScreenRightVal = function() {
                        return this.getValueByScreenX(this.chartState.data.width);
                    };
                    Screen.prototype.getTopVal = function() {
                        return this.getValueByScreenY(this.chartState.data.height);
                    };
                    Screen.prototype.getBottomVal = function() {
                        return this.getValueByScreenY(0);
                    };
                    Screen.prototype.getCenterYVal = function() {
                        return this.getValueByScreenY(this.chartState.data.height / 2);
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
                var Utils_1 = __webpack_require__(16);
                var interfaces_1 = __webpack_require__(23);
                var EventEmmiter_1 = __webpack_require__(15);
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
                        var axisMarksOptions = axisType == interfaces_1.AXIS_TYPE.X ? chartState.data.xAxis.marks : chartState.data.yAxis.marks;
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
                        var maxXVal = this.chartState.data.computedData.trends.maxXVal;
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
                var Widget_1 = __webpack_require__(17);
                var GridWidget_1 = __webpack_require__(25);
                var Utils_1 = __webpack_require__(16);
                var interfaces_1 = __webpack_require__(23);
                var AxisWidget = function(_super) {
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
                        this.setupAxis(interfaces_1.AXIS_TYPE.X);
                        this.setupAxis(interfaces_1.AXIS_TYPE.Y);
                        this.updateAxisXRequest = Utils_1.Utils.throttle(function() {
                            return _this.updateAxis(interfaces_1.AXIS_TYPE.X);
                        }, 1e3);
                        this.onScrollChange(state.screen.options.scrollX, state.screen.options.scrollY);
                    }
                    AxisWidget.prototype.bindEvents = function() {
                        var _this = this;
                        var state = this.chartState;
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
                        var _a = this.chartState.data, visibleWidth = _a.width, visibleHeight = _a.height;
                        var canvasWidth = 0, canvasHeight = 0;
                        if (isXAxis) {
                            this.axisXObject.traverse(function(obj) {
                                return _this.axisXObject.remove(obj);
                            });
                            canvasWidth = visibleWidth * 3;
                            canvasHeight = 50;
                        } else {
                            this.axisYObject.traverse(function(obj) {
                                return _this.axisYObject.remove(obj);
                            });
                            canvasWidth = 50;
                            canvasHeight = visibleHeight * 3;
                        }
                        var texture = Utils_1.Utils.createPixelPerfectTexture(canvasWidth, canvasHeight, function(ctx) {
                            ctx.beginPath();
                            ctx.font = "10px Arial";
                            ctx.fillStyle = "rgba(255,255,255,0.5)";
                            ctx.strokeStyle = "rgba(255,255,255,0.1)";
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
                        var _a = this.chartState.data, visibleWidth = _a.width, visibleHeight = _a.height;
                        var _b = this.chartState.screen.options, scrollX = _b.scrollX, scrollY = _b.scrollY, zoomX = _b.zoomX, zoomY = _b.zoomY;
                        var axisOptions;
                        var axisMesh;
                        var axisGridParams;
                        if (isXAxis) {
                            axisMesh = this.axisXObject.children[0];
                            axisOptions = this.chartState.data.xAxis;
                            axisGridParams = GridWidget_1.GridWidget.getGridParamsForAxis(axisOptions, visibleWidth, zoomX);
                        } else {
                            axisMesh = this.axisYObject.children[0];
                            axisOptions = this.chartState.data.yAxis;
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
                                var pxVal = this.chartState.screen.getPointOnXAxis(val) - scrollX + visibleWidth;
                                ctx.textAlign = "center";
                                if (axisOptions.dataType == interfaces_1.AXIS_DATA_TYPE.DATE) {
                                    displayedValue = AxisWidget.getDateStr(val, axisGridParams);
                                } else {
                                    displayedValue = Number(val.toFixed(14)).toString();
                                }
                                ctx.fillText(displayedValue, pxVal, canvasHeight - 10);
                            } else {
                                var pxVal = canvasHeight - this.chartState.screen.getPointOnYAxis(val) + scrollY;
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
                var Widget_1 = __webpack_require__(17);
                var LineSegments = THREE.LineSegments;
                var Utils_1 = __webpack_require__(16);
                var GridWidget = function(_super) {
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
                    GridWidget.prototype.bindEvents = function() {
                        var _this = this;
                        var updateGridThrottled = Utils_1.Utils.throttle(function() {
                            return _this.updateGrid();
                        }, 1e3);
                        this.bindEvent(this.chartState.onScroll(function() {
                            return updateGridThrottled();
                        }), this.chartState.screen.onZoomFrame(function(options) {
                            updateGridThrottled();
                            _this.onZoomFrame(options);
                        }), this.chartState.onDestroy(function() {
                            _this.isDestroyed = true;
                            _this.unbindEvents();
                        }), this.chartState.onResize(function() {
                            _this.updateGrid();
                        }));
                    };
                    GridWidget.prototype.initGrid = function() {
                        var geometry = new THREE.Geometry();
                        var material = new THREE.LineBasicMaterial({
                            linewidth: 1,
                            opacity: .1,
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
                    GridWidget.prototype.getHorizontalLineSegment = function(yVal, scrollXVal, scrollYVal) {
                        var chartState = this.chartState;
                        var localYVal = yVal - chartState.data.yAxis.range.zeroVal - scrollYVal;
                        var widthVal = chartState.pxToValueByXAxis(chartState.data.width);
                        return [ new THREE.Vector3(widthVal * 2 + scrollXVal, localYVal, 0), new THREE.Vector3(-widthVal + scrollXVal, localYVal, 0) ];
                    };
                    GridWidget.prototype.getVerticalLineSegment = function(xVal, scrollXVal, scrollYVal) {
                        var chartState = this.chartState;
                        var localXVal = xVal - chartState.data.xAxis.range.zeroVal - scrollXVal;
                        var heightVal = chartState.pxToValueByYAxis(chartState.data.height);
                        return [ new THREE.Vector3(localXVal, heightVal * 2 + scrollYVal, 0), new THREE.Vector3(localXVal, -heightVal + scrollYVal, 0) ];
                    };
                    GridWidget.prototype.onZoomFrame = function(options) {
                        var _a = this.chartState.data, xAxis = _a.xAxis, yAxis = _a.yAxis;
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
                        var minGridStepInPixels = axisOptions.gridMinSize;
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
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var __extends = this && this.__extends || function(d, b) {
                    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
                var Utils_1 = __webpack_require__(16);
                var Mesh = THREE.Mesh;
                var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
                var MeshBasicMaterial = THREE.MeshBasicMaterial;
                var TrendsWidget_1 = __webpack_require__(27);
                var Trend_1 = __webpack_require__(19);
                var TrendsLoadingWidget = function(_super) {
                    __extends(TrendsLoadingWidget, _super);
                    function TrendsLoadingWidget() {
                        _super.apply(this, arguments);
                    }
                    TrendsLoadingWidget.prototype.getTrendWidgetClass = function() {
                        return TrendLoading;
                    };
                    TrendsLoadingWidget.widgetName = "TrendsLoading";
                    return TrendsLoadingWidget;
                }(TrendsWidget_1.TrendsWidget);
                exports.TrendsLoadingWidget = TrendsLoadingWidget;
                var TrendLoading = function(_super) {
                    __extends(TrendLoading, _super);
                    function TrendLoading(state, trendName) {
                        _super.call(this, state, trendName);
                        this.isActive = false;
                        this.mesh = new Mesh(new PlaneBufferGeometry(32, 32), new MeshBasicMaterial({
                            map: TrendLoading.createTexture(),
                            transparent: true
                        }));
                        this.deactivate();
                    }
                    TrendLoading.widgetIsEnabled = function(trendOptions, chartState) {
                        return trendOptions.enabled && chartState.data.animations.enabled;
                    };
                    TrendLoading.prototype.getObject3D = function() {
                        return this.mesh;
                    };
                    TrendLoading.prototype.bindEvents = function() {
                        var _this = this;
                        _super.prototype.bindEvents.call(this);
                        this.bindEvent(this.trend.onPrependRequest(function() {
                            return _this.activate();
                        }));
                    };
                    TrendLoading.prototype.prependData = function() {
                        this.deactivate();
                    };
                    TrendLoading.prototype.activate = function() {
                        var mesh = this.mesh;
                        mesh.material.opacity = 1;
                        mesh.rotation.z = 0;
                        var animation = TweenLite.to(this.mesh.rotation, .5, {
                            z: Math.PI * 2
                        });
                        animation.eventCallback("onComplete", function() {
                            animation.restart();
                        });
                        this.animation = animation;
                        this.isActive = true;
                        this.updatePosition();
                    };
                    TrendLoading.prototype.deactivate = function() {
                        this.animation && this.animation.kill();
                        this.mesh.material.opacity = 0;
                        this.isActive = false;
                    };
                    TrendLoading.createTexture = function() {
                        var h = 64, w = 64;
                        return Utils_1.Utils.createTexture(h, w, function(ctx) {
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
                    TrendLoading.prototype.onZoomFrame = function() {
                        this.updatePosition();
                    };
                    TrendLoading.prototype.updatePosition = function() {
                        if (!this.isActive) return;
                        var trend = this.trend;
                        var segment = trend.segments.getStartSegment();
                        var x, y;
                        if (trend.getOptions().type == Trend_1.TREND_TYPE.LINE) {
                            x = segment.currentAnimationState.startXVal;
                            y = segment.currentAnimationState.startYVal;
                        } else {
                            x = segment.currentAnimationState.xVal - segment.maxLength;
                            y = segment.currentAnimationState.yVal;
                        }
                        var pointVector = this.chartState.screen.getPointOnChart(x, y);
                        this.mesh.position.set(pointVector.x, pointVector.y, 0);
                    };
                    return TrendLoading;
                }(TrendsWidget_1.TrendWidget);
                exports.TrendLoading = TrendLoading;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var __extends = this && this.__extends || function(d, b) {
                    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
                var Widget_1 = __webpack_require__(17);
                var Object3D = THREE.Object3D;
                var TrendsWidget = function(_super) {
                    __extends(TrendsWidget, _super);
                    function TrendsWidget(state) {
                        _super.call(this, state);
                        this.widgets = {};
                        this.object3D = new Object3D();
                        this.onTrendsChange();
                    }
                    TrendsWidget.prototype.bindEvents = function() {
                        var _this = this;
                        var state = this.chartState;
                        state.onTrendsChange(function() {
                            return _this.onTrendsChange();
                        });
                        state.onTrendChange(function(trendName, changedOptions, newData) {
                            _this.onTrendChange(trendName, changedOptions, newData);
                        });
                    };
                    TrendsWidget.prototype.onTrendsChange = function() {
                        var trendsOptions = this.chartState.data.trends;
                        var TrendWidgetClass = this.getTrendWidgetClass();
                        for (var trendName in trendsOptions) {
                            var trendOptions = trendsOptions[trendName];
                            var widgetCanBeEnabled = TrendWidgetClass.widgetIsEnabled(trendOptions, this.chartState);
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
                            var data = this.chartState.getTrend(trendName).getData();
                            var isAppend = !data.length || data[0].xVal < newData[0].xVal;
                            isAppend ? widget.appendData(newData) : widget.prependData(newData);
                        }
                    };
                    TrendsWidget.prototype.getObject3D = function() {
                        return this.object3D;
                    };
                    TrendsWidget.prototype.createTrendWidget = function(trendName) {
                        var WidgetConstructor = this.getTrendWidgetClass();
                        var widget = new WidgetConstructor(this.chartState, trendName);
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
                    function TrendWidget(chartState, trendName) {
                        this.chartState = chartState;
                        this.trendName = trendName;
                        this.unsubscribers = [];
                        this.trend = chartState.trendsManager.getTrend(trendName);
                        this.chartState = chartState;
                        this.bindEvents();
                    }
                    TrendWidget.widgetIsEnabled = function(trendOptions, chartState) {
                        return trendOptions.enabled;
                    };
                    TrendWidget.prototype.appendData = function(newData) {};
                    TrendWidget.prototype.prependData = function(newData) {};
                    TrendWidget.prototype.onTrendChange = function(changedOptions) {};
                    TrendWidget.prototype.onDestroy = function() {
                        for (var _i = 0, _a = this.unsubscribers; _i < _a.length; _i++) {
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
                        this.bindEvent(this.trend.segments.onAnimationFrame(function(trendPoints) {
                            return _this.onSegmentsAnimate(trendPoints);
                        }));
                        this.bindEvent(this.chartState.screen.onTransformationFrame(function(options) {
                            return _this.onTransformationFrame(options);
                        }));
                        this.bindEvent(this.chartState.screen.onZoomFrame(function(options) {
                            return _this.onZoomFrame(options);
                        }));
                        this.bindEvent(this.chartState.onZoom(function() {
                            return _this.onZoom();
                        }));
                    };
                    TrendWidget.prototype.bindEvent = function(unsubscriber) {
                        this.unsubscribers.push(unsubscriber);
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
                var Widget_1 = __webpack_require__(17);
                var Object3D = THREE.Object3D;
                var Geometry = THREE.Geometry;
                var LineBasicMaterial = THREE.LineBasicMaterial;
                var Vector3 = THREE.Vector3;
                var Utils_1 = __webpack_require__(16);
                var Line = THREE.Line;
                var Mesh = THREE.Mesh;
                var interfaces_1 = __webpack_require__(23);
                var AxisMarksWidget = function(_super) {
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
                    AxisMarksWidget.prototype.createAxisMark = function(axisMark) {
                        var axisMarkWidget = new AxisMarkWidget(this.chartState, axisMark);
                        this.axisMarksWidgets.push(axisMarkWidget);
                        this.object3D.add(axisMarkWidget.getObject3D());
                    };
                    AxisMarksWidget.prototype.bindEvents = function() {
                        var _this = this;
                        this.bindEvent(this.chartState.screen.onTransformationFrame(function() {
                            return _this.updateMarksPositions();
                        }), this.chartState.onResize(function() {
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
                            color: Utils_1.Utils.getHexColor(lineColor),
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
                        var animations = this.chartState.data.animations;
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
                        var _a = this.chartState.data, width = _a.width, height = _a.height;
                        if (isXAxis) {
                            this.object3D.position.x = screen.getPointOnXAxis(this.frameValue);
                            this.object3D.position.y = screen.getBottom();
                            lineGeometry.vertices[1].setY(height);
                            this.indicator.position.set(this.indicatorWidth / 2, chartState.data.height - this.indicatorHeight / 2, INDICATOR_POS_Z);
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
                var __extends = this && this.__extends || function(d, b) {
                    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
                var Widget_1 = __webpack_require__(17);
                var LineSegments = THREE.LineSegments;
                var Vector3 = THREE.Vector3;
                var BorderWidget = function(_super) {
                    __extends(BorderWidget, _super);
                    function BorderWidget(chartState) {
                        _super.call(this, chartState);
                        var _a = chartState.data, width = _a.width, height = _a.height;
                        var geometry = new THREE.Geometry();
                        var material = new THREE.LineBasicMaterial({
                            linewidth: 1,
                            opacity: 0,
                            transparent: true
                        });
                        geometry.vertices.push(new Vector3(0, 0, 0), new Vector3(0, height, 0), new Vector3(0, height, 0), new Vector3(width, height, 0), new Vector3(width, height, 0), new Vector3(width, 0, 0), new Vector3(width, 0, 0), new Vector3(0, 0, 0), new Vector3(width / 2, height, 0), new Vector3(width / 2, 0, 0));
                        this.lineSegments = new LineSegments(geometry, material);
                    }
                    BorderWidget.prototype.getObject3D = function() {
                        return this.lineSegments;
                    };
                    BorderWidget.widgetName = "Border";
                    return BorderWidget;
                }(Widget_1.ChartWidget);
                exports.BorderWidget = BorderWidget;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var __extends = this && this.__extends || function(d, b) {
                    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
                var Utils_1 = __webpack_require__(16);
                var Mesh = THREE.Mesh;
                var TrendsWidget_1 = __webpack_require__(27);
                var Color = THREE.Color;
                var CANVAS_WIDTH = 128;
                var CANVAS_HEIGHT = 64;
                var OFFSET_X = 15;
                var TrendsIndicatorWidget = function(_super) {
                    __extends(TrendsIndicatorWidget, _super);
                    function TrendsIndicatorWidget() {
                        _super.apply(this, arguments);
                    }
                    TrendsIndicatorWidget.prototype.getTrendWidgetClass = function() {
                        return TrendIndicator;
                    };
                    TrendsIndicatorWidget.widgetName = "TrendsIndicator";
                    return TrendsIndicatorWidget;
                }(TrendsWidget_1.TrendsWidget);
                exports.TrendsIndicatorWidget = TrendsIndicatorWidget;
                var TrendIndicator = function(_super) {
                    __extends(TrendIndicator, _super);
                    function TrendIndicator(state, trendName) {
                        _super.call(this, state, trendName);
                        this.initObject();
                        this.onTrendChange();
                    }
                    TrendIndicator.widgetIsEnabled = function(trendOptions) {
                        return trendOptions.enabled && trendOptions.hasIndicator;
                    };
                    TrendIndicator.prototype.getObject3D = function() {
                        return this.mesh;
                    };
                    TrendIndicator.prototype.onTrendChange = function() {
                        var trendData = this.trend.getData();
                        var lastItem = trendData[trendData.length - 1];
                        var texture = this.mesh.material.map;
                        var ctx = texture.image.getContext("2d");
                        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                        ctx.fillText(lastItem.yVal.toFixed(4), 0, 15);
                        texture.needsUpdate = true;
                    };
                    TrendIndicator.prototype.initObject = function() {
                        var color = new Color(this.trend.getOptions().lineColor);
                        var texture = Utils_1.Utils.createPixelPerfectTexture(CANVAS_WIDTH, CANVAS_HEIGHT, function(ctx) {
                            ctx.beginPath();
                            ctx.font = "15px Arial";
                            ctx.fillStyle = color.getStyle();
                            ctx.strokeStyle = "rgba(255,255,255,0.95)";
                        });
                        var material = new THREE.MeshBasicMaterial({
                            map: texture,
                            side: THREE.FrontSide
                        });
                        material.transparent = true;
                        this.mesh = new Mesh(new THREE.PlaneGeometry(CANVAS_WIDTH, CANVAS_HEIGHT), material);
                    };
                    TrendIndicator.prototype.onTransformationFrame = function() {
                        this.segment = this.trend.segments.getEndSegment();
                        this.updatePosition();
                    };
                    TrendIndicator.prototype.onSegmentsAnimate = function(segments) {
                        this.segment = segments.getEndSegment();
                        this.updatePosition();
                    };
                    TrendIndicator.prototype.updatePosition = function() {
                        var state = this.chartState;
                        var _a = this.segment.currentAnimationState, segmentEndXVal = _a.endXVal, segmentEndYVal = _a.endYVal;
                        var endPointVector = state.screen.getPointOnChart(segmentEndXVal, segmentEndYVal);
                        var screenWidth = state.data.width;
                        var x = endPointVector.x + OFFSET_X;
                        var y = endPointVector.y;
                        var screenX = state.screen.getScreenXByPoint(endPointVector.x);
                        var indicatorIsOutOfScreen = screenX < 0 || screenX > screenWidth;
                        if (indicatorIsOutOfScreen) {
                            if (screenX < 0) x = state.screen.getPointByScreenX(0) + 20;
                            if (screenX > screenWidth) x = state.screen.getPointByScreenX(screenWidth) - CANVAS_WIDTH / 2 - 10;
                            y -= 25;
                        }
                        this.mesh.position.set(x + CANVAS_WIDTH / 2, y + CANVAS_HEIGHT / 2 - 30, .1);
                    };
                    return TrendIndicator;
                }(TrendsWidget_1.TrendWidget);
                exports.TrendIndicator = TrendIndicator;
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
                var TrendsWidget_1 = __webpack_require__(27);
                var LineSegments = THREE.LineSegments;
                var Trend_1 = __webpack_require__(19);
                var Utils_1 = __webpack_require__(16);
                var MAX_DISPLAYED_SEGMENTS = 2e3;
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
                    function TrendLine(chartState, trendName) {
                        _super.call(this, chartState, trendName);
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
                        this.bindEvent(this.trend.segments.onRebuild(function() {
                            _this.destroySegments();
                            _this.setupSegments();
                        }));
                        this.bindEvent(this.trend.segments.onDisplayedRangeChanged(function() {
                            _this.setupSegments();
                        }));
                    };
                    TrendLine.prototype.initLine = function() {
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
                    TrendLine.prototype.setupSegments = function() {
                        var geometry = this.lineSegments.geometry;
                        var _a = this.trend.segments, firstDisplayedSegment = _a.firstDisplayedSegment, lastDisplayedSegment = _a.lastDisplayedSegment;
                        for (var segmentId in this.displayedSegments) {
                            var lineSegment = this.displayedSegments[segmentId];
                            var segment_1 = this.trend.segments.segments[lineSegment.segmentId];
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
                        if (options.zoomX) currentScale.setX(this.scaleXFactor * options.zoomX);
                        if (options.zoomY) currentScale.setY(this.scaleYFactor * options.zoomY);
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
                        return xVal - this.chartState.data.xAxis.range.zeroVal;
                    };
                    TrendLine.prototype.toLocalY = function(yVal) {
                        return yVal - this.chartState.data.yAxis.range.zeroVal;
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
                var TrendsWidget_1 = __webpack_require__(27);
                var Object3D = THREE.Object3D;
                var Geometry = THREE.Geometry;
                var Vector3 = THREE.Vector3;
                var Mesh = THREE.Mesh;
                var Line = THREE.Line;
                var MeshBasicMaterial = THREE.MeshBasicMaterial;
                var PlaneGeometry = THREE.PlaneGeometry;
                var Trend_1 = __webpack_require__(19);
                var LineBasicMaterial = THREE.LineBasicMaterial;
                var Utils_1 = __webpack_require__(16);
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
                        this.bindEvent(this.trend.segments.onRebuild(function() {
                            _this.destroyCandles();
                            _this.setupCandles();
                        }));
                        this.bindEvent(this.trend.segments.onDisplayedRangeChanged(function() {
                            _this.setupCandles();
                        }));
                    };
                    TrendCandlesWidget.prototype.initObject = function() {
                        var stateData = this.chartState.data;
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
                        var _a = this.trend.segments, firstDisplayedSegment = _a.firstDisplayedSegment, lastDisplayedSegment = _a.lastDisplayedSegment;
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
                        return xVal - this.chartState.data.xAxis.range.zeroVal;
                    };
                    TrendCandlesWidget.prototype.toLocalY = function(yVal) {
                        return yVal - this.chartState.data.yAxis.range.zeroVal;
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
                var __extends = this && this.__extends || function(d, b) {
                    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
                var Utils_1 = __webpack_require__(16);
                var Mesh = THREE.Mesh;
                var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
                var MeshBasicMaterial = THREE.MeshBasicMaterial;
                var TrendsWidget_1 = __webpack_require__(27);
                var Trend_1 = __webpack_require__(19);
                var TrendsBeaconWidget = function(_super) {
                    __extends(TrendsBeaconWidget, _super);
                    function TrendsBeaconWidget() {
                        _super.apply(this, arguments);
                    }
                    TrendsBeaconWidget.prototype.getTrendWidgetClass = function() {
                        return TrendBeacon;
                    };
                    TrendsBeaconWidget.widgetName = "TrendsBeacon";
                    return TrendsBeaconWidget;
                }(TrendsWidget_1.TrendsWidget);
                exports.TrendsBeaconWidget = TrendsBeaconWidget;
                var TrendBeacon = function(_super) {
                    __extends(TrendBeacon, _super);
                    function TrendBeacon(state, trendName) {
                        _super.call(this, state, trendName);
                        this.initObject();
                        if (state.data.animations.enabled) {
                            this.animate();
                        }
                        this.updatePosition();
                    }
                    TrendBeacon.widgetIsEnabled = function(trendOptions) {
                        return trendOptions.enabled && trendOptions.hasBeacon && trendOptions.type == Trend_1.TREND_TYPE.LINE;
                    };
                    TrendBeacon.prototype.getObject3D = function() {
                        return this.mesh;
                    };
                    TrendBeacon.prototype.onTrendChange = function() {
                        this.updatePosition();
                    };
                    TrendBeacon.prototype.bindEvents = function() {
                        var _this = this;
                        _super.prototype.bindEvents.call(this);
                        this.bindEvent(this.chartState.onScroll(function() {
                            return _this.updatePosition();
                        }));
                        this.bindEvent(this.chartState.onChange(function(changedProps) {
                            return _this.onStateChange(changedProps);
                        }));
                        this.bindEvent(this.chartState.onDestroy(function() {
                            return _this.stopAnimation();
                        }));
                    };
                    TrendBeacon.prototype.initObject = function() {
                        var light = this.mesh = new Mesh(new PlaneBufferGeometry(32, 32), new MeshBasicMaterial({
                            map: TrendBeacon.createTexture(),
                            transparent: true
                        }));
                        light.scale.set(.2, .2, 1);
                        light.add(new Mesh(new PlaneBufferGeometry(5, 5), new MeshBasicMaterial({
                            map: TrendBeacon.createTexture()
                        })));
                        this.segment = this.trend.segments.getEndSegment();
                    };
                    TrendBeacon.prototype.animate = function() {
                        var _this = this;
                        this.animated = true;
                        var object = this.mesh;
                        var animationObject = {
                            scale: object.scale.x,
                            opacity: object.material.opacity
                        };
                        this.mesh.scale.set(.1, .1, 1);
                        setTimeout(function() {
                            var animation = _this.animation = TweenLite.to(animationObject, 1, {
                                scale: 1,
                                opacity: 0
                            });
                            animation.eventCallback("onUpdate", function() {
                                object.scale.set(animationObject.scale, animationObject.scale, 1);
                                object.material.opacity = animationObject.opacity;
                            }).eventCallback("onComplete", function() {
                                _this.animation && animation.restart();
                            });
                        }, 500);
                    };
                    TrendBeacon.prototype.stopAnimation = function() {
                        this.animated = false;
                        this.animation && this.animation.kill();
                        this.animation = null;
                    };
                    TrendBeacon.createTexture = function() {
                        var h = 32, w = 32;
                        return Utils_1.Utils.createTexture(h, w, function(ctx) {
                            ctx.beginPath();
                            ctx.arc(w / 2, h / 2, w / 2, 0, 2 * Math.PI, false);
                            ctx.fillStyle = "white";
                            ctx.fill();
                        });
                    };
                    TrendBeacon.prototype.onTransformationFrame = function() {
                        this.segment = this.trend.segments.getEndSegment();
                        this.updatePosition();
                    };
                    TrendBeacon.prototype.onSegmentsAnimate = function(trendsSegments) {
                        this.segment = trendsSegments.getEndSegment();
                        this.updatePosition();
                    };
                    TrendBeacon.prototype.onStateChange = function(changedProps) {
                        if (!changedProps.animations) return;
                        if (changedProps.animations.enabled == void 0 || changedProps.animations.enabled == this.animated) return;
                        if (changedProps.animations.enabled) {
                            this.animate();
                        } else {
                            this.stopAnimation();
                        }
                    };
                    TrendBeacon.prototype.updatePosition = function() {
                        var state = this.chartState;
                        var xVal, yVal;
                        var currentAnimationState = this.segment.currentAnimationState;
                        if (this.trend.getOptions().type == Trend_1.TREND_TYPE.LINE) {
                            xVal = currentAnimationState.endXVal;
                            yVal = currentAnimationState.endYVal;
                        } else {
                            xVal = currentAnimationState.xVal;
                            yVal = currentAnimationState.endYVal;
                        }
                        var endPointVector = state.screen.getPointOnChart(xVal, yVal);
                        var screenWidth = state.data.width;
                        var x = endPointVector.x;
                        var screenX = state.screen.getScreenXByPoint(endPointVector.x);
                        if (screenX < 0) x = state.screen.getPointByScreenX(0);
                        if (screenX > screenWidth) x = state.screen.getPointByScreenX(screenWidth);
                        this.mesh.position.set(x, endPointVector.y, .1);
                    };
                    return TrendBeacon;
                }(TrendsWidget_1.TrendWidget);
                exports.TrendBeacon = TrendBeacon;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                function __export(m) {
                    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                __export(__webpack_require__(3));
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var Utils_1 = __webpack_require__(16);
                var EventEmmiter_1 = __webpack_require__(15);
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
                    ChartPlugin.prototype.setupChartState = function(chartState) {
                        var _this = this;
                        this.chartState = chartState;
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.bindEvent(this.chartState.onInitialStateApplied(function(initialState) {
                            return _this.onInitialStateAppliedHandler(initialState);
                        }), this.chartState.onReady(function() {
                            return _this.onChartReadyHandler();
                        }), this.chartState.onDestroy(function() {
                            return _this.onDestroyHandler();
                        }), this.chartState.onPluginsStateChange(function(changedPluginsStates) {
                            return changedPluginsStates[_this.name] && _this.onStateChanged(changedPluginsStates[_this.name]);
                        }));
                    };
                    ChartPlugin.prototype.getOptions = function() {
                        return this.chartState.data.pluginsState[this.name];
                    };
                    ChartPlugin.prototype.onInitialStateAppliedHandler = function(initialState) {};
                    ChartPlugin.prototype.onChartReadyHandler = function() {};
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
                    ChartPlugin.pluginWidgets = [];
                    return ChartPlugin;
                }();
                exports.ChartPlugin = ChartPlugin;
            } ]);
        });
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var three_chart_1 = __webpack_require__(2);
        var Geometry = THREE.Geometry;
        var Mesh = THREE.Mesh;
        var Object3D = THREE.Object3D;
        var TrendsMarksPlugin_1 = __webpack_require__(1);
        var MAX_MARKS_IN_ROW = 3;
        var TrendsMarksWidget = function(_super) {
            __extends(TrendsMarksWidget, _super);
            function TrendsMarksWidget() {
                _super.apply(this, arguments);
            }
            TrendsMarksWidget.prototype.getTrendWidgetClass = function() {
                return TrendMarksWidget;
            };
            TrendsMarksWidget.widgetName = "TrendsMarks";
            return TrendsMarksWidget;
        }(three_chart_1.TrendsWidget);
        exports.TrendsMarksWidget = TrendsMarksWidget;
        var TrendMarksWidget = function(_super) {
            __extends(TrendMarksWidget, _super);
            function TrendMarksWidget(chartState, trendName) {
                _super.call(this, chartState, trendName);
                this.marksWidgets = {};
                this.object3D = new Object3D();
                this.onMarksChange();
            }
            TrendMarksWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            TrendMarksWidget.prototype.bindEvents = function() {
                var _this = this;
                _super.prototype.bindEvents.call(this);
                this.getTrendsMarksPlugin().onChange(function() {
                    return _this.onMarksChange();
                });
            };
            TrendMarksWidget.prototype.getTrendsMarksPlugin = function() {
                return this.chartState.getPlugin(TrendsMarksPlugin_1.TrendsMarksPlugin.NAME);
            };
            TrendMarksWidget.prototype.onMarksChange = function() {
                var marksItems = this.getTrendsMarksPlugin().getItems();
                var widgets = this.marksWidgets;
                var actualMarksNames = [];
                for (var markName in marksItems) {
                    actualMarksNames.push(markName);
                    if (!widgets[markName]) this.createMarkWidget(marksItems[markName]);
                }
                for (var markName in this.marksWidgets) {
                    if (actualMarksNames.indexOf(markName) !== -1) continue;
                    this.destroyMarkWidget(markName);
                }
            };
            TrendMarksWidget.prototype.createMarkWidget = function(mark) {
                if (!mark.segment) return;
                var markWidget = new TrendMarkWidget(this.chartState, mark);
                this.marksWidgets[mark.options.name] = markWidget;
                this.object3D.add(markWidget.getObject3D());
            };
            TrendMarksWidget.prototype.destroyMarkWidget = function(markName) {
                this.object3D.remove(this.marksWidgets[markName].getObject3D());
                delete this.marksWidgets[markName];
            };
            TrendMarksWidget.prototype.onZoomFrame = function() {
                var widgets = this.marksWidgets;
                for (var markName in widgets) {
                    widgets[markName].onZoomFrameHandler();
                }
            };
            TrendMarksWidget.prototype.onSegmentsAnimate = function() {
                var widgets = this.marksWidgets;
                for (var markName in widgets) {
                    widgets[markName].onSegmentsAnimate();
                }
            };
            return TrendMarksWidget;
        }(three_chart_1.TrendWidget);
        exports.TrendMarksWidget = TrendMarksWidget;
        var TrendMarkWidget = function() {
            function TrendMarkWidget(chartState, trendMark) {
                this.markHeight = 74;
                this.markWidth = 150;
                this.position = {
                    lineHeight: 30,
                    x: 0,
                    y: 0
                };
                this.chartState = chartState;
                this.mark = trendMark;
                this.initObject();
                this.show();
            }
            TrendMarkWidget.prototype.initObject = function() {
                this.object3D = new Object3D();
                this.markMesh = this.createMarkMesh();
                this.line = this.createMarkLine();
                this.object3D.add(this.markMesh);
                this.object3D.add(this.line);
            };
            TrendMarkWidget.prototype.createMarkMesh = function() {
                var _a = this, markHeight = _a.markHeight, markWidth = _a.markWidth;
                var mark = this.mark.options;
                var isTopSide = mark.orientation == TrendsMarksPlugin_1.TREND_MARK_SIDE.TOP;
                var texture = three_chart_1.Utils.createPixelPerfectTexture(markWidth, markHeight, function(ctx) {
                    var circleOffset = isTopSide ? 30 : 0;
                    var circleR = 22;
                    var circleX = markWidth / 2;
                    var circleY = circleOffset + circleR;
                    var textOffset = isTopSide ? 10 : circleR * 2 + 15;
                    ctx.beginPath();
                    ctx.textAlign = "center";
                    ctx.font = "11px Arial";
                    ctx.fillStyle = "rgba(255,255,255, 0.6)";
                    ctx.fillText(mark.title, circleX, textOffset);
                    ctx.fillStyle = mark.descriptionColor;
                    ctx.fillText(mark.description, circleX, textOffset + 12);
                    ctx.beginPath();
                    ctx.fillStyle = mark.iconColor;
                    ctx.arc(circleX, circleY, circleR, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.font = "19px Arial";
                    ctx.fillStyle = "rgb(255, 255, 255)";
                    ctx.fillText(mark.icon, circleX, circleY + 7);
                });
                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.FrontSide
                });
                material.transparent = true;
                var mesh = new Mesh(new THREE.PlaneGeometry(markWidth, markHeight), material);
                var offset = this.mark.options.orientation == TrendsMarksPlugin_1.TREND_MARK_SIDE.TOP ? this.mark.offset : -this.mark.offset;
                return mesh;
            };
            TrendMarkWidget.prototype.createMarkLine = function() {
                var lineGeometry = new Geometry();
                lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, this.mark.offset, 0));
                lineGeometry.computeLineDistances();
                var lineMaterial = new THREE.LineDashedMaterial({
                    dashSize: 1,
                    gapSize: 4,
                    transparent: true,
                    opacity: .6
                });
                var line = new THREE.Line(lineGeometry, lineMaterial);
                line.position.setZ(-.1);
                return line;
            };
            TrendMarkWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            TrendMarkWidget.prototype.onSegmentsAnimate = function() {
                this.updatePosition();
            };
            TrendMarkWidget.prototype.onZoomFrameHandler = function() {
                this.updatePosition();
            };
            TrendMarkWidget.prototype.updatePosition = function() {
                if (!this.mark.segment) return;
                var mark = this.mark;
                var meshMaterial = this.markMesh.material;
                var lineMaterial = this.line.material;
                if (mark.row >= MAX_MARKS_IN_ROW - 1) {
                    meshMaterial.opacity = 0;
                    lineMaterial.opacity = 0;
                } else {
                    meshMaterial.opacity = 1;
                    lineMaterial.opacity = 1;
                }
                var screen = this.chartState.screen;
                var posX = screen.getPointOnXAxis(mark.xVal);
                var posY = screen.getPointOnYAxis(mark.yVal);
                var lineGeometry = this.line.geometry;
                if (mark.options.orientation == TrendsMarksPlugin_1.TREND_MARK_SIDE.TOP) {
                    this.markMesh.position.setY(this.markHeight / 2 + mark.offset);
                    lineGeometry.vertices[1].setY(mark.offset);
                } else {
                    this.markMesh.position.setY(-mark.offset - this.markHeight / 2);
                    lineGeometry.vertices[1].setY(-mark.offset);
                }
                lineGeometry.verticesNeedUpdate = true;
                lineGeometry.lineDistancesNeedUpdate = true;
                lineGeometry.computeLineDistances();
                this.object3D.position.set(posX, posY, 0);
            };
            TrendMarkWidget.prototype.show = function() {
                if (!this.mark.segment) return;
                this.updatePosition();
                var animations = this.chartState.data.animations;
                var time = animations.enabled ? 1 : 0;
                this.object3D.scale.set(.01, .01, 1);
                TweenLite.to(this.object3D.scale, time, {
                    x: 1,
                    y: 1,
                    ease: Elastic.easeOut
                });
            };
            return TrendMarkWidget;
        }();
    } ]);
});


//# sourceMappingURL=TrendsMarksPlugin.js.map