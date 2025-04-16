"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");
const axios = require("axios"); // For uploading media to Telegraph
const fs = require("fs"); // For handling temporary files
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to upload media to Telegraph
async function uploadToTelegraph(filePath) {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    const response = await axios.post("https://telegra.ph/upload", formData, {
      headers: formData.getHeaders(),
    });
    if (response.data && response.data[0].src) {
      return `https://telegra.ph${response.data[0].src}`;
    }
    throw new Error("Upload failed");
  } catch (error) {
    throw new Error(`Telegraph upload error: ${error.message}`);
  }
}

zokou(
  {
    nomCom: "tourl",
    reaction: "🔗",
    nomFichier: __filename,
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;

    console.log("𝐭𝐨𝐮𝐫𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐜𝐞𝐢𝐯𝐞𝐝!");

    // Check if the message is a reply to an image or video
    if (!ms.quoted || (!ms.quoted.message.imageMessage && !ms.quoted.message.videoMessage)) {
      return repondre(
        "❌ 𝐄𝐫𝐫𝐨𝐫: Please reply to an image or video to generate a URL."
      );
    }

    // Create initial loading message
    let loadingMsg = await zk.sendMessage(
      dest,
      {
        text: "🔄 𝐈𝐧𝐢𝐭𝐢𝐚𝐥𝐢𝐳𝐢𝐧𝐠 𝐔𝐑𝐋 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐨𝐧... 0%",
      },
      { quoted: ms }
    );

    // Loading simulation
    const steps = [
      { percent: 25, text: "📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐦𝐞𝐝𝐢𝐚..." },
      { percent: 50, text: "🔗 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐬𝐞𝐫𝐯𝐞𝐫..." },
      { percent: 75, text: "⚙️ 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧�(g 𝐔𝐑𝐋..." },
      { percent: 100, text: "✅ 𝐔𝐑𝐋 𝐫𝐞𝐚𝐝𝐲!" },
    ];

    for (const step of steps) {
      await sleep(800); // Realistic delay
      await zk.sendMessage(
        dest,
        {
          text: `${step.text} ${step.percent}%\n[${"█".repeat(step.percent / 5)}${"░".repeat(
            20 - step.percent / 5
          )}]`,
          edit: loadingMsg.key,
        },
        { quoted: ms }
      );
    }

    try {
      // Download the replied media
      const mediaData = await ms.quoted.download(); // Assumes zokou provides a download method
      const filePath = `./temp_media_${Date.now()}.${ms.quoted.message.imageMessage ? "jpg" : "mp4"}`;
      fs.writeFileSync(filePath, mediaData);

      // Upload to Telegraph
      const url = await uploadToTelegraph(filePath);

      // Clean up temporary file
      fs.unlinkSync(filePath);

      // Format final output
      const resultMessage = `
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐔𝐑𝐋 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐎𝐑
╰───── • ─────╯

✅ 𝐌𝐞𝐝𝐢𝐚 𝐮𝐩𝐥𝐨𝐚𝐝𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!
🔗 𝐔𝐑𝐋: ${url}

╭───── • ─────╮
   𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎
╰───── • ─────╯
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
      `;

      // Send final message
      await zk.sendMessage(
        dest,
        { text: resultMessage },
        { quoted: ms }
      );

      console.log("𝐭𝐨𝐮𝐫𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐜𝐨𝐦𝐩𝐥𝐞𝐭�(e𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲");
    } catch (error) {
      console.error("𝐭𝐨𝐮𝐫𝐥 𝐞𝐫𝐫𝐨𝐫:", error);
      await zk.sendMessage(
        dest,
        {
          text: `❌ 𝐄𝐫𝐫𝐨𝐫: Failed to generate URL. ${error.message}`,
          edit: loadingMsg.key,
        },
        { quoted: ms }
      );
    }
  }
);

console.log("𝐭𝐨𝐮𝐫�(l 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫𝐞𝐝");