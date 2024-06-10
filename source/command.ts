/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
/* eslint-disable prettier/prettier */
let contextKey: string
import { ModalActionRowComponentBuilder, SelectMenuBuilder } from "@discordjs/builders"
import axios from "axios"
import {
	APIEmbed,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	Client,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	Interaction,
	MessageComponentInteraction,
	ModalBuilder,
	SelectMenuInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	TextBasedChannel,
	TextChannel,
	TextInputBuilder,
	TextInputStyle,
	User
} from "discord.js"
import { ClientSession, Collection, ObjectId } from "mongodb"
import ms from "ms"
import {
	DOMAIN_INFORMATION,
	TRANSFORMATIONS,
	attacks,
	executeBossAttack,
	heavenlyrestrictionskills
} from "./attacks.js"
import logger, { createClient, digCooldown, digCooldowns } from "./bot.js"
import {
	calculateDamage,
	calculateEarnings,
	createInventoryPage,
	createStatsEmbed,
	getRandomAmount,
	getRandomLocation,
	handleClanDataEmbed,
	handleEffectEmbed,
	handleShikigamiEmbed
} from "./calculate.js"
import {
	executeSpecialRaidBossTechnique,
	executeSpecialTechnique,
	executeSpecialTechniquePvp,
	export120,
	exportCrashOut,
	exportGambler,
	exportMahito,
	exportReincarnation,
	exportRika,
	exportTheCursedOne,
	exportTheFraud,
	exportTheHonoredOne,
	generateHealthBar,
	handleBossDeath,
	handleJoyBoyDeath,
	handlePlayerRevival,
	handleShikigamiTame,
	updateFeverMeter
} from "./fight.js"
import {
	BossData,
	Giveaway,
	IdleDeathsGambleState,
	buildGamblersProfile,
	formatDomainExpansion,
	gradeMappings
} from "./interface.js"
import {
	CLAN_SKILLS,
	DOMAIN_EXPANSIONS,
	INVENTORY_CLAN,
	MiniGameResult,
	allAchievements,
	benefactors,
	consumeables,
	craftingRecipes,
	dailyitems,
	itemEffects,
	items,
	items1,
	jobs,
	lookupItems,
	playCurseHunterMinigame,
	playJujutsuSorcererMinigame,
	playStudentMinigame,
	playVeilCasterMinigame,
	questsArray
} from "./items jobs.js"
import { getRandomItem } from "./items.js"
import { postCommandMiddleware } from "./middleware.js"
import {
	UserSettings,
	UserShikigami,
	addItemToUserInventory,
	addUser,
	addUserPurchases,
	addUserQuest,
	addUserTechnique,
	checkForNewAlerts,
	checkStageMessaged,
	checkUserHasHeavenlyRestriction,
	checkWorkCooldown,
	cleanShikigami,
	client,
	createAlert,
	createGiveaway,
	createRaidParty,
	createTradeRequest,
	createUserTutorialState,
	feedShikigami,
	getActiveTrades,
	getAllShopItems,
	getAllUserExperience,
	getAllUsersBalance,
	getBalance,
	getBlacklistedUsers,
	getBosses,
	getCurrentCommunityQuest,
	getCurrentRaidBoss,
	getMonthlyFightsWonLeaderboard,
	getNextAwakeningStage,
	getPreviousTrades,
	getRaidBossDetails,
	getRaidPartyById,
	getShikigami,
	getShopLastReset,
	getUserAchievements,
	getUserActiveDefenseTechnique,
	getUserActiveHeavenlyTechniques,
	getUserActiveTechniques,
	getUserAwakening,
	getUserClanDetails,
	getUserDailyData,
	getUserDomain,
	getUserFavouriteCommand,
	getUserGambleInfo,
	getUserGrade,
	getUserHealth,
	getUserHeavenlyTechniques,
	getUserHonours,
	getUserInventory,
	getUserItemEffects,
	getUserMaxHealth,
	getUserMentor,
	getUserOwnedInateClan,
	getUserProfile,
	getUserProfileHeader,
	getUserProfileImage,
	getUserPurchases,
	getUserQuests,
	getUserRegisteredDate,
	getUserReverseCursedTechniqueStats,
	getUserSettings,
	getUserShikigami,
	getUserStats,
	getUserStatusEffects,
	getUserTechniques,
	getUserTransformation,
	getUserTutorialState,
	getUserUnlockedBosses,
	getUserUnlockedTitles,
	getUserUnlockedTransformations,
	getUserWorked,
	giveawayCollectionName,
	handleRaidBossDefeat,
	handleTradeAcceptance,
	healShikigami,
	isUserRegistered,
	markStageAsMessaged,
	mongoDatabase,
	removeAllStatusEffects,
	removeItemFromUserInventory,
	removeRaidPartyPendingActions,
	removeUserQuest,
	setUserTutorialMessageId,
	setUserTutorialState,
	startNewSession,
	updateBalance,
	updateGamblersData,
	updatePlayerGrade,
	updateRaidBossCurrentHealth,
	updateRaidParty,
	updateRaidPartyPendingActions,
	updateUserAchievements,
	updateUserActiveHeavenlyTechniques,
	updateUserActiveTechniques,
	updateUserCommandsUsed,
	updateUserCooldowns,
	updateUserDailyData,
	updateUserDomainExpansion,
	updateUserExperience,
	updateUserFavoriteCommand,
	updateUserFavouriteTechnique,
	updateUserGambleInfo,
	updateUserHealth,
	updateUserHeavenlyTechniques,
	updateUserHonours,
	updateUserInateClan,
	updateUserJob,
	updateUserMentor,
	updateUserReverseCursedTechniqueExperience,
	updateUserReverseCursedTechniqueStats,
	updateUserSettings,
	updateUserShikigami,
	updateUserTitle,
	updateUserTransformation,
	updateUserUnlockedTitles,
	updateUserUnlockedTransformations,
	updateUserWorked,
	userExists,
	viewTradeRequests
} from "./mongodb.js"
import {
	applyBossDamage,
	dualTechniqueCombinations,
	executeDualTechnique1,
	executeSquadTechnique,
	squadTechniqueCombinations
} from "./raids.js"
import {
	activeShikigami,
	createShikigamiEmbed,
	executeDivineDogsTechnique,
	executeMahoraga,
	executeNue,
	getRandomQuote,
	getShikigamiEmoji,
	handleDivineDogsDamage,
	handleMahoragaAttack,
	shikigamiItems2,
	startPlayingMinigame,
	updateShikigamiField
} from "./shikigami.js"
import {
	applyPrayerSongEffect,
	applyStatusEffect,
	applyVirtualMass,
	calculateDamageWithEffects,
	fetchAndFormatStatusEffects
} from "./statuseffects.js"
import {
	createFeverMeterBar,
	createRaidEmbed,
	createTechniqueSelectMenu,
	getAwakeningDialogue,
	getEmojiForClan,
	getMentorDetails,
	getYujiItadoriEventLine,
	getYujiItadoriImageUrl,
	getYujiItadoriLine,
	handleRaidEnd,
	hasRequiredClanDetails,
	jjkbotdevqutoes,
	mentorDetails,
	rareChance
} from "./utils.js"

const domainActivationState = new Map()
const transformationState = new Map()
const bossHealthMap = new Map()
const rctState = new Map()

export const searchCooldowns = new Map()
export const searchCooldown = 60 * 1000
export const searchCooldownBypassIDs = [""]
const activeDomainExpansions = new Map()

const idleDeathsGambleStates = new Map<string, IdleDeathsGambleState>()

const client1 = createClient()
//

export async function handleRegisterCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	try {
		const discordId = interaction.user.id
		const blacklistedUser = (await getBlacklistedUsers()).find(user => user.userId === discordId)

		if (blacklistedUser) {
			const { startDate, endDate, reason } = blacklistedUser
			const currentDate = new Date()
			logger.warn("Blacklisted user tried to register:", blacklistedUser)

			if (currentDate >= startDate && currentDate <= endDate) {
				const appealEmbed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("Blacklist Notice")
					.setDescription(`You have been blacklisted from registering for the following reason: ${reason}`)
					.setImage("https://storage.googleapis.com/jjk_bot_personal/GJFN5lkXYAAKUP-.jpg")
					.addFields(
						{ name: "Start Date", value: startDate.toDateString(), inline: true },
						{ name: "End Date", value: endDate.toDateString(), inline: true },
						{
							name: "Appeal",
							value: "If you believe this is a mistake, please join our support server to appeal the decision."
						}
					)

				const appealButton = new ButtonBuilder()
					.setLabel("Join Support Server")
					.setStyle(ButtonStyle.Link)
					.setURL("https://discord.gg/your-server-invite-link")

				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(appealButton)

				await interaction.reply({
					embeds: [appealEmbed],
					components: [row],
					ephemeral: true
				})

				return
			}
		}

		if (await userExists(discordId)) {
			await interaction.reply({
				content: "It looks like you're already registered!",
				ephemeral: true
			})
			return
		}

		const result = await addUser(discordId)

		if (result && "insertedId" in result) {
			await addItemToUserInventory(discordId, "Starter Bundle", 1)
			await setUserTutorialState(discordId, { isRegistered: true })
			const imageURL = "https://storage.googleapis.com/jjk_bot_personal/Shibuya_(Anime).png"
			const welcomeEmbed = new EmbedBuilder()
				.setColor(0x5d2e8c)
				.setTitle("Jujutsu Registration Complete!")
				.setDescription(
					`Welcome, ${interaction.user.toString()}! You can use /help if your ever stuck, Or /guide for the trello link, with all Information.\nYou've also got a free Starter Bundle in your inventory!`
				)
				.setImage(imageURL)
				.setTimestamp()
				.setFooter({
					text: `Are you the strongest because you're ${interaction.user.username}, or are you ${interaction.user.username} because you're the strongest?`
				})

			await interaction.reply({ embeds: [welcomeEmbed] })
		} else {
			await interaction.reply({
				content: "There was an unexpected issue with your registration.",
				ephemeral: true
			})
		}
	} catch (error) {
		logger.error("Error registering user:", error)
		await interaction.reply({
			content: "There was an error while trying to register you.",
			ephemeral: true
		})
	}
}
export async function handleBalanceCommand(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser("user") || interaction.user

	await interaction.deferReply()
	await updateUserCommandsUsed(interaction.user.id)

	const balance = await getBalance(targetUser.id)

	const cursedCoins = balance.toLocaleString("en-US")

	const balanceEmbed = new EmbedBuilder()
		.setColor(0xa00000)
		.setTitle(`${targetUser.username}'s Cursed Wallet`)
		.setThumbnail(targetUser.displayAvatarURL())
		.addFields({ name: "Cursed Wallet", value: `${cursedCoins} `, inline: false })
		.setFooter({ text: getRandomQuote() })
		.setTimestamp()

	await interaction.editReply({ embeds: [balanceEmbed] })
}

export async function handleProfileCommand(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser("user") || interaction.user

	await updateUserCommandsUsed(interaction.user.id)

	const createProfileEmbed = async user => {
		const userProfile = await getUserProfile(user.id)
		if (!userProfile) throw new Error("Profile not found.")

		const profileImage = getUserProfileImage(user.id)
		const profileHeader = await getUserProfileHeader(user.id)
		const hasHeavenlyRestriction = !!userProfile.heavenlyrestriction
		const domainExpansionValue = hasHeavenlyRestriction
			? "Not applicable due to Heavenly Restriction"
			: formatDomainExpansion(userProfile.domain)
		const shikigamiEmojis = userProfile.shikigami.map(shiki => getShikigamiEmoji(shiki.name))

		const embed = new EmbedBuilder()
			.setColor(0x1f6b4e)
			.setTitle(`Jujutsu Profile: ${user.username} 🌀`)
			.setImage(profileHeader || user.displayAvatarURL())
			.setThumbnail(await profileImage)
			.addFields(
				{ name: "**Title** 🏆", value: userProfile.activeTitle || "None", inline: true },
				{ name: "**Sorcerer Grade** 🏅", value: userProfile.grade || "Unranked", inline: true },
				{ name: "**Balance** 💰", value: `\`${userProfile.balance.toLocaleString()}\``, inline: false },
				{ name: "**Experience** ✨", value: userProfile.experience.toLocaleString(), inline: false },
				{ name: "**Job** 💼", value: userProfile.job || "None", inline: false },
				{ name: "**Domain Expansion** 🌀", value: domainExpansionValue, inline: false },
				{ name: "**Heavenly Restriction** ⛔", value: hasHeavenlyRestriction ? "Yes" : "No", inline: false },
				{ name: "**Shikigami** 🐾", value: shikigamiEmojis.join(" ") || "None", inline: false }
			)
			.setFooter({ text: getRandomQuote() })

		if (user.id === "292385626773258240") {
			embed.setColor("LuminousVividPink")
			embed.addFields({ name: "**All-Knowing**", value: "This user is all knowing! 🤔", inline: false })
			embed.addFields({ name: "**Special Status**", value: "This user is special! ✨", inline: false })
		}

		return embed
	}

	try {
		const profileEmbed = await createProfileEmbed(targetUser)

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("selectMenu")
			.setPlaceholder("Select an option")
			.addOptions([
				{ label: "Main Profile", description: "View your main profile", value: "mainProfile" },
				{ label: "User Stats", description: "View clan data", value: "userStats" }
			])

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

		await interaction.reply({ embeds: [profileEmbed], components: [row] })

		const filter = i => i.customId === "selectMenu" && i.user.id === interaction.user.id
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

		collector.on("collect", async i => {
			if (!i.isStringSelectMenu()) return

			let newEmbed

			switch (i.values[0]) {
				case "mainProfile":
					newEmbed = profileEmbed
					break
				case "userStats":
					newEmbed = await createStatsEmbed(targetUser)
					break
				default:
					await i.update({ content: "No profile found for this selection.", components: [] })
					return
			}

			await i.update({ embeds: [newEmbed] })
		})

		collector.on("end", collected => logger.info(`Collected ${collected.size} interactions.`))
	} catch (error) {
		logger.error("Error handling profile command:", error)
		await interaction.reply({ content: "There was an error retrieving your profile.", ephemeral: true })
	}
}

export async function handleInventoryCommand(interaction) {
	await interaction.deferReply()

	await updateUserCommandsUsed(interaction.user.id)

	const mentionedUser = interaction.options.getUser("user") || interaction.user
	const inventoryItems = await getUserInventory(mentionedUser.id)
	const itemsPerPage = 10
	let pageIndex = 0

	// Send the initial page
	const embed = createInventoryPage(inventoryItems, pageIndex * itemsPerPage, itemsPerPage, mentionedUser)
	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("previous")
			.setLabel("Previous")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(true),
		new ButtonBuilder()
			.setCustomId("next")
			.setLabel("Next")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(inventoryItems.length <= itemsPerPage)
	)

	const message = await interaction.editReply({ embeds: [embed], components: [row] })

	const collector = message.createMessageComponentCollector({ time: 60000 })
	collector.on("collect", async i => {
		if (i.user.id === interaction.user.id || (mentionedUser && i.user.id === mentionedUser.id)) {
			if (i.customId === "next" && (pageIndex + 1) * itemsPerPage < inventoryItems.length) {
				pageIndex++
			} else if (i.customId === "previous" && pageIndex > 0) {
				pageIndex--
			}

			const newEmbed = createInventoryPage(inventoryItems, pageIndex * itemsPerPage, itemsPerPage, mentionedUser)
			const newRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId("previous")
					.setLabel("Previous")
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(pageIndex === 0),
				new ButtonBuilder()
					.setCustomId("next")
					.setLabel("Next")
					.setStyle(ButtonStyle.Secondary)
					.setDisabled((pageIndex + 1) * itemsPerPage >= inventoryItems.length)
			)

			await i.update({ embeds: [newEmbed], components: [newRow] })
		} else {
			await i.reply({ content: "You cannot control this inventory navigation.", ephemeral: true })
		}
	})
}

export async function handleDigCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	await interaction.deferReply()
	const userId = interaction.user.id

	await updateUserCommandsUsed(userId)

	const currentTime = Date.now()
	const timestamp = digCooldowns.get(userId)

	if (timestamp) {
		const expirationTime = timestamp + digCooldown
		if (currentTime < expirationTime) {
			const digCooldownEmbed = new EmbedBuilder()
				.setColor("DarkPurple")
				.setTitle("Energy Recharge Needed")
				.setTimestamp()
				.setDescription(
					`You've recently tapped into your energy. Please wait a bit before your next dig <t:${Math.floor(
						expirationTime / 1000
					)}:R>.`
				)
				.setFooter({ text: getRandomQuote() })
			await interaction.editReply({ embeds: [digCooldownEmbed] })
			return
		}
	}

	digCooldowns.set(userId, currentTime)

	const userState = await getUserTutorialState(userId)
	const isTutorial = userState && !userState.digUsed

	const itemDiscoveryChance = isTutorial ? 1 : 0.7
	const doesDiscoverItem = Math.random() < itemDiscoveryChance
	const coinsFound = isTutorial ? 20000 : Math.floor(Math.random() * 20000) + 1

	await updateBalance(interaction.user.id, coinsFound)
	await updateUserFavoriteCommand(interaction.user.id, "Dig")

	if (doesDiscoverItem) {
		const itemFound = isTutorial ? { name: "Tailsman" } : getRandomItem()

		if (itemFound) {
			await addItemToUserInventory(userId, itemFound.name, 1)

			const digEmbed = new EmbedBuilder()
				.setColor("Green")
				.setTitle(isTutorial ? "Tutorial Dig Results" : "Digging Results")
				.setDescription(
					isTutorial
						? `You unearthed \`⌬${coinsFound}\` coins! **You also found a ${itemFound.name}, Handy!**`
						: `You unearthed \`⌬${coinsFound}\` coins! **You also found a ${itemFound.name}!**`
				)
				.setTimestamp()
				.setFooter({ text: getRandomQuote() })
			await interaction.editReply({ embeds: [digEmbed] })

			if (isTutorial) {
				userState.digUsed = true

				await setUserTutorialState(userId, userState)

				const tutorialMessageId = userState.tutorialMessageId
				const dmChannel = await interaction.user.createDM()

				try {
					const tutorialMessage = await dmChannel.messages.fetch(tutorialMessageId)

					if (tutorialMessage) {
						const step = 1
						const buttons = await getButtons(step, userId)

						await tutorialMessage.edit({
							embeds: [tutorialPages[step]],
							components: [buttons]
						})
					}
				} catch (error) {
					console.error("Failed to fetch or edit the tutorial message:", error)
				}
			}
		} else {
			const digEmbed = new EmbedBuilder()
				.setColor("Green")
				.setTitle("Digging Results")
				.setDescription(`You unearthed \`⌬${coinsFound}\` coins but didn't find any items this time.`)
				.setTimestamp()
			await interaction.editReply({ embeds: [digEmbed] })
		}
	} else {
		const digEmbed = new EmbedBuilder()
			.setColor("Green")
			.setTitle("Digging Results")
			.setDescription(`You unearthed \`⌬${coinsFound}\` coins but didn't find any items this time.`)
			.setTimestamp()
		await interaction.editReply({ embeds: [digEmbed] })
	}
	const settings = ((await getUserSettings(userId)) as UserSettings) || {
		showAlerts: true
	}

	const { count, hasDeveloperAlerts } = await checkForNewAlerts(userId, settings.showAlerts)

	if (count > 0) {
		let alertMessage = `Hey, you've got ${count} unread alert(s)! Use **/alert** to view them!`
		if (hasDeveloperAlerts) {
			alertMessage += " (Including developer alerts)"
		}

		await interaction.followUp({
			content: alertMessage,
			ephemeral: true
		})
	}
}
export async function handleJobSelection(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) return

	await updateUserCommandsUsed(interaction.user.id)

	const jobOptions = jobs.map(job => ({
		label: job.name,
		value: job.name,
		description: `Experience: ${job.requiredExperience}, Cost: ${job.cost}`
	}))

	const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
		new SelectMenuBuilder().setCustomId("select-job").setPlaceholder("No job selected").addOptions(jobOptions)
	)

	await interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${interaction.user.username}, Become a Jujutsu Sorcerer`)
				.setDescription("Embark on your cursed path. Choose wisely, for your fate hangs in the balance.")
				.setColor(0x842995)
		],
		components: [row],
		ephemeral: false
	})

	const filter = i => i.customId === "select-job" && i.user.id === interaction.user.id

	const collector = interaction.channel.createMessageComponentCollector({
		filter,
		componentType: ComponentType.StringSelect
	})

	collector.on("collect", async (collectedInteraction: SelectMenuInteraction) => {
		if (collectedInteraction.componentType !== ComponentType.StringSelect) return
		const selectedJobName = collectedInteraction.values[0]
		const selectedJob = jobs.find(job => job.name === selectedJobName)
		const userProfile = await getUserProfile(interaction.user.id)

		if (!userProfile || !selectedJob) {
			await interaction.reply({
				content: "Error: Your user profile could not be found or job is invalid.",
				ephemeral: false
			})
			return
		}

		if (userProfile.experience < selectedJob.requiredExperience || userProfile.balance < selectedJob.cost) {
			await interaction.editReply({
				content: `You do not meet the requirements for the ${selectedJobName} job. Required experience: ${selectedJob.requiredExperience}, Cost: ${selectedJob.cost}`,
				components: []
			})
			return
		}

		const updateSuccess = await updateUserJob(interaction.user.id, selectedJobName)
		if (!updateSuccess) {
			await interaction.editReply({
				content: "Error: Could not update your job. Please try again later.",
				components: []
			})
			return
		}
		await updateBalance(interaction.user.id, selectedJob.cost * -1)
		await interaction.editReply({
			content: `Congratulations! You're now a ${selectedJobName}.`,
			components: []
		})
	})
}

export async function handleDailyCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	await updateUserCommandsUsed(interaction.user.id)
	const userId = interaction.user.id
	const currentTime = Date.now()
	const oneDayMs = 24 * 60 * 60 * 1000
	const baseReward = 100000
	const streakBonus = 25000
	const { lastDaily, streak: lastStreak } = await getUserDailyData(userId)

	if (currentTime - lastDaily < oneDayMs) {
		const nextAvailableTime = Math.floor((lastDaily + oneDayMs) / 1000)
		await interaction.reply({
			content: `You must wait before you can claim your daily reward again. You can claim it again <t:${nextAvailableTime}:R>.`,
			ephemeral: true
		})
		return
	}

	const streak = currentTime - lastDaily < oneDayMs * 2 ? lastStreak + 1 : 1
	const coinsReward = baseReward + streakBonus * (streak - 1)
	await updateUserDailyData(userId, currentTime, streak)
	await updateBalance(userId, coinsReward)

	let rewardItem
	let rewardType

	if (streak >= 5 && streak < 10) {
		rewardItem = "Normal Box"
		rewardType = "Box"
	} else if (streak >= 10 && streak < 15) {
		rewardItem = "Extreme Box"
		rewardType = "Box"
	} else if (streak >= 30) {
		rewardItem = "Special Grade Box"
		rewardType = "Box"
	} else {
		const randomItemIndex = Math.floor(Math.random() * dailyitems.length)
		rewardItem = dailyitems[randomItemIndex].name
		rewardType = "Daily Item"
	}

	await addItemToUserInventory(userId, rewardItem, 1)

	const dailyEmbed = new EmbedBuilder()
		.setColor(0x1f8b4c)
		.setTitle("🎁 Daily Reward Claimed! 🎁")
		.setThumbnail("https://i.pinimg.com/736x/8f/90/56/8f9056043d8ea491aab138f1a005599d.jpg")
		.addFields(
			{ name: "Coins Awarded", value: `**${coinsReward.toLocaleString()} coins** 💰`, inline: true },
			{ name: "Special Reward", value: `**${rewardItem}**📦`, inline: true },
			{ name: "Streak", value: `**${streak}** day(s) 🔥`, inline: false }
		)
		.setDescription(
			"Congratulations on claiming your daily reward! Keep coming back every day for even bigger rewards."
		)
		.setFooter({ text: "Pro tip: Daily streaks increase your rewards!" })
		.setTimestamp()

	await interaction.reply({ embeds: [dailyEmbed] })

	const settings = ((await getUserSettings(userId)) as UserSettings) || {
		showAlerts: true
	}

	const { count, hasDeveloperAlerts } = await checkForNewAlerts(userId, settings.showAlerts)

	if (count > 0) {
		let alertMessage = `Hey, you've got ${count} unread alert(s)! Use **/alert** to view them!`
		if (hasDeveloperAlerts) {
			alertMessage += " (Including developer alerts)"
		}

		await interaction.followUp({
			content: alertMessage,
			ephemeral: true
		})
	}
}

export async function handleCraftCommand(interaction: ChatInputCommandInteraction<CacheType>) {
	try {
		const userInventory = await getUserInventory(interaction.user.id)
		if (!userInventory) {
			throw new Error("User inventory is not available.")
		}

		const craftableItemsMenu = new SelectMenuBuilder()
			.setCustomId("selectCraftItem")
			.setPlaceholder("Select an item to craft")
			.addOptions(
				Object.keys(craftingRecipes)
					.map(key => {
						const recipe = craftingRecipes[key]
						if (!recipe) {
							logger.error("Recipe details not found for key:", key)
							return null
						}
						const emojiId = recipe.emoji && recipe.emoji.match(/:(\d+)>/)?.[1]

						const inventoryMap = new Map(userInventory.map(item => [item.name, item.quantity]))
						const maxCraftableAmount = recipe.requiredItems.reduce((min, item) => {
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
					.filter(option => option !== null)
			)

		const row1 = new ActionRowBuilder<SelectMenuBuilder>().addComponents(craftableItemsMenu)

		await interaction.reply({ content: "", components: [row1] })

		const menuFilter = i => i.customId === "selectCraftItem" && i.user.id === interaction.user.id
		const menuCollector = interaction.channel.createMessageComponentCollector({ filter: menuFilter, time: 60000 })

		menuCollector.on("collect", async interaction => {
			if (interaction.isStringSelectMenu()) {
				await interaction.deferUpdate()
				const selectedItemKey = interaction.values[0]
				const selectedItemRecipe = craftingRecipes[selectedItemKey]

				const userInventory = await getUserInventory(interaction.user.id)
				const inventoryMap = new Map(userInventory.map(item => [item.name, item.quantity]))

				const missingItems = selectedItemRecipe.requiredItems.filter(item => {
					const inventoryQuantity = inventoryMap.get(item.name) || 0
					return inventoryQuantity < item.quantity
				})

				const craftEmbed = new EmbedBuilder()
					.setColor(0x00ff00)
					.setTitle(`${selectedItemRecipe.craftedItemName}`)
					.addFields({
						name: "Requirements",
						value: selectedItemRecipe.requiredItems
							.map(item => `${item.quantity}x ${item.name}`)
							.join("\n"),
						inline: false
					})

				if (missingItems.length > 0) {
					craftEmbed
						.setColor("Red")
						.setDescription("You do not have all the necessary items to craft this item.")
						.addFields({
							name: "Missing Items",
							value: missingItems
								.map(
									item =>
										`${item.name} (${item.quantity - (inventoryMap.get(item.name) || 0)} missing)`
								)
								.join("\n")
						})

					await interaction.editReply({
						embeds: [craftEmbed],
						components: [row1]
					})
					return
				}

				const maxCraftableAmount = selectedItemRecipe.requiredItems.reduce((min, item) => {
					const inventoryQuantity = inventoryMap.get(item.name) || 0
					const maxCraftableForItem = Math.floor(inventoryQuantity / item.quantity)
					return Math.min(min, maxCraftableForItem)
				}, Infinity)

				const confirmButton = new ButtonBuilder()
					.setCustomId("confirmCraft")
					.setLabel("Craft 1")
					.setStyle(ButtonStyle.Success)
					.setEmoji("✅")

				const craftMaxButton = new ButtonBuilder()
					.setCustomId("craftMax")
					.setLabel(`Craft Max (${maxCraftableAmount})`)
					.setStyle(ButtonStyle.Primary)
					.setEmoji("🔧")

				const cancelButton = new ButtonBuilder()
					.setCustomId("cancelCraft")
					.setLabel("Cancel")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("❌")

				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
					confirmButton,
					craftMaxButton,
					cancelButton
				)

				await interaction.editReply({
					embeds: [craftEmbed],
					components: [row, row1]
				})

				const buttonFilter = i =>
					["confirmCraft", "craftMax", "craftCustom", "cancelCraft"].includes(i.customId) &&
					i.user.id === interaction.user.id

				const buttonCollector = interaction.channel.createMessageComponentCollector({
					filter: buttonFilter,
					time: 20000
				})

				buttonCollector.on("collect", async buttonInteraction => {
					await buttonInteraction.deferReply()

					if (buttonInteraction.customId === "confirmCraft") {
						const userInventory = await getUserInventory(interaction.user.id)
						const inventoryMap = new Map(userInventory.map(item => [item.name, item.quantity]))

						const missingItems = selectedItemRecipe.requiredItems.filter(item => {
							const inventoryQuantity = inventoryMap.get(item.name) || 0
							return inventoryQuantity < item.quantity
						})

						if (missingItems.length > 0) {
							const errorEmbed = new EmbedBuilder()
								.setColor("Red")
								.setTitle("Insufficient Items")
								.setDescription("You do not have all the necessary items to craft this item.")
								.addFields({
									name: "Missing Items",
									value: missingItems
										.map(
											item =>
												`${item.name} (${item.quantity - (inventoryMap.get(item.name) || 0)})`
										)
										.join("\n")
								})

							await buttonInteraction.editReply({
								embeds: [errorEmbed],
								components: []
							})
							return
						}

						try {
							logger.info("Starting item removal for ITEM!")

							for (const requiredItem of selectedItemRecipe.requiredItems) {
								logger.info("Removing item:", requiredItem)
								await removeItemFromUserInventory(
									interaction.user.id,
									requiredItem.name,
									requiredItem.quantity
								)
								logger.info("Item removed!")
							}
							await addItemToUserInventory(interaction.user.id, selectedItemRecipe.craftedItemName, 1)
							logger.info("Item added! ", selectedItemRecipe.craftedItemName)

							await buttonInteraction.followUp({
								ephemeral: true,
								content: `You have successfully crafted ${selectedItemRecipe.craftedItemName}!`,
								components: []
							})
						} catch (error) {
							logger.fatal("Error during crafting:", error)
							await buttonInteraction.editReply({
								content: "There was an error during the crafting process. Please try again.",
								components: []
							})
						}
					} else if (buttonInteraction.customId === "craftMax") {
						const userInventory = await getUserInventory(interaction.user.id)
						const inventoryMap = new Map(userInventory.map(item => [item.name, item.quantity]))

						const maxCraftableQuantity = selectedItemRecipe.requiredItems.reduce((acc, item) => {
							const inventoryQuantity = inventoryMap.get(item.name) || 0
							const craftableQuantity = Math.floor(inventoryQuantity / item.quantity)
							return Math.min(acc, craftableQuantity)
						}, Infinity)

						if (maxCraftableQuantity === 0) {
							const errorEmbed = new EmbedBuilder()
								.setColor("Red")
								.setTitle("Insufficient Items")
								.setDescription("You do not have enough items to craft this item.")

							await buttonInteraction.editReply({
								embeds: [errorEmbed],
								components: []
							})
							return
						}

						try {
							for (const requiredItem of selectedItemRecipe.requiredItems) {
								await removeItemFromUserInventory(
									interaction.user.id,
									requiredItem.name,
									requiredItem.quantity * maxCraftableQuantity
								)
							}
							await addItemToUserInventory(
								interaction.user.id,
								selectedItemRecipe.craftedItemName,
								maxCraftableQuantity
							)

							await buttonInteraction.followUp({
								ephemeral: true,
								content: `You have successfully crafted ${maxCraftableQuantity}x ${selectedItemRecipe.craftedItemName}!`,
								components: []
							})
						} catch (error) {
							logger.fatal("Error during crafting:", error)
							await buttonInteraction.editReply({
								content: "There was an error during the crafting process. Please try again.",
								components: []
							})
						}
					} else if (interaction.customId === "craftCustom") {
						const modal = new ModalBuilder()
							.setCustomId("craftCustomModal")
							.setTitle("Custom Craft Quantity")

						const quantityInput = new TextInputBuilder()
							.setCustomId("quantityInput")
							.setLabel("Enter the desired quantity to craft")
							.setStyle(TextInputStyle.Short)
							.setRequired(true)
							.setPlaceholder("Quantity")

						const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
							quantityInput
						)
						modal.addComponents(actionRow)

						await interaction.showModal(modal)

						const modalSubmitInteraction = await interaction
							.awaitModalSubmit({
								time: 60000,
								filter: i => i.customId === "craftCustomModal" && i.user.id === interaction.user.id
							})
							.catch(error => {
								logger.error("Modal submit interaction error:", error)
								return null
							})

						if (!modalSubmitInteraction) {
							await interaction.followUp({
								content: "Modal submission timed out.",
								ephemeral: true
							})
							return
						}

						await modalSubmitInteraction.deferReply({ ephemeral: true })

						const quantity = parseInt(modalSubmitInteraction.fields.getTextInputValue("quantityInput"))

						if (isNaN(quantity) || quantity <= 0) {
							await modalSubmitInteraction.followUp({
								content: "Invalid quantity. Please enter a valid number greater than 0.",
								ephemeral: true
							})
							return
						}

						const userInventory = await getUserInventory(interaction.user.id)
						const inventoryMap = new Map(userInventory.map(item => [item.name, item.quantity]))

						const missingItems = selectedItemRecipe.requiredItems.filter(item => {
							const inventoryQuantity = inventoryMap.get(item.name) || 0
							return inventoryQuantity < item.quantity * quantity
						})

						if (missingItems.length > 0) {
							const errorEmbed = new EmbedBuilder()
								.setColor("Red")
								.setTitle("Insufficient Items")
								.setDescription("You do not have enough items to craft the specified quantity.")
								.addFields({
									name: "Missing Items",
									value: missingItems
										.map(
											item =>
												`${item.name} (${item.quantity * quantity - (inventoryMap.get(item.name) || 0)} missing)`
										)
										.join("\n")
								})

							await modalSubmitInteraction.followUp({
								embeds: [errorEmbed],
								ephemeral: true
							})
							return
						}

						try {
							for (const requiredItem of selectedItemRecipe.requiredItems) {
								await removeItemFromUserInventory(
									interaction.user.id,
									requiredItem.name,
									requiredItem.quantity * quantity
								)
							}
							await addItemToUserInventory(
								interaction.user.id,
								selectedItemRecipe.craftedItemName,
								quantity
							)

							await modalSubmitInteraction.followUp({
								ephemeral: true,
								content: `You have successfully crafted ${quantity}x ${selectedItemRecipe.craftedItemName}!`,
								components: []
							})
						} catch (error) {
							logger.fatal("Error during crafting:", error)
							await modalSubmitInteraction.followUp({
								content: "There was an error during the crafting process. Please try again.",
								ephemeral: true
							})
						}
					} else if (buttonInteraction.customId === "cancelCraft") {
						await buttonInteraction.editReply({ content: "Crafting canceled.", components: [] })
					}

					buttonCollector.stop()
					menuCollector.stop()
				})
			}
		})
	} catch (error) {
		logger.error("Error in crafting command:", error)
		await interaction.reply({ content: "There was an error while processing your request.", ephemeral: true })
	}
}
export async function handleTitleSelectCommand(interaction: ChatInputCommandInteraction) {
	const unlockedTitles = await getUserUnlockedTitles(interaction.user.id)

	if (unlockedTitles.length === 0) {
		await interaction.reply({
			content: "You have no unlocked titles yet!",
			ephemeral: true
		})
		return
	}

	const embed = new EmbedBuilder()
		.setTitle("Select Your Title")
		.setDescription("Choose a title from the dropdown menu below.")

	logger.info("unlockedTitles:", unlockedTitles)

	const selectMenu = new SelectMenuBuilder()
		.setCustomId("title_selection")
		.setPlaceholder("No title selected")
		.addOptions(
			unlockedTitles.map(title => {
				return {
					label: title.length > 25 ? title.substring(0, 22) + "..." : title,
					description: title.length > 100 ? title.substring(0, 97) + "..." : title,
					value: title
				}
			})
		)
	const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu)
	await interaction.reply({ embeds: [embed], components: [row] })

	const filter = i => i.customId === "title_selection"

	const collector = interaction.channel.createMessageComponentCollector({
		filter,
		componentType: ComponentType.StringSelect,
		time: 20000
	})

	collector.on("collect", async collectedInteraction => {
		const selectedTitle = collectedInteraction.values[0]

		try {
			await updateUserTitle(interaction.user.id, selectedTitle)
			await collectedInteraction.update({
				content: `Your title has been updated to ${selectedTitle}`,
				embeds: [],
				components: []
			})
		} catch (error) {
			await collectedInteraction.followUp({
				content: "There was an error updating your title.",
				embeds: [],
				components: []
			})
			logger.error(error)
		}

		collector.on("end", collected => {
			if (collected.size === 0) {
				interaction.followUp({ content: "You did not select a title.", components: [] }).catch(logger.error)
			}
		})
	})
}

export async function handleDomainSelection(interaction) {
	const domainOptions = DOMAIN_EXPANSIONS.map(domain => ({
		label: domain.name,
		description: domain.description,
		value: domain.name
	}))

	const row = new ActionRowBuilder().addComponents(
		new SelectMenuBuilder()
			.setCustomId("select-domain")
			.setPlaceholder("No domain selected")
			.addOptions(domainOptions)
	)

	const embed = new EmbedBuilder()
		.setTitle("Domain Expansion Selection")
		.setDescription("Click on one of the domains below to view more information.")

	await interaction.reply({ embeds: [embed], components: [row], ephemeral: false })

	const filter = i => i.user.id === interaction.user.id
	const domaincollector = interaction.channel.createMessageComponentCollector({ filter })

	domaincollector.on("collect", async collectedInteraction => {
		if (collectedInteraction.isStringSelectMenu() && collectedInteraction.customId === "select-domain") {
			const selectedDomainName = collectedInteraction.values[0]

			// Find Domain Information
			const selectedDomain = DOMAIN_INFORMATION.find(domain => domain.name === selectedDomainName)

			if (!selectedDomain) {
				logger.error("Domain not found:", selectedDomainName)
				await collectedInteraction.followUp({
					embeds: [
						new EmbedBuilder().setTitle("Error").setDescription("Domain information could not be found.")
					],
					components: []
				})
				return
			}

			const infoEmbed = new EmbedBuilder()
				.setTitle(selectedDomain.name)
				.setDescription(selectedDomain.description)
				.setColor("#552288")

			if (selectedDomain.image) {
				infoEmbed.setImage(selectedDomain.image)
			}
			if (selectedDomain.effects) {
				infoEmbed.addFields({ name: "•  Effects", value: selectedDomain.effects })
			}
			if (selectedDomain.requirement) {
				infoEmbed.addFields({ name: "•  Requirement", value: selectedDomain.requirement })
			}

			// Add the "Buy" button
			const buyRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId("buy-domain").setLabel("Buy").setStyle(ButtonStyle.Success)
			)

			await collectedInteraction.update({ embeds: [infoEmbed], components: [buyRow, row] })
		} else if (collectedInteraction.isButton() && collectedInteraction.customId === "buy-domain") {
			await collectedInteraction.deferUpdate()

			const selectedDomainName = collectedInteraction.message.embeds[0].title
			const userInventory = await getUserInventory(interaction.user.id)

			// Find the selected domain's requirement
			const selectedDomain = DOMAIN_INFORMATION.find(domain => domain.name === selectedDomainName)
			if (!selectedDomain) {
				logger.error("Domain not found:", selectedDomainName)
				return
			}

			const requiredItem = userInventory.find(item => item.name === selectedDomain.requirement)

			if (!requiredItem) {
				await collectedInteraction.followUp({
					embeds: [
						new EmbedBuilder()
							.setTitle("Requirements Not Met")
							.setDescription(`You do not have the required ${selectedDomain.requirement}.`)
					],
					components: []
				})
				return
			}

			const userGrade = await getUserGrade(interaction.user.id)
			const gradeLevel = userGrade.toLowerCase()

			if (gradeMappings[gradeLevel] <= 3) {
				try {
					await updateUserAchievements(interaction.user.id, "unlockedDomain")
					await removeItemFromUserInventory(interaction.user.id, selectedDomain.requirement, 1)
					await updateUserDomainExpansion(interaction.user.id, selectedDomainName)

					await collectedInteraction.followUp({
						embeds: [
							new EmbedBuilder()
								.setTitle("Cursed Energy Manifested!")
								.setDescription(`You have unlocked the ${selectedDomainName} Domain Expansion!`)
						]
					})
				} catch (error) {
					logger.error("Error during domain purchase:", error)
					await collectedInteraction.followUp({
						embeds: [
							new EmbedBuilder()
								.setTitle("Error")
								.setDescription("An error occurred while purchasing the domain.")
						],
						components: []
					})
				}
			} else {
				await collectedInteraction.followUp({
					embeds: [
						new EmbedBuilder()
							.setTitle("Requirements Not Met")
							.setDescription(
								`You do not have a ${selectedDomain.requirement} or are not a high enough grade.`
							)
					],
					components: []
				})
			}

			domaincollector.stop()
		}
	})

	domaincollector.on("end", collected => {
		logger.info(`Collected ${collected.size} items`)
	})
}

