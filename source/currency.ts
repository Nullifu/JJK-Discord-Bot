import db from "./currencydb.js"

// Function to get a user's currency
export async function getUserCurrency(userId: string): Promise<number> {
	await db.read()
	const record = db.data?.records.find(rec => rec.id === userId)
	return record?.currency ?? 0
}

// Function to add currency to a user
export async function addUserCurrency(userId: string, amount: number): Promise<void> {
	await db.read()
	const record = db.data?.records.find(rec => rec.id === userId)

	if (record) {
		record.currency += amount
	} else {
		db.data?.records.push({ id: userId, currency: amount })
	}

	await db.write()
}

// Function to reduce a user's currency
export async function removeUserCurrency(userId: string, amount: number): Promise<void> {
	await db.read()
	const record = db.data?.records.find(rec => rec.id === userId)

	if (record && record.currency >= amount) {
		record.currency -= amount
	} else {
		throw new Error("User doesn't have enough currency.")
	}

	await db.write()
}

export async function updateUserBalance(userId: string, coinsChange: number): Promise<void> {
	// Read the current state of the database
	await db.read()

	// If the user doesn't have a balance, initialize it to 0
	const currentBalance = db.data?.users[userId]?.balance || 0

	// Update the user's balance
	db.data.users[userId] = {
		...db.data.users[userId],
		balance: currentBalance + coinsChange
	}

	// Write the changes back to the database
	await db.write()
}
