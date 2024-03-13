import { EmbedBuilder } from "@discordjs/builders"
import {
	ActivityType,
	ChannelType,
	ChatInputCommandInteraction,
	Client,
	GatewayIntentBits,
	Partials,
	PermissionFlagsBits,
	REST,
	Routes,
	SlashCommandBuilder
} from "discord.js"
import { config as dotenv } from "dotenv"
import {
	HandleCheckDomainCommand,
	handleBalanceCommand,
	handleCraftCommand,
	handleDailyCommand,
	handleDigcommand,
	handleFightCommand,
	handleInventoryCommand,
	handleJujutsuCommand,
	handleLookupCommand,
	handleProfileCommand,
	handleRegistercommand,
	handleStatusCommand,
	handleWorkCommand,
	useCommand
} from "./command.js"
import { handleKissCommand } from "./commandgifs.js"

// interface Item {
// 	id: string
// 	name: string
// 	description: string
// 	quantity: number
// }
// Define the structure for an inventory item
// interface InventoryItem {
// 	name: string
// 	quantity: number
// 	price: number
// }

// Function to add an item to the inventory
// async function addItemToInventory(userId: string, item: Item) {
// 	// Ensure there's an inventory array for the user
// 	inventoryDb.data.inventories[userId] = inventoryDb.data.inventories[userId] || []
// 	// Check if the item already exists in the inventory
// 	const existingItemIndex = inventoryDb.data.inventories[userId].findIndex(i => i.name === item.name)
// 	if (existingItemIndex > -1) {
// 		// If the item exists, just update the quantity
// 		inventoryDb.data.inventories[userId][existingItemIndex].quantity += item.quantity
// 	} else {
// 		// If the item does not exist, add it to the inventory
// 		inventoryDb.data.inventories[userId].push(item)
// 	}
// 	// Write the updated inventory to the database
// 	await inventoryDb.write()
// }

// Load secrets from the .env file
dotenv()

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	],
	partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User]
})

const activities = [
	{ name: "Jujutsu Kaisen", type: ActivityType.Watching },
	{ name: "Gojo’s explanations", type: ActivityType.Listening },
	{ name: "with Sukuna’s fingers", type: ActivityType.Playing },
	{ name: "Domain Expansion theories", type: ActivityType.Watching },
	{ name: "The Shibuya Incident", type: ActivityType.Playing },
	{ name: "Exchange Event", type: ActivityType.Competing }
]
let index = 0