const userSearching = new Map<
	string,
	{
		searchCount: number
		riskFactor: number
		coinsFound: number
		itemFound: string
	}
>()

export async function handleSearchCommand(interaction: ChatInputCommandInteraction<CacheType>) {
	logger.info(`Received search command from ${interaction.user.tag}.`)
	await interaction.deferReply()
	const currentTime = Date.now()
	const authorId = interaction.user.id
	const timestamp = searchCooldowns.get(authorId)

	// Check cooldown, incorporating a themed message
	if (timestamp) {
		const expirationTime = timestamp + searchCooldown
		if (currentTime < expirationTime && !searchCooldownBypassIDs.includes(authorId)) {
			// User is on cooldown, send a themed message
			const searchCooldownEmbed = new EmbedBuilder()
				.setColor(0x4b0082) // Red color for alert
				.setTitle("Energy Recharge Needed")
				.setTimestamp()
				.setDescription(
					`You've recently tapped into your energy. Please wait a bit before your next search <t:${Math.floor(
						expirationTime / 1000
					)}:R>.`
				)
			await interaction.editReply({ embeds: [searchCooldownEmbed] })
			return // Stop further execution to prevent cooldown reset
		}
	}

	// User is not on cooldown, or has bypassed it; update the cooldown
	searchCooldowns.set(authorId, currentTime)

	// Reset risk at the start of each new search session
	userSearching.set(interaction.user.id, {
		searchCount: 0,
		riskFactor: 0,
		coinsFound: 0,
		itemFound: ""
	})

	const searchLocation = getRandomLocation() // Assuming this function returns a string describing the location

	const searchEmbed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle("Search Begins")
		.setDescription(`Beginning your search in ${searchLocation}. The air grows heavier...`)
		.setFooter({ text: "Risk of encountering a cursed spirit increases with each search.  +20%" })

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId("continue_search").setLabel("Continue Searching").setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId("end_search").setLabel("End Search").setStyle(ButtonStyle.Danger)
	)

	await interaction.editReply({ embeds: [searchEmbed], components: [row] })

	const collector = interaction.channel.createMessageComponentCollector({
		filter: inter => inter.user.id === interaction.user.id,
		time: 60000
	})

	collector.on("collect", async inter => {
		logger.info(`Button clicked by ${inter.user.tag}: ${inter.customId}`)
		await inter.deferUpdate()

		if (inter.customId === "continue_search") {
			const coinsFoundThisSearch = Math.floor(Math.random() * 20000) + 1

			userSearching.set(inter.user.id, {
				...userSearching.get(inter.user.id),
				coinsFound: userSearching.get(inter.user.id).coinsFound + coinsFoundThisSearch
			})

			// Calculate the chance of finding a cursed spirit
			const encounterChance = Math.random() < userSearching.get(interaction.user.id).riskFactor
			if (encounterChance) {
				logger.info(`Cursed spirit encountered. Attempting to respond to ${interaction.user.tag}.`)

				const spiritEmbed = new EmbedBuilder()
					.setColor("DarkRed")
					.setTitle("You have perished!")
					.setDescription("While searching, you encounter a powerful cursed spirit and meet a grim fate...")
					.setFooter({ text: "You've lost everything you found! Better luck next time." })

				await interaction.editReply({
					embeds: [spiritEmbed],
					components: [] // Remove buttons
				})

				userSearching.delete(interaction.user.id)
				return
			}

			const theirSearchCount = userSearching.get(inter.user.id).searchCount
			logger.info(`Search count for ${inter.user.tag}: ${theirSearchCount}`)

			if (theirSearchCount < 2) {
				userSearching.set(inter.user.id, {
					...userSearching.get(inter.user.id),
					searchCount: theirSearchCount + 1,
					riskFactor: userSearching.get(inter.user.id).riskFactor + 0.2
				})

				// Embed for search results
				const searchEmbed = new EmbedBuilder()
					.setColor(0x00ff00)
					.setTitle("Search Continues")
					.setDescription(
						`Continuing your search in ${searchLocation}, you find \`⌬${coinsFoundThisSearch}\` coins. The air grows heavier...`
					)
					.setFooter({ text: "Risk of encountering a cursed spirit increases with each search." })

				await interaction.editReply({ embeds: [searchEmbed], components: [row] })
			} else {
				const coinsFound = userSearching.get(inter.user.id)?.coinsFound ?? 0
				const itemFound = getRandomItem()

				// Embed description handling
				let itemDescription = "You've finished your searching. You gathered a total of "
				itemDescription += `${coinsFound} coins`

				if (itemFound) {
					itemDescription += `, You also found a ${itemFound.name}!`
				} else {
					itemDescription += ", but you didn't find any items this time."
				}

				const finalEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle("Search Completed")
					.setDescription(itemDescription)
					.setTimestamp()

				updateBalance(inter.user.id, coinsFound)
				if (itemFound) {
					addItemToUserInventory(inter.user.id, itemFound.name, 1) // Only add if the item exists
				}

				await inter.editReply({
					content: "Your search has concluded.",
					embeds: [finalEmbed],
					components: []
				})

				collector.stop()
				collector.on("end", collected => {
					logger.info(`Collected ${collected.size} items`)
				})
			}
		} else if (inter.customId === "end_search") {
			logger.info(`End search button clicked by ${inter.user.tag}`)

			const coinsFoundInTheEnd = userSearching.get(inter.user.id).coinsFound
			updateBalance(inter.user.id, coinsFoundInTheEnd)

			// embed 2
			const finalEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Search Ended")
				.setDescription("You end your search, returning with your findings. Wise choice.")
				.setFooter({ text: `Total coins found: **${coinsFoundInTheEnd}**` }) // Reflect the total coins found
				.setTimestamp()

			await inter.editReply({
				content: null,
				embeds: [finalEmbed],
				components: []
			})

			userSearching.delete(inter.user.id) // Remove the user from the search map

			collector.stop()
		}
	})
	collector.on("end", collected => {
		logger.info(`Collected ${collected.size} items`)
	})
}

const checkmarkEmoji = "✅" // Use custom emojis if you have them
const crossEmoji = "❌" // Use custom emojis if you have them

export const handleAchievementsCommand = async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply()
	const userId = interaction.user.id
	const userAchievements = await getUserAchievements(userId) // This should be an array of achievement IDs
	let currentPage = 0

	const itemsPerPage = 10 // Set the number of items per page

	const sendAchievementsEmbed = async (page: number) => {
		const pageStart = page * itemsPerPage
		const pageEnd = pageStart + itemsPerPage

		const embed = new EmbedBuilder().setTitle(`${interaction.user.username}'s Achievements`).setColor("#0099ff")

		// Sort achievements by whether they've been unlocked and their name
		const sortedAchievements = Object.entries(allAchievements).sort(([id1, ach1], [id2, ach2]) => {
			const hasFirst = userAchievements.includes(id1)
			const hasSecond = userAchievements.includes(id2)
			if (hasFirst === hasSecond) {
				return ach1.name.localeCompare(ach2.name)
			}
			return hasFirst ? -1 : 1
		})

		// Generate fields for the paginated achievements
		sortedAchievements.slice(pageStart, pageEnd).forEach(([achievementId, { name, description, reward }]) => {
			const hasAchievement = userAchievements.includes(achievementId)
			embed.addFields({
				name: `${hasAchievement ? checkmarkEmoji : crossEmoji} ${name}`,
				value: `${description}\nReward: ${reward || "No reward."}`,
				inline: false
			})
		})

		// Check if there are no achievements to display
		if (sortedAchievements.length === 0) {
			embed.setDescription("No achievements found.")
		}

		const components = [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("previous_page")
					.setLabel("Previous")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(page === 0),
				new ButtonBuilder()
					.setCustomId("next_page")
					.setLabel("Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(pageEnd >= Object.keys(allAchievements).length)
			)
		]

		await interaction.editReply({ embeds: [embed], components })
	}

	// Initial call to send the first page of achievements
	await sendAchievementsEmbed(currentPage)

	const filter = (i: { user: { id: string }; customId: string }) => i.user.id === userId
	const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 })

	collector.on("collect", async i => {
		if (i.customId === "previous_page" && currentPage > 0) {
			currentPage -= 1 // Decrement currentPage if not the first page
		} else if (
			i.customId === "next_page" &&
			(currentPage + 1) * itemsPerPage < Object.keys(allAchievements).length
		) {
			currentPage += 1 // Increment currentPage if not the last page
		}

		await sendAchievementsEmbed(currentPage)
		await i.update({ embeds: [i.message.embeds[0]], components: i.message.components })
	})
}

export async function handleUpdateCommand(interaction) {
	const recentUpdates = [
		{
			version: "UPDATE 9.0, Part One of the PvP Update!",
			date: "08/06/24",
			changes: [
				{
					name: "Enter a fierce fight with your destined enemy with the new pvp features!",
					value: "\u200b"
				},
				{
					name: "ADDED",
					value: "- PVP\n- USER SETTINGS (Show Alerts, Ispvpable, Trades, showSpoiler)\n- Semi-Reworked Quests.. Again!\n- New Grades! Special Grade 4-1.\n- Daily Streaks, The more dailys you claim the bigger streak you have, Which equals to a bigger box reward!\n- New Skill Under, The Strongest!\n- New Way Skills Work, Some skills now require a Inate Clan tier requirement. Especially the new strongest skill!\n- Semi-Reworked Trading. Accounting in QoL Changes and user friendly features.\n- Fully RE-WORKED Alert System. you can disable this any time in settings, Developer alerts shall bypass this though.\n- New /consume Command, Skip your way through jujutsu using these Cursed Essences!\n- Updated Mentor. Gives new quest!"
				},
				{
					name: "New Techniques",
					value: "- The Strongest, Six Point Palm < First skill with some special features!\n- Yuta Okkotsu (Manifested Rika) FULL SKILLSET.\n- Zenin Toji (Honored Arc) FULL SKILLSET."
				},
				{
					name: "Changes",
					value: "- Made it so you there's a chance you can get multiple drops from fight.\n- Fixed Abandon Quests.\n- Fixed Ping Command.\n- Fixed Satoru Gojo Mentor Bug.\n- Fixed Raid Tokens.\n- When there's no alerts in /alert, a secret message is there!\n- Changed Boss Death Handling.\n- Changed Bot Status Embed.\n- Updated True And Mutal Love.\n- Made it so you can mention a user's inventory to look at.\n- Fixed spelling mistake when using Six Eyes.\n- Fixed The Shoko Gif Bugging.\n- If a trade is left pending for 24 hours it will become ignored.\n- Bot no longer dms you when you recieve a trade request instead you will get a alert.\n- Removed Shikigami Shop.\n- Gamble Limit 25M > 20M\n- Added \"Nuh Uh\" if another user tries to use your button/menu.\n- Fixed some stuff when claiming quests.\n- Changed useitem > use.\n- Fixed dupe techniques, Bot will also now tell you when using /fight etc.\n- Nerfed cost of Gambler Fever (Jackpot)\n- Fixed Abandon Quest... There was a rare chance it errored telling you to abandon a quest.."
				},
				{
					name: "REMOVED",
					value: "Update Profile Avatar/Header. All current user's with it will still keep it. I didn't really see it being used that much. If user's would like me to add it back i will."
				},
				{
					name: "BUFFED",
					value: "- HEAVENLY RESTRICTION BIG BUFF, Heavenly Restriction now ignores dmg reduction\n- Jogos Ball Twister Technique\n- Imaginary Technique: Purple\n- Nah I'd Lose\n- Hollow Nuke"
				},
				{
					name: "New Shop Items",
					value: "- Six Eyes\n- Heian Era Scraps\n- Sukuna Finger Bundle\n- Heian Era Awakening Remnant"
				},
				{
					name: "User's who got skills in this wave",
					value: "Simon = Cry About It!\nShoko = The Shoko:\nfreaky(KAI/donut) = Ultimate Donut Strike"
				},
				{
					name: "Not so needed information",
					value: "This is part one of the pvp update, there's still quite alot missing i'm working best i can but i released this update as quickly as i could due to the fact i'm going on holiday soon, and i wanted you guys to have the pvp update atleast! i'm writing this as of the 6/6/24 hoping to get this update out on saturday, so expect over the coming week for me to update it as much as i can with new features skills etc. thank you <3\nI've also made a buy me a coffee as a way to support me if anyone would like to. https://www.buymeacoffee.com/nullifu <3\nALL TECHNIQUES IN THE GAME ARE INCLUDED IN PVP, BALANCING IS NOT FINAL ON ANYTHING. I WILL MONITOR IT OVER THE WEEK AND MAKE CHANGES IF NEEDED."
				},
				{
					name: "Added All quotes from jjk bot quote event. + 350 of my own!",
					value: "\u200b"
				},
				{
					name: "Default Settings",
					value: "Show Spoilers: False\nAccept Trades: True\nShow Alerts: True\npvpable: True"
				}
			]
		}
	]

	// Creating an embed for the update information
	const updateEmbed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle(recentUpdates[0].version)
		.setDescription(`Released on: **${recentUpdates[0].date}**\nHere's what's new:`)
		.setTimestamp()

	updateEmbed.addFields(
		recentUpdates[0].changes.map(change => ({
			name: change.name,
			value: change.value || "\u200b"
		}))
	)

	await interaction.reply({ embeds: [updateEmbed], ephemeral: true })
}

export async function handleSupportCommand(interaction: ChatInputCommandInteraction) {
	await interaction.reply({ content: "https://discord.gg/wmVyBpqWgs", ephemeral: true })
}

export async function handleLookupCommand(interaction) {
	const itemName = interaction.options.getString("name").toLowerCase().replace(/\s+/g, "_")

	const item = lookupItems.find(i => i.name.toLowerCase().replace(/\s+/g, "_") === itemName)

	if (!item) {
		await interaction.reply({ content: `No item found with the name "${itemName}".`, ephemeral: true })
		return
	}

	const embed = new EmbedBuilder().setTitle(item.name).setDescription(item.description).setColor("#0099ff")

	if (item.effect) {
		embed.addFields({ name: "Effect", value: item.effect })
	}

	await interaction.reply({ embeds: [embed], ephemeral: true })
}

function findTechniqueClan(techniqueName: string): string {
	for (const clanName in INVENTORY_CLAN) {
		if (
			INVENTORY_CLAN[clanName].some(
				tech => simplifyTechniqueName(tech.name) === simplifyTechniqueName(techniqueName)
			)
		) {
			return clanName
		}
	}
	return ""
}

function simplifyTechniqueName(fullName: string): string {
	const nameMap = {
		"Ten Shadows Technique: Eight-Handled Sword Divergent Sila Divine General Mahoraga": "Divine General Mahoraga"
	}
	return nameMap[fullName] || fullName
}

function formatRCTStats(rctStats) {
	if (!rctStats || !rctStats.obtained) {
		return "RCT Not Obtained"
	}
	return `**Level**: ${rctStats.level}\n**Health Healed**: ${rctStats.healthHealed}\n**Experience**: ${rctStats.experience}`
}

export async function handleJujutsuStatsCommand(interaction) {
	const targetUser = interaction.options.getUser("user") || interaction.user
	const userId = targetUser.id

	try {
		await updateUserFavoriteCommand(interaction.user.id, "Jujutsu Stats")
		const userDomain = await getUserDomain(userId)
		const userMaxHealth = await getUserMaxHealth(userId)
		const honors = (await getUserHonours(userId)) || []
		const transform = await getUserTransformation(userId)
		const userHeavenlyRestriction = await checkUserHasHeavenlyRestriction(userId)
		const awakening = await getUserAwakening(userId)
		const rctStats = await getUserReverseCursedTechniqueStats(userId)

		let userTechniques = await (userHeavenlyRestriction
			? getUserActiveHeavenlyTechniques(userId)
			: getUserActiveTechniques(userId))

		userTechniques = Array.isArray(userTechniques) ? userTechniques : []

		const userTechniquesWithClan = userTechniques.map(technique => {
			return {
				name: technique,
				clan: findTechniqueClan(technique) || "Unknown"
			}
		})

		// Group techniques by clan
		const techniquesByClan = userTechniquesWithClan.reduce((acc, technique) => {
			acc[technique.clan] = acc[technique.clan] || []
			acc[technique.clan].push(technique.name)
			return acc
		}, {})

		let techniquesDisplay = Object.keys(techniquesByClan)
			.sort()
			.map(clan => {
				const techniques = techniquesByClan[clan]
					.sort()
					.map(technique => `> • ${simplifyTechniqueName(technique)}`)
				return `**${clan}**\n${techniques.join("\n")}`
			})
			.join("\n\n")

		// Add domain expansion if present at the top
		if (userDomain && userDomain !== "None") {
			techniquesDisplay = `**Domain Expansion: ${userDomain}**\n\n` + techniquesDisplay
		}

		// Construct the embed
		const embed = new EmbedBuilder()
			.setTitle(`${targetUser.username}'s Jujutsu Profile`)
			.setColor("#4B0082")
			.setDescription("Dive into the depth of your Jujutsu prowess. Here are your current stats, sorcerer.")
			.addFields(
				{ name: "🏅 Honours", value: honors.length > 0 ? honors.join(", ") : "None", inline: true },
				{ name: "🔥 Awakening", value: awakening || "Stage Zero", inline: true },
				{ name: "💓 Health", value: userMaxHealth.toString(), inline: true },
				{
					name: "⚖️ Heavenly Restriction",
					value: userHeavenlyRestriction ? "Active" : "Inactive",
					inline: true
				},
				{ name: "🔪 Transformation", value: transform || "None", inline: false },
				{ name: "💪 RCT Stats", value: formatRCTStats(rctStats) || "Not Obtained", inline: false },
				{ name: "🌀 Techniques & Domain Expansion", value: techniquesDisplay || "None", inline: false }
			)
			.setFooter({ text: getRandomQuote() })
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("selectMenu")
			.setPlaceholder("Select an option")
			.addOptions([
				{
					label: "Main Profile",
					description: "View your main profile",
					value: "mainProfile"
				},
				{
					label: "Clan Profile",
					description: "View clan data",
					value: "clanProfile"
				},
				{
					label: "Gamblers Profile",
					description: "View your gambling data!",
					value: "gamblerProfile"
				},
				{
					label: "Active Effects",
					description: "View your active effects",
					value: "activeProfile"
				}
			])

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

		await interaction.reply({ embeds: [embed], components: [row] })

		const filter = i => i.customId === "selectMenu" && i.user.id === interaction.user.id
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

		collector.on("collect", async i => {
			if (i.isStringSelectMenu()) {
				const selectedOption = i.values[0]

				if (selectedOption === "mainProfile") {
					await i.update({ embeds: [embed] })
				} else if (selectedOption === "gamblerProfile") {
					const gamblerEmbed = await buildGamblersProfile(userId, interaction)
					await i.update({ embeds: [gamblerEmbed] })
				} else if (selectedOption === "activeProfile") {
					const activeEffectsEmbed = await handleEffectEmbed(userId)
					await i.update({ embeds: [activeEffectsEmbed] })
				} else if (selectedOption === "clanProfile") {
					const clanEmbed = await handleClanDataEmbed(userId)
					await i.update({ embeds: [clanEmbed] })
				} else if (selectedOption === "shikiProfile") {
					const shikiEmbed = await handleShikigamiEmbed(userId)
					await i.update({ embeds: [shikiEmbed] })
				}
			}
		})
		collector.stop
	} catch (error) {
		logger.error("Error handling JujutsuStatsCommand:", error)
		await interaction.reply({
			content: "An unexpected error occurred while retrieving your Jujutsu profile. Please try again later.",
			ephemeral: true
		})
		await postCommandMiddleware
	}
}

// guide command
export async function handleGuideCommand(interaction) {
	const topic = interaction.options.getString("topic")

	switch (topic) {
		default: {
			const guideEmbed = new EmbedBuilder()
				.setAuthor({
					name: "Trello Credits: AtomicApex, Raix.",
					iconURL:
						"https://media.discordapp.net/attachments/1186763353494925404/1231808785090220042/Snapinsta.app_391524227_1278065773589666_2455587178141689864_n_1080.jpg?ex=66384e54&is=6625d954&hm=d208ac0a522cfc6446265782671b04d4207dd6fd6c102d779f8956ba25d9bec6&=&format=webp&width=554&height=554"
				})
				.setColor("#0099ff")
				.setTitle("Jujutsu Kaisen Bot Guide")
				.setDescription("JJK Bot, Trello.")
				.addFields({
					name: "Trello Board",
					value: "You can find our Trello board at https://trello.com/b/JCCsLUX1/jjk-bot."
				})
				.setFooter({ text: getRandomQuote() })

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
		}
	}
}

export async function handleLeaderBoardCommand(interaction) {
	try {
		const choice = interaction.options.getString("type")

		const leaderboardEmbed = new EmbedBuilder().setColor("#FFA500").setTimestamp()

		const rankEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

		if (choice === "xp") {
			const userExperiences = await getAllUserExperience()
			userExperiences.sort((a, b) => b.experience - a.experience)
			leaderboardEmbed
				.setTitle("🏆  Experience Leaderboard 🏆 ")
				.setDescription("Here are the top users with the most experience:")
			userExperiences.slice(0, 10).forEach((user, index) => {
				const rank = rankEmojis[index] ? rankEmojis[index] : index + 1
				const text = `${rank} <@${user.id}> - **${user.experience} XP**`
				leaderboardEmbed.addFields({ name: "\u200B\n", value: text, inline: false })
			})
		} else if (choice === "wealth") {
			const userBalances = await getAllUsersBalance()

			leaderboardEmbed
				.setTitle("💰 Wealth Leaderboard 💰")
				.setDescription("Here are the top users with the most wealth:")

			userBalances.forEach((user, index) => {
				const rank = rankEmojis[index] ? rankEmojis[index] : index + 1
				const text = `${rank} <@${user.id}> - **$${user.balance.toLocaleString()}**`
				leaderboardEmbed.addFields({ name: "\u200B\n", value: text, inline: false })
			})
		} else if (choice === "fight") {
			const monthlyFightsWonLeaderboard = await getMonthlyFightsWonLeaderboard()

			monthlyFightsWonLeaderboard.sort((a, b) => b.monthlyFightsWon - a.monthlyFightsWon)

			leaderboardEmbed
				.setTitle("⚔️ Monthly Fights Won Leaderboard ⚔️")
				.setDescription("Here are the top fighters for this month:")

			monthlyFightsWonLeaderboard.slice(0, 10).forEach((user, index) => {
				const rank = rankEmojis[index] ? rankEmojis[index] : index + 1
				const text = `${rank} <@${user.userId}> - **${user.monthlyFightsWon} fights won**`

				leaderboardEmbed.addFields({ name: "\u200B\n", value: text, inline: false })
			})
		} else {
			await interaction.reply("Invalid choice! Please choose between 'XP', 'Wealth', or 'Fight'.")
			return
		}

		await interaction.reply({ embeds: [leaderboardEmbed] })
	} catch (error) {
		logger.error("Failed to handle leaderboard command:", error)
		await interaction.reply("There was an error trying to execute that command!")
	}
}

export async function handleVoteCommand(interaction) {
	await updateUserFavoriteCommand(interaction.user.id, "Vote")
	const voteEmbed = new EmbedBuilder()
		.setColor("#55AAFF")
		.setTitle("⭐ Vote for Our Bot! ⭐")
		.setDescription("Help us grow and improve by voting:")
		.setThumbnail(
			"https://cdn.discordapp.com/attachments/1094302755960664255/1225954487739355176/helpprofile.jpg?ex=66230217&is=66108d17&hm=9f851af9539aee1912faece3236d4c222617bec567b5bf952448abe7881a36fb&"
		)
		.setTimestamp()
		.setFooter({ text: "Your vote matters!" })

	// Buttons with external emojis for attention
	const voteButtonTopGG = new ButtonBuilder()
		.setLabel("Vote on Top.gg + Free Rewards!")
		.setStyle(ButtonStyle.Link)
		.setURL("https://top.gg/bot/991443928790335518/vote")
		.setEmoji("🚀")
	const TOPGGReview = new ButtonBuilder()
		.setLabel("Drop a Review on Top.gg!")
		.setStyle(ButtonStyle.Link)
		.setURL("https://top.gg/bot/991443928790335518#reviews")
		.setEmoji("😍")
	const discordbotlistme = new ButtonBuilder()
		.setLabel("Vote on Botlist.me")
		.setStyle(ButtonStyle.Link)
		.setURL("https://botlist.me/bots/991443928790335518/vote")
		.setEmoji("👍")
	const botlistmereview = new ButtonBuilder()
		.setLabel("Drop a Review on Botlist.me!")
		.setStyle(ButtonStyle.Link)
		.setURL("https://botlist.me/bots/991443928790335518/review")
		.setEmoji("📢")

	const row = new ActionRowBuilder().addComponents(voteButtonTopGG, discordbotlistme, TOPGGReview, botlistmereview)

	await interaction.reply({ embeds: [voteEmbed], components: [row], ephemeral: true })
}
async function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
export const activeCollectors = new Map()

const specialBosses = ["Yuta Okkotsu", "Disaster Curses", "Satoru Gojo Limit-Broken"]

