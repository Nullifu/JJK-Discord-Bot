import { StringSelectMenuBuilder } from "@discordjs/builders"
import { randomInt } from "crypto"
import { ActionRowBuilder, CommandInteraction, EmbedBuilder, SelectMenuBuilder } from "discord.js"
import { RaidDrops, getRaidBossDrop } from "./bossdrops.js"
import { createClient } from "./bot.js"
import { generateHealthBar } from "./fight.js"
import {
	RaidBoss,
	RaidParty,
	addItemToUserInventory,
	addUserTechnique,
	checkSpecialDropClaimed,
	getCurrentPhase,
	getUserActiveTechniques,
	getUserHealth,
	getUserTutorialState,
	getUserUnlockedTransformations,
	markSpecialDropAsClaimed,
	updateRaidBossHealth,
	updateRaidBossPhase,
	updateUserUnlockedTransformations
} from "./mongodb.js"

interface CommunityQuest {
	questName: string
	questDescription: string
	task: string
	taskAmount: number
	currentProgress: number
	rewardItem: string
	rewardAmount: number
	startDate: Date
	endDate: Date
}

const client = createClient()

export const mentorDetails: {
	[key: string]: { message: string; imageUrl: string; lines: string[]; eventLines?: string[] }
} = {
	"Satoru Gojo": {
		message: "You are under the guidance of Satoru Gojo, the strongest Jujutsu sorcerer.",
		imageUrl: "https://media1.tenor.com/m/DoXhSg0brxsAAAAC/gojo-satoru-satoru.gif",
		lines: ["Don't worry, I'm the strongest.", "What you lack is imagination.", "Shall we get a little rough?"]
	},
	"Curse King": {
		message: "Ryomen Sukuna, the King of Curses, watches over your training.",
		imageUrl: "https://media1.tenor.com/m/GxDg4OD6TkwAAAAC/sukuna-ryomen.gif",
		lines: ["I am the honored one, the King of Curses.", "Don't you dare underestimate me!", "Foolish."],
		eventLines: [
			"Well, well, the strongest sorcerer has been sealed. How intriguing.",
			"With Satoru Gojo out of the picture, the balance of power has shifted.",
			"Satoru Gojo's absence has created an interesting opportunity. Let's see what happens.",
			"Satoru Gojo's been sealed, huh? This could be fun.",
			"Brat, You better not aid in unsealing Gojo, or you'll regret it."
		]
	},
	"Ryomen Sukuna": {
		message: "Ryomen Sukuna, the King of Curses, watches over your training.",
		imageUrl: "https://media1.tenor.com/m/cByKGAOSVd4AAAAC/jogo-vs-sukuna-ryomen-sukuna.gif",
		lines: ["I am the honored one, the King of Curses.", "Don't you dare underestimate me!", "Foolish."],
		eventLines: [
			"Well, well, the strongest sorcerer has been sealed. How intriguing.",
			"With Satoru Gojo out of the picture, the balance of power has shifted.",
			"Satoru Gojo's absence has created an interesting opportunity. Let's see what happens.",
			"Satoru Gojo's been sealed, huh? This could be fun.",
			"Brat, You better not aid in unsealing Gojo, or you'll regret it."
		]
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

	const line = details.lines[randomInt(details.lines.length)]

	return { message: message, imageUrl: details.imageUrl, line: line }
}

export function getAwakeningDialogue(mentor: string, awakening: string): string {
	const dialogues: { [key: string]: { [key: string]: string } } = {
		"Satoru Gojo": {
			"Stage One":
				"You've taken the first step, but this is just the beginning. Keep pushing forward and never lose sight of your goals, Here's a quest, and some items to help..",
			"Stage Two":
				"I can see the determination in your eyes. You're starting to understand what it means to wield this power.",
			"Stage Three":
				"You're making progress, but don't get complacent. The road ahead is still long and challenging, Here's a quest.",
			"Stage Four": "I'm impressed by your growth. You're starting to tap into your true potential.",
			"Stage Five":
				"You've come a long way, but remember, with great power comes great responsibility. Use it wisely."
		},
		"Ryomen Sukuna": {
			"Stage One":
				"So, you've finally awakened a fraction of your power. Don't let it go to your head, brat, Here's a quest, and some items to help..",
			"Stage Two": "You're starting to show some promise, but you're still far from being a worthy vessel.",
			"Stage Three":
				"Not bad, kid. But don't think this means you're anywhere close to my level, Here's a quest.",
			"Stage Four":
				"I'll admit, you've got some talent. But talent alone won't save you from the horrors that await.",
			"Stage Five":
				"You've grown stronger, but remember, in this world, it's eat or be eaten. Never let your guard down."
		},
		"Curse King": {
			"Stage One":
				"So, you've finally awakened a fraction of your power. Don't let it go to your head, brat, Here's a quest, and some items to help..",
			"Stage Two": "You're starting to show some promise, but you're still far from being a worthy vessel.",
			"Stage Three":
				"Not bad, kid. But don't think this means you're anywhere close to my level, Here's a quest.",
			"Stage Four":
				"I'll admit, you've got some talent. But talent alone won't save you from the horrors that await.",
			"Stage Five":
				"You've grown stronger, but remember, in this world, it's eat or be eaten. Never let your guard down."
		}
	}

	return (
		dialogues[mentor]?.[awakening] ||
		`You have reached ${awakening}. Continue to hone your skills and push the boundaries of your power.`
	)
}

export function createFeverMeterBar(feverMeter: number, maxFeverMeter: number): string {
	const filledBlocks = "🟩"
	const emptyBlocks = "⬜"

	const filledPercentage = Math.floor((feverMeter / maxFeverMeter) * 100)
	const filledBlocksCount = Math.floor(filledPercentage / 10)

	let emptyBlocksCount = 10 - filledBlocksCount
	emptyBlocksCount = emptyBlocksCount < 0 ? 0 : emptyBlocksCount

	const feverMeterBar = filledBlocks.repeat(filledBlocksCount) + emptyBlocks.repeat(emptyBlocksCount)

	return `[${feverMeterBar}] ${filledPercentage}%`
}

export function getYujiItadoriImageUrl(): string {
	return "https://media1.tenor.com/m/j1qqqFxjlr4AAAAC/jujutsu-kaisen-jjk.gif"
}

export function getYujiItadoriLine(): string {
	const lines = [
		"Hey there! Satoru Gojo is currently sealed, so I'll be your mentor for now.",
		"Let's train together and become stronger!",
		"We'll find a way to unseal Satoru Gojo, but in the meantime, I've got your back."
	]
	return lines[Math.floor(Math.random() * lines.length)]
}

export function getYujiItadoriEventLine(quest: CommunityQuest | null): string {
	if (quest) {
		const timestampSeconds = Math.floor(quest.endDate.getTime() / 1000)
		return `Satoru Gojo has been sealed! We need to work together to unseal him. The community quest "${quest.questName}" is currently underway and will end on <t:${timestampSeconds}:f>. Let's do our best to complete the quest and bring Gojo back!`
	} else {
		return "Satoru Gojo has been sealed, but we don't have any information on how to unseal him yet. Stay tuned for updates!"
	}
}

export async function createTechniqueSelectMenu(
	participants: { id: string; totalDamage: number }[],
	deadParticipants: string[],
	countdown: number
): Promise<ActionRowBuilder<SelectMenuBuilder>[]> {
	const rows: ActionRowBuilder<SelectMenuBuilder>[] = []

	for (const participant of participants) {
		if (!deadParticipants.includes(participant.id)) {
			const user = await client.users.fetch(participant.id)
			const userHealth = await getUserHealth(participant.id)

			if (userHealth > 0) {
				const userTechniques = await getUserActiveTechniques(participant.id)

				const techniqueOptions = userTechniques.map(techniqueName => ({
					label: techniqueName,
					description: "Select to use this technique",
					value: techniqueName
				}))

				const selectMenu = new StringSelectMenuBuilder()
					.setCustomId(`select-battle-option-${participant.id}`)
					.setPlaceholder(`${user.username}'s technique (${countdown}s)`)
					.addOptions(techniqueOptions)

				const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu)
				rows.push(row)
			}
		}
	}

	return rows
}

