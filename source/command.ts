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
	SelectMenuInteraction,
	StringSelectMenuBuilder
} from "discord.js"
import { attacks } from "./attacks.js"
import { digCooldown, digCooldownBypassIDs, digCooldowns } from "./bot.js"
import {
	calculateDamage,
	calculateEarnings,
	createInventoryPage,
	getRandomAmount,
	getRandomLocation
} from "./calculate.js"
import { executeSpecialTechnique, handleBossDeath } from "./fight.js"
import {
	BossData,
	buildQuestEmbed,
	determineDomainAchievements,
	formatDomainExpansion,
	gradeMappings
} from "./interface.js"
import {
	CLAN_SKILLS,
	DOMAIN_EXPANSIONS,
	allAchievements,
	benefactors,
	craftingRecipes,
	dailyitems,
	getRandomItem,
	heavenlyrestrictionskills,
	items,
	jobs,
	lookupItems,
	questsArray
} from "./items jobs.js"
import { getJujutsuFlavorText } from "./jujutsuFlavor.js"
import {
	addItemToUserInventory,
	addUser,
	addUserQuest,
	addUserQuestProgress,
	addUserTechnique,
	awardTitlesForAchievements,
	checkUserHasHeavenlyRestriction,
	getAllUserExperience,
	getAllUsersBalance,
	getBalance,
	getBosses,
	getUserAchievements,
	getUserClan,
	getUserCursedEnergy,
	getUserDailyData,
	getUserDomain,
	getUserGambleInfo,
	getUserGrade,
	getUserHealth,
	getUserHeavenlyTechniques,
	getUserInventory,
	getUserProfile,
	getUserQuests,
	getUserTechniques,
	getUserUnlockedTitles,
	getUserWorkCooldown,
	removeItemFromUserInventory,
	removeUserQuest,
	updateBalance,
	updatePlayerGrade,
	updateUserAchievements,
	updateUserClan,
	updateUserCooldown,
	updateUserCursedEnergy,
	updateUserDailyData,
	updateUserDomainExpansion,
	updateUserExperience,
	updateUserGambleInfo,
	updateUserHealth,
	updateUserHeavenlyRestriction,
	updateUserHeavenlyTechniques,
	updateUserJob,
	updateUserTitle,
	updateUserrHealth,
	userExists
} from "./mongodb.js"

const domainActivationState = new Map()
const bossHealthMap = new Map() // Create a Map to store boss health per user

export const searchCooldowns = new Map()
export const searchCooldown = 60 * 1000 // 60 seconds in milliseconds
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

		// Since user does not exist, try to add the new user
		const result = await addUser(discordId)

		// 'addUser' will return an object with 'insertedId' if insertion was successful
		if (result && "insertedId" in result) {
			// User was successfully added, create and send the welcome embed
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
			// Some other issue occurred, send an error message
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
	await interaction.deferReply()
	const user = interaction.user

	// Assuming getUserBankBalance and getBalance are async functions returning numbers
	const balance = await getBalance(user.id)

	// Convert to strings with commas for thousands, millions, etc.
	const cursedCoins = balance.toLocaleString("en-US") // Adjust 'en-US' as needed for your locale

	const balanceEmbed = new EmbedBuilder()
		.setColor(0xa00000) // A deep red for a mystical, cursed energy vibe
		.setTitle(`${user.username}'s Cursed Wallet`)
		.setThumbnail(user.displayAvatarURL()) // Ideally, a thematic image here
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
			.setColor(0x1f6b4e) // Changed to a dark green for thematic consistency
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

	// Check for mentioned user in the command, use command issuer if no user is mentioned
	const mentionedUser = interaction.options.getUser("user") || interaction.user
	const inventoryItems = await getUserInventory(mentionedUser.id)
	const itemsPerPage = 10 // Number of items to show per page
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

	// Button collector for page navigation
	const collector = message.createMessageComponentCollector({ time: 60000 })
	collector.on("collect", async i => {
		// Check if the interaction user is the command issuer or the mentioned user's inventory they are viewing
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
			// If someone else tries to interact who is not the command issuer or the mentioned user, inform them.
			await i.reply({ content: "You cannot control this inventory navigation.", ephemeral: true })
		}
	})
}

