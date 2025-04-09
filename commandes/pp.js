const { zokou } = require('../framework/zokou');
const s = require("../set");
const fs = require('fs');

zokou(
  {
    nomCom: 'pp',
    categorie: 'General',
    reaction: '📸'
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu, superUser, auteurMessage, idBot } = commandeOptions;

    // Identify the user and the bot's connected JID
    const userJid = auteurMessage; // The user sending the command
    const botJid = idBot; // The JID of the WhatsApp account hosting the bot
    const ownerNumber = s.OWNER_NUMBER || 'default_owner_number'; // Fallback if not set
    const isOwner = userJid === ownerNumber + '@s.whatsapp.net';
    const isConnectedUser = userJid === botJid; // Check if the user is the one hosting the bot

    // Restrict to the connected user (bot host) or owner
    if (!isConnectedUser && !isOwner && !superUser) {
      return repondre("𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 𝐛𝐨𝐭 𝐮𝐬𝐞𝐫 𝐨𝐫 𝐭𝐡𝐞 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐜𝐡𝐚𝐧�{g𝐞 𝐭𝐡𝐞𝐢𝐫 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐩𝐢𝐜𝐭𝐮𝐫𝐞 𝐰𝐢𝐭𝐡 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝!");
    }

    // Check if the command replies to an image
    if (!msgRepondu || !msgRepondu.message?.imageMessage) {
      return repondre("𝐑𝐞𝐩𝐥𝐲 𝐭�{o 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐰𝐢𝐭𝐡 .𝐩𝐩 𝐭𝐨 𝐬𝐞𝐭 𝐢𝐭 𝐚𝐬 𝐲𝐨𝐮𝐫 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐩𝐢𝐜𝐭𝐮𝐫𝐞!");
    }

    try {
      // Download the replied image
      const mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.message.imageMessage);

      // Update the connected user's profile picture (same as botJid if they're hosting)
      await zk.updateProfilePicture(userJid, { url: mediaPath });

      // Clean up the downloaded file
      fs.unlink(mediaPath, (err) => {
        if (err) console.error("Cleanup failed:", err);
      });

      repondre("𝐘𝐨𝐮𝐫 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐩𝐢𝐜𝐭𝐮𝐫𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐮𝐩𝐝𝐚𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      repondre(`𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐮𝐩𝐝𝐚𝐭𝐞 𝐲𝐨𝐮𝐫 𝐩𝐫𝐨𝐟𝐢𝐥�{e 𝐩𝐢𝐜𝐭𝐮𝐫𝐞: ${error.message}`);
    }
  }
);