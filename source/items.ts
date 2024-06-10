function generateItems(baseChances, weekendChances, isWeekend = false, modifiers = {}) {
	const items = [
		{ name: "Tailsman", rarity: "Grade 4" },
		{ name: "Jogos left testicle", rarity: "Grade 4" },
		{ name: "Jogos right testicle", rarity: "Grade 4" },
		{ name: "Dirty Sponge", rarity: "Grade 4" },
		{ name: "Super Glue", rarity: "Grade 4" },
		{ name: "Cleaning Kit", rarity: "Grade 4" },
		{ name: "Empty Bottle", rarity: "Grade 4" },
		//
		{ name: "Prison Realm Fragment", rarity: "Grade 1" },
		{ name: "(Dirty) Sukuna Finger", rarity: "Grade 1" },
		{ name: "(Dirty) Rikugan Eye", rarity: "Grade 1" },
		{ name: "(Shattered) Domain Remnants", rarity: "Grade 1" },
		{ name: "Special-Grade Medicine", rarity: "Grade 1" },
		//
		{ name: "Sukuna Finger", rarity: "Special Grade" },
		{ name: "Cursed Energy Vial", rarity: "Special Grade" },
		{ name: "Cleaning Sponge", rarity: "Special Grade" },
		{ name: "Rikugan Eye", rarity: "Special Grade" }
	]

	const a = {
		"Grade 4": weekendChances.grade4 || 0.24,
		"Grade 1": weekendChances.grade1 || 0.16,
		"Special Grade": weekendChances.specialGrade || 0.04
	}

	const b = {
		"Grade 4": baseChances.grade4 || 0.12,
		"Grade 1": baseChances.grade1 || 0.08,
		"Special Grade": baseChances.specialGrade || 0.02
	}

	const rarityChances = isWeekend ? a : b

	return items.map(item => ({
		...item,
		chance: rarityChances[item.rarity] * (modifiers[item.rarity] || 1)
	}))
}

const defaultChances = {
	grade4: 0.12,
	grade1: 0.08,
	specialGrade: 0.02
}

const weekendChances = {
	grade4: 0.24,
	grade1: 0.16,
	specialGrade: 0.04
}
const regularItems = generateItems(defaultChances, weekendChances)

//onst weekendItems = generateItems(defaultChances, weekendChances, true)

export function getRandomItem() {
	const totalChance = regularItems.reduce((sum, item) => sum + item.chance, 0)
	const randomValue = Math.random() * totalChance

	let cumulativeChance = 0
	for (const item of regularItems) {
		cumulativeChance += item.chance
		if (randomValue <= cumulativeChance) {
			return item
		}
	}

	return null
}

export const rarityAbbreviations = {
	"common": "C",
	"rare": "R",
	"ultra rare": "UR",
	"special grade": "SG"
}
