const token = "ODMxMjU2NzI5NjY4ODEyODYy.GgrQMo.F2m440lXkujcF2JhDLzeSbCYJt7bccbo0mL5Ic"
const prefix = "."
const SLAP_COUNTS_FILE = './slapCounts.json'; // Path to the JSON file for slap counts
const SLAP_IMAGE_DIRECTORY = './gifs/slaps'; // Your image directory path
const PUNCH_COUNTS_FILE = './punchCounts.json';
const PUNCH_IMAGE_DIRECTORY = './gifs/punch'
import { Client, EmbedBuilder, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction, ButtonInteraction, ChatInputCommandInteraction } from "discord.js"
import * as fs from 'node:fs';
import snoowrap from "snoowrap"
import { addUserCurrency, getUserCurrency } from "./currency.js";
import path from "node:path";


// Array of random words or phrases to be used with the slap command
const randomReactions = ['Ouch!', 'Wow!', 'Bam!', 'Slap!', 'Pow!', 'Whack!'];

// Interface for a user's slap count
interface UserSlapCount {
	userId: string;
	count: number;
  }
  
  // ...
  
  // Function to read slap counts and return a sorted array
  function getSortedSlapCounts(): UserSlapCount[] {
	try {
	  const data = fs.readFileSync(SLAP_COUNTS_FILE, 'utf-8');
	  const slapCounts: { [key: string]: number } = JSON.parse(data);
  
	  // Create an array from the object with a known structure, then sort it by slap count
	  return Object.entries(slapCounts)
		.map(([userId, count]): UserSlapCount => ({ userId, count }))
		.sort((a, b) => b.count - a.count);
	} catch (error) {
	  console.error('Error reading the slap counts file:', error);
	  return [];
	}
  }


const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
	partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User]
  });

const clientId = "831256729668812862"


// Increase the listener limit for the interactionCreate event
client.setMaxListeners(15) // Set it to a reasonable value based on your use case
client.on('interactionCreate', async (interaction) => {	
})


const commands = [
	new SlashCommandBuilder()
		.setName("help")
		.setDescription("list of current commands"),
		new SlashCommandBuilder()
    	.setName('balance')
    	.setDescription('Check your current balance!'),
		new SlashCommandBuilder()
    	.setName('add')
    	.setDescription('Add currency to your balance.')
    	.addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The amount of currency to add')
        .setRequired(true)
		)
].map(command => command.toJSON())
const rest = new REST({ version: "10" }).setToken(token);





(async () => {
    try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationGuildCommands(clientId, `1167392383923666964`),
        { body: commands },
      );

      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  })();


  client.on('interactionCreate', async (interaction: Interaction) => {
	if (interaction.isChatInputCommand()) {
	  if (interaction.commandName === 'help') {
		await interaction.deferReply();
		
		const embed = new EmbedBuilder()
		.setAuthor({name: 'made by .gwennnn', iconURL: 'https://static.wikia.nocookie.net/shingekinokyojin/images/4/4f/Mikasa_Ackermann_%28Anime%29_character_image.png/revision/latest?cb=20231105175401'})
		.setTitle('List of current commands\n**PREFIX for text commands >  .**')
		.setDescription('meme\nslap\ncat\npunch\nslapboard')
		.setColor('#ff9900')
		.setThumbnail('https://gcdn.thunderstore.io/live/repository/icons/mackeye-Osaka-1.0.0.png.256x256_q95.jpg')
		.addFields(
			{ name: 'Leaderboards', value: 'Slap, Punch, Kill, Kiss, Pet,' },
			{ name: 'Slapboard is a global leaderboard', value: '.' },
			{ name: 'Slash Commands WIP', value: 'oh ma gah' },
			) 
		
		const button = new ButtonBuilder()
		  .setCustomId('more_help')
		  .setLabel('View Leaderboards')
		  .setStyle(ButtonStyle.Primary);
		
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
		
		// Follow up with the actual reply
		await interaction.editReply({
		  embeds: [embed],
		  components: [row]
		});
	  }
	} else if (interaction.isButton()) {
	  const buttonInteraction = interaction as ButtonInteraction;
	
	  if (buttonInteraction.customId === 'more_help') {
		const sortedSlapCounts = getSortedSlapCounts();
		// Take the top 10 slap counts, or less if there aren't enough entries
		const topSlaps = sortedSlapCounts.slice(0, 10);
	
		// Format the leaderboard string
		const leaderboard = topSlaps.map((entry, index) => 
		  `${index + 1}. <@${entry.userId}> - ${entry.count} slap(s)`
		).join('\n');
	
		// Create and send the embed
		const moreHelpEmbed = new EmbedBuilder()
		  .setColor(0x00AE86)
		  .setTitle('Slap Leaderboard')
		  .setDescription(leaderboard)
		  .setTimestamp();
	
		await buttonInteraction.update({ embeds: [moreHelpEmbed], components: [] });
	  }}
	})
	
	
		  

const reddit = new snoowrap({
	userAgent: "discordbot v1.0 by /u/Nullifu",
	clientId: "aP693eIa52Hw33RAU_BLBg",
	clientSecret: "wBDkf5EbAgegOuttUzriMzoH2D7rrA",
	refreshToken: "1077880170959-kv79OULrO7gW-aLMHv8QaEvIJhHMOg",
})



