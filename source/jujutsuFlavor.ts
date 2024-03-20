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
	} else if (bossName === "Aoi Todo & Itadori") {
		return { name: "Brotherly Bond", value: "Let's start cooking.. Brother" }
	} else if (bossName === "Megumi Fushiguro") {
		return { name: "Fushiguro's Willpower", value: "With this treasure.. I SUMMON" }
	} else if (bossName === "Zenin Toji") {
		return { name: "Heavenly Restriction", value: "Cursed since birth." }
	} else if (bossName === "Sukuna (Suppressed)") {
		return { name: "King of curses", value: "This will be over quickly." }
	} else if (bossName === "Jogo") {
		return { name: "Jogo's Challenge", value: "I'll burn you to a crisp." }
	} else if (bossName === "Mahito (Transfigured)") {
		return { name: "Mahito's Challenge", value: "I'll show you the true nature of the soul." }
	} else if (bossName === "Suguru Geto") {
		return { name: "Geto's Challenge", value: "Filthy Monkey" }
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
