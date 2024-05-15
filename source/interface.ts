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

interface Shikigami {
	name: string
	type: string
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
	shikigami: Shikigami[]
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
	_id: ObjectId
	initiatorName: string
	initiatorId: string
	targetUserId: string
	item: string
	quantity: number
	status: string
	createdAt: Date
}

export interface BossData {
	id?: string
	name: string
	max_health: number
	current_health: number
	image_url: string
	grade: string
	curse: boolean
	awakeningStage: string
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
	"(Dirty) Rikugan Eye": "Rikugan Eye"
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
	id: string
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
	cooldowns: Cooldown[]
	stats: Stat[]
	gamblersData: {
		limit: 5000000
		amountGambled: number
		amountWon: number
		amountLost: number
	}
	shikigami: []
}

interface Stat {
	technique?: string
	count?: number
	totalFightsWon?: number
	totalCommandsUsed?: number
	totalWorked?: number
	command?: string
	favoriteCommands?: { [commandName: string]: number }
	monthlyFightsWon?: number // Added this line
}

export interface Cooldown {
	type: string
	currentUsed?: number
	maxAllowed?: number
	lastUsed?: Date // Add the lastUsed property
	duration?: number // If duration is relevant
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
	if (amountLost === 0) return "∞"
	return (amountWon / amountLost).toFixed(2)
}

function formatNumberWithCommas(number) {
	return number.toLocaleString("en-US")
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
	"special grade": 3.0,
	"grade 1": 2.5,
	"semi-grade 1": 1.7,
	"grade 2": 1.6,
	"grade 3": 1.3,
	"grade 4": 1.0
}

export function gojoCommentary(quest) {
	if (quest.currentProgress === 0) {
		return "What's the hold-up? Just get started; it's not that difficult!"
	} else if (quest.currentProgress < quest.totalProgress) {
		return "Good job so far, but remember, it's not over until it's over. Stay sharp!"
	} else {
		return "Excellent work! But that was the easy part, wasn't it?"
	}
}

export function sukunaCommentary(quest) {
	if (quest.currentProgress === 0) {
		return "Are you scared or just lazy? Either way, you're wasting my time."
	} else if (quest.currentProgress < quest.totalProgress) {
		return "You're progressing... slowly. Try not to bore me with your incompetence."
	} else {
		return "Well done, I suppose. For a mere human, that is."
	}
}

export function itadoriCommentary(quest) {
	if (quest.currentProgress === 0) {
		return "No worries, everyone starts somewhere! You've got this!"
	} else if (quest.currentProgress < quest.totalProgress) {
		return "Look at you go! You're doing great; keep it up!"
	} else {
		return "Awesome, you finished! What's next on the agenda?"
	}
}

export interface IdleDeathsGambleState {
	feverMeter: number
	isJackpotMode: boolean
}

export interface Giveaway {
	guildId: string
	channelId: string
	messageId: string
	prize: string
	winners: number
	endDate: Date
	isPrizeItem: boolean
	winnerId: string
	entries: string[]
}

export const shikigamiThumbnails = {
	"Divine-General Mahoraga": "https://i.redd.it/e99r17yyf31c1.jpg",
	"Mahoraga":
		"https://preview.redd.it/what-do-mahoragas-titles-mean-v0-5zkcjgyqvscb1.jpg?width=640&crop=smart&auto=webp&s=9f9c6eded8e740fca8e1710e4affb400966b69c7",
	"Garuda":
		"https://static.wikia.nocookie.net/jujutsu-kaisen/images/a/a4/Yuki_Tsukumo_greets_Aoi_Todo.png/revision/latest?cb=20230613024714",
	"Divine Dogs":
		"https://static.wikia.nocookie.net/jujutsu-kaisen/images/b/b9/Fushiguro_using_Jade_Hounds.png/revision/latest?cb=20181112220305",
	"Toad": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/c/c9/Toad.png/revision/latest/scale-to-width/360?cb=20210205005021",
	"Nue": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/d/d4/Fushiguro_using_Chimera.png/revision/latest?cb=20200130211109",
	"Max Elephant":
		"https://static.wikia.nocookie.net/jujutsu-kaisen/images/3/38/Max_Elephant.png/revision/latest?cb=20210205075414"
}
