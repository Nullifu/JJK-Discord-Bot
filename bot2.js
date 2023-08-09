const Discord = require('discord.js');
const token = 'ODE3ODc2MjY1NzkxOTEzOTg1.YEP4oQ.2gsmSbbwdLhXnkYCmhgWVuP5YyQ'; // Replace with your actual bot token
const prefix = '!';     // PREFIX FOR COMMANDS
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	    ],
            });


client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return; // Ignore messages from bots

  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
      // START OF REPLY MESSAGE/COMMAND
    if (command === 'insert') {       
      message.reply('something');
    }
  }
});






client.login(token);