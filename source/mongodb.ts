/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandInteraction } from "discord.js"
import { config as dotenv } from "dotenv"
import { Collection, MongoClient, ObjectId } from "mongodb"
import { BossData, TradeRequest, User, UserProfile, healthMultipliersByGrade } from "./interface.js"
import { questsArray, titles } from "./items jobs.js"

dotenv()

const bossCollectionName = "bosses"
const usersCollectionName = "users"
const questsCollectioName = "quests"
const tradeCollectionName = "trades"

const mongoUser = process.env["MONGO_USER"]
const mongoPassword = process.env["MONGO_PASSWORD"]
const mongoDatabase = process.env["MONGO_DATABASE"]
const mongoHost = process.env["MONGO_HOST"]
const mongoPort = process.env["MONGO_PORT"]
const mongoUri = process.env.MONGO_URI

console.log("MongoDB User:", mongoUser)
console.log("MongoDB Database:", mongoDatabase)
console.log("MongoDB Password:", mongoPassword)
console.log("MongoDB Host:", mongoHost)
console.log("MongoDB Port:", mongoPort)

// Create a new MongoClient
const client = new MongoClient(mongoUri)

let isConnected = false

client.on("connected", () => {
	isConnected = true
	console.log("Connected to MongoDB")
})

client.on("close", () => {
	isConnected = false
	console.log("Disconnected from MongoDB")
})

// LINK START! ---------------------------------------------------------------
// Functions for interfacing with the 'users' table
// ----------------------------------------------------------------------------

export async function userExists(discordId: string): Promise<boolean> {
	await client.connect()
	const database = client.db(mongoDatabase)
	const usersCollection = database.collection(usersCollectionName)

	const user = await usersCollection.findOne({ id: discordId })
	// await client.close() // Close the connection after the operation
	return user !== null // Returns true if the user exists, false otherwise
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
			unlockedBosses: [],
			activeTechniques: [],
			heavenlytechniques: [],
			activeheavenlytechniques: [],
			quests: [],
			betCount: 0
		})

		console.log(`Inserted user with ID: ${insertResult.insertedId}`)
		return { insertedId: insertResult.insertedId }
	} catch (error) {
		console.error(`Error when adding user with ID: ${id}`, error)
		return { error: "Failed to add user." }
	} finally {
		// await client.close()
	}
}

export async function initializeDatabase() {
	try {
		console.log("Connecting to database...")
		await client.connect()
		const database = client.db(mongoDatabase)

		console.log("Initializing database...")
		await ensureUserDocumentsHaveActiveTechniquesAndStatusEffects(database)
		// ... add more initialization functions as needed ...
	} catch (error) {
		console.error("Database initialization failed:", error)
	} finally {
		// await client.close()
	}
}

async function ensureUserDocumentsHaveActiveTechniquesAndStatusEffects(database) {
	const usersCollection = database.collection(usersCollectionName)

	try {
		// Find users without activeTechniques or statusEffects arrays
		const usersToUpdate = await usersCollection
			.find({
				$or: [
					{ unlockedBosses: { $exists: false } } // Check for documents missing statusEffects
				]
			})
			.toArray()

		if (usersToUpdate.length > 0) {
			await usersCollection.updateMany(
				{
					$or: [{ unlockedBosses: { $exists: false } }]
				},
				{
					$set: {
						unlockedBosses: [] // Initialize statusEffects as empty array if missing
					}
				}
			)
			console.log("Added 'activeTechniques' and 'statusEffects' arrays to existing user documents")
		}
	} catch (error) {
		console.error("Error initializing activeTechniques and statusEffects:", error)
	}
}

