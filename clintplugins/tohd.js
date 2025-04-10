const { zokou } = require("../framework/zokou");
const fetch = require("node-fetch");
const FormData = require("form-data");

// 𝐔𝐭𝐢𝐥𝐢𝐭𝐢𝐞𝐳 𝐌𝐨𝐝𝐮𝐥𝐞
// 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

zokou(
  {
    nomCom: "tohd",
    categorie: "Utilities",
    reaction: "📸",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, quoted, prefixe } = commandeOptions;

    // Check if an image is quoted
    if (!quoted) {
      return repondre(
        `𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}𝐭𝐨𝐡𝐝 <𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐢𝐦𝐚𝐠𝐞>\n\n𝐏𝐥𝐞𝐚𝐻𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐭𝐨 𝐞𝐧𝐡𝐚𝐧𝐜𝐞 𝐭𝐨 𝐇𝐃!`
      );
    }

    const mime = quoted.mtype || "";
    if (!/imageMessage/.test(mime)) {
      return repondre(
        `𝐍𝐨 𝐢𝐦𝐚𝐠𝐞 𝐟𝐨𝐮𝐧𝐝! 𝐏𝐥𝐞𝐚𝐻𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 (𝐣𝐩𝐞𝐠/𝐩𝐧𝐠).`
      );
    }

    if (!/image\/(jpe?g|png)/.test(quoted.mime)) {
      return repondre(
        `𝐔𝐧𝐻𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝 𝐟𝐨𝐫𝐦𝐚𝐭: ${quoted.mime}. 𝐔𝐇𝐞 𝐣𝐩𝐞𝐠 𝐨𝐫 𝐩𝐧𝐠 𝐨𝐧𝐥𝐲!`
      );
    }

    try {
      repondre(`𝐄𝐧𝐡𝐚𝐧𝐜𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞 𝐭𝐨 𝐇𝐃...`);

      // Download the quoted image
      const img = await zk.downloadMediaMessage(quoted);

      // Prepare form data
      const body = new FormData();
      body.append("image", img, "image");

      // Send to API
      const res = await fetch(
        "http://max-image-resolution-enhancer.codait-prod-41208c73af8fca213512856c7a09db52-0000.us-east.containers.appdomain.cloud/model/predict",
        {
          method: "POST",
          body,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
      }

      // Get the enhanced image buffer
      const hdImage = await res.buffer();

      // Send the enhanced image
      await zk.sendMessage(
        dest,
        {
          image: hdImage,
          caption: `𝐇𝐞𝐫𝐞'𝐻 𝐲𝐨𝐮𝐫 𝐇𝐃 𝐢𝐮𝐚𝐠𝐞!\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
          mimetype: "image/jpeg",
        },
        { quoted: ms }
      );
    } catch (error) {
      console.error("Error enhancing image:", error);
      repondre(
        `𝐄𝐫𝐫𝐨𝐫 𝐞𝐧𝐡𝐚𝐧𝐜𝐢𝐧𝐠 𝐢𝐮𝐚𝐠𝐞 𝐭𝐨 𝐇𝐃: ${error.message}`
      );
    }
  }
);

module.exports = { zokou };