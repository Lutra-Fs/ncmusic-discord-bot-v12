const ncmApi = require('NeteaseCloudMusicApi');
const embedMessage = require('./info.js')
module.exports = {
  name: 'play',
  description: 'Play a song from ncm.',
  aliases: ['p'],
  execute: async function(message, args, queue) {
    const voiceChannel = message.member.voice.channel;
    const serverQueue = queue.get(message.guild.id);
    if (!voiceChannel)
      return message.channel.send(
          'You need to be in a voice channel to play music!',
      );
    if (serverQueue && voiceChannel !== serverQueue.voiceChannel) {
      return message.channel.send(
          'You need to be in the same channel with the bot to play music',
      );
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.channel.send(
          'I need the permissions to join and speak in your voice channel!',
      );
    }

    // search the song in ncm
    let search_result = await ncmApi.search(
        {keywords: args.join(' '), limit: 1, realIP: '211.161.244.70'});
    let target_song_id = (await search_result).body.result.songs[0].id;
    let song_info = await ncmApi.song_detail(
        {ids: target_song_id.toString(), realIP: '211.161.244.70'});

    const song = {
      title: song_info.body.songs[0].name,
      id: target_song_id,
    };

    if (!serverQueue) {
      const curServerQueue = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      queue.set(message.guild.id, curServerQueue);
      curServerQueue.songs.push(song);

      try {
        curServerQueue.connection = await voiceChannel.join();
        await this.play(message, curServerQueue.songs[0], queue);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(
          `${song.title} has been added to the queue!`,
      );
    }
  },

  getURL: async function(song_id) {
    const link = await ncmApi.song_url({id: song_id, realIP: '211.161.244.70'});
    const url = link.body.data[0].url;
    console.log(url);
    return url;
  },

  async play(message, song, queue) {
    const guild = message.guild;
    const serverQueue = queue.get(message.guild.id);

    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
    const url = await this.getURL(song.id);
    const dispatcher = await serverQueue.connection.play(url).
        on('finish', () => {
          serverQueue.songs.shift();
          //if(!serverQueue.songs[0])   connection
          this.play(message, serverQueue.songs[0], queue);
        }).
        on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
    const songInfo=await embedMessage.getEmbedMessage(serverQueue);
    await message.channel.send({embed: songInfo});
  },

};