async function removeIncorrectStatusEffectField(database) {
	const usersCollection = database.collection(usersCollectionName)

	try {
		// This operation will remove the statusEffect field from all documents where it exists
		const updateResult = await usersCollection.updateMany(
			{ statusEffect: { $exists: true } },
			{ $unset: { statusEffect: "" } } // The empty string "" indicates that the field should be removed
		)

		if (updateResult.modifiedCount > 0) {
			console.log(`Removed 'statusEffect' field from ${updateResult.modifiedCount} documents.`)
		} else {
			console.log("No documents had the 'statusEffect' field or it was already removed.")
		}
	} catch (error) {
		console.error("Error removing the 'statusEffect' field:", error)
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
		console.error(`Error when retrieving balance for user with ID: ${id}`, error)
		throw error // Rethrow the error so it can be caught and handled by the caller
	} finally {
		// await client.close()
	}
}

export async function updateBalance(id: string, amount: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Get the user's current balance
		const user = await usersCollection.findOne({ id: id })
		if (!user) {
			console.log(`No user found with ID: ${id}`)
			throw new Error(`No user found with ID: ${id}`)
		}

		// Calculate the potential new balance
		const newBalance = user.balance + amount

		// Failsafe: Only update if the new balance would be non-negative
		if (newBalance >= 0) {
			const updateResult = await usersCollection.updateOne(
				{ id: id },
				{ $set: { balance: newBalance } } // Use $set to directly update the value
			)

			console.log(`Updated balance for user with ID: ${id}`)
		} else {
			console.log("Balance update prevented: would have resulted in negative balance")
		}
	} catch (error) {
		console.error(`Error when updating balance for user with ID: ${id}`, error)
		throw error
	} finally {
		// await client.close();
	}
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName) // Use any if the collection's schema is not strictly typed

		// Fetch the user profile from the database
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
					clan: 1
				}
			}
		)

		if (!userDocument) {
			console.log(`No user profile found for ID: ${userId}`)
			return null
		}

		// Constructing UserProfile object from the fetched document
		const userProfile: UserProfile = {
			balance: userDocument.balance,
			experience: userDocument.experience,
			grade: userDocument.grade,
			domain: userDocument.domain || null,
			job: userDocument.job || "Non-Sorcerer",
			activeTitle: userDocument.activeTitle || null,
			heavenlyrestriction: userDocument.heavenlyrestriction || null,
			clan: userDocument.clan || "None"
		}

		console.log(`User profile found for ID: ${userId}`, userProfile)
		return userProfile
	} catch (error) {
		console.error(`Error when retrieving user profile for ID: ${userId}`, error)
		throw error // Propagate any errors for external handling
	}
}

// function to update user's domain expansion
export async function updateUserDomainExpansion(userId: string, domainName: string): Promise<boolean> {
	try {
		// Assume `client` is already connected to MongoDB
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Set the 'domain' field to be an object with the 'name' property
		const updateResult = await usersCollection.updateOne({ id: userId }, { $set: { domain: { name: domainName } } })

		if (updateResult.matchedCount === 0) {
			console.log("No user found with the specified ID")
			return false
		}

		return true
	} catch (error) {
		console.error("Error updating user domain:", error)
		throw error
	}
}

// get user inventory and quantity
export async function getUserInventory(userId: string): Promise<{ name: string; quantity: number }[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.inventory : []
	} catch (error) {
		console.error(`Error when retrieving inventory for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
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
			// Item doesn't exist, add it
			await usersCollection.updateOne(
				{ id: userId },
				{ $push: { inventory: { name: itemName, quantity: quantityToAdd } } }
			)
		}
	} catch (error) {
		console.error("Error adding item to user inventory:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error(`Error when retrieving experience for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error updating user job:", error)
		throw error
	} finally {
		// await client.close()
	}
}

