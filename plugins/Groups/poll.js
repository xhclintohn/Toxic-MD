import { getFakeQuoted } from '../../lib/fakeQuoted.js';
const polls = new Map();

export default {
    name: 'poll',
    alias: ['createpoll', 'vote'],
    description: 'Create a group poll',
    run: async (context) => {
        const { client, m } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        if (!m.isGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ Group only command, dumbass.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const input = (context.text || context.q || '').trim();
        if (!input.includes('|')) return m.reply(`╭───(    TOXIC-MD    )───\n├ Format: .poll Question | Option1 | Option2 | ...\n├ Example: .poll Best bot? | Toxic-MD | Other bots\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

        const parts = input.split('|').map(s => s.trim()).filter(Boolean);
        if (parts.length < 3) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ Need at least a question + 2 options.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const question = parts[0];
        const options = parts.slice(1).slice(0, 12);

        try {
            await client.sendMessage(m.chat, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: 1
                }
            }, { quoted: fq });
        } catch {
            const nums = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','⓫','⓬'];
            const optText = options.map((o,i) => `├ ${nums[i]||'•'} ${o}`).join('\n');
            await client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├───≫ POLL ≪───\n├ ❓ ${question}\n${optText}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        }
    }
};
