import { EmbedBuilder } from "discord.js"

export interface Attack {
	name: string
	embedUpdate?: (embed: EmbedBuilder) => EmbedBuilder // Function to update the embed
	// Other attack properties if needed (damage calculation, special effects, etc.)
}

export const attacks: Record<string, Attack> = {
	sukunaStandard: {
		name: "Cleave" // Simple attack, no special embed changes
	},
	sukunaDomain: {
		name: "Domain Expansion: Malevolent Shrine!",
		embedUpdate: embed =>
			embed.setImage(
				"https://64.media.tumblr.com/0feb91da89a4966ba9c9f74d10ec8aaf/9fff42c908e7280c-a7/s500x750/9d2d7fafe04e0da03dd8b1838a5b4cc98140f04e.gifv"
			)
	},
	itadoriBlackFlash: {
		name: "Black Flash",
		embedUpdate: embed => embed.setDescription("A surge of cursed energy!")
	},
	itadoriDivergentFist: {
		name: "Divergent Fist"
	},

	gojoLimitless: {
		name: "Limitless",
		embedUpdate: embed => embed.setColor("#0000FF")
	}
	// ... Add the other attacks for Gojo, Todo, and Megumi ...
}

export function getBossAttack(bossName: string, attackName: string): Attack {
	const bossAttacks = attacks[bossName]
	if (!bossAttacks || !bossAttacks[attackName]) {
		throw new Error(`Invalid boss or attack: ${bossName} - ${attackName}`)
	}
	return bossAttacks[attackName]
}
