import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'listactive',
    aliases: ['activelist', 'aet', 'activeusers', 'topactive', 'active'],
    description: 'Show top 10 most active users in this group by message count (tags only)',
    run: async (context) => {
        const { client, m, isGroup } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const _isGroup = isGroup || m.isGroup || m.chat?.endsWith('@g.us');
        if (!_isGroup) {
            return sendInteractive(client, m, `╭─❏ 「 Aᴄᴛɪᴠᴇ Lɪsᴛ」\n│\n│ Groups only.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
        try {
            const meta = await client.groupMetadata(m.chat);
            const participants = meta.participants || [];
            const allCountsByGroup = global._toxicMsgCountsByGroup || {};
            const allCounts = global._toxicMsgCounts || {};
            const pushNames = globalThis._toxicPushNames || new Map();

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
                for (const pp of participants) {
                    const ppLid = (pp.id || '').split('@')[0].split(':')[0];
                    if (ppLid === lidNum) {
                        const ppPhone = pp.phoneNumber || pp.phone_number || pp.pn || '';
                        if (ppPhone) return String(ppPhone).replace(/\D/g, '');
                    }
                }
                return lidNum;
            }

            const users = participants
                .filter(p => !p.id?.endsWith('@newsletter') && !p.id?.endsWith('@g.us'))
                .map(p => {
                    const phone = resolvePhone(p);
                    const gKey = m.chat + ':' + phone;
                    const count = allCountsByGroup[gKey] || allCounts[phone] || 0;
                    return { jid: p.id, phone, count };
                })
                .filter(u => u.count > 0)
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            if (!users.length) {
                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 Aᴄᴛɪᴠᴇ Lɪsᴛ」\n│\n│ No activity data yet.\n│ Keep chatting and try again.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            let text = `╭─❏ 「 Aᴄᴛɪᴠᴇ Lɪsᴛ」\n│\n│ Top ${users.length} active users:\n│\n`;
            const mentions = [];
            users.forEach((u, i) => {
                const tag = '@' + (u.phone || u.jid.split('@')[0]);
                text += `│ ${i + 1}. ${tag} — ${u.count.toLocaleString()} msgs\n`;
                mentions.push(u.jid);
            });
            text += `│\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            await client.sendMessage(m.chat, { text, mentions });
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」\n│\n│ Failed to load active list.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
