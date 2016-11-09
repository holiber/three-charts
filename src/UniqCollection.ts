import { Utils } from './Utils';
import { IIteralable } from './interfaces';
import { EventEmitter } from './EventEmmiter'

export class UniqCollectionItem {
	private _id: number;
	getId() {
		return this._id;
	}
}

const ID_KEY = '_id';

const EVENTS = {
	CREATE: 'create',
	UPDATE: 'update',
	REMOVE: 'remove'
};

export interface IUniqCollectionOptions<TItem, TItemModel> {
	createInstance: (itemModel: TItemModel) => TItem;
}

/**
 * useful for patching collections with id key
 */
export class UniqCollection<TItem extends UniqCollectionItem, TItemModel> {
	protected items: TItem[] = [];
	protected options: IUniqCollectionOptions<TItem, TItemModel>;
	protected ee = new EventEmitter();
	constructor(options: IUniqCollectionOptions<TItem, TItemModel>) {
		this.options = options;
	}

	patch(models: TItemModel[]) {
		let options = this.options;
		for (let model of models) {
			let id = (model as IIteralable)[ID_KEY];
			if (!id) Utils.error('Collection item without id detected');
			let ind = this.getItemInd(id);
			let item = this.items[ind];
			let justCreated = false;

			// create
			if (!item) {
				justCreated = true;
				item = options.createInstance(model);
				this.items.push(item);
			}

			// update
			if (Object.keys(model).length > 1) {
				let prevProps = {};
				Utils.copyProps(item, prevProps, model);
				Utils.patch(item as IIteralable, model);
				justCreated && this.ee.emit(EVENTS.CREATE, item);
				this.ee.emit(EVENTS.UPDATE, item, model, prevProps as TItemModel);

			// delete
			} else {
				this.items.splice(ind, 1);
				this.ee.emit(EVENTS.REMOVE, item);
			}
		}
	}


	getItem(id: number): TItem {
		return this.items[this.getItemInd(id)];
	}


	getLast(): TItem {
		return this.items[this.items.length - 1];
	}


	forEach(cb: (item: TItem) => any) {
		for (let key in this.items) cb(this.items[key]);
	}


	filter(cb: (item: TItem) => boolean): TItem[] {
		let result: TItem[] = [];
		this.forEach(item => cb(item) && result.push(item));
		return result;
	}


	onCreate(cb: (item: TItem) => any): Function {
		return this.ee.subscribe(EVENTS.CREATE, cb);
	}


	onUpdate (cb: (item: TItem, itemModel: TItemModel, prevProps: TItemModel) => any): Function {
		return this.ee.subscribe(EVENTS.UPDATE, cb);
	}


	onRemove(cb: (item: TItem) => any): Function {
		return this.ee.subscribe(EVENTS.REMOVE, cb);
	}


	protected getItemInd(id: number) {
		return Utils.binarySearchInd(this.items, id, ID_KEY);
	}

}


