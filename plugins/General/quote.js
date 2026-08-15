import axios from 'axios';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'quote',
    aliases: ['inspire', 'motivation', 'qotd'],
    description: 'Get a random motivational quote',
    run: async (context) => {
        const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            const res = await axios.get('https://zenquotes.io/api/random', { timeout: 8000 });
            const q = res.data?.[0];
            if (!q) throw new Error('empty');
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            return sendInteractive(client, m, `╭─❏ 「 Qᴜᴏᴛᴇ」
│
│ ❝ ${q.q} ❞\n│
│ — ${q.a}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 Qᴜᴏᴛᴇ」
│
│ No quotes today. Universe is offline.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
