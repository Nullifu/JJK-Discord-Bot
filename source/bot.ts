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
	Entitlement,
	GatewayIntentBits,
	Partials,
	PermissionFlagsBits,
	REST,
	Routes,
	SKU,
	SKUType,
	SlashCommandBuilder,
	User
} from "discord.js"
import { config as dotenv } from "dotenv"

import express from "express"
import log4js from "log4js"
import cron from "node-cron"
import { AutoPoster } from "topgg-autoposter"
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
	handleBugReport,
	handleConsumeItem,
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
	handlePetShop,
	handlePingCommand,
	handlePreviousTradesCommand,
	handleProfileCommand,
	handlePurchaseHistoryCommand,
	handlePvpCommand,
	handleQuestCommand,
	handleRaidCommand,
	handleRegisterCommand,
	handleSearchCommand,
	handleSellCommand,
	handleSettingsCommand,
	handleShikigamiShop,
	handleShopCommand,
	handleSupportCommand,
	handleTame,
	handleTechniqueShopCommand,
	handleTitleSelectCommand,
	handleTradeCommand,
	handleTutorialCommand,
	handleUnequipTechniqueCommand,
	handleUpdateCommand,
	handleUseItemCommand,
	handleViewEffectsCommand,
	handleViewSettingsCommand,
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
import { checkRegistrationMiddleware } from "./middleware.js"
import {
	addItemToUserInventory,
	getShopLastReset,
	getUserInventory,
	handleToggleHeavenlyRestrictionCommand,
	initializeDatabase,
	updateBalance
} from "./mongodb.js"
import {
	handleADDTECHNIQUE,
	handleGiveItemCommand,
	handleGiveItemCommand11,
	handleREMOVE,
	handleUpdateBalanceCommand
} from "./owner.js"
import { getRandomQuote } from "./shikigami.js"

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

const logger = log4js.getLogger("jjk-bot")

export default logger

dotenv()

export function createClient() {
	const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
		partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User]
	})

	return client
}

const client = createClient()

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
			await user.send("Thanks for the vote! You got 100,000 Coins + A vote chest!")
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

const grantEntitlement = async (entitlement: Entitlement, user: User, sku: SKU) => {
	if (sku.type === SKUType.Consumable) {
		await entitlement.consume()
		logger.warn(`Consumed entitlement: ${entitlement.id}, SKU: ${sku.name}`)
	}

	if (sku.id === "1243613622853439570") {
		await addItemToUserInventory(user.id, "Sukuna Finger", 20)
	} else {
		logger.error(`Unknown product: ${sku.id}`)
	}
}

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

const interactionProcessing = new Set()

client.once("ready", async () => {
	logger.info(`Logged in as ${client.user.tag}!`)
	interactionProcessing.clear()
	logger.info("Interaction processing state has been reset.")
	await doApplicationCommands(client.user.id)

	try {
		await initializeDatabase()
		logger.info("Database initialization completed.")
	} catch (error) {
		logger.fatal("Error initializing database:", error)
	}
})

client.on("entitlementCreate", async entitlement => {
	logger.info(`Entitlement created: ${entitlement}`)

	try {
		const user = await entitlement.fetchUser()
		const sku = (await client.application.fetchSKUs()).find(sku => sku.id === entitlement.skuId)

		await grantEntitlement(entitlement, user, sku)

		const confirmationMessage = `Thank you for your purchase of ${sku.name}! Enjoy your new item.`
		await user.send(confirmationMessage)

		logger.info(`Purchase handled: User ${user.username} (${user.id}) purchased ${sku.name}`)
	} catch (error) {
		logger.error(`Error handling purchase: ${error}`)
	}
})

