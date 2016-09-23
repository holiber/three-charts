export interface ResizeSensorType {
	new ($el: Element, resizeCallback: ($el: Element) => void): ResizeSensorType;
	detach(): void;
}
