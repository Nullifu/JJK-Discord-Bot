/* eslint-disable @typescript-eslint/no-unused-vars */

import { ActionRowBuilder, ButtonBuilder, SelectMenuBuilder } from "@discordjs/builders"
import { ButtonStyle, CacheType, ChatInputCommandInteraction, ComponentType, EmbedBuilder } from "discord.js"
import logger from "./bot.js"
import { calculateDamage, getBossDrops, getRandomXPGain, rarityProbabilities } from "./calculate.js"
import { activeCollectors, getButtons, tutorialPages } from "./command.js"
import { BossData } from "./interface.js"
import {
	addItemToUserInventory,
	addUserQuestProgress,
	getUserGrade,
	getUserMaxHealth,
	getUserQuests,
	getUserSettings,
	getUserShikigami,
	getUserTutorialState,
	getUserUnlockedTransformations,
	removeAllStatusEffects,
	setUserTutorialState,
	updateBalance,
	updateMonthlyFightsWon,
	updatePlayerClanTier,
	updatePlayerGrade,
	updateUserExperience,
	updateUserFightsWon,
	updateUserHealth,
	updateUserInateClanExperience,
	updateUserShikigami,
	updateUserUnlockedTransformations
} from "./mongodb.js"
import { createFeverMeterBar } from "./utils.js"

