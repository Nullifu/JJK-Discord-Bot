import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { attacks } from "./attacks.js"
import { getUserShikigami, updateShikigamiHealth } from "./mongodb.js"
import { applyStatusEffect, calculateDamageWithEffects } from "./statuseffects.js"

export const activeShikigami = new Map()
const summonedShikigami = new Map()

export function updateShikigamiField(primaryEmbed, activeShikigami, userId) {
	// Ensure primaryEmbed has a fields property
	if (!primaryEmbed.fields) {
		primaryEmbed.fields = []
	}

	// Find the index of the existing "Shikigami" field
	const shikigamiFieldIndex = primaryEmbed.fields.findIndex(field => field.name === "Shikigami")

	// Get the active Shikigami for the user
	const userShikigami = activeShikigami.get(userId) || []

	// If there are active Shikigami
	if (userShikigami.length > 0) {
		// Convert the Shikigami array to a string with each Shikigami separated by a newline
		const shikigamiValue = userShikigami.join("\n")

		// If the "Shikigami" field exists, update its value
		if (shikigamiFieldIndex !== -1) {
			primaryEmbed.fields[shikigamiFieldIndex].value = shikigamiValue
		} else {
			// Otherwise, add a new "Shikigami" field
			primaryEmbed.addFields({ name: "Shikigami", value: shikigamiValue, inline: false })
		}
	} else {
		// If there are no active Shikigami, remove the "Shikigami" field
		if (shikigamiFieldIndex !== -1) {
			primaryEmbed.fields.splice(shikigamiFieldIndex, 1)
		}
	}
}

export async function executeMahoraga({
	collectedInteraction,
	shikigamiName,
	techniqueName,
	fieldValue,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed,
	bossHealthMap,
	playerHealth,
	randomOpponent,
	row
}): Promise<number | { damage: number; userTechniques: Map<string, unknown> }> {
	summonedShikigami.set(userId, shikigamiName)
	const userSummonedShikigami = summonedShikigami.get(collectedInteraction.user.id)
	if (userSummonedShikigami === shikigamiName) {
		await collectedInteraction.followUp(
			"You have already summoned this shikigami. Please choose a different skill."
		)
		return
	}
	primaryEmbed.setImage("https://media1.tenor.com/m/sbiTK_XDYoUAAAAC/sukuna-mahoraga.gif")
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	// Check if the user has the required shikigami for the technique
	if (techniqueName === "Ten Shadows Technique: Divergent Sila Divine General Mahoraga") {
		const userShikigami = await getUserShikigami(collectedInteraction.user.id)

		const hasMahoraga = userShikigami.some(shikigami => shikigami.name === "Mahoraga")

		if (hasMahoraga) {
			// User has Mahoraga tamed, proceed with summoning

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
			await new Promise(resolve => setTimeout(resolve, 3000))

			// Mahoraga adaptation mechanic
			const mahoragaAdaptation = userTechniquesFight.get(`${userId}_mahoraga_adaptation`) || 0
			userTechniquesFight.set(`${userId}_mahoraga_adaptation`, mahoragaAdaptation + 1)

			// Mahoraga damages the enemy
			const enemyDamage = Math.floor(Math.random() * 100) + 50 // Random damage between 50 and 150
			const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
			const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
			bossHealthMap.set(userId, newBossHealth)
			randomOpponent.current_health = newBossHealth

			primaryEmbed.setImage("https://media1.tenor.com/m/sFvgffc0uM8AAAAC/season-2-jujutsu-kaisen.gif")
			primaryEmbed.setFields({
				name: "Mahoraga's Opening Attack",
				value: `Mahoraga is summoned and begins to adapt to the enemy's technique! The enemy takes ${enemyDamage} damage.`,
				inline: true
			})

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

			await new Promise(resolve => setTimeout(resolve, 3000))

			// Re-add the select menu

			return { damage: enemyDamage, userTechniques: userTechniquesFight }
		} else {
			// User doesn't have Mahoraga tamed, show the confirmation prompt
			const confirmationEmbed = new EmbedBuilder()
				.setTitle("Summon Mahoraga")
				.setDescription("You don't have Mahoraga tamed. Do you want to take a risk and summon him anyway?")
				.setColor("#FF0000")

			const confirmationRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId("confirm_summon").setLabel("Summon").setStyle(ButtonStyle.Danger),
				new ButtonBuilder().setCustomId("cancel_summon").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
			)
			await collectedInteraction.followUp({
				embeds: [confirmationEmbed],
				components: [confirmationRow],
				ephemeral: true
			})

			const confirmationCollector = collectedInteraction.channel.createMessageComponentCollector({
				filter: i => i.user.id === collectedInteraction.user.id,
				time: 15000,
				max: 1
			})

			const confirmationResult = await new Promise(resolve => {
				confirmationCollector.on("collect", async i => {
					if (i.customId === "confirm_summon") {
						await i.update({
							content: "You decided to summon Mahoraga. Brace yourself!",
							embeds: [],
							components: []
						})
						resolve(true)
					} else if (i.customId === "cancel_summon") {
						await i.update({
							content: "You decided not to summon Mahoraga.",
							embeds: [],
							components: []
						})
						resolve(false)
					}
				})

				confirmationCollector.on("end", async collected => {
					if (collected.size === 0) {
						await collectedInteraction.followUp({
							content:
								"Mahoraga was not summoned. You took too long to decide, And mahoraga went to sleep",
							ephemeral: true
						})
						resolve(false)
					}
				})
			})

			if (!confirmationResult) {
				return 0
			}

			// User confirmed to summon Mahoraga without having him tamed
			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
			await new Promise(resolve => setTimeout(resolve, 4000))

			const outcome = Math.random()
			if (outcome < 0.5) {
				// User takes damage
				const userDamage = Math.floor(Math.random() * 50) + 10 // Random damage between 10 and 60
				const newPlayerHealth = playerHealth - userDamage
				const clampedPlayerHealth = Math.max(0, newPlayerHealth)

				primaryEmbed.setImage("https://media1.tenor.com/m/xF0ATXhH9zoAAAAC/jujutsu-kaisen-megumi-fushiguro.gif")
				primaryEmbed.setDescription(`Mahoraga is untamed and attacks you! You take ${userDamage} damage.`)

				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
				await new Promise(resolve => setTimeout(resolve, 4000))

				// Update the player health in the embed
				primaryEmbed.setFields(
					{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true },
					{ name: "Technique", value: fieldValue },
					{ name: "Shikigami", value: shikigamiName }
				)

				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
				await new Promise(resolve => setTimeout(resolve, 4000))

				// Re-add the select menu
				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

				return { damage: clampedPlayerHealth, userTechniques: userTechniquesFight }
			} else {
				// Mahoraga damages the enemy
				const enemyDamage = Math.floor(Math.random() * 100) + 50 // Random damage between 50 and 150
				const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
				const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
				bossHealthMap.set(userId, newBossHealth)
				randomOpponent.current_health = newBossHealth

				primaryEmbed.setImage("https://media1.tenor.com/m/sFvgffc0uM8AAAAC/season-2-jujutsu-kaisen.gif")
				primaryEmbed.setDescription(
					`Mahoraga is untamed but attacks the enemy! The enemy takes ${enemyDamage} damage.`
				)

				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
				await new Promise(resolve => setTimeout(resolve, 4000))

				// Re-add the select menu
				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

				return { damage: enemyDamage, userTechniques: userTechniquesFight }
			}
		}
	}
}

