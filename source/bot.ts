/* eslint-disable no-case-declarations */
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

import cron from "node-cron"
import {
	claimQuestsCommand,
	generateShopEmbed,
	generateStatsEmbed,
	handleAcceptTrade,
	handleAchievementsCommand,
	handleActiveTradesCommand,
	handleAlertCommand,
	handleBalanceCommand,
	handleBegCommand,
	handleClaimVoteRewards,
	handleCraftCommand,
	handleDailyCommand,
	handleDigCommand,
	handleDomainSelection,
	handleDonateCommand,
	handleEquipInateClanCommand,
	handleEquipTechniqueCommand,
	handleEquipTransformationCommand,
	handleFightCommand,
	handleGambleCommand,
	handleGuideCommand,
	handleInventoryCommand,
	handleJobSelection,
	handleJujutsuStatsCommand,
	handleLeaderBoardCommand,
	handleLookupCommand,
	handlePetShop,
	handlePreviousTradesCommand,
	handleProfileCommand,
	handleQuestCommand,
	handleRegisterCommand,
	handleSearchCommand,
	handleSellCommand,
	handleShopCommand,
	handleSupportCommand,
	handleTame,
	handleTechniqueShopCommand,
	handleTitleSelectCommand,
	handleTradeCommand,
	handleUnequipQuestCommand,
	handleUnequipTechniqueCommand,
	handleUpdateCommand,
	handleUseItemCommand,
	handleViewEffectsCommand,
	handleViewShikigami,
	handleViewTechniquesCommand,
	handleVoteCommand,
	handleWorkCommand,
	processTradeSelection,
	viewQuestsCommand
} from "./command.js"
import { lookupItems } from "./items jobs.js"
import { checkRegistrationMiddleware } from "./middleware.js"
import { getShopLastReset, handleToggleHeavenlyRestrictionCommand, initializeDatabase } from "./mongodb.js"
import { handleADDTECHNIQUE, handleGiveItemCommand, handleREMOVE, handleUpdateBalanceCommand } from "./owner.js"

dotenv()

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.DirectMessages
	],
	partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User]
})

import log4js from "log4js"

// Configure log4js
log4js.configure({
	appenders: {
		console: { type: "console" },
		file: { type: "file", filename: "logs/app.log" }
	},
	categories: {
		default: { appenders: ["console", "file"], level: "debug" }
	}
})

// Get a logger instance
export const logger = log4js.getLogger("jjk-bot")

// Use the logger
logger.trace("This is a trace message")
logger.debug("This is a debug message")
logger.info("This is an info message")
logger.warn("This is a warning message")
logger.error("This is an error message")
logger.fatal("This is a fatal message")

let activities = [
	{ name: "Update 6.0", type: ActivityType.Playing },
	{ name: "Jujutsu Kaisen", type: ActivityType.Watching },
	{ name: "The Shibuya Incident", type: ActivityType.Playing },
	{ name: "Exchange Event", type: ActivityType.Competing },
	{ name: "/register", type: ActivityType.Listening }
]
let index = 0

client.on("ready", async () => {
	logger.info(`Logged in as ${client.user.tag}!`)
	client.guilds.cache.forEach(guild => {
		logger.info(`${guild.name} (ID: ${guild.id})`)
	})

	try {
		await initializeDatabase()
		logger.info("Database initialization completed.")
	} catch (error) {
		logger.fatal("Error initializing database:", error)
	}
})

setInterval(async () => {
	await updateDynamicActivities()

	if (index === activities.length) index = 0
	const activity = activities[index]
	client.user.setPresence({
		activities: [{ name: activity.name, type: activity.type }],
		status: "online"
	})
	index++
}, 60000) // Update every 25 seconds

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
		{ name: "The Shibuya Incident", type: ActivityType.Playing },
		{ name: "Exchange Event", type: ActivityType.Competing },
		{ name: "/register", type: ActivityType.Listening }
	]
}

