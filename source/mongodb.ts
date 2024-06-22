/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
dotenv()

import { CommandInteraction, EmbedBuilder } from "discord.js"
import { config as dotenv } from "dotenv"
import moment from "moment-timezone"
import { ClientSession, Collection, MongoClient, ObjectId } from "mongodb"
import cron from "node-cron"
import schedule from "node-schedule"
import { v4 as uuidv4 } from "uuid"
import { RaidDrops, getRaidBossDrop } from "./bossdrops.js"
import logger, { createClient } from "./bot.js"
import { handleGiveawayEnd } from "./command.js"
import {
	BossData,
	ItemEffect,
	LogEntry,
	TradeRequest,
	User,
	UserLog,
	UserProfile,
	healthMultipliersByGrade
} from "./interface.js"
import { jobs, questsArray, shopItems } from "./items jobs.js"

const client1 = createClient()

export const bossCollectionName = "bosses"
export const shikigamCollectionName = "shiki"
export const usersCollectionName = "users"
export const questsCollectioName = "quests"
export const tradeCollectionName = "trades"
export const shopCollectionName = "shop"
export const imageCollectionName = "imageLogs"
export const giveawayCollectionName = "giveawayLogs"
export const communityQuestsCollectionName = "communityQuests"
export const raidBossesCollectionName = "raidBosses"
export const raidInstancesCollectionName = "raidParticipants"
export const ownercommandCollectionName = "ownerLogs"
export const blacklistedCollectionName = "blacklistedUsers"
export const matchmakingCollectionName = "matchmaking"
export const battlesCollectionName = "battles"

export const mongoDatabase = process.env["MONGO_DATABASE"]
export const mongoUri = process.env.MONGO_URI

export const client = new MongoClient(mongoUri)

let isConnected = false

client.on("connected", () => {
	isConnected = true
	logger.info("Connected to MongoDB")
})

client.on("close", () => {
	isConnected = false
	logger.info("Disconnected from MongoDB")
})

export async function startNewSession() {
	if (!isConnected) {
		await client.connect()
	}
	return client.startSession()
}

// LINK START! ---------------------------------------------------------------

async function runScheduledTasks() {
	logger.info("Running scheduled tasks...")
	try {
		await updateShop()
		logger.info("Shop update completed successfully.")
	} catch (error) {
		logger.error("Error updating shop:", error)
	}

	try {
		await resetBetCounts()
		logger.info("Bet counts reset completed successfully.")
	} catch (error) {
		logger.error("Error resetting bet counts:", error)
	}
	try {
		await resetProfileChangeCooldown()
		logger.info("Profile Change Cooldown reset completed successfully.")
	} catch (error) {
		logger.error("Error resetting bet counts:", error)
	}
}

const job = schedule.scheduleJob("0 15 * * *", function () {
	runScheduledTasks()
})

cron.schedule("0 */3 * * *", async () => {
	try {
		await decreaseShikigamiHunger()
		await decreaseShikigamiHygiene()
		logger.info("Decreased shikigami hunger and hygiene")
	} catch (error) {
		logger.error("Error decreasing shikigami hunger:", error)
	}
})

cron.schedule("0 0 1 * *", async () => {
	try {
		await resetMonthlyFightsWon()
		logger.info("Monthly fights won reset completed successfully.")
	} catch (error) {
		logger.error("Error resetting monthly fights won:", error)
	}
})

cron.schedule("0 * * * *", () => {
	console.log("Running scheduled task to check and expire pending trades.")
	checkAndExpirePendingTrades()
})

// ----------------------------------------------------------------------------

export const initialAchievements = [
	{
		name: "Satoru Gojo's Killer",
		unlocked: false,
		unlockMethod: "Defeat Satoru Gojo in a raid",
		rewards: {
			coins: 250000,
			items: { "Special Grade Box": 1 },
			rewardTitle: "Satoru Gojo's Killer"
		}
	},
	{
		name: "King of Frauds",
		unlocked: false,
		unlockMethod: "Defeat Sukuna in a raid",
		rewards: {
			coins: 1,
			items: { "Sukuna Finger": 30 },
			rewardTitle: "Fraud King"
		}
	},
	{
		name: "Sorcerer Killer",
		unlocked: false,
		unlockMethod: "Defeat The Honored One",
		rewards: {
			coins: 100000
		}
	},
	{
		name: "The Strongest In History",
		unlocked: false,
		unlockMethod: "Reach level 100",
		rewards: {
			coins: 5000,
			items: { "Special Grade Box": 1 },
			rewardTitle: "Strongest in History"
		}
	},
	{
		name: "Jackpot",
		unlocked: false,
		unlockMethod: "Win a jackpot in the slot machine",
		rewards: {
			coins: 10000,
			rewardTitle: "Jackpot Winner"
		}
	},
	{
		name: "No Life",
		unlocked: false,
		unlockMethod: "Earn 1 Trillion Coins!",
		progress: 0,
		target: 1000000000000,
		rewards: {
			coins: 1000000,
			rewardTitle: "No Life"
		}
	},
	{
		name: "Domain Master",
		unlocked: false,
		unlockMethod: "Master your Domain Expansion",
		rewards: {
			items: { "Six Eyes": 1 },
			rewardTitle: "Master of Domains"
		}
	},
	{
		name: "Heavenly Restriction",
		unlocked: false,
		unlockMethod: "Unlock Heavenly Restriction",
		rewards: {
			coins: 3000,
			rewardTitle: "Heavenly Warrior"
		}
	},
	{
		name: "Raid Champion",
		unlocked: false,
		unlockMethod: "Win 10 raids",
		rewards: {
			coins: 2000,
			rewardTitle: "Raid Leader"
		}
	},
	{
		name: "Curse Breaker",
		unlocked: false,
		unlockMethod: "Defeat 500 curses",
		progress: 0,
		target: 500,
		rewards: {
			coins: 2500,
			rewardTitle: "Cursed King"
		}
	}
]

const initialTitles = [
	{ name: "Cursed King", unlocked: false, active: false },
	{ name: "Gojo's Successor", unlocked: false, active: false },
	{ name: "Raid Leader", unlocked: false, active: false },
	{ name: "Master of Domains", unlocked: false, active: false },
	{ name: "Heavenly Warrior", unlocked: false, active: false },
	{ name: "Shikigami Master", unlocked: false, active: false },
	{ name: "Technique Prodigy", unlocked: false, active: false },
	{ name: "Jackpot Winner", unlocked: false, active: false },
	{ name: "No Life", unlocked: false, active: false },
	{ name: "Fate's Favorite", unlocked: false, active: false },
	{ name: "Fraud King", unlocked: false, active: false },
	{ name: "Crashout King", unlocked: false, active: false },
	{ name: "Strongest in History", unlocked: false, active: false }
]

export async function userExists(discordId: string): Promise<boolean> {
	await client.connect()
	const database = client.db(mongoDatabase)
	const usersCollection = database.collection(usersCollectionName)

	const user = await usersCollection.findOne({ id: discordId })
	return user !== null
}

export async function addUser(
	id: string,
	initialBalance: number = 100,
	initialGrade: string = "Grade 4",
	initialExperience: number = 0,
	initialHealth: number = 100,
	initialJob: string = "Student",
	initialBankBalance: number = 0,
	initialmaxhealth: number = 100
): Promise<{ insertedId?: unknown; error?: string }> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const insertResult = await usersCollection.insertOne({
			id,
			registered: new Date().toISOString(),
			balance: initialBalance,
			bankBalance: initialBankBalance,
			job: initialJob,
			grade: initialGrade,
			experience: initialExperience,
			health: initialHealth,
			maxhealth: initialmaxhealth,
			owneddomains: [],
			domain: null,
			titles: initialTitles,
			inventory: [],
			achievements: initialAchievements,
			heavenlyrestriction: {
				unlocked: false,
				active: false
			},
			cursedEnergy: 100,
			clan: null,
			techniques: [],
			transformation: null,
			unlockedtransformations: [],
			unlockedBosses: [],
			activeTechniques: [],
			heavenlytechniques: [],
			activeheavenlytechniques: [],
			inateclan: {},
			activeinateclan: null,
			level: 1,
			quests: [],
			permEffects: [],
			statusEffects: [],
			betCount: 0,
			honours: [],
			purchases: [],
			itemEffects: [],
			cooldowns: [],
			stats: [],
			unlockedmentors: [],
			mentors: null,
			awakening: "Stage Zero",
			shikigami: [],
			gamblersData: {
				limit: 5000000,
				amountGambled: 0,
				amountLost: 0,
				amountWon: 0
			},
			settings: {
				pvpable: true,
				acceptTrades: true,
				showAlerts: true,
				showSpoilers: false
			}
		})

		logger.info(`Inserted user with ID: ${insertResult.insertedId}`)
		return { insertedId: insertResult.insertedId }
	} catch (error) {
		logger.error(`Error when adding user with ID: ${id}`, error)
		return { error: "Failed to add user." }
	}
}

async function resetBetCounts() {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateMany({}, { $set: { betCount: 0 } })

		logger.info(`Bet counts reset for ${updateResult.modifiedCount} users.`)
	} catch (error) {
		logger.error("Error resetting bet counts:", error)
	}
}

setInterval(removeExpiredItemEffects, 60000)
async function removeExpiredItemEffects() {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection: Collection<UserDocument> = database.collection(usersCollectionName)

		const currentTime = new Date().toISOString()

		const updateResult = await usersCollection.updateMany(
			{
				"itemEffects.endTime": { $lt: currentTime }
			},
			{
				$pull: { itemEffects: { endTime: { $lt: currentTime } } }
			}
		)

		logger.info(`Removed ${updateResult.modifiedCount} expired item effects`)
	} catch (error) {
		logger.error("Error removing expired item effects:", error)
	}
}

export async function initializeDatabase() {
	try {
		logger.info("Connecting to database...")
		await client.connect()

		logger.info("Initializing database...")
		logger.debug("Database initialization complete.")
	} catch (error) {
		logger.fatal("Database initialization failed:", error)
	}
}



export async function getBalance(id: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: id })

		return user ? user.balance : 0
	} catch (error) {
		logger.error(`Error when retrieving balance for user with ID: ${id}`, error)
		throw error
	}
}

