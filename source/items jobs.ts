import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import logger from "./bot.js"
import { dirtyToCleanItemMap } from "./interface.js"
import {
	UserShikigami,
	addItemToUserInventory,
	addUserQuest,
	addUserQuestProgress,
	addUserTechnique,
	getGamblersData,
	getNextAwakeningStage,
	getUserAwakening,
	getUserInateClan,
	getUserInventory,
	getUserMentor,
	getUserQuests,
	getUserUnlockedTransformations,
	removeAllItemEffects,
	removeItemFromUserInventory,
	resetBetLimit,
	updateBalance,
	updateGamblersData,
	updatePlayerClanTier,
	updateUserAchievements,
	updateUserAwakening,
	updateUserClan,
	updateUserExperience,
	updateUserHeavenlyRestriction,
	updateUserInateClan,
	updateUserInateClanExperience,
	updateUserItemEffects,
	updateUserMaxHealth,
	updateUserOwnedInateClan,
	updateUserShikigami,
	updateUserUnlockedBosses,
	updateUserUnlockedTitles,
	updateUserUnlockedTransformations
} from "./mongodb.js"

//
export const items = [
	{ name: "Tailsman", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "Takada-Chan Autograph", rarity: "Super Rare", chance: 0.07, price: 200 },
	{ name: "Junpei", rarity: "Super Rare", chance: 0.07, price: 200 },
	{ name: "(Broken) Electrical Staff", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "(Broken) Split Soul Katana", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "(Broken) Divine General Wheel", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "(Broken) Playful Cloud", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "Prison Realm Fragment", rarity: "Super Rare", chance: 0.07, price: 0 },
	{ name: "(Shattered) Domain Remnants", rarity: "Special Grade", price: 50000 },

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
	{ name: "Sukuna Finger", rarity: "Special Grade", chance: 0.1, price: 25000 },
	{ name: "Rikugan Eye", rarity: "Special Grade", chance: 0.1, price: 25000 },

	//
	{ name: "(Fixed) Divine General Wheel", rarity: "Special Grade", chance: 0.1, price: 125000 },
	{ name: "Six Eyes", rarity: "Special Grade", chance: 0.1, price: 325000 },
	{ name: "Yuta's Token", rarity: "Special Grade", chance: 0.1, price: 275000 },
	{ name: "Heavenly Restricted Blood", rarity: "Special Grade", chance: 0.1, price: 275000 },
	{ name: "Special-Grade Geo Locator", rarity: "Special Grade", chance: 0.1, price: 300000 }

	// ^ Hard to find // Difficult crafted items
]

export const itemEffects = [
	{ name: "Curse Repellent", description: "**Anti-Curse** Less likely to find curse spirit enemies!", time: 25 },
	{
		name: "Special-Grade Cursed Object",
		description: "**Cursed** More likely to find curse spirit enemies!",
		time: 25
	},
	{ name: "Hakari Kinji's Token", description: "**Gambler** 🤑🤑🤑🤑🤑", time: 25 }
]

export const dailyitems = [
	{ name: "Sukuna Finger" },
	{ name: "Rikugan Eye" },
	{ name: "Prison Realm Fragment" },
	{ name: "Super Glue" },
	{ name: "Heavenly Chain" },
	{ name: "Cursed Shard" },
	{ name: "(Shattered) Domain Remnants" }
]

export const craftingRecipes = {
	prison_realm: {
		requiredItems: [
			{ name: "Prison Realm Fragment", quantity: 6 },
			{ name: "Rikugan Eye", quantity: 1 }
		],
		craftedItemName: "Prison Realm",
		emoji: "<:prison_realm:1193160559009484830>"
	},
	shadow_token: {
		requiredItems: [
			{ name: "Shikigami Soul", quantity: 1 },
			{ name: "(Shattered) Domain Remnants", quantity: 2 }
		],
		craftedItemName: "Shadow Token"
	},
	blesscharm: {
		requiredItems: [
			{ name: "Heian Era Scraps", quantity: 1 },
			{ name: "Sukuna Finger", quantity: 2 }
		],
		craftedItemName: "Blessful Charm",
		emoji: "<:file1:1238151120774365184>"
	},
	wheel_fixed: {
		requiredItems: [
			{ name: "(Broken) Divine General Wheel", quantity: 6 },
			{ name: "Super Glue", quantity: 1 }
		],
		craftedItemName: "Mahoragas Wheel",
		emoji: "<:wheel2:1231282696563458118>"
	},
	void: {
		requiredItems: [
			{ name: "Cursed Energy Reinforcement", quantity: 1 },
			{ name: "Overtime", quantity: 1 },
			{ name: "Satoru Gojo's Respect", quantity: 1 },
			{ name: "Sukuna's Honour", quantity: 1 }
		],
		craftedItemName: "Unknown Substance",
		emoji: "<:Substance:1243877991801425981>"
	},
	awakening: {
		requiredItems: [
			{ name: "Awakening Remnant", quantity: 9 },
			{ name: "Heian Era Scraps", quantity: 6 }
		],
		craftedItemName: "Heian Era Awakening Remnant",
		emoji: "<:Remnant:1243878925415747707>"
	},
	health_vial: {
		requiredItems: [
			{ name: "Empty Bottle", quantity: 2 },
			{ name: "Malevolent Shrine (Blood Vial)", quantity: 3 }
		],
		craftedItemName: "Cursed Energy Vial",
		emoji: "<:Vial:1243877992967569520>"
	},
	specialgradespray: {
		requiredItems: [
			{ name: "Empty Bottle", quantity: 1 },
			{ name: "Special-Grade Medicine", quantity: 1 }
		],
		craftedItemName: "Special-Grade Anti Effect Spray",
		emoji: "<:ezgif588ef94330c1:1231284086073725008>"
	},
	bundle_soul: {
		requiredItems: [
			{ name: "Dagons Soul", quantity: 1 },
			{ name: "Jogos Soul", quantity: 1 },
			{ name: "Mahito's Soul", quantity: 1 },
			{ name: "Transfigured Soul", quantity: 6 },
			{ name: "Hanamis Soul", quantity: 1 }
		],
		craftedItemName: "Soul Bundle",
		emoji: "<:ezgif5b1d05d94771:1231285347644870757>"
	},
	curse_rep: {
		requiredItems: [
			{ name: "Empty Bottle", quantity: 1 },
			{ name: "Cursed Shard", quantity: 1 },
			{ name: "Super Glue", quantity: 1 }
		],
		craftedItemName: "Curse Repellent",
		emoji: "<:ezgif588ef94330c1:1231284086073725008>"
	},
	star_fused: {
		requiredItems: [
			{ name: "(Shattered) Star Fragment", quantity: 1 },
			{ name: "(Shattered) Star Remnant", quantity: 1 },
			{ name: "Super Glue", quantity: 2 }
		],
		craftedItemName: "Fused Star",
		emoji: "<:ezgif5b9e754d358:1231284110899675220>"
	},
	malevolent_token: {
		requiredItems: [
			{ name: "Malevolent Shrine (Skull)", quantity: 1 },
			{ name: "Malevolent Shrine (Blood Vial)", quantity: 1 },
			{ name: "(Shattered) Domain Remnants", quantity: 1 }
		],
		craftedItemName: "Malevolent Token",
		emoji: "<:ezgif6382f647639:1226785963976556586>"
	},
	limitless_token: {
		requiredItems: [
			{ name: "Go//Jo", quantity: 1 },
			{ name: "Fraud Poster", quantity: 1 },
			{ name: "(Shattered) Domain Remnants", quantity: 1 }
		],
		craftedItemName: "Limitless Token",
		emoji: "<:ezgif6bfd16821f71:1226786739927122001>"
	},
	hakari_kinjis_token: {
		requiredItems: [
			{ name: "Gambler Token", quantity: 2 },
			{ name: "Bet Slip", quantity: 1 },
			{ name: "(Shattered) Domain Remnants", quantity: 1 }
		],
		craftedItemName: "Hakari Kinji's Token",
		emoji: "<:ezgif69ebde5a49b1:1226789501662134302>"
	},
	dagon_token: {
		requiredItems: [
			{ name: "Blue Fish", quantity: 1 },
			{ name: "Green Fish", quantity: 1 },
			{ name: "(Shattered) Domain Remnants", quantity: 1 }
		],
		craftedItemName: "Dagon's Token",
		emoji: "<:ezgif67fdc45e4d41:1226789943091920896>"
		//
		//
		//
	},
	mutual_token: {
		requiredItems: [
			{ name: "Yuta's Token", quantity: 1 },
			{ name: "(Shattered) Domain Remnants", quantity: 1 }
		],
		craftedItemName: "Mutual Token",
		emoji: "<:ezgif6015811ef2e1:1226788144716845076>"
		//
		//
		//
	},
	special_locator: {
		requiredItems: [
			{ name: "Prison Realm", quantity: 1 },
			{ name: "Rikugan Eye", quantity: 2 },
			{ name: "Special-Grade Cursed Object" || "Special Grade Cursed Object", quantity: 4 },
			{ name: "Sukuna Finger", quantity: 1 }
		],
		craftedItemName: "Special-Grade Geo Locator",
		emoji: "<:ezgif6b39e053d261:1226788874819207249>"
	},
	six_eyes: {
		requiredItems: [{ name: "Rikugan Eye", quantity: 6 }],
		craftedItemName: "Six Eyes",
		emoji: "<:sixeye:1193159757515726919>"
	},
	jogos_fixed_balls: {
		requiredItems: [
			{ name: "Jogos left testicle", quantity: 1 },
			{ name: "Jogos right testicle", quantity: 1 },
			{ name: "Super Glue", quantity: 1 }
		],
		craftedItemName: "Jogos (Fixed) Balls",
		emoji: "<:balls:1244358115642839040>"
	},

	heavenly_restricted_blood: {
		requiredItems: [
			{ name: "Sukuna Finger Bundle", quantity: 1 },
			{ name: "Zenin Toji's Blood", quantity: 1 }
		],
		craftedItemName: "Heavenly Restricted Blood",
		emoji: "<a:wflameblue15:1226787880710705275>"
	},
	sukuna_bundle: {
		requiredItems: [
			{ name: "Sukuna Finger", quantity: 5 },
			{ name: "Super Glue", quantity: 1 }
		],
		craftedItemName: "Sukuna Finger Bundle",
		emoji: "<:ezgif69884ff9ecd1:1226787131956138077>"
	},
	clean_sponge: {
		requiredItems: [
			{ name: "Dirty Sponge", quantity: 1 },
			{ name: "Cleaning Kit", quantity: 1 }
		],
		craftedItemName: "Cleaning Sponge",
		emoji: "<:sponge1:1244363363161608192>"
	}
}

