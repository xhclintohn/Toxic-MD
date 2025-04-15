const { zokou } = require("../framework/zokou");
const mongoose = require('mongoose');
const Sticker = require('wa-sticker-formatter');
const fs = require('fs');

const TOXIC_MD = "\u{1D413}\u{1D40E}\u{1D417}\u{1D408}\u{1D402}-\u{1D40C}\u{1D403}";

// Improved MongoDB connection with timeout settings
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://xhclinton1:xclintomwesh1@xhclinton.h9mye.mongodb.net/?retryWrites=true&w=majority&appName=xhclinton', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

connectDB();

const AntiLinkSchema = new mongoose.Schema({
  groupJid: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  action: { type: String, default: 'delete' }
});

const AntiLink = mongoose.model('AntiLink', AntiLinkSchema);

// Fallback in-memory storage if DB fails
const antiLinkCache = new Map();

async function getAntiLinkSettings(groupJid) {
  try {
    const settings = await AntiLink.findOne({ groupJid });
    if (settings) {
      antiLinkCache.set(groupJid, settings);
      return settings;
    }
    return antiLinkCache.get(groupJid) || { enabled: false, action: 'delete' };
  } catch {
    return antiLinkCache.get(groupJid) || { enabled: false, action: 'delete' };
  }
}

async function updateAntiLinkSettings(groupJid, update) {
  try {
    const settings = await AntiLink.findOneAndUpdate(
      { groupJid },
      update,
      { upsert: true, new: true }
    );
    antiLinkCache.set(groupJid, settings);
    return true;
  } catch (err) {
    console.error('DB update failed, using cache:', err);
    const current = antiLinkCache.get(groupJid) || { enabled: false, action: 'delete' };
    antiLinkCache.set(groupJid, { ...current, ...update });
    return false;
  }
}

zokou({ nomCom: "enable", categorie: 'Group', reaction: "🔧" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifGroupe } = commandeOptions;
  if (!verifGroupe) return repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Command only works in groups 🚫\n◈━━━━━━━━━━━━━━━━◈`);

  if (!arg[0] || arg[0].toLowerCase() !== 'antilink') {
    return repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Usage: .enable antilink\n◈━━━━━━━━━━━━━━━━◈`);
  }

  const success = await updateAntiLinkSettings(dest, { enabled: true });
  if (success) {
    repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Anti-link protection enabled ✅\n◈━━━━━━━━━━━━━━━━◈`);
  } else {
    repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Anti-link enabled (using temporary storage) ⚠️\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: "antilink", categorie: 'Group', reaction: "🔧" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifGroupe } = commandeOptions;
  if (!verifGroupe) return repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Command only works in groups 🚫\n◈━━━━━━━━━━━━━━━━◈`);

  const action = arg[0]?.toLowerCase();
  if (!['delete', 'remove', 'warn'].includes(action)) {
    return repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Usage: .antilink delete/remove/warn\n◈━━━━━━━━━━━━━━━━◈`);
  }

  const success = await updateAntiLinkSettings(dest, { action });
  if (success) {
    repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Action set to: ${action} ✅\n◈━━━━━━━━━━━━━━━━◈`);
  } else {
    repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Action set (using temporary storage): ${action} ⚠️\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou.on('message', async (message) => {
  const { texte, verifGroupe, auteurMessage, ms, zk, superUser, admins, conf } = message;
  if (!verifGroupe) return;

  try {
    const antiLinkSettings = await getAntiLinkSettings(message.origineMessage);
    if (!antiLinkSettings.enabled) return;

    const linkRegex = /(https?:\/\/|www\.|t\.me|bit\.ly|tinyurl\.com|lnkd\.in|fb\.me)[\S]+/i;
    if (!linkRegex.test(texte)) return;

    const normalizeJid = (jid) => jid.split(':')[0];
    const normalizedBotJid = normalizeJid(zk.user.id);
    const normalizedAdmins = admins.map(normalizeJid);
    const verifZokAdmin = normalizedAdmins.includes(normalizedBotJid);
    const normalizedSenderJid = normalizeJid(auteurMessage);
    const verifAdmin = normalizedAdmins.includes(normalizedSenderJid);

    if (superUser || verifAdmin || !verifZokAdmin) return;

    const key = {
      remoteJid: message.origineMessage,
      fromMe: false,
      id: ms.key.id,
      participant: auteurMessage
    };

    const sticker = await createSticker(conf.OWNER_NAME);
    await handleAntiLinkAction(antiLinkSettings.action, message, zk, auteurMessage, key, sticker);
    
  } catch (error) {
    console.error("Anti-link processing error:", error);
  }
});

async function createSticker(ownerName) {
  const gifLink = "https://raw.githubusercontent.com/xhclintohn/Toxic-MD/main/media/remover.gif";
  const sticker = new Sticker(gifLink, {
    pack: 'Toxic-MD',
    author: ownerName,
    type: StickerTypes.FULL,
    categories: ['🤩', '🎉'],
    id: '12345',
    quality: 50,
    background: '#000000'
  });
  await sticker.toFile("st1.webp");
  return sticker;
}

async function handleAntiLinkAction(action, message, zk, auteurMessage, key, sticker) {
  const baseMsg = `${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Link detected! 📩\n`;
  const mention = `@${auteurMessage.split("@")[0]}`;

  try {
    await zk.sendMessage(message.origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: message.ms });

    switch (action) {
      case 'remove':
        await zk.sendMessage(message.origineMessage, { 
          text: `${baseMsg}│❒ Removing user... 📩\n│❒ ${mention} has been removed 🚪\n◈━━━━━━━━━━━━━━━━◈`,
          mentions: [auteurMessage] 
        }, { quoted: message.ms });
        try {
          await zk.groupParticipantsUpdate(message.origineMessage, [auteurMessage], "remove");
        } catch (e) {
          await zk.sendMessage(message.origineMessage, {
            text: `${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Need admin rights to remove users 😓\n◈━━━━━━━━━━━━━━━━◈`
          }, { quoted: message.ms });
        }
        break;

      case 'warn':
        await zk.sendMessage(message.origineMessage, { 
          text: `${baseMsg}│❒ Warning issued 📩\n│❒ ${mention}, don't send links ⚠️\n◈━━━━━━━━━━━━━━━━◈`,
          mentions: [auteurMessage] 
        }, { quoted: message.ms });
        break;

      default: // delete
        await zk.sendMessage(message.origineMessage, { 
          text: `${baseMsg}│❒ Message deleted 📩\n│❒ ${mention}, no links allowed 🚫\n◈━━━━━━━━━━━━━━━━◈`,
          mentions: [auteurMessage] 
        }, { quoted: message.ms });
    }

    await zk.sendMessage(message.origineMessage, { delete: key });
  } finally {
    fs.unlink("st1.webp", () => {});
  }
}