/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
/* eslint-disable prettier/prettier */
let contextKey: string
import { MessageActionRowComponentBuilder, SelectMenuBuilder } from "@discordjs/builders"
import {
	ActionRowBuilder,
	Attachment,
	ButtonBuilder,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	Client,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	Interaction,
	SelectMenuInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction
} from "discord.js"
import {
	DOMAIN_INFORMATION,
	TRANSFORMATIONS,
	attacks,
	executeBossAttack,
	heavenlyrestrictionskills
} from "./attacks.js"
import { checkImageForNSFW, uploadImageToGoogleStorage } from "./aws.js"
import { bossDrops } from "./bossdrops.js"
import { digCooldown, digCooldowns, logger, sendForManualReview } from "./bot.js"
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
	executeSpecialTechnique,
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
	handleShikigamiTame
} from "./fight.js"
import { BossData, buildGamblersProfile, formatDomainExpansion, gradeMappings } from "./interface.js"
import {
	CLAN_SKILLS,
	DOMAIN_EXPANSIONS,
	INVENTORY_CLAN,
	MiniGameResult,
	allAchievements,
	benefactors,
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
	UserShikigami,
	addItemToUserInventory,
	addUser,
	addUserPurchases,
	addUserQuest,
	addUserTechnique,
	checkProfileChangeCooldown,
	checkStageMessaged,
	checkUserHasHeavenlyRestriction,
	checkWorkCooldown,
	cleanShikigami,
	createTradeRequest,
	feedShikigami,
	getActiveTrades,
	getAllShopItems,
	getAllUserExperience,
	getAllUsersBalance,
	getBalance,
	getBosses,
	getCurrentCommunityQuest,
	getGamblersData,
	getMonthlyFightsWonLeaderboard,
	getNextAwakeningStage,
	getPreviousTrades,
	getShikigami,
	getShopLastReset,
	getUserAchievements,
	getUserActiveHeavenlyTechniques,
	getUserActiveTechniques,
	getUserAwakening,
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
	getUserShikigami,
	getUserStats,
	getUserStatusEffects,
	getUserTechniques,
	getUserTransformation,
	getUserUnlockedBosses,
	getUserUnlockedTitles,
	getUserUnlockedTransformations,
	getUserWorked,
	handleTradeAcceptance,
	healShikigami,
	logImageUrl,
	markStageAsMessaged,
	removeAllStatusEffects,
	removeItemFromUserInventory,
	removeUserQuest,
	updateBalance,
	updateGamblersData,
	updatePlayerGrade,
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
	updateUserProfileHeader,
	updateUserProfileImage,
	updateUserShikigami,
	updateUserTitle,
	updateUserTransformation,
	updateUserUnlockedTransformations,
	updateUserWorked,
	userExists,
	viewTradeRequests
} from "./mongodb.js"
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
import { getAwakeningDialogue, getMentorDetails } from "./utils.js"

const domainActivationState = new Map()
const transformationState = new Map()
const bossHealthMap = new Map()

export const searchCooldowns = new Map()
export const searchCooldown = 60 * 1000
export const searchCooldownBypassIDs = [""]
//

