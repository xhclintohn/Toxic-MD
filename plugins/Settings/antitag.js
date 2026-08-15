import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
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
            return await client.sendMessage(m.chat, { text: formatStylishReply("ANTITAG", "This command can only be used in groups, fool!") });
        }

        let groupSettings = await getGroupSettings(jid);
        let isEnabled = groupSettings?.antitag === true;

        const Myself = await client.decodeJid(client.user.id);
        const groupMetadata = await client.groupMetadata(m.chat);
        const userAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
        const isBotAdmin = userAdmins.includes(Myself);

        if (value === 'on' && !isBotAdmin) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: formatStylishReply("ANTITAG", "I need admin privileges to enable Antitag, you clown!") });
        }

        const _ON  = new Set(['on','enable','enabled','activate','activated','true','1','yes','start']);
          const _OFF = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);
        if (_ON.has(value) || _OFF.has(value)) {
            const action = _ON.has(value);

            if (isEnabled === action) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: formatStylishReply("ANTITAG", `Antitag is already ${value.toUpperCase()}, genius!\n│ \n│ 📌 Usage: ${prefix}antitag on | ${prefix}antitag off`) });
            }

            await updateGroupSetting(jid, 'antitag', action);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return await client.sendMessage(m.chat, { text: formatStylishReply("ANTITAG", `Antitag has been turned ${value.toUpperCase()} for this group.\n│ \n│ 📌 Usage: ${prefix}antitag on | ${prefix}antitag off`) });
        }

          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 ANTITAG」
│ Status: ${settings.antitag ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}antitag on\n│ ${prefix}antitag off\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

    });
};
