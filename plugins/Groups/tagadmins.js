import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { resolveTargetJid } from '../../lib/lidResolver.js';

export default {
    name: 'tagadmins',
    aliases: ['tagadminto', 'pingjidmins', 'calladmins'],
    description: 'Mentions all admins in the group',
    run: async (context) => {
        await middleware(context, async () => {
            const { client, m, text, groupMetadata } = context;
            const fq = getFakeQuoted(m);
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            if (!m.isGroup) return client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├ Group only command.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });

            const resolveParticipantJid = (p, participants) => {
                if (p.pn) return String(p.pn).replace(/\D/g, '') + '@s.whatsapp.net';
                const base = p.jid || p.id || '';
                if (base && !base.endsWith('@lid')) return base.split(':')[0].split('@')[0].replace(/\D/g, '') + '@s.whatsapp.net';
                return resolveTargetJid(base, participants);
            };

            try {
                const participants = groupMetadata?.participants || [];
                const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
                const mentions = admins.map(p => resolveParticipantJid(p, participants)).filter(Boolean);

                if (!mentions.length) return client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├ No admins found in this group.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });

                const txt = [
                    `╭───(    TOXIC-MD    )───`,
                    `├───≫ ADMINS ≪───`,
                    `├ `,
                    text ? `├ ${text}` : `├ Calling all admins 📢`,
                    `├ `,
                    ...mentions.map(id => `├ @${id.split('@')[0]}`),
                    `╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                ].join('\n');

                await client.sendMessage(m.chat, { text: txt, mentions }, { quoted: fq });
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            } catch (err) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├ Failed to fetch admins.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
            }
        });
    }
};
