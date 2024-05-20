import { APIEmbed, EmbedBuilder, StringSelectMenuInteraction } from "discord.js"
import { calculateDamage } from "./calculate.js"

export async function executeDualTechnique({
	interaction,
	techniqueName,
	damageMultiplier,
	imageUrl,
	description,
	fieldValue,
	userId1,
	userId2,
	primaryEmbed
}: {
	interaction: StringSelectMenuInteraction
	techniqueName: string
	damageMultiplier: number
	imageUrl: string
	description: string
	fieldValue: string
	userId1: string
	userId2: string
	primaryEmbed: APIEmbed
}): Promise<number> {
	let damage = 0

	if (techniqueName === "Solo Forbidden Area" || techniqueName === "Hollow Purple") {
		// Special logic for Solo Forbidden Area and Hollow Purple
		damage = calculateDamage(techniqueName, userId1) * damageMultiplier * 2
		description = `${userId1} and ${userId2} combined their ${techniqueName} techniques for a devastating attack!`
		fieldValue = `Combined ${techniqueName}`
	} else {
		// Regular dual technique logic
		damage = calculateDamage(techniqueName, userId1) * damageMultiplier
	}

	const specialTechniqueEmbed = new EmbedBuilder(primaryEmbed)
		.setImage(imageUrl)
		.setDescription(description)
		.addFields({
			name: "Technique Used",
			value: fieldValue,
			inline: true
		})
		.addFields({
			name: "Damage Dealt",
			value: `${damage}`,
			inline: true
		})

	await interaction.followUp({ embeds: [specialTechniqueEmbed] })

	return damage
}
