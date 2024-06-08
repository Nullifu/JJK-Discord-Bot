import { EmbedBuilder } from "discord.js"
import { bossDrops } from "./bossdrops.js"
import logger from "./bot.js"
import { itemEffects } from "./items jobs.js"
import {
	checkUserHasHeavenlyRestriction,
	getUserFavouriteCommand,
	getUserInateClan,
	getUserItemEffects,
	getUserProfile,
	getUserRegisteredDate,
	getUserShikigami,
	getUserStats,
	getUserWorked,
	updateUserCommandsUsed
} from "./mongodb.js"
import { getRandomQuote } from "./shikigami.js"

export function calculateDamage(
	playerGrade: string,
	userId: string,
	ignoreHeavenlyRestriction: boolean = false
): number {
	const baseDamage = 10
	const gradeDamageBonus = getGradeDamageBonus(playerGrade)
	const randomVariationPercentage = 0.2
	const heavenlyRestrictionMultiplier = 1.5

	let totalDamage = baseDamage * gradeDamageBonus

	if (!ignoreHeavenlyRestriction) {
		const hasHeavenlyRestriction = checkUserHasHeavenlyRestriction(userId)
		if (hasHeavenlyRestriction) {
			totalDamage *= heavenlyRestrictionMultiplier
		}
	}

	const randomVariation = totalDamage * randomVariationPercentage
	const randomFactor = (Math.random() * 2 - 1) * randomVariation
	totalDamage += randomFactor

	return Math.max(1, Math.round(totalDamage))
}
// function bloodlust boost
export function calculateBloodlustBoost(
	playerGrade: string,
	userId: string,
	ignoreHeavenlyRestriction: boolean = false
): number {
	const baseDamage = 10
	const gradeDamageBonus = getGradeDamageBonus(playerGrade)
	const randomVariationPercentage = 0.2
	const heavenlyRestrictionMultiplier = 1.5

	let totalDamage = baseDamage * gradeDamageBonus

	if (!ignoreHeavenlyRestriction) {
		const hasHeavenlyRestriction = checkUserHasHeavenlyRestriction(userId)
		if (hasHeavenlyRestriction) {
			totalDamage *= heavenlyRestrictionMultiplier
		}
	}

	const randomVariation = totalDamage * randomVariationPercentage
	const randomFactor = (Math.random() * 2 - 1) * randomVariation // Between -randomVariation and +randomVariation
	totalDamage += randomFactor

	return Math.max(1, Math.round(totalDamage))
}

function getGradeDamageBonus(grade: string): number {
	switch (grade) {
		case "Special Grade 1":
			return 2.5
		case "Special Grade 2":
			return 2.2
		case "Special Grade 3":
			return 2.0
		case "Special Grade 4":
			return 1.8
		case "Special Grade":
			return 1.6
		case "Grade 1":
			return 1.5
		case "Semi-Grade 1":
			return 1.3
		case "Grade 2":
			return 1.1
		case "Grade 3":
			return 1.05
		case "Grade 4":
		default:
			return 1.0
	}
}

