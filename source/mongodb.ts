/* eslint-disable @typescript-eslint/no-unused-vars */
import { config as dotenv } from "dotenv"
import { Collection, InsertOneResult, MongoClient } from "mongodb"
import { BossData, User, UserProfile } from "./interface"
import { titles } from "./items jobs.js"

dotenv()

const bossCollectionName = "bosses"
const usersCollectionName = "users"

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
	await client.close() // Close the connection after the operation
	return user !== null // Returns true if the user exists, false otherwise
}

const currentBotVersion = "1.0.0" // Replace with your current bot version

export async function addUser(
	id: string,
	initialBalance: number = 100,
	initialGrade: string = "Grade 4",
	initialExperience: number = 0,
	initialHealth: number = 100,
	initialJob: string = "Student",
	initialBankBalance: number = 0
): Promise<{ insertedId?: unknown; error?: string }> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection(usersCollectionName)

		// Now inserting a user document with id, balance, grade, experience, health, domain, and inventory
		const insertResult: InsertOneResult<Document> = await usersCollection.insertOne({
			id: id,
			balance: initialBalance,
			bankBalance: initialBankBalance,
			job: initialJob,
			grade: initialGrade,
			experience: initialExperience,
			health: initialHealth,
			domain: null,
			activeTitle: null,
			unlockedTitles: [],
			inventory: [],
			achievements: [],
			lastAlertedVersion: []
		})

		console.log(`Inserted user with ID: ${insertResult.insertedId}`)
		return { insertedId: insertResult.insertedId }
	} catch (error) {
		console.error(`Error when adding user with ID: ${id}`, error)
		if (error.code === 11000) {
			return { error: "User already exists" }
		} else {
			return { error: error.message }
		}
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

		// Update the user's balance by the specified amount
		const updateResult = await usersCollection.updateOne(
			{ id: id },
			{ $inc: { balance: amount } } // Increment the balance field by the amount
		)

		if (updateResult.matchedCount === 0) {
			console.log(`No user found with ID: ${id}`)
			throw new Error(`No user found with ID: ${id}`)
		}

		console.log(`Updated balance for user with ID: ${id}`)
	} catch (error) {
		console.error(`Error when updating balance for user with ID: ${id}`, error)
		throw error // Rethrow the error so it can be caught and handled by the calling code
	} finally {
		// await client.close()
	}
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
	try {
		const database = client.db(mongoDatabase)
		const usersCollection = database.collection<User>(usersCollectionName) // Use any if the collection's schema is not strictly typed

		// Fetch the user profile from the database
		const userDocument = await usersCollection.findOne(
			{ id: userId },
			{ projection: { _id: 0, balance: 1, experience: 1, grade: 1, domain: 1, job: 1, activeTitle: 1 } }
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
			activeTitle: userDocument.activeTitle || null
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

		// Check if the item already exists in the inventory
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

// get bosses from bosses collection also get the health and current health
export async function getBosses(): Promise<BossData[]> {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const domainsCollection = database.collection(bossCollectionName)

		const bosses = (await domainsCollection.find({}).toArray()).map(boss => ({
			id: boss._id.toString(), // Convert MongoDB ObjectId to string
			name: boss.name,
			max_health: boss.max_health, // Access the Int32 value directly
			current_health: boss.current_health, // Access the Int32 value directly
			image_url: boss.image_URL, // Access the String value directly, make sure the property name matches
			difficulty_tier: boss.difficulty_tier // Assuming this is the correct property and type
		}))

		return bosses
	} catch (error) {
		console.error("Error when retrieving bosses:", error)
		throw error
	} finally {
		// Usually, you shouldn't close the client if you plan to use it again soon.
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
		await client.close()
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