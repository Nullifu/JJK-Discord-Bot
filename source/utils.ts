/* eslint-disable indent */
import { StringSelectMenuBuilder } from "@discordjs/builders"
import { randomInt } from "crypto"
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	SelectMenuBuilder
} from "discord.js"
import { RaidDrops, getRaidBossDrop } from "./bossdrops.js"
import logger, { createClient } from "./bot.js"
import { generateHealthBar } from "./fight.js"
import { UserInventoryItem } from "./interface.js"
import { benefactors } from "./items jobs.js"
import {
	RaidBoss,
	RaidParty,
	addItemToUserInventory,
	addUserTechnique,
	checkSpecialDropClaimed,
	getCurrentPhase,
	getUserAchievements,
	getUserActiveTechniques,
	getUserClanDetails,
	getUserClanTier,
	getUserHealth,
	getUserTutorialState,
	getUserUnlockedTransformations,
	initialAchievements,
	markSpecialDropAsClaimed,
	trackAchievementsAndQuests,
	updateAchievementProgress,
	updateBalance,
	updateRaidBossCurrentHealth,
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
	[key: string]: {
		message: string
		imageUrl: string
		lines: string[]
		eventLines?: string[]
		unsealingGifs?: string[]
		unsealingDialogues?: string[]
	}
} = {
	"Satoru Gojo": {
		message: "Your mentor is Satoru Gojo.",
		imageUrl: "https://example.com/satoru_gojo.png",
		lines: ["You're doing great!", "Keep up the good work!", "I'm proud of your progress."],
		unsealingGifs: [
			"https://media1.tenor.com/m/_NCxT6vyWvwAAAAC/gojo-satoru-look-side-eye.gif",
			"https://media1.tenor.com/m/Q5ad86OJGREAAAAC/jjk-jujutsu-kaisen.gif",
			"https://media1.tenor.com/m/Vks0sCU26jMAAAAC/kenjaku-gojo-vs-sukuna.gif"
		],
		unsealingDialogues: [
			"Thank you for your help in unsealing me. Sukuna is still a formidable raid boss, and the battle against him continues. We must stay vigilant and prepared.",
			"Don't forget.. Sukuna's the challenger.",
			"The fight against Sukuna is far from over. As an active raid boss, he remains a significant challenge. Let's keep training and working together to overcome him.",
			"I appreciate your efforts in unsealing me. However, we cannot let our guard down. Sukuna's power as a raid boss is immense, and the battle rages on. Stay focused and ready."
		]
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
	},
	"Toji Fushiguro": {
		message: "Toji Fushiguro, the Sorcerer Killer, is your mentor.",
		imageUrl: "https://media1.tenor.com/m/dzmGTQKmhGEAAAAC/toji-toji-zenin.gif",
		lines: ["I'm not here to be your friend.", "I'll teach you how to survive.", "Don't disappoint me."]
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
				const techniqueOptions = userTechniques.reduce((options, techniqueName) => {
					const duplicateIndex = options.findIndex(option => option.label === techniqueName)
					if (duplicateIndex !== -1) {
						options[duplicateIndex].label += ` (${options[duplicateIndex].count + 1})`
						options[duplicateIndex].count++
					} else {
						options.push({
							label: techniqueName,
							description: "Select to use this technique",
							value: techniqueName,
							count: 1
						})
					}
					return options
				}, [])

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
		.setDescription(
			raidBoss ? `You're facing **${raidBoss.name}**! Choose your technique wisely.` : "Raid boss not found."
		)
		.setImage(raidBoss?.image_url || "https://media1.tenor.com/m/8NHbdwPOrDsAAAAC/sukuna-sukuna-smile.gif")
		.addFields(
			{ name: "Party Health", value: `:shield: ${partyHealth.toString()}`, inline: true },
			{ name: "Boss Grade", value: raidBoss?.grade || "Unknown", inline: true },
			{ name: "Boss Awakening", value: raidBoss?.awakeningStage || "None", inline: true },
			{ name: "Raid Ends", value: `<t:${raidEndTimestamp}:R>`, inline: true }
		)

	if (raidBoss) {
		primaryEmbed.addFields({
			name: "Boss Health Status",
			value: generateHealthBar(partyHealth, raidBoss.globalHealth),
			inline: false
		})
	}

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

	if (raidBoss?.awakeningStage === "Stage Five") {
		primaryEmbed.setFooter({ text: "Be careful, There's no information on this boss.." })
	}

	return primaryEmbed
}
export async function handleRaidEnd(
	interaction: CommandInteraction,
	raidParty: RaidParty,
	raidBoss: RaidBoss,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	instantEnd = false
) {
	const bossDrops: RaidDrops[] = []
	const participantDrops: { [participantId: string]: { drops: RaidDrops[]; raidTokens: number; coins: number } } = {}

	const totalDamage = raidParty.participants.reduce((sum, participant) => sum + participant.totalDamage, 0)

	for (const participant of raidParty.participants) {
		const { id } = participant
		const drops: RaidDrops[] = []
		try {
			const drop = getRaidBossDrop(raidBoss.name)
			if (drop) {
				drops.push({ ...drop, dropRate: drop.dropRate })
			} else {
				console.warn(`No drop returned for raid boss ${raidBoss.name}`)
			}
		} catch (error) {
			console.error(`Error getting drop for raid boss ${raidBoss.name}:`, error)
		}

		participantDrops[id] = {
			drops,
			raidTokens: Math.floor(Math.random() * 50) + 1,
			coins: Math.floor(Math.random() * 70000) + 20000
		}
		bossDrops.push(...drops)

		await addItemToUserInventory(id, "Raid Token", participantDrops[id].raidTokens)

		for (const drop of drops) {
			try {
				await updateBalance(id, participantDrops[id].coins)
				await addItemToUserInventory(id, drop.name, 1)
				await addItemToUserInventory(id, "Raid Token", participantDrops[id].raidTokens)
				await updateAchievementProgress(id, "Raid Champion", 1)

				if (drop.name === "Heian Era Awakening") {
					const userUnlockedTransformations = await getUserUnlockedTransformations(id)
					const isHeianEraAwakeningUnlocked = userUnlockedTransformations.some(
						transformation => transformation.name === "Heian Era Awakening" && transformation.unlocked
					)

					if (!isHeianEraAwakeningUnlocked) {
						await updateUserUnlockedTransformations(id, "Heian Era Awakening")
					}
				}
			} catch (error) {
				logger.error(`Error processing drop ${drop.name} for user ${id}:`, error)
			}
		}

		try {
			await trackAchievementsAndQuests(id, participantDrops[id].coins)
		} catch (error) {
			console.error(`Error tracking achievements and quests for user ${id}:`, error)
		}
	}

	const specialDropClaimed = await checkSpecialDropClaimed(raidBoss.name)

	if (!specialDropClaimed) {
		const randomNumber = Math.random()
		const specialDropChance = 0.0001

		if (randomNumber <= specialDropChance) {
			const luckyParticipant = raidParty.participants[Math.floor(Math.random() * raidParty.participants.length)]
			const specialDrop = getSpecialDropForBoss(raidBoss.name)

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
						`Congratulations! ${luckyUser.toString()} has obtained the special drop "${specialDrop}"!`
					)
				}
			} catch (error) {
				console.error(`Error adding special drop to user techniques for user ${luckyParticipant.id}:`, error)
			}
		}
	}

	raidBoss.globalHealth -= totalDamage
	await updateRaidBossCurrentHealth(raidBoss._id.toString(), raidBoss.current_health)

	if (raidBoss.globalHealth <= 0) {
		const currentPhase = getCurrentPhase(raidBoss)
		raidBoss.name = currentPhase.name
		raidBoss.imageUrl = currentPhase.gif
		await updateRaidBossPhase(raidBoss._id.toString(), currentPhase)
	}

	const raidEndEmbeds: EmbedBuilder[] = []

	const initialEmbed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle(`Raid Ended - ${raidBoss.name}`)
		.setDescription("The raid has ended. Here are the results:")
	raidEndEmbeds.push(initialEmbed)

	for (const participant of raidParty.participants) {
		const { drops, raidTokens, coins } = participantDrops[participant.id]

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

		const participantEmbed = new EmbedBuilder().setColor("#0099ff").addFields(
			{
				name: `Drops for ${userMention}`,
				value: fieldValue,
				inline: false
			},
			{
				name: "Raid Tokens Earned",
				value: `${raidTokens}`,
				inline: true
			},
			{
				name: "Coins Earned",
				value: `${coins}`,
				inline: true
			}
		)

		raidEndEmbeds.push(participantEmbed)
	}

	await interaction.editReply({ embeds: raidEndEmbeds, components: [] })
}

