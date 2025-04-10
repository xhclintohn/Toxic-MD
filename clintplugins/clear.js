const { zokou } = require("../framework/zokou");

// 𝐔𝐭𝐢𝐥𝐢𝐭𝐢𝐞𝐻 𝐌𝐨𝐝𝐮𝐥𝐞
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
      // Send initial message
      const message = await zk.sendMessage(
        dest,
        { text: "𝐂𝐥𝐞𝐚𝐫𝐢𝐧𝐠 𝐛𝐨𝐭 𝐦𝐞𝐻𝐇𝐚𝐠𝐞𝐻..." },
        { quoted: ms }
      );
      const messageKey = message.key; // Get the key of the sent message

      // Delete the bot's message
      await zk.sendMessage(dest, { delete: messageKey });

    } catch (error) {
      console.error("Error clearing messages:", error);
      repondre(
        `𝐀𝐧 𝐞𝐫𝐫�{o𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐜𝐥𝐞𝐚𝐫𝐢𝐧�{g 𝐦𝐞𝐻𝐇𝐚𝐠𝐞𝐻: ${error.message}`
      );
    }
  }
);

module.exports = { zokou };