export async function createRaidEmbed(
	raidBoss,
	participants,
	interaction,
	userTechnique = "",
	raidEndTimestamp,
	partyHealth
) {
	const primaryEmbed = new EmbedBuilder()
		.setColor("Aqua")
		.setTitle("Cursed Battle!")
		.setDescription(`You're facing **${raidBoss.name}**! Choose your technique wisely.`)
		.setImage(raidBoss.image_url)
		.addFields(
			{ name: "Party Health", value: `:shield: ${partyHealth.toString()}`, inline: true }, // Replacing Boss Health with Party Health
			{ name: "Boss Grade", value: `${raidBoss.grade}`, inline: true },
			{ name: "Boss Awakening", value: `${raidBoss.awakeningStage}` || "None", inline: true },
			{ name: "Raid Ends", value: `<t:${raidEndTimestamp}:R>`, inline: true }
		)
		.addFields({
			name: "Boss Health Status",
			value: generateHealthBar(partyHealth, raidBoss.globalHealth),
			inline: false
		})

	const participantsHealthFields = []

	for (const participant of participants) {
		try {
			const playerHealth = await getUserHealth(participant.id)
			const member = interaction.guild?.members.cache.get(participant.id)

			if (!member) {
				console.warn(`Participant with ID ${participant.id} not found in guild.`)
			}

			participantsHealthFields.push({
				name: `${member?.displayName || "Unknown"}`,
				value: `:blue_heart: ${playerHealth?.toString() || "0"}`,
				inline: true
			})
		} catch (error) {
			console.error(`Error fetching health for participant ${participant.id}:`, error)
			participantsHealthFields.push({
				name: "Unknown",
				value: ":blue_heart: 0",
				inline: true
			})
		}
	}

	primaryEmbed.addFields(...participantsHealthFields)

	if (userTechnique !== "") {
		primaryEmbed.addFields({
			name: "Last Used Technique",
			value: userTechnique,
			inline: false
		})
	}

	if (raidBoss.awakeningStage === "Stage Five") {
		primaryEmbed.setFooter({ text: "Be careful, There's no information on this boss.." })
	}

	return primaryEmbed
}

