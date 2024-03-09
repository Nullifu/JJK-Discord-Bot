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

export async function triggerSukunaTransformation(interaction, primaryEmbed) {
	primaryEmbed
		.setTitle("Sukuna Unleashed (Suppressed)")
		.setDescription("Malevolent Shrine engulfs the area. Sukuna's overwhelming power distorts reality.")
		.setImage(
			"https://64.media.tumblr.com/9daf6953407d0fe2f33090e8b66e78fe/9f03ce8993a9b44f-cc/s500x750/4a967912acdffef41db3beaba4055eccafe94e1b.gif"
		)
		.setColor("DarkRed")
		.addFields([
			{ name: "Sukuna:", value: "How pathetic. Is this all you can muster?" },
			{ name: "Domain Effect:", value: "The shadows writhe and twist, echoing Sukuna's hunger." }
		])

	await interaction.editReply({ embeds: [primaryEmbed] })
}