export const DOMAIN_EXPANSIONS = [
	{
		name: "Idle Deaths Gamble",
		description: "Turn up the volume..",
		image_URL: "https://media1.tenor.com/m/Rpk3q-OLFeYAAAAC/hakari-dance-hakari.gif",
		open_image_URL: "https://media1.tenor.com/m/oHYuFbvLxiEAAAAC/hakari-kinji-kinji-hakari.gif",
		statusEffect: "Gamblers Limit"
	},

	{
		name: "Unlimited Void",
		description: "Considered one of the most powerful techniques in Jujutsu",
		image_URL: "https://media1.tenor.com/m/LsBSgRXRgZ4AAAAd/jjk-jujutsu.gif",
		open_image_URL: "https://media1.tenor.com/m/fwRP3JXVRisAAAAC/infinite-void-jujutsu-kaisen.gif",
		statusEffect: "Limitless Info"
	},
	{
		name: "Malevolent Shrine",
		description: "Embodiment of true fear and terror",
		image_URL: "https://media1.tenor.com/m/8x3juyL02isAAAAC/sukuna-malevolent-shrine.gif",
		open_image_URL: "https://media1.tenor.com/m/Nwwk0JIGr28AAAAC/sukuna-domain-expansion.gif",
		statusEffect: "Curse King"
	},
	{
		name: "Coffin of the Iron Mountain",
		description: "This domain resembles the inside of an active volcano.",
		image_URL: "https://media1.tenor.com/m/dNMYzPN4wF0AAAAC/jogo-jjk-jogoat.gif",
		open_image_URL: "https://media1.tenor.com/m/qZ7Lpc3upLoAAAAd/domain-expansion-jogo-jjk.gif",
		statusEffect: "Burning Volcano"
	},
	{
		name: "Self-Embodiment of Perfection",
		description: "The true nature of the soul.",
		image_URL: "https://media1.tenor.com/m/419YEH3WEwIAAAAC/jujutsu-kaisen-mahito.gif",
		open_image_URL: "https://media1.tenor.com/m/uHtT8X1azEwAAAAd/mahito-mechamaru.gif",
		statusEffect: "Nature of the Soul"
	},
	{
		name: "Horizon of the Captivating Skandha",
		description: "This domain resembles a beach",
		image_URL: "https://media1.tenor.com/m/K_3LZ71V7s0AAAAd/nanami-nanamin.gif",
		open_image_URL:
			"https://cdn.discordapp.com/attachments/1186763190835613748/1225701628141895702/ezgif-2-ce4a35009a.gif?ex=66221698&is=660fa198&hm=b74ba35be1175ae166624f1efbc90b502c8b636b60410d807799673f9d821c88&",
		statusEffect: "Beach Bum"
	},
	{
		name: "True and Mutual Love",
		description: "This domain resembles a everlasting field of infinite katanas, Representing Infinite Techniques/",
		image_URL:
			"https://cdn.discordapp.com/attachments/1094302755960664255/1226022659700297748/main-qimg-677cba957d89c255d384c0778fc9af97.jpg?ex=66234194&is=6610cc94&hm=22163f50298e2e83a729e448ec619eb9079af3a5c9b2064d34ca28d3a81cefa6&",
		open_image_URL: "https://media1.tenor.com/m/_LJMlVI4QJcAAAAC/jujutsu-kaisen-yuta-okkotsu.gif",
		statusEffect: "Mutual Love"
	}
]

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
	reward: string
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
}

export const lookupItems = [
	{
		name: "Sukuna Finger",
		description: "One of the 20 cursed fingers from the fearsome curse Ryomen Sukuna.",
		effect: "Eat one and you might gain special abilities!"
	},
	{ name: "Tailsman", description: "Common Tailsman!" },
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
			cost: "50000",
			clan: "Demon Vessel",
			items: [{ name: "Sukuna Finger", quantity: 1 }]
		},
		{
			name: "Black Flash",
			description: "KOKU...SEN!",
			cost: "35000",
			clan: "Demon Vessel",
			items: [{ name: "Tailsman", quantity: 5 }]
		},
		{
			name: "Divergent Fist",
			description: "A Two Hit Combo!",
			cost: "12000",
			clan: "Demon Vessel",
			items: [{ name: "Tailsman", quantity: 1 }]
		},
		{
			name: "Twin Dragon FIST",
			description: "BAKURETSU KEN!",
			cost: "24000",
			clan: "Demon Vessel",
			items: [{ name: "Tailsman", quantity: 1 }]
		}
	],
	"Limitless": [
		{
			name: "Maximum Technique: Purple",
			description: "Throughout heaven and earth..",
			cost: "2250000",
			clan: "Limitless",
			items: [{ name: "Upgraded Limitless Token", quantity: 1 }]
		},
		{
			name: "Maximum Technique: Blue",
			description: "Blue",
			cost: "1250000",
			clan: "Limitless",
			items: [{ name: "Upgraded Limitless Token", quantity: 1 }]
		},
		{
			name: "Maximum Technique: Red",
			description: "Throughout heaven and earth..",
			cost: "725000",
			clan: "Limitless",
			items: [{ name: "Upgraded Limitless Token", quantity: 1 }]
		},
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
	"Ten Shadows": [
		{
			name: "Ten Shadows Technique: Divergent Sila Divine General Mahoraga",
			description: "With this treasure i summon...",
			cost: "3250000",
			clan: "Fushiguro",
			items: [
				{ name: "Mahoragas Wheel", quantity: 1 },
				{ name: "Mahoraga's Soul", quantity: 1 }
			]
		},
		{
			name: "Ten Shadows Technique: Max Elephant",
			description: "FATTY",
			cost: "1250000",
			clan: "Fushiguro",
			items: [{ name: "Elephant Shikigami's Soul", quantity: 1 }]
		},
		{
			name: "Ten Shadows Technique: Nue",
			description: "bird :3",
			cost: "250000",
			clan: "Fushiguro",
			items: [{ name: "Bird Shikigami's Soul", quantity: 1 }]
		},
		{
			name: "Ten Shadows Technique: Divine Dogs",
			description: "Divine Dogs!",
			cost: "125000",
			clan: "Fushiguro",
			items: [{ name: "Divine Dogs Shikigami's Soul", quantity: 1 }]
		},
		{
			name: "Ten Shadows Technique: Toad",
			description: "blurp",
			cost: "100000",
			clan: "Fushiguro",
			items: [{ name: "Tailsman", quantity: 1 }]
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
			name: "Vengance Blade: Executioners Blade",
			cost: "1235000",
			clan: "Okkotsu",
			items: [
				{ name: "Yuta's Token", quantity: 2 },
				{ name: "Sukuna Finger Bundle", quantity: 1 }
			]
		},
		{
			name: "MAXIMUM: BLACK FLASH",
			cost: "925000",
			clan: "Okkotsu",
			items: [{ name: "Yuta's Token", quantity: 1 }]
		},
		{
			name: "Pure Love: Unleashed Fury",
			cost: "500000",
			clan: "Okkotsu",
			items: [{ name: "Yuta's Token", quantity: 1 }]
		},
		{
			name: "Steel Arm: Freezing Strike",
			cost: "325000",
			clan: "Okkotsu",
			items: [{ name: "Yuta's Token", quantity: 1 }]
		}
	],
	"Star Rage": [
		{
			name: "Star Rage: Virtual Mass",
			cost: "1200000",
			clan: "Star Rage",
			items: [{ name: "Fused Star", quantity: 2 }]
		},
		{
			name: "Star Rage: Terra",
			cost: "450000",
			clan: "Star Rage",
			items: [{ name: "(Shattered) Star Remnant", quantity: 1 }]
		},
		{
			name: "Star Rage: Jupiter",
			cost: "250000",
			clan: "Star Rage",
			items: [{ name: "(Shattered) Star Fragment", quantity: 1 }]
		}
	],
	"Cursed Speech": [
		{
			name: "Cursed Speech: Twist",
			cost: "120000",
			clan: "Cursed Speech",
			items: [{ name: "Cough Medicine", quantity: 3 }]
		},
		{
			name: "Cursed Speech: Explode",
			cost: "90000",
			clan: "Cursed Speech",
			items: [{ name: "Cough Medicine", quantity: 1 }]
		},
		{
			name: "Cursed Speech: Shatter",
			cost: "45000",
			clan: "Cursed Speech",
			items: [{ name: "Cough Medicine", quantity: 1 }]
		}
	],
	"Boogie Woogie": [
		{
			name: "Boogie Woogie: Surplex",
			cost: "528000",
			clan: "Boogie Woogie",
			items: [
				{ name: "Brotherly Bracelet", quantity: 6 },
				{ name: "Takada-Chan Autograph", quantity: 1 }
			]
		},
		{
			name: "Boogie Woogie: Surprise Fist",
			cost: "120000",
			clan: "Boogie Woogie",
			items: [{ name: "Takada-Chan Autograph", quantity: 1 }]
		},
		{
			name: "Boogie Woogie: Swap",
			cost: "45000",
			clan: "Boogie Woogie",
			items: [{ name: "Takada-Chan Autograph", quantity: 1 }]
		}
	],
	"Blood Manipulation": [
		{
			name: "Supernova",
			cost: "528000",
			clan: "Blood Manipulation",
			items: [
				{ name: "Malevolent Shrine (Blood Vial)", quantity: 2 },
				{ name: "Cursed Womb Death Painting", quantity: 1 }
			]
		},
		{
			name: "Blood Edge",
			cost: "120000",
			clan: "Blood Manipulation",
			items: [{ name: "Cursed Womb Death Painting", quantity: 1 }]
		},
		{
			name: "Slicing Exorcism",
			cost: "45000",
			clan: "Blood Manipulation",
			items: [{ name: "Cursed Womb Death Painting", quantity: 1 }]
		}
	],

	"Overtime": [
		{
			name: "Overtime: Collapse",
			cost: "528000",
			clan: "Overtime",
			items: [
				{ name: "(Shattered) Overtime Watch", quantity: 6 },
				{ name: "Mahito's Soul", quantity: 1 }
			]
		},
		{
			name: "Overtime: Ratio",
			cost: "120000",
			clan: "Overtime",
			items: [{ name: "(Shattered) Overtime Watch", quantity: 1 }]
		},
		{
			name: "Overtime: Relentless Sword Strike",
			cost: "45000",
			clan: "Overtime",
			items: [{ name: "(Shattered) Overtime Watch", quantity: 1 }]
		}
	],

	"God of Lightning (Heian Era)": [
		{
			name: "Mythical Beast Amber",
			cost: "5280000",
			clan: "God of Lightning (Heian Era)",
			items: [
				{ name: "Electrified Cursed Shard", quantity: 2 },
				{ name: "Heian Era Scraps", quantity: 6 }
			],
			stage: "Stage One"
		},
		{
			name: "Lightning Discharge",
			cost: "3800000",
			clan: "God of Lightning (Heian Era)",
			items: [{ name: "Heian Era Scraps", quantity: 6 }],
			stage: "Stage One"
		}
	],
	"Curse King (Heian Era)": [
		{
			name: "Divine Flames",
			cost: "5280000",
			clan: "Curse King (Heian Era)",
			items: [
				{ name: "Sukuna Finger", quantity: 20 },
				{ name: "Heian Era Scraps", quantity: 2 }
			],
			stage: "Stage Two"
		},
		{
			name: "Pure Dismantle",
			cost: "2380000",
			clan: "Curse King (Heian Era)",
			items: [{ name: "Heian Era Scraps", quantity: 6 }],
			stage: "Stage Two"
		},
		{
			name: "Fire Extinguisher",
			cost: "450000",
			clan: "Curse King (Heian Era)",
			items: [{ name: "Heian Era Scraps", quantity: 6 }],
			stage: "Stage Two"
		}
	],
	"Demon Vessel (Awoken)": [
		{
			name: "Re-imagined BLACK FLASH",
			cost: "5280000",
			clan: "Demon Vessel (Awoken)",
			items: [
				{ name: "Sukuna Finger", quantity: 2 },
				{ name: "Split Shard", quantity: 3 }
			],
			stage: "Stage Three"
		},
		{
			name: "Piercing Blood",
			cost: "3800000",
			clan: "Demon Vessel (Awoken)",
			items: [{ name: "Split Shard", quantity: 1 }],
			stage: "Stage Three"
		}
	],
	"The Strongest": [
		{
			name: "Lapse Blue X Red: Combo",
			cost: "5280000",
			clan: "Limitless 100%",
			items: [
				{ name: "Six Eyes", quantity: 2 },
				{ name: "Heian Era Scraps", quantity: 3 }
			],
			stage: "Stage Four"
		},
		{
			name: "Close-up Reversal Red",
			cost: "5280000",
			clan: "Limitless 100%",
			items: [
				{ name: "Six Eyes", quantity: 2 },
				{ name: "Heian Era Scraps", quantity: 3 }
			],
			stage: "Stage Four"
		},
		{
			name: "Hollow Purple: Nuke",
			cost: "380000",
			clan: "Limitless 100%",
			items: [{ name: "Heian Era Scraps", quantity: 1 }],
			stage: "Stage Four"
		}
	],
	"Gambler Fever (Jackpot)": [
		{
			name: "Jackpot: Cargo Fever Rush",
			cost: "9280000",
			clan: "Gambler Fever (Jackpot)",
			items: [
				{ name: "Gambler Token", quantity: 18 },
				{ name: "Sukuna Finger", quantity: 12 },
				{ name: "Heian Era Scraps", quantity: 3 }
			],
			stage: "Stage Five"
		},
		{
			name: "Jackpot: Full House Kick",
			cost: "6580000",
			clan: "Gambler Fever (Jackpot)",
			items: [
				{ name: "Hakari Kinji's Token", quantity: 18 },
				{ name: "Heian Era Scraps", quantity: 3 }
			],
			stage: "Stage Five"
		},
		{
			name: "Jackpot: Shutter Doors",
			cost: "3800000",
			clan: "Gambler Fever (Jackpot)",
			items: [{ name: "Hakari Kinji's Token", quantity: 16 }],
			stage: "Stage Five"
		}
	],
	"Utahime Iori": [
		{
			name: "Solo Forbidden Area",
			cost: "9280000",
			clan: "Solo Forbidden Area",
			items: [
				{ name: "Satoru Gojo's Ashy Remains", quantity: 2 },
				{ name: "Sukuna Finger", quantity: 12 }
			],
			stage: "Stage Five"
		}
	]
}

