/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
/* eslint-disable prettier/prettier */
let contextKey: string
import { SelectMenuBuilder } from "@discordjs/builders"
import {
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
	InteractionResponse,
	SelectMenuInteraction,
	StringSelectMenuBuilder
} from "discord.js"
import {
	DOMAIN_INFORMATION,
	applyAdaption,
	applyPrayerSongEffect,
	applyStatusEffect,
	applyWorldCuttingSlash,
	attacks,
	calculateDamageWithEffects,
	fetchAndFormatStatusEffects
} from "./attacks.js"
import { digCooldown, digCooldownBypassIDs, digCooldowns } from "./bot.js"
import {
	calculateDamage,
	calculateEarnings,
	createInventoryPage,
	getRandomAmount,
	getRandomLocation
} from "./calculate.js"
import {
	executeSpecialTechnique,
	exportCrashOut,
	exportGambler,
	exportReincarnation,
	exportRika,
	exportTheCursedOne,
	exportTheFraud,
	exportTheHonoredOne,
	generateHealthBar,
	getJujutsuFlavorText,
	handleBossDeath
} from "./fight.js"
import { BossData, buildGamblersProfile, buildQuestEmbed, formatDomainExpansion, gradeMappings } from "./interface.js"
import {
	CLAN_SKILLS,
	DOMAIN_EXPANSIONS,
	INVENTORY_CLAN,
	allAchievements,
	benefactors,
	craftingRecipes,
	dailyitems,
	getRandomItem,
	heavenlyrestrictionskills,
	items,
	items1,
	jobs,
	lookupItems,
	questsArray
} from "./items jobs.js"
import {
	addItemToUserInventory,
	addUser,
	addUserQuest,
	addUserTechnique,
	checkUserHasHeavenlyRestriction,
	createTradeRequest,
	getActiveTrades,
	getAllUserExperience,
	getAllUsersBalance,
	getBalance,
	getBosses,
	getPreviousTrades,
	getUserAchievements,
	getUserActiveHeavenlyTechniques,
	getUserActiveTechniques,
	getUserClan,
	getUserCursedEnergy,
	getUserDailyData,
	getUserDomain,
	getUserGambleInfo,
	getUserGrade,
	getUserHealth,
	getUserInventory,
	getUserMaxHealth,
	getUserProfile,
	getUserQuests,
	getUserStatusEffects,
	getUserTechniques,
	getUserUnlockedBosses,
	getUserUnlockedTitles,
	getUserWorkCooldown,
	handleTradeAcceptance,
	removeAllStatusEffects,
	removeItemFromUserInventory,
	removeUserQuest,
	updateBalance,
	updateGamblersData,
	updatePlayerGrade,
	updateUserAchievements,
	updateUserActiveTechniques,
	updateUserCooldown,
	updateUserDailyData,
	updateUserDomainExpansion,
	updateUserExperience,
	updateUserGambleInfo,
	updateUserHealth,
	updateUserHeavenlyTechniques,
	updateUserJob,
	updateUserTitle,
	userExists,
	viewTradeRequests
} from "./mongodb.js"

const domainActivationState = new Map()
const bossHealthMap = new Map() // Create a Map to store boss health per user

export const searchCooldowns = new Map()
export const searchCooldown = 60 * 1000
export const searchCooldownBypassIDs = [""] // IDs that can bypass cooldown
//

export async function handleRegisterCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	try {
		const discordId = interaction.user.id

		// Check if the user already exists before trying to register them
		if (await userExists(discordId)) {
			await interaction.reply({
				content: "It looks like you're already registered!",
				ephemeral: true
			})
			return
		}

		const result = await addUser(discordId)

		if (result && "insertedId" in result) {
			const imageURL = "https://wikiofnerds.com/wp-content/uploads/2023/10/jujutsu-kaisen-.jpg"
			const welcomeEmbed = new EmbedBuilder()
				.setColor(0x5d2e8c)
				.setTitle("Jujutsu Registration Complete!")
				.setDescription(`Welcome, ${interaction.user.toString()}! Your Jujutsu journey begins.`)
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
		console.error("Error registering user:", error)
		await interaction.reply({
			content: "There was an error while trying to register you.",
			ephemeral: true
		})
	}
}

export async function handleBalanceCommand(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser("user") || interaction.user
	await interaction.deferReply()

	const balance = await getBalance(targetUser.id)

	const cursedCoins = balance.toLocaleString("en-US") // Adjust 'en-US' as needed for your locale

	const balanceEmbed = new EmbedBuilder()
		.setColor(0xa00000) // A deep red for a mystical, cursed energy vibe
		.setTitle(`${targetUser.username}'s Cursed Wallet`)
		.setThumbnail(targetUser.displayAvatarURL())
		.addFields({ name: "Cursed Wallet", value: `${cursedCoins} `, inline: false })
		.setFooter({ text: "Spend wisely. Every decision shapes your destiny." })
		.setTimestamp()

	await interaction.editReply({ embeds: [balanceEmbed] })
}

export async function handleProfileCommand(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser("user") || interaction.user

	const createProfileEmbed = async user => {
		const userProfile = await getUserProfile(user.id)
		if (!userProfile) throw new Error("Profile not found.")

		const hasHeavenlyRestriction = !!userProfile.heavenlyrestriction

		let domainExpansionValue
		if (hasHeavenlyRestriction) {
			domainExpansionValue = "Not applicable due to Heavenly Restriction"
		} else {
			domainExpansionValue = formatDomainExpansion(userProfile.domain)
		}

		return new EmbedBuilder()
			.setColor(0x1f6b4e)
			.setTitle(`Jujutsu Profile: ${targetUser.username} 🌀`)
			.setThumbnail(targetUser.displayAvatarURL())
			.addFields(
				{ name: "**Clan** 🏆", value: userProfile.clan || "None", inline: false },
				{ name: "**Title** 🏆", value: userProfile.activeTitle || "None", inline: false },
				{ name: "**Balance** 💰", value: `\`${userProfile.balance.toLocaleString()}\``, inline: false },
				{ name: "**Experience** ✨", value: userProfile.experience.toLocaleString(), inline: false },
				{ name: "**Sorcerer Rank** 🏅", value: userProfile.grade || "Unranked", inline: false },
				{ name: "**Job** 💼", value: userProfile.job || "None", inline: false },
				{ name: "**Domain Expansion** 🌀", value: domainExpansionValue, inline: false },
				{ name: "**Heavenly Restriction** ⛔", value: hasHeavenlyRestriction ? "Yes" : "No", inline: false }
			)

			.setFooter({
				text: "Harness your cursed energy. Update your profile to reflect your growth in the Jujutsu world."
			})
	}

	try {
		const profileEmbed = await createProfileEmbed(targetUser)
		await interaction.reply({ embeds: [profileEmbed] })
	} catch (error) {
		console.error("Error handling profile command:", error)
		await interaction.reply({ content: "There was an error retrieving your profile.", ephemeral: true })
	}
}

