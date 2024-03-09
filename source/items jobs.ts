export const items = [
	{ name: "Wood", rarity: "Common", chance: 0.1, price: 10 },
	{ name: "Tailsman", rarity: "Common", chance: 0.1, price: 400 },
	{ name: "Noj", rarity: "Uncommon", chance: 0.1, price: 1 },
	{ name: "Emerald", rarity: "Rare", chance: 0.1, price: 1400 },
	{ name: "Sapphire", rarity: "Rare", chance: 0.1, price: 3200 },
	{ name: "Platinum", rarity: "Rare", chance: 0.1, price: 10000 },
	{ name: "Cum", rarity: "Super Rare", chance: 0.07, price: 10 },
	{ name: "V3x", rarity: "Super Rare", chance: 0.07, price: 100 },
	{ name: "Prison Realm Fragment", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "Jogos right testicle", rarity: "Super Rare", chance: 0.07, price: 2500 },
	{ name: "Jogos left testicle", rarity: "Super Rare", chance: 0.07, price: 2500 },
	{ name: "Sukuna Finger", rarity: "Special Grade", chance: 0.05, price: 74000 },
	{ name: "Rikugan Eye", rarity: "Special Grade", chance: 0.03, price: 90000 }
]
export const craftingitems = [
	{ name: "Six eyes", rarity: "Special Grade", chance: 0.01, price: 300000 },
	{ name: "Prison Realm", rarity: "Special Grade", chance: 0.01, price: 500000 }
]

export const bossItems = [
	{ id: 90, name: "Chain of Hundred Miles", rarity: "Common", chance: 0.1 },
	{ id: 1, name: "jogos balls", rarity: "Common", chance: 0.1 }
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
	{ name: "Osaka", payout: { min: 25000, max: 90000 }, cost: 2500 },
	{ name: "Osakas Friend", payout: { min: 5000, max: 10000 }, cost: 1000 },
	{ name: "newbie", payout: { min: 2500, max: 7600 }, cost: 100 },
	{ name: "Junior Developer", payout: { min: 1000, max: 2000 }, cost: 5000 },
	{ name: "Senior Developer", payout: { min: 2000, max: 5000 }, cost: 10000 },
	{ name: "Lead Developer", payout: { min: 5000, max: 10000 }, cost: 20000 },
	{ name: "Manager", payout: { min: 10000, max: 20000 }, cost: 50000 },
	{ name: "CEO", payout: { min: 20000, max: 150000 }, cost: 100000 },
	{ name: "President", payout: { min: 150000, max: 300000 }, cost: 500000 },
	{ name: "God", payout: { min: 300000, max: 1000000 }, cost: 1000000 }

	// ... add as many jobs as you want
]
