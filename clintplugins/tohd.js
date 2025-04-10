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

    console.log("Command triggered: .tohd");

    // Check if an image is quoted
    if (!quoted) {
      console.log("No quoted message found");
      return repondre(
        `𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}𝐭𝐨𝐡𝐝 <𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐢𝐦𝐚𝐠𝐞>\n\n𝐏𝐥𝐞𝐚𝐻𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐭𝐨 𝐞𝐧𝐡𝐚𝐧𝐜𝐞 𝐭𝐨 𝐇𝐃!`
      );
    }

    console.log("Quoted message:", quoted);

    const mime = quoted.mtype || "";
    if (!/imageMessage/.test(mime)) {
      console.log("Not an image; mtype:", mime);
      return repondre(
        `𝐍𝐨 𝐢𝐦𝐚𝐠𝐞 𝐟𝐨𝐮𝐧𝐝! 𝐏𝐥𝐞𝐚𝐻𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 (𝐣𝐩𝐞𝐠/𝐩𝐧𝐠).`
      );
    }

    if (!/image\/(jpe?g|png)/.test(quoted.mime)) {
      console.log("Unsupported MIME type:", quoted.mime);
      return repondre(
        `𝐔𝐧𝐇𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝 𝐟𝐨𝐫𝐦𝐚𝐭: ${quoted.mime}. 𝐔𝐇𝐞 𝐣𝐩𝐞𝐠 𝐨𝐫 𝐩𝐧𝐠 𝐨𝐧𝐥𝐲!`
      );
    }

    try {
      repondre(`𝐄𝐧𝐡𝐚𝐧𝐜𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞 𝐭𝐨 𝐇𝐃...`);
      console.log("Attempting to download image...");

      // Download the quoted image
      const img = await zk.downloadMediaMessage(quoted);
      console.log("Image downloaded, size:", img.length);

      // Prepare form data
      const body = new FormData();
      body.append("image", img, "image.jpg"); // Explicit filename for clarity

      // Send to API
      console.log("Sending to API...");
      const res = await fetch(
        "http://max-image-resolution-enhancer.codait-prod-41208c73af8fca213512856c7a09db52-0000.us-east.containers.appdomain.cloud/model/predict",
        {
          method: "POST",
          body,
        }
      );

      console.log("API response status:", res.status);
      if (!res.ok) {
        const errorData = await res.text(); // Use text() for raw response
        throw new Error(`API Error: ${res.status} - ${errorData}`);
      }

      // Get the enhanced image buffer
      const hdImage = await res.buffer();
      console.log("Enhanced image received, size:", hdImage.length);

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