export async function handleInventoryCommand(interaction) {
	await interaction.deferReply()

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

	const currentTime = Date.now()
	const authorId = interaction.user.id
	const timestamp = digCooldowns.get(authorId)

	if (timestamp) {
		const expirationTime = timestamp + digCooldown
		if (currentTime < expirationTime && !digCooldownBypassIDs.includes(authorId)) {
			// User is on cooldown, send a themed message
			const digCooldownEmbed = new EmbedBuilder()
				.setColor(0x4b0082) // Red color for alert
				.setTitle("Energy Recharge Needed")
				.setTimestamp()
				.setDescription(
					`You've recently tapped into your energy. Please wait a bit before your next dig <t:${Math.floor(
						expirationTime / 1000
					)}:R>.`
				)
			await interaction.editReply({ embeds: [digCooldownEmbed] })
			return
		}
	}

	digCooldowns.set(authorId, currentTime)

	const itemDiscoveryChance = 0.7 // 50% chance to discover an item
	const doesDiscoverItem = Math.random() < itemDiscoveryChance

	const coinsFound = Math.floor(Math.random() * 20000) + 1
	await updateBalance(interaction.user.id, coinsFound)

	if (doesDiscoverItem) {
		const itemFound = getRandomItem()
		if (itemFound) {
			await addItemToUserInventory(authorId, itemFound.name, 1)
			const digEmbed = new EmbedBuilder()
				.setColor(0x00ff00) // Success color
				.setTitle("Digging Results")
				.setDescription(`You unearthed \`⌬${coinsFound}\` coins! **You also found a ${itemFound.name}!**`)
				.setTimestamp()
			await interaction.editReply({ embeds: [digEmbed] })
		} else {
			const digEmbed = new EmbedBuilder()
				.setColor(0x00ff00) // Success color
				.setTitle("Digging Results")
				.setDescription(`You unearthed \`⌬${coinsFound}\` coins but didn't find any items this time.`)
				.setTimestamp()
			await interaction.editReply({ embeds: [digEmbed] })
		}
	} else {
		const digEmbed = new EmbedBuilder()
			.setColor(0x00ff00) // Success color
			.setTitle("Digging Results")
			.setDescription(`You unearthed \`⌬${coinsFound}\` coins but didn't find any items this time.`)
			.setTimestamp()
		await interaction.editReply({ embeds: [digEmbed] })
	}
}

export async function handleJobSelection(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) return

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

export async function handleWorkCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	const userId = interaction.user.id
	const userProfile = await getUserProfile(userId)
	const currentJobName = userProfile.job || "Student"
	const currentJob = jobs.find(job => job.name === currentJobName)

	if (!currentJob) {
		await interaction.reply({ content: "Error: Invalid job specified.", ephemeral: true })
		return
	}

	const currentTime = Date.now()

	try {
		const lastWorkTime = await getUserWorkCooldown(userId)

		if (currentTime - lastWorkTime < currentJob.cooldown) {
			const endCooldownTime = Math.floor((lastWorkTime + currentJob.cooldown) / 1000)
			await interaction.reply({
				content: `You're too tired to work as a ${currentJobName} right now. You can work again <t:${endCooldownTime}:R>.`,
				ephemeral: true
			})
			return
		}

		// If the cooldown has passed, continue with work command logic...
		const earnings = calculateEarnings(userProfile)
		const experienceGain = getRandomAmount(20, 50)

		// Update user data
		await updateBalance(userId, earnings)
		await updateUserExperience(userId, experienceGain)
		await updatePlayerGrade(userId)

		// Update the work cooldown (using 'work' as the jobType)
		await updateUserCooldown(userId, "work", currentTime)

		// Reply with the earnings
		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle("Work Completed")
			.setDescription(`You worked hard as a ${currentJobName} and earned **${earnings}** coins!`)
			.setTimestamp()

		await interaction.reply({ embeds: [embed] })
	} catch (error) {
		console.error("Failed to process work command:", error)
		await interaction.reply({
			content: "An error occurred while trying to work. Please try again later.",
			ephemeral: true
		})
	}
}
export async function handleDailyCommand(interaction: ChatInputCommandInteraction): Promise<void> {
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
}

export async function handleCraftCommand(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
	const selectedItem = interaction.options.getString("item")
	const quantity = interaction.options.getInteger("quantity") || 1 // Default to 1 if not provided

	try {
		const userInventory = await getUserInventory(interaction.user.id)
		const selectedItemRecipe = craftingRecipes[selectedItem.replace(" ", "_").toLowerCase()] // Adjust as necessary for key naming conventions

		if (!selectedItemRecipe) {
			await interaction.reply({ content: "Invalid item selected.", ephemeral: true })
			return
		}

		const missingItems = selectedItemRecipe.requiredItems.filter(requiredItem => {
			const inventoryItem = userInventory.find(invItem => invItem.name === requiredItem.name)
			return !inventoryItem || inventoryItem.quantity < requiredItem.quantity
		})

		if (missingItems.length > 0) {
			// Construct a message listing all missing items
			const missingItemsMessage = missingItems.map(item => `${item.quantity}x ${item.name}`).join(", ")
			await interaction.reply(`You do not have enough of the following items: ${missingItemsMessage}`)
			return
		}

		const craftEmbed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle(`Crafting ${selectedItem.replace("_", " ")}`)
			.setDescription(`Do you want to craft **${selectedItem.replace("_", " ")}**?`)
			.addFields(
				selectedItemRecipe.requiredItems.map(item => ({
					name: item.name,
					value: `Quantity: ${item.quantity}`,
					inline: true
				}))
			)
			.setTimestamp()
			.setFooter({ text: "Make sure you have all the required items before crafting!" })

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

		// Send the embed with buttons
		await interaction.reply({ embeds: [craftEmbed], components: [row] })

		// ... (create collector and handle button interactions as previously shown)
		// Create a collector and filter to listen for button interaction
		const filter = (i: { customId: string; user: { id: string } }) =>
			["confirmCraft", "cancelCraft"].includes(i.customId) && i.user.id === interaction.user.id
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 }) // Adjust time as needed (60000ms = 60s)

		collector.on("collect", async buttonInteraction => {
			if (!buttonInteraction.deferred) await buttonInteraction.deferUpdate()

			if (buttonInteraction.customId === "confirmCraft") {
				try {
					console.log("Starting item removal for ITEM!")

					for (const requiredItem of selectedItemRecipe.requiredItems) {
						console.log("Removing item:", requiredItem)
						await removeItemFromUserInventory(interaction.user.id, requiredItem.name, requiredItem.quantity)
						console.log("Item removed!")
					}
					await addItemToUserInventory(interaction.user.id, selectedItemRecipe.craftedItemName, 1)
					console.log("Item added! ", selectedItemRecipe.craftedItemName)

					// Confirm to the user that the crafting was successful
					await buttonInteraction.editReply({
						content: `You have successfully crafted ${selectedItem.replace("_", " ")}!`,
						components: []
					})
				} catch (error) {
					console.error("Error during crafting:", error)
					// Inform the user about the error in a generic way
					await buttonInteraction.editReply({
						content: "There was an error during the crafting process. Please try again.",
						components: []
					})
				}
			} else if (buttonInteraction.customId === "cancelCraft") {
				// If they clicked cancel, let them know the crafting was canceled
				await buttonInteraction.editReply({ content: "Crafting canceled.", components: [] })
			}

			collector.on("end", () => {
				// Disable the buttons after interaction
				confirmButton.setDisabled(true)
				cancelButton.setDisabled(true)
				interaction.editReply({
					components: [new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton)]
				})
			})

			collector.stop()
		})
	} catch (error) {
		console.error("Error in crafting or inventory process:", error)
		await interaction.reply({ content: "There was an error while processing your request.", ephemeral: true })
	}
}

