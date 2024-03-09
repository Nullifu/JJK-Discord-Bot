export function calculateDamage(playerGrade: number): number {
	// Customizable parameters
	const baseDamage = 1
	const gradeMultiplier = 1.2
	const randomVariationPercentage = 0.2 // 20% random variation

	// Ensure playerGrade is valid
	if (isNaN(playerGrade) || playerGrade <= 0) {
		return 0 // Handle invalid input
	}

	// Core Calculation
	let totalDamage = baseDamage * gradeMultiplier * playerGrade

	// Apply randomness
	const randomVariation = randomVariationPercentage * totalDamage
	const randomFactor = Math.random() * (2 * randomVariation) - randomVariation
	totalDamage *= 1 + randomFactor

	// Ensure minimum damage
	return Math.max(1, Math.round(totalDamage))
}
