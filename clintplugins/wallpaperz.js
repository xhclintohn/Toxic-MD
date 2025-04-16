// wallpaperz.js
const util = require('util');
const { zokou } = require(__dirname + '/../framework/zokou');
const axios = require('axios');

zokou(
  {
    nomCom: 'wallpaper',
    categorie: 'Search',
    reaction: '🖼️',
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, nomAuteurMessage } = commandeOptions;

    try {
      console.log('DEBUG - wallpaper triggered:', { arg, nomAuteurMessage });

      if (!arg[0]) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO ${nomAuteurMessage}, DON'T WASTE MY TIME! Give me a query, like .wallpaper Sky! 😡\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const query = arg.join(' ').trim();
      const apiUrl = `https://api.giftedtech.web.id/api/search/wallpaper?apikey=gifted&query=${encodeURIComponent(query)}`;

      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Hang on, ${nomAuteurMessage}! Fetching your ${query} wallpaper like a boss! 🔍\n◈━━━━━━━━━━━━━━━━◈`);

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.success || !data.results || data.results.length === 0) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NO WALLPAPERS, ${nomAuteurMessage}! Your ${query} query SUCKS! Try something better! 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Pick a random result and the highest quality image (_w635)
      const randomResult = data.results[Math.floor(Math.random() * data.results.length)];
      const imageUrl = randomResult.image.find(url => url.includes('_w635')) || randomResult.image[0];

      await zk.sendMessage(
        dest,
        {
          image: { url: imageUrl },
          caption: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM, ${nomAuteurMessage}! Your ${query} wallpaper is FIRE! 🔥\n│❒ Type: ${randomResult.type}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`,
          footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`,
        },
        { quoted: ms }
      );

    } catch (e) {
      console.error('Wallpaper error:', e);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ CRASH AND BURN, ${nomAuteurMessage}! Something broke: ${e.message} 😡 Fix it or get lost!\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);