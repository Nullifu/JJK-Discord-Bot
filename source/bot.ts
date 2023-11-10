import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	Interaction,
	Partials,
	PermissionsBitField,
	REST,
	Routes,
	SlashCommandBuilder
} from "discord.js"
import { config as dotenv } from "dotenv"
import * as fs from "fs"
import { JSONPreset } from "lowdb/node"
import path from "path"
import snoowrap from "snoowrap"
import { addUserCurrency, getUserCurrency } from "./currency.js"
interface Item {
	id: string
	name: string
	description: string
	quantity: number
}

// Function to add an item to the inventory
async function addItemToInventory(userId: string, item: Item) {
	// Ensure there's an inventory array for the user
	db.data.inventories[userId] = db.data.inventories[userId] || []
	// Check if the item already exists in the inventory
	const existingItemIndex = db.data.inventories[userId].findIndex(i => i.name === item.name)
	if (existingItemIndex > -1) {
		// If the item exists, just update the quantity
		db.data.inventories[userId][existingItemIndex].quantity += item.quantity
	} else {
		// If the item does not exist, add it to the inventory
		db.data.inventories[userId].push(item)
	}
	// Write the updated inventory to the database
	await db.write()
}
function formatInventoryItems(items: Item[]): string {
	return items.map(item => `${item.quantity}x ${item.name}: ${item.description}`).join("\n")
}

// Load secrets from the .env file
dotenv()

const allowedUserIds = ["292385626773258240", "587323617415659553"] // Replace with the actual user ID

const prefix = "."
const SLAP_COUNTS_FILE = "./slapCounts.json" // Path to the JSON file for slap counts
const SLAP_IMAGE_DIRECTORY = "./gifs/slaps" // Your image directory path
const PUNCH_COUNTS_FILE = "./punchCounts.json"
const PUNCH_IMAGE_DIRECTORY = "./gifs/punch"

const defaultData = { inventories: {} }
const db = await JSONPreset("inventorydb.json", defaultData)

// Define some example jobs. Each job could have a different payout range.
const jobs = [
	{ name: "Osaka", payout: { min: 25000, max: 90000 }, cost: 2500 },
	{ name: "Osakas Friend", payout: { min: 5000, max: 10000 }, cost: 1000 },
	{ name: "newbie", payout: { min: 2500, max: 7600 }, cost: 100 },
	{ name: "Junior Developer", payout: { min: 1000, max: 2000 }, cost: 5000 },
	{ name: "Senior Developer", payout: { min: 2000, max: 5000 }, cost: 10000 },
	{ name: "Lead Developer", payout: { min: 5000, max: 10000 }, cost: 20000 },
	{ name: "Manager", payout: { min: 10000, max: 20000 }, cost: 50000 },
	{ name: "CEO", payout: { min: 20000, max: 150000 }, cost: 100000 }

	// ... add as many jobs as you want
]
const items = [
	{ name: "Stone", rarity: "common", chance: 0.5 },
	{ name: "Noj", rarity: "uncommon", chance: 0.25 },
	{ name: "Osaka", rarity: "rare", chance: 0.15 },
	{ name: "V3x", rarity: "super rare", chance: 0.07 },
	{ name: "Aaya", rarity: "super rare", chance: 0.07 },
	{ name: "ayana and noj", rarity: "legendary", chance: 0.03 } // New item
]

function getRandomItem() {
	const roll = Math.random()
	let cumulativeChance = 0

	for (const item of items) {
		cumulativeChance += item.chance
		if (roll < cumulativeChance) {
			return item
		}
	}
	return null // If no item is found based on the chances
}
// Cooldown setup
const digcooldowns = new Map<string, number>() // userID -> timestamp
const cooldowns = new Map<string, number>() // userID -> timestamp
const workCooldown = 60 * 60 * 1000 // Cooldown in milliseconds (1 hour)
const digCooldown = 10 * 60 * 1000 // Cooldown in milliseconds (10 minutes)
const cooldownsBypassIDs: string[] = ["917146454940844103", "292385626773258240", "1155920349423222814"] // Replace with actual user IDs
const digcooldownsBypassIDs: string[] = [
	"917146454940844103",
	"292385626773258240",
	"1155920349423222814",
	"1002163723256987649"
] // Replace with actual user IDs

