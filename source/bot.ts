const prefix = "."
const token = 'ODMxMjU2NzI5NjY4ODEyODYy.GhZpo9.nR1KxRtjCEGQltpHmNUkLA8UKyw_pcvS_14ncg'
const SLAP_COUNTS_FILE = './slapCounts.json'; // Path to the JSON file for slap counts
const SLAP_IMAGE_DIRECTORY = './gifs/slaps'; // Your image directory path
const PUNCH_COUNTS_FILE = './punchCounts.json';
const PUNCH_IMAGE_DIRECTORY = './gifs/punch'
import { Client, Permissions, EmbedBuilder, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction, ButtonInteraction, ChatInputCommandInteraction, InteractionType, Message, GuildMemberRoleManager } from "discord.js"
import * as fs from 'node:fs';
import snoowrap from "snoowrap"
import { addUserCurrency, getUserCurrency } from "./currency.js";
import path from "node:path";
import db from "./db.js";


const allowedUserIds = ['292385626773258240', '587323617415659553'];  // Replace with the actual user ID



// Define some example jobs. Each job could have a different payout range.
const jobs = [
	{ name: 'Osaka', payout: { min: 3500, max: 10000 }, cost: 2500 },
	{ name: 'Osakas Friend', payout: { min: 2500, max: 5000 }, cost: 1000 },
	{ name: 'newbie', payout: { min: 70, max: 200 }, cost: 100 },
	// ... add as many jobs as you want
  ];

  const items = [
	{ name: "Gold Nugget", rarity: 5 }, // Rarity indicates how often it's found (1 = common, higher numbers = rarer)
	{ name: "Old Coin", rarity: 10 },
	{ name: "Rare Crystal", rarity: 20 },
	{ name: "Osaka", rarity: 100 },
	// ... more items
  ];
  

 // Cooldown setup
		const cooldowns = new Map<string, number>(); // userID -> timestamp
		const workCooldown = 60 * 60 * 1000; // Cooldown in milliseconds (1 hour)
		const digCooldown = 10 * 60 * 1000; // Cooldown in milliseconds (10 minutes)


