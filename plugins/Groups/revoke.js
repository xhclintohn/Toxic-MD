import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, groupMetadata } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            await client.groupRevokeInvite(m.chat);
            const newCode = await client.groupInviteCode(m.chat);
            const newLink = `https://chat.whatsapp.com/${newCode}`;
            const dmJid = typeof m.sender === 'string' && m.sender.endsWith('@s.whatsapp.net') ? m.sender : null;
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            if (dmJid) {
                await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ REVOKED ≪───\n├ \n├ Group link revoked!\n├ New link sent to your DM.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                await client.sendMessage(dmJid, {
                    text: `╭───(    TOXIC-MD    )───\n├───≫ NEW LINK ≪───\n├ \n├ ${newLink}\n├ \n├ New group link for ${groupMetadata?.subject || m.chat}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                });
            } else {
                await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ REVOKED ≪───\n├ \n├ Group link revoked!\n├ New link: ${newLink}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await m.reply(`╭───(    TOXIC-MD    )───\n├ Failed to revoke link: ${e.message?.slice(0, 60)}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    });
};
