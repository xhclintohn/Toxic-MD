"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");
const axios = require("axios");
const FormData = require("form-data"); // Explicitly require form-data
const fs = require("fs");
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

// Utility function to determine file extension from mimetype
function getFileExtension(mimeType) {
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  return mimeMap[mimeType] || "jpg"; // Default to jpg if unknown
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

    // Check if the message is a reply
    if (!ms.quoted) {
      return repondre(
        "❌ 𝐄𝐫𝐫𝐨𝐫: Yo, reply to some media (image, video, or sticker) to generate a URL!"
      );
    }

    // Log the quoted message structure for debugging
    console.log("Quoted message:", JSON.stringify(ms.quoted, null, 2));

    // Aggressive media detection
    const quotedMsg = ms.quoted.message || {};
    const isMedia =
      quotedMsg.imageMessage ||
      quotedMsg.videoMessage ||
      quotedMsg.stickerMessage ||
      (quotedMsg.extendedTextMessage &&
        quotedMsg.extendedTextMessage.contextInfo &&
        quotedMsg.extendedTextMessage.contextInfo.quotedMessage &&
        (quotedMsg.extendedTextMessage.contextInfo.quotedMessage.imageMessage ||
          quotedMsg.extendedTextMessage.contextInfo.quotedMessage.videoMessage)) ||
      (ms.quoted.mimetype && ms.quoted.mimetype.startsWith("image/")) ||
      (ms.quoted.mimetype && ms.quoted.mimetype.startsWith("video/"));

    if (!isMedia) {
      return repondre(
        "❌ 𝐄𝐫𝐫𝐨𝐫: That's not media! Reply to an image, video, or sticker, not some random text or whatever!"
      );
    }

    // Create initial loading message
    let loadingMsg = await zk.sendMessage(
      dest,
      {
        text: "🔄 𝐈𝐧𝐢𝐭𝐢𝐚𝐥𝐢𝐳𝐢𝐧𝐠 𝐔𝐑𝐋 𝐠𝐞𝐧𝐞�{r𝐚𝐭𝐢𝐨𝐧... 0%",
      },
      { quoted: ms }
    );

    // Loading simulation
    const steps = [
      { percent: 25, text: "📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐦�{e𝐝𝐢𝐚..." },
      { percent: 50, text: "🔗 𝐔𝐩𝐥�{o𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐬𝐞𝐫𝐯𝐞𝐫..." },
      { percent: 75, text: "⚙️ 𝐆𝐞𝐧�{e𝐫𝐚𝐭𝐢𝐧𝐠 𝐔𝐑𝐋..." },
      { percent: 100, text: "✅ 𝐔𝐑𝐋 𝐫�{e𝐚𝐝𝐲!" },
    ];

    for (const step of steps) {
      await sleep(800);
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
      let mediaData;
      try {
        mediaData = await ms.quoted.download();
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        // Fallback: Try downloading from contextInfo if available
        if (
          quotedMsg.extendedTextMessage &&
          quotedMsg.extendedTextMessage.contextInfo &&
          quotedMsg.extendedTextMessage.contextInfo.quotedMessage
        ) {
          const contextMsg = quotedMsg.extendedTextMessage.contextInfo.quotedMessage;
          mediaData = await zk.downloadMediaMessage(contextMsg);
        } else {
          throw new Error("Failed to download media");
        }
      }

      if (!mediaData) {
        throw new Error("No media data received");
      }

      // Determine file extension
      const mimeType =
        ms.quoted.mimetype ||
        quotedMsg.imageMessage?.mimetype ||
        quotedMsg.videoMessage?.mimetype ||
        quotedMsg.stickerMessage?.mimetype ||
        "image/jpeg";
      const fileExtension = getFileExtension(mimeType);
      const filePath = `./temp_media_${Date.now()}.${fileExtension}`;

      // Save media to temporary file
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

✅ �{M𝐞𝐝𝐢𝐚 𝐮𝐩𝐥𝐨𝐚𝐝𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!
🔗 𝐔𝐑𝐋: ${url}

╭───── • ─────╮
   𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎
╰───── • ─────╯
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
      `;

      // Send final message
      await zk.sendMessage(dest, { text: resultMessage }, { quoted: ms });

      console.log("𝐭𝐨𝐮𝐫𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲");
    } catch (error) {
      console.error("𝐭𝐨𝐮𝐫𝐥 𝐞𝐫𝐫𝐨𝐫:", error);
      await zk.sendMessage(
        dest,
        {
          text: `❌ 𝐄𝐫𝐫𝐨𝐫: Couldn't generate URL! Something's wrong with the media. Details: ${error.message}`,
          edit: loadingMsg.key,
        },
        { quoted: ms }
      );
    }
  }
);

console.log("𝐭𝐨𝐮𝐫𝐥 𝐜𝐨𝐦𝐦�{a𝐧𝐝 𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫𝐞𝐝");