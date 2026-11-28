import { getWarnCount, getWarnLimit } from '../../database/config.js';
import middleware from '../../utils/botUtil/middleware.js';
import { resolveTargetJid } from '../../lib/lidResolver.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, args } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 WARN COUNT」
│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        const groupMetadata = await client.groupMetadata(m.chat);
        const participants = groupMetadata.participants;

        let rawJid = null;
        if (m.quoted && m.quoted.sender) {
            rawJid = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            rawJid = m.mentionedJid[0];
        }
        if (!rawJid && args[0]) rawJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        if (!rawJid) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: fmt("Tag someone or reply to their message. I can't read minds, fool. 😒") });
        }

        const target = resolveTargetJid(rawJid, participants);
        if (!target) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: fmt("Couldn't find that person in this group. 🙄") });
        }

        const targetInGroup = participants.find(p => {
            const pid = (p.jid || p.id || '').split(':')[0].split('@')[0].replace(/\D/g, '');
            return pid === target.split('@')[0];
        });
        if (!targetInGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: fmt("That person isn't even in this group. Are you seeing ghosts? 👻") });
        }

        const username = target.split('@')[0];
        const count = await getWarnCount(m.chat, target);
        const limit = await getWarnLimit(m.chat);
        const remaining = limit - count;

        await client.sendMessage(m.chat, {
            text: `╭─❏ 「 WARN COUNT」
│ 📊 @${username}\n│ Warns: *${count}/${limit}*\n│ Remaining: *${remaining}*\n│ ${count === 0 ? 'Clean record. For now. 😏' : remaining <= 1 ? "One more and they're OUT. 💀" : 'Walking on thin ice. ⚠️'}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
            mentions: [target]
        });
    });
};
