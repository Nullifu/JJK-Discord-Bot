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
	randomdig2,
	userLastDaily,
	workCooldowns
} from "./bot.js"
import { calculateDamage } from "./calculate.js"
import { BossData } from "./interface.js"
import { getRandomItem } from "./items jobs.js"
import { createHealthBar, getJujutsuFlavorText } from "./jujutsuFlavor.js"
import {
	addItem,
	addItemToUserInventory,
	addUser,
	getAllBossesFromDatabase,
	getAllDomains,
	getAllItems,
	getBalance,
	getDomain,
	getDomainFight,
	getItem,
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
	updatePlayerHealth,
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
			.setLabel("Jujutsu")
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

export async function handleInventoryCommand(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply()

	const user = interaction.user
	const inventoryItems = await getUserInventory(user.id)

	// Start building the embed
	const inventoryEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle(`${user.username}'s Inventory`)
		.setThumbnail(user.displayAvatarURL())

	// Add each inventory item to the embed
	inventoryItems.forEach(item => {
		inventoryEmbed.addFields({ name: `${item.name} (x${item.quantity})`, value: item.description, inline: true })
	})

	// Check if the inventory is empty
	if (inventoryItems.length === 0) {
		inventoryEmbed.setDescription("Your inventory is empty.")
	}

	// Send the embed as the interaction response
	await interaction.editReply({ embeds: [inventoryEmbed] })
}
// Dig Command
export async function handleDigcommand(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply()

	const currentTime = Date.now()
	const authorId = interaction.user.id
	const timestamp = digCooldowns.get(authorId)

	// Check cooldown
	if (timestamp) {
		const expirationTime = timestamp + digCooldown
		if (currentTime < expirationTime && !digCooldownBypassIDs.includes(authorId)) {
			// Send a message with a dynamic timestamp
			const digCooldownEmbed = new EmbedBuilder()
				.setColor(0xff0000) // Red color for error
				.setTitle("Digging Cooldown")
				.setTimestamp()
				.setDescription(
					`You need to wait before using the \`.dig\` command again. You can dig again <t:${Math.floor(
						expirationTime / 1000
					)}:R>.`
				)
			await interaction.editReply({ embeds: [digCooldownEmbed] })
		}
	}

	// Set or update the cooldown
	digCooldowns.set(authorId, currentTime)

	// The command logic
	const coinsFound = Math.floor(Math.random() * 20000) + 1
	await updateBalance(interaction.user.id, coinsFound)

	// The logic for finding an item
	const itemFound = getRandomItem()
	if (itemFound) {
		// Create item
		let fkingItem = await getItem(itemFound.name, `A \`${itemFound.rarity}\` Item.`)
		if (!fkingItem) {
			fkingItem = await addItem(itemFound.name, `A \`${itemFound.rarity}\` Item.`, itemFound.price)
		}

		// do they already have this item
		const hasFkingItem = await userHasItem(authorId, fkingItem.id)
		if (hasFkingItem) {
			await incrementInventoryItemQuantity(authorId, fkingItem.id)
		} else {
			// Give item to user
			await giveItemToUser(authorId, fkingItem.id)
		}

		// Give item to user

		const randomdigs = randomdig2[Math.floor(Math.random() * randomdig2.length)]
		// Create the response embed
		const digEmbed = new EmbedBuilder()
			.setColor(0x00ff00) // Gold color
			.setTitle("Digging Results")
			.setDescription(`You ${randomdigs} \`⌬${coinsFound}\` coins! **You also found a ${itemFound.name}!**`)
			.setTimestamp()

		// Send the embed response
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
	const allItems = await getAllItems()
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
		const imageURL =
			"https://64.media.tumblr.com/eb2e5aae7be9d754ac5c7d3bea11e331/980dfb5c4c395e4c-df/s1280x1920/c9f7109eb7ab969bad1de7cb0f9196c53ec122d7.jpg" // Replace with your image URL

		// Create the embed
		const welcomeEmbed = new EmbedBuilder()
			.setColor(0x00ff00) // Green color
			.setTitle("Registered!")
			.setDescription(`${interaction.user.toString()} **Welcome to Jujutsu!**`) // Mention the user
			.setImage(imageURL) // Set the image URL
			.setTimestamp()

		// Reply with the embed
		await interaction.reply({ embeds: [welcomeEmbed] })

		console.log(result)
	} catch (error) {
		console.error("Error registering user:", error)
		await interaction.reply({ content: "There was an error registering the user.", ephemeral: true })
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

		let requiredItemName, requiredQuantity, craftedItemId

		// Determine the crafting requirements based on the selected item
		switch (selectedItem) {
			case "prison_realm":
				requiredItemName = "Prison Realm Fragment"
				requiredQuantity = 6
				craftedItemId = 80 // Replace with the actual item ID for the Prison Realm
				break
			case "six_eyes":
				requiredItemName = "Rikugan Eye"
				requiredQuantity = 6
				craftedItemId = 82 // Replace with the actual item ID for the Six Eyes
				break
			case "jogos_balls":
				requiredItemName = "Jogos left testicle"
				requiredQuantity = 2
				craftedItemId = 1 // Replace with the actual item ID for the Six Eyes
				break
			default:
				await interaction.reply({ content: "Invalid item selected.", ephemeral: true })
				return
		}

		// Find the required item in the inventory
		const item = userInventory.find(invItem => invItem.name === requiredItemName)

		// Check if the user has enough of the required item
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
					// Remove the required items from the user's inventory
					for (let i = 0; i < requiredItemName.length; i++) {
						await removeItemFromUser(interaction.user.id, requiredItemName[i], requiredQuantity[i])
					}

					// Check if the user already has the crafted item
					const craftedItem = userInventory.find(invItem => invItem.id === craftedItemId)

					if (craftedItem) {
						// Increment the quantity of the crafted item in the user's inventory
						await incrementInventoryItemQuantity(interaction.user.id, craftedItemId)
					} else {
						// Add the crafted item to the user's inventory
						await giveItemToUser(interaction.user.id, craftedItemId) // Assuming the quantity is 1
					}

					// Confirm to the user that the crafting was successful
					await buttonInteraction.editReply({
						content: `You have successfully crafted a ${selectedItem.replace("_", " ")}!`,
						components: []
					})
				} catch (error) {
					console.error("Error during crafting:", error)
					await buttonInteraction.editReply({
						content: "There was an error during the crafting process.",
						components: []
					})
				}
			} else if (buttonInteraction.customId === "cancelCraft") {
				// If they clicked cancel, let them know the crafting was canceled
				await buttonInteraction.editReply({ content: "Crafting canceled.", components: [] })
			}
			collector.stop()
		})

		collector.on("end", () => {
			// Disable the buttons after interaction
			confirmButton.setDisabled(true)
			cancelButton.setDisabled(true)
			interaction.editReply({
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton)]
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

	collector.on("end", () => {
		// Optionally handle the end of the interaction, such as disabling the Select Menu
	})
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
		const healthBar = createHealthBar(remainingHealthPercentage)

		primaryEmbed.addFields({ name: "Cursed Energy", value: healthBar })

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
				const playerGradeData = await getPlayerGradeFromDatabase(interaction.user.id)
				const playerGradeString = playerGradeData.grade
				const playerGrade = parseInt(playerGradeString.replace("Grade ", ""), 10)

				// Calculate damage
				const damage = calculateDamage(playerGrade)

				// Calculate boss new health after damage dealt

				randomOpponent.current_health -= damage

				// Ensure boss health is never below 0
				randomOpponent.current_health = Math.max(0, randomOpponent.current_health)

				// Construct result message
				const fightResult = await handleFightLogic(interaction, randomOpponent, playerGrade, damage)
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
					const playerGradeData = await getPlayerGradeFromDatabase(buttonInteraction.user.id)
					const playerGradeString = playerGradeData.grade
					const playerGrade = parseInt(playerGradeString.replace("Grade ", ""), 10)

					const baseDamage = calculateDamage(playerGrade)
					const extraDomainDamage = 50 // Fixed extra damage from domain activation; adjust as needed
					const totalDamage = baseDamage + extraDomainDamage

					randomOpponent.current_health -= totalDamage
					randomOpponent.current_health = Math.max(0, randomOpponent.current_health)

					const fightResult = await handleFightLogic(
						buttonInteraction,
						randomOpponent,
						playerGrade,
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
	playerGrade: number,
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
export async function testDomainEmbed(interaction) {
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
// TEST NUMBER 1 TRILLION!!!!!!!!!!!!!!!!!	hello copilot!
export async function handleDomainGiveCommand(interaction) {
	try {
		const domains = await getAllDomains()

		if (domains.length === 0) {
			await interaction.reply({ content: "No domains available.", ephemeral: true })
			return
		}

		// Map domains to select menu options, ensuring labels do not exceed 25 characters
		const options = domains.slice(0, 25).map(domain => ({
			label: domain.name.length > 25 ? domain.name.substring(0, 22) + "..." : domain.name, // Truncate if necessary
			value: domain.id.toString(), // Using domain ID as the value for easier identification
			description:
				domain.description.length > 50 ? domain.description.substring(0, 47) + "..." : domain.description // Truncate if necessary
		}))

		const row = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId("select-domain")
				.setPlaceholder("Select a domain")
				.addOptions(options)
		)

		await interaction.reply({
			content: "Please select a domain:",
			components: [row],
			ephemeral: false
		})
	} catch (error) {
		console.error("Error fetching domains:", error)
		await interaction.reply({ content: "Failed to fetch domains.", ephemeral: true })
	}
}
