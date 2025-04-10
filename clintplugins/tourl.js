const { zokou } = require("../framework/zokou");
const fs = require("fs");
const util = require("util");

console.log("Attempting to load uploader...");
try {
  const { TelegraPh } = require("../../lib/uploader");
  console.log("Uploader loaded successfully");
} catch (e) {
  console.error("Failed to load uploader:", e);
}

// 𝐔𝐭𝐢𝐥𝐢𝐭𝐢𝐞𝐇 𝐌𝐨𝐝𝐮𝐥𝐞
// 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭�{o𝐧

zokou(
  {
    nomCom: "tourl",
    categorie: "Utilities",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, quoted } = commandeOptions;

    console.log("Tourl command triggered");

    // Check if an image is quoted
    if (!quoted || !/imageMessage/.test(quoted.mtype)) {
      console.log("No image quoted; mtype:", quoted ? quoted.mtype : "none");
      return repondre(
        `𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}𝐭𝐨𝐮𝐫𝐥 <𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐢𝐦𝐚𝐠𝐞>\n\n𝐏𝐥𝐞𝐚𝐻𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐭𝐨 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐚 𝐔𝐑𝐋!`
      );
    }

    try {
      repondre(`𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐚 𝐔𝐑𝐋 𝐟𝐨𝐫 𝐲𝐨𝐮𝐫 𝐢𝐮𝐚𝐠𝐞...`);
      console.log("Downloading image...");

      // Download and save the quoted image
      const media = await zk.downloadAndSaveMediaMessage(quoted);
      console.log("Image downloaded to:", media);

      // Upload to Telegra.ph
      const { TelegraPh } = require("../../lib/uploader"); // Load here to avoid early failure
      const url = await TelegraPh(media);
      console.log("Uploaded to URL:", url);

      // Send the image with the generated URL
      await zk.sendMessage(
        dest,
        {
          image: { url: media },
          caption: `𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐈𝐮𝐚𝐠𝐞 𝐋𝐢𝐧𝐤: \n\n${util.format(url)}\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
        },
        { quoted: ms }
      );

      // Clean up
      await fs.unlinkSync(media);
      console.log("Temporary file deleted");
    } catch (e) {
      console.error("Error in tourl:", e);
      repondre(`𝐄𝐫𝐫𝐨𝐫 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐔𝐑𝐋: ${e.message}`);
    }
  }
);

module.exports = { zokou };