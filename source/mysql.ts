interface QuestData {
	id: number
	name: string
	// add other quest properties here
}
/* eslint-disable indent */
import { config as dotenv } from "dotenv"
import mysql from "mysql"
import { UserProfile } from "./command"
import { BossData, CurseData } from "./interface"
import { InventoryItem } from "./inventory"
import { Item } from "./item"

// Load secrets from the .env file
dotenv()

const mysqlUser = process.env["MYSQL_USER"]
const mysqlPassword = process.env["MYSQL_PASSWORD"]
const mysqlDatabase = process.env["MYSQL_DATABASE"]
const mysqlHost = process.env["MYSQL_HOST"]
const mysqlPort = parseInt(process.env["MYSQL_PORT"])

console.log("MySQL User:", mysqlUser)
console.log("MySQL Password:", mysqlPassword)
console.log("MySQL Database:", mysqlDatabase)
console.log("MySQL Host:", mysqlHost)
console.log("MySQL Port:", mysqlPort)

/**
 * This file defines functions for interfacing with a MySQL database.
 * Use ES6 imports to import this file into your code.
 * The database is called: bot.
 * The tables are called: users, items, and inventories.
 * The table structure is already created.
 */

/*
CREATE TABLE inventories (
  id int(11) NOT NULL,
  user_id varchar(20) NOT NULL COMMENT 'discord uid',
  item_id int(11) NOT NULL,
  quantity int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE items (
  id int(11) NOT NULL,
  name varchar(100) NOT NULL,
  description varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE users (
  id varchar(20) NOT NULL COMMENT 'discord uid',
  balance bigint(20) NOT NULL DEFAULT 0 COMMENT 'money',
  experience bigint(20) NOT NULL DEFAULT 0 COMMENT 'discord xp',
  punch int(11) NOT NULL DEFAULT 0,
  slap int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE inventories
  ADD PRIMARY KEY (id),
  ADD KEY user (user_id),
  ADD KEY item (item_id);

ALTER TABLE items
  ADD PRIMARY KEY (id);

ALTER TABLE users
  ADD PRIMARY KEY (id);

ALTER TABLE inventories
  MODIFY id int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE items
  MODIFY id int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE inventories
  ADD CONSTRAINT item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT user FOREIGN KEY (user_id) REFERENCES `users` (id) ON DELETE CASCADE ON UPDATE CASCADE;
*/

// Connect to the database
const connection = mysql.createConnection({
	host: mysqlHost,
	port: mysqlPort,
	user: mysqlUser,
	password: mysqlPassword,
	database: mysqlDatabase
})

/**
 * Connects to the database.
 * @returns A promise that resolves to the connection object.
 */
export function connect() {
	// const mysqlUser = process.env["MYSQL_USER"]
	// const mysqlPassword = process.env["MYSQL_PASSWORD"]
	// const mysqlDatabase = process.env["MYSQL_DATABASE"]
	// const mysqlHost = process.env["MYSQL_HOST"]
	// const mysqlPort = parseInt(process.env["MYSQL_PORT"])

	return new Promise((resolve, reject) => {
		connection.connect(error => {
			if (error) {
				reject(error)
			} else {
				resolve(connection)
			}
		})
	})
}

/**
 * Disconnects from the database.
 * @returns A promise that resolves when the database is disconnected.
 * @throws An error if the database is not connected.
 */
export function disconnect(): Promise<void> {
	return new Promise((resolve, reject) => {
		connection.end(error => {
			if (error) {
				reject(error)
			} else {
				resolve()
			}
		})
	})
}

/**
 * Checks if the database is connected.
 * @returns A promise that resolves to true if the database is connected, false otherwise.
 */
export function isConnected(): Promise<boolean> {
	return new Promise(resolve => {
		connection.query("SELECT 1", error => {
			if (error) {
				resolve(false)
			} else {
				resolve(true)
			}
		})
	})
}

