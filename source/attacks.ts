import { EmbedBuilder } from "discord.js"
import { getUserPermEffects, getUserStatusEffects, updateUserStatusEffects } from "./mongodb.js"

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
			baseDamage: 25,
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
			baseDamage: 40,
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
			baseDamage: 40,
			embedUpdate: embed => embed.setDescription("A surge of cursed energy... BLACK FLASH!")
		},
		{
			name: "Divergent Fist: Hundred Folds!",
			probability: 30,
			baseDamage: 25,
			embedUpdate: embed => embed
		},
		{
			name: "Divergent Fist: Collapsing Spear",
			probability: 20,
			baseDamage: 25,
			embedUpdate: embed => embed
		}
	],

	// Gojo's attacks
	"Satoru Gojo": [
		{
			name: "Limitless: Blue!",
			probability: 40,
			baseDamage: 35,
			embedUpdate: embed => embed.setColor("#0000FF")
		},
		{
			name: "Reversal: Red",
			probability: 40,
			baseDamage: 30,
			embedUpdate: embed => embed.setColor("#0000FF")
		},
		{
			name: "Hollow: PURPLE!",
			probability: 20,
			baseDamage: 50,
			embedUpdate: embed => embed.setColor("#0000FF")
		}
	],
	// Itadori's attacks
	"Aoi Todo & Itadori": [
		{
			name: "Brotherly Bond: Chain Blitz!",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("Let's go BROTHER!")
		},
		{
			name: "Unison Impact",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed
		}
	],
	// Itadori's attacks
	"Megumi Fushiguro": [
		{
			name: "Divine Dogs: Shadow Pursuit",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("Demon Dogs!")
		},
		{
			name: "Domain Expansion: Chimera Shadow Garden",
			probability: 20,
			baseDamage: 25,
			embedUpdate: embed => {
				embed.setImage("https://i.imgur.com/eGaZjlO.gif")
				embed.setDescription("HAHAHAHA WHY THE HELL NOT!")
				return embed
			}
		},
		{
			name: "Shikigami Fusion: Shadow Behemoth",
			probability: 30,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("Let's ramp this up!")
		}
	],
	// Itadori's attacks
	"Zenin Toji": [
		{
			name: "Soul Severance",
			probability: 50,
			baseDamage: 30,
			embedUpdate: embed => embed.setDescription("Slice!")
		},
		{
			name: "Chain Snare",
			probability: 20,
			baseDamage: 35,
			embedUpdate: embed => {
				embed.setImage("https://www.icegif.com/wp-content/uploads/2023/12/icegif-997.gif")
				embed.setDescription("I'm going to lose huh?")
				return embed
			}
		},
		{
			name: "Null Strike",
			probability: 30,
			baseDamage: 20,
			embedUpdate: embed => embed.setDescription("This fight's not over.")
		}
	],
	// Itadori's attacks
	"Sukuna (Suppressed)": [
		{
			name: "Fire Manipulation (Weakened)",
			probability: 50,
			baseDamage: 20,
			embedUpdate: embed => embed.setDescription("BURN!")
		},
		{
			name: "Barrage of punches",
			probability: 20,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("Pathetic!")
		},
		{
			name: "Null Strike",
			probability: 30,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("This fight's not over.")
		}
	],
	// geto
	"Suguru Geto": [
		{
			name: "Cursed Spirit Manipulation",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("Cursed Spirit Manipulation!")
		},
		{
			name: "Cursed Energy Blast",
			probability: 20,
			baseDamage: 14,
			embedUpdate: embed => embed.setDescription("Cursed Energy Blast!")
		},
		{
			name: "Cursed Energy Barrier",
			probability: 30,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("Cursed Energy Barrier!")
		}
	],
	// Jogo
	"Jogo": [
		{
			name: "Fire Manipulation",
			probability: 50,
			baseDamage: 19,
			embedUpdate: embed => embed.setDescription("Fire Manipulation!")
		},
		{
			name: "Fireball",
			probability: 20,
			baseDamage: 18,
			embedUpdate: embed => embed.setDescription("Fireball!")
		},
		{
			name: "MAXIMUM TECHNIQUE: METEOR!!!!",
			probability: 30,
			baseDamage: 30,
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
			baseDamage: 50,
			embedUpdate: embed => embed.setDescription("Transfiguration!")
		},
		{
			name: "Polymorphic Soul Isomer",
			probability: 20,
			baseDamage: 60,
			embedUpdate: embed => embed.setDescription("DISAPPEAR!")
		},
		{
			name: "Mewetenpen",
			probability: 30,
			baseDamage: 100,
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
			embedUpdate: embed => embed.setDescription("......")
		}
	],

	// Mahito
	"Mahito Instant Spirit Body of Distorted Killing": [
		{
			name: "Soul Multiplicity",
			probability: 50,
			baseDamage: 56,
			embedUpdate: embed => embed.setDescription("Transfiguration!")
		},
		{
			name: "Soul Snatch",
			probability: 30,
			baseDamage: 45,
			embedUpdate: embed => embed.setDescription("DISAPPEAR!")
		},
		{
			name: "Domain Expansion: Self Embodiment of Perfection",
			probability: 20,
			baseDamage: 110,
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
			name: "Barrage",
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
	],
	"Hakari (Jackpot)": [
		{
			name: "Jackpot: Fleeting Rush",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Private Pure Love Train: Pachinko Rush",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Private Pure Love Train: Cargo Rush",
			probability: 20,
			baseDamage: 30,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],
	"Finger Bearer": [
		{
			name: "Strike",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Cursed Energy Blast",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Explosion",
			probability: 20,
			baseDamage: 20,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],

	"Yuta Okkotsu": [
		{
			name: "Black Flash",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Steel Arm: Freeze Flash",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Vengeance: Executioner's Blade",
			probability: 20,
			baseDamage: 30,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],
	"Yuta Okkotsu & Curse Queen Rika": [
		{
			name: "Combined Attack: Black Flash",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Curse Queen: Rika's Rampage",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Pure Love: Rika's Embrace",
			probability: 20,
			baseDamage: 70,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],
	"Sukuna (Heian Era)": [
		{
			name: "Kamutoke",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Spiderweb",
			probability: 30,
			baseDamage: 30,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "World Cutting Slash",
			probability: 20,
			baseDamage: 70,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],
	"Zenin Toji (Reincarnated)": [
		{
			name: "Purgatory",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Bloodlusted: Skull Crush",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Racism: World Cutting Slash",
			probability: 20,
			baseDamage: 30,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],
	"Disaster Curses": [
		{
			name: "Combined: Stream",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Combined: Waterfall",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Combined: Fluxing Stream",
			probability: 20,
			baseDamage: 50,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],
	"Dagon": [
		{
			name: "Oceanic: Stream",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Disaster Tides: Death Swarm",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Horizon of the Captivating Skandha",
			probability: 20,
			baseDamage: 50,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],
	"Hanami": [
		{
			name: "Flower Garden",
			probability: 50,
			baseDamage: 25,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Cursed Bud",
			probability: 30,
			baseDamage: 17,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "World of Cursed Blossoms",
			probability: 20,
			baseDamage: 50,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],

	"Mahito": [
		{
			name: "Transfiguration",
			probability: 50,
			baseDamage: 14,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "Soul Touch",
			probability: 30,
			baseDamage: 41,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "Cloning Technique",
			probability: 20,
			baseDamage: 26,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	],
	"Mahito (120%)": [
		{
			name: "Limit-Broken: Transfiguration",
			probability: 50,
			baseDamage: 32,
			embedUpdate: embed => embed.setDescription("BLAST!")
		},
		{
			name: "120% Soul Touch",
			probability: 30,
			baseDamage: 28,
			embedUpdate: embed => embed.setDescription("Strike!")
		},
		{
			name: "120% Cloning Technique",
			probability: 20,
			baseDamage: 42,
			embedUpdate: embed => embed.setDescription("ZAP")
		}
	]
}

export function chooseRandomAttackForBossBasedOnProbability(attacks: Attack[]): Attack {
	// 1. Calculate a 'scaled' random number for selection
	let totalProbability = 0
	for (const attack of attacks) {
		totalProbability += attack.probability
	}
	const scaledRandomNumber = Math.random() * totalProbability

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
	"Gamblers Limit": {
		description: "Gamble for a chance to increase or decrease damage!",
		effect: "? ? ?"
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
	"Prayer Song": {
		description: "Reduces incoming damage by 20%",
		effect: "20% REDUC"
	},
	"Mutual Love": {
		description: "Reduces incoming damage by 20%",
		effect: "20% REDUC"
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
export async function applyMutualLoveEffect(userId) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId) // This function needs to fetch the current effects from the database

	// Check if "Prayer Song" is already active to avoid duplication
	if (!currentEffects.includes("Mutual Love")) {
		const updatedEffects = [...currentEffects, "Mutual Love"]
		await updateUserStatusEffects(userId, updatedEffects) // Update the database with the new effects list
	}
}

export async function applyIdleDeathsGamble(userId) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId)

	// Check if "Prayer Song" is already active to avoid duplication
	if (!currentEffects.includes("Gamblers Limit")) {
		const updatedEffects = [...currentEffects, "Gamblers Limit"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}
export async function applyAdaption(userId) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId)

	// Check if "Prayer Song" is already active to avoid duplication
	if (!currentEffects.includes("Adaption")) {
		const updatedEffects = [...currentEffects, "Adaption"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}

export async function applyWorldCuttingSlash(userId) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId)

	if (!currentEffects.includes("World Cutting Slash")) {
		const updatedEffects = [...currentEffects, "World Cutting Slash"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}

export async function applytransformation(userId) {
	// Fetch current status effects
	const currentEffects = await getUserStatusEffects(userId)

	if (!currentEffects.includes("1000 Year Curse")) {
		const updatedEffects = [...currentEffects, "1000 Year Curse"]
		await updateUserStatusEffects(userId, updatedEffects)
	}
}

export async function fetchAndFormatStatusEffects(userId) {
	const statusEffects = await getUserStatusEffects(userId)
	const formattedEffects = statusEffects.map(effect => {
		if (statusEffectsDescriptions[effect]) {
			return `${effect} (${statusEffectsDescriptions[effect].description})`
		}
		return effect
	})

	return formattedEffects.length > 0 ? formattedEffects.join(", ") : "None"
}

export function calculateDamageWithEffects(baseDamage, userId, statusEffects) {
	let damage = baseDamage
	let damageReduction = 1 // No reduction initially
	let damageIncrease = 1 // No increase initially

	// DOMAIN EFFECTS
	if (statusEffects.includes("Curse King")) {
		damageReduction *= 0.2
		damageIncrease *= 1.2
	}
	if (statusEffects.includes("Sukuna's Honour")) {
		damageReduction *= 0.1
	}
	if (statusEffects.includes("1000 Year Curse")) {
		damageReduction *= 0.4
		damageIncrease *= 1.4
	}
	if (statusEffects.includes("Limitless")) {
		damageReduction *= 0.2
		damageIncrease *= 1.2
	}

	if (statusEffects.includes("Mutual Love")) {
		damageReduction *= 0.3
		damageIncrease *= 1.4
	}
	if (statusEffects.includes("Gamblers Limit")) {
		const gambleOutcome = Math.random()
		if (gambleOutcome < 0.5) {
			damageReduction *= 0.3
			damageIncrease *= 1.3
		} else {
			damageReduction *= 1.1
			damageIncrease *= 0.7
		}
	}
	if (statusEffects.includes("Beach Bum")) {
		damageReduction *= 0.2
		damageIncrease *= 1.2

		//
		//
		// TECHNIQUE EFFECTS
		if (statusEffects.includes("Adaption")) {
			damageReduction *= 0.85
			damageIncrease *= 1.2
		}
		if (statusEffects.includes("Prayer Song")) {
			damageReduction *= 0.2
		}
		damage *= damageIncrease
		damage *= damageReduction

		return damage
	}
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

// apply permanent status effect its always in the perm effects but apply it in battle
export async function applyPermanentStatusEffect(userId, effectName) {
	// Fetch current status effects
	const currentEffects = await getUserPermEffects(userId)

	// Check if the status effect is already active to avoid duplication
	if (!currentEffects.includes(effectName)) {
		const updatedEffects = [...currentEffects, effectName]
		await updateUserStatusEffects(userId, updatedEffects) // Update the database with the new effects list
	}
}
export const DOMAIN_INFORMATION = [
	{
		name: "Malevolent Shrine",
		description:
			"Sukuna's Malevolent Shrine is a nightmarish domain of bones and skulls, where his attacks never miss.  It's a chilling testament to his limitless power and boundless cruelty.",
		image: "https://i.redd.it/p1zq5wjwxr0c1.jpg",
		effects: "Curse King, (Dismantle) 20% Damage Increase, 20% Damage Reduction [ MORE SOON ]",
		requirement: "Malevolent Token"
	},
	{
		name: "Unlimited Void",
		description: "This domain overwhelms the target with an infinite thought, rendering them powerless...",
		image: "https://cdn.discordapp.com/attachments/1094302755960664255/1226008400819916932/Satoru_Gojo_uses_Unlimited_Void_in_Shibuya_Anime.png?ex=6623344c&is=6610bf4c&hm=135a8d9f628b658f55a4228840d5fd554fd6ff8aff31dfc3023dbf99f2fd65d3&",
		effects: "Limitless, 20% Damage Reduction, 20% Damage Increase [ MORE SOON ]",
		requirement: "Limitless Token"
	},
	{
		name: "Coffin of the Iron Mountain",
		description: "A domain expansion that traps the target in a Volcano...",
		image: "https://pbs.twimg.com/media/EmuPKcNVkAE5Kbm.jpg:large",
		effects: "Volcano Head, 20% Damage Increase, 20% Damage Reduction [ MORE SOON ]",
		requirement: "Volcano Token"
	},
	{
		name: "Horizon of the Captivating Skandha",
		description: "blorp glorp (fish noise).",
		image: "https://pbs.twimg.com/media/GIE88o0WAAAJyeh.jpg",
		effects: "Beach Bum, 20% Damage Increase, 20% Damage Reduction [ MORE SOON ]",
		requirement: "Dagon's Token"
	},
	{
		name: "Idle Deaths Gamble",
		description: "A Gamble With Fate....",
		image: "https://cdn.discordapp.com/attachments/1094302755960664255/1226005623372775426/Idle_Death_Gamble.png?ex=662331b6&is=6610bcb6&hm=a8eeb6acc464dbe6f44b686d5fc32fca2950bbb61a6f426fffce6a4066123e6b&",
		effects:
			"Gamblers Limit, 50/50 Chance to do 30% more damage And 10% DMG Reduction, or 25% Less Damage and 10% Damage Taken Increase [ MORE SOON ]",
		requirement: "Hakari Kinji's Token"
	},
	{
		name: "Self-Embodiment of Perfection",
		description: "The true nature of the soul..",
		image: "https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/23/Mahito%27s_Territorial_Expansion_Mahayana_Prison.png/revision/latest?cb=20190601212135",
		effects: "Soul Touch: 20% Damage Increase, 20% Damage Reduction. [ MORE SOON ]",
		requirement: "Soul Token"
	},
	{
		name: "True and Mutual Love",
		description: "Rika, Lend me your strength! and i'll be yours forever!",
		image: "https://cdn.discordapp.com/attachments/1094302755960664255/1226022659700297748/main-qimg-677cba957d89c255d384c0778fc9af97.jpg?ex=66234194&is=6610cc94&hm=22163f50298e2e83a729e448ec619eb9079af3a5c9b2064d34ca28d3a81cefa6&",
		effects: "Mutual Love: 30% Damage Increase, 25% Damage Reduction. [ MORE SOON ]",
		requirement: "Mutual Token"
	}
]

export const TRANSFORMATIONS = [
	{
		name: "Curse King",
		description: "AH I KNEW IT THE LIGHT FEELS BEST IN THE FLESH!",
		image: "https://media.discordapp.net/attachments/681985000521990179/1226844171827154965/sukuna-evil-laugh.gif?ex=66263eac&is=6613c9ac&hm=0799274885b6078cf77283a04a31491e6c8d41c190a427f47cc8ed6dddfac181&",
		effects: "1000 Year Curse, 25% Damage Increase, 5% Damage Reduction"
	},
	{
		name: "Six Eyes Release",
		description: "Come on, let's get serious.",
		image: "https://media1.tenor.com/m/T8RWNLn_aIUAAAAd/jjk-jujutsu-kaisen.gif",
		effects: "1000 Year Curse, 18% Damage Increase, 16% Damage Reduction"
	},
	{
		name: "Curse Queen",
		description: "Rika.. Lend me your strength.",
		image: "https://64.media.tumblr.com/33cacf2a119115bcdb869f76c68e16d9/df6ff4dc29f5c53a-f9/s540x810/71e5c78b6b6ed34d000aee942ff70641e18414f6.gif",
		effects: "Release of the Queen, 28% Damage Increase, 1% Damage Reduction",
		time: "3 Minutes"
	},
	{
		name: "Cursed Energy Reinforcement",
		description: "Reinforce your cursed energy to increase your power!",
		image: "https://media1.tenor.com/m/QZAfD8Pdb2wAAAAC/itadori-yuji-cursed-energy.gif",
		effects: "Reinforcement, 15% Damage Reduction"
	}
]
