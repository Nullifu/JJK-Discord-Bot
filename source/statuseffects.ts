import { getUserPermEffects, getUserStatusEffects, updateUserStatusEffects } from "./mongodb.js"

const statusEffectsDescriptions = {
	"Gamblers Limit": {
		description: "Gamble for a chance to increase or decrease damage!",
		effect: "? ? ?"
	},
	"Curse King": {
		description: "Dismantles the enemy from within..",
		effect: "Dismantle",
		emoji: "<:dismantle:1229380394630254592>"
	},
	"Limitless Info": {
		description: "Reduces incoming damage by 35%",
		effect: "35% REDUC"
	},
	"Adaption": {
		description: "You adapt to the enemy...",
		effect: "15% INC 25% REDUC"
	},
	"Prayer Song": {
		description: "Reduces incoming damage by 20%",
		effect: "20% REDUC"
	},
	"Mutual Love": {
		description: "Reduces incoming damage by 20%",
		effect: "20% REDUC"
	},
	"Mass": {
		description: "Virtually Mass",
		effect: "20% REDUC"
	}
}

export async function applyPrayerSongEffect(userId) {
	const currentEffects = await getUserStatusEffects(userId)
	if (!currentEffects.includes("Prayer Song")) {
		const updatedEffects = [...currentEffects, "Prayer Song"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}
export async function applyMutualLoveEffect(userId) {
	const currentEffects = await getUserStatusEffects(userId)

	if (!currentEffects.includes("Mutual Love")) {
		const updatedEffects = [...currentEffects, "Mutual Love"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}

export async function applyIdleDeathsGamble(userId) {
	const currentEffects = await getUserStatusEffects(userId)

	if (!currentEffects.includes("Gamblers Limit")) {
		const updatedEffects = [...currentEffects, "Gamblers Limit"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}
export async function applyAdaption(userId) {
	const currentEffects = await getUserStatusEffects(userId)

	if (!currentEffects.includes("Adaption")) {
		const updatedEffects = [...currentEffects, "Adaption"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}
export async function applyVirtualMass(userId) {
	const currentEffects = await getUserStatusEffects(userId)

	if (!currentEffects.includes("Mass")) {
		const updatedEffects = [...currentEffects, "Mass"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}

export async function applyWorldCuttingSlash(userId) {
	const currentEffects = await getUserStatusEffects(userId)

	if (!currentEffects.includes("World Cutting Slash")) {
		const updatedEffects = [...currentEffects, "World Cutting Slash"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}

export async function applytransformation(userId) {
	const currentEffects = await getUserStatusEffects(userId)

	if (!currentEffects.includes("1000 Year Curse")) {
		const updatedEffects = [...currentEffects, "1000 Year Curse"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}

export async function fetchAndFormatStatusEffects(userId) {
	const statusEffects = await getUserStatusEffects(userId)
	const formattedEffects = statusEffects.map(effect => {
		const description = statusEffectsDescriptions[effect]?.description
		return description ? `${effect} (${description})` : effect
	})
	return formattedEffects.length > 0 ? formattedEffects.join(", ") : "None"
}

const statusEffectModifiers = {
	"Curse King": { damageReduction: 0.2, damageIncrease: 1.2 },
	"Saiyan Power": { damageReduction: 0.15, damageIncrease: 8.0 },
	"Scarce": { damageReduction: 1.1 },
	"Sukuna's Honour": { damageReduction: 0.1 },
	"Mass": { damageReduction: 0.2, damageIncrease: 1.5 },
	"1000 Year Curse": { damageReduction: 0.4, damageIncrease: 1.4 },
	"Limitless": { damageReduction: 0.2, damageIncrease: 1.2 },
	"Mutual Love": { damageReduction: 0.3, damageIncrease: 1.4 },
	"Gamblers Limit": {
		calculateModifiers: () => {
			const gambleOutcome = Math.random()
			return gambleOutcome < 0.5
				? { damageReduction: 0.3, damageIncrease: 1.3 }
				: { damageReduction: 1.1, damageIncrease: 0.7 }
		}
	},
	"Beach Bum": { damageReduction: 0.2, damageIncrease: 1.2 },
	"Adaption": { damageReduction: 0.85, damageIncrease: 1.2 },
	"Prayer Song": { damageReduction: 0.2 }
}

export function calculateDamageWithEffects(baseDamage, userId, statusEffects) {
	let damageReduction = 1
	let damageIncrease = 1

	for (const effect of statusEffects) {
		const modifiers = statusEffectModifiers[effect]
		if (modifiers) {
			if (typeof modifiers.calculateModifiers === "function") {
				const calculatedModifiers = modifiers.calculateModifiers()
				damageReduction *= calculatedModifiers.damageReduction || 1
				damageIncrease *= calculatedModifiers.damageIncrease || 1
			} else {
				damageReduction *= modifiers.damageReduction || 1
				damageIncrease *= modifiers.damageIncrease || 1
			}
		}
	}

	const damage = baseDamage * damageIncrease * damageReduction
	return damage
}

export async function applyStatusEffect(userId, effectName) {
	const currentEffects = await getUserStatusEffects(userId)

	if (!currentEffects.includes(effectName)) {
		const updatedEffects = [...currentEffects, effectName]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}

export async function applyPermanentStatusEffect(userId, effectName) {
	const currentEffects = await getUserPermEffects(userId)

	if (!currentEffects.includes(effectName)) {
		const updatedEffects = [...currentEffects, effectName]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}
