const { zokou } = require("../framework/zokou");

// 𝐔𝐭𝐢𝐥𝐢𝐭𝐢𝐞𝐳 𝐌𝐨𝐝𝐮𝐥𝐞
// 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

zokou(
  {
    nomCom: "clear",
    categorie: "Utilities",
    reaction: "🧹",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;

    try {
      repondre(`𝐂𝐥𝐞𝐚𝐫𝐢𝐧𝐠 𝐛𝐨𝐭 𝐦𝐞𝐳𝐳𝐚𝐠𝐞𝐳 𝐢𝐧 𝐭𝐡𝐢𝐳 𝐜𝐡𝐚𝐭...`);

      // Fetch recent messages (assuming Zokou supports this; adjust limit as needed)
      const messages = await zk.fetchMessages(dest, { limit: 50 }); // Hypothetical method
      if (!messages || messages.length === 0) {
        return repondre(`𝐍𝐨 𝐛𝐨𝐭 𝐦𝐞𝐳𝐳𝐚𝐠𝐞𝐳 𝐟𝐨𝐮𝐧𝐝 𝐭𝐨 𝐜𝐥𝐞𝐚𝐫!`);
      }

      // Filter for bot messages and delete them
      const botId = zk.user.id; // Bot's JID
      let deletedCount = 0;

      for (const msg of messages) {
        if (msg.key.fromMe || msg.key.remoteJid === botId) { // Check if sent by bot
          await zk.sendMessage(dest, { delete: msg.key });
          deletedCount++;
          // Small delay to avoid rate limits (optional)
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      repondre(
        `𝐒𝐮𝐜𝐜𝐞𝐻𝐇𝐟𝐮𝐥𝐥𝐲 𝐜𝐥𝐞𝐚𝐫𝐞𝐝 ${deletedCount} 𝐛𝐨𝐭 𝐦𝐞𝐻𝐇𝐚𝐠𝐞${deletedCount === 1 ? "" : "𝐳"}!\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      );
    } catch (error) {
      console.error("Error clearing messages:", error);
      repondre(
        `𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐜𝐥𝐞𝐚𝐫𝐢𝐧𝐠 𝐦𝐞𝐻𝐇𝐚𝐠𝐞𝐻𝐡: ${error.message}`
      );
    }
  }
);

module.exports = { zokou };