export const benefactors = [
	{ name: "Kento Nanami", coinsMin: 1000, coinsMax: 2000, items: ["(Shattered) Overtime Watch"], weight: 8 },
	{
		name: "Yuji Itadori",
		items: ["Special-Grade Cursed Object", "Sukuna Finger"],
		words: "Have this!",
		itemQuantityMin: 1,
		itemQuantityMax: 2,
		weight: 2
	},
	{
		name: "Bottle Boy",
		items: ["Empty Bottle"],
		words: "i loveeeeeee bottles",
		itemQuantityMin: 1,
		itemQuantityMax: 6,
		weight: 2
	},
	{
		name: "Hakari Kinji",
		coinsMin: 2500,
		coinsMax: 3500,
		items: ["Gambler Token"],
		words: "GAMBLE 🤑🤑🤑🤑🤑🤑",
		itemQuantityMin: 1,
		itemQuantityMax: 2,
		weight: 5
	},
	{
		name: "Curse King",
		coinsMin: 1,
		coinsMax: 1000,
		items: ["Sukuna Finger"],
		words: "You're just a brat!",
		itemQuantityMin: 1,
		itemQuantityMax: 4,
		weight: 3
	},
	{
		name: "Nobara Kugisaki",
		coinsMin: 2500,
		coinsMax: 3500,
		items: ["Nobara's Right Eye", "Nobara's Left Eye"],
		words: "My eyes are up here!",
		itemQuantityMin: 1,
		itemQuantityMax: 1,
		weight: 3
	},
	{
		name: "Megumi Fushiguro",
		coinsMin: 4000,
		coinsMax: 6000,
		items: ["(Broken) Divine General Wheel"],
		words: "With this treasure i summon",
		weight: 10
	}
]

// quests array
export const questsArray = [
	{
		name: "Mentor: Curse King",
		description: "Mentor: Curse King",
		coins: 0,
		experience: 0,
		items: { "Curse King Medal": 1 },
		itemQuantity: 1,
		task: "Defeat Sukuna",
		totalProgress: 1,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Mentor: The Strongest",
		description: "Mentor: The Strongest",
		coins: 0,
		experience: 0,
		items: { "Strongest Medal": 1 },
		itemQuantity: 1,
		task: "Defeat Satoru Gojo",
		totalProgress: 1,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Training with Itadori",
		description: "Train With Itadori!",
		coins: 45000,
		experience: 470,
		items: { "Cursed Energy Reinforcement": 1 },
		itemQuantity: 1,
		task: "Fight Itadori 3 times!",
		totalProgress: 3,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Gamblers Fever",
		description: "Defeat Hakari Kinji 5 times and earn his token.",
		coins: 45000,
		experience: 470,
		item: "Hakari Kinji's Token",
		itemQuantity: 1,
		task: "Defeat Hakari Kinji 5 times!",
		totalProgress: 5,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Nanami's Task",
		description:
			"Nanami has tasked you with a mission. Assist him in his quest to kill curses and earn his respect.",
		coins: 45000,
		experience: 470,
		items: { Overtime: 1 },
		itemQuantity: 1,
		task: "Exorcise 20 Foes!",
		totalProgress: 20,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Awakening",
		description: "???",
		coins: 0,
		experience: 0,
		items: { "Split Shard": 12, "Heian Era Scraps": 12, "Awakening Remnant": 1 },
		itemQuantity: 12,
		tasks: [
			{ description: "Defeat Foes", progress: 0, totalProgress: 6 },
			{ description: "Defeat Yuji Itadori (Awoken)", progress: 0, totalProgress: 1 }
		],
		special: true,
		instanceId: "uniqueInstanceId"
	},

	{
		name: "Disaster Curses",
		description:
			"The land is plagued by Disaster Curses, spreading chaos and destruction. Journey through perilous locations to confront and defeat Jogo, Hanami, and Dagon.",
		coins: 45000,
		experience: 470,
		item: "Combined Disaster Curses Soul",
		itemQuantity: 1,
		tasks: [
			{ description: "Defeat Jogo", progress: 0, totalProgress: 1 },
			{ description: "Defeat Hanami", progress: 0, totalProgress: 1 },
			{ description: "Defeat Dagon", progress: 0, totalProgress: 1 }
		],
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Nature of Curses",
		description: "Defeat Evolved-Mahito",
		coins: 23000,
		experience: 320,
		item: "Mahito's Soul",
		itemQuantity: 2,
		task: "Defeat Reborn Mahito",
		totalProgress: 1,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Curse King",
		description: "Get acknowledged by the Curse King!",
		coins: 23000,
		experience: 320,
		items: { "Sukuna Finger": 3 },
		task: "Get acknowledged by Sukuna!",
		totalProgress: 1,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Curse King's Task",
		description: "Gather the Sukuna Fingers!",
		coins: 100000,
		experience: 850,
		items: { "Sukuna's Honour": 1 },
		task: "Round up all of the Sukuna Fingers!",
		totalProgress: 20,
		special: true,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Satoru Gojo's Mission",
		description:
			"Satoru Gojo, the strongest sorcerer, has a mission for you. Assist him in his quest to kill curses and earn his respect.",
		coins: 100000,
		experience: 850,
		items: { "Satoru Gojo's Respect": 1 },
		tasks: [
			{ description: "Training", progress: 0, totalProgress: 16 },
			{ description: "Defeat Gojo", progress: 0, totalProgress: 1 },
			{ description: "Defeat Sukuna", progress: 0, totalProgress: 1 }
		],
		special: true,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Find Yuta!",
		description: "Yuta Okkotsu remains elusive, Try locate him using a Special-Grade Geo Locator!",
		coins: 34000,
		experience: 250,
		items: { "Yuta's Token": 2, "Fraud Poster": 1 },
		itemQuantity: 2,
		task: "Find this fraud!",
		totalProgress: 1,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Stage Three Unleashed",
		description: "???",
		coins: 0,
		experience: 0,
		items: { "Awakening Release": 1 },
		itemQuantity: 1,
		tasks: [
			{ description: "Satoru Gojo (Shinjuku Showdown Arc)", progress: 0, totalProgress: 3 },
			{ description: "Yuji Itadori (Awoken)", progress: 0, totalProgress: 1 }
		],
		special: true,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "The Honored One",
		description:
			"The sacred six eyes, a technique limitless in power, awaits. Embark on this divine quest to be anointed with the Sacred Eye, marking you as the chosen wielder of the ancient and revered technique.",
		coins: 20000,
		experience: 320,
		item: "Sacred Eye",
		itemQuantity: 2,
		task: "Be blessed with the limitless technique...",
		totalProgress: 1,
		instanceId: "uniqueInstanceId"
	},
	{
		name: "Kashimo's Task",
		description: "Kashimo has tasked you with a mission. Assist him in his quest to kill curses and earn his ways!",
		coins: 20000,
		experience: 320,
		items: { "Kashimo's Token": 1 },
		itemQuantity: 1,
		tasks: [
			{ description: "Defeat Foes", progress: 0, totalProgress: 16 },
			{ description: "Defeat Gojo", progress: 0, totalProgress: 1 },
			{ description: "Defeat Sukuna", progress: 0, totalProgress: 1 },
			{ description: "Defeat Hakari Kinji", progress: 0, totalProgress: 1 }
		],
		totalProgress: 10,
		instanceId: "uniqueInstanceId"
	}
]