export async function updateBalance(id: string, amount: number, options?: any): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: id }, { ...options })

		if (!user) {
			logger.info(`No user found with ID: ${id}`)
			throw new Error(`No user found with ID: ${id}`)
		}

		const newBalance = user.balance + amount

		if (newBalance >= 0) {
			const updateResult = await usersCollection.updateOne(
				{ id: id },
				{ $set: { balance: newBalance } },
				{ ...options }
			)
			logger.log(`Updated balance for user with ID: ${id}`)

			await trackAchievementsAndQuests(id, amount)
		} else {
			logger.log("Balance update prevented: would have resulted in negative balance")
		}
	} catch (error) {
		logger.error(`Error when updating balance for user with ID: ${id}`, error)
		throw error
	}
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const userDocument = await usersCollection.findOne(
			{ id: userId },
			{
				projection: {
					_id: 0,
					balance: 1,
					experience: 1,
					grade: 1,
					domain: 1,
					job: 1,
					titles: 1,
					heavenlyrestriction: 1,
					inateclan: 1,
					shikigami: 1,
					level: 1
				}
			}
		)

		if (!userDocument) {
			logger.info(`No user profile found for ID: ${userId}`)
			return null
		}

		const userProfile: UserProfile = {
			balance: userDocument.balance,
			experience: userDocument.experience,
			grade: userDocument.grade,
			domain: userDocument.domain || null,
			job: userDocument.job || "Non-Sorcerer",
			titles: userDocument.titles || [],
			heavenlyrestriction: userDocument.heavenlyrestriction || null,
			inateclan: userDocument.clan || "None",
			shikigami: userDocument.shikigami || [],
			level: userDocument.level || 1
		}

		logger.log(`User profile found for ID: ${userId}`, userProfile)
		return userProfile
	} catch (error) {
		logger.error(`Error when retrieving user profile for ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserDomainExpansion(userId: string, domainName: string): Promise<boolean> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateOne({ id: userId }, { $set: { domain: { name: domainName } } })

		if (updateResult.matchedCount === 0) {
			logger.info("No user found with the specified ID")
			return false
		}

		return true
	} catch (error) {
		logger.error("Error updating user domain:", error)
		throw error
	}
}

export async function getUserInventory(userId: string): Promise<{ name: string; quantity: number }[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.inventory : []
	} catch (error) {
		logger.error(`Error when retrieving inventory for user with ID: ${userId}`, error)
		throw error
	}
}

export async function addItemToUserInventory(
	userId: string,
	itemName: string,
	quantityToAdd: number,
	options?: any
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const existingItem = await usersCollection.findOne({ "id": userId, "inventory.name": itemName }, { ...options })

		if (existingItem) {
			await usersCollection.updateOne(
				{ "id": userId, "inventory.name": itemName },
				{ $inc: { "inventory.$.quantity": quantityToAdd } },
				{ ...options }
			)
			logger.info(`Updated quantity of ${itemName} for user with ID: ${userId}`)
		} else {
			await usersCollection.updateOne(
				{ id: userId },
				{ $push: { inventory: { name: itemName, quantity: quantityToAdd } } },
				{ ...options }
			)
		}
	} catch (error) {
		logger.error("Error adding item to user inventory:", error)
		throw error
	}
}

// give item to all users
export async function giveItemToAllUsers(itemName: string, quantityToAdd: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)
		const updateResult = await usersCollection.updateMany(
			{ "inventory.name": itemName },
			{ $inc: { "inventory.$.quantity": quantityToAdd } }
		)
		const insertResult = await usersCollection.updateMany(
			{ "inventory.name": { $ne: itemName } },
			{ $push: { inventory: { name: itemName, quantity: quantityToAdd } } }
		)
		logger.info(
			`Updated inventory for ${updateResult.modifiedCount} users and added item for ${insertResult.modifiedCount} users`
		)
	} catch (error) {
		logger.error("Error giving item to all users:", error)
		throw error
	}
}
// get user experience points
export async function getUserExperience(userId: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.experience : 0
	} catch (error) {
		logger.error(`Error when retrieving experience for user with ID: ${userId}`, error)
		throw error
	}
}

// update user job
export async function updateUserJob(userId: string, newJob: string): Promise<boolean> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateOne({ id: userId }, { $set: { job: newJob } })

		if (updateResult.matchedCount === 0) {
			logger.info("No user found with the specified ID")
			return false
		}

		return true
	} catch (error) {
		logger.error("Error updating user job:", error)
		throw error
	}
}

// update user experience
export async function updateUserExperience(userId: string, experienceToAdd: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		logger.log(`Attempting to update experience for user ID: ${userId}`)

		const user = await usersCollection.findOne({ id: userId })
		if (!user) {
			logger.log(`No user found with the specified ID: ${userId}`)
			return
		}

		const currentExperience = user.experience || 0
		const currentLevel = user.level || 1

		const newExperience = currentExperience + experienceToAdd
		let newLevel = currentLevel
		let experienceForNextLevel = calculateExperienceForLevel(newLevel)

		while (newExperience >= experienceForNextLevel) {
			newLevel += 1
			experienceForNextLevel = calculateExperienceForLevel(newLevel)
		}

		const updateResult = await usersCollection.updateOne(
			{ id: userId },
			{
				$set: { experience: newExperience, level: newLevel }
			}
		)

		logger.log(`Matched Count: ${updateResult.matchedCount}`)
		logger.log(`Modified Count: ${updateResult.modifiedCount}`)
	} catch (error) {
		logger.error("Error updating user experience:", error)
		throw error
	}
}

export function calculateExperienceForLevel(level: number): number {
	const baseExperience = 100
	const polynomialGrowth = Math.pow(level, 1.2)
	const logarithmicGrowth = Math.log2(level + 1) * 50
	return Math.floor(baseExperience + polynomialGrowth + logarithmicGrowth)
}

export async function updateUserTitle(userId: string, newTitle: string): Promise<boolean> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateOne({ id: userId }, { $set: { activeTitle: newTitle } })

		if (updateResult.matchedCount === 0) {
			logger.info("No user found with the specified ID")
			return false
		}

		return true
	} catch (error) {
		logger.error("Error updating user title:", error)
		throw error
	}
}

interface InventoryItem {
	name: string
	quantity: number
}

interface UserDocument {
	id: string
	inventory: InventoryItem[]
}
// remove item from user and if value is 0 remove the item from the inventory
export async function removeItemFromUserInventory(
	userId: string,
	itemName: string,
	quantityToRemove: number
): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection: Collection<UserDocument> = database.collection(usersCollectionName)
		const updateResult = await usersCollection.updateOne(
			{ "id": userId, "inventory.name": itemName },
			{ $inc: { "inventory.$.quantity": -quantityToRemove } }
		)

		await usersCollection.updateOne(
			{ "id": userId, "inventory.name": itemName },
			{ $pull: { inventory: { quantity: 0 } } }
		)
	} catch (error) {
		logger.error("Error removing item from user inventory:", error)
		throw error
	}
}

// get player health
export async function getUserHealth(userId: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.health : 0
	} catch (error) {
		logger.error(`Error when retrieving health for user with ID: ${userId}`, error)
		throw error
	}
}

const gradeToBossGrade = {
	"Special Grade 1": ["Unregistered Threat", "Special Grade", "Grade 1", "Semi-Grade 1", "Grade 2"],
	"Special Grade 2": ["Special Grade", "Grade 1", "Semi-Grade 1", "Grade 2"],
	"Special Grade 3": ["Special Grade", "Grade 1", "Semi-Grade 1", "Grade 2"],
	"Special Grade 4": ["Special Grade", "Grade 1", "Semi-Grade 1", "Grade 2"],
	"Special Grade": ["Special Grade", "Grade 1", "Semi-Grade 1", "Grade 2"],
	"Grade 1": ["Grade 1", "Semi-Grade 1", "Grade 2", "Grade 3"],
	"Semi-Grade 1": ["Semi-Grade 1", "Grade 2", "Grade 3"],
	"Grade 2": ["Grade 2", "Grade 3", "Grade 4"],
	"Grade 3": ["Grade 3", "Grade 4"],
	"Grade 4": ["Grade 4"]
}

export async function getBosses(userId: string): Promise<BossData[]> {
	try {
		const userEffects = await getUserItemEffects(userId)
		const isCursed = userEffects.some(effect => effect.effectName.toLowerCase() === "cursed")
		const isNonCursed = userEffects.some(effect => effect.effectName.toLowerCase() === "curse repellent")
		const isBlessed = userEffects.some(effect => effect.effectName.toLowerCase() === "blessed")

		const userGrade = await getUserGrade(userId)
		const healthMultiplier = healthMultipliersByGrade[userGrade.toLowerCase()] || 1

		const database = client.db(mongoDatabase)
		const domainsCollection = database.collection(bossCollectionName)

		const allowedBossGrades = gradeToBossGrade[userGrade] || []
		const userAwakening = await getUserAwakening(userId)

		let query: { [key: string]: unknown } = {
			grade: { $in: allowedBossGrades },
			name: { $nin: ["Divine Dogs", "Nue", "Toad", "Great Serpent", "Max Elephant"] }
		}

		if (userAwakening) {
			const awakeningStages = ["Stage Zero", "Stage One", "Stage Two", "Stage Three", "Stage Four", "Stage Five"]
			const currentStageIndex = awakeningStages.indexOf(userAwakening)

			if (currentStageIndex !== -1) {
				const allowedAwakeningStages = awakeningStages.slice(0, currentStageIndex + 1)

				if (isBlessed) {
					const filteredAwakeningStages = allowedAwakeningStages.filter(stage => stage !== "Stage Zero")
					query = {
						...query,
						awakeningStage: { $in: filteredAwakeningStages }
					}
				} else {
					query = {
						...query,
						awakeningStage: { $in: allowedAwakeningStages }
					}
				}
			} else {
				query = {
					...query,
					$or: [{ awakeningStage: "Stage Zero" }, { awakeningStage: { $exists: true } }]
				}
			}
		} else {
			query = {
				...query,
				$or: [{ awakeningStage: "Stage Zero" }, { awakeningStage: { $exists: true } }]
			}
		}

		if (isCursed && !isNonCursed) {
			query = { ...query, curse: true }
		} else if (!isNonCursed && isNonCursed) {
			query = { ...query, curse: false }
		}

		const a = await domainsCollection.find(query).toArray()

		const bosses = a.map(boss => ({
			id: boss._id.toString(),
			name: boss.name,
			max_health: Math.round(boss.max_health * healthMultiplier),
			current_health: Math.round(boss.current_health * healthMultiplier),
			image_url: boss.image_URL,
			grade: boss.grade,
			curse: boss.curse,
			awakeningStage: boss.awakeningStage
		}))

		return bosses
	} catch (error) {
		logger.error("Error when retrieving bosses:", error)
		throw error
	}
}

export function getNextAwakeningStage(currentStage: string): string {
	const stages = ["Stage Zero", "Stage One", "Stage Two", "Stage Three", "Stage Four", "Stage Five"]
	const currentIndex = stages.indexOf(currentStage)
	return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : "Stage Five"
}

export async function getShikigami(userId: string): Promise<BossData[]> {
	try {
		const userGrade = await getUserGrade(userId)
		const healthMultiplier = healthMultipliersByGrade[userGrade.toLowerCase()] || 1

		const database = client.db(mongoDatabase)
		const domainsCollection = database.collection(shikigamCollectionName)

		const shikigami = await domainsCollection.find({}).toArray()

		const bosses = shikigami.map(boss => ({
			id: boss._id.toString(),
			name: boss.name,
			max_health: Math.round(boss.max_health * healthMultiplier),
			current_health: Math.round(boss.current_health * healthMultiplier),
			image_url: boss.image_URL,
			grade: boss.grade,
			curse: boss.curse,
			awakeningStage: boss.awakeningStage
		}))

		return bosses
	} catch (error) {
		logger.error("Error when retrieving shikigami:", error)
		throw error
	}
}

export async function getUserGrade(userId: string): Promise<string> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.grade : "Grade 4"
	} catch (error) {
		logger.error(`Error when retrieving grade for user with ID: ${userId}`, error)
		throw error
	}
}

// update boss health in database
export async function updateBossHealth(bossName: string, newHealth: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const domainsCollection = database.collection(bossCollectionName)

		const updateResult = await domainsCollection.updateOne(
			{ name: bossName },
			{ $set: { currentHealth: newHealth } }
		)

		if (updateResult.matchedCount === 0) {
			logger.log("No boss found with the specified name")
		}
	} catch (error) {
		logger.error("Error updating boss health:", error)
		throw error
	}
}

// update player health function
export async function updateUserHealth(userId: string, newHealth: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateOne({ id: userId }, { $set: { health: newHealth } })

		if (updateResult.matchedCount === 0) {
			logger.info("No user found with the specified ID")
		}
	} catch (error) {
		logger.error("Error updating user health:", error)
		throw error
	}
}

// get domain from users
export async function getUserDomain(userId: string): Promise<string | null> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user && user.domain ? user.domain.name : null
	} catch (error) {
		logger.error(`Error when retrieving domain for user with ID: ${userId}`, error)
		throw error
	}
}

export async function checkUserRegistration(userId) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })
		return user !== null // Returns true if the user exists
	} catch (error) {
		logger.error("Error checking registration:", error)
		return false // Consider returning false in case of database errors
	}
}

// Function to determine the grade based on experience points
function calculateGrade(experience) {
	if (experience >= 10000) return "Special Grade 1"
	else if (experience >= 5500) return "Special Grade 2"
	else if (experience >= 4500) return "Special Grade 3"
	else if (experience >= 3500) return "Special Grade 4"
	else if (experience >= 1750) return "Grade 1"
	else if (experience >= 750) return "Semi-Grade 1"
	else if (experience >= 500) return "Grade 2"
	else if (experience >= 250) return "Grade 3"
	else return "Grade 4"
}

function calculateTier(experience) {
	if (experience >= 2250) return 1
	else if (experience >= 1750) return 2
	else if (experience >= 750) return 3
	else if (experience >= 500) return 4
	else if (experience >= 250) return 5
	else return 6
}

// Main function to update the player's grade based on experience
export async function updatePlayerGrade(userId) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const player = await usersCollection.findOne({ id: userId })
		if (!player) {
			logger.info("No user found with the specified ID in the users collection.")
			return
		}

		const newGrade = calculateGrade(player.experience)

		if (newGrade !== player.grade) {
			await usersCollection.updateOne({ id: userId }, { $set: { grade: newGrade } })
			logger.log(`Grade updated to ${newGrade} for user ${userId} in the users collection.`)
		} else {
			logger.log(`No grade update needed for user ${userId} in the users collection.`)
		}
	} catch (error) {
		logger.error(`Error updating grade for user ${userId} in the users collection:`, error)
	}
}
export async function updatePlayerClanTier(userId) {
	try {
		await client.connect()

		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const player = await usersCollection.findOne({ id: userId }, { projection: { inateclan: 1 } })
		if (!player || !player.inateclan) {
			logger.log("No user or clan information found with the specified ID.")
			return
		}

		const newTier = calculateTier(player.inateclan.experience)

		if (newTier !== player.inateclan.tier) {
			const result = await usersCollection.updateOne({ id: userId }, { $set: { "inateclan.tier": newTier } })

			if (result.matchedCount === 0) {
				logger.log(`No document found for user ${userId} to update.`)
			} else if (result.modifiedCount === 0) {
				logger.log(`Document for user ${userId} was found but not modified.`)
			} else {
				logger.log(`Clan tier updated to ${newTier} for user ${userId}.`)

				if (newTier === 2 && player.inateclan.clan === "Limitless") {
					await addUserQuest(userId, "Limitless Unleashed")
					logger.debug(`Added Limitless Unleashed quest for user ${userId}`)
				}
			}
		} else {
			logger.log(`No clan tier update needed for user ${userId}. Current tier is already ${newTier}.`)
		}
	} catch (error) {
		logger.error(`Error updating clan tier for user ${userId}:`, error)
	}
}

export async function createAlert(userId, message) {
	const database = client.db(mongoDatabase)
	const alertsCollection = database.collection("alerts")

	const alert = {
		userId,
		message,
		timestamp: new Date(),
		read: false
	}

	await alertsCollection.insertOne(alert)
}

// get player clan tier
export async function getUserClanTier(userId: string): Promise<number> {
	try {
		await client.connect()

		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const player = await usersCollection.findOne({ id: userId }, { projection: { inateclan: 1 } })
		if (!player || !player.inateclan) {
			logger.log("No user or clan information found with the specified ID.")
			return 0
		}

		return player.inateclan.tier
	} catch (error) {
		logger.error(`Error retrieving clan tier for user ${userId}:`, error)
		return 0
	}
}

export async function getUserClanDetails(userId: string): Promise<{ tier: number; clan: string }> {
	try {
		await client.connect()

		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const player = await usersCollection.findOne({ id: userId }, { projection: { inateclan: 1 } })
		if (!player || !player.inateclan) {
			logger.log("No user or clan information found with the specified ID.")
			return { tier: 0, clan: "" }
		}

		return { tier: player.inateclan.tier, clan: player.inateclan.clan }
	} catch (error) {
		logger.error(`Error retrieving clan details for user ${userId}:`, error)
		return { tier: 0, clan: "" }
	}
}

// add achivements function
export async function updateUserAchievements(userId: string, achievementName: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Retrieve the current user data
		const user = await usersCollection.findOne({ id: userId })

		if (!user) {
			logger.info("User not found.")
			return
		}

		// Check if the achievement already exists and is unlocked
		const achievements = user.achievements || initialAchievements
		const achievementIndex = achievements.findIndex(ach => ach.name === achievementName)

		if (achievementIndex === -1) {
			logger.error(`Achievement with name ${achievementName} not found in initial achievements.`)
			return
		}

		if (achievements[achievementIndex].unlocked) {
			logger.info("Achievement was already unlocked.")
			return
		}

		// Update the achievement to unlocked
		achievements[achievementIndex].unlocked = true

		// Update the user's achievements in the database
		const updateResult = await usersCollection.updateOne({ id: userId }, { $set: { achievements: achievements } })

		if (updateResult.matchedCount === 0) {
			logger.info("User not found.")
		} else if (updateResult.modifiedCount === 0) {
			logger.info("Achievement was already in the user's achievements.")
		} else {
			logger.info("Achievement added to the user's achievements.")
		}
	} catch (error) {
		logger.error("Error updating user achievements:", error)
		throw error
	}
}

// get all achivements from a user
export async function getUserAchievements(userId: string): Promise<any[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user && Array.isArray(user.achievements) ? user.achievements : initialAchievements
	} catch (error) {
		logger.error(`Error when retrieving achievements for user with ID: ${userId}`, error)
		throw error
	}
}

// update user unlocked titles
export async function updateUserUnlockedTitles(userId: string, newTitles: string[]): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateOne({ id: userId }, { $set: { unlockedTitles: newTitles } })

		if (updateResult.matchedCount === 0) {
			logger.log("No user found with the specified ID")
		}
	} catch (error) {
		logger.error("Error updating user unlocked titles:", error)
		throw error
	}
}
// get user unlocked titles
export async function getUserUnlockedTitles(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.unlockedTitles : []
	} catch (error) {
		logger.error(`Error when retrieving unlocked titles for user with ID: ${userId}`, error)
		throw error
	}
}

// update user bankbalance
export async function updateUserBankBalance(userId: string, newBalance: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateOne({ id: userId }, { $set: { bankBalance: newBalance } })

		if (updateResult.matchedCount === 0) {
			logger.log("No user found with the specified ID")
		}
	} catch (error) {
		logger.error("Error updating user bank balance:", error)
		throw error
	}
}

// get user bank balance if they dont have a bankbalance then create it
export async function getUserBankBalance(userId: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.bankBalance : 0
	} catch (error) {
		logger.error(`Error when retrieving bank balance for user with ID: ${userId}`, error)
		throw error
	}
}

export async function getUser(discordId: string): Promise<unknown> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const userDocument = await usersCollection.findOne({ id: discordId })
		return userDocument
	} catch (error) {
		logger.error(`An error occurred while getting user with ID ${discordId}:`, error)
		throw error //
	}
}

export async function updateUser(discordId, updates) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const result = await usersCollection.updateOne({ id: discordId }, { $set: updates })

		logger.info(
			`Updated user with ID ${discordId}. Matched Count: ${result.matchedCount}. Modified Count: ${result.modifiedCount}`
		)
		return result
	} catch (error) {
		logger.error(`An error occurred while updating user with ID ${discordId}:`, error)
		throw error
	}
}

// getUserDailyData function
export async function getUserDailyData(userId: string): Promise<{ lastDaily: number; streak: number }> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return {
			lastDaily: user?.lastDaily || 0,
			streak: user?.streak || 0
		}
	} catch (error) {
		logger.error(`Error when retrieving daily data for user with ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserDailyData(userId: string, lastDaily: number, streak: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { lastDaily, streak } }, { upsert: true })
	} catch (error) {
		logger.error(`Error when updating daily data for user with ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserHeavenlyRestriction(userId: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { "heavenlyrestriction.unlocked": true } })
	} catch (error) {
		logger.error("Error updating heavenly restriction:", error)
		throw error
	} finally {
		await client.close()
	}
}

export async function checkUserHasHeavenlyRestriction(userId: string): Promise<boolean> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId }, { projection: { "heavenlyrestriction.active": 1 } })

		if (user && user.heavenlyrestriction && user.heavenlyrestriction.active) {
			return true
		} else {
			return false
		}
	} catch (error) {
		logger.error("Error checking Heavenly Restriction:", error)
		throw error
	} finally {
		await client.close()
	}
}

// get user clan
export async function getUserClan(userId: string): Promise<string | null> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.clan : null
	} catch (error) {
		logger.error(`Error when retrieving clan for user with ID: ${userId}`, error)
		throw error
	}
}

// get user techniques
export async function getUserTechniques(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.techniques : []
	} catch (error) {
		logger.error(`Error when retrieving techniques for user with ID: ${userId}`, error)
		throw error
	}
}

// get ALL user experience
export async function getAllUserExperience(): Promise<{ id: string; experience: number }[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const users = (await usersCollection.find({}, { projection: { id: 1, experience: 1 } }).toArray()).map(
			user => ({ id: user.id, experience: user.experience })
		)

		return users
	} catch (error) {
		logger.error("Error when retrieving all user experience:", error)
		throw error
	}
}

// get all quest
export async function getAllQuests(): Promise<{ id: string; name: string; description: string }[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const questsCollection = database.collection(questsCollectioName)

		const quests = (
			await questsCollection.find({}, { projection: { _id: 0, id: 1, name: 1, description: 1 } }).toArray()
		).map(quest => ({
			id: quest.id,
			name: quest.name,
			description: quest.description
		}))

		return quests
	} catch (error) {
		logger.error("Error when retrieving all quests:", error)
		throw error
	}
}
// update user techniques
export async function addUserTechnique(userId: string, newTechnique: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Update the user's document to append a new technique
		await usersCollection.updateOne(
			{ id: userId },
			{ $addToSet: { techniques: newTechnique } } // Use $addToSet to avoid duplicate entries
		)
	} catch (error) {
		logger.error("Error updating user techniques:", error)
		throw error
	}
}

// update user clan
export async function updateUserClan(userId: string, newClan: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Update the user's clan
		await usersCollection.updateOne({ id: userId }, { $set: { clan: newClan } })
	} catch (error) {
		logger.error("Error updating user clan:", error)
		throw error
	}
}

// update heavenly restriction techniques heavenlytechnqiues
export async function updateUserHeavenlyTechniques(userId: string, newTechnique: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Update the user's document to append a new heavenly technique
		await usersCollection.updateOne(
			{ id: userId },
			{ $addToSet: { heavenlytechniques: newTechnique } } // Use $addToSet to avoid duplicate entries
		)
	} catch (error) {
		logger.error("Error updating user heavenly techniques:", error)
		throw error
	}
}

// get heavenly techniques
export async function getUserHeavenlyTechniques(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.heavenlytechniques : []
	} catch (error) {
		logger.error(`Error when retrieving heavenly techniques for user with ID: ${userId}`, error)
		throw error
	}
}

export async function toggleHeavenlyRestriction(userId: string): Promise<boolean> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (!user) {
			logger.info("No user found with the specified ID")
			return false
		}

		if (user.heavenlyrestriction && user.heavenlyrestriction.unlocked) {
			const newActiveState = !user.heavenlyrestriction.active
			await usersCollection.updateOne({ id: userId }, { $set: { "heavenlyrestriction.active": newActiveState } })
			return newActiveState
		}

		return false
	} catch (error) {
		logger.error("Error toggling Heavenly Restriction:", error)
		throw error
	}
}

export async function handleToggleHeavenlyRestrictionCommand(interaction) {
	if (!(interaction instanceof CommandInteraction)) return

	const userId = interaction.user.id

	try {
		const success = await toggleHeavenlyRestriction(userId)

		if (success) {
			await interaction.reply({
				content:
					"Your Heavenly Restriction status has been toggled. You can now harness its power differently!",
				ephemeral: true
			})
		} else {
			await interaction.reply({
				content:
					"It seems you have not unlocked Heavenly Restriction yet. Keep training and exploring to unlock this ability!",
				ephemeral: true
			})
		}
	} catch (error) {
		logger.error("Error toggling Heavenly Restriction:", error)
		await interaction.reply({
			content:
				"An error occurred while trying to toggle your Heavenly Restriction status. Please try again later.",
			ephemeral: true
		})
	}
}

// get user cursedEnergy
export async function getUserCursedEnergy(userId: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.cursedEnergy : 100
	} catch (error) {
		logger.error(`Error when retrieving cursed energy for user with ID: ${userId}`, error)
		throw error
	}
}
// update user cursedEnergy
export async function updateUserCursedEnergy(userId: string, newCursedEnergy: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { cursedEnergy: newCursedEnergy } })
	} catch (error) {
		logger.error("Error updating user cursed energy:", error)
		throw error
	}
}
// get user last vote time
export async function getUserLastVoteTime(userId: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.lastVoteTime : 0
	} catch (error) {
		logger.error(`Error when retrieving last vote time for user with ID: ${userId}`, error)
		throw error
	}
}
// update user last vote time
export async function updateUserLastVoteTime(userId: string, newLastVoteTime: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { lastVoteTime: newLastVoteTime } })
	} catch (error) {
		logger.error("Error updating user last vote time:", error)
		throw error
	}
}
// get all users balance
export async function getAllUsersBalance() {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.createIndex({ balance: -1 }, { name: "balance_index" })

		const topUsers = await usersCollection
			.find({}, { projection: { _id: 0, id: 1, balance: 1 } })
			.sort({ balance: -1 }) // Sort in descending order of balance
			.limit(10)
			.toArray()

		return topUsers.map(user => ({
			id: user.id,
			balance: user.balance
		}))
	} catch (error) {
		logger.error("Error when retrieving all users balance:", error)
		throw error
	}
}

// get user gamble info
export async function getUserGambleInfo(
	userId: string
): Promise<{ lastGamble: number; streak: number; betCount: number; lastGambleDate: Date | null }> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return {
			lastGamble: user?.lastGamble || 0,
			streak: user?.streak || 0,
			betCount: user?.betCount || 0,
			lastGambleDate: user?.lastGambleDate || null
		}
	} catch (error) {
		logger.error(`Error when retrieving gamble info for user with ID: ${userId}`, error)
		throw error
	}
}
// update user gamble info
export async function updateUserGambleInfo(userId: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ id: userId },
			{ $inc: { betCount: 1 } } // Use $inc to increment betCount
		)
	} catch (error) {
		logger.error("Error updating user gamble info:", error)
		throw error
	}
}

//update user gamble
export async function updateUserGamble(userId: string, newGamble: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne({ id: userId }, { $set: { gamble: newGamble } })
	} catch (error) {
		logger.error("Error updating user gamble:", error)
		throw error
	}
}

async function dailyReset() {
	const database = client.db(mongoDatabase)
	const usersCollection = database.collection("users")
	const users = await usersCollection.find().toArray()

	for (const user of users) {
		const nowInUserTimezone = moment().tz(user.timezone)
		if (nowInUserTimezone.hour() === 0 && nowInUserTimezone.minute() === 0) {
			await usersCollection.updateOne({ id: user.id }, { $set: { gamblesToday: 0 } })
		}
	}
}

cron.schedule("0 0 * * *", dailyReset)

// has user recieved vote reward
export async function hasUserReceivedVoteReward(userId: string): Promise<boolean> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne(
			{ id: userId },
			{ projection: { receivedVoteReward: 1 } } // Projection
		)

		return user?.receivedVoteReward || false
	} catch (error) {
		logger.error(`Error when checking vote reward for user with ID: ${userId}`, error)
		throw error
	}
}

// updateUserVoteRewardStatus 150k balance
export async function updateUserVoteRewardStatus(userId: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { receivedVoteReward: true } })
	} catch (error) {
		logger.error("Error updating user vote reward status:", error)
		throw error
	}
}

const uniqueId = uuidv4()

export async function addUserQuest(userId: string, questName: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const questToAdd = questsArray.find(quest => quest.name === questName)

		if (questToAdd) {
			const instanceId = uniqueId

			let questData

			if (questToAdd.tasks) {
				questData = {
					id: questName,
					instanceId: instanceId,
					tasks: questToAdd.tasks.map(task => ({
						description: task.description,
						progress: 0,
						totalProgress: task.totalProgress
					}))
				}
			} else {
				questData = {
					id: questName,
					instanceId: instanceId,
					progress: 0,
					task: questToAdd.task,
					totalProgress: questToAdd.totalProgress
				}
			}

			await usersCollection.updateOne({ id: userId }, { $addToSet: { quests: questData } })
		} else {
			throw new Error("Quest not found: " + questName)
		}
	} catch (error) {
		logger.error("Error adding user quest:", error)
		throw error
	}
}

// addUserQuestProgress
export async function addUserQuestProgress(userId, questId, increment, taskDescription = null) {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		let updateResult

		if (taskDescription) {
			updateResult = await usersCollection.updateOne(
				{
					"id": userId,
					"quests.id": questId,
					"quests.tasks.description": taskDescription
				},
				{
					$inc: { "quests.$[quest].tasks.$[task].progress": increment }
				},
				{
					arrayFilters: [{ "task.description": taskDescription }, { "quest.id": questId }]
				}
			)
		} else {
			updateResult = await usersCollection.updateOne(
				{
					"id": userId,
					"quests.id": questId
				},
				{
					$inc: { "quests.$.progress": increment }
				}
			)
		}

		if (updateResult.matchedCount === 0) {
			logger.error(`Quest '${questId}' not found for user: ${userId}`)
		} else if (updateResult.modifiedCount === 0) {
			logger.error(`Quest progress for '${questId}' was not updated for user: ${userId}`)
		} else {
			logger.info(`Quest progress updated successfully for user: ${userId}`)
		}
	} catch (error) {
		logger.error("Error updating user quest progress:", error)
		throw error
	}
}

export async function getUserQuests(userId) {
	try {
		logger.info("Attempting to retrieve quests for userId:", userId)
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (!user) return { quests: [] }

		const userQuests = user.quests ? [...user.quests] : []
		return { quests: userQuests }
	} catch (error) {
		logger.error(`Error when retrieving quests for user with ID: ${userId}:`, error.stack)
		throw error
	}
}

export async function removeUserQuest(userId: string, instanceId: string, session?: ClientSession): Promise<boolean> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection: Collection<User> = database.collection<User>(usersCollectionName)

		const options = session ? { session } : {}

		const result = await usersCollection.updateOne(
			{ "id": userId, "quests.instanceId": instanceId },
			{ $pull: { quests: { instanceId: instanceId } } },
			options
		)

		if (result.modifiedCount === 0) {
			logger.info(`No quest with instanceId: ${instanceId} was removed for the user with ID: ${userId}`)
			return false
		} else {
			logger.info(`Quest with instanceId: ${instanceId} was removed for the user with ID: ${userId}`)
			return true
		}
	} catch (error) {
		logger.error(`Error when removing quest for user with ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserMaxHealth(userId: string, healthIncrement: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })
		if (user) {
			let { health, maxhealth } = user

			maxhealth = Math.min(maxhealth + healthIncrement, 400)

			health = Math.min(health, maxhealth)

			await usersCollection.updateOne({ id: userId }, { $set: { maxhealth, health } })
		}
	} catch (error) {
		logger.error("Error updating user max health:", error)
		throw error
	}
}

