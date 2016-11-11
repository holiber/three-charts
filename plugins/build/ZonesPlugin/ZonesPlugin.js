(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(require("three-charts")); else if (typeof define === "function" && define.amd) define([ "three-charts" ], factory); else if (typeof exports === "object") exports["ZonesPlugin"] = factory(require("three-charts")); else root["THREE_CHARTS"] = root["THREE_CHARTS"] || {}, 
    root["THREE_CHARTS"]["ZonesPlugin"] = factory(root["three-charts"]);
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
        __export(__webpack_require__(10));
        __export(__webpack_require__(11));
    }, , function(module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_2__;
    }, , , , , , , , function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var three_charts_1 = __webpack_require__(2);
        var ZonesWidget_1 = __webpack_require__(11);
        (function(ZONE_TYPE) {
            ZONE_TYPE[ZONE_TYPE["X_RANGE"] = 0] = "X_RANGE";
        })(exports.ZONE_TYPE || (exports.ZONE_TYPE = {}));
        var ZONE_TYPE = exports.ZONE_TYPE;
        var ZONE_DEFAULT_OPTIONS = {
            name: "",
            title: "",
            type: ZONE_TYPE.X_RANGE,
            bgColor: "#b81820",
            easeSpeed: 500,
            opacity: .4,
            position: {
                startXVal: 0,
                startYVal: 0,
                endXVal: 0,
                endYVal: 0
            }
        };
        var Zone = function(_super) {
            __extends(Zone, _super);
            function Zone(zonePlugin, chart) {
                _super.call(this);
                this.zonePlugin = zonePlugin;
                this.chart = chart;
                three_charts_1.Utils.patch(this, ZONE_DEFAULT_OPTIONS);
                if (this.type == ZONE_TYPE.X_RANGE) {
                    this.position.startYVal = -Infinity;
                    this.position.endYVal = Infinity;
                }
            }
            Zone.prototype.remove = function() {
                this.chart.setState({
                    pluginsState: (_a = {}, _a[ZonesPlugin.NAME] = [ {
                        _id: this.getId()
                    } ], _a)
                });
                var _a;
            };
            Zone.prototype.update = function(newOptions) {
                var options = three_charts_1.Utils.deepMerge({
                    _id: this.getId()
                }, newOptions);
                this.chart.setState({
                    pluginsState: (_a = {}, _a[ZonesPlugin.NAME] = [ options ], _a)
                });
                var _a;
            };
            return Zone;
        }(three_charts_1.UniqCollectionItem);
        exports.Zone = Zone;
        var ZonesPlugin = function(_super) {
            __extends(ZonesPlugin, _super);
            function ZonesPlugin(pluginOptions) {
                var _this = this;
                _super.call(this, pluginOptions);
                this.items = new three_charts_1.UniqCollection({
                    createInstance: function() {
                        return new Zone(_this, _this.chart);
                    }
                });
            }
            ZonesPlugin.prototype.onInitialStateAppliedHandler = function() {
                this.onStateChangedHandler(this.getOptions());
            };
            ZonesPlugin.prototype.onStateChangedHandler = function(options) {
                this.items.patch(options);
            };
            ZonesPlugin.prototype.create = function(zoneOptions) {
                this.chart.setState({
                    pluginsState: (_a = {}, _a[this.name] = [ zoneOptions ], _a)
                });
                return this.items.getLast();
                var _a;
            };
            ZonesPlugin.NAME = "Zone";
            ZonesPlugin.providedWidgets = [ ZonesWidget_1.ZonesWidget ];
            return ZonesPlugin;
        }(three_charts_1.ChartPlugin);
        exports.ZonesPlugin = ZonesPlugin;
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
        var Geometry = THREE.Geometry;
        var Mesh = THREE.Mesh;
        var MeshBasicMaterial = THREE.MeshBasicMaterial;
        var three_charts_1 = __webpack_require__(2);
        var ZonesPlugin_1 = __webpack_require__(10);
        var ZonesWidget = function(_super) {
            __extends(ZonesWidget, _super);
            function ZonesWidget() {
                _super.apply(this, arguments);
                this.items = [];
            }
            ZonesWidget.prototype.onReadyHandler = function() {
                var _this = this;
                this.object3D = new Object3D();
                this.zonesPlugin = this.chart.getPlugin(ZonesPlugin_1.ZonesPlugin.NAME);
                this.zonesPlugin.items.forEach(function(zone) {
                    return _this.createZoneWidget(zone);
                });
                this.bindEvents();
            };
            ZonesWidget.prototype.createZoneWidget = function(zone) {
                var widget = new ZoneWidget(this.chart, zone);
                this.items.push(widget);
                this.object3D.add(widget.getObject3D());
            };
            ZonesWidget.prototype.bindEvents = function() {
                var _this = this;
                var zones = this.zonesPlugin.items;
                this.bindEvent(this.chart.screen.onTransformationFrame(function() {
                    return _this.updateZonesPositions();
                }), zones.onCreate(function(item) {
                    return _this.createZoneWidget(item);
                }), zones.onUpdate(function(item, changedOptions) {
                    return _this.onZoneUpdateHandler(item, changedOptions);
                }), zones.onRemove(function(item) {
                    return _this.onZoneRemoveHandler(item);
                }));
            };
            ZonesWidget.prototype.onZoneUpdateHandler = function(mark, changedOptions) {
                var widget = this.items.find(function(widget) {
                    return widget.zone.getId() == mark.getId();
                });
                widget.update(changedOptions);
            };
            ZonesWidget.prototype.onZoneRemoveHandler = function(mark) {
                var ind = this.items.findIndex(function(widget) {
                    return widget.zone.getId() == mark.getId();
                });
                var widget = this.items[ind];
                this.object3D.remove(widget.getObject3D());
                this.items.splice(ind, 1);
            };
            ZonesWidget.prototype.updateZonesPositions = function() {
                this.forEach(function(widget) {
                    return widget.updatePosition();
                });
            };
            ZonesWidget.prototype.forEach = function(fn) {
                for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                    var widget = _a[_i];
                    fn(widget);
                }
            };
            ZonesWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            ZonesWidget.widgetName = "Zones";
            return ZonesWidget;
        }(three_charts_1.ChartWidget);
        exports.ZonesWidget = ZonesWidget;
        var ZoneWidget = function() {
            function ZoneWidget(chart, zone) {
                this.chart = chart;
                this.zone = zone;
                this.object3D = new Object3D();
                this.initObject();
                this.updatePosition();
            }
            ZoneWidget.prototype.getObject3D = function() {
                return this.object3D;
            };
            ZoneWidget.prototype.initObject = function() {
                var height = this.chart.state.height;
                var bgColor = new three_charts_1.Color(this.zone.bgColor);
                this.animatedProps = three_charts_1.Utils.deepMerge({}, this.zone.position);
                this.animatedProps.opacity = this.zone.opacity;
                var geometry = new Geometry();
                geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
                geometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(3, 0, 2));
                this.mesh = new Mesh(geometry, new MeshBasicMaterial({
                    transparent: true,
                    color: bgColor.value,
                    opacity: bgColor.a
                }));
                this.mesh.frustumCulled = false;
                this.object3D.add(this.mesh);
            };
            ZoneWidget.prototype.update = function(options) {
                var _this = this;
                var zone = this.zone;
                this.animation && this.animation.stop();
                this.animation = this.chart.animationManager.animate(zone.easeSpeed, zone.ease).from(this.animatedProps).to({
                    startXVal: zone.position.startXVal,
                    startYVal: zone.position.startYVal,
                    endXVal: zone.position.endXVal,
                    endYVal: zone.position.endYVal,
                    opacity: zone.opacity
                }).onTick(function() {
                    return _this.updatePosition();
                });
            };
            ZoneWidget.prototype.updatePosition = function() {
                var chart = this.chart;
                var screen = chart.screen;
                var zone = this.zone;
                var _a = this.animatedProps, startXVal = _a.startXVal, startYVal = _a.startYVal, endXVal = _a.endXVal, endYVal = _a.endYVal, opacity = _a.opacity;
                var startY = isFinite(startYVal) ? screen.getPointOnYAxis(startYVal) : screen.getBottom();
                var endY = isFinite(endYVal) ? screen.getPointOnYAxis(endYVal) : screen.getTop();
                var startX = screen.getPointOnXAxis(startXVal);
                var endX = screen.getPointOnXAxis(endXVal);
                var geometry = this.mesh.geometry;
                var material = this.mesh.material;
                var verts = geometry.vertices;
                material.opacity = this.animatedProps.opacity;
                verts[0].set(startX, endY, 0);
                verts[1].set(startX, startY, 0);
                verts[2].set(endX, startY, 0);
                verts[3].set(endX, endY, 0);
                geometry.verticesNeedUpdate = true;
            };
            return ZoneWidget;
        }();
        exports.ZoneWidget = ZoneWidget;
    } ]);
});


//# sourceMappingURL=ZonesPlugin.js.map