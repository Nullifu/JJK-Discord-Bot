export const items = [
	{ name: "Wood", rarity: "Common", chance: 0.1, price: 10 },
	{ name: "Tailsman", rarity: "Common", chance: 0.1, price: 400 },
	{ name: "Emerald", rarity: "Rare", chance: 0.1, price: 1400 },
	{ name: "Sapphire", rarity: "Rare", chance: 0.1, price: 3200 },
	{ name: "Platinum", rarity: "Rare", chance: 0.1, price: 10000 },
	{ name: "Prison Realm Fragment", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "Jogos Testicles", rarity: "Super Rare", chance: 0.07, price: 2500 },
	{ name: "Sukuna Finger", rarity: "Special Grade", chance: 0.05, price: 74000 },
	{ name: "Rikugan Eye", rarity: "Special Grade", chance: 0.03, price: 90000 },
	{ name: "Heavenly Chain", rarity: "Special Grade", chance: 0.1, price: 600000 }
]

// Inside your boss data

export type items = {
	name: string
	rarity: string
	chance: number // This is a weight, not a direct probability
	price: number
}
export function getRandomItem() {
	const roll = Math.random()
	let cumulativeChance = 0

	for (const item of items) {
		cumulativeChance += item.chance
		if (roll < cumulativeChance) {
			return item
		}
	}
	return null // If no item is found based on the chances
}

// Define some example jobs. Each job could have a different payout range.
export const jobs = [
	{ name: "Mechanic", payout: { min: 25000, max: 90000 }, cost: 2500 },
	{ name: "Janitor", payout: { min: 5000, max: 10000 }, cost: 1000 },
	{ name: "Jujutsu Janitor", payout: { min: 5000, max: 10000 }, cost: 20000 },
	{ name: "Jujutsu Sorcerer", payout: { min: 10000, max: 20000 }, cost: 50000 }

	// ... add as many jobs as you want
]
