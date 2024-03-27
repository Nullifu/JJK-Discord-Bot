/* eslint-disable @typescript-eslint/no-unused-vars */

const userTechniques = new Map()
import { ActionRowBuilder, SelectMenuBuilder } from "@discordjs/builders"
import { CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { calculateDamage, getBossDrop, getRandomXPGain } from "./calculate.js"
import { activeCollectors } from "./command.js"
import { BossData } from "./interface.js"
import { DOMAIN_EXPANSIONS } from "./items jobs.js"
import {
	addItemToUserInventory,
	getUserGrade,
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

	// Calculate experience they get
	const experienceGain = getRandomXPGain()

	// Update values in the database
	activeCollectors.delete(interaction.user.id)
	await updateUserHealth(interaction.user.id, 100)
	await updateUserExperience(interaction.user.id, experienceGain)
	await updatePlayerGrade(interaction.user.id)

	// Show a loot drop embed & add to database
	const drop = getBossDrop(opponent.name)
	await addItemToUserInventory(interaction.user.id, drop.name, 1)
	const privateEmbed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle("Battle Rewards")
		.addFields(
			{ name: "Loot Drop", value: `You've also found a ${drop.name} among the remains!` },
			{ name: "Experience Gained", value: `You've gained ${experienceGain} XP for defeating the boss!` }
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

	const damage = (await calculateDamage(playerGradeString, userId, true)) * damageMultiplier

	primaryEmbed.setImage(imageUrl)
	primaryEmbed.setDescription(description)
	primaryEmbed.setFields({ name: "Technique", value: fieldValue })

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
	await new Promise(resolve => setTimeout(resolve, 5000)) // Wait for effect

	return damage // Return the calculated damage for further processing
}

export async function executeDomainExpansion({
	interaction,
	domainInfo,
	userDomains,
	userId,
	primaryEmbed,
	collectedInteraction
}) {
	if (userDomains.has(userId)) {
		await collectedInteraction.followUp({
			content: "You can only activate your domain once per fight.",
			ephemeral: true
		})
		return // Domain already activated in this fight
	}

	const domainActivationDetails = DOMAIN_EXPANSIONS.find(domain => domain.name === domainInfo.name)
	if (!domainActivationDetails) {
		console.error("Invalid domain name.")
		return // Invalid domain name
	}

	userDomains.set(userId, true) // Mark domain as activated

	// Configure the embed for the domain activation
	primaryEmbed
		.setTitle(`Domain Expansion: ${domainActivationDetails.name}`)
		.setDescription(domainActivationDetails.description)
		.setImage(domainActivationDetails.image_URL)

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
	await new Promise(resolve => setTimeout(resolve, 3000))

	return
}
