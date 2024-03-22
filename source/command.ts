let contextKey: string

import { SelectMenuBuilder } from "@discordjs/builders"
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	Interaction,
	SelectMenuInteraction
} from "discord.js"
import { attacks } from "./attacks.js"
import { digCooldown, digCooldownBypassIDs, digCooldowns } from "./bot.js"
import {
	calculateDamage,
	calculateEarnings,
	createInventoryPage,
	getBossDrop,
	getRandomAmount,
	getRandomLocation,
	getRandomXPGain
} from "./calculate.js"
import { BossData, determineDomainAchievements, formatDomainExpansion } from "./interface.js"
import { DOMAIN_EXPANSIONS, allAchievements, craftingRecipes, dailyitems, getRandomItem, jobs } from "./items jobs.js"
import { getJujutsuFlavorText } from "./jujutsuFlavor.js"
import {
	addItemToUserInventory,
	addUser,
	awardTitlesForAchievements,
	getBalance,
	getBosses,
	getUserAchievements,
	getUserBankBalance,
	getUserDailyData,
	getUserDomain,
	getUserGrade,
	getUserHealth,
	getUserInventory,
	getUserProfile,
	getUserUnlockedTitles,
	removeItemFromUserInventory,
	updateBalance,
	updatePlayerGrade,
	updateUserAchievements,
	updateUserDailyData,
	updateUserDomainExpansion,
	updateUserExperience,
	updateUserHealth,
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
	const bankBalance = await getUserBankBalance(user.id)
	const balance = await getBalance(user.id)
	const cursedCoins = balance ? balance.toString() : "0" // Consider formatting for readability
	const cursedBalance = bankBalance ? bankBalance.toString() : "0" // Consider formatting for readability

	const balanceEmbed = new EmbedBuilder()
		.setColor(0xa00000) // A deep red for a mystical, cursed energy vibe
		.setTitle(`${user.username}'s Cursed Energy`)
		.setThumbnail(user.displayAvatarURL()) // Ideally, a thematic image here
		.addFields({ name: "Cursed Bank Balance", value: `${cursedBalance} `, inline: false })
		.addFields({ name: "Cursed Wallet", value: `${cursedCoins} `, inline: false })
		.setFooter({ text: "Spend wisely. Every decision shapes your destiny." })
		.setTimestamp()
	await interaction.editReply({ embeds: [balanceEmbed] })
}

export async function handleProfileCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id

	// Function to create the profile embed
	const createProfileEmbed = async userId => {
		const userProfile = await getUserProfile(userId)
		if (!userProfile) throw new Error("Profile not found.")

		const domainExpansionValue = formatDomainExpansion(userProfile.domain)

		return new EmbedBuilder()
			.setColor(0x1f6b4e) // Changed to a dark green for thematic consistency
			.setTitle(`Jujutsu Profile: ${interaction.user.username} 🌀`)
			.setThumbnail(interaction.user.displayAvatarURL())
			.addFields(
				{ name: "**Title** 🏆", value: userProfile.activeTitle || "None", inline: false },
				{ name: "**Balance** 💰", value: `\`${userProfile.balance.toLocaleString()}\``, inline: false },
				{ name: "**Experience** ✨", value: userProfile.experience.toLocaleString(), inline: false },
				{ name: "**Sorcerer Rank** 🏅", value: userProfile.grade || "Unranked", inline: false },
				{ name: "**Job** 💼", value: userProfile.job || "None", inline: false },
				{ name: "**Domain Expansion** 🌀", value: domainExpansionValue, inline: false }
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
		// Logic for finding an item
		const itemFound = getRandomItem() // Simulate finding a random item
		if (itemFound) {
			await addItemToUserInventory(authorId, itemFound.name, 1)
		}
		// Create the response embed for finding an item
		const digEmbed = new EmbedBuilder()
			.setColor(0x00ff00) // Green color for success
			.setTitle("Digging Results")
			.setDescription(`You unearthed \`⌬${coinsFound}\` coins! **You also found a ${itemFound.name}!**`)
			.setTimestamp()

		await interaction.editReply({ embeds: [digEmbed] })
	} else {
		// Create the response embed for not finding an item
		const digEmbed = new EmbedBuilder()
			.setColor(0x00ff00) // Green color for success
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
			collector.stop()

			collector.on("end", () => {
				// Disable the buttons after interaction
				confirmButton.setDisabled(true)
				cancelButton.setDisabled(true)
				interaction.editReply({
					components: [new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton)]
				})
			})
		})
	} catch (error) {
		console.error("Error in crafting or inventory process:", error)
		await interaction.reply({ content: "There was an error while processing your request.", ephemeral: true })
	}
}