// get user max health if maxhealth doesnt exist then create it as 100
export async function getUserMaxHealth(userId: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.maxhealth || 100 : 100
	} catch (error) {
		logger.error(`Error when retrieving max health for user with ID: ${userId}`, error)
		throw error
	}
}

// create trade request
export async function createTradeRequest(
	initiatorId: string,
	targetUserId: string,
	item: string,
	quantity: number
): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const tradeRequestsCollection = database.collection(tradeCollectionName)

		const tradeRequest = {
			initiatorId,
			targetUserId,
			item,
			quantity,
			status: "pending",
			createdAt: new Date()
		}

		await tradeRequestsCollection.insertOne(tradeRequest)
	} catch (error) {
		logger.error("Error creating trade request:", error)
		throw error
	}
}

// accept trade request
export async function acceptTradeRequest(tradeRequestId: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const tradeRequestsCollection = database.collection(tradeCollectionName)

		await tradeRequestsCollection.updateOne({ _id: new ObjectId(tradeRequestId) }, { $set: { status: "accepted" } })
	} catch (error) {
		logger.error("Error accepting trade request:", error)
		throw error
	}
}

// view trade requests
export async function viewTradeRequests(userId: string): Promise<TradeRequest[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const tradeRequestsCollection = database.collection(tradeCollectionName)

		const tradeRequests = await tradeRequestsCollection
			.find({
				targetUserId: userId,
				status: "pending"
			})
			.toArray()

		return tradeRequests.map(doc => ({
			_id: doc._id,
			initiatorName: doc.initiatorName,
			initiatorId: doc.initiatorId,
			targetUserId: doc.targetUserId,
			item: doc.item,
			quantity: doc.quantity,
			status: doc.status,
			createdAt: doc.createdAt
		}))
	} catch (error) {
		logger.error("Error viewing trade requests:", error)
		throw error
	}
}

// validate trade request
export async function validateTradeRequest(tradeRequestId: string): Promise<boolean> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const tradeRequestsCollection = database.collection(tradeCollectionName)

		const tradeRequest = await tradeRequestsCollection.findOne({ _id: new ObjectId(tradeRequestId) })

		return tradeRequest && tradeRequest.status === "pending"
	} catch (error) {
		logger.error("Error validating trade request:", error)
		throw error
	}
}
export async function handleTradeAcceptance(tradeRequestId: string, userId: string): Promise<void> {
	const database = client.db(mongoDatabase)
	const tradeRequestsCollection = database.collection(tradeCollectionName)

	try {
		const tradeRequest = await tradeRequestsCollection.findOne({
			_id: new ObjectId(tradeRequestId),
			status: "pending",
			targetUserId: userId
		})

		if (!tradeRequest) {
			throw new Error("Trade request not found or not valid for this user.")
		}

		await removeItemFromUserInventory(tradeRequest.initiatorId, tradeRequest.item, Number(tradeRequest.quantity))

		await addItemToUserInventory(tradeRequest.targetUserId, tradeRequest.item, Number(tradeRequest.quantity))
		await tradeRequestsCollection.updateOne({ _id: new ObjectId(tradeRequestId) }, { $set: { status: "accepted" } })
	} catch (error) {
		logger.error("Error during trade acceptance:", error)
		throw error
	}
}
// getPreviousTrades
export async function getPreviousTrades(userId: string): Promise<TradeRequest[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const tradeRequestsCollection = database.collection(tradeCollectionName)

		const tradeRequests = await tradeRequestsCollection.find({ initiatorId: userId, status: "accepted" }).toArray()

		return tradeRequests.map(doc => ({
			_id: doc._id,
			initiatorName: doc.initiatorName,
			initiatorId: doc.initiatorId,
			targetUserId: doc.targetUserId,
			item: doc.item,
			quantity: doc.quantity,
			status: doc.status,
			createdAt: doc.createdAt
		}))
	} catch (error) {
		logger.error("Error getting previous trades:", error)
		throw error
	}
}