export async function handleFightCommand(interaction: ChatInputCommandInteraction) {
	const playerHealth1 = await getUserMaxHealth(interaction.user.id)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let userTechniquesFight = new Map<string, any>()

	await updateUserHealth(interaction.user.id, playerHealth1)
	await updateUserFavoriteCommand(interaction.user.id, "Fight")

	await interaction.deferReply()

	const allBosses = await getBosses(interaction.user.id)
	const unlockedBosses = await getUserUnlockedBosses(interaction.user.id)

	if (allBosses.length === 0) {
		logger.error("No bosses found in the database.")
		await interaction.editReply({ content: "No bosses found for your grade, Try increasing your grade!" })
		return
	}

	const userAwakening = await getUserAwakening(interaction.user.id)
	const userAwakeningStage = userAwakening ? userAwakening.split(" ")[1] : "Stage Zero"

	let randomOpponent
	let attempts = 0

	do {
		const filteredBosses = allBosses.filter(
			boss =>
				(boss.awakeningStage === userAwakeningStage ||
					boss.awakeningStage === getNextAwakeningStage(userAwakeningStage)) &&
				(!specialBosses.includes(boss.name) || unlockedBosses.includes(boss.name))
		)

		if (filteredBosses.length === 0) {
			logger.error("No suitable bosses found for the user. Starting random selection..")
			const randomIndex = Math.floor(Math.random() * allBosses.length)
			randomOpponent = allBosses[randomIndex]
			break
		}

		const randomIndex = Math.floor(Math.random() * filteredBosses.length)
		randomOpponent = filteredBosses[randomIndex]
		attempts++
	} while (attempts < allBosses.length)

	if (!randomOpponent) {
		await interaction.editReply({
			content: "Couldn't find a suitable boss for you to fight. Try unlocking more bosses!"
		})
		return
	}
	//
	const cursedEnergyPurple = parseInt("#8A2BE2".replace("#", ""), 16)
	//
	const playerHealth = await getUserMaxHealth(interaction.user.id)

	const rctStats = await getUserReverseCursedTechniqueStats(interaction.user.id)
	const rctlevel = rctStats ? "RCT Unlocked" : "🔒 RCT Not Unlocked"
	//
	const hasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(interaction.user.id)
	//
	const userTechniques = hasHeavenlyRestriction
		? await getUserActiveHeavenlyTechniques(interaction.user.id)
		: await getUserActiveTechniques(interaction.user.id)
	//
	const transformname = await getUserTransformation(interaction.user.id)
	//
	//
	const domainname = await getUserDomain(interaction.user.id)

	// Check for duplicate techniques
	const techniqueCounts = userTechniques.reduce((counts, techniqueName) => {
		counts[techniqueName] = (counts[techniqueName] || 0) + 1
		return counts
	}, {})

	const duplicateTechniques = Object.keys(techniqueCounts).filter(techniqueName => techniqueCounts[techniqueName] > 1)

	if (duplicateTechniques.length > 0) {
		await interaction.followUp({
			content: `You have equipped duplicate techniques: ${duplicateTechniques.join(", ")}. Please fix this before proceeding, /technique unequip <technique>`
		})
		return
	}

	const techniqueOptions =
		userTechniques && userTechniques.length > 0
			? userTechniques.reduce((options, techniqueName, index) => {
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
			: []

	const battleOptions = [
		{
			label: "Domain Expansion",
			value: "domain",
			description: domainname || "🔒 Domain Not Unlocked",
			emoji: {
				name: "1564maskedgojode",
				id: "1220626413141622794"
			}
		},
		{
			label: "Reverse Cursed Technique",
			value: "rct",
			description: rctlevel,
			emoji: {
				name: "rct",
				id: "1221789476984979507"
			}
		},
		{
			label: "Transform",
			value: "transform",
			description: transformname || "No transformation available",
			emoji: {
				name: "a:blueflame",
				id: "990539090418098246"
			}
		},
		...techniqueOptions
	]

	const selectMenu = new SelectMenuBuilder()
		.setCustomId("select-battle-option")
		.setPlaceholder("Choose your technique")
		.addOptions(battleOptions)

	const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu)

	// Create embed
	const primaryEmbed = new EmbedBuilder()
		.setColor(cursedEnergyPurple)
		.setTitle("Cursed Battle!")
		.setDescription(`You're facing **${randomOpponent.name}**! Choose your technique wisely.`)
		.setImage(randomOpponent.image_url)
		.addFields(
			{ name: "Boss Health", value: `:heart: ${randomOpponent.current_health.toString()}`, inline: true },
			{ name: "Boss Grade", value: `${randomOpponent.grade}`, inline: true },
			{ name: "Boss Awakening", value: `${randomOpponent.awakeningStage}` || "None", inline: true },
			{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true }
		)
		.addFields(
			{
				name: "Boss Health Status",
				value: generateHealthBar(randomOpponent.current_health, randomOpponent.max_health),
				inline: false
			},
			{
				name: "Player Health Status",
				value: generateHealthBar(playerHealth, playerHealth1),
				inline: true
			}
		)
		.addFields(
			{ name: "Enemy Technique", value: "*Enemy technique goes here*", inline: false },
			{ name: "Status Effect Enemy", value: "None", inline: true },
			{ name: "Status Effect Player", value: "None", inline: true }
		)

	if (randomOpponent.awakeningStage === "Stage Five") {
		primaryEmbed.setFooter({ text: "Be careful, There's no information on this boss.." })
	}

	await interaction.editReply({
		embeds: [primaryEmbed],
		components: [row]
	})

	const battleOptionSelectMenuCollector = interaction.channel.createMessageComponentCollector({
		filter: inter => inter.customId === "select-battle-option" && inter.message.interaction.id === interaction.id,
		componentType: ComponentType.StringSelect,
		time: 300000
	})

	battleOptionSelectMenuCollector.on("collect", async collectedInteraction => {
		await collectedInteraction.deferUpdate()
		if (collectedInteraction.user.id !== interaction.user.id) {
			await collectedInteraction.followUp({
				content: "Nuh uh! This is not your battle!",
				ephemeral: true
			})
			return
		}

		if (collectedInteraction.user.id !== interaction.user.id) return
		const selectedValue = collectedInteraction.values[0]
		let playerHealth = await getUserHealth(collectedInteraction.user.id)

		logger.info("Selected value:", selectedValue)
		if (selectedValue === "domain") {
			logger.info("Domain expansion selected.")
			if (domainActivationState.get(contextKey)) {
				await collectedInteraction.followUp({
					content: "You can only activate your domain once per fight.",
					ephemeral: true
				})
				return
			}

			try {
				const hasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(interaction.user.id)

				if (hasHeavenlyRestriction) {
					await collectedInteraction.followUp({
						content: "Your Heavenly Restriction negates the use of domain expansion.",
						ephemeral: true
					})
					return
				}

				const domainInfo = await getUserDomain(interaction.user.id)
				if (!domainInfo) {
					await collectedInteraction.followUp({
						content: "You do not have a domain unlocked yet.",
						ephemeral: true
					})
					return
				}

				const domainObject = DOMAIN_EXPANSIONS.find(domain => domain.name === domainInfo)
				if (!domainObject) {
					logger.error("Invalid domain found in the database.")
					return
				}
				domainActivationState.set(contextKey, true)

				if (domainInfo === "Idle Deaths Gamble") {
					const feverMeter = 0
					const maxFeverMeter = 100

					const feverMeterBar = createFeverMeterBar(feverMeter, maxFeverMeter)

					const domainEmbed = new EmbedBuilder()
						.setColor("Blue")
						.setTitle(`Domain Expansion... ${domainInfo}`)
						.setImage(domainObject.open_image_URL)
						.setDescription(`${interaction.user.username} has opened their domain ${domainInfo}!`)
						.addFields({
							name: "Fever Meter",
							value: feverMeterBar,
							inline: false
						})

					await collectedInteraction.editReply({ embeds: [domainEmbed], components: [row] })

					const userId = interaction.user.id
					idleDeathsGambleStates.set(userId, {
						feverMeter: feverMeter,
						isJackpotMode: false
					})
				} else {
					// embed here
					const domainEmbed = new EmbedBuilder()
						.setColor("Blue")
						.setTitle(`${randomOpponent.name}  I'll show you real jujutsu..`)
						.setDescription(`Domain Expansion... ${domainInfo}`)
						.addFields({
							name: `${interaction.user.username}`,
							value: "USES THERE DOMAIN EXPANSION!",
							inline: false
						})

					//add image
					if (domainObject.open_image_URL) {
						domainEmbed.setImage(domainObject.open_image_URL)
					}
					activeDomainExpansions.set(interaction.user.id, domainObject.name)

					await collectedInteraction.editReply({ embeds: [domainEmbed], components: [] })

					await new Promise(resolve => setTimeout(resolve, 2000))

					const domainObjec1t = DOMAIN_EXPANSIONS.find(domain => domain.name === domainInfo)

					if (domainObjec1t && domainObjec1t.statusEffect) {
						await applyStatusEffect(collectedInteraction.user.id, domainObjec1t.statusEffect)
					}

					const statusEffectsValue = await fetchAndFormatStatusEffects(collectedInteraction.user.id)

					const updatedEmbed = new EmbedBuilder()
						.setColor("Blue")
						.setTitle("The battle continues!")
						.setDescription(`${interaction.user.username} has opened their domain ${domainInfo}!`)
						.addFields(
							{
								name: "Boss Health",
								value: `:heart: ${randomOpponent.current_health.toString()}`,
								inline: true
							},
							{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true },
							{
								name: "Boss Health Status",
								value: generateHealthBar(randomOpponent.current_health, randomOpponent.max_health)
							},
							{ name: "Enemy Technique", value: "*Enemy technique goes here*", inline: false },
							{ name: "Status Effect Player", value: statusEffectsValue, inline: true }
						)

					if (domainObjec1t.image_URL) {
						updatedEmbed.setImage(domainObjec1t.image_URL)
					}
					await collectedInteraction.editReply({ embeds: [updatedEmbed], components: [row] })

					//
					const playerGradeData = await getUserGrade(interaction.user.id)
					const playerGradeString = playerGradeData
					const userId = interaction.user.id

					const baseDamage = await calculateDamage(playerGradeString, userId, true)
					const extraDomainDamage = 30
					const totalDamage = baseDamage + extraDomainDamage
					// update boss hp

					let currentBossHealth = bossHealthMap.get(interaction.user.id) || randomOpponent.max_health
					currentBossHealth = Math.max(0, currentBossHealth - totalDamage)
					bossHealthMap.set(interaction.user.id, currentBossHealth)

					// is boss dead?
					if (randomOpponent.current_health <= 0) {
						if (randomOpponent.name === "Satoru Gojo") {
							await exportTheHonoredOne(interaction, randomOpponent, primaryEmbed, row, playerHealth)
						} else if (randomOpponent.name === "Sukuna") {
							await exportTheCursedOne(interaction, randomOpponent, primaryEmbed, row, playerHealth)
						} else if (randomOpponent.name === "Itadori") {
							await exportTheFraud(interaction, randomOpponent, primaryEmbed, row, playerHealth)
						} else if (randomOpponent.name === "Yuta Okkotsu") {
							await exportRika(interaction, randomOpponent, primaryEmbed, row, playerHealth)
						} else if (randomOpponent.name === "Hakari Kinji") {
							await exportGambler(interaction, randomOpponent, primaryEmbed, row, playerHealth)
						} else if (randomOpponent.name === "Zenin Toji") {
							await exportReincarnation(interaction, randomOpponent, primaryEmbed, row, playerHealth)
						}

						domainActivationState.set(contextKey, false)
						activeCollectors.delete(interaction.user.id)

						// reset health
						bossHealthMap.delete(interaction.user.id)

						await handleBossDeath(interaction, primaryEmbed, row, randomOpponent)
					}
				}
			} catch (error) {
				logger.error("Error during fight command:", error)
				await collectedInteraction.followUp({
					content: "An error occurred during the fight. Please try again later.",
					ephemeral: true
				})
			}
		} else if (selectedValue === "transform") {
			logger.info("Transformation selected.")
			if (transformationState.get(contextKey)) {
				await collectedInteraction.followUp({
					content: "You can only transform once per fight.",
					ephemeral: true
				})
				return
			}

			try {
				const transformationInfo = await getUserTransformation(interaction.user.id)
				if (!transformationInfo) {
					await collectedInteraction.followUp({
						content: "You do not have a transformation unlocked yet.",
						ephemeral: true
					})
					return
				}

				const transformationObject = TRANSFORMATIONS.find(
					transformation => transformation.name === transformationInfo
				)
				if (!transformationObject) {
					logger.error("Invalid transformation found in the database.")
					return
				}
				transformationState.set(contextKey, true)
				// embed here
				const transformationEmbed = new EmbedBuilder()
					.setColor("Blue")
					.setTitle("Transformation!")
					.setDescription(`Transformation: ${transformationInfo}`)
					.addFields({
						name: `${interaction.user.username}`,
						value: "USES THERE TRANSFORMATION!",
						inline: false
					})
					//add image
					.setImage(transformationObject.image)
				await collectedInteraction.editReply({ embeds: [transformationEmbed], components: [] })
				//
				await new Promise(resolve => setTimeout(resolve, 2000))

				if (transformationObject && transformationObject.effects) {
					await applyStatusEffect(collectedInteraction.user.id, transformationObject.effects)
				}
				const statusEffectsValue = await fetchAndFormatStatusEffects(collectedInteraction.user.id)

				const nutembed = new EmbedBuilder()
					.setColor("Blue")
					.setTitle("The battle continues!")
					.setDescription(`${interaction.user.username} has transformed into ${transformationInfo}!`)
					.addFields(
						{
							name: "Boss Health",
							value: `:heart: ${randomOpponent.current_health.toString()}`,
							inline: true
						},
						{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true },
						{ name: "Transformation: ", value: `${transformationInfo}`, inline: true },

						{
							name: "Boss Health Status",
							value: generateHealthBar(randomOpponent.current_health, randomOpponent.max_health)
						},
						{ name: "Enemy Technique", value: "*Enemy technique goes here*", inline: false },
						{ name: "Status Effect Player", value: statusEffectsValue, inline: false }
					)
				if (transformationObject.image) {
					nutembed.setImage(transformationObject.image)
				}
				transformationState.set(contextKey, false)

				//
				await collectedInteraction.editReply({ embeds: [nutembed], components: [row] })
			} catch (error) {
				logger.error("Error during fight command:", error)
				await collectedInteraction.followUp({
					content: "An error occurred during the fight. Please try again later.",
					ephemeral: true
				})
			}
		} else if (selectedValue === "rct") {
			logger.info("Reverse Cursed Technique selected.")

			try {
				const rctStats = await getUserReverseCursedTechniqueStats(interaction.user.id)
				if (!rctStats || !rctStats.obtained) {
					await collectedInteraction.followUp({
						content: "You do not have Reverse Cursed Technique unlocked yet.",
						ephemeral: true
					})
					return
				}

				const currentHealth = await getUserHealth(interaction.user.id)
				const maxHealth = await getUserMaxHealth(interaction.user.id)

				if (currentHealth >= maxHealth) {
					await collectedInteraction.followUp({
						content: "You already have maximum health and cannot use Reverse Cursed Technique.",
						ephemeral: true
					})
					return
				}
				const rctLevel = rctStats.level
				let healthRegeneration = rctLevel * 10
				if (rctLevel === 0) {
					healthRegeneration = 20
				}
				let newHealth = currentHealth + healthRegeneration
				if (newHealth > maxHealth) {
					newHealth = maxHealth
				}

				await updateUserHealth(interaction.user.id, newHealth)

				rctStats.healthHealed += healthRegeneration
				await updateUserReverseCursedTechniqueStats(interaction.user.id, rctStats)

				// Gain RCT experience
				const rctExperience = Math.floor(Math.random() * (60 - 10 + 1) + 10)
				await updateUserReverseCursedTechniqueExperience(interaction.user.id, rctExperience)

				// Check if RCT experience is 100 and level up
				if (rctExperience >= 100) {
					rctStats.level += 1
					await updateUserReverseCursedTechniqueStats(interaction.user.id, rctStats)
				}

				rctState.set(contextKey, true)

				// Create and send the embed message
				const embed = new EmbedBuilder()
					.setColor("#1f8b4c")
					.setTitle("Reverse Cursed Technique Activated!")
					.setDescription(`You have regenerated ${healthRegeneration} health`)
					.addFields({ name: "New Health", value: `:blue_heart: ${newHealth.toString()}`, inline: true })
					.setImage("https://storage.googleapis.com/jjk_bot_personal/ezgif-5-5cfb8a9651.gif")
					.setFooter({ text: `RCT Level: ${rctLevel}` })

				await collectedInteraction.editReply({ embeds: [embed], components: [] })

				await new Promise(resolve => setTimeout(resolve, 3000))

				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
			} catch (error) {
				console.error("Error during RCT activation:", error)
				await collectedInteraction.followUp({
					content: "An error occurred while trying to use your Reverse Cursed Technique.",
					ephemeral: true
				})
			}
		} else {
			// get boss hp
			const currentBossHealth = bossHealthMap.get(interaction.user.id) || randomOpponent.max_health

			// grade
			const playerGradeData = await getUserGrade(interaction.user.id)
			const playerGradeString = playerGradeData

			// calculate damage
			let damage = calculateDamage(playerGradeString, interaction.user.id, true)

			if (selectedValue === "Ten Shadows Technique: Divergent Sila Divine General Mahoraga") {
				const isMahoragaSummoned =
					userTechniquesFight.get(`${collectedInteraction.user.id}_mahoraga_summoned`) || false

				if (isMahoragaSummoned) {
					await collectedInteraction.followUp({
						content: "You have already summoned Mahoraga in this fight. You cannot summon him again.",
						ephemeral: true
					})
					return
				}

				const result = await executeMahoraga({
					playerHealth: playerHealth,
					bossHealthMap: bossHealthMap,
					randomOpponent: randomOpponent,
					shikigamiName: "Mahoraga",
					collectedInteraction,
					techniqueName: selectedValue,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed,
					row
				})

				if (typeof result !== "number") {
					userTechniquesFight = result.userTechniques
					damage = result.damage
				}
			} else if (selectedValue === "Ten Shadows Technique: Divine Dogs") {
				const result = await executeDivineDogsTechnique({
					bossHealthMap: bossHealthMap,
					randomOpponent: randomOpponent,
					collectedInteraction,
					techniqueName: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed,
					row,
					activeShikigami
				})

				if (typeof result !== "number") {
					userTechniquesFight = result.userTechniquesFight
					damage = result.damage
				}
			} else if (selectedValue === "Ten Shadows Technique: Nue") {
				const result = await executeNue({
					bossHealthMap: bossHealthMap,
					randomOpponent: randomOpponent,
					collectedInteraction,
					techniqueName: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed,
					row,
					activeShikigami
				})

				if (typeof result !== "number") {
					userTechniquesFight = result.userTechniquesFight
					damage = result.damage
				}
				//
			} else if (selectedValue === "Atomic") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 90,
					imageUrl: "https://media1.tenor.com/m/Y5S-OJqsydUAAAAd/test.gif",
					description: "I...AM....ATOMIC",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Imaginary Technique: White") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 28,
					imageUrl: "https://media1.tenor.com/m/jG4ODQWzWG0AAAAC/jidion-guy-milk-in-car.gif",
					description: "Guys...",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Wonder Of U") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 28,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-3-35ad74a53c.gif",
					description: "Wonder of U: I am the calamity.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Nah I'd Lose") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 90,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/maxresdefault.jpg",
					description: "Don't worry, I'll lose.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Hollow Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 4,
					imageUrl: "https://media1.tenor.com/m/ZdRh7cZgkGIAAAAC/hollow-purple.gif",
					description: `I guess i can play a little rough. ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Star Rage: Virtual Mass") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 8,
					imageUrl: "https://staticg.sportskeeda.com/editor/2023/12/73a1e-17035028644330-1920.jpg",
					description: `That's my technique! ${randomOpponent.name} It's mass <3`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				await applyVirtualMass(collectedInteraction.user.id)
			} else if (selectedValue === "Disaster Curses: Full Flux") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 7,
					imageUrl: "https://media1.tenor.com/m/QHLZohdZiXsAAAAd/geto-suguru.gif",
					description: "Open the gate between the worlds... Lend me your power. Disaster Curses: Full Flux.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Lapse Blue X Red: Combo") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-7-99cec3f18d.gif",
					description: "I'll have to finish this quickly..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Close-up Reversal Red") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 19,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/6fcda5f38ec5cd37e6d16e4428ce927f.jpg",
					description: "Greetings!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Vengance Blade: Executioners Blade") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://media1.tenor.com/m/wmZxEiKZRXgAAAAd/yuta-cursed-energy.gif",
					description: "I don't like people who hurt my friends...",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Maximum Technique: Blue") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://media1.tenor.com/m/LXmbPm21NagAAAAC/gojo-starou-satoru-gojo.gif",
					description: "Cursed Technique Lapse, Maximum Output.. BLUE!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Maximum Technique: Red") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 14,
					imageUrl: "https://media1.tenor.com/m/iyzTuWFxU2cAAAAd/gojo-gojo-satoru.gif",
					description: "Reversal.. Red",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Maximum Technique: Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 18,
					imageUrl: "https://media1.tenor.com/m/uxzlDwND2RkAAAAd/roxo-hollow-purple.gif",
					description:
						"Hidden technique, Awoken through the power of the Six Eyes. Maximum Technique: Purple.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Hollow Purple: Nuke") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://media1.tenor.com/m/Hx77RI9lzY4AAAAC/hollow-nuke-hollow-purple.gif",
					description: "Polarized Light.. Crow ",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Prayer Song") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 12,
					imageUrl:
						"https://cdn.discordapp.com/attachments/1094302755960664255/1225688422551785544/image.png?ex=66220a4c&is=660f954c&hm=df32c017b95d2a118b22ff2999990e6ab413e14acbe354b059bee5ced017db16&",
					description: "**You synchronize with your opponent's movements... it's absolutely chilling.**",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				await applyPrayerSongEffect(collectedInteraction.user.id)
				//
			} else if (selectedValue === "Re-imagined BLACK FLASH") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 20,
					imageUrl:
						"https://storage.googleapis.com/jjk_bot_personal/yuji-lands-black-flash-on-sukuna-jujutsu-kaisen-jjk-256%20%5BMConverter.eu%5D.png",
					description: "KOKU..SEN!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Piercing Blood") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/Yuji_using_Piercing_Blood.png",
					description: "Wow you're really strong.. I'm gonna have to go all out.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Maximum: METEOR") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl: "https://media1.tenor.com/m/pNvg0g4K4VMAAAAd/sukuna-skate-sukuna-skating.gif",
					description: `ILL BURN YOU TO A CRISP ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Solo Forbidden Area") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 30,
					imageUrl:
						"https://64.media.tumblr.com/bf4c7320f2fcc0743c911ea174a3a7f2/8b2aaf7d220d5701-c0/s1280x1920/57858721add8c560100397b818093bc8a45d85da.jpg",
					description: "A forbidden technique that can only be used by a single person. Solo Forbidden Area.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Zenin Style: Playful Cloud: STRIKE") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 6,
					imageUrl: "https://media1.tenor.com/m/BufoLoGxC9sAAAAd/toji-dagon.gif",
					description: `PERISH ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Flame Arrow") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 4,
					imageUrl:
						"https://cdn.discordapp.com/attachments/1186763190835613748/1226088236397629562/ezgif-2-b2f2996757.gif?ex=66237ea7&is=661109a7&hm=e7eeb0b3305213ae20f0fee49b77dbfc873ca875e61dbd22e629543b33f2c0bf&",
					description: `Fuga.. Don't worry. I won't do anything petty like revealing my technique.. Now.. Arm yourself. ${randomOpponent.name} `,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Jackpot: Strike") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl: "https://media1.tenor.com/m/Pi5w2UFZWO0AAAAC/hakari-kinji-kinji-hakari.gif",
					description: `TURN UP THE VOLUME ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "World Cutting Slash") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 8,
					imageUrl:
						"https://cdn.discordapp.com/attachments/1094302755960664255/1231296159050633349/ezgif-5-4e8c15c666.gif?ex=66254d68&is=6623fbe8&hm=229aa5f92f55cb990cea75086e49ed65d89a0cff2d85a9a0a0405c35f91174b4&",
					description: `Dissect! ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Six Point Palm") {
				const requiredTier = [1, 2]
				const requiredClanName = "Limitless"
				const rareChanceProbability = 0.05

				const userHasRequiredDetails = await hasRequiredClanDetails(
					collectedInteraction.user.id,
					requiredTier,
					requiredClanName
				)
				const rareChanceSuccess = rareChance(rareChanceProbability)

				let techniqueParams

				if (rareChanceSuccess) {
					techniqueParams = {
						collectedInteraction,
						techniqueName: selectedValue,
						damageMultiplier: 70,
						imageUrl: "https://media1.tenor.com/m/gTzL4bykSakAAAAC/jujutsu-kaisen0-battle.gif",
						description:
							"You're six eyes begin to glow.. You're not sure what's happening.. **Unleashed Technique: Six Point Palm**",
						fieldValue: selectedValue,
						userTechniques: userTechniquesFight,
						userId: collectedInteraction.user.id,
						primaryEmbed
					}
				} else if (userHasRequiredDetails) {
					techniqueParams = {
						collectedInteraction,
						techniqueName: selectedValue,
						damageMultiplier: 48,
						imageUrl: "https://media1.tenor.com/m/3R9gRhB7FAwAAAAC/gojo-satoru.gif",
						description: "This isn't even my full power.. **Six Point Palm**",
						fieldValue: selectedValue,
						userTechniques: userTechniquesFight,
						userId: collectedInteraction.user.id,
						primaryEmbed
					}
				} else {
					techniqueParams = {
						collectedInteraction,
						techniqueName: selectedValue,
						damageMultiplier: 10,
						imageUrl: "https://media1.tenor.com/m/-I0E2FViCOsAAAAC/gojo-satoru.gif",
						description: "Oh come on now.. You're not even trying.",
						fieldValue: selectedValue,
						userTechniques: userTechniquesFight,
						userId: collectedInteraction.user.id,
						primaryEmbed
					}
				}

				damage = await executeSpecialTechnique(techniqueParams)
			} else if (selectedValue === "Divergent Fist") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl: "https://media1.tenor.com/m/bmrdIgprUAQAAAAC/itadori-yuji-jujutsu-kaisen.gif",
					description: "I'm gonna hit you with everything I've got!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Imaginary Technique: Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 4,
					imageUrl:
						"https://media1.tenor.com/m/whbTruPpfgkAAAAC/imaginary-technique-imaginary-technique-purple.gif",
					description:
						"Sorry, Amanai I'm not even angry over you right now. I bear no grudge against anyone. But the world is just so peaceful.\n **Throughout heaven and earth, I alone am the honored one.**",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Disaster Flames: Full Fire Formation") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 3,
					imageUrl: "https://media1.tenor.com/m/XaWgrCmuguAAAAAC/jjk-jujutsu-kaisen.gif",
					description:
						"Heh, You're strong but you're not the only one who can use cursed energy. **Disaster Flames: Full Fire Formation**",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "The Shoko") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 28,
					imageUrl: "https://media1.tenor.com/m/2sYS0uQV8IIAAAAd/jujutsu-kaisen-jujutsu-kaisen-fade.gif",
					description: "Please the:",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "MAXIMUM: BLACK FLASH") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 6,
					imageUrl: "https://media1.tenor.com/m/FILnhw_rozUAAAAC/black-flash-jujutsu-kaisen.gif",
					description: "**KOKU...SEN!**",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Pure Love: Unleashed Fury") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 5,
					imageUrl: "https://media1.tenor.com/m/ZGlpNTqs6xcAAAAd/jjk0-yuta.gif",
					description: `**How Rude ${randomOpponent.name}, It's pure love.**`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Fist of the Cursed") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 3,
					imageUrl: "https://media1.tenor.com/m/SQQ4VD6igHIAAAAC/yuji-itadori-yuji.gif",
					description: "I'm gonna hit you with everything I've got!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Private Pure Love Train: Jackpot") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 4,
					imageUrl: "https://media1.tenor.com/m/qz4d7FBNft4AAAAC/hakari-hakari-kinji.gif",
					description: "You gamble... AND FORTUNE FAVORS THE BOLD! You deal double damage!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Essence of the Soul: KOKUSEN") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 28,
					imageUrl: "https://media1.tenor.com/m/0EERvw7z2aEAAAAC/jjk-jjk-s2.gif",
					description: "AHHH I TRULY AM.. A CURSED SPIRIT!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Transfiguration: Soul Touch") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 24,
					imageUrl: "https://media1.tenor.com/m/vuHtrhYou2MAAAAC/nobara-face-jujutsu-kaisen.gif",
					description: "Now you're in for it..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Transfiguration: Decay") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 18,
					imageUrl:
						"https://media1.tenor.com/m/0ksR58u2OS4AAAAC/nanami-mahito-transfiguration-soul-touch.gif",
					description: "I'm going to decay you..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Copy: Cleave") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 38,
					imageUrl: "https://static1.srcdn.com/wordpress/wp-content/uploads/2024/02/image0-15.jpeg",
					description: "Copy: Cleave....",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Copy: Cursed Speech: Die") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 36,
					imageUrl:
						"https://media1.tenor.com/m/07LI2_CcWlsAAAAC/jujutsu-kaisen-mang%C3%A1-jujutsu-mang%C3%A1.gif",
					description: "DIE..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				// HEAVENLY RESTRICTION SKILLS
			} else if (selectedValue === "Close Quarters 2-4 Combo") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 14,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/jujutsu-kaisen-maki-zenin.gif",
					description: "You're not getting away that easily..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Playful Cloud: Upright Spear") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 11,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/anime.gif",
					description: "Playful Cloud: Upright Spear!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Bo Staff: Redirection") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 8,
					imageUrl: "https://media1.tenor.com/m/Bjc7LYqdUGcAAAAC/maki-maki-zenin.gif",
					description: "Bo Staff: Redirection..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				// maki realization
			} else if (selectedValue === "Split Soul: Blitz") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 29,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/Maki_stabs_Naoya_from_behind.png",
					description: "Didn't even notice me..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "0.2 Second Strike") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 21,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-4-d1e7fb00df.gif",
					description: "Behind you..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Jogo's Testicle Torsion Technique") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 30,
					imageUrl:
						"https://media1.tenor.com/m/xS-ZEkkyhjgAAAAC/nah-i%27d-win-%E5%91%AA%E8%A1%93%E5%BB%BB%E6%88%A6.gif",
					description: "I'm going to twist your balls off..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Face Smash") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 15,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/Maki_Zenin_vs._The_Kukuru_Unit.png",
					description: "your quite ugly..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})

				// TOJI TECHNIQUES
			} else if (selectedValue === "Inverted Spear Of Heaven: Severed Universe") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 17,
					imageUrl: "https://media1.tenor.com/m/707D3IG5x2wAAAAC/isoh-inverted-spear.gif",
					description: "ISOH: Severed Universe..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Batter") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 11,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/jjk-jujutsu-kaisen.gif",
					description: "hehe slap slap slap",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Mythical Beast Amber") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 24,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/Mythical_Beast_Amber(1).png",
					description: "I'm not going to let you get away with this..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Lightning Discharge") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/Kashimo_sends_electricity_at_Hakari.png",
					description: "I'm going to fry you to a crisp..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Divine Flames") {
				const activeDomain = activeDomainExpansions.get(collectedInteraction.user.id)

				let damageMultiplier = 14
				let imageUrl =
					"https://storage.googleapis.com/jjk_bot_personal/sukuna-holding-out-his-arm-in-front-of-him-engulfed-with-flames-as-he-uses-his-fire-technique-in-jujutsu-kaisen%20%5BMConverter.eu%5D.png"
				let description = `Pathetic.. ${randomOpponent.name}.. I'll burn you to a crisp..`

				if (activeDomain === "Malevolent Shrine") {
					damageMultiplier = 26
					imageUrl = "https://loinew.com/images/zu2JTHJwCd2UrIHoZWgQ1715344184.jpg"
					description = `Pathetic.. ${randomOpponent.name}.. I'll burn you to a crisp..`
				}

				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier,
					imageUrl,
					description,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Nah I'd Win") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 38,
					imageUrl: "https://media1.tenor.com/m/GjlhhOm0vf8AAAAC/gojo-satoru-gojo.gif",
					description: `${randomOpponent.name} says: Would you lose? ${interaction.user.username} says: Nah I'd Win.`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Pure Dismantle") {
				const activeDomain = activeDomainExpansions.get(collectedInteraction.user.id)

				let damageMultiplier = 14
				let imageUrl = "https://media1.tenor.com/m/4cSNEQWHARAAAAAC/cleave-dismantle.gif"
				let description = "shing shing.."

				if (activeDomain === "Malevolent Shrine") {
					damageMultiplier = 30
					imageUrl = "https://storage.googleapis.com/jjk_bot_personal/GDPkQiBWkAALc51.jpg"
					description = "Look Out, Twin Meteors, RECOIL... SCALE OF THE DRAGON!"
				}

				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier,
					imageUrl,
					description,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Fire Extinguisher") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 12,
					imageUrl:
						"https://storage.googleapis.com/jjk_bot_personal/who-winning-this-clash-of-techniques-v0-r97dr3o8a5kb1.png",
					description: "You throw a fire extinguisher at the opponent...? ",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Split Second Slice") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 8,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/toji-toji-fushiguro.gif",
					description: "You can't dodge this one..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				///
			} else if (selectedValue === "Playful Cloud: Rushing Resolute") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 34,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/toji-fushiguro-shibuya-arc-60fps.gif",
					description: "Who do you think you are?",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Bloodlusted: Skull Crush") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 26,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-4-14fc7970f5.gif",
					description: "I'm going to crush your skull..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Split Slap") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 20,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/megumi-fushiguro-fushiguro-megumi.gif",
					description: "Stay down!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Supernova") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 8,
					imageUrl:
						"https://media1.tenor.com/m/CAwOZLfy354AAAAC/jujutsu-kaisen-mang%C3%A1-jujutsu-mang%C3%A1.gif",
					description: "Stay down!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Jackpot: Cargo Fever Rush") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 32,
					imageUrl:
						"https://cdn.discordapp.com/attachments/1232829104378871839/1239800650187931708/ezgif-2-1a5fda8aad.png?ex=66443dd5&is=6642ec55&hm=11b8e9103190532406894213ca6bce3d91f34a5b6815059a59f9661d0f46178e&",
					description: "Gambling is my life..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Jackpot: Full House Kick") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 28,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-3-03d1d5eb78.png",
					description: "Gambling i love it..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Jackpot: Shutter Doors") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 24,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-3-6b5c52f9c2.png",
					description: "Gambling really is my life..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Tusk: Lesson Five..") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 24,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-5-99dcb0b244.gif",
					description: "Arigato.. Gyro.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "D4C: Love Train") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 24,
					imageUrl: "https://media1.tenor.com/m/DsrNAu39v5sAAAAC/d4c-erixander.gif",
					description: "I'm going to have to use my ultimate technique..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Maximum Muscle: Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 24,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-5-3fce776712.gif",
					description: "You know who else is the honored one? Me..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Cry About It") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 24,
					imageUrl: "https://media1.tenor.com/m/6ceiTdJ4eOoAAAAC/cry-about-it.gif",
					description: "cry about it..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Ultimate Donut Strike") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 24,
					imageUrl: "https://media1.tenor.com/m/9LfoU9FnMtkAAAAC/donut-donuts.gif",
					description: "Ultimate Donut Strike..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			}

			await updateUserFavouriteTechnique(interaction.user.id, selectedValue)

			let damageReduction = 1

			if (randomOpponent.awakeningStage === "Stage One") {
				damageReduction = 1.0
			} else if (randomOpponent.awakeningStage === "Stage Two") {
				damageReduction = 0.8
			} else if (randomOpponent.awakeningStage === "Stage Three") {
				damageReduction = 0.7
			} else if (randomOpponent.awakeningStage === "Stage Four") {
				damageReduction = 0.6
			} else if (randomOpponent.awakeningStage === "Stage Five") {
				damageReduction = 0.3
			}

			const userState = idleDeathsGambleStates.get(collectedInteraction.user.id)
			let jackpotMultiplier = 1
			if (userState && userState.isJackpotMode) {
				jackpotMultiplier = 1.5
			}

			const reducedDamage = damage * damageReduction * jackpotMultiplier

			bossHealthMap.set(collectedInteraction.user.id, Math.max(0, currentBossHealth - reducedDamage))
			randomOpponent.current_health = Math.max(0, currentBossHealth - reducedDamage)

			await updateShikigamiField(primaryEmbed, activeShikigami, collectedInteraction.user.id)

			const hasMahoragaAdaptation = userTechniquesFight.has(`${collectedInteraction.user.id}_mahoraga_adaptation`)

			if (hasMahoragaAdaptation) {
				await handleMahoragaAttack(
					collectedInteraction,
					bossHealthMap,
					randomOpponent,
					primaryEmbed,
					row,
					userTechniquesFight
				)
			}

			const fightResult = await handleFightLogic(interaction, randomOpponent, playerGradeString, damage)
			primaryEmbed.setDescription(fightResult)

			if (userState) {
				await updateFeverMeter(collectedInteraction, userState, primaryEmbed)
			}
			primaryEmbed.addFields(
				{
					name: "Boss Health",
					value: `:heart: ${randomOpponent.current_health.toString()}`,
					inline: true
				},
				{
					name: "Damage Dealt",
					value: `:crossed_swords: ${reducedDamage.toString()}`,
					inline: true
				},
				{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true },
				{
					name: "Boss Health Status",
					value: generateHealthBar(randomOpponent.current_health, randomOpponent.max_health)
				}
			)

			await updateShikigamiField(primaryEmbed, activeShikigami, collectedInteraction.user.id)

			// is boss dead?
			if (randomOpponent.current_health <= 0) {
				let transformed = false
				if (randomOpponent.name === "Satoru Gojo") {
					transformed = await exportTheHonoredOne(
						interaction,
						randomOpponent,
						primaryEmbed,
						row,
						playerHealth
					)
				} else if (randomOpponent.name === "Itadori") {
					transformed = await exportTheFraud(interaction, randomOpponent, primaryEmbed, row, playerHealth)
				} else if (randomOpponent.name === "Zenin Toji") {
					transformed = await exportReincarnation(
						interaction,
						randomOpponent,
						primaryEmbed,
						row,
						playerHealth
					)
				} else if (randomOpponent.name === "Yuta Okkotsu") {
					transformed = await exportRika(interaction, randomOpponent, primaryEmbed, row, playerHealth)
				} else if (randomOpponent.name === "Hakari Kinji") {
					transformed = await exportGambler(interaction, randomOpponent, primaryEmbed, row, playerHealth)
				} else if (randomOpponent.name === "Megumi Fushiguro") {
					transformed = await exportCrashOut(interaction, randomOpponent, primaryEmbed, row, playerHealth)
				} else if (randomOpponent.name === "Mahito" || randomOpponent.name === "Mahito (Transfigured)") {
					transformed = await export120(interaction, randomOpponent, primaryEmbed, row, playerHealth)
				} else if (randomOpponent.name === "Mahito (120%)") {
					transformed = await exportMahito(interaction, randomOpponent, primaryEmbed, row, playerHealth)
				}
				if (!transformed) {
					logger.info("Boss is defeated and no transformation occurred.")
					domainActivationState.set(contextKey, false)
					activeCollectors.delete(interaction.user.id)
					bossHealthMap.delete(interaction.user.id)

					await handleBossDeath(interaction, primaryEmbed, row, randomOpponent)
					return
				}
			} else {
				//
				bossHealthMap.set(interaction.user.id, randomOpponent.current_health)

				await delay(2000)

				const statusEffects = await getUserStatusEffects(interaction.user.id)

				//

				const { divineDogsHit, newPlayerHealth: updatedPlayerHealth } = await handleDivineDogsDamage(
					interaction,
					randomOpponent,
					playerHealth,
					statusEffects
				)

				if (divineDogsHit) {
					playerHealth = updatedPlayerHealth

					const statusEffectsValue = await fetchAndFormatStatusEffects(collectedInteraction.user.id)
					const divineDogsMessage = "The Divine Dogs took the hit and protected you!"
					primaryEmbed.addFields({ name: "Divine Dogs", value: divineDogsMessage })
					primaryEmbed.addFields([{ name: "Status Effect Player", value: statusEffectsValue, inline: true }])

					await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
					logger.info("after divine dogs")
				} else {
					const possibleAttacks = attacks[randomOpponent.name]
					const chosenAttack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)]

					const statusEffects = await getUserStatusEffects(interaction.user.id)
					const playerGrade = await getUserGrade(interaction.user.id)

					const clampedPlayerHealth = await executeBossAttack(
						interaction,
						randomOpponent,
						chosenAttack,
						playerGrade,
						primaryEmbed,
						playerHealth,
						statusEffects,
						row
					)

					//did bro die?
					if (clampedPlayerHealth <= 0) {
						if (randomOpponent.name === "Mahito (Transfigured)") {
							await handlePlayerRevival(interaction, primaryEmbed, row, randomOpponent, playerHealth)
						} else {
							if (interaction.user.id === "292385626773258240") {
								await handleJoyBoyDeath(interaction, primaryEmbed, row, randomOpponent, playerHealth)
							} else {
								const bossAttackMessage = `${randomOpponent.name} killed you!`
								primaryEmbed.setFooter({ text: bossAttackMessage })
								activeCollectors.delete(interaction.user.id)
								bossHealthMap.delete(interaction.user.id)
								//
								await updateUserHealth(interaction.user.id, 100)
								await removeAllStatusEffects(interaction.user.id)
								await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
								await collectedInteraction.followUp({
									content: `${randomOpponent.name} killed you!`,
									ephemeral: true
								})
								battleOptionSelectMenuCollector.stop()
							}
						}
					} else {
						await updateUserHealth(interaction.user.id, clampedPlayerHealth)
						const statusEffectsValue = await fetchAndFormatStatusEffects(collectedInteraction.user.id)
						const bossAttackMessage = `${randomOpponent.name} dealt ${chosenAttack.baseDamage(
							playerGrade
						)} damage to you with ${chosenAttack.name}! You have ${clampedPlayerHealth} health remaining.`
						primaryEmbed.addFields({ name: "Enemy Technique", value: bossAttackMessage })
						primaryEmbed.addFields([
							{ name: "Status Effect Player", value: statusEffectsValue, inline: true }
						])
						await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
					}
				}
			}
		}
	})
}

async function handleFightLogic(
	interaction: Interaction,
	randomOpponent: BossData,
	playerGradeString: string,
	damage: number
): Promise<string> {
	let resultMessage = `You dealt ${damage} damage to ${randomOpponent.name}!`
	if (randomOpponent.current_health <= 0) {
		resultMessage += " You won the fight!"
	} else {
		resultMessage += ` Boss health remaining: ${randomOpponent.current_health}`
	}

	return resultMessage
}

const userCollectors = new Map()
const latestInteractionIdPerUser = new Map()
const latestSessionTimestampPerUser = new Map()

export async function handleTechniqueShopCommand(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply()

	const userId = interaction.user.id
	const interactionId = interaction.id
	const userAwakeningStage = await getUserAwakening(userId)
	const sessionTimestamp = Date.now()
	const userTechniques = (await getUserTechniques(userId)) || []
	const userBalance = await getBalance(userId)
	const userInventory = (await getUserInventory(userId)) || []
	const hasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(userId)

	const clans = Object.keys(CLAN_SKILLS)

	if (userCollectors.has(userId)) {
		const existingCollector = userCollectors.get(userId)
		existingCollector.stop("A new shop session was initiated.")
	}

	latestInteractionIdPerUser.set(userId, interactionId)
	latestSessionTimestampPerUser.set(userId, sessionTimestamp)

	let clanOptions

	if (hasHeavenlyRestriction) {
		clanOptions = Object.keys(heavenlyrestrictionskills)
			.filter(character => {
				const characterSkills = heavenlyrestrictionskills[character]
				const requiredStages = characterSkills.map(skill => skill.stage)
				if (userAwakeningStage === "Stage Five") {
					return true
				} else {
					return requiredStages.some(stage => userAwakeningStage === stage || stage === undefined)
				}
			})
			.map(character => ({
				label: character,
				value: `heavenly_restriction_${character}`,
				description: `Special techniques for ${character} under Heavenly Restriction`
			}))
	} else {
		clanOptions = clans
			.filter(clan => {
				if (clan === "Curse King (Heian Era)") {
					return ["Stage Two", "Stage Three", "Stage Four", "Stage Five"].includes(userAwakeningStage)
				} else if (clan === "God of Lightning (Heian Era)") {
					return ["Stage One", "Stage Two", "Stage Three", "Stage Four", "Stage Five"].includes(
						userAwakeningStage
					)
				} else if (clan === "Demon Vessel (Awoken)") {
					return ["Stage Three", "Stage Four", "Stage Five"].includes(userAwakeningStage)
				} else if (clan === "The Strongest") {
					return ["Stage Four", "Stage Five"].includes(userAwakeningStage)
				} else if (clan === "Gambler Fever (Jackpot)") {
					return ["Stage Five"].includes(userAwakeningStage)
				} else if (clan === "Utahime Iori") {
					return ["Stage Five"].includes(userAwakeningStage)
				} else if (clan === "Transfiguration (True Soul)") {
					return ["Stage Two", "Stage Three", "Stage Four", "Stage Five"].includes(userAwakeningStage)
				} else if (clan === "Yuta Okkotsu (Manifested Rika)") {
					return ["Stage Five"].includes(userAwakeningStage)
				}
				return true
			})
			.map(clan => ({
				label: clan,
				value: clan.toLowerCase().replace(/\s+/g, "_"),
				description: `Select to view ${clan}'s techniques`,
				emoji: getEmojiForClan(clan)
			}))
	}

	clanOptions = clanOptions.filter(
		option => typeof option.label === "string" && option.label && typeof option.value === "string" && option.value
	)

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId("select_clan")
		.setPlaceholder("Select a Clan")
		.addOptions(clanOptions)

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

	await interaction.followUp({
		content: "Select a clan to view its available techniques.",
		components: [row],
		ephemeral: false
	})

	const filter = i =>
		(i.customId === "select_clan" ||
			i.customId.startsWith("buy_technique_") ||
			i.customId.startsWith("buy_heavenly_technique_")) &&
		i.user.id === interaction.user.id
	const techniqueshopcollector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

	userCollectors.set(userId, techniqueshopcollector)

	techniqueshopcollector.on("collect", async i => {
		const userHeavenlyTechniques = (await getUserHeavenlyTechniques(userId)) || []
		const currentSessionTimestamp = latestSessionTimestampPerUser.get(userId)
		const interactionTimestamp = i.createdTimestamp
		let skillsToDisplay
		let embedTitle
		let customIdPrefix

		if (interactionTimestamp < currentSessionTimestamp) {
			logger.info("Attempted to interact with a stale session. Ignoring.")
			return
		}

		if (i.isStringSelectMenu()) {
			await i.deferUpdate()
			if (i.values[0].startsWith("heavenly_restriction_")) {
				const characterName = i.values[0].replace("heavenly_restriction_", "")
				const characterSkills = heavenlyrestrictionskills[characterName]
				if (characterSkills) {
					skillsToDisplay = characterSkills.filter(
						skill => !userTechniques.includes(skill.name) && !userHeavenlyTechniques.includes(skill.name)
					)
					embedTitle = `${characterName} Techniques`
					customIdPrefix = `buy_heavenly_technique_${characterName}_`
				} else {
					skillsToDisplay = []
					embedTitle = "Invalid Character"
					customIdPrefix = ""
				}
			} else if (i.values[0] === "demon_vessel_(awoken)") {
				skillsToDisplay = CLAN_SKILLS["Demon Vessel (Awoken)"].filter(
					skill => !userTechniques.includes(skill.name)
				)
				embedTitle = "Demon Vessel (Awoken) Techniques"
				customIdPrefix = "buy_technique_"
			} else {
				const selectedClan = clans.find(clan => clan.toLowerCase().replace(/\s+/g, "_") === i.values[0])
				skillsToDisplay = CLAN_SKILLS[selectedClan].filter(skill => !userTechniques.includes(skill.name))
				embedTitle = `${selectedClan} Clan Techniques`
				customIdPrefix = "buy_technique_"
			}

			if (skillsToDisplay.length === 0) {
				await i.followUp({
					ephemeral: true,
					content: "There are no more techniques available for you to purchase in this category.",
					components: []
				})
				techniqueshopcollector.stop()
				return
			}

			const embed = new EmbedBuilder()
				.setTitle(embedTitle)
				.setColor(0x1f512d)
				.setDescription(
					skillsToDisplay
						.map(skill => {
							const formattedCost = skill.cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
							return `**${skill.name}** - ${formattedCost} Coins${
								skill.items && skill.items.length > 0
									? ` - Requires: ${skill.items
											.map(item => `${item.quantity}x ${item.name}`)
											.join(", ")}`
									: ""
							}`
						})
						.join("\n\n")
				)
				.setFooter({ text: "Select a technique to buy." })

			const skillButtons = skillsToDisplay.map(skill =>
				new ButtonBuilder()
					.setCustomId(`${customIdPrefix}${skill.name.toLowerCase().replace(/\s+/g, "_")}`)
					.setLabel(`Buy ${skill.name}`)
					.setStyle(ButtonStyle.Secondary)
			)

			const buttonRows = []
			for (let j = 0; j < skillButtons.length; j += 5) {
				buttonRows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(skillButtons.slice(j, j + 5)))
			}

			buttonRows.unshift(row)

			await i.editReply({
				embeds: [embed],
				components: buttonRows
			})
		} else if (i.isButton()) {
			await i.deferUpdate()
			const isHeavenlySkill = i.customId.startsWith("buy_heavenly_technique_")
			const characterName = isHeavenlySkill ? i.customId.split("_")[3] : null

			const techniqueName = i.customId
				.replace(/^buy_heavenly_technique_[^_]+_/, "")
				.replace(/^buy_technique_/, "")
				.replace(/_/g, " ")

			const selectedSkill = isHeavenlySkill
				? heavenlyrestrictionskills[characterName]?.find(
						skill => skill.name.toLowerCase() === techniqueName.toLowerCase()
					)
				: Object.values(CLAN_SKILLS)
						.flat()
						.find(skill => skill.name.toLowerCase() === techniqueName.toLowerCase())

			if (!selectedSkill) {
				await i.followUp({ content: "This technique does not exist." })
				return
			}

			if (userBalance < parseInt(selectedSkill.cost, 10)) {
				await i.followUp({
					ephemeral: true,
					content: `You do not have enough coins to purchase ${selectedSkill.name}.`
				})
				return
			}

			const hasRequiredItems = (selectedSkill.items || []).every(reqItem => {
				const userItem = userInventory.find(item => item.name === reqItem.name)
				return userItem && userItem.quantity >= reqItem.quantity
			})

			if (!hasRequiredItems) {
				await i.followUp({
					ephemeral: true,
					content: `You do not have the required items to purchase ${selectedSkill.name}.`
				})
				return
			}

			await updateBalance(userId, -parseInt(selectedSkill.cost, 10))
			for (const { name, quantity } of selectedSkill.items || []) {
				await removeItemFromUserInventory(userId, name, quantity)
			}

			if (isHeavenlySkill) {
				await updateUserHeavenlyTechniques(userId, selectedSkill.name)
			} else {
				await addUserTechnique(userId, selectedSkill.name)
			}

			await i.followUp({
				content: `Congratulations! You have successfully purchased the technique: ${selectedSkill.name}.`,
				components: [],
				ephemeral: true
			})

			if (selectedSkill.name === "Divergent Fist") {
				const userState = await getUserTutorialState(userId)

				if (userState) {
					userState.techniquePurchased = true
					await setUserTutorialState(userId, userState)

					const tutorialMessageId = userState.tutorialMessageId
					if (tutorialMessageId) {
						const dmChannel = await interaction.user.createDM()
						const tutorialMessage = await dmChannel.messages.fetch(tutorialMessageId).catch(error => {
							console.error("Failed to fetch the tutorial message:", error)
						})

						if (tutorialMessage) {
							const step = 2
							const buttons = await getButtons(step, userId)

							await tutorialMessage
								.edit({
									embeds: [tutorialPages[step]],
									components: [buttons]
								})
								.catch(error => {
									console.error("Failed to edit the tutorial message:", error)
								})
						} else {
							console.error("Tutorial message not found")
						}
					} else {
						console.error("Tutorial message ID is undefined")
					}
				} else {
					console.error("User tutorial state is undefined")
				}
			}
		}
	})

	techniqueshopcollector.on("end", _collected => {
		techniqueshopcollector.stop()
		userCollectors.delete(userId)
	})
}