export const INVENTORY_CLAN = {
	"Demon Vessel": [
		{
			name: "World Cutting Slash",
			clan: "Demon Vessel"
		},
		{
			name: "Flame Arrow",
			description: "Fuga...",
			clan: "Demon Vessel"
		},
		{
			name: "Dismantle",
			description: "SLICE!",
			clan: "Demon Vessel"
		},
		{
			name: "Cleave",
			description: "Embodiment of true fear and terror",
			clan: "Demon Vessel"
		},
		{
			name: "Black Flash",
			description: "Embodiment of true fear and terror",
			clan: "Demon Vessel"
		},
		{
			name: "Divergent Fist",
			description: "Embodiment of true fear and terror",
			clan: "Demon Vessel"
		},
		{
			name: "Twin Dragon FIST",
			description: "Embodiment of true fear and terror",
			clan: "Demon Vessel"
		}
	],
	"Limitless": [
		{
			name: "Maximum Technique: Purple",
			clan: "Limitless"
		},
		{
			name: "Maximum Technique: Blue",
			clan: "Limitless"
		},
		{
			name: "Maximum Technique: Red",
			clan: "Limitless"
		},

		{
			name: "Hollow Purple",
			clan: "Limitless"
		},
		{
			name: "Lapse: Blue",
			clan: "Limitless"
		},
		{
			name: "Limitless: Red",
			clan: "Limitless"
		}
	],
	"Fushiguro": [
		{
			name: "Ten Shadows Technique: Divergent Sila Divine General Mahoraga",
			description: "With this treasure i summon...",
			clan: "Fushiguro"
		},
		{
			name: "Ten Shadows Technique: Divine Dogs",
			description: "Divine Dogs!",
			clan: "Fushiguro"
		},
		{
			name: "Ten Shadows Technique: Toad",
			description: "Divine Dogs!",
			clan: "Fushiguro"
		},
		{
			name: "Ten Shadows Technique: Nue",
			description: "bird :3",
			clan: "Fushiguro"
		}
	],
	"Zenin": [
		{
			name: "Zenin Style: Playful Cloud: STRIKE",
			description: "Vanish!",
			clan: "Zenin"
		},
		{
			name: "Zenin Style: Cursed Spirit Binding",
			description: "Bind!",
			clan: "Zenin"
		},
		{
			name: "Zenin Style: Overwhelming Strike",
			description: "PERISH!",
			clan: "Zenin"
		}
	],
	"Disaster Flames": [
		{
			name: "Disaster Flames: Full Fire Formation",
			clan: "Disaster Flames"
		},
		{
			name: "Maximum: METEOR!",
			description: "I'LL TURN YOU INTO A CRISP!",
			clan: "Disaster Flames"
		},
		{
			name: "Disaster Flames: Lava Bend",
			description: "Bend to my will!",
			clan: "Disaster Flames"
		},
		{
			name: "Disaster Flames: Fire Manipulation",
			description: "PERISH!",
			clan: "Disaster Flames"
		}
	],
	"Gambler Fever": [
		{
			name: "Jackpot: Strike",
			description: "Let's get lucky...",
			clan: "Gambler Fever"
		},
		{
			name: "Gambler Fever: Random Rush!",
			description: "Perish!",
			clan: "Gambler Fever"
		},
		{
			name: "Gambler Fever: Cargo Rush",
			description: "Take this!",
			clan: "Gambler Fever"
		}
	],
	"Okkotsu": [
		{
			name: "MAXIMUM: BLACK FLASH",
			description: "....",
			clan: "Okkotsu"
		},
		{
			name: "Pure Love: Unleashed Fury",
			description: "Perish!",
			clan: "Okkotsu"
		},
		{
			name: "Steel Arm: Freezing Strike",
			description: "Take this!",
			clan: "Okkotsu"
		}
	]
}

export interface Item1 {
	itemName: string
	description?: string
	effect: (interaction: ChatInputCommandInteraction) => Promise<void>
	imageUrl?: string
	rarity?: "Common" | "Rare" | "Special"
}

