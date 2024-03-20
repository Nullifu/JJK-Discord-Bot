import { EmbedBuilder } from "@discordjs/builders"
import { checkUserRegistration } from "./mongodb.js"

export async function checkRegistrationMiddleware(interaction) {
	console.log("Middleware started")
	try {
		const isRegistered = await checkUserRegistration(interaction.user.id) // You'll need to implement this
		console.log("Registration check complete. Result:", isRegistered)
		if (!isRegistered) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Registration Required")
						.setDescription("Please register before using commands. Use the `/register` command.")
				],
				ephemeral: true // Makes the message visible only to the user
			})
			return false // Signal to stop command execution
		}
		return true // Signal to continue command execution
	} catch (error) {
		console.error("Error checking registration:", error)
		await interaction.reply({ content: "Oops! Something went wrong while checking your registration." })
		return false // Signal to stop command execution
	}
}
