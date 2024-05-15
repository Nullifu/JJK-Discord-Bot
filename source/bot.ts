/* eslint-disable no-case-declarations */
import { ActionRowBuilder, EmbedBuilder } from "@discordjs/builders"
import {
	ActivityType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	ChatInputCommandInteraction,
	Client,
	GatewayIntentBits,
	Partials,
	PermissionFlagsBits,
	REST,
	Routes,
	SlashCommandBuilder,
	TextChannel
} from "discord.js"
import { config as dotenv } from "dotenv"

import log4js from "log4js"
import cron from "node-cron"
import {
	abandonQuestCommand,
	claimQuestsCommand,
	eventCommandHandler,
	generateShopEmbed,
	generateStatsEmbed,
	handleAcceptTrade,
	handleAchievementsCommand,
	handleActiveTradesCommand,
	handleAlertCommand,
	handleBalanceCommand,
	handleBegCommand,
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
	handleGiveawayCommand,
	handleGiveawayEntry,
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
	handleShikigamiShop,
	handleShopCommand,
	handleSupportCommand,
	handleTame,
	handleTechniqueShopCommand,
	handleTitleSelectCommand,
	handleTradeCommand,
	handleUnequipTechniqueCommand,
	handleUpdateCommand,
	handleUpdateProfileImageCommand,
	handleUseItemCommand,
	handleViewEffectsCommand,
	handleViewShikigami,
	handleViewStats,
	handleViewTechniquesCommand,
	handleVoteCommand,
	handleWorkCommand,
	handlecreditcommand,
	mentorNPCCommand,
	processTradeSelection,
	viewQuestsCommand
} from "./command.js"
import { lookupItems } from "./items jobs.js"
import { checkRegistrationMiddleware } from "./middleware.js"
import {
	addItemToUserInventory,
	getShopLastReset,
	handleToggleHeavenlyRestrictionCommand,
	initializeDatabase,
	logImageUrl,
	updateBalance
} from "./mongodb.js"
import { handleADDTECHNIQUE, handleGiveItemCommand, handleREMOVE, handleUpdateBalanceCommand } from "./owner.js"
import { getRandomQuote } from "./shikigami.js"

dotenv()

export function createClient() {
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

	return client
}

const client = createClient()

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

export const logger = log4js.getLogger("jjk-bot")

logger.trace("This is a trace message")
logger.debug("This is a debug message")
logger.info("This is an info message")
logger.warn("This is a warning message")
logger.error("This is an error message")
logger.fatal("This is a fatal message")

let activities = []
let index = 0

const success_code = 0
const error_code = 1

const app = express()

app.use(express.json())

app.use((request, response, next) => {
	logger.info(`-> HTTP ${request.method} ${request.url} '${JSON.stringify(request.body ?? "{}")}'`)

	response.on("finish", () => {
		logger.info(`<- HTTP ${response.statusCode} ${response.statusMessage}`)
	})

	next()
})

app.get("/", (request, response) => {
	response.status(200).send({
		code: success_code,
		data: {
			message: "Hello, World!"
		}
	})
})

const API_SECRET = process.env["API_SECRET"]

app.post("/topgg", async (request, response) => {
	logger.info(`Received a webhook: ${JSON.stringify(request.body)}`)

	const auth = request.header("Authorization")
	if (auth !== `Bearer ${API_SECRET}`) {
		response.status(401).send({
			code: error_code,
			data: {
				message: "Unauthorized"
			}
		})
		return
	}

	const data = request.body as { user: string; isWeekend?: boolean }
	logger.info("Received vote from user:", data.user)
	const user = await client.users.fetch(data.user)
	if (user) {
		try {
			await user.send("Thank's for the vote! You got 100,000 Coins + A vote chest!")
			await updateBalance(user.id, 100000)
			await addItemToUserInventory(user.id, "Cursed Vote Chest", 1)
			logger.info(`Sent a direct message to user: ${user.tag}`)
		} catch (error) {
			logger.error(`Failed to send a direct message to user: ${user.tag}`, error)
		}
	}

	response.status(200).send({
		code: success_code,
		data: {}
	})
})

app.use((request, response) => {
	response.status(404).send({
		code: error_code,
		data: {
			message: "Not Found"
		}
	})
})

app.listen(parseInt(process.env["EXPRESS_PORT"] ?? "3000"), process.env["EXPRESS_ADDRESS"] ?? "0.0.0.0", () => {
	logger.info(
		`BOT API running on http://${process.env["EXPRESS_ADDRESS"] ?? "0.0.0.0"}:${
			process.env["EXPRESS_PORT"] ?? "3000"
		}`
	)
})

////////

client.on("ready", async () => {
	logger.info(`Logged in as ${client.user.tag}!`)

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
}, 60000)

