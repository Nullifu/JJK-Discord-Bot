/* eslint-disable indent */
import { config as dotenv } from "dotenv"
import mysql from "mysql"
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
	const mysqlUser = process.env["MYSQL_USER"]
	const mysqlPassword = process.env["MYSQL_PASSWORD"]
	const mysqlDatabase = process.env["MYSQL_DATABASE"]
	const mysqlHost = process.env["MYSQL_HOST"]
	const mysqlPort = parseInt(process.env["MYSQL_PORT"])

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
export async function updateBalance(id: string, amount: number): Promise<any> {
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
export async function updateExperience(id: string, amount: number): Promise<any> {
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
export async function getUserProfile(id: string): Promise<any> {
	return new Promise((resolve, reject) => {
		const query = "SELECT id, balance, experience FROM users WHERE id = ?"

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
export async function addItem(name: string, description: string): Promise<Item> {
	return new Promise((resolve, reject) => {
		const query = "INSERT INTO items (name, description) VALUES (?, ?)"

		connection.query(query, [name, description], (error, results) => {
			if (error) {
				reject(error)
			} else {
				// Assuming the item is found, return the item's data
				resolve({
					id: results.insertId,
					name,
					description
				})
			}
		})
	})
}

// 2. Giving the item to a user. - INSERT INTO inventories (user_id, item_id, quantity) VALUES ('UserID', ItemID, Quantity);
export async function giveItemToUser(userId: string, itemId: number) {
	return new Promise((resolve, reject) => {
		const query = "INSERT INTO inventories (user_id, item_id) VALUES (?, ?)"

		connection.query(query, [userId, itemId], (error, results) => {
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
export async function removeItemFromUser(userId: string, itemId: number) {
	return new Promise((resolve, reject) => {
		const query = "DELETE FROM inventories WHERE user_id = ? AND item_id = ?"

		connection.query(query, [userId, itemId], (error, results) => {
			if (error) {
				reject(error)
			} else {
				resolve(results)
			}
		})
	})
}

// 4. Incrementing the number of a given item a user has. UPDATE inventories SET quantity = quantity + IncrementValue WHERE user_id = 'UserID' AND item_id = ItemID;
export async function incrementItemForUser(userId: string, itemId: number, incrementValue: number) {
	return new Promise((resolve, reject) => {
		const query = "UPDATE inventories SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?"

		connection.query(query, [incrementValue, userId, itemId], (error, results) => {
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