export async function executeDivineDogsTechnique({
	collectedInteraction,
	techniqueName,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed,
	bossHealthMap,
	randomOpponent,
	row,
	activeShikigami
}) {
	primaryEmbed.setImage("https://media1.tenor.com/m/LSBXOWQ1uugAAAAC/jujutsu-kaisen-megumi-fushiguro.gif")
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	await new Promise(resolve => setTimeout(resolve, 3000))

	const enemyDamage = Math.floor(Math.random() * 50) + 10 // Random damage between 30 and 110
	const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
	const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
	bossHealthMap.set(userId, newBossHealth)
	randomOpponent.current_health = newBossHealth

	await applyStatusEffect(userId, "Scarce")

	primaryEmbed.setDescription(
		`🐶 Divine Dogs are summoned and attack the enemy, dealing ${enemyDamage} damage! The enemy is now affected by Scarce.`
	)

	// Summon Divine Dogs
	const userShikigami = activeShikigami.get(userId) || []
	userShikigami.push("🐺 Divine Dogs")
	activeShikigami.set(userId, userShikigami)

	await updateShikigamiField(primaryEmbed, activeShikigami, userId)

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

	return { damage: enemyDamage, userTechniquesFight: userTechniquesFight }
}

export async function executeNue({
	collectedInteraction,
	techniqueName,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed,
	bossHealthMap,
	randomOpponent,
	row,
	activeShikigami
}) {
	primaryEmbed.setImage("https://media1.tenor.com/m/31xrp_9K33AAAAAd/megumi-fushiguro-jujutsu-kaisen.gif")
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	await new Promise(resolve => setTimeout(resolve, 3000))

	const enemyDamage = Math.floor(Math.random() * 60) + 10 // Random damage between 30 and 110
	const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
	const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
	bossHealthMap.set(userId, newBossHealth)
	randomOpponent.current_health = newBossHealth

	await applyStatusEffect(userId, "Infuse")

	primaryEmbed.setDescription(
		`🦉 Nue is summoned and attacks the enemy, dealing ${enemyDamage} damage! Nue has infused there power into you!`
	)

	const userShikigami = activeShikigami.get(userId) || []
	userShikigami.push("🦉 Nue")
	activeShikigami.set(userId, userShikigami)

	await updateShikigamiField(primaryEmbed, activeShikigami, userId)

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

	return { damage: enemyDamage, userTechniquesFight: userTechniquesFight }
}

