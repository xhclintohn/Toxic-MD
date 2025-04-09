const { zokou } = require('../framework/zokou');
const s = require("../set");

zokou(
  {
    nomCom: 'clint',
    categorie: 'General',
    reaction: '🤝'
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, superUser, auteurMessage, idBot, prefix } = commandeOptions;

    // Identify the user and the bot's connected JID
    const userJid = auteurMessage; // The user sending the command
    const botJid = idBot; // The JID of the WhatsApp account hosting the bot
    const ownerNumber = s.OWNER_NUMBER || 'default_owner_number'; // Fallback if not set
    const isOwner = userJid === ownerNumber + '@s.whatsapp.net';
    const isConnectedUser = userJid === botJid; // Check if the user is the one hosting the bot

    // Restrict to the connected user (bot host) or owner
    if (!isConnectedUser && !isOwner && !superUser) {
      return repondre("𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 𝐛𝐨𝐭 𝐮𝐬𝐞𝐫 𝐨𝐫 𝐭𝐡𝐞 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝!");
    }

    try {
      // Group and Channel links
      const groupLink = 'https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI';
      const channelLink = 'https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19';

      // Prepare the button message with links
      const captionText = `𝐇𝐞𝐫𝐞 𝐚𝐫𝐞 𝐭𝐡𝐞 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐥𝐢𝐧𝐤𝐬:\n\n𝐆𝐫𝐨𝐮𝐩: ${groupLink}\n𝐂𝐡𝐚𝐧𝐧𝐞𝐥: ${channelLink}`;
      const buttons = [
        {
          buttonId: `${prefix}owner`,
          buttonText: { displayText: "🕯️✨ᴏᴡɴᴇʀ✨🕯️" },
          type: 1,
        },
      ];
      const buttonMessage = {
        text: captionText,
        buttons: buttons,
        headerType: 1, // Simple text header
      };

      // Send the text message with button
      await zk.sendMessage(dest, buttonMessage, { quoted: ms });

    } catch (error) {
      console.error("Error in clint command:", error);
      repondre(`𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧�(g 𝐰𝐞𝐧𝐭 �(w𝐫𝐨𝐧�(g: ${error.message}`);
    }
  }
);