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
	handleSelectMenuInteraction,
	handleShopCommand,
	handleStatusCommand,
	handleWorkCommand
} from "./command.js"
import { handleFiddleCommand, handleKissCommand } from "./commandgifs.js"

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

// status update when bot turns on or refreshes
client.once("ready", () => {
	console.log("Ready!")
	client.user.setPresence({
		activities: [
			{
				name: "Jujutsu Kaisen!",
				type: ActivityType.Watching
			}
		],
		status: "online"
	})
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
export const digCooldown = 1000 * 60 * 60 // 1 hour cooldown
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
	new SlashCommandBuilder().setName("profile").setDescription("Profile"),
	new SlashCommandBuilder().setName("quest").setDescription("Profile"),
	new SlashCommandBuilder().setName("shop").setDescription("Shop"),
	new SlashCommandBuilder().setName("fight").setDescription("Fight a random opponent!"),
	new SlashCommandBuilder().setName("jujutsu_status").setDescription("Jujutsu Stats"),
	new SlashCommandBuilder().setName("help").setDescription("Help"),
	new SlashCommandBuilder().setName("status").setDescription("Bot Status!"),
	new SlashCommandBuilder().setName("balance").setDescription("Balance"),
	new SlashCommandBuilder().setName("inventory").setDescription("User Inventory!"),
	new SlashCommandBuilder().setName("dig").setDescription("Dig for items!"),
	new SlashCommandBuilder()
		.setName("sell")
		.setDescription("Sell an item from your inventory.")
		.addStringOption(option =>
			option.setName("item").setDescription("The name of the item you want to sell.").setRequired(true)
		)
		.addIntegerOption(option =>
			option.setName("quantity").setDescription("The quantity of the item you want to sell.").setRequired(false)
		),
	new SlashCommandBuilder().setName("work").setDescription("work"),
	new SlashCommandBuilder().setName("register").setDescription("join jujutsu"),
	new SlashCommandBuilder().setName("daily").setDescription("sthu"),
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
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "help") {
		const helpEmbed = new EmbedBuilder()
			.setAuthor({
				name: "Satoru Gojo",
				iconURL:
					"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/7040e917-2676-4436-838b-34c95352f75f/dejti5s-bfa1c2ab-a198-4b74-9e25-93f9fa09122d.png/v1/fill/w_745,h_1073/jujutsu_kaisen___satoru_gojo_render_by_stormydayze_dejti5s-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTMwMCIsInBhdGgiOiJcL2ZcLzcwNDBlOTE3LTI2NzYtNDQzNi04MzhiLTM0Yzk1MzUyZjc1ZlwvZGVqdGk1cy1iZmExYzJhYi1hMTk4LTRiNzQtOWUyNS05M2Y5ZmEwOTEyMmQucG5nIiwid2lkdGgiOiI8PTkwMiJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.r0XKb_AjUzUSDqa6P6kk1velHomh299mrxA5QVqdvJE"
			})
			.setColor(0x000000)
			.setThumbnail(
				"https://upload.wikimedia.org/wikipedia/en/thumb/9/96/SatoruGojomanga.png/220px-SatoruGojomanga.png"
			)
			.setTitle("↓↓↓↓ **Commands** ↓↓↓↓")
			.setDescription("**Register, Dig, Sell, Inventory, Profile, Balance, Work, Daily,**")
			.addFields({
				name: "**PREFIX __G__** Image Commands",
				value: "Kiss, Hug, Snuggle, Fuck, Bite, Lick, Fiddle."
			})
			.addFields({
				name: "**Jujutsu System!**",
				value: "Fight, Craft, Lookup, Jujutsu Status! [ More Coming Soon! ] "
			})
			.setTimestamp()

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
client.on("messageCreate", async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return

	const args = message.content.slice(prefix.length).trim().split(/ +/)
	const command = args.shift().toLowerCase()

	// Handle the 'fiddle' command
	if (command === "fiddle") {
		handleFiddleCommand(message)
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
	if (interaction.isChatInputCommand()) {
		const chatInputInteraction = interaction as ChatInputCommandInteraction
		const { commandName } = chatInputInteraction
		if (commandName === "shop") {
			await handleShopCommand(chatInputInteraction)
		}
	} else if (interaction.isStringSelectMenu()) {
		// Handle select menu interactions
		await handleSelectMenuInteraction(interaction)
	}
})

client.login(process.env["DISCORD_BOT_TOKEN"])
