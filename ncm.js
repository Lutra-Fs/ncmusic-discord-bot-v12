const { login, user_cloud,search,song_url } = require('NeteaseCloudMusicApi')
async function main() {
    try {
        const login_result = await login({
            email: '',
            md5_password: ''
        })
        //console.log(login_result)
        const result2 = await user_cloud({
            cookie: login_result.body.cookie // 凭证
        })
        //console.log(result2.body)
        const result3=search({
            keywords:'万古生香',
            limit:1
        });
        console.log((await result3).body);
        let target_song_id=(await result3).body.result.songs[0].id;
        let songurl = await song_url({id: target_song_id});
        console.log(songurl.body.data[0].url);

    } catch (error) {
        console.log(error)
    }
}
main()