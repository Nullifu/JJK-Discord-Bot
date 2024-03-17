let contextKey: string
interface Opponent {
	name: string
	current_health: number
	max_health: number
}
import { setTimeout } from "node:timers/promises"

import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	Colors,
	ComponentType,
	EmbedBuilder,
	Interaction,
	SelectMenuBuilder,
	SelectMenuInteraction,
	StringSelectMenuBuilder
} from "discord.js"
import { attacks, chooseRandomAttackForBossBasedOnProbability } from "./attacks.js"
import {
	COOLDOWN_TIME,
	digCooldown,
	digCooldownBypassIDs,
	digCooldowns,
	searchCooldown,
	searchCooldownBypassIDs,
	searchCooldowns,
	userLastDaily,
	workCooldowns
} from "./bot.js"
import {
	calculateDamage,
	calculateGradeFromExperience,
	createInventoryPage,
	getRandomLocation,
	getRandomXPGain
} from "./calculate.js"
import { BossData } from "./interface.js"
import { getRandomItem } from "./items jobs.js"
import { getJujutsuFlavorText } from "./jujutsuFlavor.js"
import {
	addItem,
	addItemToUserInventory,
	addUser,
	getAllBossesFromDatabase,
	getBalance,
	getDomain,
	getDomainFight,
	getItem,
	getItems,
	getPlayerGradeFromDatabase,
	getPlayerHealth,
	getShopItems,
	getUserInventory,
	getUserProfile,
	giveItemToUser,
	incrementInventoryItemQuantity,
	removeItemFromUser,
	updateBalance,
	updateBossHealth,
	updateExperience,
	updatePlayerHealth,
	updateUserXPandGrade,
	userHasItem
} from "./mysql.js"
// Profile Command
const domainActivationState = new Map()
// Assuming you have types defined for these:
export interface UserProfile {
	balance: number
	experience: number
	jujutsu: number
	grade: string
	health: number
}

export async function handleProfileCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id
	// Function to create the profile embed
	const createProfileEmbed = async userId => {
		const userProfile = await getUserProfile(userId)
		if (!userProfile) throw new Error("Profile not found.")

		return new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(`${interaction.user.username}'s Profile`)
			.addFields(
				{ name: "**Balance**", value: `\`${userProfile.balance.toString()}\``, inline: true },
				{ name: "**Experience**", value: userProfile.experience.toString(), inline: true }
			)
	}

	try {
		const profileEmbed = await createProfileEmbed(userId)

		// Create a button to refresh the profile
		const refreshButton = new ButtonBuilder()
			.setCustomId("refreshProfile")
			.setLabel("Refresh Profile")
			.setStyle(ButtonStyle.Primary)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(refreshButton)

		await interaction.reply({ embeds: [profileEmbed], components: [row] })

		// Create an event listener for button interactions
		const filter = i => i.customId === "refreshProfile" && i.user.id === userId
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 })

		collector.on("collect", async btnInteraction => {
			if (btnInteraction.customId === "refreshProfile") {
				try {
					const newProfileEmbed = await createProfileEmbed(userId)
					await btnInteraction.update({ embeds: [newProfileEmbed], components: [row] })
				} catch (error) {
					console.error("Failed to update user profile:", error)
					await btnInteraction.reply({
						content: "There was an error updating your profile.",
						ephemeral: true
					})
				}
			}
		})
	} catch (error) {
		console.error("Failed to retrieve user profile:", error)
		await interaction.reply("There was an error retrieving your profile.")
	}
}

// Balance Command
export async function handleBalanceCommand(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply()
	const user = interaction.user
	const balance = await getBalance(user.id)
	const balanceEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle(`${user.username}'s Balance`)
		.setThumbnail(user.displayAvatarURL())
		.addFields({ name: "Balance", value: balance.toString(), inline: true })

	// Edit the deferred reply with the embed
	await interaction.editReply({ embeds: [balanceEmbed] })
}
// Inventory