// status update when bot turns on or refreshes
client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`)
	setInterval(() => {
		// Update the bot's status with a different activity type
		if (index === activities.length) index = 0 // Reset index if it's at the end of the array
		const activity = activities[index]
		client.user.setPresence({
			activities: [{ name: activity.name, type: activity.type }],
			status: "online"
		})
		index++
	}, 25000) // Change status every 10000 milliseconds (10 seconds)
})

client.on("guildCreate", guild => {
	// Attempt to find a "general" channel or any suitable channel to send a welcome message
	let defaultChannel = null
	guild.channels.cache.forEach(channel => {
		if (channel.type === ChannelType.GuildText && !defaultChannel) {
			if (channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)) {
				defaultChannel = channel
			}
		}
	})

	// If a suitable channel is found, send a message
	if (defaultChannel) {
		defaultChannel.send(
			"This is the discord jujutsu kaisen bot, [ WIP ] Please use /Register to start! then proceed with /help"
		)
	}
})

const clientId = "991443928790335518"
// Increase the listener limit for the interactionCreate event
client.setMaxListeners(20) // Set it to a reasonable value based on your use case
//client.on("interactionCreate", async interaction => {})
const prefix = "g"
// Cooldown management
export const workCooldowns = new Map<string, number>()
export const COOLDOWN_TIME = 60 * 60 * 1000 // 1 hour in milliseconds
export const digCooldowns = new Map()
export const digCooldown = 15 * 60 * 1000 // 15 minutes in milliseconds
export const digCooldownBypassIDs = ["917146454940844103", "292385626773258240"] // IDs that can bypass cooldown
export const randomdig2 = [
	"Burrowed",
	"Found",
	"Unearthed",
	"Discovered",
	"Excavated",
	"Uncovered",
	"Dug up",
	"Dug out",
	"Exhumed"
]

export const userLastDaily = new Map<string, number>() // Maps user IDs to the last time they used /daily

// Slash Commands
const commands = [
	new SlashCommandBuilder()
		.setName("useitem") // Command name as it will appear in Discord
		.setDescription("Use an item from your inventory")
		.addStringOption(option =>
			option
				.setName("item")
				.setDescription("The name of the item to use")
				.setRequired(true)
				.addChoices({ name: "Sukuna Finger", value: "Sukuna Finger" })
		),
	new SlashCommandBuilder().setName("profile").setDescription("Profile"),
	new SlashCommandBuilder().setName("domain_status").setDescription("Domain Status"),
	new SlashCommandBuilder().setName("quest").setDescription("Profile"),
	new SlashCommandBuilder().setName("shop").setDescription("Shop"),
	new SlashCommandBuilder().setName("fight").setDescription("Fight a random opponent!"),
	new SlashCommandBuilder().setName("jujutsu_status").setDescription("Jujutsu Stats"),
	new SlashCommandBuilder().setName("help").setDescription("Help"),
	new SlashCommandBuilder().setName("status").setDescription("Bot Status!"),
	new SlashCommandBuilder().setName("balance").setDescription("Balance"),
	new SlashCommandBuilder().setName("inventory").setDescription("User Inventory!"),
	new SlashCommandBuilder().setName("dig").setDescription("Dig for items!"),
	new SlashCommandBuilder().setName("work").setDescription("Work for money!"),
	new SlashCommandBuilder().setName("register").setDescription("Join Jujutsu Rankings!"),
	new SlashCommandBuilder().setName("daily").setDescription("Daily Cash!"),
	new SlashCommandBuilder()
		.setName("craft")
		.setDescription("Craft an item using components in your inventory.")
		.addStringOption(option =>
			option
				.setName("item")
				.setDescription("The item you want to craft")
				.setRequired(true)
				.addChoices(
					{ name: "Prison Realm", value: "prison_realm" },
					{ name: "Six Eyes", value: "six_eyes" },
					{ name: "Jogos Balls", value: "jogos_balls" }
				)
		),
	new SlashCommandBuilder().setName("lookup").setDescription("Look up information about a specific item.")
].map(command => command.toJSON())

const rest = new REST({ version: "10" }).setToken(process.env["DISCORD_BOT_TOKEN"])

async function doApplicationCommands() {
	try {
		console.log("Started refreshing application (/) commands.")

		await rest.put(Routes.applicationCommands(clientId), { body: commands })

		console.log("Successfully reloaded application (/) commands.")
	} catch (error) {
		console.error(error)
	}
}
doApplicationCommands()
// --------------------------------------------------------------------------------------------------------------------------
//
//
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction
	const { commandName } = chatInputInteraction
	if (commandName === "help") {
		const helpEmbed = new EmbedBuilder()
			.setAuthor({
				name: "Jujutsu Kaisen Bot",
				iconURL: "https://bit.ly/4cfWISM"
			})
			.setColor(0x000000)
			.setThumbnail("https://bit.ly/3wWCEEQ")
			.setTitle("↓↓↓↓ **Cursed Commands** ↓↓↓↓")
			.setDescription(
				"Dive into the world of Jujutsu Sorcerers with your very own Cursed Techniques. Each command is a step into the thrilling universe of curses and battles. Ready to unleash your potential?"
			)
			.addFields([
				{
					name: "**General Commands**",
					value: "Register - Join the ranks of sorcerers\nDig - Unearth cursed objects\nInventory - Review your collected items\nProfile - Display your sorcerer profile\nBalance - Check your yen balance\nWork - Earn yen through missions\nLookup - Discover details about objects\nDaily - Claim your daily curse"
				},
				{
					name: "**Cursed Technique Commands**",
					value: "Kiss, Hug,"
				},
				{
					name: "**Jujutsu System!**",
					value: "Fight - Engage in battles using your cursed energy\nCraft - Create cursed objects or tools\nUseItem - Activate a cursed object\nDomain_Status - Check If you have domain expansion!\nJujutsu_Status - View your cursed energy and Grade!"
				}
			])
			.setTimestamp()
			.setFooter({
				text: "Explore and enjoy the world of curses!"
			})

		await interaction.reply({ embeds: [helpEmbed] })
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "profile") {
		await handleProfileCommand(chatInputInteraction)
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "balance") {
		await handleBalanceCommand(chatInputInteraction)
	}
})
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "inventory") {
		await handleInventoryCommand(chatInputInteraction)
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "dig") {
		await handleDigcommand(chatInputInteraction)
	}
})
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "work") {
		await handleWorkCommand(chatInputInteraction)
	}
})
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "register") {
		await handleRegistercommand(chatInputInteraction)
	}
})
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "craft") {
		await handleCraftCommand(chatInputInteraction)
	}
})
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "lookup") {
		await handleLookupCommand(chatInputInteraction)
	}
})
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "daily") {
		await handleDailyCommand(chatInputInteraction)
	}
})
client.on("messageCreate", async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return

	const args = message.content.slice(prefix.length).trim().split(/ +/)
	const command = args.shift().toLowerCase()

	// Handle the 'kiss' command
	if (command === "kiss") {
		handleKissCommand(message)
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "status") {
		await handleStatusCommand(chatInputInteraction)
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "jujutsu_status") {
		await handleJujutsuCommand(chatInputInteraction)
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "fight") {
		await handleFightCommand(chatInputInteraction)
	}
})
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "useitem") {
		await useCommand(chatInputInteraction)
	}
})
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "domain_status") {
		await HandleCheckDomainCommand(chatInputInteraction)
	}
})

client.login(process.env["DISCORD_BOT_TOKEN"])
