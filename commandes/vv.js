const { zokou } = require("../framework/zokou");
const fs = require('fs');

zokou(
  {
    nomCom: "vv",
    categorie: "General",
    reaction: "🗿",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    try {
      if (!msgRepondu) {
        return repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐚 𝐯𝐢𝐞𝐰-𝐨𝐧𝐜𝐞 𝐦𝐞𝐝𝐢𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞.");
      }

      // Debug: Log the full message structure
      console.log("DEBUG - Full msgRepondu structure:", JSON.stringify(msgRepondu, null, 2));

      // Aggressive check for view-once content across all possible structures
      let viewOnceContent = 
        msgRepondu.viewOnceMessage?.message ||
        msgRepondu.viewOnceMessageV2?.message ||
        msgRepondu.viewOnceMessageV2Extension?.message ||
        msgRepondu.message?.viewOnceMessage?.message ||
        msgRepondu.message?.viewOnceMessageV2?.message ||
        msgRepondu.message?.viewOnceMessageV2Extension?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessage?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2Extension?.message ||
        msgRepondu.conversation?.viewOnceMessage?.message ||
        msgRepondu.messageContextInfo?.message?.viewOnceMessage?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.viewOnceMessage?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.viewOnceMessageV2?.message ||
        null;

      // Fallback: If no view-once content found, check if msgRepondu itself is the view-once message
      if (!viewOnceContent && msgRepondu.message) {
        console.log("DEBUG - Checking msgRepondu.message as fallback...");
        viewOnceContent = msgRepondu.message; // Sometimes the replied message is the view-once itself
      }

      if (!viewOnceContent) {
        console.log("DEBUG - Available keys in msgRepondu:", Object.keys(msgRepondu));
        if (msgRepondu.extendedTextMessage?.contextInfo?.quotedMessage) {
          console.log("DEBUG - Quoted message keys:", Object.keys(msgRepondu.extendedTextMessage.contextInfo.quotedMessage));
        }
        return repondre("𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐟𝐢𝐧𝐝 𝐯𝐢𝐞𝐰-𝐨𝐧𝐜𝐞 𝐜𝐨𝐧𝐭𝐞𝐧𝐭 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞. 𝐈𝐬 𝐢𝐭 𝐫𝐞𝐚𝐥𝐥𝐲 𝐚 𝐯𝐢𝐞𝐰-𝐨𝐧𝐜𝐞 𝐦𝐞𝐝𝐢𝐚?");
      }

      // Determine media type
      let mediaType, mediaObj;
      if (viewOnceContent.imageMessage || (viewOnceContent.image && viewOnceContent.viewOnce)) {
        mediaType = 'image';
        mediaObj = viewOnceContent.imageMessage || viewOnceContent;
      } else if (viewOnceContent.videoMessage || (viewOnceContent.video && viewOnceContent.viewOnce)) {
        mediaType = 'video';
        mediaObj = viewOnceContent.videoMessage || viewOnceContent;
      } else if (viewOnceContent.audioMessage || (viewOnceContent.audio && viewOnceContent.viewOnce)) {
        mediaType = 'audio';
        mediaObj = viewOnceContent.audioMessage || viewOnceContent;
      } else if (viewOnceContent.documentMessage || (viewOnceContent.document && viewOnceContent.viewOnce)) {
        mediaType = 'document';
        mediaObj = viewOnceContent.documentMessage || viewOnceContent;
      } else {
        console.log("DEBUG - Unsupported view-once content keys:", Object.keys(viewOnceContent));
        return repondre("𝐓𝐡𝐢𝐬 𝐯𝐢𝐞𝐰-𝐨𝐧𝐜𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐜𝐨𝐧𝐭𝐚𝐢𝐧𝐬 𝐮𝐧𝐬𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝 𝐦𝐞𝐝𝐢𝐚.");
      }

      try {
        const mediaPath = await zk.downloadAndSaveMediaMessage(mediaObj);
        const caption = mediaObj.caption || "𝐑𝐞𝐭𝐫𝐢𝐞𝐯𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃";

        await zk.sendMessage(
          dest,
          {
            [mediaType]: { url: mediaPath },
            caption: caption,
            ...(mediaType === 'audio' ? { mimetype: 'audio/mpeg' } : {}),
            ...(mediaType === 'document' ? { mimetype: mediaObj.mimetype } : {}),
          },
          { quoted: ms }
        );

        // Cleanup the downloaded file
        fs.unlink(mediaPath, (err) => {
          if (err) console.error('Cleanup failed:', err);
        });

      } catch (downloadError) {
        console.error("Media download error:", downloadError);
        return repondre("𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐩𝐫𝐨𝐜𝐞𝐬𝐬 𝐭𝐡𝐞 𝐦𝐞𝐝𝐢𝐚. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.");
      }

    } catch (error) {
      console.error("Command error:", error);
      return repondre("𝐀𝐧 𝐮𝐧𝐞𝐱𝐩𝐞𝐜𝐭𝐞𝐝 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝: " + error);
    }
  }
);