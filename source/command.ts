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
import { BossData, determineDomainAchievements, formatDomainExpansion, gradeMappings } from "./interface.js"
import {
	CLAN_SKILLS,
	DOMAIN_EXPANSIONS,
	allAchievements,
	craftingRecipes,
	dailyitems,
	getRandomItem,
	heavenlyrestrictionskills,
	jobs,
	lookupItems
} from "./items jobs.js"
import { getJujutsuFlavorText } from "./jujutsuFlavor.js"
import {
	addItemToUserInventory,
	addUser,
	addUserTechnique,
	awardTitlesForAchievements,
	checkUserHasHeavenlyRestriction,
	getAllUserExperience,
	getBalance,
	getBosses,
	getUserAchievements,
	getUserClan,
	getUserCursedEnergy,
	getUserDailyData,
	getUserDomain,
	getUserGrade,
	getUserHealth,
	getUserHeavenlyTechniques,
	getUserInventory,
	getUserProfile,
	getUserTechniques,
	getUserUnlockedTitles,
	removeItemFromUserInventory,
	updateBalance,
	updatePlayerGrade,
	updateUserAchievements,
	updateUserClan,
	updateUserCursedEnergy,
	updateUserDailyData,
	updateUserDomainExpansion,
	updateUserExperience,
	updateUserHealth,
	updateUserHeavenlyRestriction,
	updateUserHeavenlyTechniques,
	updateUserJob,
	updateUserTitle,
	userExists
} from "./mongodb.js"