// Array of random words or phrases to be used with the slap command
const randomReactions = ["Ouch!", "Wow!", "Bam!", "Slap!", "Pow!", "Whack!", "Boom!", "Biff!", "Zap!", "Bop!"]

// Interface for a user's slap count
interface UserSlapCount {
	userId: string
	count: number
}

// ...

// Function to read slap counts and return a sorted array
function getSortedSlapCounts(): UserSlapCount[] {
	try {
		const data = fs.readFileSync(SLAP_COUNTS_FILE, "utf-8")
		const slapCounts: { [key: string]: number } = JSON.parse(data)

		// Create an array from the object with a known structure, then sort it by slap count
		return Object.entries(slapCounts)
			.map(([userId, count]): UserSlapCount => ({ userId, count }))
			.sort((a, b) => b.count - a.count)
	} catch (error) {
		console.error("Error reading the slap counts file:", error)
		return []
	}
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	],
	partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User]
})

const clientId = "831256729668812862"

// Increase the listener limit for the interactionCreate event
client.setMaxListeners(15) // Set it to a reasonable value based on your use case
//client.on("interactionCreate", async interaction => {})

// SLASH COMMAND BUILDERS
const commands = [
	new SlashCommandBuilder().setName("help").setDescription("list of current commands"),
	new SlashCommandBuilder().setName("balance").setDescription("Check your current balance!"),
	new SlashCommandBuilder()
		.setName("add")
		.setDescription("Add currency to your balance.")
		.addIntegerOption(option =>
			option.setName("amount").setDescription("The amount of currency to add").setRequired(true)
		)
].map(command => command.toJSON())

const rest = new REST({ version: "10" }).setToken(process.env["DISCORD_BOT_TOKEN"])

async function doApplicationCommands() {
	try {
		console.log("Started refreshing application (/) commands.")

		await rest.put(Routes.applicationGuildCommands(clientId, "1167392383923666964"), { body: commands })

		console.log("Successfully reloaded application (/) commands.")
	} catch (error) {
		console.error(error)
	}
}
doApplicationCommands()

client.on("interactionCreate", async (interaction: Interaction) => {
	if (interaction.isChatInputCommand()) {
		if (interaction.commandName === "help") {
			await interaction.deferReply()

			// START OF MOST COMMANDS -----------------------------------------------------------------------------------------------------------------------------------------------

			const embed = new EmbedBuilder()
				.setAuthor({
					name: "made by .gwennnn",
					iconURL:
						"https://static.wikia.nocookie.net/shingekinokyojin/images/4/4f/Mikasa_Ackermann_%28Anime%29_character_image.png/revision/latest?cb=20231105175401"
				})
				.setTitle("List of current commands\n**PREFIX for text commands >  .**")
				.setDescription("↓↓↓↓")
				.setColor("#ff9900")
				.setThumbnail(
					"https://gcdn.thunderstore.io/live/repository/icons/mackeye-Osaka-1.0.0.png.256x256_q95.jpg"
				)
				.addFields(
					{ name: "Image Commands", value: "meme, dog, cat, " },
					{ name: "Leaderboards", value: "Slap, Punch, Kill, Kiss, Pet," },
					{ name: "Currency Commands", value: "Work, Balance, Add, Dig, Inventory, Sell" },
					{ name: "Currency Commands > WIP <", value: "Along with leaderboards" },
					{ name: "Slash Commands WIP", value: "oh ma gah" }
				)

			const button = new ButtonBuilder()
				.setCustomId("more_help")
				.setLabel("View Leaderboards")
				.setStyle(ButtonStyle.Primary)

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

			// Follow up with the actual reply
			await interaction.editReply({
				embeds: [embed],
				components: [row]
			})
		}
	} else if (interaction.isButton()) {
		const buttonInteraction = interaction as ButtonInteraction

		if (buttonInteraction.customId === "more_help") {
			const sortedSlapCounts = getSortedSlapCounts()
			// Take the top 10 slap counts, or less if there aren't enough entries
			const topSlaps = sortedSlapCounts.slice(0, 10)

			// Format the leaderboard string
			const leaderboard = topSlaps
				.map((entry, index) => `${index + 1}. <@${entry.userId}> - ${entry.count} slap(s)`)
				.join("\n")

			// Create and send the embed
			const moreHelpEmbed = new EmbedBuilder()
				.setColor(0x00ae86)
				.setTitle("Slap Leaderboard")
				.setDescription(leaderboard)
				.setTimestamp()

			await buttonInteraction.update({ embeds: [moreHelpEmbed], components: [] })
		}
	}
})

