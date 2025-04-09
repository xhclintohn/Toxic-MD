const { zokou } = require("../framework/zokou");
const { lyricsv2 } = require("@bochilteam/scraper");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
//                   𝐒𝐄𝐀𝐑𝐂𝐇 𝐌𝐎𝐃𝐔𝐋𝐄                 //
//               𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃                //
//             𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧                   //
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

zokou(
  {
    nomCom: "lyrics",
    categorie: "Search",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, arg } = commandeOptions;

    try {
      if (!arg || arg.length === 0) {
        return repondre(
          `🔍 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}lyrics Shape of You\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞 𝐭𝐨 𝐬𝐞𝐚𝐫𝐜𝐡 𝐟𝐨𝐫 𝐥𝐲𝐫𝐢𝐜𝐬!`
        );
      }

      const searchTerm = arg.join(" ");
      repondre(`🔄 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐟𝐨𝐫 𝐥𝐲𝐫𝐢�{c𝐬 𝐨𝐟 "${searchTerm}"...`);

      // Fetch lyrics using lyricsv2
      const result = await lyricsv2(searchTerm);

      // Format response
      const lyricsText = `
◈━━━━━━━━━━━━━━━━◈
  ⚡️ 𝐋𝐲𝐫𝐢𝐜𝐬 𝐒𝐞𝐚𝐫𝐜𝐡 𝐄𝐧𝐠𝐢𝐧𝐞 ⚡️

> 𝐒𝐞𝐚𝐫�{c𝐡 𝐓𝐞𝐫𝐦: *${searchTerm}*
> 𝐋𝐲𝐫𝐢�{c𝐬:

${result.lyrics}

◈━━━━━━━━━━━━━━━━◈
�{P𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢�{c-𝐌𝐃
𝐎𝐰𝐧𝐞�{r: 𝐱𝐡_�{c𝐥𝐢𝐧𝐭𝐨𝐧
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
    } catch (e) {
      repondre(`❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐢𝐧𝐝 𝐥𝐲𝐫𝐢�{c𝐬: ${e.message}`);
    }
  }
);

module.exports = { zokou };
