// imagine.js
const util = require('util');
const { zokou } = require(__dirname + '/../framework/zokou');
const axios = require('axios');

zokou(
  {
    nomCom: 'imagine',
    categorie: 'AI',
    reaction: '🖌️',
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, nomAuteurMessage } = commandeOptions;

    try {
      console.log('DEBUG - imagine triggered:', { arg, nomAuteurMessage });

      if (!arg[0]) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY ${nomAuteurMessage}, DON’T BE A SLACKER! Give me a prompt, like .imagine Cute Cat! 😡\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const prompt = arg.join(' ').trim();
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, conjuring your "${prompt}" masterpiece! Hold tight! 🔍\n◈━━━━━━━━━━━━━━━━◈`);

      const apiUrl = `https://api.giftedtech.web.id/api/ai/imgsys?apikey=gifted&prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.success || !data.result || data.result.length === 0) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NO IMAGES, ${nomAuteurMessage}! Your "${prompt}" idea FLOPPED! Try something better! 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Pick a random image URL from result
      const imageUrl = data.result[Math.floor(Math.random() * data.result.length)];

      await zk.sendMessage(
        dest,
        {
          image: { url: imageUrl },
          caption: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM, ${nomAuteurMessage}! Your "${prompt}" image is PURE GOLD! 🔥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`,
          footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`,
        },
        { quoted: ms }
      );

    } catch (e) {
      console.error('Imagine error:', e);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL FAILURE, ${nomAuteurMessage}! Something tanked: ${e.message} 😡 Get it together!\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);