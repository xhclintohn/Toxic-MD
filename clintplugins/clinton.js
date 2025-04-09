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
      return repondre("𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 𝐛𝐨𝐭 𝐮𝐬�{e𝐫 𝐨𝐫 𝐭𝐡𝐞 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐟𝐨𝐫�{c𝐞 𝐭𝐡�{e 𝐛𝐨𝐭 𝐭𝐨 𝐣𝐨𝐢𝐧 𝐭𝐡�{e 𝐜𝐡𝐚𝐧𝐧𝐞�{l 𝐚𝐧𝐝 𝐠𝐫𝐨𝐮𝐩!");
    }

    try {
      // Group and Channel links
      const groupLink = 'https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI';
      const channelLink = 'https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19';
      const botVideo = { url: './media/toxic-md-video.mp4' }; // Replace with your video path

      // Forcefully join the group
      const groupInviteCode = groupLink.split('/')[3]; // Extract invite code
      await zk.groupAcceptInvite(groupInviteCode)
        .then((groupId) => {
          console.log(`Bot forcefully joined group: ${groupId}`);
        })
        .catch((err) => {
          console.error("Failed to join group:", err);
          throw new Error("Group join failed");
        });

      // Forcefully join the channel (simulated, as WhatsApp Channels lack direct API support)
      const channelCode = channelLink.split('/')[4]; // Extract channel ID (hypothetical)
      let channelStatus = "";
      if (typeof zk.joinChannel === 'function') {
        await zk.joinChannel(channelCode)
          .then(() => {
            console.log("Bot forcefully joined channel.");
            channelStatus = "𝐚𝐧𝐝 𝐭𝐡𝐞 𝐜𝐡𝐚𝐧𝐧𝐞𝐥 ";
          })
          .catch((err) => {
            console.error("Failed to join channel:", err);
            throw new Error("Channel join failed");
          });
      } else {
        // Fallback: Send the link to simulate forceful intent
        await zk.sendMessage(botJid, { text: `Force joining channel: ${channelLink}` });
        channelStatus = "𝐚𝐧𝐝 𝐚𝐭�{t𝐞𝐦𝐩𝐭𝐞𝐝 𝐭𝐡�{e 𝐜𝐡�{a𝐧𝐧𝐞�{l (𝐜𝐡𝐞�{c𝐤 𝐭𝐨 𝐜�{o𝐧𝐟𝐢�{r�{m)";
      }

      // Prepare the button message
      const captionText = `𝐓𝐨𝐱𝐢�{c-𝐌𝐃 𝐡𝐚�{s 𝐟𝐨�{r𝐜𝐞𝐟𝐮�{l𝐥𝐲 𝐣𝐨�{i𝐧𝐞�{d 𝐭𝐡�{e 𝐠𝐫�{o𝐮�{p ${channelStatus}!`;
      const buttons = [
        {
          buttonId: `${prefix}owner`,
          buttonText: { displayText: "🕯️✨ᴏᴡɴᴇʀ✨🕯️" },
          type: 1,
        },
      ];
      const buttonMessage = {
        video: botVideo,
        gifPlayback: true,
        caption: captionText,
        buttons: buttons,
        headerType: 4,
      };

      // Send the button message
      await zk.sendMessage(dest, buttonMessage, { quoted: ms });

    } catch (error) {
      console.error("Error in clint command:", error);
      repondre(`𝐅𝐚𝐢�{l𝐞�{d 𝐭𝐨 𝐟�{o𝐫𝐜�{e 𝐣�{o𝐢�{n: ${error.message}`);
    }
  }
);