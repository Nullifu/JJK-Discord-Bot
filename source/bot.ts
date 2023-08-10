import snoowrap from "snoowrap"
const token = "ODE3ODc2MjY1NzkxOTEzOTg1.YEP4oQ.2gsmSbbwdLhXnkYCmhgWVuP5YyQ"
const prefix = "!"
import { Client, EmbedBuilder, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js"
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	]
})

const clientId = "817876265791913985"
// Increase the listener limit for the interactionCreate event
client.setMaxListeners(15) // Set it to a reasonable value based on your use case

// Now you can add your event listeners without triggering the warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
client.on("interactionCreate", (_interaction) => {
	// Handle the interaction
})


const commands = [
	new SlashCommandBuilder()
		.setName("hello")
		.setDescription("Responds with a greeting"),
].map(command => command.toJSON())
const rest = new REST({ version: "9" }).setToken(token);
(async () => {
	try {
		console.log("Started refreshing application (/) commands.")
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		)

		console.log("Successfully reloaded application (/) commands.")
	} catch (error) {
		console.error(error)
	}
})()


client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return
  
	const { commandName } = interaction
  
	if (commandName === "hello") {
	// eslint-disable-next-line no-mixed-spaces-and-tabs
	  await interaction.reply("Hello! This is a response to your slash command.")
	}
})

const reddit = new snoowrap({
	userAgent: "discordbot v1.0 by /u/Nullifu",
	clientId: "aP693eIa52Hw33RAU_BLBg",
	clientSecret: "wBDkf5EbAgegOuttUzriMzoH2D7rrA",
	refreshToken: "1077880170959-kv79OULrO7gW-aLMHv8QaEvIJhHMOg",
})



client.once("ready", () => {
	console.log(`Logged in as ${client.user!.tag}`)
})

client.on("messageCreate", async (message) => {
	if (message.author.bot) return // Ignore messages from bots
	if (message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).trim().split(/ +/)
		const command = args.shift()!.toLowerCase()

		client.on("interactionCreate", async (interaction) => {
			if (!interaction.isCommand()) return
			const { commandName } = interaction
			if (commandName === "hello") {
				await interaction.reply("Hello, world!")
			}
		}	)


		// eslint-disable-next-line no-mixed-spaces-and-tabs
			 if (command === "gif") {
			// Sending an embedded GIF
			const embed = new EmbedBuilder()
				.setTitle("Heres a OMAR")
				.setImage("https://cdn.discordapp.com/attachments/681985000521990179/1138510507565920296/ezgif-5-04af2554ed.gif")
				.setColor("#0099ff")
			await message.reply({ embeds: [embed] })

		} else if (command === "help") {

			// Sending an embedded image
			const embed = new EmbedBuilder()
				.setTitle("List of current commands\n**PREFIX > !**")
				.setDescription("meme\nhentai\naww")
				.setColor("#ff9900")
			await 	message.reply({ embeds: [embed] })

		// TEST?
		} else if (command === "yummy") {
			await message.reply("skull")

		// fetch WIP v3
		} else if  (command === "meme") {
			const subredditName = "meme" // replace with subreddit to fetch from
			const subreddit = reddit.getSubreddit(subredditName)
			subreddit.getRandomSubmission().then( async ( randomPost ) => {
				if (randomPost.url) {
					const embed = new EmbedBuilder()
						.setTitle(randomPost.title)
						.setImage(randomPost.url)
						.setColor("#0099ff")

					await message.reply({ embeds: [embed] })
				} else {
					message.reply("No images found")
				}
			} ).catch( error => {
				console.error("Error fetching image from Reddit:", error)
				message.reply("An error occurred while fetching the image from Reddit.")				
			} )

		// eslint-disable-next-line no-dupe-else-if
		} else if  (command === "hentai") {
			const subredditName = "hentai" // replace with subreddit to fetch from
			const subreddit = reddit.getSubreddit(subredditName)
			subreddit.getRandomSubmission().then( async ( randomPost ) => {
				if (randomPost.url) {
					const embed = new EmbedBuilder()
						.setTitle(randomPost.title)
						.setImage(randomPost.url)
						.setColor("#0099ff")
	
					await message.reply({ embeds: [embed] })
				} else {
					message.reply("No images found")
				}
			} ).catch( error => {
				console.error("Error fetching image from Reddit:", error)
				message.reply("An error occurred while fetching the image from Reddit.")
			} )
			
			// eslint-disable-next-line no-dupe-else-if
		} else if  (command === "aww") {
			const subredditName = "Awww" // replace with subreddit to fetch from
			const subreddit = reddit.getSubreddit(subredditName)
			subreddit.getRandomSubmission().then( async ( randomPost ) => {
				if (randomPost.url) {
					const embed = new EmbedBuilder()
						.setTitle(randomPost.title)
						.setImage(randomPost.url)
						.setColor("#0099ff")
	
					await message.reply({ embeds: [embed] })
				} else {
					message.reply("No images found")
				}
			} ).catch( error => {
				console.error("Error fetching image from Reddit:", error)
				message.reply("An error occurred while fetching the image from Reddit.")
			} )
	

			
		}
	}
})


client.login(token)