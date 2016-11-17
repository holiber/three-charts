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
        var three_charts_1 = __webpack_require__(38);
        var TrendsMarksPlugin_1 = __webpack_require__(40);
        var TrendsBeaconWidget_1 = __webpack_require__(43);
        var TrendsLoadingWidget_1 = __webpack_require__(45);
        var TrendsIndicatorWidget_1 = __webpack_require__(47);
        var AxisMarksPlugin_1 = __webpack_require__(49);
        var ZonesPlugin_1 = __webpack_require__(51);
        three_charts_1.ChartView.preinstalledWidgets.push(TrendsLoadingWidget_1.TrendsLoadingWidget, TrendsBeaconWidget_1.TrendsBeaconWidget, TrendsIndicatorWidget_1.TrendsIndicatorWidget);
        var chartView;
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
                return three_charts_1.Utils.deepCopy(this.data);
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
        var MarksSource = function() {
            function MarksSource() {}
            MarksSource.getNext = function(val) {
                if (Math.random() > .2) return null;
                return this.generate(val);
            };
            MarksSource.generate = function(val) {
                var descriptionColor = "rgb(40,136,75)";
                var orientation = three_charts_1.Utils.getRandomItem([ TrendsMarksPlugin_1.TREND_MARK_SIDE.TOP, TrendsMarksPlugin_1.TREND_MARK_SIDE.BOTTOM ]);
                if (orientation == TrendsMarksPlugin_1.TREND_MARK_SIDE.BOTTOM) {
                    descriptionColor = "rgb(219,73,49)";
                }
                return {
                    trendName: "main",
                    xVal: val,
                    title: three_charts_1.Utils.getRandomItem([ "Alex Malcon 224", "Serg Morrs 453", "Harry Potter 554" ]),
                    color: three_charts_1.Utils.getRandomItem([ "rgba(#ad57b2, 0.5)", "rgba(#0099d9, 0.5)" ]),
                    orientation: orientation,
                    userData: {
                        description: three_charts_1.Utils.getRandomItem([ "$10 -> 20$", "$15 -> 30$", "40$ -> 80$" ]),
                        icon: three_charts_1.Utils.getRandomItem([ "AM", "SM", "HP" ]),
                        descriptionColor: descriptionColor
                    }
                };
            };
            return MarksSource;
        }();
        window.onload = function() {
            initListeners();
            var dsMain = new DataSourse();
            var dsRed = new DataSourse();
            var dsBlue = new DataSourse();
            var now = Date.now();
            chartView = new three_charts_1.ChartView({
                yAxis: {
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
                    dataType: three_charts_1.AXIS_DATA_TYPE.DATE,
                    range: {
                        type: three_charts_1.AXIS_RANGE_TYPE.FIXED,
                        from: Date.now(),
                        to: Date.now() + 2e4,
                        padding: {
                            end: 0,
                            start: 0
                        },
                        maxLength: 5e6,
                        minLength: 5e3,
                        margin: {
                            end: 200
                        }
                    }
                },
                trends: {
                    main: {
                        type: three_charts_1.TREND_TYPE.LINE,
                        dataset: dsMain.getData(),
                        hasBeacon: true,
                        hasIndicator: true,
                        hasBackground: true
                    }
                },
                showStats: true,
                trendDefaultState: {
                    settingsForTypes: {
                        LINE: {}
                    }
                }
            }, document.querySelector(".chart"), [ new ZonesPlugin_1.ZonesPlugin([]), new TrendsMarksPlugin_1.TrendsMarksPlugin({
                items: [ MarksSource.generate(now + 3e3), MarksSource.generate(now + 3e3), MarksSource.generate(now + 4e3) ]
            }), new AxisMarksPlugin_1.AxisMarksPlugin([ {
                axisType: three_charts_1.AXIS_TYPE.X,
                value: dsMain.startTime,
                name: "test",
                title: "DEADLINE",
                userData: {
                    feel: "aa"
                }
            }, {
                axisType: three_charts_1.AXIS_TYPE.X,
                value: dsMain.endTime + 3e4,
                name: "deadline",
                title: "DEADLINE",
                lineColor: "#ff6600"
            }, {
                axisType: three_charts_1.AXIS_TYPE.X,
                value: dsMain.endTime + 4e4,
                name: "close",
                title: "CLOSE",
                lineColor: "#005187"
            } ]) ]);
            var axisMarks = chartView.chart.getPlugin(AxisMarksPlugin_1.AxisMarksPlugin.NAME);
            var zones = chartView.chart.getPlugin(ZonesPlugin_1.ZonesPlugin.NAME);
            setTimeout(function() {
                var zone = zones.create({
                    position: {
                        startXVal: dsMain.startTime,
                        endXVal: dsMain.startTime + 5e3
                    }
                });
                var mark = axisMarks.createMark({
                    axisType: three_charts_1.AXIS_TYPE.Y,
                    value: dsMain.data[0].yVal,
                    name: "openprice",
                    title: "OPEN PRICE",
                    lineColor: "#29874b",
                    stickToEdges: true
                });
                setInterval(function() {
                    mark.update({
                        value: mark.value + 1
                    });
                }, 1e3);
            }, 1e3);
            window["chartView"] = chartView;
            var mainTrend = chartView.getTrend("main");
            mainTrend.onDataChange(function() {
                var markOptions = MarksSource.getNext(mainTrend.getLastItem().xVal);
                if (markOptions) setTimeout(function() {
                    var trendsMarks = chartView.chart.getPlugin(TrendsMarksPlugin_1.TrendsMarksPlugin.NAME);
                    trendsMarks.createMark(markOptions);
                }, 500);
            });
            var i = 0;
            chartView.getTrend("main").onPrependRequest(function(requestedLength, resolve, reject) {
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
                chartView.getTrend("main").appendData([ val ]);
            }, 1e3);
        };
        function initListeners() {
            var $checkboxMaintrend = document.querySelector('input[name="maintrend"]');
            $checkboxMaintrend.addEventListener("change", function() {
                chartView.setState({
                    trends: {
                        main: {
                            enabled: $checkboxMaintrend.checked
                        }
                    }
                });
            });
            var $checkboxRedtrend = document.querySelector('input[name="redtrend"]');
            $checkboxRedtrend.addEventListener("change", function() {
                chartView.setState({
                    trends: {
                        red: {
                            enabled: $checkboxRedtrend.checked
                        }
                    }
                });
            });
            var $checkboxBluetrend = document.querySelector('input[name="bluetrend"]');
            $checkboxBluetrend.addEventListener("change", function() {
                chartView.setState({
                    trends: {
                        blue: {
                            enabled: $checkboxBluetrend.checked
                        }
                    }
                });
            });
            var $switchLineBtn = document.querySelector('[name="switch-line"]');
            $switchLineBtn.addEventListener("click", function() {
                chartView.getTrend("main").setOptions({
                    type: three_charts_1.TREND_TYPE.LINE
                });
            });
            var $switchBarsBtn = document.querySelector('[name="switch-bars"]');
            $switchBarsBtn.addEventListener("click", function() {
                chartView.getTrend("main").setOptions({
                    type: three_charts_1.TREND_TYPE.CANDLE
                });
            });
            document.querySelector('[name="move-left"]').addEventListener("click", function() {
                var currentRange = chartView.chart.state.xAxis.range;
                chartView.setState({
                    xAxis: {
                        range: {
                            from: currentRange.from - 2e3
                        }
                    }
                });
            });
            document.querySelector('[name="move-right"]').addEventListener("click", function() {
                var currentRange = chartView.chart.state.xAxis.range;
                chartView.setState({
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
                    chartView.chart.setState({
                        autoScroll: false
                    });
                    chartView.chart.zoomToRange(range);
                    chartView.chart.scrollToEnd().then(function() {
                        chartView.chart.setState({
                            autoScroll: true
                        });
                    });
                });
            }
        }
    }, , , , , , , , , , , , , , , , , , , , , , , , , , function(module, exports) {
        "use strict";
        exports.EASING = {
            Linear: {
                None: function(k) {
                    return k;
                }
            },
            Quadratic: {
                In: function(k) {
                    return k * k;
                },
                Out: function(k) {
                    return k * (2 - k);
                },
                InOut: function(k) {
                    if ((k *= 2) < 1) {
                        return .5 * k * k;
                    }
                    return -.5 * (--k * (k - 2) - 1);
                }
            },
            Cubic: {
                In: function(k) {
                    return k * k * k;
                },
                Out: function(k) {
                    return --k * k * k + 1;
                },
                InOut: function(k) {
                    if ((k *= 2) < 1) {
                        return .5 * k * k * k;
                    }
                    return .5 * ((k -= 2) * k * k + 2);
                }
            },
            Quartic: {
                In: function(k) {
                    return k * k * k * k;
                },
                Out: function(k) {
                    return 1 - --k * k * k * k;
                },
                InOut: function(k) {
                    if ((k *= 2) < 1) {
                        return .5 * k * k * k * k;
                    }
                    return -.5 * ((k -= 2) * k * k * k - 2);
                }
            },
            Quintic: {
                In: function(k) {
                    return k * k * k * k * k;
                },
                Out: function(k) {
                    return --k * k * k * k * k + 1;
                },
                InOut: function(k) {
                    if ((k *= 2) < 1) {
                        return .5 * k * k * k * k * k;
                    }
                    return .5 * ((k -= 2) * k * k * k * k + 2);
                }
            },
            Sinusoidal: {
                In: function(k) {
                    return 1 - Math.cos(k * Math.PI / 2);
                },
                Out: function(k) {
                    return Math.sin(k * Math.PI / 2);
                },
                InOut: function(k) {
                    return .5 * (1 - Math.cos(Math.PI * k));
                }
            },
            Exponential: {
                In: function(k) {
                    return k === 0 ? 0 : Math.pow(1024, k - 1);
                },
                Out: function(k) {
                    return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
                },
                InOut: function(k) {
                    if (k === 0) {
                        return 0;
                    }
                    if (k === 1) {
                        return 1;
                    }
                    if ((k *= 2) < 1) {
                        return .5 * Math.pow(1024, k - 1);
                    }
                    return .5 * (-Math.pow(2, -10 * (k - 1)) + 2);
                }
            },
            Circular: {
                In: function(k) {
                    return 1 - Math.sqrt(1 - k * k);
                },
                Out: function(k) {
                    return Math.sqrt(1 - --k * k);
                },
                InOut: function(k) {
                    if ((k *= 2) < 1) {
                        return -.5 * (Math.sqrt(1 - k * k) - 1);
                    }
                    return .5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
                }
            },
            Elastic: {
                In: function(k) {
                    if (k === 0) {
                        return 0;
                    }
                    if (k === 1) {
                        return 1;
                    }
                    return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
                },
                Out: function(k) {
                    if (k === 0) {
                        return 0;
                    }
                    if (k === 1) {
                        return 1;
                    }
                    return Math.pow(2, -10 * k) * Math.sin((k - .1) * 5 * Math.PI) + 1;
                },
                InOut: function(k) {
                    if (k === 0) {
                        return 0;
                    }
                    if (k === 1) {
                        return 1;
                    }
                    k *= 2;
                    if (k < 1) {
                        return -.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
                    }
                    return .5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
                }
            },
            Back: {
                In: function(k) {
                    var s = 1.70158;
                    return k * k * ((s + 1) * k - s);
                },
                Out: function(k) {
                    var s = 1.70158;
                    return --k * k * ((s + 1) * k + s) + 1;
                },
                InOut: function(k) {
                    var s = 1.70158 * 1.525;
                    if ((k *= 2) < 1) {
                        return .5 * (k * k * ((s + 1) * k - s));
                    }
                    return .5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
                }
            },
            Bounce: {
                In: function(k) {
                    return 1 - exports.EASING.Bounce.Out(1 - k);
                },
                Out: function(k) {
                    if (k < 1 / 2.75) {
                        return 7.5625 * k * k;
                    } else if (k < 2 / 2.75) {
                        return 7.5625 * (k -= 1.5 / 2.75) * k + .75;
                    } else if (k < 2.5 / 2.75) {
                        return 7.5625 * (k -= 2.25 / 2.75) * k + .9375;
                    } else {
                        return 7.5625 * (k -= 2.625 / 2.75) * k + .984375;
                    }
                },
                InOut: function(k) {
                    if (k < .5) {
                        return exports.EASING.Bounce.In(k * 2) * .5;
                    }
                    return exports.EASING.Bounce.Out(k * 2 - 1) * .5 + .5;
                }
            }
        };
    }, , , , , , , , , , , , function(module, exports, __webpack_require__) {
        module.exports = __webpack_require__(39);
    }, function(module, exports, __webpack_require__) {
        (function webpackUniversalModuleDefinition(root, factory) {
            if (true) module.exports = factory(); else if (typeof define === "function" && define.amd) define([], factory); else if (typeof exports === "object") exports["THREE_CHARTS"] = factory(); else root["THREE_CHARTS"] = factory();
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
                __webpack_require__(2);
                __export(__webpack_require__(14));
                __export(__webpack_require__(27));
                __export(__webpack_require__(24));
                __export(__webpack_require__(19));
                __export(__webpack_require__(20));
                __export(__webpack_require__(21));
                __export(__webpack_require__(22));
                __export(__webpack_require__(16));
                __export(__webpack_require__(36));
                __export(__webpack_require__(28));
                __export(__webpack_require__(37));
                __export(__webpack_require__(15));
                __export(__webpack_require__(31));
                __export(__webpack_require__(25));
                __export(__webpack_require__(18));
                __export(__webpack_require__(26));
            }, function(module, exports, __webpack_require__) {
                "use strict";
                window.TweenLite = TweenMax;
                window.Stats = __webpack_require__(3);
                exports.isPlainObject = __webpack_require__(4);
                exports.EE2 = __webpack_require__(6);
                var es6_promise_1 = __webpack_require__(7);
                exports.Promise = es6_promise_1.Promise;
                exports.ResizeSensor = __webpack_require__(8);
                exports.deepExtend = __webpack_require__(9);
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
                var isObject = __webpack_require__(5);
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
                (function(Buffer) {
                    /*!
		 * @description Recursive object extending
		 * @author Viacheslav Lotsmanov <lotsmanov89@gmail.com>
		 * @license MIT
		 *
		 * The MIT License (MIT)
		 *
		 * Copyright (c) 2013-2015 Viacheslav Lotsmanov
		 *
		 * Permission is hereby granted, free of charge, to any person obtaining a copy of
		 * this software and associated documentation files (the "Software"), to deal in
		 * the Software without restriction, including without limitation the rights to
		 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
		 * the Software, and to permit persons to whom the Software is furnished to do so,
		 * subject to the following conditions:
		 *
		 * The above copyright notice and this permission notice shall be included in all
		 * copies or substantial portions of the Software.
		 *
		 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
		 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
		 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
		 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
		 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
		 */
                    "use strict";
                    function isSpecificValue(val) {
                        return val instanceof Buffer || val instanceof Date || val instanceof RegExp ? true : false;
                    }
                    function cloneSpecificValue(val) {
                        if (val instanceof Buffer) {
                            var x = new Buffer(val.length);
                            val.copy(x);
                            return x;
                        } else if (val instanceof Date) {
                            return new Date(val.getTime());
                        } else if (val instanceof RegExp) {
                            return new RegExp(val);
                        } else {
                            throw new Error("Unexpected situation");
                        }
                    }
                    function deepCloneArray(arr) {
                        var clone = [];
                        arr.forEach(function(item, index) {
                            if (typeof item === "object" && item !== null) {
                                if (Array.isArray(item)) {
                                    clone[index] = deepCloneArray(item);
                                } else if (isSpecificValue(item)) {
                                    clone[index] = cloneSpecificValue(item);
                                } else {
                                    clone[index] = deepExtend({}, item);
                                }
                            } else {
                                clone[index] = item;
                            }
                        });
                        return clone;
                    }
                    var deepExtend = module.exports = function() {
                        if (arguments.length < 1 || typeof arguments[0] !== "object") {
                            return false;
                        }
                        if (arguments.length < 2) {
                            return arguments[0];
                        }
                        var target = arguments[0];
                        var args = Array.prototype.slice.call(arguments, 1);
                        var val, src, clone;
                        args.forEach(function(obj) {
                            if (typeof obj !== "object" || Array.isArray(obj)) {
                                return;
                            }
                            Object.keys(obj).forEach(function(key) {
                                src = target[key];
                                val = obj[key];
                                if (val === target) {
                                    return;
                                } else if (typeof val !== "object" || val === null) {
                                    target[key] = val;
                                    return;
                                } else if (Array.isArray(val)) {
                                    target[key] = deepCloneArray(val);
                                    return;
                                } else if (isSpecificValue(val)) {
                                    target[key] = cloneSpecificValue(val);
                                    return;
                                } else if (typeof src !== "object" || src === null || Array.isArray(src)) {
                                    target[key] = deepExtend({}, val);
                                    return;
                                } else {
                                    target[key] = deepExtend(src, val);
                                    return;
                                }
                            });
                        });
                        return target;
                    };
                }).call(exports, __webpack_require__(10).Buffer);
            }, function(module, exports, __webpack_require__) {
                (function(Buffer, global) {
                    /*!
		 * The buffer module from node.js, for the browser.
		 *
		 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
		 * @license  MIT
		 */
                    "use strict";
                    var base64 = __webpack_require__(11);
                    var ieee754 = __webpack_require__(12);
                    var isArray = __webpack_require__(13);
                    exports.Buffer = Buffer;
                    exports.SlowBuffer = SlowBuffer;
                    exports.INSPECT_MAX_BYTES = 50;
                    Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
                    exports.kMaxLength = kMaxLength();
                    function typedArraySupport() {
                        try {
                            var arr = new Uint8Array(1);
                            arr.__proto__ = {
                                __proto__: Uint8Array.prototype,
                                foo: function() {
                                    return 42;
                                }
                            };
                            return arr.foo() === 42 && typeof arr.subarray === "function" && arr.subarray(1, 1).byteLength === 0;
                        } catch (e) {
                            return false;
                        }
                    }
                    function kMaxLength() {
                        return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
                    }
                    function createBuffer(that, length) {
                        if (kMaxLength() < length) {
                            throw new RangeError("Invalid typed array length");
                        }
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            that = new Uint8Array(length);
                            that.__proto__ = Buffer.prototype;
                        } else {
                            if (that === null) {
                                that = new Buffer(length);
                            }
                            that.length = length;
                        }
                        return that;
                    }
                    function Buffer(arg, encodingOrOffset, length) {
                        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
                            return new Buffer(arg, encodingOrOffset, length);
                        }
                        if (typeof arg === "number") {
                            if (typeof encodingOrOffset === "string") {
                                throw new Error("If encoding is specified then the first argument must be a string");
                            }
                            return allocUnsafe(this, arg);
                        }
                        return from(this, arg, encodingOrOffset, length);
                    }
                    Buffer.poolSize = 8192;
                    Buffer._augment = function(arr) {
                        arr.__proto__ = Buffer.prototype;
                        return arr;
                    };
                    function from(that, value, encodingOrOffset, length) {
                        if (typeof value === "number") {
                            throw new TypeError('"value" argument must not be a number');
                        }
                        if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
                            return fromArrayBuffer(that, value, encodingOrOffset, length);
                        }
                        if (typeof value === "string") {
                            return fromString(that, value, encodingOrOffset);
                        }
                        return fromObject(that, value);
                    }
                    Buffer.from = function(value, encodingOrOffset, length) {
                        return from(null, value, encodingOrOffset, length);
                    };
                    if (Buffer.TYPED_ARRAY_SUPPORT) {
                        Buffer.prototype.__proto__ = Uint8Array.prototype;
                        Buffer.__proto__ = Uint8Array;
                        if (typeof Symbol !== "undefined" && Symbol.species && Buffer[Symbol.species] === Buffer) {
                            Object.defineProperty(Buffer, Symbol.species, {
                                value: null,
                                configurable: true
                            });
                        }
                    }
                    function assertSize(size) {
                        if (typeof size !== "number") {
                            throw new TypeError('"size" argument must be a number');
                        } else if (size < 0) {
                            throw new RangeError('"size" argument must not be negative');
                        }
                    }
                    function alloc(that, size, fill, encoding) {
                        assertSize(size);
                        if (size <= 0) {
                            return createBuffer(that, size);
                        }
                        if (fill !== undefined) {
                            return typeof encoding === "string" ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
                        }
                        return createBuffer(that, size);
                    }
                    Buffer.alloc = function(size, fill, encoding) {
                        return alloc(null, size, fill, encoding);
                    };
                    function allocUnsafe(that, size) {
                        assertSize(size);
                        that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
                        if (!Buffer.TYPED_ARRAY_SUPPORT) {
                            for (var i = 0; i < size; ++i) {
                                that[i] = 0;
                            }
                        }
                        return that;
                    }
                    Buffer.allocUnsafe = function(size) {
                        return allocUnsafe(null, size);
                    };
                    Buffer.allocUnsafeSlow = function(size) {
                        return allocUnsafe(null, size);
                    };
                    function fromString(that, string, encoding) {
                        if (typeof encoding !== "string" || encoding === "") {
                            encoding = "utf8";
                        }
                        if (!Buffer.isEncoding(encoding)) {
                            throw new TypeError('"encoding" must be a valid string encoding');
                        }
                        var length = byteLength(string, encoding) | 0;
                        that = createBuffer(that, length);
                        var actual = that.write(string, encoding);
                        if (actual !== length) {
                            that = that.slice(0, actual);
                        }
                        return that;
                    }
                    function fromArrayLike(that, array) {
                        var length = array.length < 0 ? 0 : checked(array.length) | 0;
                        that = createBuffer(that, length);
                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255;
                        }
                        return that;
                    }
                    function fromArrayBuffer(that, array, byteOffset, length) {
                        array.byteLength;
                        if (byteOffset < 0 || array.byteLength < byteOffset) {
                            throw new RangeError("'offset' is out of bounds");
                        }
                        if (array.byteLength < byteOffset + (length || 0)) {
                            throw new RangeError("'length' is out of bounds");
                        }
                        if (byteOffset === undefined && length === undefined) {
                            array = new Uint8Array(array);
                        } else if (length === undefined) {
                            array = new Uint8Array(array, byteOffset);
                        } else {
                            array = new Uint8Array(array, byteOffset, length);
                        }
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            that = array;
                            that.__proto__ = Buffer.prototype;
                        } else {
                            that = fromArrayLike(that, array);
                        }
                        return that;
                    }
                    function fromObject(that, obj) {
                        if (Buffer.isBuffer(obj)) {
                            var len = checked(obj.length) | 0;
                            that = createBuffer(that, len);
                            if (that.length === 0) {
                                return that;
                            }
                            obj.copy(that, 0, 0, len);
                            return that;
                        }
                        if (obj) {
                            if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
                                if (typeof obj.length !== "number" || isnan(obj.length)) {
                                    return createBuffer(that, 0);
                                }
                                return fromArrayLike(that, obj);
                            }
                            if (obj.type === "Buffer" && isArray(obj.data)) {
                                return fromArrayLike(that, obj.data);
                            }
                        }
                        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
                    }
                    function checked(length) {
                        if (length >= kMaxLength()) {
                            throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + kMaxLength().toString(16) + " bytes");
                        }
                        return length | 0;
                    }
                    function SlowBuffer(length) {
                        if (+length != length) {
                            length = 0;
                        }
                        return Buffer.alloc(+length);
                    }
                    Buffer.isBuffer = function isBuffer(b) {
                        return !!(b != null && b._isBuffer);
                    };
                    Buffer.compare = function compare(a, b) {
                        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                            throw new TypeError("Arguments must be Buffers");
                        }
                        if (a === b) return 0;
                        var x = a.length;
                        var y = b.length;
                        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                            if (a[i] !== b[i]) {
                                x = a[i];
                                y = b[i];
                                break;
                            }
                        }
                        if (x < y) return -1;
                        if (y < x) return 1;
                        return 0;
                    };
                    Buffer.isEncoding = function isEncoding(encoding) {
                        switch (String(encoding).toLowerCase()) {
                          case "hex":
                          case "utf8":
                          case "utf-8":
                          case "ascii":
                          case "latin1":
                          case "binary":
                          case "base64":
                          case "ucs2":
                          case "ucs-2":
                          case "utf16le":
                          case "utf-16le":
                            return true;

                          default:
                            return false;
                        }
                    };
                    Buffer.concat = function concat(list, length) {
                        if (!isArray(list)) {
                            throw new TypeError('"list" argument must be an Array of Buffers');
                        }
                        if (list.length === 0) {
                            return Buffer.alloc(0);
                        }
                        var i;
                        if (length === undefined) {
                            length = 0;
                            for (i = 0; i < list.length; ++i) {
                                length += list[i].length;
                            }
                        }
                        var buffer = Buffer.allocUnsafe(length);
                        var pos = 0;
                        for (i = 0; i < list.length; ++i) {
                            var buf = list[i];
                            if (!Buffer.isBuffer(buf)) {
                                throw new TypeError('"list" argument must be an Array of Buffers');
                            }
                            buf.copy(buffer, pos);
                            pos += buf.length;
                        }
                        return buffer;
                    };
                    function byteLength(string, encoding) {
                        if (Buffer.isBuffer(string)) {
                            return string.length;
                        }
                        if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
                            return string.byteLength;
                        }
                        if (typeof string !== "string") {
                            string = "" + string;
                        }
                        var len = string.length;
                        if (len === 0) return 0;
                        var loweredCase = false;
                        for (;;) {
                            switch (encoding) {
                              case "ascii":
                              case "latin1":
                              case "binary":
                                return len;

                              case "utf8":
                              case "utf-8":
                              case undefined:
                                return utf8ToBytes(string).length;

                              case "ucs2":
                              case "ucs-2":
                              case "utf16le":
                              case "utf-16le":
                                return len * 2;

                              case "hex":
                                return len >>> 1;

                              case "base64":
                                return base64ToBytes(string).length;

                              default:
                                if (loweredCase) return utf8ToBytes(string).length;
                                encoding = ("" + encoding).toLowerCase();
                                loweredCase = true;
                            }
                        }
                    }
                    Buffer.byteLength = byteLength;
                    function slowToString(encoding, start, end) {
                        var loweredCase = false;
                        if (start === undefined || start < 0) {
                            start = 0;
                        }
                        if (start > this.length) {
                            return "";
                        }
                        if (end === undefined || end > this.length) {
                            end = this.length;
                        }
                        if (end <= 0) {
                            return "";
                        }
                        end >>>= 0;
                        start >>>= 0;
                        if (end <= start) {
                            return "";
                        }
                        if (!encoding) encoding = "utf8";
                        while (true) {
                            switch (encoding) {
                              case "hex":
                                return hexSlice(this, start, end);

                              case "utf8":
                              case "utf-8":
                                return utf8Slice(this, start, end);

                              case "ascii":
                                return asciiSlice(this, start, end);

                              case "latin1":
                              case "binary":
                                return latin1Slice(this, start, end);

                              case "base64":
                                return base64Slice(this, start, end);

                              case "ucs2":
                              case "ucs-2":
                              case "utf16le":
                              case "utf-16le":
                                return utf16leSlice(this, start, end);

                              default:
                                if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                                encoding = (encoding + "").toLowerCase();
                                loweredCase = true;
                            }
                        }
                    }
                    Buffer.prototype._isBuffer = true;
                    function swap(b, n, m) {
                        var i = b[n];
                        b[n] = b[m];
                        b[m] = i;
                    }
                    Buffer.prototype.swap16 = function swap16() {
                        var len = this.length;
                        if (len % 2 !== 0) {
                            throw new RangeError("Buffer size must be a multiple of 16-bits");
                        }
                        for (var i = 0; i < len; i += 2) {
                            swap(this, i, i + 1);
                        }
                        return this;
                    };
                    Buffer.prototype.swap32 = function swap32() {
                        var len = this.length;
                        if (len % 4 !== 0) {
                            throw new RangeError("Buffer size must be a multiple of 32-bits");
                        }
                        for (var i = 0; i < len; i += 4) {
                            swap(this, i, i + 3);
                            swap(this, i + 1, i + 2);
                        }
                        return this;
                    };
                    Buffer.prototype.swap64 = function swap64() {
                        var len = this.length;
                        if (len % 8 !== 0) {
                            throw new RangeError("Buffer size must be a multiple of 64-bits");
                        }
                        for (var i = 0; i < len; i += 8) {
                            swap(this, i, i + 7);
                            swap(this, i + 1, i + 6);
                            swap(this, i + 2, i + 5);
                            swap(this, i + 3, i + 4);
                        }
                        return this;
                    };
                    Buffer.prototype.toString = function toString() {
                        var length = this.length | 0;
                        if (length === 0) return "";
                        if (arguments.length === 0) return utf8Slice(this, 0, length);
                        return slowToString.apply(this, arguments);
                    };
                    Buffer.prototype.equals = function equals(b) {
                        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                        if (this === b) return true;
                        return Buffer.compare(this, b) === 0;
                    };
                    Buffer.prototype.inspect = function inspect() {
                        var str = "";
                        var max = exports.INSPECT_MAX_BYTES;
                        if (this.length > 0) {
                            str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
                            if (this.length > max) str += " ... ";
                        }
                        return "<Buffer " + str + ">";
                    };
                    Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
                        if (!Buffer.isBuffer(target)) {
                            throw new TypeError("Argument must be a Buffer");
                        }
                        if (start === undefined) {
                            start = 0;
                        }
                        if (end === undefined) {
                            end = target ? target.length : 0;
                        }
                        if (thisStart === undefined) {
                            thisStart = 0;
                        }
                        if (thisEnd === undefined) {
                            thisEnd = this.length;
                        }
                        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                            throw new RangeError("out of range index");
                        }
                        if (thisStart >= thisEnd && start >= end) {
                            return 0;
                        }
                        if (thisStart >= thisEnd) {
                            return -1;
                        }
                        if (start >= end) {
                            return 1;
                        }
                        start >>>= 0;
                        end >>>= 0;
                        thisStart >>>= 0;
                        thisEnd >>>= 0;
                        if (this === target) return 0;
                        var x = thisEnd - thisStart;
                        var y = end - start;
                        var len = Math.min(x, y);
                        var thisCopy = this.slice(thisStart, thisEnd);
                        var targetCopy = target.slice(start, end);
                        for (var i = 0; i < len; ++i) {
                            if (thisCopy[i] !== targetCopy[i]) {
                                x = thisCopy[i];
                                y = targetCopy[i];
                                break;
                            }
                        }
                        if (x < y) return -1;
                        if (y < x) return 1;
                        return 0;
                    };
                    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
                        if (buffer.length === 0) return -1;
                        if (typeof byteOffset === "string") {
                            encoding = byteOffset;
                            byteOffset = 0;
                        } else if (byteOffset > 2147483647) {
                            byteOffset = 2147483647;
                        } else if (byteOffset < -2147483648) {
                            byteOffset = -2147483648;
                        }
                        byteOffset = +byteOffset;
                        if (isNaN(byteOffset)) {
                            byteOffset = dir ? 0 : buffer.length - 1;
                        }
                        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
                        if (byteOffset >= buffer.length) {
                            if (dir) return -1; else byteOffset = buffer.length - 1;
                        } else if (byteOffset < 0) {
                            if (dir) byteOffset = 0; else return -1;
                        }
                        if (typeof val === "string") {
                            val = Buffer.from(val, encoding);
                        }
                        if (Buffer.isBuffer(val)) {
                            if (val.length === 0) {
                                return -1;
                            }
                            return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
                        } else if (typeof val === "number") {
                            val = val & 255;
                            if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
                                if (dir) {
                                    return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
                                } else {
                                    return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
                                }
                            }
                            return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
                        }
                        throw new TypeError("val must be string, number or Buffer");
                    }
                    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
                        var indexSize = 1;
                        var arrLength = arr.length;
                        var valLength = val.length;
                        if (encoding !== undefined) {
                            encoding = String(encoding).toLowerCase();
                            if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
                                if (arr.length < 2 || val.length < 2) {
                                    return -1;
                                }
                                indexSize = 2;
                                arrLength /= 2;
                                valLength /= 2;
                                byteOffset /= 2;
                            }
                        }
                        function read(buf, i) {
                            if (indexSize === 1) {
                                return buf[i];
                            } else {
                                return buf.readUInt16BE(i * indexSize);
                            }
                        }
                        var i;
                        if (dir) {
                            var foundIndex = -1;
                            for (i = byteOffset; i < arrLength; i++) {
                                if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                                    if (foundIndex === -1) foundIndex = i;
                                    if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
                                } else {
                                    if (foundIndex !== -1) i -= i - foundIndex;
                                    foundIndex = -1;
                                }
                            }
                        } else {
                            if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
                            for (i = byteOffset; i >= 0; i--) {
                                var found = true;
                                for (var j = 0; j < valLength; j++) {
                                    if (read(arr, i + j) !== read(val, j)) {
                                        found = false;
                                        break;
                                    }
                                }
                                if (found) return i;
                            }
                        }
                        return -1;
                    }
                    Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
                        return this.indexOf(val, byteOffset, encoding) !== -1;
                    };
                    Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
                        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
                    };
                    Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
                        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
                    };
                    function hexWrite(buf, string, offset, length) {
                        offset = Number(offset) || 0;
                        var remaining = buf.length - offset;
                        if (!length) {
                            length = remaining;
                        } else {
                            length = Number(length);
                            if (length > remaining) {
                                length = remaining;
                            }
                        }
                        var strLen = string.length;
                        if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
                        if (length > strLen / 2) {
                            length = strLen / 2;
                        }
                        for (var i = 0; i < length; ++i) {
                            var parsed = parseInt(string.substr(i * 2, 2), 16);
                            if (isNaN(parsed)) return i;
                            buf[offset + i] = parsed;
                        }
                        return i;
                    }
                    function utf8Write(buf, string, offset, length) {
                        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
                    }
                    function asciiWrite(buf, string, offset, length) {
                        return blitBuffer(asciiToBytes(string), buf, offset, length);
                    }
                    function latin1Write(buf, string, offset, length) {
                        return asciiWrite(buf, string, offset, length);
                    }
                    function base64Write(buf, string, offset, length) {
                        return blitBuffer(base64ToBytes(string), buf, offset, length);
                    }
                    function ucs2Write(buf, string, offset, length) {
                        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
                    }
                    Buffer.prototype.write = function write(string, offset, length, encoding) {
                        if (offset === undefined) {
                            encoding = "utf8";
                            length = this.length;
                            offset = 0;
                        } else if (length === undefined && typeof offset === "string") {
                            encoding = offset;
                            length = this.length;
                            offset = 0;
                        } else if (isFinite(offset)) {
                            offset = offset | 0;
                            if (isFinite(length)) {
                                length = length | 0;
                                if (encoding === undefined) encoding = "utf8";
                            } else {
                                encoding = length;
                                length = undefined;
                            }
                        } else {
                            throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                        }
                        var remaining = this.length - offset;
                        if (length === undefined || length > remaining) length = remaining;
                        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
                            throw new RangeError("Attempt to write outside buffer bounds");
                        }
                        if (!encoding) encoding = "utf8";
                        var loweredCase = false;
                        for (;;) {
                            switch (encoding) {
                              case "hex":
                                return hexWrite(this, string, offset, length);

                              case "utf8":
                              case "utf-8":
                                return utf8Write(this, string, offset, length);

                              case "ascii":
                                return asciiWrite(this, string, offset, length);

                              case "latin1":
                              case "binary":
                                return latin1Write(this, string, offset, length);

                              case "base64":
                                return base64Write(this, string, offset, length);

                              case "ucs2":
                              case "ucs-2":
                              case "utf16le":
                              case "utf-16le":
                                return ucs2Write(this, string, offset, length);

                              default:
                                if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                                encoding = ("" + encoding).toLowerCase();
                                loweredCase = true;
                            }
                        }
                    };
                    Buffer.prototype.toJSON = function toJSON() {
                        return {
                            type: "Buffer",
                            data: Array.prototype.slice.call(this._arr || this, 0)
                        };
                    };
                    function base64Slice(buf, start, end) {
                        if (start === 0 && end === buf.length) {
                            return base64.fromByteArray(buf);
                        } else {
                            return base64.fromByteArray(buf.slice(start, end));
                        }
                    }
                    function utf8Slice(buf, start, end) {
                        end = Math.min(buf.length, end);
                        var res = [];
                        var i = start;
                        while (i < end) {
                            var firstByte = buf[i];
                            var codePoint = null;
                            var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
                            if (i + bytesPerSequence <= end) {
                                var secondByte, thirdByte, fourthByte, tempCodePoint;
                                switch (bytesPerSequence) {
                                  case 1:
                                    if (firstByte < 128) {
                                        codePoint = firstByte;
                                    }
                                    break;

                                  case 2:
                                    secondByte = buf[i + 1];
                                    if ((secondByte & 192) === 128) {
                                        tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                                        if (tempCodePoint > 127) {
                                            codePoint = tempCodePoint;
                                        }
                                    }
                                    break;

                                  case 3:
                                    secondByte = buf[i + 1];
                                    thirdByte = buf[i + 2];
                                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                                        tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                                        if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                                            codePoint = tempCodePoint;
                                        }
                                    }
                                    break;

                                  case 4:
                                    secondByte = buf[i + 1];
                                    thirdByte = buf[i + 2];
                                    fourthByte = buf[i + 3];
                                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                                        tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                                        if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                                            codePoint = tempCodePoint;
                                        }
                                    }
                                }
                            }
                            if (codePoint === null) {
                                codePoint = 65533;
                                bytesPerSequence = 1;
                            } else if (codePoint > 65535) {
                                codePoint -= 65536;
                                res.push(codePoint >>> 10 & 1023 | 55296);
                                codePoint = 56320 | codePoint & 1023;
                            }
                            res.push(codePoint);
                            i += bytesPerSequence;
                        }
                        return decodeCodePointsArray(res);
                    }
                    var MAX_ARGUMENTS_LENGTH = 4096;
                    function decodeCodePointsArray(codePoints) {
                        var len = codePoints.length;
                        if (len <= MAX_ARGUMENTS_LENGTH) {
                            return String.fromCharCode.apply(String, codePoints);
                        }
                        var res = "";
                        var i = 0;
                        while (i < len) {
                            res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
                        }
                        return res;
                    }
                    function asciiSlice(buf, start, end) {
                        var ret = "";
                        end = Math.min(buf.length, end);
                        for (var i = start; i < end; ++i) {
                            ret += String.fromCharCode(buf[i] & 127);
                        }
                        return ret;
                    }
                    function latin1Slice(buf, start, end) {
                        var ret = "";
                        end = Math.min(buf.length, end);
                        for (var i = start; i < end; ++i) {
                            ret += String.fromCharCode(buf[i]);
                        }
                        return ret;
                    }
                    function hexSlice(buf, start, end) {
                        var len = buf.length;
                        if (!start || start < 0) start = 0;
                        if (!end || end < 0 || end > len) end = len;
                        var out = "";
                        for (var i = start; i < end; ++i) {
                            out += toHex(buf[i]);
                        }
                        return out;
                    }
                    function utf16leSlice(buf, start, end) {
                        var bytes = buf.slice(start, end);
                        var res = "";
                        for (var i = 0; i < bytes.length; i += 2) {
                            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
                        }
                        return res;
                    }
                    Buffer.prototype.slice = function slice(start, end) {
                        var len = this.length;
                        start = ~~start;
                        end = end === undefined ? len : ~~end;
                        if (start < 0) {
                            start += len;
                            if (start < 0) start = 0;
                        } else if (start > len) {
                            start = len;
                        }
                        if (end < 0) {
                            end += len;
                            if (end < 0) end = 0;
                        } else if (end > len) {
                            end = len;
                        }
                        if (end < start) end = start;
                        var newBuf;
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            newBuf = this.subarray(start, end);
                            newBuf.__proto__ = Buffer.prototype;
                        } else {
                            var sliceLen = end - start;
                            newBuf = new Buffer(sliceLen, undefined);
                            for (var i = 0; i < sliceLen; ++i) {
                                newBuf[i] = this[i + start];
                            }
                        }
                        return newBuf;
                    };
                    function checkOffset(offset, ext, length) {
                        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
                        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
                    }
                    Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) checkOffset(offset, byteLength, this.length);
                        var val = this[offset];
                        var mul = 1;
                        var i = 0;
                        while (++i < byteLength && (mul *= 256)) {
                            val += this[offset + i] * mul;
                        }
                        return val;
                    };
                    Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) {
                            checkOffset(offset, byteLength, this.length);
                        }
                        var val = this[offset + --byteLength];
                        var mul = 1;
                        while (byteLength > 0 && (mul *= 256)) {
                            val += this[offset + --byteLength] * mul;
                        }
                        return val;
                    };
                    Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 1, this.length);
                        return this[offset];
                    };
                    Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length);
                        return this[offset] | this[offset + 1] << 8;
                    };
                    Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length);
                        return this[offset] << 8 | this[offset + 1];
                    };
                    Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);
                        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
                    };
                    Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);
                        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
                    };
                    Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) checkOffset(offset, byteLength, this.length);
                        var val = this[offset];
                        var mul = 1;
                        var i = 0;
                        while (++i < byteLength && (mul *= 256)) {
                            val += this[offset + i] * mul;
                        }
                        mul *= 128;
                        if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                        return val;
                    };
                    Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) checkOffset(offset, byteLength, this.length);
                        var i = byteLength;
                        var mul = 1;
                        var val = this[offset + --i];
                        while (i > 0 && (mul *= 256)) {
                            val += this[offset + --i] * mul;
                        }
                        mul *= 128;
                        if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                        return val;
                    };
                    Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 1, this.length);
                        if (!(this[offset] & 128)) return this[offset];
                        return (255 - this[offset] + 1) * -1;
                    };
                    Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length);
                        var val = this[offset] | this[offset + 1] << 8;
                        return val & 32768 ? val | 4294901760 : val;
                    };
                    Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length);
                        var val = this[offset + 1] | this[offset] << 8;
                        return val & 32768 ? val | 4294901760 : val;
                    };
                    Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);
                        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
                    };
                    Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);
                        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
                    };
                    Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);
                        return ieee754.read(this, offset, true, 23, 4);
                    };
                    Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);
                        return ieee754.read(this, offset, false, 23, 4);
                    };
                    Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 8, this.length);
                        return ieee754.read(this, offset, true, 52, 8);
                    };
                    Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 8, this.length);
                        return ieee754.read(this, offset, false, 52, 8);
                    };
                    function checkInt(buf, value, offset, ext, max, min) {
                        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
                        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
                        if (offset + ext > buf.length) throw new RangeError("Index out of range");
                    }
                    Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) {
                            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                            checkInt(this, value, offset, byteLength, maxBytes, 0);
                        }
                        var mul = 1;
                        var i = 0;
                        this[offset] = value & 255;
                        while (++i < byteLength && (mul *= 256)) {
                            this[offset + i] = value / mul & 255;
                        }
                        return offset + byteLength;
                    };
                    Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) {
                            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                            checkInt(this, value, offset, byteLength, maxBytes, 0);
                        }
                        var i = byteLength - 1;
                        var mul = 1;
                        this[offset + i] = value & 255;
                        while (--i >= 0 && (mul *= 256)) {
                            this[offset + i] = value / mul & 255;
                        }
                        return offset + byteLength;
                    };
                    Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
                        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                        this[offset] = value & 255;
                        return offset + 1;
                    };
                    function objectWriteUInt16(buf, value, offset, littleEndian) {
                        if (value < 0) value = 65535 + value + 1;
                        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
                            buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
                        }
                    }
                    Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value & 255;
                            this[offset + 1] = value >>> 8;
                        } else {
                            objectWriteUInt16(this, value, offset, true);
                        }
                        return offset + 2;
                    };
                    Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value >>> 8;
                            this[offset + 1] = value & 255;
                        } else {
                            objectWriteUInt16(this, value, offset, false);
                        }
                        return offset + 2;
                    };
                    function objectWriteUInt32(buf, value, offset, littleEndian) {
                        if (value < 0) value = 4294967295 + value + 1;
                        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
                            buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255;
                        }
                    }
                    Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset + 3] = value >>> 24;
                            this[offset + 2] = value >>> 16;
                            this[offset + 1] = value >>> 8;
                            this[offset] = value & 255;
                        } else {
                            objectWriteUInt32(this, value, offset, true);
                        }
                        return offset + 4;
                    };
                    Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value >>> 24;
                            this[offset + 1] = value >>> 16;
                            this[offset + 2] = value >>> 8;
                            this[offset + 3] = value & 255;
                        } else {
                            objectWriteUInt32(this, value, offset, false);
                        }
                        return offset + 4;
                    };
                    Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) {
                            var limit = Math.pow(2, 8 * byteLength - 1);
                            checkInt(this, value, offset, byteLength, limit - 1, -limit);
                        }
                        var i = 0;
                        var mul = 1;
                        var sub = 0;
                        this[offset] = value & 255;
                        while (++i < byteLength && (mul *= 256)) {
                            if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                                sub = 1;
                            }
                            this[offset + i] = (value / mul >> 0) - sub & 255;
                        }
                        return offset + byteLength;
                    };
                    Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) {
                            var limit = Math.pow(2, 8 * byteLength - 1);
                            checkInt(this, value, offset, byteLength, limit - 1, -limit);
                        }
                        var i = byteLength - 1;
                        var mul = 1;
                        var sub = 0;
                        this[offset + i] = value & 255;
                        while (--i >= 0 && (mul *= 256)) {
                            if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                                sub = 1;
                            }
                            this[offset + i] = (value / mul >> 0) - sub & 255;
                        }
                        return offset + byteLength;
                    };
                    Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
                        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                        if (value < 0) value = 255 + value + 1;
                        this[offset] = value & 255;
                        return offset + 1;
                    };
                    Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value & 255;
                            this[offset + 1] = value >>> 8;
                        } else {
                            objectWriteUInt16(this, value, offset, true);
                        }
                        return offset + 2;
                    };
                    Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value >>> 8;
                            this[offset + 1] = value & 255;
                        } else {
                            objectWriteUInt16(this, value, offset, false);
                        }
                        return offset + 2;
                    };
                    Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value & 255;
                            this[offset + 1] = value >>> 8;
                            this[offset + 2] = value >>> 16;
                            this[offset + 3] = value >>> 24;
                        } else {
                            objectWriteUInt32(this, value, offset, true);
                        }
                        return offset + 4;
                    };
                    Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                        if (value < 0) value = 4294967295 + value + 1;
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value >>> 24;
                            this[offset + 1] = value >>> 16;
                            this[offset + 2] = value >>> 8;
                            this[offset + 3] = value & 255;
                        } else {
                            objectWriteUInt32(this, value, offset, false);
                        }
                        return offset + 4;
                    };
                    function checkIEEE754(buf, value, offset, ext, max, min) {
                        if (offset + ext > buf.length) throw new RangeError("Index out of range");
                        if (offset < 0) throw new RangeError("Index out of range");
                    }
                    function writeFloat(buf, value, offset, littleEndian, noAssert) {
                        if (!noAssert) {
                            checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
                        }
                        ieee754.write(buf, value, offset, littleEndian, 23, 4);
                        return offset + 4;
                    }
                    Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
                        return writeFloat(this, value, offset, true, noAssert);
                    };
                    Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
                        return writeFloat(this, value, offset, false, noAssert);
                    };
                    function writeDouble(buf, value, offset, littleEndian, noAssert) {
                        if (!noAssert) {
                            checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
                        }
                        ieee754.write(buf, value, offset, littleEndian, 52, 8);
                        return offset + 8;
                    }
                    Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
                        return writeDouble(this, value, offset, true, noAssert);
                    };
                    Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
                        return writeDouble(this, value, offset, false, noAssert);
                    };
                    Buffer.prototype.copy = function copy(target, targetStart, start, end) {
                        if (!start) start = 0;
                        if (!end && end !== 0) end = this.length;
                        if (targetStart >= target.length) targetStart = target.length;
                        if (!targetStart) targetStart = 0;
                        if (end > 0 && end < start) end = start;
                        if (end === start) return 0;
                        if (target.length === 0 || this.length === 0) return 0;
                        if (targetStart < 0) {
                            throw new RangeError("targetStart out of bounds");
                        }
                        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
                        if (end < 0) throw new RangeError("sourceEnd out of bounds");
                        if (end > this.length) end = this.length;
                        if (target.length - targetStart < end - start) {
                            end = target.length - targetStart + start;
                        }
                        var len = end - start;
                        var i;
                        if (this === target && start < targetStart && targetStart < end) {
                            for (i = len - 1; i >= 0; --i) {
                                target[i + targetStart] = this[i + start];
                            }
                        } else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
                            for (i = 0; i < len; ++i) {
                                target[i + targetStart] = this[i + start];
                            }
                        } else {
                            Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
                        }
                        return len;
                    };
                    Buffer.prototype.fill = function fill(val, start, end, encoding) {
                        if (typeof val === "string") {
                            if (typeof start === "string") {
                                encoding = start;
                                start = 0;
                                end = this.length;
                            } else if (typeof end === "string") {
                                encoding = end;
                                end = this.length;
                            }
                            if (val.length === 1) {
                                var code = val.charCodeAt(0);
                                if (code < 256) {
                                    val = code;
                                }
                            }
                            if (encoding !== undefined && typeof encoding !== "string") {
                                throw new TypeError("encoding must be a string");
                            }
                            if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
                                throw new TypeError("Unknown encoding: " + encoding);
                            }
                        } else if (typeof val === "number") {
                            val = val & 255;
                        }
                        if (start < 0 || this.length < start || this.length < end) {
                            throw new RangeError("Out of range index");
                        }
                        if (end <= start) {
                            return this;
                        }
                        start = start >>> 0;
                        end = end === undefined ? this.length : end >>> 0;
                        if (!val) val = 0;
                        var i;
                        if (typeof val === "number") {
                            for (i = start; i < end; ++i) {
                                this[i] = val;
                            }
                        } else {
                            var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
                            var len = bytes.length;
                            for (i = 0; i < end - start; ++i) {
                                this[i + start] = bytes[i % len];
                            }
                        }
                        return this;
                    };
                    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
                    function base64clean(str) {
                        str = stringtrim(str).replace(INVALID_BASE64_RE, "");
                        if (str.length < 2) return "";
                        while (str.length % 4 !== 0) {
                            str = str + "=";
                        }
                        return str;
                    }
                    function stringtrim(str) {
                        if (str.trim) return str.trim();
                        return str.replace(/^\s+|\s+$/g, "");
                    }
                    function toHex(n) {
                        if (n < 16) return "0" + n.toString(16);
                        return n.toString(16);
                    }
                    function utf8ToBytes(string, units) {
                        units = units || Infinity;
                        var codePoint;
                        var length = string.length;
                        var leadSurrogate = null;
                        var bytes = [];
                        for (var i = 0; i < length; ++i) {
                            codePoint = string.charCodeAt(i);
                            if (codePoint > 55295 && codePoint < 57344) {
                                if (!leadSurrogate) {
                                    if (codePoint > 56319) {
                                        if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                        continue;
                                    } else if (i + 1 === length) {
                                        if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                        continue;
                                    }
                                    leadSurrogate = codePoint;
                                    continue;
                                }
                                if (codePoint < 56320) {
                                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                    leadSurrogate = codePoint;
                                    continue;
                                }
                                codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
                            } else if (leadSurrogate) {
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                            }
                            leadSurrogate = null;
                            if (codePoint < 128) {
                                if ((units -= 1) < 0) break;
                                bytes.push(codePoint);
                            } else if (codePoint < 2048) {
                                if ((units -= 2) < 0) break;
                                bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
                            } else if (codePoint < 65536) {
                                if ((units -= 3) < 0) break;
                                bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
                            } else if (codePoint < 1114112) {
                                if ((units -= 4) < 0) break;
                                bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
                            } else {
                                throw new Error("Invalid code point");
                            }
                        }
                        return bytes;
                    }
                    function asciiToBytes(str) {
                        var byteArray = [];
                        for (var i = 0; i < str.length; ++i) {
                            byteArray.push(str.charCodeAt(i) & 255);
                        }
                        return byteArray;
                    }
                    function utf16leToBytes(str, units) {
                        var c, hi, lo;
                        var byteArray = [];
                        for (var i = 0; i < str.length; ++i) {
                            if ((units -= 2) < 0) break;
                            c = str.charCodeAt(i);
                            hi = c >> 8;
                            lo = c % 256;
                            byteArray.push(lo);
                            byteArray.push(hi);
                        }
                        return byteArray;
                    }
                    function base64ToBytes(str) {
                        return base64.toByteArray(base64clean(str));
                    }
                    function blitBuffer(src, dst, offset, length) {
                        for (var i = 0; i < length; ++i) {
                            if (i + offset >= dst.length || i >= src.length) break;
                            dst[i + offset] = src[i];
                        }
                        return i;
                    }
                    function isnan(val) {
                        return val !== val;
                    }
                }).call(exports, __webpack_require__(10).Buffer, function() {
                    return this;
                }());
            }, function(module, exports) {
                "use strict";
                exports.byteLength = byteLength;
                exports.toByteArray = toByteArray;
                exports.fromByteArray = fromByteArray;
                var lookup = [];
                var revLookup = [];
                var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
                var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                for (var i = 0, len = code.length; i < len; ++i) {
                    lookup[i] = code[i];
                    revLookup[code.charCodeAt(i)] = i;
                }
                revLookup["-".charCodeAt(0)] = 62;
                revLookup["_".charCodeAt(0)] = 63;
                function placeHoldersCount(b64) {
                    var len = b64.length;
                    if (len % 4 > 0) {
                        throw new Error("Invalid string. Length must be a multiple of 4");
                    }
                    return b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
                }
                function byteLength(b64) {
                    return b64.length * 3 / 4 - placeHoldersCount(b64);
                }
                function toByteArray(b64) {
                    var i, j, l, tmp, placeHolders, arr;
                    var len = b64.length;
                    placeHolders = placeHoldersCount(b64);
                    arr = new Arr(len * 3 / 4 - placeHolders);
                    l = placeHolders > 0 ? len - 4 : len;
                    var L = 0;
                    for (i = 0, j = 0; i < l; i += 4, j += 3) {
                        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
                        arr[L++] = tmp >> 16 & 255;
                        arr[L++] = tmp >> 8 & 255;
                        arr[L++] = tmp & 255;
                    }
                    if (placeHolders === 2) {
                        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
                        arr[L++] = tmp & 255;
                    } else if (placeHolders === 1) {
                        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
                        arr[L++] = tmp >> 8 & 255;
                        arr[L++] = tmp & 255;
                    }
                    return arr;
                }
                function tripletToBase64(num) {
                    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
                }
                function encodeChunk(uint8, start, end) {
                    var tmp;
                    var output = [];
                    for (var i = start; i < end; i += 3) {
                        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                        output.push(tripletToBase64(tmp));
                    }
                    return output.join("");
                }
                function fromByteArray(uint8) {
                    var tmp;
                    var len = uint8.length;
                    var extraBytes = len % 3;
                    var output = "";
                    var parts = [];
                    var maxChunkLength = 16383;
                    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                        parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
                    }
                    if (extraBytes === 1) {
                        tmp = uint8[len - 1];
                        output += lookup[tmp >> 2];
                        output += lookup[tmp << 4 & 63];
                        output += "==";
                    } else if (extraBytes === 2) {
                        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
                        output += lookup[tmp >> 10];
                        output += lookup[tmp >> 4 & 63];
                        output += lookup[tmp << 2 & 63];
                        output += "=";
                    }
                    parts.push(output);
                    return parts.join("");
                }
            }, function(module, exports) {
                exports.read = function(buffer, offset, isLE, mLen, nBytes) {
                    var e, m;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var nBits = -7;
                    var i = isLE ? nBytes - 1 : 0;
                    var d = isLE ? -1 : 1;
                    var s = buffer[offset + i];
                    i += d;
                    e = s & (1 << -nBits) - 1;
                    s >>= -nBits;
                    nBits += eLen;
                    for (;nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
                    m = e & (1 << -nBits) - 1;
                    e >>= -nBits;
                    nBits += mLen;
                    for (;nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
                    if (e === 0) {
                        e = 1 - eBias;
                    } else if (e === eMax) {
                        return m ? NaN : (s ? -1 : 1) * Infinity;
                    } else {
                        m = m + Math.pow(2, mLen);
                        e = e - eBias;
                    }
                    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
                };
                exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
                    var e, m, c;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
                    var i = isLE ? 0 : nBytes - 1;
                    var d = isLE ? 1 : -1;
                    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
                    value = Math.abs(value);
                    if (isNaN(value) || value === Infinity) {
                        m = isNaN(value) ? 1 : 0;
                        e = eMax;
                    } else {
                        e = Math.floor(Math.log(value) / Math.LN2);
                        if (value * (c = Math.pow(2, -e)) < 1) {
                            e--;
                            c *= 2;
                        }
                        if (e + eBias >= 1) {
                            value += rt / c;
                        } else {
                            value += rt * Math.pow(2, 1 - eBias);
                        }
                        if (value * c >= 2) {
                            e++;
                            c /= 2;
                        }
                        if (e + eBias >= eMax) {
                            m = 0;
                            e = eMax;
                        } else if (e + eBias >= 1) {
                            m = (value * c - 1) * Math.pow(2, mLen);
                            e = e + eBias;
                        } else {
                            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                            e = 0;
                        }
                    }
                    for (;mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {}
                    e = e << mLen | m;
                    eLen += mLen;
                    for (;eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {}
                    buffer[offset + i - d] |= s * 128;
                };
            }, function(module, exports) {
                var toString = {}.toString;
                module.exports = Array.isArray || function(arr) {
                    return toString.call(arr) == "[object Array]";
                };
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var __extends = this && this.__extends || function(d, b) {
                    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
                var Plugin_1 = __webpack_require__(15);
                var OrthographicCamera = THREE.OrthographicCamera;
                var Chart_1 = __webpack_require__(19);
                var Widget_1 = __webpack_require__(28);
                var Utils_1 = __webpack_require__(16);
                var AxisWidget_1 = __webpack_require__(29);
                var GridWidget_1 = __webpack_require__(30);
                var TrendsGradientWidget_1 = __webpack_require__(32);
                var TrendsLineWidget_1 = __webpack_require__(34);
                var TrendsCandleWidget_1 = __webpack_require__(35);
                var deps_1 = __webpack_require__(17);
                var Color_1 = __webpack_require__(31);
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
                        var backgroundColor = new Color_1.Color(chart.state.backgroundColor);
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
                        var preinstalledWidgetsClasses = this.constructor.preinstalledWidgets.slice();
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
                        this.chart.render();
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
                        this.unsubscribers = [ this.chart.interpolatedViewport.onInterpolation(function(options) {
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
                        var camSettings = this.chart.viewport.getCameraSettings();
                        if (!this.camera) {
                            this.camera = new OrthographicCamera(camSettings.left, camSettings.right, camSettings.top, camSettings.bottom, camSettings.near, camSettings.far);
                            this.scene.add(this.camera);
                        } else {
                            this.camera.left = camSettings.left;
                            this.camera.right = camSettings.right;
                            this.camera.top = camSettings.top;
                            this.camera.bottom = camSettings.bottom;
                            this.camera.near = camSettings.near;
                            this.camera.far = camSettings.far;
                            this.camera.updateProjectionMatrix();
                        }
                        this.camera.position.set(camSettings.left, camSettings.bottom, 0);
                        this.cameraInitialPosition = this.camera.position.clone();
                        this.onScreenTransformHandler(this.chart.interpolatedViewport.params);
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
                        var MAX_ZOOM_VALUE = 1.5;
                        var MIN_ZOOM_VALUE = .7;
                        zoomValue = Math.min(zoomValue, MAX_ZOOM_VALUE);
                        zoomValue = Math.max(zoomValue, MIN_ZOOM_VALUE);
                        this.chart.zoom(zoomValue, zoomOrigin);
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
                    ChartView.preinstalledWidgets = [ TrendsLineWidget_1.TrendsLineWidget, TrendsCandleWidget_1.TrendsCandlesWidget, AxisWidget_1.AxisWidget, GridWidget_1.GridWidget, TrendsGradientWidget_1.TrendsGradientWidget ];
                    return ChartView;
                }(ChartBlankView);
                exports.ChartView = ChartView;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var Utils_1 = __webpack_require__(16);
                var EventEmmiter_1 = __webpack_require__(18);
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
                            return changedPluginsStates[_this.name] && _this.onStateChangedHandler(changedPluginsStates[_this.name]);
                        }));
                    };
                    ChartPlugin.prototype.getOptions = function() {
                        return this.chart.state.pluginsState[this.name];
                    };
                    ChartPlugin.prototype.onInitialStateAppliedHandler = function(initialState) {};
                    ChartPlugin.prototype.onReadyHandler = function() {};
                    ChartPlugin.prototype.onStateChangedHandler = function(changedState) {};
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
                var deps_1 = __webpack_require__(17);
                var Utils = function() {
                    function Utils() {}
                    Utils.deepMerge = function(obj1, obj2, mergeArrays) {
                        return deps_1.deepExtend({}, obj1, obj2);
                    };
                    Utils.deepCopy = function(obj) {
                        return JSON.parse(JSON.stringify(obj));
                    };
                    Utils.patch = function(objectToPatch, patch) {
                        var idKey = "_id";
                        for (var key in patch) {
                            if (!patch.hasOwnProperty(key)) continue;
                            if (objectToPatch[key]) {
                                if (Array.isArray(patch[key])) {
                                    var _loop_1 = function(patchItem) {
                                        var subObject = objectToPatch[key].find(function(item) {
                                            return item[idKey] != void 0 && item[idKey] === patchItem[idKey];
                                        });
                                        if (subObject) {
                                            this_1.patch(subObject, patchItem);
                                        } else {
                                            objectToPatch[key].push(patchItem);
                                        }
                                    };
                                    var this_1 = this;
                                    for (var _i = 0, _a = patch[key]; _i < _a.length; _i++) {
                                        var patchItem = _a[_i];
                                        _loop_1(patchItem);
                                    }
                                    continue;
                                } else if (typeof patch[key] === "object" && objectToPatch[key] != void 0) {
                                    if (patch[idKey] && Object.keys(patch).length == 1) {
                                        delete objectToPatch[key];
                                    } else {
                                        this.patch(objectToPatch[key], patch[key]);
                                    }
                                    continue;
                                }
                            }
                            objectToPatch[key] = patch[key];
                        }
                        if (objectToPatch["_onUpdate"]) objectToPatch["_onUpdate"].call(objectToPatch, patch);
                        return objectToPatch;
                    };
                    Utils.travers = function(object, fn) {
                        for (var key in object) {
                            if (!object.hasOwnProperty(key)) continue;
                            var allowTraverseDeeper = fn(object[key]);
                            var canTraverseDeeper = allowTraverseDeeper && typeof object[key] == "object";
                            if (canTraverseDeeper) this.travers(object[key], fn);
                        }
                    };
                    Utils.setIdsToArrayItems = function(sourceObject) {
                        var idKey = "_id";
                        Utils.travers(sourceObject, function(item) {
                            if (!Array.isArray(item)) return true;
                            var arr = item;
                            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                                var obj = arr_1[_i];
                                if (typeof obj !== "object" || Array.isArray(obj)) continue;
                                if (!obj[idKey]) obj[idKey] = Utils.getUid();
                            }
                        });
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
                        fn && fn(ctx, width, height);
                        var texture = new THREE.Texture(canvas);
                        texture.needsUpdate = true;
                        texture.anisotropy = 16;
                        return texture;
                    };
                    Utils.createNearestTexture = function(width, height, fn) {
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
                    Utils.binarySearchInd = function(arr, num, key) {
                        var mid;
                        var lo = 0;
                        var hi = arr.length - 1;
                        while (hi - lo > 1) {
                            mid = Math.floor((hi - lo) / 2);
                            if (arr[mid][key] < num) {
                                lo = mid;
                            } else {
                                hi = mid;
                            }
                            if (arr[lo][key] == num) {
                                return lo;
                            } else if (arr[hi][key] == num) {
                                return hi;
                            }
                        }
                        return arr[lo] && arr[lo][key] == num ? lo : -1;
                    };
                    Utils.binarySearch = function(arr, num, key) {
                        var ind = this.binarySearchInd(arr, num, key);
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
                            } else if (typeof srcObject[key] == "function") {
                                dstObject[key] = srcObject[key];
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
                function __export(m) {
                    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                __export(__webpack_require__(2));
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var deps_1 = __webpack_require__(17);
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
                var Trend_1 = __webpack_require__(20);
                var EventEmmiter_1 = __webpack_require__(18);
                var Utils_1 = __webpack_require__(16);
                var TrendsManager_1 = __webpack_require__(22);
                var Viewport_1 = __webpack_require__(23);
                var InterpolatedViewport_1 = __webpack_require__(24);
                var deps_1 = __webpack_require__(2);
                var AnimationManager_1 = __webpack_require__(25);
                var Easing_1 = __webpack_require__(26);
                var interfaces_1 = __webpack_require__(27);
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
                    VIEWPORT_CHANGE: "viewportChange",
                    DRAG_STATE_CHAGED: "scrollStop",
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
                                color: LIGHT_BLUE
                            },
                            animations: {
                                enabled: true,
                                trendChangeSpeed: .5,
                                trendChangeEase: void 0,
                                zoomSpeed: 250,
                                scrollSpeed: 1e3,
                                scrollEase: Easing_1.EASING.Quadratic.Out,
                                zoomEase: Easing_1.EASING.Quadratic.Out,
                                autoScrollSpeed: 1100,
                                autoScrollEase: Easing_1.EASING.Linear.None
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
                            maxVisibleSegments: 1280,
                            inertialScroll: false
                        };
                        this.plugins = {};
                        this.isReady = false;
                        this.isDestroyed = false;
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.ee.setMaxListeners(initialState.eventEmitterMaxListeners || this.state.eventEmitterMaxListeners);
                        this.state = Utils_1.Utils.patch(this.state, initialState);
                        this.trendsManager = new TrendsManager_1.TrendsManager(this, initialState);
                        initialState.trends = this.trendsManager.calculatedOptions;
                        initialState = this.installPlugins(plugins, initialState);
                        this.animationManager = new AnimationManager_1.AnimationManager();
                        this.animationManager.setAimationsEnabled(this.state.animations.enabled);
                        this.viewport = new Viewport_1.Viewport(this);
                        this.setState(initialState);
                        this.setState({
                            computedData: this.getComputedData()
                        });
                        this.savePrevState();
                        this.interpolatedViewport = new InterpolatedViewport_1.InterpolatedViewport(this);
                        this.bindEvents();
                        this.ee.emit(CHART_STATE_EVENTS.INITIAL_STATE_APPLIED, initialState);
                        this.isReady = true;
                        this.ee.emit(CHART_STATE_EVENTS.READY, initialState);
                    }
                    Chart.prototype.destroy = function() {
                        this.ee.emit(CHART_STATE_EVENTS.DESTROY);
                        this.ee.removeAllListeners();
                        this.state = {};
                        this.isDestroyed = true;
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
                    Chart.prototype.onDragStateChanged = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.DRAG_STATE_CHAGED, cb);
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
                    Chart.prototype.onViewportChange = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.VIEWPORT_CHANGE, cb);
                    };
                    Chart.prototype.onPluginsStateChange = function(cb) {
                        return this.ee.subscribe(CHART_STATE_EVENTS.PLUGINS_STATE_CHANGED, cb);
                    };
                    Chart.prototype.getTrend = function(trendName) {
                        return this.trendsManager.getTrend(trendName);
                    };
                    Chart.prototype.render = function() {
                        this.animationManager.tick();
                    };
                    Chart.prototype.setState = function(newState, eventData, silent) {
                        if (silent === void 0) {
                            silent = false;
                        }
                        if (this.isDestroyed) {
                            Utils_1.Utils.error("You have tried to change state of destroyed Chart instance");
                        }
                        var trendsData = {};
                        if (newState.trends) for (var trendName in newState.trends) {
                            var trendOptions = newState.trends[trendName];
                            if (trendOptions.data) trendsData[trendName] = trendOptions.data;
                            delete trendOptions.data;
                        }
                        var newStateContainsData = Object.keys(trendsData).length > 0;
                        newState = Utils_1.Utils.deepMerge({}, newState);
                        Utils_1.Utils.setIdsToArrayItems(newState);
                        var currentStateData = this.state;
                        var newStateObj = newState;
                        var changedProps = {};
                        for (var key in newStateObj) {
                            if (currentStateData[key] !== newStateObj[key]) {
                                changedProps[key] = newStateObj[key];
                            }
                        }
                        this.savePrevState(changedProps);
                        this.state = Utils_1.Utils.patch(this.state, newState);
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
                        var actualData = Utils_1.Utils.patch({}, data);
                        var cursorOptions = changedProps.cursor;
                        var isMouseDrag = cursorOptions && data.cursor.dragMode && data.prevState.cursor.dragMode;
                        if (isMouseDrag) {
                            var oldX = data.prevState.cursor.x;
                            var currentX = cursorOptions.x;
                            var currentScroll = data.xAxis.range.scroll;
                            var deltaXVal = this.viewport.pxToValByXAxis(oldX - currentX);
                            patch.xAxis = {
                                range: {
                                    scroll: currentScroll + deltaXVal
                                }
                            };
                            actualData = Utils_1.Utils.patch(actualData, {
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
                                Utils_1.Utils.patch(patch, {
                                    xAxis: xAxisPatch
                                });
                                Utils_1.Utils.patch(actualData, {
                                    xAxis: xAxisPatch
                                });
                            }
                        }
                        var needToRecalculateYAxis = chartWasResized || (data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.RELATIVE_END || data.yAxis.range.type === interfaces_1.AXIS_RANGE_TYPE.AUTO || data.yAxis.range.isMirrorMode) && (scrollXChanged || changedProps.trends || changedProps.yAxis) || this.state.yAxis.range.zeroVal == void 0;
                        if (needToRecalculateYAxis) {
                            var yAxisPatch = this.recalculateYAxis(actualData);
                            if (yAxisPatch) {
                                Utils_1.Utils.patch(patch, {
                                    yAxis: yAxisPatch
                                });
                                Utils_1.Utils.patch(actualData, {
                                    yAxis: yAxisPatch
                                });
                            }
                        }
                        this.savePrevState(patch);
                        var allChangedProps = Utils_1.Utils.deepMerge(changedProps, patch);
                        patch.computedData = this.getComputedData(allChangedProps);
                        this.savePrevState(patch);
                        Utils_1.Utils.patch(this.state, patch);
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
                        var dragEventNeeded = changedProps.cursor && changedProps.cursor.dragMode != prevState.cursor.dragMode;
                        dragEventNeeded && this.ee.emit(CHART_STATE_EVENTS.DRAG_STATE_CHAGED, changedProps.cursor.dragMode, changedProps);
                        var scrollChangeEventsNeeded = changedProps.xAxis && changedProps.xAxis.range && changedProps.xAxis.range.scroll != void 0;
                        scrollChangeEventsNeeded && this.ee.emit(CHART_STATE_EVENTS.SCROLL, changedProps);
                        var zoomEventsNeeded = changedProps.xAxis && changedProps.xAxis.range && changedProps.xAxis.range.zoom || changedProps.yAxis && changedProps.yAxis.range && changedProps.yAxis.range.zoom;
                        zoomEventsNeeded && this.ee.emit(CHART_STATE_EVENTS.ZOOM, changedProps);
                        var resizeEventNeeded = changedProps.width || changedProps.height;
                        resizeEventNeeded && this.ee.emit(CHART_STATE_EVENTS.RESIZE, changedProps);
                        var viewportChangeEventNeeded = scrollChangeEventsNeeded || zoomEventsNeeded || resizeEventNeeded;
                        if (viewportChangeEventNeeded) this.ee.emit(CHART_STATE_EVENTS.VIEWPORT_CHANGE, changedProps);
                        var pluginStateChangedEventNeeded = !!changedProps.pluginsState;
                        pluginStateChangedEventNeeded && this.ee.emit(CHART_STATE_EVENTS.PLUGINS_STATE_CHANGED, changedProps.pluginsState);
                    };
                    Chart.prototype.installPlugins = function(plugins, initialState) {
                        var _this = this;
                        initialState.pluginsState = {};
                        plugins.forEach(function(plugin) {
                            var PluginClass = plugin.constructor;
                            var pluginName = PluginClass.NAME;
                            initialState.pluginsState[pluginName] = plugin.initialState;
                            _this.plugins[pluginName] = plugin;
                            plugin.setupChart(_this);
                        });
                        return initialState;
                    };
                    Chart.prototype.getPlugin = function(pluginName) {
                        return this.plugins[pluginName];
                    };
                    Chart.prototype.bindEvents = function() {
                        var _this = this;
                        this.ee.on(CHART_STATE_EVENTS.TRENDS_CHANGE, function(changedTrends, newData) {
                            _this.handleTrendsChange(changedTrends, newData);
                        });
                        this.onDragStateChanged(function(dragState) {
                            return _this.onDragStateChangedHandler(dragState);
                        });
                        this.ee.on("animationsChange", function(animationOptions) {
                            if (animationOptions.enabled !== _this.animationManager.isAnimationsEnabled) {
                                _this.animationManager.setAimationsEnabled(animationOptions.enabled);
                            }
                        });
                    };
                    Chart.prototype.handleTrendsChange = function(changedTrends, newData) {
                        for (var trendName in changedTrends) {
                            this.ee.emit(CHART_STATE_EVENTS.TREND_CHANGE, trendName, changedTrends[trendName], newData);
                        }
                        var state = this.state;
                        if (!state.autoScroll || state.cursor.dragMode) return;
                        var oldTrendsMaxX = state.prevState.computedData.trends.maxXVal;
                        var trendsMaxXDelta = state.computedData.trends.maxXVal - oldTrendsMaxX;
                        if (trendsMaxXDelta > 0) {
                            var maxVisibleXVal = this.viewport.getRightVal();
                            var paddingRightVal = this.viewport.getValByViewportX(this.state.width - state.xAxis.range.padding.end - state.xAxis.range.margin.end);
                            var marginRightVal = this.viewport.getValByViewportX(this.state.width - state.xAxis.range.margin.end);
                            var currentScroll = state.xAxis.range.scroll;
                            if (oldTrendsMaxX < marginRightVal || oldTrendsMaxX > maxVisibleXVal) {
                                return;
                            }
                            var scrollDelta = state.computedData.trends.maxXVal - paddingRightVal;
                            this.setState({
                                xAxis: {
                                    range: {
                                        scroll: currentScroll + scrollDelta
                                    }
                                }
                            });
                        }
                    };
                    Chart.prototype.onDragStateChangedHandler = function(isDragMode) {
                        var state = this.state;
                        if (!state.inertialScroll || isDragMode) return;
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
                            var maxScreenY = Math.round(this.viewport.getViewportYByVal(maxY));
                            var minScreenY = Math.round(this.viewport.getViewportYByVal(minY));
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
                        var state = this.state;
                        var endXVal = this.trendsManager.getEndXVal();
                        var range = state.xAxis.range;
                        var scroll = endXVal - this.viewport.pxToValByXAxis(state.width) + this.viewport.pxToValByXAxis(range.padding.end + range.margin.end) - range.zeroVal;
                        this.setState({
                            xAxis: {
                                range: {
                                    scroll: scroll
                                }
                            }
                        });
                        return new deps_1.Promise(function(resolve) {
                            var animationTime = state.animations.enabled ? state.animations.scrollSpeed : 0;
                            setTimeout(resolve, animationTime);
                        });
                    };
                    return Chart;
                }();
                exports.Chart = Chart;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var Utils_1 = __webpack_require__(16);
                var TrendSegmentsManager_1 = __webpack_require__(21);
                var EventEmmiter_1 = __webpack_require__(18);
                var deps_1 = __webpack_require__(2);
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
                        this.chart = chartState;
                        this.calculatedOptions = Utils_1.Utils.deepMerge(this.chart.state.trendDefaultState, options);
                        this.calculatedOptions.name = trendName;
                        if (options.dataset) this.calculatedOptions.data = Trend.prepareData(options.dataset);
                        this.calculatedOptions.dataset = [];
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.segmentsManager = new TrendSegmentsManager_1.TrendSegmentsManager(this.chart, this);
                        this.bindEvents();
                    }
                    Trend.prototype.bindEvents = function() {
                        var _this = this;
                        var chartState = this.chart;
                        chartState.onDragStateChanged(function() {
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
                        this.chart.setState(statePatch, newData);
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
                        return this.chart.state.trends[this.name];
                    };
                    Trend.prototype.setOptions = function(options) {
                        this.chart.setState({
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
                        var chartState = this.chart;
                        var minXVal = chartState.state.computedData.trends.minXVal;
                        var minScreenX = chartState.viewport.getViewportYByVal(minXVal);
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
                var EventEmmiter_1 = __webpack_require__(18);
                var Vector3 = THREE.Vector3;
                var Trend_1 = __webpack_require__(20);
                var Utils_1 = __webpack_require__(16);
                var MAX_ANIMATED_SEGMENTS = 100;
                var EVENTS = {
                    REBUILD: "rebuild",
                    DISLPAYED_RANGE_CHANGED: "displayedRangeChanged",
                    ANIMATION_FRAME: "animationFrame"
                };
                var TrendSegmentsManager = function() {
                    function TrendSegmentsManager(chart, trend) {
                        this.segmentsById = {};
                        this.segments = [];
                        this.animatedSegmentsIds = [];
                        this.segmentsLength = 0;
                        this.animatedSegmentsForAppend = [];
                        this.animatedSegmentsForPrepend = [];
                        this.nextEmptyId = 0;
                        this.startSegmentId = 0;
                        this.endSegmentId = 0;
                        this.unbindList = [];
                        this.chart = chart;
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.trend = trend;
                        this.bindEvents();
                    }
                    TrendSegmentsManager.prototype.bindEvents = function() {
                        var _this = this;
                        this.trend.onChange(function(changedOptions, newData) {
                            return _this.onTrendChangeHandler(changedOptions, newData);
                        });
                        this.unbindList = [ this.chart.onInitialStateApplied(function() {
                            return _this.onInitialStateAppliedHandler();
                        }), this.chart.onZoom(function() {
                            return _this.onZoomHandler();
                        }), this.chart.onScroll(function() {
                            return _this.recalculateDisplayedRange();
                        }), this.chart.onDestroy(function() {
                            return _this.onDestroyHandler();
                        }) ];
                    };
                    TrendSegmentsManager.prototype.unbindEvents = function() {
                        this.unbindList.forEach(function(unbind) {
                            return unbind();
                        });
                    };
                    TrendSegmentsManager.prototype.onInitialStateAppliedHandler = function() {
                        this.maxSegmentLength = this.trend.getOptions().maxSegmentLength;
                        this.tryToRebuildSegments();
                    };
                    TrendSegmentsManager.prototype.onDestroyHandler = function() {
                        this.ee.removeAllListeners();
                        this.unbindEvents();
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
                        var currentSegmentLengthInPx = Number(this.chart.viewport.valToPxByXAxis(segmentLength).toFixed(2));
                        var currentMaxSegmentLengthInPx = Number(this.chart.viewport.valToPxByXAxis(this.maxSegmentLength).toFixed(2));
                        if (currentSegmentLengthInPx < minSegmentLengthInPx) {
                            needToRebuild = true;
                            segmentLength = Math.ceil(this.chart.viewport.pxToValByXAxis(maxSegmentLengthInPx));
                        } else if (currentMaxSegmentLengthInPx > maxSegmentLengthInPx) {
                            needToRebuild = true;
                            segmentLength = this.chart.viewport.pxToValByXAxis(minSegmentLengthInPx);
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
                        var _a = this.chart.state.xAxis.range, from = _a.from, to = _a.to;
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
                                if (!initialAnimationState) {
                                    initialAnimationState = initialSegment.createAnimationState();
                                }
                                segment.initialAnimationState = Utils_1.Utils.deepMerge({}, initialAnimationState);
                                if (this.animatedSegmentsForAppend.length > 0) {
                                    segment.initialAnimationState.startXVal = initialAnimationState.endXVal;
                                    segment.initialAnimationState.startYVal = initialAnimationState.endYVal;
                                }
                                segment.currentAnimationState = Utils_1.Utils.deepMerge({}, initialAnimationState);
                                segment.targetAnimationState = segment.createAnimationState();
                                this.animatedSegmentsForAppend.push(id);
                            }
                            if (isLastItem && itemIsInserted) break;
                            if (!segment.isCompleted) continue;
                            segment = this.allocateNextSegment();
                            var prevItem = trendData[startItemInd + itemInd - 1];
                            segment.appendItem(prevItem);
                        }
                        var animationsOptions = this.chart.state.animations;
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
                        var animationsOptions = this.chart.state.animations;
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
                        var animationsOptions = this.chart.state.animations;
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
                        this.currentAnimationState = this.createAnimationState();
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
                    return TrendSegment;
                }();
                exports.TrendSegment = TrendSegment;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var Trend_1 = __webpack_require__(20);
                var EventEmmiter_1 = __webpack_require__(18);
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
                    TrendsManager.prototype.createTrend = function(state, trendName, initialState) {
                        var _this = this;
                        var trend = new Trend_1.Trend(state, trendName, initialState);
                        this.trends[trendName] = trend;
                        trend.segmentsManager.onRebuild(function() {
                            return _this.ee.emit(EVENTS.SEGMENTS_REBUILDED, trendName);
                        });
                        return trend;
                    };
                    return TrendsManager;
                }();
                exports.TrendsManager = TrendsManager;
            }, function(module, exports) {
                "use strict";
                var Viewport = function() {
                    function Viewport(chart) {
                        this.params = {};
                        this.chart = chart;
                        this.updateParams();
                        this.bindEvents();
                    }
                    Viewport.prototype.bindEvents = function() {
                        var _this = this;
                        this.chart.onChange(function() {
                            return _this.updateParams();
                        });
                    };
                    Viewport.prototype.updateParams = function() {
                        var state = this.chart.state;
                        this.params.scrollXVal = state.xAxis.range.scroll;
                        this.params.scrollYVal = state.yAxis.range.scroll;
                        this.params.scrollX = this.valToPxByXAxis(this.params.scrollXVal);
                        this.params.scrollY = this.valToPxByYAxis(this.params.scrollYVal);
                        this.params.zoomX = state.xAxis.range.zoom;
                        this.params.zoomY = state.yAxis.range.zoom;
                    };
                    Viewport.prototype.getCameraSettings = function() {
                        var _a = this.chart.state, width = _a.width, height = _a.height;
                        return {
                            left: 0,
                            right: width,
                            top: height,
                            bottom: 0,
                            near: -500,
                            far: 1e3
                        };
                    };
                    Viewport.prototype.getWorldXByVal = function(xVal) {
                        var _a = this.chart.state.xAxis.range, scaleFactor = _a.scaleFactor, zeroVal = _a.zeroVal;
                        var zoom = this.params.zoomX;
                        return (xVal - zeroVal) * scaleFactor * zoom;
                    };
                    Viewport.prototype.getWorldYByVal = function(yVal) {
                        var _a = this.chart.state.yAxis.range, scaleFactor = _a.scaleFactor, zeroVal = _a.zeroVal;
                        var zoom = this.params.zoomY;
                        return (yVal - zeroVal) * scaleFactor * zoom;
                    };
                    Viewport.prototype.getWorldXByViewportX = function(viewportX) {
                        return this.getWorldXByVal(this.getValByViewportX(viewportX));
                    };
                    Viewport.prototype.getWorldYByViewportY = function(viewportY) {
                        return this.getWorldYByVal(this.getValByViewportY(viewportY));
                    };
                    Viewport.prototype.getValByWorldX = function(worldX) {
                        return this.chart.state.xAxis.range.zeroVal + this.pxToValByXAxis(worldX);
                    };
                    Viewport.prototype.getValByWorldY = function(worldY) {
                        return this.chart.state.yAxis.range.zeroVal + this.pxToValByYAxis(worldY);
                    };
                    Viewport.prototype.getValByViewportX = function(x) {
                        return this.chart.state.xAxis.range.zeroVal + this.params.scrollXVal + this.pxToValByXAxis(x);
                    };
                    Viewport.prototype.getValByViewportY = function(y) {
                        return this.chart.state.yAxis.range.zeroVal + this.params.scrollYVal + this.pxToValByYAxis(y);
                    };
                    Viewport.prototype.getViewportXByVal = function(xVal) {
                        return this.getWorldXByVal(xVal) - this.params.scrollX;
                    };
                    Viewport.prototype.getViewportYByVal = function(yVal) {
                        return this.getWorldYByVal(yVal) - this.params.scrollY;
                    };
                    Viewport.prototype.getViewportXByWorldX = function(worldX) {
                        return worldX - this.params.scrollX;
                    };
                    Viewport.prototype.valToPxByXAxis = function(val) {
                        return val * this.chart.state.xAxis.range.scaleFactor * this.params.zoomX;
                    };
                    Viewport.prototype.valToPxByYAxis = function(val) {
                        return val * this.chart.state.yAxis.range.scaleFactor * this.params.zoomY;
                    };
                    Viewport.prototype.pxToValByXAxis = function(pixelsCount) {
                        return pixelsCount / this.chart.state.xAxis.range.scaleFactor / this.params.zoomX;
                    };
                    Viewport.prototype.pxToValByYAxis = function(pixelsCount) {
                        return pixelsCount / this.chart.state.yAxis.range.scaleFactor / this.params.zoomY;
                    };
                    Viewport.prototype.getTop = function() {
                        return this.params.scrollY + this.chart.state.height;
                    };
                    Viewport.prototype.getRight = function() {
                        return this.params.scrollX + this.chart.state.width;
                    };
                    Viewport.prototype.getBottom = function() {
                        return this.params.scrollY;
                    };
                    Viewport.prototype.getLeft = function() {
                        return this.params.scrollX;
                    };
                    Viewport.prototype.getTopVal = function() {
                        return this.getValByWorldY(this.getTop());
                    };
                    Viewport.prototype.getRightVal = function() {
                        return this.getValByWorldX(this.getRight());
                    };
                    Viewport.prototype.getBottomVal = function() {
                        return this.getValByWorldY(this.getBottom());
                    };
                    Viewport.prototype.getLeftVal = function() {
                        return this.getValByWorldX(this.getLeft());
                    };
                    return Viewport;
                }();
                exports.Viewport = Viewport;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var __extends = this && this.__extends || function(d, b) {
                    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
                var EventEmmiter_1 = __webpack_require__(18);
                var Viewport_1 = __webpack_require__(23);
                (function(INTERPOLATION_EVENT) {
                    INTERPOLATION_EVENT[INTERPOLATION_EVENT["STARTED"] = 0] = "STARTED";
                    INTERPOLATION_EVENT[INTERPOLATION_EVENT["FINISHED"] = 1] = "FINISHED";
                })(exports.INTERPOLATION_EVENT || (exports.INTERPOLATION_EVENT = {}));
                var INTERPOLATION_EVENT = exports.INTERPOLATION_EVENT;
                var SCREEN_EVENTS = {
                    ZOOM_FRAME: "zoomFrame",
                    SCROLL_FRAME: "scrollFrame",
                    TRANSFORMATION_FRAME: "transformationFrame",
                    TRANSFORMATION_EVENT: "transformationStateChanged"
                };
                var InterpolatedViewport = function(_super) {
                    __extends(InterpolatedViewport, _super);
                    function InterpolatedViewport(chart) {
                        _super.call(this, chart);
                        this.interpolationInProgress = false;
                        var _a = chart.state, w = _a.width, h = _a.height;
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.setParams(chart.viewport.params);
                    }
                    InterpolatedViewport.prototype.onZoomInterpolation = function(cb) {
                        return this.ee.subscribe(SCREEN_EVENTS.ZOOM_FRAME, cb);
                    };
                    InterpolatedViewport.prototype.onScrollInterpolation = function(cb) {
                        return this.ee.subscribe(SCREEN_EVENTS.SCROLL_FRAME, cb);
                    };
                    InterpolatedViewport.prototype.onInterpolation = function(cb) {
                        return this.ee.subscribe(SCREEN_EVENTS.TRANSFORMATION_FRAME, cb);
                    };
                    InterpolatedViewport.prototype.onInterpolationEvent = function(cb) {
                        return this.ee.subscribe(SCREEN_EVENTS.TRANSFORMATION_EVENT, cb);
                    };
                    InterpolatedViewport.prototype.cameraIsMoving = function() {
                        return !!(this.scrollXAnimation && !this.scrollXAnimation.isFinished || this.zoomXAnimation && !this.zoomXAnimation.isFinished);
                    };
                    InterpolatedViewport.prototype.setParams = function(options, silent) {
                        if (silent === void 0) {
                            silent = false;
                        }
                        var scrollX = options.scrollX, scrollY = options.scrollY, zoomX = options.zoomX, zoomY = options.zoomY;
                        if (scrollX != void 0) this.params.scrollX = scrollX;
                        if (scrollY != void 0) this.params.scrollY = scrollY;
                        if (zoomX != void 0) this.params.zoomX = zoomX;
                        if (zoomY != void 0) this.params.zoomY = zoomY;
                        if (scrollX != void 0 || zoomX) {
                            options.scrollXVal = this.pxToValByXAxis(scrollX != void 0 ? scrollX : this.params.scrollX);
                            this.params.scrollXVal = options.scrollXVal;
                        }
                        if (scrollY != void 0 || zoomY) {
                            options.scrollYVal = this.pxToValByYAxis(scrollY != void 0 ? scrollY : this.params.scrollY);
                            this.params.scrollYVal = options.scrollYVal;
                        }
                        if (silent) return;
                        var hasActiveAnimations = this.scrollXAnimation && !this.scrollXAnimation.isStopped || this.scrollYAnimation && !this.scrollYAnimation.isStopped || this.zoomXAnimation && !this.zoomXAnimation.isStopped || this.zoomYAnimation && !this.zoomYAnimation.isStopped;
                        var interpolationStarted = hasActiveAnimations && !this.interpolationInProgress;
                        var interpolationFinished = !hasActiveAnimations && this.interpolationInProgress;
                        if (interpolationStarted) {
                            this.interpolationInProgress = true;
                            this.ee.emit(SCREEN_EVENTS.TRANSFORMATION_EVENT, INTERPOLATION_EVENT.STARTED);
                        }
                        if (interpolationFinished) {
                            this.interpolationInProgress = false;
                        }
                        if (!this.interpolationInProgress) {
                            this.params.scrollX = options.scrollX = Math.round(this.params.scrollX);
                            this.params.scrollY = options.scrollY = Math.round(this.params.scrollY);
                        }
                        this.ee.emit(SCREEN_EVENTS.TRANSFORMATION_FRAME, options);
                        var scrollEventNeeded = options.scrollXVal != void 0 || options.scrollYVal != void 0;
                        if (scrollEventNeeded) this.ee.emit(SCREEN_EVENTS.SCROLL_FRAME, options);
                        var zoomEventNeeded = options.zoomX != void 0 || options.zoomY != void 0;
                        if (zoomEventNeeded) this.ee.emit(SCREEN_EVENTS.ZOOM_FRAME, options);
                        if (interpolationFinished) {
                            this.ee.emit(SCREEN_EVENTS.TRANSFORMATION_EVENT, INTERPOLATION_EVENT.FINISHED);
                        }
                    };
                    InterpolatedViewport.prototype.bindEvents = function() {
                        var _this = this;
                        var state = this.chart;
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
                    InterpolatedViewport.prototype.onDestroyHandler = function() {
                        this.ee.removeAllListeners();
                    };
                    InterpolatedViewport.prototype.onScrollXHandler = function(changedProps) {
                        var _this = this;
                        var chart = this.chart;
                        var isDragMode = chart.state.cursor.dragMode;
                        var animations = chart.state.animations;
                        var zoomXChanged = changedProps.xAxis.range.zoom;
                        var isAutoscroll = chart.state.autoScroll && !isDragMode && !zoomXChanged;
                        var time = isAutoscroll ? animations.autoScrollSpeed : animations.zoomSpeed;
                        var ease = isAutoscroll ? animations.autoScrollEase : animations.zoomEase;
                        var range = chart.state.xAxis.range;
                        var targetX = range.scroll * range.scaleFactor * range.zoom;
                        if (isDragMode && !chart.state.inertialScroll) time = 0;
                        if (this.scrollXAnimation) this.scrollXAnimation.stop();
                        this.scrollXAnimation = chart.animationManager.animate(time, ease).from(this.params.scrollX).to(targetX).onTick(function(value) {
                            _this.setParams({
                                scrollX: value
                            });
                        });
                    };
                    InterpolatedViewport.prototype.onScrollYHandler = function() {
                        var _this = this;
                        var chart = this.chart;
                        var animations = chart.state.animations;
                        var range = chart.state.yAxis.range;
                        var targetY = range.scroll * range.scaleFactor * range.zoom;
                        if (this.scrollYAnimation) this.scrollYAnimation.stop();
                        this.scrollYAnimation = chart.animationManager.animate(animations.zoomSpeed, animations.zoomEase).from(this.params.scrollY).to(targetY).onTick(function(value) {
                            _this.setParams({
                                scrollY: value
                            });
                        });
                    };
                    InterpolatedViewport.prototype.onZoomXHandler = function() {
                        var _this = this;
                        var chart = this.chart;
                        var animations = chart.state.animations;
                        var targetZoom = chart.state.xAxis.range.zoom;
                        if (this.zoomXAnimation) this.zoomXAnimation.stop();
                        this.zoomXAnimation = chart.animationManager.animate(animations.zoomSpeed, animations.zoomEase).from(this.params.zoomX).to(targetZoom).onTick(function(value) {
                            _this.setParams({
                                zoomX: value
                            });
                        });
                    };
                    InterpolatedViewport.prototype.onZoomYHandler = function() {
                        var _this = this;
                        var chart = this.chart;
                        var targetZoom = chart.state.yAxis.range.zoom;
                        var animations = chart.state.animations;
                        if (this.zoomYAnimation) this.zoomYAnimation.stop();
                        this.zoomYAnimation = chart.animationManager.animate(animations.zoomSpeed, animations.zoomEase).from(this.params.zoomY).to(targetZoom).onTick(function(value) {
                            _this.setParams({
                                zoomY: value
                            });
                        });
                    };
                    return InterpolatedViewport;
                }(Viewport_1.Viewport);
                exports.InterpolatedViewport = InterpolatedViewport;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                var Easing_1 = __webpack_require__(26);
                var AnimationManager = function() {
                    function AnimationManager() {
                        this.isAnimationsEnabled = true;
                        this.animations = [];
                        this.lastTickTime = Date.now();
                    }
                    AnimationManager.prototype.animate = function(time, timingFunction) {
                        var animation = new Animation(this, time, this.lastTickTime, timingFunction);
                        this.animations.push(animation);
                        return animation;
                    };
                    AnimationManager.prototype.animateObj = function(source, target) {};
                    AnimationManager.prototype.setAimationsEnabled = function(isEnabled) {
                        this.isAnimationsEnabled = isEnabled;
                    };
                    AnimationManager.prototype.tick = function() {
                        var now = Date.now();
                        var animations = this.animations;
                        for (var i_1 = 0; i_1 < animations.length; i_1++) {
                            var animation = animations[i_1];
                            if (this.isAnimationsEnabled) {
                                animation.tick(now);
                            } else {
                                animation.completeAndStop();
                            }
                        }
                        var i = animations.length;
                        while (i--) if (animations[i].isStopped) animations.splice(i, 1);
                        this.lastTickTime = now;
                    };
                    AnimationManager.prototype.hasActiveAnimations = function() {
                        return this.animations.length > 0;
                    };
                    return AnimationManager;
                }();
                exports.AnimationManager = AnimationManager;
                var Animation = function() {
                    function Animation(animationManager, time, createdTime, easing) {
                        if (easing === void 0) {
                            easing = Easing_1.EASING.Quadratic.Out;
                        }
                        this.animationManager = animationManager;
                        this.time = time;
                        this.createdTime = createdTime;
                        this.easing = easing;
                        this.progress = 0;
                        this.delay = 0;
                        this.isFinished = false;
                        this.isStopped = false;
                        this.startTime = createdTime;
                    }
                    Animation.prototype.tick = function(now) {
                        if (!this.isStopped) {
                            var progress = this.time > 0 ? (now - this.startTime) / this.time : 1;
                            this.setProgress(progress);
                        }
                    };
                    Animation.prototype.from = function(sourceObj) {
                        if (typeof sourceObj == "object") {
                            this.sourceObj = sourceObj;
                            this.initialObj = {};
                            var sourceIteralable = sourceObj;
                            for (var key in sourceIteralable) if (typeof sourceIteralable[key] == "number") {
                                this.initialObj[key] = sourceIteralable[key];
                            }
                        } else if (typeof sourceObj == "number") {
                            this.sourceObj = sourceObj;
                            this.initialObj = sourceObj;
                        }
                        return this;
                    };
                    Animation.prototype.to = function(targetObj) {
                        this.targetObject = targetObj;
                        if (typeof this.initialObj == "object") {
                            var initialIteralable = this.initialObj;
                            for (var key in this.targetObject) {
                                if (initialIteralable[key] == void 0) delete initialIteralable[key];
                            }
                            var targetIteralable = this.targetObject;
                            for (var key in initialIteralable) {
                                if (targetIteralable[key] == void 0) delete initialIteralable[key];
                            }
                        }
                        return this;
                    };
                    Animation.prototype.onTick = function(onTickCb) {
                        this.onTickCb = onTickCb;
                        return this;
                    };
                    Animation.prototype.then = function(onFinishCb) {
                        this.onFinishCb = onFinishCb;
                        return this;
                    };
                    Animation.prototype.stop = function() {
                        this.isStopped = true;
                    };
                    Animation.prototype.completeAndStop = function() {
                        this.setProgress(1);
                    };
                    Animation.prototype.withDelay = function(delay) {
                        this.delay = delay;
                        this.startTime = this.createdTime + delay;
                        return this;
                    };
                    Animation.prototype.setProgress = function(progress) {
                        if (progress < 0) return;
                        progress = Math.min(progress, 1);
                        this.progress = progress;
                        var k = this.easing(progress);
                        if (typeof this.sourceObj == "number") {
                            var initialVal = this.initialObj;
                            var targetVal = this.targetObject;
                            this.sourceObj = initialVal + (targetVal - initialVal) * k;
                        } else if (this.sourceObj && this.targetObject) {
                            for (var key in this.initialObj) {
                                var initialVal = this.initialObj[key];
                                var targetVal = this.targetObject[key];
                                this.sourceObj[key] = initialVal + (targetVal - initialVal) * k;
                            }
                        }
                        if (progress == 1) {
                            this.isStopped = true;
                            this.isFinished = true;
                        }
                        if (this.onTickCb) this.onTickCb(this.sourceObj, progress, k, this);
                        if (progress == 1 && this.onFinishCb) this.onFinishCb(this.sourceObj, this);
                    };
                    return Animation;
                }();
                exports.Animation = Animation;
            }, function(module, exports) {
                "use strict";
                exports.EASING = {
                    Linear: {
                        None: function(k) {
                            return k;
                        }
                    },
                    Quadratic: {
                        In: function(k) {
                            return k * k;
                        },
                        Out: function(k) {
                            return k * (2 - k);
                        },
                        InOut: function(k) {
                            if ((k *= 2) < 1) {
                                return .5 * k * k;
                            }
                            return -.5 * (--k * (k - 2) - 1);
                        }
                    },
                    Cubic: {
                        In: function(k) {
                            return k * k * k;
                        },
                        Out: function(k) {
                            return --k * k * k + 1;
                        },
                        InOut: function(k) {
                            if ((k *= 2) < 1) {
                                return .5 * k * k * k;
                            }
                            return .5 * ((k -= 2) * k * k + 2);
                        }
                    },
                    Quartic: {
                        In: function(k) {
                            return k * k * k * k;
                        },
                        Out: function(k) {
                            return 1 - --k * k * k * k;
                        },
                        InOut: function(k) {
                            if ((k *= 2) < 1) {
                                return .5 * k * k * k * k;
                            }
                            return -.5 * ((k -= 2) * k * k * k - 2);
                        }
                    },
                    Quintic: {
                        In: function(k) {
                            return k * k * k * k * k;
                        },
                        Out: function(k) {
                            return --k * k * k * k * k + 1;
                        },
                        InOut: function(k) {
                            if ((k *= 2) < 1) {
                                return .5 * k * k * k * k * k;
                            }
                            return .5 * ((k -= 2) * k * k * k * k + 2);
                        }
                    },
                    Sinusoidal: {
                        In: function(k) {
                            return 1 - Math.cos(k * Math.PI / 2);
                        },
                        Out: function(k) {
                            return Math.sin(k * Math.PI / 2);
                        },
                        InOut: function(k) {
                            return .5 * (1 - Math.cos(Math.PI * k));
                        }
                    },
                    Exponential: {
                        In: function(k) {
                            return k === 0 ? 0 : Math.pow(1024, k - 1);
                        },
                        Out: function(k) {
                            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
                        },
                        InOut: function(k) {
                            if (k === 0) {
                                return 0;
                            }
                            if (k === 1) {
                                return 1;
                            }
                            if ((k *= 2) < 1) {
                                return .5 * Math.pow(1024, k - 1);
                            }
                            return .5 * (-Math.pow(2, -10 * (k - 1)) + 2);
                        }
                    },
                    Circular: {
                        In: function(k) {
                            return 1 - Math.sqrt(1 - k * k);
                        },
                        Out: function(k) {
                            return Math.sqrt(1 - --k * k);
                        },
                        InOut: function(k) {
                            if ((k *= 2) < 1) {
                                return -.5 * (Math.sqrt(1 - k * k) - 1);
                            }
                            return .5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
                        }
                    },
                    Elastic: {
                        In: function(k) {
                            if (k === 0) {
                                return 0;
                            }
                            if (k === 1) {
                                return 1;
                            }
                            return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
                        },
                        Out: function(k) {
                            if (k === 0) {
                                return 0;
                            }
                            if (k === 1) {
                                return 1;
                            }
                            return Math.pow(2, -10 * k) * Math.sin((k - .1) * 5 * Math.PI) + 1;
                        },
                        InOut: function(k) {
                            if (k === 0) {
                                return 0;
                            }
                            if (k === 1) {
                                return 1;
                            }
                            k *= 2;
                            if (k < 1) {
                                return -.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
                            }
                            return .5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
                        }
                    },
                    Back: {
                        In: function(k) {
                            var s = 1.70158;
                            return k * k * ((s + 1) * k - s);
                        },
                        Out: function(k) {
                            var s = 1.70158;
                            return --k * k * ((s + 1) * k + s) + 1;
                        },
                        InOut: function(k) {
                            var s = 1.70158 * 1.525;
                            if ((k *= 2) < 1) {
                                return .5 * (k * k * ((s + 1) * k - s));
                            }
                            return .5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
                        }
                    },
                    Bounce: {
                        In: function(k) {
                            return 1 - exports.EASING.Bounce.Out(1 - k);
                        },
                        Out: function(k) {
                            if (k < 1 / 2.75) {
                                return 7.5625 * k * k;
                            } else if (k < 2 / 2.75) {
                                return 7.5625 * (k -= 1.5 / 2.75) * k + .75;
                            } else if (k < 2.5 / 2.75) {
                                return 7.5625 * (k -= 2.25 / 2.75) * k + .9375;
                            } else {
                                return 7.5625 * (k -= 2.625 / 2.75) * k + .984375;
                            }
                        },
                        InOut: function(k) {
                            if (k < .5) {
                                return exports.EASING.Bounce.In(k * 2) * .5;
                            }
                            return exports.EASING.Bounce.Out(k * 2 - 1) * .5 + .5;
                        }
                    }
                };
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
                var Widget_1 = __webpack_require__(28);
                var GridWidget_1 = __webpack_require__(30);
                var Utils_1 = __webpack_require__(16);
                var interfaces_1 = __webpack_require__(27);
                var Color_1 = __webpack_require__(31);
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
                        this.onScrollChange(this.chart.interpolatedViewport.params.scrollX, this.chart.interpolatedViewport.params.scrollY);
                        this.bindEvents();
                    };
                    AxisWidget.prototype.bindEvents = function() {
                        var _this = this;
                        var state = this.chart;
                        this.bindEvent(state.interpolatedViewport.onInterpolation(function(options) {
                            _this.onScrollChange(options.scrollX, options.scrollY);
                        }), state.interpolatedViewport.onZoomInterpolation(function(options) {
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
                        var texture = Utils_1.Utils.createNearestTexture(canvasWidth, canvasHeight, function(ctx) {
                            var color = new Color_1.Color(axisOptions.color);
                            ctx.beginPath();
                            ctx.font = _this.chart.state.font.m;
                            ctx.fillStyle = color.rgbaStr;
                            ctx.strokeStyle = color.rgbaStr;
                        });
                        var material = new THREE.MeshBasicMaterial({
                            map: texture,
                            side: THREE.DoubleSide
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
                        var _b = this.chart.interpolatedViewport.params, scrollX = _b.scrollX, scrollY = _b.scrollY, zoomX = _b.zoomX, zoomY = _b.zoomY;
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
                        if (isXAxis) {
                            axisMesh.position.x = canvasWidth / 2 - visibleWidth + scrollX;
                        }
                        var texture = axisMesh.material.map;
                        var ctx = texture.image.getContext("2d");
                        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                        var edgeOffset = axisGridParams.segmentsCount * axisGridParams.step;
                        var startVal = axisGridParams.start - edgeOffset;
                        var endVal = axisGridParams.end + edgeOffset;
                        ctx.beginPath();
                        for (var val = startVal; val <= endVal; val += axisGridParams.step) {
                            var displayedValue = "";
                            if (isXAxis) {
                                var pxVal = this.chart.interpolatedViewport.getWorldXByVal(val) - scrollX + visibleWidth;
                                ctx.textAlign = "center";
                                if (axisOptions.dataType == interfaces_1.AXIS_DATA_TYPE.DATE) {
                                    displayedValue = AxisWidget.getDateStr(val, axisGridParams);
                                } else {
                                    displayedValue = Number(val.toFixed(14)).toString();
                                }
                                ctx.fillText(displayedValue, pxVal, canvasHeight - 10);
                            } else {
                                var pxVal = canvasHeight - this.chart.interpolatedViewport.getWorldYByVal(val) + scrollY;
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
                var Widget_1 = __webpack_require__(28);
                var LineSegments = THREE.LineSegments;
                var Utils_1 = __webpack_require__(16);
                var Color_1 = __webpack_require__(31);
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
                        }), this.chart.interpolatedViewport.onZoomInterpolation(function(options) {
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
                        var color = new Color_1.Color(this.chart.state.xAxis.grid.color);
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
                        var widthVal = chartState.viewport.pxToValByXAxis(chartState.state.width);
                        return [ new THREE.Vector3(widthVal * 2 + scrollXVal, localYVal, 0), new THREE.Vector3(-widthVal + scrollXVal, localYVal, 0) ];
                    };
                    GridWidget.prototype.getVerticalLineSegment = function(xVal, scrollXVal, scrollYVal) {
                        var chart = this.chart;
                        var localXVal = xVal - chart.state.xAxis.range.zeroVal - scrollXVal;
                        var heightVal = chart.viewport.pxToValByYAxis(chart.state.height);
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
                var Utils_1 = __webpack_require__(16);
                var TrendsWidget_1 = __webpack_require__(33);
                var Color_1 = __webpack_require__(31);
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
                        var color = new Color_1.Color(this.trend.getOptions().backgroundColor);
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
                        for (var i = 0; i < segmentsToProcessCnt; i++) {
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
                        var screenHeightVal = Math.max(this.chart.viewport.pxToValByYAxis(this.chart.state.height), this.chart.interpolatedViewport.pxToValByYAxis(this.chart.state.height));
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
                var Widget_1 = __webpack_require__(28);
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
                        this.bindEvent(this.chart.interpolatedViewport.onInterpolation(function(options) {
                            return _this.onTransformationFrame(options);
                        }));
                        this.bindEvent(this.chart.interpolatedViewport.onZoomInterpolation(function(options) {
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
                var TrendsWidget_1 = __webpack_require__(33);
                var LineSegments = THREE.LineSegments;
                var Trend_1 = __webpack_require__(20);
                var Utils_1 = __webpack_require__(16);
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
                var TrendsWidget_1 = __webpack_require__(33);
                var Object3D = THREE.Object3D;
                var Geometry = THREE.Geometry;
                var Vector3 = THREE.Vector3;
                var Mesh = THREE.Mesh;
                var Line = THREE.Line;
                var MeshBasicMaterial = THREE.MeshBasicMaterial;
                var PlaneGeometry = THREE.PlaneGeometry;
                var Trend_1 = __webpack_require__(20);
                var LineBasicMaterial = THREE.LineBasicMaterial;
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
                        this.rect = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({
                            side: THREE.DoubleSide
                        }));
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
                var Utils_1 = __webpack_require__(16);
                var EventEmmiter_1 = __webpack_require__(18);
                var UniqCollectionItem = function() {
                    function UniqCollectionItem() {}
                    UniqCollectionItem.prototype.getId = function() {
                        return this._id;
                    };
                    return UniqCollectionItem;
                }();
                exports.UniqCollectionItem = UniqCollectionItem;
                var ID_KEY = "_id";
                var EVENTS = {
                    CREATE: "create",
                    UPDATE: "update",
                    REMOVE: "remove"
                };
                var UniqCollection = function() {
                    function UniqCollection(options) {
                        this.items = [];
                        this.ee = new EventEmmiter_1.EventEmitter();
                        this.options = options;
                    }
                    UniqCollection.prototype.patch = function(models) {
                        var options = this.options;
                        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
                            var model = models_1[_i];
                            var id = model[ID_KEY];
                            if (!id) Utils_1.Utils.error("Collection item without id detected");
                            var ind = this.getItemInd(id);
                            var item = this.items[ind];
                            var justCreated = false;
                            if (!item) {
                                justCreated = true;
                                item = options.createInstance(model);
                                this.items.push(item);
                            }
                            if (Object.keys(model).length > 1) {
                                var prevProps = {};
                                Utils_1.Utils.copyProps(item, prevProps, model);
                                Utils_1.Utils.patch(item, model);
                                justCreated && this.ee.emit(EVENTS.CREATE, item);
                                this.ee.emit(EVENTS.UPDATE, item, model, prevProps);
                            } else {
                                this.items.splice(ind, 1);
                                this.ee.emit(EVENTS.REMOVE, item);
                            }
                        }
                    };
                    UniqCollection.prototype.getItem = function(id) {
                        return this.items[this.getItemInd(id)];
                    };
                    UniqCollection.prototype.getLast = function() {
                        return this.items[this.items.length - 1];
                    };
                    UniqCollection.prototype.forEach = function(cb) {
                        for (var key in this.items) cb(this.items[key]);
                    };
                    UniqCollection.prototype.filter = function(cb) {
                        var result = [];
                        this.forEach(function(item) {
                            return cb(item) && result.push(item);
                        });
                        return result;
                    };
                    UniqCollection.prototype.onCreate = function(cb) {
                        return this.ee.subscribe(EVENTS.CREATE, cb);
                    };
                    UniqCollection.prototype.onUpdate = function(cb) {
                        return this.ee.subscribe(EVENTS.UPDATE, cb);
                    };
                    UniqCollection.prototype.onRemove = function(cb) {
                        return this.ee.subscribe(EVENTS.REMOVE, cb);
                    };
                    UniqCollection.prototype.getItemInd = function(id) {
                        return Utils_1.Utils.binarySearchInd(this.items, id, ID_KEY);
                    };
                    return UniqCollection;
                }();
                exports.UniqCollection = UniqCollection;
            }, function(module, exports, __webpack_require__) {
                "use strict";
                function __export(m) {
                    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                __export(__webpack_require__(29));
                __export(__webpack_require__(30));
                __export(__webpack_require__(33));
                __export(__webpack_require__(34));
                __export(__webpack_require__(32));
            } ]);
        });
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function __export(m) {
            for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
        }
        __export(__webpack_require__(41));
        __export(__webpack_require__(42));
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var three_charts_1 = __webpack_require__(38);
        var TrendsMarksWidget_1 = __webpack_require__(42);
        var Easing_1 = __webpack_require__(26);
        (function(TREND_MARK_SIDE) {
            TREND_MARK_SIDE[TREND_MARK_SIDE["TOP"] = 0] = "TOP";
            TREND_MARK_SIDE[TREND_MARK_SIDE["BOTTOM"] = 1] = "BOTTOM";
        })(exports.TREND_MARK_SIDE || (exports.TREND_MARK_SIDE = {}));
        var TREND_MARK_SIDE = exports.TREND_MARK_SIDE;
        (function(EVENTS) {
            EVENTS[EVENTS["CHANGE"] = 0] = "CHANGE";
        })(exports.EVENTS || (exports.EVENTS = {}));
        var EVENTS = exports.EVENTS;
        (function(TEXTURE_FILTER) {
            TEXTURE_FILTER[TEXTURE_FILTER["AUTO"] = 0] = "AUTO";
            TEXTURE_FILTER[TEXTURE_FILTER["LINEAR"] = 1] = "LINEAR";
            TEXTURE_FILTER[TEXTURE_FILTER["NEAREST"] = 2] = "NEAREST";
        })(exports.TEXTURE_FILTER || (exports.TEXTURE_FILTER = {}));
        var TEXTURE_FILTER = exports.TEXTURE_FILTER;
        var AXIS_MARK_DEFAULT_OPTIONS = {
            trendName: "",
            title: "",
            color: "rgba(#0099d9, 0.5)",
            xVal: 0,
            orientation: TREND_MARK_SIDE.TOP,
            width: 105,
            height: 100,
            margin: 10,
            ease: Easing_1.EASING.Elastic.Out,
            easeSpeed: 1e3,
            textureFilter: TEXTURE_FILTER.AUTO,
            onRender: TrendsMarksWidget_1.DEFAULT_RENDERER
        };
        var TrendsMarksPlugin = function(_super) {
            __extends(TrendsMarksPlugin, _super);
            function TrendsMarksPlugin(trendsMarksPluginOptions) {
                _super.call(this, trendsMarksPluginOptions);
                this.items = {};
                this.rects = {};
            }
            TrendsMarksPlugin.prototype.onInitialStateAppliedHandler = function() {
                this.onMarksChangeHandler();
                this.bindEvents();
            };
            TrendsMarksPlugin.prototype.onStateChangedHandler = function() {
                this.onMarksChangeHandler();
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
                    _this.updateMarksSegments();
                });
                this.chart.interpolatedViewport.onZoomInterpolation(function() {
                    return _this.calclulateMarksPositions();
                });
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
                var left = chart.viewport.getWorldXByVal(mark.xVal) - width / 2;
                var top = chart.viewport.getWorldYByVal(mark.yVal);
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
                    newOffset = markRect[1] - markRect[3] - chart.viewport.getWorldYByVal(mark.yVal);
                } else {
                    newOffset = chart.viewport.getWorldYByVal(mark.yVal) - markRect[1];
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
                this.ee.emit(EVENTS[EVENTS.CHANGE]);
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
        var three_charts_1 = __webpack_require__(38);
        var TrendsMarksPlugin_1 = __webpack_require__(41);
        var Mesh = THREE.Mesh;
        var Object3D = THREE.Object3D;
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
                this.bindEvent(this.getTrendsMarksPlugin().onChange(function() {
                    return _this.onMarksChange();
                }));
                this.bindEvent(this.chart.interpolatedViewport.onInterpolationEvent(function(event) {
                    return _this.onViewportInterpolationEvent(event);
                }));
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
            TrendMarksWidget.prototype.onViewportInterpolationEvent = function(event) {
                var widgets = this.marksWidgets;
                for (var markName in widgets) {
                    widgets[markName].onScreenTransformationEventHandler(event);
                }
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
                var texture = three_charts_1.Utils.createNearestTexture(width, height, function(ctx) {
                    options.onRender(_this, ctx, _this.chart);
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
            TrendMarkWidget.prototype.onScreenTransformationEventHandler = function(event) {
                var texture = this.markMesh.material.map;
            };
            TrendMarkWidget.prototype.updatePosition = function() {
                if (!this.mark.segment) return;
                var mark = this.mark;
                var viewport = this.chart.interpolatedViewport;
                var posX = viewport.getWorldXByVal(mark.xVal);
                var posY = viewport.getWorldYByVal(mark.yVal);
                this.markMesh.position.set(posX, posY, 0);
            };
            TrendMarkWidget.prototype.show = function() {
                if (!this.mark.segment) return;
                this.updatePosition();
                this.markMesh.scale.set(.01, .01, 1);
                this.chart.animationManager.animate(1e3, this.mark.options.ease).from(this.markMesh.scale).to({
                    x: 1,
                    y: 1
                });
            };
            return TrendMarkWidget;
        }();
        exports.TrendMarkWidget = TrendMarkWidget;
        exports.DEFAULT_RENDERER = function(trendMarkWidget, ctx, chart) {
            var mark = trendMarkWidget.mark;
            var options = mark.options;
            var isTopSide = options.orientation == TrendsMarksPlugin_1.TREND_MARK_SIDE.TOP;
            var color = options.color !== void 0 ? new three_charts_1.Color(options.color) : new three_charts_1.Color(chart.getTrend(options.trendName).getOptions().lineColor);
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
            ctx.lineTo(centerX, lineEndY);
            ctx.stroke();
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.font = font;
            ctx.fillStyle = "rgba(250, 250, 250, 0.8)";
            ctx.fillText(options.title, Math.round(textPosX), Math.round(textPosY));
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function __export(m) {
            for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
        }
        __export(__webpack_require__(44));
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
        var three_charts_1 = __webpack_require__(38);
        var ANIMATION_TIME = 1e3;
        var ANIMATION_DELAY = 300;
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
            function TrendBeacon(chart, trendName) {
                _super.call(this, chart, trendName);
                this.initObject();
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
                this.animate();
            };
            TrendBeacon.prototype.bindEvents = function() {
                var _this = this;
                _super.prototype.bindEvents.call(this);
                this.bindEvent(this.chart.onScroll(function() {
                    return _this.updatePosition();
                }));
            };
            TrendBeacon.prototype.initObject = function() {
                var light = this.mesh = new Mesh(new PlaneBufferGeometry(32, 32), new MeshBasicMaterial({
                    map: TrendBeacon.createTexture(),
                    transparent: true
                }));
                this.setInitialState();
                light.add(new Mesh(new PlaneBufferGeometry(5, 5), new MeshBasicMaterial({
                    map: TrendBeacon.createTexture()
                })));
                this.segment = this.trend.segmentsManager.getEndSegment();
            };
            TrendBeacon.prototype.animate = function() {
                var _this = this;
                if (!this.chart.state.animations.enabled) return;
                if (this.animation) this.animation.stop();
                this.setInitialState();
                var mesh = this.mesh;
                var animationObject = {
                    scale: mesh.scale.x,
                    opacity: mesh.material.opacity
                };
                this.animation = this.chart.animationManager.animate(ANIMATION_TIME).withDelay(ANIMATION_DELAY).from(animationObject).to({
                    scale: 1,
                    opacity: 0
                }).onTick(function(animationObject) {
                    mesh.scale.set(animationObject.scale, animationObject.scale, 1);
                    mesh.material.opacity = animationObject.opacity;
                }).then(function() {
                    _this.setInitialState();
                });
            };
            TrendBeacon.prototype.setInitialState = function() {
                this.mesh.scale.set(.2, .2, 1);
                this.mesh.material.opacity = 1;
            };
            TrendBeacon.prototype.onDestroy = function() {
                _super.prototype.onDestroy.call(this);
                if (this.animation) this.animation.stop();
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
            TrendBeacon.prototype.updatePosition = function() {
                var chart = this.chart;
                var xVal, yVal;
                var currentAnimationState = this.segment.currentAnimationState;
                if (this.trend.getOptions().type == three_charts_1.TREND_TYPE.LINE) {
                    xVal = currentAnimationState.endXVal;
                    yVal = currentAnimationState.endYVal;
                } else {
                    xVal = currentAnimationState.xVal;
                    yVal = currentAnimationState.endYVal;
                }
                var viewport = chart.interpolatedViewport;
                var x = viewport.getWorldXByVal(xVal);
                var y = viewport.getWorldYByVal(yVal);
                var screenWidth = chart.state.width;
                var screenX = viewport.getViewportXByWorldX(x);
                if (screenX < 0) {
                    x = viewport.getLeft();
                }
                if (screenX > screenWidth) x = viewport.getRight();
                this.mesh.position.set(x, y, .1);
            };
            return TrendBeacon;
        }(three_charts_1.TrendWidget);
        exports.TrendBeacon = TrendBeacon;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function __export(m) {
            for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
        }
        __export(__webpack_require__(46));
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
        var three_charts_1 = __webpack_require__(38);
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
                return trendOptions.enabled && chart.state.animations.enabled;
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
                var viewport = this.chart.interpolatedViewport;
                this.mesh.position.set(viewport.getWorldXByVal(x), viewport.getWorldYByVal(y), 0);
            };
            return TrendLoading;
        }(three_charts_1.TrendWidget);
        exports.TrendLoading = TrendLoading;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function __export(m) {
            for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
        }
        __export(__webpack_require__(48));
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
        var three_charts_1 = __webpack_require__(38);
        var CANVAS_WIDTH = 150;
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
                var _this = this;
                var color = new three_charts_1.Color(this.trend.getOptions().lineColor);
                var texture = three_charts_1.Utils.createNearestTexture(CANVAS_WIDTH, CANVAS_HEIGHT, function(ctx) {
                    ctx.beginPath();
                    ctx.font = _this.chart.state.font.l;
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
                var viewport = chart.interpolatedViewport;
                var screenWidth = chart.state.width;
                var x = viewport.getWorldXByVal(segmentEndXVal) + OFFSET_X;
                var y = viewport.getWorldYByVal(segmentEndYVal);
                var screenX = viewport.getViewportXByWorldX(x);
                var indicatorIsOutOfScreen = screenX < 0 || screenX > screenWidth;
                if (indicatorIsOutOfScreen) {
                    if (screenX < 0) x = viewport.getLeft() + 20;
                    if (screenX > screenWidth) x = viewport.getRight() - CANVAS_WIDTH / 2 - 10;
                    y -= 25;
                }
                this.mesh.position.set(x + CANVAS_WIDTH / 2, y + CANVAS_HEIGHT / 2 - 30, .1);
            };
            return TrendIndicator;
        }(three_charts_1.TrendWidget);
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
        var three_charts_1 = __webpack_require__(38);
        var AxisMarksWidget_1 = __webpack_require__(50);
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
        var three_charts_1 = __webpack_require__(38);
        var AxisMarksPlugin_1 = __webpack_require__(49);
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
                this.bindEvent(this.chart.interpolatedViewport.onInterpolation(function() {
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
                var screen = chart.interpolatedViewport;
                var mark = this.axisMark;
                var isXAxis = mark.axisType == three_charts_1.AXIS_TYPE.X;
                var hasStickMode = mark.stickToEdges;
                var _a = chart.state, width = _a.width, height = _a.height;
                var val = this.frameValue;
                var opactity = this.frameOpacity;
                var material = this.mesh.material;
                material.opacity = opactity;
                if (isXAxis) {
                    this.mesh.position.x = screen.getWorldXByVal(val);
                    this.mesh.position.y = screen.params.scrollY + height / 2;
                } else {
                    var bottomVal = screen.getBottomVal();
                    var topVal = screen.getTopVal();
                    var needToStickOnTop = hasStickMode && val > topVal;
                    var needToStickOnBottom = hasStickMode && val < bottomVal;
                    this.mesh.position.x = screen.params.scrollX + width / 2;
                    if (needToStickOnTop) {
                        this.isStickOnTop = true;
                        this.mesh.position.y = screen.getTop();
                    } else if (needToStickOnBottom) {
                        this.isStickOnBottom = true;
                        this.mesh.position.y = screen.getBottom();
                    } else {
                        this.isStickOnBottom = this.isStickOnTop = false;
                        this.mesh.position.y = screen.getWorldYByVal(val);
                    }
                }
            };
            return AxisMarkWidget;
        }();
        exports.AxisMarkWidget = AxisMarkWidget;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var __extends = this && this.__extends || function(d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
        var three_charts_1 = __webpack_require__(38);
        var ZonesWidget_1 = __webpack_require__(52);
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
        var three_charts_1 = __webpack_require__(38);
        var ZonesPlugin_1 = __webpack_require__(51);
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
                this.bindEvent(this.chart.interpolatedViewport.onInterpolation(function() {
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
                var viewport = chart.interpolatedViewport;
                var zone = this.zone;
                var _a = this.animatedProps, startXVal = _a.startXVal, startYVal = _a.startYVal, endXVal = _a.endXVal, endYVal = _a.endYVal, opacity = _a.opacity;
                var startY = isFinite(startYVal) ? viewport.getWorldYByVal(startYVal) : viewport.getBottom();
                var endY = isFinite(endYVal) ? viewport.getWorldYByVal(endYVal) : viewport.getTop();
                var startX = viewport.getWorldXByVal(startXVal);
                var endX = viewport.getWorldXByVal(endXVal);
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


//# sourceMappingURL=demoApp.js.map