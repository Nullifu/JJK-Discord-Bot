function generateItems(baseChances, modifiers = {}) {
	const items = [
		{ name: "Tailsman", rarity: "Grade 4" },
		{ name: "Jogos left testicle", rarity: "Grade 4" },
		{ name: "Jogos right testicle", rarity: "Grade 4" },
		{ name: "Super Glue", rarity: "Grade 4" },
		//
		{ name: "Prison Realm Fragment", rarity: "Grade 1" },
		{ name: "(Dirty) Sukuna Finger", rarity: "Grade 1" },
		{ name: "(Dirty) Rikugan Eye", rarity: "Grade 1" },
		{ name: "(Shattered) Domain Remnants", rarity: "Grade 1" },
		{ name: "Sukuna Finger", rarity: "Special Grade" },
		{ name: "Rikugan Eye", rarity: "Special Grade" }
	]

	const rarityChances = {
		"Grade 4": baseChances.grade4 || 0.12, // 12% chance
		"Grade 1": baseChances.grade1 || 0.08, // 8% chance
		"Special Grade": baseChances.specialGrade || 0.04 // 4% chance
	}

	return items.map(item => ({
		...item,
		chance: rarityChances[item.rarity] * (modifiers[item.rarity] || 1)
	}))
}

const defaultChances = {
	grade4: 0.12,
	grade1: 0.08,
	specialGrade: 0.04
}

const digitems = generateItems(defaultChances)

export function getRandomItem() {
	const totalChance = digitems.reduce((sum, item) => sum + item.chance, 0)
	const randomValue = Math.random() * totalChance

	let cumulativeChance = 0
	for (const item of digitems) {
		cumulativeChance += item.chance
		if (randomValue <= cumulativeChance) {
			return item
		}
	}

	return null
}
