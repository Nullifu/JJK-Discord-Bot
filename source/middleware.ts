interface User {
	lastAlertedVersion?: string
	// add other properties as needed
}
import { EmbedBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import { getUser } from "./mongodb.js"

export async function checkRegistrationMiddleware(interaction: ChatInputCommandInteraction): Promise<boolean> {
	console.log("Middleware started")

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
		console.error("Error in middleware:", error)
		// Only reply with an error message if a previous reply hasn't been sent
		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply({
				content: "Oops! You got a rare error if this happens again please make a ticket in the support server."
			})
		}
		return false
	}
}