// getactivetrades
export async function getActiveTrades(userId: string): Promise<TradeRequest[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const tradeRequestsCollection = database.collection(tradeCollectionName)

		const tradeRequests = await tradeRequestsCollection.find({ initiatorId: userId, status: "pending" }).toArray()

		return tradeRequests.map(doc => ({
			_id: doc._id,
			initiatorName: doc.initiatorName,
			initiatorId: doc.initiatorId,
			targetUserId: doc.targetUserId,
			item: doc.item,
			quantity: doc.quantity,
			status: doc.status,
			createdAt: doc.createdAt
		}))
	} catch (error) {
		logger.error("Error getting active trades:", error)
		throw error
	}
}

// reset betlimit for user
export async function resetBetLimit(userId: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { betCount: 0 } })
	} catch (error) {
		logger.error("Error resetting bet limit:", error)
		throw error
	}
}

export async function getUserActiveTechniques(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.activeTechniques : []
	} catch (error) {
		logger.error(`Error when retrieving active techniques for user with ID: ${userId}`, error)
		throw error
	}
}

// get user active heavenly techniques
export async function getUserActiveHeavenlyTechniques(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.activeheavenlytechniques : []
	} catch (error) {
		logger.error(`Error when retrieving active heavenly techniques for user with ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserActiveTechniques(userId: string, newActiveTechniques: string[]): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Remove duplicate techniques while preserving the order
		const uniqueActiveTechniques = Array.from(new Set(newActiveTechniques))

		// Limit the active techniques to a maximum of 20
		const updatedActiveTechniques = uniqueActiveTechniques.slice(0, 20)

		logger.debug(`Updating user ${userId} active techniques to: ${JSON.stringify(updatedActiveTechniques)}`)
		await usersCollection.updateOne({ id: userId }, { $set: { activeTechniques: updatedActiveTechniques } })
		logger.debug(`Successfully updated active techniques for user ${userId}.`)
	} catch (error) {
		logger.error("Error updating user active techniques:", error)
		throw error
	}
}

//
// update user active heavenly techniques if it doesnt exist create it
export async function updateUserActiveHeavenlyTechniques(
	userId: string,
	newActiveHeavenlyTechniques: string[]
): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const activeheavenlytechniques = newActiveHeavenlyTechniques.slice(0, 20)

		await usersCollection.updateOne({ id: userId }, { $set: { activeheavenlytechniques } })
	} catch (error) {
		logger.error("Error updating user active heavenly techniques:", error)
		throw error
	}
}

export async function updateGamblersData(
	userId,
	wagerAmount,
	winnings,
	losses,
	currentLimit,
	increaseLimitByPercent = 0
) {
	try {
		const DEFAULT_LIMIT = 5000000
		const MAX_LIMIT = 25000000
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		let newLimit = currentLimit > 0 ? currentLimit : DEFAULT_LIMIT
		if (increaseLimitByPercent > 0) {
			newLimit = Math.min(currentLimit * (1 + increaseLimitByPercent / 100), MAX_LIMIT)
		}

		const result = await usersCollection.updateOne({ id: userId }, [
			{
				$set: {
					"gamblersData.amountGambled": { $add: ["$gamblersData.amountGambled", wagerAmount] },
					"gamblersData.amountWon": { $add: ["$gamblersData.amountWon", winnings] },
					"gamblersData.amountLost": { $add: ["$gamblersData.amountLost", losses] },
					"gamblersData.limit": newLimit
				}
			}
		])

		if (result.modifiedCount === 1) {
			logger.info("Gamblers data updated successfully.")
		} else {
			logger.warn("User with specified ID not found for gamblers data update.")
		}
	} catch (error) {
		logger.error("Error updating gamblers data:", error)
	}
}

// get gamblers data
export async function getGamblersData(userId) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId }) // No projection

		return user ? user.gamblersData : null
	} catch (error) {
		logger.error("Error getting gamblers data:", error)
	}
}

// update user status effects array of multiple status effects
export async function updateUserStatusEffects(userId: string, statusEffects: string[]): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const effects = statusEffects.slice(0, 5)

		await usersCollection.updateOne({ id: userId }, { $set: { statusEffects: effects } })
	} catch (error) {
		logger.error("Error updating user status effects:", error)
		throw error
	}
}

// GET USER STATUSEFFECTS
export async function getUserStatusEffects(userId: string): Promise<string[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.statusEffects : []
	} catch (error) {
		logger.error(`Error when retrieving status effects for user with ID: ${userId}`, error)
		throw error
	}
}

// remove all status effects
export async function removeAllStatusEffects(userId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { statusEffects: [] } })
	} catch (error) {
		logger.error("Error removing all status effects:", error)
		throw error
	}
}

// remove all itemEffects
export async function removeAllItemEffects(userId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { itemEffects: [] } })
	} catch (error) {
		logger.error("Error removing all item effects:", error)
		throw error
	}
}

// remove certain status effect from statuseffect array
export async function removeStatusEffect(userId: string, statusEffect: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection: Collection<User> = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $pull: { statusEffects: statusEffect } })
	} catch (error) {
		logger.error("Error removing status effect:", error)
		throw error
	}
}

// update unlocked bosses string of arrays
export async function updateUserUnlockedBosses(userId: string, unlockedBosses: string[]): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { unlockedBosses } })
	} catch (error) {
		logger.error("Error updating user unlocked bosses:", error)
		throw error
	}
}

// get user unlocked bosses
export async function getUserUnlockedBosses(userId: string): Promise<string[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.unlockedBosses : []
	} catch (error) {
		logger.error(`Error when retrieving unlocked bosses for user with ID: ${userId}`, error)
		throw error
	}
}

// get users transformation
export async function getUserTransformation(userId: string): Promise<string> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.transformation : ""
	} catch (error) {
		logger.error(`Error when retrieving transformation for user with ID: ${userId}`, error)
		throw error
	}
}

// update user trasnformation
export async function updateUserTransformation(
	userId: string,
	transformationName: string,
	updateData: { transformation: string }
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: updateData })
	} catch (error) {
		logger.error("Error updating user transformation:", error)
		throw error
	}
}

// update user inateclan experience, Clan name and experience
export async function updateUserInateClanExperience(userId: string, experience: number, clan: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ id: userId },
			{
				$inc: { "inateclan.experience": experience },
				$set: { "inateclan.clan": clan }
			}
		)
	} catch (error) {
		logger.error("Error updating user inate clan experience:", error)
		throw error
	}
}

// update user inateclan with new clan, experience 0 and tier 5
export async function updateUserInateClan(userId: string, clan: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { inateclan: { clan, experience: 0, tier: 5 } } })
	} catch (error) {
		logger.error("Error updating user inate clan:", error)
		throw error
	}
}

// get user inate clan
export async function getUserInateClan(userId: string): Promise<{ clan: string; experience: number; tier: number }> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.inateclan : { clan: "", experience: 0, tier: 0 }
	} catch (error) {
		logger.error(`Error when retrieving inate clan for user with ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserUnlockedTransformations(
	userId: string,
	unlockedtransformations: string[],
	options?: any
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ id: userId },
			{ $set: { unlockedtransformations } },
			{ ...options } // Spread the options object
		)
	} catch (error) {
		logger.error("Error updating user unlocked transformations:", error)
		throw error
	}
}

// get user unlocked transformations
export async function getUserUnlockedTransformations(userId: string): Promise<string[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.unlockedtransformations : []
	} catch (error) {
		logger.error(`Error when retrieving unlocked transformations for user with ID: ${userId}`, error)
		throw error
	}
}

// update user permEffects
export async function updateUserPermEffects(userId: string, permEffects: string[]): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { permEffects } })
	} catch (error) {
		logger.error("Error updating user perm effects:", error)
		throw error
	}
}
// get user permEffects
export async function getUserPermEffects(userId: string): Promise<string[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.permEffects : []
	} catch (error) {
		logger.error(`Error when retrieving perm effects for user with ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserHonours(userId: string, honours: string[], options?: any): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { honours } }, { ...options })
	} catch (error) {
		logger.error("Error updating user honours:", error)
		throw error
	}
}
// get user honours
export async function getUserHonours(userId: string): Promise<string[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.honours : []
	} catch (error) {
		logger.error(`Error when retrieving honours for user with ID: ${userId}`, error)
		throw error
	}
}

// get lastAlertedVersion from users
export async function getLastAlertedVersion(userId: string): Promise<string> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.lastAlertedVersion : ""
	} catch (error) {
		logger.error(`Error when retrieving last alerted version for user with ID: ${userId}`, error)
		throw error
	}
}

// update lastAlertedVersion for user
export async function updateLastAlertedVersion(userId: string, version: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { lastAlertedVersion: version } })
	} catch (error) {
		logger.error("Error updating last alerted version:", error)
		throw error
	}
}

// get user item effects
export async function getUserItemEffects(
	userId: string
): Promise<{ itemName: string; effectName: string; startTime: string; endTime: string }[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.itemEffects : []
	} catch (error) {
		logger.error(`Error when retrieving item effects for user with ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserItemEffects(userId: string, itemEffect: ItemEffect): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $addToSet: { itemEffects: itemEffect } })
	} catch (error) {
		logger.error("Error adding item effect:", error)
		throw error
	}
}

// update shop items

async function updateShop(): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const shopsCollection = database.collection(shopCollectionName)
		const resetInterval = 86400000

		let shopData = await shopsCollection.findOne({})
		logger.info("Shop data:", shopData)

		const now = new Date()

		const shouldGenerateItems =
			!shopData || !shopData.nextShopReset || now.getTime() >= new Date(shopData.nextShopReset).getTime()

		if (shouldGenerateItems) {
			await resetAllUserPurchases()
			const newShopItems = await generateDailyShop()
			logger.info("New shop items:", newShopItems)

			const nextResetTimestamp = new Date(now.getTime() + resetInterval)

			if (!shopData) {
				shopData = {
					_id: new ObjectId(),
					shopItems: newShopItems,
					lastShopReset: now,
					nextShopReset: nextResetTimestamp
				}
				await shopsCollection.insertOne(shopData)
				logger.info("Shop created with items: ", shopData)
			} else {
				await shopsCollection.updateOne(
					{ _id: shopData._id },
					{
						$set: {
							shopItems: newShopItems,
							lastShopReset: now,
							nextShopReset: nextResetTimestamp
						}
					}
				)
				logger.info("Shop reset successfully with new items!")
			}
		} else {
			logger.info("Shop does not need a reset yet.")
		}
	} catch (error) {
		logger.error("Error updating shop items:", error)
		throw error
	}
}
async function generateDailyShop() {
	logger.info("shopItems length", shopItems.length)
	const dailyShopItems = []
	const numItems = 5

	if (shopItems.length === 0) {
		logger.info("No items available to add to the shop")
		return dailyShopItems
	}

	while (dailyShopItems.length < numItems) {
		const randomIndex = Math.floor(Math.random() * shopItems.length)
		const randomItem = shopItems[randomIndex]
		logger.info(`Selected item ${randomIndex}:`, randomItem)

		if (!Object.prototype.hasOwnProperty.call(randomItem, "rarity")) {
			logger.info("Selected item does not have a 'rarity' property:", randomItem)
			continue
		}

		if (randomItem.rarity !== "legendary" || Math.random() < 0.2) {
			if (!dailyShopItems.includes(randomItem)) {
				dailyShopItems.push(randomItem)
				logger.info("Item added to daily shop:", randomItem)
			}
		}
	}

	logger.info("Daily shop items generated:", dailyShopItems)
	return dailyShopItems
}

export async function getAllShopItems() {
	try {
		const database = client.db(mongoDatabase)
		const shopsCollection = database.collection(shopCollectionName)

		const shopDocuments = await shopsCollection.find({}).toArray()
		const allShopItems = shopDocuments.map(doc => doc.shopItems).flat()

		return allShopItems
	} catch (error) {
		logger.error("Error retrieving shop items:", error)
		throw error
	}
}

export async function getShopLastReset(): Promise<Date> {
	try {
		const database = client.db(mongoDatabase)
		const shopsCollection = database.collection(shopCollectionName)

		const shopData = await shopsCollection.findOne({})
		return shopData ? shopData.lastShopReset : new Date(0)
	} catch (error) {
		logger.error("Error getting shop last reset time:", error)
		throw error
	}
}

export interface Purchase {
	itemName: string
	purchasedAmount: number
}

export async function getUserPurchases(userId: string): Promise<Purchase[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.purchases : []
	} catch (error) {
		logger.error(`Error when retrieving purchases for user with ID: ${userId}`, error)
		throw error
	}
}

export async function addUserPurchases(userId: string, itemName: string, amount: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (!user) {
			logger.error(`User with ID ${userId} not found`)
			throw new Error(`User with ID ${userId} not found`)
		}

		const itemIndex = user.purchases.findIndex(p => p.itemName === itemName)

		if (itemIndex !== -1) {
			user.purchases[itemIndex].purchasedAmount += amount
		} else {
			user.purchases.push({ itemName, purchasedAmount: amount })
		}

		await usersCollection.updateOne({ id: userId }, { $set: { purchases: user.purchases } })
	} catch (error) {
		logger.error(`Error when adding purchases for user with ID: ${userId}`, error)
		throw error
	}
}

async function resetAllUserPurchases(): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const result = await usersCollection.updateMany({}, { $set: { purchases: [] } })

		logger.info(`Purchases reset for all users. Modified count: ${result.modifiedCount}`)
	} catch (error) {
		logger.error("Error resetting user purchases:", error)
		throw error
	}
}

// update user owned inate clan
export async function updateUserOwnedInateClan(userId: string, clan: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { ownedInateClan: clan } })
	} catch (error) {
		logger.error("Error updating user owned inate clan:", error)
		throw error
	}
}

// get user owned inate clan
export async function getUserOwnedInateClan(userId: string): Promise<string> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.ownedInateClan : ""
	} catch (error) {
		logger.error(`Error when retrieving owned inate clan for user with ID: ${userId}`, error)
		throw error
	}
}
// get user mentor this is a string not array
export async function getUserMentor(userId: string): Promise<string> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.mentors : ""
	} catch (error) {
		logger.error(`Error when retrieving mentor for user with ID: ${userId}`, error)
		throw error
	}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateUserMentor(userId: string, mentor: string, options?: any): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { mentors: mentor } }, { upsert: true, ...options })
	} catch (error) {
		logger.error("Error updating user mentor:", error)
		throw error
	}
}

