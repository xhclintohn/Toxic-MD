import { getBuffer } from '../../lib/botFunctions.js';
import links from './links.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

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
    name: 'hug',
    aliases: ['cuddle', 'embrace'],
    description: 'Hug a tagged or quoted user',
    run: async (context) => {
        const { client, m } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        await client.sendMessage(m.chat, { react: { text: '🤗', key: m.reactKey } });
        try {
            const target = getTarget(m);
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            if (!target) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply(`╭───(    TOXIC-MD    )───\n├ Tag or quote someone to hug.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
            const resolvedTarget = resolveDisplayJid(target);
            const tNum = resolvedTarget.split('@')[0];
            const sNum = resolveDisplayJid(m.sender).split('@')[0];
            if (links.hug) {
                try {
                    const buf = await getBuffer(links.hug);
                    await client.sendMessage(m.chat, { sticker: buf }, { quoted: fq });
                    await client.sendMessage(m.chat, { text: `@${sNum} hugged @${tNum} 🤗`, mentions: [m.sender, resolvedTarget] }, { quoted: fq });
                    return;
                } catch {}
            }
            const lines = [
                `@${sNum} gave @${tNum} a hug they didn't ask for. 🤗`,
                `@${sNum} wrapped @${tNum} up in a hug. Wholesome or weird, you decide. 🫂`,
                `@${sNum} hugged @${tNum}. Finally some peace in this group. 🤗`,
            ];
            await client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├ ${lines[Math.floor(Math.random() * lines.length)]}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                mentions: [m.sender, resolvedTarget]
            }, { quoted: fq });
        } catch {
            await m.reply(`╭───(    TOXIC-MD    )───\n├ Hug failed. Try again.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
