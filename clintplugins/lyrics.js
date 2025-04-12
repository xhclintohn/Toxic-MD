const { zokou } = require("../framework/zokou");
const axios = require("axios"); // Use axios for API requests

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
//                   𝐒𝐄𝐀𝐑𝐂𝐇 𝐌𝐎𝐃𝐔𝐋𝐄                 //
//               𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃                //
//             𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧                   //
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

zokou(
  {
    nomCom: "xlyrics",
    categorie: "Search",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, arg } = commandeOptions;

    try {
      if (!arg || arg.length === 0) {
        return repondre(
          `🔍 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}xlyrics Shape of You\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞 𝐭𝐨 𝐬𝐞𝐚𝐫𝐜𝐡 𝐟𝐨𝐫 𝐥𝐲𝐫𝐢𝐜𝐬!`
        );
      }

      const searchTerm = arg.join(" ");
      repondre(`🔄 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐟𝐨𝐫 𝐥𝐲𝐫𝐢𝐜𝐬 𝐨𝐟 "${searchTerm}"...`);

      // Fetch lyrics using the provided API
      const response = await axios.get(`https://api.giftedtech.web.id/api/search/lyrics?apikey=gifted&query=${encodeURIComponent(searchTerm)}`);
      const result = response.data;

      if (result && result.lyrics) {
        // Format response
        const lyricsText = `
◈━━━━━━━━━━━━━━━━◈
  ⚡️ 𝐋𝐲𝐫𝐢𝐜𝐬 𝐒𝐞𝐚𝐫𝐜𝐡 𝐄𝐧𝐠𝐢𝐧𝐞 ⚡️

> 𝐒𝐞𝐚𝐫𝐜𝐡 𝐓𝐞𝐫𝐦: *${searchTerm}*
> 𝐋𝐲𝐫𝐢𝐜𝐬:

${result.lyrics}

◈━━━━━━━━━━━━━━━━◈
𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃
𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
`;

        // Send response with bot image
        await zk.sendMessage(
          dest,
          {
            image: { url: mybotpic() }, // Use mybotpic() as in your menu.js
            caption: lyricsText,
          },
          { quoted: ms }
        );
      } else {
        repondre(`❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐢𝐧𝐝 𝐥𝐲𝐫𝐢𝐜𝐬.`);
      }
    } catch (e) {
      repondre(`❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐢𝐧𝐝 𝐥𝐲𝐫𝐢𝐜𝐬: ${e.message}`);
    }
  }
);

module.exports = { zokou };