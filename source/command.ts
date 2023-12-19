import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { getUserInventory, getUserProfile } from "./mysql.js"

export async function handleProfileCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id

	try {
		const userProfile = await getUserProfile(userId)
		if (userProfile) {
			const profileEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`${interaction.user.username}'s Profile`)
				.addFields(
					{ name: "**Balance**", value: `\`${userProfile.balance.toString()}\``, inline: true },
					{ name: "**Experience**", value: userProfile.experience.toString(), inline: true }
				)

			await interaction.reply({ embeds: [profileEmbed] })
		} else {
			await interaction.reply("Profile not found.")
		}
	} catch (error) {
		console.error("Failed to retrieve user profile:", error)
		await interaction.reply("There was an error retrieving your profile.")
	}
}

export async function handlecraftcommand(interaction: ChatInputCommandInteraction) {
	// Attempt to craft the Prison Realm item
	try {
		// Fetch the user's inventory
		const userInventory = await getUserInventory(interaction.user.id)

		// Define the required item and quantity for crafting
		const requiredItemName = "Prisom Realm Fragment" // Replace with the actual name of the item
		const requiredQuantity = 6

		// Find the required item in the inventory
		const item = userInventory.find(invItem => invItem.name === requiredItemName)

		// Check if the user has enough of the required item
		if (!item || item.quantity < requiredQuantity) {
			await interaction.reply(`You do not have enough ${requiredItemName} to craft a Prison Realm.`)
			return
		}
		await interaction.reply("You have successfully crafted a Prison Realm.")
	} catch (error) {
		console.error("Error crafting item:", error)
		await interaction.reply("There was an error while processing your request.")
	}
}
