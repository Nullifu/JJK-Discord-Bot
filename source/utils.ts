import { randomInt } from "crypto"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { addItemToUserInventory, removeItemFromUserInventory } from "./mongodb.js"

// Define mentor details with messages, images, and lines
const mentorDetails: { [key: string]: { message: string; imageUrl: string; lines: string[] } } = {
	"Satoru Gojo": {
		message: "You are under the guidance of Satoru Gojo, the strongest Jujutsu sorcerer.",
		imageUrl: "https://media1.tenor.com/m/DoXhSg0brxsAAAAC/gojo-satoru-satoru.gif",
		lines: ["Don't worry, I'm the strongest.", "What you lack is imagination.", "Shall we get a little rough?"]
	},
	"Ryomen Sukuna": {
		message: "Ryomen Sukuna, the King of Curses, watches over your training.",
		imageUrl:
			"https://64.media.tumblr.com/2874a1ac0755d4b605e8cba3549e7eaa/51ccf8614f6c9391-eb/s640x960/b324b52c1b86d722366672aacb73983d8c6627ad.gifv",
		lines: ["I am the honored one, the King of Curses.", "Don't you dare underestimate me!", "Foolish."]
	}
}

export function getMentorDetails(
	mentor: string,
	hasAwakening: boolean
): { message: string; imageUrl: string; line: string } {
	const details = mentorDetails[mentor] || {
		message: "You are under the guidance of an unknown mentor.",
		imageUrl: "",
		lines: ["As your mentor, I expect great things from you."]
	}

	let message = details.message
	if (hasAwakening) {
		message += " Your potential is awakening, unleashing new powers."
	}

	// Randomly select a line for the mentor
	const line = details.lines[randomInt(details.lines.length)]

	return { message: message, imageUrl: details.imageUrl, line: line }
}

export function getAwakeningDialogue(mentor: string): string {
	const dialogues: { [key: string]: string } = {
		"Satoru Gojo":
			"You've finally reached it right? I can sense it within you.. That power, that potential... I never thought i'd see the day where you'd reach this point..",
		"Ryomen Sukuna":
			"You brat.. How did you manage to awaken this power..? You're not half bad.. Maybe you're worth my time after all.."
	}

	return (
		dialogues[mentor] ||
		"You have unlocked a new depth of power, one that requires discipline and courage to master. Together, we will hone this new strength into something extraordinary."
	)
}

export function createAwakeningShardInitialEmbed(interaction, mentor) {
	const embed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle("Awakening Shard Encounter")
		.setImage("https://media1.tenor.com/m/cfC-_AdHfKIAAAAC/gojo-satoru.gif")
		.setDescription("You sense a powerful energy emanating from your Awakening Shard...")
		.addFields([
			{
				name: `**${mentor} says:**`,
				value: `Be wary, ${interaction.user.username}. Something is not right...`,
				inline: true
			}
		])

	return embed
}

export async function createAwakeningShardEmbed(interaction, mentor) {
	let embed

	if (mentor === "Satoru Gojo") {
		await removeItemFromUserInventory(interaction.user.id, "Awakening Shard", 1)
		await addItemToUserInventory(interaction.user.id, "Split Shard", 1)

		embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Sukuna Attacks!")
			.setDescription("Sukuna has sensed your Awakening Shard and is attacking you, He's shattered the shard!")
			.setImage("https://media1.tenor.com/m/hGAOy9OYEBAAAAAC/jjk-jujutsu-kaisen.gif")
			.addFields([
				{
					name: "**Satoru Gojo says:**",
					value: "Quickly, Run! I'll hold him off!",
					inline: true
				}
			])
	} else if (mentor === "Sukuna") {
		await removeItemFromUserInventory(interaction.user.id, "Awakening Shard", 1)
		await addItemToUserInventory(interaction.user.id, "Split Shard", 1)

		embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Gojo Attacks!")
			.setDescription("Gojo has sensed your Awakening Shard and is attacking you, He's shattered the shard!")
			.setImage("https://media1.tenor.com/m/7wtqfZcsbHUAAAAd/gojou-gojo.gif")
			.addFields([
				{
					name: "**Sukuna says:**",
					value: "Quickly, Run! I'll hold him off!",
					inline: true
				}
			])
	}

	// Create buttons
	const fightButton = new ButtonBuilder().setCustomId("fight").setLabel("Fight").setStyle(ButtonStyle.Primary)

	const runButton = new ButtonBuilder().setCustomId("run").setLabel("Run").setStyle(ButtonStyle.Secondary)

	const actionRow = new ActionRowBuilder().addComponents(fightButton, runButton)

	return { embeds: [embed], components: [actionRow] }
}