export async function executeToad({
	collectedInteraction,
	techniqueName,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed,
	bossHealthMap,
	randomOpponent,
	row
}) {
	primaryEmbed.setImage("https://media1.tenor.com/m/31xrp_9K33AAAAAd/megumi-fushiguro-jujutsu-kaisen.gif")
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	await new Promise(resolve => setTimeout(resolve, 3000))

	const enemyDamage = Math.floor(Math.random() * 10) + 1 // Random damage between 30 and 110
	const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
	const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
	bossHealthMap.set(userId, newBossHealth)
	randomOpponent.current_health = newBossHealth

	primaryEmbed.setDescription(
		`🐸 Toad is summoned and attacks the enemy, dealing ${enemyDamage} damage! It's not very strong..`
	)

	primaryEmbed.addFields({ name: "Shikigami", value: "🐸 Toad" })

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

	return { damage: enemyDamage, userTechniquesFight: userTechniquesFight }
}

export async function handleMahoragaAttack(
	collectedInteraction,
	bossHealthMap,
	randomOpponent,
	primaryEmbed,
	row,
	userTechniquesFight
) {
	const hasMahoragaAdaptation = userTechniquesFight.has(`${collectedInteraction.user.id}_mahoraga_adaptation`)

	if (!hasMahoragaAdaptation) {
		return
	}
	let mahoragaAdaptation = userTechniquesFight.get(`${collectedInteraction.user.id}_mahoraga_adaptation`) || 0
	if (mahoragaAdaptation > 0) {
		mahoragaAdaptation++
		userTechniquesFight.set(`${collectedInteraction.user.id}_mahoraga_adaptation`, mahoragaAdaptation)

		const mahoragaDamage = Math.floor(Math.random() * 20) + 75 // Random damage between 30 and 80
		const currentBossHealth = bossHealthMap.get(collectedInteraction.user.id) || randomOpponent.max_health
		const newBossHealth = Math.max(0, currentBossHealth - mahoragaDamage)
		bossHealthMap.set(collectedInteraction.user.id, newBossHealth)
		randomOpponent.current_health = newBossHealth

		primaryEmbed.addFields([
			{ name: "Mahoraga Adaptation", value: `${mahoragaAdaptation}/6`, inline: true },
			{
				name: "Mahoraga Attack",
				value: `Mahoraga deals ${mahoragaDamage} damage to the enemy!`,
				inline: false
			}
		])

		if (mahoragaAdaptation === 6) {
			const mahoragaSpecialDamage = Math.floor(Math.random() * 200) + 100 // Random damage between 100 and 300
			const currentBossHealth = bossHealthMap.get(collectedInteraction.user.id) || randomOpponent.max_health
			//
			const newBossHealth = Math.max(0, currentBossHealth - mahoragaSpecialDamage)
			bossHealthMap.set(collectedInteraction.user.id, newBossHealth)
			randomOpponent.current_health = newBossHealth

			primaryEmbed.setDescription("Mahoaraga has fully adapted... and is now using a special attack!")
			primaryEmbed.setImage("https://media1.tenor.com/m/h9vZeOgN-5gAAAAC/mahoraga-adapts-mahoraga.gif")

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

			await new Promise(resolve => setTimeout(resolve, 5000))

			primaryEmbed.setDescription(
				`Mahoraga has unleashed his full power dealing ${mahoragaSpecialDamage} damage to the enemy!`
			)
			primaryEmbed.setImage("https://media1.tenor.com/m/pYgj13yEW_wAAAAC/sukuna-mahoraga.gif")

			userTechniquesFight.delete(`${collectedInteraction.user.id}_mahoraga_adaptation`)

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

			await new Promise(resolve => setTimeout(resolve, 3000))

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
		}
	}
}

export async function handleDivineDogsDamage(interaction, randomOpponent, playerHealth, statusEffects) {
	// Fetch current status effects for the player
	const userShikigami = await getUserShikigami(interaction.user.id)
	const divineDogs = userShikigami.find(shikigami => shikigami.name === "Divine Dogs")

	if (divineDogs && divineDogs.health > 10) {
		const chanceToTakeHit = 0.5 // 50% chance for Divine Dogs to take the hit

		if (Math.random() < chanceToTakeHit) {
			// Divine Dogs take the hit
			const possibleAttacks = attacks[randomOpponent.name]
			const chosenAttack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)]
			const damageToDogsBeforeReduction = chosenAttack.baseDamage
			const damageToDogsAfterReduction = await calculateDamageWithEffects(
				interaction.user.id,
				damageToDogsBeforeReduction,
				statusEffects
			)
			const newDogsHealth = Math.max(10, divineDogs.health - damageToDogsAfterReduction)

			if (newDogsHealth === 10) {
				if (summonedShikigami.get(interaction.user.id) === "Divine Dogs") {
					summonedShikigami.delete(interaction.user.id)
				}

				await interaction.followUp({
					content: "The Divine Dogs have been unsummoned due to low health.",
					ephemeral: true
				})
			} else {
				await updateShikigamiHealth(interaction.user.id, "Divine Dogs", newDogsHealth)

				divineDogs.health = newDogsHealth
			}

			return { divineDogsHit: true, newPlayerHealth: playerHealth }
		}
	}

	return { divineDogsHit: false, newPlayerHealth: playerHealth }
}
