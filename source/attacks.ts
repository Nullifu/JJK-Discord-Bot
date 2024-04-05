import { EmbedBuilder } from "discord.js"
import { getUserStatusEffects, updateUserStatusEffects } from "./mongodb.js"

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
			baseDamage: 30,
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
	],
	// Mahito
	"The Honored One": [
		{
			name: "Awakened: Lapse Blue",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("Blue!")
		},
		{
			name: "Awakened: Reversal Red",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Aka!")
		},
		{
			name: "Imaginary Technique: Purple",
			probability: 20,
			baseDamage: 30,
			embedUpdate: embed =>
				embed
					.setImage(
						"https://media1.tenor.com/m/whbTruPpfgkAAAAC/imaginary-technique-imaginary-technique-purple.gif"
					)
					.setDescription("Hollow.. Purple")
		}
	],
	// Mahito
	"Mahoraga": [
		{
			name: "Adapted: Strike",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("......")
		},
		{
			name: "Pummel",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription(".......")
		},
		{
			name: "Adapted: Blast",
			probability: 20,
			baseDamage: 30,
			embedUpdate: embed =>
				embed
					.setImage(
						"https://media1.tenor.com/m/whbTruPpfgkAAAAC/imaginary-technique-imaginary-technique-purple.gif"
					)
					.setDescription("......")
		}
	],

	// Mahito
	"Mahito Instant Spirit Body of Distorted Killing": [
		{
			name: "Soul Multiplicity",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("Transfiguration!")
		},
		{
			name: "Soul Snatch",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("DISAPPEAR!")
		},
		{
			name: "Domain Expansion: Self Embodiment of Perfection",
			probability: 20,
			baseDamage: 30,
			embedUpdate: embed =>
				embed
					.setImage("https://media1.tenor.com/m/J_g_1B1HK0oAAAAC/koogender.gif")
					.setDescription("I'll show you the true nature of the soul.")
		}
	],
	// Mahito
	"Kashimo": [
		{
			name: "Electricity Manipulation",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Electricity Blast",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Electrified Strike",
			probability: 20,
			baseDamage: 30,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],
	// Mahito
	"Hakari Kinji": [
		{
			name: "Jackpot: Strike",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Gamblers Strike",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Jackpot: Cargo Rush",
			probability: 20,
			baseDamage: 30,
			embedUpdate: embed => embed.setDescription("ZAP")
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

const statusEffectsDescriptions = {
	"Prayer Song": {
		description: "Reduces incoming damage by 20%",
		effect: "20% REDUC"
	},
	"Gamblers Limit": {
		description: "Inc. dmg taken & dealt by 30%",
		effect: "20% REDUC"
	},
	"Curse King": {
		description: "Dismantles the enemy from within..",
		effect: "Dismantle"
	},
	"Limitless Info": {
		description: "Reduces incoming damage by 35%",
		effect: "35% REDUC"
	},
	"Adaption": {
		description: "You adapt to the enemy...",
		effect: "15% INC 25% REDUC"
	},
	"World Cutting Slash": {
		description: "Bleed effect on the enemy!",
		effect: "25% Bleed"
	}
	// Define other status effects here
}

export async function applyPrayerSongEffect(userId) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId) // This function needs to fetch the current effects from the database

	// Check if "Prayer Song" is already active to avoid duplication
	if (!currentEffects.includes("Prayer Song")) {
		const updatedEffects = [...currentEffects, "Prayer Song"]
		await updateUserStatusEffects(userId, updatedEffects) // Update the database with the new effects list
	}
}

export async function applyIdleDeathsGamble(userId) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId) // This function needs to fetch the current effects from the database

	// Check if "Prayer Song" is already active to avoid duplication
	if (!currentEffects.includes("Idle Deaths Gamble")) {
		const updatedEffects = [...currentEffects, "Idle Deaths Gamble"]
		await updateUserStatusEffects(userId, updatedEffects) // Update the database with the new effects list
	}
}
export async function applyAdaption(userId) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId) // This function needs to fetch the current effects from the database

	// Check if "Prayer Song" is already active to avoid duplication
	if (!currentEffects.includes("Adaption")) {
		const updatedEffects = [...currentEffects, "Adaption"]
		await updateUserStatusEffects(userId, updatedEffects) // Update the database with the new effects list
	}
}

export async function applyWorldCuttingSlash(userId) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId) // This function needs to fetch the current effects from the database

	// Check if "Prayer Song" is already active to avoid duplication
	if (!currentEffects.includes("World Cutting Slash")) {
		const updatedEffects = [...currentEffects, "World Cutting Slash"]
		await updateUserStatusEffects(userId, updatedEffects) // Update the database with the new effects list
	}
}

export async function fetchAndFormatStatusEffects(userId) {
	const statusEffects = await getUserStatusEffects(userId) // Returns array of effect names
	const formattedEffects = statusEffects.map(effect => {
		if (statusEffectsDescriptions[effect]) {
			return `${effect} (${statusEffectsDescriptions[effect].description})`
		}
		return effect // Fallback in case the effect is not found
	})

	return formattedEffects.length > 0 ? formattedEffects.join(", ") : "None"
}

export function calculateDamageWithEffects(baseDamage, userId, statusEffects) {
	let damage = baseDamage
	let damageReduction = 1 // No reduction initially
	let damageIncrease = 1 // No increase initially

	if (statusEffects.includes("Prayer Song")) {
		damageReduction *= 0.2 // Apply 20% damage reduction
	}
	if (statusEffects.includes("Gamblers Limit")) {
		damageReduction *= 0.2 // Apply 20% damage reduction
		damageIncrease *= 1.5 // Assuming Gamblers Limit also increases damage taken by 50%
	}
	if (statusEffects.includes("Adaption")) {
		// Assuming you handle health increase elsewhere or adjust here directly
		damageReduction *= 0.75 // Apply 25% damage reduction
	}
	// Apply damageIncrease before damageReduction for demonstration; adjust as needed
	damage *= damageIncrease
	damage *= damageReduction

	// Handle effects like "World Cutting Slash" separately, as they may not directly affect damage calculation
	return damage
}

export async function applyStatusEffect(userId, effectName) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId)

	// Check if the status effect is already active to avoid duplication
	if (!currentEffects.includes(effectName)) {
		const updatedEffects = [...currentEffects, effectName]
		await updateUserStatusEffects(userId, updatedEffects) // Update the database with the new effects list
	}
}
