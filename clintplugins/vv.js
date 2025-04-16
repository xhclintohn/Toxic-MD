const { zokou } = require("../framework/zokou");
const fs = require('fs');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

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
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Hey, you need to reply to a view-once media message first! 😅\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Get bot's own number
      const botNumber = zk.user.id.split(':')[0] + '@s.whatsapp.net';

      // Extract the view-once message
      let msg = msgRepondu.message;
      if (msgRepondu.message?.viewOnceMessageV2) {
        msg = msgRepondu.message.viewOnceMessageV2.message;
      } else if (msgRepondu.message?.viewOnceMessage) {
        msg = msgRepondu.message.viewOnceMessage.message;
      }

      if (!msg) {
        console.log("DEBUG - Available keys in msgRepondu:", Object.keys(msgRepondu));
        if (msgRepondu.message) {
          console.log("DEBUG - Keys in msgRepondu.message:", Object.keys(msgRepondu.message));
        }
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ I couldn’t find any view-once media in that message. Are you sure it’s view-once? 🤔\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const messageType = Object.keys(msg)[0];
      if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(messageType)) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ That’s not a supported view-once media type (image, video, or audio)! 😕\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Download the media
      const buffer = await downloadMediaMessage(msgRepondu, 'buffer');
      if (!buffer) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Failed to download the media. Try again! 😓\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Prepare media details
      const caption = msg[messageType].caption || `𝐑𝐞𝐭𝐫𝐢𝐞𝐯𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 | 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
      const mediaOptions = {
        caption,
        ...(messageType === 'audioMessage' ? { mimetype: msg.audioMessage.mimetype || 'audio/ogg', ptt: true } : {}),
        ...(messageType === 'videoMessage' ? { mimetype: 'video/mp4' } : {}),
      };

      // Send media to bot's own number
      await zk.sendMessage(
        botNumber,
        {
          [messageType.replace('Message', '').toLowerCase()]: buffer,
          ...mediaOptions,
        },
        { quoted: ms }
      );

      // Notify the group
      await repondre(`𝐓𝐎𝐗𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ View-once media retrieved and sent to my inbox! 🗿\n◈━━━━━━━━━━━━━━━━◈`);

    } catch (error) {
      console.error("Command error:", error);
      return repondre(`𝐓𝐎𝐗𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Oops, something went wrong: ${error.message}\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);