function formatUptime(uptime: number): string {
	const totalSeconds = uptime / 1000
	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor(totalSeconds / 3600) % 24
	const minutes = Math.floor(totalSeconds / 60) % 60
	const seconds = Math.floor(totalSeconds % 60)
	return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

export async function generateStatsEmbed(client: Client, nextResetTimestamp: number): Promise<EmbedBuilder> {
	const uptime = formatUptime(client.uptime ?? 0)
	const discordApiLatency = Math.round(client.ws.ping)
	const nullifuApiLatency = await getApiLatency()

	const discordPingEmoji = getLatencyEmoji(discordApiLatency)
	const nullifuPingEmoji = getLatencyEmoji(nullifuApiLatency)

	const statsEmbed = new EmbedBuilder()
		.setColor("#0099FF")
		.setTitle("🤖 Bot Stats")
		.setDescription("Current bot stats, updated every 5 minutes.")
		.addFields(
			{ name: "📊 Uptime", value: `${uptime} ⏰`, inline: true },
			{ name: "🌐 Discord API Latency", value: `${discordApiLatency}ms ${discordPingEmoji}`, inline: true },
			{ name: "🧲 API Latency", value: `${nullifuApiLatency}ms ${nullifuPingEmoji}`, inline: true },
			{ name: "📡 Status", value: "🟩", inline: true },
			{ name: "🛒 Next Shop Reset", value: `<t:${nextResetTimestamp}:F> 🕒`, inline: true }
		)
		.setTimestamp()
		.setFooter({ text: "Last Updated" })

	return statsEmbed
}

function getLatencyEmoji(latency: number): string {
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

async function getApiLatency(): Promise<number> {
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

export async function generateShopEmbed(): Promise<EmbedBuilder> {
	const shopItems = await getAllShopItems() // Assuming you have this function

	const lastResetTime = getShopLastReset()
	const resetIntervalMs = 1000 * 60 * 60 * 24 // Example: 24 hours in milliseconds
	const nextResetTime = new Date((await lastResetTime).getTime() + resetIntervalMs)

	const discordTimestamp = Math.floor(nextResetTime.getTime() / 1000)

	const embed = new EmbedBuilder()
		.setColor("#FFD700")
		.setTitle("✨ Shop Items ✨")
		.addFields([{ name: "Resets In", value: `<t:${discordTimestamp}:R>`, inline: false }])

	shopItems.forEach(item => {
		if (item && item.name && typeof item.price !== "undefined" && item.rarity) {
			embed.addFields([
				{
					name: `**${item.name}** - ${item.rarity} Rarity`,
					value: `Price: **${item.price || "None"}** coins | Max Purchases: **${
						item.maxPurchases || "None"
					}**`,
					inline: false
				}
			])
		}
	})

	return embed
}
const slotSymbols = ["🍒", "🍋", "🍊", "🍉", "🍇", "🍓"]
function spinSlots(): string[] {
	return Array.from({ length: 3 }, () => slotSymbols[Math.floor(Math.random() * slotSymbols.length)])
}

function formatNumberWithCommas(number) {
	return number.toLocaleString("en-US")
}

function checkWin(spinResults: string[]): boolean {
	return new Set(spinResults).size === 1
}

const userBetCounts = {}
const userLastBetTimes = {}
const cooldownPeriod = 15 * 1000
const maxBetLimit = 20000000
const dailyBetLimit = 20

export async function handleGambleCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id
	const now = Date.now()

	if (!userBetCounts[userId]) {
		userBetCounts[userId] = 0
	}
	if (!userLastBetTimes[userId]) {
		userLastBetTimes[userId] = 0
	}

	const currentBalance = await getBalance(userId)

	const { betCount } = await getUserGambleInfo(userId)

	if (now - userLastBetTimes[userId] < cooldownPeriod) {
		const cooldownEnd = new Date(userLastBetTimes[userId] + cooldownPeriod)
		const cooldownEndTimestamp = Math.floor(cooldownEnd.getTime() / 1000)

		await interaction.reply({
			content: `You're betting too quickly. Please wait until <t:${cooldownEndTimestamp}:R> before trying again.`,
			ephemeral: true
		})

		return
	}

	if (betCount >= dailyBetLimit) {
		await interaction.reply("You've reached your daily gamble limit of 20. Please try again tomorrow.")
		return
	}

	const gameType = interaction.options.getString("game")
	const betAmount = interaction.options.getInteger("amount", true)

	if (betAmount > currentBalance) {
		await interaction.reply("You don't have enough coins to make this bet.")
		return
	}

	if (betAmount > maxBetLimit) {
		await interaction.reply({
			content: `Your maximum bet limit is ${formatNumberWithCommas(maxBetLimit)} coins.`,
			ephemeral: true
		})
		return
	}

	if (gameType === "slot") {
		const spinResults = spinSlots()
		const didWin = checkWin(spinResults)
		let resultMessage = ""
		let jackpotGIF = ""

		if (didWin) {
			const isJackpot = spinResults.every(symbol => symbol === "🍓")
			if (isJackpot) {
				jackpotGIF = "https://media1.tenor.com/m/qz4d7FBNft4AAAAC/hakari-hakari-kinji.gif"
				await updateBalance(userId, betAmount * 5)
				resultMessage = `🎉 Congratulations, you hit the Jackpot and won ${formatNumberWithCommas(
					betAmount * 2
				)} coins!`
			} else {
				await updateBalance(userId, betAmount * 2)
				resultMessage = `🎉 Congratulations, you won ${formatNumberWithCommas(betAmount * 2)} coins!`
			}
		} else {
			await updateBalance(userId, -betAmount)
			resultMessage = `😢 Better luck next time! You lost ${formatNumberWithCommas(betAmount)} coins.`
		}

		const resultEmbed = new EmbedBuilder()
			.setTitle("🎰 Slot Machine 🎰")
			.setDescription(`${spinResults.join(" | ")}\n${resultMessage}`)
			.setColor(didWin ? "#00FF00" : "#FF0000")
			.setTimestamp()

		if (jackpotGIF) {
			resultEmbed.setImage(jackpotGIF)
		}

		await interaction.reply({ embeds: [resultEmbed] })
	} else if (gameType === "coinflip") {
		const coinSides = ["Heads", "Tails"]
		const result = coinSides[Math.floor(Math.random() * coinSides.length)]
		const didWin = Math.random() < 0.5
		const technique = Math.random() < 0.1
		const supatechnique = Math.random() < 0.01

		let resultMessage = ""
		if (didWin) {
			const winnings = betAmount * 2

			await updateBalance(userId, winnings)
			await updateGamblersData(userId, betAmount, winnings, 0, 0)
			resultMessage = `🪙 It landed on ${result}! You've doubled your bet and won ${formatNumberWithCommas(
				winnings
			)} coins!`
		} else {
			const losses = betAmount
			await updateBalance(userId, -losses)
			await updateGamblersData(userId, betAmount, 0, losses, 0)
			resultMessage = `🪙 It landed on ${
				result === "Heads" ? "Tails" : "Heads"
			}! You lost ${formatNumberWithCommas(losses)} coins.`
		}

		const resultEmbed = new EmbedBuilder()
			.setTitle("🪙 Coin Flip 🪙")
			.setDescription(resultMessage)
			.setColor(didWin ? "#00FF00" : "#FF0000")
			.setTimestamp()

		await interaction.reply({ embeds: [resultEmbed] })

		const userTechniques = await getUserTechniques(userId)

		if (technique && !userTechniques.includes("Private Pure Love Train: Jackpot")) {
			await addUserTechnique(userId, "Private Pure Love Train: Jackpot")
			const techniqueEmbed = new EmbedBuilder()
				.setColor("#FFD700")
				.setTitle("🌟 Technique Acquired! 🌟")
				.setDescription(
					"Luck seems to be on your side! You've acquired Hakari Kinji's Private Pure Love Train: Jackpot technique."
				)
				.setThumbnail("https://i.imgur.com/zCP3OWc.png")

			await interaction.followUp({ embeds: [techniqueEmbed], ephemeral: true })
		}
		if (supatechnique && !userTechniques.includes("Prayer Song")) {
			await addUserTechnique(userId, "Prayer Song")
			const techniqueEmbed = new EmbedBuilder()
				.setColor("#FFD700")
				.setTitle("🌟 Technique Acquired! 🌟")
				.setDescription(
					"You move with the grace of a god! You've acquired Prayer Song.. This is the power of JUJUTSU!"
				)
				.setThumbnail("https://i.imgur.com/zCP3OWc.png")

			await interaction.followUp({ embeds: [techniqueEmbed], ephemeral: true })
		}
	}

	userBetCounts[userId]++
	userLastBetTimes[userId] = now
	await updateUserGambleInfo(userId)
}

function getRandomBenefactor() {
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

const begcooldown = new Map<string, number>()
const begcooldownamount = 30 * 1000

export async function handleBegCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id
	const now = Date.now()

	// Cooldown Check
	const lastCommandTime = begcooldown.get(userId)
	if (lastCommandTime && now - lastCommandTime < begcooldownamount) {
		const timeLeft = ((begcooldownamount - (now - lastCommandTime)) / 1000).toFixed(1)
		return interaction.reply({
			content: `You need to wait ${timeLeft} more second(s) before begging again.`,
			ephemeral: true
		})
	}

	begcooldown.set(userId, now)

	const chosenOne = getRandomBenefactor()

	let resultMessage = `You begged ${chosenOne.name}. `

	if (chosenOne.words) {
		resultMessage += `${chosenOne.name} says: "${chosenOne.words}" `
	}

	let receivedItems = false

	if (chosenOne.coins > 0) {
		await updateBalance(interaction.user.id, chosenOne.coins)
		resultMessage += `They felt generous and gave you ${chosenOne.coins.toLocaleString()} coins. `
		receivedItems = true
	}

	if (chosenOne.items.length > 0) {
		for (const item of chosenOne.items) {
			await addItemToUserInventory(interaction.user.id, item.name, item.quantity)
		}
		const itemList = chosenOne.items.map(item => `${item.quantity} x ${item.name}`).join(", ")
		if (receivedItems) {
			resultMessage += `They also handed you ${itemList}. `
		} else {
			resultMessage += `They handed you ${itemList}. `
		}
		receivedItems = true
	}

	if (!receivedItems) {
		resultMessage += "They didn't give you any items or coins this time."
	}

	// Embed Creation
	const resultEmbed = new EmbedBuilder()
		.setTitle("Begging Result")
		.addFields(
			{ name: "Benefactor", value: chosenOne.name, inline: true },
			{ name: "Words", value: chosenOne.words || "No words", inline: true },
			{
				name: "Received",
				value: receivedItems
					? `${chosenOne.coins > 0 ? `${chosenOne.coins} coins\n` : ""}${chosenOne.items
							.map(item => `${item.quantity} x ${item.name}`)
							.join("\n")}`
					: "Nothing"
			}
		)
		.setColor("#00FF00")
		.setTimestamp()
		.setFooter({ text: getRandomQuote() })

	await interaction.reply({ embeds: [resultEmbed] })
}

export async function handleSellCommand(interaction) {
	const itemToSell = interaction.options.getString("item").toLowerCase()
	const quantity = interaction.options.getInteger("quantity") || 1
	const userInventory = await getUserInventory(interaction.user.id)
	const inventoryItem = userInventory.find(i => i.name.toLowerCase() === itemToSell)

	if (!inventoryItem) {
		return interaction.reply({ content: "You don't have that item in your inventory.", ephemeral: true })
	}

	if (inventoryItem.quantity < quantity) {
		return interaction.reply({
			content: `You don't have enough ${inventoryItem.name} to sell. You only have ${inventoryItem.quantity}.`,
			ephemeral: true
		})
	}

	const itemDetails = items.find(i => i.name.toLowerCase() === itemToSell)
	const price = itemDetails ? itemDetails.price : 5000
	const earnings = price * quantity

	const confirmationEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle("Confirm Sale")
		.setDescription(
			`Are you sure you want to sell ${quantity} x ${inventoryItem.name} for ${earnings.toLocaleString()} coins?`
		)

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId("confirm_sell").setLabel("Confirm").setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId("cancel_sell").setLabel("Cancel").setStyle(ButtonStyle.Danger)
	)

	await interaction.reply({ embeds: [confirmationEmbed], components: [row], ephemeral: true })

	const filter = i => ["confirm_sell", "cancel_sell"].includes(i.customId) && i.user.id === interaction.user.id
	const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 })

	collector.on("collect", async i => {
		if (i.customId === "confirm_sell") {
			await removeItemFromUserInventory(interaction.user.id, inventoryItem.name, quantity)
			await updateBalance(interaction.user.id, earnings)
			const balance = await getBalance(interaction.user.id)
			await i.update({
				content: `You've sold ${quantity} x ${
					inventoryItem.name
				} for ${earnings} coins. Your new balance: ${balance.toLocaleString()}`,
				embeds: [],
				components: []
			})
		} else {
			await i.update({ content: "Sale cancelled.", embeds: [], components: [] })
		}
	})

	collector.on("end", (collected, reason) => {
		if (reason === "time") {
			interaction.editReply({ content: "Confirmation time expired. Sale cancelled.", components: [] })
		}
	})
}

export async function handleQuestCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id

	const userActiveQuests = await getUserQuests(userId)
	const activeQuestNames = userActiveQuests.quests.map(q => q.id)

	const availableQuests = questsArray.filter(quest => !activeQuestNames.includes(quest.name) && !quest.special)

	if (availableQuests.length === 0) {
		await interaction.reply("There are no available quests.")
		throw new Error("There are no available quests.")
	}

	const questOptions = availableQuests.map(quest => ({
		label: quest.name,
		value: quest.name,
		description: quest.description.substring(0, 100)
	}))

	if (questOptions.length === 0) {
		throw new Error("No quests available for this user.")
	} else if (questOptions.length > 25) {
		questOptions.length = 25
	}

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId("select_quest")
		.setPlaceholder("Select Quests")
		.setMinValues(1)
		.setMaxValues(questOptions.length)
		.addOptions(questOptions)

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

	await interaction.reply({
		content: "Select one or more quests to begin your adventure.",
		components: [row],
		ephemeral: true
	})

	const filter = i => i.customId === "select_quest" && i.user.id === interaction.user.id
	const questCollector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

	questCollector.on("collect", async i => {
		if (i.isStringSelectMenu()) {
			const selectedQuestNames = i.values

			const embed = new EmbedBuilder().setColor("#0099ff").setTitle("Selected Quests")

			if (selectedQuestNames.length >= 10) {
				const questNamesString = selectedQuestNames.join(", ")
				for (const selectedQuestName of selectedQuestNames) {
					const selectedQuest = questsArray.find(quest => quest.name === selectedQuestName)
					await addUserQuest(userId, selectedQuest.name)
				}
				embed.setDescription(`You accepted these quests: ${questNamesString}`)
			} else {
				for (const selectedQuestName of selectedQuestNames) {
					if (activeQuestNames.includes(selectedQuestName)) {
						await i.update({
							content: `You are already on the quest "${selectedQuestName}"!`,
							embeds: [],
							components: []
						})
						return
					}

					const selectedQuest = questsArray.find(quest => quest.name === selectedQuestName)
					await addUserQuest(userId, selectedQuest.name)

					embed.addFields({ name: selectedQuest.name, value: selectedQuest.description })

					if (selectedQuest.coins !== undefined && selectedQuest.coins !== null) {
						embed.addFields({ name: "Coins", value: selectedQuest.coins.toString(), inline: true })
					}

					if (selectedQuest.experience !== undefined && selectedQuest.experience !== null) {
						embed.addFields({ name: "EXP", value: selectedQuest.experience.toString(), inline: true })
					}
				}
			}

			await i.update({
				content: "Quests selected:",
				embeds: [embed],
				components: []
			})
		}
	})

	questCollector.on("end", collected => {
		if (collected.size === 0) {
			interaction.editReply({ content: "You didn't select a quest in time.", components: [] })
		}
		questCollector.stop()
	})
}

export async function claimQuestsCommand(interaction) {
	await interaction.deferReply()

	let session: ClientSession | null = null

	try {
		session = await startNewSession()
		logger.debug("Session started successfully")

		try {
			await updateUserCommandsUsed(interaction.user.id)

			const userId = interaction.user.id
			const userQuests = await getUserQuests(userId)

			if (!userQuests || !Array.isArray(userQuests.quests) || userQuests.quests.length === 0) {
				await interaction.editReply("You have no active quests to claim.")
				await session?.endSession()
				return
			}

			const completedQuests = userQuests.quests.filter(userQuest => {
				const questDetails = questsArray.find(quest => quest.name === userQuest.id)
				if (!questDetails) return false

				if (Array.isArray(questDetails.tasks) && questDetails.tasks.length > 0) {
					return questDetails.tasks.every(task => {
						const userTask = userQuest.tasks.find(t => t.description === task.description)
						return userTask && userTask.progress >= task.totalProgress
					})
				} else {
					return userQuest.progress >= questDetails.totalProgress
				}
			})

			if (completedQuests.length === 0) {
				await interaction.editReply("You have no completed quests to claim.")
				await session?.endSession()
				return
			}

			let claimedSukunasHonour = false
			let claimedReinforcement = false
			let claimedSatoru = false
			let claimedNanami = false
			let claimedMentorSatoru = false
			let claimedMentorSukuna = false
			let claimedstage3 = false
			let claimedkashimo = false

			for (const completedQuest of completedQuests) {
				const questDetails = questsArray.find(quest => quest.name === completedQuest.id)
				if (!questDetails) continue

				const { coins, experience, items } = questDetails

				await updateBalance(userId, coins)
				await updateUserExperience(userId, experience)

				if (items) {
					for (const itemName of Object.keys(items)) {
						const quantity = items[itemName]
						await addItemToUserInventory(userId, itemName, quantity)

						if (itemName === "Sukuna's Honour") {
							claimedSukunasHonour = true
						} else if (itemName === "Cursed Energy Reinforcement") {
							claimedReinforcement = true
						} else if (itemName === "Satoru Gojo's Respect") {
							claimedSatoru = true
						} else if (itemName === "Overtime") {
							claimedNanami = true
						} else if (itemName === "Curse King Medal") {
							claimedMentorSukuna = true
						} else if (itemName === "Strongest Medal") {
							claimedMentorSatoru = true
						} else if (itemName === "Awakening Release") {
							claimedstage3 = true
						} else if (itemName === "Kashimo's Token") {
							claimedkashimo = true
						}
					}
				}

				await updatePlayerGrade(userId)
			}

			// Remove the completed quests after all rewards have been granted
			for (const completedQuest of completedQuests) {
				await removeUserQuest(userId, completedQuest.instanceId)
			}

			const questRewards = completedQuests.map(completedQuest => {
				const questDetails = questsArray.find(quest => quest.name === completedQuest.id)
				if (!questDetails) return `**${completedQuest.id}**`

				const { coins, experience, items } = questDetails
				const rewards = [
					`Coins: ${coins}`,
					`Experience: ${experience}`,
					...Object.entries(items || {}).map(([item, quantity]) => `${item}: ${quantity}`)
				].join("\n")

				return `**${completedQuest.id}**\n${rewards}`
			})

			const specialEmbeds = []

			if (claimedSukunasHonour) {
				await updateUserHonours(userId, ["Sukuna's Honour"])
				const sukunasHonourEmbed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("Sukuna's Honour Claimed!")
					.setDescription(
						"You have been acknowledged by the King of Curses himself. This is a rare achievement that marks you as one of the elite sorcerers."
					)
					.setImage("https://cdn.discordapp.com/attachments/.../82F48214-7925-47D3-BCD8-12D744A71F98.gif")
					.addFields({ name: "New Awakening", value: "You now bear the curse of Sukuna. Use it wisely." })

				specialEmbeds.push(sukunasHonourEmbed)
			}

			if (claimedReinforcement) {
				await updateUserUnlockedTransformations(userId, ["Cursed Energy Reinforcement"])
				const reinforcementEmbed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("Power Released!")
					.setDescription(
						"One hell of a training session! You have unlocked the ability to reinforce your cursed energy."
					)
					.setImage("https://i.pinimg.com/originals/5f/3c/b9/5f3cb9d839aa38fef811289443488890.gif")
					.addFields({
						name: "New Power",
						value: "You can now use the **Cursed Energy Reinforcement** Transformation!"
					})

				specialEmbeds.push(reinforcementEmbed)
			}

			if (claimedSatoru) {
				await updateUserHonours(userId, ["Satoru Gojo's Respect"])
				await addItemToUserInventory(userId, "Upgraded Limitless Token", 3)
				const claimedSatoru = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("Six Eyes Unleashed!")
					.setDescription(
						"Well, well, look at you. Seems like someone finally figured out how those Six Eyes really work, huh?"
					)
					.setImage("https://media1.tenor.com/m/DoXhSg0brxsAAAAC/gojo-satoru-satoru.gif")
					.addFields({
						name: "New Power",
						value: "**Awakened** Limitless techniques unleashed! You now have access to the **Awakened Limitless** power!"
					})

				specialEmbeds.push(claimedSatoru)
			}

			if (claimedNanami) {
				await updateUserUnlockedTransformations(userId, ["Overtime"])
				const claimedNanami = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("Overtime")
					.setDescription("Grit, determination, and a whole lot of overtime pay, Goodjob kid.")
					.setImage("https://media1.tenor.com/m/8A5xvJMFYMwAAAAC/nanami-kento-nanami.gif")
					.addFields({
						name: "New Power",
						value: "**Awakened** Overtime Transformation Unlocked! You now have access to the **Overtime** power!"
					})

				specialEmbeds.push(claimedNanami)
			}

			if (claimedMentorSatoru) {
				await updateUserMentor(userId, "Satoru Gojo")
				const satorumentor = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("The Strongest")
					.setDescription("Your pretty strong.. i'll mentor you.")
					.setImage("https://media1.tenor.com/m/_NCxT6vyWvwAAAAC/gojo-satoru-look-side-eye.gif")
					.addFields({
						name: "Mentor",
						value: "Satoru Gojo has taken you under his wing..."
					})

				specialEmbeds.push(satorumentor)
			}

			if (claimedMentorSukuna) {
				await updateUserMentor(userId, "Curse King")
				const curseking = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("The Fearful King")
					.setDescription("Hmph, Fine.. I'll mentor you.. but don't get too cocky kid")
					.setImage("https://media1.tenor.com/m/tp8gToTKFksAAAAC/ryomen-sukuna-sukuna.gif")
					.addFields({
						name: "Mentor",
						value: "The King Of Curses has taken you under his wing..."
					})

				specialEmbeds.push(curseking)
			}

			if (claimedstage3) {
				await updateUserUnlockedTransformations(userId, ["Awakening"])
				const curseking = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("Awakening Unleashed!")
					.setDescription(
						"Oh.. you're getting stronger.. I'll teach you how to use the **Awakening** Transformation!"
					)
					.setImage("https://storage.googleapis.com/jjk_bot_personal/687474~1.GIF")
					.addFields({
						name: "Power Unleashed",
						value: "Your awakening has begun.. you now have access to the **Awakening** Transformation!"
					})

				specialEmbeds.push(curseking)
			}

			if (claimedkashimo) {
				await updateUserUnlockedTransformations(userId, ["Maximum Output"])
				const curseking = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("bzzztbzzz-bzzzt")
					.setDescription("You've unlocked the Maximum Output Transformation!")
					.setImage(
						"https://media1.tenor.com/m/2tA56I2eTK8AAAAC/jujutsu-kaisen-shinjuku-arc-hajime-kashimo.gif"
					)
					.addFields({
						name: "New Power",
						value: "Kashimo has taught you how to use the **Maximum Output** Transformation!"
					})

				specialEmbeds.push(curseking)
			}

			if (specialEmbeds.length > 0) {
				await interaction.editReply({ embeds: [specialEmbeds[0]] })
				for (let i = 1; i < specialEmbeds.length; i++) {
					await interaction.followUp({ embeds: [specialEmbeds[i]] })
				}
			} else {
				const genericEmbed = new EmbedBuilder()
					.setColor(0x0099ff)
					.setTitle("Quest Rewards Claimed")
					.setDescription(questRewards.join("\n\n"))

				await interaction.editReply({ embeds: [genericEmbed] })
			}
		} catch (error) {
			logger.error("Error claiming quests:", error)
			if (!interaction.replied && !interaction.deferred) {
				await interaction.editReply({
					content: "An error occurred while claiming quests. Please try again later.",
					ephemeral: true
				})
			}
		} finally {
			await session?.endSession()
		}
	} catch (error) {
		logger.error("Error starting session:", error)
		if (!interaction.replied && !interaction.deferred) {
			await interaction.editReply({
				content: "An error occurred while processing your request. Please try again later.",
				ephemeral: true
			})
		}
	}
}

// view all active quests using getuserquest
export async function viewQuestsCommand(interaction: CommandInteraction) {
	await updateUserCommandsUsed(interaction.user.id)

	await interaction.deferReply({ ephemeral: false })

	const userId = interaction.user.id
	const userQuests = await getUserQuests(userId)
	const currentCommunityQuest = await getCurrentCommunityQuest()

	const embed = new EmbedBuilder().setColor(0x0099ff).setTitle("Active Quests")

	const questMenu = new StringSelectMenuBuilder().setCustomId("quest_menu").setPlaceholder("Select a quest category")

	questMenu.addOptions([
		{
			label: "🎯 Personal Quests",
			description: "View your active personal quests",
			value: "personal_quests"
		},
		{
			label: "🌍 Community Quests",
			description: "View the current community quest",
			value: "community_quests"
		},
		{
			label: "📅 Weekly Quests (Coming Soon)",
			description: "Weekly quests will be available in the future",
			value: "weekly_quests"
		}
	])

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(questMenu)

	const defaultEmbed = embed

	if (!userQuests || !Array.isArray(userQuests.quests) || userQuests.quests.length === 0) {
		defaultEmbed.setDescription("You have no active personal quests at the moment.")
	} else {
		const questWithMostProgress = userQuests.quests.reduce((prev, current) => {
			const prevDetails = questsArray.find(q => q.name === prev.id)
			const currentDetails = questsArray.find(q => q.name === current.id)
			if (!prevDetails || !currentDetails) return prev

			const prevProgress = current.progress / currentDetails.totalProgress
			const currentProgress = current.progress / currentDetails.totalProgress

			return currentProgress > prevProgress ? current : prev
		}, userQuests.quests[0])

		const questDetails = questsArray.find(q => q.name === questWithMostProgress.id)

		if (questDetails) {
			defaultEmbed.setDescription(`Here is your quest with the most progress: **${questDetails.name}**`)
		}
	}

	await interaction.editReply({ embeds: [defaultEmbed], components: [row] })

	const filter = (i: Interaction) =>
		i.isStringSelectMenu() && i.customId === "quest_menu" && i.user.id === interaction.user.id

	try {
		const collected = await interaction.channel?.awaitMessageComponent({ filter, time: 60000 })

		if (collected?.isStringSelectMenu()) {
			const selectedValue = collected.values[0]

			if (selectedValue === "personal_quests") {
				const personalQuestsEmbed = new EmbedBuilder().setColor(0x0099ff).setTitle("Personal Quests")

				if (!userQuests || !Array.isArray(userQuests.quests) || userQuests.quests.length === 0) {
					personalQuestsEmbed.setDescription("You have no active personal quests.")
				} else {
					personalQuestsEmbed.setDescription("Here are your active personal quests:")

					userQuests.quests.forEach(quest => {
						const questDetails = questsArray.find(q => q.name === quest.id)

						if (questDetails && Array.isArray(questDetails.tasks)) {
							const userTasks = Array.isArray(quest.tasks) ? quest.tasks : []
							const taskList = questDetails.tasks
								.map((task, index) => {
									const userTask = userTasks.find(t => t.description === task.description)
									const taskProgress = userTask ? userTask.progress : 0
									const isComplete = taskProgress >= task.totalProgress
									const taskDescription = isComplete ? `~~${task.description}~~` : task.description
									const progressText = isComplete
										? `~~${taskProgress}/${task.totalProgress}~~ ✅`
										: `${taskProgress}/${task.totalProgress}`
									return `**Task ${index + 1}**: ${taskDescription} - Progress: ${progressText}`
								})
								.join("\n")

							personalQuestsEmbed.addFields([
								{
									name: questDetails.name,
									value: taskList,
									inline: false
								}
							])
						} else if (questDetails) {
							const userTask = quest.progress || 0
							const isComplete = userTask >= questDetails.totalProgress
							const taskDescription = isComplete ? `~~${questDetails.task}~~` : questDetails.task
							const progressText = isComplete
								? `~~${userTask}/${questDetails.totalProgress}~~ ✅`
								: `${userTask}/${questDetails.totalProgress}`

							personalQuestsEmbed.addFields([
								{
									name: questDetails.name,
									value: `**Task**: ${taskDescription}\n**Progress**: ${progressText}`,
									inline: false
								}
							])
						}
					})
				}
				await collected.update({ embeds: [personalQuestsEmbed] })
			} else if (selectedValue === "community_quests") {
				const communityQuestEmbed = new EmbedBuilder().setColor(0x0099ff).setTitle("Community Quest")

				if (currentCommunityQuest) {
					communityQuestEmbed.setDescription(
						`Here is the current community quest: **${currentCommunityQuest.questName}**`
					)
					communityQuestEmbed.addFields({
						name: "🌍 Task",
						value: currentCommunityQuest.task,
						inline: false
					})
					communityQuestEmbed.addFields({
						name: "🕰️ Progress",
						value: `${currentCommunityQuest.currentProgress}/${currentCommunityQuest.taskAmount}`,
						inline: false
					})
					communityQuestEmbed.addFields({
						name: "⏰ Ends",
						value: `<t:${new Date(currentCommunityQuest.endDate).getTime() / 1000}:R>`,
						inline: false
					})
				} else {
					communityQuestEmbed.setDescription("There are no active community quests at the moment.")
				}

				await collected.update({ embeds: [communityQuestEmbed] })
			} else if (selectedValue === "weekly_quests") {
				const weeklyQuestsEmbed = new EmbedBuilder().setColor(0x0099ff).setTitle("Weekly Quests")
				weeklyQuestsEmbed.setDescription("Weekly quests will be available in the future.")

				await collected.update({ embeds: [weeklyQuestsEmbed] })
			}
		} else {
			await interaction.editReply({ content: "Interaction timed out.", components: [] })
		}
	} catch (error) {
		logger.error("Error handling quest menu interaction:", error)
		await interaction.editReply({ content: "An error occurred while processing your request.", components: [] })
	}
}
export async function abandonQuestCommand(interaction) {
	await updateUserCommandsUsed(interaction.user.id)
	const userId = interaction.user.id
	const userQuests = await getUserQuests(userId)
	if (!userQuests || !Array.isArray(userQuests.quests) || userQuests.quests.length === 0) {
		await interaction.reply("You have no active quests to abandon.")
		return
	}

	const options = []
	const instanceIds = new Set()

	for (const quest of userQuests.quests) {
		if (quest.id && quest.instanceId && !instanceIds.has(quest.instanceId)) {
			options.push({
				label: quest.id,
				value: quest.instanceId
			})
			instanceIds.add(quest.instanceId)
		}
	}

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId("abandon_quest")
		.setPlaceholder("Select Quests to Abandon")
		.setMinValues(1)
		.setMaxValues(options.length)
		.addOptions(options)

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

	await interaction.reply({
		content: "Select the quests you want to abandon.",
		components: [row],
		ephemeral: true
	})

	const filter = i => i.customId === "abandon_quest" && i.user.id === interaction.user.id
	const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

	collector.on("collect", async i => {
		if (i.isStringSelectMenu()) {
			const selectedQuests = i.values
			for (const instanceId of selectedQuests) {
				await removeUserQuest(userId, instanceId)
			}
			await i.update({
				content: `You have abandoned ${selectedQuests.length} quest(s).`,
				components: []
			})
		}
	})

	collector.on("end", collected => {
		if (collected.size === 0) {
			interaction.editReply({ content: "You didn't select any quests to abandon.", components: [] })
		}
		collector.stop()
	})
}

export async function handleUseItemCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	logger.info("useCommand function initiated.")

	await updateUserCommandsUsed(interaction.user.id)

	const userId = interaction.user.id
	const itemName = interaction.options.getString("item")

	const inventoryItems = await getUserInventory(userId)
	const item = items1.find(i => i.itemName === itemName)
	const hasItem = inventoryItems.some(i => i.name === itemName && i.quantity > 0)

	if (!hasItem) {
		const embed = new EmbedBuilder()
			.setColor("#FF0000")
			.setTitle("Search yields no results...")
			.setDescription(`You rummage through your belongings but find no trace of ${itemName}.`)
		await interaction.reply({ embeds: [embed], ephemeral: true })
		return
	}

	if (itemName === "Unknown Substance") {
		const mentor = await getUserMentor(userId)
		const grade = await getUserGrade(userId)
		if (!mentor || grade === "Grade 4" || grade === "Grade 3" || grade === "Grade 2" || grade === "Grade 1") {
			const embed = new EmbedBuilder()
				.setColor("#FFFF00")
				.setTitle("No Mentor")
				.setDescription("You need a mentor to use the Unknown Substance & Special Grade Rank.")
			await interaction.reply({ embeds: [embed], ephemeral: true })
			return
		}
	}

	if (itemName === "Cursed Energy Vial") {
		const userHealth = await getUserMaxHealth(userId)
		if (userHealth === 400) {
			const embed = new EmbedBuilder()
				.setColor("#FFFF00")
				.setTitle("Maximum Health")
				.setDescription("You cannot use the Cursed Energy Vial when your health is already at its maximum.")
			await interaction.reply({ embeds: [embed], ephemeral: true })
			return
		}
	}

	if (itemName === "Blessful Charm") {
		const awakening = await getUserAwakening(userId)
		if (!awakening || awakening === "Stage Zero") {
			const embed = new EmbedBuilder()
				.setColor("#FFFF00")
				.setTitle("Insufficient Awakening")
				.setDescription("You need to be at Awakening Stage 1 or above to use the Blessful Charm.")
			await interaction.reply({ embeds: [embed], ephemeral: true })
			return
		}
	}

	if (!item) {
		const embed = new EmbedBuilder()
			.setColor("#FFFF00")
			.setTitle("No Effect")
			.setDescription(`You ponder the use of ${itemName}, but it seems to hold no significance.`)
		await interaction.reply({ embeds: [embed], ephemeral: true })
		return
	}

	try {
		if (item) {
			const result = await item.effect(interaction)
			if (result === undefined) {
				removeItemFromUserInventory(userId, itemName, 1)
			}
		}
	} catch (error) {
		logger.error("Error executing item effect:", error)
		await interaction.reply("Uh oh, something unexpected went wrong!")
	}
}
export async function handleConsumeItem(interaction: ChatInputCommandInteraction): Promise<void> {
	await updateUserCommandsUsed(interaction.user.id)

	const userId = interaction.user.id
	const itemName = interaction.options.getString("item")

	const inventoryItems = await getUserInventory(userId)
	const item = consumeables.find(i => i.itemName === itemName)
	const hasItem = inventoryItems.some(i => i.name === itemName && i.quantity > 0)

	if (!hasItem) {
		const embed = new EmbedBuilder()
			.setColor("#FF0000")
			.setTitle("Search yields no results...")
			.setDescription(`You rummage through your belongings but find no trace of ${itemName}.`)
		await interaction.reply({ embeds: [embed], ephemeral: true })
		return
	}

	if (itemName === "RCT Essence") {
		const mentor = await getUserReverseCursedTechniqueStats(userId)
		if (mentor && mentor.obtained) {
			const embed = new EmbedBuilder()
				.setColor("#FF0000")
				.setTitle("Already Obtained")
				.setDescription(
					"You have already obtained the Reverse Cursed Technique and cannot use the RCT Essence again."
				)
			await interaction.reply({ embeds: [embed], ephemeral: true })
			return
		}
	}

	if (!item) {
		const embed = new EmbedBuilder()
			.setColor("#FFFF00")
			.setTitle("No Effect")
			.setDescription(`You ponder the use of ${itemName}, but it seems to hold no significance.`)
		await interaction.reply({ embeds: [embed], ephemeral: true })
		return
	}

	try {
		if (item) {
			const result = await item.effect(interaction)
			if (result === undefined) {
				removeItemFromUserInventory(userId, itemName, 1)
			}
		}
	} catch (error) {
		logger.error("Error executing item effect:", error)
		await interaction.reply("Uh oh, something unexpected went wrong!")
	}
}

