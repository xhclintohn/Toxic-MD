const { zokou } = require('../framework/zokou');

zokou({ nomCom: "btest", categorie: "General", reaction: "🛠️" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe } = commandeOptions;

  console.log(`[DEBUG] btest triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  // Handle null pushName
  const userName = ms.pushName || "Tester";

  // Check if it’s a group chat (optional, but included for consistency)
  if (!verifGroupe) {
    console.log(`[DEBUG] btest: Not a group chat`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${userName}! 😡 This works better in a group, but fine, let’s test these buttons! 🚀\n◈━━━━━━━━━━━━━━━━◈`);
  }

  // Prepare button message
  try {
    await zk.sendMessage(dest, {
      text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ WELCOME, ${userName}! 😎 Time to test the POWER of TOXIC-MD!\n│❒ Pick a button and unleash the chaos! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`,
      footer: "TOXIC-MD Testing Suite",
      buttons: [
        {
          buttonId: `ping_${ms.key.id}`,
          buttonText: { displayText: "⚡ Ping" },
          type: 1
        },
        {
          buttonId: `owner_${ms.key.id}`,
          buttonText: { displayText: "👑 Owner" },
          type: 1
        }
      ],
      headerType: 4
    });
    console.log(`[DEBUG] btest: Button message sent successfully`);
  } catch (e) {
    console.log(`[DEBUG] btest: Error sending button message: ${e}`);
    repondre(`𝐓�{O𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS INFURIATING, ${userName}! 😤 Failed to show buttons: ${e.message}! I’ll SMASH THIS TRASH SYSTEM! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});