export async function handleTitleSelectCommand(interaction: ChatInputCommandInteraction) {
	console.log("Title selection command received.")

	const unlockedTitles = await getUserUnlockedTitles(interaction.user.id)

	const embed = new EmbedBuilder()
		.setTitle("Select Your Title")
		.setDescription("Choose a title from the dropdown menu below.")

	// Create the dropdown menu
	const selectMenu = new SelectMenuBuilder()
		.setCustomId("title_selection")
		.setPlaceholder("No title selected")
		.addOptions(
			unlockedTitles.map(titleName => ({
				label: titleName, // Assuming titles is an array of title names
				description: titleName, // You'll need this
				value: titleName
			}))
		)

	const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu)
	await interaction.reply({ embeds: [embed], components: [row] })

	// Handle title selection
	const filter = i => i.customId === "title_selection"

	const collector = interaction.channel.createMessageComponentCollector({
		filter,
		componentType: ComponentType.StringSelect,
		time: 20000 // 20 seconds
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
				content:
					"There was an error updating your title. [ THIS ERROR IS BEING FIXED OR DOES NOT ACTUALLY ERROR]",
				embeds: [],
				components: []
			})
			console.error(error)
		}

		collector.on("end", collected => {
			if (collected.size === 0) {
				interaction.followUp({ content: "You did not select a title.", components: [] }).catch(console.error)
			}
		})

		//collector.stop()
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
		if (collectedInteraction.isSelectMenu() && collectedInteraction.customId === "select-domain") {
			const selectedDomainName = collectedInteraction.values[0]

			// Find Domain Information
			const selectedDomain = DOMAIN_INFORMATION.find(domain => domain.name === selectedDomainName)

			if (!selectedDomain) {
				console.error("Domain not found:", selectedDomainName)
				await collectedInteraction.followUp({
					embeds: [
						new EmbedBuilder().setTitle("Error").setDescription("Domain information could not be found.")
					],
					components: []
				})
				return
			}

			// Create the updated embed with information
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
				console.error("Domain not found:", selectedDomainName)
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
					console.error("Error during domain purchase:", error)
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
		console.log(`Collected ${collected.size} items`)
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
	console.log(`Received search command from ${interaction.user.tag}.`)
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
		console.log(`Button clicked by ${inter.user.tag}: ${inter.customId}`)
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
				console.log(`Cursed spirit encountered. Attempting to respond to ${interaction.user.tag}.`)

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
			console.log(`Search count for ${inter.user.tag}: ${theirSearchCount}`)

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
					console.log(`Collected ${collected.size} items`)
				})
			}
		} else if (inter.customId === "end_search") {
			console.log(`End search button clicked by ${inter.user.tag}`)

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
		console.log(`Collected ${collected.size} items`)
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
	const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 }) // Collector for 2 minutes

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
			version: "Update 3.5", // Replace with your actual version number
			date: "07-04-24", // Adjust the date as needed
			changes: [
				{
					name: "**Fight Command [ SEMI REWORK ]**",
					value: "Reworked domains, added new techniques, and Added **Status Effects** Currently only domains and some skills apply these."
				},
				{
					name: "New Boss System",
					value: "Now you can unlock certain bosses when you use an item, So if you use **Special-Grade Geo Locator** It unlocks yuta boss, And if you do the disaster curses quest line you can fight them."
				},
				{
					name: "Quest And Technique Commands",
					value: "Reworked these commands to be more user friendly and added more information."
				},
				{
					name: "New Techniques",
					value: "New Secret Skills. Get them with useitem - Sacred Eye, "
				},
				{
					name: "Grade System Rework",
					value: "Bosses scale with your grade, Readded boss transformation and awakenings."
				},
				{
					name: "Bug Fixes",
					value: "Interaction failed, and some other bugs fixed. < HP Bug has not been fixed yet so ive removed it for now. >"
				},
				{
					name: "Found a bug? Report it!",
					value: "If you've found any bugs or issues, please report them in the support server. > /support <"
				},
				{
					name: "**IF YOU LOSE ANY ITEMS DURING TRADES**",
					value: "Please report it to the support server. We can help you get your items back."
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

	// Add each change as a field in the embed
	recentUpdates[0].changes.forEach(change => {
		updateEmbed.addFields({ name: change.name, value: change.value })
	})

	// Reply to the interaction with the update information
	await interaction.reply({ embeds: [updateEmbed], ephemeral: true })
}

// quick reply command with support server no embed needed ephemeral
export async function handleSupportCommand(interaction: ChatInputCommandInteraction) {
	await interaction.reply({ content: "https://discord.gg/wmVyBpqWgs", ephemeral: true })
}

export async function handleLookupCommand(interaction) {
	const itemName = interaction.options.getString("name").toLowerCase().replace(/\s+/g, "_")

	// Find the item using the transformed input.
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

// Function to find a technique's clan
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
	return "" // Or "Unknown" if you prefer
}

// Simplify technique names (assuming this function already exists in your code)
function simplifyTechniqueName(fullName: string): string {
	const nameMap = {
		"Ten Shadows Technique: Eight-Handled Sword Divergent Sila Divine General Mahoraga": "Divine General Mahoraga"
		// Add other simplifications as needed
	}
	return nameMap[fullName] || fullName
}

export async function handleJujutsuStatsCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id

	try {
		const userClan = await getUserClan(userId)
		const userHeavenlyRestriction = await checkUserHasHeavenlyRestriction(userId)
		const userEnergy = await getUserCursedEnergy(userId)
		let userTechniques: string[] = await (userHeavenlyRestriction
			? getUserActiveHeavenlyTechniques(userId)
			: getUserActiveTechniques(userId))
		const userDomain = await getUserDomain(userId)
		const userMaxHealth = await getUserMaxHealth(userId)
		// Ensure userTechniques is an array
		userTechniques = Array.isArray(userTechniques) ? userTechniques : []

		// Enrich techniques with clan information
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

		// Sort clans and techniques alphabetically and create the display string
		let techniquesDisplay = Object.keys(techniquesByClan)
			.sort()
			.map(clan => {
				const techniques = techniquesByClan[clan]
					.sort()
					.map(technique => `> • ${simplifyTechniqueName(technique)}`) // Using block quote for indentation
				return `**${clan}**\n${techniques.join("\n")}` // Clan name in bold
			})
			.join("\n\n")

		// Add domain expansion if present at the top
		if (userDomain && userDomain !== "None") {
			techniquesDisplay = `**Domain Expansion: ${userDomain}**\n\n` + techniquesDisplay // Domain name in bold
		}

		// Construct the embed
		const embed = new EmbedBuilder()
			.setTitle(`${interaction.user.username}'s Jujutsu Profile`)
			.setColor("#4B0082")
			.setDescription("Dive into the depth of your Jujutsu prowess. Here are your current stats, sorcerer.")
			.addFields(
				{ name: "💓 Health", value: userMaxHealth.toString(), inline: true },
				{ name: "🔥 Clan", value: userClan || "None", inline: true },

				{
					name: "🤫 Cursed Energy",
					value: `${userEnergy.toString()} units ${userEnergy > 1000 ? "🔥" : ""}`,
					inline: true
				},

				{
					name: "⚖️ Heavenly Restriction",
					value: userHeavenlyRestriction ? "Active" : "Inactive",
					inline: true
				},
				{ name: "🌀 Techniques & Domain Expansion", value: techniquesDisplay, inline: false }
			)

		const selectMenu = new StringSelectMenuBuilder() // Note: StringSelectMenuBuilder
			.setCustomId("selectMenu")
			.setPlaceholder("Select an option")
			.addOptions([
				{
					label: "Main Profile",
					description: "View your main profile",
					value: "mainProfile",
					default: true
				},
				{
					label: "Active Quests",
					description: "View your active quests",
					value: "activeQuests"
				},
				{
					label: "Gamblers Profile",
					description: "View your gambling data!",
					value: "gamblerProfile"
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
				} else if (selectedOption === "activeQuests") {
					const questEmbed = await buildQuestEmbed(userId, interaction)
					await i.update({ embeds: [questEmbed] }) // Display the main profile embed
				} else if (selectedOption === "gamblerProfile") {
					const gamblerEmbed = await buildGamblersProfile(userId, interaction)
					await i.update({ embeds: [gamblerEmbed] })
				}
			}
		})
		collector.stop
	} catch (error) {
		console.error("Error handling JujutsuStatsCommand:", error)
		await interaction.reply({
			content: "An unexpected error occurred while retrieving your Jujutsu profile. Please try again later.",
			ephemeral: true
		})
	}
}

