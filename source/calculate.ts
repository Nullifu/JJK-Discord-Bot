import { EmbedBuilder } from "discord.js"
import { BossDrop, bossDrops } from "./items jobs.js"
import { checkUserHasHeavenlyRestriction } from "./mongodb.js"

export function calculateDamage(
	playerGrade: string,
	userId: string,
	ignoreHeavenlyRestriction: boolean = false
): number {
	const baseDamage = 10
	const gradeDamageBonus = getGradeDamageBonus(playerGrade)
	const randomVariationPercentage = 0.2
	const heavenlyRestrictionMultiplier = 1.5 // For example, 50% damage increase

	// Check if the user has Heavenly Restriction

	let totalDamage = baseDamage * gradeDamageBonus

	if (!ignoreHeavenlyRestriction) {
		const hasHeavenlyRestriction = checkUserHasHeavenlyRestriction(userId)
		if (hasHeavenlyRestriction) {
			totalDamage *= heavenlyRestrictionMultiplier
		}
	}

	// Apply random variation
	const randomVariation = totalDamage * randomVariationPercentage
	const randomFactor = (Math.random() * 2 - 1) * randomVariation // Between -randomVariation and +randomVariation
	totalDamage += randomFactor

	return Math.max(1, Math.round(totalDamage))
}

function getGradeDamageBonus(grade: string): number {
	switch (grade) {
		case "Special Grade":
			return 2.0
		case "Grade 1":
			return 1.7
		case "Semi-Grade 1":
			return 1.4
		case "Grade 2":
			return 1.2
		case "Grade 3":
			return 1.1
		case "Grade 4":
		default:
			return 1.0
	}
}

export function getRandomXPGain(min = 10, max = 70) {
	// The maximum is inclusive and the minimum is inclusive
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function createInventoryPage(items, startIndex, itemsPerPage, user) {
	const pageItems = items.slice(startIndex, startIndex + itemsPerPage)
	const totalItems = items.length
	const totalPages = Math.ceil(totalItems / itemsPerPage)
	const currentPage = startIndex / itemsPerPage + 1 // Calculate the current page

	const inventoryEmbed = new EmbedBuilder()
		.setColor(0x1f8b4c) // Consider using a theme color that fits Jujutsu Kaisen
		.setTitle(`${user.username}'s Cursed Inventory`) // Adding a thematic title
		.setThumbnail(user.displayAvatarURL())
		.setDescription(
			pageItems.length ? "Your cursed items:" : "Your inventory is as empty as a void of cursed energy."
		)
		.setFooter({ text: `Page ${currentPage} of ${totalPages}` }) // Adding page info in the footer

	// Add each inventory item to the embed with Jujutsu Kaisen flavor
	pageItems.forEach(item => {
		inventoryEmbed.addFields({
			name: `🔮 ${item.name}`,
			value: `(x${item.quantity})`,
			inline: false
		})
	})

	return inventoryEmbed
}

export function getRandomLocation() {
	const locations = [
		"a desolate alleyway shrouded in cursed energy",
		"the Tokyo Metropolitan Magic Technical College",
		"an ancient and cursed forest",
		"the remnants of a fierce domain expansion",
		"the Shibuya Incident aftermath",
		"the eerie corridors of a cursed shrine",
		"a cursed spirit's lair",
		"the heart of a domain",
		"shibuya"
	]
	return locations[Math.floor(Math.random() * locations.length)]
}

export function getRandomEarnings(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getRandomAmount(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function calculateEarnings(userProfile) {
	let earnings = 0
	switch (userProfile.job) {
		case "Student":
			earnings = getRandomAmount(250, 750)
			break
		case "Janitor":
			earnings = getRandomAmount(2500, 7500)
			break
		case "Mechanic":
			earnings = getRandomAmount(9500, 17000)
			break
		case "Jujutsu Janitor":
			earnings = getRandomAmount(25000, 37500)
			break
		case "Jujutsu Sorcerer":
			earnings = getRandomAmount(40000, 56000)
			break
		case "Satoru Gojo's Assistant":
			earnings = getRandomAmount(125000, 235000)
			break
		case "Curse Hunter":
			earnings = getRandomAmount(62500, 74500)
			break
		default: // Non-Sorcerer and any other jobs
			earnings = getRandomAmount(100, 1000)
	}
	return earnings
}

export function getBossDrop(bossName: string): BossDrop {
	const drops = bossDrops[bossName]
	if (!drops || drops.length === 0) throw new Error("No drops found for the boss!")
	const dropIndex = Math.floor(Math.random() * drops.length)
	return drops[dropIndex]
}
