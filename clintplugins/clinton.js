const { zokou } = require('../framework/zokou');

zokou(
  {
    nomCom: 'info',
    categorie: 'General',
    reaction: '🗿'
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefix, nomAuteurMessage } = commandeOptions;

    try {
      // Group and Channel links
      const groupLink = 'https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI';
      const channelLink = 'https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19';

      // Prepare the info message content
      const infoMsg = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ Yo ${nomAuteurMessage}, here’s the dope on 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇! 🔥
│❒ *📩 𝐆𝐫𝐨𝐮𝐩*: ${groupLink}
│❒ *📢 𝐂𝐡𝐚𝐧𝐧𝐞𝐥*: ${channelLink}
│❒ Wanna vibe with the owner? Use *${prefix}owner*! 😎
│❒ Powered by xh_clinton
◈━━━━━━━━━━━━━━━━◈
      `;

      // Send the info message
      await zk.sendMessage(
        dest,
        {
          text: infoMsg,
          footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`
        },
        { quoted: ms }
      );

    } catch (error) {
      console.error("Error in info command:", error.stack);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL BUST, ${nomAuteurMessage}! 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇 tripped while dropping the info: ${error.message} 😡 Try again or flop! 😣\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);