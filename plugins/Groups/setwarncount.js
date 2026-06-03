import { setWarnLimit, getWarnLimit } from '../../database/config.js';
import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, body } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭───(    TOXIC-MD    )───\n├───≫ SET WARN LIMIT ≪───\n├ \n├ ${msg}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        const current = await getWarnLimit(m.chat);

        const rawInput = body.trim().split(/\s+/).slice(1).join('').replace(/[^0-9]/g, '');

        if (!rawInput) {
            return await client.sendMessage(m.chat, {
                text: fmt(`Current warn limit for this group: *${current}*\n├ \n├ Usage: .setwarncount <number>\n├ Example: .setwarncount 5\n├ \n├ When a user hits the limit\n├ they get kicked automatically. 😈\n├ Min: 1 — Max: 10`)
            }, { quoted: fq });
        }

        const num = parseInt(rawInput, 10);

        if (isNaN(num) || num < 1 || num > 10) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: fmt('Give me a number between 1 and 10. Is that too hard? 🙄') }, { quoted: fq });
        }

        if (num === current) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: fmt(`Warn limit is already *${current}*. Pay attention. 😒`) }, { quoted: fq });
        }

        await setWarnLimit(m.chat, num);

        await client.sendMessage(m.chat, {
            text: fmt(`✅ Warn limit updated to *${num}*.\n├ Members now get kicked after ${num} warns. 😈`)
        }, { quoted: fq });
    });
};
