const { zokou } = require("../framework/zokou");
const fs = require("fs");
const util = require("util");
const { TelegraPh } = require("../../lib/uploader");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
//                   𝐔𝐓𝐈𝐋𝐈𝐓𝐈𝐄𝐒 𝐌𝐎𝐃𝐔𝐋𝐄             //
//               𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃                //
//             𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧                   //
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

// ToURL Command
zokou(
  {
    nomCom: "tourl",
    categorie: "Utilities",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, quoted } = commandeOptions;
    try {
      if (quoted && /image/.test(quoted.mtype)) {
        repondre("🔄 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐚 𝐔𝐑𝐋 𝐟𝐨𝐫 𝐲𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞...");

        // Download and save the quoted image
        let media = await zk.downloadAndSaveMediaMessage(quoted);

        // Upload to Telegra.ph and get URL
        let anu = await TelegraPh(media);

        // Send the image with the generated URL
        await zk.sendMessage(
          dest,
          {
            image: { url: media },
            caption: `🌐 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐈𝐦𝐚𝐠𝐞 𝐋𝐢𝐧𝐤 🌐\n\n${util.format(
              anu
            )}\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
          },
          { quoted: ms }
        );

        // Clean up the temporary file
        await fs.unlinkSync(media);
      } else {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}tourl <𝐫𝐞𝐝𝐥𝐲 𝐭𝐨 𝐢𝐦𝐚𝐠𝐞>\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐭𝐨 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐚 𝐔𝐑𝐋!`
        );
      }
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

module.exports = { zokou };