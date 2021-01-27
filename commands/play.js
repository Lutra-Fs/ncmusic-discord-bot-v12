const ncmApi=require('NeteaseCloudMusicApi');

module.exports = {
  name: 'play',
  description: 'Play a song from ncm.',
  aliases:['p'],
  async execute(message, args) {
    // Create a dispatcher
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();
      let search_result = await ncmApi.search({keywords: args[0], limit: 1});
      let target_song_id = (await search_result).body.result.songs[0].id;
      let song_link = await ncmApi.song_url({id: target_song_id});
      console.log(song_link.body.data[0].url);

      const dispatcher = connection.play(song_link.body.data[0].url);
      const songInfo = {
        color: 0x0099ff,
        title: 'Some title',
        url: 'https://discord.js.org',
        author: {
          name: 'Some name',
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
          {
            name: 'Inline field title',
            value: 'Some value here',
            inline: true,
          },
          {
            name: 'Inline field title',
            value: 'Some value here',
            inline: true,
          },
          {
            name: 'Inline field title',
            value: 'Some value here',
            inline: true,
          },
        ],
        image: {
          url: 'https://i.imgur.com/wSTFkRM.png',
        },
        timestamp: new Date(),
        footer: {
          text: 'Some footer text here',
          icon_url: 'https://i.imgur.com/wSTFkRM.png',
        },
      };

      message.channel.send({ embed: songInfo });
      dispatcher.on('start', () => {
        console.log('audio.mp3 is now playing!');
      });

      dispatcher.on('finish', () => {
        console.log('audio.mp3 has finished playing!');
      });
      // Always remember to handle errors appropriately!
      dispatcher.on('error', console.error);
    }
    await message.channel.send('Function on development.');
  },
};