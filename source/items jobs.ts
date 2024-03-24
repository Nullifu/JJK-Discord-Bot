export const items = [
	{ name: "Wood", rarity: "Common", chance: 0.1, price: 10 },
	{ name: "Tailsman", rarity: "Common", chance: 0.1, price: 400 },
	{ name: "Emerald", rarity: "Rare", chance: 0.1, price: 1400 },
	{ name: "Sapphire", rarity: "Rare", chance: 0.1, price: 3200 },
	{ name: "Platinum", rarity: "Rare", chance: 0.1, price: 100000 },
	{ name: "Prison Realm Fragment", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "Jogos left testicle", rarity: "Super Rare", chance: 0.07, price: 2500 },
	{ name: "Jogos right testicle", rarity: "Super Rare", chance: 0.07, price: 2500 },
	{ name: "Super Glue", rarity: "Super Rare", chance: 0.07, price: 2500 },
	{ name: "Sukuna Finger", rarity: "Special Grade", chance: 0.05, price: 74000 },
	{ name: "Rikugan Eye", rarity: "Special Grade", chance: 0.03, price: 90000 },
	{ name: "Heavenly Chain", rarity: "Special Grade", chance: 0.1, price: 600000 }
]

export const bossDrops = {
	"Sukuna": [
		{ name: "Sukuna Finger", rarity: "common" },
		{ name: "Cursed Shard", rarity: "rare" }
	],
	"Zenin Toji": [
		{ name: "(Broken) Split Soul Katana", rarity: "common" },
		{ name: "Fractured Chain", rarity: "ultra rare" }
	],
	"Megumi Fushiguro": [
		{ name: "Super Glue", rarity: "rare" },
		{ name: "(Broken) Divine General Wheel", rarity: "ultra rare" }
	],
	"Satoru Gojo": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Go//Jo", rarity: "ultra rare" }
	],
	"Itadori": [
		{ name: "Tailsman", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" }
	],
	"Aoi Todo & Itadori": [
		{ name: "Brotherly Bracelet", rarity: "rare" },
		{ name: "Takada-Chan Autograph", rarity: "rare" },
		{ name: "Heavenly Chain", rarity: "rare" }
	],
	"Jogo": [
		{ name: "Jogos left testicle", rarity: "rare" },
		{ name: "Jogos right testicle", rarity: "rare" }
	],
	"Mahito (Transfigured)": [
		{ name: "Transfigured Soul", rarity: "ultra rare" },
		{ name: "Cursed Shard", rarity: "rare" }
	],
	"Suguru Geto": [
		{ name: "(Broken) Playful Cloud", rarity: "rare" },
		{ name: "Transfigured Soul", rarity: "ultra rare" }
	]
}

export const dailyitems = [
	{ name: "Sukuna Finger" },
	{ name: "Rikugan Eye" },
	{ name: "Heavenly Chain" },
	{ name: "Osaka Plushie" },
	{ name: "Nobara Plushie" },
	{ name: "Megumi Plushie" },
	{ name: "Sukuna Plushie" },
	{ name: "Takada-Chan Plushie" }

	// ...
]

export const craftingRecipes = {
	prison_realm: {
		requiredItems: [
			{ name: "Prison Realm Fragment", quantity: 6 },
			{ name: "Rikugan Eye", quantity: 2 }
		],
		craftedItemName: "Prison Realm"
	},
	six_eyes: {
		requiredItems: [{ name: "Rikugan Eye", quantity: 6 }],
		craftedItemName: "Six Eyes"
	},
	jogos_fixed_balls: {
		requiredItems: [
			{ name: "Jogos left testicle", quantity: 1 },
			{ name: "Jogos right testicle", quantity: 1 },
			{ name: "Super Glue", quantity: 1 }
		],
		craftedItemName: "Jogos (Fixed) Balls"
	},
	domain_token: {
		requiredItems: [
			{ name: "Six Eyes", quantity: 1 },
			{ name: "Prison Realm", quantity: 1 },
			{ name: "Heavenly Chain", quantity: 1 },
			{ name: "Sukuna Finger", quantity: 1 }
		],
		craftedItemName: "Domain Token"
	},
	heavenly_restricted_blood: {
		requiredItems: [
			{ name: "Six Eyes", quantity: 1 },
			{ name: "Sukuna Finger", quantity: 1 },
			{ name: "Domain Token", quantity: 1 }
		],
		craftedItemName: "Heavenly Restricted Blood"
	}
}

