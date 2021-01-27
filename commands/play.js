const ncmApi = require('NeteaseCloudMusicApi');

module.exports = {
  name: 'play',
  description: 'Play a song from ncm.',
  aliases: ['p'],
  async execute(message, args,stack,current_song_id) {
    //search the song in ncm
    let search_result = await ncmApi.search({keywords: args.join(" "), limit: 1});
    let target_song_id = (await search_result).body.result.songs[0].id;
    let song_link = await ncmApi.song_url({id: target_song_id});
    let song_info = await ncmApi.song_detail(
        {ids: target_song_id.toString()});
    // Create a dispatcher
    if (message.member.voice.channel&&current_song_id===null) {
      const connection = await message.member.voice.channel.join();
      console.log(song_link.body.data[0].url);

      const dispatcher = connection.play(song_link.body.data[0].url);
      const songInfo = {
        color: 0x0099ff,
        title: song_info.body.songs[0].name,
        url: 'https://discord.js.org',
        author: {
          name: song_info.body.songs[0].ar[0].name,
          icon_url: 'https://i.imgur.com/wSTFkRM.png',
          url: 'https://discord.js.org',
        },
        description: 'Some description here',
        thumbnail: {
          url: 'https://i.imgur.com/wSTFkRM.png',
        },
        fields: [
          {
            name: 'Regular field title',
            value: 'Some value here',
          },
          {
            name: '\u200b',
            value: '\u200b',
            inline: false,
          },
        ],
        image: {
          url: 'https://i.imgur.com/wSTFkRM.png',
        },
        timestamp: new Date(),
        footer: {
          text: 'NCMusic Bot',
          icon_url: 'https://i.imgur.com/wSTFkRM.png',
        },
      };

      await message.channel.send({embed: songInfo});
      dispatcher.on('start', () => {
        console.log('audio.mp3 is now playing!');
      });

      dispatcher.on('finish', () => {
        console.log('audio.mp3 has finished playing!');
        connection.disconnect();
      });
      // Always remember to handle errors appropriately!
      dispatcher.on('error', console.error);
    } else {
      await message.reply(
          'you must be in a voice channel to play a song!');
    }
    await message.channel.send('Function in development.');
  },
};