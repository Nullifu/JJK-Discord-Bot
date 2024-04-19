import { EmbedBuilder } from "discord.js"
import { ObjectId } from "mongodb"
import { questsArray } from "./items jobs.js"
import { Purchase, getGamblersData, getUserQuests } from "./mongodb.js"

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
	inateclan: string
}

export const gradeMappings = {
	"special grade": 0,
	"grade 1": 1,
	"semi-grade 1": 1,
	"grade 2": 2,
	"grade 3": 3,
	"grade 4": 4
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

export interface BossData {
	id?: string // Making `id` optional if it's not always available
	name: string
	max_health: number
	current_health: number // Note the underscore and lowercase
	image_url: string // Note the underscore and lowercase
	grade: string
	curse: boolean
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
}
export const dirtyToCleanItemMap = {
	"(Dirty) Sukuna Finger": "Sukuna Finger",
	"Tarnished Sword": "Shiny Sword",
	"Soiled Cape": "Clean Cape"
}

/**
 * Creates a bar using Unicode characters based on the provided value and maximum value.
 * @param value The value to represent as a bar.
 * @param maxValue The maximum value for the bar.
 * @returns A string representing a bar using Unicode characters.
 */
export function createBar(value: number, maxValue: number): string {
	const bars = "▓▓▓▓▓▓▓▓▓▓"
	const percentage = Math.floor((value / maxValue) * 10)
	return bars.slice(0, percentage) + "░".repeat(10 - percentage)
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
	unlockedTransformations: string[]
	statusEffects: string[]
	itemEffects: []
	purchases: Purchase[]
	gamblersData: {
		limit: 5000000 // Default limit of 5 million
		amountGambled: number
		amountWon: number
		amountLost: number
	}
}

export interface ItemEffect {
	itemName: string
	effectTime: number
	startTime: string
	endTime: string
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
				const itemRewardText = questDetails.item
					? `• **Item**: ${questDetails.item} x${questDetails.itemQuantity}`
					: ""
				const progressText =
					`**${questDetails.name}**: ${activeQuest.progress}/${questDetails.totalProgress}\n` +
					`• **Description**: ${questDetails.description}\n` +
					`• **Coins**: ${questDetails.coins}\n` +
					`• **Experience**: ${questDetails.experience}\n` +
					itemRewardText
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

// export async build gamblers profile
export async function buildGamblersProfile(userId, interaction) {
	const gamblersData = await getGamblersData(userId)

	const embed = new EmbedBuilder().setTitle(`${interaction.user.username}'s Gambler Stats`).setColor("#FFD700") // Golnigga d-ish color associated with gambling
		.setDescription(`
			Gamble Limit: $${formatNumberWithCommas(gamblersData.limit)}
            Total Amount Gambled: $${formatNumberWithCommas(gamblersData.amountGambled)}
            Total Amount Won: $${formatNumberWithCommas(gamblersData.amountWon)}
            Total Amount Lost: $${formatNumberWithCommas(gamblersData.amountLost)}
			

            **Win/Loss Ratio:** ${calculateWinLossRatio(gamblersData.amountWon, gamblersData.amountLost)} 
        `)

	return embed
}

function calculateWinLossRatio(amountWon, amountLost) {
	if (amountLost === 0) return "∞" // Avoid division by zero
	return (amountWon / amountLost).toFixed(2)
}

function formatNumberWithCommas(number) {
	return number.toLocaleString("en-US") // Formats with commas for US locale
}

export const specialMessages = [
	"Sukuna smirks, 'You carry my honour, mortal. Show me your worth.'",
	"Sukuna's eyes narrow, 'A bearer of my honour? Entertain me!'",
	"With a sly grin, Sukuna says, 'So you've been touched by my power... Let's see if it's enough.'",
	"Sukuna laughs, 'Ah, my honour rides with you. Don't disappoint me!'",
	"Sukuna's presence weighs heavy, 'Honoured one, prove your mettle!'"
]
export const tojiMessages = [
	"Toji smirks, 'Hmph, you seem strong... Don't prove me wrong.'",
	"Toji's gaze is calculating, 'So you're carrying that honour? Show me if it's more than just a trinket.'",
	"With a cold smile, Toji says, 'You've got a scent of power about you. Let's see if it's anything worthwhile.'",
	"Toji scoffs, 'Carrying Sukuna's Honour? That doesn't mean you can match me.'",
	"Toji seems unimpressed, 'An honourable one, huh? Don't expect any favours in this fight.'"
]
export const itadoriMessages = [
	"Itadori gives you a knowing look, 'You're just like me, huh? Bearing Sukuna's Honour. Let's give this fight our all!'",
	"Itadori nods in understanding, 'Carrying Sukuna's weight is tough. You and I are in this together.'",
	"Itadori's expression is earnest, 'You remind me of myself, bearing Sukuna's Honour. Let's fight with honour!'"
]
export const gojoMessages = [
	"Gojo smirks with his eyes covered, 'Sukuna's Honour, huh? Let's see if you can impress me.'",
	"Gojo's casual stance hides his keen interest, 'Interesting... You have his honour. This should be fun.'",
	"With a lazy smile, Gojo teases, 'Sukuna finds you worthy? Guess I'll have to take you seriously.'",
	"Gojo laughs, 'You've caught Sukuna's eye? I'm curious now—don't let me down.'",
	"Gojo seems intrigued, 'You bear Sukuna's Honour? Show me its worth in action.'"
]

export const gojoRespectMessages = [
	"Alright, kid, you've earned my interest. Let's see what you can really do.",
	"Not bad. There's a reason I acknowledged you – now let's get serious.",
	"Heh, seems I was right about you. Now, show me why I should stay impressed.",
	"You have potential, no doubt. Don't disappoint me now, alright?",
	"Let's make this interesting. Prove you're worthy of the respect I've given you."
]

export const healthMultipliersByGrade = {
	"special grade": 3.0, // Boss health is doubled for the highest grade
	"grade 1": 2.5,
	"semi-grade 1": 1.7,
	"grade 2": 1.6,
	"grade 3": 1.3,
	"grade 4": 1.0 // No change for the lowest grade
}

export function gojoCommentary(quest) {
	// Custom commentary logic for Satoru Gojo
	if (quest.currentProgress === 0) {
		return "What's the hold-up? Just get started; it's not that difficult!"
	} else if (quest.currentProgress < quest.totalProgress) {
		return "Good job so far, but remember, it's not over until it's over. Stay sharp!"
	} else {
		return "Excellent work! But that was the easy part, wasn't it?"
	}
}

export function sukunaCommentary(quest) {
	// Custom commentary logic for Ryomen Sukuna
	if (quest.currentProgress === 0) {
		return "Are you scared or just lazy? Either way, you're wasting my time."
	} else if (quest.currentProgress < quest.totalProgress) {
		return "You're progressing... slowly. Try not to bore me with your incompetence."
	} else {
		return "Well done, I suppose. For a mere human, that is."
	}
}

export function itadoriCommentary(quest) {
	// Custom commentary logic for Itadori
	if (quest.currentProgress === 0) {
		return "No worries, everyone starts somewhere! You've got this!"
	} else if (quest.currentProgress < quest.totalProgress) {
		return "Look at you go! You're doing great; keep it up!"
	} else {
		return "Awesome, you finished! What's next on the agenda?"
	}
}
