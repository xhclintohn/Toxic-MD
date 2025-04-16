const util = require('util');
const { zokou } = require(__dirname + '/../framework/zokou');
const axios = require('axios');

zokou(
  {
    nomCom: 'repoinfo',
    categorie: 'Search',
    reaction: '📦',
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, nomAuteurMessage } = commandeOptions;

    try {
      console.log('DEBUG - repoinfo triggered:', { arg, nomAuteurMessage });

      if (!arg[0]) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY ${nomAuteurMessage}, GET IT TOGETHER! Give me a GitHub repo URL, like .repoinfo https://github.com/mouricedevs/gifted! 😡\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const repoUrl = arg.join(' ').trim();
      if (!repoUrl.match(/^https:\/\/github\.com\/[\w-]+\/[\w-]+$/)) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ DUDE, ${nomAuteurMessage}! That’s not a valid GitHub repo URL! Use https://github.com/owner/repo, got it? 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, digging into "${repoUrl}" like a hacker! 🔍\n◈━━━━━━━━━━━━━━━━◈`);

      const apiUrl = `https://api.giftedtech.web.id/api/stalk/repostalk?apikey=gifted&url=${encodeURIComponent(repoUrl)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.success || !data.result) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ OUCH, ${nomAuteurMessage}! API’s acting up: ${data.error || 'Unknown error'}! Try again later! 😤\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Check for error in result
      if (data.result.error) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NO DICE, ${nomAuteurMessage}! Repo fetch failed: ${data.result.error}! Check the URL! 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Assuming valid repo data includes fields like name, description, etc.
      const repo = data.result;
      const description = repo.description || 'No description';
      const stars = repo.stargazers_count || 0;
      const forks = repo.forks_count || 0;
      const language = repo.language || 'Unknown';

      await zk.sendMessage(
        dest,
        {
          text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BAM, ${nomAuteurMessage}! Cracked open "${repoUrl}"! 🔥\n│❒ Repo: ${repo.name}\n│❒ Description: ${description}\n│❒ Stars: ${stars}\n│❒ Forks: ${forks}\n│❒ Language: ${language}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`,
          footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`,
        },
        { quoted: ms }
      );

    } catch (e) {
      console.error('Repo info error:', e);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL DISASTER, ${nomAuteurMessage}! Something blew up: ${e.message} 😡 Sort it out!\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);