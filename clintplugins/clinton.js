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

      // Prepare the button message content
      const captionText = `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, here’s the dope on 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇! 🔥\n│❒ *📩 𝐆𝐫𝐨𝐮𝐩*: ${groupLink}\n│❒ *📢 𝐂𝐡𝐚𝐧𝐧𝐞𝐥*: ${channelLink}\n│❒ Hit the button to vibe with the owner! 😎\n◈━━━━━━━━━━━━━━━━◈`;

      // Define the button message
      const buttonMessage = {
        buttonsMessage: {
          contentText: captionText,
          footerText: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_�{c𝐥𝐢𝐧𝐭𝐨𝐧 😎`,
          buttons: [
            {
              buttonId: `${prefix}owner`,
              buttonText: { displayText: "🕯️✨ 𝐎𝐖𝐍𝐄𝐑 ✨🕯️" },
              type: 1,
            },
          ],
          headerType: 1,
        },
      };

      // Send the button message
      await zk.sendMessage(dest, buttonMessage, { quoted: ms });

    } catch (error) {
      console.error("Error in info command:", error.stack);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-�{M𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL BUST, ${nomAuteurMessage}! 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇 tripped while dropping the info: ${error.message} 😡 Try again or flop! 😣\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);