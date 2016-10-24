(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(require("three-charts")); else if (typeof define === "function" && define.amd) define([ "three-charts" ], factory); else if (typeof exports === "object") exports["TrendsLoadingWidget"] = factory(require("three-charts")); else root["THREE_CHARTS"] = root["THREE_CHARTS"] || {}, 
    root["THREE_CHARTS"]["TrendsLoadingWidget"] = factory(root["three-charts"]);
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
        __export(__webpack_require__(4));
    }, , function(module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_2__;
    }, , function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var Mesh = THREE.Mesh;
        var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
        var MeshBasicMaterial = THREE.MeshBasicMaterial;
        var three_charts_1 = __webpack_require__(2);
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
        }(three_charts_1.TrendsWidget);
        exports.TrendsLoadingWidget = TrendsLoadingWidget;
        var TrendLoading = function(_super) {
            __extends(TrendLoading, _super);
            function TrendLoading(chart, trendName) {
                _super.call(this, chart, trendName);
                this.isActive = false;
                this.mesh = new Mesh(new PlaneBufferGeometry(32, 32), new MeshBasicMaterial({
                    map: TrendLoading.createTexture(),
                    transparent: true
                }));
                this.deactivate();
            }
            TrendLoading.widgetIsEnabled = function(trendOptions, chart) {
                return trendOptions.enabled && chart.data.animations.enabled;
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
                return three_charts_1.Utils.createTexture(h, w, function(ctx) {
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
                var segment = trend.segmentsManager.getStartSegment();
                var x, y;
                if (trend.getOptions().type == three_charts_1.TREND_TYPE.LINE) {
                    x = segment.currentAnimationState.startXVal;
                    y = segment.currentAnimationState.startYVal;
                } else {
                    x = segment.currentAnimationState.xVal - segment.maxLength;
                    y = segment.currentAnimationState.yVal;
                }
                var pointVector = this.chart.screen.getPointOnChart(x, y);
                this.mesh.position.set(pointVector.x, pointVector.y, 0);
            };
            return TrendLoading;
        }(three_charts_1.TrendWidget);
        exports.TrendLoading = TrendLoading;
    } ]);
});


//# sourceMappingURL=TrendsLoadingWidget.js.map