import { EmbedBuilder } from "discord.js"
import { ObjectId } from "mongodb"
import { questsArray } from "./items jobs.js"
import { getUserQuests } from "./mongodb.js"

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
export interface TradeRequest {
	_id: ObjectId // Include this line to define the _id property
	initiatorName: string
	initiatorId: string
	targetUserId: string
	item: string
	quantity: number
	status: string
	createdAt: Date
}

export const healthMultipliersByGrade = {
	"special grade": 2.5, // Boss health is doubled for the highest grade
	"grade 1": 2.0,
	"semi-grade 1": 1.7,
	"grade 2": 1.6,
	"grade 3": 1.3,
	"grade 4": 1.0 // No change for the lowest grade
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

interface Quest {
	name: string
	id: string
	// ... other properties of the quest
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
	quests: Quest[]
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

export async function buildQuestEmbed(userId, interaction) {
	const userActiveQuests = await getUserQuests(userId)

	const questData = userActiveQuests.quests
		.map(activeQuest => {
			const questDetails = questsArray.find(quest => quest.name === activeQuest.id)
			if (questDetails) {
				const progressText =
					`**${questDetails.name}**: ${activeQuest.progress}/${questDetails.totalProgress}\n` +
					`• **Description**: ${questDetails.description}\n` +
					`• **Coins**: ${questDetails.coins}\n` +
					`• **Experience**: ${questDetails.experience}\n` +
					`• **Item**: ${questDetails.item} x${questDetails.itemQuantity}`
				const progressBar = createProgressBar(activeQuest.progress, questDetails.totalProgress)
				return `${progressText}\nProgress: ${progressBar}`
			} else {
				return `**Quest**: ${activeQuest.id} - Details not found.`
			}
		})
		.join("\n\n")

	const embed = new EmbedBuilder()
		.setTitle(`${interaction.user.username}'s Active Quests`)
		.setColor("#4B0082")
		.setDescription(questData.length > 0 ? questData : "You have no active quests.")

	return embed
}

function createProgressBar(current, total) {
	const barLength = 10
	const progressLength = Math.round((current / total) * barLength)
	const emptyLength = barLength - progressLength
	const progressChars = "█".repeat(progressLength)
	const emptyChars = "░".repeat(emptyLength)
	return progressChars + emptyChars
}
