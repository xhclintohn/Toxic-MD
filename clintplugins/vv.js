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
        return repondre("𝗛𝗲𝘆, 𝘆𝗼𝘂 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮 𝘃𝗶𝗲𝘄-𝗼𝗻𝗰𝗲 𝗺𝗲𝗱𝗶𝗮 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗳𝗶𝗿𝘀𝘁! 😅");
      }

      // Debug: Log the full message structure for troubleshooting
      console.log("DEBUG - Full msgRepondu structure:", JSON.stringify(msgRepondu, null, 2));

      // Generic function to recursively search for viewOnce media in the message object
      const findViewOnceMedia = (obj) => {
        if (!obj || typeof obj !== 'object') return null;

        // Check if the current object has a viewOnce flag and media content
        if (obj.viewOnce === true) {
          if (obj.image || obj.imageMessage) return { type: 'image', media: obj.image || obj.imageMessage };
          if (obj.video || obj.videoMessage) return { type: 'video', media: obj.video || obj.videoMessage };
          if (obj.audio || obj.audioMessage) return { type: 'audio', media: obj.audio || obj.audioMessage };
          if (obj.document || obj.documentMessage) return { type: 'document', media: obj.document || obj.documentMessage };
        }

        // Recursively search through all nested objects
        for (const key in obj) {
          const result = findViewOnceMedia(obj[key]);
          if (result) return result;
        }
        return null;
      };

      // Search for view-once media in the replied message
      const mediaInfo = findViewOnceMedia(msgRepondu);

      if (!mediaInfo) {
        console.log("DEBUG - Available keys in msgRepondu:", Object.keys(msgRepondu));
        if (msgRepondu.extendedTextMessage?.contextInfo?.quotedMessage) {
          console.log("DEBUG - Quoted message keys:", Object.keys(msgRepondu.extendedTextMessage.contextInfo.quotedMessage));
        }
        return repondre("𝗜 𝗰𝗼𝘂𝗹𝗱𝗻’𝘁 𝗳𝗶𝗻𝗱 𝗮𝗻𝘆 𝘃𝗶𝗲𝘄-𝗼𝗻𝗰𝗲 𝗺𝗲𝗱𝗶𝗮 𝗶𝗻 𝘁𝗵𝗮𝘁 𝗺𝗲𝘀𝘀𝗮𝗴𝗲. 𝗔𝗿𝗲 𝘆𝗼𝘂 𝘀𝘂𝗿𝗲 𝗶𝘁’𝘀 𝘃𝗶𝗲𝘄-𝗼𝗻𝗰𝗲? 🤔");
      }

      const { type: mediaType, media: mediaObj } = mediaInfo;

      try {
        // Download the media
        const mediaPath = await zk.downloadAndSaveMediaMessage(mediaObj);
        const caption = mediaObj.caption || "𝐑𝐞𝐭𝐫𝐢𝐞𝐯𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 | 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧";

        // Send the media back without view-once restriction
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

        // Clean up the downloaded file
        fs.unlink(mediaPath, (err) => {
          if (err) console.error('Cleanup failed:', err);
        });

      } catch (downloadError) {
        console.error("Media download error:", downloadError);
        return repondre("𝗦𝗼𝗿𝗿𝘆, 𝗜 𝗰𝗼𝘂𝗹𝗱𝗻’𝘁 𝗽𝗿𝗼𝗰𝗲𝘀𝘀 𝘁𝗵𝗮𝘁 𝗺𝗲𝗱𝗶𝗮. 𝗖𝗮𝗻 𝘆𝗼𝘂 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻? 😓");
      }

    } catch (error) {
      console.error("Command error:", error);
      return repondre("𝗢𝗼𝗽𝘀, 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝘄𝗲𝗻𝘁 𝘄𝗿𝗼𝗻𝗴: " + error.message);
    }
  }
);