export const items1: Item1[] = [
	{
		itemName: "Heavenly Restricted Blood",
		description: "A cursed blood said to unleash hidden potential... or bring ruin.",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			const embedFirst = new EmbedBuilder()
				.setColor("#4b0082")
				.setTitle("A Cursed Choice...")
				.setDescription("Your fingers close around the blood vial")
			await interaction.followUp({ embeds: [embedFirst] })

			await new Promise(resolve => setTimeout(resolve, 2000))

			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000")
				.setTitle("Power or Peril?")
				.setDescription(
					"With a decisive motion, you consume the blood, feeling an overwhelming power surge within..."
				)
			await interaction.editReply({ embeds: [embedSecond] })

			await updateUserHeavenlyRestriction(interaction.user.id)
			await updateUserAchievements(interaction.user.id, "unlockHeavenlyRestriction")

			await new Promise(resolve => setTimeout(resolve, 4000))

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("Power Unleashed")
				.setDescription(
					"As the blood enters your body, You feel your cursed energy depleting.. What have you done?"
				)
				.setImage(embedFirst.data.image?.url)
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error) // Adding catch to handle any potential errors
		}
	},
	{
		itemName: "Sukuna Finger",
		description: "A cursed finger of the legendary demon, Sukuna. Consuming it carries a grave risk...",
		rarity: "Special",
		imageUrl:
			"https://64.media.tumblr.com/0cea3174e65fc444a9d13e75b8b9b23b/0f084cff6a7abfcb-76/s500x750/cc910e95dece3ee58a36d4ff8855336cd9dc357e.gif",
		effect: async interaction => {
			await interaction.deferReply()
			const userId = interaction.user.id

			const embedFirst = new EmbedBuilder()
				.setColor("#4b0082")
				.setTitle("A Cursed Choice...")
				.setDescription(
					"Your fingers close around the Sukuna Finger, its cursed energy pulsing against your skin..."
				)
				.setImage(
					"https://64.media.tumblr.com/0cea3174e65fc444a9d13e75b8b9b23b/0f084cff6a7abfcb-76/s500x750/cc910e95dece3ee58a36d4ff8855336cd9dc357e.gif"
				)
			//
			await interaction.followUp({ embeds: [embedFirst] })

			const userClanData = await getUserInateClan(interaction.user.id)
			await addUserQuestProgress(interaction.user.id, "Curse King's Task", 1)
			await updateUserInateClanExperience(userId, 125, "Demon Vessel")
			await updatePlayerClanTier(userId)
			//
			if (userClanData.clan === "Demon Vessel") {
				const curseKingsTaskQuest = (await getUserQuests(userId)).quests.find(
					quest => quest.id === "Curse King's Task"
				)
				let progressMessage
				let progressFraction

				if (curseKingsTaskQuest) {
					progressFraction = curseKingsTaskQuest.progress / curseKingsTaskQuest.totalProgress

					if (progressFraction < 0.25) {
						progressMessage = "You have barely scratched the surface."
					} else if (progressFraction < 0.5) {
						progressMessage = "Hmph.. You're making some progress. Keep it up."
					} else if (progressFraction < 0.75) {
						progressMessage = "What is this? You're actually trying? Interesting."
					} else if (progressFraction < 1) {
						progressMessage = "Impossible.. How?"
					} else if (progressFraction === 1) {
						progressMessage = "Is this brat from that time?.."
					} else {
						progressMessage = "Hm, something seems off with your progress."
					}

					const dialogueWithProgress = `Hmph, You're still alive huh.. Maybe you're worth something after all. ${
						progressMessage || "No progress to report."
					}`

					let gainsMessage = ""
					const targetProgress = 12
					if (curseKingsTaskQuest.progress === targetProgress) {
						const currentTransformations = (await getUserUnlockedTransformations(interaction.user.id)) || []

						if (!currentTransformations.includes("Curse King")) {
							const updatedTransformations = [...currentTransformations, "Curse King"]
							await updateUserUnlockedTransformations(interaction.user.id, updatedTransformations)

							gainsMessage =
								"Hmph, you're still alive. I'll grant you a small gift. Use it well. [ CURSE KING TRANSFORMATION AQUIRED ]"
						}
					}

					await new Promise(resolve => setTimeout(resolve, 2000))
					//

					//
					const embedClanAndQuest = new EmbedBuilder()
						.setTitle("Curse King's Task")
						.setDescription(dialogueWithProgress)
						.addFields({
							name: "Quest Progress",
							value:
								gainsMessage ||
								`Current progress: ${curseKingsTaskQuest.progress}/${curseKingsTaskQuest.totalProgress}`
						})
						.setImage("https://media1.tenor.com/m/OvmsFkMM2PwAAAAC/ryomen-sukuna-sukuna.gif")
					await interaction.editReply({ embeds: [embedClanAndQuest] })
				} else {
					logger.info("Quest Not Found")
					await addUserQuest(interaction.user.id, "Curse King's Task")
					const embedAlreadyDemonVessel = new EmbedBuilder()
						.setColor("#8b0000")
						.setTitle("Already Cursed..")
						.setDescription(
							"You again? You wish for more power? Hmph. Alright then. Collect all 20 of my fingers, and I'll consider it. "
						)
						.setImage("https://media1.tenor.com/m/GxDg4OD6TkwAAAAC/sukuna-ryomen.gif")
					await interaction.editReply({ embeds: [embedAlreadyDemonVessel] })
				}
			} else {
				//
				const randomNumber = Math.floor(Math.random() * 100) + 1

				await new Promise(resolve => setTimeout(resolve, 2000)) // Delay

				const embedSecond = new EmbedBuilder()
					.setColor("#8b0000")
					.setTitle("Power or Peril?")
					.setDescription("With a decisive motion, you consume the finger.")
					.setImage("https://media1.tenor.com/m/av-cF54e6TAAAAAC/itadori-jujutsu-kaisen.gif")

				await interaction.editReply({ embeds: [embedSecond] })

				await new Promise(resolve => setTimeout(resolve, 4000)) // Delay

				if (randomNumber <= 20) {
					await updateUserInateClan(interaction.user.id, "Demon Vessel")
					await updateUserAchievements(interaction.user.id, "becursedDemonVessel")
					await addUserTechnique(interaction.user.id, "World Cutting Slash")
					await addUserQuestProgress(interaction.user.id, "Curse King", 1)

					const gains =
						"You have gained:\n" +
						"• Inate Clan: Demon Vessel\n" +
						"• Technique: World Cutting Slash\n" +
						"• Quest Progress: Curse King +1\n"
					//
					const embedFinalClanAcquired = new EmbedBuilder()
						.setColor("#4b0082")
						.setTitle("A 1000 Year Curse...")
						.setDescription(
							`Hmm, there might be some use for you yet, human. That flicker of potential... I haven't felt that in centuries. For now you are my vessel.\n\n${gains}`
						)
						.setImage(
							"https://64.media.tumblr.com/68ff493cf57ea889123c25330aa4f150/e506879043dea017-7c/s1280x1920/f5c94f377afcfc48ef33f99019793677938c70fe.gif"
						)

					await interaction.editReply({ embeds: [embedFinalClanAcquired] })
				} else {
					const sukunaNo = new EmbedBuilder()
						.setColor("#006400")
						.setTitle("A Cursed Power... Or Not?")
						.setDescription(
							"You consume the finger. For a moment, you fear the worst... or the best. Instead, a wave of energy courses through you. You gain 125 experience. Perhaps it wasn't so potent after all."
						)
						.setImage(
							"https://cdn.discordapp.com/attachments/1094302755960664255/1225192293812928512/ezgif-7-b8e5336c85.gif?ex=66203c3d&is=660dc73d&hm=e21bd44a60c7187652d02ff44a9d2ec81017ed2446d88468044c3ccfbed99f8e&"
						)
					await interaction.editReply({ embeds: [sukunaNo] })
				}
			}
		}
	},
	{
		itemName: "Six Eyes",
		description: "? ? ?",
		rarity: "Special",
		imageUrl:
			"https://media.discordapp.net/attachments/1094302755960664255/1222646394712494233/Six_Eyes.png?ex=6616f930&is=66048430&hm=1fbf6d80da6ec411ed12995d2c44feeb9f276bc51c9d33121671cc6473600697&=&format=webp&quality=lossless",
		effect: async interaction => {
			await interaction.deferReply()

			const embedFirst = new EmbedBuilder()
				.setColor("#4b0082")
				.setTitle("A Mystical Choice...")
				.setDescription(
					"You stare into the Six Eyes, its cursed energy pulsing against your skin... And the uneasy feeling of infinity."
				)
				.setImage(
					"https://media.discordapp.net/attachments/1094302755960664255/1222646394712494233/Six_Eyes.png?ex=6616f930&is=66048430&hm=1fbf6d80da6ec411ed12995d2c44feeb9f276bc51c9d33121671cc6473600697&=&format=webp&quality=lossless"
				)

			await interaction.followUp({ embeds: [embedFirst] })

			const randomNumber = Math.floor(Math.random() * 100) + 1
			let isLimitless = false

			if (randomNumber <= 40) {
				await addUserTechnique(interaction.user.id, "Imaginary Technique: Purple")
				await updateUserOwnedInateClan(interaction.user.id, "Limitless")
				await addUserQuest(interaction.user.id, "Satoru Gojo's Mission")
				await addUserQuestProgress(interaction.user.id, "The Honored One", 1)
				isLimitless = true
			}

			await new Promise(resolve => setTimeout(resolve, 2000))

			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000")
				.setTitle("Power or Peril?")
				.setDescription(
					"As you stare into the Six Eyes, you feel an overwhelming power surge within... The uneasy feeling of limitless thoughts.."
				)
				.setImage("https://media1.tenor.com/m/LsBSgRXRgZ4AAAAd/jjk-jujutsu.gif")
			await interaction.editReply({ embeds: [embedSecond] })

			await new Promise(resolve => setTimeout(resolve, 4000))

			let embedFinal
			if (isLimitless) {
				const gains =
					"You have gained:\n" +
					"• Inate Clan: Limitless\n" +
					"• Technique: Imaginary Technique: Purple\n" +
					"• New Quest!: Satoru Gojo's Mission +1\n"
				embedFinal = new EmbedBuilder()
					.setColor("#4b0082")
					.setTitle("Re-Awoken Potential")
					.setDescription(
						`Your eyes have been blessed with the limitless technique... The power of infinity courses through you... Satoru Gojo may have a intrest in you..\n\n${gains}`
					)
					.setImage("https://media1.tenor.com/m/k3X53-jym4sAAAAC/gojo-gojo-satoru.gif")
			} else {
				embedFinal = new EmbedBuilder()
					.setColor("#006400")
					.setTitle("A Mystical Power... Or Not?")
					.setDescription(
						"The Six Eyes yield little information, but you gain 125 experience. Perhaps a book would be more helpful.."
					)
					.setImage("https://media1.tenor.com/m/PdBdd7PZg7AAAAAd/jjk-jujutsu-kaisen.gif")
			}
			await interaction.editReply({ embeds: [embedFinal] })
		}
	},
	{
		itemName: "Sacred Eye",
		description: "? ? ?",
		rarity: "Special",
		imageUrl:
			"https://media.discordapp.net/attachments/1094302755960664255/1222646394712494233/Six_Eyes.png?ex=6616f930&is=66048430&hm=1fbf6d80da6ec411ed12995d2c44feeb9f276bc51c9d33121671cc6473600697&=&format=webp&quality=lossless",
		effect: async interaction => {
			await interaction.deferReply()

			const embedFirst = new EmbedBuilder()
				.setColor("#4b0082")
				.setTitle("A Mystical Choice...")
				.setDescription(
					"Following your recent encounter with the Six Eyes, you find yourself drawn to a new power... The Sacred Eye."
				)

			await interaction.followUp({ embeds: [embedFirst] })

			const randomNumber = Math.floor(Math.random() * 100) + 1
			let isLimitless = false

			if (randomNumber <= 30) {
				await updateUserClan(interaction.user.id, "Limitless")
				await addUserTechnique(interaction.user.id, "Hollow Purple: Nuke")
				await addUserTechnique(interaction.user.id, "Prayer Song")
				isLimitless = true
			}

			await new Promise(resolve => setTimeout(resolve, 2000))

			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000")
				.setTitle("Power or Peril?")
				.setDescription(
					"Your commitment to the Sacred Eye is unwavering. You feel an overwhelming power surge within... The uneasy feeling of limitless thoughts.."
				)
				.setImage("https://media1.tenor.com/m/LsBSgRXRgZ4AAAAd/jjk-jujutsu.gif")
			await interaction.editReply({ embeds: [embedSecond] })

			await new Promise(resolve => setTimeout(resolve, 4000))

			let embedFinal
			if (isLimitless) {
				const gains = "You have gained:\n" + "• Technique: Hollow Purple: Nuke\n" + "• Technique: Prayer Song\n"
				embedFinal = new EmbedBuilder()
					.setColor("#4b0082")
					.setTitle("Holy Power")
					.setDescription(`Unleash the destructive potential of your Six Eyes... \n\n${gains}`)
					.setImage("https://media1.tenor.com/m/k3X53-jym4sAAAAC/gojo-gojo-satoru.gif")
			} else {
				embedFinal = new EmbedBuilder()
					.setColor("#006400")
					.setTitle("A Mystical Power... Or Not?")
					.setDescription(
						"The Six Eyes arent ready to be improved, but you gain 125 experience. Perhaps if you were stronger? (Limitless Inate Clan Required)"
					)
					.setImage("https://media1.tenor.com/m/PdBdd7PZg7AAAAAd/jjk-jujutsu-kaisen.gif")
			}
			await interaction.editReply({ embeds: [embedFinal] })
		}
	},
	{
		itemName: "Special-Grade Geo Locator",
		description: "A mystical device used to locate cursed objects and individuals.",
		rarity: "Special",
		imageUrl: "...",
		effect: async interaction => {
			await interaction.deferReply()

			const embedFirst = new EmbedBuilder()
				.setColor("#4b0082")
				.setTitle("SCANNING.")
				.setDescription("Scanning for frauds...")
			await interaction.followUp({ embeds: [embedFirst] })

			setTimeout(async () => {
				const findChance = Math.random()
				const chanceToFindYuta = 0.4

				if (findChance <= chanceToFindYuta) {
					const gains =
						"You have gained:\n" + "• Boss Unlock: Yuta Okkotsu\n" + "• Quest Progress: Find Yuta! +1\n"
					const embedSecond = new EmbedBuilder()
						.setColor("#006400")
						.setTitle("LOCATED YUTA OKKOTSU")
						.setDescription(`He's right there, get him!\n\n${gains}`)
						.setImage("https://i.ytimg.com/vi/1mTM_tWt1eA/maxresdefault.jpg")

					await interaction.editReply({ embeds: [embedSecond] })
					await addUserQuestProgress(interaction.user.id, "Find Yuta!", 1)
					await updateUserUnlockedBosses(interaction.user.id, ["Yuta Okkotsu"])
				} else {
					const embedSecond = new EmbedBuilder()
						.setColor("#8b0000")
						.setTitle("Yuta Not Located")
						.setDescription("Yuta remains elusive...")

					await interaction.editReply({ embeds: [embedSecond] })
				}
			}, 4000)
		}
	},
	{
		itemName: "Hakari Kinji's Token",
		description: "A Token bestowed by Hakari Kinji, the Gambler King.",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			const startTime = new Date()
			const endTime = new Date(startTime.getTime() + 60 * 60000)

			const itemEffect = {
				itemName: "Hakari Kinji's Token",
				effectName: "Gambler Fever",
				effectTime: 25,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString()
			}
			const itemEffectsArray = [itemEffect]
			getGamblersData(interaction.user.id).then(async gamblersData => {
				const limit = gamblersData.limit

				const INCREASE_PERCENT = 10

				try {
					await updateUserItemEffects(interaction.user.id, itemEffectsArray[0])
					await resetBetLimit(interaction.user.id)
					await updateGamblersData(interaction.user.id, 0, 0, 0, limit, INCREASE_PERCENT)
					const embedFinal = new EmbedBuilder()
						.setColor("#006400")
						.setTitle("Gamblers Potential")
						.setDescription(
							"As the coin flips.. YOU HIT BIG GAINS\n+15% Bet Limit INC, + Reset Bet Limit **SOME STUFF MAY BE BROKEN OR NOT ADDED THIS IS VERY WIP**"
						)
					await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
				} catch (error) {
					logger.error("Error applying item effect:", error)
					await interaction.editReply({ content: "Failed to apply the curse effect. Please try again." })
				}
			})
		}
	},

	{
		itemName: "Jogos (Fixed) Balls",
		description: "Jogos (Fixed) Balls",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			await addUserTechnique(interaction.user.id, "Disaster Flames: Full Fire Formation")

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("BALLS!")
				.setDescription(
					"You munch on the balls.. They don't really do much.. but they're shiny! You got a free technique!  [ MORE STUFF TO COME ]\n+Disaster Flames: Full Fire Formation"
				)
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error) // Adding catch to handle any potential errors
		}
	},

	{
		itemName: "Cursed Vote Chest",
		description: "Cursed Vote Chest",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			await addItemToUserInventory(interaction.user.id, "Sukuna Finger", 4)
			await addItemToUserInventory(interaction.user.id, "Rikugan Eye", 2)
			await addItemToUserInventory(interaction.user.id, "Special-Grade Geo Locator", 1)
			await updateBalance(interaction.user.id, 200000)

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("Opening...")
				.setDescription(
					"You open the cursed chest and get! 4x Sukuna Finger, 2x Rikugan Eye, 1x Special-Grade Geo Locator, + 200,000 Coins!"
				)
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "Cursed Chest",
		description: "Cursed Chest",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			const possibleItems = [
				"Sukuna Finger",
				"Rikugan Eye",
				"Special-Grade Geo Locator",
				"Special-Grade Cursed Object",
				"Bet Slip",
				"Fraud Poster",
				"Six Eyes",
				"Yuta's Token",
				"Hakari Kinji's Token"
			]
			function getRandomItem() {
				const randomIndex = Math.floor(Math.random() * possibleItems.length)
				return possibleItems[randomIndex]
			}

			const chestitem = getRandomItem()

			await addItemToUserInventory(interaction.user.id, chestitem, 1)

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("Opening...")
				.setDescription(`You open the cursed chest and get! ${chestitem}`)
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "Soul Bundle",
		description: "Soul Bundle",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			await updateUserUnlockedTransformations(interaction.user.id, ["Body of Distorted Killing"])

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("? ? ?")
				.setDescription("You consume the souls and unlock Body of Distorted Killing!")
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "Starter Bundle",
		description: "Starter Bundle",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			await addItemToUserInventory(interaction.user.id, "Sukuna Finger", 1)
			await addItemToUserInventory(interaction.user.id, "Tailsman", 5)
			await updateBalance(interaction.user.id, 20000)
			await addUserTechnique(interaction.user.id, "Fist of the Cursed")

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("Opening...")
				.setDescription(
					"You open the Starter Bundle and get! 1x Sukuna Finger, 5x Tailsman. + 20,000 Coins! And a free technique! [ Fist of the Cursed ], Have fun!"
				)
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "Special-Grade Anti Effect Spray",
		description: "Special-Grade Anti Effect Spray",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			await removeAllItemEffects(interaction.user.id)

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("Anti Effect Spray")
				.setDescription("You spray yourself and remove all effects!")
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "#1 Fighting Box",
		description: "#1 Fighting Box",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			const today = new Date()
			const formattedDate = today.toLocaleDateString("en-US")

			const newShikigami: UserShikigami = {
				name: "Ghost",
				experience: 0,
				tier: 1,
				tamedAt: new Date(),
				hygiene: 100,
				hunger: 100,
				friendship: 100
			}

			await addItemToUserInventory(interaction.user.id, "Sukuna Finger", 20)
			await addItemToUserInventory(interaction.user.id, "Six Eyes", 12)
			await updateBalance(interaction.user.id, 2500000)
			await updateUserShikigami(interaction.user.id, newShikigami)
			await updateUserUnlockedTitles(interaction.user.id, ["#1 Fighter (LB 1)"])

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle(`#1 Fighter (LB 1 - ${formattedDate})`)
				.setDescription(
					"You opened the box and received: 20x Sukuna Finger, X12 Six Eyes, 2.5M Coins, a Ghost Pet, and the title: #1 Fighter!"
				)
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "Cursed Energy Vial",
		description: "Cursed Energy Vial",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			await updateUserMaxHealth(interaction.user.id, 30)

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("Vial of Cursed Energy")
				.setDescription("You drink the contents and gain a health increase! + 30")
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "Unknown Substance",
		description: "Unknown Substance",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			const userId = interaction.user.id
			const mentor = await getUserMentor(userId)

			if (!mentor) {
				await interaction.reply("You don't have a mentor yet. Please find a mentor before using this item.")
				return
			}

			const userAwakening = await getUserAwakening(userId)
			if (
				userAwakening &&
				(userAwakening === "Stage One" ||
					userAwakening === "Stage Two" ||
					userAwakening === "Stage Three" ||
					userAwakening === "Stage Four" ||
					userAwakening === "Stage Five" ||
					userAwakening === "Stage Six" ||
					userAwakening === "Stage Seven" ||
					userAwakening === "Stage Eight" ||
					userAwakening === "Stage Nine")
			) {
				await interaction.reply("You have already used this item and reached Stage One or higher.")
				return
			}

			await interaction.deferReply()
			await updateUserAwakening(interaction.user.id, "Stage One")

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("? ? ?")
				.setDescription(
					"You drink the contents.. You feel a strange power awaken within you.. your mentor seems to be pleased.."
				)

			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "Blessful Charm",
		description: "Blessful Charm",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			const userId = interaction.user.id

			const startTime = new Date()
			const endTime = new Date(startTime.getTime() + 25 * 60000)

			const itemEffect = {
				itemName: "Blessful Charm",
				effectName: "Blessed",
				effectTime: 25,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString()
			}
			const itemEffectsArray = [itemEffect]

			try {
				await updateUserItemEffects(userId, itemEffectsArray[0])

				const embedFinal = new EmbedBuilder()
					.setColor("#006400")
					.setTitle("Blessful Charm")
					.setDescription(
						"You put the item on and you and feel a warm sensation.. You are now blessed for the next 25 minutes. Awakened bosses are more likely to appear!"
					)
				await interaction.editReply({ embeds: [embedFinal] })
			} catch (error) {
				logger.error("Error applying item effect:", error)
				await interaction.editReply({ content: "Failed to apply the curse effect. Please try again." })
			}
		}
	},
	{
		itemName: "Heian Era Awakening Remnant",
		description: "Heian Era Awakening Remnant",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			const userId = interaction.user.id

			await interaction.deferReply()

			const currentAwakeningStage = await getUserAwakening(userId)
			const nextAwakeningStage = getNextAwakeningStage(currentAwakeningStage || "Stage Zero")

			await updateUserAwakening(interaction.user.id, nextAwakeningStage)

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("? ? ?")
				.setDescription(
					"You crack the shard and feel a strange power awaken within you... Your awakening has progressed to the next stage!"
				)

			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},

	{
		itemName: "Special-Grade Cursed Object" || "Special Grade Cursed Object",
		description: "Special-Grade Cursed Object",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			const userId = interaction.user.id

			const startTime = new Date()
			const endTime = new Date(startTime.getTime() + 25 * 60000)

			const itemEffect = {
				itemName: "Special-Grade Cursed Object",
				effectName: "Cursed",
				effectTime: 25,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString()
			}
			const itemEffectsArray = [itemEffect]

			try {
				await updateUserItemEffects(userId, itemEffectsArray[0])

				const embedFinal = new EmbedBuilder()
					.setColor("#006400")
					.setTitle("Cursed Object")
					.setDescription(
						"You are now cursed for the next 25 minutes.\n**More prominent to get cursed bosses, Sukuna Dagon Jogo ETC**"
					)
				await interaction.editReply({ embeds: [embedFinal] })
			} catch (error) {
				logger.error("Error applying item effect:", error)
				await interaction.editReply({ content: "Failed to apply the curse effect. Please try again." })
			}
		}
	},
	{
		itemName: "Curse Repellent",
		description: "Curse Repellent",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			const userId = interaction.user.id

			const startTime = new Date()
			const endTime = new Date(startTime.getTime() + 25 * 60000)

			const itemEffect = {
				itemName: "Curse Repellent",
				effectName: "Curse Repellent",
				effectTime: 25,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString()
			}
			const itemEffectsArray = [itemEffect]

			try {
				await updateUserItemEffects(userId, itemEffectsArray[0])

				const embedFinal = new EmbedBuilder()
					.setColor("#006400")
					.setTitle("Curse Repellent")
					.setDescription(
						" You are now safe from curses for the next 25 minutes. (Less likely to find cursed bosses!)"
					)
				await interaction.editReply({ embeds: [embedFinal] })
			} catch (error) {
				logger.error("Error applying item effect:", error)
				await interaction.editReply({ content: "Failed to apply the curse effect. Please try again." })
			}
		}
	},
	{
		itemName: "Cleaning Sponge",
		description: "Cleaning Sponge",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()
			const userId = interaction.user.id
			const itemToClean = interaction.options.getString("item_to_clean")

			if (!itemToClean) {
				await interaction.editReply({ content: "Please specify the item to clean." })
				return
			}

			try {
				const userInventory = await getUserInventory(userId)
				const itemIndex = userInventory.findIndex(item => item.name === itemToClean)

				if (itemIndex === -1) {
					await interaction.editReply({
						content: `You don't have the item "${itemToClean}" in your inventory.`
					})
					return
				}

				const itemToCleaned = userInventory[itemIndex]

				const cleaningSuccess = Math.random() < 0.8

				if (cleaningSuccess) {
					await removeItemFromUserInventory(userId, itemToCleaned.name, 1)

					const cleanedItemName = dirtyToCleanItemMap[itemToCleaned.name] || itemToCleaned.name
					await addItemToUserInventory(userId, cleanedItemName, 1)
					await addItemToUserInventory(userId, "Dirty Sponge", 1)

					const embedFinal = new EmbedBuilder()
						.setColor("#006400")
						.setTitle("Cleaning Sponge")
						.setDescription(
							`Successfully cleaned "${itemToCleaned.name}"! You now have a "${cleanedItemName}" in your inventory.`
						)

					await interaction.editReply({ embeds: [embedFinal] })
				} else {
					await removeItemFromUserInventory(userId, itemToCleaned.name, 1)

					const embedFinal = new EmbedBuilder()
						.setColor("#FF0000")
						.setTitle("Cleaning Sponge")
						.setDescription(
							`You begin to clean "${itemToCleaned.name}" But it fades into dust?.. The item has disappeared.`
						)

					await interaction.editReply({ embeds: [embedFinal] })
				}
			} catch (error) {
				logger.error("Error applying item effect:", error)
				await interaction.editReply({ content: "Failed to use the cleaning sponge. Please try again." })
			}
		}
	},

	{
		itemName: "Combined Disaster Curses Soul",
		description: "Combined Disaster Curses Soul",
		rarity: "Special",
		imageUrl:
			"https://media.discordapp.net/attachments/1094302755960664255/1222646394712494233/Six_Eyes.png?ex=6616f930&is=66048430&hm=1fbf6d80da6ec411ed12995d2c44feeb9f276bc51c9d33121671cc6473600697&=&format=webp&quality=lossless",
		effect: async interaction => {
			await interaction.deferReply()

			const embedFirst = new EmbedBuilder()
				.setColor("#4b0082")
				.setTitle("???")
				.setDescription(
					"Following your recent encounter with the disaster curses, you find yourself with a new item... The Combined Disaster Curses Soul."
				)

			await interaction.followUp({ embeds: [embedFirst] })

			await new Promise(resolve => setTimeout(resolve, 2000))

			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000")
				.setTitle("Power or Peril?")
				.setDescription("You consume the soul and are transported to a new realm.")

			await addUserTechnique(interaction.user.id, "Disaster Curses: Full Flux")
			await updateUserUnlockedBosses(interaction.user.id, ["Disaster Curses"])
			await updateUserExperience(interaction.user.id, 925)

			await interaction.editReply({ embeds: [embedSecond] })

			await new Promise(resolve => setTimeout(resolve, 4000))

			const embedFinal = new EmbedBuilder()
				.setColor("#4b0082")
				.setTitle("A Silent Farewell")
				.setDescription(
					"In the quiet of a solemn realm, you stand before Hanami, Dagon, Jogo. Their gaze holds a silent conversation of respect. '**Stand proud... You are strong**,' you acknowledge their strength, and a subtle smile crosses their visage."
				)
				.setImage(
					"https://cdn.discordapp.com/attachments/831182053156061214/1226390493823242301/ezgif-3-e503b36f27.gif?ex=66249826&is=66122326&hm=cd952f67984a961b96868c4e8033eb4c4c4f66c4fdd444f0d3c3e7a475c12f1f&"
				)

			await interaction.editReply({ embeds: [embedFinal] })

			await new Promise(resolve => setTimeout(resolve, 4000))

			embedFinal.addFields({
				name: "Gift of the Curses",
				value: "Power surges within you as 'Disaster Curses: Full Flux' awakens. The legacy of the fallen fuels your ascent. Gain 925 experience, There spirits now roam free you may encounter them again..."
			})

			await interaction.editReply({ embeds: [embedFinal] })
		}
	},
	{
		itemName: "Prison Realm 100%",
		description: "Prison Realm 100%",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			const newShikigami: UserShikigami = {
				name: "Prison Realm Spirit",
				experience: 0,
				tier: 1,
				tamedAt: new Date(),
				hygiene: 100,
				hunger: 100,
				friendship: 100
			}
			await updateUserShikigami(interaction.user.id, newShikigami)
			await updateUserUnlockedTitles(interaction.user.id, ["Satoru Gojo's Sealing Master"])
			await updateUserUnlockedTitles(interaction.user.id, ["#1 Event Winner"])
			await addUserTechnique(interaction.user.id, "Cursed Spirit Manipulation: Prison Realm")
			await addUserTechnique(interaction.user.id, "Cursed Spirit Manipulation: Forged Bonds")
			await addUserTechnique(interaction.user.id, "Cursed Spirit Manipulation: Release")

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("Opening...")
				.setDescription(
					"Gate: Open.. You opened the box and received: [TITLE] Satoru Gojo's Sealing Master, [TITLE] #1 Event Winner,  [TECHNIQUE] Cursed Spirit Manipulation: Prison Realm, Cursed Spirit Manipulation: Forged Bonds, Cursed Spirit Manipulation: Release, [SHIKIGAMI] Prison Realm Spirit"
				)
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "Prison Realm 75%",
		description: "Prison Realm 75%",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			const newShikigami: UserShikigami = {
				name: "Prison Realm Spirit",
				experience: 0,
				tier: 1,
				tamedAt: new Date(),
				hygiene: 100,
				hunger: 100,
				friendship: 100
			}
			await updateUserShikigami(interaction.user.id, newShikigami)

			await updateUserUnlockedTitles(interaction.user.id, ["Satoru Gojo's Sealing Master"])
			await addUserTechnique(interaction.user.id, "Cursed Spirit Manipulation: Forged Bonds")

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("Opening...")
				.setDescription(
					"Gate: Open.. You opened the box and received: Satoru Gojo's Sealing Master, Cursed Spirit Manipulation: Forged Bonds"
				)
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	},
	{
		itemName: "Prison Realm 50%",
		description: "Prison Realm 50%",
		rarity: "Special",
		imageUrl: "https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg",
		effect: async interaction => {
			await interaction.deferReply()

			await updateUserUnlockedTitles(interaction.user.id, ["Satoru Gojo's Sealing Master"])

			const newShikigami: UserShikigami = {
				name: "Prison Realm Spirit",
				experience: 0,
				tier: 1,
				tamedAt: new Date(),
				hygiene: 100,
				hunger: 100,
				friendship: 100
			}
			await updateUserShikigami(interaction.user.id, newShikigami)

			const embedFinal = new EmbedBuilder()
				.setColor("#006400")
				.setTitle("Opening...")
				.setDescription(
					"Gate: Open.. You opened the box and received: Satoru Gojo's Sealing Master, Prison Realm Spirit"
				)
			await interaction.editReply({ embeds: [embedFinal] }).catch(logger.error)
		}
	}
]

