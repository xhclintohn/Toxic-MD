const { zokou } = require('../framework/zokou');

zokou(
  {
    nomCom: 'clint',
    categorie: 'General',
    reaction: '🤝'
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefix } = commandeOptions;

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
        contentText: captionText,
        footerText: "Powered by Toxic-MD",
        buttons: buttons,
        headerType: 1,
      };

      // Send the button message
      await zk.sendMessage(dest, buttonMessage, { quoted: ms });

    } catch (error) {
      console.error("Error in clint command:", error.stack);
      repondre(`𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${error.message}`);
    }
  }
);