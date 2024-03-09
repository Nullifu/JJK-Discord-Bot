export interface BossDrops {
	[bossName: string]: {
		itemName: string
		dropChance: number
		quantity?: number // Make quantity optional
	}[]
}

export const bossDrops: BossDrops = {
	Sukuna: [
		{ itemName: "Cursed Blade", dropChance: 20, quantity: 2 }
		// ... other Sukuna drops
	]
	// ... other bosses
}
