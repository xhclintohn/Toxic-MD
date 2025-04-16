"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");
const axios = require("axios");
const FormData = require("form-data");
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
    "video/mpeg": "mpeg",
    "application/octet-stream": "webp", // For stickers
  };
  return mimeMap[mimeType] || "jpg"; // Default to jpg if unknown
}

// Utility function to check if a message contains media
function isMediaMessage(msg) {
  if (!msg) return false;

  // Check for direct media types
  const hasDirectMedia =
    msg.imageMessage ||
    msg.videoMessage ||
    msg.stickerMessage ||
    msg.documentMessage ||
    (msg.mimetype &&
      (msg.mimetype.startsWith("image/") ||
        msg.mimetype.startsWith("video/") ||
        msg.mimetype.includes("webp")));

  // Check nested contextInfo for quoted messages
  const hasNestedMedia =
    msg.extendedTextMessage?.contextInfo?.quotedMessage &&
    (msg.extendedTextMessage.contextInfo.quotedMessage.imageMessage ||
      msg.extendedTextMessage.contextInfo.quotedMessage.videoMessage ||
      msg.extendedTextMessage.contextInfo.quotedMessage.stickerMessage ||
      msg.extendedTextMessage.contextInfo.quotedMessage.documentMessage);

  // Check raw message properties for any media hint
  const hasRawMedia = Object.values(msg).some(
    (val) =>
      val?.mimetype &&
      (val.mimetype.startsWith("image/") ||
        val.mimetype.startsWith("video/") ||
        val.mimetype.includes("webp"))
  );

  return hasDirectMedia || hasNestedMedia || hasRawMedia;
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
        "❌ 𝐄𝐑𝐑𝐎𝐑: Oi, mate! Reply to an actual image, video, sticker, or some bloody media, not thin air!"
      );
    }

    // Log full message structures for debugging
    console.log("Full message (ms):", JSON.stringify(ms, null, 2));
    console.log("Quoted message (ms.quoted):", JSON.stringify(ms.quoted, null, 2));

    // Ultra-aggressive media detection
    const quotedMsg = ms.quoted.message || ms.quoted || {};
    const isMedia = isMediaMessage(quotedMsg) || isMediaMessage(ms.quoted);

    if (!isMedia) {
      return repondre(
        "❌ 𝐄𝐑𝐑𝐎𝐑: That's NOT media! Reply to an image, video, sticker, or something downloadable, not some random nonsense! Check the console logs for details."
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
      { percent: 25, text: "📥 𝐃𝐨𝐰𝐧𝐥�{o𝐚𝐝𝐢𝐧𝐠 𝐦𝐞𝐝𝐢𝐚..." },
      { percent: 50, text: "🔗 𝐔𝐩𝐥�{o𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐬𝐞𝐫𝐯𝐞𝐫..." },
      { percent: 75, text: "⚙️ 𝐆𝐞𝐧�{e𝐫𝐚𝐭𝐢𝐧𝐠 𝐔𝐑𝐋..." },
      { percent: 100, text: "✅ 𝐔𝐑�{L 𝐫𝐞𝐚𝐝𝐲!" },
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
      // Aggressive media download
      let mediaData;
      let mimeType;
      try {
        // Try primary download method
        mediaData = await ms.quoted.download();
        mimeType =
          ms.quoted.mimetype ||
          quotedMsg.imageMessage?.mimetype ||
          quotedMsg.videoMessage?.mimetype ||
          quotedMsg.stickerMessage?.mimetype ||
          quotedMsg.documentMessage?.mimetype ||
          "image/jpeg";
      } catch (downloadError) {
        console.error("Primary download error:", downloadError);
        // Fallback 1: Try downloadMediaMessage
        try {
          mediaData = await zk.downloadMediaMessage(ms.quoted);
          mimeType = ms.quoted.mimetype || "image/jpeg";
        } catch (fallbackError1) {
          console.error("Fallback 1 error:", fallbackError1);
          // Fallback 2: Try nested contextInfo
          if (
            quotedMsg.extendedTextMessage?.contextInfo?.quotedMessage
          ) {
            const nestedMsg = quotedMsg.extendedTextMessage.contextInfo.quotedMessage;
            mediaData = await zk.downloadMediaMessage(nestedMsg);
            mimeType =
              nestedMsg.imageMessage?.mimetype ||
              nestedMsg.videoMessage?.mimetype ||
              nestedMsg.stickerMessage?.mimetype ||
              nestedMsg.documentMessage?.mimetype ||
              "image/jpeg";
          } else {
            throw new Error("All download attempts failed");
          }
        }
      }

      if (!mediaData) {
        throw new Error("No media data received after all attempts");
      }

      // Determine file extension
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

✅ 𝐌𝐞𝐝𝐢𝐚 𝐮𝐩𝐥𝐨𝐚𝐝𝐞�{d 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!
🔗 𝐔𝐑𝐋: ${url}

╭───── • ─────╮
   𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎
╰───── • ─────╯
👑 𝐎𝐰𝐧𝐞�{r: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
      `;

      // Send final message
      await zk.sendMessage(dest, { text: resultMessage }, { quoted: ms });

      console.log("𝐭𝐨𝐮𝐫𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐜�{o𝐦𝐩𝐥𝐞𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲");
    } catch (error) {
      console.error("𝐭�{o𝐮𝐫𝐥 𝐞𝐫𝐫𝐨𝐫:", error);
      await zk.sendMessage(
        dest,
        {
          text: `❌ 𝐄𝐑𝐑𝐎𝐑: Failed to generate URL! The media's playing hard to get. Details: ${error.message}`,
          edit: loadingMsg.key,
        },
        { quoted: ms }
      );
    }
  }
);

console.log("𝐭𝐨𝐮𝐫𝐥 𝐜�{o𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫𝐞𝐝");