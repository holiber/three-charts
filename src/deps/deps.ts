/// <reference path="./ResizeSensor.ts" />

// TODO: think about different bundles

import { ResizeSensorType } from './ResizeSensor';
(<any>window).Stats = require('three/examples/js/libs/stats.min');

//require('gsap/src/uncompressed/easing/EasePack.js');
require('three/examples/js/renderers/CanvasRenderer.js');
require('three/examples/js/renderers/Projector.js');
export const isPlainObject = require('is-plain-object') as Function;
export const EE2 = require('EventEmitter2') as typeof EventEmitter2;


export { Promise } from '../polyfills/es6-promise';

export * from './ResizeSensor';
export const ResizeSensor = require('css-element-queries/src/ResizeSensor') as ResizeSensorType;