client.on("guildCreate", guild => {
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
				{ name: "Need Help?", value: "Proceed with `/help` to explore all the features." },
				{ name: "Stuck?", value: "Use /guide if your ever stuck!" },
				{
					name: "Found a bug? Report it!",
					value: "If you find a bug report it in our discord support server! <3"
				}
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

const channelId = "1222537263523696785"
const statsMessageId = "1222537329378594951"

const channelId2 = "1228378327769808926"
const shomessageId = "1228380084851703922"

cron.schedule("*/5 * * * *", async () => {
	const channel = await client.channels.fetch(channelId)
	if (channel.isTextBased()) {
		const message = await channel.messages.fetch(statsMessageId)

		const lastResetTime = await getShopLastReset()
		const resetIntervalMs = 1000 * 60 * 60 * 24
		const nextResetTime = new Date(lastResetTime.getTime() + resetIntervalMs)
		const discordTimestamp = Math.floor(nextResetTime.getTime() / 1000)

		const statsEmbed = generateStatsEmbed(client, discordTimestamp)

		await message.edit({ embeds: [statsEmbed] }).catch(console.error)
	}
})
cron.schedule("*/30 * * * *", async () => {
	const channel = await client.channels.fetch(channelId2)
	if (channel.isTextBased()) {
		const message = await channel.messages.fetch(shomessageId)

		const embed = await generateShopEmbed()

		await message.edit({ embeds: [embed] }).catch(console.error)
	}
})

//
//
const clientId = "991443928790335518"
client.setMaxListeners(100)
export const workCooldowns = new Map<string, number>()
export const digCooldowns = new Map<string, number>()
export const digCooldown = 15 * 1000
export const digCooldownBypassIDs = ["917146454940844103"]
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

const itemChoices = lookupItems.map(item => ({
	name: item.name,
	value: item.name.toLowerCase().replace(/\s+/g, "_") // Ensure these values meet Discord's requirements
}))

export const userLastDaily = new Map<string, number>() // Maps user IDs to the last time they used /daily

// Slash Commands
const commands = [
	new SlashCommandBuilder()
		.setName("profile")
		.setDescription("User Profile")
		.addUserOption(option =>
			option.setName("user").setDescription("The user to display the profile for").setRequired(false)
		),
	new SlashCommandBuilder().setName("achievements").setDescription("Displays your achievements."),
	new SlashCommandBuilder().setName("dailyshop").setDescription("Daily Shop"),
	new SlashCommandBuilder().setName("ping").setDescription("Latency Check"),
	new SlashCommandBuilder().setName("voteclaim").setDescription("Claim Vote Rewards!"),
	new SlashCommandBuilder().setName("selectjob").setDescription("Choose a Job"),
	new SlashCommandBuilder().setName("search").setDescription("Search for an Item"),
	new SlashCommandBuilder().setName("vote").setDescription("Vote for the bot!"),
	new SlashCommandBuilder().setName("alert").setDescription("Alert users about an update"),
	new SlashCommandBuilder().setName("update").setDescription("Update from the developer!"),
	new SlashCommandBuilder().setName("activeffects").setDescription("Active item effects"),
	new SlashCommandBuilder().setName("support").setDescription("Get a link to the support server."),
	new SlashCommandBuilder().setName("selectitle").setDescription("Choose a Title"),
	new SlashCommandBuilder().setName("inventory").setDescription("User Inventory"),
	new SlashCommandBuilder().setName("work").setDescription("Work For Money!"),
	new SlashCommandBuilder().setName("dig").setDescription("Dig For Items!"),
	new SlashCommandBuilder().setName("fight").setDescription("Fight Fearsome Curses!"),
	new SlashCommandBuilder()
		.setName("tame")
		.setDescription("Tame your shikigami!")
		.addStringOption(option =>
			option
				.setName("shikigami")
				.setDescription("The shikigami to tame")
				.setRequired(true)
				.addChoices(
					{ name: "Mahoraga", value: "Divine-General Mahoraga" },
					{ name: "Divine Dogs", value: "Divine Dogs" },
					{ name: "Nue", value: "Nue" },
					{ name: "Toad", value: "Toad" },
					{ name: "Great Serpent", value: "Great Serpent" },
					{ name: "Max Elephant", value: "Max Elephant" }
				)
		),
	new SlashCommandBuilder().setName("daily").setDescription("Daily Rewards!"),
	new SlashCommandBuilder()
		.setName("equipclan")
		.setDescription("Equip Inate Clan")
		.addStringOption(option => option.setName("clan").setDescription("The clan to equip").setRequired(true)),

	new SlashCommandBuilder()
		.setName("balance")
		.setDescription("User Balance")
		.addUserOption(option =>
			option.setName("user").setDescription("The user to display the balance for").setRequired(false)
		),
	new SlashCommandBuilder()
		.setName("jujutsustatus")
		.setDescription("Check your Jujutsu Status!")
		.addUserOption(option =>
			option.setName("user").setDescription("The user to display the jujutsu status for").setRequired(false)
		),
	new SlashCommandBuilder().setName("register").setDescription("Join Jujutsu Rankings!"),
	new SlashCommandBuilder().setName("help").setDescription("Help"),
	new SlashCommandBuilder().setName("beg").setDescription("Beg for coins or items."),
	new SlashCommandBuilder()
		.setName("sell")
		.setDescription("Sell an item from your inventory.")
		.addStringOption(option => option.setName("item").setDescription("The item to sell").setRequired(true))
		.addIntegerOption(option => option.setName("quantity").setDescription("How many to sell").setRequired(false)),
	new SlashCommandBuilder()
		.setName("donate")
		.setDescription("Donate to the poor!")
		.addUserOption(option => option.setName("user").setDescription("The user to donate to").setRequired(true))
		.addIntegerOption(option =>
			option.setName("amount").setDescription("How much you want to donate").setRequired(true)
		),
	new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("View the global leaderboard!")
		.addStringOption(option =>
			option
				.setName("type")
				.setDescription("The type of leaderboard")
				.setRequired(true)
				.addChoices({ name: "xp", value: "xp" }, { name: "Wealth", value: "wealth" })
		),
	new SlashCommandBuilder()
		.setName("toggleheavenlyrestriction")
		.setDescription("Toggles your Heavenly Restriction status."),
	new SlashCommandBuilder()
		.setName("guide")
		.setDescription("Get guides on various topics.")
		.addStringOption(option =>
			option
				.setName("topic")
				.setDescription("The topic of the guide you want to view.")
				.setRequired(false)
				.addChoices(
					{ name: "Crafting", value: "crafting" },
					{ name: "Techniques", value: "technique" },
					{ name: "Jobs", value: "jobs" }
				)
		),

	new SlashCommandBuilder()
		.setName("gamble")
		.setDescription("Try your luck!")
		.addStringOption(option =>
			option
				.setName("game")
				.setDescription("The game you want to play")
				.setRequired(true)
				.addChoices({ name: "Slot Machine", value: "slot" }, { name: "Coin Flip", value: "coinflip" })
		)
		.addIntegerOption(option =>
			option.setName("amount").setDescription("The amount of coins to gamble").setRequired(true)
		),
	new SlashCommandBuilder()
		.setName("lookup")
		.setDescription("Looks up an item and displays information about it.")
		.addStringOption(option =>
			option
				.setName("name")
				.setDescription("The name of the item to lookup")
				.setRequired(true)
				.addChoices(...itemChoices)
		),

	new SlashCommandBuilder().setName("craft").setDescription("Craft an item using components in your inventory."),
	new SlashCommandBuilder()
		.setName("useitem")
		.setDescription("Use an item from your inventory")
		.addStringOption(option =>
			option
				.setName("item")
				.setDescription("The name of the item to use")
				.setRequired(true)
				.addChoices(
					{ name: "Sukuna Finger", value: "Sukuna Finger" },
					{ name: "Heavenly Restricted Blood", value: "Heavenly Restricted Blood" },
					{ name: "Six Eyes", value: "Six Eyes" },
					{ name: "Jogos (Fixed) Balls", value: "Jogos (Fixed) Balls" },
					{ name: "Special-Grade Geo Locator", value: "Special-Grade Geo Locator" },
					{ name: "Hakari Kinji's Token", value: "Hakari Kinji's Token" },
					{ name: "Sacred Eye", value: "Sacred Eye" },
					{ name: "Combined Disaster Curses Soul", value: "Combined Disaster Curses Soul" },
					{ name: "Cursed Vote Chest", value: "Cursed Vote Chest" },
					{ name: "Cursed Chest", value: "Cursed Chest" },
					{ name: "Soul Bundle", value: "Soul Bundle" },
					{ name: "Curse Repellent", value: "Curse Repellent" },
					{
						name: "Special-Grade Cursed Object" || "Special Grade Cursed Object",
						value: "Special-Grade Cursed Object"
					},
					{ name: "Cleaning Sponge", value: "Cleaning Sponge" }
				)
		)
		.addStringOption(option =>
			option
				.setName("item_to_clean")
				.setDescription("The name of the item to clean (only for Cleaning Sponge)")
				.setRequired(false)
				.addChoices(
					{ name: "(Dirty) Sukuna Finger", value: "(Dirty) Sukuna Finger" },
					{ name: "(Dirty) Rikugan Eye", value: "(Dirty) Rikugan Eye" }
				)
		),

	new SlashCommandBuilder()
		.setName("quests")
		.setDescription("Manage your quests.")
		.addStringOption(option =>
			option
				.setName("action")
				.setDescription("The action to perform")
				.setRequired(true)
				.addChoices(
					{ name: "Get", value: "get" },
					{ name: "View", value: "view" },
					{ name: "Claim", value: "claim" },
					{ name: "Abandon", value: "abandon" }
				)
		),
	new SlashCommandBuilder()
		.setName("shikigami")
		.setDescription("View your shikigami in Pet form!")
		.addStringOption(option =>
			option
				.setName("action")
				.setDescription("The action to perform")
				.setRequired(true)
				.addChoices({ name: "View", value: "view" }, { name: "Shop", value: "shop" })
		),
	new SlashCommandBuilder()
		.setName("technique")
		.setDescription("Manage your techniques.")
		.addSubcommand(subcommand => subcommand.setName("view").setDescription("View your equipped techniques."))
		.addSubcommand(subcommand =>
			subcommand
				.setName("unequip")
				.setDescription("Unequip a technique.")
				.addStringOption(option =>
					option
						.setName("technique2")
						.setDescription("Second technique to unequip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique10")
						.setDescription("Tenth technique to unequip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique3")
						.setDescription("Third technique to unequip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique4")
						.setDescription("Fourth technique to unequip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique5")
						.setDescription("Fifth technique to unequip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique7")
						.setDescription("Seventh technique to unequip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique8")
						.setDescription("Eight technique to unequip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique9")
						.setDescription("Ninth technique to unequip")
						.setRequired(false)
						.setAutocomplete(false)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("equip")
				.setDescription("Equip a technique.")
				.addStringOption(option =>
					option
						.setName("technique")
						.setDescription("The technique to equip")
						.setRequired(true)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique1")
						.setDescription("First technique to equip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique2")
						.setDescription("Second technique to equip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique3")
						.setDescription("Third technique to equip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique4")
						.setDescription("Fourth technique to equip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique5")
						.setDescription("Fifth technique to equip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique6")
						.setDescription("Sixth technique to equip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique7")
						.setDescription("Seventh technique to equip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique8")
						.setDescription("Eight technique to equip")
						.setRequired(false)
						.setAutocomplete(false)
				)
				.addStringOption(option =>
					option
						.setName("technique9")
						.setDescription("Ninth technique to equip")
						.setRequired(false)
						.setAutocomplete(false)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("shop")
				.setDescription("View the technique shop.")
				.addStringOption(option =>
					option
						.setName("category")
						.setDescription("The shop category to view")
						.setRequired(true)
						.addChoices({ name: "Domains", value: "domains" }, { name: "Techniques", value: "skills" })
				)
		)
		.addSubcommand(subcommand => subcommand.setName("equipform").setDescription("Equip a transformation.")),

	// ADMIN ONLY COMMANDS
	new SlashCommandBuilder()
		.setName("owner-giveitem")
		.setDescription("Gives an item to a specified user (Restricted to Bot Owner)")
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName("userid").setDescription("ID of the user to give the item to").setRequired(true)
		)
		.addStringOption(option => option.setName("item").setDescription("Name of the item to give").setRequired(true))
		.addIntegerOption(option =>
			option.setName("quantity").setDescription("The amount of the item to give").setRequired(true)
		),
	new SlashCommandBuilder()
		.setName("owner-givemoney")
		.setDescription("Gives moneys (Restricted to Bot Owner)")
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName("userid").setDescription("ID of the user to give the money to").setRequired(true)
		)
		.addIntegerOption(option => option.setName("amount").setDescription("Amount to give").setRequired(true)),
	new SlashCommandBuilder()
		.setName("owner-removemoney")
		.setDescription("Remove moneys (Restricted to Bot Owner)")
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName("userid").setDescription("ID of the user to REMOVE the money to").setRequired(true)
		)
		.addIntegerOption(option => option.setName("amount").setDescription("amount to remove").setRequired(true)),
	new SlashCommandBuilder()
		.setName("owner-addtechnique")
		.setDescription("Add or update a user's active techniques")
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName("userid").setDescription("The ID of the user to update").setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("techniques")
				.setDescription("Comma-separated list of techniques to add/update")
				.setRequired(true)
		)
].map(command => command.toJSON())

