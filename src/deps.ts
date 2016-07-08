// TODO: think about different bundles
// (<any>window).THREE = require('three/three');
(<any>window).Stats = require('three/examples/js/libs/stats.min');
(<any>window).TweenLite = require('gsap/src/uncompressed/TweenMax');
require('gsap/src/uncompressed/easing/EasePack.js');
//require('three/examples/js/renderers/CanvasRenderer.js');
//require('three/examples/js/renderers/Projector.js');
export var isPlainObject = require('is-plain-object') as Function;
export var deepmerge = require('deepmerge') as Function;
export var EventEmitter = require('EventEmitter2') as typeof EventEmitter2;
(<any>window).ES6PROMISE = {Promise: (<any>window)['Promise']};