export async function handleBossDeath(
	interaction: ChatInputCommandInteraction<CacheType>,
	embed: EmbedBuilder,
	row: ActionRowBuilder<SelectMenuBuilder>,
	opponent: BossData
) {
	const victoryMessage = "You won"
	embed.setDescription(victoryMessage)

	if (opponent.name === "Mahito Instant Spirit Body of Distorted Killing") {
		embed.setDescription("I admit it, Mahito I am you.")
		embed.setImage("https://storage.googleapis.com/jjk_bot_personal/yuji-snow-mahito-snow.gif")
	}
	if (opponent.name === "Satoru Gojo (Shinjuku Showdown Arc)") {
		embed.setDescription("You were magnificent, Satoru Gojo. I shall never forget you for as long as I live.")
		const userSettings = await getUserSettings(interaction.user.id)
		if (userSettings?.showSpoilers === true) {
			embed.setImage("https://storage.googleapis.com/jjk_bot_personal/ohmanohman.png")
		}
	}

	await interaction.editReply({ embeds: [embed], components: [] })

	function getrandommoney(min = 25000, max = 50000) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	}

	const experienceGain = getRandomXPGain()
	const coinsGained = getrandommoney()

	const questProgressions = {
		"Hakari Kinji": [
			{ quest: "Gamblers Fever", amount: 1 },
			{ quest: "Kashimo's Task", amount: 1, condition: "Defeat Hakari Kinji" }
		],
		"Satoru Gojo": [
			{ quest: "Satoru Gojo's Mission", amount: 1, condition: "Defeat Gojo" },
			{ quest: "Kashimo's Task", amount: 1, condition: "Defeat Gojo" },
			{ quest: "Mentor: The Strongest", amount: 1 }
		],
		"Sukuna": [
			{ quest: "Satoru Gojo's Mission", amount: 1, condition: "Defeat Sukuna" },
			{ quest: "Awakening", amount: 1, condition: "Defeat Ryomen Sukuna" },
			{ quest: "Mentor: Curse King", amount: 1 },
			{ quest: "Kashimo's Task", amount: 1, condition: "Defeat Sukuna" }
		],
		"Itadori": [{ quest: "Training with Itadori", amount: 1 }],
		"Mahito Instant Spirit Body of Distorted Killing": [{ quest: "Nature of Curses", amount: 1 }],
		"Hakari (Jackpot)": [
			{ quest: "Gamblers Fever", amount: 1 },
			{ quest: "Kashimo's Task", amount: 1, condition: "Defeat Hakari Kinji" }
		],
		"Dagon": [{ quest: "Disaster Curses", amount: 1, condition: "Defeat Dagon" }],
		"Jogo": [{ quest: "Disaster Curses", amount: 1, condition: "Defeat Jogo" }],
		"Hanami": [{ quest: "Disaster Curses", amount: 1, condition: "Defeat Hanami" }],
		"Yuji Itadori (Awoken)": [
			{ quest: "Awakening", amount: 1, condition: "Defeat Yuji Itadori (Awoken)" },
			{ quest: "Stage Three Unleashed", amount: 1, condition: "Defeat Yuji Itadori (Awoken)" },
			{ quest: "Stage Three Unleashed", amount: 1, condition: "Yuji Itadori (Awoken)" }
		],
		"Satoru Gojo (Shinjuku Showdown Arc)": [
			{ quest: "Stage Three Unleashed", amount: 1, condition: "Defeat Satoru Gojo (Shinjuku Showdown Arc)" },
			{ quest: "Stage Three Unleashed", amount: 1, condition: "Satoru Gojo (Shinjuku Showdown Arc)" },
			{ quest: "Limitless Unleashed", amount: 1, condition: "Defeat Satoru Gojo (Shinjuku Showdown Arc)" }
		],
		"Satoru Gojo Limit-Broken": [
			{ quest: "Limitless Unleashed", amount: 1, condition: "Defeat Satoru Gojo Limit-Broken" }
		]
	}

	if (opponent.name === "Hakari Kinji") {
		await addUserQuestProgress(interaction.user.id, "Gamblers Fever", 1)
		await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Hakari Kinji")
	}
	if (opponent.name === "Satoru Gojo") {
		await addUserQuestProgress(interaction.user.id, "Satoru Gojo's Mission", 1, "Defeat Gojo")
		await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Gojo")
		await addUserQuestProgress(interaction.user.id, "Mentor: The Strongest", 1)
	}
	if (opponent.name === "Sukuna") {
		await addUserQuestProgress(interaction.user.id, "Satoru Gojo's Mission", 1, "Defeat Sukuna")
		await addUserQuestProgress(interaction.user.id, "Awakening", 1, "Defeat Ryomen Sukuna")
		await addUserQuestProgress(interaction.user.id, "Mentor: Curse King", 1)
		await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Sukuna")
	}
	if (opponent.name === "Itadori") {
		await addUserQuestProgress(interaction.user.id, "Training with Itadori", 1)
	}
	if (opponent.name === "Mahito Instant Spirit Body of Distorted Killing") {
		await addUserQuestProgress(interaction.user.id, "Nature of Curses", 1)
	}
	if (opponent.name === "Hakari (Jackpot)") {
		await addUserQuestProgress(interaction.user.id, "Gamblers Fever", 1)
		await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Hakari Kinji")
	}
	if (opponent.name === "Dagon") {
		await addUserQuestProgress(interaction.user.id, "Disaster Curses", 1, "Defeat Dagon")
	}
	if (opponent.name === "Jogo") {
		await addUserQuestProgress(interaction.user.id, "Disaster Curses", 1, "Defeat Jogo")
	}
	if (opponent.name === "Hanami") {
		await addUserQuestProgress(interaction.user.id, "Disaster Curses", 1, "Defeat Hanami")
	}
	if (opponent.name === "Satoru Gojo Limit-Broken") {
		await addUserQuestProgress(interaction.user.id, "Limitless Unleashed", 1, "Defeat Satoru Gojo Limit-Broken")
	}
	if (opponent.name === "Yuji Itadori (Awoken)") {
		await addUserQuestProgress(interaction.user.id, "Awakening", 1, "Defeat Yuji Itadori (Awoken)")
		await addUserQuestProgress(interaction.user.id, "Stage Three Unleashed", 1, "Defeat Yuji Itadori (Awoken)")
		await addUserQuestProgress(interaction.user.id, "Stage Three Unleashed", 1, "Yuji Itadori (Awoken)")
	}
	if (opponent.name === "Satoru Gojo (Shinjuku Showdown Arc)") {
		await addUserQuestProgress(
			interaction.user.id,
			"Stage Three Unleashed",
			1,
			"Defeat Satoru Gojo (Shinjuku Showdown Arc)"
		)
		await addUserQuestProgress(interaction.user.id, "Limitless Unleashed", 1, "Satoru Gojo (Shinjuku Showdown Arc)")
		await addUserQuestProgress(
			interaction.user.id,
			"Stage Three Unleashed",
			1,
			"Satoru Gojo (Shinjuku Showdown Arc)"
		)
	}

	const userQuestsData = await getUserQuests(interaction.user.id)
	const activeQuests = userQuestsData.quests.map(quest => quest.id)

	const updatedQuests = []

	if (questProgressions[opponent.name]) {
		for (const questProgress of questProgressions[opponent.name]) {
			if (activeQuests.includes(questProgress.quest)) {
				await addUserQuestProgress(
					interaction.user.id,
					questProgress.quest,
					questProgress.amount,
					questProgress.condition || null
				)
			}
		}
	}

	const generalQuests = [
		{ quest: "Awakening", amount: 1, description: "Defeat Foes" },
		{ quest: "Satoru Gojo's Mission", amount: 1, description: "Training" },
		{ quest: "Nanami's Task", amount: 1, description: "Complete Task" },
		{ quest: "Kashimo's Task", amount: 1, description: "Defeat Foes" },
		{ quest: "Limitless Unleashed", amount: 1, description: "Defeat Foes" },
		{ quest: "Mission with Nobara", amount: 1, description: "Defeat 20 foes and find Nobara's eyes!" }
	]

	// Process general quests
	for (const generalQuest of generalQuests) {
		if (activeQuests.includes(generalQuest.quest)) {
			await addUserQuestProgress(
				interaction.user.id,
				generalQuest.quest,
				generalQuest.amount,
				generalQuest.description
			)
		}
	}

	logger.info(
		`Updated Quests: ${updatedQuests.map(q => `${q.questId} - ${q.taskDescription} (${q.amount})`).join(", ")}`
	)

	activeCollectors.delete(interaction.user.id)
	await updateUserExperience(interaction.user.id, experienceGain)
	await updatePlayerGrade(interaction.user.id)
	await removeAllStatusEffects(interaction.user.id)
	await updateUserInateClanExperience(interaction.user.id, 125, "Limitless")
	await updatePlayerClanTier(interaction.user.id)
	await updateUserFightsWon(interaction.user.id)
	await addUserQuestProgress(interaction.user.id, "Awakening", 1, "Defeat Foes")
	await addUserQuestProgress(interaction.user.id, "Satoru Gojo's Mission", 1, "Training")
	await addUserQuestProgress(interaction.user.id, "Nanami's Task", 1, "Complete Task")
	await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Foes")
	await addUserQuestProgress(interaction.user.id, "Limitless Unleashed", 1, "Defeat Foes")
	await addUserQuestProgress(interaction.user.id, "Mission with Nobara", 1)
	await updateMonthlyFightsWon(interaction.user.id)

	const drops = await getBossDrops(interaction.user.id, opponent.name)
	const dropCounts = {}

	for (const drop of drops) {
		await addItemToUserInventory(interaction.user.id, drop.name, 1)
		logger.info(`Added drop to inventory: ${drop.name}`)
		if (dropCounts[drop.name]) {
			dropCounts[drop.name]++
		} else {
			dropCounts[drop.name] = 1
		}
	}
	await updateBalance(interaction.user.id, coinsGained)

	const privateEmbed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle("Battle Rewards")
		.addFields(
			{
				name: "Experience Gained",
				value: `You've gained ${experienceGain.toLocaleString("en-US")} XP for defeating the boss!`
			},
			{
				name: "Coins Gained",
				value: `You've gained ${coinsGained.toLocaleString("en-US")} Coins for defeating the boss!`
			}
		)

	if (Object.keys(dropCounts).length > 0) {
		const dropDescriptions = Object.keys(dropCounts)
			.map(dropName => {
				const drop = drops.find(d => d.name === dropName)
				const dropProbability =
					(drop?.probability ?? rarityProbabilities[drop?.rarity.toLowerCase() ?? "common"] ?? 0.5) * 100
				return `${dropName} (x${dropCounts[dropName]}) - Chance: ${dropProbability}%`
			})
			.join("\n")
		privateEmbed.addFields({
			name: "Loot Drop",
			value: `\n${dropDescriptions}`
		})
	} else {
		privateEmbed.addFields({
			name: "Loot Drop",
			value: "No items were found."
		})
	}

	if (updatedQuests.length > 0) {
		const questUpdates = updatedQuests.map(q => `**${q.questId}**\n- ${q.taskDescription}: +${q.amount}`).join("\n")
		privateEmbed.addFields({ name: "Quests Updated", value: `The following quests were updated:\n${questUpdates}` })
	}

	await interaction.followUp({ embeds: [privateEmbed], ephemeral: true })

	const userState = await getUserTutorialState(interaction.user.id)

	if (userState && userState.fightUsed === undefined) {
		userState.fightUsed = true
		await setUserTutorialState(interaction.user.id, userState)

		const tutorialMessageId = userState.tutorialMessageId

		if (tutorialMessageId) {
			const dmChannel = await interaction.user.createDM()
			const tutorialMessage = await dmChannel.messages.fetch(tutorialMessageId)

			if (tutorialMessage) {
				const step = 4
				const buttons = await getButtons(step, interaction.user.id)

				await tutorialMessage.edit({
					embeds: [tutorialPages[step]],
					components: [buttons]
				})
			}
		}
	}
}
export async function handleShikigamiTame(
	interaction: ChatInputCommandInteraction<CacheType>,
	embed: EmbedBuilder,
	row: ActionRowBuilder<SelectMenuBuilder>,
	opponent: BossData
) {
	interface UserShikigami {
		name: string
		experience: number
		health: number
		tier: number
		tamedAt: Date
		hygiene: number
		hunger: number
		friendship: number
	}
	const victoryMessage = "You won"
	embed.setDescription(victoryMessage)
	const drops = await getBossDrops(interaction.user.id, opponent.name)

	for (const drop of drops) {
		await addItemToUserInventory(interaction.user.id, drop.name, 1)
	}

	activeCollectors.delete(interaction.user.id)
	await removeAllStatusEffects(interaction.user.id)

	let tamedShikigami: UserShikigami

	if (opponent.name === "Divine-General Mahoraga") {
		tamedShikigami = {
			name: "Divine-General Mahoraga",
			experience: 0,
			tier: 5,
			health: 500,
			tamedAt: new Date(),
			hygiene: 100,
			hunger: 100,
			friendship: 0
		}
	}
	if (opponent.name === "Divine Dogs Totality") {
		tamedShikigami = {
			name: "Divine Dogs Totality",
			experience: 0,
			tier: 5,
			health: 500,
			tamedAt: new Date(),
			hygiene: 100,
			hunger: 100,
			friendship: 0
		}
	} else {
		tamedShikigami = {
			name: opponent.name,
			experience: 0,
			tier: 5,
			health: opponent.name === "Mahoraga" ? 400 : 100,
			tamedAt: new Date(),
			hygiene: 100,
			hunger: 100,
			friendship: 0
		}
	}

	const userShikigami = await getUserShikigami(interaction.user.id)

	const hasShikigami = userShikigami.some(shikigami => shikigami.name === tamedShikigami.name)

	const privateEmbed = new EmbedBuilder().setColor("#0099ff").setTitle("Battle Rewards")

	if (!hasShikigami) {
		await updateUserShikigami(interaction.user.id, tamedShikigami)
		privateEmbed.addFields({ name: "Tamed", value: `You've tamed ${opponent.name}!` })
	} else {
		privateEmbed.addFields({
			name: "Already Tamed",
			value: `You already have ${opponent.name} in your collection!`
		})
	}

	await interaction.followUp({ embeds: [privateEmbed], ephemeral: true })
}

