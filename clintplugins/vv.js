const { zokou } = require("../framework/zokou");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

zokou(
  {
    nomCom: "vv",
    categorie: "General",
    reaction: "🗿",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre, nomAuteurMessage } = commandeOptions;

    try {
      if (!msgRepondu) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, reply to a media message (image, video, or audio) first! 😡 Don’t waste 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇’s time! 🤔\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Extract the message content
      let msg = msgRepondu.message;

      // Handle view-once message structures
      if (msg?.viewOnceMessage) {
        msg = msg.viewOnceMessage.message;
      } else if (msg?.viewOnceMessageV2) {
        msg = msg.viewOnceMessageV2.message;
      } else if (msg?.viewOnceMessageV2Extension) {
        msg = msg.viewOnceMessageV2Extension.message;
      }

      if (!msg) {
        console.log("DEBUG - Available keys in msgRepondu:", Object.keys(msgRepondu));
        console.log("DEBUG - Available keys in msgRepondu.message:", Object.keys(msgRepondu.message || {}));
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, that message has no media! 😕 Reply to an image, video, or audio! 🤦‍♂️\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Determine the message type
      const messageType = Object.keys(msg)[0];
      if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(messageType)) {
        console.log("DEBUG - Message type:", messageType);
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, that’s not a supported media type (image, video, or audio)! 😣 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇 can’t work with that! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Notify the user that media is being processed
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇’s cracking open that media! 📦 Hold tight! 🔍\n◈━━━━━━━━━━━━━━━━◈`);

      // Download the media
      const buffer = await downloadMediaMessage(msgRepondu, 'buffer', {});
      if (!buffer) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇 couldn’t download the media! 😓 Try again or check the message! 🚨\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Prepare media details
      const caption = msg[messageType].caption || `BOOM! Retrieved by 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇 | Powered by xh_clinton 🔥`;
      const mediaOptions = {
        caption,
        footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`,
        ...(messageType === 'audioMessage' ? { mimetype: msg.audioMessage.mimetype || 'audio/ogg', ptt: true } : {}),
        ...(messageType === 'videoMessage' ? { mimetype: msg.videoMessage.mimetype || 'video/mp4' } : {}),
        ...(messageType === 'imageMessage' ? { mimetype: msg.imageMessage.mimetype || 'image/jpeg' } : {}),
      };

      // Send media back to the same chat
      await zk.sendMessage(
        dest,
        {
          [messageType.replace('Message', '').toLowerCase()]: buffer,
          ...mediaOptions,
        },
        { quoted: ms }
      );

      // Notify success
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM, ${nomAuteurMessage}! 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇 decrypted and dropped the media right here! 🗿🔥\n◈━━━━━━━━━━━━━━━━◈`);

    } catch (error) {
      console.error("Error in vv command:", error.stack);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL BUST, ${nomAuteurMessage}! 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇 tripped while decrypting the media: ${error.message} 😡 Try again or flop! 😣\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);