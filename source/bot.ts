import snoowrap from "snoowrap"
const token = "ODE3ODc2MjY1NzkxOTEzOTg1.YEP4oQ.2gsmSbbwdLhXnkYCmhgWVuP5YyQ"
const prefix = "!"
import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js"
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	]
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

		if (command === "insert") {
			await message.reply("something")
		} else if (command === "gif") {

			// Sending an embedded GIF
			const embed = new EmbedBuilder()
				.setTitle("Here's a OMAR!")
				.setImage("https://cdn.discordapp.com/attachments/681985000521990179/1138510507565920296/ezgif-5-04af2554ed.gif")
				.setColor("#0099ff")
			await message.reply({ embeds: [embed] })

		} else if (command === "image") {

			// Sending an embedded image
			const embed = new EmbedBuilder()
				.setTitle("cooking time")
				.setImage("https://i.redd.it/3jj7hdwm31q41.jpg")
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
		} else if  (command === "!aww") {
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