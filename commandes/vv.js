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
      // Validate input
      if (!msgRepondu) {
        return repondre("❌ Please mention a view-once media message.");
      }

      // Check if it's a view once message
      if (!msgRepondu.viewOnceMessageV2) {
        return repondre("❌ This message is not a view-once message.");
      }

      const viewOnceContent = msgRepondu.viewOnceMessageV2.message;

      // Handle image message
      if (viewOnceContent.imageMessage) {
        const imageMessage = viewOnceContent.imageMessage;
        try {
          const imagePath = await zk.downloadAndSaveMediaMessage(imageMessage);
          await zk.sendMessage(
            dest,
            {
              image: { url: imagePath },
              caption: imageMessage.caption || "",
            },
            { quoted: ms }
          );
        } catch (downloadError) {
          console.error("Image download error:", downloadError);
          return repondre("❌ Failed to download the image. Please try again.");
        }

      // Handle video message
      } else if (viewOnceContent.videoMessage) {
        const videoMessage = viewOnceContent.videoMessage;
        try {
          const videoPath = await zk.downloadAndSaveMediaMessage(videoMessage);
          await zk.sendMessage(
            dest,
            {
              video: { url: videoPath },
              caption: videoMessage.caption || "",
            },
            { quoted: ms }
          );
        } catch (downloadError) {
          console.error("Video download error:", downloadError);
          return repondre("❌ Failed to download the video. Please try again.");
        }
      } else {
        return repondre("❌ Unsupported view-once media type.");
      }

    } catch (error) {
      console.error("Command error:", error);
      return repondre("❌ An error occurred while processing the view-once media.");
    }
  }
);