// require the discord.js module
const Discord = require('discord.js');

const fs = require('fs');
const {prefix, token} = require('./config.json');

// create a new Discord client
const client = new Discord.Client();

//Dynamic read the command file.
client.commands = new Discord.Collection();
//filter, only js file needs to be read.
const commandFiles = fs.readdirSync('./commands').
    filter(file => file.endsWith('.js'));
//read codes.
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
  console.log('Ready!');
});

// login to Discord with your app's token
client.login(token);
var stack=[],current_song_id=null;
client.on('message', async message => {

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
      || client.commands.find(
          cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;
  try {
    await command.execute(message, args,stack,current_song_id);
  } catch (error) {
    console.error(error);
    await message.reply('there was an error trying to execute that command!');
  }
})
;