// update user experience
export async function updateUserExperience(userId: string, experienceToAdd: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		console.log(`Attempting to update experience for user ID: ${userId}`)

		const updateResult = await usersCollection.updateOne(
			{ id: userId }, // Ensure this matches the exact field and type in your documents
			{ $inc: { experience: experienceToAdd } }
		)

		console.log(`Matched Count: ${updateResult.matchedCount}`)
		console.log(`Modified Count: ${updateResult.modifiedCount}`)

		if (updateResult.matchedCount === 0) {
			console.log(`No user found with the specified ID: ${userId}`)
			// Further action or error handling here
		}
	} catch (error) {
		console.error("Error updating user experience:", error)
		throw error
	} finally {
		// Consider your application's connection management strategy
		// await client.close();
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
		console.error("Error updating user title:", error)
		throw error
	} finally {
		// await client.close()
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
		// Decrement the quantity of the specified item
		const updateResult = await usersCollection.updateOne(
			{ "id": userId, "inventory.name": itemName },
			{ $inc: { "inventory.$.quantity": -quantityToRemove } }
		)

		// If the quantity becomes 0, remove the item from the inventory
		await usersCollection.updateOne(
			{ "id": userId, "inventory.name": itemName },
			{ $pull: { inventory: { quantity: 0 } } }
		)
	} catch (error) {
		console.error("Error removing item from user inventory:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error(`Error when retrieving health for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
	}
}

export async function getBosses(userGrade: string): Promise<BossData[]> {
	try {
		// Find the health multiplier based on the user's grade
		const healthMultiplier = healthMultipliersByGrade[userGrade.toLowerCase()] || 1

		const database = client.db(mongoDatabase) // Assuming the client is already connected
		const domainsCollection = database.collection(bossCollectionName)

		const bosses = (await domainsCollection.find({}).toArray()).map(boss => ({
			id: boss._id.toString(), // Convert MongoDB ObjectId to string
			name: boss.name,
			// Apply the multiplier to the max_health and current_health
			max_health: Math.round(boss.max_health * healthMultiplier),
			current_health: Math.round(boss.current_health * healthMultiplier),
			image_url: boss.image_URL, // Ensure the property name matches your database
			grade: boss.grade // Assuming this is the correct property and type
		}))

		return bosses
	} catch (error) {
		console.error("Error when retrieving bosses:", error)
		throw error
	}
}

// get player grade from user collection
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
	} finally {
		// await client.close()
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
			console.log("No boss found with the specified name")
		}
	} catch (error) {
		console.error("Error updating boss health:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error updating user health:", error)
		throw error
	} finally {
		// await client.close()
	}
}

// get domain from users
export async function getUserDomain(userId: string): Promise<string | null> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		// Check if the user exists and has a domain, and then return the domain's name
		return user && user.domain ? user.domain.name : null
	} catch (error) {
		console.error(`Error when retrieving domain for user with ID: ${userId}`, error)
		throw error
	} finally {
		// Keeping the connection open is useful if you're making frequent queries
		// await client.close();
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
		console.error("Error checking registration:", error)
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

// Main function to update the player's grade based on experience
export async function updatePlayerGrade(userId) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		// Using the users collection name from your setup
		const usersCollection = database.collection(usersCollectionName)

		// Retrieve the current experience of the player
		const player = await usersCollection.findOne({ id: userId })
		if (!player) {
			console.log("No user found with the specified ID in the users collection.")
			return
		}

		const newGrade = calculateGrade(player.experience)

		// Update the player's grade in the database if it has changed
		if (newGrade !== player.grade) {
			await usersCollection.updateOne({ id: userId }, { $set: { grade: newGrade } })
			console.log(`Grade updated to ${newGrade} for user ${userId} in the users collection.`)
		} else {
			console.log(`No grade update needed for user ${userId} in the users collection.`)
		}
	} catch (error) {
		console.error(`Error updating grade for user ${userId} in the users collection:`, error)
	} finally {
		// Consider the best strategy for handling your MongoDB client connection here
		// await client.close()
	}
}

// add achivements function
export async function updateUserAchievements(userId, achievementId) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Update the user's achievements, adding the achievementId if it's not already present
		const updateResult = await usersCollection.updateOne(
			{ id: userId },
			{ $addToSet: { achievements: achievementId } } // Correct for array fields
		)

		if (updateResult.matchedCount === 0) {
			console.log("User not found.")
		} else if (updateResult.modifiedCount === 0) {
			console.log("Achievement was already in the user's achievements.")
		} else {
			console.log("Achievement added to the user's achievements.")
		}
	} catch (error) {
		console.error("Error updating user achievements:", error)
		throw error
	} finally {
		// Consider reusing the connection instead of connecting and closing each time
	}
}

