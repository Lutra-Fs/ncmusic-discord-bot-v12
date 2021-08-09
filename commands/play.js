const ncmApi = require('NeteaseCloudMusicApi');
const embedMessage = require('./info.js');
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
    if (args[0] === 'playlist') {
      if (args[1] === 'id') {
        let target_playlist_detail = await ncmApi.playlist_detail
        ({id: parseInt(args[2]), realIP: '211.161.244.70'});
        if (target_playlist_detail.status !== 200) {
          return message.channel.send(
              target_playlist_detail);
        } else {
          let target_infos = target_playlist_detail.body.playlist.trackIds;
          let target_list_name = target_playlist_detail.body.playlist.name;
          for (target_ids of target_infos) {
            await this.play_song_id(message, queue, target_ids.id, true);
          }
          return message.channel.send(` **${ target_list_name }** has been add to queue. Note: That does not mean all the song can be played.`)
        }
      } else if (args[1] === 'name') {
        return message.channel.send(
            'Function not available!');
      }
    } else {
      // search the song in ncm
      let search_result = await ncmApi.search(
          {keywords: args.join(' '), limit: 1, realIP: '211.161.244.70'});
      let target_song_id = (await search_result).body.result.songs[0].id;
      await this.play_song_id(message, queue, target_song_id, false);
    }
  },


  play_song_id: async function(message, queue, target_song_id, list_flag) {
    const voiceChannel = message.member.voice.channel;
    const serverQueue = queue.get(message.guild.id);
    let song_info = await ncmApi.song_detail(
        {ids: target_song_id.toString(), realIP: '211.161.244.70'});

    const song = {
      title: song_info.body.songs[0].name,
      id: target_song_id,
      artist: song_info.body.songs[0].ar[0].name,
    };

    if (!serverQueue) {
      const curServerQueue = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 1,
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
      if (!list_flag)
        return message.channel.send(
            `**${song.title}** - **${song.artist}** has been added to the queue!`,
        );
    }
  },

  getURL: async function(song_id) {
    const link = await ncmApi.song_url({id: song_id, realIP: '211.161.244.70'});
    return link.body.data[0].url;
  }
  ,

  play: async function(message, song, queue) {
    const guild = message.guild;
    const serverQueue = queue.get(message.guild.id);

    if (!song) {
      serverQueue.leaveTimer = await setTimeout(
          () => { return this.leave(queue, guild.id);}
          , 60 * 1000);
      return;
    }
    try {
      clearTimeout(serverQueue.leaveTimer);
    } catch (e) {
      // there's no leaveTimer
    }
    const url = await this.getURL(song.id);
    if (url === null) {
      serverQueue.songs.shift();
      message.channel.send(
          'Error while getting the playing link, please ensure the song is available. Trying to skip to the next song in the queue.');
      await this.play(message, serverQueue.songs[0], queue);
    }
    const dispatcher = await serverQueue.connection.play(url).
        on('finish', () => {
          serverQueue.songs.shift();
          this.play(message, serverQueue.songs[0], queue);
        }).
        on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume);
    const songInfo = await embedMessage.getEmbedMessage(serverQueue);
    serverQueue.textChannel.send(`Start playing: **${song.title}** - **${song.artist}**`, {embed: songInfo});
  }
  ,
  leave: function(queue, guild_id) {
    const serverQueue = queue.get(guild_id);
    if (serverQueue) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild_id);
    }
  }
  ,
}
;
