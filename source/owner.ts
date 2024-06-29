import { ChatInputCommandInteraction, InteractionResponse, TextChannel } from "discord.js"
import logger, { createClient } from "./bot.js"
import { LogEntry } from "./interface.js"
import { addItemToUserInventory, addUserTechnique, updateBalance, updateOwnerLogs } from "./mongodb.js"

const authorizedUserId = ["292385626773258240", "723198209979187291"]
const LOG_CHANNEL_ID = "1250839808452984912"
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

const client1 = createClient()

export async function handleGiveItemCommand(
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

		await updateOwnerLogs(interaction.user.id, {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "giveItem",
			reason: "Command locked due to excessive use",
			user: interaction.user.tag,
			userId: interaction.user.id,
			time: new Date().toISOString()
		})
		return interaction.reply({
			content: "Command locked due to excessive use. Please try again later.",
			ephemeral: true
		})
	}

	if (!authorizedUserId.includes(interaction.user.id)) {
		await updateOwnerLogs(interaction.user.id, {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "giveItem",
			reason: "Unauthorized attempt to use giveItem command",
			user: interaction.user.tag,
			userId: interaction.user.id,
			time: new Date().toISOString()
		})
		return interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true })
	}

	const targetUserId = interaction.options.getString("userid")
	const itemName = interaction.options.getString("item")
	const quantity = interaction.options.getInteger("quantity")

	if (!targetUserId || !itemName || !quantity) {
		await updateOwnerLogs(interaction.user.id, {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "giveItem",
			reason: "Invalid parameters provided for giveItem command",
			user: interaction.user.tag,
			userId: interaction.user.id,
			time: new Date().toISOString()
		})
		return interaction.reply({
			content: "Please provide a target user ID, item name, and quantity.",
			ephemeral: true
		})
	}

	try {
		await addItemToUserInventory(targetUserId, itemName, quantity)
		const logData: LogEntry = {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "giveItem",
			item: itemName,
			quantity: quantity,
			user: interaction.user.tag,
			userId: interaction.user.id,
			targetUserId: targetUserId,
			time: new Date().toISOString()
		}
		await updateOwnerLogs(interaction.user.id, logData)

		// Log the command use
		const logChannel = (await client1.channels.fetch(LOG_CHANNEL_ID)) as TextChannel
		if (logChannel) {
			await logChannel.send(`\`\`\`json\n${JSON.stringify(logData, null, 2)}\n\`\`\``)
		}

		return interaction.reply({
			content: `Successfully added ${quantity}x ${itemName} to user ${targetUserId}`,
			ephemeral: true
		})
	} catch (error) {
		logger.error("Error in giveItem command", error)
		await updateOwnerLogs(interaction.user.id, {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "giveItem",
			reason: `Error: ${error.message}`,
			user: interaction.user.tag,
			userId: interaction.user.id,
			time: new Date().toISOString()
		})
		return interaction.reply({ content: "An error occurred. Please check logs.", ephemeral: true })
	}
}

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

		await updateOwnerLogs(interaction.user.id, {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "updateBalance",
			reason: "Command locked due to excessive use",
			user: interaction.user.tag,
			userId: interaction.user.id,
			time: new Date().toISOString()
		})
		return interaction.reply({
			content: "Command locked due to excessive use. Please try again later.",
			ephemeral: true
		})
	}

	if (!authorizedUserId.includes(interaction.user.id)) {
		await updateOwnerLogs(interaction.user.id, {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "updateBalance",
			reason: "Unauthorized attempt to use updateBalance command",
			user: interaction.user.tag,
			userId: interaction.user.id,
			time: new Date().toISOString()
		})
		return interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true })
	}

	const targetUserId = interaction.options.getString("userid")
	const amount = interaction.options.getInteger("amount")

	// Validate input parameters
	if (!targetUserId || !amount) {
		await updateOwnerLogs(interaction.user.id, {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "updateBalance",
			reason: "Invalid parameters provided for updateBalance command",
			user: interaction.user.tag,
			userId: interaction.user.id,
			time: new Date().toISOString()
		})
		return interaction.reply({
			content: "Please provide a valid target user ID and the amount to adjust.",
			ephemeral: true
		})
	}

	try {
		const targetUser = await client1.users.fetch(targetUserId)
		if (!targetUser) {
			await updateOwnerLogs(interaction.user.id, {
				guildId: interaction.guildId,
				channelId: interaction.channelId,
				messageId: interaction.id,
				command: "updateBalance",
				reason: `Attempted to update balance for non-existent user: ${targetUserId}`,
				user: interaction.user.tag,
				userId: interaction.user.id,
				time: new Date().toISOString()
			})
			return interaction.reply({
				content: `User with ID ${targetUserId} does not exist.`,
				ephemeral: true
			})
		}

		// Update balance
		await updateBalance(targetUserId, amount)
		const logData: LogEntry = {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "updateBalance",
			item: "balance",
			quantity: amount,
			user: interaction.user.tag,
			userId: interaction.user.id,
			targetUserId: targetUserId,
			time: new Date().toISOString()
		}
		await updateOwnerLogs(interaction.user.id, logData)

		// Log the command use
		const logChannel = (await client1.channels.fetch(LOG_CHANNEL_ID)) as TextChannel
		if (logChannel) {
			await logChannel.send(`\`\`\`json\n${JSON.stringify(logData, null, 2)}\n\`\`\``)
		}

		return interaction.reply({
			content: `Successfully adjusted balance for user ${targetUserId} by ${amount}.`,
			ephemeral: true
		})
	} catch (error) {
		logger.error("Error in updateBalance command", error)
		await updateOwnerLogs(interaction.user.id, {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: interaction.id,
			command: "updateBalance",
			reason: `Error: ${error.message}`,
			user: interaction.user.tag,
			userId: interaction.user.id,
			time: new Date().toISOString()
		})
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
		for (const technique of newTechniques) {
			await addUserTechnique(targetUserId, technique)
		}

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
