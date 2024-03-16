import { EmbedBuilder } from "discord.js"

export function calculateDamage(playerGrade: string, domainEffectMultiplier: number = 1): number {
	const baseDamage = 10
	const gradeDamageBonus = getGradeDamageBonus(playerGrade)
	const randomVariationPercentage = 0.2

	let totalDamage = baseDamage * gradeDamageBonus * domainEffectMultiplier

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

export function calculateGradeFromExperience(newXP: number): string {
	// Define XP thresholds for each grade. Adjust values as needed.
	const gradeThresholds = [
		{ grade: "Special Grade", xp: 2500 },
		{ grade: "Grade 1", xp: 1000 },
		{ grade: "Semi-Grade 1", xp: 750 },
		{ grade: "Grade 2", xp: 500 },
		{ grade: "Grade 3", xp: 250 },
		{ grade: "Grade 4", xp: 0 } // Assuming Grade 4 is the starting/lowest grade
	]

	// Find the highest grade the user qualifies for based on their XP
	const newGrade = gradeThresholds.find(gradeThreshold => newXP >= gradeThreshold.xp)?.grade

	// Return the calculated grade; default to "Grade 4" if something goes wrong
	return newGrade || "Grade 4"
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
			name: `🔮 ${item.name} (x${item.quantity})`,
			value: item.description,
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
		"the remnants of a fierce domain expansion"
	]
	return locations[Math.floor(Math.random() * locations.length)]
}
