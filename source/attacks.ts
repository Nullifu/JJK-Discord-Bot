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
			probability: 30,
			baseDamage: 10,
			embedUpdate: embed => embed
		},
		{
			name: "Divergent Fist: Collapsing Spear",
			probability: 20,
			baseDamage: 20,
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
				embed.setImage("https://www.icegif.com/wp-content/uploads/2023/12/icegif-997.gif")
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
	],
	// geto
	"Suguru Geto": [
		{
			name: "Cursed Spirit Manipulation",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Cursed Spirit Manipulation!")
		},
		{
			name: "Cursed Energy Blast",
			probability: 20,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Cursed Energy Blast!")
		},
		{
			name: "Cursed Energy Barrier",
			probability: 30,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Cursed Energy Barrier!")
		}
	],
	// Jogo
	"Jogo": [
		{
			name: "Fire Manipulation",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Fire Manipulation!")
		},
		{
			name: "Fireball",
			probability: 20,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Fireball!")
		},
		{
			name: "MAXIMUM TECHNIQUE: METEOR!!!!",
			probability: 30,
			baseDamage: 10,
			embedUpdate: embed => {
				embed.setImage("https://media1.tenor.com/m/pNvg0g4K4VMAAAAd/sukuna-skate-sukuna-skating.gif")
				embed.setDescription("I'LL BURN YOU TO A CRISP! ")
				return embed
			}
		}
	],
	// Mahito
	"Mahito (Transfigured)": [
		{
			name: "Transfiguration",
			probability: 50,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("Transfiguration!")
		},
		{
			name: "Polymorphic Soul Isomer",
			probability: 20,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("DISAPPEAR!")
		},
		{
			name: "Instant Spirit Body of Distorted Killing...",
			probability: 30,
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("I'll show you the true nature of the soul.")
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

export const clanAttacks = {
	"Demon Vessel": [
		{
			name: "Cleave",
			baseDamage: 10,
			embedUpdate: embed => embed.setDescription("A swift and powerful cleave attack.")
		},
		{
			name: "Dismantle",
			baseDamage: 15,
			embedUpdate: embed => embed.setDescription("Dismantles the opponent with precision.")
		},
		{
			name: "Flame Arrow",
			baseDamage: 20,
			embedUpdate: embed => embed.setDescription("Launches a fiery arrow towards the foe.")
		}
	],
	"Limitless User": [
		{
			name: "Lapse: BLUE",
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("Manipulates space to crush the target.")
		}
	],
	"Zenin": [
		{
			name: "Zenin Style: Blood Manipulation",
			baseDamage: 20,
			embedUpdate: embed => embed.setDescription("Controls blood to attack or defend.")
		}
	],
	"Fushiguro": [
		{
			name: "Frog",
			baseDamage: 15,
			embedUpdate: embed => embed.setDescription("Summons a frog for various tactical advantages.")
		}
	]
}
