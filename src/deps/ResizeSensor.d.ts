export class ResizeSensor {
	constructor ($el: Element, resizeCallback: ($el: Element) => void);
	detach(): void;
}