const reddit = new snoowrap({
	userAgent: "discordbot v1.0 by /u/Nullifu",
	clientId: process.env["REDDIT_CLIENT_ID"],
	clientSecret: process.env["REDDIT_CLIENT_SECRET"],
	refreshToken: process.env["REDDIT_REFRESH_TOKEN"]
})

client.on("ready", () => {
	console.log(`Logged in as ${client.user?.tag}!`)
	if (client.user) {
		client.user.setPresence({
			activities: [{ name: "Azumanga Daioh ", type: 1 }], // 2 is the type for "Listening"
			status: "dnd"
		})
	}
})
// Load the database
await db.read()
// Set the default data structure if it's null or undefined
db.data ||= { inventories: {} }
// You may also need to write the default data back in case the file was empty or non-existent
await db.write()

client.on("messageCreate", async message => {
	if (message.author.bot) return // Ignore messages from bots
	if (message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).trim().split(/ +/)
		const command = args.shift().toLowerCase()

		if (command === "test") {
			// List of images
			const images = [
				"https://cdn.discordapp.com/attachments/681985000521990179/1138510507565920296/ezgif-5-04af2554ed.gif",
				"https://example.com/image2.gif",
				"https://example.com/image3.gif"
				// Add more image URLs here...
			]

			// Select a random image from the list
			const randomImage = images[Math.floor(Math.random() * images.length)]

			const embed = new EmbedBuilder().setTitle("Here's a random image").setImage(randomImage).setColor("#0099ff")
			await message.reply({ embeds: [embed] })
		} else if (message.content.startsWith(".balance")) {
			// Check if the message mentions another user
			const mention = message.mentions.users.first()

			// Determine whose balance to check
			const userId = mention ? mention.id : message.author.id

			// Fetch currency for the specified user
			const currency = await getUserCurrency(userId)

			// Create the embed
			const balanceEmbed = new EmbedBuilder()
				.setColor(0x00ff00) // You can set whatever color you like
				.setTitle("Balance")
				.setDescription(`User <@${userId}> has **${currency}** osakacoins.`)
				.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
				.setTimestamp()

			// Reply with the embed
			await message.reply({ embeds: [balanceEmbed] })
		} else if (command === "addcoins") {
			if (!allowedUserIds.includes(message.author.id)) {
				const errorEmbed = new EmbedBuilder()
					.setColor(0xff0000) // Red for errors
					.setTitle("Error")
					.setDescription("You do not have permission to use this command. **DEV Only**")
					.setTimestamp()
				await message.reply({ embeds: [errorEmbed] })
				return
			}

			const parts = message.content.split(" ")
			const amount = parts.length > 1 ? parseInt(parts[1], 10) : NaN
			if (isNaN(amount)) {
				const errorEmbed = new EmbedBuilder()
					.setColor(0xff0000) // Red for errors
					.setTitle("Error")
					.setDescription("Please enter a valid number of coins to add.")
					.setTimestamp()
				await message.reply({ embeds: [errorEmbed] })
				return
			}
			await addUserCurrency(message.author.id, amount)
			const addEmbed = new EmbedBuilder()
				.setColor(0x00ff00)
				.setTitle("Coins Added")
				.setDescription(`${amount} coins added to your balance.`)
				.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
				.setTimestamp()
			await message.reply({ embeds: [addEmbed] })

			// Work command logic
		} else if (message.content === ".work") {
			const now = Date.now()
			const lastWorkTime = cooldowns.get(message.author.id) || 0
			const cooldownRemaining = lastWorkTime + workCooldown - now

			if (cooldownRemaining > 0) {
				// User is still on cooldown
				const timeLeft = (cooldownRemaining / 1000 / 60).toFixed(2) // Convert to minutes and format
				const cooldownEmbed = new EmbedBuilder()
					.setColor(0xff0000) // Red color for alert
					.setTitle("Work Cooldown")
					.setDescription(`You need to rest! Please wait ${timeLeft} more minutes before working again.`)
					.setTimestamp()
				await message.reply({ embeds: [cooldownEmbed] })
				return
			}

			// User is not on cooldown, proceed with work command
			const job = jobs[Math.floor(Math.random() * jobs.length)]
			const amountEarned = Math.floor(Math.random() * (job.payout.max - job.payout.min + 1)) + job.payout.min

			// Add the amount earned to the user's balance
			await addUserCurrency(message.author.id, amountEarned)

			// Update the cooldown for the user
			cooldowns.set(message.author.id, now)

			// Create and send the work embed
			const workEmbed = new EmbedBuilder()
				.setColor(0x00ff00) // Green color for success
				.setTitle(`${job.name} Work`)
				.setDescription(`You worked as a ${job.name} and earned ${amountEarned} osakacoins!`)
				.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
				.setTimestamp()

			await message.reply({ embeds: [workEmbed] })
		} else if (message.content.startsWith(".dig")) {
			if (message.content.startsWith(".dig")) {
				const currentTime = Date.now()
				const authorId = message.author.id
				const timestamp = digcooldowns.get(authorId)

				// Check cooldown
				if (timestamp) {
					const expirationTime = timestamp + digCooldown
					if (currentTime < expirationTime && !digcooldownsBypassIDs.includes(authorId)) {
						// Send a message with a dynamic timestamp
						await message.reply(
							`You need to wait before using the \`.dig\` command again. You can dig again <t:${Math.floor(
								expirationTime / 1000
							)}:R>.`
						)
						return
					}
				}

				// Set or update the cooldown
				digcooldowns.set(authorId, currentTime)

				// The command logic
				const coinsFound = Math.floor(Math.random() * 20000) + 1
				await addUserCurrency(message.author.id, coinsFound)

				// The logic for finding an item
				const itemFound = getRandomItem()
				const itemMessage = ""
				if (itemFound) {
					// Define the item with a quantity of 1
					const itemToAdd: Item = {
						id: itemFound.name.toLowerCase().replace(/\s/g, "_"),
						name: itemFound.name,
						description: `A ${itemFound.rarity} item found while digging.`,
						quantity: 1
					}

					// Add the found item to the user's inventory
					await addItemToInventory(authorId, itemToAdd)
					const itemMessage = `You found a ${itemFound.name}!`

					// Create the response embed
					const digEmbed = new EmbedBuilder()
						.setColor(0xffd700) // Gold color
						.setTitle("Digging Results")
						.setDescription(`You found ${coinsFound} coins! ${itemMessage}`)
						.setTimestamp()

					// Send the embed response
					await message.reply({ embeds: [digEmbed] })
				}
			}

			// fetch WIP v3
		} else if (command === "meme") {
			const subredditName = "meme" // replace with subreddit to fetch from
			const subreddit = reddit.getSubreddit(subredditName)
			subreddit
				.getRandomSubmission()
				.then(async randomPost => {
					if (randomPost.url) {
						const embed = new EmbedBuilder()
							.setTitle(randomPost.title)
							.setImage(randomPost.url)
							.setColor("#0099ff")

						await message.reply({ embeds: [embed] })
					} else {
						message.reply("No images found")
					}
				})
				.catch(error => {
					console.error("Error fetching image from Reddit:", error)
					message.reply("An error occurred while fetching the image from Reddit.")
				})

			// reddit fetch cat
		} else if (command === "cat") {
			const subredditName = "cats" // replace with subreddit to fetch from
			const subreddit = reddit.getSubreddit(subredditName)
			subreddit.getRandomSubmission().then(async randomPost => {
				if (randomPost.url) {
					const embed = new EmbedBuilder()
						.setTitle(randomPost.title)
						.setImage(randomPost.url)
						.setColor("#0099ff")
					await message.reply({ embeds: [embed] })
				}
			})

			// reddit fetch dog
		} else if (command === "dog") {
			const subredditName = "dogs" // replace with subreddit to fetch from
			const subreddit = reddit.getSubreddit(subredditName)
			subreddit.getRandomSubmission().then(async randomPost => {
				if (randomPost.url) {
					const embed = new EmbedBuilder()
						.setTitle(randomPost.title)
						.setImage(randomPost.url)
						.setColor("#0099ff")
					await message.reply({ embeds: [embed] })
				}
			})

			// reddit fetch cat
		} else if (command === "aww") {
			const subredditName = "aww" // replace with subreddit to fetch from
			const subreddit = reddit.getSubreddit(subredditName)
			subreddit.getRandomSubmission().then(async randomPost => {
				if (randomPost.url) {
					const embed = new EmbedBuilder()
						.setTitle(randomPost.title)
						.setImage(randomPost.url)
						.setColor("#0099ff")
					await message.reply({ embeds: [embed] })
				}
			})

			// reddit fetch 18+
		} else if (command === "TEST DONT SEND THIS!") {
			const subredditName = "hentai" // replace with subreddit to fetch from
			const subreddit = reddit.getSubreddit(subredditName)
			subreddit.getRandomSubmission().then(async randomPost => {
				if (randomPost.url) {
					const embed = new EmbedBuilder()
						.setTitle(randomPost.title)
						.setImage(randomPost.url)
						.setColor("#0099ff")
					await message.reply({ embeds: [embed] })
				}
			})
		} else if (command === "slap") {
			// Check if there is a user mentioned
			if (message.mentions.users.size === 0) {
				await message.reply("You need to mention a user to slap!")
				return
			}

			const userToSlap = message.mentions.users.first()
			let slapCounts: Record<string, number>

			try {
				slapCounts = JSON.parse(fs.readFileSync(SLAP_COUNTS_FILE, "utf8"))
			} catch (err) {
				slapCounts = {}
			}

			const userId = userToSlap.id
			slapCounts[userId] = (slapCounts[userId] || 0) + 1

			try {
				fs.writeFileSync(SLAP_COUNTS_FILE, JSON.stringify(slapCounts, null, 2), "utf8")
			} catch (err) {
				console.error("Error writing to slap counts file:", err)
				return
			}

			try {
				const files = fs.readdirSync(SLAP_IMAGE_DIRECTORY)
				const imageFiles = files.filter(file => /\.(png|jpe?g|gif)$/i.test(file))

				if (imageFiles.length === 0) {
					console.error("No images found in the directory")
					return
				}

				const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)]
				const imagePath = path.join(SLAP_IMAGE_DIRECTORY, randomImage)

				// Select a random word or phrase
				const randomReaction = randomReactions[Math.floor(Math.random() * randomReactions.length)]

				const embed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("Slap!")
					.setDescription(`${message.author.tag} just slapped ${userToSlap.tag}! ${randomReaction} `)
					.setImage(`attachment://${randomImage}`)
					.setFooter({ text: `That's slap number ${slapCounts[userId]} for them!` })
					.setTimestamp()

				const imageAttachment = new AttachmentBuilder(imagePath, { name: randomImage })

				await message.channel.send({ embeds: [embed], files: [imageAttachment] })
			} catch (err) {
				console.error("Error reading image directory:", err)
			}

			// Check if the command is `punch`
		} else if (command === "punch") {
			// Check if there is a user mentioned
			if (message.mentions.users.size === 0) {
				await message.reply("You need to mention a user to slap!")
				return
			}

			const userToPunch = message.mentions.users.first()
			let punchCounts: Record<string, number>

			try {
				punchCounts = JSON.parse(fs.readFileSync(PUNCH_COUNTS_FILE, "utf8"))
			} catch (err) {
				punchCounts = {}
			}

			const userId = userToPunch.id
			punchCounts[userId] = (punchCounts[userId] || 0) + 1

			try {
				fs.writeFileSync(PUNCH_COUNTS_FILE, JSON.stringify(punchCounts, null, 2), "utf8")
			} catch (err) {
				console.error("Error writing to slap counts file:", err)
				return
			}

			try {
				const files = fs.readdirSync(PUNCH_IMAGE_DIRECTORY)
				const imageFiles = files.filter(file => /\.(png|jpe?g|gif)$/i.test(file))

				if (imageFiles.length === 0) {
					console.error("No images found in the directory")
					return
				}

				const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)]
				const imagePath = path.join(PUNCH_IMAGE_DIRECTORY, randomImage)

				// Select a random word or phrase
				const randomReaction = randomReactions[Math.floor(Math.random() * randomReactions.length)]

				const embed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle("Punch!")
					.setDescription(`${message.author.tag} just punched ${userToPunch.tag}! ${randomReaction} `)
					.setImage(`attachment://${randomImage}`)
					.setFooter({ text: `That's punch number ${punchCounts[userId]} for them!` })
					.setTimestamp()

				const imageAttachment = new AttachmentBuilder(imagePath, { name: randomImage })

				await message.channel.send({ embeds: [embed], files: [imageAttachment] })
			} catch (err) {
				console.error("Error reading image directory:", err)
			}
		} else if (command === "mute") {
			const embed = new EmbedBuilder()

			// Check if the message author has the required permission to mute members
			if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
				embed
					.setColor(0xff0000) // Red color for error
					.setDescription("You do not have permission to mute members.")
				await message.reply({ embeds: [embed] })
				return
			}

			// Check if the bot has the required permission to manage roles
			if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				embed
					.setColor(0xff0000) // Red color for error
					.setDescription("I do not have permission to manage roles.")
				await message.reply({ embeds: [embed] })
				return
			}

			if (!args.length) {
				embed
					.setColor(0xffa500) // Orange color for warning
					.setDescription("You need to mention a user to mute!")
				await message.reply({ embeds: [embed] })
				return
			}

			const user = message.mentions.members.first()
			if (!user) {
				embed
					.setColor(0xffa500) // Orange color for warning
					.setDescription("Please mention a valid user to mute!")
				await message.reply({ embeds: [embed] })
				return
			}

			const muteRole = message.guild.roles.cache.find(role => role.name === "Muted")
			if (!muteRole) {
				embed
					.setColor(0xffa500) // Orange color for warning
					.setDescription("Mute role does not exist!")
				await message.reply({ embeds: [embed] })
				return
			}

			// Check if the bot's highest role is above the target's highest role
			if (message.guild.members.me.roles.highest.comparePositionTo(user.roles.highest) <= 0) {
				embed
					.setColor(0xff0000) // Red color for error
					.setDescription("I cannot mute this user as their role is higher than or equal to mine.")
				await message.reply({ embeds: [embed] })
				return
			}

			await user.roles.add(muteRole)
			embed
				.setColor(0x00ff00) // Green color for success
				.setDescription(`${user.user.tag} has been muted.`)
			await message.reply({ embeds: [embed] })
		}

		if (command === "inventory") {
			const userId = message.author.id

			// Show inventory
			if (!args.length) {
				const userInventory = db.data.inventories[userId] || []
				const inventoryEmbed = new EmbedBuilder()
					.setColor(0x00ae86) // Set the color of the embed
					.setTitle(`${message.author.username}'s Inventory`)
					.setDescription(formatInventoryItems(userInventory)) // Use the function to format items
					.setTimestamp()

				await message.reply({ embeds: [inventoryEmbed] })
			}

			// Add item to inventory
			if (args[0] === "additem") {
				const item = args[1]
				if (!item) {
					message.reply("Please specify an item to add.")
					return
				}

				// Initialize inventory for user if it doesn't exist
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				db.data!.inventories[userId] = db.data!.inventories[userId] || []
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				db.data!.inventories[userId].push(item)
				await db.write() // Save the database
				await message.reply(`${item} added to your inventory.`)
			}
		}

		if (command === "additem") {
			const userId = message.author.id
			const itemName = args[0]
			const itemDescription = args.slice(1).join(" ")
			const quantity = 1 // Default quantity to 1, you can parse args for a different quantity

			if (!itemName) {
				await message.reply("Please specify an item name.")
				return
			}

			if (!itemDescription) {
				await message.reply("Please provide a description for the item.")
				return
			}

			const newItem: Item = {
				id: `${Date.now()}`, // Simple generation of a unique ID based on the current timestamp
				name: itemName,
				description: itemDescription,
				quantity: quantity
			}

			await addItemToInventory(userId, newItem)
			await message.reply(`Added ${quantity}x ${itemName} to your inventory.`)
		}

		if (command === "chiyo") {
			await message.reply("You brutally murder chiyo!")
		}
	}
})

client.login(process.env["DISCORD_BOT_TOKEN"])