const rest = new REST({ version: "10" }).setToken(process.env["DISCORD_BOT_TOKEN"])

async function doApplicationCommands() {
	try {
		logger.info("Started refreshing application (/) commands.")

		await rest.put(Routes.applicationCommands(clientId), { body: commands })

		logger.info("Successfully reloaded application (/) commands.")
	} catch (error) {
		logger.error(error)
	}
}
doApplicationCommands()

// --------------------------------------------------------------------------------------------------------------------------\\
// --------------------------------------------------------------------------------------------------------------------------\\
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
					value: "Gamble - I think we all know what this is\nBeg - Beg some innocent people for money!\nGuide - Stuck? Refer to this!\nSupport - Link for the support server\nUpdate -  View recent updates!\nRegister - Join the ranks of sorcerers\nDig - Unearth cursed objects\nInventory - Review your collected items\nProfile - Display your sorcerer profile\nBalance - Check your yen balance\nWork - Earn yen through missions\nDaily - Claim your daily curse"
				},
				{
					name: "**Jujutsu System!**",
					value: "Fight - Engage in battles using your cursed energy\nCraft - Create cursed objects or tools\nUseItem - Activate a cursed object\nDomainSelection - Manifest your domain expansion!\nJujutsuStatus - Check your jujutsu stats!\nTechniqueShop - Check out the shop for some new techniques!"
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

	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "register") {
		await handleRegisterCommand(chatInputInteraction)
		return
	}

	if (commandName === "vote") {
		await handleVoteCommand(chatInputInteraction)
		return
	}

	if (commandName === "guide") {
		await handleGuideCommand(chatInputInteraction)
		return
	}
	if (commandName === "lookup") {
		await handleLookupCommand(chatInputInteraction)
		return
	}
	if (commandName === "support") {
		await handleSupportCommand(chatInputInteraction)
		return
	}
	if (commandName === "update") {
		await handleUpdateCommand(chatInputInteraction)
		return
	}
	client.on("interactionCreate", async interaction => {
		if (interaction.isStringSelectMenu()) {
			if (interaction.customId.startsWith("accept_trade_select_")) {
				console.log("Handling trade selection...")
				await interaction
					.deferReply({ ephemeral: false })
					.catch(error => console.error("Error deferring reply:", error))
				await processTradeSelection(interaction).catch(error =>
					console.error("Error during trade selection processing:", error)
				)
			}
		}
	})

	const shouldProceed = await checkRegistrationMiddleware(interaction)
	if (!shouldProceed) return
	else if (commandName === "technique") {
		const subcommand = interaction.options.getSubcommand()

		switch (subcommand) {
			case "view":
				await handleViewTechniquesCommand(interaction)
				break
			case "unequip":
				await handleUnequipTechniqueCommand(interaction)
				break
			case "equip":
				await handleEquipTechniqueCommand(interaction) // Make sure to correct this to use the appropriate function
				break
			case "equipform":
				await handleEquipTransformationCommand(interaction) // Make sure to correct this to use the appropriate function
				break
			case "shop":
				const category = interaction.options.getString("category") // This is how you correctly access a subcommand option
				if (category === "domains") {
					await handleDomainSelection(interaction)
				} else if (category === "skills") {
					await handleTechniqueShopCommand(interaction)
				}
				break
			default:
				await interaction.reply({ content: "Unknown subcommand.", ephemeral: true })
		}
	} else if (commandName === "trade") {
		const action = interaction.options.getString("action")

		switch (action) {
			case "initiate":
				await handleTradeCommand(interaction)
				break
			case "accept":
				await handleAcceptTrade(interaction)
				break
			case "previous":
				await handlePreviousTradesCommand(interaction)
				break
			case "view":
				await handleActiveTradesCommand(interaction)
				break
			default:
				await interaction.reply({ content: "Unknown action.", ephemeral: true })
		}
	} else if (commandName === "shikigami") {
		const action = interaction.options.getString("action")

		switch (action) {
			case "view":
				await handleViewShikigami(interaction)
				break
			case "shop":
				await handlePetShop(interaction)
				break
			default:
				await interaction.reply({ content: "Unknown action.", ephemeral: true })
		}
	} else if (commandName === "quests") {
		const action = interaction.options.getString("action")

		switch (action) {
			case "get":
				await handleQuestCommand(interaction)
				break
			case "view":
				await viewQuestsCommand(interaction)
				break
			case "claim":
				await claimQuestsCommand(interaction)
				break
			case "abandon":
				await handleUnequipQuestCommand(interaction)
				break
			default:
		}
	} else {
		// Handling other commands based on their commandName
		switch (commandName) {
			case "balance":
				await handleBalanceCommand(chatInputInteraction)
				break
			case "dailyshop":
				await handleShopCommand(chatInputInteraction)
				break
			case "equipclan":
				await handleEquipInateClanCommand(chatInputInteraction)
				break
			case "alert":
				await handleAlertCommand(chatInputInteraction)
				break
			case "sell":
				await handleSellCommand(chatInputInteraction)
				break
			case "profile":
				await handleProfileCommand(chatInputInteraction)
				break

			case "inventory":
				await handleInventoryCommand(chatInputInteraction)
				break
			case "viewshikigami":
				await handleViewShikigami(chatInputInteraction)
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
			case "activeffects":
				await handleViewEffectsCommand(chatInputInteraction)
				break

			case "fight":
				await handleFightCommand(chatInputInteraction)
				break

			case "tame":
				await handleTame(chatInputInteraction)
				break

			case "selectjob":
				await handleJobSelection(chatInputInteraction)
				break
			case "voteclaim":
				await handleClaimVoteRewards(chatInputInteraction)
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
			case "jujutsustatus":
				await handleJujutsuStatsCommand(chatInputInteraction)
				break
			case "leaderboard":
				await handleLeaderBoardCommand(chatInputInteraction)
				break
			case "toggleheavenlyrestriction":
				await handleToggleHeavenlyRestrictionCommand(chatInputInteraction)
				break
			case "gamble":
				await handleGambleCommand(chatInputInteraction)
				break
			case "beg":
				await handleBegCommand(chatInputInteraction)
				break
			case "donate":
				await handleDonateCommand(chatInputInteraction)
				break
			case "giveitem":
				await handleGiveItemCommand(chatInputInteraction)
				break
			case "givemoney":
				await handleUpdateBalanceCommand(chatInputInteraction)
				break
			case "removemoney":
				await handleREMOVE(chatInputInteraction)
				break
			case "addtechnique":
				await handleADDTECHNIQUE(chatInputInteraction)
				break
		}
	}
})

client.login(process.env["DISCORD_BOT_TOKEN"])
