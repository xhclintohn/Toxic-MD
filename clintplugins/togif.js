const { zokou } = require("../framework/zokou");
const fs = require("fs");
const { webp2mp4File } = require("../../lib/uploader");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
//                   𝐔𝐓𝐈𝐋𝐈𝐓𝐈𝐄𝐒 𝐌𝐎𝐃𝐔𝐋𝐄             //
//               𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃                //
//             𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧                   //
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

// ToGIF Command
zokou(
  {
    nomCom: "togif",
    categorie: "Utilities",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, quoted } = commandeOptions;
    try {
      if (quoted && /webp/.test(quoted.mtype)) {
        repondre("🔄 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐭𝐨 𝐆𝐈𝐅...");

        // Download and save the quoted sticker
        let mediaMess = await zk.downloadAndSaveMediaMessage(quoted);
        let webpToMp4 = await webp2mp4File(mediaMess);

        // Send the converted GIF
        await zk.sendMessage(
          dest,
          {
            video: { url: webpToMp4.result },
            caption: "🎞 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐞𝐝 𝐭𝐨 𝐆𝐈𝐅 🎞\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
            gifPlayback: true,
          },
          { quoted: ms }
        );

        // Clean up the temporary file
        fs.unlinkSync(mediaMess);
      } else {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}togif <𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧𝐢𝐦𝐚𝐭𝐞𝐝 𝐬𝐭𝐢𝐜𝐤𝐞𝐫>\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 *𝐚𝐧𝐢𝐦𝐚𝐭𝐞𝐝* 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐭𝐨 𝐜𝐨𝐧𝐯𝐞𝐫𝐭 𝐢𝐭 𝐭𝐨 𝐚 𝐆𝐈𝐅!`
        );
      }
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

module.exports = { zokou };