// get all achivements from a user
export async function getUserAchievements(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		// Ensure an array is always returned
		return user && Array.isArray(user.achievements) ? user.achievements : []
	} catch (error) {
		console.error(`Error when retrieving achievements for user with ID: ${userId}`, error)
		throw error
	} finally {
		// Consider whether you really want to close the client here
		// await client.close();
	}
}

export async function awardTitlesForAchievements(userId: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })
		if (!user) {
			console.log("User not found")
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
				console.log(`User ${userId} has unlocked the title: ${title.name}`)
				// Optionally notify the user they have unlocked a new title here
			}
		})

		await usersCollection.updateOne({ id: userId }, { $set: { unlockedTitles: unlockedTitles } })
	} catch (error) {
		console.error("Error awarding titles based on achievements:", error)
	} finally {
		// Consider if you need to close the client here
		// await client.close();
	}
}

// function to geta  users unlocked titles
export async function getUserUnlockedTitles(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.unlockedTitles : []
	} catch (error) {
		console.error(`Error when retrieving unlocked titles for user with ID: ${userId}`, error)
		throw error
	} finally {
		// Consider whether you really want to close the client here
		// await client.close();
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
			console.log("No user found with the specified ID")
		}
	} catch (error) {
		console.error("Error updating user bank balance:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error(`Error when retrieving bank balance for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
	}
}

export async function getUser(discordId: string): Promise<unknown> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Find the user by Discord ID
		const userDocument = await usersCollection.findOne({ id: discordId })
		return userDocument // This will be 'null' if no user is found
	} catch (error) {
		console.error(`An error occurred while getting user with ID ${discordId}:`, error)
		throw error // Rethrow the error so that the caller can handle it
	}
}

export async function updateUser(discordId, updates) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// The '$set' operator replaces the value of a field with the specified value
		const result = await usersCollection.updateOne({ id: discordId }, { $set: updates })

		console.log(
			`Updated user with ID ${discordId}. Matched Count: ${result.matchedCount}. Modified Count: ${result.modifiedCount}`
		)
		return result
	} catch (error) {
		console.error(`An error occurred while updating user with ID ${discordId}:`, error)
		throw error // Rethrow the error so the caller can decide how to handle it
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
		console.error(`Error when retrieving daily data for user with ID: ${userId}`, error)
		throw error
	} finally {
		// Consider whether you really want to close the client here
		// await client.close();
	}
}

export async function updateUserDailyData(userId: string, lastDaily: number, streak: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Update the user's last daily claim time and streak
		await usersCollection.updateOne({ id: userId }, { $set: { lastDaily, streak } }, { upsert: true })
	} catch (error) {
		console.error(`Error when updating daily data for user with ID: ${userId}`, error)
		throw error
	} finally {
		// Consider whether you really want to close the client here
		// await client.close();
	}
}

