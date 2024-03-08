import { AttachmentBuilder, EmbedBuilder } from "discord.js"
import * as fs from "fs"
import * as path from "path"

export async function handleKissCommand(message) {
	try {
		// Define the directory path where your images are stored
		const directoryPath = "./gifs/kiss"

		// Read the contents of the directory
		const files = fs.readdirSync(directoryPath)

		// Filter the files to include only .jpg and .png images (or any other formats you're using)
		const imageFiles = files.filter(file => file.endsWith(".gif"))

		// If there are no image files, send an error message
		if (!imageFiles.length) {
			await message.reply("No images found to send a kiss.")
			return
		}

		// Select a random image file
		const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)]
		const imagePath = path.join(directoryPath, randomImage)

		// Create an attachment from the local image
		const imageAttachment = new AttachmentBuilder(imagePath)

		// Create the embed
		const kissEmbed = new EmbedBuilder()
			.setColor(0xff69b4) // A pink color
			.setTitle("Kiss!")
			.setDescription(`${message.author.username} sends a kiss! 😘`)
			.setImage(`attachment://${randomImage}`) // Set the image of the embed
			.setTimestamp()

		// Send the embed with the image
		await message.reply({ embeds: [kissEmbed], files: [imageAttachment] })
	} catch (error) {
		console.error("Error sending kiss image:", error)
		await message.reply({ content: "Oops! Something went wrong while sending a kiss." })
	}
}

export async function handleFiddleCommand(message) {
	try {
		// Define the directory path where your images are stored
		const directoryPath = "./gifs/fiddle"

		// Read the contents of the directory
		const files = fs.readdirSync(directoryPath)

		// Filter the files to include only .jpg and .png images (or any other formats you're using)
		const imageFiles = files.filter(file => file.endsWith(".gif"))

		// If there are no image files, send an error message
		if (!imageFiles.length) {
			await message.reply("No images found to send a Fiddle.")
			return
		}

		// Select a random image file
		const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)]
		const imagePath = path.join(directoryPath, randomImage)

		// Create an attachment from the local image
		const imageAttachment = new AttachmentBuilder(imagePath)

		// Create the embed
		const kissEmbed = new EmbedBuilder()
			.setColor(0xff69b4) // A pink color
			.setTitle("Fiddled!")
			.setDescription(`${message.author.username} Touched you.`)
			.setImage(`attachment://${randomImage}`) // Set the image of the embed
			.setTimestamp()

		// Send the embed with the image
		await message.reply({ embeds: [kissEmbed], files: [imageAttachment] })
	} catch (error) {
		console.error("Error sending fiddle image:", error)
		await message.reply({ content: "Oops! Something went wrong while sending a fiddle you're way." })
	}
}
