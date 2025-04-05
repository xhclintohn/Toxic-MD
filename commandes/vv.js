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

      // Check for both V1 and V2 view once message structures
      const viewOnceMessage = msgRepondu.viewOnceMessageV2 || msgRepondu.viewOnceMessage;
      
      if (!viewOnceMessage) {
        return repondre("❌ This message is not a view-once message or the structure is not recognized.");
      }

      const mediaMessage = viewOnceMessage.message;
      const mediaType = Object.keys(mediaMessage)[0]; // imageMessage or videoMessage

      if (!mediaType || !['imageMessage', 'videoMessage'].includes(mediaType)) {
        return repondre("❌ Unsupported view-once media type.");
      }

      try {
        const mediaPath = await zk.downloadAndSaveMediaMessage(mediaMessage[mediaType]);
        const caption = mediaMessage[mediaType].caption || "";

        await zk.sendMessage(
          dest,
          {
            [mediaType.includes('image') ? 'image' : 'video']: { url: mediaPath },
            caption: caption
          },
          { quoted: ms }
        );

      } catch (downloadError) {
        console.error("Media download error:", downloadError);
        return repondre("❌ Failed to download the media. Please try again.");
      }

    } catch (error) {
      console.error("Command error:", error);
      return repondre("❌ An error occurred while processing the view-once media.");
    }
  }
);