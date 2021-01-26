// require the discord.js module
const Discord = require('discord.js');
//const ncm = require('./ncm.js');
const ncmApi = require('NeteaseCloudMusicApi');
const {prefix, token} = require('./config.json');

// create a new Discord client
const client = new Discord.Client();

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
  console.log('Ready!');
});

// login to Discord with your app's token
client.login(token);

client.on('message', async message => {

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'args-info') {
    if (!args.length) {
      return message.channel.send(
          `You didn't provide any arguments, ${message.author}!`);
    }

    await message.channel.send(`Command name: ${command}\nArguments: ${args}`);
  } else if (command === 'play') {
    if (!args.length) {
      return message.channel.send(
          `You didn't provide any arguments, ${message.author}!`);
    }
    // Create a dispatcher
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();
      let search_result = await ncmApi.search({keywords: args[0], limit: 1});
      let target_song_id = (await search_result).body.result.songs[0].id;
      let song_link = await ncmApi.song_url({id: target_song_id});
      console.log(song_link.body.data[0].url);

      const dispatcher = connection.play(song_link.body.data[0].url);

      dispatcher.on('start', () => {
        console.log('audio.mp3 is now playing!');
      });
      console.log('audio.mp3 has finished playing!');
      dispatcher.on('finish', () => {

      });
      // Always remember to handle errors appropriately!
      dispatcher.on('error', console.error);
    }
    await message.channel.send('Function on development.');
  } else if (command === 'skip') {
    if (!args.length) {
      return message.channel.send(
          `You didn't provide any arguments, ${message.author}!`);
    }
    await message.channel.send('Function on development.');
  }

  /*if (message.content.startsWith(`${prefix}play`)) {
      message.channel.send('Function on development.');
  } else if (message.content.startsWith(`${prefix}skip`)) {
      message.channel.send('Function on development.');
  }*/
})
;

