(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(require("three-charts")); else if (typeof define === "function" && define.amd) define([ "three-charts" ], factory); else if (typeof exports === "object") exports["TrendsMarksPlugin"] = factory(require("three-charts")); else root["THREE_CHARTS"] = root["THREE_CHARTS"] || {}, 
    root["THREE_CHARTS"]["TrendsMarksPlugin"] = factory(root["three-charts"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
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
        __export(__webpack_require__(5));
    }, , function(module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_2__;
    }, , , function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var three_charts_1 = __webpack_require__(2);
        var TrendsMarksWidget_1 = __webpack_require__(6);
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
            color: "rgb(40,136,75)",
            xVal: 0,
            orientation: TREND_MARK_SIDE.TOP,
            width: 85,
            height: 200,
            margin: 10,
            onRender: TrendsMarksWidget_1.DEFAULT_RENDERER
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
                this.chart.setState({
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
                this.chart.trendsManager.onSegmentsRebuilded(function() {
                    return _this.updateMarksSegments();
                });
                this.chart.screen.onZoomFrame(function() {
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
                        options.name = three_charts_1.Utils.getUid().toString();
                        actualMarksNames.push(options.name);
                        if (marks[options.name]) three_charts_1.Utils.error("duplicated mark name " + options.name);
                    } else if (marks[options.name]) {
                        actualMarksNames.push(options.name);
                        continue;
                    }
                    options = three_charts_1.Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
                    var mark = new TrendMark(this.chart, options);
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
                var chart = this.chart;
                var options = mark.options;
                var width = options.width, height = options.height, name = options.name;
                var left = chart.getPointOnXAxis(mark.xVal) - width / 2;
                var top = chart.getPointOnYAxis(mark.yVal);
                var isTopSideMark = options.orientation == TREND_MARK_SIDE.TOP;
                var newOffset;
                var row = 0;
                if (isTopSideMark) {
                    top += height;
                }
                var markRect = [ left, top, width, height ];
                var hasIntersection = false;
                do {
                    for (var markName in this.rects) {
                        var rect = this.rects[markName];
                        hasIntersection = three_charts_1.Utils.rectsIntersect(rect, markRect);
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
                    newOffset = markRect[1] - markRect[3] - chart.getPointOnYAxis(mark.yVal);
                } else {
                    newOffset = chart.getPointOnYAxis(mark.yVal) - markRect[1];
                }
                mark._setOffset(newOffset);
                mark._setRow(row);
                this.rects[name] = markRect;
            };
            TrendsMarksPlugin.prototype.updateMarksSegments = function() {
                var chart = this.chart;
                var trends = chart.trendsManager.trends;
                for (var trendName in trends) {
                    var marks = this.getTrendMarks(trendName);
                    var marksArr = [];
                    var xVals = [];
                    for (var markName in marks) {
                        var mark = marks[markName];
                        xVals.push(mark.options.xVal);
                        marksArr.push(mark);
                        mark._setSegment(null);
                    }
                    marksArr.sort(function(a, b) {
                        return a.options.xVal - b.options.xVal;
                    });
                    var trend = chart.getTrend(trendName);
                    var points = trend.segmentsManager.getSegmentsForXValues(xVals.sort(function(a, b) {
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
            TrendsMarksPlugin.providedWidgets = [ TrendsMarksWidget_1.TrendsMarksWidget ];
            return TrendsMarksPlugin;
        }(three_charts_1.ChartPlugin);
        exports.TrendsMarksPlugin = TrendsMarksPlugin;
        var TrendMark = function() {
            function TrendMark(chart, options) {
                this.row = 0;
                this.options = options;
                this.chart = chart;
            }
            TrendMark.prototype._setSegment = function(segment) {
                this.segment = segment;
                if (!segment) return;
                var trend = this.chart.getTrend(this.options.trendName);
                if (trend.getOptions().type == three_charts_1.TREND_TYPE.LINE) {
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
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var three_charts_1 = __webpack_require__(2);
        var Mesh = THREE.Mesh;
        var Object3D = THREE.Object3D;
        var TrendsMarksPlugin_1 = __webpack_require__(5);
        var Color_1 = __webpack_require__(7);
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
        }(three_charts_1.TrendsWidget);
        exports.TrendsMarksWidget = TrendsMarksWidget;
        var TrendMarksWidget = function(_super) {
            __extends(TrendMarksWidget, _super);
            function TrendMarksWidget(chart, trendName) {
                _super.call(this, chart, trendName);
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
                return this.chart.getPlugin(TrendsMarksPlugin_1.TrendsMarksPlugin.NAME);
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
                var markWidget = new TrendMarkWidget(this.chart, mark);
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
        }(three_charts_1.TrendWidget);
        exports.TrendMarksWidget = TrendMarksWidget;
        var TrendMarkWidget = function() {
            function TrendMarkWidget(chart, trendMark) {
                this.chart = chart;
                this.mark = trendMark;
                this.initObject();
                this.show();
            }
            TrendMarkWidget.prototype.initObject = function() {
                var _this = this;
                var options = this.mark.options;
                var width = options.width, height = options.height;
                var texture = three_charts_1.Utils.createPixelPerfectTexture(width, height, function(ctx) {
                    options.onRender([ _this.mark ], ctx, _this.chart);
                });
                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.FrontSide
                });
                material.transparent = true;
                this.markMesh = new Mesh(new THREE.PlaneGeometry(width, height), material);
            };
            TrendMarkWidget.prototype.getObject3D = function() {
                return this.markMesh;
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
                var options = this.mark.options;
                var screen = this.chart.screen;
                var posX = screen.getPointOnXAxis(mark.xVal);
                var posY = screen.getPointOnYAxis(mark.yVal);
                this.markMesh.position.set(posX, posY, 0);
            };
            TrendMarkWidget.prototype.show = function() {
                if (!this.mark.segment) return;
                this.updatePosition();
                var animations = this.chart.state.animations;
                var time = animations.enabled ? 1 : 0;
                this.markMesh.scale.set(.01, .01, 1);
                TweenLite.to(this.markMesh.scale, time, {
                    x: 1,
                    y: 1,
                    ease: Elastic.easeOut
                });
            };
            return TrendMarkWidget;
        }();
        exports.DEFAULT_RENDERER = function(marks, ctx, chart) {
            var mark = marks[0];
            var options = mark.options;
            var isTopSide = options.orientation == TrendsMarksPlugin_1.TREND_MARK_SIDE.TOP;
            var color = options.color !== void 0 ? new Color_1.Color(options.color) : new Color_1.Color(chart.getTrend(options.trendName).getOptions().lineColor);
            var rgbaColor = color.getTransparent(.5).rgbaStr;
            var width = options.width, height = options.height;
            var centerX = Math.round(width / 2);
            var centerY = Math.round(height / 2);
            var font = chart.state.font.m;
            var textOffset = parseInt(font);
            var textPosX = centerX;
            var textPosY = isTopSide ? textOffset * 1.3 : height - textOffset * .7;
            ctx.fillStyle = rgbaColor;
            ctx.strokeStyle = rgbaColor;
            ctx.fillRect(0, isTopSide ? 0 : height, width, isTopSide ? textOffset * 2 : -textOffset * 2);
            ctx.beginPath();
            ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI, false);
            ctx.fill();
            var lineEndY = textPosY;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(textPosX, lineEndY);
            ctx.stroke();
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.font = font;
            ctx.fillStyle = "white";
            ctx.strokeStyle = "white";
            ctx.fillText(options.title, Math.round(textPosX), Math.round(textPosY));
        };
    }, function(module, exports) {
        "use strict";
        var Color = function() {
            function Color(color) {
                this.set(color);
            }
            /**!
	     * @preserve $.parseColor
	     * Copyright 2011 THEtheChad Elliott
	     * Released under the MIT and GPL licenses.
	     */
            Color.parseColor = function(color) {
                var cache, p = parseInt, color = color.replace(/\s\s*/g, "");
                if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)) cache = [ p(cache[1], 16), p(cache[2], 16), p(cache[3], 16) ]; else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)) cache = [ p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17 ]; else if (cache = /^rgba\(#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2}),(([0-9]*[.])?[0-9]+)/.exec(color)) cache = [ p(cache[1], 16), p(cache[2], 16), p(cache[3], 16), +cache[4] ]; else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)) cache = [ +cache[1], +cache[2], +cache[3], +cache[4] ]; else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)) cache = [ +cache[1], +cache[2], +cache[3] ]; else throw Error(color + " is not supported by parseColor");
                isNaN(cache[3]) && (cache[3] = 1);
                return cache;
            };
            Color.numberToHexStr = function(value) {
                var result = value.toString(16);
                return "#" + "0".repeat(6 - result.length) + result;
            };
            Color.prototype.set = function(color) {
                if (typeof color == "number") color = Color.numberToHexStr(color);
                var colorStr = color;
                var rgba = Color.parseColor(colorStr);
                this.r = rgba[0];
                this.g = rgba[1];
                this.b = rgba[2];
                this.a = rgba[3];
                this.value = (rgba[0] << 8 * 2) + (rgba[1] << 8) + rgba[2];
                this.hexStr = Color.numberToHexStr(this.value);
                this.rgbaStr = "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
            };
            Color.prototype.getTransparent = function(opacity) {
                return new Color("rgba(" + this.hexStr + ", " + opacity + ")");
            };
            return Color;
        }();
        exports.Color = Color;
    } ]);
});


//# sourceMappingURL=TrendsMarksPlugin.js.map