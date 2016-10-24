(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(require("three-charts")); else if (typeof define === "function" && define.amd) define([ "three-charts" ], factory); else if (typeof exports === "object") exports["TrendsIndicatorWidget"] = factory(require("three-charts")); else root["THREE_CHARTS"] = root["THREE_CHARTS"] || {}, 
    root["THREE_CHARTS"]["TrendsIndicatorWidget"] = factory(root["three-charts"]);
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
        __export(__webpack_require__(3));
    }, , function(module, exports) {
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
        var Mesh = THREE.Mesh;
        var three_charts_1 = __webpack_require__(2);
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
        }(three_charts_1.TrendsWidget);
        exports.TrendsIndicatorWidget = TrendsIndicatorWidget;
        var TrendIndicator = function(_super) {
            __extends(TrendIndicator, _super);
            function TrendIndicator(chart, trendName) {
                _super.call(this, chart, trendName);
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
                var color = new three_charts_1.ChartColor(this.trend.getOptions().lineColor);
                var texture = three_charts_1.Utils.createPixelPerfectTexture(CANVAS_WIDTH, CANVAS_HEIGHT, function(ctx) {
                    ctx.beginPath();
                    ctx.font = "15px Arial";
                    ctx.fillStyle = color.rgbaStr;
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
                this.segment = this.trend.segmentsManager.getEndSegment();
                this.updatePosition();
            };
            TrendIndicator.prototype.onSegmentsAnimate = function(segments) {
                this.segment = segments.getEndSegment();
                this.updatePosition();
            };
            TrendIndicator.prototype.updatePosition = function() {
                var chart = this.chart;
                var _a = this.segment.currentAnimationState, segmentEndXVal = _a.endXVal, segmentEndYVal = _a.endYVal;
                var endPointVector = chart.screen.getPointOnChart(segmentEndXVal, segmentEndYVal);
                var screenWidth = chart.data.width;
                var x = endPointVector.x + OFFSET_X;
                var y = endPointVector.y;
                var screenX = chart.screen.getScreenXByPoint(endPointVector.x);
                var indicatorIsOutOfScreen = screenX < 0 || screenX > screenWidth;
                if (indicatorIsOutOfScreen) {
                    if (screenX < 0) x = chart.screen.getPointByScreenX(0) + 20;
                    if (screenX > screenWidth) x = chart.screen.getPointByScreenX(screenWidth) - CANVAS_WIDTH / 2 - 10;
                    y -= 25;
                }
                this.mesh.position.set(x + CANVAS_WIDTH / 2, y + CANVAS_HEIGHT / 2 - 30, .1);
            };
            return TrendIndicator;
        }(three_charts_1.TrendWidget);
        exports.TrendIndicator = TrendIndicator;
    } ]);
});


//# sourceMappingURL=TrendsIndicatorWidget.js.map