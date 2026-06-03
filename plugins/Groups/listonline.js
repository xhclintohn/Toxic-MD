import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'listonline',
    aliases: ['onlinelist', 'whosonline', 'online'],
    description: 'List group members who are currently online',
    run: async (context) => {
        const { client, m, isGroup } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const _isGroup = isGroup || m.isGroup || m.chat?.endsWith('@g.us');
        if (!_isGroup) {
            return client.sendMessage(m.chat, {
                text: '╭───(    TOXIC-MD    )───\n├───≫ Oɴʟɪɴᴇ Lɪsᴛ ≪───\n├\n├ This only works in groups, genius.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧'
            }, { quoted: fq });
        }
        try {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            const meta = await client.groupMetadata(m.chat);
            const participants = meta.participants || [];

            const validJids = [];
            for (const p of participants.slice(0, 25)) {
                const jid = p.id || p.jid || '';
                if (jid && !jid.endsWith('@lid')) {
                    validJids.push(jid);
                } else if (jid.endsWith('@lid') && globalThis.resolvePhoneFromLid) {
                    const phone = globalThis.resolvePhoneFromLid(jid.includes('@') ? jid : jid + '@lid');
                    if (phone) validJids.push(phone + '@s.whatsapp.net');
                }
            }

            for (const jid of validJids) {
                try { await client.presenceSubscribe(jid); } catch {}
            }

            await new Promise(r => setTimeout(r, 5000));

            const presenceMap = global._toxicPresenceMap || new Map();
            const onlineList = [];
            for (const jid of validJids) {
                const data = presenceMap.get(jid);
                if (
                    data &&
                    (data.lastKnownPresence === 'available' || data.lastKnownPresence === 'composing' || data.lastKnownPresence === 'recording') &&
                    (Date.now() - (data.timestamp || 0)) < 120000
                ) {
                    onlineList.push(jid);
                }
            }

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            const body = onlineList.length > 0
                ? onlineList.map((j, i) => `├ [${i + 1}] @${j.split('@')[0]}`).join('\n')
                : '├ Nobody seems online right now.\n├ WhatsApp only reports presence for subscribed contacts.';
            return client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├───≫ Oɴʟɪɴᴇ Mᴇᴍʙᴇʀs ≪───\n├\n${body}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                mentions: onlineList
            }, { quoted: fq });
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return client.sendMessage(m.chat, { text: '╭───(    TOXIC-MD    )───\n├───≫ Oɴʟɪɴᴇ Lɪsᴛ ≪───\n├\n├ Couldn\'t fetch online members.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' }, { quoted: fq });
        }
    }
};
