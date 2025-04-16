const util = require('util');
const { zokou } = require(__dirname + '/../framework/zokou');
const axios = require('axios');

zokou(
  {
    nomCom: 'yts',
    categorie: 'Search',
    reaction: '🎬',
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, nomAuteurMessage } = commandeOptions;

    try {
      console.log('DEBUG - yts triggered:', { arg, nomAuteurMessage });

      if (!arg[0]) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO ${nomAuteurMessage}, STOP WASTING MY TIME! Give me a search query, like .yts Spectre! 😡\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const query = arg.join(' ').trim();
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Hang on, ${nomAuteurMessage}! Scouting YouTube for "${query}" like a boss! 🔍\n◈━━━━━━━━━━━━━━━━◈`);

      const apiUrl = `https://api.giftedtech.web.id/api/search/yts?apikey=gifted&query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.success || !data.results || data.results.length === 0) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NO VIDEOS, ${nomAuteurMessage}! Your "${query}" search SUCKS! Try something else! 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Pick a random video from results
      const video = data.results[Math.floor(Math.random() * data.results.length)];

      await zk.sendMessage(
        dest,
        {
          text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NAILED IT, ${nomAuteurMessage}! Found a banger for "${query}"! 🔥\n│❒ Title: ${video.title}\n│❒ URL: ${video.url}\n│❒ Duration: ${video.duration.timestamp}\n│❒ Views: ${video.views.toLocaleString()}\n│❒ Author: ${video.author.name}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`,
          footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`,
        },
        { quoted: ms }
      );

    } catch (e) {
      console.error('YouTube search error:', e);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ EPIC FAIL, ${nomAuteurMessage}! Something crashed: ${e.message} 😡 Fix it or cry! 😣\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);