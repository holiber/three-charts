(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(require("three-charts")); else if (typeof define === "function" && define.amd) define([ "three-charts" ], factory); else if (typeof exports === "object") exports["AxisMarksPlugin"] = factory(require("three-charts")); else root["THREE_CHARTS"] = root["THREE_CHARTS"] || {}, 
    root["THREE_CHARTS"]["AxisMarksPlugin"] = factory(root["three-charts"]);
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
        __export(__webpack_require__(1));
        __export(__webpack_require__(3));
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
        var AxisMarksWidget_1 = __webpack_require__(3);
        var AXIS_MARK_DEFAULT_OPTIONS = {
            lineWidth: 3,
            width: 200,
            value: 0,
            stickToEdges: false,
            textColor: "rgba(#45a9e1, 0.8)",
            lineColor: "rgba(#45a9e1, 0.6)",
            title: "",
            ease: three_charts_1.EASING.Quadratic.Out,
            easeSpeed: 500,
            opacity: 1
        };
        var AxisMark = function(_super) {
            __extends(AxisMark, _super);
            function AxisMark(axisMarkPlugin, chart) {
                _super.call(this);
                this.axisMarkPlugin = axisMarkPlugin;
                this.chart = chart;
                three_charts_1.Utils.patch(this, AXIS_MARK_DEFAULT_OPTIONS);
            }
            AxisMark.prototype.remove = function() {
                this.chart.setState({
                    pluginsState: (_a = {}, _a[AxisMarksPlugin.NAME] = [ {
                        _id: this.getId()
                    } ], _a)
                });
                var _a;
            };
            AxisMark.prototype.update = function(newOptions) {
                var options = three_charts_1.Utils.deepMerge({
                    _id: this.getId()
                }, newOptions);
                this.chart.setState({
                    pluginsState: (_a = {}, _a[AxisMarksPlugin.NAME] = [ options ], _a)
                });
                var _a;
            };
            return AxisMark;
        }(three_charts_1.UniqCollectionItem);
        exports.AxisMark = AxisMark;
        var AxisMarksPlugin = function(_super) {
            __extends(AxisMarksPlugin, _super);
            function AxisMarksPlugin(axisMarksPluginOptions) {
                var _this = this;
                _super.call(this, axisMarksPluginOptions);
                this.marksCollection = new three_charts_1.UniqCollection({
                    createInstance: function() {
                        return new AxisMark(_this, _this.chart);
                    }
                });
            }
            AxisMarksPlugin.prototype.onInitialStateAppliedHandler = function() {
                this.onStateChangedHandler(this.getOptions());
            };
            AxisMarksPlugin.prototype.onStateChangedHandler = function(axisMarksOptions) {
                this.marksCollection.patch(axisMarksOptions);
            };
            AxisMarksPlugin.prototype.createMark = function(markOptions) {
                this.chart.setState({
                    pluginsState: (_a = {}, _a[this.name] = [ markOptions ], _a)
                });
                return this.marksCollection.getLast();
                var _a;
            };
            AxisMarksPlugin.NAME = "AxisMarks";
            AxisMarksPlugin.providedWidgets = [ AxisMarksWidget_1.AxisMarksWidget ];
            return AxisMarksPlugin;
        }(three_charts_1.ChartPlugin);
        exports.AxisMarksPlugin = AxisMarksPlugin;
    }, function(module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_2__;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Object3D = THREE.Object3D;
        var Mesh = THREE.Mesh;
        var MeshBasicMaterial = THREE.MeshBasicMaterial;
        var three_charts_1 = __webpack_require__(2);
        var AxisMarksPlugin_1 = __webpack_require__(1);
        var AxisMarksWidget = function(_super) {
            __extends(AxisMarksWidget, _super);
            function AxisMarksWidget() {
                _super.apply(this, arguments);
                this.axisMarksWidgets = [];
            }
            AxisMarksWidget.prototype.onReadyHandler = function() {
                var _this = this;
                this.object3D = new Object3D();
                this.axisMarksPlugin = this.chart.getPlugin(AxisMarksPlugin_1.AxisMarksPlugin.NAME);
                this.axisMarksPlugin.marksCollection.forEach(function(mark) {
                    return _this.createAxisMarkWidget(mark);
                });
                this.bindEvents();
            };
            AxisMarksWidget.prototype.createAxisMarkWidget = function(axisMark) {
                var axisMarkWidget = new AxisMarkWidget(this.chart, axisMark);
                this.axisMarksWidgets.push(axisMarkWidget);
                this.object3D.add(axisMarkWidget.getObject3D());
            };
            AxisMarksWidget.prototype.bindEvents = function() {
                var _this = this;
                var marksCollection = this.axisMarksPlugin.marksCollection;
                this.bindEvent(this.chart.screen.onTransformationFrame(function() {
                    return _this.updateMarksPositions();
                }), this.chart.onResize(function() {
                    return _this.onResizeHandler();
                }), this.chart.onChange(function(changedProps) {
                    return _this.onStateChangeHandler(changedProps);
                }), marksCollection.onCreate(function(mark) {
                    return _this.createAxisMarkWidget(mark);
                }), marksCollection.onUpdate(function(mark, changedOptions) {
                    return _this.onMarkUpdateHandler(mark, changedOptions);
                }), marksCollection.onRemove(function(mark) {
                    return _this.onMarkRemoveHandler(mark);
                }));
            };
            AxisMarksWidget.prototype.onMarkUpdateHandler = function(mark, changedOptions) {
                var widget = this.axisMarksWidgets.find(function(widget) {
                    return widget.axisMark.getId() == mark.getId();
                });
                widget.update(changedOptions);
            };
            AxisMarksWidget.prototype.onMarkRemoveHandler = function(mark) {
                var ind = this.axisMarksWidgets.findIndex(function(widget) {
                    return widget.axisMark.getId() == mark.getId();
                });
                var widget = this.axisMarksWidgets[ind];
                this.object3D.remove(widget.getObject3D());
                this.axisMarksWidgets.splice(ind, 1);
            };
            AxisMarksWidget.prototype.updateMarksPositions = function() {
                this.forEach(function(widget) {
                    return widget.updatePosition();
                });
            };
            AxisMarksWidget.prototype.onStateChangeHandler = function(changedProps) {
                this.forEach(function(widget) {
                    return widget.onStateChangeHandler(changedProps);
                });
            };
            AxisMarksWidget.prototype.onResizeHandler = function() {
                this.forEach(function(widget) {
                    widget.resize();
                    widget.updatePosition();
                });
            };
            AxisMarksWidget.prototype.forEach = function(fn) {
                for (var _i = 0, _a = this.axisMarksWidgets; _i < _a.length; _i++) {
                    var widget = _a[_i];
                    fn(widget);
                }
            };
            AxisMarksWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            AxisMarksWidget.widgetName = "AxisMarks";
            return AxisMarksWidget;
        }(three_charts_1.ChartWidget);
        exports.AxisMarksWidget = AxisMarksWidget;
        exports.DEFAULT_AXIS_MARK_RENDERER = function(axisMarkWidget, ctx, width, height, chart) {
            var markOptions = axisMarkWidget.axisMark;
            var lineColor = new three_charts_1.Color(markOptions.lineColor);
            var textColor = new three_charts_1.Color(markOptions.textColor);
            var font = chart.state.font.l;
            var offset = parseInt(font);
            ctx.clearRect(0, 0, width, height);
            ctx.beginPath();
            ctx.strokeStyle = lineColor.rgbaStr;
            ctx.fillStyle = lineColor.rgbaStr;
            ctx.lineWidth = markOptions.lineWidth;
            ctx.font = font;
            if (markOptions.axisType == three_charts_1.AXIS_TYPE.X) {
                ctx.moveTo(width / 2, 0);
                ctx.lineTo(width / 2, height);
                ctx.stroke();
                ctx.fillStyle = textColor.rgbaStr;
                ctx.fillText(markOptions.title, width / 2 + offset, offset * 2);
            } else {
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.stroke();
                ctx.fillStyle = textColor.rgbaStr;
                ctx.fillText(markOptions.title, offset, height / 2 + (axisMarkWidget.isStickOnBottom ? -offset * 2 : offset * 2));
            }
        };
        var AxisMarkWidget = function() {
            function AxisMarkWidget(chart, axisMark) {
                this.isStickOnTop = false;
                this.isStickOnBottom = false;
                this.displayedValue = "";
                this.height = 0;
                this.width = 0;
                this.frameValue = 0;
                this.frameOpacity = 0;
                this.chart = chart;
                this.axisMark = axisMark;
                this.frameOpacity = axisMark.opacity;
                this.frameValue = axisMark.value;
                this.object3D = new Object3D();
                this.initObject();
                this.updatePosition();
            }
            AxisMarkWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            AxisMarkWidget.prototype.initObject = function() {
                this.width = this.chart.state.width;
                this.height = this.chart.state.height;
                var markOptions = this.axisMark;
                if (markOptions.axisType == three_charts_1.AXIS_TYPE.X) {
                    this.width = markOptions.width;
                } else {
                    this.height = markOptions.width;
                }
                var texture = three_charts_1.Utils.createNearestTexture(this.width, this.height);
                this.mesh = new Mesh(new THREE.PlaneGeometry(this.width, this.height), new MeshBasicMaterial({
                    map: texture,
                    transparent: true
                }));
                this.object3D.add(this.mesh);
                this.render();
            };
            AxisMarkWidget.prototype.onStateChangeHandler = function(changedProps) {
                var needRender = this.axisMark.needRender && this.axisMark.needRender(this, this.chart, changedProps);
                needRender && this.render();
            };
            AxisMarkWidget.prototype.render = function() {
                var markOptions = this.axisMark;
                var mesh = this.mesh;
                var texture = mesh.material.map;
                var ctx = texture.image.getContext("2d");
                var renderer = markOptions.renderer ? markOptions.renderer : exports.DEFAULT_AXIS_MARK_RENDERER;
                if (markOptions.displayedValue) this.displayedValue = markOptions.displayedValue(this, this.chart);
                renderer(this, ctx, this.width, this.height, this.chart);
                texture.needsUpdate = true;
            };
            AxisMarkWidget.prototype.resize = function() {
                this.object3D.remove(this.mesh);
                this.initObject();
            };
            AxisMarkWidget.prototype.update = function(options) {
                var _this = this;
                var mark = this.axisMark;
                this.animation && this.animation.stop();
                this.animation = this.chart.animationManager.animate(mark.easeSpeed, mark.ease).from([ this.frameValue, this.frameOpacity ]).to([ mark.value, mark.opacity ]).onTick(function(arr) {
                    _this.frameValue = arr[0];
                    _this.frameOpacity = arr[1];
                    _this.updatePosition();
                });
            };
            AxisMarkWidget.prototype.updatePosition = function() {
                var chart = this.chart;
                var screen = chart.screen;
                var mark = this.axisMark;
                var isXAxis = mark.axisType == three_charts_1.AXIS_TYPE.X;
                var hasStickMode = mark.stickToEdges;
                var _a = chart.state, width = _a.width, height = _a.height;
                var val = this.frameValue;
                var opactity = this.frameOpacity;
                var material = this.mesh.material;
                material.opacity = opactity;
                if (isXAxis) {
                    this.mesh.position.x = screen.getPointOnXAxis(val);
                    this.mesh.position.y = screen.options.scrollY + height / 2;
                } else {
                    var bottomVal = screen.getBottomVal();
                    var topVal = screen.getTopVal();
                    var needToStickOnTop = hasStickMode && val > topVal;
                    var needToStickOnBottom = hasStickMode && val < bottomVal;
                    var centerYVal = screen.getCenterYVal();
                    this.mesh.position.x = screen.options.scrollX + width / 2;
                    if (needToStickOnTop) {
                        this.isStickOnTop = true;
                        this.mesh.position.y = screen.getTop();
                    } else if (needToStickOnBottom) {
                        this.isStickOnBottom = true;
                        this.mesh.position.y = screen.getBottom();
                    } else {
                        this.isStickOnBottom = this.isStickOnTop = false;
                        this.mesh.position.y = screen.getPointOnYAxis(val);
                    }
                }
            };
            return AxisMarkWidget;
        }();
        exports.AxisMarkWidget = AxisMarkWidget;
    } ]);
});


//# sourceMappingURL=AxisMarksPlugin.js.map