// handle daily shop resets every 24 hours with a different cycle
export const shopItems = [
	{ name: "Tailsman", rarity: "Grade 4", price: 3200 },
	{ name: "Empty Bottle", rarity: "Grade 4", price: 50000 },
	{ name: "(Broken) Electrical Staff", rarity: "Grade 4", price: 10000 },
	{ name: "(Broken) Split Soul Katana", rarity: "Grade 4", price: 12000 },
	{ name: "(Broken) Divine General Wheel", rarity: "Grade 4", price: 15000 },
	{ name: "(Broken) Playful Cloud", rarity: "Grade 2", price: 24000 },
	{ name: "(Broken) Divine General Wheel", rarity: "Grade 1", price: 56000 },
	{ name: "Prison Realm Fragment", rarity: "Grade 1", price: 95000 },
	{ name: "(Shattered) Domain Remnants", rarity: "Grade 1", price: 125000 },
	{ name: "Clean Sponge", rarity: "Grade 1", price: 100000 },
	{ name: "Special-Grade Medicine", rarity: "Grade 1", price: 75000 },
	{ name: "Dragon Scales", rarity: "Grade 1", price: 250000 },
	//
	{ name: "Gamblers Token", rarity: "Special Grade", price: 250000, maxPurchases: 5 },
	{ name: "Sukuna Finger Bundle", rarity: "Special Grade", price: 850000, maxPurchases: 2 },
	{ name: "Curse Repellent", rarity: "Special Grade", price: 200000, maxPurchases: 8 },
	{ name: "Sukuna Finger", rarity: "Special Grade", price: 350000, maxPurchases: 8 },
	{ name: "Rikugan Eye", rarity: "Special Grade", price: 750000, maxPurchases: 6 },
	{ name: "Cursed Chest", rarity: "Special Grade", price: 2500000, maxPurchases: 1 }
]
export interface MiniGameResult {
	success: "full" | "partial" | "fail"
	message: string
}

