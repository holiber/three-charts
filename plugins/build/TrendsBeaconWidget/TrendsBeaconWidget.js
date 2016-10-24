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
        var Mesh = THREE.Mesh;
        var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
        var MeshBasicMaterial = THREE.MeshBasicMaterial;
        var three_charts_1 = __webpack_require__(2);
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
        }(three_charts_1.TrendsWidget);
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
                return trendOptions.enabled && trendOptions.hasBeacon && trendOptions.type == three_charts_1.TREND_TYPE.LINE;
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
                this.segment = this.trend.segmentsManager.getEndSegment();
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
                return three_charts_1.Utils.createTexture(h, w, function(ctx) {
                    ctx.beginPath();
                    ctx.arc(w / 2, h / 2, w / 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = "white";
                    ctx.fill();
                });
            };
            TrendBeacon.prototype.onTransformationFrame = function() {
                this.segment = this.trend.segmentsManager.getEndSegment();
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
                if (this.trend.getOptions().type == three_charts_1.TREND_TYPE.LINE) {
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
        }(three_charts_1.TrendWidget);
        exports.TrendBeacon = TrendBeacon;
    }, function(module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_2__;
    } ]);
});


//# sourceMappingURL=TrendsBeaconWidget.js.map