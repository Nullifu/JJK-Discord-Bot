export interface Item {
	id: number
	name: string
	description: string
	price: number
}

export interface UserProfile {
	balance: number
	experience: number
	grade: string
	domain?: string | null
	job: string
	activeTitle: string
	heavenlyrestriction: string | null
	clan: string
}

export const gradeMappings = {
	"special grade": 0, // Highest
	"grade 1": 1,
	"semi-grade 1": 1,
	"grade 2": 2,
	"grade 3": 3,
	"grade 4": 4 // Lowest
	// Add other grades if necessary
}

export interface BossData {
	id?: string // Making `id` optional if it's not always available
	name: string
	max_health: number
	current_health: number // Note the underscore and lowercase
	image_url: string // Note the underscore and lowercase
}

export interface Item {
	id: number
	name: string
	description: string
	price: number
}

export interface InventoryItem {
	name: string
	quantity: number
}

export interface User {
	id: string // Assuming 'id' is the field you use to identify users.
	inventory: InventoryItem[]
	balance: number
	experience: number
	grade: string
	domain?: string | null
	job: string
	activeTitle: string
	lastAlertedVersion: string
	heavenlyrestriction: string
	clan?: string | null
}

export interface Item {
	id: number
	name: string
	description: string
	price: number
}

export const formatDomainExpansion = domain => {
	if (domain && typeof domain === "object" && domain.name) {
		return `Name: ${domain.name}`
	}
	return "Not unlocked 🔒"
}

export interface Achievement {
	name: string
	description: string
	reward: string
}

export function determineDomainAchievements(domainName) {
	// Example - hardcoded for simplicity, you'll need your real logic here
	switch (domainName) {
		case "Idle Deaths Gamble":
			return ["unlockIdleDeathsGamble"]
		case "Unlimited Void":
			return ["unlockUnlimitedVoid"]
		case "Malevolent Shrine":
			return ["unlockMalevolentShrine"]
		default:
			return []
	}
}
