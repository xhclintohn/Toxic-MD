const util = require('util');
const { zokou } = require(__dirname + '/../framework/zokou');
const axios = require('axios');

zokou(
  {
    nomCom: 'github',
    categorie: 'Search',
    reaction: '📂',
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, nomAuteurMessage } = commandeOptions;

    try {
      console.log('DEBUG - github triggered:', { arg, nomAuteurMessage });

      if (!arg[0]) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO ${nomAuteurMessage}, DON’T SLACK OFF! Give me a GitHub username, like .github xhclintohn! 😡\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const username = arg.join(' ').trim();
      await repondre(`�	T𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, stalking "${username}" on GitHub like a pro! 🔍\n◈━━━━━━━━━━━━━━━━◈`);

      const apiUrl = `https://api.giftedtech.web.id/api/stalk/gitstalk?apikey=gifted&username=${encodeURIComponent(username)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.success || !data.result) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ OOF, ${nomAuteurMessage}! Something’s busted with the API! Try again later! 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      if (data.result.message === 'Not Found') {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NOPE, ${nomAuteurMessage}! "${username}" doesn’t exist on GitHub! What a loser! 😤\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Assuming valid user data includes fields like login, bio, public_repos, etc.
      const user = data.result;
      const bio = user.bio || 'No bio';
      const repos = user.public_repos || 0;
      const followers = user.followers || 0;
      const following = user.following || 0;

      await zk.sendMessage(
        dest,
        {
          text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM, ${nomAuteurMessage}! Got the dirt on "${username}"! 🔥\n│❒ Username: ${user.login}\n│❒ Bio: ${bio}\n│❒ Repos: ${repos}\n│❒ Followers: ${followers}\n│❒ Following: ${following}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`,
          footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`,
        },
        { quoted: ms }
      );

    } catch (e) {
      console.error('GitHub stalk error:', e);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ CRASHED HARD, ${nomAuteurMessage}! Something broke: ${e.message} 😡 Fix it or get lost!\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);