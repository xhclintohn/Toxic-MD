import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'liststicker',
    aliases: ['sl', 'totalsticker', 'stickert', 'stickerlist', 'stickercount'],
    description: 'Show sticker counts per user in this group (tags only)',
    run: async (context) => {
        const { client, m, isGroup } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const _isGroup = isGroup || m.isGroup || m.chat?.endsWith('@g.us');
        if (!_isGroup) {
            return sendInteractive(client, m, `╭─❏ 「 Sᴛɪᴄᴋᴇʀ Lɪsᴛ」\n│\n│ Groups only.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
        try {
            const meta = await client.groupMetadata(m.chat);
            const participants = meta.participants || [];
            const byGroup = global._toxicStickerCountsByGroup || {};
            const all = global._toxicStickerCounts || {};

            function resolvePhone(p) {
                const jid = p.id || '';
                if (!jid) return '';
                if (!jid.endsWith('@lid')) {
                    return jid.split('@')[0].split(':')[0].replace(/\D/g, '');
                }
                const lidNum = jid.split('@')[0].split(':')[0];
                const cached = globalThis.lidPhoneCache?.get(lidNum);
                if (cached) return String(cached).replace(/\D/g, '');
                if (globalThis.resolvePhoneFromLid) {
                    const resolved = globalThis.resolvePhoneFromLid(jid);
                    if (resolved && !resolved.endsWith('@lid')) {
                        return resolved.split('@')[0].replace(/\D/g, '');
                    }
                }
                return lidNum;
            }

            const users = participants
                .filter(p => !p.id?.endsWith('@newsletter') && !p.id?.endsWith('@g.us'))
                .map(p => {
                    const phone = resolvePhone(p);
                    const gKey = m.chat + ':' + phone;
                    const count = byGroup[gKey] || all[phone] || 0;
                    return { jid: p.id, phone, count };
                })
                .filter(u => u.count > 0)
                .sort((a, b) => b.count - a.count);

            if (!users.length) {
                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 Sᴛɪᴄᴋᴇʀ Lɪsᴛ」\n│\n│ No stickers tracked yet.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            let text = `╭─❏ 「 Sᴛɪᴄᴋᴇʀ Lɪsᴛ」\n│\n│ Sticker counts:\n│\n`;
            const mentions = [];
            users.forEach((u, i) => {
                const tag = '@' + (u.phone || u.jid.split('@')[0]);
                text += `│ ${i + 1}. ${tag} — ${u.count.toLocaleString()} stickers\n`;
                mentions.push(u.jid);
            });
            text += `│\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            await client.sendMessage(m.chat, { text, mentions });
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」\n│\n│ Failed to load sticker list.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