export async function handleDigCommand(interaction) {
	await interaction.deferReply()

	const currentTime = Date.now()
	const authorId = interaction.user.id
	const timestamp = digCooldowns.get(authorId)

	// Check cooldown, incorporating a themed message
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
			return // Stop further execution to prevent cooldown reset
		}
	}

	// User is not on cooldown, or has bypassed it; update the cooldown
	digCooldowns.set(authorId, currentTime)

	// Determine if an item is found based on a chance
	const itemDiscoveryChance = 0.7 // 50% chance to discover an item
	const doesDiscoverItem = Math.random() < itemDiscoveryChance

	// The command logic for finding coins
	const coinsFound = Math.floor(Math.random() * 20000) + 1
	await updateBalance(interaction.user.id, coinsFound)

	if (doesDiscoverItem) {
		// Attempt to find an item
		const itemFound = getRandomItem() // This function needs to handle the logic of item discovery chance internally
		if (itemFound) {
			// An item was found
			await addItemToUserInventory(authorId, itemFound.name, 1)
			const digEmbed = new EmbedBuilder()
				.setColor(0x00ff00) // Success color
				.setTitle("Digging Results")
				.setDescription(`You unearthed \`⌬${coinsFound}\` coins! **You also found a ${itemFound.name}!**`)
				.setTimestamp()
			await interaction.editReply({ embeds: [digEmbed] })
		} else {
			// No item was found, even though an attempt was made
			const digEmbed = new EmbedBuilder()
				.setColor(0x00ff00) // Success color
				.setTitle("Digging Results")
				.setDescription(`You unearthed \`⌬${coinsFound}\` coins but didn't find any items this time.`)
				.setTimestamp()
			await interaction.editReply({ embeds: [digEmbed] })
		}
	} else {
		// No attempt to find an item was made
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

// command to get your domain expansion!
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
		.setDescription("Choose your domain technique wisely.")

	await interaction.reply({ embeds: [embed], components: [row], ephemeral: false })

	const filter = i => i.customId === "select-domain" && i.user.id === interaction.user.id
	const collector = interaction.channel.createMessageComponentCollector({
		filter,
		componentType: ComponentType.StringSelect
	})

	collector.on("collect", async collectedInteraction => {
		await collectedInteraction.deferUpdate()
		const selectedDomainName = collectedInteraction.values[0]

		// 1. Get User Data (using your getUserInventory function)
		const userInventory = await getUserInventory(interaction.user.id)

		// Domain Token Check
		const domainToken = userInventory.find(item => item.name === "Domain Token")
		if (!domainToken) {
			// Handle the case where the user doesn't have a Domain Token (update with error embed)
			await collectedInteraction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle("Requirements Not Met")
						.setDescription("You do not have a Domain Token.")
				],
				components: []
			})
			return // Stop further execution if the user doesn't have the token
		}

		// Continue with existing logic
		const userGrade = await getUserGrade(interaction.user.id)
		console.log("User Grade:", userGrade)

		// 2. Check Requirements
		const gradeLevel = userGrade.toLowerCase() // Normalize for comparison
		if (gradeMappings[gradeLevel] <= 3) {
			await updateUserAchievements(interaction.user.id, "unlockedDomain")
			await removeItemFromUserInventory(interaction.user.id, "Domain Token", 1)
			console.log("User has a Domain Token and is Grade 3 or higher.")

			await updateUserDomainExpansion(interaction.user.id, selectedDomainName)

			console.log(`User ${interaction.user.id} has unlocked the domain: ${selectedDomainName}`)
			// 3. Update Achievements and Titles
			const domainAchievements = determineDomainAchievements(selectedDomainName)
			const newlyUnlockedAchievements = domainAchievements.filter(achievement => {
				return !userInventory.some(item => item.name === achievement)
			})
			// Update user's achievement data
			for (const achievement of newlyUnlockedAchievements) {
				await updateUserAchievements(interaction.user.id, achievement /* or name */)
			}

			await awardTitlesForAchievements(interaction.user.id)

			// 4. Send Success Embed
			await collectedInteraction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle("Cursed Energy Manifested!")
						.setDescription("You have unlocked the " + selectedDomainName + " Domain Expansion!")
						.setColor("#552288")
				],
				components: []
			})
		} else {
			await collectedInteraction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle("Requirements Not Met")
						.setDescription("You do not have a Domain Token or are not a high enough grade.")
				],
				components: []
			})
		}

		collector.stop()
		collector.on("end", collected => {
			console.log(`Collected ${collected.size} items`)
		})
	})
}

