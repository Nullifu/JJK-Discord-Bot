/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandInteraction } from "discord.js"
import { config as dotenv } from "dotenv"
import { Collection, MongoClient, ObjectId } from "mongodb"
import cron from "node-cron"
import schedule from "node-schedule"
import { BossData, ItemEffect, TradeRequest, User, UserProfile, healthMultipliersByGrade } from "./interface.js"
import { questsArray, shopItems, titles } from "./items jobs.js"

dotenv()

const bossCollectionName = "bosses"
const shikigamCollectionName = "shiki"
const usersCollectionName = "users"
const questsCollectioName = "quests"
const tradeCollectionName = "trades"
const shopCollectionName = "shop"

const mongoDatabase = process.env["MONGO_DATABASE"]
const mongoUri = process.env.MONGO_URI

const client = new MongoClient(mongoUri)

let isConnected = false

client.on("connected", () => {
	isConnected = true
	logger.info("Connected to MongoDB")
})

client.on("close", () => {
	isConnected = false
	logger.info("Disconnected from MongoDB")
})

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

// ----------------------------------------------------------------------------

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
			balance: initialBalance,
			bankBalance: initialBankBalance,
			job: initialJob,
			grade: initialGrade,
			experience: initialExperience,
			health: initialHealth,
			maxhealth: initialmaxhealth,
			owneddomains: [],
			domain: null,
			activeTitle: null,
			unlockedTitles: [],
			inventory: [],
			achievements: [],
			heavenlyrestriction: null,
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
			quests: [],
			permEffects: [],
			statusEffects: [],
			betCount: 0,
			honours: [],
			purchases: [],
			itemEffects: [],
			unlockedmentors: [],
			mentors: null,
			shikigami: [],
			gamblersData: {
				limit: 5000000,
				amountGambled: 0,
				amountLost: 0,
				amountWon: 0
			}
		})

		console.log(`Inserted user with ID: ${insertResult.insertedId}`)
		return { insertedId: insertResult.insertedId }
	} catch (error) {
		console.error(`Error when adding user with ID: ${id}`, error)
		return { error: "Failed to add user." }
	}
}

async function resetBetCounts() {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateMany({}, { $set: { betCount: 0 } })

		console.log(`Bet counts reset for ${updateResult.modifiedCount} users.`)
	} catch (error) {
		console.error("Error resetting bet counts:", error)
	}
}

// remove expired item effects every 60 seconds
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
		console.error("Error removing expired item effects:", error)
	}
}

export async function initializeDatabase() {
	try {
		logger.info("Connecting to database...")
		await client.connect()

		logger.info("Initializing database...")
		//await ensureUserDocumentsHaveActiveTechniquesAndStatusEffects(client.db(mongoDatabase))
	} catch (error) {
		logger.fatal("Database initialization failed:", error)
	}
}

///
///
///

async function updateInateclanField(database) {
	const usersCollection = database.collection(usersCollectionName)

	try {
		// Update documents where 'inateclan' is an array
		const updateResult = await usersCollection.updateMany(
			{ purchases: { $exists: true, $type: "array" } }, // Match only if 'inateclan' is an array
			{ $set: { inateclan: {} } } // Set 'inateclan' to an empty object
		)

		if (updateResult.matchedCount > 0) {
			console.log(`Converted 'inateclan' from array to object in ${updateResult.matchedCount} user documents`)
		} else {
			console.log("No user documents found with 'inateclan' as an array")
		}
	} catch (error) {
		console.error("Error updating 'inateclan' fields:", error)
	}
}

async function ensureUserDocumentsHaveActiveTechniquesAndStatusEffects(database) {
	const usersCollection = database.collection(usersCollectionName)

	try {
		const usersToUpdate = await usersCollection
			.find({
				$or: [{ shikigami: { $exists: false } }]
			})
			.toArray()

		if (usersToUpdate.length > 0) {
			await usersCollection.updateMany(
				{
					$or: [{ shikigami: { $exists: false } }]
				},
				{
					$set: {
						shikigami: []
					}
				}
			)

			console.log("Added missing fields to existing user documents")
		}
	} catch (error) {
		console.error("Error initializing fields:", error)
	}
}

