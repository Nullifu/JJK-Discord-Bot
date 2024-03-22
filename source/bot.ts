import { ActionRowBuilder, EmbedBuilder } from "@discordjs/builders"
import {
	ActivityType,
	ButtonBuilder,
	ButtonStyle,
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
	handleAchievementsCommand,
	handleBalanceCommand,
	handleCraftCommand,
	handleDailyCommand,
	handleDigCommand,
	handleDomainSelection,
	handleFightCommand,
	handleInventoryCommand,
	handleJobSelection,
	handleProfileCommand,
	handleRegisterCommand,
	handleSearchCommand,
	handleSupportCommand,
	handleTitleSelectCommand,
	handleUpdateCommand,
	handleUseItemCommand,
	handleWorkCommand
} from "./command.js"
import { checkRegistrationMiddleware } from "./middleware.js"

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

let activities = [
	{ name: "Jujutsu Kaisen", type: ActivityType.Watching },
	{ name: "Gojo’s explanations", type: ActivityType.Listening },
	{ name: "with Sukuna’s fingers", type: ActivityType.Playing },
	{ name: "Domain Expansion theories", type: ActivityType.Watching },
	{ name: "The Shibuya Incident", type: ActivityType.Playing },
	{ name: "Exchange Event", type: ActivityType.Competing },
	{ name: "/register", type: ActivityType.Listening }
]
let index = 0

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`)

	setInterval(async () => {
		// Dynamically update the activities list with current member and server counts
		await updateDynamicActivities()

		// Cycle through the updated activities array
		if (index === activities.length) index = 0 // Reset index if it's at the end of the array
		const activity = activities[index]
		client.user.setPresence({
			activities: [{ name: activity.name, type: activity.type }],
			status: "online"
		})
		index++
	}, 25000) // Update every 25 seconds
})

async function updateDynamicActivities() {
	let totalMembers = 0
	client.guilds.cache.forEach(guild => {
		totalMembers += guild.memberCount
	})

	// Update or add dynamic activities based on the current member and server count
	activities = [
		{ name: `${totalMembers} members`, type: ActivityType.Listening }, // Dynamic member count
		{ name: `${client.guilds.cache.size} servers`, type: ActivityType.Listening }, // Dynamic server count
		{ name: "Jujutsu Kaisen", type: ActivityType.Watching },
		{ name: "Gojo’s explanations", type: ActivityType.Listening },
		{ name: "with Sukuna’s fingers", type: ActivityType.Playing },
		{ name: "Domain Expansion theories", type: ActivityType.Watching },
		{ name: "The Shibuya Incident", type: ActivityType.Playing },
		{ name: "Exchange Event", type: ActivityType.Competing },
		{ name: "/register", type: ActivityType.Listening }
	]
}

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

	if (defaultChannel) {
		// Create an embed with EmbedBuilder in v14
		const welcomeEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Welcome to the Jujutsu Kaisen Discord Bot!")
			.setDescription("This is the Discord Jujutsu Kaisen bot, currently a work in progress (WIP).")
			.addFields(
				{ name: "Getting Started", value: "Please use `/register` to start!" },
				{ name: "Need Help?", value: "Proceed with `/help` to explore all the features." }
			)
			.setFooter({ text: "Enjoy your journey into the world of Jujutsu Kaisen with us!" })
			.setTimestamp()

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setURL("https://discord.gg/wmVyBpqWgs")
				.setLabel("Join Our Support//Community Server!")
		)

		// Send the embed with the button
		defaultChannel.send({ embeds: [welcomeEmbed], components: [row] })
	}
})

export const latestVersion = "1.1" // Update this with each new version
const clientId = "1216889497980112958"
client.setMaxListeners(40) // Set it to a reasonable value based on your use case
export const workCooldowns = new Map<string, number>()
export const COOLDOWN_TIME = 60 * 60 * 1000 // 1 hour in milliseconds
export const digCooldowns = new Map<string, number>()
export const digCooldown = 15 * 1000 // 30 seconds in milliseconds
export const digCooldownBypassIDs = ["917146454940844103"] // IDs that can bypass cooldown
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
	new SlashCommandBuilder().setName("profile").setDescription("User Profile"),
	new SlashCommandBuilder().setName("achievements").setDescription("Displays your achievements."),
	new SlashCommandBuilder().setName("ping").setDescription("Latency Check"),
	new SlashCommandBuilder().setName("selectjob").setDescription("Choose a Job"),
	new SlashCommandBuilder().setName("search").setDescription("Search for an Item"),
	new SlashCommandBuilder().setName("update").setDescription("Update from the developer!"),
	new SlashCommandBuilder().setName("support").setDescription("Get a link to the support server."),
	new SlashCommandBuilder().setName("selectitle").setDescription("Choose a Title"),
	new SlashCommandBuilder().setName("inventory").setDescription("User Inventory"),
	new SlashCommandBuilder().setName("work").setDescription("Work For Money!"),
	new SlashCommandBuilder().setName("dig").setDescription("Dig For Items!"),
	new SlashCommandBuilder().setName("fight").setDescription("Fight Fearsome Curses!"),
	new SlashCommandBuilder().setName("daily").setDescription("Daily Rewards!"),
	new SlashCommandBuilder().setName("domainselection").setDescription("Manifest your Domain!"),
	new SlashCommandBuilder().setName("balance").setDescription("User Balance"),
	new SlashCommandBuilder().setName("register").setDescription("Join Jujutsu Rankings!"),
	new SlashCommandBuilder().setName("help").setDescription("Help"),
	new SlashCommandBuilder()
		.setName("deposit")
		.setDescription("Deposit money into your bank account.")
		.addNumberOption(option => option.setName("amount").setDescription("The amount to deposit").setRequired(true)),
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
					{ name: "Jogos (Fixed) Balls", value: "jogos_fixed_balls" },
					{ name: "Domain Token", value: "domain_token" }
				)
		),
	new SlashCommandBuilder()
		.setName("useitem") // Command name as it will appear in Discord
		.setDescription("Use an item from your inventory")
		.addStringOption(option =>
			option
				.setName("item")
				.setDescription("The name of the item to use")
				.setRequired(true)
				.addChoices({ name: "Sukuna Finger", value: "Sukuna Finger" })
		)
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
					value: "Update -  View recent updates!\nRegister - Join the ranks of sorcerers\nDig - Unearth cursed objects\nInventory - Review your collected items\nProfile - Display your sorcerer profile\nBalance - Check your yen balance\nWork - Earn yen through missions\nDaily - Claim your daily curse"
				},
				{
					name: "**Jujutsu System!**",
					value: "Fight - Engage in battles using your cursed energy\nCraft - Create cursed objects or tools\nUseItem - Activate a cursed object\nDomainSelection - Manifest your domain expansion!"
				}
			])
			.setTimestamp()
			.setFooter({
				text: "Explore and enjoy the world of curses!"
			})

		await interaction.reply({ embeds: [helpEmbed], ephemeral: true })
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isChatInputCommand()) return
	if (interaction.commandName === "ping") {
		const before = Date.now()
		await interaction.deferReply()
		const latency = Date.now() - before
		await interaction.editReply(`Pong! Latency is ${latency}ms. API Latency is ${Math.round(client.ws.ping)}ms.`)
		return
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "update") {
		await handleUpdateCommand(chatInputInteraction)
		return
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return
	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "support") {
		await handleSupportCommand(chatInputInteraction)
		return
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isChatInputCommand()) return

	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction

	// Directly handle the 'register' command without middleware check
	if (commandName === "register") {
		await handleRegisterCommand(chatInputInteraction)
		return // Ensure no further processing for 'register' command
	}

	// For other commands, proceed with the middleware check
	const shouldProceed = await checkRegistrationMiddleware(interaction)
	if (!shouldProceed) return

	switch (commandName) {
		case "balance":
			await handleBalanceCommand(chatInputInteraction)
			break
		case "profile":
			await handleProfileCommand(chatInputInteraction)
			break
		case "inventory":
			await handleInventoryCommand(chatInputInteraction)
			break
		case "dig":
			await handleDigCommand(chatInputInteraction)
			break
		case "work":
			await handleWorkCommand(chatInputInteraction)
			break
		case "daily":
			await handleDailyCommand(chatInputInteraction)
			break
		case "craft":
			await handleCraftCommand(chatInputInteraction)
			break
		case "domainselection":
			await handleDomainSelection(chatInputInteraction)
			break
		case "fight":
			await handleFightCommand(chatInputInteraction)
			break
		case "selectjob":
			await handleJobSelection(chatInputInteraction)
			break
		case "selectitle":
			await handleTitleSelectCommand(chatInputInteraction)
			break
		case "search":
			await handleSearchCommand(chatInputInteraction)
			break
		case "useitem":
			await handleUseItemCommand(chatInputInteraction)
			break
		case "achievements":
			await handleAchievementsCommand(chatInputInteraction)
			break
		default:
		// Handle unknown commands if needed
	}
})

client.login(process.env["DISCORD_BOT_TOKEN"])