export function getRandomXPGain(min = 150, max = 320) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function createInventoryPage(items, startIndex, itemsPerPage, user) {
	const pageItems = items.slice(startIndex, startIndex + itemsPerPage)
	const totalItems = items.length
	const totalPages = Math.ceil(totalItems / itemsPerPage)
	const currentPage = startIndex / itemsPerPage + 1

	const inventoryEmbed = new EmbedBuilder()
		.setColor(0x1f8b4c)
		.setTitle(`${user.username}'s Cursed Inventory`)
		.setThumbnail(user.displayAvatarURL())
		.setDescription(
			pageItems.length ? "Your cursed items:" : "Your inventory is as empty as a void of cursed energy."
		)
		.setFooter({ text: `Page ${currentPage} of ${totalPages}` })

	pageItems.forEach(item => {
		inventoryEmbed.addFields({
			name: `🔮 ${item.name}`,
			value: `(x${item.quantity})`,
			inline: false
		})
	})

	return inventoryEmbed
}
export async function handleEffectEmbed(userId) {
	const userEffects = await getUserItemEffects(userId)

	const effectEmbed = new EmbedBuilder().setColor("#0099ff").setTitle("Active Item Effects")

	if (userEffects.length === 0) {
		effectEmbed.setDescription("You currently have no active item effects.")
	} else {
		effectEmbed.setDescription("Here are your currently active item effects:")

		userEffects.forEach(effect => {
			const effectDetails = itemEffects.find(e => e.name === effect.itemName)
			if (effectDetails) {
				const endTime = new Date(effect.endTime)
				const now = new Date()
				const remainingTime = endTime.getTime() - now.getTime()
				const remainingMinutes = Math.round(remainingTime / 60000)

				let valueString = `• ${effectDetails.description}`
				if (remainingTime > 0) {
					valueString += `\n• Time remaining: ${remainingMinutes} minutes`
				} else {
					valueString += "\n• Effect expired"
				}

				effectEmbed.addFields({ name: effectDetails.name, value: valueString, inline: false })
			}
		})
	}

	return effectEmbed
}

// build clandata embed

