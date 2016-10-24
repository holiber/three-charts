(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(require("three-charts")); else if (typeof define === "function" && define.amd) define([ "three-charts" ], factory); else if (typeof exports === "object") exports["THREE_CHARTS"] = factory(require("three-charts")); else root["THREE_CHARTS"] = factory(root["three-charts"]);
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
                        options.name = three_charts_1.Utils.getUid().toString();
                        actualMarksNames.push(options.name);
                        if (marks[options.name]) three_charts_1.Utils.error("duplicated mark name " + options.name);
                    } else if (marks[options.name]) {
                        actualMarksNames.push(options.name);
                        continue;
                    }
                    options = three_charts_1.Utils.deepMerge(AXIS_MARK_DEFAULT_OPTIONS, options);
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
            TrendsMarksPlugin.pluginWidgets = [ TrendsMarksWidget_1.TrendsMarksWidget ];
            return TrendsMarksPlugin;
        }(three_charts_1.ChartPlugin);
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
        var Geometry = THREE.Geometry;
        var Mesh = THREE.Mesh;
        var Object3D = THREE.Object3D;
        var TrendsMarksPlugin_1 = __webpack_require__(5);
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
        }(three_charts_1.TrendWidget);
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
                var texture = three_charts_1.Utils.createPixelPerfectTexture(markWidth, markHeight, function(ctx) {
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