async function renameUserDocumentFields(database) {
	const usersCollection = database.collection(usersCollectionName)

	try {
		const updateResult = await usersCollection.updateMany(
			{ honours: { $exists: true } },
			{ $rename: { honours: "Honours" } }
		)

		if (updateResult.matchedCount > 0) {
			console.log(`Renamed 'honours' to 'Honours' in ${updateResult.matchedCount} user documents`)
		} else {
			console.log("No user documents found with 'honours' field")
		}
	} catch (error) {
		console.error("Error renaming fields:", error)
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

export async function updateBalance(id: string, amount: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: id })
		if (!user) {
			console.log(`No user found with ID: ${id}`)
			throw new Error(`No user found with ID: ${id}`)
		}

		const newBalance = user.balance + amount

		if (newBalance >= 0) {
			const updateResult = await usersCollection.updateOne(
				{ id: id },
				{ $set: { balance: newBalance } } // Use $set to directly update the value
			)

			logger.log(`Updated balance for user with ID: ${id}`)
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
					activeTitle: 1,
					heavenlyrestriction: 1,
					inateclan: 1
				}
			}
		)

		if (!userDocument) {
			console.log(`No user profile found for ID: ${userId}`)
			return null
		}

		const userProfile: UserProfile = {
			balance: userDocument.balance,
			experience: userDocument.experience,
			grade: userDocument.grade,
			domain: userDocument.domain || null,
			job: userDocument.job || "Non-Sorcerer",
			activeTitle: userDocument.activeTitle || null,
			heavenlyrestriction: userDocument.heavenlyrestriction || null,
			inateclan: userDocument.clan || "None"
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
			console.log("No user found with the specified ID")
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

export async function addItemToUserInventory(userId: string, itemName: string, quantityToAdd: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const existingItem = await usersCollection.findOne({ "id": userId, "inventory.name": itemName })

		if (existingItem) {
			await usersCollection.updateOne(
				{ "id": userId, "inventory.name": itemName },
				{ $inc: { "inventory.$.quantity": quantityToAdd } }
			)
		} else {
			await usersCollection.updateOne(
				{ id: userId },
				{ $push: { inventory: { name: itemName, quantity: quantityToAdd } } }
			)
		}
	} catch (error) {
		logger.error("Error adding item to user inventory:", error)
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
			console.log("No user found with the specified ID")
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

		const updateResult = await usersCollection.updateOne({ id: userId }, { $inc: { experience: experienceToAdd } })

		logger.log(`Matched Count: ${updateResult.matchedCount}`)
		logger.log(`Modified Count: ${updateResult.modifiedCount}`)

		if (updateResult.matchedCount === 0) {
			logger.log(`No user found with the specified ID: ${userId}`)
		}
	} catch (error) {
		console.error("Error updating user experience:", error)
		throw error
	}
}

// update user title
export async function updateUserTitle(userId: string, newTitle: string): Promise<boolean> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateOne({ id: userId }, { $set: { activeTitle: newTitle } })

		if (updateResult.matchedCount === 0) {
			console.log("No user found with the specified ID")
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
	"Special Grade": ["Special Grade", "Grade 1", "Semi-Grade 1"],
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
		const userGrade = await getUserGrade(userId)
		const healthMultiplier = healthMultipliersByGrade[userGrade.toLowerCase()] || 1

		const database = client.db(mongoDatabase)
		const domainsCollection = database.collection(bossCollectionName)
		const allowedBossGrades = gradeToBossGrade[userGrade] || []

		let query: { [key: string]: unknown } = {
			grade: { $in: allowedBossGrades },
			name: { $nin: ["Divine Dogs", "Nue", "Toad", "Great Serpent", "Max Elephant"] }
		}

		if (isCursed && !isNonCursed) {
			query = { ...query, curse: true }
		} else if (!isCursed && isNonCursed) {
			query = { ...query, curse: false }
		}

		console.log("user cursed:", isCursed)

		const bosses = (await domainsCollection.find(query).toArray()).map(boss => ({
			id: boss._id.toString(),
			name: boss.name,
			max_health: Math.round(boss.max_health * healthMultiplier),
			current_health: Math.round(boss.current_health * healthMultiplier),
			image_url: boss.image_URL,
			grade: boss.grade,
			curse: boss.curse
		}))

		return bosses
	} catch (error) {
		logger.error("Error when retrieving bosses:", error)
		throw error
	}
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
			curse: boss.curse
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
		console.error(`Error when retrieving grade for user with ID: ${userId}`, error)
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
			console.log("No user found with the specified ID")
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
	if (experience >= 3000) return "Special Grade"
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
			console.log("No user found with the specified ID in the users collection.")
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
			}
		} else {
			logger.log(`No clan tier update needed for user ${userId}. Current tier is already ${newTier}.`)
		}
	} catch (error) {
		logger.error(`Error updating clan tier for user ${userId}:`, error)
	}
}

