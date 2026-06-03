import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const blocked = await client.fetchBlocklist();
            if (!blocked || blocked.length === 0) {
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ BLOCK LIST ≪───\n├ \n├ No blocked contacts. Clean slate!\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
            const list = blocked.map((jid, i) => `├ ${i + 1}. +${jid.split('@')[0]}`).join('\n');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ BLOCK LIST ≪───\n├ \n├ Blocked (${blocked.length}):\n${list}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ Failed to fetch blocklist: ${e.message?.slice(0, 60)}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    });
};
