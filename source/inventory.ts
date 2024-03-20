import { Item } from "./interface.js"

export interface InventoryItem extends Item {
	quantity: number
}

export function formatInventoryItems(items: InventoryItem[]): string {
	return items.map(item => `${item.quantity}x ${item.name}: ${item.description}`).join("\n")
}