// update user vote timestamp
export async function updateUserVoteTimestamp(userId: string, timestamp: Date): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { voteTimestamp: timestamp } })
	} catch (error) {
		logger.error("Error updating user vote timestamp:", error)
		throw error
	}
}

interface Shikigami {
	name: string
	experience: number
	health: number
	tier: number
	tamedAt: Date
	hygiene: number
	hunger: number
	friendship: number
}

// get user shikigami
export async function getUserShikigami(userId: string): Promise<Shikigami[]> {
	logger.info("getUserShikigami called with userId:", userId)

	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (user && user.shikigami) {
			return user.shikigami
		} else {
			return []
		}
	} catch (error) {
		logger.error(`Error when retrieving shikigami for user with ID: ${userId}`, error)
		throw error
	}
}

export interface UserShikigami {
	name: string
	experience: number
	health?: number
	tier: number
	tamedAt: Date
	hygiene: number
	hunger: number
	friendship: number
}

export async function updateUserShikigami(userId: string, newShikigami: UserShikigami): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })
		const existingShikigami = user?.shikigami || []

		const updatedShikigami = [...existingShikigami, newShikigami]

		await usersCollection.updateOne(
			{ id: userId },
			{
				$set: {
					shikigami: updatedShikigami
				}
			}
		)
	} catch (error) {
		logger.error("Error updating user shikigami:", error)
		throw error
	}
}

// get user unlocked mentors
export async function getUserUnlockedMentors(userId: string): Promise<string[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.unlockedmentors : []
	} catch (error) {
		logger.error(`Error when retrieving unlocked mentors for user with ID: ${userId}`, error)
		throw error
	}
}

// update shikigami health
export async function updateShikigamiHealth(userId: string, shikigamiName: string, health: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ "id": userId, "shikigami.name": shikigamiName },
			{
				$set: {
					"shikigami.$.health": health
				}
			}
		)
	} catch (error) {
		logger.error("Error updating shikigami health:", error)
		throw error
	}
}

// feedshikigami
export async function feedShikigami(userId: string, shikigamiName: string, foodAmount: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)

		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ "id": userId, "shikigami.name": shikigamiName },

			{
				$inc: {
					"shikigami.$.hunger": foodAmount
				}
			}
		)
	} catch (error) {
		logger.error("Error feeding shikigami:", error)

		throw error
	}
}

export async function decreaseShikigamiHunger(): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const hungerDecrement = 10

		await usersCollection.updateMany(
			{},
			{
				$inc: {
					"shikigami.$[elem].hunger": -hungerDecrement
				}
			},
			{
				arrayFilters: [
					{
						"elem.hunger": { $gt: hungerDecrement }
					}
				]
			}
		)
	} catch (error) {
		logger.error("Error decreasing shikigami hunger:", error)
		throw error
	}
}

export async function decreaseShikigamiHygiene(): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const hygieneDecrement = 10

		await usersCollection.updateMany(
			{},
			{
				$inc: {
					"shikigami.$[elem].hygiene": -hygieneDecrement
				}
			},
			{
				arrayFilters: [
					{
						"elem.hygiene": { $gt: hygieneDecrement }
					}
				]
			}
		)
	} catch (error) {
		logger.error("Error decreasing shikigami hygiene:", error)
		throw error
	}
}
// cleanShikigami
export async function cleanShikigami(userId: string, shikigamiName: string, hygieneAmount: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ "id": userId, "shikigami.name": shikigamiName },
			{
				$inc: {
					"shikigami.$.hygiene": hygieneAmount
				}
			}
		)
	} catch (error) {
		logger.error("Error cleaning shikigami:", error)
		throw error
	}
}

// increasebond
export async function increaseBond(userId: string, shikigamiName: string, friendshipAmount: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ "id": userId, "shikigami.name": shikigamiName },
			{
				$inc: {
					"shikigami.$.friendship": friendshipAmount
				}
			}
		)
	} catch (error) {
		logger.error("Error increasing bond with shikigami:", error)
		throw error
	}
}

//healshikigami
export async function healShikigami(userId: string, shikigamiName: string, healthAmount: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ "id": userId, "shikigami.name": shikigamiName },
			{
				$inc: {
					"shikigami.$.health": healthAmount
				}
			}
		)
	} catch (error) {
		logger.error("Error healing shikigami:", error)
		throw error
	}
}