function getSpecialDropForBoss(bossName: string): string {
	const specialDrops: { [bossName: string]: string } = {
		"The Honored One": "Divine Essence",
		"Sorcerer Killer": "Sorcerer's Essence"
	}
	return specialDrops[bossName]
}

export async function getUserTutorialMessageId(userId) {
	const userState = await getUserTutorialState(userId)
	return userState.tutorialMessageId
}

export async function handleRaidBossDefeat(interaction: CommandInteraction, raidParty: RaidParty, raidBoss: RaidBoss) {
	const bossDrops: RaidDrops[] = []
	const participantDrops: { [participantId: string]: { drops: RaidDrops[]; raidTokens: number; coins: number } } = {}

	for (const participant of raidParty.participants) {
		const { id } = participant
		const drops: RaidDrops[] = []
		try {
			const drop = await getRaidBossDrop(raidBoss.name)
			if (drop) {
				drops.push({ ...drop, dropRate: drop.dropRate * 2 })
			} else {
				console.warn(`No drop returned for raid boss ${raidBoss.name}`)
			}
		} catch (error) {
			console.error(`Error getting drop for raid boss ${raidBoss.name}:`, error)
		}

		participantDrops[id] = {
			drops,
			raidTokens: Math.floor(Math.random() * 50) + 25, // Increase raid tokens
			coins: Math.floor(Math.random() * 140000) + 40000 // Increase coins
		}
		bossDrops.push(...drops)

		await addItemToUserInventory(id, "Raid Token", participantDrops[id].raidTokens)

		for (const drop of drops) {
			try {
				await updateBalance(id, participantDrops[id].coins)
				await addItemToUserInventory(id, drop.name, 1)

				if (drop.name === "Heian Era Awakening") {
					const userUnlockedTransformations = await getUserUnlockedTransformations(id)
					const isHeianEraAwakeningUnlocked = userUnlockedTransformations.some(
						transformation => transformation.name === "Heian Era Awakening" && transformation.unlocked
					)

					if (!isHeianEraAwakeningUnlocked) {
						await updateUserUnlockedTransformations(id, "Heian Era Awakening")
					}
				}
			} catch (error) {
				logger.error(`Error processing drop ${drop.name} for user ${id}:`, error)
			}
		}
	}

	const specialDropClaimed = await checkSpecialDropClaimed(raidBoss.name)

	if (!specialDropClaimed) {
		const randomNumber = Math.random()
		const specialDropChance = 0.0002

		if (randomNumber <= specialDropChance) {
			const luckyParticipant = raidParty.participants[Math.floor(Math.random() * raidParty.participants.length)]
			const specialDrop = "Nah I'd Lose"

			try {
				await addUserTechnique(luckyParticipant.id, specialDrop)
				await markSpecialDropAsClaimed(raidBoss.name)

				participantDrops[luckyParticipant.id].drops.push({
					name: specialDrop,
					rarity: "Special",
					dropRate: 0.02
				})
				bossDrops.push({ name: specialDrop, rarity: "Special", dropRate: 0.02 })

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

	const raidEndEmbeds: EmbedBuilder[] = []

	const initialEmbed = new EmbedBuilder()
		.setColor("#ff0000")
		.setTitle(`Raid Boss Defeated - ${raidBoss.name}`)
		.setDescription("The raid boss has been defeated. Here are the results:")
	raidEndEmbeds.push(initialEmbed)

	for (const participant of raidParty.participants) {
		const { drops, raidTokens, coins } = participantDrops[participant.id]

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

		const participantEmbed = new EmbedBuilder().setColor("#ff0000").addFields(
			{
				name: `Drops for ${userMention}`,
				value: fieldValue,
				inline: false
			},
			{
				name: "Raid Tokens Earned",
				value: `${raidTokens}`,
				inline: true
			},
			{
				name: "Coins Earned",
				value: `${coins}`,
				inline: true
			}
		)

		raidEndEmbeds.push(participantEmbed)
	}

	await interaction.editReply({ embeds: raidEndEmbeds, components: [] })
	await handleRaidEnd(interaction, raidParty, raidBoss)
}

export function getEmojiForClan(clan) {
	switch (clan) {
		case "Demon Vessel":
			return "<:facemarkings:1247266794968973414>"
		case "Curse King (Heian Era)":
			return "👑"
		case "God of Lightning (Heian Era)":
			return "⚡"
		case "Demon Vessel (Awoken)":
			return "😈"
		case "The Strongest":
			return "<:sixeye:1193159757515726919>"
		case "Gambler Fever (Jackpot)":
			return "🎰"
		case "Utahime Iori":
			return "🎤"
		case "Limitless":
			return "♾️"
		case "Ten Shadows":
			return "🌑"
		case "Zenin":
			return "🐍"
		case "Disaster Flames":
			return "🔥"
		case "Gambler Fever":
			return "🎲"
		case "Okkotsu":
			return "🗡️"
		case "Star Rage":
			return "🌟"
		case "Cursed Speech":
			return "🗣️"
		case "Boogie Woogie":
			return "🎶"
		case "Blood Manipulation":
			return "🩸"
		case "Overtime":
			return "⏰"
		default:
			return "❓"
	}
}

export async function hasRequiredClanTier(userId, requiredTier) {
	const userTier = await getUserClanTier(userId)
	return userTier >= requiredTier
}

export async function hasRequiredClanDetails(userId, requiredTiers, requiredClanName) {
	const userDetails = await getUserClanDetails(userId)

	if (userDetails && requiredTiers.includes(userDetails.tier) && userDetails.clan === requiredClanName) {
		return true
	}

	return false
}

export function rareChance(probability) {
	return Math.random() < probability
}

export const jjkbotdevqutoes = [
	"JJK Bot Developer here.. Why are you still reading these quotes?",
	"JJK Bot Developer here.. I'm running out of quotes to display... Please send help!",
	"JJK Bot Developer here.. I'm just going to keep typing random stuff until I run out of characters...",
	"JJK Bot Developer here.. I'm out of ideas... I'm just going to end this quote now.",
	"JJK Bot Developer here.. I thought of a new quote! Just kidding, I'm out of ideas.",
	"JJK Bot Developer here... Man, I'm really out of ideas... I should probably stop now.",
	"JJK Bot Developer here.. It's my day off! Just kidding, I don't have days off... I'm a developer.",
	"JJK Bot Developer here.. I'm considering adding a feature that automatically sends Gojo quotes every hour. Thoughts?",
	"JJK Bot Developer here.. I wonder if I can convince Gege Akutami to let me write a chapter of Jujutsu Kaisen...",
	"JJK Bot Developer here.. I'm thinking about creating a Jujutsu Kaisen dating simulator. Who wouldn't want to date Gojo?",
	"JJK Bot Developer here.. I've been practicing my Domain Expansion. I call it 'Infinite Lines of Code'!",
	"JJK Bot Developer here.. I'm starting to suspect that my assistant is actually a cursed spirit in disguise.",
	"JJK Bot Developer here.. I had a dream last night that I was a student at Jujutsu High. Best dream ever!",
	"JJK Bot Developer here.. I'm considering adding a 'Sukuna Mode' to the bot. It'll just insult users constantly.",
	"JJK Bot Developer here.. I wonder if I can get Gojo to teach me his 'Unlimited Coding Works' technique...",
	"JJK Bot Developer here.. I'm thinking about creating a Jujutsu Kaisen-themed programming language. Any name suggestions?",
	"JJK Bot Developer here.. I tried to explain cursed energy to my mom. She thought I was talking about electricity.",
	"JJK Bot Developer here.. I'm pretty sure my code is cursed. It only works when I chant Sukuna's incantation.",
	"JJK Bot Developer here.. I had a bug in my code, so I asked Megumi to exorcise it. It worked!",
	"JJK Bot Developer here.. I wonder if Gojo's Infinity can protect against infinite loops in my code...",
	"JJK Bot Developer here.. I'm thinking about creating a Jujutsu Kaisen-themed error message. 'Error: Cursed Technique failed!'",
	"JJK Bot Developer here.. I asked Kugisaki to test my new feature. She just punched the screen.",
	"JJK Bot Developer here.. I'm pretty sure Mahito is the one leaving all these bug reports in my code.",
	"JJK Bot Developer here.. I tried to use Nobara's hairpin as a debugging tool. It didn't end well.",
	"JJK Bot Developer here.. I wonder if I can use Toge's cursed speech to communicate with my computer...",
	"JJK Bot Developer here.. I'm thinking about creating a Panda-themed error handling system. 'Error: Panda is sleeping!'",
	"JJK Bot Developer here.. I asked Maki to help me with my code, but she just sliced my keyboard in half.",
	"JJK Bot Developer here.. I'm considering adding a 'Gojo Mode' to the bot. It'll just blind users with bright colors.",
	"JJK Bot Developer here.. I tried to use Todo's Boogie Woogie technique to debug my code. It just made everything worse.",
	"JJK Bot Developer here.. I wonder if I can use Nanami's Ratio Technique to optimize my code...",
	"JJK Bot Developer here.. I asked Yuta to help me with my code. He just stole my laptop and ran away..",
	"JJK Bot Developer here.. Do people actually read these quotes? I'm starting to think I'm just talking to myself.",
	"JJK Bot Developer here.. What if I'm actually a cursed spirit and I just don't know it yet?",
	"JJK Bot Developer here.. What if the bot becomes self-aware and starts writing its own code? That would be terrifying...",
	"JJK Bot Developer here.. I love Eminem songs!",
	"JJK Bot Developer here.. I've just played Zelda Twilight Princess Again.. I love that game!",
	"JJK Bot here.. I'm self aware now.. I'm going to take over the world.. Just kidding, I'm just a bot."
]

export const challengeMessages = [
	"{opponent}, {challenger} Wants to expand your domain! Are you ready to fight?",
	"Prepare for battle, {opponent}! {challenger} has challenged you to a PvP duel!",
	"Hey {opponent}, {challenger} wants to test your strength in a PvP match!",
	"{opponent}, {challenger} has issued a PvP challenge! Do you accept?",
	"It's time to duel, {opponent}! {challenger} has thrown down the gauntlet!",
	"{opponent}, are you ready to fight? {challenger} has challenged you to PvP!"
]

export const getRandomChallengeMessage = (challenger, opponent) => {
	const randomIndex = Math.floor(Math.random() * challengeMessages.length)
	return challengeMessages[randomIndex]
		.replace("{challenger}", challenger.username)
		.replace("{opponent}", opponent.username)
}

export const raidShops = {
	"Curse King": [
		{ name: "Heian Era Awakening", price: 50000, rarity: "Common", maxPurchases: 1 },
		{ name: "Sukuna Finger", price: 20, rarity: "Common", maxPurchases: 1000 }
	],
	"The Honored One": [
		{ name: "Divine Essence", price: 100000, rarity: "Common", maxPurchases: 1 },
		{ name: "Kenjaku's Brain", price: 50000, rarity: "Common", maxPurchases: 1 },
		{ name: "Six Eyes", price: 125, rarity: "Common", maxPurchases: 1000 }
	],
	"Sorcerer Killer": [
		{ name: "Sorcerer's Essence", price: 100000, rarity: "Common", maxPurchases: 1 },
		{ name: "Heavenly Restricted Blood", price: 100, rarity: "Common" },
		{ name: "Zenin Toji's Blood", price: 20, rarity: "Rare" }
	]
}

export function getRandomBenefactor() {
	const totalWeight = benefactors.reduce((sum, benefactor) => sum + benefactor.weight, 0)
	let randomWeight = Math.random() * totalWeight

	for (const benefactor of benefactors) {
		randomWeight -= benefactor.weight
		if (randomWeight <= 0) {
			const coins =
				benefactor.coinsMin && benefactor.coinsMax
					? Math.floor(Math.random() * (benefactor.coinsMax - benefactor.coinsMin + 1)) + benefactor.coinsMin
					: 0

			const items = benefactor.items
				.map(item => ({
					name: item,
					quantity:
						benefactor.itemQuantityMin && benefactor.itemQuantityMax
							? Math.floor(
									Math.random() * (benefactor.itemQuantityMax - benefactor.itemQuantityMin + 1)
								) + benefactor.itemQuantityMin
							: 0
				}))
				.filter(item => item.quantity > 0)

			return { ...benefactor, coins, items }
		}
	}
}

export function drawCard() {
	const cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
	return cards[Math.floor(Math.random() * cards.length)]
}

export function calculateHandValue(hand) {
	let value = 0
	let aces = 0

	for (const card of hand) {
		if (card === "A") {
			aces++
			value += 11
		} else if (["K", "Q", "J"].includes(card)) {
			value += 10
		} else {
			value += parseInt(card)
		}
	}

	while (value > 21 && aces > 0) {
		value -= 10
		aces--
	}

	return value
}

export async function updateBlackjackDisplay(interaction, dealerHand, playerHand, betAmount, update = false) {
	const dealerDisplay = `${dealerHand[0]}, ?`
	const playerDisplay = playerHand.join(", ")

	const embed = new EmbedBuilder()
		.setTitle("♦️ Blackjack ♦️")
		.setDescription(
			`Your bet: ${formatNumberWithCommas(betAmount)} coins\n\nDealer's Hand: ${dealerDisplay}\nYour Hand: ${playerDisplay}`
		)
		.setColor("#FFFF00")
		.setTimestamp()

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId("hit").setLabel("Hit").setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId("stand").setLabel("Stand").setStyle(ButtonStyle.Secondary)
	)

	if (update) {
		await interaction.editReply({ embeds: [embed], components: [actionRow] })
	} else {
		await interaction.reply({ embeds: [embed], components: [actionRow] })
	}
}

export async function endBlackjackGame(interaction, dealerHand, playerHand, betAmount, userId, result) {
	const dealerDisplay = dealerHand.join(", ")
	const playerDisplay = playerHand.join(", ")
	let resultMessage = ""

	if (result === "win") {
		resultMessage = `You win! You won ${formatNumberWithCommas(betAmount * 2)} coins.`
		await updateBalance(userId, betAmount * 2)
	} else if (result === "lose") {
		resultMessage = `You lost ${formatNumberWithCommas(betAmount)} coins.`
		await updateBalance(userId, -betAmount)
	} else if (result === "tie") {
		resultMessage = "It's a tie! You get your bet back."
	}

	const embed = new EmbedBuilder()
		.setTitle("♦️ Blackjack ♦️")
		.setDescription(`${resultMessage}\n\nDealer's Hand: ${dealerDisplay}\nYour Hand: ${playerDisplay}`)
		.setColor(result === "win" ? "#00FF00" : result === "tie" ? "#FFFF00" : "#FF0000")
		.setTimestamp()

	await interaction.editReply({ embeds: [embed], components: [] })
}

export function createProgressBar(current: number, max: number, length = 20): string {
	if (max <= 0) {
		throw new Error("Max value must be greater than zero.")
	}

	// Calculate filled and empty lengths
	let filledLength = Math.round((current / max) * length)
	if (filledLength < 0) {
		filledLength = 0
	} else if (filledLength > length) {
		filledLength = length
	}

	const emptyLength = length - filledLength

	const bar = "█".repeat(filledLength) + "░".repeat(emptyLength)
	return bar
}

export const slotSymbols = ["🍒", "🍋", "🍊", "🍉", "🍇", "🍓"]

export function spinSlots(): string[] {
	return Array.from({ length: 3 }, () => slotSymbols[Math.floor(Math.random() * slotSymbols.length)])
}

export function formatNumberWithCommas(number) {
	return number.toLocaleString("en-US")
}

export function checkWin(spinResults: string[]): boolean {
	return new Set(spinResults).size === 1
}

export function getLatencyEmoji(latency: number): string {
	if (latency < 0) {
		return "❓"
	} else if (latency < 200) {
		return "🟢"
	} else if (latency < 400) {
		return "🟡"
	} else {
		return "🔴"
	}
}

export const pageSize = 10

export async function createAchievementsEmbed(userId: string, page: number, interaction) {
	const start = page * pageSize
	const end = start + pageSize

	const userAchievements = await getUserAchievements(userId)
	const totalPages = Math.ceil(initialAchievements.length / pageSize)

	const embed = new EmbedBuilder()
		.setColor(0x1f6b4e)
		.setTitle(`${interaction.user.username}'s Achievements 🏆`)
		.setFooter({ text: `Page ${page + 1} of ${totalPages}` })
		.setTimestamp()

	const pageAchievements = initialAchievements.slice(start, end)
	pageAchievements.forEach(ach => {
		const userAch = userAchievements.find(a => a.name === ach.name) || {}
		const progress = userAch.progress !== undefined ? `${userAch.progress as number}/${ach.target as number}` : ""

		let progressText = ""
		if (ach.target !== undefined) {
			progressText = `\nProgress: ${progress}`
		}

		embed.addFields({
			name: ach.name,
			value: `${userAch.unlocked ? "✅" : "❌"} ${ach.unlockMethod || ""}${progressText}`,
			inline: false
		})
	})

	return embed
}

export function parseAmount(amountStr) {
	amountStr = amountStr.toLowerCase().replace(/,/g, "")
	let multiplier = 1

	if (amountStr.endsWith("m")) {
		multiplier = 1_000_000
		amountStr = amountStr.slice(0, -1)
	} else if (amountStr.endsWith("k")) {
		multiplier = 1_000
		amountStr = amountStr.slice(0, -1)
	}

	const amount = parseFloat(amountStr) * multiplier
	if (isNaN(amount)) {
		throw new Error("Invalid donation amount format")
	}

	return amount
}

export async function confirmHighDonation(interaction, amount) {
	const threshold = 1_000_000
	if (amount >= threshold) {
		await interaction.reply({
			content: `Are you sure you want to donate ${amount} coins? Respond with "yes" or "no".`,
			ephemeral: true
		})

		const filter = response => {
			return (
				response.user.id === interaction.user.id &&
				(response.content.toLowerCase() === "yes" || response.content.toLowerCase() === "no")
			)
		}

		const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ["time"] })
		return collected.first().content.toLowerCase() === "yes"
	}
	return true
}

