import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'listonline',
    aliases: ['onlinelist', 'whosonline', 'online'],
    description: 'List group members who are currently online',
    run: async (context) => {
        const { client, m, isGroup } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const _isGroup = isGroup || m.isGroup || m.chat?.endsWith('@g.us');
        if (!_isGroup) {
            return sendInteractive(client, m, `╭─❏ 「 Oɴʟɪɴᴇ Lɪsᴛ」\n│\n│ This only works in groups, genius.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
        try {
            const meta = await client.groupMetadata(m.chat);
            const participants = (meta.participants || []).slice(0, 25);

            const memberMap = [];
            for (const p of participants) {
                const rawJid = p.id || p.jid || '';
                if (!rawJid) continue;

                const isLid = rawJid.endsWith('@lid');
                const lidNum = isLid ? rawJid.split('@')[0].split(':')[0] : '';
                let phone = '';

                if (!isLid) {
                    phone = rawJid.split('@')[0].split(':')[0].replace(/\D/g, '');
                } else {
                    const cached = globalThis.lidPhoneCache?.get(lidNum);
                    if (cached) {
                        phone = String(cached).replace(/\D/g, '');
                    } else if (globalThis.resolvePhoneFromLid) {
                        const resolved = globalThis.resolvePhoneFromLid(rawJid);
                        if (resolved && !resolved.endsWith('@lid')) {
                            phone = resolved.split('@')[0].replace(/\D/g, '');
                        }
                    }
                }

                memberMap.push({
                    originalJid: rawJid,
                    phoneJid: phone ? phone + '@s.whatsapp.net' : '',
                    lidJid: lidNum ? lidNum + '@lid' : '',
                    phone,
                    lidNum
                });
            }

            for (const { originalJid, phoneJid, lidJid } of memberMap) {
                try { await client.presenceSubscribe(originalJid); } catch {}
                if (phoneJid && phoneJid !== originalJid) {
                    try { await client.presenceSubscribe(phoneJid); } catch {}
                }
                if (lidJid && lidJid !== originalJid) {
                    try { await client.presenceSubscribe(lidJid); } catch {}
                }
            }

            await new Promise(r => setTimeout(r, 7000));

            const presenceMap = global._toxicPresenceMap || new Map();
            const onlineList = [];

            for (const { originalJid, phoneJid, lidJid, phone, lidNum } of memberMap) {
                const data =
                    presenceMap.get(originalJid) ||
                    presenceMap.get(phoneJid) ||
                    presenceMap.get(lidJid) ||
                    (phone ? presenceMap.get(phone) : null) ||
                    (lidNum ? presenceMap.get(lidNum) : null);

                if (
                    data &&
                    (data.lastKnownPresence === 'available' || data.lastKnownPresence === 'composing' || data.lastKnownPresence === 'recording') &&
                    (Date.now() - (data.timestamp || 0)) < 120000
                ) {
                    const displayJid = (phoneJid && !phoneJid.endsWith('@lid')) ? phoneJid : originalJid;
                    onlineList.push(displayJid);
                }
            }

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            const body = onlineList.length > 0
                ? onlineList.map((j, i) => `│ [${i + 1}] @${j.split('@')[0]}`).join('\n')
                : '│ Nobody seems online right now.\n│ WhatsApp only reports presence for subscribed contacts.';
            return client.sendMessage(m.chat, {
                text: `╭─❏ 「 Oɴʟɪɴᴇ Mᴇᴍʙᴇʀs」\n│\n${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                mentions: onlineList
            });
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return sendInteractive(client, m, `╭─❏ 「 Oɴʟɪɴᴇ Lɪsᴛ」\n│\n│ Couldn't fetch online members.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
