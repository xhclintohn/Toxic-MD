import { getBuffer } from '../../lib/botFunctions.js';
import links from './links.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const getTarget = (m) => {
    const jid = (m.mentionedJid && m.mentionedJid[0]) || (m.quoted && m.quoted.sender) || null;
    if (!jid) return null;
    if (!jid.includes('@s.whatsapp.net') && !jid.includes('@lid')) return null;
    return jid;
};

function resolveDisplayJid(jid) {
    if (!jid) return jid;
    if (!jid.endsWith('@lid')) return jid;
    if (globalThis.resolvePhoneFromLid) {
        const phone = globalThis.resolvePhoneFromLid(jid);
        if (phone) return phone + '@s.whatsapp.net';
    }
    if (globalThis.lidPhoneCache) {
        const lid = jid.split('@')[0].split(':')[0];
        const phone = globalThis.lidPhoneCache.get(lid);
        if (phone) return phone + '@s.whatsapp.net';
    }
    return jid;
}

export default {
    name: 'fuck',
    aliases: ['screw', 'bang'],
    description: 'Send a savage reaction to a tagged or quoted user',
    run: async (context) => {
        const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        await client.sendMessage(m.chat, { react: { text: '😤', key: m.reactKey } });
        try {
            const target = getTarget(m);
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            if (!target) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `│ Tag or quote someone first.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
            const resolvedTarget = resolveDisplayJid(target);
            const tNum = resolvedTarget.split('@')[0];
            const sNum = resolveDisplayJid(m.sender).split('@')[0];
            if (links.fuck) {
                try {
                    const buf = await getBuffer(links.fuck);
                    await client.sendMessage(m.chat, { sticker: buf });
                    await client.sendMessage(m.chat, { text: `@${sNum} went off on @${tNum} 😤`, mentions: [m.sender, resolvedTarget] });
                    return;
                } catch {}
            }
            const lines = [
                `@${sNum} absolutely roasted @${tNum}. The audacity. 🔥`,
                `@${sNum} just went full savage on @${tNum}. Someone's getting blocked. 😤`,
                `@${sNum} told @${tNum} exactly what they think. No filter whatsoever. 💀`,
            ];
            await client.sendMessage(m.chat, {
                text: `│ ${lines[Math.floor(Math.random() * lines.length)]}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                mentions: [m.sender, resolvedTarget]
            });
        } catch {
            await sendInteractive(client, m, `│ Command failed. Try again.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
