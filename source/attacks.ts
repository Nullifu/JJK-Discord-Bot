import { EmbedBuilder } from "discord.js"

export interface Attack {
	name: string
	baseDamage: number
	probability: number // Probability of the attack happening from 0% to 100%
	embedUpdate: (embed: EmbedBuilder) => EmbedBuilder // Optional function to update the embed
	// Other attack properties if needed (damage calculation, special effects, etc.)
}

export const attacks: Record<string, Attack[]> = {
	// Sukana's attacks
	"Sukuna": [
		{
			name: "Cleave", // Simple attack, no special embed changes
			probability: 60,
			baseDamage: 10,
			embedUpdate: embed => embed
		},
		{
			name: "Domain Expansion: Malevolent Shrine!",
			probability: 20,
			baseDamage: 100,
			embedUpdate: embed =>
				embed.setImage(
					"https://tenor.com/en-GB/view/jjk-jujutsu-kaisen-jjk-fight-jujutsu-kaisen-fight-sukuna-gif-15525695609492803291"
				)
		},
		{
			name: "Flame Arrow",
			probability: 20,
			baseDamage: 20,
			embedUpdate: embed => {
				embed.setImage("https://i.pinimg.com/originals/80/8a/92/808a927200ed3552e01bf77b6349d2b8.gif")
				embed.setDescription("Fuga... Never seen this one before have you?")
				return embed
			}
		}
	],

	// Itadori's attacks
	"Itadori": [
		{
			name: "Black Flash",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("A surge of cursed energy... BLACK FLASH!")
		},
		{
			name: "Divergent Fist: Hundred Folds!",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed
		}
	],

	// Gojo's attacks
	"Satoru Gojo": [
		{
			name: "Limitless: Blue!",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed.setColor("#0000FF")
		},
		{
			name: "Reversal: Red",
			probability: 50,
			baseDamage: 20,
			embedUpdate: embed => embed.setColor("#0000FF")
		},
		{
			name: "Hollow: PURPLE!",
			probability: 50,
			baseDamage: 20,
			embedUpdate: embed => embed.setColor("#0000FF")
		}
	],
	// Itadori's attacks
	"Aoi Todo & Itadori": [
		{
			name: "Brotherly Bond: Chain Blitz!",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Let's go BROTHER!")
		},
		{
			name: "Unison Impact",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed
		}
	],
	// Itadori's attacks
	"Megumi Fushiguro": [
		{
			name: "Divine Dogs: Shadow Pursuit",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Demon Dogs!")
		},
		{
			name: "Domain Expansion: Chimera Shadow Garden",
			probability: 20,
			baseDamage: 10,
			embedUpdate: embed => {
				embed.setImage("https://i.imgur.com/eGaZjlO.gif")
				embed.setDescription("HAHAHAHA WHY THE HELL NOT!")
				return embed
			}
		},
		{
			name: "Shikigami Fusion: Shadow Behemoth",
			probability: 30,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Let's ramp this up!")
		}
	],
	// Itadori's attacks
	"Zenin Toji": [
		{
			name: "Soul Severance",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Slice!")
		},
		{
			name: "Chain Snare",
			probability: 20,
			baseDamage: 10,
			embedUpdate: embed => {
				embed.setImage(
					"https://steamuserimages-a.akamaihd.net/ugc/2062139566417589090/95CBCD4D225D5511D70FC68FB8879CB208BA6A20/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false"
				)
				embed.setDescription("I'm going to lose huh?")
				return embed
			}
		},
		{
			name: "Null Strike",
			probability: 30,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("This fight's not over.")
		}
	],
	// Itadori's attacks
	"Sukuna (Suppressed)": [
		{
			name: "Fire Manipulation (Weakened)",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("BURN!")
		},
		{
			name: "Barrage of punches",
			probability: 20,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Pathetic!")
		},
		{
			name: "Null Strike",
			probability: 30,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("This fight's not over.")
		}
	]
	// ... Add the other attacks for Gojo, Todo, and Megumi ...
}

export function chooseRandomAttackForBossBasedOnProbability(attacks: Attack[]): Attack {
	// 1. Calculate a 'scaled' random number for selection
	let totalProbability = 0
	for (const attack of attacks) {
		totalProbability += attack.probability
	}
	const scaledRandomNumber = Math.random() * totalProbability

	// 2. Find the choice where the cumulative probability exceeds the 'scaled' random number
	let cumulativeProbability = 0
	for (const attack of attacks) {
		cumulativeProbability += attack.probability
		if (scaledRandomNumber <= cumulativeProbability) {
			return attack
		}
	}

	// If this point is reached, fallback to the last item
	return attacks[attacks.length - 1]
}
