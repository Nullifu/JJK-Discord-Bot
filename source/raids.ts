/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandInteraction, EmbedBuilder } from "discord.js"
import { attacks } from "./attacks.js"
import { calculateDamage } from "./calculate.js"
import { getUserGrade, getUserHealth, getUserMaxHealth, removeAllStatusEffects, updateUserHealth } from "./mongodb.js"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function executeDualTechnique1({
	interaction,
	technique1,
	technique2,
	damageMultiplier,
	imageUrl,
	description,
	fieldValue,
	userId1,
	userId2,
	primaryEmbed,
	updateEmbed = true,
	rows,
	dualTechniqueCombinations
}) {
	let damage = 0
	let matchedCombination = null

	for (const combination of dualTechniqueCombinations) {
		if (
			(technique1 === combination.technique1 && technique2 === combination.technique2) ||
			(technique1 === combination.technique2 && technique2 === combination.technique1)
		) {
			matchedCombination = combination
			break
		}
	}

	if (matchedCombination) {
		damage =
			(calculateDamage(technique1, userId1) + calculateDamage(technique2, userId2)) *
			matchedCombination.damageMultiplier

		const user1 = await interaction.client.users.fetch(userId1)
		const user2 = await interaction.client.users.fetch(userId2)

		if (updateEmbed) {
			const specialTechniqueEmbed = new EmbedBuilder(primaryEmbed)
				.setImage(matchedCombination.imageUrl)
				.setDescription(matchedCombination.description(user1, user2, technique1, technique2))
				.setFields(
					{ name: "Technique Used", value: matchedCombination.fieldValue, inline: true },
					{ name: "Damage Dealt", value: `${damage}`, inline: true }
				)

			await interaction.editReply({ embeds: [specialTechniqueEmbed] })
			await delay(5000)
			await interaction.editReply({ embeds: [primaryEmbed], components: [...rows] })
		} else {
			const newEmbed = new EmbedBuilder()
				.setImage(matchedCombination.imageUrl)
				.setDescription(matchedCombination.description(user1, user2, technique1, technique2))
				.setFields(
					{ name: "Technique Used", value: matchedCombination.fieldValue, inline: true },
					{ name: "Damage Dealt", value: `${damage}`, inline: true }
				)

			await interaction.editReply({ embeds: [newEmbed] })
		}
	} else {
		damage = (calculateDamage(technique1, userId1) + calculateDamage(technique2, userId2)) * damageMultiplier
	}

	return damage
}

export const dualTechniqueCombinations = [
	{
		technique1: "Solo Forbidden Area",
		technique2: "Hollow Purple",
		damageMultiplier: 200,
		imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-5-9322b02566.gif",
		description: (user1, user2, technique1, technique2) =>
			`${user1.username} used ${technique1} and ${user2.username} used ${technique2}!`,
		fieldValue: "Maximum Output: Hollow Purple"
	},
	{
		technique1: "Boogie Woogie Surplex",
		technique2: "Re-imagined BLACK FLASH",
		damageMultiplier: 130,
		imageUrl: "https://media1.tenor.com/m/tJUHHN2NU7gAAAAC/aoi-todou-itadori-yuji.gif",
		description: (user1, user2, technique1, technique2) =>
			`${user2.username} Brother.. We Are One. ${user1.username} used ${technique1} and ${user2.username} used ${technique2}!`,
		fieldValue: "Brotherly Beatdown"
	},
	{
		technique1: "Cleave",
		technique2: "Dismantle",
		damageMultiplier: 90,
		imageUrl: "https://storage.googleapis.com/jjk_bot_personal/GDPkQiBWkAALc51.jpg",
		description: (user1, user2, technique1, technique2) =>
			`${user1.username} used ${technique1} and ${user2.username} used ${technique2}!`,
		fieldValue: "World Cutting Slash"
	},
	{
		technique1: "Maximum Technique: Blue",
		technique2: "Maximum Technique: Red",
		damageMultiplier: 140,
		imageUrl: "https://media1.tenor.com/m/9ZHCYYVz5VcAAAAC/notl-gojo-vs-sukuna.gif",
		description: (user1, user2, technique1, technique2) =>
			`${user1.username} used ${technique1} and ${user2.username} used ${technique2}!`,
		fieldValue: "Hollow: Nuke"
	},
	{
		technique1: "Divine Flames",
		technique2: "Flame Arrow",
		damageMultiplier: 170,
		imageUrl: "https://loinew.com/images/zu2JTHJwCd2UrIHoZWgQ1715344184.jpg",
		description: (user1, user2, technique1, technique2) =>
			`${user1.username} used ${technique1} and ${user2.username} used ${technique2}!`,
		fieldValue: "Divine Flame Arrow"
	}
]

export async function applyBossDamage(raidBoss, participants, interaction) {
	const attackDetails = []

	for (const participant of participants) {
		const participantId = participant.id // Access the id property
		const playerHealth = await getUserHealth(participantId)
		const possibleAttacks = attacks[raidBoss.name]
		const chosenAttack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)]
		const playerGrade = await getUserGrade(participantId)

		const clampedPlayerHealth = await executeRaidBossAttack(
			interaction,
			raidBoss,
			chosenAttack,
			playerGrade,
			playerHealth,
			participantId
		)

		attackDetails.push({
			participant: participantId,
			attackName: chosenAttack.name,
			damage: chosenAttack.baseDamage(playerGrade),
			remainingHealth: clampedPlayerHealth
		})

		if (clampedPlayerHealth <= 0) {
			await handlePlayerDeath(participantId, raidBoss)
		} else {
			await updateUserHealth(participantId, clampedPlayerHealth)
		}
	}

	return attackDetails
}

export async function handlePlayerDeath(participant, raidBoss) {
	const maxhealth = await getUserMaxHealth(participant)
	await updateUserHealth(participant, maxhealth)
	await removeAllStatusEffects(participant)
}

export async function executeRaidBossAttack(
	interaction: CommandInteraction,
	raidBoss: any,
	chosenAttack: any,
	playerGrade: string,
	playerHealth: number,
	participantId: string
) {
	const baseDamage = chosenAttack.baseDamage(playerGrade)
	const damageToPlayer = baseDamage
	const newPlayerHealth = playerHealth - damageToPlayer
	const clampedPlayerHealth = Math.max(0, newPlayerHealth)

	const primaryEmbed = new EmbedBuilder()

	switch (true) {
		case chosenAttack.name === "Domain Expansion: Malevolent Shrine" && raidBoss.name === "King Of Curses":
			primaryEmbed.setDescription(`${raidBoss.name} used ${chosenAttack.name}!`)
			primaryEmbed.setImage("https://media1.tenor.com/m/NiiOh24vaJIAAAAC/domain-expansion-sukuna.gif")

			await interaction.editReply({
				embeds: [primaryEmbed],
				components: []
			})

			await new Promise(resolve => setTimeout(resolve, 3000))

			await interaction.editReply({
				embeds: [primaryEmbed],
				components: []
			})
			break

		default:
			primaryEmbed.setDescription(`${raidBoss.name} used ${chosenAttack.name}!`)
			break
	}

	return clampedPlayerHealth
}
