import { EventEmitter } from './EventEmmiter';
export declare class UniqCollectionItem {
    private _id;
    getId(): number;
}
export interface IUniqCollectionOptions<TItem, TItemModel> {
    createInstance: (itemModel: TItemModel) => TItem;
}
/**
 * useful for patching collections with id key
 */
export declare class UniqCollection<TItem extends UniqCollectionItem, TItemModel> {
    protected items: TItem[];
    protected options: IUniqCollectionOptions<TItem, TItemModel>;
    protected ee: EventEmitter;
    constructor(options: IUniqCollectionOptions<TItem, TItemModel>);
    patch(models: TItemModel[]): void;
    getItem(id: number): TItem;
    getLast(): TItem;
    forEach(cb: (item: TItem) => any): void;
    filter(cb: (item: TItem) => boolean): TItem[];
    onCreate(cb: (item: TItem) => any): Function;
    onUpdate(cb: (item: TItem, itemModel: TItemModel, prevProps: TItemModel) => any): Function;
    onRemove(cb: (item: TItem) => any): Function;
    protected getItemInd(id: number): number;
}
