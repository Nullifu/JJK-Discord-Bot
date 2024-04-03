export const digitems = [
	{ name: "Prison Realm Fragment", rarity: "Super Rare", chance: 0.07 },
	{ name: "Jogos left testicle", rarity: "Super Rare", chance: 0.07 },
	{ name: "Jogos right testicle", rarity: "Super Rare", chance: 0.07 },
	{ name: "Super Glue", rarity: "Super Rare", chance: 0.07 },
	{ name: "Sukuna Finger", rarity: "Special Grade", chance: 0.05 },
	{ name: "Rikugan Eye", rarity: "Special Grade", chance: 0.03 },
	{ name: "Heavenly Chain", rarity: "Special Grade", chance: 0.1 }
]
export const items = [
	{ name: "Tailsman", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "Takada-Chan Autograph", rarity: "Super Rare", chance: 0.07, price: 200 },
	{ name: "Junpei", rarity: "Super Rare", chance: 0.07, price: 200 },
	{ name: "(Broken) Electrical Staff", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "(Broken) Split Soul Katana", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "(Broken) Divine General Wheel", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "(Broken) Playful Cloud", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "Prison Realm Fragment", rarity: "Super Rare", chance: 0.07, price: 0 },

	// ^ Easy to find
	{ name: "Jogos left testicle", rarity: "Super Rare", chance: 0.07, price: 2500 },
	{ name: "Jogos right testicle", rarity: "Super Rare", chance: 0.07, price: 2500 },
	{ name: "Go//Jo", rarity: "Super Rare", chance: 0.07, price: 2500 },

	// Medium to find
	{ name: "Super Glue", rarity: "Super Rare", chance: 0.07, price: 12500 },
	{ name: "Heavenly Chain", rarity: "Special Grade", chance: 0.1, price: 14000 },
	{ name: "Cursed Shard", rarity: "Special Grade", chance: 0.1, price: 14500 },
	{ name: "Transfigured Soul", rarity: "Special Grade", chance: 0.1, price: 19500 },
	{ name: "Brotherly Bracelet", rarity: "Special Grade", chance: 0.1, price: 14500 },
	{ name: "Cursed Shard", rarity: "Special Grade", chance: 0.1, price: 14500 },

	// Semi hard to find^
	{ name: "Jogos (Fixed) Balls", rarity: "Special Grade", chance: 0.1, price: 75000 },
	{ name: "Sukuna Fingers", rarity: "Special Grade", chance: 0.1, price: 25000 },
	{ name: "Rikugan Eye", rarity: "Special Grade", chance: 0.1, price: 25000 },

	//
	{ name: "(Fixed) Divine General Wheel", rarity: "Special Grade", chance: 0.1, price: 125000 },
	{ name: "Six Eyes", rarity: "Special Grade", chance: 0.1, price: 175000 },
	{ name: "Domain Token", rarity: "Special Grade", chance: 0.1, price: 275000 },
	{ name: "Heavenly Restricted Blood", rarity: "Special Grade", chance: 0.1, price: 275000 }
	// ^ Hard to find // Difficult crafted items
]

export interface BossDrop {
	name: string
	rarity: string
}

