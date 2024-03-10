export interface UserSlapCount {
	userId: string
	count: number
}

export interface BossData {
	id: number
	name: string
	max_health: number
	current_health: number
	image_url: string
	difficulty_tier: number
	drops: {
		itemName: string
		dropChance: number // percentage
	}[]
}

export interface QuestData {
	id: number
	name: string
	description: string
	curse_name: string
	grade_xp_reward: number
	difficulty?: string // If difficulty is optional
}

export interface CurseData {
	id: number
	name: string
	health: number
	strength: number
	// ... add other properties as needed
}

export interface Item {
	id: number
	name: string
	description: string
	price: number
}

// Define information about the items
export const domain1Details = {
	six_eyes: {
		title: "Idle Deaths Gamble",
		description: "In the 4 minutes and 11 seconds..",
		footer: "Let's gamble!",
		imagePath: "./image/sixeyes.png"
	},
	prison_realm: {
		title: "Unlimited Void ",
		description: " Considered the strongest Domain Expansion,",
		footer: "You've already lost",
		imagePath: "./image/prisonrealm.png"
	},
	sukuna_finger: {
		title: "Chimera Shadow Garden",
		description: "Amplifies the ten shadows technique.",
		footer: "You cannot stop my technique now",
		imagePath: "./image/sukunafinger.png"
	},
	distorted_soul: {
		title: "Malevolent Shrine",
		description: "The Malevolent Shrine is an embodiment of the users overwhealming power",
		footer: "I'll show you real jujutsu",
		imagePath: "./image/soul.png"
	}
}
