// TODO: think about different bundles
// (<any>window).THREE = require('three/three');
(<any>window).Stats = require('three/examples/js/libs/stats.min');
(<any>window).TweenLite = require('gsap/src/uncompressed/TweenMax');
//require('gsap/src/uncompressed/easing/EasePack.js');
//require('three/examples/js/renderers/CanvasRenderer.js');
//require('three/examples/js/renderers/Projector.js');
export var isPlainObject = require('is-plain-object') as Function;
export var EventEmitter = require('EventEmitter2') as typeof EventEmitter2;
export {Promise} from './polyfills/es6-promise';