/**
 * Adds a user to the database.
 * @param id The user's ID.
 * @returns A promise that resolves to the result of the query.
 */
export async function addUser(id: string) {
	return new Promise((resolve, reject) => {
		connection.query("INSERT INTO users (id) VALUES (?)", [id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

/**
 * Gets a user's balance from the database.
 * @param id The user's ID.
 * @returns A promise that resolves to the user's balance.
 */
export async function getBalance(id: string): Promise<number> {
	return new Promise((resolve, reject) => {
		// Assuming the balance column exists in the users table
		const query = "SELECT balance FROM users WHERE id = ?"

		connection.query(query, [id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				// If the user is found, resolve the balance, otherwise resolve with 0
				if (results.length > 0) {
					resolve(results[0].balance)
				} else {
					resolve(0)
				}
			}
		})
	})
}

/**
 * Updates a user's balance in the database.
 * @param id The user's ID.
 * @param amount The amount to update the balance by.
 * @returns A promise that resolves to the result of the update query.
 */
export async function updateBalance(id: string, amount: number): Promise<number> {
	return new Promise((resolve, reject) => {
		// Assuming the balance column exists in the users table and is a numeric type
		const query = "UPDATE users SET balance = balance + ? WHERE id = ?"

		connection.query(query, [amount, id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

/**
 * Gets a user's experience points from the database.
 * @param id The user's ID.
 * @returns A promise that resolves to the user's experience points.
 */
export async function getExperience(id: string): Promise<number> {
	return new Promise((resolve, reject) => {
		// Assuming the experience column exists in the users table
		const query = "SELECT experience FROM users WHERE id = ?"

		connection.query(query, [id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				// If the user is found, resolve with the experience, otherwise resolve with 0
				if (results.length > 0) {
					resolve(results[0].experience)
				} else {
					resolve(0)
				}
			}
		})
	})
}

/**
 * Updates a user's experience points in the database.
 * @param id The user's ID.
 * @param amount The amount to update the experience points by.
 * @returns A promise that resolves to the result of the update query.
 */
export async function updateExperience(id: string, amount: number): Promise<number> {
	return new Promise((resolve, reject) => {
		// Assuming the experience column exists in the users table and is a numeric type
		const query = "UPDATE users SET experience = experience + ? WHERE id = ?"

		connection.query(query, [amount, id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}
/**
 * Retrieves a user's profile data from the database.
 * @param id The user's ID.
 * @returns A promise that resolves to the user's profile data.
 */
export async function getUserProfile(id: string): Promise<UserProfile> {
	return new Promise((resolve, reject) => {
		const query = "SELECT balance, experience, grade FROM users WHERE id = ?"

		connection.query(query, [id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				// Assuming the user is found, return the user's profile data
				resolve(results.length > 0 ? results[0] : null)
			}
		})
	})
}

export async function getPunch(id: string) {
	return new Promise((resolve, reject) => {
		const query = "SELECT punch FROM users WHERE id = ?"

		connection.query(query, [id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results.length > 0 ? results[0] : null)
			}
		})
	})
}

export async function updatePunch(id: string, amount: number) {
	return new Promise((resolve, reject) => {
		const query = "UPDATE users SET punch = punch + ? WHERE id = ?"

		connection.query(query, [amount, id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

export async function getSlap(id: string) {
	return new Promise((resolve, reject) => {
		const query = "SELECT slap FROM users WHERE id = ?"

		connection.query(query, [id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results.length > 0 ? results[0] : null)
			}
		})
	})
}

export async function updateSlap(id: string, amount: number) {
	return new Promise((resolve, reject) => {
		const query = "UPDATE users SET slap = slap + ? WHERE id = ?"

		connection.query(query, [amount, id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

// Check if an item with the specified name and description exists in the items table, and return its data
export async function getItem(name: string, description: string): Promise<Item | null> {
	return new Promise(resolve => {
		const query = "SELECT * FROM items WHERE name = ? AND description = ? LIMIT 1"

		connection.query(query, [name, description], (error, results) => {
			if (error) {
				resolve(null)
			} else {
				const a: Item | null =
					results.length > 0
						? ({
								id: results[0].id,
								name: results[0].name,
								description: results[0].description
						  } as Item)
						: null
				resolve(a)
			}
		})
	})
}

//  1. Add an item with the specified name and description to the items table and return its data
export async function addItem(name: string, description: string, price: number): Promise<Item> {
	return new Promise((resolve, reject) => {
		const query = "INSERT INTO items (name, description, price) VALUES (?, ?, ?)"

		connection.query(query, [name, description, price], (error, results) => {
			if (error) {
				reject(error)
			} else {
				// Assuming the item is found, return the item's data
				resolve({
					id: results.insertId,
					name,
					description,
					price
				})
			}
		})
	})
}

// 2. Giving the item to a user. - INSERT INTO inventories (user_id, item_id, quantity) VALUES ('UserID', ItemID, Quantity);
export async function giveItemToUser(userId: string, shopItemId: number) {
	return new Promise((resolve, reject) => {
		const query = "INSERT INTO inventories (user_id, shop_item_id, item_id, quantity) VALUES (?, ?, ?, ?)"

		connection.query(query, [userId, shopItemId, 1], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

// Checks if the user has the item in their inventory
export async function userHasItem(userId: string, itemId: number): Promise<boolean> {
	return new Promise(resolve => {
		const query = "SELECT * FROM inventories WHERE user_id = ? AND item_id = ? LIMIT 1"

		connection.query(query, [userId, itemId], (error, results) => {
			if (error) {
				resolve(false)
			} else {
				// Assuming the item is found, return true
				resolve(results.length > 0)
			}
		})
	})
}

// Increment the quantity of the item in the user's inventory
export async function incrementInventoryItemQuantity(userId: string, itemId: number) {
	return new Promise((resolve, reject) => {
		const query = "UPDATE inventories SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?"

		connection.query(query, [userId, itemId], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

// 3. Removing the item from a user. - DELETE FROM inventories WHERE user_id = 'UserID' AND item_id = ItemID;
export async function removeItemFromUser(userId: string, itemId: number, quantity: number): Promise<void> {
	return new Promise((resolve, reject) => {
		const query = "DELETE FROM inventories WHERE user_id = ? AND item_id = ?"

		connection.query(query, [userId, itemId, quantity], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

// 4. Incrementing the number of a given item a user has. UPDATE inventories SET quantity = quantity + IncrementValue WHERE user_id = 'UserID' AND item_id = ItemID;
export async function incrementItemForUser(userId: string, itemId: number, incrementValue: number, quantity: number) {
	return new Promise((resolve, reject) => {
		const query = "UPDATE inventories SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?"

		connection.query(query, [incrementValue, userId, itemId, quantity], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

// 5. Removing an item. DELETE FROM items WHERE id = ItemID;
export async function removeItem(itemId: number) {
	return new Promise((resolve, reject) => {
		const query = "DELETE FROM items WHERE id = ?"

		connection.query(query, [itemId], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

// 6. Get all items in a user's inventory, remember the items table has the name and description while the inventories table has the user_id and quantity
export async function getUserInventory(userId: string): Promise<InventoryItem[]> {
	return new Promise((resolve, reject) => {
		const query =
			"SELECT items.id, items.name, items.description, inventories.quantity FROM items INNER JOIN inventories ON items.id = inventories.item_id WHERE inventories.user_id = ?"

		connection.query(query, [userId], (error, results) => {
			if (error) {
				reject(error)
			} else {
				// Assuming the user is found, return the user's inventory
				resolve(
					results.map(
						result =>
							({
								name: result.name,
								description: result.description,
								quantity: result.quantity
							}) as InventoryItem
					)
				)
			}
		})
	})
}
// 7. removing a certain amount of coins from a user's balance. UPDATE users SET balance = balance - Amount WHERE id = 'UserID';
export async function removeBalance(id: string, amount: number) {
	return new Promise((resolve, reject) => {
		const query = "UPDATE users SET balance = balance - ? WHERE id = ?"

		connection.query(query, [amount, id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}
// 8. crafting where you would need a certain amount of items to craft a new item then add it to the inventory and remove the items used to craft it. - INSERT INTO inventories (user_id, item_id, quantity) VALUES ('UserID', ItemID, Quantity);
export async function craftItem(userId: string, itemId: number, quantity: number) {
	return new Promise((resolve, reject) => {
		const query = "INSERT INTO inventories (user_id, item_id, quantity) VALUES (?, ?, ?)"

		connection.query(query, [userId, itemId, quantity], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}
// 9. faggot
export async function getAllItems(): Promise<Item[]> {
	return new Promise(resolve => {
		const query = "SELECT * FROM items"

		connection.query(query, (error, results) => {
			if (error) {
				resolve([])
			} else {
				const items = results.map(row => ({
					id: row.id,
					name: row.name,
					description: row.description,
					price: row.price
				}))
				resolve(items)
			}
		})
	})
}

// Function to fetch boss data by name
export async function getBossByName(bossName: string): Promise<BossData | null> {
	return new Promise((resolve, reject) => {
		const sql = "SELECT * FROM bosses WHERE name = ?"
		connection.query(sql, [bossName], (err, results) => {
			if (err) {
				reject(err)
			} else {
				resolve(results.length > 0 ? results[0] : null)
			}
		})
	})
}

export async function updateBossHealth(bossName: string, newHealth: number): Promise<void> {
	return new Promise((resolve, reject) => {
		if (typeof newHealth !== "number" || isNaN(newHealth)) {
			return reject(new Error(`Invalid newHealth value: ${newHealth}`))
		}

		const sql = "UPDATE bosses SET current_health = ? WHERE name = ?"
		console.log(`Updating health of boss '${bossName}' to ${newHealth}`) // Log for debugging
		connection.query(sql, [newHealth, bossName], err => {
			if (err) {
				console.error(`Error updating health of boss '${bossName}':`, err) // Enhanced error logging
				reject(err)
			} else {
				resolve()
			}
		})
	})
}

export async function getAllBossesFromDatabase(): Promise<BossData[]> {
	return new Promise((resolve, reject) => {
		const sql = "SELECT * FROM bosses"
		connection.query(sql, (err, results) => {
			if (err) {
				reject(err)
			} else {
				resolve(results)
			}
		})
	})
}

export async function getBossAttackLine(bossName: string, attackName: string): Promise<string> {
	switch (bossName) {
		case "Sukuna":
			if (attackName === "Cleave") {
				return "Domain Expansion: Malevolent Shrine!"
			} else {
				// Dismantle
				return "You're weak!"
			}
		// ... add cases for other bosses ...
		default:
			return "You dare challenge me?"
	}
}

/**
 * Retrieves a user's profile data from the database.
 * @param id The user's ID.
 * @returns A promise that resolves to the user's profile data.
 */
export async function getPlayerGradeFromDatabase(id: string): Promise<UserProfile> {
	return new Promise((resolve, reject) => {
		const query = "SELECT grade FROM users WHERE id = ?"

		connection.query(query, [id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				// Assuming the user is found, return the user's profile data
				resolve(results.length > 0 ? results[0] : null)
			}
		})
	})
}

export async function getPlayerHealth(id: string): Promise<UserProfile> {
	return new Promise((resolve, reject) => {
		const query = "SELECT health FROM users WHERE id = ?"

		connection.query(query, [id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				// Assuming the user is found, return the user's profile data
				resolve(results.length > 0 ? results[0] : null)
			}
		})
	})
}

export async function updatePlayerHealth(id: string, newHealth: number): Promise<void> {
	return new Promise((resolve, reject) => {
		if (typeof newHealth !== "number" || isNaN(newHealth)) {
			return reject(new Error(`Invalid newHealth value: ${newHealth}`))
		}

		const sql = "UPDATE users SET health = ? WHERE id = ?"
		console.log(`Updating health of user '${id}' to ${newHealth}`) // Log for debugging
		connection.query(sql, [newHealth, id], err => {
			if (err) {
				console.error(`Error updating health of user '${id}':`, err) // Enhanced error logging
				reject(err)
			} else {
				resolve()
			}
		})
	})
}

export async function addItemToUserInventory(userId: string, itemId: number) {
	return new Promise((resolve, reject) => {
		// First, check if the item already exists in the user's inventory
		const checkQuery = "SELECT quantity FROM inventories WHERE user_id = ? AND item_id = ?"

		connection.query(checkQuery, [userId, itemId], async (error, results) => {
			if (error) {
				return reject(error)
			}

			// If the item exists, increment its quantity
			if (results.length > 0) {
				try {
					const incrementResult = await incrementInventoryItemQuantity(userId, itemId)
					resolve(incrementResult)
				} catch (error) {
					reject(error)
				}
			} else {
				// If the item does not exist, add it to the inventory
				try {
					const addItemResult = await giveItemToUser(userId, itemId)
					resolve(addItemResult)
				} catch (error) {
					reject(error)
				}
			}
		})
	})
}

// fetchAllQuestsFromDatabase function
export async function fetchAllQuestsFromDatabase(): Promise<QuestData[]> {
	return new Promise((resolve, reject) => {
		const sql = "SELECT * FROM quest"
		connection.query(sql, (err, results) => {
			if (err) {
				reject(err)
			} else {
				resolve(results)
			}
		})
	})
}

export async function getPlayerStatsFromDatabase(id: string): Promise<UserProfile> {
	return new Promise((resolve, reject) => {
		const query = "SELECT grade, health FROM users WHERE id = ?"

		connection.query(query, [id], (error, results) => {
			if (error) {
				reject(error)
			} else {
				// Assuming the user is found, return the user's profile data
				resolve(results.length > 0 ? results[0] : null)
			}
		})
	})
}
// fetch curse data from database curses
export async function fetchCurseDataFromDatabase(curseId: number): Promise<CurseData | null> {
	return new Promise((resolve, reject) => {
		const sql = "SELECT id, name, health, strength FROM curses WHERE id = ?"
		connection.query(sql, [curseId], (err, results) => {
			if (err) {
				reject(err)
			} else if (results.length === 0) {
				resolve(null)
			} else {
				const curseData = {
					id: results[0].id,
					name: results[0].name,
					health: results[0].health,
					strength: results[0].strength
				}
				resolve(curseData)
			}
		})
	})
}

// does player have domain 0 = no 1 = yes
export async function doesPlayerHaveDomain(id: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const query = "SELECT has_domain FROM users WHERE id = ?"
		connection.query(query, [id], (err, results) => {
			if (err) {
				reject(err)
			} else {
				resolve(results.length > 0 ? results[0].has_domain === 1 : false)
			}
		})
	})
}
export async function getItemPrice(itemId: number): Promise<number> {
	return new Promise((resolve, reject) => {
		// Corrected query to include WHERE clause for filtering by itemId
		const query = "SELECT price FROM items WHERE id = ?"
		connection.query(query, [itemId], (err, results) => {
			if (err) {
				reject(err)
			} else {
				// Assuming the item exists, return its price, otherwise return 0
				resolve(results.length > 0 ? results[0].price : 0)
			}
		})
	})
}

// getshopitems
export async function getShopItems(): Promise<Item[]> {
	return new Promise((resolve, reject) => {
		const query = "SELECT * FROM shop"
		connection.query(query, (err, results) => {
			if (err) {
				reject(err)
			} else {
				const items = results.map(row => ({
					id: row.id,
					name: row.name,
					description: row.description,
					price: row.price
				}))
				resolve(items)
			}
		})
	})
}