// function to update heavenlyrestriction in database from null to yes
export async function updateUserHeavenlyRestriction(userId: string): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne({ id: userId }, { $set: { heavenlyrestriction: true } })
	} catch (error) {
		console.error("Error updating heavenly restriction:", error)
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
			return true // User has Heavenly Restriction
		} else {
			return false
		}
	} catch (error) {
		console.error("Error checking Heavenly Restriction:", error)
		throw error // Rethrow or handle as needed
	} finally {
		//
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
		console.error(`Error when retrieving clan for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
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
		console.error(`Error when retrieving techniques for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error when retrieving all user experience:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error when retrieving all quests:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error updating user techniques:", error)
		throw error
	} finally {
		// Generally, you keep the connection open in a web server context
		// await client.close();
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
		console.error("Error updating user clan:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error updating user heavenly techniques:", error)
		throw error
	} finally {
		// Generally, you keep the connection open in a web server context
		// await client.close();
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
		console.error(`Error when retrieving heavenly techniques for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
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
		console.error(`Error when toggling Heavenly Restriction for user with ID: ${userId}`, error)
		throw error
	} finally {
		// Optionally close the client connection
	}
}

export async function handleToggleHeavenlyRestrictionCommand(interaction) {
	// Ensure this function is handling a CommandInteraction
	if (!(interaction instanceof CommandInteraction)) return

	const userId = interaction.user.id // Discord user ID

	try {
		const success = await toggleHeavenlyRestriction(userId)

		if (success) {
			// Successfully toggled, inform the user
			await interaction.reply({
				content:
					"Your Heavenly Restriction status has been toggled. You can now harness its power differently!",
				ephemeral: true // Only the user can see this
			})
		} else {
			// User has not unlocked the feature, inform them accordingly
			await interaction.reply({
				content:
					"It seems you have not unlocked Heavenly Restriction yet. Keep training and exploring to unlock this ability!",
				ephemeral: true
			})
		}
	} catch (error) {
		console.error("Error toggling Heavenly Restriction:", error)
		// Respond to the user with an error message
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
		console.error(`Error when retrieving cursed energy for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error updating user cursed energy:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error(`Error when retrieving last vote time for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error updating user last vote time:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error when retrieving all users balance:", error)
		throw error
	} finally {
		await client.close()
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
		console.error(`Error when retrieving gamble info for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
	}
}
// update user gamble info
export async function updateUserGambleInfo(userId: string): Promise<void> {
	// Renamed for clarity
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		await usersCollection.updateOne(
			{ id: userId },
			{ $inc: { betCount: 1 } } // Use $inc to increment betCount
		)
	} catch (error) {
		console.error("Error updating user gamble info:", error)
		throw error
	}
}

function isNewDay(oldDate: Date, newDate: Date): boolean {
	return (
		oldDate.getFullYear() !== newDate.getFullYear() ||
		oldDate.getMonth() !== newDate.getMonth() ||
		oldDate.getDate() !== newDate.getDate() ||
		oldDate.getHours() !== newDate.getHours() // Check for hour change
	)
}

//update user gamble
export async function updateUserGamble(userId: string, newGamble: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)
		await usersCollection.updateOne({ id: userId }, { $set: { gamble: newGamble } })
	} catch (error) {
		console.error("Error updating user gamble:", error)
		throw error
	} finally {
		// await client.close()
	}
}

import moment from "moment-timezone"

async function dailyReset() {
	const database = client.db(mongoDatabase)
	const usersCollection = database.collection("users") // Correct way to get a collection
	const users = await usersCollection.find().toArray()

	for (const user of users) {
		const nowInUserTimezone = moment().tz(user.timezone)
		if (nowInUserTimezone.hour() === 0 && nowInUserTimezone.minute() === 0) {
			await usersCollection.updateOne({ id: user.id }, { $set: { gamblesToday: 0 } })
		}
	}
}

// Using node-cron for scheduling
import cron from "node-cron"
cron.schedule("0 0 * * *", dailyReset) // Runs at midnight every day