export async function handleTradeCommand(interaction) {
	try {
		const targetUser = interaction.options.getUser("user")
		const item = interaction.options.getString("item")
		const quantity = interaction.options.getInteger("quantity")

		const targetUserSettings = await getUserSettings(targetUser.id)
		if (targetUserSettings && !targetUserSettings.acceptTrades) {
			await interaction.reply({
				content: "The user you are trying to trade with does not accept trades.",
				ephemeral: true
			})
			return
		}

		const initiatorInventory = await getUserInventory(interaction.user.id)
		const initiatorItem = initiatorInventory.find(i => i.name === item && i.quantity >= quantity)

		if (!initiatorItem) {
			await interaction.reply({
				content: "You do not have enough of the specified item to trade.",
				ephemeral: true
			})
			return
		}

		const targetUserInventory = await getUserInventory(targetUser.id)
		if (!targetUserInventory) {
			await interaction.reply({
				content: "The user you are trying to trade with does not exist or has no inventory.",
				ephemeral: true
			})
			return
		}

		await createTradeRequest(interaction.user.id, targetUser.id, item, quantity)

		const alertMessage = `You have received a trade request from ${interaction.user.username}.\nItem: ${quantity} x ${item}\nNote: Trading does not allow items to be taken from you; it only allows users to give items.\n\nTo accept the trade, use /trade accept. To ignore it, just leave it and it'll go away. You can disable trading in settings.`
		await createAlert(targetUser.id, alertMessage)

		await interaction.reply({ content: "Trade request sent!", ephemeral: true })
	} catch (error) {
		logger.error("Error occurred while processing the trade command:", error)
		await interaction.reply({
			content: "An error occurred while processing your trade request. Please try again later.",
			ephemeral: true
		})
	}
}

export async function handleViewEffectsCommand(interaction) {
	const userId = interaction.user.id
	await updateUserCommandsUsed(interaction.user.id)
	const userEffects = await getUserItemEffects(userId)

	if (!userEffects || userEffects.length === 0) {
		await interaction.reply("You have no active item effects.")
		return
	}

	const effectEmbed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle("Active Item Effects")
		.setDescription("Here are your currently active item effects:")

	userEffects.forEach(effect => {
		const effectDetails = itemEffects.find(e => e.name === effect.itemName)
		if (effectDetails) {
			// Calculate remaining time
			const endTime = new Date(effect.endTime)
			const now = new Date()
			const remainingTime = endTime.getTime() - now.getTime()
			const remainingMinutes = Math.round(remainingTime / 60000)

			let valueString = `• ${effectDetails.description}`
			if (remainingTime > 0) {
				valueString += `\n• Time remaining: ${remainingMinutes} minutes`
			} else {
				valueString += "\n• Effect expired"
			}

			effectEmbed.addFields({
				name: effectDetails.name,
				value: valueString,
				inline: false
			})
		}
	})

	await interaction.reply({ embeds: [effectEmbed] })
	await postCommandMiddleware(interaction)
}

// Handle alert command
export async function handleAlertCommand(interaction: ChatInputCommandInteraction) {
	await updateUserCommandsUsed(interaction.user.id)
	const userId = interaction.user.id

	try {
		await client.connect()

		const database = client.db(mongoDatabase)
		const alertsCollection = database.collection("alerts")

		const unreadAlerts = await alertsCollection.find({ userId, read: false }).toArray()

		if (unreadAlerts.length === 0) {
			const randomQuote = jjkbotdevqutoes[Math.floor(Math.random() * jjkbotdevqutoes.length)]
			const noAlertEmbed = new EmbedBuilder()
				.setColor("#FF0000")
				.setTitle("No Alerts!")
				.setDescription(`\n${randomQuote}`)
				.setThumbnail("https://i.pinimg.com/564x/43/89/55/438955da8ffeba5ba95a0b8a7a3feece.jpg")
				.setFooter({ text: "Check back regularly for more updates!" })

			await interaction.reply({ embeds: [noAlertEmbed], ephemeral: true })
			return
		}

		// Create the alert message
		const alertMessages = unreadAlerts.map(alert => alert.message).join("\n")
		const alertEmbed = new EmbedBuilder()
			.setColor("#FF0000")
			.setTitle("🚨 Alerts!")
			.setDescription(alertMessages)
			.setFooter({ text: "Check back regularly for more updates!" })

		await interaction.reply({ embeds: [alertEmbed], ephemeral: true })

		await alertsCollection.updateMany({ userId, read: false }, { $set: { read: true } })
	} catch (error) {
		logger.error(`Error handling alerts for user ${userId}:`, error)
		await interaction.reply({
			content: "There was an error retrieving your alerts. Please try again later.",
			ephemeral: true
		})
	}
}
export async function handleAcceptTrade(interaction: ChatInputCommandInteraction) {
	try {
		const userId = interaction.user.id
		const tradeRequests = await viewTradeRequests(userId)

		if (tradeRequests.length === 0) {
			await interaction.reply("You have no pending trade requests.")
			return
		}

		const options = tradeRequests.map(request => ({
			label: request.item,
			description: `From: ${request.initiatorId} (Qty: ${request.quantity})`,
			value: request._id.toString()
		}))

		const selectMenu = new SelectMenuBuilder()
			.setCustomId("accept_trade_select")
			.setPlaceholder("Select a trade request to accept")
			.addOptions(options)

		const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

		await interaction.reply({
			content: "Choose a trade request to accept:",
			components: [actionRow],
			ephemeral: true
		})
	} catch (error) {
		logger.error("Error in handleAcceptTrade:", error)
		await interaction.reply("An error occurred while processing your trade acceptance. Please try again later.")
	}
}

const processedTrades = new Set<string>()
const pendingInteractions = new Set<string>()

export async function processTradeSelection(interaction: Interaction) {
	const interactionId = interaction.id
	logger.info(`Processing trade selection for interaction ID: ${interactionId}`)

	if (!interaction.isStringSelectMenu()) {
		return
	}

	const stringSelectMenuInteraction = interaction as StringSelectMenuInteraction
	if (!stringSelectMenuInteraction.customId.startsWith("accept_trade_select")) {
		return
	}

	const selectedTradeId = stringSelectMenuInteraction.values[0]

	if (pendingInteractions.has(interactionId)) {
		logger.warn(`Interaction ID: ${interactionId} is already being processed.`)
		return
	}

	pendingInteractions.add(interactionId)

	if (processedTrades.has(selectedTradeId)) {
		logger.warn(`Trade ID: ${selectedTradeId} has already been processed.`)
		pendingInteractions.delete(interactionId)
		return
	}

	logger.info("Handling trade selection...")
	logger.debug(`Selected trade ID: ${selectedTradeId}`)
	logger.debug("Start processing trade acceptance...")

	let replied = false

	if (!stringSelectMenuInteraction.deferred && !stringSelectMenuInteraction.replied) {
		await stringSelectMenuInteraction.deferReply({ ephemeral: true })
		replied = true
	}

	try {
		await handleTradeAcceptance(selectedTradeId, stringSelectMenuInteraction.user.id)
		logger.info("Trade request accepted successfully!")

		processedTrades.add(selectedTradeId)

		if (replied) {
			try {
				await stringSelectMenuInteraction.editReply({
					content: "Trade request accepted successfully!",
					components: []
				})
			} catch (error) {
				if (error.code === 10062) {
					logger.warn("Unknown interaction error occurred while updating reply:", error)
				} else {
					throw error
				}
			}
		}
	} catch (error) {
		logger.error("Error handling trade acceptance:", error)
		if (!stringSelectMenuInteraction.replied && !stringSelectMenuInteraction.deferred) {
			await stringSelectMenuInteraction.reply({
				content: "An error occurred while processing the trade.",
				ephemeral: true
			})
		} else if (stringSelectMenuInteraction.deferred) {
			await stringSelectMenuInteraction.editReply({
				content: "An error occurred while processing the trade.",
				components: []
			})
		}
	} finally {
		pendingInteractions.delete(interactionId)
	}
}

export async function handlePreviousTradesCommand(interaction) {
	await updateUserCommandsUsed(interaction.user.id)
	const userId = interaction.user.id

	try {
		const previousTrades = await getPreviousTrades(userId)

		if (previousTrades.length === 0) {
			await interaction.reply("You don't have any previous trades.")
			return
		}

		await paginateTrades(interaction, previousTrades, "Previous Trades")
	} catch (error) {
		logger.error("Error fetching previous trades:", error)
		await interaction.reply({ content: "An error occurred while fetching your trades.", ephemeral: true })
	}
}
export async function handleActiveTradesCommand(interaction) {
	const userId = interaction.user.id

	try {
		const activeTrades = await getActiveTrades(userId)

		if (activeTrades.length === 0) {
			await interaction.reply("You don't have any active trades.")
			return
		}

		await paginateTrades(interaction, activeTrades, "Active Trades")
	} catch (error) {
		logger.error("Error fetching active trades:", error)
		await interaction.reply({ content: "An error occurred while fetching your trades.", ephemeral: true })
	}
}

async function paginateTrades(interaction, trades, title) {
	const itemsPerPage = 5
	let page = 0
	const maxPages = Math.ceil(trades.length / itemsPerPage) - 1

	const generateEmbed = currentPage => {
		const start = currentPage * itemsPerPage
		const end = start + itemsPerPage
		const pageTrades = trades.slice(start, end)

		return new EmbedBuilder()
			.setColor("Aqua")
			.setTitle(title)
			.setDescription(
				pageTrades
					.map(
						trade =>
							`**Item:** ${trade.item} (x${trade.quantity})
                **With:** <@${trade.targetUserId}>
                **Status:** ${trade.status}
                **Date:** ${trade.createdAt.toLocaleDateString()}`
					)
					.join("\n\n")
			)
			.setFooter({ text: `Page ${currentPage + 1} of ${maxPages + 1}` })
	}

	const initialEmbed = generateEmbed(page)
	const msg = await interaction.reply({ embeds: [initialEmbed], fetchReply: true })

	await msg.react("⬅️")
	await msg.react("➡️")

	const filter = (reaction, user) =>
		(reaction.emoji.name === "⬅️" || reaction.emoji.name === "➡️") && user.id === interaction.user.id
	const collector = msg.createReactionCollector({ filter, time: 60000 })

	collector.on("collect", reaction => {
		if (reaction.emoji.name === "⬅️") {
			page = (page - 1 + maxPages + 1) % (maxPages + 1)
		} else {
			page = (page + 1) % (maxPages + 1)
		}
		msg.edit({ embeds: [generateEmbed(page)] })
		reaction.users.remove(interaction.user.id)
	})
}

export async function handleDonateCommand(interaction) {
	await updateUserCommandsUsed(interaction.user.id)

	const targetUser = interaction.options.getUser("user")
	const amount = interaction.options.getInteger("amount")

	if (!targetUser) {
		await interaction.reply({ content: "The user you are trying to donate to does not exist.", ephemeral: true })
		return
	}

	const targetUserId = targetUser.id
	const isTargetUserRegistered = await isUserRegistered(targetUserId)

	if (!isTargetUserRegistered) {
		await interaction.reply({ content: "The user you are trying to donate to is not registered.", ephemeral: true })
		return
	}

	if (amount <= 0) {
		await interaction.reply({ content: "You must donate a positive amount of coins.", ephemeral: true })
		return
	}

	const userId = interaction.user.id
	const userBalance = await getBalance(userId)

	if (amount > userBalance) {
		await interaction.reply({ content: "You do not have enough coins to donate.", ephemeral: true })
		return
	}

	await updateBalance(userId, -amount)
	await updateBalance(targetUserId, amount)

	await interaction.reply({
		content: `You have donated ${amount} coins to ${targetUser.username}.`,
		ephemeral: true
	})
}

export async function handleEquipTechniqueCommand(interaction) {
	const userId = interaction.user.id
	const inputTechniquesString = interaction.options.getString("techniques")
	const inputTechniqueNames = inputTechniquesString.split(",").map(name => name.trim())

	await updateUserCommandsUsed(interaction.user.id)

	try {
		const userHasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(userId)
		const userTechniques = await getUserTechniques(userId)
		const userHeavenlyTechniques = await getUserHeavenlyTechniques(userId)
		const activeNormalTechniques = await getUserActiveTechniques(userId)
		const activeHeavenlyTechniques = await getUserActiveHeavenlyTechniques(userId)

		const userTechniquesLowercaseMap = new Map(userTechniques.map(name => [name.toLowerCase(), name]))
		const userHeavenlyTechniquesLowercaseMap = new Map(
			userHeavenlyTechniques.map(name => [name.toLowerCase(), name])
		)

		const invalidTechniques = inputTechniqueNames.filter(
			name =>
				!userTechniquesLowercaseMap.has(name.toLowerCase()) &&
				!userHeavenlyTechniquesLowercaseMap.has(name.toLowerCase())
		)

		if (invalidTechniques.length > 0) {
			return await interaction.reply({
				content: `You don't own the following techniques: ${invalidTechniques.join(", ")}`,
				ephemeral: true
			})
		}

		const techniquesToActivate = inputTechniqueNames
			.filter(
				name =>
					userTechniquesLowercaseMap.has(name.toLowerCase()) ||
					userHeavenlyTechniquesLowercaseMap.has(name.toLowerCase())
			)
			.map(
				name =>
					userTechniquesLowercaseMap.get(name.toLowerCase()) ||
					userHeavenlyTechniquesLowercaseMap.get(name.toLowerCase())
			)

		const normalTechniquesToActivate = techniquesToActivate.filter(
			technique => !isHeavenlyRestrictionTechnique(technique)
		)
		const heavenlyTechniquesToActivate = techniquesToActivate.filter(technique =>
			isHeavenlyRestrictionTechnique(technique)
		)

		if (!userHasHeavenlyRestriction && heavenlyTechniquesToActivate.length > 0) {
			return await interaction.reply(
				"You don't have Heavenly Restriction. You can't equip Heavenly Restriction techniques."
			)
		}

		const updatedActiveNormalTechniques = [...activeNormalTechniques, ...normalTechniquesToActivate]
		const updatedActiveHeavenlyTechniques = userHasHeavenlyRestriction
			? [...activeHeavenlyTechniques, ...heavenlyTechniquesToActivate]
			: activeHeavenlyTechniques

		await updateUserActiveTechniques(userId, updatedActiveNormalTechniques)
		await updateUserActiveHeavenlyTechniques(userId, updatedActiveHeavenlyTechniques)

		const activatedNormalTechniquesDisplay = normalTechniquesToActivate.join(", ")
		const activatedHeavenlyTechniquesDisplay = heavenlyTechniquesToActivate.join(", ")

		let response = ""
		if (activatedNormalTechniquesDisplay) {
			response += `Normal Techniques equipped: ${activatedNormalTechniquesDisplay}\n`
		}
		if (activatedHeavenlyTechniquesDisplay) {
			response += `Heavenly Restriction Techniques equipped: ${activatedHeavenlyTechniquesDisplay}`
		}

		await interaction.reply(response.trim())

		const userState = await getUserTutorialState(userId)
		if (userState && userState.techniqueEquipped === undefined) {
			userState.techniqueEquipped = true
			await setUserTutorialState(userId, userState)

			const tutorialMessageId = userState.tutorialMessageId

			if (tutorialMessageId) {
				const dmChannel = await interaction.user.createDM()
				const tutorialMessage = await dmChannel.messages.fetch(tutorialMessageId)

				if (tutorialMessage) {
					const step = 3
					const buttons = await getButtons(step, userId)

					await tutorialMessage.edit({
						embeds: [tutorialPages[step]],
						components: [buttons]
					})
				}
			}
		}
	} catch (error) {
		logger.error("Error equipping techniques:", error)
		return await interaction.reply({
			content: "There was an error equipping your techniques. Please try again later.",
			ephemeral: true
		})
	}
}

function isHeavenlyRestrictionTechnique(technique: string): boolean {
	return Object.values(heavenlyrestrictionskills).some(clanSkills =>
		clanSkills.some(skill => skill.name === technique)
	)
}

//
//
///
///

export async function handleUnequipTechniqueCommand(interaction) {
	const userId = interaction.user.id
	const techniqueNamesInput = interaction.options.getString("techniques")

	if (!techniqueNamesInput) {
		return await interaction.reply({
			content: "Please provide a comma-separated list of technique names.",
			ephemeral: true
		})
	}

	const techniqueNames = techniqueNamesInput.split(",").map(name => name.trim().toLowerCase())

	await updateUserCommandsUsed(userId)

	try {
		const userHasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(userId)
		let activeNormalTechniques = await getUserActiveTechniques(userId)
		let activeHeavenlyTechniques = await getUserActiveHeavenlyTechniques(userId)

		activeNormalTechniques = Array.isArray(activeNormalTechniques)
			? activeNormalTechniques.filter(name => name != null).map(name => name.trim())
			: []
		activeHeavenlyTechniques = Array.isArray(activeHeavenlyTechniques)
			? activeHeavenlyTechniques.filter(name => name != null).map(name => name.trim())
			: []

		const activeNormalTechniquesLowercaseMap = new Map(
			activeNormalTechniques.map(name => [name.toLowerCase(), name])
		)
		const activeHeavenlyTechniquesLowercaseMap = new Map(
			activeHeavenlyTechniques.map(name => [name.toLowerCase(), name])
		)

		const unequippedNormalTechniques = []
		const unequippedHeavenlyTechniques = []

		for (const techniqueName of techniqueNames) {
			const techniqueNameLowercase = techniqueName.toLowerCase()

			if (activeNormalTechniquesLowercaseMap.has(techniqueNameLowercase)) {
				activeNormalTechniques = activeNormalTechniques.filter(
					technique => technique.toLowerCase() !== techniqueNameLowercase
				)
				unequippedNormalTechniques.push(activeNormalTechniquesLowercaseMap.get(techniqueNameLowercase))
			} else if (activeHeavenlyTechniquesLowercaseMap.has(techniqueNameLowercase)) {
				if (!userHasHeavenlyRestriction) {
					return await interaction.reply({
						content:
							"You don't have Heavenly Restriction On! You can't unequip Heavenly Restriction techniques.",
						ephemeral: true
					})
				}
				activeHeavenlyTechniques = activeHeavenlyTechniques.filter(
					technique => technique.toLowerCase() !== techniqueNameLowercase
				)
				unequippedHeavenlyTechniques.push(activeHeavenlyTechniquesLowercaseMap.get(techniqueNameLowercase))
			} else {
				return await interaction.reply({
					content: `The technique "${techniqueName}" is not currently equipped.`,
					ephemeral: true
				})
			}
		}

		await updateUserActiveTechniques(userId, activeNormalTechniques)
		await updateUserActiveHeavenlyTechniques(userId, activeHeavenlyTechniques)

		let response = ""
		if (unequippedNormalTechniques.length > 0) {
			response += `Normal Technique(s) '${unequippedNormalTechniques.join(", ")}' unequipped!\n`
		}
		if (unequippedHeavenlyTechniques.length > 0) {
			response += `Heavenly Restriction Technique(s) '${unequippedHeavenlyTechniques.join(", ")}' unequipped!`
		}

		await interaction.reply(response.trim())
	} catch (error) {
		logger.error("Error unequipping technique:", error)
		return await interaction.reply({
			content: "There was an error unequipping your technique. Please try again later.",
			ephemeral: true
		})
	}
}
export async function handleViewTechniquesCommand(interaction) {
	const userId = interaction.user.id

	try {
		const userTechniques = await getUserTechniques(userId)
		const userHeavenlyTechniques = await getUserHeavenlyTechniques(userId)
		await updateUserCommandsUsed(interaction.user.id)

		if (userTechniques.length === 0 && userHeavenlyTechniques.length === 0) {
			return await interaction.reply({ content: "You do not own any techniques.", ephemeral: true })
		}

		const embed = new EmbedBuilder()
			.setTitle("Your Owned Techniques")
			.setDescription(
				"These are the techniques you own. Use `/technique equip` to equip them, Owned techniques are shown in /jujutsustatus"
			)
			.setColor("#7289DA")
			.setTimestamp()

		const chunkSize = 10
		const chunkedTechniques = chunkArray(userTechniques, chunkSize)
		const chunkedHeavenlyTechniques = chunkArray(userHeavenlyTechniques, chunkSize)

		chunkedTechniques.forEach((chunk, index) => {
			const techniques = chunk.map((technique, i) => `${index * chunkSize + i + 1}. ${technique}`).join("\n")
			embed.addFields({
				name: `Normal Techniques (${index * chunkSize + 1}-${index * chunkSize + chunk.length})`,
				value: techniques
			})
		})

		chunkedHeavenlyTechniques.forEach((chunk, index) => {
			const techniques = chunk.map((technique, i) => `${index * chunkSize + i + 1}. ${technique}`).join("\n")
			embed.addFields({
				name: `Heavenly Restriction Techniques (${index * chunkSize + 1}-${index * chunkSize + chunk.length})`,
				value: techniques
			})
		})

		await interaction.reply({ embeds: [embed] })
		await postCommandMiddleware(interaction)
	} catch (error) {
		logger.error("Error fetching user techniques:", error)
		await interaction.reply({ content: "An error occurred while fetching your techniques.", ephemeral: true })
	}
}

function chunkArray(array, chunkSize) {
	const chunks = []
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize))
	}
	return chunks
}

export async function handleEquipTransformationCommand(interaction: ChatInputCommandInteraction) {
	try {
		const unlockedTransformations = await getUserUnlockedTransformations(interaction.user.id)
		await updateUserCommandsUsed(interaction.user.id)

		const currentTransformation = await getUserTransformation(interaction.user.id)
		const availableTransformations = unlockedTransformations.filter(transformationName => {
			return transformationName && transformationName.trim() !== currentTransformation
		})

		if (availableTransformations.length === 0) {
			await interaction.reply({
				content: "You have no transformations to equip.",
				ephemeral: true
			})
			return
		}

		const selectMenu = createTransformationSelectMenu(availableTransformations)
		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

		await interaction.reply({
			content: "Choose a transformation to equip:",
			components: [row],
			ephemeral: false
		})

		const filter = (i: Interaction): i is StringSelectMenuInteraction =>
			i.isStringSelectMenu() && i.customId === selectMenu.data.custom_id && i.user.id === interaction.user.id
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

		collector.on("collect", async (selectMenuInteraction: StringSelectMenuInteraction) => {
			await selectMenuInteraction.deferReply({ ephemeral: false })

			const selectedTransformationName = selectMenuInteraction.values[0]

			await updateUserTransformation(interaction.user.id, selectedTransformationName, {
				transformation: selectedTransformationName
			})

			await selectMenuInteraction.editReply({
				content: `You have equipped ${selectedTransformationName}!`,
				components: []
			})

			collector.stop()
		})

		collector.on("end", async (collected, reason) => {
			if (reason === "time") {
				await interaction.editReply({
					content: "The selection menu has timed out. Please try again.",
					components: []
				})
			}
		})
	} catch (error) {
		logger.error("Error handling equip transformation command:", error)
		await interaction.reply({
			content: "An error occurred while equipping the transformation.",
			ephemeral: true
		})
	}
}

function createTransformationSelectMenu(transformations) {
	const selectMenu = new SelectMenuBuilder()
		.setCustomId("equip_transformation_menu")
		.setPlaceholder("Select a Transformation")

	transformations.forEach(transformationName => {
		if (typeof transformationName === "string" && transformationName.trim() !== "") {
			selectMenu.addOptions({
				label: transformationName,
				value: transformationName
			})
		} else {
			logger.info("Invalid transformation name:", transformationName)
		}
	})

	return selectMenu
}

const userVoteTimestamps = {}

export async function handleClaimVoteRewards(interaction) {
	await updateUserCommandsUsed(interaction.user.id)
	const Topgg = import("@top-gg/sdk")
	const userId = interaction.user.id
	const top = new (await Topgg).Api(process.env.TOPGG)

	await interaction.deferReply()

	const hasVoted = await top.hasVoted(userId)

	if (!hasVoted) {
		const voteEmbed = new EmbedBuilder()
			.setTitle("Vote for Rewards!")
			.setDescription("It seems you haven't voted yet. Support the bot and earn rewards by voting here:")
		const voteButton = new ButtonBuilder()
			.setLabel("Vote Now")
			.setStyle(ButtonStyle.Link)
			.setURL("https://top.gg/bot/991443928790335518/vote") // Replace with your bot's voting link
		const row = new ActionRowBuilder().addComponents(voteButton)
		await interaction.editReply({ embeds: [voteEmbed], components: [row] })
		return
	}

	const lastVoteTime = userVoteTimestamps[userId]
	const currentTime = Date.now()

	if (lastVoteTime && currentTime - lastVoteTime < 12 * 60 * 60 * 1000) {
		const timeLeft = (12 * 60 * 60 * 1000 - (currentTime - lastVoteTime)) / 3600000
		const cooldownEmbed = new EmbedBuilder()
			.setTitle("Vote Cooldown")
			.setDescription(
				`You have already claimed your vote rewards. Please wait ${timeLeft.toFixed(
					1
				)} hours before voting again.`
			)
		await interaction.editReply({ embeds: [cooldownEmbed] })
		return
	}

	userVoteTimestamps[userId] = currentTime

	const voteReward = 100000
	await updateBalance(userId, voteReward)
	await addItemToUserInventory(userId, "Cursed Vote Chest", 1)

	const claimedEmbed = new EmbedBuilder()
		.setTitle("Rewards Claimed!")
		.setDescription(`You have claimed your vote rewards of ${voteReward} coins! + 1 Cursed Vote Chest`)
	await interaction.followUp({ embeds: [claimedEmbed] })
}

export async function handleShopCommand(interaction) {
	const shopItems = await getAllShopItems()
	const raidShopItems = [
		{ name: "Jogo's Testicle Torsion Technique", price: 1000, rarity: "Common", maxPurchases: 1 },
		{ name: "Heian Era Awakening", price: 450, rarity: "Common", maxPurchases: 1 },
		{ name: "Satoru Gojo's Ashy Remains", price: 100, rarity: "Rare" }
	]
	const shikigamiShopItems = [
		{ name: "Shikigami food", price: 50000, rarity: "Common" },
		{ name: "Special-Grade Medicine", price: 85000, rarity: "Rare" }
	]
	const essenceShopItems = [
		{ name: "RCT Essence", price: 350000000, rarity: "Special Grade" },
		{ name: "Simple Domain Essence", price: 550000000, rarity: "Special Grade" },
		{ name: "Luck Essence", price: 12500000, rarity: "Special Grade" }
	]

	const balance = await getBalance(interaction.user.id)
	const balance2 = balance.toLocaleString("en-US")

	try {
		const lastResetTime = await getShopLastReset()
		const resetIntervalMs = 1000 * 60 * 60 * 24
		const nextResetTime = new Date(lastResetTime.getTime() + resetIntervalMs)
		const discordTimestamp = Math.floor(nextResetTime.getTime() / 1000)
		const userInventory = await getUserInventory(interaction.user.id)
		const raidTokenItem = userInventory.find(item => item.name === "Raid Token")
		const raidTokens = raidTokenItem ? raidTokenItem.quantity : 0

		const embed = new EmbedBuilder()
			.setColor("#FFD700")
			.setTitle("✨ Shop Items ✨")
			.setDescription(`\n💰 Your balance: **${balance2}**\nCheck out these limited-time offers:`)
			.addFields([{ name: "Resets In", value: `<t:${discordTimestamp}:R>`, inline: false }])

		const mainShopItemsField = shopItems
			.map(item => {
				return (
					`**${item.name}** - ${item.rarity} Rarity\n` +
					`Price: **${item.price.toLocaleString("en-US") || "None"}** coins\n` +
					`Max Purchases: **${item.maxPurchases || "None"}**\n` +
					"--------------------"
				)
			})
			.join("\n")

		embed.addFields([{ name: "Items in Main Shop", value: mainShopItemsField }])

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("shop_select")
			.setPlaceholder("Select a shop")
			.addOptions([
				{
					label: "Main Shop",
					description: "View items in the main shop",
					value: "main_shop",
					emoji: "💰"
				},
				{
					label: "Shikigami Shop",
					description: "View items in the shikigami shop",
					value: "shikigami_shop",
					emoji: "🐺"
				},
				{
					label: "Raid Shop",
					description: "View items in the raid shop",
					value: "raid_shop",
					emoji: "⚔️"
				},
				{
					label: "Essence Shop",
					description: "View items in the essence shop",
					value: "essence_shop",
					emoji: "✨"
				}
			])

		const row = new ActionRowBuilder().addComponents(selectMenu)

		const buttonRow = new ActionRowBuilder()
		shopItems.forEach((item, index) => {
			if (item && item.name && typeof item.price !== "undefined" && item.rarity) {
				const button = new ButtonBuilder()
					.setCustomId(`buy_main_shop_${index}`)
					.setLabel(item.name)
					.setStyle(ButtonStyle.Primary)
				buttonRow.addComponents(button)
			}
		})

		let selectedShop = "main_shop"

		const message = await interaction.reply({ embeds: [embed], components: [row, buttonRow], fetchReply: true })

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.StringSelect
		})

		collector.on("collect", async i => {
			if (!i.isStringSelectMenu()) return
			await i.deferUpdate()

			selectedShop = i.values[0]
			let selectedShopItems = []
			let formattedShopName = ""

			if (selectedShop === "main_shop") {
				selectedShopItems = shopItems
				formattedShopName = "Main Shop"
			} else if (selectedShop === "raid_shop") {
				selectedShopItems = raidShopItems
				formattedShopName = "Raid Shop"
			} else if (selectedShop === "shikigami_shop") {
				selectedShopItems = shikigamiShopItems
				formattedShopName = "Shikigami Shop"
			} else if (selectedShop === "essence_shop") {
				selectedShopItems = essenceShopItems
				formattedShopName = "Essence Shop"
			}

			const itemsField = selectedShopItems
				.map(item => {
					return (
						`**${item.name}** - ${item.rarity} Rarity\n` +
						`Price: **${item.price.toLocaleString("en-US") || "None"}** ${selectedShop === "raid_shop" ? "Raid Tokens" : "coins"}\n` +
						`Max Purchases: **${item.maxPurchases || "None"}**\n` +
						"--------------------"
					)
				})
				.join("\n")

			embed.spliceFields(1, 1, { name: `Items in ${formattedShopName}`, value: itemsField })

			if (selectedShop === "raid_shop") {
				embed.setDescription(
					`\n💰 Your balance: **${balance2}**\n🎟️ Your Raid Tokens: **${raidTokens}**\nCheck out these limited-time offers:`
				)
			} else {
				embed.setDescription(`\n💰 Your balance: **${balance2}**\nCheck out these limited-time offers:`)
			}

			const buttonRow = new ActionRowBuilder()
			selectedShopItems.forEach((item, index) => {
				if (item && item.name && typeof item.price !== "undefined" && item.rarity) {
					const button = new ButtonBuilder()
						.setCustomId(`buy_${selectedShop}_${index}`)
						.setLabel(item.name)
						.setStyle(ButtonStyle.Primary)
					buttonRow.addComponents(button)
				}
				logger.debug("Custom ID:", `buy_${selectedShop}_${index}`)
			})

			await i.editReply({ embeds: [embed], components: [row, buttonRow] })
		})

		collector.on("end", collected => {
			logger.info(`Collected ${collected.size} interactions.`)
		})

		const buttonCollector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 15000
		})

		buttonCollector.on("collect", async i => {
			if (!i.isButton()) return
			await i.deferUpdate()

			const userId = i.user.id
			const customIdMatch = i.customId.match(/^buy_(main|raid|shikigami|essence)_shop_(\d+)$/)

			if (!customIdMatch) {
				logger.error("Invalid custom ID format:", i.customId)
				await i.followUp({ content: "Invalid custom ID format.", ephemeral: true })
				return
			}

			const [_, shopType, itemIndexStr] = customIdMatch

			logger.debug("Shop Type:", shopType)
			logger.debug("Item Index Str:", itemIndexStr)

			const itemIndex = parseInt(itemIndexStr, 10)

			logger.debug("Parsed Item Index:", itemIndex)

			let selectedShopItems = []

			if (shopType === "main") {
				selectedShopItems = shopItems
			} else if (shopType === "raid") {
				selectedShopItems = raidShopItems
			} else if (shopType === "shikigami") {
				selectedShopItems = shikigamiShopItems
			} else if (shopType === "essence") {
				selectedShopItems = essenceShopItems
			}

			if (itemIndex >= 0 && itemIndex < selectedShopItems.length) {
				const itemToBuy = selectedShopItems[itemIndex]
				logger.debug("Item to Buy:", itemToBuy)

				const userPurchases = await getUserPurchases(userId)
				const userItemPurchase = userPurchases.find(p => p.itemName === itemToBuy.name) || {
					itemName: itemToBuy.name,
					purchasedAmount: 0
				}

				if (userItemPurchase.purchasedAmount >= itemToBuy.maxPurchases) {
					await i.followUp({
						content: `You have reached the purchase limit for ${itemToBuy.name}.`,
						ephemeral: true
					})
					return
				}

				if (itemToBuy.name === "Heian Era Awakening") {
					const userUnlockedTransformations = await getUserUnlockedTransformations(userId)
					const updatedUnlockedTransformations = [...userUnlockedTransformations, "Heian Era Awakening"]
					await updateUserUnlockedTransformations(userId, updatedUnlockedTransformations)
				}

				if (itemToBuy.name === "Jogo's Testicle Torsion Technique") {
					await addUserTechnique(userId, "Jogo's Testicle Torsion Technique")
				}

				if (shopType === "raid") {
					const userInventory = await getUserInventory(userId)
					const raidTokenItem = userInventory.find(item => item.name === "Raid Token")
					const raidTokens = raidTokenItem ? raidTokenItem.quantity : 0

					if (raidTokens < itemToBuy.price) {
						await i.followUp({
							content: `You do not have enough Raid Tokens to purchase ${itemToBuy.name}. Required: ${itemToBuy.price.toLocaleString("en-US")}, You have: ${raidTokens.toLocaleString("en-US")}`,
							ephemeral: true
						})
						return
					}

					await removeItemFromUserInventory(userId, "Raid Token", itemToBuy.price)
				} else {
					const balance = await getBalance(userId)

					if (balance < itemToBuy.price) {
						await i.followUp({
							content: `You do not have enough coins to purchase ${itemToBuy.name}.`,
							ephemeral: true
						})
						return
					}

					await updateBalance(userId, -itemToBuy.price)
				}

				await addItemToUserInventory(userId, itemToBuy.name, 1)
				await addUserPurchases(userId, itemToBuy.name, 1)
				await i.followUp({
					content: `You have purchased ${itemToBuy.name} for ${itemToBuy.price.toLocaleString("en-US")} ${shopType === "raid" ? "Raid Tokens" : "coins"}.`,
					ephemeral: true
				})
			} else {
				logger.error("Invalid item index:", itemIndex)
				await i.followUp({ content: "This item does not exist in the shop.", ephemeral: true })
			}
		})

		buttonCollector.on("end", collected => {
			logger.info(`Collected ${collected.size} interactions.`)
		})

		buttonCollector.stop
	} catch (error) {
		logger.error("Error fetching shop items:", error)
		await interaction.reply({ content: "An error occurred while fetching shop items.", ephemeral: true })
	}
}

// equip inate clan use getuserownedinateclan
export async function handleEquipInateClanCommand(interaction) {
	await updateUserCommandsUsed(interaction.user.id)

	const userId = interaction.user.id
	const clanName = interaction.options.getString("clan")

	const userClans = await getUserOwnedInateClan(userId)

	if (!userClans || !userClans.includes(clanName)) {
		await interaction.reply({
			content: "You do not own this clan.",
			ephemeral: true
		})
		return
	}

	await updateUserInateClan(userId, clanName)
	await interaction.reply(`You have equipped the ${clanName} clan.`)
}