function formatCooldown(cooldown) {
	const seconds = Math.floor((cooldown / 1000) % 60)
	const minutes = Math.floor((cooldown / (1000 * 60)) % 60)
	const hours = Math.floor((cooldown / (1000 * 60 * 60)) % 24)

	return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m " : ""}${seconds > 0 ? seconds + "s" : ""}`
}

// guide command
export async function handleGuideCommand(interaction) {
	const topic = interaction.options.getString("topic")

	const guideEmbed = new EmbedBuilder().setColor("#0099ff")

	switch (topic) {
		case "crafting":
			guideEmbed
				.setTitle("Crafting Guide")
				.setDescription("Here's how you can craft items in the Jujutsu Kaisen Bot...")
				.addFields({
					name: "Basic Crafting",
					value: "To start crafting, use `/craft [item]`. You'll need the right materials."
				})
			break
		case "technique":
			guideEmbed
				.setTitle("Technique Guide")
				.setDescription("Here's how you can aquire techniques in the Jujutsu Kaisen Bot...")
				.addFields({
					name: "Techniques",
					value: "To start learning techniques, use `/techniqueshop`. You'll need the right materials. And money."
				})
			break
		case "jobs":
			guideEmbed.setTitle("Jobs Information").setDescription("All info on jobs")

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

			break
		default:
			guideEmbed
				.setTitle("Jujutsu Kaisen Bot Guide")
				.setDescription(
					"Welcome to the Jujutsu Kaisen Bot! Here are some commands you can use to interact with the bot. [ Very WIP ]"
				)
				.addFields(
					{
						name: "Commands",
						value: "1. `/search` - Search for items!.\n2. `/use` - Use an item from your inventory.\n3. `/fight` - Fight a cursed spirit.\n4. `/lookup` - Look up an item.\n5. `/achievements` - View your achievements.\n6. `/guide` - Display this guide.\n7. `/update` - View recent updates.\n8. `/support` - Get the support server link.\n9. `/claninfo` - Get information about clans.\n10. `/jujutsustats` - View your jujutsu stats."
					},
					{
						name: "Additional Information",
						value: "Use these commands to explore the world of Jujutsu Kaisen and grow your cursed energy. Good luck!"
					}
				)
	}

	await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
}

export async function handleLeaderBoardCommand(interaction) {
	try {
		// Assuming there's an option in the slash command where `choice` is either 'xp' or 'wealth'
		const choice = interaction.options.getString("type") // Get the user's choice from the command options

		const leaderboardEmbed = new EmbedBuilder().setColor("#00FF00").setTimestamp()
		const rankEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

		if (choice === "xp") {
			const userExperiences = await getAllUserExperience()
			userExperiences.sort((a, b) => b.experience - a.experience)

			leaderboardEmbed
				.setTitle("🏆 Leaderboard - Top Performers 🏆")
				.setDescription("Here are the top performers based on XP earned:")

			userExperiences.slice(0, 10).forEach((user, index) => {
				const rank = rankEmojis[index] ? rankEmojis[index] : index + 1
				const text = `${rank} <@${user.id}> - **${user.experience} XP**`
				leaderboardEmbed.addFields({ name: "\u200B", value: text, inline: false })
			})
		} else if (choice === "wealth") {
			const userBalances = await getAllUsersBalance()
			userBalances.sort((a, b) => b.balance - a.balance)

			leaderboardEmbed
				.setTitle("💰 Leaderboard - Top Wealth 💰")
				.setDescription("Here are the top users based on balance:")

			userBalances.slice(0, 10).forEach((user, index) => {
				const rank = rankEmojis[index] ? rankEmojis[index] : index + 1
				const text = `${rank} <@${user.id}> - **$${user.balance.toLocaleString()}**`
				leaderboardEmbed.addFields({ name: "\u200B", value: text, inline: false })
			})
		} else {
			await interaction.reply("Invalid choice! Please choose between 'xp' and 'wealth'.")
			return
		}

		// Reply with the chosen type of leaderboard
		await interaction.reply({ embeds: [leaderboardEmbed] })
	} catch (error) {
		console.error("Failed to handle leaderboard command:", error)
		await interaction.reply("There was an error trying to execute that command!")
	}
}

export async function handleVoteCommand(interaction) {
	// Enhanced embed message
	const voteEmbed = new EmbedBuilder()
		.setColor("#55AAFF") // A slightly softer blue
		.setTitle("⭐ Vote for Our Bot! ⭐")
		.setDescription("Help us grow and improve by voting:") // Concise focus
		.setThumbnail(
			"https://cdn.discordapp.com/attachments/1094302755960664255/1225954487739355176/helpprofile.jpg?ex=66230217&is=66108d17&hm=9f851af9539aee1912faece3236d4c222617bec567b5bf952448abe7881a36fb&"
		) // Replace with a relevant bot icon
		.setTimestamp()
		.setFooter({ text: "Your vote matters!" })

	// Buttons with external emojis for attention
	const voteButtonTopGG = new ButtonBuilder()
		.setLabel("🚀 Vote on Top.gg")
		.setStyle(ButtonStyle.Link)
		.setURL("https://top.gg/bot/991443928790335518/vote")
		.setEmoji("🚀") // Emoji!
	const discordbotlistme = new ButtonBuilder()
		.setLabel("👍 Vote on Botlist.me")
		.setStyle(ButtonStyle.Link)
		.setURL("https://botlist.me/bots/991443928790335518/vote")
		.setEmoji("👍") // Emoji!

	// Action row - no changes needed
	const row = new ActionRowBuilder().addComponents(voteButtonTopGG, discordbotlistme)

	// Reply with the updated components
	await interaction.reply({ embeds: [voteEmbed], components: [row], ephemeral: true })
}
async function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
export const activeCollectors = new Map()

const specialBosses = ["Yuta Okkotsu", "Disaster Curses"]

