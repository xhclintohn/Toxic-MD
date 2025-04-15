const { zokou } = require("../framework/zokou");
const mongoose = require('mongoose');
const Sticker = require('wa-sticker-formatter');
const fs = require('fs');

// MongoDB connection
mongoose.connect('mongodb+srv://xhclinton1:xclintomwesh1@xhclinton.h9mye.mongodb.net/?retryWrites=true&w=majority&appName=xhclinton', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected for AntiLink'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema for anti-link settings
const AntiLinkSchema = new mongoose.Schema({
  groupJid: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  action: { type: String, default: 'delete' } // 'delete', 'remove', or 'warn'
});

const AntiLink = mongoose.model('AntiLink', AntiLinkSchema);

const TOXIC_MD = "\u{1D413}\u{1D40E}\u{1D417}\u{1D408}\u{1D402}-\u{1D40C}\u{1D403}";

// Enable/disable anti-link
zokou({ nomCom: "enable", categorie: 'Group', reaction: "🔧" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifGroupe } = commandeOptions;
  if (!verifGroupe) return repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Command only works in groups 🚫\n◈━━━━━━━━━━━━━━━━◈`);

  const action = arg[0]?.toLowerCase();
  if (!['antilink'].includes(action)) return repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Usage: .enable antilink\n◈━━━━━━━━━━━━━━━━◈`);

  try {
    await AntiLink.findOneAndUpdate(
      { groupJid: dest },
      { enabled: true },
      { upsert: true, new: true }
    );
    repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Anti-link protection enabled ✅\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (error) {
    repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Error enabling anti-link: ${error.message} 😓\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

// Set anti-link action
zokou({ nomCom: "antilink", categorie: 'Group', reaction: "🔧" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifGroupe } = commandeOptions;
  if (!verifGroupe) return repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Command only works in groups 🚫\n◈━━━━━━━━━━━━━━━━◈`);

  const action = arg[0]?.toLowerCase();
  if (!['delete', 'remove', 'warn'].includes(action)) return repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Usage: .antilink delete/remove/warn\n◈━━━━━━━━━━━━━━━━◈`);

  try {
    await AntiLink.findOneAndUpdate(
      { groupJid: dest },
      { action: action },
      { upsert: true, new: true }
    );
    repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Anti-link action set to: ${action} ✅\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (error) {
    repondre(`${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Error setting anti-link action: ${error.message} 😓\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

// Anti-link detection
zokou.on('message', async (message) => {
  const { texte, verifGroupe, auteurMessage, ms, zk, superUser, admins, conf } = message;
  if (!verifGroupe) return;

  try {
    const antiLinkSettings = await AntiLink.findOne({ groupJid: message.origineMessage });
    if (!antiLinkSettings || !antiLinkSettings.enabled) return;

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
    const gifLink = "https://raw.githubusercontent.com/xhclintohn/Toxic-MD/main/media/remover.gif";
    const sticker = new Sticker(gifLink, {
      pack: 'Toxic-MD',
      author: conf.OWNER_NAME,
      type: StickerTypes.FULL,
      categories: ['🤩', '🎉'],
      id: '12345',
      quality: 50,
      background: '#000000'
    });
    await sticker.toFile("st1.webp");

    const action = antiLinkSettings.action;

    if (action === 'remove') {
      const txt = `${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Link detected! 📩\n│❒ Removing user... 📩\n│❒ @${auteurMessage.split("@")[0]} has been removed for sending links 🚪\n◈━━━━━━━━━━━━━━━━◈`;
      await zk.sendMessage(message.origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
      await zk.sendMessage(message.origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
      try {
        await zk.groupParticipantsUpdate(message.origineMessage, [auteurMessage], "remove");
      } catch (e) {
        await zk.sendMessage(message.origineMessage, {
          text: `${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Error removing user: I need admin rights to remove 😓\n◈━━━━━━━━━━━━━━━━◈`
        }, { quoted: ms });
      }
      await zk.sendMessage(message.origineMessage, { delete: key });
      await fs.unlink("st1.webp");
    } else if (action === 'delete') {
      const txt = `${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Link detected! 📩\n│❒ Message deleted 📩\n│❒ @${auteurMessage.split("@")[0]}, don't send links here 🚫\n◈━━━━━━━━━━━━━━━━◈`;
      await zk.sendMessage(message.origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
      await zk.sendMessage(message.origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
      await zk.sendMessage(message.origineMessage, { delete: key });
      await fs.unlink("st1.webp");
    } else if (action === 'warn') {
      const txt = `${TOXIC_MD}\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Link detected! 📩\n│❒ Warning issued 📩\n│❒ @${auteurMessage.split("@")[0]}, don't send links here ⚠️\n◈━━━━━━━━━━━━━━━━◈`;
      await zk.sendMessage(message.origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
      await zk.sendMessage(message.origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
      await zk.sendMessage(message.origineMessage, { delete: key });
      await fs.unlink("st1.webp");
    }
  } catch (error) {
    console.error("Anti-link error:", error);
  }
});