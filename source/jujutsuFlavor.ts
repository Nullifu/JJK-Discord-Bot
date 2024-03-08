interface FlavorText {
	name: string
	value: string
}

function getJujutsuFlavorText(bossName: string): FlavorText | null {
	if (bossName === "Sukuna") {
		return { name: "Sukuna says...", value: "Show me what you can do." }
	} else if (bossName === "Satoru Gojo") {
		return { name: "Gojo's Challenge", value: "Let's see if you're worthy." }
	} else if (bossName === "Itadori") {
		return { name: "Itadori's Determination", value: "I won't lose!" }
	}

	// Add a default case if you'd like
	return null
}

export { getJujutsuFlavorText }

const BAR_LENGTH = 10 // Maximum bar lengths
const FILLED_CHAR = "█"
const EMPTY_CHAR = " "

function createHealthBar(percentage: number): string {
	const filledLength = Math.round(BAR_LENGTH * percentage)
	const emptyLength = BAR_LENGTH - filledLength

	const filledBar = FILLED_CHAR.repeat(filledLength)
	const emptyBar = EMPTY_CHAR.repeat(emptyLength)

	return filledBar + emptyBar
}

export { createHealthBar }
