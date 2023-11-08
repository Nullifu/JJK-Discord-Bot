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
