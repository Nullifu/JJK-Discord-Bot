import { ChatInputCommandInteraction, InteractionResponse } from "discord.js"
import { addItemToUserInventory, updateBalance, updateUserActiveTechniques } from "./mongodb.js"
import { logger } from "./bot.js"

export async function handleGiveItemCommand(
	interaction: ChatInputCommandInteraction
): Promise<InteractionResponse<boolean>> {
	if (interaction.user.id !== "292385626773258240") {
		return interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true })
	}
	const targetUserId = interaction.options.getString("userid")
	const itemName = interaction.options.getString("item")
	const quantity = interaction.options.getInteger("quantity")

	if (!targetUserId || !itemName || !quantity) {
		return await interaction.reply({
			content: "Please provide a target user ID, item name, and quantity.",
			ephemeral: true
		})
	}

	try {
		await addItemToUserInventory(targetUserId, itemName, quantity)
		return interaction.reply({
			content: `Successfully added ${quantity}x ${itemName} to user ${targetUserId}`,
			ephemeral: true
		})
	} catch (error) {
		logger.error("Error in giveitem command", error)
		return interaction.reply({ content: "...", ephemeral: true })
	}
}

export async function handleUpdateBalanceCommand(
	interaction: ChatInputCommandInteraction
): Promise<InteractionResponse<boolean>> {
	if (interaction.user.id !== "292385626773258240") {
		return interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true })
	}

	const targetUserId = interaction.options.getString("userid")
	const amount = interaction.options.getInteger("amount")

	if (!targetUserId || !amount) {
		return await interaction.reply({
			content: "Please provide a target user ID and the amount to adjust.",
			ephemeral: true
		})
	}

	try {
		await updateBalance(targetUserId, amount)
		return interaction.reply({
			content: `Successfully adjusted balance for user ${targetUserId} by ${amount}.`,
			ephemeral: true
		})
	} catch (error) {
		logger.error("Error in updateBalance command", error)
		return interaction.reply({ content: "An error occurred. Please check logs.", ephemeral: true })
	}
}

export async function handleREMOVE(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
	if (interaction.user.id !== "292385626773258240") {
		return interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true })
	}

	const targetUserId = interaction.options.getString("userid")
	const amount = interaction.options.getInteger("amount")

	if (!targetUserId || !amount) {
		return await interaction.reply({
			content: "Please provide a target user ID and the amount to adjust.",
			ephemeral: true
		})
	}

	try {
		await updateBalance(targetUserId, -amount)
		return interaction.reply({
			content: `Successfully adjusted balance for user ${targetUserId} by ${amount}.`,
			ephemeral: true
		})
	} catch (error) {
		logger.error("Error in updateBalance command", error)
		return interaction.reply({ content: "An error occurred. Please check logs.", ephemeral: true })
	}
}

export async function handleADDTECHNIQUE(interaction: ChatInputCommandInteraction): Promise<void> {
	if (interaction.user.id !== "292385626773258240") {
		await interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true })
		return
	}

	const targetUserId = interaction.options.getString("userid")
	const newTechniques = interaction.options.getString("techniques", true).split(",")

	if (!targetUserId || newTechniques.length === 0) {
		await interaction.reply({
			content: "Please provide a target user ID and at least one technique.",
			ephemeral: true
		})
		return
	}

	try {
		await updateUserActiveTechniques(targetUserId, newTechniques)
		await interaction.reply({
			content: `Successfully updated active techniques for user ${targetUserId}.`,
			ephemeral: true
		})
	} catch (error) {
		logger.error("Error in handleADDTECHNIQUE command", error)
		await interaction.reply({ content: "An error occurred. Please check logs.", ephemeral: true })
	}
}