// update user vote time
export async function updateUserVoteTime(userId: string, voteTime: Date): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { voteTime } })
	} catch (error) {
		logger.error("Error updating user vote time:", error)
		throw error
	}
}
// get user vote time
export async function getUserVoteTime(userId: string): Promise<Date> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.voteTime : new Date(0)
	} catch (error) {
		logger.error(`Error when retrieving vote time for user with ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserFavoriteCommand(userId: string, commandName: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (!user || !user.stats) {
			logger.error(`User with ID ${userId} not found`)
			throw new Error(`User with ID ${userId} not found`)
		}

		const favoriteCommandsIndex = user.stats.findIndex(stat =>
			Object.prototype.hasOwnProperty.call(stat, "favoriteCommands")
		)

		if (favoriteCommandsIndex !== -1) {
			const currentFavoriteCommands = user.stats[favoriteCommandsIndex].favoriteCommands || {}
			const currentCount = currentFavoriteCommands[commandName] || 0
			const updatedCount = currentCount + 1

			const updatedFavoriteCommands = { ...currentFavoriteCommands, [commandName]: updatedCount }

			const updatedStats = [...user.stats]
			updatedStats[favoriteCommandsIndex] = { favoriteCommands: updatedFavoriteCommands }

			await usersCollection.updateOne({ id: userId }, { $set: { stats: updatedStats } })
		} else {
			const updatedStats = [...user.stats, { favoriteCommands: { [commandName]: 1 } }]

			await usersCollection.updateOne({ id: userId }, { $set: { stats: updatedStats } })
		}
	} catch (error) {
		logger.error(`Error when adding favorite command for user with ID: ${userId}`, error)
		throw error
	}
}

export async function getUserFavouriteCommand(userId) {
	try {
		const userStats = await getUserStats(userId)
		const favoriteCommandsData = userStats.stats.find(stat => stat.favoriteCommands)
		if (!favoriteCommandsData) return { command: "No favorite command yet", count: 0 }

		let maxCount = 0
		let favoriteCommand = null

		for (const command in favoriteCommandsData.favoriteCommands) {
			const count = favoriteCommandsData.favoriteCommands[command]
			if (count > maxCount) {
				maxCount = count
				favoriteCommand = command
			}
		}

		return favoriteCommand
			? { command: favoriteCommand, count: maxCount }
			: { command: "No favorite command yet", count: 0 }
	} catch (error) {
		logger.error(`Error retrieving favorite command for user ${userId}:`, error)
		throw error
	}
}

// get user favourite technique name and count
export async function getUserFavouriteTechnique(userId: string): Promise<{ technique: string; count: number }[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.stats : []
	} catch (error) {
		logger.error(`Error when retrieving favourite technique for user with ID: ${userId}`, error)
		throw error
	}
}

// get all stats for user
export async function getUserStats(userId: string) {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })

		if (user && user.stats && user.stats.length > 0) {
			const totalTechniques = user.stats.reduce((total, stat) => {
				if (stat.technique) {
					return total + stat.count
				}
				return total
			}, 0)

			const totalCommandsUsedStat = user.stats.find(stat => stat.totalCommandsUsed !== undefined)
			const totalCommandsUsed = totalCommandsUsedStat ? totalCommandsUsedStat.totalCommandsUsed : 0

			const totalFightsWon = user.stats.reduce((total, stat) => {
				if (stat.totalFightsWon) {
					return total + stat.totalFightsWon
				}
				return total
			}, 0)

			const monthlyFightsWonStat = user.stats.find(stat => stat.monthlyFightsWon !== undefined)
			const monthlyFightsWon = monthlyFightsWonStat ? monthlyFightsWonStat.monthlyFightsWon : 0

			const favoriteTechData = user.stats.filter(stat => stat.technique)
			const favoriteCommands = user.stats.find(stat => stat.favoriteCommands)?.favoriteCommands || {}

			return {
				stats: user.stats,
				totalTechniques,
				totalCommandsUsed,
				totalFightsWon,
				monthlyFightsWon,
				favoriteTechData,
				favoriteCommands
			}
		}

		return {
			stats: [],
			totalTechniques: 0,
			totalCommandsUsed: 0,
			totalFightsWon: 0,
			monthlyFightsWon: 0,
			favoriteTechData: [],
			favoriteCommands: {}
		}
	} catch (error) {
		logger.error("Error retrieving user stats:", error)
		return {
			stats: [],
			totalTechniques: 0,
			totalCommandsUsed: 0,
			totalFightsWon: 0,
			monthlyFightsWon: 0,
			favoriteTechData: [],
			favoriteCommands: {}
		}
	}
}

export async function updateMonthlyFightsWon(userId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (user && user.stats) {
			const monthlyFightsWonStat = user.stats.find(stat => stat.monthlyFightsWon !== undefined)

			if (monthlyFightsWonStat) {
				const updatedMonthlyFightsWon = monthlyFightsWonStat.monthlyFightsWon + 1

				await usersCollection.updateOne(
					{ "id": userId, "stats.monthlyFightsWon": monthlyFightsWonStat.monthlyFightsWon },
					{ $set: { "stats.$[elem].monthlyFightsWon": updatedMonthlyFightsWon } },
					{ arrayFilters: [{ "elem.monthlyFightsWon": { $exists: true } }] }
				)
			} else {
				await usersCollection.updateOne({ id: userId }, { $push: { stats: { monthlyFightsWon: 1 } } })
			}
		} else {
			await usersCollection.updateOne(
				{ id: userId },
				{ $set: { stats: [{ monthlyFightsWon: 1 }] } },
				{ upsert: true }
			)
		}
	} catch (error) {
		logger.error(`Error when updating monthly fights won for user with ID: ${userId}`, error)
		throw error
	}
}

export async function getUserMonthlyFightsWon(userId: string): Promise<number> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (user && user.stats) {
			const monthlyFightsWonStat = user.stats.find(stat => stat.monthlyFightsWon !== undefined)
			return monthlyFightsWonStat ? monthlyFightsWonStat.monthlyFightsWon : 0
		}

		return 0
	} catch (error) {
		logger.error(`Error when retrieving monthly fights won for user with ID: ${userId}`, error)
		throw error
	}
}

export async function resetMonthlyFightsWon(): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		await usersCollection.updateMany(
			{ "stats.monthlyFightsWon": { $exists: true } },
			{ $set: { "stats.$[elem].monthlyFightsWon": 0 } },
			{ arrayFilters: [{ "elem.monthlyFightsWon": { $exists: true } }] }
		)
	} catch (error) {
		logger.error("Error when resetting monthly fights won", error)
		throw error
	}
}

export async function getMonthlyFightsWonLeaderboard(): Promise<{ userId: string; monthlyFightsWon: number }[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const users = await usersCollection.find({ "stats.monthlyFightsWon": { $exists: true } }).toArray()

		const leaderboard = users.map(user => {
			const monthlyFightsWonStat = user.stats.find(stat => stat.monthlyFightsWon !== undefined)
			const monthlyFightsWon = monthlyFightsWonStat ? monthlyFightsWonStat.monthlyFightsWon : 0
			return { userId: user.id, monthlyFightsWon }
		})

		return leaderboard
	} catch (error) {
		logger.error("Error when retrieving monthly fights won leaderboard", error)
		throw error
	}
}
// update total commands used
export async function updateUserCommandsUsed(userId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (!user) {
			logger.error(`User with ID ${userId} not found`)
			throw new Error(`User with ID ${userId} not found`)
		}

		const commandsIndex = user.stats.findIndex(s => s.totalCommandsUsed)

		if (commandsIndex !== -1) {
			user.stats[commandsIndex].totalCommandsUsed++
		} else {
			user.stats.push({ totalCommandsUsed: 1 })
		}

		await usersCollection.updateOne({ id: userId }, { $set: { stats: user.stats } })
	} catch (error) {
		logger.error(`Error when adding commands used for user with ID: ${userId}`, error)
		throw error
	}
}

// update total amount worked
export async function updateUserWorked(userId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (!user) {
			logger.error(`User with ID ${userId} not found`)
			throw new Error(`User with ID ${userId} not found`)
		}

		const workedIndex = user.stats.findIndex(s => s.totalWorked)

		if (workedIndex !== -1) {
			user.stats[workedIndex].totalWorked++
		} else {
			user.stats.push({ totalWorked: 1 })
		}

		await usersCollection.updateOne({ id: userId }, { $set: { stats: user.stats } })
	} catch (error) {
		logger.error(`Error when adding worked for user with ID: ${userId}`, error)
		throw error
	}
}

// get user total worked
export async function getUserWorked(userId: string): Promise<number> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })

		if (user && user.stats && user.stats.length > 0) {
			const workedStat = user.stats.find(stat => Object.prototype.hasOwnProperty.call(stat, "totalWorked"))
			return workedStat ? workedStat.totalWorked : 0
		}

		return 0
	} catch (error) {
		logger.error(`Error when retrieving worked for user with ID: ${userId}`, error)
		throw error
	}
}
// update user favourite technique name and count
export async function updateUserFavouriteTechnique(userId: string, techniqueName: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (!user) {
			logger.error(`User with ID ${userId} not found`)
			throw new Error(`User with ID ${userId} not found`)
		}

		const techniqueIndex = user.stats.findIndex(s => s.technique === techniqueName)

		if (techniqueIndex !== -1) {
			user.stats[techniqueIndex].count++
		} else {
			user.stats.push({ technique: techniqueName, count: 1 })
		}

		await usersCollection.updateOne({ id: userId }, { $set: { stats: user.stats } })
	} catch (error) {
		logger.error(`Error when adding favourite technique for user with ID: ${userId}`, error)
		throw error
	}
}

// update user fights won count
export async function updateUserFightsWon(userId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		if (!user) {
			logger.error(`User with ID ${userId} not found`)
			throw new Error(`User with ID ${userId} not found`)
		}

		const fightsWonIndex = user.stats.findIndex(s => s.totalFightsWon)

		if (fightsWonIndex !== -1) {
			user.stats[fightsWonIndex].totalFightsWon++
		} else {
			user.stats.push({ totalFightsWon: 1 })
		}

		await usersCollection.updateOne({ id: userId }, { $set: { stats: user.stats } })
	} catch (error) {
		logger.error(`Error when adding fights won for user with ID: ${userId}`, error)
		throw error
	}
}

// get user fights won count
export async function getUserFightsWon(userId: string): Promise<number> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.stats.fightsWon : 0
	} catch (error) {
		logger.error(`Error when retrieving fights won for user with ID: ${userId}`, error)
		throw error
	}
}

// get user registered date
export async function getUserRegisteredDate(userId: string): Promise<Date | null> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })
		return user ? new Date(user.registered) : null
	} catch (error) {
		logger.error(`Error when retrieving registered date for user with ID: ${userId}`, error)
		throw error
	}
}

export async function updateUserProfileImage(userId: string, imageUrl: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ id: userId },
			{
				$set: {
					profileImage: imageUrl
				}
			}
		)
	} catch (error) {
		logger.error("Error updating user profile image:", error)
		throw error
	}
}
// update user profile header
export async function updateUserProfileHeader(userId: string, imageUrl: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ id: userId },
			{
				$set: {
					profileHeader: imageUrl
				}
			}
		)
	} catch (error) {
		logger.error("Error updating user profile header:", error)
		throw error
	}
}

// get user profile image
export async function getUserProfileImage(userId: string): Promise<string> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.profileImage : ""
	} catch (error) {
		logger.error(`Error when retrieving profile image for user with ID: ${userId}`, error)
		throw error
	}
}

// get user profile header
export async function getUserProfileHeader(userId: string): Promise<string> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.profileHeader : ""
	} catch (error) {
		logger.error(`Error when retrieving profile header for user with ID: ${userId}`, error)
		throw error
	}
}

// log image url
export async function logImageUrl(imageUrl: string, userId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		await logsCollection.insertOne({
			userId,
			imageUrl,
			timestamp: new Date(),
			reviewerId: null,
			reviewed: false
		})
	} catch (error) {
		logger.error("Error logging image URL:", error)
	}
}

export async function getImageUrl(userId: string): Promise<string> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		const image = await logsCollection.findOne({ userId })
		return image ? image.imageUrl : ""
	} catch (error) {
		logger.error("Error getting image URL:", error)
		throw error
	}
}
// getUserIdByImageUrl
export async function getUserIdByImageUrl(imageUrl: string): Promise<string | null> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		const result = await logsCollection.findOne({ imageUrl })
		return result?.userId || null
	} catch (error) {
		logger.error("Error fetching user ID by image URL:", error)
		return null
	}
}

// update cooldowns array add new object
export async function updateUserCooldowns(userId: string, operation: string, jobName?: string): Promise<void> {
	try {
		client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		if (operation === "profileChange") {
			const user = await usersCollection.findOne({ id: userId })

			if (user) {
				const cooldown = user.cooldowns.find(cd => cd.type === "profileChangeCooldown")

				if (cooldown) {
					if (cooldown.currentUsed < 3) {
						await usersCollection.updateOne(
							{ "id": userId, "cooldowns.type": "profileChangeCooldown" },
							{ $inc: { "cooldowns.$.currentUsed": 1 } }
						)
					}
				} else {
					await usersCollection.updateOne(
						{ id: userId },
						{ $push: { cooldowns: { type: "profileChangeCooldown", currentUsed: 1, maxAllowed: 3 } } }
					)
				}
			}
		} else if (operation === "workCooldown") {
			if (jobName) {
				const user = await usersCollection.findOne({ id: userId })

				if (user) {
					const cooldown = user.cooldowns.find(cd => cd.type === `workCooldown_${jobName}`)

					if (cooldown) {
						await usersCollection.updateOne(
							{ "id": userId, "cooldowns.type": `workCooldown_${jobName}` },
							{ $set: { "cooldowns.$.lastUsed": new Date() } }
						)
					} else {
						const job = jobs.find(job => job.name === jobName)
						if (job) {
							await usersCollection.updateOne(
								{ id: userId },
								{
									$push: {
										cooldowns: {
											type: `workCooldown_${jobName}`,
											lastUsed: new Date(),
											duration: job.cooldown
										}
									}
								}
							)
						}
					}
				}
			}
		} else if (operation === "questCooldown") {
			const user = await usersCollection.findOne({ id: userId })

			if (user) {
				const cooldown = user.cooldowns.find(cd => cd.type === "questCooldown")

				if (cooldown) {
					await usersCollection.updateOne(
						{ "id": userId, "cooldowns.type": "questCooldown" },
						{ $set: { "cooldowns.$.lastUsed": new Date() } }
					)
				} else {
					await usersCollection.updateOne(
						{ id: userId },
						{
							$push: {
								cooldowns: {
									type: "questCooldown",
									lastUsed: new Date(),
									duration: 24 * 60 * 60 * 1000
								}
							}
						}
					)
				}
			}
		} else if (operation === "dailyCooldown") {
			const user = await usersCollection.findOne({ id: userId })

			if (user) {
				const cooldown = user.cooldowns.find(cd => cd.type === "dailyCooldown")

				if (cooldown) {
					await usersCollection.updateOne(
						{ "id": userId, "cooldowns.type": "dailyCooldown" },
						{ $set: { "cooldowns.$.lastUsed": new Date() } }
					)
				} else {
					await usersCollection.updateOne(
						{ id: userId },
						{
							$push: {
								cooldowns: {
									type: "dailyCooldown",
									lastUsed: new Date(),
									duration: 24 * 60 * 60 * 1000
								}
							}
						}
					)
				}
			}
		} else if (operation === "searchCooldown") {
			const user = await usersCollection.findOne({ id: userId })

			if (user) {
				const cooldown = user.cooldowns.find(cd => cd.type === "searchCooldown")

				if (cooldown) {
					await usersCollection.updateOne(
						{ "id": userId, "cooldowns.type": "searchCooldown" },
						{ $set: { "cooldowns.$.lastUsed": new Date() } }
					)
				} else {
					await usersCollection.updateOne(
						{ id: userId },
						{
							$push: {
								cooldowns: {
									type: "searchCooldown",
									lastUsed: new Date(),
									duration: 60000
								}
							}
						}
					)
				}
			}
		}
	} catch (error) {
		logger.error("Error updating user cooldowns:", error)
		throw error
	}
}

// reset profileChangeCooldown for all users
export async function resetProfileChangeCooldown(): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateMany(
			{ "cooldowns.type": "profileChangeCooldown" },
			{ $set: { "cooldowns.$.currentUsed": 0 } }
		)
	} catch (error) {
		logger.error("Error resetting profile change cooldown:", error)
		throw error
	}
}

let nextDailyResetTimestamp = getTimestampForTodayAt4PM()

function getTimestampForTodayAt4PM() {
	const now = new Date()
	const today4PM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0)
	return Math.floor(today4PM.getTime() / 1000)
}

// get specified cooldown
export async function checkProfileChangeCooldown(
	userId: string
): Promise<{ limitReached: boolean; nextResetTimestamp: number | null }> {
	const database = client.db(mongoDatabase)
	const usersCollection = database.collection(usersCollectionName)

	try {
		const user = await usersCollection.findOne({ id: userId })
		if (user && user.cooldowns) {
			const cooldown = user.cooldowns.find(cd => cd.type === "profileChangeCooldown")
			if (cooldown) {
				if (cooldown.currentUsed >= 3) {
					const now = new Date()

					if (now.getTime() / 1000 >= nextDailyResetTimestamp) {
						nextDailyResetTimestamp = getTimestampForTodayAt4PM()
					}

					return {
						limitReached: true,
						nextResetTimestamp: nextDailyResetTimestamp
					}
				}
			}
		}
		return { limitReached: false, nextResetTimestamp: null }
	} catch (error) {
		logger.error("Error checking cooldown:", error)
		throw error
	}
}

export async function checkWorkCooldown(
	userId: string,
	jobName: string
): Promise<{ limitReached: boolean; nextResetTimestamp: number | null }> {
	const database = client.db(mongoDatabase)
	const usersCollection = database.collection<User>(usersCollectionName)

	try {
		const user = await usersCollection.findOne({ id: userId })

		if (user && user.cooldowns) {
			const cooldown = user.cooldowns.find(cd => cd.type === `workCooldown_${jobName}`)

			if (cooldown) {
				const now = new Date()
				const nextResetTimestamp = Math.floor(cooldown.lastUsed.getTime() + cooldown.duration)

				if (now.getTime() < nextResetTimestamp) {
					return {
						limitReached: true,
						nextResetTimestamp: nextResetTimestamp
					}
				}
			}
		}

		return { limitReached: false, nextResetTimestamp: null }
	} catch (error) {
		logger.error("Error checking work cooldown:", error)
		throw error
	}
}

export async function updateUserWorkCooldown(userId: string, cooldownDuration: number): Promise<void> {
	const database = client.db(mongoDatabase)
	const usersCollection = database.collection(usersCollectionName)

	try {
		await usersCollection.updateOne(
			{ id: userId },
			{
				$set: {
					"cooldowns.$[elem].lastUsed": new Date(),
					"cooldowns.$[elem].duration": cooldownDuration
				}
			},
			{
				arrayFilters: [
					{
						"elem.type": "workCooldown"
					}
				]
			}
		)
	} catch (error) {
		logger.error("Error updating work cooldown:", error)
		throw error
	}
}

// update techniques used
export async function getImageUrlAndUserIdByReviewerId(
	reviewerId: string
): Promise<{ userId: string | null; imageUrl: string | null }> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		const result = await logsCollection.findOne({ reviewerId })
		return {
			userId: result?.userId || null,
			imageUrl: result?.imageUrl || null
		}
	} catch (error) {
		logger.error("Error fetching user ID and image URL by reviewer ID:", error)
		return { userId: null, imageUrl: null }
	}
}

export async function getImageUrlAndUserIdByImageUrl(
	imageUrl: string
): Promise<{ userId: string | null; imageUrl: string | null }> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		const result = await logsCollection.findOne({ imageUrl })
		return {
			userId: result?.userId || null,
			imageUrl: result?.imageUrl || null
		}
	} catch (error) {
		logger.error("Error fetching user ID and image URL:", error)
		return { userId: null, imageUrl: null }
	}
}

export async function updateReviewerIdAndStatus(
	imageUrl: string,
	reviewerId: string,
	reviewed: boolean
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		await logsCollection.updateOne({ imageUrl }, { $set: { reviewerId, reviewed } })
	} catch (error) {
		logger.error("Error updating reviewer ID and review status:", error)
	}
}

export async function getImageUrlByReviewerId(reviewerId: string): Promise<string | null> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		const result = await logsCollection.findOne({ reviewerId })
		return result?.imageUrl || null
	} catch (error) {
		logger.error("Error fetching image URL by reviewer ID:", error)
		return null
	}
}

export async function updateReviewStatus(imageUrl: string, reviewed: boolean): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		await logsCollection.updateOne({ imageUrl }, { $set: { reviewed } })
	} catch (error) {
		logger.error("Error updating review status:", error)
	}
}

export async function getImageUrlByUserId(userId: string): Promise<string | null> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		const result = await logsCollection.findOne({ userId, reviewed: false })
		return result?.imageUrl || null
	} catch (error) {
		logger.error("Error fetching image URL by user ID:", error)
		return null
	}
}

export async function updateReviewerId(imageUrl: string, reviewerId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const logsCollection = database.collection(imageCollectionName)
		await logsCollection.updateOne({ imageUrl }, { $set: { reviewerId } })
	} catch (error) {
		logger.error("Error updating reviewer ID:", error)
	}
}

// update user awakening
export async function updateUserAwakening(userId: string, awakening: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { awakening } })
	} catch (error) {
		logger.error("Error updating user awakening:", error)
		throw error
	}
}

// get user awakening if it doesnt exist return null
export async function getUserAwakening(userId: string): Promise<string | null> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.awakening : null
	} catch (error) {
		logger.error(`Error when retrieving awakening for user with ID: ${userId}`, error)
		throw error
	}
}

export async function markStageAsMessaged(userId: string, awakeningStage: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateOne(
			{ id: userId },
			{ $addToSet: { stagesMessaged: awakeningStage } }
		)

		if (updateResult.matchedCount === 0) {
			logger.info(`No user found with ID: ${userId}`)
		} else if (updateResult.modifiedCount === 0) {
			logger.info(`User with ID: ${userId} was not updated (possibly already marked this stage).`)
		} else {
			logger.info(`Stage "${awakeningStage}" marked as messaged for user with ID: ${userId}.`)
		}
	} catch (error) {
		logger.error(`Error marking stage as messaged for user with ID: ${userId}`, error)
		throw error
	}
}

interface CommunityQuest {
	questName: string
	questDescription: string
	task: string
	taskAmount: number
	currentProgress: number
	rewardItem: string
	rewardAmount: number
	startDate: Date
	endDate: Date
}

export async function checkStageMessaged(userId: string, awakeningStage: string): Promise<boolean> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId, stagesMessaged: { $in: [awakeningStage] } })
		return !!user
	} catch (error) {
		logger.error(`Error checking if stage has been messaged for user with ID: ${userId}`, error)
		throw error
	}
}

export async function createCommunityQuest(questData: CommunityQuest): Promise<void> {
	await client.connect()
	const database = client.db(mongoDatabase)
	const communityQuestsCollection = database.collection(communityQuestsCollectionName)
	await communityQuestsCollection.insertOne(questData)
}

// get current community quest name
export async function getCurrentCommunityQuestName(): Promise<string | null> {
	try {
		const quest = await getCurrentCommunityQuest()
		return quest ? quest.questName : null
	} catch (error) {
		logger.error("Error retrieving current community quest name:", error)
		return null
	}
}

export async function getCurrentCommunityQuest(): Promise<CommunityQuest | null> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const communityQuestsCollection = database.collection<CommunityQuest>(communityQuestsCollectionName)
		const currentDate = new Date()
		const quest = await communityQuestsCollection.findOne({
			startDate: { $lte: currentDate },
			endDate: { $gte: currentDate }
		})
		return quest
	} catch (error) {
		logger.error("Error retrieving current community quest:", error)
		return null
	}
}

export async function updateCommunityQuestProgress(questName: string, progress: number): Promise<void> {
	await client.connect()
	const database = client.db(mongoDatabase)
	const communityQuestsCollection = database.collection<CommunityQuest>(communityQuestsCollectionName)
	await communityQuestsCollection.updateOne({ questName }, { $inc: { currentProgress: progress } })
}

export async function createGiveaway(
	guildId: string,
	channelId: string,
	messageId: string,
	prize: string,
	winners: number,
	endDate: Date,
	isPrizeItem: boolean,
	itemQuantity: number,
	prizeAmount: number,
	giveawayMessageId: string
): Promise<void> {
	await client.connect()
	const database = client.db(mongoDatabase)
	const giveawaysCollection = database.collection(giveawayCollectionName)

	await giveawaysCollection.insertOne({
		guildId,
		channelId,
		messageId,
		prize,
		winners,
		endDate,
		isPrizeItem,
		winnerId: "",
		entries: [],
		itemQuantity,
		prizeAmount,
		giveawayMessageId
	})

	// Schedule a task to end the giveaway and select the winner
	setTimeout(async () => {
		await handleGiveawayEnd(guildId, channelId, messageId)
	}, endDate.getTime() - Date.now())
}

export async function getCurrentRaidBoss(): Promise<RaidBoss | null> {
	try {
		const database = client.db(mongoDatabase)
		const raidBossesCollection = database.collection<RaidBoss>(raidBossesCollectionName)

		const currentDate = new Date()

		const raidBoss = await raidBossesCollection.findOne({
			startDate: { $lte: currentDate },
			endDate: { $gte: currentDate }
		})

		return raidBoss || null
	} catch (error) {
		logger.error("Error retrieving current raid boss:", error)
		return null
	}
}

// updateRaidBoss
export async function updateRaidBoss(
	bossName: string,
	grade: string,
	awakeningStage: string,
	globalHealth: number
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const raidBossesCollection = database.collection<RaidBoss>(raidBossesCollectionName)

		const currentDate = new Date()
		const endDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)

		await raidBossesCollection.updateOne(
			{ name: bossName },
			{
				$set: {
					grade,
					awakeningStage,
					globalHealth,
					startDate: currentDate,
					endDate
				}
			},
			{ upsert: true }
		)
	} catch (error) {
		logger.error("Error updating raid boss:", error)
		throw error
	}
}

export interface RaidBoss {
	_id: string
	name: string
	grade: string
	awakeningStage: string
	globalHealth: number
	current_health: number
	imageUrl: string
	startDate: Date
	endDate: Date
	levelRequirement: number
	description: string
	fugaThreshold: number // Health threshold for triggering Fuga
	phases: {
		name: string
		health: number
		gif: string
	}[]
}

interface Participant {
	id: string
	totalDamage: number
}

export interface RaidInstance {
	_id: ObjectId
	raidBossId: string
	participants: ParticipantInfo[]
	currentHealth: number
	createdAt: Date
}
export async function isUserParticipatingInRaid(userId: string): Promise<boolean> {
	try {
		const database = client.db(mongoDatabase)
		const raidInstancesCollection = database.collection<RaidInstance>(raidInstancesCollectionName)

		const raidInstance = await raidInstancesCollection.findOne({
			"participants.id": userId
		})

		return !!raidInstance
	} catch (error) {
		logger.error("Error checking if user is participating in raid:", error)
		throw error
	}
}

export async function getRaidBossDetails(bossName: string): Promise<RaidBoss | null> {
	try {
		const database = client.db(mongoDatabase)
		const raidBossesCollection = database.collection<RaidBoss>(raidBossesCollectionName)

		const raidBoss = await raidBossesCollection.findOne({ name: bossName })

		return raidBoss || null
	} catch (error) {
		logger.error("Error retrieving raid boss details:", error)
		return null
	}
}

export async function addUserToRaidParticipants(userId: string, raidInstanceId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const raidInstancesCollection = database.collection<RaidInstance>(raidInstancesCollectionName)

		const participant: ParticipantInfo = { id: userId, totalDamage: 0 }

		await raidInstancesCollection.updateOne(
			{ _id: new ObjectId(raidInstanceId) },
			{ $addToSet: { participants: participant } }
		)
	} catch (error) {
		logger.error("Error adding user to raid participants:", error)
		throw error
	}
}

// updateRaidBossHealthForParty
export async function updateRaidBossHealthForParty(raidInstanceId: string, health: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const raidInstancesCollection = database.collection<RaidInstance>(raidInstancesCollectionName)

		await raidInstancesCollection.updateOne(
			{ _id: new ObjectId(raidInstanceId) },
			{ $set: { currentHealth: health } }
		)
	} catch (error) {
		logger.error("Error updating raid boss health for party:", error)
		throw error
	}
}

export async function createRaidParty(raidBossId: string, participants: string[]): Promise<RaidParty | null> {
	try {
		const database = client.db(mongoDatabase)
		const raidPartiesCollection = database.collection<RaidParty>("raidParties")

		const raidBoss: RaidBoss | null = await getRaidBossDetails(raidBossId)

		if (!raidBoss) {
			throw new Error("Raid boss not found")
		}

		const participantsInfo: Participant[] = participants.map(id => ({ id, totalDamage: 0 }))

		const raidParty: RaidParty = {
			raidBossId,
			participants: participantsInfo,
			partyHealth: 50000,
			pendingActions: [],
			createdAt: new Date()
		}

		const result = await raidPartiesCollection.insertOne(raidParty)
		const insertedRaidParty = await raidPartiesCollection.findOne({ _id: result.insertedId })

		return insertedRaidParty
	} catch (error) {
		logger.error("Error creating raid party:", error)
		return null
	}
}

export interface RaidParty {
	_id?: ObjectId
	raidBossId: string
	participants: ParticipantInfo[]
	deadParticipants?: string[]
	partyHealth: number
	pendingActions: PendingAction[]
	createdAt: Date
}

export interface ParticipantInfo {
	id: string
	totalDamage: number
}

export interface PendingAction {
	userId: string
	technique: string
	damage: number
}

export async function resolveRaidActions(raidPartyId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const raidPartiesCollection = database.collection<RaidParty>("raidParties")

		const raidParty = await raidPartiesCollection.findOne({ _id: new ObjectId(raidPartyId) })

		if (!raidParty) {
			throw new Error("Raid party not found")
		}

		const resolvedActions: PendingAction[] = []

		for (const action of raidParty.pendingActions) {
			const damage = Math.floor(Math.random() * 100) + 1
			resolvedActions.push({ ...action, damage })
		}

		await raidPartiesCollection.updateOne(
			{ _id: new ObjectId(raidPartyId) },
			{ $set: { pendingActions: resolvedActions } }
		)
	} catch (error) {
		logger.error("Error resolving raid actions:", error)
		throw error
	}
}

export async function updateRaidPartyPendingActions(raidPartyId, pendingActions) {
	const database = client.db(mongoDatabase)
	const raidPartiesCollection = database.collection<RaidParty>("raidParties")

	await raidPartiesCollection.updateOne({ _id: new ObjectId(raidPartyId) }, { $set: { pendingActions } })
}

export async function getRaidInstanceByUser(userId: string): Promise<RaidInstance | null> {
	try {
		const database = client.db(mongoDatabase)
		const raidInstancesCollection = database.collection<RaidInstance>(raidInstancesCollectionName)

		const raidInstance = await raidInstancesCollection.findOne({
			"participants.id": userId
		})

		return raidInstance || null
	} catch (error) {
		logger.error("Error retrieving raid instance by user:", error)
		return null
	}
}
// remove raid party pending actions
export async function removeRaidPartyPendingActions(raidPartyId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const raidPartiesCollection = database.collection<RaidParty>("raidParties")

		await raidPartiesCollection.updateOne({ _id: new ObjectId(raidPartyId) }, { $set: { pendingActions: [] } })
	} catch (error) {
		logger.error("Error removing raid party pending actions:", error)
		throw error
	}
}

export async function handleRaidBossDefeat(
	interaction: CommandInteraction,
	raidParty: RaidParty,
	raidBossDetails: RaidBoss
) {
	const database = client.db(mongoDatabase)
	const raidPartiesCollection = database.collection<RaidParty>("raidParties")

	const totalDamage = raidParty.participants.reduce((sum, participant) => sum + participant.totalDamage, 0)
	const participantDrops: { [participantId: string]: { drops: RaidDrops[]; raidTokens: number } } = {}

	for (const participant of raidParty.participants) {
		const { id, totalDamage: participantDamage } = participant
		const damagePercentage = (participantDamage / totalDamage) * 100
		const drops: RaidDrops[] = []
		const raidTokens = Math.floor(Math.random() * (30 - 20 + 1) + 20)

		try {
			const drop = getRaidBossDrop(raidBossDetails.name)
			if (drop) {
				const adjustedDropRate = Math.min(drop.dropRate * (1 + damagePercentage / 100), 1)
				drops.push({ ...drop, dropRate: adjustedDropRate })
			}
		} catch (error) {
			console.error(`Error getting drop for raid boss ${raidBossDetails.name}:`, error)
		}

		participantDrops[id] = { drops, raidTokens }

		for (const drop of drops) {
			try {
				await addItemToUserInventory(id, drop.name, 1)
				await addItemToUserInventory(id, "Raid Token", raidTokens)

				if (drop.name === "Heian Era Awakening") {
					const userUnlockedTransformations = await getUserUnlockedTransformations(id)
					const updatedUnlockedTransformations = [...userUnlockedTransformations, "Heian Era Awakening"]
					await updateUserUnlockedTransformations(id, updatedUnlockedTransformations)
				}
			} catch (error) {
				console.error(`Error adding item to user inventory for user ${id}:`, error)
			}
		}
	}

	const specialDropClaimed = await checkSpecialDropClaimed(raidBossDetails.name)

	if (!specialDropClaimed) {
		const randomNumber = Math.random()
		const specialDropChance = 0.001

		if (randomNumber <= specialDropChance) {
			const luckyParticipant = raidParty.participants[Math.floor(Math.random() * raidParty.participants.length)]
			const specialDrop = "Nah I'd Lose"

			try {
				await addUserTechnique(luckyParticipant.id, specialDrop)
				await markSpecialDropAsClaimed(raidBossDetails.name)

				participantDrops[luckyParticipant.id].drops.push({
					name: specialDrop,
					rarity: "Special",
					dropRate: 0.1
				})

				const luckyUser = await client1.users.fetch(luckyParticipant.id)
				const channelId = "1239327615379308677"
				const channel = await client1.channels.fetch(channelId)
				if (channel && channel.isTextBased()) {
					await channel.send(
						`Congratulations! ${luckyUser.toString()} has obtained the special drop "Nah I'd Lose"!`
					)
				}
			} catch (error) {
				console.error(`Error adding special drop to user techniques for user ${luckyParticipant.id}:`, error)
			}
		}
	}

	await raidPartiesCollection.deleteOne({ _id: new ObjectId(raidParty._id) })

	const victoryEmbed = new EmbedBuilder()
		.setColor("#00ff00")
		.setTitle("Raid Victory!")
		.setDescription(`Congratulations! You have defeated ${raidBossDetails.name}.`)

	for (const participant of raidParty.participants) {
		const { drops, raidTokens } = participantDrops[participant.id]

		// Group drops by rarity
		const groupedDrops: { [rarity: string]: RaidDrops[] } = {}
		for (const drop of drops) {
			if (!groupedDrops[drop.rarity]) {
				groupedDrops[drop.rarity] = []
			}
			groupedDrops[drop.rarity].push(drop)
		}

		const user = await client1.users.fetch(participant.id)
		const userMention = `${user.username}#${user.discriminator}`

		const fieldValue =
			Object.entries(groupedDrops)
				.map(([rarity, drops]) => {
					const dropsString = drops
						.map(drop => `${drop.name} (${(drop.dropRate * 100).toFixed(2)}%)`)
						.join(", ")
					return `${rarity}: ${dropsString}`
				})
				.join("\n") || "No drops"

		victoryEmbed.addFields(
			{
				name: `Rewards for ${userMention}`,
				value: fieldValue,
				inline: false
			},
			{
				name: "Raid Tokens Earned",
				value: `${raidTokens}`,
				inline: true
			}
		)

		const participantUser = interaction.guild?.members.cache.get(participant.id)?.user
		if (participantUser) {
			await participantUser.send({ embeds: [victoryEmbed] })
		}
	}
}