// add achivements function
export async function updateUserAchievements(userId, achievementId) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const updateResult = await usersCollection.updateOne(
			{ id: userId },
			{ $addToSet: { achievements: achievementId } }
		)

		if (updateResult.matchedCount === 0) {
			console.log("User not found.")
		} else if (updateResult.modifiedCount === 0) {
			console.log("Achievement was already in the user's achievements.")
		} else {
			console.log("Achievement added to the user's achievements.")
		}
	} catch (error) {
		logger.error("Error updating user achievements:", error)
		throw error
	}
}

// get all achivements from a user
export async function getUserAchievements(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user && Array.isArray(user.achievements) ? user.achievements : []
	} catch (error) {
		logger.error(`Error when retrieving achievements for user with ID: ${userId}`, error)
		throw error
	}
}

export async function awardTitlesForAchievements(userId: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })
		if (!user) {
			logger.log("User not found")
			return
		}

		const unlockedTitles = user.unlockedTitles || []
		titles.forEach(title => {
			if (
				title.achievementId &&
				user.achievements.includes(title.achievementId) &&
				!unlockedTitles.includes(title.name)
			) {
				unlockedTitles.push(title.name)
				logger.log(`User ${userId} has unlocked the title: ${title.name}`)
			}
		})

		await usersCollection.updateOne({ id: userId }, { $set: { unlockedTitles: unlockedTitles } })
	} catch (error) {
		logger.error("Error awarding titles based on achievements:", error)
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

		console.log(
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

// function to update heavenlyrestriction in database from null to yes
export async function updateUserHeavenlyRestriction(userId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { heavenlyrestriction: true } })
	} catch (error) {
		logger.error("Error updating heavenly restriction:", error)
		throw error
	}
}

export async function checkUserHasHeavenlyRestriction(userId) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId }, { projection: { heavenlyrestriction: 1 } })

		if (user && user.heavenlyrestriction === true) {
			return true
		} else {
			return false
		}
	} catch (error) {
		logger.error("Error checking Heavenly Restriction:", error)
		throw error
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

export async function toggleHeavenlyRestriction(userId) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Get user achievements to check if they have unlocked Heavenly Restriction
		const userAchievements = await getUserAchievements(userId)

		// Check if the user has the 'unlockHeavenlyRestriction' achievement
		if (!userAchievements.includes("unlockHeavenlyRestriction")) {
			console.log(`User with ID: ${userId} has not unlocked Heavenly Restriction.`)
			return false // User has not unlocked this feature, so don't toggle
		}

		// Proceed with toggling if the user has the achievement
		const updateResult = await usersCollection.updateOne(
			{ id: userId },
			[{ $set: { heavenlyrestriction: { $not: "$heavenlyrestriction" } } }],
			{ upsert: true }
		)

		if (updateResult.matchedCount === 0) {
			console.log(`No user found with ID: ${userId}`)
			return false
		}

		console.log(`Toggled Heavenly Restriction for user with ID: ${userId}`)
		return true
	} catch (error) {
		logger.error(`Error when toggling Heavenly Restriction for user with ID: ${userId}`, error)
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

		const users = await usersCollection.find({}, { projection: { _id: 0, id: 1, balance: 1 } }).toArray()

		return users.map(user => ({
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

import moment from "moment-timezone"
import { logger } from "./bot.js"

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

export async function getUserWorkCooldown(userId: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user?.cooldowns?.work || 0
	} catch (error) {
		logger.error(`Error when retrieving work cooldown for user with ID: ${userId}`, error)
		throw error
	}
}

// update user work cooldown
export async function updateUserCooldown(userId: string, jobType: string, newCooldown: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { [`cooldowns.${jobType}`]: newCooldown } })
	} catch (error) {
		logger.error("Error updating user work cooldown:", error)
		throw error
	}
}

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

