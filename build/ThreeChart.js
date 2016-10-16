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
        __export(__webpack_require__(21));
        __export(__webpack_require__(20));
        __export(__webpack_require__(19));
        __export(__webpack_require__(12));
        __export(__webpack_require__(17));
        __export(__webpack_require__(18));
        __export(__webpack_require__(16));
        __export(__webpack_require__(14));
        __export(__webpack_require__(15));
        __export(__webpack_require__(33));
        __export(__webpack_require__(25));
    }, function(module, exports, __webpack_require__) {
        "use strict";
        __webpack_require__(3);
        var PerspectiveCamera = THREE.PerspectiveCamera;
        var State_1 = __webpack_require__(12);
        var Utils_1 = __webpack_require__(14);
        var AxisWidget_1 = __webpack_require__(22);
        var GridWidget_1 = __webpack_require__(23);
        var TrendsLoadingWidget_1 = __webpack_require__(24);
        var AxisMarksWidget_1 = __webpack_require__(26);
        var BorderWidget_1 = __webpack_require__(27);
        var TrendsIndicatorWidget_1 = __webpack_require__(28);
        var TrendsLineWidget_1 = __webpack_require__(29);
        var TrendsCandleWidget_1 = __webpack_require__(30);
        var TrendsBeaconWidget_1 = __webpack_require__(31);
        var deps_1 = __webpack_require__(32);
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
        window.TweenLite = TweenMax;
        window.Stats = __webpack_require__(4);
        __webpack_require__(5);
        __webpack_require__(6);
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
        var Vector3 = THREE.Vector3;
        var EventEmmiter_1 = __webpack_require__(13);
        var Utils_1 = __webpack_require__(14);
        var Widget_1 = __webpack_require__(15);
        var TrendsManager_1 = __webpack_require__(16);
        var Screen_1 = __webpack_require__(19);
        var AxisMarks_1 = __webpack_require__(20);
        var interfaces_1 = __webpack_require__(21);
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
        var Trend_1 = __webpack_require__(17);
        var EventEmmiter_1 = __webpack_require__(13);
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
        var Utils_1 = __webpack_require__(14);
        var TrendSegments_1 = __webpack_require__(18);
        var EventEmmiter_1 = __webpack_require__(13);
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
        var EventEmmiter_1 = __webpack_require__(13);
        var Vector3 = THREE.Vector3;
        var Trend_1 = __webpack_require__(17);
        var Utils_1 = __webpack_require__(14);
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
        var EventEmmiter_1 = __webpack_require__(13);
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
        var Utils_1 = __webpack_require__(14);
        var interfaces_1 = __webpack_require__(21);
        var EventEmmiter_1 = __webpack_require__(13);
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
        var Widget_1 = __webpack_require__(15);
        var GridWidget_1 = __webpack_require__(23);
        var Utils_1 = __webpack_require__(14);
        var interfaces_1 = __webpack_require__(21);
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
        var Widget_1 = __webpack_require__(15);
        var LineSegments = THREE.LineSegments;
        var Utils_1 = __webpack_require__(14);
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
        var Utils_1 = __webpack_require__(14);
        var Mesh = THREE.Mesh;
        var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
        var MeshBasicMaterial = THREE.MeshBasicMaterial;
        var TrendsWidget_1 = __webpack_require__(25);
        var Trend_1 = __webpack_require__(17);
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
        var Widget_1 = __webpack_require__(15);
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
        var Widget_1 = __webpack_require__(15);
        var Object3D = THREE.Object3D;
        var Geometry = THREE.Geometry;
        var LineBasicMaterial = THREE.LineBasicMaterial;
        var Vector3 = THREE.Vector3;
        var Utils_1 = __webpack_require__(14);
        var Line = THREE.Line;
        var Mesh = THREE.Mesh;
        var interfaces_1 = __webpack_require__(21);
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
        var Widget_1 = __webpack_require__(15);
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
        var Utils_1 = __webpack_require__(14);
        var Mesh = THREE.Mesh;
        var TrendsWidget_1 = __webpack_require__(25);
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
        var TrendsWidget_1 = __webpack_require__(25);
        var LineSegments = THREE.LineSegments;
        var Trend_1 = __webpack_require__(17);
        var Utils_1 = __webpack_require__(14);
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
        var TrendsWidget_1 = __webpack_require__(25);
        var Object3D = THREE.Object3D;
        var Geometry = THREE.Geometry;
        var Vector3 = THREE.Vector3;
        var Mesh = THREE.Mesh;
        var Line = THREE.Line;
        var MeshBasicMaterial = THREE.MeshBasicMaterial;
        var PlaneGeometry = THREE.PlaneGeometry;
        var Trend_1 = __webpack_require__(17);
        var LineBasicMaterial = THREE.LineBasicMaterial;
        var Utils_1 = __webpack_require__(14);
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
        var Utils_1 = __webpack_require__(14);
        var Mesh = THREE.Mesh;
        var PlaneBufferGeometry = THREE.PlaneBufferGeometry;
        var MeshBasicMaterial = THREE.MeshBasicMaterial;
        var TrendsWidget_1 = __webpack_require__(25);
        var Trend_1 = __webpack_require__(17);
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
        var Utils_1 = __webpack_require__(14);
        var EventEmmiter_1 = __webpack_require__(13);
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


//# sourceMappingURL=ThreeChart.js.map