export async function playStudentMinigame(
	interaction: ChatInputCommandInteraction,
	earnings: number
): Promise<MiniGameResult> {
	const subjects = ["Math", "Science", "History", "Literature", "Art", "Music"]
	const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]

	const button1Options = ["Study", "Focus", "Prepare", "Review", "Concentrate", "Practice"]
	const button2Options = ["Skim", "Glance", "Browse", "Scan", "Peek", "Glimpse"]
	const button3Options = ["Ignore", "Disregard", "Neglect", "Overlook", "Dismiss", "Avoid"]

	const randomButton1 = button1Options[Math.floor(Math.random() * button1Options.length)]
	const randomButton2 = button2Options[Math.floor(Math.random() * button2Options.length)]
	const randomButton3 = button3Options[Math.floor(Math.random() * button3Options.length)]

	const studyOptions = [
		"Pull an all-nighter",
		"Form a study group",
		"Beg Sukuna to help you study",
		"Create flashcards",
		"Watch online tutorials",
		"Seek help from a tutor",
		"Review past exams"
	]
	const randomStudyOption = studyOptions[Math.floor(Math.random() * studyOptions.length)]

	const skimOptions = [
		"Read chapter summaries",
		"Skim through key topics",
		"Memorize important formulas",
		"Focus on bold text and headlines",
		"Rely on your photographic memory",
		"Hope for the best"
	]
	const randomSkimOption = skimOptions[Math.floor(Math.random() * skimOptions.length)]

	const ignoreOptions = [
		"Daydream about your future",
		"Doodle in your notebook",
		"Plan your weekend",
		"Catch up on sleep",
		"Chat with your classmates",
		"Pretend to be invisible",
		"Stare out the window",
		"Count the ceiling tiles",
		"Try to domain"
	]
	const randomIgnoreOption = ignoreOptions[Math.floor(Math.random() * ignoreOptions.length)]

	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle("Student Mini-Game")
		.setDescription(`You have a surprise quiz on ${randomSubject}! Choose your action:`)
		.addFields(
			{ name: "1️⃣", value: randomStudyOption },
			{ name: "2️⃣", value: randomSkimOption },
			{ name: "3️⃣", value: randomIgnoreOption }
		)

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId("1").setLabel(randomButton1).setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("2").setLabel(randomButton2).setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("3").setLabel(randomButton3).setStyle(ButtonStyle.Primary)
	)

	const message = await interaction.reply({ embeds: [embed], components: [actionRow], fetchReply: true })

	const collector = message.createMessageComponentCollector({ time: 15000 })

	return new Promise(resolve => {
		collector.on("collect", async i => {
			if (i.customId === "1") {
				embed.setDescription(
					`You ${randomStudyOption.toLowerCase()} for the ${randomSubject} quiz. Your hard work paid off, and you aced it!`
				)
				embed.setFields({
					name: "Result",
					value: `Your dedication to studying ${randomSubject} resulted in a perfect score! You got **${earnings}** coins!`
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({
					success: "full",
					message: ""
				})
				collector.stop()
			} else if (i.customId === "2") {
				embed.setDescription(
					`You ${randomSkimOption.toLowerCase()} for the ${randomSubject} quiz. You managed to pass, but it was a close call.`
				)
				embed.setFields({
					name: "Result",
					value: `Your quick skimming skills saved you from failing, but there's room for improvement. You got a partial reward of **${earnings}** coins.`
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({
					success: "partial",
					message: ""
				})
				collector.stop()
			} else if (i.customId === "3") {
				embed.setDescription(
					`You chose to ${randomIgnoreOption.toLowerCase()} during the ${randomSubject} quiz.`
				)
				embed.setFields({ name: "Result", value: "You failed the quiz and didn't gain any reward." })
				await i.update({ embeds: [embed], components: [] })

				const sukunaTakeover = Math.random() < 0.1 // 10% chance of Sukuna taking over
				if (sukunaTakeover) {
					resolve({
						success: "fail",
						message:
							"Sukuna has taken over! He goes on a rampage, causing destruction and chaos. You gain no reward and have to face the consequences of Sukuna's actions."
					})
				} else {
					resolve({
						success: "fail",
						message: ""
					})
				}
				collector.stop()
			}
		})

		collector.on("end", async (collected, reason) => {
			if (reason === "time") {
				embed.setDescription("You took too long to respond. The quiz ended, and you got a zero.")
				embed.setFields({ name: "Result", value: "You missed the quiz and didn't gain any reward." })
				await interaction.editReply({ embeds: [embed], components: [] })
				resolve({ success: "fail", message: "" })
			}
		})
	})
}

export async function playJujutsuSorcererMinigame(
	interaction: ChatInputCommandInteraction,
	earnings: number
): Promise<MiniGameResult> {
	const curses = ["Cursed Spirit", "Special Grade Curse", "Cursed Puppet", "Cursed Object", "Curse User"]
	const randomCurse = curses[Math.floor(Math.random() * curses.length)]

	const techniques = [
		"Cursed Energy Manipulation",
		"Domain Expansion",
		"Barrier Technique",
		"Cursed Tool Wielding",
		"Reversal Technique"
	]
	const randomTechnique = techniques[Math.floor(Math.random() * techniques.length)]

	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle("Jujutsu Sorcerer Mini-Game")
		.setDescription(`You encounter a ${randomCurse}! Choose your jujutsu technique to battle it:`)
		.addFields(
			{ name: "1️⃣", value: randomTechnique },
			{ name: "2️⃣", value: "Physical Combat" },
			{ name: "3️⃣", value: "Flee the Battle" }
		)

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId("1").setLabel("Technique").setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("2").setLabel("Combat").setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("3").setLabel("Flee").setStyle(ButtonStyle.Primary)
	)

	const message = await interaction.reply({ embeds: [embed], components: [actionRow], fetchReply: true })

	const collector = message.createMessageComponentCollector({ time: 15000 })

	return new Promise(resolve => {
		collector.on("collect", async i => {
			if (i.customId === "1") {
				embed.setDescription(
					`You used ${randomTechnique} against the ${randomCurse}. Your technique was effective, and you defeated the curse!`
				)
				embed.setFields({
					name: "Result",
					value: `You successfully exorcised the ${randomCurse} using your jujutsu technique. You earned ${earnings} coins.`
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({ success: "full", message: "" })
				collector.stop()
			} else if (i.customId === "2") {
				embed.setDescription(
					`You engaged in physical combat with the ${randomCurse}. It was a tough battle, but you managed to defeat the curse.`
				)
				embed.setFields({
					name: "Result",
					value: `Through your combat skills, you successfully defeated the ${randomCurse}. You earned ${Math.floor(
						earnings * 0.8
					)} coins.`
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({ success: "partial", message: "" })
				collector.stop()
			} else if (i.customId === "3") {
				embed.setDescription(
					`You chose to flee from the battle against the ${randomCurse}. The curse remains undefeated.`
				)
				embed.setFields({
					name: "Result",
					value: "You avoided the battle, but the curse continues to roam free. You didn't earn any coins."
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({ success: "fail", message: "" })
				collector.stop()
			}
		})

		collector.on("end", async (collected, reason) => {
			if (reason === "time") {
				embed.setDescription(
					"You took too long to respond. The curse escaped, and you missed your chance to exorcise it."
				)
				embed.setFields({ name: "Result", value: "You didn't earn any coins due to your indecision." })
				await interaction.editReply({ embeds: [embed], components: [] })
				resolve({ success: "fail", message: "" })
			}
		})
	})
}

export async function playCurseHunterMinigame(
	interaction: ChatInputCommandInteraction,
	earnings: number
): Promise<MiniGameResult> {
	const curses = ["Curse Spirit", "Cursed Artifact", "Cursed Location", "Curse Talisman", "Cursed Corpse"]
	const randomCurse = curses[Math.floor(Math.random() * curses.length)]

	const actions = ["Investigate", "Set a Trap", "Call for Backup", "Engage in Combat", "Purify the Curse"]
	const randomAction = actions[Math.floor(Math.random() * actions.length)]

	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle("Curse Hunter Mini-Game")
		.setDescription(`You are tasked with hunting down a ${randomCurse}. Choose your action:`)
		.addFields(
			{ name: "1️⃣", value: randomAction },
			{ name: "2️⃣", value: "Gather More Information" },
			{ name: "3️⃣", value: "Abandon the Hunt" }
		)

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId("1").setLabel("Action").setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("2").setLabel("Gather Info").setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("3").setLabel("Abandon").setStyle(ButtonStyle.Primary)
	)

	const message = await interaction.reply({ embeds: [embed], components: [actionRow], fetchReply: true })

	const collector = message.createMessageComponentCollector({ time: 15000 })

	return new Promise(resolve => {
		collector.on("collect", async i => {
			if (i.customId === "1") {
				embed.setDescription(
					`You chose to ${randomAction.toLowerCase()} the ${randomCurse}. Your action was successful, and you eliminated the curse!`
				)
				embed.setFields({
					name: "Result",
					value: `Your decision to ${randomAction.toLowerCase()} proved to be effective. You earned ${earnings} coins for your efforts.`
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({ success: "full", message: "" })
				collector.stop()
			} else if (i.customId === "2") {
				embed.setDescription(
					`You decided to gather more information about the ${randomCurse} before taking action. The intel you gathered will aid you in future hunts.`
				)
				embed.setFields({
					name: "Result",
					value: `While you didn't directly eliminate the curse, your information gathering will prove useful. You earned ${Math.floor(
						earnings * 0.6
					)} coins.`
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({ success: "partial", message: "" })
				collector.stop()
			} else if (i.customId === "3") {
				embed.setDescription(
					`You chose to abandon the hunt for the ${randomCurse}. The curse remains at large, posing a threat to others.`
				)
				embed.setFields({
					name: "Result",
					value: "Your decision to abandon the hunt means the curse continues to roam freely. You didn't earn any coins."
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({ success: "fail", message: "" })
				collector.stop()
			}
		})

		collector.on("end", async (collected, reason) => {
			if (reason === "time") {
				embed.setDescription(
					"You took too long to decide on your action. The curse has moved on, and the hunt is lost."
				)
				embed.setFields({
					name: "Result",
					value: "Your indecision cost you the hunt. You didn't earn any coins."
				})
				await interaction.editReply({ embeds: [embed], components: [] })
				resolve({ success: "fail", message: "" })
			}
		})
	})
}

export async function playVeilCasterMinigame(
	interaction: ChatInputCommandInteraction,
	earnings: number
): Promise<MiniGameResult> {
	const veils = ["Concealment Veil", "Barrier Veil", "Illusion Veil", "Sealing Veil", "Protective Veil"]
	const randomVeil = veils[Math.floor(Math.random() * veils.length)]

	const targets = ["Cursed Spirit", "Cursed Energy", "Jujutsu Sorcerer", "Innocent Bystander", "Cursed Object"]
	const randomTarget = targets[Math.floor(Math.random() * targets.length)]

	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle("Veil Caster Mini-Game")
		.setDescription(`You need to cast a ${randomVeil} on a ${randomTarget}. Choose your casting method:`)
		.addFields(
			{ name: "1️⃣", value: "Precise Casting" },
			{ name: "2️⃣", value: "Quick Casting" },
			{ name: "3️⃣", value: "Delayed Casting" }
		)

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId("1").setLabel("Precise").setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("2").setLabel("Quick").setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("3").setLabel("Delayed").setStyle(ButtonStyle.Primary)
	)

	const message = await interaction.reply({ embeds: [embed], components: [actionRow], fetchReply: true })

	const collector = message.createMessageComponentCollector({ time: 15000 })

	return new Promise(resolve => {
		collector.on("collect", async i => {
			if (i.customId === "1") {
				embed.setDescription(
					`You chose to cast the ${randomVeil} on the ${randomTarget} using precise casting. Your veil was successfully cast, achieving the desired effect.`
				)
				embed.setFields({
					name: "Result",
					value: `Your precise casting technique ensured the ${randomVeil} was applied correctly. You earned ${earnings} coins.`
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({ success: "full", message: "" })
				collector.stop()
			} else if (i.customId === "2") {
				embed.setDescription(
					`You opted for quick casting to apply the ${randomVeil} on the ${randomTarget}. While the veil was cast, its effectiveness was slightly diminished.`
				)
				embed.setFields({
					name: "Result",
					value: `Your quick casting allowed you to apply the veil, but its potency was reduced. You earned ${Math.floor(
						earnings * 0.7
					)} coins.`
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({ success: "partial", message: "" })
				collector.stop()
			} else if (i.customId === "3") {
				embed.setDescription(
					`You decided to delay the casting of the ${randomVeil} on the ${randomTarget}. The delay caused the veil to dissipate before it could take effect.`
				)
				embed.setFields({
					name: "Result",
					value: "Your delayed casting resulted in the veil failing to apply. You didn't earn any coins."
				})
				await i.update({ embeds: [embed], components: [] })
				resolve({ success: "fail", message: "" })
				collector.stop()
			}
		})

		collector.on("end", async (collected, reason) => {
			if (reason === "time") {
				embed.setDescription(
					"You took too long to choose your casting method. The opportunity to cast the veil has passed."
				)
				embed.setFields({
					name: "Result",
					value: "Your indecision caused you to miss the chance to cast the veil. You didn't earn any coins."
				})
				await interaction.editReply({ embeds: [embed], components: [] })
				resolve({ success: "fail", message: "" })
			}
		})
	})
}