export const DOMAIN_EXPANSIONS = [
	{
		name: "Idle Deaths Gamble",
		description: "Turn up the volume..",
		image_URL: "https://media1.tenor.com/m/Rpk3q-OLFeYAAAAC/hakari-dance-hakari.gif"
	},
	{
		name: "Unlimited Void",
		description: "Considered one of the most powerful techniques in Jujutsu",
		image_URL:
			"https://64.media.tumblr.com/366de99d6648d5915140d29a0ecff673/c351c57420a7daeb-3d/s540x810/1e37fa6f81e7f2531d806c4bd4504ffeb128fd12.gif"
	},
	{
		name: "Malevolent Shrine",
		description: "Embodiment of true fear and terror",
		image_URL: "https://media1.tenor.com/m/Nwwk0JIGr28AAAAC/sukuna-domain-expansion.gif"
	},
	{
		name: "Coffin of the Iron Mountain",
		description: "This domain resembles the inside of an active volcano.",
		image_URL: "https://media1.tenor.com/m/dNMYzPN4wF0AAAAC/jogo-jjk-jogoat.gif"
	},
	{
		name: "Self-Embodiment of Perfection",
		description: "The true nature of the soul.",
		image_URL: "https://media1.tenor.com/m/419YEH3WEwIAAAAC/jujutsu-kaisen-mahito.gif"
	}
]

export const SKILLS = [
	{
		name: "Flame Arrow",
		description: "Turn up the volume..",
		image_URL: "https://media1.tenor.com/m/Rpk3q-OLFeYAAAAC/hakari-dance-hakari.gif"
	},
	{
		name: "Dismantle",
		description: "Considered one of the most powerful techniques in Jujutsu",
		image_URL:
			"https://64.media.tumblr.com/366de99d6648d5915140d29a0ecff673/c351c57420a7daeb-3d/s540x810/1e37fa6f81e7f2531d806c4bd4504ffeb128fd12.gif"
	},
	{
		name: "Cleave",
		description: "Embodiment of true fear and terror",
		image_URL: "https://media1.tenor.com/m/Nwwk0JIGr28AAAAC/sukuna-domain-expansion.gif"
	}
]

export type items = {
	name: string
	rarity: string
	chance: number
	price: number
}
export function getRandomItem() {
	const roll = Math.random()
	let cumulativeChance = 0

	for (const item of items) {
		cumulativeChance += item.chance
		if (roll < cumulativeChance) {
			return item
		}
	}
	return null // If no item is found based on the chances
}
// jobs sans will never get
export const jobs = [
	{ name: "Student", payout: { min: 250, max: 750 }, cost: 0, requiredExperience: 0, cooldown: 80000 },
	{ name: "Janitor", payout: { min: 2500, max: 7500 }, cost: 1250, requiredExperience: 10, cooldown: 900000 },
	{
		name: "Mechanic",
		payout: { min: 9500, max: 17000 },
		cost: 60000,
		requiredExperience: 100,
		cooldown: 25 * 60 * 1000
	},
	{
		name: "Jujutsu Janitor",
		payout: { min: 25000, max: 37500 },
		cost: 125000,
		requiredExperience: 145,
		cooldown: 180000
	},
	{
		name: "Jujutsu Sorcerer",
		payout: { min: 40000, max: 56500 },
		cost: 190000,
		requiredExperience: 235,
		cooldown: 180000
	},
	{
		name: "Curse Hunter",
		payout: { min: 62500, max: 74500 },
		cost: 245000,
		requiredExperience: 300,
		cooldown: 180000
	},
	{
		name: "Satoru Gojo's Assistant",
		payout: { min: 125000, max: 235000 },
		cost: 1000000,
		requiredExperience: 750,
		cooldown: 60 * 60 * 1000
	}

	// ...
]