// addUserQuest
export async function addUserQuest(userId: string, questName: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const questToAdd = questsArray.find(quest => quest.name === questName)

		if (questToAdd) {
			let questData
			if (questToAdd.tasks) {
				questData = {
					id: questName,
					tasks: questToAdd.tasks.map(task => ({
						description: task.description,
						progress: 0,
						totalProgress: task.totalProgress
					}))
				}
			} else {
				questData = {
					id: questName,
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
					"quests.id": questId, // Make sure this matches the id field in the quests objects in the database.
					"quests.tasks.description": taskDescription
				},
				{
					$inc: { "quests.$.tasks.$[task].progress": increment }
				},
				{
					arrayFilters: [{ "task.description": taskDescription }]
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

		// Error handling and logging
		if (updateResult.matchedCount === 0) {
			logger.error("Quest not found for user:", userId)
		} else if (updateResult.modifiedCount === 0) {
			logger.error("Quest progress was not updated for user:", userId)
		} else {
			logger.log("Quest progress updated successfully for user:", userId)
		}
	} catch (error) {
		logger.error("Error updating user quest progress:", error)
		throw error
	}
}

// getUserQuests
export async function getUserQuests(userId) {
	try {
		logger.info("Attempting to retrieve quests for userId:", userId)
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })
		logger.info("User document retrieved:", user)

		if (!user) return { quests: [] }

		const userQuests = user.quests ? [...user.quests] : []
		return { quests: userQuests }
	} catch (error) {
		logger.error(`Error when retrieving quests for user with ID: ${userId}:`, error.stack)
		throw error
	}
}

// removeUserQuest function
export async function removeUserQuest(userId, questName) {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection: Collection<User> = database.collection<User>(usersCollectionName)

		const result = await usersCollection.updateOne(
			{ id: userId },
			{ $pull: { quests: { id: questName } } } // Make sure 'id' matches the property in the Quest interface.
		)

		if (result.modifiedCount === 0) {
			console.log(`No quest was removed for the user with ID: ${userId}`)
			return false
		} else {
			console.log(`Quest with name: ${questName} was removed for the user with ID: ${userId}`)
			return true
		}
	} catch (error) {
		logger.error(`Error when removing quest for user with ID: ${userId}`, error)
		throw error
	}
}

// update user max health max out at 275
export async function updateUserMaxHealth(userId: string, healthIncrement: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })
		if (user) {
			let { health, maxhealth } = user

			maxhealth = Math.min(maxhealth + healthIncrement, 300)

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
		console.error(`Error when retrieving max health for user with ID: ${userId}`, error)
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
			status: "pending", // Initial status of the trade request
			createdAt: new Date() // Store the creation time
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
			targetUserId: userId // Ensure the acceptor is the target user
		})

		if (!tradeRequest) {
			throw new Error("Trade request not found or not valid for this user.")
		}

		await removeItemFromUserInventory(tradeRequest.initiatorId, tradeRequest.item, Number(tradeRequest.quantity))

		await addItemToUserInventory(tradeRequest.targetUserId, tradeRequest.item, Number(tradeRequest.quantity))
		await tradeRequestsCollection.updateOne({ _id: new ObjectId(tradeRequestId) }, { $set: { status: "accepted" } })
	} catch (error) {
		logger.error("Error during trade acceptance:", error)
		throw error // Consider more specific error handling
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
		console.error("Error getting active trades:", error)
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

// update user active techniques limit of 10 if it doesnt exist create it
export async function updateUserActiveTechniques(userId: string, newActiveTechniques: string[]): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const activeTechniques = newActiveTechniques.slice(0, 20)

		await usersCollection.updateOne({ id: userId }, { $set: { activeTechniques } })
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

		// Ensure the new active heavenly techniques do not exceed 10
		const activeHeavenlyTechniques = newActiveHeavenlyTechniques.slice(0, 10)

		await usersCollection.updateOne({ id: userId }, { $set: { activeHeavenlyTechniques } })
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
			console.log("Gamblers data updated successfully.")
		} else {
			console.warn("User with specified ID not found for gamblers data update.")
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
		console.error("Error updating user status effects:", error)
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
export async function updateUserTransformation(userId: string, transformation: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { transformation } })
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
		console.error("Error updating user inate clan experience:", error)
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
		console.error(`Error when retrieving inate clan for user with ID: ${userId}`, error)
		throw error
	}
}

