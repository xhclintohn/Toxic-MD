const { zokou } = require("../framework/zokou");
const fs = require('fs');
const path = './antilink.json'; // JSON storage file

// Initialize JSON file if it doesn't exist
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// Load settings from JSON
function loadSettings() {
  return JSON.parse(fs.readFileSync(path));
}

// Save settings to JSON
function saveSettings(settings) {
  fs.writeFileSync(path, JSON.stringify(settings, null, 2));
}

const TOXIC_MD = "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃";

// Enable/disable anti-link
zokou({ nomCom: "enable", categorie: 'Group', reaction: "🔧" }, async (dest, zk, cmdOpts) => {
  const { repondre, arg, verifGroupe } = cmdOpts;
  if (!verifGroupe) return repondre(`${TOXIC_MD}\nCommand only works in groups!`);

  if (arg[0]?.toLowerCase() !== 'antilink') {
    return repondre(`${TOXIC_MD}\nUsage: .enable antilink`);
  }

  const settings = loadSettings();
  settings[dest] = { enabled: true, action: 'delete' }; // Default action
  saveSettings(settings);

  repondre(`${TOXIC_MD}\nAnti-link protection enabled ✅`);
});

// Set action (delete/remove/warn)
zokou({ nomCom: "antilink", categorie: 'Group', reaction: "🔧" }, async (dest, zk, cmdOpts) => {
  const { repondre, arg, verifGroupe } = cmdOpts;
  if (!verifGroupe) return repondre(`${TOXIC_MD}\nCommand only works in groups!`);

  const action = arg[0]?.toLowerCase();
  if (!['delete', 'remove', 'warn'].includes(action)) {
    return repondre(`${TOXIC_MD}\nUsage: .antilink delete/remove/warn`);
  }

  const settings = loadSettings();
  if (!settings[dest]) settings[dest] = { enabled: true }; // Enable if not set
  settings[dest].action = action;
  saveSettings(settings);

  repondre(`${TOXIC_MD}\nAction set to: ${action} ✅`);
});

// Detect links
zokou.on('message', async (message) => {
  const { texte, verifGroupe, auteurMessage, ms, zk, superUser, admins } = message;
  if (!verifGroupe) return;

  const settings = loadSettings();
  const groupSettings = settings[message.origineMessage];
  if (!groupSettings?.enabled) return;

  // Link detection regex
  const linkRegex = /(https?:\/\/|www\.|t\.me|bit\.ly|tinyurl\.com|lnkd\.in|fb\.me)[\S]+/i;
  if (!linkRegex.test(texte)) return;

  // Skip if sender is admin/bot-owner
  const isAdmin = admins.includes(auteurMessage);
  if (superUser || isAdmin) return;

  // Take action
  const key = { remoteJid: message.origineMessage, id: ms.key.id };
  switch (groupSettings.action) {
    case 'delete':
      await zk.sendMessage(message.origineMessage, { delete: key });
      break;

    case 'remove':
      try {
        await zk.groupParticipantsUpdate(message.origineMessage, [auteurMessage], "remove");
      } catch (e) {
        console.log("Need admin rights to remove users");
      }
      break;

    case 'warn':
      await zk.sendMessage(message.origineMessage, { 
        text: `${TOXIC_MD}\n@${auteurMessage.split('@')[0]}, links are not allowed here! ⚠️`,
        mentions: [auteurMessage]
      }, { quoted: ms });
      break;
  }
});