export async function handleClanDataEmbed(userId) {
	const userClanData = await getUserInateClan(userId)
	const clanEmbed = new EmbedBuilder().setColor("#0099ff").setTitle("Clan Information")

	if (!userClanData || !userClanData.clan) {
		clanEmbed.setDescription("You are not a member of any clan.")
	} else {
		clanEmbed.setDescription(`You are a member of the ${userClanData.clan} clan.`)

		if (userClanData.clan === "Demon Vessel") {
			clanEmbed
				.setDescription("You've got the mark of **Ryomen Sukuna** on you.")
				.addFields({ name: "Innate Power", value: "The ability to become the **Curse King**\n" })
		}

		if (userClanData.clan === "Limitless") {
			clanEmbed
				.setDescription("You've got the sacred **Six Eyes**.")
				.addFields({ name: "Innate Power", value: "The ability to Bring Fourth Infinity at will\n" })
		}

		clanEmbed.addFields(
			{ name: "Clan", value: userClanData.clan.toString(), inline: true },
			{
				name: "Experience",
				value: userClanData.experience ? userClanData.experience.toString() : "0",
				inline: true
			},
			{ name: "Tier", value: userClanData.tier ? userClanData.tier.toString() : "0", inline: true }
		)
	}

	return clanEmbed
}
export async function handleShikigamiEmbed(userid) {
	const userShikigami = await getUserShikigami(userid)

	const embed = new EmbedBuilder().setColor("#0099ff").setTitle("Shikigami")

	if (userShikigami.length === 0) {
		embed.setDescription("You haven't tamed any shikigami yet!")
	} else {
		const shikigamiFields = userShikigami.map(shikigami => {
			return {
				name: `${shikigami.name}`,
				value: `Experience: ${shikigami.experience}\nHealth: ${shikigami.health}`,
				inline: true
			}
		})
		embed.addFields(shikigamiFields)
	}

	return embed
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
export function getrandomsukuna() {
	const wordinggg = [
		"Keep going.",
		"Oh? Just a little more.",
		"Nearly there..",
		"Impossible.",
		"Is this brat from that time..?"
	]
	return wordinggg[Math.floor(Math.random() * wordinggg.length)]
}

export function getRandomEarnings(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getRandomAmount(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function calculateEarnings(userProfile) {
	let earnings

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
			earnings = getRandomAmount(40000, 56500)
			break
		case "Satoru Gojo's Assistant":
			earnings = getRandomAmount(125000, 235000)
			break
		case "Curse Hunter":
			earnings = getRandomAmount(62500, 74500)
			break
		case "Hakari Kinji's Lawyer":
			earnings = getRandomAmount(185000, 300000)
			break
		case "Veil Caster":
			earnings = getRandomAmount(275000, 542000)
			break
		default:
			earnings = getRandomAmount(100, 1000)
	}

	return earnings
}

export const rarityProbabilities: Record<string, number> = {
	"common": 0.7,
	"rare": 0.5,
	"very rare": 0.1,
	"ultra rare": 0.05
}

export async function getBossDrops(userId, bossName) {
	const drops = bossDrops[bossName]
	if (!drops || drops.length === 0) throw new Error("No drops found for the boss!")

	const userEffects = await getUserItemEffects(userId)
	const luckyEffect = userEffects.find(effect => effect.effectName === "Lucky")
	const dropIncreaseFactor = luckyEffect ? 0.1 : 0 // Increase drop probability by 10% if Lucky effect is active

	const obtainedDrops = []
	const numberOfDrops = Math.floor(Math.random() * 3) + 1

	while (obtainedDrops.length < numberOfDrops) {
		const randomIndex = Math.floor(Math.random() * drops.length)
		const drop = drops[randomIndex]
		let dropProbability = drop.probability ?? rarityProbabilities[drop.rarity.toLowerCase()] ?? 0.5

		dropProbability += dropIncreaseFactor

		if (Math.random() < dropProbability) {
			obtainedDrops.push(drop)
			console.log(`Obtained drop: ${drop.name}`)
		} else {
			console.log(`Did not obtain drop: ${drop.name}`)
		}

		if (obtainedDrops.length === 0 && obtainedDrops.length + 1 === numberOfDrops) {
			const guaranteedDropIndex = Math.floor(Math.random() * drops.length)
			obtainedDrops.push(drops[guaranteedDropIndex])
			console.log(`Guaranteed drop: ${drops[guaranteedDropIndex].name}`)
		}
	}

	return obtainedDrops
}

export async function createStatsEmbed(user) {
	await updateUserCommandsUsed(user.id)

	const favoriteCommandData = await getUserFavouriteCommand(user.id)
	logger.info("Favorite Command Data:", favoriteCommandData)
	const favouriteCommand = `**${favoriteCommandData.command}**\n\`Time's Used: ${favoriteCommandData.count}\``

	const userStats = await getUserStats(user.id)
	const favoriteTechData = userStats.stats.filter(stat => stat.technique)
	let favouriteTech = "No favorite technique yet"
	let maxTechCount = 0

	for (const { technique, count } of favoriteTechData) {
		if (count > maxTechCount) {
			maxTechCount = count
			favouriteTech = `**${technique}**\n\`Time's Used: ${maxTechCount}\``
		}
	}

	const registeredDate = await getUserRegisteredDate(user.id)
	const registeredTimestamp = registeredDate ? Math.floor(registeredDate.getTime() / 1000) : null
	const worked = await getUserWorked(user.id)
	const userProfile = await getUserProfile(user.id)

	return new EmbedBuilder()
		.setTitle(`Stats for ${user.username}`)
		.setDescription("Here are your personal stats for using the JJK Bot!")
		.setColor("#00FF00")
		.setThumbnail(user.displayAvatarURL({ dynamic: true }))
		.addFields(
			{
				name: "General Stats",
				value: `**Total Times Worked:** ${worked || "0"}\n**Total Commands Used:** ${
					userStats.totalCommandsUsed || "0"
				}\n**Total Techniques Used:** ${userStats.totalTechniques || "0"}\n**Registered At:** ${
					registeredTimestamp ? `<t:${registeredTimestamp}:f>` : "N/A"
				}`,
				inline: false
			},
			{
				name: "Work Stats",
				value: `**Total Times Worked:** ${worked || "0"}\n**Current Job:** ${userProfile.job || "N/A"}`,
				inline: false
			},
			{
				name: "Fight Stats",
				value: `**Fights Won This Month:** ${userStats.monthlyFightsWon || "0"}\n**Total Fights Won:** ${
					userStats.totalFightsWon || "0"
				}\n**Favorite Technique:** ${favouriteTech}`,
				inline: false
			},
			{
				name: "Command Stats",
				value: `**Favorite Command:** ${favouriteCommand}`,
				inline: false
			}
		)
		.setFooter({ text: getRandomQuote() })
}