// update user unlocked transformations
export async function updateUserUnlockedTransformations(
	userId: string,
	unlockedtransformations: string[]
): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { unlockedtransformations } })
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

// update users honours array
export async function updateUserHonours(userId: string, honours: string[]): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { honours } })
	} catch (error) {
		console.error("Error updating user honours:", error)
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
		console.error(`Error when retrieving item effects for user with ID: ${userId}`, error)
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

		const resetInterval = 86400000 // 24 hours in milliseconds

		let shopData = await shopsCollection.findOne({})
		console.log("Shop data:", shopData)

		const now = new Date()

		const shouldGenerateItems =
			!shopData || now.getTime() - new Date(shopData.lastShopReset).getTime() >= resetInterval

		if (shouldGenerateItems) {
			await resetAllUserPurchases()
			const newShopItems = await generateDailyShop()
			console.log("New shop items:", newShopItems)

			if (!shopData) {
				shopData = {
					_id: new ObjectId(),
					shopItems: newShopItems,
					lastShopReset: now
				}
				await shopsCollection.insertOne(shopData)
				console.log("Shop created with items: ", shopData)
			} else {
				await shopsCollection.updateOne(
					{ _id: shopData._id },
					{
						$set: {
							shopItems: newShopItems, // newShopItems should be an array
							lastShopReset: now
						}
					}
				)

				console.log("Shop reset successfully with new items!")
			}
		} else {
			console.log("Shop does not need a reset yet.")
		}
	} catch (error) {
		logger.error("Error updating shop items:", error)
		throw error
	}
}

async function generateDailyShop() {
	console.log("shopItems length", shopItems.length)
	const dailyShopItems = []
	const numItems = 5

	if (shopItems.length === 0) {
		console.log("No items available to add to the shop.")
		return dailyShopItems
	}

	while (dailyShopItems.length < numItems) {
		const randomIndex = Math.floor(Math.random() * shopItems.length)
		const randomItem = shopItems[randomIndex]
		console.log(`Selected item ${randomIndex}:`, randomItem)

		if (!Object.prototype.hasOwnProperty.call(randomItem, "rarity")) {
			console.log("Selected item does not have a 'rarity' property:", randomItem)
			continue
		}

		if (randomItem.rarity !== "legendary" || Math.random() < 0.2) {
			if (!dailyShopItems.includes(randomItem)) {
				dailyShopItems.push(randomItem)
				console.log("Item added to daily shop:", randomItem)
			}
		}
	}

	console.log("Daily shop items generated:", dailyShopItems)
	return dailyShopItems
}

export async function getAllShopItems() {
	try {
		const database = client.db(mongoDatabase)
		const shopsCollection = database.collection(shopCollectionName)

		const shopDocuments = await shopsCollection.find({}).toArray()
		const allShopItems = shopDocuments.map(doc => doc.shopItems).flat()

		console.log("Retrieved shop items:", allShopItems)
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
			console.error(`User with ID ${userId} not found`)
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

		console.log(`Purchases reset for all users. Modified count: ${result.modifiedCount}`)
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
// update user mentors if it doesnt exist create it then update
export async function updateUserMentors(userId: string, mentors: string[]): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { mentors } })
	} catch (error) {
		logger.error("Error updating user mentors:", error)
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
	console.log("getUserShikigami called with userId:", userId)

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
						"elem.hunger": { $gt: 0 }
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
						"elem.hygiene": { $gt: 0 }
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