const domainActivationState = new Map()
const userJobCooldowns = new Map()
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
	const userId = interaction.user.id

	const createProfileEmbed = async userId => {
		const userProfile = await getUserProfile(userId)
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
			.setTitle(`Jujutsu Profile: ${interaction.user.username} 🌀`)
			.setThumbnail(interaction.user.displayAvatarURL())
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
		const profileEmbed = await createProfileEmbed(userId)
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
		await updateBalance(interaction.user.id, selectedJob.cost * -1)
		if (!updateSuccess) {
			await interaction.editReply({
				content: "Error: Could not update your job. Please try again later.",
				components: []
			})
			return
		}

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

	// Find the job object based on the user's current job
	const currentJob = jobs.find(job => job.name === currentJobName)

	// Ensure we have a valid job object before proceeding
	if (!currentJob) {
		await interaction.reply({ content: "Error: Invalid job specified.", ephemeral: true })
		return
	}

	const currentTime = Date.now()

	// Initialize cooldown tracking for the user if it doesn't exist
	if (!userJobCooldowns.has(userId)) {
		userJobCooldowns.set(userId, {})
	}

	const userCooldowns = userJobCooldowns.get(userId)

	// Get the last work time for the current job, or 0 if it's the first time
	const lastWorkTime = userCooldowns[currentJobName] || 0

	if (currentTime - lastWorkTime < currentJob.cooldown) {
		// Calculate the end of the cooldown period for messaging
		const endCooldownTime = Math.floor((lastWorkTime + currentJob.cooldown) / 1000)
		await interaction.reply({
			content: `You're too tired to work as a ${currentJobName} right now. You can work again <t:${endCooldownTime}:R>.`,
			ephemeral: true
		})
		return
	}

	// fag
	const earnings = calculateEarnings(userProfile)
	const experienceGain = getRandomAmount(20, 50) // Random experience gain between 20 and 50

	// Update user balance
	await updateBalance(userId, earnings)
	await updateUserExperience(userId, experienceGain)
	await updatePlayerGrade(interaction.user.id) // Update the player's grade based on new XP

	// Set new cooldown
	userCooldowns[currentJobName] = currentTime
	userJobCooldowns.set(userId, userCooldowns)

	// Reply with the earnings
	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle("Work Completed")
		.setDescription(`You worked hard as a ${userProfile.job} and earned **${earnings}** coins!`)
		.setTimestamp()

	await interaction.reply({ embeds: [embed] })
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
			.setColor(0x00ff00) // Green color
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

	if (!itemName) {
		console.log("Item name not provided in command.")
		await interaction.reply({ content: "You must specify the name of the item you wish to use.", ephemeral: true })
		return
	}

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
			await interaction.followUp({ embeds: [embedSecond] })
		}, 2000) // 40000 milliseconds delay

		const xpGained = 225
		await updateUserExperience(userId, xpGained)
		await updatePlayerGrade(userId) // Update the player's grade based on new XP
		await removeItemFromUserInventory(userId, item.name, 1)
		await updateUserHeavenlyRestriction(userId)
		await updateUserAchievements(userId, "unlockHeavenlyRestriction")

		setTimeout(() => {
			const embedFinal = new EmbedBuilder()
				.setColor("#006400") // Dark green, symbolizing growth
				.setTitle("Power Unleashed")
				.setDescription(
					"As the blood enters your body, You feel your cursed energy depleting.. What have you done?"
				)
				.setImage("https://i1.sndcdn.com/artworks-z10vyMXnr9n7OGj4-FyRAxQ-t500x500.jpg") // An image URL showing the unleashed power

			// Edit the reply with the new embed after a delay
			interaction.followUp({ embeds: [embedFinal] }).catch(console.error) // Adding catch to handle any potential errors
		}, 4000)
		return
	}

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

		const xpGained = 125
		await updateUserExperience(userId, xpGained)
		await updateUserCursedEnergy(userId, 45)
		await updatePlayerGrade(userId) // Update the player's grade based on new XP
		await removeItemFromUserInventory(userId, item.name, 1)

		if (randomNumber <= 20) {
			await updateUserClan(userId, "Demon Vessel")
			isDemonVessel = true // Set the flag to true when the user becomes a Demon Vessel
		}
		setTimeout(async () => {
			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000") // Dark red, for dramatic effect
				.setTitle("Power or Peril?")
				.setDescription(
					"With a decisive motion, you consume the finger, feeling an overwhelming power surge within..."
				)
				.setImage("https://i.makeagif.com/media/12-06-2023/jn6fNF.gif") // Image URL of the consumption

			// Now, edit the reply with the new embed after the delay
			await interaction.editReply({ embeds: [embedSecond] })
		}, 2000) // 40000 milliseconds delay

		setTimeout(async () => {
			let embedSecond
			if (isDemonVessel) {
				// Special embed for Demon Vessel
				embedSecond = new EmbedBuilder()
					.setColor("#4b0082")
					.setTitle("A Dark Pact Forged")
					.setDescription(
						"The pact is sealed. Darkness embraces you, as you feel an ancient power coursing through your veins. 𝓨𝓸𝓾 𝓱𝓪𝓿𝓮 𝓫𝓮𝓮𝓷 𝓬𝓾𝓻𝓼𝓮𝓭.."
					)
					.setImage("https://media1.tenor.com/m/mzqdk4E2KVwAAAAC/sukuna-jjk.gif")
			} else {
				// Generic response for non-Demon Vessel outcome
				embedSecond = new EmbedBuilder()
					.setColor("#006400") // Dark green, symbolizing growth
					.setTitle("Power Unleashed")
					.setDescription(
						"The deed is done. You've gained 125 experience. What dark powers have you awakened?"
					)
					.setImage(
						"https://64.media.tumblr.com/59312918933aab3c9330302112a04c79/57360a58ce418849-17/s540x810/bdc0f44011a25a630b7e1f9dd857f9a9376bca7b.gif"
					) // An image URL showing the unleashed power
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
				// Add other names that need simplifying here
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

		await interaction.reply({ embeds: [embed] })
	} catch (error) {
		console.error("Error handling JujutsuStatsCommand:", error)
		await interaction.reply({
			content: "An unexpected error occurred while retrieving your Jujutsu profile. Please try again later.",
			ephemeral: true
		})
	}
}

// guide command
export async function handleGuideCommand(interaction: ChatInputCommandInteraction) {
	const guideEmbed = new EmbedBuilder()
		.setTitle("Jujutsu Kaisen Bot Guide")
		.setDescription(
			"Welcome to the Jujutsu Kaisen Bot! Here are some commands you can use to interact with the bot. [ Very WIP ]"
		)
		.setColor("#0099ff")
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

	await interaction.reply({ embeds: [guideEmbed], ephemeral: true })
}

export async function handleLeaderBoardCommand(interaction) {
	try {
		const userExperiences = await getAllUserExperience()
		userExperiences.sort((a, b) => b.experience - a.experience)

		// Create an embed for the leaderboard
		const leaderboardEmbed = new EmbedBuilder()
			.setColor("#00FF00") // A vibrant color
			.setTitle("🏆 Leaderboard - Top Performers 🏆")
			.setDescription("Here are the top performers based on XP earned:")
			.setTimestamp()

		// Use emojis or icons for rankings
		const rankEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

		// Limiting to top 10 for conciseness
		userExperiences.slice(0, 10).forEach((user, index) => {
			const rank = rankEmojis[index] ? rankEmojis[index] : index + 1
			const text = `${rank} <@${user.id}> - **${user.experience} XP**`
			// For the first three, consider adding more flair or details
			if (index < 3) {
				leaderboardEmbed.addFields({ name: `Top ${index + 1}`, value: text, inline: false })
			} else {
				leaderboardEmbed.addFields({ name: "\u200B", value: text, inline: false }) // \u200B is a zero-width space
			}
		})

		// Reply with the leaderboard
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
	await updateUserHealth(interaction.user.id, 100) // Set user's health to 100
	await interaction.deferReply()
	if (activeCollectors.has(interaction.user.id)) {
		await interaction.editReply({
			content: "You already have an ongoing fight. Please finish it before starting a new one."
		})
		return
	}

	console.log("one")

	activeCollectors.set(interaction.user.id, true)

	const allBosses = await getBosses()

	//
	if (allBosses.length === 0) {
		console.error("No bosses found in the database.")
		return // Or handle this situation appropriately
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
		time: 30000 // 60 seconds
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
						// Generate a random number between 0 and 1
						const random = Math.random()

						// 20% chance to respawn as The Honored One
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
						// Don't end the fight
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

						primaryEmbed.setDescription("Megumi has summoned mahoraga!")
						primaryEmbed.setImage(
							"https://media1.tenor.com/m/Rws8n4bYKLIAAAAC/jujutsu-kaisen-shibuya-arc-mahoraga-shibuya.gif"
						)
						primaryEmbed.setFields(
							{ name: "Boss Health", value: randomOpponent.current_health.toString() },
							{ name: "Player Health", value: playerHealth.toString() }
						)
						await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

						// Don't end the fight
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
				console.log("1122")
			} else if (selectedValue === "Hollow Purple") {
				damage = await executeSpecialTechnique({
					collectedInteraction,
					techniqueName: selectedValue,
					damageMultiplier: 2,
					imageUrl: "https://media1.tenor.com/m/kIeDsa7o7VAAAAAC/jjk-red-and-blue.gif",
					description: "Throughout heaven and earth.. I alone am the honored one.",
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
				console.log("1123122")
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
					imageUrl: "https://media1.tenor.com/m/AQ7Hs9jfutAAAAAd/hakari-jujutsu-kaisen.gif",
					description: `TURN UP THE VOLUME ${randomOpponent.name}`,
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
						// Don't end the fight
						return
					}
				} else if (randomOpponent.name === "Megumi Fushiguro") {
					console.log("19", randomOpponent.name)
					// Generate a random number between 0 and 1
					const random = Math.random()

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

						// Don't end the fight
						return
					}
				} else if (randomOpponent.name === "Mahito (Transfigured)") {
					console.log("19", randomOpponent.name)
					// Generate a random number between 0 and 1
					const random = Math.random()

					if (random < 0.2) {
						randomOpponent.name = "Mahito Instant Spirit Body of Distorted Killing"
						randomOpponent.current_health = randomOpponent.max_health // Reset health to max
						updateUserHealth(interaction.user.id, 100) // Reset player health to max

						primaryEmbed.setDescription("Mahito has reached the true essence of his soul!")
						primaryEmbed.setImage("https://media1.tenor.com/m/1tna9DzZLccAAAAd/jjk-jujutsu-kaisen.gif")
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

				battleOptionSelectMenuCollector.stop()
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

	clanOptions = clanOptions.filter(option => option.label && option.value)

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
	const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

	collector.on("collect", async i => {
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
			collector.stop()
		}
	})
	collector.on("end", collected => {
		console.log(`Collected ${collected.size} items`)
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
	const gameType = interaction.options.getString("game") // Assuming "game" is the option name
	const betAmount = interaction.options.getInteger("amount", true)
	const userId = interaction.user.id
	const currentBalance = await getBalance(userId)

	if (betAmount > currentBalance) {
		await interaction.reply("You don't have enough coins to make this bet.")
		return
	}

	const maxBetLimit = 1000000 // Example: Set your individual bet limit

	if (betAmount > maxBetLimit) {
		await interaction.reply(`The maximum bet amount is ${formatNumberWithCommas(maxBetLimit)} coins.`)
		return
	}

	if (gameType === "slot") {
		const betAmount = interaction.options.getInteger("amount", true)

		// Assume getBalance and updateBalance functions are defined elsewhere
		const userId = interaction.user.id // Identifier for the user's balance
		const currentBalance = await getBalance(userId)

		if (betAmount > currentBalance) {
			await interaction.reply("You don't have enough coins to make this bet.")
			return
		}

		// Proceed with the gamble
		const spinResults = spinSlots()
		const didWin = checkWin(spinResults)
		let resultMessage = ""
		let jackpotGIF = "" // Initialize here for broader scope

		if (didWin) {
			// Check if it's a jackpot win
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

		// Add the jackpot GIF to the embed if there is one
		if (jackpotGIF) {
			resultEmbed.setImage(jackpotGIF)
		}

		await interaction.reply({ embeds: [resultEmbed] })
	} else if (gameType === "coinflip") {
		// Coin flip logic
		const coinSides = ["Heads", "Tails"]
		const result = coinSides[Math.floor(Math.random() * coinSides.length)]
		const didWin = Math.random() < 0.5 // 50%

		let resultMessage = ""
		if (didWin) {
			await updateBalance(userId, betAmount) // Win: simply return the bet amount for demonstration
			resultMessage = `🪙 It landed on ${result}! You've doubled your bet and won $${formatNumberWithCommas(
				betAmount * 2
			)} coins!`
		} else {
			await updateBalance(userId, betAmount)
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
	} else {
		// Handle unexpected game type, if necessary
		await interaction.reply("Unknown game type selected.")
	}
}

export async function handleBegCommand(interaction: ChatInputCommandInteraction) {
	const benefactors = [
		{ name: "Satoru Gojo", coins: 30000 },
		{ name: "Kento Nanami", coins: 1500 },
		{ name: "Yuji Itadori", item: "Special Grade Cursed Object", itemQuantity: 1 },
		{ name: "Hakari Kinji", coins: 3000, item: "Gambler Token", itemQuantity: 1 },
		{ name: "Nobara Kugisaki", coins: 3000, item: "Nobara's Right Eye", itemQuantity: 1 }
		// Add more characters and rewards as desired
	]

	const chosenOne = benefactors[Math.floor(Math.random() * benefactors.length)]

	let resultMessage = ""
	if ("coins" in chosenOne) {
		await updateBalance(interaction.user.id, chosenOne.coins)
		resultMessage = `You begged ${
			chosenOne.name
		} and they felt generous, giving you ${chosenOne.coins.toLocaleString()} coins!`
	} else if ("item" in chosenOne) {
		await addItemToUserInventory(interaction.user.id, chosenOne.item, chosenOne.itemQuantity ?? 1)
		resultMessage = `You begged ${chosenOne.name} and they handed you ${chosenOne.itemQuantity ?? 1} x ${
			chosenOne.item
		}!`
	}

	const resultEmbed = new EmbedBuilder()
		.setTitle("Begging Result")
		.setDescription(resultMessage)
		.setColor("#FFD700") // Gold color for a "golden opportunity"
		.setTimestamp()

	await interaction.reply({ embeds: [resultEmbed] })
}