const userSearching = new Map<
	string,
	{
		searchCount: number
		riskFactor: number
		coinsFound: number
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
		coinsFound: 0
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
				const coinsFound = userSearching.get(inter.user.id).coinsFound

				// final embed but not so final
				const finalEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle("Search Completed")
					.setDescription(`You've finished your searching. You gathered a total of ${coinsFound} coins.`)
					.setTimestamp()

				updateBalance(inter.user.id, coinsFound)

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

export async function handleUseItemCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	console.log("useCommand function initiated.")

	const userId = interaction.user.id
	const itemName = interaction.options.getString("item")

	// Fetch user's inventory to check item existence and quantity
	const inventoryItems = await getUserInventory(userId)
	const item = inventoryItems.find(i => i.name === itemName && i.quantity > 0)

	if (!item) {
		// User lacks the specified item
		const embed = new EmbedBuilder()
			.setColor("#FF0000")
			.setTitle("Search yields no results...")
			.setDescription(`You rummage through your belongings but find no trace of ${itemName}.`)
		await interaction.reply({ embeds: [embed], ephemeral: true })
		return
	}

	if (itemName === "Heavenly Restricted Blood") {
		await interaction.deferReply()
		const embedFirst = new EmbedBuilder()
			.setColor("#4b0082") // Indigo, for a mystical feel
			.setTitle("A Cursed Choice...")
			.setDescription("Your fingers close around blood vial")
		await interaction.followUp({ embeds: [embedFirst] })

		setTimeout(async () => {
			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000") // Dark red, for dramatic effect
				.setTitle("Power or Peril?")
				.setDescription(
					"With a decisive motion, you consume the blood, feeling an overwhelming power surge within..."
				)

			// Now, edit the reply with the new embed after the delay
			await interaction.editReply({ embeds: [embedSecond] })
		}, 2000) // 40000 milliseconds delay

		// Update user data after consuming the item
		await removeItemFromUserInventory(userId, item.name, 1)
		await updateUserHeavenlyRestriction(userId)
		await updateUserAchievements(userId, "unlockHeavenlyRestriction")
		await updateUserrHealth(userId, 25)

		setTimeout(() => {
			const embedFinal = new EmbedBuilder()
				.setColor("#006400") // Dark green, symbolizing growth
				.setTitle("Power Unleashed")
				.setDescription(
					"As the blood enters your body, You feel your cursed energy depleting.. What have you done?"
				)
				.setImage("https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg") // An image URL showing the unleashed power

			// Edit the reply with the new embed after a delay
			interaction.editReply({ embeds: [embedFinal] }).catch(console.error) // Adding catch to handle any potential errors
		}, 4000)
		return
	}
	if (itemName === "Special-Grade Geo Locator") {
		await interaction.deferReply()
		const embedFirst = new EmbedBuilder()
			.setColor("#4b0082") // Indigo, for a mystical feel
			.setTitle("SCANNING.")
			.setDescription("Scanning for frauds...")
		await interaction.followUp({ embeds: [embedFirst] })

		setTimeout(async () => {
			const findChance = Math.random()
			const chanceToFindYuta = 0.2 // 20% chance to find Yuta Okkotsu

			if (findChance <= chanceToFindYuta) {
				// If found
				const embedSecond = new EmbedBuilder()
					.setColor("#006400")
					.setTitle("LOCATED YUTA OKKOTSU")
					.setDescription("He's right there, get him!")
					.setImage("https://i.ytimg.com/vi/1mTM_tWt1eA/maxresdefault.jpg")

				// Edit the reply with the success embed
				await interaction.editReply({ embeds: [embedSecond] })
				await addUserQuestProgress(userId, "Find Yuta!", 1)
			} else {
				// If not found
				const embedSecond = new EmbedBuilder()
					.setColor("#8b0000") // Dark red, for dramatic effect
					.setTitle("Yuta Not Located")
					.setDescription("Yuta remains elusive...")

				await interaction.editReply({ embeds: [embedSecond] })
			}
		}, 4000) // 4000 milliseconds delay for the scan to "complete"

		await removeItemFromUserInventory(userId, item.name, 1)

		return
	}
	if (itemName === "Jogos (Fixed) Balls") {
		await interaction.deferReply()
		const embedFirst = new EmbedBuilder()
			.setColor("#4b0082") // Indigo, for a mystical feel
			.setTitle("A Cursed Choice...")
			.setDescription("Your fingers close around the BALLS, its cursed energy pulsing against your skin...")
		await interaction.followUp({ embeds: [embedFirst] })

		const randomNumber = Math.floor(Math.random() * 100) + 1
		let isballs = false

		await updateUserCursedEnergy(userId, 45)
		await removeItemFromUserInventory(userId, item.name, 1)

		if (randomNumber <= 20) {
			await addUserTechnique(userId, "Disaster Flames: Full Fire Formation")
			isballs = true
		}
		setTimeout(async () => {
			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000")
				.setTitle("Power or Peril?")
				.setDescription(
					"As jogo watches you consume the balls, You begin to feel an overwhelming power surge within..."
				)

			await interaction.editReply({ embeds: [embedSecond] })
		}, 2000) // 40000 milliseconds delay

		setTimeout(async () => {
			let embedSecond
			if (isballs) {
				embedSecond = new EmbedBuilder()
					.setColor("#4b0082")
					.setTitle("A Dark Pact Forged")
					.setDescription(
						"The deed is done, You consume the balls as jogo cries in the distance. You feel a new technique burning within.."
					)
					.setImage(
						"https://preview.redd.it/is-jogo-a-top-10-character-v0-a1vtlv29tltb1.jpg?width=640&crop=smart&auto=webp&s=0c1c7bb3bf807b812e685e224a36cb96a229bf36"
					)
			} else {
				embedSecond = new EmbedBuilder()
					.setColor("#006400")
					.setTitle("Balls unleashed")
					.setDescription(
						"The deed is done. You've gained 300 experience. Why did you eat the balls? What have you done?"
					)
			}
			await interaction.editReply({ embeds: [embedSecond] })
		}, 4000)
		return
	}
	//
	//
	//
	// Adding suspense and thematic depth for the "Sukuna Finger"
	if (itemName === "Sukuna Finger") {
		await interaction.deferReply()
		const embedFirst = new EmbedBuilder()
			.setColor("#4b0082") // Indigo, for a mystical feel
			.setTitle("A Cursed Choice...")
			.setDescription(
				"Your fingers close around the Sukuna Finger, its cursed energy pulsing against your skin..."
			)
			.setImage(
				"https://64.media.tumblr.com/0cea3174e65fc444a9d13e75b8b9b23b/0f084cff6a7abfcb-76/s500x750/cc910e95dece3ee58a36d4ff8855336cd9dc357e.gif"
			) // Add a fitting image URL
		await interaction.followUp({ embeds: [embedFirst] })

		const randomNumber = Math.floor(Math.random() * 100) + 1
		let isDemonVessel = false

		await updateUserCursedEnergy(userId, 45)
		await removeItemFromUserInventory(userId, item.name, 1)

		if (randomNumber <= 20) {
			await updateUserClan(userId, "Demon Vessel")
			await updateUserAchievements(userId, "becursedDemonVessel")
			await addUserTechnique(userId, "World Cutting Slash")
			await addUserQuestProgress(userId, "Curse King", 1)
			await updateUserrHealth(userId, 25)
			isDemonVessel = true
		}
		setTimeout(async () => {
			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000")
				.setTitle("Power or Peril?")
				.setDescription(
					"With a decisive motion, you consume the finger, feeling an overwhelming power surge within..."
				)
				.setImage("https://i.makeagif.com/media/12-06-2023/jn6fNF.gif") // Image URL of the consumption

			await interaction.editReply({ embeds: [embedSecond] })
		}, 2000) // 40000 milliseconds delay

		setTimeout(async () => {
			let embedSecond
			if (isDemonVessel) {
				embedSecond = new EmbedBuilder()
					.setColor("#4b0082")
					.setTitle("A Dark Pact Forged")
					.setDescription(
						"The pact is sealed. Darkness embraces you, as you feel an ancient power coursing through your veins. 𝓨𝓸𝓾 𝓱𝓪𝓿𝓮 𝓫𝓮𝓮𝓷 𝓬𝓾𝓻𝓼𝓮𝓭.."
					)
					.setImage("https://media1.tenor.com/m/mzqdk4E2KVwAAAAC/sukuna-jjk.gif")
			} else {
				embedSecond = new EmbedBuilder()
					.setColor("#006400")
					.setTitle("Power Unleashed")
					.setDescription(
						"The deed is done. You've gained 125 experience. What dark powers have you awakened?"
					)
					.setImage(
						"https://64.media.tumblr.com/59312918933aab3c9330302112a04c79/57360a58ce418849-17/s540x810/bdc0f44011a25a630b7e1f9dd857f9a9376bca7b.gif"
					)
			}
			await interaction.editReply({ embeds: [embedSecond] })
		}, 4000)
		return
	}
	//
	//
	//
	if (itemName === "Six Eyes") {
		await interaction.deferReply()
		const embedFirst = new EmbedBuilder()
			.setColor("#4b0082") // Indigo, for a mystical feel
			.setTitle("A Mystical Choice...")
			.setDescription(
				"You stare into the Six Eyes, its cursed energy pulsing against your skin... And the uneasy feeling of infinity.."
			)
			.setImage(
				"https://media.discordapp.net/attachments/1094302755960664255/1222646394712494233/Six_Eyes.png?ex=6616f930&is=66048430&hm=1fbf6d80da6ec411ed12995d2c44feeb9f276bc51c9d33121671cc6473600697&=&format=webp&quality=lossless"
			) // Add a fitting image URL
		await interaction.followUp({ embeds: [embedFirst] })

		const randomNumber = Math.floor(Math.random() * 100) + 1
		let isLimitless = false

		await updateUserCursedEnergy(userId, 45)
		await removeItemFromUserInventory(userId, item.name, 1)

		if (randomNumber <= 30) {
			await updateUserClan(userId, "Limitless")
			await updateUserAchievements(userId, "behonoredLimitless")
			await addUserTechnique(userId, "Imaginary Technique: Purple")
			await addUserQuestProgress(userId, "The Honored One", 1)
			await updateUserrHealth(userId, 30)
			isLimitless = true
		}
		setTimeout(async () => {
			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000") // Dark red, for dramatic effect
				.setTitle("Power or Peril?")
				.setDescription(
					"As you stare into the Six Eyes, you feel an overwhelming power surge within... The uneasy feeling of limitless thoughts.."
				)
				.setImage("https://media1.tenor.com/m/LsBSgRXRgZ4AAAAd/jjk-jujutsu.gif") // Image URL of the consumption

			// Now, edit the reply with the new embed after the delay
			await interaction.editReply({ embeds: [embedSecond] })
		}, 2000) // 40000 milliseconds delay

		setTimeout(async () => {
			let embedSecond
			if (isLimitless) {
				// Special embed for Demon Vessel
				embedSecond = new EmbedBuilder()
					.setColor("#4b0082")
					.setTitle("????")
					.setDescription(
						"The swirling, malevolent auras of limitless cursed energy blaze before your eyes, their intensity scorching your senses. Your expanding knowledge of jujutsu opens your mind, unlocking a terrifying new depth of perception.. 𝓨𝓸𝓾 𝓱𝓪𝓿𝓮 𝓫𝓮𝓮𝓷 𝓻𝓮𝓪𝔀𝓸𝓴𝓮𝓷"
					)
					.setImage("https://media1.tenor.com/m/sr0GO11Kbf0AAAAC/gojo-satoru.gif")
			} else {
				// Generic response for non-Demon Vessel outcome
				embedSecond = new EmbedBuilder()
					.setColor("#006400") // Dark green, symbolizing growth
					.setTitle("Power Unleashed")
					.setDescription(
						"The deed is done. You've gained 175 experience. What mystical powers have you awakened?"
					)
					.setImage("https://media1.tenor.com/m/PdBdd7PZg7AAAAAd/jjk-jujutsu-kaisen.gif") // An image URL showing the unleashed power
			}
			await interaction.editReply({ embeds: [embedSecond] })
		}, 4000)
	} else {
		// Handle other items or general case
		const embed = new EmbedBuilder()
			.setColor("#FFFF00")
			.setTitle("No Effect")
			.setDescription(`You ponder the use of ${itemName}, but it seems to hold no significance.`)
		await interaction.reply({ embeds: [embed], ephemeral: true })
	}
	return
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
			version: "Update 2.5.1", // Replace with your actual version number
			date: "2024-03-26", // Adjust the date as needed
			changes: [
				{
					name: "Technique System",
					value: "Users can now acquire and develop unique Jujutsu techniques!"
				},
				{
					name: "Technique Shop",
					value: "Spend hard-earned currency to unlock powerful abilities."
				},
				{
					name: "Heavenly Restriction Rework",
					value: "Characters with Heavenly Restriction gain access to specialized skills."
				},
				{
					name: "Fight Command Overhaul",
					value: "Completely revamped the fight command for a smoother and more strategic battle experience."
				},
				{
					name: "Grade System Fixes",
					value: "Resolved issues with the grade system's functionality and accuracy."
				},
				{
					name: "Fixing all bugs, Most have been fixed!",
					value: "Fight, Dig, Work, < Fixed. as for the thinking bug it's still being worked on. :D"
				},
				{
					name: "Found a bug? Report it!",
					value: "If you've found any bugs or issues, please report them in the support server. > /support <"
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

// clan information embed
export async function handleClanInfoCommand(interaction: ChatInputCommandInteraction) {
	const clanEmbed = new EmbedBuilder()
		.setTitle("Clan Information")
		.setDescription(
			"Here is some info about the clans. Each come with their own unique abilities and perks. [ WIP Still, when the fight command gets reworked they'll be used and for future stuff. ]"
		)
		.setColor("#0099ff")
		.addFields(
			{
				name: "Demon Vessel",
				value: "Access to Cleave, Dismantle, Fire Arrow."
			},
			{
				name: "Fushiguro",
				value: "Access to Ten Shadows Technique, Including Mahoraga."
			},
			{
				name: "Limitless User",
				value: "Throughout heaven and earth..."
			},
			{
				name: "Zenin",
				value: "Access to zenin style etc."
			}
		)

	await interaction.reply({ embeds: [clanEmbed], ephemeral: true })
}

// jujutsu stats embed that fetches your clan your techniques your domain and your heavenly restriction
export async function handleJujutsuStatsCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id

	try {
		const userClan = await getUserClan(userId)
		const userHeavenlyRestriction = await checkUserHasHeavenlyRestriction(userId)
		const userEnergy = await getUserCursedEnergy(userId)
		let userTechniques = await (userHeavenlyRestriction
			? getUserHeavenlyTechniques(userId)
			: getUserTechniques(userId))
		const userDomain = await getUserDomain(userId)

		// Function to simplify technique names
		// eslint-disable-next-line no-inner-declarations
		function simplifyTechniqueName(fullName) {
			const nameMap = {
				"Ten Shadows Technique: Eight-Handled Sword Divergent Sila Divine General Mahoraga":
					"Divine General Mahoraga"
			}
			return nameMap[fullName] || fullName
		}

		// Ensure userTechniques is defined and is an array before proceeding
		userTechniques = Array.isArray(userTechniques) ? userTechniques : []
		if (userDomain && userDomain !== "None") {
			userTechniques.unshift(`Domain Expansion: ${userDomain}`)
		}

		const techniquesDisplay =
			userTechniques.length > 0
				? userTechniques.map(technique => `• ${simplifyTechniqueName(technique)}`).join("\n")
				: "None"

		const embed = new EmbedBuilder()
			.setTitle(`${interaction.user.username}'s Jujutsu Profile`)
			.setColor("#4B0082")
			.setDescription("Dive into the depth of your Jujutsu prowess. Here are your current stats, sorcerer.")
			.addFields(
				{ name: "🔥 **Clan**", value: userClan || "None", inline: true },
				{ name: "🌀 **Techniques & Domain Expansion**", value: techniquesDisplay, inline: false },
				{
					name: "🤫 **Cursed Energy**",
					value: `${userEnergy.toString()} units ${userEnergy > 1000 ? "🔥" : ""}`,
					inline: true
				},
				{
					name: "⚖️ **Heavenly Restriction**",
					value: userHeavenlyRestriction ? "Active" : "Inactive",
					inline: true
				}
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
				}
			}
		})
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

	// Dynamically set the title and description based on the topic
	switch (topic) {
		case "crafting":
			guideEmbed
				.setTitle("Crafting Guide")
				.setDescription("Here's how you can craft items in the Jujutsu Kaisen Bot...")
				.addFields(
					// Add crafting-specific instructions here
					{
						name: "Basic Crafting",
						value: "To start crafting, use `/craft [item]`. You'll need the right materials."
					}
					// More fields as necessary
				)
			break
		case "technique":
			guideEmbed
				.setTitle("Technique Guide")
				.setDescription("Here's how you can aquire techniques in the Jujutsu Kaisen Bot...")
				.addFields(
					// Add crafting-specific instructions here
					{
						name: "Techniques",
						value: "To start learning techniques, use `/techniqueshop`. You'll need the right materials. And money."
					}
					// More fields as necessary
				)
			break
		case "jobs":
			guideEmbed.setTitle("Jobs Information").setDescription("All info on jobs")

			// Iterate over the jobs array to add each job as a field
			jobs.forEach(job => {
				// Format the job's details
				const jobDetails =
					`Payout: $${job.payout.min} - $${job.payout.max}\n` +
					`Cost: $${job.cost}\n` +
					`Required Experience: ${job.requiredExperience}\n` +
					`Cooldown: ${formatCooldown(job.cooldown)}`

				// Add the job as a field to the embed
				guideEmbed.addFields({
					name: job.name,
					value: jobDetails,
					inline: true // Set to false if you prefer each job to be listed one after the other without side-by-side alignment
				})
			})

			// Send or return the embed here...
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
	// Creating an embed message for the vote command
	const voteEmbed = new EmbedBuilder()
		.setColor("#00FFFF") // Cyan color
		.setTitle("Vote for Our Bot!")
		.setDescription("Support us by voting on the following sites:")
		.setTimestamp()
		.setFooter({ text: "Thank you for your support!" })

	// Creating buttons for each voting site
	const voteButtonTopGG = new ButtonBuilder()
		.setLabel("Vote on Top.gg")
		.setStyle(ButtonStyle.Link)
		.setURL("https://top.gg/bot/991443928790335518/vote")

	// Creating an action row and adding the buttons to it
	const row = new ActionRowBuilder().addComponents(voteButtonTopGG)

	// Replying to the /vote command with the embed message and the buttons
	await interaction.reply({ embeds: [voteEmbed], components: [row], ephemeral: true })
}
async function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
export const activeCollectors = new Map()

export async function handleFightCommand(interaction: ChatInputCommandInteraction) {
	await updateUserHealth(interaction.user.id, 100) // Reset user's health to max
	await interaction.deferReply()
	const currentTime = Date.now() // Get current time in milliseconds

	//
	if (activeCollectors.has(interaction.user.id)) {
		const fightStartTime = activeCollectors.get(interaction.user.id)

		if (currentTime - fightStartTime > 40000) {
			activeCollectors.set(interaction.user.id, currentTime) // Update the start time for the new fight
		} else {
			await interaction.editReply({
				content: "You already have an ongoing fight. Please finish it before starting a new one."
			})
			return
		}
	}
	console.log("one")

	activeCollectors.set(interaction.user.id, true)

	const usergrade = await getUserGrade(interaction.user.id)
	const allBosses = await getBosses(usergrade)

	//
	if (allBosses.length === 0) {
		console.error("No bosses found in the database.")
		return
	}

	// Select random opponent
	const randomIndex = Math.floor(Math.random() * allBosses.length)
	const randomOpponent = allBosses[randomIndex]

	const cursedEnergyPurple = parseInt("#8A2BE2".replace("#", ""), 16) // Convert hex string to number
	const playerHealth = await getUserHealth(interaction.user.id)
	const hasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(interaction.user.id)

	// Fetch techniques based on whether the user has Heavenly Restriction
	const userTechniques = hasHeavenlyRestriction
		? await getUserHeavenlyTechniques(interaction.user.id)
		: await getUserTechniques(interaction.user.id)

	const battleOptions = [
		{
			label: "Domain Expansion",
			value: "domain",
			emoji: {
				name: "1564maskedgojode", // Replace with your emoji's name
				id: "1220626413141622794" // Replace with your emoji's ID
			}
		},
		{
			label: "Punch",
			value: "punch"
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
		.setDescription(`Your opponent is ${randomOpponent.name}! Prepare yourself.`)
		.setImage(randomOpponent.image_url)
		.addFields({ name: "Boss Health", value: randomOpponent.current_health.toString() })
		.addFields({ name: "Player Health", value: playerHealth.toString() }) // Add player's health
		.addFields({ name: "Enemy Technique", value: "Enemy technique goes here" }) // Add enemy's technique
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

	console.log("two")

	// Handle user selection
	const battleOptionSelectMenuCollector = interaction.channel.createMessageComponentCollector({
		filter: inter => inter.customId === "select-battle-option" && inter.message.interaction.id === interaction.id,
		componentType: ComponentType.StringSelect,
		time: 60000 // 60 seconds
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
			console.log("two two")

			try {
				const hasHeavenlyRestriction = await checkUserHasHeavenlyRestriction(interaction.user.id)

				if (hasHeavenlyRestriction) {
					await collectedInteraction.followUp({
						content: "Your Heavenly Restriction negates the use of domain expansion.",
						ephemeral: true
					})
					return // Exit if Heavenly Restriction is present, or adjust as needed
				}
				console.log("three")

				const domainInfo = await getUserDomain(interaction.user.id)
				if (!domainInfo) {
					await collectedInteraction.followUp({
						content: "You do not have a domain unlocked yet.",
						ephemeral: true
					})
					return
				}
				console.log("four")

				const domainEffectMessage = "Domain activated! [You feel a surge of power! +50% DMG]"

				const domainObject = DOMAIN_EXPANSIONS.find(domain => domain.name === domainInfo)
				if (!domainObject) {
					console.error("Invalid domain found in the database.")
					return
				}
				domainActivationState.set(contextKey, true)
				// embed here
				const domainEmbed = new EmbedBuilder()
					.setColor("Blue")
					.setTitle(`${interaction.user.username} has activated their domain!`)
					.setDescription(`Domain: ${domainInfo}`)
					.addFields(
						{ name: "Enemy Health", value: randomOpponent.current_health.toString(), inline: false },
						{ name: "Your Health", value: playerHealth.toString(), inline: false },
						{ name: "Domain Effect", value: domainEffectMessage },
						{ name: "Enemy Technique", value: "Enemy technique goes here" }
					)
				//add image
				if (domainObject.image_URL) {
					domainEmbed.setImage(domainObject.image_URL)
				} else {
					console.log("No image found for domain expansion.")
				}
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

				// result message
				const fightResult = await handleFightLogic(interaction, randomOpponent, playerGradeString, totalDamage)
				primaryEmbed.setDescription(fightResult)
				primaryEmbed.setFields(
					{ name: "Boss Health", value: randomOpponent.current_health.toString() },
					{ name: "Player Health", value: playerHealth.toString() }
				)
				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
				console.log("five")

				// is boss dead?
				if (randomOpponent.current_health <= 0) {
					// Check if the boss is Gojo
					if (randomOpponent.name === "Satoru Gojo") {
						const random = Math.random()

						if (random < 0.5) {
							randomOpponent.name = "The Honored One"
							randomOpponent.current_health = randomOpponent.max_health // Reset health to max
							updateUserHealth(interaction.user.id, 100) // Reset player health to max

							primaryEmbed.setDescription("Gojo has reawakened as The Honored One!")
							primaryEmbed.setImage(
								"https://media1.tenor.com/m/TQWrKGuC9GsAAAAC/gojo-satoru-the-honored-one.gif"
							)
							primaryEmbed.setFields(
								{ name: "Boss Health", value: randomOpponent.current_health.toString() },
								{ name: "Player Health", value: playerHealth.toString() }
							)
							await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
							console.log("six")

							// Don't end the fight
							return
						}
					} else if (randomOpponent.name === "Megumi Fushiguro") {
						// Generate a random number between 0 and 1
						const random = Math.random()

						// 20% chance to respawn as The Honored One
						if (random < 0.4) {
							randomOpponent.name = "Mahoraga"
							randomOpponent.current_health = randomOpponent.max_health // Reset health to max
							updateUserHealth(interaction.user.id, 100) // Reset player health to max

							primaryEmbed.setDescription("Megumi has summoned mahoraga!")
							primaryEmbed.setImage(
								"https://media1.tenor.com/m/Rws8n4bYKLIAAAAC/jujutsu-kaisen-shibuya-arc-mahoraga-shibuya.gif"
							)
							primaryEmbed.setFields(
								{ name: "Boss Health", value: randomOpponent.current_health.toString() },
								{ name: "Player Health", value: playerHealth.toString() }
							)
							await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
							console.log("7")

							// Don't end the fight
							return
						}
					}
					domainActivationState.set(contextKey, false)
					activeCollectors.delete(interaction.user.id)

					// reset health
					bossHealthMap.delete(interaction.user.id)

					await handleBossDeath(interaction, primaryEmbed, row, randomOpponent)
				}
				await collectedInteraction.editReply({ embeds: [domainEmbed], components: [row] })
				console.log("8")
			} catch (error) {
				console.error("Error during fight command:", error)
				await collectedInteraction.followUp({
					content: "An error occurred during the fight. Please try again later.",
					ephemeral: true
				})
			}
			console.log("9")
		} else if (selectedValue === "punch") {
			// Get player's health

			// get boss hp
			const currentBossHealth = bossHealthMap.get(interaction.user.id) || randomOpponent.max_health

			// grade
			const playerGradeData = await getUserGrade(interaction.user.id)
			const playerGradeString = playerGradeData

			// calculate damage
			const damage = calculateDamage(playerGradeString, interaction.user.id, true)
			// update boss hp
			bossHealthMap.set(interaction.user.id, Math.max(0, currentBossHealth - damage))
			randomOpponent.current_health = Math.max(0, currentBossHealth - damage)

			// result message
			const fightResult = await handleFightLogic(interaction, randomOpponent, playerGradeString, damage)
			primaryEmbed.setDescription(fightResult)
			primaryEmbed.setFields(
				{ name: "Boss Health", value: randomOpponent.current_health.toString() },
				{ name: "Player Health", value: playerHealth.toString() }
			)
			try {
				//await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
			} catch (err: unknown) {
				console.error(err?.toString())
			}
			console.log("12", randomOpponent.name)
			// is boss dead?
			if (randomOpponent.current_health <= 0) {
				console.log("13", randomOpponent.name)
				// Check if the boss is Gojo
				if (randomOpponent.name === "Satoru Gojo") {
					console.log("14", randomOpponent.name)
					// Generate a random number between 0 and 1
					const random = Math.random()

					// 20% chance to respawn as The Honored One
					if (random < 0.5) {
						console.log("15", randomOpponent.name)
						randomOpponent.name = "The Honored One"
						randomOpponent.current_health = randomOpponent.max_health // Reset health to max
						updateUserHealth(interaction.user.id, 100) // Reset player health to max
						console.log("16", randomOpponent.name)
						primaryEmbed.setDescription("Gojo has reawakened as The Honored One!")
						primaryEmbed.setImage(
							"https://media1.tenor.com/m/TQWrKGuC9GsAAAAC/gojo-satoru-the-honored-one.gif"
						)
						primaryEmbed.setFields(
							{ name: "Boss Health", value: randomOpponent.current_health.toString() },
							{ name: "Player Health", value: playerHealth.toString() }
						)
						console.log("17", randomOpponent.name)
						await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
						console.log("18", randomOpponent.name)
						return
					}
				} else if (randomOpponent.name === "Megumi Fushiguro") {
					console.log("19", randomOpponent.name)
					// Generate a random number between 0 and 1
					const random = Math.random()

					// 20% chance to respawn as The Honored One
					if (random < 0.4) {
						randomOpponent.name = "Mahoraga"
						randomOpponent.current_health = randomOpponent.max_health // Reset health to max
						updateUserHealth(interaction.user.id, 100) // Reset player health to max

						primaryEmbed.setDescription("Megumi has summoned Mahoraga!")
						primaryEmbed.setImage(
							"https://media1.tenor.com/m/Rws8n4bYKLIAAAAC/jujutsu-kaisen-shibuya-arc-mahoraga-shibuya.gif"
						)
						primaryEmbed.setFields(
							{ name: "Boss Health", value: randomOpponent.current_health.toString() },
							{ name: "Player Health", value: playerHealth.toString() }
						)
						await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
						return
					}
				}
				console.log("20", randomOpponent.name)
				domainActivationState.set(contextKey, false)
				activeCollectors.delete(interaction.user.id)

				// reset health
				bossHealthMap.delete(interaction.user.id)

				await handleBossDeath(interaction, primaryEmbed, row, randomOpponent)
			} else {
				//
				bossHealthMap.set(interaction.user.id, randomOpponent.current_health)
				await delay(700)
				// boss attack
				const possibleAttacks = attacks[randomOpponent.name]
				const chosenAttack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)]
				// dmg
				const damageToPlayer = chosenAttack.baseDamage
				//
				const newPlayerHealth = playerHealth - damageToPlayer
				const clampedPlayerHealth = Math.max(0, newPlayerHealth)
				//did bro die?
				if (clampedPlayerHealth <= 0) {
					const bossAttackMessage = `${randomOpponent.name} killed you!`
					primaryEmbed.setFooter({ text: bossAttackMessage })

					// Reset player health in the database.
					activeCollectors.delete(interaction.user.id)
					bossHealthMap.delete(interaction.user.id)
					await updateUserHealth(interaction.user.id, 100)
					await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
					// Send an additional ephemeral message indicating the player has died
					await collectedInteraction.followUp({
						content: `${randomOpponent.name} killed you!`,
						ephemeral: true
					})
				} else {
					// Update to new player health after damage dealt
					await updateUserHealth(interaction.user.id, clampedPlayerHealth)
					//
					const bossAttackMessage = `${randomOpponent.name} dealt ${damageToPlayer} damage to you with ${chosenAttack.name}!`
					primaryEmbed.addFields({ name: "Enemy Technique", value: bossAttackMessage }) // Add enemy's technique

					await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
				}
			}
		} else {
			console.log("10")
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
			} else if (selectedValue === "Prayer Song") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 5,
					imageUrl:
						"https://cdn.discordapp.com/attachments/1094302755960664255/1224830505686532146/FAG.png?ex=661eeb4c&is=660c764c&hm=ade3b67e94899e4c951f42269c6b95ee88046e727357d58b2900cccbc691577c&",
					description: "**You move to the rythem of your opponent.. This truly is a terryfying technique**",
					fieldValue: selectedValue,
					userTechniques,
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
					imageUrl: "https://media1.tenor.com/m/4Sks7q4iU8UAAAAC/sukuna-jogo.gif",
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
					damageMultiplier: 2,
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
			} else if (selectedValue === "Imaginary Technique: Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 3,
					imageUrl:
						"https://media1.tenor.com/m/whbTruPpfgkAAAAC/imaginary-technique-imaginary-technique-purple.gif",
					description:
						"Sorry, Amanai I;m not even angry over you right now. I bear no grudge against anyone. But the world is just so peaceful.\n **Throughout heaven and earth, I alone am the honored one.**",
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
					damageMultiplier: 3,
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
					damageMultiplier: 3,
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
				{ name: "Boss Health", value: randomOpponent.current_health.toString() },
				{ name: "Player Health", value: playerHealth.toString() }
			)
			try {
				//await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
			} catch (err: unknown) {
				console.error(err?.toString())
			}
			console.log("12", randomOpponent.name)
			// is boss dead?
			if (randomOpponent.current_health <= 0) {
				console.log("13", randomOpponent.name)
				domainActivationState.set(contextKey, false)
				activeCollectors.delete(interaction.user.id)
				bossHealthMap.delete(interaction.user.id)
				if (randomOpponent.name === "Hakari Kinji") {
					await addUserQuestProgress(interaction.user.id, "Gamblers Fever", 1)
				}
				await handleBossDeath(interaction, primaryEmbed, row, randomOpponent)
			} else {
				//
				bossHealthMap.set(interaction.user.id, randomOpponent.current_health)
				await delay(700)
				// boss attack
				const possibleAttacks = attacks[randomOpponent.name]
				const chosenAttack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)]
				// dmg
				const damageToPlayer = chosenAttack.baseDamage
				//
				const newPlayerHealth = playerHealth - damageToPlayer
				const clampedPlayerHealth = Math.max(0, newPlayerHealth)
				//did bro die?
				if (clampedPlayerHealth <= 0) {
					const bossAttackMessage = `${randomOpponent.name} killed you!`
					primaryEmbed.setFooter({ text: bossAttackMessage })

					// Reset player health in the database.
					activeCollectors.delete(interaction.user.id)
					bossHealthMap.delete(interaction.user.id)
					await updateUserHealth(interaction.user.id, 100)
					await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
					// Send an additional ephemeral message indicating the player has died
					await collectedInteraction.followUp({
						content: `${randomOpponent.name} killed you!`,
						ephemeral: true
					})
					battleOptionSelectMenuCollector.stop()
				} else {
					// Update to new player health after damage dealt
					await updateUserHealth(interaction.user.id, clampedPlayerHealth)
					//
					const bossAttackMessage = `${randomOpponent.name} dealt ${damageToPlayer} damage to you with ${chosenAttack.name}!`
					primaryEmbed.addFields({ name: "Enemy Technique", value: bossAttackMessage }) // Add enemy's technique

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
		.setDescription("Current bot stats, updated every minute.")
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
			await updateBalance(userId, betAmount * 2) // Win: simply return the bet amount for demonstration
			resultMessage = `🪙 It landed on ${result}! You've doubled your bet and won $${formatNumberWithCommas(
				betAmount * 2
			)} coins!`
		} else {
			await updateBalance(userId, -betAmount)
			resultMessage = `🪙 It landed on ${
				result === "Heads" ? "Tails" : "Heads"
			}! You lost $${formatNumberWithCommas(betAmount)} coins.`
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

	if (questsArray.length === 0) {
		throw new Error("There are no available quests.")
	}

	const questOptions = questsArray.map(quest => ({
		label: quest.name,
		value: quest.name,
		description: quest.description
	}))

	// Ensure questOptions has between 1 and 25 elements
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
			console.log(selectedquestname)
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
		const userQuests = await getUserQuests(userId)

		const completedQuests = userQuests.quests.filter(q => {
			const questDetails = questsArray.find(quest => quest.name === q.id)
			return questDetails && q.progress >= questDetails.totalProgress
		})

		if (completedQuests.length === 0) {
			return "You have no completed quests to claim."
		}

		const claimResults = []

		for (const completedQuest of completedQuests) {
			const questDetails = questsArray.find(quest => quest.name === completedQuest.id)

			const { coins, item, experience } = questDetails

			const balanceUpdateResult = await updateBalance(userId, coins)
			const addItemResult = await addItemToUserInventory(userId, item, 1)
			const experienceUpdateResult = await updateUserExperience(userId, experience)
			const playerGradeUpdateResult = await updatePlayerGrade(userId)

			const questRemovalResult = await removeUserQuest(userId, completedQuest.id)

			// Add results to claimResults
			claimResults.push({
				questId: completedQuest.id,
				balanceUpdateResult,
				addItemResult,
				experienceUpdateResult,
				playerGradeUpdateResult,
				questRemovalResult
			})
		}

		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Quest Rewards Claimed")
			.setDescription("You have successfully claimed your rewards for the following quests:")

		// Add fields for each completed quest and its rewards
		completedQuests.forEach(completedQuest => {
			const questDetails = questsArray.find(quest => quest.name === completedQuest.id)

			if (questDetails) {
				// Constructing the reward text
				const rewardsText =
					`• **Coins**: ${questDetails.coins} :coin:\n` +
					`• **Item**: ${questDetails.item} x1 :package:\n` +
					`• **Experience**: ${questDetails.experience} :star:`

				// Add a field for each completed quest with its rewards
				embed.addFields({ name: completedQuest.id, value: rewardsText, inline: false })
			}
		})

		await interaction.reply({ embeds: [embed] })
	} catch (error) {
		console.error("Error claiming quests:", error)
		throw new Error("An error occurred while claiming quests.")
	}
}

// view all active quests using getuserquest
export async function viewQuestsCommand(interaction) {
	const userId = interaction.user.id
	const userQuests = await getUserQuests(userId)

	if (userQuests.quests.length === 0) {
		return "You have no active quests."
	}

	const embed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle("Active Quests")
		.setDescription("Here are your currently active quests:")

	userQuests.quests.forEach(quest => {
		const questDetails = questsArray.find(q => q.name === quest.id)
		if (questDetails) {
			const progress = quest.progress
			const totalProgress = questDetails.totalProgress

			const progressText = `${progress}/${totalProgress}`

			embed.addFields({
				name: quest.id,
				value: `**Progress**: ${progressText}\n**Task**: ${questDetails.task}`,
				inline: false
			})
		}
	})

	await interaction.reply({ embeds: [embed] })
}