export async function handleTame(interaction: ChatInputCommandInteraction) {
	const playerHealth1 = await getUserMaxHealth(interaction.user.id)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const userTechniquesTame = new Map<string, any>()

	await updateUserHealth(interaction.user.id, playerHealth1)
	await interaction.deferReply()
	await updateUserCommandsUsed(interaction.user.id)

	const chosenShikigamiName = interaction.options.getString("shikigami")

	const userShikigami: { name: string }[] = await getUserShikigami(interaction.user.id)

	const isMahoraga = chosenShikigamiName === "Mahoraga"

	if (isMahoraga) {
		const requiredShikigami = ["Divine Dogs", "Nue", "Toad", "Max Elephant"]
		const hasRequiredShikigami = requiredShikigami.every(shikigamiName => {
			return userShikigami.some(shikigami => shikigami.name === shikigamiName)
		})

		if (!hasRequiredShikigami) {
			const userShikigamiValue =
				userShikigami.length > 0 ? userShikigami.map(shikigami => shikigami.name).join(", ") : "None"

			const errorEmbed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("Insufficient Shikigami")
				.setDescription("You do not have all the necessary Shikigami to summon **MAHORAGA**")
				.addFields(
					{ name: "Required Shikigami", value: requiredShikigami.join(", ") },
					{ name: "Your Shikigami", value: userShikigamiValue }
				)

			await interaction.followUp({
				ephemeral: true,
				embeds: [errorEmbed]
			})

			return
		}
	}

	// Fetch the shikigami based on the chosen name
	const allBosses = await getShikigami(interaction.user.id)
	const chosenShikigami = allBosses.find(boss => boss.name === chosenShikigamiName)

	if (!chosenShikigami) {
		logger.error(`No shikigami found with the name ${chosenShikigamiName}`)
		await interaction.editReply({ content: `No shikigami found with the name ${chosenShikigamiName}` })
		return
	}

	const randomChance = Math.random()

	const divineGeneralChance = 0.008

	if (chosenShikigami.name === "Mahoraga" && randomChance < divineGeneralChance) {
		chosenShikigami.name = "Divine-General Mahoraga"
		chosenShikigami.current_health = 650
		chosenShikigami.max_health = 650
		chosenShikigami.grade = "Unknown...?"
		chosenShikigami.image_url = "https://media1.tenor.com/m/T7rdnze2j8oAAAAd/gojo-mahoraga.gif"
	}

	const randomOpponent = chosenShikigami

	const cursedEnergyPurple = parseInt("#8A2BE2".replace("#", ""), 16)
	const playerHealth = await getUserMaxHealth(interaction.user.id)
	const hasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(interaction.user.id)
	//
	const userTechniques = hasHeavenlyRestriction
		? await getUserActiveHeavenlyTechniques(interaction.user.id)
		: await getUserActiveTechniques(interaction.user.id)
	const transformname = await getUserTransformation(interaction.user.id)
	const domainname = await getUserDomain(interaction.user.id)

	const techniqueOptions =
		userTechniques && userTechniques.length > 0
			? userTechniques.map(techniqueName => ({
					label: techniqueName,
					description: "Select to use this technique",
					value: techniqueName
				}))
			: []

	const battleOptions = [
		{
			label: "Domain Expansion",
			value: "domain",
			description: domainname || "🔒 Domain Not Unlocked", // Default value if undefined
			emoji: {
				name: "1564maskedgojode",
				id: "1220626413141622794"
			}
		},
		{
			label: "Transform",
			value: "transform",
			description: transformname || "No transformation available", // Default value if undefined
			emoji: {
				name: "a:blueflame",
				id: "990539090418098246"
			}
		},
		...techniqueOptions
	]

	const selectMenu = new SelectMenuBuilder()
		.setCustomId("select-battle-option")
		.setPlaceholder("Choose your technique")
		.addOptions(battleOptions)

	const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu)

	// Create embed
	const primaryEmbed = new EmbedBuilder()
		.setColor(cursedEnergyPurple)
		.setTitle(
			randomOpponent.name === "Divine-General Mahoraga" ? "🌟 Divine-General Mahoraga..? 🌟" : "Cursed Battle!"
		)
		.setDescription(`You're facing **${randomOpponent.name}**! Choose your technique wisely.`)
		.setImage(randomOpponent.image_url)
		.addFields(
			{ name: "Boss Health", value: `:heart: ${randomOpponent.current_health.toString()}`, inline: true },
			{ name: "Boss Grade", value: `${randomOpponent.grade}`, inline: true },
			{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true }
		)
		.addFields(
			{
				name: "Boss Health Status",
				value: generateHealthBar(randomOpponent.current_health, randomOpponent.max_health),
				inline: false
			},
			{
				name: "Player Health Status",
				value: generateHealthBar(playerHealth, playerHealth1),
				inline: false
			}
		)
		.addFields(
			{ name: "Enemy Technique", value: "*Enemy technique goes here*", inline: false },
			{ name: "Status Effect Boss", value: "None", inline: true },
			{ name: "Status Effect Player", value: "None", inline: true }
		)
	if (randomOpponent.name === "Divine-General Mahoraga") {
		primaryEmbed.setColor("Gold")
	}

	const remainingHealthPercentage = randomOpponent.current_health / randomOpponent.max_health
	if (remainingHealthPercentage < 0.5) {
		primaryEmbed.setFooter({ text: "The opponent is getting weaker!" })
	}

	await interaction.editReply({
		embeds: [primaryEmbed],
		components: [row]
	})

	// Handle user selection
	const battleOptionSelectMenuCollector = interaction.channel.createMessageComponentCollector({
		filter: inter => inter.customId === "select-battle-option" && inter.message.interaction.id === interaction.id,
		componentType: ComponentType.StringSelect,
		time: 300000 // 60 seconds
	})

	battleOptionSelectMenuCollector.on("collect", async collectedInteraction => {
		await collectedInteraction.deferUpdate()
		if (collectedInteraction.user.id !== interaction.user.id) return
		const selectedValue = collectedInteraction.values[0]
		const playerHealth = await getUserHealth(collectedInteraction.user.id)

		logger.info("Selected value:", selectedValue)
		if (selectedValue === "domain") {
			logger.info("Domain expansion selected.")
			if (domainActivationState.get(contextKey)) {
				await collectedInteraction.followUp({
					content: "You can only activate your domain once per fight.",
					ephemeral: true
				})
				return
			}

			try {
				const hasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(interaction.user.id)

				if (hasHeavenlyRestriction) {
					await collectedInteraction.followUp({
						content: "Your Heavenly Restriction negates the use of domain expansion.",
						ephemeral: true
					})
					return
				}

				const domainInfo = await getUserDomain(interaction.user.id)
				if (!domainInfo) {
					await collectedInteraction.followUp({
						content: "You do not have a domain unlocked yet.",
						ephemeral: true
					})
					return
				}

				const domainObject = DOMAIN_EXPANSIONS.find(domain => domain.name === domainInfo)
				if (!domainObject) {
					logger.error("Invalid domain found in the database.")
					return
				}
				domainActivationState.set(contextKey, true)
				// embed here
				const domainEmbed = new EmbedBuilder()
					.setColor("Blue")
					.setTitle(`${randomOpponent.name}  I'll show you real jujutsu..`)
					.setDescription(`Domain Expansion... ${domainInfo}`)
					.addFields({
						name: `${interaction.user.username}`,
						value: "USES THERE DOMAIN EXPANSION!",
						inline: false
					})
				//add image
				if (domainObject.open_image_URL) {
					domainEmbed.setImage(domainObject.open_image_URL)
				}
				await collectedInteraction.editReply({ embeds: [domainEmbed], components: [] })

				// Wait for 2 seconds before updating
				await new Promise(resolve => setTimeout(resolve, 2000))

				const domainObjec1t = DOMAIN_EXPANSIONS.find(domain => domain.name === domainInfo)

				// Apply the domain's status effect
				if (domainObjec1t && domainObjec1t.statusEffect) {
					await applyStatusEffect(collectedInteraction.user.id, domainObjec1t.statusEffect)
				}

				const statusEffectsValue = await fetchAndFormatStatusEffects(collectedInteraction.user.id)

				// Here, prepare the updated state of the game, potentially with new images, effects, etc.
				const updatedEmbed = new EmbedBuilder()
					.setColor("Blue")
					.setTitle("The battle continues!")
					.setDescription(`${interaction.user.username} has opened their domain ${domainInfo}!`)
					.addFields(
						{
							name: "Boss Health",
							value: `:heart: ${randomOpponent.current_health.toString()}`,
							inline: true
						},
						{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true },
						{
							name: "Boss Health Status",
							value: generateHealthBar(randomOpponent.current_health, randomOpponent.max_health)
						},
						{ name: "Enemy Technique", value: "*Enemy technique goes here*", inline: false },
						{ name: "Status Effect Player", value: statusEffectsValue, inline: true }
					)

				// Optionally, set a new image if the domain effect changes the scene
				if (domainObjec1t.image_URL) {
					updatedEmbed.setImage(domainObjec1t.image_URL)
				}
				await collectedInteraction.editReply({ embeds: [updatedEmbed], components: [row] })

				//
				const playerGradeData = await getUserGrade(interaction.user.id)
				const playerGradeString = playerGradeData
				const userId = interaction.user.id

				// Calculate the base damage and extra domain damage

				const baseDamage = await calculateDamage(playerGradeString, userId, true)
				const extraDomainDamage = 30
				const totalDamage = baseDamage + extraDomainDamage
				// update boss hp

				let currentBossHealth = bossHealthMap.get(interaction.user.id) || randomOpponent.max_health
				currentBossHealth = Math.max(0, currentBossHealth - totalDamage)
				bossHealthMap.set(interaction.user.id, currentBossHealth)

				// is boss dead?
				if (randomOpponent.current_health <= 0) {
					if (randomOpponent.name === "Mahoraga") {
						await exportTheHonoredOne(interaction, randomOpponent, primaryEmbed, row, playerHealth)
					}

					domainActivationState.set(contextKey, false)
					activeCollectors.delete(interaction.user.id)

					// reset health
					bossHealthMap.delete(interaction.user.id)

					await handleShikigamiTame(interaction, primaryEmbed, row, randomOpponent)
				}
			} catch (error) {
				logger.error("Error during fight command:", error)
				await collectedInteraction.followUp({
					content: "An error occurred during the fight. Please try again later.",
					ephemeral: true
				})
			}
		} else if (selectedValue === "transform") {
			logger.info("Transformation selected.")
			if (transformationState.get(contextKey)) {
				await collectedInteraction.followUp({
					content: "You can only transform once per fight.",
					ephemeral: true
				})
				return
			}

			try {
				const transformationInfo = await getUserTransformation(interaction.user.id)
				if (!transformationInfo) {
					await collectedInteraction.followUp({
						content: "You do not have a transformation unlocked yet.",
						ephemeral: true
					})
					return
				}

				const transformationObject = TRANSFORMATIONS.find(
					transformation => transformation.name === transformationInfo
				)
				if (!transformationObject) {
					logger.error("Invalid transformation found in the database.")
					return
				}
				transformationState.set(contextKey, true)
				// embed here
				const transformationEmbed = new EmbedBuilder()
					.setColor("Blue")
					.setTitle("Transformation!")
					.setDescription(`Transformation: ${transformationInfo}`)
					.addFields({
						name: `${interaction.user.username}`,
						value: "USES THERE TRANSFORMATION!",
						inline: false
					})
					//add image
					.setImage(transformationObject.image)
				await collectedInteraction.editReply({ embeds: [transformationEmbed], components: [] })
				//
				await new Promise(resolve => setTimeout(resolve, 2000))

				if (transformationObject && transformationObject.effects) {
					await applyStatusEffect(collectedInteraction.user.id, transformationObject.effects)
				}
				const statusEffectsValue = await fetchAndFormatStatusEffects(collectedInteraction.user.id)

				const nutembed = new EmbedBuilder()
					.setColor("Blue")
					.setTitle("The battle continues!")
					.setDescription(`${interaction.user.username} has transformed into ${transformationInfo}!`)
					.addFields(
						{
							name: "Boss Health",
							value: `:heart: ${randomOpponent.current_health.toString()}`,
							inline: true
						},
						{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true },
						{ name: "Transformation: ", value: `${transformationInfo}`, inline: true },

						{
							name: "Boss Health Status",
							value: generateHealthBar(randomOpponent.current_health, randomOpponent.max_health)
						},
						{ name: "Enemy Technique", value: "*Enemy technique goes here*", inline: false },
						{ name: "Status Effect Player", value: statusEffectsValue, inline: false }
					)
				if (transformationObject.image) {
					nutembed.setImage(transformationObject.image)
				}
				transformationState.set(contextKey, false)

				//
				await collectedInteraction.editReply({ embeds: [nutembed], components: [row] })
			} catch (error) {
				logger.error("Error during fight command:", error)
				await collectedInteraction.followUp({
					content: "An error occurred during the fight. Please try again later.",
					ephemeral: true
				})
			}
		} else {
			// get boss hp
			const currentBossHealth = bossHealthMap.get(interaction.user.id) || randomOpponent.max_health

			// grade
			const playerGradeData = await getUserGrade(interaction.user.id)
			const playerGradeString = playerGradeData

			// calculate damage
			let damage = calculateDamage(playerGradeString, interaction.user.id, true)

			if (selectedValue === "Atomic") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://media1.tenor.com/m/Y5S-OJqsydUAAAAd/test.gif",
					description: "I...AM....ATOMIC",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Vengance Blade: Executioners Blade") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 12,
					imageUrl: "https://media1.tenor.com/m/wmZxEiKZRXgAAAAd/yuta-cursed-energy.gif",
					description: "I don't like people who hurt my friends...",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Hollow Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl: "https://media1.tenor.com/m/ZdRh7cZgkGIAAAAC/hollow-purple.gif",
					description: `I guess i can play a little rough. ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Re-imagined BLACK FLASH") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 20,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/PE1OPKzVJ8mUIabr2jBW1712379026.png",
					description: "I'm done playing around with you.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Star Rage: Virtual Mass") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 8,
					imageUrl: "https://staticg.sportskeeda.com/editor/2023/12/73a1e-17035028644330-1920.jpg",
					description: `That's my technique! ${randomOpponent.name} It's mass <3`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				await applyVirtualMass(collectedInteraction.user.id)
			} else if (selectedValue === "Nah I'd Win") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 38,
					imageUrl: "https://media1.tenor.com/m/GjlhhOm0vf8AAAAC/gojo-satoru-gojo.gif",
					description: `${randomOpponent.name} says: Would you lose? ${interaction.user.username} says: Nah I'd Win.`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Disaster Curses: Full Flux") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 7,
					imageUrl: "https://media1.tenor.com/m/QHLZohdZiXsAAAAd/geto-suguru.gif",
					description: "Open the gate between the worlds... Lend me your power. Disaster Curses: Full Flux.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Maximum Technique: Blue") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 7,
					imageUrl: "https://media1.tenor.com/m/RJjLn-wpV2QAAAAd/gojo-gojo-satoru.gif",
					description: "Cursed Technique Lapse, Maximum Output.. BLUE!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "The Shoko") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 28,
					imageUrl: "https://media1.tenor.com/m/2sYS0uQV8IIAAAAd/jujutsu-kaisen-jujutsu-kaisen-fade.gif",
					description: "Please the:",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Maximum Technique: Red") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 10,
					imageUrl: "https://media1.tenor.com/m/64w1b87l2jgAAAAC/satoru-gojo-gojo-satoru.gif",
					description: "Reversal.. Red",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Maximum Technique: Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 18,
					imageUrl: "https://media1.tenor.com/m/uxzlDwND2RkAAAAd/roxo-hollow-purple.gif",
					description:
						"Hidden technique, Awoken through the power of the Six Eyes. Maximum Technique: Purple.",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Hollow Purple: Nuke") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://media1.tenor.com/m/Hx77RI9lzY4AAAAC/hollow-nuke-hollow-purple.gif",
					description:
						"Nine point.. Polarized light. Crow and Shomyo chant. The gap between within and without. Hollow Technique: PURPLE!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Prayer Song") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl:
						"https://cdn.discordapp.com/attachments/1094302755960664255/1225688422551785544/image.png?ex=66220a4c&is=660f954c&hm=df32c017b95d2a118b22ff2999990e6ab413e14acbe354b059bee5ced017db16&",
					description: "**You synchronize with your opponent's movements... it's absolutely chilling.**",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				await applyPrayerSongEffect(collectedInteraction.user.id)
				//
			} else if (selectedValue === "Maximum: METEOR") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl: "https://media1.tenor.com/m/pNvg0g4K4VMAAAAd/sukuna-skate-sukuna-skating.gif",
					description: `ILL BURN YOU TO A CRISP ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Zenin Style: Playful Cloud: STRIKE") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl: "https://media1.tenor.com/m/BufoLoGxC9sAAAAd/toji-dagon.gif",
					description: `PERISH ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Flame Arrow") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl:
						"https://cdn.discordapp.com/attachments/1186763190835613748/1226088236397629562/ezgif-2-b2f2996757.gif?ex=66237ea7&is=661109a7&hm=e7eeb0b3305213ae20f0fee49b77dbfc873ca875e61dbd22e629543b33f2c0bf&",
					description: `Fuga.. Don't worry. I won't do anything petty like revealing my technique.. Now.. Arm yourself. ${randomOpponent.name} `,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Jackpot: Strike") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl:
						"https://cdn.discordapp.com/attachments/1094302755960664255/1223345474397016134/ezgif-6-37bc5a10ee.gif?ex=66198441&is=66070f41&hm=4a3dafff4b4ced975dce6677b3764c16f1e42838fa4e4fae7cbeca0dcf818077&",
					description: `TURN UP THE VOLUME ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "World Cutting Slash") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 6,
					imageUrl: "https://media1.tenor.com/m/O8RVjFsdWI8AAAAC/sukuna-ryomen.gif",
					description: `Dissect! ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Mythical Beast Amber") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 18,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/Mythical_Beast_Amber(1).png",
					description: "I'm not going to let you get away with this..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Lightning Discharge") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 12,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/Kashimo_sends_electricity_at_Hakari.png",
					description: "I'm going to fry you to a crisp..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Divine Flames") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 14,
					imageUrl:
						"https://storage.googleapis.com/jjk_bot_personal/sukuna-holding-out-his-arm-in-front-of-him-engulfed-with-flames-as-he-uses-his-fire-technique-in-jujutsu-kaisen%20%5BMConverter.eu%5D.png",
					description: `Pathetic.. ${randomOpponent.name}.. I'll burn you to a crisp..`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Pure Dismantle") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 12,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/GDPkQiBWkAALc51.jpg",
					description: "Purify..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Fire Extinguisher") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 12,
					imageUrl:
						"https://storage.googleapis.com/jjk_bot_personal/who-winning-this-clash-of-techniques-v0-r97dr3o8a5kb1.png",
					description: "You throw a fire extinguisher at the opponent...? ",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Imaginary Technique: Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 5,
					imageUrl:
						"https://media1.tenor.com/m/whbTruPpfgkAAAAC/imaginary-technique-imaginary-technique-purple.gif",
					description:
						"Sorry, Amanai I'm not even angry over you right now. I bear no grudge against anyone. But the world is just so peaceful.\n **Throughout heaven and earth, I alone am the honored one.**",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Disaster Flames: Full Fire Formation") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 3,
					imageUrl: "https://media1.tenor.com/m/XaWgrCmuguAAAAAC/jjk-jujutsu-kaisen.gif",
					description:
						"Heh, You're strong but you're not the only one who can use cursed energy. **Disaster Flames: Full Fire Formation**",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "MAXIMUM: BLACK FLASH") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 6,
					imageUrl: "https://media1.tenor.com/m/FILnhw_rozUAAAAC/black-flash-jujutsu-kaisen.gif",
					description: "**KOKU...SEN!**",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Pure Love: Unleashed Fury") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 5,
					imageUrl: "https://media1.tenor.com/m/ZGlpNTqs6xcAAAAd/jjk0-yuta.gif",
					description: `**How Rude ${randomOpponent.name}, It's pure love.**`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Black Flash") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 4,
					imageUrl: "https://media1.tenor.com/m/gy7FlaPfYSAAAAAC/jjk-jujutsu-kaisen.gif",
					description: "**KOKUSEN!**",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Private Pure Love Train: Jackpot") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 4,
					imageUrl: "https://media1.tenor.com/m/qz4d7FBNft4AAAAC/hakari-hakari-kinji.gif",
					description: "You gamble... AND FORTUNE FAVORS THE BOLD! You deal double damage!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				// HEAVENLY RESTRICTION SKILLS
			} else if (selectedValue === "Close Quarters 2-4 Combo") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 14,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/jujutsu-kaisen-maki-zenin.gif",
					description: "You're not getting away that easily..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Playful Cloud: Upright Spear") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 11,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/anime.gif",
					description: "Playful Cloud: Upright Spear!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Bo Staff: Redirection") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 8,
					imageUrl: "https://media1.tenor.com/m/Bjc7LYqdUGcAAAAC/maki-maki-zenin.gif",
					description: "Bo Staff: Redirection..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				// maki realization
			} else if (selectedValue === "Split Soul: Blitz") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 23,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/Maki_stabs_Naoya_from_behind.png",
					description: "Didn't even notice me..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "0.2 Second Strike") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 21,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-4-d1e7fb00df.gif",
					description: "Behind you..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Face Smash") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 15,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/Maki_Zenin_vs._The_Kukuru_Unit.png",
					description: "your quite ugly..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})

				// TOJI TECHNIQUES
			} else if (selectedValue === "Inverted Spear Of Heaven: Severed Universe") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 17,
					imageUrl: "https://media1.tenor.com/m/707D3IG5x2wAAAAC/isoh-inverted-spear.gif",
					description: "ISOH: Severed Universe..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Batter") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 11,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/jjk-jujutsu-kaisen.gif",
					description: "hehe slap slap slap",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Split Second Slice") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 8,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/toji-toji-fushiguro.gif",
					description: "You can't dodge this one..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				///
			} else if (selectedValue === "Playful Cloud: Rushing Resolute") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 28,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/toji-fushiguro-shibuya-arc-60fps.gif",
					description: "Who do you think you are?",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Bloodlusted: Skull Crush") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 22,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/ezgif-4-14fc7970f5.gif",
					description: "I'm going to crush your skull..",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Split Slap") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/megumi-fushiguro-fushiguro-megumi.gif",
					description: "Stay down!",
					fieldValue: selectedValue,
					userTechniques: userTechniquesTame,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			}

			// update boss hp
			bossHealthMap.set(collectedInteraction.user.id, Math.max(0, currentBossHealth - damage))
			randomOpponent.current_health = Math.max(0, currentBossHealth - damage)

			// result message
			const fightResult = await handleFightLogic(interaction, randomOpponent, playerGradeString, damage)
			primaryEmbed.setDescription(fightResult)

			primaryEmbed.setFields(
				{
					name: "Boss Health",
					value: `:heart: ${randomOpponent.current_health.toString()}`,
					inline: true
				},
				{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true },
				{
					name: "Boss Health Status",
					value: generateHealthBar(randomOpponent.current_health, randomOpponent.max_health)
				}
			)
			// is boss dead?
			if (randomOpponent.current_health <= 0) {
				let transformed = false
				if (randomOpponent.name === "Satoru Gojo") {
					transformed = await exportTheHonoredOne(
						interaction,
						randomOpponent,
						primaryEmbed,
						row,
						playerHealth
					)
				}
				if (!transformed) {
					logger.info("Boss is defeated and no transformation occurred.")
					domainActivationState.set(contextKey, false)
					activeCollectors.delete(interaction.user.id)
					bossHealthMap.delete(interaction.user.id)

					await handleShikigamiTame(interaction, primaryEmbed, row, randomOpponent)
				}
			} else {
				//
				bossHealthMap.set(interaction.user.id, randomOpponent.current_health)

				await delay(700)
				// boss attack
				const possibleAttacks = attacks[randomOpponent.name]
				const chosenAttack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)]

				// Assume we have a function to fetch current status effects for the player
				const statusEffects = await getUserStatusEffects(interaction.user.id) // You'll need the player's ID

				// Assume we have a function to get the player's grade
				const playerGrade = await getUserGrade(interaction.user.id)

				// Calculate the base damage using the player's grade
				const baseDamage = chosenAttack.baseDamage(playerGrade)

				// Calculate the damage with effects
				await calculateDamageWithEffects(interaction.user.id, baseDamage, statusEffects)

				const damageToPlayer = baseDamage
				const newPlayerHealth = playerHealth - damageToPlayer
				const clampedPlayerHealth = Math.max(0, newPlayerHealth)

				//player dead
				if (clampedPlayerHealth <= 0) {
					if (randomOpponent.name === "Mahito (Transfigured)") {
						await handlePlayerRevival(interaction, primaryEmbed, row, randomOpponent, playerHealth)
					} else {
						if (interaction.user.id === "292385626773258240") {
							await handleJoyBoyDeath(interaction, primaryEmbed, row, randomOpponent, playerHealth)
						} else {
							const bossAttackMessage = `${randomOpponent.name} killed you!`
							primaryEmbed.setFooter({ text: bossAttackMessage })
							activeCollectors.delete(interaction.user.id)
							bossHealthMap.delete(interaction.user.id)
							//
							await updateUserHealth(interaction.user.id, 100)
							await removeAllStatusEffects(interaction.user.id)
							await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
							await collectedInteraction.followUp({
								content: `${randomOpponent.name} killed you!`,
								ephemeral: true
							})
							battleOptionSelectMenuCollector.stop()
						}
					}
				} else {
					await updateUserHealth(interaction.user.id, clampedPlayerHealth)

					const statusEffectsValue = await fetchAndFormatStatusEffects(collectedInteraction.user.id)
					const bossAttackMessage = `${randomOpponent.name} dealt ${damageToPlayer} damage to you with ${chosenAttack.name}! You have ${clampedPlayerHealth} health remaining.`

					primaryEmbed.addFields({ name: "Enemy Technique", value: bossAttackMessage }) // Add enemy's technique
					primaryEmbed.addFields([{ name: "Status Effect Player", value: statusEffectsValue, inline: true }])

					await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
				}
			}
		}
	})
}

// pet shop

const petVersions = ["Cursed", "Normal"]

const petOptions = [
	{
		name: "Kitsune",
		price: 10000000,
		formattedPrice: "10,000,000",
		description: "A little kitsune pet.",
		info: "Type: Normal | Rarity: Special Grade",
		emoji: "<:6861shirohappynoises:1230889537761316924>"
	},
	{
		name: "Loyal Pup",
		price: 50000,
		formattedPrice: "50,000",
		description: "A faithful companion that will always be by your side.",
		info: "Type: Normal | Rarity: Common",
		emoji: "🐶"
	},
	{
		name: "Turtle",
		price: 500000,
		formattedPrice: "500,000",
		description: "A slow and steady turtle.",
		info: "Type: Normal | Rarity: Common",
		emoji: "<:8034tropicalpixelturtle:1231732755893846026>"
	},
	//
	{
		name: "Mythical Dragon",
		price: 35000000,
		formattedPrice: "35,000,000",
		description: "He might mistake you for a snack...",
		info: "Type: Cursed | Rarity: Legendary",
		emoji: "<:2087dragon:1230896152950476880>",
		requiredItems: [{ name: "Dragon Scales", quantity: 10 }]
	},
	{
		name: "Mystical Fox",
		price: 7500000,
		formattedPrice: "7,500,000",
		description: "A cunning and versatile creature that can change forms.",
		info: "Type: Cursed | Rarity: Epic",
		emoji: "<:6702foxed:1230903814517686293>",
		requiredItems: [{ name: "Mahito's Soul " || "Mahitos Soul", quantity: 5 }]
	},
	{
		name: "Noj",
		price: 100000000,
		formattedPrice: "100,000,000",
		description: "Friend of the developer!",
		info: "Type: Cursed | Rarity: Special Grade",
		emoji: "<:73062buwumask:1230903140703015035>",
		requiredItems: [{ name: "Sukuna Finger Bundle", quantity: 1 }]
	}
]

export async function handleViewShikigami(interaction) {
	try {
		const userShikigami = await getUserShikigami(interaction.user.id)
		await updateUserCommandsUsed(interaction.user.id)

		if (userShikigami.length === 0) {
			await interaction.reply("You don't have any shikigami yet.")
			return
		}

		const shikigamiOptions = userShikigami.map((shikigami, index) => ({
			label: shikigami.name,
			value: `${shikigami.name}_${index}`,
			emoji: getShikigamiEmoji(shikigami.name)
		}))

		const shikigamiDropdown = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId("shikigami_select")
				.setPlaceholder("Select a shikigami")
				.addOptions(shikigamiOptions)
		)

		await interaction.reply({
			components: [shikigamiDropdown]
		})

		const selectionInteraction = await interaction.channel.awaitMessageComponent({
			filter: i =>
				i.customId === "shikigami_select" && i.user.id === interaction.user.id && i.isStringSelectMenu()
		})

		const [selectedShikigamiName, selectedShikigamiIndex] = selectionInteraction.values[0].split("_")
		const selectedShikigami = userShikigami[selectedShikigamiIndex]

		const shikigamiEmbed = createShikigamiEmbed(selectedShikigami)

		const actionButtons = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId("feed_shikigami").setLabel("Feed").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("clean_shikigami").setLabel("Clean").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("heal_shikigami").setLabel("Heal").setStyle(ButtonStyle.Primary)
		)

		const shikigamiMessage = await selectionInteraction.update({
			embeds: [shikigamiEmbed],
			components: [actionButtons, shikigamiDropdown]
		})

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const buttonInteraction = await interaction.channel.awaitMessageComponent({
				filter: i =>
					i.customId === "shikigami_select" ||
					((i.customId === "feed_shikigami" ||
						i.customId === "clean_shikigami" ||
						i.customId === "play_shikigami" ||
						i.customId === "heal_shikigami") &&
						i.user.id === interaction.user.id)
			})

			if (buttonInteraction.customId === "shikigami_select") {
				const [selectedShikigamiName, selectedShikigamiIndex] = buttonInteraction.values[0].split("_")
				const selectedShikigami = userShikigami[selectedShikigamiIndex]

				const shikigamiEmbed = createShikigamiEmbed(selectedShikigami)

				await buttonInteraction.update({
					embeds: [shikigamiEmbed],
					components: [actionButtons, shikigamiDropdown]
				})
			} else {
				switch (buttonInteraction.customId) {
					case "feed_shikigami":
						await buttonInteraction.deferUpdate()

						try {
							const randomFoodAmount = Math.floor(Math.random() * 21) + 10
							const userInventory = await getUserInventory(interaction.user.id)
							const shikigamiFoodItems = userInventory.find(item => item.name === "Shikigami food")

							if (selectedShikigami.hunger === 100) {
								await buttonInteraction.followUp({
									content: `${selectedShikigami.name} is already full!`,
									ephemeral: true
								})
							} else if (!shikigamiFoodItems) {
								await buttonInteraction.followUp({
									content: "You don't have any Shikigami food in your inventory!",
									ephemeral: true
								})
							} else {
								await removeItemFromUserInventory(interaction.user.id, "Shikigami food", 1)
								await feedShikigami(interaction.user.id, selectedShikigami.name, randomFoodAmount)
								selectedShikigami.hunger = Math.min(100, selectedShikigami.hunger + randomFoodAmount)

								const updatedShikigamiEmbed = createShikigamiEmbed(selectedShikigami)
								await shikigamiMessage.edit({
									embeds: [updatedShikigamiEmbed],
									components: [actionButtons, shikigamiDropdown]
								})
							}
						} catch (error) {
							logger.error("Error feeding shikigami:", error)
						}
						break

					case "play_shikigami":
						await buttonInteraction.deferReply()
						try {
							if (selectedShikigami.friendship === 100) {
								await buttonInteraction.followUp({
									content: `${selectedShikigami.name} is happy!`,
									ephemeral: true
								})
							} else {
								await startPlayingMinigame(buttonInteraction, selectedShikigami)
							}
						} catch (error) {
							logger.error("Error happy shikigami:", error)
						}
						break
					case "clean_shikigami":
						await buttonInteraction.deferUpdate()
						try {
							const userInventory = await getUserInventory(interaction.user.id)
							const cleaningItem = userInventory.find(item => item.name === "Cleaning Kit")

							if (selectedShikigami.hygiene === 100) {
								await buttonInteraction.followUp({
									content: `${selectedShikigami.name} is already clean!`,
									ephemeral: true
								})
							} else if (!cleaningItem) {
								await buttonInteraction.followUp({
									content: "You don't have any Cleaning Kit's in your inventory!",
									ephemeral: true
								})
							} else {
								const randomCleanAmount = Math.floor(Math.random() * 40) + 10
								await removeItemFromUserInventory(interaction.user.id, "Cleaning Kit", 1)
								await cleanShikigami(interaction.user.id, selectedShikigami.name, randomCleanAmount)
								selectedShikigami.hygiene = Math.min(100, selectedShikigami.hygiene + randomCleanAmount)

								const updatedShikigamiEmbed = createShikigamiEmbed(selectedShikigami)
								await shikigamiMessage.edit({
									embeds: [updatedShikigamiEmbed],
									components: [actionButtons, shikigamiDropdown]
								})
							}
						} catch (error) {
							logger.error("Error cleaning shikigami:", error)
						}

						break
					case "heal_shikigami":
						await buttonInteraction.deferUpdate()
						try {
							const userInventory = await getUserInventory(interaction.user.id)
							const specialGradeMedicineItem = userInventory.find(
								item => item.name === "Special-Grade Medicine"
							)

							if (selectedShikigami.health === 100) {
								await buttonInteraction.followUp({
									content: `${selectedShikigami.name} is already full!`,
									ephemeral: true
								})
							} else if (!specialGradeMedicineItem) {
								await buttonInteraction.followUp({
									content: "You don't have any Special-Grade Medicine in your inventory!",
									ephemeral: true
								})
							} else {
								const randomHealAmount = Math.floor(Math.random() * 40) + 10
								await removeItemFromUserInventory(interaction.user.id, "Special-Grade Medicine", 1)
								await healShikigami(interaction.user.id, selectedShikigami.name, randomHealAmount)
								selectedShikigami.health = Math.min(100, selectedShikigami.health + randomHealAmount)

								const updatedShikigamiEmbed = createShikigamiEmbed(selectedShikigami)
								await shikigamiMessage.edit({
									embeds: [updatedShikigamiEmbed],
									components: [actionButtons, shikigamiDropdown]
								})
							}
						} catch (error) {
							logger.error("Error healing shikigami:", error)
						}
						break
					case "prestige_shikigami":
						await buttonInteraction.deferUpdate()
						break
				}
			}
		}
	} catch (error) {
		logger.error("Error executing viewShikigami function:", error)
	}
}

export async function handlePetShop(interaction) {
	const defaultPets = petOptions.filter(pet => pet.info.includes("Type: Normal"))

	await updateUserCommandsUsed(interaction.user.id)

	const defaultVersion = "Normal"
	const userShikigami = await getUserShikigami(interaction.user.id)
	const ownedPetNames = userShikigami.map(shikigami => shikigami.name)

	const availablePets = defaultPets.filter(pet => !ownedPetNames.includes(pet.name))

	const petEmbed = new EmbedBuilder()
		.setTitle(`${defaultVersion} Pets`)
		.setDescription("Click the button to buy a pet.")
		.setFooter({ text: getRandomQuote() })

	availablePets.forEach(pet => {
		const requiredItemsText = pet.requiredItems?.length
			? pet.requiredItems.map(item => `${item.quantity}x ${item.name}`).join(", ")
			: "None"
		petEmbed.addFields({
			name: `${pet.emoji} ${pet.name}`,
			value: `<:7426replycontinued:1230892780407099593>${pet.description}\n<:7426replycontinued:1230892780407099593>${pet.info}\n<:7426replycontinued:1230892780407099593>Required Items: ${requiredItemsText}\n<:1412reply:1230892779211849839>Price: ${pet.formattedPrice} coins`
		})
	})

	const petButtons = availablePets.map(pet => {
		return new ButtonBuilder()
			.setCustomId(`buy_pet_${pet.name}`)
			.setLabel(`Buy ${pet.name} - ${pet.formattedPrice} coins`)
			.setStyle(ButtonStyle.Primary)
	})

	const buttonRows = petButtons.reduce((rows, button, index) => {
		const rowIndex = Math.floor(index / 3)
		if (!rows[rowIndex]) {
			rows[rowIndex] = new ActionRowBuilder<ButtonBuilder>()
		}
		rows[rowIndex].addComponents(button)
		return rows
	}, [] as ActionRowBuilder<ButtonBuilder>[])

	const versionMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId("pet_version")
			.setPlaceholder("Select a pet type")
			.addOptions(
				petVersions.map(version => ({
					label: version,
					value: version
				}))
			)
	)

	await interaction.reply({ embeds: [petEmbed], components: [...buttonRows, versionMenu] })

	const filter = (i: CommandInteraction) =>
		i.user.id === interaction.user.id && (i.isStringSelectMenu() || i.isButton())

	const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 160000 })

	collector?.on("collect", async i => {
		if (i.isStringSelectMenu() && i.customId === "pet_version") {
			const selectedVersion = i.values[0]
			const selectedPets = petOptions.filter(pet => pet.info.includes(`Type: ${selectedVersion}`))
			const availableSelectedPets = selectedPets.filter(pet => !ownedPetNames.includes(pet.name))

			const petEmbed = new EmbedBuilder()
				.setTitle(`${selectedVersion} Pets`)
				.setDescription("Click the button to buy a pet.")
				.setFooter({ text: getRandomQuote() })

			availableSelectedPets.forEach(pet => {
				const requiredItemsText = pet.requiredItems?.length
					? pet.requiredItems.map(item => `${item.quantity}x ${item.name}`).join(", ")
					: "None"

				petEmbed.addFields({
					name: `${pet.emoji} ${pet.name}`,
					value: `<:7426replycontinued:1230892780407099593>${pet.description}\n<:7426replycontinued:1230892780407099593>${pet.info}\n<:7426replycontinued:1230892780407099593>Required Items: ${requiredItemsText}\n<:1412reply:1230892779211849839>Price: ${pet.formattedPrice} coins`
				})
			})

			const selectedPetButtons = availableSelectedPets.map(pet => {
				return new ButtonBuilder()
					.setCustomId(`buy_pet_${pet.name}`)
					.setLabel(`Buy ${pet.name} - ${pet.formattedPrice} coins`)
					.setStyle(ButtonStyle.Primary)
			})

			const selectedButtonRows = selectedPetButtons.reduce((rows, button, index) => {
				const rowIndex = Math.floor(index / 3)
				if (!rows[rowIndex]) {
					rows[rowIndex] = new ActionRowBuilder<ButtonBuilder>()
				}
				rows[rowIndex].addComponents(button)
				return rows
			}, [] as ActionRowBuilder<ButtonBuilder>[])

			await i.update({ embeds: [petEmbed], components: [...selectedButtonRows, versionMenu] })
		} else if (i.isButton() && i.customId.startsWith("buy_pet_")) {
			const petName = i.customId.replace("buy_pet_", "")
			const pet = petOptions.find(p => p.name === petName)

			if (pet) {
				const userBalance = await getBalance(i.user.id)
				const userInventory = await getUserInventory(i.user.id)

				const hasRequiredItems =
					!pet.requiredItems?.length ||
					pet.requiredItems.every(requiredItem => {
						const userItem = userInventory.find(item => item.name === requiredItem.name)
						return userItem && userItem.quantity >= requiredItem.quantity
					})

				if (!hasRequiredItems) {
					await i.reply({
						content: `You don't have the required items to buy ${pet.name}. Required items: ${
							pet.requiredItems?.map(item => `${item.quantity}x ${item.name}`).join(", ") || "None"
						}`,
						ephemeral: true
					})
					return
				}

				if (userBalance >= pet.price) {
					await updateBalance(i.user.id, -pet.price)

					for (const requiredItem of pet.requiredItems || []) {
						await removeItemFromUserInventory(i.user.id, requiredItem.name, -requiredItem.quantity)
					}

					const newShikigami: UserShikigami = {
						name: pet.name,
						experience: 0,
						tier: 1,
						tamedAt: new Date(),
						hygiene: 100,
						hunger: 100,
						friendship: 0
					}

					await updateUserShikigami(i.user.id, newShikigami)

					await i.reply({
						content: `Congratulations! You have successfully purchased ${pet.name}.`,
						ephemeral: true
					})
				} else {
					await i.reply({
						content: "Insufficient funds to buy this pet.",
						ephemeral: true
					})
				}
				collector.stop()
			}
		}
	})
}

export async function handlecreditcommand(interaction) {
	const creditEmbed = new EmbedBuilder()
		.setTitle("Credits")
		.addFields(
			{ name: "Founder", value: "- .gwennnnn", inline: true },
			{ name: "Testers", value: "- Drane\n- v3x\n- Noj\n- Raix\n- Mrboby", inline: false },
			{ name: "Special Thanks", value: "disi\n + Everyone else who was there in the early stages!" }
		)
		.setFooter({ text: "Thank you for using JJK Bot!" })
		.setColor("#FFC0CB")

	await interaction.reply({ embeds: [creditEmbed], ephemeral: true })
}