export async function handleFightCommand(interaction: ChatInputCommandInteraction) {
	// Get the user's maximum health and set their current health to max
	const playerHealth1 = await getUserMaxHealth(interaction.user.id)
	await updateUserHealth(interaction.user.id, playerHealth1)

	// Defer the reply while processing
	await interaction.deferReply()

	// Fetch the user's grade and all bosses associated with that grade
	const userGrade = await getUserGrade(interaction.user.id)
	const allBosses = await getBosses(userGrade)

	// Fetch the list of bosses the user has unlocked
	const unlockedBosses = await getUserUnlockedBosses(interaction.user.id)

	if (allBosses.length === 0) {
		console.error("No bosses found in the database.")
		await interaction.editReply({ content: "No bosses found for your grade." })
		return
	}

	let randomOpponent
	let attempts = 0
	do {
		// Select a random boss
		const randomIndex = Math.floor(Math.random() * allBosses.length)
		randomOpponent = allBosses[randomIndex]

		// If the selected boss is special and not unlocked, loop will try again
		// Define special bosses that need to be unlocked to fight
		// Example: If specialBosses includes randomOpponent.name and it's not in unlockedBosses, loop continues
		attempts++
	} while (
		specialBosses.includes(randomOpponent.name) &&
		!unlockedBosses.includes(randomOpponent.name) &&
		attempts < allBosses.length
	)

	if (!randomOpponent || attempts >= allBosses.length) {
		// Handle case where a suitable boss couldn't be found
		await interaction.editReply({
			content: "Couldn't find a suitable boss for you to fight. Try unlocking more bosses!"
		})
		return
	}

	const cursedEnergyPurple = parseInt("#8A2BE2".replace("#", ""), 16) // Convert hex string to number
	const playerHealth = await getUserMaxHealth(interaction.user.id)
	const hasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(interaction.user.id)

	// Fetch techniques based on whether the user has Heavenly Restriction
	const userTechniques = hasHeavenlyRestriction
		? await getUserActiveHeavenlyTechniques(interaction.user.id)
		: await getUserActiveTechniques(interaction.user.id)

	const battleOptions = [
		{
			label: "Domain Expansion",
			value: "domain",
			emoji: {
				name: "1564maskedgojode", // Replace with your emoji's name
				id: "1220626413141622794" // Replace with your emoji's ID
			}
		},
		...userTechniques.map(techniqueName => ({
			label: techniqueName,
			description: "Select to use this technique",
			value: techniqueName
		}))
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
		.setDescription(`Your opponent is **${randomOpponent.name}**! Prepare yourself.`)
		.setImage(randomOpponent.image_url)
		.addFields(
			{ name: "Boss Health", value: `:heart: ${randomOpponent.current_health.toString()}`, inline: true },
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
			{ name: "Status Effect Enemy", value: "None", inline: true },
			{ name: "Status Effect Player", value: "None", inline: true }
		)

	const remainingHealthPercentage = randomOpponent.current_health / randomOpponent.max_health
	if (remainingHealthPercentage < 0.5) {
		primaryEmbed.setFooter({ text: "The opponent is getting weaker!" })
	}

	// Add JJK Flavor Text based for this boss
	const flavorText = getJujutsuFlavorText(randomOpponent.name)
	if (flavorText) {
		primaryEmbed.addFields([flavorText])
	}

	await interaction.editReply({
		embeds: [primaryEmbed],
		components: [row]
	})

	// Handle user selection
	const battleOptionSelectMenuCollector = interaction.channel.createMessageComponentCollector({
		filter: inter => inter.customId === "select-battle-option" && inter.message.interaction.id === interaction.id,
		componentType: ComponentType.StringSelect,
		time: 100000 // 60 seconds
	})

	battleOptionSelectMenuCollector.on("collect", async collectedInteraction => {
		await collectedInteraction.deferUpdate()
		if (collectedInteraction.user.id !== interaction.user.id) return
		const selectedValue = collectedInteraction.values[0]
		const playerHealth = await getUserHealth(collectedInteraction.user.id)

		console.log("Selected value:", selectedValue)
		if (selectedValue === "domain") {
			console.log("Domain expansion selected.")
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
					return // Exit if Heavenly Restriction is present, or adjust as needed
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
					console.error("Invalid domain found in the database.")
					return
				}
				domainActivationState.set(contextKey, true)
				// embed here
				const domainEmbed = new EmbedBuilder()
					.setColor("Blue")
					.setTitle(`${randomOpponent.name}  I'll show you real jujutsu.. Ryouki Tenkai!`)
					.setDescription(`Domain: ${domainInfo}`)
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
				console.error("Error during fight command:", error)
				await collectedInteraction.followUp({
					content: "An error occurred during the fight. Please try again later.",
					ephemeral: true
				})
			}
		} else {
			const userTechniques = new Map()
			// Get player's health

			// get boss hp
			const currentBossHealth = bossHealthMap.get(interaction.user.id) || randomOpponent.max_health

			// grade
			const playerGradeData = await getUserGrade(interaction.user.id)
			const playerGradeString = playerGradeData

			// calculate damage
			let damage = calculateDamage(playerGradeString, interaction.user.id, true)
			console.log("11")

			if (selectedValue === "Ten Shadows Technique: Divergent Sila Divine General Mahoraga") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl: "https://media1.tenor.com/m/lItEyBP-G48AAAAC/mahoraga-summoning-mahoraga.gif",
					description: "With this treasure.. I summon.",
					fieldValue: selectedValue,
					userTechniques,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				await applyAdaption(collectedInteraction.user.id)
			} else if (selectedValue === "Hollow Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl: "https://media1.tenor.com/m/ZdRh7cZgkGIAAAAC/hollow-purple.gif",
					description: `I guess i can play a little rough. ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Disaster Curses: Full Flux") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 8,
					imageUrl: "https://media1.tenor.com/m/QHLZohdZiXsAAAAd/geto-suguru.gif",
					description: "Open the gate between the worlds... Lend me your power. Disaster Curses: Full Flux.",
					fieldValue: selectedValue,
					userTechniques,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Chiyo") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 5,
					imageUrl: "https://media1.tenor.com/m/mUWaK2ogJ1AAAAAC/azumanga-daioh-azumanga.gif",
					description: "You're a good kid. I'll make sure you don't suffer.",
					fieldValue: selectedValue,
					userTechniques,
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
					userTechniques,
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
					userTechniques,
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
					userTechniques,
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
					userTechniques,
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
					userTechniques,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "Inverted Spear Of Heaven: Severed Universe") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 4,
					imageUrl: "https://media1.tenor.com/m/707D3IG5x2wAAAAC/isoh-inverted-spear.gif",
					description: `I'm going to lose huh? ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques,
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
					userTechniques,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			} else if (selectedValue === "World Cutting Slash") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 3,
					imageUrl: "https://media1.tenor.com/m/O8RVjFsdWI8AAAAC/sukuna-ryomen.gif",
					description: `Dissect! ${randomOpponent.name}`,
					fieldValue: selectedValue,
					userTechniques,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
				await applyWorldCuttingSlash(collectedInteraction.user.id)
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
					userTechniques,
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
					userTechniques,
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
					userTechniques,
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
					userTechniques,
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
					userTechniques,
					userId: collectedInteraction.user.id,
					primaryEmbed
				})
			}

			// update boss hp
			bossHealthMap.set(interaction.user.id, Math.max(0, currentBossHealth - damage))
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
			try {
				//await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
			} catch (err: unknown) {
				console.error(err?.toString())
			}
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
				} else if (randomOpponent.name === "Sukuna") {
					transformed = await exportTheCursedOne(interaction, randomOpponent, primaryEmbed, row, playerHealth)
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
				}
				if (!transformed) {
					console.log("Boss is defeated and no transformation occurred.")
					domainActivationState.set(contextKey, false)
					activeCollectors.delete(interaction.user.id)
					bossHealthMap.delete(interaction.user.id)

					await handleBossDeath(interaction, primaryEmbed, row, randomOpponent)
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
				await calculateDamageWithEffects(interaction.user.id, chosenAttack.baseDamage, statusEffects)

				const damageToPlayer = chosenAttack.baseDamage

				const newPlayerHealth = playerHealth - damageToPlayer
				const clampedPlayerHealth = Math.max(0, newPlayerHealth)

				//did bro die?
				if (clampedPlayerHealth <= 0) {
					const bossAttackMessage = `${randomOpponent.name} killed you!`
					primaryEmbed.setFooter({ text: bossAttackMessage })

					// Reset player health in the database.
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
					//
					battleOptionSelectMenuCollector.stop()
				} else {
					// Update to new player health after damage dealt
					await updateUserHealth(interaction.user.id, clampedPlayerHealth)
					const statusEffectsValue = await fetchAndFormatStatusEffects(collectedInteraction.user.id)
					//
					//
					const bossAttackMessage = `${randomOpponent.name} dealt ${damageToPlayer} damage to you with ${chosenAttack.name}!`
					primaryEmbed.addFields({ name: "Enemy Technique", value: bossAttackMessage }) // Add enemy's technique

					primaryEmbed.addFields([{ name: "Status Effect Player", value: statusEffectsValue, inline: true }])
					await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
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

	//
	const userId = interaction.user.id
	const interactionId = interaction.id
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

	//
	latestInteractionIdPerUser.set(userId, interactionId)
	latestSessionTimestampPerUser.set(userId, sessionTimestamp)

	// Initialize clanOptions based on heavenly restriction
	let clanOptions
	if (hasHeavenlyRestriction) {
		clanOptions = [
			{
				label: "Heavenly Restriction",
				value: "heavenly_restriction",
				description: "Special techniques for those under Heavenly Restriction"
			}
		]
	} else {
		const clans = Object.keys(CLAN_SKILLS) // Assuming CLAN_SKILLS is an object mapping clans to their skills
		clanOptions = clans.map(clan => ({
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
		const currentSessionTimestamp = latestSessionTimestampPerUser.get(userId)
		const interactionTimestamp = i.createdTimestamp // Discord.js provides the timestamp of when the interaction was created
		let skillsToDisplay
		let embedTitle
		let customIdPrefix

		if (interactionTimestamp < currentSessionTimestamp) {
			console.log("Attempted to interact with a stale session. Ignoring.")
			return // Skip processing this interaction
		}

		if (i.isStringSelectMenu()) {
			await i.deferUpdate()
			// Determine the set of skills based on whether the "Heavenly Restriction" option was selected or a clan was chosen
			if (i.values[0] === "heavenly_restriction") {
				// Heavenly Restriction skills
				skillsToDisplay = heavenlyrestrictionskills.filter(skill => !userTechniques.includes(skill.name))
				embedTitle = "Heavenly Restriction Techniques"
				customIdPrefix = "buy_heavenly_technique_"
			} else {
				// Normal clan skills
				const selectedClan = clans.find(clan => clan.toLowerCase().replace(/\s+/g, "_") === i.values[0])
				skillsToDisplay = CLAN_SKILLS[selectedClan].filter(skill => !userTechniques.includes(skill.name))
				embedTitle = `${selectedClan} Clan Techniques`
				customIdPrefix = "buy_technique_"
			}

			if (skillsToDisplay.length === 0) {
				await i.editReply({
					content: "There are no more techniques available for you to purchase in this category.",
					components: [] // Clear any interactive components
				})
				techniqueshopcollector.stop
				return // Stop further execution if no skills are available
			}

			// Build the embed for displaying skills
			const embed = new EmbedBuilder()
				.setTitle(embedTitle)
				.setColor(0x1f512d)
				.setDescription(
					skillsToDisplay
						.map(skill => {
							return `**${skill.name}** - ${skill.cost} Coins${
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

			// Create buttons for purchasing skills
			const skillButtons = skillsToDisplay.map(skill =>
				new ButtonBuilder()
					.setCustomId(`${customIdPrefix}${skill.name.toLowerCase().replace(/\s+/g, "_")}`)
					.setLabel(`Buy ${skill.name}`)
					.setStyle(ButtonStyle.Secondary)
			)

			// Create rows of buttons for skills
			const buttonRows = []
			for (let j = 0; j < skillButtons.length; j += 5) {
				buttonRows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(skillButtons.slice(j, j + 5)))
			}

			// Keep the dropdown menu in the components
			buttonRows.unshift(row)

			// Update the interaction with the embed and new buttons
			await i.editReply({
				embeds: [embed],
				components: buttonRows
			})
		} else if (i.isButton()) {
			await i.deferUpdate()
			const isHeavenlySkill = i.customId.startsWith("buy_heavenly_technique_")
			const techniqueName = i.customId
				.replace("buy_technique_", "")
				.replace("buy_heavenly_technique_", "")
				.replace(/_/g, " ")

			// Retrieve the selected technique details
			const selectedSkill = isHeavenlySkill
				? heavenlyrestrictionskills.find(skill => skill.name.toLowerCase() === techniqueName)
				: Object.values(CLAN_SKILLS)
						.flat()
						.find(skill => skill.name.toLowerCase() === techniqueName)

			if (!selectedSkill) {
				await i.followUp({ content: "This technique does not exist." })
				return
			}

			// Check if the user has enough balance
			if (userBalance < parseInt(selectedSkill.cost, 10)) {
				await i.followUp({
					content: `You do not have enough coins to purchase ${selectedSkill.name}.`
				})
				return
			}

			// Check if the user has the required items (if any)
			const hasRequiredItems = (selectedSkill.items || []).every(reqItem => {
				const userItem = userInventory.find(item => item.name === reqItem.name)
				return userItem && userItem.quantity >= reqItem.quantity
			})

			if (!hasRequiredItems) {
				await i.followUp({
					content: `You do not have the required items to purchase ${selectedSkill.name}.`
				})
				return
			}

			// Deduct coins and items
			await updateBalance(userId, -parseInt(selectedSkill.cost, 10)) // Deduct coins
			for (const { name, quantity } of selectedSkill.items || []) {
				await removeItemFromUserInventory(userId, name, quantity) // Remove items
			}

			if (isHeavenlySkill) {
				// If it's a heavenly restriction technique, add it to that collection
				await updateUserHeavenlyTechniques(userId, selectedSkill.name)
			} else {
				// Otherwise, add it as a regular technique
				await addUserTechnique(userId, selectedSkill.name)
			}

			// Respond to the interaction
			await i.followUp({
				content: `Congratulations! You have successfully purchased the technique: ${selectedSkill.name}.`,
				components: [], // Clear the components to remove the buttons
				ephemeral: true
			})
			techniqueshopcollector.stop()
		}
	})
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export function generateStatsEmbed(client: Client): EmbedBuilder {
	const uptime = formatUptime(client.uptime ?? 0)
	const apiLatency = Math.round(client.ws.ping)

	const statsEmbed = new EmbedBuilder()
		.setColor("#0099FF")
		.setTitle("🤖 Bot Stats")
		.setDescription("Current bot stats, updated every 5 minutes.")
		.addFields(
			{ name: "Uptime", value: uptime, inline: true },
			{ name: "API Latency", value: `${apiLatency}ms`, inline: true },
			{ name: "Status", value: "🟩", inline: true }
			// Add more fields as needed
		)
		.setTimestamp() // This automatically adds the current time as the "footer" timestamp
		.setFooter({ text: "Last Updated" }) // This sets the footer text

	return statsEmbed
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
	//
	const maxBetLimit = 10000000
	//
	const gameType = interaction.options.getString("game") // Assuming "game" is the option name
	const betAmount = interaction.options.getInteger("amount", true)
	const userId = interaction.user.id
	const currentBalance = await getBalance(userId)
	const { betCount } = await getUserGambleInfo(userId)

	//
	const userBetCounts = {}

	if (!userBetCounts[userId]) {
		userBetCounts[userId] = 0
	}
	userBetCounts[userId]++

	if (betCount >= 20) {
		await interaction.reply("You've reached your daily gamble limit of 20. Please try again tomorrow.")
		return
	}

	if (betAmount > currentBalance) {
		await interaction.reply("You don't have enough coins to make this bet.")
		return
	}

	if (betAmount > maxBetLimit) {
		await interaction.reply(`The maximum bet amount is ${formatNumberWithCommas(maxBetLimit)} coins.`)
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
			await updateBalance(userId, winnings)
			await updateGamblersData(userId, betAmount, winnings, 0) // Update gambling stats
			resultMessage = `🪙 It landed on ${result}! You've doubled your bet and won $${formatNumberWithCommas(
				winnings
			)} coins!`
		} else {
			const losses = betAmount
			await updateBalance(userId, -losses)
			await updateGamblersData(userId, betAmount, 0, losses) // Update gambling stats
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
		if (supatechnique && !userTechniques.includes("Prayer Songt")) {
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

	// Weighted Random Benefactor Selection
	const totalWeight = benefactors.reduce((sum, benefactor) => sum + benefactor.weight, 0)
	let random = Math.random() * totalWeight
	let chosenOne
	for (const benefactor of benefactors) {
		random -= benefactor.weight
		if (random <= 0) {
			chosenOne = benefactor
			break
		}
	}

	// Result Message Construction
	let resultMessage = `You begged ${chosenOne.name}`
	let receivedItems = false

	if ("coins" in chosenOne) {
		await updateBalance(interaction.user.id, chosenOne.coins)
		resultMessage += ` and they felt generous, giving you ${chosenOne.coins.toLocaleString()} coins`
		receivedItems = true
	}
	if ("item" in chosenOne) {
		await addItemToUserInventory(interaction.user.id, chosenOne.item, chosenOne.itemQuantity ?? 1)
		if (receivedItems) {
			resultMessage += ` and also handed you ${chosenOne.itemQuantity ?? 1} x ${chosenOne.item}`
		} else {
			resultMessage += ` and handed you ${chosenOne.itemQuantity ?? 1} x ${chosenOne.item}`
		}
		receivedItems = true
	} else {
		resultMessage += ", but didn't give you any items this time."
	}
	resultMessage += "!"

	// Embed Creation
	const resultEmbed = new EmbedBuilder()
		.setTitle("Begging Result")
		.setDescription(resultMessage)
		.setColor("#FFD700")
		.setTimestamp()

	await interaction.reply({ embeds: [resultEmbed] })
}

// handle sell command

export async function handleSellCommand(interaction) {
	const itemToSell = interaction.options.getString("item").toLowerCase() // Normalize input for case-insensitive comparison
	const quantity = interaction.options.getInteger("quantity") || 1

	const userInventory = await getUserInventory(interaction.user.id)
	const inventoryItem = userInventory.find(i => i.name.toLowerCase() === itemToSell)
	if (!inventoryItem) {
		return interaction.reply({ content: "You don't have that item in your inventory.", ephemeral: true })
	}

	const itemDetails = items.find(i => i.name.toLowerCase() === itemToSell)

	const price = itemDetails ? itemDetails.price : 5000
	const earnings = price * quantity

	// Prepare the confirmation embed
	const confirmationEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle("Confirm Sale")
		.setDescription(
			`Are you sure you want to sell ${quantity} x ${inventoryItem.name} for ${earnings.toLocaleString()} coins?`
		)

	// Prepare "Confirm" and "Cancel" buttons
	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId("confirm_sell").setLabel("Confirm").setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId("cancel_sell").setLabel("Cancel").setStyle(ButtonStyle.Danger)
	)

	// Send the confirmation message with buttons
	await interaction.reply({ embeds: [confirmationEmbed], components: [row], ephemeral: true })

	// Button interaction handling
	const filter = i => ["confirm_sell", "cancel_sell"].includes(i.customId) && i.user.id === interaction.user.id
	const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 })

	collector.on("collect", async i => {
		if (i.customId === "confirm_sell") {
			// Proceed with the sale
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
			// Cancel the sale
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
// Ban...KAI!
export async function handleQuestCommand(interaction: ChatInputCommandInteraction) {
	console.log(questsArray)
	const userId = interaction.user.id

	const userActiveQuests = await getUserQuests(userId) // Fetch the user's active quests
	const activeQuestNames = userActiveQuests.quests.map(q => q.id) // Extract the active quest names

	const availableQuests = questsArray.filter(quest => !activeQuestNames.includes(quest.name)) // Filter out active quests

	if (availableQuests.length === 0) {
		throw new Error("There are no available quests.")
	}

	const questOptions = availableQuests.map(quest => ({
		label: quest.name,
		value: quest.name,
		description: quest.description.substring(0, 100) // Description is truncated to fit within the 100 character limit
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
		components: [row],
		ephemeral: true
	})

	console.log("before menu")

	const filter = i => i.customId === "select_quest" && i.user.id === interaction.user.id
	const questCollector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

	console.log("after menu")

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

			console.log("before embed")

			const questEmbed = new EmbedBuilder()
				.setTitle(selectedQuest.name)
				.setDescription(selectedQuest.description)
				.setColor("#0099ff")
				.setFooter({ text: "Task: " + selectedQuest.task })

			await i.update({
				content: "Your quest has begun!",
				embeds: [questEmbed],
				components: []
			})
			console.log("after embed")
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
		const userId = interaction.user.id // Get the user's ID from the interaction
		const userQuests = await getUserQuests(userId) // Fetch user quests

		const completedQuests = userQuests.quests.filter(userQuest => {
			const questDetails = questsArray.find(quest => quest.name === userQuest.id)
			if (!questDetails) return false

			// Check if the quest has multiple tasks
			if (Array.isArray(questDetails.tasks) && questDetails.tasks.length > 0) {
				// For each task, check if the user's progress meets the totalProgress
				return questDetails.tasks.every(task => {
					const userTask = userQuest.tasks.find(t => t.description === task.description)
					return userTask && userTask.progress >= task.totalProgress
				})
			} else {
				// If it's a single task quest
				return userQuest.progress >= questDetails.totalProgress
			}
		})

		if (completedQuests.length === 0) {
			await interaction.reply("You have no completed quests to claim.")
			return
		}

		for (const completedQuest of completedQuests) {
			const questDetails = questsArray.find(quest => quest.name === completedQuest.id)
			if (!questDetails) continue

			const { coins, experience, items, item, itemQuantity } = questDetails

			// Add coins and experience
			await updateBalance(userId, coins)
			await updateUserExperience(userId, experience)

			// Handle items for quests with multiple items
			if (items && typeof items === "object") {
				for (const [itemName, quantity] of Object.entries(items)) {
					await addItemToUserInventory(userId, itemName, quantity)
				}
			}

			// Handle single item
			else if (item) {
				await addItemToUserInventory(userId, item, itemQuantity || 1)
			}

			// Update the player's grade and remove the completed quest
			await updatePlayerGrade(userId)
			await removeUserQuest(userId, completedQuest.id)
		}

		// Prepare the embed with claimed rewards
		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Quest Rewards Claimed")
			.setDescription(completedQuests.map(quest => `**${quest.id}**`).join("\n"))

		await interaction.reply({ embeds: [embed] })
	} catch (error) {
		console.error("Error claiming quests:", error)
		await interaction.reply({
			content: "An error occurred while claiming quests.",
			ephmeral: true
		})
	}
}
// view all active quests using getuserquest
export async function viewQuestsCommand(interaction) {
	const userId = interaction.user.id
	const userQuests = await getUserQuests(userId)

	if (!userQuests || !Array.isArray(userQuests.quests) || userQuests.quests.length === 0) {
		await interaction.reply("You have no active quests.")
		return
	}

	const embed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle("Active Quests")
		.setDescription("Here are your currently active quests:")

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

			embed.addFields({ name: questDetails.name, value: taskList, inline: false })
		} else if (questDetails) {
			const userTask = quest.progress || 0 // Assuming quest.progress exists and is a number
			const isComplete = userTask >= questDetails.totalProgress
			const taskDescription = isComplete ? `~~${questDetails.task}~~` : questDetails.task
			const progressText = isComplete
				? `~~${userTask}/${questDetails.totalProgress}~~ ✅`
				: `${userTask}/${questDetails.totalProgress}`
			embed.addFields({
				name: questDetails.name,
				value: `**Task**: ${taskDescription}\n**Progress**: ${progressText}`,
				inline: false
			})
		}
	})

	await interaction.reply({ embeds: [embed] })
}
// abandon quest with dropdown menu using getuserquest
export async function abandonQuestCommand(interaction) {
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
	console.log("useCommand function initiated.")

	const userId = interaction.user.id
	const itemName = interaction.options.getString("item")

	const inventoryItems = await getUserInventory(userId)
	const item = items1.find(i => i.itemName === itemName) // Search in items1
	const hasItem = inventoryItems.some(i => i.name === itemName && i.quantity > 0)

	if (!hasItem) {
		const embed = new EmbedBuilder()
			.setColor("#FF0000")
			.setTitle("Search yields no results...")
			.setDescription(`You rummage through your belongings but find no trace of ${itemName}.`)
		await interaction.reply({ embeds: [embed], ephemeral: true })
		return
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
		removeItemFromUserInventory(userId, itemName, 1)
		if (item) {
			await item.effect(interaction)
		}
	} catch (error) {
		console.error("Error executing item effect:", error)
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

	// --- Send to the Target User ---
	try {
		await targetUser.send({ embeds: [tradeEmbed] })
		await interaction.reply({ content: "Trade request sent!", ephemeral: true })
	} catch (error) {
		console.error("Failed to send a trade request DM:", error)
		await interaction.reply({
			content: "Failed to send a trade request. The user might have DMs disabled.",
			ephemeral: true
		})
	}
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
		console.error("Error in handleAcceptTrade:", error)
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
		console.log("Trade request accepted successfully!")
		await interaction.followUp({
			content: "Trade request accepted successfully!",
			components: []
		})
		return
	} catch (error) {
		console.error("Error handling trade acceptance:", error)
		console.log("An error occurred while trying to accept the trade request.")
		await interaction.followUp({
			content: "Confirmed.",
			components: []
		})
		return
	}
}

// view trade command, it has a selectmenu with two options. active trades and previous trades active trades shows all current pending and outgoing trades and previous trades shows all completed trades
export async function handlePreviousTradesCommand(interaction) {
	const userId = interaction.user.id

	try {
		const previousTrades = await getPreviousTrades(userId)

		if (previousTrades.length === 0) {
			await interaction.reply("You don't have any previous trades.")
			return
		}

		await paginateTrades(interaction, previousTrades, "Previous Trades")
	} catch (error) {
		console.error("Error fetching previous trades:", error)
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
		console.error("Error fetching active trades:", error)
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

	const inputTechniqueNames = []
	for (let i = 1; i <= 10; i++) {
		const optionName = `technique${i === 1 ? "" : i}`
		const techniqueName = interaction.options.getString(optionName)
		if (techniqueName) {
			inputTechniqueNames.push(techniqueName)
		}
	}

	try {
		const userTechniques = await getUserTechniques(userId)
		const activeTechniques = await getUserActiveTechniques(userId)

		const userTechniquesLowercaseMap = new Map(userTechniques.map(name => [name.toLowerCase(), name]))
		const activeTechniquesLowercaseMap = new Map(activeTechniques.map(name => [name.toLowerCase(), name]))

		const invalidTechniques = inputTechniqueNames.filter(
			name => !userTechniquesLowercaseMap.has(name.toLowerCase())
		)
		if (invalidTechniques.length > 0) {
			return await interaction.reply({
				content: `You don't own the following techniques: ${invalidTechniques.join(", ")}`,
				ephemeral: true
			})
		}

		const techniquesToActivate = inputTechniqueNames
			.filter(name => !activeTechniquesLowercaseMap.has(name.toLowerCase()))
			.map(name => userTechniquesLowercaseMap.get(name.toLowerCase()))

		if (techniquesToActivate.length > 0) {
			const updatedActiveTechniques = [...activeTechniques, ...techniquesToActivate]
			await updateUserActiveTechniques(userId, updatedActiveTechniques)

			const techniquesToActivateDisplay = techniquesToActivate.join(", ")
			return await interaction.reply(`Techniques equipped: ${techniquesToActivateDisplay}`)
		} else {
			return await interaction.reply("The techniques you tried to equip are already active.")
		}
	} catch (error) {
		console.error("Error equipping techniques:", error)
		return await interaction.reply({
			content: "There was an error equipping your techniques. Please try again later.",
			ephemeral: true
		})
	}
}
export async function handleUnequipTechniqueCommand(interaction) {
	const userId = interaction.user.id
	const techniqueNameInput = interaction.options.getString("technique-name") // Technique name as input by the user

	// Ensure that techniqueNameInput is not null or empty
	if (!techniqueNameInput) {
		return await interaction.reply({
			content: "You must specify a technique to unequip.",
			ephemeral: true
		})
	}

	try {
		const activeTechniques = await getUserActiveTechniques(userId) // Presumed to return original casing

		// Create a lowercase map for case-insensitive comparison.
		const activeTechniquesLowercaseMap = new Map(activeTechniques.map(name => [name.toLowerCase(), name]))

		// Check if the technique is equipped using a case-insensitive comparison.
		const techniqueNameLowercase = techniqueNameInput.toLowerCase()
		if (!activeTechniquesLowercaseMap.has(techniqueNameLowercase)) {
			return await interaction.reply({
				content: "That technique is not currently equipped.",
				ephemeral: true
			})
		}

		// Filter out the unequipped technique while preserving original casing for others.
		const newActiveTechniques = activeTechniques.filter(
			technique => technique.toLowerCase() !== techniqueNameLowercase
		)

		await updateUserActiveTechniques(userId, newActiveTechniques)

		// Get the original case name for the technique being unequipped for the response.
		const originalCaseName = activeTechniquesLowercaseMap.get(techniqueNameLowercase)
		await interaction.reply(`Technique '${originalCaseName}' unequipped!`)
	} catch (error) {
		console.error("Error unequipping technique:", error)
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

		if (userTechniques.length === 0) {
			return await interaction.reply({ content: "You do not own any techniques.", ephemeral: true })
		}

		const embed = new EmbedBuilder()
			.setTitle(`${interaction.user.username}'s Techniques`)
			.setDescription(userTechniques.join("\n"))

		await interaction.reply({ embeds: [embed] })
	} catch (error) {
		console.error("Error fetching user techniques:", error)
		await interaction.reply({ content: "An error occurred while fetching your techniques.", ephemeral: true })
	}
}

export async function handleGiveItemCommand(
	interaction: ChatInputCommandInteraction
): Promise<InteractionResponse<boolean>> {
	if (interaction.user.id !== "292385626773258240") {
		return interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true })
	}
	const targetUserId = interaction.options.getString("userid")
	const itemName = interaction.options.getString("item")
	const quantity = interaction.options.getInteger("quantity")

	if (!targetUserId || !itemName || !quantity) {
		return await interaction.reply({
			content: "Please provide a target user ID, item name, and quantity.",
			ephemeral: true
		})
	}

	try {
		await addItemToUserInventory(targetUserId, itemName, quantity)
		return interaction.reply({
			content: `Successfully added ${quantity}x ${itemName} to user ${targetUserId}`,
			ephemeral: true
		})
	} catch (error) {
		console.error("Error in giveitem command", error)
		return interaction.reply({ content: "...", ephemeral: true })
	}
}

// handle unequip quests command dropdown menu embed but instead of giving quest it takes it away
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