export async function executeSpecialTechnique({
	collectedInteraction,
	techniqueName,
	damageMultiplier,
	imageUrl,
	description,
	fieldValue,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed
}) {
	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	const playerGradeData = await getUserGrade(collectedInteraction.user.id)
	const playerGradeString = playerGradeData

	const damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier

	primaryEmbed.setImage(imageUrl)
	primaryEmbed.setDescription(description)
	primaryEmbed.setFields({ name: "Player Technique", value: fieldValue })

	if (!collectedInteraction.deferred && !collectedInteraction.replied) {
		await collectedInteraction.deferReply()
	}

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	return damage
}

export async function executeSpecialTechniquePvp({
	collectedInteraction,
	techniqueName,
	damageMultiplier,
	userTechniques: usertechniquespvp,
	userId,
	primaryEmbed,
	rows
}) {
	console.debug(`Executing special technique: ${techniqueName}`)
	const techniquesUsed = usertechniquespvp.get(userId) || []
	techniquesUsed.push(techniqueName)
	usertechniquespvp.set(userId, techniquesUsed)

	const playerGradeData = await getUserGrade(collectedInteraction.user.id)
	const playerGradeString = playerGradeData

	let damage = 0
	let imageUrl = ""
	let description = ""
	const fieldValue = techniqueName

	switch (techniqueName) {
		case "Ten Shadows Technique: Divergent Sila Divine General Mahoraga":
			imageUrl = "https://media1.tenor.com/m/SSY_DQmpNykAAAAC/gojo-vs-sukuna-satoru-gojo.gif"
			description = "You summon the Divergent Sila Divine General Mahoraga!"
			damage = calculateDamage(playerGradeString, userId, true) * 30
			break
		case "Ten Shadows Technique: Divine Dogs":
			imageUrl = "https://media1.tenor.com/m/SSY_DQmpNykAAAAC/gojo-vs-sukuna-satoru-gojo.gif"
			description = "You unleash the power of the Divine Dogs!"
			damage = calculateDamage(playerGradeString, userId, true) * 20
			break
		case "Ten Shadows Technique: Nue":
			imageUrl = "https://media1.tenor.com/m/-I0E2FViCOsAAAAC/gojo-satoru.gif"
			description = "You summon the Nue, a powerful shikigami!"
			damage = calculateDamage(playerGradeString, userId, true) * 15
			break
		case "Atomic":
			imageUrl = "https://media1.tenor.com/m/Y5S-OJqsydUAAAAd/test.gif"
			description = "I...AM....ATOMIC"
			damage = calculateDamage(playerGradeString, userId, true) * 40
			break
		case "Fist of the Cursed":
			imageUrl = "https://media1.tenor.com/m/Hx77RI9lzY4AAAAC/hollow-nuke-hollow-purple.gif"
			description = "I'll put everything into this one!"
			damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier * 1.8
			break
		case "Hollow: Nuke":
			imageUrl = "https://media1.tenor.com/m/Hx77RI9lzY4AAAAC/hollow-nuke-hollow-purple.gif"
			description = "Oh? You didn't think I'd go this far?"
			damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier * 2.5
			break
		case "Imaginary Technique: White":
			imageUrl = "https://media1.tenor.com/m/jG4ODQWzWG0AAAAC/jidion-guy-milk-in-car.gif"
			description = "Guys.."
			damage = calculateDamage(playerGradeString, userId, true) * 18
			break
		case "Wonder Of U":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/ezgif-3-35ad74a53c.gif"
			description = "Wonder of U: I am the calamity."
			damage = calculateDamage(playerGradeString, userId, true) * 18
			break
		case "Nah I'd Lose":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/maxresdefault.jpg"
			description = "Don't worry, I'll lose."
			damage = calculateDamage(playerGradeString, userId, true) * 40
			break
		case "Hollow Purple":
			imageUrl = "https://media1.tenor.com/m/ZdRh7cZgkGIAAAAC/hollow-purple.gif"
			description = "I guess I can play a little rough."
			damage = calculateDamage(playerGradeString, userId, true) * 10
			break
		case "Star Rage: Virtual Mass":
			imageUrl = "https://staticg.sportskeeda.com/editor/2023/12/73a1e-17035028644330-1920.jpg"
			description = "That's my technique! It's mass <3"
			damage = calculateDamage(playerGradeString, userId, true) * 12
			break
		case "Disaster Curses: Full Flux":
			imageUrl = "https://media1.tenor.com/m/QHLZohdZiXsAAAAd/geto-suguru.gif"
			description = "Open the gate between the worlds... Lend me your power. Disaster Curses: Full Flux."
			damage = calculateDamage(playerGradeString, userId, true) * 12
			break
		case "Lapse Blue X Red: Combo":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/ezgif-7-99cec3f18d.gif"
			description = "I'll have to finish this quickly.."
			damage = calculateDamage(playerGradeString, userId, true) * 16
			break
		case "Close-up Reversal Red":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/6fcda5f38ec5cd37e6d16e4428ce927f.jpg"
			description = "I'm down here now."
			damage = calculateDamage(playerGradeString, userId, true) * 14
			break
		case "World Cutting Slash":
			imageUrl = "https://media1.tenor.com/m/MXakTMh3R60AAAAC/sukuna-vs-maho-sukuna-slice.gif"
			description = "Begone."
			damage = calculateDamage(playerGradeString, userId, true) * 16
			break

		case "Vengance Blade: Executioners Blade":
			imageUrl = "https://media1.tenor.com/m/wmZxEiKZRXgAAAAd/yuta-cursed-energy.gif"
			description = "I don't like people who hurt my friends..."
			damage = calculateDamage(playerGradeString, userId, true) * 8
			break

		case "Maximum Technique: Blue":
			imageUrl = "https://media1.tenor.com/m/LXmbPm21NagAAAAC/gojo-starou-satoru-gojo.gif"
			description = "Cursed Technique Lapse, Maximum Output.. BLUE!"
			damage = calculateDamage(playerGradeString, userId, true) * 8
			break

		case "Maximum Technique: Red":
			imageUrl = "https://media1.tenor.com/m/iyzTuWFxU2cAAAAd/gojo-gojo-satoru.gif"
			description = "Reversal.. Red"
			damage = calculateDamage(playerGradeString, userId, true) * 7
			break

		case "Maximum Technique: Purple":
			imageUrl = "https://media1.tenor.com/m/uxzlDwND2RkAAAAd/roxo-hollow-purple.gif"
			description = "Hidden technique, Awoken through the power of the Six Eyes. Maximum Technique: Purple."
			damage = calculateDamage(playerGradeString, userId, true) * 9
			break

		case "Hollow Purple: Nuke":
			imageUrl = "https://media1.tenor.com/m/Hx77RI9lzY4AAAAC/hollow-nuke-hollow-purple.gif"
			description = "Polarized Light.. Crow "
			damage = calculateDamage(playerGradeString, userId, true) * 8
			break

		case "Prayer Song":
			imageUrl =
				"https://cdn.discordapp.com/attachments/1094302755960664255/1225688422551785544/image.png?ex=66220a4c&is=660f954c&hm=df32c017b95d2a118b22ff2999990e6ab413e14acbe354b059bee5ced017db16&"
			description = "**You synchronize with your opponent's movements... it's absolutely chilling.**"
			damage = calculateDamage(playerGradeString, userId, true) * 6
			break

		case "Re-imagined BLACK FLASH":
			imageUrl =
				"https://storage.googleapis.com/jjk_bot_personal/yuji-lands-black-flash-on-sukuna-jujutsu-kaisen-jjk-256%20%5BMConverter.eu%5D.png"
			description = "KOKU..SEN!"
			damage = calculateDamage(playerGradeString, userId, true) * 10
			break

		case "Piercing Blood":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/Yuji_using_Piercing_Blood.png"
			description = "Wow you're really strong.. I'm gonna have to go all out."
			damage = calculateDamage(playerGradeString, userId, true) * 8
			break

		case "Maximum: METEOR":
			imageUrl = "https://media1.tenor.com/m/pNvg0g4K4VMAAAAd/sukuna-skate-sukuna-skating.gif"
			description = "ILL BURN YOU TO A CRISP"
			damage = calculateDamage(playerGradeString, userId, true) * 1
			break

		case "Solo Forbidden Area":
			imageUrl =
				"https://64.media.tumblr.com/bf4c7320f2fcc0743c911ea174a3a7f2/8b2aaf7d220d5701-c0/s1280x1920/57858721add8c560100397b818093bc8a45d85da.jpg"
			description = "A forbidden technique that can only be used by a single person. Solo Forbidden Area."
			damage = calculateDamage(playerGradeString, userId, true) * 15
			break

		case "Zenin Style: Playful Cloud: STRIKE":
			imageUrl = "https://media1.tenor.com/m/BufoLoGxC9sAAAAd/toji-dagon.gif"
			description = "PERISH"
			damage = calculateDamage(playerGradeString, userId, true) * 3
			break

		case "Flame Arrow":
			imageUrl =
				"https://cdn.discordapp.com/attachments/1186763190835613748/1226088236397629562/ezgif-2-b2f2996757.gif?ex=66237ea7&is=661109a7&hm=e7eeb0b3305213ae20f0fee49b77dbfc873ca875e61dbd22e629543b33f2c0bf&"
			description =
				"Fuga.. Don't worry. I won't do anything petty like revealing my technique.. Now.. Arm yourself. "
			damage = calculateDamage(playerGradeString, userId, true) * 2
			break

		case "Jackpot: Strike":
			imageUrl = "https://media1.tenor.com/m/Pi5w2UFZWO0AAAAC/hakari-kinji-kinji-hakari.gif"
			description = "TURN UP THE VOLUME"
			damage = calculateDamage(playerGradeString, userId, true) * 1
			break

		case "Six Point Palm":
			imageUrl = "https://media1.tenor.com/m/gTzL4bykSakAAAAC/jujutsu-kaisen0-battle.gif"
			description =
				"You're six eyes begin to glow.. You're not sure what's happening.. **Unleashed Technique: Six Point Palm**"
			damage = calculateDamage(playerGradeString, userId, true) * 35

			break

		case "Divergent Fist":
			imageUrl = "https://media1.tenor.com/m/bmrdIgprUAQAAAAC/itadori-yuji-jujutsu-kaisen.gif"
			description = "I'm gonna hit you with everything I've got!"
			damage = calculateDamage(playerGradeString, userId, true) * 1
			break

		case "Imaginary Technique: Purple":
			imageUrl = "https://media1.tenor.com/m/whbTruPpfgkAAAAC/imaginary-technique-imaginary-technique-purple.gif"
			description =
				"Sorry, Amanai I'm not even angry over you right now. I bear no grudge against anyone. But the world is just so peaceful.\n **Throughout heaven and earth, I alone am the honored one.**"
			damage = calculateDamage(playerGradeString, userId, true) * 2
			break

		case "Disaster Flames: Full Fire Formation":
			imageUrl = "https://media1.tenor.com/m/XaWgrCmuguAAAAAC/jjk-jujutsu-kaisen.gif"
			description =
				"Heh, You're strong but you're not the only one who can use cursed energy. **Disaster Flames: Full Fire Formation**"
			damage = calculateDamage(playerGradeString, userId, true) * 1.5
			break

		case "The Shoko":
			imageUrl = "https://media1.tenor.com/m/2sYS0uQV8IIAAAAd/jujutsu-kaisen-jujutsu-kaisen-fade.gif"
			description = "Please the:"
			damage = calculateDamage(playerGradeString, userId, true) * 14
			break

		case "MAXIMUM: BLACK FLASH":
			imageUrl = "https://media1.tenor.com/m/FILnhw_rozUAAAAC/black-flash-jujutsu-kaisen.gif"
			description = "**KOKU...SEN!**"
			damage = calculateDamage(playerGradeString, userId, true) * 3
			break

		case "Pure Love: Unleashed Fury":
			imageUrl = "https://media1.tenor.com/m/ZGlpNTqs6xcAAAAd/jjk0-yuta.gif"
			description = "**How Rude It's pure love.**"
			damage = calculateDamage(playerGradeString, userId, true) * 2.5
			break

		case "Private Pure Love Train: Jackpot":
			imageUrl = "https://media1.tenor.com/m/qz4d7FBNft4AAAAC/hakari-hakari-kinji.gif"
			description = "You gamble... AND FORTUNE FAVORS THE BOLD! You deal double damage!"
			damage = calculateDamage(playerGradeString, userId, true) * 2
			break

		case "Essence of the Soul: KOKUSEN":
			imageUrl = "https://media1.tenor.com/m/0EERvw7z2aEAAAAC/jjk-jjk-s2.gif"
			description = "AHHH I TRULY AM.. A CURSED SPIRIT!"
			damage = calculateDamage(playerGradeString, userId, true) * 14
			break

		case "Transfiguration: Soul Touch":
			imageUrl = "https://media1.tenor.com/m/vuHtrhYou2MAAAAC/nobara-face-jujutsu-kaisen.gif"
			description = "Now you're in for it.."
			damage = calculateDamage(playerGradeString, userId, true) * 12
			break

		case "Transfiguration: Decay":
			imageUrl = "https://media1.tenor.com/m/0ksR58u2OS4AAAAC/nanami-mahito-transfiguration-soul-touch.gif"
			description = "I'm going to decay you.."
			damage = calculateDamage(playerGradeString, userId, true) * 9
			break

		case "Copy: Cleave":
			imageUrl = "https://static1.srcdn.com/wordpress/wp-content/uploads/2024/02/image0-15.jpeg"
			description = "Copy: Cleave...."
			damage = calculateDamage(playerGradeString, userId, true) * 19
			break

		case "Copy: Cursed Speech: Die":
			imageUrl = "https://media1.tenor.com/m/07LI2_CcWlsAAAAC/jujutsu-kaisen-mang%C3%A1-jujutsu-mang%C3%A1.gif"
			description = "DIE.."
			damage = calculateDamage(playerGradeString, userId, true) * 18
			break

		case "Close Quarters 2-4 Combo":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/jujutsu-kaisen-maki-zenin.gif"
			description = "You're not getting away that easily.."
			damage = calculateDamage(playerGradeString, userId, true) * 7
			break

		case "Playful Cloud: Upright Spear":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/anime.gif"
			description = "Playful Cloud: Upright Spear!"
			damage = calculateDamage(playerGradeString, userId, true) * 5.5
			break

		case "Bo Staff: Redirection":
			imageUrl = "https://media1.tenor.com/m/Bjc7LYqdUGcAAAAC/maki-maki-zenin.gif"
			description = "Bo Staff: Redirection.."
			damage = calculateDamage(playerGradeString, userId, true) * 4
			break

		case "Split Soul: Blitz":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/Maki_stabs_Naoya_from_behind.png"
			description = "Didn't even notice me.."
			damage = calculateDamage(playerGradeString, userId, true) * 14.5
			break

		case "0.2 Second Strike":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/ezgif-4-d1e7fb00df.gif"
			description = "Behind you.."
			damage = calculateDamage(playerGradeString, userId, true) * 10.5
			break

		case "Jogo's Testicle Torsion Technique":
			imageUrl =
				"https://media1.tenor.com/m/xS-ZEkkyhjgAAAAC/nah-i%27d-win-%E5%91%AA%E8%A1%93%E5%BB%BB%E6%88%A6.gif"
			description = "I'm going to twist your balls off.."
			damage = calculateDamage(playerGradeString, userId, true) * 15
			break

		case "Face Smash":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/Maki_Zenin_vs._The_Kukuru_Unit.png"
			description = "your quite ugly.."
			damage = calculateDamage(playerGradeString, userId, true) * 7.5
			break

		case "Inverted Spear Of Heaven: Severed Universe":
			imageUrl = "https://media1.tenor.com/m/707D3IG5x2wAAAAC/isoh-inverted-spear.gif"
			description = "ISOH: Severed Universe.."
			damage = calculateDamage(playerGradeString, userId, true) * 8.5
			break

		case "Batter":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/jjk-jujutsu-kaisen.gif"
			description = "hehe slap slap slap"
			damage = calculateDamage(playerGradeString, userId, true) * 5.5
			break

		case "Mythical Beast Amber":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/Mythical_Beast_Amber(1).png"
			description = "I'm not going to let you get away with this.."
			damage = calculateDamage(playerGradeString, userId, true) * 12
			break

		case "Lightning Discharge":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/Kashimo_sends_electricity_at_Hakari.png"
			description = "I'm going to fry you to a crisp.."
			damage = calculateDamage(playerGradeString, userId, true) * 8
			break

		case "Divine Flames":
			damageMultiplier = 7
			imageUrl =
				"https://storage.googleapis.com/jjk_bot_personal/sukuna-holding-out-his-arm-in-front-of-him-engulfed-with-flames-as-he-uses-his-fire-technique-in-jujutsu-kaisen%20%5BMConverter.eu%5D.png"
			description = "I'll burn you to a crisp.."

			damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier
			break

		case "Pure Dismantle":
			damageMultiplier = 7
			imageUrl = "https://media1.tenor.com/m/4cSNEQWHARAAAAAC/cleave-dismantle.gif"
			description = "shing shing.."

			damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier
			break

		case "Fire Extinguisher":
			imageUrl =
				"https://storage.googleapis.com/jjk_bot_personal/who-winning-this-clash-of-techniques-v0-r97dr3o8a5kb1.png"
			description = "You throw a fire extinguisher at the opponent...? "
			damage = calculateDamage(playerGradeString, userId, true) * 6
			break

		case "Split Second Slice":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/toji-toji-fushiguro.gif"
			description = "You can't dodge this one.."
			damage = calculateDamage(playerGradeString, userId, true) * 4
			break

		case "Playful Cloud: Rushing Resolute":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/toji-fushiguro-shibuya-arc-60fps.gif"
			description = "Who do you think you are?"
			damage = calculateDamage(playerGradeString, userId, true) * 17
			break

		case "Bloodlusted: Skull Crush":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/ezgif-4-14fc7970f5.gif"
			description = "I'm going to crush your skull.."
			damage = calculateDamage(playerGradeString, userId, true) * 13
			break

		case "Split Slap":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/megumi-fushiguro-fushiguro-megumi.gif"
			description = "Stay down!"
			damage = calculateDamage(playerGradeString, userId, true) * 10
			break

		case "Supernova":
			imageUrl = "https://media1.tenor.com/m/CAwOZLfy354AAAAC/jujutsu-kaisen-mang%C3%A1-jujutsu-mang%C3%A1.gif"
			description = "Stay down!"
			damage = calculateDamage(playerGradeString, userId, true) * 4
			break

		case "Jackpot: Cargo Fever Rush":
			imageUrl =
				"https://cdn.discordapp.com/attachments/1232829104378871839/1239800650187931708/ezgif-2-1a5fda8aad.png?ex=66443dd5&is=6642ec55&hm=11b8e9103190532406894213ca6bce3d91f34a5b6815059a59f9661d0f46178e&"
			description = "Gambling is my life.."
			damage = calculateDamage(playerGradeString, userId, true) * 16
			break

		case "Jackpot: Full House Kick":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/ezgif-3-03d1d5eb78.png"
			description = "Gambling i love it.."
			damage = calculateDamage(playerGradeString, userId, true) * 14
			break

		case "Jackpot: Shutter Doors":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/ezgif-3-6b5c52f9c2.png"
			description = "Gambling really is my life.."
			damage = calculateDamage(playerGradeString, userId, true) * 12
			break

		case "Tusk: Lesson Five..":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/ezgif-5-99dcb0b244.gif"
			description = "Arigato.. Gyro."
			damage = calculateDamage(playerGradeString, userId, true) * 12
			break

		case "D4C: Love Train":
			imageUrl = "https://media1.tenor.com/m/DsrNAu39v5sAAAAC/d4c-erixander.gif"
			description = "I'm going to have to use my ultimate technique.."
			damage = calculateDamage(playerGradeString, userId, true) * 12
			break

		case "Maximum Muscle: Purple":
			imageUrl = "https://storage.googleapis.com/jjk_bot_personal/ezgif-5-3fce776712.gif"
			description = "You know who else is the honored one? Me.."
			damage = calculateDamage(playerGradeString, userId, true) * 12
			break

		default:
			damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier
			break
	}

	console.debug(`Setting image: ${imageUrl}`)

	primaryEmbed.setImage(imageUrl)
	primaryEmbed.setDescription(description)
	primaryEmbed.setFields({ name: "Player Technique", value: fieldValue })

	return { damage, imageUrl, description }
}