export async function handleRaidEnd(interaction: CommandInteraction, raidParty: RaidParty, raidBoss: RaidBoss) {
	const bossDrops: RaidDrops[] = []
	const participantDrops: { [participantId: string]: { drops: RaidDrops[]; raidTokens: number } } = {}

	const totalDamage = raidParty.participants.reduce((sum, participant) => sum + participant.totalDamage, 0)

	for (const participant of raidParty.participants) {
		const { id, totalDamage: participantDamage } = participant
		const damagePercentage = (participantDamage / totalDamage) * 100
		const drops: RaidDrops[] = []
		const raidTokens = Math.floor(Math.random() * (20 - 10 + 1) + 10)

		try {
			const drop = getRaidBossDrop(raidBoss.name)
			if (drop) {
				const adjustedDropRate = Math.min(drop.dropRate * (1 + damagePercentage / 100), 0.5)
				drops.push({ ...drop, dropRate: adjustedDropRate })
			}
		} catch (error) {
			console.error(`Error getting drop for raid boss ${raidBoss.name}:`, error)
		}

		participantDrops[id] = { drops, raidTokens }
		bossDrops.push(...drops)

		for (const drop of drops) {
			try {
				await addItemToUserInventory(id, drop.name, 1)
				await addItemToUserInventory(id, "Raid Token", raidTokens)

				if (drop.name === "Heian Era Awakening") {
					const userUnlockedTransformations = await getUserUnlockedTransformations(id)
					const updatedUnlockedTransformations = [...userUnlockedTransformations, "Heian Era Awakening"]
					await updateUserUnlockedTransformations(id, updatedUnlockedTransformations)
				}
			} catch (error) {
				console.error(`Error adding item to user inventory for user ${id}:`, error)
			}
		}
	}

	// Check if the special drop has already been claimed
	const specialDropClaimed = await checkSpecialDropClaimed(raidBoss.name)

	if (!specialDropClaimed) {
		const randomNumber = Math.random()
		const specialDropChance = 0.0001

		if (randomNumber <= specialDropChance) {
			const luckyParticipant = raidParty.participants[Math.floor(Math.random() * raidParty.participants.length)]
			const specialDrop = "Nah I'd Lose"

			try {
				await addUserTechnique(luckyParticipant.id, specialDrop)
				await markSpecialDropAsClaimed(raidBoss.name)

				participantDrops[luckyParticipant.id].drops.push({
					name: specialDrop,
					rarity: "Special",
					dropRate: 0.01
				})
				bossDrops.push({ name: specialDrop, rarity: "Special", dropRate: 0.01 })

				const luckyUser = await client.users.fetch(luckyParticipant.id)
				const channelId = "1239327615379308677"
				const channel = await client.channels.fetch(channelId)
				if (channel && channel.isTextBased()) {
					await channel.send(
						`Congratulations! ${luckyUser.toString()} has obtained the special drop "Nah I'd Lose"!`
					)
				}
			} catch (error) {
				console.error(`Error adding special drop to user techniques for user ${luckyParticipant.id}:`, error)
			}
		}
	}

	raidBoss.globalHealth -= totalDamage
	await updateRaidBossHealth(raidBoss._id.toString(), raidBoss.globalHealth, raidBoss.current_health)

	if (raidBoss.globalHealth <= 0) {
		const currentPhase = getCurrentPhase(raidBoss)
		raidBoss.name = currentPhase.name
		raidBoss.imageUrl = currentPhase.gif
		await updateRaidBossPhase(raidBoss._id.toString(), currentPhase)
	}

	const raidEndEmbed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle(`Raid Ended - ${raidBoss.name}`)
		.setDescription("The raid has ended. Here are the results:")

	for (const participant of raidParty.participants) {
		const { drops, raidTokens } = participantDrops[participant.id]

		// Group drops by rarity
		const groupedDrops: { [rarity: string]: RaidDrops[] } = {}
		for (const drop of drops) {
			if (!groupedDrops[drop.rarity]) {
				groupedDrops[drop.rarity] = []
			}
			groupedDrops[drop.rarity].push(drop)
		}

		const user = await client.users.fetch(participant.id)
		const userMention = `${user.username}#${user.discriminator}`

		const fieldValue =
			Object.entries(groupedDrops)
				.map(([rarity, drops]) => {
					const dropsString = drops
						.map(drop => `${drop.name} (${(drop.dropRate * 100).toFixed(2)}%)`)
						.join(", ")
					return `${rarity}: ${dropsString}`
				})
				.join("\n") || "No drops"

		raidEndEmbed.addFields(
			{
				name: `Drops for ${userMention}`,
				value: fieldValue,
				inline: false
			},
			{
				name: "Raid Tokens Earned",
				value: `${raidTokens}`,
				inline: true
			}
		)
	}

	await interaction.editReply({ embeds: [raidEndEmbed], components: [] })
}

export async function getUserTutorialMessageId(userId) {
	const userState = await getUserTutorialState(userId)
	return userState.tutorialMessageId
}

client.login(process.env["DISCORD_BOT_TOKEN"])