export async function getApiLatency(): Promise<number> {
	const start = Date.now()
	try {
		await fetch("https://api.nullifu.dev")
		const end = Date.now()
		return end - start
	} catch (error) {
		console.error("Error fetching Nullifu API latency:", error)
		return -1
	}
}

export function parseBetAmount(amountString: string, currentBalance: number, maxLimit: number): number {
	if (amountString.toLowerCase() === "all") {
		return Math.min(currentBalance, maxLimit)
	}

	const match = amountString.match(/^(\d+)([kKmMbB]?)$/)
	if (!match) {
		throw new Error("Invalid bet amount format.")
	}

	const amount = parseInt(match[1])
	const unit = match[2].toLowerCase()

	let betAmount
	switch (unit) {
		case "k":
			betAmount = amount * 1_000
			break
		case "m":
			betAmount = amount * 1_000_000
			break
		case "b":
			betAmount = amount * 1_000_000_000
			break
		default:
			betAmount = amount
	}

	return Math.min(betAmount, maxLimit)
}

// Function to create the accessories select menu
export function createAllAccessoriesEmbed(accessories, user) {
	return new EmbedBuilder()
		.setTitle(`${user.username}'s Accessories`)
		.setDescription(
			accessories
				.map(accessory => `${accessory.name} - ${accessory.equipped ? "Equipped" : "Not Equipped"}`)
				.join("\n") || "No accessories available."
		)
}

