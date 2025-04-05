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
        return repondre("❌ Please mention a view-once media message.");
      }

      // Debug: Log the full message structure
      console.log("DEBUG - Full message structure:", JSON.stringify(msgRepondu, null, 2));

      // Check for all possible view-once message structures
      const viewOnceContent = 
        msgRepondu.viewOnceMessageV2?.message ||
        msgRepondu.viewOnceMessage?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.viewOnceMessageV2?.message ||
        msgRepondu.extendedTextMessage?.contextInfo?.viewOnceMessage?.message;

      if (!viewOnceContent) {
        console.log("DEBUG - No view-once content found in:", Object.keys(msgRepondu));
        return repondre("❌ Could not find view-once content in this message.");
      }

      // Determine media type
      let mediaType, mediaObj;
      if (viewOnceContent.imageMessage) {
        mediaType = 'image';
        mediaObj = viewOnceContent.imageMessage;
      } else if (viewOnceContent.videoMessage) {
        mediaType = 'video';
        mediaObj = viewOnceContent.videoMessage;
      } else {
        console.log("DEBUG - Unsupported view-once content:", Object.keys(viewOnceContent));
        return repondre("❌ This view-once message contains unsupported media.");
      }

      try {
        const mediaPath = await zk.downloadAndSaveMediaMessage(mediaObj);
        const caption = mediaObj.caption || "";

        await zk.sendMessage(
          dest,
          {
            [mediaType]: { url: mediaPath },
            caption: caption
          },
          { quoted: ms }
        );

      } catch (downloadError) {
        console.error("Media download error:", downloadError);
        return repondre("❌ Failed to process the media. Please try again.");
      }

    } catch (error) {
      console.error("Command error:", error);
      return repondre("❌ An unexpected error occurred.");
    }
  }
);