async function updateDynamicActivities() {
	let totalMembers = 0
	client.guilds.cache.forEach(guild => {
		totalMembers += guild.memberCount
	})

	activities = [
		{ name: "Update 7.0 | Part Two!", type: ActivityType.Playing }, // Dynamic member count
		{ name: `${totalMembers} members`, type: ActivityType.Listening }, // Dynamic member count
		{ name: `${client.guilds.cache.size} servers`, type: ActivityType.Listening }, // Dynamic server count
		{ name: "Jujutsu Kaisen", type: ActivityType.Watching },
		{ name: "The Shibuya Incident", type: ActivityType.Playing },
		{ name: "Satoru Gojo's Sealing Event!", type: ActivityType.Competing },
		{ name: "/register | /help", type: ActivityType.Listening }
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
					name: "Don't miss out on our giveaways and special events!",
					value: "Hope to see you there!"
				},
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

		defaultChannel.send({ embeds: [welcomeEmbed], components: [row] })
	}
})

const channelId = "1222537263523696785"
const statsMessageId = "1222537329378594951"

export const MODERATION_CHANNEL_ID = "1233723111619166329"

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

		await message.edit({ embeds: [statsEmbed] }).catch(logger.error)
	}
})
cron.schedule("*/30 * * * *", async () => {
	const channel = await client.channels.fetch(channelId2)
	if (channel.isTextBased()) {
		const message = await channel.messages.fetch(shomessageId)

		const embed = await generateShopEmbed()

		await message.edit({ embeds: [embed] }).catch(logger.error)
	}
})

//
//
const clientId = "991443928790335518"

