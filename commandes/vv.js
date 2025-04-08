const { zokou } = require("../framework/zokou");

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
      console.log("DEBUG - Full message structure:", JSON.stringify(msgRepondu, null, 2));

      // Robust check for view-once content across all possible structures
      const viewOnceContent = 
        msgRepondu.viewOnceMessage?.message ||
        msgRepondu.viewOnceMessageV2?.message ||
        msgRepondu.viewOnceMessageV2Extension?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessage?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2Extension?.message ||
        msgRepondu.message?.viewOnceMessage?.message ||
        msgRepondu.message?.viewOnceMessageV2?.message;

      if (!viewOnceContent) {
        console.log("DEBUG - No view-once content found in:", Object.keys(msgRepondu));
        return repondre("𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐟𝐢𝐧𝐝 𝐯𝐢𝐞𝐰-𝐨𝐧𝐜𝐞 𝐜𝐨𝐧𝐭𝐞𝐧𝐭 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞.");
      }

      // Determine media type
      let mediaType, mediaObj;
      if (viewOnceContent.imageMessage) {
        mediaType = 'image';
        mediaObj = viewOnceContent.imageMessage;
      } else if (viewOnceContent.videoMessage) {
        mediaType = 'video';
        mediaObj = viewOnceContent.videoMessage;
      } else if (viewOnceContent.audioMessage) {
        mediaType = 'audio';
        mediaObj = viewOnceContent.audioMessage;
      } else if (viewOnceContent.documentMessage) {
        mediaType = 'document';
        mediaObj = viewOnceContent.documentMessage;
      } else {
        console.log("DEBUG - Unsupported view-once content:", Object.keys(viewOnceContent));
        return repondre("𝐓𝐡𝐢𝐬 𝐯𝐢𝐞𝐰-𝐨𝐧𝐜𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐜�{o𝐧𝐭𝐚𝐢𝐧𝐬 𝐮𝐧𝐬𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝 𝐦𝐞𝐝𝐢𝐚.");
      }

      try {
        const mediaPath = await zk.downloadAndSaveMediaMessage(mediaObj);
        const caption = mediaObj.caption || "𝐑𝐞𝐭𝐫𝐢𝐞𝐯𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃";

        await zk.sendMessage(
          dest,
          {
            [mediaType]: { url: mediaPath },
            caption: caption,
            ...(mediaType === 'audio' ? { mimetype: 'audio/mpeg' } : {}), // Add mimetype for audio
            ...(mediaType === 'document' ? { mimetype: mediaObj.mimetype } : {}), // Add mimetype for documents
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
      return repondre("𝐀𝐧 𝐮𝐧𝐞𝐱𝐩𝐞𝐜𝐭𝐞𝐝 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝.");
    }
  }
);