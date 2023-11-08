
import Discord from 'discord.js';
const client = new Discord.Client();
const prefix = '!'; // Change this to your desired prefix
const token = 'ODE3ODc2MjY1NzkxOTEzOTg1.GaMrKZ.gqiMAn80VgcN7KmOMWSp4DGuhG-WQ1SRj8Bp0U'

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'mute') {
    // Check if user has permission to mute
    if (!message.member.hasPermission('MANAGE_ROLES')) return message.reply('You do not have permission to use this command.');

    // Check if user specified a member to mute
    const member = message.mentions.members.first();
    if (!member) return message.reply('Please specify a member to mute.');

    // Check if user specified a reason for the mute
    const reason = args.join(' ');
    if (!reason) return message.reply('Please specify a reason for the mute.');

    // Mute the member
    const mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!mutedRole) return message.reply('Muted role not found. Please create a role named "Muted" and try again.');
    member.roles.add(mutedRole);
    message.channel.send(`${member.user.tag} has been muted for ${reason}.`);
  }

  if (command === 'ban') {
    // Check if user has permission to ban
    if (!message.member.hasPermission('BAN_MEMBERS')) return message.reply('You do not have permission to use this command.');

    // Check if user specified a member to ban
    const member = message.mentions.members.first();
    if (!member) return message.reply('Please specify a member to ban.');

    // Check if user specified a reason for the ban
    const reason = args.join(' ');
    if (!reason) return message.reply('Please specify a reason for the ban.');

    // Ban the member
    member.ban({ reason: reason })
      .then(() => message.channel.send(`${member.user.tag} has been banned for ${reason}.`))
      .catch(error => message.reply(`An error occurred: ${error}`));
  }

  if (command === 'addrole') {
    // Check if user has permission to add roles
    if (!message.member.hasPermission('MANAGE_ROLES')) return message.reply('You do not have permission to use this command.');

    // Check if user specified a member to add the role to
    const member = message.mentions.members.first();
    if (!member) return message.reply('Please specify a member to add the role to.');

    // Check if user specified a role to add
    const role = message.mentions.roles.first();
    if (!role) return message.reply('Please specify a role to add.');

    // Add the role to the member
    member.roles.add(role);
    message.channel.send(`${member.user.tag} has been given the ${role.name} role.`);
  }
});

client.login('ODE3ODc2MjY1NzkxOTEzOTg1.GaMrKZ.gqiMAn80VgcN7KmOMWSp4DGuhG-WQ1SRj8Bp0U');
