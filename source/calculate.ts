export function calculateDamage(playerGrade: string, domainEffectMultiplier: number = 1): number {
	const baseDamage = 10
	const gradeDamageBonus = getGradeDamageBonus(playerGrade)
	const randomVariationPercentage = 0.2

	let totalDamage = baseDamage * gradeDamageBonus * domainEffectMultiplier

	// Apply random variation
	const randomVariation = totalDamage * randomVariationPercentage
	const randomFactor = (Math.random() * 2 - 1) * randomVariation // Between -randomVariation and +randomVariation
	totalDamage += randomFactor

	return Math.max(1, Math.round(totalDamage))
}

function getGradeDamageBonus(grade: string): number {
	switch (grade) {
		case "Special Grade":
			return 2.0
		case "Grade 1":
			return 1.7
		case "Semi-Grade 1":
			return 1.4
		case "Grade 2":
			return 1.2
		case "Grade 3":
			return 1.1
		case "Grade 4":
		default:
			return 1.0
	}
}

export function getRandomXPGain(min = 10, max = 70) {
	// The maximum is inclusive and the minimum is inclusive
	return Math.floor(Math.random() * (max - min + 1)) + min
}
