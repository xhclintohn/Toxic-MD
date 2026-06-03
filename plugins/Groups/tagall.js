import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { resolveTargetJid } from '../../lib/lidResolver.js';

export default async (context) => {
    const { client, m, groupMetadata, text } = context;
    const fq = getFakeQuoted(m);
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (!m.isGroup) return client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├ Command meant for groups.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });

    const resolveParticipantJid = (p, participants) => {
        if (p.pn) return String(p.pn).replace(/\D/g, '') + '@s.whatsapp.net';
        const base = p.jid || p.id || '';
        if (base && !base.endsWith('@lid')) return base.split(':')[0].split('@')[0].replace(/\D/g, '') + '@s.whatsapp.net';
        return resolveTargetJid(base, participants);
    };

    try {
        const participants = groupMetadata?.participants || [];
        const mentions = participants.map(p => resolveParticipantJid(p, participants)).filter(Boolean);
        const txt = [
            `╭───(    TOXIC-MD    )───`,
            `├───≫ TAG ALL ≪───`,
            `├ `,
            `├ Message: ${text ? text : 'No Message!'}`,
            `├ `,
            ...mentions.map(id => `├ @${id.split('@')[0]}`),
            `╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        ].join('\n');
        await client.sendMessage(m.chat, { text: txt, mentions }, { quoted: fq });
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├ Failed to tag participants.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
    }
};
