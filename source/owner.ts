import { ChatInputCommandInteraction, InteractionResponse, TextChannel } from "discord.js"
import logger, { createClient } from "./bot.js"
import { addItemToUserInventory, updateBalance, updateOwnerLogs, updateUserActiveTechniques } from "./mongodb.js"

const client1 = createClient()

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

const authorizedUserId = ["292385626773258240", "723198209979187291"]
const commandUsage = {
	count: 0,
	lastReset: Date.now()
}
const MAX_USAGE = 10
const RESET_INTERVAL = 60000
const LOCK_DURATION = 60000
let isLocked = false
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let lockTimeout: NodeJS.Timeout

const LOG_CHANNEL_ID = "1250839808452984912"

export async function handleUpdateBalanceCommand(
	interaction: ChatInputCommandInteraction
): Promise<InteractionResponse<boolean>> {
	const currentTime = Date.now()

	if (isLocked) {
		return interaction.reply({
			content: "This command is currently locked due to excessive use. Please try again later.",
			ephemeral: true
		})
	}

	if (currentTime - commandUsage.lastReset > RESET_INTERVAL) {
		commandUsage.count = 0
		commandUsage.lastReset = currentTime
	}

	commandUsage.count++

	if (commandUsage.count > MAX_USAGE) {
		isLocked = true
		lockTimeout = setTimeout(() => {
			isLocked = false
			commandUsage.count = 0
			commandUsage.lastReset = Date.now()
		}, LOCK_DURATION)

		await updateOwnerLogs(interaction.user.id, ["Command locked due to excessive use"])
		return interaction.reply({
			content: "Command locked due to excessive use. Please try again later.",
			ephemeral: true
		})
	}

	if (!authorizedUserId.includes(interaction.user.id)) {
		await updateOwnerLogs(interaction.user.id, ["Unauthorized attempt to use updateBalance command"])
		return interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true })
	}

	const targetUserId = interaction.options.getString("userid")
	const amount = interaction.options.getInteger("amount")

	// Validate input parameters
	if (!targetUserId || !amount) {
		await updateOwnerLogs(interaction.user.id, ["Invalid parameters provided for updateBalance command"])
		return interaction.reply({
			content: "Please provide a valid target user ID and the amount to adjust.",
			ephemeral: true
		})
	}

	try {
		const targetUser = await client1.users.fetch(targetUserId)
		if (!targetUser) {
			await updateOwnerLogs(interaction.user.id, [
				`Attempted to update balance for non-existent user: ${targetUserId}`
			])
			return interaction.reply({
				content: `User with ID ${targetUserId} does not exist.`,
				ephemeral: true
			})
		}

		// Update balance
		await updateBalance(targetUserId, amount)
		await updateOwnerLogs(interaction.user.id, [
			`Successfully adjusted balance for user ${targetUserId} by ${amount}`
		])

		// Log the command use
		const logChannel = (await client1.channels.fetch(LOG_CHANNEL_ID)) as TextChannel
		if (logChannel) {
			await logChannel.send(
				`Command used by <@${interaction.user.id}> to adjust balance for user ${targetUserId} by ${amount}.`
			)
		}

		return interaction.reply({
			content: `Successfully adjusted balance for user ${targetUserId} by ${amount}.`,
			ephemeral: true
		})
	} catch (error) {
		logger.error("Error in updateBalance command", error)
		await updateOwnerLogs(interaction.user.id, [`Error in updateBalance command: ${error.message}`])
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

client1.login(process.env["DISCORD_BOT_TOKEN"])