export async function handleViewStats(interaction) {
	const user = interaction.user

	await updateUserCommandsUsed(user.id)

	const favoriteCommandData = await getUserFavouriteCommand(user.id)
	const favouriteCommand = `**${favoriteCommandData.command}**\n\`Time's Used: ${favoriteCommandData.count}\``

	const userStats = await getUserStats(user.id)
	const favoriteTechData = userStats.stats.filter(stat => stat.technique)

	let favouriteTech
	if (favoriteTechData && favoriteTechData.length > 0) {
		let maxCount = 0
		let maxTechnique = null

		for (const { technique, count } of favoriteTechData) {
			if (count > maxCount) {
				maxCount = count
				maxTechnique = technique
			}
		}

		if (maxTechnique) {
			favouriteTech = `**${maxTechnique}**\n\`Time's Used: ${maxCount}\``
		} else {
			favouriteTech = "No favorite technique yet"
		}
	} else {
		favouriteTech = "No favorite technique yet"
	}

	const registeredDate = await getUserRegisteredDate(user.id)
	const registeredTimestamp = registeredDate ? Math.floor(registeredDate.getTime() / 1000) : null
	const worked = await getUserWorked(user.id)
	const userProfile = await getUserProfile(user.id)

	const statsEmbed = new EmbedBuilder()
		.setTitle(`Stats for ${user.username}`)
		.setDescription("Here are your personal stats for using the JJK Bot!")
		.setColor("#00FF00")
		.setThumbnail(user.displayAvatarURL({ dynamic: true }))
		.addFields(
			{
				name: "General Stats",
				value: `
			**Total Times Worked:** ${worked || "0"}
			**Total Commands Used:** ${userStats.totalCommandsUsed || "0"}
			**Total Techniques Used:** ${userStats.totalTechniques || "0"}
			**Registered At:** ${registeredTimestamp ? `<t:${registeredTimestamp}:f>` : "N/A"}
		  `,
				inline: false
			},
			{
				name: "Work Stats",
				value: `
			**Total Times Worked:** ${worked || "0"}
			**Current Job:** ${userProfile.job || "N/A"}
		  `,
				inline: false
			},
			{
				name: "Fight Stats",
				value: `
			**Fights Won This Month:** ${userStats.monthlyFightsWon || "0"}
			**Total Fights Won:** ${userStats.totalFightsWon || "0"}
			**Favorite Technique:** ${favouriteTech}
		  `,
				inline: false
			},
			{
				name: "Command Stats",
				value: `
			**Favorite Command:** ${favouriteCommand}
		  `,
				inline: false
			}
		)
		.setFooter({ text: getRandomQuote() })

	return statsEmbed
}

export async function handleWorkCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	const userId = interaction.user.id
	const userProfile = await getUserProfile(userId)
	const currentJobName = userProfile.job || "Student"
	const currentJob = jobs.find(job => job.name === currentJobName)

	if (!currentJob) {
		await interaction.reply({ content: "Error: Invalid job specified.", ephemeral: true })
		return
	}

	const { limitReached, nextResetTimestamp } = await checkWorkCooldown(userId, currentJobName)
	logger.info("Work Cooldown:", limitReached, nextResetTimestamp)

	if (limitReached) {
		await interaction.reply({
			content: `You're too tired to work as a ${currentJobName} right now. You can work again <t:${Math.round(
				nextResetTimestamp / 1000
			)}:R>.`,
			ephemeral: true
		})
		return
	}

	let earnings = calculateEarnings(userProfile)
	const experienceGain = getRandomAmount(20, 50)

	let minigameResult: MiniGameResult
	switch (currentJobName) {
		case "Student":
			minigameResult = await playStudentMinigame(interaction, earnings)
			break
		case "Jujutsu Sorcerer":
			minigameResult = await playJujutsuSorcererMinigame(interaction, earnings)
			break
		case "Curse Hunter":
			minigameResult = await playCurseHunterMinigame(interaction, earnings)
			break
		case "Veil Caster":
			minigameResult = await playVeilCasterMinigame(interaction, earnings)
			break
		default:
			minigameResult = {
				success: "full",
				message: `You diligently worked your shift as a ${currentJobName}.`
			}
	}

	if (minigameResult.success === "partial") {
		earnings = Math.floor(earnings / 2)
	} else if (minigameResult.success === "fail") {
		earnings = 0
	}

	await updateBalance(userId, earnings)
	await updateUserExperience(userId, experienceGain)
	await updatePlayerGrade(userId)
	await updateUserFavoriteCommand(interaction.user.id, "Work")
	await updateUserCooldowns(userId, "workCooldown", currentJobName)
	await updateUserWorked(userId)

	const workEmbed = new EmbedBuilder().setColor("Green").setTitle(`Work Complete: ${currentJobName}`)

	if (minigameResult.message) {
		workEmbed.setDescription(minigameResult.message)
	} else {
		workEmbed.setDescription("Oops, something unexpected happened while you were working. Try again later!")
	}

	workEmbed.addFields({ name: "Earnings", value: `${earnings}`, inline: true })

	await interaction.editReply({ embeds: [workEmbed] })
}

export async function handleShikigamiShop(interaction) {
	const shopItems = shikigamiItems2
	const balance = await getBalance(interaction.user.id)
	const balance2 = balance.toLocaleString("en-US")

	if (!shopItems || shopItems.length === 0) {
		await interaction.reply("The shop is currently empty.")
		return
	}

	try {
		const embed = new EmbedBuilder()
			.setColor("#FFD700") // Gold color
			.setTitle("✨ Shop Items ✨")
			.setDescription(`\n💰 Your balance: **${balance2}**\nCheck out these limited-time offers:`)
			.setFooter({ text: "Use the buttons below to purchase items." })

		shopItems.forEach(item => {
			if (item && item.name && typeof item.price !== "undefined" && item.rarity) {
				embed.addFields([
					{
						name: `**${item.name}** - ${item.rarity} Rarity`,
						value: `Price: **${item.price || "None"}** coins`,
						inline: false
					}
				])
			}
		})
		//
		const row = new ActionRowBuilder()
		shopItems.forEach((item, index) => {
			if (item && item.name && typeof item.price !== "undefined" && item.rarity) {
				const button = new ButtonBuilder()
					.setCustomId(`buy_${index}`)
					.setLabel(item.name)
					.setStyle(ButtonStyle.Primary)
				row.addComponents(button)
			}
		})

		//
		const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true })

		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 })

		collector.on("collect", async i => {
			if (!i.isButton()) return

			await i.deferUpdate()

			const userId = i.user.id
			const itemIndex = parseInt(i.customId.replace("buy_", ""))
			const itemToBuy = shopItems[itemIndex]

			if (!itemToBuy) {
				await i.followUp({ content: "This item does not exist in the shop.", ephemeral: true })
				return
			}

			const userPurchases = await getUserPurchases(userId)
			const userItemPurchase = userPurchases.find(p => p.itemName === itemToBuy.name) || {
				itemName: itemToBuy.name,
				purchasedAmount: 0
			}

			const balance = await getBalance(userId)
			if (balance >= itemToBuy.price) {
				await addItemToUserInventory(userId, itemToBuy.name, 1)
				await updateBalance(userId, -itemToBuy.price)
				await addUserPurchases(userId, itemToBuy.name, 1)

				await i.followUp({
					content: `You have purchased ${itemToBuy.name} for ${itemToBuy.price} coins.`,
					ephemeral: true
				})
			} else {
				await i.followUp({
					content: `You do not have enough coins to purchase ${itemToBuy.name}.`,
					ephemeral: true
				})
			}
		})

		collector.on("end", collected => {
			logger.info(`Collected ${collected.size} interactions.`)
		})
		collector.stop
	} catch (error) {
		logger.error("Error fetching shop items:", error)
		await interaction.reply({ content: "An error occurred while fetching shop items.", ephemeral: true })
	}
}

export async function mentorNPCCommand(interaction: CommandInteraction) {
	try {
		const userId = interaction.user.id
		const mentor = await getUserMentor(userId)
		const awakening = await getUserAwakening(userId)
		const hasAwakening = awakening !== null

		const currentQuest = await getCurrentCommunityQuest()
		const isGlobalEventActive = currentQuest && currentQuest.questName === "Satoru Gojo's Sealing"
		await updateUserUnlockedTitles(userId, ["Satoru Gojo's Sealing Participation"])

		let message, imageUrl, line

		const userClanDetails = await getUserClanDetails(userId)
		const isLimitlessTier1 = userClanDetails.clan === "Limitless" && userClanDetails.tier === 1

		if (isLimitlessTier1 && mentor === "Satoru Gojo") {
			await addUserQuest(userId, "Limitless Unleashed")
			message = "Satoru Gojo sees your potential and gives you a special quest to master the Limitless technique."
			imageUrl = "https://media1.tenor.com/m/3R9gRhB7FAwAAAAC/gojo-satoru.gif"
			line = "You have much potential. Take this quest and master the Limitless technique."
		} else if (isGlobalEventActive && mentor === "Satoru Gojo") {
			if (!(await checkStageMessaged(userId, "eventMessageSealing"))) {
				message = "You go to speak to your mentor... But he's gone?"
				imageUrl = getYujiItadoriImageUrl()
				line = getYujiItadoriEventLine(currentQuest)

				await markStageAsMessaged(userId, "eventMessageSealing")
			} else {
				message = "Yuji Itadori is your mentor during this global event."
				imageUrl = getYujiItadoriImageUrl()
				line = getYujiItadoriLine()
			}
		} else if (!isGlobalEventActive && mentor === "Satoru Gojo") {
			message = mentorDetails["Satoru Gojo"].message

			const randomIndex = Math.floor(Math.random() * mentorDetails["Satoru Gojo"].unsealingGifs.length)

			imageUrl = mentorDetails["Satoru Gojo"].unsealingGifs[randomIndex]

			line = mentorDetails["Satoru Gojo"].unsealingDialogues[randomIndex]
		} else if (isGlobalEventActive && mentor === "Ryomen Sukuna") {
			message = mentorDetails["Ryomen Sukuna"].message
			imageUrl = mentorDetails["Ryomen Sukuna"].imageUrl
			line =
				mentorDetails["Ryomen Sukuna"].eventLines[
					Math.floor(Math.random() * mentorDetails["Ryomen Sukuna"].eventLines.length)
				]
		} else if (isGlobalEventActive && mentor === "Curse King") {
			message = mentorDetails["Curse King"].message
			imageUrl = mentorDetails["Curse King"].imageUrl
			line =
				mentorDetails["Curse King"].eventLines[
					Math.floor(Math.random() * mentorDetails["Curse King"].eventLines.length)
				]
		} else {
			;({ message, imageUrl, line } = getMentorDetails(mentor, hasAwakening))
		}

		// Additional comments from mentors based on user's clan
		if (mentor === "Ryomen Sukuna" && userClanDetails.clan === "Limitless") {
			line += "\n\nRyomen Sukuna: So, you are part of the Limitless clan? Interesting."
		} else if (mentor === "Satoru Gojo" && userClanDetails.clan === "Demon Vessel") {
			line += "\n\nSatoru Gojo: A Demon Vessel, huh? Let's see how you handle this power."
		}

		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Mentor Details")
			.setDescription(`${message}`)
			.setImage(imageUrl)
			.addFields([
				{
					name: `**${
						isGlobalEventActive &&
						mentor === "Satoru Gojo" &&
						!(await checkStageMessaged(userId, "eventMessageSealing"))
							? "Yuji Itadori"
							: isGlobalEventActive && mentor === "Satoru Gojo"
								? "Yuji Itadori"
								: mentor
					} says:**`,
					value: `${line}`,
					inline: true
				},
				{
					name: "Mentor",
					value: mentor || "None",
					inline: true
				},
				{ name: "Your Awakening", value: hasAwakening ? `${awakening}` : "Not Awakened", inline: true },
				{
					name: "Innate Clan",
					value: userClanDetails ? `${userClanDetails.clan} (Tier ${userClanDetails.tier})` : "None",
					inline: true
				}
			])

		if (isGlobalEventActive) {
			const currentQuest = await getCurrentCommunityQuest()
			if (currentQuest) {
				const timestampSeconds = Math.floor(currentQuest.endDate.getTime() / 1000)
				embed.addFields([
					{ name: "Satoru Gojo's Unsealing", value: `<t:${timestampSeconds}:f>`, inline: false }
				])
			}
		}

		if (hasAwakening && !(await checkStageMessaged(userId, `${awakening}`))) {
			const awakeningDialogue = getAwakeningDialogue(mentor, awakening)
			embed.addFields({ name: "Awakening Insight", value: awakeningDialogue })
			await addUserQuest(userId, "Awakening")
			await addItemToUserInventory(userId, "Heian Era Scraps", 8)
			await markStageAsMessaged(userId, `${awakening}`)

			if (awakening === "Stage Three") {
				try {
					await addUserQuest(userId, "Stage Three Unleashed")
					embed.addFields({
						name: "New Quest",
						value: "You have unlocked a special quest for reaching Stage Three: Stage Three Unleashed. Use `/quest` to view your quests."
					})
				} catch (error) {
					logger.error("Error adding special quest:", error)
					embed.addFields({
						name: "Quest Error",
						value: "Failed to assign the special quest. Please try again later."
					})
				}
			}
		} else if (!hasAwakening || (hasAwakening && !(await checkStageMessaged(userId, awakening)))) {
			const { quests } = await getUserQuests(userId)
			if (quests && quests.length > 0) {
				const maxDisplayedQuests = 3
				const displayedQuests = quests.slice(0, maxDisplayedQuests)
				const questsText = displayedQuests
					.map(quest => {
						let taskText
						if (Array.isArray(quest.tasks)) {
							taskText = quest.tasks
								.map(task => `- ${task.description}: ${task.progress} / ${task.totalProgress}`)
								.join("\n")
						} else {
							taskText = `- ${quest.task}: ${quest.progress || 0} / ${quest.totalProgress}`
						}
						return `**${quest.id}:**\n${taskText}`
					})
					.join("\n\n")
				embed.addFields([{ name: "Your Quests", value: questsText }])

				if (quests.length > maxDisplayedQuests) {
					const remainingQuests = quests.length - maxDisplayedQuests
					embed.addFields([{ name: "Remaining Quests", value: `+${remainingQuests} more...` }])
				}
			} else {
				embed.addFields([{ name: "Your Quests", value: "No quests currently." }])
			}
		}

		await interaction.reply({ embeds: [embed] })
	} catch (error) {
		logger.error("Error handling mentor NPC command:", error)
		await interaction.reply({ content: "An error occurred while processing your request.", ephemeral: true })
	}
}
export async function eventCommandHandler(interaction: CommandInteraction) {
	try {
		const currentQuest = await getCurrentCommunityQuest()

		if (currentQuest) {
			const timestampSeconds = Math.floor(currentQuest.endDate.getTime() / 1000)

			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle("Global Event: Satoru Gojo's Sealing")
				.setImage("https://media1.tenor.com/m/L02DzK8mP78AAAAC/gojo-satoru-prison-realm-gojo.gif")
				.setDescription(
					"The strongest Jujutsu sorcerer, Satoru Gojo, has been sealed! The community must come together to unlock the secrets and break the seal."
				)
				.addFields([
					{ name: "Event Quest Name", value: currentQuest.questName, inline: false },
					{ name: "Event Task", value: currentQuest.task, inline: false },
					{
						name: "Task Progress",
						value: `${currentQuest.currentProgress} / ${currentQuest.taskAmount}`,
						inline: false
					},
					{ name: "Event End Time", value: `<t:${timestampSeconds}:f>`, inline: false },
					{
						name: "Participation",
						value: "To participate in the event, complete the event quest and contribute to the community's progress",
						inline: false
					}
				])
				.setFooter({ text: "Stay up to date with the event by joining the discord server!" })

			await interaction.reply({ embeds: [embed] })
		} else {
			await interaction.reply("There is no ongoing global event at the moment.")
		}
	} catch (error) {
		logger.error("Error handling /event command:", error)
		await interaction.reply({ content: "An error occurred while processing your request.", ephemeral: true })
	}
}

export async function handleGiveawayCommand(interaction) {
	const userId = interaction.user.id
	const allowedUserIds = ["292385626773258240", "723198209979187291"]

	if (!allowedUserIds.includes(userId)) {
		await interaction.reply({ content: "You do not have permission to create a giveaway.", ephemeral: true })
		return
	}

	const duration = interaction.options.get("duration")?.value
	const prize = interaction.options.get("prize")?.value
	const winners = interaction.options.get("winners")?.value
	const isPrizeItem = interaction.options.get("is_item")?.value
	const itemQuantity = interaction.options.get("item_quantity")?.value
	const prizeAmount = interaction.options.get("prize_amount")?.value

	// Validate the required inputs
	if (!prize || !winners || isPrizeItem === null) {
		await interaction.reply({
			content: "Please provide the prize, number of winners, and whether the prize is an item or not.",
			ephemeral: true
		})
		return
	}

	if (isPrizeItem && (!itemQuantity || itemQuantity <= 0)) {
		await interaction.reply({
			content: "Please provide a valid item quantity greater than 0.",
			ephemeral: true
		})
		return
	}

	if (!isPrizeItem && (!prizeAmount || prizeAmount <= 0)) {
		await interaction.reply({
			content: "Please provide a valid prize amount greater than 0.",
			ephemeral: true
		})
		return
	}

	let durationMs

	try {
		durationMs = ms(duration)
		if (isNaN(durationMs)) {
			throw new Error("Invalid duration format. Please use a format like '1d', '2h', '30m', etc.")
		}
	} catch (error) {
		await interaction.reply({
			content: error.message,
			ephemeral: true
		})
		return
	}

	const endDate = new Date()
	endDate.setMilliseconds(endDate.getMilliseconds() + durationMs)
	const guildId = interaction.guildId
	const channelId = interaction.channelId

	try {
		const endsAt = `<t:${Math.floor(endDate.getTime() / 1000)}:R>`

		const embed = new EmbedBuilder()
			.setTitle("🎉 New Giveaway! 🎉")
			.setDescription(`**Prize:** ${prize}`)
			.setColor("#FFA500")
			.addFields(
				{ name: "🏆 Winners", value: winners.toString(), inline: true },
				{ name: "⏳ Ends In", value: endsAt, inline: true },
				{ name: "👤 Hosted By", value: `<@${userId}>`, inline: true },
				{ name: "🎫 Entries", value: "0", inline: true }
			)
			.setFooter({
				text: "Click the button below to enter the giveaway!"
			})
			.setTimestamp(endDate)

		if (isPrizeItem) {
			embed.addFields(
				{ name: "🎁 Prize Type", value: "Item", inline: true },
				{ name: "📦 Item Quantity", value: itemQuantity?.toString() || "1", inline: true }
			)
		} else {
			embed.addFields(
				{ name: "💰 Prize Type", value: "Other", inline: true },
				{ name: "💵 Prize Amount", value: `$${prizeAmount?.toString() || "0"}`, inline: true }
			)
		}

		const channel = interaction.channel

		if (channel instanceof TextChannel) {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId(`giveaway-${interaction.id}`)
					.setLabel("Enter Giveaway")
					.setStyle(ButtonStyle.Primary)
			)
			logger.debug("Giveaway ID For Button Builder", interaction.id)

			const giveawayMessage = await channel.send({ embeds: [embed], components: [row] })
			const giveawayMessageId = giveawayMessage.id
			await interaction.reply({ content: `Giveaway created! It will end in ${duration}.`, ephemeral: true })

			await createGiveaway(
				guildId,
				channelId,
				interaction.id,
				prize,
				winners,
				endDate,
				isPrizeItem,
				itemQuantity || 1,
				prizeAmount || 0,
				giveawayMessageId
			)
		} else {
			await interaction.reply({ content: "Giveaway creation failed. Invalid channel.", ephemeral: true })
		}
	} catch (error) {
		await interaction.reply({
			content: `An error occurred while creating the giveaway: ${error.message}`,
			ephemeral: true
		})
	}
}
export async function handleGiveawayEntry(interaction) {
	if (!interaction.isButton()) return

	const giveawayId = interaction.customId.split("-")[1]
	logger.debug("Giveaway ID:", giveawayId)

	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const giveawaysCollection: Collection<Giveaway> = database.collection(giveawayCollectionName)

		const giveaway = await giveawaysCollection.findOne({ messageId: giveawayId })

		if (!giveaway) {
			return interaction.reply({ content: "This giveaway no longer exists.", ephemeral: true })
		}

		const hasEnteredGiveaway = giveaway.entries.includes(interaction.user.id)

		if (hasEnteredGiveaway) {
			return interaction.reply({ content: "You have already entered this giveaway.", ephemeral: true })
		}

		await giveawaysCollection.updateOne({ messageId: giveawayId }, { $push: { entries: interaction.user.id } })

		const updatedGiveaway = await giveawaysCollection.findOne({ messageId: giveawayId })
		const entryCount = updatedGiveaway.entries.length

		const embed = new EmbedBuilder()
			.setTitle("Giveaway Entry")
			.setDescription(`You have successfully entered the giveaway for **${giveaway.prize}**!`)
			.setColor("Green")

		interaction.reply({ embeds: [embed], ephemeral: true })

		try {
			const giveawayMessage = await interaction.channel.messages.fetch(giveaway.giveawayMessageId)
			logger.debug("Message ID:", giveaway.giveawayMessageId)

			const giveawayEmbed = giveawayMessage.embeds[0]

			const updatedEmbed = new EmbedBuilder(giveawayEmbed.data)

			const entriesFieldIndex = updatedEmbed.data.fields.findIndex(field => field.name === "🎫 Entries")

			if (entriesFieldIndex !== -1) {
				updatedEmbed.spliceFields(entriesFieldIndex, 1, {
					name: "🎫 Entries",
					value: entryCount.toString(),
					inline: true
				})
			} else {
				updatedEmbed.addFields({ name: "🎫 Entries", value: entryCount.toString(), inline: true })
			}

			await giveawayMessage.edit({ embeds: [updatedEmbed] })
		} catch (error) {
			logger.error("Failed to update giveaway embed:", error)
			if (error.code === 10008) {
				logger.warn("Giveaway message not found. It may have been deleted.")
			} else if (error.code === 50001) {
				logger.warn("Missing access to fetch the giveaway message. Check bot permissions.")
			} else {
				logger.warn("An unexpected error occurred while updating the giveaway embed.")
			}
		}
	} catch (error) {
		logger.error("Error handling giveaway entry:", error)
		interaction.reply({
			content: "There was an error processing your entry. Please try again later.",
			ephemeral: true
		})
	}
}

async function fetchChannel(channelId: string): Promise<TextBasedChannel | null> {
	try {
		const channel = await client1.channels.fetch(channelId)
		if (channel?.isTextBased()) {
			return channel
		} else {
			logger.error(`Channel with ID ${channelId} is not text-based.`)
			return null
		}
	} catch (error) {
		logger.error(`Failed to fetch channel with ID ${channelId}:`, error)
		return null
	}
}

export async function handleGiveawayEnd(guildId: string, channelId: string, messageId: string) {
	try {
		await client.connect()
		const database = client.db(mongoDatabase)
		const giveawaysCollection = database.collection(giveawayCollectionName)

		const giveaway = await giveawaysCollection.findOne({ guildId, channelId, messageId })

		if (!giveaway) {
			return
		}

		const entries = giveaway.entries

		const channel = await fetchChannel(channelId)
		if (!channel) return

		if (entries.length === 0) {
			await channel.send(`No one entered the giveaway for **${giveaway.prize}**. The giveaway has ended.`)
			await giveawaysCollection.deleteOne({ _id: giveaway._id })
			return
		}

		const winners = []
		for (let i = 0; i < giveaway.winners; i++) {
			const randomIndex = Math.floor(Math.random() * entries.length)
			const winnerId = entries[randomIndex]
			winners.push(winnerId)
			entries.splice(randomIndex, 1)
		}

		await giveawaysCollection.updateOne({ _id: giveaway._id }, { $set: { winnerId: winners.join(", ") } })

		const winnerMentions = winners.map(winnerId => `<@${winnerId}>`).join(", ")
		await channel.send(`Congratulations to ${winnerMentions} for winning the giveaway for **${giveaway.prize}**!`)

		if (giveaway.isPrizeItem) {
			for (const winnerId of winners) {
				if (giveaway.itemQuantity !== null && !isNaN(giveaway.itemQuantity)) {
					await addItemToUserInventory(winnerId, giveaway.prize, giveaway.itemQuantity)
				} else {
					logger.error("Invalid item quantity for giveaway prize:", giveaway.itemQuantity)
				}
			}
		} else {
			for (const winnerId of winners) {
				await updateBalance(winnerId, giveaway.prizeAmount)
			}
		}
	} catch (error) {
		logger.error("Error handling giveaway end:", error)
	}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userTechniquesFight2 = new Map<string, any>()
const RAID_DURATION = 180000
const TECHNIQUE_SELECTION_DURATION = 45000

export async function handleRaidCommand(interaction: CommandInteraction) {
	const currentRaidBoss = await getCurrentRaidBoss()

	if (!currentRaidBoss) {
		await interaction.reply({ content: "There is no active raid boss at the moment.", ephemeral: true })
		return
	}

	const joinButton = new ButtonBuilder().setCustomId("join_raid").setLabel("Join Raid").setStyle(ButtonStyle.Primary)

	const partyCloseTime = Date.now() + 20000

	const initialEmbed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle(`Raid Party - ${currentRaidBoss.name}`)
		.setDescription("Click the button below to join the raid party!")
		.addFields({
			name: "Party Closes In",
			value: `<t:${Math.floor(partyCloseTime / 1000)}:R>`,
			inline: true
		})

	const initialMessage = await interaction.reply({
		embeds: [initialEmbed],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(joinButton)],
		fetchReply: true
	})

	const collector = initialMessage.createMessageComponentCollector({ max: 5, time: 20000 })

	const participants: string[] = []

	collector.on("collect", async (i: MessageComponentInteraction) => {
		if (i.customId === "join_raid") {
			const userRegistered = await isUserRegistered(i.user.id)
			const userActiveTechniques = await getUserActiveTechniques(i.user.id)

			if (!userRegistered) {
				await i.reply({
					content: "You need to be registered on the bot to join the raid party.",
					ephemeral: true
				})
				return
			}

			if (userActiveTechniques.length === 0) {
				await i.reply({
					content: "You need to have active techniques to join the raid party.",
					ephemeral: true
				})
				return
			}

			if (!participants.includes(i.user.id)) {
				participants.push(i.user.id)
				const participantsString = participants.map(p => `<@${p}>`).join(", ")

				const updatedEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(`Raid Party - ${currentRaidBoss.name}`)
					.setDescription(`Participants: ${participantsString}`)
					.addFields({
						name: "Party Closes In",
						value: `<t:${Math.floor(partyCloseTime / 1000)}:R>`,
						inline: true
					})

				await i.update({ embeds: [updatedEmbed] })
			} else {
				await i.reply({ content: "You have already joined the raid party.", ephemeral: true })
			}
		}
	})

	collector.on("end", async collected => {
		if (participants.length < 1) {
			await interaction.editReply({
				content: "Not enough participants to start a raid party.",
				embeds: [],
				components: []
			})
			return
		}

		const raidParty = await createRaidParty(currentRaidBoss.name, participants)

		if (!raidParty) {
			await interaction.editReply({ content: "Failed to create raid party.", embeds: [] })
			return
		}

		const raidBossDetails = await getRaidBossDetails(currentRaidBoss.name)

		if (!raidBossDetails) {
			await interaction.editReply({ content: "Failed to retrieve raid boss details.", embeds: [] })
			return
		}

		for (const participant of raidParty.participants) {
			try {
				const usermaxhealth = await getUserMaxHealth(participant.id)
				await updateUserHealth(participant.id, usermaxhealth)
			} catch (error) {
				logger.error(`Error resetting health for participant ${participant.id}:`, error)
			}
		}

		const raidEndTime = Math.floor((Date.now() + RAID_DURATION) / 1000)

		const primaryEmbed = await createRaidEmbed(
			raidBossDetails,
			raidParty.participants,
			interaction,
			"",
			raidEndTime,
			raidParty.partyHealth
		)

		const rows = await createTechniqueSelectMenu(
			raidParty.participants,
			raidParty.deadParticipants || [],
			RAID_DURATION / 1000
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [...rows] })

		const lastUsedTechniques: string[] = []
		let updatedEmbed: APIEmbed

		const startCollector = async (interaction, raidParty, lastUsedTechniques, remainingTime) => {
			if (remainingTime <= 0) {
				await handleRaidEnd(interaction, raidParty, raidBossDetails)
				return
			}

			const battleOptionSelectMenuCollectorRaid = interaction.channel.createMessageComponentCollector({
				filter: i => {
					const participantId = i.customId.split("-")[3]
					return raidParty.participants.some(p => p.id === participantId) && i.user.id === participantId
				},
				componentType: ComponentType.StringSelect,
				time: Math.min(TECHNIQUE_SELECTION_DURATION, remainingTime)
			})

			const techniqueSelectionEndTimestamp = Math.floor((Date.now() + TECHNIQUE_SELECTION_DURATION) / 1000)

			const updatedEmbedBuilder = await createRaidEmbed(
				raidBossDetails,
				raidParty.participants,
				interaction,
				lastUsedTechniques.join("\n"),
				raidEndTime,
				raidParty.partyHealth
			)

			updatedEmbedBuilder.addFields({
				name: "Technique Selection Ends",
				value: `<t:${techniqueSelectionEndTimestamp}:R>`,
				inline: true
			})
			updatedEmbed = updatedEmbedBuilder.toJSON()

			battleOptionSelectMenuCollectorRaid.on("collect", async i => {
				console.debug("Collected interaction:", i.customId)
				const selectedTechnique = i.values[0]
				const userId = i.user.id
				const user = await client1.users.fetch(userId)

				const updatedComponents = i.message.components.filter(
					row => !row.components.some(component => component.customId === `select-battle-option-${userId}`)
				)

				lastUsedTechniques.push(`${user.username}: ${selectedTechnique}`)

				const updatedRaidBoss = await getRaidBossDetails(raidParty.raidBossId)

				const updatedEmbedBuilder = await createRaidEmbed(
					updatedRaidBoss,
					raidParty.participants,
					interaction,
					lastUsedTechniques.join("\n"),
					raidEndTime,
					raidParty.partyHealth
				)

				const techniqueSelectionEndTimestamp = Math.floor((Date.now() + TECHNIQUE_SELECTION_DURATION) / 1000)

				updatedEmbedBuilder.addFields({
					name: "Technique Selection Ends",
					value: `<t:${techniqueSelectionEndTimestamp}:R>`,
					inline: true
				})
				updatedEmbed = updatedEmbedBuilder.toJSON()

				await i.update({ embeds: [updatedEmbed], components: updatedComponents })

				if (selectedTechnique === "Lapse: Blue") {
					const damage = await executeSpecialRaidBossTechnique({
						collectedInteraction: i,
						techniqueName: selectedTechnique,
						damageMultiplier: 3,
						imageUrl: "https://media1.tenor.com/m/XaWgrCmuguAAAAAC/jjk-jujutsu-kaisen.gif",
						description: "Aka... Doryoku... I'll show you the true power **Lapse: Blue**!",
						fieldValue: selectedTechnique,
						userTechniques: userTechniquesFight2,
						userId: userId,
						primaryEmbed: updatedEmbed
					})
					raidParty.pendingActions.push({ userId, technique: selectedTechnique, damage })

					const participantIndex = raidParty.participants.findIndex(p => p.id === userId)
					if (participantIndex !== -1) {
						raidParty.participants[participantIndex].totalDamage += damage
						updatedRaidBoss.globalHealth -= damage
						updatedRaidBoss.current_health -= damage
					}
				} else {
					const damage = calculateDamage(selectedTechnique, userId)
					raidParty.pendingActions.push({ userId, technique: selectedTechnique, damage })

					const participantIndex = raidParty.participants.findIndex(p => p.id === userId)
					if (participantIndex !== -1) {
						raidParty.participants[participantIndex].totalDamage += damage
						updatedRaidBoss.globalHealth = Math.max(0, updatedRaidBoss.globalHealth - damage)
						updatedRaidBoss.current_health = Math.max(0, updatedRaidBoss.current_health - damage)
					}
				}

				await updateRaidPartyPendingActions(raidParty._id.toString(), raidParty.pendingActions)

				await updateRaidBossCurrentHealth(updatedRaidBoss._id.toString(), updatedRaidBoss.current_health)

				const participantsSelected = lastUsedTechniques.length
				if (participantsSelected === raidParty.participants.length) {
					battleOptionSelectMenuCollectorRaid.stop("All participants have selected their techniques")
				}

				if (updatedRaidBoss.current_health <= 0) {
					await handleRaidBossDefeat(interaction, raidParty, updatedRaidBoss)
					return
				}
			})

			battleOptionSelectMenuCollectorRaid.on("end", async collected => {
				logger.info("Collector ended with", collected.size, "interactions")

				const updatedRaidParty = await getRaidPartyById(raidParty._id.toString())
				const updatedRaidBoss = await getRaidBossDetails(updatedRaidParty.raidBossId)

				if (!updatedRaidBoss) {
					await interaction.editReply({
						content: "Failed to retrieve updated raid boss details.",
						embeds: []
					})
					return
				}

				const lastUsedTechniques = []

				for (const combination of dualTechniqueCombinations) {
					const usersWithTechnique1 = updatedRaidParty.pendingActions.filter(
						action => action.technique === combination.technique1
					)
					const usersWithTechnique2 = updatedRaidParty.pendingActions.filter(
						action => action.technique === combination.technique2
					)

					if (usersWithTechnique1.length === 1 && usersWithTechnique2.length === 1) {
						const user1 = usersWithTechnique1[0]
						const user2 = usersWithTechnique2[0]
						const fetchedUser1 = await client1.users.fetch(user1.userId)
						const fetchedUser2 = await client1.users.fetch(user2.userId)
						const technique1 = user1.technique
						const technique2 = user2.technique

						const damage = await executeDualTechnique1({
							interaction: interaction,
							technique1: technique1,
							technique2: technique2,
							damageMultiplier: combination.damageMultiplier,
							imageUrl: combination.imageUrl,
							description: combination.description(fetchedUser1, fetchedUser2, technique1, technique2),
							fieldValue: combination.fieldValue,
							userId1: user1.userId,
							userId2: user2.userId,
							primaryEmbed: updatedEmbed,
							updateEmbed: true,
							rows: rows,
							dualTechniqueCombinations: dualTechniqueCombinations
						})

						lastUsedTechniques.push(combination.fieldValue)

						const participantIndex1 = updatedRaidParty.participants.findIndex(p => p.id === user1.userId)
						const participantIndex2 = updatedRaidParty.participants.findIndex(p => p.id === user2.userId)

						if (participantIndex1 !== -1) {
							updatedRaidParty.participants[participantIndex1].totalDamage += damage
						}

						if (participantIndex2 !== -1) {
							updatedRaidParty.participants[participantIndex2].totalDamage += damage
						}

						updatedRaidBoss.globalHealth = Math.max(0, updatedRaidBoss.globalHealth - damage)
						updatedRaidBoss.current_health = Math.max(0, updatedRaidBoss.current_health - damage)

						await updateRaidBossCurrentHealth(
							updatedRaidBoss._id.toString(),
							updatedRaidBoss.current_health
						)

						updatedRaidParty.partyHealth = Math.max(0, updatedRaidParty.partyHealth - damage)
						await updateRaidParty({ ...updatedRaidParty, partyHealth: updatedRaidParty.partyHealth })

						if (updatedRaidParty.partyHealth <= 0) {
							const latestRaidBoss = await getRaidBossDetails(updatedRaidBoss._id.toString())
							await handleRaidBossDefeat(interaction, updatedRaidParty, latestRaidBoss)
							return
						}

						await removeRaidPartyPendingActions(updatedRaidParty._id.toString())

						raidParty.pendingActions = []
						await updateRaidPartyPendingActions(raidParty._id.toString(), raidParty.pendingActions)

						const latestRaidParty = await getRaidPartyById(updatedRaidParty._id.toString())

						const updatedEmbedBuilder = await createRaidEmbed(
							updatedRaidBoss,
							latestRaidParty.participants,
							interaction,
							lastUsedTechniques.join("\n"),
							raidEndTime,
							latestRaidParty.partyHealth
						)
						updatedEmbed = updatedEmbedBuilder.toJSON()

						if (updatedRaidParty.partyHealth <= 0) {
							const latestRaidBoss = await getRaidBossDetails(updatedRaidBoss._id.toString())
							await handleRaidBossDefeat(interaction, updatedRaidParty, latestRaidBoss)
							return
						}
					}
				}

				for (const combination of squadTechniqueCombinations) {
					const usersWithTechnique1 = updatedRaidParty.pendingActions.filter(
						action => action.technique === combination.technique1
					)
					const usersWithTechnique2 = updatedRaidParty.pendingActions.filter(
						action => action.technique === combination.technique2
					)
					const usersWithTechnique3 = updatedRaidParty.pendingActions.filter(
						action => action.technique === combination.technique3
					)
					const usersWithTechnique4 = updatedRaidParty.pendingActions.filter(
						action => action.technique === combination.technique4
					)
					const usersWithTechnique5 = updatedRaidParty.pendingActions.filter(
						action => action.technique === combination.technique5
					)

					if (
						usersWithTechnique1.length === 1 &&
						usersWithTechnique2.length === 1 &&
						usersWithTechnique3.length === 1 &&
						usersWithTechnique4.length === 1 &&
						usersWithTechnique5.length === 1
					) {
						const user1 = usersWithTechnique1[0]
						const user2 = usersWithTechnique2[0]
						const user3 = usersWithTechnique3[0]
						const user4 = usersWithTechnique4[0]
						const user5 = usersWithTechnique5[0]
						const technique1 = user1.technique
						const technique2 = user2.technique
						const technique3 = user3.technique
						const technique4 = user4.technique
						const technique5 = user5.technique

						const damage = await executeSquadTechnique({
							interaction: interaction,
							technique1: technique1,
							technique2: technique2,
							technique3: technique3,
							technique4: technique4,
							technique5: technique5,
							damageMultiplier: combination.damageMultiplier,
							imageUrl: combination.imageUrl,
							description: combination.description,
							fieldValue: combination.fieldValue,
							userId1: user1.userId,
							userId2: user2.userId,
							userId3: user3.userId,
							userId4: user4.userId,
							userId5: user5.userId,
							primaryEmbed: updatedEmbed,
							updateEmbed: true,
							rows: rows
						})

						lastUsedTechniques.push(combination.fieldValue)

						const participantIndex1 = updatedRaidParty.participants.findIndex(p => p.id === user1.userId)
						const participantIndex2 = updatedRaidParty.participants.findIndex(p => p.id === user2.userId)
						const participantIndex3 = updatedRaidParty.participants.findIndex(p => p.id === user3.userId)
						const participantIndex4 = updatedRaidParty.participants.findIndex(p => p.id === user4.userId)

						if (participantIndex1 !== -1) {
							updatedRaidParty.participants[participantIndex1].totalDamage += damage
						}

						if (participantIndex2 !== -1) {
							updatedRaidParty.participants[participantIndex2].totalDamage += damage
						}

						if (participantIndex3 !== -1) {
							updatedRaidParty.participants[participantIndex3].totalDamage += damage
						}

						if (participantIndex4 !== -1) {
							updatedRaidParty.participants[participantIndex4].totalDamage += damage
						}

						updatedRaidBoss.current_health = Math.max(0, updatedRaidBoss.current_health - damage)

						await updateRaidBossCurrentHealth(
							updatedRaidBoss._id.toString(),
							updatedRaidBoss.current_health
						)

						updatedRaidParty.partyHealth = Math.max(0, updatedRaidParty.partyHealth - damage)
						await updateRaidParty({ ...updatedRaidParty, partyHealth: updatedRaidParty.partyHealth })

						await removeRaidPartyPendingActions(updatedRaidParty._id.toString())

						raidParty.pendingActions = []
						await updateRaidPartyPendingActions(raidParty._id.toString(), raidParty.pendingActions)

						const latestRaidParty = await getRaidPartyById(updatedRaidParty._id.toString())

						const updatedEmbedBuilder = await createRaidEmbed(
							updatedRaidBoss,
							latestRaidParty.participants,
							interaction,
							lastUsedTechniques.join("\n"),
							raidEndTime,
							latestRaidParty.partyHealth
						)
						updatedEmbed = updatedEmbedBuilder.toJSON()

						if (updatedRaidParty.partyHealth <= 0) {
							const latestRaidBoss = await getRaidBossDetails(updatedRaidBoss._id.toString())
							await handleRaidBossDefeat(interaction, updatedRaidParty, latestRaidBoss)
							return
						}
					}
				}

				logger.debug("Executing pending actions")
				for (const action of updatedRaidParty.pendingActions) {
					console.debug("Processing action:", action)
					if (action.technique === "World Cutting Slash") {
						const damage = await executeSpecialRaidBossTechnique({
							collectedInteraction: interaction,
							techniqueName: action.technique,
							damageMultiplier: 3,
							imageUrl: "https://media1.tenor.com/m/O8RVjFsdWI8AAAAC/sukuna-ryomen.gif",
							description: "**Ryomen Sukuna** used **World Cutting Slash**!",
							fieldValue: action.technique,
							userTechniques: userTechniquesFight2,
							userId: action.userId,
							primaryEmbed: null
						})
						action.damage = damage

						const participantIndex = updatedRaidParty.participants.findIndex(p => p.id === action.userId)
						if (participantIndex !== -1) {
							updatedRaidParty.participants[participantIndex].totalDamage += damage
							updatedRaidBoss.globalHealth -= damage
							updatedRaidBoss.current_health -= damage
						}
					} else {
						const damage = calculateDamage(action.technique, action.userId)
						action.damage = damage

						const participantIndex = updatedRaidParty.participants.findIndex(p => p.id === action.userId)
						if (participantIndex !== -1) {
							updatedRaidParty.participants[participantIndex].totalDamage += damage
							updatedRaidBoss.globalHealth -= damage
							updatedRaidBoss.current_health -= damage
						}
					}
				}

				const totalDamage = raidParty.participants.reduce(
					(sum, participant) => sum + participant.totalDamage,
					0
				)

				await updateRaidBossCurrentHealth(updatedRaidBoss._id.toString(), updatedRaidBoss.current_health)

				updatedRaidParty.partyHealth -= totalDamage

				await updateRaidParty({ ...updatedRaidParty, partyHealth: updatedRaidParty.partyHealth })

				for (const action of updatedRaidParty.pendingActions) {
					const participantIndex = updatedRaidParty.participants.findIndex(p => p.id === action.userId)
					if (participantIndex !== -1) {
						updatedRaidParty.participants[participantIndex].totalDamage += action.damage
					}
				}

				updatedRaidParty.pendingActions = []
				await updateRaidPartyPendingActions(raidParty._id.toString(), updatedRaidParty.pendingActions)

				const latestRaidParty = await getRaidPartyById(updatedRaidParty._id.toString())
				const updatedEmbedBuilder = await createRaidEmbed(
					updatedRaidBoss,
					latestRaidParty.participants,
					interaction,
					lastUsedTechniques.join("\n"),
					raidEndTime,
					latestRaidParty.partyHealth
				)
				updatedEmbed = updatedEmbedBuilder.toJSON()

				const attackDetails = await applyBossDamage(updatedRaidBoss, updatedRaidParty.participants, interaction)
				for (const { participant, attackName, damage, remainingHealth } of attackDetails) {
					const participantUser = await client1.users.fetch(participant)
					const participantName = participantUser.username

					updatedEmbed.fields.push({
						name: `${updatedRaidBoss.name} Attacks ${participantName}!`,
						value: `Used ${attackName} and dealt ${damage} damage. ${remainingHealth} health remaining.`
					})

					if (remainingHealth <= 0) {
						const deadParticipants = updatedRaidParty.deadParticipants || []
						await updateRaidParty({
							...updatedRaidParty,
							deadParticipants: [...deadParticipants, participant]
						})
					}
				}

				const updatedrows = await createTechniqueSelectMenu(
					updatedRaidParty.participants,
					updatedRaidParty.deadParticipants || [],
					remainingTime / 1000
				)

				await interaction.editReply({ embeds: [updatedEmbed], components: [...updatedrows] })

				if (updatedRaidBoss.current_health <= 0) {
					await handleRaidBossDefeat(interaction, updatedRaidParty, updatedRaidBoss)
				} else if (raidParty.partyHealth <= 0) {
					raidParty.partyHealth = 0
					await handleRaidBossDefeat(interaction, updatedRaidParty, updatedRaidBoss)
				} else {
					const newRemainingTime = remainingTime - TECHNIQUE_SELECTION_DURATION
					startCollector(interaction, raidParty, lastUsedTechniques, newRemainingTime)
				}
			})

			setTimeout(
				() => {
					if (!battleOptionSelectMenuCollectorRaid.ended) {
						battleOptionSelectMenuCollectorRaid.stop()
					}
				},
				Math.min(TECHNIQUE_SELECTION_DURATION, remainingTime)
			)
		}

		startCollector(interaction, raidParty, lastUsedTechniques, RAID_DURATION)
	})
}

