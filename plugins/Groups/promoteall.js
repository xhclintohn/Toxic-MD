import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { resolveTargetJid } from '../../lib/lidResolver.js';

const BOX = (title, lines) => {
    const body = (Array.isArray(lines) ? lines : [lines]).map(l => `├ ${l}`).join('\n');
    return `╭───(    TOXIC-MD    )───\n├───≫ ${title} ≪───\n├\n${body}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

const resolveP = (p, participants) => {
    if (p.pn) return String(p.pn).replace(/\D/g, '') + '@s.whatsapp.net';
    const base = p.jid || p.id || '';
    if (base && !base.endsWith('@lid')) return base.split(':')[0].split('@')[0].replace(/\D/g, '') + '@s.whatsapp.net';
    return resolveTargetJid(base, participants);
};

export default {
    name: 'promoteall',
    aliases: ['pall'],
    description: 'Promotes all non-admin members to admin',
    run: async (context) => {
        await middleware(context, async () => {
            const { client, m, isBotAdmin } = context;
            const fq = getFakeQuoted(m);
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            if (!m.isGroup) return client.sendMessage(m.chat, { text: BOX('ERROR', ['Group only command.']) }, { quoted: fq });
            if (!isBotAdmin) return client.sendMessage(m.chat, { text: BOX('ERROR', ['Make me admin first.']) }, { quoted: fq });

            try {
                const meta = await client.groupMetadata(m.chat);
                const participants = meta.participants;
                const nonAdmins = participants.filter(p => p.admin !== 'admin' && p.admin !== 'superadmin');
                const jids = nonAdmins.map(p => resolveP(p, participants)).filter(Boolean);

                if (!jids.length) return client.sendMessage(m.chat, { text: BOX('PROMOTEALL', ["Everyone's already an admin. Nothing to do."]) }, { quoted: fq });

                await client.sendMessage(m.chat, { text: BOX('PROMOTEALL', [`Promoting ${jids.length} members...`]) }, { quoted: fq });

                const batchSize = 5;
                let promoted = 0;
                for (let i = 0; i < jids.length; i += batchSize) {
                    const batch = jids.slice(i, i + batchSize);
                    try { await client.groupParticipantsUpdate(m.chat, batch, 'promote'); promoted += batch.length; } catch {}
                    if (i + batchSize < jids.length) await new Promise(r => setTimeout(r, 1500));
                }

                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await client.sendMessage(m.chat, {
                    text: BOX('PROMOTEALL', [`Done. ${promoted} member(s) promoted to admin.`, `You made everyone a boss. Congrats on the chaos.`])
                }, { quoted: fq });
            } catch (err) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                await client.sendMessage(m.chat, { text: BOX('ERROR', [`Failed: ${err.message?.slice(0, 60)}`]) }, { quoted: fq });
            }
        });
    }
};
