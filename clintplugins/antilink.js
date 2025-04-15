const { zokou } = require("../framework/zokou");

const TOXIC_MD = "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃";

// No database needed - simple memory storage
const antiLinkGroups = new Set();

// Enable command
zokou({ nomCom: "enable", categorie: 'Group' }, async (dest, zk, cmdOpts) => {
  const { repondre, arg, verifGroupe } = cmdOpts;
  
  if (!verifGroupe) return repondre(`${TOXIC_MD}\n❌ Group only command!`);
  if (arg[0]?.toLowerCase() !== 'antilink') return;

  antiLinkGroups.add(dest);
  repondre(`${TOXIC_MD}\n✅ ALL https:// links will now be AUTO-DELETED`);
});

// Detection
zokou.on('message', async (message) => {
  const { texte, verifGroupe, auteurMessage, ms, zk, superUser, admins } = message;
  
  // Skip if:
  if (!verifGroupe ||                          // Not a group
      !antiLinkGroups.has(message.origineMessage) || // Feature not enabled
      texte?.toLowerCase().includes('https://') ||   // No https:// found
      superUser ||                              // Sender is bot owner
      admins.includes(auteurMessage)            // Sender is group admin
  ) return;

  // Delete the message immediately
  await zk.sendMessage(message.origineMessage, {
    delete: {
      remoteJid: message.origineMessage,
      fromMe: false,
      id: ms.key.id,
      participant: auteurMessage
    }
  }).catch(e => console.log("Delete failed (maybe no admin rights?)"));
});