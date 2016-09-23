export interface ResizeSensorType {
	new ($el: Element, resizeCallback: ($el: Element) => void): ResizeSensorType;
	detach(): void;
}
//
// declare module '~css-element-queries/src/ResizeSensor' {
// 	export default class ResizeSensor {
// 		constructor ($el: Element, resizeCallback: ($el: Element) => void);
// 		detach(): void;
// 	}
// }
//
// declare module 'css-element-queries/src/ResizeSensor' {
// 	export * from '~css-element-queries/src/ResizeSensor'
// }