export async function handleInventoryCommand(interaction) {
	await interaction.deferReply()

	// Check for mentioned user in the command, use command issuer if no user is mentioned
	const mentionedUser = interaction.options.getUser("user") || interaction.user
	const inventoryItems = await getUserInventory(mentionedUser.id)
	const itemsPerPage = 5 // Number of items to show per page
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

// Dig Command
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
	const itemDiscoveryChance = 0.5 // 30% chance to discover an item
	const doesDiscoverItem = Math.random() < itemDiscoveryChance

	// The command logic for finding coins
	const coinsFound = Math.floor(Math.random() * 20000) + 1
	await updateBalance(interaction.user.id, coinsFound)

	if (doesDiscoverItem) {
		// Logic for finding an item
		const itemFound = getRandomItem() // Simulate finding a random item
		let item = await getItem(itemFound.name, `A \`${itemFound.rarity}\` Item.`)

		if (!item) {
			item = await addItem(itemFound.name, `A \`${itemFound.rarity}\` Item.`, itemFound.price)
		}

		const hasItem = await userHasItem(authorId, item.id)
		if (hasItem) {
			await incrementInventoryItemQuantity(authorId, item.id)
		} else {
			await giveItemToUser(authorId, item.id)
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
// uh ima uh ima think ngl
export async function handleSellCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	const itemName = interaction.options.getString("item")
	const quantityToSell = interaction.options.getInteger("quantity") || 1

	if (!itemName) {
		await interaction.reply({ content: "Please specify an item to sell.", ephemeral: true })
		return
	}

	const authorId = interaction.user.id

	// Fetch all items to get the most up-to-date prices
	const allItems = await getItems()
	const itemToSell = allItems.find(item => item.name.toLowerCase() === itemName.toLowerCase())

	// Validate the item
	if (!itemToSell) {
		await interaction.reply({ content: `The item ${itemName} does not exist.`, ephemeral: true })
		return
	}

	// Fetch the user's inventory and validate quantity
	const userInventory = await getUserInventory(authorId)
	const userItem = userInventory.find(item => item.name.toLowerCase() === itemName.toLowerCase())
	if (!userItem || userItem.quantity < quantityToSell) {
		await interaction.reply({ content: `You do not have enough of ${itemName} to sell.`, ephemeral: true })
		return
	}

	// Calculate the total sell price using the price from the allItems list
	const totalSellPrice = itemToSell.price * quantityToSell

	// Update the user's balance
	await updateBalance(authorId, totalSellPrice)

	// Remove the item from the user's inventory
	await removeItemFromUser(authorId, userItem.id, quantityToSell)
	await interaction.deferReply()

	// Construct and send the confirmation embed
	const sellEmbed = new EmbedBuilder()
		.setColor(0x00ff00) // Green color for success
		.setTitle("Item Sold!")
		.setDescription(`You've sold ${quantityToSell} x ${itemName} for ${totalSellPrice} coins.`)
		.setTimestamp()

	await interaction.editReply({ embeds: [sellEmbed] })
}
// handle work command
export async function handleWorkCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	const userId = interaction.user.id

	// Check cooldown
	const currentTime = Date.now()
	const lastWorkTime = workCooldowns.get(userId) || 0
	if (currentTime - lastWorkTime < COOLDOWN_TIME) {
		// User is still on cooldown
		const timeLeft = (lastWorkTime + COOLDOWN_TIME - currentTime) / 1000 // Time left in seconds
		await interaction.reply({
			content: `You must wait ${timeLeft.toFixed(0)} more seconds before you can work again.`,
			ephemeral: true
		})
		return
	}

	// Update cooldown
	workCooldowns.set(userId, currentTime)

	// Calculate earnings (example: random amount between 10 and 100)
	const earnings = Math.floor(Math.random() * (50000 - 1000 + 1)) + 10

	// Update user balance
	await updateBalance(userId, earnings)

	// Create and send an embed
	const workEmbed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle("Work Completed")
		.setDescription(`You worked hard and earned **${earnings}** coins!`)
		.setTimestamp()
		.setFooter({ text: "more you slave away the more prone you are to death" })

	await interaction.reply({ embeds: [workEmbed] })
}
// register
export async function handleRegistercommand(interaction: ChatInputCommandInteraction): Promise<void> {
	try {
		const discordId = interaction.user.id
		const result = await addUser(discordId)
		const imageURL = "https://wikiofnerds.com/wp-content/uploads/2023/10/jujutsu-kaisen-.jpg" // Replace with your image URL

		// Create the embed with a concise message
		const welcomeEmbed = new EmbedBuilder()
			.setColor(0x5d2e8c) // A thematic purple, for a mystical vibe
			.setTitle("Jujutsu Registration Complete!")
			.setDescription(`Welcome, ${interaction.user.toString()}! Your Jujutsu journey begins.`) // Concise welcome message
			.setImage(imageURL)
			.setTimestamp()
			.setFooter({
				text: `Are you the strongest because you're ${interaction.user.username}, or are you ${interaction.user.username} because you're the strongest?`
			})

		// Reply with the embed
		await interaction.reply({ embeds: [welcomeEmbed] })

		console.log(result)
	} catch (error) {
		console.error("Error registering user:", error)
		await interaction.reply({
			content: "There was an error registering you, Or you are already registered!",
			ephemeral: true
		})
	}
}
//daily
export async function handleDailyCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	const userId = interaction.user.id
	const currentTime = Date.now()
	const oneDayMs = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

	// Check if the user is on cooldown
	const lastDailyTime = userLastDaily.get(userId) || 0
	if (currentTime - lastDailyTime < oneDayMs) {
		// User is still on cooldown
		const timeLeft = (lastDailyTime + oneDayMs - currentTime) / 1000 // Time left in seconds
		await interaction.reply({
			content: `You must wait ${timeLeft.toFixed(0)} more seconds before you can claim your daily reward again.`,
			ephemeral: true
		})
		return
	}

	// Update cooldown
	userLastDaily.set(userId, currentTime)

	// Calculate daily reward (you can adjust this as needed)
	const coinsReward = 125000 // For example, 100 coins
	await updateBalance(userId, coinsReward)

	// Create and send the confirmation embed
	const dailyEmbed = new EmbedBuilder()
		.setColor(0x00ff00) // Green color for success
		.setTitle("Daily Reward Claimed!")
		.setThumbnail("https://i.pinimg.com/736x/8f/90/56/8f9056043d8ea491aab138f1a005599d.jpg")
		.setDescription(`You've claimed your daily reward of **${coinsReward}!**`)
		.setTimestamp()
		.setFooter({ text: "I LOVE MONEY" })

	await interaction.reply({ embeds: [dailyEmbed] })
}
// craft
export async function handleCraftCommand(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
	const selectedItem = interaction.options.getString("item")

	try {
		// Fetch the user's inventory
		const userInventory = await getUserInventory(interaction.user.id)

		let requiredItemName, requiredQuantity, craftedItemId, requiredMaterialId
		// Determine the crafting requirements based on the selected item
		switch (selectedItem) {
			case "prison_realm":
				requiredItemName = "Prison Realm Fragment"
				requiredQuantity = 6
				craftedItemId = 80 // Replace with the actual item ID for the Prison Realm
				requiredMaterialId = 78 // The actual material ID needed for the operation
				break
			case "six_eyes":
				requiredItemName = "Rikugan Eye"
				requiredQuantity = 6
				craftedItemId = 82 // Replace with the actual item ID for the Six Eyes
				requiredMaterialId = 81 // The actual material ID needed for the operation
				break
			case "jogos_balls":
				requiredItemName = "Jogos left testicle"
				requiredQuantity = 2
				craftedItemId = 100 // Replace with the actual item ID for the Jogos Balls
				requiredMaterialId = 99 // The actual material ID needed for the operation
				break
			default:
				await interaction.reply({ content: "Invalid item selected.", ephemeral: true })
				return
		}

		// Find the required item in the inventory
		console.log(`Required Material ID: ${requiredMaterialId}, Required Quantity: ${requiredQuantity}`)
		const item = userInventory.find(invItem => invItem.id === requiredMaterialId)
		// Check if the user has enough of the required item
		console.log(`Inventory for Material ID ${requiredMaterialId}:`, item)
		if (!item || item.quantity < requiredQuantity) {
			await interaction.reply(
				`You do not have enough ${requiredItemName} to craft a ${selectedItem.replace("_", " ")}.`
			)
			return
		}

		// Create the embed with craft confirmation buttons
		const craftEmbed = new EmbedBuilder()
			.setColor(0x00ff00) // Green color
			.setTitle(`Crafting **${selectedItem.replace("_", "**")}`)
			.setDescription(
				`Do you want to craft a ${selectedItem.replace(
					"_",
					" "
				)} using __${requiredQuantity}__ ${requiredItemName}?`
			)
			.setTimestamp()

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
			// Ensure the interaction is deferred if not yet replied to (prevents API errors)
			if (!buttonInteraction.deferred) await buttonInteraction.deferUpdate()

			if (buttonInteraction.customId === "confirmCraft") {
				try {
					console.log(`Starting item removal for ${requiredItemName}, Quantity: ${requiredQuantity}`)
					await removeItemFromUser(interaction.user.id, requiredMaterialId, requiredQuantity)

					// Check if the user already has the crafted item
					const craftedItem = userInventory.find(invItem => invItem.id === craftedItemId)
					if (craftedItem) {
						// Increment the quantity of the crafted item in the user's inventory
						await incrementInventoryItemQuantity(interaction.user.id, craftedItemId)
					} else {
						// If not present, assume addItemToUserInventory will add the crafted item with quantity = 1
						await addItemToUserInventory(interaction.user.id, craftedItemId)
					}

					console.log(`Crafting successful for ${requiredItemName}`)

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

//lookup
// Define information about the items
const itemDetails = {
	six_eyes: {
		title: "Six Eyes <:sixeye:1193159757515726919>",
		description: "A rare and powerful ability that grants immense clarity and control over Cursed Energy.",
		footer: "Who know's what techniques you may get if you have one of these eyes!",
		imagePath: "./image/sixeyes.png"
	},
	prison_realm: {
		title: "Prison Realm <:prison_realm:1193160559009484830>",
		description: "A special grade cursed tool used to seal away powerful beings.",
		footer: "Could be used to plan a certain sealing technique?..",
		imagePath: "./image/prisonrealm.png"
	},
	sukuna_finger: {
		title: "Sukuna Finger <:sukuna_finger:1193318005015330936>",
		description: "One of the twenty fingers of the undisputed King of Curses, **Ryomen Sukuna.**",
		footer: "If you were to eat it, Who know's what might happen?",
		imagePath: "./image/sukunafinger.png"
	},
	distorted_soul: {
		title: "Distorted Soul",
		description: "A mysterious and highly dangerous cursed object with unknown origins.",
		footer: "The true essence of JUJUTSU!",
		imagePath: "./image/soul.png"
	}
}

export async function handleLookupCommand(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
	// Create the initial embed
	const initialEmbed = new EmbedBuilder()
		.setColor(0x0099ff) // Blue color
		.setTitle("Item Lookup")
		.setDescription("Select an item to look up its details.")
		.setTimestamp()

	// Create a Select Menu with options for each item
	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId("selectItem")
		.setPlaceholder("Select an item")
		.addOptions(
			Object.entries(itemDetails).map(([value, details]) => ({
				label: details.title.replace(/<:.+?:\d+>/g, ""), // Remove emoji from title for the label
				description: details.description.slice(0, 40), // Trim description to fit
				value: value
			}))
		)

	// Send the initial embed with the Select Menu
	await interaction.reply({
		embeds: [initialEmbed],
		components: [new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu)]
	})

	// Create a collector to handle selection
	const filter = (i: SelectMenuInteraction) => i.customId === "selectItem" && i.user.id === interaction.user.id
	const collector = interaction.channel.createMessageComponentCollector({
		filter,
		componentType: ComponentType.SelectMenu,
		time: 60000
	}) // Adjust time as needed

	collector.on("collect", async (menuInteraction: SelectMenuInteraction) => {
		if (!menuInteraction.isStringSelectMenu()) return

		// Get the selected item's details
		const selectedItem = menuInteraction.values[0]
		const details = itemDetails[selectedItem]

		// Create an updated embed based on the selection
		const updatedEmbed = new EmbedBuilder()
			.setColor(0x0099ff) // Blue color
			.setTitle(details.title)
			.setDescription(details.description)
			.setFooter({ text: details.footer }) // Add footer text
			.setTimestamp()

		// If an image is provided, set it
		if (details.imagePath) {
			const imageAttachment = new AttachmentBuilder(details.imagePath)
			updatedEmbed.setImage(`attachment://${details.imagePath.split("/").pop()}`)
			await menuInteraction.update({ embeds: [updatedEmbed], files: [imageAttachment], components: [] })
		} else {
			await menuInteraction.update({ embeds: [updatedEmbed], components: [] })
		}
	})

	collector.on("end", () => {})
}

export async function handleStatusCommand(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
	// Create the embed
	const embed = new EmbedBuilder()
		.setColor(0x0099ff) // Blue color
		.setTitle("Bot Status")
		.setDescription("Here's a quick overview of the bot's current status:")
		.setTimestamp()

	// Add fields for relevant status information (replace with your actual data)
	embed.addFields({ name: "✅ Online", value: "The bot is currently online and operational." })

	// Send the embed
	await interaction.reply({ embeds: [embed] })
}

export async function handleRulesCommand(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
	// Create the embed
	const embed = new EmbedBuilder()
		.setColor(0x0099ff) // Blue color
		.setTitle("RULES")
		.setDescription("Here's a quick overview the rules in this server")
		.setTimestamp()

	// Add fields for relevant status information (replace with your actual data)
	embed.addFields(
		{
			name: "1. **Basic respect**",
			value: "Disrespectful behaviour, hate speech and hateful behaviour will not be tolerated. (Reclaiming slurs is allowed)"
		},
		{ name: "2. **Pings**", value: "Pinging staff members (unless for a valid reason) is not permitted." },
		{ name: "3. **Promotion**", value: "No self promotion unless authorised by a Mod." }, // Replace with actual uptime calculation
		{
			name: "4. **Personal Information** ",
			value: "Leaking server members’ personal information is not condoned in this server. (This entails doxxing etc.)"
		} // Replace with actual latency calculation
		// Add more fields as needed
	)

	// Send the embed
	await interaction.reply({ embeds: [embed] })
}

// jujutsu command
export async function handleJujutsuCommand(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user.id

	// Function to create the profile embed
	const createProfileEmbed = async userId => {
		const userProfile = await getUserProfile(userId)
		if (!userProfile) throw new Error("Profile not found.")

		return new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(`${interaction.user.username}'s Jujutsu Stats!`)
			.addFields(
				{
					name: "**Cursed Energy**",
					value: `\`${userProfile.experience.toString()}\``,
					inline: true
				},
				{ name: "**Grade**", value: userProfile.grade.toString(), inline: false }
			)
	}

	try {
		const profileEmbed = await createProfileEmbed(userId)
		await interaction.reply({ embeds: [profileEmbed] })
	} catch (error) {
		console.error("Failed to retrieve user profile:", error)
		await interaction.reply("There was an error retrieving your jujutsu stats.")
	}
}

// Full fight command for Jujutsu
export async function handleFightCommand(interaction: ChatInputCommandInteraction) {
	try {
		// Fetch boss data from database
		const allBosses = await getAllBossesFromDatabase()

		// Select random opponent
		const randomIndex = Math.floor(Math.random() * allBosses.length)
		const randomOpponent = allBosses[randomIndex]

		const cursedEnergyPurple = parseInt("#8A2BE2".replace("#", ""), 16) // Convert hex string to number
		const { health: playerHealth } = await getPlayerHealth(interaction.user.id)

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
				const { health: playerHealth } = await getPlayerHealth(interaction.user.id)

				// Get player's grade
				// Assuming getPlayerGradeFromDatabase correctly retrieves the player's grade as a string like "Grade 4"
				const playerGradeData = await getPlayerGradeFromDatabase(interaction.user.id)
				const playerGradeString = playerGradeData.grade // This is already in the correct format

				// Calculate damage using the string grade
				const damage = calculateDamage(playerGradeString) // Use the grade string directly

				// Calculate boss new health after damage dealt

				randomOpponent.current_health -= damage

				// Ensure boss health is never below 0
				randomOpponent.current_health = Math.max(0, randomOpponent.current_health)

				// Construct result message
				const fightResult = await handleFightLogic(interaction, randomOpponent, playerGradeString, damage)
				primaryEmbed.setDescription(fightResult)
				await buttonInteraction.editReply({ embeds: [primaryEmbed] })
				// Is the boss dead?
				if (randomOpponent.current_health <= 0) {
					domainActivationState.set(contextKey, false) // Reset domain activation state
					// Reset health in the database
					await updateBossHealth(randomOpponent.name, randomOpponent.max_health) // Assuming max_health is the original health

					const victoryMessage = "You won the fight!"
					primaryEmbed.setDescription(victoryMessage)
					await buttonInteraction.editReply({
						embeds: [primaryEmbed],
						components: []
					})
					// Calculate XP gain
					const xpGain = getRandomXPGain() // Assuming you have this function to get a random XP amount between 10 and 70

					// Update player's experience
					await updateExperience(buttonInteraction.user.id, xpGain) // Assuming this function updates the XP in your database and accepts the user ID and the XP amount

					// Send a message about the XP gain
					const xpMessage = `You've gained ${xpGain} XP for defeating the boss!`
					await buttonInteraction.followUp({ content: xpMessage })
				} else {
					// Update to new boss health after damage dealt
					await updateBossHealth(randomOpponent.name, randomOpponent.current_health)

					// Delay 1 second for a bit until the boss attack
					await setTimeout(2000) // this is milliseconds

					// *** Boss Attack ***
					const possibleAttacks = attacks[randomOpponent.name]
					const chosenAttack = chooseRandomAttackForBossBasedOnProbability(possibleAttacks)

					// Calculate damage done to player
					//const damageToPlayer = Math.floor(chosenAttack.baseDamage * Math.random())
					const damageToPlayer = chosenAttack.baseDamage

					// Calculate player new health after damage dealt by boss
					const newPlayerHealth = playerHealth - damageToPlayer

					// Ensure player health is never below 0
					const clampedPlayerHealth = Math.max(0, newPlayerHealth)

					// Did the player die?
					if (clampedPlayerHealth <= 0) {
						if ((randomOpponent as Opponent).name === "Sukuna") {
							primaryEmbed
								.setDescription("Sukuna has killed you!")
								.setFields({
									name: "Heh, Guess you weren't strong enough after all..",
									value: `Stand Proud. ${interaction.user.username}, You are strong.`
								})

								.setColor(Colors.DarkRed) // Ominous color change
								.setImage(
									"https://i.ytimg.com/vi/DDOQKfnS17U/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AHUBoAC4AOKAgwIABABGCIgVihyMA8=&rs=AOn4CLDAgsnklMsuzmmglFHWIDdhs9IwMA"
								)
						} else {
							// Generic defeat message for other bosses
							const bossAttackMessage = `${randomOpponent.name} killed you!`
							primaryEmbed.setDescription(bossAttackMessage)
						}

						// Reset player health in the database
						await updatePlayerHealth(interaction.user.id, 100)
						await buttonInteraction.editReply({ embeds: [primaryEmbed], components: [] })
					} else {
						// Update to new player health after damage dealt
						await updatePlayerHealth(interaction.user.id, clampedPlayerHealth)

						// Update embed with attack message from boss
						const bossAttackMessage = `${randomOpponent.name} dealt ${damageToPlayer} damage to you with ${chosenAttack.name}!`
						primaryEmbed.setDescription(bossAttackMessage)
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
					const domainInfo = await getDomainFight(buttonInteraction.user.id)
					const domainEmbed = new EmbedBuilder()
					let domainEffectMessage = "Domain activated! [You feel a surge of power! +50% DMG]"
					if (domainInfo) {
						domainEffectMessage = "Domain activated! [You feel a surge of power! +50% DMG]"
						// Add any specific logic for domain effects on player or opponent
					}

					if (!domainInfo) {
						// If the user does not have a domain, send an ephemeral message
						await buttonInteraction.followUp({
							content: "You do not have a domain unlocked yet.",
							ephemeral: true
						})
						return // Exit the function if no domain is found
					}

					domainActivationState.set(contextKey, true)
					// User has a domain, construct an embed to show its activation and fight image
					domainEmbed
						.setColor("Blue")
						.setTitle(`${buttonInteraction.user.username} has activated their domain!`)
						.setDescription(`Domain: ${domainInfo.name}`)
						.setImage(domainInfo.imageFightUrl) // Display the domain's special fight image
						.addFields(
							{ name: "Enemy Health", value: randomOpponent.current_health.toString(), inline: true },
							{ name: "Your Health", value: playerHealth.toString(), inline: true },
							{ name: "Domain Effect", value: domainEffectMessage }
						)

					// Proceed with additional fight logic including extra domain damage
					// Assuming getPlayerGradeFromDatabase correctly retrieves the player's grade as a string like "Grade 4"
					const playerGradeData = await getPlayerGradeFromDatabase(interaction.user.id)
					const playerGradeString = playerGradeData.grade // This is already in the correct format

					// Calculate damage using the string grade
					const baseDamage = calculateDamage(playerGradeString) // Use the grade string directly

					const extraDomainDamage = 50 // Fixed extra damage from domain activation; adjust as needed
					const totalDamage = baseDamage + extraDomainDamage

					randomOpponent.current_health -= totalDamage
					randomOpponent.current_health = Math.max(0, randomOpponent.current_health)

					const fightResult = await handleFightLogic(
						buttonInteraction,
						randomOpponent,
						playerGradeString,
						totalDamage
					)
					domainEmbed.setDescription(fightResult)

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

// Helper Functions
async function handleFightLogic(
	interaction: Interaction,
	randomOpponent: BossData,
	playerGradeString: string,
	damage: number
): Promise<string> {
	// ... your fight logic (update boss health, etc.)

	// Construct result message
	let resultMessage = `You dealt ${damage} damage to ${randomOpponent.name}!`
	if (randomOpponent.current_health <= 0) {
		resultMessage += " You won the fight!"
	} else {
		resultMessage += ` Boss health remaining: ${randomOpponent.current_health}`
	}

	return resultMessage
}

// command to dm a user
export async function handleDmCommand(interaction: ChatInputCommandInteraction) {
	const user = interaction.options.getUser("user")
	const message = interaction.options.getString("message")

	try {
		await user.send(message)
		await interaction.reply({ content: `Message sent to ${user.tag}.` })
	} catch (error) {
		console.error("Failed to send message:", error)
		await interaction.reply({ content: "Failed to send the message.", ephemeral: true })
	}
}

// test

export async function handleShopCommand(interaction) {
	const items = await getShopItems()

	// Create a simple embed
	const shopEmbed = new EmbedBuilder()
		.setTitle("Welcome to the Shop")
		.setDescription("Select an item from the dropdown to view details and purchase.")

	const options = items.map(item => ({
		label: `${item.name} - ${item.price}`,
		description: item.description.substring(0, 50) + "...",
		value: item.id.toString()
	}))

	const selectMenu = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId("select-item")
			.setPlaceholder("Select an item to buy")
			.addOptions(options)
	)

	await interaction.reply({
		embeds: [shopEmbed],
		components: [selectMenu]
	})
}
export async function handleSelectMenuInteraction(interaction) {
	console.log("Select menu interaction is happening.")
	if (!interaction.isSelectMenu()) return

	if (interaction.customId === "select-item") {
		const itemId = interaction.values[0]
		const userId = interaction.user.id

		console.log(`User ${userId} has selected item ${itemId}`)

		try {
			// faggot
			const items = await getShopItems()
			const item = items.find(item => item.id.toString() === itemId)
			const itemPrice = item.price
			const userBalance = await getBalance(userId)

			console.log(`${userBalance} ${itemPrice}`)

			if (userBalance >= itemPrice) {
				await addItemToUserInventory(userId, itemId)
				console.log(`User ${userId} has purchased item ${itemId}`)
				await updateBalance(userId, -itemPrice)
				console.log(`User ${userId} has been charged ${itemPrice} coins`)
			}

			const shopEmbed = new EmbedBuilder()
				.setTitle("Welcome to the Shop")
				.setDescription("You have successfully purchased the item!")
			await interaction.update({
				embeds: [shopEmbed.setDescription("You have successfully purchased the item!")],
				components: []
			})
		} catch (error) {
			console.error("Error during purchase process:", error)
			await interaction.update({
				content: "An error occurred during purchase. Please try again later.",
				ephemeral: true
			})
		}
	} else {
		// next
	}
}

// test getDomain function in embed
export async function HandleCheckDomainCommand(interaction) {
	// Immediately acknowledge the interaction
	await interaction.deferReply()
	try {
		// Retrieve mentioned user from the command options, fall back to the author if no user is mentioned
		const targetUser = interaction.options.getUser("mentionedUser") || interaction.user

		// Use the targetUser's ID to get domain information
		const domainInfo = await getDomain(targetUser.id) // Assuming getDomain now also returns image_url

		// Format domain information
		let domainFieldValue = "None"
		if (domainInfo) {
			domainFieldValue = `Name: ${domainInfo.name}\nDescription: ${domainInfo.description}`
		}

		// Create the embed with domain information
		const embed = new EmbedBuilder()
			.setColor(domainInfo ? "Green" : "Red") // Set color based on domain availability
			.setTitle("Domain Check")
			.setDescription(`Domain Unlocked: ${domainInfo ? "Yes" : "No"}`) // Indicate if a domain is unlocked
			.addFields({ name: "Domain", value: domainFieldValue }) // Use formatted string for value

		// If domainInfo has an image_url, add it as an image or thumbnail to the embed
		if (domainInfo && domainInfo.image_url) {
			// Use .setImage() or .setThumbnail() depending on how you want it to display
			embed.setImage(domainInfo.image_url) // Or .setThumbnail(domainInfo.image_url)
		}

		// Edit the reply with the embed
		await interaction.editReply({ embeds: [embed] })
	} catch (error) {
		console.error("Error checking domain or timed out:", error)
		// Notify the user something went wrong
		await interaction.editReply({ content: "An error occurred! Please try again later.", ephemeral: true })
	}
}

export async function useCommand(interaction: ChatInputCommandInteraction): Promise<void> {
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

		await setTimeout(4000) // this is milliseconds
		const embedSecond = new EmbedBuilder()
			.setColor("#8b0000") // Dark red, for dramatic effect
			.setTitle("Power or Peril?")
			.setDescription(
				"With a decisive motion, you consume the finger, feeling an overwhelming power surge within..."
			)
			.setImage("https://i.makeagif.com/media/12-06-2023/jn6fNF.gif") // Add an image URL of the consumption
		await interaction.editReply({ embeds: [embedSecond] })

		await setTimeout(3000) // this is milliseconds
		const user = await getPlayerGradeFromDatabase(userId) // Fetch current user data
		const xpGained = 125 // Fixed XP gain for consuming the Sukuna Finger
		const newXP = user.experience + xpGained
		const newGrade = calculateGradeFromExperience(newXP) // Calculate the new grade
		await updateUserXPandGrade(userId, newXP, newGrade) // Update user's XP and grade in the database

		await removeItemFromUser(userId, item.id, 1)

		const embedFinal = new EmbedBuilder()
			.setColor("#006400") // Dark green, symbolizing growth
			.setTitle("Power Unleashed")
			.setDescription("The deed is done. You've gained 125 experience. What dark powers have you awakened?")
			.setImage(
				"https://64.media.tumblr.com/59312918933aab3c9330302112a04c79/57360a58ce418849-17/s540x810/bdc0f44011a25a630b7e1f9dd857f9a9376bca7b.gif"
			) // An image URL showing the unleashed power
		await interaction.editReply({ embeds: [embedFinal] })
	} else {
		// Handle other items or general case
		const embed = new EmbedBuilder()
			.setColor("#FFFF00")
			.setTitle("No Effect")
			.setDescription(`You ponder the use of ${itemName}, but it seems to hold no significance.`)
		await interaction.reply({ embeds: [embed], ephemeral: true })
	}
}

//
//
//
//
export async function addXP(userId: string, xpAdded: number): Promise<{ newXP: number; newGrade: string }> {
	const user = await getPlayerGradeFromDatabase(userId)
	const newXP: number = user.experience + xpAdded

	let newGrade: string

	// Determine the new grade based on XP
	if (newXP >= 2500) {
		// Progress to Special Grade if not already
		newGrade = "Special Grade"
	} else if (newXP >= 1000) {
		// Progress to Grade 1 if below this grade
		newGrade = !["Special Grade", "Grade 1"].includes(user.grade) ? "Grade 1" : user.grade
	} else if (newXP >= 750) {
		// Progress to Semi-Grade 1 if below this grade
		newGrade = !["Special Grade", "1", "Semi-Grade 1"].includes(user.grade) ? "Semi-Grade 1" : user.grade
	} else if (newXP >= 500) {
		// Progress to Grade 2 if below this grade
		newGrade = !["Special Grade", "Grade 1", "Semi-Grade 1", "Grade 2"].includes(user.grade)
			? "Grade 2"
			: user.grade
	} else if (newXP >= 250) {
		// Progress to Grade 3 if below this grade
		newGrade = !["Special Grade", "Grade 1", "Semi-Grade 1", "Grade 2", "Grade 3"].includes(user.grade)
			? "Grade 3"
			: user.grade
	} else {
		// Remain at Grade 4 if below 250 XP
		newGrade = "Grade 4"
	}

	// Update the user's grade and XP in the database
	await updateUserXPandGrade(userId, newXP, newGrade)

	console.log(`User ${userId} updated: New XP is ${newXP}, New Grade is ${newGrade}`)
	return { newXP, newGrade }
}

// Initialize the search counter
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

				//await continueSearch(inter, riskFactor)
			} else {
				const coinsFound = userSearching.get(inter.user.id).coinsFound

				// final embed but not so final
				const finalEmbed = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle("Search Completed")
					.setDescription(`You've finished your searching. You gathered a total of ${coinsFound} coins.`)
					.setTimestamp()

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
