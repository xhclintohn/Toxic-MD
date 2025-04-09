const { zokou } = require("../framework/zokou");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
//                   𝐅𝐔𝐍 𝐌𝐎𝐃𝐔𝐋𝐄                     //
//               𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃                //
//             𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧                   //
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

// Gay Check Command
zokou(
  {
    nomCom: "gaycheck",
    categorie: "Fun",
    reaction: "😆",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, auteurMessage } = commandeOptions;
    try {
      // Check if a user is tagged
      const mentionedUser = auteurMessage; // In Zokou, this is the sender's JID
      if (!mentionedUser || mentionedUser === zk.user.id) {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}gaycheck @username\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐚 𝐮𝐬𝐞𝐫 𝐭𝐨 𝐜𝐡𝐞𝐜𝐤 𝐭𝐡𝐞 𝐠𝐚𝐲 𝐦𝐞𝐭𝐞𝐫!`
        );
        return;
      }

      repondre("🔄 𝐂𝐡𝐞𝐜𝐤𝐢𝐧𝐠 𝐭𝐡𝐞 𝐠𝐚𝐲 𝐦𝐞𝐭𝐞𝐫...");

      // Generate random percentage
      const shibam = Array.from({ length: 100 }, (_, i) => (i + 1).toString());
      const dey = shibam[Math.floor(Math.random() * shibam.length)];

      // Prepare response
      const gayText = `𝐆𝐚𝐲 𝐂𝐡𝐞𝐜𝐤 𝐎𝐟: @${mentionedUser.split("@")[0]}\n\n𝐑𝐞𝐬𝐮𝐥𝐭: *${dey}%* 🤣\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

      // Send message with image and mentions
      await zk.sendMessage(
        dest,
        {
          image: { url: "https://i.ibb.co/DP1Lv66z/0158a341e9b76674.jpg" }, // Replace with your botImage3 URL
          caption: gayText,
          mentions: [mentionedUser],
        },
        { quoted: ms }
      );
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

module.exports = { zokou };