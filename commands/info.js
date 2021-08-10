const ncmApi = require('NeteaseCloudMusicApi');

module.exports = {
  name: 'info',
  description: 'get the info of current song',
  aliases: ['i'],
  execute: async function(message, args, queue) {
    const serverQueue = await queue.get(message.guild.id);
    let songInfo = await this.getEmbedMessage(serverQueue);
    message.channel.send({embed: songInfo});
  },
  getEmbedMessage: async function(serverQueue) {
    let song_info = await ncmApi.song_detail(
        {ids: serverQueue.songs[0].id.toString()});
    console.log(song_info.body.songs[0].name);
    let singer_detail = await ncmApi.artist_detail(
        {id: song_info.body.songs[0].ar[0].id});
    let comment_list = await ncmApi.comment_hot(
        {id: serverQueue.songs[0].id, type: 0, limit: 1});
    if (comment_list.body.total === 0) {
      comment_list = {
        body: {
          hotComments: [
            {
              content: 'error on getting hot comment',
              likedCount: 0,
              user: {
                nickname: '--',
              },
            }],
        },
      };
    }
    return {
      color: 0x0099ff,
      title: song_info.body.songs[0].name,
      url: 'https://music.163.com/#/song?id=' + serverQueue.songs[0].id,
      author: {
        name: song_info.body.songs[0].ar[0].name,
        icon_url: singer_detail.body.data.artist.cover,
        url: 'https://music.163.com/#/artist?id=' +
            song_info.body.songs[0].ar[0].id,
      },
      description: song_info.body.songs[0].al.name,
      thumbnail: {
        url: singer_detail.body.data.artist.cover,
      },
      fields: [
        {
          name: '\"' + comment_list.body.hotComments[0].content + '\"',
          value: 'From ' + comment_list.body.hotComments[0].user.nickname +
              ' , ' + comment_list.body.hotComments[0].likedCount + ' like',
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: '** **',
          value: '** **',
          inline: true,
        },
        {
          name: '** **',
          value: '** **',
          inline: true,
        },
        {
          name: '** **',
          value: '** **',
          inline: true,
        },
      ],
      image: {
        url: song_info.body.songs[0].al.picUrl + '?param=200y200',
      },
      timestamp: new Date(),
      footer: {
        text: 'NCMusic Bot',
        icon_url: 'https://i.imgur.com/DG3IevG.png',
      },
    };
  },
}
;