client.on("ready", () => {
	console.log(`Logged in as ${client.user!.tag}`)
		})


	

client.on("messageCreate", async (message) => {
	if (message.author.bot) return // Ignore messages from bots
	if (message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).trim().split(/ +/)
		const command = args.shift()!.toLowerCase()


		if (command === "gif") {
			const embed = new EmbedBuilder()
				.setTitle("Heres a OMAR")
				.setImage("https://cdn.discordapp.com/attachments/681985000521990179/1138510507565920296/ezgif-5-04af2554ed.gif")
				.setColor("#0099ff")
			await message.reply({ embeds: [embed] })



		}	else if (message.content === '.balance') {
				const currency = await getUserCurrency(message.author.id);
				message.reply(`You have ${currency} coins.`);
			  } else if (message.content.startsWith('.add')) {
				const amount = parseInt(message.content.split(' ')[1]);
				if (isNaN(amount)) {
				  message.reply('Please enter a valid number of coins to add.');
				  return;
				}	
				await addUserCurrency(message.author.id, amount);
				message.reply(`${amount} coins added to your balance.`);





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


			
			// reddit fetch cat
		} else if  (command === "cat") {
			const subredditName = "cat" // replace with subreddit to fetch from
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



			// Check if the command is `slap`
		}	else if (command === 'slap') {
			// Check if there is a user mentioned
			if (message.mentions.users.size === 0) {
			  await message.reply('You need to mention a user to slap!');
			  return;
			}
		
			const userToSlap = message.mentions.users.first()!;
			let slapCounts: Record<string, number>; 
		
			try {
			  slapCounts = JSON.parse(fs.readFileSync(SLAP_COUNTS_FILE, 'utf8'));
			} catch (err) {
			  slapCounts = {};
			}
		
			const userId = userToSlap.id;
			slapCounts[userId] = (slapCounts[userId] || 0) + 1;
		
			try {
			  fs.writeFileSync(SLAP_COUNTS_FILE, JSON.stringify(slapCounts, null, 2), 'utf8');
			} catch (err) {
			  console.error('Error writing to slap counts file:', err);
			  return;
			}
		
			try {
			  const files = fs.readdirSync(SLAP_IMAGE_DIRECTORY);
			  const imageFiles = files.filter(file => /\.(png|jpe?g|gif)$/i.test(file));
		
			  if (imageFiles.length === 0) {
				console.error('No images found in the directory');
				return;
			  }
		
				  const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
				  const imagePath = path.join(SLAP_IMAGE_DIRECTORY, randomImage);
		
				// Select a random word or phrase
				const randomReaction = randomReactions[Math.floor(Math.random() * randomReactions.length)];
		
				  const embed = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle('Slap!')
				.setDescription(`${message.author.tag} just slapped ${userToSlap.tag}! ${randomReaction} `)
				.setImage(`attachment://${randomImage}`)
				.setFooter({ text: `That's slap number ${slapCounts[userId]} for them!` })
				.setTimestamp();
		
				  const imageAttachment = new AttachmentBuilder(imagePath, { name: randomImage });
		
				  await message.channel.send({ embeds: [embed], files: [imageAttachment] });
			} catch (err) {
			  console.error('Error reading image directory:', err);
				   } 
		
		
		// Check if the command is `punch`
			}	else if (command === 'punch') {
				// Check if there is a user mentioned
					if (message.mentions.users.size === 0) {
						await message.reply('You need to mention a user to slap!');
						return;
							}
					
				const userToPunch = message.mentions.users.first()!;
					let punchCounts: Record<string, number>;
					
					try {
						punchCounts = JSON.parse(fs.readFileSync(PUNCH_COUNTS_FILE, 'utf8'));
							} catch (err) {
								  punchCounts = {};
								}
					
				const userId = userToPunch.id;
					punchCounts[userId] = (punchCounts[userId] || 0) + 1;
					
				try {
					 fs.writeFileSync(PUNCH_COUNTS_FILE, JSON.stringify(punchCounts, null, 2), 'utf8');
						} catch (err) {
						  console.error('Error writing to slap counts file:', err);
						  return;
						}
					
					try {
						const files = fs.readdirSync(PUNCH_IMAGE_DIRECTORY);
						const imageFiles = files.filter(file => /\.(png|jpe?g|gif)$/i.test(file));
					
						  if (imageFiles.length === 0) {
							console.error('No images found in the directory');
							return;
						  }
					
						const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
							const imagePath = path.join(PUNCH_IMAGE_DIRECTORY, randomImage);
					
							// Select a random word or phrase
							const randomReaction = randomReactions[Math.floor(Math.random() * randomReactions.length)];
					
							  const embed = new EmbedBuilder()
							.setColor(0xFF0000)
							.setTitle('Punch!')
							.setDescription(`${message.author.tag} just punched ${userToPunch.tag}! ${randomReaction} `)
							.setImage(`attachment://${randomImage}`)
							.setFooter({ text: `That's punch number ${punchCounts[userId]} for them!` })
							.setTimestamp();
					
							  const imageAttachment = new AttachmentBuilder(imagePath, { name: randomImage });
					
							  await message.channel.send({ embeds: [embed], files: [imageAttachment] });
						} catch (err) {
						  console.error('Error reading image directory:', err);
						}
					}
				}
			})
	   
client.login(token)