// update raid boss current health
export async function updateRaidBossCurrentHealth(bossName: string, currentHealth: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const raidBossesCollection = database.collection<RaidBoss>(raidBossesCollectionName)

		await raidBossesCollection.updateOne({ name: bossName }, { $set: { current_health: currentHealth } })
	} catch (error) {
		logger.error("Error updating raid boss current health:", error)
		throw error
	}
}
export async function getRaidPartyById(raidPartyId: string): Promise<RaidParty | null> {
	try {
		const database = client.db(mongoDatabase)
		const raidPartiesCollection = database.collection<RaidParty>("raidParties")

		const raidParty = await raidPartiesCollection.findOne({ _id: new ObjectId(raidPartyId) })

		return raidParty || null
	} catch (error) {
		logger.error("Error retrieving raid party by ID:", error)
		return null
	}
}

export async function getBlacklistedUsers(): Promise<
	{ userId: string; startDate: Date; endDate: Date; reason: string }[]
	// eslint-disable-next-line indent
> {
	try {
		const database = client.db(mongoDatabase)
		const blacklistedUsersCollection = database.collection("blacklistedUsers")
		const blacklistedUsers = await blacklistedUsersCollection.find().toArray()

		return blacklistedUsers.map(user => ({
			userId: user.userId,
			startDate: user.startDate,
			endDate: user.endDate,
			reason: user.reason
		}))
	} catch (error) {
		logger.error("Error retrieving blacklisted users:", error)
		return []
	}
}

// update blacklisted user
export async function updateBlacklistedUser(
	userId: string,
	startDate: Date,
	endDate: Date,
	reason: string
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const blacklistedUsersCollection = database.collection("blacklistedUsers")
		await blacklistedUsersCollection.updateOne(
			{ userId },
			{ $set: { startDate, endDate, reason } },
			{ upsert: true }
		)
	} catch (error) {
		logger.error("Error updating blacklisted user:", error)
		throw error
	}
}

export async function updateRaidBossPhase(
	raidBossId: string,
	phase: { name: string; health: number; gif: string }
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const collection = database.collection<RaidBoss>("raidBosses")
		await collection.updateOne({ _id: raidBossId }, { $set: { name: phase.name, imageUrl: phase.gif } })
	} catch (error) {
		logger.error("Error updating raid boss phase:", error)
		throw error
	}
}

export function getCurrentPhase(raidBoss: RaidBoss): { name: string; health: number; gif: string } {
	for (let i = 0; i < raidBoss.phases.length; i++) {
		if (raidBoss.globalHealth > 0) {
			return raidBoss.phases[i]
		}
		raidBoss.globalHealth += raidBoss.phases[i].health
	}
	return raidBoss.phases[raidBoss.phases.length - 1]
}

// is user registered
export async function isUserRegistered(userId: string): Promise<boolean> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })
		return !!user
	} catch (error) {
		logger.error("Error checking if user is registered:", error)
		throw error
	}
}

export interface TutorialState {
	digUsed: boolean
	begUsed: boolean
	itemAcquired: boolean
	techniquePurchased: boolean
	isRegistered: boolean
	tutorialMessageId?: string
	techniqueEquipped: boolean
	fightUsed: boolean
}

export async function createUserTutorialState(userId: string): Promise<TutorialState> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const initialState: TutorialState = {
			digUsed: false,
			fightUsed: false,
			techniqueEquipped: false,
			begUsed: false,
			itemAcquired: false,
			techniquePurchased: false,
			isRegistered: false
		}
		await usersCollection.updateOne({ id: userId }, { $set: { tutorialState: initialState } }, { upsert: true })
		return initialState
	} catch (error) {
		console.error("Error creating user tutorial state:", error)
		throw error
	}
}
export async function setUserTutorialState(userId: string, tutorialState: Partial<TutorialState>): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne({ id: userId }, { $set: { tutorialState: tutorialState } })
	} catch (error) {
		console.error("Error setting user tutorial state:", error)
		throw error
	}
}

export async function getUserTutorialState(userId: string): Promise<TutorialState | null> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })
		if (user && user.tutorialState) {
			return user.tutorialState
		} else {
			return null
		}
	} catch (error) {
		console.error("Error getting user tutorial state:", error)
		throw error
	}
}

export async function setUserTutorialMessageId(userId: string, messageId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne({ id: userId }, { $set: { "tutorialState.tutorialMessageId": messageId } })
	} catch (error) {
		console.error("Error setting user tutorial message ID:", error)
		throw error
	}
}

//updateraidparty
export async function updateRaidParty(raidParty: RaidParty): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const raidPartiesCollection = database.collection<RaidParty>("raidParties")
		await raidPartiesCollection.updateOne({ _id: new ObjectId(raidParty._id) }, { $set: raidParty })
	} catch (error) {
		logger.error("Error updating raid party:", error)
		throw error
	}
}

export async function markSpecialDropAsClaimed(raidBossName: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const raidBossesCollection = database.collection("raidBosses")

		await raidBossesCollection.updateOne({ name: raidBossName }, { $set: { specialDropClaimed: true } })
	} catch (error) {
		console.error("Error marking special drop as claimed:", error)
		throw error
	}
}