// Array of random words or phrases to be used with the slap command
const randomReactions = ['Ouch!', 'Wow!', 'Bam!', 'Slap!', 'Pow!', 'Whack!, '];

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

		// START OF MOST COMMANDS -----------------------------------------------------------------------------------------------------------------------------------------------
		
		const embed = new EmbedBuilder()
		.setAuthor({name: 'made by .gwennnn', iconURL: 'https://static.wikia.nocookie.net/shingekinokyojin/images/4/4f/Mikasa_Ackermann_%28Anime%29_character_image.png/revision/latest?cb=20231105175401'})
		.setTitle('List of current commands\n**PREFIX for text commands >  .**')
		.setDescription('↓↓↓↓')
		.setColor('#ff9900')
		.setThumbnail('https://gcdn.thunderstore.io/live/repository/icons/mackeye-Osaka-1.0.0.png.256x256_q95.jpg')
		.addFields(
			{ name: 'Commands', value: 'meme, slap, cat, dog, punch, ' },
			{ name: 'Leaderboards' , value: 'Slap, Punch, Kill, Kiss, Pet,' },
			{ name: 'Currency Commands', value: 'Work, Balance, Add, Dig'},
			{ name: '18+ Commands', value: 'Hentai,' },
			{ name: 'Currency Commands > WIP <', value: 'Along with leaderboards' },
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


		if (command === "test") {
			// List of images
			const images = [
				"https://cdn.discordapp.com/attachments/681985000521990179/1138510507565920296/ezgif-5-04af2554ed.gif",
				"https://example.com/image2.gif",
				"https://example.com/image3.gif",
				// Add more image URLs here...
			];

			// Select a random image from the list
			const randomImage = images[Math.floor(Math.random() * images.length)];

			const embed = new EmbedBuilder()
				.setTitle("Here's a random image")
				.setImage(randomImage)
				.setColor("#0099ff")
			await message.reply({ embeds: [embed] 

		})


		}	else if (message.content.startsWith('.balance')) {
			// Check if the message mentions another user
			const mention = message.mentions.users.first();
			
			// Determine whose balance to check
			const userId = mention ? mention.id : message.author.id;
		  
			// Fetch currency for the specified user
			const currency = await getUserCurrency(userId);
		  
			// Create the embed
			const balanceEmbed = new EmbedBuilder()
			  .setColor(0x00FF00) // You can set whatever color you like
			  .setTitle('Balance')
			  .setDescription(`User <@${userId}> has **${currency}** osakacoins.`)
			  .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
			  .setTimestamp();
		  
			// Reply with the embed
			await message.reply({ embeds: [balanceEmbed] });


			

				
				} else if (message.content.startsWith('.add')) {
					if (!allowedUserIds.includes(message.author.id)) {
						const errorEmbed = new EmbedBuilder()
      					.setColor(0xFF0000) // Red for errors
      					.setTitle('Error')
      					.setDescription('You do not have permission to use this command. **DEV Only**')
      					.setTimestamp();
    					await message.reply({ embeds: [errorEmbed] });
    					return;
  						}

					const parts = message.content.split(' ');
					const amount = parts.length > 1 ? parseInt(parts[1], 10) : NaN;
					if (isNaN(amount)) {
					  const errorEmbed = new EmbedBuilder()
						.setColor(0xFF0000) // Red for errors
						.setTitle('Error')
						.setDescription('Please enter a valid number of coins to add.')
						.setTimestamp();
					  await message.reply({ embeds: [errorEmbed] });
					  return;
					}
					await addUserCurrency(message.author.id, amount);
					const addEmbed = new EmbedBuilder()
					  .setColor(0x00FF00)
					  .setTitle('Coins Added')
					  .setDescription(`${amount} coins added to your balance.`)
					  .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
					  .setTimestamp();
					await message.reply({ embeds: [addEmbed] });



				}	else if (message.content === '.work') {
					const now = Date.now();
					const lastWorkTime = cooldowns.get(message.author.id) || 0;
					const cooldownRemaining = lastWorkTime + workCooldown - now;
				
					if (cooldownRemaining > 0) {
					  // User is still on cooldown
					  const timeLeft = (cooldownRemaining / 1000 / 60).toFixed(2); // Convert to minutes and format
					  const cooldownEmbed = new EmbedBuilder()
						.setColor(0xFF0000) // Red color for alert
						.setTitle('Work Cooldown')
						.setDescription(`You need to rest! Please wait ${timeLeft} more minutes before working again.`)
						.setTimestamp();
					  await message.reply({ embeds: [cooldownEmbed] });
					  return;
					}
				
					// User is not on cooldown, proceed with work command
					const job = jobs[Math.floor(Math.random() * jobs.length)];
					const amountEarned = Math.floor(Math.random() * (job.payout.max - job.payout.min + 1)) + job.payout.min;
				
					// Add the amount earned to the user's balance
					await addUserCurrency(message.author.id, amountEarned);
				
					// Update the cooldown for the user
					cooldowns.set(message.author.id, now);
				
					// Create and send the work embed
					const workEmbed = new EmbedBuilder()
					  .setColor(0x00FF00) // Green color for success
					  .setTitle(`${job.name} Work`)
					  .setDescription(`You worked as a ${job.name} and earned ${amountEarned} osakacoins!`)
					  .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
					  .setTimestamp();
				
					await message.reply({ embeds: [workEmbed] });



				}	else if (message.content.startsWith('.dig')) {
					if (message.content.startsWith('.dig')) {
						const currentTime = Date.now();
						const authorId = message.author.id;
						const timestamp = cooldowns.get(authorId);
					
						// Check cooldown
						if (timestamp) {
						  const expirationTime = timestamp + digCooldown;
						  if (currentTime < expirationTime) {
							const timeLeft = expirationTime - currentTime;
							// Send a message with a dynamic timestamp
							await message.reply(`You need to wait before using the \`.dig\` command again. You can dig again <t:${Math.floor(expirationTime / 1000)}:R>.`);
							return;
						  }
						}
					
						// Set or update the cooldown
						cooldowns.set(authorId, currentTime);
						
						// The command logic
    					const coinsFound = Math.floor(Math.random() * 100) + 1;
						await addUserCurrency(message.author.id, coinsFound);
					  
						// Create the response embed
						const digEmbed = new EmbedBuilder()
						  .setColor(0xFFD700) // Gold color
						  .setTitle('Digging Results')
						  .setDescription(`You found ${coinsFound} coins!`)
						  .setTimestamp();
					  
						// Send the embed response
						await message.reply({ embeds: [digEmbed] 
						});
					}
					  

					


		// fetch WIP v3
	} else if (command === "meme") {
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
		const subredditName = "cats"; // replace with subreddit to fetch from
		const subreddit = reddit.getSubreddit(subredditName);
		subreddit.getRandomSubmission().then(async (randomPost) => {
		  if (randomPost.url) {
			const embed = new EmbedBuilder()
			  .setTitle(randomPost.title)
			  .setImage(randomPost.url)
			  .setColor("#0099ff");
			await message.reply({ embeds: [embed] });
		  }
		});

				// reddit fetch dog
	} else if  (command === "dog") {
		const subredditName = "dogs"; // replace with subreddit to fetch from
		const subreddit = reddit.getSubreddit(subredditName);
		subreddit.getRandomSubmission().then(async (randomPost) => {
		  if (randomPost.url) {
			const embed = new EmbedBuilder()
			  .setTitle(randomPost.title)
			  .setImage(randomPost.url)
			  .setColor("#0099ff");
			await message.reply({ embeds: [embed] });
		  }
		});

				// reddit fetch cat
	} else if  (command === "aww") {
		const subredditName = "aww"; // replace with subreddit to fetch from
		const subreddit = reddit.getSubreddit(subredditName);
		subreddit.getRandomSubmission().then(async (randomPost) => {
		  if (randomPost.url) {
			const embed = new EmbedBuilder()
			  .setTitle(randomPost.title)
			  .setImage(randomPost.url)
			  .setColor("#0099ff");
			await message.reply({ embeds: [embed] });
		  }
		});



				// reddit fetch 18+
	} else if  (command === "hentai") {
		const subredditName = "hentai"; // replace with subreddit to fetch from
		const subreddit = reddit.getSubreddit(subredditName);
		subreddit.getRandomSubmission().then(async (randomPost) => {
		  if (randomPost.url) {
			const embed = new EmbedBuilder()
			  .setTitle(randomPost.title)
			  .setImage(randomPost.url)
			  .setColor("#0099ff");
			await message.reply({ embeds: [embed] });
		  }
		});


	} else if (command === 'slap') {
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

				}	else if (command === 'inventory') {
							await showInventory(message);
						  }
						
						  async function showInventory(message: Message) {
							// Make sure to read the latest db before checking
							await db.read();
						  
							// Get the user's ID as a key
							const userId = message.author.id;
						  
							// Check if the users and items object exists in the database
							if (!db.data || !db.data.users || !db.data.items) {
							  await message.channel.send("The inventory system is not set up correctly.");
							  return;
							}
						  
							// Check if the user exists in the database
							const userInventory = db.data.users[userId]?.inventory;
							if (userInventory) {
							  let reply = `${message.author.username}'s Inventory:\n`;
						  
							  // Loop through each item in the user's inventory and add it to the reply message
							  for (const [itemId, inventoryItem] of Object.entries(userInventory)) {
								const item = db.data.items[itemId];
								if (item && inventoryItem.quantity) { // Make sure item and quantity exist
								  reply += `${item.name} x ${inventoryItem.quantity}\n`;
								} else {
								  // Handle the case where an item doesn't exist in the database
								  reply += `Item with ID ${itemId} not found.\n`;
								}
							  }
						  
							  await message.channel.send(reply);
							} else {
							  // If the user does not exist in the database, send a different message
							  await message.channel.send("You don't have an inventory yet.");
							  

						  if (command === 'additem') {
								const itemId = args[0];
								const quantity = parseInt(args[1], 10);
							
								if (!itemId || isNaN(quantity)) {
								  return message.channel.send('You need to specify an item ID and a quantity.');
								}
							
								try {
								  await addItemToInventory(message, itemId, quantity);
								} catch (error) {
								  console.error(error);
								  await message.channel.send('There was an error adding the item to your inventory.');
								}
							  }

							// Define a Map to store muted users and their timeout IDs
							const mutedUsers = new Map<string, NodeJS.Timeout>();
							}
						}
					}
				})

client.login(token);

function addItemToInventory(message: Message<boolean>, itemId: string, quantity: number) {
	throw new Error("Function not implemented.");
}