async function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export async function handleFightCommand(interaction: ChatInputCommandInteraction) {
	try {
		// Fetch boss data from database
		const allBosses = await getBosses()

		if (allBosses.length === 0) {
			console.error("No bosses found in the database.")
			return // Or handle this situation appropriately
		}

		// Select random opponent
		const randomIndex = Math.floor(Math.random() * allBosses.length)
		const randomOpponent = allBosses[randomIndex]

		const cursedEnergyPurple = parseInt("#8A2BE2".replace("#", ""), 16) // Convert hex string to number
		const playerHealth = await getUserHealth(interaction.user.id)

		// Create embed
		const primaryEmbed = new EmbedBuilder()
			.setColor(cursedEnergyPurple)
			.setTitle("Cursed Battle!")
			.setDescription(`Your opponent is ${randomOpponent.name}! Prepare yourself.`)
			.setImage(randomOpponent.image_url)
			.addFields({ name: "Health", value: randomOpponent.current_health.toString() })
			.addFields({ name: "Player Health", value: playerHealth.toString() }) // Add player's health
		const remainingHealthPercentage = randomOpponent.current_health / randomOpponent.max_health
		if (remainingHealthPercentage < 0.5) {
			primaryEmbed.setFooter({ text: "The opponent is getting weaker!" })
		}
		// Add JJK Flavor Text based for this boss
		const flavorText = getJujutsuFlavorText(randomOpponent.name)
		if (flavorText) {
			primaryEmbed.addFields([flavorText])
		}

		// Create buttons
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId("fight").setLabel("Fight").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("domain").setLabel("Domain").setStyle(ButtonStyle.Success)
		)

		// Defer reply and send initial message
		await interaction.deferReply()
		const fightMessage = await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		// Button Interaction Logic
		const collector = fightMessage.createMessageComponentCollector({
			filter: buttonInteraction => buttonInteraction.user.id === interaction.user.id
		})

		collector.on("collect", async (buttonInteraction: ButtonInteraction) => {
			if (buttonInteraction.customId === "fight") {
				await buttonInteraction.deferUpdate()

				// Get player's health
				const playerHealth = await getUserHealth(interaction.user.id)

				// get boss health
				const currentBossHealth = bossHealthMap.get(interaction.user.id) || randomOpponent.max_health

				// Get player's grade
				const playerGradeData = await getUserGrade(interaction.user.id)
				const playerGradeString = playerGradeData // This is already in the correct format

				// Calculate damage using the string grade
				const damage = calculateDamage(playerGradeString) // Use the grade string directly

				// Calculate boss new health after damage dealt
				bossHealthMap.set(interaction.user.id, currentBossHealth - damage)
				randomOpponent.current_health = Math.max(0, currentBossHealth - damage) // Keep in sync

				// Construct result message
				const fightResult = await handleFightLogic(interaction, randomOpponent, playerGradeString, damage)
				primaryEmbed.setDescription(fightResult)
				await buttonInteraction.editReply({ embeds: [primaryEmbed] })
				// Is the boss dead?
				if (randomOpponent.current_health <= 0) {
					domainActivationState.set(contextKey, false) // Reset domain activation state
					// Reset health in the database
					bossHealthMap.delete(interaction.user.id)
					const victoryMessage = "You won the fight!"
					primaryEmbed.setDescription(victoryMessage)
					await buttonInteraction.editReply({
						embeds: [primaryEmbed],
						components: []
					})
					// Calculate XP gain
					const xpGain = getRandomXPGain() // Assuming you have this function to get a random XP amount between 10 and 70
					await updateUserHealth(interaction.user.id, 100)
					await updateUserExperience(buttonInteraction.user.id, xpGain)
					await updatePlayerGrade(buttonInteraction.user.id) // Update the player's grade based on new XP

					const drop = getBossDrop(randomOpponent.name)
					if (drop) {
						console.log("Drop found:", drop)

						// Pass drop.name instead of the entire drop object
						await addItemToUserInventory(interaction.user.id, drop.name, 1)
					}

					const privateEmbed = new EmbedBuilder()
						.setColor("#0099ff") // Set the color of the embed
						.setTitle("Battle Rewards") // Set a title for the embed
						.addFields(
							{ name: "Loot Drop", value: `You've also found a ${drop.name} among the remains!` },
							{ name: "Experience Gained", value: `You've gained ${xpGain} XP for defeating the boss!` }
						)

					// Send the embed as an ephemeral follow-up to the button interaction
					await buttonInteraction.followUp({ embeds: [privateEmbed], ephemeral: true })
				} else {
					// Update to new boss health after damage dealt
					bossHealthMap.set(randomOpponent.name, randomOpponent.current_health)

					await delay(700) // Wait for 2 seconds
					// *** Boss Attack ***
					const possibleAttacks = attacks[randomOpponent.name]
					const chosenAttack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)]

					//const damageToPlayer = Math.floor(chosenAttack.baseDamage * Math.random())
					const damageToPlayer = chosenAttack.baseDamage

					// Calculate player new health after damage dealt by boss
					const newPlayerHealth = playerHealth - damageToPlayer

					// Ensure player health is never below 0
					const clampedPlayerHealth = Math.max(0, newPlayerHealth)

					// Did the player die?
					if (clampedPlayerHealth <= 0) {
						// Generic defeat message for other bosses
						const bossAttackMessage = `${randomOpponent.name} killed you!`
						primaryEmbed.setFooter({ text: bossAttackMessage })

						// Reset player health in the database.
						bossHealthMap.delete(interaction.user.id)
						await updateUserHealth(interaction.user.id, 100)
						await buttonInteraction.editReply({ embeds: [primaryEmbed], components: [] })
					} else {
						// Update to new player health after damage dealt
						await updateUserHealth(interaction.user.id, clampedPlayerHealth)

						// Update embed with attack message from boss

						const bossAttackMessage = `${randomOpponent.name} dealt ${damageToPlayer} damage to you with ${chosenAttack.name}!`
						primaryEmbed.setFooter({ text: bossAttackMessage })

						await buttonInteraction.editReply({ embeds: [chosenAttack.embedUpdate(primaryEmbed)] })
					}
				}
			}
			if (buttonInteraction.customId === "domain") {
				await buttonInteraction.deferUpdate()

				//domain check if used
				if (domainActivationState.get(contextKey)) {
					await buttonInteraction.followUp({
						content: "You can only activate your domain once per fight.",
						ephemeral: true
					})
					return
				}

				try {
					// Fetch domain information and display its activation
					const domainInfo = await getUserDomain(buttonInteraction.user.id)
					const domainEmbed = new EmbedBuilder()
					let domainEffectMessage = "Domain activated! [You feel a surge of power! +50% DMG]"
					if (domainInfo) {
						domainEffectMessage = "Domain activated! [You feel a surge of power! +50% DMG]"
						// Add any specific logic for domain effects on player or opponent
					}

					if (!domainInfo) {
						await buttonInteraction.followUp({
							content: "You do not have a domain unlocked yet.",
							ephemeral: true
						})
						return
					}
					const domainObject = DOMAIN_EXPANSIONS.find(domain => domain.name === domainInfo)
					if (!domainObject) {
						console.error("Domain not found:", domainInfo)
						return
					}
					domainActivationState.set(contextKey, true)
					// User has a domain, construct an embed to show its activation and fight image
					domainEmbed
						.setColor("Blue")
						.setTitle(`${buttonInteraction.user.username} has activated their domain!`)
						.setDescription(`Domain: ${domainInfo}`)
						.addFields(
							{ name: "Enemy Health", value: randomOpponent.current_health.toString(), inline: true },
							{ name: "Your Health", value: playerHealth.toString(), inline: true },
							{ name: "Domain Effect", value: domainEffectMessage }
						)

					// Add image if domainObject has an imageURL
					if (domainObject.image_URL) {
						domainEmbed.setImage(domainObject.image_URL)
					} else {
						console.log("No image URL found for domain:", domainInfo)
					}

					// Proceed with additional fight logic including extra domain damage
					// Assuming getPlayerGradeFromDatabase correctly retrieves the player's grade as a string like "Grade 4"
					const playerGradeData = await getUserGrade(interaction.user.id)
					const playerGradeString = playerGradeData // This is already in the correct format

					// Calculate damage using the string grade
					const baseDamage = calculateDamage(playerGradeString) // Use the grade string directly
					const extraDomainDamage = 50 // Fixed extra damage from domain activation; adjust as needed
					const totalDamage = baseDamage + extraDomainDamage

					// Update boss health in the Map
					let currentBossHealth = bossHealthMap.get(interaction.user.id) || randomOpponent.max_health
					currentBossHealth = Math.max(0, currentBossHealth - totalDamage)
					bossHealthMap.set(interaction.user.id, currentBossHealth)

					// Construct result message
					const fightResult = await handleFightLogic(
						interaction,
						randomOpponent,
						playerGradeString,
						totalDamage
					)
					primaryEmbed.setDescription(fightResult)
					await buttonInteraction.editReply({ embeds: [primaryEmbed] })
					// Is the boss dead?
					if (randomOpponent.current_health <= 0) {
						domainActivationState.set(contextKey, false) // Reset domain activation state
						// Reset health in the database
						bossHealthMap.delete(interaction.user.id)
						const victoryMessage = "You won the fight!"
						primaryEmbed.setDescription(victoryMessage)
						await buttonInteraction.editReply({
							embeds: [primaryEmbed],
							components: []
						})
						// Calculate XP gain
						const xpGain = getRandomXPGain() // Assuming you have this function to get a random XP amount between 10 and 70
						// Update player's experience
						await updateUserHealth(interaction.user.id, 100)
						await updateUserExperience(buttonInteraction.user.id, xpGain)
						await updatePlayerGrade(buttonInteraction.user.id) // Update the player's grade based on new XP

						const drop = getBossDrop(randomOpponent.name)
						if (drop) {
							console.log("Drop found:", drop)
							const dropMessage = `You've also found a ${drop} among the remains!`
							await buttonInteraction.followUp({ content: dropMessage })
							await addItemToUserInventory(interaction.user.id, drop, 1)
						}

						// Send a message about the XP gain
						const xpMessage = `You've gained ${xpGain} XP for defeating the boss!`
						await buttonInteraction.followUp({ content: xpMessage })
					} else {
						// Generic defeat message for other bosses
						const bossAttackMessage = `${randomOpponent.name} killed you!`
						primaryEmbed.setFooter({ text: bossAttackMessage })
					}

					// Update in-memory opponent object
					randomOpponent.current_health = currentBossHealth

					await buttonInteraction.editReply({ embeds: [domainEmbed] })
				} catch (error) {
					console.error("Error during domain activation or fight logic:", error)
					await buttonInteraction.followUp({
						content: "An error occurred during domain activation or in the fight. Please try again later.",
						ephemeral: true
					})
				}
			}
		})
	} catch (error) {
		console.error("Error in fight command:", error)
		await interaction.reply({ content: "An error occurred during the fight!", ephemeral: true })
	}
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
		const gradeNumber = parseInt(userGrade.replace("Grade ", "")) // Remove "Grade " and convert to a number
		console.log("User Grade:", userGrade)

		// 2. Check Requirements
		console.log("User has a Domain Token and is Grade 3 or higher.")
		if (gradeNumber <= 3) {
			await updateUserAchievements(interaction.user.id, "unlockedDomain")
			await removeItemFromUserInventory(interaction.user.id, "Domain Token", 1)

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

		setTimeout(async () => {
			const embedSecond = new EmbedBuilder()
				.setColor("#8b0000") // Dark red, for dramatic effect
				.setTitle("Power or Peril?")
				.setDescription(
					"With a decisive motion, you consume the finger, feeling an overwhelming power surge within..."
				)
				.setImage("https://i.makeagif.com/media/12-06-2023/jn6fNF.gif") // Image URL of the consumption

			// This operation to edit the reply is placed inside the setTimeout callback to ensure the delay
			await interaction.editReply({ embeds: [embedSecond] })
		}, 4000)

		const xpGained = 125
		await updateUserExperience(userId, xpGained)
		await updatePlayerGrade(userId) // Update the player's grade based on new XP
		await removeItemFromUserInventory(userId, item.name, 1)

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

		setTimeout(() => {
			const embedFinal = new EmbedBuilder()
				.setColor("#006400") // Dark green, symbolizing growth
				.setTitle("Power Unleashed")
				.setDescription("The deed is done. You've gained 125 experience. What dark powers have you awakened?")
				.setImage(
					"https://64.media.tumblr.com/59312918933aab3c9330302112a04c79/57360a58ce418849-17/s540x810/bdc0f44011a25a630b7e1f9dd857f9a9376bca7b.gif"
				) // An image URL showing the unleashed power

			// Edit the reply with the new embed after a delay
			interaction.editReply({ embeds: [embedFinal] }).catch(console.error) // Adding catch to handle any potential errors
		}, 4000)
	} else {
		// Handle other items or general case
		const embed = new EmbedBuilder()
			.setColor("#FFFF00")
			.setTitle("No Effect")
			.setDescription(`You ponder the use of ${itemName}, but it seems to hold no significance.`)
		await interaction.reply({ embeds: [embed], ephemeral: true })
	}
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

export async function handleUpdateCommand(interaction: ChatInputCommandInteraction) {
	const recentUpdates = [
		{
			title: "Update 1.3",
			description:
				"Bot was really bugged my bad, fixed all of it mostly should work fine if you encounter erros please make a ticket in the support server <:gojode:1220622724905304116>"
		}
	]

	const updatesEmbed = new EmbedBuilder().setColor(0x0099ff).setTitle("Recent Updates")

	recentUpdates.forEach(update => {
		updatesEmbed.addFields({ name: update.title, value: update.description })
	})

	await interaction.reply({ embeds: [updatesEmbed], ephemeral: true })
}

// quick reply command with support server no embed needed ephemeral
export async function handleSupportCommand(interaction: ChatInputCommandInteraction) {
	await interaction.reply({ content: "https://discord.gg/wmVyBpqWgs", ephemeral: true })
}