export async function checkSpecialDropClaimed(raidBossName: string): Promise<boolean> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const raidBossesCollection = database.collection("raidBosses")

		const raidBoss = await raidBossesCollection.findOne({ name: raidBossName })
		return raidBoss?.specialDropClaimed || false
	} catch (error) {
		console.error("Error checking if special drop is claimed:", error)
		throw error
	}
}

// User Settings Interface
export interface UserSettings {
	pvpable: boolean
	acceptTrades: boolean
	showAlerts: boolean
	showSpoilers: boolean
	trademessage: boolean
}

// Get user settings
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })
		return user?.settings || null
	} catch (error) {
		logger.error("Error getting user settings:", error)
		return null
	}
}

// Update user settings
export async function updateUserSettings(userId: string, settings: UserSettings): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne({ id: userId }, { $set: { settings } })
	} catch (error) {
		logger.error("Error updating user settings:", error)
		throw error
	}
}

export async function addUserToMatchmaking(userId, guildId, username, mmr) {
	try {
		const database = client.db(mongoDatabase)
		const matchmakingCollection = database.collection(matchmakingCollectionName)

		const filter = { guildId }

		const update = {
			$addToSet: {
				users: {
					userId,
					username,
					mmr,
					timestamp: new Date()
				}
			}
		}

		// Perform an update operation
		await matchmakingCollection.updateOne(filter, update, { upsert: true })
	} catch (error) {
		console.error("Error adding user to matchmaking:", error)
		throw error
	}
}

export async function findMatch(userId, mmr) {
	try {
		const database = client.db(mongoDatabase)
		const matchmakingCollection = database.collection(matchmakingCollectionName)
		const match = await matchmakingCollection.findOneAndDelete(
			{
				mmr: { $gte: mmr - 50, $lte: mmr + 50 },
				userId: { $ne: userId }
			},
			{ sort: { timestamp: 1 } }
		)
		return match ? match.value : null
	} catch (error) {
		console.error("Error finding match:", error)
		throw error
	}
}

export async function createBattle(player1, player2) {
	try {
		const database = client.db(mongoDatabase)
		const battlesCollection = database.collection(battlesCollectionName)
		const battle = {
			player1: { ...player1, health: 100, domainProgress: 0, transformationProgress: 0 },
			player2: { ...player2, health: 100, domainProgress: 0, transformationProgress: 0 },
			currentTurn: Math.random() < 0.5 ? player1.userId : player2.userId,
			timestamp: new Date()
		}
		await battlesCollection.insertOne(battle)
		return battle
	} catch (error) {
		console.error("Error creating battle:", error)
		throw error
	}
}

export async function getBattle(battleId) {
	try {
		const database = client.db(mongoDatabase)
		const battlesCollection = database.collection(battlesCollectionName)
		return await battlesCollection.findOne({ _id: battleId })
	} catch (error) {
		console.error("Error getting battle:", error)
		throw error
	}
}

export async function updateBattle(battleId, update) {
	try {
		const database = client.db(mongoDatabase)
		const battlesCollection = database.collection(battlesCollectionName)
		await battlesCollection.updateOne({ _id: battleId }, { $set: update })
	} catch (error) {
		console.error("Error updating battle:", error)
		throw error
	}
}

export async function deleteBattle(battleId) {
	try {
		const database = client.db(mongoDatabase)
		const battlesCollection = database.collection(battlesCollectionName)
		await battlesCollection.deleteOne({ _id: battleId })
	} catch (error) {
		console.error("Error deleting battle:", error)
		throw error
	}
}

// get user mmr
export async function getUserMMR(userId: string): Promise<number> {
	try {
		const database = client.db(mongoDatabase)
		const matchmakingCollection = database.collection(usersCollectionName)
		const user = await matchmakingCollection.findOne({ userId })
		return user ? user.mmr : 0
	} catch (error) {
		console.error("Error getting user MMR:", error)
		throw error
	}
}

export async function getUserReverseCursedTechniqueLevel(userId: string): Promise<number> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })
		return user && user.reverseCursedTechnique ? user.reverseCursedTechnique.level : 0
	} catch (error) {
		console.error("Error getting user reverse cursed technique level:", error)
		throw error
	}
}

export async function getUserReverseCursedTechniqueStats(userId) {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })
		return user ? user.reverseCursedTechnique : null
	} catch (error) {
		console.error("Error getting user reverse cursed technique stats:", error)
		throw error
	}
}

export async function updateUserReverseCursedTechnique(
	userId: string,
	level: number,
	healthHealed: number,
	experience: number,
	obtained: boolean
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne(
			{ id: userId },
			{ $set: { reverseCursedTechnique: { level, healthHealed, experience, obtained } } }
		)
	} catch (error) {
		console.error("Error updating user reverse cursed technique:", error)
		throw error
	}
}

type Alert = {
	userId: string
	message: string
	read: boolean
	developerAlert: boolean
	timestamp: Date
}

export async function checkForNewAlerts(
	userId: string,
	showAlerts: boolean
): Promise<{ count: number; hasDeveloperAlerts: boolean }> {
	try {
		const database = client.db(mongoDatabase)
		const alertsCollection = database.collection<Alert>("alerts")

		let query: Partial<Alert> = { userId, read: false }

		if (!showAlerts) {
			query = { ...query, developerAlert: true }
		}

		const newAlerts = await alertsCollection.find(query).toArray()
		const hasDeveloperAlerts = newAlerts.some(alert => alert.developerAlert)

		return { count: newAlerts.length, hasDeveloperAlerts }
	} catch (error) {
		logger.error(`Error checking alerts for user ${userId}:`, error)
		return { count: 0, hasDeveloperAlerts: false }
	}
}

async function checkAndExpirePendingTrades() {
	try {
		await client.connect()

		const database = client.db(mongoDatabase)
		const tradesCollection = database.collection("trades")

		const oneDayMs = 24 * 60 * 60 * 1000
		const currentTime = Date.now()

		const pendingTrades = await tradesCollection
			.find({
				status: "pending",
				createdAt: { $lt: new Date(currentTime - oneDayMs) }
			})
			.toArray()

		if (pendingTrades.length > 0) {
			const tradeIds = pendingTrades.map(trade => trade._id)
			await tradesCollection.updateMany({ _id: { $in: tradeIds } }, { $set: { status: "ignored" } })

			console.log(`Updated ${tradeIds.length} pending trades to ignored.`)
		} else {
			console.log("No pending trades to update.")
		}
	} catch (error) {
		console.error("Error checking and updating pending trades:", error)
	}
}
// get user defense techniuqe
export async function getUserActiveDefenseTechnique(userId: string): Promise<string | null> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })
		return user ? user.activedefenseTechnique : null
	} catch (error) {
		console.error("Error getting user defense technique:", error)
		throw error
	}
}

//update user active defense technique
export async function updateUserActiveDefenseTechnique(userId: string, activedefenseTechnique: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne({ id: userId }, { $set: { activedefenseTechnique } })
	} catch (error) {
		console.error("Error updating user active defense technique:", error)
		throw error
	}
}

// get user unlocked defense techniques
export async function getUserUnlockedDefenseTechniques(userId: string): Promise<string[]> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })
		return user ? user.unlockedDefenseTechniques : []
	} catch (error) {
		console.error("Error getting user unlocked defense techniques:", error)
		throw error
	}
}

// update user unlocked defense techniques
export async function updateUserUnlockedDefenseTechniques(userId: string, defenseTechniques: string[]): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne({ id: userId }, { $set: { unlockedDefenseTechniques: defenseTechniques } })
	} catch (error) {
		console.error("Error updating user unlocked defense techniques:", error)
		throw error
	}
}

export async function updateUserReverseCursedTechniqueStats(userId, reverseCursedTechnique) {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne({ id: userId }, { $set: { reverseCursedTechnique: reverseCursedTechnique } })
	} catch (error) {
		console.error("Error updating user reverse cursed technique stats:", error)
		throw error
	}
}

// update reverse cursed technique experience
export async function updateUserReverseCursedTechniqueExperience(userId: string, experience: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne({ id: userId }, { $set: { "reverseCursedTechnique.experience": experience } })
	} catch (error) {
		console.error("Error updating user reverse cursed technique experience:", error)
		throw error
	}
}

async function createDeveloperAlert(message) {
	try {
		const database = client.db(mongoDatabase)
		const alertsCollection = database.collection("alerts")
		const usersCollection = database.collection("users")

		// Fetch all user IDs
		const users = await usersCollection.find({}, { projection: { id: 1 } }).toArray()
		const userIds = users.map(user => user.id)

		const alerts = userIds.map(userId => ({
			userId: userId.toString(),
			message: message,
			read: false,
			developerAlert: true,
			timestamp: new Date()
		}))

		await alertsCollection.insertMany(alerts)

		console.log(`Developer alert created for ${userIds.length} users.`)
	} catch (error) {
		console.error("Error creating developer alert:", error)
	}
}

export async function handleTradeAcceptanceWithLock(tradeId, userId) {
	const database = client.db(mongoDatabase)
	const tradeRequestsCollection = database.collection(tradeCollectionName)
	const usersCollection = database.collection(usersCollectionName)

	const session = client.startSession()

	try {
		session.startTransaction()

		const tradeRequest = await tradeRequestsCollection.findOne(
			{
				_id: new ObjectId(tradeId),
				status: "pending",
				targetUserId: userId
			},
			{ session }
		)

		if (!tradeRequest) {
			throw new Error("Trade request not found or not valid for this user.")
		}

		const initiatorInventory = await usersCollection.findOne(
			{
				"id": tradeRequest.initiatorId,
				"inventory.name": tradeRequest.item
			},
			{ session }
		)

		if (
			!initiatorInventory ||
			initiatorInventory.inventory.find(i => i.name === tradeRequest.item).quantity < tradeRequest.quantity
		) {
			throw new Error("Initiator does not have enough items to complete this trade.")
		}

		// Decrement the item quantity from the initiator's inventory
		const updateInitiatorResult = await usersCollection.updateOne(
			{
				"id": tradeRequest.initiatorId,
				"inventory.name": tradeRequest.item,
				"inventory.quantity": { $gte: tradeRequest.quantity }
			},
			{
				$inc: { "inventory.$.quantity": -tradeRequest.quantity }
			},
			{ session }
		)

		if (updateInitiatorResult.modifiedCount === 0) {
			throw new Error("Failed to update initiator's inventory.")
		}

		// Add the item quantity to the target's inventory
		const updateTargetResult = await usersCollection.updateOne(
			{
				"id": tradeRequest.targetUserId,
				"inventory.name": tradeRequest.item
			},
			{
				$inc: { "inventory.$.quantity": tradeRequest.quantity }
			},
			{ upsert: true, session }
		)

		if (updateTargetResult.modifiedCount === 0) {
			throw new Error("Failed to update target's inventory.")
		}

		// Update the trade request status to accepted
		await tradeRequestsCollection.updateOne(
			{ _id: new ObjectId(tradeId) },
			{ $set: { status: "accepted" } },
			{ session }
		)

		await session.commitTransaction()
	} catch (error) {
		await session.abortTransaction()
		logger.error("Error during trade acceptance:", error)
		throw error
	} finally {
		session.endSession()
	}
}

// update owner logs
export async function updateOwnerLogs(userId: string, logData: LogEntry): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<UserLog>("ownerLogs")

		// Use $push to append the new log entry to the logs array
		await usersCollection.updateOne(
			{ id: userId },
			{ $push: { logs: logData } },
			{ upsert: true } // Create a new document if one doesn't exist
		)
	} catch (error) {
		console.error("Error updating owner logs:", error)
		throw error
	}
}
// Fetch all raid bosses from the database
export async function getRaidBosses(): Promise<RaidBoss[]> {
	try {
		const database = client.db(mongoDatabase)
		const raidBossesCollection = database.collection<RaidBoss>(raidBossesCollectionName)
		return await raidBossesCollection.find().toArray()
	} catch (error) {
		console.error("Error fetching raid bosses:", error)
		throw error
	}
}

// get user level
export async function getUserLevel(userId: string): Promise<number> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })
		return user ? user.level : 1
	} catch (error) {
		console.error("Error getting user level:", error)
		throw error
	}
}

export async function getUserCooldown(userId: string, cooldownType: string): Promise<Date | null> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })
		if (user && user.cooldowns) {
			const cooldown = user.cooldowns.find(cd => cd.type === cooldownType)
			if (cooldown) {
				return cooldown.lastUsed
			}
		}
		return null
	} catch (error) {
		console.error("Error retrieving user cooldown:", error)
		throw error
	} finally {
		await client.close()
	}
}

export async function trackAchievementsAndQuests(userId: string, amount: number): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		const user = await usersCollection.findOne({ id: userId })

		if (!user) {
			throw new Error(`No user found with ID: ${userId}`)
		}

		const achievements = user.achievements || []
		const quests = user.quests || []

		// Track achievements
		for (const achievement of initialAchievements) {
			const userAchievement = achievements.find(a => a.name === achievement.name)
			if (!userAchievement) continue

			if (!userAchievement.unlocked) {
				let progress = userAchievement.progress || 0

				if (achievement.name === "No Life" || achievement.name === "Raid Champion") {
					progress += amount
					if (progress >= achievement.target) {
						await unlockAchievement(userId, achievement.name)
					} else {
						await updateAchievementProgress(userId, achievement.name, progress)
					}
				}
			}
		}
	} catch (error) {
		logger.error("Error tracking achievements and quests:", error)
		throw error
	}
}

export async function unlockAchievement(userId: string, achievementName: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const achievement = initialAchievements.find(a => a.name === achievementName)
		if (!achievement) {
			throw new Error(`Achievement '${achievementName}' not found in initialAchievements.`)
		}

		await usersCollection.updateOne(
			{ "id": userId, "achievements.name": achievementName },
			{ $set: { "achievements.$.unlocked": true } }
		)

		const rewards = achievement.rewards
		if (rewards) {
			if (rewards.coins) {
				await updateBalance(userId, rewards.coins)
			}
			if (rewards.items) {
				for (const [item, quantity] of Object.entries(rewards.items)) {
					await addItemToUserInventory(userId, item, quantity)
				}
			}
			if (rewards.rewardTitle) {
				await unlockTitle(userId, rewards.rewardTitle)
			}
		}

		logger.info(`Achievement '${achievementName}' unlocked for user: ${userId}`)
	} catch (error) {
		logger.error("Error unlocking achievement:", error)
		throw error
	}
}

export async function updateAchievementProgress(
	userId: string,
	achievementName: string,
	progress: number
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ "id": userId, "achievements.name": achievementName },
			{ $set: { "achievements.$.progress": progress } }
		)

		logger.info(`Achievement progress for '${achievementName}' updated for user: ${userId}`)
	} catch (error) {
		logger.error("Error updating achievement progress:", error)
		throw error
	}
}
export async function unlockTitle(userId: string, titleName: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ "id": userId, "titles.name": titleName },
			{ $set: { "titles.$.unlocked": true } }
		)

		logger.info(`Title '${titleName}' unlocked for user: ${userId}`)
	} catch (error) {
		logger.error("Error unlocking title:", error)
		throw error
	}
}

client1.login(process.env["DISCORD_BOT_TOKEN"])