client.setMaxListeners(250)
export const digCooldowns = new Map<string, number>()
export const digCooldown = 15 * 1000
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
	value: item.name.toLowerCase().replace(/\s+/g, "_")
}))

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
	new SlashCommandBuilder().setName("mentor").setDescription("Heed words from your mentor!"),
	new SlashCommandBuilder().setName("shikigamishop").setDescription("View shikigami shop"),
	new SlashCommandBuilder().setName("selectjob").setDescription("Choose a Job"),
	new SlashCommandBuilder().setName("search").setDescription("Search for an Item"),
	new SlashCommandBuilder().setName("vote").setDescription("Vote for the bot!"),
	new SlashCommandBuilder().setName("alert").setDescription("DEV Alerts"),
	new SlashCommandBuilder().setName("update").setDescription("Update from the developer!"),
	new SlashCommandBuilder().setName("activeffects").setDescription("Active item effects"),
	new SlashCommandBuilder().setName("support").setDescription("Get a link to the support server."),
	new SlashCommandBuilder().setName("selectitle").setDescription("Choose a Title"),
	new SlashCommandBuilder().setName("inventory").setDescription("User Inventory"),
	new SlashCommandBuilder().setName("profileimage").setDescription("User Inventory"),
	new SlashCommandBuilder().setName("work").setDescription("Work For Money!"),
	new SlashCommandBuilder().setName("createquest").setDescription("Work For Money!"),
	new SlashCommandBuilder().setName("dig").setDescription("Dig For Items!"),
	new SlashCommandBuilder().setName("fight").setDescription("Fight Fearsome Curses!"),
	new SlashCommandBuilder().setName("event").setDescription("Get information about the ongoing global event"),
	new SlashCommandBuilder()
		.setName("tame")
		.setDescription("Tame your shikigami!")
		.addStringOption(option =>
			option
				.setName("shikigami")
				.setDescription("The shikigami to tame")
				.setRequired(true)
				.addChoices(
					{ name: "Mahoraga", value: "Mahoraga" },
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
		.setName("updateprofileimage")
		.setDescription("Update your profile image")
		.addSubcommand(subcommand =>
			subcommand
				.setName("avatar")
				.setDescription("Update your profile avatar")
				.addAttachmentOption(option =>
					option.setName("image").setDescription("The image to set as your profile avatar").setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("header")
				.setDescription("Update your profile header")
				.addAttachmentOption(option =>
					option.setName("image").setDescription("The image to set as your profile header").setRequired(true)
				)
		),
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
				.addChoices(
					{ name: "xp", value: "xp" },
					{ name: "Wealth", value: "wealth" },
					{ name: "Fights", value: "fight" }
				)
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
					{ name: "Special", value: "special" },
					{ name: "Starter", value: "starter" },
					{ name: "Fighting", value: "fighting" },
					{ name: "Shikigami", value: "shikigami" },
					{ name: "Quests", value: "quests" },
					{ name: "Items", value: "items" },
					{ name: "Awakening", value: "awakening" }
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
					{ name: "Combined Disaster Curses Soul", value: "Combined Disaster Curses Soul" },
					{ name: "Cursed Vote Chest", value: "Cursed Vote Chest" },
					{ name: "Cursed Chest", value: "Cursed Chest" },
					{ name: "Soul Bundle", value: "Soul Bundle" },
					{ name: "Curse Repellent", value: "Curse Repellent" },
					{ name: "Starter Bundle", value: "Starter Bundle" },
					{ name: "Special-Grade Anti Effect Spray", value: "Special-Grade Anti Effect Spray" },
					{ name: "Special-Grade Cursed Object", value: "Special-Grade Cursed Object" },
					{ name: "Cleaning Sponge", value: "Cleaning Sponge" },
					{ name: "Cursed Energy Vial", value: "Cursed Energy Vial" },
					{ name: "Heian Era Awakening Remnant", value: "Heian Era Awakening Remnant" },
					{ name: "#1 Fighting Box", value: "#1 Fighting Box" },
					{ name: "Unknown Substance", value: "Unknown Substance" },
					{ name: "Blessful Charm", value: "Blessful Charm" }
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
		.addSubcommand(subcommand => subcommand.setName("view").setDescription("View your OWNED techniques."))
		.addSubcommand(subcommand =>
			subcommand
				.setName("unequip")
				.setDescription("Unequip a technique.")
				.addStringOption(option =>
					option
						.setName("techniques")
						.setDescription("Comma-separated list of techniques to unequip")
						.setRequired(true)
						.setAutocomplete(false)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("equip")
				.setDescription("Equip techniques.")
				.addStringOption(option =>
					option
						.setName("techniques")
						.setDescription("Comma-separated list of techniques to equip")
						.setRequired(true)
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
		),
	new SlashCommandBuilder()
		.setName("trade")
		.setDescription("Trading Command.")
		.addStringOption(option =>
			option
				.setName("action")
				.setDescription("The action to perform")
				.setRequired(true)
				.addChoices(
					{ name: "Initiate", value: "initiate" },
					{ name: "Accept", value: "accept" },
					{ name: "View", value: "view" },
					{ name: "Previous", value: "previous" }
				)
		)
		.addUserOption(option => option.setName("user").setDescription("The user to trade with").setRequired(false))
		.addStringOption(option => option.setName("item").setDescription("The item to trade").setRequired(false))
		.addIntegerOption(option =>
			option.setName("quantity").setDescription("The quantity of the item to trade").setRequired(false)
		),
	new SlashCommandBuilder()
		.setName("giveaway")
		.setDescription("Create a new giveaway")
		.addStringOption(option =>
			option.setName("prize").setDescription("The prize for the giveaway").setRequired(true)
		)
		.addIntegerOption(option => option.setName("winners").setDescription("The number of winners").setRequired(true))
		.addStringOption(option =>
			option
				.setName("duration")
				.setDescription("The duration of the giveaway (e.g. 1d, 2h, 30m)")
				.setRequired(true)
		)
		.addBooleanOption(option =>
			option.setName("is_item").setDescription("Whether the prize is an item or not").setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName("item_quantity")
				.setDescription("The quantity of the item (if the prize is an item)")
				.setRequired(false)
		)
		.addIntegerOption(option =>
			option
				.setName("prize_amount")
				.setDescription("The amount of the prize (if the prize is not an item)")
				.setRequired(false)
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
				iconURL:
					"https://media.discordapp.net/attachments/1186763353494925404/1231808785090220042/Snapinsta.app_391524227_1278065773589666_2455587178141689864_n_1080.jpg?ex=66384e54&is=6625d954&hm=d208ac0a522cfc6446265782671b04d4207dd6fd6c102d779f8956ba25d9bec6&=&format=webp&width=554&height=554"
			})
			.setColor(0x390baa)
			.setTitle("Cursed Commands")
			.setDescription("JJK Bot Commands!")
			.addFields(
				{
					name: "**General Commands**",
					value: "`Register`, `Profile`, `Inventory`, `Balance`, `Leaderboard`, `Achievements`, `Support`, `Help`, `Vote`, `VoteClaim`, `Guide`"
				},
				{
					name: "**Economy Commands**",
					value: "`Work`, `Dig`, `Gamble`, `Beg`, `Donate`"
				},
				{
					name: "**Battle Commands**",
					value: "`Fight`, `Tame`"
				},
				{
					name: "**Other Commands**",
					value: "`Alert`, `Update`, `Search`, `SelectJob`, `SelectTitle`"
				}
			)
			.setTimestamp()
			.setImage(
				"https://64.media.tumblr.com/f17b9a4b1c06e60da80cd727d15bad45/73b1b994021421f6-69/s1280x1920/29829ea2f358a23eb7dd17a12631a864e374d4f4.png"
			)
			.setFooter({ text: getRandomQuote() })

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
	if (commandName === "credits") {
		await handlecreditcommand(chatInputInteraction)
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
	//
	client.on("interactionCreate", async interaction => {
		if (interaction.isStringSelectMenu()) {
			if (interaction.customId.startsWith("accept_trade_select_")) {
				try {
					// Ensure interaction is deferred as soon as possible
					if (!interaction.deferred && !interaction.replied) {
						await interaction.deferReply()
					}

					logger.info("Handling trade selection...")
					await processTradeSelection(interaction)
				} catch (error) {
					logger.error("Error during trade selection processing:", error)

					// Only update with an error if we haven't already replied or deferred successfully
					if (interaction.deferred && !interaction.replied) {
						await interaction.editReply({
							content: "An error occurred while trying to accept the trade request.",
							components: []
						})
					}
				}
			}
		}
	})

	//

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
				await handleEquipTechniqueCommand(interaction)
				break
			case "equipform":
				await handleEquipTransformationCommand(interaction)
				break
			case "shop":
				const category = interaction.options.getString("category")
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
				await abandonQuestCommand(interaction)
				break
			default:
		}
	} else {
		// Handling other commands based on their commandName
		switch (commandName) {
			case "balance":
				await handleBalanceCommand(chatInputInteraction)
				break
			case "updateprofileimage":
				await handleUpdateProfileImageCommand(chatInputInteraction)
				break
			case "dailyshop":
				await handleShopCommand(chatInputInteraction)
				break
			case "equipclan":
				await handleEquipInateClanCommand(chatInputInteraction)
				break
			case "mentor":
				await mentorNPCCommand(chatInputInteraction)
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
			case "event":
				await eventCommandHandler(chatInputInteraction)
				break
			case "viewshikigami":
				await handleViewShikigami(chatInputInteraction)
				break
			case "dig":
				await handleDigCommand(chatInputInteraction)
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
			case "work":
				await handleWorkCommand(chatInputInteraction)
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
			case "giveaway":
				await handleGiveawayCommand(chatInputInteraction)
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
			case "stats":
				await handleViewStats(chatInputInteraction)
				break
			case "donate":
				await handleDonateCommand(chatInputInteraction)
				break
			case "owner-giveitem":
				await handleGiveItemCommand(chatInputInteraction)
				break
			case "owner-givemoney":
				await handleUpdateBalanceCommand(chatInputInteraction)
				break
			case "owner-removemoney":
				await handleREMOVE(chatInputInteraction)
				break
			case "owner-addtechnique":
				await handleADDTECHNIQUE(chatInputInteraction)
				break
			case "shikigamishop":
				await handleShikigamiShop(chatInputInteraction)
				break
		}
	}
})

client.on("interactionCreate", async interaction => {
	if (interaction.isButton()) {
		// Check if the button custom ID starts with "giveaway-"
		if (interaction.customId.startsWith("giveaway-")) {
			await handleGiveawayEntry(interaction as ButtonInteraction)
		}
	}
})

///////////////////////// TOP.GG AUTOPOSTER ///////////////////////////

import express from "express"
import { AutoPoster } from "topgg-autoposter"
const poster = AutoPoster(process.env.TOPGG, client)

poster.on("posted", stats => {
	logger.info(`Posted stats to Top.gg | ${stats.serverCount} servers`)
})

///////////////////////// PROFILE IMAGE COMMAND ///////////////////////////

export async function sendForManualReview(imageUrl: string, interaction, subcommand: string): Promise<void> {
	try {
		const moderationChannel = await client.channels.fetch(MODERATION_CHANNEL_ID)
		if (moderationChannel && moderationChannel.type === ChannelType.GuildText) {
			const textChannel = moderationChannel as TextChannel
			const message = await textChannel.send({
				content: `Hey <@292385626773258240> Review needed for the following ${subcommand} image from ${interaction.user.username}:`,
				embeds: [
					new EmbedBuilder()
						.setImage(imageUrl)
						.setTitle(`Review ${subcommand.charAt(0).toUpperCase() + subcommand.slice(1)} Image`)
				]
			})

			logger.info("Manual review message sent for image:", message.attachments)

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId(`confirm_accept_${message.id}`)
					.setLabel("Confirm")
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId(`confirm_deny_${message.id}`)
					.setLabel("Deny")
					.setStyle(ButtonStyle.Danger)
			)

			await message.edit({ components: [row] })

			await logImageUrl(imageUrl, interaction.user.id)
		} else {
			logger.error("The fetched channel is not a text channel.")
			throw new Error("Incorrect channel type")
		}
	} catch (error) {
		logger.error("Failed to send message for manual review:", error)
		throw error
	}
}

client.login(process.env["DISCORD_BOT_TOKEN"])
