const { zokou } = require("../framework/zokou");
const fs = require('fs');
const path = './antilink.json';

// Initialize JSON storage
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

const TOXIC_MD = "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃";

// ======================
//  CORE FUNCTIONALITY
// ======================

function loadSettings() {
  return JSON.parse(fs.readFileSync(path));
}

function saveSettings(settings) {
  fs.writeFileSync(path, JSON.stringify(settings, null, 2));
}

// Advanced authority check
async function shouldTakeAction(message, zk) {
  const { auteurMessage, superUser, admins } = message;
  
  // 1. Check if sender is BOT OWNER (sudo)
  if (superUser) return false;

  // 2. Check if sender is GROUP ADMIN
  const isAdmin = admins.includes(auteurMessage);
  if (isAdmin) return false;

  // 3. Check if bot is ADMIN in the group
  const botJid = zk.user.id.split(':')[0] + '@s.whatsapp.net';
  const isBotAdmin = admins.includes(botJid);
  if (!isBotAdmin) {
    console.log("Bot is not admin - can't take action");
    return false;
  }

  return true;
}

// ======================
//  COMMAND HANDLERS
// ======================

// Enable anti-link
zokou({ nomCom: "enable", categorie: 'Group' }, async (dest, zk, cmdOpts) => {
  const { repondre, verifGroupe } = cmdOpts;
  if (!verifGroupe) return repondre(`${TOXIC_MD}\n❌ Group command only!`);

  const settings = loadSettings();
  settings[dest] = { 
    enabled: true, 
    action: 'delete', // Default action
    strictMode: true // Enable strict checks by default
  };
  saveSettings(settings);

  repondre(`${TOXIC_MD}\n✅ Anti-link enabled (Default: Delete links)`);
});

// Set action
zokou({ nomCom: "antilink", categorie: 'Group' }, async (dest, zk, cmdOpts) => {
  const { repondre, arg, verifGroupe } = cmdOpts;
  if (!verifGroupe) return repondre(`${TOXIC_MD}\n❌ Group command only!`);

  const validActions = ['delete', 'remove', 'warn'];
  const action = arg[0]?.toLowerCase();

  if (!validActions.includes(action)) {
    return repondre(`${TOXIC_MD}\n❌ Invalid action! Use: .antilink delete/remove/warn`);
  }

  const settings = loadSettings();
  if (!settings[dest]) settings[dest] = { enabled: true };
  settings[dest].action = action;
  saveSettings(settings);

  repondre(`${TOXIC_MD}\n✅ Action set to: ${action.toUpperCase()}`);
});

// ======================
//  LINK DETECTION
// ======================

zokou.on('message', async (message) => {
  const { texte, verifGroupe, auteurMessage, ms, zk } = message;
  if (!verifGroupe) return;

  const settings = loadSettings();
  const groupSettings = settings[message.origineMessage];
  if (!groupSettings?.enabled) return;

  // Enhanced link detection
  const linkPatterns = [
    /https?:\/\/[^\s]+/i,
    /www\.[^\s]+/i,
    /t\.me\/[^\s]+/i,
    /bit\.ly\/[^\s]+/i,
    /(?:telegram|whatsapp)\.me\/[^\s]+/i
  ];

  const containsLink = linkPatterns.some(pattern => pattern.test(texte));
  if (!containsLink) return;

  // Authority verification
  const proceed = await shouldTakeAction(message, zk);
  if (!proceed) return;

  // Take action
  const key = { 
    remoteJid: message.origineMessage, 
    id: ms.key.id,
    participant: auteurMessage
  };

  switch (groupSettings.action || 'delete') {
    case 'delete':
      await zk.sendMessage(message.origineMessage, { delete: key });
      break;

    case 'remove':
      try {
        await zk.groupParticipantsUpdate(message.origineMessage, [auteurMessage], "remove");
      } catch (e) {
        console.log("Bot needs admin rights to remove members");
      }
      break;

    case 'warn':
      await zk.sendMessage(message.origineMessage, {
        text: `${TOXIC_MD}\n@${auteurMessage.split('@')[0]}, *Links are forbidden!* ⚠️\n_Your message has been reported to admins._`,
        mentions: [auteurMessage]
      }, { quoted: ms });
      break;
  }
});