export const bossDrops: Record<string, BossDrop[]> = {
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
		{ name: "Prison Realm Fragment", rarity: "rare" },
		{ name: "(Broken) Playful Cloud", rarity: "rare" },
		{ name: "Transfigured Soul", rarity: "ultra rare" }
	],
	"The Honored One": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "rare" },
		{ name: "Rikugan Eye", rarity: "ultra rare" }
	],
	"Mahoraga": [
		{ name: "(Broken) Divine General Wheel", rarity: "rare" },
		{ name: "Tailsman", rarity: "rare" },
		{ name: "(Fixed) Divine General Wheel", rarity: "ultra rare" }
	],
	"Mahito Instant Spirit Body of Distorted Killing": [
		{ name: "Transfigured Soul", rarity: "rare" },
		{ name: "Tailsman", rarity: "rare" },
		{ name: "Junpei", rarity: "ultra rare" }
	],
	"Hakari Kinji": [
		{ name: "Gambler Token", rarity: "rare" },
		{ name: "Tailsman", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" }
	],

	"Kashimo": [
		{ name: "(Broken) Electrical Staff", rarity: "rare" },
		{ name: "Tailsman", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" }
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
		image_URL: "https://media1.tenor.com/m/GXV82xs5pFgAAAAC/jujutsu-kaisen-satoru-gojo.gif"
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
	},
	{
		name: "Horizon of the Captivating Skandha",
		description: "This domain resembles a beach",
		image_URL: "https://media1.tenor.com/m/K_3LZ71V7s0AAAAd/nanami-nanamin.gif"
	}
]

export const heavenlyrestrictionskills = [
	{
		name: "Pummel",
		description: "Die!",
		cost: "175000",
		clan: "Heavenly Restricted",
		items: [
			{
				name: "Heavenly Chain",
				quantity: 1
			}
		]
	},
	{
		name: "Resonant Strike",
		description: "Considered one of the most powerful techniques in Jujutsu",
		cost: "75000",
		clan: "Heavenly Restricted",
		items: [
			{
				name: "Heavenly Chain",
				quantity: 1
			}
		]
	},
	{
		name: "Shrapnel Burst",
		description: "Perish!",
		cost: "25000",
		clan: "Heavenly Restricted",
		items: [
			{
				name: "Heavenly Chain",
				quantity: 1
			}
		]
	},
	{
		name: "Nerve Cluster Blitz",
		description: "Strike!",
		cost: "175000",
		clan: "Heavenly Restricted",
		items: [
			{
				name: "Heavenly Chain",
				quantity: 1
			}
		]
	},
	{
		name: "Unbound Fury",
		description: "Fury of the heavens",
		cost: "125000",
		clan: "Heavenly Restricted",
		items: [
			{
				name: "Heavenly Chain",
				quantity: 1
			}
		]
	},
	{
		name: "Inverted Spear Of Heaven: Severed Universe",
		description: "The skill that sliced through infinity..",
		cost: "325000",
		clan: "Heavenly Restricted",
		items: [
			{
				name: "Heavenly Chain",
				quantity: 6
			}
		]
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
		cooldown: 30 * 60 * 1000
	},
	{
		name: "Jujutsu Sorcerer",
		payout: { min: 40000, max: 56500 },
		cost: 190000,
		requiredExperience: 235,
		cooldown: 30 * 60 * 1000
	},
	{
		name: "Curse Hunter",
		payout: { min: 62500, max: 74500 },
		cost: 245000,
		requiredExperience: 300,
		cooldown: 2700000
	},
	{
		name: "Satoru Gojo's Assistant",
		payout: { min: 125000, max: 235000 },
		cost: 1000000,
		requiredExperience: 1250,
		cooldown: 60 * 60 * 1000
	},
	{
		name: "Hakari Kinji's Lawyer",
		payout: { min: 185000, max: 300000 },
		cost: 2500000,
		requiredExperience: 2500,
		cooldown: 60 * 60 * 1000
	},
	{
		name: "Veil Caster",
		payout: { min: 275000, max: 542000 },
		cost: 3000000,
		requiredExperience: 6400,
		cooldown: 60 * 60 * 2000
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
	{
		name: "The Honored One",
		description: "? ? ?",
		achievementId: "behonoredLimitless",
		reward: "[TITLE] The Honored One"
	},
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
	},
	behonoredLimitless: {
		name: "The Honored One",
		description: "? ? ?",
		reward: "[TITLE] The Honored One"
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

export const CLAN_SKILLS = {
	"Demon Vessel": [
		{
			name: "Flame Arrow",
			description: "Fuga...",
			cost: "325000",
			energy: "20",
			clan: "Demon Vessel",
			items: [{ name: "Sukuna Finger", quantity: 6 }]
		},
		{
			name: "Dismantle",
			description: "SLICE!",
			cost: "75000",
			clan: "Demon Vessel",
			items: [{ name: "Sukuna Finger", quantity: 1 }]
		},
		{
			name: "Cleave",
			description: "Embodiment of true fear and terror",
			cost: "25000",
			clan: "Demon Vessel",
			items: [{ name: "Sukuna Finger", quantity: 1 }]
		}
	],
	"Limitless": [
		{
			name: "Hollow Purple",
			description: "Throughout heaven and earth..",
			cost: "325000",
			clan: "Limitless",
			items: [{ name: "Six Eyes", quantity: 1 }]
		},
		{
			name: "Lapse: Blue",
			description: " Jutsushiki Junten・Ao!",
			cost: "125000",
			clan: "Limitless",
			items: [{ name: "Rikugan Eye", quantity: 1 }]
		},
		{
			name: "Limitless: Red",
			description: "Aka..",
			cost: "25000",
			clan: "Limitless",
			items: [{ name: "Rikugan Eye", quantity: 1 }]
		}
	],
	"Fushiguro": [
		{
			name: "Ten Shadows Technique: Divergent Sila Divine General Mahoraga",
			description: "With this treasure i summon...",
			cost: "325000",
			clan: "Fushiguro",
			items: [{ name: "(Broken) Divine General Wheel", quantity: 6 }]
		},
		{
			name: "Ten Shadows Technique: Divine Dogs",
			description: "Divine Dogs!",
			cost: "125000",
			clan: "Fushiguro",
			items: [{ name: "Tailsman", quantity: 1 }]
		},
		{
			name: "Ten Shadows Technique: Nue",
			description: "bird :3",
			cost: "25000",
			clan: "Fushiguro",
			items: [{ name: "Sukuna Finger", quantity: 1 }]
		}
	],
	"Zenin": [
		{
			name: "Zenin Style: Playful Cloud: STRIKE",
			description: "Vanish!",
			cost: "175000",
			clan: "Zenin",
			items: [{ name: "(Broken) Playful Cloud", quantity: 3 }]
		},
		{
			name: "Zenin Style: Cursed Spirit Binding",
			description: "Bind!",
			cost: "125000",
			clan: "Zenin",
			items: [{ name: "(Broken) Playful Cloud", quantity: 1 }]
		},
		{
			name: "Zenin Style: Overwhelming Strike",
			description: "PERISH!",
			cost: "25000",
			clan: "Zenin",
			items: [{ name: "(Broken) Playful Cloud", quantity: 1 }]
		}
	],
	"Disaster Flames": [
		{
			name: "Maximum: METEOR!",
			description: "I'LL TURN YOU INTO A CRISP!",
			cost: "325000",
			clan: "Disaster Flames",
			items: [{ name: "Jogos (Fixed) Balls", quantity: 3 }]
		},
		{
			name: "Disaster Flames: Lava Bend",
			description: "Bend to my will!",
			cost: "125000",
			clan: "Disaster Flames",
			items: [{ name: "Jogos right testicle", quantity: 1 }]
		},
		{
			name: "Disaster Flames: Fire Manipulation",
			description: "PERISH!",
			cost: "25000",
			clan: "Disaster Flames",
			items: [{ name: "Jogos left testicle", quantity: 1 }]
		}
	],
	"Gambler Fever": [
		{
			name: "Jackpot: Strike",
			description: "Let's get lucky...",
			cost: "525000",
			clan: "Gambler Fever",
			items: [{ name: "Gambler Token", quantity: 3 }]
		},
		{
			name: "Gambler Fever: Random Rush!",
			description: "Perish!",
			cost: "185000",
			clan: "Gambler Fever",
			items: [{ name: "Gambler Token", quantity: 1 }]
		},
		{
			name: "Gambler Fever: Cargo Rush",
			description: "Take this!",
			cost: "65000",
			clan: "Gambler Fever",
			items: [{ name: "Gambler Token", quantity: 1 }]
		}
	],
	"Okkotsu": [
		{
			name: "MAXIMUM: BLACK FLASH",
			description: "....",
			cost: "925000",
			clan: "Okkotsu",
			items: [{ name: "Yuta's Token", quantity: 3 }]
		},
		{
			name: "Pure Love: Unleashed Fury",
			description: "Perish!",
			cost: "500000",
			clan: "Okkotsu",
			items: [{ name: "Yuta's Token", quantity: 1 }]
		},
		{
			name: "Steel Arm: Freezing Strike",
			description: "Take this!",
			cost: "325000",
			clan: "Okkotsu",
			items: [{ name: "Yuta's Token", quantity: 1 }]
		}
	]
}

export const benefactors = [
	{ name: "Satoru Gojo", coins: 9500, item: "Rikugan Eye", itemQuantity: 1, weight: 1 },
	{ name: "Kento Nanami", coins: 1500, weight: 8 },
	{ name: "Yuji Itadori", item: "Special Grade Cursed Object", itemQuantity: 1, weight: 2 },
	{ name: "Hakari Kinji", coins: 3000, item: "Gambler Token", itemQuantity: 1, weight: 5 },
	{ name: "Nobara Kugisaki", coins: 3000, item: "Nobara's Right Eye", itemQuantity: 1, weight: 3 },
	{ name: "Megumi Fushiguro", coins: 5000, weight: 10 }
]

// quests array
export const questsArray = [
	{
		name: "Gamblers Fever",
		description: "Defeat Hakari Kinji 5 Times!",
		coins: 45000,
		experience: 470,
		item: "Hakari Kinji's Token",
		itemQuantity: 1,
		task: "Defeat Hakari Kinji",
		totalProgress: 5
	},
	{
		name: "Nature of Curses",
		description: "Defeat Mahito In His True Form.",
		coins: 23000,
		experience: 320,
		item: "Junpei",
		itemQuantity: 1,
		task: "Defeat Reborn Mahito",
		totalProgress: 1
	},
	{
		name: "Curse King",
		description: "Get Cursed By Sukuna....",
		coins: 23000,
		experience: 320,
		item: "Special-Grade Geo Locator",
		itemQuantity: 3,
		task: "Get Cursed By Sukuna.",
		totalProgress: 1
	},
	{
		name: "Find Yuta!",
		description: "Locate Yuta Okkotsu!",
		coins: 34000,
		experience: 250,
		item: "Yuta's Token",
		itemQuantity: 1,
		task: "Find this fraud!",
		totalProgress: 1
	},
	{
		name: "The Honored One",
		description: "Be blessed with the six eyes..",
		coins: 20000,
		experience: 320,
		item: "Sacred Eye",
		itemQuantity: 1,
		task: "Be blessed with the limitless technique...",
		totalProgress: 1
	}
]