export function generateHealthBar(current, max) {
	const totalBars = 10
	const filledBars = Math.round((current / max) * totalBars)
	const emptyBars = totalBars - filledBars
	return "▮".repeat(filledBars) + "▯".repeat(emptyBars)
}

export async function exportTheHonoredOne(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()

	if (random < 0.4) {
		const fakeDeathEmbed = new EmbedBuilder()
			.setTitle("You won!")
			.setColor("#0099ff")
			.setTitle("Battle Rewards")
			.addFields(
				{ name: "Loot Drop", value: "You've also found a..." },
				{ name: "Experience Gained", value: "You've gained ^$&\"!*$ XP for defeating the boss!" },
				{ name: "Coins Gained", value: "You've gained 00000 Coins for defeating the boss!" },
				{ name: "*%$£!!£", value: "Something seems off.." }
			)
		await interaction.editReply({ embeds: [fakeDeathEmbed], components: [] })

		await new Promise(resolve => setTimeout(resolve, 4000))

		const reawakeningEmbed = new EmbedBuilder()
			.setDescription("Yo... It's been awhile.")
			.addFields({
				name: "FOR REAL REAL IM STILL ALIVE AND KICKING!",
				value: "YOUR GOING TO LOSE BECAUSE YOU DIDNT USE THAT CURSE TOOL TO FINISH ME OFF"
			})
			.setImage("https://media1.tenor.com/m/c67XWC0HaEwAAAAC/gojo-toji.gif")
			.setColor("#00FF00")

		await interaction.editReply({ embeds: [reawakeningEmbed], components: [] })

		await new Promise(resolve => setTimeout(resolve, 3000))

		randomOpponent.name = "The Honored One"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = await getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, usermaxhealth)

		primaryEmbed
			.setDescription("Gojo Satoru has reawakened as The Honored One!")
			.setImage("https://media1.tenor.com/m/TQWrKGuC9GsAAAAC/gojo-satoru-the-honored-one.gif")
			.setFields(
				{ name: "Boss Health", value: randomOpponent.current_health.toString() },
				{ name: "Player Health", value: playerHealth.toString() }
			)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

// Return false to indicate no transformation occurred

export async function exportTheCursedOne(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.9) {
		randomOpponent.name = "Sukuna (Heian Era Enraged)"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription("Cocky brat, This fight's far from over.. **SUKUNA BECOMES ENRAGED..**")
		primaryEmbed.setImage("https://media1.tenor.com/m/FSuRhPgRMMoAAAAd/sukuna-hein-era.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}
export async function exportGambler(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.7) {
		randomOpponent.name = "Hakari (Jackpot)"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription("Hakari has entered jackpot mode!")
		primaryEmbed.setImage("https://media1.tenor.com/m/Rpk3q-OLFeYAAAAC/hakari-dance-hakari.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

// Return false to indicate no transformation occurred

export async function exportTheFraud(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.4) {
		randomOpponent.name = "Sukuna (Suppressed)"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(
			"Hmph, pathetic brat. Look at the state you've gotten yourself into, **SUKUNA HAS TAKEN OVER YUJI ITADORI'S BODY AND IS NOW IN CONTROL! DEFEAT HIM BEFORE HE FULLY TAKES OVER**"
		)
		primaryEmbed.setImage(
			"https://cdn.discordapp.com/attachments/1186763190835613748/1226436754970640405/ezgif-5-83a420d6b1.gif?ex=6624c33c&is=66124e3c&hm=8f8b3de15fabf874eada713edce48052e0579fd414dee8398c65b0bf20802cc3&"
		)
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}
export async function exportReincarnation(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.5) {
		randomOpponent.name = "Zenin Toji (Reincarnated)"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(
			"Those who inherited the curse of the Zen'in family… The one who couldn't fully leave behind that curse… They would all bear witness to the bare flesh of the one who is free… To the one.. Who stands before you with this curse."
		)
		primaryEmbed.setImage("https://media1.tenor.com/m/DrFCvWACEmgAAAAC/toji-toji-fushiguro.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}
export async function exportRika(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.7) {
		const unlockedTransformations = await getUserUnlockedTransformations(interaction.user.id)

		if (!unlockedTransformations.includes("Curse Queen")) {
			await updateUserUnlockedTransformations(interaction.user.id, ["Curse Queen"])

			primaryEmbed.setImage("https://i.ytimg.com/vi/dwdsYVRpocc/maxresdefault.jpg")
			primaryEmbed.setDescription(
				`${interaction.user.username} You're pretty strong... I'll lend you some of my power. Unlocked the **Curse Queen** transformation!`
			)
			await interaction.editReply({ embeds: [primaryEmbed] })
			return true
		} else {
			randomOpponent.name = "Yuta Okkotsu (Rika)"
			randomOpponent.current_health = randomOpponent.max_healt
			const userMaxHealth = await getUserMaxHealth(interaction.user.id)
			await updateUserHealth(interaction.user.id, userMaxHealth)

			primaryEmbed.setImage("https://media1.tenor.com/m/BhgnUENmzrkAAAAC/jujutsu-kaisen0-yuta-okkotsu.gif")
			primaryEmbed.setDescription("Rika.. Lend me your strength. **CURSE QUEEN RIKA HAS JOINED THE BATTLE!**")
			primaryEmbed.setFields(
				{ name: "Boss Health", value: randomOpponent.current_health.toString() },
				{ name: "Player Health", value: playerHealth.toString() }
			)

			await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

			return true
		}
	}

	return false
}

export async function exportCrashOut(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.4) {
		randomOpponent.name = "Mahoraga"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(`Hey ${interaction.user.username}.. I'll be dying first. Give it your best shot...`)
		primaryEmbed.setImage("https://media1.tenor.com/m/mC0Tc7Xm7iUAAAAC/megumi-megumifushiguro.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

export async function exportSukuna2(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.3) {
		randomOpponent.name = "Sukuna Full Power"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(
			`HAHHAHAHAHAHAHAHAHAHAHAH YOU CAN SEE IT ${interaction.user.username}! YOU CAN SEE MY CURSED TECHNIQUE!`
		)
		primaryEmbed.setImage("https://media1.tenor.com/m/I1g7hhwKGbkAAAAd/sukuna-ryomen.gif")
		primaryEmbed.setFields(
			{ name: "SUKUNA HAS ENTERED STAGE TWO!", value: "" },
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}
export async function exportMahito(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.3) {
		randomOpponent.name = "Mahito Instant Spirit Body of Distorted Killing"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription("Ahhh the nature of the soul TRULY FASCINATING!")
		primaryEmbed.setImage("https://media1.tenor.com/m/1tna9DzZLccAAAAd/jjk-jujutsu-kaisen.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

export async function export120(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.9) {
		randomOpponent.name = "Mahito (120%)"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(
			`BROTHER! This cursed spirit successfully used Black Flash, now the person whos' left behind is me. You have become stronger, ${interaction.user.username} Are you willing to maintain the status quo, AOI TODO? ARE YOU GOING TO LEAVE ${interaction.user.username} ALONE AGAIN, AOI TODO? **KOKUSEN!**`
		)
		primaryEmbed.setImage("https://media1.tenor.com/m/Y1BZYqq9NVoAAAAd/todo-black-flash-jujutsu-kaisen.gif")
		primaryEmbed.setFields({ name: "Boss Health", value: "???" }, { name: "Player Health", value: "???" })
		//
		await interaction.editReply({ embeds: [primaryEmbed], components: [] })

		await new Promise(resolve => setTimeout(resolve, 4000))

		primaryEmbed.setDescription("However, from now on, all three of them... have reached 120% of their potential.")
		primaryEmbed.setImage("https://media1.tenor.com/m/oydgFq051r8AAAAC/todo-itadori.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

export async function handlePlayerRevival(interaction, primaryEmbed, row, randomOpponent, playerHealth) {
	const userMaxHealth = await getUserMaxHealth(interaction.user.id)
	//
	await updateUserHealth(interaction.user.id, userMaxHealth)
	//
	randomOpponent.name = "Mahito"
	randomOpponent.current_health = randomOpponent.max_health

	primaryEmbed.setDescription(
		"My power reveals a fascinating truth... the shape of the soul, the essence of a curse. Perhaps I embody it all!"
	)
	primaryEmbed.setImage("https://media1.tenor.com/m/z3Itmn4rSLUAAAAd/jujutsu-kaisen-shibuya-arc-mahito.gif")

	primaryEmbed.setFields(
		{
			name: "Enemys Technique",
			value: "Mahito (Transfigured) dealt **?$!~@:!12** damage to you with Black FLASH!"
		},
		{ name: "Player Health", value: "????????" }
	)

	await interaction.editReply({
		embeds: [primaryEmbed]
	})

	await new Promise(resolve => setTimeout(resolve, 5000))

	primaryEmbed.setDescription(
		"The sound of the Gion Shoja bells... echoes the impermanence of all things. The color of the sala flowers...reveals the truth the prosperous must decline. But, we are the exceptions. \n\n**Get up, brother! Our battle is just beginning!**"
	)
	primaryEmbed.setImage("https://media1.tenor.com/m/pZsZJOyat-AAAAAC/todo-jjk.gif")

	primaryEmbed.setFields(
		{ name: "AOI TODO JOINS THE FIGHT", value: `Let's do this, ${interaction.user.username}` },
		{ name: "Boss Health", value: randomOpponent.current_health.toString() },
		{ name: "Player Health", value: playerHealth.toString() }
	)

	await interaction.editReply({
		embeds: [primaryEmbed],
		components: row ? [row] : []
	})
}

export async function handleJoyBoyDeath(interaction, primaryEmbed, row, randomOpponent, playerHealth) {
	const userMaxHealth = await getUserMaxHealth(interaction.user.id)
	//
	await updateUserHealth(interaction.user.id, userMaxHealth) // Reset player health to max
	//

	primaryEmbed.setDescription(`This fight is far from over, ${randomOpponent.name}..`)
	primaryEmbed.setImage("https://media1.tenor.com/m/Q9E7kfKz9CsAAAAd/ultra-instinct-ultra-instinct-goku.gif")

	await interaction.editReply({
		embeds: [primaryEmbed],
		components: [row]
	})
}

const gifs = [
	"https://media1.tenor.com/m/O7x4NwNSGx0AAAAC/jjk.gif",
	"https://media1.tenor.com/m/hQd_-MwNT5AAAAAd/jjk-jujutsu-kaisen.gif",
	"https://media1.tenor.com/m/BgnNBMz5pFAAAAAC/jujutsu-kaisen-shibuya-arc-itadori-shibuya-arc.gif"
]

const buttonLabels = ["Black.. FLASH!", "KOKU...SEN", "CONSECUTIVE BLACK FLASH!"]

const descriptions = [
	"Harness cursed energy for a devastating Black Flash!",
	"Amplify your attack, feel the surge of cursed energy!",
	"Execute the perfect Black Flash, overwhelming your foe!"
]

export async function executeBlackFlash({
	imageUrl,
	description,
	fieldValue,
	collectedInteraction,
	techniqueName,
	damageMultiplier,
	userTechniques,
	userId,
	primaryEmbed
}) {
	const techniquesUsed = userTechniques.get(userId) || []
	if (techniquesUsed.includes(techniqueName)) {
		await collectedInteraction.followUp({
			content: "You have already used Black Flash in this session.",
			ephemeral: true
		})
		return
	}

	techniquesUsed.push(techniqueName)
	userTechniques.set(userId, techniquesUsed)

	const playerGradeData = await getUserGrade(collectedInteraction.user.id)
	const playerGradeString = playerGradeData

	let attempts = 0
	const maxAttempts = 3
	let damage = 0

	async function attemptBlackFlash() {
		primaryEmbed.setImage(gifs[attempts % gifs.length])
		primaryEmbed.setDescription(descriptions[attempts % descriptions.length])
		primaryEmbed.setFields([{ name: techniqueName, value: `Attempt ${attempts + 1} of ${maxAttempts}` }])

		const button = new ButtonBuilder()
			.setCustomId(`again-${attempts}`)
			.setLabel(buttonLabels[attempts % buttonLabels.length])
			.setStyle(ButtonStyle.Primary)

		const row = new ActionRowBuilder().addComponents(button)

		await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

		const filter = i => i.customId === `again-${attempts}` && i.user.id === collectedInteraction.user.id
		try {
			const response = await collectedInteraction.channel.awaitMessageComponent({
				filter,
				componentType: ComponentType.Button,
				time: 5000
			})

			await response.deferUpdate()

			attempts++
			if (attempts < maxAttempts) {
				await attemptBlackFlash()
			} else {
				damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier
				await finishBlackFlash()
			}
		} catch (error) {
			damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier
			await finishBlackFlash()
		}
	}

	async function finishBlackFlash() {
		primaryEmbed.setDescription(`${techniqueName} completed. Total damage: ${damage}`)
		await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
	}

	await attemptBlackFlash()

	return damage
}

export function generateBloodlustBar(currentBloodlust) {
	const bloodlustBarLength = 20
	const maxBloodlust = 50
	const filledLength = Math.round((currentBloodlust / maxBloodlust) * bloodlustBarLength)
	const emptyLength = bloodlustBarLength - filledLength

	const filledBar = "🟥".repeat(filledLength)
	const emptyBar = "⬛".repeat(emptyLength)

	return `${filledBar}${emptyBar} (${currentBloodlust}/100)`
}

export async function updateFeverMeter(collectedInteraction, userState, primaryEmbed) {
	userState.feverMeter += 50

	if (userState.feverMeter >= 100 && !userState.isJackpotMode) {
		userState.feverMeter = 100
		userState.isJackpotMode = true

		const jackpotImageUrl =
			"https://cdn.discordapp.com/attachments/681985000521990179/1239658835459707032/image.png?ex=6643b9c2&is=66426842&hm=56c1613c73ac8b7e2158e36ed40ddd0b3ed523a4291fc0366c68223158e8ba51&"

		primaryEmbed.setImage(jackpotImageUrl)

		primaryEmbed.addFields({
			name: "MUSIC.. START!",
			value: "JACKPOT MODE ACTIVATED!"
		})

		await collectedInteraction.editReply({ embeds: [primaryEmbed] })

		await new Promise(resolve => setTimeout(resolve, 2000))

		const jackpotModeImageUrl2 = "https://media1.tenor.com/m/Rpk3q-OLFeYAAAAC/hakari-dance-hakari.gif"

		primaryEmbed.setImage(jackpotModeImageUrl2)

		const feverMeterFieldIndex = primaryEmbed.data.fields.findIndex(field => field.name === "Fever Meter")

		if (feverMeterFieldIndex !== -1) {
			primaryEmbed.spliceFields(feverMeterFieldIndex, 1)
		}

		await collectedInteraction.editReply({ embeds: [primaryEmbed] })
	} else if (!userState.isJackpotMode) {
		const updatedFeverMeterBar = createFeverMeterBar(userState.feverMeter, 100)

		const feverMeterFieldIndex = primaryEmbed.data.fields.findIndex(field => field.name === "Fever Meter")

		if (feverMeterFieldIndex !== -1) {
			primaryEmbed.spliceFields(feverMeterFieldIndex, 1, {
				name: "Fever Meter",
				value: updatedFeverMeterBar,
				inline: false
			})
		} else {
			primaryEmbed.addFields({
				name: "Fever Meter",
				value: updatedFeverMeterBar,
				inline: false
			})
		}
	}
}

export async function executeSpecialRaidBossTechnique({
	collectedInteraction,
	techniqueName,
	damageMultiplier,
	imageUrl,
	description,
	fieldValue,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed
}) {
	const techniquesUsed = userTechniquesFight.get(userId) || []
	if (techniquesUsed.includes(techniqueName)) {
		return 0
	}
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)
	const playerGradeData = await getUserGrade(collectedInteraction.user.id)
	const playerGradeString = playerGradeData
	const damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier

	// Update the existing primaryEmbed
	primaryEmbed
		.setImage(imageUrl)
		.setDescription(description)
		.addFields({ name: "Player Technique", value: fieldValue })

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
	await new Promise(resolve => setTimeout(resolve, 3000))
	return damage
}