export async function handleBugReport(interaction: ChatInputCommandInteraction) {
	const description = interaction.options.getString("description", true)
	const imageAttachment = interaction.options.getAttachment("image")

	const embed = new EmbedBuilder()
		.setTitle("Bug Report")
		.setDescription(description)
		.addFields({ name: "UserId", value: interaction.user.id, inline: true })
		.setTimestamp()
		.setFooter({ text: `Reported by ${interaction.user.tag}` })

	if (imageAttachment) {
		embed.setImage(imageAttachment.url)
	}

	const bugReportChannel = interaction.client.channels.cache.get("1242086815910068345")
	if (bugReportChannel && bugReportChannel.isTextBased()) {
		await bugReportChannel.send({ embeds: [embed] })
	}

	await interaction.reply({
		content:
			"Thank you for reporting the bug! We will look into it. If the bug has caused you to lose items, please join the support server. `/support`",
		ephemeral: true
	})
}

export async function handlePurchaseHistoryCommand(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true })

	const entitlements = await interaction.client.application.entitlements.fetch({ user: interaction.user })
	logger.debug("Entitlements:", entitlements.toJSON())

	const skus = await interaction.client.application.fetchSKUs()
	logger.debug("SKUs:", skus.toJSON())

	const embed = new EmbedBuilder().setTitle("Purchase History").setColor("#0099ff").setTimestamp()
	const validEntiltements = entitlements.filter(entitlement => entitlement.deleted === false)

	if (validEntiltements.size === 0) {
		embed.setDescription("You have not made any purchases yet.")
	} else {
		const entitlementFields = validEntiltements.map(entitlement => {
			const purchaseDate = entitlement.startsTimestamp
			const expiresDate = entitlement.endsAt?.toLocaleString()
			const sku = skus.find(sku => sku.id === entitlement.skuId)

			return {
				name: `${sku.name}: ${purchaseDate} - ${expiresDate}`,
				value: `Type: ${sku.type.toString()} `
			}
		})

		embed.addFields(entitlementFields)
	}

	await interaction.editReply({ embeds: [embed] })
}

export const tutorialPages = [
	new EmbedBuilder()
		.setColor("Aqua")
		.setTitle("Tutorial Step 1")
		.setDescription(
			"Hey there! Welcome to the JJK Bot tutorial. You are being automatically registered and given a starter bundle. Let's get started, Press **Next** When Ready!"
		),
	new EmbedBuilder()
		.setColor("Aqua")
		.setTitle("Tutorial Step 2")
		.setImage("https://storage.googleapis.com/jjk_bot_personal/ezgif-3-731c252f7e.gif")
		.setDescription("Alright! Let's start by using the `/dig` command to find an item."),
	new EmbedBuilder()
		.setColor("Aqua")
		.setTitle("Tutorial Step 3")
		.setImage("https://storage.googleapis.com/jjk_bot_personal/ezgif-3-1d4c8d7bca.gif")
		.setDescription(
			"Now use the item you gained from the dig command to buy Divergent Fist! (/technique [Techniques]) It's under **Demon Vessel**"
		),
	new EmbedBuilder()
		.setColor("Aqua")
		.setTitle("Tutorial Step 4")
		.setImage("https://storage.googleapis.com/jjk_bot_personal/ezgif-3-ed3edfb88d.gif")
		.setDescription("Equip your new technique using `/technique equip Divergent Fist`."),
	new EmbedBuilder()
		.setColor("Aqua")
		.setTitle("Tutorial Step 5")
		.setImage("https://storage.googleapis.com/jjk_bot_personal/ezgif-3-cefd3b76de.gif")
		.setDescription("Now use the `/fight` command to engage in battle."),
	new EmbedBuilder()
		.setColor("Aqua")
		.setTitle("Tutorial Complete")
		.setImage("https://storage.googleapis.com/jjk_bot_personal/Shibuya_(Anime).png")
		.setDescription(
			"Congratulations! You have completed the tutorial. For more help, you can use /guide [topic] or /help. You've been given a free starter bundle as well!"
		)
		.setFooter({
			text: "Credits to AtomicApex."
		})
]

export const getButtons = async (step, userId) => {
	const userState = await getUserTutorialState(userId)
	const row = new ActionRowBuilder<ButtonBuilder>()

	if (step > 0) {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId("previous")
				.setLabel("Previous")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(step === 0)
		)
	}

	const canProceed =
		step === 0 ||
		(step === 1 && userState.digUsed) ||
		(step === 2 && userState.techniquePurchased) ||
		(step === 3 && userState.techniqueEquipped) ||
		(step === 4 && userState.fightUsed)

	row.addComponents(
		new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle(ButtonStyle.Primary).setDisabled(!canProceed)
	)

	return row
}

export async function handleTutorialCommand(interaction: CommandInteraction): Promise<void> {
	const userId = interaction.user.id
	const user = await interaction.client.users.fetch(userId)
	const dmChannel = await user.createDM()

	let userState = await getUserTutorialState(userId)

	if (!userState || !userState.isRegistered) {
		const result = await addUser(userId)
		if (result && "insertedId" in result) {
			await addItemToUserInventory(userId, "Starter Bundle", 1)
			userState = await createUserTutorialState(userId)
			userState.isRegistered = true
			await setUserTutorialState(userId, userState)
		} else {
			await interaction.reply({
				content: "There was an unexpected issue with your registration.",
				ephemeral: true
			})
			return
		}
	}

	let step = 0

	await interaction.reply({
		content: "I have sent you a DM with the tutorial!",
		ephemeral: true
	})

	const tutorialMessage = await dmChannel.send({
		embeds: [tutorialPages[step]],
		components: [await getButtons(step, userId)]
	})

	await setUserTutorialMessageId(userId, tutorialMessage.id)

	const filter = i => i.user.id === userId
	const collector = tutorialMessage.createMessageComponentCollector({
		filter,
		componentType: ComponentType.Button
	})

	collector.on("collect", async i => {
		if (i.customId === "previous") {
			step--
		} else if (i.customId === "next") {
			step++
		}

		userState = await getUserTutorialState(userId)
		const buttons = await getButtons(step, userId)

		await i.update({
			embeds: [tutorialPages[step]],
			components: [buttons]
		})
	})

	collector.on("end", async () => {
		if (tutorialMessage.editable) {
			await tutorialMessage.edit({ components: [] })
		}
	})
}

// handle ping command
export async function handlePingCommand(interaction: CommandInteraction) {
	const client = interaction.client as Client

	const apiPingStart = Date.now()
	try {
		await axios.get("https://api.nullifu.dev")
		const apiPingEnd = Date.now()
		const apiPingLatency = apiPingEnd - apiPingStart

		const discordPingStart = Date.now()
		await interaction.deferReply()
		const discordPingEnd = Date.now()
		const discordPingLatency = discordPingEnd - discordPingStart

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const uptimeSeconds = Math.floor(client.uptime! / 1000)
		const uptimeMinutes = Math.floor(uptimeSeconds / 60)
		const uptimeHours = Math.floor(uptimeMinutes / 60)
		const uptimeDays = Math.floor(uptimeHours / 24)

		const uptimeString = `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`

		const pingEmoji = apiPingLatency < 200 && discordPingLatency < 200 ? "🟢" : "🔴"

		// Create the embed
		const embed = new EmbedBuilder()
			.setTitle("Ping Results")
			.setColor("#00ff00")
			.addFields(
				{ name: "API Ping", value: `${apiPingLatency}ms`, inline: true },
				{ name: "Discord API Ping", value: `${discordPingLatency}ms`, inline: true },
				{ name: "Bot Uptime", value: uptimeString, inline: false }
			)
			.setFooter({ text: `Ping Status: ${pingEmoji}` })

		await interaction.editReply({ embeds: [embed] })
	} catch (error) {
		console.error("Error pinging API:", error)
		await interaction.editReply("Failed to ping the API.")
	}
}

const gifUrls = [
	"https://media1.tenor.com/m/VgQGIDtP6ecAAAAd/jujutsu-kaisen-sukuna.gif",
	"https://media1.tenor.com/m/338XAWz0ac0AAAAC/gojo-vs-sukuna-satoru-gojo.gif",
	"https://media1.tenor.com/m/0LlNI_mLYScAAAAd/jjk-jujutsu-kaisen.gif"
]

export const getRandomGif = () => gifUrls[Math.floor(Math.random() * gifUrls.length)]

const getRandomColor = () => Math.floor(Math.random() * 16777215)

const generateProgressBar = (value, max) => {
	if (value < 0) value = 0
	if (value > max) value = max

	const filledLength = Math.round((value / max) * 10)
	const emptyLength = 10 - filledLength
	return `${"█".repeat(filledLength)}${"░".repeat(emptyLength)} ${value}/${max}`
}

const challengeMessages = [
	"Prepare for battle, {opponent}! {challenger} has challenged you to a PvP duel!",
	"Hey {opponent}, {challenger} wants to test your strength in a PvP match!",
	"{opponent}, {challenger} has issued a PvP challenge! Do you accept?",
	"It's time to duel, {opponent}! {challenger} has thrown down the gauntlet!",
	"{opponent}, are you ready to fight? {challenger} has challenged you to PvP!"
]

const cooldowns = new Map<string, number>()
const cooldownDuration = 30000

const getRandomChallengeMessage = (challenger, opponent) => {
	const randomIndex = Math.floor(Math.random() * challengeMessages.length)
	return challengeMessages[randomIndex]
		.replace("{challenger}", challenger.username)
		.replace("{opponent}", opponent.username)
}
export async function handlePvpCommand(interaction: CommandInteraction) {
	await interaction.deferReply()

	const opponentOption = interaction.options.get("opponent") || null
	const opponent = opponentOption?.user
	const userId = interaction.user.id

	// Cooldown logic
	const cooldownAmount = 10000
	const now = Date.now()

	if (cooldowns.has(userId)) {
		const expirationTime = cooldowns.get(userId) + cooldownAmount
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000
			await interaction.editReply({
				content: `Please wait ${timeLeft.toFixed(1)} more seconds before using this command again.`
			})
			return
		}
	}

	// Set the cooldown
	cooldowns.set(userId, now)
	if (!opponent) {
		await interaction.editReply({ content: "Please mention a valid user to challenge." })
		return
	}

	if (cooldowns.has(interaction.user.id)) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const remainingTime = cooldowns.get(interaction.user.id)! - Date.now()
		if (remainingTime > 0) {
			const seconds = Math.ceil(remainingTime / 1000)
			await interaction.reply({
				content: `You're on cooldown. Please wait ${seconds} second(s) before using the PvP command again.`,
				ephemeral: true
			})
			return
		}
	}
	if (opponent.id === interaction.user.id) {
		const wittyResponses = [
			"You can't fight yourself! Try challenging someone else.",
			"It's not healthy to battle yourself. Pick a real opponent!",
			"A duel with yourself? That's not possible. Choose someone else!"
		]
		const randomResponse = wittyResponses[Math.floor(Math.random() * wittyResponses.length)]
		await interaction.editReply({ content: randomResponse })
		return
	}

	// Check if opponent is pvpable
	const opponentSettings = await getUserSettings(opponent.id)
	if (opponentSettings && !opponentSettings.pvpable) {
		await interaction.editReply({ content: "This user does not accept PvP challenges." })
		return
	}

	const confirmButton = new ButtonBuilder()
		.setCustomId("pvp_confirm")
		.setLabel("Confirm")
		.setStyle(ButtonStyle.Success)
	const denyButton = new ButtonBuilder().setCustomId("pvp_deny").setLabel("Deny").setStyle(ButtonStyle.Danger)
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, denyButton)
	const embed = new EmbedBuilder()
		.setColor(getRandomColor())
		.setTitle("PvP Challenge")
		.setDescription(getRandomChallengeMessage(interaction.user, opponent))
		.setTimestamp()

	await interaction.editReply({
		content: `${opponent}, you've been challenged!`,
		embeds: [embed],
		components: [row]
	})

	const filter = (i: MessageComponentInteraction) =>
		i.isButton() && (i.customId === "pvp_confirm" || i.customId === "pvp_deny") && i.user.id === opponent.id

	try {
		if (!interaction.channel) {
			await interaction.editReply({
				content: "An error occurred: Channel not found.",
				embeds: [],
				components: []
			})
			return
		}

		const confirmation = await interaction.channel.awaitMessageComponent({ filter, time: 60000 })
		if (confirmation.customId === "pvp_confirm") {
			await confirmation.update({
				content: `${opponent} has accepted the PvP challenge from ${interaction.user}!`,
				embeds: [],
				components: []
			})

			const pvpId = new ObjectId().toString()
			const initialGif = getRandomGif()

			const pvpData = {
				pvpId,
				player1: interaction.user.id,
				player2: opponent.id,
				player1Health: await getUserMaxHealth(interaction.user.id),
				player2Health: await getUserMaxHealth(opponent.id),
				player1DomainProgress: 0,
				player2DomainProgress: 0,
				player1TransformationProgress: 0,
				player2TransformationProgress: 0,
				currentTurn: Math.random() < 0.5 ? interaction.user.id : opponent.id,
				createdAt: new Date()
			}

			await client.db(mongoDatabase).collection("pvp").insertOne(pvpData)

			const createEmbed = (attacker: User, pvpData) => {
				return new EmbedBuilder()
					.setTitle("PvP Battle")
					.setDescription(`It's ${attacker.username}'s turn!`)
					.setColor(getRandomColor())
					.setImage(initialGif)
					.addFields(
						{
							name: `${attacker.username}'s Stats`,
							value: `
                                **Health**: ${pvpData.currentTurn === interaction.user.id ? pvpData.player1Health : pvpData.player2Health} :blue_heart:
                                **Domain Progress**: ${generateProgressBar(pvpData.currentTurn === interaction.user.id ? pvpData.player1DomainProgress : pvpData.player2DomainProgress, 100)}
                                **Transformation Progress**: ${generateProgressBar(pvpData.currentTurn === interaction.user.id ? pvpData.player1TransformationProgress : pvpData.player2TransformationProgress, 100)}
                            `,
							inline: true
						},
						{
							name: `${pvpData.currentTurn === interaction.user.id ? opponent.username : interaction.user.username}'s Stats`,
							value: `
                                **Health**: ${pvpData.currentTurn === interaction.user.id ? pvpData.player2Health : pvpData.player1Health} :blue_heart:
                                **Domain Progress**: ${generateProgressBar(pvpData.currentTurn === interaction.user.id ? pvpData.player2DomainProgress : pvpData.player1DomainProgress, 100)}
                                **Transformation Progress**: ${generateProgressBar(pvpData.currentTurn === interaction.user.id ? pvpData.player2TransformationProgress : pvpData.player1TransformationProgress, 100)}
                            `,
							inline: true
						}
					)
			}

			cooldowns.set(interaction.user.id, Date.now() + cooldownDuration)
			setTimeout(() => {
				cooldowns.delete(interaction.user.id)
			}, cooldownDuration)

			const updateComponents = (techniques: string[], attacker: User, pvpData) => {
				const techniqueOptions = techniques.map(techniqueName => ({
					label: techniqueName,
					description: "Select to use this technique",
					value: techniqueName
				}))

				const selectMenu = new SelectMenuBuilder()
					.setCustomId("select-technique-pvp")
					.setPlaceholder("Choose your technique")
					.addOptions(techniqueOptions)

				const domainButton = new ButtonBuilder()
					.setCustomId("domain")
					.setLabel("Domain")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(pvpData.player1DomainProgress < 100)

				const transformButton = new ButtonBuilder()
					.setCustomId("transform")
					.setLabel("Transform")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(pvpData.player1TransformationProgress < 100)

				const surrenderButton = new ButtonBuilder()
					.setCustomId("surrender")
					.setLabel("Surrender")
					.setStyle(ButtonStyle.Danger)

				const selectMenuRow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu)
				const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					domainButton,
					transformButton,
					surrenderButton
				)

				return [selectMenuRow, buttonRow]
			}

			const updateBattleState = async () => {
				const pvpData = await client.db(mongoDatabase).collection("pvp").findOne({ pvpId })
				const attacker = pvpData.currentTurn === interaction.user.id ? interaction.user : opponent
				const defender = pvpData.currentTurn === interaction.user.id ? opponent : interaction.user

				console.debug(`Updating battle display before interaction turn for ${attacker.id}`)

				const techniques = await getUserActiveTechniques(attacker.id)
				const primaryEmbed = createEmbed(attacker, pvpData)
				const components = updateComponents(techniques, attacker, pvpData)

				await interaction.editReply({
					embeds: [primaryEmbed],
					components: components
				})

				const collectorFilter = (inter: MessageComponentInteraction) => {
					if (inter.user.id === attacker.id) {
						return true
					} else {
						inter.reply({ content: "Nuh uh, it's not your turn.", ephemeral: true })
						return false
					}
				}

				const buttonCollector = interaction.channel.createMessageComponentCollector({
					filter: collectorFilter,
					componentType: ComponentType.Button,
					time: 60000
				})

				buttonCollector.on("collect", async collectedInteraction => {
					const selectedValue = collectedInteraction.customId

					if (selectedValue === "surrender") {
						const surrenderEmbed = new EmbedBuilder()
							.setColor("#FF0000")
							.setTitle("Surrender")
							.setDescription(`${attacker.username} has surrendered. ${defender.username} wins!`)
							.setTimestamp()

						await collectedInteraction.update({
							content: "",
							embeds: [surrenderEmbed],
							components: []
						})
						buttonCollector.stop()
						await client.db(mongoDatabase).collection("pvp").deleteOne({ pvpId })
						return
					} else if (selectedValue === "domain") {
						if (pvpData.player1DomainProgress < 100) {
							await collectedInteraction.reply({
								content: "Your Domain Progress is not full yet.",
								ephemeral: true
							})
							return
						}

						const hasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(attacker.id)

						if (hasHeavenlyRestriction) {
							await collectedInteraction.reply({
								content: "Your Heavenly Restriction negates the use of domain expansion.",
								ephemeral: true
							})
							return
						}

						const domainInfo = await getUserDomain(attacker.id)
						if (!domainInfo) {
							await collectedInteraction.reply({
								content: "You do not have a domain unlocked yet.",
								ephemeral: true
							})
							return
						}

						const domainObject = DOMAIN_EXPANSIONS.find(domain => domain.name === domainInfo)
						if (!domainObject) {
							console.error("Invalid domain found in the database.")
							return
						}

						const domainEmbed = new EmbedBuilder()
							.setColor("Blue")
							.setTitle(`Domain Expansion... ${domainInfo}`)
							.setDescription(`${attacker.username} has opened their domain ${domainInfo}!`)
							.setImage(domainObject.open_image_URL)

						await collectedInteraction.update({ embeds: [domainEmbed], components: [] })

						// Apply status effect if applicable
						if (domainObject.statusEffect) {
							await applyStatusEffect(attacker.id, domainObject.statusEffect)
						}

						await new Promise(resolve => setTimeout(resolve, 3000))

						// Update current turn to defender
						pvpData.currentTurn = defender.id
						await client
							.db(mongoDatabase)
							.collection("pvp")
							.updateOne(
								{ pvpId },
								{
									$set: { currentTurn: pvpData.currentTurn }
								}
							)

						// Offer the opponent the chance to initiate a domain clash or defend
						const clashButton = new ButtonBuilder()
							.setCustomId("clash")
							.setLabel("Domain Clash")
							.setStyle(ButtonStyle.Primary)
							.setDisabled(pvpData.player2DomainProgress < 100)

						const defendButton = new ButtonBuilder()
							.setCustomId("defend")
							.setLabel("Defend")
							.setStyle(ButtonStyle.Secondary)

						const clashDefendRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
							clashButton,
							defendButton
						)

						await collectedInteraction.editReply({
							content: `${defender}, you have been challenged to a domain clash! Choose your action:`,
							embeds: [domainEmbed],
							components: [clashDefendRow]
						})

						const clashDefendCollector = interaction.channel.createMessageComponentCollector({
							filter: (inter: MessageComponentInteraction) => inter.user.id === defender.id,
							componentType: ComponentType.Button,
							time: 5000
						})

						let opponentResponded = false

						clashDefendCollector.on("collect", async clashDefendInteraction => {
							opponentResponded = true
							const selectedClashDefendValue = clashDefendInteraction.customId

							if (selectedClashDefendValue === "clash") {
								const opponentDomainInfo = await getUserDomain(defender.id)
								let clashEmbed

								if (
									(domainInfo === "Malevolent Shrine" && opponentDomainInfo === "Unlimited Void") ||
									(domainInfo === "Unlimited Void" && opponentDomainInfo === "Malevolent Shrine")
								) {
									clashEmbed = new EmbedBuilder()
										.setColor("Red")
										.setTitle("Special Domain Clash!")
										.setDescription("A fierce clash between Malevolent Shrine and Unlimited Void!")
										.setImage(
											"https://media1.tenor.com/m/SSY_DQmpNykAAAAC/gojo-vs-sukuna-satoru-gojo.gif"
										)
								} else {
									clashEmbed = new EmbedBuilder()
										.setColor("Red")
										.setTitle("Domain Clash!")
										.setDescription(
											"Both players have activated their domains! A clash is imminent!"
										)
										.setImage("CLASH_IMAGE_URL")
								}

								await clashDefendInteraction.update({
									embeds: [clashEmbed],
									components: []
								})

								const clashDamage = 100
								pvpData.player1Health = Math.max(0, pvpData.player1Health - clashDamage)
								pvpData.player2Health = Math.max(0, pvpData.player2Health - clashDamage)

								await new Promise(resolve => setTimeout(resolve, 3000))

								await client
									.db(mongoDatabase)
									.collection("pvp")
									.updateOne(
										{ pvpId },
										{
											$set: {
												player1Health: pvpData.player1Health,
												player2Health: pvpData.player2Health
											}
										}
									)

								await clashDefendInteraction.editReply({
									embeds: [primaryEmbed],
									components: components
								})
							} else if (selectedClashDefendValue === "defend") {
								const defenseTechnique = await getUserActiveDefenseTechnique(defender.id)
								let defenseDescription = `${defender.username} has successfully defended against the domain attack.`

								if (defenseTechnique) {
									if (defenseTechnique === "Simple Domain") {
										defenseDescription = `${defender.username} used Simple Domain to defend against the domain attack.`
									} else if (defenseTechnique === "Hollow Wicker Basket") {
										defenseDescription = `${defender.username} used Hollow Wicker Basket to defend against the domain attack.`
									}
								}

								const defendEmbed = new EmbedBuilder()
									.setColor("Green")
									.setTitle("Defense Successful")
									.setDescription(defenseDescription)

								await clashDefendInteraction.update({ embeds: [defendEmbed], components: [] })

								//

								await new Promise(resolve => setTimeout(resolve, 3000))

								await clashDefendInteraction.editReply({
									embeds: [primaryEmbed],
									components: components
								})
							}

							clashDefendCollector.stop()
							pvpData.currentTurn =
								pvpData.currentTurn === interaction.user.id ? opponent.id : interaction.user.id
							await client
								.db(mongoDatabase)
								.collection("pvp")
								.updateOne(
									{ pvpId },
									{
										$set: { currentTurn: pvpData.currentTurn }
									}
								)
							await updateBattleState()
						})

						clashDefendCollector.on("end", async (collected, reason) => {
							if (!opponentResponded) {
								// Defender didn't respond in time
								const unleashedDamage = 150 // Example value for damage when domain is fully unleashed
								pvpData.player2Health = Math.max(0, pvpData.player2Health - unleashedDamage)

								const unleashedEmbed = new EmbedBuilder()
									.setColor("Red")
									.setTitle("Domain Fully Unleashed!")
									.setDescription(`${attacker.username}'s domain has been fully unleashed!`)
									.setImage(domainObject.open_image_URL)

								await interaction.editReply({
									content: "",
									embeds: [unleashedEmbed],
									components: []
								})

								await new Promise(resolve => setTimeout(resolve, 3000))

								await client
									.db(mongoDatabase)
									.collection("pvp")
									.updateOne(
										{ pvpId },
										{
											$set: {
												player2Health: pvpData.player2Health,
												currentTurn: opponent.id
											}
										}
									)

								await updateBattleState()
							}
						})
						return
					} else if (selectedValue === "transform") {
						console.info("Transformation selected.")
						if (transformationState.get(contextKey)) {
							await collectedInteraction.followUp({
								content: "You can only transform once per fight.",
								ephemeral: true
							})
							return
						}

						try {
							const transformationInfo = await getUserTransformation(interaction.user.id)
							if (!transformationInfo) {
								await collectedInteraction.followUp({
									content: "You do not have a transformation unlocked yet.",
									ephemeral: true
								})
								return
							}

							const transformationObject = TRANSFORMATIONS.find(
								transformation => transformation.name === transformationInfo
							)
							if (!transformationObject) {
								console.error("Invalid transformation found in the database.")
								return
							}
							transformationState.set(contextKey, true)
							// embed here
							const transformationEmbed = new EmbedBuilder()
								.setColor("Blue")
								.setTitle("Transformation!")
								.setDescription(`Transformation: ${transformationInfo}`)
								.addFields({
									name: `${interaction.user.username}`,
									value: "USES THEIR TRANSFORMATION!",
									inline: false
								})
								.setImage(transformationObject.image)

							await collectedInteraction.update({
								embeds: [transformationEmbed],
								components: []
							})

							// Apply transformation effects
							if (transformationObject.effects === "damageIncrease") {
								pvpData.damageMultiplier = 1.5 // Example value
							} else if (transformationObject.effects === "damageReduction") {
								pvpData.damageReduction = 0.5 // Example value
							}

							await new Promise(resolve => setTimeout(resolve, 3000))

							pvpData.currentTurn =
								pvpData.currentTurn === interaction.user.id ? opponent.id : interaction.user.id
							await client
								.db(mongoDatabase)
								.collection("pvp")
								.updateOne(
									{ pvpId },
									{
										$set: { currentTurn: pvpData.currentTurn }
									}
								)
							await updateBattleState()
						} catch (error) {
							console.error("An error occurred during transformation:", error)
							await collectedInteraction.followUp({
								content: "An error occurred during transformation.",
								ephemeral: true
							})
						}
						return
					}
				})

				const techniqueCollector = interaction.channel.createMessageComponentCollector({
					filter: collectorFilter,
					componentType: ComponentType.StringSelect,
					time: 60000
				})

				techniqueCollector.on("collect", async collectedInteraction => {
					const selectedValue = collectedInteraction.values[0]

					const usertechniquespvp = new Map()
					const { damage, imageUrl, description } = await executeSpecialTechniquePvp({
						collectedInteraction,
						techniqueName: selectedValue,
						damageMultiplier: pvpData.damageMultiplier || 1,
						userTechniques: usertechniquespvp,
						userId: collectedInteraction.user.id,
						primaryEmbed,
						rows: components
					})

					console.debug(`Damage dealt: ${damage}`)
					console.debug("Embed after executing technique:", primaryEmbed.toJSON())

					if (pvpData.currentTurn === interaction.user.id) {
						pvpData.player2Health = Math.max(0, pvpData.player2Health - damage)
						pvpData.player1DomainProgress += 10
						pvpData.player1TransformationProgress += 5
					} else {
						pvpData.player1Health = Math.max(0, pvpData.player1Health - damage)
						pvpData.player2DomainProgress += 10
						pvpData.player2TransformationProgress += 5
					}

					// Update the same embed with new values and image
					primaryEmbed.setImage(imageUrl)
					primaryEmbed.setDescription(description)
					primaryEmbed.setFields(
						{
							name: `${attacker.username}'s Stats`,
							value: `
								**Health**: ${pvpData.currentTurn === interaction.user.id ? pvpData.player1Health : pvpData.player2Health} :blue_heart:
								**Domain Progress**: ${generateProgressBar(pvpData.currentTurn === interaction.user.id ? pvpData.player1DomainProgress : pvpData.player2DomainProgress, 100)}
								**Transformation Progress**: ${generateProgressBar(pvpData.currentTurn === interaction.user.id ? pvpData.player1TransformationProgress : pvpData.player2TransformationProgress, 100)}
							`,
							inline: true
						},
						{
							name: `${pvpData.currentTurn === interaction.user.id ? opponent.username : interaction.user.username}'s Stats`,
							value: `
								**Health**: ${pvpData.currentTurn === interaction.user.id ? pvpData.player2Health : pvpData.player1Health} :blue_heart:
								**Domain Progress**: ${generateProgressBar(pvpData.currentTurn === interaction.user.id ? pvpData.player2DomainProgress : pvpData.player1DomainProgress, 100)}
								**Transformation Progress**: ${generateProgressBar(pvpData.currentTurn === interaction.user.id ? pvpData.player2TransformationProgress : pvpData.player1TransformationProgress, 100)}
							`,
							inline: true
						}
					)

					await interaction.editReply({
						embeds: [primaryEmbed],
						components: []
					})

					await new Promise(resolve => setTimeout(resolve, 3000))

					await client
						.db(mongoDatabase)
						.collection("pvp")
						.updateOne(
							{ pvpId },
							{
								$set: {
									player1Health: pvpData.player1Health,
									player2Health: pvpData.player2Health,
									player1DomainProgress: pvpData.player1DomainProgress,
									player2DomainProgress: pvpData.player2DomainProgress,
									player1TransformationProgress: pvpData.player1TransformationProgress,
									player2TransformationProgress: pvpData.player2TransformationProgress
								}
							}
						)

					await interaction.editReply({
						embeds: [primaryEmbed],
						components: components
					})

					pvpData.currentTurn =
						pvpData.currentTurn === interaction.user.id ? opponent.id : interaction.user.id
					await client
						.db(mongoDatabase)
						.collection("pvp")
						.updateOne(
							{ pvpId },
							{
								$set: { currentTurn: pvpData.currentTurn }
							}
						)
					await updateBattleState()
				})
			}

			await updateBattleState()
		} else if (confirmation.customId === "pvp_deny") {
			await confirmation.update({
				content: `${opponent} has declined the PvP challenge from ${interaction.user}.`,
				embeds: [],
				components: []
			})
		}
	} catch (error) {
		await interaction.editReply({
			content: "The opponent did not respond in time. The challenge has been canceled.",
			embeds: [],
			components: []
		})
	}
}

export async function handleSettingsCommand(interaction: CommandInteraction) {
	const userId = interaction.user.id

	let settings = (await getUserSettings(userId)) as UserSettings
	if (!settings) {
		settings = { pvpable: true, acceptTrades: true, showAlerts: true, showSpoilers: true }
	}

	const updatedFields = []

	const ispvpableOption = interaction.options.get("pvpable")
	const ispvpable = ispvpableOption ? Boolean(ispvpableOption.value) : null
	if (ispvpable !== null) {
		settings.pvpable = ispvpable
		updatedFields.push({ name: "PvP Available", value: ispvpable ? "Enabled" : "Disabled", inline: true })
	}

	const showAlertsOption = interaction.options.get("showalerts")
	const showAlerts = showAlertsOption ? Boolean(showAlertsOption.value) : null
	if (showAlerts !== null) {
		settings.showAlerts = showAlerts
		updatedFields.push({ name: "Show Alerts", value: showAlerts ? "Enabled" : "Disabled", inline: true })
	}

	const acceptTradesOption = interaction.options.get("acceptrades")
	const acceptTrades = acceptTradesOption ? Boolean(acceptTradesOption.value) : null
	if (acceptTrades !== null) {
		settings.acceptTrades = acceptTrades
		updatedFields.push({ name: "Accept Trades", value: acceptTrades ? "Enabled" : "Disabled", inline: true })
	}
	const showspoilerOption = interaction.options.get("showspoiler")
	const showSpoiler = showspoilerOption ? Boolean(showspoilerOption.value) : null
	if (showSpoiler !== null) {
		settings.showSpoilers = showSpoiler
		updatedFields.push({ name: "Show Spoiler", value: showSpoiler ? "Enabled" : "Disabled", inline: true })
	}

	await updateUserSettings(userId, settings)

	const embed = new EmbedBuilder()
		.setColor("#00FF00")
		.setTitle("Settings Updated")
		.setDescription("Your settings have been updated successfully.")
		.addFields(updatedFields)
		.setTimestamp()

	await interaction.reply({ embeds: [embed], ephemeral: true })
}

export async function handleViewSettingsCommand(interaction: CommandInteraction) {
	const userId = interaction.user.id
	const settings = ((await getUserSettings(userId)) as UserSettings) || {
		pvpable: true,
		acceptTrades: true,
		showAlerts: true,
		showSpoilers: false
	}

	const embed = new EmbedBuilder()
		.setColor("#00FF00")
		.setTitle("Current Settings")
		.addFields(
			{
				name: "PvP Available",
				value: settings.pvpable ? "✅" : "❌",
				inline: true
			},
			{
				name: "PvP Available Description",
				value: "Toggle whether you can engage in player versus player combat.",
				inline: false
			},
			{
				name: "Show Alerts",
				value: settings.showAlerts ? "✅" : "❌",
				inline: true
			},
			{
				name: "Show Alerts Description",
				value: "Toggle whether you receive alerts for important events.",
				inline: false
			},
			{
				name: "Accept Trades",
				value: settings.acceptTrades ? "✅" : "❌",
				inline: true
			},
			{
				name: "Accept Trades Description",
				value: "Toggle whether you can accept trade offers from other players.",
				inline: false
			},
			{
				name: "Show Spoilers",
				value: settings.showSpoilers ? "✅" : "❌",
				inline: true
			},
			{
				name: "Show Spoilers Description",
				value: "Toggle whether you want to see spoilers in the bot.",
				inline: false
			}
		)
		.setTimestamp()

	await interaction.reply({ embeds: [embed], ephemeral: true })
}

client1.login(process.env["DISCORD_BOT_TOKEN"])