export const titles = [
	{
		name: "Restless Gambler",
		description: "Unlock Idle Deaths Gamble",
		achievementId: "unlockIdleDeathsGamble",
		reward: "[TITLE] Restless Gambler"
	},
	{
		name: "Void Walker",
		description: "Unlock Unlimited Void",
		achievementId: "unlockUnlimitedVoid",
		reward: "[TITLE] Void Walker"
	},
	{
		name: "Shrine Keeper",
		description: "Unlock Malevolent Shrine",
		achievementId: "unlockMalevolentShrine",
		reward: "[TITLE] Shrine Keeper"
	},
	{
		name: "Cursed Spirit",
		description: "Die for the first time!",
		achievementId: "diedfirstTime",
		reward: "[TITLE] Cursed Spirit"
	},
	{
		name: "Domain Expansion User",
		description: "Unlock Domain Expansion!",
		achievementId: "unlockedDomain",
		reward: "[TITLE] Domain Expansion User"
	},
	{
		name: "Sukunas Vessel",
		description: "Consume Sukunas Finger",
		achievementId: "consumeFinger",
		reward: "[TITLE] Sukunas Vessel"
	},
	{
		name: "Heavenly Restricted",
		description: "Unlock Heavenly Restriction",
		achievementId: "unlockHeavenlyRestriction",
		reward: "[TITLE] Heavenly Restricted"
	},
	{ name: "Honored One", description: "???" },
	{ name: "Cursed Child", description: "???" }
]

interface Achievement {
	name: string
	description: string
	reward: string // Assuming every achievement has a reward. If not, use `reward?: string` for optional.
}

export const allAchievements: Record<string, Achievement> = {
	unlockIdleDeathsGamble: {
		name: "Restless Gambler",
		description: "Unlock Idle Deaths Gamble",
		reward: "[TITLE] Restless Gambler"
	},
	unlockUnlimitedVoid: {
		name: "Void Walker",
		description: "Unlock Unlimited Void",
		reward: "[TITLE] Void Walker"
	},
	unlockMalevolentShrine: {
		name: "Shrine Keeper",
		description: "Unlock Malevolent Shrine",
		reward: "[TITLE] Shrine Keeper"
	},
	diedfirstTime: {
		name: "Cursed Spirit",
		description: "Die for the first time!",
		reward: "[TITLE] Cursed Spirit"
	},
	unlockedDomain: {
		name: "Domain Expansion User",
		description: "Unlock Domain Expansion!",
		reward: "[TITLE] Domain Expansion User"
	},
	consumeFinger: {
		name: "Demon Vessel",
		description: "Consume Sukunas Finger",
		reward: "[TITLE] Demon Vessel"
	},
	unlockHeavenlyRestriction: {
		name: "Heavenly Restricted",
		description: "Unlock Heavenly Restriction",
		reward: "[TITLE] Heavenly Restricted"
	}

	// Add additional achievements as needed.
}

export const lookupItems = [
	{
		name: "Sukuna Finger",
		description: "One of the 20 cursed fingers from the fearsome curse Ryomen Sukuna.",
		effect: "Eat one and you might gain special abilities!"
	},
	{ name: "Tailsman", description: "Common Tailsman!" },
	{
		name: "Domain Token",
		description: "A special grade token that can grant the user a domain of their choice!",
		effect: "Use it and manifest your domain!"
	},
	{ name: "Jogos (Fixed) Balls", description: "Shibuya Aftermath!", effect: "Doesn't really do much" },
	{ name: "Platinum", description: "Rare" },
	{
		name: "Prison Realm Fragment",
		description:
			"Fragmented pieces of the Prison Realm were scattered across the lands following satoru gojos unsealment!",
		effect: "Combine all 6 to create the Prison Realm!"
	},
	{ name: "Jogos left testicle", description: "One of them!", effect: "Find the other and you may fix them!" },
	{
		name: "Jogos right testicle",
		description: "Oh, Here's the other!",
		effect: "Find the other and you may fix them!"
	},
	{ name: "Super Glue", description: "Will fix (ANYTHING)", effect: "Use it to fix any broken item" },
	{ name: "Six Eyes", description: "? ? ?", effect: "Throughout heaven and earth.." },
	{ name: "Rikugan Eye", description: "? ? ?" },
	{ name: "Heavenly Chain", description: "A chain with a fearsome aura.." }
]

export const clanTechniquesMapping = {
	"Demon Vessel": ["Cleave", "Dismantle", "Flame Arrow"],
	"Limitless User": ["Limitless: Blue", "Hollow Purple", "Limitless: Red"],
	"Zenin": ["Zenin Style: Playful Cloud: STRIKE", "Zenin Style: Cursed Spirit Binding"],
	"Fushiguro": [
		"Ten Shadows Technique: Divine Dogs",
		"Ten Shadows Technique: Nue",
		"Ten Shadows Technique: Toad",
		"Eight-Handled Sword Divergent Sila Divine General Mahoraga"
	]
}
