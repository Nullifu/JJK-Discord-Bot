/* eslint-disable @typescript-eslint/no-unused-vars */

const userTechniques = new Map()
import { ActionRowBuilder, SelectMenuBuilder } from "@discordjs/builders"
import { CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { calculateDamage, getBossDrop, getRandomXPGain } from "./calculate.js"
import { activeCollectors } from "./command.js"
import { BossData } from "./interface.js"
import {
	addItemToUserInventory,
	addUserQuestProgress,
	getUserGrade,
	removeAllStatusEffects,
	updateBalance,
	updatePlayerGrade,
	updateUserExperience,
	updateUserHealth
} from "./mongodb.js"

export async function handleBossDeath(
	interaction: ChatInputCommandInteraction<CacheType>,
	embed: EmbedBuilder,
	row: ActionRowBuilder<SelectMenuBuilder>,
	opponent: BossData
) {
	// Show victory embed
	const victoryMessage = "You won"
	embed.setDescription(victoryMessage)

	// Check if the boss is Mahito (Transfigured)
	if (opponent.name === "Mahito (Transfigured)") {
		embed.setDescription("I admit it, Mahito i am you.")
		embed.setImage(
			"https://cdn.discordapp.com/attachments/681985000521990179/1222162641620041798/ezgif-2-cc9a6b6268.gif?ex=661536a8&is=6602c1a8&hm=591265d694ffde07b30eef7cfc538c2055643d8e349500cd4fd9be4484ffe4e7&f"
		)
	}
	if (opponent.name === "Mahito Instant Spirit Body of Distorted Killing") {
		embed.setDescription("I admit it, Mahito i am you.")
		embed.setImage(
			"https://cdn.discordapp.com/attachments/681985000521990179/1222162641620041798/ezgif-2-cc9a6b6268.gif?ex=661536a8&is=6602c1a8&hm=591265d694ffde07b30eef7cfc538c2055643d8e349500cd4fd9be4484ffe4e7&f"
		)
	}

	await interaction.editReply({ embeds: [embed], components: [] })

	function getrandommoney(min = 25000, max = 50000) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	}

	// Calculate experience they get
	const experienceGain = getRandomXPGain()
	const coinsGained = getrandommoney()

	if (opponent.name === "Hakari Kinji") {
		await addUserQuestProgress(interaction.user.id, "Gamblers Fever", 1)
	}

	// Update values in the database
	activeCollectors.delete(interaction.user.id)
	await updateUserHealth(interaction.user.id, 100)
	await updateUserExperience(interaction.user.id, experienceGain)
	await updatePlayerGrade(interaction.user.id)
	await removeAllStatusEffects(interaction.user.id)

	// Show a loot drop embed & add to database
	const drop = getBossDrop(opponent.name)
	await addItemToUserInventory(interaction.user.id, drop.name, 1)
	await updateBalance(interaction.user.id, coinsGained)
	const privateEmbed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle("Battle Rewards")
		.addFields(
			{ name: "Loot Drop", value: `You've also found a ${drop.name} among the remains!` },
			{ name: "Experience Gained", value: `You've gained ${experienceGain} XP for defeating the boss!` },
			{ name: "Coins Gained", value: `You've gained ${coinsGained} Coins for defeating the boss!` }
		)
	await interaction.followUp({ embeds: [privateEmbed], ephemeral: true })
}

// Function to handle the execution of special techniques
export async function executeSpecialTechnique({
	collectedInteraction,
	techniqueName,
	damageMultiplier,
	imageUrl,
	description,
	fieldValue,
	userTechniques,
	userId,
	primaryEmbed
}) {
	const techniquesUsed = userTechniques.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniques.set(userId, techniquesUsed) // Update the map with the new array

	const playerGradeData = await getUserGrade(collectedInteraction.user.id)
	const playerGradeString = playerGradeData

	// Technique hasn't been used, proceed
	techniquesUsed.push(techniqueName)
	userTechniques.set(userId, techniquesUsed) // Update the map with the new techniques list

	const damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier

	primaryEmbed.setImage(imageUrl)
	primaryEmbed.setDescription(description)
	primaryEmbed.setFields({ name: "Technique", value: fieldValue })

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
	await new Promise(resolve => setTimeout(resolve, 2000))

	return damage
}

export function generateHealthBar(current, max) {
	const totalBars = 10
	const filledBars = Math.round((current / max) * totalBars)
	const emptyBars = totalBars - filledBars
	return "▮".repeat(filledBars) + "▯".repeat(emptyBars)
}