client.on("entitlementDelete", async (entitlement: Entitlement) => {
	logger.info(`Entitlement deleted: ${entitlement}`)
})
client.on("entitlementUpdate", async (oldEntitlement: Entitlement | null, newEntitlement: Entitlement) => {
	logger.info(`Entitlement update: ${oldEntitlement}`)
	logger.info(`Entitlement update: ${newEntitlement}`)
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
		{ name: "Update 9.0 | PVP!", type: ActivityType.Playing },
		{ name: `${totalMembers.toLocaleString()} Sorcerers`, type: ActivityType.Listening },
		{ name: `${client.guilds.cache.size.toLocaleString()} servers`, type: ActivityType.Listening },
		{ name: "Jujutsu Kaisen", type: ActivityType.Watching },
		{ name: "The Shibuya Incident", type: ActivityType.Playing },
		{ name: "Shinjuku Showdown Arc", type: ActivityType.Playing },
		{ name: "Cursed Clash", type: ActivityType.Competing },
		{ name: "/register | /help", type: ActivityType.Listening },
		{ name: "/guide | /fight", type: ActivityType.Listening }
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
		const statsEmbed = await generateStatsEmbed(client, discordTimestamp)
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

client.setMaxListeners(1000)
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
	"I can dig that",
	"Exhumed"
]

// Slash Commands
const commands = [
	new SlashCommandBuilder()
		.setName("profile")
		.setDescription("User Profile")
		.addUserOption(option =>
			option.setName("user").setDescription("The user to display the profile for").setRequired(false)
		),
	new SlashCommandBuilder().setName("achievements").setDescription("Displays your achievements."),
	new SlashCommandBuilder().setName("shop").setDescription("Daily Shop"),
	new SlashCommandBuilder().setName("ping").setDescription("Latency Check"),
	new SlashCommandBuilder().setName("mentor").setDescription("Heed words from your mentor!"),
	new SlashCommandBuilder().setName("selectjob").setDescription("Choose a Job"),
	new SlashCommandBuilder().setName("search").setDescription("Search for an Item"),
	new SlashCommandBuilder().setName("vote").setDescription("Vote for the bot!"),
	new SlashCommandBuilder().setName("alert").setDescription("Bot Alerts"),
	new SlashCommandBuilder().setName("update").setDescription("Recent bot updates!"),
	new SlashCommandBuilder().setName("activeffects").setDescription("Active item effects"),
	new SlashCommandBuilder().setName("support").setDescription("Get a link to the support server."),
	new SlashCommandBuilder().setName("selectitle").setDescription("Choose a Title"),
	new SlashCommandBuilder()
		.setName("inventory")
		.setDescription("User Inventory")
		.addUserOption(option =>
			option.setName("user").setDescription("The user to display the inventory for").setRequired(false)
		),
	new SlashCommandBuilder().setName("profileimage").setDescription("User Inventory"),
	new SlashCommandBuilder().setName("work").setDescription("Work For Money!"),

	new SlashCommandBuilder().setName("dig").setDescription("Dig For Items!"),
	new SlashCommandBuilder().setName("fight").setDescription("Fight Fearsome Curses!"),
	new SlashCommandBuilder().setName("event").setDescription("Get information about the ongoing global event"),
	new SlashCommandBuilder().setName("raid").setDescription("Enter a raid!"),
	new SlashCommandBuilder().setName("tutorial").setDescription("Get a tutorial on how to play the bot!"),
	new SlashCommandBuilder()
		.setName("settings")
		.setDescription("Update your user settings")
		.addBooleanOption(option => option.setName("pvpable").setDescription("Toggle PvP availability"))
		.addBooleanOption(option => option.setName("showalerts").setDescription("Toggle alert notifications"))
		.addBooleanOption(option => option.setName("acceptrades").setDescription("Toggle trade acceptance"))
		.addBooleanOption(option => option.setName("showspoiler").setDescription("Toggle showing spoilers")),
	new SlashCommandBuilder().setName("settingview").setDescription("Credits"),
	new SlashCommandBuilder()
		.setName("pvp")
		.setDescription("PvP related commands")
		.addSubcommand(subcommand =>
			subcommand
				.setName("challenge")
				.setDescription("Challenge another user to a PvP battle")
				.addUserOption(option =>
					option.setName("opponent").setDescription("The user you want to challenge").setRequired(true)
				)
		),

	new SlashCommandBuilder()
		.setName("sell")
		.setDescription("Sell an item from your inventory.")
		.addStringOption(option => option.setName("item").setDescription("The item to sell").setRequired(true))
		.addIntegerOption(option => option.setName("quantity").setDescription("How many to sell").setRequired(false)),

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
	new SlashCommandBuilder().setName("guide").setDescription("Get guides on various topics."),
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
		.addStringOption(option =>
			option.setName("item").setDescription("The item to trade").setRequired(false).setAutocomplete(true)
		)
		.addIntegerOption(option =>
			option.setName("quantity").setDescription("The quantity of the item to trade").setRequired(false)
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

	new SlashCommandBuilder().setName("craft").setDescription("Craft an item using components in your inventory."),
	new SlashCommandBuilder()
		.setName("use")
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
					{ name: "Unknown Substance", value: "Unknown Substance" },
					{ name: "Blessful Charm", value: "Blessful Charm" },
					{ name: "Normal Box", value: "Normal Box" },
					{ name: "Extreme Box", value: "Extreme Box" },
					{ name: "Special Grade Box", value: "Special Grade Box" }
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
		.setName("consume")
		.setDescription("Consume an item from your inventory")
		.addStringOption(option =>
			option
				.setName("item")
				.setDescription("The name of the item to consume")
				.setRequired(true)
				.addChoices(
					{ name: "Simple Domain Essence", value: "Simple Domain Essence" },
					{ name: "RCT Essence", value: "RCT Essence" },
					{ name: "Luck Essence", value: "Luck Essence" },
					{ name: "Unleashed Inate Essence", value: "Inate Unleashed Essence" }
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
		),
	new SlashCommandBuilder()
		.setName("bug")
		.setDescription("Report a bug")
		.addStringOption(option => option.setName("description").setDescription("Describe the bug").setRequired(true))
		.addAttachmentOption(option => option.setName("image").setDescription("Upload an image related to the bug"))
].map(command => command.toJSON())

const rest = new REST({ version: "10" }).setToken(process.env["DISCORD_BOT_TOKEN"])

async function doApplicationCommands(clientId: string) {
	try {
		logger.info("Started refreshing application (/) commands.")

		await rest.put(Routes.applicationCommands(clientId), { body: commands })

		logger.info("Successfully reloaded application (/) commands.")
	} catch (error) {
		logger.error(error)
	}
}

// --------------------------------------------------------------------------------------------------------------------------\\
// --------------------------------------------------------------------------------------------------------------------------\\
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
					value: "`Register`, `Profile`, `Inventory`, `Balance`, `Leaderboard`, `Achievements`, `Support`, `Help`, `Vote`, `Guide`, `Tutorial`"
				},
				{
					name: "**Economy Commands**",
					value: "`Work`, `Dig`, `Gamble`, `Beg`, `Donate`, `Daily`, `Shop`, `Sell`, `UseItem`, `Craft`"
				},
				{
					name: "**Battle Commands**",
					value: "`Fight`, `Tame`, `View Shikigami`, `Technique View/Equip`, `Quests`, `Event`, `Raid`, `ActiveEffects`, `Mentor`"
				},
				{
					name: "**Other Commands**",
					value: "`Alert`, `Update`, `Search`, `SelectJob`, `SelectTitle`, `Bug`"
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
	if (!interaction.isStringSelectMenu()) return

	if (interaction.customId.startsWith("accept_trade_select")) {
		try {
			await processTradeSelection(interaction)
		} catch (error) {
			logger.error("Error during trade selection processing:", error)
		}
	}
})

client.on("interactionCreate", async interaction => {
	if (!interaction.isChatInputCommand()) return

	const chatInputInteraction = interaction as ChatInputCommandInteraction
	const { commandName } = chatInputInteraction
	if (commandName === "tutorial") {
		await handleTutorialCommand(chatInputInteraction)
		return
	}
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
	if (commandName === "support") {
		await handleSupportCommand(chatInputInteraction)
		return
	}
	if (commandName === "update") {
		await handleUpdateCommand(chatInputInteraction)
		return
	}
	if (commandName === "ping") {
		await handlePingCommand(chatInputInteraction)
		return
	}
	//

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
	} else if (commandName === "pvp") {
		const action = interaction.options.getSubcommand()

		switch (action) {
			case "challenge":
				await handlePvpCommand(interaction)
				break
			default:
				await interaction.reply({ content: "Unknown action.", ephemeral: true })
		}
	} else {
		switch (commandName) {
			case "balance":
				await handleBalanceCommand(chatInputInteraction)
				break
			case "shop":
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
			case "settings":
				await handleSettingsCommand(chatInputInteraction)
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
			case "settingview":
				await handleViewSettingsCommand(chatInputInteraction)
				break

			case "fight":
				await handleFightCommand(chatInputInteraction)
				break

			case "tame":
				await handleTame(chatInputInteraction)
				break

			case "raid":
				await handleRaidCommand(chatInputInteraction)
				break

			case "consume":
				await handleConsumeItem(chatInputInteraction)
				break

			case "selectjob":
				await handleJobSelection(chatInputInteraction)
				break
			case "pvp":
				await handlePvpCommand(chatInputInteraction)
				break
			case "work":
				await handleWorkCommand(chatInputInteraction)
				break
			case "owner-giveallitem":
				await handleGiveItemCommand11(chatInputInteraction)
				break

			case "selectitle":
				await handleTitleSelectCommand(chatInputInteraction)
				break
			case "search":
				await handleSearchCommand(chatInputInteraction)
				break
			case "use":
				await handleUseItemCommand(chatInputInteraction)
				break
			case "shikigamishop":
				await handleShikigamiShop(chatInputInteraction)
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
			case "purchasehistory":
				await handlePurchaseHistoryCommand(chatInputInteraction)
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
			case "bug":
				await handleBugReport(chatInputInteraction)
				break
		}
	}
})

client.on("interactionCreate", async interaction => {
	if (interaction.isButton()) {
		if (interaction.customId.startsWith("giveaway-")) {
			await handleGiveawayEntry(interaction as ButtonInteraction)
		}
	}
})

client.on("interactionCreate", async interaction => {
	if (interaction.isAutocomplete()) {
		if (interaction.commandName === "trade") {
			const focusedOption = interaction.options.getFocused(true)
			if (focusedOption.name === "item") {
				const userInput = focusedOption.value.toLowerCase()
				const userInventory = await getUserInventory(interaction.user.id)
				const filteredItemChoices = userInventory
					.filter(item => item.name.toLowerCase().includes(userInput))
					.slice(0, 25)
					.map(item => ({ name: item.name, value: item.name }))
				await interaction.respond(filteredItemChoices)
			}
		}
	}
})

///////////////////////// TOP.GG AUTOPOSTER ///////////////////////////

const poster = AutoPoster(process.env.TOPGG, client)

poster.on("posted", stats => {
	logger.info(`Posted stats to Top.gg | ${stats.serverCount} servers`)
})

client.login(process.env["DISCORD_BOT_TOKEN"])