export async function handleRegisterCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	try {
		const discordId = interaction.user.id

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
			const imageURL = "https://storage.googleapis.com/jjk_bot_personal/Shibuya_(Anime).png"
			const welcomeEmbed = new EmbedBuilder()
				.setColor(0x5d2e8c)
				.setTitle("Jujutsu Registration Complete!")
				.setDescription(
					`Welcome, ${interaction.user.toString()}! You can use /help if your ever stuck, Or /guide on a certain subject.\nYou've also got a free Starter Bundle in your inventory!`
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

export async function handleDigCommand(interaction) {
	await interaction.deferReply()

	await updateUserCommandsUsed(interaction.user.id)

	const currentTime = Date.now()
	const authorId = interaction.user.id
	const timestamp = digCooldowns.get(authorId)

	if (timestamp) {
		const expirationTime = timestamp + digCooldown
		if (currentTime < expirationTime) {
			const digCooldownEmbed = new EmbedBuilder()
				.setColor(0x4b0082)
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

	digCooldowns.set(authorId, currentTime)

	const itemDiscoveryChance = 0.7
	const doesDiscoverItem = Math.random() < itemDiscoveryChance
	const coinsFound = Math.floor(Math.random() * 20000) + 1

	await updateBalance(interaction.user.id, coinsFound)
	await updateUserFavoriteCommand(interaction.user.id, "Dig")

	if (doesDiscoverItem) {
		const itemFound = getRandomItem()

		if (itemFound) {
			await addItemToUserInventory(authorId, itemFound.name, 1)

			const digEmbed = new EmbedBuilder()
				.setColor(0x00ff00)
				.setTitle("Digging Results")
				.setDescription(`You unearthed \\\`⌬${coinsFound}\\\` coins! **You also found a ${itemFound.name}!**`)
				.setTimestamp()
			await interaction.editReply({ embeds: [digEmbed] })
		} else {
			const digEmbed = new EmbedBuilder()
				.setColor(0x00ff00)
				.setTitle("Digging Results")
				.setDescription(`You unearthed \`⌬${coinsFound}\` coins but didn't find any items this time.`)
				.setTimestamp()
			await interaction.editReply({ embeds: [digEmbed] })
		}
	} else {
		const digEmbed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle("Digging Results")
			.setDescription(`You unearthed \`⌬${coinsFound}\` coins but didn't find any items this time.`)
			.setTimestamp()
		await interaction.editReply({ embeds: [digEmbed] })
	}
	await postCommandMiddleware(interaction)
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

	// Set up the collector within handleJobSelection
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
	const streakBonus = 2500

	// Fetch the user's last daily claim time and streak from the database
	const { lastDaily, streak: lastStreak } = await getUserDailyData(userId)

	// Check if the user is on cooldown
	if (currentTime - lastDaily < oneDayMs) {
		const nextAvailableTime = Math.floor((lastDaily + oneDayMs) / 1000) // Convert to seconds for the Discord timestamp

		await interaction.reply({
			content: `You must wait before you can claim your daily reward again. You can claim it again <t:${nextAvailableTime}:R>.`,
			ephemeral: true
		})

		return
	}

	// Calculate streak
	const streak = currentTime - lastDaily < oneDayMs * 2 ? lastStreak + 1 : 1

	// Calculate coins reward based on streak
	const coinsReward = baseReward + streakBonus * (streak - 1)

	await updateUserDailyData(userId, currentTime, streak)

	await updateBalance(userId, coinsReward)
	const randomItemIndex = Math.floor(Math.random() * dailyitems.length)
	const dailyItem = dailyitems[randomItemIndex]
	await addItemToUserInventory(userId, dailyItem.name, 1)

	// Create and send the confirmation embed, including the item reward
	const dailyEmbed = new EmbedBuilder()
		.setColor(0x1f8b4c) // A more distinct green color
		.setTitle("🎁 Daily Reward Claimed! 🎁")
		.setThumbnail("https://i.pinimg.com/736x/8f/90/56/8f9056043d8ea491aab138f1a005599d.jpg") // Make sure this URL points to a relevant, visually appealing image
		.addFields(
			{ name: "Coins Awarded", value: `**${coinsReward.toLocaleString()} coins** 💰`, inline: true },
			{ name: "Special Item", value: `**${dailyItem.name}** 🗝️`, inline: true },
			{ name: "Streak", value: `**${streak}** day(s) 🔥`, inline: false }
		)
		.setDescription(
			"Congratulations on claiming your daily reward! Keep coming back every day for even bigger rewards."
		)
		.setFooter({ text: "Pro tip: Daily streaks increase your rewards!" })
		.setTimestamp()

	await interaction.reply({ embeds: [dailyEmbed] })
	await postCommandMiddleware(interaction)
}

export async function handleCraftCommand(interaction: ChatInputCommandInteraction<CacheType>) {
	try {
		const userInventory = await getUserInventory(interaction.user.id) // Fetch the user's current inventory
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
						const emojiId = recipe.emoji && recipe.emoji.match(/:([0-9]+)>/)?.[1]

						return {
							label: recipe.craftedItemName,
							description: "Click to craft this item",
							value: key,
							emoji: emojiId ? { id: emojiId } : undefined
						}
					})
					.filter(option => option !== null)
			)
		//

		const row1 = new ActionRowBuilder<SelectMenuBuilder>().addComponents(craftableItemsMenu)

		await interaction.reply({ content: "", components: [row1] })

		const menuFilter = i => i.customId === "selectCraftItem" && i.user.id === interaction.user.id
		const menuCollector = interaction.channel.createMessageComponentCollector({ filter: menuFilter, time: 60000 })

		menuCollector.on("collect", async interaction => {
			if (interaction.isStringSelectMenu()) {
				await interaction.deferUpdate()
				const selectedItemKey = interaction.values[0]
				const selectedItemRecipe = craftingRecipes[selectedItemKey]

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

				const confirmButton = new ButtonBuilder()
					.setCustomId("confirmCraft")
					.setLabel("Confirm")
					.setStyle(ButtonStyle.Success)
					.setEmoji("✅")

				const cancelButton = new ButtonBuilder()
					.setCustomId("cancelCraft")
					.setLabel("Cancel")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("❌")

				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton)

				await interaction.editReply({
					embeds: [craftEmbed],
					components: [row, row1]
				})

				const buttonFilter = i =>
					["confirmCraft", "cancelCraft"].includes(i.customId) && i.user.id === interaction.user.id

				const buttonCollector = interaction.channel.createMessageComponentCollector({
					filter: buttonFilter,
					time: 20000 // Collector will last for 20 seconds
				})

				buttonCollector.on("collect", async buttonInteraction => {
					await buttonInteraction.deferReply()

					if (buttonInteraction.customId === "confirmCraft") {
						const userInventory = await getUserInventory(interaction.user.id)
						const inventoryMap = new Map(userInventory.map(item => [item.name, item.quantity]))

						const missingItems = selectedItemRecipe.requiredItems.filter(item => {
							return inventoryMap.get(item.name) < item.quantity
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
					} else if (buttonInteraction.customId === "cancelCraft") {
						await buttonInteraction.editReply({ content: "Crafting canceled.", components: [] })
					}

					buttonCollector.stop()
					menuCollector.stop
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

	// Create the dropdown menu

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

	// Handle title selection
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

		// collector.stop()
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
			const coinsFoundThisSearch = Math.floor(Math.random() * 20000) + 1 // Coins found in this specific search

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

				userSearching.delete(interaction.user.id) // Remove the user from the search map
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
				const coinsFound = userSearching.get(inter.user.id)?.coinsFound ?? 0 // Handle if userSearching.get(...) is null
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
			version: "Update 7.0 PART ONE", // Replace with your actual version number
			date: "07-05-24", // Adjust the date as needed
			changes: [
				{
					name: "**User Awakenings!**",
					value: "New awakening systems to launch yourself through the jujutsu world.. Start out by getting a mentor, from the quests.\n- Craft the new item called Unknown Substance.. use it if your strong enough.."
				},
				{
					name: "BALANCED ALL SKILLS + + HEAVENLY RESTRICTION SEMI-REWORK.",
					value: "+ 5 New Bosses!\n+ 9 New Techniques!\nHeavenly restriction may now be the most POWERFUL it's ever been.."
				},
				{
					name: "MENTORS!",
					value: "Current mentors are Satoru Gojo, Ryomen Sukuna. Each with there respective quests"
				},
				{
					name: "Found a bug? Report it!",
					value: "If you've found any bugs or issues, please report them in the support server. > /support <"
				},
				{
					name: "**Thank you everybody who uses the bot!**",
					value: "I appreciate all the support and feedback i've received so far. Thank you!"
				},
				{
					name: "**forgot to update this again..**",
					value: "Stay up to date with the bot by joining the community server! > /support <"
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

	recentUpdates[0].changes.forEach(change => {
		updateEmbed.addFields({ name: change.name, value: change.value })
	})

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

// Simplify technique names (assuming this function already exists in your code)
function simplifyTechniqueName(fullName: string): string {
	const nameMap = {
		"Ten Shadows Technique: Eight-Handled Sword Divergent Sila Divine General Mahoraga": "Divine General Mahoraga"
	}
	return nameMap[fullName] || fullName
}

export async function handleJujutsuStatsCommand(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser("user") || interaction.user
	const userId = targetUser.id

	try {
		await updateUserFavoriteCommand(interaction.user.id, "Jujutsu Stats")
		const userDomain = await getUserDomain(userId)
		const userMaxHealth = await getUserMaxHealth(userId)
		const honors = (await getUserHonours(userId)) || []
		const transform = await getUserTransformation(userId)
		const userHeavenlyRestriction = await checkUserHasHeavenlyRestriction(userId)

		//
		let userTechniques: string[] = await (userHeavenlyRestriction
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
			.setColor("#4B0082") // Purple color
			.setDescription("Dive into the depth of your Jujutsu prowess. Here are your current stats, sorcerer.")
			.addFields(
				{ name: "🏅 Honours", value: honors.toString() || "None", inline: true },
				{ name: "💓 Health", value: userMaxHealth.toString(), inline: true },
				{
					name: "⚖️ Heavenly Restriction",
					value: userHeavenlyRestriction ? "Active" : "Inactive",
					inline: true
				},
				{ name: "🔪 Transformation", value: transform || "None", inline: false },
				{ name: "🌀 Techniques & Domain Expansion", value: techniquesDisplay || "None", inline: false }
			)
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

function formatCooldown(cooldown) {
	const seconds = Math.floor((cooldown / 1000) % 60)
	const minutes = Math.floor((cooldown / (1000 * 60)) % 60)
	const hours = Math.floor((cooldown / (1000 * 60 * 60)) % 24)

	return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m " : ""}${seconds > 0 ? seconds + "s" : ""}`
}

function generateBossDropFields(bossDrops, startIndex, endIndex) {
	const rarityAbbreviations = {
		"common": "C",
		"rare": "R",
		"ultra rare": "UR"
	}

	const fields = []
	for (let i = startIndex; i < endIndex; i++) {
		const bossName = Object.keys(bossDrops)[i]
		const drops = bossDrops[bossName]

		const shortDropList =
			drops.length > 3
				? drops
						.slice(0, 3)
						.map(drop => `**${drop.name}** (${rarityAbbreviations[drop.rarity.toLowerCase()]})`)
						.join(", ") + " ..."
				: drops.map(drop => `${drop.name} (${rarityAbbreviations[drop.rarity.toLowerCase()]})`).join(", ")

		fields.push({
			name: `**${bossName}**`,
			value: shortDropList,
			inline: true
		})
	}
	return fields
}

// guide command
export async function handleGuideCommand(interaction) {
	const topic = interaction.options.getString("topic")

	switch (topic) {
		case "special": {
			const guideEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Special Items")
				.setDescription("Information on unique/special items")
				.addFields({
					name: "Basic Usages",
					value: "Main item's you can use is as follows, Sukuna Finger, Six Eyes, Cursed Energy Vial, and more. Rewards: Cursed Energy Vial = +30hp, Six Eyes, Various effects, Sukuna Finger, Various effects."
				})
				.setImage(
					"https://cdn.discordapp.com/attachments/1094302755960664255/1231374487774040074/image.png?ex=6636b9db&is=662444db&hm=b80646a17ca3cb4c205170abc51a1616810afb548d8746c80a313b7587aa195a&"
				)

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
			break
		}

		case "items": {
			await interaction.deferReply({ ephemeral: true })

			try {
				const guideEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle("Items Guide")
					.setDescription("Main methods of getting items")
					.addFields({
						name: "Item Rarities\n`C` - Common\n`R` - Rare\n`UR` - Ultra Rare",
						value: "You can get items from /fight, /dig, /search, /beg, /quest, /daily.  Boss drops are as follows:\n"
					})

				const bossDropCount = Object.keys(bossDrops).length
				const fieldsPerPage = 5
				const totalPages = Math.ceil(bossDropCount / fieldsPerPage)

				let currentPage = 1
				let startIndex = 0
				let endIndex = Math.min(startIndex + fieldsPerPage, bossDropCount)

				const bossDropFields = generateBossDropFields(bossDrops, startIndex, endIndex)
				guideEmbed.addFields(...bossDropFields)

				const prevButton = new ButtonBuilder()
					.setCustomId("prevPage")
					.setLabel("Previous")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentPage === 1)

				const nextButton = new ButtonBuilder()
					.setCustomId("nextPage")
					.setLabel("Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentPage === totalPages)

				const pageInfo = `Page ${currentPage} of ${totalPages}`
				const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					prevButton,
					nextButton
				)

				const message = await interaction.followUp({
					embeds: [guideEmbed],
					components: [row],
					content: pageInfo,
					ephemeral: true
				})

				const collector = message.createMessageComponentCollector({
					time: 60000
				})

				collector.on("collect", async i => {
					if (i.customId === "prevPage") {
						currentPage--
					} else if (i.customId === "nextPage") {
						currentPage++
					}

					startIndex = (currentPage - 1) * fieldsPerPage
					endIndex = Math.min(startIndex + fieldsPerPage, bossDropCount)

					const newBossDropFields = generateBossDropFields(bossDrops, startIndex, endIndex)
					const existingFieldCount = guideEmbed.data.fields?.length ?? 0
					guideEmbed.spliceFields(
						existingFieldCount - bossDropFields.length,
						bossDropFields.length,
						...newBossDropFields
					)

					prevButton.setDisabled(currentPage === 1)
					nextButton.setDisabled(currentPage === totalPages)

					const newPageInfo = `Page ${currentPage} of ${totalPages}`

					await i.update({
						embeds: [guideEmbed],
						components: [row],
						content: newPageInfo
					})
				})
			} catch (error) {
				logger.error("Error handling items guide command:", error)
			}

			break
		}

		case "quests": {
			const guideEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Quest Guide")
				.setDescription("Information on various quests!")
				.addFields({
					name: "Quests",
					value: "There are certain types of quests in the bot. Some give you techniques, while others give you transformations.\n\n- Sukuna Acknowledgment Quest: You have to eat a Sukuna Finger until he notices you. There's a base 30% chance for this to happen. When you eat another finger, a quest shall start."
				})

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
			break
		}

		case "starter": {
			const guideEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Starter Guide")
				.setDescription("Here's how you can begin")
				.addFields({
					name: "Basic",
					value: "You can acquire jobs with /jobselection. Some jobs require money and experience. You can get Money, XP, and Items by using /beg, /dig, /search, /fight, and /quest. I recommend working and searching until you have enough money to buy a technique, and then start fighting cursed spirits."
				})

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
			break
		}

		case "technique": {
			const guideEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Technique Guide")
				.setDescription("Here's how you can acquire techniques.")
				.addFields({
					name: "Techniques",
					value: "To acquire a technique, use `/technique shop`. All techniques require items and money. After you've bought a technique, you can equip it with the `/technique equip [TECHNIQUE NAME]` command and unequip it with `/unequip [TECHNIQUE NAME]`."
				})

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
			break
		}

		case "shikigami": {
			const guideEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Shikigami Guide")
				.setDescription("Here's how you can acquire Shikigami.")
				.addFields({
					name: "Shikigami",
					value: "To acquire a shikigami, you must tame one through the /tame command. They are quite difficult, so be prepared! Once you've tamed a shikigami, you can use /shikigami view to view its stats and status. Once you acquire the right shikigami, you can go on to summon Mahoraga."
				})

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
			break
		}

		case "fighting": {
			const guideEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Fighting Guide")
				.setDescription("Guide to the fight command")
				.addFields({
					name: "Fighting",
					value: "Probably the most unique thing about this bot. To start a fight, use /fight. Remember, you need techniques to fight these bosses. But have no fear, for you get a free technique when registering for the first time! It's not strong, but it'll help you in the start. Once you begin to acquire more items and cash, you can buy newer and greater techniques to rise up the ranks!"
				})

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
			break
		}
		case "awakening": {
			const guideEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Awakening Guide")
				.setDescription("Guide to awakening's")
				.addFields({
					name: "Awakening",
					value: "To awaken you must have, A MENTOR. and the required items, begin with crafting the Unknown sunstance use it then you begin the awakening process. you start out at stage one and the final is stage five, through this process some bosses will NOT be accesible til you complete this process."
				})

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
			break
		}

		case "jobs": {
			const guideEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Jobs Information")
				.setDescription("All info on jobs")

			jobs.forEach(job => {
				const jobDetails =
					`Payout: $${job.payout.min} - $${job.payout.max}\n` +
					`Cost: $${job.cost}\n` +
					`Required Experience: ${job.requiredExperience}\n` +
					`Cooldown: ${formatCooldown(job.cooldown)}`

				guideEmbed.addFields({
					name: job.name,
					value: jobDetails,
					inline: true
				})
			})

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
			break
		}

		default: {
			const guideEmbed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Jujutsu Kaisen Bot Guide")
				.setDescription(
					"Welcome to the Jujutsu Kaisen Bot! Here are some commands you can use to interact with the bot. [Very WIP]"
				)
				.addFields(
					{
						name: "Commands",
						value: "1. `/search` - Search for items!\n2. `/use` - Use an item from your inventory.\n3. `/fight` - Fight a cursed spirit.\n4. `/lookup` - Look up an item.\n5. `/achievements` - View your achievements.\n6. `/guide` - Display this guide.\n7. `/update` - View recent updates.\n8. `/support` - Get the support server link.\n9. `/claninfo` - Get information about clans.\n10. `/jujutsustats` - View your jujutsu stats."
					},
					{
						name: "Additional Information",
						value: "If you need more information on a specific topic, use `/guide [topic]` to get more details. For example, `/guide items` will provide information on items."
					}
				)

			await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
		}
	}
}

export async function handleLeaderBoardCommand(interaction) {
	try {
		const choice = interaction.options.getString("type")

		const leaderboardEmbed = new EmbedBuilder()
			.setColor("#FFA500") // Set a nice orange color
			.setTimestamp()

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
			userBalances.sort((a, b) => b.balance - a.balance)
			leaderboardEmbed
				.setTitle("💰 Wealth Leaderboard 💰")
				.setDescription("Here are the top users with the most wealth:")
			userBalances.slice(0, 10).forEach((user, index) => {
				const rank = rankEmojis[index] ? rankEmojis[index] : index + 1
				const text = `${rank} <@${user.id}> - **$${user.balance}**`
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

	const row = new ActionRowBuilder().addComponents(voteButtonTopGG, discordbotlistme, TOPGGReview)

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
		await interaction.editReply({ content: "No bosses found for your grade." })
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
			description: domainname || "🔒 Domain Not Unlocked",
			emoji: {
				name: "1564maskedgojode",
				id: "1220626413141622794"
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
					damageMultiplier: 16,
					imageUrl: "https://media1.tenor.com/m/Y5S-OJqsydUAAAAd/test.gif",
					description: "I...AM....ATOMIC",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Chiyo's Cursed Manipulation Technique") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 16,
					imageUrl: "https://i.kym-cdn.com/photos/images/original/002/031/427/6ba.gif",
					description: "I'm gonna need you to sit down and shut up.",
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
					damageMultiplier: 6,
					imageUrl: "https://media1.tenor.com/m/dzW6XIkw4VkAAAAC/hollow-purple-chapter-235.gif",
					description: "Hollow: NUKE! ",
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Prayer Song") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 4,
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
					description: "unc im sorry",
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
					description: "forgive me unc",
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
					damageMultiplier: 6,
					imageUrl:
						"https://cdn.discordapp.com/attachments/1094302755960664255/1231296159050633349/ezgif-5-4e8c15c666.gif?ex=66254d68&is=6623fbe8&hm=229aa5f92f55cb990cea75086e49ed65d89a0cff2d85a9a0a0405c35f91174b4&",
					description: `Dissect! ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques: userTechniquesFight,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Imaginary Technique: Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 3,
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
					damageMultiplier: 1,
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
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 14,
					imageUrl:
						"https://storage.googleapis.com/jjk_bot_personal/sukuna-holding-out-his-arm-in-front-of-him-engulfed-with-flames-as-he-uses-his-fire-technique-in-jujutsu-kaisen%20%5BMConverter.eu%5D.png",
					description: `Pathetic.. ${randomOpponent.name}.. I'll burn you to a crisp..`,
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
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 12,
					imageUrl: "https://storage.googleapis.com/jjk_bot_personal/GDPkQiBWkAALc51.jpg",
					description: "Purify..",
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
			}

			await updateUserFavouriteTechnique(interaction.user.id, selectedValue)

			let damageReduction = 1
			if (randomOpponent.awakeningStage === "Stage One") {
				damageReduction = 0.9
			} else if (randomOpponent.awakeningStage === "Stage Two") {
				damageReduction = 0.8
			} else if (randomOpponent.awakeningStage === "Stage Three") {
				damageReduction = 0.7
			} else if (randomOpponent.awakeningStage === "Stage Four") {
				damageReduction = 0.6
			} else if (randomOpponent.awakeningStage === "Stage Five") {
				damageReduction = 0.5
			}

			const reducedDamage = damage * damageReduction

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

			primaryEmbed.setFields(
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
				} else if (randomOpponent.name === "Sukuna Full Power") {
					transformed = await exportTheCursedOne(interaction, randomOpponent, primaryEmbed, row, playerHealth)
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
						primaryEmbed.addFields({ name: "Enemy Technique", value: bossAttackMessage }) // Add enemy's technique
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
				}
				return true
			})
			.map(clan => ({
				label: clan,
				value: clan.toLowerCase().replace(/\s+/g, "_"),
				description: `Select to view ${clan}'s techniques`
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
			} else if (i.values[0] === "curse_king_(heian_era)") {
				skillsToDisplay = CLAN_SKILLS["Curse King (Heian Era)"].filter(
					skill => !userTechniques.includes(skill.name)
				)
				embedTitle = "Curse King (Heian Era) Techniques"
				customIdPrefix = "buy_technique_"
			} else if (i.values[0] === "god_of_lightning_(heian_era)") {
				skillsToDisplay = CLAN_SKILLS["God of Lightning (Heian Era)"].filter(
					skill => !userTechniques.includes(skill.name)
				)
				embedTitle = "God of Lightning (Heian Era) Techniques"
				customIdPrefix = "buy_technique_"

				//
			} else if (i.values[0] === "demon_vessel_(awoken)") {
				skillsToDisplay = CLAN_SKILLS["Demon Vessel (Awoken)"].filter(
					skill => !userTechniques.includes(skill.name)
				)
				embedTitle = "Demon Vessel (Awoken) Techniques"
				customIdPrefix = "buy_technique_"

				//
			} else if (i.values[0] === "the_strongest") {
				skillsToDisplay = CLAN_SKILLS["The Strongest"].filter(skill => !userTechniques.includes(skill.name))
				embedTitle = "The Strongest Techniques"
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
				techniqueshopcollector.stop
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
				: (logger.info("techniqueName:", techniqueName),
				  logger.info("CLAN_SKILLS flattened:", Object.values(CLAN_SKILLS).flat()),
				  Object.values(CLAN_SKILLS)
						.flat()
						.find(skill => skill.name.toLowerCase() === techniqueName.toLowerCase()))

			//
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
		}
	})

	techniqueshopcollector.on("end", _collected => {
		techniqueshopcollector.stop()
		userCollectors.delete(userId)
	})
}
// Helper function for formatting uptime
function formatUptime(uptime: number): string {
	const totalSeconds = uptime / 1000
	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor(totalSeconds / 3600) % 24
	const minutes = Math.floor(totalSeconds / 60) % 60
	const seconds = Math.floor(totalSeconds % 60)
	return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

export function generateStatsEmbed(client: Client, nextResetTimestamp: number): EmbedBuilder {
	const uptime = formatUptime(client.uptime ?? 0)
	const apiLatency = Math.round(client.ws.ping)

	const statsEmbed = new EmbedBuilder()
		.setColor("#0099FF")
		.setTitle("🤖 Bot Stats")
		.setDescription("Current bot stats, updated every 5 minutes.")
		.addFields(
			{ name: "Uptime", value: uptime, inline: true },
			{ name: "API Latency", value: `${apiLatency}ms`, inline: true },
			{ name: "Status", value: "🟩", inline: true },
			{ name: "Next Shop Reset", value: `<t:${nextResetTimestamp}:F>`, inline: true }
		)
		.setTimestamp()
		.setFooter({ text: "Last Updated" }) // This sets the footer text

	return statsEmbed
}
export async function generateShopEmbed(): Promise<EmbedBuilder> {
	const shopItems = await getAllShopItems() // Assuming you have this function

	const lastResetTime = getShopLastReset()
	const resetIntervalMs = 1000 * 60 * 60 * 24 // Example: 24 hours in milliseconds
	const nextResetTime = new Date((await lastResetTime).getTime() + resetIntervalMs)

	const discordTimestamp = Math.floor(nextResetTime.getTime() / 1000)

	const embed = new EmbedBuilder()
		.setColor("#FFD700") // Gold color
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
	return number.toLocaleString("en-US") // Formats with commas for US locale
}

function checkWin(spinResults: string[]): boolean {
	return new Set(spinResults).size === 1 // Win if all symbols match
}

export async function handleGambleCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id

	const currentBalance = await getBalance(userId)

	const itemEffects = await getUserItemEffects(userId)
	const gamblerEffect = itemEffects.find(effect => effect.itemName === "Hakari Kinji's Token")

	const gamblersData = await getGamblersData(userId) // Assuming this function exists and returns an object containing the maxBetLimit
	const maxBetLimit = 25000000 // Default max bet limit

	const { betCount } = await getUserGambleInfo(userId)

	// Processing the gambling command
	const gameType = interaction.options.getString("game") // Assuming "game" is the option name
	const betAmount = interaction.options.getInteger("amount", true)

	// Implementing a simple bet count tracking mechanism (Consider storing and updating this in the database instead)
	const userBetCounts = {}

	if (!userBetCounts[userId]) {
		userBetCounts[userId] = 0
	}
	userBetCounts[userId]++

	// Check for the daily gamble limit
	if (betCount >= 20) {
		await interaction.reply("You've reached your daily gamble limit of 20. Please try again tomorrow.")
		return
	}

	// Check if the user has enough coins
	if (betAmount > currentBalance) {
		await interaction.reply("You don't have enough coins to make this bet.")
		return
	}

	// Check against the user's maximum bet limit
	if (betAmount > maxBetLimit) {
		await interaction.reply({
			content: `Your maximum bet limit is ${formatNumberWithCommas(maxBetLimit)} coins, Try increasing it!`,
			ephemeral: true
		})
		return
	}

	//
	//

	if (gameType === "slot") {
		//
		const betAmount = interaction.options.getInteger("amount", true)
		const userId = interaction.user.id // Identifier for the user's balance
		const currentBalance = await getBalance(userId)

		if (betAmount > currentBalance) {
			await interaction.reply("You don't have enough coins to make this bet.")
			return
		}
		userBetCounts[userId]++ // Increment the count
		await updateUserGambleInfo(userId)
		//
		const spinResults = spinSlots()
		const didWin = checkWin(spinResults)
		let resultMessage = ""
		let jackpotGIF = ""

		if (didWin) {
			const isJackpot = spinResults.every(symbol => symbol === "🍓") // Adjusted to the correct symbol
			if (isJackpot) {
				jackpotGIF = "https://media1.tenor.com/m/qz4d7FBNft4AAAAC/hakari-hakari-kinji.gif" // Set the URL for jackpot
				await updateBalance(userId, betAmount * 5) // Bigger reward for jackpot
				resultMessage = `🎉 Congratulations, you hit the Jackpot and won ${formatNumberWithCommas(
					betAmount * 2
				)} coins!`
			} else {
				await updateBalance(userId, betAmount * 2) // Reward for normal win
				resultMessage = `🎉 Congratulations, you won ${formatNumberWithCommas(betAmount * 2)} coins!`
			}
		} else {
			await updateBalance(userId, -betAmount)
			resultMessage = `😢 Better luck next time! You lost ${formatNumberWithCommas(betAmount * 2)} coins.`
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
		const didWin = Math.random() < 0.5 // 50%
		const technique = Math.random() < 0.1 // 10%
		const supatechnique = Math.random() < 0.01 // 10%

		//
		userBetCounts[userId]++
		await updateUserGambleInfo(userId)
		//
		let resultMessage = ""
		if (didWin) {
			const winnings = betAmount * 2
			// Apply the gambler bonus (if applicable)

			await updateBalance(userId, winnings)
			await updateGamblersData(userId, betAmount, winnings, 0, 0) // Update gambling stats
			resultMessage = `🪙 It landed on ${result}! You've doubled your bet and won $${formatNumberWithCommas(
				winnings
			)} coins!`
		} else {
			const losses = betAmount
			await updateBalance(userId, -losses)
			await updateGamblersData(userId, betAmount, 0, losses, 0) // Update gambling stats
			resultMessage = `🪙 It landed on ${
				result === "Heads" ? "Tails" : "Heads"
			}! You lost $${formatNumberWithCommas(losses)} coins.`
		}

		const resultEmbed = new EmbedBuilder()
			.setTitle("🪙 Coin Flip 🪙")
			.setDescription(resultMessage)
			.setColor(didWin ? "#00FF00" : "#FF0000")
			.setTimestamp()

		await interaction.reply({ embeds: [resultEmbed] })

		const userTechniques = await getUserTechniques(userId)
		//
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
const begcooldownamount = 30 * 1000 // 5 seconds in milliseconds

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

	// Update Cooldown
	begcooldown.set(userId, now)

	// Get Random Benefactor
	const chosenOne = getRandomBenefactor()

	// Result Message Construction
	let resultMessage = `You begged ${chosenOne.name}. `

	// Benefactor's Words
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

// handle sell command

export async function handleSellCommand(interaction) {
	const itemToSell = interaction.options.getString("item").toLowerCase()
	const quantity = interaction.options.getInteger("quantity") || 1

	const userInventory = await getUserInventory(interaction.user.id)
	const inventoryItem = userInventory.find(i => i.name.toLowerCase() === itemToSell)
	if (!inventoryItem) {
		return interaction.reply({ content: "You don't have that item in your inventory.", ephemeral: true })
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
	//
	collector.stop
	collector.on("end", (collected, reason) => {
		if (reason === "time") {
			interaction.editReply({ content: "Confirmation time expired. Sale cancelled.", components: [] })
		}
	})
}

function getRewardString(quest) {
	let rewards = ""
	if (quest.item) rewards += `${quest.item} (x${quest.itemQuantity})\n`
	if (quest.items) {
		Object.entries(quest.items).forEach(([itemName, quantity]) => {
			rewards += `${itemName} (x${quantity})\n`
		})
	}
	return rewards || "None" //
}
// Ban...KAI!
export async function handleQuestCommand(interaction: ChatInputCommandInteraction) {
	logger.info(questsArray)
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
		.setPlaceholder("Select a Quest")
		.addOptions(questOptions)

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

	await interaction.reply({
		content: "Select a quest to begin your adventure.",
		components: [row]
	})

	logger.info("before menu")

	const filter = i => i.customId === "select_quest" && i.user.id === interaction.user.id
	const questCollector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

	logger.info("after menu")

	questCollector.on("collect", async i => {
		if (i.isStringSelectMenu()) {
			const selectedquestname = i.values[0]
			if (activeQuestNames.includes(selectedquestname)) {
				await i.update({
					content: "You are already on this quest!",
					embeds: [],
					components: []
				})
				return
			}
			const selectedQuest = questsArray.find(quest => quest.name === selectedquestname)

			await addUserQuest(userId, selectedQuest.name)

			logger.info("before embed")
			const questEmbed = new EmbedBuilder()
				.setTitle(selectedQuest.name)
				.setDescription(selectedQuest.description)
				.setColor("#0099ff")

			if (selectedQuest.coins !== undefined && selectedQuest.coins !== null) {
				questEmbed.addFields({ name: "Coins", value: selectedQuest.coins.toString(), inline: true })
			}

			if (selectedQuest.experience !== undefined && selectedQuest.experience !== null) {
				questEmbed.addFields({ name: "EXP", value: selectedQuest.experience.toString(), inline: true })
			}

			if (selectedQuest.task !== undefined && selectedQuest.task !== null) {
				questEmbed.addFields({ name: "Task", value: selectedQuest.task, inline: false })
			}

			const rewardString = getRewardString(selectedQuest)
			if (rewardString !== undefined && rewardString !== null) {
				questEmbed.addFields({ name: "Rewards", value: rewardString, inline: false })
			}

			if (selectedQuest.tasks) {
				selectedQuest.tasks.forEach((task, index) => {
					if (
						task.description !== undefined &&
						task.description !== null &&
						task.progress !== undefined &&
						task.progress !== null &&
						task.totalProgress !== undefined &&
						task.totalProgress !== null
					) {
						questEmbed.addFields({
							name: `Task ${index + 1}`,
							value: `${task.description} (${task.progress}/${task.totalProgress})`
						})
					}
				})
			}

			await i.update({
				embeds: [questEmbed],
				components: []
			})
			logger.info("after embed")
		}
	})

	questCollector.on("end", collected => {
		if (collected.size === 0) {
			interaction.editReply({ content: "You didn't select a quest in time.", components: [] })
		}
		questCollector.stop
	})
}

export async function claimQuestsCommand(interaction) {
	try {
		await updateUserCommandsUsed(interaction.user.id)
		const userId = interaction.user.id // Get the user's ID from the interaction
		const userQuests = await getUserQuests(userId) // Fetch user quests
		if (!userQuests || !Array.isArray(userQuests.quests) || userQuests.quests.length === 0) {
			await interaction.reply("You have no active quests to claim.")
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
			await interaction.reply("You have no completed quests to claim.")
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
			await removeUserQuest(userId, completedQuest.id)
		}

		// Create the questRewards array
		const questRewards = completedQuests.map(completedQuest => {
			const questDetails = questsArray.find(quest => quest.name === completedQuest.id)
			if (!questDetails) return `**${completedQuest.id}**`

			const { coins, experience, item, itemQuantity } = questDetails
			const rewards = [
				`Coins: ${coins}`,
				`Experience: ${experience}`,
				item ? `Item: ${item} x ${itemQuantity}` : null
			]
				.filter(Boolean)
				.join("\n")

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
				.setTitle("The Fearful King")
				.setDescription("")
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
				.setDescription("")
				.setImage("https://media1.tenor.com/m/2tA56I2eTK8AAAAC/jujutsu-kaisen-shinjuku-arc-hajime-kashimo.gif")
				.addFields({
					name: "New Power",
					value: "Kashimo has taught you how to use the **Maximum Output** Transformation!"
				})

			specialEmbeds.push(curseking)
		}

		// Reply with special embeds or a generic completion message
		if (specialEmbeds.length > 0) {
			await interaction.reply({ embeds: [specialEmbeds[0]] }) // Send the first embed
			for (let i = 1; i < specialEmbeds.length; i++) {
				await interaction.followUp({ embeds: [specialEmbeds[i]] })
			}
		} else {
			const formattedRewards = questRewards
				.map(reward => {
					if (typeof reward === "object") {
						const rewardEntries = Object.entries(reward)
						return rewardEntries.map(([key, value]) => `${key}: ${value}`).join(", ")
					}
					return reward
				})
				.filter(reward => reward !== "" && reward !== null)

			const genericEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle("Quest Rewards Claimed")
				.setDescription(formattedRewards.join("\n\n"))

			await interaction.reply({ embeds: [genericEmbed] })
		}
	} catch (error) {
		logger.error("Error claiming quests:", error)
		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply({
				content: "An error occurred while claiming quests.",
				ephemeral: true
			})
		}
	}
}

// view all active quests using getuserquest
export async function viewQuestsCommand(interaction: CommandInteraction) {
	await updateUserCommandsUsed(interaction.user.id)

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
			defaultEmbed.addFields({
				name: "🎯 Task",
				value: questDetails.task,
				inline: false
			})
			defaultEmbed.addFields({
				name: "🕰️ Progress",
				value: `${questWithMostProgress.progress}/${questDetails.totalProgress}`,
				inline: false
			})
		}
	}

	await interaction.reply({ embeds: [defaultEmbed], components: [row] })

	const filter = (i: Interaction) =>
		i.isStringSelectMenu() && i.customId === "quest_menu" && i.user.id === interaction.user.id

	const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000 })

	collector?.on("collect", async i => {
		if (!i.isStringSelectMenu()) return

		const selectedValue = i.values[0]

		if (selectedValue === "personal_quests") {
			const personalQuestsEmbed = new EmbedBuilder().setColor(0x0099ff).setTitle("Personal Quests")

			if (!userQuests || !Array.isArray(userQuests.quests) || userQuests.quests.length === 0) {
				personalQuestsEmbed.setDescription("You have no active personal quests.")
			} else {
				personalQuestsEmbed.setDescription("Select a personal quest from the dropdown menu.")

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

						personalQuestsEmbed.addFields({ name: questDetails.name, value: taskList, inline: false })
					} else if (questDetails) {
						const userTask = quest.progress || 0 // Assuming quest.progress exists and is a number
						const isComplete = userTask >= questDetails.totalProgress
						const taskDescription = isComplete ? `~~${questDetails.task}~~` : questDetails.task
						const progressText = isComplete
							? `~~${userTask}/${questDetails.totalProgress}~~ ✅`
							: `${userTask}/${questDetails.totalProgress}`

						personalQuestsEmbed.addFields({
							name: questDetails.name,
							value: `**Task**: ${taskDescription}\n**Progress**: ${progressText}`,
							inline: false
						})
					}
				})
			}

			await i.update({ embeds: [personalQuestsEmbed] })
		} else if (selectedValue === "community_quests") {
			// Display community quest
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

			await i.update({ embeds: [communityQuestEmbed] })
		} else if (selectedValue === "weekly_quests") {
			const weeklyQuestsEmbed = new EmbedBuilder().setColor(0x0099ff).setTitle("Weekly Quests")
			weeklyQuestsEmbed.setDescription("Weekly quests will be available in the future.")

			await i.update({ embeds: [weeklyQuestsEmbed] })
		}
	})
}
// abandon quest with dropdown menu using getuserquest
export async function abandonQuestCommand(interaction) {
	await updateUserCommandsUsed(interaction.user.id)
	const userId = interaction.user.id
	const userQuests = await getUserQuests(userId)

	if (!userQuests || !Array.isArray(userQuests.quests) || userQuests.quests.length === 0) {
		await interaction.reply("You have no active quests to abandon.")
		return
	}

	const options = userQuests.quests.map(quest => ({
		label: quest.id,
		value: quest.id
	}))

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId("abandon_quest")
		.setPlaceholder("Select a Quest to Abandon")
		.addOptions(options)

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

	await interaction.reply({
		content: "Select a quest to abandon.",
		components: [row],
		ephemeral: true
	})

	const filter = i => i.customId === "abandon_quest" && i.user.id === interaction.user.id
	const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

	collector.on("collect", async i => {
		if (i.isStringSelectMenu()) {
			const questId = i.values[0]
			await removeUserQuest(userId, questId)
			await i.update({ content: `You have abandoned the quest: ${questId}`, components: [] })
		}
	})

	collector.on("end", collected => {
		if (collected.size === 0) {
			interaction.editReply({ content: "You didn't select a quest in time.", components: [] })
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
		if (userHealth === 300) {
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

export async function handleTradeCommand(interaction) {
	const targetUser = interaction.options.getUser("user")
	const item = interaction.options.getString("item")
	const quantity = interaction.options.getInteger("quantity")

	const initiatorInventory = await getUserInventory(interaction.user.id)
	const initiatorItem = initiatorInventory.find(i => i.name === item && i.quantity >= quantity)

	if (!initiatorItem) {
		await interaction.reply({ content: "You do not have enough of the specified item to trade.", ephemeral: true })
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

	const tradeEmbed = new EmbedBuilder()
		.setColor("Aqua")
		.setTitle("🔄 Trade Request")
		.setDescription(
			`You have received a trade request from ${interaction.user.username}. Please review the details below:`
		)
		.addFields(
			{
				name: "Trade Details",
				value: `• **User:** <@${interaction.user.id}>\n• **Item:** ${item}\n• **Quantity:** ${quantity}`,
				inline: false
			},
			// Instructions
			{
				name: "Next Steps",
				value: "• ✅ **To Accept:** Use `/acceptrade`.\n• ❌ **To Decline:** Ignore this message.",
				inline: false
			},
			{
				name: "⚠️ **IMPORTANT WARNING**",
				value:
					"Please read carefully before proceeding with the trade:\n\n" +
					"• **🔁 Trades Are Final:** Once confirmed, trades cannot be reversed. Ensure you review the trade details thoroughly.\n" +
					"• **🎁 Trading Direction:** Currently, trading involves the user **giving** you an item. This system does not allow for items to be taken from you without your consent. Always double-check who is the giver and the receiver in this transaction.\n\n" +
					"💡 **Stay Informed:** Make informed decisions to ensure a fair and secure trading experience.",
				inline: false
			}
		)
		.setFooter({ text: "Trade requests are time-sensitive and subject to item availability." })

	try {
		await targetUser.send({ embeds: [tradeEmbed] })
		await interaction.reply({ content: "Trade request sent!", ephemeral: true })
	} catch (error) {
		logger.error("Failed to send a trade request DM:", error)
		await interaction.reply({
			content: "Failed to send a trade request. The user might have DMs disabled.",
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
	const alertEmbed = new EmbedBuilder()
		.setColor("#FF0000")
		.setTitle("🚨 Alert!")
		.setDescription(
			"Sorry for all the bugs recently, been under the weather but i'm back now! Please remember to report any bugs you find in the support server!"
		)
		.setFooter({ text: "2:42AM as i write this, do people even read these?" })

	await interaction.reply({ embeds: [alertEmbed], ephemeral: true })
}

export async function handleAcceptTrade(interaction) {
	const userId = interaction.user.id
	await interaction.deferReply()

	try {
		const tradeRequests = await viewTradeRequests(userId)

		if (tradeRequests.length === 0) {
			await interaction.followUp({ content: "You have no pending trade requests.", ephemeral: true })
			return
		}

		const options = tradeRequests.map(request => {
			return {
				label: request.item,
				description: `From: ${request.initiatorId} (Qty: ${request.quantity})`, // Replace ID with usernames if possible
				value: request._id.toString()
			}
		})

		const selectMenu = new SelectMenuBuilder()
			.setCustomId("accept_trade_select_") // Modified line
			.setPlaceholder("Select a trade request to accept")
			.addOptions(options)

		const actionRow = new ActionRowBuilder().addComponents(selectMenu)

		return interaction.followUp({
			content: "Choose a trade request to accept:",
			components: [actionRow],
			ephemeral: true
		})
	} catch (error) {
		logger.error("Error in handleAcceptTrade:", error)
		return interaction.followUp({
			content: "An error occurred while trying to process trade requests.",
			ephemeral: true
		})
	}
}
export async function processTradeSelection(interaction) {
	const selectedTradeId = interaction.values[0]

	try {
		await handleTradeAcceptance(selectedTradeId, interaction.user.id)
		logger.info("Trade request accepted successfully!")
		await interaction.followUp({
			content: "Trade request accepted successfully!",
			components: []
		})
		return
	} catch (error) {
		logger.error("Error handling trade acceptance:", error)
		logger.info("An error occurred while trying to accept the trade request.")
		await interaction.followUp({
			content: "Confirmed.",
			components: []
		})
		return
	}
}

// view trade command, it has a selectmenu with two options. active trades and previous trades active trades shows all current pending and outgoing trades and previous trades shows all completed trades
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
	await updateBalance(targetUser.id, amount)

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

		return await interaction.reply(response.trim())
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
	await updateUserCommandsUsed(interaction.user.id)

	const techniqueNamesInput = interaction.options.getString("techniques")

	if (!techniqueNamesInput) {
		return await interaction.reply({
			content: "Please provide a comma-separated list of technique names.",
			ephemeral: true
		})
	}

	// Process the list
	const techniqueNames = techniqueNamesInput.split(",").map(name => name.trim())

	try {
		let activeTechniques = await getUserActiveTechniques(userId)
		activeTechniques = Array.isArray(activeTechniques)
			? activeTechniques.filter(name => name != null).map(name => name.trim())
			: []

		const unequippedTechniques = []
		const activeTechniquesLowercaseMap = new Map(activeTechniques.map(name => [name.toLowerCase(), name]))

		for (const techniqueName of techniqueNames) {
			const techniqueNameLowercase = techniqueName.toLowerCase()
			if (!activeTechniquesLowercaseMap.has(techniqueNameLowercase)) {
				return await interaction.reply({
					content: `The technique "${techniqueName}" is not currently equipped.`,
					ephemeral: true
				})
			}

			activeTechniques = activeTechniques.filter(technique => technique.toLowerCase() !== techniqueNameLowercase)
			unequippedTechniques.push(activeTechniquesLowercaseMap.get(techniqueNameLowercase))
		}

		await updateUserActiveTechniques(userId, activeTechniques)
		await interaction.reply(`Technique(s) '${unequippedTechniques.join(", ")}' unequipped!`)
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

export async function handleUnequipQuestCommand(interaction) {
	const userId = interaction.user.id
	const userQuests = await getUserQuests(userId)

	if (!userQuests || !Array.isArray(userQuests.quests) || userQuests.quests.length === 0) {
		await interaction.reply("You have no active quests to unequip.")
		return
	}

	const options = userQuests.quests.map(quest => ({
		label: quest.id,
		value: quest.id
	}))

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId("unequip_quest")
		.setPlaceholder("Select a Quest to Unequip")
		.addOptions(options)

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

	await interaction.reply({
		content: "Select a quest to unequip.",
		components: [row],
		ephemeral: true
	})

	const filter = i => i.customId === "unequip_quest" && i.user.id === interaction.user.id
	const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

	collector.on("collect", async i => {
		if (i.isStringSelectMenu()) {
			const questId = i.values[0]
			await removeUserQuest(userId, questId)
			await i.update({ content: `You have unequipped the quest: ${questId}`, components: [] })
		}
	})

	collector.on("end", collected => {
		if (collected.size === 0) {
			interaction.editReply({ content: "You didn't select a quest in time.", components: [] })
		}
		collector.stop()
	})
}

export async function handleEquipTransformationCommand(interaction: ChatInputCommandInteraction) {
	try {
		const unlockedTransformations = await getUserUnlockedTransformations(interaction.user.id)
		await updateUserCommandsUsed(interaction.user.id)

		const currentTransformation = await getUserTransformation(interaction.user.id)
		const availableTransformations = unlockedTransformations.filter(transformationName => {
			return transformationName && transformationName.trim() !== currentTransformation
		})

		const selectMenu = createTransformationSelectMenu(availableTransformations)
		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

		await interaction.reply({
			content: "Choose a transformation to equip:",
			components: [row]
		})

		const selectMenuInteraction = await interaction.channel.awaitMessageComponent({
			filter: i => i.user.id === interaction.user.id && i.isStringSelectMenu(),
			time: 60000
		})

		const selectedTransformationName = (selectMenuInteraction as StringSelectMenuInteraction).values[0]
		await updateUserTransformation(interaction.user.id, selectedTransformationName)

		await selectMenuInteraction.update({
			content: `You have equipped ${selectedTransformationName}!`,
			components: []
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
				label: transformationName.substring(0, 100),
				value: transformationName.substring(0, 100)
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
	const balance = await getBalance(interaction.user.id)
	const balance2 = balance.toLocaleString("en-US")

	if (!shopItems || shopItems.length === 0) {
		await interaction.reply("The shop is currently empty.")
		return
	}

	try {
		const lastResetTime = await getShopLastReset()
		const resetIntervalMs = 1000 * 60 * 60 * 24
		const nextResetTime = new Date(lastResetTime.getTime() + resetIntervalMs)

		const discordTimestamp = Math.floor(nextResetTime.getTime() / 1000)

		const embed = new EmbedBuilder()
			.setColor("#FFD700") // Gold color
			.setTitle("✨ Shop Items ✨")
			.setDescription(`\n💰 Your balance: **${balance2}**\nCheck out these limited-time offers:`)
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

		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 }) // Adjust time as needed

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

			// Retrieve user's purchase history
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

// equip inate clan use getuserownedinateclan
export async function handleEquipInateClanCommand(interaction) {
	await updateUserCommandsUsed(interaction.user.id)
	const userId = interaction.user.id
	const clanName = interaction.options.getString("clan")

	const userClans = await getUserOwnedInateClan(userId)
	if (!userClans.includes(clanName)) {
		await interaction.reply({ content: "You do not own this clan.", ephemeral: true })
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

	// Get the chosen shikigami name from the user input
	const chosenShikigamiName = interaction.options.getString("shikigami")

	// Check if the chosen shikigami is Mahoraga
	const isMahoraga = chosenShikigamiName === "Mahoraga"

	if (isMahoraga) {
		// Fetch the user's shikigami
		const userShikigami: { name: string }[] = await getUserShikigami(interaction.user.id)

		// Check if the user has the required shikigami to summon Mahoraga

		const requiredShikigami = ["Divine Dogs", "Nue", "Toad", "Max Elephant"]
		const hasRequiredShikigami = requiredShikigami.every(shikigamiName => {
			return userShikigami && userShikigami.some(shikigami => shikigami.name === shikigamiName)
		})

		if (!hasRequiredShikigami) {
			const userShikigamiValue = userShikigami
				? userShikigami.map(shikigami => shikigami.name).join(", ")
				: "None"

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

	// Check if the user is lucky enough to get a Divine-General Mahoraga
	if (chosenShikigami.name === "Mahoraga" && randomChance < divineGeneralChance) {
		// User got a Divine-General Mahoraga
		chosenShikigami.name = "Divine-General Mahoraga"
		chosenShikigami.current_health = 650
		chosenShikigami.max_health = 650
		chosenShikigami.grade = "Unknown...?"
		chosenShikigami.image_url = "https://media1.tenor.com/m/T7rdnze2j8oAAAAd/gojo-mahoraga.gif"
	}

	// Use the chosenShikigami as the opponent
	const randomOpponent = chosenShikigami

	const cursedEnergyPurple = parseInt("#8A2BE2".replace("#", ""), 16) // Convert hex string to number
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
			} else if (selectedValue === "Genki Dama") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 12,
					imageUrl: "https://media1.tenor.com/m/8Ltt65SLeFUAAAAC/genki-dama-spirit-bomb.gif",
					description: "PLEASE LEND ME SOME OF YOUR ENERRGY!",
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
					damageMultiplier: 6,
					imageUrl: "https://media1.tenor.com/m/dzW6XIkw4VkAAAAC/hollow-purple-chapter-235.gif",
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

		const shikigamiOptions = userShikigami.map(shikigami => ({
			label: shikigami.name,
			value: shikigami.name,
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

		const selectedShikigami = userShikigami.find(shikigami => shikigami.name === selectionInteraction.values[0])

		const shikigamiEmbed = createShikigamiEmbed(selectedShikigami)

		const actionButtons = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId("feed_shikigami").setLabel("Feed").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("clean_shikigami").setLabel("Clean").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("play_shikigami").setLabel("Play").setStyle(ButtonStyle.Primary),
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
				const selectedShikigami = userShikigami.find(
					shikigami => shikigami.name === buttonInteraction.values[0]
				)

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

async function getBufferFromAttachment(attachment: Attachment): Promise<Buffer> {
	const url = attachment.url
	const response = await fetch(url)
	const arrayBuffer = await response.arrayBuffer()
	return Buffer.from(arrayBuffer)
}

export async function handleUpdateProfileImageCommand(interaction: ChatInputCommandInteraction) {
	const userid = interaction.user.id

	await interaction.deferReply({ ephemeral: true })

	const cooldownStatus = await checkProfileChangeCooldown(userid)

	if (cooldownStatus.limitReached) {
		await interaction.followUp({
			content: `Oops! You've hit the limit for profile updates. You can change your profile image again at <t:${cooldownStatus.nextResetTimestamp}:R>.`,
			ephemeral: true
		})
		return
	} else {
		const subcommand = interaction.options.getSubcommand()
		const imageAttachment = interaction.options.getAttachment("image", true)

		if (!imageAttachment || !imageAttachment.contentType?.startsWith("image/")) {
			await interaction.editReply({ content: "Please provide a valid image." })
			return
		}

		const imageBuffer = await getBufferFromAttachment(imageAttachment)
		const fileName = `${userid}_${subcommand}_${Date.now()}.${imageAttachment.contentType?.split("/")[1]}`
		const contentType = imageAttachment.contentType ?? ""
		const imageUrl = await uploadImageToGoogleStorage(imageBuffer, fileName, contentType)

		await updateUserCooldowns(userid, "profileChange")
		await logImageUrl(imageUrl, userid)
		const { isSafe, requiresManualReview } = await checkImageForNSFW(imageUrl)

		if (isSafe) {
			try {
				if (subcommand === "avatar") {
					await updateUserProfileImage(userid, imageUrl)
				} else if (subcommand === "header") {
					await updateUserProfileHeader(userid, imageUrl)
				}

				await interaction.followUp(`Profile ${subcommand} updated successfully!`)
			} catch (error) {
				await interaction.followUp(`Failed to update profile ${subcommand}.`)
			}
		} else {
			if (requiresManualReview) {
				await sendForManualReview(imageUrl, interaction, subcommand)
				await interaction.followUp({
					ephemeral: true,
					content: `Your ${subcommand} image has been sent for manual review. We will notify you once the review is completed, Please note this process may take awhile!`
				})
			} else {
				await interaction.followUp({
					ephemeral: true,
					content: `**Warning:** Our image moderation system has detected potentially sensitive or explicit content in this ${subcommand} image. Please try again with a different image. If you believe this is a mistake, please open a support ticket.`
				})
			}
		}
	}
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

		const { message, imageUrl, line } = getMentorDetails(mentor, hasAwakening)

		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Mentor Details")
			.setDescription(`${message}`)
			.addFields([
				{ name: `**${mentor} says:**`, value: `${line}`, inline: true },
				{ name: "Mentor", value: mentor, inline: true },
				{ name: "Your Awakening", value: hasAwakening ? `${awakening}` : "Not Awakened", inline: true }
			])

		if (imageUrl) {
			embed.setImage(imageUrl)
		}

		if (hasAwakening && !(await checkStageMessaged(userId, `${awakening}`))) {
			const awakeningDialogue = getAwakeningDialogue(mentor, awakening)
			embed.addFields({ name: "Awakening Insight", value: awakeningDialogue })
			await addUserQuest(userId, "Awakening")
			await addItemToUserInventory(userId, "Heian Era Scraps", 8)
			await markStageAsMessaged(userId, `${awakening}`)
			if (awakening === "Stage Three") {
				const questName = "Stage Three Unleashed"

				try {
					await addUserQuest(userId, questName)
					embed.addFields({
						name: "New Quest",
						value: `You have unlocked a special quest for reaching Stage Three: ${questName}`
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
			//
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
