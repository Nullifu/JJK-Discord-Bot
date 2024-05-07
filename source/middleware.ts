interface User {
	lastAlertedVersion?: string
}
const CURRENT_VERSION = "1.2.5"
//
//

import { EmbedBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import { logger } from "./bot.js"
import { getUser, updateLastAlertedVersion } from "./mongodb.js"

export async function checkRegistrationMiddleware(interaction: ChatInputCommandInteraction): Promise<boolean> {
	logger.debug("Middleware started")

	try {
		const discordId = interaction.user.id
		const user: User = await getUser(discordId)

		if (!user) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Registration Required")
						.setDescription("Please register before using commands. Use the `/register` command.")
						.setColor(0x5d2e8c)
				],
				ephemeral: true
			})
			return false
		}

		return true
	} catch (error) {
		logger.error("Error in middleware:", error)
		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply({
				content: "Oops! You got a rare error if this happens again please make a ticket in the support server."
			})
		}
		return false
	}
}

export async function checkVersionMiddleware1(interaction: ChatInputCommandInteraction): Promise<boolean> {
	logger.debug("Version check middleware started")

	const discordId = interaction.user.id
	let shouldProceed = true

	try {
		const user: User = await getUser(discordId)
		const currentVersion = CURRENT_VERSION
		const lastAlertedVersion = user?.lastAlertedVersion

		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply({ ephemeral: true })
		}

		// For unregistered users
		if (!user) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Registration Required")
						.setDescription("Please register before using commands. Use the `/register` command.")
						.setColor(0x5d2e8c)
				]
			})
			shouldProceed = false
		} else if (lastAlertedVersion !== currentVersion) {
			await updateLastAlertedVersion(discordId, currentVersion)

			await interaction.followUp({
				content: "An update is available! Please use `/alert` to view the latest changes.",
				ephemeral: true
			})
		}
	} catch (error) {
		logger.error("Error in version check middleware:", error)
		if (!interaction.replied) {
			await interaction.editReply({
				content: "Oops! You encountered an error. If this happens again, please contact support."
			})
		}
		shouldProceed = false
	}

	return shouldProceed
}

export async function postCommandMiddleware(interaction: ChatInputCommandInteraction): Promise<void> {
	const discordId = interaction.user.id

	try {
		const user: User = await getUser(discordId)
		const lastAlertedVersion = user?.lastAlertedVersion

		if (!user) {
			await interaction.followUp({
				content: "Please register to use all features. Use `/register`.",
				ephemeral: true
			})
		} else if (lastAlertedVersion !== CURRENT_VERSION) {
			await updateLastAlertedVersion(discordId, CURRENT_VERSION)
			await interaction.followUp({
				content: "Alert from the dev Please use `/alert` to see what's new. 🚀",
				ephemeral: true
			})
		}
	} catch (error) {
		logger.error("Error in post-command middleware:", error)
		await interaction.followUp({
			content: "Oops! There was a problem processing your request. Please try again later.",
			ephemeral: true
		})
	}
}