// get user work cooldown
export async function getUserWorkCooldown(userId: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user?.cooldowns?.work || 0
	} catch (error) {
		console.error(`Error when retrieving work cooldown for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error updating user work cooldown:", error)
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
		console.error(`Error when checking vote reward for user with ID: ${userId}`, error)
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
		console.error("Error updating user vote reward status:", error)
		throw error
	}
}

// addUserQuest
export async function addUserQuest(userId: string, questName: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Find the quest details from questsArray by questName
		const questToAdd = questsArray.find(quest => quest.name === questName)

		// Check if the quest was found and has the correct structure
		if (questToAdd) {
			let questData
			if (questToAdd.tasks) {
				// For quests with multiple tasks, copy the tasks structure
				questData = {
					id: questName,
					tasks: questToAdd.tasks.map(task => ({
						description: task.description,
						progress: 0,
						totalProgress: task.totalProgress
					}))
				}
			} else {
				// For quests with a single task, maintain the single progress structure
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
		console.error("Error adding user quest:", error)
		throw error
	}
}

// addUserQuestProgress
export async function addUserQuestProgress(userId, questId, increment, taskDescription = null) {
	try {
		// Assuming client is an instance of MongoClient that has been initialized previously.
		// You should connect to the client outside of this function and reuse the connection.
		// Connect to the MongoDB client and select the database and collection.
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		let updateResult

		// Check if a taskDescription is provided for quests with multiple tasks.
		if (taskDescription) {
			// Update logic for quests with multiple tasks.
			// Use "quests.id" to match the quests by their id and "tasks.description" to find the specific task.
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
			// Update logic for quests with a single task or no specific task provided.
			// This branch assumes that if no task description is given, the quest only has an overall progress to update.
			updateResult = await usersCollection.updateOne(
				{
					"id": userId,
					"quests.id": questId // Use "quests.id" to match the quest by id.
				},
				{
					$inc: { "quests.$.progress": increment }
				}
			)
		}

		// Error handling and logging
		if (updateResult.matchedCount === 0) {
			console.error("Quest not found for user:", userId)
			// Handle the case where the quest is not found for the user. You might want to send a message back or take some action.
		} else if (updateResult.modifiedCount === 0) {
			console.error("Quest progress was not updated for user:", userId)
			// Handle the case where the quest progress is not updated. This could be because the quest is already at total progress.
		} else {
			console.log("Quest progress updated successfully for user:", userId)
			// Optionally, you can handle post-update logic here, such as informing the user of their updated progress.
		}
	} catch (error) {
		console.error("Error updating user quest progress:", error)
		// Depending on your application's structure, you might want to handle the error, such as rolling back changes, retrying, etc.
		throw error // Re-throwing the error is a valid approach if you want the calling function to handle it.
	}
}

// getUserQuests
export async function getUserQuests(userId) {
	try {
		console.log("Attempting to retrieve quests for userId:", userId)
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })
		console.log("User document retrieved:", user) // This should log the user document or null

		if (!user) return { quests: [] }

		const userQuests = user.quests ? [...user.quests] : [] // Use spread operator to clone the quests array
		return { quests: userQuests }
	} catch (error) {
		console.error(`Error when retrieving quests for user with ID: ${userId}:`, error.stack)
		throw error
	} finally {
		// await client.close()
	}
}

// removeUserQuest function
export async function removeUserQuest(userId, questName) {
	try {
		// Assuming client is already connected and available
		const database = client.db(mongoDatabase)
		const usersCollection: Collection<User> = database.collection<User>(usersCollectionName)

		// Update the user's document by pulling the quest from the quests array by its name
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
		console.error(`Error when removing quest for user with ID: ${userId}`, error)
		throw error
	}
}

// update user max health max out at 275
export async function updateUserMaxHealth(userId: string, newMaxHealth: number): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Ensure the new max health does not exceed 275
		const maxHealth = Math.min(newMaxHealth, 275)

		// Get the current health of the user
		const user = await usersCollection.findOne({ id: userId })
		if (user) {
			let { currentHealth } = user
			// Ensure current health does not exceed the new max health
			if (currentHealth > maxHealth) {
				currentHealth = maxHealth
			}

			// Update the user's maxHealth and currentHealth if necessary
			await usersCollection.updateOne({ id: userId }, { $set: { maxHealth, currentHealth } })
		}
	} catch (error) {
		console.error("Error updating user max health:", error)
		throw error
	} finally {
		// await client.close(); // Close the connection if necessary
	}
}

// get user max health if maxhealth doesnt exist then create it as 100
export async function getUserMaxHealth(userId: string): Promise<number> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.maxHealth || 100 : 100
	} catch (error) {
		console.error(`Error when retrieving max health for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error creating trade request:", error)
		throw error
	}
}

