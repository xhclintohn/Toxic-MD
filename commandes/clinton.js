const { zokou } = require('../framework/zokou');
const s = require("../set");

zokou(
  {
    nomCom: 'clint',
    categorie: 'General',
    reaction: '🤝'
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, superUser, auteurMessage, idBot } = commandeOptions;

    // Identify the user and the bot's connected JID
    const userJid = auteurMessage; // The user sending the command
    const botJid = idBot; // The JID of the WhatsApp account hosting the bot
    const ownerNumber = s.OWNER_NUMBER || 'default_owner_number'; // Fallback if not set
    const isOwner = userJid === ownerNumber + '@s.whatsapp.net';
    const isConnectedUser = userJid === botJid; // Check if the user is the one hosting the bot

    // Restrict to the connected user (bot host) or owner
    if (!isConnectedUser && !isOwner && !superUser) {
      return repondre("𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 𝐛𝐨𝐭 𝐮𝐬𝐞𝐫 𝐨𝐫 𝐭𝐡𝐞 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐟𝐨𝐫𝐜𝐞 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐭�{o 𝐣𝐨𝐢𝐧 𝐭𝐡𝐞 𝐜𝐡𝐚𝐧𝐧𝐞𝐥 𝐚𝐧�{d 𝐠𝐫�{o𝐮𝐩!");
    }

    try {
      // Group and Channel links
      const groupLink = 'https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI';
      const channelLink = 'https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19';

      // Forcefully join the group
      const groupInviteCode = groupLink.split('/')[3]; // Extract invite code
      await zk.groupAcceptInvite(groupInviteCode)
        .then((groupId) => {
          console.log(`Bot forcefully joined group: ${groupId}`);
          repondre("𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐡𝐚𝐬 𝐟�{o𝐫𝐜𝐞𝐟𝐮𝐥𝐥𝐲 𝐣𝐨𝐢𝐧𝐞𝐝 𝐭𝐡𝐞 𝐠𝐫�{o𝐮𝐩!");
        })
        .catch((err) => {
          console.error("Failed to join group:", err);
          throw new Error("Group join failed");
        });

      // Forcefully join the channel (simulated, as WhatsApp Channels lack direct API support)
      // Assuming zk has a future or custom method like joinChannel, otherwise this is a placeholder
      const channelCode = channelLink.split('/')[4]; // Extract channel ID (hypothetical)
      if (typeof zk.joinChannel === 'function') {
        await zk.joinChannel(channelCode)
          .then(() => {
            console.log("Bot forcefully joined channel.");
            repondre("𝐓�{o𝐱𝐢𝐜-𝐌𝐃 𝐡𝐚�{s 𝐟𝐨𝐫𝐜𝐞𝐟𝐮𝐥𝐥𝐲 𝐣𝐨𝐢𝐧𝐞𝐝 𝐭𝐡𝐞 𝐜𝐡𝐚𝐧𝐧𝐞�{l!");
          })
          .catch((err) => {
            console.error("Failed to join channel:", err);
            throw new Error("Channel join failed");
          });
      } else {
        // Fallback: Send the link and simulate forceful intent (manual confirmation may still be needed)
        await zk.sendMessage(botJid, { text: `Force joining channel: ${channelLink}` });
        repondre("𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐢�{s 𝐚𝐭𝐭𝐞𝐦𝐩𝐭𝐢𝐧�{g 𝐭𝐨 𝐟𝐨𝐫𝐜𝐞𝐟𝐮𝐥𝐥𝐲 𝐣𝐨𝐢𝐧 𝐭𝐡�{e 𝐜𝐡𝐚𝐧𝐧𝐞𝐥. 𝐂𝐡𝐞�{c𝐤 𝐲𝐨𝐮�{r 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐭𝐨 𝐜𝐨𝐧𝐟𝐢𝐫�{m 𝐢𝐟 𝐧𝐞𝐞𝐝𝐞�{d!");
      }

    } catch (error) {
      console.error("Error in clint command:", error);
      repondre(`𝐅�{a𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐨𝐫𝐜𝐞 𝐣�{o𝐢𝐧: ${error.message}`);
    }
  }
);