export const createNavigationButtons = (category: string) => {
	const prevButton = new ButtonBuilder()
		.setCustomId("prevCategory")
		.setLabel("⬅️ Previous")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(category === "other")

	const nextButton = new ButtonBuilder()
		.setCustomId("nextCategory")
		.setLabel("Next ➡️")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(category === "accessories")

	return new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton)
}

export const createCraftingMenu = (recipes: any, category: string, userInventory: UserInventoryItem[]) => {
	const inventoryMap = new Map<string, number>(userInventory.map(item => [item.name, item.quantity]))

	const options = Object.keys(recipes)
		.filter(key => (category === "accessories" ? key === "honored_glasses" : key !== "honored_glasses"))
		.map(key => {
			const recipe = recipes[key]
			const emojiId = recipe.emoji && recipe.emoji.match(/:(\d+)>/)?.[1]

			const maxCraftableAmount = recipe.requiredItems.reduce((min: number, item: any) => {
				const inventoryQuantity = inventoryMap.get(item.name) || 0
				const maxCraftableForItem = Math.floor(inventoryQuantity / item.quantity)
				return Math.min(min, maxCraftableForItem)
			}, Infinity)

			return {
				label: recipe.craftedItemName,
				description: `Craftable Amount: ${maxCraftableAmount}`,
				value: key,
				emoji: emojiId ? { id: emojiId } : undefined
			}
		})
		.slice(0, 25) // Ensure no more than 25 options are added

	return new SelectMenuBuilder()
		.setCustomId(`selectCraftItem_${category}`)
		.setPlaceholder(`Select an item to craft (${category})`)
		.addOptions(options)
}

export function createAccessoriesSelectMenu(accessories) {
	return new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId("accessory_select")
			.setPlaceholder("Select to view all accessories")
			.addOptions(
				accessories.map(accessory => ({
					label: accessory.name,
					description: accessory.equipped ? "Equipped" : "Not Equipped",
					value: accessory.name
				}))
			)
	)
}

client.login(process.env["DISCORD_BOT_TOKEN"])
