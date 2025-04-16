// wallpaperz.js
const { zokou } = require('../framework/zokou');
const fetch = require('node-fetch');

zokou(
  {
    nomCom: 'wallpaper',
    categorie: 'Search',
    reaction: '🖼️',
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;

    try {
      console.log('DEBUG - wallpaper triggered:', { arg });

      if (!arg[0]) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ DON'T WASTE MY TIME! Give me a query, like .wallpaper Sky! 😡\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const query = arg.join(' ').trim();
      const apiUrl = `https://api.giftedtech.web.id/api/search/wallpaper?apikey=gifted&query=${encodeURIComponent(query)}`;

      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Fetching your ${query} wallpaper, hold tight! 🔍\n◈━━━━━━━━━━━━━━━━◈`);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success || !data.results || data.results.length === 0) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NO WALLPAPERS FOUND! Try a better query, loser! 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Pick a random result and the highest quality image (_w635)
      const randomResult = data.results[Math.floor(Math.random() * data.results.length)];
      const imageUrl = randomResult.image.find(url => url.includes('_w635')) || randomResult.image[0];

      await zk.sendMessage(
        dest,
        {
          image: { url: imageUrl },
          caption: `𝐓𝐎𝐗�{I}𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! Here's your ${query} wallpaper! 🔥\n│❒ Type: ${randomResult.type}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`
        },
        { quoted: ms }
      );

    } catch (error) {
      console.error('wallpaper error:', error);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ EPIC FAIL! Something broke: ${error.message} 😡 Fix it or cry!\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);