// accept trade request
export async function acceptTradeRequest(tradeRequestId: string): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const tradeRequestsCollection = database.collection(tradeCollectionName)

		// Update the status of the trade request to 'accepted'
		await tradeRequestsCollection.updateOne({ _id: new ObjectId(tradeRequestId) }, { $set: { status: "accepted" } })
	} catch (error) {
		console.error("Error accepting trade request:", error)
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
			// Keep your mapping logic
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
		console.error("Error viewing trade requests:", error)
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
		console.error("Error validating trade request:", error)
		throw error
	}
}
export async function handleTradeAcceptance(tradeRequestId: string, userId: string): Promise<void> {
	const database = client.db(mongoDatabase)
	const tradeRequestsCollection = database.collection(tradeCollectionName)

	try {
		// Fetch the trade request
		const tradeRequest = await tradeRequestsCollection.findOne({
			_id: new ObjectId(tradeRequestId),
			status: "pending",
			targetUserId: userId // Ensure the acceptor is the target user
		})

		if (!tradeRequest) {
			throw new Error("Trade request not found or not valid for this user.")
		}

		// Decrement the quantity of the item from the initiator's inventory
		await removeItemFromUserInventory(tradeRequest.initiatorId, tradeRequest.item, Number(tradeRequest.quantity))

		// Increment the quantity of the item for the acceptor's inventory
		await addItemToUserInventory(tradeRequest.targetUserId, tradeRequest.item, Number(tradeRequest.quantity))
		// Update the trade request's status to 'accepted'
		await tradeRequestsCollection.updateOne({ _id: new ObjectId(tradeRequestId) }, { $set: { status: "accepted" } })
	} catch (error) {
		console.error("Error during trade acceptance:", error)
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
		console.error("Error getting previous trades:", error)
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
		console.error("Error resetting bet limit:", error)
		throw error
	}
}

// get user active techniques if it doesnt exist create it
export async function getUserActiveTechniques(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.activeTechniques : []
	} catch (error) {
		console.error(`Error when retrieving active techniques for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
	}
}

// get user active heavenly techniques
export async function getUserActiveHeavenlyTechniques(userId: string): Promise<string[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId })

		return user ? user.activeHeavenlyTechniques : []
	} catch (error) {
		console.error(`Error when retrieving active heavenly techniques for user with ID: ${userId}`, error)
		throw error
	} finally {
		// await client.close()
	}
}

// update user active techniques limit of 10 if it doesnt exist create it
export async function updateUserActiveTechniques(userId: string, newActiveTechniques: string[]): Promise<void> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Ensure the new active techniques do not exceed 10
		const activeTechniques = newActiveTechniques.slice(0, 20)

		await usersCollection.updateOne({ id: userId }, { $set: { activeTechniques } })
	} catch (error) {
		console.error("Error updating user active techniques:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error("Error updating user active heavenly techniques:", error)
		throw error
	} finally {
		// await client.close()
	}
}

export async function updateGamblersData(userId, wagerAmount, winnings, losses) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const result = await usersCollection.updateOne(
			{ id: userId },
			{
				$inc: {
					"gamblersData.amountGambled": wagerAmount,
					"gamblersData.amountWon": winnings,
					"gamblersData.amountLost": losses
				}
			}
		)

		if (result.modifiedCount === 1) {
			console.log("Gamblers data updated successfully.")
		} else {
			console.warn("User with specified ID not found for gamblers data update.")
		}
	} catch (error) {
		console.error("Error updating gamblers data:", error)
	} finally {
		// await client.close()
	}
}

// get gamblers data
export async function getGamblersData(userId) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		const user = await usersCollection.findOne({ id: userId }, { projection: { gamblersData: 1 } })

		return user ? user.gamblersData : null
	} catch (error) {
		console.error("Error getting gamblers data:", error)
	} finally {
		// await client.close()
	}
}

// update user status effects array of multiple status effects
export async function updateUserStatusEffects(userId: string, statusEffects: string[]): Promise<void> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Ensure the new status effects do not exceed 10
		const effects = statusEffects.slice(0, 5)

		await usersCollection.updateOne({ id: userId }, { $set: { statusEffects: effects } })
	} catch (error) {
		console.error("Error updating user status effects:", error)
		throw error
	} finally {
		// await client.close()
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
		console.error(`Error when retrieving status effects for user with ID: ${userId}`, error)
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
		console.error("Error removing all status effects:", error)
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
		console.error("Error updating user unlocked bosses:", error)
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
		console.error(`Error when retrieving unlocked bosses for user with ID: ${userId}`, error)
		throw error
	}
}
