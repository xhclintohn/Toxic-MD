import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getSettings, getGroupSettings, updateGroupSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    const formatStylishReply = (title, message) => {
      return `╭─❏ 「 ${title}」
│ ${message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    };

    if (!jid.endsWith('@g.us')) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "Yo, dumbass, this command's for groups only. Get lost.") });
    }

    try {
      const settings = await getSettings();
      if (!settings) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "Database is fucked, no settings found. Fix it, loser.") });
      }

      let groupSettings = await getGroupSettings(jid);
      if (!groupSettings) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "No group settings found. Database's acting up, try again.") });
      }

      let isEnabled = groupSettings?.antiforeign === true;

      const Myself = await client.decodeJid(client.user.id);
      const groupMetadata = await client.groupMetadata(m.chat);
      const userAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
      const isBotAdmin = userAdmins.includes(Myself);

      const _ON  = new Set(['on','enable','enabled','activate','activated','true','1','yes','start']);
          const _OFF = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);
        if (_ON.has(value) || _OFF.has(value)) {
        if (!isBotAdmin) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "Make me an admin first, you clown. Can't touch antiforeign without juice.") });
        }

        const action = _ON.has(value);

        if (isEnabled === action) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", `Antiforeign's already ${value.toUpperCase()}, genius. Stop wasting my time.\n│ \n│ 📌 Usage: ${prefix}antiforeign on | ${prefix}antiforeign off`) });
        }

        await updateGroupSetting(jid, 'antiforeign', action);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", `Antiforeign's now ${value.toUpperCase()}. Foreigners better watch out or get yeeted!\n│ \n│ 📌 Usage: ${prefix}antiforeign on | ${prefix}antiforeign off`) });
      }

          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 ANTIFOREIGN」
│ Status: ${settings.antiforeign ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}antiforeign on\n│ ${prefix}antiforeign off\n╰───────────────\n> 🌐 hosting.toxicx.tech`);

    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      console.error('[Antiforeign] Error in command:', error);
      await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "Shit broke, couldn't mess with antiforeign. Database or something's fucked. Try later.") });
    }
  });
};
