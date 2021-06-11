const ncmApi = require('NeteaseCloudMusicApi');

module.exports = {
  name: 'info',
  description: 'get the info of current song',
  aliases: ['i'],
  execute: async function(message, args, queue) {
    const serverQueue = await queue.get(message.guild.id);
    let songInfo = await this.getembedmessage(serverQueue);
    message.channel.send({embed: songInfo});
  },
  getEmbedMessage:async function(serverQueue){
    let song_info = await ncmApi.song_detail(
        {ids: serverQueue.songs[0].id.toString()});
    return {
      color: 0x0099ff,
      title: song_info.body.songs[0].name,
      url: 'https://music.163.com/#/song?id=' + serverQueue.songs[0].id,
      author: {
        name: song_info.body.songs[0].ar[0].name,
        icon_url: 'https://i.imgur.com/wSTFkRM.png',
        url: 'https://music.163.com/#/artist?id=' +
            song_info.body.songs[0].ar[0].id,
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
        icon_url: 'https://i.imgur.com/DG3IevG.png',
      },
    };
  },
};